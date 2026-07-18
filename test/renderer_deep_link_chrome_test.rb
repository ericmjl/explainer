# frozen_string_literal: true

require "minitest/autorun"

class RendererDeepLinkChromeTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_board_navigation_has_one_persistent_copy_link_action
    html = read("renderer/architecture/index.html")
    navigation = html[/<nav id="boardNavigation".*?<\/nav>/m]

    refute_nil navigation
    assert_equal 1, navigation.scan('id="copyDeepLink"').length
    assert_includes navigation, 'class="board-copy-link"'
    assert_includes navigation, 'type="button"'
    assert_includes navigation, '<span class="board-back-label">Up</span>'
    assert_includes navigation, 'aria-label="Copy link to this architecture view"'
    assert_includes navigation, '<span class="board-copy-link-label">Copy link</span>'
    assert_operator navigation.index('id="boardBreadcrumbs"'), :<, navigation.index('id="copyDeepLink"')
  end

  def test_copy_link_control_is_compact_and_keeps_an_icon_on_small_screens
    css = read("styles.css")
    button_rule = css[/\.board-copy-link\s*\{[^}]*\}/m]
    icon_rule = css[/\.board-copy-link svg\s*\{[^}]*\}/m]
    compact_label_rule = css[/\.board-copy-link-label\s*\{[^}]*\}/m]

    refute_nil button_rule
    assert_includes button_rule, "display: inline-flex"
    assert_includes button_rule, "flex: none"
    assert_includes button_rule, "min-height: 36px"
    refute_includes button_rule, "display: none"
    assert_includes icon_rule, "stroke: currentColor"
    assert_includes compact_label_rule, "display: none"
  end

  def test_renderer_docs_define_the_static_deep_link_contract
    protocol = read("protocol/renderer-architecture.md")
    readme = read("README.md")
    example = "?arch=genie3&board=latent_transformer&node=pair_biased_attention_update"

    assert_includes protocol, "### Shareable Board and Component Links"
    assert_includes protocol, example
    assert_includes protocol, "`board` plus `node` identifies the exact rendered card"
    assert_includes protocol, "Browser Back and Forward restore the board"
    assert_includes protocol, "published as a static site"
    assert_includes readme, example
    assert_includes readme, "**Copy link** button"
  end

  private

  def read(relative)
    File.binread(File.join(ROOT, relative))
  end
end
