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
- Use the versioned `semantic_flow_v1` compiler for new board scaffolds and
  reviewed existing-board reflows. It places the compute spine in the middle,
  ordinary flow left to right, conditioning above its consumers, and
  loop-carried state below. Treat its output as a deterministic starting
  layout that remains curatable in view YAML. See
  `protocol/semantic-layout.md`.
- Keep the browser renderer as one canonical audience view. Do not add
  query-driven edit, tuning, or alternate UI modes; make durable authoring
  changes in the sources or generic renderer rules and validate them normally.
- Use `grid.column_sizing: content` when authored columns should define visible
  order/alignment without reserving full-width holes for empty or elided
  columns. Keep the uniform grid when blank ranks intentionally define lanes.
- Use typed representation lanes only when a board deliberately aligns
  canonical streams. `representation_refs` must name canonical types, and
  every visible value-site occurrence of a mapped type must occupy the lane's
  authored `row`. Edge hue and unambiguous module accents are derived from
  projected relation `carries`; do not encode single/pair family through
  `tone` or duplicate it in the view.
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
- Representation nodes render as generic tensor shapes
  (scalar/vector/single/matrix/pair/volume) or semantic geometry illustrations
  (`coordinates`/`frames`). Shape inference supplies generic glyphs; canonical
  representation-level `glyph` owns geometric meaning that rank alone cannot
  prove. Single-feature tracks, pair features, coordinates, and frames use
  distinct colors. All ranks place the math symbol above the box; non-scalars
  place dims inside, and a short human-readable variable name below. Use a
  view-node override only for an occurrence-specific presentation or when the
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
- `genie2`: Genie 2 protein-backbone diffusion (Lin et al., arXiv:2405.15489)
  in `architectures/genie2.yaml`, `views/genie2-semantic-zoom.view.yaml`, and
  `pseudocode/genie2.yaml`. Its view separates optional motif conditioning,
  invariant single/pair encoding, equivariant frame refinement, and fixed
  DDPM sampler math.
- `genie3`: Genie 3 atom-aware protein diffusion (Lin et al., bioRxiv 2026)
  in `architectures/genie3.yaml`, `views/genie3-semantic-zoom.view.yaml`, and
  `pseudocode/genie3.yaml`. Its view distinguishes the coordinate diffusion
  state from derived branched Frenet frames and expands partial atomization,
  bidirectional latent reasoning, directional DDIM sampling, and equivariant
  structure decoding.

Shared infrastructure:

- Executable schemas: `schemas/*.schema.json` (strict current architecture,
  visualization, bibliography, and architecture-edit structure shared with
  future frontends).
- Architecture edit planner: `scripts/architecture_edit.rb` and
  `protocol/architecture-edit-language.md` (typed source-set operations,
  semantic prepare/show/apply review, SHA-256 stale-plan protection, and
  transactional validation).
- Local architecture review workspace: `scripts/architecture_review.rb`,
  `lib/architecture_review.rb`, and `review/` (the audience renderer beside a
  source-aware editor that stages architecture-edit plans; loopback-only and
  never part of the published static interface).
- Architecture verifier: `scripts/verify_architecture.rb` and
  `lib/architecture_verifier.rb` (read-only source-set checks with focused
  board diagnostics, JSON output, and manifest freshness verification).
- Semantic layout compiler: `lib/architecture_semantic_layout.rb` (shared by
  board scaffolding and the reviewed architecture-edit-v0.2 `layout_board`
  operation) plus `renderer/architecture/semantic-routing.mjs` for measured
  automatic feedback rails.
- Edge annotation placement: `renderer/architecture/edge-annotations.mjs`
  measures each label plus its conditioning badges as one block and chooses a
  collision-free horizontal or vertical route segment.
- Static deep-link state: `renderer/architecture/deep-link-state.mjs`
  reconstructs board breadcrumbs and local node selection from stable URL
  parameters without persisting transient pan, zoom, or hover state.
- Orthogonal route geometry: `renderer/architecture/orthogonal-routing.mjs`
  reserves readable arrow landings and separates parallel rails without
  consuming endpoint approach segments.
- Repeat-region contract: `lib/architecture_view_regions.rb` validates typed
  execution-backed enclosures, while
  `renderer/architecture/repeat-regions.mjs` measures their generic dashed
  presentation and replaces selected long recurrence wires with indexed ports.
- Representation-flow contract: `lib/architecture_view_lanes.rb` validates
  typed row lanes, while `renderer/architecture/flow-families.mjs` derives
  single, pair, coordinate, and frame edge/module accents from canonical
  carried representations.
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
- Landing directory: `index.html` plus `landing.js` (derives architecture
  cards from the generated manifests; `directory_role` in
  `architectures/index.yaml` separates model architectures from language
  references).
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
7. Run the source-set verifier, then any infrastructure-level regression tests
   appropriate to the change before reporting completion.

For a bounded multi-fact architecture/view edit, use an
`architecture-edit-v0.2` plan whenever its supported operations cover the
change. Legacy `architecture-edit-v0.1` plans remain accepted.

The plan targets a registry `source_set`; prepare it to bind the current
architecture and view digests, inspect the semantic diff, then apply it:

```bash
ruby scripts/architecture_edit.rb prepare edits/change.yaml --out /tmp/change.prepared.yaml
ruby scripts/architecture_edit.rb show /tmp/change.prepared.yaml
ruby scripts/architecture_edit.rb apply /tmp/change.prepared.yaml
ruby scripts/verify_architecture.rb --source-set <id>
```

### Porting a Method Architecture

When the user asks to "port an architecture," first identify both repositories:

- The **method repository** is the codebase being explained. Treat it as
  read-only evidence, record its local path or Git URL, and pin the inspected
  revision when citing code.
- The **explainer repository** is this source-first workspace, where canonical
  architecture, view, pseudocode, bibliography, and generated manifest files
  live.

Then distinguish these two cases:

1. **The target source set is already registered.** Inspect the method code,
   paper, configs, and documentation; translate supported changes into an
   `architecture-edit-v0.2` draft; run `prepare`, inspect `show`, and use
   `apply` to commit the validated source and manifest changes. Then run the
   unscoped source-set verifier before handoff. Preserve code symbols or line
   ranges as evidence locators, and mark interpretations that are not directly
   proven as `inferred` or `open_question`.
2. **The method is not registered yet.** Architecture edit v0.2 cannot ingest
   an arbitrary repository or create a new source set. Bootstrap its
   bibliography entry, architecture YAML, root view, pseudocode source, and
   `architectures/index.yaml` registration through the normal source-first
   workflow. State explicitly that this onboarding step is outside the current
   transpiler, and run the unscoped source-set verifier after registration.
   Once the source set exists, use edit plans for every supported follow-up
   operation.

For supported operations, an agent or LLM proposes the draft plan; it does not
bypass the plan by rewriting existing canonical YAML directly. The
deterministic editor owns reference resolution, source and evidence
validation, stale-plan checks, board projection, manifest generation, and
transactional writes. Unsupported edits and new-source-set onboarding still
use carefully reviewed declarative YAML followed by the full validation
workflow. See `protocol/architecture-edit-language.md` for the exact boundary.

The mandatory final source-set gate is:

```bash
ruby scripts/verify_architecture.rb --source-set <id>
```

Use `--board <board_id>` and optionally `--format json` for focused repair
diagnostics while authoring. A board-scoped run narrows layout and projection
checks; it does not replace the final unscoped run. The manifest-freshness
subcheck is repository-wide, so its diagnostic may identify another registered
source set. When schemas, validators, projection, manifest compilation, or
renderer infrastructure changes, also run the repository-wide regression
suite.

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
ruby -Ilib:test test/architecture_edit_contract_test.rb
ruby -Ilib:test test/architecture_edit_v2_contract_test.rb
ruby -Ilib:test test/yaml_source_patch_test.rb
ruby -Ilib:test test/architecture_view_scaffold_test.rb
ruby -Ilib:test test/architecture_semantic_layout_test.rb
ruby -Ilib:test test/architecture_view_lanes_test.rb
ruby -Ilib:test test/architecture_view_regions_test.rb
ruby -Ilib:test test/architecture_edit_test.rb
ruby -Ilib:test test/architecture_edit_v2_test.rb
ruby -Ilib:test test/architecture_edit_scaffold_test.rb
ruby -Ilib:test test/architecture_edit_apply_test.rb
ruby -Ilib:test test/architecture_edit_cli_test.rb
ruby -Ilib:test test/architecture_verifier_test.rb
ruby -Ilib:test test/architecture_verifier_cli_test.rb
ruby -Ilib:test test/architecture_review_test.rb
ruby -Ilib:test test/renderer_model_test.rb
ruby -Ilib:test test/renderer_deep_link_chrome_test.rb
ruby -Ilib:test test/renderer_deep_link_state_test.rb
ruby -Ilib:test test/renderer_deep_link_integration_test.rb
ruby -Ilib:test test/renderer_edge_annotations_test.rb
ruby -Ilib:test test/renderer_flow_family_test.rb
ruby -Ilib:test test/renderer_orthogonal_routing_test.rb
ruby -Ilib:test test/renderer_question_context_test.rb
ruby -Ilib:test test/renderer_representation_glyph_test.rb
ruby -Ilib:test test/renderer_snappiness_test.rb
ruby -Ilib:test test/renderer_stacking_test.rb
ruby -Ilib:test test/renderer_semantic_routing_test.rb
ruby -Ilib:test test/renderer_repeat_region_test.rb
ruby -Ilib:test test/renderer_workspace_selection_test.rb
ruby -Ilib:test test/renderer_workspace_test.rb
ruby -Ilib:test test/review_audience_location_test.rb
ruby -Ilib:test test/review_frontend_performance_test.rb
ruby -Ilib:test test/review_model_test.rb
ruby -Ilib:test test/manifest_reproducibility_test.rb
ruby -Ilib:test test/documentation_test.rb
ruby scripts/lint_sources.rb
ruby scripts/verify_architecture.rb --source-set <id>
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
- Question handoff packets are disposable projections of manifest facts. Keep
  their builder generic and preserve typed refs, ordered relation provenance,
  and evidence certainty; never author separate question-context facts in
  architecture or view YAML.
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
