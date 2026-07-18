# frozen_string_literal: true

require "set"

# Semantic validation for optional board lanes. A representation lane is a
# presentation choice over canonical representation types: it may align their
# visible value-site occurrences and let the renderer reuse one family color,
# but it never owns relation carries or invents information flow.
module ArchitectureViewLanes
  module_function

  REPRESENTATION_GLYPHS = Set.new(%w[single pair coordinates frames]).freeze

  def errors(architecture, board, projection:)
    lanes = Array(board["lanes"])
    return [] if lanes.empty?

    diagnostics = []
    duplicate_values(lanes.filter_map { |lane| lane["id"] }).each do |id|
      diagnostics << issue(
        "duplicate_lane_id",
        "board #{board['id']} contains duplicate lane id #{id}",
        lane_id: id,
      )
    end

    representation_lanes = lanes.select { |lane| lane["kind"] == "representation" }
    return diagnostics if representation_lanes.empty?

    representations_by_ref = Array(architecture["representations"]).each_with_object({}) do |representation, index|
      index["representations.#{representation['id']}"] = representation if representation["id"]
    end
    value_sites_by_ref = Array(architecture["value_sites"]).each_with_object({}) do |site, index|
      index["value_sites.#{site['id']}"] = site if site["id"]
    end
    grid_rows = board.dig("grid", "rows")
    lanes_by_representation = Hash.new { |hash, key| hash[key] = [] }
    lanes_by_glyph = Hash.new { |hash, key| hash[key] = [] }

    representation_lanes.each do |lane|
      lane_id = lane["id"] || "unknown"
      row = lane["row"]
      if row.is_a?(Integer) && (row < 1 || (grid_rows.is_a?(Integer) && row > grid_rows))
        diagnostics << issue(
          "representation_lane_row_out_of_bounds",
          "representation lane #{lane_id} row #{row} is outside board grid rows 1..#{grid_rows}",
          lane_id: lane_id,
        )
      end

      glyph = lane["glyph"]
      lanes_by_glyph[glyph] << lane if REPRESENTATION_GLYPHS.include?(glyph)

      refs = Array(lane["representation_refs"])
      if refs.empty?
        diagnostics << issue(
          "empty_representation_lane",
          "representation lane #{lane_id} must map at least one canonical representation",
          lane_id: lane_id,
        )
      end
      duplicate_values(refs).each do |representation_ref|
        diagnostics << issue(
          "duplicate_representation_lane_ref",
          "representation lane #{lane_id} repeats #{representation_ref}",
          lane_id: lane_id,
        )
      end

      refs.uniq.each do |representation_ref|
        representation = representations_by_ref[representation_ref]
        unless representation
          diagnostics << issue(
            "unknown_representation_lane_ref",
            "representation lane #{lane_id} references unknown #{representation_ref}",
            lane_id: lane_id,
          )
          next
        end

        effective_glyph = representation["glyph"] || inferred_glyph(representation["shape"])
        if effective_glyph && effective_glyph != glyph
          diagnostics << issue(
            "representation_lane_glyph_mismatch",
            "representation lane #{lane_id} declares glyph #{glyph}, but #{representation_ref} resolves to #{effective_glyph}",
            lane_id: lane_id,
          )
        end
        lanes_by_representation[representation_ref] << lane
      end
    end

    lanes_by_glyph.each do |glyph, matching_lanes|
      next unless matching_lanes.length > 1

      lane_ids = matching_lanes.filter_map { |lane| lane["id"] }.sort
      diagnostics << issue(
        "ambiguous_representation_lane_glyph",
        "representation glyph #{glyph} is assigned to multiple lanes: #{lane_ids.join(', ')}",
      )
    end

    lanes_by_representation.each do |representation_ref, matching_lanes|
      next unless matching_lanes.length > 1

      lane_ids = matching_lanes.filter_map { |lane| lane["id"] }.sort
      diagnostics << issue(
        "overlapping_representation_lanes",
        "#{representation_ref} is assigned to multiple lanes: #{lane_ids.join(', ')}",
      )
    end

    visible_refs = Set.new
    Array(board["nodes"]).each do |node|
      site = value_sites_by_ref[node["ref"]]
      next unless site

      representation_ref = site["representation_ref"]
      matching_lanes = lanes_by_representation[representation_ref]
      next if matching_lanes.empty?

      visible_refs << representation_ref
      next unless matching_lanes.length == 1

      lane = matching_lanes.first
      next if node["row"] == lane["row"]

      diagnostics << issue(
        "representation_occurrence_off_lane",
        "value-site occurrence #{node['id']} uses #{representation_ref} on row #{node['row']}, expected representation lane #{lane['id']} row #{lane['row']}",
        lane_id: lane["id"],
        node_id: node["id"],
      )
    end

    carried_refs = Array(projection && projection["edges"]).flat_map do |edge|
      Array(edge["carries"])
    end.to_set
    representation_lanes.each do |lane|
      known_refs = Array(lane["representation_refs"]).select { |ref| representations_by_ref.key?(ref) }
      next if known_refs.any? { |ref| visible_refs.include?(ref) || carried_refs.include?(ref) }

      diagnostics << issue(
        "unused_representation_lane",
        "representation lane #{lane['id']} maps no visible value site or projected edge on board #{board['id']}",
        lane_id: lane["id"],
      )
    end

    diagnostics
  end

  def inferred_glyph(shape)
    axes = primary_shape_axes(shape)
    return nil if axes.empty?

    dims = axes
    dims = dims.drop(1) if dims.first&.downcase == "b"
    return "scalar" if dims.empty?
    return "vector" if dims.length == 1
    return feature_axis?(dims[1]) ? "single" : "matrix" if dims.length == 2

    dims[0] == dims[1] ? "pair" : "volume"
  end
  private_class_method :inferred_glyph

  def primary_shape_axes(shape)
    source = shape.to_s.strip
    return [] if source.empty?

    depth = 0
    clause_end = source.length
    source.each_char.with_index do |character, index|
      depth += 1 if character == "("
      depth = [depth - 1, 0].max if character == ")"
      top_level_alternative = depth.zero? && source[index, 3] == " + "
      if (depth.zero? && [",", ";"].include?(character)) || top_level_alternative
        clause_end = index
        break
      end
    end

    clause = source[0, clause_end]
    axes = []
    axis_start = 0
    depth = 0
    index = 0
    while index < clause.length
      character = clause[index]
      depth += 1 if character == "("
      depth = [depth - 1, 0].max if character == ")"
      if depth.zero? && clause[index, 3] == " x "
        axes << clause[axis_start...index].strip
        axis_start = index + 3
        index += 3
        next
      end
      index += 1
    end
    axes << clause[axis_start..].to_s.strip
    axes.reject(&:empty?)
  end
  private_class_method :primary_shape_axes

  def feature_axis?(axis)
    normalized = axis.to_s.strip.downcase
    return normalized.to_i > 4 if normalized.match?(/\A\d+\z/)

    normalized.match?(/(?:\A|[^a-z0-9])d(?:_[a-z0-9]+)?(?:\z|[^a-z0-9])/) ||
      normalized.match?(/(?:\A|[^a-z0-9])c_out(?:\z|[^a-z0-9])/) ||
      normalized.match?(/fields?|channels?/)
  end
  private_class_method :feature_axis?

  def duplicate_values(values)
    seen = Set.new
    duplicates = Set.new
    values.each do |value|
      duplicates << value unless seen.add?(value)
    end
    duplicates.to_a.sort
  end
  private_class_method :duplicate_values

  def issue(code, message, lane_id: nil, node_id: nil)
    { "code" => code, "message" => message, "lane_id" => lane_id, "node_id" => node_id }.compact
  end
  private_class_method :issue
end
