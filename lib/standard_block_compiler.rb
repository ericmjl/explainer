# frozen_string_literal: true

require "set"

require_relative "standard_block_contract"

# Compiles reusable standard-block templates into instance-scoped explanatory
# scenes. Canonical architecture relations remain untouched: only boundary
# edges carry relation provenance, while internal edges are explicitly grounded
# in template steps.
module StandardBlockCompiler
  class CompileError < StandardError
    attr_reader :code

    def initialize(code, message)
      @code = code
      super(message)
    end
  end

  class Catalog
    attr_reader :blocks_by_path

    def initialize(blocks_by_path:)
      @blocks_by_path = blocks_by_path
      @blocks_by_path.each_value do |block|
        next unless block["schema_version"] == "standard-block-v0.2"

        StandardBlockContract.validate_definition!(block)
      end
    end

    def compile_instances(architecture, registered_blocks: nil)
      StandardBlockContract.validate_instances!(
        architecture,
        blocks_by_path: @blocks_by_path,
        registered_blocks: registered_blocks,
      )
      context = compilation_context(architecture)
      Array(architecture["block_instances"]).map do |instance|
        compile_instance(instance, context)
      end
    end

    def compile_boards(architecture, boards, registered_blocks: nil)
      instances = compile_instances(architecture, registered_blocks: registered_blocks)
      instances_by_ref = instances.to_h { |instance| ["block_instances.#{instance.fetch('id')}", instance] }
      Array(boards).map do |board|
        next board unless board["kind"] == "standard_block_instance"

        instance = instances_by_ref[board["block_instance_ref"]]
        unless instance
          raise CompileError.new(
            "unknown_block_instance_board",
            "board #{board.fetch('id')} references missing #{board['block_instance_ref'].inspect}",
          )
        end
        unless board["subject_ref"] == instance["subjectRef"]
          raise CompileError.new(
            "block_instance_board_subject_mismatch",
            "board #{board.fetch('id')} subject #{board['subject_ref']} does not match #{instance['subjectRef']}",
          )
        end

        scene = instance.fetch("scene")
        board.merge(
          "grid" => scene.fetch("grid"),
          "nodes" => scene.fetch("nodes"),
          "edges" => scene.fetch("edges"),
          "segments" => scene["segments"],
          "projectionMode" => "standard_block_template",
          "standardBlockRef" => instance.fetch("standardBlockRef"),
          "standardBlockId" => instance.fetch("standardBlockId"),
          "blockInstanceRef" => "block_instances.#{instance.fetch('id')}",
          "variant" => instance.fetch("variant"),
          "variantLabel" => instance.fetch("variantLabel"),
          "useScope" => instance.fetch("useScope"),
          "conformance" => instance.fetch("conformance"),
          "differenceSummary" => instance["differenceSummary"],
          "pseudocode" => instance.fetch("pseudocode"),
        ).compact
      end
    end

    private

    def compilation_context(architecture)
      {
        architecture: architecture,
        relations_by_ref: Array(architecture["relations"]).to_h do |relation|
          ["relations.#{relation.fetch('id')}", relation]
        end,
        representations_by_ref: Array(architecture["representations"]).to_h do |representation|
          ["representations.#{representation.fetch('id')}", representation]
        end,
      }
    end

    def compile_instance(instance, context)
      block_path = instance.fetch("block_ref")
      block = @blocks_by_path.fetch(block_path)
      variant = Array(block.fetch("variants")).find { |candidate| candidate.fetch("id") == instance.fetch("variant") }
      active_step_refs = Set.new(variant.fetch("step_refs"))
      steps = Array(block.fetch("steps")).select { |step| active_step_refs.include?("steps.#{step.fetch('id')}") }
      active_data_refs = steps.flat_map { |step| Array(step["inputs"]) + Array(step["outputs"]) }.to_set
      active_refs = active_data_refs | active_step_refs
      bindings = Array(instance.fetch("port_bindings"))
      bindings_by_port = bindings.to_h { |binding| [binding.fetch("port_ref"), binding] }
      scene = compile_scene(
        block: block,
        block_path: block_path,
        instance: instance,
        steps: steps,
        active_refs: active_refs,
        bindings_by_port: bindings_by_port,
        context: context,
      )

      {
        "id" => instance.fetch("id"),
        "standardBlockId" => block.fetch("id"),
        "standardBlockRef" => block_path,
        "standardBlockName" => block.fetch("name"),
        "subjectRef" => instance.fetch("subject_ref"),
        "variant" => variant.fetch("id"),
        "variantLabel" => variant.fetch("label"),
        "variantDescription" => variant.fetch("description"),
        "useScope" => instance.fetch("use_scope"),
        "conformance" => instance.fetch("conformance"),
        "differenceSummary" => instance["difference_summary"],
        "evidence" => instance.fetch("evidence"),
        "portBindings" => compile_bindings(bindings, context),
        "pseudocode" => steps.map do |step|
          {
            "id" => step.fetch("id"),
            "templateFactRef" => template_fact_ref(block, "steps", step.fetch("id")),
            "instanceFactRef" => "block_instances.#{instance.fetch('id')}.steps.#{step.fetch('id')}",
            "label" => step.fetch("label"),
            "operation" => step.fetch("operation"),
            "code" => step.fetch("code"),
            "tex" => step["tex"],
            "inputs" => step.fetch("inputs"),
            "outputs" => step.fetch("outputs"),
            "codeBindings" => compile_code_bindings(block, instance, step),
          }.compact
        end,
        "scene" => scene,
      }.compact
    end

    def compile_bindings(bindings, context)
      bindings.map do |binding|
        relations = binding.fetch("relation_refs").map do |ref|
          relation = context.fetch(:relations_by_ref).fetch(ref)
          {
            "relationRef" => ref,
            "from" => relation.fetch("from"),
            "to" => relation.fetch("to"),
            "kind" => relation.fetch("kind"),
            "operation" => relation.fetch("operation"),
            "carries" => relation.fetch("carries"),
          }
        end
        {
          "portRef" => binding.fetch("port_ref"),
          "relationRefs" => binding.fetch("relation_refs"),
          "selector" => binding["selector"],
          "relations" => relations,
        }.compact
      end
    end

    def compile_code_bindings(block, instance, step)
      bindings = Array(step["code_bindings"])
      return nil if bindings.empty?

      code = step.fetch("code")
      bindings.map do |binding|
        namespace, local_id = binding.fetch("ref").split(".", 2)
        {
          "lexeme" => binding.fetch("lexeme"),
          "access" => binding.fetch("access"),
          "localRef" => binding.fetch("ref"),
          "templateFactRef" => template_fact_ref(block, namespace, local_id),
          "instanceFactRef" => "block_instances.#{instance.fetch('id')}.#{namespace}.#{local_id}",
          "occurrences" => code_identifier_occurrences(code, binding.fetch("lexeme")),
        }
      end
    end

    def compile_scene(block:, block_path:, instance:, steps:, active_refs:, bindings_by_port:, context:)
      block_id = block.fetch("id")
      instance_id = instance.fetch("id")
      ports_by_ref = Array(block.fetch("ports")).to_h { |port| ["ports.#{port.fetch('id')}", port] }
      values_by_ref = Array(block.fetch("values")).to_h { |value| ["values.#{value.fetch('id')}", value] }
      steps_by_ref = steps.to_h { |step| ["steps.#{step.fetch('id')}", step] }
      objects_by_ref = ports_by_ref.merge(values_by_ref).merge(steps_by_ref)
      visual_nodes = Array(block.dig("visual_template", "nodes")).select do |node|
        active_refs.include?(node.fetch("ref"))
      end
      local_ids = visual_nodes.to_h { |node| [node.fetch("ref"), node.fetch("id")] }
      nodes = visual_nodes.map do |visual|
        ref = visual.fetch("ref")
        object = objects_by_ref.fetch(ref)
        compile_node(
          visual: visual,
          ref: ref,
          object: object,
          block: block,
          block_path: block_path,
          instance: instance,
          binding: bindings_by_port[ref],
          context: context,
        )
      end
      edges = []
      steps.each do |step|
        step_ref = "steps.#{step.fetch('id')}"
        step_id = local_ids.fetch(step_ref)
        step.fetch("inputs").each_with_index do |input_ref, index|
          next unless local_ids[input_ref]

          edges << compile_edge(
            id: "#{instance_id}__#{step.fetch('id')}__input_#{index + 1}",
            from: local_ids.fetch(input_ref),
            to: step_id,
            data_ref: input_ref,
            step: step,
            direction: "input",
            block: block,
            block_path: block_path,
            instance: instance,
            binding: bindings_by_port[input_ref],
            context: context,
          )
        end
        step.fetch("outputs").each_with_index do |output_ref, index|
          next unless local_ids[output_ref]

          edges << compile_edge(
            id: "#{instance_id}__#{step.fetch('id')}__output_#{index + 1}",
            from: step_id,
            to: local_ids.fetch(output_ref),
            data_ref: output_ref,
            step: step,
            direction: "output",
            block: block,
            block_path: block_path,
            instance: instance,
            binding: bindings_by_port[output_ref],
            context: context,
          )
        end
      end
      segments = Array(block.dig("visual_template", "segments")).each_with_index.filter_map do |segment, index|
        node_ids = Array(segment["node_refs"]).filter_map { |ref| local_ids[ref] }
        next if node_ids.empty?

        {
          "id" => segment.fetch("id"),
          "label" => segment.fetch("label"),
          "description" => segment["description"],
          "order" => index + 1,
          "node_ids" => node_ids,
        }.compact
      end
      {
        "grid" => block.dig("visual_template", "grid"),
        "nodes" => nodes,
        "edges" => edges,
        "segments" => segments.empty? ? nil : segments,
      }.compact
    end

    def compile_node(visual:, ref:, object:, block:, block_path:, instance:, binding:, context:)
      namespace, local_id = ref.split(".", 2)
      base = {
        "id" => visual.fetch("id"),
        "label" => object.fetch("label"),
        "role" => object["role"],
        "col" => visual.fetch("col"),
        "row" => visual.fetch("row"),
        "prominence" => visual["prominence"],
        "treatment" => visual["treatment"],
        "density" => visual["density"],
        "standard_block_ref" => block_path,
        "standard_block_id" => block.fetch("id"),
        "block_instance_ref" => "block_instances.#{instance.fetch('id')}",
        "template_fact_ref" => template_fact_ref(block, namespace, local_id),
        "instance_fact_ref" => "block_instances.#{instance.fetch('id')}.#{namespace}.#{local_id}",
      }
      if namespace == "steps"
        base.merge(
          "kind" => "operation",
          "scale" => "operation",
          "detail" => object.fetch("operation"),
          "code" => object.fetch("code"),
          "tex" => object["tex"],
          "operation" => object.fetch("operation"),
        ).compact
      else
        representation_ref, representation = representation_for_binding(binding, context)
        glyph = object["glyph"] || representation&.dig("glyph")
        base.merge(
          "kind" => "representation",
          "rep_ref" => representation_ref&.delete_prefix("representations."),
          "shape" => object["shape"] || representation&.dig("shape"),
          "scale" => object["scale"] || representation&.dig("scale") || "item",
          "glyph" => glyph,
          "flow_family" => flow_family(glyph),
          "notation" => object["notation"],
          "port_ref" => namespace == "ports" ? ref : nil,
        ).compact
      end
    end

    def compile_edge(id:, from:, to:, data_ref:, step:, direction:, block:, block_path:, instance:, binding:, context:)
      relation_refs = Array(binding && binding["relation_refs"])
      relations = relation_refs.filter_map { |ref| context.fetch(:relations_by_ref)[ref] }
      carries = relations.flat_map { |relation| Array(relation["carries"]) }.uniq
      kind = relations.first&.dig("kind") || "data_flow"
      template_ref = template_fact_ref(block, "steps", step.fetch("id"))
      edge = {
        "id" => id,
        "from" => from,
        "to" => to,
        "kind" => kind,
        "label" => nil,
        "tone" => kind == "conditioning" ? "conditioning" : nil,
        "carries" => carries,
        "relation_path" => relation_refs.empty? ? nil : relation_refs,
        "grounding" => relation_refs.empty? ? "standard_block_template" : "canonical_relation_path",
        "standard_block_ref" => block_path,
        "standard_block_id" => block.fetch("id"),
        "block_instance_ref" => "block_instances.#{instance.fetch('id')}",
        "template_fact_ref" => template_ref,
        "instance_fact_ref" => "block_instances.#{instance.fetch('id')}.steps.#{step.fetch('id')}",
        "template_data_ref" => data_ref,
        "connection" => {
          "title" => step.fetch("label"),
          "role" => direction == "input" ? "reusable step input" : "reusable step output",
          "inside" => step.fetch("code"),
        },
      }
      edge.compact
    end

    def representation_for_binding(binding, context)
      relation_ref = Array(binding && binding["relation_refs"]).first
      relation = relation_ref && context.fetch(:relations_by_ref)[relation_ref]
      representation_ref = Array(relation && relation["carries"]).first
      [representation_ref, representation_ref && context.fetch(:representations_by_ref)[representation_ref]]
    end

    def flow_family(glyph)
      return "single" if glyph == "single"
      return "pair" if glyph == "pair"
      return "coordinate" if glyph == "coordinates"
      return "frame" if glyph == "frames"

      nil
    end

    def code_identifier_occurrences(code, lexeme)
      pattern = /(?<![A-Za-z0-9_])#{Regexp.escape(lexeme)}(?![A-Za-z0-9_])/
      code.to_enum(:scan, pattern).map do
        match = Regexp.last_match
        { "start" => match.begin(0), "end" => match.end(0) }
      end
    end

    def template_fact_ref(block, collection, id)
      "standard_blocks.#{block.fetch('id')}.#{collection}.#{id}"
    end
  end
end
