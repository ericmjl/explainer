# frozen_string_literal: true

require "minitest/autorun"

require_relative "../lib/pseudocode_compiler"
require_relative "../lib/strict_yaml"

class PseudocodeCompilerTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @program = StrictYaml.load_file(File.join(ROOT, "pseudocode/genie3.yaml"))
    @architecture = StrictYaml.load_file(File.join(ROOT, "architectures/genie3.yaml"))
    @compiled = PseudocodeCompiler.compile(@program, architecture: @architecture)
  end

  def test_compiles_scopes_statement_and_drill_targets
    assert_equal "pseudocode-v0.2", @compiled.fetch("schemaVersion")
    assert_equal PseudocodeCompiler::COMPILER_VERSION, @compiled.fetch("compilerVersion")
    assert_equal "scopes.inference", @compiled.fetch("rootScope")

    line = compiled_line("run_reverse_step")
    assert_equal "scopes.sampling", line.fetch("scopeRef")
    assert_equal "modules.reverse_diffusion_step", line.fetch("statementRef")
    assert_equal "scopes.reverse_step", line.fetch("calleeScopeRef")
    assert_equal "modules.reverse_diffusion_step", line.fetch("architectureRefs").first

    sampler_call = compiled_line("run_sampler_math")
    assert_equal "scopes.reverse_step", sampler_call.fetch("scopeRef")
    assert_equal "modules.directional_ddim_sampler_math", sampler_call.fetch("statementRef")
    assert_equal "scopes.sampler_math", sampler_call.fetch("calleeScopeRef")
  end

  def test_code_bindings_resolve_symbols_to_architecture_facts_and_ranges
    line = compiled_line("run_denoiser")
    source_text = line.fetch("text")
    line.fetch("codeBindings").each do |binding|
      refute_empty binding.fetch("occurrences")
      binding.fetch("occurrences").each do |occurrence|
        assert_equal binding.fetch("lexeme"), source_text[occurrence.fetch("start")...occurrence.fetch("end")]
      end
    end

    frames = line.fetch("codeBindings").find { |binding| binding["symbolId"] == "current_frames" }
    assert_equal "read", frames.fetch("access")
    assert_equal "value_sites.current_frames", frames.fetch("architectureRef")
    refute line.fetch("codeBindings").any? { |binding| binding["symbolId"] == "current_coordinates" }

    call = line.fetch("codeBindings").find { |binding| binding["access"] == "call" }
    assert_nil call["symbolId"]
    assert_nil call["tex"]
    assert_equal "modules.denoiser", call.fetch("architectureRef")

    refined = compiled_line("decode_structure").fetch("codeBindings").find do |binding|
      binding["symbolId"] == "refined_single_features"
    end
    assert_equal "s_5", refined.fetch("lexeme")
    assert_equal "s_5", refined.fetch("tex")
  end

  def test_compiles_explanatory_comments_separately_from_code
    line = compiled_line("prepare_tokens")

    assert_equal "features = tokenize(request)", line.fetch("text")
    assert_equal(
      "C-alpha per unknown residue; atom14 heavy atoms only for known atomized residues.",
      line.fetch("comment"),
    )
  end

  def test_coordinate_occurrence_bindings_resolve_to_exact_value_sites
    expected = {
      "derive_frames" => ["step_coordinates", "value_sites.step_coordinates"],
      "read_noise" => ["sampler_step_coordinates", "value_sites.sampler_step_coordinates"],
      "ddim_step" => ["sampler_step_coordinates", "value_sites.sampler_step_coordinates"],
    }

    expected.each do |line_id, (symbol_id, architecture_ref)|
      binding = compiled_line(line_id).fetch("codeBindings").find do |candidate|
        candidate["symbolId"] == symbol_id && candidate["access"] == "read"
      end
      refute_nil binding, line_id
      assert_equal architecture_ref, binding.fetch("architectureRef"), line_id
    end
  end

  def test_symbol_shapes_are_derived_from_canonical_representations
    symbol = @compiled.fetch("symbols").find { |candidate| candidate.fetch("id") == "current_coordinates" }

    assert_equal "value_sites.current_coordinates", symbol.fetch("architectureRef")
    assert_equal "representations.token_coordinates", symbol.fetch("representationRef")
    assert_equal "B x N x 3", symbol.fetch("shape")
    assert_equal "coordinates", symbol.fetch("glyph")
  end

  def test_legacy_trace_still_compiles_without_semantic_fields
    legacy = StrictYaml.load_file(File.join(ROOT, "pseudocode/genie2.yaml"))
    compiled = PseudocodeCompiler.compile(legacy)

    assert_equal "pseudocode-v0.1", compiled.fetch("schemaVersion")
    assert_equal [], compiled.fetch("scopes")
    refute compiled.key?("rootScope")
    refute compiled.fetch("lines").first.key?("codeBindings")
  end

  private

  def compiled_line(id)
    @compiled.fetch("lines").find { |line| line.fetch("id") == id }
  end
end
