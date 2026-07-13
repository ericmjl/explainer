# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/json_schema_subset"

class DocumentationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  CURRENT_PROTOCOLS = %w[
    architecture-language.md
    architecture-coverage.md
    architecture-projection-model.md
    bibliography.md
    fact-ownership.md
    id-evolution.md
    pseudocode-language.md
    renderer-architecture.md
    source-validation.md
    standard-blocks.md
    visualization-language.md
  ].freeze

  def test_current_protocols_declare_their_status
    CURRENT_PROTOCOLS.each do |name|
      opening = File.readlines(File.join(ROOT, "protocol", name)).first(6).join
      assert_includes opening, "Status:", name
    end
  end

  def test_markdown_fences_and_yaml_examples_are_valid
    protocol_paths.each do |path|
      text = File.read(path)
      assert_even text.scan(/^```/).length, relative(path)
      text.scan(/```yaml\n(.*?)```/m).each_with_index do |(body), index|
        YAML.safe_load(body, aliases: true)
      rescue Psych::SyntaxError => e
        flunk "#{relative(path)} YAML block #{index + 1} is invalid: #{e.message}"
      end
    end
  end

  def test_repository_path_references_resolve
    documentation_paths.each do |path|
      File.read(path).scan(/`([^`]*\/[^`]+\.(?:md|yaml|json|rb|js|html))`/).flatten.each do |ref|
        next if ref.include?("*") || ref.include?("<") || ref.start_with?("http")

        candidates = [File.join(ROOT, ref), File.expand_path(ref, File.dirname(path))]
        assert candidates.any? { |candidate| File.exist?(candidate) },
          "#{relative(path)} references missing #{ref}"
      end
    end
  end

  def test_canonical_language_guides_use_current_contracts
    architecture = File.read(File.join(ROOT, "protocol/architecture-language.md"))
    visualization = File.read(File.join(ROOT, "protocol/visualization-language.md"))

    assert_includes architecture, "schema_version: architecture-v0.4"
    refute_match(/schema_version: architecture-v0\.[123]/, architecture)
    assert_includes visualization, "schema_version: visualization-v0.4"
    refute_match(/schema_version: visualization-v0\.[123]/, visualization)
    refute_includes visualization, "view_only: true"
    refute_match(/^\s+edges:/, visualization)
  end

  def test_executable_source_schemas_are_valid_json
    %w[
      architecture-v0.4.schema.json
      visualization-v0.4.schema.json
      bibliography-v0.1.schema.json
    ].each do |name|
      schema = JsonSchemaSubset.load(File.join(ROOT, "schemas", name))
      assert_equal "https://json-schema.org/draft/2020-12/schema", schema.fetch("$schema"), name
      assert_equal false, schema.fetch("additionalProperties"), name
    end
  end

  private

  def protocol_paths
    Dir[File.join(ROOT, "protocol", "*.md")]
  end

  def documentation_paths
    protocol_paths + %w[AGENTS.md CLAUDE.md README.md ROADMAP.md].map { |name| File.join(ROOT, name) }
  end

  def relative(path)
    path.delete_prefix("#{ROOT}/")
  end

  def assert_even(value, label)
    assert value.even?, "#{label} has unbalanced Markdown fences"
  end
end
