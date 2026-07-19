# frozen_string_literal: true

require "minitest/autorun"

require_relative "../lib/architecture_comparison_compiler"
require_relative "../lib/strict_yaml"

class ArchitectureComparisonCompilerTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    registry = load_yaml("architectures/index.yaml")
    entry = registry.fetch("source_sets").find { |item| item.fetch("id") == "genie3" }
    block_paths = entry.fetch("standard_blocks")
    @source_sets = {
      "genie3" => {
        "architecture" => load_yaml(entry.fetch("architecture")),
        "view" => load_yaml(entry.fetch("view")),
        "blocks_by_path" => block_paths.to_h { |path| [path, load_yaml(path)] },
        "registered_blocks" => block_paths,
      },
    }
    @bibliography = load_yaml(registry.fetch("bibliography")).fetch("sources")
    @comparison = load_yaml("comparisons/genie3-reduced-vs-full-ipa.yaml")
    @compiler = ArchitectureComparisonCompiler::Compiler.new(
      source_sets: @source_sets,
      bibliography_sources: @bibliography,
    )
  end

  def test_compilation_is_deterministic_and_keeps_boards_as_references
    first = @compiler.compile(@comparison)
    second = @compiler.compile(@comparison)

    assert_equal first, second
    assert_equal "architecture-comparison-v0.1", first.fetch("schemaVersion")
    assert_equal "architecture-comparison-compiler-v0.1", first.fetch("compilerVersion")
    assert_equal "genie3_reduced_pair_attention_internals", first.dig("subjects", "primary", "boardRef")
    assert_equal "genie3_ipa_internals", first.dig("subjects", "counterpart", "boardRef")
    refute first.dig("subjects", "primary").key?("nodes")
    refute first.dig("subjects", "counterpart").key?("nodes")
  end

  def test_compiled_facts_resolve_to_highlightable_nodes_on_each_board
    compiled = @compiler.compile(@comparison)
    pair_bias = compiled.fetch("alignments").find { |item| item.fetch("id") == "pair_bias" }
    primary = pair_bias.fetch("primaryFacts").first
    counterpart = pair_bias.fetch("counterpartFacts").first

    assert_equal "block_instances.latent_reduced_pair_attention.steps.project_pair_bias",
      primary.fetch("factRef")
    assert_equal "standard_blocks.pair_biased_attention.steps.project_pair_bias",
      primary.fetch("templateFactRef")
    assert_equal ["project_pair_bias"], primary.fetch("nodeIds")
    assert_equal "standard_blocks.invariant_point_attention.steps.project_pair_bias",
      counterpart.fetch("templateFactRef")
    assert_equal ["project_pair_bias"], counterpart.fetch("nodeIds")
  end

  def test_groups_derive_alignment_membership_and_subjects_expose_variant_truth
    compiled = @compiler.compile(@comparison)
    shared = compiled.fetch("groups").find { |group| group.fetch("id") == "shared" }
    full_only = compiled.fetch("groups").find { |group| group.fetch("id") == "full_only" }

    assert_includes shared.fetch("alignmentRefs"), "alignments.pair_bias"
    assert_equal ["alignments.frame_aware_point_path"], full_only.fetch("alignmentRefs")
    assert_equal "pair_values_residual_norm_transition", compiled.dig("subjects", "primary", "variant")
    assert_equal "reduced", compiled.dig("subjects", "primary", "conformance")
    assert_equal "full_ipa_residual_norm", compiled.dig("subjects", "counterpart", "variant")
    assert_equal "exact", compiled.dig("subjects", "counterpart", "conformance")
  end

  def test_registry_compiles_in_registered_source_order
    registry = load_yaml("comparisons/index.yaml")
    compiled = @compiler.compile_registry(
      registry,
      comparisons_by_path: {
        "comparisons/genie3-reduced-vs-full-ipa.yaml" => @comparison,
      },
    )

    assert_equal ["genie3_reduced_vs_full_ipa"], compiled.map { |item| item.fetch("id") }
  end

  private

  def load_yaml(path)
    StrictYaml.load_file(File.join(ROOT, path))
  end
end
