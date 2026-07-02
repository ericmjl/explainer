# Biohub ESMFold2 Diffusion Module

Source checkout:

```text
/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/
```

Main source file:

```text
/home/ruh/research/PhD/related_work/biohub-transformers/src/transformers/models/esmfold2/modeling_esmfold2_common.py
```

## High-level scaffold

At bird's-eye level, this Biohub ESMFold2 diffusion module has four main
components:

1. Diffusion conditioning
2. Atom encoder
3. Token transformer
4. Atom decoder

The forward path follows that scaffold: conditioning first prepares `s` and
`z`; the atom encoder converts atom-local inputs into token state; the token
transformer updates token state with pair-biased attention; the atom decoder
projects token output back to atom-coordinate updates.

## Pair-bias boundary

In this Biohub checkout, the ESMFold2 atom encoder does **not** use pair bias.

The atom encoder accepts a `z_ij` argument, but the argument is not consumed in
the atom-attention path. Pair bias appears later in the token diffusion
transformer.

## Evidence

- `ESMFold2AtomEncoder.__init__` constructs `self.atom_transformer =
  SWAAtomTransformer(...)` with atom dimensions, block/head counts, SWA window,
  and 3D-RoPE settings. There is no pair-bias module in this construction.
  Source: `modeling_esmfold2_common.py:742-752`.

- `ESMFold2AtomEncoder.forward` includes `z_ij: Tensor | None = None` in its
  signature. Source: `modeling_esmfold2_common.py:758-770`.

- The forward path builds atom features and 3D-RoPE attention parameters, then
  calls:

  ```python
  result = self.atom_transformer(
      q_l=q,
      c_l=c,
      attention_params=attention_params,
      return_intermediates=return_intermediates,
  )
  ```

  There is no `z_ij` or pair-bias argument in the call.
  Source: `modeling_esmfold2_common.py:786-840`.

- `SWA3DRoPEAttention.forward` takes only `x` and `attention_params`. It builds
  Q/K/V, applies 3D RoPE to Q and K, and uses FlashAttention with
  `window_size=(self.half_window, self.half_window)` when available. There is no
  pair-bias input or addition to logits in this atom-attention implementation.
  Source: `modeling_esmfold2_common.py:492-557`.

- Pair bias is present in the token diffusion transformer path. `DiffusionModule`
  constructs `self.token_transformer = DiffusionTransformer(...)` with
  `d_pair=c_z`. Source: `modeling_esmfold2_common.py:1426-1432`.

- `AttentionPairBias` is explicitly described as "Gated multi-head attention
  with pair bias conditioning." It projects `z` through `pair_bias_proj` and
  adds the result to attention logits:

  ```python
  pair_bias = self.pair_bias_proj(self.pair_norm(z))
  logits = logits + pair_bias.to(dtype=logits.dtype)
  ```

  Source: `modeling_esmfold2_common.py:939-940` and
  `modeling_esmfold2_common.py:1114-1118`.

## Mental model

```text
Diffusion conditioning
  s_inputs + z_trunk + relative position + t_hat
  returns conditioned single/token stream s and pair stream z

Atom encoder
  atom features + coordinates
  SWAAtomTransformer
  SWA3DRoPEAttention
  sliding-window attention + 3D RoPE
  no pair bias

Token diffusion transformer
  token representation + conditioned s + pair representation z
  AttentionPairBias
  logits += projected pair bias

Atom decoder
  token output + atom encoder skips
  SWAAtomTransformer
  output_linear -> coordinate update
```

## Future interactive story

Make a four-stage story:

1. Diffusion conditioning panel: noise/timestep embedding, `s` conditioning,
   and `z` conditioning.
2. Atom encoder panel: local atom axis, sliding window, 3D RoPE attached to
   coordinates, no pair-bias term in the logit.
3. Token transformer panel: token axis, full token attention, pair matrix `z`,
   projected pair bias added to logits.
4. Atom decoder panel: token-to-atom readout, atom encoder skip reuse, local
   atom attention, and coordinate update.
