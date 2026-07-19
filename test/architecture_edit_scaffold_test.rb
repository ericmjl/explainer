# frozen_string_literal: true

require "digest"
require "minitest/autorun"
require_relative "../lib/architecture_edit"

class ArchitectureEditScaffoldTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @compiler = ArchitectureEdit::Compiler.new(root: ROOT)
  end

  def test_scaffold_adds_a_projectable_board_and_links_the_parent_without_writing
    architecture_path = File.join(ROOT, "architectures/diffusion-transformer.yaml")
    view_path = File.join(ROOT, "views/dit-semantic-zoom.view.yaml")
    before = {
      architecture_path => Digest::SHA256.file(architecture_path).hexdigest,
      view_path => Digest::SHA256.file(view_path).hexdigest,
    }

    result = @compiler.compile(scaffold_plan, build_manifests: false)

    board = result.view.fetch("boards").find { |candidate| candidate["id"] == "timestep_embedder_generated" }
    refute_nil board
    assert_equal "modules.timestep_embedder", board.fetch("subject_ref")
    assert_equal "dit_pipeline", board.fetch("parent")
    refute_empty board.fetch("nodes")
    cells = board.fetch("nodes").map { |node| [node.fetch("col"), node.fetch("row")] }
    assert_equal cells.uniq, cells

    parent = result.view.fetch("boards").find { |candidate| candidate["id"] == "dit_pipeline" }
    occurrence = parent.fetch("nodes").find { |node| node["ref"] == "modules.timestep_embedder" }
    assert_equal "timestep_embedder_generated", occurrence.fetch("board_ref")
    assert_equal ["views/dit-semantic-zoom.view.yaml"], result.files
    assert_equal before.fetch(architecture_path), Digest::SHA256.file(architecture_path).hexdigest
    assert_equal before.fetch(view_path), Digest::SHA256.file(view_path).hexdigest
  end

  def test_scaffold_rejects_a_leaf_subject_before_staged_lint
    plan = {
      "schema_version" => "architecture-edit-v0.1",
      "id" => "invalid_leaf_board",
      "target" => { "source_set" => "generic" },
      "intent" => "Demonstrate the decomposition guard.",
      "operations" => [
        {
          "op" => "scaffold_board",
          "board" => {
            "id" => "context_builder_generated",
            "title" => "Context Builder",
            "summary" => "A leaf cannot own a detail board.",
            "subject_ref" => "modules.context_builder",
          },
        },
      ],
    }

    error = assert_raises(ArchitectureEdit::Error) do
      @compiler.compile(plan, build_manifests: false)
    end

    assert_equal "non_expandable_subject", error.code
    assert_includes error.message, "is leaf"
  end

  private

  def scaffold_plan
    {
      "schema_version" => "architecture-edit-v0.1",
      "id" => "scaffold_timestep_embedder",
      "target" => { "source_set" => "dit" },
      "intent" => "Generate a deterministic timestep detail board.",
      "operations" => [
        {
          "op" => "scaffold_board",
          "board" => {
            "id" => "timestep_embedder_generated",
            "title" => "Timestep Embedder",
            "summary" => "Show how scalar time becomes conditioning.",
            "subject_ref" => "modules.timestep_embedder",
            "columns" => 3,
          },
        },
      ],
    }
  end
end
