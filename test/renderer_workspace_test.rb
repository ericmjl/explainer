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

    assert_includes html, "Use a two-finger scroll or mouse wheel to zoom around the pointer."
    refute_includes html, "Control or Command"
  end

  def test_node_hover_traces_connectivity_without_opening_a_duplicate_preview
    renderer = read("renderer/architecture/renderer.js")
    representation = function_source(renderer, "renderRepresentationNode", "representationDisplayMeaning")
    block = function_source(renderer, "renderBlockNode", "placeNode")

    assert_includes representation, 'card.addEventListener("pointerenter"'
    assert_includes representation, "beginConnectivityHighlight(pointerHighlightKey, node.id)"
    assert_includes representation, "endConnectivityHighlight(pointerHighlightKey)"
    assert_includes representation, 'card.addEventListener("focus"'
    assert_includes representation, "beginConnectivityHighlight(focusHighlightKey, node.id)"
    assert_includes representation, "focusRepresentation(node, rep)"

    assert_includes block, 'card.addEventListener("mouseenter"'
    assert_includes block, "beginConnectivityHighlight(pointerHighlightKey, node.id)"
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
