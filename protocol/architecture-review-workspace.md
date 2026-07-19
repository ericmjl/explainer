# Architecture Review Workspace

Status: **Current local authoring interface**.

The review workspace supports the human phase after an architecture has been
drafted: read the paper and code, walk the explanation, correct confusing
prose, simplify a board, inspect the semantic diff, and publish the validated
result. It is an editorial cockpit, not a general admin panel.

Start it from the explainer repository:

```bash
ruby scripts/architecture_review.rb
```

Then open `http://127.0.0.1:4777/review/`. The service binds only to loopback.
The static audience renderer remains at `renderer/architecture/` and contains
no edit mode.

## Interaction Boundary

The left pane embeds the exact audience renderer. Its canonical selection
projection supplies only stable context: source set, board, occurrence and
typed ref for a node, or the ordered relation path for an arrow. The right
pane resolves that selection against current architecture and view sources.

For a component, the reviewer can stage:

- an everywhere explanation, which updates canonical `modules.*.role`;
- a board-only explanation, which updates the selected node occurrence's
  `role`; or
- a deliberate `elide` or reason-bearing `exclude` decision when projection
  permits it.

For an arrow, the reviewer edits board-owned presentation: its short label and
the `connection` title, role, and explanation of how the source is used inside
the target. Canonical relation identity, endpoints, operation, carried values,
and evidence are never editable through this form.

Names are read-only in the first interface. They are stable architecture or
code-derived identity, whereas explanatory prose is the intended review
surface.

## Transaction Lifecycle

Every browser action stages a typed operation in memory. There is no autosave.

```text
audience selection
  -> stage typed operation(s)
  -> one architecture-edit prepare + preview pass
  -> full source, projection, and manifest validation
  -> semantic diff + short-lived validated transaction
  -> explicit Apply
  -> recheck every expected file digest
  -> atomic YAML + generated-manifest transaction
```

Changing a staged operation or its intent aborts any in-flight preview and
invalidates the prepared transaction. Late responses are revision-checked and
cannot re-enable Apply for older staged content. Preview compiles and builds
once, then keeps that exact validated result in a bounded, five-minute,
one-use server transaction. The browser receives only an opaque transaction
ID; it never supplies candidate YAML or generated-manifest bytes.

Apply consumes that transaction and rechecks the architecture, view,
generated-manifest, and dependency digests before atomically committing the
exact reviewed result. A source edit made after preview therefore returns a
stale/concurrent-change error rather than silently rebasing. Invalid elision,
orphaned edge presentation, evidence failure, or any other source-contract
failure leaves canonical files unchanged.

## Local Service Safety

The HTTP adapter is deliberately narrow:

- it binds to `127.0.0.1` only;
- source sets resolve exclusively through `architectures/index.yaml`;
- POST requests require a random per-process session token;
- validated results are session-bound, short-lived, bounded, and single-use;
- request bodies contain typed plans, never filesystem or arbitrary YAML
  paths; and
- prepare and apply call `ArchitectureEdit::Compiler` directly rather than
  implementing a second write path.

The workspace is not linked into the static audience directory and should not
be deployed as an editing service. Public users receive only compiled,
read-only architecture views.

## LLM and Runtime-Trace Extensions

An LLM may later consume the existing question-context packet and propose
staged operations. It must not receive an Apply capability or write canonical
YAML directly; the human-visible plan and deterministic validation remain the
approval boundary.

Recorded inference values are a separate concern. A future trace viewer should
load immutable run sidecars lazily and join observations through canonical
`value_sites.*` refs and `execution.loops.*` IDs. Trace time, sample identity,
and latent payloads do not belong in architecture/view YAML or generated
manifests. The current canonical selection event is the integration seam for a
future trace dock without adding another selection model.
