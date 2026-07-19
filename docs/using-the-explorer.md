# Using the Architecture Explorer

The explorer is one continuous audience interface: a semantic-zoom board on
the left and a combined details-and-pseudocode inspector on the right.

## Navigate the architecture

Select a module to inspect its explanation, evidence, and pseudocode. A
magnifying-glass action opens a child board when that module has a deeper
view. The breadcrumb returns to parent boards.

Shareable URLs preserve the architecture, board, and optional selected node:

```text
?arch=<architecture-id>&board=<board-id>&node=<node-id>
```

The breadcrumb's **Copy link** action copies this canonical location. Browser
Back and Forward restore semantic navigation. Transient pan, zoom, and hover
state do not enter the URL.

## Read details and pseudocode together

The inspector presents **Details** followed by **Pseudocode** in one scrolling
view. High-level traces may move through program, stage, loop, and module
scopes. Reusable block views use the selected block variant's own internal
trace.

Hover or keyboard-focus a bound variable or call to highlight its visible
producer, consumer, and arrows; unrelated components fade. Hovering a board
node marks the corresponding code tokens. Clicking a token pins the existing
board selection. These bindings are compiled from canonical fact references,
not guessed from text in the browser.

Code locations are described as **implementation references** in the audience
interface. The declarative sources retain the canonical provenance role
`implementation_evidence` for compatibility with the evidence contract.

## Inspect representations and references

Single, pair, coordinate, and frame flows receive distinct colors derived
from the canonical representation carried by each relation. Boards can align
these families into rows without re-authoring their semantics.

Heterogeneous named-tensor mappings use a dictionary glyph rather than a
single tensor shape. Selecting one opens an evidence-backed field table with
field families, axes, shapes, and task behavior. Cited reference figures open
in a dedicated zoomable viewer outside the panning graph.

## Ask a follow-up question

Right-click an element, use the keyboard context-menu shortcut, or select it
and open the inspector's `...` menu:

- **Copy reference** copies a short typed locator.
- **Copy question context** copies a versioned packet containing the board,
  surrounding arrows, ordered relation paths, and evidence.

This is a local clipboard handoff for a conversation, not an embedded chat
service.

## Compare architecture components

A curated comparison opens a second board below the primary one. It aligns
stable facts from two existing subjects and highlights whether they are
equivalent, analogous, changed, or present on only one side. It does not
create a third architecture or copy either board scene.

Comparison state has its own shareable URL parameters:

```text
&compare_arch=<architecture-id>&compare_board=<board-id>&compare_node=<node-id>
```

Only one board side is selected at a time.

## Pan, zoom, and use touch

- Drag an empty board area to pan.
- Use a mouse wheel or two-finger trackpad scroll to zoom around the pointer.
- On a touch screen, pinch with two fingers to zoom and move both fingers to
  pan at the same time. A pinch can begin over a card without opening it.

The Atlas, Ramith paper, and Dark themes are local presentation preferences.
Theme choice, pan, zoom, and hover state never change a shared architecture
URL.
