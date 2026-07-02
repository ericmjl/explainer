# AF3 Local Atom Attention

Working note for the interactive story in this directory.

## Core clarification

AF3's diffusion-module atom attention uses local atom windows. The useful mental
model is:

```text
query subset size = 32 atoms
key/value subset size = 128 atoms
```

The 32 atoms are the query block being updated. For each 32-row query block, the
attention reads from a 128-column key/value window centered near that query
block in the flattened atom layout.

```text
[        128 key/value atoms        ]
            [ 32 query atoms ]
```

In an attention mask, rows are query atoms and columns are key/value atoms. The
visible cells form a blocky diagonal band: each 32-row stripe can attend to one
128-column local window.

## Caveats

- "Local" means local in the flat atom layout, not necessarily nearest atoms in
  3D space.
- Padding and sequence/token boundaries are still masked.
- Adjacent 32-query blocks have overlapping 128-key windows.
- Stacking atom-attention blocks lets information propagate beyond one 128-atom
  window over depth.

## Story steps

1. Flatten atom features into one atom axis.
2. Split the query axis into blocks of 32 atoms.
3. Gather a 128-atom key/value window for the active query block.
4. Draw the mask as rows = queries and columns = keys.
5. Show that every query row in the 32-row block shares the same key window.
6. Move to the next block and show the 128-column window shifting by 32 atoms.
7. Highlight overlap between neighboring key/value windows.
8. Add padding and invalid atom masking.
9. Run softmax over the 128 keys for each query atom.
10. Explain that multiple layers pass information farther than one window.
