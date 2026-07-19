import assert from "node:assert/strict";
import test from "node:test";

import {
  alignmentForNode,
  buildAlignmentIndex,
} from "../renderer/architecture/comparison-board-renderer.mjs";

const comparison = {
  alignments: [
    {
      id: "scalar_projection",
      relationship: "analogous",
      label: "Scalar Q/K/V projection",
      groupRef: "groups.shared",
      explanation: "Both sides form scalar query, key, and value terms.",
      evidence: {
        status: "confirmed_from_code",
        refs: [{ source_ref: "implementation", locator: "Attention.forward" }],
      },
      primaryFacts: [
        {
          factRef: "block_instances.reduced.steps.project_qkv",
          templateFactRef: "standard_blocks.pair_attention.steps.project_qkv",
          nodeIds: ["project_qkv"],
        },
      ],
      counterpartFacts: [
        {
          factRef: "block_instances.full.steps.project_scalar_terms",
          templateFactRef: "standard_blocks.ipa.steps.project_scalar_terms",
          nodeIds: ["project_scalar_terms"],
        },
      ],
    },
    {
      id: "point_path",
      relationship: "counterpart_only",
      explanation: "Only full IPA has the frame-aware point path.",
      primaryFacts: [],
      counterpartFacts: [
        {
          factRef: "block_instances.full.steps.point_distance_logits",
          templateFactRef: "standard_blocks.ipa.steps.point_distance_logits",
          nodeIds: ["point_distance_logits"],
        },
      ],
    },
  ],
};

test("compiled comparison facts resolve by instance, template, and local node identity", () => {
  const counterpart = buildAlignmentIndex(comparison, "counterpart");
  const expected = counterpart.get("block_instances.full.steps.project_scalar_terms");

  assert.equal(expected.id, "scalar_projection");
  assert.equal(expected.number, 1);
  assert.equal(expected.label, "Scalar Q/K/V projection");
  assert.equal(expected.groupRef, "groups.shared");
  assert.equal(expected.relationship, "analogous");
  assert.equal(expected.evidence.status, "confirmed_from_code");
  assert.equal(expected.evidence.refs[0].locator, "Attention.forward");
  assert.equal(
    counterpart.get("standard_blocks.ipa.steps.project_scalar_terms"),
    expected,
  );
  assert.equal(counterpart.get("project_scalar_terms"), expected);
});

test("primary and counterpart indexes never leak facts across surfaces", () => {
  const primary = buildAlignmentIndex(comparison, "primary");
  const counterpart = buildAlignmentIndex(comparison, "counterpart");

  assert(primary.has("project_qkv"));
  assert(!primary.has("point_distance_logits"));
  assert(counterpart.has("point_distance_logits"));
  assert(!counterpart.has("project_qkv"));
});

test("node matching prefers local compiled identity and falls back to stable fact refs", () => {
  const counterpart = buildAlignmentIndex(comparison, "counterpart");

  assert.equal(
    alignmentForNode({ id: "point_distance_logits" }, counterpart).id,
    "point_path",
  );
  assert.equal(
    alignmentForNode({
      id: "reflowed_projection",
      instance_fact_ref: "block_instances.full.steps.project_scalar_terms",
    }, counterpart).id,
    "scalar_projection",
  );
  assert.equal(alignmentForNode({ id: "unmapped" }, counterpart), null);
});
