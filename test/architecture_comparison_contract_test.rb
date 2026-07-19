# frozen_string_literal: true

require "minitest/autorun"

require_relative "../lib/architecture_comparison_contract"
require_relative "../lib/strict_yaml"

class ArchitectureComparisonContractTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @comparison = load_yaml("comparisons/genie3-reduced-vs-full-ipa.yaml")
    @source_sets = source_set_context("genie3")
    @bibliography = load_yaml("references/bibliography.yaml").fetch("sources")
  end

  def test_current_registry_and_reduced_ipa_comparison_validate
    assert_empty ArchitectureComparisonContract.registry_errors(
      load_yaml("comparisons/index.yaml"),
      comparisons_by_path: {
        "comparisons/genie3-reduced-vs-full-ipa.yaml" => @comparison,
      },
    )
    assert_empty ArchitectureComparisonContract.errors(
      @comparison,
      source_sets: @source_sets,
      bibliography_sources: @bibliography,
    )
  end

  def test_relationship_controls_which_sides_may_have_facts
    comparison = deep_copy(@comparison)
    full_only = alignment(comparison, "frame_aware_point_path")
    full_only["primary_refs"] << "block_instances.latent_reduced_pair_attention.steps.project_qkv"

    diagnostics = errors(comparison)
    assert_code diagnostics, "invalid_comparison_sides"
  end

  def test_groups_findings_subjects_and_boards_must_resolve
    comparison = deep_copy(@comparison)
    alignment(comparison, "pair_bias")["group_ref"] = "groups.not_present"
    comparison.fetch("findings").first.fetch("alignment_refs") << "alignments.not_present"
    comparison.dig("subjects", "counterpart")["board_ref"] = "not_a_board"

    diagnostics = errors(comparison)
    assert_code diagnostics, "unknown_comparison_group"
    assert_code diagnostics, "unknown_comparison_alignment"
    assert_code diagnostics, "unknown_comparison_board"
  end

  def test_instance_facts_must_be_active_and_scoped_to_the_selected_subject
    comparison = deep_copy(@comparison)
    alignment(comparison, "pair_bias")["primary_refs"] = [
      "block_instances.structure_ipa.steps.project_pair_bias",
      "block_instances.latent_reduced_pair_attention.steps.project_attention_output",
    ]

    diagnostics = errors(comparison)
    assert_code diagnostics, "comparison_fact_outside_subject"
    assert_code diagnostics, "unknown_comparison_fact"
  end

  def test_confirmed_comparison_claims_require_compatible_located_evidence
    comparison = deep_copy(@comparison)
    evidence = alignment(comparison, "pair_bias").fetch("evidence")
    evidence.fetch("refs").each { |ref| ref.delete("locator") }

    diagnostics = errors(comparison)
    assert_code diagnostics, "invalid_comparison_evidence"
  end

  def test_registry_rejects_missing_sources_and_duplicate_comparison_ids
    registry = {
      "schema_version" => "comparison-registry-v0.1",
      "sources" => ["comparisons/one.yaml", "comparisons/two.yaml"],
    }
    comparisons = {
      "comparisons/one.yaml" => @comparison,
      "comparisons/two.yaml" => deep_copy(@comparison),
    }
    diagnostics = ArchitectureComparisonContract.registry_errors(registry, comparisons_by_path: comparisons)
    assert_code diagnostics, "duplicate_comparison_id"

    comparisons.delete("comparisons/two.yaml")
    diagnostics = ArchitectureComparisonContract.registry_errors(registry, comparisons_by_path: comparisons)
    assert_code diagnostics, "missing_comparison_source"
  end

  private

  def source_set_context(*ids)
    registry = load_yaml("architectures/index.yaml")
    registry.fetch("source_sets").select { |entry| ids.include?(entry.fetch("id")) }.to_h do |entry|
      paths = Array(entry["standard_blocks"])
      [
        entry.fetch("id"),
        {
          "architecture" => load_yaml(entry.fetch("architecture")),
          "view" => load_yaml(entry.fetch("view")),
          "blocks_by_path" => paths.to_h { |path| [path, load_yaml(path)] },
          "registered_blocks" => paths,
        },
      ]
    end
  end

  def errors(comparison)
    ArchitectureComparisonContract.errors(
      comparison,
      source_sets: @source_sets,
      bibliography_sources: @bibliography,
    )
  end

  def alignment(comparison, id)
    comparison.fetch("alignments").find { |item| item.fetch("id") == id }
  end

  def load_yaml(path)
    StrictYaml.load_file(File.join(ROOT, path))
  end

  def deep_copy(value)
    Marshal.load(Marshal.dump(value))
  end

  def assert_code(diagnostics, code)
    assert diagnostics.any? { |item| item.code == code },
      "expected #{code}, got:\n#{diagnostics.join("\n")}"
  end
end
