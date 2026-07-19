import test from "node:test";
import assert from "node:assert/strict";

import {
  enumerateOrthogonalSegments,
  measureEdgeAnnotation,
  placeEdgeAnnotation,
} from "../renderer/architecture/edge-annotations.mjs";

test("measured labels and badge lines form one padded annotation block", () => {
  assert.deepEqual(measureEdgeAnnotation({
    labelWidth: 80,
    badgeLineWidths: [60, 100],
    labelHeight: 14,
    badgeLineHeight: 10,
    badgeLineGap: 2,
    groupGap: 4,
    paddingX: 3,
    paddingY: 2,
  }), { width: 106, height: 44 });

  assert.deepEqual(measureEdgeAnnotation(), { width: 0, height: 0 });
  assert.deepEqual(
    measureEdgeAnnotation({ badgeLineWidths: [50, 0], badgeLineHeight: 10 }),
    { width: 58, height: 14 },
  );
});

test("all nondegenerate orthogonal route segments retain their route indices", () => {
  const segments = enumerateOrthogonalSegments([
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 50 },
    { x: 40, y: 50 },
    { x: 70, y: 80 },
    { x: 100, y: 80 },
  ]);

  assert.deepEqual(segments.map(({ index, orientation, length, interior }) => ({
    index,
    orientation,
    length,
    interior,
  })), [
    { index: 0, orientation: "horizontal", length: 40, interior: false },
    { index: 1, orientation: "vertical", length: 50, interior: true },
    { index: 4, orientation: "horizontal", length: 30, interior: false },
  ]);
});

test("an interior segment wins over a longer endpoint segment", () => {
  const placement = placeEdgeAnnotation({
    route: [
      { x: 0, y: 0 },
      { x: 120, y: 0 },
      { x: 120, y: 60 },
      { x: 190, y: 60 },
    ],
    size: { width: 40, height: 20 },
    segmentPadding: 5,
    crossAxisGap: 8,
  });

  assert.equal(placement.segment.index, 1);
  assert.equal(placement.segment.orientation, "vertical");
  assert.equal(placement.side, "right");
  assert.deepEqual(placement.box, { x: 128, y: 20, width: 40, height: 20 });
});

test("horizontal annotations try the opposite side when a node blocks the preferred side", () => {
  const placement = placeEdgeAnnotation({
    route: [{ x: 0, y: 40 }, { x: 120, y: 40 }],
    size: { width: 60, height: 20 },
    obstacles: [{ x: 40, y: 8, width: 40, height: 20 }],
    segmentPadding: 10,
    crossAxisGap: 6,
    obstaclePadding: 6,
  });

  assert.equal(placement.side, "below");
  assert.deepEqual(placement.box, { x: 30, y: 46, width: 60, height: 20 });
});

test("occupied annotation boxes receive clearance and force the next route segment", () => {
  const placement = placeEdgeAnnotation({
    route: [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 100 },
      { x: 130, y: 100 },
      { x: 130, y: 140 },
    ],
    size: { width: 50, height: 20 },
    occupied: [
      { x: 36, y: 40, width: 50, height: 20 },
      { x: -26, y: 40, width: 50, height: 20 },
    ],
    segmentPadding: 5,
    crossAxisGap: 6,
    occupiedPadding: 4,
  });

  assert.equal(placement.segment.index, 2);
  assert.equal(placement.side, "above");
  assert.deepEqual(placement.box, { x: 55, y: 74, width: 50, height: 20 });
});

test("too-short or fully blocked routes have no annotation placement", () => {
  assert.equal(placeEdgeAnnotation({
    route: [{ x: 0, y: 0 }, { x: 60, y: 0 }],
    size: { width: 50, height: 20 },
    segmentPadding: 6,
  }), null);

  assert.equal(placeEdgeAnnotation({
    route: [{ x: 0, y: 30 }, { x: 100, y: 30 }],
    size: { width: 40, height: 20 },
    obstacles: [{ x: 0, y: 0, width: 100, height: 60 }],
    obstaclePadding: 0,
  }), null);
});
