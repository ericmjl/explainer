# AGENTS.md

## Project Role

This repo is a source-first explainer for protein structure prediction and
design architectures. Treat YAML and Markdown sources as the durable paper; HTML
and JavaScript should mostly render those sources.

When updating an architecture, prefer editing the declarative sources first:

1. `architectures/*.yaml`: modules, representations, edges, claims, evidence.
2. `views/*.view.yaml`: semantic-zoom boards and visual layout.
3. `pseudocode/*.yaml`: code/paper-line traces.
4. `standard_blocks/*.yaml`: reusable motifs such as pair-biased attention.
5. `stories/*/story.md`: human-readable distilled notes.
6. Renderer code only when the DSL cannot express the needed behavior.

## Architecture Authoring Rules

- Use stable IDs in snake_case. Keep IDs semantic, not visual: `atom_encoder`,
  `pair_repr`, `token_transformer`, not `left_box_1`.
- Every nontrivial claim should have `evidence.status` and `evidence.refs`.
- Mark certainty explicitly:
  - `confirmed_from_code`: directly checked in source code.
  - `confirmed_from_paper`: directly checked in paper/supplement.
  - `inferred`: reasonable from context, but not line-for-line proven.
  - `open_question`: unresolved or awaiting clarification.
- Do not invent architecture facts. If the user gives high-level structure but
  code evidence is not checked yet, encode the scaffold and mark details as
  inferred or open.
- Preserve useful unresolved questions in `open_questions`; they are part of the
  research artifact, not clutter.
- Mature architecture notes should model:
  - `execution` for loops, reruns, and cached state.
  - `state_semantics` for mutable state versus read-only conditioning.
  - `conditioning` for AdaLN, gates, pair bias, coordinate injection, additive
    injection, concatenation, and cross-attention.
  - `scale_transitions` for atom/token/pair/coordinate transitions.
  - `training_inference` for objective, schedule, sampler, and checkpoint notes.

## Semantic-Zoom Views

Use `views/esmfold2-semantic-zoom.view.yaml` as the current reference pattern.

- The root board should be the most abstract view. For example, one
  `DiffusionModule` block is preferable to exposing its internals immediately.
- A child board expands exactly one conceptual unit. Example:
  `DiffusionModule -> AtomEncoder -> SWAAtomTransformer`.
- Use `expandable: true` only when a matching board ID exists.
- Keep `col`/`row` layout declarative in the view YAML. Avoid hardcoding module
  positions in renderer JavaScript.
- Edges should describe information flow. Each edge should include:
  - `from`
  - `to`
  - `label`
  - optional `tone`: `conditioning`, `skip`, or plain/default
  - `connection.title`, `connection.role`, `connection.inside`
- Connection text should explain how the source is used inside the target, not
  merely restate the edge label.

## ESMFold2 Current Source Map

Current Biohub ESMFold2 files:

- Architecture: `architectures/biohub-esmfold2-diffusion-module.yaml`
- Semantic zoom board: `views/esmfold2-semantic-zoom.view.yaml`
- Pair-bias pseudocode trace: `pseudocode/esmfold2-pair-bias-boundary.yaml`
- Pair-biased attention block: `standard_blocks/pair-biased-attention.yaml`
- Renderer manifest builder: `renderer/esmfold2/build-manifest.rb`
- Browser renderer: `renderer/esmfold2/renderer.js`

Current high-level scaffold:

```text
Biohub ESMFold2
  DiffusionModule
    DiffusionConditioning
    ESMFold2AtomEncoder
    DiffusionTransformer
    ESMFold2AtomDecoder
```

The pair-bias boundary is a detail inside this scaffold: atom encoder local atom
attention does not consume pair bias; token transformer attention does.

## Update Workflow

When the user provides architecture knowledge:

1. Translate the statement into architecture/view language.
2. Decide whether it changes a module, representation, edge, claim, or board.
3. Update the YAML source before touching renderer code.
4. Add evidence references if code/paper lines are known.
5. If evidence is not known, keep the user-provided structure but mark specific
   details as inferred or open.
6. Regenerate the renderer manifest when ESMFold2 YAML/view sources change.
7. Validate syntax and serve checks before reporting completion.

For ESMFold2, regenerate with:

```bash
ruby renderer/esmfold2/build-manifest.rb
```

Useful validation:

```bash
ruby -e "require 'yaml'; YAML.load_file('architectures/biohub-esmfold2-diffusion-module.yaml'); YAML.load_file('views/esmfold2-semantic-zoom.view.yaml')"
ruby scripts/lint_sources.rb
node --check renderer/esmfold2/renderer.js
node --check renderer/esmfold2/manifest.js
ruby -c renderer/esmfold2/build-manifest.rb
```

## Renderer Discipline

- Do not duplicate architecture facts in renderer JavaScript if they can live in
  YAML.
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
  - Story: curated tour through selected board states and code/paper lines.
