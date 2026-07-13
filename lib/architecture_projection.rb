# frozen_string_literal: true

require "digest"
require "set"

# Build-time semantic projection for architecture-v0.3 and visualization-v0.4.
#
# The projector intentionally knows nothing about pixels or wire geometry. It
# turns a curated board request into visible occurrences and canonical edges
# with ordered relation provenance. Invalid or ambiguous projections fail
# closed with ProjectionError.
module ArchitectureProjection
  class ProjectionError < StandardError
    attr_reader :code

    def initialize(code, message)
      @code = code
      super(message)
    end
  end

  class Projector
    PRESENTATION_FIELDS = Set.new(%w[
      label notation prominence emphasis compact board_ref route_side
      route_clearance audience connection tone
    ]).freeze

    attr_reader :architecture, :hierarchy_depths

    def self.project(architecture:, board:)
      new(architecture).project(board)
    end

    def initialize(architecture)
      @architecture = deep_stringify(architecture)
      validate_architecture!
    end

    def project(board)
      reset_board_state(deep_stringify(board))
      resolve_scope!
      read_occurrences!
      read_visibility_directives!
      classify_frontier!
      quotient_edges = map_relations_to_frontier
      semantic_edges = contract_elisions(quotient_edges)
      projected_edges = bind_occurrences(semantic_edges)
      apply_edge_overrides!(projected_edges)
      validate_root_reachability!(projected_edges) if @subject_ref == "architecture"

      {
        "id" => @board_id,
        "subject_ref" => @subject_ref,
        "expansion_depth" => @expansion_depth,
        "projection_mode" => "derived",
        "nodes" => @nodes.map(&:dup),
        "edges" => projected_edges.sort_by { |edge| edge_sort_key(edge) },
        "classifications" => @classifications.sort.to_h
      }
    end

    private

    def validate_architecture!
      unless @architecture["schema_version"] == "architecture-v0.3"
        fail_projection("unsupported_architecture", "expected architecture-v0.3")
      end

      @modules = index_objects(@architecture["modules"], "modules")
      @representations = index_objects(@architecture["representations"], "representations")
      @value_sites = index_objects(@architecture["value_sites"], "value_sites")
      @relations = index_objects(@architecture["relations"], "relations")

      validate_hierarchy!
      validate_value_sites!
      validate_relations!
      validate_canonical_boundary_reachability!
      validate_architecture_boundary_reachability!
    end

    def index_objects(objects, namespace)
      fail_projection("invalid_architecture", "#{namespace} must be a list") unless objects.is_a?(Array)

      objects.each_with_object({}) do |object, index|
        id = object["id"]
        unless id.is_a?(String) && id.match?(/\A[a-z][a-z0-9_]*\z/)
          fail_projection("invalid_id", "invalid #{namespace} id #{id.inspect}")
        end
        ref = "#{namespace}.#{id}"
        fail_projection("duplicate_id", "duplicate canonical ref #{ref}") if index.key?(ref)

        index[ref] = object
      end
    end

    def validate_hierarchy!
      @module_parents = {}
      @modules.each do |ref, mod|
        parent = mod["parent_ref"]
        unless parent == "architecture" || @modules.key?(parent)
          fail_projection("invalid_parent", "#{ref} has missing parent #{parent.inspect}")
        end
        @module_parents[ref] = parent
      end

      @hierarchy_depths = { "architecture" => 0 }
      visiting = Set.new
      compute_depth = lambda do |ref|
        return @hierarchy_depths.fetch(ref) if @hierarchy_depths.key?(ref)
        fail_projection("hierarchy_cycle", "module hierarchy contains a cycle at #{ref}") if visiting.include?(ref)

        visiting << ref
        parent = @module_parents.fetch(ref)
        @hierarchy_depths[ref] = compute_depth.call(parent) + 1
        visiting.delete(ref)
        @hierarchy_depths.fetch(ref)
      end
      @modules.each_key { |ref| compute_depth.call(ref) }
    end

    def validate_value_sites!
      @value_sites.each do |ref, site|
        representation_ref = site["representation_ref"]
        scope_ref = site["scope_ref"]
        unless @representations.key?(representation_ref)
          fail_projection("invalid_value_site", "#{ref} has missing representation #{representation_ref.inspect}")
        end
        unless scope_ref == "architecture" || @modules.key?(scope_ref)
          fail_projection("invalid_value_site", "#{ref} has missing scope #{scope_ref.inspect}")
        end
        boundary = site["boundary"]
        if boundary && !%w[input output].include?(boundary)
          fail_projection("invalid_boundary", "#{ref} has invalid boundary #{boundary.inspect}")
        end
      end
    end

    def validate_relations!
      @relations.each do |ref, relation|
        from = relation["from"]
        to = relation["to"]
        unless endpoint_ref?(from) && endpoint_ref?(to)
          fail_projection("invalid_relation", "#{ref} has invalid endpoints #{from.inspect} -> #{to.inspect}")
        end
        unless relation["kind"].is_a?(String) && !relation["kind"].empty?
          fail_projection("invalid_relation", "#{ref} requires a flow kind")
        end
        carries = relation.fetch("carries", [])
        unless carries.is_a?(Array) && carries.all? { |carry| @representations.key?(carry) }
          fail_projection("invalid_relation", "#{ref} has invalid carries")
        end
      end
    end

    def validate_canonical_boundary_reachability!
      inputs = @value_sites.select { |_ref, site| site["boundary"] == "input" }.keys
      outputs = @value_sites.select { |_ref, site| site["boundary"] == "output" }.keys
      if inputs.empty? || outputs.empty?
        fail_projection("missing_task_boundary", "architecture requires at least one boundary input and output")
      end

      adjacency = Hash.new { |hash, key| hash[key] = [] }
      @relations.each_value { |relation| adjacency[relation["from"]] << relation["to"] }
      inputs.each do |input|
        next if outputs.any? { |output| reachable?(adjacency, input, output) }

        fail_projection("disconnected_boundary", "#{input} reaches no task output")
      end
      outputs.each do |output|
        next if inputs.any? { |input| reachable?(adjacency, input, output) }

        fail_projection("disconnected_boundary", "#{output} is unreachable from every task input")
      end
    end

    def validate_architecture_boundary_reachability!
      inputs = @value_sites.select { |_ref, site| site["boundary"] == "input" }.keys
      outputs = @value_sites.select { |_ref, site| site["boundary"] == "output" }.keys
      if inputs.empty? || outputs.empty?
        fail_projection("incomplete_task_boundary", "architecture requires at least one boundary input and output")
      end

      adjacency = Hash.new { |hash, key| hash[key] = [] }
      @relations.each_value { |relation| adjacency[relation["from"]] << relation["to"] }
      inputs.each do |input|
        unless outputs.any? { |output| reachable?(adjacency, input, output) }
          fail_projection("incomplete_task_boundary", "#{input} reaches no boundary output")
        end
      end
      outputs.each do |output|
        unless inputs.any? { |input| reachable?(adjacency, input, output) }
          fail_projection("incomplete_task_boundary", "#{output} is unreachable from every boundary input")
        end
      end
    end

    def reset_board_state(board)
      @board = board
      @board_id = board["id"] || "board"
      @classifications = {}
      @relation_status = {}
    end

    def resolve_scope!
      @subject_ref = @board["subject_ref"]
      unless @subject_ref == "architecture" || @modules.key?(@subject_ref)
        fail_projection("invalid_subject", "board #{@board_id} has invalid subject #{@subject_ref.inspect}")
      end

      @expansion_depth = @board["expansion_depth"]
      unless @expansion_depth.is_a?(Integer) && @expansion_depth >= 0
        fail_projection("invalid_expansion_depth", "board #{@board_id} requires a non-negative expansion_depth")
      end

      @horizon_depth = @hierarchy_depths.fetch(@subject_ref) + @expansion_depth
      @relations_in_scope = @relations.select do |_ref, relation|
        endpoint_in_subject?(relation["from"]) || endpoint_in_subject?(relation["to"])
      end
      @crossing_endpoint_refs = Set.new
      @relations_in_scope.each_value do |relation|
        from_inside = endpoint_in_subject?(relation["from"])
        to_inside = endpoint_in_subject?(relation["to"])
        if from_inside != to_inside
          @crossing_endpoint_refs << relation["from"]
          @crossing_endpoint_refs << relation["to"]
        end
      end
    end

    def read_occurrences!
      @nodes = @board.fetch("nodes", [])
      fail_projection("invalid_nodes", "board #{@board_id} nodes must be a list") unless @nodes.is_a?(Array)

      @occurrence_ids = Set.new
      @occurrences_by_ref = Hash.new { |hash, key| hash[key] = [] }
      @nodes.each do |node|
        id = node["id"]
        ref = node["ref"]
        unless id.is_a?(String) && id.match?(/\A[a-z][a-z0-9_]*\z/)
          fail_projection("invalid_occurrence", "board #{@board_id} has invalid occurrence id #{id.inspect}")
        end
        fail_projection("duplicate_occurrence", "board #{@board_id} repeats occurrence #{id}") if @occurrence_ids.include?(id)
        fail_projection("invalid_occurrence_ref", "occurrence #{id} has invalid ref #{ref.inspect}") unless endpoint_ref?(ref)
        unless occurrence_in_scope?(ref)
          fail_projection("occurrence_out_of_scope", "occurrence #{id} (#{ref}) is outside #{@subject_ref} depth horizon")
        end

        @occurrence_ids << id
        @occurrences_by_ref[ref] << id
      end
      @visible_refs = Set.new(@occurrences_by_ref.keys)

      if @subject_ref == "architecture"
        boundary_refs.each do |ref|
          next if @visible_refs.include?(ref)

          fail_projection("missing_root_boundary", "root board #{@board_id} must show #{ref}")
        end
      end
    end

    def read_visibility_directives!
      @excluded_refs = Set.new
      @explicit_exclude_refs = Set.new
      excludes = @board.fetch("exclude", [])
      fail_projection("invalid_exclude", "board #{@board_id} exclude must be a list") unless excludes.is_a?(Array)
      excludes.each do |entry|
        ref = entry.is_a?(Hash) ? entry["ref"] : nil
        reason = entry.is_a?(Hash) ? entry["reason"] : nil
        fail_projection("invalid_exclude", "board #{@board_id} exclusion needs a canonical endpoint ref") unless endpoint_ref?(ref)
        unless reason.is_a?(String) && !reason.strip.empty?
          fail_projection("missing_exclusion_reason", "exclusion #{ref} requires a reason")
        end
        if boundary_refs.include?(ref) && @subject_ref == "architecture"
          fail_projection("excluded_root_boundary", "root boundary #{ref} cannot be excluded")
        end

        @explicit_exclude_refs << ref
        expand_exclusion(ref).each { |excluded_ref| @excluded_refs << excluded_ref }
      end

      @elided_refs = Set.new
      elisions = @board.fetch("elide", [])
      fail_projection("invalid_elide", "board #{@board_id} elide must be a list") unless elisions.is_a?(Array)
      elisions.each do |entry|
        ref = entry.is_a?(Hash) ? entry["ref"] : entry
        fail_projection("invalid_elide", "board #{@board_id} elision has invalid ref #{ref.inspect}") unless endpoint_ref?(ref)
        if boundary_refs.include?(ref)
          fail_projection("elided_boundary", "boundary source or sink #{ref} cannot be elided")
        end
        @elided_refs << ref
      end

      visible_elided = @visible_refs & @elided_refs
      visible_excluded = @visible_refs & @excluded_refs
      elided_excluded = @elided_refs & @excluded_refs
      fail_projection("visibility_conflict", "visible and elided: #{visible_elided.to_a.sort.join(', ')}") unless visible_elided.empty?
      fail_projection("visibility_conflict", "visible and excluded: #{visible_excluded.to_a.sort.join(', ')}") unless visible_excluded.empty?
      fail_projection("visibility_conflict", "elided and excluded: #{elided_excluded.to_a.sort.join(', ')}") unless elided_excluded.empty?
    end

    def classify_frontier!
      @visible_refs.each { |ref| @classifications[ref] = "visible" }
      @elided_refs.each { |ref| @classifications[ref] = "elided" }
      @excluded_refs.each { |ref| @classifications[ref] = "excluded" }

      participating_refs = @relations_in_scope.values
                                             .reject do |relation|
                                               @excluded_refs.include?(relation["from"]) ||
                                                 @excluded_refs.include?(relation["to"])
                                             end
                                             .flat_map { |relation| [relation["from"], relation["to"]] }
                                             .uniq
      participating_refs.each do |ref|
        next if @classifications.key?(ref)

        representative = aggregate_representative(ref)
        if representative
          @classifications[ref] = "collapsed:#{representative}"
        elsif accounting_required?(ref)
          fail_projection("unclassified_object", "#{ref} participates in board #{@board_id} but is not visible, collapsed, elided, or excluded")
        else
          @classifications[ref] = "depth_hidden"
        end
      end
    end

    def map_relations_to_frontier
      edges = []
      @relations_in_scope.each do |relation_ref, relation|
        from = relation["from"]
        to = relation["to"]
        if @excluded_refs.include?(from) || @excluded_refs.include?(to)
          @relation_status[relation_ref] = "excluded"
          next
        end

        from_rep = frontier_representative(from)
        to_rep = frontier_representative(to)
        if from_rep.nil? && to_rep.nil?
          @relation_status[relation_ref] = "depth_hidden"
          next
        end
        if from_rep.nil? || to_rep.nil?
          hidden = from_rep.nil? ? from : to
          fail_projection("unmapped_boundary", "depth-hidden #{hidden} affects the projection frontier through #{relation_ref}")
        end
        if from_rep == to_rep
          @relation_status[relation_ref] = "collapsed_internal"
          next
        end

        projection = from_rep == from && to_rep == to ? "direct" : "boundary"
        edges << {
          "from_ref" => from_rep,
          "to_ref" => to_rep,
          "projection" => projection,
          "kind" => relation["kind"],
          "relation_path" => [relation_ref],
          "hidden_refs" => [],
          "carries" => relation.fetch("carries", []).dup
        }
        @relation_status[relation_ref] = projection
      end
      edges.sort_by { |edge| semantic_edge_sort_key(edge) }
    end

    def contract_elisions(edges)
      return edges if @elided_refs.empty?

      incoming = Hash.new { |hash, key| hash[key] = [] }
      outgoing = Hash.new { |hash, key| hash[key] = [] }
      edges.each_with_index do |edge, index|
        item = edge.merge("_index" => index)
        outgoing[edge["from_ref"]] << item
        incoming[edge["to_ref"]] << item
      end

      @elided_refs.each do |ref|
        if incoming[ref].empty? || outgoing[ref].empty?
          fail_projection("elided_source_or_sink", "elided #{ref} must have incoming and outgoing projected flow")
        end
      end
      validate_elision_components!(incoming, outgoing)

      result = edges.reject { |edge| @elided_refs.include?(edge["from_ref"]) || @elided_refs.include?(edge["to_ref"]) }
      traversed = Set.new
      edges.each_with_index do |edge, index|
        next if @elided_refs.include?(edge["from_ref"])
        next unless @elided_refs.include?(edge["to_ref"])

        walk_elided_path(
          edge.merge("_index" => index), outgoing,
          path_edges: [], hidden_refs: [], visited_elided: Set.new,
          traversed: traversed, result: result
        )
      end

      elision_edge_indexes = edges.each_index.select do |index|
        edge = edges.fetch(index)
        @elided_refs.include?(edge["from_ref"]) || @elided_refs.include?(edge["to_ref"])
      end
      unless Set.new(elision_edge_indexes).subset?(traversed)
        fail_projection("uncontractable_elision", "an elided path in board #{@board_id} has no visible start and end")
      end

      result.sort_by { |edge| semantic_edge_sort_key(edge) }
    end

    def validate_elision_components!(incoming, outgoing)
      unseen = @elided_refs.dup
      until unseen.empty?
        seed = unseen.first
        component = Set.new([seed])
        queue = [seed]
        until queue.empty?
          ref = queue.shift
          neighbors = (incoming[ref] + outgoing[ref]).flat_map { |edge| [edge["from_ref"], edge["to_ref"]] }
          neighbors.select { |neighbor| @elided_refs.include?(neighbor) }.each do |neighbor|
            next if component.include?(neighbor)

            component << neighbor
            queue << neighbor
          end
        end
        unseen.subtract(component)

        incoming_boundaries = component.flat_map { |ref| incoming[ref] }
                                       .reject { |edge| component.include?(edge["from_ref"]) }
                                       .map { |edge| edge["from_ref"] }.uniq
        outgoing_boundaries = component.flat_map { |ref| outgoing[ref] }
                                       .reject { |edge| component.include?(edge["to_ref"]) }
                                       .map { |edge| edge["to_ref"] }.uniq
        if incoming_boundaries.length > 1 && outgoing_boundaries.length > 1
          fail_projection(
            "ambiguous_elision",
            "elided component #{component.to_a.sort.join(', ')} has multiple incoming and outgoing boundaries"
          )
        end
      end
    end

    def walk_elided_path(edge, outgoing, path_edges:, hidden_refs:, visited_elided:, traversed:, result:)
      path_edges = path_edges + [edge]
      traversed << edge.fetch("_index")
      current = edge["to_ref"]

      unless @elided_refs.include?(current)
        kinds = path_edges.map { |path_edge| path_edge["kind"] }.uniq
        if kinds.length != 1
          fail_projection("mixed_flow_kinds", "contracted path mixes flow kinds #{kinds.join(', ')}")
        end
        relation_path = path_edges.flat_map { |path_edge| path_edge["relation_path"] }
        result << {
          "from_ref" => path_edges.first["from_ref"],
          "to_ref" => current,
          "projection" => "contracted",
          "kind" => kinds.first,
          "relation_path" => relation_path,
          "hidden_refs" => hidden_refs,
          "carries" => ordered_unique(path_edges.flat_map { |path_edge| path_edge["carries"] })
        }
        return
      end

      if visited_elided.include?(current)
        fail_projection("elision_cycle", "elided path cycles at #{current}")
      end
      visited_elided = visited_elided.dup.add(current)
      hidden_refs = hidden_refs + [current]
      outgoing.fetch(current, []).each do |next_edge|
        walk_elided_path(
          next_edge, outgoing,
          path_edges: path_edges, hidden_refs: hidden_refs,
          visited_elided: visited_elided, traversed: traversed, result: result
        )
      end
    end

    def bind_occurrences(semantic_edges)
      bindings = @board.fetch("occurrence_bindings", [])
      unless bindings.is_a?(Array)
        fail_projection("invalid_occurrence_bindings", "board #{@board_id} occurrence_bindings must be a list")
      end
      used_bindings = Set.new

      projected = semantic_edges.map do |edge|
        matching = bindings.each_index.select { |index| semantic_match?(bindings.fetch(index)["match"], edge) }
        if matching.length > 1
          fail_projection("ambiguous_occurrence_binding", "multiple occurrence bindings match #{edge['relation_path'].join(' -> ')}")
        end
        binding = matching.empty? ? nil : bindings.fetch(matching.first)
        used_bindings << matching.first if binding

        from = bind_endpoint(edge["from_ref"], "from_occurrence", edge, binding)
        to = bind_endpoint(edge["to_ref"], "to_occurrence", edge, binding)
        relation_path = edge.fetch("relation_path")
        id_key = [@board_id, from, to, edge["kind"], *relation_path].join("\0")
        {
          "id" => "projection_#{Digest::SHA256.hexdigest(id_key)[0, 12]}",
          "from" => from,
          "to" => to,
          "projection" => edge["projection"],
          "origin" => "canonical",
          "kind" => edge["kind"],
          "relation_path" => relation_path.dup,
          "provenance_hops" => relation_path.map { |ref| { "relation_ref" => ref } },
          "hidden_refs" => edge.fetch("hidden_refs").dup,
          "carries" => edge.fetch("carries").dup,
          "presentation" => {}
        }
      end

      unused = (0...bindings.length).to_a - used_bindings.to_a
      unless unused.empty?
        fail_projection("unmatched_occurrence_binding", "occurrence binding #{unused.first} matches no generated edge")
      end
      projected
    end

    def bind_endpoint(ref, field, edge, binding)
      occurrence_ids = @occurrences_by_ref.fetch(ref, [])
      if binding
        occurrence = binding[field]
        unless occurrence_ids.include?(occurrence)
          fail_projection("invalid_occurrence_binding", "#{field} #{occurrence.inspect} does not represent #{ref}")
        end
        return occurrence
      end
      return occurrence_ids.first if occurrence_ids.length == 1

      message = if occurrence_ids.empty?
                  "projected endpoint #{ref} has no visible occurrence"
                else
                  "projected endpoint #{ref} has repeated occurrences; bind #{edge['relation_path'].join(' -> ')}"
                end
      fail_projection("ambiguous_occurrence", message)
    end

    def apply_edge_overrides!(edges)
      overrides = @board.fetch("edge_overrides", [])
      fail_projection("invalid_edge_overrides", "board #{@board_id} edge_overrides must be a list") unless overrides.is_a?(Array)

      overrides.each_with_index do |override, index|
        matches = edges.select { |edge| semantic_match?(override["match"], edge) }
        if matches.empty?
          fail_projection("unmatched_edge_override", "edge override #{index} matches no generated edge")
        end
        if matches.length > 1
          fail_projection("ambiguous_edge_override", "edge override #{index} matches multiple generated edges")
        end

        presentation = override.reject { |key, _value| key == "match" }
        semantic_fields = presentation.keys.reject { |key| PRESENTATION_FIELDS.include?(key) }
        unless semantic_fields.empty?
          fail_projection("semantic_edge_override", "edge override cannot set #{semantic_fields.sort.join(', ')}")
        end
        matches.first["presentation"].merge!(presentation)
      end
    end

    def validate_root_reachability!(projected_edges)
      inputs = @value_sites.select { |_ref, site| site["boundary"] == "input" }.keys
      outputs = @value_sites.select { |_ref, site| site["boundary"] == "output" }.keys
      canonical_adjacency = Hash.new { |hash, key| hash[key] = [] }
      @relations.each_value { |relation| canonical_adjacency[relation["from"]] << relation["to"] }
      projected_adjacency = Hash.new { |hash, key| hash[key] = [] }
      projected_edges.each { |edge| projected_adjacency[edge["from"]] << edge["to"] }

      inputs.each do |input_ref|
        outputs.each do |output_ref|
          next unless reachable?(canonical_adjacency, input_ref, output_ref)

          input_occurrences = @occurrences_by_ref.fetch(input_ref)
          output_occurrences = @occurrences_by_ref.fetch(output_ref)
          preserved = input_occurrences.any? do |input_occurrence|
            output_occurrences.any? { |output_occurrence| reachable?(projected_adjacency, input_occurrence, output_occurrence) }
          end
          unless preserved
            fail_projection("root_reachability", "root projection disconnects #{input_ref} from #{output_ref}")
          end
        end
      end
    end

    def reachable?(adjacency, start, goal)
      queue = [start]
      visited = Set.new
      until queue.empty?
        current = queue.shift
        return true if current == goal
        next if visited.include?(current)

        visited << current
        adjacency.fetch(current, []).each { |neighbor| queue << neighbor }
      end
      false
    end

    def semantic_match?(match, edge)
      return false unless match.is_a?(Hash)
      relation_ref = match["relation_ref"]
      relation_path = match["relation_path"]
      return edge["relation_path"] == [relation_ref] if relation_ref && !relation_path
      return edge["relation_path"] == relation_path if relation_path.is_a?(Array) && !relation_ref

      false
    end

    def occurrence_in_scope?(ref)
      return true if @crossing_endpoint_refs.include?(ref)
      return false unless endpoint_in_subject?(ref)

      object_depth(ref) <= @horizon_depth
    end

    def accounting_required?(ref)
      @crossing_endpoint_refs.include?(ref) || (endpoint_in_subject?(ref) && object_depth(ref) <= @horizon_depth)
    end

    def endpoint_in_subject?(ref)
      scope = object_scope(ref)
      return true if @subject_ref == "architecture"
      return false if scope == "architecture"

      module_descendant_or_self?(scope, @subject_ref)
    end

    def object_scope(ref)
      return ref if @modules.key?(ref)
      return @value_sites.fetch(ref)["scope_ref"] if @value_sites.key?(ref)

      nil
    end

    def object_depth(ref)
      scope = object_scope(ref)
      @hierarchy_depths.fetch(scope)
    end

    def aggregate_representative(ref)
      scope = object_scope(ref)
      return nil if scope == "architecture"

      module_ancestor_chain(scope).find do |ancestor|
        @visible_refs.include?(ancestor) || @elided_refs.include?(ancestor)
      end
    end

    def frontier_representative(ref)
      return nil if @excluded_refs.include?(ref)
      return ref if @visible_refs.include?(ref) || @elided_refs.include?(ref)

      aggregate_representative(ref)
    end

    def module_ancestor_chain(ref)
      return [] unless @modules.key?(ref)

      chain = []
      current = ref
      while current != "architecture"
        chain << current
        current = @module_parents.fetch(current)
      end
      chain
    end

    def module_descendant_or_self?(candidate, ancestor)
      return false unless @modules.key?(candidate)

      module_ancestor_chain(candidate).include?(ancestor)
    end

    def expand_exclusion(ref)
      return [ref] if @value_sites.key?(ref)

      descendants = @modules.keys.select { |candidate| module_descendant_or_self?(candidate, ref) }
      scoped_values = @value_sites.keys.select do |value_ref|
        scope = @value_sites.fetch(value_ref)["scope_ref"]
        descendants.include?(scope)
      end
      descendants + scoped_values
    end

    def endpoint_ref?(ref)
      @modules.key?(ref) || @value_sites.key?(ref)
    end

    def boundary_refs
      @boundary_refs ||= Set.new(@value_sites.select { |_ref, site| site["boundary"] }.keys)
    end

    def ordered_unique(values)
      seen = Set.new
      values.each_with_object([]) do |value, ordered|
        next if seen.include?(value)

        seen << value
        ordered << value
      end
    end

    def semantic_edge_sort_key(edge)
      [edge["from_ref"], edge["to_ref"], edge["kind"], edge["relation_path"].join("\0")]
    end

    def edge_sort_key(edge)
      [edge["from"], edge["to"], edge["kind"], edge["relation_path"].join("\0")]
    end

    def deep_stringify(value)
      case value
      when Hash
        value.each_with_object({}) { |(key, nested), result| result[key.to_s] = deep_stringify(nested) }
      when Array
        value.map { |nested| deep_stringify(nested) }
      else
        value
      end
    end

    def fail_projection(code, message)
      raise ProjectionError.new(code, message)
    end
  end
end
