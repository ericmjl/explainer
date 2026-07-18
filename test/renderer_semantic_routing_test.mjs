import test from "node:test";
import assert from "node:assert/strict";

import {
  allocateFeedbackLanes,
  feedbackEdgeIndexes,
  semanticKindsForEdge,
} from "../renderer/architecture/semantic-routing.mjs";

function box(cx, cy = 100) {
  return { x: cx - 40, y: cy - 30, width: 80, height: 60, cx, cy };
}

function stateCycle(prefix, leftX, rightX) {
  return {
    boxes: [
      [`${prefix}_module`, box(leftX)],
      [`${prefix}_state`, box(rightX, 150)],
    ],
    edges: [
      {
        from: `${prefix}_module`,
        to: `${prefix}_state`,
        kind: "state_update",
        relation_path: [`relations.${prefix}_writes_state`],
      },
      {
        from: `${prefix}_state`,
        to: `${prefix}_module`,
        kind: "state_update",
        relation_path: [`relations.${prefix}_state_reenters`],
      },
    ],
  };
}

test("cycle-closing right-to-left state updates become feedback", () => {
  const cycle = stateCycle("decoder", 100, 300);
  const indexes = feedbackEdgeIndexes(cycle.edges, new Map(cycle.boxes));

  assert.deepEqual([...indexes], [1]);
});

test("ordinary forward state updates do not become feedback", () => {
  const edges = [{ from: "input", to: "module", kind: "state_update" }];
  const boxes = new Map([["input", box(100)], ["module", box(300)]]);

  assert.deepEqual([...feedbackEdgeIndexes(edges, boxes)], []);
});

test("explicit route overrides take precedence over inferred feedback", () => {
  const cycle = stateCycle("decoder", 100, 300);
  cycle.edges[1].route_side = "top";

  assert.deepEqual([...feedbackEdgeIndexes(cycle.edges, new Map(cycle.boxes))], []);
});

test("overlapping feedback spans use separate rails and disjoint spans reuse one", () => {
  const first = stateCycle("first", 100, 300);
  const nested = stateCycle("nested", 180, 420);
  const disjoint = stateCycle("disjoint", 600, 780);
  const edges = [...first.edges, ...nested.edges, ...disjoint.edges];
  const boxes = new Map([...first.boxes, ...nested.boxes, ...disjoint.boxes]);
  const lanes = allocateFeedbackLanes(edges, boxes, {
    baseClearance: 40,
    laneStep: 20,
    intervalGap: 0,
  });

  assert.equal(lanes.get(1).lane, 0);
  assert.equal(lanes.get(3).lane, 1);
  assert.equal(lanes.get(5).lane, 0);
  assert.equal(lanes.get(1).clearance, 40);
  assert.equal(lanes.get(3).clearance, 60);
  assert.equal(lanes.get(1).side, "bottom");
});

test("contracted segment kinds retain state-update semantics", () => {
  assert.deepEqual(
    semanticKindsForEdge({ segments: [{ kind: "data_flow" }, { kind: "state_update" }] }),
    ["data_flow", "state_update"],
  );
});

test("explicit bottom routes reserve their rail from overlapping inferred feedback", () => {
  const explicit = stateCycle("explicit", 100, 320);
  explicit.edges[1].route_side = "bottom";
  explicit.edges[1].route_clearance = 40;
  const inferred = stateCycle("inferred", 180, 420);
  const edges = [...explicit.edges, ...inferred.edges];
  const boxes = new Map([...explicit.boxes, ...inferred.boxes]);

  const lanes = allocateFeedbackLanes(edges, boxes, {
    baseClearance: 40,
    laneStep: 20,
    intervalGap: 0,
  });

  assert.equal(lanes.has(1), false);
  assert.equal(lanes.get(3).lane, 1);
  assert.equal(lanes.get(3).clearance, 60);
});
