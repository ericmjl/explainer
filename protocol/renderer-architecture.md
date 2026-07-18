# Renderer Architecture v0.4

Status: **current implemented compiler/renderer boundary**.

This document describes the generic renderer stack for semantic architecture
explainers. The renderer should stay domain-neutral: source files decide what
a node means, while JavaScript handles layout mechanics, interaction, and
reusable presentation rules.

## Layers

1. **Bibliography source**: `references/bibliography.yaml` owns canonical
   paper, code, documentation, specification, and local-source metadata.
2. **Architecture source**: `architectures/*.yaml` defines modules,
   representations, value sites, hierarchy/decomposition, relations, evidence,
   state semantics, conditioning, and scale transitions.
3. **View source**: `views/*.view.yaml` defines boards, node placement,
   compactness, drilldown, visibility decisions, and edge presentation
   overrides. Normal edges are not authored here.
4. **Semantic layout compiler**: `lib/architecture_semantic_layout.rb`
   optionally derives durable grid ranks from a projected board using the
   versioned policy in `protocol/semantic-layout.md`. New-board scaffolding and
   reviewed `layout_board` edits share this compiler.
5. **Pseudocode source**: `pseudocode/*.yaml` defines line-level traces and
   source references.
6. **Standard blocks**: `standard_blocks/*.yaml` defines reusable visual and
   mathematical motifs.
7. **Manifest builder**: `renderer/architecture/build-manifest.rb` compiles the
   registered YAML source sets into `renderer/architecture/manifest-<id>.js`
   files plus `manifest-index.js`, including relation-derived interfaces and
   top-down decomposition coverage. It first runs the same strict source
   validation used by `scripts/lint_sources.rb`.
8. **Browser renderer**: `renderer/architecture/renderer.js` renders boards,
   semantic navigation, audience explanation panels, MathJax equations,
   pan/zoom controls, and source links.

The builder compiles current architecture-v0.4 / visualization-v0.4 sources
into architecture-manifest-v0.4 projected boards. A narrow legacy path still
accepts old architecture `edges` and v0.2 `relations` and normalizes them into
architecture-manifest-v0.2. Manifests are generated internal representations,
not second durable source contracts.

## Semantic Projector

`protocol/architecture-projection-model.md` defines the implemented semantic
layer between sources and browser rendering.

The current pipeline is implemented in Ruby through shared build/lint
components:

```text
architecture-v0.4 + visualization-v0.4
                  ↓
strict YAML + executable schema + evidence validation
                  ↓
ownership validation + decomposition coverage compilation
                  ↓
semantic board projector
                  ↓
deterministic architecture-manifest-v0.4 projected boards
                  ↓
browser layout and geometric wire router
```

The projector derives normal board edges from canonical architecture
relations, remaps hidden descendants to visible aggregate modules, contracts
explicitly elided paths, preserve ordered relation provenance, and reject
ambiguous or incomplete projections. The browser will continue to own node
measurement, responsive track sizing, wire routing, and interaction. Authored
or compiled `col`/`row` ranks remain view source; the browser will not invent
module order, interpret semantic hierarchy, or invent architecture flow.

Derived visualization-v0.4 boards normalize to one projected-board manifest
shape. The renderer retains a narrow visualization-v0.3 adapter for old
manifests and records `projectionMode: authored | derived` without interpreting
source schemas in its drawing code.

The manifest retains canonical architecture fields needed by consumers and
adds derived indexes, projected edges, generator identity, and SHA-256 input
digests. It is not a YAML round-trip format: paths are web-normalized and
renderer-specific indexes are materialized. `build-manifest.rb --check`
compiles in memory and rejects stale committed manifests.

## Renderer Responsibilities

The browser renderer may:

- draw compiled nodes and projected edges while preserving complete canonical
  `relation_path` provenance;
- translate authored semantic column ranks into measured content-width tracks
  when a board requests content sizing, without changing the YAML order;
- classify cycle-closing backward `state_update` edges from compiled
  provenance and allocate measured bottom feedback rails, while respecting
  explicit route hints;
- choose visual styling from generic fields such as `scale`, `prominence`,
  `treatment`, and `density`;
- derive payload edge hues and unambiguous module accents from projected
  relation `carries` and canonical representation glyphs, while relation
  kind/tone continues to control dash semantics;
- keep board stacking explicit: guide and representation-lane backgrounds sit
  below wires, wires and their labels sit below cards, and board chrome plus
  transient interaction surfaces sit above the transformed board;
- reserve a stable straight landing before every bent arrowhead, independent
  of selection stroke width, and preserve that landing while separating
  parallel rails or consuming experimental layout paths;
- show focus-panel summaries, evidence, pseudocode lines, and standard-block
  math;
- trace node connectivity on hover or keyboard focus without a duplicate
  popup, and show transient edge explanations on hover or focus;
- expose full node and edge inspection through activation;
- derive disposable question handoff packets from typed node refs, projected
  relation paths, and evidence without introducing a second fact owner;
- escape source-authored prose before HTML insertion and reject active-content
  link schemes;
- expose one canonical audience interface rather than separate legacy, edit,
  or tuning modes;
- render generic standard-block diagrams when enough slot information exists.

The browser renderer should not:

- encode a specific architecture's module order;
- target architecture or board IDs from generic renderer CSS;
- require paper-specific module names;
- hardcode evidence claims that belong in YAML;
- infer architecture facts from visual position.

The DOM-free recurrence classification and rail allocation live in
`renderer/architecture/semantic-routing.mjs`. They consume projected edge
kind/provenance and measured boxes; they do not alter the persisted layout or
canonical relation graph.

## Current Prototype

The current prototype is `renderer/architecture/`. It reads every source set
registered in `architectures/index.yaml`.

The prototype supports:

- one canonical audience workspace with a compact app bar, one board
  breadcrumb, a canvas-first main area, and a stable inspector;
- render-first semantic navigation with one short arrival transition rather
  than serial exit/arrival delays;
- shareable static-site locations for the current board and optional selected
  node, with browser Back and Forward following semantic navigation;
- one canonical selection state shared by nodes and projected arrows; node
  hover or focus traces nearby connectivity without a popup, while edge peeks
  remain local canvas tooltips and never replace selected details;
- independent select and drill controls on expandable modules, so a major
  component can be inspected or handed to a conversation without navigating;
- a model map rendered as a dedicated pure-SVG thumbnail of the selected
  board: it preserves board geometry, tensor/module/operation silhouettes,
  wire tones, and carried-representation hues while deliberately omitting card
  text and internal UI;
- lazy model-map construction while it is collapsed or responsively hidden;
- strong current-region emphasis over a subdued root or parent snapshot, so
  the map answers location rather than repeating the board explanation;
- full-width board layout;
- an unbanded canvas by default, with optional plain guides or typed
  row-aligned representation lanes authored explicitly per board in view YAML;
- uniform authoring grids plus opt-in content-measured column tracks and
  annotation-aware row boundaries;
- orthogonal automatic wiring with reusable explicit outer lanes;
- pointer-anchored zoom from vertical two-finger scroll or mouse-wheel input,
  drag-to-pan, and explicit zoom controls, with raw gesture updates coalesced
  to one viewport write per animation frame;
- hoverable edge ports;
- keyboard-operable tensor nodes and edge inspectors, with wire roles
  distinguished by dash pattern as well as color;
- a desktop side inspector and compact responsive inspector that do not
  compete with board navigation;
- bibliography-resolved paper and code citations with typed roles and local
  evidence locators;
- compact and micro node treatments;
- MathJax rendering for standard-block equations.

### Shareable Board and Component Links

The canonical component-link form is:

```text
?arch=genie3&board=latent_transformer&node=pair_biased_attention_update
```

`arch` selects the registered source set, `board` selects one stable semantic
board ID, and optional `node` selects a board-local occurrence in the stable
inspector. The occurrence ID is intentional: a canonical module can appear
more than once, while `board` plus `node` identifies the exact rendered card.
An architecture-only URL such as `?arch=genie3` remains valid and opens that
source set's root board.

The persistent **Copy link** action in the board breadcrumb copies the current
canonical location. Opening a detail board or following a breadcrumb creates a
browser-history entry. Selecting or clearing a node updates the current entry
instead, so the address stays shareable without making every inspector click a
separate Back-button stop. Browser Back and Forward restore the board,
breadcrumb, highlight, and inspector. An unknown architecture opens the default
registered source set with an explicit notice and a corrected URL. An unknown
board falls back to the root; an unknown node keeps the requested board open at
its overview. Geometric zoom, pan, hover, transient arrow previews, and arrow
selection do not belong in the URL.

These links use only query parameters on the existing renderer HTML path, so
they work when the explainer is published as a static site. They do not require
a routing service or duplicate any architecture fact outside the manifest.

### Question Handoff Context

The audience view can hand a selected node or arrow to an external
conversation without embedding an LLM or API credential. Right-click an
element, use `Shift+F10` / the keyboard Menu key, or select it and open the
`Ask / copy` action in the detail header. The menu can copy either a compact reference
or an `architecture-question-context-v0.1` packet.

The packet is generated on demand from the compiled manifest and is not a
durable authoring source. It includes the source set and input digests, current
board and semantic breadcrumb, the selected occurrence and canonical typed
ref, its reusable shape and semantic glyph when applicable, its visible
one-hop neighborhood, ordered relation provenance, evidence statuses and
locators, and related claim/pseudocode/conditioning/state IDs.
For a contracted arrow, the complete ordered `relation_path` and hidden refs
are retained; the renderer must not describe it as one invented direct flow.
An old edge without canonical provenance is marked `ungrounded`.

Clipboard denial falls back to a selectable text dialog. The browser does not
send source content to a service: the user chooses where to paste the packet.
The packet improves conversational grounding but does not prove the source
claims or replace inspection of the canonical YAML and cited evidence.

Architecture selection through `?arch=<id>` changes the source set inside
this interface. `?layout=elk` is retained only as an experimental layout path;
it is not a distinct audience or authoring view. Durable authoring happens in
the source files and renderer rules, followed by manifest regeneration.

The renderer emits a disposable `architecture-selection-change` event with
the source set and stable node occurrence/ref or ordered relation path. The
local review workspace consumes that projection while resolving editable
facts from canonical sources. The event is not a second fact owner and does
not make the audience renderer editable.

## Extension Points

Prefer adding source-language fields before adding special-case renderer code.
Potential generic extensions below are design candidates, not currently
supported authoring fields:

- `node.icon` for stable visual symbols;
- `edge.geometry` for explicit routing hints;
- `standard_block.visual_template` variants;
- `board.layers` for optional overlays;
- `comparison_refs` for multi-architecture tables;
- graph views derived from typed `source_ref` links to the central bibliography.

A future recorded-inference viewer should load trace sidecars outside the
architecture manifest and join them through `value_sites.*` and execution-loop
IDs. It should reuse canonical selection and appear as a deliberate trace dock,
not add per-node trace logic to the renderer core.
