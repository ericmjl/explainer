#!/usr/bin/env ruby
# frozen_string_literal: true

require "set"
require "yaml"

ROOT = File.expand_path("..", __dir__)

SOURCE_SETS = [
  {
    label: "esmfold2",
    architecture: "architectures/biohub-esmfold2-diffusion-module.yaml",
    view: "views/esmfold2-semantic-zoom.view.yaml",
    pseudocode: "pseudocode/esmfold2-pair-bias-boundary.yaml",
  },
  {
    label: "rfd3",
    architecture: "architectures/rfd3-diffusion-module.yaml",
    view: "views/rfd3-semantic-zoom.view.yaml",
    pseudocode: "pseudocode/rfd3-diffusion-module.yaml",
  },
  {
    label: "genie3",
    architecture: "architectures/genie3-model.yaml",
    view: "views/genie3-semantic-zoom.view.yaml",
    pseudocode: "pseudocode/genie3-model.yaml",
  },
].freeze

@errors = []

def load_yaml(path)
  full_path = File.join(ROOT, path)
  unless File.exist?(full_path)
    @errors << "missing file: #{path}"
    return {}
  end
  YAML.load_file(full_path)
rescue Psych::SyntaxError => e
  @errors << "YAML syntax error in #{path}: #{e.message}"
  {}
end

def ids(items)
  Array(items).filter_map { |item| item["id"] }
end

def require_unique_ids(label, items)
  seen = Set.new
  ids(items).each do |id|
    @errors << "duplicate #{label} id: #{id}" if seen.include?(id)
    seen << id
  end
  seen
end

def require_evidence(label, item)
  evidence = item["evidence"]
  unless evidence.is_a?(Hash)
    @errors << "#{label} missing evidence"
    return
  end
  @errors << "#{label} missing evidence.status" unless evidence["status"]
  refs = evidence["refs"]
  @errors << "#{label} missing evidence.refs" if !refs.is_a?(Array) || refs.empty?
end

def require_existing_file(ref, context)
  return unless ref
  return if ref.start_with?("http", "/")

  @errors << "#{context} references missing file #{ref}" unless File.exist?(File.join(ROOT, ref))
end

def architecture_ref_exists?(ref, module_ids, rep_ids, claim_ids)
  kind, id = ref.to_s.split(".", 2)
  return false unless kind && id

  case kind
  when "modules"
    module_ids.include?(id)
  when "representations"
    rep_ids.include?(id)
  when "claims"
    claim_ids.include?(id)
  else
    false
  end
end

def collect_standard_blocks
  Dir[File.join(ROOT, "standard_blocks", "*.yaml")].each_with_object({}) do |path, blocks|
    rel = path.delete_prefix("#{ROOT}/")
    block = load_yaml(rel)
    next if block.empty?

    blocks[rel] = {
      "id" => block["id"],
      "slot_ids" => Set.new(Array(block["input_slots"]).map { |slot| slot["id"] } +
                             Array(block["output_slots"]).map { |slot| slot["id"] })
    }
  end
end

def lint_architecture(arch, standard_blocks)
  module_ids = require_unique_ids("architecture module", arch["modules"])
  rep_ids = require_unique_ids("architecture representation", arch["representations"])
  claim_ids = require_unique_ids("architecture claim", arch["claims"])
  known_nodes = module_ids | rep_ids

  Array(arch["representations"]).each { |rep| require_evidence("representation #{rep['id']}", rep) }
  Array(arch["modules"]).each do |mod|
    require_evidence("module #{mod['id']}", mod)
    Array(mod.dig("contains")).each do |child|
      ref = child["standard_block_ref"]
      @errors << "module #{mod['id']} child #{child['id']} references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
    end
    ref = mod.dig("attention", "standard_block_ref")
    @errors << "module #{mod['id']} attention references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
  end

  Array(arch["edges"]).each do |edge|
    from = edge["from"]
    to = edge["to"]
    @errors << "architecture edge #{from}->#{to} has unknown from node" unless known_nodes.include?(from)
    @errors << "architecture edge #{from}->#{to} has unknown to node" unless known_nodes.include?(to)
    require_evidence("architecture edge #{from}->#{to}", edge)
  end

  Array(arch["claims"]).each { |claim| require_evidence("claim #{claim['id']}", claim) }

  Hash(arch["state_semantics"]).each_key do |rep_id|
    @errors << "state_semantics references unknown representation #{rep_id}" unless rep_ids.include?(rep_id)
  end

  Array(arch["conditioning"]).each do |conditioning|
    ref = conditioning["standard_block_ref"]
    @errors << "conditioning #{conditioning['id']} references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
    source = conditioning["source"]
    if source && !rep_ids.include?(source) && !source.include?(".") && source != "normalized_noisy_coordinates"
      @errors << "conditioning #{conditioning['id']} has unknown source #{source}"
    end
    require_evidence("conditioning #{conditioning['id']}", conditioning)
  end

  Array(arch["scale_transitions"]).each do |transition|
    ref = transition["standard_block_ref"]
    @errors << "scale transition #{transition['id']} references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
    %w[source target index_map].each do |field|
      value = transition[field]
      next unless value
      @errors << "scale transition #{transition['id']} has unknown #{field} #{value}" unless rep_ids.include?(value)
    end
    require_evidence("scale transition #{transition['id']}", transition)
  end

  [module_ids, rep_ids, claim_ids]
end

def lint_view(view, module_ids, rep_ids)
  boards = Array(view["boards"])
  board_ids = require_unique_ids("board", boards)
  root = view["root_board"]
  @errors << "view root_board #{root} is not a board id" unless board_ids.include?(root)

  boards.each do |board|
    board_id = board["id"]
    parent = board["parent"]
    @errors << "board #{board_id} references unknown parent #{parent}" if parent && !board_ids.include?(parent)
    node_ids = require_unique_ids("node on board #{board_id}", board["nodes"])

    Array(board["nodes"]).each do |node|
      module_ref = node["module_ref"]
      rep_ref = node["rep_ref"]
      @errors << "board #{board_id} node #{node['id']} has unknown module_ref #{module_ref}" if module_ref && !module_ids.include?(module_ref)
      @errors << "board #{board_id} node #{node['id']} has unknown rep_ref #{rep_ref}" if rep_ref && !rep_ids.include?(rep_ref)
      if node["expandable"]
        target = module_ref || node["id"]
        @errors << "board #{board_id} node #{node['id']} is expandable but target board #{target} is missing" unless board_ids.include?(target)
      end
    end

    Array(board["edges"]).each do |edge|
      from = edge["from"]
      to = edge["to"]
      @errors << "board #{board_id} edge #{from}->#{to} has unknown from node" unless node_ids.include?(from)
      @errors << "board #{board_id} edge #{from}->#{to} has unknown to node" unless node_ids.include?(to)
      connection = edge["connection"]
      unless connection.is_a?(Hash) && connection["title"] && connection["role"] && connection["inside"]
        @errors << "board #{board_id} edge #{from}->#{to} missing connection title/role/inside"
      end
    end
  end
end

def lint_pseudocode(program, module_ids, rep_ids, claim_ids, standard_blocks)
  source_ids = require_unique_ids("pseudocode source", program["sources"])
  symbol_ids = require_unique_ids("pseudocode symbol", program["symbols"])
  line_ids = require_unique_ids("pseudocode line", program["lines"])

  Array(program["symbols"]).each do |symbol|
    ref = symbol["architecture_ref"]
    next unless ref
    @errors << "symbol #{symbol['id']} has bad architecture_ref #{ref}" unless architecture_ref_exists?(ref, module_ids, rep_ids, claim_ids)
  end

  Array(program["lines"]).each do |line|
    Array(line["inputs"]).each do |input|
      @errors << "line #{line['id']} input #{input} is not a declared symbol" unless symbol_ids.include?(input)
    end
    Array(line["outputs"]).each do |output|
      next if symbol_ids.include?(output)
      next if module_ids.include?(output)
      @errors << "line #{line['id']} output #{output} is neither a symbol nor a module id"
    end
    Array(line["architecture_refs"]).each do |ref|
      @errors << "line #{line['id']} has bad architecture_ref #{ref}" unless architecture_ref_exists?(ref, module_ids, rep_ids, claim_ids)
    end
    Array(line["source_refs"]).each do |source_ref|
      source = source_ref["source"]
      @errors << "line #{line['id']} references unknown source #{source}" unless source_ids.include?(source)
    end
    ref = line["standard_block_ref"]
    @errors << "line #{line['id']} references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
    if ref && line.dig("visual", "slots")
      slot_ids = standard_blocks.dig(ref, "slot_ids") || Set.new
      line.dig("visual", "slots").each_key do |slot|
        @errors << "line #{line['id']} binds unknown slot #{slot} for #{ref}" unless slot_ids.include?(slot)
      end
    end
  end

  Array(program["claims"]).each do |claim|
    Array(claim["line_refs"]).each do |line_ref|
      @errors << "pseudocode claim #{claim['id']} references unknown line #{line_ref}" unless line_ids.include?(line_ref)
    end
    require_evidence("pseudocode claim #{claim['id']}", claim)
  end
end

def lint_standard_blocks(standard_blocks)
  standard_blocks.each do |ref, block|
    @errors << "standard block #{ref} missing id" unless block["id"]
    slot_ids = block["slot_ids"]
    @errors << "standard block #{ref} has no input/output slots" if slot_ids.empty?
  end
end

standard_blocks = collect_standard_blocks

SOURCE_SETS.each do |source_set|
  arch = load_yaml(source_set.fetch(:architecture))
  view = load_yaml(source_set.fetch(:view))
  program = load_yaml(source_set.fetch(:pseudocode))

  module_ids, rep_ids, claim_ids = lint_architecture(arch, standard_blocks)
  lint_view(view, module_ids, rep_ids)
  lint_pseudocode(program, module_ids, rep_ids, claim_ids, standard_blocks)
rescue StandardError => e
  @errors << "#{source_set.fetch(:label)} lint failed: #{e.class}: #{e.message}"
end

lint_standard_blocks(standard_blocks)

if @errors.empty?
  puts "source lint ok"
else
  warn @errors.map { |error| "- #{error}" }.join("\n")
  exit 1
end
