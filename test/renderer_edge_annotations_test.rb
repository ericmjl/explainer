# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererEdgeAnnotationsTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_edge_annotation_geometry
    stdout, stderr, status = Open3.capture3(
      "node",
      "test/renderer_edge_annotations_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; edge-annotation geometry test is optional"
  end
end
