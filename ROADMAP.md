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
- **Historical source contracts v0.2/v0.3** (2026-07): introduced stable named
  `relations`, `relation_ref`, explicit legacy `view_only: true`, and
  `board_ref`. Visualization-v0.4 later retired authored/view-only flow in
  favor of architecture-derived edges.
- **Stage 2 — folding** (2026-07): introduced `elide: true`; the initial
  browser implementation contracted edges through elided nodes (dashed, `+N` hop count,
  hover-peek / click-pin popover showing the hidden chain). Linter rejects
  elision that would drop or ambiguously duplicate edges. Contraction later
  moved into the shared semantic projector.
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
  label-aware gutters, miniature canvas-style model maps, and orthogonal routing with
  reusable outer-lane hints. Authored `col` remains the semantic rank; wide
  viewports no longer stretch internal graph spacing.
- **Stage 3c — one audience interface** (2026-07): consolidated the legacy,
  edit, tuning, and audience variants into one canonical audience renderer.
  Board authoring remains source-first in YAML; `?arch=` selects content and
  `?layout=elk` remains a layout experiment, not a UI mode.
- **Stage 4 — architecture-derived board projection** (2026-07): added the
  shared Ruby semantic projector and executable fixtures; both builder and
  linter compile the same direct/boundary/contracted edge IR with ordered
  canonical provenance. Migrated generic and DiT through architecture-v0.3,
  then tightened them to the current architecture-v0.4 / visualization-v0.4
  contracts with strict module hierarchy, typed value sites,
  before/after mutable state, explicit elision/exclusion, and no authored board
  edges. The browser consumed architecture-manifest-v0.3 projected boards while
  retaining a narrow legacy-manifest adapter. Generic now visibly includes the
  ownership-index and fine-item skip dependencies that its old board omitted.
- **Stage 4b — central bibliography and provenance links** (2026-07): source
  metadata now has one repository-level owner; architecture and pseudocode
  facts cite stable IDs with typed roles. Lint rejects dangling citations, and
  audience details resolve paper/code metadata into readable links. These
  typed references form the first provenance graph across architectures.
- **Source contract v0.4 — enforced fact ownership** (2026-07): canonical
  relations are the sole owners of flow endpoints and interfaces. Conditioning
  references one relation, scale transitions reference ordered relation paths,
  and state lifecycle groups reference value sites without copying
  producer/consumer lists. Lint rejects duplicate ownership; the manifest
  compiler derives renderer convenience indexes.
- **Top-down decomposition coverage** (2026-07): every architecture scope now
  declares complete, partial, leaf, or opaque decomposition. The compiler
  derives child counts, breadth closure, depth-frontier counts, and opaque or
  partial refs without presenting a false overall percentage.
- **Design-document consolidation** (2026-07): architecture and visualization
  language references now describe the implemented v0.4 contracts directly;
  legacy behavior is isolated to migration notes, and `protocol/README.md`
  distinguishes implemented contracts from the proposed comparison format.
- **Source-contract hardening** (2026-07): added duplicate-key-safe YAML
  loading and implementation-independent JSON Schemas for architecture-v0.4,
  visualization-v0.4, and bibliography-v0.1. The shared acceptance path now
  rejects unknown fields, typoed enums, illegal authored board flow, invalid
  grid/routing values, incompatible evidence/source kinds, unpinned code
  citations, unresolved execution/question refs, and value-site carry
  mismatches. Manifest generation runs full lint first, retains previously
  omitted canonical fields, records deterministic source digests, and supports
  byte-for-byte `--check` verification.

## Next

- **Stage 5 — more architectures**: port RFD3 / Genie3 slices from the
  earlier branch into registry sets. Use fan-in, shared state, and branching
  failures to evolve the projection contract rather than adding view-only
  architecture facts.
- **Stage 6 — comparison view**: generate a cross-architecture table from
  the uniform `conditioning` / `state_semantics` / `scale_transitions`
  fields. This is the highest research value in the design.

## Deferred ideas

- Lint warning for self-referential evidence refs (fires on the whole
  generic demo today, so needs a scaffold exemption first).
- Document-level `default_evidence` with per-item overrides to cut YAML
  boilerplate.
- Clickable hops in the contracted-edge popover (jump to the elided module's
  focus panel).
