# Renderer Architecture v0.3

This document describes the generic renderer stack for semantic architecture
explainers. The renderer should stay domain-neutral: source files decide what
a node means, while JavaScript handles layout mechanics, interaction, and
reusable presentation rules.

## Layers

1. **Architecture source**: `architectures/*.yaml` defines modules,
   representations, relations, evidence, state semantics, conditioning, and scale
   transitions.
2. **View source**: `views/*.view.yaml` defines boards, node placement,
   compactness, drilldown, and visible edges.
3. **Pseudocode source**: `pseudocode/*.yaml` defines line-level traces and
   source references.
4. **Standard blocks**: `standard_blocks/*.yaml` defines reusable visual and
   mathematical motifs.
5. **Manifest builder**: `renderer/architecture/build-manifest.rb` compiles the
   registered YAML source sets into `renderer/architecture/manifest-<id>.js`
   files plus `manifest-index.js`.
6. **Browser renderer**: `renderer/architecture/renderer.js` renders boards,
   semantic navigation, audience explanation panels, MathJax equations,
   pan/zoom controls, and source links.

The builder compiles current architecture-v0.3 / visualization-v0.4 sources
into architecture-manifest-v0.3 projected boards. A narrow legacy path still
accepts old architecture `edges` and v0.2 `relations` and normalizes them into
architecture-manifest-v0.2. Manifests are generated internal representations,
not second durable source contracts.

## Semantic Projector

`protocol/architecture-projection-model.md` defines the implemented semantic
layer between sources and browser rendering.

The current pipeline uses a shared build/lint-time semantic projector:

```text
architecture-v0.3 + visualization-v0.4
                  ↓
shared normalizer and semantic board projector
                  ↓
lossless architecture-manifest-v0.3 projected boards
                  ↓
browser layout and geometric wire router
```

The projector derives normal board edges from canonical architecture
relations, remap hidden descendants to visible aggregate modules, contract
explicitly elided paths, preserve ordered relation provenance, and reject
ambiguous or incomplete projections. The browser will continue to own node
measurement, layout, routing, and interaction; it will not interpret semantic
hierarchy or invent architecture flow.

Derived visualization-v0.4 boards normalize to one projected-board manifest
shape. The renderer retains a narrow visualization-v0.3 adapter for old
manifests and records `projectionMode: authored | derived` without interpreting
source schemas in its drawing code.

## Renderer Responsibilities

The browser renderer may:

- draw nodes and board-local edges from a view source while preserving their
  architecture `relation_ref` provenance;
- translate authored semantic column ranks into measured content-width tracks
  when a board requests content sizing, without changing the YAML order;
- choose visual styling from generic fields such as `scale`, `prominence`,
  `treatment`, and `density`;
- show focus-panel summaries, evidence, pseudocode lines, and standard-block
  math;
- support hover peeks, click focus, semantic drilldown, pan, and zoom;
- expose one canonical audience interface rather than separate legacy, edit,
  or tuning modes;
- render generic standard-block diagrams when enough slot information exists.

The browser renderer should not:

- encode a specific architecture's module order;
- require paper-specific module names;
- hardcode evidence claims that belong in YAML;
- infer architecture facts from visual position.

## Current Prototype

The current prototype is `renderer/architecture/`. It reads every source set
registered in `architectures/index.yaml`; the current sets are `generic` and
`dit`.

The prototype supports:

- one canonical audience view with a location guide, model map, and stable
  explanation surface;
- full-width board layout;
- uniform authoring grids plus opt-in compact, content-measured column tracks;
- orthogonal automatic wiring with reusable explicit outer lanes;
- pan and zoom controls;
- hoverable edge ports;
- focus-panel summaries that do not resize the canvas;
- compact and micro node treatments;
- MathJax rendering for standard-block equations.

Architecture selection through `?arch=<id>` changes the source set inside
this interface. `?layout=elk` is retained only as an experimental layout path;
it is not a distinct audience or authoring view. Durable authoring happens in
the source files and renderer rules, followed by manifest regeneration.

## Extension Points

Prefer adding source-language fields before adding special-case renderer code.
Useful generic extensions include:

- `node.icon` for stable visual symbols;
- `edge.geometry` for explicit routing hints;
- `standard_block.visual_template` variants;
- `board.layers` for optional overlays;
- `comparison_refs` for multi-architecture tables;
- `source_ref` deep links for code, docs, papers, or specs.
