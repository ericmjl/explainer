import test from "node:test";
import assert from "node:assert/strict";

import {
  carriedRepresentationRefs,
  edgeFlowProfile,
  nodeFlowProfile,
  nodeFlowProfiles,
  representationFlowFamily,
} from "../renderer/architecture/flow-families.mjs";

const representations = new Map([
  ["single_features", { id: "single_features", shape: "B x N x 384" }],
  ["pair_features", { id: "pair_features", shape: "B x N x N x 128" }],
  ["token_coordinates", {
    id: "token_coordinates",
    shape: "B x N x 3",
    glyph: "coordinates",
  }],
  ["token_frames", {
    id: "token_frames",
    shape: "B x N x (3 x 3 + 3)",
    glyph: "frames",
  }],
  ["displacements", { id: "displacements", shape: "B x N x 3" }],
]);

const relations = new Map([
  ["relations.single_path", {
    id: "single_path",
    carries: ["representations.single_features"],
  }],
  ["relations.pair_path", {
    id: "pair_path",
    carries: ["representations.pair_features"],
  }],
]);

const indexes = { repsById: representations, relationsById: relations };

test("canonical glyphs own geometry while shapes infer only single and pair families", () => {
  assert.equal(representationFlowFamily(representations.get("single_features")), "single");
  assert.equal(representationFlowFamily(representations.get("pair_features")), "pair");
  assert.equal(representationFlowFamily(representations.get("token_coordinates")), "coordinates");
  assert.equal(representationFlowFamily(representations.get("token_frames")), "frames");
  assert.equal(representationFlowFamily(representations.get("displacements")), null);
});

test("direct projected carries determine one payload family", () => {
  const profile = edgeFlowProfile({
    carries: ["representations.single_features"],
  }, indexes);

  assert.equal(profile.family, "single");
  assert.deepEqual(profile.families, ["single"]);
  assert.deepEqual(profile.representation_refs, ["representations.single_features"]);
});

test("contracted same-family paths stay colored and transformations become mixed", () => {
  const same = edgeFlowProfile({
    projection: "contracted",
    segments: [
      { carries: ["representations.single_features"] },
      { relation_ref: "relations.single_path" },
    ],
  }, indexes);
  const transformed = edgeFlowProfile({
    projection: "contracted",
    kind: "conditioning",
    segments: [
      { relation_ref: "relations.single_path" },
      { relation_ref: "relations.pair_path" },
    ],
  }, indexes);

  assert.equal(same.family, "single");
  assert.deepEqual(same.families, ["single"]);
  assert.equal(transformed.family, "mixed");
  assert.deepEqual(transformed.families, ["single", "pair"]);
});

test("relation-path fallback and unknown representations preserve known families", () => {
  const edge = {
    relation_path: ["relations.single_path"],
    carries: ["representations.unknown"],
  };

  assert.deepEqual(carriedRepresentationRefs(edge, indexes), [
    "representations.unknown",
    "representations.single_features",
  ]);
  assert.equal(edgeFlowProfile(edge, indexes).family, "single");
});

test("node profiles prefer outputs and ignore conditioning when choosing a card family", () => {
  const edges = [
    {
      from: "pair_state",
      to: "attention",
      tone: "conditioning",
      carries: ["representations.pair_features"],
    },
    {
      from: "single_state",
      to: "attention",
      kind: "data_flow",
      carries: ["representations.single_features"],
    },
    {
      from: "attention",
      to: "updated_single",
      kind: "state_update",
      carries: ["representations.single_features"],
    },
  ];

  assert.deepEqual(nodeFlowProfile("attention", edges, indexes), {
    source: "outgoing",
    family: "single",
    families: ["single"],
  });
});

test("representation nodes keep their canonical family across representation-changing edges", () => {
  const framesNode = {
    id: "updated_frames",
    kind: "representation",
    rep_ref: "token_frames",
  };
  const edges = [
    {
      from: "updated_frames",
      to: "coordinate_output",
      kind: "data_flow",
      carries: ["representations.token_coordinates"],
    },
  ];

  assert.deepEqual(nodeFlowProfile(framesNode, edges, indexes), {
    source: "representation",
    family: "frames",
    families: ["frames"],
  });
  assert.equal(nodeFlowProfiles([framesNode], edges, indexes).get("updated_frames").family, "frames");
});

test("multiple recognized outputs are mixed and a unique ordinary input is the fallback", () => {
  const edges = [
    {
      from: "latent_transformer",
      to: "single_output",
      kind: "state_update",
      carries: ["representations.single_features"],
    },
    {
      from: "latent_transformer",
      to: "pair_output",
      kind: "state_update",
      carries: ["representations.pair_features"],
    },
    {
      from: "pair_input",
      to: "pair_transition",
      kind: "data_flow",
      carries: ["representations.pair_features"],
    },
    {
      from: "conditioning_only",
      to: "sink",
      kind: "conditioning",
      carries: ["representations.single_features"],
    },
  ];

  assert.equal(nodeFlowProfile("latent_transformer", edges, indexes).family, "mixed");
  assert.deepEqual(nodeFlowProfile("pair_transition", edges, indexes), {
    source: "incoming",
    family: "pair",
    families: ["pair"],
  });
  assert.deepEqual(nodeFlowProfile("sink", edges, indexes), {
    source: "none",
    family: "default",
    families: [],
  });

  const profiles = nodeFlowProfiles([
    { id: "latent_transformer" },
    { id: "pair_transition" },
  ], edges, indexes);
  assert.equal(profiles.get("latent_transformer").family, "mixed");
  assert.equal(profiles.get("pair_transition").family, "pair");
});
