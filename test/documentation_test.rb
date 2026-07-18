# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/json_schema_subset"

class DocumentationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  CURRENT_PROTOCOLS = %w[
    architecture-language.md
    architecture-edit-language.md
    architecture-coverage.md
    architecture-projection-model.md
    bibliography.md
    fact-ownership.md
    id-evolution.md
    pseudocode-language.md
    renderer-architecture.md
    semantic-layout.md
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
      architecture-edit-v0.1.schema.json
      architecture-edit-v0.2.schema.json
      visualization-v0.4.schema.json
      bibliography-v0.1.schema.json
    ].each do |name|
      schema = JsonSchemaSubset.load(File.join(ROOT, "schemas", name))
      assert_equal "https://json-schema.org/draft/2020-12/schema", schema.fetch("$schema"), name
      assert_equal false, schema.fetch("additionalProperties"), name
    end
  end

  def test_agent_guide_routes_architecture_ports_through_the_supported_edit_boundary
    guide = File.read(File.join(ROOT, "AGENTS.md"))

    assert_includes guide, "### Porting a Method Architecture"
    assert_includes guide, "The **method repository**"
    assert_includes guide, "The **explainer repository**"
    assert_includes guide, "Architecture edit v0.2 cannot ingest"
    assert_includes guide, "run `prepare`, inspect `show`, and use"
  end

  def test_agent_guide_requires_the_source_set_verifier_after_ports
    guide = File.read(File.join(ROOT, "AGENTS.md"))
    validation = File.read(File.join(ROOT, "protocol/source-validation.md"))

    command = "ruby scripts/verify_architecture.rb --source-set <id>"
    assert_includes guide, command
    assert_includes validation, "## Agent-Facing Source-Set Verification"
    assert_includes validation, "it is not the final handoff gate"
    assert_includes validation, "does not inspect the method repository"
  end

  def test_renderer_docs_define_question_handoff_as_a_derived_context
    renderer = File.read(File.join(ROOT, "protocol/renderer-architecture.md"))

    assert_includes renderer, "### Question Handoff Context"
    assert_includes renderer, "architecture-question-context-v0.1"
    assert_includes renderer, "complete ordered `relation_path`"
    assert_includes renderer, "does not\nsend source content to a service"
  end

  def test_semantic_layout_docs_define_the_authoring_and_runtime_boundary
    layout = File.read(File.join(ROOT, "protocol/semantic-layout.md"))
    edit = File.read(File.join(ROOT, "protocol/architecture-edit-language.md"))

    assert_includes layout, "semantic_flow_v1"
    assert_includes layout, "conditioning and index context sits above"
    assert_includes layout, "feedback uses bottom rails"
    assert_includes layout, "browser measures the real card boxes"
    assert_includes edit, "### `layout_board` (v0.2)"
  end

  def test_visualization_docs_define_execution_backed_repeat_regions
    visualization = File.read(File.join(ROOT, "protocol/visualization-language.md"))

    assert_includes visualization, "## Repeat Regions"
    assert_includes visualization, "execution_ref: execution.loops.refinement_loop"
    assert_includes visualization, "`execution_ref` owns the iteration identity and repeat count"
    assert_includes visualization, "exactly one direct edge"
    assert_includes visualization, "disjoint or\nstrictly nested"
    assert_includes visualization, "The only current region kind is `repeat`"
  end

  def test_visualization_docs_define_typed_representation_lanes
    visualization = File.read(File.join(ROOT, "protocol/visualization-language.md"))

    assert_includes visualization, "kind: representation"
    assert_includes visualization, "representation_refs:"
    assert_includes visualization, "`row` is an authored grid rank"
    assert_includes visualization, "Projected relation\n`carries` remains the source of truth"
    assert_includes visualization, "Mixed-family flow stays"
  end

  def test_visualization_docs_define_opt_in_content_sized_rows
    visualization = File.read(File.join(ROOT, "protocol/visualization-language.md"))
    edit = File.read(File.join(ROOT, "protocol/architecture-edit-language.md"))

    assert_includes visualization, "`grid.row_sizing: content`"
    assert_includes visualization, "only that boundary grows"
    assert_includes visualization, "Typed representation lanes remain bound"
    assert_includes edit, "`row_sizing` and `row_gap` presentation settings are preserved"
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
