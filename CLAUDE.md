# CLAUDE.md — explainer

Source-first explainer for architecture diagrams and design-language
prototypes. YAML and Markdown sources are the durable artifact; HTML/JS mostly
renders them. See `AGENTS.md` for the full authoring guide — this file is the
operational summary.

## Edit order

When updating an architecture, edit declarative sources first, renderer code
last:

1. `architectures/*.yaml` — modules, representations, relations, claims, evidence.
2. `views/*.view.yaml` — semantic-zoom boards and layout.
3. `pseudocode/*.yaml` — code/algorithm traces.
4. `standard_blocks/*.yaml` — reusable motifs (attention, conditioning).
5. `stories/*/story.md` — distilled human-readable notes.
6. Renderer code (`renderer/architecture/`) only when the DSL can't express
   the behavior.

## Hard rules

- Stable snake_case IDs, semantic not visual (`context_memory`, not
  `left_box_1`).
- Never invent architecture facts. Every nontrivial claim carries
  `evidence.status` + `evidence.refs`. Status vocabulary:
  `confirmed_from_code`, `confirmed_from_paper`, `confirmed_from_docs`,
  `inferred`, `open_question`.
- Value sites and `training_inference` also carry evidence. Confirmed facts
  require a compatible bibliography source and `locator`; code sources are
  pinned to immutable revisions.
- Current architecture, view, and bibliography YAML must satisfy the executable
  schemas under `schemas/`. Unknown fields, duplicate YAML keys, and typoed
  closed enums fail validation.
- Keep unresolved questions in `open_questions` — they are part of the
  artifact.
- In architecture-v0.4, canonical `relations` alone own flow endpoints and
  interfaces. Do not author module `inputs`/`outputs`, conditioning endpoints,
  state producer/consumer lists, or duplicate scale-transition endpoints.
- The architecture root and every module declare `decomposition.status` as
  `complete`, `partial`, `leaf`, or `opaque`. Children remain derived solely
  from `parent_ref`; never repeat child lists or counts.
- Don't duplicate architecture facts (module order, names, relations) in renderer
  JS if they can live in YAML. New visual concepts go into the view language
  first unless purely presentational.
- Keep one canonical audience renderer. Do not add query-driven edit, tuning,
  or alternate UI modes; author durable changes in source files or generic
  renderer rules.
- In views: the root board shows task-native inputs through the highest-level
  system units to task-native outputs; a surrounded core model is a drillable
  child, not a one-box root. Each child board expands exactly one conceptual
  unit; drilldown uses an explicit valid `board_ref`; layout uses `col`/`row`
  in view YAML, not renderer JS.
- Visualization-v0.4 boards never author normal `edges` or `view_only` flow.
  Select typed module/value-site occurrences, then use `edge_overrides` matched
  by one canonical `relation_ref` or ordered `relation_path` for labels, tone,
  routing hints, and `connection` prose. The projector derives all endpoints.

## After any YAML/view change

Regenerate manifests, then validate:

```bash
ruby renderer/architecture/build-manifest.rb   # emits manifest-<id>.js per registry entry
ruby renderer/architecture/build-manifest.rb --check
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
```

`node` is often unavailable in this environment; if you have a JS runtime,
also syntax-check `renderer/architecture/*.js` as ES modules (they use
top-level `await`, so `node --check` needs an `.mjs` copy).

## Current sources

`architectures/index.yaml` is the registry of source sets — both scripts read
it; register new architectures there, never in the scripts. Sets:

- `generic`: domain-neutral feature-refinement demo (reference pattern for
  the source layout).
- `dit`: Diffusion Transformer (arXiv:2212.09748), evidence-graded; its view
  demonstrates `elide: true` edge contraction and derived conditioning
  badges.

Compiler/projector: Ruby (`renderer/architecture/build-manifest.rb` and
`lib/*.rb`). Renderer: `renderer/architecture/renderer.js`, architecture
selected via `?arch=<id>`. Projected view edges derive from canonical
architecture `relations`; conditioning badges derive from linked
`conditioning` entries—do not write modes into edge labels.

The manifest builder runs the full source linter before compilation and emits
deterministic input digests. `--check` validates without writing and rejects
stale committed manifests.

## Writing style

Concise, evidence-grounded. Prefer "what flows into what" and "how it is used
inside the target" over vague prose. Boards are exploratory semantic zoom;
stories are curated tours — keep them separate.
