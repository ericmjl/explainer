# frozen_string_literal: true

require "minitest/autorun"

class RendererComparisonWorkspaceTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @renderer = read("renderer/architecture/renderer.js")
    @comparison_renderer = read("renderer/architecture/comparison-board-renderer.mjs")
    @html = read("renderer/architecture/index.html")
    @manifest_index = read("renderer/architecture/manifest-index.js")
  end

  def test_share_label_identifies_the_selected_comparison_side
    target_label = function_source(@renderer, "deepLinkTargetLabel", "updateDeepLinkControl")

    assert_includes target_label, 'state.comparisonState.selectionSide === "comparison"'
    assert_includes target_label, 'comparison.selectedNode'
    assert_includes target_label, '(B · Compare)'
    assert_includes target_label, 'compared with'
  end

  def test_comparison_edge_activation_updates_the_visual_selection
    focus_edge = function_source(@renderer, "focusComparisonEdge", "onFocusCompareClick")

    assert_includes focus_edge,
      "comparisonBoardRenderer?.selectEdge(edge.comparison_edge_index)"
    assert_includes focus_edge, "updateDeepLinkControl()"
    assert_includes @comparison_renderer, "comparison_edge_index: index"
  end

  def test_comparison_controls_have_descriptive_group_and_button_names
    assert_includes @html,
      'data-board-surface-role="controls" class="canvas-controls board-chrome" role="group"'
    assert_includes @html, 'aria-label="Show A, the current architecture"'
    assert_includes @html, 'aria-label="Show B, the comparison architecture"'
    assert_includes @html, 'aria-label="Swap the current and comparison architectures"'
    assert_includes @html, 'aria-label="Close architecture comparison"'
  end

  def test_workspace_has_a_distinct_accessible_board_surface_and_shared_inspector
    assert_equal 1, @html.scan('id="comparisonWorkspace"').length
    assert_equal 1, @html.scan('id="comparisonCanvas"').length
    assert_includes @html, 'id="comparisonWorkspace" class="comparison-workspace"'
    assert_includes @html, 'aria-labelledby="comparisonQuestion" hidden'
    assert_includes @html, 'data-board-surface-role="canvas"'
    assert_includes @html, 'data-board-surface-role="modules"'
    assert_includes @html, 'data-board-surface-role="regions"'
    assert_includes @html, 'data-board-surface-role="edges"'
    assert_includes @html, 'data-board-surface-role="controls"'
    assert_includes @html, 'id="comparisonSwap"'
    assert_includes @html, 'id="comparisonFitBoth"'
    assert_includes @html, 'id="comparisonClose"'
    assert_equal 1, @html.scan('id="workspaceInspector"').length
  end

  def test_registered_recipe_drives_compare_activation_without_board_id_special_cases
    suggestion = function_source(
      @renderer,
      "suggestedComparisonForCurrentBoard",
      "updateCompareAction",
    )
    open = function_source(@renderer, "onFocusCompareClick", "onComparisonCloseClick")

    assert_includes @renderer,
      'import { comparisonIndex, manifestIndex } from "./manifest-index.js";'
    assert_includes @manifest_index,
      '"compilerVersion": "architecture-comparison-compiler-v0.1"'
    assert_includes suggestion, "for (const recipe of comparisonIndex?.items || [])"
    assert_includes suggestion,
      "subjectMatchesLocation(primary, architectureId, boardId)"
    assert_includes suggestion,
      "subjectMatchesLocation(counterpart, architectureId, boardId)"
    assert_in_order open,
      "suggestedComparisonForCurrentBoard()",
      "ensureRendererModel(suggestion.target.sourceSet)",
      "writeComparisonLink(window.location.search",
      "resolveCurrentComparisonState(search)",
      'applyComparisonResolvedState(resolved, { historyMode: "push" })'
    refute_match(
      /genie3_reduced_pair_attention_internals|genie3_ipa_internals/,
      @renderer,
    )
  end

  def test_counterpart_uses_an_independent_surface_and_compiled_alignment_index
    apply = function_source(
      @renderer,
      "applyComparisonResolvedState",
      "comparisonAlignmentForNode",
    )

    assert_in_order apply,
      "ensureRendererModel(comparison.architectureId)",
      "comparisonOrientationFor(",
      "createComparisonBoardRenderer({",
      'surfaceKey: `comparison-${comparison.architectureId}-${comparison.boardId}`',
      'alignmentIndex: activeAlignment("comparison")',
      "await comparisonBoardRenderer.render();",
      "applyPrimaryComparisonDecorations();"
    assert_includes @comparison_renderer, "const surface = createBoardSurface({"
    assert_includes @comparison_renderer, "surfaceResourceId(surfaceKey"
    assert_includes @comparison_renderer, "surfaceResourceUrl(surfaceKey"
    assert_includes @comparison_renderer,
      "alignmentForNode(renderedNode, currentAlignmentIndex)"
  end

  def test_one_inspector_selection_moves_between_primary_and_counterpart
    counterpart = function_source(@renderer, "focusComparisonNode", "focusComparisonEdge")
    primary = function_source(@renderer, "setSelection", "announceSelection")

    assert_in_order counterpart,
      "state.selection = null",
      "clearActiveNodes();",
      "comparisonBoardRenderer?.selectNode(node.id)",
      "setComparisonSelection(state.comparisonState",
      'side: "comparison"',
      'syncDeepLinkHistory({ mode: "replace" })'
    assert_in_order primary,
      "state.selection = createWorkspaceSelection",
      "setComparisonSelection(state.comparisonState",
      'side: "primary"',
      "comparisonBoardRenderer?.clearSelection();",
      "syncDeepLinkHistory();"
  end

  def test_static_url_history_restores_both_locations_and_switch_cleanup
    canonical = function_source(@renderer, "canonicalDeepLinkSearch", "deepLinkLocation")
    popstate = function_source(@renderer, "onDeepLinkPopState", "deepLinkTargetLabel")

    assert_includes canonical, "writeComparisonLink(window.location.search"
    assert_includes canonical, "primary: location.primary"
    assert_includes canonical, "comparison: location.comparison"
    assert_includes canonical, "selectionSide: location.selectionSide"
    assert_in_order popstate,
      'params.get("compare_arch")',
      "ensureRendererModel(requestedCompareArch)",
      "resolveCurrentComparisonState()",
      "resolveDeepLink({",
      "applyResolvedDeepLink(resolved",
      "applyComparisonResolvedState(comparisonResolved"

    switch = @renderer[/switcher\.addEventListener\("change".*?^    \}\);/m]
    refute_nil switch
    assert_in_order switch,
      'params.delete("board")',
      'params.delete("node")',
      'params.delete("compare_arch")',
      'params.delete("compare_board")',
      'params.delete("compare_node")'
  end

  def test_close_swap_and_fit_both_preserve_history_and_separate_viewports
    close = function_source(@renderer, "onComparisonCloseClick", "onComparisonSwapClick")
    swap = function_source(@renderer, "onComparisonSwapClick", "onComparisonFitBothClick")
    fit = function_source(@renderer, "onComparisonFitBothClick", "onComparisonWorkspaceClick")

    assert_in_order close,
      "comparison: null",
      "teardownComparisonWorkspace();",
      'syncDeepLinkHistory({ mode: "push" })'
    assert_in_order swap,
      "writeComparisonLink(window.location.search",
      "primary:",
      "comparison:",
      'applyComparisonResolvedState(combined, { historyMode: "push" })'
    assert_includes fit, "fitToContent({ readable: false })"
    assert_includes fit, "comparisonBoardRenderer?.surface.fit()"
  end

  private

  def function_source(source, name, following_name)
    body = source[/function #{Regexp.escape(name)}\b.*?(?=^(?:async )?function #{Regexp.escape(following_name)}\b)/m]
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

  def read(relative)
    File.read(File.join(ROOT, relative), encoding: "UTF-8")
  end
end
