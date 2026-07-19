# Building and Deploying the Static Explorer

The production build creates an explicit audience-only artifact in `dist/`.
Publish that directory, never the repository root.

## Build all registered architectures

```bash
ruby scripts/build_pages.rb
```

The builder regenerates manifests, verifies every registered source set, and
copies only allowlisted audience assets. The artifact contains HTML, CSS,
browser JavaScript, compiled manifest JavaScript, allowlisted raster reference
images, and Cloudflare's `_headers` file.

It does not contain architecture YAML, Markdown authoring protocols, Ruby
libraries, schemas, tests, local review tooling, or repository metadata. The
builder refuses to replace a non-generated, non-empty output directory.

## Publish a reviewed subset

Repeat `--source-set` to define the exact publication allowlist:

```bash
ruby scripts/build_pages.rb --source-set genie3
ruby scripts/build_pages.rb --source-set <first-id> --source-set <second-id>
```

A filtered build compiles and verifies only those source sets, emits only
their manifests, and writes a filtered browser registry. A comparison remains
available only when all of its subjects are included. Excluded architectures
are neither deployed nor certified by that build.

## Preview the production artifact locally

```bash
ruby scripts/build_pages.rb --source-set genie3
python3 -m http.server 8096 --directory dist
```

Open `http://localhost:8096/`. Requests for source YAML should return 404
because those files are outside `dist/`.

To exercise the published artifact in Firefox:

```bash
STATIC_SITE_ROOT=dist RUN_BROWSER_ACCEPTANCE=1 \
  ruby -Ilib:test test/renderer_semantic_pseudocode_browser_test.rb
```

## Cloudflare Pages

Use these Git integration settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Root directory | Leave blank |
| Build command | `ruby scripts/build_pages.rb --source-set <id>` |
| Build output directory | `dist` |

Set these environment variables so Ruby compares generated manifests with
UTF-8 text semantics:

```text
LANG=C.UTF-8
LC_ALL=C.UTF-8
```

Pinning a non-default `RUBY_VERSION` is optional. Cloudflare may spend several
minutes compiling a pinned Ruby during a cold build, while the architecture
compiler itself normally finishes in seconds or less.

The generated `dist/` directory is intentionally ignored by Git. Cloudflare
runs the build command after cloning the repository and publishes the newly
created artifact.

## Cache behavior

Every local HTML, CSS, and JavaScript dependency receives one shared
content-derived fingerprint. The build also emits `Cache-Control: no-cache,
must-revalidate`, preventing Safari from combining stale ES modules with a
newer renderer or manifest after deployment.

## Production checks

For changes that affect the build or published renderer, run:

```bash
ruby -Ilib:test test/pages_build_test.rb
ruby -Ilib:test test/documentation_test.rb
STATIC_SITE_ROOT=dist RUN_BROWSER_ACCEPTANCE=1 \
  ruby -Ilib:test test/renderer_semantic_pseudocode_browser_test.rb
```
