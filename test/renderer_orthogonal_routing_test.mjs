import test from "node:test";
import assert from "node:assert/strict";

import {
  clearFacingPortPlan,
  DEFAULT_ARROW_LANDING,
  endpointRunLength,
  ensureMinimumLanding,
  fitEndpointStubLengths,
  separateParallelSegments,
} from "../renderer/architecture/orthogonal-routing.mjs";

function orthogonal(points) {
  return points.slice(1).every((point, index) => (
    point.x === points[index].x || point.y === points[index].y
  ));
}

function hasBacktrack(points) {
  for (let index = 1; index < points.length - 1; index += 1) {
    const before = points[index - 1];
    const point = points[index];
    const after = points[index + 1];
    const incoming = {
      x: Math.sign(point.x - before.x),
      y: Math.sign(point.y - before.y),
    };
    const outgoing = {
      x: Math.sign(after.x - point.x),
      y: Math.sign(after.y - point.y),
    };
    if (incoming.x === -outgoing.x && incoming.y === -outgoing.y) return true;
  }
  return false;
}

test("short landings are extended on every target side without moving endpoints", () => {
  const fixtures = [
    [[20, 0], [84, 0], [84, 100], [100, 100]],
    [[180, 0], [116, 0], [116, 100], [100, 100]],
    [[0, 20], [0, 84], [100, 84], [100, 100]],
    [[0, 180], [0, 116], [100, 116], [100, 100]],
  ].map((route) => route.map(([x, y]) => ({ x, y })));

  fixtures.forEach((input) => {
    const snapshot = structuredClone(input);
    const output = ensureMinimumLanding(input, DEFAULT_ARROW_LANDING);

    assert.deepEqual(input, snapshot, "input route was mutated");
    assert.deepEqual(output[0], input[0], "source endpoint moved");
    assert.deepEqual(output.at(-1), input.at(-1), "target endpoint moved");
    assert.ok(endpointRunLength(output) >= DEFAULT_ARROW_LANDING);
    assert.equal(orthogonal(output), true);
    assert.equal(hasBacktrack(output), false);
  });
});

test("already readable and straight routes keep their geometry", () => {
  const long = [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 100 },
    { x: 100, y: 100 },
  ];
  const straight = [{ x: 0, y: 0 }, { x: 18, y: 0 }];

  assert.deepEqual(ensureMinimumLanding(long), long);
  assert.deepEqual(ensureMinimumLanding(straight), straight);
});

test("narrow opposing gaps reserve arrival space before departure space", () => {
  assert.deepEqual(fitEndpointStubLengths(null, 20, 32), [20, 32]);
  assert.deepEqual(fitEndpointStubLengths(80, 20, 32), [20, 32]);
  assert.deepEqual(fitEndpointStubLengths(50, 20, 32), [20, 30]);
  assert.deepEqual(fitEndpointStubLengths(30, 20, 32), [15, 15]);
});

test("a clear mixed-height horizontal chain uses facing ports without U-turns", () => {
  const tensor = { x: 737, y: 369, width: 112, height: 154 };
  const transition = { x: 873, y: 395, width: 157, height: 102 };

  assert.deepEqual(clearFacingPortPlan(tensor, transition), {
    exitSide: "right",
    enterSide: "left",
    start: { x: 849, y: 446 },
    end: { x: 873, y: 446 },
  });
  assert.deepEqual(clearFacingPortPlan(transition, tensor), {
    exitSide: "left",
    enterSide: "right",
    start: { x: 873, y: 446 },
    end: { x: 849, y: 446 },
  });
});

test("a blocked corridor falls back to the general obstacle-aware router", () => {
  const from = { x: 0, y: 20, width: 80, height: 80 };
  const to = { x: 220, y: 0, width: 80, height: 120 };
  const obstacle = { x: 110, y: 40, width: 40, height: 40 };

  assert.equal(clearFacingPortPlan(from, to, [obstacle]), null);
});

test("parallel rail separation never consumes the arrow landing", () => {
  const routes = new Map([
    [0, [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 60 },
      { x: 40, y: 60 },
      { x: 40, y: 100 },
      { x: 72, y: 100 },
    ]],
    [1, [
      { x: 0, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 60 },
      { x: 40, y: 60 },
      { x: 40, y: 100 },
      { x: 72, y: 100 },
    ]],
  ]);

  separateParallelSegments(routes, {
    nudge: 10,
    minimumDeparture: 20,
    minimumArrival: 32,
  });

  routes.forEach((points) => {
    assert.ok(endpointRunLength(points) >= 32);
    assert.equal(orthogonal(points), true);
    assert.equal(hasBacktrack(points), false);
  });
});
