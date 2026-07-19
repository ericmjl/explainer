#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "digest"
require "fileutils"
require "rbconfig"
require_relative "../../lib/architecture_comparison_compiler"
require_relative "../../lib/architecture_coverage"
require_relative "../../lib/architecture_projection"
require_relative "../../lib/architecture_ownership"
require_relative "../../lib/pseudocode_compiler"
require_relative "../../lib/pseudocode_contract"
require_relative "../../lib/source_contract"
require_relative "../../lib/standard_block_compiler"
require_relative "../../lib/strict_yaml"

ROOT = File.expand_path("../..", __dir__)
REGISTRY = "architectures/index.yaml"
GENERATOR_VERSION = "architecture-manifest-builder-v0.4.5"
CHECK_MODE = ARGV.delete("--check")
abort "usage: ruby #{__FILE__} [--check]" unless ARGV.empty?

def load_yaml(path)
  StrictYaml.load_file(File.join(ROOT, path))
end

def validate_all_sources!
  lint = File.join(ROOT, "scripts/lint_sources.rb")
  return if system(RbConfig.ruby, lint, chdir: ROOT)

  raise "source validation failed; manifests were not generated"
end

def input_digests(paths)
  paths.uniq.to_h do |path|
    [path, Digest::SHA256.file(File.join(ROOT, path)).hexdigest]
  end
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

def standard_block_manifest(paths, blocks_by_path)
  paths.each_with_object({}) do |path, acc|
    block = blocks_by_path.fetch(path)
    summary = {
      "id" => block.fetch("id"),
      "schemaVersion" => block.fetch("schema_version"),
      "name" => block.fetch("name"),
      "sourceYaml" => web_ref(path),
      "description" => block.fetch("description"),
      "math" => Array(block["math"] || block["steps"]).map do |step|
        {
          "id" => step["id"],
          "text" => step["text"] || step["code"],
          "tex" => step["tex"],
          "operation" => step["operation"],
        }.compact
      end,
    }
    if block["schema_version"] == "standard-block-v0.2"
      summary.merge!(
        "kind" => block.fetch("kind"),
        "status" => block.fetch("status"),
        "ports" => block.fetch("ports"),
        "variants" => block.fetch("variants"),
        "defaultVariant" => block.fetch("default_variant"),
        "values" => block.fetch("values"),
        "steps" => block.fetch("steps"),
        "visualTemplate" => block.fetch("visual_template"),
        "evidencePolicy" => block.fetch("evidence_policy"),
      )
    end
    acc[block.fetch("id")] = summary
  end
end

def build_manifest(config, bibliography, bibliography_path)
  architecture = load_yaml(config.fetch("architecture"))
  SourceContract.validate!(architecture) if architecture["schema_version"] == "architecture-v0.4"
  ArchitectureOwnership.validate!(architecture)
  ArchitectureCoverage.validate!(architecture)
  pseudocode = load_yaml(config.fetch("pseudocode"))
  if pseudocode["schema_version"] == "pseudocode-v0.2"
    PseudocodeContract.validate!(pseudocode, architecture: architecture)
  end
  compiled_pseudocode = PseudocodeCompiler.compile(pseudocode, architecture: architecture)
  compiled_pseudocode.fetch("lines").each do |line|
    line["standardBlockRef"] = web_ref(line["standardBlockRef"]) if line["standardBlockRef"]
  end
  semantic_zoom = load_yaml(config.fetch("view"))
  SourceContract.validate!(semantic_zoom) if semantic_zoom["schema_version"] == "visualization-v0.4"
  modules = architecture.fetch("modules").map { |mod| normalize_module_refs(mod) }
  blocks_by_path = config.fetch("standard_blocks").to_h { |path| [path, load_yaml(path)] }
  block_catalog = StandardBlockCompiler::Catalog.new(blocks_by_path: blocks_by_path)
  block_instances = block_catalog.compile_instances(
    architecture,
    registered_blocks: config.fetch("standard_blocks"),
  )
  block_instance_summaries = block_instances.map { |instance| instance.reject { |key, _value| key == "scene" } }
  projected_architecture_versions = %w[architecture-v0.3 architecture-v0.4]
  derived_projection = projected_architecture_versions.include?(architecture["schema_version"]) &&
                       semantic_zoom["schema_version"] == "visualization-v0.4"
  if projected_architecture_versions.include?(architecture["schema_version"]) && !derived_projection
    raise "#{architecture.fetch('schema_version')} requires visualization-v0.4 for #{config.fetch('id')}"
  end
  if semantic_zoom["schema_version"] == "visualization-v0.4" && !derived_projection
    raise "visualization-v0.4 requires architecture-v0.3 or architecture-v0.4 for #{config.fetch('id')}"
  end
  compiled_view_boards = block_catalog.compile_boards(
    architecture,
    semantic_zoom.fetch("boards"),
    registered_blocks: config.fetch("standard_blocks"),
  )
  boards = if derived_projection
    projector = ArchitectureProjection::Projector.new(architecture)
    compiled_view_boards.map do |board|
      next board if board["kind"] == "standard_block_instance"

      projection = projector.project(board)
      board.merge(projection).merge("projectionMode" => "derived")
    end
  else
    compiled_view_boards.map { |board| board.merge("projectionMode" => "authored") }
  end
  one_owner_contract = architecture["schema_version"] == "architecture-v0.4"
  value_site_interfaces = one_owner_contract ? compile_value_site_interfaces(architecture) : {}
  state_semantics_by_site = one_owner_contract ? compile_state_semantics_by_site(architecture) : {}
  conditioning = one_owner_contract ? compile_conditioning(architecture) : (architecture["conditioning"] || [])
  scale_transitions = one_owner_contract ? compile_scale_transitions(architecture) : (architecture["scale_transitions"] || [])

  {
    "schemaVersion" => architecture["schema_version"] == "architecture-v0.4" ? "architecture-manifest-v0.4" :
      (derived_projection ? "architecture-manifest-v0.3" : "architecture-manifest-v0.2"),
    "build" => {
      "generator" => GENERATOR_VERSION,
      "inputDigests" => input_digests([
        bibliography_path,
        config.fetch("architecture"),
        config.fetch("view"),
        config.fetch("pseudocode"),
        *config.fetch("standard_blocks"),
      ]),
    },
    "architecture" => {
      "schemaVersion" => architecture.fetch("schema_version"),
      "id" => architecture.fetch("id"),
      "name" => architecture.fetch("name"),
      "family" => architecture["family"],
      "status" => architecture.fetch("status"),
      "taskModes" => architecture["task_modes"] || [],
      "referenceConfiguration" => architecture["reference_configuration"],
      "sourceYaml" => web_ref(config.fetch("architecture")),
      "sources" => architecture["sources"] || [],
      "decomposition" => architecture["decomposition"] || {},
      "coverage" => ArchitectureCoverage.compile(architecture),
      "modules" => modules,
      "blockInstances" => block_instance_summaries,
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
      "openQuestions" => architecture["open_questions"] || [],
    },
    "bibliography" => bibliography_manifest(bibliography, bibliography_path),
    "standardBlocks" => standard_block_manifest(config.fetch("standard_blocks"), blocks_by_path),
    "pseudocode" => {
      pseudocode.fetch("id") => compiled_pseudocode.merge(
        "sourceYaml" => web_ref(config.fetch("pseudocode")),
      ),
    },
    "boards" => {
      "schemaVersion" => semantic_zoom.fetch("schema_version"),
      "sourceYaml" => web_ref(config.fetch("view")),
      "rootBoard" => semantic_zoom.fetch("root_board"),
      "items" => boards,
    },
  }
end

def comparison_source_set_context(config)
  blocks_by_path = config.fetch("standard_blocks").to_h { |path| [path, load_yaml(path)] }
  {
    architecture: load_yaml(config.fetch("architecture")),
    view: load_yaml(config.fetch("view")),
    blocks_by_path: blocks_by_path,
    registered_blocks: config.fetch("standard_blocks"),
  }
end

validate_all_sources!
registry = load_yaml(REGISTRY)
bibliography_path = registry.fetch("bibliography")
bibliography = load_yaml(bibliography_path)
SourceContract.validate!(bibliography)
index_entries = []
source_set_contexts = {}
stale_outputs = []

write_output = lambda do |path, content|
  if CHECK_MODE
    stale_outputs << path unless File.exist?(path) && File.read(path) == content
  else
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, content)
    puts path
  end
end

registry.fetch("source_sets").each do |config|
  set_id = config.fetch("id")
  source_set_contexts[set_id] = comparison_source_set_context(config)
  out = File.join(ROOT, "renderer/architecture/manifest-#{set_id}.js")
  manifest = build_manifest(config, bibliography, bibliography_path)
  write_output.call(out, "export const manifest = #{JSON.pretty_generate(manifest)};\n")
  index_entries << {
    "id" => set_id,
    "name" => config["label"] || manifest.dig("architecture", "name"),
    "role" => config.fetch("directory_role"),
    "file" => "manifest-#{set_id}.js",
  }
end

comparison_registry_path = registry.fetch("comparisons")
comparison_registry = load_yaml(comparison_registry_path)
comparison_paths = comparison_registry.fetch("sources")
comparisons_by_path = comparison_paths.to_h { |path| [path, load_yaml(path)] }
comparison_compiler = ArchitectureComparisonCompiler::Compiler.new(
  source_sets: source_set_contexts,
  bibliography_sources: bibliography.fetch("sources"),
)
compiled_comparisons = comparison_paths.map do |path|
  comparison_compiler.compile(comparisons_by_path.fetch(path)).merge(
    "sourceYaml" => web_ref(path),
  )
end
comparison_index = {
  "schemaVersion" => comparison_registry.fetch("schema_version"),
  "compilerVersion" => ArchitectureComparisonCompiler::COMPILER_VERSION,
  "sourceYaml" => web_ref(comparison_registry_path),
  "build" => {
    "generator" => GENERATOR_VERSION,
    # Comparison highlights are resolved against compiled architecture boards,
    # reusable-block variants, and bibliography evidence. Record those inputs
    # as dependencies too; otherwise the comparison manifest would imply that
    # its YAML lens alone determined the emitted node identities.
    "inputDigests" => input_digests([
      comparison_registry_path,
      *comparison_paths,
      bibliography_path,
      *registry.fetch("source_sets").flat_map do |source_set|
        [
          source_set.fetch("architecture"),
          source_set.fetch("view"),
          *source_set.fetch("standard_blocks"),
        ]
      end,
    ]),
  },
  "items" => compiled_comparisons,
}

index_out = File.join(ROOT, "renderer/architecture/manifest-index.js")
write_output.call(
  index_out,
  "export const manifestIndex = #{JSON.pretty_generate(index_entries)};\n" \
    "export const comparisonIndex = #{JSON.pretty_generate(comparison_index)};\n",
)

if CHECK_MODE
  unless stale_outputs.empty?
    warn stale_outputs.map { |path| "stale generated manifest: #{path}" }.join("\n")
    exit 1
  end
  puts "manifest check ok"
end
