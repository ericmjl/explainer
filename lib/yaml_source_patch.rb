# frozen_string_literal: true

require "psych"
require_relative "strict_yaml"

# Applies a deliberately small set of YAML-aware edits while leaving all
# unrelated source bytes alone. Architecture sources contain comments and
# named anchors, so serializing a loaded document wholesale would create a
# misleadingly large diff and can change alias spelling.
module YamlSourcePatch
  class Error < StandardError; end

  class Document
    attr_reader :path

    def initialize(text, path: "(yaml)")
      @text = text.dup
      if @text.encoding == Encoding::ASCII_8BIT
        utf8 = @text.dup.force_encoding(Encoding::UTF_8)
        @text = utf8 if utf8.valid_encoding?
      end
      @path = path
      StrictYaml.reject_duplicate_keys!(@text, @path)
      @root = Psych.parse_stream(@text, filename: @path).children.fetch(0).root
      raise Error, "#{@path}: expected a YAML mapping at the document root" unless @root.is_a?(Psych::Nodes::Mapping)

      @replacements = []
      @insertions = Hash.new { |hash, line| hash[line] = [] }
    rescue Psych::SyntaxError => e
      raise Error, e.message
    end

    def append_top_level_item(collection_key, value)
      sequence = top_level_value(collection_key)
      unless sequence.is_a?(Psych::Nodes::Sequence)
        raise Error, "#{@path}: #{collection_key} must be a sequence"
      end

      @insertions[content_end_line(sequence)] << indent(dump_fragment([value]), sequence_item_indent(sequence))
    end

    def update_top_level_item(collection_key, id, set:, unset: [])
      item = find_sequence_item(top_level_value(collection_key), id, "#{collection_key}.#{id}")
      fields = mapping_pairs(item).to_h { |key, value| [key.value, [key, value]] }

      unset.each do |field|
        pair = fields[field]
        raise Error, "#{@path}: #{collection_key}.#{id} has no field #{field.inspect}" unless pair

        replace_field(pair.first, pair.last, "")
      end

      additions = []
      set.each do |field, value|
        pair = fields[field]
        if pair
          replace_field(
            pair.first,
            pair.last,
            indent(dump_fragment({ field => value }), pair.first.start_column),
          )
        else
          additions << [field, value]
        end
      end
      additions.each do |field, value|
        @insertions[content_end_line(item)] << indent(
          dump_fragment({ field => value }),
          mapping_field_indent(item),
        )
      end
    end

    # Replaces one identified sequence item while preserving every byte
    # outside that item. This is the bounded fallback for compound board edits
    # whose node and presentation collections must change atomically.
    def replace_top_level_item(collection_key, id, value)
      sequence = top_level_value(collection_key)
      item = find_sequence_item(sequence, id, "#{collection_key}.#{id}")
      @replacements << [
        item.start_line,
        content_end_line(item),
        indent(dump_fragment([value]), sequence_item_indent(sequence)),
      ]
    end

    # Updates only a board's grid and occurrence ranks. This keeps a semantic
    # reflow reviewable: labels, comments, flow-style mappings, and every
    # sibling byte remain outside the patch.
    def update_board_layout(board_id:, grid:, positions:)
      boards = top_level_value("boards")
      board = find_sequence_item(boards, board_id, "boards.#{board_id}")
      board_fields = mapping_pairs(board).to_h { |key, value| [key.value, [key, value]] }
      grid_pair = board_fields["grid"]
      nodes_pair = board_fields["nodes"]
      raise Error, "#{@path}: board #{board_id} has no grid" unless grid_pair
      raise Error, "#{@path}: board #{board_id} has no nodes" unless nodes_pair

      nodes = nodes_pair.last
      unless nodes.is_a?(Psych::Nodes::Sequence)
        raise Error, "#{@path}: board #{board_id} nodes must be a sequence"
      end
      authored_ids = nodes.children.filter_map do |node|
        next unless node.is_a?(Psych::Nodes::Mapping)

        mapping_pairs(node).find { |key, _value| key.value == "id" }&.last&.value
      end
      requested_ids = positions.keys.map(&:to_s)
      unless authored_ids.sort == requested_ids.sort
        raise Error,
          "#{@path}: board #{board_id} layout IDs do not match authored nodes " \
          "(authored #{authored_ids.sort.inspect}, requested #{requested_ids.sort.inspect})"
      end

      replace_field(
        grid_pair.first,
        grid_pair.last,
        indent(dump_fragment({ "grid" => grid }), grid_pair.first.start_column),
      )
      positions.keys.map(&:to_s).sort.each do |node_id|
        node = find_sequence_item(nodes, node_id, "boards.#{board_id}.nodes.#{node_id}")
        fields = mapping_pairs(node).to_h { |key, value| [key.value, [key, value]] }
        position = positions.fetch(node_id) { positions.fetch(node_id.to_sym) }
        %w[col row].each do |field|
          pair = fields[field]
          raise Error, "#{@path}: board #{board_id} node #{node_id} has no #{field}" unless pair
          next if pair.last.value.to_i == position.fetch(field)

          replace_field(
            pair.first,
            pair.last,
            indent(dump_fragment({ field => position.fetch(field) }), pair.first.start_column),
          )
        end
      end
    end

    def set_board_ref(parent_board_id:, subject_ref:, board_ref:)
      boards = top_level_value("boards")
      parent = find_sequence_item(boards, parent_board_id, "boards.#{parent_board_id}")
      nodes_pair = mapping_pairs(parent).find { |key, _value| key.value == "nodes" }
      raise Error, "#{@path}: board #{parent_board_id} has no nodes" unless nodes_pair

      nodes = nodes_pair.last
      unless nodes.is_a?(Psych::Nodes::Sequence)
        raise Error, "#{@path}: board #{parent_board_id} nodes must be a sequence"
      end

      matches = nodes.children.select do |node|
        next false unless node.is_a?(Psych::Nodes::Mapping)

        mapping_pairs(node).any? { |key, value| key.value == "ref" && value.value == subject_ref }
      end
      unless matches.length == 1
        raise Error,
          "#{@path}: board #{parent_board_id} must contain exactly one node for #{subject_ref}; found #{matches.length}"
      end

      node = matches.first
      fields = mapping_pairs(node).to_h { |key, value| [key.value, [key, value]] }
      if fields.key?("board_ref")
        existing = fields.fetch("board_ref").last.value
        return if existing == board_ref

        raise Error,
          "#{@path}: #{parent_board_id} node #{subject_ref} already links to board #{existing}"
      end

      @insertions[content_end_line(node)] << indent(
        dump_fragment({ "board_ref" => board_ref }),
        mapping_field_indent(node),
      )
    end

    def render
      validate_non_overlapping_replacements!
      lines = @text.lines
      events = @replacements.map { |start_line, end_line, content| [start_line, 0, end_line, content] }
      @insertions.each do |line, fragments|
        events << [line, 1, line, fragments.join]
      end

      events.sort_by { |start_line, priority, _end_line, _content| [-start_line, priority] }.each do |start_line, _priority, end_line, content|
        lines[start_line...end_line] = content.lines
      end
      lines.join
    end

    private

    def mapping_pairs(mapping)
      unless mapping.is_a?(Psych::Nodes::Mapping)
        raise Error, "#{@path}: expected a mapping near line #{mapping.start_line + 1}"
      end

      mapping.children.each_slice(2).to_a
    end

    def top_level_value(key_name)
      pair = mapping_pairs(@root).find { |key, _value| key.value == key_name }
      raise Error, "#{@path}: missing top-level #{key_name}" unless pair

      pair.last
    end

    def find_sequence_item(sequence, id, label)
      raise Error, "#{@path}: expected #{label} collection to be a sequence" unless sequence.is_a?(Psych::Nodes::Sequence)

      matches = sequence.children.select do |item|
        next false unless item.is_a?(Psych::Nodes::Mapping)

        mapping_pairs(item).any? { |key, value| key.value == "id" && value.value == id }
      end
      unless matches.length == 1
        raise Error, "#{@path}: expected exactly one #{label}; found #{matches.length}"
      end

      matches.first
    end

    def replace_field(key_node, value_node, content)
      start_line = key_node.start_line
      end_line = [content_end_line(value_node), start_line + 1].max
      @replacements << [start_line, end_line, content]
    end

    # Psych container end_line values can include comments between the last
    # child and the following YAML token. Find the end of actual syntax so new
    # fields/items are inserted before those comments instead of silently
    # changing which object a comment describes.
    def content_end_line(node)
      children = Array(node.respond_to?(:children) ? node.children : nil)
      return [node.end_line, node.start_line + 1].max if children.empty?

      children.map { |child| content_end_line(child) }.max
    end

    def sequence_item_indent(sequence)
      sequence.start_column
    end

    def mapping_field_indent(mapping)
      pairs = mapping_pairs(mapping)
      existing = pairs.drop(1).first || pairs.first
      existing ? existing.first.start_column : mapping.start_column + 2
    end

    def validate_non_overlapping_replacements!
      sorted = @replacements.sort_by(&:first)
      sorted.each_cons(2) do |left, right|
        next if left[1] <= right[0]

        raise Error, "#{@path}: generated YAML edits overlap at lines #{left[0] + 1}-#{left[1]}"
      end
    end

    def dump_fragment(value)
      Psych.dump(value, line_width: -1).sub(/\A---\s*\n/, "")
    end

    def indent(text, spaces)
      prefix = " " * spaces
      text.lines.map { |line| line.strip.empty? ? line : "#{prefix}#{line}" }.join
    end
  end
end
