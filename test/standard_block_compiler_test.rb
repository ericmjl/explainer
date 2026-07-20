# frozen_string_literal: true

require "minitest/autorun"

require_relative "../lib/standard_block_compiler"
require_relative "../lib/strict_yaml"

class StandardBlockCompilerTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_compilation_is_deterministic_scoped_and_preserves_canonical_relations
    architecture = load_yaml("architectures/generic-feature-refinement.yaml")
    original_relations = Marshal.dump(architecture.fetch("relations"))
    catalog = catalog_for("standard_blocks/pair-biased-attention.yaml")

    first = catalog.compile_instances(architecture, registered_blocks: catalog.blocks_by_path.keys)
    second = catalog.compile_instances(architecture, registered_blocks: catalog.blocks_by_path.keys)

    assert_equal first, second
    assert_equal original_relations, Marshal.dump(architecture.fetch("relations"))
    instance = first.fetch(0)
    assert_equal "generic_group_pair_attention", instance.fetch("id")
    assert_equal "logit_bias_only", instance.fetch("variant")
    assert instance.fetch("pseudocode").all? do |step|
      step.fetch("instanceFactRef").start_with?("block_instances.generic_group_pair_attention.steps.")
    end
    groundings = instance.dig("scene", "edges").map { |edge| edge.fetch("grounding") }.uniq
    assert_includes groundings, "canonical_relation_path"
    assert_includes groundings, "standard_block_template"
  end

  def test_variant_filtering_keeps_reduced_pair_values_without_point_geometry
    architecture = load_yaml("architectures/genie3.yaml")
    catalog = catalog_for(
      "standard_blocks/pair-biased-attention.yaml",
      "standard_blocks/invariant-point-attention.yaml",
    )
    instances = catalog.compile_instances(architecture, registered_blocks: catalog.blocks_by_path.keys)
    reduced = instances.find { |instance| instance.fetch("id") == "latent_reduced_pair_attention" }
    step_ids = reduced.fetch("pseudocode").map { |step| step.fetch("id") }

    assert_includes step_ids, "aggregate_pair_values"
    assert_includes step_ids, "transition_and_mask"
    refute_includes step_ids, "project_attention_output"
    assert_equal "reduced", reduced.fetch("conformance")
    assert_match(/removes frame-aware point terms/i, reduced.fetch("differenceSummary"))
  end

  def test_same_ipa_template_compiles_for_genie2_and_genie3_boundaries
    path = "standard_blocks/invariant-point-attention.yaml"
    catalog = catalog_for(path, "standard_blocks/pair-biased-attention.yaml")
    compiled = %w[genie2 genie3].to_h do |id|
      architecture = load_yaml("architectures/#{id}.yaml")
      instance = catalog.compile_instances(architecture, registered_blocks: catalog.blocks_by_path.keys)
                        .find { |candidate| candidate.fetch("id") == "structure_ipa" }
      [id, instance]
    end

    assert_equal compiled.fetch("genie2").fetch("standardBlockId"),
      compiled.fetch("genie3").fetch("standardBlockId")
    assert_equal compiled.fetch("genie2").fetch("variant"), compiled.fetch("genie3").fetch("variant")
    refute_equal compiled.fetch("genie2").fetch("subjectRef"), "modules.not_present"
    assert_equal "modules.invariant_point_attention", compiled.fetch("genie2").fetch("subjectRef")
    assert_equal "modules.invariant_point_attention", compiled.fetch("genie3").fetch("subjectRef")
    genie2_relations = compiled.fetch("genie2").fetch("portBindings").flat_map { |binding| binding.fetch("relationRefs") }
    genie3_relations = compiled.fetch("genie3").fetch("portBindings").flat_map { |binding| binding.fetch("relationRefs") }
    refute_equal genie2_relations, genie3_relations
  end

  def test_reusable_board_stub_compiles_to_a_template_grounded_detail_scene
    architecture = load_yaml("architectures/genie2.yaml")
    view = load_yaml("views/genie2-semantic-zoom.view.yaml")
    path = "standard_blocks/invariant-point-attention.yaml"
    catalog = catalog_for(path)
    board = catalog.compile_boards(
      architecture,
      view.fetch("boards"),
      registered_blocks: [path],
    ).find { |candidate| candidate.fetch("id") == "genie2_ipa_internals" }

    assert_equal "standard_block_template", board.fetch("projectionMode")
    assert_equal "block_instances.structure_ipa", board.fetch("blockInstanceRef")
    assert_equal "full_ipa", board.fetch("variant")
    refute_empty board.fetch("nodes")
    refute_empty board.fetch("edges")
    cells = board.fetch("nodes").map { |node| [node.fetch("col"), node.fetch("row")] }
    assert_equal cells.uniq, cells
    assert board.fetch("nodes").any? { |node| node["template_fact_ref"] }
    assert board.fetch("edges").any? { |edge| edge.fetch("grounding") == "canonical_relation_path" }
    segments = board.fetch("segments")
    assert_equal %w[attention_weights value_extraction], segments.map { |segment| segment.fetch("id") }
    assert_equal [1, 2], segments.map { |segment| segment.fetch("order") }
    assert_equal segments.flat_map { |segment| segment.fetch("node_ids") }.uniq.sort,
      board.fetch("nodes").map { |node| node.fetch("id") }.sort
    attention = board.fetch("nodes").find { |node| node.fetch("id") == "attention_weights" }
    aggregations = board.fetch("nodes").select { |node| node.fetch("id").start_with?("aggregate_") }
    assert aggregations.all? { |node| node.fetch("row") > attention.fetch("row") },
      "value extraction should follow the shared attention-weight hinge"
  end

  def test_ipa_semantic_code_bindings_compile_to_template_and_instance_facts
    path = "standard_blocks/invariant-point-attention.yaml"
    architecture = load_yaml("architectures/genie2.yaml")
    instance = catalog_for(path).compile_instances(
      architecture,
      registered_blocks: [path],
    ).find { |candidate| candidate.fetch("id") == "structure_ipa" }

    assert instance.fetch("pseudocode").all? { |step| !step.fetch("codeBindings").empty? }
    softmax = instance.fetch("pseudocode").find { |step| step.fetch("id") == "softmax_attention" }
    attention = softmax.fetch("codeBindings").find { |binding| binding.fetch("lexeme") == "attention" }
    assert_equal "write", attention.fetch("access")
    assert_equal "values.attention_weights", attention.fetch("localRef")
    assert_equal "standard_blocks.invariant_point_attention.values.attention_weights",
      attention.fetch("templateFactRef")
    assert_equal "block_instances.structure_ipa.values.attention_weights",
      attention.fetch("instanceFactRef")
    occurrence = attention.fetch("occurrences").fetch(0)
    assert_equal "attention", softmax.fetch("code")[occurrence.fetch("start")...occurrence.fetch("end")]

    localize = instance.fetch("pseudocode").find do |step|
      step.fetch("id") == "return_points_to_local_frame"
    end
    repeated = localize.fetch("codeBindings").find do |binding|
      binding.fetch("lexeme") == "global_point_context"
    end
    assert_equal 2, repeated.fetch("occurrences").length

    visible_fact_refs = instance.dig("scene", "nodes").map { |node| node.fetch("instance_fact_ref") }.to_set
    compiled_binding_refs = instance.fetch("pseudocode").flat_map do |step|
      step.fetch("codeBindings").map { |binding| binding.fetch("instanceFactRef") }
    end
    assert_empty compiled_binding_refs.to_set - visible_fact_refs
  end

  def test_variant_filtering_does_not_emit_inactive_semantic_code_bindings
    path = "standard_blocks/invariant-point-attention.yaml"
    block = load_yaml(path)
    block.fetch("variants") << {
      "id" => "scalar_projection_only",
      "label" => "Scalar projection only",
      "description" => "Test-only variant containing one active semantic step.",
      "step_refs" => ["steps.project_scalar_terms"],
    }
    architecture = load_yaml("architectures/genie2.yaml")
    architecture.fetch("block_instances").find do |candidate|
      candidate.fetch("id") == "structure_ipa"
    end["variant"] = "scalar_projection_only"
    instance = StandardBlockCompiler::Catalog.new(blocks_by_path: { path => block }).compile_instances(
      architecture,
      registered_blocks: [path],
    ).find { |candidate| candidate.fetch("id") == "structure_ipa" }

    assert_equal ["project_scalar_terms"], instance.fetch("pseudocode").map { |step| step.fetch("id") }
    assert_equal %w[k_s q_s single_state v_s],
      instance.dig("pseudocode", 0, "codeBindings").map { |binding| binding.fetch("lexeme") }.sort
  end

  private

  def catalog_for(*paths)
    StandardBlockCompiler::Catalog.new(
      blocks_by_path: paths.to_h { |path| [path, load_yaml(path)] },
    )
  end

  def load_yaml(path)
    StrictYaml.load_file(File.join(ROOT, path))
  end
end
