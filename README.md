# Architecture Explainer

This is a static, source-first prototype for explaining system architectures
as semantic-zoom boards and short source-backed stories.

The branch is intentionally domain-neutral. Architecture facts live in YAML
and Markdown sources; browser pages render those sources into diagrams,
focus panels, evidence summaries, and reusable standard-block views.

## Architecture Language

Source layers:

- `protocol/architecture-language.md`: YAML vocabulary for methods, modules,
  representations, attention patterns, relations, claims, and evidence.
- `protocol/architecture-projection-model.md`: current projection contract for
  architecture hierarchy, scoped board projection, automatic edges, elision,
  provenance, and migration.
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

The current architecture-v0.3 / visualization-v0.4 contracts enforce the
one-fact/one-owner rule. Architecture sources own a strict module hierarchy,
typed value sites, canonical relations, semantics, and evidence. Boards select
a subject, relative expansion depth, exact visible occurrences, explicit
elisions/exclusions, and presentation overrides; they do not author semantic
edges. A shared build/lint-time projector derives direct, boundary, and
contracted edges with ordered relation provenance. Drilldown remains explicit
through `board_ref`. See `protocol/architecture-projection-model.md`.

For architecture-aware authoring, read `AGENTS.md` first. It defines the
source-first update order, evidence rules, semantic-zoom board conventions,
and renderer validation commands. The browser is the canonical audience
experience, not an authoring surface: update YAML or Markdown sources and
regenerate the manifests instead of editing a board in the page.

## Current Demo

Path: `renderer/architecture/`

The renderer hosts multiple architectures. `architectures/index.yaml` is the
registry of source sets; the page switches between them with the header
dropdown or a `?arch=<id>` query parameter:

- `?arch=generic` (default): the domain-neutral feature-refinement pipeline.
- `?arch=dit`: the Diffusion Transformer (Peebles & Xie, arXiv:2212.09748),
  rendered from evidence-graded sources. Its board demonstrates edge elision:
  decoder scaling and intermediate value sites are contracted into dashed
  edges with complete canonical relation paths; hover the edge port to peek at
  the hidden chain, click to pin.

There is one renderer interface: the audience view. Navigation, location,
hover explanations, focus details, pan, and zoom all belong to that same
experience. The former legacy, edit, and tuning UI variants are retired;
`?arch=` remains the normal way to deep-link to an architecture, while
`?layout=elk` remains an experimental layout implementation rather than a
separate interface.

Conditioning badges on edges (adaLN-Zero, pair bias, per-item AdaLN) are
derived from the architecture `conditioning` section, never hand-authored in
views.

Both registered demos are compiled through the semantic projector. The generic
demo models a feature-refinement pipeline:

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
ruby -Ilib:test test/architecture_projection_test.rb
ruby -Ilib:test test/source_projection_integration_test.rb
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
