import {
  createBoardSurface,
  resolveBoardSurfaceElements,
  surfaceResourceId,
  surfaceResourceUrl,
} from "./board-surface.mjs";
import {
  glyphKindForShape,
  shapeDimsLabel,
  tensorGlyphSvg,
} from "./representation-glyphs.mjs";
import { notationMarkup } from "./math-notation.mjs";
import {
  edgeFlowProfile,
  nodeFlowProfiles,
} from "./flow-families.mjs";
import {
  renderVisualSegmentRegions,
} from "./visual-segments.mjs";

const SVG_NS = "http://www.w3.org/2000/svg";

function collectionValues(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function humanize(value = "") {
  return String(value).replaceAll("_", " ");
}

function visibleNodes(board) {
  return collectionValues(board?.nodes).filter(
    (node) => !node.elide && node.prominence !== "hidden" && node.treatment !== "hidden",
  );
}

function applyFlowFamily(element, family, families = []) {
  const normalized = family === "coordinate" ? "coordinates"
    : family === "frame" ? "frames"
      : family;
  if (normalized && normalized !== "default") {
    element.classList.add(`flow-family-${normalized}`);
  }
  if (normalized) element.dataset.flowFamily = normalized;
  if (families?.length) element.dataset.flowFamilies = families.join(" ");
}

function symbolMarkup(node) {
  const notation = String(node.notation || node.label || node.id || "");
  return notationMarkup(notation);
}

function placeNode(element, node) {
  element.style.gridColumn = String(node.col || 1);
  element.style.gridRow = String(node.row || 1);
}

function factRefsForNode(node) {
  return [
    node.instance_fact_ref,
    node.instanceFactRef,
    node.template_fact_ref,
    node.templateFactRef,
    node.ref,
  ].filter(Boolean);
}

function relationRefsForEdge(edge) {
  return edge.relation_path || edge.relationPath || [];
}

export function buildAlignmentIndex(comparison, side = "counterpart") {
  const index = new Map();
  collectionValues(comparison?.alignments).forEach((alignment, alignmentIndex) => {
    const facts = side === "primary"
      ? alignment.primaryFacts || alignment.primary_refs || alignment.primaryRefs
      : alignment.counterpartFacts || alignment.counterpart_refs || alignment.counterpartRefs;
    collectionValues(facts).forEach((fact) => {
      const refs = typeof fact === "string"
        ? [fact]
        : [fact.factRef, fact.templateFactRef, ...collectionValues(fact.nodeIds)].filter(Boolean);
      const compiled = {
        id: alignment.id,
        number: alignmentIndex + 1,
        label: alignment.label,
        groupRef: alignment.groupRef || alignment.group_ref,
        relationship: alignment.relationship,
        statement: alignment.explanation || alignment.statement || alignment.label,
        evidence: alignment.evidence || null,
      };
      refs.forEach((ref) => index.set(ref, compiled));
    });
  });
  return index;
}

export function alignmentForNode(node, alignmentIndex) {
  const byNodeId = alignmentIndex?.get(node.id);
  if (byNodeId) return byNodeId;
  for (const ref of factRefsForNode(node)) {
    const alignment = alignmentIndex?.get(ref);
    if (alignment) return alignment;
  }
  return null;
}

export function decorateAlignmentElement(element, alignment) {
  if (!alignment) return;
  element.classList.add("comparison-aligned", `comparison-${alignment.relationship}`);
  element.dataset.comparisonAlignment = alignment.id;
  const badge = document.createElement("span");
  badge.className = "comparison-match-badge";
  badge.textContent = String(alignment.number);
  badge.title = alignment.statement || humanize(alignment.relationship);
  badge.setAttribute(
    "aria-label",
    `Comparison match ${alignment.number}: ${alignment.statement || humanize(alignment.relationship)}`,
  );
  element.appendChild(badge);
}

export function clearAlignmentDecorations(root) {
  root?.querySelectorAll?.(".comparison-aligned").forEach((element) => {
    element.classList.remove(
      "comparison-aligned",
      "comparison-equivalent",
      "comparison-analogous",
      "comparison-changed",
      "comparison-primary_only",
      "comparison-counterpart_only",
    );
    delete element.dataset.comparisonAlignment;
    element.querySelectorAll(":scope > .comparison-match-badge").forEach((badge) => badge.remove());
  });
}

function renderRepresentationNode(node, alignment, onSelectNode) {
  const shape = node.shape || "";
  const kind = node.glyph || glyphKindForShape(shape) || "vector";
  const dims = kind === "scalar" ? "" : shapeDimsLabel(shape);
  const label = node.label || node.id;
  const card = document.createElement("button");
  card.type = "button";
  card.className = `arch-rep tensor-${kind} scale-${node.scale || "item"} prominence-${node.prominence || "secondary"}`;
  card.dataset.nodeId = node.id;
  card.setAttribute("aria-label", [label, shape].filter(Boolean).join(" — "));
  placeNode(card, node);
  card.innerHTML = `
    <strong class="tensor-symbol">${symbolMarkup(node)}</strong>
    <span class="tensor-box">
      ${tensorGlyphSvg(kind)}
      ${dims ? `<small class="tensor-dims">${escapeHtml(dims)}</small>` : ""}
    </span>
    <span class="tensor-meaning">${escapeHtml(label)}</span>
  `;
  applyFlowFamily(card, node.flow_family, node.flow_families);
  decorateAlignmentElement(card, alignment);
  card.addEventListener("click", () => onSelectNode?.(node));
  return card;
}

function renderOperationNode(node, module, alignment, onSelectNode) {
  const label = node.label || module?.label || node.id;
  const kind = node.kind === "operation" ? "operation" : module?.kind || node.kind || "module";
  const role = node.role || module?.role || "";
  const detail = node.detail || node.operation || module?.kind || "";
  const card = document.createElement("article");
  card.className = `arch-node scale-${node.scale || module?.scale || "operation"} prominence-${node.prominence || "secondary"} treatment-${node.treatment || "block"} density-${node.density || "normal"}`;
  if (node.kind === "operation") card.classList.add("is-operation");
  card.dataset.nodeId = node.id;
  placeNode(card, node);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "arch-node-main";
  button.setAttribute("aria-label", `Inspect ${label}`);
  button.innerHTML = `
    <span class="arch-node-top"><span class="arch-kind">${escapeHtml(kind)}</span></span>
    <strong>${escapeHtml(label)}</strong>
    ${role ? `<span class="arch-role">${escapeHtml(role)}</span>` : ""}
    ${detail ? `<span class="arch-spec">${escapeHtml(detail)}</span>` : ""}
  `;
  card.appendChild(button);
  applyFlowFamily(card, node.flow_family, node.flow_families);
  decorateAlignmentElement(card, alignment);
  button.addEventListener("click", () => onSelectNode?.(node));
  return card;
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function markerFamily(edge) {
  const family = edge.flow_family || edge.flowFamily;
  if (family === "single" || family === "pair") return family;
  if (family === "coordinate" || family === "coordinates") return "coordinates";
  if (family === "frame" || family === "frames") return "frames";
  if (edge.tone === "conditioning" || edge.kind === "conditioning") return "conditioning";
  return "default";
}

function renderMarkers(surfaceKey) {
  const defs = svgElement("defs");
  ["default", "single", "pair", "coordinates", "frames", "conditioning"].forEach((family) => {
    const marker = svgElement("marker", {
      id: surfaceResourceId(surfaceKey, `edge-arrow-${family}`),
      viewBox: "0 0 10 10",
      refX: 9,
      refY: 5,
      markerWidth: 7,
      markerHeight: 7,
      orient: "auto-start-reverse",
    });
    marker.classList.add("comparison-edge-marker", `flow-family-${family}`);
    marker.appendChild(svgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.appendChild(marker);
  });
  return defs;
}

function nodeBox(moduleLayer, nodeId) {
  const element = moduleLayer.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`);
  if (!element) return null;
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
    col: Number(element.style.gridColumn || 1),
    row: Number(element.style.gridRow || 1),
  };
}

function edgeRoute(from, to) {
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  const horizontal = Math.abs(to.col - from.col) >= Math.abs(to.row - from.row);
  if (horizontal) {
    const forward = toCenter.x >= fromCenter.x;
    const start = { x: forward ? from.x + from.width : from.x, y: fromCenter.y };
    const end = { x: forward ? to.x : to.x + to.width, y: toCenter.y };
    const midX = (start.x + end.x) / 2;
    return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
  }
  const forward = toCenter.y >= fromCenter.y;
  const start = { x: fromCenter.x, y: forward ? from.y + from.height : from.y };
  const end = { x: toCenter.x, y: forward ? to.y : to.y + to.height };
  const midY = (start.y + end.y) / 2;
  return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
}

function roundedOrthPath(points, radius = 8) {
  if (!points?.length) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y);
    const bend = Math.min(radius, incoming / 2, outgoing / 2);
    const before = {
      x: corner.x - ((corner.x - previous.x) / (incoming || 1)) * bend,
      y: corner.y - ((corner.y - previous.y) / (incoming || 1)) * bend,
    };
    const after = {
      x: corner.x + ((next.x - corner.x) / (outgoing || 1)) * bend,
      y: corner.y + ((next.y - corner.y) / (outgoing || 1)) * bend,
    };
    path += ` L ${before.x} ${before.y} Q ${corner.x} ${corner.y} ${after.x} ${after.y}`;
  }
  const end = points.at(-1);
  return `${path} L ${end.x} ${end.y}`;
}

export function boardContentBounds(moduleLayer, regionLayer = null) {
  const elements = [
    ...moduleLayer.querySelectorAll("[data-node-id]"),
    ...(regionLayer ? regionLayer.querySelectorAll(".board-region") : []),
  ];
  const boxes = elements.map((element) => ({
    x: element.offsetLeft,
    y: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
  }));
  if (!boxes.length) return null;
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}

export function createComparisonBoardRenderer({
  root,
  surfaceKey = "comparison",
  rendererModel,
  board,
  alignmentIndex = new Map(),
  onSelectNode = null,
  onSelectEdge = null,
} = {}) {
  if (!root || !rendererModel || !board) {
    throw new TypeError("Comparison board rendering requires root, rendererModel, and board.");
  }
  const elements = resolveBoardSurfaceElements(root);
  const { modulesById, repsById, relationsById } = rendererModel.indexes;
  let activeBoard = board;
  let currentAlignmentIndex = alignmentIndex;
  let resizeObserver = null;

  const surface = createBoardSurface({
    root,
    elements,
    surfaceKey,
    getContentBounds: () => boardContentBounds(elements.moduleLayer, elements.regionLayer),
    fitOptions: { padding: 18, maxFitScale: 1, readableFloor: 0.52 },
  });

  function configureGrid() {
    const grid = activeBoard.grid || {};
    [elements.moduleLayer, elements.representationLaneLayer].filter(Boolean).forEach((layer) => {
      layer.style.setProperty("--board-columns", String(grid.columns || 5));
      layer.style.setProperty("--board-rows", String(grid.rows || 4));
      layer.style.setProperty("--board-min-col", grid.min_col ? `${grid.min_col}px` : "");
      layer.style.setProperty("--board-col-gap", grid.col_gap != null ? `${grid.col_gap}px` : "");
      layer.style.setProperty("--board-row-gap", grid.row_gap != null ? `${grid.row_gap}px` : "");
    });
  }

  function renderEdges() {
    renderVisualSegmentRegions({
      regionLayer: elements.regionLayer,
      moduleLayer: elements.moduleLayer,
      board: activeBoard,
      surfaceKey,
    });
    const width = Math.max(elements.moduleLayer.scrollWidth, elements.moduleLayer.offsetWidth, 1);
    const height = Math.max(elements.moduleLayer.scrollHeight, elements.moduleLayer.offsetHeight, 1);
    elements.edgeLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
    elements.edgeLayer.replaceChildren(renderMarkers(surfaceKey));
    const pathLayer = svgElement("g", { class: "arch-edge-paths" });
    const hitLayer = svgElement("g", { class: "arch-edge-hits" });
    elements.edgeLayer.append(pathLayer, hitLayer);

    collectionValues(activeBoard.edges).forEach((rawEdge, index) => {
      const profile = edgeFlowProfile(rawEdge, { repsById, relationsById });
      const edge = {
        ...rawEdge,
        comparison_edge_index: index,
        flow_family: profile.family,
        flow_families: profile.families,
      };
      const from = nodeBox(elements.moduleLayer, edge.from);
      const to = nodeBox(elements.moduleLayer, edge.to);
      if (!from || !to) return;
      const pathData = roundedOrthPath(edgeRoute(from, to));
      const family = markerFamily(edge);
      const path = svgElement("path", {
        d: pathData,
        class: "arch-edge comparison-edge",
        "aria-hidden": "true",
        "marker-end": surfaceResourceUrl(surfaceKey, `edge-arrow-${family}`),
      });
      path.dataset.edgeIndex = String(index);
      applyFlowFamily(path, edge.flow_family, edge.flow_families);
      if (edge.tone === "conditioning" || edge.kind === "conditioning") {
        path.classList.add("is-conditioning");
      }
      pathLayer.appendChild(path);

      const hit = svgElement("path", {
        d: pathData,
        class: "edge-hit comparison-edge-hit",
        tabindex: "0",
        role: "button",
        "aria-label": edge.connection?.title || `Inspect connection ${index + 1}`,
      });
      hit.dataset.edgeIndex = String(index);
      hit.addEventListener("click", () => onSelectEdge?.(edge));
      hit.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelectEdge?.(edge);
      });
      hitLayer.appendChild(hit);
    });
  }

  function typeset() {
    if (!globalThis.MathJax?.typesetPromise) return Promise.resolve();
    return globalThis.MathJax.typesetPromise([elements.moduleLayer]).catch(() => undefined);
  }

  async function render({ fit = true } = {}) {
    elements.moduleLayer.replaceChildren();
    elements.regionLayer.replaceChildren();
    elements.edgeLayer.replaceChildren();
    elements.representationLaneLayer?.replaceChildren();
    configureGrid();
    elements.canvas.dataset.boardId = activeBoard.id;
    elements.canvas.setAttribute("aria-label", `${activeBoard.title} comparison architecture map`);
    const nodes = visibleNodes(activeBoard);
    const graphEdges = collectionValues(activeBoard.edges);
    const profiles = nodeFlowProfiles(nodes, graphEdges, { repsById, relationsById });
    nodes.forEach((node) => {
      const profile = profiles.get(node.id) || { family: node.flow_family, families: [] };
      const renderedNode = {
        ...node,
        flow_family: profile.family || node.flow_family,
        flow_families: profile.families || node.flow_families,
      };
      const alignment = alignmentForNode(renderedNode, currentAlignmentIndex);
      const module = renderedNode.module_ref ? modulesById.get(renderedNode.module_ref) : null;
      const element = renderedNode.kind === "representation"
        ? renderRepresentationNode(renderedNode, alignment, onSelectNode)
        : renderOperationNode(renderedNode, module, alignment, onSelectNode);
      elements.moduleLayer.appendChild(element);
    });
    await typeset();
    renderEdges();
    if (fit) surface.fit({ immediate: true });
  }

  function setBoard(nextBoard, nextAlignmentIndex = currentAlignmentIndex) {
    activeBoard = nextBoard;
    currentAlignmentIndex = nextAlignmentIndex;
    return render();
  }

  function clearSelection() {
    elements.moduleLayer.querySelectorAll(".is-focused").forEach((element) => {
      element.classList.remove("is-focused");
    });
    elements.edgeLayer.querySelectorAll(".is-selected").forEach((element) => {
      element.classList.remove("is-selected");
    });
  }

  function selectNode(nodeId) {
    clearSelection();
    const node = elements.moduleLayer.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`);
    node?.classList.add("is-focused");
    return Boolean(node);
  }

  function selectEdge(edgeIndex) {
    clearSelection();
    elements.edgeLayer.querySelectorAll(`[data-edge-index="${edgeIndex}"]`).forEach((element) => {
      element.classList.add("is-selected");
    });
  }

  if (typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver(() => {
      renderEdges();
      if (!surface.userMovedViewport) surface.fit();
    });
    resizeObserver.observe(elements.canvas);
  }

  return {
    surface,
    render,
    setBoard,
    renderEdges,
    clearSelection,
    selectNode,
    selectEdge,
    get board() { return activeBoard; },
    destroy() {
      resizeObserver?.disconnect();
      surface.destroy();
      elements.moduleLayer.replaceChildren();
      elements.regionLayer.replaceChildren();
      elements.edgeLayer.replaceChildren();
    },
  };
}
