const N_ATOMS = 256;
const QUERY_CHUNK = 32;
const KEY_WINDOW = 128;
const PAD_START = 232;

const codeLines = [
  "inputs: atom features a_1..a_N in flattened atom layout",
  "query_subset_size = 32; key_value_subset_size = 128",
  "for q0 in range(0, N, query_subset_size):",
  "  Q = atoms[q0 : q0 + 32]",
  "  K,V = local_window(atoms, center(Q), size=128)",
  "  logits = Linear(Q) @ Linear(K)^T + atom_pair_bias",
  "  logits = mask_invalid_atoms_and_padding(logits)",
  "  weights = softmax(logits, axis=key_atoms)",
  "  updated_Q = weights @ Linear(V)",
  "  write updated_Q back to the same 32 query atom slots",
];

const steps = [
  {
    id: "layout",
    phase: "Atom layout",
    title: "Atoms are flattened before local attention",
    body:
      "The atom attention axis is a flat atom list. The local window is local in that layout, not a nearest-neighbor search in 3D coordinates.",
    equation: "atoms = flatten(tokens)",
    lines: [1],
    mode: "layout",
    block: 2,
    caption:
      "The lower strip is the atom axis. The matrix above uses the same atom index on both axes.",
    vars: {
      "atom axis": "N atoms after token/atom layout construction",
      locality: "contiguous atom indices",
      caveat: "not a 3D nearest-neighbor graph",
    },
    view: { fullMask: false, query: false, key: false, activeRows: false },
  },
  {
    id: "sizes",
    phase: "Window sizes",
    title: "The two sizes answer different questions",
    body:
      "The 32 is how many query atoms are updated as one block. The 128 is how many key/value atoms those query rows can read from.",
    equation: "Q: 32 atoms; K,V: 128 atoms",
    lines: [2],
    mode: "32 vs 128",
    block: 2,
    caption:
      "Think of a narrow update block looking through a wider local context window.",
    vars: {
      "query subset": "32 rows",
      "key/value subset": "128 columns",
      "attention shape": "32 x 128 before writing back",
    },
    view: { query: true, key: true, activeRows: true },
  },
  {
    id: "query-block",
    phase: "Query block",
    title: "Pick one 32-row query block",
    body:
      "For a block starting at q0, only those 32 query atom rows are being updated in this slice of the computation.",
    equation: "Q = atoms[q0 : q0 + 32]",
    lines: [3, 4],
    mode: "query rows",
    block: 2,
    caption:
      "The orange horizontal band marks the active query rows in the attention mask.",
    vars: {
      q0: "64",
      "query rows": "64..95",
      writeback: "updated values return to rows 64..95",
    },
    view: { query: true, activeRows: true, rowFocus: true },
  },
  {
    id: "key-window",
    phase: "Key/value window",
    title: "Gather a 128-column local context",
    body:
      "The key/value window is wider than the query block. It is centered near the query block and clamped near sequence ends.",
    equation: "K,V = local_window(center(Q), 128)",
    lines: [5],
    mode: "key columns",
    block: 2,
    caption:
      "The blue vertical band marks the local key/value atoms visible to the active query block.",
    vars: {
      center: "80",
      "key columns": "16..143",
      clamp: "edge blocks shift inward instead of shrinking first",
    },
    view: { query: true, key: true, activeRows: true, colFocus: true },
  },
  {
    id: "mask",
    phase: "Attention mask",
    title: "The mask is a 32 by 128 rectangle",
    body:
      "Inside this slice, every query atom in the 32-row block can attend to the same 128 key/value atoms.",
    equation: "mask[64:96, 16:144] = visible",
    lines: [6, 7],
    mode: "mask cells",
    block: 2,
    caption:
      "Rows outside the orange query block are not computed in this slice. Columns outside the blue window are masked.",
    vars: {
      "computed logits": "32 * 128",
      "masked columns": "all atoms outside 16..143",
      "shared window": "same 128 keys for all 32 query rows",
    },
    view: { query: true, key: true, activeRows: true, cells: true },
  },
  {
    id: "shift",
    phase: "Sliding blocks",
    title: "Move one block and the window shifts by 32",
    body:
      "The next query block updates the next 32 rows. Its 128-key window shifts along the atom axis rather than becoming a disjoint block.",
    equation: "q0 = q0 + 32",
    lines: [3, 4, 5],
    mode: "shift",
    block: 3,
    caption:
      "The current block moved from rows 64..95 to rows 96..127, and its key window moved with it.",
    vars: {
      "new query rows": "96..127",
      "new key columns": "32..159",
      stride: "32 query atoms",
    },
    view: { query: true, key: true, activeRows: true, cells: true, previous: true },
  },
  {
    id: "overlap",
    phase: "Overlap",
    title: "Neighboring windows overlap heavily",
    body:
      "Because the key window is four times wider than the query stride, adjacent query blocks share most of their readable context.",
    equation: "overlap = 128 - 32 = 96 atoms",
    lines: [5],
    mode: "overlap",
    block: 3,
    caption:
      "The purple region is visible to both neighboring query blocks.",
    vars: {
      overlap: "96 atoms for adjacent interior blocks",
      reason: "128 key width, 32 query stride",
      effect: "local context changes smoothly between blocks",
    },
    view: { query: true, key: true, activeRows: true, cells: true, previous: true, overlap: true },
  },
  {
    id: "padding",
    phase: "Invalid atoms",
    title: "Padding still masks individual atoms",
    body:
      "The local window gives candidate key/value columns, but invalid atoms, padding, and layout masks still remove cells before softmax.",
    equation: "logits[invalid] = -inf",
    lines: [7],
    mode: "padding mask",
    block: 6,
    caption:
      "The right edge shows padded atom slots. Even if a local window reaches them, they are not valid attention targets.",
    vars: {
      "padded atoms": "232..255 in this toy view",
      operation: "set invalid logits to -inf",
      result: "softmax ignores invalid columns",
    },
    view: { fullMask: true, query: true, key: true, activeRows: true, cells: true, padding: true },
  },
  {
    id: "softmax",
    phase: "Softmax",
    title: "Softmax runs across keys for each query row",
    body:
      "Each query atom gets its own distribution over the valid atoms in the 128-column window. The weighted value sum updates that query atom.",
    equation: "updated_Q = softmax(logits)_rows @ V",
    lines: [8, 9, 10],
    mode: "row weights",
    block: 3,
    caption:
      "The highlighted row is one query atom. Its softmax normalizes over the visible key columns in that row.",
    vars: {
      "one row": "one query atom",
      normalization: "sum over valid key columns = 1",
      output: "one updated atom feature per query row",
    },
    view: { query: true, key: true, activeRows: true, cells: true, rowWeights: true },
  },
  {
    id: "depth",
    phase: "Stack depth",
    title: "Depth carries information farther than one window",
    body:
      "One atom-attention slice is local. Across adjacent overlapping blocks and repeated layers, information can propagate beyond a single 128-atom window.",
    equation: "local now; wider receptive field over layers",
    lines: [10],
    mode: "propagation",
    block: 3,
    caption:
      "The mask stays local per layer, but repeated local mixing expands the effective receptive field.",
    vars: {
      "per layer": "local 128-key read",
      "across blocks": "overlapping windows share information",
      "across depth": "features can move farther step by step",
    },
    view: { fullMask: true, query: true, key: true, activeRows: true, cells: true, previous: true, overlap: true, propagation: true },
  },
];

const elements = {
  stepCounter: document.getElementById("stepCounter"),
  stepPhase: document.getElementById("stepPhase"),
  stepTitle: document.getElementById("stepTitle"),
  stepBody: document.getElementById("stepBody"),
  stepEquation: document.getElementById("stepEquation"),
  codeList: document.getElementById("codeList"),
  activeLines: document.getElementById("activeLines"),
  variableList: document.getElementById("variableList"),
  sceneMode: document.getElementById("sceneMode"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneCaption: document.getElementById("sceneCaption"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  progressTrack: document.getElementById("progressTrack"),
  canvas: document.getElementById("maskCanvas"),
  overlay: document.getElementById("sceneOverlay"),
};

const colors = {
  ink: "#1d2424",
  muted: "#64716d",
  grid: "#d8dfdc",
  cell: "#2b8b92",
  cellSoft: "rgba(43,139,146,0.2)",
  query: "#d05b3f",
  key: "#2a6fbb",
  overlap: "#7f63b8",
  padding: "#9aa39f",
  weight: "#16815f",
  propagation: "#c47b20",
  background: "#fbfaf6",
};

const state = {
  stepIndex: 0,
  pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
};

function clampWindow(q0) {
  const q1 = Math.min(q0 + QUERY_CHUNK, N_ATOMS);
  const center = Math.floor((q0 + q1) / 2);
  let k0 = Math.max(0, center - Math.floor(KEY_WINDOW / 2));
  let k1 = Math.min(N_ATOMS, k0 + KEY_WINDOW);
  k0 = Math.max(0, k1 - KEY_WINDOW);
  k1 = Math.min(N_ATOMS, k0 + KEY_WINDOW);
  return { q0, q1, k0, k1, center };
}

function initCode() {
  elements.codeList.innerHTML = "";
  for (const line of codeLines) {
    const item = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = line;
    item.appendChild(span);
    elements.codeList.appendChild(item);
  }
}

function initProgress() {
  elements.progressTrack.innerHTML = "";
  for (let i = 0; i < steps.length; i += 1) {
    const button = document.createElement("button");
    button.className = "progress-dot";
    button.type = "button";
    button.setAttribute("aria-label", `Go to step ${i + 1}`);
    button.addEventListener("click", () => setStep(i));
    elements.progressTrack.appendChild(button);
  }
}

function formatLineRange(lines) {
  if (lines.length === 1) return `line ${lines[0]}`;
  return `lines ${lines[0]}-${lines[lines.length - 1]}`;
}

function setStep(index) {
  state.stepIndex = Math.max(0, Math.min(steps.length - 1, index));
  renderStep();
}

function renderStep() {
  const step = steps[state.stepIndex];
  elements.stepCounter.textContent = `${state.stepIndex + 1} / ${steps.length}`;
  elements.stepPhase.textContent = step.phase;
  elements.stepTitle.textContent = step.title;
  elements.stepBody.textContent = step.body;
  elements.stepEquation.textContent = step.equation;
  elements.activeLines.textContent = formatLineRange(step.lines);
  elements.sceneMode.textContent = step.mode;
  elements.sceneTitle.textContent = step.title;
  elements.sceneCaption.textContent = step.caption;

  const active = new Set(step.lines);
  [...elements.codeList.children].forEach((item, index) => {
    const line = index + 1;
    item.classList.toggle("active", active.has(line));
    item.classList.toggle("dim", !active.has(line));
  });

  elements.variableList.innerHTML = "";
  for (const [key, value] of Object.entries(step.vars)) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = key;
    dd.textContent = value;
    elements.variableList.append(dt, dd);
  }

  [...elements.progressTrack.children].forEach((dot, index) => {
    dot.classList.toggle("active", index <= state.stepIndex);
  });

  elements.prevButton.disabled = state.stepIndex === 0;
  elements.nextButton.disabled = state.stepIndex === steps.length - 1;

  renderOverlay(step);
  drawMask(step);
}

function renderOverlay(step) {
  const block = clampWindow(step.block * QUERY_CHUNK);
  const previous = clampWindow(Math.max(0, (step.block - 1) * QUERY_CHUNK));
  const overlapStart = Math.max(block.k0, previous.k0);
  const overlapEnd = Math.min(block.k1, previous.k1);

  elements.overlay.innerHTML = `
    <div class="scene-card atom-size-card">
      <strong>current slice</strong>
      <span>query rows: ${block.q0}..${block.q1 - 1}</span>
      <span>key cols: ${block.k0}..${block.k1 - 1}</span>
      <span>logit block: ${QUERY_CHUNK} x ${KEY_WINDOW}</span>
    </div>
  `;

  if (step.view.overlap) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card atom-overlap-card">
        <strong>neighbor overlap</strong>
        <span>${overlapStart}..${overlapEnd - 1}</span>
        <span>${Math.max(0, overlapEnd - overlapStart)} shared key atoms</span>
      </div>`,
    );
  }

  if (step.view.padding) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card atom-padding-card">
        <strong>padding mask</strong>
        <span>atoms ${PAD_START}..${N_ATOMS - 1}</span>
        <span>invalid columns stay dark</span>
      </div>`,
    );
  }

  if (step.view.rowWeights) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card atom-softmax-card">
        <strong>one query row</strong>
        <div class="mini-vector atom-weights">
          <i style="height:16px"></i><i style="height:29px"></i><i style="height:54px"></i>
          <i style="height:22px"></i><i style="height:39px"></i><i style="height:18px"></i>
        </div>
        <div>softmax over visible key columns</div>
      </div>`,
    );
  }

  if (step.view.propagation) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card atom-depth-card">
        <strong>over depth</strong>
        <span>local updates repeat</span>
        <span>effective field grows layer by layer</span>
      </div>`,
    );
  }
}

function drawMask(step) {
  const canvas = elements.canvas;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(320, Math.floor(rect.height));
  canvas.width = Math.floor(width * state.pixelRatio);
  canvas.height = Math.floor(height * state.pixelRatio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const margin = {
    left: width < 640 ? 42 : 62,
    right: 24,
    top: 38,
    bottom: width < 640 ? 86 : 96,
  };
  const matrixSize = Math.min(
    width - margin.left - margin.right,
    height - margin.top - margin.bottom,
  );
  const x0 = margin.left + (width - margin.left - margin.right - matrixSize) / 2;
  const y0 = margin.top;
  const cell = matrixSize / N_ATOMS;
  const active = clampWindow(step.block * QUERY_CHUNK);
  const prev = clampWindow(Math.max(0, (step.block - 1) * QUERY_CHUNK));

  drawBackground(ctx, x0, y0, matrixSize, cell);

  if (step.view.fullMask || step.view.cells) {
    drawAllWindows(ctx, x0, y0, cell, step.view.fullMask ? 0.2 : 0.08);
  }

  if (step.view.previous) {
    drawWindowCells(ctx, x0, y0, cell, prev, colors.cellSoft);
    drawRectOutline(ctx, x0, y0, cell, prev.k0, prev.q0, prev.k1 - prev.k0, prev.q1 - prev.q0, colors.muted, 1.5);
  }

  if (step.view.overlap) {
    const overlapStart = Math.max(active.k0, prev.k0);
    const overlapEnd = Math.min(active.k1, prev.k1);
    drawColumnBand(ctx, x0, y0, cell, overlapStart, overlapEnd, colors.overlap, 0.24);
  }

  if (step.view.key) {
    drawColumnBand(ctx, x0, y0, cell, active.k0, active.k1, colors.key, 0.16);
  }

  if (step.view.query || step.view.activeRows) {
    drawRowBand(ctx, x0, y0, cell, active.q0, active.q1, colors.query, 0.16);
  }

  if (step.view.cells) {
    drawWindowCells(ctx, x0, y0, cell, active, "rgba(43, 139, 146, 0.72)");
  }

  if (step.view.padding) {
    drawPadding(ctx, x0, y0, cell);
  }

  if (step.view.rowWeights) {
    drawFocusedRow(ctx, x0, y0, cell, active);
  }

  if (step.view.propagation) {
    drawPropagation(ctx, x0, y0, cell, active);
  }

  if (step.view.rowFocus) {
    drawRectOutline(ctx, x0, y0, cell, 0, active.q0, N_ATOMS, active.q1 - active.q0, colors.query, 2.5);
  }

  if (step.view.colFocus) {
    drawRectOutline(ctx, x0, y0, cell, active.k0, 0, active.k1 - active.k0, N_ATOMS, colors.key, 2.5);
  }

  drawRectOutline(ctx, x0, y0, cell, active.k0, active.q0, active.k1 - active.k0, active.q1 - active.q0, colors.ink, 2);
  drawAxes(ctx, x0, y0, matrixSize);
  drawAtomTrack(ctx, x0, y0 + matrixSize + 32, matrixSize, active, prev, step);
}

function drawBackground(ctx, x0, y0, size, cell) {
  ctx.fillStyle = colors.background;
  roundRect(ctx, x0 - 10, y0 - 10, size + 20, size + 20, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x0, y0, size, size);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let atom = 0; atom <= N_ATOMS; atom += 32) {
    const pos = x0 + atom * cell;
    ctx.beginPath();
    ctx.moveTo(pos, y0);
    ctx.lineTo(pos, y0 + size);
    ctx.stroke();

    const row = y0 + atom * cell;
    ctx.beginPath();
    ctx.moveTo(x0, row);
    ctx.lineTo(x0 + size, row);
    ctx.stroke();
  }
}

function drawAllWindows(ctx, x0, y0, cell, opacity) {
  for (let q0 = 0; q0 < N_ATOMS; q0 += QUERY_CHUNK) {
    const block = clampWindow(q0);
    drawWindowCells(ctx, x0, y0, cell, block, `rgba(43, 139, 146, ${opacity})`);
  }
}

function drawWindowCells(ctx, x0, y0, cell, block, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    x0 + block.k0 * cell,
    y0 + block.q0 * cell,
    (block.k1 - block.k0) * cell,
    (block.q1 - block.q0) * cell,
  );
}

function drawColumnBand(ctx, x0, y0, cell, start, end, color, opacity) {
  ctx.fillStyle = withAlpha(color, opacity);
  ctx.fillRect(x0 + start * cell, y0, (end - start) * cell, N_ATOMS * cell);
}

function drawRowBand(ctx, x0, y0, cell, start, end, color, opacity) {
  ctx.fillStyle = withAlpha(color, opacity);
  ctx.fillRect(x0, y0 + start * cell, N_ATOMS * cell, (end - start) * cell);
}

function drawPadding(ctx, x0, y0, cell) {
  ctx.fillStyle = "rgba(95, 105, 101, 0.22)";
  ctx.fillRect(x0 + PAD_START * cell, y0, (N_ATOMS - PAD_START) * cell, N_ATOMS * cell);
  ctx.fillRect(x0, y0 + PAD_START * cell, N_ATOMS * cell, (N_ATOMS - PAD_START) * cell);

  ctx.strokeStyle = colors.padding;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(
    x0 + PAD_START * cell,
    y0,
    (N_ATOMS - PAD_START) * cell,
    N_ATOMS * cell,
  );
  ctx.setLineDash([]);
}

function drawFocusedRow(ctx, x0, y0, cell, block) {
  const row = block.q0 + 12;
  ctx.fillStyle = "rgba(22, 129, 95, 0.28)";
  ctx.fillRect(x0 + block.k0 * cell, y0 + row * cell, (block.k1 - block.k0) * cell, Math.max(2, cell * 2));

  ctx.strokeStyle = colors.weight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0 + block.k0 * cell, y0 + row * cell + cell);
  ctx.lineTo(x0 + block.k1 * cell, y0 + row * cell + cell);
  ctx.stroke();
}

function drawPropagation(ctx, x0, y0, cell, block) {
  ctx.strokeStyle = colors.propagation;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 6]);
  for (let radius = 1; radius <= 2; radius += 1) {
    const k0 = Math.max(0, block.k0 - radius * QUERY_CHUNK);
    const k1 = Math.min(N_ATOMS, block.k1 + radius * QUERY_CHUNK);
    const q0 = Math.max(0, block.q0 - radius * QUERY_CHUNK);
    const q1 = Math.min(N_ATOMS, block.q1 + radius * QUERY_CHUNK);
    ctx.strokeRect(
      x0 + k0 * cell,
      y0 + q0 * cell,
      (k1 - k0) * cell,
      (q1 - q0) * cell,
    );
  }
  ctx.setLineDash([]);
}

function drawRectOutline(ctx, x0, y0, cell, col, row, width, height, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x0 + col * cell, y0 + row * cell, width * cell, height * cell);
}

function drawAxes(ctx, x0, y0, size) {
  ctx.fillStyle = colors.muted;
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("key/value atom index", x0 + size / 2, y0 - 16);

  ctx.save();
  ctx.translate(x0 - 34, y0 + size / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("query atom index", 0, 0);
  ctx.restore();

  ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  for (let atom = 0; atom <= N_ATOMS; atom += 64) {
    ctx.fillText(String(atom), x0 + atom * (size / N_ATOMS), y0 + size + 16);
    ctx.save();
    ctx.translate(x0 - 13, y0 + atom * (size / N_ATOMS) + 3);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(String(atom), 0, 0);
    ctx.restore();
  }
}

function drawAtomTrack(ctx, x0, y0, width, active, prev, step) {
  const trackH = 18;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x0, y0, width, trackH, 5);
  ctx.fill();
  ctx.strokeStyle = colors.grid;
  ctx.stroke();

  const toX = (atom) => x0 + (atom / N_ATOMS) * width;
  if (step.view.previous) {
    ctx.fillStyle = "rgba(100,113,109,0.2)";
    ctx.fillRect(toX(prev.k0), y0, toX(prev.k1) - toX(prev.k0), trackH);
  }
  if (step.view.key) {
    ctx.fillStyle = "rgba(42,111,187,0.28)";
    ctx.fillRect(toX(active.k0), y0, toX(active.k1) - toX(active.k0), trackH);
  }
  if (step.view.query) {
    ctx.fillStyle = colors.query;
    ctx.fillRect(toX(active.q0), y0 - 5, toX(active.q1) - toX(active.q0), trackH + 10);
  }
  if (step.view.padding) {
    ctx.fillStyle = "rgba(95,105,101,0.34)";
    ctx.fillRect(toX(PAD_START), y0, toX(N_ATOMS) - toX(PAD_START), trackH);
  }

  ctx.fillStyle = colors.muted;
  ctx.font = "800 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("atom axis", x0, y0 + 43);
  ctx.textAlign = "right";
  ctx.fillText(`${N_ATOMS} toy atoms`, x0 + width, y0 + 43);
}

function withAlpha(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

elements.prevButton.addEventListener("click", () => setStep(state.stepIndex - 1));
elements.nextButton.addEventListener("click", () => setStep(state.stepIndex + 1));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") setStep(state.stepIndex - 1);
  if (event.key === "ArrowRight") setStep(state.stepIndex + 1);
});

const resizeObserver = new ResizeObserver(() => drawMask(steps[state.stepIndex]));
resizeObserver.observe(elements.canvas);
window.addEventListener("resize", () => drawMask(steps[state.stepIndex]));

initCode();
initProgress();
setStep(0);
