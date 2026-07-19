# frozen_string_literal: true

require "set"

require_relative "json_schema_subset"
require_relative "source_contract"

# Structural and semantic validation for method-level semantic pseudocode.
# Pseudocode v0.2 is a scoped projection of architecture facts: statements
# bind one canonical fact, symbols bind concrete representation occurrences,
# and code lexemes bind reads, writes, or calls without parsing arbitrary code.
module PseudocodeContract
  Diagnostic = JsonSchemaSubset::Diagnostic

  class ValidationError < StandardError
    attr_reader :diagnostics

    def initialize(diagnostics)
      @diagnostics = diagnostics
      super(diagnostics.map(&:to_s).join("; "))
    end
  end

  module_function

  def errors(program, architecture:)
    diagnostics = SourceContract.errors(program)
    return diagnostics unless program.is_a?(Hash) && program["schema_version"] == "pseudocode-v0.2"
    return diagnostics unless diagnostics.empty?

    diagnostics + semantic_errors(program, architecture)
  end

  def validate!(program, architecture:)
    diagnostics = errors(program, architecture: architecture)
    raise ValidationError, diagnostics unless diagnostics.empty?

    program
  end

  # Shared by the compiler so validation and emitted character ranges use the
  # same identifier-boundary rule. This keeps short symbols such as `s` from
  # matching the `s` inside an operation name.
  def code_identifier_occurrences(code, lexeme)
    pattern = /(?<![A-Za-z0-9_])#{Regexp.escape(lexeme)}(?![A-Za-z0-9_])/
    code.to_enum(:scan, pattern).map do
      match = Regexp.last_match
      { "start" => match.begin(0), "end" => match.end(0) }
    end
  end

  def semantic_errors(program, architecture)
    diagnostics = []
    %w[sources scopes symbols lines claims].each do |collection|
      diagnostics.concat(duplicate_id_errors(Array(program[collection]), "$.#{collection}", collection.delete_suffix("s")))
    end

    facts = architecture_fact_index(architecture)
    scopes = Array(program["scopes"])
    scopes_by_ref = scopes.to_h { |scope| ["scopes.#{scope['id']}", scope] }
    root_ref = "scopes.#{program['root_scope']}"
    root_scope = scopes_by_ref[root_ref]
    unless root_scope
      diagnostics << diagnostic(
        "unknown_root_pseudocode_scope", "$.root_scope",
        "cannot resolve #{root_ref}",
      )
    end

    parent_by_ref = scopes_by_ref.transform_values { |scope| scope["parent_ref"] }
    scopes.each_with_index do |scope, index|
      path = "$.scopes[#{index}]"
      scope_ref = "scopes.#{scope['id']}"
      parent_ref = scope["parent_ref"]
      if parent_ref == "pseudocode"
        if scope_ref != root_ref
          diagnostics << diagnostic(
            "multiple_root_pseudocode_scopes", "#{path}.parent_ref",
            "only #{root_ref} may be rooted at pseudocode",
          )
        end
      elsif !scopes_by_ref.key?(parent_ref)
        diagnostics << diagnostic(
          "unknown_parent_pseudocode_scope", "#{path}.parent_ref",
          "cannot resolve #{parent_ref.inspect}",
        )
      end
      subject_ref = scope["subject_ref"]
      unless fact_exists?(facts, subject_ref)
        diagnostics << diagnostic(
          "unknown_pseudocode_scope_subject", "#{path}.subject_ref",
          "cannot resolve #{subject_ref.inspect}",
        )
      end
      execution_ref = scope["execution_ref"]
      if execution_ref && !fact_exists?(facts, execution_ref)
        diagnostics << diagnostic(
          "unknown_pseudocode_scope_execution", "#{path}.execution_ref",
          "cannot resolve #{execution_ref.inspect}",
        )
      elsif execution_ref && scope["kind"] != "loop"
        diagnostics << diagnostic(
          "execution_ref_on_non_loop_scope", "#{path}.execution_ref",
          "execution_ref is valid only on a loop scope",
        )
      end
    end
    if root_scope && root_scope["parent_ref"] != "pseudocode"
      diagnostics << diagnostic(
        "invalid_root_pseudocode_scope", "$.root_scope",
        "#{root_ref} must declare parent_ref: pseudocode",
      )
    end
    diagnostics.concat(scope_cycle_errors(scopes_by_ref, parent_by_ref))
    diagnostics.concat(unreachable_scope_errors(scopes_by_ref, parent_by_ref, root_ref)) if root_scope

    symbols = Array(program["symbols"])
    symbols_by_id = symbols.to_h { |symbol| [symbol["id"], symbol] }
    symbols.each_with_index do |symbol, index|
      path = "$.symbols[#{index}]"
      unless scopes_by_ref.key?(symbol["scope_ref"])
        diagnostics << diagnostic(
          "unknown_symbol_scope", "#{path}.scope_ref",
          "cannot resolve #{symbol['scope_ref'].inspect}",
        )
      end
      unless fact_exists?(facts, symbol["architecture_ref"])
        diagnostics << diagnostic(
          "unknown_symbol_architecture_ref", "#{path}.architecture_ref",
          "cannot resolve #{symbol['architecture_ref'].inspect}",
        )
      end
    end

    source_ids = Array(program["sources"]).filter_map { |source| source["id"] }.to_set
    line_ids = Array(program["lines"]).filter_map { |line| line["id"] }.to_set
    Array(program["lines"]).each_with_index do |line, index|
      diagnostics.concat(line_errors(
        line,
        index,
        facts: facts,
        scopes_by_ref: scopes_by_ref,
        parent_by_ref: parent_by_ref,
        symbols_by_id: symbols_by_id,
        source_ids: source_ids,
      ))
    end
    targeted_scopes = Array(program["lines"]).filter_map { |line| line["callee_scope_ref"] }.to_set
    (scopes_by_ref.keys.to_set - Set[root_ref] - targeted_scopes).sort.each do |scope_ref|
      diagnostics << diagnostic(
        "uncalled_pseudocode_scope", "$.scopes",
        "#{scope_ref} is nested but no statement targets it through callee_scope_ref",
      )
    end

    Array(program["claims"]).each_with_index do |claim, index|
      Array(claim["line_refs"]).each_with_index do |line_ref, ref_index|
        next if line_ids.include?(line_ref)

        diagnostics << diagnostic(
          "unknown_pseudocode_claim_line", "$.claims[#{index}].line_refs[#{ref_index}]",
          "cannot resolve line #{line_ref.inspect}",
        )
      end
    end
    diagnostics
  end
  private_class_method :semantic_errors

  def line_errors(line, index, facts:, scopes_by_ref:, parent_by_ref:, symbols_by_id:, source_ids:)
    diagnostics = []
    path = "$.lines[#{index}]"
    scope_ref = line["scope_ref"]
    unless scopes_by_ref.key?(scope_ref)
      diagnostics << diagnostic("unknown_line_scope", "#{path}.scope_ref", "cannot resolve #{scope_ref.inspect}")
    end

    statement_ref = line["statement_ref"]
    unless fact_exists?(facts, statement_ref)
      diagnostics << diagnostic(
        "unknown_statement_ref", "#{path}.statement_ref",
        "cannot resolve #{statement_ref.inspect}",
      )
    end
    Array(line["architecture_refs"]).each_with_index do |ref, ref_index|
      next if fact_exists?(facts, ref)

      diagnostics << diagnostic(
        "unknown_line_architecture_ref", "#{path}.architecture_refs[#{ref_index}]",
        "cannot resolve #{ref.inspect}",
      )
    end

    callee_ref = line["callee_scope_ref"]
    if callee_ref
      callee = scopes_by_ref[callee_ref]
      if !callee
        diagnostics << diagnostic(
          "unknown_callee_scope", "#{path}.callee_scope_ref",
          "cannot resolve #{callee_ref.inspect}",
        )
      else
        expected_parent = scope_ref
        if callee["parent_ref"] != expected_parent
          diagnostics << diagnostic(
            "non_child_callee_scope", "#{path}.callee_scope_ref",
            "#{callee_ref} must be an immediate child of #{expected_parent}",
          )
        end
        if callee["subject_ref"] != statement_ref
          diagnostics << diagnostic(
            "callee_statement_mismatch", "#{path}.callee_scope_ref",
            "#{callee_ref} explains #{callee['subject_ref']}, not #{statement_ref}",
          )
        end
      end
    end

    instance_ref = line["block_instance_ref"]
    if instance_ref && !fact_exists?(facts, instance_ref)
      diagnostics << diagnostic(
        "unknown_pseudocode_block_instance", "#{path}.block_instance_ref",
        "cannot resolve #{instance_ref.inspect}",
      )
    end

    inputs = Array(line["inputs"])
    outputs = Array(line["outputs"])
    (inputs + outputs).uniq.each do |symbol_id|
      symbol = symbols_by_id[symbol_id]
      if !symbol
        diagnostics << diagnostic(
          "unknown_line_symbol", path,
          "cannot resolve symbol #{symbol_id.inspect}",
        )
      elsif scopes_by_ref.key?(scope_ref) && scopes_by_ref.key?(symbol["scope_ref"]) &&
            !scope_visible?(symbol["scope_ref"], scope_ref, parent_by_ref)
        diagnostics << diagnostic(
          "symbol_out_of_scope", path,
          "symbol #{symbol_id} belongs to #{symbol['scope_ref']} and is not visible from #{scope_ref}",
        )
      end
    end

    Array(line["source_refs"]).each_with_index do |source_ref, source_index|
      next if source_ids.include?(source_ref["source"])

      diagnostics << diagnostic(
        "unknown_pseudocode_source", "#{path}.source_refs[#{source_index}].source",
        "cannot resolve local source #{source_ref['source'].inspect}",
      )
    end

    bindings = Array(line["code_bindings"])
    duplicate_lexemes = bindings.filter_map do |binding|
      binding.is_a?(Hash) ? binding["lexeme"] : nil
    end.tally.select { |_lexeme, count| count > 1 }.keys
    duplicate_lexemes.sort.each do |lexeme|
      diagnostics << diagnostic(
        "ambiguous_code_binding_lexeme", "#{path}.code_bindings",
        "#{lexeme.inspect} is bound more than once in one pseudocode statement; use distinct state symbols",
      )
    end

    bindings.each_with_index do |binding, binding_index|
      next unless binding.is_a?(Hash)

      binding_path = "#{path}.code_bindings[#{binding_index}]"
      lexeme = binding["lexeme"]
      occurrences = if lexeme.is_a?(String) && !lexeme.empty? && line["text"].is_a?(String)
        code_identifier_occurrences(line["text"], lexeme)
      else
        []
      end
      if occurrences.empty?
        diagnostics << diagnostic(
          "missing_code_binding_lexeme", "#{binding_path}.lexeme",
          "#{lexeme.inspect} does not occur as an identifier in the line text",
        )
      end

      if binding["symbol_ref"]
        symbol_id = binding["symbol_ref"]
        symbol = symbols_by_id[symbol_id]
        unless symbol
          diagnostics << diagnostic(
            "unknown_code_binding_symbol", "#{binding_path}.symbol_ref",
            "cannot resolve symbol #{symbol_id.inspect}",
          )
          next
        end
        if scopes_by_ref.key?(scope_ref) && scopes_by_ref.key?(symbol["scope_ref"]) &&
           !scope_visible?(symbol["scope_ref"], scope_ref, parent_by_ref)
          diagnostics << diagnostic(
            "code_binding_symbol_out_of_scope", "#{binding_path}.symbol_ref",
            "symbol #{symbol_id} is not visible from #{scope_ref}",
          )
        end
        expected = binding["access"] == "write" ? outputs : inputs
        unless expected.include?(symbol_id)
          diagnostics << diagnostic(
            "invalid_code_binding_access", binding_path,
            "#{binding['access']} binding #{symbol_id.inspect} must appear in line #{binding['access'] == 'write' ? 'outputs' : 'inputs'}",
          )
        end
        if binding["access"] == "write" && occurrences.length > 1
          diagnostics << diagnostic(
            "ambiguous_write_binding", "#{binding_path}.lexeme",
            "write lexeme #{lexeme.inspect} occurs #{occurrences.length} times; use distinct before/after symbols",
          )
        end
      elsif binding["architecture_ref"]
        ref = binding["architecture_ref"]
        unless fact_exists?(facts, ref)
          diagnostics << diagnostic(
            "unknown_code_binding_architecture_ref", "#{binding_path}.architecture_ref",
            "cannot resolve #{ref.inspect}",
          )
        end
        unless ref == statement_ref || Array(line["architecture_refs"]).include?(ref)
          diagnostics << diagnostic(
            "unscoped_call_binding", "#{binding_path}.architecture_ref",
            "call #{ref} must be the statement_ref or one of architecture_refs",
          )
        end
      end
    end

    diagnostics.concat(rendered_noop_assignment_errors(
      line,
      path,
      bindings: bindings,
      symbols_by_id: symbols_by_id,
    ))

    if callee_ref && !bindings.any? { |binding| binding["access"] == "call" && binding["architecture_ref"] == statement_ref }
      diagnostics << diagnostic(
        "missing_callee_call_binding", "#{path}.code_bindings",
        "a line with callee_scope_ref must bind its statement call lexeme",
      )
    end

    {
      "read" => inputs,
      "write" => outputs,
    }.each do |access, expected_symbols|
      bound = bindings.filter_map do |binding|
        binding["symbol_ref"] if binding.is_a?(Hash) && binding["access"] == access
      end.to_set
      (expected_symbols.to_set - bound).sort.each do |symbol_id|
        diagnostics << diagnostic(
          "missing_code_binding", "#{path}.code_bindings",
          "symbol #{symbol_id} needs at least one #{access} binding",
        )
      end
    end
    diagnostics
  end
  private_class_method :line_errors

  # A lexical handoff can look meaningful in source while collapsing to a
  # no-op after semantic symbols are typeset. For example, `x_step = x_t`
  # renders as `x_t = x_t` when both occurrences intentionally share TeX.
  # Reject only the unambiguous bare-assignment case; repeated notation inside
  # a real expression such as `x_t = update(x_t)` remains valid.
  def rendered_noop_assignment_errors(line, path, bindings:, symbols_by_id:)
    match = line["text"].to_s.match(
      /\A\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([A-Za-z_][A-Za-z0-9_]*)\s*\z/,
    )
    return [] unless match

    write = bindings.find do |binding|
      binding.is_a?(Hash) && binding["access"] == "write" && binding["lexeme"] == match[1]
    end
    read = bindings.find do |binding|
      binding.is_a?(Hash) && binding["access"] == "read" && binding["lexeme"] == match[2]
    end
    return [] unless write&.dig("symbol_ref") && read&.dig("symbol_ref")

    write_symbol = symbols_by_id[write["symbol_ref"]]
    read_symbol = symbols_by_id[read["symbol_ref"]]
    return [] unless write_symbol && read_symbol

    write_display = binding_display(write, write_symbol)
    read_display = binding_display(read, read_symbol)
    return [] unless write_display == read_display

    [diagnostic(
      "rendered_noop_assignment", "#{path}.text",
      "#{match[1]} = #{match[2]} renders as #{write_display} = #{read_display}; " \
      "remove the presentation-only handoff or use distinguishable notation",
    )]
  end
  private_class_method :rendered_noop_assignment_errors

  def binding_display(binding, symbol)
    (binding["tex"] || symbol["tex"] || symbol["name"]).to_s.gsub(/\s+/, "")
  end
  private_class_method :binding_display

  def architecture_fact_index(architecture)
    refs = Set["architecture"]
    {
      "modules" => architecture["modules"],
      "representations" => architecture["representations"],
      "value_sites" => architecture["value_sites"],
      "relations" => architecture["relations"] || architecture["edges"],
      "claims" => architecture["claims"],
      "block_instances" => architecture["block_instances"],
    }.each do |namespace, items|
      Array(items).each { |item| refs << "#{namespace}.#{item['id']}" if item["id"] }
    end
    Array(architecture.dig("execution", "loops")).each do |loop|
      refs << "execution.loops.#{loop['id']}" if loop["id"]
    end
    refs
  end
  private_class_method :architecture_fact_index

  def fact_exists?(facts, ref)
    facts.include?(ref)
  end
  private_class_method :fact_exists?

  def scope_visible?(definition_ref, use_ref, parent_by_ref)
    cursor = use_ref
    seen = Set.new
    while cursor && cursor != "pseudocode" && !seen.include?(cursor)
      return true if cursor == definition_ref

      seen << cursor
      cursor = parent_by_ref[cursor]
    end
    false
  end
  private_class_method :scope_visible?

  def scope_cycle_errors(scopes_by_ref, parent_by_ref)
    diagnostics = []
    scopes_by_ref.each_key do |start|
      order = []
      positions = {}
      cursor = start
      while scopes_by_ref.key?(cursor)
        if positions.key?(cursor)
          cycle = order.drop(positions.fetch(cursor)) + [cursor]
          diagnostics << diagnostic(
            "pseudocode_scope_cycle", "$.scopes",
            "scope hierarchy contains cycle #{cycle.join(' -> ')}",
          )
          break
        end
        positions[cursor] = order.length
        order << cursor
        cursor = parent_by_ref[cursor]
      end
    end
    diagnostics.uniq { |item| item.message }
  end
  private_class_method :scope_cycle_errors

  def unreachable_scope_errors(scopes_by_ref, parent_by_ref, root_ref)
    scopes_by_ref.keys.sort.filter_map do |scope_ref|
      next if scope_ref == root_ref
      next if scope_visible?(root_ref, scope_ref, parent_by_ref)

      diagnostic(
        "unreachable_pseudocode_scope", "$.scopes",
        "#{scope_ref} is not nested under #{root_ref}",
      )
    end
  end
  private_class_method :unreachable_scope_errors

  def duplicate_id_errors(items, path, label)
    items.filter_map { |item| item.is_a?(Hash) ? item["id"] : nil }
      .tally.select { |_id, count| count > 1 }.keys.sort.map do |id|
        diagnostic("duplicate_pseudocode_id", path, "duplicate #{label} id #{id}")
      end
  end
  private_class_method :duplicate_id_errors

  def diagnostic(code, path, message)
    Diagnostic.new(code, path, message)
  end
  private_class_method :diagnostic
end
