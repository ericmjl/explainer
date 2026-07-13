# frozen_string_literal: true

# Enforce architecture-v0.4's durable-source ownership rules. The semantic
# projector validates the canonical graph; this validator prevents secondary
# sections from re-authoring facts owned by that graph.
module ArchitectureOwnership
  class OwnershipError < StandardError; end

  MODULE_DERIVED_FIELDS = %w[inputs outputs].freeze
  CONDITIONING_DERIVED_FIELDS = %w[source target].freeze
  STATE_DERIVED_FIELDS = %w[role produced_by consumed_by updated_by].freeze
  TRANSITION_DERIVED_FIELDS = %w[
    source target from_scale to_scale projection projection_refs index_map
  ].freeze

  module_function

  def errors(architecture)
    return [] unless architecture["schema_version"] == "architecture-v0.4"

    errors = []
    relations = index(architecture["relations"], "relations")
    representations = index(architecture["representations"], "representations")
    value_sites = index(architecture["value_sites"], "value_sites")

    Array(architecture["modules"]).each do |mod|
      MODULE_DERIVED_FIELDS.each do |field|
        errors << "module #{mod['id']} re-owns relation-derived #{field}" if mod.key?(field)
      end
    end

    Array(architecture["conditioning"]).each do |conditioning|
      id = conditioning["id"]
      CONDITIONING_DERIVED_FIELDS.each do |field|
        errors << "conditioning #{id} re-owns relation endpoint #{field}" if conditioning.key?(field)
      end
      relation_ref = conditioning["relation_ref"]
      relation = relations[relation_ref]
      if !relation_ref
        errors << "conditioning #{id} missing relation_ref"
      elsif !relation
        errors << "conditioning #{id} references unknown relation #{relation_ref}"
      elsif relation["kind"] != "conditioning"
        errors << "conditioning #{id} relation #{relation_ref} must have kind conditioning"
      end
    end

    claimed_sites = {}
    Hash(architecture["state_semantics"]).each do |group_id, semantics|
      errors << "state_semantics group #{group_id} is not snake_case" unless group_id.match?(/\A[a-z][a-z0-9_]*\z/)
      STATE_DERIVED_FIELDS.each do |field|
        errors << "state_semantics #{group_id} re-owns relation/value-site field #{field}" if semantics.key?(field)
      end
      representation_ref = semantics["representation_ref"]
      unless representations.key?(representation_ref)
        errors << "state_semantics #{group_id} references unknown representation #{representation_ref.inspect}"
      end
      errors << "state_semantics #{group_id} missing lifecycle" unless semantics["lifecycle"]
      site_refs = semantics["value_site_refs"]
      if !site_refs.is_a?(Array) || site_refs.empty?
        errors << "state_semantics #{group_id} requires value_site_refs"
      end
      Array(site_refs).each do |site_ref|
        site = value_sites[site_ref]
        unless site
          errors << "state_semantics #{group_id} references unknown value site #{site_ref}"
          next
        end
        if claimed_sites.key?(site_ref)
          errors << "value site #{site_ref} belongs to state_semantics #{claimed_sites[site_ref]} and #{group_id}"
        else
          claimed_sites[site_ref] = group_id
        end
        if site["representation_ref"] != representation_ref
          errors << "state_semantics #{group_id} says #{representation_ref}, but #{site_ref} uses #{site['representation_ref']}"
        end
      end
    end

    Array(architecture["scale_transitions"]).each do |transition|
      id = transition["id"]
      TRANSITION_DERIVED_FIELDS.each do |field|
        errors << "scale transition #{id} re-owns relation-derived field #{field}" if transition.key?(field)
      end
      path_refs = transition["relation_path"]
      if !path_refs.is_a?(Array) || path_refs.empty?
        errors << "scale transition #{id} requires relation_path"
        next
      end
      path = path_refs.map do |relation_ref|
        relation = relations[relation_ref]
        errors << "scale transition #{id} references unknown relation #{relation_ref}" unless relation
        relation
      end
      next if path.any?(&:nil?)

      path.each_cons(2) do |left, right|
        unless left["to"] == right["from"]
          errors << "scale transition #{id} relation_path is discontinuous at #{left['id']} -> #{right['id']}"
        end
      end
      unless value_sites.key?(path.first["from"])
        errors << "scale transition #{id} relation_path must start at a value site"
      end
      unless value_sites.key?(path.last["to"])
        errors << "scale transition #{id} relation_path must end at a value site"
      end

      index_ref = transition["index_relation_ref"]
      next unless index_ref

      index_relation = relations[index_ref]
      if !index_relation
        errors << "scale transition #{id} references unknown index relation #{index_ref}"
      elsif index_relation["kind"] != "index_flow"
        errors << "scale transition #{id} index relation #{index_ref} must have kind index_flow"
      else
        path_nodes = [path.first["from"], *path.map { |relation| relation["to"] }]
        unless path_nodes.include?(index_relation["to"])
          errors << "scale transition #{id} index relation #{index_ref} does not target its relation_path"
        end
      end
    end

    errors
  end

  def validate!(architecture)
    contract_errors = errors(architecture)
    return if contract_errors.empty?

    raise OwnershipError, contract_errors.join("; ")
  end

  def index(items, namespace)
    Array(items).each_with_object({}) do |item, result|
      result["#{namespace}.#{item['id']}"] = item if item["id"]
    end
  end
  private_class_method :index
end
