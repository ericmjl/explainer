# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererRepresentationGlyphTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_representation_glyph_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "test/renderer_representation_glyph_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; renderer representation-glyph test is optional"
  end

  def test_renderer_and_styles_integrate_canonical_geometry_glyphs
    renderer = File.read(File.join(ROOT, "renderer/architecture/renderer.js"))
    styles = File.read(File.join(ROOT, "styles.css"))

    assert_includes renderer, 'node.glyph || rep?.glyph || glyphKindForShape'
    assert_includes renderer, "tensorGlyphSvg(kind, dictionaryPreviewFields)"
    assert_includes renderer, 'entry.glyph === "coordinates"'
    assert_includes renderer, 'entry.glyph === "frames"'
    assert_includes renderer, 'entry.glyph === "dictionary"'
    assert_includes renderer, "const symbol = node.notation"
    assert_includes renderer, "symbolMarkup(null, node.notation)"
    assert_includes renderer, 'from "./math-notation.mjs"'
    assert_includes styles, ".arch-rep.tensor-coordinates"
    assert_includes styles, ".arch-rep.tensor-frames"
    assert_includes styles, ".arch-rep.tensor-dictionary"
    assert_includes styles, ".model-map-node.is-coordinates"
    assert_includes styles, ".model-map-node.is-frames"
    assert_includes styles, ".model-map-node.is-dictionary"
  end
end
