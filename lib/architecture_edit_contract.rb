# frozen_string_literal: true

require_relative "json_schema_subset"

# Structural and canonical-payload validation for architecture-edit plans.
# Each plan version owns its operation envelope, while added architecture facts
# are checked against architecture-v0.4's existing definitions so the
# contracts cannot drift independently.
module ArchitectureEditContract
  ROOT = File.expand_path("..", __dir__)
  EDIT_SCHEMAS = {
    "architecture-edit-v0.1" => JsonSchemaSubset.load(
      File.join(ROOT, "schemas/architecture-edit-v0.1.schema.json"),
    ),
    "architecture-edit-v0.2" => JsonSchemaSubset.load(
      File.join(ROOT, "schemas/architecture-edit-v0.2.schema.json"),
    ),
  }.freeze
  # Kept for callers that imported the original constant directly.
  EDIT_SCHEMA = EDIT_SCHEMAS.fetch("architecture-edit-v0.1")
  ARCHITECTURE_SCHEMA = JsonSchemaSubset.load(File.join(ROOT, "schemas/architecture-v0.4.schema.json"))

  ADD_PAYLOADS = {
    "add_module" => ["module", "module"],
    "add_representation" => ["representation", "representation"],
    "add_value_site" => ["value_site", "valueSite"],
    "add_relation" => ["relation", "relation"],
  }.freeze

  class ValidationError < StandardError
    attr_reader :diagnostics

    def initialize(diagnostics)
      @diagnostics = diagnostics
      super(diagnostics.map(&:to_s).join("; "))
    end
  end

  module_function

  def errors(document)
    version = document.is_a?(Hash) ? document["schema_version"] : nil
    schema = EDIT_SCHEMAS.fetch(version, EDIT_SCHEMAS.fetch("architecture-edit-v0.2"))
    diagnostics = JsonSchemaSubset.errors(document, schema)
    return diagnostics unless document.is_a?(Hash) && document["operations"].is_a?(Array)

    document.fetch("operations").each_with_index do |operation, index|
      next unless operation.is_a?(Hash)

      diagnostics.concat(add_payload_errors(operation, index))
      diagnostics.concat(update_errors(operation, index))
      diagnostics.concat(view_update_errors(operation, index))
      diagnostics.concat(edge_override_errors(operation, index))
      diagnostics.concat(scaffold_errors(operation, index))
    end
    diagnostics
  end

  def validate!(document)
    diagnostics = errors(document)
    raise ValidationError, diagnostics unless diagnostics.empty?

    document
  end

  def add_payload_errors(operation, index)
    payload_key, definition = ADD_PAYLOADS[operation["op"]]
    return [] unless payload_key

    payload = operation[payload_key]
    return [] unless payload.is_a?(Hash)

    wrapper = {
      "$ref" => "#/$defs/#{definition}",
      "$defs" => ARCHITECTURE_SCHEMA.fetch("$defs"),
    }
    prefix_diagnostics(
      JsonSchemaSubset.errors(payload, wrapper),
      "$.operations[#{index}].#{payload_key}",
    )
  end
  private_class_method :add_payload_errors

  def update_errors(operation, index)
    return [] unless operation["op"] == "update_entity" && operation["set"].is_a?(Hash)

    set = operation.fetch("set")
    diagnostics = []
    if set.empty?
      diagnostics << JsonSchemaSubset::Diagnostic.new(
        "edit_empty_update",
        "$.operations[#{index}].set",
        "must change at least one field",
      )
    end
    if set.key?("id")
      diagnostics << JsonSchemaSubset::Diagnostic.new(
        "edit_immutable_id",
        "$.operations[#{index}].set.id",
        "stable IDs cannot be changed by update_entity",
      )
    end
    diagnostics
  end
  private_class_method :update_errors

  def view_update_errors(operation, index)
    return [] unless operation["op"] == "update_view_entity" && operation["set"].is_a?(Hash)
    return [] unless operation.fetch("set").empty?

    [
      JsonSchemaSubset::Diagnostic.new(
        "edit_empty_update",
        "$.operations[#{index}].set",
        "must change at least one field",
      ),
    ]
  end
  private_class_method :view_update_errors

  def edge_override_errors(operation, index)
    return [] unless operation["op"] == "set_edge_override" && operation["set"].is_a?(Hash)
    return [] unless operation.fetch("set").empty?

    [
      JsonSchemaSubset::Diagnostic.new(
        "edit_empty_update",
        "$.operations[#{index}].set",
        "must set label, connection, or both",
      ),
    ]
  end
  private_class_method :edge_override_errors

  def scaffold_errors(operation, index)
    return [] unless operation["op"] == "scaffold_board" && operation["board"].is_a?(Hash)

    board = operation.fetch("board")
    diagnostics = []
    columns = board["columns"]
    if board.key?("columns") && (!columns.is_a?(Integer) || columns < 1)
      diagnostics << JsonSchemaSubset::Diagnostic.new(
        "edit_invalid_columns",
        "$.operations[#{index}].board.columns",
        "must be a positive integer",
      )
    end
    node_refs = board["node_refs"]
    if node_refs.is_a?(Array) && node_refs.uniq.length != node_refs.length
      diagnostics << JsonSchemaSubset::Diagnostic.new(
        "edit_duplicate_node_ref",
        "$.operations[#{index}].board.node_refs",
        "must not contain duplicate canonical refs",
      )
    end
    diagnostics
  end
  private_class_method :scaffold_errors

  def prefix_diagnostics(diagnostics, prefix)
    diagnostics.map do |diagnostic|
      suffix = diagnostic.path.delete_prefix("$")
      JsonSchemaSubset::Diagnostic.new(diagnostic.code, "#{prefix}#{suffix}", diagnostic.message)
    end
  end
  private_class_method :prefix_diagnostics
end
