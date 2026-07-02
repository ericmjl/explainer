# AGENTS.md

## Project Role

This repo is a source-first explainer for architecture diagrams and design
language prototypes. Treat YAML and Markdown sources as the durable artifact;
HTML and JavaScript should mostly render those sources.

When updating an architecture, prefer editing the declarative sources first:

1. `architectures/*.yaml`: modules, representations, edges, claims, evidence.
2. `views/*.view.yaml`: semantic-zoom boards and visual layout.
3. `pseudocode/*.yaml`: code or algorithm traces.
4. `standard_blocks/*.yaml`: reusable motifs such as attention and conditioning.
5. `stories/*/story.md`: human-readable distilled notes.
6. Renderer code only when the DSL cannot express the needed behavior.

## Architecture Authoring Rules

- Use stable IDs in snake_case. Keep IDs semantic, not visual:
  `input_adapter`, `context_memory`, `refinement_stack`, not `left_box_1`.
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

- The root board should be the most abstract view. One coarse module block is
  preferable to exposing all internals immediately.
- A child board expands exactly one conceptual unit.
- Use `expandable: true` only when a matching board ID exists.
- Keep `col`/`row` layout declarative in the view YAML. Avoid hardcoding
  module positions in renderer JavaScript.
- Edges should describe information flow. Each edge should include:
  - `from`
  - `to`
  - `label`
  - optional `tone`: `conditioning`, `skip`, or plain/default
  - `connection.title`, `connection.role`, `connection.inside`
- Connection text should explain how the source is used inside the target, not
  merely restate the edge label.

## Current Source Map

The generic branch keeps one neutral source set:

- Architecture: `architectures/generic-feature-refinement.yaml`
- Semantic zoom board: `views/generic-semantic-zoom.view.yaml`
- Pseudocode trace: `pseudocode/generic-feature-refinement.yaml`
- Standard blocks:
  - `standard_blocks/pair-biased-attention.yaml`
  - `standard_blocks/per-item-adaln-conditioning.yaml`
  - `standard_blocks/additive-conditioning.yaml`
- Renderer manifest builder: `renderer/architecture/build-manifest.rb`
- Browser renderer: `renderer/architecture/renderer.js`

The example is intentionally domain-neutral. It demonstrates source layout,
semantic zoom, evidence fields, state semantics, conditioning, and scale
transitions without encoding a specific published architecture.

## Update Workflow

When the user provides architecture knowledge:

1. Translate the statement into architecture/view language.
2. Decide whether it changes a module, representation, edge, claim, or board.
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
node --check renderer/architecture/renderer.js
node --check renderer/architecture/manifest.js
ruby -c renderer/architecture/build-manifest.rb
```

## Renderer Discipline

- Do not duplicate architecture facts in renderer JavaScript if they can live
  in YAML.
- Renderer code may define interaction behavior, styling hooks, and generic
  rendering rules.
- Renderer code should not be the only place where module order, module names,
  or internal architecture edges are defined.
- If a visual needs a new concept, add it to the view language first unless it
  is purely presentational.

## Writing Style

- Notes should be concise but evidence-grounded.
- Prefer "what flows into what" and "how it is used inside the target" over
  vague architectural prose.
- Keep stories and boards separate:
  - Board: exploratory semantic zoom over architecture.
  - Story: curated tour through selected board states and source lines.
