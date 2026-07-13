#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "fileutils"
require "yaml"
require_relative "../../lib/architecture_coverage"
require_relative "../../lib/architecture_projection"
require_relative "../../lib/architecture_ownership"

ROOT = File.expand_path("../..", __dir__)
REGISTRY = "architectures/index.yaml"

def load_yaml(path)
  YAML.load_file(File.join(ROOT, path), aliases: true)
end

def architecture_relations(architecture)
  return architecture.fetch("relations") if architecture.key?("relations")

  architecture.fetch("edges")
end

def typed_index(items, namespace)
  Array(items).each_with_object({}) do |item, index|
    index["#{namespace}.#{item.fetch('id')}"] = item
  end
end

def relation_index(architecture)
  typed_index(architecture_relations(architecture), "relations")
end

def compile_value_site_interfaces(architecture)
  interfaces = Array(architecture["value_sites"]).to_h do |site|
    [site.fetch("id"), {
      "incomingRelationRefs" => [],
      "outgoingRelationRefs" => [],
      "producerRefs" => [],
      "consumerRefs" => [],
    }]
  end

  architecture_relations(architecture).each do |relation|
    relation_ref = "relations.#{relation.fetch('id')}"
    from = relation.fetch("from")
    to = relation.fetch("to")
    if from.start_with?("value_sites.")
      interface = interfaces.fetch(from.delete_prefix("value_sites."))
      interface["outgoingRelationRefs"] << relation_ref
      interface["consumerRefs"] << to
    end
    if to.start_with?("value_sites.")
      interface = interfaces.fetch(to.delete_prefix("value_sites."))
      interface["incomingRelationRefs"] << relation_ref
      interface["producerRefs"] << from
    end
  end

  interfaces.each_value { |interface| interface.each_value(&:uniq!) }
  interfaces
end

def compile_state_semantics_by_site(architecture)
  Hash(architecture["state_semantics"]).each_with_object({}) do |(group_id, semantics), by_site|
    Array(semantics["value_site_refs"]).each do |site_ref|
      site_id = site_ref.delete_prefix("value_sites.")
      by_site[site_id] = semantics.merge("groupId" => group_id)
    end
  end
end

def compile_conditioning(architecture)
  relations = relation_index(architecture)
  Array(architecture["conditioning"]).map do |conditioning|
    relation_ref = conditioning.fetch("relation_ref")
    relation = relations.fetch(relation_ref) do
      raise "conditioning #{conditioning.fetch('id')} references unknown relation #{relation_ref}"
    end
    conditioning.merge(
      "source" => relation.fetch("from"),
      "target" => relation.fetch("to"),
    )
  end
end

def compile_scale_transitions(architecture)
  relations = relation_index(architecture)
  value_sites = typed_index(architecture["value_sites"], "value_sites")
  representations = typed_index(architecture["representations"], "representations")

  Array(architecture["scale_transitions"]).map do |transition|
    path_refs = transition.fetch("relation_path")
    path = path_refs.map do |relation_ref|
      relations.fetch(relation_ref) do
        raise "scale transition #{transition.fetch('id')} references unknown relation #{relation_ref}"
      end
    end
    path.each_cons(2) do |left, right|
      next if left.fetch("to") == right.fetch("from")

      raise "scale transition #{transition.fetch('id')} has discontinuous relation_path"
    end

    source = path.first.fetch("from")
    target = path.last.fetch("to")
    source_site = value_sites.fetch(source) do
      raise "scale transition #{transition.fetch('id')} must start at a value site"
    end
    target_site = value_sites.fetch(target) do
      raise "scale transition #{transition.fetch('id')} must end at a value site"
    end
    source_rep = representations.fetch(source_site.fetch("representation_ref"))
    target_rep = representations.fetch(target_site.fetch("representation_ref"))
    path_nodes = [source, *path.map { |relation| relation.fetch("to") }]
    projection_refs = path_nodes.select { |ref| ref.start_with?("modules.") }.uniq

    compiled = transition.merge(
      "source" => source,
      "target" => target,
      "from_scale" => source_rep.fetch("scale"),
      "to_scale" => target_rep.fetch("scale"),
      "projection_refs" => projection_refs,
    )
    if transition["index_relation_ref"]
      index_relation = relations.fetch(transition["index_relation_ref"])
      unless index_relation.fetch("kind") == "index_flow" && path_nodes.include?(index_relation.fetch("to"))
        raise "scale transition #{transition.fetch('id')} has unrelated index relation #{transition['index_relation_ref']}"
      end
      compiled["index_map"] = index_relation.fetch("from")
    end
    compiled
  end
end

def web_ref(path)
  return path if path.nil? || path.start_with?("http", "/")

  "../../#{path}"
end

def bibliography_manifest(bibliography, path)
  {
    "schemaVersion" => bibliography.fetch("schema_version"),
    "sourceYaml" => web_ref(path),
    "sources" => bibliography.fetch("sources").map do |source|
      source.merge("href" => source["url"] || web_ref(source["path"])).compact
    end,
  }
end

def normalize_module_refs(mod)
  mod = mod.dup
  mod["story_ref"] = web_ref(mod["story_ref"]) if mod["story_ref"]
  mod["pseudocode_ref"] = web_ref(mod["pseudocode_ref"]) if mod["pseudocode_ref"]
  mod["standard_block_ref"] = web_ref(mod["standard_block_ref"]) if mod["standard_block_ref"]
  if mod["contains"]
    mod["contains"] = mod["contains"].map do |child|
      child = child.dup
      child["story_ref"] = web_ref(child["story_ref"]) if child["story_ref"]
      child["pseudocode_ref"] = web_ref(child["pseudocode_ref"]) if child["pseudocode_ref"]
      child["standard_block_ref"] = web_ref(child["standard_block_ref"]) if child["standard_block_ref"]
      child
    end
  end
  if mod.dig("attention", "standard_block_ref")
    mod["attention"] = mod["attention"].dup
    mod["attention"]["standard_block_ref"] = web_ref(mod["attention"]["standard_block_ref"])
  end
  mod
end

def standard_block_manifest(paths)
  paths.each_with_object({}) do |path, acc|
    block = load_yaml(path)
    acc[block.fetch("id")] = {
      "id" => block.fetch("id"),
      "name" => block.fetch("name"),
      "sourceYaml" => web_ref(path),
      "description" => block.fetch("description"),
      "math" => Array(block["math"]).map do |step|
        {
          "id" => step["id"],
          "text" => step.fetch("text"),
          "tex" => step["tex"],
          "operation" => step["operation"],
        }.compact
      end,
    }
  end
end

def pseudocode_symbols(pseudocode)
  Array(pseudocode["symbols"]).map do |symbol|
    {
      "id" => symbol["id"],
      "name" => symbol["name"],
      "tex" => symbol["tex"],
      "architectureRef" => symbol["architecture_ref"],
    }.compact
  end
end

def pseudocode_lines(pseudocode)
  pseudocode.fetch("lines").map do |line|
    {
      "id" => line.fetch("id"),
      "text" => line.fetch("text"),
      "refs" => Array(line["source_refs"]).map { |ref| ref["lines"] || ref["locator"] }.compact.join(", "),
      "architectureRefs" => Array(line["architecture_refs"]),
      "standardBlockRef" => web_ref(line["standard_block_ref"]),
    }.compact
  end
end

def build_manifest(config, bibliography, bibliography_path)
  architecture = load_yaml(config.fetch("architecture"))
  ArchitectureOwnership.validate!(architecture)
  ArchitectureCoverage.validate!(architecture)
  pseudocode = load_yaml(config.fetch("pseudocode"))
  semantic_zoom = load_yaml(config.fetch("view"))
  modules = architecture.fetch("modules").map { |mod| normalize_module_refs(mod) }
  projected_architecture_versions = %w[architecture-v0.3 architecture-v0.4]
  derived_projection = projected_architecture_versions.include?(architecture["schema_version"]) &&
                       semantic_zoom["schema_version"] == "visualization-v0.4"
  if projected_architecture_versions.include?(architecture["schema_version"]) && !derived_projection
    raise "#{architecture.fetch('schema_version')} requires visualization-v0.4 for #{config.fetch('id')}"
  end
  if semantic_zoom["schema_version"] == "visualization-v0.4" && !derived_projection
    raise "visualization-v0.4 requires architecture-v0.3 or architecture-v0.4 for #{config.fetch('id')}"
  end
  boards = if derived_projection
    projector = ArchitectureProjection::Projector.new(architecture)
    semantic_zoom.fetch("boards").map do |board|
      projection = projector.project(board)
      board.merge(projection).merge("projectionMode" => "derived")
    end
  else
    semantic_zoom.fetch("boards").map { |board| board.merge("projectionMode" => "authored") }
  end
  one_owner_contract = architecture["schema_version"] == "architecture-v0.4"
  value_site_interfaces = one_owner_contract ? compile_value_site_interfaces(architecture) : {}
  state_semantics_by_site = one_owner_contract ? compile_state_semantics_by_site(architecture) : {}
  conditioning = one_owner_contract ? compile_conditioning(architecture) : (architecture["conditioning"] || [])
  scale_transitions = one_owner_contract ? compile_scale_transitions(architecture) : (architecture["scale_transitions"] || [])

  {
    "schemaVersion" => architecture["schema_version"] == "architecture-v0.4" ? "architecture-manifest-v0.4" :
      (derived_projection ? "architecture-manifest-v0.3" : "architecture-manifest-v0.2"),
    "architecture" => {
      "schemaVersion" => architecture.fetch("schema_version"),
      "id" => architecture.fetch("id"),
      "name" => architecture.fetch("name"),
      "status" => architecture.fetch("status"),
      "sourceYaml" => web_ref(config.fetch("architecture")),
      "sources" => architecture["sources"] || [],
      "decomposition" => architecture["decomposition"] || {},
      "coverage" => ArchitectureCoverage.compile(architecture),
      "modules" => modules,
      "representations" => architecture.fetch("representations"),
      "valueSites" => architecture["value_sites"] || [],
      "valueSiteInterfaces" => value_site_interfaces,
      "execution" => architecture["execution"] || {},
      "stateSemantics" => architecture["state_semantics"] || {},
      "stateSemanticsBySite" => state_semantics_by_site,
      "conditioning" => conditioning,
      "scaleTransitions" => scale_transitions,
      "trainingInference" => architecture["training_inference"] || {},
      "relations" => architecture_relations(architecture),
      "claims" => architecture.fetch("claims"),
    },
    "bibliography" => bibliography_manifest(bibliography, bibliography_path),
    "standardBlocks" => standard_block_manifest(config.fetch("standard_blocks")),
    "pseudocode" => {
      pseudocode.fetch("id") => {
        "sourceYaml" => web_ref(config.fetch("pseudocode")),
        "sources" => pseudocode["sources"] || [],
        "symbols" => pseudocode_symbols(pseudocode),
        "lines" => pseudocode_lines(pseudocode),
        "claims" => pseudocode["claims"] || [],
      },
    },
    "boards" => {
      "schemaVersion" => semantic_zoom.fetch("schema_version"),
      "sourceYaml" => web_ref(config.fetch("view")),
      "rootBoard" => semantic_zoom.fetch("root_board"),
      "items" => boards,
    },
  }
end

registry = load_yaml(REGISTRY)
bibliography_path = registry.fetch("bibliography")
bibliography = load_yaml(bibliography_path)
index_entries = []

registry.fetch("source_sets").each do |config|
  set_id = config.fetch("id")
  out = File.join(ROOT, "renderer/architecture/manifest-#{set_id}.js")
  FileUtils.mkdir_p(File.dirname(out))
  manifest = build_manifest(config, bibliography, bibliography_path)
  File.write(out, "export const manifest = #{JSON.pretty_generate(manifest)};\n")
  index_entries << {
    "id" => set_id,
    "name" => config["label"] || manifest.dig("architecture", "name"),
    "file" => "manifest-#{set_id}.js",
  }
  puts out
end

index_out = File.join(ROOT, "renderer/architecture/manifest-index.js")
File.write(index_out, "export const manifestIndex = #{JSON.pretty_generate(index_entries)};\n")
puts index_out
