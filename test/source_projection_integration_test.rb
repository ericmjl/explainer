# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/architecture_projection"

class SourceProjectionIntegrationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_every_registered_source_set_uses_and_compiles_the_derived_contract
    registry = load_yaml("architectures/index.yaml")

    registry.fetch("source_sets").each do |source_set|
      architecture = load_yaml(source_set.fetch("architecture"))
      view = load_yaml(source_set.fetch("view"))

      assert_equal "architecture-v0.3", architecture.fetch("schema_version"), source_set.fetch("id")
      assert_equal "visualization-v0.4", view.fetch("schema_version"), source_set.fetch("id")

      projector = ArchitectureProjection::Projector.new(architecture)
      projections = view.fetch("boards").to_h do |board|
        refute board.key?("edges"), "#{source_set.fetch('id')}/#{board.fetch('id')} re-authors semantic edges"
        projection = projector.project(board)
        refute_empty projection.fetch("edges"), "#{source_set.fetch('id')}/#{board.fetch('id')} has no projected flow"
        assert projection.fetch("edges").all? { |edge| edge.fetch("origin") == "canonical" }
        assert projection.fetch("edges").all? { |edge| !edge.fetch("relation_path").empty? }
        [board.fetch("id"), projection]
      end

      root = projections.fetch(view.fetch("root_board"))
      boundary_refs = architecture.fetch("value_sites").filter_map do |site|
        "value_sites.#{site.fetch('id')}" if site["boundary"]
      end
      visible_root_refs = root.fetch("nodes").map { |node| node.fetch("ref") }
      assert_empty boundary_refs - visible_root_refs, "#{source_set.fetch('id')} root omits task boundaries"
    end
  end

  private

  def load_yaml(path)
    YAML.load_file(File.join(ROOT, path), aliases: true)
  end
end
