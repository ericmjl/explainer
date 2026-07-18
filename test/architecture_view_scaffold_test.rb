# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/architecture_projection"
require_relative "../lib/architecture_view_scaffold"
require_relative "../lib/strict_yaml"

class ArchitectureViewScaffoldTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  FIXTURE = YAML.safe_load_file(
    File.expand_path("fixtures/architecture_projection/vertical_slice.yaml", __dir__)
  ).fetch("architecture").freeze

  def setup
    @architecture = copy(FIXTURE)
  end

  def test_root_board_uses_the_maximal_depth_one_frontier_without_editorial_hiding
    original = copy(@architecture)
    result = scaffold_root(@architecture)
    board = result.board

    assert_instance_of ArchitectureViewScaffold::Result, result
    assert_nil result.parent_board_id
    assert_empty result.diagnostics
    assert_equal original, @architecture
    assert_equal "architecture", board.fetch("subject_ref")
    assert_equal 1, board.fetch("expansion_depth")
    assert_equal %w[
      modules.auxiliary
      modules.decoder
      modules.encoder
      value_sites.input
      value_sites.output
    ], board.fetch("nodes").map { |node| node.fetch("ref") }.sort
    %w[elide exclude edge_overrides occurrence_bindings].each do |field|
      refute board.key?(field), "scaffold unexpectedly authored #{field}"
    end
    assert_unique_cells(board)

    projection = ArchitectureProjection::Projector.new(@architecture).project(board)
    refute_empty projection.fetch("edges")
  end

  def test_child_board_derives_its_parent_and_keeps_exact_crossing_endpoints
    root = scaffold_root(@architecture).board
    view = { "boards" => [root] }

    result = ArchitectureViewScaffold.compile(
      architecture: @architecture,
      view: view,
      subject_ref: "modules.encoder",
      id: "encoder_detail",
      title: "Encoder",
      summary: "Expand preprocessing and transformation."
    )

    assert_equal "overview", result.parent_board_id
    assert_equal "overview", result.board.fetch("parent")
    assert_equal %w[
      modules.decoder
      modules.preprocess
      modules.transform
      value_sites.input
    ], result.board.fetch("nodes").map { |node| node.fetch("ref") }.sort
    assert_unique_cells(result.board)
  end

  def test_output_is_invariant_to_canonical_array_order
    first = scaffold_root(@architecture)
    shuffled = copy(@architecture)
    %w[modules value_sites relations].each { |field| shuffled.fetch(field).reverse! }
    second = scaffold_root(shuffled)

    assert_equal first.board, second.board
    assert_equal first.diagnostics, second.diagnostics
  end

  def test_semantic_layout_unfolds_a_cycle_along_its_forward_path
    architecture = copy(@architecture)
    architecture.fetch("relations") << {
      "id" => "transform_revisits_preprocess",
      "from" => "modules.transform",
      "to" => "modules.preprocess",
      "kind" => "state_update",
      "carries" => ["representations.signal"]
    }
    root = scaffold_root(architecture).board

    result = ArchitectureViewScaffold.compile(
      architecture: architecture,
      view: { "boards" => [root] },
      subject_ref: "modules.encoder",
      id: "encoder_cycle",
      title: "Encoder Cycle",
      summary: "Show the recurrent encoder update."
    )
    nodes = result.board.fetch("nodes").to_h { |node| [node.fetch("ref"), node] }

    assert_operator nodes.fetch("modules.preprocess").fetch("col"), :<,
      nodes.fetch("modules.transform").fetch("col")
    assert_unique_cells(result.board)
  end

  def test_columns_caps_and_reflows_topological_ranks
    result = scaffold_root(@architecture, columns: 2)

    assert_equal 2, result.board.dig("grid", "columns")
    assert result.board.fetch("nodes").all? { |node| node.fetch("col") <= 2 }
    assert_unique_cells(result.board)
  end

  def test_explicit_node_refs_are_exact_and_projection_still_fails_closed
    error = assert_raises(ArchitectureProjection::ProjectionError) do
      ArchitectureViewScaffold.compile(
        architecture: @architecture,
        view: { "boards" => [] },
        subject_ref: "architecture",
        id: "incomplete_overview",
        title: "Incomplete",
        summary: "Deliberately omit an in-scope endpoint.",
        node_refs: %w[
          value_sites.input
          modules.encoder
          modules.decoder
          value_sites.output
        ]
      )
    end

    assert_equal "unclassified_object", error.code
  end

  def test_unknown_explicit_node_ref_has_a_stable_scaffold_diagnostic
    error = assert_raises(ArchitectureViewScaffold::ScaffoldError) do
      ArchitectureViewScaffold.compile(
        architecture: @architecture,
        view: { "boards" => [] },
        subject_ref: "architecture",
        id: "unknown_ref_overview",
        title: "Unknown Ref",
        summary: "Exercise typed-ref validation.",
        node_refs: ["modules.not_a_module"]
      )
    end

    assert_equal "invalid_node_ref", error.code
  end

  def test_dense_boards_report_nodes_and_edges_without_hiding_anything
    architecture = dense_architecture
    result = ArchitectureViewScaffold.compile(
      architecture: architecture,
      view: { "boards" => [] },
      subject_ref: "architecture",
      id: "dense_overview",
      title: "Dense Overview",
      summary: "Exercise conservative density reporting."
    )
    codes = result.diagnostics.map { |diagnostic| diagnostic.fetch("code") }

    assert_equal %w[dense_board dense_edge_set], codes
    assert_equal 15, result.board.fetch("nodes").length
    refute result.board.key?("elide")
    refute result.board.key?("exclude")
  end

  def test_ambiguous_parent_requires_an_explicit_board_id
    root = scaffold_root(@architecture).board
    second = copy(root)
    second["id"] = "alternate_overview"
    view = { "boards" => [root, second] }

    error = assert_raises(ArchitectureViewScaffold::ScaffoldError) do
      ArchitectureViewScaffold.compile(
        architecture: @architecture,
        view: view,
        subject_ref: "modules.encoder",
        id: "encoder_detail",
        title: "Encoder",
        summary: "Expand the encoder."
      )
    end
    assert_equal "ambiguous_parent_board", error.code

    result = ArchitectureViewScaffold.compile(
      architecture: @architecture,
      view: view,
      subject_ref: "modules.encoder",
      id: "encoder_detail",
      title: "Encoder",
      summary: "Expand the encoder.",
      parent: "overview"
    )
    assert_equal "overview", result.parent_board_id
  end

  def test_v04_leaf_subject_cannot_own_a_generated_drilldown
    architecture = StrictYaml.load_file(File.join(ROOT, "architectures/generic-feature-refinement.yaml"))
    view = StrictYaml.load_file(File.join(ROOT, "views/generic-semantic-zoom.view.yaml"))

    error = assert_raises(ArchitectureViewScaffold::ScaffoldError) do
      ArchitectureViewScaffold.compile(
        architecture: architecture,
        view: view,
        subject_ref: "modules.context_builder",
        id: "context_builder_generated",
        title: "Context Builder",
        summary: "A leaf has no authored internal decomposition."
      )
    end

    assert_equal "non_expandable_subject", error.code
  end

  def test_every_registered_expandable_subject_scaffolds_successfully
    registry = StrictYaml.load_file(File.join(ROOT, "architectures/index.yaml"))
    compiled_count = 0

    registry.fetch("source_sets").each do |source_set|
      architecture = StrictYaml.load_file(File.join(ROOT, source_set.fetch("architecture")))
      modules = architecture.fetch("modules")
      children = Hash.new { |hash, key| hash[key] = [] }
      modules.each { |mod| children[mod.fetch("parent_ref")] << "modules.#{mod.fetch('id')}" }
      view = { "boards" => [] }
      root_id = "#{architecture.fetch('id')}_generated_overview"
      root = ArchitectureViewScaffold.compile(
        architecture: architecture,
        view: view,
        subject_ref: "architecture",
        id: root_id,
        title: "#{architecture.fetch('name')} Overview",
        summary: "Generated task-boundary overview."
      )
      view.fetch("boards") << root.board
      compiled_count += 1

      modules_by_ref = modules.to_h { |mod| ["modules.#{mod.fetch('id')}", mod] }
      depths = module_depths(modules_by_ref)
      expandable = modules_by_ref.keys.select { |ref| children[ref].any? }
                                  .sort_by { |ref| [depths.fetch(ref), ref] }
      expandable.each do |subject_ref|
        mod = modules_by_ref.fetch(subject_ref)
        result = ArchitectureViewScaffold.compile(
          architecture: architecture,
          view: view,
          subject_ref: subject_ref,
          id: "#{mod.fetch('id')}_generated_detail",
          title: mod.fetch("label"),
          summary: mod.fetch("role")
        )
        view.fetch("boards") << result.board
        compiled_count += 1
      end
    end

    assert_operator compiled_count, :>=, 20
  end

  private

  def scaffold_root(architecture, columns: nil)
    ArchitectureViewScaffold.compile(
      architecture: architecture,
      view: { "boards" => [] },
      subject_ref: "architecture",
      id: "overview",
      title: "Projection Fixture",
      summary: "Generated task-boundary overview.",
      columns: columns
    )
  end

  def assert_unique_cells(board)
    cells = board.fetch("nodes").map { |node| [node.fetch("col"), node.fetch("row")] }
    assert_equal cells.uniq, cells
    assert cells.all? { |col, row| col.between?(1, board.dig("grid", "columns")) && row.between?(1, board.dig("grid", "rows")) }
  end

  def copy(value)
    Marshal.load(Marshal.dump(value))
  end

  def dense_architecture
    module_ids = (1..13).map { |index| format("stage_%02d", index) }
    relations = []
    previous = "value_sites.input"
    module_ids.each do |id|
      relations << relation("#{id}_flow", previous, "modules.#{id}", "data_flow")
      previous = "modules.#{id}"
    end
    relations << relation("output_flow", previous, "value_sites.output", "data_flow")
    module_ids.each do |id|
      relations << relation("#{id}_context", "value_sites.input", "modules.#{id}", "conditioning")
    end

    {
      "schema_version" => "architecture-v0.3",
      "id" => "dense_fixture",
      "representations" => [{ "id" => "signal", "shape" => "B x D" }],
      "modules" => module_ids.map { |id| { "id" => id, "parent_ref" => "architecture" } },
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
      "relations" => relations
    }
  end

  def relation(id, from, to, kind)
    {
      "id" => id,
      "from" => from,
      "to" => to,
      "kind" => kind,
      "carries" => ["representations.signal"]
    }
  end

  def module_depths(modules_by_ref)
    depths = { "architecture" => 0 }
    resolve = lambda do |ref|
      return depths.fetch(ref) if depths.key?(ref)

      parent = modules_by_ref.fetch(ref).fetch("parent_ref")
      depths[ref] = resolve.call(parent) + 1
    end
    modules_by_ref.each_key { |ref| resolve.call(ref) }
    depths
  end
end
