import test from "node:test";
import assert from "node:assert/strict";

import {
  allocateContentGridGutters,
  allocateContentGridRowGutters,
  balancedTextLines,
  contentGridWidth,
  edgeLabelFits,
} from "../renderer/architecture/content-grid.mjs";

test("unlabelled boundaries keep the authored base gap", () => {
  assert.deepEqual(
    allocateContentGridGutters({
      columnWidths: [180, 240, 160],
      baseGap: 42,
    }),
    [42, 42],
  );
});

test("a label reserves only its measured width plus compact padding", () => {
  assert.deepEqual(
    allocateContentGridGutters({
      columnWidths: [200, 200],
      baseGap: 42,
      labelPadding: 16,
      edges: [{
        fromRank: 0,
        toRank: 1,
        textWidth: 80,
        availableSpan: 42,
      }],
    }),
    [96],
  );
});

test("route space from narrow endpoints is credited before widening a shared gutter", () => {
  assert.deepEqual(
    allocateContentGridGutters({
      columnWidths: [300, 300],
      baseGap: 42,
      labelPadding: 16,
      edges: [{
        fromRank: 1,
        toRank: 0,
        textWidth: 248,
        availableSpan: 136,
      }],
    }),
    [170],
  );
});

test("the widest adjacent label wins and nonadjacent labels do not inflate a gutter", () => {
  const gutters = allocateContentGridGutters({
    columnWidths: [200, 200, 200],
    baseGap: 40,
    labelPadding: 16,
    edges: [
      { fromRank: 0, toRank: 1, textWidth: 60, availableSpan: 40 },
      { fromRank: 0, toRank: 1, textWidth: 90, availableSpan: 40 },
      { fromRank: 0, toRank: 2, textWidth: 400, availableSpan: 40 },
    ],
  });

  assert.deepEqual(gutters, [106, 40]);
  assert.equal(contentGridWidth([200, 200, 200], gutters), 746);
});

test("ordinary labels use measured fit while semantic labels may be forced", () => {
  assert.equal(edgeLabelFits({ span: 88, textWidth: 72, padding: 16 }), true);
  assert.equal(edgeLabelFits({ span: 87, textWidth: 72, padding: 16 }), false);
  assert.equal(edgeLabelFits({ span: 20, textWidth: 72, padding: 16, force: true }), true);
});

test("long conditioning badges split into two balanced semantic lines", () => {
  const measure = (text) => text.length * 10;

  assert.deepEqual(
    balancedTextLines("masked sequence and task features", { measure, maxWidth: 160 }),
    ["masked sequence", "and task features"],
  );
  assert.deepEqual(
    balancedTextLines("pair bias", { measure, maxWidth: 160 }),
    ["pair bias"],
  );
});

test("content rows grow only the adjacent boundary with an annotation deficit", () => {
  assert.deepEqual(
    allocateContentGridRowGutters({
      rowHeights: [112, 202, 232, 202],
      baseGap: 24,
      annotationPadding: 24,
      edges: [{
        fromRank: 0,
        toRank: 1,
        annotationHeight: 48,
        availableSpan: 32,
      }],
    }),
    [64, 24, 24],
  );
});

test("content rows ignore unannotated and nonadjacent fan-out edges", () => {
  assert.deepEqual(
    allocateContentGridRowGutters({
      rowHeights: [112, 202, 232, 202],
      baseGap: 18,
      edges: [
        { fromRank: 0, toRank: 1, annotationHeight: 0, availableSpan: 18 },
        { fromRank: 0, toRank: 3, annotationHeight: 80, availableSpan: 18 },
      ],
    }),
    [18, 18, 18],
  );
});
