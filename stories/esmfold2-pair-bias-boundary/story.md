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

## Atom encoder details

The atom encoder keeps two atom-width streams over the same atom slots:

```text
c_l: static atom conditioning
q_l: mutable atom state updated by atom attention
```

`c_l` is built from atom metadata/reference features:

```text
ref_pos, ref_charge, atom mask, element one-hot, atom-name character one-hots
```

These features have width `3 + 1 + 1 + 128 + 4*64 = 389` before the learned
`atom_linear` projection. Source: `modeling_esmfold2_common.py:138-146` and
`modeling_esmfold2_common.py:786-797`.

In the diffusion structure head, `q_l` starts from `c_l` and receives the
current normalized noisy atom coordinates:

```python
if pred_r1 is None:
    pred_r1 = torch.zeros_like(r_l)
r_input = torch.cat([r_l, pred_r1], dim=-1)
q = q + self.coords_linear(r_input)
```

In the active inference path, `r_l` is `r_noisy = x_noisy / sqrt(t^2 +
sigma_data^2)`, and `pred_r1` is not supplied, so the second coordinate half is
zeros. Source: `modeling_esmfold2_common.py:826-832` and
`modeling_esmfold2_common.py:1490-1503`.

`c_l` is not just concatenated into attention. Each atom block feeds `c_l`
through `adaln_modulation` to produce per-atom shift, scale, and gate vectors
for attention and FFN updates. Source:
`modeling_esmfold2_common.py:603-605` and
`modeling_esmfold2_common.py:619-630`.

## Atom-to-token readout

After the sliding-window atom transformer, the atom state is projected to token
width and mean-pooled by `atom_to_token`:

```python
q_to_a = F.relu(self.atom_to_token_linear(q))
a = scatter_atom_to_token(q_to_a, atom_to_token_exp, n_tokens, atom_mask=...)
```

`scatter_atom_to_token` uses `scatter_reduce_(..., reduce="mean")`. So if a
residue/token has 15 atoms, the 15 projected atom vectors are averaged into one
token vector. Source: `modeling_esmfold2_common.py:180-208` and
`modeling_esmfold2_common.py:848-856`.

## Where ESMC enters

ESMC does not feed the atom transformer directly. ESMC hidden states are pooled
across layers and projected by `LanguageModelShim` into a pair representation
`lm_z`, then integrated through the recurrent pair trunk before the diffusion
structure head receives `z_trunk`.

The structure head call passes `z_trunk=z` and `s_inputs=x_inputs`; it does not
pass ESMC hidden states into the atom encoder. Source:
`modeling_esmfold2_common.py:2073-2108` and
`modeling_esmfold2.py:919-929,971-1000`.

## Token transformer details

The token transformer has default depth 12 and 16 attention heads. Source:
`modeling_esmfold2_common.py:1363-1375` and
`modeling_esmfold2_common.py:1426-1432`.

Its main token state `a` comes from the atom encoder mean pool. The conditioned
single stream `s` is added once through `s_to_token`, then used inside every
attention and transition block as token-wise adaptive normalization:

```python
a_norm = layer_norm(a_i)
s_norm = layer_norm(s_i)
x_i = sigmoid(W_gate s_i) * a_norm + W_shift s_i
```

This is token-wise, not a single global timestep vector broadcast over all
tokens. The timestep is part of `s`, because `DiffusionConditioning` adds a
Fourier noise embedding to projected `s_inputs`. Source:
`modeling_esmfold2_common.py:298-313`,
`modeling_esmfold2_common.py:1291-1350`, and
`modeling_esmfold2_common.py:1510-1521`.

The pair representation `z` is fixed during the token transformer. Each
`AttentionPairBias` block owns its own `pair_norm` and `pair_bias_proj`, so the
same `z` is projected differently per block/head, but `z` itself is not updated
inside the token transformer. Source:
`modeling_esmfold2_common.py:971-973` and
`modeling_esmfold2_common.py:1203-1255`.

## Token-to-atom decoder

After the token transformer, `token_to_atom_linear` projects the updated token
state to atom width, and `gather_token_to_atom` copies each token vector to all
atom slots with the matching `atom_to_token` index:

```python
a_to_q = self.token_to_atom_linear(a_i)
a_to_q = gather_token_to_atom(a_to_q, atom_to_token_exp)
q_l = q_l + a_to_q
```

So a residue with 8 atoms receives 8 copies of the same token vector, one per
atom slot. The atom-specific information is restored by adding the encoder
`q_l` skip, then running the decoder SWA atom transformer before
`output_linear` predicts `r_update`. Source:
`modeling_esmfold2_common.py:166-177` and
`modeling_esmfold2_common.py:913-930`.

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
  atom metadata/reference features -> c_l
  normalized noisy coordinates -> q_l
  c_l -> per-atom AdaLN modulation
  q_l -> SWAAtomTransformer
  SWA3DRoPEAttention
  sliding-window attention + 3D RoPE
  no pair bias
  atom_to_token_linear + mean pool -> token representation

Token diffusion transformer
  token representation + conditioned s + pair representation z
  token-wise adaptive normalization from s
  AttentionPairBias
  logits += projected pair bias
  z is not updated inside the token transformer

Atom decoder
  token output + atom encoder skips
  token_to_atom_linear + gather copies token features to atom slots
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
