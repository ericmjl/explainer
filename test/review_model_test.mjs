import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEdgeReviewOperation,
  buildNodeReviewOperations,
  createReviewPlan,
  operationKey,
} from "../review/review-model.mjs";

test("component review maps global and board-only prose to distinct fact owners", () => {
  const base = {
    selection: { canonicalRef: "modules.encoder" },
    board: { id: "overview" },
    occurrence: { id: "encoder", ref: "modules.encoder", role: "Local role" },
    module: { role: "Global role" },
    decision: "visible",
  };
  assert.deepEqual(buildNodeReviewOperations({ ...base, scope: "global", nextRole: "Clear globally" }), [{
    op: "update_entity",
    ref: "modules.encoder",
    expect: { role: "Global role" },
    set: { role: "Clear globally" },
  }]);
  assert.deepEqual(buildNodeReviewOperations({ ...base, scope: "board", nextRole: "Clear here" }), [{
    op: "update_view_entity",
    ref: "boards.overview.nodes.encoder",
    expect: { role: "Local role" },
    set: { role: "Clear here" },
  }]);
});

test("board simplification is explicit and exclusion requires a reason", () => {
  const base = {
    selection: { canonicalRef: "value_sites.hidden" },
    board: { id: "detail" },
    occurrence: { id: "hidden", ref: "value_sites.hidden" },
    scope: "board",
    nextRole: "",
  };
  assert.throws(
    () => buildNodeReviewOperations({ ...base, decision: "excluded" }),
    /Explain why/,
  );
  assert.equal(
    buildNodeReviewOperations({ ...base, decision: "elided" })[0].op,
    "set_board_visibility",
  );
});

test("connection review retains ordered provenance and plans are v0.2", () => {
  const operation = buildEdgeReviewOperation({
    boardId: "detail",
    relationPath: ["relations.a", "relations.b"],
    label: "context",
    connection: { title: "Context", role: "conditioning", inside: "The target reads it." },
  });
  assert.deepEqual(operation.match, { relation_path: ["relations.a", "relations.b"] });
  assert.match(operationKey(operation), /^set_edge_override:detail:/);

  const plan = createReviewPlan({
    sourceSet: "genie3",
    intent: "Review copy",
    operations: [operation],
    timestamp: 1_750_000_000_000,
  });
  assert.equal(plan.schema_version, "architecture-edit-v0.2");
  assert.equal(plan.id, "review_genie3_1750000000");
});
