const PRIMARY_KINDS = new Set(["data_flow", "state_update", "skip"]);

function boxCenter(box) {
  return {
    x: box?.cx ?? ((box?.x || 0) + (box?.width || 0) / 2),
    y: box?.cy ?? ((box?.y || 0) + (box?.height || 0) / 2),
  };
}

function boxFor(boxes, id) {
  if (boxes instanceof Map) return boxes.get(id);
  return boxes?.[id];
}

export function semanticKindsForEdge(edge = {}) {
  const kinds = [edge.kind, ...(edge.segments || []).map((segment) => segment?.kind)]
    .filter(Boolean);
  return [...new Set(kinds)];
}

export function semanticEdgeIdentity(edge = {}) {
  const path = edge.relation_path
    || edge.relationPath
    || (edge.provenance_hops || edge.provenanceHops || [])
      .map((hop) => hop?.relation_ref || hop?.relationRef)
      .filter(Boolean);
  return [
    ...(Array.isArray(path) ? path : []),
    `${edge.from || "?"}->${edge.to || "?"}`,
  ].join("/");
}

function primaryEdge(edge) {
  return semanticKindsForEdge(edge).some((kind) => PRIMARY_KINDS.has(kind));
}

function stateUpdateEdge(edge) {
  return semanticKindsForEdge(edge).includes("state_update");
}

function pathExists(edges, start, target, excludedIndex) {
  if (start === target) return true;
  const adjacency = new Map();
  edges.forEach((edge, index) => {
    if (index === excludedIndex || !primaryEdge(edge)) return;
    const neighbors = adjacency.get(edge.from) || [];
    neighbors.push(edge.to);
    adjacency.set(edge.from, neighbors);
  });
  adjacency.forEach((neighbors) => neighbors.sort());

  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    for (const neighbor of adjacency.get(current) || []) {
      if (neighbor === target) return true;
      if (seen.has(neighbor)) continue;
      seen.add(neighbor);
      queue.push(neighbor);
    }
  }
  return false;
}

// A state update is feedback only when it closes a visible cycle and travels
// against the authored left-to-right flow. This avoids misclassifying ordinary
// forward state writes and initialisation edges.
export function feedbackEdgeIndexes(edges = [], boxes = new Map(), { tolerance = 2 } = {}) {
  const indexes = new Set();
  edges.forEach((edge, index) => {
    if (edge.route_side || edge.routeSide || !stateUpdateEdge(edge)) return;
    const fromBox = boxFor(boxes, edge.from);
    const toBox = boxFor(boxes, edge.to);
    if (!fromBox || !toBox) return;
    const from = boxCenter(fromBox);
    const to = boxCenter(toBox);
    const regresses = from.x > to.x + tolerance
      || (Math.abs(from.x - to.x) <= tolerance && from.y >= to.y);
    if (!regresses) return;
    if (pathExists(edges, edge.to, edge.from, index)) indexes.add(index);
  });
  return indexes;
}

function intervalsOverlap(left, right, gap) {
  return left.lo < right.hi + gap && left.hi + gap > right.lo;
}

// Interval colouring lets non-overlapping loops share a bottom rail while
// overlapping or nested loops receive distinct clearances. Sorting short
// spans first naturally pushes enclosing loops farther away from the content.
export function allocateFeedbackLanes(
  edges = [],
  boxes = new Map(),
  { baseClearance = 42, laneStep = 18, intervalGap = 10 } = {},
) {
  const feedback = feedbackEdgeIndexes(edges, boxes);
  const spans = [...feedback].map((index) => {
    const edge = edges[index];
    const from = boxCenter(boxFor(boxes, edge.from));
    const to = boxCenter(boxFor(boxes, edge.to));
    return {
      index,
      lo: Math.min(from.x, to.x),
      hi: Math.max(from.x, to.x),
      identity: semanticEdgeIdentity(edge),
    };
  }).sort((left, right) => (
    (left.hi - left.lo) - (right.hi - right.lo)
    || left.lo - right.lo
    || left.identity.localeCompare(right.identity)
  ));

  const laneSpans = [];
  // Explicit bottom routes remain authoritative, but they also reserve their
  // measured rail so a nearby inferred recurrence cannot be placed on top of
  // them.
  edges.forEach((edge, index) => {
    const side = edge.route_side || edge.routeSide;
    if (side !== "bottom") return;
    const fromBox = boxFor(boxes, edge.from);
    const toBox = boxFor(boxes, edge.to);
    if (!fromBox || !toBox) return;
    const from = boxCenter(fromBox);
    const to = boxCenter(toBox);
    const clearance = Number(edge.route_clearance || edge.routeClearance || baseClearance);
    const lane = Math.max(0, Math.round((clearance - baseClearance) / laneStep));
    while (laneSpans.length <= lane) laneSpans.push([]);
    laneSpans[lane].push({
      index,
      lo: Math.min(from.x, to.x),
      hi: Math.max(from.x, to.x),
      identity: semanticEdgeIdentity(edge),
      explicit: true,
    });
  });
  const assignments = new Map();
  spans.forEach((span) => {
    let lane = laneSpans.findIndex((existing) => (
      existing.every((other) => !intervalsOverlap(span, other, intervalGap))
    ));
    if (lane < 0) {
      lane = laneSpans.length;
      laneSpans.push([]);
    }
    laneSpans[lane].push(span);
    assignments.set(span.index, {
      side: "bottom",
      lane,
      clearance: baseClearance + lane * laneStep,
      inferred: true,
    });
  });
  return assignments;
}
