# Tutors release harness

Runs a Tutors release candidate beside the production image, drives the same
scripted traffic through both, diffs everything observable, and fails unless
every difference is one somebody intended.

Its job is not to prove the candidate is *identical* to production — a release
should differ — but to prove that **every observable difference is claimed**,
and that nothing else moved.

> Run the same scripted traffic through two identical stacks that differ only
> in the application image, normalise the noise, diff everything observable,
> and fail unless each diff hunk is claimed by a changelog entry or a Rule.

This is a standalone project. It consumes the monorepo's images by tag and
knows nothing about their source, so it can compare any two tags — including
two it did not build — and cannot be quietly weakened by the PR it is judging.

## Quick start

```bash
pnpm install
pnpm exec playwright install chromium

# Two tags you have locally (docker compose up --build in the monorepo gives tutors/<app>:local)
pnpm harness run --mode noise   --a local --b local            # A/A: is the harness itself clean?
pnpm harness run --mode release --a 16.2.0 --b 16.3.0-rc.1 \
  --claims ../tutors-mono-repo/release/claims.yaml \
  --noise out/<the noise run>/noise-status.json                # A/B: gate the candidate

# No registry yet? Build the three images from any monorepo ref.
scripts/build-images.sh v16.2.0            # -> tutors/{reader,catalogue,live}:v16.2.0

# The harness's own signal: six planted regressions, all caught.
pnpm harness mutants --base local
```

Every run writes `out/<timestamp>-<mode>/` with `a/` and `b/` captures
(`capture.json` plus screenshots), `report.json`, `report.html`, `report.md`
(the PR comment) and, in noise mode, `noise-status.json`.

## How it works

```
compose.harness.yaml          two app stacks (a, b) + the shared course fixture
fixtures/
  course-server/              static server for the pinned fixture course
  clock/                      HARNESS_NOW: one frozen instant for browser and servers
  identity/  db-snapshot/     planned: stub OIDC, sanitised snapshot (H4)
traffic/
  journeys/                   the tier G journeys, parameterised by base URL
  replay/  load/              planned: access-log replay, k6 (H4/H5)
src/
  collectors/                 what is captured per side, per journey step
  normalise/                  applies normalise/masks.yaml (the list of blind spots)
  compare/                    one diff engine per artefact + Mann–Whitney for timing
  claims/                     claim schema and matcher
  report/                     JSON for gating, HTML for people, Markdown for the PR
  gate.ts                     verdict per mode; may only FAIL while the A/A is clean
  mutants.ts                  builds and runs the mutants
mutants/                      deliberately broken candidate images the harness must catch
claims/                       how a release declares intended differences
```

### What is captured, per side, per journey step

| Artefact | Engine | A diff means |
| --- | --- | --- |
| Semantic DOM (Playwright aria snapshot: roles, names, text, landmarks) | line diff, hunks | Content or structure changed |
| Screenshot (1280×800, light, reduced motion) | pixelmatch, thresholded | Visual change |
| Network: method, path, status, content type, cache headers, JSON response *shape* hash | multiset + per-entry | New/removed calls, status changes, cache or schema changes |
| Console errors and warnings, page errors | set diff | New runtime errors (gone ones are informational) |
| Document response headers | exact, per header | Any change is a finding — security headers live here |
| axe (WCAG 2.1 A/AA) violations by rule and node | set diff | New violations fail; fixed ones are noted |
| Structured logs: JSON-ness, level counts, field set, request-id propagation | aggregate | Log shape or volume changed |
| `/metrics` before and after the journeys | series presence + counter deltas | Missing or new series; a counter that moved differently under identical traffic |
| Timing: document TTFB per page, journey duration | Mann–Whitney U over ≥3 runs | Regression beyond noise; with fewer runs, informational only |
| Journey outcome | — | A journey that completes on a and fails on b is the loudest diff there is |

Not yet captured (phases H4–H5): persistence writes by table, generator
output over a corpus, k6 percentiles, rolling-upgrade behaviour.

### The two runs that make the diff trustworthy

1. **A/A first** (`--mode noise`). Production against itself. Anything that
   differs is noise, and the normaliser must mask it — or the run is not yet
   trustworthy. Nightly. Its `noise-status.json` is what release mode consults.
2. **Then A/B** (`--mode release`). Deterministic artefacts are compared once;
   anything statistical wants `--runs 3`.

Release mode may **fail** a run only while a clean A/A from the last seven
days is supplied with `--noise`. Without one, or with a dirty one, the same
findings come back as **warn** with the reason stated. `--noise skip` waives
this loudly and is recorded in the report. This is what stops the harness
becoming the flaky gate everyone bypasses.

### Claims

A claim names an artefact, a scope glob and the Rule or changelog entry that
justifies the difference. The matcher assigns every failing hunk to at most
one claim; unclaimed hunks fail the run; claims that match nothing are
reported as stale; broad claims (`artefact: "*"`, `scope: "**"`) need
`approvedBy`. See [claims/README.md](claims/README.md).

```yaml
claims:
  - artefact: dom
    scope: "/course/*/lab/*"
    reason: "Rule 0031: lab steps shall show estimated reading time"
  - artefact: network
    scope: "GET /api/presence"
    reason: "Rule 0044: presence polled every 15s, was 10s"
```

### Masks

Every field the harness does not compare is listed in
[`normalise/masks.yaml`](normalise/masks.yaml) with a reason. The report
lists which masks fired and which were silent, so a mask that never fires can
be deleted. Adding one is a review (CODEOWNERS), not a quick fix — a mask is a
blind spot you chose. Each side's own origin is normalised structurally
(`{{origin}}`) and is not a mask.

### Modes

| Mode | a | b | Gates? |
| --- | --- | --- | --- |
| `noise` | production tag | same tag | No — calibrates masks; writes `noise-status.json` |
| `release` | production tag | candidate | Yes — unclaimed diffs block, while the A/A is clean |
| `any-two` | any tag | any tag | No — investigation |
| `upgrade`, `migration`, `post-deploy` | — | — | Not implemented yet (H4–H5); the CLI says so |

### The harness's own signal

[`mutants/`](mutants/README.md) holds six planted regressions built from the
base reader image: a dropped security header, a 500 on a route, a console
error, an extra landmark, an image with no alt text, a 400 ms slower SSR path.
`pnpm harness mutants --base <tag>` runs A/A first, then release mode against
each, and passes only when every mutant produces a FAIL attributed to the
expected artefact. Weekly in CI. A harness that cannot catch its own mutants
has no business gating a release.

## CLI

```
harness run --mode <mode> --a <ref> --b <ref> [--claims f] [--noise f|skip] [--runs n]
            [--journey name]... [--now iso] [--out dir] [--image-prefix p]
            [--no-screenshots] [--no-axe] [--keep] [--no-stack]
harness compare --dir <run dir> --mode <mode> [--claims f] [--noise f]
harness stack up|down --a <ref> --b <ref>
harness mutants --base <ref>
harness journeys
```

`--a` / `--b` accept a bare tag (`16.2.0` → `tutors/<app>:16.2.0`), one app's
full image reference (the other apps take the prefix and that tag), or
`reader=..,catalogue=..,live=..`. `HARNESS_IMAGE_PREFIX` sets the registry
and namespace for bare tags, e.g. `ghcr.io/tutors-sdk/tutors`.

Exit codes: 0 pass or warn, 1 fail, 2 usage or harness error.

## Determinism

Both sides get the same frozen clock (`HARNESS_NOW`, default
`2026-09-16T09:05:00.000Z`) in the browser and as an env var the apps may
honour; the same viewport, locale, timezone, colour scheme and reduced
motion; the same fixture course on one shared server that sends no `Date`,
`ETag` or `Last-Modified`; and read-only, capability-dropped containers as
production runs them. Anything left that differs between two runs of the same
image is what noise mode is for.

## Status against the runway phases

| Phase | Delivers | Here |
| --- | --- | --- |
| H0 — Two stacks | compose file, one journey against both | ✅ |
| H1 — Capture and A/A | DOM, network, headers, console, axe collectors; normaliser; noise mode | ✅ (plus metrics, logs, screenshots, timing) |
| H2 — Claims and gating | claim schema, matcher, HTML report, PR comment, release mode | ✅ code and workflows; wiring to the monorepo's release branch is a `repository_dispatch` away |
| H3 — Mutants | six planted images, weekly self-test | ✅ six edge-planted mutants; two source-level ones deferred (see mutants/README.md) |
| H4 — Statistical and data | repeated runs, metrics and log collectors, persistence diff, migration mode | timing/metrics/logs ✅; persistence and migration ⏳ |
| H5 — Upgrade and post-deploy | rolling upgrade under k6, post-deploy, synthetic monitor | ⏳ |
| H6 — OpenShift | two namespaces instead of compose | ⏳ |

## Development

```bash
pnpm typecheck && pnpm lint && pnpm test    # the engines, matcher, gate and report have unit tests with negative fixtures
```

Tests never touch Docker. The real thing is `pnpm harness run --mode noise`
against two local tags, and `pnpm harness mutants` to prove it can fail.

## Where to stop

Twelve journeys, not a hundred; six mutants, not thirty. The harness compares
artefacts, so its power comes from breadth of *capture* per journey, not from
the number of journeys. Add a journey only when a real regression escaped that
a journey would have caught.

## Licence

MIT.
