# frozen_string_literal: true

require "fileutils"
require "minitest/autorun"
require "tmpdir"
require "yaml"
require_relative "../lib/architecture_verifier"
require_relative "../lib/strict_yaml"

class ArchitectureVerifierTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  STAGED_DIRECTORIES = %w[
    architectures
    assets
    comparisons
    views
    references
    schemas
    pseudocode
    standard_blocks
  ].freeze

  def setup
    @temporary_root = Dir.mktmpdir("architecture-verifier-test-")
    STAGED_DIRECTORIES.each do |directory|
      FileUtils.cp_r(File.join(ROOT, directory), @temporary_root)
    end
    @verifier = ArchitectureVerifier::Verifier.new(root: @temporary_root)
  end

  def teardown
    FileUtils.remove_entry(@temporary_root) if @temporary_root && File.exist?(@temporary_root)
  end

  def test_every_registered_source_set_passes_and_result_is_serializable
    source_set_ids.each do |source_set_id|
      result = @verifier.verify(source_set_id: source_set_id)

      assert_equal "passed", result.status, result.to_text
      assert_equal expected_check_ids, result.checks.map { |check| check.fetch("id") }
      assert_equal result.checks.length, result.summary.fetch("check_count")
      assert_equal result.checks.length, result.summary.fetch("passed_count")
      assert_equal 0, result.summary.fetch("failed_count")
      assert_equal 0, result.summary.fetch("skipped_count")
      assert_equal 0, result.summary.fetch("error_count")

      report = result.to_h
      assert_equal "architecture-verification-v0.1", report.fetch("schema_version")
      assert_equal "passed", report.fetch("status")
      assert_equal source_set_id, report.fetch("source_set")
      assert_nil report.fetch("board")
      assert_equal result.checks, report.fetch("checks")
      assert_equal result.summary, report.fetch("summary")
      assert_includes result.to_text, source_set_id
      assert_includes result.to_text, "passed"
    end
  end

  def test_board_filter_limits_board_checks_to_the_requested_board
    mutate_view("genie3") do |view|
      root = board(view, view.fetch("root_board"))
      first, second = root.fetch("nodes").first(2)
      second["col"] = first.fetch("col")
      second["row"] = first.fetch("row")
    end

    result = @verifier.verify(
      source_set_id: "genie3",
      board_id: "reverse_diffusion_step"
    )

    assert_equal "passed", result.status, result.to_text
    assert_equal "reverse_diffusion_step", result.to_h.fetch("board")
    assert_empty diagnostic_codes(result)
    %w[board_layout projection].each do |check_id|
      check = result.checks.find { |candidate| candidate.fetch("id") == check_id }
      refute_nil check
      assert_equal ["reverse_diffusion_step"], check.fetch("boards")
    end
  end

  def test_duplicate_grid_cell_fails_with_both_node_ids
    overlapping_ids = nil
    mutate_view("genie3") do |view|
      target = board(view, "reverse_diffusion_step")
      first, second = target.fetch("nodes").first(2)
      second["col"] = first.fetch("col")
      second["row"] = first.fetch("row")
      overlapping_ids = [first.fetch("id"), second.fetch("id")]
    end

    result = @verifier.verify(
      source_set_id: "genie3",
      board_id: "reverse_diffusion_step"
    )

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "duplicate_grid_cell")
    assert_equal "board_layout", diagnostic.fetch("check")
    assert_equal "reverse_diffusion_step", diagnostic.fetch("board")
    overlapping_ids.each { |node_id| assert_includes diagnostic.fetch("message"), node_id }
    assert_equal 1, result.summary.fetch("failed_count")
    assert_operator result.summary.fetch("error_count"), :>=, 1
  end

  def test_repeat_region_references_are_checked_against_architecture_and_board
    mutate_view("generic") do |view|
      target = board(view, "refinement_pipeline")
      target["regions"] = [{
        "id" => "unknown_iteration",
        "kind" => "repeat",
        "execution_ref" => "execution.loops.not_registered",
        "label" => "one refinement iteration",
        "node_ids" => %w[input_adapter item_encoder group_refiner output_decoder],
      }]
    end

    result = @verifier.verify(
      source_set_id: "generic",
      board_id: "refinement_pipeline"
    )

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "unknown_region_execution_loop")
    assert_equal "projection", diagnostic.fetch("check")
    assert_equal "refinement_pipeline", diagnostic.fetch("board")
    assert_equal "regions.unknown_iteration", diagnostic.fetch("entity_ref")
  end

  def test_representation_lane_alignment_is_checked_against_value_sites
    mutate_view("generic") do |view|
      target = board(view, "item_encoder")
      target["lanes"] = [{
        "id" => "item_stream",
        "label" => "item representation",
        "kind" => "representation",
        "row" => 3,
        "representation_refs" => ["representations.item_state"],
        "glyph" => "single",
      }]
    end

    result = @verifier.verify(
      source_set_id: "generic",
      board_id: "item_encoder"
    )

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "representation_occurrence_off_lane")
    assert_equal "projection", diagnostic.fetch("check")
    assert_equal "item_encoder", diagnostic.fetch("board")
    assert_equal "lanes.item_stream", diagnostic.fetch("entity_ref")
    assert_includes diagnostic.fetch("message"), "value-site occurrence item_state_in"
  end

  def test_drilldown_subject_mismatch_fails_navigation_check
    mutate_view("genie3") do |view|
      board(view, "reverse_diffusion_step")["subject_ref"] = "modules.denoiser"
    end

    result = @verifier.verify(source_set_id: "genie3")

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "board_subject_mismatch")
    assert_equal "view_navigation", diagnostic.fetch("check")
    assert_equal "sampling_loop", diagnostic.fetch("board")
    assert_includes diagnostic.fetch("message"), "reverse_diffusion_step"
    assert_includes diagnostic.fetch("message"), "modules.reverse_diffusion_step"
    assert_includes diagnostic.fetch("message"), "modules.denoiser"
  end

  def test_root_board_missing_a_task_boundary_fails_projection
    mutate_view("genie3") do |view|
      root = board(view, view.fetch("root_board"))
      root.fetch("nodes").reject! { |node| node.fetch("ref") == "value_sites.design_request" }
    end

    result = @verifier.verify(source_set_id: "genie3")

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "missing_root_boundary")
    assert_equal "projection", diagnostic.fetch("check")
    assert_equal "design_overview", diagnostic.fetch("board")
    assert_includes diagnostic.fetch("message"), "value_sites.design_request"
  end

  def test_unknown_selected_board_returns_a_failed_result
    result = @verifier.verify(
      source_set_id: "genie3",
      board_id: "not_a_real_board"
    )

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "unknown_board")
    assert_equal "view_navigation", diagnostic.fetch("check")
    assert_equal "not_a_real_board", diagnostic.fetch("board")
    assert_includes result.to_text, "not_a_real_board"
  end

  def test_invalid_registry_path_fails_cleanly_and_skips_dependent_checks
    mutate_registry do |registry|
      source_set = registry.fetch("source_sets").find { |candidate| candidate.fetch("id") == "genie3" }
      source_set["view"] = "../outside-the-repository.yaml"
    end

    result = @verifier.verify(source_set_id: "genie3")

    assert_equal "failed", result.status
    assert_equal "unsafe_registry_path", diagnostic(result, "unsafe_registry_path").fetch("code")
    assert_equal "failed", result.checks.first.fetch("status")
    assert result.checks.drop(1).all? { |check| check.fetch("status") == "skipped" }
  end

  def test_invalid_source_contract_fails_cleanly_and_skips_semantic_checks
    mutate_view("genie3") { |view| view.delete("root_board") }

    result = @verifier.verify(source_set_id: "genie3")

    assert_equal "failed", result.status
    assert_equal "failed", result.checks.find { |check| check.fetch("id") == "source_contract" }.fetch("status")
    assert result.checks.drop(3).all? { |check| check.fetch("status") == "skipped" }
  end

  def test_standard_block_reference_must_belong_to_the_source_set_bundle
    mutate_registry do |registry|
      source_set = registry.fetch("source_sets").find { |candidate| candidate.fetch("id") == "dit" }
      source_set.fetch("standard_blocks").delete("standard_blocks/adaln-zero-conditioning.yaml")
    end

    result = @verifier.verify(source_set_id: "dit")

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "unregistered_standard_block")
    assert_equal "source_semantics", diagnostic.fetch("check")
    assert_includes diagnostic.fetch("message"), "adaln-zero-conditioning.yaml"
    assert_includes diagnostic.fetch("message"), "source set dit"
  end

  def test_reusable_block_instance_bindings_are_verified_semantically
    mutate_architecture("genie2") do |architecture|
      instance = architecture.fetch("block_instances").first
      instance.fetch("port_bindings").reject! do |binding|
        binding.fetch("port_ref") == "ports.frames"
      end
    end

    result = @verifier.verify(source_set_id: "genie2")

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "missing_required_port")
    assert_equal "source_semantics", diagnostic.fetch("check")
    assert_includes diagnostic.fetch("message"), "ports.frames"
  end

  def test_reusable_detail_board_is_verified_without_entering_architecture_projection
    result = @verifier.verify(
      source_set_id: "genie3",
      board_id: "genie3_ipa_internals",
    )

    assert_equal "passed", result.status, result.to_text
    %w[board_layout projection].each do |check_id|
      check = result.checks.find { |candidate| candidate.fetch("id") == check_id }
      assert_equal [], check.fetch("boards")
    end
  end

  def test_comparison_facts_are_resolved_against_the_compiled_subject_boards
    mutate_comparison("genie3_reduced_vs_full_ipa") do |comparison|
      pair_bias = comparison.fetch("alignments").find { |item| item.fetch("id") == "pair_bias" }
      pair_bias["primary_refs"] = [
        "block_instances.latent_reduced_pair_attention.steps.project_attention_output",
      ]
    end

    result = @verifier.verify(source_set_id: "genie3")

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "unknown_comparison_fact")
    assert_equal "comparisons", diagnostic.fetch("check")
    assert_equal "comparisons/genie3-reduced-vs-full-ipa.yaml", diagnostic.fetch("file")
    check = result.checks.find { |candidate| candidate.fetch("id") == "comparisons" }
    assert_equal({ "registered_count" => 1, "relevant_count" => 1 }, check.fetch("metrics"))

    unrelated = @verifier.verify(source_set_id: "generic")
    assert_equal "passed", unrelated.status, unrelated.to_text
    unrelated_check = unrelated.checks.find { |candidate| candidate.fetch("id") == "comparisons" }
    assert_equal({ "registered_count" => 1, "relevant_count" => 0 }, unrelated_check.fetch("metrics"))
  end

  def test_comparison_schema_errors_are_reported_for_every_source_set
    mutate_comparison("genie3_reduced_vs_full_ipa") { |comparison| comparison.delete("summary") }

    result = @verifier.verify(source_set_id: "generic")

    assert_equal "failed", result.status
    diagnostic = diagnostic(result, "schema_required")
    assert_equal "comparisons", diagnostic.fetch("check")
    assert_equal "comparisons/genie3-reduced-vs-full-ipa.yaml", diagnostic.fetch("file")
    assert_equal "$.summary", diagnostic.fetch("path")
  end

  private

  def expected_check_ids
    %w[
      registry
      strict_yaml
      source_contract
      source_semantics
      comparisons
      ownership
      coverage
      view_navigation
      board_layout
      projection
    ]
  end

  def source_set_ids
    registry = StrictYaml.load_file(File.join(@temporary_root, "architectures/index.yaml"))
    registry.fetch("source_sets").map { |source_set| source_set.fetch("id") }
  end

  def mutate_view(source_set_id)
    source_set = StrictYaml.load_file(File.join(@temporary_root, "architectures/index.yaml"))
                           .fetch("source_sets")
                           .find { |candidate| candidate.fetch("id") == source_set_id }
    path = File.join(@temporary_root, source_set.fetch("view"))
    view = StrictYaml.load_file(path)
    yield view
    File.write(path, YAML.dump(view))
  end

  def mutate_registry
    path = File.join(@temporary_root, "architectures/index.yaml")
    registry = StrictYaml.load_file(path)
    yield registry
    File.write(path, YAML.dump(registry))
  end

  def mutate_architecture(source_set_id)
    registry = StrictYaml.load_file(File.join(@temporary_root, "architectures/index.yaml"))
    source_set = registry.fetch("source_sets").find { |candidate| candidate.fetch("id") == source_set_id }
    path = File.join(@temporary_root, source_set.fetch("architecture"))
    architecture = StrictYaml.load_file(path)
    yield architecture
    File.write(path, YAML.dump(architecture))
  end

  def mutate_comparison(comparison_id)
    registry = StrictYaml.load_file(File.join(@temporary_root, "architectures/index.yaml"))
    comparison_registry = StrictYaml.load_file(File.join(@temporary_root, registry.fetch("comparisons")))
    path = comparison_registry.fetch("sources").find do |candidate|
      StrictYaml.load_file(File.join(@temporary_root, candidate))["id"] == comparison_id
    end
    refute_nil path, "fixture is missing comparison #{comparison_id}"
    absolute = File.join(@temporary_root, path)
    comparison = StrictYaml.load_file(absolute)
    yield comparison
    File.write(absolute, YAML.dump(comparison))
  end

  def board(view, board_id)
    view.fetch("boards").find { |candidate| candidate.fetch("id") == board_id }.tap do |found|
      refute_nil found, "fixture is missing board #{board_id}"
    end
  end

  def diagnostic_codes(result)
    result.checks.flat_map do |check|
      Array(check["diagnostics"]).map { |item| item.fetch("code") }
    end
  end

  def diagnostic(result, code)
    found = result.checks.flat_map { |check| Array(check["diagnostics"]) }
                  .find { |item| item["code"] == code }
    refute_nil found, "missing diagnostic #{code.inspect}:\n#{result.to_text}"
    found
  end
end
