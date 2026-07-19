# frozen_string_literal: true

require "minitest/autorun"

require_relative "../lib/pseudocode_contract"
require_relative "../lib/strict_yaml"

class PseudocodeContractTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def setup
    @program = load_yaml("pseudocode/genie3.yaml")
    @architecture = load_yaml("architectures/genie3.yaml")
  end

  def test_genie3_semantic_trace_validates
    assert_equal "pseudocode-v0.2", @program.fetch("schema_version")
    assert_empty PseudocodeContract.errors(@program, architecture: @architecture)
  end

  def test_genie3_reverse_step_uses_concrete_coordinate_occurrences
    enter_step = line("enter_reverse_step")
    derive_frames = line("derive_frames")
    denoiser = line("run_denoiser")
    enter_sampler = line("prepare_sampler_math")
    read_noise = line("read_noise")
    ddim_step = line("ddim_step")

    assert_equal "relations.current_coordinates_enter_reverse_step", enter_step.fetch("statement_ref")
    assert_equal ["step_coordinates"], derive_frames.fetch("inputs") & coordinate_symbol_ids
    assert_empty denoiser.fetch("inputs") & coordinate_symbol_ids
    assert_equal "relations.step_coordinates_enter_sampler_math", enter_sampler.fetch("statement_ref")
    assert_equal ["sampler_step_coordinates"], read_noise.fetch("inputs") & coordinate_symbol_ids
    assert_equal ["sampler_step_coordinates"], ddim_step.fetch("inputs") & coordinate_symbol_ids
  end

  def test_v02_symbols_cannot_copy_canonical_shape_facts
    program = deep_copy(@program)
    program.fetch("symbols").first["shape"] = "B x duplicated shape"

    assert_code PseudocodeContract.errors(program, architecture: @architecture), "schema_unknown_property"
  end

  def test_rejects_unknown_statement_symbol_and_call_facts
    program = deep_copy(@program)
    line = program.fetch("lines").find { |candidate| candidate.fetch("id") == "run_denoiser" }
    line["statement_ref"] = "modules.not_declared"
    line.fetch("code_bindings").find { |binding| binding["access"] == "read" }["symbol_ref"] = "not_declared"
    line.fetch("code_bindings").find { |binding| binding["access"] == "call" }["architecture_ref"] = "modules.not_declared"

    diagnostics = PseudocodeContract.errors(program, architecture: @architecture)
    assert_code diagnostics, "unknown_statement_ref"
    assert_code diagnostics, "unknown_code_binding_symbol"
    assert_code diagnostics, "unknown_code_binding_architecture_ref"
  end

  def test_lexical_scope_prevents_child_local_symbols_from_leaking_to_parent
    program = deep_copy(@program)
    line = program.fetch("lines").find { |candidate| candidate.fetch("id") == "run_reverse_step" }
    line.fetch("inputs") << "initial_single_features"
    line["text"] = "x_next = ReverseDiffusionStep(x_t, features, t, s_0)"
    line.fetch("code_bindings") << {
      "lexeme" => "s_0",
      "symbol_ref" => "initial_single_features",
      "access" => "read",
    }

    diagnostics = PseudocodeContract.errors(program, architecture: @architecture)
    assert_code diagnostics, "symbol_out_of_scope"
    assert_code diagnostics, "code_binding_symbol_out_of_scope"
  end

  def test_callee_scope_must_be_a_matching_immediate_child
    program = deep_copy(@program)
    line = program.fetch("lines").find { |candidate| candidate.fetch("id") == "run_reverse_step" }
    line["callee_scope_ref"] = "scopes.denoiser"

    diagnostics = PseudocodeContract.errors(program, architecture: @architecture)
    assert_code diagnostics, "non_child_callee_scope"
    assert_code diagnostics, "callee_statement_mismatch"
  end

  def test_nested_scope_requires_an_executable_call_edge
    program = deep_copy(@program)
    line = program.fetch("lines").find { |candidate| candidate.fetch("id") == "run_denoiser" }
    line.delete("callee_scope_ref")

    assert_code PseudocodeContract.errors(program, architecture: @architecture), "uncalled_pseudocode_scope"
  end

  def test_every_read_and_write_has_a_matching_lexical_binding
    program = deep_copy(@program)
    line = program.fetch("lines").find { |candidate| candidate.fetch("id") == "ddim_step" }
    line.fetch("code_bindings").reject! { |binding| binding["symbol_ref"] == "predicted_noise" }
    write = line.fetch("code_bindings").find { |binding| binding["symbol_ref"] == "next_coordinates" }
    write["lexeme"] = "not_in_text"

    diagnostics = PseudocodeContract.errors(program, architecture: @architecture)
    assert_code diagnostics, "missing_code_binding"
    assert_code diagnostics, "missing_code_binding_lexeme"
  end

  def test_scope_cycles_and_unreachable_roots_are_rejected
    program = deep_copy(@program)
    sampling = program.fetch("scopes").find { |scope| scope.fetch("id") == "sampling" }
    reverse = program.fetch("scopes").find { |scope| scope.fetch("id") == "reverse_step" }
    sampling["parent_ref"] = "scopes.reverse_step"
    reverse["parent_ref"] = "scopes.sampling"

    diagnostics = PseudocodeContract.errors(program, architecture: @architecture)
    assert_code diagnostics, "pseudocode_scope_cycle"
    assert_code diagnostics, "unreachable_pseudocode_scope"
  end

  private

  def load_yaml(path)
    StrictYaml.load_file(File.join(ROOT, path))
  end

  def deep_copy(value)
    Marshal.load(Marshal.dump(value))
  end

  def line(id)
    @program.fetch("lines").find { |candidate| candidate.fetch("id") == id }
  end

  def coordinate_symbol_ids
    %w[current_coordinates step_coordinates sampler_step_coordinates]
  end

  def assert_code(diagnostics, code)
    assert diagnostics.any? { |item| item.code == code },
      "expected #{code}, got:\n#{diagnostics.join("\n")}"
  end
end
