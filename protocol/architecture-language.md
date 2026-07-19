# Architecture Language v0.4

Status: **current implemented contract**.

Architecture YAML is the durable semantic source for a model or system. It
describes canonical objects, hierarchy, information flow, specialized
semantics, evidence, and explicit decomposition closure. Boards select and
present this graph; they do not redefine it.

Related contracts:

- `protocol/source-validation.md`: executable schemas and compiler acceptance;
- `protocol/id-evolution.md`: stable-ID compatibility and refactoring;
- `protocol/fact-ownership.md`: one owner for every fact;
- `protocol/architecture-coverage.md`: breadth closure and depth frontiers;
- `protocol/architecture-projection-model.md`: architecture-derived boards;
- `protocol/bibliography.md`: canonical source metadata and typed citations.

## Top-Level Shape

```yaml
schema_version: architecture-v0.4
id: stable_architecture_id
name: Human Readable Name
family: transformer
status: draft
task_modes: [generation]

sources: []
decomposition: {}
execution: {}
state_semantics: {}
conditioning: []
scale_transitions: []
training_inference: {}
representations: []
value_sites: []
modules: []
relations: []
claims: []
open_questions: []
```

Use stable semantic `snake_case` IDs. Cross-object references are typed:

```yaml
modules.ddpm_sampler
representations.input_latent
value_sites.latent_before_step
relations.current_latent_enters_reverse_step
claims.sampler_is_fixed_math
```

## Sources and Evidence

Source metadata lives once in `references/bibliography.yaml`. Architecture
facts cite it with a typed role:

```yaml
evidence:
  status: confirmed_from_code
  refs:
    - source_ref: dit_models_code
      role: implementation_evidence
      locator: DiT.forward
      note: The forward pass combines timestep and class embeddings.
```

Supported certainty states are:

- `confirmed_from_code`;
- `confirmed_from_paper`;
- `confirmed_from_docs`;
- `inferred`; and
- `open_question`.

Every nontrivial module, representation, value site, relation, claim,
conditioning use, scale transition, state-lifecycle assertion, and
training/inference description needs evidence. Confirmed evidence must cite a
compatible source kind with a stable locator. Do not infer historical priority
from a citation; record origin claims separately with their own evidence.

## Decomposition and Hierarchy

Every module has exactly one `parent_ref`, rooted at `architecture`. Child
membership and hierarchy depth are derived from these references.

```yaml
decomposition:
  status: complete
  evidence:
    status: confirmed_from_code
    refs:
      - source_ref: implementation_source
        role: implementation_evidence
        locator: relevant_symbol

modules:
  - id: denoiser
    parent_ref: architecture
    decomposition:
      status: complete

  - id: external_decoder
    parent_ref: architecture
    decomposition:
      status: opaque
      reason: external_pretrained_component
```

Every scope declares one decomposition status:

- `complete`: its immediate child set is asserted exhaustive;
- `partial`: sibling breadth may still be missing and `reason` is required;
- `leaf`: intentional terminal at the current explanatory granularity; or
- `opaque`: component is accounted for but internals are intentionally not
  modeled, with a required `reason`.

Never author a second child list or expected count. See
`protocol/architecture-coverage.md` for compiler invariants and generated
coverage reports.

## Representations and Value Sites

A representation describes a reusable tensor or stream type:

```yaml
representations:
  - id: diffusion_latent
    scale: spatial
    semantic_role: mutable latent in reverse diffusion
    shape: "B x 4 x I x I"
    carries:
      - noised image content
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol
```

`glyph` is an optional reusable visual classification. Prefer it when a
representation has semantic geometry that shape rank alone cannot identify:

```yaml
representations:
  - id: token_coordinates
    scale: token
    semantic_role: three-dimensional token positions
    shape: "B x N x 3"
    glyph: coordinates
    carries: [one Euclidean position per token]
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: shape_evidence
          locator: coordinate_state

  - id: token_frames
    scale: token
    semantic_role: oriented local frames with translations
    shape: "B x N x (3 x 3 + 3)"
    glyph: frames
    carries: [one rotation and translation per token]
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: shape_evidence
          locator: local_frames
```

Own a reusable classification on the representation instead of repeating it
on every value-site occurrence. A trailing axis of size three is not enough
evidence: RGB channels and displacement vectors are not coordinate point
clouds.

A representation that is a dictionary or product rather than one homogeneous
tensor may declare evidence-bearing `field_groups`. Group code-level keys by
their shared token or atom axis and explain their common purpose; do not copy
the same field into multiple groups. Give a named mapping of heterogeneous
tensors `glyph: dictionary`, so the board does not imply that it is one tensor.

```yaml
field_groups:
  - id: task_conditioning
    label: Task conditioning
    axis: token
    shape: B x N
    fields: [cond_seq_mask, cond_struct_mask, cond_interface_mask]
    semantic_role: Marks which sequence, structure, and interface facts are exposed.
    task_behavior: The selected task adapter determines which masks are active.
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: schema_evidence
          locator: FEATURES
```

The browser renders these groups as a field table when a value occurrence of
the representation is selected. The table is a projection of canonical
representation facts, not independently authored view content.

A value site describes one concrete architectural occurrence of that type:

```yaml
value_sites:
  - id: latent_before_step
    representation_ref: representations.diffusion_latent
    scope_ref: modules.ddpm_sampler
    role: state_read
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: sampler_step

  - id: latent_after_step
    representation_ref: representations.diffusion_latent
    scope_ref: modules.ddpm_sampler
    role: state_write
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: sampler_step
```

Split mutable before/after values into distinct sites. Never express a state
update as an ambiguous self-edge. Task-native inputs and outputs use
`scope_ref: architecture` and `boundary: input|output`.

`representations` own reusable shape, scale, meaning, and any semantic glyph.
`value_sites` own occurrence scope, boundary, and local role. Producers and
consumers are derived from relations.

## Modules

Modules are semantic processing units. Their `kind` is one controlled broad
architectural role:

`adapter`, `attention`, `controller`, `decoder`, `denoiser`, `encoder`,
`feed_forward`, `normalization`, `operator`, `prediction_head`, `refiner`,
`residual_update`, `sampler`, or `serializer`.

Use the optional `mechanisms` list for searchable implementation detail such
as `directional_ddim`, `invariant_point_attention`, or
`triangular_multiplication`. Do not encode granularity or reuse metadata in
`kind`: hierarchy and `decomposition` identify containers, `repeats` identifies
iteration. Typed reusable occurrences live in top-level `block_instances`;
legacy `standard_block_ref` remains a summary-only compatibility hook.
Discovery should match both fields: an `attention` query finds modules whose
kind is `attention` and composite modules that list `attention` as a mechanism.
Prefer reusable mechanism names; keep direction, placement, and other
occurrence-specific detail in the module label and role.

```yaml
modules:
  - id: reverse_diffusion_step
    parent_ref: modules.ddpm_sampler
    decomposition:
      status: leaf
    label: DDPM Sampling Formula
    kind: operator
    mechanisms: [ddpm]
    role: combine the current latent and model prediction into the next latent
    scale: spatial
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol
```

Optional module fields include `mechanisms`, `repeats`, `depth`, `attention`,
`standard_block_ref`, `pseudocode_ref`, and `frozen`. Do not author module
`inputs` or `outputs`; canonical relations define the interface.

## Reusable Block Instances

`block_instances` binds one versioned standard-block template to a concrete
module through canonical relations. The instance owns the selected `variant`,
`use_scope`, `conformance`, method-specific difference summary, and evidence.
It never copies relation endpoints or representation facts.

Use `conformance: exact` only when every non-control relation incident on the
subject is bound and the selected variant covers the full module boundary.
Use `wrapped` when architecture-specific wrapper logic surrounds the reusable
core, and `reduced` when the method intentionally removes or replaces parts.
Both non-exact forms require `difference_summary`. See
`protocol/standard-blocks.md` for the complete port and detail-board contract.

## Canonical Relations

Relations are the sole owners of information-flow identity and endpoints:

```yaml
relations:
  - id: current_latent_enters_reverse_step
    from: value_sites.latent_before_step
    to: modules.reverse_diffusion_step
    kind: data_flow
    carries:
      - representations.diffusion_latent
    operation: reverse_diffusion_update
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol
```

Every relation has a stable semantic ID and typed endpoints. Common kinds
include `data_flow`, `conditioning`, `state_update`, `index_flow`, `skip`, and
`control`. `carries` references representation types; `operation` names the
architectural action.

Do not author anonymous architecture `edges`, duplicated module interfaces,
or board-local semantic flow. The compiler derives module/value-site
interfaces and projected board edges from relations.

## State Semantics

State semantics group related value-site occurrences and describe their shared
lifecycle:

```yaml
state_semantics:
  sampling_latent:
    representation_ref: representations.diffusion_latent
    value_site_refs:
      - value_sites.latent_before_step
      - value_sites.latent_after_step
    lifecycle: iterative_loop_state
    notes:
      - Before and after sites distinguish x_t from x_(t-1).
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol
```

The group owns lifecycle interpretation and notes. It does not author `role`,
`produced_by`, `consumed_by`, or `updated_by`. Site roles come from
`value_sites`; interfaces come from relations. A value site may belong to at
most one state group, and every grouped site must use the declared
representation.

## Conditioning

Conditioning records how a canonical conditioning relation is used:

```yaml
conditioning:
  - id: block_adaln_zero
    relation_ref: relations.cond_vector_enters_adaln_mlp
    mode: adaln_zero
    standard_block_ref: standard_blocks/adaln-zero-conditioning.yaml
    updates_source: false
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol
```

The relation owns source and target; the conditioning entry owns the mechanism
such as `adaln_zero`, `pair_bias`, `gate`, `additive_injection`,
`concatenation`, or `cross_attention`. Do not copy relation endpoints into the
conditioning entry.

## Scale Transitions

Scale transitions interpret an ordered canonical flow path:

```yaml
scale_transitions:
  - id: item_to_group_pool
    relation_path:
      - relations.encoded_items_enter_group_pool
      - relations.group_pool_produces_group_state
    index_relation_ref: relations.group_index_guides_pooling
    aggregation: scatter_mean
    copy_vs_pool: pool
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol
```

The path must be continuous and run from a value site to a value site. An
optional `index_relation_ref` must identify an `index_flow` into that path.
Endpoints, endpoint scales, projection modules, and index-map occurrences are
derived; do not author them again.

## Execution and Training/Inference

`execution` owns dynamic behavior not recoverable from a static graph:

```yaml
execution:
  loops:
    - id: denoising_loop
      repeats: num_sampling_steps
      reruns:
        - modules.denoiser
        - modules.reverse_diffusion_step
      cached: []
      notes: []
      evidence:
        status: confirmed_from_code
        refs:
          - source_ref: implementation_source
            role: implementation_evidence
            locator: relevant_symbol
```

Use it for sampling loops, recycling, recurrent refinement, cached state, and
phase-specific reruns. `training_inference` owns objectives, schedules,
samplers, latent codecs, teacher forcing, self-conditioning, and deployment
notes when relevant.

## Claims and Open Questions

Claims are named, evidence-backed statements suitable for inspectors, stories,
and comparisons. Open questions preserve unresolved facts rather than hiding
them in prose:

```yaml
claims:
  - id: sampler_formula_has_no_learned_weights
    statement: The reverse update is fixed schedule math around model outputs.
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: relevant_symbol

open_questions:
  - id: unresolved_boundary
    question: Is this cache refreshed during inference?
    status: unresolved
    affected_refs:
      - execution.loops.refinement_loop
    blocking: false
    resolution_criteria: Trace cache invalidation across one complete inference call.
    evidence:
      status: open_question
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: cache_initialization
```

## Compilation

The Ruby compiler stack validates and derives the browser manifest:

```text
architecture-v0.4 YAML
  -> duplicate-key rejection
  -> executable JSON Schema validation
  -> evidence and typed-reference validation
  -> ownership validation
  -> decomposition coverage validation/compilation
  -> semantic board projection
  -> architecture-manifest-v0.4 JavaScript
```

Generated convenience fields include value-site producer/consumer indexes,
conditioning endpoints, scale-transition endpoints/scales, hierarchy coverage,
and projected board edges. They are compiler output, not alternate authoring
locations.

The manifest builder first runs the full repository linter and supports
`--check` for deterministic byte-for-byte verification. See
`protocol/source-validation.md`.

Legacy architecture-v0.1/v0.2/v0.3 compatibility and migration behavior are
documented in `protocol/architecture-projection-model.md`; new sources use
architecture-v0.4.
