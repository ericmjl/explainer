# Source Validation and Compilation v0.1

Status: **current implemented acceptance contract**.

Architecture YAML is accepted only after a layered, fail-closed compiler
pipeline. A successful manifest build and a successful source lint now mean the
same thing: the manifest builder runs the repository linter before projection
or emission.

## Canonical Persistence Boundary

Committed YAML remains the sole editable semantic source. A future Python SDK
or wizard may construct an in-memory typed model and serialize it, but it must
not create a second independently editable copy of the same facts.

Generated manifests are deterministic renderer inputs. They are not authoring
sources or round-trip recovery formats.

## Validation Layers

```text
strict YAML parse
  -> executable JSON Schema validation
  -> bibliography and evidence compatibility
  -> typed-reference and relation checks
  -> fact-ownership validation
  -> decomposition-coverage validation
  -> semantic board projection
  -> deterministic manifest emission/check
```

### 1. Strict YAML

`lib/strict_yaml.rb` rejects duplicate mapping keys before Psych can apply its
normal last-value-wins behavior. Safe loading retains YAML aliases because the
current sources use anchors for repeated evidence objects.

### 2. Executable Structural Schemas

The implementation-independent source schemas are:

- `schemas/architecture-v0.4.schema.json`;
- `schemas/visualization-v0.4.schema.json`; and
- `schemas/bibliography-v0.1.schema.json`.

They use JSON Schema 2020-12 vocabulary. `lib/json_schema_subset.rb` evaluates
the subset used by this repository without adding a Ruby gem dependency. A
future Python frontend should consume the same schema files rather than
reimplementing their accepted fields and enums.

Schema JSON is loaded with the same fail-closed duplicate-key rule, so a
malformed executable contract cannot silently overwrite one of its own
keywords.

The schemas reject unknown fields. Extensible concepts use explicit bounded
locations, such as the `reference_configuration` property bag, rather than an
universal `extra` escape hatch.

### 3. Semantic Validation

`scripts/lint_sources.rb` adds checks that cannot be expressed within one
document's JSON Schema:

- bibliography references resolve;
- confirmed evidence cites a compatible source kind and includes a locator;
- code sources use an immutable 40-character revision and revision-pinned URL;
- typed references resolve;
- relation carries agree with concrete value-site endpoints;
- execution rerun/cache references resolve;
- open questions name affected facts;
- representation lanes map known canonical types to in-bounds authored rows,
  without overlapping refs or ambiguous family glyphs;
- ownership and decomposition invariants hold; and
- every board projects without omission, contraction, or drilldown ambiguity.

Schema diagnostics include a stable code and object path. Graph diagnostics
name stable semantic IDs so a future wizard can attach repairs to entities
rather than line positions.

## Evidence Acceptance

The certainty vocabulary is closed:

- `confirmed_from_code` requires at least one `code` source with a locator;
- `confirmed_from_paper` requires at least one `paper` source with a locator;
- `confirmed_from_docs` requires a `docs`, `spec`, `source`, or `protocol`
  source with a locator;
- `inferred` preserves a supported interpretation without claiming direct
  confirmation; and
- `open_question` records evidence relevant to an unresolved question.

Value sites and `training_inference` now carry evidence because occurrence,
boundary, and execution assertions can be wrong independently of their parent
module or representation.

## Deterministic Generation

Normal generation writes all registered manifests:

```bash
ruby renderer/architecture/build-manifest.rb
```

Check mode performs full validation, compiles in memory, and fails if any
committed manifest differs byte-for-byte:

```bash
ruby renderer/architecture/build-manifest.rb --check
```

Every manifest records the generator contract version and SHA-256 digest of
its bibliography, architecture, view, pseudocode, and standard-block inputs.
No timestamps or environment-dependent IDs are emitted.

## Agent-Facing Source-Set Verification

After an agent applies an architecture edit or bootstraps and registers a new
source set, it must run the read-only final gate:

```bash
ruby scripts/verify_architecture.rb --source-set genie3
```

The verifier emits a deterministic text report by default and structured JSON
for repair loops:

```bash
ruby scripts/verify_architecture.rb --source-set genie3 \
  --board reverse_diffusion_step --format json
```

Checks have stable IDs for registry resolution, strict YAML, source contracts,
source semantics and evidence, ownership, coverage, view navigation, board
layout, semantic projection, and manifest freshness. A successful unscoped
run means the registered source set satisfies the current static contracts:
bibliography and evidence-reference compatibility, typed references,
decomposition and ownership rules, pseudocode and standard-block references,
every-board projection, navigation and declarative grid invariants, and a
byte-reproducible generated manifest.

`--board` retains source-set-wide source and navigation checks while narrowing
layout and projection diagnostics to the named board. It is useful during
repair, but it is not the final handoff gate; rerun without `--board`.
`--format json` changes only presentation, not verification rules. The command
is non-mutating and exits `0` on success, `1` on verification failure, and `2`
for invalid CLI usage.

The `manifest` subcheck delegates to the canonical compiler's repository-wide
`--check` mode. A source-set run can therefore fail when another registered
source set or generated manifest is invalid or stale; the diagnostic names the
affected source or output. This is intentionally stronger than the preceding
source-set-scoped checks.

Verification establishes internal consistency, not truth or completeness. It
does not inspect the method repository, prove that a cited source supports a
claim, discover omitted modules or relations, prove that an author-declared
`complete` inventory is exhaustive, execute the model, validate remote URLs,
or judge rendered aesthetics such as edge crossings and text overflow.
Inferred facts, open questions, partial scopes, and opaque frontiers may remain
valid and must not be silently treated as confirmed. Repository-wide tests are
still required when changing schemas, validators, projection, compilation, or
renderer infrastructure.

## Draft Authoring

`status: draft` describes review maturity; it does not weaken structural
correctness. Canonical YAML must always parse and satisfy its schema. A future
wizard may hold an incomplete transaction in session state, but it should
write canonical files only after the transaction has explicit IDs and a
structurally valid partial architecture. Audience manifests always use the
full validation path.
