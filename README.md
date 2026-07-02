# AlphaFold Explainer

This is a static prototype for explaining AlphaFold concepts as step-by-step
visual stories. The root page is a story index; each story keeps its own page
and, when useful, a short `story.md` source note.

Run it with a small static file server, then open the served page in a browser.
Use the left and right arrow keys to move through a story.

## Architecture Language

This repo now has a source-first architecture description layer:

- `protocol/architecture-language.md`: YAML vocabulary for methods, modules,
  representations, attention patterns, edges, claims, and evidence.
- `protocol/architecture-comparison-protocol.md`: comparison workflow and axes.
- `protocol/pseudocode-language.md`: YAML vocabulary for algorithm lines,
  symbols, source refs, claims, and visual scenes.
- `protocol/standard-blocks.md`: reusable visual/mathematical motifs.
- `protocol/protein-visualization-language.md`: 2.5D view language for
  protein-aware architecture renderers.
- `protocol/renderer-architecture.md`: planned renderer stack and interaction
  model.
- `architectures/`: machine-readable architecture slices.
- `comparisons/`: machine-readable comparison artifacts.
- `pseudocode/`: machine-readable algorithm/code traces.
- `standard_blocks/`: reusable block specs such as pair-biased attention.
- `views/`: source specs for generated architecture/story views.
- `renderer/esmfold2/`: first coarse generated architecture renderer prototype.
- `renderer/rfd3/`: generated RFD3 diffusion-module renderer prototype.

Stories should increasingly be rendered from these source files instead of
hardcoding every module diagram in HTML or JavaScript.

For architecture-aware editing, read `AGENTS.md` first. It defines the
source-first update order, evidence rules, semantic-zoom board conventions, and
renderer validation commands.

The architecture language now has first-class sections for `execution`,
`state_semantics`, `conditioning`, `scale_transitions`, and
`training_inference`. Run `ruby scripts/lint_sources.rb` after changing the
ESMFold2 architecture/view/pseudocode sources.

The generated renderers currently use `renderer/esmfold2/build-manifest.rb` to
compile YAML sources into static `manifest.js` files, which the browser pages
import.

Current stories:

### Algorithm 22: IPA

Path: `stories/ipa/`

- Algorithm 22 Invariant Point Attention inputs and projections
- scalar q/k/v and local point q/k/v streams
- local-to-global probe placement through residue frames
- scalar, pair-bias, and point-distance attention-logit terms
- softmax over source residues `j`
- separate pair, scalar, and point value gathering
- query-frame point readout, point norm, and final concat dimensions
- explicit boundary between IPA output and the later BackboneUpdate frame move

The IPA story content is in `app.js`:

- `codeLines`: pseudocode shown on the left
- `steps`: explanation text, highlighted lines, variables, and scene state
- Three.js drawing primitives: frames, probes, distances, attention arcs, labels

The current renderer uses Three.js with OrbitControls. Drag to rotate the scene,
scroll to zoom, and right-drag to pan. Three.js is loaded from a CDN for now;
vendor it locally if the prototype needs to run offline.

### AF3 Diffusion Module Map

Path: `stories/af3-diffusion-module/`

- AtomAttentionEncoder as sequence-local atom attention
- token-level DiffusionTransformer as full token self-attention
- AtomAttentionDecoder as sequence-local atom attention
- block/head ledger: atom stacks use `Nblock = 3`, `Nhead = 4`; token stack uses
  `Nblock = 24`, `Nhead = 16`
- module cards that drill down from atom encoder/decoder into the local atom
  attention story

### AF3 Local Atom Attention

Path: `stories/af3-local-atom-attention/`

- flattened atom layout
- 32-atom query subsets
- 128-atom key/value windows
- blocky diagonal attention mask
- overlapping neighboring windows
- padding/invalid-atom masking
- per-query-row softmax over visible key columns
- wider effective receptive field over depth

The durable note is in `stories/af3-local-atom-attention/story.md`; the
interactive mask renderer is in `stories/af3-local-atom-attention/atom-attention.js`.

### Biohub ESMFold2 Diffusion Module

Path: `stories/esmfold2-pair-bias-boundary/`

- high-level scaffold: diffusion conditioning, atom encoder, token transformer,
  atom decoder
- semantic-zoom board source: `views/esmfold2-semantic-zoom.view.yaml`
- atom encoder accepts `z_ij` but does not consume it in the atom attention call
- atom encoder uses `SWAAtomTransformer` / `SWA3DRoPEAttention`
- atom attention path uses sliding-window attention plus 3D RoPE, with no
  pair-bias input
- pair bias is used later in token-level `AttentionPairBias`

### RF Diffusion 3 Diffusion Module

Path: `stories/rfd3-diffusion-module/`

- generated renderer source: `views/rfd3-semantic-zoom.view.yaml`
- architecture facts: `architectures/rfd3-diffusion-module.yaml`
- pseudocode trace: `pseudocode/rfd3-diffusion-module.yaml`
- dense atom14 slot path with VX virtual atoms
- atom encoder and atom decoder use explicit `P_LL` atom-pair bias
- `P_LL` is built from initializer atom-pair features and expanded token pairs,
  not directly from noisy atom-pair distances
- `DiffusionTokenEncoder` updates `Z_II` before the token transformer consumes it
  as pair bias

### Genie3 Token-Frame Denoiser

Path: `stories/genie3-model/`

- generated renderer source: `views/genie3-semantic-zoom.view.yaml`
- architecture facts: `architectures/genie3-model.yaml`
- pseudocode trace: `pseudocode/genie3-model.yaml`
- sparse tokenization: non-atomized residues are CA-only; atomized residues are
  CA plus sidechain heavy atom tokens
- token-pair representation is over `N_token x N_token`, so sidechain tokens
  receive their own rows and columns
- token frames are recomputed from current coordinates at each denoiser call
- IPA structure layers update rotations internally but return final
  translations as the diffusion coordinate output

## Workflow

When a clarification becomes useful, first write the distilled explanation into
that story's `story.md`. Promote it to an interactive step once the concept
needs a visual or a reusable diagram.
