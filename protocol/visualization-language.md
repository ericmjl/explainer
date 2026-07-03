# Visualization Language v0.2

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

## Renderer Visibility Defaults

Rules the renderer applies that change what is visible (not merely styled).
Authors should know these; if one fights a specific board, the fix is a view
override (to be added when first needed), not a renderer tweak.

- Edge labels render only on edges spanning at least ~130px, on contracted
  edges, and on conditioning-toned edges. Short adjacent hops communicate by
  arrow/tone alone; their label and connection text remain available on
  hover.
- Compact/micro node treatments suppress `role`/`detail` prose on the card;
  it appears in the hover panel.
- The board overview panel lists only drillable (expandable) nodes, plus
  root-board claims and coverage.

## Grid Density

`grid.columns`/`grid.rows` size the board. Columns default to a 164px
minimum width (sized for module cards); a dense board made mostly of chips
and operator circles can override with `grid.min_col` (px) and
`grid.col_gap` (px) so many columns still fit one canvas width. The renderer
also fits each board to the view on entry, so overflow degrades to a zoomed
fit rather than clipping.

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

## Derivation Rule

View files position and style nodes; they must not restate architecture facts
that can be derived. Two consequences:

- Every board edge whose endpoints both resolve to architecture objects
  (`module_ref` or `rep_ref`) must correspond to an architecture edge or to a
  module `inputs`/`outputs` entry. The linter enforces this.
- Conditioning-mode badges on edges are derived, not authored. When a board
  edge runs from a node whose `rep_ref` is the `source` of an architecture
  `conditioning` entry to a node whose `module_ref` is that entry's `target`
  module, the renderer badges the edge with the entry's `mode` and applies the
  conditioning tone automatically. Do not hand-write the mode into the edge
  label.

## Tensor-Shaped Representation Nodes

Representations (variables) must read differently from modules (functions).
A representation node is not a card describing a tensor — the node IS the
tensor, in the style of paper figures: the box shape encodes rank. All ranks
show the math symbol above the box. Non-scalars show tensor dimensions inside
the box. A short human-readable variable name appears below the box; richer
meaning, state semantics, and evidence live in the hover/focus panel.

Shape classes, derived from the architecture representation's `shape` string
(parse up to the first comma, split on ` x `, drop a leading batch axis `B`):

- 0 remaining axes -> `scalar`: a small square with symbol above
  (timestep `t`, class label `y`). No dims shown.
- 1 axis -> `vector`: a flat wide box; symbol above, dims inside (`d`).
- 2 axes -> `matrix`: a rectangle; symbol above, dims inside (`T × d`).
- 3+ axes with the first two equal -> `pair`: a square with a drawn
  diagonal; symbol above, dims inside (`N × N × d`).
- 3+ axes otherwise -> `volume`: a rectangle with a stacked offset outline
  suggesting depth; symbol above, dims inside (`C × H × W`).

The heuristic can be overridden with `glyph: scalar|vector|matrix|pair|volume`
on the architecture representation or on the view node (node wins).

The displayed symbol is derived from the pseudocode source: the pseudocode
symbol whose `architecture_ref` points at the representation provides its
`name` (`x`, `c`, `t`) or optional `tex`. It falls back to the view node label,
then the representation id. Give pseudocode symbols paper notation — that is
what boards display.

## Operator Nodes

Elementwise combination modules render as small circuit-style circles (⊕ for
sum) instead of module cards, so a cheap arithmetic op never carries the same
visual weight as a computation stack. Derived from the architecture module's
`kind`: `elementwise_sum` → `+`, `elementwise_product` → `×`,
`concatenation` → `∥`. A view node may override with `operator: "<glyph>"`
for one-off cases. Hover/click behave like any module (peek, focus panel,
evidence).

## Elision and Edge Contraction

A node with `elide: true` is authored on the board (with full edges) but not
rendered. The renderer contracts the graph: for each elided node, every
incoming/outgoing edge pair is merged into a through-edge that records the
hidden hops.

```yaml
nodes:
  - id: patchify
    kind: module
    module_ref: patchify
    col: 2
    row: 3
    elide: true
```

Rules:

- Author boards as the full graph; elision is a rendering projection. This is
  what keeps hidden featurization consistent with the architecture source.
- Contracted edges render dashed. Hovering the edge itself peeks at the hidden
  chain (each hop's label and `connection.inside`); clicking the edge pins the
  popover, clicking again or panning unpins.
- An elided node must have at least one incoming and one outgoing edge, and
  must not have both fan-in and fan-out (in-degree and out-degree both above
  one), because the contraction would be ambiguous. The linter enforces both
  rules; `1xN` and `Nx1` are allowed.
- `elide` hides a node the board still explains; `prominence: hidden` hides a
  node without contraction. Use `elide` for pass-through stages such as
  featurization, use `hidden` only for purely visual suppression.
