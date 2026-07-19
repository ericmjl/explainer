# frozen_string_literal: true

require "minitest/autorun"
require "yaml"
require_relative "../lib/json_schema_subset"

class DocumentationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  CURRENT_PROTOCOLS = %w[
    architecture-language.md
    architecture-comparison-protocol.md
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
      architecture-comparison-v0.1.schema.json
      comparison-registry-v0.1.schema.json
      standard-block-v0.2.schema.json
      pseudocode-v0.2.schema.json
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

  def test_comparison_docs_define_source_compiler_renderer_and_url_boundaries
    guide = File.read(File.join(ROOT, "AGENTS.md"))
    renderer = File.read(File.join(ROOT, "protocol/renderer-architecture.md"))
    validation = File.read(File.join(ROOT, "protocol/source-validation.md"))

    assert_includes guide, "## Comparison Authoring Rules"
    assert_includes guide, "Never align by display label, node position"
    assert_includes guide, "### Authoring a Comparison"
    assert_includes guide, "comparisonIndex"

    assert_includes renderer, "### Shareable Comparison Links"
    assert_includes renderer, "&compare_arch=genie3"
    assert_includes renderer, "at most one of `node` and `compare_node`"
    assert_includes renderer, "not a third graph and not a copied scene"

    assert_includes validation, "schemas/architecture-comparison-v0.1.schema.json"
    assert_includes validation, "architecture-comparison-compiler-v0.1"
    assert_includes validation, "never copies either\nmanifest-owned board scene"
    assert_includes validation, "test/renderer_comparison_workspace_test.rb"
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

  def test_publication_docs_require_the_allowlisted_dist_boundary
    readme = File.read(File.join(ROOT, "README.md"))
    protocol = File.read(File.join(ROOT, "protocol/README.md"))
    agent_guide = File.read(File.join(ROOT, "AGENTS.md"))

    assert_includes readme, "## Current Contract Versions"
    assert_includes readme, "python3 -m http.server 8096 --directory dist"
    assert_includes readme, "Never serve the repository root"
    assert_includes readme, "one shared content fingerprint"
    assert_includes readme, "ruby scripts/build_pages.rb --source-set genie3"
    assert_includes protocol, "audience-only dist/"
    assert_includes protocol, "Never deploy or serve the repository root"
    assert_includes protocol, "deployment-consistent"
    assert_includes protocol, "--source-set <id>"
    assert_includes agent_guide, "test/pages_build_test.rb"
  end

  def test_renderer_docs_cover_direct_touch_pinch_and_trackpad_zoom
    readme = File.read(File.join(ROOT, "README.md"))
    renderer = File.read(File.join(ROOT, "protocol/renderer-architecture.md"))

    assert_includes readme, "two-finger pinch zoom"
    assert_includes readme, "two-finger trackpad scroll"
    assert_includes renderer, "direct-touch two-finger pinch/pan"
    assert_includes renderer, "can begin over a card without activating it"
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

  def test_architecture_docs_define_evidence_bearing_dictionary_field_groups
    architecture = File.read(File.join(ROOT, "protocol/architecture-language.md"))

    assert_includes architecture, "may declare evidence-bearing `field_groups`"
    assert_includes architecture, "fields: [cond_seq_mask, cond_struct_mask, cond_interface_mask]"
    assert_includes architecture, "The browser renders these groups as a field table"
    assert_includes architecture, "`glyph: dictionary`"
  end


  def test_visualization_docs_define_a_dictionary_glyph_for_named_tensor_mappings
    visualization = File.read(File.join(ROOT, "protocol/visualization-language.md"))

    assert_includes visualization, "Use `dictionary` when the value is a named mapping"
    assert_includes visualization, "glyph: scalar|vector|single|matrix|pair|volume|dictionary|coordinates|frames"
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
