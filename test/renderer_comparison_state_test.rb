# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererComparisonStateTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_comparison_state_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/renderer_comparison_state_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; comparison state test is optional"
  end
end
