# frozen_string_literal: true

require "minitest/autorun"
require "open3"

class RendererSemanticPseudocodeTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  def test_dom_free_semantic_pseudocode_contract
    stdout, stderr, status = Open3.capture3(
      "node",
      "--test",
      "test/renderer_semantic_pseudocode_test.mjs",
      chdir: ROOT,
    )

    assert status.success?, [stdout, stderr].reject(&:empty?).join("\n")
  rescue Errno::ENOENT
    skip "node is unavailable; semantic pseudocode test is optional"
  end

  def test_renderer_exposes_a_synchronized_trace_tab
    renderer = File.binread(File.join(ROOT, "renderer/architecture/renderer.js"))
    html = File.binread(File.join(ROOT, "renderer/architecture/index.html"))
    styles = File.binread(File.join(ROOT, "styles.css"))

    assert_includes renderer, 'from "./semantic-pseudocode.mjs"'
    assert_includes renderer, "function renderSemanticTracePane()"
    assert_includes renderer,
      "beginConnectivityHighlight(source, interaction.resolution.nodeIds, { dimUnrelated: true })"
    assert_includes renderer,
      'element.classList.toggle("is-connectivity-muted", dimUnrelated && !focused && !source && !target)'
    assert_includes renderer, "focusNodeOccurrence(nodeId)"
    assert_includes renderer, "applySemanticTraceTransientHighlight([...focusIds])"
    assert_includes renderer, 'classList.toggle("has-trace-spotlight", hasMatches)'
    assert_includes renderer, 'line.classList.toggle("is-trace-muted", hasMatches && !matches)'
    assert_includes renderer, "semanticStatementTextParts(statement)"
    assert_includes renderer, "semanticPlainCodeMarkup(segment.text)"
    assert_includes renderer, "semanticOperationLabel(statement.operation)"
    assert_includes renderer, "semanticTexForBinding(segment.binding, symbolsById)"
    assert_includes renderer, "semanticTexFallbackParts(tex)"
    assert_includes renderer, "function typesetSemanticTraceMath()"
    assert_includes renderer, 'class="semantic-token-math"'
    assert_includes renderer, 'aria-label="${escapeHtml(accessibleLabel)}"'
    assert_includes renderer, "scope.executionRef || scope.execution_ref"
    assert_includes renderer, "const direct = board.blockInstanceRef || board.block_instance_ref"
    refute_includes renderer, "blockInstancesBySubject.get(subjectRef)"
    refute_includes renderer, "statements associated with the selected component"
    refute_includes renderer, "const statementMatches = selectedId"
    refute_includes renderer, "const bindingMatches = selectedId"
    assert_includes renderer, 'data-semantic-callee-board'
    assert_includes html, 'id="semanticTraceBody"'
    assert_includes html, 'class="focus-panel-pages"'
    assert_includes html, 'class="focus-page-section focus-detail-section"'
    assert_includes html, 'class="focus-page-section focus-trace-section"'
    assert_operator html.index('id="focusBody"'), :<, html.index('id="semanticTraceBody"')
    refute_includes html, 'role="tablist"'
    refute_includes html, 'id="focusDetailTab"'
    refute_includes html, 'id="focusTraceTab"'
    refute_includes renderer, "inspectorView"
    refute_includes renderer, "setInspectorView"
    assert_includes styles, ".semantic-token"
    assert_includes styles, ".semantic-token-math"
    assert_includes styles, ".semantic-token-math-fallback"
    assert_includes styles, ".semantic-trace-body.has-mathjax"
    assert_includes styles, ".semantic-trace-line.is-trace-selected"
    assert_includes styles, ".semantic-trace-list.has-trace-spotlight .semantic-trace-line.is-trace-transient"
    assert_includes styles, ".semantic-trace-list.has-trace-spotlight .semantic-trace-line.is-trace-muted"
    assert_includes styles, ".semantic-trace-phase"
    assert_includes styles, ".semantic-trace-drill"
    assert_includes styles, ".semantic-code-expression"
    assert_includes styles, ".semantic-code-comment"
    assert_includes styles, ".semantic-code-atom"
    assert_includes styles, ".semantic-trace-scroll"
    assert_includes styles, ".focus-page-heading"
    assert_includes styles, ".focus-trace-section"
    assert_match(/\.focus-panel-pages\s*\{[^}]*overflow-y:\s*auto/m, styles)
    assert_match(/\.semantic-trace-scroll\s*\{[^}]*overflow:\s*visible/m, styles)
    assert_includes styles, "height: 4.35em"
    assert_includes styles, "clamp(340px, 25vw, 400px)"
    assert_includes styles, "overflow-wrap: normal"
    assert_includes styles, ".arch-node.is-connectivity-muted"
    refute_includes styles, ".focus-panel-tabs"
    refute_includes styles, ".focus-panel.is-trace-open"
  end
end
