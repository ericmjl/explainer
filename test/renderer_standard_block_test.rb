# frozen_string_literal: true

require "json"
require "minitest/autorun"

class RendererStandardBlockTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_renderer_is_data_driven_and_contains_no_pair_attention_id_branch
    renderer = read("renderer/architecture/renderer.js")

    assert_includes renderer, "function renderBlockInstance(instance)"
    assert_includes renderer, "blockInstancesBySubject"
    refute_includes renderer, 'block.id === "pair_biased_attention"'
    refute_includes renderer, "renderAttentionTermDiagram"
  end

  def test_generated_component_board_preserves_template_and_relation_grounding
    manifest = manifest("genie3")
    board = manifest.dig("boards", "items").find do |candidate|
      candidate.fetch("id") == "genie3_reduced_pair_attention_internals"
    end

    assert_equal "standard_block_template", board.fetch("projectionMode")
    assert_equal "reduced", board.fetch("conformance")
    assert_equal "pair_values_attention_delta", board.fetch("variant")
    assert board.fetch("edges").any? { |edge| edge.fetch("grounding") == "standard_block_template" }
    assert board.fetch("edges").any? { |edge| edge.fetch("grounding") == "canonical_relation_path" }
    assert board.fetch("nodes").all? { |node| node.fetch("block_instance_ref") == "block_instances.latent_reduced_pair_attention" }
  end

  def test_both_board_surfaces_render_declarative_visual_segments
    renderer = read("renderer/architecture/renderer.js")
    comparison = read("renderer/architecture/comparison-board-renderer.mjs")
    styles = read("styles.css")

    assert_includes renderer, "renderVisualSegmentRegions({"
    assert_includes comparison, "renderVisualSegmentRegions({"
    assert_includes styles, ".visual-segment-region"
    assert_includes styles, ".visual-segment-header"
  end

  def test_genie3_pair_transition_board_is_compiled_from_the_standard_block
    manifest = manifest("genie3")
    board = manifest.dig("boards", "items").find do |candidate|
      candidate.fetch("id") == "genie3_pair_transition_internals"
    end

    assert_equal "standard_block_template", board.fetch("projectionMode")
    assert_equal "block_instances.latent_pair_transition", board.fetch("blockInstanceRef")
    assert_equal "layer_norm_expansion_relu_projection_mask_residual", board.fetch("variant")
    assert_equal "exact", board.fetch("conformance")
    assert board.fetch("nodes").any? { |node| node.fetch("id") == "expanded_pair_state" }
    assert board.fetch("nodes").any? { |node| node.fetch("id") == "add_pair_residual" }
  end

  def test_genie3_single_to_pair_endpoint_board_is_compiled_from_the_standard_block
    manifest = manifest("genie3")
    board = manifest.dig("boards", "items").find do |candidate|
      candidate.fetch("id") == "genie3_single_to_pair_endpoint_update_internals"
    end

    assert_equal "standard_block_template", board.fetch("projectionMode")
    assert_equal "block_instances.latent_single_to_pair_endpoint_update", board.fetch("blockInstanceRef")
    assert_equal "projected_endpoint_sum_residual", board.fetch("variant")
    assert_equal "exact", board.fetch("conformance")
    assert board.fetch("nodes").any? { |node| node.fetch("id") == "left_single" }
    assert board.fetch("nodes").any? { |node| node.fetch("id") == "right_single" }
    assert board.fetch("nodes").any? { |node| node.fetch("id") == "pair_activations" }
    assert_equal %w[endpoint_pair_construction residual_pair_update],
      board.fetch("segments").map { |segment| segment.fetch("id") }
  end

  def test_renderer_uses_generic_operation_glyphs
    renderer = read("renderer/architecture/renderer.js")
    styles = read("styles.css")

    assert_includes renderer, "function operationGlyphKind(operation = \"\")"
    assert_includes renderer, 'normalized === "linear_relu"'
    assert_includes renderer, 'normalized === "linear") return "linear-final"'
    assert_includes renderer, 'normalized === "residual_add"'
    assert_includes renderer, 'normalized === "dropout_layer_norm"'
    assert_includes renderer, "operationGlyphMarkup(node.operation)"
    assert_includes renderer, "model-map-operation-glyph"
    assert_includes styles, ".arch-operation-card"
    assert_includes styles, ".op-glyph-relu"
    assert_includes styles, ".model-map-operation-relu"
  end

  private

  def read(relative)
    File.binread(File.join(ROOT, relative))
  end

  def manifest(id)
    source = read("renderer/architecture/manifest-#{id}.js")
    JSON.parse(source.sub(/\Aexport const manifest = /, "").sub(/;\s*\z/, ""))
  end
end
