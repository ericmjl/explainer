# frozen_string_literal: true

require "set"

require_relative "json_schema_subset"

# Resolves standard-block-v0.3 symbolic shape contracts against one concrete
# architecture occurrence. Boundary axes come from canonical carried
# representations; model configuration that cannot be inferred is supplied by
# the block instance. The resulting shapes are a compilation artifact.
module StandardBlockShapes
  Diagnostic = JsonSchemaSubset::Diagnostic
  SUPPORTED_VERSION = "standard-block-v0.3"

  Result = Data.define(:parameter_bindings, :parameter_sources, :shapes)

  class ResolutionError < StandardError
    attr_reader :diagnostics

    def initialize(diagnostics)
      @diagnostics = diagnostics
      super(diagnostics.map(&:to_s).join("; "))
    end
  end

  module_function

  def definition_errors(block)
    return [] unless block.is_a?(Hash) && block["schema_version"] == SUPPORTED_VERSION

    diagnostics = []
    parameters = Array(block["parameters"])
    parameter_ids = parameters.filter_map { |parameter| parameter["id"] }
    duplicates = parameter_ids.tally.select { |_id, count| count > 1 }.keys
    duplicates.sort.each do |id|
      diagnostics << diagnostic("duplicate_shape_parameter", "$.parameters", "duplicate shape parameter #{id}")
    end

    declared = parameter_ids.to_set
    shape_objects(block).each do |path, contract|
      each_dimension(contract) do |dimension, dimension_path|
        next if dimension.is_a?(Integer) || declared.include?(dimension)

        diagnostics << diagnostic(
          "unknown_shape_parameter",
          "#{path}#{dimension_path}",
          "shape dimension #{dimension.inspect} is not declared in parameters",
        )
      end
      duplicate_shape_member_errors(contract, path).each { |item| diagnostics << item }
    end
    diagnostics
  end

  def resolution_errors(block:, instance:, architecture:, relations_by_ref:, representations_by_ref:, active_steps: nil)
    return [] unless block["schema_version"] == SUPPORTED_VERSION

    Resolver.new(
      block: block,
      instance: instance,
      architecture: architecture,
      relations_by_ref: relations_by_ref,
      representations_by_ref: representations_by_ref,
      active_steps: active_steps,
    ).resolve.diagnostics
  end

  def resolve!(block:, instance:, architecture:, relations_by_ref:, representations_by_ref:, active_steps: nil)
    return Result.new({}, {}, {}) unless block["schema_version"] == SUPPORTED_VERSION

    outcome = Resolver.new(
      block: block,
      instance: instance,
      architecture: architecture,
      relations_by_ref: relations_by_ref,
      representations_by_ref: representations_by_ref,
      active_steps: active_steps,
    ).resolve
    raise ResolutionError, outcome.diagnostics unless outcome.diagnostics.empty?

    outcome.result
  end

  Outcome = Data.define(:result, :diagnostics)

  class Resolver
    def initialize(block:, instance:, architecture:, relations_by_ref:, representations_by_ref:, active_steps:)
      @block = block
      @instance = instance
      @architecture = architecture
      @relations_by_ref = relations_by_ref
      @representations_by_ref = representations_by_ref
      @active_steps = active_steps || Array(block["steps"])
      @parameters = Array(block["parameters"]).to_h { |parameter| [parameter.fetch("id"), parameter] }
      @bindings = {}
      @sources = {}
      @diagnostics = []
    end

    def resolve
      resolve_instance_bindings
      resolve_boundary_bindings
      require_complete_bindings
      shapes = resolve_shapes
      validate_shape_rules(shapes)
      Outcome.new(Result.new(@bindings.dup, @sources.dup, shapes), @diagnostics)
    end

    private

    def resolve_instance_bindings
      bindings = Array(@instance["parameter_bindings"])
      duplicate_refs = bindings.filter_map { |binding| binding["parameter_ref"] }
        .tally.select { |_ref, count| count > 1 }.keys
      duplicate_refs.sort.each do |ref|
        @diagnostics << StandardBlockShapes.diagnostic(
          "duplicate_shape_parameter_binding", "$.block_instances.#{@instance['id']}.parameter_bindings",
          "#{ref} is bound more than once",
        )
      end

      bindings.each_with_index do |binding, index|
        path = "$.block_instances.#{@instance['id']}.parameter_bindings[#{index}]"
        parameter_ref = binding["parameter_ref"]
        parameter_id = parameter_ref.to_s.delete_prefix("parameters.")
        parameter = @parameters[parameter_id]
        unless parameter
          @diagnostics << StandardBlockShapes.diagnostic(
            "unknown_shape_parameter_binding", "#{path}.parameter_ref",
            "cannot resolve #{parameter_ref.inspect} in #{@block['id']}",
          )
          next
        end
        unless parameter["resolution"] == "instance"
          @diagnostics << StandardBlockShapes.diagnostic(
            "invalid_shape_parameter_binding", "#{path}.parameter_ref",
            "#{parameter_ref} is inferred from a boundary and must not be supplied by the instance",
          )
          next
        end

        value, source = binding_value(binding, path)
        unless value.nil? || (value.is_a?(Integer) && value.positive?)
          @diagnostics << StandardBlockShapes.diagnostic(
            "invalid_shape_parameter_value", path,
            "#{parameter_ref} must resolve to a positive integer, got #{value.inspect}",
          )
          next
        end
        bind(parameter_id, value, source, path) unless value.nil?
      end
    end

    def binding_value(binding, path)
      if binding.key?("value")
        [binding["value"], { "kind" => "literal" }]
      elsif binding["configuration_ref"]
        ref = binding.fetch("configuration_ref")
        key = ref.delete_prefix("reference_configuration.")
        configuration = @architecture["reference_configuration"]
        unless configuration.is_a?(Hash) && configuration.key?(key)
          @diagnostics << StandardBlockShapes.diagnostic(
            "unknown_shape_configuration_ref", "#{path}.configuration_ref",
            "cannot resolve #{ref.inspect}",
          )
          return [nil, nil]
        end
        [configuration.fetch(key), { "kind" => "configuration", "ref" => ref }]
      else
        [nil, nil]
      end
    end

    def resolve_boundary_bindings
      ports = Array(@block["ports"]).to_h { |port| ["ports.#{port.fetch('id')}", port] }
      bindings = Array(@instance["port_bindings"]).to_h { |binding| [binding.fetch("port_ref"), binding] }
      ports.each do |port_ref, port|
        binding = bindings[port_ref]
        next unless binding

        representation_ref, representation = representation_for(binding)
        next unless representation

        contract = port["shape_contract"]
        dimensions = parse_architecture_shape(representation["shape"], contract)
        if dimensions.nil?
          unless binding["selector"]
            @diagnostics << StandardBlockShapes.diagnostic(
              "shape_boundary_mismatch", "$.block_instances.#{@instance['id']}.port_bindings",
              "#{port_ref} contract cannot unify with #{representation_ref} shape #{representation['shape'].inspect}",
            )
          end
          next
        end

        contract_axes(contract).zip(dimensions).each do |axis, dimension|
          symbolic = axis["dimension"]
          next if symbolic.is_a?(Integer)

          bind(
            symbolic,
            dimension,
            { "kind" => "boundary", "portRef" => port_ref, "representationRef" => representation_ref },
            "$.block_instances.#{@instance['id']}.port_bindings",
          )
        end
      end
    end

    def representation_for(binding)
      relation_ref = Array(binding["relation_refs"]).first
      relation = relation_ref && @relations_by_ref[relation_ref]
      carries = Array(relation && relation["carries"])
      selector = binding["selector"]
      selected = if selector
        carries.find { |ref| ref == selector || ref.delete_prefix("representations.") == selector }
      end
      representation_ref = selected || (carries.one? ? carries.first : nil)
      if carries.length > 1 && representation_ref.nil?
        @diagnostics << StandardBlockShapes.diagnostic(
          "ambiguous_shape_boundary", "$.block_instances.#{@instance['id']}.port_bindings",
          "#{binding['port_ref']} carries multiple representations; selector must name one representation",
        )
      end
      [representation_ref, representation_ref && @representations_by_ref[representation_ref]]
    end

    def parse_architecture_shape(shape, contract)
      return nil unless shape.is_a?(String)
      return nil if contract["kind"] == "tuple"

      dimensions = split_shape(shape)
      expected = contract_axes(contract).length
      if contract["kind"] == "frames"
        return nil if dimensions.length < expected

        dimensions = dimensions.first(expected)
      elsif dimensions.length != expected
        return nil
      end
      dimensions.map { |dimension| normalize_dimension(dimension) }
    end

    def split_shape(shape)
      normalized = shape.gsub("×", "x")
      parts = []
      buffer = +""
      depth = 0
      normalized.each_char do |character|
        depth += 1 if character == "("
        depth -= 1 if character == ")"
        if character == "x" && depth.zero?
          parts << buffer.strip
          buffer = +""
        else
          buffer << character
        end
      end
      parts << buffer.strip unless buffer.strip.empty?
      parts
    end

    def normalize_dimension(dimension)
      token = dimension.strip
      token.match?(/\A[1-9][0-9]*\z/) ? token.to_i : token
    end

    def bind(parameter_id, value, source, path)
      return unless @parameters.key?(parameter_id)
      return if value.nil?

      if @bindings.key?(parameter_id) && @bindings[parameter_id] != value
        @diagnostics << StandardBlockShapes.diagnostic(
          "shape_parameter_conflict", path,
          "#{parameter_id} resolves to both #{@bindings[parameter_id].inspect} and #{value.inspect}",
        )
        return
      end
      @bindings[parameter_id] = value
      @sources[parameter_id] ||= source
    end

    def require_complete_bindings
      @parameters.each do |id, parameter|
        next if @bindings.key?(id)

        code = parameter["resolution"] == "instance" ? "missing_shape_parameter_binding" : "unresolved_boundary_shape_parameter"
        @diagnostics << StandardBlockShapes.diagnostic(
          code,
          "$.block_instances.#{@instance['id']}.parameter_bindings",
          "parameters.#{id} (#{parameter['role']}) could not be resolved",
        )
      end
    end

    def resolve_shapes
      StandardBlockShapes.shape_objects(@block).to_h do |_path, contract, local_ref|
        [local_ref, resolve_contract(contract)]
      end
    end

    def resolve_contract(contract)
      case contract.fetch("kind")
      when "tuple"
        fields = contract.fetch("fields").map do |field|
          { "id" => field.fetch("id"), "shape" => resolve_contract(field.fetch("shape")) }
        end
        { "kind" => "tuple", "fields" => fields, "label" => fields.map { |field| "#{field['id']}: #{field.dig('shape', 'label')}" }.join("; ") }
      when "tensor", "frames"
        axes = contract.fetch("axes").map do |axis|
          dimension = axis.fetch("dimension")
          { "id" => axis.fetch("id"), "dimension" => dimension.is_a?(Integer) ? dimension : @bindings[dimension] }
        end
        { "kind" => contract.fetch("kind"), "axes" => axes, "label" => axes.map { |axis| axis.fetch("dimension") }.join(" x ") }
      end
    end

    def validate_shape_rules(shapes)
      @active_steps.each do |step|
        inputs = Array(step["inputs"]).filter_map { |ref| shapes[ref] }
        outputs = Array(step["outputs"]).filter_map { |ref| shapes[ref] }
        case step["shape_rule"]
        when "rigid_apply", "preserve"
          require_equal_shapes(step, inputs.first, outputs.first)
        when "residual_add"
          inputs.each { |shape| require_equal_shapes(step, shape, outputs.first) }
        when "logit_composition"
          logit_inputs = inputs.select { |shape| tensor_axis_ids(shape) == %w[batch head query_token key_token] }
          logit_inputs.each { |shape| require_equal_shapes(step, shape, outputs.first) }
        when "softmax"
          require_equal_shapes(step, inputs.first, outputs.first)
        when "attention_logits", "point_distance_logits"
          require_axis_ids(step, outputs.first, %w[batch head query_token key_token])
        when "pair_bias_projection"
          require_axis_ids(step, outputs.first, %w[batch head query_token key_token])
        when "weighted_sum"
          require_axis_ids(step, outputs.first, %w[batch query_token head value_channel])
        when "weighted_point_sum"
          require_axis_ids(step, outputs.first, %w[batch query_token head value_point coordinate])
        when "rigid_inverse_apply"
          require_axis_ids(step, outputs.first, %w[batch query_token head value_point point_feature])
        when "pair_value_aggregation"
          require_axis_ids(step, outputs.first, %w[batch query_token head pair_channel])
        when "broadcast_sum"
          inputs.each { |shape| require_axis_ids(step, shape, %w[batch token pair_channel]) }
          require_equal_shapes(step, inputs[0], inputs[1]) if inputs.length >= 2
          require_axis_ids(step, outputs.first, %w[batch query_token key_token pair_channel])
          input_dimensions = tensor_dimensions(inputs.first)
          output_dimensions = tensor_dimensions(outputs.first)
          expected_dimensions = if input_dimensions.length == 3
            [input_dimensions[0], input_dimensions[1], input_dimensions[1], input_dimensions[2]]
          else
            []
          end
          unless expected_dimensions == output_dimensions
            @diagnostics << StandardBlockShapes.diagnostic(
              "shape_rule_mismatch", "$.steps.#{step['id']}.shape_rule",
              "broadcast_sum expects B x N x C to become B x N x N x C",
            )
          end
        when "output_projection"
          require_axis_ids(step, outputs.first, %w[batch query_token single_channel])
        end
      end
    end

    def require_equal_shapes(step, left, right)
      return if left == right

      @diagnostics << StandardBlockShapes.diagnostic(
        "shape_rule_mismatch", "$.steps.#{step['id']}.shape_rule",
        "#{step['shape_rule']} requires matching input/output shapes",
      )
    end

    def require_axis_ids(step, shape, expected)
      actual = tensor_axis_ids(shape)
      return if actual == expected

      @diagnostics << StandardBlockShapes.diagnostic(
        "shape_rule_mismatch", "$.steps.#{step['id']}.shape_rule",
        "#{step['shape_rule']} expects axes #{expected.join(', ')}, got #{actual.join(', ')}",
      )
    end

    def tensor_axis_ids(shape)
      return [] unless shape && %w[tensor frames].include?(shape["kind"])

      Array(shape["axes"]).map { |axis| axis["id"] }
    end

    def tensor_dimensions(shape)
      return [] unless shape && %w[tensor frames].include?(shape["kind"])

      Array(shape["axes"]).map { |axis| axis["dimension"] }
    end

    def contract_axes(contract)
      Array(contract && contract["axes"])
    end
  end

  def shape_objects(block)
    objects = []
    %w[ports values].each do |collection|
      Array(block[collection]).each_with_index do |object, index|
        contract = object["shape_contract"]
        next unless contract

        objects << ["$.#{collection}[#{index}].shape_contract", contract, "#{collection}.#{object['id']}"]
      end
    end
    objects
  end

  def each_dimension(contract, path = "")
    if contract["kind"] == "tuple"
      Array(contract["fields"]).each_with_index do |field, index|
        each_dimension(field["shape"], "#{path}.fields[#{index}].shape") { |dimension, child_path| yield dimension, child_path }
      end
    else
      Array(contract["axes"]).each_with_index do |axis, index|
        yield axis["dimension"], "#{path}.axes[#{index}].dimension"
      end
    end
  end

  def duplicate_shape_member_errors(contract, path)
    diagnostics = []
    if contract["kind"] == "tuple"
      fields = Array(contract["fields"])
      fields.filter_map { |field| field["id"] }.tally.select { |_id, count| count > 1 }.each_key do |id|
        diagnostics << diagnostic("duplicate_shape_field", "#{path}.fields", "duplicate tuple field #{id}")
      end
      fields.each_with_index do |field, index|
        diagnostics.concat(duplicate_shape_member_errors(field["shape"], "#{path}.fields[#{index}].shape"))
      end
    else
      axes = Array(contract["axes"])
      axes.filter_map { |axis| axis["id"] }.tally.select { |_id, count| count > 1 }.each_key do |id|
        diagnostics << diagnostic("duplicate_shape_axis", "#{path}.axes", "duplicate shape axis #{id}")
      end
    end
    diagnostics
  end

  def diagnostic(code, path, message)
    Diagnostic.new(code, path, message)
  end
end
