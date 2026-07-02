# Standard Visual Blocks v0.1

Standard blocks are reusable visual/mathematical motifs. They are smaller than
an architecture and larger than a single pseudocode line.

Examples:

- pair-biased attention;
- per-token AdaLN conditioning;
- per-atom AdaLN-Zero conditioning;
- additive single conditioning;
- coordinate injection;
- atom-to-token scatter mean;
- token-to-atom gather;
- local window attention;
- atom-to-token aggregation;
- IPA point-distance attention;
- triangular pair update;
- diffusion denoising step.

The goal is that architecture and pseudocode sources can reference a standard
block instead of each story hardcoding a new diagram.

## Standard Block Shape

```yaml
schema_version: protein-standard-block-v0.1
id: pair_biased_attention
name: Pair-Biased Attention
kind: attention
description: Add projected pair features to QK attention logits.
inputs: []
outputs: []
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
  - id: token_pair_bias_add
    operation: pair_bias_add
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    visual:
      block: pair_biased_attention
      slots:
        query: q
        key: k
        value: v
        pair: z
        logits: logits
```

## Referencing A Block From Architecture

```yaml
modules:
  - id: token_transformer
    attention:
      pattern: full
      pair_bias: true
      standard_block_ref: standard_blocks/pair-biased-attention.yaml
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
does not by itself prove that a specific model uses the motif. Specific usage
must still be attached to architecture or pseudocode evidence.

## Current Block Files

- `standard_blocks/pair-biased-attention.yaml`
- `standard_blocks/per-token-adaln-conditioning.yaml`
- `standard_blocks/per-atom-adaln-zero.yaml`
- `standard_blocks/additive-single-conditioning.yaml`
- `standard_blocks/coordinate-injection.yaml`
- `standard_blocks/atom-to-token-scatter-mean.yaml`
- `standard_blocks/token-to-atom-gather.yaml`
