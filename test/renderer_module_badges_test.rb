# frozen_string_literal: true

require "minitest/autorun"

class RendererModuleBadgesTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @renderer = File.binread(File.join(ROOT, "renderer/architecture/renderer.js"))
  end

  def test_attention_head_badge_is_derived_from_canonical_module_metadata
    badges = @renderer[/function blockBadges\b.*?^}/m]

    refute_nil badges
    assert_includes badges, "module?.attention?.heads"
    assert_includes badges, '`${module.attention.heads} heads`'
    refute_includes badges, '"12 heads"'
  end

  def test_attention_focus_summary_includes_head_count
    summary = @renderer[/function renderAttentionSummary\b.*?^}/m]

    refute_nil summary
    assert_includes summary, "<dt>heads</dt>"
    assert_includes summary, "attention.heads"
  end
end
