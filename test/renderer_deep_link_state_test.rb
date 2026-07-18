# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererDeepLinkStateTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_deep_link_state_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/renderer_deep_link_state_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; deep-link state test is optional"
  end
end
