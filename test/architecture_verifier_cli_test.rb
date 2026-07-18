# frozen_string_literal: true

require "json"
require "minitest/autorun"
require "open3"
require "rbconfig"

class ArchitectureVerifierCliTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_json_board_verification_passes_for_genie3_reverse_step
    stdout, stderr, status = Open3.capture3(
      RbConfig.ruby,
      "scripts/verify_architecture.rb",
      "--source-set", "genie3",
      "--board", "reverse_diffusion_step",
      "--format", "json",
      chdir: ROOT,
    )

    assert status.success?, "#{stdout}\n#{stderr}"
    assert_empty stderr

    report = JSON.parse(stdout)
    assert_equal "architecture-verification-v0.1", report.fetch("schema_version")
    assert_equal "passed", report.fetch("status")
    assert_equal "genie3", report.fetch("source_set")
    assert_equal "reverse_diffusion_step", report.fetch("board")
    assert_equal 0, report.fetch("summary").fetch("failed_count")
    assert_equal 0, report.fetch("summary").fetch("error_count")
    assert report.fetch("checks").all? { |check| check.fetch("status") == "passed" }
  end

  def test_json_failure_is_structured_and_exits_one
    stdout, stderr, status = Open3.capture3(
      RbConfig.ruby,
      "scripts/verify_architecture.rb",
      "--source-set", "not_registered",
      "--format", "json",
      chdir: ROOT,
    )

    assert_equal 1, status.exitstatus
    assert_empty stderr
    report = JSON.parse(stdout)
    assert_equal "failed", report.fetch("status")
    diagnostic = report.fetch("checks").first.fetch("diagnostics").first
    assert_equal "unknown_source_set", diagnostic.fetch("code")
    assert_operator report.fetch("summary").fetch("skipped_count"), :>, 0
  end

  def test_missing_source_set_is_cli_usage_error
    stdout, stderr, status = Open3.capture3(
      RbConfig.ruby,
      "scripts/verify_architecture.rb",
      chdir: ROOT,
    )

    assert_equal 2, status.exitstatus
    assert_empty stdout
    assert_includes stderr, "missing argument: --source-set"
    assert_includes stderr, "Usage: ruby scripts/verify_architecture.rb"
  end
end
