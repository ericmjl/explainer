# frozen_string_literal: true

require "set"

# Semantic validation for visualization-only regions. Regions group local board
# occurrences, but their repeat count and iteration identity remain owned by
# canonical architecture execution loops and relations.
module ArchitectureViewRegions
  module_function

  def errors(architecture, board, projection:)
    regions = Array(board["regions"])
    return [] if regions.empty?

    diagnostics = []
    nodes = Array(board["nodes"])
    node_ids = nodes.filter_map { |node| node["id"] }.to_set
    loops_by_ref = Array(architecture.dig("execution", "loops")).each_with_object({}) do |loop, index|
      index["execution.loops.#{loop['id']}"] = loop if loop["id"]
    end
    relation_refs = Array(architecture["relations"]).filter_map do |relation|
      "relations.#{relation['id']}" if relation["id"]
    end.to_set

    duplicate_values(regions.filter_map { |region| region["id"] }).each do |id|
      diagnostics << issue(
        "duplicate_region_id",
        "board #{board['id']} contains duplicate region id #{id}",
        region_id: id,
      )
    end

    valid_member_sets = {}
    regions.each do |region|
      region_id = region["id"] || "unknown"
      members = Array(region["node_ids"])
      duplicated_members = duplicate_values(members)
      duplicated_members.each do |node_id|
        diagnostics << issue(
          "duplicate_region_node",
          "region #{region_id} repeats local node id #{node_id}",
          region_id: region_id,
        )
      end

      unknown_members = members.reject { |node_id| node_ids.include?(node_id) }.uniq
      unknown_members.each do |node_id|
        diagnostics << issue(
          "unknown_region_node",
          "region #{region_id} references unknown local node #{node_id}",
          region_id: region_id,
        )
      end
      valid_member_sets[region_id] = members.to_set if duplicated_members.empty? && unknown_members.empty?

      execution_ref = region["execution_ref"]
      loop = loops_by_ref[execution_ref]
      unless loop
        diagnostics << issue(
          "unknown_region_execution_loop",
          "region #{region_id} references unknown execution loop #{execution_ref.inspect}",
          region_id: region_id,
        )
      else
        rerun_refs = Array(loop["reruns"]).to_set
        visible_rerun_ids = nodes.filter_map do |node|
          node["id"] if rerun_refs.include?(node["ref"])
        end
        missing_reruns = visible_rerun_ids.reject { |node_id| members.include?(node_id) }
        unless missing_reruns.empty?
          diagnostics << issue(
            "region_omits_visible_rerun",
            "region #{region_id} omits visible rerun node#{missing_reruns.length == 1 ? '' : 's'} #{missing_reruns.join(', ')} from #{execution_ref}",
            region_id: region_id,
          )
        end
      end

      Array(region["iteration_relation_refs"]).each do |relation_ref|
        unless relation_refs.include?(relation_ref)
          diagnostics << issue(
            "unknown_region_iteration_relation",
            "region #{region_id} references unknown iteration relation #{relation_ref}",
            region_id: region_id,
          )
          next
        end

        direct_matches = Array(projection && projection["edges"]).select do |edge|
          edge["projection"] == "direct" && Array(edge["relation_path"]) == [relation_ref]
        end
        unless direct_matches.length == 1
          diagnostics << issue(
            "region_iteration_relation_not_direct",
            "region #{region_id} iteration relation #{relation_ref} must resolve to exactly one direct projected edge; found #{direct_matches.length}",
            region_id: region_id,
          )
          next
        end

        edge = direct_matches.first
        next if members.include?(edge["from"]) && members.include?(edge["to"])

        diagnostics << issue(
          "region_iteration_relation_crosses_boundary",
          "region #{region_id} iteration relation #{relation_ref} connects #{edge['from']} to #{edge['to']}; both endpoints must be region nodes",
          region_id: region_id,
        )
      end
    end

    valid_member_sets.to_a.combination(2) do |(left_id, left), (right_id, right)|
      overlap = left & right
      next if overlap.empty? || left < right || right < left

      diagnostics << issue(
        "overlapping_regions",
        "regions #{left_id} and #{right_id} overlap at #{overlap.to_a.sort.join(', ')} but neither is strictly nested",
      )
    end

    diagnostics
  end

  def duplicate_values(values)
    seen = Set.new
    duplicates = Set.new
    values.each do |value|
      duplicates << value unless seen.add?(value)
    end
    duplicates.to_a.sort
  end
  private_class_method :duplicate_values

  def issue(code, message, region_id: nil)
    { "code" => code, "message" => message, "region_id" => region_id }.compact
  end
  private_class_method :issue
end
