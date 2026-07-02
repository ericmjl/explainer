#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "yaml"

ROOT = File.expand_path("../..", __dir__)
OUT = File.join(__dir__, "manifest.js")

def load_yaml(path)
  YAML.load_file(File.join(ROOT, path))
end

def web_ref(path)
  return path if path.nil? || path.start_with?("http", "/")

  "../../#{path}"
end

architecture = load_yaml("architectures/biohub-esmfold2-diffusion-module.yaml")
standard_block = load_yaml("standard_blocks/pair-biased-attention.yaml")
pseudocode = load_yaml("pseudocode/esmfold2-pair-bias-boundary.yaml")
semantic_zoom = load_yaml("views/esmfold2-semantic-zoom.view.yaml")

modules = architecture.fetch("modules").map do |mod|
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

pseudocode_lines = pseudocode.fetch("lines").map do |line|
  {
    "id" => line.fetch("id"),
    "text" => line.fetch("text"),
    "refs" => Array(line["source_refs"]).map { |ref| ref["lines"] || ref["locator"] }.compact.join(", "),
  }
end

manifest = {
  "architecture" => {
    "id" => architecture.fetch("id"),
    "name" => architecture.fetch("name"),
    "status" => architecture.fetch("status"),
    "sourceYaml" => "../../architectures/biohub-esmfold2-diffusion-module.yaml",
    "modules" => modules,
    "representations" => architecture.fetch("representations"),
    "edges" => architecture.fetch("edges"),
    "claims" => architecture.fetch("claims").map { |claim| claim.fetch("statement") },
  },
  "standardBlocks" => {
    standard_block.fetch("id") => {
      "id" => standard_block.fetch("id"),
      "name" => standard_block.fetch("name"),
      "description" => standard_block.fetch("description"),
      "math" => standard_block.fetch("math").map { |step| step.fetch("text") },
    },
  },
  "pseudocode" => {
    pseudocode.fetch("id") => {
      "sourceYaml" => "../../pseudocode/esmfold2-pair-bias-boundary.yaml",
      "lines" => pseudocode_lines,
    },
  },
  "boards" => {
    "sourceYaml" => "../../views/esmfold2-semantic-zoom.view.yaml",
    "rootBoard" => semantic_zoom.fetch("root_board"),
    "items" => semantic_zoom.fetch("boards"),
  },
}

File.write(OUT, "export const manifest = #{JSON.pretty_generate(manifest)};\n")
puts OUT
