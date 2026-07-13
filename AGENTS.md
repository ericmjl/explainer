# AGENTS.md

## Project Role

This repo is a source-first explainer for architecture diagrams and design
language prototypes. Treat YAML and Markdown sources as the durable artifact;
HTML and JavaScript should mostly render those sources.

When updating an architecture, prefer editing the declarative sources first:

1. `architectures/*.yaml`: modules, representations, relations, claims, evidence.
2. `views/*.view.yaml`: semantic-zoom boards and visual layout.
3. `pseudocode/*.yaml`: code or algorithm traces.
4. `standard_blocks/*.yaml`: reusable motifs such as attention and conditioning.
5. `stories/*/story.md`: human-readable distilled notes.
6. Renderer code only when the DSL cannot express the needed behavior.

## Architecture Authoring Rules

- Use stable IDs in snake_case. Keep IDs semantic, not visual:
  `input_adapter`, `context_memory`, `refinement_stack`, not `left_box_1`.
- Give every architectural fact one owner. Reference that fact from other
  sections and views instead of copying it. In architecture-v0.4, top-level
  `relations` own information-flow identity, semantics, and evidence.
- Give every relation a stable semantic snake_case `id`; do not author
  anonymous architecture `edges`.
- Give every module exactly one `parent_ref`, rooted at `architecture`.
- Declare `decomposition.status` on the architecture root and every module:
  `complete`, `partial`, `leaf`, or `opaque`. Child membership is still derived
  only from `parent_ref`; never repeat a child list or expected count. Use
  `opaque` for an accounted component whose internals are intentionally not
  modeled, and `partial` when sibling breadth may still be missing.
- Model reusable tensor/stream types in `representations` and concrete
  architectural occurrences in `value_sites`. Split mutable before/after state
  into distinct value sites; never encode a state update as an ambiguous
  self-edge.
- Derive module interfaces from canonical relations. Do not separately author
  module `inputs`/`outputs` in architecture-v0.4. Conditioning references one
  relation without copying endpoints; scale transitions reference an ordered
  relation path; state lifecycle groups never copy producer/consumer lists.
- Every nontrivial claim should have `evidence.status` and `evidence.refs`.
- Value sites and `training_inference` are evidence-bearing facts too.
- Confirmed evidence must cite a compatible source kind with a `locator`.
  Code sources in the bibliography must use an immutable revision-pinned URL.
- Mark certainty explicitly:
  - `confirmed_from_code`: directly checked in source code.
  - `confirmed_from_paper`: directly checked in a paper or spec.
  - `confirmed_from_docs`: directly checked in project documentation.
  - `inferred`: reasonable from context, but not line-for-line proven.
  - `open_question`: unresolved or awaiting clarification.
- Do not invent architecture facts. If a source is only a scaffold, mark
  specific details as inferred or open.
- Preserve useful unresolved questions in `open_questions`; they are part of
  the design artifact, not clutter.
- Mature architecture notes should model:
  - `execution` for loops, reruns, and cached state.
  - `state_semantics` for mutable state versus read-only conditioning.
  - `conditioning` for AdaLN, gates, pair bias, additive injection,
    concatenation, and cross-attention.
  - `scale_transitions` for compression, broadcast, pooling, and reshaping.
  - `training_inference` for objectives, schedules, samplers, and deployment
    notes when relevant.

## Semantic-Zoom Views

Use `views/generic-semantic-zoom.view.yaml` as the current reference pattern.

- The root board should show the complete task boundary: task-native inputs,
  the highest-level system units, and task-native outputs. A core model or
  backbone becomes a drillable child when preprocessing, execution loops, or
  decoding surround it; do not spend the root on a one-box wrapper.
- A child board expands exactly one conceptual unit.
- Use an explicit `board_ref` for every drillable node, and ensure the matching
  board exists. Its `subject_ref` must equal the node's canonical module `ref`.
  Do not infer drilldown from a node ID and do not author `expandable`.
- Keep `col`/`row` layout declarative in the view YAML — it is the primary
  layout. Avoid hardcoding module positions in renderer JavaScript. An
  experimental ELK layered layout exists behind `?layout=elk` (needs visual
  polish before becoming default).
- Keep the browser renderer as one canonical audience view. Do not add
  query-driven edit, tuning, or alternate UI modes; make durable authoring
  changes in the sources or generic renderer rules and validate them normally.
- Use `grid.column_sizing: content` when authored columns should define visible
  order/alignment without reserving full-width holes for empty or elided
  columns. Keep the uniform grid when blank ranks intentionally define lanes.
- Every visualization-v0.4 board declares `subject_ref`, relative
  `expansion_depth`, and an exact curated `nodes` list. Nodes bind through a
  typed `ref` (`modules.*` or `value_sites.*`).
- Do not author normal board `edges` or `view_only` flow. The shared projector
  derives edges from canonical architecture relations.
- Preserve board-specific edge presentation in `edge_overrides`, matched by
  exactly one `relation_ref` or ordered `relation_path`. Overrides may set
  labels, `tone`, `connection` prose, and exceptional `route_side` /
  `route_clearance`; they may not redefine endpoints or semantics.
- Connection text should explain how the source is used inside the target, not
  merely restate the edge label. This prose is presentation; relation identity,
  architectural semantics, and evidence remain owned by the architecture.
- Use `elide` for a deliberate pass-through contraction and `exclude` with a
  reason for content outside a board's scope. Omission is not an implicit
  elision: an unaccounted in-scope object fails projection.
- Do not write conditioning modes into edge labels; the renderer derives
  badges from the architecture `conditioning` entries.
- Explicitly elided objects must have incoming and outgoing canonical flow and
  must not form a component with both multiple visible inputs and multiple
  visible outputs. Contracted edges retain their complete ordered relation
  provenance. See `protocol/architecture-projection-model.md`.
- Representation nodes render as tensor-shaped boxes (scalar/vector/matrix/
  pair/volume) derived from the representation's `shape`. All ranks place the
  math symbol above the box; non-scalars place dims inside, and a short
  human-readable variable name below. Override only via `glyph:` when the
  shape parses wrong. See
  `protocol/visualization-language.md`.

## Current Source Map

`architectures/index.yaml` is the registry of source sets. Both the manifest
builder and the linter read it; register new architectures there, never by
editing the scripts. Current sets:

- `generic`: the intentionally domain-neutral feature-refinement pipeline
  (`architectures/generic-feature-refinement.yaml` and friends). It
  demonstrates source layout, semantic zoom, evidence fields, state
  semantics, conditioning, and scale transitions.
- `dit`: the Diffusion Transformer (Peebles & Xie, arXiv:2212.09748) in
  `architectures/diffusion-transformer.yaml`,
  `views/dit-semantic-zoom.view.yaml`,
  `pseudocode/diffusion-transformer.yaml`, and
  `standard_blocks/adaln-zero-conditioning.yaml`. Its view demonstrates
  architecture-derived edge elision and conditioning badges.

Shared infrastructure:

- Executable schemas: `schemas/*.schema.json` (strict current architecture,
  visualization, and bibliography structure shared with future frontends).
- Strict YAML loader: `lib/strict_yaml.rb` (rejects duplicate mapping keys).
- Source contract validator: `lib/source_contract.rb` plus
  `lib/evidence_contract.rb` (structural and cross-source evidence checks).
- Central bibliography: `references/bibliography.yaml` (canonical metadata for
  papers, code, docs, specs, and local sources; facts cite it through typed
  `source_ref` roles). See `protocol/bibliography.md`.
- Semantic projector: `lib/architecture_projection.rb` (used by both builder
  and linter; emits deterministic projected edges with relation provenance).
- Ownership validator: `lib/architecture_ownership.rb` (rejects duplicated
  relation endpoints, interfaces, and derived state/scale fields).
- Coverage compiler: `lib/architecture_coverage.rb` (validates top-down
  decomposition closure and derives breadth/depth frontier reports without a
  guessed percentage).
- Renderer manifest builder: `renderer/architecture/build-manifest.rb`
  (emits one `manifest-<id>.js` per registry entry plus `manifest-index.js`).
- Browser renderer: `renderer/architecture/renderer.js` (architecture chosen
  via `?arch=<id>`, default is the first registry entry).

## Update Workflow

When the user provides architecture knowledge:

1. Translate the statement into architecture/view language.
2. Decide whether it changes a module, representation type, value site,
   relation, claim, or board.
3. Update the YAML source before touching renderer code.
4. Add evidence references if code, paper, or spec lines are known.
5. If evidence is not known, keep the scaffold but mark details as inferred or
   open.
6. Regenerate the renderer manifest after YAML/view changes.
7. Validate syntax and renderer checks before reporting completion.

Regenerate with:

```bash
ruby renderer/architecture/build-manifest.rb
ruby renderer/architecture/build-manifest.rb --check
```

Useful validation:

```bash
ruby -Ilib:test test/architecture_projection_test.rb
ruby -Ilib:test test/architecture_ownership_test.rb
ruby -Ilib:test test/architecture_coverage_test.rb
ruby -Ilib:test test/source_projection_integration_test.rb
ruby -Ilib:test test/bibliography_test.rb
ruby -Ilib:test test/strict_yaml_test.rb
ruby -Ilib:test test/source_contract_test.rb
ruby -Ilib:test test/evidence_contract_test.rb
ruby -Ilib:test test/manifest_reproducibility_test.rb
ruby -Ilib:test test/documentation_test.rb
ruby scripts/lint_sources.rb
ruby -c renderer/architecture/build-manifest.rb
```

If a JS runtime is available (`node` is not installed in every environment
this repo is edited in), also syntax-check `renderer/architecture/*.js` as ES
modules — they use `export` and top-level `await`, so `node --check` needs an
`.mjs` copy.

## Renderer Discipline

- Do not duplicate architecture facts in renderer JavaScript if they can live
  in YAML.
- Renderer code may define interaction behavior, styling hooks, and generic
  rendering rules.
- Renderer code should not be the only place where module order, module names,
  or internal architecture relations are defined.
- If a visual needs a new concept, add it to the view language first unless it
  is purely presentational.

## Writing Style

- Notes should be concise but evidence-grounded.
- Prefer "what flows into what" and "how it is used inside the target" over
  vague architectural prose.
- Keep stories and boards separate:
  - Board: exploratory semantic zoom over architecture.
  - Story: curated tour through selected board states and source lines.
