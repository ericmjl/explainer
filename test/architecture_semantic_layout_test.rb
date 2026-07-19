# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/architecture_semantic_layout"
require_relative "../lib/architecture_projection"
require_relative "../lib/strict_yaml"

class ArchitectureSemanticLayoutTest < Minitest::Test
  def test_places_compute_in_the_middle_context_above_and_recurrence_below
    result = compile

    assert_equal ArchitectureSemanticLayout::POLICY, result.policy
    assert_equal "context", result.lanes.fetch("noise_level")
    assert_equal "feedback", result.lanes.fetch("updated_state")
    assert_equal "main", result.lanes.fetch("refiner")

    positions = result.positions
    assert_equal 1, positions.fetch("request").fetch("col")
    assert_equal result.grid.fetch("columns"), positions.fetch("prediction").fetch("col")
    assert_operator positions.fetch("encoder").fetch("col"), :<,
      positions.fetch("refiner").fetch("col")
    assert_operator positions.fetch("noise_level").fetch("row"), :<,
      positions.fetch("refiner").fetch("row")
    assert_operator positions.fetch("updated_state").fetch("row"), :>,
      positions.fetch("refiner").fetch("row")
    assert_in_delta (result.grid.fetch("rows") + 1) / 2.0,
      positions.fetch("refiner").fetch("row"), 0.5

    consumer_columns = %w[encoder refiner].map { |id| positions.fetch(id).fetch("col") }.sort
    expected_context_column = ((consumer_columns.first + consumer_columns.last) / 2.0).round
    assert_equal expected_context_column, positions.fetch("noise_level").fetch("col")
    assert_unique_cells(result)
  end

  def test_prefers_the_value_to_module_reentry_as_feedback
    result = compile
    feedback = result.feedback_edge_indexes.map { |index| edges.fetch(index) }

    assert_equal ["relations.updated_state_reenters_refiner"],
      feedback.flat_map { |edge| edge.fetch("relation_path") }
    assert_equal 1, result.metrics.fetch("feedback_edge_count")
  end

  def test_output_is_deterministic_under_node_and_edge_reordering
    first = compile
    second = ArchitectureSemanticLayout.compile(
      architecture: architecture,
      nodes: nodes.reverse,
      edges: edges.reverse,
    )

    assert_equal first.positions, second.positions
    assert_equal first.grid, second.grid
    assert_equal first.lanes, second.lanes
  end

  def test_column_cap_preserves_lanes_and_valid_cells
    result = compile(columns: 3)

    assert_equal 3, result.grid.fetch("columns")
    assert_equal 1, result.positions.fetch("request").fetch("col")
    assert_equal 3, result.positions.fetch("prediction").fetch("col")
    assert_equal "context", result.lanes.fetch("noise_level")
    assert_unique_cells(result)
  end

  def test_column_cap_does_not_expand_a_narrower_natural_layout
    natural = compile
    result = compile(columns: natural.grid.fetch("columns") + 5)

    assert_equal natural.grid, result.grid
    assert_equal natural.positions, result.positions
  end

  def test_control_only_value_is_context
    control_nodes = [
      { "id" => "schedule", "ref" => "value_sites.schedule" },
      { "id" => "sampler", "ref" => "modules.sampler", "treatment" => "block" },
    ]
    control_edges = [edge("schedule", "sampler", "control", "schedule_controls_sampler")]

    result = ArchitectureSemanticLayout.compile(
      nodes: control_nodes,
      edges: control_edges,
      architecture: { "value_sites" => [{ "id" => "schedule" }] },
    )

    assert_equal "context", result.lanes.fetch("schedule")
    assert_operator result.positions.fetch("schedule").fetch("row"), :<,
      result.positions.fetch("sampler").fetch("row")
  end

  def test_mixed_use_value_stays_in_the_main_flow
    mixed_nodes = [
      { "id" => "frames", "ref" => "value_sites.frames" },
      { "id" => "encoder", "ref" => "modules.encoder" },
      { "id" => "decoder", "ref" => "modules.decoder" },
    ]
    mixed_edges = [
      edge("frames", "encoder", "data_flow", "frames_enter_encoder"),
      edge("frames", "decoder", "conditioning", "frames_condition_decoder"),
    ]

    result = ArchitectureSemanticLayout.compile(nodes: mixed_nodes, edges: mixed_edges)

    assert_equal "main", result.lanes.fetch("frames")
    assert_operator result.positions.fetch("frames").fetch("col"), :<=,
      result.positions.fetch("encoder").fetch("col")
  end

  def test_produced_context_preserves_producer_before_consumer_order
    context_nodes = [
      { "id" => "builder", "ref" => "modules.builder" },
      { "id" => "context", "ref" => "value_sites.context" },
      { "id" => "consumer", "ref" => "modules.consumer" },
    ]
    context_edges = [
      edge("builder", "context", "data_flow", "builder_produces_context"),
      edge("context", "consumer", "conditioning", "context_conditions_consumer"),
    ]

    result = ArchitectureSemanticLayout.compile(nodes: context_nodes, edges: context_edges)

    assert_equal "context", result.lanes.fetch("context")
    assert_operator result.positions.fetch("builder").fetch("col"), :<,
      result.positions.fetch("consumer").fetch("col")
    assert_operator result.positions.fetch("builder").fetch("col"), :<=,
      result.positions.fetch("context").fetch("col")
  end

  def test_unknown_edge_endpoint_fails_closed
    invalid = edges + [{ "from" => "encoder", "to" => "missing", "kind" => "data_flow" }]

    error = assert_raises(ArchitectureSemanticLayout::LayoutError) do
      ArchitectureSemanticLayout.compile(nodes: nodes, edges: invalid, architecture: architecture)
    end

    assert_equal "unknown_endpoint", error.code
  end

  def test_genie3_denoiser_keeps_feature_flow_main_and_internalizes_decoder_recurrence
    result, projection = compile_real_board("genie3", "denoiser_forward")

    feedback_refs = result.feedback_edge_indexes.flat_map do |index|
      projection.fetch("edges").fetch(index).fetch("relation_path")
    end
    refute_includes feedback_refs, "relations.updated_frames_reenter_decoder"
    refute projection.fetch("edges").any? { |edge|
      edge.fetch("relation_path").include?("relations.updated_frames_reenter_decoder")
    }
    assert projection.fetch("edges").any? { |edge|
      edge.fetch("relation_path") == ["relations.updated_frames_become_decoder_output_frames"] &&
        edge.fetch("from") == "structure_decoder" && edge.fetch("to") == "updated_frames"
    }
    assert_equal "main", result.lanes.fetch("feature_bundle")
    assert_equal "context", result.lanes.fetch("timestep")
    assert_equal "context", result.lanes.fetch("refined_pair_features")
    assert_equal "main", result.lanes.fetch("updated_frames")
    assert_equal "main", result.lanes.fetch("latent_transformer")
    assert_equal "main", result.lanes.fetch("structure_decoder")
    assert_unique_cells(result)
  end

  def test_genie3_structure_decoder_keeps_per_layer_frame_recurrence_in_detail
    _result, projection = compile_real_board("genie3", "structure_decoder")

    recurrence = projection.fetch("edges").find do |edge|
      edge.fetch("relation_path") == ["relations.updated_frames_reenter_decoder"]
    end
    refute_nil recurrence
    assert_equal "updated_frames", recurrence.fetch("from")
    assert_equal "decoder_frames", recurrence.fetch("to")
    assert_equal "direct", recurrence.fetch("projection")

    terminal_export = projection.fetch("edges").find do |edge|
      edge.fetch("relation_path") == ["relations.updated_frames_become_decoder_output_frames"]
    end
    refute_nil terminal_export
    assert_equal "updated_frames", terminal_export.fetch("from")
    assert_equal "decoder_output_frames", terminal_export.fetch("to")
  end

  def test_genie3_sampler_control_is_north_of_the_update
    result, = compile_real_board("genie3", "directional_ddim_sampler_math")

    assert_equal "context", result.lanes.fetch("timestep")
    assert_operator result.positions.fetch("timestep").fetch("row"), :<,
      result.positions.fetch("ddim_update").fetch("row")
  end

  def test_genie2_mixed_use_frames_stay_main_and_do_not_create_backward_flow
    result, = compile_real_board("genie2", "denoiser_forward")

    assert_equal "main", result.lanes.fetch("current_frames")
    assert_operator result.positions.fetch("current_frames").fetch("col"), :<=,
      result.positions.fetch("invariant_feature_encoder").fetch("col")
  end

  def test_produced_root_context_does_not_place_sampler_before_builder
    {
      "genie2" => ["generation_overview", "reverse_diffusion_sampler"],
      "genie3" => ["design_overview", "diffusion_sampler"],
    }.each do |source_set, (board_id, sampler_id)|
      result, = compile_real_board(source_set, board_id)

      assert_operator result.positions.fetch("feature_builder").fetch("col"), :<,
        result.positions.fetch(sampler_id).fetch("col"), source_set
      assert_operator result.positions.fetch("feature_builder").fetch("col"), :<=,
        result.positions.fetch("feature_bundle").fetch("col"), source_set
    end
  end

  def test_every_registered_board_compiles_to_valid_forward_semantic_ranks
    root = File.expand_path("..", __dir__)
    registry = StrictYaml.load_file(File.join(root, "architectures/index.yaml"))

    registry.fetch("source_sets").each do |source_set|
      architecture = StrictYaml.load_file(File.join(root, source_set.fetch("architecture")))
      view = StrictYaml.load_file(File.join(root, source_set.fetch("view")))
      projector = ArchitectureProjection::Projector.new(architecture)
      view.fetch("boards").each do |board|
        # Reusable algorithm-detail boards use the standard block's curated
        # local layout and do not participate in canonical semantic ranking.
        next if board["kind"] == "standard_block_instance"

        projection = projector.project(board)
        edges = projection.fetch("edges")
        result = ArchitectureSemanticLayout.compile(
          architecture: architecture,
          nodes: board.fetch("nodes"),
          edges: edges,
        )
        assert_unique_cells(result)

        feedback = result.feedback_edge_indexes.to_set
        edges.each_with_index do |edge, index|
          next if feedback.include?(index)
          next if ArchitectureSemanticLayout::CONTEXT_KINDS.include?(edge["kind"])

          from_col = result.positions.fetch(edge.fetch("from")).fetch("col")
          to_col = result.positions.fetch(edge.fetch("to")).fetch("col")
          assert_operator from_col, :<=, to_col,
            "#{source_set.fetch('id')}/#{board.fetch('id')} makes #{edge.fetch('from')} -> #{edge.fetch('to')} backward"
        end
      end
    end
  end

  private

  def compile(columns: nil)
    ArchitectureSemanticLayout.compile(
      architecture: architecture,
      nodes: nodes,
      edges: edges,
      columns: columns,
    )
  end

  def architecture
    {
      "value_sites" => [
        { "id" => "request", "boundary" => "input" },
        { "id" => "noise_level" },
        { "id" => "encoded_state" },
        { "id" => "updated_state" },
        { "id" => "prediction", "boundary" => "output" },
      ],
    }
  end

  def nodes
    [
      { "id" => "request", "ref" => "value_sites.request", "treatment" => "compact" },
      { "id" => "noise_level", "ref" => "value_sites.noise_level", "prominence" => "context" },
      { "id" => "encoder", "ref" => "modules.encoder", "prominence" => "primary", "treatment" => "block" },
      { "id" => "encoded_state", "ref" => "value_sites.encoded_state", "treatment" => "compact" },
      { "id" => "refiner", "ref" => "modules.refiner", "prominence" => "primary", "treatment" => "block" },
      { "id" => "updated_state", "ref" => "value_sites.updated_state", "treatment" => "compact" },
      { "id" => "prediction", "ref" => "value_sites.prediction", "treatment" => "compact" },
    ]
  end

  def edges
    [
      edge("request", "encoder", "data_flow", "request_enters_encoder"),
      edge("noise_level", "encoder", "conditioning", "noise_conditions_encoder"),
      edge("noise_level", "refiner", "conditioning", "noise_conditions_refiner"),
      edge("encoder", "encoded_state", "data_flow", "encoder_produces_state"),
      edge("encoded_state", "refiner", "data_flow", "state_enters_refiner"),
      edge("refiner", "updated_state", "state_update", "refiner_writes_updated_state"),
      edge("updated_state", "refiner", "state_update", "updated_state_reenters_refiner"),
      edge("updated_state", "prediction", "data_flow", "updated_state_produces_prediction"),
    ]
  end

  def edge(from, to, kind, relation_id)
    {
      "from" => from,
      "to" => to,
      "kind" => kind,
      "relation_path" => ["relations.#{relation_id}"],
    }
  end

  def assert_unique_cells(result)
    cells = result.positions.values.map { |position| [position.fetch("col"), position.fetch("row")] }
    assert_equal cells.uniq, cells
    assert cells.all? do |col, row|
      col.between?(1, result.grid.fetch("columns")) && row.between?(1, result.grid.fetch("rows"))
    end
  end

  def compile_real_board(source_set, board_id)
    root = File.expand_path("..", __dir__)
    architecture = StrictYaml.load_file(File.join(root, "architectures/#{source_set}.yaml"))
    view = StrictYaml.load_file(File.join(root, "views/#{source_set}-semantic-zoom.view.yaml"))
    board = view.fetch("boards").find { |candidate| candidate["id"] == board_id }
    projection = ArchitectureProjection::Projector.new(architecture).project(board)
    result = ArchitectureSemanticLayout.compile(
      architecture: architecture,
      nodes: board.fetch("nodes"),
      edges: projection.fetch("edges"),
    )
    [result, projection]
  end
end
