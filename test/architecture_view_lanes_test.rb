# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/architecture_view_lanes"

class ArchitectureViewLanesTest < Minitest::Test
  def test_accepts_grounded_representation_rows_and_plain_guides
    lanes = [
      { "id" => "guide", "label" => "context", "position" => 12 },
      lane("singles", 2, "single", ["representations.single_features"]),
      lane("pairs", 4, "pair", ["representations.pair_features"]),
    ]

    assert_empty ArchitectureViewLanes.errors(
      architecture,
      board(lanes),
      projection: projection,
    )
  end

  def test_reports_unknown_overlapping_ambiguous_and_unused_lanes
    lanes = [
      lane("singles", 2, "single", ["representations.single_features"]),
      lane("also_singles", 3, "single", ["representations.single_features"]),
      lane("missing", 5, "pair", ["representations.missing"]),
      lane("unused", 1, "coordinates", ["representations.coordinates"]),
      lane("singles", 1, "frames", []),
    ]

    codes = ArchitectureViewLanes.errors(
      architecture,
      board(lanes),
      projection: projection,
    ).map { |item| item.fetch("code") }

    %w[
      duplicate_lane_id
      representation_lane_row_out_of_bounds
      empty_representation_lane
      unknown_representation_lane_ref
      ambiguous_representation_lane_glyph
      overlapping_representation_lanes
      unused_representation_lane
    ].each { |code| assert_includes codes, code }
  end

  def test_visible_value_sites_must_sit_on_their_mapped_row
    lanes = [lane("singles", 3, "single", ["representations.single_features"])]

    errors = ArchitectureViewLanes.errors(
      architecture,
      board(lanes),
      projection: projection,
    )

    off_lane = errors.find { |item| item.fetch("code") == "representation_occurrence_off_lane" }
    refute_nil off_lane
    assert_equal "singles", off_lane.fetch("lane_id")
    assert_equal "single_state", off_lane.fetch("node_id")
  end

  def test_lane_glyph_must_match_the_canonical_or_inferred_glyph
    lanes = [lane("wrong_family", 2, "pair", ["representations.single_features"])]

    errors = ArchitectureViewLanes.errors(
      architecture,
      board(lanes),
      projection: projection,
    )

    assert_equal ["representation_lane_glyph_mismatch"], errors.map { |item| item.fetch("code") }
  end

  private

  def architecture
    {
      "representations" => [
        { "id" => "single_features", "shape" => "B x N x 384" },
        { "id" => "pair_features", "shape" => "B x N x N x 128" },
        { "id" => "coordinates", "shape" => "B x N x 3", "glyph" => "coordinates" },
      ],
      "value_sites" => [
        {
          "id" => "single_state",
          "representation_ref" => "representations.single_features",
        },
        {
          "id" => "pair_state",
          "representation_ref" => "representations.pair_features",
        },
      ],
    }
  end

  def board(lanes)
    {
      "id" => "detail",
      "grid" => { "columns" => 3, "rows" => 4 },
      "lanes" => lanes,
      "nodes" => [
        { "id" => "single_state", "ref" => "value_sites.single_state", "col" => 2, "row" => 2 },
        { "id" => "pair_state", "ref" => "value_sites.pair_state", "col" => 2, "row" => 4 },
      ],
    }
  end

  def projection
    {
      "edges" => [
        { "from" => "producer", "to" => "single_state", "carries" => ["representations.single_features"] },
        { "from" => "producer", "to" => "pair_state", "carries" => ["representations.pair_features"] },
      ],
    }
  end

  def lane(id, row, glyph, representation_refs)
    {
      "id" => id,
      "label" => id.tr("_", " "),
      "kind" => "representation",
      "row" => row,
      "representation_refs" => representation_refs,
      "glyph" => glyph,
    }
  end
end
