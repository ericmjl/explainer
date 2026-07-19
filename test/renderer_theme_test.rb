# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererThemeTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_theme_state
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/theme_state_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; theme state test is optional"
  end

  def test_directory_and_renderer_share_the_ramith_theme
    landing = File.binread(File.join(ROOT, "index.html"))
    renderer = File.binread(File.join(ROOT, "renderer/architecture/index.html"))
    styles = File.binread(File.join(ROOT, "styles.css"))
    state = File.binread(File.join(ROOT, "theme-state.mjs"))

    assert_operator landing.index("theme-init.js"), :<, landing.index("styles.css")
    assert_operator renderer.index("theme-init.js"), :<, renderer.index("styles.css")
    assert_includes landing, 'id="directoryThemeSwitcher"'
    assert_includes renderer, 'id="rendererThemeSwitcher"'
    assert_includes state, 'id: "ramith", label: "Ramith paper"'
    refute_includes state, "URLSearchParams"

    assert_includes styles, ':root[data-theme="ramith"]'
    assert_includes styles, "--bg: #fffff8"
    assert_includes styles, "--ink: #111111"
    assert_includes styles, "--accent: #2e7247"
    assert_includes styles, "--blue: #2f6f91"
    assert_includes styles, '@media (prefers-color-scheme: dark)'
  end
end
