import assert from "node:assert/strict";
import test from "node:test";

import {
  createWorkspaceSelection,
  edgeSelectionKey,
  selectionMatchesEdge,
  selectionMessageProjection,
  targetFromSelection,
} from "../renderer/architecture/workspace-selection.mjs";

test("node selection keeps runtime target and projects a disposable typed reference", () => {
  const node = { id: "encoder", module_ref: "encoder" };
  const selection = createWorkspaceSelection({ kind: "node", node }, "overview");

  assert.equal(selection.canonicalRef, "modules.encoder");
  assert.deepEqual(targetFromSelection(selection), { kind: "node", node });
  assert.deepEqual(selectionMessageProjection(selection), {
    kind: "node",
    boardId: "overview",
    occurrenceId: "encoder",
    canonicalRef: "modules.encoder",
  });
});

test("edge selection identity survives projected edge object replacement", () => {
  const first = {
    id: "rendered_1",
    from: "input",
    to: "encoder",
    relation_path: ["relations.input_enters_encoder", "relations.encoder_reads_input"],
  };
  const replacement = { ...first, id: "rendered_2" };
  const selection = createWorkspaceSelection({ kind: "edge", edge: first }, "overview");

  assert.equal(edgeSelectionKey(first), "relations.input_enters_encoder>relations.encoder_reads_input");
  assert(selectionMatchesEdge(selection, "overview", replacement));
  assert(!selectionMatchesEdge(selection, "detail", replacement));
  assert.deepEqual(selectionMessageProjection(selection).relationPath, first.relation_path);
});
