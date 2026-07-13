# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/architecture_projection"

class ArchitectureProjectionTest < Minitest::Test
  FIXTURE = YAML.safe_load_file(
    File.expand_path("fixtures/architecture_projection/vertical_slice.yaml", __dir__)
  ).freeze

  def setup
    @architecture = copy(FIXTURE.fetch("architecture"))
    @boards = copy(FIXTURE.fetch("boards"))
    @projector = ArchitectureProjection::Projector.new(@architecture)
  end

  def test_direct_relations_emit_deterministic_canonical_edges
    first = @projector.project(@boards.fetch("direct"))
    second = @projector.project(@boards.fetch("direct"))

    assert_equal first, second
    assert_equal "derived", first.fetch("projection_mode")
    assert_equal 4, first.fetch("edges").length
    assert first.fetch("edges").all? { |edge| edge.fetch("origin") == "canonical" }
    assert first.fetch("edges").all? { |edge| edge.fetch("projection") == "direct" }
    assert first.fetch("edges").all? { |edge| edge.fetch("relation_path").length == 1 }
    assert_equal "excluded", first.fetch("classifications").fetch("modules.auxiliary")
  end

  def test_visible_aggregate_collapses_its_descendant_subtree
    projection = @projector.project(@boards.fetch("collapsed"))
    edge_pairs = projection.fetch("edges").map { |edge| [edge.fetch("from"), edge.fetch("to")] }

    assert_equal [%w[decoder output], %w[encoder decoder], %w[input encoder]], edge_pairs
    assert_equal "collapsed:modules.encoder", projection.fetch("classifications").fetch("modules.preprocess")
    assert_equal "collapsed:modules.encoder", projection.fetch("classifications").fetch("modules.transform")
    assert_equal %w[direct boundary boundary], projection.fetch("edges").map { |edge| edge.fetch("projection") }
  end

  def test_explicit_elision_contracts_only_the_named_pass_through
    projection = @projector.project(@boards.fetch("elided"))
    contracted = projection.fetch("edges").find { |edge| edge.fetch("projection") == "contracted" }

    refute_nil contracted
    assert_equal "input", contracted.fetch("from")
    assert_equal "transform", contracted.fetch("to")
    assert_equal [
      "relations.input_enters_preprocess",
      "relations.preprocess_enters_transform"
    ], contracted.fetch("relation_path")
    assert_equal ["modules.preprocess"], contracted.fetch("hidden_refs")
    assert_equal "prepared signal", contracted.fetch("presentation").fetch("label")
    assert_equal "bottom", contracted.fetch("presentation").fetch("route_side")
  end

  def test_unclassified_in_horizon_object_fails_closed
    error = assert_raises(ArchitectureProjection::ProjectionError) do
      @projector.project(@boards.fetch("unclassified"))
    end

    assert_equal "unclassified_object", error.code
    assert_match "modules.preprocess", error.message
  end

  def test_repeated_occurrences_require_and_honor_bindings
    board = @boards.fetch("repeated")
    projection = @projector.project(board)
    into_transform = edge_for(projection, "relations.preprocess_enters_transform")
    out_of_transform = edge_for(projection, "relations.transform_enters_decoder")

    assert_equal "transform_before", into_transform.fetch("to")
    assert_equal "transform_before", out_of_transform.fetch("from")

    board_without_bindings = copy(board)
    board_without_bindings.delete("occurrence_bindings")
    error = assert_raises(ArchitectureProjection::ProjectionError) do
      @projector.project(board_without_bindings)
    end
    assert_equal "ambiguous_occurrence", error.code
  end

  def test_ambiguous_fan_in_and_fan_out_elision_is_rejected
    error = assert_raises(ArchitectureProjection::ProjectionError) do
      ArchitectureProjection::Projector.project(
        architecture: ambiguous_architecture,
        board: ambiguous_board
      )
    end

    assert_equal "ambiguous_elision", error.code
  end

  def test_exclusions_require_a_reason
    board = copy(@boards.fetch("direct"))
    board.fetch("exclude").first.delete("reason")

    error = assert_raises(ArchitectureProjection::ProjectionError) do
      @projector.project(board)
    end
    assert_equal "missing_exclusion_reason", error.code
  end

  def test_an_excluded_endpoint_removes_the_relation_before_frontier_accounting
    board = {
      "id" => "encoder_slice",
      "subject_ref" => "modules.encoder",
      "expansion_depth" => 1,
      "nodes" => [
        { "id" => "input", "ref" => "value_sites.input" },
        { "id" => "preprocess", "ref" => "modules.preprocess" }
      ],
      "exclude" => [
        { "ref" => "modules.transform", "reason" => "Stop before transformation." }
      ]
    }

    projection = @projector.project(board)
    assert_equal [["input", "preprocess"]], projection.fetch("edges").map { |edge| [edge["from"], edge["to"]] }
    refute projection.fetch("classifications").key?("modules.decoder")
  end

  def test_edge_override_must_match_exactly_one_generated_edge
    board = copy(@boards.fetch("direct"))
    board["edge_overrides"] = [
      {
        "match" => { "relation_ref" => "relations.does_not_exist" },
        "label" => "unsupported shortcut"
      }
    ]

    error = assert_raises(ArchitectureProjection::ProjectionError) do
      @projector.project(board)
    end
    assert_equal "unmatched_edge_override", error.code
  end

  def test_root_projection_must_preserve_canonical_boundary_reachability
    board = copy(@boards.fetch("direct"))
    board["exclude"] << {
      "ref" => "modules.decoder",
      "reason" => "Deliberately invalid fixture."
    }
    board["nodes"].reject! { |node| node.fetch("ref") == "modules.decoder" }

    error = assert_raises(ArchitectureProjection::ProjectionError) do
      @projector.project(board)
    end
    assert_equal "root_reachability", error.code
  end

  def test_architecture_requires_connected_task_boundaries
    architecture = copy(@architecture)
    architecture.fetch("relations").reject! { |relation| relation.fetch("id") == "decoder_produces_output" }

    error = assert_raises(ArchitectureProjection::ProjectionError) do
      ArchitectureProjection::Projector.new(architecture)
    end
    assert_equal "disconnected_boundary", error.code
  end

  private

  def edge_for(projection, relation_ref)
    projection.fetch("edges").find { |edge| edge.fetch("relation_path") == [relation_ref] }
  end

  def copy(value)
    Marshal.load(Marshal.dump(value))
  end

  def ambiguous_architecture
    {
      "schema_version" => "architecture-v0.3",
      "id" => "ambiguous_elision",
      "representations" => [{ "id" => "signal" }],
      "modules" => %w[a b hidden_in hidden_out c d].map do |id|
        { "id" => id, "parent_ref" => "architecture" }
      end,
      "value_sites" => [
        {
          "id" => "input", "representation_ref" => "representations.signal",
          "scope_ref" => "architecture", "boundary" => "input"
        },
        {
          "id" => "output", "representation_ref" => "representations.signal",
          "scope_ref" => "architecture", "boundary" => "output"
        }
      ],
      "relations" => [
        relation("input_a", "value_sites.input", "modules.a"),
        relation("input_b", "value_sites.input", "modules.b"),
        relation("a_hidden", "modules.a", "modules.hidden_in"),
        relation("b_hidden", "modules.b", "modules.hidden_in"),
        relation("hidden_chain", "modules.hidden_in", "modules.hidden_out"),
        relation("hidden_c", "modules.hidden_out", "modules.c"),
        relation("hidden_d", "modules.hidden_out", "modules.d"),
        relation("c_output", "modules.c", "value_sites.output"),
        relation("d_output", "modules.d", "value_sites.output")
      ]
    }
  end

  def ambiguous_board
    {
      "id" => "ambiguous",
      "subject_ref" => "architecture",
      "expansion_depth" => 1,
      "nodes" => [
        { "id" => "input", "ref" => "value_sites.input" },
        { "id" => "a", "ref" => "modules.a" },
        { "id" => "b", "ref" => "modules.b" },
        { "id" => "c", "ref" => "modules.c" },
        { "id" => "d", "ref" => "modules.d" },
        { "id" => "output", "ref" => "value_sites.output" }
      ],
      "elide" => [
        { "ref" => "modules.hidden_in" },
        { "ref" => "modules.hidden_out" }
      ]
    }
  end

  def relation(id, from, to)
    {
      "id" => id,
      "from" => from,
      "to" => to,
      "kind" => "data_flow",
      "carries" => ["representations.signal"]
    }
  end
end
