# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererComparisonBoardTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_comparison_board_model
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/renderer_comparison_board_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  end
end
