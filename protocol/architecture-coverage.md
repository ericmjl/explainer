# Architecture Decomposition Coverage v0.1

Status: **implemented in architecture-v0.4 compilation**.

Coverage is a top-down declaration of how completely each architectural scope
has been decomposed. It does not guess how much of an unknown real system has
been captured, and it does not collapse coverage into a misleading percentage.

## The Necessary Author Assertion

The compiler can count declared children, but it cannot discover a component
that was never authored. Each scope therefore declares whether its current
child set is exhaustive:

```yaml
decomposition:
  status: complete
  evidence:
    status: confirmed_from_code
    refs:
      - source_ref: implementation_source
        role: implementation_evidence
        locator: relevant_symbol

modules:
  - id: sampler
    parent_ref: architecture
    decomposition:
      status: complete

  - id: external_decoder
    parent_ref: architecture
    decomposition:
      status: opaque
      reason: external_pretrained_component
```

The child inventory is never repeated inside `decomposition`. Module
membership remains owned by each child's `parent_ref`; the compiler derives
the child list and count. `status: complete` is the evidence-backed assertion
that the derived immediate child set is exhaustive.

## Statuses

- `complete`: the scope has children and the immediate child set is asserted
  exhaustive.
- `partial`: known children may be present, but the immediate child set is not
  yet exhaustive. A `reason` is required.
- `leaf`: an intentional terminal at the explainer's target granularity. It
  must not own child modules.
- `opaque`: a known component whose internals are intentionally not modeled.
  It must not own child modules and requires a `reason`.

`opaque` and `partial` answer different questions. An opaque component counts
toward complete parent breadth because the component itself is accounted for;
its depth is intentionally unresolved. A partial parent says the breadth at
that level may still be missing sibling components.

The root architecture carries its own `decomposition` entry and evidence.
Module decomposition claims inherit the enclosing module's normal evidence
unless a future source needs a more specific override.

## Compiler Invariants

For architecture-v0.4:

- the root and every module must declare one valid status;
- `complete` scopes must own at least one immediate module;
- `leaf` and `opaque` scopes must own no immediate modules;
- `partial` and `opaque` require a reason;
- a semantic-zoom board cannot expand a `leaf` or `opaque` subject; and
- hierarchy membership is always derived from `parent_ref`.

New scopes should begin as `partial`. Authors add immediate children and only
promote the scope to `complete` after checking an implementation, paper, or
specification.

## Compiled Coverage

`architecture-manifest-v0.4` includes `architecture.coverage`:

```yaml
method: declared_decomposition_closure
scopes:
  architecture:
    status: complete
    depth: 0
    immediateModuleCount: 3
    immediateModuleRefs:
      - modules.sampler
      - modules.inverse_scaling
      - modules.external_decoder
summary:
  scopeCount: 26
  expandedScopeCount: 5
  completeExpandedScopeCount: 5
  partialScopeCount: 0
  leafFrontierCount: 20
  opaqueFrontierCount: 1
  partialFrontierCount: 0
  maximumAuthoredDepth: 4
opaqueFrontierRefs:
  - modules.external_decoder
partialScopeRefs: []
```

This separates breadth closure from depth resolution:

- expanded complete/partial scopes describe breadth;
- leaf/opaque/partial frontiers describe where depth stops;
- maximum authored depth describes extent, not completeness.

No overall percentage is emitted because there is no defensible denominator
without first knowing the entire target architecture.

## Other Coverage Dimensions

Decomposition coverage is not board or evidence coverage:

- The semantic projector already accounts for every in-scope declared object
  as visible, collapsed, elided, depth-hidden, or excluded. Unaccounted board
  objects fail projection.
- Evidence status independently records which facts are confirmed, inferred,
  or open.
- Relation completeness may later receive its own closure assertion. A
  complete component inventory does not by itself prove that every information
  flow has been captured.
