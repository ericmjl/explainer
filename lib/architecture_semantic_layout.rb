# frozen_string_literal: true

require "set"

# Deterministic, domain-neutral placement for architecture explainer boards.
#
# The compiler works on projected occurrence IDs, not canonical endpoints. It
# therefore sees the exact graph that a reader sees after hierarchy collapse
# and elision. Its output remains declarative grid ranks; browser code still
# owns measured card geometry and orthogonal wire routing.
module ArchitectureSemanticLayout
  POLICY = "semantic_flow_v1"
  CONTEXT_KINDS = Set.new(%w[conditioning control index_flow]).freeze

  class LayoutError < StandardError
    attr_reader :code

    def initialize(code, message)
      @code = code
      super(message)
    end
  end

  Result = Struct.new(
    :policy,
    :positions,
    :grid,
    :lanes,
    :feedback_edge_indexes,
    :metrics,
    keyword_init: true,
  )

  module_function

  def compile(nodes:, edges:, architecture: nil, columns: nil)
    Compiler.new(
      nodes: nodes,
      edges: edges,
      architecture: architecture,
      columns: columns,
    ).compile
  end

  class Compiler
    def initialize(nodes:, edges:, architecture:, columns:)
      @nodes = deep_stringify(nodes)
      @edges = deep_stringify(edges)
      @architecture = deep_stringify(architecture || {})
      @requested_columns = columns
      validate!
      @nodes_by_id = @nodes.to_h { |node| [node.fetch("id"), node] }
      @sites_by_ref = Array(@architecture["value_sites"]).to_h do |site|
        ["value_sites.#{site.fetch('id')}", site]
      end
      @outgoing = Hash.new { |hash, key| hash[key] = [] }
      @incoming = Hash.new { |hash, key| hash[key] = [] }
      @edges.each_with_index do |edge, index|
        indexed = edge.merge("_layout_index" => index)
        @outgoing[edge.fetch("from")] << indexed
        @incoming[edge.fetch("to")] << indexed
      end
    end

    def compile
      context_ids = context_node_ids
      forward_edges, feedback_indexes = split_forward_and_feedback(context_ids)
      raw_ranks = longest_path_ranks(forward_edges)
      columns_by_id, grid_columns = compile_columns(raw_ranks)
      place_context_columns!(columns_by_id, context_ids)

      feedback_source_ids = feedback_indexes.filter_map do |index|
        source = @edges.fetch(index).fetch("from")
        source if value_node?(source) && !context_ids.include?(source)
      end.to_set

      lanes = @nodes_by_id.each_key.to_h do |node_id|
        lane = if context_ids.include?(node_id)
                 "context"
               elsif feedback_source_ids.include?(node_id)
                 "feedback"
               else
                 "main"
               end
        [node_id, lane]
      end
      positions, grid_rows = compile_rows(columns_by_id, lanes)

      Result.new(
        policy: POLICY,
        positions: positions,
        grid: {
          "columns" => grid_columns,
          "rows" => grid_rows,
          "column_sizing" => "content",
        },
        lanes: lanes,
        feedback_edge_indexes: feedback_indexes.to_a.sort,
        metrics: {
          "node_count" => @nodes.length,
          "edge_count" => @edges.length,
          "column_count" => grid_columns,
          "row_count" => grid_rows,
          "context_node_count" => context_ids.length,
          "feedback_node_count" => feedback_source_ids.length,
          "feedback_edge_count" => feedback_indexes.length,
        },
      )
    end

    private

    def validate!
      unless @nodes.is_a?(Array) && @edges.is_a?(Array)
        fail_layout("invalid_graph", "nodes and edges must be lists")
      end
      if @requested_columns && (!@requested_columns.is_a?(Integer) || @requested_columns < 1)
        fail_layout("invalid_columns", "columns must be a positive integer")
      end

      ids = @nodes.map { |node| node.is_a?(Hash) ? node["id"] : nil }
      if ids.any? { |id| !id.is_a?(String) || id.empty? }
        fail_layout("invalid_node", "every node requires a non-empty id")
      end
      duplicate = ids.group_by(&:itself).find { |_id, values| values.length > 1 }&.first
      fail_layout("duplicate_node", "duplicate node id #{duplicate}") if duplicate

      known = ids.to_set
      @edges.each_with_index do |edge, index|
        unless edge.is_a?(Hash) && edge["from"].is_a?(String) && edge["to"].is_a?(String)
          fail_layout("invalid_edge", "edge #{index} requires from and to occurrence IDs")
        end
        unknown = [edge["from"], edge["to"]].reject { |id| known.include?(id) }
        unless unknown.empty?
          fail_layout("unknown_endpoint", "edge #{index} references unknown nodes #{unknown.join(', ')}")
        end
      end
    end

    # Context is a semantic lane, not simply every source node. A value goes
    # north only when all of its visible uses are conditioning/control/index
    # relations. Mixed-use inputs stay in the main flow.
    def context_node_ids
      @nodes_by_id.each_with_object(Set.new) do |(node_id, node), ids|
        next unless value_node?(node_id)

        outgoing = @outgoing.fetch(node_id, [])
        next if outgoing.empty?

        context_edges = outgoing.select { |edge| context_edge?(edge) }
        next if context_edges.empty?

        ids << node_id if context_edges.length == outgoing.length
      end
    end

    # Add likely-forward edges in semantic-priority order. An edge that would
    # close a cycle becomes feedback. Processing module writes before value
    # re-entry makes common state lifecycles unfold left-to-right rather than
    # collapsing the entire repeated block into one SCC.
    def split_forward_and_feedback(context_ids)
      adjacency = @nodes_by_id.keys.to_h { |node_id| [node_id, Set.new] }
      forward = []
      feedback = Set.new
      candidates = @edges.each_with_index.reject do |(edge, _index)|
        context_edge?(edge) || context_ids.include?(edge.fetch("from"))
      end
      candidates.concat(context_precedence_edges(context_ids).map { |edge| [edge, nil] })
      candidates.sort_by! do |edge, index|
        [forward_priority(edge), edge["_layout_context_bridge"] ? 1 : 0, edge_identity(edge), index || -1]
      end

      candidates.each do |edge, index|
        from = edge.fetch("from")
        to = edge.fetch("to")
        if path_exists?(adjacency, to, from)
          feedback << index if index
        else
          adjacency.fetch(from) << to
          forward << edge
        end
      end
      [forward, feedback]
    end

    # A produced context value should not erase the fact that its producer
    # precedes the computations it conditions. These virtual edges affect only
    # rank constraints; projected/canonical edge identity remains untouched.
    def context_precedence_edges(context_ids)
      context_ids.to_a.sort.flat_map do |context_id|
        producers = @incoming.fetch(context_id, [])
          .reject { |edge| context_edge?(edge) }
          .map { |edge| edge.fetch("from") }
          .reject { |node_id| context_ids.include?(node_id) }
          .uniq
          .sort
        consumers = @outgoing.fetch(context_id, [])
          .select { |edge| context_edge?(edge) }
          .map { |edge| edge.fetch("to") }
          .uniq
          .sort
        producers.product(consumers).filter_map do |producer, consumer|
          next if producer == consumer

          {
            "from" => producer,
            "to" => consumer,
            "kind" => "data_flow",
            "_layout_context_bridge" => context_id,
          }
        end
      end
    end

    def forward_priority(edge)
      return 0 if edge["kind"] == "data_flow"
      return 1 unless edge["kind"] == "state_update"

      from_module = module_node?(edge.fetch("from"))
      to_module = module_node?(edge.fetch("to"))
      return 1 if from_module && !to_module # a computation writes state
      return 2 if !from_module && to_module # a value is consumed by computation
      return 3 unless from_module || to_module # value-to-value is usually lifecycle re-entry

      2
    end

    def edge_identity(edge)
      path = Array(edge["relation_path"] || edge["relationPath"])
      path = Array(edge["provenance_hops"]).filter_map { |hop| hop["relation_ref"] } if path.empty?
      [path.join("/"), edge.fetch("from"), edge.fetch("to")]
    end

    def path_exists?(adjacency, start, target)
      return true if start == target

      seen = Set.new([start])
      queue = [start]
      until queue.empty?
        node = queue.shift
        adjacency.fetch(node).to_a.sort.each do |neighbor|
          return true if neighbor == target
          next if seen.include?(neighbor)

          seen << neighbor
          queue << neighbor
        end
      end
      false
    end

    def longest_path_ranks(edges)
      outgoing = @nodes_by_id.keys.to_h { |node_id| [node_id, Set.new] }
      indegree = @nodes_by_id.keys.to_h { |node_id| [node_id, 0] }
      edges.each do |edge|
        from = edge.fetch("from")
        to = edge.fetch("to")
        next if outgoing.fetch(from).include?(to)

        outgoing.fetch(from) << to
        indegree[to] += 1
      end

      queue = indegree.select { |_node_id, degree| degree.zero? }.keys.sort
      ranks = @nodes_by_id.keys.to_h { |node_id| [node_id, 0] }
      visited = 0
      until queue.empty?
        node_id = queue.shift
        visited += 1
        outgoing.fetch(node_id).to_a.sort.each do |target|
          ranks[target] = [ranks.fetch(target), ranks.fetch(node_id) + 1].max
          indegree[target] -= 1
          insert_sorted!(queue, target) if indegree[target].zero?
        end
      end
      if visited != @nodes_by_id.length
        fail_layout("unresolved_cycle", "semantic feedback classification left a cycle in the forward graph")
      end
      ranks
    end

    def compile_columns(raw_ranks)
      distinct = raw_ranks.values.uniq.sort
      rank_position = distinct.each_with_index.to_h
      natural_columns = [distinct.length, 1].max
      grid_columns = @requested_columns ? [@requested_columns, natural_columns].min : natural_columns
      columns = raw_ranks.to_h do |node_id, rank|
        position = rank_position.fetch(rank)
        column = if natural_columns <= grid_columns
                   position + 1
                 elsif grid_columns == 1
                   1
                 else
                   1 + (position * (grid_columns - 1) / (natural_columns - 1))
                 end
        [node_id, column]
      end

      # Task-native boundaries are durable semantic anchors. This is mostly
      # redundant with longest-path ranking, but handles disconnected boundary
      # occurrences without leaving them in an arbitrary interior column.
      @nodes_by_id.each_key do |node_id|
        boundary = site_for(node_id)&.fetch("boundary", nil)
        columns[node_id] = 1 if boundary == "input"
        columns[node_id] = grid_columns if boundary == "output"
      end
      [columns, grid_columns]
    end

    def place_context_columns!(columns, context_ids)
      context_ids.to_a.sort.each do |node_id|
        next if %w[input output].include?(site_for(node_id)&.fetch("boundary", nil))

        consumers = @outgoing.fetch(node_id, []).map { |edge| edge.fetch("to") }
        consumer_columns = consumers.filter_map { |consumer| columns[consumer] }.sort
        next if consumer_columns.empty?

        middle = consumer_columns.length / 2
        median = if consumer_columns.length.odd?
                   consumer_columns.fetch(middle)
                 else
                   ((consumer_columns.fetch(middle - 1) + consumer_columns.fetch(middle)) / 2.0).round
                 end
        producer_floor = @incoming.fetch(node_id, [])
          .reject { |edge| context_edge?(edge) }
          .filter_map { |edge| columns[edge.fetch("from")] }
          .max
        columns[node_id] = [median, producer_floor || 1].max
      end
    end

    def compile_rows(columns, lanes)
      grouped = @nodes_by_id.keys.group_by { |node_id| columns.fetch(node_id) }
      lane_capacity = %w[context main feedback].to_h do |lane|
        maximum = grouped.values.map { |ids| ids.count { |node_id| lanes.fetch(node_id) == lane } }.max || 0
        [lane, maximum]
      end
      lane_capacity["main"] = 1 if lane_capacity.fetch("main").zero?

      outer_capacity = [lane_capacity.fetch("context"), lane_capacity.fetch("feedback")].max
      main_offset = outer_capacity
      feedback_offset = main_offset + lane_capacity.fetch("main")
      positions = {}

      grouped.keys.sort.each do |column|
        ids = grouped.fetch(column)
        context = ids.select { |node_id| lanes.fetch(node_id) == "context" }.sort_by { |id| stable_key(id) }
        main = ids.select { |node_id| lanes.fetch(node_id) == "main" }.sort_by { |id| stable_key(id) }
        feedback = ids.select { |node_id| lanes.fetch(node_id) == "feedback" }.sort_by { |id| stable_key(id) }

        context_start = outer_capacity - context.length
        context.each_with_index do |node_id, index|
          positions[node_id] = { "col" => column, "row" => context_start + index + 1 }
        end
        assign_centered!(positions, main, column, main_offset, lane_capacity.fetch("main"))
        feedback.each_with_index do |node_id, index|
          positions[node_id] = { "col" => column, "row" => feedback_offset + index + 1 }
        end
      end

      rows = outer_capacity * 2 + lane_capacity.fetch("main")
      [positions, [rows, 1].max]
    end

    def assign_centered!(positions, node_ids, column, offset, capacity)
      center = (capacity - 1) / 2.0
      slots = (0...capacity).sort_by { |slot| [(slot - center).abs, slot] }
      ordered = node_ids.sort_by do |node_id|
        node = @nodes_by_id.fetch(node_id)
        heavy = module_node?(node_id) && (node["treatment"] == "block" || node["prominence"] == "primary")
        [heavy ? 0 : 1, stable_key(node_id)]
      end
      ordered.each_with_index do |node_id, index|
        positions[node_id] = { "col" => column, "row" => offset + slots.fetch(index) + 1 }
      end
    end

    def stable_key(node_id)
      node = @nodes_by_id.fetch(node_id)
      [node.fetch("ref", ""), node_id]
    end

    def context_edge?(edge)
      CONTEXT_KINDS.include?(edge["kind"])
    end

    def module_node?(node_id)
      @nodes_by_id.fetch(node_id).fetch("ref", "").start_with?("modules.")
    end

    def value_node?(node_id)
      @nodes_by_id.fetch(node_id).fetch("ref", "").start_with?("value_sites.")
    end

    def site_for(node_id)
      @sites_by_ref[@nodes_by_id.fetch(node_id)["ref"]]
    end

    def insert_sorted!(array, value)
      index = array.bsearch_index { |candidate| candidate >= value } || array.length
      array.insert(index, value)
    end

    def fail_layout(code, message)
      raise LayoutError.new(code, message)
    end

    def deep_stringify(value)
      case value
      when Hash
        value.each_with_object({}) { |(key, child), out| out[key.to_s] = deep_stringify(child) }
      when Array
        value.map { |child| deep_stringify(child) }
      else
        value
      end
    end
  end
end
