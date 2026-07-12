# ROADMAP

Stages are vertical slices; each ends with the demo working and lint clean.
Exit criteria are "architecture X renders legibly", not "feature Y exists".

## Done

- **Stage 0 — trust the pipeline** (2026-07): fixed literal `\n` bugs in
  `build-manifest.rb` and `lint_sources.rb` (the generated `manifest.js` was
  syntactically invalid JS); documented that `node` may be unavailable.
- **Stage 1 — derivation** (2026-07): `architectures/index.yaml` registry
  consumed by both scripts; one `manifest-<id>.js` per source set plus
  `manifest-index.js`; renderer switches via `?arch=`. The initial linter
  enforced view edge ↔ legacy architecture edge/module-IO consistency.
  Conditioning badges derive from architecture `conditioning` entries.
- **Source contract v0.2/v0.3** (2026-07): architecture flow uses stable,
  named `relations`; board projections use `relation_ref` or explicit
  `view_only: true`; semantic drilldown uses `board_ref`. The linter verifies
  relation endpoints, conditioning links, edge provenance, and board targets.
- **Stage 2 — folding** (2026-07): `elide: true` in the view language;
  renderer contracts edges through elided nodes (dashed, `+N` hop count,
  hover-peek / click-pin popover showing the hidden chain). Linter rejects
  elision that would drop or ambiguously duplicate edges. Spec in
  `protocol/visualization-language.md` v0.2.
- **First real architecture** (2026-07, pulled forward as the forcing
  function): DiT (arXiv:2212.09748) source set, evidence-graded against the
  paper and `facebookresearch/DiT/models.py`; exercises elision, badges, and
  block drilldown.
- **Stage 3 — layout, first attempt** (2026-07): ELK.js layered layout with
  orthogonal rounded edge routing and auto-fit viewport, now behind
  `?layout=elk` — the geometric invariants verify headlessly (no node
  overlaps, no edge crosses a module) but the rendered result looked broken
  in practice, and the hand-authored `col`/`row` grid reads better, so grid
  stays the default. Before retrying: debug the visual breakage in-browser,
  and consider using ELK only for edge routing over grid-fixed node
  positions (`elk.algorithm: fixed` + libavoid-style routing), which keeps
  the row/col flexibility the grid gives. Decision stands: no React Flow.
- **Stage 3b — measured grid and wiring** (2026-07): the default renderer now
  supports content-sized visible-column compaction with measured node tracks,
  label-aware gutters, compact model-map topology, and orthogonal routing with
  reusable outer-lane hints. Authored `col` remains the semantic rank; wide
  viewports no longer stretch internal graph spacing.
- **Stage 3c — one audience interface** (2026-07): consolidated the legacy,
  edit, tuning, and audience variants into one canonical audience renderer.
  Board authoring remains source-first in YAML; `?arch=` selects content and
  `?layout=elk` remains a layout experiment, not a UI mode.

## Next

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
