# frozen_string_literal: true

require "digest"
require "fileutils"
require "minitest/autorun"
require "psych"
require "tmpdir"
require_relative "../lib/architecture_edit"

class ArchitectureEditTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  ARCHITECTURE_PATH = "architectures/generic-feature-refinement.yaml"
  VIEW_PATH = "views/generic-semantic-zoom.view.yaml"
  ORIGINAL_ROLE = "embed raw records and build initial item state, conditioning signal, masks, and grouping indices"

  def setup
    @temporary_root = Dir.mktmpdir("architecture-edit-test-")
    FileUtils.mkdir_p(File.join(@temporary_root, "architectures"))
    FileUtils.mkdir_p(File.join(@temporary_root, "views"))
    copy("architectures/index.yaml")
    copy(ARCHITECTURE_PATH)
    copy(VIEW_PATH)

    architecture_path = File.join(@temporary_root, ARCHITECTURE_PATH)
    source = File.binread(architecture_path)
    source = source.sub(
      "modules:\n",
      "# This hand-authored comment must survive an edit preview.\nmodules:\n",
    )
    File.binwrite(architecture_path, source)

    @compiler = ArchitectureEdit::Compiler.new(root: @temporary_root)
  end

  def teardown
    FileUtils.remove_entry(@temporary_root) if @temporary_root && File.exist?(@temporary_root)
  end

  def test_update_preview_is_source_preserving_pure_and_reports_a_semantic_diff
    replacement_role = "embed request records into the initial item and conditioning states"
    plan = edit_plan(
      {
        "op" => "update_entity",
        "ref" => "modules.input_adapter",
        "expect" => { "role" => ORIGINAL_ROLE },
        "set" => { "role" => replacement_role },
      },
    )
    architecture_path = File.join(@temporary_root, ARCHITECTURE_PATH)
    before = File.binread(architecture_path)

    result = @compiler.compile(plan, build_manifests: false)

    assert_equal before, File.binread(architecture_path), "preview changed the canonical source"
    expected_source = before.sub(
      "    role: #{ORIGINAL_ROLE}\n",
      "    role: #{replacement_role}\n",
    )
    assert_equal expected_source, result.source_contents.fetch(ARCHITECTURE_PATH)
    assert_includes expected_source, "# This hand-authored comment must survive an edit preview.\n"
    assert_equal [ARCHITECTURE_PATH], result.files
    assert_equal "validated", result.status

    change = result.changes.fetch(0)
    assert_equal 0, change.fetch("operation_index")
    assert_equal "update", change.fetch("action")
    assert_equal "modules.input_adapter", change.fetch("entity_ref")
    assert_equal "role", change.fetch("field")
    assert_equal ORIGINAL_ROLE, change.fetch("before")
    assert_equal replacement_role, change.fetch("after")
    assert_includes result.to_text, "~ modules.input_adapter.role:"

    reparsed = Psych.safe_load(
      result.source_contents.fetch(ARCHITECTURE_PATH),
      aliases: true,
      filename: ARCHITECTURE_PATH,
    )
    adapter = reparsed.fetch("modules").find { |mod| mod.fetch("id") == "input_adapter" }
    assert_equal replacement_role, adapter.fetch("role")
  end

  def test_add_operation_produces_a_valid_candidate_and_add_semantic_diff
    architecture = load_architecture
    added_module = deep_copy(architecture.fetch("modules").first)
    added_module["id"] = "explanation_probe"
    added_module["label"] = "Explanation Probe"
    added_module["role"] = "expose a bounded authoring example without changing canonical flow"
    plan = edit_plan({ "op" => "add_module", "module" => added_module })
    architecture_path = File.join(@temporary_root, ARCHITECTURE_PATH)
    before = File.binread(architecture_path)

    result = @compiler.compile(plan, build_manifests: false)

    assert_equal before, File.binread(architecture_path), "candidate compilation wrote the source"
    candidate = Psych.safe_load(
      result.source_contents.fetch(ARCHITECTURE_PATH),
      aliases: true,
      filename: ARCHITECTURE_PATH,
    )
    assert candidate.fetch("modules").any? { |mod| mod["id"] == "explanation_probe" }

    change = result.changes.fetch(0)
    assert_equal 0, change.fetch("operation_index")
    assert_equal "add", change.fetch("action")
    assert_equal "modules.explanation_probe", change.fetch("entity_ref")
    assert_nil change.fetch("before")
    assert_equal added_module, change.fetch("after")
    assert_includes result.to_text,
      "+ modules.explanation_probe (kind=adapter, parent_ref=architecture)"
    assert_equal result.changes, result.to_h.fetch("changes")
  end

  def test_add_operation_fails_when_the_complete_candidate_has_a_dangling_reference
    value_site = deep_copy(load_architecture.fetch("value_sites").first)
    value_site["id"] = "orphan_value"
    value_site["representation_ref"] = "representations.missing_representation"
    plan = edit_plan({ "op" => "add_value_site", "value_site" => value_site })
    before = File.binread(File.join(@temporary_root, ARCHITECTURE_PATH))

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "invalid_value_site", error.code
    assert_includes error.message, "value_sites.orphan_value has missing representation"
    assert_equal before, File.binread(File.join(@temporary_root, ARCHITECTURE_PATH))
  end

  def test_rejects_a_stale_source_digest_before_compiling_operations
    plan = edit_plan(
      {
        "op" => "update_entity",
        "ref" => "modules.input_adapter",
        "set" => { "role" => "a role that must never be applied" },
      },
    )
    plan.fetch("target")["architecture_sha256"] = "0" * 64
    plan.fetch("target")["view_sha256"] = digest(VIEW_PATH)
    before = File.binread(File.join(@temporary_root, ARCHITECTURE_PATH))

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, require_digests: true, build_manifests: false)
    end

    assert_equal "stale_edit_plan", error.code
    assert_includes error.message, "target.architecture_sha256 is stale"
    assert_equal before, File.binread(File.join(@temporary_root, ARCHITECTURE_PATH))
  end

  def test_rejects_a_failed_update_precondition_without_mutating_the_source
    plan = edit_plan(
      {
        "op" => "update_entity",
        "ref" => "modules.input_adapter",
        "expect" => { "label" => "A label that is not present" },
        "set" => { "role" => "a role that must never be applied" },
      },
    )
    before = File.binread(File.join(@temporary_root, ARCHITECTURE_PATH))

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "precondition_failed", error.code
    assert_includes error.message,
      'modules.input_adapter.label expected "A label that is not present", found "Input Adapter"'
    assert_equal before, File.binread(File.join(@temporary_root, ARCHITECTURE_PATH))
  end

  private

  def copy(relative)
    source = File.join(ROOT, relative)
    destination = File.join(@temporary_root, relative)
    FileUtils.mkdir_p(File.dirname(destination))
    FileUtils.cp(source, destination)
  end

  def edit_plan(*operations)
    {
      "schema_version" => "architecture-edit-v0.1",
      "id" => "test_edit",
      "target" => { "source_set" => "generic" },
      "intent" => "Exercise the architecture edit compiler.",
      "operations" => operations,
    }
  end

  def load_architecture
    Psych.safe_load(
      File.binread(File.join(@temporary_root, ARCHITECTURE_PATH)),
      aliases: true,
      filename: ARCHITECTURE_PATH,
    )
  end

  def digest(relative)
    Digest::SHA256.file(File.join(@temporary_root, relative)).hexdigest
  end

  def deep_copy(value)
    Marshal.load(Marshal.dump(value))
  end
end
