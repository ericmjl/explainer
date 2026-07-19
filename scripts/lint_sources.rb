#!/usr/bin/env ruby
# frozen_string_literal: true

require "set"
require "yaml"
require_relative "../lib/architecture_comparison_contract"
require_relative "../lib/architecture_coverage"
require_relative "../lib/architecture_projection"
require_relative "../lib/architecture_view_lanes"
require_relative "../lib/architecture_view_regions"
require_relative "../lib/architecture_ownership"
require_relative "../lib/evidence_contract"
require_relative "../lib/pseudocode_contract"
require_relative "../lib/source_contract"
require_relative "../lib/standard_block_contract"
require_relative "../lib/strict_yaml"

ROOT = File.expand_path("..", __dir__)
REGISTRY = "architectures/index.yaml"
BIBLIOGRAPHY_SCHEMA_VERSIONS = Set["bibliography-v0.1"].freeze
ARCHITECTURE_SCHEMA_VERSIONS = Set["architecture-v0.1", "architecture-v0.2", "architecture-v0.3", "architecture-v0.4"].freeze
VIEW_SCHEMA_VERSIONS = Set["visualization-v0.1", "visualization-v0.2", "visualization-v0.3", "visualization-v0.4"].freeze
SNAKE_CASE_ID = /\A[a-z][a-z0-9_]*\z/

@errors = []

def load_yaml(path)
  full_path = File.join(ROOT, path)
  unless File.exist?(full_path)
    @errors << "missing file: #{path}"
    return {}
  end
  StrictYaml.load_file(full_path)
rescue StrictYaml::Error => e
  @errors << "YAML error in #{path}: #{e.message}"
  {}
end

def lint_source_contract(document, label)
  return unless SourceContract::SCHEMAS.key?(document["schema_version"])

  SourceContract.errors(document).each do |diagnostic|
    @errors << "#{label} #{diagnostic}"
  end
end

def ids(items)
  Array(items).filter_map { |item| item["id"] }
end

def architecture_relations(arch)
  return Array(arch["relations"]) if arch.key?("relations")

  Array(arch["edges"])
end

def require_unique_ids(label, items)
  seen = Set.new
  ids(items).each do |id|
    @errors << "duplicate #{label} id: #{id}" if seen.include?(id)
    seen << id
  end
  seen
end

def lint_source_ref(label, ref, require_role: false)
  unless ref.is_a?(Hash)
    @errors << "#{label} must be an object"
    return
  end
  source_ref = ref["source_ref"]
  @errors << "#{label} missing source_ref" unless source_ref
  role = ref["role"]
  @errors << "#{label} missing role" if require_role && !role
  @errors << "#{label} role #{role.inspect} is not snake_case" if role && !SNAKE_CASE_ID.match?(role)
end

def lint_source_ref_targets(value, label)
  case value
  when Hash
    source_ref = value["source_ref"]
    if source_ref && !@bibliography_ids.include?(source_ref)
      @errors << "#{label} references unknown bibliography source #{source_ref}"
    end
    value.each do |key, child|
      lint_source_ref_targets(child, "#{label}.#{key}")
    end
  when Array
    value.each_with_index do |child, index|
      lint_source_ref_targets(child, "#{label}[#{index}]")
    end
  end
end

def lint_bibliography(bibliography)
  lint_source_contract(bibliography, "bibliography")
  schema_version = bibliography["schema_version"]
  unless BIBLIOGRAPHY_SCHEMA_VERSIONS.include?(schema_version)
    @errors << "unsupported bibliography schema_version #{schema_version.inspect}"
  end
  sources = Array(bibliography["sources"])
  source_ids = require_unique_ids("bibliography source", sources)
  sources.each_with_index do |source, index|
    id = source["id"] || "at index #{index}"
    @errors << "bibliography source #{id} is not snake_case" if source["id"] && !SNAKE_CASE_ID.match?(source["id"])
    @errors << "bibliography source #{id} missing kind" unless source["kind"]
    @errors << "bibliography source #{id} missing title" unless source["title"]
    @errors << "bibliography source #{id} needs url or path" unless source["url"] || source["path"]
    if source["kind"] == "code"
      revision = source["revision"]
      unless revision&.match?(/\A[a-f0-9]{40}\z/)
        @errors << "code source #{id} requires an immutable 40-character revision"
      end
      if source["url"] && revision && !source["url"].include?(revision)
        @errors << "code source #{id} URL is not pinned to revision #{revision}"
      end
    end
    next unless source["kind"] == "paper"

    @errors << "paper source #{id} missing authors" if Array(source["authors"]).empty?
    @errors << "paper source #{id} missing year" unless source["year"]
  end
  source_ids
end

def require_evidence(label, item)
  evidence = item["evidence"]
  EvidenceContract.errors(evidence, @bibliography_sources_by_id, label: label).each do |error|
    @errors << error
  end
  return unless evidence.is_a?(Hash)

  refs = evidence["refs"]
  Array(refs).each_with_index do |ref, index|
    lint_source_ref("#{label} evidence ref #{index}", ref, require_role: true)
  end
end

def architecture_ref_exists?(ref, module_ids, rep_ids, value_site_ids, claim_ids, relation_ids = Set.new)
  kind, id = ref.to_s.split(".", 2)
  return false unless kind && id

  case kind
  when "modules"
    module_ids.include?(id)
  when "representations"
    rep_ids.include?(id)
  when "value_sites"
    value_site_ids.include?(id)
  when "claims"
    claim_ids.include?(id)
  when "relations"
    relation_ids.include?(id)
  else
    false
  end
end

def untyped_ref(ref, namespace = nil)
  kind, id = ref.to_s.split(".", 2)
  return ref unless id
  return ref if namespace && kind != namespace

  id
end

def collect_standard_blocks
  Dir[File.join(ROOT, "standard_blocks", "*.yaml")].each_with_object({}) do |path, blocks|
    rel = path.delete_prefix("#{ROOT}/")
    block = load_yaml(rel)
    next if block.empty?

    blocks[rel] = {
      "document" => block,
      "id" => block["id"],
      "slot_ids" => Set.new(Array(block["input_slots"]).map { |slot| slot["id"] } +
                             Array(block["output_slots"]).map { |slot| slot["id"] } +
                             Array(block["ports"]).map { |port| port["id"] })
    }
  end
end

def lint_architecture(arch, standard_blocks)
  lint_source_contract(arch, "architecture #{arch['id'] || 'unknown'}")
  lint_source_ref_targets(arch, "architecture #{arch['id'] || 'unknown'}")
  schema_version = arch["schema_version"]
  unless ARCHITECTURE_SCHEMA_VERSIONS.include?(schema_version)
    @errors << "unsupported architecture schema_version #{schema_version.inspect}"
  end
  ArchitectureOwnership.errors(arch).each { |error| @errors << "architecture ownership: #{error}" }
  ArchitectureCoverage.errors(arch).each { |error| @errors << "architecture coverage: #{error}" }
  if schema_version == "architecture-v0.2"
    @errors << "architecture-v0.2 source missing relations" unless arch.key?("relations")
    @errors << "architecture-v0.2 source still uses legacy edges" if arch.key?("edges")
  end
  if %w[architecture-v0.3 architecture-v0.4].include?(schema_version)
    @errors << "#{schema_version} source missing value_sites" unless arch.key?("value_sites")
    @errors << "#{schema_version} source missing relations" unless arch.key?("relations")
    @errors << "#{schema_version} source still uses legacy edges" if arch.key?("edges")
  end

  Array(arch["sources"]).each_with_index do |ref, index|
    lint_source_ref("architecture source ref #{index}", ref, require_role: true)
  end
  require_evidence("architecture decomposition", arch["decomposition"]) if schema_version == "architecture-v0.4"

  module_ids = require_unique_ids("architecture module", arch["modules"])
  rep_ids = require_unique_ids("architecture representation", arch["representations"])
  value_site_ids = require_unique_ids("architecture value site", arch["value_sites"])
  claim_ids = require_unique_ids("architecture claim", arch["claims"])
  block_instance_ids = require_unique_ids("architecture block instance", arch["block_instances"])
  relations = architecture_relations(arch)
  relation_ids = if %w[architecture-v0.2 architecture-v0.3 architecture-v0.4].include?(schema_version)
    require_unique_ids("architecture relation", relations)
  else
    Set.new(ids(relations))
  end
  relations_by_id = relations.each_with_object({}) do |relation, acc|
    relation_id = relation["id"]
    acc[relation_id] = relation if relation_id
  end
  known_nodes = if %w[architecture-v0.3 architecture-v0.4].include?(schema_version)
    Set.new(module_ids.map { |id| "modules.#{id}" } + value_site_ids.map { |id| "value_sites.#{id}" })
  else
    module_ids | rep_ids
  end

  if %w[architecture-v0.2 architecture-v0.3 architecture-v0.4].include?(schema_version)
    relations.each_with_index do |relation, index|
      relation_id = relation["id"]
      @errors << "architecture relation at index #{index} missing id" unless relation_id
      if relation_id && !SNAKE_CASE_ID.match?(relation_id)
        @errors << "architecture relation id #{relation_id} is not snake_case"
      end
    end
  end

  Array(arch["representations"]).each do |rep|
    require_evidence("representation #{rep['id']}", rep)
    require_unique_ids("field group on representation #{rep['id']}", rep["field_groups"])
    field_owners = {}
    Array(rep["field_groups"]).each do |group|
      require_evidence("representation #{rep['id']} field group #{group['id']}", group)
      Array(group["fields"]).each do |field|
        if field_owners.key?(field)
          @errors << "representation #{rep['id']} field #{field} appears in groups #{field_owners[field]} and #{group['id']}"
        else
          field_owners[field] = group["id"]
        end
      end
    end
  end
  value_sites_by_ref = Array(arch["value_sites"]).to_h do |site|
    ["value_sites.#{site['id']}", site]
  end
  Array(arch["value_sites"]).each do |site|
    representation_ref = untyped_ref(site["representation_ref"], "representations")
    scope_ref = site["scope_ref"]
    @errors << "value site #{site['id']} references unknown representation #{site['representation_ref']}" unless rep_ids.include?(representation_ref)
    unless scope_ref == "architecture" || (scope_ref&.start_with?("modules.") && module_ids.include?(untyped_ref(scope_ref, "modules")))
      @errors << "value site #{site['id']} has unknown scope_ref #{scope_ref.inspect}"
    end
    require_evidence("value site #{site['id']}", site) if schema_version == "architecture-v0.4"
  end
  Array(arch["modules"]).each do |mod|
    require_evidence("module #{mod['id']}", mod)
    Array(mod.dig("contains")).each do |child|
      ref = child["standard_block_ref"]
      @errors << "module #{mod['id']} child #{child['id']} references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
    end
    ref = mod.dig("attention", "standard_block_ref")
    @errors << "module #{mod['id']} attention references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
  end

  relations.each do |relation|
    relation_id = relation["id"] || "#{relation['from']}->#{relation['to']}"
    from = relation["from"]
    to = relation["to"]
    @errors << "architecture relation #{relation_id} has unknown from node #{from}" unless known_nodes.include?(from)
    @errors << "architecture relation #{relation_id} has unknown to node #{to}" unless known_nodes.include?(to)
    if %w[architecture-v0.3 architecture-v0.4].include?(schema_version)
      @errors << "architecture relation #{relation_id} missing kind" unless relation["kind"]
      Array(relation["carries"]).each do |carry|
        @errors << "architecture relation #{relation_id} carries unknown representation #{carry}" unless rep_ids.include?(untyped_ref(carry, "representations"))
      end
      if schema_version == "architecture-v0.4"
        carried = Set.new(Array(relation["carries"]))
        from_rep = value_sites_by_ref.dig(from, "representation_ref")
        to_rep = value_sites_by_ref.dig(to, "representation_ref")
        if from_rep && !to_rep && !carried.include?(from_rep)
          @errors << "architecture relation #{relation_id} leaves #{from} but does not carry #{from_rep}"
        elsif to_rep && !from_rep && !carried.include?(to_rep)
          @errors << "architecture relation #{relation_id} enters #{to} but does not carry #{to_rep}"
        elsif from_rep && to_rep && (carried & Set[from_rep, to_rep]).empty?
          @errors << "architecture relation #{relation_id} connects value sites but carries neither #{from_rep} nor #{to_rep}"
        end
      end
    end
    require_evidence("architecture relation #{relation_id}", relation)
  end

  Array(arch["claims"]).each { |claim| require_evidence("claim #{claim['id']}", claim) }
  Array(arch["block_instances"]).each do |instance|
    require_evidence("block instance #{instance['id']}", instance)
  end
  if schema_version == "architecture-v0.4"
    require_evidence("training_inference", arch["training_inference"])
    require_evidence("reference_configuration", arch["reference_configuration"]) if arch["reference_configuration"]

    Array(arch.dig("execution", "loops")).each do |loop|
      Array(loop["reruns"]).each do |ref|
        unless ref.start_with?("modules.") && module_ids.include?(untyped_ref(ref, "modules"))
          @errors << "execution loop #{loop['id']} reruns unknown module #{ref}"
        end
      end
      Array(loop["cached"]).each do |ref|
        unless architecture_ref_exists?(ref, module_ids, rep_ids, value_site_ids, claim_ids, relation_ids)
          @errors << "execution loop #{loop['id']} caches unknown fact #{ref}"
        end
      end
    end

    known_question_refs = Set["architecture"]
    known_question_refs.merge(module_ids.map { |id| "modules.#{id}" })
    known_question_refs.merge(rep_ids.map { |id| "representations.#{id}" })
    known_question_refs.merge(value_site_ids.map { |id| "value_sites.#{id}" })
    known_question_refs.merge(relation_ids.map { |id| "relations.#{id}" })
    known_question_refs.merge(ids(arch["conditioning"]).map { |id| "conditioning.#{id}" })
    known_question_refs.merge(ids(arch["scale_transitions"]).map { |id| "scale_transitions.#{id}" })
    known_question_refs.merge(block_instance_ids.map { |id| "block_instances.#{id}" })
    known_question_refs.merge(Hash(arch["state_semantics"]).keys.map { |id| "state_semantics.#{id}" })
    known_question_refs.merge(Array(arch.dig("execution", "loops")).filter_map do |loop|
      "execution.loops.#{loop['id']}" if loop["id"]
    end)
    Array(arch["open_questions"]).each do |question|
      Array(question["affected_refs"]).each do |ref|
        @errors << "open question #{question['id']} affects unknown fact #{ref}" unless known_question_refs.include?(ref)
      end
      require_evidence("open question #{question['id']}", question)
      if question.dig("evidence", "status") != "open_question"
        @errors << "open question #{question['id']} evidence.status must be open_question"
      end
    end
  end

  unless schema_version == "architecture-v0.4"
    Hash(arch["state_semantics"]).each_key do |rep_id|
      valid_state_ref = rep_ids.include?(rep_id) || value_site_ids.include?(rep_id) ||
                        (rep_id.start_with?("value_sites.") && value_site_ids.include?(untyped_ref(rep_id, "value_sites")))
      @errors << "state_semantics references unknown representation/value site #{rep_id}" unless valid_state_ref
    end
  end
  if schema_version == "architecture-v0.4"
    Hash(arch["state_semantics"]).each do |group_id, semantics|
      require_evidence("state_semantics #{group_id}", semantics)
    end
  end

  Array(arch["conditioning"]).each do |conditioning|
    ref = conditioning["standard_block_ref"]
    @errors << "conditioning #{conditioning['id']} references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
    source = conditioning["source"]
    target = conditioning["target"]
    unless schema_version == "architecture-v0.4"
      if source && !rep_ids.include?(source) && !source.include?(".")
        @errors << "conditioning #{conditioning['id']} has unknown source #{source}"
      end
      relation_ref = conditioning["relation_ref"]
      relation_id = untyped_ref(relation_ref, "relations")
      if schema_version == "architecture-v0.2" && !relation_ref
        @errors << "conditioning #{conditioning['id']} missing relation_ref"
      elsif relation_ref
        relation = relations_by_id[relation_id]
        unless relation
          @errors << "conditioning #{conditioning['id']} references unknown relation #{relation_ref}"
        else
          unless relation["kind"] == "conditioning"
            @errors << "conditioning #{conditioning['id']} relation #{relation_ref} must have kind conditioning"
          end
          source_node = schema_version == "architecture-v0.3" ? source : source.to_s.split(".", 2).first
          target_node = schema_version == "architecture-v0.3" ? target : target.to_s.split(".", 2).first
          unless relation["from"] == source_node && relation["to"] == target_node
            @errors << "conditioning #{conditioning['id']} resolves to #{source_node}->#{target_node}, but relation #{relation_ref} is #{relation['from']}->#{relation['to']}"
          end
        end
      end
    end
    require_evidence("conditioning #{conditioning['id']}", conditioning)
  end

  Array(arch["scale_transitions"]).each do |transition|
    ref = transition["standard_block_ref"]
    @errors << "scale transition #{transition['id']} references missing standard block #{ref}" if ref && !standard_blocks.key?(ref)
    unless schema_version == "architecture-v0.4"
      %w[source target index_map].each do |field|
        value = transition[field]
        next unless value
        valid_transition_ref = if schema_version == "architecture-v0.3" && %w[source target index_map].include?(field)
          value_site_ids.include?(untyped_ref(value, "value_sites"))
        else
          rep_ids.include?(untyped_ref(value, "representations"))
        end
        @errors << "scale transition #{transition['id']} has unknown #{field} #{value}" unless valid_transition_ref
      end
    end
    require_evidence("scale transition #{transition['id']}", transition)
  end

  [module_ids, rep_ids, value_site_ids, claim_ids, relation_ids, relations_by_id]
end

def architecture_flow_pairs(arch)
  pairs = Set.new
  architecture_relations(arch).each { |relation| pairs << [relation["from"], relation["to"]] }
  Array(arch["modules"]).each do |mod|
    Array(mod["inputs"]).each { |rep| pairs << [rep, mod["id"]] }
    Array(mod["outputs"]).each { |rep| pairs << [mod["id"], rep] }
  end
  pairs
end

def lint_board_elision(board)
  board_id = board["id"]
  elided = Array(board["nodes"]).select { |node| node["elide"] }.map { |node| node["id"] }
  return if elided.empty?

  in_degree = Hash.new(0)
  out_degree = Hash.new(0)
  Array(board["edges"]).each do |edge|
    out_degree[edge["from"]] += 1
    in_degree[edge["to"]] += 1
  end

  elided.each do |node_id|
    if in_degree[node_id].zero? || out_degree[node_id].zero?
      @errors << "board #{board_id} node #{node_id} is elided but has no incoming or no outgoing edge; contraction would silently drop it"
    elsif in_degree[node_id] > 1 && out_degree[node_id] > 1
      @errors << "board #{board_id} node #{node_id} is elided with fan-in and fan-out (#{in_degree[node_id]}x#{out_degree[node_id]}); contraction would be ambiguous"
    end
  end
end

def lint_board_lanes(board)
  board_id = board["id"]
  if board.key?("scale_lanes")
    @errors << "board #{board_id} uses legacy scale_lanes; omit lanes for the default or declare explicit lanes"
  end
  lanes = board["lanes"]
  return unless lanes
  unless lanes.is_a?(Array)
    @errors << "board #{board_id} lanes must be an array"
    return
  end

  lane_ids = require_unique_ids("lane on board #{board_id}", lanes)
  lane_ids.each do |id|
    @errors << "board #{board_id} lane id #{id} is not snake_case" unless SNAKE_CASE_ID.match?(id)
  end
  lanes.each_with_index do |lane, index|
    @errors << "board #{board_id} lane at index #{index} missing id" unless lane["id"]
    label = lane["label"]
    @errors << "board #{board_id} lane #{lane['id'] || index} missing label" unless label.is_a?(String) && !label.empty?
    next if lane["kind"] == "representation"

    position = lane["position"]
    unless position.is_a?(Numeric) && position.between?(0, 100)
      @errors << "board #{board_id} lane #{lane['id'] || index} position must be between 0 and 100"
    end
  end
end

def lint_projected_view(view, arch)
  unless %w[architecture-v0.3 architecture-v0.4].include?(arch["schema_version"])
    @errors << "visualization-v0.4 requires architecture-v0.3 or architecture-v0.4"
    return
  end

  boards = Array(view["boards"])
  board_ids = require_unique_ids("board", boards)
  boards_by_id = boards.to_h { |board| [board["id"], board] }
  root = view["root_board"]
  @errors << "view root_board #{root} is not a board id" unless board_ids.include?(root)

  projector = ArchitectureProjection::Projector.new(arch)
  modules_by_ref = Array(arch["modules"]).to_h { |mod| ["modules.#{mod['id']}", mod] }
  block_instances_by_ref = Array(arch["block_instances"]).to_h do |instance|
    ["block_instances.#{instance['id']}", instance]
  end
  boards.each do |board|
    board_id = board["id"]
    lint_board_lanes(board)
    parent = board["parent"]
    @errors << "board #{board_id} references unknown parent #{parent}" if parent && !board_ids.include?(parent)
    @errors << "board #{board_id} cannot be its own parent" if parent == board_id
    subject_ref = board["subject_ref"]
    subject = subject_ref == "architecture" ? arch : modules_by_ref[subject_ref]
    subject_status = subject&.dig("decomposition", "status")
    if board["kind"] == "standard_block_instance"
      instance = block_instances_by_ref[board["block_instance_ref"]]
      unless instance
        @errors << "board #{board_id} references unknown block instance #{board['block_instance_ref']}"
      end
      if instance && instance["subject_ref"] != subject_ref
        @errors << "board #{board_id} subject #{subject_ref} does not match #{board['block_instance_ref']} subject #{instance['subject_ref']}"
      end
      next
    elsif %w[leaf opaque].include?(subject_status)
      @errors << "board #{board_id} expands #{subject_ref}, but its decomposition status is #{subject_status}"
    end

    require_unique_ids("node on board #{board_id}", board["nodes"])
    require_unique_ids("reference panel on board #{board_id}", board["reference_panels"])
    Array(board["reference_panels"]).each do |panel|
      asset = panel["asset"]
      if asset && !File.file?(File.join(ROOT, asset))
        @errors << "board #{board_id} reference panel #{panel['id']} asset is missing: #{asset}"
      end
    end
    columns = board.dig("grid", "columns")
    rows = board.dig("grid", "rows")
    occupied = {}
    Array(board["nodes"]).each do |node|
      if columns && node["col"] && node["col"] > columns
        @errors << "board #{board_id} node #{node['id']} col #{node['col']} exceeds grid columns #{columns}"
      end
      if rows && node["row"] && node["row"] > rows
        @errors << "board #{board_id} node #{node['id']} row #{node['row']} exceeds grid rows #{rows}"
      end
      cell = [node["col"], node["row"]]
      if occupied.key?(cell)
        @errors << "board #{board_id} nodes #{occupied[cell]} and #{node['id']} overlap at col #{cell[0]}, row #{cell[1]}"
      else
        occupied[cell] = node["id"]
      end
    end

    Array(board["edge_overrides"]).each_with_index do |override, index|
      if override.key?("route_clearance") && !override["route_side"]
        @errors << "board #{board_id} edge override #{index} sets route_clearance without route_side"
      end
    end

    Array(board["nodes"]).each do |node|
      board_ref = node["board_ref"]
      next unless board_ref

      target = boards_by_id[board_ref]
      unless target
        @errors << "board #{board_id} node #{node['id']} has unknown board_ref #{board_ref}"
        next
      end
      if target["parent"] != board_id
        @errors << "board #{board_id} node #{node['id']} opens #{board_ref}, but that board declares parent #{target['parent'].inspect}"
      end
      if node["ref"]&.start_with?("modules.") && target["subject_ref"] != node["ref"]
        @errors << "board #{board_id} node #{node['id']} opens #{board_ref} with subject #{target['subject_ref'].inspect}, expected #{node['ref']}"
      end
    end

    begin
      projection = projector.project(board)
      ArchitectureViewLanes.errors(arch, board, projection: projection).each do |item|
        @errors << "board #{board_id} lane validation [#{item['code']}]: #{item['message']}"
      end
      ArchitectureViewRegions.errors(arch, board, projection: projection).each do |item|
        @errors << "board #{board_id} region validation [#{item['code']}]: #{item['message']}"
      end
    rescue ArchitectureProjection::ProjectionError => e
      @errors << "board #{board_id} projection failed [#{e.code}]: #{e.message}"
    end
  end

  return unless board_ids.include?(root)

  reachable = Set[root]
  queue = [root]
  until queue.empty?
    board = boards_by_id[queue.shift]
    Array(board && board["nodes"]).each do |node|
      board_ref = node["board_ref"]
      next unless board_ref && board_ids.include?(board_ref) && !reachable.include?(board_ref)

      reachable << board_ref
      queue << board_ref
    end
  end
  (board_ids - reachable).each do |board_id|
    @errors << "board #{board_id} is unreachable from root_board #{root} through board_ref"
  end
end

def lint_view(view, arch, module_ids, rep_ids, relations_by_id)
  lint_source_contract(view, "view #{view['id'] || 'unknown'}")
  lint_source_ref_targets(view, "view #{view['id'] || 'unknown'}")
  schema_version = view["schema_version"]
  unless VIEW_SCHEMA_VERSIONS.include?(schema_version)
    @errors << "unsupported visualization schema_version #{schema_version.inspect}"
  end
  if schema_version == "visualization-v0.4"
    lint_projected_view(view, arch)
    return
  end
  if %w[architecture-v0.3 architecture-v0.4].include?(arch["schema_version"])
    @errors << "#{arch['schema_version']} requires visualization-v0.4, got #{schema_version.inspect}"
    return
  end
  strict_provenance = schema_version == "visualization-v0.3"
  boards = Array(view["boards"])
  board_ids = require_unique_ids("board", boards)
  boards_by_id = boards.to_h { |board| [board["id"], board] }
  root = view["root_board"]
  @errors << "view root_board #{root} is not a board id" unless board_ids.include?(root)
  flow_pairs = architecture_flow_pairs(arch)

  boards.each do |board|
    board_id = board["id"]
    lint_board_lanes(board)
    parent = board["parent"]
    @errors << "board #{board_id} references unknown parent #{parent}" if parent && !board_ids.include?(parent)
    @errors << "board #{board_id} cannot be its own parent" if parent == board_id
    column_sizing = board.dig("grid", "column_sizing")
    if column_sizing && !%w[uniform content].include?(column_sizing)
      @errors << "board #{board_id} has invalid grid.column_sizing #{column_sizing.inspect}"
    end
    node_ids = require_unique_ids("node on board #{board_id}", board["nodes"])
    nodes_by_id = Array(board["nodes"]).to_h { |node| [node["id"], node] }

    Array(board["nodes"]).each do |node|
      module_ref = node["module_ref"]
      rep_ref = node["rep_ref"]
      board_ref = node["board_ref"]
      @errors << "board #{board_id} node #{node['id']} has unknown module_ref #{module_ref}" if module_ref && !module_ids.include?(module_ref)
      @errors << "board #{board_id} node #{node['id']} has unknown rep_ref #{rep_ref}" if rep_ref && !rep_ids.include?(rep_ref)
      @errors << "board #{board_id} node #{node['id']} has unknown board_ref #{board_ref}" if board_ref && !board_ids.include?(board_ref)
      if strict_provenance && board_ref && boards_by_id[board_ref] && boards_by_id[board_ref]["parent"] != board_id
        @errors << "board #{board_id} node #{node['id']} opens #{board_ref}, but that board declares parent #{boards_by_id[board_ref]['parent'].inspect}"
      end
      if strict_provenance && node.key?("expandable")
        @errors << "board #{board_id} node #{node['id']} uses legacy expandable; use board_ref"
      end
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

      route_side = edge["route_side"]
      if route_side && !%w[top bottom left right].include?(route_side)
        @errors << "board #{board_id} edge #{from}->#{to} has invalid route_side #{route_side.inspect}"
      end
      if edge.key?("route_clearance")
        clearance = edge["route_clearance"]
        @errors << "board #{board_id} edge #{from}->#{to} sets route_clearance without route_side" unless route_side
        unless clearance.is_a?(Numeric) && clearance.positive?
          @errors << "board #{board_id} edge #{from}->#{to} route_clearance must be a positive number"
        end
      end

      from_ref = nodes_by_id.dig(from, "module_ref") || nodes_by_id.dig(from, "rep_ref")
      to_ref = nodes_by_id.dig(to, "module_ref") || nodes_by_id.dig(to, "rep_ref")
      relation_ref = edge["relation_ref"]
      view_only = edge["view_only"] == true

      if relation_ref && view_only
        @errors << "board #{board_id} edge #{from}->#{to} cannot set both relation_ref and view_only"
      elsif strict_provenance && !relation_ref && !view_only
        @errors << "board #{board_id} edge #{from}->#{to} must set relation_ref or view_only: true"
      end

      if relation_ref
        relation = relations_by_id[relation_ref]
        unless relation
          @errors << "board #{board_id} edge #{from}->#{to} references unknown relation #{relation_ref}"
          next
        end
        unless from_ref && to_ref
          @errors << "board #{board_id} edge #{from}->#{to} relation_ref #{relation_ref} requires architecture-backed endpoints"
          next
        end
        unless relation["from"] == from_ref && relation["to"] == to_ref
          @errors << "board #{board_id} edge #{from}->#{to} resolves to #{from_ref}->#{to_ref}, but relation #{relation_ref} is #{relation['from']}->#{relation['to']}"
        end
      elsif view_only && from_ref && to_ref
        @errors << "board #{board_id} edge #{from}->#{to} is view_only but both endpoints resolve to architecture objects #{from_ref}->#{to_ref}; add a canonical relation"
      elsif !strict_provenance && from_ref && to_ref && !flow_pairs.include?([from_ref, to_ref])
        @errors << "board #{board_id} edge #{from}->#{to} (architecture #{from_ref}->#{to_ref}) has no matching architecture relation or module input/output"
      end
    end

    lint_board_elision(board)
  end

  if strict_provenance && board_ids.include?(root)
    reachable = Set[root]
    queue = [root]
    until queue.empty?
      board = boards_by_id[queue.shift]
      Array(board && board["nodes"]).each do |node|
        board_ref = node["board_ref"]
        next unless board_ref && board_ids.include?(board_ref) && !reachable.include?(board_ref)

        reachable << board_ref
        queue << board_ref
      end
    end
    (board_ids - reachable).each do |board_id|
      @errors << "board #{board_id} is unreachable from root_board #{root} through board_ref"
    end
  end
end

def lint_pseudocode(program, architecture, module_ids, rep_ids, value_site_ids, claim_ids, relation_ids, standard_blocks, block_instance_ids)
  semantic_v2 = program["schema_version"] == "pseudocode-v0.2"
  if semantic_v2
    PseudocodeContract.errors(program, architecture: architecture).each do |diagnostic|
      @errors << "pseudocode #{program['id'] || 'unknown'} #{diagnostic}"
    end
  end
  lint_source_ref_targets(program, "pseudocode #{program['id'] || 'unknown'}")
  source_ids = require_unique_ids("pseudocode source", program["sources"])
  symbol_ids = require_unique_ids("pseudocode symbol", program["symbols"])
  line_ids = require_unique_ids("pseudocode line", program["lines"])

  Array(program["sources"]).each_with_index do |ref, index|
    lint_source_ref("pseudocode source #{ref['id'] || index}", ref)
  end

  Array(program["symbols"]).each do |symbol|
    next if semantic_v2

    ref = symbol["architecture_ref"]
    next unless ref
    @errors << "symbol #{symbol['id']} has bad architecture_ref #{ref}" unless architecture_ref_exists?(ref, module_ids, rep_ids, value_site_ids, claim_ids, relation_ids)
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
      next if semantic_v2

      @errors << "line #{line['id']} has bad architecture_ref #{ref}" unless architecture_ref_exists?(ref, module_ids, rep_ids, value_site_ids, claim_ids, relation_ids)
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
    instance_ref = line["block_instance_ref"]
    if instance_ref && !block_instance_ids.include?(untyped_ref(instance_ref, "block_instances"))
      @errors << "line #{line['id']} references missing block instance #{instance_ref}"
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
    document = block["document"]
    next unless document["schema_version"] == "standard-block-v0.2"

    StandardBlockContract.definition_errors(document).each do |diagnostic|
      @errors << "standard block #{ref} [#{diagnostic.code}] #{diagnostic.path}: #{diagnostic.message}"
    end
  end
end

standard_blocks = collect_standard_blocks
registry = load_yaml(REGISTRY)
source_set_contexts = {}
bibliography_path = registry["bibliography"]
if bibliography_path
  bibliography = load_yaml(bibliography_path)
  @bibliography_sources_by_id = Array(bibliography["sources"]).to_h { |source| [source["id"], source] }
  @bibliography_ids = lint_bibliography(bibliography)
else
  @errors << "registry missing bibliography"
  @bibliography_ids = Set.new
  @bibliography_sources_by_id = {}
end

Array(registry["source_sets"]).each do |source_set|
  directory_role = source_set["directory_role"]
  unless %w[architecture reference].include?(directory_role)
    @errors << "registry set #{source_set['id']} requires directory_role architecture or reference"
  end

  arch = load_yaml(source_set.fetch("architecture"))
  view = load_yaml(source_set.fetch("view"))
  program = load_yaml(source_set.fetch("pseudocode"))

  Array(source_set["standard_blocks"]).each do |ref|
    @errors << "registry set #{source_set['id']} references missing standard block #{ref}" unless standard_blocks.key?(ref)
  end

  module_ids, rep_ids, value_site_ids, claim_ids, relation_ids, relations_by_id = lint_architecture(arch, standard_blocks)
  registered_blocks = Array(source_set["standard_blocks"])
  block_documents = standard_blocks.transform_values { |block| block["document"] }
  source_set_contexts[source_set.fetch("id")] = {
    architecture: arch,
    view: view,
    blocks_by_path: block_documents,
    registered_blocks: registered_blocks,
  }
  StandardBlockContract.instance_errors(
    arch,
    blocks_by_path: block_documents,
    registered_blocks: registered_blocks,
  ).each do |diagnostic|
    @errors << "architecture #{arch['id']} block instance [#{diagnostic.code}] #{diagnostic.path}: #{diagnostic.message}"
  end
  lint_view(view, arch, module_ids, rep_ids, relations_by_id)
  block_instance_ids = Set.new(Array(arch["block_instances"]).filter_map { |instance| instance["id"] })
  lint_pseudocode(program, arch, module_ids, rep_ids, value_site_ids, claim_ids, relation_ids, standard_blocks, block_instance_ids)
rescue StandardError => e
  @errors << "#{source_set.fetch('id')} lint failed: #{e.class}: #{e.message}"
end

lint_standard_blocks(standard_blocks)

comparison_registry_path = registry["comparisons"]
if comparison_registry_path
  comparison_registry = load_yaml(comparison_registry_path)
  lint_source_contract(comparison_registry, "comparison registry")
  comparison_paths = Array(comparison_registry["sources"])
  comparisons_by_path = comparison_paths.to_h do |path|
    comparison = load_yaml(path)
    lint_source_contract(comparison, "comparison #{path}")
    [path, comparison]
  end
  ArchitectureComparisonContract.registry_errors(
    comparison_registry,
    comparisons_by_path: comparisons_by_path,
  ).each do |diagnostic|
    @errors << "comparison registry [#{diagnostic.code}] #{diagnostic.path}: #{diagnostic.message}"
  end
  comparisons_by_path.each do |path, comparison|
    ArchitectureComparisonContract.errors(
      comparison,
      source_sets: source_set_contexts,
      bibliography_sources: @bibliography_sources_by_id,
    ).each do |diagnostic|
      @errors << "comparison #{path} [#{diagnostic.code}] #{diagnostic.path}: #{diagnostic.message}"
    end
  end
else
  @errors << "registry missing comparisons"
end

if @errors.empty?
  puts "source lint ok"
else
  warn @errors.map { |error| "- #{error}" }.join("\n")
  exit 1
end
