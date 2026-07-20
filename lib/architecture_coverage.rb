# frozen_string_literal: true

# Validate and compile the current architecture language's top-down decomposition coverage.
# Coverage is reported as explicit scope/frontier counts, never as a guessed
# percentage of an unknowable complete architecture.
module ArchitectureCoverage
  class CoverageError < StandardError; end

  STATUSES = %w[complete partial leaf opaque].freeze

  module_function

  def errors(architecture)
    return [] unless %w[architecture-v0.4 architecture-v0.5].include?(architecture["schema_version"])

    modules = Array(architecture["modules"])
    children = Hash.new { |hash, key| hash[key] = [] }
    modules.each do |mod|
      children[mod["parent_ref"]] << "modules.#{mod['id']}"
    end

    errors = []
    validate_scope(errors, "architecture", architecture["decomposition"], children["architecture"])
    modules.each do |mod|
      ref = "modules.#{mod['id']}"
      validate_scope(errors, ref, mod["decomposition"], children[ref])
    end
    errors
  end

  def validate!(architecture)
    coverage_errors = errors(architecture)
    return if coverage_errors.empty?

    raise CoverageError, coverage_errors.join("; ")
  end

  def compile(architecture)
    validate!(architecture)

    modules = Array(architecture["modules"])
    modules_by_ref = modules.to_h { |mod| ["modules.#{mod['id']}", mod] }
    children = Hash.new { |hash, key| hash[key] = [] }
    modules.each { |mod| children[mod["parent_ref"]] << "modules.#{mod['id']}" }
    depths = hierarchy_depths(modules_by_ref)

    scopes = { "architecture" => compile_scope(architecture["decomposition"], children["architecture"], 0) }
    modules_by_ref.each do |ref, mod|
      scopes[ref] = compile_scope(mod["decomposition"], children[ref], depths.fetch(ref))
    end

    expanded = scopes.select { |_ref, scope| scope["immediateModuleCount"].positive? }
    frontiers = scopes.select { |_ref, scope| scope["immediateModuleCount"].zero? }
    status_counts = scopes.values.map { |scope| scope["status"] }.tally
    frontier_counts = frontiers.values.map { |scope| scope["status"] }.tally

    {
      "method" => "declared_decomposition_closure",
      "scopes" => scopes,
      "summary" => {
        "scopeCount" => scopes.length,
        "expandedScopeCount" => expanded.length,
        "completeExpandedScopeCount" => expanded.count { |_ref, scope| scope["status"] == "complete" },
        "partialScopeCount" => status_counts.fetch("partial", 0),
        "leafFrontierCount" => frontier_counts.fetch("leaf", 0),
        "opaqueFrontierCount" => frontier_counts.fetch("opaque", 0),
        "partialFrontierCount" => frontier_counts.fetch("partial", 0),
        "maximumAuthoredDepth" => depths.values.max || 0,
      },
      "opaqueFrontierRefs" => frontiers.filter_map do |ref, scope|
        ref if scope["status"] == "opaque"
      end,
      "partialScopeRefs" => scopes.filter_map do |ref, scope|
        ref if scope["status"] == "partial"
      end,
    }
  end

  def validate_scope(errors, ref, decomposition, child_refs)
    unless decomposition.is_a?(Hash)
      errors << "#{ref} missing decomposition"
      return
    end

    status = decomposition["status"]
    unless STATUSES.include?(status)
      errors << "#{ref} has invalid decomposition status #{status.inspect}"
      return
    end

    if status == "complete" && child_refs.empty?
      errors << "#{ref} is complete but declares no child modules; use leaf or opaque"
    end
    if %w[leaf opaque].include?(status) && !child_refs.empty?
      errors << "#{ref} is #{status} but owns child modules #{child_refs.join(', ')}"
    end
    if %w[partial opaque].include?(status) && decomposition["reason"].to_s.strip.empty?
      errors << "#{ref} decomposition status #{status} requires a reason"
    end
  end
  private_class_method :validate_scope

  def hierarchy_depths(modules_by_ref)
    depths = { "architecture" => 0 }
    visiting = {}
    resolve = lambda do |ref|
      return depths.fetch(ref) if depths.key?(ref)
      raise CoverageError, "module hierarchy cycle at #{ref}" if visiting[ref]

      visiting[ref] = true
      parent = modules_by_ref.fetch(ref).fetch("parent_ref")
      parent_depth = parent == "architecture" ? 0 : resolve.call(parent)
      visiting.delete(ref)
      depths[ref] = parent_depth + 1
    end
    modules_by_ref.each_key { |ref| resolve.call(ref) }
    depths
  end
  private_class_method :hierarchy_depths

  def compile_scope(decomposition, child_refs, depth)
    {
      "status" => decomposition.fetch("status"),
      "reason" => decomposition["reason"],
      "depth" => depth,
      "immediateModuleCount" => child_refs.length,
      "immediateModuleRefs" => child_refs,
    }.compact
  end
  private_class_method :compile_scope
end
