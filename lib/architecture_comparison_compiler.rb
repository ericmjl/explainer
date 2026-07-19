# frozen_string_literal: true

require_relative "architecture_comparison_contract"

# Deterministically turns a curated comparison into renderer-ready subject and
# alignment metadata. It does not copy either board; source-set manifests remain
# the owner of board scenes.
module ArchitectureComparisonCompiler
  COMPILER_VERSION = "architecture-comparison-compiler-v0.1"

  class Compiler
    def initialize(source_sets:, bibliography_sources: nil)
      @source_sets = source_sets
      @bibliography_sources = bibliography_sources
      @resolver = ArchitectureComparisonContract::Resolver.new(source_sets: source_sets)
    end

    def compile(comparison)
      ArchitectureComparisonContract.validate!(
        comparison,
        source_sets: @source_sets,
        bibliography_sources: @bibliography_sources,
        resolver: @resolver,
      )
      subjects = comparison.fetch("subjects").transform_values do |subject|
        @resolver.resolve_subject(subject).then { |resolved| compile_subject(resolved) }
      end
      alignments = comparison.fetch("alignments").map do |alignment|
        compile_alignment(comparison, alignment)
      end
      groups = comparison.fetch("groups").map do |group|
        group_ref = "groups.#{group.fetch('id')}"
        group.merge(
          "alignmentRefs" => alignments.filter_map do |alignment|
            "alignments.#{alignment.fetch('id')}" if alignment.fetch("groupRef") == group_ref
          end,
        )
      end

      {
        "schemaVersion" => comparison.fetch("schema_version"),
        "compilerVersion" => COMPILER_VERSION,
        "id" => comparison.fetch("id"),
        "title" => comparison.fetch("title"),
        "status" => comparison.fetch("status"),
        "question" => comparison.fetch("question"),
        "summary" => comparison.fetch("summary"),
        "subjects" => subjects,
        "groups" => groups,
        "alignments" => alignments,
        "findings" => comparison.fetch("findings").map { |finding| compile_finding(finding) },
        "openQuestions" => comparison.fetch("open_questions"),
      }
    end

    def compile_registry(registry, comparisons_by_path:)
      ArchitectureComparisonContract.validate_registry!(registry, comparisons_by_path: comparisons_by_path)
      registry.fetch("sources").map { |path| compile(comparisons_by_path.fetch(path)) }
    end

    private

    def compile_subject(resolved)
      instance = resolved.delete("blockInstance")
      return resolved unless instance

      resolved.merge(
        "standardBlockId" => instance.fetch("standardBlockId"),
        "standardBlockRef" => instance.fetch("standardBlockRef"),
        "variant" => instance.fetch("variant"),
        "variantLabel" => instance.fetch("variantLabel"),
        "conformance" => instance.fetch("conformance"),
        "differenceSummary" => instance["differenceSummary"],
      ).compact
    end

    def compile_alignment(comparison, alignment)
      {
        "id" => alignment.fetch("id"),
        "groupRef" => alignment.fetch("group_ref"),
        "label" => alignment.fetch("label"),
        "relationship" => alignment.fetch("relationship"),
        "explanation" => alignment.fetch("explanation"),
        "primaryFacts" => compile_facts(comparison, alignment, "primary"),
        "counterpartFacts" => compile_facts(comparison, alignment, "counterpart"),
        "evidence" => alignment.fetch("evidence"),
      }
    end

    def compile_facts(comparison, alignment, side)
      subject = comparison.dig("subjects", side)
      alignment.fetch("#{side}_refs").map { |fact_ref| @resolver.resolve_fact(subject, fact_ref) }
    end

    def compile_finding(finding)
      {
        "id" => finding.fetch("id"),
        "statement" => finding.fetch("statement"),
        "alignmentRefs" => finding.fetch("alignment_refs"),
        "evidence" => finding.fetch("evidence"),
      }
    end
  end

  module_function

  def compile(comparison, source_sets:, bibliography_sources: nil)
    Compiler.new(
      source_sets: source_sets,
      bibliography_sources: bibliography_sources,
    ).compile(comparison)
  end
end
