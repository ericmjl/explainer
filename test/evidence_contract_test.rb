# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/evidence_contract"

class EvidenceContractTest < Minitest::Test
  SOURCES = {
    "code" => { "id" => "code", "kind" => "code" },
    "paper" => { "id" => "paper", "kind" => "paper" },
  }.freeze

  def test_confirmed_status_requires_a_compatible_source_kind
    evidence = {
      "status" => "confirmed_from_code",
      "refs" => [{ "source_ref" => "paper", "role" => "supporting_evidence", "locator" => "Sec. 3" }],
    }

    errors = EvidenceContract.errors(evidence, SOURCES, label: "module x")
    assert_includes errors, "module x status confirmed_from_code requires a code source"
  end

  def test_confirmed_status_requires_a_locator
    evidence = {
      "status" => "confirmed_from_code",
      "refs" => [{ "source_ref" => "code", "role" => "implementation_evidence" }],
    }

    errors = EvidenceContract.errors(evidence, SOURCES, label: "relation x")
    assert_includes errors, "relation x status confirmed_from_code requires a locator for code"
  end

  def test_one_precise_compatible_reference_can_confirm_the_fact
    sources = SOURCES.merge("code_context" => { "id" => "code_context", "kind" => "code" })
    evidence = {
      "status" => "confirmed_from_code",
      "refs" => [
        { "source_ref" => "code_context", "role" => "context" },
        { "source_ref" => "code", "role" => "implementation_evidence", "locator" => "Model.forward" },
      ],
    }

    assert_empty EvidenceContract.errors(evidence, sources)
  end

  def test_inferred_evidence_does_not_claim_source_kind_confirmation
    evidence = {
      "status" => "inferred",
      "refs" => [{ "source_ref" => "paper", "role" => "scaffold_evidence" }],
    }

    assert_empty EvidenceContract.errors(evidence, SOURCES)
  end
end
