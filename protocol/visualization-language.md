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

## Published Reference Panels

An ordinary board may place one or more cited author figures beside its
architecture graph with `reference_panels`. A panel is view-owned explanatory
material, not a module, value site, or relation: it never participates in
projection, routing, selection, or semantic zoom.

```yaml
reference_panels:
  - id: authors_partial_atomization
    title: Authors' partial-atomization diagram
    asset: assets/reference-panels/genie3/figure_1_partial_atomization.png
    alt: Author diagram comparing motif scaffolding and binder design.
    caption: Known regions expose atom-level context while designed regions remain C-alpha tokens.
    source_ref: genie3_2026
    locator: Figure 1, Partial Atomization panel
    license_note: Cropped from Lin et al. (2026), licensed CC BY 4.0.
    position: right
```

Reference images must be raster assets under `assets/reference-panels/` and
must include meaningful alternative text, board-specific caption prose, an
existing bibliography `source_ref`, a precise figure locator, and an explicit
license or attribution note. `position: right` reserves a side rail without
changing the authored grid; the renderer keeps the card outside canvas pan
and zoom. Its magnifying action opens an in-app figure viewer with independent
zoom and pan, while the citation links to the publication source.

The static publisher copies only assets named by selected boards. A crop may
help readers relate a paper figure to the explainer, but it is never evidence
that silently creates architecture facts; canonical facts and their evidence
remain in the architecture source.

## Reusable-Block Detail Boards

A reusable algorithm detail is the one exception to an architecture board's
authored `grid` and `nodes`. It is an explicit source-level board stub with
`kind: standard_block_instance`, a stable `id`, `parent`, `subject_ref`, and
`block_instance_ref`. The referenced standard-block template supplies the
internal grid, nodes, and step-derived edges during manifest compilation.

The parent module still owns an explicit `board_ref`, so static deep links and
breadcrumbs behave exactly like ordinary boards. Reusable template flows do
not enter `ArchitectureProjection`: boundary flows retain canonical relation
paths and internal flows declare `grounding: standard_block_template`. A stub
must not author `grid`, `nodes`, `edge_overrides`, lanes, regions, elisions, or
exclusions.

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

## Repeat Regions

A board may enclose one rendered iteration of a canonical execution loop with
a typed repeat region:

```yaml
regions:
  - id: one_refinement_iteration
    kind: repeat
    execution_ref: execution.loops.refinement_loop
    label: one refinement iteration
    node_ids:
      - input_adapter
      - item_state
      - item_encoder
      - group_refiner
      - output_decoder
    iteration_relation_refs:
      - relations.input_adapter_initializes_item_state
```

`node_ids` are local board occurrence IDs because enclosure membership is
presentation. `execution_ref` owns the iteration identity and repeat count; the
view must not copy `x5`, `x8`, or another count into its label. The renderer
derives that annotation from the referenced loop and measures the member node
boxes after layout. Authors do not provide region coordinates, padding, dash
styles, or other raw geometry. An enclosure is painted only after every
declared member has a measured box; a partial measurement never produces a
smaller, misleading region.

Every visible occurrence of a module named in the loop's canonical `reruns`
list must belong to the region. Optional `iteration_relation_refs` identify
canonical relations that visually explain one iteration; each must project as
exactly one direct edge whose two local endpoints are region members. They do
not author new flow. They select existing direct recurrence relations for the
enclosure to represent instead of drawing long feedback wires; the canonical
relation and its provenance remain available to inspectors and question
context.

Region IDs and member IDs are unique. Multiple regions must be disjoint or
strictly nested; partially overlapping and identical member sets are rejected.
The only current region kind is `repeat`. Add another typed kind only when it
has stable semantics rather than using regions as arbitrary drawing layers.

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

Label-aware gutters start with the authored base gap, run one preliminary
orthogonal-route pass, and add only the measured text deficit plus a compact
safety margin. Horizontal room already supplied by node widths, track slack,
and routing counts toward the requirement, so a small context value does not
stretch every row. Ordinary edge labels appear when their measured text fits
the available segment; contracted and conditioning labels remain visible
because their remaining clearance participates in the bounded second pass.
Long derived conditioning badges wrap into two balanced lines before they are
allowed to widen a shared column boundary.

At paint time, an edge label and its conditioning badges form one measured
annotation block. The renderer tries clear interior route segments first,
then other horizontal or vertical segments, and rejects positions that touch
a node or an already placed annotation. Horizontal rails host the block above
or below; vertical rails host it to either side. This keeps dense fan-outs
legible without view-specific pixel offsets.

Use `grid.row_sizing: content` only when a board has deliberately aligned
vertical streams whose dense annotations need measured breathing room. The
renderer measures the tallest node in every authored row and starts each
boundary at `grid.row_gap`. For a labeled, same-column edge between adjacent
rows, only that boundary grows by the remaining height needed for the label
and its derived conditioning badge plus compact safety padding. Unrelated row
boundaries retain their authored gap; non-adjacent and unlabelled edges do not
stretch the board. Typed representation lanes remain bound to their authored
row when content-sized row tracks are compiled.

`grid.min_col`, `grid.col_gap`, and `grid.row_gap` tune dense boards
generically. Module pixel positions and architecture-specific ranks must not
be hardcoded in renderer JavaScript.

New boards and opt-in existing-board reflows use the deterministic
`semantic_flow_v1` authoring policy in `protocol/semantic-layout.md`. The
compiler writes ordinary `col`/`row` ranks: primary computation occupies the
middle band, information flow advances left to right, context values sit above
the median of their consumers, and loop-carried values sit below. These ranks
remain editable presentation source; the policy does not override a later
curated layout.

ELK remains an experimental layout implementation behind `?layout=elk`; it is
not a separate authoring or audience mode.

## Optional Lanes

The canvas has no default lane ontology. A board may add a plain horizontal
guide when a lightweight visual landmark clarifies that architecture:

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
between 0 and 100.

When a board intentionally aligns canonical representation families into
rows, use the typed representation variant instead of an ungrounded percentage
guide:

```yaml
lanes:
  - id: single_stream
    label: single representation
    kind: representation
    row: 2
    representation_refs:
      - representations.single_features
    glyph: single
  - id: pair_stream
    label: pair representation
    kind: representation
    row: 4
    representation_refs:
      - representations.pair_features
    glyph: pair
```

`row` is an authored grid rank, not a pixel coordinate. Each mapped
`representations.*` ref must exist, may belong to only one lane, and every
visible value-site occurrence of that representation sits on the declared
row. A board may declare at most one lane for each representation-family
glyph. The current lane glyphs are `single`, `pair`, `coordinates`, and
`frames`; they reuse the renderer's standard representation colors rather than
authoring arbitrary color values. A lane that maps neither a visible value
site nor a carried representation on any projected edge is invalid stale
presentation.

Representation lanes do not re-author edge semantics. Projected relation
`carries` remains the source of truth for which matching family flows along an
edge. The renderer may use that fact for edge hue and for a module's
unambiguous stream accent, while relation kind/tone continues to determine
dash semantics such as conditioning or skip flow. Mixed-family flow stays
visually mixed or neutral rather than being forced into one lane.

Omit `lanes` for the normal unbanded canvas. The old `scale_lanes` flag is
retired because it exposed a hardcoded renderer ontology.

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
- two axes whose trailing axis is feature-like (for example `N x 384`,
  `N x d`, or `N x output_fields`): `single`;
- other two-axis shapes, including an unclassified `N x 3`: `matrix`;
- three or more axes with equal first two dimensions: `pair`; and
- other three-or-more-axis shapes: `volume`.

Single-feature tracks use a thin line glyph and the single-representation
color. Pair features use a square glyph and a separate pair-representation
color, so `N x d` and `N x N x d_pair` remain visually distinct even when
both occur at token scale.

Shape rank does not establish geometric meaning. A reusable representation may
therefore declare one of two semantic geometry glyphs:

- `coordinates`: indexed entities each carry a Euclidean position; the glyph
  shows unconnected 3D points and a labeled axis triad;
- `frames`: indexed entities each carry an orientation and translation; the
  glyph shows repeated local axis triads.

Both retain their exact dimensions inside the illustration and use distinct
colors. Do not classify RGB channels, logits, noise, or displacement vectors
as coordinates merely because their shape ends in three.

Use `dictionary` when the value is a named mapping of heterogeneous tensors,
not one tensor with a shared rank. Its glyph shows key-to-tensor entries and
deliberately omits a single dimensions label; field-level shapes belong in
the representation's evidence-bearing `field_groups` table.

The full vocabulary is
`glyph: scalar|vector|single|matrix|pair|volume|dictionary|coordinates|frames`. Put a
reusable semantic classification on the canonical architecture
representation. A view-node override is reserved for a genuinely
occurrence-specific presentation or a shape that parses incorrectly.
Pseudocode symbols provide preferred paper notation through
`architecture_ref`; the renderer falls back to the node label and
representation ID.

When a view needs occurrence-specific mathematical notation, author
`notation` as TeX. Multi-token subscripts use braces (`x_{t-10}`,
`s_{i+1}`), because parentheses do not group a TeX subscript. Compact
non-mathematical notation such as `.pdb` remains plain text.

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
that avoid node boxes. When two box faces share a clear horizontal or vertical
corridor, that direct facing-port route is authoritative; the general router
must not replace it with an outside U-turn.

Cycle-closing `state_update` edges that regress against the left-to-right flow
are inferred as feedback and allocated to non-overlapping bottom rails.
Disjoint feedback spans may reuse a rail. Forward state writes stay in the main
flow, and an explicit route hint always takes precedence over inference.

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
