# Visualization Language v0.3 (Legacy Reference)

This file defines the generic semantic-zoom board language used by the static
renderer. The view source decides which architecture objects are visible at
each zoom level; the renderer decides presentation and interaction behavior.

> **Current contract:**
> `protocol/architecture-projection-model.md` specifies the implemented visualization-v0.4,
> where boards declare a subject, relative depth, visible occurrences, and
> presentation overrides while normal edges are derived from architecture
> relations. Visualization-v0.3 below remains a legacy compatibility reference.

## Board Shape

```yaml
schema_version: visualization-v0.3
id: generic_semantic_zoom_board
title: Generic Semantic Zoom Board
entry:
  architecture: architectures/generic-feature-refinement.yaml
root_board: overview
boards:
  - id: overview
    title: System Overview
    summary: Task-level inputs through the system to task-level outputs.
    scale_lanes: false
    grid:
      columns: 3
      rows: 3
    nodes: []
    edges: []
```

The root board is the audience's system map. It should show the complete task
boundary: task-native inputs, the highest-level processing units, and
task-native outputs. "Input" is domain-specific (for example records,
sequences, or random latent noise), not necessarily an image. If a backbone is
surrounded by preprocessing, an execution loop, or decoding, make that
backbone a drillable child instead of using a one-box root wrapper.

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
- The board overview panel lists only drillable nodes (those with `board_ref`),
  plus root-board claims and coverage.

## Canonical Audience View

The browser exposes one interface: the audience view. Its semantic navigation,
model map, bottom explanation surface, focus details, pan, and zoom are parts
of the same experience rather than selectable UI modes.

Board structure and presentation remain source-first. Authors change view
YAML or generic renderer rules, regenerate the manifest, and reload the page;
the renderer does not expose separate edit or tuning modes. Query parameters
may select architecture content with `?arch=<id>`. The experimental
`?layout=elk` path may change layout mechanics, but it does not change the
audience interface.

## Edge Routing

All edges draw as orthogonal polylines — horizontal/vertical segments with
rounded corners — never diagonals or curves, so every board reads in one
visual register. The renderer routes automatically:

- Edges dock on the facing sides of the two boxes; several edges sharing a
  side dock at distinct, evenly spaced points ordered by where their other
  endpoint sits.
- Near-aligned docks snap to a shared coordinate, so grid-aligned neighbors
  connect with a straight line instead of a two-pixel jog.
- Each edge picks the cheapest route (straight, a Z-bend through the channel
  between the boxes, or a detour lane around them) that crosses no node box.
  Backward edges receive the same channel search as forward edges.
- Parallel segments that would draw on top of each other are nudged apart
  into separate lanes.

`tone` controls meaning and appearance; it does not choose geometry. Most
edges, including skip-toned edges, use automatic routing. When an exceptional
edge must stay in a deliberate corridor, the view may set
`route_side: top|bottom|left|right` and an optional positive
`route_clearance` in pixels. This selects a reusable outer lane without
authoring brittle bend points. Typical uses are a lower feedback rail or an
upper residual bypass. Explicit lanes participate in the same parallel-lane
separation as automatic routes.

Routing knobs in the renderer `RULES.route` block remain global presentation
defaults; board sources should use `route_side` sparingly and never encode raw
waypoints.

## Grid Density

`grid.columns`/`grid.rows` size the board. Columns default to a 164px
minimum width (sized for module cards); a dense board made mostly of chips
and operator circles can override with `grid.min_col` (px) and
`grid.col_gap` (px) so many columns still fit one canvas width. The renderer
also fits each board to the view on entry, so overflow degrades to a zoomed
fit rather than clipping.

By default, columns are uniform authored cells. A board may instead set
`grid.column_sizing: content`. In that mode, authored `col` values express
semantic order and alignment rather than equal pixel tracks. The renderer:

- removes column ranks with no visible nodes (including columns occupied only
  by elided nodes);
- measures the widest rendered node in each remaining rank;
- creates fixed content-width tracks separated by edge-to-edge gutters; and
- centers or uniformly fits the intrinsic graph without stretching its
  internal whitespace on wide viewports.

The base gutter comes from `grid.col_gap` or the renderer default. Always-
visible conditioning badges and contracted-edge labels may enlarge only the
adjacent gutter that must carry them. Use the default uniform grid when blank
ranks intentionally reserve lanes. ELK remains a separate experimental layout
path behind `?layout=elk`.

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
    board_ref: group_refiner_detail

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

Edges describe visible information flow on a board. An architecture-backed
edge keeps board-local `from` and `to` node IDs for layout and routing, and
must use `relation_ref` to identify the canonical architecture relation:

```yaml
edges:
  - from: pair_context
    to: group_refiner
    relation_ref: pair_context_biases_group_refiner
    label: bias
    tone: conditioning
    connection:
      title: Pair/context bias
      role: attention-logit conditioning
      inside: The pair/context state is projected to per-head bias terms and added to QK logits.
```

`relation_ref` resolves to a stable ID in the architecture's top-level
`relations`. The architecture relation owns the flow identity, architectural
semantics, and evidence. The view's label, tone, and `connection` fields are
presentation for this board and must not contradict or replace those facts.

The `connection.inside` text should say how the source is used inside the
target. This is the most important part of an edge hover, but it remains
view-specific explanatory prose rather than architecture evidence.

A board-local decomposition edge that does not correspond to a top-level
architecture relation must be marked explicitly:

```yaml
edges:
  - from: overview_context
    to: overview_pipeline
    view_only: true
    label: contextualizes
    connection:
      title: Overview relationship
      role: explanatory grouping
      inside: This board groups the context with the pipeline for orientation.
```

Every board edge must use exactly one of `relation_ref` or `view_only: true`.
`view_only` means the connection belongs only to this board's explanatory
decomposition rather than the top-level architecture graph. It must involve at
least one view-local node, and its architectural content should be grounded by
the board's subject module, pseudocode trace, or standard block. It must not be
used between two architecture-backed nodes to avoid declaring a real relation;
the linter enforces that boundary.

## Drilldown

A node is drillable when it has an explicit `board_ref`, and the referenced
board must exist. The target is never inferred from `module_ref` or the node
ID. This makes navigation independent of architecture-object naming and lets
more than one board explain the same object. Do not author `expandable` in
visualization-v0.3; `board_ref` is the source of drilldown behavior.

## Derivation Rule

View files position and style nodes; they must not restate architecture facts
that can be derived. Two consequences:

- Every board edge whose endpoints both resolve to architecture objects
  (`module_ref` or `rep_ref`) must identify the matching architecture relation
  with `relation_ref`. Board-local decomposition edges involving view-only
  operations must instead use `view_only: true`. The linter enforces this
  distinction.
- Conditioning-mode badges on edges are derived, not authored. When a board
  edge's `relation_ref` identifies a conditioning flow, the renderer uses the
  architecture-owned conditioning mode and applies the conditioning tone
  automatically. Do not hand-write the mode into the edge label.

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
