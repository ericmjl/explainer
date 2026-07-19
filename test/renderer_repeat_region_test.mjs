import test from "node:test";
import assert from "node:assert/strict";

import {
  edgeIsRepresentedByRepeatRegion,
  executionLoopForRef,
  repeatRegionAccessibleLabel,
  repeatRegionBounds,
  representedIterationRelationRefs,
} from "../renderer/architecture/repeat-regions.mjs";

const board = {
  regions: [{
    id: "one_block",
    kind: "repeat",
    execution_ref: "execution.loops.stack",
    label: "one block",
    node_ids: ["s_i", "block", "s_next"],
    iteration_relation_refs: ["relations.advance_state"],
  }],
};

test("repeat regions resolve their canonical execution loop", () => {
  const execution = { loops: [{ id: "stack", repeats: 5 }] };
  const loop = executionLoopForRef(execution, board.regions[0].execution_ref);

  assert.equal(loop.repeats, 5);
  assert.equal(executionLoopForRef(execution, "modules.stack"), null);
  assert.equal(
    repeatRegionAccessibleLabel(board.regions[0], loop),
    "one block. Repeated 5 times; indexed outputs become the next iteration's inputs.",
  );
});

test("only direct iteration relations are represented by the enclosure", () => {
  const refs = representedIterationRelationRefs(board);

  assert.equal(
    edgeIsRepresentedByRepeatRegion(
      { relation_path: ["relations.advance_state"] },
      refs,
    ),
    true,
  );
  assert.equal(
    edgeIsRepresentedByRepeatRegion(
      { relation_path: ["relations.compute", "relations.advance_state"] },
      refs,
    ),
    false,
  );
  assert.equal(
    edgeIsRepresentedByRepeatRegion(
      { relation_ref: "relations.ordinary_flow" },
      refs,
    ),
    false,
  );
});

test("repeat region bounds wrap all members with asymmetric header padding", () => {
  const bounds = repeatRegionBounds([
    { x: 100, y: 80, width: 60, height: 40 },
    { x: 240, y: 140, width: 80, height: 50 },
  ], { left: 10, right: 12, top: 30, bottom: 14 });

  assert.deepEqual(bounds, {
    x: 90,
    y: 50,
    width: 242,
    height: 154,
  });
});

test("a repeat enclosure is not drawn from a partial set of measured members", () => {
  assert.equal(repeatRegionBounds([
    { x: 100, y: 80, width: 60, height: 40 },
    null,
  ]), null);
});
