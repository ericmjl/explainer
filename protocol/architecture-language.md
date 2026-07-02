# Architecture Language v0.1

This is a small source format for describing system architectures without
hardcoding each explanation into HTML or JavaScript.

The goal is not to be complete on day one. The goal is to make every story and
comparison use the same vocabulary, so a renderer can turn the same source
into cards, diagrams, masks, equations, and comparison tables.

## Design Principles

- Separate architecture facts from presentation.
- Track evidence for every non-obvious claim.
- Describe scale changes explicitly: item, group, pair/context, global, output.
- Represent attention and conditioning as first-class operations.
- Mark unknowns as unknown instead of filling gaps from memory.
- Support prediction, generation, retrieval, planning, and control systems
  with the same primitives.

## Top-Level Shape

```yaml
schema_version: architecture-v0.1
id: stable_machine_id
name: Human Readable Name
family: transformer | diffusion | retrieval | planner | graph | other
status: draft | partial | reviewed
task_modes:
  - prediction
  - generation
sources: []
execution: {}
state_semantics: {}
conditioning: []
scale_transitions: []
training_inference: {}
representations: []
modules: []
edges: []
claims: []
open_questions: []
```

## Evidence Levels

Use one of these on claims, modules, and important fields:

```yaml
evidence:
  status: confirmed_from_code | confirmed_from_paper | confirmed_from_docs | inferred | unknown
  refs:
    - kind: code
      path: repo/relative/path.py
      lines: "492-557"
      note: optional short description
```

Interpretation:

- `confirmed_from_code`: directly inspected implementation.
- `confirmed_from_paper`: directly supported by paper/supplement.
- `confirmed_from_docs`: directly supported by project documentation or spec.
- `inferred`: reasonable inference from connected facts; say what was inferred.
- `unknown`: intentionally unset.

## Representations

Representations are named streams or tensors carried through the architecture.

```yaml
representations:
  - id: item_state
    scale: item
    semantic_role: mutable per-item latent state
    shape: "B x N_item x d_item"
    carries:
      - local features
      - positional features
    evidence: {}

  - id: pair_context
    scale: item_pair
    semantic_role: pair/context conditioning
    shape: "B x N_item x N_item x d_pair"
```

Common scales:

- `item`
- `item_pair`
- `group`
- `group_pair`
- `global`
- `memory`
- `output`
- `abstract`

## Execution

Execution describes loops, cached state, and phase-specific behavior that is
not visible from a static block diagram.

```yaml
execution:
  loops:
    - id: refinement_loop
      repeats: num_refinement_steps
      reruns:
        - item_encoder
        - group_refiner
        - output_decoder
      cached:
        - pair_context
        - masks
      notes:
        - context may be cached across refinement steps when valid
  cached_state:
    - id: attention_mask
      produced_by: input_adapter
      consumed_by: item_encoder
      scope: model_call
```

Use this section for recurrent trunks, sampling loops, planning loops,
retrieval caches, stop-gradient loops, and inference-only reuse.

## State Semantics

State semantics say whether a representation is mutable model state, read-only
conditioning, a cache, or an output.

```yaml
state_semantics:
  pair_context:
    role: read_only_conditioning
    produced_by: context_builder
    updated_by: []
    consumed_by:
      - group_refiner
    notes:
      - projected to attention logits but not returned updated
  group_state:
    role: mutable_state
    produced_by: item_to_group_pool
    updated_by:
      - group_refiner
    consumed_by:
      - output_decoder
```

Common roles:

- `mutable_state`
- `read_only_conditioning`
- `static_conditioning`
- `cached_state`
- `index_map`
- `output_state`
- `output_update`

## Modules

Modules are blocks, stacks, heads, losses, samplers, adapters, or data
transforms.

```yaml
modules:
  - id: item_encoder
    label: Item Encoder
    kind: attention_stack
    role: update item state with local context
    scale: item
    repeats: 3
    pseudocode_ref: pseudocode/example.yaml
    depth:
      blocks: 3
      heads: 8
    contains:
      - id: local_attention
        label: Local item attention
        standard_block_ref: standard_blocks/pair-biased-attention.yaml
    inputs:
      - item_state
      - pair_context
    outputs:
      - item_state
    attention:
      pattern: local
      query_scale: item
      key_value_scale: item
      pair_bias: true
      pair_bias_source: pair_context
      standard_block_ref: standard_blocks/pair-biased-attention.yaml
    evidence: {}
```

Optional navigation fields:

- `story_ref`: curated story to open when this unit is focused.
- `pseudocode_ref`: line-by-line algorithm/code trace.
- `standard_block_ref`: reusable canonical motif.
- `contains`: child units used for hover peeks and drilldown.
- `repeats`: compressed repetition count for stacks.

## Attention Operation Fields

```yaml
attention:
  pattern: full | local | sparse | cross | recurrent | graph | custom
  query_scale: item | group | memory
  key_value_scale: item | group | memory
  query_subset_size: 32
  key_value_subset_size: 128
  window:
    kind: contiguous | nearest_neighbor | full | custom
    size: 128
  heads: 8
  pair_bias: true | false | unknown
  pair_bias_source: pair_context | group_pair_context | none | unknown
  positional_encoding:
    kind: rope | relative_position | learned | none | unknown
  extra_terms:
    - distances
    - recency
    - relation_type
```

## Conditioning

Conditioning describes how one representation influences a target without
necessarily becoming that target's mutable state. Different conditioning modes
are not interchangeable, so encode the mode explicitly.

```yaml
conditioning:
  - id: group_pair_bias
    source: pair_context
    target: group_refiner.attention_logits
    mode: pair_bias
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    updates_source: false
  - id: per_item_adaln
    source: conditioning_signal
    target: item_encoder
    mode: per_item_adaln
    standard_block_ref: standard_blocks/per-item-adaln-conditioning.yaml
```

Common modes:

- `pair_bias`
- `per_item_adaln`
- `additive_injection`
- `concat`
- `cross_attention`
- `gate`

## Scale Transitions

Scale transitions describe compression, broadcast, pooling, and reshaping with
enough structure to distinguish pooling from copying.

```yaml
scale_transitions:
  - id: item_to_group_pool
    from_scale: item
    to_scale: group
    source: item_state
    target: group_state
    projection: item_to_group_linear
    index_map: item_to_group_index
    aggregation: scatter_mean
    copy_vs_pool: pool
  - id: group_to_item_broadcast
    from_scale: group
    to_scale: item
    source: group_state
    target: item_output_state
    projection: group_to_item_linear
    index_map: item_to_group_index
    aggregation: gather
    copy_vs_pool: copy
```

Prefer this section over encoding important scale jumps only as edge prose.

## Edges

Edges describe how information moves between representations and modules.

```yaml
edges:
  - from: item_encoder
    to: group_refiner
    carries:
      - group_state
    operation: item_to_group_pool
    evidence: {}
```

## Claims

Claims are short statements that stories or comparisons can display directly.

```yaml
claims:
  - id: pair_context_is_bias_not_state
    statement: The pair/context stream biases attention but is not updated by the attention stack.
    scope:
      module: group_refiner
    evidence:
      status: confirmed_from_docs
      refs: []
```

## Training And Inference

Architecture alone often misses method behavior. Use this section for
objectives, schedules, samplers, teacher forcing, self-conditioning, caching,
and deployment notes.

```yaml
training_inference:
  objective:
    kind: classification | regression | denoising | flow_matching | unknown
  schedule:
    kind: diffusion | curriculum | none | unknown
  sampler:
    kind: one_shot | iterative | beam_search | ode_solver | unknown
  teacher_forcing: unknown
  self_conditioning: unknown
  checkpoint_notes: []
```

## Open Questions

Open questions are part of the source format. Do not bury them in prose.

```yaml
open_questions:
  - id: context_update_path
    question: Is the pair/context state updated or only injected?
    status: unresolved
```

## Renderer Contract

A renderer should be able to:

- draw modules as nodes;
- draw edges from `edges`;
- color nodes by `scale`;
- display attention masks from `attention.pattern` and window fields;
- display control-flow loops and cached state from `execution`;
- distinguish mutable state from conditioning with `state_semantics`;
- render common conditioning and scale-transition motifs from standard blocks;
- build comparison tables from normalized module and attention fields;
- show confidence/evidence badges from `evidence.status`;
- link each claim to source refs.
