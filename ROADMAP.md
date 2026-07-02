# ROADMAP

Stages are vertical slices; each ends with the demo working and lint clean.
Exit criteria are "architecture X renders legibly", not "feature Y exists".

## Done

- **Stage 0 — trust the pipeline** (2026-07): fixed literal `\n` bugs in
  `build-manifest.rb` and `lint_sources.rb` (the generated `manifest.js` was
  syntactically invalid JS); documented that `node` may be unavailable.
- **Stage 1 — derivation** (2026-07): `architectures/index.yaml` registry
  consumed by both scripts; one `manifest-<id>.js` per source set plus
  `manifest-index.js`; renderer switches via `?arch=`. Linter enforces view
  edge ↔ architecture edge/module-IO consistency. Conditioning badges on
  edges derive from architecture `conditioning` entries.
- **Stage 2 — folding** (2026-07): `elide: true` in the view language;
  renderer contracts edges through elided nodes (dashed, `+N` hop count,
  hover-peek / click-pin popover showing the hidden chain). Linter rejects
  elision that would drop or ambiguously duplicate edges. Spec in
  `protocol/visualization-language.md` v0.2.
- **First real architecture** (2026-07, pulled forward as the forcing
  function): DiT (arXiv:2212.09748) source set, evidence-graded against the
  paper and `facebookresearch/DiT/models.py`; exercises elision, badges, and
  block drilldown.

## Next

- **Stage 3 — layout**: replace manual `col`/`row` with ELK.js layout
  (compound nodes map onto boards). Do this when hand-layout starts hurting,
  not before. Decision: no React Flow — the hard part is the data model, not
  the canvas; a layout engine is the dependency worth taking.
- **Stage 4 — more architectures**: port RFD3 / Genie3 slices from the
  earlier branch into registry sets. Expect fan-in cases that stress the
  elision rules.
- **Stage 5 — comparison view**: generate a cross-architecture table from
  the uniform `conditioning` / `state_semantics` / `scale_transitions`
  fields. This is the highest research value in the design.

## Deferred ideas

- Lint warning for self-referential evidence refs (fires on the whole
  generic demo today, so needs a scaffold exemption first).
- Document-level `default_evidence` with per-item overrides to cut YAML
  boilerplate.
- Ports on child boards derived from parent-board boundary edges, so nesting
  never re-declares connections.
- Clickable hops in the contracted-edge popover (jump to the elided module's
  focus panel).
