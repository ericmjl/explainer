# Architecture Explainer

This is a static, source-first system for explaining model architectures as
semantic-zoom boards, synchronized pseudocode, and source-backed stories.

The language and renderer are intentionally domain-neutral; the registered
examples include both a neutral reference pipeline and real ML/protein models.
Architecture facts live in YAML and Markdown sources. A deterministic Ruby
compiler projects them into browser manifests, and the browser renders those
manifests into diagrams, inspectors, comparisons, evidence summaries, and
reusable standard-block views.

## Architecture Language

Source layers:

- `protocol/README.md`: status index for implemented and proposed design
  contracts.
- `references/bibliography.yaml`: canonical metadata for papers, code,
  documentation, specifications, and local source artifacts.
- `protocol/bibliography.md`: citation ownership, typed roles, historical
  attribution, and provenance-graph rules.
- `protocol/architecture-language.md`: YAML vocabulary for methods, modules,
  representations, attention patterns, relations, claims, and evidence.
- `protocol/architecture-edit-language.md`: deterministic typed edit plans,
  semantic diffs, stale-plan protection, and transactional application.
- `protocol/source-validation.md`: strict YAML parsing, executable schemas,
  semantic checks, and deterministic manifest compilation.
- `protocol/id-evolution.md`: stable-ID compatibility and atomic refactors.
- `protocol/architecture-projection-model.md`: current projection contract for
  architecture hierarchy, scoped board projection, automatic edges, elision,
  provenance, and migration.
- `protocol/semantic-layout.md`: deterministic placement rules for a middle
  compute spine, top conditioning, left/right task boundaries, and bottom
  feedback rails.
- `protocol/fact-ownership.md`: architecture-v0.4 one-owner rules and the
  interfaces derived from canonical relations.
- `protocol/architecture-coverage.md`: explicit top-down breadth closure,
  depth frontiers, and compiled non-percentage coverage reports.
- `protocol/architecture-comparison-protocol.md`: registered v0.1 comparison
  sources, compiled fact alignment, and evidence-grounded differences.
- `protocol/pseudocode-language.md`: YAML vocabulary for algorithm lines,
  symbols, source refs, claims, and visual scenes.
- `protocol/standard-blocks.md`: reusable visual/mathematical motifs.
- `protocol/visualization-language.md`: semantic-zoom board language.
- `protocol/renderer-architecture.md`: renderer stack and interaction model.
- `architectures/`: machine-readable architecture slices.
- `comparisons/`: curated, source-backed alignments between architecture slices.
- `pseudocode/`: scoped semantic algorithm or code traces bound to canonical
  architecture facts.
- `standard_blocks/`: reusable block specs.
- `views/`: source specs for generated architecture views.
- `renderer/architecture/`: the audience renderer and generated manifests.
- `schemas/`: implementation-independent JSON Schemas consumed by the Ruby
  compiler and future authoring frontends.

Stories should increasingly be rendered from these source files instead of
hardcoding every module diagram in HTML or JavaScript.

## Current Contract Versions

| Layer | Current authoring contract | Compatibility |
| --- | --- | --- |
| Architecture facts | `architecture-v0.4` | All registered source sets use v0.4. |
| Semantic-zoom boards | `visualization-v0.4` | All registered views use v0.4. |
| Semantic pseudocode | `pseudocode-v0.2` | New traces use v0.2; registered v0.1 traces remain readable. |
| Reusable algorithms | `standard-block-v0.2` | New blocks use v0.2; registered v0.1 blocks remain supported. |
| Curated comparisons | `architecture-comparison-v0.1` | Registered through `comparison-registry-v0.1`. |
| Typed edit plans | `architecture-edit-v0.2` | v0.1 plans remain accepted. |
| Browser manifest | `architecture-manifest-v0.4` | Deterministic compiler output, not an authoring format. |
| Semantic layout | `semantic_flow_v1` | Produces reviewable `col`/`row` values in view YAML. |

Compiler implementation versions are recorded in generated manifests. The
current builder is `architecture-manifest-builder-v0.4.6`; semantic pseudocode
and comparisons are independently versioned as
`semantic-pseudocode-compiler-v0.3` and
`architecture-comparison-compiler-v0.1`.

The current architecture-v0.4 / visualization-v0.4 contracts enforce the
one-fact/one-owner rule. Architecture sources own a strict module hierarchy,
typed value sites, canonical relations, semantics, and evidence. Boards select
a subject, relative expansion depth, exact visible occurrences, explicit
elisions/exclusions, and presentation overrides; they do not author semantic
edges. A shared build/lint-time projector derives direct, boundary, and
contracted edges with ordered relation provenance. Drilldown remains explicit
through `board_ref`. See `protocol/architecture-projection-model.md`.

Reusable algorithm internals now use `standard-block-v0.2`. A template owns
typed ports, variants, step-level pseudocode/math, and one internal layout;
architecture `block_instances` bind a concrete module occurrence to canonical
relations with explicit `exact`, `wrapped`, or `reduced` conformance. Optional
`kind: standard_block_instance` view stubs give those compiled internals stable
static URLs without turning template steps into invented architecture facts.
See `protocol/standard-blocks.md`.

Within the architecture source, relations alone own flow endpoints. Modules do
not repeat inputs/outputs; conditioning refers to one relation; scale
transitions refer to ordered relation paths; and state lifecycle groups refer
to concrete value sites. The manifest builder derives renderer-friendly
producer/consumer and endpoint indexes. See `protocol/fact-ownership.md`.

Architecture coverage is also explicit rather than guessed. The root and
every module declare whether their decomposition is complete, partial, a leaf,
or intentionally opaque. Child sets and coverage counts are derived from
`parent_ref`; compilation reports breadth scopes and depth frontiers without
inventing an overall percentage. See `protocol/architecture-coverage.md`.

For architecture-aware authoring, read `AGENTS.md` first. It defines the
source-first update order, evidence rules, semantic-zoom board conventions,
and renderer validation commands. The browser is the canonical audience
experience, not an authoring surface: update YAML or Markdown sources and
regenerate the manifests instead of editing a board in the page.

For bounded multi-fact edits, the architecture-edit plan language provides a
safer authoring boundary: a wizard or LLM may propose typed operations, while the
deterministic editor prepares source digests, shows a semantic diff, and
applies only a fully validated transaction. The plan never replaces canonical
YAML. See `protocol/architecture-edit-language.md`.
The previewable draft in
`examples/architecture-edits/clarify-timestep-embedder.yaml` exercises both a
field update and deterministic child-board scaffolding.

Board scaffolding now shares the versioned `semantic_flow_v1` layout compiler.
To reflow an existing board through the same reviewed boundary, include a
`layout_board` operation in an architecture-edit-v0.2 plan, then prepare, show,
and apply it normally. The compiler updates only declarative grid positions;
the browser measures cards and automatically routes cycle-closing state
updates through bottom feedback rails.

For human review after a draft exists, run:

```bash
ruby scripts/architecture_review.rb
```

The loopback-only review workspace embeds the exact published renderer, lets a
reviewer stage explanation and board-presentation corrections, and exposes
Preview/Validate and Apply as separate actions. It submits typed plans to the
same deterministic compiler; it is not an `?edit` mode and is not part of the
static audience experience. See `protocol/architecture-review-workspace.md`.

When porting a method, keep the method codebase and this explainer workspace
distinct. The method repository is read-only evidence; the edit plan targets
an existing source set registered in `architectures/index.yaml`. The current
transpiler does not analyze an arbitrary code repository or create a new
source set. New methods must first be registered through the source-first
workflow, after which supported follow-up changes should use edit plans.

## Architecture Directory

The repository root is an intentionally minimal, registry-driven list of the
model architectures included in the current build. It reads only
`renderer/architecture/manifest-index.js`; full architecture manifests are
loaded after a user opens the renderer. Do not hand-author model links in
`index.html`. Register the source set in `architectures/index.yaml`, use
`directory_role: architecture`, and include it in the Pages build allowlist.

Entries with `directory_role: reference`, design-language material, and
authoring resources are deliberately absent from the audience homepage. They
remain available to contributors in the source repository without competing
with the published model list.

## Audience Renderer

Path: `renderer/architecture/`

The renderer hosts multiple architectures. `architectures/index.yaml` is the
registry of source sets; the page switches between them with the header
dropdown or a `?arch=<id>` query parameter:

- `?arch=generic` (default): the domain-neutral feature-refinement pipeline.
- `?arch=dit`: the Diffusion Transformer (Peebles & Xie, arXiv:2212.09748),
  rendered from evidence-graded sources. Its board demonstrates edge elision:
  decoder scaling and intermediate value sites are contracted into dashed
  edges with complete canonical relation paths; hover the edge port to peek at
  the hidden chain, click to pin.
- `?arch=genie2`: Genie 2 protein-backbone diffusion (Lin et al.,
  arXiv:2405.15489), covering unconditional generation and motif scaffolding
  from request preparation through the 1,000-step C-alpha reverse process,
  invariant single/pair encoding, equivariant structure updates, and PDB
  export.
- `?arch=genie3`: Genie 3 atom-aware protein diffusion (Lin et al., bioRxiv
  2026), covering unconditional generation, motif scaffolding, and binder
  design through task-dependent partial atomization, 100-step directional
  DDIM sampling, bidirectional single/pair latent reasoning, and equivariant
  structure decoding.

There is one renderer interface: the audience view. Node hover or keyboard
focus traces nearby connectivity without duplicating the detail panel; edge
hover or focus provides a transient connection explanation. Selecting either
pins its full details in the right inspector. Dragging pans the canvas, while
direct touch supports two-finger pinch zoom plus simultaneous two-finger pan.
A two-finger trackpad scroll or mouse wheel also zooms around the pointer.
Pinch can begin over a card without activating it. Navigation and location
belong to that same experience. The former legacy, edit, and tuning UI
variants are retired. Shareable static-site links use stable source, board,
and optional board-local node IDs, for example
`?arch=genie3&board=latent_transformer&node=pair_biased_attention_update`.
The board breadcrumb's **Copy link** button copies the current canonical URL;
browser Back and Forward restore semantic navigation, while pan, zoom, hover,
and transient arrow state stay local. `?arch=` by itself still opens an
architecture's root board, and `?layout=elk` remains an experimental layout
implementation rather than a separate interface.

Nodes and arrows also expose question handoff actions. Right-click, use the
keyboard context-menu shortcut, or select an element and open `...` in the
detail header. `Copy reference` produces a short typed locator;
`Copy question context` produces a versioned packet with the current board,
surrounding arrows, canonical relation paths, and evidence for pasting into a
conversation. This is a local clipboard handoff, not an embedded chat backend.

The inspector presents **Details** followed by **Pseudocode** in one continuous
scrolling view. Its bounded-width desktop rail leaves enough room for code
without crowding the board. Pseudocode is synchronized with the current semantic
board, and transient trace guidance stays below the code so hover feedback
cannot move the line under the pointer. High-level method traces use nested program, loop, and module scopes;
reusable detail boards use the selected standard-block variant's own step DAG.
Hovering or keyboard-focusing a bound variable/call highlights its visible
producer, consumer, and connecting arrows while fading unrelated components;
hovering a board node marks the corresponding code tokens without changing the
normal board browsing treatment. Clicking a token pins the existing board
selection, so the normal component deep link and question-context workflow
continue to apply. Read, write, and call bindings are compiled from canonical
fact references rather than inferred from raw code text in the browser.

The directory and renderer share three presentation themes: the original
**Atlas** palette, **Ramith paper**, and **Dark**. Ramith paper is derived from
the personal site's warm Tufte background and ink, green interaction color,
yellow annotations, and scholarly blue. It follows the operating system's dark
preference, is stored under `explainer.theme`, and never enters a shareable
architecture URL. A host page can select it before loading the stylesheet with
`document.documentElement.dataset.theme = "ramith"`.

Conditioning badges on edges (adaLN-Zero, pair bias, per-item AdaLN) are
derived from the architecture `conditioning` section, never hand-authored in
views.

Single, pair, coordinate, and frame colors are likewise derived from canonical
carried representations. Boards may optionally align those families into
typed rows without re-authoring flow semantics.

All registered demos are compiled through the semantic projector. The generic
demo models a feature-refinement pipeline:

- input records become item states;
- a context builder produces pair/context state;
- local item attention updates the item stream;
- item states are compressed into group states;
- a global refinement stack consumes group state and pair/context bias;
- group output is broadcast to item outputs;
- output heads emit task-specific predictions.

The example is not tied to a paper or biological domain. It exists to exercise
the design language: evidence fields, state semantics, conditioning modes,
scale transitions, compact nodes, MathJax equations, pan/zoom, and semantic
drilldown.

## Production Build

Build the Cloudflare Pages artifact with:

```bash
ruby scripts/build_pages.rb
```

The command regenerates the manifests, verifies every registered source set,
and writes an allowlisted static site to `dist/`. Only the landing page,
browser renderer, generated manifests, and shared styles/themes enter that
directory. Architecture YAML, Markdown authoring protocols, Ruby libraries,
schemas, tests, review tooling, and repository metadata are never copied. The
builder refuses to replace a non-generated, non-empty output directory. The
artifact contains only HTML, CSS, browser JavaScript, compiled manifest
JavaScript, and Cloudflare's `_headers` control file; its ownership marker is
kept beside `dist/`, outside the deployed directory.

During staging, the builder gives every local HTML/CSS/JavaScript dependency
one shared content fingerprint and emits `Cache-Control: no-cache,
must-revalidate`. This prevents Safari from combining cached modules from an
older deployment with a newer renderer or manifest.

By default the Pages build publishes every registered source set. To publish
only reviewed architectures, repeat `--source-set` for the exact allowlist:

```bash
ruby scripts/build_pages.rb --source-set genie3
ruby scripts/build_pages.rb --source-set dit --source-set genie3
```

A filtered build compiles and verifies only those selected source sets, emits
only their manifest files, and writes a correspondingly filtered browser
registry. A comparison is retained only when every one of its subjects is in
the publish allowlist. Excluded drafts are neither deployed nor certified by
that filtered build.

For Cloudflare Pages Git integration, use no framework preset, use
**ruby scripts/build_pages.rb** as the build command, and set the build output
directory to `dist`. For a Genie-3-only site, use
**ruby scripts/build_pages.rb --source-set genie3** instead. The generated
directory is intentionally ignored by Git.

To preview the same safe artifact locally:

```bash
ruby scripts/build_pages.rb
python3 -m http.server 8096 --directory dist
```

Never serve the repository root as the public site: it contains the YAML,
schemas, evidence metadata, tests, and local authoring tools that the Pages
allowlist intentionally excludes.

To exercise the exact published artifact in Firefox before deployment, run:

```bash
STATIC_SITE_ROOT=dist RUN_BROWSER_ACCEPTANCE=1 \
  ruby -Ilib:test test/renderer_semantic_pseudocode_browser_test.rb
```

## Workflow

After changing architecture, view, pseudocode, reusable-block, comparison, or
bibliography sources, regenerate the manifests and run the source-set gate:

```bash
ruby renderer/architecture/build-manifest.rb   # regenerates manifest-<id>.js per registry entry
ruby scripts/verify_architecture.rb --source-set <id>
ruby renderer/architecture/build-manifest.rb --check
ruby -Ilib:test test/documentation_test.rb
ruby scripts/lint_sources.rb
ruby -c renderer/architecture/build-manifest.rb
```

When compiler, projection, renderer, comparison, review, or build
infrastructure changes, run the relevant repository-wide suites listed in
`AGENTS.md`. Production-bound changes should also run:

```bash
ruby -Ilib:test test/pages_build_test.rb
STATIC_SITE_ROOT=dist RUN_BROWSER_ACCEPTANCE=1 \
  ruby -Ilib:test test/renderer_semantic_pseudocode_browser_test.rb
```

An architecture edit plan uses an explicit review cycle before the same
validation pipeline:

```bash
ruby scripts/architecture_edit.rb prepare edits/change.yaml --out /tmp/change.prepared.yaml
ruby scripts/architecture_edit.rb show /tmp/change.prepared.yaml
ruby scripts/architecture_edit.rb apply /tmp/change.prepared.yaml
```

`apply` requires current SHA-256 digests for both the target architecture and
view; if either source changed after preparation, the plan is stale and no
files are written.

The source-set verifier is the concise final gate for an architecture port or
edit:

```bash
ruby scripts/verify_architecture.rb --source-set genie3
ruby scripts/verify_architecture.rb --source-set genie3 \
  --board reverse_diffusion_step --format json
```

The second command is for focused repair diagnostics. Rerun without `--board`
before handoff. Repository-wide tests remain necessary when changing schemas,
validators, projection, compilation, or renderer infrastructure.

If a JS runtime is available, also syntax-check the ES modules (they use
`export` and top-level `await`, so check them as modules, e.g. via an `.mjs`
copy):

```bash
cp renderer/architecture/renderer.js /tmp/explainer-renderer.mjs
node --check /tmp/explainer-renderer.mjs
```

Both scripts read `architectures/index.yaml`; register new source sets there,
not in the scripts. The registry also points to the shared bibliography;
architecture evidence should cite stable `source_ref` IDs rather than repeat
paper or repository metadata.

Manifest generation now runs the full source linter first. Current architecture,
view, and bibliography sources must also satisfy the JSON Schemas under
`schemas/`; duplicate YAML keys, unknown fields, evidence-status typos,
unpinned code citations, and stale generated manifests fail closed.
