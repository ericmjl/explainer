# Renderer Architecture v0.4

Status: **current implemented compiler/renderer boundary**.

This document describes the generic renderer stack for semantic architecture
explainers. The renderer should stay domain-neutral: source files decide what
a node means, while JavaScript handles layout mechanics, interaction, and
reusable presentation rules.

## Layers

1. **Bibliography source**: `references/bibliography.yaml` owns canonical
   paper, code, documentation, specification, and local-source metadata.
2. **Architecture source**: `architectures/*.yaml` defines modules,
   representations, value sites, hierarchy/decomposition, relations, evidence,
   state semantics, conditioning, and scale transitions.
3. **View source**: `views/*.view.yaml` defines boards, node placement,
   compactness, drilldown, visibility decisions, and edge presentation
   overrides. Normal edges are not authored here.
4. **Pseudocode source**: `pseudocode/*.yaml` defines line-level traces and
   source references.
5. **Standard blocks**: `standard_blocks/*.yaml` defines reusable visual and
   mathematical motifs.
6. **Manifest builder**: `renderer/architecture/build-manifest.rb` compiles the
   registered YAML source sets into `renderer/architecture/manifest-<id>.js`
   files plus `manifest-index.js`, including relation-derived interfaces and
   top-down decomposition coverage. It first runs the same strict source
   validation used by `scripts/lint_sources.rb`.
7. **Browser renderer**: `renderer/architecture/renderer.js` renders boards,
   semantic navigation, audience explanation panels, MathJax equations,
   pan/zoom controls, and source links.

The builder compiles current architecture-v0.4 / visualization-v0.4 sources
into architecture-manifest-v0.4 projected boards. A narrow legacy path still
accepts old architecture `edges` and v0.2 `relations` and normalizes them into
architecture-manifest-v0.2. Manifests are generated internal representations,
not second durable source contracts.

## Semantic Projector

`protocol/architecture-projection-model.md` defines the implemented semantic
layer between sources and browser rendering.

The current pipeline is implemented in Ruby through shared build/lint
components:

```text
architecture-v0.4 + visualization-v0.4
                  ↓
strict YAML + executable schema + evidence validation
                  ↓
ownership validation + decomposition coverage compilation
                  ↓
semantic board projector
                  ↓
deterministic architecture-manifest-v0.4 projected boards
                  ↓
browser layout and geometric wire router
```

The projector derives normal board edges from canonical architecture
relations, remaps hidden descendants to visible aggregate modules, contracts
explicitly elided paths, preserve ordered relation provenance, and reject
ambiguous or incomplete projections. The browser will continue to own node
measurement, layout, routing, and interaction; it will not interpret semantic
hierarchy or invent architecture flow.

Derived visualization-v0.4 boards normalize to one projected-board manifest
shape. The renderer retains a narrow visualization-v0.3 adapter for old
manifests and records `projectionMode: authored | derived` without interpreting
source schemas in its drawing code.

The manifest retains canonical architecture fields needed by consumers and
adds derived indexes, projected edges, generator identity, and SHA-256 input
digests. It is not a YAML round-trip format: paths are web-normalized and
renderer-specific indexes are materialized. `build-manifest.rb --check`
compiles in memory and rejects stale committed manifests.

## Renderer Responsibilities

The browser renderer may:

- draw compiled nodes and projected edges while preserving complete canonical
  `relation_path` provenance;
- translate authored semantic column ranks into measured content-width tracks
  when a board requests content sizing, without changing the YAML order;
- choose visual styling from generic fields such as `scale`, `prominence`,
  `treatment`, and `density`;
- show focus-panel summaries, evidence, pseudocode lines, and standard-block
  math;
- support hover peeks, click focus, semantic drilldown, pan, and zoom;
- expose node and edge inspection through keyboard focus and activation;
- escape source-authored prose before HTML insertion and reject active-content
  link schemes;
- expose one canonical audience interface rather than separate legacy, edit,
  or tuning modes;
- render generic standard-block diagrams when enough slot information exists.

The browser renderer should not:

- encode a specific architecture's module order;
- target architecture or board IDs from generic renderer CSS;
- require paper-specific module names;
- hardcode evidence claims that belong in YAML;
- infer architecture facts from visual position.

## Current Prototype

The current prototype is `renderer/architecture/`. It reads every source set
registered in `architectures/index.yaml`; the current sets are `generic` and
`dit`.

The prototype supports:

- one canonical audience view with a location guide, a model map switchable
  between the whole model and immediate parent board, and one compact bottom
  dock whose resting takeaway is replaced by hover previews or pinned details;
- a model map rendered as a dedicated pure-SVG thumbnail of the selected
  board: it preserves board geometry, tensor/module/operation silhouettes,
  and wire tones while deliberately omitting card text and internal UI;
- strong current-region emphasis over a subdued root or parent snapshot, so
  the map answers location rather than repeating the board explanation;
- full-width board layout;
- an unbanded canvas by default, with optional lane guides authored explicitly
  per board in view YAML;
- uniform authoring grids plus opt-in compact, content-measured column tracks;
- orthogonal automatic wiring with reusable explicit outer lanes;
- pan and zoom controls;
- hoverable edge ports;
- keyboard-operable tensor nodes and edge inspectors, with wire roles
  distinguished by dash pattern as well as color;
- focus-panel summaries that do not resize the canvas;
- bibliography-resolved paper and code citations with typed roles and local
  evidence locators;
- compact and micro node treatments;
- MathJax rendering for standard-block equations.

Architecture selection through `?arch=<id>` changes the source set inside
this interface. `?layout=elk` is retained only as an experimental layout path;
it is not a distinct audience or authoring view. Durable authoring happens in
the source files and renderer rules, followed by manifest regeneration.

## Extension Points

Prefer adding source-language fields before adding special-case renderer code.
Potential generic extensions below are design candidates, not currently
supported authoring fields:

- `node.icon` for stable visual symbols;
- `edge.geometry` for explicit routing hints;
- `standard_block.visual_template` variants;
- `board.layers` for optional overlays;
- `comparison_refs` for multi-architecture tables;
- graph views derived from typed `source_ref` links to the central bibliography.
