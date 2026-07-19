# frozen_string_literal: true

require "digest"
require "fileutils"
require "minitest/autorun"
require "tmpdir"
require_relative "../lib/architecture_edit"
require_relative "../lib/architecture_verifier"

class ArchitectureEditApplyTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  STAGED_DIRECTORIES = ArchitectureEdit::STAGED_SOURCE_DIRECTORIES

  def setup
    @temporary_root = Dir.mktmpdir("architecture-edit-apply-test-")
    STAGED_DIRECTORIES.each do |directory|
      FileUtils.cp_r(File.join(ROOT, directory), @temporary_root)
    end
    FileUtils.mkdir_p(File.join(@temporary_root, "renderer"))
    FileUtils.cp_r(File.join(ROOT, "renderer", "architecture"), File.join(@temporary_root, "renderer"))
    @compiler = ArchitectureEdit::Compiler.new(root: @temporary_root)
  end

  def teardown
    FileUtils.remove_entry(@temporary_root) if @temporary_root && File.exist?(@temporary_root)
  end

  def test_prepare_and_apply_validate_generate_and_reject_reuse_of_a_stale_plan
    prepared = @compiler.prepare_plan(draft_plan)
    assert_match(/\A[a-f0-9]{64}\z/, prepared.dig("target", "architecture_sha256"))
    assert_match(/\A[a-f0-9]{64}\z/, prepared.dig("target", "view_sha256"))

    result = @compiler.apply(prepared)

    assert_equal "applied", result.status
    assert_includes result.files, "architectures/generic-feature-refinement.yaml"
    assert_includes result.files, "renderer/architecture/manifest-generic.js"
    source = File.read(File.join(@temporary_root, "architectures/generic-feature-refinement.yaml"))
    assert_includes source, "label: Request Input Adapter"
    manifest = File.read(File.join(@temporary_root, "renderer/architecture/manifest-generic.js"))
    assert_includes manifest, '"label": "Request Input Adapter"'

    error = assert_raises(ArchitectureEdit::Error) { @compiler.apply(prepared) }
    assert_equal "stale_edit_plan", error.code
  end

  def test_single_pass_preview_can_commit_only_its_exact_validated_result_once
    prepared, preview = @compiler.prepare_and_preview(draft_plan)
    assert_match(/\A[a-f0-9]{64}\z/, prepared.dig("target", "architecture_sha256"))
    assert preview.manifest_built?

    substituted = Marshal.load(Marshal.dump(prepared))
    substituted.fetch("operations").first.fetch("set")["label"] = "Substituted Label"
    mismatch = assert_raises(ArchitectureEdit::Error) do
      @compiler.apply_validated(substituted, preview)
    end
    assert_equal "validated_plan_mismatch", mismatch.code

    result = @compiler.apply_validated(prepared, preview)

    assert_same preview, result
    assert_equal "applied", result.status
    source = File.read(File.join(@temporary_root, "architectures/generic-feature-refinement.yaml"))
    assert_includes source, "label: Request Input Adapter"
    manifest = File.read(File.join(@temporary_root, "renderer/architecture/manifest-generic.js"))
    assert_includes manifest, '"label": "Request Input Adapter"'

    consumed = assert_raises(ArchitectureEdit::Error) do
      @compiler.apply_validated(prepared, preview)
    end
    assert_equal "invalid_validated_result", consumed.code
  end

  def test_layout_plan_applies_locally_updates_the_manifest_and_passes_persisted_verification
    architecture_path = File.join(@temporary_root, "architectures/generic-feature-refinement.yaml")
    view_path = File.join(@temporary_root, "views/generic-semantic-zoom.view.yaml")
    architecture_before = File.binread(architecture_path)
    view_before = StrictYaml.load_file(view_path)
    original_board = view_before.fetch("boards").find { |board| board["id"] == "refinement_pipeline" }

    prepared = @compiler.prepare_plan(layout_plan)
    result = @compiler.apply(prepared)

    assert_equal "applied", result.status
    assert_includes result.files, "views/generic-semantic-zoom.view.yaml"
    assert_includes result.files, "renderer/architecture/manifest-generic.js"
    assert_equal architecture_before, File.binread(architecture_path)

    persisted_view = StrictYaml.load_file(view_path)
    persisted_board = persisted_view.fetch("boards").find { |board| board["id"] == "refinement_pipeline" }
    refute_equal original_board.fetch("grid"), persisted_board.fetch("grid")
    assert_equal original_board.fetch("nodes").map { |node| node["id"] },
      persisted_board.fetch("nodes").map { |node| node["id"] }

    report = ArchitectureVerifier::Verifier.new(root: @temporary_root).verify(
      source_set_id: "generic",
      include_manifest: true,
    )
    assert_equal "passed", report.status, report.to_text

    stale = assert_raises(ArchitectureEdit::Error) { @compiler.apply(prepared) }
    assert_equal "stale_edit_plan", stale.code
  end

  def test_validated_result_rechecks_source_digests_before_fast_apply
    prepared, preview = @compiler.prepare_and_preview(draft_plan)
    architecture_path = File.join(@temporary_root, "architectures/generic-feature-refinement.yaml")
    File.open(architecture_path, "a") { |file| file.write("\n# concurrent author edit\n") }

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.apply_validated(prepared, preview)
    end

    assert_equal "concurrent_file_change", error.code
    source = File.read(architecture_path)
    refute_includes source, "label: Request Input Adapter"
    assert_includes source, "# concurrent author edit"
  end

  def test_atomic_writer_restores_every_replaced_file_when_a_later_rename_fails
    first = "architectures/rollback-first.txt"
    second = "views/rollback-second.txt"
    File.write(File.join(@temporary_root, first), "first-before\n")
    File.write(File.join(@temporary_root, second), "second-before\n")
    expected = {
      first => Digest::SHA256.hexdigest("first-before\n"),
      second => Digest::SHA256.hexdigest("second-before\n"),
    }
    contents = {
      first => "first-after\n",
      second => "second-after\n",
    }
    writer_class = Class.new(ArchitectureEdit::AtomicWriter) do
      private

      def rename_file(source, destination)
        @rename_count = (@rename_count || 0) + 1
        raise IOError, "injected second-rename failure" if @rename_count == 2

        super
      end
    end

    error = assert_raises(ArchitectureEdit::Error) do
      writer_class.new(@temporary_root).commit!(contents, expected)
    end

    assert_equal "write_failed", error.code
    assert_equal "first-before\n", File.read(File.join(@temporary_root, first))
    assert_equal "second-before\n", File.read(File.join(@temporary_root, second))
  end

  private

  def draft_plan
    {
      "schema_version" => "architecture-edit-v0.1",
      "id" => "request_input_adapter_label",
      "target" => { "source_set" => "generic" },
      "intent" => "Exercise validated transactional application.",
      "operations" => [
        {
          "op" => "update_entity",
          "ref" => "modules.input_adapter",
          "expect" => { "label" => "Input Adapter" },
          "set" => { "label" => "Request Input Adapter" },
        },
      ],
    }
  end

  def layout_plan
    {
      "schema_version" => "architecture-edit-v0.2",
      "id" => "layout_refinement_pipeline",
      "target" => { "source_set" => "generic" },
      "intent" => "Exercise validated semantic board reflow.",
      "operations" => [
        {
          "op" => "layout_board",
          "board_id" => "refinement_pipeline",
          "policy" => "semantic_flow_v1",
        },
      ],
    }
  end
end
