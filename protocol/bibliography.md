# Central Bibliography v0.1

Status: **implemented current source-metadata contract**.

`references/bibliography.yaml` is the canonical registry for papers, code,
documentation, specifications, and local source artifacts cited anywhere in
the explainer. Source metadata has one owner; architecture and pseudocode
files describe why a source supports a particular fact.

Code sources used for confirmation include an immutable 40-character revision,
and their browser URL is pinned to that revision rather than a mutable branch.

## Ownership

The bibliography owns source identity and descriptive metadata:

```yaml
schema_version: bibliography-v0.1
sources:
  - id: example_paper
    kind: paper
    title: An Example Method
    authors: [A. Author, B. Author]
    year: 2025
    identifiers:
      arxiv: "2501.00001"
    url: https://arxiv.org/abs/2501.00001
```

Architecture facts own citation meaning, local evidence locators, and notes:

```yaml
evidence:
  status: confirmed_from_paper
  refs:
    - source_ref: example_paper
      role: supporting_evidence
      locator: "Sec. 3.2"
      note: The conditioning vector produces adaptive normalization parameters.
```

Every citation role is a stable snake_case edge type. Roles are intentionally
extensible. Common roles include:

- `architecture_description`: the source describes the model as a whole.
- `reference_implementation`: the source is an implementation associated with
  the architecture.
- `implementation_evidence`: a code location directly supports the local fact.
- `supporting_evidence`: a paper or document directly supports the local fact.
- `specification`: a protocol or specification defines the local contract.
- `method_precedent`: the source demonstrates an earlier related method.
- `method_origin`: the source is evidence for an explicit, verified origin
  claim.

The role does not replace the evidence status. `confirmed_from_code` says how
the fact was checked; `implementation_evidence` says why that particular
source is attached.

Confirmed evidence includes `locator` on at least one compatible source:
symbols or line ranges for code, sections or tables for papers, and headings or
anchors for documentation. `lines` is not an alternate citation field.

## Historical Attribution

“This architecture uses AdaLN” and “this paper first introduced AdaLN” are
different facts. The usage belongs to the architecture's conditioning entry.
The historical statement belongs in a named claim with its own evidence:

```yaml
claims:
  - id: adaptive_normalization_origin
    statement: The cited work introduced adaptive normalization for this use.
    evidence:
      status: confirmed_from_paper
      refs:
        - source_ref: foundational_paper
          role: method_origin
          locator: "Sec. 3"
```

Do not infer “first” merely because a model cites an earlier paper. Treat it as
a research claim: verify the primary source and, when needed, corroborating
historical literature. Use `method_precedent` while priority remains unclear.

## Graph Interpretation

The bibliography provides source nodes. Each `source_ref` occurrence provides
a typed edge from an architecture, module, relation, representation, claim, or
pseudocode fact to one of those nodes:

```text
architecture fact --implementation_evidence--> code source
architecture fact ------supporting_evidence--> paper source
historical claim -------------method_origin--> paper source
```

This is enough to derive an initial provenance graph without duplicating
source metadata. Method and concept nodes can be added later when comparisons
need relationships such as `uses_method` independently of citations.

## Validation and Rendering

`architectures/index.yaml` registers the bibliography. Strict parsing and the
executable bibliography schema reject duplicate keys, unknown fields, invalid
kinds, and malformed structure. The linter additionally rejects duplicate
IDs, malformed paper entries, unpinned code sources, missing citation roles,
incompatible certainty/source-kind combinations, and unresolved `source_ref`
values. The manifest builder includes the bibliography in every architecture
manifest, and the audience detail dock resolves citations into titles,
authors, years, locators, notes, and links.
