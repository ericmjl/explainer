import test from "node:test";
import assert from "node:assert/strict";

import {
  QUESTION_CONTEXT_SCHEMA_VERSION,
  buildEdgeQuestionContext,
  buildNodeQuestionContext,
  canonicalNodeRef,
  edgeRelationPath,
  formatQuestionContext,
  questionContextReference,
} from "../renderer/architecture/question-context.mjs";

const manifest = {
  build: {
    generator: "architecture-manifest-builder-test",
    inputDigests: {
      "views/example.yaml": "view-digest",
      "architectures/example.yaml": "architecture-digest",
    },
  },
  architecture: {
    id: "example",
    name: "Example Architecture",
    sourceYaml: "../../architectures/example.yaml",
    modules: [
      {
        id: "encoder",
        label: "Feature Encoder",
        role: "encode inputs",
        parent_ref: "architecture",
        decomposition: { status: "leaf" },
        evidence: {
          status: "confirmed_from_code",
          refs: [{ source_ref: "example_code", role: "implementation_evidence", locator: "Encoder.forward" }],
        },
      },
    ],
    blockInstances: [
      {
        id: "encoder_pair_attention",
        subjectRef: "modules.encoder",
        standardBlockRef: "standard_blocks/pair-biased-attention.yaml",
        variant: "logit_bias_only",
        conformance: "exact",
        useScope: "whole_module",
        portBindings: [{ portRef: "ports.single_state", relationRefs: ["relations.input_enters_encoder"] }],
        evidence: {
          status: "confirmed_from_code",
          refs: [{ source_ref: "example_code", role: "implementation_evidence", locator: "Attention.forward" }],
        },
      },
    ],
    representations: [
      {
        id: "single_features",
        display_label: "single features",
        shape: "B x N x 384",
        glyph: "single",
        scale: "token",
        evidence: {
          status: "confirmed_from_docs",
          refs: [{ source_ref: "example_docs", role: "shape_evidence", locator: "Features" }],
        },
      },
    ],
    valueSites: [
      {
        id: "input_features",
        representation_ref: "representations.single_features",
        scope_ref: "architecture",
        role: "encoder input",
        evidence: {
          status: "confirmed_from_code",
          refs: [{ source_ref: "example_code", role: "interface_evidence", locator: "Encoder.forward:x" }],
        },
      },
      {
        id: "encoded_features",
        representation_ref: "representations.single_features",
        scope_ref: "architecture",
        role: "encoder output",
        evidence: {
          status: "confirmed_from_code",
          refs: [{ source_ref: "example_code", role: "interface_evidence", locator: "Encoder.forward:return" }],
        },
      },
    ],
    relations: [
      {
        id: "input_enters_encoder",
        from: "value_sites.input_features",
        to: "modules.encoder",
        kind: "data_flow",
        operation: "encode",
        carries: ["representations.single_features"],
        evidence: {
          status: "confirmed_from_code",
          refs: [{ source_ref: "example_code", role: "flow_evidence", locator: "Encoder.forward" }],
        },
      },
      {
        id: "encoder_emits_features",
        from: "modules.encoder",
        to: "value_sites.encoded_features",
        kind: "data_flow",
        operation: "return_features",
        carries: ["representations.single_features"],
        evidence: {
          status: "inferred",
          refs: [{ source_ref: "example_docs", role: "supporting_evidence", locator: "Outputs" }],
        },
      },
    ],
    claims: [
      { id: "encoder_is_learned", scope: { module_ref: "modules.encoder" } },
    ],
    conditioning: [
      { id: "input_conditioning", relation_ref: "relations.input_enters_encoder" },
    ],
    scaleTransitions: [
      { id: "encode_transition", relation_path: ["relations.input_enters_encoder"] },
    ],
    openQuestions: [
      { id: "encoder_depth", affected_refs: ["modules.encoder"] },
    ],
    stateSemanticsBySite: {
      input_features: { groupId: "feature_state" },
    },
  },
  boards: { sourceYaml: "../../views/example.view.yaml" },
  bibliography: {
    sources: [
      { id: "example_code", kind: "code", title: "Example implementation", revision: "abc123", url: "https://example.test/code" },
      { id: "example_docs", kind: "docs", title: "Example documentation", url: "https://example.test/docs" },
    ],
  },
  pseudocode: {
    example_trace: {
      lines: [
        { id: "encode", architectureRefs: ["modules.encoder"] },
        { id: "read_input", architectureRefs: ["value_sites.input_features"] },
      ],
    },
  },
};

const board = {
  id: "encoder_board",
  title: "Feature Encoding",
  summary: "Encode token features.",
  subject_ref: "architecture",
  expansion_depth: 0,
  nodes: [
    { id: "input", kind: "representation", ref: "value_sites.input_features", value_site_ref: "input_features", rep_ref: "single_features", label: "input features" },
    { id: "encoder", kind: "module", ref: "modules.encoder", module_ref: "encoder", label: "Feature Encoder" },
    { id: "output", kind: "representation", ref: "value_sites.encoded_features", value_site_ref: "encoded_features", rep_ref: "single_features", label: "encoded features" },
  ],
};

const incoming = {
  id: "projection-in",
  from: "input",
  to: "encoder",
  projection: "direct",
  kind: "data_flow",
  relation_path: ["relations.input_enters_encoder"],
  carries: ["representations.single_features"],
  connection: { title: "Encoder input", role: "input", inside: "Input features are read by the encoder." },
};
const outgoing = {
  id: "projection-out",
  from: "encoder",
  to: "output",
  projection: "direct",
  kind: "data_flow",
  relation_path: ["relations.encoder_emits_features"],
  carries: ["representations.single_features"],
  connection: { title: "Encoder output", role: "output", inside: "The encoder emits transformed features." },
};

test("module context carries canonical identity, neighborhood, evidence, and semantic links", () => {
  const context = buildNodeQuestionContext({
    sourceSet: "example",
    manifest,
    board,
    breadcrumbs: [{ id: "encoder_board", title: "Feature Encoding" }],
    node: board.nodes[1],
    edges: [outgoing, incoming],
  });

  assert.equal(context.schema_version, QUESTION_CONTEXT_SCHEMA_VERSION);
  assert.equal(context.selection.canonical_ref, "modules.encoder");
  assert.equal(context.selection.occurrence_id, "encoder");
  assert.deepEqual(context.neighborhood.incoming[0].relation_path, ["relations.input_enters_encoder"]);
  assert.deepEqual(context.neighborhood.outgoing[0].relation_path, ["relations.encoder_emits_features"]);
  assert.deepEqual(context.semantic_links.claim_refs, ["claims.encoder_is_learned"]);
  assert.deepEqual(context.semantic_links.open_question_refs, ["open_questions.encoder_depth"]);
  assert.deepEqual(context.semantic_links.pseudocode_line_refs, ["example_trace.encode"]);
  assert.equal(context.evidence.find((entry) => entry.fact_ref === "relations.encoder_emits_features").status, "inferred");
  assert.deepEqual(Object.keys(context.revision.input_digests), ["architectures/example.yaml", "views/example.yaml"]);
  assert.equal(
    questionContextReference(context),
    "example / encoder_board / modules.encoder (occurrence: encoder)",
  );
});

test("value-site context preserves occurrence and reusable representation identities", () => {
  const context = buildNodeQuestionContext({
    sourceSet: "example",
    manifest,
    board,
    node: board.nodes[0],
    edges: [incoming, outgoing],
  });

  assert.equal(canonicalNodeRef(board.nodes[0]), "value_sites.input_features");
  assert.equal(context.selection.canonical_ref, "value_sites.input_features");
  assert.equal(context.selection.related_refs.representation_ref, "representations.single_features");
  assert.equal(context.selection.shape, "B x N x 384");
  assert.equal(context.selection.glyph, "single");
  assert.deepEqual(context.semantic_links.state_group_refs, ["state_semantics.feature_state"]);
  assert.deepEqual(context.semantic_links.pseudocode_line_refs, ["example_trace.read_input"]);
});

test("contracted edge context preserves ordered canonical hops and hidden references", () => {
  const contracted = {
    from: "input",
    to: "output",
    kind: "data_flow",
    label: "encoded path",
    connection: { title: "Encoding path", role: "transformation", inside: "Features pass through the encoder." },
    segments: [
      { from: "input", to: "encoder", relation_ref: "relations.input_enters_encoder" },
      { from: "encoder", to: "output", relation_ref: "relations.encoder_emits_features" },
    ],
  };
  const context = buildEdgeQuestionContext({
    sourceSet: "example",
    manifest,
    board,
    edge: contracted,
    edges: [contracted, incoming],
  });

  assert.deepEqual(edgeRelationPath(contracted), [
    "relations.input_enters_encoder",
    "relations.encoder_emits_features",
  ]);
  assert.deepEqual(context.selection.hidden_refs, ["modules.encoder"]);
  assert.equal(context.selection.grounding, "canonical_relation_path");
  assert.equal(context.selection.resolved_relation_path[1].operation, "return_features");
  assert.equal(context.selection.presentation.connection.inside, "Features pass through the encoder.");
  assert.equal(context.neighborhood.adjacent.length, 1);
  assert.equal(context.evidence[1].status, "inferred");
  assert.deepEqual(context.semantic_links.claim_refs, ["claims.encoder_is_learned"]);
  assert.deepEqual(context.semantic_links.open_question_refs, ["open_questions.encoder_depth"]);
  assert.deepEqual(context.semantic_links.pseudocode_line_refs, [
    "example_trace.encode",
    "example_trace.read_input",
  ]);
  assert.equal(
    questionContextReference(context),
    "example / encoder_board / relations.input_enters_encoder -> relations.encoder_emits_features",
  );
});

test("missing optional metadata degrades to an explicitly ungrounded packet", () => {
  const minimalManifest = { architecture: { id: "minimal" }, boards: {}, bibliography: {}, pseudocode: {} };
  const minimalBoard = { id: "root", nodes: [{ id: "mystery", kind: "operation", label: "Mystery" }] };
  const edge = { from: "mystery", to: "missing" };
  const context = buildEdgeQuestionContext({
    sourceSet: "minimal",
    manifest: minimalManifest,
    board: minimalBoard,
    edge,
    edges: [edge],
  });

  assert.equal(context.selection.grounding, "ungrounded");
  assert.deepEqual(context.selection.relation_path, []);
  assert.deepEqual(context.evidence, []);
  assert.match(questionContextReference(context), /mystery->missing$/);
});

test("reusable internal nodes and edges identify template versus architecture grounding", () => {
  const componentBoard = {
    id: "encoder_pair_attention_internals",
    title: "Pair attention internals",
    summary: "Reusable detail.",
    subject_ref: "modules.encoder",
    nodes: [
      {
        id: "pair_bias",
        kind: "operation",
        label: "Add pair bias",
        standard_block_ref: "standard_blocks/pair-biased-attention.yaml",
        block_instance_ref: "block_instances.encoder_pair_attention",
        template_fact_ref: "standard_blocks.pair_biased_attention.steps.add_pair_bias",
      },
      {
        id: "biased_logits",
        kind: "representation",
        label: "biased logits",
        block_instance_ref: "block_instances.encoder_pair_attention",
        template_fact_ref: "standard_blocks.pair_biased_attention.values.biased_logits",
      },
    ],
  };
  const templateEdge = {
    id: "pair-bias-output",
    from: "pair_bias",
    to: "biased_logits",
    kind: "data_flow",
    grounding: "standard_block_template",
    standard_block_ref: "standard_blocks/pair-biased-attention.yaml",
    block_instance_ref: "block_instances.encoder_pair_attention",
    template_fact_ref: "standard_blocks.pair_biased_attention.steps.add_pair_bias",
    connection: { title: "Add pair bias", role: "step output", inside: "logits = logits + pair_bias" },
  };

  const nodeContext = buildNodeQuestionContext({
    sourceSet: "example",
    manifest,
    board: componentBoard,
    node: componentBoard.nodes[0],
    edges: [templateEdge],
  });
  assert.equal(nodeContext.selection.grounding, "standard_block_template");
  assert.equal(
    nodeContext.selection.template_fact_ref,
    "standard_blocks.pair_biased_attention.steps.add_pair_bias",
  );
  assert.equal(nodeContext.reusable_component.variant, "logit_bias_only");
  assert.equal(nodeContext.reusable_component.conformance, "exact");
  assert.equal(
    nodeContext.evidence.find((entry) => entry.fact_ref === "block_instances.encoder_pair_attention").status,
    "confirmed_from_code",
  );

  const edgeContext = buildEdgeQuestionContext({
    sourceSet: "example",
    manifest,
    board: componentBoard,
    edge: templateEdge,
    edges: [templateEdge],
  });
  assert.equal(edgeContext.selection.grounding, "standard_block_template");
  assert.deepEqual(edgeContext.selection.relation_path, []);
  assert.equal(edgeContext.reusable_component.block_instance_ref, "block_instances.encoder_pair_attention");
});

test("formatted clipboard prompt is deterministic and leaves a question slot", () => {
  const context = buildNodeQuestionContext({
    sourceSet: "example",
    manifest,
    board,
    node: board.nodes[1],
    edges: [incoming, outgoing],
  });
  const first = formatQuestionContext(context);
  const second = formatQuestionContext(context);

  assert.equal(first, second);
  assert.match(first, /architecture-question-context-v0\.1/);
  assert.match(first, /"canonical_ref": "modules\.encoder"/);
  assert.ok(first.endsWith("Question:"));
});
