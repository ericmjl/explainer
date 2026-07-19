# frozen_string_literal: true

require "set"

require_relative "evidence_contract"
require_relative "json_schema_subset"
require_relative "standard_block_compiler"

# Structural and cross-source validation for curated comparisons. A comparison
# never owns architecture facts: its subjects point at registered source sets,
# and its alignments point at facts that already exist on each subject board.
module ArchitectureComparisonContract
  ROOT = File.expand_path("..", __dir__)
  COMPARISON_SCHEMA = "schemas/architecture-comparison-v0.1.schema.json"
  REGISTRY_SCHEMA = "schemas/comparison-registry-v0.1.schema.json"
  Diagnostic = JsonSchemaSubset::Diagnostic

  class ValidationError < StandardError
    attr_reader :diagnostics

    def initialize(diagnostics)
      @diagnostics = diagnostics
      super(diagnostics.map(&:to_s).join("; "))
    end
  end

  class ResolutionError < StandardError
    attr_reader :code

    def initialize(code, message)
      @code = code
      super(message)
    end
  end

  # Resolves comparison references against the exact compiled boards used by
  # the audience renderer. This is intentionally shared by validation and
  # compilation so a valid alignment cannot later become an unhighlightable
  # renderer-only guess.
  class Resolver
    def initialize(source_sets:)
      @source_sets = source_sets
      @compiled = {}
    end

    def resolve_subject(subject)
      source_set_id = subject.fetch("source_set")
      source_set = compiled_source_set(source_set_id)
      subject_ref = subject.fetch("subject_ref")
      board_ref = subject.fetch("board_ref")
      board = source_set.fetch(:boards_by_id)[board_ref]
      raise ResolutionError.new("unknown_comparison_board", "cannot resolve board #{board_ref.inspect} in #{source_set_id}") unless board

      resolved_fact = resolve_subject_fact(source_set, subject_ref)
      if subject_ref.start_with?("block_instances.")
        expected = board["blockInstanceRef"] || board["block_instance_ref"]
        unless expected == subject_ref
          raise ResolutionError.new(
            "comparison_subject_board_mismatch",
            "board #{board_ref} expands #{expected.inspect}, not #{subject_ref}",
          )
        end
      end

      {
        "label" => subject.fetch("label"),
        "sourceSet" => source_set_id,
        "subjectRef" => subject_ref,
        "boardRef" => board_ref,
        "boardTitle" => board["title"],
        "kind" => resolved_fact.fetch("kind"),
        "blockInstance" => resolved_fact["blockInstance"],
      }.compact
    end

    def resolve_fact(subject, fact_ref)
      source_set = compiled_source_set(subject.fetch("source_set"))
      subject_ref = subject.fetch("subject_ref")
      board = source_set.fetch(:boards_by_id).fetch(subject.fetch("board_ref"))

      if subject_ref.start_with?("block_instances.")
        unless fact_ref.start_with?("#{subject_ref}.")
          raise ResolutionError.new(
            "comparison_fact_outside_subject",
            "#{fact_ref} is not scoped to #{subject_ref}",
          )
        end
        return resolve_block_instance_fact(source_set, board, fact_ref)
      end

      resolve_canonical_fact(source_set, board, fact_ref)
    end

    private

    def compiled_source_set(source_set_id)
      return @compiled.fetch(source_set_id) if @compiled.key?(source_set_id)

      entry = @source_sets[source_set_id]
      raise ResolutionError.new("unknown_comparison_source_set", "cannot resolve source set #{source_set_id.inspect}") unless entry

      architecture = fetch_entry(entry, "architecture")
      view = fetch_entry(entry, "view")
      blocks_by_path = fetch_entry(entry, "blocks_by_path") || {}
      registered_blocks = fetch_entry(entry, "registered_blocks") || blocks_by_path.keys
      catalog = StandardBlockCompiler::Catalog.new(blocks_by_path: blocks_by_path)
      instances = catalog.compile_instances(architecture, registered_blocks: registered_blocks)
      boards = catalog.compile_boards(
        architecture,
        Array(view["boards"]),
        registered_blocks: registered_blocks,
      )
      @compiled[source_set_id] = {
        architecture: architecture,
        instances_by_ref: instances.to_h { |item| ["block_instances.#{item.fetch('id')}", item] },
        boards_by_id: boards.to_h { |item| [item.fetch("id"), item] },
      }
    rescue KeyError => e
      raise ResolutionError.new(
        "invalid_comparison_source_set",
        "source set #{source_set_id.inspect} is missing required compilation input: #{e.message}",
      )
    rescue StandardBlockContract::ValidationError, StandardBlockCompiler::CompileError => e
      raise ResolutionError.new(
        "invalid_comparison_source_set",
        "source set #{source_set_id.inspect} cannot compile reusable boards: #{e.message}",
      )
    end

    def fetch_entry(entry, key)
      entry[key] || entry[key.to_sym]
    end

    def resolve_subject_fact(source_set, subject_ref)
      if subject_ref.start_with?("block_instances.")
        instance = source_set.fetch(:instances_by_ref)[subject_ref]
        raise ResolutionError.new("unknown_comparison_subject", "cannot resolve #{subject_ref}") unless instance

        return {
          "kind" => "block_instance",
          "blockInstance" => instance,
        }
      end

      resolved = canonical_fact(source_set.fetch(:architecture), subject_ref)
      raise ResolutionError.new("unknown_comparison_subject", "cannot resolve #{subject_ref}") unless resolved

      { "kind" => subject_ref.split(".", 2).first.delete_suffix("s"), "fact" => resolved }
    end

    def resolve_block_instance_fact(source_set, board, fact_ref)
      components = fact_ref.split(".")
      unless components.length == 4 && %w[ports values steps].include?(components[2])
        raise ResolutionError.new(
          "invalid_comparison_fact_ref",
          "#{fact_ref} must name one compiled block-instance port, value, or step",
        )
      end

      instance_ref = components.first(2).join(".")
      instance = source_set.fetch(:instances_by_ref)[instance_ref]
      raise ResolutionError.new("unknown_comparison_fact", "cannot resolve #{fact_ref}") unless instance

      template_fact_ref = ["standard_blocks", instance.fetch("standardBlockId"), components[2], components[3]].join(".")
      nodes = Array(board["nodes"]).select { |node| node["template_fact_ref"] == template_fact_ref }
      if nodes.empty?
        raise ResolutionError.new(
          "unknown_comparison_fact",
          "#{fact_ref} is not active on compiled board #{board.fetch('id')}",
        )
      end
      pseudocode = Array(instance["pseudocode"]).find { |step| step["instanceFactRef"] == fact_ref }
      exemplar = nodes.first
      {
        "factRef" => fact_ref,
        "kind" => components[2].delete_suffix("s"),
        "label" => pseudocode&.dig("label") || exemplar["label"],
        "nodeIds" => nodes.map { |node| node.fetch("id") },
        "templateFactRef" => template_fact_ref,
        "blockInstanceRef" => instance_ref,
      }.compact
    end

    def resolve_canonical_fact(source_set, board, fact_ref)
      fact = canonical_fact(source_set.fetch(:architecture), fact_ref)
      raise ResolutionError.new("unknown_comparison_fact", "cannot resolve #{fact_ref}") unless fact

      nodes = Array(board["nodes"]).select { |node| node["ref"] == fact_ref }
      {
        "factRef" => fact_ref,
        "kind" => fact_ref.split(".", 2).first.delete_suffix("s"),
        "label" => fact["label"] || fact["id"],
        "nodeIds" => nodes.map { |node| node.fetch("id") },
      }
    end

    def canonical_fact(architecture, fact_ref)
      collection, id, extra = fact_ref.split(".", 3)
      return nil if extra || !%w[modules value_sites relations representations].include?(collection)

      Array(architecture[collection]).find { |fact| fact["id"] == id }
    end
  end

  module_function

  def errors(comparison, source_sets:, bibliography_sources: nil, resolver: nil)
    diagnostics = schema_errors(comparison, COMPARISON_SCHEMA)
    return diagnostics unless diagnostics.empty?

    resolver ||= Resolver.new(source_sets: source_sets)
    diagnostics.concat(duplicate_id_errors(comparison.fetch("groups"), "$.groups", "comparison group"))
    diagnostics.concat(duplicate_id_errors(comparison.fetch("alignments"), "$.alignments", "alignment"))
    diagnostics.concat(duplicate_id_errors(comparison.fetch("findings"), "$.findings", "finding"))
    diagnostics.concat(duplicate_id_errors(comparison.fetch("open_questions"), "$.open_questions", "open question"))

    resolved_subjects = {}
    comparison.fetch("subjects").each do |side, subject|
      resolved_subjects[side] = resolver.resolve_subject(subject)
    rescue ResolutionError => e
      diagnostics << diagnostic(e.code, "$.subjects.#{side}", e.message)
    end

    groups = comparison.fetch("groups").to_h { |group| ["groups.#{group.fetch('id')}", group] }
    alignments = comparison.fetch("alignments")
    alignment_refs = alignments.to_h { |item| ["alignments.#{item.fetch('id')}", item] }
    used_groups = Set.new
    alignments.each_with_index do |alignment, index|
      path = "$.alignments[#{index}]"
      group_ref = alignment.fetch("group_ref")
      if groups.key?(group_ref)
        used_groups << group_ref
      else
        diagnostics << diagnostic("unknown_comparison_group", "#{path}.group_ref", "cannot resolve #{group_ref}")
      end
      diagnostics.concat(alignment_side_errors(alignment, path))
      %w[primary counterpart].each do |side|
        next unless resolved_subjects[side]

        subject = comparison.dig("subjects", side)
        alignment.fetch("#{side}_refs").each_with_index do |fact_ref, ref_index|
          resolver.resolve_fact(subject, fact_ref)
        rescue ResolutionError => e
          diagnostics << diagnostic(e.code, "#{path}.#{side}_refs[#{ref_index}]", e.message)
        end
      end
      diagnostics.concat(evidence_errors(alignment.fetch("evidence"), bibliography_sources, "#{path}.evidence"))
    end
    (groups.keys.to_set - used_groups).sort.each do |group_ref|
      diagnostics << diagnostic("unused_comparison_group", "$.groups", "#{group_ref} has no alignments")
    end

    comparison.fetch("findings").each_with_index do |finding, index|
      path = "$.findings[#{index}]"
      finding.fetch("alignment_refs").each_with_index do |ref, ref_index|
        next if alignment_refs.key?(ref)

        diagnostics << diagnostic(
          "unknown_comparison_alignment", "#{path}.alignment_refs[#{ref_index}]", "cannot resolve #{ref}",
        )
      end
      diagnostics.concat(evidence_errors(finding.fetch("evidence"), bibliography_sources, "#{path}.evidence"))
    end
    comparison.fetch("open_questions").each_with_index do |question, index|
      diagnostics.concat(evidence_errors(
        question.fetch("evidence"), bibliography_sources, "$.open_questions[#{index}].evidence",
      ))
    end
    diagnostics
  end

  def validate!(comparison, source_sets:, bibliography_sources: nil, resolver: nil)
    diagnostics = errors(
      comparison,
      source_sets: source_sets,
      bibliography_sources: bibliography_sources,
      resolver: resolver,
    )
    raise ValidationError, diagnostics unless diagnostics.empty?

    comparison
  end

  def registry_errors(registry, comparisons_by_path: nil)
    diagnostics = schema_errors(registry, REGISTRY_SCHEMA)
    return diagnostics unless diagnostics.empty?
    return diagnostics unless comparisons_by_path

    ids = {}
    registry.fetch("sources", []).each_with_index do |path, index|
      comparison = comparisons_by_path[path]
      unless comparison
        diagnostics << diagnostic(
          "missing_comparison_source", "$.sources[#{index}]", "cannot load registered source #{path}",
        )
        next
      end
      id = comparison["id"]
      if ids.key?(id)
        diagnostics << diagnostic(
          "duplicate_comparison_id", "$.sources[#{index}]", "#{id.inspect} is also owned by #{ids.fetch(id)}",
        )
      else
        ids[id] = path
      end
    end
    diagnostics
  end

  def validate_registry!(registry, comparisons_by_path: nil)
    diagnostics = registry_errors(registry, comparisons_by_path: comparisons_by_path)
    raise ValidationError, diagnostics unless diagnostics.empty?

    registry
  end

  def schema_errors(document, relative_path)
    schema = JsonSchemaSubset.load(File.join(ROOT, relative_path))
    JsonSchemaSubset.errors(document, schema)
  end
  private_class_method :schema_errors

  def alignment_side_errors(alignment, path)
    primary = alignment.fetch("primary_refs")
    counterpart = alignment.fetch("counterpart_refs")
    relationship = alignment.fetch("relationship")
    valid = case relationship
    when "equivalent", "analogous", "changed"
      !primary.empty? && !counterpart.empty?
    when "primary_only"
      !primary.empty? && counterpart.empty?
    when "counterpart_only"
      primary.empty? && !counterpart.empty?
    else
      false
    end
    return [] if valid

    [diagnostic(
      "invalid_comparison_sides", path,
      "#{relationship} has incompatible primary/counterpart fact lists",
    )]
  end
  private_class_method :alignment_side_errors

  def evidence_errors(evidence, bibliography_sources, path)
    return [] unless bibliography_sources

    sources = if bibliography_sources.is_a?(Array)
      bibliography_sources.to_h { |source| [source.fetch("id"), source] }
    else
      bibliography_sources
    end
    EvidenceContract.errors(evidence, sources, label: path).map do |message|
      diagnostic("invalid_comparison_evidence", path, message)
    end
  end
  private_class_method :evidence_errors

  def duplicate_id_errors(items, path, label)
    Array(items).filter_map.with_index do |item, index|
      id = item["id"]
      next unless id && Array(items).first(index).any? { |candidate| candidate["id"] == id }

      diagnostic("duplicate_comparison_id", "#{path}[#{index}].id", "duplicate #{label} id #{id.inspect}")
    end
  end
  private_class_method :duplicate_id_errors

  def diagnostic(code, path, message)
    Diagnostic.new(code, path, message)
  end
  private_class_method :diagnostic
end
