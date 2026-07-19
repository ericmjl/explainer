# frozen_string_literal: true

require "json"
require "open3"
require "rbconfig"
require "set"

require_relative "architecture_comparison_contract"
require_relative "architecture_coverage"
require_relative "architecture_ownership"
require_relative "architecture_projection"
require_relative "architecture_view_lanes"
require_relative "architecture_view_regions"
require_relative "evidence_contract"
require_relative "pseudocode_contract"
require_relative "source_contract"
require_relative "standard_block_contract"
require_relative "strict_yaml"

# Read-only, agent-facing verification for one registered architecture source
# set. The verifier composes the existing schema, evidence, ownership,
# coverage, and projection contracts into deterministic, machine-readable
# checks. The manifest check delegates to the canonical builder rather than
# reimplementing its compilation rules.
module ArchitectureVerifier
  SCHEMA_VERSION = "architecture-verification-v0.1"
  CHECK_IDS = %w[
    registry
    strict_yaml
    source_contract
    source_semantics
    comparisons
    ownership
    coverage
    view_navigation
    board_layout
    projection
  ].freeze
  DENSE_NODE_THRESHOLD = 12
  DENSE_EDGE_THRESHOLD = 20

  class Report
    attr_reader :source_set_id, :board_id, :checks

    def initialize(source_set_id:, board_id:, checks:)
      @source_set_id = source_set_id
      @board_id = board_id
      @checks = checks
    end

    def status
      @checks.any? { |check| check.fetch("status") == "failed" } ? "failed" : "passed"
    end

    def summary
      statuses = @checks.map { |check| check.fetch("status") }.tally
      diagnostics = @checks.flat_map { |check| Array(check["diagnostics"]) }
      {
        "check_count" => @checks.length,
        "passed_count" => statuses.fetch("passed", 0),
        "failed_count" => statuses.fetch("failed", 0),
        "skipped_count" => statuses.fetch("skipped", 0),
        "error_count" => diagnostics.count { |item| item.fetch("severity", "error") == "error" },
        "warning_count" => diagnostics.count { |item| item["severity"] == "warning" },
      }
    end

    def to_h
      {
        "schema_version" => SCHEMA_VERSION,
        "status" => status,
        "source_set" => @source_set_id,
        "board" => @board_id,
        "checks" => @checks,
        "summary" => summary,
      }
    end

    def to_text
      scope = @board_id ? "#{@source_set_id}/#{@board_id}" : @source_set_id
      lines = ["Architecture verification #{scope}: #{status.upcase}"]
      @checks.each do |check|
        marker = { "passed" => "PASS", "failed" => "FAIL", "skipped" => "SKIP" }.fetch(check.fetch("status"))
        lines << "[#{marker}] #{check.fetch('id')}"
        Array(check["diagnostics"]).each do |diagnostic|
          severity = diagnostic.fetch("severity", "error").upcase
          location = [diagnostic["file"], diagnostic["board"]].compact.join(":")
          location = " #{location}" unless location.empty?
          lines << "  #{severity} #{diagnostic.fetch('code')}#{location}: #{diagnostic.fetch('message')}"
        end
      end
      totals = summary
      lines << "Summary: #{totals.fetch('passed_count')} passed, #{totals.fetch('failed_count')} failed, " \
        "#{totals.fetch('skipped_count')} skipped, #{totals.fetch('warning_count')} warnings"
      lines.join("\n")
    end
  end

  class Verifier
    def initialize(root: File.expand_path("..", __dir__))
      @root = File.expand_path(root)
    end

    def verify(source_set_id:, board_id: nil, include_manifest: false)
      checks = []
      registry, source_set, registry_diagnostics = load_registry(source_set_id)
      checks << build_check("registry", registry_diagnostics)
      unless source_set && registry_diagnostics.empty?
        append_skipped(checks, CHECK_IDS.drop(1), "registry did not resolve a valid requested source set")
        checks << skipped_check("manifest", "source set registry entry is unresolved or invalid") if include_manifest
        return Report.new(source_set_id: source_set_id, board_id: board_id, checks: checks)
      end

      documents, yaml_diagnostics = load_documents(registry, source_set)
      checks << build_check("strict_yaml", yaml_diagnostics)
      unless yaml_diagnostics.empty?
        append_skipped(checks, CHECK_IDS.drop(2), "source YAML did not load")
        checks << skipped_check("manifest", "source YAML did not load") if include_manifest
        return Report.new(source_set_id: source_set_id, board_id: board_id, checks: checks)
      end

      architecture = documents.fetch("architecture")
      view = documents.fetch("view")
      pseudocode = documents.fetch("pseudocode")
      bibliography = documents.fetch("bibliography")
      contract_check = source_contract_check(
        architecture,
        view,
        pseudocode,
        bibliography,
        source_set,
        registry.fetch("bibliography"),
        documents,
      )
      checks << contract_check
      if contract_check.fetch("status") == "failed"
        append_skipped(checks, CHECK_IDS.drop(3), "source contracts did not validate")
        checks << skipped_check("manifest", "source contracts did not validate") if include_manifest
        return Report.new(source_set_id: source_set_id, board_id: board_id, checks: checks)
      end
      checks << source_semantics_check(architecture, view, pseudocode, bibliography, source_set, documents)
      checks << comparison_check(registry, source_set_id, bibliography, documents)
      checks << string_error_check("ownership", ArchitectureOwnership.errors(architecture), source_set.fetch("architecture"))
      checks << string_error_check("coverage", ArchitectureCoverage.errors(architecture), source_set.fetch("architecture"))
      checks << navigation_check(architecture, view, source_set.fetch("view"), board_id)

      selected_boards = select_boards(view, board_id)
      architecture_boards = selected_boards.reject { |board| board["kind"] == "standard_block_instance" }
      checks << layout_check(architecture_boards, source_set.fetch("view"))
      checks << projection_check(architecture, view, architecture_boards, source_set.fetch("view"))
      checks << manifest_check if include_manifest

      Report.new(source_set_id: source_set_id, board_id: board_id, checks: checks)
    end

    private

    def load_registry(source_set_id)
      path = File.join(@root, "architectures/index.yaml")
      registry = StrictYaml.load_file(path)
      diagnostics = []
      source_sets = Array(registry["source_sets"])
      duplicate_ids(source_sets).each do |id|
        diagnostics << diagnostic("registry", "duplicate_source_set", "duplicate source-set id #{id}", file: "architectures/index.yaml")
      end
      source_set = source_sets.find { |candidate| candidate["id"] == source_set_id }
      unless source_set
        diagnostics << diagnostic(
          "registry", "unknown_source_set", "source set #{source_set_id.inspect} is not registered",
          file: "architectures/index.yaml"
        )
        return [registry, nil, diagnostics]
      end

      required_paths = {
        "architecture" => source_set["architecture"],
        "view" => source_set["view"],
        "pseudocode" => source_set["pseudocode"],
        "bibliography" => registry["bibliography"],
        "comparisons" => registry["comparisons"],
      }
      Array(source_set["standard_blocks"]).each_with_index do |relative, index|
        required_paths["standard_blocks[#{index}]"] = relative
      end
      required_paths.each do |label, relative|
        if !relative.is_a?(String) || relative.empty?
          diagnostics << diagnostic("registry", "missing_registry_path", "#{label} path is missing", file: "architectures/index.yaml")
          next
        end
        resolved = safe_path(relative)
        unless resolved
          diagnostics << diagnostic("registry", "unsafe_registry_path", "#{label} path escapes repository: #{relative}", file: "architectures/index.yaml")
        else
          diagnostics << diagnostic("registry", "missing_registry_file", "#{label} file does not exist: #{relative}", file: relative) unless File.file?(resolved)
        end
      end
      [registry, source_set, diagnostics]
    rescue StrictYaml::Error, Errno::ENOENT => e
      diagnostics = [diagnostic("registry", "invalid_registry", e.message, file: "architectures/index.yaml")]
      [nil, nil, diagnostics]
    end

    def load_documents(registry, source_set)
      paths = {
        "architecture" => source_set.fetch("architecture"),
        "view" => source_set.fetch("view"),
        "pseudocode" => source_set.fetch("pseudocode"),
        "bibliography" => registry.fetch("bibliography"),
        "comparison_registry" => registry.fetch("comparisons"),
      }
      Array(source_set["standard_blocks"]).each_with_index do |relative, index|
        paths["standard_block_#{index}"] = relative
      end
      documents = {}
      diagnostics = []
      paths.each do |key, relative|
        path = safe_path(relative)
        next unless path

        documents[key] = StrictYaml.load_file(path)
      rescue StrictYaml::Error, Errno::ENOENT => e
        diagnostics << diagnostic("strict_yaml", "invalid_yaml", e.message, file: relative)
      end
      comparison_registry = documents["comparison_registry"]
      Array(comparison_registry && comparison_registry["sources"]).each_with_index do |relative, index|
        unless relative.is_a?(String) && !relative.empty?
          diagnostics << diagnostic(
            "strict_yaml", "invalid_comparison_source_path",
            "comparison source path must be a non-empty string",
            file: registry.fetch("comparisons"), path: "$.sources[#{index}]"
          )
          next
        end
        path = safe_path(relative)
        unless path
          diagnostics << diagnostic(
            "strict_yaml", "unsafe_comparison_source_path",
            "comparison source path escapes repository: #{relative}",
            file: registry.fetch("comparisons"), path: "$.sources[#{index}]"
          )
          next
        end
        documents["comparison_#{index}"] = StrictYaml.load_file(path)
      rescue StrictYaml::Error, Errno::ENOENT => e
        diagnostics << diagnostic("strict_yaml", "invalid_yaml", e.message, file: relative)
      end
      [documents, diagnostics]
    end

    def source_contract_check(architecture, view, pseudocode, bibliography, source_set, bibliography_file, documents)
      diagnostics = []
      contracted_documents = {
        source_set.fetch("architecture") => architecture,
        source_set.fetch("view") => view,
        bibliography_file => bibliography,
      }
      if SourceContract::SCHEMAS.key?(pseudocode["schema_version"])
        contracted_documents[source_set.fetch("pseudocode")] = pseudocode
      end
      contracted_documents.each do |file, document|
        SourceContract.errors(document).each do |item|
          diagnostics << diagnostic(
            "source_contract", item.code, item.message,
            file: file, path: item.path
          )
        end
      end
      Array(source_set["standard_blocks"]).each_with_index do |file, index|
        document = documents["standard_block_#{index}"]
        next unless document && document["schema_version"] == "standard-block-v0.2"

        StandardBlockContract.definition_errors(document).each do |item|
          diagnostics << diagnostic(
            "source_contract", item.code, item.message,
            file: file, path: item.path
          )
        end
      end
      build_check("source_contract", diagnostics)
    end

    def source_semantics_check(architecture, view, pseudocode, bibliography, source_set, documents)
      diagnostics = []
      architecture_file = source_set.fetch("architecture")
      view_file = source_set.fetch("view")
      if view.dig("entry", "architecture") != architecture_file
        diagnostics << diagnostic(
          "source_semantics", "view_entry_mismatch",
          "view entry architecture #{view.dig('entry', 'architecture').inspect} does not match registry path #{architecture_file}",
          file: view_file, path: "$.entry.architecture"
        )
      end

      unique_collections = {
        "modules" => architecture["modules"],
        "representations" => architecture["representations"],
        "value_sites" => architecture["value_sites"],
        "relations" => architecture["relations"],
        "claims" => architecture["claims"],
        "conditioning" => architecture["conditioning"],
        "scale_transitions" => architecture["scale_transitions"],
        "open_questions" => architecture["open_questions"],
        "execution.loops" => architecture.dig("execution", "loops"),
        "block_instances" => architecture["block_instances"],
      }
      unique_collections.each do |name, items|
        duplicate_ids(Array(items)).each do |id|
          diagnostics << diagnostic(
            "source_semantics", "duplicate_semantic_id", "#{name} contains duplicate id #{id}",
            file: architecture_file, path: "$.#{name}"
          )
        end
      end
      Array(architecture["representations"]).each_with_index do |representation, representation_index|
        groups = Array(representation["field_groups"])
        duplicate_ids(groups).each do |id|
          diagnostics << diagnostic(
            "source_semantics", "duplicate_semantic_id",
            "representation #{representation['id']} field_groups contains duplicate id #{id}",
            file: architecture_file,
            path: "$.representations[#{representation_index}].field_groups"
          )
        end
        field_owners = {}
        groups.each_with_index do |group, group_index|
          Array(group["fields"]).each do |field|
            if field_owners.key?(field)
              diagnostics << diagnostic(
                "source_semantics", "duplicate_representation_field",
                "representation #{representation['id']} field #{field} appears in groups #{field_owners[field]} and #{group['id']}",
                file: architecture_file,
                path: "$.representations[#{representation_index}].field_groups[#{group_index}].fields"
              )
            else
              field_owners[field] = group["id"]
            end
          end
        end
      end

      bibliography_sources = Array(bibliography["sources"]).to_h { |source| [source["id"], source] }
      evidence_facts(architecture).each do |label, item, path|
        EvidenceContract.errors(item && item["evidence"], bibliography_sources, label: label).each do |message|
          diagnostics << diagnostic(
            "source_semantics", "invalid_evidence", message,
            file: architecture_file, path: path
          )
        end
      end
      {
        architecture_file => architecture,
        view_file => view,
      }.each do |file, document|
        each_source_ref(document) do |source_ref, path|
          next if bibliography_sources.key?(source_ref)

          diagnostics << diagnostic(
            "source_semantics", "unknown_bibliography_source",
            "references unknown bibliography source #{source_ref}",
            file: file, path: path
          )
        end
      end
      registered_blocks = Array(source_set["standard_blocks"]).to_set
      blocks_by_path = Array(source_set["standard_blocks"]).each_with_index.to_h do |relative, index|
        [relative, documents.fetch("standard_block_#{index}")]
      end
      StandardBlockContract.instance_errors(
        architecture,
        blocks_by_path: blocks_by_path,
        registered_blocks: registered_blocks,
      ).each do |item|
        diagnostics << diagnostic(
          "source_semantics", item.code, item.message,
          file: architecture_file, path: item.path
        )
      end
      if pseudocode["schema_version"] == "pseudocode-v0.2"
        PseudocodeContract.errors(pseudocode, architecture: architecture).each do |item|
          diagnostics << diagnostic(
            "source_semantics", item.code, item.message,
            file: source_set.fetch("pseudocode"), path: item.path
          )
        end
      end
      {
        architecture_file => architecture,
        source_set.fetch("pseudocode") => pseudocode,
      }.each do |file, document|
        each_named_ref(document, "standard_block_ref") do |block_ref, path|
          next if registered_blocks.include?(block_ref)

          diagnostics << diagnostic(
            "source_semantics", "unregistered_standard_block",
            "references standard block #{block_ref.inspect}, but it is not registered for source set #{source_set.fetch('id')}",
            file: file, path: path
          )
        end
      end
      build_check("source_semantics", diagnostics)
    end

    def comparison_check(registry, source_set_id, bibliography, documents)
      diagnostics = []
      registry_file = registry.fetch("comparisons")
      comparison_registry = documents.fetch("comparison_registry")
      comparison_paths = Array(comparison_registry["sources"])
      comparisons_by_path = comparison_paths.each_with_index.to_h do |path, index|
        [path, documents["comparison_#{index}"]]
      end
      ArchitectureComparisonContract.registry_errors(
        comparison_registry,
        comparisons_by_path: comparisons_by_path,
      ).each do |item|
        diagnostics << diagnostic(
          "comparisons", item.code, item.message,
          file: registry_file, path: item.path
        )
      end

      structurally_valid = {}
      comparison_paths.each do |path|
        comparison = comparisons_by_path[path]
        next unless comparison

        errors = SourceContract.errors(comparison)
        errors.each do |item|
          diagnostics << diagnostic(
            "comparisons", item.code, item.message,
            file: path, path: item.path
          )
        end
        structurally_valid[path] = comparison if errors.empty?
      end

      relevant = structurally_valid.select do |_path, comparison|
        Hash(comparison["subjects"]).values.any? { |subject| subject["source_set"] == source_set_id }
      end
      context, context_diagnostics = comparison_source_set_context(registry, relevant.values)
      diagnostics.concat(context_diagnostics)
      bibliography_sources = Array(bibliography["sources"]).to_h { |source| [source.fetch("id"), source] }
      relevant.each do |path, comparison|
        ArchitectureComparisonContract.errors(
          comparison,
          source_sets: context,
          bibliography_sources: bibliography_sources,
        ).each do |item|
          diagnostics << diagnostic(
            "comparisons", item.code, item.message,
            file: path, path: item.path
          )
        end
      end
      build_check(
        "comparisons",
        diagnostics,
        metrics: { "registered_count" => comparison_paths.length, "relevant_count" => relevant.length },
      )
    end

    def comparison_source_set_context(registry, comparisons)
      source_set_ids = comparisons.flat_map do |comparison|
        Hash(comparison["subjects"]).values.filter_map { |subject| subject["source_set"] }
      end.uniq
      source_sets = Array(registry["source_sets"]).to_h { |entry| [entry["id"], entry] }
      context = {}
      diagnostics = []
      source_set_ids.each do |id|
        entry = source_sets[id]
        next unless entry

        block_paths = Array(entry["standard_blocks"])
        context[id] = {
          architecture: StrictYaml.load_file(safe_path(entry.fetch("architecture"))),
          view: StrictYaml.load_file(safe_path(entry.fetch("view"))),
          blocks_by_path: block_paths.to_h { |path| [path, StrictYaml.load_file(safe_path(path))] },
          registered_blocks: block_paths,
        }
      rescue StrictYaml::Error, Errno::ENOENT, KeyError, TypeError => e
        diagnostics << diagnostic(
          "comparisons", "comparison_source_set_load_failed",
          "cannot load source set #{id.inspect} for comparison: #{e.message}",
          file: "architectures/index.yaml"
        )
      end
      [context, diagnostics]
    end

    def navigation_check(architecture, view, file, selected_board_id)
      diagnostics = []
      boards = Array(view["boards"])
      duplicate_ids(boards).each do |id|
        diagnostics << diagnostic("view_navigation", "duplicate_board", "duplicate board id #{id}", file: file, board: id)
      end
      boards_by_id = boards.to_h { |board| [board["id"], board] }
      root_id = view["root_board"]
      root = boards_by_id[root_id]
      unless root
        diagnostics << diagnostic("view_navigation", "unknown_root_board", "root board #{root_id.inspect} does not exist", file: file, board: root_id)
      else
        if root["subject_ref"] != "architecture"
          diagnostics << diagnostic("view_navigation", "invalid_root_subject", "root board subject must be architecture", file: file, board: root_id)
        end
        if root.key?("parent")
          diagnostics << diagnostic("view_navigation", "root_has_parent", "root board must not declare a parent", file: file, board: root_id)
        end
      end
      if selected_board_id && !boards_by_id.key?(selected_board_id)
        diagnostics << diagnostic(
          "view_navigation", "unknown_board", "selected board #{selected_board_id.inspect} does not exist",
          file: file, board: selected_board_id
        )
      end

      modules_by_ref = Array(architecture["modules"]).to_h { |mod| ["modules.#{mod['id']}", mod] }
      block_instances_by_ref = Array(architecture["block_instances"]).to_h do |instance|
        ["block_instances.#{instance['id']}", instance]
      end
      adjacency = Hash.new { |hash, key| hash[key] = [] }
      boards.each do |board|
        board_id = board["id"]
        parent = board["parent"]
        if parent && !boards_by_id.key?(parent)
          diagnostics << diagnostic("view_navigation", "unknown_parent_board", "parent board #{parent} does not exist", file: file, board: board_id)
        end
        subject = board["subject_ref"]
        subject_status = subject == "architecture" ? architecture.dig("decomposition", "status") : modules_by_ref.dig(subject, "decomposition", "status")
        if subject != "architecture" && !modules_by_ref.key?(subject)
          diagnostics << diagnostic("view_navigation", "unknown_board_subject", "board subject #{subject.inspect} does not exist", file: file, board: board_id)
        elsif board["kind"] == "standard_block_instance"
          instance = block_instances_by_ref[board["block_instance_ref"]]
          unless instance
            diagnostics << diagnostic(
              "view_navigation", "unknown_block_instance",
              "board #{board_id} references unknown #{board['block_instance_ref'].inspect}",
              file: file, board: board_id
            )
          end
          if instance && instance["subject_ref"] != subject
            diagnostics << diagnostic(
              "view_navigation", "block_instance_subject_mismatch",
              "#{board['block_instance_ref']} belongs to #{instance['subject_ref']}, not #{subject}",
              file: file, board: board_id
            )
          end
        elsif %w[leaf opaque].include?(subject_status)
          diagnostics << diagnostic("view_navigation", "non_expandable_subject", "#{subject} is #{subject_status} and cannot own a board", file: file, board: board_id)
        end

        Array(board["nodes"]).each do |node|
          child_id = node["board_ref"]
          next unless child_id

          adjacency[board_id] << child_id
          child = boards_by_id[child_id]
          unless child
            diagnostics << diagnostic(
              "view_navigation", "unknown_board_ref", "node #{node['id']} opens missing board #{child_id}",
              file: file, board: board_id, entity_ref: node["ref"]
            )
            next
          end
          unless node["ref"].to_s.start_with?("modules.")
            diagnostics << diagnostic(
              "view_navigation", "board_ref_non_module", "node #{node['id']} has board_ref but is not a module occurrence",
              file: file, board: board_id, entity_ref: node["ref"]
            )
          end
          if child["parent"] != board_id
            diagnostics << diagnostic(
              "view_navigation", "board_parent_mismatch",
              "node #{node['id']} opens #{child_id}, but that board declares parent #{child['parent'].inspect}",
              file: file, board: board_id, entity_ref: node["ref"]
            )
          end
          if child["subject_ref"] != node["ref"]
            diagnostics << diagnostic(
              "view_navigation", "board_subject_mismatch",
              "node #{node['id']} (#{node['ref']}) opens #{child_id} with subject #{child['subject_ref'].inspect}",
              file: file, board: board_id, entity_ref: node["ref"]
            )
          end
        end
      end

      cycle = navigation_cycle(adjacency, boards_by_id.keys)
      if cycle
        diagnostics << diagnostic("view_navigation", "board_cycle", "board navigation contains cycle #{cycle.join(' -> ')}", file: file, board: cycle.first)
      end
      if root
        reachable = reachable_boards(root_id, adjacency)
        (boards_by_id.keys - reachable.to_a).sort.each do |board_id|
          diagnostics << diagnostic("view_navigation", "unreachable_board", "board is unreachable from root #{root_id}", file: file, board: board_id)
        end
      end
      build_check("view_navigation", diagnostics)
    end

    def layout_check(boards, file)
      diagnostics = []
      Array(boards).each do |board|
        board_id = board["id"]
        columns = board.dig("grid", "columns")
        rows = board.dig("grid", "rows")
        occupied = {}
        Array(board["nodes"]).each do |node|
          col = node["col"]
          row = node["row"]
          if columns && col && col > columns
            diagnostics << diagnostic("board_layout", "column_out_of_bounds", "node #{node['id']} column #{col} exceeds #{columns}", file: file, board: board_id)
          end
          if rows && row && row > rows
            diagnostics << diagnostic("board_layout", "row_out_of_bounds", "node #{node['id']} row #{row} exceeds #{rows}", file: file, board: board_id)
          end
          cell = [col, row]
          if occupied.key?(cell)
            diagnostics << diagnostic(
              "board_layout", "duplicate_grid_cell",
              "nodes #{occupied[cell]} and #{node['id']} occupy col #{col}, row #{row}",
              file: file, board: board_id
            )
          else
            occupied[cell] = node["id"]
          end
        end
        duplicate_ids(Array(board["reference_panels"])).each do |id|
          diagnostics << diagnostic(
            "board_layout", "duplicate_reference_panel",
            "reference panels contain duplicate id #{id}", file: file, board: board_id
          )
        end
        Array(board["reference_panels"]).each do |panel|
          asset = panel["asset"]
          next if asset && File.file?(File.join(@root, asset))

          diagnostics << diagnostic(
            "board_layout", "missing_reference_panel_asset",
            "reference panel #{panel['id']} asset is missing: #{asset.inspect}",
            file: file, board: board_id
          )
        end
        Array(board["edge_overrides"]).each_with_index do |override, index|
          if override.key?("route_clearance") && !override["route_side"]
            diagnostics << diagnostic(
              "board_layout", "route_clearance_without_side",
              "edge override #{index} sets route_clearance without route_side",
              file: file, board: board_id
            )
          end
        end
        if Array(board["nodes"]).length > DENSE_NODE_THRESHOLD
          diagnostics << diagnostic(
            "board_layout", "dense_board", "board has #{Array(board['nodes']).length} visible nodes",
            severity: "warning", file: file, board: board_id
          )
        end
      end
      build_check("board_layout", diagnostics, boards: Array(boards).map { |board| board["id"] })
    end

    def projection_check(architecture, view, boards, file)
      diagnostics = []
      metrics = { "board_count" => 0, "node_count" => 0, "edge_count" => 0 }
      projector = ArchitectureProjection::Projector.new(architecture)
      Array(boards).each do |board|
        board_id = board["id"]
        projection = projector.project(board)
        edges = projection.fetch("edges")
        ArchitectureViewLanes.errors(architecture, board, projection: projection).each do |item|
          diagnostics << diagnostic(
            "projection", item.fetch("code"), item.fetch("message"),
            file: file, board: board_id,
            entity_ref: item["lane_id"] && "lanes.#{item['lane_id']}"
          )
        end
        ArchitectureViewRegions.errors(architecture, board, projection: projection).each do |item|
          diagnostics << diagnostic(
            "projection", item.fetch("code"), item.fetch("message"),
            file: file, board: board_id,
            entity_ref: item["region_id"] && "regions.#{item['region_id']}"
          )
        end
        if edges.empty?
          diagnostics << diagnostic("projection", "empty_projection", "board projects no canonical edges", file: file, board: board_id)
        end
        metrics["board_count"] += 1
        metrics["node_count"] += projection.fetch("nodes").length
        metrics["edge_count"] += edges.length
        if edges.length > DENSE_EDGE_THRESHOLD
          diagnostics << diagnostic(
            "projection", "dense_edge_set", "board projects #{edges.length} visible edges",
            severity: "warning", file: file, board: board_id
          )
        end
      rescue ArchitectureProjection::ProjectionError => e
        diagnostics << diagnostic("projection", e.code, e.message, file: file, board: board_id)
      end

      root = Array(view["boards"]).find { |board| board["id"] == view["root_board"] }
      if root
        visible = Array(root["nodes"]).map { |node| node["ref"] }.to_set
        boundaries = Array(architecture["value_sites"]).filter_map do |site|
          "value_sites.#{site['id']}" if site["boundary"]
        end
        (boundaries - visible.to_a).sort.each do |ref|
          diagnostics << diagnostic(
            "projection", "missing_root_boundary", "root board omits task boundary #{ref}",
            file: file, board: root["id"], entity_ref: ref
          )
        end
      end
      build_check("projection", diagnostics, boards: Array(boards).map { |board| board["id"] }, metrics: metrics)
    rescue ArchitectureProjection::ProjectionError => e
      diagnostics << diagnostic("projection", e.code, e.message, file: file)
      build_check("projection", diagnostics, boards: Array(boards).map { |board| board["id"] }, metrics: metrics)
    end

    def manifest_check
      stdout, stderr, status = Open3.capture3(
        RbConfig.ruby,
        "renderer/architecture/build-manifest.rb",
        "--check",
        chdir: @root,
      )
      diagnostics = []
      unless status.success?
        message = [stdout, stderr].reject(&:empty?).join("\n").strip
        diagnostics << diagnostic("manifest", "manifest_not_reproducible", message)
      end
      build_check("manifest", diagnostics)
    rescue SystemCallError => e
      build_check("manifest", [diagnostic("manifest", "manifest_check_failed", e.message)])
    end

    def evidence_facts(architecture)
      facts = []
      facts << ["architecture decomposition", architecture["decomposition"], "$.decomposition"]
      %w[representations value_sites modules relations claims conditioning scale_transitions open_questions block_instances].each do |collection|
        Array(architecture[collection]).each_with_index do |item, index|
          facts << ["#{collection.delete_suffix('s')} #{item['id'] || index}", item, "$.#{collection}[#{index}]"]
          if collection == "representations"
            Array(item["field_groups"]).each_with_index do |group, group_index|
              facts << [
                "representation #{item['id'] || index} field group #{group['id'] || group_index}",
                group,
                "$.representations[#{index}].field_groups[#{group_index}]",
              ]
            end
          end
        end
      end
      facts << ["training_inference", architecture["training_inference"], "$.training_inference"]
      facts << ["reference_configuration", architecture["reference_configuration"], "$.reference_configuration"] if architecture["reference_configuration"]
      Hash(architecture["state_semantics"]).each do |id, item|
        facts << ["state_semantics #{id}", item, "$.state_semantics.#{id}"]
      end
      Array(architecture.dig("execution", "loops")).each_with_index do |item, index|
        facts << ["execution loop #{item['id'] || index}", item, "$.execution.loops[#{index}]"]
      end
      facts
    end

    def each_source_ref(value, path = "$", &block)
      case value
      when Hash
        yield value["source_ref"], "#{path}.source_ref" if value["source_ref"]
        value.each { |key, child| each_source_ref(child, "#{path}.#{key}", &block) }
      when Array
        value.each_with_index { |child, index| each_source_ref(child, "#{path}[#{index}]", &block) }
      end
    end

    def each_named_ref(value, key_name, path = "$", &block)
      case value
      when Hash
        yield value[key_name], "#{path}.#{key_name}" if value[key_name]
        value.each { |key, child| each_named_ref(child, key_name, "#{path}.#{key}", &block) }
      when Array
        value.each_with_index { |child, index| each_named_ref(child, key_name, "#{path}[#{index}]", &block) }
      end
    end

    def select_boards(view, board_id)
      boards = Array(view["boards"])
      return boards unless board_id

      boards.select { |board| board["id"] == board_id }
    end

    def navigation_cycle(adjacency, board_ids)
      visited = Set.new
      active = Set.new
      stack = []
      visit = lambda do |id|
        return nil if visited.include?(id)
        if active.include?(id)
          start = stack.index(id) || 0
          return stack[start..] + [id]
        end

        active << id
        stack << id
        adjacency[id].sort.each do |child|
          next unless board_ids.include?(child)

          cycle = visit.call(child)
          return cycle if cycle
        end
        stack.pop
        active.delete(id)
        visited << id
        nil
      end
      board_ids.sort.each do |id|
        cycle = visit.call(id)
        return cycle if cycle
      end
      nil
    end

    def reachable_boards(root_id, adjacency)
      reachable = Set[root_id]
      queue = [root_id]
      until queue.empty?
        adjacency[queue.shift].each do |child|
          next if reachable.include?(child)

          reachable << child
          queue << child
        end
      end
      reachable
    end

    def duplicate_ids(items)
      items.filter_map { |item| item["id"] }.tally.select { |_id, count| count > 1 }.keys.sort
    end

    def string_error_check(id, errors, file)
      build_check(id, errors.map { |message| diagnostic(id, id, message, file: file) })
    end

    def build_check(id, diagnostics, boards: nil, metrics: nil)
      ordered = diagnostics.sort_by do |item|
        [item.fetch("severity", "error"), item["file"].to_s, item["board"].to_s, item["path"].to_s, item.fetch("code"), item.fetch("message")]
      end
      failed = ordered.any? { |item| item.fetch("severity", "error") == "error" }
      {
        "id" => id,
        "status" => failed ? "failed" : "passed",
        "diagnostics" => ordered,
      }.tap do |check|
        check["boards"] = boards if boards
        check["metrics"] = metrics if metrics
      end
    end

    def skipped_check(id, reason)
      {
        "id" => id,
        "status" => "skipped",
        "diagnostics" => [diagnostic(id, "dependency_failed", reason, severity: "warning")],
      }
    end

    def append_skipped(checks, ids, reason)
      ids.each { |id| checks << skipped_check(id, reason) }
    end

    def diagnostic(check, code, message, severity: "error", file: nil, path: nil, board: nil, entity_ref: nil)
      {
        "check" => check,
        "code" => code,
        "severity" => severity,
        "message" => message,
        "file" => file,
        "path" => path,
        "board" => board,
        "entity_ref" => entity_ref,
      }.compact
    end

    def safe_path(relative)
      path = File.expand_path(relative, @root)
      return nil unless path.start_with?("#{@root}/")

      path
    end
  end
end
