# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/architecture_ownership"

class ArchitectureOwnershipTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @architecture = YAML.load_file(
      File.join(ROOT, "architectures/generic-feature-refinement.yaml"),
      aliases: true,
    )
  end

  def test_current_source_obeys_one_owner_contract
    assert_empty ArchitectureOwnership.errors(@architecture)
  end

  def test_rejects_conditioning_endpoint_copy
    architecture = copy(@architecture)
    architecture.fetch("conditioning").first["source"] = "value_sites.conditioning_signal"

    assert_includes ArchitectureOwnership.errors(architecture),
      "conditioning item_adaln re-owns relation endpoint source"
  end

  def test_rejects_module_interface_copy
    architecture = copy(@architecture)
    architecture.fetch("modules").first["inputs"] = ["value_sites.raw_records_input"]

    assert_includes ArchitectureOwnership.errors(architecture),
      "module input_adapter re-owns relation-derived inputs"
  end

  def test_rejects_state_producer_copy
    architecture = copy(@architecture)
    architecture.fetch("state_semantics").fetch("item_state")["produced_by"] = "modules.input_adapter"

    assert_includes ArchitectureOwnership.errors(architecture),
      "state_semantics item_state re-owns relation/value-site field produced_by"
  end

  def test_rejects_scale_endpoint_copy
    architecture = copy(@architecture)
    architecture.fetch("scale_transitions").first["source"] = "value_sites.item_state_after_encoder"

    assert_includes ArchitectureOwnership.errors(architecture),
      "scale transition item_to_group_pool re-owns relation-derived field source"
  end

  def test_rejects_discontinuous_scale_path
    architecture = copy(@architecture)
    architecture.fetch("scale_transitions").first["relation_path"][1] =
      "relations.output_heads_produce_predictions"

    assert ArchitectureOwnership.errors(architecture).any? { |error| error.include?("relation_path is discontinuous") }
  end

  private

  def copy(value)
    Marshal.load(Marshal.dump(value))
  end
end
