# Standard Blocks v0.3

Status: **implemented current reusable-block contract**.

Standard blocks are reusable algorithm anatomy: larger than one pseudocode
line, smaller than a method architecture. A template can define pair-biased
attention or invariant point attention once, while each architecture owns a
typed, evidence-bearing use of that template.

The contract deliberately separates three facts:

1. `standard_blocks/*.yaml` owns public ports, named variants, symbolic shape
   parameters/contracts, internal values, reusable steps, code/TeX, typed
   shape rules, and the generic internal layout.
2. `architectures/*.yaml` owns a concrete `block_instances` occurrence, its
   subject module, selected variant, conformance, canonical relation bindings,
   explicit model-parameter bindings, and usage evidence.
3. `views/*.view.yaml` may own a stable reusable-board URL through a small
   `kind: standard_block_instance` board stub. The compiler fills its nodes and
   edges from the template.

Template internals never become canonical architecture modules or relations.
Boundary edges retain their bound `relations.*` provenance; internal edges are
explicitly grounded as `standard_block_template`.

## Template Shape

```yaml
schema_version: standard-block-v0.3
id: pair_biased_attention
name: Pair-Biased Attention
kind: attention
status: review
description: Add a projected pair term to self-attention logits.
parameters:
  - { id: b, notation: B, kind: batch, resolution: boundary, role: batch axes }
  - { id: n, notation: N, kind: sequence, resolution: boundary, role: item count }
  - { id: c_s, notation: C_s, kind: channel, resolution: boundary, role: single width }
  - { id: c_z, notation: C_z, kind: channel, resolution: boundary, role: pair width }
  - { id: h, notation: H, kind: heads, resolution: instance, role: attention heads }
ports:
  - id: single_state
    label: single state
    direction: input
    kind: representation
    required: true
    cardinality: one
    relation_kinds: [data_flow, state_update]
    shape_contract:
      kind: tensor
      axes:
        - { id: batch, dimension: b }
        - { id: query_token, dimension: n }
        - { id: single_channel, dimension: c_s }
  - id: pair_context
    label: pair context
    direction: conditioning
    kind: representation
    required: true
    cardinality: one
    relation_kinds: [conditioning]
    shape_contract:
      kind: tensor
      axes:
        - { id: batch, dimension: b }
        - { id: query_token, dimension: n }
        - { id: key_token, dimension: n }
        - { id: pair_channel, dimension: c_z }
  - id: updated_single_state
    label: updated single state
    direction: output
    kind: representation
    required: true
    cardinality: one
    relation_kinds: [data_flow, state_update]
    shape_contract:
      kind: tensor
      axes:
        - { id: batch, dimension: b }
        - { id: query_token, dimension: n }
        - { id: single_channel, dimension: c_s }
variants:
  - id: logit_bias_only
    label: Pair-logit bias
    description: Pair context changes logits but is not aggregated as values.
    step_refs: [steps.project_pair_bias, steps.add_pair_bias]
default_variant: logit_bias_only
values:
  - id: pair_bias
    label: projected pair bias
    kind: logit
    shape_contract:
      kind: tensor
      axes:
        - { id: batch, dimension: b }
        - { id: head, dimension: h }
        - { id: query_token, dimension: n }
        - { id: key_token, dimension: n }
steps:
  - id: project_pair_bias
    label: Project pair bias
    operation: pair_bias_projection
    shape_rule: pair_bias_projection
    inputs: [ports.pair_context]
    outputs: [values.pair_bias]
    code: "pair_bias = project_pair(pair_context)"
  - id: add_pair_bias
    label: Add pair bias
    operation: pair_bias_add
    shape_rule: preserve
    inputs: [ports.single_state, values.pair_bias]
    outputs: [ports.updated_single_state]
    code: "updated_single_state = attend(single_state, bias=pair_bias)"
visual_template:
  grid: { columns: 3, rows: 2 }
  nodes:
    - { id: pair_context, ref: ports.pair_context, col: 1, row: 2 }
    - { id: project_pair_bias, ref: steps.project_pair_bias, col: 2, row: 2 }
    - { id: pair_bias, ref: values.pair_bias, col: 3, row: 2 }
    - { id: single_state, ref: ports.single_state, col: 1, row: 1 }
    - { id: add_pair_bias, ref: steps.add_pair_bias, col: 2, row: 1 }
    - { id: updated_single_state, ref: ports.updated_single_state, col: 3, row: 1 }
  segments:
    - id: attention_weights
      label: Compute attention weights
      description: Form and normalize the conditioned attention logits.
      node_refs: [ports.pair_context, steps.project_pair_bias, values.pair_bias]
evidence_policy:
  generic_definition: The template is vocabulary, not method evidence.
  usage_requires:
    - Evidence that the pair projection is added to attention logits.
```

Each variant lists the exact reusable steps it enables. A step is the sole
owner of its operation, input/output flow, code-like trace, and optional TeX;
the visual template only places stable local refs. This avoids maintaining a
separate internal graph, pseudocode program, and math list that can drift.

Optional `visual_template.segments` expose a reading order inside a dense
reusable block without inventing algorithm steps. A segment references local
facts already placed in `visual_template.nodes`; it does not own copies of
their labels, operations, or edges. Segment memberships may not overlap. The
compiler converts active `node_refs` to instance-board node IDs, preserves
source order as phase order, and drops a segment only when the selected variant
contains none of its members. Both the primary and comparison board surfaces
render these as subtle labeled enclosures. Segments that should retain their
independent horizontal bounds while sharing a common top and bottom may declare
the same `vertical_alignment_group`.

## Concrete Architecture Use

```yaml
block_instances:
  - id: structure_ipa
    block_ref: standard_blocks/invariant-point-attention.yaml
    subject_ref: modules.invariant_point_attention
    variant: full_ipa
    use_scope: whole_module
    conformance: exact
    port_bindings:
      - port_ref: ports.single_state
        relation_refs: [relations.decoder_single_state_enters_ipa]
      - port_ref: ports.pair_context
        relation_refs: [relations.refined_pair_features_bias_ipa]
      - port_ref: ports.frames
        relation_refs: [relations.decoder_frames_condition_ipa]
      - port_ref: ports.mask
        relation_refs: [relations.feature_bundle_masks_ipa]
        selector: token_struct_frame_mask
      - port_ref: ports.ipa_delta
        relation_refs: [relations.ipa_produces_delta]
    parameter_bindings:
      - parameter_ref: parameters.c_hidden
        configuration_ref: reference_configuration.ipa_hidden_feature_dimension
      - parameter_ref: parameters.h
        configuration_ref: reference_configuration.ipa_heads
      - parameter_ref: parameters.p_q
        configuration_ref: reference_configuration.ipa_query_key_points
      - parameter_ref: parameters.p_v
        configuration_ref: reference_configuration.ipa_value_points
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: InvariantPointAttention.forward
```

Port bindings name relations only; they never copy endpoints, carried
representations, or concrete boundary shapes. The compiler resolves those
facts from the architecture. Parameter bindings name architecture-owned
configuration facts (or, when unavoidable, an explicit literal); they do not
rewrite the template's symbolic contracts. One relation may satisfy several internal roles
(for example, one self-attention state supplies Q, K, and V), while each public
port has one binding object and declares whether it accepts one or many
relations.

## Symbolic Shapes and Resolution

Every v0.3 port and internal value declares a structured `shape_contract`.
Axes reference stable symbolic parameters rather than a particular model's
numbers. Tensor bundles such as Q/K/V use a `tuple` contract, so different
query/key and value widths remain explicit without splitting one visual node
into three unrelated facts. Semantic geometry uses `kind: frames`; its batch
and token axes still participate in unification while the frame glyph keeps
the rigid-transform meaning.

Parameters declare how they are solved:

- `resolution: boundary` unifies against the representation carried by a
  bound canonical relation. This normally determines batch/token axes and
  input/output channel widths.
- `resolution: instance` must be supplied by `parameter_bindings`, usually by
  reference to an evidence-bearing `reference_configuration` fact. Head count,
  hidden head width, and point counts belong here because boundary tensors do
  not determine them.

The compiler resolves the selected variant only, substitutes the complete
parameter solution into every active shape contract, and applies deterministic
`shape_rule` checks. The initial vocabulary covers projection/head splitting,
attention logits, logit composition, softmax, weighted scalar/point/pair
aggregation, concatenation/output projection, residual preservation, and rigid
application/inversion. Rules are compiler-owned; neither pseudocode nor
arbitrary framework expressions are interpreted.

Conflicting boundary dimensions, missing instance parameters, unknown
parameters, ambiguous carried representations, unresolved symbols, and typed
operation mismatches are hard validation failures. Resolved shapes and their
provenance are emitted into the compiled instance and its reusable detail
board; they are not written back into architecture or view YAML.

## Honest Reuse and Reductions

`use_scope` distinguishes a whole-module reuse from an
`internal_mechanism`. `conformance` makes the relationship visible:

- `exact`: the selected variant covers the whole subject interface; every
  non-control incident relation must be bound.
- `wrapped`: the reusable core is present, but architecture-specific residual,
  normalization, transition, or other wrapper behavior changes its boundary.
- `reduced`: the architecture intentionally removes or replaces parts of the
  general mechanism.

`wrapped` and `reduced` instances require `difference_summary`. A reduction
should also select an explicit reduced variant rather than relying on prose
alone. For example, Genie 3's latent update uses pair bias and pair-value
aggregation but omits IPA's frame-aware point terms; the reusable occurrence
is therefore shown as a reduced variant, not mislabeled as full IPA.

## Reusable Detail Board

```yaml
- id: structure_ipa_internals
  kind: standard_block_instance
  title: Invariant Point Attention Internals
  summary: Reused full-IPA anatomy at this concrete architecture boundary.
  parent: structure_decoder
  subject_ref: modules.invariant_point_attention
  expansion_depth: 0
  block_instance_ref: block_instances.structure_ipa
```

The parent module occurrence uses the normal explicit
`board_ref: structure_ipa_internals`. The stub owns navigation identity and
prose; its template owns the internal layout. A reusable board may explain a
canonical `leaf` module because it is algorithm anatomy, not new architecture
child membership.

## Evidence and Question Context

A template's `evidence_policy` states what a concrete use must prove. The
architecture instance carries the actual evidence. Question packets preserve
both layers: `template_fact_ref` identifies a reusable step/value, while
`block_instance_ref`, selected variant, conformance, port bindings, and bound
relation evidence identify the method-specific occurrence.

## Compatibility

Existing `standard-block-v0.1` files and v0.2 typed blocks remain readable.
New parameterized reusable internals use v0.3 and `block_instances`; do not
author the same use through multiple mechanisms.

Current typed blocks:

- `standard_blocks/pair-biased-attention.yaml` (`standard-block-v0.2`)
- `standard_blocks/invariant-point-attention.yaml` (`standard-block-v0.3`)

Legacy v0.1 blocks remain in `standard_blocks/` until migrated when a concrete
architecture needs typed reuse.
