# Architecture Comparison Protocol v0.1

Status: **implemented** by
`schemas/architecture-comparison-v0.1.schema.json`,
`lib/architecture_comparison_contract.rb`, and
`lib/architecture_comparison_compiler.rb`.

An architecture comparison is a curated lens over existing source facts. It
does not become a third owner of modules, relations, reusable-block anatomy,
or board scenes.

## Start With A Question

Every comparison begins with a narrow question that can be answered from
stable facts on both sides:

```yaml
question: What does reduced attention retain and remove relative to full IPA?
```

The two subjects each name a registered source set, a stable subject fact, and
the board on which the subject is shown:

```yaml
subjects:
  primary:
    label: Reduced latent attention
    source_set: genie3
    subject_ref: block_instances.latent_reduced_pair_attention
    board_ref: genie3_reduced_pair_attention_internals
  counterpart:
    label: Full frame-aware IPA
    source_set: genie3
    subject_ref: block_instances.structure_ipa
    board_ref: genie3_ipa_internals
```

`primary` is the board the reader started from. `counterpart` is the additional
board being compared. Their visual placement is renderer policy rather than an
architecture fact.

## Groups And Alignments

Groups organize the answer into human-readable regions such as shared,
full-only, and reduced-only behavior. Alignments carry the actual mapping:

```yaml
groups:
  - id: shared
    label: Shared attention path
    description: Operations that play the same role on both sides.

alignments:
  - id: pair_bias
    group_ref: groups.shared
    label: Pair representation biases attention
    relationship: equivalent
    primary_refs:
      - block_instances.latent_reduced_pair_attention.steps.project_pair_bias
    counterpart_refs:
      - block_instances.structure_ipa.steps.project_pair_bias
    explanation: Both project pair features into an additive logit bias.
    evidence:
      status: confirmed_from_code
      refs: [...] # located evidence from both implementations
```

Relationships have precise side requirements:

- `equivalent`, `analogous`, and `changed` require facts on both sides.
- `primary_only` requires primary facts and an empty counterpart list.
- `counterpart_only` requires counterpart facts and an empty primary list.

For a reusable-block subject, every side fact must be instance-scoped and
active in that instance's selected variant. The contract resolves it against
the compiled standard-block board. A misspelled, inactive, or foreign-instance
fact is therefore rejected before rendering.

## Findings And Evidence

Findings summarize one or more alignments without copying their mappings:

```yaml
findings:
  - id: geometry_is_removed
    statement: The reduced path removes the frame-aware point path.
    alignment_refs:
      - alignments.frame_aware_point_path
      - alignments.output_fusion
    evidence:
      status: confirmed_from_code
      refs: [...] # evidence from both sides
```

Comparative absence must cite both sides. Showing that full IPA contains point
attention is not enough to prove that a reduced implementation omits it.
Unresolved issues remain first-class `open_questions` with
`evidence.status: open_question`.

## Registry And Compilation

`comparisons/index.yaml` is the only comparison registry. The architecture
registry's `comparisons` field points to `comparisons/index.yaml`; registry
entries are paths only, so titles and subject metadata keep one owner.

The deterministic compiler is versioned independently as
`architecture-comparison-compiler-v0.1`. It emits:

- stable subject source-set, subject, and board references;
- reusable-block variant and conformance metadata;
- ordered semantic groups and alignments;
- per-fact board `nodeIds` and template fact references for highlighting;
- findings, open questions, and evidence.

It deliberately does not copy either board scene. Source-set manifests remain
the owners of nodes and edges, and the renderer loads the two referenced boards
into reusable board surfaces.

The first registered source is
`comparisons/genie3-reduced-vs-full-ipa.yaml`.
