# Fact Ownership and Derived Interfaces v0.1

Status: **implemented by architecture-v0.5**.

The durable source must contain one editable copy of every architectural fact.
References may connect facts, and the generated manifest may materialize
convenience fields, but authors must not keep two endpoint or interface lists in
sync by hand.

Reusable `block_instances` follow the same rule. They bind named template
ports to `relations.*` and derive endpoints and carried representations from
those relations. A standard block owns generic internal steps; its concrete
instance owns the selected variant, conformance, and usage evidence.
Template-internal edges are explanatory and never enter canonical relations.

## Ownership Matrix

| Fact | Durable owner | Referenced by | Derived at build time |
| --- | --- | --- | --- |
| Flow identity, endpoints, kind, carried representations, operation, evidence | `relations[]` | boards, conditioning, scale transitions, pseudocode | projected edges and value-site interfaces |
| Reusable tensor/stream type and scale | `representations[]` | value sites and relations | transition endpoint scales |
| Concrete value occurrence, scope, boundary, local role | `value_sites[]` | relations, boards, state groups | producers, consumers, incoming/outgoing relation refs |
| Module containment | each module's `parent_ref` | boards/projector | hierarchy depth and collapsed boundaries |
| Decomposition closure | each scope's `decomposition.status` | coverage compiler | child counts, breadth scopes, and depth frontiers |
| Conditioning mechanism | `conditioning[]` | renderer badges and comparisons | source and target from `relation_ref` |
| State lifecycle grouping | `state_semantics` | renderer and comparisons | per-site lifecycle lookup |
| Scale-change interpretation | `scale_transitions[]` | renderer and comparisons | endpoints, scales, projection modules, and index value |
| Board curation and presentation | `views/*.view.yaml` | projector | visible edges from canonical relations |
| Reusable algorithm anatomy | `standard_blocks/*.yaml` | `block_instances[]` | instance-scoped trace and internal detail scene |
| Concrete reusable use | `block_instances[]` | reusable board stubs and question context | resolved port endpoints and relation evidence |

## Architecture-v0.4 Rules

### Relations own flow

Modules do not author `inputs` or `outputs`. A module interface is the set of
canonical relations entering and leaving that module. Likewise,
`state_semantics` does not author `produced_by`, `consumed_by`, or `updated_by`.
Those lists are projections of relations around concrete value sites.

### Conditioning references one relation

```yaml
conditioning:
  - id: block_adaln_zero
    relation_ref: relations.cond_vector_enters_adaln_mlp
    mode: adaln_zero
    updates_source: false
```

The conditioning entry owns the mechanism. It must not repeat `source` or
`target`; the builder resolves both from `relation_ref`.

### Scale transitions reference an ordered path

```yaml
scale_transitions:
  - id: item_to_group_pool
    relation_path:
      - relations.encoded_item_state_enters_group_pool
      - relations.item_to_group_pool_produces_group_state
    index_relation_ref: relations.item_to_group_index_guides_pooling
    aggregation: scatter_mean
    copy_vs_pool: pool
```

The transition owns the interpretation of a scale change. It must not repeat
`source`, `target`, `from_scale`, `to_scale`, `projection`, or `index_map`.
The path must be non-empty, ordered, continuous, and run from a value site to a
value site. `index_relation_ref`, when present, must identify an `index_flow`
relation.

### State semantics group concrete occurrences

```yaml
state_semantics:
  sampling_latent:
    representation_ref: representations.input_latent
    value_site_refs:
      - value_sites.latent_before_step
      - value_sites.latent_after_step
    lifecycle: iterative_loop_state
    notes:
      - Before and after sites distinguish x_t from x_(t-1).
```

The value site's `role` owns whether that occurrence is a read, write,
conditioning value, or output. The state group owns only the shared lifecycle
interpretation and explanatory notes. Every referenced site must use the
group's representation, and a site may belong to at most one state group.

## Generated Manifest Fields

`architecture-manifest-v0.5` intentionally materializes convenient read-only
indexes:

- `valueSiteInterfaces`: incoming/outgoing relation refs and producer/consumer
  refs derived from canonical relations;
- `stateSemanticsBySite`: lifecycle groups indexed by concrete value-site ID;
- conditioning `source` / `target`: resolved from `relation_ref`;
- scale-transition `source`, `target`, endpoint scales, projection refs, and
  index map: resolved from its relation references;
- `coverage.scopes`: child refs/counts and hierarchy depths derived from
  `parent_ref`, combined with explicit decomposition closure statuses.

These are compiler output, not authoring fields. They make the renderer simple
without creating a second durable source of truth.

## Enforcement

`scripts/lint_sources.rb` rejects forbidden duplicate fields, missing or
discontinuous paths, dangling refs, representation mismatches, and repeated
state-group membership. `renderer/architecture/build-manifest.rb` resolves the
same references and fails rather than guessing when a dependency is missing.
The semantic projector continues to derive board edges exclusively from
canonical relations.
