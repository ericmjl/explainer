# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererOrthogonalRoutingTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_arrow_landing_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "test/renderer_orthogonal_routing_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; orthogonal-routing test is optional"
  end

  def test_board_arrow_markers_have_stable_geometry
    renderer = File.binread(File.join(ROOT, "renderer/architecture/renderer.js"))
    markers = renderer[/function renderEdgeMarkers\b.*?^}/m]

    refute_nil markers
    assert_includes markers, 'marker.setAttribute("markerWidth", "14")'
    assert_includes markers, 'marker.setAttribute("markerHeight", "14")'
    assert_includes markers, 'marker.setAttribute("markerUnits", "userSpaceOnUse")'
    assert_includes renderer, "arrowLanding: DEFAULT_ARROW_LANDING"
    assert_includes renderer, "routePoints = ensureMinimumLanding(routePoints, RULES.route.arrowLanding)"
  end
end
