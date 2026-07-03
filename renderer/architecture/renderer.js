import { manifestIndex } from "./manifest-index.js";

const pageParams = new URLSearchParams(window.location.search);
const archParam = pageParams.get("arch");
const useElkLayout = pageParams.get("layout") === "elk";
const editMode = pageParams.get("edit") === "1";
const activeManifestEntry = manifestIndex.find((entry) => entry.id === archParam) || manifestIndex[0];
const { manifest } = await import(`./${activeManifestEntry.file}`);

const elements = {
  canvas: document.querySelector(".architecture-canvas"),
  moduleLayer: document.getElementById("moduleLayer"),
  edgeLayer: document.getElementById("edgeLayer"),
  focusTitle: document.getElementById("focusTitle"),
  focusBody: document.getElementById("focusBody"),
};

const modulesById = new Map(manifest.architecture.modules.map((module) => [module.id, module]));
const repsById = new Map(manifest.architecture.representations.map((rep) => [rep.id, rep]));
const boardsById = new Map(manifest.boards.items.map((board) => [board.id, board]));
const conditioningByPair = new Map(
  (manifest.architecture.conditioning || []).map((cond) => [
    `${cond.source}->${String(cond.target || "").split(".")[0]}`,
    cond,
  ]),
);

let connectionTooltip = null;
let representationTooltip = null;
let breadcrumbs = null;
let canvasControls = null;

const state = {
  focusedId: null,
  focusHasMath: false,
  boardStack: [manifest.boards.rootBoard],
  pinnedEdge: null,
};

const viewport = {
  x: 0,
  y: 0,
  scale: 1,
  minScale: 0.55,
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
  renderBoard();
  focusOverview();
}

function renderPageChrome() {
  document.title = `${manifest.architecture.name} — Architecture Renderer`;
  const title = document.getElementById("archTitle");
  if (title) title.textContent = manifest.architecture.name;
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

function setFocusBody(html) {
  elements.focusBody.innerHTML = html;
  state.focusHasMath = html.includes("math-step");
  typesetMath();
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
  if (!breadcrumbs) {
    breadcrumbs = document.createElement("nav");
    breadcrumbs.className = "board-breadcrumbs";
    breadcrumbs.setAttribute("aria-label", "Board breadcrumbs");
    elements.canvas.appendChild(breadcrumbs);
  }
  ensureConnectionTooltip();
  ensureRepresentationTooltip();
  ensurePanZoom();
}

function currentBoard() {
  return boardsById.get(state.boardStack.at(-1)) || boardsById.get(manifest.boards.rootBoard);
}

function renderBoard() {
  const board = currentBoard();
  hideRepPeek();
  state.displayEdges = null;
  state.layoutEdges = null;
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
  elements.canvas.classList.toggle("is-abstract-board", board.scale_lanes === false);

  renderBreadcrumbs();

  const graph = displayGraph(board);
  state.displayEdges = graph.edges;
  for (const node of visibleNodes(board)) {
    const el = renderNode(node);
    if (editMode) {
      if (node.elide) el.classList.add("is-elide-ghost");
      makeDraggable(el, node, board);
    }
    elements.moduleLayer.appendChild(el);
  }
  elements.canvas.classList.toggle("is-edit-mode", editMode);
  if (editMode) ensureEditChrome();
  applyViewport();
  layoutBoard(graph);
}

function makeDraggable(card, node, board) {
  card.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    state.dragMoved = false;
    card.setPointerCapture(event.pointerId);
    const onMove = (ev) => {
      const cell = cellFromPointer(ev, board);
      if (!cell) return;
      if (cell.col !== (node.col || 1) || cell.row !== (node.row || 1)) {
        state.dragMoved = true;
        node.col = cell.col;
        node.row = cell.row;
        placeNode(card, node);
        renderEdges();
      }
    };
    const onUp = () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
    };
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);
  });
}

function cellFromPointer(event, board) {
  const rect = elements.moduleLayer.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const cols = board.grid?.columns || 5;
  const rows = board.grid?.rows || 4;
  const fx = (event.clientX - rect.left) / rect.width;
  const fy = (event.clientY - rect.top) / rect.height;
  return {
    col: clamp(Math.ceil(fx * cols), 1, cols),
    row: clamp(Math.ceil(fy * rows), 1, rows),
  };
}

function ensureEditChrome() {
  if (document.querySelector(".edit-mode-badge")) return;
  const badge = document.createElement("div");
  badge.className = "edit-mode-badge";
  badge.innerHTML = `
    <strong>edit mode</strong>
    <span>drag nodes to reposition · elided nodes shown dashed</span>
    <button type="button" class="edit-export-button">Copy nodes: YAML</button>
  `;
  badge.querySelector(".edit-export-button").addEventListener("click", exportBoardYaml);
  elements.canvas.appendChild(badge);
}

function yamlValue(value) {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = String(value);
  const plain = /^[A-Za-z0-9_][A-Za-z0-9_.\/+*() -]*$/.test(text)
    && !/^(true|false|null|yes|no|on|off)$/i.test(text)
    && !text.includes(": ");
  return plain ? text : JSON.stringify(text);
}

function serializeBoardNodes(board) {
  const lines = ["    nodes:"];
  for (const node of board.nodes || []) {
    Object.entries(node).forEach(([key, value], index) => {
      lines.push(`${index === 0 ? "      - " : "        "}${key}: ${yamlValue(value)}`);
    });
  }
  return lines.join("\n");
}

async function exportBoardYaml() {
  const board = currentBoard();
  const yaml = serializeBoardNodes(board);
  try {
    await navigator.clipboard.writeText(yaml);
    showCanvasToast(`nodes: block for board "${board.id}" copied — paste into the view YAML`);
  } catch (error) {
    console.log(yaml);
    showCanvasToast("clipboard unavailable — YAML printed to the browser console");
  }
}

let canvasToastTimer = null;

function showCanvasToast(message) {
  let toast = document.querySelector(".canvas-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "canvas-toast";
    elements.canvas.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(canvasToastTimer);
  canvasToastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
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
    useGridLayout();
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
    useGridLayout();
  } finally {
    elements.moduleLayer.classList.remove("is-layouting");
  }
}

function useGridLayout() {
  state.layoutEdges = null;
  elements.moduleLayer.classList.remove("is-elk-layout", "is-layouting");
  elements.canvas.classList.remove("is-elk-layout");
  elements.moduleLayer.style.width = "";
  elements.moduleLayer.style.height = "";
  elements.edgeLayer.style.width = "";
  elements.edgeLayer.style.height = "";
  window.requestAnimationFrame(() => {
    if (!state.isTransitioning && !state.userMovedViewport) fitToContent();
    renderEdges();
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
  const availableW = Math.max(120, canvasRect.width - baseX * 2);
  const availableH = Math.max(120, canvasRect.height - baseY - 26);
  const fit = Math.min(1, availableW / width, availableH / height);
  viewport.scale = clamp(fit, viewport.minScale, viewport.maxScale);
  viewport.x = Math.max(0, (availableW - width * viewport.scale) / 2);
  viewport.y = Math.max(0, (availableH - height * viewport.scale) / 2);
  applyViewport();
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
  return { minX, minY, width: maxX - minX, height: maxY - minY };
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
  const availableW = Math.max(120, canvasRect.width - baseX * 2);
  const availableH = Math.max(120, canvasRect.height - baseY - 26);
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

function renderBreadcrumbs() {
  breadcrumbs.innerHTML = "";
  state.boardStack.forEach((boardId, index) => {
    const board = boardsById.get(boardId);
    if (!board) return;
    if (index > 0) {
      const sep = document.createElement("span");
      sep.className = "breadcrumb-sep";
      sep.textContent = "›";
      sep.setAttribute("aria-hidden", "true");
      breadcrumbs.appendChild(sep);
    }
    if (index === state.boardStack.length - 1) {
      const current = document.createElement("span");
      current.className = "breadcrumb-current";
      current.textContent = board.title;
      current.setAttribute("aria-current", "page");
      breadcrumbs.appendChild(current);
    } else {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "breadcrumb-node";
      button.textContent = board.title;
      button.addEventListener("click", () => popToBoard(index));
      breadcrumbs.appendChild(button);
    }
  });
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
  card.addEventListener("pointerenter", (event) => showRepPeek(event, node, rep));
  card.addEventListener("pointermove", moveRepPeek);
  card.addEventListener("pointerleave", hideRepPeek);
  card.addEventListener("click", () => {
    if (state.dragMoved) {
      state.dragMoved = false;
      return;
    }
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

function repFocusHtml(node, rep) {
  const shape = node.shape || rep?.shape || "";
  const semantics = rep ? manifest.architecture.stateSemantics?.[rep.id] : null;
  const carries = rep?.carries || [];
  return `
    <div class="focus-section">
      <p>${node.role || rep?.semantic_role || ""}</p>
      <dl class="focus-dl">
        ${shape ? `<dt>shape</dt><dd><code>${shape}</code></dd>` : ""}
        <dt>scale</dt><dd>${node.scale || rep?.scale || "unknown"}</dd>
        ${semantics ? `<dt>state</dt><dd>${String(semantics.role || "").replaceAll("_", " ")}</dd>` : ""}
        ${semantics?.produced_by ? `<dt>produced by</dt><dd>${semantics.produced_by}</dd>` : ""}
        ${semantics?.updated_by?.length ? `<dt>updated by</dt><dd>${semantics.updated_by.join(", ")}</dd>` : ""}
        ${semantics?.consumed_by?.length ? `<dt>consumed by</dt><dd>${semantics.consumed_by.join(", ")}</dd>` : ""}
      </dl>
      ${semantics?.notes?.length ? semantics.notes.map((note) => `<p>${note}</p>`).join("") : ""}
      ${carries.length ? `<h3>Carries</h3><ul class="claim-list">${carries.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
      ${rep?.evidence ? renderReferences(rep) : ""}
    </div>
  `;
}

function ensureRepresentationTooltip() {
  if (representationTooltip) return;
  representationTooltip = document.createElement("aside");
  representationTooltip.className = "representation-tooltip hover-panel";
  representationTooltip.setAttribute("role", "note");
  representationTooltip.setAttribute("aria-live", "polite");
  elements.canvas.appendChild(representationTooltip);
}

function showHoverPanel(html) {
  ensureRepresentationTooltip();
  representationTooltip.innerHTML = html;
  representationTooltip.classList.add("is-visible");
  typesetHoverPanelMath();
}

function hideHoverPanel() {
  representationTooltip?.classList.remove("is-visible");
}

function showRepPeek(event, node, rep) {
  showHoverPanel(repTooltipHtml(node, rep));
}

function moveRepPeek() {}

function hideRepPeek() {
  hideHoverPanel();
}

function typesetHoverPanelMath() {
  const mathJax = window.MathJax;
  if (!mathJax?.typesetPromise || !representationTooltip?.innerHTML.includes("\\(")) return;
  mathJax.typesetClear?.([representationTooltip]);
  mathJax.typesetPromise([representationTooltip]).catch((error) => {
    console.warn("MathJax hover panel typesetting failed", error);
  });
}

function repTooltipHtml(node, rep) {
  const shape = node.shape || rep?.shape || "";
  const semantics = rep ? manifest.architecture.stateSemantics?.[rep.id] : null;
  const label = node.label || rep?.id || node.id;
  const scale = node.scale || rep?.scale || "unknown";
  const scaleLabel = representationScaleLabel(scale);
  const stateRole = semantics?.role ? String(semantics.role).replaceAll("_", " ") : "";
  const symbol = symbolMarkup(repSymbolById.get(rep?.id), label);
  return `
    <span class="rep-tooltip-meta">${escapeHtml(scaleLabel)}${stateRole ? ` · ${escapeHtml(stateRole)}` : ""}</span>
    <strong class="rep-tooltip-title"><i class="rep-tooltip-symbol">${symbol}</i>${escapeHtml(label)}</strong>
    ${node.role || rep?.semantic_role ? `<p>${escapeHtml(node.role || rep?.semantic_role)}</p>` : ""}
    <dl>
      ${shape ? `<dt>shape</dt><dd><code>${escapeHtml(shape)}</code></dd>` : ""}
      ${semantics?.produced_by ? `<dt>produced by</dt><dd>${escapeHtml(semantics.produced_by)}</dd>` : ""}
    </dl>
  `;
}

function focusRepresentation(node, rep) {
  state.focusedId = node.id;
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-node-id="${node.id}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = node.label || rep?.id || node.id;
  setFocusBody(repFocusHtml(node, rep));
}

const OPERATOR_KINDS = {
  elementwise_sum: "+",
  elementwise_product: "×",
  concatenation: "∥",
};

function operatorSymbolFor(node, module) {
  return node.operator || OPERATOR_KINDS[module?.kind] || null;
}

function renderBlockNode(node) {
  const module = node.module_ref ? modulesById.get(node.module_ref) : null;
  const scale = node.scale || module?.scale || "item";
  const expandable = Boolean(node.expandable && boardsById.has(node.module_ref || node.id));
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
  card.addEventListener("mouseenter", () => showNodePeek(node, module, expandable));
  card.addEventListener("mouseleave", () => hideHoverPanel());
  card.addEventListener("click", () => {
    if (state.dragMoved) {
      state.dragMoved = false;
      return;
    }
    if (expandable) {
      pushBoard(node.module_ref || node.id, node.id);
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
  const badges = blockBadges(node, module, expandable);

  if (node.treatment === "chip" || node.density === "micro") {
    return `
      <strong>${label}</strong>
      <span class="arch-chip-meta">${node.scale || module?.scale || kind}</span>
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
  `;
}

function blockBadges(node, module, expandable) {
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
  // bezier control-point reach: fraction of edge length, clamped
  edgeReach: { factor: 0.4, min: 24, max: 90 },
  // board dive-in/emerge transition
  diveScale: 2.2,
  arriveScale: 0.92,
  transitionMs: 340,
  // fit-to-content margin inside the canvas
  fitMargin: 12,
};
const BOARD_TRANSITION_MS = RULES.transitionMs;

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
  const targetScale = Math.max(viewport.scale * RULES.diveScale, RULES.diveScale);
  setBoardTransition(true);
  elements.canvas.classList.add("is-board-fading");
  viewport.x = canvasRect.width / 2 - baseX - box.cx * targetScale;
  viewport.y = canvasRect.height / 2 - baseY - box.cy * targetScale;
  viewport.scale = targetScale;
  applyViewport();
  window.setTimeout(() => {
    setBoardTransition(false);
    elements.canvas.classList.remove("is-board-fading");
    state.isTransitioning = false;
    done();
  }, BOARD_TRANSITION_MS);
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
  const px = canvasRect.width / 2 - baseX;
  const py = canvasRect.height / 2 - baseY;
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
  }, BOARD_TRANSITION_MS);
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
      const scale = RULES.diveScale;
      start = {
        scale,
        x: canvasRect.width / 2 - baseX - box.cx * scale,
        y: canvasRect.height / 2 - baseY - box.cy * scale,
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
      }, BOARD_TRANSITION_MS);
    });
  });
}

function pushBoard(boardId, originNodeId) {
  if (!boardsById.has(boardId) || state.isTransitioning) return;
  const commit = () => {
    state.boardStack.push(boardId);
    state.focusedId = null;
    state.pinnedEdge = null;
    state.userMovedViewport = false;
    resetViewport();
    hideConnection(true);
    renderBoard();
    focusOverview();
    animateArriveFrom(null);
  };
  animateDiveIn(originNodeId, commit);
}

function popToBoard(index) {
  if (state.isTransitioning) return;
  const leavingBoardId = state.boardStack.at(-1);
  const commit = () => {
    state.boardStack = state.boardStack.slice(0, index + 1);
    state.focusedId = null;
    state.pinnedEdge = null;
    state.userMovedViewport = false;
    resetViewport();
    hideConnection(true);
    renderBoard();
    focusOverview();
    const origin = (currentBoard().nodes || []).find(
      (node) => node.expandable && (node.module_ref || node.id) === leavingBoardId,
    );
    animateArriveFrom(origin?.id || null);
  };
  animateFadeOut(commit);
}

function displayGraph(board) {
  if (editMode) {
    return {
      nodes: board.nodes || [],
      edges: (board.edges || []).map((edge) => ({ ...edge, segments: [edge] })),
    };
  }
  const nodes = (board.nodes || []).filter((node) => !node.elide);
  const elided = (board.nodes || []).filter((node) => node.elide);
  let edges = (board.edges || []).map((edge) => ({ ...edge, segments: [edge] }));

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
  const nodes = new Map((board.nodes || []).map((node) => [node.id, node]));
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  const fromRef = from?.rep_ref || from?.module_ref;
  const toRef = to?.module_ref || to?.rep_ref;
  if (!fromRef || !toRef) return null;
  return conditioningByPair.get(`${fromRef}->${toRef}`) || null;
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
  edges.forEach((edge, index) => {
    const conditioning = derivedConditioning(board, edge);
    if (conditioning && !edge.tone) edge.tone = "conditioning";
    const contracted = (edge.segments || []).length > 1;

    let pathD;
    let labelPoint;
    let edgeSpan = Number.POSITIVE_INFINITY;
    const routed = state.layoutEdges?.get(index);
    if (routed && routed.length >= 2) {
      pathD = roundedOrthPath(routed);
      labelPoint = polylineMidpoint(routed);
      edgeSpan = Math.hypot(routed.at(-1).x - routed[0].x, routed.at(-1).y - routed[0].y);
    } else {
      const manualRoute = manualEdgeRoute(edge);
      if (manualRoute) {
        pathD = roundedOrthPath(manualRoute);
        labelPoint = polylineMidpoint(manualRoute);
        edgeSpan = Math.hypot(
          manualRoute.at(-1).x - manualRoute[0].x,
          manualRoute.at(-1).y - manualRoute[0].y,
        );
      } else {
        const dockedEdge = edgeDocking(edge);
        if (!dockedEdge) return;
        const { from, to, fromNormal, toNormal } = dockedEdge;
        const reach = clamp(Math.hypot(to.x - from.x, to.y - from.y) * RULES.edgeReach.factor, RULES.edgeReach.min, RULES.edgeReach.max);
        const c1x = from.x + fromNormal.x * reach;
        const c1y = from.y + fromNormal.y * reach;
        const c2x = to.x + toNormal.x * reach;
        const c2y = to.y + toNormal.y * reach;
        pathD = `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
        labelPoint = {
          x: (from.x + to.x) / 2 + (fromNormal.x + toNormal.x) * reach * 0.18,
          y: (from.y + to.y) / 2 + (fromNormal.y + toNormal.y) * reach * 0.18,
        };
        edgeSpan = Math.hypot(to.x - from.x, to.y - from.y);
      }
    }
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

    if (conditioning) {
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badge.setAttribute("x", String(labelPoint.x));
      badge.setAttribute("y", String(labelPoint.y + 4));
      badge.setAttribute("class", "arch-edge-badge");
      badge.textContent = String(conditioning.mode || "").replaceAll("_", " ");
      elements.edgeLayer.appendChild(badge);
    }

    elements.edgeLayer.appendChild(renderEdgeHitTarget(edge, pathD, tooltipPoint));
  });
}

function renderEdgeMarkers() {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  [
    ["edge-arrow-default", "rgba(92, 150, 152, 0.78)"],
    ["edge-arrow-conditioning", "rgba(139, 111, 195, 0.78)"],
    ["edge-arrow-skip", "rgba(207, 93, 69, 0.75)"],
  ].forEach(([id, fill]) => {
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
    arrow.setAttribute("fill", fill);
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

function manualEdgeRoute(edge) {
  if (edge.tone !== "skip") return null;
  const fromBox = nodeBox(edge.from);
  const toBox = nodeBox(edge.to);
  if (!fromBox || !toBox) return null;
  const vertical = Math.abs(toBox.cy - fromBox.cy) > Math.abs(toBox.cx - fromBox.cx);
  if (vertical) {
    const clearance = Number(edge.route_clearance || 54);
    const laneX = Math.max(12, Math.min(fromBox.x, toBox.x) - clearance);
    const from = { x: fromBox.x, y: fromBox.cy };
    const to = { x: toBox.x, y: toBox.cy };
    return [
      from,
      { x: laneX, y: from.y },
      { x: laneX, y: to.y },
      to,
    ];
  }
  const clearance = Number(edge.route_clearance || 42);
  const laneY = Math.max(12, Math.min(fromBox.y, toBox.y) - clearance);
  const from = { x: fromBox.cx, y: fromBox.y };
  const to = { x: toBox.cx, y: toBox.y };
  return [
    from,
    { x: from.x, y: laneY },
    { x: to.x, y: laneY },
    to,
  ];
}

function edgeDocking(edge) {
  const fromBox = nodeBox(edge.from);
  const toBox = nodeBox(edge.to);
  if (!fromBox || !toBox) return null;
  const from = dockPoint(fromBox, toBox);
  const to = dockPoint(toBox, fromBox);
  return {
    from,
    to,
    fromNormal: dockSideNormal(fromBox, from),
    toNormal: dockSideNormal(toBox, to),
  };
}

function dockSideNormal(box, point) {
  const dx = point.x - box.cx;
  const dy = point.y - box.cy;
  if (Math.abs(dx) * box.height > Math.abs(dy) * box.width) {
    return { x: Math.sign(dx) || 1, y: 0 };
  }
  return { x: 0, y: Math.sign(dy) || 1 };
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

function dockPoint(box, towardBox) {
  const dx = towardBox.cx - box.cx;
  const dy = towardBox.cy - box.cy;
  if (dx === 0 && dy === 0) return { x: box.cx, y: box.cy };
  const xScale = dx === 0 ? Number.POSITIVE_INFINITY : box.width / 2 / Math.abs(dx);
  const yScale = dy === 0 ? Number.POSITIVE_INFINITY : box.height / 2 / Math.abs(dy);
  const scale = Math.min(xScale, yScale);
  return {
    x: box.cx + dx * scale,
    y: box.cy + dy * scale,
  };
}

function renderEdgeHitTarget(edge, pathD, point) {
  const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
  hit.setAttribute("d", pathD);
  hit.setAttribute("class", "edge-hit");
  hit.setAttribute("tabindex", "0");
  hit.setAttribute("role", "note");
  hit.setAttribute("aria-label", edge.connection.title);
  hit.addEventListener("mouseenter", () => showConnection(edge, point));
  hit.addEventListener("mouseleave", () => hideConnection());
  hit.addEventListener("focus", () => showConnection(edge, point));
  hit.addEventListener("blur", () => hideConnection());
  hit.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.pinnedEdge === edge) {
      state.pinnedEdge = null;
      hideConnection(true);
    } else {
      state.pinnedEdge = edge;
      showConnection(edge, point);
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

function ensureConnectionTooltip() {
  if (connectionTooltip) return;
  connectionTooltip = document.createElement("div");
  connectionTooltip.className = "connection-tooltip";
  elements.canvas.appendChild(connectionTooltip);
}

function showConnection(edge, point) {
  const canvasRect = elements.canvas.getBoundingClientRect();
  const layerRect = elements.moduleLayer.getBoundingClientRect();
  const x = layerRect.left - canvasRect.left + point.x * viewport.scale;
  const y = layerRect.top - canvasRect.top + point.y * viewport.scale;
  const shouldFlip = x > canvasRect.width - 320;
  const contracted = (edge.segments || []).length > 1;
  const pinned = state.pinnedEdge === edge;
  const hasStandardBlocks = contracted && pinned && hiddenChainStandardBlocks(edge).length > 0;

  connectionTooltip.classList.toggle("is-left", shouldFlip);
  connectionTooltip.classList.toggle("is-pinned", pinned);
  connectionTooltip.classList.toggle("has-standard-blocks", hasStandardBlocks);
  connectionTooltip.classList.add("is-visible");
  connectionTooltip.style.left = `${x}px`;
  connectionTooltip.style.top = `${y}px`;
  connectionTooltip.innerHTML = contracted
    ? contractedTooltipHtml(edge, pinned)
    : `
      <span>${edge.connection.role}</span>
      <strong>${edge.connection.title}</strong>
      <p>${edge.connection.inside}</p>
    `;
  typesetConnectionTooltipMath();

  if (pinned && !state.focusedId) {
    focusConnection(edge);
  }
}

function typesetConnectionTooltipMath() {
  const mathJax = window.MathJax;
  if (!mathJax?.typesetPromise || !connectionTooltip?.innerHTML.includes("math-step")) return;
  mathJax.typesetClear?.([connectionTooltip]);
  mathJax
    .typesetPromise([connectionTooltip])
    .catch((error) => console.warn("MathJax connection tooltip typesetting failed", error));
}

function nodeLabelById(id) {
  const node = (currentBoard().nodes || []).find((candidate) => candidate.id === id);
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

function contractedTooltipHtml(edge, pinned) {
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
      : '<p class="chain-hint">click edge to pin details</p>'}
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

function hideConnection(force = false) {
  if (state.pinnedEdge && !force) return;
  connectionTooltip?.classList.remove("is-visible", "is-pinned", "has-standard-blocks");
  if (force && !state.focusedId) focusOverview();
}

function focusConnection(edge) {
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-node-id="${edge.to}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = edge.connection.title;
  const hops = (edge.segments || []).length > 1
    ? edge.segments.slice(0, -1).map((segment) => nodeLabelById(segment.to)).join(" → ")
    : null;
  setFocusBody(`
    <div class="focus-section">
      <p>${edge.connection.inside}</p>
      <dl class="focus-dl">
        <dt>from</dt><dd>${edge.from}</dd>
        <dt>to</dt><dd>${edge.to}</dd>
        <dt>role</dt><dd>${edge.connection.role}</dd>
        ${hops ? `<dt>via</dt><dd>${hops}</dd>` : ""}
      </dl>
    </div>
  `);
}

function showNodePeek(node, module, expandable) {
  const label = node.label || module?.label || node.id;
  const kind = node.kind === "operation" ? "operation" : module?.kind || node.kind || "module";
  showHoverPanel(`
    <span class="rep-tooltip-meta">${escapeHtml(String(kind).replaceAll("_", " "))}</span>
    <strong class="rep-tooltip-title">${escapeHtml(label)}</strong>
    <div class="focus-section">
      <p>${node.role || module?.role || ""}</p>
      ${expandable ? renderNestedBoardSummary(node.module_ref || node.id) : ""}
      ${module?.contains?.length ? renderContains(module.contains) : ""}
      ${module ? renderAttentionSummary(module) : ""}
      ${module ? renderReferences(module) : ""}
    </div>
  `);
}

function renderNestedBoardSummary(boardId) {
  const board = boardsById.get(boardId);
  if (!board) return "";
  return `
    <div class="zoom-note">
      <strong>${board.title}</strong>
      <span>${board.summary}</span>
    </div>
  `;
}

function focusOverview() {
  state.focusedId = null;
  clearActiveNodes();
  const board = currentBoard();
  elements.focusTitle.textContent = board.title;
  const drillTargets = visibleNodes(board).filter(
    (node) => node.expandable && boardsById.has(node.module_ref || node.id),
  );
  setFocusBody(`
    <div class="focus-section">
      <p>${board.summary}</p>
      ${drillTargets.length
        ? `<h3>Open</h3><div class="summary-grid">${drillTargets.map(renderBoardSummaryNode).join("")}</div>`
        : ""}
      ${board.id === manifest.boards.rootBoard ? renderLanguageSummary() : ""}
      ${board.id === manifest.boards.rootBoard ? renderClaims() : ""}
    </div>
  `);
}

function renderBoardSummaryNode(node) {
  const module = node.module_ref ? modulesById.get(node.module_ref) : null;
  const rep = node.rep_ref ? repsById.get(node.rep_ref) : null;
  const label = node.label || module?.label || rep?.id || node.id;
  const scale = node.scale || module?.scale || rep?.scale || node.kind;
  const detail = module?.kind || node.role || rep?.shape || node.kind;
  return `
    <article class="mini-summary">
      <span>${scale}</span>
      <strong>${label}</strong>
      <em>${detail}</em>
    </article>
  `;
}

function visibleNodes(board) {
  if (editMode) return board.nodes || [];
  return (board.nodes || []).filter(
    (node) => !node.elide && node.prominence !== "hidden" && node.treatment !== "hidden",
  );
}

function renderClaims() {
  return `
    <h3>Claims</h3>
    <ul class="claim-list">
      ${manifest.architecture.claims.map((claim) => `<li>${claim}</li>`).join("")}
    </ul>
  `;
}

function renderLanguageSummary() {
  const loops = manifest.architecture.execution?.loops?.length || 0;
  const states = Object.keys(manifest.architecture.stateSemantics || {}).length;
  const conditioning = manifest.architecture.conditioning?.length || 0;
  const transitions = manifest.architecture.scaleTransitions?.length || 0;
  return `
    <h3>Language Coverage</h3>
    <div class="summary-grid">
      <article class="mini-summary">
        <span>execution</span>
        <strong>${loops} loop${loops === 1 ? "" : "s"}</strong>
        <em>control flow and cached state</em>
      </article>
      <article class="mini-summary">
        <span>state</span>
        <strong>${states} representations</strong>
        <em>mutable vs conditioning semantics</em>
      </article>
      <article class="mini-summary">
        <span>conditioning</span>
        <strong>${conditioning} modes</strong>
        <em>AdaLN, pair bias, additive conditioning</em>
      </article>
      <article class="mini-summary">
        <span>scale</span>
        <strong>${transitions} transitions</strong>
        <em>pooling, compression, broadcast</em>
      </article>
    </div>
  `;
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
  `);
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
  `);
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

function renderReferences(module) {
  const refs = module.evidence?.refs || [];
  if (!refs.length) return "";
  return `
    <h3>References</h3>
    <div class="evidence-list">
      <span class="evidence-badge">${module.evidence.status.replaceAll("_", " ")}</span>
      ${refs.map((ref) => `<code>${shortPath(ref.path)}${ref.lines ? `:${ref.lines}` : ""}</code>`).join("")}
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

function shortPath(path = "") {
  const parts = path.split("/");
  return parts.slice(-2).join("/");
}

function ensurePanZoom() {
  if (!canvasControls) {
    canvasControls = document.createElement("div");
    canvasControls.className = "canvas-controls";
    canvasControls.innerHTML = `
      <button type="button" data-zoom="out" aria-label="Zoom out" title="Zoom out">-</button>
      <button type="button" data-zoom="fit" aria-label="Fit board to view" title="Fit board to view">&rarr;&larr;</button>
      <button type="button" data-zoom="reset" aria-label="Actual size" title="Actual size (1:1)">1:1</button>
      <button type="button" data-zoom="in" aria-label="Zoom in" title="Zoom in">+</button>
    `;
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
  if (event.target.closest(".board-breadcrumbs, .canvas-controls")) return;
  event.preventDefault();
  hideRepPeek();
  state.userMovedViewport = true;
  const factor = Math.exp(-event.deltaY * 0.001);
  zoomAt(event.clientX, event.clientY, factor);
}

function onCanvasPointerDown(event) {
  if (event.button !== 0 && event.button !== 1) return;
  if (event.target.closest(".arch-node, .arch-rep, .edge-hit, .board-breadcrumbs, .canvas-controls")) return;
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
  zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
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
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

window.addEventListener("resize", renderEdges);
render();
