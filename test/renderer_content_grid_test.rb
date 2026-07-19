# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererContentGridTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_content_grid_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "test/renderer_content_grid_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; content-grid test is optional"
  end

  def test_renderer_uses_bounded_route_aware_label_sizing
    renderer = File.read(File.join(ROOT, "renderer/architecture/renderer.js"))

    assert_includes renderer, 'from "./content-grid.mjs"'
    assert_includes renderer, "const preliminaryRoutes = buildOrthoRoutes"
    assert_includes renderer, "availableSpan: segment.length"
    assert_includes renderer, "function edgeLabelLines(label)"
    assert_includes renderer, "edgeLabelWrapWidth: 112"
    assert_includes renderer, "edgeAnnotationSegmentPadding: 4"
    assert_includes renderer, "edgeBadgeWrapWidth: 160"
    refute_includes renderer, "edgeLabelMinSpan"
  end

  def test_renderer_compiles_opt_in_annotation_aware_row_boundaries
    renderer = File.read(File.join(ROOT, "renderer/architecture/renderer.js"))
    styles = File.read(File.join(ROOT, "styles.css"))

    assert_includes renderer, "function applyContentRowSizing"
    assert_includes renderer, 'board.grid?.row_sizing !== "content"'
    assert_includes renderer, "reservedEdgeTextHeight(board, edge)"
    assert_includes renderer, "Math.abs(fromRow - toRow) !== 1"
    assert_includes renderer, "Number(fromNode.col) !== Number(toNode.col)"
    assert_includes styles, "var(--board-row-gap, 18px)"
  end
end
