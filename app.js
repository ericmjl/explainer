import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const codeLines = [
  "inputs: single s_i, pair z_ij, frame T_i = (R_i, t_i)",
  "q_i, k_j, v_j = linear projections of single reps",
  "q_i_local = W_q_point s_i",
  "k_j_local = W_k_point s_j",
  "q_i_global = R_i q_i_local + t_i",
  "k_j_global = R_j k_j_local + t_j",
  "geom_ij = -0.5 * ||q_i_global - k_j_global||^2",
  "logit_ij = dot(q_i, k_j) + pair_bias(z_ij) + geom_ij",
  "a_ij = softmax_j(logit_ij)",
  "o_point_global = sum_j a_ij * v_j_point_global",
  "o_point_local = R_i^T (o_point_global - t_i)",
  "ipa_update_i = W_out(concat(scalar, point, norm, pair))",
];

const steps = [
  {
    id: "frames",
    phase: "Frame setup",
    title: "Residues carry local frames",
    body:
      "IPA starts with a current frame for each residue. The frame gives residue i an origin t_i and local axes R_i.",
    equation: "T_i = (R_i, t_i)",
    lines: [1],
    mode: "frames",
    caption:
      "The two residue frames are current model state. They are not ground truth; they are the coordinate systems IPA can query.",
    vars: {
      "T_i": "frame for residue i",
      "R_i": "local axes in global coordinates",
      "t_i": "current global origin of residue i",
    },
    scene: { frames: true, residues: true, camera: 0.0 },
  },
  {
    id: "scalar",
    phase: "Feature attention",
    title: "IPA still has ordinary attention",
    body:
      "Before geometry enters, IPA creates scalar queries, keys, and values from the single representation.",
    equation: "q_i, k_j, v_j = Linear(s)",
    lines: [2],
    mode: "scalar q/k/v",
    caption:
      "The feature strips are scalar attention. Geometry adds another term to the same attention logit.",
    vars: {
      "s_i": "single representation for residue i",
      "q_i": "feature query",
      "k_j": "feature key",
    },
    scene: { frames: true, residues: true, scalar: true, camera: 0.12 },
  },
  {
    id: "query-local",
    phase: "Virtual query point",
    title: "Place a query probe in i's local frame",
    body:
      "IPA predicts q_i_local as coordinates from (0,0,0) in residue i's local frame. This is a virtual probe attached to residue i, not a movement of the residue.",
    equation: "q_i_local = W_q_point s_i",
    lines: [3],
    mode: "local query",
    caption:
      "The inset shows raw local coordinates. They are not a world-space point until IPA applies R_i and t_i.",
    vars: {
      "q_i_local": "[0.62, 0.48, 0.28]",
      "(0,0,0)_i": "local origin of residue i",
      "meaning": "coordinates relative to residue i's local origin",
    },
    scene: { frames: true, residues: true, qLocal: true, camera: 0.22 },
  },
  {
    id: "query-global",
    phase: "Local to global",
    title: "Move the virtual probe into global space",
    body:
      "The local probe is rotated by R_i and translated by t_i. This creates the global query point used for a distance comparison.",
    equation: "q_i_global = R_i q_i_local + t_i",
    lines: [5],
    mode: "query transform",
    caption:
      "The main scene now shows the same virtual point after local-to-global placement. The residue frame stays where it is.",
    vars: {
      "R_i q_i_local": "offset oriented by residue i",
      "+ t_i": "move from local origin to global position",
    },
    scene: {
      frames: true,
      residues: true,
      qLocal: true,
      qGlobal: true,
      transformQ: true,
      camera: 0.35,
    },
  },
  {
    id: "key-global",
    phase: "Key probe",
    title: "Residue j gets its own key probe",
    body:
      "The key point is predicted in j's local frame, then placed globally using j's current frame.",
    equation: "k_j_global = R_j k_j_local + t_j",
    lines: [4, 6],
    mode: "key transform",
    caption:
      "The orange key probe follows residue j's orientation, just as the query probe follows residue i.",
    vars: {
      "k_j_local": "learned key offset for residue j",
      "k_j_global": "key probe after applying T_j",
    },
    scene: {
      frames: true,
      residues: true,
      qGlobal: true,
      kGlobal: true,
      transformK: true,
      camera: 0.48,
    },
  },
  {
    id: "distance",
    phase: "Geometry logit",
    title: "Attention sees probe distance",
    body:
      "If the query probe from i and key probe from j are close, the geometric term increases attention from i to j.",
    equation: "geom_ij = -0.5 * ||q_i_global - k_j_global||^2",
    lines: [7],
    mode: "distance term",
    caption:
      "The dashed line is the geometry term. Shorter distance means less penalty in the attention logit.",
    vars: {
      "distance": "virtual probe-to-probe distance",
      "sign": "negative squared distance penalty",
    },
    scene: {
      frames: true,
      residues: true,
      qGlobal: true,
      kGlobal: true,
      distance: true,
      camera: 0.55,
    },
  },
  {
    id: "logit",
    phase: "Combine signals",
    title: "Feature, pair, and geometry terms combine",
    body:
      "IPA adds ordinary scalar attention, pair-representation bias, and the point-distance term into one logit.",
    equation: "logit_ij = dot(q_i,k_j) + pair_bias(z_ij) + geom_ij",
    lines: [8],
    mode: "combined logit",
    caption:
      "The pair representation is a learned residue-pair context term. The geometry term makes the logit frame-aware.",
    vars: {
      "dot(q_i,k_j)": "feature compatibility",
      "pair_bias(z_ij)": "pair representation contribution",
      "geom_ij": "probe distance contribution",
    },
    scene: {
      frames: true,
      residues: true,
      qGlobal: true,
      kGlobal: true,
      distance: true,
      logit: true,
      camera: 0.62,
    },
  },
  {
    id: "softmax",
    phase: "Attention weights",
    title: "Softmax turns logits into attention",
    body:
      "After softmax, residue i uses the weights to gather value information from other residues.",
    equation: "a_ij = softmax_j(logit_ij)",
    lines: [9],
    mode: "attention",
    caption:
      "The thick teal arc shows residue i attending to residue j.",
    vars: {
      "a_ij": "attention from query residue i to key residue j",
      "normalization": "softmax across target residues j",
    },
    scene: {
      frames: true,
      residues: true,
      qGlobal: true,
      kGlobal: true,
      attention: true,
      softmax: true,
      camera: 0.72,
    },
  },
  {
    id: "output",
    phase: "IPA output",
    title: "Gather values, then return to i's local frame",
    body:
      "Point values are averaged in global space, converted back to residue i's local frame, concatenated with other outputs, and projected into a single-representation update.",
    equation: "IPA(s,z,T)_i = W_out(concat(...))",
    lines: [10, 11, 12],
    mode: "single update",
    caption:
      "IPA updates the latent single representation. The actual frame movement happens later in BackboneUpdate.",
    vars: {
      "o_point_global": "weighted value point",
      "o_point_local": "same point expressed in i's frame",
      "output": "single representation update",
    },
    scene: {
      frames: true,
      residues: true,
      qGlobal: true,
      kGlobal: true,
      attention: true,
      values: true,
      output: true,
      camera: 0.82,
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
  canvas: document.getElementById("sceneCanvas"),
  overlay: document.getElementById("sceneOverlay"),
};

const palette = {
  ink: "#1d2424",
  i: "#2a6fbb",
  j: "#c14c3d",
  q: "#16815f",
  k: "#c47b20",
  value: "#6d63b8",
  attention: "#186c72",
  pair: "#7a8f9d",
  x: "#cf4e3e",
  y: "#16815f",
  z: "#2b68b7",
};

const state = {
  stepIndex: 0,
  desiredCamera: null,
};

const frameI = {
  origin: new THREE.Vector3(-1.25, 0.05, 0.0),
  axes: [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
  ],
};

const frameJ = {
  origin: new THREE.Vector3(1.18, 0.15, -0.32),
  axes: eulerAxes(-0.62, 0.32, 0.2),
};

const qLocal = new THREE.Vector3(0.62, 0.48, 0.28);
const kLocal = new THREE.Vector3(-0.52, 0.22, 0.44);
const valueLocal = new THREE.Vector3(0.2, -0.42, -0.16);
const qGlobal = localToGlobal(frameI, qLocal);
const kGlobal = localToGlobal(frameJ, kLocal);
const vGlobal = localToGlobal(frameJ, valueLocal);
const gathered = qGlobal.clone().lerp(vGlobal, 0.46);

const renderer = new THREE.WebGLRenderer({
  canvas: elements.canvas,
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0xffffff, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(3.8, 2.5, 4.3);

const controls = new OrbitControls(camera, elements.canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.12, 0);
controls.minDistance = 1.5;
controls.maxDistance = 9;
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;

let userInteracting = false;
controls.addEventListener("start", () => {
  userInteracting = true;
  state.desiredCamera = null;
  elements.canvas.classList.add("is-dragging");
});
controls.addEventListener("end", () => {
  userInteracting = false;
  elements.canvas.classList.remove("is-dragging");
});

const root = new THREE.Group();
scene.add(root);

scene.add(new THREE.HemisphereLight(0xffffff, 0xd5c7b6, 1.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(4, 5, 4);
scene.add(keyLight);

const objects = buildSceneObjects();
root.add(objects.frames);
root.add(objects.scalar);
root.add(objects.qProbe);
root.add(objects.kProbe);
root.add(objects.distance);
root.add(objects.attention);
root.add(objects.values);
root.add(objects.output);

function eulerAxes(yaw, pitch, roll) {
  const euler = new THREE.Euler(pitch, yaw, roll, "YXZ");
  const matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
  return [
    new THREE.Vector3(1, 0, 0).applyMatrix4(matrix).normalize(),
    new THREE.Vector3(0, 1, 0).applyMatrix4(matrix).normalize(),
    new THREE.Vector3(0, 0, 1).applyMatrix4(matrix).normalize(),
  ];
}

function localToGlobal(frame, local) {
  return frame.origin
    .clone()
    .add(frame.axes[0].clone().multiplyScalar(local.x))
    .add(frame.axes[1].clone().multiplyScalar(local.y))
    .add(frame.axes[2].clone().multiplyScalar(local.z));
}

function makeMaterial(color, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
  });
}

function makeSphere(position, color, radius = 0.08) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 18),
    makeMaterial(color),
  );
  mesh.position.copy(position);
  return mesh;
}

function makeArrow(start, end, color, lengthScale = 1) {
  const direction = end.clone().sub(start);
  const length = direction.length() * lengthScale;
  const arrow = new THREE.ArrowHelper(
    direction.normalize(),
    start,
    length,
    color,
    0.12,
    0.055,
  );
  arrow.line.material.linewidth = 2;
  return arrow;
}

function makeLine(points, color, dashed = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = dashed
    ? new THREE.LineDashedMaterial({
        color,
        dashSize: 0.08,
        gapSize: 0.06,
        transparent: true,
        opacity: 0.78,
      })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const line = new THREE.Line(geometry, material);
  if (dashed) line.computeLineDistances();
  return line;
}

function makeTube(points, color, radius = 0.025) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 48, radius, 10, false);
  return new THREE.Mesh(geometry, makeMaterial(color, 0.38));
}

function makeLabel(text, color = "#1d2424", size = 0.19) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 44;
  ctx.font = `800 ${fontSize}px Inter, sans-serif`;
  const metrics = ctx.measureText(text);
  canvas.width = Math.ceil(metrics.width + 36);
  canvas.height = 72;
  ctx.font = `800 ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.strokeStyle = "rgba(80,90,86,0.24)";
  ctx.lineWidth = 2;
  roundedRect(ctx, 4, 7, canvas.width - 8, canvas.height - 14, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, 18, 50);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true }),
  );
  sprite.scale.set((canvas.width / canvas.height) * size, size, 1);
  return sprite;
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function makeFeatureStrip(position, color, label) {
  const group = new THREE.Group();
  group.position.copy(position);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.08, 0.16),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      transparent: true,
      opacity: 0.82,
    }),
  );
  group.add(base);
  for (let i = 0; i < 7; i += 1) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.11, 0.19),
      makeMaterial(i % 2 ? color : "#9ba7a3", 0.5),
    );
    box.position.x = -0.27 + i * 0.09;
    group.add(box);
  }
  const text = makeLabel(label, color, 0.16);
  text.position.set(0, -0.22, 0);
  group.add(text);
  return group;
}

function makeFrame(frame, color, suffix) {
  const group = new THREE.Group();
  group.add(makeSphere(frame.origin, color, 0.12));

  const residueLabel = makeLabel(`residue ${suffix}`, color, 0.2);
  residueLabel.position.copy(frame.origin).add(new THREE.Vector3(0.25, 0.26, 0));
  group.add(residueLabel);

  const axisColors = [palette.x, palette.y, palette.z];
  const axisLabels = [`x_${suffix}`, `y_${suffix}`, `z_${suffix}`];
  for (let i = 0; i < 3; i += 1) {
    const end = frame.origin.clone().add(frame.axes[i].clone().multiplyScalar(0.58));
    group.add(makeArrow(frame.origin, end, axisColors[i]));
    const label = makeLabel(axisLabels[i], axisColors[i], 0.14);
    label.position.copy(end).add(new THREE.Vector3(0.08, 0.05, 0));
    group.add(label);
  }
  return group;
}

function buildSceneObjects() {
  const grid = new THREE.GridHelper(5, 10, 0x8ca19b, 0xd9d2c5);
  grid.position.y = -0.72;
  grid.material.transparent = true;
  grid.material.opacity = 0.5;

  const frames = new THREE.Group();
  frames.name = "frames";
  frames.add(grid);
  frames.add(makeFrame(frameI, palette.i, "i"));
  frames.add(makeFrame(frameJ, palette.j, "j"));

  const scalar = new THREE.Group();
  scalar.add(makeFeatureStrip(frameI.origin.clone().add(new THREE.Vector3(0, 0.9, 0.05)), palette.i, "q_i"));
  scalar.add(makeFeatureStrip(frameJ.origin.clone().add(new THREE.Vector3(0, 0.9, 0.05)), palette.j, "k_j"));

  const qProbe = new THREE.Group();
  qProbe.add(makeArrow(frameI.origin, qGlobal, palette.q));
  qProbe.add(makeSphere(qGlobal, palette.q, 0.085));
  const qLabel = makeLabel("q_i global", palette.q, 0.18);
  qLabel.position.copy(qGlobal).add(new THREE.Vector3(0.18, 0.2, 0));
  qProbe.add(qLabel);
  const tiLabel = makeLabel("t_i", palette.i, 0.15);
  tiLabel.position.copy(frameI.origin).add(new THREE.Vector3(-0.26, -0.22, 0.05));
  qProbe.add(tiLabel);

  const kProbe = new THREE.Group();
  kProbe.add(makeArrow(frameJ.origin, kGlobal, palette.k));
  kProbe.add(makeSphere(kGlobal, palette.k, 0.085));
  const kLabel = makeLabel("k_j global", palette.k, 0.18);
  kLabel.position.copy(kGlobal).add(new THREE.Vector3(-0.35, 0.19, 0));
  kProbe.add(kLabel);

  const distance = new THREE.Group();
  distance.add(makeLine([qGlobal, kGlobal], palette.attention, true));
  const distanceLabel = makeLabel("distance penalty", palette.attention, 0.16);
  distanceLabel.position.copy(qGlobal.clone().lerp(kGlobal, 0.5)).add(new THREE.Vector3(0.1, 0.22, 0));
  distance.add(distanceLabel);

  const attention = new THREE.Group();
  const mid = frameI.origin
    .clone()
    .lerp(frameJ.origin, 0.5)
    .add(new THREE.Vector3(0, 1.05, 0.2));
  attention.add(makeTube([frameJ.origin, mid, frameI.origin], palette.attention, 0.026));
  const attentionLabel = makeLabel("attention a_ij", palette.attention, 0.16);
  attentionLabel.position.copy(mid).add(new THREE.Vector3(0, 0.2, 0));
  attention.add(attentionLabel);

  const values = new THREE.Group();
  values.add(makeArrow(frameJ.origin, vGlobal, palette.value));
  values.add(makeSphere(vGlobal, palette.value, 0.08));
  values.add(makeLine([vGlobal, gathered], palette.value, true));
  values.add(makeSphere(gathered, palette.value, 0.075));
  const valueLabel = makeLabel("weighted value point", palette.value, 0.16);
  valueLabel.position.copy(gathered).add(new THREE.Vector3(0.2, 0.18, 0));
  values.add(valueLabel);

  const output = new THREE.Group();
  const outputLabel = makeLabel("updated single representation s_i", palette.attention, 0.22);
  outputLabel.position.set(0, -0.42, 1.2);
  output.add(outputLabel);

  return { frames, scalar, qProbe, kProbe, distance, attention, values, output };
}

function setVisible(group, value) {
  group.visible = Boolean(value);
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

function renderOverlay(sceneState) {
  elements.overlay.innerHTML = "";

  if (sceneState.qLocal) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card local-inset">
        <strong>q_i local frame</strong>
        <div class="local-grid">
          <i class="local-axis x"></i>
          <i class="local-axis y"></i>
          <i class="local-axis z"></i>
          <i class="local-origin"></i>
          <i class="local-probe"></i>
        </div>
        <div>[0.62, 0.48, 0.28] from (0,0,0)_i</div>
      </div>`,
    );
  }

  if (sceneState.logit) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card logit-card">
        <strong>attention logit</strong>
        <span><i class="term-dot" style="background:#5f6e74"></i>dot(q_i,k_j)</span>
        <span><i class="term-dot" style="background:${palette.pair}"></i>pair_bias(z_ij)</span>
        <span><i class="term-dot" style="background:${palette.attention}"></i>geometry distance</span>
      </div>`,
    );
  }

  if (sceneState.softmax) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card softmax-card">
        <strong>softmax over j</strong>
        <div class="softmax-bars">
          <i style="height:24px"></i>
          <i style="height:54px"></i>
          <i style="height:35px"></i>
          <i style="height:17px"></i>
        </div>
      </div>`,
    );
  }
}

function renderStep() {
  const step = steps[state.stepIndex];
  const sceneState = step.scene;

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

  setVisible(objects.frames, sceneState.frames || sceneState.residues);
  setVisible(objects.scalar, sceneState.scalar);
  setVisible(objects.qProbe, sceneState.qGlobal);
  setVisible(objects.kProbe, sceneState.kGlobal);
  setVisible(objects.distance, sceneState.distance || sceneState.logit);
  setVisible(objects.attention, sceneState.attention || sceneState.values || sceneState.output);
  setVisible(objects.values, sceneState.values || sceneState.output);
  setVisible(objects.output, sceneState.output);

  renderOverlay(sceneState);
  setStoryCamera(sceneState.camera ?? 0);
  window.location.hash = step.id;
}

function setStoryCamera(t) {
  const angle = -0.6 + t * 1.5;
  const radius = 4.9;
  const y = 2.4 - t * 0.45;
  state.desiredCamera = new THREE.Vector3(
    Math.sin(angle) * radius,
    y,
    Math.cos(angle) * radius,
  );
}

function setStep(index) {
  state.stepIndex = Math.max(0, Math.min(index, steps.length - 1));
  renderStep();
}

function nextStep() {
  setStep(state.stepIndex + 1);
}

function prevStep() {
  setStep(state.stepIndex - 1);
}

function resizeRenderer() {
  const rect = elements.canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function initFromHash() {
  const hash = window.location.hash.replace("#", "");
  const index = steps.findIndex((step) => step.id === hash);
  if (index >= 0) state.stepIndex = index;
}

function animate() {
  requestAnimationFrame(animate);
  if (state.desiredCamera && !userInteracting) {
    camera.position.lerp(state.desiredCamera, 0.045);
    if (camera.position.distanceTo(state.desiredCamera) < 0.02) {
      state.desiredCamera = null;
    }
  }
  controls.update();
  renderer.render(scene, camera);
}

elements.prevButton.addEventListener("click", prevStep);
elements.nextButton.addEventListener("click", nextStep);
window.addEventListener("resize", resizeRenderer);
window.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    nextStep();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prevStep();
  }
});

initCode();
initProgress();
initFromHash();
resizeRenderer();
renderStep();
animate();
