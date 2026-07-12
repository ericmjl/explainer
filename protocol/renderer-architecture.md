# Renderer Architecture v0.2

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

The builder accepts legacy architecture `edges` and v0.2 `relations`, then
normalizes both into `architecture-manifest-v0.2`, whose architecture graph is
always exposed as `architecture.relations`. The manifest is generated internal
representation rather than a second durable source contract.

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
