# CLAUDE.md — explainer

Source-first explainer for architecture diagrams and design-language
prototypes. YAML and Markdown sources are the durable artifact; HTML/JS mostly
renders them. See `AGENTS.md` for the full authoring guide — this file is the
operational summary.

## Edit order

When updating an architecture, edit declarative sources first, renderer code
last:

1. `architectures/*.yaml` — modules, representations, edges, claims, evidence.
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
- Keep unresolved questions in `open_questions` — they are part of the
  artifact.
- Don't duplicate architecture facts (module order, names, edges) in renderer
  JS if they can live in YAML. New visual concepts go into the view language
  first unless purely presentational.
- In views: root board is the most abstract; each child board expands exactly
  one conceptual unit; `expandable: true` only when a matching board ID
  exists; layout via `col`/`row` in view YAML, not renderer JS.
- Edges describe information flow: `from`, `to`, `label`, optional `tone`
  (`conditioning`, `skip`), and `connection.title/role/inside` explaining how
  the source is used inside the target.

## After any YAML/view change

Regenerate manifests, then validate:

```bash
ruby renderer/architecture/build-manifest.rb   # emits manifest-<id>.js per registry entry
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

Renderer: `renderer/architecture/renderer.js`, architecture selected via
`?arch=<id>`. View edges must match architecture edges or module
inputs/outputs (linted); conditioning badges derive from `conditioning`
entries — don't write modes into edge labels.

## Writing style

Concise, evidence-grounded. Prefer "what flows into what" and "how it is used
inside the target" over vague prose. Boards are exploratory semantic zoom;
stories are curated tours — keep them separate.
