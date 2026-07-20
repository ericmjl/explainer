# frozen_string_literal: true

require "set"

require_relative "json_schema_subset"
require_relative "source_contract"
require_relative "standard_block_shapes"

# Structural and semantic contract for reusable algorithm blocks. Templates own
# local algorithm anatomy; architecture block_instances own concrete uses and
# bind public ports to canonical relations without copying their endpoints.
module StandardBlockContract
  Diagnostic = JsonSchemaSubset::Diagnostic
  SUPPORTED_VERSIONS = %w[standard-block-v0.2 standard-block-v0.3].freeze

  class ValidationError < StandardError
    attr_reader :diagnostics

    def initialize(diagnostics)
      @diagnostics = diagnostics
      super(diagnostics.map(&:to_s).join("; "))
    end
  end

  module_function

  def definition_errors(block)
    diagnostics = SourceContract.errors(block)
    return diagnostics unless block.is_a?(Hash) && SUPPORTED_VERSIONS.include?(block["schema_version"])

    diagnostics + semantic_definition_errors(block) + StandardBlockShapes.definition_errors(block)
  end

  def validate_definition!(block)
    diagnostics = definition_errors(block)
    raise ValidationError, diagnostics unless diagnostics.empty?

    block
  end

  def instance_errors(architecture, blocks_by_path:, registered_blocks: nil)
    return [] unless architecture.is_a?(Hash)

    registered = Set.new(registered_blocks || blocks_by_path.keys)
    modules = Array(architecture["modules"])
    modules_by_ref = modules.to_h { |mod| ["modules.#{mod['id']}", mod] }
    relations = Array(architecture["relations"])
    relations_by_ref = relations.to_h { |relation| ["relations.#{relation['id']}", relation] }
    instances = Array(architecture["block_instances"])
    diagnostics = duplicate_id_errors(instances, "$.block_instances", "block instance")

    instances.each_with_index do |instance, index|
      path = "$.block_instances[#{index}]"
      block_ref = instance["block_ref"]
      subject_ref = instance["subject_ref"]
      block = blocks_by_path[block_ref]
      unless registered.include?(block_ref)
        diagnostics << diagnostic(
          "unregistered_standard_block", "#{path}.block_ref",
          "#{block_ref.inspect} is not registered for this source set",
        )
        next
      end
      unless block
        diagnostics << diagnostic("unknown_standard_block", "#{path}.block_ref", "cannot resolve #{block_ref.inspect}")
        next
      end
      unless SUPPORTED_VERSIONS.include?(block["schema_version"])
        diagnostics << diagnostic(
          "legacy_block_instance", "#{path}.block_ref",
          "block instances require standard-block-v0.2 or v0.3; #{block_ref} is #{block['schema_version'].inspect}",
        )
        next
      end

      subject = modules_by_ref[subject_ref]
      unless subject
        diagnostics << diagnostic("unknown_block_subject", "#{path}.subject_ref", "cannot resolve #{subject_ref.inspect}")
        next
      end
      if subject.dig("decomposition", "status") == "opaque"
        diagnostics << diagnostic(
          "opaque_block_subject", "#{path}.subject_ref",
          "#{subject_ref} is opaque and cannot claim reusable internals",
        )
      end

      variant_ids = Array(block["variants"]).filter_map { |variant| variant["id"] }.to_set
      unless variant_ids.include?(instance["variant"])
        diagnostics << diagnostic(
          "unknown_block_variant", "#{path}.variant",
          "#{instance['variant'].inspect} is not a variant of #{block_ref}",
        )
      end
      if instance["conformance"] != "exact" && instance["difference_summary"].to_s.strip.empty?
        diagnostics << diagnostic(
          "missing_block_difference", "#{path}.difference_summary",
          "#{instance['conformance']} reuse must state what differs from the selected template variant",
        )
      end
      if instance["conformance"] == "exact" && instance["use_scope"] != "whole_module"
        diagnostics << diagnostic(
          "invalid_exact_scope", "#{path}.use_scope",
          "exact conformance must cover the whole module boundary",
        )
      end

      ports = Array(block["ports"])
      ports_by_ref = ports.to_h { |port| ["ports.#{port['id']}", port] }
      bindings = Array(instance["port_bindings"])
      diagnostics.concat(duplicate_binding_errors(bindings, path))
      bindings_by_port = bindings.to_h { |binding| [binding["port_ref"], binding] }

      ports.each do |port|
        port_ref = "ports.#{port['id']}"
        if port["required"] && !bindings_by_port.key?(port_ref)
          diagnostics << diagnostic(
            "missing_required_port", "#{path}.port_bindings",
            "required port #{port_ref} is not bound",
          )
        end
      end

      bound_relation_refs = Set.new
      bindings.each_with_index do |binding, binding_index|
        binding_path = "#{path}.port_bindings[#{binding_index}]"
        port = ports_by_ref[binding["port_ref"]]
        unless port
          diagnostics << diagnostic(
            "unknown_block_port", "#{binding_path}.port_ref",
            "#{binding['port_ref'].inspect} is not a port of #{block_ref}",
          )
          next
        end
        relation_refs = Array(binding["relation_refs"])
        if port["cardinality"] == "one" && relation_refs.length != 1
          diagnostics << diagnostic(
            "block_port_cardinality", "#{binding_path}.relation_refs",
            "#{binding['port_ref']} accepts exactly one relation",
          )
        end
        relation_refs.each_with_index do |relation_ref, relation_index|
          relation = relations_by_ref[relation_ref]
          unless relation
            diagnostics << diagnostic(
              "unknown_bound_relation", "#{binding_path}.relation_refs[#{relation_index}]",
              "cannot resolve #{relation_ref.inspect}",
            )
            next
          end
          bound_relation_refs << relation_ref
          expected_endpoint = port["direction"] == "output" ? relation["from"] : relation["to"]
          unless expected_endpoint == subject_ref
            expected_side = port["direction"] == "output" ? "start at" : "end at"
            diagnostics << diagnostic(
              "block_port_direction", "#{binding_path}.relation_refs[#{relation_index}]",
              "#{binding['port_ref']} is #{port['direction']} so #{relation_ref} must #{expected_side} #{subject_ref}",
            )
          end
          unless Array(port["relation_kinds"]).include?(relation["kind"])
            diagnostics << diagnostic(
              "block_port_relation_kind", "#{binding_path}.relation_refs[#{relation_index}]",
              "#{binding['port_ref']} does not allow relation kind #{relation['kind'].inspect}",
            )
          end
        end
      end

      if instance["conformance"] == "exact"
        incident = relations.filter_map do |relation|
          next if relation["kind"] == "control"
          next unless relation["from"] == subject_ref || relation["to"] == subject_ref

          "relations.#{relation['id']}"
        end.to_set
        missing = incident - bound_relation_refs
        unless missing.empty?
          diagnostics << diagnostic(
            "incomplete_exact_block_interface", "#{path}.port_bindings",
            "exact conformance leaves incident relations unbound: #{missing.to_a.sort.join(', ')}",
          )
        end
      end

      if block["schema_version"] == StandardBlockShapes::SUPPORTED_VERSION
        variant = Array(block["variants"]).find { |candidate| candidate["id"] == instance["variant"] }
        active_step_refs = Array(variant && variant["step_refs"]).to_set
        active_steps = Array(block["steps"]).select do |step|
          active_step_refs.include?("steps.#{step['id']}")
        end
        diagnostics.concat(StandardBlockShapes.resolution_errors(
          block: block,
          instance: instance,
          architecture: architecture,
          relations_by_ref: relations_by_ref,
          representations_by_ref: Array(architecture["representations"]).to_h do |representation|
            ["representations.#{representation['id']}", representation]
          end,
          active_steps: active_steps,
        ))
      end

      diagnostics.concat(legacy_ownership_errors(architecture, instance, subject, bound_relation_refs, path))
    end
    diagnostics
  end

  def validate_instances!(architecture, blocks_by_path:, registered_blocks: nil)
    diagnostics = instance_errors(
      architecture,
      blocks_by_path: blocks_by_path,
      registered_blocks: registered_blocks,
    )
    raise ValidationError, diagnostics unless diagnostics.empty?

    architecture
  end

  def semantic_definition_errors(block)
    diagnostics = []
    %w[ports variants values steps].each do |collection|
      diagnostics.concat(duplicate_id_errors(Array(block[collection]), "$.#{collection}", collection.delete_suffix("s")))
    end
    visual_nodes = Array(block.dig("visual_template", "nodes"))
    diagnostics.concat(duplicate_id_errors(visual_nodes, "$.visual_template.nodes", "visual node"))
    visual_segments = Array(block.dig("visual_template", "segments"))
    diagnostics.concat(duplicate_id_errors(visual_segments, "$.visual_template.segments", "visual segment"))

    ports = Array(block["ports"]).to_h { |port| ["ports.#{port['id']}", port] }
    values = Array(block["values"]).to_h { |value| ["values.#{value['id']}", value] }
    steps = Array(block["steps"]).to_h { |step| ["steps.#{step['id']}", step] }
    local_refs = Set.new(ports.keys + values.keys + steps.keys)
    variant_ids = Array(block["variants"]).filter_map { |variant| variant["id"] }.to_set
    unless variant_ids.include?(block["default_variant"])
      diagnostics << diagnostic(
        "unknown_default_variant", "$.default_variant",
        "#{block['default_variant'].inspect} is not declared in variants",
      )
    end
    Array(block["variants"]).each_with_index do |variant, index|
      Array(variant["step_refs"]).each_with_index do |ref, ref_index|
        next if steps.key?(ref)

        diagnostics << diagnostic(
          "unknown_variant_step", "$.variants[#{index}].step_refs[#{ref_index}]",
          "cannot resolve #{ref.inspect}",
        )
      end
    end
    active_variant_step_refs = Array(block["variants"])
      .flat_map { |variant| Array(variant["step_refs"]) }
      .to_set
    Array(block["steps"]).each_with_index do |step, index|
      Array(step["inputs"]).each_with_index do |ref, ref_index|
        next if local_refs.include?(ref) && !ref.start_with?("steps.")

        diagnostics << diagnostic(
          "invalid_step_input", "$.steps[#{index}].inputs[#{ref_index}]",
          "#{ref.inspect} must resolve to a port or value",
        )
      end
      Array(step["outputs"]).each_with_index do |ref, ref_index|
        next if local_refs.include?(ref) && !ref.start_with?("steps.")

        diagnostics << diagnostic(
          "invalid_step_output", "$.steps[#{index}].outputs[#{ref_index}]",
          "#{ref.inspect} must resolve to a port or value",
        )
      end
      bindings = Array(step["code_bindings"])
      next if bindings.empty?

      step_ref = "steps.#{step['id']}"
      unless active_variant_step_refs.include?(step_ref)
        diagnostics << diagnostic(
          "inactive_code_binding_step", "$.steps[#{index}].code_bindings",
          "#{step_ref} has semantic code bindings but is not active in any variant",
        )
      end
      duplicate_lexemes = bindings.filter_map do |binding|
        lexeme = binding["lexeme"] if binding.is_a?(Hash)
        lexeme if lexeme.is_a?(String)
      end.tally.select { |_lexeme, count| count > 1 }.keys
      duplicate_lexemes.sort.each do |lexeme|
        diagnostics << diagnostic(
          "ambiguous_code_binding_lexeme", "$.steps[#{index}].code_bindings",
          "#{lexeme.inspect} is bound more than once in one code statement",
        )
      end

      bindings.each_with_index do |binding, binding_index|
        next unless binding.is_a?(Hash)

        binding_path = "$.steps[#{index}].code_bindings[#{binding_index}]"
        ref = binding["ref"]
        lexeme = binding["lexeme"]
        access = binding["access"]
        unless ports.key?(ref) || values.key?(ref)
          diagnostics << diagnostic(
            "unknown_code_binding_ref", "#{binding_path}.ref",
            "cannot resolve #{ref.inspect} to a port or value",
          )
        end
        expected_refs = access == "write" ? Array(step["outputs"]) : Array(step["inputs"])
        if %w[read write].include?(access) && !expected_refs.include?(ref)
          diagnostics << diagnostic(
            "invalid_code_binding_access", binding_path,
            "#{access} binding #{ref.inspect} must appear in the step's #{access == 'write' ? 'outputs' : 'inputs'}",
          )
        end
        next unless lexeme.is_a?(String) && !lexeme.empty? && step["code"].is_a?(String)
        next if code_identifier_occurrences(step["code"], lexeme).any?

        diagnostics << diagnostic(
          "missing_code_binding_lexeme", "#{binding_path}.lexeme",
          "#{lexeme.inspect} does not occur as an identifier in the step code",
        )
      end

      {
        "read" => Array(step["inputs"]),
        "write" => Array(step["outputs"]),
      }.each do |access, expected_refs|
        bound_refs = bindings.filter_map do |binding|
          binding["ref"] if binding.is_a?(Hash) && binding["access"] == access
        end.to_set
        (expected_refs.to_set - bound_refs).sort.each do |ref|
          diagnostics << diagnostic(
            "missing_code_binding", "$.steps[#{index}].code_bindings",
            "#{ref} needs at least one #{access} binding",
          )
        end
      end
    end
    visual_refs = visual_nodes.filter_map { |node| node["ref"] }
    visual_refs.each_with_index do |ref, index|
      next if local_refs.include?(ref)

      diagnostics << diagnostic(
        "unknown_visual_ref", "$.visual_template.nodes[#{index}].ref",
        "cannot resolve #{ref.inspect}",
      )
    end
    duplicate_visual_refs = visual_refs.tally.select { |_ref, count| count > 1 }.keys
    duplicate_visual_refs.each do |ref|
      diagnostics << diagnostic(
        "duplicate_visual_ref", "$.visual_template.nodes",
        "#{ref} is placed more than once",
      )
    end
    missing_visual_refs = local_refs - visual_refs.to_set
    unless missing_visual_refs.empty?
      diagnostics << diagnostic(
        "missing_visual_ref", "$.visual_template.nodes",
        "visual template does not place: #{missing_visual_refs.to_a.sort.join(', ')}",
      )
    end
    segment_memberships = Hash.new { |hash, ref| hash[ref] = [] }
    visual_segments.each_with_index do |segment, segment_index|
      Array(segment["node_refs"]).each_with_index do |ref, ref_index|
        unless visual_refs.include?(ref)
          diagnostics << diagnostic(
            "unknown_visual_segment_ref",
            "$.visual_template.segments[#{segment_index}].node_refs[#{ref_index}]",
            "#{ref.inspect} is not placed by visual_template.nodes",
          )
        end
        segment_memberships[ref] << segment["id"]
      end
    end
    segment_memberships.each do |ref, segment_ids|
      next unless segment_ids.length > 1

      diagnostics << diagnostic(
        "overlapping_visual_segments", "$.visual_template.segments",
        "#{ref} belongs to multiple visual segments: #{segment_ids.join(', ')}",
      )
    end

    output_ports = ports.select { |_ref, port| port["direction"] == "output" }.keys.to_set
    produced = Array(block["steps"]).flat_map { |step| Array(step["outputs"]) }.to_set
    (output_ports - produced).each do |ref|
      diagnostics << diagnostic("unproduced_output_port", "$.steps", "no step produces #{ref}")
    end
    diagnostics
  end
  private_class_method :semantic_definition_errors

  def code_identifier_occurrences(code, lexeme)
    pattern = /(?<![A-Za-z0-9_])#{Regexp.escape(lexeme)}(?![A-Za-z0-9_])/
    code.to_enum(:scan, pattern).map do
      match = Regexp.last_match
      [match.begin(0), match.end(0)]
    end
  end
  private_class_method :code_identifier_occurrences

  def duplicate_id_errors(items, path, label)
    items.filter_map { |item| item.is_a?(Hash) ? item["id"] : nil }
      .tally.select { |_id, count| count > 1 }.keys.sort.map do |id|
        diagnostic("duplicate_standard_block_id", path, "duplicate #{label} id #{id}")
      end
  end
  private_class_method :duplicate_id_errors

  def duplicate_binding_errors(bindings, path)
    bindings.filter_map { |binding| binding["port_ref"] }.tally
      .select { |_ref, count| count > 1 }.keys.sort.map do |ref|
        diagnostic("duplicate_port_binding", "#{path}.port_bindings", "#{ref} is bound more than once")
      end
  end
  private_class_method :duplicate_binding_errors

  def legacy_ownership_errors(architecture, instance, subject, bound_relation_refs, path)
    block_ref = instance["block_ref"]
    diagnostics = []
    if [subject["standard_block_ref"], subject.dig("attention", "standard_block_ref")].include?(block_ref)
      diagnostics << diagnostic(
        "duplicate_block_ownership", path,
        "#{instance['subject_ref']} also owns #{block_ref} through legacy standard_block_ref",
      )
    end
    Array(architecture["conditioning"]).each do |conditioning|
      next unless conditioning["standard_block_ref"] == block_ref
      next unless bound_relation_refs.include?(conditioning["relation_ref"])

      diagnostics << diagnostic(
        "duplicate_block_ownership", path,
        "conditioning.#{conditioning['id']} duplicates this block instance on #{conditioning['relation_ref']}",
      )
    end
    diagnostics
  end
  private_class_method :legacy_ownership_errors

  def diagnostic(code, path, message)
    Diagnostic.new(code, path, message)
  end
  private_class_method :diagnostic
end
