# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class ReviewAudienceLocationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_review_audience_location_suite
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/review_audience_location_test.mjs",
      chdir: ROOT,
    )
    assert status.success?, [stdout, stderr].join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; review audience-location test is optional"
  end
end
