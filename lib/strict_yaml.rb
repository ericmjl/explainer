# frozen_string_literal: true

require "psych"

# YAML is the durable source format, so silently accepting a repeated mapping
# key is never safe: Psych would otherwise keep only the final value. This
# loader rejects duplicate keys before constructing Ruby objects and then uses
# safe loading with aliases enabled for the evidence anchors used by sources.
module StrictYaml
  class Error < StandardError; end
  class DuplicateKeyError < Error; end

  module_function

  def load_file(path)
    source = File.read(path)
    reject_duplicate_keys!(source, path)
    Psych.safe_load(source, aliases: true, filename: path)
  rescue Psych::SyntaxError => e
    raise Error, e.message
  end

  def reject_duplicate_keys!(source, path = "(yaml)")
    stream = Psych.parse_stream(source, filename: path)
    walk(stream, path)
  rescue Psych::SyntaxError => e
    raise Error, e.message
  end

  def walk(node, path)
    if node.is_a?(Psych::Nodes::Mapping)
      seen = {}
      node.children.each_slice(2) do |key_node, value_node|
        key = scalar_key(key_node)
        if key && seen.key?(key)
          first_line = seen.fetch(key)
          raise DuplicateKeyError,
                "#{path}:#{key_node.start_line + 1}: duplicate key #{key.inspect} " \
                "(first declared on line #{first_line})"
        end
        seen[key] = key_node.start_line + 1 if key
        walk(key_node, path)
        walk(value_node, path)
      end
    else
      Array(node.respond_to?(:children) ? node.children : nil).each { |child| walk(child, path) }
    end
  end
  private_class_method :walk

  def scalar_key(node)
    node.value if node.is_a?(Psych::Nodes::Scalar)
  end
  private_class_method :scalar_key
end
