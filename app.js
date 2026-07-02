import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const codeLines = [
  "inputs: single s_i, pair z_ij, frames T_i = (R_i, t_i)",
  "q_i^h, k_i^h, v_i^h = LinearNoBias(s_i)",
  "q_i^{hp}, k_i^{hp} = LinearNoBias(s_i)",
  "v_i^{hp} = LinearNoBias(s_i)",
  "b_ij^h = LinearNoBias(z_ij)",
  "w_C = sqrt(1 / (9 * N_query_points)); w_L = sqrt(1 / 3)",
  "a_ij^h = softmax_j(w_L/sqrt(c) q_i^h . k_j^h + b_ij^h - gamma^h*w_C/2 * sum_p ||T_i q_i^{hp} - T_j k_j^{hp}||^2)",
  "pair_out_i^h = sum_j a_ij^h z_ij",
  "scalar_out_i^h = sum_j a_ij^h v_j^h",
  "point_out_i^{hp} = T_i^-1 sum_j a_ij^h (T_j v_j^{hp})",
  "norm_i^{hp} = ||point_out_i^{hp}||",
  "s_tilde_i = Linear(concat_h,p(pair_out, scalar_out, point_out, norm))",
  "return s_tilde_i",
];

const steps = [
  {
    id: "frames",
    phase: "Algorithm 22 input",
    title: "IPA receives features plus frames",
    body:
      "Each residue has invariant features and a current rigid frame. IPA uses the frame only to place virtual points and later to read them back locally.",
    equation: "inputs: {s_i}, {z_ij}, {T_i}",
    lines: [1],
    mode: "frames",
    caption:
      "The scene shows query residue i and a small subset of source residues j. In the real tensor, j ranges over all valid residues.",
    vars: {
      "s_i": "single representation, AF2 c_s = 384",
      "z_ij": "pair representation, AF2 c_z = 128",
      "T_i": "current frame (R_i, t_i)",
    },
    scene: { frames: true, residues: true, camera: 0.0 },
  },
  {
    id: "scalar",
    phase: "Lines 1-2",
    title: "Project ordinary scalar attention",
    body:
      "IPA still starts like normal multi-head attention: every residue gets scalar queries, keys, and values from its single representation.",
    equation: "q_i^h, k_i^h, v_i^h in R^c",
    lines: [2],
    mode: "scalar q/k/v",
    caption:
      "These scalar channels form one term in the attention logit and one output stream after the softmax.",
    vars: {
      heads: "h = 1..12 in AF2",
      "scalar c": "16 channels per head",
      shape: "q,k,v: [residue, head, 16]",
    },
    scene: { frames: true, residues: true, scalar: true, camera: 0.12 },
  },
  {
    id: "point-local",
    phase: "Lines 2-3",
    title: "Project local point probes",
    body:
      "The point projections are coordinate triples in each residue's own local frame. Query/key points are for distances; value points are gathered later.",
    equation: "q_i^{hp}, k_i^{hp}, v_i^{hp} in R^3",
    lines: [3, 4],
    mode: "local points",
    caption:
      "The inset shows local coordinates before any frame transform. They are virtual probes, not atom positions.",
    vars: {
      "query/key points": "4 per head in AF2",
      "value points": "8 per head in AF2",
      units: "nanometres in AF2",
    },
    scene: { frames: true, residues: true, pointLocal: true, camera: 0.22 },
  },
  {
    id: "probe-global",
    phase: "Line 7",
    title: "Place query and key probes globally",
    body:
      "To compare residue i with a source residue j, IPA maps i's query point and j's key point through their current frames.",
    equation: "T_i q_i^{hp} = R_i q_i^{hp} + t_i",
    lines: [7],
    mode: "global probes",
    caption:
      "The green query point follows frame i. The amber key points follow each source frame j.",
    vars: {
      "T_i q_i": "query point in global coordinates",
      "T_j k_j": "key point in global coordinates",
      important: "frames move points; points do not move residues",
    },
    scene: {
      frames: true,
      residues: true,
      pointLocal: true,
      qGlobal: true,
      kGlobal: true,
      camera: 0.35,
    },
  },
  {
    id: "distance",
    phase: "Line 7",
    title: "Geometry becomes a distance penalty",
    body:
      "For each source j, IPA measures squared distances between the global query and key probes. Close virtual probes produce a smaller penalty.",
    equation: "- gamma^h*w_C/2 * sum_p ||T_i q_i^{hp} - T_j k_j^{hp}||^2",
    lines: [7],
    mode: "distance term",
    caption:
      "The dashed lines are the point-distance part of the attention affinity. The real computation sums over the query/key point index p.",
    vars: {
      distance: "computed in global coordinates",
      "sum_p": "4 query/key points per head in AF2",
      "gamma^h": "learned positive weight per head",
    },
    scene: {
      frames: true,
      residues: true,
      qGlobal: true,
      kGlobal: true,
      distance: true,
      camera: 0.52,
    },
  },
  {
    id: "logit",
    phase: "Lines 4-7",
    title: "Three terms form one attention logit",
    body:
      "The scalar query/key dot product, pair-representation bias, and geometric distance penalty are added before the softmax.",
    equation: "logit_ij^h = scalar_qk + pair_bias - point_distance",
    lines: [5, 6, 7],
    mode: "combined logit",
    caption:
      "The pair representation is invariant context. Geometry enters through distances between frame-placed points.",
    vars: {
      scalar_qk: "ordinary attention compatibility",
      pair_bias: "LinearNoBias(z_ij)",
      point_distance: "frame-aware distance penalty",
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
    phase: "Line 7",
    title: "Softmax normalizes over all source residues",
    body:
      "For a fixed query residue i and head h, the softmax runs over j. The same weights are reused for pair, scalar, and point value outputs.",
    equation: "a_ij^h = softmax_j(logit_ij^h)",
    lines: [7],
    mode: "attention",
    caption:
      "Arc thickness shows the attention weights from residue i to the displayed source residues.",
    vars: {
      "a_ij^h": "attention from query i to source j",
      normalization: "sum_j a_ij^h = 1",
      reuse: "same weights gather all value streams",
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
    id: "pair-output",
    phase: "Line 8",
    title: "Gather pair values",
    body:
      "IPA uses the attention weights to average pair features z_ij into a per-residue, per-head pair output.",
    equation: "pair_out_i^h = sum_j a_ij^h z_ij",
    lines: [8],
    mode: "pair output",
    caption:
      "This is the top blue stream in the AF2 supplementary figure: pair context modulates the update but is not a moving coordinate.",
    vars: {
      "input z_ij": "[c_z = 128]",
      "per head": "one weighted pair vector per h",
      "AF2 concat": "12 * 128 = 1536 channels",
    },
    scene: {
      frames: true,
      residues: true,
      attention: true,
      pairOut: true,
      camera: 0.75,
    },
  },
  {
    id: "scalar-output",
    phase: "Line 9",
    title: "Gather scalar values",
    body:
      "The same attention weights average the ordinary scalar value vectors from source residues.",
    equation: "scalar_out_i^h = sum_j a_ij^h v_j^h",
    lines: [9],
    mode: "scalar output",
    caption:
      "This is standard attention output, but its weights were influenced by both pair context and point geometry.",
    vars: {
      "v_j^h": "[c = 16]",
      "per head": "one scalar value vector",
      "AF2 concat": "12 * 16 = 192 channels",
    },
    scene: {
      frames: true,
      residues: true,
      scalar: true,
      attention: true,
      scalarOut: true,
      camera: 0.78,
    },
  },
  {
    id: "point-output",
    phase: "Line 10",
    title: "Gather value points in global space",
    body:
      "For one selected value point p, each source residue j first places its local value point globally. IPA then takes the attention-weighted sum of those global points.",
    equation: "o_global = sum_j a_ij^h (T_j v_j^{hp})",
    lines: [10],
    mode: "point output",
    caption:
      "The purple arrows show one selected value point channel. AF2 has 8 value points per head.",
    vars: {
      "selected p": "one of 8 value points",
      "sum over j": "all source residues",
      space: "weighted sum happens in global coordinates",
    },
    scene: {
      frames: true,
      residues: true,
      attention: true,
      values: true,
      camera: 0.84,
    },
  },
  {
    id: "local-output",
    phase: "Lines 10-11",
    title: "Read the point output in i's local frame",
    body:
      "The weighted global point is converted back through T_i^-1. Its local xyz components and its length are both fed to the output projection.",
    equation: "point_out_i^{hp} = T_i^-1 o_global; norm = ||point_out_i^{hp}||",
    lines: [10, 11],
    mode: "local output",
    caption:
      "This local readout is why the output is invariant to a global rotation or translation of the whole structure.",
    vars: {
      "T_i^-1": "subtract t_i, then apply R_i^T",
      "point coords": "3 numbers per value point",
      norm: "1 extra invariant scalar",
    },
    scene: {
      frames: true,
      residues: true,
      attention: true,
      values: true,
      localOutput: true,
      camera: 0.88,
    },
  },
  {
    id: "concat",
    phase: "Line 12",
    title: "Concatenate the four output streams",
    body:
      "Algorithm 22 concatenates pair output, scalar output, local point coordinates, and point norms over heads and value-point channels.",
    equation: "concat_h,p(pair_out, scalar_out, point_out, norm)",
    lines: [12],
    mode: "concat",
    caption:
      "For AF2 defaults, the concatenated IPA feature has 2112 channels before the final linear projection back to c_s = 384.",
    vars: {
      pair: "12 * 128 = 1536",
      scalar: "12 * 16 = 192",
      "point xyz": "12 * 8 * 3 = 288",
      "point norm": "12 * 8 = 96",
    },
    scene: {
      frames: true,
      residues: true,
      attention: true,
      values: true,
      localOutput: true,
      concat: true,
      camera: 0.9,
    },
  },
  {
    id: "return",
    phase: "Line 13",
    title: "IPA returns a single-representation update",
    body:
      "The final linear layer produces s_tilde_i. In the AF2 structure module, this updates the single representation; the frame update is a separate BackboneUpdate block after IPA.",
    equation: "return {s_tilde_i}",
    lines: [13],
    mode: "single update",
    caption:
      "This boundary matters: IPA computes the geometry-aware latent update. It does not directly output the new backbone frame.",
    vars: {
      "IPA output": "s_tilde_i, shape [c_s]",
      "structure module": "adds residual + transition",
      "frame motion": "predicted later by BackboneUpdate",
    },
    scene: {
      frames: true,
      residues: true,
      attention: true,
      values: true,
      localOutput: true,
      concat: true,
      output: true,
      camera: 0.94,
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
  j2: "#7a6a2b",
  j3: "#8260a8",
  q: "#16815f",
  k: "#c47b20",
  value: "#6d63b8",
  norm: "#4d698d",
  attention: "#186c72",
  pair: "#7a8f9d",
  scalar: "#55656a",
  x: "#cf4e3e",
  y: "#16815f",
  z: "#2b68b7",
};

const state = {
  stepIndex: 0,
  desiredCamera: null,
};

const frameI = {
  origin: new THREE.Vector3(-1.35, 0.04, 0.0),
  axes: [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
  ],
};

const sourceResidues = [
  {
    id: "j1",
    frame: {
      origin: new THREE.Vector3(1.18, 0.15, -0.32),
      axes: eulerAxes(-0.62, 0.32, 0.2),
    },
    color: palette.j,
    keyLocal: new THREE.Vector3(-0.52, 0.22, 0.44),
    valueLocal: new THREE.Vector3(0.2, -0.42, -0.16),
    weight: 0.53,
    pairBias: 0.18,
  },
  {
    id: "j2",
    frame: {
      origin: new THREE.Vector3(0.4, -0.08, 1.08),
      axes: eulerAxes(0.58, -0.18, -0.38),
    },
    color: palette.j2,
    keyLocal: new THREE.Vector3(0.35, 0.36, -0.12),
    valueLocal: new THREE.Vector3(-0.18, 0.26, 0.42),
    weight: 0.3,
    pairBias: -0.04,
  },
  {
    id: "j3",
    frame: {
      origin: new THREE.Vector3(1.05, -0.2, -1.12),
      axes: eulerAxes(1.05, 0.24, 0.52),
    },
    color: palette.j3,
    keyLocal: new THREE.Vector3(-0.28, -0.28, 0.36),
    valueLocal: new THREE.Vector3(0.42, -0.15, 0.18),
    weight: 0.17,
    pairBias: 0.08,
  },
];

const qLocal = new THREE.Vector3(0.62, 0.48, 0.28);
const qGlobal = localToGlobal(frameI, qLocal);
sourceResidues.forEach((residue) => {
  residue.keyGlobal = localToGlobal(residue.frame, residue.keyLocal);
  residue.valueGlobal = localToGlobal(residue.frame, residue.valueLocal);
});

const weightedPointGlobal = sourceResidues.reduce(
  (sum, residue) =>
    sum.add(residue.valueGlobal.clone().multiplyScalar(residue.weight)),
  new THREE.Vector3(),
);
const outputPointLocal = globalToLocal(frameI, weightedPointGlobal);
const outputPointNorm = outputPointLocal.length().toFixed(2);

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
root.add(objects.localOutput);
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

function globalToLocal(frame, global) {
  const offset = global.clone().sub(frame.origin);
  return new THREE.Vector3(
    offset.dot(frame.axes[0]),
    offset.dot(frame.axes[1]),
    offset.dot(frame.axes[2]),
  );
}

function makeMaterial(color, roughness = 0.55, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
    transparent: opacity < 1,
    opacity,
  });
}

function makeSphere(position, color, radius = 0.08, opacity = 1) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 18),
    makeMaterial(color, 0.55, opacity),
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

function makeLine(points, color, dashed = false, opacity = 0.9) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = dashed
    ? new THREE.LineDashedMaterial({
        color,
        dashSize: 0.08,
        gapSize: 0.06,
        transparent: true,
        opacity,
      })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const line = new THREE.Line(geometry, material);
  if (dashed) line.computeLineDistances();
  return line;
}

function makeTube(points, color, radius = 0.025, opacity = 0.92) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 48, radius, 10, false);
  return new THREE.Mesh(geometry, makeMaterial(color, 0.38, opacity));
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
  sourceResidues.forEach((residue) => {
    frames.add(makeFrame(residue.frame, residue.color, residue.id));
  });

  const scalar = new THREE.Group();
  scalar.add(
    makeFeatureStrip(
      frameI.origin.clone().add(new THREE.Vector3(0, 0.9, 0.05)),
      palette.i,
      "q_i",
    ),
  );
  sourceResidues.forEach((residue, index) => {
    scalar.add(
      makeFeatureStrip(
        residue.frame.origin.clone().add(new THREE.Vector3(0, 0.9 + index * 0.05, 0.05)),
        residue.color,
        `k_${residue.id}, v_${residue.id}`,
      ),
    );
  });

  const qProbe = new THREE.Group();
  qProbe.add(makeArrow(frameI.origin, qGlobal, palette.q));
  qProbe.add(makeSphere(qGlobal, palette.q, 0.09));
  const qLabel = makeLabel("T_i q_i", palette.q, 0.18);
  qLabel.position.copy(qGlobal).add(new THREE.Vector3(0.18, 0.2, 0));
  qProbe.add(qLabel);
  const tiLabel = makeLabel("t_i", palette.i, 0.15);
  tiLabel.position.copy(frameI.origin).add(new THREE.Vector3(-0.26, -0.22, 0.05));
  qProbe.add(tiLabel);

  const kProbe = new THREE.Group();
  sourceResidues.forEach((residue) => {
    kProbe.add(makeArrow(residue.frame.origin, residue.keyGlobal, palette.k));
    kProbe.add(makeSphere(residue.keyGlobal, palette.k, 0.075));
    const label = makeLabel(`T_${residue.id} k`, palette.k, 0.15);
    label.position.copy(residue.keyGlobal).add(new THREE.Vector3(0.14, 0.16, 0));
    kProbe.add(label);
  });

  const distance = new THREE.Group();
  sourceResidues.forEach((residue) => {
    distance.add(makeLine([qGlobal, residue.keyGlobal], palette.attention, true, 0.66));
  });
  const distanceLabel = makeLabel("distance penalties", palette.attention, 0.16);
  distanceLabel.position.copy(qGlobal).add(new THREE.Vector3(0.22, 0.38, 0.05));
  distance.add(distanceLabel);

  const attention = new THREE.Group();
  sourceResidues.forEach((residue, index) => {
    const mid = frameI.origin
      .clone()
      .lerp(residue.frame.origin, 0.5)
      .add(new THREE.Vector3(0, 0.9 + index * 0.14, index % 2 ? -0.18 : 0.18));
    attention.add(
      makeTube(
        [frameI.origin, mid, residue.frame.origin],
        palette.attention,
        0.012 + residue.weight * 0.045,
        0.48 + residue.weight * 0.5,
      ),
    );
  });
  const attentionLabel = makeLabel("a_ij^h over j", palette.attention, 0.16);
  attentionLabel.position.set(-0.1, 1.34, 0.22);
  attention.add(attentionLabel);

  const values = new THREE.Group();
  sourceResidues.forEach((residue) => {
    values.add(makeArrow(residue.frame.origin, residue.valueGlobal, palette.value));
    values.add(makeSphere(residue.valueGlobal, palette.value, 0.078));
    values.add(
      makeLine(
        [residue.valueGlobal, weightedPointGlobal],
        palette.value,
        true,
        0.28 + residue.weight * 0.5,
      ),
    );
  });
  values.add(makeSphere(weightedPointGlobal, palette.value, 0.11));
  const valueLabel = makeLabel("sum_j a_ij T_j v_j^p", palette.value, 0.16);
  valueLabel.position.copy(weightedPointGlobal).add(new THREE.Vector3(0.2, 0.18, 0));
  values.add(valueLabel);

  const localOutput = new THREE.Group();
  localOutput.add(makeArrow(frameI.origin, weightedPointGlobal, palette.norm));
  localOutput.add(makeSphere(weightedPointGlobal, palette.norm, 0.065));
  const localLabel = makeLabel("T_i^-1 readout", palette.norm, 0.16);
  localLabel.position.copy(frameI.origin.clone().lerp(weightedPointGlobal, 0.55));
  localLabel.position.add(new THREE.Vector3(-0.1, -0.25, 0.08));
  localOutput.add(localLabel);

  const output = new THREE.Group();
  const outputLabel = makeLabel("updated single representation s_tilde_i", palette.attention, 0.22);
  outputLabel.position.set(0, -0.42, 1.2);
  output.add(outputLabel);

  return { frames, scalar, qProbe, kProbe, distance, attention, values, localOutput, output };
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

  if (sceneState.pointLocal) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card local-inset">
        <strong>local point projections</strong>
        <div class="local-grid">
          <i class="local-axis x"></i>
          <i class="local-axis y"></i>
          <i class="local-axis z"></i>
          <i class="local-origin"></i>
          <i class="local-probe q"></i>
          <i class="local-probe k"></i>
          <i class="local-probe v"></i>
        </div>
        <div>q/k/v are local xyz triples before applying T.</div>
      </div>`,
    );
  }

  if (sceneState.logit) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card logit-card">
        <strong>attention logit</strong>
        <span><i class="term-dot" style="background:${palette.scalar}"></i>scalar q dot k</span>
        <span><i class="term-dot" style="background:${palette.pair}"></i>pair bias b_ij</span>
        <span><i class="term-dot" style="background:${palette.attention}"></i>point distance penalty</span>
      </div>`,
    );
  }

  if (sceneState.softmax) {
    const bars = sourceResidues
      .map(
        (residue) =>
          `<span class="softmax-entry">
            <i style="height:${Math.round(24 + residue.weight * 72)}px;background:${residue.color}"></i>
            <b>${residue.id}</b>
            <em>${Math.round(residue.weight * 100)}%</em>
          </span>`,
      )
      .join("");
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card softmax-card">
        <strong>softmax over j</strong>
        <div class="softmax-bars">${bars}</div>
      </div>`,
    );
  }

  if (sceneState.pairOut) {
    const rows = sourceResidues
      .map(
        (residue) =>
          `<span>
            <i class="term-dot" style="background:${residue.color}"></i>
            ${residue.id}: a=${residue.weight.toFixed(2)}, b=${residue.pairBias.toFixed(2)}
          </span>`,
      )
      .join("");
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card pair-card">
        <strong>pair stream</strong>
        ${rows}
      </div>`,
    );
  }

  if (sceneState.scalarOut) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card scalar-card">
        <strong>scalar stream</strong>
        <div class="mini-vector">
          <i style="height:18px"></i><i style="height:36px"></i><i style="height:27px"></i>
          <i style="height:46px"></i><i style="height:24px"></i><i style="height:31px"></i>
        </div>
        <div>weighted value vector, c = 16 per head</div>
      </div>`,
    );
  }

  if (sceneState.localOutput) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card local-output-card">
        <strong>query-frame readout</strong>
        <span>x_i = ${outputPointLocal.x.toFixed(2)}</span>
        <span>y_i = ${outputPointLocal.y.toFixed(2)}</span>
        <span>z_i = ${outputPointLocal.z.toFixed(2)}</span>
        <span>norm = ${outputPointNorm}</span>
      </div>`,
    );
  }

  if (sceneState.concat) {
    elements.overlay.insertAdjacentHTML(
      "beforeend",
      `<div class="scene-card concat-card">
        <strong>AF2 concat ledger</strong>
        <div class="dimension-row"><span>pair</span><b>1536</b></div>
        <div class="dimension-row"><span>scalar</span><b>192</b></div>
        <div class="dimension-row"><span>point xyz</span><b>288</b></div>
        <div class="dimension-row"><span>point norm</span><b>96</b></div>
        <div class="dimension-total"><span>total</span><b>2112 -> 384</b></div>
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
  setVisible(objects.scalar, sceneState.scalar || sceneState.scalarOut);
  setVisible(
    objects.qProbe,
    sceneState.qGlobal || sceneState.distance || sceneState.logit,
  );
  setVisible(
    objects.kProbe,
    sceneState.kGlobal || sceneState.distance || sceneState.logit,
  );
  setVisible(objects.distance, sceneState.distance || sceneState.logit);
  setVisible(
    objects.attention,
    sceneState.attention ||
      sceneState.pairOut ||
      sceneState.scalarOut ||
      sceneState.values ||
      sceneState.localOutput ||
      sceneState.concat ||
      sceneState.output,
  );
  setVisible(
    objects.values,
    sceneState.values ||
      sceneState.localOutput ||
      sceneState.concat ||
      sceneState.output,
  );
  setVisible(
    objects.localOutput,
    sceneState.localOutput || sceneState.concat || sceneState.output,
  );
  setVisible(objects.output, sceneState.concat || sceneState.output);

  renderOverlay(sceneState);
  setStoryCamera(sceneState.camera ?? 0);
  window.location.hash = step.id;
}

function setStoryCamera(t) {
  const angle = -0.6 + t * 1.5;
  const radius = 4.95;
  const y = 2.45 - t * 0.45;
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
