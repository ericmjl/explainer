const codeLines = [
  "inputs: noisy atom coordinates, atom features, token conditioning",
  "atom_tokens = AtomAttentionEncoder(atoms, local_atom_windows)",
  "for block in 1..24:",
  "  token_repr = DiffusionTransformerBlock(token_repr, full_token_attention)",
  "atom_updates = AtomAttentionDecoder(atom_tokens, token_repr, local_atom_windows)",
  "return denoised atom coordinate update",
];

const moduleInfo = {
  overview: {
    title: "Diffusion module",
    body:
      "The coarse map has two atom-local stages around one full-token stage. Encoder lifts local atom context to tokens; the token core mixes globally; decoder writes token-conditioned updates back to atoms.",
    href: "../af3-local-atom-attention/",
    linkText: "Open local atom story",
  },
  encoder: {
    title: "AtomAttentionEncoder",
    body:
      "The encoder runs sequence-local atom attention with 3 blocks and 4 heads. This is where atom neighborhoods are read before information is handed to the token-level path.",
    href: "../af3-local-atom-attention/",
    linkText: "Open local atom story",
  },
  token: {
    title: "DiffusionTransformer",
    body:
      "The middle core runs full token self-attention with 24 blocks and 16 heads. This is the global token mixing stage, not the local atom-window stage.",
    href: "",
    linkText: "Token detail pending",
  },
  decoder: {
    title: "AtomAttentionDecoder",
    body:
      "The decoder returns from token context to atom-level updates using sequence-local atom attention again: 3 blocks, 4 heads, local atom windows.",
    href: "../af3-local-atom-attention/",
    linkText: "Open local atom story",
  },
};

const steps = [
  {
    id: "overview",
    phase: "Coarse map",
    title: "Three stages, two attention scales",
    body:
      "The diffusion module alternates between atom-local processing, full token-level processing, and atom-local decoding.",
    equation: "atoms -> tokens -> atoms",
    lines: [1, 2, 3, 4, 5, 6],
    mode: "overview",
    module: "overview",
    caption:
      "The graph separates local atom windows from full token self-attention.",
    vars: {
      "atom scale": "sequence-local atom attention",
      "token scale": "full token self-attention",
      structure: "encoder -> transformer -> decoder",
    },
  },
  {
    id: "encoder",
    phase: "Atom encoder",
    title: "The encoder reads local atom windows",
    body:
      "AtomAttentionEncoder is a local atom-attention stack. It operates before the full token transformer and uses the same local-window idea as the fine-grained atom story.",
    equation: "AtomAttentionEncoder: Nblock = 3, Nhead = 4",
    lines: [2],
    mode: "atom local",
    module: "encoder",
    caption:
      "Encoder cards drill down to the local atom attention mask story.",
    vars: {
      module: "AtomAttentionEncoder",
      attention: "sequence-local atom attention",
      depth: "3 blocks, 4 heads",
    },
  },
  {
    id: "lift",
    phase: "Scale change",
    title: "Local atom context feeds token features",
    body:
      "After local atom processing, the model has token-level information that can enter the global diffusion transformer path.",
    equation: "local atom context -> token representation",
    lines: [2, 3],
    mode: "atom to token",
    module: "encoder",
    caption:
      "The first boundary is where local atom neighborhoods become token-scale context.",
    vars: {
      source: "atom-level local neighborhoods",
      target: "token-level representation",
      role: "prepare global token mixing",
    },
  },
  {
    id: "token",
    phase: "Token core",
    title: "The middle stack mixes tokens globally",
    body:
      "DiffusionTransformer is the long token-level core: 24 blocks, 16 heads, full token self-attention.",
    equation: "DiffusionTransformer: Nblock = 24, Nhead = 16",
    lines: [3, 4],
    mode: "token full attention",
    module: "token",
    caption:
      "This is full token self-attention, so it is the global mixing stage in the coarse map.",
    vars: {
      module: "DiffusionTransformer",
      attention: "full token self-attention",
      depth: "24 blocks, 16 heads",
    },
  },
  {
    id: "global",
    phase: "Global mixing",
    title: "Token attention is where distant tokens meet",
    body:
      "The atom stages are local along the atom layout. The token transformer is the place where every token can attend to every other token.",
    equation: "token_i attends over all valid token_j",
    lines: [4],
    mode: "global token context",
    module: "token",
    caption:
      "The global part of the diffusion module lives at token resolution.",
    vars: {
      query: "one token",
      keys: "all valid tokens",
      contrast: "not limited to 128 atom keys",
    },
  },
  {
    id: "decoder",
    phase: "Atom decoder",
    title: "The decoder returns to local atom updates",
    body:
      "AtomAttentionDecoder consumes token context and writes back to atom-level outputs through another local atom-attention stack.",
    equation: "AtomAttentionDecoder: Nblock = 3, Nhead = 4",
    lines: [5],
    mode: "token to atom",
    module: "decoder",
    caption:
      "Decoder cards also drill down to the local atom attention mask story.",
    vars: {
      module: "AtomAttentionDecoder",
      attention: "sequence-local atom attention",
      depth: "3 blocks, 4 heads",
    },
  },
  {
    id: "writeback",
    phase: "Output",
    title: "Token-conditioned atom features produce coordinate updates",
    body:
      "The final stage is atom-level again: local atom windows receive token context and produce the denoising update for atom coordinates.",
    equation: "return denoised atom coordinate update",
    lines: [5, 6],
    mode: "atom output",
    module: "decoder",
    caption:
      "The same atom-local mechanism appears on both sides of the token transformer.",
    vars: {
      input: "token-conditioned atom features",
      output: "atom coordinate update",
      scale: "atom-level writeback",
    },
  },
  {
    id: "drilldown",
    phase: "Coarse to fine",
    title: "Atom modules drill down to the window story",
    body:
      "The coarse map should be the starting point. Atom encoder and decoder both point to the local atom attention mask story because they share the same local-window motif.",
    equation: "module map -> local atom attention",
    lines: [2, 5],
    mode: "navigation",
    module: "overview",
    caption:
      "The fine-grained story explains the 32-query and 128-key/window mask.",
    vars: {
      encoder: "links to local atom attention",
      decoder: "links to local atom attention",
      token: "token-level detail can become its own story later",
    },
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
  moduleDetail: document.getElementById("moduleDetail"),
  moduleTitle: document.getElementById("moduleTitle"),
  moduleBody: document.getElementById("moduleBody"),
  moduleDrilldown: document.getElementById("moduleDrilldown"),
  moduleNodes: [...document.querySelectorAll(".module-node")],
};

const state = {
  stepIndex: 0,
};

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

  renderModuleState(step.module);
}

function renderModuleState(activeModule) {
  elements.moduleNodes.forEach((node) => {
    const isActive =
      activeModule === "overview" || node.dataset.module === activeModule;
    node.classList.toggle("active", isActive);
    node.classList.toggle("primary-active", node.dataset.module === activeModule);
  });

  const info = moduleInfo[activeModule] || moduleInfo.overview;
  elements.moduleTitle.textContent = info.title;
  elements.moduleBody.textContent = info.body;
  elements.moduleDrilldown.textContent = info.linkText;
  elements.moduleDrilldown.classList.toggle("is-disabled", !info.href);
  if (info.href) {
    elements.moduleDrilldown.href = info.href;
    elements.moduleDrilldown.removeAttribute("aria-disabled");
  } else {
    elements.moduleDrilldown.href = "#";
    elements.moduleDrilldown.setAttribute("aria-disabled", "true");
  }
}

function stepForModule(moduleName) {
  const preferred = {
    encoder: "encoder",
    token: "token",
    decoder: "decoder",
  }[moduleName];
  return Math.max(0, steps.findIndex((step) => step.id === preferred));
}

elements.moduleNodes.forEach((node) => {
  node.addEventListener("click", () => {
    const moduleName = node.dataset.module;
    if (moduleName === "encoder" || moduleName === "decoder") {
      window.location.href = "../af3-local-atom-attention/";
      return;
    }
    setStep(stepForModule(moduleName));
  });
});

elements.moduleDrilldown.addEventListener("click", (event) => {
  if (elements.moduleDrilldown.classList.contains("is-disabled")) {
    event.preventDefault();
  }
});

elements.prevButton.addEventListener("click", () => setStep(state.stepIndex - 1));
elements.nextButton.addEventListener("click", () => setStep(state.stepIndex + 1));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") setStep(state.stepIndex - 1);
  if (event.key === "ArrowRight") setStep(state.stepIndex + 1);
});

initCode();
initProgress();
setStep(0);
