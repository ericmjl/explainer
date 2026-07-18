# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/architecture_edit_contract"

class ArchitectureEditV2ContractTest < Minitest::Test
  def test_v02_accepts_v01_operations_and_v01_plans_remain_valid
    old_operation = {
      "op" => "update_entity",
      "ref" => "modules.input_adapter",
      "set" => { "role" => "prepare model inputs" },
    }

    assert_empty ArchitectureEditContract.errors(plan("architecture-edit-v0.1", old_operation))
    assert_empty ArchitectureEditContract.errors(plan("architecture-edit-v0.2", old_operation))
  end

  def test_v02_accepts_the_bounded_review_operations
    document = plan(
      "architecture-edit-v0.2",
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline",
        "expect" => { "summary" => "Old summary" },
        "set" => { "summary" => "Clearer summary" },
      },
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline.nodes.input_adapter",
        "expect" => { "detail" => nil },
        "set" => { "role" => "prepare inputs", "detail" => "Build the initial latent state." },
      },
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => { "relation_ref" => "relations.raw_records_enter_input_adapter" },
        "expect" => { "label" => "fields" },
        "set" => {
          "label" => "records",
          "connection" => {
            "title" => "Records enter the adapter",
            "role" => "input preparation",
            "inside" => "The adapter embeds each field before constructing latent state.",
          },
        },
      },
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => {
          "relation_path" => [
            "relations.input_adapter_produces_item_to_group_index",
            "relations.item_to_group_index_guides_context_builder",
          ],
        },
        "remove" => true,
      },
      {
        "op" => "set_board_visibility",
        "board_id" => "refinement_pipeline",
        "occurrence_id" => "context_builder",
        "ref" => "modules.context_builder",
        "decision" => "excluded",
        "reason" => "This review focuses on the main state path.",
      },
      {
        "op" => "layout_board",
        "board_id" => "refinement_pipeline",
        "policy" => "semantic_flow_v1",
      },
    )

    assert_empty ArchitectureEditContract.errors(document)
  end

  def test_v01_rejects_v02_operations
    document = plan(
      "architecture-edit-v0.1",
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline",
        "set" => { "summary" => "Clearer summary" },
      },
    )

    assert_diagnostic ArchitectureEditContract.errors(document), "schema_oneOf", /operations\[0\]/
  end

  def test_rejects_fields_outside_the_review_surface
    diagnostics = ArchitectureEditContract.errors(plan(
      "architecture-edit-v0.2",
      {
        "op" => "update_view_entity",
        "ref" => "boards.refinement_pipeline.nodes.input_adapter",
        "set" => { "label" => "Renamed Adapter" },
      },
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => { "relation_ref" => "relations.raw_records_enter_input_adapter" },
        "set" => { "tone" => "conditioning" },
      },
      {
        "op" => "set_board_visibility",
        "board_id" => "refinement_pipeline",
        "occurrence_id" => "context_builder",
        "ref" => "modules.context_builder",
        "decision" => "excluded",
      },
    ))

    assert_diagnostic diagnostics, "schema_oneOf", /operations\[0\]/
    assert_diagnostic diagnostics, "schema_oneOf", /operations\[1\]/
    assert_diagnostic diagnostics, "schema_oneOf", /operations\[2\]/
  end

  def test_edge_connection_must_be_complete_and_set_must_not_be_empty
    diagnostics = ArchitectureEditContract.errors(plan(
      "architecture-edit-v0.2",
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => { "relation_ref" => "relations.raw_records_enter_input_adapter" },
        "set" => { "connection" => { "title" => "Incomplete" } },
      },
      {
        "op" => "set_edge_override",
        "board_id" => "refinement_pipeline",
        "match" => { "relation_ref" => "relations.raw_records_enter_input_adapter" },
        "set" => {},
      },
    ))

    assert_diagnostic diagnostics, "schema_oneOf", /operations\[0\]/
    assert_diagnostic diagnostics, "edit_empty_update", /operations\[1\]\.set/
  end

  def test_layout_board_requires_the_versioned_semantic_policy
    diagnostics = ArchitectureEditContract.errors(plan(
      "architecture-edit-v0.2",
      {
        "op" => "layout_board",
        "board_id" => "refinement_pipeline",
        "policy" => "unconstrained_force_layout",
      },
    ))

    assert_diagnostic diagnostics, "schema_oneOf", /operations\[0\]/
  end

  private

  def plan(version, *operations)
    {
      "schema_version" => version,
      "id" => "review_edit",
      "target" => { "source_set" => "generic" },
      "intent" => "Exercise the bounded review language.",
      "operations" => operations,
    }
  end

  def assert_diagnostic(diagnostics, code, path_pattern)
    assert diagnostics.any? { |item| item.code == code && path_pattern.match?(item.path) },
      "expected #{code} at #{path_pattern.inspect}, got:\n#{diagnostics.join("\n")}"
  end
end
