# Architecture Explainer

This is a static, source-first prototype for explaining system architectures
as semantic-zoom boards and short source-backed stories.

The branch is intentionally domain-neutral. Architecture facts live in YAML
and Markdown sources; browser pages render those sources into diagrams,
focus panels, evidence summaries, and reusable standard-block views.

## Architecture Language

Source layers:

- `protocol/architecture-language.md`: YAML vocabulary for methods, modules,
  representations, attention patterns, edges, claims, and evidence.
- `protocol/architecture-comparison-protocol.md`: comparison workflow and axes.
- `protocol/pseudocode-language.md`: YAML vocabulary for algorithm lines,
  symbols, source refs, claims, and visual scenes.
- `protocol/standard-blocks.md`: reusable visual/mathematical motifs.
- `protocol/visualization-language.md`: semantic-zoom board language.
- `protocol/renderer-architecture.md`: renderer stack and interaction model.
- `architectures/`: machine-readable architecture slices.
- `pseudocode/`: machine-readable algorithm or code traces.
- `standard_blocks/`: reusable block specs.
- `views/`: source specs for generated architecture views.
- `renderer/architecture/`: generated architecture renderer prototype.

Stories should increasingly be rendered from these source files instead of
hardcoding every module diagram in HTML or JavaScript.

For architecture-aware editing, read `AGENTS.md` first. It defines the
source-first update order, evidence rules, semantic-zoom board conventions,
and renderer validation commands.

## Current Demo

Path: `renderer/architecture/`

The renderer hosts multiple architectures. `architectures/index.yaml` is the
registry of source sets; the page switches between them with the header
dropdown or a `?arch=<id>` query parameter:

- `?arch=generic` (default): the domain-neutral feature-refinement pipeline.
- `?arch=dit`: the Diffusion Transformer (Peebles & Xie, arXiv:2212.09748),
  rendered from evidence-graded sources. Its board demonstrates edge elision:
  featurization modules (patchify, embedders) are contracted into dashed
  edges; hover the edge port to peek at the hidden chain, click to pin.

Conditioning badges on edges (adaLN-Zero, pair bias, per-item AdaLN) are
derived from the architecture `conditioning` section, never hand-authored in
views.

The generic demo models a feature-refinement pipeline:

- input records become item states;
- a context builder produces pair/context state;
- local item attention updates the item stream;
- item states are compressed into group states;
- a global refinement stack consumes group state and pair/context bias;
- group output is broadcast to item outputs;
- output heads emit task-specific predictions.

The example is not tied to a paper or biological domain. It exists to exercise
the design language: evidence fields, state semantics, conditioning modes,
scale transitions, compact nodes, MathJax equations, pan/zoom, and semantic
drilldown.

## Workflow

After changing YAML/view sources:

```bash
ruby renderer/architecture/build-manifest.rb   # regenerates manifest-<id>.js per registry entry
ruby scripts/lint_sources.rb
ruby -c renderer/architecture/build-manifest.rb
```

If a JS runtime is available, also syntax-check the ES modules (they use
`export` and top-level `await`, so check them as modules, e.g. via an `.mjs`
copy):

```bash
node --check renderer/architecture/renderer.js
```

Both scripts read `architectures/index.yaml`; register new source sets there,
not in the scripts.

Serve locally with any static file server, for example:

```bash
python3 -m http.server 8096
```
