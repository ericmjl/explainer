#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "fileutils"
require "yaml"

ROOT = File.expand_path("../..", __dir__)
REGISTRY = "architectures/index.yaml"

def load_yaml(path)
  YAML.load_file(File.join(ROOT, path))
end

def web_ref(path)
  return path if path.nil? || path.start_with?("http", "/")

  "../../#{path}"
end

def normalize_module_refs(mod)
  mod = mod.dup
  mod["story_ref"] = web_ref(mod["story_ref"]) if mod["story_ref"]
  mod["pseudocode_ref"] = web_ref(mod["pseudocode_ref"]) if mod["pseudocode_ref"]
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

def build_manifest(config)
  architecture = load_yaml(config.fetch("architecture"))
  pseudocode = load_yaml(config.fetch("pseudocode"))
  semantic_zoom = load_yaml(config.fetch("view"))
  modules = architecture.fetch("modules").map { |mod| normalize_module_refs(mod) }

  {
    "architecture" => {
      "id" => architecture.fetch("id"),
      "name" => architecture.fetch("name"),
      "status" => architecture.fetch("status"),
      "sourceYaml" => web_ref(config.fetch("architecture")),
      "modules" => modules,
      "representations" => architecture.fetch("representations"),
      "execution" => architecture["execution"] || {},
      "stateSemantics" => architecture["state_semantics"] || {},
      "conditioning" => architecture["conditioning"] || [],
      "scaleTransitions" => architecture["scale_transitions"] || [],
      "trainingInference" => architecture["training_inference"] || {},
      "edges" => architecture.fetch("edges"),
      "claims" => architecture.fetch("claims").map { |claim| claim.fetch("statement") },
    },
    "standardBlocks" => standard_block_manifest(config.fetch("standard_blocks")),
    "pseudocode" => {
      pseudocode.fetch("id") => {
        "sourceYaml" => web_ref(config.fetch("pseudocode")),
        "symbols" => pseudocode_symbols(pseudocode),
        "lines" => pseudocode_lines(pseudocode),
      },
    },
    "boards" => {
      "sourceYaml" => web_ref(config.fetch("view")),
      "rootBoard" => semantic_zoom.fetch("root_board"),
      "items" => semantic_zoom.fetch("boards"),
    },
  }
end

registry = load_yaml(REGISTRY)
index_entries = []

registry.fetch("source_sets").each do |config|
  set_id = config.fetch("id")
  out = File.join(ROOT, "renderer/architecture/manifest-#{set_id}.js")
  FileUtils.mkdir_p(File.dirname(out))
  manifest = build_manifest(config)
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
