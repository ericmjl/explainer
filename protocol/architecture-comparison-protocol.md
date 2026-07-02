# Architecture Comparison Protocol v0.1

This protocol is for comparing architecture slices without binding the
comparison to a specific domain.

## Start With A Question

Every comparison should begin with a concrete question:

```yaml
question: Where does pair/context information enter attention?
```

Good questions are narrow enough that the answer can be traced to modules,
representations, edges, and evidence.

## Comparison Axes

Common axes:

1. **Task and objective**: prediction, generation, denoising, planning,
   retrieval, control.
2. **Representations**: item, group, pair/context, memory, global, output.
3. **State semantics**: mutable state, read-only conditioning, cached state,
   output state.
4. **Attention pattern**: full, local, sparse, cross, graph, recurrent.
5. **Conditioning**: pair/context bias, adaptive normalization, additive
   injection, gates, cross-attention.
6. **Scale transitions**: item-to-group pooling, group-to-item broadcast,
   memory retrieval, output projection.
7. **Execution**: one-shot, looped refinement, recycling, sampling, cached
   inference.
8. **Output heads**: classification, regression, reconstruction, action, score.
9. **Evidence level**: confirmed from code, paper/spec, docs, inferred, open.

## Comparison Source Shape

```yaml
schema_version: architecture-comparison-v0.1
id: comparison_id
question: What exactly is being compared?
sources:
  - architectures/system_a.yaml
  - architectures/system_b.yaml
axes:
  - id: conditioning_boundary
    label: Conditioning boundary
    fields:
      - modules.attention.pair_bias
      - conditioning.mode
findings:
  - id: finding_id
    statement: Short evidence-backed statement.
    evidence:
      status: confirmed_from_code
      refs: []
open_questions: []
```

## Evidence Rules

- Do not compare from memory. Link each finding to architecture or pseudocode
  source refs.
- If one side is not checked, say so and mark it as `open_question`.
- Avoid over-normalizing: if two systems use the same label for different
  behavior, make that mismatch explicit.

## Output Shape

Render comparisons as:

- a short answer to the question;
- a table organized by comparison axes;
- findings ordered by confidence;
- unresolved questions preserved as first-class rows.
