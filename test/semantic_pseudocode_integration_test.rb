# frozen_string_literal: true

require "json"
require "minitest/autorun"
require "set"

class SemanticPseudocodeIntegrationTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @manifest = manifest("genie3")
    @program = @manifest.fetch("pseudocode").fetch("genie3")
  end

  def test_high_level_trace_preserves_scope_calls_and_loop_state_identity
    assert_equal "pseudocode-v0.2", @program.fetch("schemaVersion")
    assert_equal "semantic-pseudocode-compiler-v0.3", @program.fetch("compilerVersion")
    assert_equal "scopes.inference", @program.fetch("rootScope")

    scopes = @program.fetch("scopes").to_h { |scope| [scope.fetch("ref"), scope] }
    assert_equal "modules.diffusion_sampler", scopes.dig("scopes.sampling", "subjectRef")
    assert_equal "execution.loops.reverse_diffusion_loop", scopes.dig("scopes.sampling", "executionRef")

    sampler_call = line("run_diffusion_sampler")
    assert_equal "modules.diffusion_sampler", sampler_call.fetch("statementRef")
    assert_equal "scopes.sampling", sampler_call.fetch("calleeScopeRef")

    initialization = line("initialize_coordinates")
    initialized = initialization.fetch("codeBindings").find { |binding| binding["access"] == "write" }
    assert_equal "value_sites.initial_coordinates", initialized.fetch("architectureRef")

    recurrence = line("advance_sampling_state")
    assert_equal "relations.next_coordinates_reenter_sampling_state", recurrence.fetch("statementRef")
    assert_equal %w[value_sites.current_coordinates value_sites.next_coordinates],
      recurrence.fetch("codeBindings").map { |binding| binding.fetch("architectureRef") }.sort
  end

  def test_compiled_offsets_reconstruct_every_bound_lexeme
    @program.fetch("lines").each do |statement|
      statement.fetch("codeBindings", []).each do |binding|
        refute_empty binding.fetch("occurrences"), "#{statement.fetch('id')}: #{binding.fetch('lexeme')}"
        binding.fetch("occurrences").each do |occurrence|
          actual = statement.fetch("text")[occurrence.fetch("start")...occurrence.fetch("end")]
          assert_equal binding.fetch("lexeme"), actual, statement.fetch("id")
        end
      end
    end
  end

  def test_reverse_step_preserves_coordinate_occurrence_boundaries
    entry = line("enter_reverse_step")
    assert_equal "relations.current_coordinates_enter_reverse_step", entry.fetch("statementRef")

    derive_frames = read_binding(line("derive_frames"), "step_coordinates")
    assert_equal "value_sites.step_coordinates", derive_frames.fetch("architectureRef")

    denoiser = line("run_denoiser")
    refute denoiser.fetch("codeBindings").any? { |binding|
      binding["architectureRef"] == "value_sites.current_coordinates"
    }

    sampler_call = line("run_sampler_math")
    assert_equal "modules.directional_ddim_sampler_math", sampler_call.fetch("statementRef")
    assert_equal "scopes.sampler_math", sampler_call.fetch("calleeScopeRef")

    sampler_entry = line("prepare_sampler_math")
    assert_equal "scopes.sampler_math", sampler_entry.fetch("scopeRef")
    assert_equal "relations.step_coordinates_enter_sampler_math", sampler_entry.fetch("statementRef")

    %w[read_noise ddim_step].each do |line_id|
      assert_equal "scopes.sampler_math", line(line_id).fetch("scopeRef"), line_id
      sampler_coordinates = read_binding(line(line_id), "sampler_step_coordinates")
      assert_equal "value_sites.sampler_step_coordinates", sampler_coordinates.fetch("architectureRef"), line_id
    end
  end

  def test_board_values_inherit_canonical_math_notation
    symbols = @program.fetch("symbols").to_h { |symbol| [symbol.fetch("id"), symbol] }
    assert_equal "\\epsilon_\\theta", symbols.dig("predicted_noise", "tex")
    assert_equal "\\hat{x}_0", symbols.dig("coordinate_prediction", "tex")
    assert_equal "\\ell_{aa}", symbols.dig("sequence_logits", "tex")

    sampler_board = @manifest.dig("boards", "items").find do |candidate|
      candidate.fetch("id") == "directional_ddim_sampler_math"
    end
    denoiser_board = @manifest.dig("boards", "items").find do |candidate|
      candidate.fetch("id") == "denoiser_forward"
    end

    %w[coordinate_prediction predicted_noise].each do |node_id|
      node = sampler_board.fetch("nodes").find { |candidate| candidate.fetch("id") == node_id }
      refute node.key?("notation"), "#{node_id} should inherit its canonical TeX symbol"
    end

    sequence_logits = denoiser_board.fetch("nodes").find do |candidate|
      candidate.fetch("id") == "sequence_logits"
    end
    refute sequence_logits.key?("notation"), "sequence_logits should inherit its canonical TeX symbol"
  end

  def test_ipa_tokens_and_statements_resolve_to_nodes_in_the_same_compiled_board
    board = @manifest.dig("boards", "items").find do |candidate|
      candidate.fetch("id") == "genie3_ipa_internals"
    end
    refute_nil board

    instance_facts = board.fetch("nodes").filter_map { |node| node["instance_fact_ref"] }.to_set
    board.fetch("pseudocode").each do |statement|
      assert_includes instance_facts, statement.fetch("instanceFactRef"), statement.fetch("id")
      statement.fetch("codeBindings", []).each do |binding|
        assert_includes instance_facts, binding.fetch("instanceFactRef"),
          "#{statement.fetch('id')}: #{binding.fetch('lexeme')}"
      end
    end

    assert_equal ["Compute attention weights", "Extract values and update state"],
      board.fetch("segments").map { |segment| segment.fetch("label") }
  end

  private

  def line(id)
    @program.fetch("lines").find { |candidate| candidate.fetch("id") == id }
  end

  def read_binding(statement, symbol_id)
    statement.fetch("codeBindings").find do |binding|
      binding["symbolId"] == symbol_id && binding["access"] == "read"
    end
  end

  def manifest(id)
    source = File.binread(File.join(ROOT, "renderer/architecture/manifest-#{id}.js"))
    JSON.parse(source.sub(/\Aexport const manifest = /, "").sub(/;\s*\z/, ""))
  end
end
