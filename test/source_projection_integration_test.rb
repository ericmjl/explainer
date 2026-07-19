# frozen_string_literal: true

require "minitest/autorun"
require "json"
require "digest"
require_relative "../lib/architecture_projection"
require_relative "../lib/standard_block_compiler"
require_relative "../lib/strict_yaml"

class SourceProjectionIntegrationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_every_registered_source_set_uses_and_compiles_the_derived_contract
    registry = load_yaml("architectures/index.yaml")

    registry.fetch("source_sets").each do |source_set|
      architecture = load_yaml(source_set.fetch("architecture"))
      view = load_yaml(source_set.fetch("view"))

      assert_equal "architecture-v0.4", architecture.fetch("schema_version"), source_set.fetch("id")
      assert_equal "visualization-v0.4", view.fetch("schema_version"), source_set.fetch("id")
      assert_compiled_interfaces(source_set.fetch("id"), architecture)

      Array(architecture["modules"]).each do |mod|
        refute mod.key?("inputs"), "#{source_set.fetch('id')}/#{mod.fetch('id')} duplicates relation-owned inputs"
        refute mod.key?("outputs"), "#{source_set.fetch('id')}/#{mod.fetch('id')} duplicates relation-owned outputs"
      end
      Array(architecture["conditioning"]).each do |conditioning|
        refute conditioning.key?("source"), "#{source_set.fetch('id')}/#{conditioning.fetch('id')} duplicates its relation source"
        refute conditioning.key?("target"), "#{source_set.fetch('id')}/#{conditioning.fetch('id')} duplicates its relation target"
      end
      Array(architecture["scale_transitions"]).each do |transition|
        %w[source target from_scale to_scale projection projection_refs index_map].each do |field|
          refute transition.key?(field), "#{source_set.fetch('id')}/#{transition.fetch('id')} duplicates derived #{field}"
        end
        refute_empty transition.fetch("relation_path")
      end
      Hash(architecture["state_semantics"]).each do |group_id, semantics|
        %w[role produced_by consumed_by updated_by].each do |field|
          refute semantics.key?(field), "#{source_set.fetch('id')}/#{group_id} duplicates #{field}"
        end
      end

      projector = ArchitectureProjection::Projector.new(architecture)
      blocks_by_path = Array(source_set["standard_blocks"]).to_h do |path|
        [path, load_yaml(path)]
      end
      compiled_boards = StandardBlockCompiler::Catalog.new(blocks_by_path: blocks_by_path).compile_boards(
        architecture,
        view.fetch("boards"),
        registered_blocks: source_set["standard_blocks"],
      )
      projections = compiled_boards.filter_map do |board|
        refute board.key?("scale_lanes"), "#{source_set.fetch('id')}/#{board.fetch('id')} uses legacy renderer lanes"
        if board["kind"] == "standard_block_instance"
          assert_equal "standard_block_template", board.fetch("projectionMode")
          refute_empty board.fetch("nodes")
          refute_empty board.fetch("edges")
          assert board.fetch("edges").all? do |edge|
            %w[standard_block_template canonical_relation_path].include?(edge.fetch("grounding"))
          end
          next
        end
        refute board.key?("edges"), "#{source_set.fetch('id')}/#{board.fetch('id')} re-authors semantic edges"
        projection = projector.project(board)
        refute_empty projection.fetch("edges"), "#{source_set.fetch('id')}/#{board.fetch('id')} has no projected flow"
        assert projection.fetch("edges").all? { |edge| edge.fetch("origin") == "canonical" }
        assert projection.fetch("edges").all? { |edge| !edge.fetch("relation_path").empty? }
        [board.fetch("id"), projection]
      end.to_h

      root = projections.fetch(view.fetch("root_board"))
      boundary_refs = architecture.fetch("value_sites").filter_map do |site|
        "value_sites.#{site.fetch('id')}" if site["boundary"]
      end
      visible_root_refs = root.fetch("nodes").map { |node| node.fetch("ref") }
      assert_empty boundary_refs - visible_root_refs, "#{source_set.fetch('id')} root omits task boundaries"
    end
  end

  private

  def assert_compiled_interfaces(source_set_id, architecture)
    manifest = load_manifest(source_set_id)
    compiled = manifest.fetch("architecture")
    assert_equal "architecture-manifest-v0.4", manifest.fetch("schemaVersion")
    assert_equal architecture.fetch("family"), compiled.fetch("family")
    assert_equal architecture.fetch("task_modes"), compiled.fetch("taskModes")
    assert_equal architecture.fetch("open_questions"), compiled.fetch("openQuestions")
    if architecture.key?("reference_configuration")
      assert_equal architecture.fetch("reference_configuration"), compiled.fetch("referenceConfiguration")
    else
      assert_nil compiled["referenceConfiguration"]
    end
    manifest.fetch("build").fetch("inputDigests").each do |path, digest|
      assert_equal Digest::SHA256.file(File.join(ROOT, path)).hexdigest, digest, path
    end
    coverage = compiled.fetch("coverage")
    assert_equal "declared_decomposition_closure", coverage.fetch("method")
    assert_equal architecture.fetch("modules").length + 1,
      coverage.fetch("summary").fetch("scopeCount")
    refute coverage.fetch("summary").key?("percentage")
    relations = architecture.fetch("relations").to_h do |relation|
      ["relations.#{relation.fetch('id')}", relation]
    end

    compiled.fetch("conditioning").each do |conditioning|
      relation = relations.fetch(conditioning.fetch("relation_ref"))
      assert_equal relation.fetch("from"), conditioning.fetch("source")
      assert_equal relation.fetch("to"), conditioning.fetch("target")
    end

    architecture.fetch("value_sites").each do |site|
      site_ref = "value_sites.#{site.fetch('id')}"
      interface = compiled.fetch("valueSiteInterfaces").fetch(site.fetch("id"))
      expected_producers = architecture.fetch("relations").filter_map do |relation|
        relation.fetch("from") if relation.fetch("to") == site_ref
      end
      expected_consumers = architecture.fetch("relations").filter_map do |relation|
        relation.fetch("to") if relation.fetch("from") == site_ref
      end
      assert_equal expected_producers.uniq, interface.fetch("producerRefs")
      assert_equal expected_consumers.uniq, interface.fetch("consumerRefs")
    end

    compiled_transitions = compiled.fetch("scaleTransitions").to_h { |item| [item.fetch("id"), item] }
    architecture.fetch("scale_transitions").each do |transition|
      first_relation = relations.fetch(transition.fetch("relation_path").first)
      last_relation = relations.fetch(transition.fetch("relation_path").last)
      compiled_transition = compiled_transitions.fetch(transition.fetch("id"))
      assert_equal first_relation.fetch("from"), compiled_transition.fetch("source")
      assert_equal last_relation.fetch("to"), compiled_transition.fetch("target")
    end
  end

  def load_manifest(source_set_id)
    source = File.read(File.join(ROOT, "renderer/architecture/manifest-#{source_set_id}.js"))
    JSON.parse(source.sub(/\Aexport const manifest = /, "").sub(/;\s*\z/, ""))
  end

  def load_yaml(path)
    StrictYaml.load_file(File.join(ROOT, path))
  end
end
