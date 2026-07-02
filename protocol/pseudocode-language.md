# Pseudocode Language v0.1

This source format describes algorithms line-by-line and binds each line to
variables, architecture objects, claims, evidence, and visual scenes.

It is meant to sit beside `architecture-language.md`:

- architecture YAML says what modules and representations exist;
- pseudocode YAML says what an algorithm does step by step;
- story renderers use both sources to draw diagrams, masks, and variable views.

## Goals

- Preserve the useful structure of supplementary algorithms and implementation
  code without hardcoding story pages.
- Keep exact source references near the pseudocode line they support.
- Attach visual intent to algorithm lines.
- Support both paper algorithms and local code paths.
- Make it clear when a line is exact, paraphrased, simplified, or inferred.

## Copyright And Source Policy

For paper supplementary material, prefer short pseudocode labels plus source
references instead of copying large algorithm blocks verbatim. If an exact line
is needed, keep it short and mark it as `text_mode: exact_excerpt`.

For local code, use `source_refs` with path and line ranges. The pseudocode line
can be a simplified semantic line rather than a copy of implementation syntax.

## Top-Level Shape

```yaml
schema_version: protein-pseudocode-v0.1
id: stable_algorithm_id
title: Human Readable Algorithm Title
status: draft | partial | reviewed
linked_architecture: architectures/example.yaml
sources: []
symbols: []
lines: []
visual_scenes: []
claims: []
open_questions: []
```

## Sources

```yaml
sources:
  - id: af2_supp_algorithm_22
    kind: paper_supplement
    title: AlphaFold supplementary Algorithm 22
    locator: "Algorithm 22"
    url: optional

  - id: esmfold2_common
    kind: code
    path: /absolute/path/to/file.py
```

## Symbols

Symbols are variables, tensors, indices, masks, modules, or operations.

```yaml
symbols:
  - id: s_i
    label: s_i
    kind: representation
    scale: residue
    shape: "N_res x c_s"
    architecture_ref: representations.single_repr

  - id: z_ij
    label: z_ij
    kind: representation
    scale: residue_pair
    shape: "N_res x N_res x c_z"
```

Common symbol kinds:

- `representation`
- `module`
- `operation`
- `index`
- `mask`
- `logit`
- `weight`
- `coordinate`
- `frame`
- `claim`

## Lines

Each line is a semantic unit that renderers can highlight.

```yaml
lines:
  - id: project_qkv
    number: 2
    text: "q_i, k_i, v_i = Linear(s_i)"
    text_mode: simplified
    operation: projection
    inputs: [s_i]
    outputs: [q_i, k_i, v_i]
    architecture_refs:
      - modules.ipa
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    source_refs:
      - source: af2_supp_algorithm_22
        locator: "line 2"
    visual:
      scene: scalar_projection
      block: pair_biased_attention
      highlight:
        - s_i
        - q_i
        - k_i
        - v_i
```

`text_mode` values:

- `exact_excerpt`: short exact source text.
- `paper_symbolic`: faithful mathematical notation from a paper, lightly
  normalized.
- `simplified`: semantic pseudocode for teaching.
- `implementation_summary`: summarizes code behavior.
- `inferred`: not directly present as a line in the source.

## Operations

Use a compact vocabulary so renderers can recognize behavior:

- `projection`
- `normalization`
- `attention_logits`
- `attention_mask`
- `softmax`
- `weighted_sum`
- `coordinate_transform`
- `frame_transform`
- `rope`
- `window_attention`
- `pair_bias_add`
- `aggregation`
- `scatter`
- `sampling_step`
- `loss`
- `output_head`

## Standard Blocks

Use `standard_block_ref` when a line instantiates a reusable motif such as
pair-biased attention or local window attention.

```yaml
lines:
  - id: token_pair_bias_add
    operation: pair_bias_add
    standard_block_ref: standard_blocks/pair-biased-attention.yaml
    visual:
      scene: token_pair_bias_path
      block: pair_biased_attention
      slots:
        query: q
        key: k
        value: v
        pair: z
        logits: logits
```

The block defines the canonical diagram and named slots. The pseudocode line
binds concrete symbols from one model or paper into those slots.

## Visual Scenes

Scenes describe reusable visuals independent of HTML/JS.

```yaml
visual_scenes:
  - id: attention_mask
    type: mask_matrix
    title: Local atom attention mask
    axes:
      rows: query_atoms
      columns: key_value_atoms
    marks:
      - kind: query_block
        symbol: Q
      - kind: key_window
        symbol: K
```

Common scene types:

- `module_graph`
- `mask_matrix`
- `tensor_shapes`
- `frame_geometry`
- `attention_terms`
- `dataflow`
- `comparison_table`
- `source_trace`

## Claims

Claims can attach to one or more lines:

```yaml
claims:
  - id: no_pair_bias_in_atom_encoder
    statement: Atom attention does not consume pair bias.
    line_refs: [atom_transformer_call, swa_attention_forward]
    evidence:
      status: confirmed_from_code
      refs: []
```

## Renderer Contract

A renderer should be able to:

- show pseudocode lines with active highlights;
- map lines to visual scenes;
- show variable cards from `symbols`;
- connect lines to architecture modules through `architecture_refs`;
- show source/evidence badges per line;
- build a source trace from `source_refs`;
- support drilldown from a module diagram to pseudocode lines.
