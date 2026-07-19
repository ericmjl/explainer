# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererVisualSegmentTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_visual_segment_contract
    _stdout, _stderr, available = Open3.capture3("node", "--version")
    skip "node is unavailable; visual-segment test is optional" unless available.success?

    stdout, stderr, status = Open3.capture3(
      "node", "--test", "test/renderer_visual_segment_test.mjs", chdir: ROOT,
    )
    assert status.success?, "#{stdout}\n#{stderr}"
  end
end
