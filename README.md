# Architecture Explainer

Architecture Explainer is a source-first platform for understanding model
architectures at several levels of abstraction. It combines:

- a declarative YAML DSL for architecture facts, views, and semantic
  pseudocode;
- a deterministic Ruby compiler that validates and projects those facts; and
- an interactive static renderer for semantic zoom, source-backed details,
  comparisons, and shareable component links.

The durable artifact is the explanation, not a hand-positioned diagram.
Architecture facts live in YAML and Markdown; generated browser manifests and
the renderer turn them into the audience experience.

## How it works

```text
architecture + view + pseudocode + evidence sources
                         |
                  validate and compile
                         |
             static HTML, CSS, and JavaScript
                         |
       semantic-zoom boards + synchronized inspector
```

One canonical relation owns each information-flow fact. Boards select which
facts to show at a particular depth, and the compiler derives their arrows.
Pseudocode binds to the same module, relation, value-site, and reusable-block
references, so the diagram and algorithm trace stay synchronized.

## Try it locally

Build one reviewed architecture and serve the audience-only artifact:

```bash
ruby scripts/build_pages.rb --source-set genie3
python3 -m http.server 8096 --directory dist
```

Then open `http://localhost:8096/`. The landing page lists only the
architectures included in that build.

The generated `dist/` directory contains the files needed by the visualizer.
It does not contain the architecture YAML, schemas, tests, authoring tools, or
repository metadata. Do not serve the repository root as a public site.

## What the audience can do

- Move between high-level stages and internal algorithm blocks with semantic
  zoom.
- Select a node or edge to read details and synchronized pseudocode in one
  inspector.
- Hover pseudocode symbols to highlight their execution path on the board.
- Compare a component with a curated counterpart without copying either
  architecture scene.
- Copy a stable URL to a board or component, or copy a typed context packet
  for a follow-up question.
- Pan and zoom with a mouse, trackpad, or direct-touch pinch gesture.

## Repository map

| Path | Purpose |
| --- | --- |
| `architectures/` | Canonical modules, representations, value sites, relations, and evidence. |
| `views/` | Curated semantic-zoom boards and declarative layout. |
| `pseudocode/` | Scoped semantic traces bound to canonical facts. |
| `standard_blocks/` | Reusable algorithm anatomy and variants. |
| `comparisons/` | Curated alignments between existing architecture facts. |
| `references/` | Shared bibliography and source provenance. |
| `renderer/architecture/` | Browser renderer and generated manifests. |
| `schemas/` | Executable source contracts. |
| `protocol/` | Detailed language and compiler specifications. |

## Guides

- [Using the explorer](docs/using-the-explorer.md) explains navigation,
  pseudocode highlighting, comparisons, question handoff, themes, and touch
  gestures.
- [Authoring architectures](docs/authoring.md) explains source ownership,
  contract versions, edit plans, onboarding, and validation.
- [Building and deploying](docs/deployment.md) explains filtered production
  builds, the safe `dist/` boundary, local preview, and Cloudflare Pages.
- [Protocol index](protocol/README.md) links to the precise DSL, projection,
  layout, pseudocode, reusable-block, and renderer contracts.
- [AGENTS.md](AGENTS.md) is the operational guide for an LLM or contributor
  making architecture changes in this repository.

The browser is the canonical audience experience, but it is not an authoring
surface. Durable corrections belong in the declarative sources and must pass
the compiler and verifier before publication.
