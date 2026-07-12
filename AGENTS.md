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
  sections and views instead of copying it. In architecture-v0.2, top-level
  `relations` own information-flow identity, semantics, and evidence.
- Give every relation a stable semantic snake_case `id`; do not author
  anonymous architecture `edges`.
- In the current v0.2 migration, module `inputs`/`outputs` remain separately
  authored interface declarations. A flow shown on a v0.3 board still requires
  its own canonical relation; module IO alone is not view provenance.
- Every nontrivial claim should have `evidence.status` and `evidence.refs`.
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
  board exists. Do not infer drilldown from `module_ref` or node ID, and do not
  author `expandable` in visualization-v0.3.
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
- Edges should describe information flow. Each edge should include:
  - `from`
  - `to`
  - `relation_ref` for architecture-backed flow, or `view_only: true` for a
    board-local decomposition involving at least one view-local node
  - `label`
  - optional `tone`: `conditioning`, `skip`, or plain/default
  - optional `route_side`: `top`, `bottom`, `left`, or `right`, with optional
    `route_clearance`, only when the automatic router cannot preserve a
    meaningful feedback or bypass lane
  - `connection.title`, `connection.role`, `connection.inside`
- Connection text should explain how the source is used inside the target, not
  merely restate the edge label. This prose is presentation; relation identity,
  architectural semantics, and evidence remain owned by the architecture.
- Every architecture-backed board edge must use `relation_ref`, even though it
  retains local `from`/`to` node IDs for routing. Edges without an architecture
  relation must declare `view_only: true` and involve at least one view-local
  node; the linter enforces this. Author boards as projections of the
  architecture graph, not as a second copy.
- Do not write conditioning modes into edge labels; the renderer derives
  badges from the architecture `conditioning` entries.
- `elide: true` hides a pass-through node and contracts its edges into
  dashed through-edges with a peek/pin popover. Elided nodes must have at
  least one incoming and one outgoing edge and must not have both fan-in and
  fan-out. See `protocol/visualization-language.md`.
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
  `standard_blocks/adaln-zero-conditioning.yaml`. Its view demonstrates edge
  elision (`elide: true`) and derived conditioning badges.

Shared infrastructure:

- Renderer manifest builder: `renderer/architecture/build-manifest.rb`
  (emits one `manifest-<id>.js` per registry entry plus `manifest-index.js`).
- Browser renderer: `renderer/architecture/renderer.js` (architecture chosen
  via `?arch=<id>`, default is the first registry entry).

## Update Workflow

When the user provides architecture knowledge:

1. Translate the statement into architecture/view language.
2. Decide whether it changes a module, representation, relation, claim, or board.
3. Update the YAML source before touching renderer code.
4. Add evidence references if code, paper, or spec lines are known.
5. If evidence is not known, keep the scaffold but mark details as inferred or
   open.
6. Regenerate the renderer manifest after YAML/view changes.
7. Validate syntax and renderer checks before reporting completion.

Regenerate with:

```bash
ruby renderer/architecture/build-manifest.rb
```

Useful validation:

```bash
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
