import { manifest } from "./manifest.js";

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

let connectionTooltip = null;
let breadcrumbs = null;
let canvasControls = null;

const state = {
  focusedId: null,
  focusHasMath: false,
  boardStack: [manifest.boards.rootBoard],
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
  ensureBoardChrome();
  renderBoard();
  focusOverview();
}

window.addEventListener("mathjax-ready", () => typesetMath());

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
  ensurePanZoom();
}

function currentBoard() {
  return boardsById.get(state.boardStack.at(-1)) || boardsById.get(manifest.boards.rootBoard);
}

function renderBoard() {
  const board = currentBoard();
  elements.moduleLayer.innerHTML = "";
  elements.edgeLayer.innerHTML = "";
  elements.moduleLayer.style.setProperty("--board-columns", String(board.grid?.columns || 5));
  elements.moduleLayer.style.setProperty("--board-rows", String(board.grid?.rows || 4));
  elements.canvas.classList.toggle("is-abstract-board", board.scale_lanes === false);

  renderBreadcrumbs();
  for (const node of visibleNodes(board)) {
    elements.moduleLayer.appendChild(renderNode(node));
  }
  applyViewport();
  window.requestAnimationFrame(renderEdges);
}

function renderBreadcrumbs() {
  breadcrumbs.innerHTML = "";
  state.boardStack.forEach((boardId, index) => {
    const board = boardsById.get(boardId);
    if (!board) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "breadcrumb-node";
    button.textContent = board.title;
    button.disabled = index === state.boardStack.length - 1;
    button.addEventListener("click", () => popToBoard(index));
    breadcrumbs.appendChild(button);
  });
}

function renderNode(node) {
  if (node.kind === "representation") return renderRepresentationNode(node);
  return renderBlockNode(node);
}

function renderRepresentationNode(node) {
  const rep = node.rep_ref ? repsById.get(node.rep_ref) : null;
  const scale = node.scale || rep?.scale || "token";
  const label = node.label || rep?.id || node.id;
  const role = node.role || rep?.semantic_role || "";
  const shape = node.shape || rep?.shape || "";
  const prominence = node.prominence || "secondary";
  const treatment = node.treatment || "block";
  const density = node.density || "normal";
  const card = document.createElement("article");
  card.className = `arch-rep scale-${scale} prominence-${prominence} treatment-${treatment} density-${density}`;
  card.dataset.nodeId = node.id;
  placeNode(card, node);
  if (treatment === "chip" || density === "micro") {
    card.innerHTML = `
      <span>${scale}</span>
      <strong>${label}</strong>
    `;
    return card;
  }
  card.innerHTML = `
    <span>${scale}</span>
    <strong>${label}</strong>
    <em>${role}</em>
    ${shape ? `<code>${shape}</code>` : ""}
  `;
  return card;
}

function renderBlockNode(node) {
  const module = node.module_ref ? modulesById.get(node.module_ref) : null;
  const scale = node.scale || module?.scale || "token";
  const expandable = Boolean(node.expandable && boardsById.has(node.module_ref || node.id));
  const prominence = node.prominence || "secondary";
  const treatment = node.treatment || "block";
  const density = node.density || "normal";
  const card = document.createElement("button");
  card.type = "button";
  card.className = `arch-node scale-${scale} prominence-${prominence} treatment-${treatment} density-${density}`;
  if (node.kind === "operation") card.classList.add("is-operation");
  if (expandable) card.classList.add("is-expandable");
  card.dataset.nodeId = node.id;
  if (module) card.dataset.moduleId = module.id;
  placeNode(card, node);
  card.innerHTML = blockCardHtml(node, module, expandable);
  card.addEventListener("mouseenter", () => showNodePeek(node, module, expandable));
  card.addEventListener("mouseleave", () => {
    if (!state.focusedId) focusOverview();
  });
  card.addEventListener("click", () => {
    if (expandable) {
      pushBoard(node.module_ref || node.id);
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

function pushBoard(boardId) {
  if (!boardsById.has(boardId)) return;
  state.boardStack.push(boardId);
  state.focusedId = null;
  resetViewport();
  hideConnection();
  renderBoard();
  focusOverview();
}

function popToBoard(index) {
  state.boardStack = state.boardStack.slice(0, index + 1);
  state.focusedId = null;
  resetViewport();
  hideConnection();
  renderBoard();
  focusOverview();
}

function renderEdges() {
  const board = currentBoard();
  const width = elements.moduleLayer.offsetWidth;
  const height = elements.moduleLayer.offsetHeight;
  elements.edgeLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.edgeLayer.innerHTML = "";

  for (const edge of board.edges || []) {
    const dockedEdge = edgeDocking(edge);
    if (!dockedEdge) continue;
    const { from, to } = dockedEdge;
    const midX = (from.x + to.x) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`);
    path.setAttribute("class", "arch-edge");
    applyEdgeTone(path, edge);
    elements.edgeLayer.appendChild(path);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", String(midX));
    label.setAttribute("y", String((from.y + to.y) / 2 - 12));
    label.setAttribute("class", "arch-edge-label");
    applyEdgeTone(label, edge);
    label.textContent = edge.label;
    elements.edgeLayer.appendChild(label);

    elements.edgeLayer.appendChild(renderConnectionPort(edge, to));
  }
}

function edgeDocking(edge) {
  const fromBox = nodeBox(edge.from);
  const toBox = nodeBox(edge.to);
  if (!fromBox || !toBox) return null;
  return {
    from: dockPoint(fromBox, toBox),
    to: dockPoint(toBox, fromBox),
  };
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

function renderConnectionPort(edge, point) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("class", "edge-port");
  applyEdgeTone(group, edge);
  group.setAttribute("transform", `translate(${point.x} ${point.y})`);
  group.setAttribute("tabindex", "0");
  group.setAttribute("role", "note");
  group.setAttribute("aria-label", edge.connection.title);

  const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hit.setAttribute("class", "edge-port-hit");
  hit.setAttribute("r", "15");
  group.appendChild(hit);

  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("class", "edge-port-dot");
  dot.setAttribute("r", "5");
  group.appendChild(dot);

  group.addEventListener("mouseenter", () => showConnection(edge, point));
  group.addEventListener("mouseleave", hideConnection);
  group.addEventListener("focus", () => showConnection(edge, point));
  group.addEventListener("blur", hideConnection);
  return group;
}

function applyEdgeTone(element, edge) {
  if (edge.tone === "conditioning" || edge.from.includes("pair")) {
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
  connectionTooltip.classList.toggle("is-left", shouldFlip);
  connectionTooltip.classList.add("is-visible");
  connectionTooltip.style.left = `${x}px`;
  connectionTooltip.style.top = `${y}px`;
  connectionTooltip.innerHTML = `
    <span>${edge.connection.role}</span>
    <strong>${edge.connection.title}</strong>
    <p>${edge.connection.inside}</p>
  `;
  if (!state.focusedId) focusConnection(edge);
}

function hideConnection() {
  connectionTooltip?.classList.remove("is-visible");
  if (!state.focusedId) focusOverview();
}

function focusConnection(edge) {
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-node-id="${edge.to}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = edge.connection.title;
  setFocusBody(`
    <div class="focus-section">
      <p>${edge.connection.inside}</p>
      <dl class="focus-dl">
        <dt>from</dt><dd>${edge.from}</dd>
        <dt>to</dt><dd>${edge.to}</dd>
        <dt>role</dt><dd>${edge.connection.role}</dd>
      </dl>
    </div>
  `);
}

function showNodePeek(node, module, expandable) {
  if (state.focusedId) return;
  const label = node.label || module?.label || node.id;
  elements.focusTitle.textContent = label;
  setFocusBody(`
    <div class="focus-section">
      <p>${node.role || module?.role || ""}</p>
      ${expandable ? renderNestedBoardSummary(node.module_ref || node.id) : ""}
      ${module?.contains?.length ? renderContains(module.contains) : ""}
      ${module ? renderAttentionSummary(module) : ""}
      ${module ? renderEvidence(module) : ""}
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
  setFocusBody(`
    <div class="focus-section">
      <p>${board.summary}</p>
      <div class="summary-grid">
        ${visibleNodes(board).map(renderBoardSummaryNode).join("")}
      </div>
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
  return (board.nodes || []).filter((node) => node.prominence !== "hidden" && node.treatment !== "hidden");
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
        <em>diffusion pass and recycle loop</em>
      </article>
      <article class="mini-summary">
        <span>state</span>
        <strong>${states} representations</strong>
        <em>atom/token/pair semantics</em>
      </article>
      <article class="mini-summary">
        <span>conditioning</span>
        <strong>${conditioning} modes</strong>
        <em>pair bias, AdaLN, coordinates</em>
      </article>
      <article class="mini-summary">
        <span>scale</span>
        <strong>${transitions} transitions</strong>
        <em>atom-to-token and token-to-atom</em>
      </article>
    </div>
  `;
}

function focusModule(module) {
  state.focusedId = module.id;
  clearActiveNodes();
  elements.moduleLayer.querySelector(`[data-module-id="${module.id}"]`)?.classList.add("is-focused");
  elements.focusTitle.textContent = module.label;
  setFocusBody(`
    <div class="focus-section">
      <p>${module.role}</p>
      ${renderAttentionSummary(module)}
      ${renderContains(module.contains || [])}
      ${renderStandardBlocks(module)}
      ${module.pseudocode_ref ? renderPseudocode(module) : ""}
      ${renderEvidence(module)}
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

function renderStandardBlocks(module) {
  const children = module.contains?.filter((child) => child.standard_block_ref) || [];
  if (!children.length) return "";
  return children.map((child) => {
    const block = manifest.standardBlocks[standardBlockIdFromRef(child.standard_block_ref)];
    if (!block) return "";
    if (block.id === "pair_biased_attention") return renderPairBiasedAttentionBlock(block);
    return renderStandardBlock(block);
  }).join("");
}

function standardBlockIdFromRef(ref = "") {
  const file = ref.split("/").at(-1) || "";
  return file.replace(/\.yaml$/, "").replaceAll("-", "_");
}

function renderStandardBlock(block) {
  return `
    <h3>${block.name}</h3>
    <p>${block.description}</p>
    <ol class="math-list">
      ${block.math.map(renderMathStep).join("")}
    </ol>
  `;
}

function renderPairBiasedAttentionBlock(block) {
  return `
    <h3>${block.name}</h3>
    <div class="pair-block">
      <div class="pair-matrix qk">QK logits</div>
      <div class="pair-plus">+</div>
      <div class="pair-matrix bias">Linear(pair)</div>
      <div class="pair-arrow">softmax</div>
      <div class="pair-matrix weights">weights @ V</div>
    </div>
    <ol class="math-list">
      ${block.math.map(renderMathStep).join("")}
    </ol>
  `;
}

function renderPseudocode(module) {
  const program = Object.values(manifest.pseudocode)[0];
  if (!program) return "";
  const ids = module.pseudocode_line_ids || [];
  const lines = ids.length > 0
    ? program.lines.filter((line) => ids.includes(line.id))
    : program.lines.slice(0, 4);
  if (!lines.length) return "";
  return `
    <h3>Pseudocode trace</h3>
    <ol class="pseudo-lines">
      ${lines.map((line) => `<li><code>${line.text}</code><span>${line.refs}</span></li>`).join("")}
    </ol>
  `;
}

function renderEvidence(module) {
  const refs = module.evidence?.refs || [];
  if (!refs.length) return "";
  return `
    <h3>Evidence</h3>
    <div class="evidence-list">
      <span class="evidence-badge">${module.evidence.status.replaceAll("_", " ")}</span>
      ${refs.map((ref) => `<code>${shortPath(ref.path)}:${ref.lines}</code>`).join("")}
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
      <button type="button" data-zoom="reset" aria-label="Reset view" title="Reset view">1:1</button>
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
    resetViewport();
    return;
  }
  zoomAtCanvasCenter(action === "in" ? 1.18 : 1 / 1.18);
}

function onCanvasWheel(event) {
  if (event.target.closest(".board-breadcrumbs, .canvas-controls")) return;
  event.preventDefault();
  const factor = Math.exp(-event.deltaY * 0.001);
  zoomAt(event.clientX, event.clientY, factor);
}

function onCanvasPointerDown(event) {
  if (event.button !== 0 && event.button !== 1) return;
  if (event.target.closest(".arch-node, .arch-rep, .edge-port, .board-breadcrumbs, .canvas-controls")) return;
  viewport.isPanning = true;
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
