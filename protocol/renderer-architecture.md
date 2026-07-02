# Renderer Architecture v0.1

This document describes the planned renderer stack for the protein visualization
language.

## Layers

```text
Source files
  architecture YAML
  pseudocode YAML
  standard block YAML
  comparison YAML
  story refs

Resolver
  load files
  validate schemas
  resolve refs
  attach evidence
  build normalized graph

Layout engine
  x: dataflow order
  y: representation scale
  depth: containment/focus affordance

View registry
  architecture_map
  module_focus
  standard_block_focus
  pseudocode_stepper
  mask_matrix
  geometry_sidecar
  evidence_trace

Interaction controller
  hover -> peek
  click -> focus
  breadcrumb navigation
  active pseudocode line

Render targets
  SVG for graph/module structure
  HTML/CSS for cards and panels
  Canvas for dense masks/matrices
  Three.js only for optional geometry sidecars
```

## Source Resolver

The resolver should turn source files into one normalized object:

```yaml
resolved_view:
  id: af3_diffusion_module_view
  nodes: []
  edges: []
  standard_blocks: []
  pseudocode_programs: []
  stories: []
  evidence_index: []
```

Resolver responsibilities:

- parse YAML;
- resolve relative paths;
- attach `story_ref`, `standard_block_ref`, and `pseudocode_ref`;
- preserve evidence status and source refs;
- identify repeated modules and canonical representative blocks;
- create fallback inspectors for units with no curated story.

## Focus Resolution

Clicking a unit should follow this order:

```text
unit.story_ref
  -> curated story page or embedded story renderer
unit.standard_block_ref
  -> standard block focus renderer
unit.pseudocode_ref
  -> pseudocode stepper
otherwise
  -> generated YAML inspector
```

This keeps authored explanations possible without requiring every block to have
a hand-built page.

## 2.5D View Model

The renderer should look layered but remain legible.

Use:

- shadows;
- slight lifts on hover;
- stacked cards for repeated blocks;
- exploded slices for internals;
- breadcrumbs for nesting;
- side panels for source/evidence.

Do not use full 3D camera navigation for architecture maps.

## View Registry

### `architecture_map`

Purpose: show the coarse architecture chain.

Input:

- architecture modules;
- edges;
- representation scales.

Output:

- lane-based graph;
- module cards;
- edge arrows;
- hover previews.

### `module_focus`

Purpose: show one module and its immediate internals.

Input:

- one module;
- `contains`;
- depth/repeats/heads;
- standard block refs.

Output:

- canonical repeated block;
- incoming/outgoing representations;
- available stories or standard blocks.

### `standard_block_focus`

Purpose: render a reusable motif.

Input:

- standard block YAML;
- symbol bindings from pseudocode or architecture.

Output:

- canonical block diagram;
- math steps;
- slot cards;
- evidence refs for this usage.

### `pseudocode_stepper`

Purpose: line-by-line source explanation.

Input:

- pseudocode YAML.

Output:

- pseudocode lines;
- active symbols;
- visual scene for active line;
- source refs and evidence.

### `geometry_sidecar`

Purpose: optional geometry panel for concepts where spatial intuition matters.

Input:

- pseudocode visual scene;
- geometry symbols.

Output:

- Three.js/SVG/canvas scene beside pseudocode.

Use this for IPA frames, local atom coordinates, 3D RoPE, ligand/pocket geometry,
or frame transforms. Do not make it the default renderer.

## Minimal Implementation Plan

1. Build a static YAML loader that fetches architecture, pseudocode, and standard
   block YAML files.
2. Implement `architecture_map` as SVG + HTML cards.
3. Implement hover peek for module cards.
4. Implement click focus with fallback inspector.
5. Implement `standard_block_focus` for pair-biased attention.
6. Implement `pseudocode_stepper` for ESMFold2 pair-bias boundary.
7. Add optional canvas mask renderer for local atom attention.
8. Add optional Three.js sidecar only for IPA/frame geometry.

## Success Criteria

- Adding a new architecture YAML creates a usable coarse map without HTML edits.
- Adding a `standard_block_ref` gives a reusable block view without custom JS.
- Adding a `story_ref` overrides the generated view with a curated story.
- Evidence status is visible in every generated view.
