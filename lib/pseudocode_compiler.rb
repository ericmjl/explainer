# frozen_string_literal: true

require_relative "pseudocode_contract"

# Normalizes legacy and semantic method traces into the browser manifest.
# Semantic v0.2 adds stable scope, statement, and lexeme identities while
# preserving the v0.1 line fields consumed by the existing audience view.
module PseudocodeCompiler
  COMPILER_VERSION = "semantic-pseudocode-compiler-v0.3"

  module_function

  def compile(program, architecture: nil)
    semantic = program["schema_version"] == "pseudocode-v0.2"
    symbols = Array(program["symbols"])
    symbols_by_id = symbols.to_h { |symbol| [symbol["id"], symbol] }

    {
      "schemaVersion" => program["schema_version"],
      "compilerVersion" => COMPILER_VERSION,
      "id" => program.fetch("id"),
      "title" => program["title"],
      "rootScope" => semantic ? "scopes.#{program.fetch('root_scope')}" : nil,
      "sources" => program["sources"] || [],
      "scopes" => semantic ? compile_scopes(program) : [],
      "symbols" => symbols.map { |symbol| compile_symbol(symbol, architecture) },
      "lines" => Array(program.fetch("lines")).map do |line|
        compile_line(line, symbols_by_id, semantic: semantic)
      end,
      "claims" => program["claims"] || [],
    }.compact
  end

  def compile_scopes(program)
    Array(program["scopes"]).map do |scope|
      {
        "id" => scope.fetch("id"),
        "ref" => "scopes.#{scope.fetch('id')}",
        "label" => scope.fetch("label"),
        "kind" => scope.fetch("kind"),
        "parentRef" => scope.fetch("parent_ref"),
        "subjectRef" => scope.fetch("subject_ref"),
        "executionRef" => scope["execution_ref"],
      }.compact
    end
  end
  private_class_method :compile_scopes

  def compile_symbol(symbol, architecture)
    representation = resolve_representation(symbol["architecture_ref"], architecture)
    {
      "id" => symbol["id"],
      "name" => symbol["name"],
      "tex" => symbol["tex"],
      "type" => symbol["type"],
      "shape" => representation&.dig("shape") || symbol["shape"],
      "representationRef" => representation && "representations.#{representation['id']}",
      "scale" => representation&.dig("scale"),
      "glyph" => representation&.dig("glyph"),
      "scopeRef" => symbol["scope_ref"],
      "architectureRef" => symbol["architecture_ref"],
    }.compact
  end
  private_class_method :compile_symbol

  def resolve_representation(ref, architecture)
    return nil unless architecture.is_a?(Hash)

    representations = Array(architecture["representations"]).to_h { |item| ["representations.#{item['id']}", item] }
    return representations[ref] if ref.to_s.start_with?("representations.")
    return nil unless ref.to_s.start_with?("value_sites.")

    value_sites = Array(architecture["value_sites"]).to_h { |item| ["value_sites.#{item['id']}", item] }
    representation_ref = value_sites.dig(ref, "representation_ref")
    representations[representation_ref]
  end
  private_class_method :resolve_representation

  def compile_line(line, symbols_by_id, semantic:)
    statement_ref = line["statement_ref"]
    architecture_refs = [statement_ref, *Array(line["architecture_refs"])].compact.uniq
    compiled = {
      "id" => line.fetch("id"),
      "text" => line.fetch("text"),
      "comment" => line["comment"],
      "refs" => Array(line["source_refs"]).map { |ref| ref["lines"] || ref["locator"] }.compact.join(", "),
      "sourceRefs" => line["source_refs"] || [],
      "scopeRef" => line["scope_ref"],
      "statementRef" => statement_ref,
      "calleeScopeRef" => line["callee_scope_ref"],
      "architectureRefs" => architecture_refs,
      "standardBlockRef" => line["standard_block_ref"],
      "blockInstanceRef" => line["block_instance_ref"],
      "operation" => line["operation"],
      "inputs" => Array(line["inputs"]),
      "outputs" => Array(line["outputs"]),
      "visual" => line["visual"],
    }
    if semantic
      compiled["codeBindings"] = Array(line["code_bindings"]).map do |binding|
        compile_code_binding(line.fetch("text"), binding, symbols_by_id)
      end
    end
    compiled.compact
  end
  private_class_method :compile_line

  def compile_code_binding(text, binding, symbols_by_id)
    symbol_id = binding["symbol_ref"]
    symbol = symbols_by_id[symbol_id]
    {
      "lexeme" => binding.fetch("lexeme"),
      "access" => binding.fetch("access"),
      "symbolId" => symbol_id,
      "tex" => binding["tex"] || symbol&.dig("tex"),
      "architectureRef" => binding["architecture_ref"] || symbol&.dig("architecture_ref"),
      "occurrences" => PseudocodeContract.code_identifier_occurrences(text, binding.fetch("lexeme")),
    }.compact
  end
  private_class_method :compile_code_binding
end
