# frozen_string_literal: true

require "minitest/autorun"
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
    ]

    paths.each do |path|
      assert_empty SourceContract.errors(load_yaml(path)), path
    end
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
