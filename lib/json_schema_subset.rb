# frozen_string_literal: true

require "json"

# A deliberately small JSON Schema 2020-12 evaluator for the keywords used by
# this repository's source contracts. Keeping the schemas standard JSON makes
# them consumable by a future Python authoring frontend without adding a Ruby
# gem dependency to the current compiler.
module JsonSchemaSubset
  class DuplicateKeyError < StandardError; end

  class StrictObject < Hash
    def []=(key, value)
      raise DuplicateKeyError, "duplicate JSON object key #{key.inspect}" if key?(key)

      super
    end
  end
  private_constant :StrictObject

  Diagnostic = Data.define(:code, :path, :message) do
    def to_s
      "[#{code}] #{path}: #{message}"
    end
  end

  module_function

  def load(path)
    JSON.parse(File.read(path), object_class: StrictObject)
  rescue DuplicateKeyError => e
    raise DuplicateKeyError, "#{path}: #{e.message}"
  end

  def errors(instance, schema)
    validate(instance, schema, schema, "$")
  end

  def validate(instance, schema, root, path)
    return [] if schema == true
    return [diagnostic("schema_false", path, "value is forbidden")] if schema == false

    if schema["$ref"]
      return validate(instance, resolve_ref(root, schema.fetch("$ref")), root, path)
    end

    diagnostics = []
    diagnostics.concat(validate_combinators(instance, schema, root, path))
    diagnostics.concat(validate_type(instance, schema, path))
    return diagnostics unless diagnostics.empty?

    diagnostics.concat(validate_scalar(instance, schema, path))
    diagnostics.concat(validate_object(instance, schema, root, path)) if instance.is_a?(Hash)
    diagnostics.concat(validate_array(instance, schema, root, path)) if instance.is_a?(Array)
    diagnostics
  end
  private_class_method :validate

  def validate_combinators(instance, schema, root, path)
    diagnostics = []
    Array(schema["allOf"]).each do |candidate|
      diagnostics.concat(validate(instance, candidate, root, path))
    end

    %w[anyOf oneOf].each do |keyword|
      next unless schema[keyword]

      matches = schema.fetch(keyword).count { |candidate| validate(instance, candidate, root, path).empty? }
      valid = keyword == "anyOf" ? matches.positive? : matches == 1
      diagnostics << diagnostic("schema_#{keyword}", path, "must match #{keyword} alternatives (matched #{matches})") unless valid
    end
    diagnostics
  end
  private_class_method :validate_combinators

  def validate_type(instance, schema, path)
    return [] unless schema["type"]

    accepted = Array(schema.fetch("type"))
    return [] if accepted.any? { |type| type_match?(instance, type) }

    [diagnostic("schema_type", path, "expected #{accepted.join(' or ')}, got #{ruby_type(instance)}")]
  end
  private_class_method :validate_type

  def validate_scalar(instance, schema, path)
    diagnostics = []
    if schema.key?("const") && instance != schema["const"]
      diagnostics << diagnostic("schema_const", path, "must equal #{schema['const'].inspect}")
    end
    if schema["enum"] && !schema.fetch("enum").include?(instance)
      diagnostics << diagnostic("schema_enum", path, "must be one of #{schema['enum'].map(&:inspect).join(', ')}")
    end
    if instance.is_a?(String)
      diagnostics << diagnostic("schema_pattern", path, "does not match #{schema['pattern']}") if schema["pattern"] && !Regexp.new(schema.fetch("pattern")).match?(instance)
      diagnostics << diagnostic("schema_min_length", path, "must not be empty") if schema["minLength"] && instance.length < schema.fetch("minLength")
    end
    if instance.is_a?(Numeric)
      diagnostics << diagnostic("schema_minimum", path, "must be at least #{schema['minimum']}") if schema.key?("minimum") && instance < schema.fetch("minimum")
      diagnostics << diagnostic("schema_maximum", path, "must be at most #{schema['maximum']}") if schema.key?("maximum") && instance > schema.fetch("maximum")
      diagnostics << diagnostic("schema_exclusive_minimum", path, "must be greater than #{schema['exclusiveMinimum']}") if schema.key?("exclusiveMinimum") && instance <= schema.fetch("exclusiveMinimum")
    end
    diagnostics
  end
  private_class_method :validate_scalar

  def validate_object(instance, schema, root, path)
    diagnostics = []
    Array(schema["required"]).each do |key|
      diagnostics << diagnostic("schema_required", "#{path}.#{key}", "required property is missing") unless instance.key?(key)
    end

    properties = schema["properties"] || {}
    additional = schema.fetch("additionalProperties", true)
    instance.each do |key, value|
      child_path = "#{path}.#{key}"
      if properties.key?(key)
        diagnostics.concat(validate(value, properties.fetch(key), root, child_path))
      elsif additional == false
        diagnostics << diagnostic("schema_unknown_property", child_path, "unknown property")
      elsif additional.is_a?(Hash)
        diagnostics.concat(validate(value, additional, root, child_path))
      end
    end
    diagnostics
  end
  private_class_method :validate_object

  def validate_array(instance, schema, root, path)
    diagnostics = []
    diagnostics << diagnostic("schema_min_items", path, "requires at least #{schema['minItems']} item(s)") if schema["minItems"] && instance.length < schema.fetch("minItems")
    if schema["uniqueItems"] && instance.uniq.length != instance.length
      diagnostics << diagnostic("schema_unique_items", path, "items must be unique")
    end
    if schema["items"]
      instance.each_with_index do |item, index|
        diagnostics.concat(validate(item, schema.fetch("items"), root, "#{path}[#{index}]"))
      end
    end
    diagnostics
  end
  private_class_method :validate_array

  def resolve_ref(root, ref)
    raise ArgumentError, "only local JSON Schema refs are supported: #{ref}" unless ref.start_with?("#/")

    ref.delete_prefix("#/").split("/").reduce(root) do |value, component|
      value.fetch(component.gsub("~1", "/").gsub("~0", "~"))
    end
  end
  private_class_method :resolve_ref

  def type_match?(instance, type)
    case type
    when "object" then instance.is_a?(Hash)
    when "array" then instance.is_a?(Array)
    when "string" then instance.is_a?(String)
    when "integer" then instance.is_a?(Integer)
    when "number" then instance.is_a?(Numeric)
    when "boolean" then instance == true || instance == false
    when "null" then instance.nil?
    else false
    end
  end
  private_class_method :type_match?

  def ruby_type(instance)
    case instance
    when Hash then "object"
    when Array then "array"
    when String then "string"
    when Integer then "integer"
    when Numeric then "number"
    when TrueClass, FalseClass then "boolean"
    when NilClass then "null"
    else instance.class.name
    end
  end
  private_class_method :ruby_type

  def diagnostic(code, path, message)
    Diagnostic.new(code, path, message)
  end
  private_class_method :diagnostic
end
