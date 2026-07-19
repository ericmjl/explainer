import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRendererIndexes,
  collectionValues,
  createRendererModel,
  humanizeRef,
  normalizeRendererManifest,
  refNamespace,
  relationRefsForEdge,
  untypedRef,
} from "../renderer/architecture/renderer-model.mjs";

function sourceFixture() {
  return {
    schemaVersion: "architecture-manifest-v0.3",
    architecture: {
      id: "example",
      name: "Example",
      source_yaml: "../../architectures/example.yaml",
      modules: {
        encoder: { id: "encoder", label: "Encoder" },
      },
      block_instances: {
        encoder_attention: {
          id: "encoder_attention",
          subjectRef: "modules.encoder",
          standardBlockId: "pair_biased_attention",
          variant: "logit_bias_only",
        },
      },
      representations: {
        coordinates: {
          id: "coordinates",
          display_label: "coordinates",
          shape: "B x N x 3",
          scale: "token",
        },
      },
      value_sites: {
        input_coordinates: {
          id: "input_coordinates",
          representation_ref: "representations.coordinates",
          display_label: "input coordinates",
          role: "current state",
          shape: "B x N x 3",
          scale: "token",
        },
        output_coordinates: {
          id: "output_coordinates",
          representationRef: "representations.coordinates",
          label: "output coordinates",
        },
      },
      relations: {
        input_enters_encoder: {
          id: "input_enters_encoder",
          from: "value_sites.input_coordinates",
          to: "modules.encoder",
          kind: "data_flow",
          carries: ["representations.coordinates"],
          operation: "encode",
          summary: "Coordinates enter the encoder.",
        },
        encoder_emits_output: {
          id: "encoder_emits_output",
          from: "modules.encoder",
          to: "value_sites.output_coordinates",
          kind: "conditioning",
          carries: ["representations.coordinates"],
          operation: "emit",
          summary: "The encoder emits output coordinates.",
        },
      },
      state_semantics: { coordinate_state: { lifecycle: "iterative_loop_state" } },
      state_semantics_by_site: { input_coordinates: { groupId: "coordinate_state" } },
      value_site_interfaces: { input_coordinates: { consumers: ["modules.encoder"] } },
      scale_transitions: { preserve_tokens: { id: "preserve_tokens" } },
      training_inference: { sampler: { kind: "example" } },
      claims: { equivariant: { id: "equivariant" } },
      conditioning: [
        {
          id: "coordinate_conditioning",
          source: "value_sites.input_coordinates",
          target: "modules.encoder.input",
          relation_ref: "relations.input_enters_encoder",
        },
      ],
    },
    projected_boards: {
      root: {
        id: "root",
        title: "Root",
        graph: {
          nodes: [
            {
              id: "input",
              ref: "value_sites.input_coordinates",
              presentation: { prominence: "primary" },
            },
            { id: "encoder_occurrence", ref: "modules.encoder", moduleRef: "encoder" },
            {
              id: "output",
              canonicalRef: "value_sites.output_coordinates",
              valueSiteRef: "value_sites.output_coordinates",
              repRef: "coordinates",
              boardRef: "output_detail",
            },
          ],
          edges: [
            {
              id: "coordinate_path",
              from: "input",
              to: "output",
              projection: "contracted",
              relationPath: [
                "relations.input_enters_encoder",
                "relations.encoder_emits_output",
              ],
              presentation: {
                label: "coordinate path",
                routeSide: "top",
                routeClearance: 30,
              },
            },
          ],
        },
      },
    },
    boards: { root_board: "root" },
    standard_blocks: {
      pair_biased_attention: { id: "pair_biased_attention", name: "Pair-Biased Attention" },
    },
  };
}

test("reference helpers preserve the renderer compatibility behavior", () => {
  assert.deepEqual(collectionValues({ a: 1, b: 2 }), [1, 2]);
  assert.deepEqual(collectionValues(null), []);
  assert.equal(untypedRef("modules.encoder", "modules"), "encoder");
  assert.equal(untypedRef("modules.encoder", "value_sites"), "modules.encoder");
  assert.equal(refNamespace("value_sites.coordinates"), "value_sites");
  assert.equal(refNamespace("coordinates"), null);
  assert.equal(humanizeRef("value_sites.current_coordinates"), "current coordinates");
  assert.deepEqual(relationRefsForEdge({ relationRef: "relations.one" }), ["relations.one"]);
  assert.deepEqual(
    relationRefsForEdge({ provenanceHops: [{ relationRef: "relations.one" }] }),
    ["relations.one"],
  );
});

test("normalization turns aliases and keyed collections into one renderer shape", () => {
  const source = sourceFixture();
  const manifest = normalizeRendererManifest(source);

  assert.equal(manifest.architecture.sourceYaml, "../../architectures/example.yaml");
  assert.deepEqual(manifest.architecture.modules.map(({ id }) => id), ["encoder"]);
  assert.deepEqual(manifest.architecture.blockInstances.map(({ id }) => id), ["encoder_attention"]);
  assert.deepEqual(manifest.architecture.representations.map(({ id }) => id), ["coordinates"]);
  assert.deepEqual(
    manifest.architecture.valueSites.map(({ id }) => id),
    ["input_coordinates", "output_coordinates"],
  );
  assert.deepEqual(manifest.architecture.scaleTransitions, [{ id: "preserve_tokens" }]);
  assert.deepEqual(manifest.architecture.claims, [{ id: "equivariant" }]);
  assert.equal(manifest.architecture.trainingInference.sampler.kind, "example");
  assert.equal(manifest.architecture.stateSemantics.coordinate_state.lifecycle, "iterative_loop_state");
  assert.equal(manifest.architecture.stateSemanticsBySite.input_coordinates.groupId, "coordinate_state");
  assert.equal(manifest.boards.rootBoard, "root");
  assert.equal(manifest.boards.items.length, 1);

  // The adapter is non-mutating at the collection boundary.
  assert.equal(Array.isArray(source.architecture.modules), false);
  assert.equal(source.projected_boards.root.graph.nodes[0].kind, undefined);
});

test("board normalization binds typed nodes and preserves presentation fields", () => {
  const board = normalizeRendererManifest(sourceFixture()).boards.items[0];
  const [input, encoder, output] = board.nodes;

  assert.deepEqual(input, {
    id: "input",
    ref: "value_sites.input_coordinates",
    prominence: "primary",
    presentation: { prominence: "primary" },
    kind: "representation",
    value_site_ref: "input_coordinates",
    rep_ref: "coordinates",
    label: "input coordinates",
    role: "current state",
    shape: "B x N x 3",
    scale: "token",
  });
  assert.equal(encoder.kind, "module");
  assert.equal(encoder.module_ref, "encoder");
  assert.equal(output.kind, "representation");
  assert.equal(output.value_site_ref, "output_coordinates");
  assert.equal(output.rep_ref, "coordinates");
  assert.equal(output.board_ref, "output_detail");
});

test("projected relation paths become ordered local segments without losing provenance", () => {
  const edge = normalizeRendererManifest(sourceFixture()).boards.items[0].edges[0];

  assert.equal(edge.label, "coordinate path");
  assert.equal(edge.route_side, "top");
  assert.equal(edge.route_clearance, 30);
  assert.deepEqual(edge.relation_path, [
    "relations.input_enters_encoder",
    "relations.encoder_emits_output",
  ]);
  assert.deepEqual(
    edge.segments.map(({ from, to, relation_ref }) => ({ from, to, relation_ref })),
    [
      {
        from: "input",
        to: "encoder_occurrence",
        relation_ref: "relations.input_enters_encoder",
      },
      {
        from: "encoder_occurrence",
        to: "output",
        relation_ref: "relations.encoder_emits_output",
      },
    ],
  );
  assert.equal(edge.segments[0].connection.inside, "Coordinates enter the encoder.");
  assert.equal(edge.segments[1].tone, "conditioning");
  assert.deepEqual(edge.segments[0].carries, ["representations.coordinates"]);
  assert.deepEqual(edge.segments[1].carries, ["representations.coordinates"]);
});

test("provided projected segments retain their authored presentation precedence", () => {
  const source = sourceFixture();
  const edge = source.projected_boards.root.graph.edges[0];
  edge.segments = [
    {
      from: "input",
      to: "encoder_occurrence",
      relationRef: "relations.input_enters_encoder",
      presentation: { label: "presented label", tone: "skip" },
    },
  ];
  const normalized = normalizeRendererManifest(source).boards.items[0].edges[0].segments[0];

  assert.equal(normalized.relation_ref, "relations.input_enters_encoder");
  assert.equal(normalized.label, "presented label");
  assert.equal(normalized.tone, "skip");
  assert.deepEqual(normalized.carries, ["representations.coordinates"]);
  assert.equal(normalized.connection.inside, "input flows into encoder occurrence.");
});

test("the model owns reusable indexes and typed-ref resolution", () => {
  const model = createRendererModel(sourceFixture());
  const { indexes } = model;

  assert.equal(indexes.modulesById.get("encoder").label, "Encoder");
  assert.equal(indexes.repsById.get("coordinates").shape, "B x N x 3");
  assert.equal(indexes.valueSitesById.get("input_coordinates").role, "current state");
  assert.deepEqual(
    indexes.valueSiteInterfacesById.get("input_coordinates").consumers,
    ["modules.encoder"],
  );
  assert.equal(
    indexes.relationsById.get("relations.input_enters_encoder"),
    indexes.relationsById.get("input_enters_encoder"),
  );
  assert.equal(indexes.boardsById.get("root").title, "Root");
  assert.equal(indexes.standardBlocksById.get("pair_biased_attention").name, "Pair-Biased Attention");
  assert.equal(indexes.blockInstancesById.get("encoder_attention").variant, "logit_bias_only");
  assert.equal(
    indexes.blockInstancesBySubject.get("modules.encoder")[0].id,
    "encoder_attention",
  );
  assert.equal(
    indexes.conditioningByRelation.get("input_enters_encoder").id,
    "coordinate_conditioning",
  );
  assert.equal(
    indexes.conditioningByPair.get("value_sites.input_coordinates->modules").id,
    "coordinate_conditioning",
  );

  assert.equal(model.entity("modules.encoder").label, "Encoder");
  assert.equal(model.entity("value_sites.input_coordinates").role, "current state");
  assert.equal(model.entity("representations.coordinates").shape, "B x N x 3");
  assert.equal(model.entity("relations.input_enters_encoder").operation, "encode");
  assert.equal(model.entity("encoder"), null);
  assert.equal(model.board("root").title, "Root");
  assert.equal(model.relation("relations.input_enters_encoder").operation, "encode");
  assert.equal(
    model.conditioningForRelation("relations.input_enters_encoder").id,
    "coordinate_conditioning",
  );
});

test("indexes can be constructed independently from an already normalized manifest", () => {
  const manifest = normalizeRendererManifest(sourceFixture());
  const indexes = buildRendererIndexes(manifest);
  assert.deepEqual([...indexes.modulesById.keys()], ["encoder"]);
  assert.deepEqual([...indexes.boardsById.keys()], ["root"]);
});
