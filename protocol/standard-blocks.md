# Standard Visual Blocks v0.1

Status: **implemented current reusable-block contract**.

Standard blocks are reusable visual/mathematical motifs. They are smaller than
an architecture and larger than a single pseudocode line.

Examples:

- pair-biased attention;
- per-item adaptive normalization;
- additive conditioning;
- local window attention;
- group pooling;
- broadcast/gather;
- recurrent refinement step.

The goal is that architecture and pseudocode sources can reference a standard
block instead of each story hardcoding a new diagram.

## Standard Block Shape

```yaml
schema_version: standard-block-v0.1
id: pair_biased_attention
name: Pair-Biased Attention
kind: attention
description: Add projected pair/context features to QK attention logits.
input_slots: []
output_slots: []
math:
  - id: add_pair_bias
    text: logits = qk_logits + pair_bias
    tex: "\\ell_{ijh} = \\ell^{qk}_{ijh} + b_{ijh}"
    operation: pair_bias_add
visual_template: {}
renderer_contract: {}
evidence_policy: {}
```

Each `math` item keeps a plain `text` fallback and may include `tex` for
MathJax rendering in focus panels. The TeX expression should describe the same
operation as `text`, not add architecture-specific facts that are absent from
the block or usage site.

## Referencing A Block From Pseudocode

```yaml
lines:
  - id: pair_bias_add
    operation: pair_bias_add
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    visual:
      block: pair_biased_attention
      slots:
        query: q
        key: k
        value: v
        pair: c
        logits: logits
```

## Referencing A Block From Architecture

```yaml
modules:
  - id: group_refiner
    parent_ref: architecture
    decomposition:
      status: leaf
    label: Pair-Biased Attention
    kind: attention
    mechanisms: [pair_biased_attention]
    role: update group features with pair/context logit bias
    scale: group
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    attention:
      pattern: full
      pair_bias: true
      standard_block_ref: standard_blocks/pair-biased-attention.yaml
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
```

## Renderer Contract

A renderer should be able to:

- read a block YAML file;
- bind a pseudocode line's symbols into the block's named slots;
- draw the canonical diagram for that block;
- show which source lines instantiate the block;
- vary the block by scale, mask, and positional encoding without rewriting the
  visual from scratch.

## Evidence Policy

Blocks are generic templates. A block file defines what the motif means, but it
does not by itself prove that a specific architecture uses the motif. Specific
usage must still be attached to architecture or pseudocode evidence.

## Current Block Files

- `standard_blocks/pair-biased-attention.yaml`
- `standard_blocks/per-item-adaln-conditioning.yaml`
- `standard_blocks/additive-conditioning.yaml`
- `standard_blocks/adaln-zero-conditioning.yaml`
- `standard_blocks/sinusoidal-timestep-embedding.yaml`
