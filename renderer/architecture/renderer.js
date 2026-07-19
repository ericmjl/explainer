import { comparisonIndex, manifestIndex } from "./manifest-index.js";
import {
  allocateContentGridGutters,
  allocateContentGridRowGutters,
  balancedTextLines,
  edgeLabelFits,
} from "./content-grid.mjs";
import {
  buildEdgeQuestionContext,
  buildNodeQuestionContext,
  canonicalNodeRef,
  edgeRelationPath,
  formatQuestionContext,
  questionContextReference,
} from "./question-context.mjs";
import {
  glyphKindForShape,
  shapeDimsLabel,
  tensorGlyphSvg,
} from "./representation-glyphs.mjs";
import { notationMarkup, texMarkup } from "./math-notation.mjs";
import {
  PAYLOAD_FLOW_FAMILIES,
  edgeFlowProfile,
  nodeFlowProfiles,
} from "./flow-families.mjs";
import {
  edgeIsRepresentedByRepeatRegion,
  executionLoopForRef,
  repeatRegionBounds,
  repeatRegions,
  representedIterationRelationRefs,
} from "./repeat-regions.mjs";
import {
  clearFacingPortPlan,
  DEFAULT_ARROW_LANDING,
  ensureMinimumLanding,
  fitEndpointStubLengths,
  separateParallelSegments,
} from "./orthogonal-routing.mjs";
import {
  measureEdgeAnnotation,
  placeEdgeAnnotation,
} from "./edge-annotations.mjs";
import {
  collectionValues,
  createRendererModel,
  humanizeRef,
  refNamespace,
  relationRefsForEdge,
  untypedRef,
} from "./renderer-model.mjs";
import { allocateFeedbackLanes } from "./semantic-routing.mjs";
import { renderVisualSegmentRegions } from "./visual-segments.mjs";
import {
  createWorkspaceSelection,
  edgeSelectionKey,
  selectionMatchesEdge,
  selectionMessageProjection,
  targetFromSelection,
} from "./workspace-selection.mjs";
import {
  deepLinkHistoryMode,
  resolveDeepLink,
} from "./deep-link-state.mjs";
import {
  comparisonHistoryMode,
  resolveComparisonState,
  setComparisonSelection,
  writeComparisonLink,
} from "./comparison-state.mjs";
import {
  alignmentForNode,
  buildAlignmentIndex,
  clearAlignmentDecorations,
  createComparisonBoardRenderer,
  decorateAlignmentElement,
} from "./comparison-board-renderer.mjs";
import {
  createSemanticBoardResolver,
  semanticCodeSegments,
  semanticEdgeForRefs,
  semanticRefsForBinding,
  semanticRefsForStatement,
  semanticScopeForBoard,
  semanticStatementBindings,
  semanticStatementTextParts,
  semanticTexFallbackParts,
  semanticTexForBinding,
} from "./semantic-pseudocode.mjs";
import { pinchViewportBetween } from "./board-surface.mjs";
import { installThemeSwitcher } from "../../theme-state.mjs";

const pageParams = new URLSearchParams(window.location.search);
const archParam = pageParams.get("arch");
const unknownArchParam = Boolean(archParam)
  && !manifestIndex.some((entry) => entry.id === archParam);
const useElkLayout = pageParams.get("layout") === "elk";
const retiredUiParams = ["ui", "edit", "tune"];
if (retiredUiParams.some((name) => pageParams.has(name))) {
  retiredUiParams.forEach((name) => pageParams.delete(name));
  const query = pageParams.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
  );
}
const activeManifestEntry = manifestIndex.find((entry) => entry.id === archParam) || manifestIndex[0];
const { manifest: sourceManifest } = await import(`./${activeManifestEntry.file}`);
const rendererModel = createRendererModel(sourceManifest);
const { manifest } = rendererModel;
const loadedRendererModels = new Map([[activeManifestEntry.id, rendererModel]]);
const requestedComparisonArchitecture = pageParams.get("compare_arch");
const requestedComparisonEntry = manifestIndex.find(
  (entry) => entry.id === requestedComparisonArchitecture,
);
if (requestedComparisonEntry && requestedComparisonEntry.id !== activeManifestEntry.id) {
  const { manifest: comparisonSourceManifest } = await import(`./${requestedComparisonEntry.file}`);
  loadedRendererModels.set(
    requestedComparisonEntry.id,
    createRendererModel(comparisonSourceManifest),
  );
}
const {
  modulesById,
  repsById,
  valueSitesById,
  valueSiteInterfacesById,
  relationsById,
  boardsById,
  standardBlocksById,
  blockInstancesById,
  blockInstancesBySubject,
  conditioningByPair,
  conditioningByRelation,
} = rendererModel.indexes;
const initialDeepLink = resolveDeepLink({
  boards: manifest.boards.items,
  rootBoardId: manifest.boards.rootBoard,
  search: window.location.search,
});
const initialComparisonState = resolveComparisonState({
  architectures: [...loadedRendererModels.entries()].map(([id, model]) => ({
    id,
    manifest: model.manifest,
  })),
  defaultArchitectureId: manifestIndex[0]?.id,
  search: window.location.search,
});
if (unknownArchParam) {
  initialDeepLink.issues.unshift({ code: "unknown_arch", param: "arch", value: archParam });
  initialDeepLink.sanitized = true;
}
const elements = {
  canvas: document.querySelector(".architecture-canvas"),
  moduleLayer: document.getElementById("moduleLayer"),
  regionLayer: document.getElementById("boardRegionLayer"),
  edgeLayer: document.getElementById("edgeLayer"),
  referencePanelLayer: document.getElementById("referencePanelLayer"),
  referenceFigureDialog: document.getElementById("referenceFigureDialog"),
  referenceFigureTitle: document.getElementById("referenceFigureTitle"),
  referenceFigureImage: document.getElementById("referenceFigureImage"),
  referenceFigureViewport: document.getElementById("referenceFigureViewport"),
  referenceFigureCaption: document.getElementById("referenceFigureCaption"),
  referenceFigureCitation: document.getElementById("referenceFigureCitation"),
  referenceFigureLicense: document.getElementById("referenceFigureLicense"),
  referenceFigureClose: document.getElementById("referenceFigureClose"),
  referenceFigureControls: document.getElementById("referenceFigureControls"),
  referenceFigureZoomValue: document.getElementById("referenceFigureZoomValue"),
  focusPanel: document.querySelector(".focus-panel"),
  focusHeader: document.getElementById("focusHeader"),
  focusEyebrow: document.getElementById("focusEyebrow"),
  focusTitle: document.getElementById("focusTitle"),
  focusCompare: document.getElementById("focusCompare"),
  focusQuestion: document.getElementById("focusQuestion"),
  focusReset: document.getElementById("focusReset"),
  focusBody: document.getElementById("focusBody"),
  semanticTraceBody: document.getElementById("semanticTraceBody"),
  semanticTraceCount: document.getElementById("semanticTraceCount"),
  boardNavigation: document.getElementById("boardNavigation"),
  boardBack: document.getElementById("boardBack"),
  boardBackLabel: document.querySelector(".board-back-label"),
  boardBreadcrumbs: document.getElementById("boardBreadcrumbs"),
  boardDepth: document.getElementById("boardDepth"),
  copyDeepLink: document.getElementById("copyDeepLink"),
  semanticLocationStatus: document.getElementById("semanticLocationStatus"),
  canvasControls: document.getElementById("canvasControls"),
  canvasZoomValue: document.querySelector(".canvas-zoom-value"),
  canvasTooltip: document.getElementById("canvasTooltip"),
  scaleLaneLayer: document.getElementById("scaleLaneLayer"),
  representationLaneLayer: document.getElementById("representationLaneLayer"),
  canvasWorkspace: document.getElementById("canvasWorkspace"),
  comparisonWorkspace: document.getElementById("comparisonWorkspace"),
  comparisonCanvas: document.getElementById("comparisonCanvas"),
  comparisonQuestion: document.getElementById("comparisonQuestion"),
  comparisonSummary: document.getElementById("comparisonSummary"),
  comparisonPrimaryLabel: document.getElementById("comparisonPrimaryLabel"),
  comparisonCounterpartLabel: document.getElementById("comparisonCounterpartLabel"),
  comparisonCanvasTitle: document.getElementById("comparisonCanvasTitle"),
  comparisonGroupSummary: document.getElementById("comparisonGroupSummary"),
  comparisonSwap: document.getElementById("comparisonSwap"),
  comparisonFitBoth: document.getElementById("comparisonFitBoth"),
  comparisonClose: document.getElementById("comparisonClose"),
};

let modelMap = null;
let modelMapSvg = null;
let modelMapA11y = null;
let modelMapContext = null;
let modelMapBody = null;
let modelMapViewToggle = null;
let modelMapCollapseButton = null;
let edgeLabelMeasureContext = null;
let questionMenu = null;
let questionMenuIdentifier = null;
let questionMenuTarget = null;
let questionMenuInvoker = null;
let questionCopyStatus = null;
let questionCopyStatusTimer = null;
let referenceFigureScale = 1;
let referenceFigurePan = null;
let questionCopyFallback = null;
let questionCopyFallbackText = null;
let questionCopyFallbackInvoker = null;
const connectivityHighlights = new Map();
let connectivityHighlightSequence = 0;
let semanticTraceInteractions = new Map();
let semanticTraceResolver = null;
const SEMANTIC_TRACE_DEFAULT_STATUS = "Hover or focus a line to follow it on the board.";
let activeTooltipKey = null;
let viewportFrame = null;
let renderedViewportTransform = null;
let renderedZoomPercent = null;
let geometryFrame = null;
let deepLinkWritesSuppressed = 0;
let boardTransitionGeneration = 0;
let comparisonBoardRenderer = null;
let activeComparisonRecipe = null;
let activeComparisonOrientation = null;
const pendingGeometry = {
  measureGrid: false,
  renderEdges: false,
  fit: false,
};

const state = {
  selection: null,
  focusHasMath: false,
  boardStack: [...initialDeepLink.boardStack],
  boardOrigins: [...initialDeepLink.boardOrigins],
  deepLink: null,
  comparisonState: initialComparisonState,
  comparisonHistory: null,
  edgeRoutes: new Map(),
  edgeAnnotationBoxes: [],
  modelMapView: "root",
  modelMapCollapsed: true,
  modelMapDirty: true,
  isTransitioning: false,
  userMovedViewport: false,
};

const viewport = {
  x: 0,
  y: 0,
  scale: 1,
  minScale: 0.42,
  maxScale: 2.2,
  isPanning: false,
  startClientX: 0,
  startClientY: 0,
  startX: 0,
  startY: 0,
  pointerId: null,
};
const canvasTouchPointers = new Map();
let canvasPinch = null;
let suppressCanvasClicksUntil = 0;

function render() {
  installThemeSwitcher(document.getElementById("rendererThemeSwitcher"));
  renderPageChrome();
  ensureBoardChrome();
  ensureQuestionMenu();
  elements.focusReset.addEventListener("click", resetFocusedDetail);
  elements.focusCompare?.addEventListener("click", onFocusCompareClick);
  elements.focusQuestion?.addEventListener("click", onFocusQuestionClick);
  elements.copyDeepLink?.addEventListener("click", onCopyDeepLinkClick);
  elements.comparisonSwap?.addEventListener("click", onComparisonSwapClick);
  elements.comparisonFitBoth?.addEventListener("click", onComparisonFitBothClick);
  elements.comparisonClose?.addEventListener("click", onComparisonCloseClick);
  elements.comparisonWorkspace?.addEventListener("click", onComparisonWorkspaceClick);
  window.addEventListener("popstate", onDeepLinkPopState);
  applyResolvedDeepLink(initialDeepLink, { canonicalize: false, announceIssues: true });
  applyComparisonResolvedState(initialComparisonState, {
    canonicalize: true,
    announceIssues: true,
  });
}

function renderPageChrome() {
  document.title = `${manifest.architecture.name} — Architecture Renderer`;
  const title = document.getElementById("archTitle");
  if (title) title.textContent = manifest.architecture.name;
  const eyebrow = document.getElementById("rendererEyebrow");
  if (eyebrow) eyebrow.textContent = "Interactive architecture";
  const intro = document.getElementById("rendererIntro");
  if (intro) {
    intro.textContent = "Explore the model from system flow to implementation detail.";
  }
  const focusEyebrow = document.getElementById("focusEyebrow");
  if (focusEyebrow) focusEyebrow.textContent = "Board overview";
  const switcher = document.getElementById("archSwitcher");
  if (switcher && !switcher.dataset.ready) {
    switcher.dataset.ready = "true";
    for (const entry of manifestIndex) {
      const option = document.createElement("option");
      option.value = entry.id;
      option.textContent = entry.name;
      option.selected = entry.id === activeManifestEntry.id;
      switcher.appendChild(option);
    }
    switcher.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      params.set("arch", switcher.value);
      params.delete("board");
      params.delete("node");
      params.delete("compare_arch");
      params.delete("compare_board");
      params.delete("compare_node");
      window.location.search = params.toString();
    });
  }
}

async function ensureRendererModel(architectureId) {
  if (!architectureId) return null;
  if (loadedRendererModels.has(architectureId)) {
    return loadedRendererModels.get(architectureId);
  }
  const entry = manifestIndex.find((candidate) => candidate.id === architectureId);
  if (!entry) return null;
  const { manifest: loadedManifest } = await import(`./${entry.file}`);
  const model = createRendererModel(loadedManifest);
  loadedRendererModels.set(architectureId, model);
  return model;
}

function loadedArchitectureDescriptors() {
  return [...loadedRendererModels.entries()].map(([id, model]) => ({
    id,
    manifest: model.manifest,
  }));
}

function resolveCurrentComparisonState(search = window.location.search) {
  return resolveComparisonState({
    architectures: loadedArchitectureDescriptors(),
    defaultArchitectureId: manifestIndex[0]?.id,
    search,
  });
}

function subjectMatchesLocation(subject, architectureId, boardId) {
  return subject?.sourceSet === architectureId && subject?.boardRef === boardId;
}

function comparisonOrientationFor(primaryArchitectureId, primaryBoardId, comparisonArchitectureId, comparisonBoardId) {
  for (const recipe of comparisonIndex?.items || []) {
    const primary = recipe.subjects?.primary;
    const counterpart = recipe.subjects?.counterpart;
    if (
      subjectMatchesLocation(primary, primaryArchitectureId, primaryBoardId)
      && subjectMatchesLocation(counterpart, comparisonArchitectureId, comparisonBoardId)
    ) {
      return { recipe, primarySide: "primary", comparisonSide: "counterpart" };
    }
    if (
      subjectMatchesLocation(counterpart, primaryArchitectureId, primaryBoardId)
      && subjectMatchesLocation(primary, comparisonArchitectureId, comparisonBoardId)
    ) {
      return { recipe, primarySide: "counterpart", comparisonSide: "primary" };
    }
  }
  return null;
}

function suggestedComparisonForCurrentBoard() {
  const architectureId = activeManifestEntry.id;
  const boardId = currentBoard()?.id;
  for (const recipe of comparisonIndex?.items || []) {
    const primary = recipe.subjects?.primary;
    const counterpart = recipe.subjects?.counterpart;
    if (subjectMatchesLocation(primary, architectureId, boardId)) {
      return { recipe, currentSide: "primary", target: counterpart };
    }
    if (subjectMatchesLocation(counterpart, architectureId, boardId)) {
      return { recipe, currentSide: "counterpart", target: primary };
    }
  }
  return null;
}

function updateCompareAction() {
  if (!elements.focusCompare) return;
  const suggestion = state.comparisonState?.comparison
    ? null
    : suggestedComparisonForCurrentBoard();
  elements.focusCompare.hidden = !suggestion;
  if (!suggestion) return;
  const label = suggestion.target.label || suggestion.target.boardTitle || "comparison";
  elements.focusCompare.title = `Compare with ${label}`;
  elements.focusCompare.setAttribute("aria-label", `Compare this view with ${label}`);
  elements.focusCompare.querySelector("span").textContent = "Compare";
}

function activeAlignment(side) {
  if (!activeComparisonRecipe || !activeComparisonOrientation) return new Map();
  const sourceSide = side === "primary"
    ? activeComparisonOrientation.primarySide
    : activeComparisonOrientation.comparisonSide;
  return buildAlignmentIndex(activeComparisonRecipe, sourceSide);
}

function applyPrimaryComparisonDecorations() {
  clearAlignmentDecorations(elements.moduleLayer);
  if (!state.comparisonState?.comparison || !activeComparisonRecipe) return;
  const alignmentIndex = activeAlignment("primary");
  visibleNodes(currentBoard()).forEach((node) => {
    const alignment = alignmentForNode(node, alignmentIndex);
    if (!alignment) return;
    const element = elements.moduleLayer.querySelector(
      `[data-node-id="${CSS.escape(node.id)}"]`,
    );
    decorateAlignmentElement(element, alignment);
  });
}

function comparisonGroupSummaryHtml(recipe) {
  return (recipe?.groups || []).map((group) => `
    <span class="comparison-group-chip" title="${escapeHtml(group.description || "")}">
      <b>${escapeHtml((group.alignmentRefs || []).length)}</b>
      ${escapeHtml(group.label)}
    </span>
  `).join("");
}

function renderComparisonChrome(resolved, orientation, comparisonModel, board) {
  const recipe = orientation?.recipe;
  const primarySubject = recipe?.subjects?.[orientation.primarySide];
  const comparisonSubject = recipe?.subjects?.[orientation.comparisonSide];
  elements.comparisonQuestion.textContent = recipe?.question || "Architecture comparison";
  elements.comparisonSummary.textContent = recipe?.summary
    || "Compare the two selected architecture boards without changing their source facts.";
  elements.comparisonPrimaryLabel.textContent = primarySubject?.label
    || currentBoard()?.title
    || manifest.architecture.name;
  elements.comparisonCounterpartLabel.textContent = comparisonSubject?.label
    || board.title
    || comparisonModel.manifest.architecture.name;
  elements.comparisonCanvasTitle.textContent = board.title;
  elements.comparisonGroupSummary.innerHTML = comparisonGroupSummaryHtml(recipe);
}

function teardownComparisonWorkspace() {
  const restorePrimaryFocus = elements.comparisonWorkspace.contains(document.activeElement);
  comparisonBoardRenderer?.destroy();
  comparisonBoardRenderer = null;
  activeComparisonRecipe = null;
  activeComparisonOrientation = null;
  clearAlignmentDecorations(elements.moduleLayer);
  elements.comparisonWorkspace.hidden = true;
  elements.canvasWorkspace.classList.remove("is-comparing");
  document.body.classList.remove("is-comparing");
  delete document.body.dataset.comparisonMobileSide;
  updateCompareAction();
  if (restorePrimaryFocus) {
    const target = !elements.focusCompare?.hidden ? elements.focusCompare : elements.canvas;
    target?.focus?.({ preventScroll: true });
  }
}

async function applyComparisonResolvedState(
  resolved,
  { canonicalize = false, announceIssues = false, historyMode = null } = {},
) {
  state.comparisonState = resolved;
  const comparison = resolved?.comparison;
  if (!comparison) {
    teardownComparisonWorkspace();
    if (canonicalize || resolved?.sanitized || historyMode) {
      syncDeepLinkHistory({ mode: historyMode || "replace" });
    } else {
      state.comparisonHistory = currentComparisonHistoryState();
    }
    if (announceIssues) {
      const message = deepLinkIssueMessage(resolved?.issues || []);
      if (message) announceQuestionCopy(message);
    }
    return;
  }

  const comparisonModel = await ensureRendererModel(comparison.architectureId);
  const board = comparisonModel?.indexes?.boardsById?.get(comparison.boardId);
  if (!comparisonModel || !board) {
    state.comparisonState = { ...resolved, comparison: null, selectionSide: null };
    teardownComparisonWorkspace();
    syncDeepLinkHistory({ mode: historyMode || "replace" });
    return;
  }

  activeComparisonOrientation = comparisonOrientationFor(
    activeManifestEntry.id,
    currentBoard()?.id,
    comparison.architectureId,
    comparison.boardId,
  );
  activeComparisonRecipe = activeComparisonOrientation?.recipe || null;
  comparisonBoardRenderer?.destroy();
  elements.comparisonWorkspace.hidden = false;
  elements.canvasWorkspace.classList.add("is-comparing");
  document.body.classList.add("is-comparing");
  document.body.dataset.comparisonMobileSide ||= "primary";
  renderComparisonChrome(resolved, activeComparisonOrientation, comparisonModel, board);
  comparisonBoardRenderer = createComparisonBoardRenderer({
    root: elements.comparisonCanvas,
    surfaceKey: `comparison-${comparison.architectureId}-${comparison.boardId}`,
    rendererModel: comparisonModel,
    board,
    alignmentIndex: activeAlignment("comparison"),
    onSelectNode: (node) => focusComparisonNode(node),
    onSelectEdge: (edge) => focusComparisonEdge(edge),
  });
  await comparisonBoardRenderer.render();
  applyPrimaryComparisonDecorations();
  updateCompareAction();
  updateDeepLinkControl();

  if (resolved.selectionSide === "comparison" && comparison.nodeId) {
    const selectedNode = visibleNodes(board).find((node) => node.id === comparison.nodeId);
    if (selectedNode) focusComparisonNode(selectedNode, { sync: false });
  }

  if (canonicalize || resolved.sanitized || historyMode) {
    syncDeepLinkHistory({ mode: historyMode || "replace" });
  } else {
    state.comparisonHistory = currentComparisonHistoryState();
  }
  if (announceIssues) {
    const message = deepLinkIssueMessage(resolved.issues || []);
    if (message) announceQuestionCopy(message);
  }
}

function comparisonAlignmentForNode(node) {
  return alignmentForNode(node, activeAlignment("comparison"));
}

function comparisonNodeInspectorHtml(node) {
  const alignment = comparisonAlignmentForNode(node);
  const relationship = alignment?.relationship
    ? humanizeRef(alignment.relationship)
    : null;
  const evidenceStatus = alignment?.evidence?.status
    ? humanizeRef(alignment.evidence.status)
    : null;
  const evidenceLocators = (alignment?.evidence?.refs || [])
    .map((ref) => ref.locator)
    .filter(Boolean);
  return `
    <div class="focus-section">
      <p>${escapeHtml(node.role || node.detail || "Reusable comparison-board fact.")}</p>
      <dl class="focus-dl">
        <dt>surface</dt><dd>B · Compare</dd>
        ${node.shape ? `<dt>shape</dt><dd><code>${escapeHtml(node.shape)}</code></dd>` : ""}
        ${node.operation ? `<dt>operation</dt><dd>${escapeHtml(humanizeRef(node.operation))}</dd>` : ""}
        ${alignment?.label ? `<dt>match</dt><dd>${escapeHtml(alignment.label)}</dd>` : ""}
        ${relationship ? `<dt>comparison</dt><dd>${escapeHtml(relationship)}</dd>` : ""}
        ${evidenceStatus ? `<dt>evidence</dt><dd>${escapeHtml(evidenceStatus)}</dd>` : ""}
      </dl>
      ${node.code ? `<h3>Reusable trace</h3><pre class="reuse-code"><code>${escapeHtml(node.code)}</code></pre>` : ""}
      ${node.tex ? `<div class="reuse-equation">\\[${escapeHtml(node.tex)}\\]</div>` : ""}
      ${alignment?.statement ? `<h3>Why these correspond</h3><p>${escapeHtml(alignment.statement)}</p>` : ""}
      ${evidenceLocators.length
        ? `<p><strong>Checked at:</strong> ${evidenceLocators.map((locator) => `<code>${escapeHtml(locator)}</code>`).join(", ")}</p>`
        : ""}
      ${node.instance_fact_ref || node.template_fact_ref
        ? `<p><strong>Fact:</strong> <code>${escapeHtml(node.instance_fact_ref || node.template_fact_ref)}</code></p>`
        : ""}
    </div>
  `;
}

function focusComparisonNode(node, { sync = true } = {}) {
  state.selection = null;
  clearActiveNodes();
  comparisonBoardRenderer?.selectNode(node.id);
  state.comparisonState = setComparisonSelection(state.comparisonState, {
    side: "comparison",
    nodeId: node.id,
    selectedNode: node,
  });
  if (elements.focusQuestion) elements.focusQuestion.hidden = true;
  elements.focusTitle.textContent = node.label || node.id;
  setFocusBody(comparisonNodeInspectorHtml(node), { selected: true });
  updateDeepLinkControl();
  if (sync) syncDeepLinkHistory({ mode: "replace" });
}

function focusComparisonEdge(edge) {
  state.selection = null;
  clearActiveNodes();
  comparisonBoardRenderer?.selectEdge(edge.comparison_edge_index);
  state.comparisonState = setComparisonSelection(state.comparisonState, {
    side: "comparison",
    nodeId: null,
  });
  if (elements.focusQuestion) elements.focusQuestion.hidden = true;
  elements.focusTitle.textContent = edge.connection?.title || "Comparison connection";
  setFocusBody(`
    <div class="focus-section">
      <p>${escapeHtml(edge.connection?.inside || "Reusable template information flow.")}</p>
      <dl class="focus-dl"><dt>surface</dt><dd>B · Compare</dd></dl>
    </div>
  `, { selected: true });
  updateDeepLinkControl();
  syncDeepLinkHistory({ mode: "replace" });
}

async function onFocusCompareClick() {
  const suggestion = suggestedComparisonForCurrentBoard();
  if (!suggestion) return;
  const targetModel = await ensureRendererModel(suggestion.target.sourceSet);
  if (!targetModel) return;
  const primaryLink = currentRendererDeepLink();
  const search = writeComparisonLink(window.location.search, {
    defaultArchitectureId: manifestIndex[0]?.id,
    primary: {
      architectureId: activeManifestEntry.id,
      rootBoardId: manifest.boards.rootBoard,
      boardId: primaryLink.boardId,
      nodeId: primaryLink.nodeId,
    },
    comparison: {
      architectureId: suggestion.target.sourceSet,
      rootBoardId: targetModel.manifest.boards.rootBoard,
      boardId: suggestion.target.boardRef,
      nodeId: null,
    },
    selectionSide: primaryLink.nodeId ? "primary" : null,
  });
  const resolved = resolveCurrentComparisonState(search);
  await applyComparisonResolvedState(resolved, { historyMode: "push" });
}

function onComparisonCloseClick() {
  state.comparisonState = {
    ...state.comparisonState,
    comparison: null,
    selectionSide: state.selection?.kind === "node" ? "primary" : null,
  };
  teardownComparisonWorkspace();
  focusOverview();
  syncDeepLinkHistory({ mode: "push" });
}

async function onComparisonSwapClick() {
  const comparison = state.comparisonState?.comparison;
  if (!comparison) return;
  const primary = currentComparisonHistoryState().primary;
  const comparisonModel = await ensureRendererModel(comparison.architectureId);
  if (!comparisonModel) return;
  const swappedSearch = writeComparisonLink(window.location.search, {
    defaultArchitectureId: manifestIndex[0]?.id,
    primary: {
      architectureId: comparison.architectureId,
      rootBoardId: comparison.rootBoardId,
      boardId: comparison.boardId,
      nodeId: null,
    },
    comparison: {
      architectureId: activeManifestEntry.id,
      rootBoardId: manifest.boards.rootBoard,
      boardId: primary.boardId,
      nodeId: null,
    },
    selectionSide: null,
  });
  if (comparison.architectureId !== activeManifestEntry.id) {
    window.location.search = swappedSearch;
    return;
  }
  const primaryResolved = resolveDeepLink({
    boards: manifest.boards.items,
    rootBoardId: manifest.boards.rootBoard,
    search: swappedSearch,
  });
  const combined = resolveCurrentComparisonState(swappedSearch);
  applyResolvedDeepLink(primaryResolved, { canonicalize: false });
  await applyComparisonResolvedState(combined, { historyMode: "push" });
}

function onComparisonFitBothClick() {
  state.userMovedViewport = false;
  fitToContent({ readable: false });
  comparisonBoardRenderer?.surface.fit();
}

function onComparisonWorkspaceClick(event) {
  const side = event.target.closest("[data-comparison-mobile-side]")?.dataset.comparisonMobileSide;
  if (!side) return;
  document.body.dataset.comparisonMobileSide = side;
  elements.comparisonWorkspace.querySelectorAll("[data-comparison-mobile-side]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.comparisonMobileSide === side));
  });
}

window.addEventListener("mathjax-ready", () => {
  typesetMath();
  typesetSemanticTraceMath();
  refreshBoardAfterMath();
});

window.addEventListener("elk-ready", () => {
  if (!useElkLayout) return;
  const graph = displayGraph(currentBoard());
  state.displayEdges = graph.edges;
  layoutBoard(graph);
});

function typesetBoardMathAsync() {
  const mathJax = window.MathJax;
  if (!mathJax?.typesetPromise) return Promise.resolve();
  mathJax.typesetClear?.([elements.moduleLayer]);
  return mathJax
    .typesetPromise([elements.moduleLayer])
    .catch((error) => console.warn("MathJax board typesetting failed", error));
}

function setFocusBody(html, { selected = false } = {}) {
  hideCanvasTooltip();
  elements.focusEyebrow.textContent = selected ? "Selected" : "Board overview";
  elements.focusReset.hidden = !selected;
  elements.focusPanel.classList.toggle("is-selected", selected);
  elements.focusPanel.dataset.mode = selected ? "selected" : "overview";
  elements.focusBody.innerHTML = html;
  state.focusHasMath = html.includes("math-step");
  typesetMath();
  renderSemanticTracePane();
}

function semanticBlockInstanceRef() {
  const board = currentBoard();
  const selectedNode = state.selection?.kind === "node" ? state.selection.node : null;
  const direct = selectedNode?.block_instance_ref
    || selectedNode?.blockInstanceRef
    || board.blockInstanceRef
    || board.block_instance_ref;
  if (direct) return untypedRef(direct, "block_instances");
  const subjectRef = selectedNode ? canonicalNodeRef(selectedNode) : null;
  if (subjectRef) return (blockInstancesBySubject.get(subjectRef) || [])[0]?.id || null;
  return null;
}

function semanticProgramContexts() {
  return Object.values(manifest.pseudocode || {}).map((program) => ({
    program,
    symbolsById: new Map((program.symbols || []).map((symbol) => [symbol.id, symbol])),
  }));
}

function semanticScopeSubtitle(scope) {
  if (!scope) return null;
  const kind = readableReuse(scope.kind || "scope");
  const executionRef = scope.executionRef || scope.execution_ref;
  if (scope.kind !== "loop" || !executionRef?.startsWith("execution.loops.")) return kind;
  const loopId = untypedRef(executionRef, "execution").replace(/^loops\./, "");
  const loop = (manifest.architecture.execution?.loops || []).find(
    (candidate) => candidate.id === loopId,
  );
  return loop?.repeats ? `${kind} · repeat ×${loop.repeats}` : kind;
}

function semanticTraceForCurrentContext() {
  if (
    state.comparisonState?.comparison
    && state.comparisonState.selectionSide === "comparison"
  ) {
    semanticTraceResolver = null;
    return {
      title: "Comparison pseudocode",
      subtitle: "Pseudocode synchronization is currently scoped to A · Current. Select the primary board to trace it.",
      statements: [],
    };
  }
  semanticTraceResolver = createSemanticBoardResolver({ manifest, board: currentBoard() });
  const instanceId = semanticBlockInstanceRef();
  const instance = instanceId ? blockInstancesById.get(instanceId) : null;
  if (instance?.pseudocode?.length) {
    const block = standardBlocksById.get(instance.standardBlockId);
    const selectedNode = state.selection?.kind === "node" ? state.selection.node : null;
    const detailBoard = selectedNode ? targetBoardForNode(selectedNode) : null;
    const segments = currentBoard().segments?.length
      ? currentBoard().segments
      : detailBoard?.segments || [];
    return {
      title: block?.name || instance.standardBlockName || instance.standardBlockId,
      subtitle: `${instance.variantLabel || readableReuse(instance.variant)} · reusable ${readableReuse(instance.conformance)}`,
      statements: instance.pseudocode.map((statement) => ({
        statement,
        symbolsById: new Map(),
        boundaryRefs: [instance.subjectRef || instance.subject_ref].filter(Boolean),
        phase: segments.find((segment) =>
          (segment.node_ids || segment.nodeIds || []).includes(statement.id),
        ) || null,
      })),
    };
  }

  const selectedId = state.selection?.kind === "node" ? state.selection.occurrenceId : null;
  const contexts = semanticProgramContexts();
  const candidates = contexts.flatMap(({ program, symbolsById }) => {
    const activeScope = semanticScopeForBoard({
      program,
      board: currentBoard(),
      rootBoardId: manifest.boards.rootBoard,
    });
    return (program.lines || []).map((statement) => ({
      statement,
      symbolsById,
      program,
      activeScope,
    }));
  });
  const scopedCandidates = candidates.filter(({ statement, activeScope }) => {
    if (!activeScope) return true;
    const activeRef = activeScope.ref || `scopes.${activeScope.id}`;
    return (statement.scopeRef || statement.scope_ref) === activeRef;
  });
  const statementMatches = selectedId ? scopedCandidates.filter(({ statement }) => {
    const resolved = semanticTraceResolver.resolve(semanticRefsForStatement(statement));
    return resolved.nodeIds.includes(selectedId);
  }) : [];
  const bindingMatches = selectedId && !statementMatches.length
    ? scopedCandidates.filter(({ statement, symbolsById }) => {
      const refs = semanticStatementBindings(statement).flatMap((binding) => (
        semanticRefsForBinding(binding, symbolsById)
      ));
      return semanticTraceResolver.resolve(refs).nodeIds.includes(selectedId);
    })
    : [];
  const activeScopes = scopedCandidates.map(({ activeScope }) => activeScope).filter(Boolean);
  const scoped = !selectedId && activeScopes.length ? scopedCandidates : [];
  const boardRefs = new Set([
    currentBoard().subject_ref || currentBoard().subjectRef,
    ...visibleNodes(currentBoard()).map(canonicalNodeRef),
  ].filter(Boolean));
  const unscopedCandidates = candidates.filter(({ activeScope }) => !activeScope);
  const boardFactMatches = !selectedId && !scoped.length
    ? unscopedCandidates.filter(({ statement }) =>
      semanticRefsForStatement(statement).some((ref) => boardRefs.has(ref)),
    )
    : [];
  const projectedMatches = !selectedId && !scoped.length && !boardFactMatches.length
    ? unscopedCandidates.filter(({ statement, symbolsById }) => {
      const refs = [
        ...semanticRefsForStatement(statement),
        ...semanticStatementBindings(statement).flatMap((binding) => (
          semanticRefsForBinding(binding, symbolsById)
        )),
      ];
      const resolved = semanticTraceResolver.resolve(refs);
      return resolved.nodeIds.length > 0;
    })
    : [];
  const fallback = !selectedId && currentBoard().id === manifest.boards.rootBoard
    ? candidates
    : [];
  const statements = statementMatches.length
    ? statementMatches
    : bindingMatches.length
      ? bindingMatches
      : scoped.length
        ? scoped
        : boardFactMatches.length
          ? boardFactMatches
          : projectedMatches.length
            ? projectedMatches
            : fallback;
  const scope = statements[0]?.activeScope || activeScopes[0] || null;
  return {
    title: scope?.label || statements[0]?.program?.title || "Architecture trace",
    subtitle: selectedId
      ? [semanticScopeSubtitle(scope), "statements associated with the selected component"]
        .filter(Boolean).join(" · ")
      : semanticScopeSubtitle(scope) || "Statements visible at this board level",
    statements,
  };
}

function resolveSemanticInteraction(refs, boundaryRefs = []) {
  const exact = semanticTraceResolver.resolve(refs);
  if (exact.nodeIds.length) return exact;
  const edge = semanticEdgeForRefs(state.displayEdges || [], refs);
  if (edge) {
    return {
      nodeIds: [edge.from, edge.to].filter(Boolean),
      requestedRefs: exact.requestedRefs,
      resolution: "relation",
      edge,
      message: "This statement is a state transition, so its visible connection and endpoints are highlighted.",
    };
  }
  if (!boundaryRefs.length) return exact;
  const boundary = semanticTraceResolver.resolve(boundaryRefs);
  if (!boundary.nodeIds.length) return exact;
  return {
    ...boundary,
    resolution: "boundary",
    requestedRefs: exact.requestedRefs,
    message: "This internal fact is not expanded here, so the owning block is highlighted as its visible boundary.",
  };
}

function semanticInteractionMarkup({
  refs,
  resolution,
  kind,
  access = null,
  text,
  tex = null,
  label = null,
}) {
  const id = `semantic-trace-${semanticTraceInteractions.size + 1}`;
  semanticTraceInteractions.set(id, { refs, resolution, kind, access, label });
  const classes = [kind === "token" ? "semantic-token" : ""];
  if (resolution.resolution === "boundary" || resolution.resolution === "representation") {
    classes.push("is-semantic-boundary");
  }
  if (!resolution.nodeIds.length) classes.push("is-semantic-unavailable");
  const title = resolution.message || `${access || "statement"}: ${label || text}`;
  if (kind === "token") {
    const accessibleLabel = `${access || "read"}: ${label || text}`;
    const fallback = semanticTexFallbackParts(tex);
    const fallbackMarkup = fallback
      ? `<span class="semantic-token-math-fallback"><i>${escapeHtml(fallback.base)}</i>${fallback.subscript ? `<sub>${escapeHtml(fallback.subscript)}</sub>` : ""}</span>`
      : `<span class="semantic-token-math-fallback">${escapeHtml(text)}</span>`;
    const tokenMarkup = tex
      ? `<span class="semantic-token-math" aria-hidden="true">${fallbackMarkup}<span class="semantic-token-math-source">\\(${escapeHtml(tex)}\\)</span></span><span class="sr-only">${escapeHtml(text)}</span>`
      : escapeHtml(text);
    return `<button type="button" class="${classes.join(" ")}" data-semantic-interaction="${id}" data-access="${escapeHtml(access || "read")}" aria-label="${escapeHtml(accessibleLabel)}" title="${escapeHtml(title)}">${tokenMarkup}</button>`;
  }
  return { id, title };
}

function semanticPlainCodeMarkup(value) {
  return escapeHtml(value)
    .replaceAll("; ", ';<br class="semantic-code-hard-break">')
    .replaceAll(" = ", " =<wbr> ")
    .replaceAll(", ", ",<wbr> ")
    .replaceAll(" + ", " <wbr>+&nbsp;")
    .replaceAll(" - ", " <wbr>-&nbsp;")
    .replaceAll(" * ", " <wbr>*&nbsp;")
    .replaceAll(" / ", " <wbr>/&nbsp;")
    .replaceAll("(", "(<wbr>");
}

function semanticCodeAtomSuffix(value) {
  const text = String(value || "");
  const accessor = text.match(/^(?:\.[A-Za-z_][A-Za-z0-9_]*)+(?:[)\]}]+)?(?:,)?/);
  if (accessor) return accessor[0];
  return text.match(/^[)\]}]+(?:,)?|^,/)?.[0] || "";
}

function semanticOperationLabel(operation) {
  const replacements = new Map([
    ["ddim", "DDIM"],
    ["ipa", "IPA"],
    ["pdb", "PDB"],
    ["qkv", "QKV"],
    ["frenet", "Frenet"],
  ]);
  return humanizeRef(operation).split(" ").map((word, index) => {
    const known = replacements.get(word.toLowerCase());
    if (known) return known;
    return index === 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word;
  }).join(" ");
}

function semanticCommentMarkup(comment) {
  const words = String(comment || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  return `<span class="semantic-code-comment"><span class="semantic-code-comment-prefix" aria-hidden="true">#</span> ${words
    .map((word) => `<span class="semantic-code-comment-word">${escapeHtml(word)}</span>`)
    .join(" ")}</span>`;
}

function semanticStatementMarkup(item) {
  const { statement, symbolsById, boundaryRefs = [] } = item;
  const { code, comment } = semanticStatementTextParts(statement);
  const bindings = semanticStatementBindings(statement);
  const statementRefs = semanticRefsForStatement(statement);
  const statementResolution = resolveSemanticInteraction(statementRefs, boundaryRefs);
  const statementInteraction = semanticInteractionMarkup({
    refs: statementRefs,
    resolution: statementResolution,
    kind: "statement",
    text: code,
    label: statement.label || statement.id,
  });
  const codeSegments = semanticCodeSegments(code, bindings).map((segment) => ({ ...segment }));
  const segments = codeSegments.map((segment, index) => {
    if (!segment.binding) return semanticPlainCodeMarkup(segment.text);
    const refs = semanticRefsForBinding(segment.binding, symbolsById);
    const resolution = resolveSemanticInteraction(refs, boundaryRefs);
    const token = semanticInteractionMarkup({
      refs,
      resolution,
      kind: "token",
      access: segment.binding.access,
      text: segment.text,
      tex: semanticTexForBinding(segment.binding, symbolsById),
      label: segment.binding.lexeme,
    });
    const following = codeSegments[index + 1];
    const suffix = following && !following.binding ? semanticCodeAtomSuffix(following.text) : "";
    if (suffix) following.text = following.text.slice(suffix.length);
    return `<span class="semantic-code-atom">${token}${semanticPlainCodeMarkup(suffix)}</span>`;
  }).join("");
  const codeMarkup = `<span class="semantic-code-expression">${segments}</span>${semanticCommentMarkup(comment)}`;
  const label = statement.label || (statement.operation ? semanticOperationLabel(statement.operation) : null);
  const callee = semanticCalleeForStatement(item);
  return `
    <li
      class="semantic-trace-line${statementResolution.nodeIds.length ? "" : " is-semantic-unavailable"}"
      tabindex="0"
      data-semantic-interaction="${statementInteraction.id}"
      title="${escapeHtml(statementInteraction.title)}"
    >
      <code class="semantic-trace-code">${codeMarkup}</code>
      ${label || callee ? `<span class="semantic-trace-label">
        ${label ? `<span>${escapeHtml(label)}</span>` : ""}
        ${callee ? `<button type="button" class="semantic-trace-drill" data-semantic-callee-board="${escapeHtml(callee.boardId)}" aria-label="Zoom into ${escapeHtml(callee.label)}" title="Zoom into ${escapeHtml(callee.label)}">${magnifyIconMarkup()}</button>` : ""}
      </span>` : ""}
    </li>
  `;
}

function semanticCalleeForStatement({ statement, program }) {
  const calleeScopeRef = statement.calleeScopeRef || statement.callee_scope_ref;
  let subjectRef = null;
  let label = null;
  if (calleeScopeRef && program) {
    const scope = (program.scopes || []).find(
      (candidate) => (candidate.ref || `scopes.${candidate.id}`) === calleeScopeRef,
    );
    subjectRef = scope?.subjectRef || scope?.subject_ref;
    label = scope?.label;
  }
  const blockInstanceRef = statement.blockInstanceRef || statement.block_instance_ref;
  if (!subjectRef && blockInstanceRef) {
    const instance = blockInstancesById.get(untypedRef(blockInstanceRef, "block_instances"));
    subjectRef = instance?.subjectRef || instance?.subject_ref;
    label = instance?.standardBlockName;
  }
  if (!subjectRef) {
    const statementRef = statement.statementRef || statement.statement_ref;
    if (statementRef?.startsWith("modules.")) {
      subjectRef = statementRef;
      label = statement.label || humanizeRef(statementRef);
    }
  }
  if (!subjectRef) return null;
  const node = visibleNodes(currentBoard()).find(
    (candidate) => canonicalNodeRef(candidate) === subjectRef,
  );
  const board = node ? targetBoardForNode(node) : null;
  return board ? { boardId: board.id, label: label || board.title } : null;
}

function semanticStatementsMarkup(statements) {
  let currentPhase = null;
  return statements.map((item) => {
    const phaseId = item.phase?.id || null;
    const heading = phaseId && phaseId !== currentPhase
      ? `<li class="semantic-trace-phase">
          <strong>${item.phase.order ? `Phase ${escapeHtml(item.phase.order)} · ` : ""}${escapeHtml(item.phase.label || humanizeRef(phaseId))}</strong>
          ${item.phase.description ? `<span>${escapeHtml(item.phase.description)}</span>` : ""}
        </li>`
      : "";
    currentPhase = phaseId;
    return `${heading}${semanticStatementMarkup(item)}`;
  }).join("");
}

function renderSemanticTracePane() {
  if (!elements.semanticTraceBody) return;
  window.MathJax?.typesetClear?.([elements.semanticTraceBody]);
  elements.semanticTraceBody.classList.remove("has-mathjax");
  semanticTraceInteractions = new Map();
  const trace = semanticTraceForCurrentContext();
  elements.semanticTraceCount.textContent = trace.statements.length
    ? String(trace.statements.length)
    : "";
  elements.semanticTraceBody.innerHTML = `
    <div class="semantic-trace-heading">
      <strong>${escapeHtml(trace.title)}</strong>
      <span>${escapeHtml(trace.subtitle)}</span>
    </div>
    <div class="semantic-trace-scroll">
      ${trace.statements.length
        ? `<ol class="semantic-trace-list">${semanticStatementsMarkup(trace.statements)}</ol>`
        : '<p class="semantic-trace-empty">No semantic statements are mapped to this board yet.</p>'}
    </div>
    <p class="semantic-trace-status" role="status" aria-live="polite">${SEMANTIC_TRACE_DEFAULT_STATUS}</p>
  `;
  elements.semanticTraceBody.querySelectorAll("[data-semantic-interaction]").forEach((element) => {
    attachSemanticTraceInteraction(element);
  });
  elements.semanticTraceBody.querySelectorAll("[data-semantic-callee-board]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const boardId = button.dataset.semanticCalleeBoard;
      const origin = visibleNodes(currentBoard()).find(
        (node) => targetBoardForNode(node)?.id === boardId,
      );
      pushBoard(boardId, origin?.id || null);
    });
  });
  applySemanticTraceSelection();
  renderLatestConnectivityHighlight();
  typesetSemanticTraceMath();
}

function semanticTraceStatus(message = SEMANTIC_TRACE_DEFAULT_STATUS) {
  const status = elements.semanticTraceBody?.querySelector(".semantic-trace-status");
  if (status) status.textContent = message;
}

function attachSemanticTraceInteraction(element) {
  const id = element.dataset.semanticInteraction;
  const interaction = semanticTraceInteractions.get(id);
  if (!interaction) return;
  const source = `semantic:${id}`;
  const begin = () => {
    semanticTraceStatus(interaction.resolution.message || SEMANTIC_TRACE_DEFAULT_STATUS);
    if (interaction.resolution.nodeIds.length) {
      beginConnectivityHighlight(source, interaction.resolution.nodeIds, { dimUnrelated: true });
    }
  };
  const end = () => {
    endConnectivityHighlight(source);
    semanticTraceStatus();
  };
  element.addEventListener("pointerenter", begin);
  element.addEventListener("pointerleave", end);
  element.addEventListener("focus", begin);
  element.addEventListener("blur", end);
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    endConnectivityHighlight(source);
    activateSemanticInteraction(interaction);
  });
}

function activateSemanticInteraction(interaction) {
  const edge = interaction.resolution.edge
    || semanticEdgeForRefs(state.displayEdges || [], interaction.refs);
  if (edge) {
    focusConnection(edge);
    return;
  }
  const nodeId = interaction.resolution.nodeIds[0];
  if (nodeId && focusNodeOccurrence(nodeId)) return;
  semanticTraceStatus(interaction.resolution.message);
}

function clearSemanticTraceTransientHighlight() {
  elements.semanticTraceBody
    ?.querySelectorAll(".is-trace-transient")
    .forEach((element) => element.classList.remove("is-trace-transient"));
}

function applySemanticTraceTransientHighlight(nodeIds) {
  const highlighted = new Set(connectivityNodeIds(nodeIds));
  elements.semanticTraceBody?.querySelectorAll("[data-semantic-interaction]").forEach((element) => {
    const interaction = semanticTraceInteractions.get(element.dataset.semanticInteraction);
    const matches = interaction?.resolution.nodeIds.some((nodeId) => highlighted.has(nodeId));
    element.classList.toggle("is-trace-transient", Boolean(matches));
  });
}

function applySemanticTraceSelection() {
  const selectedId = state.selection?.kind === "node"
    && state.selection.boardId === currentBoard().id
    ? state.selection.occurrenceId
    : null;
  elements.semanticTraceBody?.querySelectorAll("[data-semantic-interaction]").forEach((element) => {
    const interaction = semanticTraceInteractions.get(element.dataset.semanticInteraction);
    element.classList.toggle(
      "is-trace-selected",
      Boolean(selectedId && interaction?.resolution.nodeIds.includes(selectedId)),
    );
  });
}

function showCanvasTooltip(sourceKey, { title, html, anchor }) {
  const key = sourceKey || "transient-tooltip";
  activeTooltipKey = key;
  elements.canvasTooltip.setAttribute("aria-label", title || "Architecture preview");
  elements.canvasTooltip.innerHTML = html;
  elements.canvasTooltip.hidden = false;
  positionCanvasTooltip(anchor);
  typesetCanvasTooltip(html);
}

function positionCanvasTooltip(anchor) {
  const anchorRect = anchor?.getBoundingClientRect?.();
  if (!anchorRect) return;
  const canvasRect = elements.canvas.getBoundingClientRect();
  const tooltipRect = elements.canvasTooltip.getBoundingClientRect();
  const gap = 12;
  let left = anchorRect.right + gap;
  if (left + tooltipRect.width > canvasRect.right - 8) {
    left = anchorRect.left - tooltipRect.width - gap;
  }
  const top = clamp(
    anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2,
    canvasRect.top + 8,
    Math.max(canvasRect.top + 8, canvasRect.bottom - tooltipRect.height - 8),
  );
  elements.canvasTooltip.style.left = `${clamp(
    left,
    canvasRect.left + 8,
    Math.max(canvasRect.left + 8, canvasRect.right - tooltipRect.width - 8),
  )}px`;
  elements.canvasTooltip.style.top = `${top}px`;
}

function hideCanvasTooltip(sourceKey = null) {
  if (sourceKey && activeTooltipKey !== sourceKey) return;
  if (activeTooltipKey === null && elements.canvasTooltip.hidden) return;
  const mathJax = window.MathJax;
  mathJax?.typesetClear?.([elements.canvasTooltip]);
  activeTooltipKey = null;
  elements.canvasTooltip.hidden = true;
  elements.canvasTooltip.innerHTML = "";
}

function typesetCanvasTooltip(html) {
  if (!html.includes("math-step") && !html.includes("\\(")) return;
  const mathJax = window.MathJax;
  if (!mathJax?.typesetPromise) return;
  mathJax.typesetClear?.([elements.canvasTooltip]);
  mathJax.typesetPromise([elements.canvasTooltip]).catch((error) => {
    console.warn("MathJax tooltip typesetting failed", error);
  });
}

function connectivityNodeIds(nodeIds) {
  return [...new Set((Array.isArray(nodeIds) ? nodeIds : [nodeIds]).filter(Boolean))];
}

function beginConnectivityHighlight(sourceKey, nodeIds, { dimUnrelated = false } = {}) {
  const key = sourceKey || "transient-connectivity";
  connectivityHighlights.set(key, {
    nodeIds: connectivityNodeIds(nodeIds),
    dimUnrelated,
    sequence: ++connectivityHighlightSequence,
  });
  renderLatestConnectivityHighlight();
}

function endConnectivityHighlight(sourceKey) {
  if (!sourceKey) {
    clearConnectivityHighlights();
    return;
  }
  connectivityHighlights.delete(sourceKey);
  renderLatestConnectivityHighlight();
}

function clearConnectivityHighlights() {
  connectivityHighlights.clear();
  clearConnectivityHighlightSurface();
}

function clearConnectivityHighlightSurface() {
  elements.edgeLayer
    .querySelectorAll(".is-connectivity-input, .is-connectivity-output, .is-connectivity-muted")
    .forEach((element) => {
      element.classList.remove(
        "is-connectivity-input",
        "is-connectivity-output",
        "is-connectivity-muted",
      );
    });
  elements.moduleLayer
    .querySelectorAll(".is-connectivity-focus, .is-connectivity-source, .is-connectivity-target, .is-connectivity-muted")
    .forEach((element) => {
      element.classList.remove(
        "is-connectivity-focus",
        "is-connectivity-source",
        "is-connectivity-target",
        "is-connectivity-muted",
      );
    });
  clearSemanticTraceTransientHighlight();
}

function renderLatestConnectivityHighlight() {
  const latest = Array.from(connectivityHighlights.values()).reduce(
    (current, highlight) => (
      !current || highlight.sequence > current.sequence ? highlight : current
    ),
    null,
  );
  if (!latest) {
    clearConnectivityHighlightSurface();
    return;
  }
  applyConnectivityHighlight(latest.nodeIds, { dimUnrelated: latest.dimUnrelated });
}

function applyConnectivityHighlight(nodeIds, { dimUnrelated = false } = {}) {
  clearConnectivityHighlightSurface();
  const focusIds = new Set(connectivityNodeIds(nodeIds));
  if (!focusIds.size) return;
  const edges = state.displayEdges || [];
  const directionByEdge = new Map();
  const sourceIds = new Set();
  const targetIds = new Set();

  edges.forEach((edge, index) => {
    const isInput = focusIds.has(edge.to) && !focusIds.has(edge.from);
    const isOutput = focusIds.has(edge.from) && !focusIds.has(edge.to);
    const isInternal = focusIds.has(edge.from) && focusIds.has(edge.to);
    if (!isInput && !isOutput && !isInternal) return;
    directionByEdge.set(index, isInternal ? "both" : isInput ? "input" : "output");
    if (isInput) sourceIds.add(edge.from);
    if (isOutput) targetIds.add(edge.to);
  });

  elements.edgeLayer.querySelectorAll("[data-edge-index]").forEach((element) => {
    const direction = directionByEdge.get(Number(element.dataset.edgeIndex));
    element.classList.toggle("is-connectivity-input", direction === "input" || direction === "both");
    element.classList.toggle("is-connectivity-output", direction === "output" || direction === "both");
    element.classList.toggle("is-connectivity-muted", !direction);
  });

  elements.moduleLayer.querySelectorAll("[data-node-id]").forEach((element) => {
    const candidateId = element.dataset.nodeId;
    const focused = focusIds.has(candidateId);
    const source = sourceIds.has(candidateId);
    const target = targetIds.has(candidateId);
    element.classList.toggle("is-connectivity-focus", focused);
    element.classList.toggle("is-connectivity-source", source);
    element.classList.toggle("is-connectivity-target", target);
    element.classList.toggle("is-connectivity-muted", dimUnrelated && !focused && !source && !target);
  });
  applySemanticTraceTransientHighlight([...focusIds]);
}

function typesetMath() {
  if (!state.focusHasMath) return;
  const mathJax = window.MathJax;
  if (!mathJax?.typesetPromise) return;
  mathJax.typesetClear?.([elements.focusBody]);
  mathJax.typesetPromise([elements.focusBody]).catch((error) => {
    console.warn("MathJax typesetting failed", error);
  });
}

function typesetSemanticTraceMath() {
  if (!elements.semanticTraceBody?.querySelector(".semantic-token-math")) return;
  const mathJax = window.MathJax;
  if (!mathJax?.typesetPromise) return;
  mathJax.typesetClear?.([elements.semanticTraceBody]);
  mathJax.typesetPromise([elements.semanticTraceBody])
    .then(() => {
      if (elements.semanticTraceBody.querySelector(".semantic-token-math-source mjx-container")) {
        elements.semanticTraceBody.classList.add("has-mathjax");
      }
    })
    .catch((error) => {
      console.warn("MathJax pseudocode typesetting failed", error);
    });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function magnifyIconMarkup() {
  return `
    <svg class="arch-drill-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="10.5" cy="10.5" r="5.75"></circle>
      <path d="m15 15 4.25 4.25"></path>
    </svg>
  `;
}

function safeHref(value) {
  const href = String(value || "").trim();
  if (!href || /^(?:data|javascript|vbscript):/i.test(href)) return null;
  return href;
}

function audienceHref(value) {
  const href = safeHref(value);
  if (!href) return null;
  const path = href.split(/[?#]/, 1)[0];
  return /\.ya?ml$/i.test(path) ? null : href;
}

function renderMathStep(step) {
  if (typeof step === "string") return `<li><code>${escapeHtml(step)}</code></li>`;
  const tex = step.tex ? `<span class="math-step">\\(${escapeHtml(step.tex)}\\)</span>` : "";
  const text = step.text ? `<code>${escapeHtml(step.text)}</code>` : "";
  return `<li>${tex}${text}</li>`;
}

function ensureBoardChrome() {
  if (!elements.boardNavigation.dataset.ready) {
    elements.boardNavigation.dataset.ready = "true";
    elements.boardNavigation.addEventListener("click", onBoardNavigationClick);
  }
  ensurePanZoom();
  ensureModelMap();
  elements.canvas.tabIndex = -1;
}

function currentBoard() {
  return boardsById.get(state.boardStack.at(-1)) || boardsById.get(manifest.boards.rootBoard);
}

function withDeepLinkWritesSuppressed(callback) {
  deepLinkWritesSuppressed += 1;
  try {
    return callback();
  } finally {
    deepLinkWritesSuppressed -= 1;
  }
}

function currentRendererDeepLink() {
  const boardId = currentBoard()?.id || manifest.boards.rootBoard;
  const nodeId = state.selection?.kind === "node" && state.selection.boardId === boardId
    ? state.selection.occurrenceId
    : null;
  return { boardId, nodeId };
}

function currentComparisonHistoryState(link = currentRendererDeepLink()) {
  const comparison = state.comparisonState?.comparison;
  const selectionSide = comparison?.nodeId
    ? "comparison"
    : link.nodeId
      ? "primary"
      : null;
  return {
    primary: {
      architectureId: activeManifestEntry.id,
      rootBoardId: manifest.boards.rootBoard,
      boardId: link.boardId,
      nodeId: selectionSide === "primary" ? link.nodeId : null,
    },
    comparison: comparison
      ? {
        architectureId: comparison.architectureId,
        rootBoardId: comparison.rootBoardId,
        boardId: comparison.boardId,
        nodeId: selectionSide === "comparison" ? comparison.nodeId : null,
      }
      : null,
    selectionSide,
  };
}

function canonicalDeepLinkSearch(link = currentRendererDeepLink()) {
  const location = currentComparisonHistoryState(link);
  return writeComparisonLink(window.location.search, {
    defaultArchitectureId: manifestIndex[0]?.id,
    primary: location.primary,
    comparison: location.comparison,
    selectionSide: location.selectionSide,
  });
}

function deepLinkLocation(search) {
  return `${window.location.pathname}${search}${window.location.hash}`;
}

function syncDeepLinkHistory({ mode = null } = {}) {
  if (deepLinkWritesSuppressed) return;
  const next = currentRendererDeepLink();
  const previous = state.deepLink;
  const nextComparison = currentComparisonHistoryState(next);
  const requestedMode = mode || (
    nextComparison.comparison || state.comparisonHistory?.comparison
      ? comparisonHistoryMode(state.comparisonHistory, nextComparison)
      : deepLinkHistoryMode(previous, next)
  );
  if (requestedMode === "none") return;
  const search = canonicalDeepLinkSearch(next);
  const location = deepLinkLocation(search);
  const currentLocation = deepLinkLocation(window.location.search);
  state.deepLink = next;
  state.comparisonHistory = nextComparison;
  if (location === currentLocation) return;
  const historyMode = requestedMode === "push" ? "pushState" : "replaceState";
  window.history[historyMode]({ architectureDeepLink: nextComparison }, "", location);
}

function deepLinkIssueMessage(issues = []) {
  const codes = new Set(issues.map((issue) => issue.code));
  if (codes.has("unknown_arch")) {
    return `That shared architecture is not available, so ${activeManifestEntry.name} was opened instead.`;
  }
  if (codes.has("unknown_board") || codes.has("unreachable_board")) {
    return "That shared architecture view is no longer available, so the overview was opened instead.";
  }
  if (codes.has("unknown_node")) {
    return "That shared component is no longer on this board, so the board overview was opened instead.";
  }
  if (codes.has("unknown_compare_arch")) {
    return "That comparison target is no longer available, so the primary architecture view was kept.";
  }
  if (codes.has("unknown_compare_board")) {
    return "That comparison view is no longer available, so its architecture overview was opened instead.";
  }
  if (codes.has("unknown_compare_node")) {
    return "That compared component is no longer on its board, so the comparison overview was opened instead.";
  }
  return null;
}

function applyResolvedDeepLink(resolved, { canonicalize = false, announceIssues = false } = {}) {
  cancelBoardArrival();
  state.boardStack = resolved.boardStack.length
    ? [...resolved.boardStack]
    : [manifest.boards.rootBoard];
  state.boardOrigins = resolved.boardOrigins.length
    ? [...resolved.boardOrigins]
    : [null];
  state.userMovedViewport = false;
  resetViewport();
  withDeepLinkWritesSuppressed(() => {
    renderBoard();
    if (!focusNodeOccurrence(resolved.nodeId)) focusOverview();
  });
  state.deepLink = currentRendererDeepLink();
  updateDeepLinkControl();
  if (canonicalize || resolved.sanitized) syncDeepLinkHistory({ mode: "replace" });
  if (announceIssues) {
    const message = deepLinkIssueMessage(resolved.issues);
    if (message) announceQuestionCopy(message);
  }
}

async function onDeepLinkPopState() {
  const params = new URLSearchParams(window.location.search);
  const requestedArch = params.get("arch");
  if (requestedArch && requestedArch !== activeManifestEntry.id) {
    window.location.reload();
    return;
  }
  const requestedCompareArch = params.get("compare_arch");
  if (requestedCompareArch) await ensureRendererModel(requestedCompareArch);
  const comparisonResolved = resolveCurrentComparisonState();
  const resolved = resolveDeepLink({
    boards: manifest.boards.items,
    rootBoardId: manifest.boards.rootBoard,
    search: window.location.search,
  });
  applyResolvedDeepLink(resolved, {
    canonicalize: false,
    announceIssues: true,
  });
  await applyComparisonResolvedState(comparisonResolved, {
    canonicalize: resolved.sanitized || comparisonResolved.sanitized || !requestedArch,
    announceIssues: true,
  });
}

function deepLinkTargetLabel() {
  const comparison = state.comparisonState?.comparison;
  if (comparison && state.comparisonState.selectionSide === "comparison" && comparison.nodeId) {
    const selectedNode = comparison.selectedNode
      || visibleNodes(comparisonBoardRenderer?.board || {}).find((node) => node.id === comparison.nodeId);
    return `${selectedNode?.label || comparison.nodeId} (B · Compare)`;
  }
  if (state.selection?.kind === "node" && state.selection.boardId === currentBoard().id) {
    const suffix = comparison ? " (A · Current)" : "";
    return `${nodeLabelById(state.selection.occurrenceId)}${suffix}`;
  }
  if (comparison) {
    const counterpart = comparisonBoardRenderer?.board?.title || comparison.boardId;
    return `${currentBoard()?.title || manifest.architecture.name} compared with ${counterpart}`;
  }
  return currentBoard()?.title || manifest.architecture.name;
}

function updateDeepLinkControl() {
  const label = deepLinkTargetLabel();
  if (elements.copyDeepLink) {
    const description = `Copy link to ${label}`;
    elements.copyDeepLink.setAttribute("aria-label", description);
    elements.copyDeepLink.title = description;
  }
  document.title = `${label} — ${manifest.architecture.name}`;
}

function shareableDeepLinkUrl() {
  const url = new URL(window.location.href);
  url.search = canonicalDeepLinkSearch();
  ["ui", "edit", "tune", "review_refresh"].forEach((name) => url.searchParams.delete(name));
  url.hash = "";
  return url.href;
}

async function onCopyDeepLinkClick() {
  syncDeepLinkHistory({ mode: "replace" });
  const link = shareableDeepLinkUrl();
  const copied = await writeQuestionClipboard(link);
  if (copied) {
    announceQuestionCopy("Link copied. It will reopen this architecture view.");
  } else {
    showQuestionCopyFallback(link, elements.copyDeepLink);
  }
}

function ensureQuestionMenu() {
  if (questionMenu) return;

  questionMenu = document.createElement("div");
  questionMenu.id = "architectureQuestionMenu";
  questionMenu.className = "architecture-question-menu";
  questionMenu.setAttribute("role", "menu");
  questionMenu.setAttribute("aria-label", "Architecture question actions");
  questionMenu.hidden = true;
  questionMenu.innerHTML = `
    <div class="architecture-question-menu-heading">
      <span>Ask about</span>
      <code></code>
    </div>
    <button type="button" role="menuitem" data-question-action="reference">
      <strong>Copy reference</strong>
      <small>Canonical identifier for a short follow-up</small>
    </button>
    <button type="button" role="menuitem" data-question-action="context">
      <strong>Copy question context</strong>
      <small>Board, neighborhood, arrows, and evidence for a conversation</small>
    </button>
  `;
  questionMenuIdentifier = questionMenu.querySelector("code");
  questionMenu.addEventListener("click", onQuestionMenuClick);
  questionMenu.addEventListener("keydown", onQuestionMenuKeyDown);
  document.body.appendChild(questionMenu);
  elements.focusQuestion?.setAttribute("aria-controls", questionMenu.id);

  questionCopyStatus = document.createElement("p");
  questionCopyStatus.className = "architecture-copy-status";
  questionCopyStatus.setAttribute("role", "status");
  questionCopyStatus.setAttribute("aria-live", "polite");
  questionCopyStatus.setAttribute("aria-atomic", "true");
  questionCopyStatus.hidden = true;
  document.body.appendChild(questionCopyStatus);

  questionCopyFallback = document.createElement("section");
  questionCopyFallback.className = "architecture-copy-fallback";
  questionCopyFallback.setAttribute("role", "dialog");
  questionCopyFallback.setAttribute("aria-modal", "true");
  questionCopyFallback.setAttribute("aria-labelledby", "architectureCopyFallbackTitle");
  questionCopyFallback.hidden = true;
  questionCopyFallback.innerHTML = `
    <div>
      <h2 id="architectureCopyFallbackTitle">Copy text</h2>
      <p>Clipboard access is unavailable. The text is selected; copy it manually.</p>
      <textarea readonly spellcheck="false"></textarea>
      <button type="button" data-question-fallback-close>Close</button>
    </div>
  `;
  questionCopyFallbackText = questionCopyFallback.querySelector("textarea");
  questionCopyFallback.querySelector("button").addEventListener("click", closeQuestionCopyFallback);
  document.body.appendChild(questionCopyFallback);

  document.addEventListener("pointerdown", onQuestionDocumentPointerDown);
  document.addEventListener("keydown", onQuestionDocumentKeyDown);
  window.addEventListener("resize", () => closeQuestionMenu({ restoreFocus: true }));
  window.addEventListener("scroll", () => closeQuestionMenu({ restoreFocus: true }), true);
}

function questionBreadcrumbs() {
  return state.boardStack.map((boardId) => boardsById.get(boardId)).filter(Boolean)
    .map((board) => ({ id: board.id, title: board.title }));
}

function questionContextForTarget(target) {
  if (!target) return null;
  const board = currentBoard();
  // Repeat enclosures replace long recurrence wires visually, but question
  // packets still need the canonical iteration relations in the node
  // neighborhood so an agent can explain what the indexed ports mean.
  const edges = displayGraph(board, { includeRepresentedIterations: true }).edges;
  const shared = {
    sourceSet: activeManifestEntry.id,
    manifest,
    board,
    breadcrumbs: questionBreadcrumbs(),
    edges,
  };
  if (target.kind === "node") {
    return buildNodeQuestionContext({ ...shared, node: target.node });
  }
  if (target.kind === "edge") {
    return buildEdgeQuestionContext({ ...shared, edge: target.edge });
  }
  return null;
}

function questionIdentifierForTarget(target) {
  if (target?.kind === "node") {
    return canonicalNodeRef(target.node)
      || target.node.template_fact_ref
      || `${currentBoard().id}#${target.node.id}`;
  }
  if (target?.kind === "edge") {
    const relationPath = edgeRelationPath(target.edge);
    return relationPath.length
      ? relationPath.join(" → ")
      : target.edge.template_fact_ref || `${target.edge.from} → ${target.edge.to}`;
  }
  return "architecture element";
}

function openQuestionMenu(target, { clientX = 0, clientY = 0, invoker = null } = {}) {
  if (!target || !questionMenu) return;
  hideCanvasTooltip();
  clearConnectivityHighlights();
  questionMenuTarget = target;
  questionMenuInvoker = invoker;
  questionMenuIdentifier.textContent = questionIdentifierForTarget(target);
  questionMenuIdentifier.title = questionMenuIdentifier.textContent;
  questionMenu.hidden = false;
  questionMenu.style.left = "0px";
  questionMenu.style.top = "0px";

  const anchorRect = invoker?.getBoundingClientRect?.();
  const requestedX = clientX || anchorRect?.right || 12;
  const requestedY = clientY || anchorRect?.bottom || 12;
  const menuRect = questionMenu.getBoundingClientRect();
  const left = clamp(requestedX, 8, Math.max(8, window.innerWidth - menuRect.width - 8));
  const top = clamp(requestedY, 8, Math.max(8, window.innerHeight - menuRect.height - 8));
  questionMenu.style.left = `${left}px`;
  questionMenu.style.top = `${top}px`;
  if (invoker === elements.focusQuestion) elements.focusQuestion.setAttribute("aria-expanded", "true");
  questionMenu.querySelector("button")?.focus({ preventScroll: true });
}

function closeQuestionMenu({ restoreFocus = false } = {}) {
  if (!questionMenu || questionMenu.hidden) return;
  questionMenu.hidden = true;
  elements.focusQuestion?.setAttribute("aria-expanded", "false");
  const invoker = questionMenuInvoker;
  questionMenuTarget = null;
  questionMenuInvoker = null;
  if (restoreFocus && invoker?.isConnected) invoker.focus({ preventScroll: true });
}

function selectionTarget() {
  return targetFromSelection(state.selection);
}

function setSelection(target) {
  closeQuestionMenu();
  state.selection = createWorkspaceSelection(target, currentBoard().id);
  if (!deepLinkWritesSuppressed && state.comparisonState?.comparison) {
    state.comparisonState = setComparisonSelection(state.comparisonState, {
      side: "primary",
      nodeId: state.selection?.kind === "node" ? state.selection.occurrenceId : null,
      selectedNode: target?.node || null,
    });
    comparisonBoardRenderer?.clearSelection();
  }
  if (elements.focusQuestion) {
    elements.focusQuestion.hidden = !state.selection;
    elements.focusQuestion.setAttribute("aria-expanded", "false");
  }
  updateDeepLinkControl();
  syncDeepLinkHistory();
  applySemanticTraceSelection();
  announceSelection();
}

function announceSelection() {
  const selection = selectionMessageProjection(state.selection);
  const detail = {
    sourceSet: activeManifestEntry.id,
    selection,
  };
  window.dispatchEvent(new CustomEvent("architecture-selection-change", { detail }));
  if (window.parent !== window) {
    window.parent.postMessage({ type: "architecture-selection-change", ...detail }, window.location.origin);
  }
}

function edgeIsSelected(edge) {
  return selectionMatchesEdge(state.selection, currentBoard().id, edge);
}

function onFocusQuestionClick(event) {
  event.stopPropagation();
  const target = selectionTarget();
  if (!target) return;
  if (!questionMenu.hidden && questionMenuInvoker === elements.focusQuestion) {
    closeQuestionMenu({ restoreFocus: true });
    return;
  }
  openQuestionMenu(target, { invoker: elements.focusQuestion });
}

function attachQuestionMenuHandlers(element, target) {
  element.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openQuestionMenu(target, {
      clientX: event.clientX,
      clientY: event.clientY,
      invoker: element,
    });
  });
  element.addEventListener("keydown", (event) => {
    const opensMenu = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
    if (!opensMenu) return;
    event.preventDefault();
    event.stopPropagation();
    openQuestionMenu(target, { invoker: element });
  });
}

function onQuestionDocumentPointerDown(event) {
  if (!questionMenu || questionMenu.hidden) return;
  if (questionMenu.contains(event.target) || event.target === questionMenuInvoker) return;
  const nextFocus = event.target.closest?.(
    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  ) || elements.canvas;
  closeQuestionMenu();
  nextFocus.focus?.({ preventScroll: true });
}

function onQuestionDocumentKeyDown(event) {
  if (questionCopyFallback && !questionCopyFallback.hidden) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeQuestionCopyFallback();
      return;
    }
    if (event.key === "Tab") trapQuestionFallbackFocus(event);
    return;
  }
  if (event.key !== "Escape") return;
  if (questionMenu && !questionMenu.hidden) {
    event.preventDefault();
    closeQuestionMenu({ restoreFocus: true });
  }
}

function onQuestionMenuKeyDown(event) {
  if (!questionMenu || questionMenu.hidden) return;
  if (event.key === "Tab") {
    closeQuestionMenu({ restoreFocus: true });
    return;
  }
  const buttons = Array.from(questionMenu.querySelectorAll('[role="menuitem"]'));
  const currentIndex = buttons.indexOf(document.activeElement);
  let nextIndex = null;
  if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % buttons.length;
  if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = buttons.length - 1;
  if (nextIndex == null) return;
  event.preventDefault();
  buttons[nextIndex]?.focus({ preventScroll: true });
}

async function onQuestionMenuClick(event) {
  const action = event.target.closest("button")?.dataset.questionAction;
  if (!action || !questionMenuTarget) return;
  const target = questionMenuTarget;
  const invoker = questionMenuInvoker;
  try {
    const context = questionContextForTarget(target);
    if (!context) throw new Error("Question context is unavailable for this element.");
    const text = action === "reference"
      ? questionContextReference(context)
      : formatQuestionContext(context);
    const copied = await writeQuestionClipboard(text);
    closeQuestionMenu({ restoreFocus: copied });
    if (copied) {
      announceQuestionCopy(
        action === "reference"
          ? "Architecture reference copied."
          : "Question context copied. Paste it into your conversation.",
      );
    } else {
      showQuestionCopyFallback(text, invoker);
    }
  } catch (error) {
    closeQuestionMenu({ restoreFocus: true });
    announceQuestionCopy(error?.message || "Could not build question context.", { error: true });
  }
}

async function writeQuestionClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_error) {
    // Fall through to the synchronous copy path used by local HTTP/file views.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.className = "architecture-copy-proxy";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = Boolean(document.execCommand?.("copy"));
  } catch (_error) {
    copied = false;
  }
  textarea.remove();
  return copied;
}

function announceQuestionCopy(message, { error = false } = {}) {
  if (!questionCopyStatus) return;
  window.clearTimeout(questionCopyStatusTimer);
  questionCopyStatus.textContent = message;
  questionCopyStatus.classList.toggle("is-error", error);
  questionCopyStatus.hidden = false;
  questionCopyStatusTimer = window.setTimeout(() => {
    questionCopyStatus.hidden = true;
  }, 3600);
}

function showQuestionCopyFallback(text, invoker) {
  closeQuestionMenu();
  questionCopyFallbackInvoker = invoker;
  questionCopyFallbackText.value = text;
  questionCopyFallback.hidden = false;
  questionCopyFallbackText.focus({ preventScroll: true });
  questionCopyFallbackText.select();
  announceQuestionCopy("Clipboard unavailable. The text is selected for manual copying.");
}

function closeQuestionCopyFallback() {
  if (!questionCopyFallback || questionCopyFallback.hidden) return;
  questionCopyFallback.hidden = true;
  questionCopyFallbackText.value = "";
  const target = questionCopyFallbackInvoker?.isConnected
    ? questionCopyFallbackInvoker
    : elements.focusQuestion && !elements.focusQuestion.hidden
      ? elements.focusQuestion
      : elements.canvas;
  questionCopyFallbackInvoker = null;
  target?.focus({ preventScroll: true });
}

function trapQuestionFallbackFocus(event) {
  const controls = [
    questionCopyFallbackText,
    questionCopyFallback.querySelector("button"),
  ].filter((element) => element && !element.disabled);
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  } else if (!controls.includes(document.activeElement)) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function compactColumnTopology(board, nodes) {
  if (board.grid?.column_sizing !== "content") return null;
  const authoredColumns = [...new Set(
    nodes.map((node) => Math.max(1, Number(node.col) || 1)),
  )].sort((a, b) => a - b);
  return {
    authoredColumns,
    rankByAuthored: new Map(authoredColumns.map((column, index) => [column, index])),
  };
}

function resetGridColumnSizing() {
  [elements.moduleLayer, elements.representationLaneLayer].forEach((layer) => {
    layer.classList.remove("is-content-grid", "is-content-row-grid");
    layer.style.gridTemplateColumns = "";
    layer.style.gridTemplateRows = "";
    layer.style.justifyContent = "";
    layer.style.alignContent = "";
    layer.style.columnGap = "";
    layer.style.rowGap = "";
  });
}

const EDGE_TEXT_STYLES = {
  label: { fontSize: 12, letterSpacingEm: 0.04 },
  badge: { fontSize: 10, letterSpacingEm: 0.05 },
};

const EDGE_ANNOTATION_METRICS = {
  labelHeight: 14,
  badgeLineHeight: 12,
  badgeLineGap: 0,
  groupGap: 4,
  paddingX: 4,
  paddingY: 2,
};

function measureEdgeText(text, kind = "label") {
  const normalized = String(text || "").replaceAll("_", " ").toUpperCase();
  if (!normalized) return 0;
  const style = EDGE_TEXT_STYLES[kind] || EDGE_TEXT_STYLES.label;
  if (!edgeLabelMeasureContext) {
    edgeLabelMeasureContext = document.createElement("canvas").getContext("2d");
  }
  const letterSpacing = Math.max(0, normalized.length - 1) *
    style.fontSize * style.letterSpacingEm;
  if (!edgeLabelMeasureContext) {
    return normalized.length * style.fontSize * 0.62 + letterSpacing;
  }
  edgeLabelMeasureContext.font = `900 ${style.fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  return edgeLabelMeasureContext.measureText(normalized).width + letterSpacing;
}

function conditioningBadgeText(conditioning) {
  return conditioning
    .map((entry) => String(entry.mode || "").replaceAll("_", " "))
    .filter(Boolean)
    .join(" · ");
}

function conditioningBadgeLines(conditioning) {
  return balancedTextLines(conditioningBadgeText(conditioning), {
    measure: (line) => measureEdgeText(line, "badge"),
    maxWidth: RULES.layout.edgeBadgeWrapWidth,
  });
}

function edgeLabelLines(label) {
  return balancedTextLines(label, {
    measure: (line) => measureEdgeText(line, "label"),
    maxWidth: RULES.layout.edgeLabelWrapWidth,
  });
}

function reservedEdgeTextWidth(board, edge) {
  const conditioning = derivedConditioning(board, edge);
  const contracted = (edge.segments || []).length > 1;
  if (!contracted && edge.tone !== "conditioning" && !conditioning.length) return 0;
  const widths = [];
  if (edge.label) {
    widths.push(...edgeLabelLines(edge.label).map((line) => measureEdgeText(line, "label")));
  }
  if (conditioning.length) {
    widths.push(...conditioningBadgeLines(conditioning)
      .map((line) => measureEdgeText(line, "badge")));
  }
  return Math.max(0, ...widths);
}

function reservedEdgeTextHeight(board, edge) {
  const conditioning = derivedConditioning(board, edge);
  const contracted = (edge.segments || []).length > 1;
  if (!contracted && edge.tone !== "conditioning" && !conditioning.length) return 0;
  const labelHeight = edge.label
    ? edgeLabelLines(edge.label).length * EDGE_ANNOTATION_METRICS.labelHeight
    : 0;
  const badgeLines = conditioningBadgeLines(conditioning).length;
  const badgeHeight = badgeLines * 12;
  const labelBadgeGap = labelHeight && badgeHeight ? 8 : 0;
  return labelHeight + labelBadgeGap + badgeHeight;
}

function applyContentColumnSizing(board, graph, nodes, nodeById) {
  if (board.grid?.column_sizing !== "content") return null;
  const topology = compactColumnTopology(board, nodes);
  if (!topology?.authoredColumns.length) return null;

  const minimum = Number(board.grid?.min_col) || RULES.layout.contentMinColumn;
  const widths = topology.authoredColumns.map(() => minimum);
  nodes.forEach((node) => {
    const rank = topology.rankByAuthored.get(Math.max(1, Number(node.col) || 1));
    const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
    if (rank == null || !element) return;
    const width = Math.ceil(element.offsetWidth);
    widths[rank] = Math.max(widths[rank], width);
  });

  const baseGap = Number(board.grid?.col_gap) || RULES.layout.contentColumnGap;
  const setTracks = (gutters) => {
    const tracks = [];
    widths.forEach((width, index) => {
      tracks.push(`${width}px`);
      if (index < gutters.length) tracks.push(`${gutters[index]}px`);
    });
    [elements.moduleLayer, elements.representationLaneLayer].forEach((layer) => {
      layer.classList.add("is-content-grid");
      layer.style.gridTemplateColumns = tracks.join(" ");
      layer.style.justifyContent = "center";
      layer.style.columnGap = "0px";
    });
    nodes.forEach((node) => {
      const rank = topology.rankByAuthored.get(Math.max(1, Number(node.col) || 1));
      const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
      if (rank != null && element) element.style.gridColumn = String(rank * 2 + 1);
    });
  };

  const baseGutters = allocateContentGridGutters({
    columnWidths: widths,
    baseGap,
  });
  setTracks(baseGutters);

  // Route once against the compact tracks. A label grows only the boundary
  // by its remaining measured deficit; room already present on its actual
  // horizontal route segment is not charged a second time.
  const preliminaryRoutes = buildOrthoRoutes(graph.edges || []);
  const labelEdges = [];
  (graph.edges || []).forEach((edge, index) => {
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    if (!fromNode || !toNode) return;
    const fromRank = topology.rankByAuthored.get(Math.max(1, Number(fromNode.col) || 1));
    const toRank = topology.rankByAuthored.get(Math.max(1, Number(toNode.col) || 1));
    if (fromRank == null || toRank == null || Math.abs(fromRank - toRank) !== 1) return;
    const textWidth = reservedEdgeTextWidth(board, edge);
    if (!textWidth) return;
    const segment = longestHorizontalSegment(preliminaryRoutes.get(index));
    if (!segment) return;
    labelEdges.push({
      fromRank,
      toRank,
      textWidth,
      availableSpan: segment.length,
    });
  });
  const gutters = allocateContentGridGutters({
    columnWidths: widths,
    baseGap,
    edges: labelEdges,
    labelPadding: RULES.layout.edgeTextPadding,
  });
  setTracks(gutters);

  return { topology, widths, gutters };
}

function applyContentRowSizing(board, graph, nodes, nodeById) {
  if (board.grid?.row_sizing !== "content") return null;
  const rowCount = Math.max(1, Number(board.grid?.rows) || 1);
  const heights = Array(rowCount).fill(RULES.layout.contentMinRow);
  nodes.forEach((node) => {
    const row = Math.max(1, Number(node.row) || 1);
    const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
    if (!element || row > rowCount) return;
    heights[row - 1] = Math.max(heights[row - 1], Math.ceil(element.offsetHeight));
  });

  const configuredRowGap = Number(board.grid?.row_gap);
  const baseGap = board.grid?.row_gap != null && Number.isFinite(configuredRowGap)
    ? configuredRowGap
    : RULES.layout.contentRowGap;
  const setTracks = (gutters) => {
    const tracks = [];
    heights.forEach((height, index) => {
      tracks.push(`${height}px`);
      if (index < gutters.length) tracks.push(`${gutters[index]}px`);
    });
    [elements.moduleLayer, elements.representationLaneLayer].forEach((layer) => {
      layer.classList.add("is-content-row-grid");
      layer.style.gridTemplateRows = tracks.join(" ");
      layer.style.alignContent = "center";
      layer.style.rowGap = "0px";
    });
    nodes.forEach((node) => {
      const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
      if (element) element.style.gridRow = String((Math.max(1, Number(node.row) || 1) - 1) * 2 + 1);
    });
    elements.representationLaneLayer.querySelectorAll("[data-lane-row]").forEach((lane) => {
      lane.style.gridRow = String((Math.max(1, Number(lane.dataset.laneRow) || 1) - 1) * 2 + 1);
    });
  };

  const baseGutters = allocateContentGridRowGutters({
    rowHeights: heights,
    baseGap,
  });
  setTracks(baseGutters);

  const annotationEdges = [];
  (graph.edges || []).forEach((edge) => {
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    if (!fromNode || !toNode) return;
    const fromRow = Math.max(1, Number(fromNode.row) || 1);
    const toRow = Math.max(1, Number(toNode.row) || 1);
    if (Math.abs(fromRow - toRow) !== 1 || Number(fromNode.col) !== Number(toNode.col)) return;
    const annotationHeight = reservedEdgeTextHeight(board, edge);
    if (!annotationHeight) return;
    const fromElement = elements.moduleLayer.querySelector(`[data-node-id="${edge.from}"]`);
    const toElement = elements.moduleLayer.querySelector(`[data-node-id="${edge.to}"]`);
    if (!fromElement || !toElement) return;
    const fromTop = fromElement.offsetTop;
    const fromBottom = fromTop + fromElement.offsetHeight;
    const toTop = toElement.offsetTop;
    const toBottom = toTop + toElement.offsetHeight;
    const availableSpan = fromTop < toTop
      ? Math.max(0, toTop - fromBottom)
      : Math.max(0, fromTop - toBottom);
    annotationEdges.push({
      fromRank: fromRow - 1,
      toRank: toRow - 1,
      annotationHeight,
      availableSpan,
    });
  });
  const gutters = allocateContentGridRowGutters({
    rowHeights: heights,
    baseGap,
    edges: annotationEdges,
    annotationPadding: RULES.layout.edgeTextVerticalPadding,
  });
  setTracks(gutters);

  return { heights, gutters };
}

function applyGridColumnSizing(board, graph) {
  const nodes = visibleNodes(board);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  // Measure from the neutral authored grid every time. This avoids carrying a
  // previous compact board's constraints into a new board or resize.
  resetGridColumnSizing();
  nodes.forEach((node) => {
    const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
    if (!element) return;
    element.style.gridColumn = String(node.col || 1);
    element.style.gridRow = String(node.row || 1);
  });
  elements.representationLaneLayer.querySelectorAll("[data-lane-row]").forEach((lane) => {
    lane.style.gridRow = lane.dataset.laneRow;
  });

  if (useElkLayout) return null;
  const columns = applyContentColumnSizing(board, graph, nodes, nodeById);
  const rows = applyContentRowSizing(board, graph, nodes, nodeById);
  return { columns, rows };
}

function renderBoard() {
  const board = currentBoard();
  closeQuestionMenu();
  hideCanvasTooltip();
  clearConnectivityHighlights();
  state.displayEdges = null;
  state.layoutEdges = null;
  state.edgeRoutes = new Map();
  state.edgeAnnotationBoxes = [];
  resetGridColumnSizing();
  elements.moduleLayer.innerHTML = "";
  elements.regionLayer.innerHTML = "";
  elements.representationLaneLayer.innerHTML = "";
  elements.edgeLayer.innerHTML = "";
  [elements.moduleLayer, elements.representationLaneLayer].forEach((layer) => {
    layer.style.setProperty("--board-columns", String(board.grid?.columns || 5));
    layer.style.setProperty("--board-rows", String(board.grid?.rows || 4));
    layer.style.setProperty(
      "--board-min-col",
      board.grid?.min_col ? `${board.grid.min_col}px` : "",
    );
    layer.style.setProperty(
      "--board-col-gap",
      board.grid?.col_gap ? `${board.grid.col_gap}px` : "",
    );
    layer.style.setProperty(
      "--board-row-gap",
      board.grid?.row_gap != null ? `${board.grid.row_gap}px` : "",
    );
  });
  elements.canvas.dataset.boardId = board.id;
  elements.canvas.setAttribute("aria-label", `${board.title} architecture map`);
  elements.canvas.classList.toggle("is-root-board", state.boardStack.length === 1);
  renderReferencePanels(board);

  renderAudienceNavigation();
  state.modelMapDirty = true;
  renderModelMap();
  renderScaleLanes(board);

  const graph = displayGraph(board);
  state.displayEdges = graph.edges;
  const nodeProfiles = nodeFlowProfiles(graph.nodes, graph.edges, { repsById, relationsById });
  for (const node of visibleNodes(board)) {
    const profile = nodeProfiles.get(node.id) || { family: "default", families: [] };
    const el = renderNode({
      ...node,
      flow_family: profile.family,
      flow_families: profile.families,
    });
    elements.moduleLayer.appendChild(el);
  }
  applyPrimaryComparisonDecorations();
  updateCompareAction();
  applyViewport();
  layoutBoard(graph);
}

function renderScaleLanes(board) {
  const lanes = Array.isArray(board.lanes) ? board.lanes : [];
  const manualLanes = lanes.filter((lane) => lane.kind !== "representation");
  const representationLanes = lanes.filter((lane) => lane.kind === "representation");
  elements.scaleLaneLayer.replaceChildren();
  elements.scaleLaneLayer.hidden = manualLanes.length === 0;
  for (const lane of manualLanes) {
    const guide = document.createElement("div");
    guide.className = "scale-lane";
    guide.dataset.laneId = lane.id;
    guide.style.top = `${clamp(Number(lane.position), 0, 100)}%`;
    const label = document.createElement("span");
    label.textContent = lane.label || humanizeRef(lane.id);
    guide.appendChild(label);
    elements.scaleLaneLayer.appendChild(guide);
  }

  for (const lane of representationLanes) {
    const guide = document.createElement("div");
    guide.className = `representation-lane representation-lane-${lane.glyph}`;
    guide.dataset.laneId = lane.id;
    guide.dataset.laneRow = String(lane.row);
    guide.style.gridColumn = "1 / -1";
    guide.style.gridRow = String(lane.row);
    guide.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "representation-lane-label";
    label.textContent = lane.label || humanizeRef(lane.id);
    guide.appendChild(label);
    elements.representationLaneLayer.appendChild(guide);
  }
}

function renderReferencePanels(board) {
  const panels = Array.isArray(board.reference_panels) ? board.reference_panels : [];
  elements.referencePanelLayer.replaceChildren();
  elements.referencePanelLayer.hidden = panels.length === 0;
  elements.canvas.classList.toggle("has-reference-panels", panels.length > 0);

  for (const panel of panels) {
    const figure = document.createElement("figure");
    figure.className = "reference-panel";
    figure.dataset.referencePanelId = panel.id;

    const heading = document.createElement("div");
    heading.className = "reference-panel-heading";
    const eyebrow = document.createElement("span");
    eyebrow.className = "reference-panel-eyebrow";
    eyebrow.textContent = "Published reference";
    const title = document.createElement("strong");
    title.textContent = panel.title;
    heading.append(eyebrow, title);
    figure.appendChild(heading);

    const asset = audienceHref(panel.asset);
    if (asset) {
      const imageButton = document.createElement("button");
      imageButton.type = "button";
      imageButton.className = "reference-panel-image-button";
      imageButton.setAttribute("aria-label", `Zoom into reference figure: ${panel.title}`);
      imageButton.title = `Zoom into ${panel.title}`;
      const image = document.createElement("img");
      image.src = asset;
      image.alt = panel.alt;
      image.loading = "eager";
      image.decoding = "async";
      const zoomCue = document.createElement("span");
      zoomCue.className = "reference-panel-zoom-cue";
      zoomCue.setAttribute("aria-hidden", "true");
      zoomCue.innerHTML = `${magnifyIconMarkup()}<span>Zoom</span>`;
      imageButton.append(image, zoomCue);
      imageButton.addEventListener("click", () => openReferenceFigure(panel));
      figure.appendChild(imageButton);
    }

    const caption = document.createElement("figcaption");
    caption.className = "reference-panel-caption";
    caption.textContent = panel.caption;
    figure.appendChild(caption);

    const source = bibliographySource(panel.source_ref);
    const sourceHref = audienceHref(source?.href || source?.url);
    const citation = document.createElement(sourceHref ? "a" : "span");
    citation.className = "reference-panel-citation";
    citation.textContent = [source?.title || panel.source_ref, panel.locator]
      .filter(Boolean)
      .join(" · ");
    if (sourceHref) {
      citation.href = sourceHref;
      citation.target = "_blank";
      citation.rel = "noreferrer";
    }
    figure.appendChild(citation);

    const license = document.createElement("small");
    license.className = "reference-panel-license";
    license.textContent = panel.license_note;
    figure.appendChild(license);
    elements.referencePanelLayer.appendChild(figure);
  }
}

const REFERENCE_FIGURE_MIN_SCALE = 1;
const REFERENCE_FIGURE_MAX_SCALE = 4;
const REFERENCE_FIGURE_ZOOM_STEP = 1.25;

function referenceFigureBaseWidth() {
  const available = Math.max(240, elements.referenceFigureViewport.clientWidth - 48);
  return Math.min(elements.referenceFigureImage.naturalWidth || available, available);
}

function setReferenceFigureScale(nextScale, anchor = null) {
  const viewport = elements.referenceFigureViewport;
  const image = elements.referenceFigureImage;
  const previousWidth = Math.max(viewport.scrollWidth, viewport.clientWidth);
  const previousHeight = Math.max(viewport.scrollHeight, viewport.clientHeight);
  const rect = viewport.getBoundingClientRect();
  const anchorX = anchor ? anchor.clientX - rect.left : viewport.clientWidth / 2;
  const anchorY = anchor ? anchor.clientY - rect.top : viewport.clientHeight / 2;
  const contentX = (viewport.scrollLeft + anchorX) / previousWidth;
  const contentY = (viewport.scrollTop + anchorY) / previousHeight;

  referenceFigureScale = clamp(
    nextScale,
    REFERENCE_FIGURE_MIN_SCALE,
    REFERENCE_FIGURE_MAX_SCALE,
  );
  image.style.width = `${Math.round(referenceFigureBaseWidth() * referenceFigureScale)}px`;
  elements.referenceFigureZoomValue.textContent = `${Math.round(referenceFigureScale * 100)}%`;
  viewport.classList.toggle("is-zoomed", referenceFigureScale > 1);

  window.requestAnimationFrame(() => {
    viewport.scrollLeft = contentX * Math.max(viewport.scrollWidth, viewport.clientWidth) - anchorX;
    viewport.scrollTop = contentY * Math.max(viewport.scrollHeight, viewport.clientHeight) - anchorY;
  });
}

function resetReferenceFigureZoom() {
  referenceFigureScale = 1;
  elements.referenceFigureViewport.scrollLeft = 0;
  elements.referenceFigureViewport.scrollTop = 0;
  setReferenceFigureScale(1);
}

function openReferenceFigure(panel) {
  const asset = audienceHref(panel.asset);
  if (!asset) return;
  const source = bibliographySource(panel.source_ref);
  const sourceHref = audienceHref(source?.href || source?.url);

  elements.referenceFigureTitle.textContent = panel.title;
  elements.referenceFigureCaption.textContent = panel.caption;
  elements.referenceFigureLicense.textContent = panel.license_note;
  elements.referenceFigureCitation.textContent = [source?.title || panel.source_ref, panel.locator]
    .filter(Boolean)
    .join(" · ");
  if (sourceHref) {
    elements.referenceFigureCitation.href = sourceHref;
    elements.referenceFigureCitation.hidden = false;
  } else {
    elements.referenceFigureCitation.removeAttribute("href");
    elements.referenceFigureCitation.hidden = true;
  }
  elements.referenceFigureImage.alt = panel.alt;
  elements.referenceFigureImage.src = asset;
  elements.referenceFigureImage.onload = resetReferenceFigureZoom;
  if (!elements.referenceFigureDialog.open) elements.referenceFigureDialog.showModal();
  if (elements.referenceFigureImage.complete && elements.referenceFigureImage.naturalWidth > 0) {
    resetReferenceFigureZoom();
  }
  elements.referenceFigureViewport.focus({ preventScroll: true });
}

function closeReferenceFigure() {
  if (elements.referenceFigureDialog.open) elements.referenceFigureDialog.close();
}

function onReferenceFigureControl(event) {
  const action = event.target.closest("[data-reference-zoom]")?.dataset.referenceZoom;
  if (!action) return;
  if (action === "in") setReferenceFigureScale(referenceFigureScale * REFERENCE_FIGURE_ZOOM_STEP);
  if (action === "out") setReferenceFigureScale(referenceFigureScale / REFERENCE_FIGURE_ZOOM_STEP);
  if (action === "reset") resetReferenceFigureZoom();
}

function onReferenceFigureWheel(event) {
  event.preventDefault();
  const factor = Math.exp(-clamp(event.deltaY, -120, 120) * 0.003);
  setReferenceFigureScale(referenceFigureScale * factor, event);
}

function beginReferenceFigurePan(event) {
  if (event.button !== 0 || referenceFigureScale <= 1) return;
  referenceFigurePan = {
    pointerId: event.pointerId,
    clientX: event.clientX,
    clientY: event.clientY,
    scrollLeft: elements.referenceFigureViewport.scrollLeft,
    scrollTop: elements.referenceFigureViewport.scrollTop,
  };
  elements.referenceFigureViewport.setPointerCapture(event.pointerId);
  elements.referenceFigureViewport.classList.add("is-panning");
}

function moveReferenceFigurePan(event) {
  if (!referenceFigurePan || event.pointerId !== referenceFigurePan.pointerId) return;
  event.preventDefault();
  elements.referenceFigureViewport.scrollLeft = referenceFigurePan.scrollLeft
    - (event.clientX - referenceFigurePan.clientX);
  elements.referenceFigureViewport.scrollTop = referenceFigurePan.scrollTop
    - (event.clientY - referenceFigurePan.clientY);
}

function endReferenceFigurePan(event) {
  if (!referenceFigurePan || event.pointerId !== referenceFigurePan.pointerId) return;
  if (elements.referenceFigureViewport.hasPointerCapture(event.pointerId)) {
    elements.referenceFigureViewport.releasePointerCapture(event.pointerId);
  }
  referenceFigurePan = null;
  elements.referenceFigureViewport.classList.remove("is-panning");
}

let elkInstance = null;

function getElk() {
  if (!elkInstance && typeof window.ELK === "function") {
    try {
      elkInstance = new window.ELK();
    } catch (error) {
      console.warn("ELK initialisation failed; using grid layout", error);
    }
  }
  return elkInstance;
}

const ELK_LAYOUT_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.spacing.nodeNodeBetweenLayers": "96",
  "elk.spacing.nodeNode": "48",
  "elk.spacing.edgeNode": "30",
  "elk.spacing.edgeEdge": "18",
  "elk.layered.spacing.edgeNodeBetweenLayers": "30",
  "elk.padding": "[top=24,left=24,bottom=24,right=24]",
};

function buildElkGraph(graph, sizeOf) {
  return {
    id: "board",
    layoutOptions: ELK_LAYOUT_OPTIONS,
    children: graph.nodes
      .filter((node) => node.prominence !== "hidden" && node.treatment !== "hidden")
      .map((node) => {
        const { width, height } = sizeOf(node);
        return { id: node.id, width, height };
      }),
    edges: graph.edges.map((edge, index) => ({
      id: `edge_${index}`,
      sources: [edge.from],
      targets: [edge.to],
    })),
  };
}

async function layoutBoard(graph, { typeset = true } = {}) {
  const generation = (state.layoutGeneration = (state.layoutGeneration || 0) + 1);
  if (typeset) await typesetBoardMathAsync();
  if (generation !== state.layoutGeneration) return;

  const elk = useElkLayout ? getElk() : null;
  if (!elk || graph.nodes.length < 2) {
    useGridLayout(graph);
    return;
  }

  elements.moduleLayer.classList.add("is-elk-layout", "is-layouting");
  elements.representationLaneLayer.classList.add("is-elk-layout", "is-layouting");
  const elkGraph = buildElkGraph(graph, (node) => {
    const el = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
    return { width: el?.offsetWidth || 200, height: el?.offsetHeight || 100 };
  });

  try {
    const layout = await elk.layout(elkGraph);
    if (generation !== state.layoutGeneration) return;
    applyElkLayout(layout);
  } catch (error) {
    console.warn("ELK layout failed; falling back to grid", error);
    useGridLayout(graph);
  } finally {
    elements.moduleLayer.classList.remove("is-layouting");
    elements.representationLaneLayer.classList.remove("is-layouting");
  }
}

function useGridLayout(graph) {
  state.layoutEdges = null;
  elements.moduleLayer.classList.remove("is-elk-layout", "is-layouting");
  elements.representationLaneLayer.classList.remove("is-elk-layout", "is-layouting");
  elements.canvas.classList.remove("is-elk-layout");
  elements.moduleLayer.style.width = "";
  elements.moduleLayer.style.height = "";
  elements.regionLayer.style.width = "";
  elements.regionLayer.style.height = "";
  elements.representationLaneLayer.style.width = "";
  elements.representationLaneLayer.style.height = "";
  elements.edgeLayer.style.width = "";
  elements.edgeLayer.style.height = "";
  applyGridColumnSizing(currentBoard(), graph || displayGraph(currentBoard()));
  scheduleGeometryUpdate({
    renderEdges: true,
    fit: !state.isTransitioning && !state.userMovedViewport,
  });
}

async function refreshBoardAfterMath() {
  const board = currentBoard();
  const boardId = board.id;
  const graph = displayGraph(board);
  await typesetBoardMathAsync();
  if (currentBoard().id !== boardId) return;
  state.displayEdges = graph.edges;
  if (useElkLayout && getElk()) {
    layoutBoard(graph, { typeset: false });
    return;
  }
  applyGridColumnSizing(board, graph);
  scheduleGeometryUpdate({
    renderEdges: true,
    fit: !state.isTransitioning && !state.userMovedViewport,
  });
}

function applyElkLayout(layout) {
  const width = Math.ceil(layout.width || 0);
  const height = Math.ceil(layout.height || 0);
  elements.canvas.classList.add("is-elk-layout");
  elements.moduleLayer.style.width = `${width}px`;
  elements.moduleLayer.style.height = `${height}px`;
  elements.regionLayer.style.width = `${width}px`;
  elements.regionLayer.style.height = `${height}px`;
  elements.representationLaneLayer.style.width = `${width}px`;
  elements.representationLaneLayer.style.height = `${height}px`;
  elements.edgeLayer.style.width = `${width}px`;
  elements.edgeLayer.style.height = `${height}px`;

  for (const child of layout.children || []) {
    const el = elements.moduleLayer.querySelector(`[data-node-id="${child.id}"]`);
    if (!el) continue;
    el.style.left = `${Math.round(child.x || 0)}px`;
    el.style.top = `${Math.round(child.y || 0)}px`;
  }

  state.layoutEdges = new Map();
  for (const edge of layout.edges || []) {
    const section = edge.sections?.[0];
    if (!section) continue;
    const points = [section.startPoint, ...(section.bendPoints || []), section.endPoint];
    state.layoutEdges.set(Number(edge.id.replace("edge_", "")), points);
  }

  fitViewport(width, height);
  renderEdges();
}

function fitViewport(width, height) {
  const canvasRect = elements.canvas.getBoundingClientRect();
  const baseX = elements.moduleLayer.offsetLeft;
  const baseY = elements.moduleLayer.offsetTop;
  const { availableW, availableH } = boardViewportAvailableSize(canvasRect, baseX, baseY);
  const fit = Math.min(1, availableW / width, availableH / height);
  viewport.scale = clamp(fit, viewport.minScale, viewport.maxScale);
  viewport.x = Math.max(0, (availableW - width * viewport.scale) / 2);
  viewport.y = Math.max(0, (availableH - height * viewport.scale) / 2);
  applyViewport();
}

function boardViewportAvailableSize(canvasRect, baseX, baseY) {
  const lowerChromeReserve = modelMap?.offsetParent ? modelMap.offsetHeight + 42 : 74;
  return {
    availableW: Math.max(120, elements.moduleLayer.offsetWidth || canvasRect.width - baseX * 2),
    availableH: Math.max(120, canvasRect.height - baseY - lowerChromeReserve),
  };
}

function boardViewportCenter(canvasRect, baseX, baseY) {
  const { availableW, availableH } = boardViewportAvailableSize(canvasRect, baseX, baseY);
  return {
    x: baseX + availableW / 2,
    y: baseY + availableH / 2,
  };
}

function boardContentBounds() {
  const nodes = [
    ...elements.moduleLayer.querySelectorAll("[data-node-id]"),
    ...elements.regionLayer.querySelectorAll(".board-region"),
  ];
  if (!nodes.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of nodes) {
    minX = Math.min(minX, el.offsetLeft);
    minY = Math.min(minY, el.offsetTop);
    maxX = Math.max(maxX, el.offsetLeft + el.offsetWidth);
    maxY = Math.max(maxY, el.offsetTop + el.offsetHeight);
  }
  for (const points of state.edgeRoutes?.values() || []) {
    for (const point of points || []) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }
  for (const box of state.edgeAnnotationBoxes || []) {
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  }
  const wirePadding = state.edgeRoutes?.size ? 18 : 0;
  return {
    minX: minX - wirePadding,
    minY: minY - wirePadding,
    width: maxX - minX + wirePadding * 2,
    height: maxY - minY + wirePadding * 2,
  };
}

// Semantic-zoom boards are intentionally bounded, so the arrival view should
// reveal the complete board. A caller may still request the readable floor
// for an unusually large free-pan surface.
function fitToContent({ readable = false } = {}) {
  const bounds = boardContentBounds();
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
    resetViewport();
    return;
  }
  const canvasRect = elements.canvas.getBoundingClientRect();
  const baseX = elements.moduleLayer.offsetLeft;
  const baseY = elements.moduleLayer.offsetTop;
  const { availableW, availableH } = boardViewportAvailableSize(canvasRect, baseX, baseY);
  const margin = RULES.fitMargin;
  const exactFit = Math.min(
    1,
    (availableW - margin) / bounds.width,
    (availableH - margin) / bounds.height,
  );
  const readableFloor = canvasRect.width < 700 ? 0.56 : 0.68;
  const requestedScale = readable ? Math.max(exactFit, readableFloor) : exactFit;
  viewport.scale = clamp(requestedScale, viewport.minScale, 1);
  const scaledWidth = bounds.width * viewport.scale;
  const scaledHeight = bounds.height * viewport.scale;
  viewport.x = scaledWidth <= availableW
    ? (availableW - scaledWidth) / 2 - bounds.minX * viewport.scale
    : margin / 2 - bounds.minX * viewport.scale;
  viewport.y = scaledHeight <= availableH
    ? (availableH - scaledHeight) / 2 - bounds.minY * viewport.scale
    : margin / 2 - bounds.minY * viewport.scale;
  applyViewport();
}

function renderAudienceNavigation() {
  const depth = state.boardStack.length;
  const parent = depth > 1 ? boardsById.get(state.boardStack[depth - 2]) : null;
  const maximumDepth = semanticDepthFrom(manifest.boards.rootBoard);
  elements.boardBack.hidden = depth === 1;
  const parentLabel = parent?.title || "the parent view";
  const upLabel = `Up to ${parentLabel}`;
  elements.boardBack.title = upLabel;
  elements.boardBack.setAttribute("aria-label", upLabel);
  elements.boardBackLabel.textContent = upLabel;

  const breadcrumbs = state.boardStack.map((boardId, index) => {
    const board = boardsById.get(boardId);
    if (!board) return null;
    const item = document.createElement("li");
    const isCurrent = index === depth - 1;
    item.className = `board-breadcrumb${isCurrent ? " is-current" : ""}`;

    const control = document.createElement(isCurrent ? "span" : "button");
    if (!isCurrent) {
      control.type = "button";
      control.dataset.boardIndex = String(index);
      control.title = `Return to ${board.title}`;
    } else {
      control.setAttribute("aria-current", "page");
    }
    control.textContent = board.title;
    item.appendChild(control);
    return item;
  });
  elements.boardBreadcrumbs.replaceChildren(...breadcrumbs.filter(Boolean));
  elements.boardDepth.textContent = `${depth} / ${maximumDepth}`;
  elements.boardDepth.title = `Semantic level ${depth} of ${maximumDepth}`;
  elements.semanticLocationStatus.textContent =
    `Now viewing ${currentBoard().title}, semantic level ${depth} of ${maximumDepth}.`;
  updateDeepLinkControl();
}

function semanticDepthFrom(boardId, visiting = new Set()) {
  if (!boardId || visiting.has(boardId)) return 0;
  const board = boardsById.get(boardId);
  if (!board) return 0;
  const nextVisiting = new Set(visiting);
  nextVisiting.add(boardId);
  const childIds = new Set(
    (board.nodes || [])
      .map((node) => targetBoardForNode(node)?.id)
      .filter((childId) => childId && !nextVisiting.has(childId)),
  );
  const childDepths = Array.from(childIds, (childId) => semanticDepthFrom(childId, nextVisiting));
  return 1 + Math.max(0, ...childDepths);
}

function onBoardNavigationClick(event) {
  const action = event.target.closest("button")?.dataset.boardAction;
  if (action === "up") popToBoard(state.boardStack.length - 2);
  const index = Number(event.target.closest("button")?.dataset.boardIndex);
  if (Number.isInteger(index)) popToBoard(index);
}

function ensureModelMap() {
  if (modelMap) return;
  modelMap = document.createElement("aside");
  modelMap.className = "model-map board-chrome is-empty";

  const heading = document.createElement("div");
  heading.className = "model-map-heading";
  const label = document.createElement("span");
  label.textContent = "Model map";

  const headingActions = document.createElement("div");
  headingActions.className = "model-map-heading-actions";

  modelMapViewToggle = document.createElement("div");
  modelMapViewToggle.className = "model-map-view-toggle";
  modelMapViewToggle.setAttribute("role", "group");
  modelMapViewToggle.setAttribute("aria-label", "Model map viewpoint");
  [
    ["root", "Whole model"],
    ["parent", "Parent"],
  ].forEach(([view, text]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.modelMapView = view;
    button.textContent = text;
    modelMapViewToggle.appendChild(button);
  });
  modelMapViewToggle.addEventListener("click", onModelMapViewClick);

  modelMapCollapseButton = document.createElement("button");
  modelMapCollapseButton.type = "button";
  modelMapCollapseButton.className = "model-map-collapse";
  modelMapCollapseButton.setAttribute("aria-controls", "modelMapBody");
  modelMapCollapseButton.addEventListener("click", onModelMapCollapseClick);
  headingActions.append(modelMapViewToggle, modelMapCollapseButton);
  heading.append(label, headingActions);

  modelMapContext = document.createElement("span");
  modelMapContext.className = "model-map-context";

  modelMapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  modelMapSvg.setAttribute("class", "model-map-board");
  modelMapSvg.setAttribute("aria-hidden", "true");
  modelMapSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  modelMapA11y = document.createElement("ol");
  modelMapA11y.className = "model-map-a11y";
  modelMapBody = document.createElement("div");
  modelMapBody.id = "modelMapBody";
  modelMapBody.className = "model-map-body";
  modelMapBody.append(modelMapContext, modelMapSvg, modelMapA11y);
  modelMap.append(heading, modelMapBody);
  elements.canvas.appendChild(modelMap);
  renderModelMapCollapseState();
}

function modelMapSelection() {
  const rootBoard = boardsById.get(manifest.boards.rootBoard) || null;
  const parentAvailable = state.boardStack.length >= 3;
  if (state.modelMapView === "parent" && parentAvailable) {
    const boardIndex = state.boardStack.length - 2;
    const board = boardsById.get(state.boardStack[boardIndex]);
    if (board) return { board, boardIndex, view: "parent", parentAvailable };
  }
  return { board: rootBoard, boardIndex: 0, view: "root", parentAvailable };
}

function onModelMapViewClick(event) {
  const view = event.target.closest("button")?.dataset.modelMapView;
  if (!view || (view === "parent" && state.boardStack.length < 3)) return;
  state.modelMapView = view;
  state.modelMapDirty = true;
  renderModelMap();
}

function onModelMapCollapseClick() {
  state.modelMapCollapsed = !state.modelMapCollapsed;
  renderModelMapCollapseState();
  if (!state.modelMapCollapsed) renderModelMap();
  scheduleGeometryUpdate({
    fit: !state.userMovedViewport,
  });
}

function renderModelMapCollapseState() {
  if (!modelMap || !modelMapCollapseButton || !modelMapBody) return;
  const collapsed = state.modelMapCollapsed;
  modelMap.classList.toggle("is-collapsed", collapsed);
  modelMapBody.hidden = collapsed;
  modelMapCollapseButton.textContent = collapsed ? "+" : "−";
  modelMapCollapseButton.title = collapsed ? "Expand model map" : "Minimize model map";
  modelMapCollapseButton.setAttribute(
    "aria-label",
    collapsed ? "Expand model map" : "Minimize model map",
  );
  modelMapCollapseButton.setAttribute("aria-expanded", String(!collapsed));
}

function modelMapGraph(board) {
  if (!board) return { nodes: [], edges: [] };
  const graph = displayGraph(board);
  const nodes = graph.nodes.filter(
    (node) => node.prominence !== "hidden" && node.treatment !== "hidden",
  );
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter(
    (edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to),
  );
  const profiles = nodeFlowProfiles(nodes, edges, { repsById, relationsById });
  return {
    nodes: nodes.map((node) => {
      const profile = profiles.get(node.id) || { family: "default", families: [] };
      return {
        ...node,
        flow_family: profile.family,
        flow_families: profile.families,
      };
    }),
    edges,
  };
}

function activeModelMapNode(mapBoard, nodes, mapBoardIndex) {
  if (!mapBoard || state.boardStack.length <= mapBoardIndex + 1) return null;
  const childIndex = mapBoardIndex + 1;
  const originNodeId = state.boardOrigins[childIndex];
  const originNode = nodes.find((node) => node.id === originNodeId);
  if (originNode) return originNode;

  const firstChildBoardId = state.boardStack[childIndex];
  const matches = nodes.filter(
    (node) => targetBoardForNode(node)?.id === firstChildBoardId,
  );
  return matches.length === 1 ? matches[0] : null;
}

function modelMapNodeLabel(node) {
  const module = node.module_ref ? modulesById.get(node.module_ref) : null;
  const rep = node.rep_ref ? repsById.get(node.rep_ref) : null;
  return module?.label || node.label || rep?.id?.replaceAll("_", " ") || node.id;
}

function modelMapNodeGeometry(board, nodes) {
  const cellWidth = 140;
  const cellHeight = 92;
  const padding = 24;
  const compactColumns = compactColumnTopology(board, nodes);
  const observedColumns = Math.max(1, ...nodes.map((node) => Number(node.col) || 1));
  const observedRows = Math.max(1, ...nodes.map((node) => Number(node.row) || 1));
  const columns = compactColumns
    ? compactColumns.authoredColumns.length
    : Math.max(Number(board.grid?.columns) || 1, observedColumns);
  const rows = Math.max(Number(board.grid?.rows) || 1, observedRows);
  const layout = new Map();

  nodes.forEach((node) => {
    const authoredColumn = Math.max(1, Number(node.col) || 1);
    const column = compactColumns
      ? (compactColumns.rankByAuthored.get(authoredColumn) ?? 0) + 1
      : authoredColumn;
    const row = Math.max(1, Number(node.row) || 1);
    const x = padding + (column - 0.5) * cellWidth;
    const y = padding + (row - 0.5) * cellHeight;
    const module = node.module_ref ? modulesById.get(node.module_ref) : null;
    const rep = node.rep_ref ? repsById.get(node.rep_ref) : null;
    const kind = node.kind === "operation"
      ? "operation"
      : node.kind === "representation"
        ? "representation"
        : "module";
    const glyph = kind === "representation"
      ? node.glyph || rep?.glyph || glyphKindForShape(rep?.shape || "") || "vector"
      : null;

    let width = node.prominence === "primary" ? 112 : 96;
    let height = node.treatment === "chip" || node.density === "micro" ? 34 : 50;
    if (kind === "operation") {
      width = 58;
      height = 54;
    }
    if (kind === "representation") {
      const dimensions = {
        scalar: [62, 66],
        vector: [86, 58],
        single: [90, 24],
        matrix: [76, 70],
        pair: [70, 70],
        volume: [84, 66],
        dictionary: [90, 66],
        coordinates: [82, 70],
        frames: [88, 72],
      };
      [width, height] = dimensions[glyph] || dimensions.vector;
    }

    layout.set(node.id, {
      node,
      module,
      rep,
      kind,
      glyph,
      scale: node.scale || module?.scale || rep?.scale || "item",
      x,
      y,
      width,
      height,
    });
  });

  return {
    width: padding * 2 + columns * cellWidth,
    height: padding * 2 + rows * cellHeight,
    nodes: layout,
  };
}

function modelMapEdgePath(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const start = horizontal
    ? { x: from.x + Math.sign(dx || 1) * from.width / 2, y: from.y }
    : { x: from.x, y: from.y + Math.sign(dy || 1) * from.height / 2 };
  const end = horizontal
    ? { x: to.x - Math.sign(dx || 1) * to.width / 2, y: to.y }
    : { x: to.x, y: to.y - Math.sign(dy || 1) * to.height / 2 };
  if (Math.abs(start.y - end.y) < 1) return `M ${start.x} ${start.y} H ${end.x}`;
  if (Math.abs(start.x - end.x) < 1) return `M ${start.x} ${start.y} V ${end.y}`;
  if (horizontal) {
    const middleX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} H ${middleX} V ${end.y} H ${end.x}`;
  }
  const middleY = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} V ${middleY} H ${end.x} V ${end.y}`;
}

function renderModelMapEdge(edge, geometry) {
  const from = geometry.nodes.get(edge.from);
  const to = geometry.nodes.get(edge.to);
  if (!from || !to) return null;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const tone = edge.tone === "conditioning" || edge.tone === "skip" ? edge.tone : "default";
  const flowFamily = PAYLOAD_FLOW_FAMILIES.includes(edge.flow_family)
    ? edge.flow_family
    : null;
  path.setAttribute("d", modelMapEdgePath(from, to));
  path.setAttribute(
    "class",
    `model-map-edge tone-${tone}${flowFamily ? ` flow-family-${flowFamily}` : ""}` +
      `${(edge.segments || []).length > 1 ? " is-contracted" : ""}`,
  );
  path.setAttribute("marker-end", `url(#model-map-arrow-${edgeMarkerFamily(edge)})`);
  path.setAttribute("vector-effect", "non-scaling-stroke");
  return path;
}

function renderModelMapDefs() {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  ["default", "conditioning", "skip", ...PAYLOAD_FLOW_FAMILIES].forEach((tone) => {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", `model-map-arrow-${tone}`);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "4.5");
    marker.setAttribute("markerHeight", "4.5");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    arrow.setAttribute(
      "class",
      `model-map-arrow ${PAYLOAD_FLOW_FAMILIES.includes(tone) ? `flow-family-${tone}` : `tone-${tone}`}`,
    );
    marker.appendChild(arrow);
    defs.appendChild(marker);
  });
  return defs;
}

function modelMapSvgElement(name, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function renderModelMapModuleShape(entry) {
  const left = entry.x - entry.width / 2;
  const top = entry.y - entry.height / 2;
  const group = modelMapSvgElement("g", { class: "model-map-module-shape" });
  group.append(
    modelMapSvgElement("rect", {
      class: "model-map-shape model-map-module-body",
      x: left,
      y: top,
      width: entry.width,
      height: entry.height,
      rx: 8,
      "vector-effect": "non-scaling-stroke",
    }),
    modelMapSvgElement("rect", {
      class: "model-map-module-accent",
      x: left,
      y: top,
      width: entry.width,
      height: Math.min(7, entry.height * 0.16),
      rx: 4,
    }),
  );
  return group;
}

function appendModelMapAxisTriad(group, originX, originY, size, { muted = false } = {}) {
  const className = `model-map-geometry-axis${muted ? " is-muted" : ""}`;
  group.append(
    modelMapSvgElement("circle", {
      class: `model-map-geometry-origin${muted ? " is-muted" : ""}`,
      cx: originX,
      cy: originY,
      r: Math.max(1.4, size * 0.12),
    }),
    modelMapSvgElement("line", {
      class: `${className} axis-x`,
      x1: originX,
      y1: originY,
      x2: originX + size,
      y2: originY,
      "vector-effect": "non-scaling-stroke",
    }),
    modelMapSvgElement("line", {
      class: `${className} axis-y`,
      x1: originX,
      y1: originY,
      x2: originX,
      y2: originY - size,
      "vector-effect": "non-scaling-stroke",
    }),
    modelMapSvgElement("line", {
      class: `${className} axis-z`,
      x1: originX,
      y1: originY,
      x2: originX - size * 0.58,
      y2: originY + size * 0.58,
      "vector-effect": "non-scaling-stroke",
    }),
  );
}

function appendModelMapCoordinateGeometry(group, left, top, width, height) {
  const points = [
    [0.17, 0.48, 2.3],
    [0.32, 0.28, 3.1],
    [0.48, 0.58, 3.3],
    [0.62, 0.36, 2.5],
    [0.76, 0.52, 3.1],
  ];
  points.forEach(([x, y, radius], index) => {
    group.appendChild(modelMapSvgElement("circle", {
      class: `model-map-coordinate-point${index === 0 || index === points.length - 1 ? " is-muted" : ""}`,
      cx: left + width * x,
      cy: top + height * y,
      r: radius,
    }));
  });
  appendModelMapAxisTriad(
    group,
    left + width * 0.82,
    top + height * 0.73,
    Math.min(width, height) * 0.13,
    { muted: true },
  );
}

function appendModelMapFrameGeometry(group, left, top, width, height) {
  appendModelMapAxisTriad(
    group,
    left + width * 0.24,
    top + height * 0.64,
    Math.min(width, height) * 0.18,
    { muted: true },
  );
  appendModelMapAxisTriad(
    group,
    left + width * 0.52,
    top + height * 0.52,
    Math.min(width, height) * 0.24,
  );
  appendModelMapAxisTriad(
    group,
    left + width * 0.79,
    top + height * 0.43,
    Math.min(width, height) * 0.16,
    { muted: true },
  );
}

function renderModelMapTensorShape(entry) {
  const left = entry.x - entry.width / 2;
  const top = entry.y - entry.height / 2;
  const group = modelMapSvgElement("g", { class: "model-map-tensor-shape" });
  const stacked = entry.glyph === "volume";
  if (stacked) {
    group.appendChild(modelMapSvgElement("rect", {
      class: "model-map-shape model-map-tensor-back",
      x: left + 8,
      y: top + 1,
      width: entry.width - 10,
      height: entry.height - 10,
      rx: 5,
      "vector-effect": "non-scaling-stroke",
    }));
  }

  const insetX = stacked ? 2 : 0;
  const insetY = stacked ? 7 : 0;
  const width = entry.width - (stacked ? 10 : 0);
  const height = entry.height - (stacked ? 9 : 0);
  const frontLeft = left + insetX;
  const frontTop = top + insetY;
  group.appendChild(modelMapSvgElement("rect", {
    class: "model-map-shape model-map-tensor-front",
    x: frontLeft,
    y: frontTop,
    width,
    height,
    rx: entry.glyph === "single" ? height / 2 : entry.glyph === "scalar" ? 7 : 5,
    "vector-effect": "non-scaling-stroke",
  }));

  if (entry.glyph === "coordinates") {
    appendModelMapCoordinateGeometry(group, frontLeft, frontTop, width, height);
    return group;
  }
  if (entry.glyph === "frames") {
    appendModelMapFrameGeometry(group, frontLeft, frontTop, width, height);
    return group;
  }

  if (entry.glyph === "dictionary") {
    [0.28, 0.5, 0.72].forEach((fraction) => {
      group.appendChild(modelMapSvgElement("line", {
        class: "model-map-dictionary-row",
        x1: frontLeft + width * 0.18,
        y1: frontTop + height * fraction,
        x2: frontLeft + width * 0.82,
        y2: frontTop + height * fraction,
        "vector-effect": "non-scaling-stroke",
      }));
    });
    return group;
  }

  if (entry.glyph !== "scalar") {
    [0.33, 0.66].forEach((fraction) => {
      group.appendChild(modelMapSvgElement("line", {
        class: "model-map-tensor-grid",
        x1: frontLeft + width * fraction,
        y1: frontTop + 3,
        x2: frontLeft + width * fraction,
        y2: frontTop + height - 3,
        "vector-effect": "non-scaling-stroke",
      }));
      if (entry.glyph !== "single") {
        group.appendChild(modelMapSvgElement("line", {
          class: "model-map-tensor-grid",
          x1: frontLeft + 3,
          y1: frontTop + height * fraction,
          x2: frontLeft + width - 3,
          y2: frontTop + height * fraction,
          "vector-effect": "non-scaling-stroke",
        }));
      }
    });
  }
  return group;
}

function renderModelMapOperationShape(entry) {
  return modelMapSvgElement("circle", {
    class: "model-map-shape model-map-operation-shape",
    cx: entry.x,
    cy: entry.y,
    r: Math.min(entry.width, entry.height) * 0.32,
    "vector-effect": "non-scaling-stroke",
  });
}

function renderModelMapNode(entry, activeNode) {
  const group = modelMapSvgElement("g");
  group.setAttribute(
    "class",
    `model-map-node is-${entry.kind} scale-${entry.scale}` +
      `${entry.glyph ? ` is-${entry.glyph}` : ""}` +
      `${entry.node.flow_family && entry.node.flow_family !== "default" ? ` flow-family-${entry.node.flow_family}` : ""}` +
      `${entry.node === activeNode ? " is-current" : ""}`,
  );
  group.setAttribute("data-model-node-id", entry.node.id);

  const title = modelMapSvgElement("title");
  title.textContent = modelMapNodeLabel(entry.node);
  const halo = modelMapSvgElement("rect", {
    class: "model-map-current-halo",
    x: entry.x - entry.width / 2 - 7,
    y: entry.y - entry.height / 2 - 7,
    width: entry.width + 14,
    height: entry.height + 14,
    rx: 12,
    "vector-effect": "non-scaling-stroke",
  });
  const shape = entry.kind === "representation"
    ? renderModelMapTensorShape(entry)
    : entry.kind === "operation"
      ? renderModelMapOperationShape(entry)
      : renderModelMapModuleShape(entry);
  group.append(title, halo, shape);
  return group;
}

function renderModelMap() {
  if (!modelMap) return;
  renderModelMapCollapseState();
  const selection = modelMapSelection();
  const mapBoard = selection.board;
  const hasMapContent = Boolean((mapBoard?.nodes || []).some(
    (node) => node.prominence !== "hidden" && node.treatment !== "hidden",
  ));
  modelMap.classList.toggle("is-empty", !hasMapContent);
  if (!hasMapContent) {
    state.modelMapDirty = false;
    modelMapSvg.replaceChildren();
    modelMapA11y.replaceChildren();
    return;
  }
  if (state.modelMapCollapsed || modelMap.offsetParent === null) {
    state.modelMapDirty = true;
    return;
  }
  state.modelMapDirty = false;
  const { nodes, edges } = modelMapGraph(mapBoard);
  if (!mapBoard || !nodes.length) {
    modelMap.classList.add("is-empty");
    modelMapSvg.replaceChildren();
    modelMapA11y.replaceChildren();
    return;
  }

  modelMapViewToggle.hidden = !selection.parentAvailable;
  modelMapViewToggle.querySelectorAll("button").forEach((button) => {
    const selected = button.dataset.modelMapView === selection.view;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  const activeNode = activeModelMapNode(mapBoard, nodes, selection.boardIndex);
  const activeLabel = activeNode ? modelMapNodeLabel(activeNode) : null;
  const contextLabel = activeLabel
    ? `${selection.view === "parent" ? "Current" : "Inside"}: ${activeLabel}`
    : "Overview";
  modelMapContext.textContent = contextLabel;
  modelMapContext.title = contextLabel;

  const geometry = modelMapNodeGeometry(mapBoard, nodes);
  modelMapSvg.setAttribute("viewBox", `0 0 ${geometry.width} ${geometry.height}`);
  const edgeLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  edgeLayer.setAttribute("class", "model-map-edges");
  edges.forEach((edge) => {
    const path = renderModelMapEdge(edge, geometry);
    if (path) edgeLayer.appendChild(path);
  });
  const nodeLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodeLayer.setAttribute("class", `model-map-nodes${activeNode ? " has-current" : ""}`);
  geometry.nodes.forEach((entry) => nodeLayer.appendChild(renderModelMapNode(entry, activeNode)));
  modelMapSvg.replaceChildren(renderModelMapDefs(), edgeLayer, nodeLayer);

  modelMapA11y.replaceChildren(
    ...nodes.map((node) => {
      const item = document.createElement("li");
      item.textContent = modelMapNodeLabel(node);
      if (node === activeNode) item.setAttribute("aria-current", "location");
      return item;
    }),
  );
  modelMap.classList.remove("is-empty");
  modelMap.setAttribute(
    "aria-label",
    `${selection.view === "parent" ? "Parent" : "Whole model"} map for ${mapBoard.title}. ` +
      `Current region: ${activeLabel || "overview"}.`,
  );
}

function renderNode(node) {
  if (node.kind === "representation") return renderRepresentationNode(node);
  return renderBlockNode(node);
}

const repSymbolById = new Map();
const pseudocodeSymbolById = new Map();
for (const program of Object.values(manifest.pseudocode || {})) {
  for (const symbol of program.symbols || []) {
    if (symbol.id) pseudocodeSymbolById.set(symbol.id, symbol);
    const ref = String(symbol.architectureRef || "");
    if (ref.startsWith("representations.") && symbol.name) {
      repSymbolById.set(ref.slice("representations.".length), symbol);
    }
  }
}

function symbolMarkup(symbol, fallback) {
  if (symbol?.tex) return texMarkup(symbol.tex);
  const name = symbol?.name || fallback;
  return notationMarkup(name);
}

function renderRepresentationNode(node) {
  const rep = node.rep_ref ? repsById.get(node.rep_ref) : null;
  const scale = node.scale || rep?.scale || "item";
  const shape = node.shape || rep?.shape || "";
  const prominence = node.prominence || "secondary";
  const kind = node.glyph || rep?.glyph || glyphKindForShape(shape) || "vector";
  const fullLabel = node.label || rep?.id || node.id;
  const symbolDefinition = pseudocodeSymbolById.get(node.value_site_ref)
    || pseudocodeSymbolById.get(node.id)
    || repSymbolById.get(rep?.id);
  // A view occurrence can name a temporal/state-specific value more precisely
  // than a representation-wide pseudocode symbol. Keep that authored local
  // notation authoritative (for example x_t versus x_{t-10}).
  const symbol = node.notation
    ? symbolMarkup(null, node.notation)
    : symbolMarkup(symbolDefinition, fullLabel);
  const dims = kind === "scalar" || kind === "dictionary" ? "" : shapeDimsLabel(shape);
  const displayMeaning = representationDisplayMeaning(node, rep, fullLabel);
  const semanticGlyphLabel = kind === "coordinates"
    ? "coordinate point cloud"
    : kind === "frames"
      ? "local coordinate frames"
      : kind === "dictionary"
        ? "dictionary of named tensors"
        : null;
  const card = document.createElement("button");
  card.type = "button";
  card.className = `arch-rep tensor-${kind} scale-${scale} prominence-${prominence}`;
  const fieldGroups = Array.isArray(rep?.field_groups) ? rep.field_groups : [];
  if (fieldGroups.length) {
    card.classList.add("has-field-table");
    card.dataset.fieldCount = String(
      fieldGroups.reduce((count, group) => count + (group.fields?.length || 0), 0),
    );
  }
  applyFlowFamily(card, node.flow_family, node.flow_families);
  card.dataset.nodeId = node.id;
  const canonicalRef = canonicalNodeRef(node);
  if (canonicalRef) card.dataset.canonicalRef = canonicalRef;
  card.setAttribute(
    "aria-label",
    [
      fullLabel,
      semanticGlyphLabel,
      displayMeaning,
      shape,
      fieldGroups.length ? "select to inspect the field table" : null,
    ].filter(Boolean).join(" — "),
  );
  placeNode(card, node);
  const symbolHtml = `<strong class="tensor-symbol">${symbol}</strong>`;
  const dictionaryPreviewFields = fieldGroups
    .map((group) => group.fields?.[0])
    .filter(Boolean)
    .slice(0, 3);
  const box = (inner) => `<span class="tensor-box">${tensorGlyphSvg(kind, dictionaryPreviewFields)}${inner}</span>`;
  card.innerHTML = `
    ${symbolHtml}
    ${box(dims ? `<small class="tensor-dims">${dims}</small>` : "")}
    ${displayMeaning ? `<span class="tensor-meaning">${escapeHtml(displayMeaning)}</span>` : ""}
  `;
  attachQuestionMenuHandlers(card, { kind: "node", node });
  const pointerHighlightKey = `pointer:representation:${node.id}`;
  const focusHighlightKey = `focus:representation:${node.id}`;
  card.addEventListener("pointerenter", () => {
    beginConnectivityHighlight(pointerHighlightKey, node.id);
  });
  card.addEventListener("pointerleave", () => {
    endConnectivityHighlight(pointerHighlightKey);
  });
  card.addEventListener("focus", () => {
    beginConnectivityHighlight(focusHighlightKey, node.id);
  });
  card.addEventListener("blur", () => {
    endConnectivityHighlight(focusHighlightKey);
  });
  card.addEventListener("click", () => {
    hideCanvasTooltip();
    clearConnectivityHighlights();
    focusRepresentation(node, rep);
  });
  return card;
}

function representationDisplayMeaning(node, rep, fallback) {
  const label = node.label || rep?.display_label || rep?.id || fallback;
  return String(label || "")
    .replaceAll("_", " ")
    .replace(/\btimestep\b/gi, "time step")
    .trim();
}

function stateSemanticsFor(node, rep) {
  if (node.value_site_ref) {
    const bySite = manifest.architecture.stateSemanticsBySite?.[node.value_site_ref];
    if (bySite) return bySite;
  }
  return rep ? manifest.architecture.stateSemantics?.[rep.id] : null;
}

function valueSiteInterfaceFor(node) {
  return node.value_site_ref ? valueSiteInterfacesById.get(node.value_site_ref) : null;
}

function readableRefs(refs) {
  return (refs || []).map((ref) => humanizeRef(ref)).join(", ");
}

function renderRepresentationFieldTable(rep) {
  const groups = Array.isArray(rep?.field_groups) ? rep.field_groups : [];
  if (!groups.length) return "";
  const rows = groups.map((group) => `
    <tr>
      <th scope="row">
        <strong>${escapeHtml(group.label)}</strong>
        <span class="representation-field-names">
          ${(group.fields || []).map((field) => `<code>${escapeHtml(field)}</code>`).join("")}
        </span>
      </th>
      <td>
        <span class="representation-field-shape">
          <i>${escapeHtml(group.axis)}</i>
          <code>${escapeHtml(group.shape)}</code>
        </span>
        <span>${escapeHtml(group.semantic_role)}</span>
        ${group.task_behavior
          ? `<small><strong>Across tasks:</strong> ${escapeHtml(group.task_behavior)}</small>`
          : ""}
      </td>
    </tr>
  `).join("");
  return `
    <section class="representation-field-section">
      <h3>Feature bundle contents</h3>
      <p class="representation-field-legend"><code>B</code> batch · <code>N</code> padded token axis · <code>A</code> padded atom axis</p>
      <div class="representation-field-table-wrap">
        <table class="representation-field-table">
          <caption class="sr-only">Fields grouped by axis, shape, and purpose</caption>
          <thead><tr><th>Feature family and keys</th><th>Shape and use</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function repFocusHtml(node, rep) {
  const shape = node.shape || rep?.shape || "";
  const semantics = stateSemanticsFor(node, rep);
  const valueSiteInterface = valueSiteInterfaceFor(node);
  const carries = rep?.carries || [];
  return `
    <div class="focus-section">
      <p>${escapeHtml(node.role || rep?.semantic_role || "")}</p>
      <dl class="focus-dl">
        ${shape ? `<dt>shape</dt><dd><code>${escapeHtml(shape)}</code></dd>` : ""}
        <dt>scale</dt><dd>${escapeHtml(node.scale || rep?.scale || "unknown")}</dd>
        ${semantics?.lifecycle ? `<dt>lifecycle</dt><dd>${escapeHtml(String(semantics.lifecycle).replaceAll("_", " "))}</dd>` : ""}
        ${valueSiteInterface?.producerRefs?.length ? `<dt>produced by</dt><dd>${escapeHtml(readableRefs(valueSiteInterface.producerRefs))}</dd>` : ""}
        ${valueSiteInterface?.consumerRefs?.length ? `<dt>consumed by</dt><dd>${escapeHtml(readableRefs(valueSiteInterface.consumerRefs))}</dd>` : ""}
      </dl>
      ${renderRepresentationFieldTable(rep)}
      ${semantics?.notes?.length ? semantics.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("") : ""}
      ${carries.length ? `<h3>Carries</h3><ul class="claim-list">${carries.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      ${node.template_fact_ref ? `<p><strong>Reusable template:</strong> <code>${escapeHtml(node.template_fact_ref)}</code></p>` : ""}
      ${rep?.evidence ? renderReferences(rep) : ""}
    </div>
  `;
}

function focusRepresentation(node, rep) {
  setSelection({ kind: "node", node });
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = node.label || rep?.id || node.id;
  setFocusBody(repFocusHtml(node, rep), { selected: true });
}

const OPERATOR_KINDS = {
  elementwise_sum: "+",
  elementwise_product: "×",
  concatenation: "∥",
};

function operatorSymbolFor(node, module) {
  return node.operator || OPERATOR_KINDS[module?.kind] || null;
}

function targetBoardForNode(node) {
  const boardId = node.board_ref || (node.expandable ? node.module_ref || node.id : null);
  return boardId ? boardsById.get(boardId) || null : null;
}

function renderBlockNode(node) {
  const module = node.module_ref ? modulesById.get(node.module_ref) : null;
  const scale = node.scale || module?.scale || "item";
  const targetBoard = targetBoardForNode(node);
  const expandable = Boolean(targetBoard);
  const prominence = node.prominence || "secondary";
  const treatment = node.treatment || "block";
  const density = node.density || "normal";
  const operator = operatorSymbolFor(node, module);
  const card = document.createElement("article");
  card.className = operator
    ? `arch-node arch-op-node scale-${scale}`
    : `arch-node scale-${scale} prominence-${prominence} treatment-${treatment} density-${density}`;
  if (node.kind === "operation") card.classList.add("is-operation");
  if (expandable) card.classList.add("is-expandable");
  applyFlowFamily(card, node.flow_family, node.flow_families);
  card.dataset.nodeId = node.id;
  const canonicalRef = canonicalNodeRef(node);
  if (canonicalRef) card.dataset.canonicalRef = canonicalRef;
  if (module) card.dataset.moduleId = module.id;
  placeNode(card, node);
  const selectButton = document.createElement("button");
  selectButton.type = "button";
  selectButton.className = "arch-node-main";
  selectButton.innerHTML = operator
    ? `
      <span class="op-circle">${escapeHtml(operator)}</span>
      <span class="op-label">${escapeHtml(node.label || module?.label || node.id)}</span>
    `
    : blockCardHtml(node, module);
  const label = node.label || module?.label || node.id;
  selectButton.setAttribute("aria-label", `Inspect ${label}`);
  attachQuestionMenuHandlers(selectButton, { kind: "node", node });
  card.appendChild(selectButton);
  if (targetBoard) {
    const drillButton = document.createElement("button");
    drillButton.type = "button";
    drillButton.className = "arch-drill-cue arch-node-drill";
    drillButton.setAttribute("aria-label", `Zoom into ${targetBoard.title}`);
    drillButton.title = `Zoom into ${targetBoard.title}`;
    drillButton.innerHTML = magnifyIconMarkup();
    drillButton.addEventListener("click", (event) => {
      event.stopPropagation();
      hideCanvasTooltip();
      clearConnectivityHighlights();
      pushBoard(targetBoard.id, node.id);
    });
    card.appendChild(drillButton);
  }
  const pointerHighlightKey = `pointer:node:${node.id}`;
  const focusHighlightKey = `focus:node:${node.id}`;
  card.addEventListener("mouseenter", () => {
    beginConnectivityHighlight(pointerHighlightKey, node.id);
  });
  card.addEventListener("mouseleave", () => {
    endConnectivityHighlight(pointerHighlightKey);
  });
  card.addEventListener("focusin", () => {
    beginConnectivityHighlight(focusHighlightKey, node.id);
  });
  card.addEventListener("focusout", (event) => {
    if (card.contains(event.relatedTarget)) return;
    endConnectivityHighlight(focusHighlightKey);
  });
  selectButton.addEventListener("click", () => {
    hideCanvasTooltip();
    clearConnectivityHighlights();
    if (module) {
      focusModule(module, node);
    } else {
      focusOperation(node);
    }
  });
  return card;
}

function placeNode(element, node) {
  element.style.gridColumn = String(node.col || 1);
  element.style.gridRow = String(node.row || 1);
}

function blockCardHtml(node, module) {
  const kind = node.kind === "operation" ? "operation" : module?.kind || node.kind;
  const label = node.label || module?.label || node.id;
  const role = node.role || module?.role || "";
  const detail = node.detail || moduleDetail(module) || kind;
  const repeat = module?.repeats ? `<span class="arch-repeat">x${escapeHtml(module.repeats)}</span>` : "";
  const badges = blockBadges(node, module);
  if (node.treatment === "chip" || node.density === "micro") {
    return `
      <strong>${escapeHtml(label)}</strong>
      <span class="arch-chip-meta">${escapeHtml(node.scale || module?.scale || kind)}</span>
    `;
  }

  if (node.treatment === "compact" || node.density === "compact") {
    return `
      <span class="arch-node-top">
        <span class="arch-kind">${escapeHtml(kind)}</span>
        ${repeat}
      </span>
      <strong>${escapeHtml(label)}</strong>
      <span class="arch-badges">
        ${badges.map((badge) => `<i>${escapeHtml(badge)}</i>`).join("")}
      </span>
    `;
  }

  return `
    <span class="arch-node-top">
      <span class="arch-kind">${escapeHtml(kind)}</span>
      ${repeat}
    </span>
    <strong>${escapeHtml(label)}</strong>
    <span class="arch-role">${escapeHtml(role)}</span>
    <span class="arch-spec">${escapeHtml(detail)}</span>
    <span class="arch-badges">
      ${badges.map((badge) => `<i>${escapeHtml(badge)}</i>`).join("")}
    </span>
  `;
}

function blockBadges(node, module) {
  const pairBias = module?.attention?.pair_bias === true
    ? "pair bias"
    : module?.attention?.pair_bias === false
      ? "no pair bias"
      : null;
  return [
    node.scale || module?.scale,
    module?.attention?.pattern,
    pairBias,
  ].filter(Boolean);
}

function moduleDetail(module) {
  if (!module) return "";
  if (module.depth) {
    return `${module.depth.blocks ?? "?"} blocks / ${module.depth.heads ?? "?"} heads`;
  }
  return module.kind;
}

const prefersReducedMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
// Presentation rules, gathered in one place. The ones that decide what is
// VISIBLE (not just how it looks) are specced in
// protocol/visualization-language.md — change them there first.
const RULES = {
  layout: {
    contentMinColumn: 96,
    contentColumnGap: 42,
    contentMinRow: 112,
    contentRowGap: 18,
    edgeTextPadding: 16,
    edgeTextVerticalPadding: 24,
    edgeLabelWrapWidth: 112,
    edgeBadgeWrapWidth: 160,
    edgeAnnotationSegmentPadding: 4,
    edgeAnnotationCrossAxisGap: 8,
    edgeAnnotationNodeClearance: 10,
    edgeAnnotationClearance: 6,
  },
  gesture: {
    wheelLinePixels: 16,
    maxWheelDelta: 160,
    wheelZoomSensitivity: 0.0015,
  },
  // orthogonal edge routing: all edges are horizontal/vertical polylines
  route: {
    margin: 14, // clearance kept around node boxes when dodging them
    snap: 12, // dock misalignment (px) below which edges straighten
    channelStep: 18, // search step for a clear channel between boxes
    laneClearance: 28, // distance of detour lanes outside the boxes
    nudge: 10, // separation applied to overlapping parallel segments
    portPreference: 42, // cost for choosing a side that faces away from the other node
    arrowLanding: DEFAULT_ARROW_LANDING, // straight shaft reserved before arrowheads
  },
  // One render-first board arrival; navigation never waits on an outgoing scene.
  diveScale: 2.2,
  arriveScale: 0.92,
  transitionMs: 200,
  // fit-to-content margin inside the canvas
  fitMargin: 12,
};
function applyTransitionDuration() {
  elements.canvas.style.setProperty("--board-transition-ms", `${RULES.transitionMs}ms`);
}
applyTransitionDuration();

function setBoardTransition(on) {
  elements.canvas.classList.toggle("is-board-transition", on);
}

function cancelBoardArrival() {
  boardTransitionGeneration += 1;
  state.isTransitioning = false;
  setBoardTransition(false);
  elements.canvas.classList.remove("is-board-fading");
}

function animateArriveFrom(originNodeId) {
  const generation = ++boardTransitionGeneration;
  if (prefersReducedMotion) {
    state.isTransitioning = false;
    setBoardTransition(false);
    elements.canvas.classList.remove("is-board-fading");
    return;
  }
  let start = null;
  if (originNodeId) {
    const box = nodeBox(originNodeId);
    if (box) {
      const canvasRect = elements.canvas.getBoundingClientRect();
      const baseX = elements.moduleLayer.offsetLeft;
      const baseY = elements.moduleLayer.offsetTop;
      const center = boardViewportCenter(canvasRect, baseX, baseY);
      const scale = RULES.diveScale;
      start = {
        scale,
        x: center.x - baseX - box.cx * scale,
        y: center.y - baseY - box.cy * scale,
      };
    }
  }
  if (!start) {
    const scale = RULES.arriveScale;
    start = {
      scale,
      x: (elements.moduleLayer.offsetWidth * (1 - scale)) / 2,
      y: (elements.moduleLayer.offsetHeight * (1 - scale)) / 2,
    };
  }
  state.isTransitioning = true;
  elements.canvas.classList.add("is-board-fading");
  viewport.x = start.x;
  viewport.y = start.y;
  viewport.scale = start.scale;
  applyViewport({ immediate: true });
  window.requestAnimationFrame(() => {
    if (generation !== boardTransitionGeneration) return;
    window.requestAnimationFrame(() => {
      if (generation !== boardTransitionGeneration) return;
      setBoardTransition(true);
      elements.canvas.classList.remove("is-board-fading");
      fitToContent();
      window.setTimeout(() => {
        if (generation !== boardTransitionGeneration) return;
        setBoardTransition(false);
        state.isTransitioning = false;
        scheduleGeometryUpdate({ fit: !state.userMovedViewport });
      }, RULES.transitionMs);
    });
  });
}

function pushBoard(boardId, originNodeId) {
  if (!boardsById.has(boardId) || state.isTransitioning) return;
  state.boardStack.push(boardId);
  state.boardOrigins.push(originNodeId || null);
  state.userMovedViewport = false;
  resetViewport();
  withDeepLinkWritesSuppressed(() => {
    renderBoard();
    focusOverview();
  });
  syncDeepLinkHistory();
  animateArriveFrom(null);
  focusBoardNavigationTarget();
}

function popToBoard(index) {
  if (state.isTransitioning) return;
  const returningFromBoardId = state.boardStack[index + 1];
  const returningToOriginId = state.boardOrigins[index + 1];
  state.boardStack = state.boardStack.slice(0, index + 1);
  state.boardOrigins = state.boardOrigins.slice(0, index + 1);
  state.userMovedViewport = false;
  resetViewport();
  withDeepLinkWritesSuppressed(() => {
    renderBoard();
    focusOverview();
  });
  syncDeepLinkHistory();
  const origin = (currentBoard().nodes || []).find((node) =>
    returningToOriginId
      ? node.id === returningToOriginId
      : targetBoardForNode(node)?.id === returningFromBoardId,
  );
  animateArriveFrom(origin?.id || null);
  focusBoardNavigationTarget(origin?.id || null);
}

function focusBoardNavigationTarget(originNodeId = null) {
  const origin = originNodeId
    ? Array.from(elements.moduleLayer.querySelectorAll("[data-node-id]")).find(
        (element) => element.dataset.nodeId === originNodeId,
      )
    : null;
  const navigationTarget = elements.boardBack.hidden ? null : elements.boardBack;
  (origin || navigationTarget || elements.canvas).focus({ preventScroll: true });
}

function displayGraph(board, { includeRepresentedIterations = false } = {}) {
  const nodes = (board.nodes || []).filter((node) => !node.elide);
  const elided = (board.nodes || []).filter((node) => node.elide);
  const representedIterationRefs = representedIterationRelationRefs(board);
  let edges = (board.edges || []).map((edge) => ({
    ...edge,
    segments: edge.segments?.length ? edge.segments : [edge],
  })).filter((edge) => (
    includeRepresentedIterations
      || !edgeIsRepresentedByRepeatRegion(edge, representedIterationRefs)
  ));

  for (const hidden of elided) {
    const incoming = edges.filter((edge) => edge.to === hidden.id);
    const outgoing = edges.filter((edge) => edge.from === hidden.id);
    const rest = edges.filter((edge) => edge.from !== hidden.id && edge.to !== hidden.id);
    const merged = [];
    for (const inEdge of incoming) {
      for (const outEdge of outgoing) {
        merged.push({
          from: inEdge.from,
          to: outEdge.to,
          kind: [inEdge.kind, outEdge.kind].includes("conditioning")
            ? "conditioning"
            : outEdge.kind || inEdge.kind,
          label: outEdge.label,
          tone: inEdge.tone === "conditioning" || outEdge.tone === "conditioning"
            ? "conditioning"
            : outEdge.tone || inEdge.tone,
          connection: outEdge.connection,
          segments: [...inEdge.segments, ...outEdge.segments],
        });
      }
    }
    edges = [...rest, ...merged];
  }
  edges = edges.map((edge) => {
    const profile = edgeFlowProfile(edge, { repsById, relationsById });
    return {
      ...edge,
      flow_family: profile.family,
      flow_families: profile.families,
      carried_representation_refs: profile.representation_refs,
    };
  });
  return { nodes, edges };
}

function derivedConditioning(board, edge) {
  const relationConditioning = [edge, ...(edge.segments || [])]
    .map((segment) => conditioningByRelation.get(segment.relation_ref))
    .filter(Boolean)
    .filter((conditioning, index, all) =>
      all.findIndex((candidate) => candidate.id === conditioning.id) === index,
    );
  if (relationConditioning.length) return relationConditioning;
  const nodes = new Map((board.nodes || []).map((node) => [node.id, node]));
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  const fromRef = from?.rep_ref || from?.module_ref;
  const toRef = to?.module_ref || to?.rep_ref;
  if (!fromRef || !toRef) return [];
  const fallback = conditioningByPair.get(`${fromRef}->${toRef}`);
  return fallback ? [fallback] : [];
}

function roundedOrthPath(points, radius = 9) {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const inLen = Math.hypot(corner.x - prev.x, corner.y - prev.y);
    const outLen = Math.hypot(next.x - corner.x, next.y - corner.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const inX = corner.x - ((corner.x - prev.x) / (inLen || 1)) * r;
    const inY = corner.y - ((corner.y - prev.y) / (inLen || 1)) * r;
    const outX = corner.x + ((next.x - corner.x) / (outLen || 1)) * r;
    const outY = corner.y + ((next.y - corner.y) / (outLen || 1)) * r;
    d += ` L ${inX} ${inY} Q ${corner.x} ${corner.y} ${outX} ${outY}`;
  }
  const last = points.at(-1);
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function polylineMidpoint(points) {
  const lengths = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    lengths.push(len);
    total += len;
  }
  let target = total / 2;
  for (let i = 1; i < points.length; i += 1) {
    const len = lengths[i - 1];
    if (target <= len) {
      const t = len ? target / len : 0;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      };
    }
    target -= len;
  }
  return points.at(-1);
}

function longestHorizontalSegment(points) {
  let longest = null;
  for (let index = 1; index < (points || []).length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    if (Math.abs(to.y - from.y) > 0.5) continue;
    const length = Math.abs(to.x - from.x);
    if (!length || (longest && longest.length >= length)) continue;
    longest = {
      from,
      to,
      length,
      midpoint: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
    };
  }
  return longest;
}

function renderEdges() {
  const board = currentBoard();
  const width = elements.moduleLayer.offsetWidth;
  const height = elements.moduleLayer.offsetHeight;
  elements.edgeLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.edgeLayer.innerHTML = "";
  elements.edgeLayer.appendChild(renderEdgeMarkers());
  const pathLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  pathLayer.setAttribute("class", "arch-edge-paths");
  const annotationLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  annotationLayer.setAttribute("class", "arch-edge-annotations");
  const hitLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  hitLayer.setAttribute("class", "arch-edge-hits");
  elements.edgeLayer.append(pathLayer, annotationLayer, hitLayer);

  const edges = state.displayEdges || displayGraph(board).edges;
  const orthoRoutes = buildOrthoRoutes(edges);
  const renderedRoutes = new Map();
  const annotationObstacles = visibleNodes(board)
    .map((node) => nodeBox(node.id))
    .filter(Boolean);
  const occupiedAnnotationBoxes = [];
  edges.forEach((edge, index) => {
    const conditioning = derivedConditioning(board, edge);
    if (conditioning.length && !edge.tone) edge.tone = "conditioning";
    const contracted = (edge.segments || []).length > 1;

    let routePoints;
    const routed = state.layoutEdges?.get(index);
    if (routed && routed.length >= 2) {
      routePoints = routed;
    } else {
      const route = orthoRoutes.get(index);
      if (!route) return;
      routePoints = route;
    }
    routePoints = ensureMinimumLanding(routePoints, RULES.route.arrowLanding);
    renderedRoutes.set(index, routePoints);
    const pathD = roundedOrthPath(routePoints);
    const labelSegment = longestHorizontalSegment(routePoints);
    const edgeSpan = Math.hypot(
      routePoints.at(-1).x - routePoints[0].x,
      routePoints.at(-1).y - routePoints[0].y,
    );
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("class", "arch-edge");
    path.setAttribute("aria-hidden", "true");
    path.setAttribute("marker-end", `url(#${edgeMarkerId(edge)})`);
    path.dataset.edgeIndex = String(index);
    if (contracted) path.classList.add("is-contracted");
    applyEdgeTone(path, edge);
    pathLayer.appendChild(path);

    const labelLines = edge.label ? edgeLabelLines(edge.label) : [];
    const labelWidth = Math.max(
      0,
      ...labelLines.map((line) => measureEdgeText(line, "label")),
    );
    const showLabel = edge.label && edgeLabelFits({
      span: labelSegment?.length || edgeSpan,
      textWidth: labelWidth,
      padding: RULES.layout.edgeTextPadding,
      force: contracted || edge.tone === "conditioning",
    });
    const visibleLabelLines = showLabel ? labelLines : [];
    const badgeLines = conditioning.length ? conditioningBadgeLines(conditioning) : [];
    const annotationSize = measureEdgeAnnotation({
      ...EDGE_ANNOTATION_METRICS,
      labelWidth: showLabel ? labelWidth : 0,
      labelHeight: visibleLabelLines.length * EDGE_ANNOTATION_METRICS.labelHeight,
      badgeLineWidths: badgeLines.map((line) => measureEdgeText(line, "badge")),
    });
    const annotationPlacement = placeEdgeAnnotation({
      route: routePoints,
      size: annotationSize,
      obstacles: annotationObstacles,
      occupied: occupiedAnnotationBoxes,
      segmentPadding: RULES.layout.edgeAnnotationSegmentPadding,
      crossAxisGap: RULES.layout.edgeAnnotationCrossAxisGap,
      obstaclePadding: RULES.layout.edgeAnnotationNodeClearance,
      occupiedPadding: RULES.layout.edgeAnnotationClearance,
    });
    const annotationBox = annotationPlacement?.box;
    if (annotationBox) occupiedAnnotationBoxes.push(annotationBox);
    const annotationX = annotationBox ? annotationBox.x + annotationBox.width / 2 : null;
    let annotationY = annotationBox ? annotationBox.y + EDGE_ANNOTATION_METRICS.paddingY : null;

    if (showLabel && annotationBox) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(annotationX));
      label.setAttribute("y", String(annotationY + EDGE_TEXT_STYLES.label.fontSize));
      label.setAttribute("class", "arch-edge-label");
      label.setAttribute("aria-hidden", "true");
      label.dataset.edgeIndex = String(index);
      label.dataset.annotationSide = annotationPlacement.side;
      label.dataset.label = edge.label;
      applyEdgeTone(label, edge);
      visibleLabelLines.forEach((line, lineIndex) => {
        const span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        span.setAttribute("x", String(annotationX));
        span.setAttribute(
          "y",
          String(annotationY + EDGE_TEXT_STYLES.label.fontSize
            + lineIndex * EDGE_ANNOTATION_METRICS.labelHeight),
        );
        span.textContent = line;
        label.appendChild(span);
      });
      annotationLayer.appendChild(label);
      annotationY += visibleLabelLines.length * EDGE_ANNOTATION_METRICS.labelHeight;
      if (badgeLines.length) annotationY += EDGE_ANNOTATION_METRICS.groupGap;
    }

    if (badgeLines.length && annotationBox) {
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badge.setAttribute("class", "arch-edge-badge");
      badge.setAttribute("aria-hidden", "true");
      badge.dataset.edgeIndex = String(index);
      badge.dataset.annotationSide = annotationPlacement.side;
      badgeLines.forEach((line, lineIndex) => {
        const span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        span.setAttribute("x", String(annotationX));
        span.setAttribute(
          "y",
          String(annotationY + EDGE_TEXT_STYLES.badge.fontSize
            + lineIndex * (EDGE_ANNOTATION_METRICS.badgeLineHeight
              + EDGE_ANNOTATION_METRICS.badgeLineGap)),
        );
        span.textContent = line;
        badge.appendChild(span);
      });
      applyEdgeTone(badge, edge);
      annotationLayer.appendChild(badge);
    }

    hitLayer.appendChild(renderEdgeHitTarget(edge, pathD, index));
  });
  state.edgeRoutes = renderedRoutes;
  state.edgeAnnotationBoxes = occupiedAnnotationBoxes;
  renderBoardRegions(board);
  renderLatestConnectivityHighlight();
  restoreSelectionVisuals();
}

function renderBoardRegions(board) {
  elements.regionLayer.replaceChildren();
  renderVisualSegmentRegions({
    regionLayer: elements.regionLayer,
    moduleLayer: elements.moduleLayer,
    board,
    surfaceKey: "primary",
  });
  for (const region of repeatRegions(board)) {
    const boxes = (region.node_ids || region.nodeIds || []).map((nodeId) => {
      const element = elements.moduleLayer.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`);
      if (!element) return null;
      return {
        x: element.offsetLeft,
        y: element.offsetTop,
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    });
    const bounds = repeatRegionBounds(boxes);
    if (!bounds) continue;

    const loop = executionLoopForRef(
      manifest.architecture.execution || {},
      region.execution_ref || region.executionRef,
    );
    const enclosure = document.createElement("div");
    enclosure.className = "board-region repeat-region";
    enclosure.dataset.regionId = region.id;
    enclosure.setAttribute("aria-hidden", "true");
    enclosure.style.left = `${Math.round(bounds.x)}px`;
    enclosure.style.top = `${Math.round(bounds.y)}px`;
    enclosure.style.width = `${Math.round(bounds.width)}px`;
    enclosure.style.height = `${Math.round(bounds.height)}px`;

    const header = document.createElement("div");
    header.className = "repeat-region-header";
    const label = document.createElement("span");
    label.className = "repeat-region-label";
    label.textContent = region.label || "repeated block";
    header.appendChild(label);
    if (loop?.repeats) {
      const count = document.createElement("span");
      count.className = "repeat-region-count";
      count.textContent = `repeat ×${loop.repeats}`;
      header.appendChild(count);
    }
    enclosure.appendChild(header);
    elements.regionLayer.appendChild(enclosure);
  }
}

function restoreSelectionVisuals() {
  if (!state.selection || state.selection.boardId !== currentBoard().id) return;
  if (state.selection.kind === "node") {
    elements.moduleLayer
      .querySelector(`[data-node-id="${state.selection.occurrenceId}"]`)
      ?.classList.add("is-focused");
    return;
  }
  const edgeIndex = (state.displayEdges || []).findIndex(
    (edge) => edgeSelectionKey(edge) === state.selection.edgeId,
  );
  if (edgeIndex < 0) return;
  state.selection.edge = state.displayEdges[edgeIndex];
  elements.edgeLayer.querySelectorAll(`[data-edge-index="${edgeIndex}"]`).forEach((element) => {
    element.classList.add("is-selected");
  });
  const edge = state.displayEdges[edgeIndex];
  elements.moduleLayer.querySelector(`[data-node-id="${edge.to}"]`)?.classList.add("is-focused");
}

function renderEdgeMarkers() {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  [
    ["edge-arrow-default", "edge-marker-default"],
    ["edge-arrow-conditioning", "edge-marker-conditioning"],
    ["edge-arrow-skip", "edge-marker-skip"],
    ["edge-arrow-single", "edge-marker-single"],
    ["edge-arrow-pair", "edge-marker-pair"],
    ["edge-arrow-coordinates", "edge-marker-coordinates"],
    ["edge-arrow-frames", "edge-marker-frames"],
  ].forEach(([id, markerClass]) => {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", id);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "14");
    marker.setAttribute("markerHeight", "14");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "userSpaceOnUse");

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    arrow.setAttribute("class", markerClass);
    marker.appendChild(arrow);
    defs.appendChild(marker);
  });
  return defs;
}

function edgeMarkerId(edge) {
  if (edge.tone === "skip") return "edge-arrow-skip";
  if (PAYLOAD_FLOW_FAMILIES.includes(edge.flow_family)) {
    return `edge-arrow-${edge.flow_family}`;
  }
  if (edge.tone === "conditioning") return "edge-arrow-conditioning";
  return "edge-arrow-default";
}

function edgeMarkerFamily(edge) {
  if (edge.tone === "skip") return "skip";
  if (PAYLOAD_FLOW_FAMILIES.includes(edge.flow_family)) return edge.flow_family;
  if (edge.tone === "conditioning") return "conditioning";
  return "default";
}

function explicitLaneRoute(edge, fromBox, toBox, allBoxes) {
  const side = edge.route_side;
  if (!["top", "bottom", "left", "right"].includes(side)) return null;

  const clearance = Number(edge.route_clearance || 42);
  if (side === "top" || side === "bottom") {
    const lo = Math.min(fromBox.cx, toBox.cx);
    const hi = Math.max(fromBox.cx, toBox.cx);
    const relevant = allBoxes.filter((box) => box.x <= hi && box.x + box.width >= lo);
    const boundary = side === "top"
      ? Math.min(...relevant.map((box) => box.y))
      : Math.max(...relevant.map((box) => box.y + box.height));
    const laneY = side === "top"
      ? Math.min(boundary - 6, Math.max(12, boundary - clearance))
      : Math.max(boundary + 6, Math.min(elements.moduleLayer.offsetHeight - 12, boundary + clearance));
    const from = sidePoint(fromBox, side, 0.5);
    const to = sidePoint(toBox, side, 0.5);
    return ensureMinimumLanding(
      cleanRoute([from, { x: from.x, y: laneY }, { x: to.x, y: laneY }, to]),
      RULES.route.arrowLanding,
    );
  }

  const lo = Math.min(fromBox.cy, toBox.cy);
  const hi = Math.max(fromBox.cy, toBox.cy);
  const relevant = allBoxes.filter((box) => box.y <= hi && box.y + box.height >= lo);
  const boundary = side === "left"
    ? Math.min(...relevant.map((box) => box.x))
    : Math.max(...relevant.map((box) => box.x + box.width));
  const laneX = side === "left"
    ? Math.min(boundary - 6, Math.max(12, boundary - clearance))
    : Math.max(boundary + 6, Math.min(elements.moduleLayer.offsetWidth - 12, boundary + clearance));
  const from = sidePoint(fromBox, side, 0.5);
  const to = sidePoint(toBox, side, 0.5);
  return ensureMinimumLanding(
    cleanRoute([from, { x: laneX, y: from.y }, { x: laneX, y: to.y }, to]),
    RULES.route.arrowLanding,
  );
}

const ROUTE_SIDES = ["right", "bottom", "left", "top"];
const SIDE_VECTOR = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
};

// Route every board edge as an orthogonal polyline: dock on the facing box
// sides, then pick the cheapest horizontal/vertical route that crosses no
// node box. Port pairs are selected from all four sides so a nearby obstacle
// or two diagonally overlapping boxes cannot force an edge to tunnel through
// a node or double back before reaching its target.
function buildOrthoRoutes(edges) {
  const routes = new Map();
  const boxes = new Map();
  const boxFor = (id) => {
    if (!boxes.has(id)) boxes.set(id, nodeBox(id));
    return boxes.get(id);
  };

  edges.forEach((edge) => {
    boxFor(edge.from);
    boxFor(edge.to);
  });
  const allBoxes = [...boxes.values()].filter(Boolean);
  const feedbackLanes = allocateFeedbackLanes(edges, boxes, {
    baseClearance: RULES.route.laneClearance + 14,
    laneStep: RULES.route.channelStep,
  });

  const obstaclesFor = (edge) => {
    const obstacles = [];
    boxes.forEach((box, id) => {
      if (!box || id === edge.from || id === edge.to) return;
      obstacles.push(inflateBox(box, RULES.route.margin));
    });
    return obstacles;
  };

  const plans = [];
  edges.forEach((edge, index) => {
    if (state.layoutEdges?.get(index)) return;
    const fromBox = boxFor(edge.from);
    const toBox = boxFor(edge.to);
    if (!fromBox || !toBox || fromBox === toBox) return;
    const inferredFeedback = feedbackLanes.get(index);
    const routedEdge = inferredFeedback
      ? {
          ...edge,
          route_side: inferredFeedback.side,
          route_clearance: inferredFeedback.clearance,
        }
      : edge;
    const explicitRoute = explicitLaneRoute(routedEdge, fromBox, toBox, allBoxes);
    if (explicitRoute) {
      routes.set(index, explicitRoute);
      return;
    }
    const plan = chooseRoutePlan(edge, index, fromBox, toBox, obstaclesFor(edge));
    if (plan) plans.push(plan);
  });

  spreadDockPoints(plans);

  plans.forEach((plan) => {
    const obstacles = obstaclesFor(plan.edge);
    const route = routeOrthogonal(plan, obstacles);
    if (route) routes.set(plan.index, route);
  });

  separateParallelSegments(routes, {
    nudge: RULES.route.nudge,
    minimumDeparture: RULES.route.margin + 6,
    minimumArrival: RULES.route.arrowLanding,
  });
  return routes;
}

function chooseRoutePlan(edge, index, fromBox, toBox, obstacles) {
  const clearFacing = clearFacingPortPlan(fromBox, toBox, obstacles);
  if (clearFacing) {
    return {
      edge,
      index,
      fromBox,
      toBox,
      ...clearFacing,
      preserveFacingDocks: true,
    };
  }
  let bestPlan = null;
  let bestScore = Number.POSITIVE_INFINITY;
  ROUTE_SIDES.forEach((exitSide) => {
    ROUTE_SIDES.forEach((enterSide) => {
      const plan = {
        edge,
        index,
        fromBox,
        toBox,
        exitSide,
        enterSide,
        start: sidePoint(fromBox, exitSide, 0.5),
        end: sidePoint(toBox, enterSide, 0.5),
      };
      if (opposingPortsAreCrossed(plan)) return;
      const route = routeOrthogonal(plan, obstacles);
      if (!route) return;
      const score = routeScore(route, obstacles) + portPreferencePenalty(plan);
      if (score < bestScore) {
        bestScore = score;
        bestPlan = plan;
      }
    });
  });
  return bestPlan;
}

function opposingPortsAreCrossed(plan) {
  const { start, end, exitSide, enterSide } = plan;
  if (exitSide === "right" && enterSide === "left") return start.x > end.x;
  if (exitSide === "left" && enterSide === "right") return start.x < end.x;
  if (exitSide === "bottom" && enterSide === "top") return start.y > end.y;
  if (exitSide === "top" && enterSide === "bottom") return start.y < end.y;
  return false;
}

function portPreferencePenalty(plan) {
  return sideAlignmentPenalty(plan.exitSide, plan.fromBox, plan.toBox)
    + sideAlignmentPenalty(plan.enterSide, plan.toBox, plan.fromBox);
}

function sideAlignmentPenalty(side, box, otherBox) {
  const dx = otherBox.cx - box.cx;
  const dy = otherBox.cy - box.cy;
  const distance = Math.hypot(dx, dy) || 1;
  const vector = SIDE_VECTOR[side];
  const alignment = (vector.x * dx + vector.y * dy) / distance;
  return (1 - alignment) * RULES.route.portPreference;
}

function sidePoint(box, side, t) {
  if (side === "left") return { x: box.x, y: box.y + box.height * t };
  if (side === "right") return { x: box.x + box.width, y: box.y + box.height * t };
  if (side === "top") return { x: box.x + box.width * t, y: box.y };
  return { x: box.x + box.width * t, y: box.y + box.height };
}

// Edges sharing a box side dock at distinct evenly spaced points, ordered by
// where their other endpoint sits, so they never stack at the box border.
function spreadDockPoints(plans) {
  const groups = new Map();
  const add = (key, entry) => {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  };
  plans.forEach((plan) => {
    add(`${plan.edge.from}|${plan.exitSide}`, { plan, end: "start", box: plan.fromBox, side: plan.exitSide, other: plan.toBox });
    add(`${plan.edge.to}|${plan.enterSide}`, { plan, end: "end", box: plan.toBox, side: plan.enterSide, other: plan.fromBox });
  });
  groups.forEach((entries) => {
    if (entries.length === 1 && entries[0].plan.preserveFacingDocks) return;
    const alongY = entries[0].side === "left" || entries[0].side === "right";
    entries.sort((a, b) => (alongY ? a.other.cy - b.other.cy : a.other.cx - b.other.cx));
    entries.forEach((entry, i) => {
      entry.plan[entry.end] = sidePoint(entry.box, entry.side, (i + 1) / (entries.length + 1));
    });
  });
  // A few px of dock misalignment would read as a pointless jog; snap both
  // docks to the shared coordinate so grid-aligned neighbors get a straight line.
  plans.forEach((plan) => {
    const horizontalPorts = [plan.exitSide, plan.enterSide]
      .every((side) => side === "left" || side === "right");
    const verticalPorts = [plan.exitSide, plan.enterSide]
      .every((side) => side === "top" || side === "bottom");
    const axis = horizontalPorts ? "y" : verticalPorts ? "x" : null;
    if (!axis) return;
    const delta = plan.end[axis] - plan.start[axis];
    if (delta === 0 || Math.abs(delta) > RULES.route.snap) return;
    const mid = (plan.start[axis] + plan.end[axis]) / 2;
    if (dockWithinSide(plan.fromBox, plan.exitSide, mid) && dockWithinSide(plan.toBox, plan.enterSide, mid)) {
      plan.start[axis] = mid;
      plan.end[axis] = mid;
    }
  });
}

function dockWithinSide(box, side, coord) {
  const pad = 6;
  if (side === "left" || side === "right") return coord >= box.y + pad && coord <= box.y + box.height - pad;
  return coord >= box.x + pad && coord <= box.x + box.width - pad;
}

function inflateBox(box, margin) {
  return { x: box.x - margin, y: box.y - margin, width: box.width + margin * 2, height: box.height + margin * 2 };
}

function routeOrthogonal(plan, obstacles) {
  if (opposingPortsAreCrossed(plan)) return null;
  const { start, end } = plan;
  const candidates = [];
  const departureStub = RULES.route.margin + 6;
  const [startStub, endStub] = routeStubLengths(
    plan,
    departureStub,
    RULES.route.arrowLanding,
  );
  const startOut = offsetTowardSide(start, plan.exitSide, startStub);
  const endOut = offsetTowardSide(end, plan.enterSide, endStub);
  const wrap = (core) => [start, startOut, ...core, endOut, end];

  if (startOut.x === endOut.x || startOut.y === endOut.y) {
    candidates.push(wrap([startOut, endOut]));
  }
  candidates.push(wrap([startOut, { x: endOut.x, y: startOut.y }, endOut]));
  candidates.push(wrap([startOut, { x: startOut.x, y: endOut.y }, endOut]));
  channelPositions(startOut.x, endOut.x).forEach((x) => {
    candidates.push(wrap([startOut, { x, y: startOut.y }, { x, y: endOut.y }, endOut]));
  });
  channelPositions(startOut.y, endOut.y).forEach((y) => {
    candidates.push(wrap([startOut, { x: startOut.x, y }, { x: endOut.x, y }, endOut]));
  });

  const top = Math.min(plan.fromBox.y, plan.toBox.y) - RULES.route.laneClearance;
  const bottom = Math.max(
    plan.fromBox.y + plan.fromBox.height,
    plan.toBox.y + plan.toBox.height,
  ) + RULES.route.laneClearance;
  const left = Math.min(plan.fromBox.x, plan.toBox.x) - RULES.route.laneClearance;
  const right = Math.max(
    plan.fromBox.x + plan.fromBox.width,
    plan.toBox.x + plan.toBox.width,
  ) + RULES.route.laneClearance;
  [top, bottom].forEach((y) => {
    candidates.push(wrap([startOut, { x: startOut.x, y }, { x: endOut.x, y }, endOut]));
  });
  [left, right].forEach((x) => {
    candidates.push(wrap([startOut, { x, y: startOut.y }, { x, y: endOut.y }, endOut]));
  });
  return pickBestRoute(candidates, obstacles, plan);
}

function routeStubLengths(plan, departure, arrival) {
  const { start, end, exitSide, enterSide } = plan;
  let gap = null;
  if (exitSide === "right" && enterSide === "left") gap = end.x - start.x;
  if (exitSide === "left" && enterSide === "right") gap = start.x - end.x;
  if (exitSide === "bottom" && enterSide === "top") gap = end.y - start.y;
  if (exitSide === "top" && enterSide === "bottom") gap = start.y - end.y;
  return fitEndpointStubLengths(gap, departure, arrival);
}

function offsetTowardSide(point, side, distance) {
  const vector = SIDE_VECTOR[side];
  return {
    x: point.x + vector.x * distance,
    y: point.y + vector.y * distance,
  };
}

// Candidate positions for the bend between two docks: the midpoint first,
// then steps outward, all strictly between the boxes.
function channelPositions(a, b) {
  if (Math.abs(b - a) < 12) return [];
  const lo = Math.min(a, b) + 6;
  const hi = Math.max(a, b) - 6;
  const mid = (lo + hi) / 2;
  const positions = [mid];
  for (let step = RULES.route.channelStep; positions.length < 9; step += RULES.route.channelStep) {
    let extended = false;
    if (mid - step >= lo) {
      positions.push(mid - step);
      extended = true;
    }
    if (mid + step <= hi) {
      positions.push(mid + step);
      extended = true;
    }
    if (!extended) break;
  }
  return positions;
}

function pickBestRoute(candidates, obstacles, plan) {
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  candidates.forEach((raw) => {
    const points = ensureMinimumLanding(cleanRoute(raw), RULES.route.arrowLanding);
    if (points.length < 2) return;
    if (!routeHonorsPorts(points, plan) || routeHasBacktrack(points)) return;
    const score = routeScore(points, obstacles);
    if (score < bestScore) {
      bestScore = score;
      best = points;
    }
  });
  return best;
}

function routeScore(points, obstacles) {
  let length = 0;
  let hits = 0;
  for (let i = 1; i < points.length; i += 1) {
    length += Math.abs(points[i].x - points[i - 1].x)
      + Math.abs(points[i].y - points[i - 1].y);
    obstacles.forEach((box) => {
      if (segmentHitsBox(points[i - 1], points[i], box)) hits += 1;
    });
  }
  return hits * 10000 + length + (points.length - 2) * 30;
}

function routeHonorsPorts(points, plan) {
  if (!plan || points.length < 2) return true;
  const first = segmentVector(points[0], points[1]);
  const lastOutward = segmentVector(points.at(-1), points.at(-2));
  return vectorsAlign(first, SIDE_VECTOR[plan.exitSide])
    && vectorsAlign(lastOutward, SIDE_VECTOR[plan.enterSide]);
}

function segmentVector(from, to) {
  return { x: Math.sign(to.x - from.x), y: Math.sign(to.y - from.y) };
}

function vectorsAlign(a, b) {
  return a.x === b.x && a.y === b.y;
}

function routeHasBacktrack(points) {
  for (let i = 1; i < points.length - 1; i += 1) {
    const incoming = segmentVector(points[i - 1], points[i]);
    const outgoing = segmentVector(points[i], points[i + 1]);
    if (incoming.x === -outgoing.x && incoming.y === -outgoing.y) return true;
  }
  return false;
}

// Copy the polyline, dropping zero-length segments and collinear midpoints.
function cleanRoute(raw) {
  const points = [];
  raw.forEach((p) => {
    const last = points.at(-1);
    if (last && last.x === p.x && last.y === p.y) return;
    points.push({ x: p.x, y: p.y });
  });
  for (let i = points.length - 2; i > 0; i -= 1) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    const vertical = a.x === b.x && b.x === c.x;
    const horizontal = a.y === b.y && b.y === c.y;
    const between = vertical
      ? b.y >= Math.min(a.y, c.y) && b.y <= Math.max(a.y, c.y)
      : b.x >= Math.min(a.x, c.x) && b.x <= Math.max(a.x, c.x);
    if ((vertical || horizontal) && between) points.splice(i, 1);
  }
  return points;
}

// Axis-aligned segment vs box overlap.
function segmentHitsBox(a, b, box) {
  return Math.min(a.x, b.x) <= box.x + box.width
    && Math.max(a.x, b.x) >= box.x
    && Math.min(a.y, b.y) <= box.y + box.height
    && Math.max(a.y, b.y) >= box.y;
}

function nodeBox(id) {
  const node = elements.moduleLayer.querySelector(`[data-node-id="${id}"]`);
  if (!node) return null;
  const x = node.offsetLeft;
  const y = node.offsetTop;
  return {
    x,
    y,
    width: node.offsetWidth,
    height: node.offsetHeight,
    cx: x + node.offsetWidth / 2,
    cy: y + node.offsetHeight / 2,
  };
}

function renderEdgeHitTarget(edge, pathD, edgeIndex) {
  const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const previewId = edge.relation_ref || edge.id || `${edge.from}->${edge.to}:${edge.label || "flow"}`;
  const pointerPreviewKey = `pointer:edge:${previewId}`;
  const focusPreviewKey = `focus:edge:${previewId}`;
  hit.setAttribute("d", pathD);
  hit.setAttribute("class", "edge-hit");
  hit.dataset.edgeIndex = String(edgeIndex);
  const relationPath = edgeRelationPath(edge);
  if (relationPath.length) hit.dataset.relationPath = relationPath.join(" ");
  hit.setAttribute("tabindex", "0");
  hit.setAttribute("role", "button");
  hit.setAttribute("aria-label", edge.connection.title);
  attachQuestionMenuHandlers(hit, { kind: "edge", edge });
  hit.addEventListener("mouseenter", (event) => showConnection(edge, pointerPreviewKey, event.currentTarget));
  hit.addEventListener("mouseleave", () => hideConnection(false, pointerPreviewKey));
  hit.addEventListener("focus", (event) => showConnection(edge, focusPreviewKey, event.currentTarget));
  hit.addEventListener("blur", () => hideConnection(false, focusPreviewKey));
  const activate = (event) => {
    event.stopPropagation();
    hideCanvasTooltip();
    if (edgeIsSelected(edge)) {
      setSelection(null);
      hideConnection(true);
    } else {
      focusConnection(edge);
    }
  };
  hit.addEventListener("click", activate);
  hit.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate(event);
  });
  return hit;
}

function applyEdgeTone(element, edge) {
  applyFlowFamily(element, edge.flow_family, edge.flow_families);
  if (edge.tone === "conditioning") {
    element.classList.add("is-conditioning");
  }
  if (edge.tone === "skip") {
    element.classList.add("is-skip");
  }
}

function applyFlowFamily(element, family, families = []) {
  if (family && family !== "default") element.classList.add(`flow-family-${family}`);
  if (family) element.dataset.flowFamily = family;
  if (families?.length) element.dataset.flowFamilies = families.join(" ");
}

function showConnection(edge, previewSourceKey = null, anchor = null) {
  if (edgeIsSelected(edge)) {
    hideCanvasTooltip();
    focusConnection(edge);
  } else if (previewSourceKey) {
    showCanvasTooltip(previewSourceKey, {
      title: edge.connection.title,
      html: connectionInspectorHtml(edge, { expanded: false }),
      anchor,
    });
  }
}

function connectionInspectorHtml(edge, { expanded = false } = {}) {
  const contracted = (edge.segments || []).length > 1;
  const hops = contracted
    ? edge.segments.slice(0, -1).map((segment) => nodeLabelById(segment.to)).join(" → ")
    : null;
  return `
    <div class="focus-section">
      <p>${escapeHtml(edge.connection.inside)}</p>
      ${contracted
        ? contractedTooltipHtml(edge, expanded, "Select to keep details")
        : `<dl class="focus-dl">
            <dt>from</dt><dd>${escapeHtml(edge.from)}</dd>
            <dt>to</dt><dd>${escapeHtml(edge.to)}</dd>
            <dt>role</dt><dd>${escapeHtml(edge.connection.role)}</dd>
            ${hops ? `<dt>via</dt><dd>${escapeHtml(hops)}</dd>` : ""}
          </dl>`}
      ${expanded ? renderEdgeReferences(edge) : ""}
    </div>
  `;
}

function renderEdgeReferences(edge) {
  const relations = relationRefsForEdge(edge)
    .map((ref) => relationsById.get(ref) || relationsById.get(untypedRef(ref, "relations")))
    .filter(Boolean);
  const refs = relations.flatMap((relation) => relation.evidence?.refs || []);
  const uniqueRefs = [...new Map(refs.map((ref) => [
    [ref.source_ref, ref.role, ref.locator || ref.lines, ref.note].join("|"),
    ref,
  ])).values()];
  if (!uniqueRefs.length) return "";
  const statuses = [...new Set(relations.map((relation) => relation.evidence?.status).filter(Boolean))];
  return renderReferences({
    evidence: {
      status: statuses.join(" · ") || "unknown",
      refs: uniqueRefs,
    },
  });
}

function nodeLabelById(id) {
  const node = (currentBoard().nodes || []).find((candidate) => candidate.id === id);
  if (!node && refNamespace(id) === "modules") {
    return modulesById.get(untypedRef(id, "modules"))?.label || humanizeRef(id);
  }
  if (!node && refNamespace(id) === "value_sites") {
    const site = valueSitesById.get(untypedRef(id, "value_sites"));
    const repId = untypedRef(site?.representation_ref || site?.representationRef, "representations");
    return site?.label || repsById.get(repId)?.semantic_role || humanizeRef(id);
  }
  if (!node) return id;
  return node.label || modulesById.get(node.module_ref)?.label || node.rep_ref || node.id;
}

function chainChipLabel(id) {
  const node = (currentBoard().nodes || []).find((candidate) => candidate.id === id);
  if (node?.rep_ref) {
    const symbol = repSymbolById.get(node.rep_ref);
    if (symbol?.name) return symbol.name;
  }
  if (node) {
    const operator = operatorSymbolFor(node, node.module_ref ? modulesById.get(node.module_ref) : null);
    if (operator) return operator;
  }
  return nodeLabelById(id);
}

function contractedChainHtml(edge) {
  const ids = [edge.from, ...edge.segments.slice(0, -1).map((segment) => segment.to), edge.to];
  const nodes = new Map((currentBoard().nodes || []).map((node) => [node.id, node]));
  const parts = ids.map((id, index) => {
    const node = nodes.get(id);
    const kind = node?.kind === "representation" ? "rep" : node?.kind === "operation" ? "op" : "module";
    const hidden = index > 0 && index < ids.length - 1;
    const chip = `<span class="chain-chip is-${kind} ${hidden ? "is-hidden-hop" : "is-endpoint"}">${escapeHtml(chainChipLabel(id))}</span>`;
    if (index === 0) return chip;
    const segLabel = edge.segments[index - 1]?.label || "";
    return `
      <span class="chain-arrow" aria-hidden="true">
        <span>↓</span>
        ${segLabel ? `<em>${escapeHtml(segLabel)}</em>` : ""}
      </span>${chip}`;
  });
  return `<div class="connection-chain-canvas">${parts.join("")}</div>`;
}

function contractedTooltipHtml(edge, pinned, hint = "click edge to pin details") {
  const hiddenCount = edge.segments.length - 1;
  const details = edge.segments
    .map(
      (segment) => `
        <li>
          <strong>${escapeHtml(nodeLabelById(segment.from))} → ${escapeHtml(nodeLabelById(segment.to))}</strong>
          <p>${escapeHtml(segment.connection?.inside || "")}</p>
        </li>
      `,
    )
    .join("");
  const standardBlocks = pinned ? hiddenChainStandardBlocks(edge) : [];
  return `
    <span>${hiddenCount} hidden step${hiddenCount === 1 ? "" : "s"} on this path</span>
    ${contractedChainHtml(edge)}
    ${pinned
      ? `<ol class="connection-chain">${details}</ol>`
      : `<p class="chain-hint">${escapeHtml(hint)}</p>`}
    ${standardBlocks.length ? renderInlineStandardBlocks(standardBlocks) : ""}
  `;
}

function hiddenChainStandardBlocks(edge) {
  const boardNodes = new Map((currentBoard().nodes || []).map((node) => [node.id, node]));
  const hiddenNodeIds = new Set(
    (edge.segments || [])
      .flatMap((segment) => [segment.from, segment.to])
      .filter((id) => id !== edge.from && id !== edge.to),
  );
  const blocks = [];
  for (const id of hiddenNodeIds) {
    const node = boardNodes.get(id);
    const module = node?.module_ref ? modulesById.get(node.module_ref) : null;
    for (const ref of standardBlockRefsForModule(module)) {
      const block = standardBlockFromRef(ref);
      if (block && !blocks.some((existing) => existing.id === block.id)) {
        blocks.push(block);
      }
    }
  }
  return blocks;
}

function standardBlockRefsForModule(module) {
  if (!module) return [];
  return [
    module.standard_block_ref,
    module.attention?.standard_block_ref,
    ...(module.contains || []).map((child) => child.standard_block_ref),
  ].filter(Boolean);
}

function renderInlineStandardBlocks(blocks) {
  return `
    <div class="connection-standard-blocks">
      ${blocks.map(renderStandardBlock).join("")}
    </div>
  `;
}

function hideConnection(force = false, previewSourceKey = null) {
  if (force) {
    hideCanvasTooltip();
    if (!state.selection) focusOverview();
  } else {
    hideCanvasTooltip(previewSourceKey);
  }
}

function focusConnection(edge) {
  setSelection({ kind: "edge", edge });
  clearActiveNodes();
  const edgeIndex = (state.displayEdges || []).indexOf(edge);
  if (edgeIndex >= 0) {
    elements.edgeLayer.querySelectorAll(`[data-edge-index="${edgeIndex}"]`).forEach((element) => {
      element.classList.add("is-selected");
    });
  }
  elements.moduleLayer.querySelector(`[data-node-id="${edge.to}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = edge.connection.title;
  setFocusBody(connectionInspectorHtml(edge, { expanded: true }), { selected: true });
}

function focusOverview() {
  setSelection(null);
  clearActiveNodes();
  const board = currentBoard();
  elements.focusTitle.textContent = board.title;
  const summary = String(board.summary || "").trim();
  const notes = (board.notes || []).map((note) => String(note).trim()).filter(Boolean);
  setFocusBody(`
    <div class="focus-section focus-takeaway">
      <p>${escapeHtml(summary || "Explore the board to see how information moves through this level.")}</p>
      ${notes.length
        ? `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`
        : ""}
      <p class="focus-guidance">Select a block or connection to inspect it. Use a block's magnifying-glass button to move deeper.</p>
    </div>
  `);
}

function visibleNodes(board) {
  return (board.nodes || []).filter(
    (node) => !node.elide && node.prominence !== "hidden" && node.treatment !== "hidden",
  );
}

function focusNodeOccurrence(nodeId) {
  if (!nodeId) return false;
  const node = visibleNodes(currentBoard()).find((candidate) => candidate.id === nodeId);
  if (!node) return false;
  if (node.kind === "representation") {
    focusRepresentation(node, node.rep_ref ? repsById.get(node.rep_ref) : null);
    return true;
  }
  const module = node.module_ref ? modulesById.get(node.module_ref) : null;
  if (module) {
    focusModule(module, node);
  } else {
    focusOperation(node);
  }
  return true;
}

function resetFocusedDetail() {
  focusOverview();
}

function focusModule(module, node) {
  setSelection(node ? { kind: "node", node } : null);
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-module-id="${module.id}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = module.label;

  const blockHtml = renderStandardBlocks(module);
  setFocusBody(`
    <div class="focus-section">
      <p>${escapeHtml(module.role)}</p>
      ${renderAttentionSummary(module)}
      ${module.accepts_but_does_not_use ? renderUnusedInputs(module.accepts_but_does_not_use) : ""}
      ${renderContains(module.contains || [])}
      ${blockHtml}
      ${renderReferences(module)}
      ${renderFocusLinks(module)}
    </div>
  `, { selected: true });
}

function focusOperation(node) {
  setSelection({ kind: "node", node });
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = node.label || node.id;
  setFocusBody(`
    <div class="focus-section">
      <p>${escapeHtml(node.role || "")}</p>
      <dl class="focus-dl">
        <dt>scale</dt><dd>${escapeHtml(node.scale || "operation")}</dd>
        <dt>node</dt><dd>${escapeHtml(node.id)}</dd>
        ${node.template_fact_ref ? `<dt>template fact</dt><dd><code>${escapeHtml(node.template_fact_ref)}</code></dd>` : ""}
        ${node.block_instance_ref ? `<dt>instance</dt><dd><code>${escapeHtml(node.block_instance_ref)}</code></dd>` : ""}
      </dl>
      ${node.code ? `<h3>Reusable trace</h3><pre class="standard-block-code"><code>${escapeHtml(node.code)}</code></pre>` : ""}
      ${node.tex ? `<div class="math-line">\\(${escapeHtml(node.tex)}\\)</div>` : ""}
    </div>
  `, { selected: true });
}

function clearActiveNodes() {
  elements.moduleLayer.querySelectorAll(".arch-node, .arch-rep").forEach((node) => {
    node.classList.remove("is-focused");
  });
  elements.edgeLayer.querySelectorAll("[data-edge-index]").forEach((edge) => {
    edge.classList.remove("is-selected");
  });
}

function renderContains(children) {
  if (!children.length) return "";
  return `
    <h3>Internals</h3>
    <div class="internal-stack">
      ${children
        .map(
          (child) => `
            <div class="internal-unit" data-child-id="${escapeHtml(child.id)}">
              <strong>${escapeHtml(child.label)}</strong>
              <span>${child.standard_block_ref ? "standard block" : "pseudocode trace"}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAttentionSummary(module) {
  if (!module.attention) return "";
  const attention = module.attention;
  const window = attention.window ? `${attention.window.kind}, ${attention.window.size ?? "?"}` : "none";
  return `
    <h3>Attention</h3>
    <dl class="focus-dl">
      <dt>pattern</dt><dd>${escapeHtml(attention.pattern)}</dd>
      <dt>query</dt><dd>${escapeHtml(attention.query_scale)}</dd>
      <dt>key/value</dt><dd>${escapeHtml(attention.key_value_scale)}</dd>
      <dt>window</dt><dd>${escapeHtml(window)}</dd>
      <dt>pair bias</dt><dd>${escapeHtml(String(attention.pair_bias))} (${escapeHtml(attention.pair_bias_source ?? "unknown")})</dd>
      <dt>position</dt><dd>${escapeHtml(attention.positional_encoding?.kind ?? "unknown")}</dd>
    </dl>
  `;
}

function renderUnusedInputs(inputs) {
  return `
    <div class="warning-note">
      <strong>Accepted but not used here</strong>
      <span>${escapeHtml(inputs.join(", "))}</span>
    </div>
  `;
}

function renderStandardBlocks(module) {
  const instances = blockInstancesBySubject.get(`modules.${module.id}`) || [];
  const refs = standardBlockRefsForModule(module);
  const blocks = refs
    .map((ref) => standardBlockFromRef(ref))
    .filter(Boolean)
    .filter((block, index, all) => all.findIndex((candidate) => candidate.id === block.id) === index);
  if (!blocks.length && !instances.length) return "";
  return [
    ...instances.map(renderBlockInstance),
    ...blocks.map((block) => renderStandardBlock(block)),
  ].join("");
}

function standardBlockFromRef(ref) {
  return standardBlocksById.get(ref) || Object.values(manifest.standardBlocks).find(
    (block) => block.sourceYaml === ref || block.id === ref,
  );
}

function renderStandardBlock(block) {
  return `
    <h3>${escapeHtml(block.name)}</h3>
    <ol class="math-list">
      ${(block.math || []).map(renderMathStep).join("")}
    </ol>
  `;
}

function readableReuse(value) {
  return String(value || "").replaceAll("_", " ");
}

function renderBlockInstance(instance) {
  const block = standardBlocksById.get(instance.standardBlockId);
  return `
    <section class="standard-block-instance">
      <h3>${escapeHtml(block?.name || instance.standardBlockName || instance.standardBlockId)}</h3>
      <div class="standard-block-instance-meta">
        <span>${escapeHtml(instance.variantLabel || readableReuse(instance.variant))}</span>
        <span>${escapeHtml(readableReuse(instance.conformance))}</span>
        <span>${escapeHtml(readableReuse(instance.useScope))}</span>
      </div>
      <p>${escapeHtml(instance.variantDescription || block?.description || "")}</p>
      ${instance.differenceSummary
        ? `<div class="warning-note"><strong>Architecture-specific difference</strong><span>${escapeHtml(instance.differenceSummary)}</span></div>`
        : ""}
      ${renderReferences(instance)}
    </section>
  `;
}

function bibliographySource(sourceRef) {
  return collectionValues(manifest.bibliography?.sources)
    .find((source) => source.id === sourceRef);
}

function citationByline(source) {
  const authors = Array(source?.authors).join(", ");
  return [authors, source?.organization, source?.year].filter(Boolean).join(" · ");
}

function renderCitation(ref) {
  const source = bibliographySource(ref.source_ref);
  const title = source?.title || ref.path || ref.source_ref || "Unresolved source";
  const href = audienceHref(source?.href || source?.url || ref.path);
  const byline = citationByline(source);
  const locator = ref.locator || ref.lines;
  const role = String(ref.role || "supporting_evidence").replaceAll("_", " ");
  const kind = source?.kind || ref.kind || "source";
  const titleMarkup = href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a>`
    : `<strong>${escapeHtml(title)}</strong>`;
  return `
    <article class="citation-entry">
      <span class="citation-role">${escapeHtml(role)} · ${escapeHtml(kind)}</span>
      ${titleMarkup}
      ${byline ? `<cite>${escapeHtml(byline)}</cite>` : ""}
      ${locator ? `<span class="citation-locator">${escapeHtml(locator)}</span>` : ""}
      ${ref.note ? `<p>${escapeHtml(ref.note)}</p>` : ""}
    </article>
  `;
}

function renderReferences(entity) {
  const refs = entity.evidence?.refs || [];
  if (!refs.length) return "";
  return `
    <h3>References</h3>
    <div class="evidence-list">
      <span class="evidence-badge">${escapeHtml(String(entity.evidence.status || "unknown").replaceAll("_", " "))}</span>
      <div class="citation-list">${refs.map(renderCitation).join("")}</div>
    </div>
  `;
}

function renderFocusLinks(module) {
  const links = [
    [module.story_ref, "Open curated story"],
    [module.pseudocode_ref, "Open pseudocode"],
    [module.attention?.standard_block_ref, "Open standard block reference"],
  ].map(([rawHref, label]) => {
    const href = audienceHref(rawHref);
    return href ? `<a href="${escapeHtml(href)}">${label}</a>` : "";
  }).filter(Boolean);
  if (!links.length) return "";
  return `<div class="focus-links">${links.join("")}</div>`;
}

function scheduleGeometryUpdate({ measureGrid = false, renderEdges: edges = false, fit = false } = {}) {
  pendingGeometry.measureGrid ||= measureGrid;
  pendingGeometry.renderEdges ||= edges;
  pendingGeometry.fit ||= fit;
  if (geometryFrame !== null) return;
  geometryFrame = window.requestAnimationFrame(flushGeometryUpdate);
}

function flushGeometryUpdate() {
  geometryFrame = null;
  const request = { ...pendingGeometry };
  pendingGeometry.measureGrid = false;
  pendingGeometry.renderEdges = false;
  pendingGeometry.fit = false;

  if (state.modelMapDirty && !state.modelMapCollapsed && modelMap?.offsetParent !== null) {
    renderModelMap();
  }

  if (request.measureGrid && !useElkLayout) {
    const board = currentBoard();
    const graph = displayGraph(board);
    state.displayEdges = graph.edges;
    applyGridColumnSizing(board, graph);
  }
  if (request.renderEdges) renderEdges();
  if (request.fit && !state.isTransitioning && !state.userMovedViewport) fitToContent();
}

function ensurePanZoom() {
  if (!elements.canvasControls.dataset.ready) {
    elements.canvasControls.dataset.ready = "true";
    elements.canvasControls.addEventListener("click", onCanvasControlClick);
  }

  if (elements.canvas.dataset.panZoomReady) return;
  elements.canvas.dataset.panZoomReady = "true";
  elements.canvas.addEventListener("wheel", onCanvasWheel, { passive: false });
  elements.canvas.addEventListener("pointerdown", onCanvasPointerDown);
  elements.canvas.addEventListener("pointermove", onCanvasPointerMove);
  elements.canvas.addEventListener("pointerup", endPan);
  elements.canvas.addEventListener("pointercancel", endPan);
  elements.canvas.addEventListener("click", onCanvasClickCapture, true);
}

function onCanvasControlClick(event) {
  const action = event.target.closest("button")?.dataset.zoom;
  if (!action) return;
  if (action === "reset") {
    state.userMovedViewport = true;
    resetViewport();
    return;
  }
  if (action === "fit") {
    state.userMovedViewport = false;
    fitToContent({ readable: false });
    return;
  }
  state.userMovedViewport = true;
  zoomAtCanvasCenter(action === "in" ? 1.18 : 1 / 1.18);
}

function onCanvasWheel(event) {
  if (event.target.closest(".board-chrome")) return;
  const delta = normalizedWheelDelta(event);
  event.preventDefault();
  if (Math.abs(delta) < 0.01) return;
  closeQuestionMenu({ restoreFocus: true });
  hideCanvasTooltip();
  state.userMovedViewport = true;
  const factor = Math.exp(-delta * RULES.gesture.wheelZoomSensitivity);
  zoomAt(event.clientX, event.clientY, factor);
}

function normalizedWheelDelta(event) {
  let unit = 1;
  if (event.deltaMode === 1) unit = RULES.gesture.wheelLinePixels;
  if (event.deltaMode === 2) unit = Math.max(elements.canvas.clientHeight, 1);
  return clamp(
    event.deltaY * unit,
    -RULES.gesture.maxWheelDelta,
    RULES.gesture.maxWheelDelta,
  );
}

function onCanvasPointerDown(event) {
  if (event.pointerType === "touch") {
    if (event.target.closest(".board-chrome")) return;
    canvasTouchPointers.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });
    if (canvasTouchPointers.size === 2) {
      event.preventDefault();
      beginCanvasPinch(event);
      return;
    }
    if (canvasTouchPointers.size > 2) return;
    if (event.target.closest(".arch-node, .arch-rep, .edge-hit")) return;
    beginCanvasPan(event);
    return;
  }
  if (event.button !== 0 && event.button !== 1) return;
  if (event.target.closest(".arch-node, .arch-rep, .edge-hit, .board-chrome")) return;
  beginCanvasPan(event);
}

function beginCanvasPan(event) {
  if (state.selection) focusOverview();
  hideCanvasTooltip();
  viewport.isPanning = true;
  viewport.pointerId = event.pointerId;
  state.userMovedViewport = true;
  viewport.startClientX = event.clientX;
  viewport.startClientY = event.clientY;
  viewport.startX = viewport.x;
  viewport.startY = viewport.y;
  elements.canvas.classList.add("is-panning");
  captureCanvasPointer(event.pointerId);
}

function canvasPoint(pointer) {
  const rect = elements.canvas.getBoundingClientRect();
  return {
    x: pointer.clientX - rect.left,
    y: pointer.clientY - rect.top,
  };
}

function captureCanvasPointer(pointerId) {
  try {
    elements.canvas.setPointerCapture(pointerId);
  } catch (_error) {
    // Pointer capture is an optimization; bubbling events remain sufficient.
  }
}

function releaseCanvasPointer(pointerId) {
  try {
    if (elements.canvas.hasPointerCapture(pointerId)) {
      elements.canvas.releasePointerCapture(pointerId);
    }
  } catch (_error) {
    // The browser may implicitly release a touch before pointerup is handled.
  }
}

function beginCanvasPinch(event) {
  const entries = Array.from(canvasTouchPointers.entries()).slice(0, 2);
  if (entries.length < 2) return;
  if (state.selection) focusOverview();
  closeQuestionMenu({ restoreFocus: true });
  hideCanvasTooltip();
  viewport.isPanning = false;
  viewport.pointerId = null;
  canvasPinch = {
    pointerIds: entries.map(([pointerId]) => pointerId),
    viewport: { ...viewport },
    points: entries.map(([, pointer]) => canvasPoint(pointer)),
  };
  suppressCanvasClicksUntil = Number.POSITIVE_INFINITY;
  state.userMovedViewport = true;
  elements.canvas.classList.add("is-panning");
  canvasPinch.pointerIds.forEach(captureCanvasPointer);
}

function onCanvasPointerMove(event) {
  if (event.pointerType === "touch" && canvasTouchPointers.has(event.pointerId)) {
    canvasTouchPointers.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });
    if (canvasPinch) {
      const currentPoints = canvasPinch.pointerIds.map(
        (pointerId) => canvasTouchPointers.get(pointerId),
      );
      if (currentPoints.every(Boolean)) {
        event.preventDefault();
        const next = pinchViewportBetween(
          canvasPinch.viewport,
          canvasPinch.points,
          currentPoints.map(canvasPoint),
          {
            x: elements.moduleLayer.offsetLeft,
            y: elements.moduleLayer.offsetTop,
          },
        );
        viewport.x = next.x;
        viewport.y = next.y;
        viewport.scale = next.scale;
        applyViewport();
      }
      return;
    }
  }
  if (!viewport.isPanning) return;
  if (event.pointerId != null && event.pointerId !== viewport.pointerId) return;
  event.preventDefault();
  viewport.x = viewport.startX + event.clientX - viewport.startClientX;
  viewport.y = viewport.startY + event.clientY - viewport.startClientY;
  applyViewport();
}

function endPan(event) {
  if (event?.pointerType === "touch" || canvasTouchPointers.has(event?.pointerId)) {
    canvasTouchPointers.delete(event.pointerId);
    releaseCanvasPointer(event.pointerId);
    if (canvasPinch) {
      suppressCanvasClicksUntil = Date.now() + 450;
      if (canvasTouchPointers.size >= 2) {
        beginCanvasPinch(event);
        return;
      }
      canvasPinch = null;
      if (canvasTouchPointers.size === 1) {
        const [pointerId, pointer] = canvasTouchPointers.entries().next().value;
        viewport.isPanning = true;
        viewport.pointerId = pointerId;
        viewport.startClientX = pointer.clientX;
        viewport.startClientY = pointer.clientY;
        viewport.startX = viewport.x;
        viewport.startY = viewport.y;
        return;
      }
    }
    if (!viewport.isPanning || viewport.pointerId !== event.pointerId) return;
  }
  if (!viewport.isPanning) return;
  viewport.isPanning = false;
  viewport.pointerId = null;
  elements.canvas.classList.remove("is-panning");
  if (event?.pointerId != null) releaseCanvasPointer(event.pointerId);
}

function onCanvasClickCapture(event) {
  if (Date.now() >= suppressCanvasClicksUntil) return;
  if (event.target.closest(".board-chrome")) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function zoomAtCanvasCenter(factor) {
  const rect = elements.canvas.getBoundingClientRect();
  const baseX = elements.moduleLayer.offsetLeft;
  const baseY = elements.moduleLayer.offsetTop;
  const center = boardViewportCenter(rect, baseX, baseY);
  zoomAt(rect.left + center.x, rect.top + center.y, factor);
}

function zoomAt(clientX, clientY, factor) {
  const canvasRect = elements.canvas.getBoundingClientRect();
  const baseX = elements.moduleLayer.offsetLeft;
  const baseY = elements.moduleLayer.offsetTop;
  const px = clientX - canvasRect.left;
  const py = clientY - canvasRect.top;
  const nextScale = clamp(viewport.scale * factor, viewport.minScale, viewport.maxScale);
  const localX = (px - baseX - viewport.x) / viewport.scale;
  const localY = (py - baseY - viewport.y) / viewport.scale;
  viewport.x = px - baseX - localX * nextScale;
  viewport.y = py - baseY - localY * nextScale;
  viewport.scale = nextScale;
  applyViewport();
}

function resetViewport() {
  viewport.x = 0;
  viewport.y = 0;
  viewport.scale = 1;
  applyViewport();
}

function applyViewport({ immediate = false } = {}) {
  if (immediate) {
    if (viewportFrame !== null) window.cancelAnimationFrame(viewportFrame);
    viewportFrame = null;
    flushViewport();
    return;
  }
  if (viewportFrame !== null) return;
  viewportFrame = window.requestAnimationFrame(flushViewport);
}

function flushViewport() {
  viewportFrame = null;
  const transform = `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`;
  if (transform !== renderedViewportTransform) {
    elements.regionLayer.style.transform = transform;
    elements.representationLaneLayer.style.transform = transform;
    elements.moduleLayer.style.transform = transform;
    elements.edgeLayer.style.transform = transform;
    renderedViewportTransform = transform;
  }
  const zoomPercent = Math.round(viewport.scale * 100);
  if (elements.canvasZoomValue && zoomPercent !== renderedZoomPercent) {
    elements.canvasZoomValue.textContent = `${zoomPercent}%`;
    renderedZoomPercent = zoomPercent;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function refreshResponsiveGeometry() {
  hideCanvasTooltip();
  scheduleGeometryUpdate({
    measureGrid: !state.userMovedViewport && !useElkLayout,
    renderEdges: true,
    fit: !state.isTransitioning && !state.userMovedViewport,
  });
}

window.addEventListener("resize", refreshResponsiveGeometry);
if (typeof ResizeObserver === "function") {
  let observedCanvasSize = null;
  new ResizeObserver(([entry]) => {
    const size = entry?.contentRect;
    if (!size) return;
    const next = `${Math.round(size.width)}x${Math.round(size.height)}`;
    if (next === observedCanvasSize) return;
    observedCanvasSize = next;
    refreshResponsiveGeometry();
  }).observe(elements.canvas);
}
elements.referenceFigureClose.addEventListener("click", closeReferenceFigure);
elements.referenceFigureControls.addEventListener("click", onReferenceFigureControl);
elements.referenceFigureViewport.addEventListener("wheel", onReferenceFigureWheel, { passive: false });
elements.referenceFigureViewport.addEventListener("pointerdown", beginReferenceFigurePan);
elements.referenceFigureViewport.addEventListener("pointermove", moveReferenceFigurePan);
elements.referenceFigureViewport.addEventListener("pointerup", endReferenceFigurePan);
elements.referenceFigureViewport.addEventListener("pointercancel", endReferenceFigurePan);
elements.referenceFigureDialog.addEventListener("click", (event) => {
  if (event.target === elements.referenceFigureDialog) closeReferenceFigure();
});
elements.referenceFigureDialog.addEventListener("close", () => {
  referenceFigurePan = null;
  elements.referenceFigureViewport.classList.remove("is-panning");
  resetReferenceFigureZoom();
});
render();
window.__architectureRendererBoot?.ready?.();
