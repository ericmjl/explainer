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
- **Stage 5 — real architecture coverage** (2026-07): added registry-backed
  Genie 2 and Genie 3 explainers beside DiT. Their semantic-zoom boards cover
  diffusion loops, invariant/equivariant feature building, single/pair
  representation flow, partial atomization, and fixed sampler updates without
  introducing renderer-owned architecture facts.
- **Stage 6 — reusable algorithms and honest reduction** (2026-07): added
  `standard-block-v0.2`, typed relation-bound ports, variants, compiled
  instance detail boards, and explicit exact/wrapped/reduced conformance.
  Full IPA and Genie 3's reduced attention can reuse internal anatomy without
  pretending that architecture-specific reductions are identical.
- **Stage 7 — evidence-backed comparison** (2026-07): added registered
  `architecture-comparison-v0.1` lenses, deterministic compiled alignments,
  independent paired board surfaces, shared inspector selection, and stable
  comparison URLs. The first lens compares Genie 3 reduced pair attention
  with full frame-aware IPA.
- **Stage 8 — synchronized explanation UX** (2026-07): added scoped semantic
  pseudocode, MathJax-bound variables, board/code hover synchronization,
  unrelated-component fading, one continuous Details/Pseudocode inspector,
  question-context handoff, themes, component deep links, representation
  lanes/glyphs, repeat regions, and direct-touch pinch/pan gestures.
- **Stage 9 — authoring and publication boundaries** (2026-07): added the
  architecture-edit-v0.2 prepare/show/apply workflow, source-set verifier,
  loopback-only review workspace, semantic layout compiler, registry-driven
  directory, and an allowlisted `dist/` builder that excludes YAML, schemas,
  tests, and authoring tools from Cloudflare Pages.

## Next

- **Stage 10 — more source-backed architectures**: port AlphaFold-family and
  RFD3 slices through the existing ownership, reusable-block, pseudocode, and
  comparison contracts. Evolve the language only when a real architecture
  exposes a missing concept.
- **Stage 11 — assisted source-set onboarding**: design a reviewed bootstrap
  workflow for a method repository, paper, configs, and code evidence. It may
  use an LLM to propose facts, but deterministic validation and explicit
  evidence/certainty must remain the write boundary. The current edit
  transpiler intentionally starts only after a source set is registered.
- **Stage 12 — optional runtime traces**: explore running a small inference
  example and attaching captured representations to existing value sites, so
  users can move from static architecture semantics to an observed execution
  without making runtime data part of the canonical model definition.

## Deferred ideas

- Lint warning for self-referential evidence refs (fires on the whole
  generic demo today, so needs a scaffold exemption first).
- Document-level `default_evidence` with per-item overrides to cut YAML
  boilerplate.
- Clickable hops in the contracted-edge popover (jump to the elided module's
  focus panel).
- A general trace-capture format for tensors, frames, and attention maps; this
  remains deferred until at least one real method can provide safe,
  reproducible inference artifacts.
