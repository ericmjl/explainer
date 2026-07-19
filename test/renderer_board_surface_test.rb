# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererBoardSurfaceNodeTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_scoped_board_surface_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/renderer_board_surface_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; board-surface test is optional"
  end
end
