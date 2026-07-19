# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererFlowFamilyTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @renderer = File.binread(File.join(ROOT, "renderer/architecture/renderer.js"))
    @styles = File.binread(File.join(ROOT, "styles.css"))
  end

  def test_dom_free_flow_family_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "test/renderer_flow_family_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; renderer flow-family test is optional"
  end

  def test_typed_lane_and_marker_rendering_contract
    lane_renderer = @renderer[/function renderScaleLanes\b.*?(?=^let elkInstance)/m]
    marker_selector = @renderer[/function edgeMarkerId\b.*?^}/m]

    refute_nil lane_renderer
    assert_includes lane_renderer, 'lane.kind === "representation"'
    assert_includes lane_renderer, 'guide.style.gridRow = String(lane.row)'
    assert_includes lane_renderer, 'representation-lane-${lane.glyph}'
    assert_includes @styles, ".representation-lane-single"
    assert_includes @styles, ".representation-lane-pair"

    refute_nil marker_selector
    assert_operator marker_selector.index('edge.tone === "skip"'), :<,
      marker_selector.index("PAYLOAD_FLOW_FAMILIES.includes")
  end
end
