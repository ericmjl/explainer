# frozen_string_literal: true

require_relative "json_schema_subset"

# Structural validation shared by linting and manifest compilation. Semantic
# graph invariants remain in the ownership, coverage, and projection passes;
# this layer rejects malformed or misspelled source structure before those
# passes can silently ignore it.
module SourceContract
  ROOT = File.expand_path("..", __dir__)
  SCHEMAS = {
    "architecture-v0.4" => "schemas/architecture-v0.4.schema.json",
    "visualization-v0.4" => "schemas/visualization-v0.4.schema.json",
    "bibliography-v0.1" => "schemas/bibliography-v0.1.schema.json",
    "standard-block-v0.2" => "schemas/standard-block-v0.2.schema.json",
    "pseudocode-v0.2" => "schemas/pseudocode-v0.2.schema.json",
    "architecture-comparison-v0.1" => "schemas/architecture-comparison-v0.1.schema.json",
    "comparison-registry-v0.1" => "schemas/comparison-registry-v0.1.schema.json",
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
    schema_path = SCHEMAS[version]
    return [JsonSchemaSubset::Diagnostic.new("unsupported_schema", "$.schema_version", "unsupported schema #{version.inspect}")] unless schema_path

    schema = JsonSchemaSubset.load(File.join(ROOT, schema_path))
    diagnostics = JsonSchemaSubset.errors(document, schema)
    diagnostics.concat(visualization_board_errors(document)) if version == "visualization-v0.4"
    diagnostics
  end

  def validate!(document)
    diagnostics = errors(document)
    raise ValidationError, diagnostics unless diagnostics.empty?

    document
  end

  def visualization_board_errors(document)
    Array(document["boards"]).each_with_index.flat_map do |board, index|
      next [] unless board.is_a?(Hash)

      path = "$.boards[#{index}]"
      if board["kind"] == "standard_block_instance"
        errors = []
        %w[parent block_instance_ref].each do |field|
          next if board[field].is_a?(String) && !board[field].empty?

          errors << JsonSchemaSubset::Diagnostic.new(
            "schema_required", path, "missing required property #{field}",
          )
        end
        %w[grid nodes regions lanes elide exclude edge_overrides reference_panels].each do |field|
          next unless board.key?(field)

          errors << JsonSchemaSubset::Diagnostic.new(
            "schema_unknown_property", "#{path}.#{field}",
            "#{field} belongs to architecture boards; reusable boards derive it from the standard block",
          )
        end
        errors
      else
        errors = []
        errors << JsonSchemaSubset::Diagnostic.new(
          "schema_required", path, "missing required property grid",
        ) unless board["grid"].is_a?(Hash)
        unless board["nodes"].is_a?(Array) && !board["nodes"].empty?
          errors << JsonSchemaSubset::Diagnostic.new(
            "schema_required", path, "missing required non-empty property nodes",
          )
        end
        if board.key?("block_instance_ref")
          errors << JsonSchemaSubset::Diagnostic.new(
            "schema_unknown_property", "#{path}.block_instance_ref",
            "block_instance_ref requires kind: standard_block_instance",
          )
        end
        errors
      end
    end
  end
  private_class_method :visualization_board_errors
end
