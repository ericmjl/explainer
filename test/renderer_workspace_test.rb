# frozen_string_literal: true

require "minitest/autorun"

class RendererWorkspaceTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_audience_workspace_has_one_canvas_first_navigation_and_stable_inspector
    html = read("renderer/architecture/index.html")

    assert_equal 1, html.scan('id="boardNavigation"').length
    assert_operator html.index('id="architectureCanvas"'), :<, html.index('id="workspaceInspector"')
    assert_includes html, 'id="canvasTooltip"'
    refute_includes html, "focusPreview"
  end

  def test_published_reference_figures_render_in_cited_non_panning_side_panels
    html = read("renderer/architecture/index.html")
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")

    assert_includes html, 'id="referencePanelLayer"'
    assert_includes html, 'class="reference-panel-layer board-chrome"'
    assert_includes html, 'id="referenceFigureDialog"'
    assert_includes html, 'id="referenceFigureControls"'
    assert_includes renderer, "function renderReferencePanels(board)"
    assert_includes renderer, "function openReferenceFigure(panel)"
    assert_includes renderer, "function setReferenceFigureScale(nextScale, anchor = null)"
    assert_includes renderer, "bibliographySource(panel.source_ref)"
    assert_includes renderer, 'image.loading = "eager"'
    assert_includes renderer, 'imageButton.setAttribute("aria-label", `Zoom into reference figure:'
    assert_includes renderer, 'classList.toggle("has-reference-panels"'
    assert_match(/\.reference-panel-layer\s*\{[^}]*position:\s*absolute/m, css)
    assert_match(/\.reference-figure-dialog\s*\{[^}]*height:\s*min\(/m, css)
    refute_match(/referencePanelLayer\.style\.transform/, renderer)
  end

  def test_structured_feature_bundles_render_as_selectable_field_tables
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")

    assert_includes renderer, "function renderRepresentationFieldTable(rep)"
    assert_includes renderer, "function representationFieldLegendMarkup(groups)"
    assert_includes renderer, "Feature bundle contents"
    assert_includes renderer, 'card.classList.add("has-field-table")'
    assert_includes renderer, 'kind === "scalar" || kind === "dictionary"'
    assert_includes renderer, "fieldGroups.reduce"
    assert_includes renderer, "renderRepresentationFieldTable(rep)"
    assert_includes css, ".representation-field-table"
    assert_includes css, ".arch-rep.has-field-table::after"
    assert_includes css, ".arch-rep.tensor-dictionary"
  end

  def test_audience_surfaces_do_not_offer_yaml_downloads
    landing = read("index.html")
    html = read("renderer/architecture/index.html")
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")

    refute_match(/href=["'][^"']+\.ya?ml(?:[?#][^"']*)?["']/i, landing)
    refute_includes landing, "Source registry"
    refute_includes html, "archSourceLink"
    refute_includes html, "View source"
    assert_includes renderer, "function audienceHref(value)"
    assert_includes renderer, '/\.ya?ml$/i.test(path) ? null : href'
    assert_includes renderer, "const href = audienceHref(source?.href || source?.url || ref.path)"
    assert_includes renderer, "const href = audienceHref(rawHref)"
    refute_includes renderer, "Open pseudocode YAML"
    refute_includes css, ".renderer-source-link"
  end

  def test_implementation_evidence_has_a_friendlier_audience_label
    renderer = read("renderer/architecture/renderer.js")

    assert_includes renderer, "function citationRoleLabel(role)"
    assert_includes renderer,
      '.replace(/implementation_evidence$/, "implementation_reference")'
    assert_includes renderer, "const role = citationRoleLabel(ref.role)"
  end

  def test_renderer_uses_one_canonical_selection_and_no_retired_parallel_states
    renderer = read("renderer/architecture/renderer.js")

    assert_includes renderer, "selection: null"
    assert_includes renderer, 'dataset.canonicalRef'
    assert_includes renderer, 'architecture-selection-change'
    refute_match(/state\.(focusedId|pinnedEdge|questionTarget)/, renderer)
    refute_match(/InspectorPreview|InspectorPreviews/, renderer)
  end

  def test_unmodified_wheel_zooms_around_the_pointer
    renderer = read("renderer/architecture/renderer.js")
    html = read("renderer/architecture/index.html")
    wheel = function_source(renderer, "onCanvasWheel", "onCanvasPointerDown")

    assert_includes renderer,
      'elements.canvas.addEventListener("wheel", onCanvasWheel, { passive: false })'
    assert_includes wheel, "event.preventDefault()"
    assert_includes wheel, "zoomAt(event.clientX, event.clientY, factor)"
    refute_includes wheel, "event.ctrlKey"
    refute_includes wheel, "event.metaKey"
    refute_includes wheel, "viewport.x -= event.deltaX"
    refute_includes wheel, "viewport.y -= event.deltaY"

    assert_includes html, "Pinch with two fingers on a touchscreen"
    refute_includes html, "Control or Command"
  end

  def test_touchscreen_pinch_zooms_both_board_surfaces
    renderer = read("renderer/architecture/renderer.js")
    surface = read("renderer/architecture/board-surface.mjs")

    assert_includes renderer, 'event.pointerType === "touch"'
    assert_includes renderer, "beginCanvasPinch(event)"
    assert_includes renderer, "pinchViewportBetween("
    assert_includes surface, "export function pinchViewportBetween("
    assert_includes surface, 'kind: "pinch"'
    assert_includes surface, "current.distance / start.distance"
  end

  def test_node_hover_traces_connectivity_without_opening_a_duplicate_preview
    renderer = read("renderer/architecture/renderer.js")
    representation = function_source(renderer, "renderRepresentationNode", "representationDisplayMeaning")
    block = function_source(renderer, "renderBlockNode", "placeNode")

    assert_includes representation, 'card.addEventListener("pointerenter"'
    assert_includes representation,
      "beginConnectivityHighlight(pointerHighlightKey, node.id, { dimUnrelated: true })"
    assert_includes representation, "endConnectivityHighlight(pointerHighlightKey)"
    assert_includes representation, 'card.addEventListener("focus"'
    assert_includes representation, "beginConnectivityHighlight(focusHighlightKey, node.id)"
    assert_includes representation, "focusRepresentation(node, rep)"

    assert_includes block, 'card.addEventListener("mouseenter"'
    assert_includes block,
      "beginConnectivityHighlight(pointerHighlightKey, node.id, { dimUnrelated: true })"
    assert_includes block, "endConnectivityHighlight(pointerHighlightKey)"
    assert_includes block, 'card.addEventListener("focusin"'
    assert_includes block, "beginConnectivityHighlight(focusHighlightKey, node.id)"
    assert_includes block, "focusModule(module, node)"
    assert_includes block, "focusOperation(node)"

    [representation, block].each do |source|
      refute_match(/show(?:Node|Rep)Peek|showCanvasTooltip|showHoverPanel/, source)
    end
    refute_match(/function (?:showNodePeek|showRepPeek|repTooltipHtml|showHoverPanel|hideHoverPanel)\b/, renderer)
  end

  def test_inspector_has_a_persistent_accessible_collapse_control
    html = read("renderer/architecture/index.html")
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")

    assert_includes html, 'id="focusCollapse"'
    assert_includes html, 'aria-controls="focusPanelPages"'
    assert_includes html, 'aria-expanded="true"'
    assert_includes html, 'id="focusPanelPages" class="focus-panel-pages"'
    assert_includes renderer, "function ensureInspectorCollapse()"
    assert_includes renderer, "function setInspectorCollapsed(collapsed"
    assert_includes renderer, 'window.sessionStorage.getItem(INSPECTOR_COLLAPSED_STORAGE_KEY)'
    assert_includes renderer, 'classList.toggle("is-inspector-collapsed"'
    assert_includes css, ".renderer-page.is-inspector-collapsed .renderer-grid"
    assert_includes css, ".renderer-page.is-inspector-collapsed .focus-panel-header"
  end

  def test_selected_nodes_have_a_distinct_persistent_locator
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")

    assert_includes renderer, 'classList.add("is-focused", "is-selected-node")'
    assert_includes renderer, 'classList.remove("is-focused", "is-selected-node")'
    assert_includes css, ".arch-node.is-selected-node"
    assert_includes css, ".arch-rep.is-selected-node"
    assert_includes css, "outline: 3px solid"
    assert_includes css, "@keyframes architecture-selection-arrival"
    assert_match(/\.arch-node\.is-selected-node,[^{]+\{[^}]*z-index:\s*7/m, css)
  end

  def test_keyboard_zoom_uses_one_incremental_step_toward_the_selection
    renderer = read("renderer/architecture/renderer.js")
    zoom = function_source(renderer, "zoomToSelection", "questionBreadcrumbs")

    assert_includes renderer, "nextKeyboardZoomScale"
    assert_includes zoom, "viewport.scale = nextKeyboardZoomScale("
    assert_includes zoom, "viewport.x = availableW / 2 - box.cx * viewport.scale"
    refute_includes zoom, "const fill = 0.7"
  end

  def test_keyboard_navigation_bootstraps_from_the_first_visible_occurrence
    renderer = read("renderer/architecture/renderer.js")
    navigate = function_source(renderer, "navigateAlong", "openNavMenu")

    assert_includes navigate, "focusFirstVisibleOccurrence();"
    assert_includes navigate, "const first = visibleNodes(currentBoard())[0];"
    assert_includes navigate, "focusNodeOccurrence(first.id, { moveDomFocus: true })"
    assert_includes navigate, "centerOnNode(first.id);"
  end

  def test_keyboard_navigation_transfers_dom_focus_to_the_selected_occurrence
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")
    navigate = function_source(renderer, "navigateAlong", "openNavMenu")
    focus = function_source(renderer, "focusRenderedNodeOccurrence", "resetFocusedDetail")

    assert_includes navigate, "focusNodeOccurrence(candidates[0], { moveDomFocus: true })"
    assert_includes renderer, "focusNodeOccurrence(id, { moveDomFocus: true })"
    assert_includes focus, 'occurrence?.matches("button")'
    assert_includes focus, 'occurrence?.querySelector(".arch-node-main")'
    assert_includes focus, "focusTarget?.focus({ preventScroll: true })"
    assert_includes css, ".arch-node.is-selected-node .arch-node-main:focus-visible"
  end

  def test_programmatic_canvas_focus_does_not_draw_a_viewport_sized_ring
    css = read("styles.css")

    assert_match(/\.architecture-canvas:focus\s*\{[^}]*outline:\s*none/m, css)
    refute_match(/\.architecture-canvas:focus-visible\s*\{[^}]*outline:\s*3px/m, css)
  end

  def test_enter_and_escape_traverse_semantic_board_levels
    renderer = read("renderer/architecture/renderer.js")
    dispatch = function_source(renderer, "onCanvasKeyDown", "currentBoardSelectionNodeId")
    enter = function_source(renderer, "enterSelectedBoard", "exitToParentBoard")
    exit_board = function_source(renderer, "exitToParentBoard", "navigateAlong")

    assert_includes dispatch, 'case "board-enter"'
    assert_includes dispatch, 'case "board-exit"'
    assert_includes enter, "targetBoardForNode(node)"
    assert_includes enter, "pushBoard(targetBoard.id, node.id);"
    assert_includes exit_board, "state.boardStack.length <= 1"
    assert_includes exit_board, "popToBoard(state.boardStack.length - 2);"
  end

  def test_drilldown_uses_a_compact_accessible_magnifying_button
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")
    block = function_source(renderer, "renderBlockNode", "placeNode")

    assert_includes renderer, "function magnifyIconMarkup()"
    assert_includes renderer, 'class="arch-drill-icon"'
    assert_includes block, 'setAttribute("aria-label", `Zoom into ${targetBoard.title}`)'
    assert_includes block, 'drillButton.title = `Zoom into ${targetBoard.title}`'
    assert_includes block, "drillButton.innerHTML = magnifyIconMarkup()"
    refute_includes renderer, "Open detail"
    assert_includes css, ".arch-drill-icon"
    assert_match(/\.arch-drill-cue\s*\{[^}]*width:\s*30px[^}]*height:\s*30px/m, css)
  end

  def test_edges_keep_transient_previews_and_pin_details_on_activation
    renderer = read("renderer/architecture/renderer.js")
    edge_target = function_source(renderer, "renderEdgeHitTarget", "applyEdgeTone")
    show_connection = function_source(renderer, "showConnection", "connectionInspectorHtml")

    assert_includes edge_target,
      'hit.addEventListener("mouseenter", (event) => showConnection(edge, pointerPreviewKey, event.currentTarget))'
    assert_includes edge_target,
      'hit.addEventListener("mouseleave", () => hideConnection(false, pointerPreviewKey))'
    assert_includes edge_target,
      'hit.addEventListener("focus", (event) => showConnection(edge, focusPreviewKey, event.currentTarget))'
    assert_includes edge_target,
      'hit.addEventListener("blur", () => hideConnection(false, focusPreviewKey))'
    assert_includes edge_target, "focusConnection(edge)"
    assert_includes show_connection, "showCanvasTooltip(previewSourceKey"
  end

  def test_workspace_css_has_touch_safe_canvas_and_no_retired_floating_navigation
    css = read("styles.css")

    assert_includes css, ".board-navigation"
    assert_includes css, ".canvas-tooltip"
    assert_match(/\.architecture-canvas\s*\{[^}]*touch-action:\s*none/m, css)
    refute_includes css, ".canvas-context-rail"
    refute_includes css, ".semantic-location-step"
  end

  def test_renderer_reports_module_startup_failures_instead_of_staying_blank
    html = read("renderer/architecture/index.html")
    renderer = read("renderer/architecture/renderer.js")
    css = read("styles.css")

    assert_includes html, 'id="rendererStartupError"'
    assert_includes html, 'id="rendererStartupErrorDetail"'
    assert_includes html, 'window.addEventListener("unhandledrejection"'
    assert_includes html, "The module graph did not finish loading."
    assert_includes renderer, "window.__architectureRendererBoot?.ready?.()"
    assert_includes css, ".renderer-startup-error"
  end

  def test_review_workspace_is_separate_and_submits_only_typed_plans
    html = read("review/index.html")
    script = read("review/review.js")
    model = read("review/review-model.mjs")

    assert_includes html, 'id="audienceFrame"'
    assert_includes html, 'id="previewChanges"'
    assert_includes model, 'schema_version: "architecture-edit-v0.2"'
    assert_includes script, '"../api/review/preview"'
    assert_includes script, '"../api/review/apply"'
    refute_match(/filesystem|file_path|yaml_path/i, script)
  end

  private

  def function_source(source, name, following_name)
    body = source[/function #{Regexp.escape(name)}\b.*?(?=^function #{Regexp.escape(following_name)}\b)/m]
    refute_nil body, "expected #{name} before #{following_name}"
    body
  end

  def read(relative)
    File.binread(File.join(ROOT, relative))
  end
end
