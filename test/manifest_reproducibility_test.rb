# frozen_string_literal: true

require "minitest/autorun"
require "json"
require "open3"
require "rbconfig"

class ManifestReproducibilityTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_committed_manifests_match_validated_sources
    output, error, status = Open3.capture3(
      RbConfig.ruby,
      "renderer/architecture/build-manifest.rb",
      "--check",
      chdir: ROOT,
    )

    assert status.success?, "#{output}\n#{error}"
    assert_includes output, "source lint ok"
    assert_includes output, "manifest check ok"
  end

  def test_comparison_build_metadata_records_the_sources_used_to_resolve_board_facts
    source = File.binread(File.join(ROOT, "renderer/architecture/manifest-index.js"))
    payload = source[/export const comparisonIndex = (\{.*\});\s*\z/m, 1]
    refute_nil payload

    digests = JSON.parse(payload).dig("build", "inputDigests")
    %w[
      comparisons/index.yaml
      comparisons/genie3-reduced-vs-full-ipa.yaml
      references/bibliography.yaml
      architectures/genie3.yaml
      views/genie3-semantic-zoom.view.yaml
      standard_blocks/invariant-point-attention.yaml
    ].each do |path|
      assert_match(/\A[a-f0-9]{64}\z/, digests.fetch(path), path)
    end
  end
end
