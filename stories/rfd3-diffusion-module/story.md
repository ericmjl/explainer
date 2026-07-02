# RF Diffusion 3 Diffusion Module

This note tracks the RFD3 diffusion-module slice from the local Foundry codebase.
The emphasis is the part that is easy to confuse when comparing against
ESMFold2 and AlphaFold 3: RFD3 uses dense atom14 slots and explicit atom-pair
bias inside its atom transformer.

## Source Files

- Architecture source: `architectures/rfd3-diffusion-module.yaml`
- View source: `views/rfd3-semantic-zoom.view.yaml`
- Pseudocode source: `pseudocode/rfd3-diffusion-module.yaml`
- Main code:
  `/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py`
- Initializer:
  `/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py`
- Blocks and attention:
  `/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py`,
  `/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py`

## Main Takeaway

RFD3 is atom-token-atom, but the atom side is not variable observed atoms. In
the dense design path, residues are padded into 14 atom slots. Missing atoms are
represented by VX virtual slots. Those slots enter atom-level tensors, attention
neighborhoods, and the diffusion loss path; cleanup happens later when outputs
are converted back to residue atom schemes.

The atom transformer does use pair bias. The source is `P_LL`, an atom-pair
representation built by `TokenInitializer`. It is not simply pairwise distances
from the current noisy atom coordinates. Noisy coordinates affect `Q_L`, sparse
attention indices, and token-level distogram features. `P_LL` comes from
reference/motif atom-pair terms, atom single outer terms, and token pair `Z_II`
expanded through `atom_to_token_map`.

## Diffusion Pass

1. The data path creates atom14 slots and `atom_to_token_map`.
2. `TokenInitializer` builds `Q_L_init`, `C_L`, `P_LL`, `S_I`, and `Z_II`.
3. The diffusion module injects the current noisy coordinates into `Q_L`.
4. `LocalAtomTransformer` updates atom slots using `C_L` conditioning and `P_LL`
   pair bias.
5. `Downcast` compresses grouped atom slots into token state `A_I`.
6. `DiffusionTokenEncoder` updates `S_I` and `Z_II`, including
   representative-coordinate distogram features.
7. `LocalTokenTransformer` updates `A_I` using `Z_II` pair bias.
8. `CompactStreamingDecoder` upcasts token output back to atom14 slots, runs
   atom attention again with `P_LL`, and projects `Q_L` to coordinate updates.

## Comparison Handle

For ESMFold2, the atom transformer path we documented uses local atom attention
with 3D RoPE-like geometry but no projected atom pair-bias input. Pair bias
appears later at token attention from token-pair `z`.

For RFD3, atom attention already has an explicit pair-bias representation at
atom-pair scale. The token transformer also uses pair bias, but its `Z_II` is
updated by `DiffusionTokenEncoder` before the token transformer consumes it.

That means a useful comparison question is not simply "does the model use pair
bias?" but "at which scale is the pair representation stored, how is it built,
is it updated, and does it condition attention logits or only geometry/locality?"
