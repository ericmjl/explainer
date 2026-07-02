# Renderer Architecture v0.1

This document describes the generic renderer stack for semantic architecture
explainers. The renderer should stay domain-neutral: source files decide what
a node means, while JavaScript handles layout mechanics, interaction, and
reusable presentation rules.

## Layers

1. **Architecture source**: `architectures/*.yaml` defines modules,
   representations, edges, evidence, state semantics, conditioning, and scale
   transitions.
2. **View source**: `views/*.view.yaml` defines boards, node placement,
   compactness, drilldown, and visible edges.
3. **Pseudocode source**: `pseudocode/*.yaml` defines line-level traces and
   source references.
4. **Standard blocks**: `standard_blocks/*.yaml` defines reusable visual and
   mathematical motifs.
5. **Manifest builder**: `renderer/architecture/build-manifest.rb` compiles the
   YAML sources into `renderer/architecture/manifest.js`.
6. **Browser renderer**: `renderer/architecture/renderer.js` renders boards,
   focus panels, MathJax equations, pan/zoom controls, and source links.

## Renderer Responsibilities

The browser renderer may:

- draw nodes and edges from a view source;
- choose visual styling from generic fields such as `scale`, `prominence`,
  `treatment`, and `density`;
- show focus-panel summaries, evidence, pseudocode lines, and standard-block
  math;
- support hover peeks, click focus, semantic drilldown, pan, and zoom;
- render generic standard-block diagrams when enough slot information exists.

The browser renderer should not:

- encode a specific architecture's module order;
- require paper-specific module names;
- hardcode evidence claims that belong in YAML;
- infer architecture facts from visual position.

## Current Prototype

The current prototype is `renderer/architecture/`. It reads:

- `architectures/generic-feature-refinement.yaml`
- `views/generic-semantic-zoom.view.yaml`
- `pseudocode/generic-feature-refinement.yaml`
- `standard_blocks/*.yaml`

The prototype supports:

- full-width board layout;
- pan and zoom controls;
- hoverable edge ports;
- focus-panel summaries that do not resize the canvas;
- compact and micro node treatments;
- MathJax rendering for standard-block equations.

## Extension Points

Prefer adding source-language fields before adding special-case renderer code.
Useful generic extensions include:

- `node.icon` for stable visual symbols;
- `edge.geometry` for explicit routing hints;
- `standard_block.visual_template` variants;
- `board.layers` for optional overlays;
- `comparison_refs` for multi-architecture tables;
- `source_ref` deep links for code, docs, papers, or specs.
