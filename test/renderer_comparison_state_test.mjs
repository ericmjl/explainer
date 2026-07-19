import assert from "node:assert/strict";
import test from "node:test";

import {
  comparisonHistoryMode,
  parseComparisonLink,
  resolveComparisonState,
  setComparisonSelection,
  writeComparisonLink,
} from "../renderer/architecture/comparison-state.mjs";

const architectures = [
  {
    id: "genie3",
    rootBoardId: "genie3_root",
    boards: [
      {
        id: "genie3_root",
        nodes: [
          { id: "reduced_ipa", board_ref: "reduced_ipa_internals" },
          { id: "full_ipa", board_ref: "full_ipa_internals" },
        ],
      },
      {
        id: "reduced_ipa_internals",
        kind: "standard_block_instance",
        nodes: [
          { id: "reduced_scalar_attention" },
          { id: "reduced_pair_values" },
        ],
      },
      {
        id: "full_ipa_internals",
        kind: "standard_block_instance",
        nodes: [
          { id: "scalar_attention" },
          { id: "point_distance_logits" },
        ],
      },
    ],
  },
  {
    manifest: {
      architecture: { id: "dit" },
      boards: {
        rootBoard: "dit_root",
        items: [
          {
            id: "dit_root",
            nodes: [{ id: "dit_block", board_ref: "dit_block_internals" }],
          },
          { id: "dit_block_internals", nodes: [{ id: "self_attention" }] },
        ],
      },
    },
  },
];

test("comparison links parse primary and counterpart locations without touching unrelated params", () => {
  const parsed = parseComparisonLink(
    "?arch=genie3&board=reduced_ipa_internals&node=reduced_scalar_attention" +
      "&compare_arch=dit&compare_board=dit_block_internals&compare_node=self_attention" +
      "&layout=elk",
  );

  assert.deepEqual(parsed.primary, {
    architectureId: "genie3",
    boardId: "reduced_ipa_internals",
    nodeId: "reduced_scalar_attention",
    hasArchitecture: true,
    hasBoard: true,
    hasNode: true,
  });
  assert.deepEqual(parsed.comparison, {
    architectureId: "dit",
    boardId: "dit_block_internals",
    nodeId: "self_attention",
    hasArchitecture: true,
    hasBoard: true,
    hasNode: true,
  });
  assert.deepEqual(parsed.issues, []);
});

test("a reduced IPA and full IPA board resolve independently within one architecture", () => {
  const state = resolveComparisonState({
    architectures,
    defaultArchitectureId: "genie3",
    search: "?board=reduced_ipa_internals&compare_arch=genie3" +
      "&compare_board=full_ipa_internals&compare_node=point_distance_logits&layout=elk",
  });

  assert.deepEqual(state.primary.boardStack, ["genie3_root", "reduced_ipa_internals"]);
  assert.equal(state.primary.nodeId, null);
  assert.deepEqual(state.comparison.boardStack, ["genie3_root", "full_ipa_internals"]);
  assert.equal(state.comparison.nodeId, "point_distance_logits");
  assert.equal(state.comparison.selectedNode.id, "point_distance_logits");
  assert.equal(state.selectionSide, "comparison");
  assert.equal(state.sanitized, false);
  assert.equal(
    state.canonicalSearch,
    "?board=reduced_ipa_internals&compare_arch=genie3" +
      "&compare_board=full_ipa_internals&compare_node=point_distance_logits&layout=elk",
  );
});

test("an unknown comparison architecture is removed without disturbing the primary board", () => {
  const state = resolveComparisonState({
    architectures,
    defaultArchitectureId: "genie3",
    search: "?arch=genie3&board=reduced_ipa_internals&node=reduced_scalar_attention" +
      "&compare_arch=missing&compare_board=whatever&compare_node=nope&theme=paper",
  });

  assert.equal(state.primary.boardId, "reduced_ipa_internals");
  assert.equal(state.primary.nodeId, "reduced_scalar_attention");
  assert.equal(state.comparison, null);
  assert.equal(state.selectionSide, "primary");
  assert(state.issues.some(({ code }) => code === "unknown_compare_arch"));
  assert.equal(
    state.canonicalSearch,
    "?board=reduced_ipa_internals&node=reduced_scalar_attention&theme=paper",
  );
});

test("an invalid counterpart board falls back only that side to its root", () => {
  const state = resolveComparisonState({
    architectures,
    defaultArchitectureId: "genie3",
    search: "?board=reduced_ipa_internals&node=reduced_scalar_attention" +
      "&compare_arch=dit&compare_board=missing&compare_node=dit_block&layout=elk",
  });

  assert.equal(state.primary.boardId, "reduced_ipa_internals");
  assert.equal(state.primary.nodeId, "reduced_scalar_attention");
  assert.equal(state.comparison.architectureId, "dit");
  assert.equal(state.comparison.boardId, "dit_root");
  assert.equal(state.comparison.nodeId, null);
  assert(state.issues.some(({ code }) => code === "unknown_compare_board"));
  assert(state.issues.some(
    ({ code }) => code === "discarded_compare_node_for_invalid_compare_board",
  ));
  assert.equal(
    state.canonicalSearch,
    "?board=reduced_ipa_internals&node=reduced_scalar_attention" +
      "&compare_arch=dit&layout=elk",
  );
});

test("a stale primary node does not erase a valid counterpart selection", () => {
  const state = resolveComparisonState({
    architectures,
    defaultArchitectureId: "genie3",
    search: "?board=reduced_ipa_internals&node=missing" +
      "&compare_arch=dit&compare_board=dit_block_internals&compare_node=self_attention",
  });

  assert.equal(state.primary.nodeId, null);
  assert.equal(state.comparison.nodeId, "self_attention");
  assert.equal(state.selectionSide, "comparison");
  assert(state.issues.some(({ code }) => code === "unknown_node"));
  assert.equal(
    state.canonicalSearch,
    "?board=reduced_ipa_internals&compare_arch=dit" +
      "&compare_board=dit_block_internals&compare_node=self_attention",
  );
});

test("a malformed link with two selections canonicalizes to one selected side", () => {
  const state = resolveComparisonState({
    architectures,
    defaultArchitectureId: "genie3",
    search: "?board=reduced_ipa_internals&node=reduced_pair_values" +
      "&compare_arch=genie3&compare_board=full_ipa_internals" +
      "&compare_node=scalar_attention",
  });

  assert.equal(state.primary.nodeId, "reduced_pair_values");
  assert.equal(state.comparison.nodeId, null);
  assert.equal(state.comparison.selectedNode, null);
  assert.equal(state.selectionSide, "primary");
  assert(state.issues.some(({ code }) => code === "multiple_selected_sides"));
  assert.equal(
    state.canonicalSearch,
    "?board=reduced_ipa_internals&node=reduced_pair_values" +
      "&compare_arch=genie3&compare_board=full_ipa_internals",
  );
});

test("writing comparison state preserves foreign params and selects only one side", () => {
  const search = writeComparisonLink(
    "?arch=old&board=old_board&node=old_node&layout=elk&theme=paper" +
      "&compare_arch=old_compare&compare_board=old_detail&compare_node=old_step",
    {
      defaultArchitectureId: "generic",
      primary: {
        architectureId: "genie3",
        rootBoardId: "genie3_root",
        boardId: "reduced_ipa_internals",
        nodeId: "reduced_pair_values",
      },
      comparison: {
        architectureId: "dit",
        rootBoardId: "dit_root",
        boardId: "dit_block_internals",
        nodeId: "self_attention",
      },
      selectionSide: "comparison",
    },
  );

  assert.equal(
    search,
    "?arch=genie3&board=reduced_ipa_internals&layout=elk&theme=paper" +
      "&compare_arch=dit&compare_board=dit_block_internals&compare_node=self_attention",
  );
});

test("selection transitions clear the other surface and preserve both locations", () => {
  const initial = resolveComparisonState({
    architectures,
    defaultArchitectureId: "genie3",
    search: "?board=reduced_ipa_internals&node=reduced_scalar_attention" +
      "&compare_arch=genie3&compare_board=full_ipa_internals",
  });
  const pointNode = { id: "point_distance_logits" };
  const selected = setComparisonSelection(initial, {
    side: "comparison",
    selectedNode: pointNode,
  });

  assert.equal(selected.primary.boardId, "reduced_ipa_internals");
  assert.equal(selected.primary.nodeId, null);
  assert.equal(selected.primary.selectedNode, null);
  assert.equal(selected.comparison.boardId, "full_ipa_internals");
  assert.equal(selected.comparison.nodeId, "point_distance_logits");
  assert.equal(selected.comparison.selectedNode, pointNode);
  assert.equal(selected.selectionSide, "comparison");
});

test("comparison history pushes locations and replaces inspector selection", () => {
  const primary = {
    architectureId: "genie3",
    boardId: "reduced_ipa_internals",
    nodeId: null,
  };
  const comparison = {
    architectureId: "genie3",
    boardId: "full_ipa_internals",
    nodeId: null,
  };
  assert.equal(comparisonHistoryMode(null, { primary, comparison: null }), "replace");
  assert.equal(comparisonHistoryMode(
    { primary, comparison: null },
    { primary, comparison },
  ), "push");
  assert.equal(comparisonHistoryMode(
    { primary, comparison },
    {
      primary,
      comparison: { ...comparison, nodeId: "point_distance_logits" },
      selectionSide: "comparison",
    },
  ), "replace");
  assert.equal(comparisonHistoryMode(
    { primary, comparison },
    { primary, comparison },
  ), "none");
});
