# AF3 Diffusion Module Map

Working note for a coarse-to-fine story about the AF3 diffusion module.

## Module outline

```text
AtomAttentionEncoder
  sequence-local atom attention
  Nblock = 3
  Nhead = 4

DiffusionTransformer
  full token self-attention
  Nblock = 24
  Nhead = 16

AtomAttentionDecoder
  sequence-local atom attention
  Nblock = 3
  Nhead = 4
```

The main pedagogical split is scale:

- AtomAttentionEncoder and AtomAttentionDecoder work on atom-level features
  using local sequence windows.
- DiffusionTransformer works on token-level features using full token
  self-attention.
- The local atom attention detail story is the fine-grained page for both the
  encoder and decoder.

## Story steps

1. Show the whole atoms -> tokens -> atoms pipeline.
2. Focus AtomAttentionEncoder: local atom attention, 3 blocks, 4 heads.
3. Explain encoder output as atom information lifted into token context.
4. Focus DiffusionTransformer: full token self-attention, 24 blocks, 16 heads.
5. Explain why the token core is the global mixing stage.
6. Focus AtomAttentionDecoder: local atom attention, 3 blocks, 4 heads.
7. Explain decoder output as token-conditioned atom updates.
8. Show coarse-to-fine drilldown links: encoder/decoder to local atom attention.
