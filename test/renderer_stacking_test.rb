# frozen_string_literal: true

require "minitest/autorun"

class RendererStackingTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @html = File.binread(File.join(ROOT, "renderer/architecture/index.html"))
    @renderer = File.binread(File.join(ROOT, "renderer/architecture/renderer.js"))
    @styles = File.binread(File.join(ROOT, "styles.css"))
  end

  def test_board_uses_explicit_background_wire_and_node_layers
    canvas_rule = css_rule("architecture-canvas")
    region_rule = css_rule("board-region-layer")
    lane_rule = css_rule("representation-lane-layer")
    edge_rule = css_rule("edge-layer")
    module_rule = css_rule("module-layer")

    assert_includes canvas_rule, "isolation: isolate"
    assert_includes canvas_rule, "--board-layer-regions: 1"
    assert_includes canvas_rule, "--board-layer-representation-lanes: 2"
    assert_includes canvas_rule, "--board-layer-wires: 3"
    assert_includes canvas_rule, "--board-layer-nodes: 4"
    assert_includes region_rule, "z-index: var(--board-layer-regions)"
    assert_includes lane_rule, "z-index: var(--board-layer-representation-lanes)"
    assert_includes edge_rule, "z-index: var(--board-layer-wires)"
    assert_includes module_rule, "z-index: var(--board-layer-nodes)"
    assert_includes module_rule, "pointer-events: none"
    assert_includes @styles[/\.arch-node,\s*\.arch-rep\s*\{[^}]*}/m], "pointer-events: auto"

    lane_position = @html.index('id="representationLaneLayer"')
    region_position = @html.index('id="boardRegionLayer"')
    module_position = @html.index('id="moduleLayer"')
    edge_position = @html.index('id="edgeLayer"')
    refute_nil lane_position
    refute_nil region_position
    refute_nil module_position
    refute_nil edge_position
    assert_operator region_position, :<, lane_position
    assert_operator lane_position, :<, module_position
    assert_operator module_position, :<, edge_position
  end

  def test_representation_lanes_share_grid_and_viewport_but_not_the_node_stack
    render_lanes = @renderer[/function renderScaleLanes\b.*?(?=^let elkInstance)/m]
    viewport = @renderer[/function flushViewport\b.*?^}/m]
    grid_sizing = @renderer[/function applyGridColumnSizing\b.*?^}/m]

    assert_includes render_lanes, "elements.representationLaneLayer.appendChild(guide)"
    refute_includes render_lanes, "elements.moduleLayer.appendChild(guide)"
    assert_includes viewport, "elements.representationLaneLayer.style.transform = transform"
    assert_includes viewport, "elements.regionLayer.style.transform = transform"
    assert_includes grid_sizing, "elements.representationLaneLayer"
  end

  def test_all_wire_paths_paint_before_labels_and_hit_targets
    render_edges = @renderer[/function renderEdges\b.*?(?=^function renderBoardRegions)/m]

    refute_nil render_edges
    assert_operator render_edges.index('class", "arch-edge-paths"'), :<,
      render_edges.index('class", "arch-edge-annotations"')
    assert_operator render_edges.index('class", "arch-edge-annotations"'), :<,
      render_edges.index('class", "arch-edge-hits"')
    assert_includes render_edges, "pathLayer.appendChild(path)"
    assert_includes render_edges, "annotationLayer.appendChild(label)"
    assert_includes render_edges, "annotationLayer.appendChild(badge)"
    assert_includes render_edges, "hitLayer.appendChild(renderEdgeHitTarget"
  end

  def test_edge_annotation_placement_is_collision_aware_and_part_of_content_bounds
    render_edges = @renderer[/function renderEdges\b.*?(?=^function renderBoardRegions)/m]
    content_bounds = @renderer[/function boardContentBounds\b.*?(?=^function fitToContent)/m]

    refute_nil render_edges
    refute_nil content_bounds
    assert_includes @renderer, 'from "./edge-annotations.mjs"'

    occupied_start = render_edges.index("const occupiedAnnotationBoxes = []")
    placement = render_edges.index("const annotationPlacement = placeEdgeAnnotation({")
    occupied_input = render_edges.index("occupied: occupiedAnnotationBoxes", placement)
    occupied_push = render_edges.index("occupiedAnnotationBoxes.push(annotationBox)", placement)
    occupied_store = render_edges.index("state.edgeAnnotationBoxes = occupiedAnnotationBoxes", occupied_push)

    refute_nil occupied_start
    refute_nil placement
    refute_nil occupied_input
    refute_nil occupied_push
    refute_nil occupied_store
    assert_operator occupied_start, :<, placement
    assert_operator placement, :<, occupied_input
    assert_operator occupied_input, :<, occupied_push
    assert_operator occupied_push, :<, occupied_store

    assert_includes content_bounds, "for (const box of state.edgeAnnotationBoxes || [])"
    assert_includes content_bounds, "minX = Math.min(minX, box.x)"
    assert_includes content_bounds, "minY = Math.min(minY, box.y)"
    assert_includes content_bounds, "maxX = Math.max(maxX, box.x + box.width)"
    assert_includes content_bounds, "maxY = Math.max(maxY, box.y + box.height)"
  end

  def test_clear_facing_corridors_are_preferred_before_general_route_scoring
    choose = @renderer[/function chooseRoutePlan\b.*?(?=^function opposingPortsAreCrossed)/m]
    spread = @renderer[/function spreadDockPoints\b.*?(?=^function dockWithinSide)/m]

    assert_includes choose, "clearFacingPortPlan(fromBox, toBox, obstacles)"
    assert_operator choose.index("if (clearFacing)"), :<, choose.index("let bestPlan")
    assert_includes choose, "preserveFacingDocks: true"
    assert_includes spread, "entries.length === 1 && entries[0].plan.preserveFacingDocks"
  end

  private

  def css_rule(class_name)
    rule = @styles[/^\.#{Regexp.escape(class_name)}\s*\{[^}]*}/m]
    refute_nil rule, "missing .#{class_name} rule"
    rule
  end
end
