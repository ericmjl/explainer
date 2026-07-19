# frozen_string_literal: true

require "minitest/autorun"

class RendererDeepLinkIntegrationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @renderer = File.binread(File.join(ROOT, "renderer/architecture/renderer.js"))
  end

  def test_bootstrap_resolves_the_url_before_building_renderer_state
    resolution = @renderer.index("const initialDeepLink = resolveDeepLink({")
    state = @renderer.index("const state = {")
    render = function_source("render", "renderPageChrome")

    refute_nil resolution
    refute_nil state
    assert_operator resolution, :<, state
    assert_includes @renderer, "boards: manifest.boards.items"
    assert_includes @renderer, "rootBoardId: manifest.boards.rootBoard"
    assert_includes @renderer, "search: window.location.search"
    assert_in_order render,
      "applyResolvedDeepLink(initialDeepLink, { canonicalize: false, announceIssues: true });",
      "applyComparisonResolvedState(initialComparisonState, {",
      "canonicalize: true"
  end

  def test_initial_state_uses_the_reconstructed_stack_and_return_origins
    state = @renderer[/const state = \{.*?^\};/m]

    refute_nil state
    assert_includes state, "boardStack: [...initialDeepLink.boardStack]"
    assert_includes state, "boardOrigins: [...initialDeepLink.boardOrigins]"
    refute_includes state, "boardStack: [manifest.boards.rootBoard]"
  end

  def test_selection_updates_the_control_and_synchronizes_history
    selection = function_source("setSelection", "announceSelection")

    assert_in_order selection,
      "state.selection = createWorkspaceSelection",
      "updateDeepLinkControl();",
      "syncDeepLinkHistory();",
      "announceSelection();"
  end

  def test_board_push_suppresses_render_selection_writes_then_syncs_once
    push = function_source("pushBoard", "popToBoard")

    assert_in_order push,
      "state.boardStack.push(boardId)",
      "state.boardOrigins.push(originNodeId || null)",
      "withDeepLinkWritesSuppressed(() => {",
      "renderBoard();",
      "focusOverview();",
      "syncDeepLinkHistory();"
    assert_equal 1, push.scan("syncDeepLinkHistory();").length
  end

  def test_board_pop_suppresses_render_selection_writes_then_syncs_once
    pop = function_source("popToBoard", "focusBoardNavigationTarget")

    assert_in_order pop,
      "state.boardStack = state.boardStack.slice(0, index + 1)",
      "state.boardOrigins = state.boardOrigins.slice(0, index + 1)",
      "withDeepLinkWritesSuppressed(() => {",
      "renderBoard();",
      "focusOverview();",
      "syncDeepLinkHistory();"
    assert_equal 1, pop.scan("syncDeepLinkHistory();").length
  end

  def test_popstate_resolves_and_applies_the_url_without_a_transition_lock
    popstate = function_source("onDeepLinkPopState", "deepLinkTargetLabel")
    apply = function_source("applyResolvedDeepLink", "onDeepLinkPopState")

    assert_includes popstate, "resolveDeepLink({"
    assert_includes popstate, "applyResolvedDeepLink(resolved, {"
    assert_includes popstate,
      "canonicalize: resolved.sanitized || comparisonResolved.sanitized || !requestedArch"
    refute_includes popstate, "if (state.isTransitioning)"
    assert_in_order apply,
      "cancelBoardArrival();",
      "state.boardStack = resolved.boardStack.length",
      "state.boardOrigins = resolved.boardOrigins.length",
      "withDeepLinkWritesSuppressed(() => {",
      "renderBoard();"
  end

  def test_architecture_switch_drops_board_and_node_before_navigation
    chrome = @renderer[/function renderPageChrome\b.*?(?=^window\.addEventListener\("mathjax-ready")/m]
    change = chrome&.[](/switcher\.addEventListener\("change".*?^    \}\);/m)

    refute_nil change
    assert_in_order change,
      'params.set("arch", switcher.value)',
      'params.delete("board")',
      'params.delete("node")',
      "window.location.search = params.toString()"
  end

  def test_copy_action_uses_the_canonical_deep_link_url
    canonical = function_source("canonicalDeepLinkSearch", "deepLinkLocation")
    shareable = function_source("shareableDeepLinkUrl", "onCopyDeepLinkClick")
    copy = function_source("onCopyDeepLinkClick", "ensureQuestionMenu")

    assert_includes canonical, "writeComparisonLink(window.location.search"
    assert_includes canonical, "primary: location.primary"
    assert_includes canonical, "comparison: location.comparison"
    assert_includes canonical, "selectionSide: location.selectionSide"
    assert_includes shareable, "url.search = canonicalDeepLinkSearch();"
    assert_includes shareable, '["ui", "edit", "tune", "review_refresh"]'
    assert_includes shareable, 'url.hash = ""'
    assert_in_order copy,
      'syncDeepLinkHistory({ mode: "replace" })',
      "const link = shareableDeepLinkUrl();",
      "writeQuestionClipboard(link)"
  end

  def test_unknown_architecture_is_announced_and_canonicalized
    issue = function_source("deepLinkIssueMessage", "applyResolvedDeepLink")

    assert_includes @renderer, "const unknownArchParam = Boolean(archParam)"
    assert_includes @renderer, 'initialDeepLink.issues.unshift({ code: "unknown_arch"'
    assert_includes @renderer, "initialDeepLink.sanitized = true"
    assert_includes issue, 'codes.has("unknown_arch")'
    assert_includes issue, "activeManifestEntry.name"
  end

  def test_history_restore_cancels_stale_arrival_callbacks
    cancel = function_source("cancelBoardArrival", "animateArriveFrom")
    animate = function_source("animateArriveFrom", "pushBoard")

    assert_includes cancel, "boardTransitionGeneration += 1"
    assert_includes cancel, "state.isTransitioning = false"
    assert_operator animate.scan("generation !== boardTransitionGeneration").length, :>=, 3
  end

  private

  def function_source(name, following_name)
    body = @renderer[/(?:async )?function #{Regexp.escape(name)}\b.*?(?=^(?:async )?function #{Regexp.escape(following_name)}\b)/m]
    refute_nil body, "expected #{name} before #{following_name}"
    body
  end

  def assert_in_order(source, *needles)
    offsets = needles.map do |needle|
      offset = source.index(needle)
      refute_nil offset, "expected #{needle.inspect} in source"
      offset
    end
    assert_equal offsets.sort, offsets, "expected calls in semantic order"
  end
end
