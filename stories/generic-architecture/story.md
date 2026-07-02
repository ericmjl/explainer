# Generic Feature Refinement

This note is intentionally domain-neutral. It exists to exercise the explainer
language without binding the repository to any particular paper family.

The durable architecture facts live in:

- `architectures/generic-feature-refinement.yaml`
- `views/generic-semantic-zoom.view.yaml`
- `pseudocode/generic-feature-refinement.yaml`
- `standard_blocks/*.yaml`

The renderer should remain generic. If a future concrete domain needs special
vocabulary, put that vocabulary in architecture/view/story sources rather than
hardcoding it in JavaScript.
