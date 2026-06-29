# AlphaFold Explainer Prototype

This is a static prototype for explaining AlphaFold concepts as step-by-step
visual stories.

Run it with a small static file server, then open the served page in a browser.
Use the left and right arrow keys to move through the IPA story.

Current story:

- Invariant Point Attention virtual probe points
- local residue frames
- local-to-global probe placement
- probe distance as an attention-logit term
- softmax and value gathering

The story content is in `app.js`:

- `codeLines`: pseudocode shown on the left
- `steps`: explanation text, highlighted lines, variables, and scene state
- Three.js drawing primitives: frames, probes, distances, attention arcs, labels

The current renderer uses Three.js with OrbitControls. Drag to rotate the scene,
scroll to zoom, and right-drag to pan. Three.js is loaded from a CDN for now;
vendor it locally if the prototype needs to run offline.
