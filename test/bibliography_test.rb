# frozen_string_literal: true

require "minitest/autorun"
require "set"
require_relative "../lib/strict_yaml"

class BibliographyTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @registry = load_yaml("architectures/index.yaml")
    @bibliography = load_yaml(@registry.fetch("bibliography"))
    @source_ids = Set.new(@bibliography.fetch("sources").map { |source| source.fetch("id") })
  end

  def test_bibliography_owns_unique_source_metadata
    sources = @bibliography.fetch("sources")

    assert_equal "bibliography-v0.1", @bibliography.fetch("schema_version")
    assert_equal sources.length, @source_ids.length
    sources.each do |source|
      refute_empty source.fetch("title")
      assert source["url"] || source["path"], source.fetch("id")
      next unless source["kind"] == "code"

      assert_match(/\A[a-f0-9]{40}\z/, source["revision"], source.fetch("id"))
      assert_includes source.fetch("url"), source.fetch("revision"), source.fetch("id")
    end
  end

  def test_every_registered_source_reference_resolves
    registered_documents.each do |label, document|
      refs = collect(document) { |value| value["source_ref"] if value.is_a?(Hash) }

      refute_empty refs, label
      assert_empty Set.new(refs) - @source_ids, label
    end
  end

  def test_every_evidence_reference_has_a_typed_role
    registered_documents.each do |label, document|
      evidence_entries = collect(document) do |value|
        value["evidence"] if value.is_a?(Hash) && value["evidence"].is_a?(Hash)
      end
      evidence_entries.each do |evidence|
        Array(evidence["refs"]).each do |ref|
          assert @source_ids.include?(ref["source_ref"]), "#{label}: #{ref.inspect}"
          assert_match(/\A[a-z][a-z0-9_]*\z/, ref["role"], "#{label}: #{ref.inspect}")
        end
      end
    end
  end

  private

  def registered_documents
    @registry.fetch("source_sets").flat_map do |source_set|
      id = source_set.fetch("id")
      [
        ["#{id} architecture", load_yaml(source_set.fetch("architecture"))],
        ["#{id} pseudocode", load_yaml(source_set.fetch("pseudocode"))],
      ]
    end
  end

  def collect(value, &block)
    own = block.call(value)
    children = case value
               when Hash then value.values
               when Array then value
               else []
               end
    (own.nil? ? [] : [own]) + children.flat_map { |child| collect(child, &block) }
  end

  def load_yaml(path)
    StrictYaml.load_file(File.join(ROOT, path))
  end
end
