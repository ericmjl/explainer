# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/architecture_view_regions"

class ArchitectureViewRegionsTest < Minitest::Test
  def test_accepts_disjoint_or_strictly_nested_repeat_regions
    regions = [
      region("outer", "execution.loops.ab", %w[a b c], ["relations.a_to_b"]),
      region("inner", "execution.loops.ab", %w[a b], ["relations.a_to_b"]),
      region("separate", "execution.loops.d", %w[d]),
    ]

    assert_empty ArchitectureViewRegions.errors(
      architecture,
      board(regions),
      projection: projection,
    )
  end

  def test_reports_invalid_refs_members_iteration_edges_and_partial_overlap
    regions = [
      region("left", "execution.loops.ab", %w[a b unknown], [
        "relations.missing",
        "relations.b_to_c",
      ]),
      region("right", "execution.loops.bc", %w[b c]),
      region("overlap_left", "execution.loops.ab", %w[a b]),
      region("missing_loop", "execution.loops.missing", %w[d]),
      region("left", "execution.loops.ab", %w[a a]),
    ]

    codes = ArchitectureViewRegions.errors(
      architecture,
      board(regions),
      projection: projection,
    ).map { |item| item.fetch("code") }

    %w[
      duplicate_region_id
      duplicate_region_node
      unknown_region_node
      unknown_region_execution_loop
      region_omits_visible_rerun
      unknown_region_iteration_relation
      region_iteration_relation_not_direct
      overlapping_regions
    ].each { |code| assert_includes codes, code }
  end

  def test_iteration_relation_endpoints_must_both_belong_to_the_region
    errors = ArchitectureViewRegions.errors(
      architecture,
      board([region("one_side", "execution.loops.a", %w[a], ["relations.a_to_b"])]),
      projection: projection,
    )

    assert_equal ["region_iteration_relation_crosses_boundary"], errors.map { |item| item.fetch("code") }
  end

  private

  def architecture
    {
      "execution" => {
        "loops" => [
          { "id" => "ab", "reruns" => %w[modules.a modules.b] },
          { "id" => "bc", "reruns" => %w[modules.b modules.c] },
          { "id" => "d", "reruns" => ["modules.d"] },
          { "id" => "a", "reruns" => ["modules.a"] },
        ],
      },
      "relations" => [
        { "id" => "a_to_b" },
        { "id" => "b_to_c" },
      ],
    }
  end

  def board(regions)
    {
      "id" => "detail",
      "nodes" => %w[a b c d].map { |id| { "id" => id, "ref" => "modules.#{id}" } },
      "regions" => regions,
    }
  end

  def projection
    {
      "edges" => [
        {
          "from" => "a",
          "to" => "b",
          "projection" => "direct",
          "relation_path" => ["relations.a_to_b"],
        },
        {
          "from" => "b",
          "to" => "c",
          "projection" => "boundary",
          "relation_path" => ["relations.b_to_c"],
        },
      ],
    }
  end

  def region(id, execution_ref, node_ids, iteration_relation_refs = nil)
    {
      "id" => id,
      "kind" => "repeat",
      "execution_ref" => execution_ref,
      "label" => id.tr("_", " "),
      "node_ids" => node_ids,
    }.tap do |item|
      item["iteration_relation_refs"] = iteration_relation_refs if iteration_relation_refs
    end
  end
end
