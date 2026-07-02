# Visualization Language v0.1

This file defines the generic semantic-zoom board language used by the static
renderer. The view source decides which architecture objects are visible at
each zoom level; the renderer decides presentation and interaction behavior.

## Board Shape

```yaml
schema_version: visualization-v0.1
id: generic_semantic_zoom_board
title: Generic Semantic Zoom Board
entry:
  architecture: architectures/generic-feature-refinement.yaml
root_board: overview
boards:
  - id: overview
    title: System Overview
    summary: One-block overview.
    scale_lanes: false
    grid:
      columns: 3
      rows: 3
    nodes: []
    edges: []
```

## Nodes

Nodes can point to architecture modules or representations:

```yaml
nodes:
  - id: group_refiner
    kind: module
    module_ref: group_refiner
    prominence: primary
    treatment: block
    col: 3
    row: 2
    expandable: true

  - id: pair_context
    kind: representation
    rep_ref: pair_context
    prominence: secondary
    treatment: compact
    density: compact
    col: 3
    row: 1
```

Common visual fields:

- `prominence`: `primary`, `secondary`, `context`, or `hidden`.
- `treatment`: `block`, `compact`, `chip`, or `hidden`.
- `density`: `normal`, `compact`, or `micro`.
- `scale_lanes`: `false` for abstract boards; otherwise the renderer can show
  scale bands.

## Edges

Edges describe visible information flow on a board:

```yaml
edges:
  - from: pair_context
    to: group_refiner
    label: bias
    tone: conditioning
    connection:
      title: Pair/context bias
      role: attention-logit conditioning
      inside: The pair/context state is projected to per-head bias terms and added to QK logits.
```

The `connection.inside` text should say how the source is used inside the
target. This is the most important part of an edge hover.

## Drilldown

A node is expandable only when the target board exists. If `module_ref` is set,
the target board id is the module id. Otherwise the node id is used.
