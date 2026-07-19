import assert from "node:assert/strict";
import test from "node:test";

import {
  deepLinkHistoryMode,
  parseDeepLink,
  reconstructBoardPath,
  resolveDeepLink,
  writeDeepLink,
} from "../renderer/architecture/deep-link-state.mjs";

const boards = [
  {
    id: "root",
    nodes: [
      { id: "sampler", board_ref: "sampling" },
      { id: "ipa", board_ref: "ipa_internals" },
      { id: "hidden_branch", board_ref: "hidden_detail", treatment: "hidden" },
    ],
  },
  {
    id: "sampling",
    nodes: [
      { id: "reverse_step", board_ref: "reverse_step_detail" },
      { id: "sampler_state" },
    ],
  },
  {
    id: "reverse_step_detail",
    nodes: [
      { id: "denoiser" },
      { id: "coordinates" },
    ],
  },
  { id: "hidden_detail", nodes: [{ id: "hidden_leaf" }] },
  {
    id: "ipa_internals",
    kind: "standard_block_instance",
    nodes: [{ id: "point_distance_logits", template_fact_ref: "standard_blocks.invariant_point_attention.steps.point_distance_logits" }],
  },
  { id: "orphan", nodes: [{ id: "orphan_node" }] },
];

test("a terminal board reconstructs its breadcrumb stack and return origins", () => {
  assert.deepEqual(reconstructBoardPath({
    boards,
    rootBoardId: "root",
    targetBoardId: "reverse_step_detail",
  }), {
    boardStack: ["root", "sampling", "reverse_step_detail"],
    boardOrigins: [null, "sampler", "reverse_step"],
  });

  assert.equal(reconstructBoardPath({
    boards,
    rootBoardId: "root",
    targetBoardId: "hidden_detail",
  }), null);
});

test("a board and local node resolve to a complete initial renderer state", () => {
  const result = resolveDeepLink({
    boards,
    rootBoardId: "root",
    search: "?arch=genie3&board=reverse_step_detail&node=denoiser&layout=elk",
  });

  assert.deepEqual(result.boardStack, ["root", "sampling", "reverse_step_detail"]);
  assert.deepEqual(result.boardOrigins, [null, "sampler", "reverse_step"]);
  assert.equal(result.boardId, "reverse_step_detail");
  assert.equal(result.nodeId, "denoiser");
  assert.equal(result.selectedNode.id, "denoiser");
  assert.equal(result.sanitized, false);
  assert.equal(
    result.canonicalSearch,
    "?arch=genie3&board=reverse_step_detail&node=denoiser&layout=elk",
  );
});

test("a reusable component board and internal step have a stable deep link", () => {
  const result = resolveDeepLink({
    boards,
    rootBoardId: "root",
    search: "?arch=genie3&board=ipa_internals&node=point_distance_logits",
  });

  assert.deepEqual(result.boardStack, ["root", "ipa_internals"]);
  assert.deepEqual(result.boardOrigins, [null, "ipa"]);
  assert.equal(result.selectedNode.template_fact_ref, "standard_blocks.invariant_point_attention.steps.point_distance_logits");
  assert.equal(
    result.canonicalSearch,
    "?arch=genie3&board=ipa_internals&node=point_distance_logits",
  );
});

test("unknown or unreachable boards fall back to the root without misapplying a node", () => {
  const unknown = resolveDeepLink({
    boards,
    rootBoardId: "root",
    search: "?arch=genie3&board=missing&node=sampler&theme=paper",
  });
  assert.deepEqual(unknown.boardStack, ["root"]);
  assert.equal(unknown.selectedNode, null);
  assert.deepEqual(unknown.issues.map(({ code }) => code), [
    "unknown_board",
    "discarded_node_for_invalid_board",
  ]);
  assert.equal(unknown.canonicalSearch, "?arch=genie3&theme=paper");
  assert.equal(unknown.sanitized, true);

  const unreachable = resolveDeepLink({
    boards,
    rootBoardId: "root",
    search: "?arch=genie3&board=orphan",
  });
  assert.equal(unreachable.boardId, "root");
  assert.equal(unreachable.issues.at(-1).code, "unreachable_board");
});

test("an invalid node keeps the valid opened board and removes only the stale selection", () => {
  const result = resolveDeepLink({
    boards,
    rootBoardId: "root",
    search: "?arch=genie3&board=sampling&node=not_here&layout=elk",
  });

  assert.deepEqual(result.boardStack, ["root", "sampling"]);
  assert.equal(result.nodeId, null);
  assert.equal(result.issues.at(-1).code, "unknown_node");
  assert.equal(result.canonicalSearch, "?arch=genie3&board=sampling&layout=elk");
});

test("root links are canonical without a redundant board parameter", () => {
  const result = resolveDeepLink({
    boards,
    rootBoardId: "root",
    search: "?arch=genie3&board=root&node=sampler",
  });

  assert.equal(result.boardId, "root");
  assert.equal(result.nodeId, "sampler");
  assert.equal(result.canonicalSearch, "?arch=genie3&node=sampler");
  assert.equal(result.sanitized, true);
  assert(result.issues.some(({ code }) => code === "redundant_root_board"));
});

test("writing a link preserves unrelated parameters and clears stale owned values", () => {
  assert.equal(writeDeepLink(
    "?arch=genie3&board=old&node=old_node&layout=elk&theme=paper",
    { rootBoardId: "root", boardId: "sampling", nodeId: "sampler_state" },
  ), "?arch=genie3&board=sampling&node=sampler_state&layout=elk&theme=paper");

  assert.equal(writeDeepLink(
    "?arch=genie3&board=sampling&node=sampler_state&layout=elk",
    { rootBoardId: "root", boardId: "root" },
  ), "?arch=genie3&layout=elk");
});

test("duplicate and empty owned parameters are reported and canonicalized", () => {
  assert.deepEqual(parseDeepLink("?board=sampling&board=root&node=").issues.map(
    ({ code }) => code,
  ), ["duplicate_board", "empty_node"]);

  const result = resolveDeepLink({
    boards,
    rootBoardId: "root",
    search: "?arch=genie3&board=sampling&board=root&node=",
  });
  assert.equal(result.canonicalSearch, "?arch=genie3&board=sampling");
  assert.equal(result.sanitized, true);
});

test("history pushes semantic board changes but replaces local selection changes", () => {
  assert.equal(deepLinkHistoryMode(null, { boardId: "root" }), "replace");
  assert.equal(deepLinkHistoryMode(
    { boardId: "root", nodeId: null },
    { boardId: "sampling", nodeId: null },
  ), "push");
  assert.equal(deepLinkHistoryMode(
    { boardId: "sampling", nodeId: null },
    { boardId: "sampling", nodeId: "sampler_state" },
  ), "replace");
  assert.equal(deepLinkHistoryMode(
    { boardId: "sampling", nodeId: "sampler_state" },
    { boardId: "sampling", nodeId: "sampler_state" },
  ), "none");
});
