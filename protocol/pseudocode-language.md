# Pseudocode Language v0.1

This source format records algorithm or code traces that can be linked back to
architecture modules, representations, claims, and standard visual blocks.

## Top-Level Shape

```yaml
schema_version: pseudocode-v0.1
id: stable_trace_id
title: Human Readable Trace
sources:
  - id: implementation
    kind: code
    path: src/model.py
    note: optional note
symbols: []
lines: []
claims: []
```

## Symbols

Symbols give names, roles, shapes, and optional architecture refs:

```yaml
symbols:
  - id: item_state
    name: x
    type: representation
    shape: "B x N_item x d"
    architecture_ref: representations.item_state
```

Common symbol types:

- `input`
- `representation`
- `conditioning`
- `mask`
- `index_map`
- `parameter`
- `output`

## Lines

Lines are the durable trace units. Keep them short enough to map to a visual
highlight or source reference.

```yaml
lines:
  - id: pair_bias_refine
    text: "g = Refiner(g, pair_bias=Linear(LayerNorm(c)))"
    operation: pair_bias_add
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    inputs: [group_state, pair_context]
    outputs: [group_state]
    architecture_refs:
      - modules.group_refiner
    source_refs:
      - source: implementation
        lines: "120-140"
    visual:
      block: pair_biased_attention
      slots:
        query: group_state
        key: group_state
        value: group_state
        pair: pair_context
```

Common operations:

- `projection`
- `attention_logits`
- `pair_bias_add`
- `adaptive_modulation`
- `additive_injection`
- `scatter_mean`
- `gather`
- `cross_attention`
- `output_projection`

## Claims

Claims attach explanatory statements to trace lines:

```yaml
claims:
  - id: pair_context_read_only
    statement: Pair/context state is used as bias and is not returned updated.
    line_refs: [pair_bias_refine]
    evidence:
      status: confirmed_from_code
      refs: []
```

## Visual Hooks

`visual.block` should reference a standard block ID. `visual.slots` binds
trace symbols to standard-block input/output slots. The linter checks that
slot names exist in the referenced block.

## Renderer Contract

A renderer should be able to:

- list pseudocode lines next to architecture modules;
- filter lines by `architecture_refs`;
- display standard-block equations from `standard_block_ref`;
- link a claim to the lines that support it;
- preserve source references without needing renderer-specific prose.
