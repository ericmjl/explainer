# frozen_string_literal: true

require "minitest/autorun"
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
end
