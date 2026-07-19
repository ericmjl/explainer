# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererQuestionContextTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_question_context_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "test/renderer_question_context_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; renderer question-context test is optional"
  end
end
