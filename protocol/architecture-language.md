# Protein Architecture Language v0.1

This is a small source format for describing protein structure prediction and
structure design architectures without hardcoding each explanation into HTML or
JavaScript.

The goal is not to be complete on day one. The goal is to make every story and
comparison use the same vocabulary, so a renderer can later turn the same source
into cards, diagrams, masks, and comparison tables.

## Design Principles

- Separate architecture facts from presentation.
- Track evidence for every non-obvious claim.
- Describe scale changes explicitly: atom, token/residue, pair, frame, ligand,
  pocket, and global.
- Represent attention as a first-class operation.
- Mark unknowns as unknown instead of filling gaps from memory.
- Support prediction and design methods with the same primitives.

## Top-Level Shape

```yaml
schema_version: protein-architecture-v0.1
id: stable_machine_id
name: Human Readable Name
family: alphafold | esmfold | xymol | boltz | rf | other
status: draft | partial | reviewed
task_modes:
  - structure_prediction
  - structure_design
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
  status: confirmed_from_code | confirmed_from_paper | inferred | unknown
  refs:
    - kind: code
      path: /absolute/path/or/repo/relative/path.py
      lines: "492-557"
      note: optional short description
```

Interpretation:

- `confirmed_from_code`: directly inspected implementation.
- `confirmed_from_paper`: directly supported by paper/supplement.
- `inferred`: reasonable inference from connected facts; say what was inferred.
- `unknown`: intentionally unset.

## Representations

Representations are named streams or tensors carried through the architecture.

```yaml
representations:
  - id: atom_features
    scale: atom
    semantic_role: atom latent state
    shape: "B x N_atom x d_atom"
    carries:
      - element
      - atom_name
      - coordinates
    evidence: {}

  - id: pair_repr
    scale: token_pair
    semantic_role: pair conditioning
    shape: "B x N_token x N_token x d_pair"
```

Common scales:

- `sequence`
- `atom`
- `token`
- `residue`
- `token_pair`
- `residue_pair`
- `frame`
- `ligand`
- `pocket`
- `global`

## Execution

Execution describes loops, cached state, and phase-specific behavior that is not
visible from a static block diagram.

```yaml
execution:
  loops:
    - id: diffusion_sampling_loop
      repeats: num_sampling_steps
      reruns:
        - diffusion_conditioning
        - atom_encoder
        - token_transformer
        - atom_decoder
      cached:
        - pair_repr
        - atom_rope
        - masks
      notes:
        - z conditioning may be cached across diffusion steps when valid
  cached_state:
    - id: atom_encoder_attention_params
      produced_by: atom_encoder
      consumed_by: atom_decoder
      scope: diffusion_step | sampling_loop | model_call
```

Use this section for diffusion loops, recycling, recurrent trunks, cached masks,
stop-gradient loops, and inference-only reuse.

## State Semantics

State semantics say whether a representation is mutable model state, read-only
conditioning, a cache, or an output. This is where questions like "is z updated
or only injected?" should be answered directly.

```yaml
state_semantics:
  pair_repr:
    role: read_only_conditioning
    produced_by: diffusion_conditioning
    updated_by: []
    consumed_by:
      - token_transformer
    notes:
      - projected to attention logits but not returned updated
  token_repr:
    role: mutable_state
    produced_by: atom_encoder
    updated_by:
      - token_transformer
    consumed_by:
      - atom_decoder
```

Common roles:

- `mutable_state`
- `read_only_conditioning`
- `static_conditioning`
- `cached_state`
- `index_map`
- `coordinate_state`
- `output_update`

## Modules

Modules are blocks, stacks, heads, losses, samplers, or data transforms.

```yaml
modules:
  - id: atom_encoder
    label: AtomAttentionEncoder
    kind: attention_stack
    role: lift atom-local context into token context
    scale: atom
    repeats: 3
    story_ref: stories/af3-local-atom-attention/
    pseudocode_ref: pseudocode/example.yaml
    depth:
      blocks: 3
      heads: 4
    contains:
      - id: local_atom_attention
        label: Local atom attention
        standard_block_ref: standard_blocks/local-window-attention.yaml
    inputs:
      - atom_features
      - coordinates
    outputs:
      - token_context
    attention:
      pattern: sequence_local
      query_scale: atom
      key_value_scale: atom
      pair_bias: false
      standard_block_ref: standard_blocks/local-window-attention.yaml
      positional_encoding:
        kind: 3d_rope
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
  pattern: full | sequence_local | spatial_local | sparse | triangular | ipa | equivariant
  query_scale: atom | token | residue | frame
  key_value_scale: atom | token | residue | frame
  query_subset_size: 32
  key_value_subset_size: 128
  window:
    kind: contiguous_sequence | nearest_3d | token_full | custom
    size: 128
  heads: 4
  pair_bias: true | false | unknown
  pair_bias_source: pair_repr | atom_pair_repr | none | unknown
  positional_encoding:
    kind: rope | 3d_rope | frame_points | relative_position | none | unknown
  geometry_terms:
    - distances
    - frames
    - coordinates
```

## Conditioning

Conditioning describes how one representation influences a target without
necessarily becoming that target's mutable state. Different conditioning modes
are not interchangeable, so encode the mode explicitly.

```yaml
conditioning:
  - id: token_pair_bias
    source: pair_repr
    target: token_transformer.attention_logits
    mode: pair_bias
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    updates_source: false
  - id: token_adaln
    source: conditioning_single
    target: token_transformer
    mode: per_token_adaln
    standard_block_ref: standard_blocks/per-token-adaln-conditioning.yaml
```

Common modes:

- `pair_bias`
- `per_token_adaln`
- `per_atom_adaln_zero`
- `additive_injection`
- `coordinate_injection`
- `concat`
- `cross_attention`
- `gate`

## Scale Transitions

Scale transitions describe atom/token/pair/coordinate changes with enough
structure to distinguish pooling from copying.

```yaml
scale_transitions:
  - id: atom_to_token_mean_pool
    from_scale: atom
    to_scale: token
    source: atom_query_state
    target: token_repr
    projection: atom_to_token_linear
    index_map: atom_to_token_index
    aggregation: scatter_mean
    copy_vs_pool: pool
    standard_block_ref: standard_blocks/atom-to-token-scatter-mean.yaml
  - id: token_to_atom_gather
    from_scale: token
    to_scale: atom
    source: token_repr
    target: atom_query_state
    projection: token_to_atom_linear
    index_map: atom_to_token_index
    aggregation: gather
    copy_vs_pool: copy
    standard_block_ref: standard_blocks/token-to-atom-gather.yaml
```

Prefer this section over encoding important scale jumps only as edge prose.

## Edges

Edges describe how information moves between representations and modules.

```yaml
edges:
  - from: atom_encoder
    to: token_transformer
    carries:
      - token_context
    operation: atom_to_token_aggregation
    evidence: {}
```

## Claims

Claims are short statements that stories or comparisons can display directly.

```yaml
claims:
  - id: atom_encoder_no_pair_bias
    statement: Atom encoder attention does not add pair bias to logits.
    scope:
      module: atom_encoder
    evidence:
      status: confirmed_from_code
      refs: []
```

## Training And Inference

Architecture alone often misses method behavior. Use this section for objective,
noise/flow schedules, samplers, teacher forcing, self-conditioning, and
checkpoint compatibility notes.

```yaml
training_inference:
  objective:
    kind: denoising | flow_matching | score_matching | masked_language_modeling | unknown
  noise_schedule:
    kind: diffusion | flow | none | unknown
  sampler:
    kind: diffusion_sampling | ode_solver | ancestral | unknown
  teacher_forcing: unknown
  self_conditioning: unknown
  checkpoint_notes: []
```

## Open Questions

Open questions are part of the source format. Do not bury them in prose.

```yaml
open_questions:
  - id: token_conditioning_path
    question: Which exact token conditioning streams enter the atom decoder?
    status: unresolved
```

## Renderer Contract

A future renderer should be able to:

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
