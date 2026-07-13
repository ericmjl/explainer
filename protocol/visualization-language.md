# Visualization Language v0.4

Status: **current implemented contract**.

A visualization source defines curated semantic-zoom boards over one
architecture-v0.4 graph. It owns selection, layout, navigation, visibility
decisions, and presentation. Canonical modules, values, relations, semantics,
and evidence remain owned by the architecture source.

The full projection algorithm is specified in
`protocol/architecture-projection-model.md`.
Its executable structural contract is
`schemas/visualization-v0.4.schema.json`; unknown board fields, legacy
`edges`/`view_only` flow, invalid enums, and malformed routing hints fail before
projection.

## Top-Level Shape

```yaml
schema_version: visualization-v0.4
id: architecture_semantic_zoom
title: Architecture Semantic Zoom
entry:
  architecture: architectures/generic-feature-refinement.yaml
root_board: system_overview
boards: []
```

Every board declares:

- a stable local `id`;
- `subject_ref` (`architecture` for the root or one `modules.*` ref);
- non-negative relative `expansion_depth`;
- a grid; and
- an exact curated `nodes` list.

Optional `notes` add board-specific explanatory caveats to the resting
takeaway. They are presentation prose, not a location for architecture facts.

```yaml
boards:
  - id: sampler
    title: Sampling Loop
    summary: One reverse-diffusion iteration.
    parent: system_overview
    subject_ref: modules.ddpm_sampler
    expansion_depth: 1
    grid:
      columns: 7
      rows: 4
      column_sizing: content
    nodes: []
```

The root board shows the complete task boundary: task-native inputs,
highest-level system units, and task-native outputs. A backbone surrounded by
preprocessing, a loop, or decoding belongs on a child board rather than inside
a one-box root wrapper.

## Subject and Depth

Board depth is relative to its subject:

```text
eligible depth <= hierarchy depth(subject_ref) + expansion_depth
```

The exact node list is still editorially curated. Expansion depth is a
validation horizon, not an instruction to dump every eligible object.

A child board expands exactly one conceptual module. The node opening it uses
an explicit `board_ref`, and the child board's `subject_ref` must equal that
node's canonical module ref. Boards may expand only modules whose decomposition
status is `complete` or `partial`; `leaf` and `opaque` modules are terminal.

## Nodes

A board node is a local visual occurrence bound through one typed canonical
`ref`:

```yaml
nodes:
  - id: current_latent
    ref: value_sites.latent_before_step
    label: Current latent x_t
    prominence: secondary
    treatment: compact
    density: compact
    col: 1
    row: 3

  - id: denoiser
    ref: modules.dit_denoiser
    prominence: primary
    treatment: block
    board_ref: denoiser_forward
    col: 3
    row: 3
```

Normal nodes bind only to `modules.*` or `value_sites.*`. Representation types
are reusable descriptions, not occurrences; relations are edge provenance,
not nodes.

Common presentation fields:

- `label`, `notation`, `role`, and `detail` for board-specific explanation;
- `prominence`: `primary`, `secondary`, or `context`;
- `treatment`: `block`, `compact`, or `chip`;
- `density`: `normal`, `compact`, or `micro`;
- `col` and `row` for declarative placement; and
- `board_ref` for drilldown.

Do not author `expandable`; drilldown is determined only by `board_ref`.

When the same canonical object appears more than once on one board, bind the
ambiguous projected relation explicitly:

```yaml
occurrence_bindings:
  - match:
      relation_ref: relations.updated_state_reenters_loop
    from_occurrence: state_after_step
    to_occurrence: state_before_next_step
```

The binding selects local occurrences. It does not redefine architecture
endpoints.

## Grid and Spacing

`grid.columns` and `grid.rows` define authored ranks. The default grid uses
uniform columns and preserves blank ranks when they intentionally create
lanes.

Use `grid.column_sizing: content` when `col` should communicate order and
alignment without reserving full-width holes. The renderer then:

- removes ranks with no visible nodes;
- measures the widest node in each remaining rank;
- builds content-width tracks with edge-to-edge gutters; and
- centers or fits the intrinsic graph without stretching internal whitespace.

`grid.min_col` and `grid.col_gap` tune dense boards generically. Module pixel
positions and architecture-specific ranks must not be hardcoded in renderer
JavaScript.

ELK remains an experimental layout implementation behind `?layout=elk`; it is
not a separate authoring or audience mode.

## Optional Lane Guides

The canvas has no default lane ontology. A board may add named horizontal
guides only when they clarify that architecture:

```yaml
lanes:
  - id: conditioning
    label: conditioning
    position: 18
  - id: token_stream
    label: tokens
    position: 55
```

`position` is a percentage from the top of the drawable region and must be
between 0 and 100. Omit `lanes` for the normal unbanded canvas. The old
`scale_lanes` flag is retired because it exposed a hardcoded renderer ontology.

## Edges Are Derived

Visualization-v0.4 boards do not author normal `edges` and do not use
`view_only` semantic flow. The shared projector derives board edges from
canonical architecture relations after applying scope, hierarchy collapse,
elision, exclusion, and occurrence binding.

This is a hard ownership boundary:

- architecture `relations` own endpoints, kinds, carries, operations, and
  evidence;
- the projector owns visible edge derivation and ordered provenance; and
- the board owns only presentation overrides.

If a desired wire has no canonical relation path, fix the architecture source.
Annotations and guides may be added through non-flow concepts, but they cannot
connect architecture-backed objects as substitute semantic edges.

## Visibility Decisions

Every in-scope, relation-participating object must be accounted for. The board
has four visibility meanings:

| Decision | Meaning | Flow behavior |
| --- | --- | --- |
| Visible | Include a canonical occurrence in `nodes` | Projected edges connect normally |
| Collapsed | Show a selected ancestor module instead of its descendants | Internal flow disappears; boundary flow maps to the ancestor |
| Elided | Deliberately hide a pass-through object | Adjacent canonical paths contract into an inspectable edge |
| Excluded | Declare an object outside this board's scope | Object and incident flow are removed, never contracted |

Selecting an ancestor module implicitly collapses its unselected descendants;
there is no authored `collapse` list.

Elision and exclusion are explicit typed refs:

```yaml
elide:
  - ref: modules.inverse_latent_scaling
  - ref: value_sites.vae_decode_latent

exclude:
  - ref: value_sites.training_target
    reason: This board explains inference rather than training.
```

Use `elide` only for a genuine pass-through contraction with incoming and
outgoing canonical flow. An elided component with both multiple visible inputs
and multiple visible outputs is ambiguous and fails projection. Root task
inputs and outputs cannot be elided or excluded.

Omission is not implicit elision. An eligible object that is not visible,
collapsed, elided, excluded, or safely depth-hidden fails projection.

## Edge Presentation Overrides

An edge override matches exactly one generated direct relation or ordered
contracted path:

```yaml
edge_overrides:
  - match:
      relation_ref: relations.current_latent_enters_reverse_step
    label: current x_t
    tone: skip
    route_side: bottom
    route_clearance: 24
    connection:
      title: Current latent into fixed sampler math
      role: sampler state dependency
      inside: The equation needs the current latent in addition to the model prediction.

  - match:
      relation_path:
        - relations.final_latent_enters_inverse_scaling
        - relations.inverse_scaling_produces_decode_latent
        - relations.decode_latent_enters_vae
    label: decoder latent
```

`match` contains exactly one `relation_ref` or ordered `relation_path`. Zero or
multiple generated matches fail projection.

Allowed override content is presentation:

- concise label or notation;
- `tone` such as `conditioning` or `skip`;
- `connection.title`, `connection.role`, and `connection.inside`;
- exceptional `route_side: top|bottom|left|right`; and
- positive `route_clearance` when a deliberate outer corridor is necessary.

Connection prose should explain how the source is used inside the target, not
merely repeat the label. Overrides may not redefine endpoints, kinds, carried
representations, operations, or evidence. Conditioning-mode badges are derived
from architecture `conditioning`; do not put modes into edge labels.

## Representation Glyphs

Value-site nodes render using their representation shape. The node is the
tensor glyph rather than a card describing a tensor. All ranks show a math
symbol above the box; non-scalars show dimensions inside; a short variable
name appears below.

After dropping a leading batch axis, the generic shape heuristic is:

- zero axes: `scalar`;
- one axis: `vector`;
- two axes: `matrix`;
- three or more axes with equal first two dimensions: `pair`; and
- other three-or-more-axis shapes: `volume`.

Override parsing only when necessary with
`glyph: scalar|vector|matrix|pair|volume`. Pseudocode symbols provide preferred
paper notation through `architecture_ref`; the renderer falls back to the node
label and representation ID.

## Operator Modules

Cheap elementwise modules render as circuit-style operators rather than full
cards. Generic mappings include:

- `elementwise_sum` -> `+`;
- `elementwise_product` -> `×`; and
- `concatenation` -> `∥`.

A node may provide an `operator` glyph for an exceptional presentation case.
The canonical operation still belongs to the architecture module and
relations.

## Routing

The renderer measures placed nodes and routes orthogonal polylines with rounded
corners. It chooses facing docks, separates shared ports and parallel segments,
snaps near-aligned neighbors, and searches straight, channel, and detour paths
that avoid node boxes.

Tone controls meaning and appearance, not geometry. Most edges require no
route hints. Use `route_side` and `route_clearance` sparingly for deliberate
feedback or bypass rails; never author raw bend points.

Edge labels appear when space permits, on contracted edges, and on
conditioning-toned edges. Full relation and connection detail remains
available through hover/focus interaction.

## Canonical Audience Interface

The browser provides one audience view. Semantic navigation, a root/immediate-
parent SVG snapshot map, the compact explanation dock, focus details, pan, and
zoom are parts of that interface—not selectable edit or tuning modes. The map
derives the selected board's geometry and flow but intentionally reduces nodes
to unlabeled silhouettes; its job is to locate the current region, not repeat
the full board at unreadable scale.

`?arch=<id>` selects the registered architecture. `?layout=elk` changes only
the experimental layout implementation. Durable changes happen in YAML or
generic renderer rules followed by manifest regeneration.

## Validation and Compilation

The Ruby projector validates subject scope, relative depth, exact occurrence
binding, visibility accounting, elision ambiguity, exclusions, drilldown
compatibility, presentation-only overrides, and root boundary reachability.
It emits canonical projected edges with ordered relation provenance into
`architecture-manifest-v0.4`.

Before projection, JSON Schema validation also enforces grid and field types,
presentation enums, edge-override shape, and the absence of authored v0.4
flow. The repository linter additionally rejects overlapping node cells,
out-of-grid placement, and clearance hints without a route side.

Visualization-v0.3 authored-edge boards remain readable only through the
legacy manifest adapter. New and registered sources use visualization-v0.4.
