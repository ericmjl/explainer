# frozen_string_literal: true

require "minitest/autorun"
require "tempfile"
require_relative "../lib/strict_yaml"
require_relative "../lib/yaml_source_patch"

class YamlSourcePatchTest < Minitest::Test
  def test_appends_a_top_level_item_without_rewriting_surrounding_source
    source = <<~YAML
      # Hand-authored source header stays byte-for-byte.
      schema_version: example-v0.1
      shared_evidence: &model_evidence
        status: inferred
        refs: [local_source]
      modules:
        - id: encoder
          label: Encoder
          evidence: *model_evidence
      # Keep this collection separator and alias spelling.
      relations:
        - id: input_enters_encoder
          from: value_sites.input
          to: modules.encoder
    YAML
    added = {
      "id" => "decoder",
      "label" => "Decoder",
      "evidence" => {
        "status" => "inferred",
        "refs" => ["local_source"],
      },
    }

    document = YamlSourcePatch::Document.new(source, path: "architecture.yaml")
    document.append_top_level_item("modules", added)
    rendered = document.render

    expected = load_yaml(source)
    expected.fetch("modules") << added
    assert_equal expected, load_yaml(rendered)

    assert_includes rendered, "# Hand-authored source header stays byte-for-byte.\n"
    assert_includes rendered, "shared_evidence: &model_evidence\n"
    assert_includes rendered, "    evidence: *model_evidence\n"
    assert_includes rendered,
      "# Keep this collection separator and alias spelling.\nrelations:\n"

  end

  def test_shallow_update_sets_and_unsets_fields_without_touching_unrelated_aliases
    source = <<~YAML
      schema_version: example-v0.1
      evidence_template: &module_evidence
        status: inferred
        refs: [local_source]
      modules:
        - id: encoder
          label: Original Encoder
          kind: encoder
          role: encode tokens
          note: remove this field
          evidence: *module_evidence
        - id: untouched_decoder
          label: Untouched Decoder # preserve this inline comment
          kind: decoder
          role: decode tokens
          evidence: *module_evidence
      relations: []
    YAML

    document = YamlSourcePatch::Document.new(source, path: "architecture.yaml")
    document.update_top_level_item(
      "modules",
      "encoder",
      set: {
        "label" => "Token Encoder",
        "mechanisms" => ["self_attention", "feed_forward"],
      },
      unset: ["note"],
    )
    rendered = document.render

    assert_includes rendered, "evidence_template: &module_evidence\n"
    assert_equal 2, rendered.scan("evidence: *module_evidence").length
    assert_includes rendered, "label: Untouched Decoder # preserve this inline comment\n"
    refute_includes rendered, "remove this field"

    expected = load_yaml(source)
    encoder = expected.fetch("modules").find { |item| item.fetch("id") == "encoder" }
    encoder["label"] = "Token Encoder"
    encoder["mechanisms"] = ["self_attention", "feed_forward"]
    encoder.delete("note")
    assert_equal expected, load_yaml(rendered)
  end

  def test_inserts_board_ref_on_the_unique_subject_node_and_preserves_board_source
    source = <<~YAML
      schema_version: visualization-v0.4
      shared_note: &layout_note Preserve authored layout
      boards:
        - id: overview
          title: Overview
          notes:
            - *layout_note
          nodes:
            - id: encoder
              ref: modules.encoder
              col: 1
              row: 1
            # The following occurrence must remain in place.
            - id: output
              ref: value_sites.output
              col: 2
              row: 1
        - id: encoder_detail
          title: Encoder Detail
          notes:
            - *layout_note
          nodes:
            - id: inner_encoder
              ref: modules.inner_encoder
              col: 1
              row: 1
    YAML

    document = YamlSourcePatch::Document.new(source, path: "view.yaml")
    document.set_board_ref(
      parent_board_id: "overview",
      subject_ref: "modules.encoder",
      board_ref: "encoder_detail",
    )
    rendered = document.render

    expected = load_yaml(source)
    overview = expected.fetch("boards").find { |board| board.fetch("id") == "overview" }
    encoder = overview.fetch("nodes").find { |node| node.fetch("ref") == "modules.encoder" }
    encoder["board_ref"] = "encoder_detail"
    assert_equal expected, load_yaml(rendered)

    assert_includes rendered, "shared_note: &layout_note Preserve authored layout\n"
    assert_equal 2, rendered.scan("- *layout_note").length
    assert_includes rendered,
      "        row: 1\n" \
      "        board_ref: encoder_detail\n" \
      "      # The following occurrence must remain in place.\n" \
      "      - id: output\n"
  end

  def test_replacing_one_alias_occurrence_materializes_only_that_field
    source = <<~YAML
      evidence_template: &module_evidence
        status: inferred
        refs: [local_source]
      modules:
        - id: encoder
          evidence: *module_evidence
        - id: decoder
          evidence: *module_evidence
      relations: []
    YAML
    replacement = {
      "status" => "open_question",
      "refs" => ["review_needed"],
    }

    document = YamlSourcePatch::Document.new(source, path: "architecture.yaml")
    document.update_top_level_item(
      "modules",
      "encoder",
      set: { "evidence" => replacement },
    )
    rendered = document.render

    assert_includes rendered, "evidence_template: &module_evidence\n"
    assert_equal 1, rendered.scan("evidence: *module_evidence").length
    assert_includes rendered, "    status: open_question\n"
    parsed = load_yaml(rendered)
    encoder, decoder = parsed.fetch("modules")
    assert_equal replacement, encoder.fetch("evidence")
    assert_equal({ "status" => "inferred", "refs" => ["local_source"] }, decoder.fetch("evidence"))
  end

  def test_replaces_one_board_without_rewriting_sibling_boards
    source = <<~YAML
      schema_version: visualization-v0.4
      boards:
        - id: overview
          title: Overview
          summary: Original summary
          nodes:
            - id: encoder
              ref: modules.encoder
              col: 1
              row: 1
        # This sibling and its formatting must remain byte-for-byte.
        - id: encoder_detail
          title: Encoder Detail # preserve inline note
          summary: Explain the encoder.
          nodes: []
    YAML
    replacement = load_yaml(source).fetch("boards").first
    replacement["summary"] = "A clearer overview."
    replacement.fetch("nodes").first["detail"] = "Encode the request into a latent state."

    document = YamlSourcePatch::Document.new(source, path: "view.yaml")
    document.replace_top_level_item("boards", "overview", replacement)
    rendered = document.render

    expected = load_yaml(source)
    expected.fetch("boards")[0] = replacement
    assert_equal expected, load_yaml(rendered)
    assert_includes rendered,
      "# This sibling and its formatting must remain byte-for-byte.\n" \
      "  - id: encoder_detail\n" \
      "    title: Encoder Detail # preserve inline note\n"
  end

  def test_replaces_unicode_board_loaded_as_binary_source
    source = <<~YAML
      schema_version: visualization-v0.4
      boards:
        - id: reverse_step
          title: Reverse Step ×100
          grid: { columns: 1, rows: 1 }
          nodes:
            - id: coordinates
              ref: value_sites.coordinates
              label: xₜ coordinates
              col: 1
              row: 1
    YAML
    replacement = load_yaml(source).fetch("boards").first
    replacement.fetch("grid")["rows"] = 2
    binary = source.b

    document = YamlSourcePatch::Document.new(binary, path: "unicode-view.yaml")
    document.replace_top_level_item("boards", "reverse_step", replacement)
    rendered = document.render

    assert_predicate rendered, :valid_encoding?
    assert_includes rendered, "Reverse Step ×100"
    assert_includes rendered, "xₜ coordinates"
    assert_equal 2, load_yaml(rendered).fetch("boards").first.dig("grid", "rows")
  end

  def test_updates_only_board_grid_and_position_fields_for_semantic_layout
    source = <<~YAML
      schema_version: visualization-v0.4
      boards:
        - id: overview
          title: Overview # preserve this note
          grid:
            columns: 2
            rows: 1
            column_sizing: content
          nodes:
            - id: input
              ref: value_sites.input
              label: Input value # preserve node prose
              col: 1
              row: 1
            - id: encoder
              ref: modules.encoder
              presentation: { treatment: block }
              col: 2
              row: 1
        # Preserve this sibling byte-for-byte.
        - id: detail
          title: Detail
          grid: { columns: 1, rows: 1 }
          nodes: []
    YAML

    document = YamlSourcePatch::Document.new(source, path: "view.yaml")
    document.update_board_layout(
      board_id: "overview",
      grid: { "columns" => 2, "rows" => 3, "column_sizing" => "content" },
      positions: {
        "input" => { "col" => 1, "row" => 2 },
        "encoder" => { "col" => 2, "row" => 2 },
      },
    )
    rendered = document.render

    assert_includes rendered, "title: Overview # preserve this note\n"
    assert_includes rendered, "label: Input value # preserve node prose\n"
    assert_includes rendered, "presentation: { treatment: block }\n"
    assert_includes rendered,
      "# Preserve this sibling byte-for-byte.\n" \
      "  - id: detail\n" \
      "    title: Detail\n" \
      "    grid: { columns: 1, rows: 1 }\n"
    overview = load_yaml(rendered).fetch("boards").first
    assert_equal 3, overview.dig("grid", "rows")
    assert_equal [2, 2], overview.fetch("nodes").map { |node| node.fetch("row") }
  end

  private

  def load_yaml(source)
    Tempfile.create(["yaml-source-patch", ".yaml"]) do |file|
      file.write(source)
      file.flush
      return StrictYaml.load_file(file.path)
    end
  end
end
