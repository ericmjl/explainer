# frozen_string_literal: true

require "minitest/autorun"
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
  end

  def teardown
    FileUtils.remove_entry(@temporary_root) if File.exist?(@temporary_root)
  end

  def test_build_contains_only_the_explicit_public_surface
    PagesBuild.build!(output: @output, validate: false)

    expected = (PagesBuild.public_files + PagesBuild::GENERATED_ASSETS.keys).sort
    assert_equal expected, output_files
    assert File.file?(PagesBuild.output_marker(@output))
    refute output_files.any? { |path| path.include?(PagesBuild::OUTPUT_MARKER_SUFFIX) }
    assert File.file?(File.join(@output, "index.html"))
    assert File.file?(File.join(@output, "renderer/architecture/index.html"))
    PagesBuild.source_set_ids.each do |id|
      assert File.file?(File.join(@output, "renderer/architecture/manifest-#{id}.js")), id
    end

    output_files.each do |path|
      refute_match(/\.(?:md|rb|ya?ml|json)\z/i, path)
      refute FORBIDDEN_PREFIXES.any? { |prefix| path.start_with?(prefix) }, path
      next if path == "_headers"

      assert_match(/\.(?:css|html|m?js)\z/i, path)
    end
  end

  def test_every_local_browser_dependency_exists_in_the_output
    PagesBuild.build!(output: @output, validate: false)

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
    refs.select { |ref| ref.start_with?(".") && !ref.include?("?") && !ref.include?("#") }
  end

  def resolve_dependency(source_path, dependency)
    source_directory = File.dirname(source_path)
    target = File.expand_path(dependency, File.join(@output, source_directory))
    relative = Pathname.new(target).relative_path_from(Pathname.new(@output)).to_s
    return relative == "." ? "index.html" : File.join(relative, "index.html") if dependency.end_with?("/")

    relative
  end
end
