# Protein Visualization Language v0.1

This is the presentation layer for the architecture and pseudocode DSLs.

It is a protein/molecule-aware visualization language, not a generic neural
network diagram language. It knows about atoms, tokens/residues, pairs, frames,
coordinates, ligand/pocket context, attention masks, and evidence traces.

## Core Idea

Architecture source defines **what exists**.

Pseudocode source defines **what happens line by line**.

Standard blocks define **reusable motifs**.

Visualization source defines **how a user navigates those things**.

```text
architecture YAML
  + pseudocode YAML
  + standard block YAML
  + story refs
  -> normalized graph
  -> protein-aware 2.5D renderer
```

## Design Principles

- Use 2D layout for semantic meaning.
- Use depth only for nesting, peeking, and focus.
- Keep exact geometry scenes optional and sidecar, not the default view.
- Make click-to-focus the primary interaction.
- Make hover-to-peek reversible and lightweight.
- Keep evidence visible at every level.
- Let curated stories override generic renderers.

## Layout Semantics

The renderer should reserve semantic axes:

```text
x-axis: information flow / execution order
y-axis: representation scale
        atom
        token / residue
        pair
        frame / coordinate
        ligand / pocket
depth: containment and focus affordance
       module contains block contains pseudocode contains evidence
```

Depth does not mean physical 3D. It means:

- the unit has internals;
- a hover can expose a preview;
- a click can promote it into the main focus view.

## Top-Level Shape

```yaml
schema_version: protein-visualization-v0.1
id: af3_diffusion_module_view
title: AF3 Diffusion Module
entry:
  architecture: architectures/af3-diffusion-module.yaml
default_view: overview
views: []
focus_rules: []
interaction: {}
```

## View Types

### Architecture Map

The coarse map of modules and edges.

```yaml
type: architecture_map
layout:
  x: dataflow
  y: representation_scale
  depth: containment
nodes:
  source: modules
edges:
  source: edges
```

Architecture-map nodes may declare visual hierarchy without changing the
architecture facts:

```yaml
nodes:
  - id: atom_attention_encoder
    module_ref: atom_attention_encoder
    prominence: primary
    treatment: block
    density: normal
  - id: atom14_padding_pipeline
    module_ref: atom14_padding_pipeline
    prominence: context
    treatment: chip
    density: micro
```

`prominence` controls visual importance:

- `primary`: central mechanism for the current board.
- `secondary`: useful supporting state or setup.
- `context`: required background or boundary condition, shown quietly.
- `hidden`: omitted from the canvas but still available to source/focus views.

`treatment` controls visual form:

- `block`: full card.
- `compact`: reduced card for supporting components.
- `chip`: small contextual marker.
- `annotation`: explanatory note attached to nearby blocks.
- `lane_marker`: scale or phase marker.

`density` controls how much content appears inside that visual form:

- `normal`: label, role, detail, and badges when available.
- `compact`: shorter card, clipped role text, minimal metadata.
- `micro`: label-only or label-plus-scale marker for boundary conditions,
  padding, masks, and other bookkeeping.

Use this for cases where the source must stay complete, but the board should not
claim that every preprocessing or bookkeeping component has equal architectural
weight.

### Module Focus

A focused view for one module.

```yaml
type: module_focus
module: diffusion_transformer
shows:
  - depth
  - heads
  - attention.pattern
  - contains
```

### Standard Block Focus

Renders a canonical block such as pair-biased attention.

```yaml
type: standard_block_focus
standard_block_ref: standard_blocks/pair-biased-attention.yaml
bindings:
  pair: z_ij
  logits: token_logits
```

### Pseudocode Stepper

Line-by-line algorithm or code explanation.

```yaml
type: pseudocode_stepper
pseudocode_ref: pseudocode/esmfold2-pair-bias-boundary.yaml
active_line: token_pair_bias_add
side_panels:
  - symbols
  - evidence
```

### Geometry Sidecar

An optional 3D or geometric panel. This should be used for concepts where
geometry is essential: frames, local-to-global transforms, 3D RoPE, atom clouds,
or ligand/pocket geometry.

```yaml
type: geometry_sidecar
engine: threejs | canvas2d | svg
enabled_for:
  - frame_geometry
  - 3d_rope
  - atom_coordinates
```

### Evidence Trace

Shows exact source paths, paper refs, and confidence status.

```yaml
type: evidence_trace
source_refs: from_active_line
```

## Interaction Semantics

```yaml
interaction:
  hover:
    action: peek
    shows:
      - internals_summary
      - one_canonical_repeated_block
      - evidence_badge
  click:
    action: focus
    resolution_order:
      - story_ref
      - standard_block_ref
      - pseudocode_ref
      - generated_yaml_inspector
  breadcrumbs: true
```

### Hover Peek

Hover should show enough internals to orient the user, not a full story.

Examples:

- `DiffusionTransformer x24` peeks one canonical transformer block.
- `AtomAttentionEncoder x3` peeks one local atom attention block.
- `Pair-Biased Attention` peeks the QK + pair-bias + softmax motif.

### Click Focus

Click should promote a unit to the main view.

Resolution order:

1. If the unit has `story_ref`, render that curated story.
2. Else if it has `standard_block_ref`, render the standard block focus.
3. Else if it has `pseudocode_ref`, render a line-by-line stepper.
4. Else render a generated inspector from architecture YAML.

## Protein-Specific Visual Primitives

Renderers should implement these primitive families:

- `scale_lane`: atom, token/residue, pair, frame/coordinate, ligand/pocket.
- `module_card`: block count, head count, scale, evidence.
- `attention_matrix`: rows/columns by query/key scale.
- `pair_matrix`: token-pair or residue-pair representation.
- `local_window_mask`: sequence-local atom/residue window.
- `frame_glyph`: local coordinate frame, rigid transform, point probe.
- `atom_cloud`: sparse atom positions or atom slots.
- `pseudocode_line`: line highlight with symbol bindings.
- `evidence_badge`: confirmed from code, confirmed from paper, inferred, unknown.

## Renderer Contract

A renderer should:

- load YAML sources;
- resolve `story_ref`, `standard_block_ref`, and `pseudocode_ref`;
- normalize modules into graph nodes;
- normalize edges into visible flows;
- use standard block specs for reusable motifs;
- expose hover peek and click focus;
- keep breadcrumbs;
- render evidence status at all abstraction levels;
- allow a curated story to override generated views.

## Anti-Goals

- Do not draw a physical 3D model for every architecture.
- Do not encode important semantics only as z-position.
- Do not duplicate standard motifs per story.
- Do not pretend inferred fields are confirmed facts.
