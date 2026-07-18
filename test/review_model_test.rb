# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class ReviewModelNodeTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_node_review_model_suite
    stdout, stderr, status = Open3.capture3("node", "--test", "test/review_model_test.mjs", chdir: ROOT)
    assert status.success?, [stdout, stderr].join("\n")
  end
end
