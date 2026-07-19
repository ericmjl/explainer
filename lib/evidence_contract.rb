# frozen_string_literal: true

require "set"

# Cross-document evidence checks that JSON Schema cannot express: certainty
# must be supported by an appropriate bibliography source kind, and confirmed
# facts need a stable locator within that source.
module EvidenceContract
  STATUSES = Set[
    "confirmed_from_code",
    "confirmed_from_paper",
    "confirmed_from_docs",
    "inferred",
    "open_question",
  ].freeze
  SOURCE_KINDS = {
    "confirmed_from_code" => Set["code"],
    "confirmed_from_paper" => Set["paper"],
    "confirmed_from_docs" => Set["docs", "spec", "source", "protocol"],
  }.freeze

  module_function

  def errors(evidence, bibliography_sources, label: "fact")
    return ["#{label} missing evidence"] unless evidence.is_a?(Hash)

    errors = []
    status = evidence["status"]
    errors << "#{label} missing evidence.status" unless status
    errors << "#{label} has invalid evidence.status #{status.inspect}" if status && !STATUSES.include?(status)
    refs = evidence["refs"]
    errors << "#{label} missing evidence.refs" if !refs.is_a?(Array) || refs.empty?
    return errors unless SOURCE_KINDS.key?(status) && refs.is_a?(Array)

    expected = SOURCE_KINDS.fetch(status)
    matching = refs.select do |ref|
      source = bibliography_sources[ref["source_ref"]]
      source && expected.include?(source["kind"])
    end
    errors << "#{label} status #{status} requires a #{expected.to_a.join(' or ')} source" if matching.empty?
    if matching.any? && matching.none? { |ref| ref["locator"].is_a?(String) && !ref["locator"].strip.empty? }
      errors << "#{label} status #{status} requires a locator for #{matching.first['source_ref']}"
    end
    errors
  end
end
