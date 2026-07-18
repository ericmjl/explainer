# frozen_string_literal: true

require "set"
require_relative "architecture_projection"
require_relative "architecture_semantic_layout"

# Build one conservative visualization-v0.4 board from canonical architecture
# facts. The scaffold is deliberately maximal at the requested hierarchy
# horizon: it never guesses that an endpoint is safe to elide or exclude.
module ArchitectureViewScaffold
  ID_PATTERN = /\A[a-z][a-z0-9_]*\z/
  DENSE_NODE_THRESHOLD = 12
  DENSE_EDGE_THRESHOLD = 20

  class ScaffoldError < StandardError
    attr_reader :code

    def initialize(code, message)
      @code = code
      super(message)
    end
  end

  Result = Struct.new(:board, :parent_board_id, :diagnostics, keyword_init: true)

  module_function

  def compile(architecture:, view:, subject_ref:, id:, title:, summary:, parent: nil,
              expansion_depth: 1, node_refs: nil, columns: nil)
    Compiler.new(
      architecture: architecture,
      view: view,
      subject_ref: subject_ref,
      id: id,
      title: title,
      summary: summary,
      parent: parent,
      expansion_depth: expansion_depth,
      node_refs: node_refs,
      columns: columns
    ).compile
  end

  class Compiler
    def initialize(architecture:, view:, subject_ref:, id:, title:, summary:, parent:,
                   expansion_depth:, node_refs:, columns:)
      @architecture = deep_stringify(architecture)
      @view = deep_stringify(view || {})
      @subject_ref = subject_ref.to_s
      @board_id = id.to_s
      @title = title.to_s
      @summary = summary.to_s
      @requested_parent = parent&.to_s
      @expansion_depth = expansion_depth
      @requested_node_refs = node_refs
      @requested_columns = columns

      validate_arguments!
      index_architecture!
      validate_subject!
      @projector = ArchitectureProjection::Projector.new(@architecture)
    end

    def compile
      parent_board_id = resolve_parent_board_id
      refs = selected_refs
      fail_scaffold("empty_board", "board #{@board_id} has no selected canonical refs") if refs.empty?

      nodes = refs.map { |ref| scaffold_node(ref) }
      draft = {
        "id" => @board_id,
        "title" => @title,
        "summary" => @summary,
        "subject_ref" => @subject_ref,
        "expansion_depth" => @expansion_depth,
        "grid" => {
          "columns" => 1,
          "rows" => nodes.length,
          "column_sizing" => "content"
        },
        "nodes" => nodes.each_with_index.map do |node, index|
          node.merge("col" => 1, "row" => index + 1)
        end
      }
      draft["parent"] = parent_board_id if parent_board_id

      projection = @projector.project(draft)
      positions, grid = layout(nodes, projection.fetch("edges"))
      board_nodes = nodes.map do |node|
        positioned = node.merge(positions.fetch(node.fetch("id")))
        child_board_id = child_board_id_for(node.fetch("ref"))
        positioned["board_ref"] = child_board_id if child_board_id
        positioned
      end
      draft["grid"] = grid
      draft["nodes"] = board_nodes.sort_by do |node|
        [node.fetch("col"), node.fetch("row"), node.fetch("id")]
      end

      # Layout and navigation fields are presentation-only, but projecting the
      # final board makes that boundary executable rather than assumed.
      @projector.project(draft)

      Result.new(
        board: draft,
        parent_board_id: parent_board_id,
        diagnostics: density_diagnostics(nodes.length, projection.fetch("edges").length)
      )
    end

    private

    def validate_arguments!
      fail_scaffold("invalid_board_id", "invalid board id #{@board_id.inspect}") unless ID_PATTERN.match?(@board_id)
      fail_scaffold("missing_title", "board #{@board_id} requires a title") if @title.strip.empty?
      fail_scaffold("missing_summary", "board #{@board_id} requires a summary") if @summary.strip.empty?
      unless @expansion_depth.is_a?(Integer) && @expansion_depth >= 0
        fail_scaffold("invalid_expansion_depth", "expansion_depth must be a non-negative integer")
      end
      if @requested_columns && (!@requested_columns.is_a?(Integer) || @requested_columns < 1)
        fail_scaffold("invalid_columns", "columns must be a positive integer")
      end
      unless @requested_node_refs.nil? || @requested_node_refs.is_a?(Array)
        fail_scaffold("invalid_node_refs", "node_refs must be a list of canonical refs")
      end

      @boards = Array(@view["boards"])
      if @boards.any? { |board| board["id"] == @board_id }
        fail_scaffold("duplicate_board", "view already contains board #{@board_id}")
      end
    end

    def index_architecture!
      @modules = Array(@architecture["modules"])
      @value_sites = Array(@architecture["value_sites"])
      @relations = Array(@architecture["relations"])
      @modules_by_ref = @modules.to_h { |mod| ["modules.#{mod.fetch('id')}", mod] }
      @sites_by_ref = @value_sites.to_h { |site| ["value_sites.#{site.fetch('id')}", site] }
      @module_parents = @modules_by_ref.transform_values { |mod| mod.fetch("parent_ref") }

      return if @subject_ref == "architecture"

      subject = @modules_by_ref[@subject_ref]
      fail_scaffold("unknown_subject", "unknown board subject #{@subject_ref}") unless subject
      status = subject.dig("decomposition", "status")
      if %w[leaf opaque].include?(status)
        fail_scaffold(
          "non_expandable_subject",
          "#{@subject_ref} is #{status} and cannot own a drill-down board"
        )
      end
    end

    def validate_subject!
      return if @subject_ref == "architecture" || @modules_by_ref.key?(@subject_ref)

      fail_scaffold("invalid_subject", "unknown board subject #{@subject_ref.inspect}")
    end

    def resolve_parent_board_id
      if @subject_ref == "architecture"
        if @requested_parent
          fail_scaffold("root_has_parent", "architecture board #{@board_id} cannot declare a parent")
        end
        return nil
      end

      if @requested_parent
        parent_board = @boards.find { |board| board["id"] == @requested_parent }
        unless parent_board
          fail_scaffold("unknown_parent_board", "unknown parent board #{@requested_parent}")
        end
        validate_parent_occurrence!(parent_board)
        return @requested_parent
      end

      candidates = @boards.select do |board|
        Array(board["nodes"]).any? { |node| node["ref"] == @subject_ref }
      end
      if candidates.empty?
        fail_scaffold(
          "missing_parent_board",
          "no existing board contains #{@subject_ref}; provide parent explicitly after adding its occurrence"
        )
      end
      if candidates.length > 1
        ids = candidates.filter_map { |board| board["id"] }.sort
        fail_scaffold(
          "ambiguous_parent_board",
          "#{@subject_ref} occurs on multiple boards (#{ids.join(', ')}); provide parent"
        )
      end

      validate_parent_occurrence!(candidates.first)
      candidates.first.fetch("id")
    end

    def validate_parent_occurrence!(parent_board)
      occurrences = Array(parent_board["nodes"]).select { |node| node["ref"] == @subject_ref }
      unless occurrences.length == 1
        fail_scaffold(
          "ambiguous_parent_occurrence",
          "parent board #{parent_board['id']} must contain exactly one #{@subject_ref} occurrence; found #{occurrences.length}"
        )
      end
      occurrence = occurrences.first
      existing_target = occurrence["board_ref"]
      return unless existing_target && existing_target != @board_id

      fail_scaffold(
        "subject_already_drillable",
        "#{@subject_ref} on #{parent_board['id']} already opens #{existing_target}"
      )
    end

    def selected_refs
      if @requested_node_refs
        refs = @requested_node_refs.map(&:to_s)
        fail_scaffold("duplicate_node_ref", "node_refs contains duplicates") unless refs.uniq.length == refs.length
        unknown = refs.reject { |ref| @modules_by_ref.key?(ref) || @sites_by_ref.key?(ref) }
        unless unknown.empty?
          fail_scaffold("invalid_node_ref", "unknown node refs: #{unknown.sort.join(', ')}")
        end
        return refs.sort
      end

      relations = relations_in_subject
      endpoints = relations.flat_map { |relation| [relation.fetch("from"), relation.fetch("to")] }
      refs = Set.new

      @modules_by_ref.each_key do |ref|
        relative_depth = relative_module_depth(ref)
        next unless relative_depth && relative_depth.positive? && relative_depth <= @expansion_depth

        refs << ref
      end

      @sites_by_ref.each do |ref, site|
        refs << ref if site.fetch("scope_ref") == @subject_ref && endpoints.include?(ref)
        refs << ref if @subject_ref == "architecture" && site["boundary"]
      end

      relations.each do |relation|
        from = relation.fetch("from")
        to = relation.fetch("to")
        from_inside = endpoint_in_subject?(from)
        to_inside = endpoint_in_subject?(to)
        next if from_inside == to_inside

        refs << from
        refs << to
      end

      refs << @subject_ref if @subject_ref != "architecture" && endpoints.include?(@subject_ref)
      refs.to_a.sort
    end

    def relations_in_subject
      @relations.select do |relation|
        endpoint_in_subject?(relation.fetch("from")) || endpoint_in_subject?(relation.fetch("to"))
      end
    end

    def endpoint_in_subject?(ref)
      return true if @subject_ref == "architecture"

      scope = endpoint_scope(ref)
      return false if scope == "architecture"

      module_descendant_or_self?(scope, @subject_ref)
    end

    def endpoint_scope(ref)
      return ref if @modules_by_ref.key?(ref)
      return @sites_by_ref.fetch(ref).fetch("scope_ref") if @sites_by_ref.key?(ref)

      nil
    end

    def relative_module_depth(ref)
      return nil unless @modules_by_ref.key?(ref)
      if @subject_ref == "architecture"
        return @projector.hierarchy_depths.fetch(ref)
      end
      return nil unless module_descendant_or_self?(ref, @subject_ref)

      @projector.hierarchy_depths.fetch(ref) - @projector.hierarchy_depths.fetch(@subject_ref)
    end

    def module_descendant_or_self?(candidate, ancestor)
      current = candidate
      while current != "architecture"
        return true if current == ancestor

        current = @module_parents.fetch(current)
      end
      false
    end

    def scaffold_node(ref)
      node = {
        "id" => occurrence_id(ref),
        "ref" => ref
      }
      if ref.start_with?("modules.")
        node.merge!(
          "prominence" => "primary",
          "treatment" => "block"
        )
      else
        site = @sites_by_ref.fetch(ref)
        if site["boundary"]
          node.merge!(
            "prominence" => "context",
            "treatment" => "chip",
            "density" => "micro"
          )
        else
          node.merge!(
            "prominence" => "secondary",
            "treatment" => "compact",
            "density" => "compact"
          )
        end
      end
      node
    end

    def occurrence_id(ref)
      namespace, id = ref.split(".", 2)
      prefix = namespace == "modules" ? "module" : "value"
      "#{prefix}_#{id}"
    end

    def child_board_id_for(ref)
      return nil unless ref.start_with?("modules.")

      matches = @boards.select do |board|
        board["subject_ref"] == ref && board["parent"] == @board_id
      end
      if matches.length > 1
        fail_scaffold(
          "ambiguous_child_board",
          "multiple child boards of #{@board_id} expand #{ref}"
        )
      end
      matches.first&.fetch("id")
    end

    def layout(nodes, edges)
      result = ArchitectureSemanticLayout.compile(
        nodes: nodes,
        edges: edges,
        architecture: @architecture,
        columns: @requested_columns,
      )
      [result.positions, result.grid]
    end

    def density_diagnostics(node_count, edge_count)
      diagnostics = []
      if node_count > DENSE_NODE_THRESHOLD
        diagnostics << {
          "code" => "dense_board",
          "severity" => "warning",
          "board_id" => @board_id,
          "node_count" => node_count,
          "threshold" => DENSE_NODE_THRESHOLD,
          "message" => "Board #{@board_id} has #{node_count} visible nodes; review it editorially without implicit omission."
        }
      end
      if edge_count > DENSE_EDGE_THRESHOLD
        diagnostics << {
          "code" => "dense_edge_set",
          "severity" => "warning",
          "board_id" => @board_id,
          "edge_count" => edge_count,
          "threshold" => DENSE_EDGE_THRESHOLD,
          "message" => "Board #{@board_id} has #{edge_count} projected edges; consider an explicit drilldown or curated contraction."
        }
      end
      diagnostics.sort_by { |diagnostic| diagnostic.fetch("code") }
    end

    def deep_stringify(value)
      case value
      when Hash
        value.each_with_object({}) do |(key, nested), result|
          result[key.to_s] = deep_stringify(nested)
        end
      when Array
        value.map { |nested| deep_stringify(nested) }
      else
        value
      end
    end

    def fail_scaffold(code, message)
      raise ScaffoldError.new(code, message)
    end
  end
end
