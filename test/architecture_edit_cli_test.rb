# frozen_string_literal: true

require "digest"
require "json"
require "minitest/autorun"
require "open3"
require "rbconfig"
require "tmpdir"
require_relative "../lib/strict_yaml"

class ArchitectureEditCliTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  EXAMPLE = "examples/architecture-edits/clarify-timestep-embedder.yaml"

  def test_prepare_then_json_show_is_non_mutating_and_machine_readable
    watched = %w[
      architectures/diffusion-transformer.yaml
      views/dit-semantic-zoom.view.yaml
      renderer/architecture/manifest-dit.js
    ]
    before = watched.to_h { |path| [path, Digest::SHA256.file(File.join(ROOT, path)).hexdigest] }

    Dir.mktmpdir("architecture-edit-cli-test-") do |directory|
      prepared_path = File.join(directory, "prepared.yaml")
      stdout, stderr, status = run_cli("prepare", EXAMPLE, "--out", prepared_path)
      assert status.success?, "#{stdout}\n#{stderr}"
      assert_includes stdout, "Prepared clarify_timestep_embedder"
      prepared = StrictYaml.load_file(prepared_path)
      assert_match(/\A[a-f0-9]{64}\z/, prepared.dig("target", "architecture_sha256"))
      assert_match(/\A[a-f0-9]{64}\z/, prepared.dig("target", "view_sha256"))

      stdout, stderr, status = run_cli("show", prepared_path, "--format", "json")
      assert status.success?, "#{stdout}\n#{stderr}"
      report = JSON.parse(stdout)
      assert_equal "validated", report.fetch("status")
      assert_equal "dit", report.fetch("source_set")
      assert report.fetch("changes").any? { |change| change["entity_ref"] == "boards.timestep_embedder_detail" }
      assert_includes report.fetch("files"), "renderer/architecture/manifest-dit.js"
    end

    after = watched.to_h { |path| [path, Digest::SHA256.file(File.join(ROOT, path)).hexdigest] }
    assert_equal before, after
  end

  private

  def run_cli(*arguments)
    Open3.capture3(
      RbConfig.ruby,
      "scripts/architecture_edit.rb",
      *arguments,
      chdir: ROOT,
    )
  end
end
