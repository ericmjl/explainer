# frozen_string_literal: true

require "minitest/autorun"
require "tempfile"
require_relative "../lib/strict_yaml"

class StrictYamlTest < Minitest::Test
  def test_rejects_duplicate_keys_before_psych_discards_them
    error = assert_raises(StrictYaml::DuplicateKeyError) do
      load_source(<<~YAML)
        module:
          label: First
          label: Second
      YAML
    end

    assert_includes error.message, "duplicate key \"label\""
    assert_includes error.message, "first declared on line 2"
  end

  def test_preserves_safe_alias_support
    document = load_source(<<~YAML)
      evidence: &evidence
        status: inferred
      copied: *evidence
    YAML

    assert_equal document.fetch("evidence"), document.fetch("copied")
  end

  private

  def load_source(source)
    Tempfile.create(["strict-yaml", ".yaml"]) do |file|
      file.write(source)
      file.flush
      return StrictYaml.load_file(file.path)
    end
  end
end
