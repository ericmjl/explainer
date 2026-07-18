# frozen_string_literal: true

require "minitest/autorun"

class RendererSnappinessTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @renderer = File.binread(File.join(ROOT, "renderer/architecture/renderer.js"))
    @styles = File.binread(File.join(ROOT, "styles.css"))
  end

  def test_semantic_navigation_is_one_short_render_first_transition
    assert_includes @renderer, "transitionMs: 200"
    refute_includes @renderer, "animateDiveIn"
    refute_includes @renderer, "animateFadeOut"

    push_board = @renderer[/function pushBoard\b.*?^}/m]
    refute_nil push_board
    assert_operator push_board.index("renderBoard();"), :<, push_board.index("animateArriveFrom(null);")
  end

  def test_selection_and_math_ready_do_not_rebuild_the_board_chrome
    focus_body = @renderer[/function setFocusBody\b.*?^}/m]
    math_ready = @renderer[/window\.addEventListener\("mathjax-ready".*?^\}\);/m]

    refute_includes focus_body, "renderModelMap"
    assert_includes math_ready, "refreshBoardAfterMath();"
    refute_includes math_ready, "renderBoard();"
    assert_includes @renderer,
      "if (state.modelMapCollapsed || modelMap.offsetParent === null)"
  end

  def test_viewport_and_resize_work_is_frame_coalesced
    assert_includes @renderer, "viewportFrame = window.requestAnimationFrame(flushViewport)"
    assert_includes @renderer, "zoomPercent !== renderedZoomPercent"
    assert_includes @renderer, "geometryFrame = window.requestAnimationFrame(flushGeometryUpdate)"

    wheel = @renderer[/function onCanvasWheel\b.*?(?=^function onCanvasPointerDown\b)/m]
    zoom_at = @renderer[/function zoomAt\b.*?(?=^function resetViewport\b)/m]
    refute_nil wheel
    refute_nil zoom_at
    assert_includes wheel, "zoomAt(event.clientX, event.clientY, factor)"
    assert_includes zoom_at, "applyViewport();"

    responsive_geometry = @renderer[/function refreshResponsiveGeometry\b.*?^}/m]
    assert_includes responsive_geometry, "scheduleGeometryUpdate"
    refute_includes responsive_geometry, "renderEdges();"
    assert_includes @renderer, 'new ResizeObserver(([entry]) => {'
  end

  def test_board_arrival_fits_every_visible_node_before_optional_zooming
    fit = @renderer[/function fitToContent\b.*?^}/m]

    refute_nil fit
    assert_includes fit, "readable = false"
    assert_includes fit, "requestedScale = readable ? Math.max(exactFit, readableFloor) : exactFit"
  end

  def test_moving_renderer_chrome_does_not_use_backdrop_blur
    %w[board-navigation model-map].each do |class_name|
      rule = @styles[/\.#{class_name}\s*\{[^}]*}/m]
      refute_nil rule
      refute_includes rule, "backdrop-filter"
    end
    focus_rule = @styles[/\.renderer-page \.focus-panel\s*\{[^}]*}/m]
    refute_includes focus_rule, "backdrop-filter"
  end
end
