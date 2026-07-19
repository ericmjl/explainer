# Semantic Pseudocode Language v0.2

Status: **implemented current semantic-trace contract**.

Semantic pseudocode and architecture boards are two projections of the same
facts. A statement owns readable code order; its `statement_ref`, symbols, and
lexical bindings connect that code to canonical architecture objects. The
renderer never parses an arbitrary code string to guess those connections.

The language works at every semantic-zoom level. A root trace may explain an
entire inference lifecycle, a child scope may explain one model stage, and a
reusable standard-block instance may own atomic mathematical steps. Authors
choose the level that teaches the mechanism; semantic does not mean atomic.

`pseudocode-v0.1` remains readable for registered legacy traces, but new or
migrated traces use the executable
`schemas/pseudocode-v0.2.schema.json` contract.

## Top-Level Shape

```yaml
schema_version: pseudocode-v0.2
id: example_trace
title: Example inference trace
sources:
  - id: implementation
    source_ref: canonical_code_source
root_scope: inference
scopes: []
symbols: []
lines: []
claims: []
```

The local source alias resolves through `references/bibliography.yaml`. A line
cites that alias with a precise `locator`; evidence-bearing claims cite the
canonical bibliography source directly.

## Hierarchical Scopes

Scopes describe lexical and explanatory nesting without copying child lists:

```yaml
root_scope: inference
scopes:
  - id: inference
    label: Model inference
    kind: program
    parent_ref: pseudocode
    subject_ref: architecture
  - id: sampling
    label: Reverse sampling
    kind: loop
    parent_ref: scopes.inference
    subject_ref: modules.diffusion_sampler
    execution_ref: execution.loops.reverse_diffusion_loop
  - id: denoiser
    label: One denoiser call
    kind: module
    parent_ref: scopes.sampling
    subject_ref: modules.denoiser
```

Exactly one scope, named by `root_scope`, has `parent_ref: pseudocode`. Every
other scope names one parent through `scopes.<id>`. The hierarchy must be
acyclic and reachable from the root. Every non-root scope must also be targeted
by at least one statement's `callee_scope_ref`; nesting represents executable
semantic calls, not unattached visual grouping.

The current scope kinds are `program`, `module`, `loop`, `block`, and
`function`. `subject_ref` binds the scope to `architecture`, a module, or a
block instance. A `loop` scope may additionally bind the
canonical repeat semantics through `execution_ref`. Scope membership is owned by `scope_ref` on
symbols and lines; scopes never repeat symbol, statement, or child lists.

## Lexical Symbols

A symbol is a semantic variable, not merely a formatted substring:

```yaml
symbols:
  - id: current_coordinates
    name: x_t
    tex: 'x_t'
    type: state
    scope_ref: scopes.sampling
    architecture_ref: value_sites.current_coordinates
```

Symbols defined in a scope are visible in that scope and its descendants.
Child-local symbols cannot leak into a parent or sibling trace. Prefer a
concrete `value_sites.*` binding; use `representations.*` only when the trace
genuinely describes a type rather than one occurrence.

`name` remains the source-like identifier used for deterministic bindings and
screen-reader text. When `tex` is present, the audience renderer displays that
bound variable through MathJax—so `s_5`, `z_5`, and `x_hat` read as proper
mathematical symbols—without changing its stable lexeme offsets or graph fact.
A small semantic HTML fallback preserves subscripts and common Greek symbols
while the optional CDN runtime starts, so raw TeX delimiters are never shown.

Do not copy `shape`, scale, or glyph onto a v0.2 symbol. The compiler follows
`architecture_ref` through a value site to its canonical representation and
derives those display facts. Legacy v0.1 symbols may retain authored shapes
until their source is migrated.

Use distinct symbols for distinct state versions. Write `s_i` and
`s_(i+1)`, or `single_in` and `single_out`, rather than representing a mutable
update as an ambiguous `s = f(s)` binding. Display aliases may remain familiar,
but semantic IDs and value-site refs stay distinct.

Supported symbol roles are `input`, `state`, `representation`,
`conditioning`, `mask`, `index_map`, `parameter`, `control`, and `output`.

## Statements and Fact Ownership

Every line binds one primary architectural fact:

```yaml
lines:
  - id: run_denoiser
    text: "x_hat = Denoiser(x_t, features, t)"
    comment: Predict one clean-coordinate estimate at the selected noise level.
    scope_ref: scopes.sampling
    statement_ref: modules.denoiser
    callee_scope_ref: scopes.denoiser
    operation: coordinate_denoising
    inputs: [current_coordinates, feature_bundle, timestep]
    outputs: [coordinate_prediction]
    architecture_refs: []
    source_refs:
      - source: implementation
        locator: Denoiser.forward
    code_bindings:
      - lexeme: x_hat
        symbol_ref: coordinate_prediction
        access: write
      - lexeme: Denoiser
        architecture_ref: modules.denoiser
        access: call
      - lexeme: x_t
        symbol_ref: current_coordinates
        access: read
      - lexeme: features
        symbol_ref: feature_bundle
        access: read
      - lexeme: t
        symbol_ref: timestep
        access: read
```

`statement_ref` is the whole-line hover identity and must resolve to a module,
value site, relation, or block instance. `architecture_refs` adds related
facts, such as a claim or execution loop; it need not repeat `statement_ref`.
The compiler prepends the statement fact to the emitted `architectureRefs` for
backwards-compatible filtering.

`callee_scope_ref` is optional. When present it must name an immediate child
scope whose `subject_ref` equals the line's `statement_ref`. It expresses
“open the semantic trace for this call” without copying the child statements.
A reusable algorithm call instead uses `block_instance_ref`; the selected
standard-block variant remains the sole owner of its detailed steps, values,
and equations.

Keep explanatory prose out of `text`. Use the optional `comment` field for a
short trailing note; the renderer places it on its own muted continuation line
and preserves `text` as clean, copyable pseudocode. Legacy inline `  # ...`
comments remain readable, but new v0.2 sources should author them separately.

For readable code, keep one logical statement per line, use spaces around
assignment and binary operators, and omit semicolons and terminal prose
punctuation. When a call genuinely needs several visual lines, author `text`
as a YAML block scalar with conventional continuation indentation and trailing
commas; do not depend on arbitrary mid-identifier wrapping.

## Code Bindings

`text` stays readable and source-like. `code_bindings` declares only its
interactive lexemes:

- `{lexeme, symbol_ref, access: read|write}` binds a variable occurrence;
- `{lexeme, architecture_ref, access: call}` binds an operation name to a
  module or reusable block instance.

Every declared input needs a read binding and every output needs a write
binding. The symbol must be lexically visible and its architecture fact must
exist. A call fact must be the statement fact or one of the line's related
architecture refs.

Bindings match whole identifiers using deterministic character offsets. Thus
the symbol `s` does not match the final letter of `logits`. One lexeme cannot
carry two meanings within one statement, and a write lexeme may occur only
once. Split a compound or mutable statement when those rules would be
ambiguous.

The compiler emits each binding as:

```yaml
lexeme: x_t
access: read
symbolId: current_coordinates
tex: x_t
architectureRef: value_sites.current_coordinates
occurrences:
  - start: 17
    end: 20
```

These offsets let the browser render safe spans without interpreting the code.
Hover or keyboard focus can highlight the matching board occurrence; focusing
a board fact can find all matching code spans through the same
`architectureRef`.

## High-Level and Atomic Traces

A model lifecycle may remain concise:

```python
features = build_features(request)
for t in schedule:
    x_next = reverse_step(x_t, features, t)
structure = export(x_final)
```

The `reverse_step` call can open a child scope containing frame construction,
denoising, and sampler math. A denoiser line can open another module scope. At
the atomic boundary, a `block_instance_ref` opens the reusable IPA or
pair-biased-attention trace. This creates one navigable hierarchy instead of
one enormous pseudocode listing.

High-level calls and child details may project the same boundary inputs and
outputs at different scopes. That is intentional abstraction, not duplicate
fact ownership: canonical shapes, relations, meanings, and evidence remain in
the architecture or standard block.

## Claims

Claims attach explanatory statements to trace lines:

```yaml
claims:
  - id: frames_are_derived
    statement: Frames are reconstructed from coordinates before denoising.
    line_refs: [derive_frames]
    evidence:
      status: confirmed_from_code
      refs:
        - source_ref: implementation_source
          role: implementation_evidence
          locator: build_frames
```

## Validation and Renderer Contract

`lib/pseudocode_contract.rb` validates scope topology, lexical visibility,
canonical facts, call targets, read/write completeness, and deterministic
lexemes. `lib/pseudocode_compiler.rb` emits
`semantic-pseudocode-compiler-v0.3` manifest data while preserving legacy line
fields.

A renderer can therefore:

- group a trace by semantic scope and filter lines by architecture facts;
- highlight a whole statement through `statementRef`;
- highlight exact variables and calls through compiled `codeBindings`;
- navigate a call through `calleeScopeRef` or `blockInstanceRef`;
- reverse-highlight pseudocode from a selected board fact; and
- preserve source and claim evidence without renderer-owned architecture
  prose.

Transient hover is not URL state. A pinned statement or symbol may be made
shareable, but navigation must use stable IDs rather than text offsets alone.
