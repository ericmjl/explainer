# frozen_string_literal: true

require "minitest/autorun"
require "json"
require "tmpdir"
require_relative "../scripts/build_pages"

class PagesBuildTest < Minitest::Test
  FORBIDDEN_PREFIXES = %w[
    architectures/
    comparisons/
    lib/
    pseudocode/
    references/
    review/
    schemas/
    standard_blocks/
    stories/
    test/
    protocol/
    views/
  ].freeze

  def setup
    @temporary_root = Dir.mktmpdir("explainer-pages-test-")
    @output = File.join(@temporary_root, "dist")
    @source_sets = ["genie3"]
  end

  def teardown
    FileUtils.remove_entry(@temporary_root) if File.exist?(@temporary_root)
  end

  def test_build_contains_only_the_explicit_public_surface
    PagesBuild.build!(output: @output, validate: false, source_sets: @source_sets)

    expected = (PagesBuild.public_files(@source_sets) + PagesBuild::GENERATED_ASSETS.keys).sort
    assert_equal expected, output_files
    assert File.file?(PagesBuild.output_marker(@output))
    refute output_files.any? { |path| path.include?(PagesBuild::OUTPUT_MARKER_SUFFIX) }
    assert File.file?(File.join(@output, "index.html"))
    assert File.file?(File.join(@output, "renderer/architecture/index.html"))
    @source_sets.each do |id|
      assert File.file?(File.join(@output, "renderer/architecture/manifest-#{id}.js")), id
    end
    refute File.exist?(File.join(@output, "renderer/architecture/manifest-generic.js"))
    assert File.file?(File.join(@output, "assets/reference-panels/genie3/figure_1_partial_atomization.png"))

    output_files.each do |path|
      refute_match(/\.(?:md|rb|ya?ml|json)\z/i, path)
      refute FORBIDDEN_PREFIXES.any? { |prefix| path.start_with?(prefix) }, path
      next if path == "_headers"

      assert_match(/\.(?:css|html|m?js|png|jpe?g|webp)\z/i, path)
    end
  end


  def test_filtered_build_copies_only_reference_images_named_by_selected_boards
    PagesBuild.build!(output: @output, validate: false, source_sets: ["generic"])

    refute output_files.any? { |path| path.start_with?("assets/reference-panels/") }
  end

  def test_every_local_browser_dependency_exists_in_the_output
    PagesBuild.build!(output: @output, validate: false, source_sets: @source_sets)

    browser_sources.each do |path|
      contents = File.read(File.join(@output, path))
      dependency_refs(path, contents).each do |dependency|
        target = resolve_dependency(path, dependency)
        assert File.file?(File.join(@output, target)), "#{path} references missing #{dependency}"
      end
    end
  end

  def test_builder_refuses_to_replace_an_unowned_directory
    FileUtils.mkdir_p(@output)
    note = File.join(@output, "keep-me.txt")
    File.write(note, "user content\n")

    error = assert_raises(PagesBuild::Error) do
      PagesBuild.build!(output: @output, validate: false)
    end
    assert_includes error.message, "non-generated output"
    assert_equal "user content\n", File.read(note)
  end

  def test_browser_module_graph_uses_one_content_fingerprint
    PagesBuild.build!(output: @output, validate: false, source_sets: @source_sets)

    html = File.read(File.join(@output, "renderer/architecture/index.html"))
    renderer = File.read(File.join(@output, "renderer/architecture/renderer.js"))
    landing = File.read(File.join(@output, "landing.js"))
    build_id = html[/renderer\.js\?v=([0-9a-f]{12})/, 1]

    refute_nil build_id
    assert_includes html, "../../styles.css?v=#{build_id}"
    assert_includes renderer, "./manifest-index.js?v=#{build_id}"
    assert_includes renderer, "./board-surface.mjs?v=#{build_id}"
    assert_includes renderer, "./keyboard-navigation.mjs?v=#{build_id}"
    assert_includes renderer, "./${activeManifestEntry.file}?v=#{build_id}"
    assert_includes landing, "./renderer/architecture/manifest-index.js?v=#{build_id}"
    refute_includes landing, "await import"
    assert_includes File.read(File.join(@output, "_headers")),
      "Cache-Control: no-cache, must-revalidate"
  end

  def test_filtered_index_contains_only_selected_architectures_and_valid_comparisons
    PagesBuild.build!(
      output: @output,
      validate: false,
      source_sets: %w[generic genie3],
    )

    source = File.read(File.join(@output, "renderer/architecture/manifest-index.js"))
    manifest_payload = source[/export const manifestIndex = (\[.*?\]);\nexport const comparisonIndex/m, 1]
    comparison_payload = source[/export const comparisonIndex = (\{.*\});\s*\z/m, 1]
    manifests = JSON.parse(manifest_payload)
    comparisons = JSON.parse(comparison_payload)

    assert_equal %w[generic genie3], manifests.map { |entry| entry.fetch("id") }
    assert_equal ["genie3_reduced_vs_full_ipa"],
      comparisons.fetch("items").map { |item| item.fetch("id") }
    comparisons.fetch("items").each do |comparison|
      assert comparison.fetch("subjects").values.all? { |subject|
        %w[generic genie3].include?(subject.fetch("sourceSet"))
      }
    end
  end

  def test_filtered_directory_is_a_minimal_architecture_only_list
    PagesBuild.build!(output: @output, validate: false, source_sets: ["genie3"])

    html = File.read(File.join(@output, "index.html"))
    landing = File.read(File.join(@output, "landing.js"))
    index = File.read(File.join(@output, "renderer/architecture/manifest-index.js"))

    assert_includes html, 'id="architectureList"'
    refute_includes html, "Language reference"
    refute_includes html, "Design language"
    refute_includes html, "Authoring resources"
    refute_includes landing, "referenceSection"
    assert_includes landing, 'entry.role === "architecture"'
    refute_includes landing, "await import"
    assert_includes index, '"id": "genie3"'
    refute_includes index, '"id": "generic"'
  end

  private

  def output_files
    Dir.glob(File.join(@output, "**", "*"), File::FNM_DOTMATCH)
      .select { |path| File.file?(path) }
      .map { |path| path.delete_prefix("#{@output}/") }
      .sort
  end

  def browser_sources
    output_files.select { |path| path.match?(/\.(?:html|js|mjs)\z/) }
  end

  def dependency_refs(path, contents)
    refs = []
    refs.concat(contents.scan(/(?:src|href)=["']([^"']+)["']/i).flatten) if path.end_with?(".html")
    refs.concat(contents.scan(/(?:import\s+(?:[^"']+?\s+from\s+)?)["']([^"']+)["']/m).flatten) if path.match?(/\.(?:js|mjs)\z/)
    refs.select { |ref| ref.start_with?(".") && !ref.include?("#") }
  end

  def resolve_dependency(source_path, dependency)
    dependency = dependency.split("?", 2).first
    source_directory = File.dirname(source_path)
    target = File.expand_path(dependency, File.join(@output, source_directory))
    relative = Pathname.new(target).relative_path_from(Pathname.new(@output)).to_s
    return relative == "." ? "index.html" : File.join(relative, "index.html") if dependency.end_with?("/")

    relative
  end
end
