# Design Document Index

This directory contains the source and renderer contracts for the explainer.
`AGENTS.md` is the operational authoring guide; the documents below explain
the design in detail.

## Current Implemented Contracts

| Document | Scope |
| --- | --- |
| `architecture-language.md` | architecture-v0.5 source vocabulary |
| `architecture-edit-language.md` | backwards-compatible architecture-edit-v0.1/v0.2 prepare/show/apply plans |
| `architecture-review-workspace.md` | loopback-only human review UX over typed edit plans |
| `source-validation.md` | strict parsing, schemas, semantic checks, source-set verification, and deterministic compilation |
| `id-evolution.md` | stable-ID compatibility and atomic refactor policy |
| `fact-ownership.md` | one-owner rules and derived interfaces |
| `architecture-coverage.md` | top-down decomposition closure and compiled breadth/depth frontiers |
| `architecture-projection-model.md` | visualization-v0.4 semantic projection and migration behavior |
| `semantic-layout.md` | deterministic semantic-flow placement and feedback-rail policy |
| `visualization-language.md` | current board authoring, visibility, layout, and presentation overrides |
| `bibliography.md` | central source metadata and typed evidence refs |
| `pseudocode-language.md` | code/algorithm traces linked to architecture refs |
| `standard-blocks.md` | reusable mathematical and visual motifs |
| `renderer-architecture.md` | Ruby compiler boundary and browser audience renderer |

Current source sets compile as:

```text
architecture-v0.5 + visualization-v0.4
  + pseudocode-v0.1/v0.2 + standard-block-v0.1/v0.2/v0.3
  -> strict YAML + shared executable schemas
  -> Ruby evidence/ownership/coverage/projection/pseudocode pipeline
  -> architecture-manifest-v0.5
  + optional architecture-comparison-v0.1 compiled alignment metadata
  -> canonical browser audience view
  -> scripts/build_pages.rb allowlist
  -> audience-only dist/
```

Generated manifests are deterministic internal compiler output with input
digests. YAML and Markdown remain the durable sources.

`dist/` is a deployment artifact, not another source layer. It contains only
the landing page, renderer, styles/themes, compiled manifest JavaScript, and
static security headers. Never deploy or serve the repository root as the
audience site.

Every staged local browser dependency receives the same content-derived build
query. Combined with revalidation headers, that keeps the ES-module graph
deployment-consistent in browsers with persistent module caches, especially
Safari.

`scripts/build_pages.rb --source-set <id>` makes the production source-set
allowlist explicit. Repeating the option includes multiple architectures. The
staged manifest registry contains exactly that ordered registry subset, and a
compiled comparison remains only when all of its subject source sets are
present. This deployment filter does not alter canonical YAML or claim that
excluded drafts passed verification.

Architecture edit plans are optional transactional authoring instructions.
They resolve one registered source set, show a semantic diff, and write
canonical YAML only after stale-plan and full source validation succeed.
The local review workspace is a browser client of that same compiler; it is
not an editable copy of the audience manifest.

## Comparison Contract

`architecture-comparison-protocol.md` defines the registered v0.1 comparison
source, compiled fact alignment, and evidence contract used by the comparison
renderer.

## Legacy Compatibility

Architecture-v0.1/v0.2/v0.3 and visualization-v0.1/v0.2/v0.3 behavior is
documented only where migration requires it, primarily in
`architecture-projection-model.md`. New sources use architecture-v0.5 and
visualization-v0.4; do not copy legacy authored-edge examples into current
views.
