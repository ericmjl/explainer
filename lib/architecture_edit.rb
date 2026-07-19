# frozen_string_literal: true

require "digest"
require "fileutils"
require "json"
require "open3"
require "psych"
require "rbconfig"
require "set"
require "tempfile"
require "tmpdir"

require_relative "architecture_coverage"
require_relative "architecture_edit_contract"
require_relative "architecture_ownership"
require_relative "architecture_projection"
require_relative "architecture_semantic_layout"
require_relative "architecture_view_lanes"
require_relative "architecture_view_scaffold"
require_relative "source_contract"
require_relative "strict_yaml"
require_relative "yaml_source_patch"

# Deterministic compiler for architecture-edit-v0.1 and v0.2 plans. It turns
# semantic operations into validated architecture/view candidates and
# source-local YAML patches. The same compiler backs human-authored plans, a
# future wizard, and any LLM adapter; none of those callers write YAML directly.
module ArchitectureEdit
  ROOT = File.expand_path("..", __dir__)
  REGISTRY_PATH = "architectures/index.yaml"
  STAGED_SOURCE_DIRECTORIES = %w[
    architectures
    views
    pseudocode
    standard_blocks
    comparisons
    references
    schemas
    lib
    scripts
  ].freeze
  COLLECTIONS = {
    "modules" => "modules",
    "representations" => "representations",
    "value_sites" => "value_sites",
    "relations" => "relations",
  }.freeze
  ADD_OPERATIONS = {
    "add_module" => ["modules", "module"],
    "add_representation" => ["representations", "representation"],
    "add_value_site" => ["value_sites", "value_site"],
    "add_relation" => ["relations", "relation"],
  }.freeze

  class Error < StandardError
    attr_reader :code, :details

    def initialize(code, message, details: nil)
      @code = code
      @details = details
      super(message)
    end
  end

  class Result
    attr_reader :plan, :source_set, :architecture, :view, :architecture_path,
      :view_path, :source_contents, :changes, :diagnostics, :base_digests,
      :generated_contents, :expected_file_digests, :validation_output
    attr_accessor :status

    def initialize(plan:, source_set:, architecture:, view:, architecture_path:, view_path:,
      source_contents:, changes:, diagnostics:, base_digests:)
      @plan = plan
      @source_set = source_set
      @architecture = architecture
      @view = view
      @architecture_path = architecture_path
      @view_path = view_path
      @source_contents = source_contents
      @changes = changes
      @diagnostics = diagnostics
      @base_digests = base_digests
      @generated_contents = {}
      @expected_file_digests = {}
      @validation_output = ""
      @manifest_built = false
      @status = "validated"
    end

    def attach_generated!(contents:, expected_file_digests:, validation_output:)
      @generated_contents = contents
      @expected_file_digests = expected_file_digests
      @validation_output = validation_output
      @manifest_built = true
      self
    end

    def manifest_built? = @manifest_built

    def changed_contents
      @source_contents.merge(@generated_contents)
    end

    def files
      changed_contents.keys.sort
    end

    def to_h
      {
        "status" => @status,
        "plan_id" => @plan.fetch("id"),
        "intent" => @plan.fetch("intent"),
        "source_set" => @source_set.fetch("id"),
        "base_digests" => @base_digests,
        "changes" => @changes,
        "diagnostics" => @diagnostics,
        "files" => files,
      }
    end

    def to_text
      lines = [
        "Architecture edit #{@plan.fetch('id')}",
        "Target: #{@source_set.fetch('id')}",
        "Intent: #{@plan.fetch('intent')}",
        "",
      ]
      @changes.each do |change|
        marker = case change.fetch("action")
        when "add" then "+"
        when "remove" then "-"
        else "~"
        end
        if change["field"] == "layout"
          lines.concat(render_layout_change(change, marker))
          next
        end
        line = "#{marker} #{change.fetch('entity_ref')}"
        if change["field"]
          line += ".#{change.fetch('field')}: #{short_value(change['before'])} -> #{short_value(change['after'])}"
        elsif change["after"].is_a?(Hash)
          facts = %w[kind parent_ref parent subject_ref].filter_map do |field|
            "#{field}=#{change['after'][field]}" if change["after"].key?(field)
          end
          if change["after"].key?("nodes") && change["after"].key?("grid")
            facts << "nodes=#{Array(change['after']['nodes']).length}"
            grid = change["after"]["grid"]
            facts << "grid=#{grid['columns']}x#{grid['rows']}" if grid
          end
          line += " (#{facts.join(', ')})" unless facts.empty?
        end
        lines << line
      end
      unless @diagnostics.empty?
        lines << ""
        @diagnostics.each do |diagnostic|
          rendered = diagnostic.is_a?(Hash) ? JSON.generate(diagnostic) : diagnostic
          lines << "! #{rendered}"
        end
      end
      lines.concat(["", "Validation: #{@status}", "Files:"])
      files.each { |path| lines << "  #{path}" }
      lines.join("\n")
    end

    private

    def render_layout_change(change, marker)
      before = change.fetch("before")
      after = change.fetch("after")
      entity_ref = change.fetch("entity_ref")
      lines = []
      if before["grid"] != after["grid"]
        lines << "#{marker} #{entity_ref}.grid: #{JSON.generate(before['grid'])} -> #{JSON.generate(after['grid'])}"
      end

      before_positions = before.fetch("positions")
      after_positions = after.fetch("positions")
      (before_positions.keys | after_positions.keys).sort.each do |node_id|
        old_position = before_positions[node_id]
        new_position = after_positions[node_id]
        next if old_position == new_position

        lines << "#{marker} #{entity_ref}.nodes.#{node_id}.position: " \
          "#{format_position(old_position)} -> #{format_position(new_position)}"
      end
      lines
    end

    def format_position(position)
      return "null" unless position

      "(#{position.fetch('col')},#{position.fetch('row')})"
    end

    def short_value(value)
      rendered = JSON.generate(value)
      rendered.length > 120 ? "#{rendered[0, 117]}..." : rendered
    end
  end

  class Compiler
    def initialize(root: ROOT)
      @root = File.expand_path(root)
    end

    def load_plan(path)
      StrictYaml.load_file(path)
    rescue StrictYaml::Error, Errno::ENOENT => e
      raise Error.new("invalid_plan_yaml", e.message)
    end

    def prepare_plan(plan)
      result = compile(plan, require_digests: false, build_manifests: true)
      bind_base_digests(plan, result.base_digests)
    end

    # Compile and build once, then bind the exact source digests observed by
    # that compilation into the plan returned to the caller. Review surfaces
    # use this instead of prepare_plan followed by preview, which would stage
    # and build the same candidate twice.
    def prepare_and_preview(plan)
      result = compile(plan, require_digests: false, build_manifests: true)
      [bind_base_digests(plan, result.base_digests), result]
    end

    def compile(plan, require_digests: false, build_manifests: true)
      ArchitectureEditContract.validate!(plan)
      source_set = resolve_source_set(plan.dig("target", "source_set"))
      architecture_path = source_set.fetch("architecture")
      view_path = source_set.fetch("view")
      architecture_source = read_relative(architecture_path)
      view_source = read_relative(view_path)
      base_digests = {
        "architecture_sha256" => Digest::SHA256.hexdigest(architecture_source),
        "view_sha256" => Digest::SHA256.hexdigest(view_source),
      }
      verify_target_digests!(plan.fetch("target"), base_digests, require_digests: require_digests)

      architecture = deep_copy(load_yaml_text(architecture_source, architecture_path))
      view = deep_copy(load_yaml_text(view_source, view_path))
      architecture_patch = YamlSourcePatch::Document.new(architecture_source, path: architecture_path)
      view_patch = YamlSourcePatch::Document.new(view_source, path: view_path)
      changes = []
      diagnostics = []
      added_refs = Set.new
      updated_fields = Set.new
      updated_view_fields = Set.new
      updated_edge_overrides = Set.new
      laid_out_boards = Set.new
      layout_board_ids = Set.new
      original_board_ids = Set.new(Array(view["boards"]).map { |board| board.fetch("id") })
      added_boards = []
      rewritten_board_ids = Set.new
      pending_board_ref_updates = []

      plan.fetch("operations").each_with_index do |operation, index|
        if ADD_OPERATIONS.key?(operation.fetch("op"))
          apply_add!(architecture, architecture_patch, operation, index, changes, added_refs)
        elsif operation.fetch("op") == "update_entity"
          apply_update!(architecture, architecture_patch, operation, index, changes, added_refs, updated_fields)
        elsif operation.fetch("op") == "update_view_entity"
          apply_view_update!(
            view,
            operation,
            index,
            changes,
            updated_view_fields,
            rewritten_board_ids,
          )
        elsif operation.fetch("op") == "set_edge_override"
          apply_edge_override!(
            view,
            operation,
            index,
            changes,
            updated_edge_overrides,
            rewritten_board_ids,
          )
        elsif operation.fetch("op") == "set_board_visibility"
          apply_board_visibility!(view, operation, index, changes, rewritten_board_ids)
        elsif operation.fetch("op") == "layout_board"
          apply_layout_board!(
            architecture,
            view,
            operation,
            index,
            changes,
            diagnostics,
            laid_out_boards,
            layout_board_ids,
          )
        elsif operation.fetch("op") == "scaffold_board"
          apply_scaffold!(
            architecture,
            view,
            operation,
            index,
            changes,
            diagnostics,
            original_board_ids,
            added_boards,
            pending_board_ref_updates,
          )
        else
          raise Error.new("unsupported_operation", "unsupported operation #{operation.fetch('op').inspect}")
        end
      end
      pending_board_ref_updates.each do |update|
        next if rewritten_board_ids.include?(update.fetch(:parent_board_id))

        view_patch.set_board_ref(**update)
      end
      Array(view.fetch("boards")).each do |board|
        board_id = board.fetch("id")
        next unless original_board_ids.include?(board_id) && rewritten_board_ids.include?(board_id)

        view_patch.replace_top_level_item("boards", board_id, board)
      end
      Array(view.fetch("boards")).each do |board|
        board_id = board.fetch("id")
        next unless original_board_ids.include?(board_id) && layout_board_ids.include?(board_id)
        next if rewritten_board_ids.include?(board_id)

        view_patch.update_board_layout(
          board_id: board_id,
          grid: board.fetch("grid"),
          positions: board.fetch("nodes").to_h do |node|
            [node.fetch("id"), { "col" => node.fetch("col"), "row" => node.fetch("row") }]
          end,
        )
      end
      added_boards.each { |board| view_patch.append_top_level_item("boards", board) }

      validate_candidates!(architecture, view)
      patched_architecture = architecture_patch.render
      patched_view = view_patch.render
      assert_logical_match!(patched_architecture, architecture, architecture_path)
      assert_logical_match!(patched_view, view, view_path)

      source_contents = {}
      source_contents[architecture_path] = patched_architecture if patched_architecture != architecture_source
      source_contents[view_path] = patched_view if patched_view != view_source
      if source_contents.empty?
        raise Error.new("empty_edit", "the plan does not change either canonical source")
      end

      result = Result.new(
        plan: deep_copy(plan),
        source_set: source_set,
        architecture: architecture,
        view: view,
        architecture_path: architecture_path,
        view_path: view_path,
        source_contents: source_contents,
        changes: changes,
        diagnostics: diagnostics,
        base_digests: base_digests,
      )
      stage_and_build!(result) if build_manifests
      result
    rescue ArchitectureEditContract::ValidationError => e
      raise Error.new("invalid_edit_plan", e.message, details: e.diagnostics)
    rescue SourceContract::ValidationError => e
      raise Error.new("invalid_candidate", e.message, details: e.diagnostics)
    rescue ArchitectureProjection::ProjectionError, ArchitectureViewScaffold::ScaffoldError,
      ArchitectureSemanticLayout::LayoutError => e
      raise Error.new(e.code, e.message)
    rescue ArchitectureOwnership::OwnershipError, ArchitectureCoverage::CoverageError,
      YamlSourcePatch::Error => e
      raise Error.new("invalid_candidate", e.message)
    end

    def preview(plan, require_digests: false)
      compile(plan, require_digests: require_digests, build_manifests: true)
    end

    def apply(plan)
      result = compile(plan, require_digests: true, build_manifests: true)
      commit_result!(result)
    end

    # Commit the exact result produced by prepare_and_preview without
    # recompiling it. The prepared plan must still describe that result
    # byte-for-byte, and AtomicWriter rechecks every source, generated file,
    # and staged dependency digest immediately before replacing anything.
    def apply_validated(prepared_plan, result)
      unless result.is_a?(Result) && result.status == "validated" && result.manifest_built?
        raise Error.new("invalid_validated_result", "validated architecture edit result is missing or already consumed")
      end

      ArchitectureEditContract.validate!(prepared_plan)
      expected_plan = bind_base_digests(result.plan, result.base_digests)
      unless prepared_plan == expected_plan
        raise Error.new(
          "validated_plan_mismatch",
          "prepared plan does not match the exact candidate that was previewed",
        )
      end

      commit_result!(result)
    rescue ArchitectureEditContract::ValidationError => e
      raise Error.new("invalid_edit_plan", e.message, details: e.diagnostics)
    end

    private

    def commit_result!(result)
      expected = result.expected_file_digests.dup
      expected[result.architecture_path] = result.base_digests.fetch("architecture_sha256")
      expected[result.view_path] = result.base_digests.fetch("view_sha256")
      AtomicWriter.new(@root).commit!(result.changed_contents, expected)
      result.status = "applied"
      result
    end

    def bind_base_digests(plan, base_digests)
      prepared = deep_copy(plan)
      target = prepared.fetch("target")
      target["architecture_sha256"] = base_digests.fetch("architecture_sha256")
      target["view_sha256"] = base_digests.fetch("view_sha256")
      prepared
    end

    def apply_add!(architecture, patch, operation, index, changes, added_refs)
      collection, payload_key = ADD_OPERATIONS.fetch(operation.fetch("op"))
      value = deep_copy(operation.fetch(payload_key))
      ref = "#{collection}.#{value.fetch('id')}"
      if Array(architecture[collection]).any? { |item| item["id"] == value.fetch("id") }
        raise Error.new("duplicate_entity", "operation #{index + 1}: #{ref} already exists")
      end

      architecture.fetch(collection) << value
      patch.append_top_level_item(collection, value)
      added_refs << ref
      changes << change(index, "add", ref, after: value)
    end

    def apply_update!(architecture, patch, operation, index, changes, added_refs, updated_fields)
      ref = operation.fetch("ref")
      namespace, id = ref.split(".", 2)
      collection = COLLECTIONS[namespace]
      raise Error.new("unknown_entity", "operation #{index + 1}: unsupported entity ref #{ref}") unless collection
      if added_refs.include?(ref)
        raise Error.new(
          "update_after_add",
          "operation #{index + 1}: merge updates for newly added #{ref} into its add operation",
        )
      end

      entity = Array(architecture[collection]).find { |item| item["id"] == id }
      raise Error.new("unknown_entity", "operation #{index + 1}: #{ref} does not exist") unless entity

      Hash(operation["expect"]).each do |field, expected|
        actual = entity[field]
        next if entity.key?(field) && actual == expected

        raise Error.new(
          "precondition_failed",
          "operation #{index + 1}: #{ref}.#{field} expected #{expected.inspect}, found #{actual.inspect}",
        )
      end

      changed = {}
      operation.fetch("set").each do |field, after|
        key = [ref, field]
        if updated_fields.include?(key)
          raise Error.new("repeated_update", "operation #{index + 1}: #{ref}.#{field} is updated more than once")
        end
        updated_fields << key
        before = deep_copy(entity[field])
        next if entity.key?(field) && before == after

        entity[field] = deep_copy(after)
        changed[field] = after
        changes << change(index, "update", ref, field: field, before: before, after: after)
      end
      if changed.empty?
        raise Error.new("empty_update", "operation #{index + 1}: #{ref} update has no semantic effect")
      end

      patch.update_top_level_item(collection, id, set: changed)
    end

    def apply_view_update!(view, operation, index, changes, updated_fields, rewritten_board_ids)
      ref = operation.fetch("ref")
      board_id, entity = resolve_view_entity!(view, ref, index)
      verify_preconditions!(entity, operation["expect"], ref, index, allow_absent_nil: true)

      changed = false
      operation.fetch("set").each do |field, after|
        key = [ref, field]
        if updated_fields.include?(key)
          raise Error.new("repeated_update", "operation #{index + 1}: #{ref}.#{field} is updated more than once")
        end
        updated_fields << key
        before = entity.key?(field) ? deep_copy(entity[field]) : nil
        next if entity.key?(field) && before == after

        entity[field] = deep_copy(after)
        changed = true
        changes << change(index, "update", ref, field: field, before: before, after: after)
      end
      raise Error.new("empty_update", "operation #{index + 1}: #{ref} update has no semantic effect") unless changed

      rewritten_board_ids << board_id
    end

    def apply_edge_override!(view, operation, index, changes, updated_overrides, rewritten_board_ids)
      board_id = operation.fetch("board_id")
      board = find_board!(view, board_id, index)
      match = deep_copy(operation.fetch("match"))
      match_key = edge_match_key(match)
      update_key = [board_id, match_key]
      if updated_overrides.include?(update_key)
        raise Error.new(
          "repeated_update",
          "operation #{index + 1}: edge override #{match_key} on board #{board_id} is updated more than once",
        )
      end
      updated_overrides << update_key

      overrides = Array(board["edge_overrides"])
      matches = overrides.select { |override| override["match"] == match }
      if matches.length > 1
        raise Error.new(
          "ambiguous_edge_override",
          "operation #{index + 1}: board #{board_id} has multiple overrides for #{match_key}",
        )
      end
      existing = matches.first
      entity_ref = "boards.#{board_id}.edge_overrides.#{match_key}"
      verify_preconditions!(existing, operation["expect"], entity_ref, index, allow_absent_nil: true)

      if operation["remove"]
        unless existing
          raise Error.new(
            "unknown_edge_override",
            "operation #{index + 1}: board #{board_id} has no edge override for #{match_key}",
          )
        end

        overrides.delete(existing)
        overrides.empty? ? board.delete("edge_overrides") : board["edge_overrides"] = overrides
        changes << change(index, "remove", entity_ref, before: existing)
        rewritten_board_ids << board_id
        return
      end

      set = operation.fetch("set")
      if existing
        changed = false
        set.each do |field, after|
          before = existing.key?(field) ? deep_copy(existing[field]) : nil
          next if existing.key?(field) && before == after

          existing[field] = deep_copy(after)
          changed = true
          changes << change(index, "update", entity_ref, field: field, before: before, after: after)
        end
        unless changed
          raise Error.new("empty_update", "operation #{index + 1}: #{entity_ref} update has no semantic effect")
        end
      else
        override = { "match" => match }.merge(deep_copy(set))
        overrides << override
        board["edge_overrides"] = overrides
        changes << change(index, "add", entity_ref, after: override)
      end
      rewritten_board_ids << board_id
    end

    def apply_board_visibility!(view, operation, index, changes, rewritten_board_ids)
      board_id = operation.fetch("board_id")
      board = find_board!(view, board_id, index)
      occurrence_id = operation.fetch("occurrence_id")
      ref = operation.fetch("ref")
      matches = Array(board.fetch("nodes")).select { |node| node["id"] == occurrence_id }
      unless matches.length == 1
        raise Error.new(
          "unknown_occurrence",
          "operation #{index + 1}: board #{board_id} must contain occurrence #{occurrence_id}; found #{matches.length}",
        )
      end
      occurrence = matches.first
      unless occurrence["ref"] == ref
        raise Error.new(
          "precondition_failed",
          "operation #{index + 1}: boards.#{board_id}.nodes.#{occurrence_id}.ref expected #{ref.inspect}, " \
            "found #{occurrence['ref'].inspect}",
        )
      end
      if occurrence["board_ref"]
        raise Error.new(
          "drilldown_visibility_change",
          "operation #{index + 1}: occurrence #{occurrence_id} opens #{occurrence['board_ref']}; " \
            "move or remove that drilldown in a separately reviewed navigation refactor",
        )
      end

      board.fetch("nodes").delete(occurrence)
      decision = operation.fetch("decision")
      collection = decision == "elided" ? "elide" : "exclude"
      if Array(board[collection]).any? { |entry| entry["ref"] == ref }
        raise Error.new(
          "visibility_already_declared",
          "operation #{index + 1}: board #{board_id} already declares #{ref} in #{collection}",
        )
      end
      directive = { "ref" => ref }
      directive["reason"] = operation.fetch("reason") if decision == "excluded"
      board[collection] = Array(board[collection]) << directive

      occurrence_ref = "boards.#{board_id}.nodes.#{occurrence_id}"
      visibility_ref = "boards.#{board_id}.#{collection}.#{ref}"
      changes << change(index, "remove", occurrence_ref, before: occurrence)
      changes << change(index, "add", visibility_ref, after: directive)
      rewritten_board_ids << board_id
    end

    def apply_scaffold!(architecture, view, operation, index, changes, diagnostics,
      original_board_ids, added_boards, pending_board_ref_updates)
      spec = deep_copy(operation.fetch("board"))
      board_id = spec.fetch("id")
      if Array(view["boards"]).any? { |board| board["id"] == board_id }
        raise Error.new("duplicate_board", "operation #{index + 1}: boards.#{board_id} already exists")
      end
      if spec.fetch("subject_ref") == "architecture"
        raise Error.new(
          "unsupported_root_scaffold",
          "operation #{index + 1}: v0.1 scaffolds drill-down boards for modules, not a second architecture root",
        )
      end
      subject_module = Array(architecture.fetch("modules")).find do |mod|
        "modules.#{mod.fetch('id')}" == spec.fetch("subject_ref")
      end
      unless subject_module
        raise Error.new("unknown_board_subject", "operation #{index + 1}: unknown subject #{spec.fetch('subject_ref')}")
      end
      decomposition_status = subject_module.dig("decomposition", "status")
      if %w[leaf opaque].include?(decomposition_status)
        raise Error.new(
          "non_expandable_subject",
          "operation #{index + 1}: #{spec.fetch('subject_ref')} is #{decomposition_status} and cannot own a drill-down board",
        )
      end

      scaffold = ArchitectureViewScaffold.compile(
        architecture: architecture,
        view: view,
        subject_ref: spec.fetch("subject_ref"),
        id: spec.fetch("id"),
        title: spec.fetch("title"),
        summary: spec.fetch("summary"),
        parent: spec["parent"],
        expansion_depth: spec.fetch("expansion_depth", 1),
        node_refs: spec["node_refs"],
        columns: spec["columns"],
      )
      board = deep_copy(scaffold.board)
      parent_board_id = scaffold.parent_board_id
      parent = Array(view.fetch("boards")).find { |candidate| candidate["id"] == parent_board_id }
      raise Error.new("unknown_parent_board", "scaffold selected unknown parent board #{parent_board_id}") unless parent
      occurrences = Array(parent.fetch("nodes")).select { |node| node["ref"] == spec.fetch("subject_ref") }
      unless occurrences.length == 1
        raise Error.new(
          "ambiguous_parent_occurrence",
          "board #{parent_board_id} must contain exactly one node for #{spec.fetch('subject_ref')}; found #{occurrences.length}",
        )
      end
      occurrence = occurrences.first
      if occurrence["board_ref"]
        raise Error.new(
          "existing_drilldown",
          "board #{parent_board_id} already links #{spec.fetch('subject_ref')} to #{occurrence['board_ref']}",
        )
      end

      occurrence["board_ref"] = board_id
      view.fetch("boards") << board
      added_boards << board
      if original_board_ids.include?(parent_board_id)
        pending_board_ref_updates << {
          parent_board_id: parent_board_id,
          subject_ref: spec.fetch("subject_ref"),
          board_ref: board_id,
        }
      end
      changes << change(index, "add", "boards.#{board_id}", after: board)
      changes << change(
        index,
        "update",
        "boards.#{parent_board_id}.nodes.#{occurrence.fetch('id')}",
        field: "board_ref",
        before: nil,
        after: board_id,
      )
      diagnostics.concat(Array(scaffold.diagnostics))
    end

    def apply_layout_board!(architecture, view, operation, index, changes, diagnostics,
      laid_out_boards, layout_board_ids)
      board_id = operation.fetch("board_id")
      if laid_out_boards.include?(board_id)
        raise Error.new(
          "repeated_update",
          "operation #{index + 1}: board #{board_id} is laid out more than once",
        )
      end
      laid_out_boards << board_id
      board = find_board!(view, board_id, index)
      representation_lanes = Array(board["lanes"]).select do |lane|
        lane["kind"] == "representation"
      end
      unless representation_lanes.empty?
        lane_ids = representation_lanes.map { |lane| lane.fetch("id") }.sort
        raise Error.new(
          "unsupported_layout_constraint",
          "operation #{index + 1}: #{ArchitectureSemanticLayout::POLICY} cannot reflow board #{board_id} " \
            "while it has typed representation lanes (#{lane_ids.join(', ')}); curate the layout in view YAML " \
            "until the policy preserves mapped representation rows",
        )
      end
      projection = ArchitectureProjection::Projector.new(architecture).project(board)
      layout = ArchitectureSemanticLayout.compile(
        nodes: board.fetch("nodes"),
        edges: projection.fetch("edges"),
        architecture: architecture,
        columns: operation["columns"],
      )

      before = {
        "grid" => deep_copy(board.fetch("grid")),
        "positions" => board.fetch("nodes").to_h do |node|
          [node.fetch("id"), { "col" => node.fetch("col"), "row" => node.fetch("row") }]
        end,
      }
      board.fetch("nodes").each do |node|
        position = layout.positions.fetch(node.fetch("id"))
        node["col"] = position.fetch("col")
        node["row"] = position.fetch("row")
      end
      preserved_grid = board.fetch("grid").select do |field, _value|
        %w[min_col col_gap row_sizing row_gap].include?(field)
      end
      board["grid"] = layout.grid.merge(preserved_grid)
      after = {
        "grid" => deep_copy(board.fetch("grid")),
        "positions" => board.fetch("nodes").to_h do |node|
          [node.fetch("id"), { "col" => node.fetch("col"), "row" => node.fetch("row") }]
        end,
      }
      if before == after
        raise Error.new(
          "empty_layout",
          "operation #{index + 1}: board #{board_id} already matches #{layout.policy}",
        )
      end

      changes << change(
        index,
        "update",
        "boards.#{board_id}",
        field: "layout",
        before: before,
        after: after,
      )
      diagnostics << {
        "code" => "semantic_layout",
        "severity" => "info",
        "board_id" => board_id,
        "policy" => layout.policy,
        "metrics" => layout.metrics,
        "message" => "Board #{board_id} was placed with #{layout.policy}; review the semantic diff before apply.",
      }
      layout_board_ids << board_id
    end

    def resolve_view_entity!(view, ref, index)
      if (match = /\Aboards\.([a-z][a-z0-9_]*)\z/.match(ref))
        board_id = match[1]
        return [board_id, find_board!(view, board_id, index)]
      end
      if (match = /\Aboards\.([a-z][a-z0-9_]*)\.nodes\.([a-z][a-z0-9_]*)\z/.match(ref))
        board_id = match[1]
        occurrence_id = match[2]
        board = find_board!(view, board_id, index)
        occurrences = Array(board.fetch("nodes")).select { |node| node["id"] == occurrence_id }
        unless occurrences.length == 1
          raise Error.new(
            "unknown_view_entity",
            "operation #{index + 1}: #{ref} must resolve to exactly one occurrence; found #{occurrences.length}",
          )
        end
        return [board_id, occurrences.first]
      end

      raise Error.new("unknown_view_entity", "operation #{index + 1}: unsupported view ref #{ref}")
    end

    def find_board!(view, board_id, index)
      boards = Array(view.fetch("boards")).select { |board| board["id"] == board_id }
      unless boards.length == 1
        raise Error.new(
          "unknown_board",
          "operation #{index + 1}: boards.#{board_id} must resolve exactly once; found #{boards.length}",
        )
      end

      boards.first
    end

    def verify_preconditions!(entity, expectations, ref, index, allow_absent_nil: false)
      return if expectations.nil? || expectations.empty?
      unless entity
        raise Error.new(
          "precondition_failed",
          "operation #{index + 1}: #{ref} does not exist, so its preconditions cannot match",
        )
      end

      expectations.each do |field, expected|
        matches_absence = allow_absent_nil && expected.nil? && !entity.key?(field)
        next if matches_absence || (entity.key?(field) && entity[field] == expected)

        actual = entity.key?(field) ? entity[field] : nil
        raise Error.new(
          "precondition_failed",
          "operation #{index + 1}: #{ref}.#{field} expected #{expected.inspect}, found #{actual.inspect}",
        )
      end
    end

    def edge_match_key(match)
      return match.fetch("relation_ref") if match["relation_ref"]

      "path[#{match.fetch('relation_path').join('->')}]"
    end

    def validate_candidates!(architecture, view)
      SourceContract.validate!(architecture)
      SourceContract.validate!(view)
      ArchitectureOwnership.validate!(architecture)
      ArchitectureCoverage.validate!(architecture)
      validate_view_navigation!(architecture, view)
      projector = ArchitectureProjection::Projector.new(architecture)
      view.fetch("boards").each do |board|
        next if board["kind"] == "standard_block_instance"

        projection = projector.project(board)
        lane_errors = ArchitectureViewLanes.errors(architecture, board, projection: projection)
        unless lane_errors.empty?
          first = lane_errors.first
          raise Error.new(
            first.fetch("code"),
            "board #{board.fetch('id')} lane validation: #{first.fetch('message')}",
            details: lane_errors,
          )
        end
        if projection.fetch("edges").empty?
          raise Error.new("empty_board_projection", "board #{board.fetch('id')} projects no canonical flow")
        end
      end
    end

    def validate_view_navigation!(architecture, view)
      boards = Array(view["boards"])
      duplicates = boards.map { |board| board["id"] }.tally.select { |_id, count| count > 1 }.keys
      raise Error.new("duplicate_board", "duplicate board IDs: #{duplicates.join(', ')}") unless duplicates.empty?

      boards_by_id = boards.to_h { |board| [board.fetch("id"), board] }
      root = view.fetch("root_board")
      raise Error.new("unknown_root_board", "root_board #{root} does not exist") unless boards_by_id.key?(root)
      module_refs = Array(architecture["modules"]).to_h { |mod| ["modules.#{mod.fetch('id')}", mod] }

      boards.each do |board|
        subject = board.fetch("subject_ref")
        unless subject == "architecture" || module_refs.key?(subject)
          raise Error.new("unknown_board_subject", "board #{board.fetch('id')} has unknown subject #{subject}")
        end
        parent = board["parent"]
        if parent && !boards_by_id.key?(parent)
          raise Error.new("unknown_parent_board", "board #{board.fetch('id')} has unknown parent #{parent}")
        end
        Array(board["nodes"]).each do |node|
          child_id = node["board_ref"]
          next unless child_id

          child = boards_by_id[child_id]
          raise Error.new("unknown_board_ref", "board #{board.fetch('id')} links missing board #{child_id}") unless child
          unless child["parent"] == board.fetch("id")
            raise Error.new(
              "board_parent_mismatch",
              "#{board.fetch('id')} opens #{child_id}, but child parent is #{child['parent'].inspect}",
            )
          end
          unless child.fetch("subject_ref") == node.fetch("ref")
            raise Error.new(
              "board_subject_mismatch",
              "#{board.fetch('id')} node #{node.fetch('id')} is #{node.fetch('ref')}, but #{child_id} expands #{child.fetch('subject_ref')}",
            )
          end
        end
      end

      reachable = Set[root]
      queue = [root]
      until queue.empty?
        board = boards_by_id.fetch(queue.shift)
        Array(board["nodes"]).each do |node|
          child_id = node["board_ref"]
          next unless child_id && !reachable.include?(child_id)

          reachable << child_id
          queue << child_id
        end
      end
      unreachable = boards_by_id.keys - reachable.to_a
      unless unreachable.empty?
        raise Error.new("unreachable_board", "boards unreachable from #{root}: #{unreachable.join(', ')}")
      end
    end

    def assert_logical_match!(source, expected, path)
      actual = deep_copy(load_yaml_text(source, path))
      return if actual == expected

      raise Error.new(
        "source_patch_mismatch",
        "source-local patch for #{path} does not reproduce the validated logical document",
      )
    end

    def stage_and_build!(result)
      Dir.mktmpdir("architecture-edit-") do |stage|
        STAGED_SOURCE_DIRECTORIES.each do |directory|
          FileUtils.cp_r(File.join(@root, directory), stage)
        end
        FileUtils.mkdir_p(File.join(stage, "renderer"))
        FileUtils.cp_r(File.join(@root, "renderer", "architecture"), File.join(stage, "renderer"))
        result.source_contents.each do |relative, content|
          destination = File.join(stage, relative)
          FileUtils.mkdir_p(File.dirname(destination))
          File.binwrite(destination, content)
        end

        stdout, stderr, status = Open3.capture3(
          RbConfig.ruby,
          "renderer/architecture/build-manifest.rb",
          chdir: stage,
        )
        unless status.success?
          message = [stdout, stderr].reject(&:empty?).join("\n").strip
          raise Error.new("staged_validation_failed", message)
        end

        generated = {}
        expected = staged_dependency_digests(stage, result.source_contents.keys)
        Dir[File.join(stage, "renderer", "architecture", "manifest-*.js")].sort.each do |staged_path|
          relative = staged_path.delete_prefix("#{stage}/")
          staged_content = File.binread(staged_path)
          original_path = File.join(@root, relative)
          original_content = File.exist?(original_path) ? File.binread(original_path) : nil
          next if original_content == staged_content

          generated[relative] = staged_content
          expected[relative] = original_content && Digest::SHA256.hexdigest(original_content)
        end
        result.attach_generated!(
          contents: generated,
          expected_file_digests: expected,
          validation_output: [stdout, stderr].reject(&:empty?).join("\n").strip,
        )
      end
    end

    def staged_dependency_digests(stage, patched_paths)
      staged_paths = STAGED_SOURCE_DIRECTORIES.flat_map do |directory|
        Dir[File.join(stage, directory, "**", "*")]
      end
      staged_paths << File.join(stage, "renderer", "architecture", "build-manifest.rb")
      staged_paths.select! { |path| File.file?(path) }
      staged_paths.each_with_object({}) do |staged_path, expected|
        relative = staged_path.delete_prefix("#{stage}/")
        next if patched_paths.include?(relative)

        digest = Digest::SHA256.file(staged_path).hexdigest
        real_path = File.join(@root, relative)
        current = File.exist?(real_path) ? Digest::SHA256.file(real_path).hexdigest : nil
        unless current == digest
          raise Error.new(
            "concurrent_source_change",
            "#{relative} changed while the edit was being staged; preview again",
          )
        end
        expected[relative] = digest
      end
    end

    def resolve_source_set(id)
      registry = StrictYaml.load_file(File.join(@root, REGISTRY_PATH))
      source_set = Array(registry["source_sets"]).find { |candidate| candidate["id"] == id }
      raise Error.new("unknown_source_set", "unknown source set #{id.inspect}") unless source_set

      deep_copy(source_set)
    rescue StrictYaml::Error, Errno::ENOENT => e
      raise Error.new("invalid_registry", e.message)
    end

    def verify_target_digests!(target, actual, require_digests:)
      %w[architecture_sha256 view_sha256].each do |field|
        expected = target[field]
        if require_digests && !expected
          raise Error.new("missing_base_digest", "apply requires target.#{field}; run prepare first")
        end
        next unless expected
        next if expected == actual.fetch(field)

        raise Error.new(
          "stale_edit_plan",
          "target.#{field} is stale: expected #{expected}, current source is #{actual.fetch(field)}",
        )
      end
    end

    def read_relative(relative)
      path = File.expand_path(relative, @root)
      unless path.start_with?("#{@root}/")
        raise Error.new("unsafe_registry_path", "registry path escapes repository: #{relative}")
      end

      File.binread(path)
    rescue Errno::ENOENT => e
      raise Error.new("missing_source", e.message)
    end

    def load_yaml_text(source, path)
      StrictYaml.reject_duplicate_keys!(source, path)
      Psych.safe_load(source, aliases: true, filename: path)
    rescue Psych::SyntaxError, StrictYaml::Error => e
      raise Error.new("invalid_source_yaml", e.message)
    end

    def deep_copy(value)
      case value
      when Hash
        value.each_with_object({}) { |(key, child), copy| copy[deep_copy(key)] = deep_copy(child) }
      when Array
        value.map { |child| deep_copy(child) }
      when String
        value.dup
      else
        value
      end
    end

    def change(index, action, entity_ref, field: nil, before: nil, after: nil)
      {
        "operation_index" => index,
        "action" => action,
        "entity_ref" => entity_ref,
        "field" => field,
        "before" => deep_copy(before),
        "after" => deep_copy(after),
      }
    end
  end

  class AtomicWriter
    def initialize(root)
      @root = File.expand_path(root)
    end

    def commit!(contents, expected_digests)
      lock_name = Digest::SHA256.hexdigest(@root)[0, 16]
      lock_path = File.join(Dir.tmpdir, "architecture-edit-#{lock_name}.lock")
      File.open(lock_path, File::RDWR | File::CREAT, 0o600) do |lock|
        unless lock.flock(File::LOCK_EX | File::LOCK_NB)
          raise Error.new("edit_locked", "another architecture edit is being applied")
        end

        verify_files!(expected_digests.keys, expected_digests)
        replace_with_rollback!(contents)
      end
    end

    private

    def verify_files!(paths, expected_digests)
      paths.each do |relative|
        path = safe_path(relative)
        expected = expected_digests[relative]
        actual = File.exist?(path) ? Digest::SHA256.file(path).hexdigest : nil
        next if actual == expected

        raise Error.new(
          "concurrent_file_change",
          "#{relative} changed after validation; expected #{expected.inspect}, found #{actual.inspect}",
        )
      end
    end

    def replace_with_rollback!(contents)
      originals = contents.to_h do |relative, _content|
        path = safe_path(relative)
        original = if File.exist?(path)
          { content: File.binread(path), mode: File.stat(path).mode }
        end
        [relative, original]
      end
      temporaries = {}
      replaced = []
      begin
        contents.sort.each do |relative, content|
          path = safe_path(relative)
          FileUtils.mkdir_p(File.dirname(path))
          temporary = Tempfile.new([".architecture-edit-", ".tmp"], File.dirname(path), binmode: true)
          temporary.write(content)
          temporary.flush
          temporary.fsync
          temporary.chmod(File.exist?(path) ? File.stat(path).mode : 0o644)
          temporary.close
          temporaries[relative] = temporary
        end
        contents.keys.sort.each do |relative|
          rename_file(temporaries.fetch(relative).path, safe_path(relative))
          replaced << relative
        end
      rescue StandardError => e
        begin
          rollback!(replaced, originals)
        rescue StandardError => rollback_error
          raise Error.new(
            "rollback_failed",
            "architecture edit write failed (#{e.message}) and rollback also failed: #{rollback_error.message}",
          )
        end
        raise Error.new("write_failed", "architecture edit write failed and was rolled back: #{e.message}")
      ensure
        temporaries.each_value(&:close!)
      end
    end

    def rollback!(replaced, originals)
      replaced.reverse_each do |relative|
        path = safe_path(relative)
        original = originals.fetch(relative)
        if original.nil?
          File.delete(path) if File.exist?(path)
        else
          temporary = Tempfile.new([".architecture-edit-rollback-", ".tmp"], File.dirname(path), binmode: true)
          temporary.write(original.fetch(:content))
          temporary.flush
          temporary.fsync
          temporary.chmod(original.fetch(:mode))
          temporary.close
          rename_file(temporary.path, path)
          temporary.close!
        end
      end
    end

    def rename_file(source, destination)
      File.rename(source, destination)
    end

    def safe_path(relative)
      path = File.expand_path(relative, @root)
      unless path.start_with?("#{@root}/")
        raise Error.new("unsafe_write_path", "edit path escapes repository: #{relative}")
      end

      path
    end
  end
end
