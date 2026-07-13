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
    JsonSchemaSubset.errors(document, schema)
  end

  def validate!(document)
    diagnostics = errors(document)
    raise ValidationError, diagnostics unless diagnostics.empty?

    document
  end
end
