# Stable ID Evolution v0.1

Status: **current governance contract**.

Stable semantic IDs are public interfaces across architecture sources, views,
pseudocode, stories, generated relation paths, and future cross-architecture
links. A text replacement that leaves any dependent reference behind is a
breaking change.

## Current Rules

- New IDs are semantic `snake_case`, never visual positions or display labels.
- Published architecture IDs are not renamed until an explicit alias and
  migration mechanism exists.
- Draft IDs may be renamed only as one atomic repository change that updates
  every typed reference and passes full source validation.
- A semantic split creates new IDs; it does not reuse the old ID for one side
  while silently changing its meaning.
- A semantic merge creates a new ID unless one existing object already retains
  exactly the merged meaning.
- Git owns edit history. YAML does not repeat an unbounded change log inside
  every entity.

## Required Refactor Behavior

A future wizard or Python authoring SDK must perform rename impact analysis
before writing. The transaction must include architecture relations,
conditioning and scale paths, state groups, execution refs, views, pseudocode,
stories, and any registry or comparison references.

The refactor must either commit all affected files or write none. Afterward,
strict validation and manifest `--check` must pass. Silent alias insertion,
ID generation from Python variable names, and order-dependent IDs are not
allowed.

## Deferred Alias Model

Aliases, deprecation, `replaced_by`, and split/merge provenance become
necessary when external consumers rely on published IDs. They are deliberately
not added as unvalidated free-form fields in v0.4. Their future schema must
define whether aliases resolve during compilation, how cycles are rejected,
and when an alias may be removed.
