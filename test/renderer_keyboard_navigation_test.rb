# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererKeyboardNavigationNodeTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_keyboard_navigation_helpers_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/renderer_keyboard_navigation_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; keyboard-navigation test is optional"
  end
end
