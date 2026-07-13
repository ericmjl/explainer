# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/architecture_coverage"

class ArchitectureCoverageTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_registered_architectures_have_valid_explicit_coverage
    %w[generic-feature-refinement diffusion-transformer].each do |name|
      architecture = load_architecture(name)
      assert_empty ArchitectureCoverage.errors(architecture), name
    end
  end

  def test_compiles_dit_scope_and_frontier_counts_without_a_percentage
    coverage = ArchitectureCoverage.compile(load_architecture("diffusion-transformer"))
    summary = coverage.fetch("summary")

    assert_equal "declared_decomposition_closure", coverage.fetch("method")
    assert_equal 26, summary.fetch("scopeCount")
    assert_equal 5, summary.fetch("expandedScopeCount")
    assert_equal 5, summary.fetch("completeExpandedScopeCount")
    assert_equal 0, summary.fetch("partialScopeCount")
    assert_equal 20, summary.fetch("leafFrontierCount")
    assert_equal 1, summary.fetch("opaqueFrontierCount")
    assert_equal 4, summary.fetch("maximumAuthoredDepth")
    assert_equal ["modules.frozen_vae_decoder"], coverage.fetch("opaqueFrontierRefs")
    refute summary.key?("percentage")
  end

  def test_requires_every_module_to_declare_decomposition
    architecture = copy(load_architecture("generic-feature-refinement"))
    architecture.fetch("modules").first.delete("decomposition")

    assert_includes ArchitectureCoverage.errors(architecture),
      "modules.input_adapter missing decomposition"
  end

  def test_rejects_leaf_with_children
    architecture = copy(load_architecture("generic-feature-refinement"))
    module_by_id(architecture, "item_encoder").fetch("decomposition")["status"] = "leaf"

    assert ArchitectureCoverage.errors(architecture).any? { |error| error.include?("modules.item_encoder is leaf but owns child modules") }
  end

  def test_rejects_complete_scope_without_children
    architecture = copy(load_architecture("generic-feature-refinement"))
    module_by_id(architecture, "input_adapter").fetch("decomposition")["status"] = "complete"

    assert_includes ArchitectureCoverage.errors(architecture),
      "modules.input_adapter is complete but declares no child modules; use leaf or opaque"
  end

  def test_requires_reasons_for_partial_and_opaque_scopes
    %w[partial opaque].each do |status|
      architecture = copy(load_architecture("generic-feature-refinement"))
      module_by_id(architecture, "input_adapter")["decomposition"] = { "status" => status }

      assert_includes ArchitectureCoverage.errors(architecture),
        "modules.input_adapter decomposition status #{status} requires a reason"
    end
  end

  private

  def load_architecture(name)
    YAML.load_file(File.join(ROOT, "architectures/#{name}.yaml"), aliases: true)
  end

  def module_by_id(architecture, id)
    architecture.fetch("modules").find { |mod| mod.fetch("id") == id }
  end

  def copy(value)
    Marshal.load(Marshal.dump(value))
  end
end
