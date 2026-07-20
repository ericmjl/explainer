# Architecture-Derived Board Projection v0.1

Status: **current implemented semantic-projection contract**.

Current contracts:

- `architecture-v0.5`
- `visualization-v0.4`
- `architecture-manifest-v0.5`

All registered source sets use architecture-v0.5 and visualization-v0.4. The
shared Ruby projector is called by both the manifest builder and linter, and
the audience renderer consumes architecture-manifest-v0.5 projected boards.
The v0.2/v0.3 authored-board adapter remains only for compatibility with old
manifests.

## Decision Summary

Architecture source is the canonical semantic graph. A board is a curated
window onto one branch of that graph; it does not re-declare normal
architectural connections.

```text
architecture source
  modules + hierarchy + value sites + relations + evidence
                         |
                         v
board projection request
  subject + expansion depth + visible occurrences + visibility overrides
                         |
                         v
semantic projector (build/lint time)
  scope + collapse + path contraction + provenance + validation
                         |
                         v
projected board graph
  visible occurrences + derived edges + ordered relation paths
                         |
                         v
browser renderer
  measured tracks + wire geometry + interaction
```

The first implementation uses these constraints deliberately:

- Boards list an exact curated set of visible occurrences.
- Module containment is a strict, acyclic tree rooted at `architecture`.
- Board depth is relative to its `subject_ref`.
- Normal board edges are always generated from canonical relation paths.
- Hidden paths fail closed when contraction is ambiguous.
- Semantic view-only flow edges are removed. Presentation annotations use a
  separate non-flow vocabulary.
- Projection happens before the browser renderer.

## Ownership

| Layer | Owns |
| --- | --- |
| Bibliography | Canonical identity and metadata for papers, code, docs, specs, and local sources |
| Architecture | Canonical objects, hierarchy, value identity, relations, semantics, evidence and typed citation roles |
| Board/view | Subject, relative depth, visible occurrences, layout, navigation, elide/exclude choices, presentation overrides |
| Projector | Visible graph derivation, collapse, contraction, boundary preservation, provenance, validation |
| Semantic layout compiler | Optional projected-graph-to-grid placement under a versioned policy |
| Renderer | Node presentation, measured track sizing, wire routing, pan/zoom, inspector and navigation interaction |

A board may choose whether a relation is visible through its node selection,
but it may not create or redefine an architectural relation.

Architecture decomposition coverage is compiled separately from board
projection. Each scope declares whether its derived immediate child set is
complete, partial, terminal, or opaque; see
`protocol/architecture-coverage.md`. Projector classifications measure board
accounting over declared objects, not completeness relative to an unknown real
system.

## Architecture-v0.4 Semantic Graph

Architecture-v0.4 retains the v0.3 hierarchy, value-site, relation, and board
projection model and adds enforceable ownership rules within the architecture
source. See `protocol/fact-ownership.md`.

### Typed References

Cross-object references are type-qualified:

```yaml
modules.ddpm_sampler
value_sites.latent_before_step
representations.diffusion_latent
relations.dit_prediction_enters_reverse_step
```

Type-qualified references prevent a module and a value from becoming
ambiguous when their local IDs happen to match.

### Strict Module Hierarchy

Every module has one canonical parent. The special root `architecture` has
depth zero. The computed number is called `hierarchy_depth`; it is never
separately authored and does not conflict with the existing module `depth`
object used for block/head configuration.

```yaml
modules:
  - id: ddpm_sampler
    parent_ref: architecture

  - id: dit_denoiser
    parent_ref: modules.ddpm_sampler

  - id: dit_backbone
    parent_ref: modules.dit_denoiser

  - id: self_attention
    parent_ref: modules.dit_backbone
```

This example produces depths zero through four as follows:

```text
architecture       depth 0
ddpm_sampler       depth 1
dit_denoiser       depth 2
dit_backbone       depth 3
self_attention     depth 4
```

Depth is not a global board category. A board first selects a subject branch,
then chooses how many levels below that subject it may expose. A depth-four
node in another branch is never eligible merely because one board expands to
depth four.

Shared reusable mechanisms belong in `standard_blocks`; their concrete use in
the architecture remains a module occurrence with one parent plus an optional
typed `block_instances` binding. Standard-block internal flows are compiled in
a separate reusable-detail path and never enter canonical architecture
projection. Shared children and multiple parents are deferred until there is
an architecture that requires them.

### Representation Types and Value Sites

Architecture-v0.2 representations often conflate tensor type, semantic state,
and temporal occurrence. Architecture-v0.4 retains v0.3's separation of
reusable representation descriptions from canonical value sites.

```yaml
representations:
  - id: diffusion_latent
    scale: spatial
    shape: "B x 4 x I x I"
    semantic_role: latent state in the reverse diffusion process
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol

value_sites:
  - id: latent_before_step
    representation_ref: representations.diffusion_latent
    scope_ref: modules.ddpm_sampler
    role: state_read

  - id: latent_after_step
    representation_ref: representations.diffusion_latent
    scope_ref: modules.ddpm_sampler
    role: state_write
```

This makes `x_t` and `x_(t-1)` distinct architectural values while allowing
them to share shape and semantic type. External task inputs and outputs use an
explicit boundary role:

```yaml
value_sites:
  - id: initial_noise
    representation_ref: representations.diffusion_latent
    scope_ref: architecture
    boundary: input

  - id: generated_image
    representation_ref: representations.rgb_image
    scope_ref: architecture
    boundary: output
```

Legacy migration may normalize old representation objects into value sites,
but repeated or mutable states must become distinct canonical sites before
automatic occurrence binding is considered complete.

Value sites are scoped but are not hierarchy nodes and do not have an
independent `hierarchy_depth`. For board eligibility, a value site inherits the
relative depth of its `scope_ref`. A value site is in a board's accounting set
when either:

- its scope is the subject or a descendant within the expansion horizon and it
  participates in an in-scope relation; or
- it is an endpoint of a relation crossing the subject boundary.

An unselected value site may map to a visible or explicitly elided aggregate
module containing its scope. Otherwise it must be visible, explicitly elided
when it is a true pass-through value, or explicitly excluded. This is what lets
the projector distinguish a deliberately hidden intermediate tensor from an
accidentally missing input or output.

### Canonical Relations

Relations connect typed semantic endpoints and carry representation
references rather than prose.

```yaml
relations:
  - id: latent_enters_dit_denoiser
    from: value_sites.latent_before_step
    to: modules.dit_denoiser
    kind: data_flow
    carries:
      - representations.diffusion_latent
    operation: denoise_latent
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol

  - id: reverse_step_produces_next_latent
    from: modules.reverse_diffusion_step
    to: value_sites.latent_after_step
    kind: state_update
    carries:
      - representations.diffusion_latent
    operation: update_sampling_state
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol
```

Relations own:

- stable identity;
- semantic endpoints;
- flow kind;
- carried representation types;
- operation or update meaning;
- evidence; and
- an optional reusable summary.

Board occurrences bind only to `modules.*` and `value_sites.*`. A
`representations.*` object is a reusable type, not a value occurrence, and a
`relations.*` object is flow provenance, not a node.

Module inputs/outputs and state producer/consumer lists should be derived from
relations during normalization rather than authored as independent facts.
Conditioning, scale-transition, and execution entries reference relations when
they add specialized semantics.

### Abstract Relations Are Deferred

The first implementation authors the finest meaningful semantic relations and
derives abstract edges only through hierarchy projection and path contraction.
It does not support separately authored summary relations. Correct suppression
under partial expansion and branching refinement requires a refinement graph,
not a flat list of relation IDs, and is deferred until a real architecture
cannot be expressed through contraction or a visible aggregate module.

## Visualization-v0.4 Board Request

Boards name one semantic subject and an exact set of visible occurrences. They
do not contain a normal `edges` list.

```yaml
schema_version: visualization-v0.4
id: dit_semantic_zoom
root_board: generation_overview

boards:
  - id: sampling_loop
    title: DDPM Sampling Loop
    subject_ref: modules.ddpm_sampler
    expansion_depth: 1

    nodes:
      - id: current_latent
        ref: value_sites.latent_before_step
        col: 1
        row: 3

      - id: dit_denoiser
        ref: modules.dit_denoiser
        board_ref: dit_denoiser_detail
        col: 3
        row: 3

      - id: reverse_step
        ref: modules.reverse_diffusion_step
        col: 5
        row: 3

      - id: next_latent
        ref: value_sites.latent_after_step
        col: 7
        row: 3

    exclude:
      - ref: modules.training_loss
        reason: This board explains inference sampling.

    edge_overrides:
      - match:
          relation_ref: relations.latent_enters_dit_denoiser
        label: current x_t
        route_side: bottom
```

### Subject and Relative Expansion Depth

`subject_ref` defines the only hierarchy branch the board may expand.
`expansion_depth` is relative to the subject:

```text
eligible module depth <= depth(subject_ref) + expansion_depth
```

The subject is the board's frame and is not normally drawn as a node on its
own detail board. A board may show subject-boundary values and modules outside
the subject only when canonical relations cross that boundary.

`subject_ref: architecture` is reserved for the root task-boundary board. All
other subjects must reference a canonical module (`modules.*`); value sites
and representation types cannot own a hierarchy branch.

The exact `nodes` list remains curated. Expansion depth is a validation and
abstraction boundary, not an instruction to dump every eligible node onto the
board.

### Board Occurrences

A board node is a visible occurrence bound to one canonical object. Board IDs
are local and may be chosen for readable layout or temporal notation.

```yaml
nodes:
  - id: current_latent
    ref: value_sites.latent_before_step
  - id: next_latent
    ref: value_sites.latent_after_step
```

The same canonical object may appear more than once for presentation. When a
canonical endpoint has exactly one visible occurrence, binding is automatic.
When it has multiple occurrences, the board supplies a separate semantic
occurrence binding before edge generation:

```yaml
occurrence_bindings:
  - match:
      relation_ref: relations.cached_state_reenters_block
    from_occurrence: cache_after_update
    to_occurrence: cache_before_next_step
```

The binding chooses visible occurrences; it does not redefine semantic
endpoints. Occurrence bindings are part of projection semantics, not
presentation overrides. `match` contains exactly one of `relation_ref` for a
direct/boundary edge or ordered `relation_path` for a contracted edge. This is
the same match union used by edge overrides, but occurrence binding happens
before presentation overrides.

### Visibility Operations

The model has four distinct visibility meanings:

| Operation | Meaning | Flow behavior |
| --- | --- | --- |
| Visible | Draw a canonical occurrence | Direct/projected edges connect normally |
| Collapse | Represent a hidden descendant subtree by a visible ancestor module | Internal edges disappear; boundary edges remap to the ancestor |
| Elide | Hide a specific pass-through object or path on this board | Preserve an inspectable contracted edge |
| Exclude | Declare content out of scope for this board | Remove the object and its incident flow; never contract through it |

Selecting a module occurrence implicitly collapses its unselected descendants.
There is no separate `collapse:` directive in the first implementation: the
visible aggregate module is the collapse declaration. Its unselected
descendants map to the nearest, most-specific visible ancestor module.

`elide` is an explicit editorial choice and may be applied on a root board or
any child board. Every exclusion requires a reason. Elided objects exist as
transient projection-frontier objects until their paths are contracted; they
are not visible board nodes.

Absence never silently means exclusion or elision. Every relation-participating
object in the subject branch within the permitted expansion horizon must be
one of:

- a visible occurrence;
- represented behind a visible aggregate ancestor or an explicitly elided
  aggregate module;
- explicitly elided; or
- explicitly excluded.

Objects deeper than the expansion horizon may be classified as depth-hidden,
but a depth-hidden object that affects a visible or subject-boundary path must
still map to an aggregate frontier module. It is never silently traversed to
manufacture a wire.

### Presentation Overrides

`node_overrides` and `edge_overrides` may alter presentation only:

- label or mathematical notation;
- prominence/emphasis;
- compact visual treatment;
- board navigation;
- route side/clearance; and
- audience explanation appropriate to this board.

An override cannot change a canonical endpoint, kind, carried representation,
operation, or evidence. A direct-edge override normally matches one
`relation_ref`. A contracted-edge override matches an ordered `relation_path`:

```yaml
edge_overrides:
  - match:
      relation_path:
        - relations.final_latent_enters_inverse_scale
        - relations.inverse_scale_produces_decode_latent
        - relations.decode_latent_enters_vae
    label: decoder latent path
```

Zero or multiple matches are lint errors.

### Annotations Are Not Flow

Visualization-v0.4 removes `view_only: true` for semantic flow. A board may
contain annotations or guides, but they use a separate vocabulary and cannot
participate in architectural projection or connect two architecture-backed
objects as if a data-flow relation existed.

Fine-grained flow must be grounded as architecture modules, value sites, and
relations before a board can present it. Pseudocode lines and standard-block
steps may ground attached detail or annotations, but they do not substitute for
canonical projected-flow endpoints and relations.

## Projection Algorithm

The semantic projector consumes the architecture graph and one board request.
It emits a normalized projected graph before browser rendering.

### 1. Resolve Scope

- Resolve the board's `subject_ref`.
- Compute the subject subtree and allowed relative depth.
- Add canonical relations crossing the subject boundary so inputs and outputs
  can be preserved.
- Reject selected nodes outside that closure unless they are explicit boundary
  occurrences.

### 2. Classify the Projection Frontier

Build a projection frontier containing:

- every visible board occurrence; and
- one transient frontier object for every explicit `elide` ref.

Account for every relation-participating module and value site in scope using
the visibility rules above. An unselected eligible object is not automatically
a pass-through. Fail if it is neither represented by an aggregate frontier
module nor explicitly elided/excluded. Deeper objects may be depth-hidden only
when they cannot affect a visible or subject-boundary path without first
mapping to an aggregate frontier module.

### 3. Apply Explicit Exclusions

- Excluding a module removes its complete descendant module subtree, every
  value site whose scope equals that module or lies in the subtree, and all
  incident relations. Equality counts as containment.
- Excluding a value site removes that site and its incident relations.
- Relations and representation types cannot be excluded directly in the first
  implementation; exclude their owning endpoint object or choose a narrower
  subject instead.
- Do not traverse or contract through excluded objects.
- Require a non-empty reason for every exclusion.
- Reject exclusion of an architecture-boundary input or output on the root
  board.

### 4. Map Collapsed Descendants

Map each unselected descendant module to its nearest, most-specific aggregate
frontier ancestor: either a visible module or a transient explicitly elided
module. Map an unselected value site to that representative when its scope
equals the aggregate module or is scoped to one of its descendants.
Architecture-boundary sites and explicitly visible, explicitly elided, or
explicitly excluded sites are exceptions and retain their own classification.
For every canonical relation, map both endpoints through this representative
function:

- if mapped endpoints differ, retain the boundary flow;
- if mapped endpoints are identical, suppress the relation as internal to the
  collapsed module;
- retain the original relation ID as provenance.

This quotient step may expose direct or boundary edges between frontier
objects. It does not traverse arbitrary omitted objects.

### 5. Contract Explicitly Elided Pass-Through Paths

Contract only paths through transient, explicitly elided frontier objects.
Start at a visible or aggregate representative and stop at the next visible or
aggregate representative.

- Stop at the first visible occurrence; do not compute arbitrary transitive
  closure.
- Preserve the ordered relation path and hidden object list.
- Never invent a wire without a non-empty canonical relation path.
- Keep parallel or semantically different paths separate.
- Do not merge data, conditioning, state, and control paths merely because
  their visible endpoints match.
- Never traverse a merely absent eligible object.

### 6. Bind Visible Occurrences

Bind canonical projected endpoints to board occurrence IDs. Unique occurrences
bind automatically. Repeated occurrences require an explicit binding and fail
closed when absent or ambiguous.

### 7. Apply Presentation Overrides

Match overrides against the generated direct relation or ordered relation path.
Apply only presentation fields. Reject zero-match, multi-match, or semantic
mutation attempts.

### 8. Validate Coverage

Every canonical relation crossing the subject boundary must result in:

- a visible projected edge;
- a path internal to a visible collapsed module; or
- an explicit exclusion with a reason.

This makes accidental omission detectable.

Also validate frontier accounting: every relation-participating module or
value site in the subject within the permitted expansion horizon is visible,
represented by an aggregate frontier module, explicitly elided, or explicitly
excluded. For `subject_ref: architecture`, every value site marked
`boundary: input` or `boundary: output` must have a visible occurrence. Root
boundary sources and sinks cannot be elided or excluded.

## Generated Projection Edge IR

Projected edges are generated manifest data and are never authored as durable
board facts.

```yaml
id: projection_sampling_loop_7f61
from: final_latent
to: vae_decoder
projection: contracted  # direct | boundary | contracted
origin: canonical
kind: data_flow
relation_path:
  - relations.final_latent_enters_inverse_scale
  - relations.inverse_scale_produces_decode_latent
  - relations.decode_latent_enters_vae
provenance_hops:
  - { relation_ref: relations.final_latent_enters_inverse_scale }
  - { relation_ref: relations.inverse_scale_produces_decode_latent }
  - { relation_ref: relations.decode_latent_enters_vae }
hidden_refs:
  - modules.inverse_latent_scaling
  - value_sites.vae_decode_latent
carries:
  - representations.diffusion_latent
presentation:
  label: decoder latent path
```

The generated ID is deterministic from the board, endpoint occurrences, flow
kind, and ordered relation path. Authoring tools match the semantic
`relation_ref` or `relation_path`, not the generated ID.

The renderer may use the path to:

- draw a dashed contracted edge;
- report the number of hidden steps;
- show each hidden node and relation on hover/pin;
- aggregate evidence without discarding individual refs; and
- navigate to a board whose subject exposes a hidden module.

## Ambiguity and Failure Rules

Projection must fail closed rather than silently draw a plausible but
unsupported diagram.

- In the first implementation, an explicitly elided connected component with
  more than one incoming visible boundary and more than one outgoing visible
  boundary is always invalid. It must remain visible or be represented by a
  visible aggregate module.
- Cyclic traversal is path-simple and cannot infer temporal identity from one
  repeated representation ID.
- Mutable before/after values require separate value sites or an explicit
  occurrence binding.
- Different flow kinds are never silently merged.
- Multiple canonical paths between the same visible endpoints remain distinct
  unless an explicit aggregation rule proves they are equivalent.
- An elided source or sink is invalid because contraction would drop it.
- The module hierarchy must be acyclic and every module must be reachable from
  `architecture`.
- A child board's subject must equal the canonical module opened by its parent
  occurrence. Cross-cutting navigation is deferred.

The root board has an additional reachability invariant. In the canonical
directed graph, every `boundary: input` must reach at least one
`boundary: output`, and every output must be reachable from at least one input.
For every input-to-output pair that is canonically reachable, the projected
root graph must preserve directed reachability. Because projected edges retain
ordered relation provenance and flow kinds, this check cannot be satisfied by
inventing an unrelated shortcut. An explicitly excluded training branch is
still valid when it lies on no canonical task-boundary path and therefore does
not change task-boundary reachability.

## Worked Contraction

Canonical architecture for a decoder-only task, with `final_latent` marked as
its boundary input and `generated_image` marked as its boundary output:

```text
final_latent
  -> inverse_latent_scaling
  -> vae_decode_latent
  -> frozen_vae_decoder
  -> generated_image
```

Root board request:

```yaml
subject_ref: architecture
expansion_depth: 1
nodes:
  - { id: final_latent, ref: value_sites.final_latent }
  - { id: vae_decoder, ref: modules.frozen_vae_decoder }
  - { id: image, ref: value_sites.generated_image }
elide:
  - { ref: modules.inverse_latent_scaling }
  - { ref: value_sites.vae_decode_latent }
```

Generated projected graph:

```text
final_latent - - - -> frozen_vae_decoder -> generated_image
               2 hidden objects
```

The dashed edge records all three canonical relation IDs between
`final_latent` and `frozen_vae_decoder`. No root-board edge is authored.

## Validation Contract

### Architecture

- supported schema-version checks and targeted forbidden duplicate-field
  rejection;
- globally unambiguous typed refs;
- unique semantic snake_case IDs;
- acyclic single-parent hierarchy;
- explicit, structurally consistent decomposition status on the root and every
  module;
- valid value-site representation/scope refs;
- valid relation endpoints, kinds, carries, and evidence;
- one-owner conditioning, state, scale-transition, and module-interface fields;
- resolved bibliography source refs with typed roles;
- complete canonical task-boundary reachability; and
- derivable module IO/state producer-consumer facts without contradiction.

### Board Request

- valid subject and relative depth;
- selected canonical refs inside the subject/boundary closure;
- unique board occurrence IDs;
- no incompatible visible/elide/exclude directives;
- reasons for exclusions;
- resolvable repeated occurrences;
- child-board subject compatibility;
- no child board expansion of a `leaf` or `opaque` module;
- presentation-only overrides;
- complete accounting for subject-boundary and in-horizon flow; and
- visible root task inputs and outputs.

### Projected Graph

- every edge has non-empty ordered provenance hops;
- every canonical edge has a non-empty ordered relation path;
- deterministic projection output;
- no unsupported transitive edges;
- no ambiguous contraction;
- no accidental flow-kind merge;
- preserved task/subject boundary and root input-to-output reachability; and
- every in-scope object is classified as visible, collapsed, elided,
  depth-hidden, or excluded.

## Compiler and Renderer Boundary

Projection belongs in a shared build/lint library, not the geometric wiring
engine. The manifest builder and linter must call the same projector so their
semantics cannot drift.

Implemented structure:

```text
lib/architecture_projection.rb
  validate architecture-v0.3/v0.4 hierarchy and refs
  project one visualization-v0.4 board
  emit normalized projected graph

lib/architecture_ownership.rb
  enforce architecture-v0.5 one-owner rules

lib/architecture_coverage.rb
  validate decomposition closure
  compile breadth scopes and depth frontiers

renderer/architecture/build-manifest.rb
  compile deterministic architecture-manifest-v0.5
  include projected boards

scripts/lint_sources.rb
  validate sources
  project every board
  validate the generated graph

renderer/architecture/renderer.js
  consume projected nodes and edges
  measure, place and route them geometrically
```

The manifest must preserve full canonical objects, evidence, relation paths,
hidden refs, and board requests. It must not flatten claims or discard source
provenance.

The manifest edge IR reserves a discriminated union. Every edge
has `from`, `to`, `projection: direct | boundary | contracted`, a non-empty
ordered `provenance_hops` list, and a `presentation` object that preserves the
authored label, tone, and connection prose.

- `origin: canonical` requires every provenance hop to contain a canonical
  `relation_ref`, requires a non-empty ordered `relation_path` with the same
  relation IDs, and requires semantic `kind` plus `carries` (which may be empty
  for a control-only relation).
- `origin: legacy_authored` is reserved for a future lossless legacy compiler
  and requires at least one provenance hop of the form
  `legacy_edge_ref: <board-id>#edge-<source-index>`. Its ordered hop list may
  mix canonical `relation_ref` and legacy-edge hops when old elision contracts
  a mixed path. `relation_path` contains only the canonical subsequence and may
  be empty; `kind` and `carries` are nullable because the adapter must not
  invent missing architectural semantics. This variant is emitted only by the
  temporary v0.2/v0.3 adapter and is forbidden for visualization-v0.4.

Current architecture-manifest-v0.5 files emit only `origin: canonical`. Old
architecture-manifest-v0.2 files remain readable through the browser's narrow
authored-board/elision adapter; they are not rewritten into the reserved
`legacy_authored` variant. For current projected boards, the browser consumes
the canonical IR for geometry and presentation and never infers semantic flow.

## Implemented Migration

Compatibility during migration is explicit:

| Architecture | Visualization | Result |
| --- | --- | --- |
| v0.2 | v0.3 | Accepted through the legacy authored-board adapter |
| v0.3 | v0.3 | Rejected; v0.3 value-site semantics require derived boards |
| v0.3 | v0.4 | Accepted by the projector for compatibility |
| v0.4 | v0.4 | Current contract; accepted through derived projection and one-owner validation |
| v0.2 | v0.4 | Rejected because hierarchy/value-site projection semantics are unavailable |

The current architecture-v0.5/visualization-v0.4 combination emits
architecture-manifest-v0.5 canonical edges. Architecture-v0.3 remains readable
by the projector for fixtures and migration. The v0.2/v0.3 combination remains
on architecture-manifest-v0.2 and is
read through the browser's narrow legacy adapter. This does not make
architecture-v0.3 and visualization-v0.3 a supported authoring combination.

1. Executable projection fixtures cover direct flow, collapse, elision,
   exclusions, ambiguity, occurrence binding, omission, and root reachability.
2. `lib/architecture_projection.rb` is the shared semantic projector used by
   the builder and linter.
3. The generic architecture uses hierarchy, typed value sites, and derived
   visualization-v0.4 boards; the migration intentionally surfaced previously
   omitted grouping-index and fine-state skip dependencies.
4. DiT uses distinct before/after sampler and token value sites, canonical
   denoiser/block internals, and four derived semantic-zoom boards.
5. The browser consumes projected boards while retaining a legacy authored
   manifest adapter. No registered visualization-v0.4 board authors normal
   edges or `view_only` flow.

Current projection coverage:

- one direct relation;
- one rejected unclassified pass-through node;
- one collapsed module subtree;
- one explicit elision;
- one explicit exclusion;
- one conditioning path parallel to data flow;
- one unambiguous fan-out and fan-in;
- one rejected ambiguous fan-in plus fan-out;
- one loop with before/after value sites;
- one repeated board occurrence requiring binding;
- one child board preserving its parent subject boundary;
- one rejected root projection that disconnects a canonical input/output pair;
- one rejected edge override with no generated match; and
- registered-source integration coverage for generic fan-out, DiT cyclic
  before/after state, conditioning, and child-board boundaries.

A lossless mixed canonical/view-only legacy-hop fixture remains deferred with
the reserved `origin: legacy_authored` manifest variant; current registered
sources contain no `view_only` flow.

## Deferred

- shared module children or hierarchy DAGs;
- automatic board-node frontier generation when `nodes` is omitted;
- arbitrary port-level type checking beyond canonical value sites;
- automatic semantic aggregation of heterogeneous relation paths;
- unconstrained hierarchy-only layout that bypasses projected board
  occurrences (the implemented semantic compiler works after projection); and
- authored summary relations without explicit refinement provenance.

These are deferred so the first implementation stays deterministic, curated,
and testable.
