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
    assert_equal "pair_values_residual_norm_transition", board.fetch("variant")
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

  private

  def read(relative)
    File.binread(File.join(ROOT, relative))
  end

  def manifest(id)
    source = read("renderer/architecture/manifest-#{id}.js")
    JSON.parse(source.sub(/\Aexport const manifest = /, "").sub(/;\s*\z/, ""))
  end
end
