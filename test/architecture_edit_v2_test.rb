# frozen_string_literal: true

require "fileutils"
require "minitest/autorun"
require "psych"
require "tmpdir"
require_relative "../lib/architecture_edit"

class ArchitectureEditV2Test < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  ARCHITECTURE_PATH = "architectures/generic-feature-refinement.yaml"
  VIEW_PATH = "views/generic-semantic-zoom.view.yaml"

  def setup
    @temporary_root = Dir.mktmpdir("architecture-edit-v2-test-")
    copy("architectures/index.yaml")
    copy(ARCHITECTURE_PATH)
    copy(VIEW_PATH)
    @compiler = ArchitectureEdit::Compiler.new(root: @temporary_root)
  end

  def teardown
    FileUtils.remove_entry(@temporary_root) if @temporary_root && File.exist?(@temporary_root)
  end

  def test_updates_board_and_occurrence_copy_with_a_source_local_semantic_diff
    old_summary = root_board.fetch("summary")
    new_summary = "Follow state refinement from request records to task predictions."
    new_detail = "The adapter embeds request fields and initializes the state used by later blocks."
    plan = edit_plan(
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline",
        "expect" => { "summary" => old_summary },
        "set" => { "summary" => new_summary },
      },
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline.nodes.input_adapter",
        "expect" => { "detail" => nil },
        "set" => { "detail" => new_detail },
      },
    )
    source_path = absolute(VIEW_PATH)
    before = File.binread(source_path)
    sibling_offset = before.index("\n  - id: item_encoder\n    title:") + 1
    untouched_tail = before[sibling_offset..]

    result = @compiler.compile(plan, build_manifests: false)

    assert_equal before, File.binread(source_path), "preview changed the canonical view"
    assert_equal [VIEW_PATH], result.files
    candidate = parse(result.source_contents.fetch(VIEW_PATH))
    board = candidate.fetch("boards").find { |item| item["id"] == "refinement_pipeline" }
    node = board.fetch("nodes").find { |item| item["id"] == "input_adapter" }
    assert_equal new_summary, board.fetch("summary")
    assert_equal new_detail, node.fetch("detail")
    candidate_source = result.source_contents.fetch(VIEW_PATH)
    candidate_sibling_offset = candidate_source.index("\n  - id: item_encoder\n    title:") + 1
    assert_equal untouched_tail, candidate_source[candidate_sibling_offset..]

    assert_equal ["summary", "detail"], result.changes.map { |change| change.fetch("field") }
    assert_equal [
      "boards.refinement_pipeline",
      "boards.refinement_pipeline.nodes.input_adapter",
    ], result.changes.map { |change| change.fetch("entity_ref") }
    assert_includes result.to_text, "~ boards.refinement_pipeline.summary:"
    assert_includes result.to_text, "~ boards.refinement_pipeline.nodes.input_adapter.detail:"
  end

  def test_view_update_precondition_fails_without_source_mutation
    before = File.binread(absolute(VIEW_PATH))
    plan = edit_plan(
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline",
        "expect" => { "summary" => "A stale summary" },
        "set" => { "summary" => "A replacement that must not apply" },
      },
    )

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "precondition_failed", error.code
    assert_includes error.message, "boards.refinement_pipeline.summary expected"
    assert_equal before, File.binread(absolute(VIEW_PATH))
  end

  def test_sets_label_and_complete_connection_without_dropping_other_presentation
    match = { "relation_ref" => "relations.input_adapter_initializes_conditioning_signal" }
    new_connection = {
      "title" => "Adapter prepares conditioning",
      "role" => "read-only modulation input",
      "inside" => "The encoder projects this signal to shift, scale, and gate terms.",
    }
    plan = edit_plan(
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => match,
        "expect" => { "label" => "cond" },
        "set" => { "label" => "conditioning", "connection" => new_connection },
      },
    )

    result = @compiler.compile(plan, build_manifests: false)

    board = result.view.fetch("boards").find { |item| item["id"] == "refinement_pipeline" }
    override = board.fetch("edge_overrides").find { |item| item["match"] == match }
    assert_equal "conditioning", override.fetch("label")
    assert_equal new_connection, override.fetch("connection")
    assert_equal "conditioning", override.fetch("tone"), "unmentioned presentation was dropped"
    assert_equal ["label", "connection"], result.changes.map { |change| change.fetch("field") }
    assert_includes result.to_text,
      "~ boards.refinement_pipeline.edge_overrides.relations.input_adapter_initializes_conditioning_signal.label:"
  end

  def test_removes_one_exact_edge_override_with_a_precondition
    match = { "relation_ref" => "relations.raw_records_enter_input_adapter" }
    plan = edit_plan(
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => match,
        "expect" => { "label" => "fields" },
        "remove" => true,
      },
    )

    result = @compiler.compile(plan, build_manifests: false)

    board = result.view.fetch("boards").find { |item| item["id"] == "refinement_pipeline" }
    refute board.fetch("edge_overrides").any? { |item| item["match"] == match }
    change = result.changes.fetch(0)
    assert_equal "remove", change.fetch("action")
    assert_equal "fields", change.fetch("before").fetch("label")
    assert_includes result.to_text,
      "- boards.refinement_pipeline.edge_overrides.relations.raw_records_enter_input_adapter"
  end

  def test_relation_path_identifies_a_contracted_edge_override
    relation_path = [
      "relations.input_adapter_produces_item_to_group_index",
      "relations.item_to_group_index_guides_context_builder",
    ]
    plan = edit_plan(
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => { "relation_path" => relation_path },
        "expect" => { "label" => "grouping index" },
        "set" => { "label" => "group assignment" },
      },
    )

    result = @compiler.compile(plan, build_manifests: false)

    board = result.view.fetch("boards").find { |item| item["id"] == "refinement_pipeline" }
    override = board.fetch("edge_overrides").find do |item|
      item.dig("match", "relation_path") == relation_path
    end
    assert_equal "group assignment", override.fetch("label")
    assert_includes result.changes.fetch(0).fetch("entity_ref"), "path["
  end

  def test_visibility_change_is_atomic_when_incident_overrides_are_removed_in_the_same_plan
    plan = edit_plan(
      remove_override("relations.input_adapter_initializes_conditioning_signal", "cond"),
      remove_override("relations.conditioning_signal_modulates_item_adaln", "cond"),
      {
        "op" => "set_board_visibility",
        "board_id" => "refinement_pipeline",
        "occurrence_id" => "conditioning_signal",
        "ref" => "value_sites.conditioning_signal",
        "decision" => "excluded",
        "reason" => "This review follows the mutable state path and omits optional conditioning.",
      },
    )

    result = @compiler.compile(plan, build_manifests: false)

    board = result.view.fetch("boards").find { |item| item["id"] == "refinement_pipeline" }
    refute board.fetch("nodes").any? { |node| node["id"] == "conditioning_signal" }
    assert_includes board.fetch("exclude"), {
      "ref" => "value_sites.conditioning_signal",
      "reason" => "This review follows the mutable state path and omits optional conditioning.",
    }
    assert_equal ["remove", "remove", "remove", "add"], result.changes.map { |change| change.fetch("action") }
    assert_includes result.to_text, "- boards.refinement_pipeline.nodes.conditioning_signal"
    assert_includes result.to_text, "+ boards.refinement_pipeline.exclude.value_sites.conditioning_signal"
  end

  def test_visibility_ref_is_an_occurrence_precondition
    before = File.binread(absolute(VIEW_PATH))
    plan = edit_plan(
      {
        "op" => "set_board_visibility",
        "board_id" => "refinement_pipeline",
        "occurrence_id" => "conditioning_signal",
        "ref" => "modules.context_builder",
        "decision" => "excluded",
        "reason" => "Exercise the ref precondition.",
      },
    )

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "precondition_failed", error.code
    assert_includes error.message, "found \"value_sites.conditioning_signal\""
    assert_equal before, File.binread(absolute(VIEW_PATH))
  end

  def test_visibility_rejects_a_drilldown_occurrence
    plan = edit_plan(
      {
        "op" => "set_board_visibility",
        "board_id" => "refinement_pipeline",
        "occurrence_id" => "item_encoder",
        "ref" => "modules.item_encoder",
        "decision" => "elided",
      },
    )

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "drilldown_visibility_change", error.code
    assert_includes error.message, "opens item_encoder"
  end

  def test_invalid_elision_is_rejected_by_projection_validation
    view = parse(File.binread(absolute(VIEW_PATH)))
    root = view.fetch("boards").find { |board| board["id"] == "refinement_pipeline" }
    root.fetch("nodes").find { |node| node["id"] == "item_encoder" }.delete("board_ref")
    view.fetch("boards").reject! { |board| board["id"] == "item_encoder" }
    File.binwrite(absolute(VIEW_PATH), Psych.dump(view, line_width: -1))

    plan = edit_plan(
      {
        "op" => "set_board_visibility",
        "board_id" => "refinement_pipeline",
        "occurrence_id" => "item_encoder",
        "ref" => "modules.item_encoder",
        "decision" => "elided",
      },
    )

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "ambiguous_elision", error.code
    assert_includes error.message, "multiple incoming and outgoing boundaries"
  end

  def test_layout_board_reflows_only_declarative_positions_through_the_reviewed_edit_path
    before_source = File.binread(absolute(VIEW_PATH))
    view = parse(before_source)
    configured_board = view.fetch("boards").find { |board| board["id"] == "refinement_pipeline" }
    configured_board.fetch("grid")["row_sizing"] = "content"
    configured_board.fetch("grid")["row_gap"] = 26
    File.binwrite(absolute(VIEW_PATH), Psych.dump(view, line_width: -1))
    before_source = File.binread(absolute(VIEW_PATH))
    original_board = root_board
    plan = edit_plan(
      {
        "op" => "layout_board",
        "board_id" => "refinement_pipeline",
        "policy" => "semantic_flow_v1",
      },
    )

    result = @compiler.compile(plan, build_manifests: false)

    laid_out = result.view.fetch("boards").find { |board| board["id"] == "refinement_pipeline" }
    refute_equal original_board.fetch("grid"), laid_out.fetch("grid")
    assert_equal "content", laid_out.dig("grid", "row_sizing")
    assert_equal 26, laid_out.dig("grid", "row_gap")
    assert_equal original_board.fetch("nodes").map { |node| node["id"] },
      laid_out.fetch("nodes").map { |node| node["id"] }
    original_without_layout = strip_layout(original_board)
    laid_out_without_layout = strip_layout(laid_out)
    assert_equal original_without_layout, laid_out_without_layout
    assert_equal "layout", result.changes.fetch(0).fetch("field")
    text = result.to_text
    laid_out.fetch("nodes").each do |node|
      original = original_board.fetch("nodes").find { |candidate| candidate["id"] == node.fetch("id") }
      next if [original.fetch("col"), original.fetch("row")] == [node.fetch("col"), node.fetch("row")]

      assert_includes text, "boards.refinement_pipeline.nodes.#{node.fetch('id')}.position"
      assert_includes text, "(#{node.fetch('col')},#{node.fetch('row')})"
    end
    diagnostic = result.diagnostics.find { |item| item["code"] == "semantic_layout" }
    assert_equal "semantic_flow_v1", diagnostic.fetch("policy")
    assert_equal before_source, File.binread(absolute(VIEW_PATH)),
      "compile unexpectedly mutated the canonical view"
  end

  def test_layout_board_rejects_typed_representation_lanes_before_reflow
    add_item_state_lane(row: 3)
    before_source = File.binread(absolute(VIEW_PATH))
    plan = edit_plan(
      {
        "op" => "layout_board",
        "board_id" => "refinement_pipeline",
        "policy" => "semantic_flow_v1",
      },
    )

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "unsupported_layout_constraint", error.code
    assert_includes error.message, "typed representation lanes (item_stream)"
    assert_includes error.message, "until the policy preserves mapped representation rows"
    assert_equal before_source, File.binread(absolute(VIEW_PATH))
  end

  def test_candidate_validation_rejects_an_off_row_representation_lane
    add_item_state_lane(row: 1)
    old_summary = root_board.fetch("summary")
    plan = edit_plan(
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline",
        "expect" => { "summary" => old_summary },
        "set" => { "summary" => "A candidate whose lane semantics must still be validated." },
      },
    )

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "representation_occurrence_off_lane", error.code
    assert_includes error.message, "value-site occurrence item_state"
    assert_includes error.message, "expected representation lane item_stream row 1"
    assert_equal "item_stream", error.details.fetch(0).fetch("lane_id")
  end

  private

  def copy(relative)
    source = File.join(ROOT, relative)
    destination = absolute(relative)
    FileUtils.mkdir_p(File.dirname(destination))
    FileUtils.cp(source, destination)
  end

  def absolute(relative)
    File.join(@temporary_root, relative)
  end

  def edit_plan(*operations)
    {
      "schema_version" => "architecture-edit-v0.2",
      "id" => "review_edit",
      "target" => { "source_set" => "generic" },
      "intent" => "Clarify the audience-facing architecture review.",
      "operations" => operations,
    }
  end

  def root_board
    parse(File.binread(absolute(VIEW_PATH))).fetch("boards").find do |board|
      board["id"] == "refinement_pipeline"
    end
  end

  def parse(source)
    Psych.safe_load(source, aliases: true)
  end

  def remove_override(relation_ref, expected_label)
    {
      "op" => "set_edge_override",
      "board_id" => "refinement_pipeline",
      "match" => { "relation_ref" => relation_ref },
      "expect" => { "label" => expected_label },
      "remove" => true,
    }
  end

  def add_item_state_lane(row:)
    view = parse(File.binread(absolute(VIEW_PATH)))
    board = view.fetch("boards").find { |candidate| candidate["id"] == "refinement_pipeline" }
    board["lanes"] = [{
      "id" => "item_stream",
      "label" => "item representations",
      "kind" => "representation",
      "row" => row,
      "representation_refs" => ["representations.item_state"],
      "glyph" => "single",
    }]
    File.binwrite(absolute(VIEW_PATH), Psych.dump(view, line_width: -1))
  end

  def strip_layout(board)
    copy = Marshal.load(Marshal.dump(board))
    copy.delete("grid")
    copy.fetch("nodes").each do |node|
      node.delete("col")
      node.delete("row")
    end
    copy
  end
end
