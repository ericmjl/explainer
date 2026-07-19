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
   Standard-block v0.2 is compiled through a separate component path:
   ordinary boards still receive only projected canonical relations, while a
   `kind: standard_block_instance` board receives instance-scoped template
   nodes and step edges. Bound port edges preserve canonical `relation_path`;
   other internal edges declare `grounding: standard_block_template`.
7. **Comparison sources**: `comparisons/*.yaml`, registered only through
   `comparisons/index.yaml`, align stable facts from two existing subject
   boards. They own the comparative question, groups, mappings, findings, and
   evidence, but never copy either board scene or architecture fact.
8. **Manifest builder**: `renderer/architecture/build-manifest.rb` compiles the
   registered YAML source sets into `renderer/architecture/manifest-<id>.js`
   files plus `manifest-index.js`, including relation-derived interfaces,
   top-down decomposition coverage, and the independently versioned compiled
   `comparisonIndex`. It first runs the same strict source validation used by
   `scripts/lint_sources.rb`.
9. **Browser renderer**: `renderer/architecture/renderer.js` renders boards,
   semantic navigation, audience explanation panels, MathJax equations,
   pan/zoom controls, source links, and an optional second comparison board.

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

Registered comparisons form a parallel, read-only lens over those compiled
subjects:

```text
comparison-registry-v0.1 + architecture-comparison-v0.1
                          ↓
strict schema + subject/fact/evidence validation
                          ↓
architecture-comparison-compiler-v0.1
                          ↓
comparisonIndex metadata + the two existing manifest-owned board scenes
                          ↓
paired browser board surfaces
```

The comparison compiler resolves instance-scoped facts against the exact
compiled standard-block boards that the browser loads. It emits highlight
metadata and findings, not a third graph and not a copied scene.

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
- render generic standard-block diagrams when enough slot information exists;
- load a registered comparison counterpart lazily, render it below the current
  board, and decorate both sides from compiler-resolved alignment metadata;
- keep the two board viewports independent while sharing one inspector and at
  most one selected side, and namespace SVG resources by surface;
- expose comparison open, close, swap, fit-both, and compact-screen side
  switching as generic interaction behavior.

The browser renderer should not:

- encode a specific architecture's module order;
- target architecture or board IDs from generic renderer CSS;
- require paper-specific module names;
- hardcode evidence claims that belong in YAML;
- infer comparative correspondence from labels, positions, or visual
  similarity, or draw cross-canvas wires that imply unauthored relations;
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
- a source-backed compare action on boards named by a registered comparison,
  opening the second board below the first without replacing the primary
  semantic location;
- independent pan, wheel/two-finger-scroll zoom, reset, and fit controls for
  the two board surfaces, plus fit-both, swap, close, and a compact-screen A/B
  switch;
- numbered alignment badges on both surfaces, colored by relationship kind,
  while single/pair/coordinate/frame colors retain their existing payload
  meaning and no cross-canvas relation wires are invented;
- one shared inspector selection across A and B: selecting on one side clears
  the other side, and only board-local node selections enter the URL;
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

### Shareable Comparison Links

A paired view extends the primary location rather than replacing it:

```text
?arch=genie3
&board=genie3_reduced_pair_attention_internals
&compare_arch=genie3
&compare_board=genie3_ipa_internals
&compare_node=point_distance_logits
```

`compare_arch` activates the lower B surface, `compare_board` names its stable
board, and optional `compare_node` selects a local occurrence there. The
primary `arch` / `board` / `node` parameters keep their existing meaning. A
canonical location contains at most one of `node` and `compare_node`, because
the workspace has one inspector selection. Pan, zoom, hover, and compact-screen
A/B visibility remain transient on both surfaces.

Comparison URL state is resolved independently. An unknown comparison source
set removes only the B surface and preserves A. An unknown `compare_board`
falls back to the counterpart root and discards only `compare_node`; an unknown
`compare_node` keeps its requested comparison board open. Opening, closing,
swapping, or navigating a board creates a history entry, while selecting a
node replaces the current entry. Back and Forward reconstruct both locations.
All writes preserve unrelated query parameters.

The **Compare** action appears only when the current source set and board match
one subject of a registered compiled comparison. The counterpart board scene
still comes from its architecture manifest. The compiled comparison contributes
only the question, group summaries, evidence-backed fact alignments, findings,
and stable highlight identities.

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
- further reusable-block composition beyond the implemented v0.2 instance
  scenes;
- `board.layers` for optional overlays;
- comparison projections beyond the implemented paired-board workspace, such
  as compact multi-model tables derived from the same registered alignments;
- graph views derived from typed `source_ref` links to the central bibliography.

A future recorded-inference viewer should load trace sidecars outside the
architecture manifest and join them through `value_sites.*` and execution-loop
IDs. It should reuse canonical selection and appear as a deliberate trace dock,
not add per-node trace logic to the renderer core.
