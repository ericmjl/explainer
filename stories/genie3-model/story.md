# Genie3 Model

Working note for the generated Genie3 semantic-zoom board.

## Core claim

Genie3 is best understood as a sparse token-frame denoiser. The diffusion state
is one Cartesian coordinate per token. Tokens are not always residues:

```text
non-atomized residue -> CA token
atomized residue     -> CA token + sidechain heavy atom tokens
```

The model derives a frame for every token from the current coordinate state,
runs token single/pair processing, updates frames with IPA-style structure
layers, and returns only the final frame translations as denoised coordinates.

## What Is Atomized

For an atomized residue, Genie3 inserts the CA token and then appends
`residue.atom_type[4:]`. Because the canonical residue atom list starts with
`N, CA, C, O`, this slice is the sidechain heavy-atom list.

Examples:

```text
ALA -> CA, CB
CYS -> CA, CB, SG
MET -> CA, CB, CG, SD, CE
GLY -> CA
```

Backbone `N`, `C`, and `O` are not generated token coordinates in this path.

## Pair Representation

The pair representation is token-token:

```text
z_ij: B x N_token x N_token x c_z
```

So atomized sidechain tokens get their own rows and columns. There is no
separate residue-level aggregate slot beyond the CA token.

## Frames

At every denoiser call, Genie3 builds token frames from the current coordinates.
CA tokens use neighboring CA tokens along the chain. Sidechain atom tokens use
adjacent same-residue atom tokens. These rotations are derived inputs to the
structure stack, then updated internally by learned frame updates.

## Structure Decoder

The structure decoder predicts a local SE(3) update per token:

```text
BackboneUpdate(s_i) -> quaternion update + translation update
```

Those updates are composed into the running frames within the structure stack.
The final output is:

```text
fi.trans
```

So rotations matter inside the structure stack, but they are not returned to
the diffusion sampler. The next diffusion step starts from Cartesian token
coordinates and recomputes frames.

## Sidechain Generation Scope

The paper and code support sidechain coordinate reconstruction/generation in
known-identity atomized regions, such as motif sidechains, target/interface
sidechains, and the sidechain-packing pipeline. Unknown-sequence design remains
CA-token level for the generated binder residues; Genie3 does not need to
instantiate unknown sidechain atom tokens before residue identity is known.

## Evidence Anchors

- Tokenization: `/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py:123-165`
- Frame indices and frames: `/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/feat_utils.py:1053-1148`, `/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/utils/geo_utils.py:15-174`
- Denoiser path: `/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/implementation/v1.py:51-60`
- Pair features: `/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/embedder/pair/v1.py:96-183`
- Frame update and final output: `/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/model/structure_net.py:79-88,168-170`
- Diffusion objective: `/home/ruh/research/PhD/related_work/genie3/src/genie3/generation/diffusion/ddpm.py:119-142`
