# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/architecture_edit_contract"
require_relative "../lib/strict_yaml"

class ArchitectureEditContractTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @architecture = StrictYaml.load_file(File.join(ROOT, "architectures/generic-feature-refinement.yaml"))
  end

  def test_accepts_each_supported_operation_and_optional_base_digests
    plan = valid_plan(
      { "op" => "add_module", "module" => copy(@architecture.fetch("modules").first) },
      { "op" => "add_representation", "representation" => copy(@architecture.fetch("representations").first) },
      { "op" => "add_value_site", "value_site" => copy(@architecture.fetch("value_sites").first) },
      { "op" => "add_relation", "relation" => copy(@architecture.fetch("relations").first) },
      {
        "op" => "update_entity",
        "ref" => "modules.input_adapter",
        "expect" => { "label" => "Input Adapter" },
        "set" => { "label" => "Request Adapter" },
      },
      {
        "op" => "scaffold_board",
        "board" => {
          "id" => "input_adapter_detail",
          "title" => "Input Adapter",
          "summary" => "Expand how raw inputs become item features.",
          "parent" => "overview",
          "subject_ref" => "modules.input_adapter",
          "expansion_depth" => 1,
          "columns" => 3,
          "node_refs" => ["modules.input_adapter", "value_sites.raw_records_input"],
        },
      },
    )
    plan.fetch("target")["architecture_sha256"] = "a" * 64
    plan.fetch("target")["view_sha256"] = "b" * 64

    assert_empty ArchitectureEditContract.errors(plan)
    assert_same plan, ArchitectureEditContract.validate!(plan)
  end

  def test_rejects_unknown_operations_and_envelope_fields
    plan = valid_plan({ "op" => "upsert_module", "module" => {} })
    plan["surprise"] = true

    diagnostics = ArchitectureEditContract.errors(plan)

    assert_diagnostic diagnostics, "schema_unknown_property", /surprise/
    assert_diagnostic diagnostics, "schema_oneOf", /operations\[0\]/
  end

  def test_rejects_bad_target_digest
    plan = valid_plan({ "op" => "update_entity", "ref" => "modules.input_adapter", "set" => { "label" => "Adapter" } })
    plan.fetch("target")["architecture_sha256"] = "not-a-digest"

    assert_diagnostic ArchitectureEditContract.errors(plan), "schema_pattern", /architecture_sha256/
  end

  def test_add_module_uses_the_canonical_architecture_definition
    mod = copy(@architecture.fetch("modules").first)
    mod.delete("evidence")
    mod["kind"] = "mystery_block"

    diagnostics = ArchitectureEditContract.errors(valid_plan({ "op" => "add_module", "module" => mod }))

    assert_diagnostic diagnostics, "schema_required", /operations\[0\]\.module\.evidence/
    assert_diagnostic diagnostics, "schema_enum", /operations\[0\]\.module\.kind/
  end

  def test_other_add_operations_use_their_canonical_definitions
    representation = copy(@architecture.fetch("representations").first)
    representation["unexpected"] = true
    value_site = copy(@architecture.fetch("value_sites").first)
    value_site["representation_ref"] = "raw_records"
    relation = copy(@architecture.fetch("relations").first)
    relation["kind"] = "approximately_flows"

    diagnostics = ArchitectureEditContract.errors(valid_plan(
      { "op" => "add_representation", "representation" => representation },
      { "op" => "add_value_site", "value_site" => value_site },
      { "op" => "add_relation", "relation" => relation },
    ))

    assert_diagnostic diagnostics, "schema_unknown_property", /operations\[0\]\.representation\.unexpected/
    assert_diagnostic diagnostics, "schema_pattern", /operations\[1\]\.value_site\.representation_ref/
    assert_diagnostic diagnostics, "schema_enum", /operations\[2\]\.relation\.kind/
  end

  def test_update_requires_a_change_and_cannot_change_a_stable_id
    diagnostics = ArchitectureEditContract.errors(valid_plan(
      { "op" => "update_entity", "ref" => "modules.input_adapter", "set" => {} },
      { "op" => "update_entity", "ref" => "modules.input_adapter", "set" => { "id" => "renamed" } },
    ))

    assert_diagnostic diagnostics, "edit_empty_update", /operations\[0\]\.set/
    assert_diagnostic diagnostics, "edit_immutable_id", /operations\[1\]\.set\.id/
    assert_raises(ArchitectureEditContract::ValidationError) do
      ArchitectureEditContract.validate!(valid_plan(
        { "op" => "update_entity", "ref" => "modules.input_adapter", "set" => { "id" => "renamed" } },
      ))
    end
  end

  def test_scaffold_columns_must_be_positive
    plan = valid_plan(
      {
        "op" => "scaffold_board",
        "board" => {
          "id" => "bad_layout",
          "title" => "Bad Layout",
          "summary" => "Exercise the column contract.",
          "subject_ref" => "modules.input_adapter",
          "columns" => 0,
        },
      },
    )

    assert_diagnostic ArchitectureEditContract.errors(plan), "edit_invalid_columns", /columns/
  end

  private

  def valid_plan(*operations)
    {
      "schema_version" => "architecture-edit-v0.1",
      "id" => "test_edit",
      "target" => { "source_set" => "generic" },
      "intent" => "Exercise the edit contract.",
      "operations" => operations,
    }
  end

  def copy(value)
    Marshal.load(Marshal.dump(value))
  end

  def assert_diagnostic(diagnostics, code, path_pattern)
    assert diagnostics.any? { |item| item.code == code && path_pattern.match?(item.path) },
      "expected #{code} at #{path_pattern.inspect}, got:\n#{diagnostics.join("\n")}"
  end
end
