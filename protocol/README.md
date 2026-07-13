# Design Document Index

This directory contains the source and renderer contracts for the explainer.
`AGENTS.md` is the operational authoring guide; the documents below explain
the design in detail.

## Current Implemented Contracts

| Document | Scope |
| --- | --- |
| `architecture-language.md` | architecture-v0.4 source vocabulary |
| `source-validation.md` | strict parsing, executable schemas, semantic validation, and deterministic compilation |
| `id-evolution.md` | stable-ID compatibility and atomic refactor policy |
| `fact-ownership.md` | one-owner rules and derived interfaces |
| `architecture-coverage.md` | top-down decomposition closure and compiled breadth/depth frontiers |
| `architecture-projection-model.md` | visualization-v0.4 semantic projection and migration behavior |
| `visualization-language.md` | current board authoring, visibility, layout, and presentation overrides |
| `bibliography.md` | central source metadata and typed evidence refs |
| `pseudocode-language.md` | code/algorithm traces linked to architecture refs |
| `standard-blocks.md` | reusable mathematical and visual motifs |
| `renderer-architecture.md` | Ruby compiler boundary and browser audience renderer |

Current source sets compile as:

```text
architecture-v0.4 + visualization-v0.4
  -> strict YAML + shared executable schemas
  -> Ruby evidence/ownership/coverage/projection pipeline
  -> architecture-manifest-v0.4
  -> canonical browser audience view
```

Generated manifests are deterministic internal compiler output with input
digests. YAML and Markdown remain the durable sources.

## Proposed Contract

`architecture-comparison-protocol.md` is a design proposal for a future
cross-architecture comparison source and renderer. It is not yet registered,
linted, or rendered by the current pipeline.

## Legacy Compatibility

Architecture-v0.1/v0.2/v0.3 and visualization-v0.1/v0.2/v0.3 behavior is
documented only where migration requires it, primarily in
`architecture-projection-model.md`. New sources use architecture-v0.4 and
visualization-v0.4; do not copy legacy authored-edge examples into current
views.
