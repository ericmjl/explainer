# Architecture Comparison Protocol v0.1

Use this protocol before writing a comparison story. The point is to avoid
mixing levels: implementation details, paper diagrams, objective functions, and
training recipes should be compared on separate axes.

## 1. Define the Comparison Question

Bad:

```text
How is model A different from model B?
```

Good:

```text
Where does pair information enter atom-level and token-level attention?
```

Every comparison should name:

- methods being compared;
- architecture slice;
- task context;
- expected output artifact.

## 2. Fill One Architecture File Per Method

Create one YAML file under `architectures/` per method or method slice.

Minimum required sections:

- `representations`
- `modules`
- `edges`
- `claims`
- `open_questions`

Every non-obvious field should carry evidence.

## 3. Compare By Axes

Use these axes in order:

1. **Task and objective**: prediction, design, flow matching, diffusion, inverse
   folding, docking, pretraining.
2. **Representations**: atom, token/residue, pair, frame, ligand, pocket,
   sequence, coordinates.
3. **Information flow**: which streams update which other streams.
4. **Attention pattern**: full, local, triangular, pair-biased, IPA, equivariant,
   cross-attention.
5. **Geometry injection**: coordinates, distances, frames, RoPE, 3D RoPE,
   SE(3)-equivariance, invariant scalars.
6. **Conditioning**: ligand, sequence, MSA, templates, pair features, noisy
   coordinates, time/noise level.
7. **Scale transitions**: atom-to-token, token-to-atom, residue-to-atom,
   pair-to-single, single-to-pair.
8. **Output heads**: coordinates, sequence, atom occupancy, confidence,
   logits, velocity/noise prediction.
9. **Training or sampling**: diffusion, flow matching, recycling, iterative
   refinement, discrete decoding.
10. **Evidence quality**: code-confirmed, paper-confirmed, inferred, unknown.

## 4. Use Explicit Unknowns

If a field is unknown, write it as unknown:

```yaml
pair_bias: unknown
evidence:
  status: unknown
  refs: []
```

Do not omit the field when it is important to the comparison question.

## 5. Produce a Comparison Artifact

Comparison YAML files should live under `comparisons/`.

```yaml
schema_version: architecture-comparison-v0.1
id: concise_id
question: What exactly is being compared?
participants:
  - architectures/method_a.yaml
  - architectures/method_b.yaml
axes: []
findings: []
open_questions: []
```

Each finding should be source-backed:

```yaml
findings:
  - id: esmfold2_atom_encoder_no_pair_bias
    statement: Biohub ESMFold2 atom encoder does not add pair bias.
    evidence:
      status: confirmed_from_code
      refs:
        - path: /path/to/file.py
          lines: "836-840"
```

## 6. Promotion To Story

Promote a comparison into an interactive story only when at least one of these is
true:

- the comparison depends on a diagram;
- the comparison depends on an attention mask;
- the comparison has a meaningful drill-down path;
- the comparison is being reused often enough that a visual page will save time.

Until then, keep it as YAML plus `story.md`.
