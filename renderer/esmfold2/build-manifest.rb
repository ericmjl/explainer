#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "fileutils"
require "yaml"

ROOT = File.expand_path("../..", __dir__)

MANIFESTS = [
  {
    out: "renderer/esmfold2/manifest.js",
    architecture: "architectures/biohub-esmfold2-diffusion-module.yaml",
    view: "views/esmfold2-semantic-zoom.view.yaml",
    pseudocode: "pseudocode/esmfold2-pair-bias-boundary.yaml",
    standard_blocks: [
      "standard_blocks/pair-biased-attention.yaml",
    ],
  },
  {
    out: "renderer/rfd3/manifest.js",
    architecture: "architectures/rfd3-diffusion-module.yaml",
    view: "views/rfd3-semantic-zoom.view.yaml",
    pseudocode: "pseudocode/rfd3-diffusion-module.yaml",
    standard_blocks: [
      "standard_blocks/pair-biased-attention.yaml",
      "standard_blocks/atom-to-token-scatter-mean.yaml",
      "standard_blocks/token-to-atom-gather.yaml",
      "standard_blocks/coordinate-injection.yaml",
    ],
  },
  {
    out: "renderer/genie3/manifest.js",
    architecture: "architectures/genie3-model.yaml",
    view: "views/genie3-semantic-zoom.view.yaml",
    pseudocode: "pseudocode/genie3-model.yaml",
    standard_blocks: [],
  },
].freeze

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

def pseudocode_lines(pseudocode)
  pseudocode.fetch("lines").map do |line|
    {
      "id" => line.fetch("id"),
      "text" => line.fetch("text"),
      "refs" => Array(line["source_refs"]).map { |ref| ref["lines"] || ref["locator"] }.compact.join(", "),
    }
  end
end

def build_manifest(config)
  architecture = load_yaml(config.fetch(:architecture))
  pseudocode = load_yaml(config.fetch(:pseudocode))
  semantic_zoom = load_yaml(config.fetch(:view))
  modules = architecture.fetch("modules").map { |mod| normalize_module_refs(mod) }

  {
    "architecture" => {
      "id" => architecture.fetch("id"),
      "name" => architecture.fetch("name"),
      "status" => architecture.fetch("status"),
      "sourceYaml" => web_ref(config.fetch(:architecture)),
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
    "standardBlocks" => standard_block_manifest(config.fetch(:standard_blocks)),
    "pseudocode" => {
      pseudocode.fetch("id") => {
        "sourceYaml" => web_ref(config.fetch(:pseudocode)),
        "lines" => pseudocode_lines(pseudocode),
      },
    },
    "boards" => {
      "sourceYaml" => web_ref(config.fetch(:view)),
      "rootBoard" => semantic_zoom.fetch("root_board"),
      "items" => semantic_zoom.fetch("boards"),
    },
  }
end

MANIFESTS.each do |config|
  out = File.join(ROOT, config.fetch(:out))
  FileUtils.mkdir_p(File.dirname(out))
  File.write(out, "export const manifest = #{JSON.pretty_generate(build_manifest(config))};\n")
  puts out
end
