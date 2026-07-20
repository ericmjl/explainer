# Architecture Edit Language v0.2

Status: **Current**. `architecture-edit-v0.1` remains accepted as a compatible
subset.

`architecture-edit-v0.2` is the deterministic change-plan language for
bounded edits to one registered architecture source set. It lets a wizard,
script, or language model propose semantic operations without giving that
producer permission to rewrite canonical YAML directly.

v0.2 adds a deliberately small review-curation surface: audience-facing board
copy, edge explanation overrides, explicit visible-to-elided/excluded
decisions, and a versioned deterministic board-layout operation. It does not
add arbitrary YAML paths. Existing v0.1 plans and all v0.1 operation envelopes
retain their original meaning.

The plan is an instruction artifact, not a second architecture source. The
durable facts remain in `architectures/*.yaml` and `views/*.view.yaml`; a plan
is accepted only when applying all of its operations produces sources that
pass the normal architecture-v0.5 and visualization-v0.4 compiler pipeline.

Related contracts:

- `protocol/architecture-language.md`: canonical architectural facts;
- `protocol/visualization-language.md`: curated semantic-zoom boards;
- `protocol/semantic-layout.md`: versioned automatic placement and feedback
  routing policy;
- `protocol/fact-ownership.md`: one owner for each fact;
- `protocol/id-evolution.md`: stable-ID policy; and
- `protocol/source-validation.md`: fail-closed source acceptance.

## Plan Shape

A draft plan has this top-level shape:

```yaml
schema_version: architecture-edit-v0.2
id: explain_feature_preparation
target:
  source_set: genie3
intent: Add a drilldown that explains feature preparation.
operations:
  - op: scaffold_board
    board:
      id: feature_preparation
      title: Feature Preparation
      summary: Show how request metadata becomes token and pair conditioning.
      subject_ref: modules.feature_builder
      expansion_depth: 1
```

Required fields are:

- `schema_version`: `architecture-edit-v0.2` for the current language, or
  `architecture-edit-v0.1` for a legacy plan using only v0.1 operations;
- `id`: a stable snake-case identifier for this proposed change;
- `target`: the registered source set and, for a prepared plan, its source
  digests;
- `intent`: concise human-readable purpose for the whole change; and
- `operations`: one or more typed operations, evaluated in authored order.

Unknown fields and unknown operation kinds fail validation. Array positions in
the architecture and view files are never part of the public edit interface.

## Source-Set Targeting and Stale-Plan Protection

`target.source_set` is an ID from `architectures/index.yaml`. The registry,
not the plan author, resolves the architecture and view paths. A plan cannot
name arbitrary filesystem targets.

`prepare` records the current source bytes as raw, lowercase SHA-256 values:

```yaml
target:
  source_set: genie3
  architecture_sha256: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
  view_sha256: fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210
```

The illustrative values above describe the required format; prepared output
contains the actual hashes. Both digests are mandatory for `apply`, even when
the requested operations affect only one of the two files. `apply` recomputes
both digests immediately before validation and writing. A mismatch makes the
plan stale and aborts the transaction; there is no force mode that silently
rebases the operations onto changed sources.

This protects uncommitted work as well as committed work. A Git revision is
not a substitute because a source file may have changed without a commit.

## Prepare, Show, and Apply

The command lifecycle is explicit:

The repository includes a runnable draft at
`examples/architecture-edits/clarify-timestep-embedder.yaml`.

```bash
ruby scripts/architecture_edit.rb prepare edits/feature-preparation.yaml \
  --out /tmp/feature-preparation.prepared.yaml

ruby scripts/architecture_edit.rb show \
  /tmp/feature-preparation.prepared.yaml

ruby scripts/architecture_edit.rb apply \
  /tmp/feature-preparation.prepared.yaml
```

### `prepare`

`prepare` accepts a draft plan, resolves its registered source set, validates
the operation envelopes and canonical payloads, applies the operations in
memory, runs source and projection validation, and writes a copy containing
the current architecture and view digests. It does not change canonical
sources or generated manifests.

If a supplied draft already contains a digest, that digest is a precondition;
`prepare` rejects it when it does not match the current source.

### `show`

`show` accepts either a draft or prepared plan and performs the same in-memory
application and validation without writing repository files. For a prepared
plan it also reports whether its digests are still current. Its primary output
is a semantic diff, not a line-oriented YAML dump.

### `apply`

`apply` accepts only a prepared plan containing both current digests. It
repeats plan, source, ownership, coverage, evidence, and board-projection
validation before committing the architecture, view, and regenerated outputs
as one transaction. Validation or write failure leaves the pre-edit files in
place.

Prepare/show/apply separation makes review explicit. An author may discard or
revise the plan after `show`; preparation is not approval.

## Semantic References

Operations address entities by stable typed references:

```text
modules.feature_builder
representations.feature_bundle
value_sites.feature_bundle
relations.feature_builder_produces_feature_bundle
```

The supported namespaces are `modules`, `representations`, `value_sites`, and
`relations`. These references resolve within the target source set. IDs are
never inferred from labels, file positions, Ruby/Python variable names, or
diagram coordinates.

Board scaffolds created by an edit plan use one `modules.*` subject reference;
The scaffold operation does not create a second architecture root for an already registered
source set. Their optional `node_refs` use `modules.*` or `value_sites.*`,
matching the visualization-v0.4 node contract.

## Operations

### `add_module`

Appends one canonical architecture-v0.5 module to `modules`. The payload is
the complete module object under `module:`. Duplicate IDs fail; the operation
does not merge with an existing module.

### `add_representation`

Appends one complete architecture-v0.5 representation under
`representation:`. Its ID must be new and its shape, scale, semantic role,
carried meaning, and evidence must be explicit.

### `add_value_site`

Appends one complete value-site occurrence under `value_site:`. Its
`representation_ref` and `scope_ref` must resolve after the plan is applied.
Inputs and outputs still require the canonical `boundary` declaration.

### `add_relation`

Appends one complete canonical relation under `relation:`. It must declare a
new semantic ID, typed `from` and `to` endpoints, relation kind, carried
representations, operation, and evidence. It does not author board edges;
boards continue to receive their edges from projection.

### `update_entity`

Updates shallow fields on one existing semantic entity:

```yaml
- op: update_entity
  ref: modules.feature_builder
  expect:
    kind: adapter
  set:
    role: prepare token metadata and pairwise conditioning masks
```

`set` must contain at least one field. `expect` is optional, but authors should
use it for facts whose current value matters: every expected field must match
before the update is applied. Both mappings address immediate entity fields;
replacing a nested object means supplying that whole nested value.

`update_entity` cannot set `id`. Changing identity is a refactor with broader
compatibility consequences and is outside the supported edit versions.

### `scaffold_board`

Creates one visualization-v0.4 child-board scaffold from canonical
architecture facts. Its `board` payload requires `id`, `title`, `summary`, and
`subject_ref`, and may provide:

- `parent`: the parent board ID;
- `expansion_depth`: relative subject depth, defaulting to `1`;
- `node_refs`: an exact curated node selection; and
- `columns`: a positive column cap/hint for deterministic layout.

When `node_refs` is omitted, the compiler chooses the maximal valid one-level
frontier: immediate child modules plus the scoped or boundary-crossing value
sites needed to preserve canonical flow. When `node_refs` is present, it is
the exact requested selection; the operation fails if omitted in-scope facts
cannot be accounted for by normal depth hiding.

The scaffold lays out the selected nodes with the deterministic
`semantic_flow_v1` policy. It unfolds cycle-closing state updates as feedback,
ranks ordinary information flow left to right, keeps primary computation in a
middle band, places conditioning above its consumers, and places loop-carried
values below. See `protocol/semantic-layout.md`. The result is a conservative
starting board, not a claim that an automatic layout is the only valid
explanation.

If `parent` is omitted, the compiler searches existing boards for the unique
node occurrence whose `ref` equals `subject_ref`. If exactly one exists, that
board becomes the parent and its node receives `board_ref` for the new board.
An explicit parent must contain exactly one such node. Missing or ambiguous
occurrences fail instead of guessing.

Scaffolding never invents `elide`, `exclude`, `edge_overrides`, connection
prose, or architectural facts. Ambiguous parentage and projection/accounting
errors fail closed. A dense valid frontier remains complete and produces
explicit `dense_board` or `dense_edge_set` diagnostics instead of silently
hiding facts. The current thresholds are more than 12 visible nodes and more
than 20 projected edges, respectively. The author can then narrow `node_refs`,
refine the canonical decomposition, or curate the board in a new reviewed
plan.

### `layout_board` (v0.2)

Reflows one existing board without changing its curated content:

```yaml
- op: layout_board
  board_id: denoiser_forward
  policy: semantic_flow_v1
```

`policy` is required and versioned so a prepared plan cannot silently acquire
different placement behavior. An optional positive `columns` value caps the
natural left-to-right ranks; a value larger than the natural width does not
create empty columns.

The operation projects the board from canonical relations, compiles semantic
placement bands, and updates only `grid` plus every occurrence's `col` and `row`. It
preserves node refs, labels, prose, drilldowns, visibility accounting,
occurrence bindings, edge overrides, and board-wide `min_col` / `col_gap`.
Opt-in `row_sizing` and `row_gap` presentation settings are preserved as well,
so a reviewed semantic reflow cannot silently discard measured annotation
clearance.
The text semantic diff reports the complete grid change and one before/after
position line for every moved occurrence; JSON retains the complete position
maps and compiler metrics. A board that already matches the policy fails as an
empty layout instead of creating a no-op transaction.

The current `semantic_flow_v1` policy does not yet preserve typed
representation-lane rows. A board with `lanes[].kind: representation` is
therefore rejected by `layout_board`; curate its `col` / `row` positions in
view YAML until a later versioned policy models that constraint explicitly.

This is an opt-in authoring operation. Curated boards are not required to match
the generated policy, and later editorial movement remains valid view source.

### `update_view_entity` (v0.2)

Updates only audience-facing prose owned by a visualization board. Its typed
`ref` has one of two forms:

```yaml
- op: update_view_entity
  ref: boards.directional_sampling
  expect:
    summary: Each step denoises the current coordinate state.
  set:
    summary: Repeatedly predict clean coordinates, read out noise, and take one DDIM update.

- op: update_view_entity
  ref: boards.directional_sampling.nodes.denoiser
  expect:
    detail: null
  set:
    role: predict clean coordinates from the current noisy state
    detail: The same denoiser is reused at every selected timestep.
```

`boards.<board_id>` permits only `summary`. A node occurrence ref of the form
`boards.<board_id>.nodes.<occurrence_id>` permits only `role` and `detail`.
These fields intentionally override presentation for one occurrence; they do
not rename its canonical module or change architectural facts. `null` in an
`expect` mapping means that the optional occurrence override is absent.

### `set_edge_override` (v0.2)

Creates or updates the explanatory `label` and/or complete `connection` for
one projected edge match:

```yaml
- op: set_edge_override
  board_id: directional_sampling
  match:
    relation_ref: relations.denoiser_predicts_coordinates
  expect:
    label: x0 estimate
  set:
    label: predicted clean coordinates
    connection:
      title: Denoiser prediction
      role: clean-coordinate estimate
      inside: The noise readout compares this estimate with the current noisy coordinates.
```

`match` is exactly one canonical `relation_ref` or one complete ordered
`relation_path`, using the same semantics as visualization-v0.4. The operation
does not expose `tone`, notation, routing, endpoints, or arbitrary override
fields. A supplied `connection` is atomic and must include `title`, `role`, and
`inside`; partial connection objects fail contract validation.

The complete matching override can be removed explicitly:

```yaml
- op: set_edge_override
  board_id: directional_sampling
  match:
    relation_ref: relations.denoiser_predicts_coordinates
  expect:
    label: x0 estimate
  remove: true
```

Removal must resolve an existing exact match. Updating or removing the same
match twice in one plan is rejected. Projection validation still requires
every remaining override to match exactly one generated edge.

### `set_board_visibility` (v0.2)

Converts one visible occurrence into an explicit canonical visibility
decision. The occurrence ID and typed ref form a precondition together:

```yaml
- op: set_board_visibility
  board_id: directional_sampling
  occurrence_id: cached_task_features
  ref: value_sites.cached_task_features
  decision: excluded
  reason: Cached task features are prepared once on the parent board.
```

`decision` is `elided` or `excluded`. An exclusion requires a non-empty
`reason`; an elision does not accept one. The editor atomically removes the
visible node occurrence and appends the corresponding `elide` or `exclude`
directive. It does not guess which incident edge overrides should disappear,
rewrite the grid, or repair a contraction. Those related intentions must be
expressed as other typed operations in the same plan.

An occurrence carrying `board_ref` is rejected because hiding it would also
rewrite semantic navigation. Move or remove that drilldown in a separately
reviewed navigation refactor. All other accounting and contraction rules stay
owned by the normal projector: boundary elision, ambiguous fan-in/fan-out,
unmatched overrides, and disconnected root flow fail the entire transaction.

## Evidence Rules

The operation envelope does not weaken architecture-v0.5 evidence rules.
Payloads for `add_module`, `add_representation`, `add_value_site`, and
`add_relation` are validated against their canonical architecture
definitions, including required `evidence.status` and `evidence.refs`.

- Confirmed facts require a compatible bibliography source and locator.
- Inferred facts remain explicitly `inferred`; the editor does not promote
  them to confirmed.
- Unresolved facts belong in the canonical `open_questions` workflow rather
  than being disguised as confident additions.
- `update_entity` may replace an evidence object, but the resulting entity
  must still pass the evidence contract.
- `scaffold_board` adds presentation, not a new architecture fact, and does
  not synthesize evidence.

No command fabricates citations, certainty, tensor shapes, relation endpoints,
or decomposition status to make a plan pass.

## Semantic Diff

`show` and `apply` report changes in architecture language. A stable report
identifies, in deterministic order:

- entities added, keyed by their typed semantic refs;
- immediate fields changed, including expected old and proposed new values;
- boards scaffolded, selected node refs, parent navigation, and grid shape;
- reviewed board reflows, with the grid change and every moved occurrence;
- board summaries and occurrence copy changed through their typed refs;
- exact edge overrides added, changed, or removed by relation match;
- visible occurrences removed alongside their added visibility directives;
- canonical and generated files that would change; and
- validation diagnostics attached to plan operations or semantic refs.

Generated-manifest churn is not presented as hundreds of architecture edits.
The meaningful unit is, for example, “add relation
`relations.feature_builder_produces_feature_bundle`” or “scaffold board
`feature_preparation`,” with the line diff remaining available for normal Git
review.

Machine-readable output follows the same stable entities and operation order
so an authoring frontend can attach diagnostics to the proposal that caused
them. It must not treat renderer-generated fields as editable source facts.

## Transactional Validation

All operations are first applied to staged in-memory documents. Acceptance
then follows the normal fail-closed path:

```text
architecture-edit-v0.1 or architecture-edit-v0.2 plan schema
  -> canonical payload validation
  -> source-set and SHA-256 preconditions
  -> staged architecture-v0.5 and visualization-v0.4 sources
  -> evidence, typed-reference, ownership, and coverage checks
  -> semantic board projection
  -> deterministic manifest generation
  -> transactional file replacement
```

Added subtrees may be serialized locally, but existing architecture and view
documents are not dumped and regenerated wholesale. `layout_board` patches
only the selected board's grid and occurrence `col` / `row` fields. A compound
v0.2 view edit may reserialize the one changed board so node removal and its
visibility directive remain atomic; sibling boards and every other source
region remain byte-preserved. Source-aware patches otherwise retain unrelated
comments, formatting, and named YAML anchors. The patched text is reparsed
before acceptance, so preserving presentation cannot bypass semantic
validation.

The architecture source, view source, and affected generated output form one
write set. Temporary output is complete before replacement begins; any stale
digest, invalid projection, compiler error, or failed write aborts or rolls
back the whole set. The editor does not require a clean Git worktree and does
not use Git reset as a transaction mechanism.

## Agent Workflow for Porting a Method

"Port this architecture" involves two separate workspaces:

```text
method repository (read-only code evidence)
  -> architecture interpretation and evidence locators
  -> architecture-edit-v0.2 draft
  -> explainer repository (validated architecture/view YAML)
  -> projected boards and generated manifests
```

The interpretation step is not implemented by architecture edit v0.2. A
human, agent, or future repository analyzer must inspect the method codebase,
paper, configs, and documentation and propose evidence-backed facts. The edit
compiler begins only after those facts have been expressed as typed
operations.

For an existing registry `source_set`, an agent should:

1. Record the method repository path and inspected revision.
2. Resolve the target through `architectures/index.yaml`.
3. Inspect code and documentation without mutating the method repository.
4. Put supported module, representation, value-site, relation, field-update,
   board-scaffold, board-layout, copy-review, edge-override, and visibility
   changes into a draft plan.
5. Run `prepare`, inspect the semantic output from `show`, and run `apply`.
6. Verify the persisted source set with
   `ruby scripts/verify_architecture.rb --source-set <id>`.
7. Report any architectural facts that could not be represented by v0.2
   operations instead of silently editing around the compiler.

Creating or changing a `standard-block-v0.3` template, architecture
`block_instances` entry, or reusable-board stub is currently one such
unsupported cross-source edit. Author that bounded declarative change through
the normal source-first workflow, then run the full source-set verifier. Do not
misrepresent it as an architecture-edit-v0.2 transaction; a later edit
language version can add a typed multi-file operation.

For a new method, v0.2 cannot create the initial registry entry or source
bundle. The agent must first bootstrap the bibliography, architecture, root
view, pseudocode, and registry files through the source-first authoring
workflow and validate them normally. That step must not be described as
automatic codebase ingestion. After registration, the deterministic edit
workflow becomes the default for supported follow-up changes. The same
unscoped source-set verifier is the final gate after manual bootstrap.

## Explicit v0.2 Non-Goals

Architecture edit v0.2 deliberately does not provide:

- entity rename, alias, split, or merge operations;
- deletion of canonical modules, representations, value sites, or relations;
- arbitrary JSON Patch, array-index edits, or unrestricted YAML paths;
- automatic evidence generation or certainty promotion;
- automatic `elide`, `exclude`, relation, or connection-prose invention (v0.2
  can apply an explicitly authored review decision);
- an alternate editable architecture copy derived from manifests;
- extracting architecture facts from raw code, papers, or documentation;
- direct writes from an LLM to canonical sources;
- arbitrary method-repository ingestion and new-source-set creation; or
- standard-block template, block-instance, or reusable-board-stub authoring;
- direct browser writes to canonical YAML; an authoring UI must emit the same
  reviewable, validated plan operations.

An LLM may produce a draft plan. The deterministic editor remains responsible
for resolving refs, checking preconditions, generating the semantic diff, and
performing the validated transaction. Rename and delete require complete
cross-source impact analysis before they can enter a later contract version.
