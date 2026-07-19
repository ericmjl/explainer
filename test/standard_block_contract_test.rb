# frozen_string_literal: true

require "minitest/autorun"

require_relative "../lib/standard_block_contract"
require_relative "../lib/strict_yaml"

class StandardBlockContractTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @block_path = "standard_blocks/pair-biased-attention.yaml"
    @block = load_yaml(@block_path)
    @architecture = load_yaml("architectures/generic-feature-refinement.yaml")
    @blocks = { @block_path => @block }
  end

  def test_current_v02_definitions_and_instances_validate
    %w[
      standard_blocks/pair-biased-attention.yaml
      standard_blocks/invariant-point-attention.yaml
    ].each do |path|
      assert_empty StandardBlockContract.definition_errors(load_yaml(path)), path
    end

    assert_empty StandardBlockContract.instance_errors(
      @architecture,
      blocks_by_path: @blocks,
      registered_blocks: [@block_path],
    )
  end

  def test_definition_rejects_dangling_steps_variants_and_visual_refs
    block = deep_copy(@block)
    block.fetch("steps").first.fetch("inputs") << "values.not_declared"
    block.fetch("variants").first.fetch("step_refs") << "steps.not_declared"
    block.fetch("visual_template").fetch("nodes").first["ref"] = "values.not_declared"

    diagnostics = StandardBlockContract.definition_errors(block)
    assert_code diagnostics, "invalid_step_input"
    assert_code diagnostics, "unknown_variant_step"
    assert_code diagnostics, "unknown_visual_ref"
    assert_code diagnostics, "missing_visual_ref"
  end

  def test_instance_requires_registered_v02_block_known_variant_and_subject
    architecture = deep_copy(@architecture)
    instance = architecture.fetch("block_instances").first
    instance["variant"] = "not_a_variant"
    instance["subject_ref"] = "modules.not_a_module"

    diagnostics = StandardBlockContract.instance_errors(
      architecture,
      blocks_by_path: @blocks,
      registered_blocks: [@block_path],
    )
    assert_code diagnostics, "unknown_block_subject"

    instance["subject_ref"] = "modules.pair_biased_attention"
    diagnostics = StandardBlockContract.instance_errors(
      architecture,
      blocks_by_path: @blocks,
      registered_blocks: [@block_path],
    )
    assert_code diagnostics, "unknown_block_variant"

    diagnostics = StandardBlockContract.instance_errors(
      architecture,
      blocks_by_path: @blocks,
      registered_blocks: [],
    )
    assert_code diagnostics, "unregistered_standard_block"
  end

  def test_port_direction_kind_cardinality_and_exact_coverage_are_enforced
    architecture = deep_copy(@architecture)
    instance = architecture.fetch("block_instances").first
    instance.fetch("port_bindings").reject! { |binding| binding.fetch("port_ref") == "ports.pair_context" }
    output = instance.fetch("port_bindings").find do |binding|
      binding.fetch("port_ref") == "ports.updated_single_state"
    end
    output["relation_refs"] = [
      "relations.group_state_enters_pair_attention",
      "relations.pair_attention_updates_group_state",
    ]

    diagnostics = StandardBlockContract.instance_errors(
      architecture,
      blocks_by_path: @blocks,
      registered_blocks: [@block_path],
    )
    assert_code diagnostics, "missing_required_port"
    assert_code diagnostics, "block_port_cardinality"
    assert_code diagnostics, "block_port_direction"
    assert_code diagnostics, "incomplete_exact_block_interface"

    pair_port = @block.fetch("ports").find { |port| port.fetch("id") == "pair_context" }
    pair_port["relation_kinds"] = ["data_flow"]
    instance.fetch("port_bindings") << {
      "port_ref" => "ports.pair_context",
      "relation_refs" => ["relations.pair_context_biases_pair_attention"],
    }
    diagnostics = StandardBlockContract.instance_errors(
      architecture,
      blocks_by_path: @blocks,
      registered_blocks: [@block_path],
    )
    assert_code diagnostics, "block_port_relation_kind"
  end

  def test_non_exact_reuse_must_explain_the_adaptation
    architecture = deep_copy(@architecture)
    instance = architecture.fetch("block_instances").first
    instance["conformance"] = "reduced"
    instance.delete("difference_summary")

    diagnostics = StandardBlockContract.instance_errors(
      architecture,
      blocks_by_path: @blocks,
      registered_blocks: [@block_path],
    )
    assert_code diagnostics, "missing_block_difference"
  end

  def test_visual_segments_reference_placed_nodes_without_overlap
    block = load_yaml("standard_blocks/invariant-point-attention.yaml")
    segments = block.fetch("visual_template").fetch("segments")
    segments.first.fetch("node_refs") << "values.not_placed"
    segments.last.fetch("node_refs") << "values.scalar_terms"

    diagnostics = StandardBlockContract.definition_errors(block)
    assert_code diagnostics, "unknown_visual_segment_ref"
    assert_code diagnostics, "overlapping_visual_segments"
  end

  def test_semantic_code_bindings_validate_lexemes_access_and_complete_step_interface
    block = load_yaml("standard_blocks/invariant-point-attention.yaml")
    step = block.fetch("steps").find { |candidate| candidate.fetch("id") == "softmax_attention" }
    write_binding, read_binding = step.fetch("code_bindings")
    write_binding["lexeme"] = "not_in_the_statement"
    read_binding["access"] = "write"

    diagnostics = StandardBlockContract.definition_errors(block)
    assert_code diagnostics, "missing_code_binding_lexeme"
    assert_code diagnostics, "invalid_code_binding_access"
    assert_code diagnostics, "missing_code_binding"
  end

  def test_semantic_code_bindings_reject_unknown_ambiguous_and_inactive_facts
    block = load_yaml("standard_blocks/invariant-point-attention.yaml")
    step = block.fetch("steps").find { |candidate| candidate.fetch("id") == "softmax_attention" }
    step.fetch("code_bindings").first["ref"] = "values.not_declared"
    step.fetch("code_bindings") << {
      "lexeme" => "combined_logits",
      "ref" => "values.attention_weights",
      "access" => "write",
    }
    block.fetch("variants").first.fetch("step_refs").delete("steps.softmax_attention")

    diagnostics = StandardBlockContract.definition_errors(block)
    assert_code diagnostics, "unknown_code_binding_ref"
    assert_code diagnostics, "ambiguous_code_binding_lexeme"
    assert_code diagnostics, "inactive_code_binding_step"
  end

  private

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
