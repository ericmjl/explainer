import { manifestIndex } from "./manifest-index.js";

const pageParams = new URLSearchParams(window.location.search);
const archParam = pageParams.get("arch");
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
const manifest = normalizeManifestForRenderer(sourceManifest);

function collectionValues(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

function untypedRef(ref, namespace = null) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  if (separator < 0) return value;
  if (namespace && value.slice(0, separator) !== namespace) return value;
  return value.slice(separator + 1);
}

function refNamespace(ref) {
  const value = String(ref || "");
  const separator = value.indexOf(".");
  return separator < 0 ? null : value.slice(0, separator);
}

function humanizeRef(ref) {
  return untypedRef(ref).replaceAll("_", " ");
}

function relationRefsForEdge(edge) {
  const path = edge.relation_path || edge.relationPath;
  if (Array.isArray(path) && path.length) return path;
  const hops = edge.provenance_hops || edge.provenanceHops;
  if (Array.isArray(hops)) {
    const refs = hops.map((hop) => hop?.relation_ref || hop?.relationRef).filter(Boolean);
    if (refs.length) return refs;
  }
  const direct = edge.relation_ref || edge.relationRef;
  return direct ? [direct] : [];
}

function normalizeConnection(edge, presentation, relationRefs) {
  const connection = edge.connection || presentation.connection || {};
  const flowName = edge.label || presentation.label || humanizeRef(relationRefs.at(-1) || edge.id || "flow");
  return {
    title: connection.title || presentation.title || flowName,
    role: connection.role || presentation.role || humanizeRef(edge.kind || "information flow"),
    inside: connection.inside || presentation.inside ||
      `${humanizeRef(edge.from)} flows into ${humanizeRef(edge.to)}.`,
  };
}

function normalizeProjectedSegments(edge, relationRefs, relationsById, localIdsByRef) {
  if (Array.isArray(edge.segments) && edge.segments.length) {
    return edge.segments.map((segment) => {
      const relationRef = segment.relation_ref || segment.relationRef;
      const relation = relationsById.get(relationRef) || relationsById.get(untypedRef(relationRef));
      const presentation = segment.presentation || {};
      const normalized = { ...presentation, ...segment, relation_ref: relationRef };
      normalized.connection = normalizeConnection(
        normalized,
        presentation,
        relationRef ? [relationRef] : [],
      );
      normalized.label ||= relation?.label || relation?.summary || relation?.operation;
      normalized.tone ||= relation?.kind === "conditioning" ? "conditioning" : undefined;
      return normalized;
    });
  }
  const isProjectedEdge = edge.projection || edge.origin || edge.presentation ||
    edge.relation_path || edge.relationPath || edge.provenance_hops || edge.provenanceHops;
  if (!isProjectedEdge) return null;
  if (!relationRefs.length) return null;

  const localId = (ref, fallback) => {
    const ids = localIdsByRef.get(ref) || localIdsByRef.get(untypedRef(ref));
    return ids?.length === 1 ? ids[0] : fallback;
  };
  return relationRefs.map((relationRef, index) => {
    const relation = relationsById.get(relationRef) || relationsById.get(untypedRef(relationRef));
    const fromRef = relation?.from || relation?.source;
    const toRef = relation?.to || relation?.target;
    const from = index === 0 ? edge.from : localId(fromRef, fromRef || `${edge.id || "flow"}:hop-${index}`);
    const to = index === relationRefs.length - 1
      ? edge.to
      : localId(toRef, toRef || `${edge.id || "flow"}:hop-${index + 1}`);
    const relationLabel = relation?.summary || relation?.operation || humanizeRef(relationRef);
    return {
      from,
      to,
      relation_ref: relationRef,
      label: relation?.label || relationLabel,
      tone: relation?.kind === "conditioning" ? "conditioning" : undefined,
      connection: {
        title: relation?.summary || relationLabel,
        role: humanizeRef(relation?.kind || relation?.operation || "information flow"),
        inside: relation?.summary || `${humanizeRef(fromRef || from)} flows into ${humanizeRef(toRef || to)}.`,
      },
    };
  });
}

function normalizeBoardNode(node, valueSitesById) {
  const presentation = node.presentation || {};
  const ref = node.ref || node.canonical_ref || node.canonicalRef;
  const namespace = refNamespace(ref);
  const normalized = { ...presentation, ...node };

  if (namespace === "modules") {
    normalized.kind ||= "module";
    normalized.module_ref ||= untypedRef(ref, "modules");
  } else if (namespace === "value_sites") {
    const siteId = untypedRef(ref, "value_sites");
    const site = valueSitesById.get(siteId) || {};
    const representationRef = site.representation_ref || site.representationRef || site.rep_ref;
    normalized.kind ||= "representation";
    normalized.value_site_ref ||= siteId;
    normalized.rep_ref ||= untypedRef(representationRef, "representations");
    normalized.label ||= site.display_label || site.label || humanizeRef(node.id);
    normalized.role ||= site.role || site.semantic_role;
    normalized.shape ||= site.shape;
    normalized.scale ||= site.scale;
  } else if (namespace === "representations") {
    // Kept for tolerant reading of early projector fixtures. Visualization
    // v0.4 normally binds tensor occurrences through value_sites.* instead.
    normalized.kind ||= "representation";
    normalized.rep_ref ||= untypedRef(ref, "representations");
  }

  if (normalized.moduleRef && !normalized.module_ref) normalized.module_ref = normalized.moduleRef;
  if (normalized.repRef && !normalized.rep_ref) normalized.rep_ref = normalized.repRef;
  if (normalized.boardRef && !normalized.board_ref) normalized.board_ref = normalized.boardRef;
  if (normalized.valueSiteRef && !normalized.value_site_ref) {
    normalized.value_site_ref = untypedRef(normalized.valueSiteRef, "value_sites");
  }
  return normalized;
}

function normalizeBoardEdge(edge, relationsById, localIdsByRef) {
  const presentation = edge.presentation || {};
  const relationRefs = relationRefsForEdge(edge);
  const normalized = {
    ...presentation,
    ...edge,
    label: edge.label ?? presentation.label,
    tone: edge.tone ?? presentation.tone ?? (edge.kind === "conditioning" ? "conditioning" : undefined),
    route_side: edge.route_side ?? edge.routeSide ?? presentation.route_side ?? presentation.routeSide,
    route_clearance: edge.route_clearance ?? edge.routeClearance ??
      presentation.route_clearance ?? presentation.routeClearance,
  };
  normalized.relation_ref ||= relationRefs.length === 1 ? relationRefs[0] : undefined;
  if (relationRefs.length) normalized.relation_path ||= relationRefs;
  normalized.connection = normalizeConnection(normalized, presentation, relationRefs);
  normalized.segments = normalizeProjectedSegments(normalized, relationRefs, relationsById, localIdsByRef);
  return normalized;
}

function normalizeBoard(board, architecture) {
  const projectedGraph = board.projected_graph || board.projectedGraph || board.graph;
  const graph = projectedGraph && typeof projectedGraph === "object" ? projectedGraph : board;
  const valueSites = collectionValues(architecture.valueSites || architecture.value_sites);
  const valueSitesById = new Map(valueSites.map((site) => [site.id, site]));
  const nodes = collectionValues(graph.nodes).map((node) => normalizeBoardNode(node, valueSitesById));
  const localIdsByRef = new Map();
  for (const node of nodes) {
    const refs = [node.ref, node.canonical_ref, node.canonicalRef, node.module_ref, node.rep_ref]
      .filter(Boolean);
    for (const ref of refs) {
      for (const key of [ref, untypedRef(ref)]) {
        const ids = localIdsByRef.get(key) || [];
        ids.push(node.id);
        localIdsByRef.set(key, ids);
      }
    }
  }
  const relations = collectionValues(architecture.relations);
  const relationsById = new Map();
  for (const relation of relations) {
    relationsById.set(relation.id, relation);
    relationsById.set(untypedRef(relation.id, "relations"), relation);
    relationsById.set(`relations.${relation.id}`, relation);
  }
  const edges = collectionValues(graph.edges).map((edge) =>
    normalizeBoardEdge(edge, relationsById, localIdsByRef));
  return { ...graph, ...board, nodes, edges };
}

function normalizeManifestForRenderer(source) {
  const sourceArchitecture = source.architecture || {};
  const architecture = {
    ...sourceArchitecture,
    sourceYaml: sourceArchitecture.sourceYaml || sourceArchitecture.source_yaml,
    modules: collectionValues(sourceArchitecture.modules),
    representations: collectionValues(sourceArchitecture.representations),
    valueSites: collectionValues(sourceArchitecture.valueSites || sourceArchitecture.value_sites),
    relations: collectionValues(sourceArchitecture.relations),
    stateSemantics: sourceArchitecture.stateSemantics || sourceArchitecture.state_semantics || {},
    stateSemanticsBySite: sourceArchitecture.stateSemanticsBySite ||
      sourceArchitecture.state_semantics_by_site || {},
    valueSiteInterfaces: sourceArchitecture.valueSiteInterfaces ||
      sourceArchitecture.value_site_interfaces || {},
    scaleTransitions: collectionValues(
      sourceArchitecture.scaleTransitions || sourceArchitecture.scale_transitions,
    ),
    trainingInference: sourceArchitecture.trainingInference ||
      sourceArchitecture.training_inference || {},
    claims: collectionValues(sourceArchitecture.claims),
  };
  const sourceBoards = source.boards || {};
  const boardItems = collectionValues(
    sourceBoards.items || sourceBoards.projected || source.projectedBoards || source.projected_boards,
  ).map((board) => normalizeBoard(board, architecture));
  return {
    ...source,
    architecture,
    boards: {
      ...sourceBoards,
      rootBoard: sourceBoards.rootBoard || sourceBoards.root_board,
      items: boardItems,
    },
  };
}

const elements = {
  canvas: document.querySelector(".architecture-canvas"),
  moduleLayer: document.getElementById("moduleLayer"),
  edgeLayer: document.getElementById("edgeLayer"),
  focusPanel: document.querySelector(".focus-panel"),
  focusHeader: document.getElementById("focusHeader"),
  focusEyebrow: document.getElementById("focusEyebrow"),
  focusTitle: document.getElementById("focusTitle"),
  focusReset: document.getElementById("focusReset"),
  focusBody: document.getElementById("focusBody"),
  focusPreviewHeader: document.getElementById("focusPreviewHeader"),
  focusPreviewTitle: document.getElementById("focusPreviewTitle"),
  focusPreviewBody: document.getElementById("focusPreviewBody"),
  scaleLaneLayer: document.getElementById("scaleLaneLayer"),
};

const modulesById = new Map(manifest.architecture.modules.map((module) => [module.id, module]));
const repsById = new Map(manifest.architecture.representations.map((rep) => [rep.id, rep]));
const valueSitesById = new Map((manifest.architecture.valueSites || []).map((site) => [site.id, site]));
const valueSiteInterfacesById = new Map(
  Object.entries(manifest.architecture.valueSiteInterfaces || {}),
);
const relationsById = new Map(
  (manifest.architecture.relations || []).flatMap((relation) => [
    [relation.id, relation],
    [untypedRef(relation.id, "relations"), relation],
    [`relations.${untypedRef(relation.id, "relations")}`, relation],
  ]),
);
const boardsById = new Map(manifest.boards.items.map((board) => [board.id, board]));
const conditioningByPair = new Map(
  (manifest.architecture.conditioning || []).map((cond) => [
    `${cond.source}->${String(cond.target || "").split(".")[0]}`,
    cond,
  ]),
);
const conditioningByRelation = new Map(
  (manifest.architecture.conditioning || []).flatMap((cond) => {
    const ref = cond.relation_ref || cond.relationRef;
    if (!ref) return [];
    const bare = untypedRef(ref, "relations");
    return [[ref, cond], [bare, cond], [`relations.${bare}`, cond]];
  }),
);

let boardActions = null;
let canvasContextRail = null;
let semanticLocation = null;
let semanticLocationStatus = null;
let canvasControls = null;
let canvasZoomValue = null;
let modelMap = null;
let modelMapSvg = null;
let modelMapA11y = null;
let modelMapContext = null;
let modelMapViewToggle = null;
let edgeLabelMeasureContext = null;
const inspectorPreviews = new Map();
let inspectorPreviewSequence = 0;

const state = {
  focusedId: null,
  focusHasMath: false,
  boardStack: [manifest.boards.rootBoard],
  boardOrigins: [null],
  pinnedEdge: null,
  edgeRoutes: new Map(),
  modelMapView: "root",
};

const viewport = {
  x: 0,
  y: 0,
  scale: 1,
  minScale: 0.48,
  maxScale: 2.2,
  isPanning: false,
  startClientX: 0,
  startClientY: 0,
  startX: 0,
  startY: 0,
};

function render() {
  renderPageChrome();
  ensureBoardChrome();
  elements.focusReset.addEventListener("click", resetFocusedDetail);
  renderBoard();
  focusOverview();
}

function renderPageChrome() {
  document.title = `${manifest.architecture.name} — Architecture Renderer`;
  const title = document.getElementById("archTitle");
  if (title) title.textContent = manifest.architecture.name;
  const eyebrow = document.getElementById("rendererEyebrow");
  if (eyebrow) eyebrow.textContent = "Interactive architecture";
  const intro = document.getElementById("rendererIntro");
  if (intro) {
    intro.textContent =
      "Open a part of the system to move from the overview into its internal mechanism. " +
      "The location guide keeps each level connected to the whole.";
  }
  const focusEyebrow = document.getElementById("focusEyebrow");
  if (focusEyebrow) focusEyebrow.textContent = "Current takeaway";
  const sourceLink = document.getElementById("archSourceLink");
  if (sourceLink) sourceLink.href = manifest.architecture.sourceYaml;
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
      window.location.search = params.toString();
    });
  }
}

window.addEventListener("mathjax-ready", () => {
  typesetMath();
  renderBoard();
});

window.addEventListener("elk-ready", () => {
  if (useElkLayout) renderBoard();
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
  clearInspectorPreviews();
  elements.focusEyebrow.textContent = selected ? "Selected detail" : "Current takeaway";
  elements.focusReset.hidden = !selected;
  elements.focusPanel.classList.toggle("is-selected", selected);
  elements.focusBody.innerHTML = html;
  state.focusHasMath = html.includes("math-step");
  typesetMath();
  renderModelMap();
}

function beginInspectorPreview(sourceKey, { title, html }) {
  const key = sourceKey || "transient-preview";
  inspectorPreviews.set(key, {
    title,
    html,
    sequence: ++inspectorPreviewSequence,
  });
  renderLatestInspectorPreview();
}

function endInspectorPreview(sourceKey) {
  if (!sourceKey) {
    clearInspectorPreviews();
    return;
  }
  inspectorPreviews.delete(sourceKey);
  renderLatestInspectorPreview();
}

function clearInspectorPreviews() {
  inspectorPreviews.clear();
  hideInspectorPreviewSurface();
}

function renderLatestInspectorPreview() {
  const latest = Array.from(inspectorPreviews.values()).reduce(
    (current, preview) => (!current || preview.sequence > current.sequence ? preview : current),
    null,
  );
  if (!latest) {
    hideInspectorPreviewSurface();
    return;
  }

  elements.focusHeader.hidden = true;
  elements.focusBody.hidden = true;
  elements.focusPreviewHeader.hidden = false;
  elements.focusPreviewBody.hidden = false;
  elements.focusPreviewTitle.textContent = latest.title;
  elements.focusPreviewBody.innerHTML = latest.html;
  elements.focusPanel.classList.add("is-preview");
  typesetInspectorPreview(latest.html);
}

function hideInspectorPreviewSurface() {
  const mathJax = window.MathJax;
  mathJax?.typesetClear?.([elements.focusPreviewBody]);
  elements.focusPreviewBody.innerHTML = "";
  elements.focusPreviewHeader.hidden = true;
  elements.focusPreviewBody.hidden = true;
  elements.focusHeader.hidden = false;
  elements.focusBody.hidden = false;
  elements.focusPanel.classList.remove("is-preview");
}

function typesetInspectorPreview(html) {
  if (!html.includes("math-step") && !html.includes("\\(")) return;
  const mathJax = window.MathJax;
  if (!mathJax?.typesetPromise) return;
  mathJax.typesetClear?.([elements.focusPreviewBody]);
  mathJax.typesetPromise([elements.focusPreviewBody]).catch((error) => {
    console.warn("MathJax inspector preview typesetting failed", error);
  });
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

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMathStep(step) {
  if (typeof step === "string") return `<li><code>${escapeHtml(step)}</code></li>`;
  const tex = step.tex ? `<span class="math-step">\\(${escapeHtml(step.tex)}\\)</span>` : "";
  const text = step.text ? `<code>${escapeHtml(step.text)}</code>` : "";
  return `<li>${tex}${text}</li>`;
}

function ensureBoardChrome() {
  if (!boardActions) {
    boardActions = document.createElement("nav");
    boardActions.className = "board-actions board-chrome";
    boardActions.setAttribute("aria-label", "Board navigation");
    boardActions.addEventListener("click", onBoardActionClick);
    elements.canvas.appendChild(boardActions);
  }
  if (!canvasContextRail) {
    canvasContextRail = document.createElement("div");
    canvasContextRail.className = "canvas-context-rail board-chrome";
    elements.canvas.appendChild(canvasContextRail);

    semanticLocation = document.createElement("nav");
    semanticLocation.className = "semantic-location";
    semanticLocation.setAttribute("aria-label", "Semantic location");
    semanticLocation.addEventListener("click", onSemanticLocationClick);
    canvasContextRail.appendChild(semanticLocation);

    semanticLocationStatus = document.createElement("p");
    semanticLocationStatus.className = "semantic-location-status";
    semanticLocationStatus.setAttribute("role", "status");
    semanticLocationStatus.setAttribute("aria-live", "polite");
    semanticLocationStatus.setAttribute("aria-atomic", "true");
    canvasContextRail.appendChild(semanticLocationStatus);
  }
  ensurePanZoom();
  ensureModelMap();
  if (!elements.focusPanel.classList.contains("is-canvas-inspector")) {
    elements.focusPanel.classList.add("is-canvas-inspector", "board-chrome");
    elements.canvas.appendChild(elements.focusPanel);
  }
  elements.canvas.tabIndex = -1;
}

function currentBoard() {
  return boardsById.get(state.boardStack.at(-1)) || boardsById.get(manifest.boards.rootBoard);
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
  elements.moduleLayer.classList.remove("is-content-grid");
  elements.moduleLayer.style.gridTemplateColumns = "";
  elements.moduleLayer.style.justifyContent = "";
  elements.moduleLayer.style.columnGap = "";
}

function measureEdgeText(text) {
  const normalized = String(text || "").replaceAll("_", " ").toUpperCase();
  if (!normalized) return 0;
  if (!edgeLabelMeasureContext) {
    edgeLabelMeasureContext = document.createElement("canvas").getContext("2d");
  }
  if (!edgeLabelMeasureContext) return normalized.length * 7.5;
  edgeLabelMeasureContext.font = '900 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const letterSpacing = normalized.length * 0.48;
  return edgeLabelMeasureContext.measureText(normalized).width + letterSpacing;
}

function alwaysVisibleEdgeTextWidth(board, edge) {
  const conditioning = derivedConditioning(board, edge);
  const contracted = (edge.segments || []).length > 1;
  if (!contracted && edge.tone !== "conditioning" && !conditioning.length) return 0;
  const texts = [];
  if (edge.label) texts.push(edge.label);
  if (conditioning.length) {
    texts.push(conditioning
      .map((entry) => String(entry.mode || "").replaceAll("_", " "))
      .filter(Boolean)
      .join(" · "));
  }
  return Math.max(0, ...texts.map(measureEdgeText));
}

function applyGridColumnSizing(board, graph) {
  const nodes = visibleNodes(board);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  // Measure from the neutral authored grid every time. This avoids carrying a
  // previous compact board's constraints into a new board or resize.
  resetGridColumnSizing();
  nodes.forEach((node) => {
    const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
    if (element) element.style.gridColumn = String(node.col || 1);
  });

  if (useElkLayout || board.grid?.column_sizing !== "content") return null;
  const topology = compactColumnTopology(board, nodes);
  if (!topology?.authoredColumns.length) return null;

  const minimum = Number(board.grid?.min_col) || RULES.layout.contentMinColumn;
  const widths = topology.authoredColumns.map(() => minimum);
  nodes.forEach((node) => {
    const rank = topology.rankByAuthored.get(Math.max(1, Number(node.col) || 1));
    const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
    if (rank == null || !element) return;
    widths[rank] = Math.max(widths[rank], Math.ceil(element.offsetWidth));
  });

  const baseGap = Number(board.grid?.col_gap) || RULES.layout.contentColumnGap;
  const gutters = Array(Math.max(0, widths.length - 1)).fill(baseGap);
  for (const edge of graph.edges || []) {
    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    if (!fromNode || !toNode) continue;
    const fromRank = topology.rankByAuthored.get(Math.max(1, Number(fromNode.col) || 1));
    const toRank = topology.rankByAuthored.get(Math.max(1, Number(toNode.col) || 1));
    if (fromRank == null || toRank == null || Math.abs(fromRank - toRank) !== 1) continue;
    const textWidth = alwaysVisibleEdgeTextWidth(board, edge);
    if (!textWidth) continue;
    const gutterIndex = Math.min(fromRank, toRank);
    gutters[gutterIndex] = Math.max(
      gutters[gutterIndex],
      Math.ceil(textWidth + RULES.layout.edgeTextPadding),
    );
  }

  const tracks = [];
  widths.forEach((width, index) => {
    tracks.push(`${width}px`);
    if (index < gutters.length) tracks.push(`${gutters[index]}px`);
  });
  elements.moduleLayer.classList.add("is-content-grid");
  elements.moduleLayer.style.gridTemplateColumns = tracks.join(" ");
  elements.moduleLayer.style.justifyContent = "center";
  elements.moduleLayer.style.columnGap = "0px";
  nodes.forEach((node) => {
    const rank = topology.rankByAuthored.get(Math.max(1, Number(node.col) || 1));
    const element = elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`);
    if (rank != null && element) element.style.gridColumn = String(rank * 2 + 1);
  });

  return { topology, widths, gutters };
}

function renderBoard() {
  const board = currentBoard();
  hideRepPeek();
  state.displayEdges = null;
  state.layoutEdges = null;
  state.edgeRoutes = new Map();
  resetGridColumnSizing();
  elements.moduleLayer.innerHTML = "";
  elements.edgeLayer.innerHTML = "";
  elements.moduleLayer.style.setProperty("--board-columns", String(board.grid?.columns || 5));
  elements.moduleLayer.style.setProperty("--board-rows", String(board.grid?.rows || 4));
  elements.moduleLayer.style.setProperty(
    "--board-min-col",
    board.grid?.min_col ? `${board.grid.min_col}px` : "",
  );
  elements.moduleLayer.style.setProperty(
    "--board-col-gap",
    board.grid?.col_gap ? `${board.grid.col_gap}px` : "",
  );
  elements.canvas.dataset.boardId = board.id;
  elements.canvas.setAttribute("aria-label", `${board.title} architecture map`);
  elements.canvas.classList.toggle("is-root-board", state.boardStack.length === 1);

  renderAudienceNavigation();
  renderModelMap();
  renderScaleLanes(board);

  const graph = displayGraph(board);
  state.displayEdges = graph.edges;
  for (const node of visibleNodes(board)) {
    const el = renderNode(node);
    elements.moduleLayer.appendChild(el);
  }
  applyGridColumnSizing(board, graph);
  applyViewport();
  layoutBoard(graph);
}

function renderScaleLanes(board) {
  const lanes = Array.isArray(board.lanes) ? board.lanes : [];
  elements.scaleLaneLayer.replaceChildren();
  elements.scaleLaneLayer.hidden = lanes.length === 0;
  for (const lane of lanes) {
    const guide = document.createElement("div");
    guide.className = "scale-lane";
    guide.dataset.laneId = lane.id;
    guide.style.top = `${clamp(Number(lane.position), 0, 100)}%`;
    const label = document.createElement("span");
    label.textContent = lane.label || humanizeRef(lane.id);
    guide.appendChild(label);
    elements.scaleLaneLayer.appendChild(guide);
  }
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

async function layoutBoard(graph) {
  const generation = (state.layoutGeneration = (state.layoutGeneration || 0) + 1);
  await typesetBoardMathAsync();
  if (generation !== state.layoutGeneration) return;

  const elk = useElkLayout ? getElk() : null;
  if (!elk || graph.nodes.length < 2) {
    useGridLayout(graph);
    return;
  }

  elements.moduleLayer.classList.add("is-elk-layout", "is-layouting");
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
  }
}

function useGridLayout(graph) {
  state.layoutEdges = null;
  elements.moduleLayer.classList.remove("is-elk-layout", "is-layouting");
  elements.canvas.classList.remove("is-elk-layout");
  elements.moduleLayer.style.width = "";
  elements.moduleLayer.style.height = "";
  elements.edgeLayer.style.width = "";
  elements.edgeLayer.style.height = "";
  applyGridColumnSizing(currentBoard(), graph || displayGraph(currentBoard()));
  window.requestAnimationFrame(() => {
    renderEdges();
    if (!state.isTransitioning && !state.userMovedViewport) fitToContent();
  });
}

function applyElkLayout(layout) {
  const width = Math.ceil(layout.width || 0);
  const height = Math.ceil(layout.height || 0);
  elements.canvas.classList.add("is-elk-layout");
  elements.moduleLayer.style.width = `${width}px`;
  elements.moduleLayer.style.height = `${height}px`;
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
  const bottomInset = elements.focusPanel.classList.contains("is-canvas-inspector")
    ? elements.focusPanel.offsetHeight + lowerChromeReserve
    : 26;
  return {
    availableW: Math.max(120, canvasRect.width - baseX * 2),
    availableH: Math.max(120, canvasRect.height - baseY - bottomInset),
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
  const nodes = elements.moduleLayer.querySelectorAll("[data-node-id]");
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
  const wirePadding = state.edgeRoutes?.size ? 18 : 0;
  return {
    minX: minX - wirePadding,
    minY: minY - wirePadding,
    width: maxX - minX + wirePadding * 2,
    height: maxY - minY + wirePadding * 2,
  };
}

function fitToContent() {
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
  const fit = Math.min(
    1,
    (availableW - margin) / bounds.width,
    (availableH - margin) / bounds.height,
  );
  viewport.scale = clamp(fit, viewport.minScale, 1);
  viewport.x = (availableW - bounds.width * viewport.scale) / 2 - bounds.minX * viewport.scale;
  viewport.y = (availableH - bounds.height * viewport.scale) / 2 - bounds.minY * viewport.scale;
  applyViewport();
}

function renderAudienceNavigation() {
  const depth = state.boardStack.length;
  const parent = depth > 1 ? boardsById.get(state.boardStack[depth - 2]) : null;

  boardActions.innerHTML = "";
  boardActions.hidden = depth === 1;
  if (depth > 1) {
    const up = document.createElement("button");
    up.type = "button";
    up.className = "board-action board-action-up";
    up.dataset.boardAction = "up";
    up.title = `Go up to ${parent?.title || "the parent view"}`;
    up.innerHTML = `
      <span aria-hidden="true">←</span>
      <span>Up</span>
      <strong>${escapeHtml(parent?.title || "Parent view")}</strong>
    `;
    boardActions.appendChild(up);

    const overview = document.createElement("button");
    overview.type = "button";
    overview.className = "board-action board-action-overview";
    overview.dataset.boardAction = "overview";
    overview.textContent = "Overview";
    overview.title = `Return to ${boardsById.get(state.boardStack[0])?.title || "the overview"}`;
    boardActions.appendChild(overview);
  }

  const heading = document.createElement("div");
  heading.className = "semantic-location-heading";
  const label = document.createElement("span");
  label.textContent = "You are here";
  const level = document.createElement("span");
  const maximumDepth = semanticDepthFrom(manifest.boards.rootBoard);
  level.className = "semantic-location-level";
  level.textContent = `Level ${depth} of ${maximumDepth}`;
  level.title = `Semantic depth ${depth} of ${maximumDepth}; geometric zoom is shown at the bottom left`;
  heading.append(label, level);

  const path = document.createElement("ol");
  path.className = "semantic-location-path";
  state.boardStack.forEach((boardId, index) => {
    const board = boardsById.get(boardId);
    if (!board) return;
    const item = document.createElement("li");
    const isCurrent = index === depth - 1;
    item.className = `semantic-location-step${isCurrent ? " is-current" : ""}`;

    const control = document.createElement(isCurrent ? "span" : "button");
    if (!isCurrent) {
      control.type = "button";
      control.dataset.boardIndex = String(index);
      control.title = `Return to ${board.title}`;
    } else {
      control.setAttribute("aria-current", "page");
    }
    const marker = document.createElement("span");
    marker.className = "semantic-location-marker";
    marker.textContent = String(index + 1);
    marker.setAttribute("aria-hidden", "true");
    const title = document.createElement("span");
    title.className = "semantic-location-title";
    title.textContent = board.title;
    control.append(marker, title);
    item.appendChild(control);
    path.appendChild(item);
  });

  semanticLocation.replaceChildren(heading, path);
  semanticLocationStatus.textContent =
    `Now viewing ${currentBoard().title}, semantic level ${depth} of ${maximumDepth}.`;
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

function onBoardActionClick(event) {
  const action = event.target.closest("button")?.dataset.boardAction;
  if (action === "up") popToBoard(state.boardStack.length - 2);
  if (action === "overview") popToBoard(0);
}

function onSemanticLocationClick(event) {
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
  heading.append(label, modelMapViewToggle);

  modelMapContext = document.createElement("span");
  modelMapContext.className = "model-map-context";

  modelMapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  modelMapSvg.setAttribute("class", "model-map-board");
  modelMapSvg.setAttribute("aria-hidden", "true");
  modelMapSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  modelMapA11y = document.createElement("ol");
  modelMapA11y.className = "model-map-a11y";
  modelMap.append(heading, modelMapContext, modelMapSvg, modelMapA11y);
  elements.canvas.appendChild(modelMap);
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
  renderModelMap();
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
  return { nodes, edges };
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
      ? node.glyph || glyphKindForShape(rep?.shape || "") || "vector"
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
        matrix: [76, 70],
        pair: [70, 70],
        volume: [84, 66],
      };
      [width, height] = dimensions[glyph] || dimensions.vector;
    }

    layout.set(node.id, {
      node,
      module,
      rep,
      kind,
      glyph,
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
  path.setAttribute("d", modelMapEdgePath(from, to));
  path.setAttribute(
    "class",
    `model-map-edge tone-${tone}${(edge.segments || []).length > 1 ? " is-contracted" : ""}`,
  );
  path.setAttribute("marker-end", `url(#model-map-arrow-${tone})`);
  path.setAttribute("vector-effect", "non-scaling-stroke");
  return path;
}

function renderModelMapDefs() {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  ["default", "conditioning", "skip"].forEach((tone) => {
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
    arrow.setAttribute("class", `model-map-arrow tone-${tone}`);
    marker.appendChild(arrow);
    defs.appendChild(marker);
  });
  return defs;
}

function modelMapMiniNodeContent(entry) {
  const node = entry.node;
  const scale = node.scale || entry.module?.scale || entry.rep?.scale || "item";
  if (entry.kind === "representation") {
    const shape = node.shape || entry.rep?.shape || "";
    const symbol = repSymbolById.get(entry.rep?.id)?.name || node.label || entry.rep?.id || node.id;
    const dims = entry.glyph === "scalar" ? "" : shapeDimsLabel(shape);
    const meaning = representationDisplayMeaning(node, entry.rep, node.id);
    return {
      className: `model-map-mini-node arch-rep tensor-${entry.glyph} scale-${scale}`,
      html: `
        <strong class="tensor-symbol">${escapeHtml(symbol)}</strong>
        <span class="tensor-box">
          ${tensorCellsSvg(entry.glyph)}
          ${dims ? `<small class="tensor-dims">${escapeHtml(dims)}</small>` : ""}
        </span>
        <span class="tensor-meaning">${escapeHtml(meaning)}</span>
      `,
    };
  }
  if (entry.kind === "operation") {
    const operator = operatorSymbolFor(node, entry.module) || "•";
    return {
      className: `model-map-mini-node arch-node arch-op-node scale-${scale}`,
      html: `
        <span class="op-circle">${escapeHtml(operator)}</span>
        <span class="op-label">${escapeHtml(node.label || entry.module?.label || node.id)}</span>
      `,
    };
  }
  const kind = entry.module?.kind || node.kind || "module";
  const label = node.label || entry.module?.label || node.id;
  const prominence = node.prominence || "secondary";
  const treatment = node.treatment || "block";
  const density = node.density || "normal";
  const repeat = entry.module?.repeats ? `<span class="arch-repeat">×${entry.module.repeats}</span>` : "";
  const drill = targetBoardForNode(node) ? '<span class="model-map-drill">›</span>' : "";
  return {
    className: `model-map-mini-node arch-node scale-${scale} prominence-${prominence} treatment-${treatment} density-${density}`,
    html: `
      <span class="arch-node-top">
        <span class="arch-kind">${escapeHtml(String(kind).replaceAll("_", " "))}</span>
        ${repeat}
      </span>
      <strong>${escapeHtml(label)}</strong>
      ${drill}
    `,
  };
}

function renderModelMapNode(entry, activeNode) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute(
    "class",
    `model-map-node is-${entry.kind}${entry.glyph ? ` is-${entry.glyph}` : ""}${entry.node === activeNode ? " is-current" : ""}`,
  );
  group.setAttribute("data-model-node-id", entry.node.id);

  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = modelMapNodeLabel(entry.node);
  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.setAttribute("x", String(entry.x - entry.width / 2));
  foreignObject.setAttribute("y", String(entry.y - entry.height / 2));
  foreignObject.setAttribute("width", String(entry.width));
  foreignObject.setAttribute("height", String(entry.height));
  const content = modelMapMiniNodeContent(entry);
  const miniature = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
  miniature.setAttribute("class", content.className);
  miniature.innerHTML = content.html;
  foreignObject.appendChild(miniature);
  group.append(title, foreignObject);
  return group;
}

function renderModelMap() {
  if (!modelMap) return;
  const selection = modelMapSelection();
  const mapBoard = selection.board;
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
  nodeLayer.setAttribute("class", "model-map-nodes");
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

function glyphKindForShape(shape = "") {
  const head = String(shape).split(",")[0];
  const dims = head
    .split(" x ")
    .map((token) => {
      const stripped = token.split("(")[0].trim();
      return stripped || token.trim();
    })
    .filter(Boolean);
  if (!dims.length) return null;
  const rest = dims[0].toLowerCase() === "b" ? dims.slice(1) : dims;
  if (rest.length === 0) return "scalar";
  if (rest.length === 1) return "vector";
  if (rest.length === 2) return "matrix";
  return rest[0] === rest[1] ? "pair" : "volume";
}

function shapeDimsLabel(shape = "") {
  const head = String(shape).split(",")[0];
  const dims = head
    .split(" x ")
    .map((token) => {
      const stripped = token.split("(")[0].trim();
      return stripped || token.trim();
    })
    .filter(Boolean);
  const rest = dims[0]?.toLowerCase() === "b" ? dims.slice(1) : dims;
  return rest.join(" × ");
}

const repSymbolById = new Map();
for (const program of Object.values(manifest.pseudocode || {})) {
  for (const symbol of program.symbols || []) {
    const ref = String(symbol.architectureRef || "");
    if (ref.startsWith("representations.") && symbol.name) {
      repSymbolById.set(ref.slice("representations.".length), symbol);
    }
  }
}

function symbolMarkup(symbol, fallback) {
  if (symbol?.tex) return `\\(${escapeHtml(symbol.tex)}\\)`;
  const name = symbol?.name || fallback;
  if (/^[A-Za-zͰ-Ͽ]$/.test(name)) return `\\(${name}\\)`;
  const subscripted = name.match(/^([A-Za-zͰ-Ͽ])_([A-Za-z0-9]+)$/);
  if (subscripted) return `\\(${subscripted[1]}_{\\mathrm{${subscripted[2]}}}\\)`;
  return escapeHtml(name);
}

function tensorCellsSvg(kind) {
  const grids = {
    scalar: [1, 1],
    vector: [10, 1],
    matrix: [8, 6],
    pair: [6, 6],
    volume: [8, 6],
  };
  const [cols, rows] = grids[kind] || grids.vector;
  let cells = "";
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const index = r * cols + c;
      const jitter = ((((index + 1) * 2654435761) >>> 16) % 1000) / 1000;
      const opacity = (0.18 + jitter * 0.38).toFixed(2);
      const inset = cols * rows === 1 ? 0 : 0.04;
      cells += `<rect x="${c + inset}" y="${r + inset}" width="${1 - 2 * inset}" height="${1 - 2 * inset}" fill="var(--glyph-color)" opacity="${opacity}"></rect>`;
    }
  }
  return `<svg class="tensor-cells" viewBox="0 0 ${cols} ${rows}" preserveAspectRatio="none" aria-hidden="true">${cells}</svg>`;
}

function renderRepresentationNode(node) {
  const rep = node.rep_ref ? repsById.get(node.rep_ref) : null;
  const scale = node.scale || rep?.scale || "item";
  const shape = node.shape || rep?.shape || "";
  const prominence = node.prominence || "secondary";
  const kind = node.glyph || rep?.glyph || glyphKindForShape(shape) || "vector";
  const fullLabel = node.label || rep?.id || node.id;
  const symbol = symbolMarkup(repSymbolById.get(rep?.id), fullLabel);
  const dims = kind === "scalar" ? "" : shapeDimsLabel(shape);
  const displayMeaning = representationDisplayMeaning(node, rep, fullLabel);
  const card = document.createElement("article");
  card.className = `arch-rep tensor-${kind} scale-${scale} prominence-${prominence}`;
  card.dataset.nodeId = node.id;
  card.setAttribute("aria-label", [fullLabel, displayMeaning, shape].filter(Boolean).join(" — "));
  placeNode(card, node);
  const symbolHtml = `<strong class="tensor-symbol">${symbol}</strong>`;
  const box = (inner) => `<span class="tensor-box">${tensorCellsSvg(kind)}${inner}</span>`;
  card.innerHTML = `
    ${symbolHtml}
    ${box(dims ? `<small class="tensor-dims">${dims}</small>` : "")}
    ${displayMeaning ? `<span class="tensor-meaning">${escapeHtml(displayMeaning)}</span>` : ""}
  `;
  const pointerPreviewKey = `pointer:representation:${node.id}`;
  card.addEventListener("pointerenter", (event) => showRepPeek(event, node, rep, pointerPreviewKey));
  card.addEventListener("pointerleave", () => hideRepPeek(pointerPreviewKey));
  card.addEventListener("click", () => {
    hideRepPeek();
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

function representationScaleLabel(scale) {
  const labels = {
    sample: "per sample",
    token: "per token",
    spatial: "spatial grid",
    item: "per item",
    item_pair: "per pair",
    group: "per group",
  };
  return labels[scale] || String(scale || "unknown").replaceAll("_", " ");
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

function repFocusHtml(node, rep) {
  const shape = node.shape || rep?.shape || "";
  const semantics = stateSemanticsFor(node, rep);
  const valueSiteInterface = valueSiteInterfaceFor(node);
  const carries = rep?.carries || [];
  return `
    <div class="focus-section">
      <p>${node.role || rep?.semantic_role || ""}</p>
      <dl class="focus-dl">
        ${shape ? `<dt>shape</dt><dd><code>${shape}</code></dd>` : ""}
        <dt>scale</dt><dd>${node.scale || rep?.scale || "unknown"}</dd>
        ${semantics?.lifecycle ? `<dt>lifecycle</dt><dd>${String(semantics.lifecycle).replaceAll("_", " ")}</dd>` : ""}
        ${valueSiteInterface?.producerRefs?.length ? `<dt>produced by</dt><dd>${readableRefs(valueSiteInterface.producerRefs)}</dd>` : ""}
        ${valueSiteInterface?.consumerRefs?.length ? `<dt>consumed by</dt><dd>${readableRefs(valueSiteInterface.consumerRefs)}</dd>` : ""}
      </dl>
      ${semantics?.notes?.length ? semantics.notes.map((note) => `<p>${note}</p>`).join("") : ""}
      ${carries.length ? `<h3>Carries</h3><ul class="claim-list">${carries.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
      ${rep?.evidence ? renderReferences(rep) : ""}
    </div>
  `;
}

function showHoverPanel(html, title, sourceKey) {
  beginInspectorPreview(sourceKey, { title, html });
}

function hideHoverPanel(sourceKey) {
  endInspectorPreview(sourceKey);
}

function showRepPeek(event, node, rep, sourceKey) {
  const title = node.label || rep?.display_label || rep?.id || node.id;
  showHoverPanel(repTooltipHtml(node, rep), title, sourceKey);
}

function hideRepPeek(sourceKey) {
  hideHoverPanel(sourceKey);
}

function repTooltipHtml(node, rep) {
  const shape = node.shape || rep?.shape || "";
  const semantics = stateSemanticsFor(node, rep);
  const valueSiteInterface = valueSiteInterfaceFor(node);
  const label = node.label || rep?.id || node.id;
  const scale = node.scale || rep?.scale || "unknown";
  const scaleLabel = representationScaleLabel(scale);
  const stateRole = node.role || semantics?.lifecycle
    ? String(node.role || semantics.lifecycle).replaceAll("_", " ")
    : "";
  const symbol = symbolMarkup(repSymbolById.get(rep?.id), label);
  return `
    <span class="rep-tooltip-meta">${escapeHtml(scaleLabel)}${stateRole ? ` · ${escapeHtml(stateRole)}` : ""}</span>
    <strong class="rep-tooltip-title"><i class="rep-tooltip-symbol">${symbol}</i>${escapeHtml(label)}</strong>
    <div class="focus-section">
      ${node.role || rep?.semantic_role ? `<p>${escapeHtml(node.role || rep?.semantic_role)}</p>` : ""}
      <dl class="focus-dl">
        ${shape ? `<dt>shape</dt><dd><code>${escapeHtml(shape)}</code></dd>` : ""}
        ${valueSiteInterface?.producerRefs?.length ? `<dt>produced by</dt><dd>${escapeHtml(readableRefs(valueSiteInterface.producerRefs))}</dd>` : ""}
      </dl>
    </div>
  `;
}

function focusRepresentation(node, rep) {
  state.focusedId = node.id;
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
  const card = document.createElement("button");
  card.type = "button";
  card.className = operator
    ? `arch-node arch-op-node scale-${scale}`
    : `arch-node scale-${scale} prominence-${prominence} treatment-${treatment} density-${density}`;
  if (node.kind === "operation") card.classList.add("is-operation");
  if (expandable) card.classList.add("is-expandable");
  card.dataset.nodeId = node.id;
  if (module) card.dataset.moduleId = module.id;
  placeNode(card, node);
  card.innerHTML = operator
    ? `
      <span class="op-circle">${escapeHtml(operator)}</span>
      <span class="op-label">${escapeHtml(node.label || module?.label || node.id)}</span>
    `
    : blockCardHtml(node, module, expandable);
  if (targetBoard) {
    card.setAttribute("aria-label", `Open ${targetBoard.title}`);
    card.title = `Open ${targetBoard.title}`;
  }
  const pointerPreviewKey = `pointer:node:${node.id}`;
  const focusPreviewKey = `focus:node:${node.id}`;
  card.addEventListener("mouseenter", () => showNodePeek(node, module, targetBoard, pointerPreviewKey));
  card.addEventListener("mouseleave", () => hideHoverPanel(pointerPreviewKey));
  card.addEventListener("focus", () => showNodePeek(node, module, targetBoard, focusPreviewKey));
  card.addEventListener("blur", () => hideHoverPanel(focusPreviewKey));
  card.addEventListener("click", () => {
    hideHoverPanel();
    if (targetBoard) {
      pushBoard(targetBoard.id, node.id);
    } else if (module) {
      focusModule(module);
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

function blockCardHtml(node, module, expandable) {
  const kind = node.kind === "operation" ? "operation" : module?.kind || node.kind;
  const label = node.label || module?.label || node.id;
  const role = node.role || module?.role || "";
  const detail = node.detail || moduleDetail(module) || kind;
  const repeat = module?.repeats ? `<span class="arch-repeat">x${module.repeats}</span>` : "";
  const badges = blockBadges(node, module);
  const drillCue = expandable
    ? '<span class="arch-drill-cue" aria-hidden="true">Open detail <b>›</b></span>'
    : "";

  if (node.treatment === "chip" || node.density === "micro") {
    return `
      <strong>${label}</strong>
      <span class="arch-chip-meta">${node.scale || module?.scale || kind}</span>
      ${drillCue}
    `;
  }

  if (node.treatment === "compact" || node.density === "compact") {
    return `
      <span class="arch-node-top">
        <span class="arch-kind">${kind}</span>
        ${repeat}
      </span>
      <strong>${label}</strong>
      <span class="arch-badges">
        ${badges.map((badge) => `<i>${badge}</i>`).join("")}
      </span>
      ${drillCue}
    `;
  }

  return `
    <span class="arch-node-top">
      <span class="arch-kind">${kind}</span>
      ${repeat}
    </span>
    <strong>${label}</strong>
    <span class="arch-role">${role}</span>
    <span class="arch-spec">${detail}</span>
    <span class="arch-badges">
      ${badges.map((badge) => `<i>${badge}</i>`).join("")}
    </span>
    ${drillCue}
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
  // an edge prints its label only when it spans at least this many px,
  // is a contracted (elided) edge, or carries conditioning tone;
  // shorter edges communicate by shape alone and reveal text on hover
  edgeLabelMinSpan: 130,
  layout: {
    contentMinColumn: 96,
    contentColumnGap: 64,
    edgeTextPadding: 24,
  },
  // orthogonal edge routing: all edges are horizontal/vertical polylines
  route: {
    margin: 14, // clearance kept around node boxes when dodging them
    snap: 12, // dock misalignment (px) below which edges straighten
    channelStep: 18, // search step for a clear channel between boxes
    laneClearance: 28, // distance of detour lanes outside the boxes
    nudge: 10, // separation applied to overlapping parallel segments
  },
  // board dive-in/emerge transition
  diveScale: 2.2,
  arriveScale: 0.92,
  transitionMs: 340,
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

function animateDiveIn(originNodeId, done) {
  const box = originNodeId ? nodeBox(originNodeId) : null;
  if (prefersReducedMotion || !box) {
    done();
    return;
  }
  state.isTransitioning = true;
  const canvasRect = elements.canvas.getBoundingClientRect();
  const baseX = elements.moduleLayer.offsetLeft;
  const baseY = elements.moduleLayer.offsetTop;
  const center = boardViewportCenter(canvasRect, baseX, baseY);
  const targetScale = Math.max(viewport.scale * RULES.diveScale, RULES.diveScale);
  setBoardTransition(true);
  elements.canvas.classList.add("is-board-fading");
  viewport.x = center.x - baseX - box.cx * targetScale;
  viewport.y = center.y - baseY - box.cy * targetScale;
  viewport.scale = targetScale;
  applyViewport();
  window.setTimeout(() => {
    setBoardTransition(false);
    elements.canvas.classList.remove("is-board-fading");
    state.isTransitioning = false;
    done();
  }, RULES.transitionMs);
}

function animateFadeOut(done) {
  if (prefersReducedMotion) {
    done();
    return;
  }
  state.isTransitioning = true;
  const canvasRect = elements.canvas.getBoundingClientRect();
  const baseX = elements.moduleLayer.offsetLeft;
  const baseY = elements.moduleLayer.offsetTop;
  const center = boardViewportCenter(canvasRect, baseX, baseY);
  const px = center.x - baseX;
  const py = center.y - baseY;
  const nextScale = viewport.scale * 0.82;
  const localX = (px - viewport.x) / viewport.scale;
  const localY = (py - viewport.y) / viewport.scale;
  setBoardTransition(true);
  elements.canvas.classList.add("is-board-fading");
  viewport.x = px - localX * nextScale;
  viewport.y = py - localY * nextScale;
  viewport.scale = nextScale;
  applyViewport();
  window.setTimeout(() => {
    setBoardTransition(false);
    elements.canvas.classList.remove("is-board-fading");
    state.isTransitioning = false;
    done();
  }, RULES.transitionMs);
}

function animateArriveFrom(originNodeId) {
  if (prefersReducedMotion) return;
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
  applyViewport();
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      setBoardTransition(true);
      elements.canvas.classList.remove("is-board-fading");
      fitToContent();
      window.setTimeout(() => {
        setBoardTransition(false);
        state.isTransitioning = false;
      }, RULES.transitionMs);
    });
  });
}

function pushBoard(boardId, originNodeId) {
  if (!boardsById.has(boardId) || state.isTransitioning) return;
  const commit = () => {
    state.boardStack.push(boardId);
    state.boardOrigins.push(originNodeId || null);
    state.focusedId = null;
    state.pinnedEdge = null;
    state.userMovedViewport = false;
    resetViewport();
    hideConnection(true);
    renderBoard();
    focusOverview();
    animateArriveFrom(null);
    focusBoardNavigationTarget();
  };
  animateDiveIn(originNodeId, commit);
}

function popToBoard(index) {
  if (state.isTransitioning) return;
  const returningFromBoardId = state.boardStack[index + 1];
  const returningToOriginId = state.boardOrigins[index + 1];
  const commit = () => {
    state.boardStack = state.boardStack.slice(0, index + 1);
    state.boardOrigins = state.boardOrigins.slice(0, index + 1);
    state.focusedId = null;
    state.pinnedEdge = null;
    state.userMovedViewport = false;
    resetViewport();
    hideConnection(true);
    renderBoard();
    focusOverview();
    const origin = (currentBoard().nodes || []).find((node) =>
      returningToOriginId
        ? node.id === returningToOriginId
        : targetBoardForNode(node)?.id === returningFromBoardId,
    );
    animateArriveFrom(origin?.id || null);
    focusBoardNavigationTarget(origin?.id || null);
  };
  animateFadeOut(commit);
}

function focusBoardNavigationTarget(originNodeId = null) {
  const origin = originNodeId
    ? Array.from(elements.moduleLayer.querySelectorAll("[data-node-id]")).find(
        (element) => element.dataset.nodeId === originNodeId,
      )
    : null;
  const navigationTarget = boardActions?.querySelector('[data-board-action="up"]');
  (origin || navigationTarget || elements.canvas).focus({ preventScroll: true });
}

function displayGraph(board) {
  const nodes = (board.nodes || []).filter((node) => !node.elide);
  const elided = (board.nodes || []).filter((node) => node.elide);
  let edges = (board.edges || []).map((edge) => ({
    ...edge,
    segments: edge.segments?.length ? edge.segments : [edge],
  }));

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

function renderEdges() {
  const board = currentBoard();
  const width = elements.moduleLayer.offsetWidth;
  const height = elements.moduleLayer.offsetHeight;
  elements.edgeLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.edgeLayer.innerHTML = "";
  elements.edgeLayer.appendChild(renderEdgeMarkers());

  const edges = state.displayEdges || displayGraph(board).edges;
  const orthoRoutes = buildOrthoRoutes(edges);
  const renderedRoutes = new Map();
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
    renderedRoutes.set(index, routePoints);
    const pathD = roundedOrthPath(routePoints);
    const labelPoint = polylineMidpoint(routePoints);
    const edgeSpan = Math.hypot(
      routePoints.at(-1).x - routePoints[0].x,
      routePoints.at(-1).y - routePoints[0].y,
    );
    const tooltipPoint = { x: labelPoint.x, y: labelPoint.y - 12 };
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("class", "arch-edge");
    path.setAttribute("marker-end", `url(#${edgeMarkerId(edge)})`);
    if (contracted) path.classList.add("is-contracted");
    applyEdgeTone(path, edge);
    elements.edgeLayer.appendChild(path);

    const showLabel = edge.label && (edgeSpan >= RULES.edgeLabelMinSpan || contracted || edge.tone === "conditioning");
    if (showLabel) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(labelPoint.x));
      label.setAttribute("y", String(tooltipPoint.y));
      label.setAttribute("class", "arch-edge-label");
      applyEdgeTone(label, edge);
      label.textContent = edge.label;
      elements.edgeLayer.appendChild(label);
    }

    if (conditioning.length) {
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badge.setAttribute("x", String(labelPoint.x));
      badge.setAttribute("y", String(labelPoint.y + 4));
      badge.setAttribute("class", "arch-edge-badge");
      badge.textContent = conditioning
        .map((entry) => String(entry.mode || "").replaceAll("_", " "))
        .filter(Boolean)
        .join(" · ");
      elements.edgeLayer.appendChild(badge);
    }

    elements.edgeLayer.appendChild(renderEdgeHitTarget(edge, pathD));
  });
  state.edgeRoutes = renderedRoutes;
}

function renderEdgeMarkers() {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  [
    ["edge-arrow-default", "edge-marker-default"],
    ["edge-arrow-conditioning", "edge-marker-conditioning"],
    ["edge-arrow-skip", "edge-marker-skip"],
  ].forEach(([id, markerClass]) => {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", id);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "4.5");
    marker.setAttribute("markerHeight", "4.5");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    arrow.setAttribute("class", markerClass);
    marker.appendChild(arrow);
    defs.appendChild(marker);
  });
  return defs;
}

function edgeMarkerId(edge) {
  if (edge.tone === "conditioning") return "edge-arrow-conditioning";
  if (edge.tone === "skip") return "edge-arrow-skip";
  return "edge-arrow-default";
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
    return cleanRoute([from, { x: from.x, y: laneY }, { x: to.x, y: laneY }, to]);
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
  return cleanRoute([from, { x: laneX, y: from.y }, { x: laneX, y: to.y }, to]);
}

const OPPOSITE_SIDE = { left: "right", right: "left", top: "bottom", bottom: "top" };

// Route every board edge as an orthogonal polyline: dock on the facing box
// sides, then pick the cheapest horizontal/vertical route that crosses no
// node box. Candidates per edge: straight, a Z-bend through the channel
// between the boxes, or a detour lane around them.
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

  const plans = [];
  edges.forEach((edge, index) => {
    if (state.layoutEdges?.get(index)) return;
    const fromBox = boxFor(edge.from);
    const toBox = boxFor(edge.to);
    if (!fromBox || !toBox || fromBox === toBox) return;
    const explicitRoute = explicitLaneRoute(edge, fromBox, toBox, allBoxes);
    if (explicitRoute) {
      routes.set(index, explicitRoute);
      return;
    }
    const dx = toBox.cx - fromBox.cx;
    const dy = toBox.cy - fromBox.cy;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const exitSide = horizontal ? (dx >= 0 ? "right" : "left") : (dy >= 0 ? "bottom" : "top");
    plans.push({ edge, index, fromBox, toBox, horizontal, exitSide, enterSide: OPPOSITE_SIDE[exitSide] });
  });

  spreadDockPoints(plans);

  plans.forEach((plan) => {
    const obstacles = [];
    boxes.forEach((box, id) => {
      if (!box || id === plan.edge.from || id === plan.edge.to) return;
      obstacles.push(inflateBox(box, RULES.route.margin));
    });
    const route = routeOrthogonal(plan, obstacles);
    if (route) routes.set(plan.index, route);
  });

  separateParallelSegments(routes);
  return routes;
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
    const alongY = entries[0].side === "left" || entries[0].side === "right";
    entries.sort((a, b) => (alongY ? a.other.cy - b.other.cy : a.other.cx - b.other.cx));
    entries.forEach((entry, i) => {
      entry.plan[entry.end] = sidePoint(entry.box, entry.side, (i + 1) / (entries.length + 1));
    });
  });
  // A few px of dock misalignment would read as a pointless jog; snap both
  // docks to the shared coordinate so grid-aligned neighbors get a straight line.
  plans.forEach((plan) => {
    const axis = plan.horizontal ? "y" : "x";
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
  const { start, end, horizontal } = plan;
  const candidates = [];
  const stub = RULES.route.margin + 6;
  if (horizontal) {
    if (start.y === end.y) candidates.push([start, end]);
    channelPositions(start.x, end.x).forEach((cx) => {
      candidates.push([start, { x: cx, y: start.y }, { x: cx, y: end.y }, end]);
    });
    const outX = start.x + (plan.exitSide === "right" ? stub : -stub);
    const inX = end.x + (plan.enterSide === "left" ? -stub : stub);
    const top = Math.min(plan.fromBox.y, plan.toBox.y) - RULES.route.laneClearance;
    const bottom = Math.max(plan.fromBox.y + plan.fromBox.height, plan.toBox.y + plan.toBox.height) + RULES.route.laneClearance;
    [top, bottom].forEach((laneY) => {
      candidates.push([start, { x: outX, y: start.y }, { x: outX, y: laneY }, { x: inX, y: laneY }, { x: inX, y: end.y }, end]);
    });
  } else {
    if (start.x === end.x) candidates.push([start, end]);
    channelPositions(start.y, end.y).forEach((cy) => {
      candidates.push([start, { x: start.x, y: cy }, { x: end.x, y: cy }, end]);
    });
    const outY = start.y + (plan.exitSide === "bottom" ? stub : -stub);
    const inY = end.y + (plan.enterSide === "top" ? -stub : stub);
    const left = Math.min(plan.fromBox.x, plan.toBox.x) - RULES.route.laneClearance;
    const right = Math.max(plan.fromBox.x + plan.fromBox.width, plan.toBox.x + plan.toBox.width) + RULES.route.laneClearance;
    [left, right].forEach((laneX) => {
      candidates.push([start, { x: start.x, y: outY }, { x: laneX, y: outY }, { x: laneX, y: inY }, { x: end.x, y: inY }, end]);
    });
  }
  return pickBestRoute(candidates, obstacles);
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

function pickBestRoute(candidates, obstacles) {
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  candidates.forEach((raw) => {
    const points = cleanRoute(raw);
    if (points.length < 2) return;
    let length = 0;
    let hits = 0;
    for (let i = 1; i < points.length; i += 1) {
      length += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y);
      obstacles.forEach((box) => {
        if (segmentHitsBox(points[i - 1], points[i], box)) hits += 1;
      });
    }
    const score = hits * 10000 + length + (points.length - 2) * 30;
    if (score < bestScore) {
      bestScore = score;
      best = points;
    }
  });
  return best;
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
    if ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)) points.splice(i, 1);
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

// Two edges sharing a channel would draw on top of each other; shift the
// later edge's interior segment sideways until it has its own lane.
function separateParallelSegments(routes) {
  const used = [];
  routes.forEach((points) => {
    if (!points || points.length < 4) return;
    for (let i = 1; i < points.length - 2; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const vertical = a.x === b.x;
      const coord = vertical ? a.x : a.y;
      const lo = vertical ? Math.min(a.y, b.y) : Math.min(a.x, b.x);
      const hi = vertical ? Math.max(a.y, b.y) : Math.max(a.x, b.x);
      if (hi - lo < 1) continue;
      let shifted = coord;
      for (let attempt = 1; attempt <= 8; attempt += 1) {
        const blocked = used.some((seg) => seg.vertical === vertical
          && Math.abs(seg.coord - shifted) < RULES.route.nudge
          && seg.lo < hi && seg.hi > lo);
        if (!blocked) break;
        const dir = attempt % 2 === 1 ? 1 : -1;
        shifted = coord + dir * Math.ceil(attempt / 2) * RULES.route.nudge;
      }
      if (shifted !== coord) {
        if (vertical) {
          a.x = shifted;
          b.x = shifted;
        } else {
          a.y = shifted;
          b.y = shifted;
        }
      }
      used.push({ vertical, coord: shifted, lo, hi });
    }
  });
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

function renderEdgeHitTarget(edge, pathD) {
  const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const previewId = edge.relation_ref || edge.id || `${edge.from}->${edge.to}:${edge.label || "flow"}`;
  const pointerPreviewKey = `pointer:edge:${previewId}`;
  const focusPreviewKey = `focus:edge:${previewId}`;
  hit.setAttribute("d", pathD);
  hit.setAttribute("class", "edge-hit");
  hit.setAttribute("tabindex", "0");
  hit.setAttribute("role", "note");
  hit.setAttribute("aria-label", edge.connection.title);
  hit.addEventListener("mouseenter", () => showConnection(edge, pointerPreviewKey));
  hit.addEventListener("mouseleave", () => hideConnection(false, pointerPreviewKey));
  hit.addEventListener("focus", () => showConnection(edge, focusPreviewKey));
  hit.addEventListener("blur", () => hideConnection(false, focusPreviewKey));
  hit.addEventListener("click", (event) => {
    event.stopPropagation();
    clearInspectorPreviews();
    if (state.pinnedEdge === edge) {
      state.pinnedEdge = null;
      hideConnection(true);
    } else {
      state.pinnedEdge = edge;
      showConnection(edge);
    }
  });
  return hit;
}

function applyEdgeTone(element, edge) {
  if (edge.tone === "conditioning") {
    element.classList.add("is-conditioning");
  }
  if (edge.tone === "skip") {
    element.classList.add("is-skip");
  }
}

function showConnection(edge, previewSourceKey = null) {
  const pinned = state.pinnedEdge === edge;
  if (pinned) {
    clearInspectorPreviews();
    focusConnection(edge);
  } else if (previewSourceKey) {
    beginInspectorPreview(previewSourceKey, {
      title: edge.connection.title,
      html: connectionInspectorHtml(edge, { expanded: false }),
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
      <p>${edge.connection.inside}</p>
      ${contracted
        ? contractedTooltipHtml(edge, expanded, "Select to keep details")
        : `<dl class="focus-dl">
            <dt>from</dt><dd>${edge.from}</dd>
            <dt>to</dt><dd>${edge.to}</dd>
            <dt>role</dt><dd>${edge.connection.role}</dd>
            ${hops ? `<dt>via</dt><dd>${hops}</dd>` : ""}
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
          <strong>${nodeLabelById(segment.from)} → ${nodeLabelById(segment.to)}</strong>
          <p>${segment.connection?.inside || ""}</p>
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
    clearInspectorPreviews();
    if (!state.focusedId && !state.pinnedEdge) focusOverview();
  } else {
    endInspectorPreview(previewSourceKey);
  }
}

function focusConnection(edge) {
  state.focusedId = null;
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-node-id="${edge.to}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = edge.connection.title;
  setFocusBody(connectionInspectorHtml(edge, { expanded: true }), { selected: true });
}

function showNodePeek(node, module, targetBoard, sourceKey) {
  const label = node.label || module?.label || node.id;
  const kind = node.kind === "operation" ? "operation" : module?.kind || node.kind || "module";
  const role = node.role || module?.role || "";
  showHoverPanel(`
    <span class="rep-tooltip-meta">${escapeHtml(String(kind).replaceAll("_", " "))}</span>
    <strong class="rep-tooltip-title">${escapeHtml(label)}</strong>
    <div class="focus-section">
      ${role ? `<p>${escapeHtml(role)}</p>` : ""}
      ${targetBoard
        ? `<p class="focus-preview-hint">Open detail: ${escapeHtml(targetBoard.title)}</p>`
        : ""}
    </div>
  `, label, sourceKey);
}

function focusOverview() {
  state.focusedId = null;
  clearActiveNodes();
  const board = currentBoard();
  elements.focusTitle.textContent = board.title;
  const summary = String(board.summary || "").trim();
  setFocusBody(`
    <div class="focus-section focus-takeaway">
      <p>${escapeHtml(summary || "Explore the board to see how information moves through this level.")}</p>
    </div>
  `);
}

function visibleNodes(board) {
  return (board.nodes || []).filter(
    (node) => !node.elide && node.prominence !== "hidden" && node.treatment !== "hidden",
  );
}

function resetFocusedDetail() {
  state.focusedId = null;
  state.pinnedEdge = null;
  clearActiveNodes();
  focusOverview();
}

function focusModule(module) {
  state.focusedId = module.id;
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-module-id="${module.id}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = module.label;

  const blockHtml = renderStandardBlocks(module);
  const pseudocodeHtml = module.pseudocode_ref ? renderPseudocode(module) : "";

  setFocusBody(`
    <div class="focus-section">
      <p>${module.role}</p>
      ${renderAttentionSummary(module)}
      ${module.accepts_but_does_not_use ? renderUnusedInputs(module.accepts_but_does_not_use) : ""}
      ${renderContains(module.contains || [])}
      ${blockHtml}
      ${pseudocodeHtml}
      ${renderReferences(module)}
      ${renderFocusLinks(module)}
    </div>
  `, { selected: true });
}

function focusOperation(node) {
  state.focusedId = node.id;
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = node.label || node.id;
  setFocusBody(`
    <div class="focus-section">
      <p>${node.role || ""}</p>
      <dl class="focus-dl">
        <dt>scale</dt><dd>${node.scale || "operation"}</dd>
        <dt>node</dt><dd>${node.id}</dd>
      </dl>
    </div>
  `, { selected: true });
}

function clearActiveNodes() {
  elements.moduleLayer.querySelectorAll(".arch-node, .arch-rep").forEach((node) => {
    node.classList.remove("is-focused");
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
            <button class="internal-unit" type="button" data-child-id="${child.id}">
              <strong>${child.label}</strong>
              <span>${child.standard_block_ref ? "standard block" : "pseudocode trace"}</span>
            </button>
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
      <dt>pattern</dt><dd>${attention.pattern}</dd>
      <dt>query</dt><dd>${attention.query_scale}</dd>
      <dt>key/value</dt><dd>${attention.key_value_scale}</dd>
      <dt>window</dt><dd>${window}</dd>
      <dt>pair bias</dt><dd>${String(attention.pair_bias)} (${attention.pair_bias_source ?? "unknown"})</dd>
      <dt>position</dt><dd>${attention.positional_encoding?.kind ?? "unknown"}</dd>
    </dl>
  `;
}

function renderUnusedInputs(inputs) {
  return `
    <div class="warning-note">
      <strong>Accepted but not used here</strong>
      <span>${inputs.join(", ")}</span>
    </div>
  `;
}

function renderStandardBlocks(module) {
  const refs = standardBlockRefsForModule(module);
  const blocks = refs
    .map((ref) => standardBlockFromRef(ref))
    .filter(Boolean)
    .filter((block, index, all) => all.findIndex((candidate) => candidate.id === block.id) === index);
  if (!blocks.length) return "";
  return blocks.map(renderStandardBlock).join("");
}

function standardBlockFromRef(ref) {
  return Object.values(manifest.standardBlocks).find(
    (block) => block.sourceYaml === ref || block.id === ref,
  );
}

function renderStandardBlock(block) {
  return `
    <h3>${block.name}</h3>
    ${block.id === "pair_biased_attention" ? renderAttentionTermDiagram() : ""}
    <ol class="math-list">
      ${block.math.map(renderMathStep).join("")}
    </ol>
  `;
}

function renderAttentionTermDiagram() {
  return `
    <div class="pair-block">
      <div class="pair-matrix qk">QK logits</div>
      <div class="pair-plus">+</div>
      <div class="pair-matrix bias">Linear(context)</div>
      <div class="pair-arrow">softmax</div>
      <div class="pair-matrix weights">weights @ V</div>
    </div>
  `;
}

function renderPseudocode(module) {
  const program = Object.values(manifest.pseudocode)[0];
  if (!program) return "";
  const relevant = program.lines.filter((line) =>
    (line.architectureRefs || []).includes(`modules.${module.id}`),
  );
  const lines = relevant.length ? relevant : program.lines.slice(0, 6);
  return `
    <h3>Pseudocode trace</h3>
    <ol class="pseudo-lines">
      ${lines
        .map((line) => `<li><code>${line.text}</code><span>${line.refs}</span></li>`)
        .join("")}
    </ol>
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
  const href = source?.href || source?.url || ref.path;
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
    module.story_ref ? `<a href="${module.story_ref}">Open curated story</a>` : "",
    module.pseudocode_ref ? `<a href="${module.pseudocode_ref}">Open pseudocode YAML</a>` : "",
    module.attention?.standard_block_ref ? `<a href="${module.attention.standard_block_ref}">Open standard block</a>` : "",
  ].filter(Boolean);
  if (!links.length) return "";
  return `<div class="focus-links">${links.join("")}</div>`;
}

function ensurePanZoom() {
  if (!canvasControls) {
    canvasControls = document.createElement("div");
    canvasControls.className = "canvas-controls board-chrome";
    canvasControls.innerHTML = `
      <button type="button" data-zoom="out" aria-label="Zoom out" title="Zoom out">−</button>
      <button type="button" class="canvas-zoom-value" data-zoom="reset" aria-label="Reset geometric zoom to 100 percent" title="Reset geometric zoom to 100%">100%</button>
      <button type="button" data-zoom="in" aria-label="Zoom in" title="Zoom in">+</button>
      <button type="button" class="canvas-fit-button" data-zoom="fit" aria-label="Fit board to view" title="Fit board to view">Fit</button>
    `;
    canvasZoomValue = canvasControls.querySelector(".canvas-zoom-value");
    canvasControls.addEventListener("click", onCanvasControlClick);
    elements.canvas.appendChild(canvasControls);
  }

  if (elements.canvas.dataset.panZoomReady) return;
  elements.canvas.dataset.panZoomReady = "true";
  elements.canvas.addEventListener("wheel", onCanvasWheel, { passive: false });
  elements.canvas.addEventListener("pointerdown", onCanvasPointerDown);
  elements.canvas.addEventListener("pointermove", onCanvasPointerMove);
  elements.canvas.addEventListener("pointerup", endPan);
  elements.canvas.addEventListener("pointercancel", endPan);
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
    fitToContent();
    return;
  }
  state.userMovedViewport = true;
  zoomAtCanvasCenter(action === "in" ? 1.18 : 1 / 1.18);
}

function onCanvasWheel(event) {
  if (event.target.closest(".board-chrome")) return;
  event.preventDefault();
  hideRepPeek();
  state.userMovedViewport = true;
  const factor = Math.exp(-event.deltaY * 0.001);
  zoomAt(event.clientX, event.clientY, factor);
}

function onCanvasPointerDown(event) {
  if (event.button !== 0 && event.button !== 1) return;
  if (event.target.closest(".arch-node, .arch-rep, .edge-hit, .board-chrome")) return;
  if (state.pinnedEdge) {
    state.pinnedEdge = null;
    hideConnection(true);
  }
  hideRepPeek();
  viewport.isPanning = true;
  state.userMovedViewport = true;
  viewport.startClientX = event.clientX;
  viewport.startClientY = event.clientY;
  viewport.startX = viewport.x;
  viewport.startY = viewport.y;
  elements.canvas.classList.add("is-panning");
  elements.canvas.setPointerCapture(event.pointerId);
}

function onCanvasPointerMove(event) {
  if (!viewport.isPanning) return;
  event.preventDefault();
  viewport.x = viewport.startX + event.clientX - viewport.startClientX;
  viewport.y = viewport.startY + event.clientY - viewport.startClientY;
  applyViewport();
}

function endPan(event) {
  if (!viewport.isPanning) return;
  viewport.isPanning = false;
  elements.canvas.classList.remove("is-panning");
  if (event?.pointerId && elements.canvas.hasPointerCapture(event.pointerId)) {
    elements.canvas.releasePointerCapture(event.pointerId);
  }
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

function applyViewport() {
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;
  elements.moduleLayer.style.transform = transform;
  elements.edgeLayer.style.transform = transform;
  if (canvasZoomValue) canvasZoomValue.textContent = `${Math.round(viewport.scale * 100)}%`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

window.addEventListener("resize", () => {
  window.requestAnimationFrame(() => {
    if (!state.userMovedViewport && !useElkLayout) {
      const board = currentBoard();
      const graph = displayGraph(board);
      state.displayEdges = graph.edges;
      applyGridColumnSizing(board, graph);
    }
    if (!state.isTransitioning && !state.userMovedViewport) fitToContent();
    renderEdges();
  });
});
render();
