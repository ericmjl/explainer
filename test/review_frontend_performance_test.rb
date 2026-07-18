# frozen_string_literal: true

require "minitest/autorun"

class ReviewFrontendPerformanceTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_preview_is_revision_guarded_and_apply_uses_the_validated_transaction
    script = File.read(File.join(ROOT, "review/review.js"), encoding: "UTF-8")

    assert_includes script, "transactionRevision"
    assert_includes script, "new AbortController()"
    assert_includes script, "response.transaction_id"
    assert_includes script, "{ transaction_id: state.transactionId }"
    assert_includes script, "revision !== state.transactionRevision"
  end

  def test_source_and_renderer_refreshes_are_parallel_and_expose_busy_state
    script = File.read(File.join(ROOT, "review/review.js"), encoding: "UTF-8")
    styles = File.read(File.join(ROOT, "review/review.css"), encoding: "UTF-8")

    assert_operator script.scan("Promise.all([").length, :>=, 2
    assert_includes script, 'setAttribute("aria-busy", String(busy))'
    assert_includes script, 'action === "preview" ? "Validating…"'
    assert_includes styles, ".review-commit-actions button.is-waiting::before"
  end

  def test_audience_refresh_retains_deep_location_but_source_switches_start_at_root
    script = File.read(File.join(ROOT, "review/review.js"), encoding: "UTF-8")
    apply = script[/async function applyChanges\b.*?(?=^function setBusy\b)/m]
    load = script[/async function loadSourceSet\b.*?(?=^function currentAudienceFrameUrl\b)/m]
    selection = script[/function onArchitectureSelection\b.*?(?=^function renderEmptySelection\b)/m]

    assert_includes load, "rootAudienceUrl(audienceBaseUrl, id)"
    assert_includes apply, "const audienceLocation = currentAudienceFrameUrl()"
    assert_includes apply, "refreshAudienceUrl(audienceLocation"
    assert_includes apply, "syncAudienceLinkFromFrame(refreshUrl)"
    assert_operator selection.index("syncAudienceLinkFromFrame()"), :<, selection.index("if (!state.snapshot) return")
    assert_includes script, 'elements.audienceFrame.addEventListener("load", () => syncAudienceLinkFromFrame())'
  end
end
