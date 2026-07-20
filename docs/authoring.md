# Authoring Architecture Explanations

The explainer is source-first. Edit the declarative architecture sources;
avoid putting architecture facts or hand-authored graph structure into the
browser renderer.

For the full operational rules, read [`AGENTS.md`](../AGENTS.md). This guide is
the shorter human-oriented mental model.

## Source ownership

| Source | Owns |
| --- | --- |
| `architectures/*.yaml` | Module hierarchy, representations, value sites, relations, claims, and evidence. |
| `views/*.view.yaml` | Board membership, semantic depth, presentation overrides, and curated grid layout. |
| `pseudocode/*.yaml` | Scoped lexical traces bound to canonical architecture facts. |
| `standard_blocks/*.yaml` | Reusable algorithms, typed ports, variants, and internal steps. |
| `comparisons/*.yaml` | Evidence-backed alignments between facts already owned by two subjects. |
| `references/bibliography.yaml` | Canonical metadata for papers, code, documentation, and specifications. |

Each architectural information flow has one stable relation owner. Views do
not author ordinary edges: the semantic projector derives them from canonical
relations, including contracted paths through deliberately elided objects.
Pseudocode and comparisons also bind to stable facts instead of copying them.

## Current contracts

| Layer | Current contract | Compatibility |
| --- | --- | --- |
| Architecture facts | `architecture-v0.5` | All registered source sets use v0.5. |
| Semantic-zoom boards | `visualization-v0.4` | All registered views use v0.4. |
| Semantic pseudocode | `pseudocode-v0.2` | Registered v0.1 traces remain readable. |
| Reusable algorithms | `standard-block-v0.3` | Registered v0.1/v0.2 blocks remain supported. |
| Curated comparisons | `architecture-comparison-v0.1` | Registered through `comparison-registry-v0.1`. |
| Typed edit plans | `architecture-edit-v0.2` | v0.1 plans remain accepted. |
| Browser manifest | `architecture-manifest-v0.5` | Compiler output, not an authoring format. |
| Semantic layout | `semantic_flow_v1` | Produces reviewable `col`/`row` values in view YAML. |

Compiler versions are recorded in generated manifests. The current manifest
builder is `architecture-manifest-builder-v0.5.0`; semantic pseudocode and
comparisons are independently versioned as
`semantic-pseudocode-compiler-v0.3` and
`architecture-comparison-compiler-v0.1`.

## Edit an existing source set

For a bounded change supported by `architecture-edit-v0.2`, an author or LLM
proposes a typed plan. The deterministic editor resolves references, binds
source digests, validates the semantic diff, and applies the transaction:

```bash
ruby scripts/architecture_edit.rb prepare edits/change.yaml --out /tmp/change.prepared.yaml
ruby scripts/architecture_edit.rb show /tmp/change.prepared.yaml
ruby scripts/architecture_edit.rb apply /tmp/change.prepared.yaml
```

`apply` refuses a stale plan if the target architecture or view changed after
preparation. The plan is an editing boundary; canonical YAML remains the
durable artifact.

Reusable-block templates, block instances, comparison registration, and a new
source set are currently outside the edit-plan language. Make those changes
carefully in their declarative owners and run the same validation gates.

## Onboard a new architecture

The current transpiler does not inspect an arbitrary repository and discover a
model automatically. For a new method:

1. Treat the method repository as read-only implementation reference and pin
   the inspected revision.
2. Add bibliography metadata, architecture YAML, a root semantic-zoom view,
   and semantic pseudocode.
3. Register the source set in `architectures/index.yaml`.
4. Mark every assertion as confirmed, inferred, or open; do not invent missing
   internals.
5. Regenerate manifests and run the full source-set verifier.

Once registered, supported follow-up edits should use typed edit plans.

## Validate a change

After changing architecture, view, pseudocode, block, comparison, or
bibliography sources:

```bash
ruby renderer/architecture/build-manifest.rb
ruby scripts/verify_architecture.rb --source-set <id>
ruby renderer/architecture/build-manifest.rb --check
ruby scripts/lint_sources.rb
```

The source-set verifier is the final architecture gate. A board-scoped run is
useful while repairing one view, but does not replace the unscoped check:

```bash
ruby scripts/verify_architecture.rb --source-set <id> \
  --board <board-id> --format json
```

When schemas, validators, projection, compilation, or renderer infrastructure
change, run the relevant repository-wide suites listed in `AGENTS.md`.

## Review a draft

Start the loopback-only source-aware review workspace with:

```bash
ruby scripts/architecture_review.rb
```

It embeds the audience renderer and stages typed corrections through the same
validation pipeline. It is not part of the published static site.

## Precise specifications

The [protocol index](../protocol/README.md) routes to the architecture,
visualization, projection, layout, pseudocode, reusable-block, comparison,
evidence, and renderer contracts. Consult those documents when extending the
DSL or compiler rather than inferring a contract from generated JavaScript.
