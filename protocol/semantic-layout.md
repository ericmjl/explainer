# Semantic Layout Policy v1

Status: **current implemented authoring and routing policy**.

This document defines the deterministic layout heuristics used to turn a
projected architecture graph into an editable visualization-v0.4 grid. It does
not infer architecture, create nodes, or replace the curated board boundary.
The architecture and view still decide what is visible; layout decides where
those visible occurrences begin.

The implemented policy identifier is `semantic_flow_v1`.

## Design Goal

An explainer board should read as a computational story:

- substantial computation forms a stable middle spine;
- ordinary information flow advances left to right;
- task-native inputs and outputs anchor the left and right boundaries;
- read-only conditioning and index context sits above its consumers;
- loop-carried state sits below the computation it re-enters; and
- feedback uses bottom rails instead of cutting through the main flow.

Distance is meaningful only when it communicates scope, lifetime, reuse, or a
task boundary. A context value should otherwise stay near the median position
of its visible consumers.

## Authoring-Time Compiler

`lib/architecture_semantic_layout.rb` consumes the exact occurrence nodes and
projected edges of one board. Working after projection is important: hierarchy
collapse, explicit elision, and multiple local occurrences have already been
resolved, and every edge retains canonical `kind` and ordered
`relation_path` provenance.

The compiler applies these deterministic steps:

1. Classify a value as north/context when all of its visible uses are
   `conditioning`, `control`, or `index_flow`. Mixed-use values remain in the
   main flow.
2. Add likely-forward edges in semantic priority order. Ordinary data flow and
   computation-to-value state writes are preferred over value-to-computation
   re-entry.
3. Mark an edge as feedback when adding it would close a cycle. Remove those
   edges from the forward rank constraints.
4. Bridge a produced context value for ranking, so its producer still precedes
   every computation it conditions, then assign the remaining acyclic graph
   longest-path columns from left to right.
5. Anchor task boundary inputs at the first column and outputs at the last.
6. Move context values above the median column of their visible consumers.
7. Place primary block modules in a vertically centered main band, ordinary
   values around them, and feedback-source values in a symmetric bottom band.
8. Resolve every tie using stable typed refs and occurrence IDs. No randomness
   or architecture-specific names participate.

These context/main/feedback bands are internal placement classes, not persisted
visualization `lanes`. Typed representation lanes are an editorial row
contract and must be preserved explicitly rather than inferred from these
bands.

The compiler returns integer `col`/`row` ranks and a content-sized grid. Those
values remain normal durable view YAML and can be reviewed or adjusted.

New boards use the policy through `ArchitectureViewScaffold`. Existing boards
can opt into a reviewed reflow with architecture-edit-v0.2:

```yaml
- op: layout_board
  board_id: denoiser_forward
  policy: semantic_flow_v1
```

An optional positive `columns` field caps/reflows the natural ranks; a larger
value does not create empty columns. The edit
compiler preserves the board's nodes, prose, drilldowns, visibility decisions,
edge presentation, `min_col`, and `col_gap`; only the grid and node positions
change. Prepare/show/apply digest protection and full validation remain
mandatory.

The policy is a starting layout, not a new architectural truth. It is not a
global verifier failure when an editorially curated board differs from the
policy.

## Runtime Wire Policy

The browser measures the real card boxes after typography and responsive
sizing. It then:

- uses normal facing ports for forward flow;
- respects explicit `route_side` / `route_clearance` first and reserves those
  authored rails from overlapping inferred feedback;
- detects a cycle-closing, right-to-left `state_update` as feedback;
- interval-colors overlapping feedback spans into separate bottom rails; and
- lets disjoint feedback spans reuse the same rail.

This classification deliberately requires both recurrence and spatial
regression. A normal forward `state_update` is not feedback. Runtime routing
never changes canonical endpoints or relation semantics.

## Override Boundary

The generic policy should handle normal boards. An author may still use:

- explicit `col`/`row` after a generated reflow for a durable editorial choice;
- `grid.min_col` and `grid.col_gap` for board-wide density; and
- `route_side` / `route_clearance` for an exceptional deliberate outer rail.

Raw pixel coordinates and authored bend points remain outside the language.
Explicit route hints always win over inferred routing.

## Quality Order

Future policy revisions should optimize in this order:

1. no overlapping nodes or invalid grid cells;
2. preserve explicit architectural direction and board boundaries;
3. keep the heavy computational spine coherent;
4. keep conditioning north and recurrence south;
5. reduce edge/node intersections and crossings;
6. reduce weighted edge length and unnecessary bends; and
7. minimize movement from an already reviewed layout.

Policy changes require a new identifier rather than silently changing the
meaning of `semantic_flow_v1`.
