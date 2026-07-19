# frozen_string_literal: true

require "minitest/autorun"
require "json"
require "tempfile"
require_relative "../lib/source_contract"
require_relative "../lib/strict_yaml"

class SourceContractTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @architecture = load_yaml("architectures/generic-feature-refinement.yaml")
    @view = load_yaml("views/generic-semantic-zoom.view.yaml")
  end

  def test_registered_current_sources_match_the_executable_schemas
    paths = %w[
      references/bibliography.yaml
      architectures/diffusion-transformer.yaml
      architectures/generic-feature-refinement.yaml
      views/dit-semantic-zoom.view.yaml
      views/generic-semantic-zoom.view.yaml
      pseudocode/genie3.yaml
      standard_blocks/pair-biased-attention.yaml
      standard_blocks/invariant-point-attention.yaml
    ]

    paths.each do |path|
      assert_empty SourceContract.errors(load_yaml(path)), path
    end
  end

  def test_reusable_board_stub_has_a_separate_source_shape
    view = load_yaml("views/genie3-semantic-zoom.view.yaml")
    stub = view.fetch("boards").find do |board|
      board.fetch("id") == "genie3_ipa_internals"
    end
    assert_equal "standard_block_instance", stub.fetch("kind")
    assert_empty SourceContract.errors(view)

    invalid = deep_copy(view)
    invalid_stub = invalid.fetch("boards").find { |board| board.fetch("id") == stub.fetch("id") }
    invalid_stub["grid"] = { "columns" => 1, "rows" => 1 }
    invalid_stub["nodes"] = [{
      "id" => "copied_internal",
      "ref" => "modules.invariant_point_attention",
      "col" => 1,
      "row" => 1,
    }]

    diagnostics = SourceContract.errors(invalid)
    assert_diagnostic diagnostics, "schema_unknown_property", /grid/
    assert_diagnostic diagnostics, "schema_unknown_property", /nodes/
  end

  def test_reference_panels_are_cited_raster_presentation_not_graph_nodes
    view = deep_copy(@view)
    board = view.fetch("boards").first
    board["reference_panels"] = [{
      "id" => "authors_diagram",
      "title" => "Authors' diagram",
      "asset" => "assets/reference-panels/example/figure_1.png",
      "alt" => "A diagram explaining the architecture.",
      "caption" => "A board-specific reading of the published diagram.",
      "source_ref" => "generic_method_note",
      "locator" => "Figure 1",
      "license_note" => "Used with attribution.",
      "position" => "right",
    }]

    assert_empty SourceContract.errors(view)

    invalid = deep_copy(view)
    panel = invalid.fetch("boards").first.fetch("reference_panels").first
    panel["asset"] = "references/source.svg"
    panel["position"] = "inside_grid"
    panel.delete("license_note")
    diagnostics = SourceContract.errors(invalid)
    assert_diagnostic diagnostics, "schema_pattern", /reference_panels\[0\]\.asset/
    assert_diagnostic diagnostics, "schema_enum", /reference_panels\[0\]\.position/
    assert_diagnostic diagnostics, "schema_required", /reference_panels\[0\]/
  end

  def test_rejects_unknown_fields_and_status_typos
    architecture = deep_copy(@architecture)
    architecture.fetch("modules").first["ouputs"] = []
    architecture.fetch("modules").first.fetch("evidence")["status"] = "confirmd_from_code"

    diagnostics = SourceContract.errors(architecture)
    assert_diagnostic diagnostics, "schema_unknown_property", /ouputs/
    assert_diagnostic diagnostics, "schema_enum", /evidence.status/
  end

  def test_rejects_authored_v04_edges_and_invalid_route_values
    view = deep_copy(@view)
    board = view.fetch("boards").first
    board["edges"] = [{ "from" => "a", "to" => "b", "view_only" => true }]
    board.fetch("edge_overrides").first["route_side"] = "diagonal"

    diagnostics = SourceContract.errors(view)
    assert_diagnostic diagnostics, "schema_unknown_property", /edges/
    assert_diagnostic diagnostics, "schema_enum", /route_side/
  end

  def test_rejects_out_of_contract_relation_kinds
    architecture = deep_copy(@architecture)
    architecture.fetch("relations").first["kind"] = "approximately_flows"

    assert_diagnostic SourceContract.errors(architecture), "schema_enum", /relations\[0\].kind/
  end

  def test_rejects_out_of_contract_module_kinds_and_duplicate_mechanisms
    architecture = deep_copy(@architecture)
    architecture.fetch("modules").first["kind"] = "geometric_attention"
    architecture.fetch("modules").first["mechanisms"] = %w[attention attention]

    diagnostics = SourceContract.errors(architecture)
    assert_diagnostic diagnostics, "schema_enum", /modules\[0\].kind/
    assert_diagnostic diagnostics, "schema_unique_items", /modules\[0\].mechanisms/
  end

  def test_repeat_regions_have_a_typed_execution_backed_shape
    view = deep_copy(@view)
    board = view.fetch("boards").first
    board["regions"] = [{
      "id" => "one_refinement_iteration",
      "kind" => "repeat",
      "execution_ref" => "execution.loops.refinement_loop",
      "label" => "one refinement iteration",
      "node_ids" => %w[input_adapter item_encoder group_refiner output_decoder],
      "iteration_relation_refs" => ["relations.input_adapter_initializes_item_state"],
    }]

    assert_empty SourceContract.errors(view)

    invalid = deep_copy(view)
    region = invalid.fetch("boards").first.fetch("regions").first
    region["kind"] = "custom_box"
    region["execution_ref"] = "modules.group_refiner"
    region["node_ids"] << region.fetch("node_ids").first
    region["iteration_relation_refs"] << region.fetch("iteration_relation_refs").first
    region["stroke"] = "dashed"

    diagnostics = SourceContract.errors(invalid)
    assert_diagnostic diagnostics, "schema_const", /boards\[0\].regions\[0\].kind/
    assert_diagnostic diagnostics, "schema_pattern", /boards\[0\].regions\[0\].execution_ref/
    assert_diagnostic diagnostics, "schema_unique_items", /boards\[0\].regions\[0\].node_ids/
    assert_diagnostic diagnostics, "schema_unique_items", /boards\[0\].regions\[0\].iteration_relation_refs/
    assert_diagnostic diagnostics, "schema_unknown_property", /boards\[0\].regions\[0\].stroke/
  end

  def test_lanes_accept_plain_guides_and_typed_representation_rows
    view = deep_copy(@view)
    board = view.fetch("boards").first
    board["lanes"] = [
      {
        "id" => "conditioning_guide",
        "label" => "conditioning",
        "position" => 18,
      },
      {
        "id" => "single_stream",
        "label" => "single representation",
        "kind" => "representation",
        "row" => 2,
        "representation_refs" => ["representations.item_state"],
        "glyph" => "single",
      },
    ]

    assert_empty SourceContract.errors(view)

    invalid = deep_copy(view)
    lane = invalid.fetch("boards").first.fetch("lanes").last
    lane["position"] = 50
    lane["glyph"] = "matrix"
    lane["representation_refs"] << lane.fetch("representation_refs").first

    assert_diagnostic(
      SourceContract.errors(invalid),
      "schema_oneOf",
      /boards\[0\]\.lanes\[1\]/,
    )
  end

  def test_grid_accepts_opt_in_content_rows_and_rejects_invalid_row_settings
    view = deep_copy(@view)
    grid = view.fetch("boards").first.fetch("grid")
    grid["row_sizing"] = "content"
    grid["row_gap"] = 24

    assert_empty SourceContract.errors(view)

    invalid = deep_copy(view)
    invalid_grid = invalid.fetch("boards").first.fetch("grid")
    invalid_grid["row_sizing"] = "annotation_aware"
    invalid_grid["row_gap"] = -1
    diagnostics = SourceContract.errors(invalid)
    assert_diagnostic diagnostics, "schema_enum", /grid.row_sizing/
    assert_diagnostic diagnostics, "schema_minimum", /grid.row_gap/
  end

  def test_geometry_glyphs_are_valid_on_representations_and_view_nodes
    architecture = load_yaml("architectures/genie3.yaml")
    feature_bundle = architecture.fetch("representations").find { |rep| rep.fetch("id") == "feature_bundle" }
    coordinates = architecture.fetch("representations").find { |rep| rep.fetch("id") == "token_coordinates" }
    frames = architecture.fetch("representations").find { |rep| rep.fetch("id") == "token_frames" }
    assert_equal "dictionary", feature_bundle.fetch("glyph")
    assert_equal "coordinates", coordinates.fetch("glyph")
    assert_equal "frames", frames.fetch("glyph")
    assert_empty SourceContract.errors(architecture)

    view = deep_copy(load_yaml("views/genie3-semantic-zoom.view.yaml"))
    view.fetch("boards").first.fetch("nodes").first["glyph"] = "frames"
    assert_empty SourceContract.errors(view)

    coordinates["glyph"] = "point_cloud"
    view.fetch("boards").first.fetch("nodes").first["glyph"] = "rigid_transform"
    assert_diagnostic SourceContract.errors(architecture), "schema_enum", /representations\[2\].glyph/
    assert_diagnostic SourceContract.errors(view), "schema_enum", /boards\[0\].nodes\[0\].glyph/
  end

  def test_dictionary_representations_accept_evidence_bearing_field_groups
    architecture = deep_copy(@architecture)
    representation = architecture.fetch("representations").first
    representation["field_groups"] = [{
      "id" => "task_conditioning",
      "label" => "Task conditioning",
      "axis" => "token",
      "shape" => "B x N",
      "fields" => %w[cond_seq_mask cond_struct_mask cond_interface_mask],
      "semantic_role" => "Marks which sequence, structure, and interface facts are exposed.",
      "task_behavior" => "The selected task adapter determines which masks are active.",
      "evidence" => deep_copy(representation.fetch("evidence")),
    }]

    assert_empty SourceContract.errors(architecture)

    invalid = deep_copy(architecture)
    group = invalid.fetch("representations").first.fetch("field_groups").first
    group["axis"] = "sample"
    group["fields"] << group.fetch("fields").first
    group.delete("evidence")
    group["color"] = "blue"
    diagnostics = SourceContract.errors(invalid)
    assert_diagnostic diagnostics, "schema_enum", /field_groups\[0\].axis/
    assert_diagnostic diagnostics, "schema_unique_items", /field_groups\[0\].fields/
    assert_diagnostic diagnostics, "schema_required", /field_groups\[0\]/
    assert_diagnostic diagnostics, "schema_unknown_property", /field_groups\[0\].color/
  end

  def test_genie3_sampling_loop_preserves_the_feature_dictionary_identity
    view = load_yaml("views/genie3-semantic-zoom.view.yaml")
    board = view.fetch("boards").find { |item| item.fetch("id") == "sampling_loop" }
    occurrence = board.fetch("nodes").find { |node| node.fetch("id") == "feature_bundle" }

    assert_equal "value_sites.feature_bundle", occurrence.fetch("ref")
    assert_equal "cached feature dictionary", occurrence.fetch("label")
    refute occurrence.key?("glyph"), "the occurrence should inherit the canonical dictionary glyph"
    refute occurrence.key?("notation"), "the occurrence should not imply one tensor named F"
  end

  def test_rejects_parentheses_as_tex_subscript_grouping
    view = deep_copy(load_yaml("views/genie3-semantic-zoom.view.yaml"))
    view.fetch("boards").first.fetch("nodes").first["notation"] = "x_(t-10)"

    assert_diagnostic(
      SourceContract.errors(view),
      "schema_pattern",
      /boards\[0\]\.nodes\[0\]\.notation/,
    )
  end

  def test_architecture_and_view_schemas_share_the_representation_glyph_vocabulary
    architecture_schema = JSON.parse(File.read(File.join(ROOT, "schemas/architecture-v0.4.schema.json")))
    view_schema = JSON.parse(File.read(File.join(ROOT, "schemas/visualization-v0.4.schema.json")))

    assert_equal(
      architecture_schema.dig("$defs", "representationGlyph", "enum"),
      view_schema.dig("$defs", "representationGlyph", "enum"),
    )
    assert_includes architecture_schema.dig("$defs", "representationGlyph", "enum"), "dictionary"
  end

  def test_rejects_duplicate_keys_in_executable_schema_json
    error = Tempfile.create(["duplicate-schema", ".json"]) do |file|
      file.write('{"type":"object","type":"array"}')
      file.flush
      assert_raises(JsonSchemaSubset::DuplicateKeyError) { JsonSchemaSubset.load(file.path) }
    end

    assert_includes error.message, 'duplicate JSON object key "type"'
  end

  private

  def load_yaml(path)
    StrictYaml.load_file(File.join(ROOT, path))
  end

  def deep_copy(value)
    Marshal.load(Marshal.dump(value))
  end

  def assert_diagnostic(diagnostics, code, path_pattern)
    assert diagnostics.any? { |item| item.code == code && path_pattern.match?(item.path) },
      "expected #{code} at #{path_pattern.inspect}, got:\n#{diagnostics.join("\n")}"
  end
end
