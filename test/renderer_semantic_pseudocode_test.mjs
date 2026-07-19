import assert from "node:assert/strict";
import test from "node:test";

import {
  createSemanticBoardResolver,
  semanticCodeSegments,
  semanticEdgeForRefs,
  semanticRefsForBinding,
  semanticRefsForNode,
  semanticScopeForBoard,
  semanticStatementTextParts,
  semanticTexFallbackParts,
  semanticTexForBinding,
} from "../renderer/architecture/semantic-pseudocode.mjs";
import { manifest as genie3Manifest } from "../renderer/architecture/manifest-genie3.js";

const board = {
  id: "attention_detail",
  nodes: [
    {
      id: "attention_logits",
      kind: "operation",
      instance_fact_ref: "block_instances.demo.steps.attention_logits",
      template_fact_ref: "standard_blocks.attention.steps.attention_logits",
      block_instance_ref: "block_instances.demo",
    },
    {
      id: "weights",
      kind: "representation",
      instance_fact_ref: "block_instances.demo.values.attention_weights",
      template_fact_ref: "standard_blocks.attention.values.attention_weights",
      value_ref: "values.attention_weights",
      rep_ref: "single_features",
    },
    {
      id: "consumer",
      kind: "module",
      module_ref: "value_consumer",
    },
  ],
};

const manifest = {
  architecture: {
    valueSiteInterfaces: {
      hidden_value: {
        producerRefs: [],
        consumerRefs: ["modules.value_consumer"],
      },
    },
  },
};

test("semantic board resolver prefers exact instance facts", () => {
  const resolver = createSemanticBoardResolver({ manifest, board });
  const result = resolver.resolve([
    "block_instances.demo.values.attention_weights",
    "standard_blocks.attention.values.attention_weights",
  ]);

  assert.deepEqual(result.nodeIds, ["weights"]);
  assert.equal(result.resolution, "exact");
});

test("semantic board resolver projects an absent value to a visible interface boundary", () => {
  const resolver = createSemanticBoardResolver({ manifest, board });
  const result = resolver.resolve(["value_sites.hidden_value"]);

  assert.deepEqual(result.nodeIds, ["consumer"]);
  assert.equal(result.resolution, "boundary");
  assert.match(result.message, /nearest visible producer or consumer/);
});

test("representation fallback is allowed only for one visible occurrence", () => {
  const resolver = createSemanticBoardResolver({ manifest, board });
  assert.deepEqual(
    resolver.resolve(["representations.single_features"]).nodeIds,
    ["weights"],
  );

  const ambiguous = createSemanticBoardResolver({
    manifest,
    board: {
      ...board,
      nodes: [...board.nodes, { id: "other_weights", rep_ref: "single_features" }],
    },
  });
  assert.deepEqual(ambiguous.resolve(["representations.single_features"]).nodeIds, []);
});

test("semantic code segments use compiler offsets without parsing source text", () => {
  const code = "a = softmax(logits, dim=keys)";
  const bindings = [
    {
      lexeme: "a",
      access: "write",
      instanceFactRef: "block_instances.demo.values.attention_weights",
      occurrences: [{ start: 0, end: 1 }],
    },
    {
      lexeme: "logits",
      access: "read",
      instanceFactRef: "block_instances.demo.values.combined_logits",
      occurrences: [{ start: 12, end: 18 }],
    },
  ];

  const segments = semanticCodeSegments(code, bindings);
  assert.equal(segments.map((segment) => segment.text).join(""), code);
  assert.deepEqual(
    segments.filter((segment) => segment.binding).map((segment) => segment.text),
    ["a", "logits"],
  );
  assert.equal(segments[0].binding.access, "write");
});

test("invalid or stale offsets remain plain text", () => {
  const code = "a = logits";
  const segments = semanticCodeSegments(code, [{
    lexeme: "wrong",
    access: "read",
    occurrences: [{ start: 4, end: 10 }],
  }]);

  assert.deepEqual(segments, [{ text: code, binding: null }]);
});

test("semantic statement comments stay separate from executable-looking code", () => {
  assert.deepEqual(
    semanticStatementTextParts({
      text: "features = tokenize(request)",
      comment: "C-alpha task note.",
    }),
    { code: "features = tokenize(request)", comment: "C-alpha task note." },
  );
  assert.deepEqual(
    semanticStatementTextParts({ text: "value = call(x)  # legacy note" }),
    { code: "value = call(x)", comment: "legacy note" },
  );
  assert.deepEqual(
    semanticStatementTextParts({ text: "mapping#fragment = untouched" }),
    { code: "mapping#fragment = untouched", comment: null },
  );
});

test("binding and node refs bridge local, template, instance, and architecture identity", () => {
  const symbols = new Map([["input", { architectureRef: "value_sites.input" }]]);
  assert.deepEqual(
    semanticRefsForBinding({
      symbolId: "input",
      localRef: "ports.input",
      templateFactRef: "standard_blocks.demo.ports.input",
      instanceFactRef: "block_instances.demo.ports.input",
    }, symbols),
    [
      "block_instances.demo.ports.input",
      "standard_blocks.demo.ports.input",
      "value_sites.input",
      "ports.input",
    ],
  );
  assert(semanticRefsForNode(board.nodes[1]).includes("values.attention_weights"));
});

test("semantic variables prefer canonical TeX without changing source lexemes", () => {
  const symbols = new Map([["single", { tex: "s_5" }]]);
  assert.equal(semanticTexForBinding({ symbolId: "single" }, symbols), "s_5");
  assert.equal(
    semanticTexForBinding({ symbolId: "single", tex: "s_{i+1}" }, symbols),
    "s_{i+1}",
  );
  assert.equal(semanticTexForBinding({ architectureRef: "modules.attention" }, symbols), null);
  assert.deepEqual(semanticTexFallbackParts("s_5"), { base: "s", subscript: "5" });
  assert.deepEqual(semanticTexFallbackParts("\\hat{x}_0"), { base: "x̂", subscript: "0" });
  assert.deepEqual(semanticTexFallbackParts("\\epsilon_\\theta"), { base: "ε", subscript: "θ" });
  assert.deepEqual(semanticTexFallbackParts("x_{t-10}"), { base: "x", subscript: "t−10" });
});

test("generated Genie 3 semantic offsets reproduce every authored source line", () => {
  const program = Object.values(genie3Manifest.pseudocode)[0];
  for (const line of program.lines) {
    const segments = semanticCodeSegments(line.text, line.codeBindings);
    assert.equal(segments.map((segment) => segment.text).join(""), line.text, line.id);
    assert.equal(
      segments.filter((segment) => segment.binding).length,
      line.codeBindings.flatMap((binding) => binding.occurrences).length,
      line.id,
    );
  }
});

test("generated full IPA bindings resolve on the instance detail board", () => {
  const detail = genie3Manifest.boards.items.find(
    (candidate) => candidate.id === "genie3_ipa_internals",
  );
  const instance = genie3Manifest.architecture.blockInstances.find(
    (candidate) => candidate.id === "structure_ipa",
  );
  const resolver = createSemanticBoardResolver({ manifest: genie3Manifest, board: detail });

  for (const step of instance.pseudocode) {
    assert.deepEqual(
      resolver.resolve([step.instanceFactRef]).nodeIds,
      [step.id],
      `statement ${step.id}`,
    );
    for (const binding of step.codeBindings || []) {
      assert(
        resolver.resolve(semanticRefsForBinding(binding)).nodeIds.length > 0,
        `${step.id}:${binding.lexeme}`,
      );
    }
  }
});

test("Genie 3 boards select one semantic scope without leaking child statements", () => {
  const program = Object.values(genie3Manifest.pseudocode)[0];
  const expected = {
    design_overview: ["prepare_tokens", "run_diffusion_sampler", "export_structure"],
    sampling_loop: [
      "initialize_coordinates",
      "begin_sampling_state",
      "select_timestep",
      "run_reverse_step",
      "advance_sampling_state",
      "finish_sampling_state",
    ],
    reverse_diffusion_step: [
      "derive_frames",
      "run_denoiser",
      "run_sampler_math",
    ],
    directional_ddim_sampler_math: [
      "read_noise",
      "ddim_step",
    ],
    denoiser_forward: [
      "embed_single",
      "embed_pair",
      "latent_transform",
      "decode_structure",
      "predict_sequence",
    ],
  };

  for (const [boardId, statementIds] of Object.entries(expected)) {
    const board = genie3Manifest.boards.items.find((candidate) => candidate.id === boardId);
    const scope = semanticScopeForBoard({
      program,
      board,
      rootBoardId: genie3Manifest.boards.rootBoard,
    });
    assert(scope, boardId);
    assert.deepEqual(
      program.lines.filter((line) => line.scopeRef === scope.ref).map((line) => line.id),
      statementIds,
      boardId,
    );
  }

  const unscoped = genie3Manifest.boards.items.find(
    (candidate) => candidate.id === "latent_transformer",
  );
  assert.equal(semanticScopeForBoard({
    program,
    board: unscoped,
    rootBoardId: genie3Manifest.boards.rootBoard,
  }), null);
});

test("relation-backed statements resolve to their visible execution edge", () => {
  const sampling = genie3Manifest.boards.items.find(
    (candidate) => candidate.id === "sampling_loop",
  );
  const edge = semanticEdgeForRefs(
    sampling.edges,
    ["relations.initial_coordinates_begin_sampling_state"],
  );

  assert(edge);
  assert.equal(edge.from, "coordinate_initializer");
  assert.equal(edge.to, "current_coordinates");
});
