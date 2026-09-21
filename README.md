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

This is a standalone project. It consumes the monorepo's published images
(`quay.io/tutors-sdk/tutors-<app>`, cosign-signed) by tag or digest and knows
nothing about their source, so it can compare any two tags — including two it
did not build — and cannot be quietly weakened by the PR it is judging. It
verifies the signature of every image it pulls, and every report says where
each side's images came from.

## Quick start

```bash
pnpm install
pnpm exec playwright install chromium

# Two tags you have locally (docker compose up --build in the monorepo gives tutors/<app>:local)
pnpm harness run --mode noise   --a local --b local            # A/A: is the harness itself clean?
pnpm harness run --mode release --a 16.2.0 --b 16.3.0-rc.1 \
  --claims ../tutors-mono-repo/release/claims.yaml \
  --noise out/<the noise run> --runs 3 --load 20x30s          # A/B: gate the candidate

# Published images: pull from Quay, verify the cosign signature, or (loudly) build from the monorepo ref
export HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'  # default is `tutors` -> tutors/<app>:<tag>, the local build
pnpm harness images ensure --a 16.2.0 --b 16.3.0-rc.1          # needs cosign >= 3 on PATH for pulled images
pnpm harness run --mode migration --a v16.2.0 --b release/16.3.0
pnpm harness run --mode upgrade   --a 16.2.0 --b 16.3.0-rc.1
pnpm harness mutants --base local                              # ten planted regressions, all caught
```

Every run writes `out/<timestamp>-<mode>/` with `a/` and `b/` captures
(`capture.json`, screenshots, k6 output), `report.json`, `report.html`,
`report.md` (the PR comment) and, in noise mode, `noise-status.json`.

**New here? Start with the [user guide](docs/user-guide/README.md)** (release authors, operators, CI integrators and harness developers, with a ten-minute quickstart).

Docs: [where the A and B images come from](docs/images.md) ·
[the integration contract](docs/contract.md) ·
[modes](docs/modes.md) · [claims](claims/README.md) ·
[what the monorepo needs to do](docs/monorepo/README.md) ·
[kind substrate](deploy/kind/README.md) · [testing the harness](TESTING.md).

## How it works

```
compose.harness.yaml          two app stacks (a, b), a signed-in reader per side, shared fixtures
fixtures/
  course-server/              static server for the pinned fixture course
  identity/                   GitHub-OAuth-shaped issuer with fixed users per role (TLS, test CA)
  persistence/                Supabase-REST-shaped stub per side that records every write
  edge/                       switchable proxy in front of both readers (upgrade mode)
  clock/                      HARNESS_NOW: one frozen instant for browser and servers
  migrations/                 Supabase baseline for migration mode
traffic/
  journeys/                   fixture, signed-in and reference-course journeys, parameterised by URL
  load/                       the k6 script (timing under load, upgrade rollout)
src/
  collectors/                 what is captured per side, per journey step (+ metrics, logs, persistence, k6)
  runtime/                    container posture and startup time (docker/kubectl through an injected runner)
  image-static/               image manifest, SBOM and vulnerability collectors (docker, cosign, syft, grype through an injected runner)
  normalise/                  applies normalise/masks.yaml (the list of blind spots)
  compare/                    one diff engine per artefact + Mann–Whitney for timing
  claims/                     claim schema and matcher
  modes/                      migration and upgrade rehearsals
  substrate/                  kind: two namespaces under restricted PSA instead of compose
  report/                     JSON for gating, HTML for people, Markdown for the PR
  gate.ts                     verdict per mode; may only FAIL on captured diffs while the A/A is clean
  images.ts                   pull-or-build for any tag
  mutants.ts                  builds and runs the mutants
deploy/kind/                  cluster config and the kind substrate's docs
mutants/                      deliberately broken candidate images the harness must catch
claims/                       how a release declares intended differences
docs/monorepo/                workflows to drop into the monorepo (publish images, dispatch releases)
```

### What is captured, per side, per journey step

| Artefact | Engine | A diff means |
| --- | --- | --- |
| Semantic DOM (Playwright aria snapshot) | line diff, hunks | Content or structure changed |
| Screenshot (1280×800, light, reduced motion) | pixelmatch, thresholded | Visual change |
| Network: method, path, status, content type, cache headers, JSON response *shape* hash | multiset + per-entry | New/removed calls, status, cache or schema changes |
| Console errors and warnings, page errors | set diff | New runtime errors (gone ones are informational) |
| Document response headers | exact, per header | Any change is a finding — security headers live here |
| axe (WCAG 2.1 A/AA) violations by rule and node | set diff | New violations fail; fixed ones are noted |
| Keyboard order: what each successive Tab focuses | sequence diff | A focus stop lost or reordered |
| Timing: document TTFB per page, journey duration | Mann–Whitney U over ≥3 runs | Regression beyond noise |
| `/metrics` before and after the journeys | series presence + counter deltas | Missing or new series; a counter that moved differently |
| Structured logs: JSON-ness, level counts, field set, request-id propagation | aggregate | Log shape or volume changed |
| Persistence: every write the side attempted, by table and method, per journey | multiset + the anonymous rule | Data written differently — and *any* write during an anonymous journey |
| Bus (`bus`, only when a bus is configured; docs/bus.md): every topic the side published to, per journey | multiset + the anonymous rule | Messages published differently — and *any* publish during an anonymous journey |
| Image manifest (`image-manifest`): base, platform, USER, ports, entrypoint, cmd, layers, size, OCI labels, read from the image | exact per field, size with a tolerance | A different base, a root user, a port or command change |
| SBOM (`sbom`): the SPDX SBOM of each image (cosign attestation, or generated locally) | set diff on `name@version` | A package added, removed or bumped |
| Vulnerabilities (`vulns`): the SBOM scanned with a pinned database | set diff by advisory | A vulnerability new on b (fixes are informational) |
| Load (`--load`): k6 at a fixed rate, every request's duration | Mann–Whitney U on samples, failure rate | Latency or error rate regressed under load |
| Container runtime posture (`runtime`): declared (`docker inspect` / pod spec) and measured (a probe inside the container): UID/GID, capabilities, read-only root, no-new-privileges, seccomp, writable mounts, requests/limits; EROFS errors in the log | exact, per field | A changed `USER`, a capability, a writable root or `VOLUME`, a root process, a write outside `/tmp` |
| Startup time (`startup`): first healthy `GET /` and the orchestrator's ready verdict, over `--startup-restarts` restarts | Mann–Whitney U | A slower boot; an app that stops coming up; `/` answers differently after a restart |
| Journey outcome | — | A journey that completes on a and fails on b is the loudest diff there is |

Rehearsals, in their own modes: **migration** (expand/contract on a throwaway
Postgres, rollback rehearsal) and **upgrade** (the candidate rolled in under
load, zero failed requests). **post-deploy** replays the reference-course
journeys against production and compares with the recorded candidate.

### The two runs that make the diff trustworthy

1. **A/A first** (`--mode noise`). Production against itself. Anything that
   differs is noise, and the normaliser must mask it — or the run is not yet
   trustworthy. Nightly. Its `noise-status.json` is what release mode consults.
2. **Then A/B** (`--mode release`). Deterministic artefacts are compared once;
   anything statistical wants `--runs 3` and `--load`.

Release and post-deploy modes may **fail** on captured differences only while
a clean A/A from the last seven days is supplied with `--noise`. Without one,
or with a dirty one, the same findings come back as **warn** with the reason
stated. `--noise skip` waives this loudly and is recorded in the report. The
rehearsal modes are deterministic and gate on their own.

### Claims

A claim names an artefact, a scope glob and the Rule or changelog entry that
justifies the difference. The matcher assigns every failing hunk to at most
one claim; unclaimed hunks fail the run; claims that match nothing are
reported as stale; broad claims need `approvedBy`. See [claims/README.md](claims/README.md).

### Masks

Every field the harness does not compare is listed in
[`normalise/masks.yaml`](normalise/masks.yaml) with a reason. The report
lists which masks fired and which were silent, so a mask that never fires can
be deleted. Adding one is a review (CODEOWNERS), not a quick fix — a mask is a
blind spot you chose.

### Journeys

Three sets, all role-and-name selectors, all parameterised by base URL:

| Set | Journeys | Against |
| --- | --- | --- |
| `fixture` | anonymous student reads a course; searches; catalogue; live | the pinned course in `fixtures/course-server` |
| `auth` | a student signs in through the identity stub, reads a topic; what the reader persists is compared | the signed-in reader per side + the persistence stub |
| `reference` | anonymous reader of the published reference course | `reference-course.netlify.app` — the same upstream for both sides, and the only set that can run against production |

### The harness's own signal

[`mutants/`](mutants/README.md) holds ten planted regressions built from the
base reader image: a dropped security header, a 500 on a route, a console
error, an extra landmark, an image with no alt text, a 400 ms slower SSR path,
a page that writes a row for anonymous readers, navigator links that leave the
tab order, a candidate built FROM a different base image, and a candidate that
adds one package. `pnpm harness mutants --base <tag>` runs A/A first, then release
mode against each, and passes only when every mutant produces a FAIL attributed
to the expected artefact. Weekly in CI. A harness that cannot catch its own
mutants has no business gating a release.

## CLI

```
harness run --mode <mode> --a <ref> --b <ref> [--substrate compose|kind] [--claims f] [--noise f|skip]
            [--runs n] [--set fixture,auth,reference] [--journey name]... [--load 20x30s]
            [--now iso] [--out dir] [--image-prefix p|template-with-{app}] [--allow-unsigned]
            [--no-screenshots] [--no-axe] [--no-focus] [--no-runtime] [--startup-restarts n] [--keep] [--no-stack]
            post-deploy: --recorded <release run dir> --production reader=URL,catalogue=URL,live=URL
            migration:   --snapshot <pg_dump>      upgrade: --upgrade-seconds 45 --upgrade-rate 20
harness compare --dir <run dir> --mode <mode> [--claims f] [--noise f]
harness images ensure --a <ref> --b <ref> [--ref-a git-ref] [--ref-b git-ref] [--allow-unsigned]
harness stack up|down --a <ref> --b <ref>
harness kind up|down|rollout --a <ref> --b <ref>
harness mutants --base <ref>
harness journeys
harness version [--json]
```

Exit codes: 0 pass or warn, 1 fail (or `images ensure` could not obtain an
image), 2 usage or harness error — which includes "an image may not be
judged": absent locally at `run`, or a registry image that is unsigned, signed
by the wrong identity, or cannot be checked because cosign is missing.
`--allow-unsigned` (`HARNESS_ALLOW_UNSIGNED=1`) overrides the
signature check for local work; the report records it.

Environment: `HARNESS_IMAGE_PREFIX` (a prefix, `tutors`, or a template,
`quay.io/tutors-sdk/tutors-{app}`), `HARNESS_COSIGN_IDENTITY` and
`HARNESS_COSIGN_ISSUER` (who must have signed a pulled image; default the
monorepo's `image-build.yml` workflow via GitHub OIDC), `HARNESS_ALLOW_UNSIGNED`,
`HARNESS_PROVENANCE_FILE`. `--a`/`--b` also take
`reader=REF,catalogue=REF,live=REF` with each `REF` pinned as `repo@sha256:…` —
[docs/images.md](docs/images.md).

Which commands, flags, report fields and workflow inputs are stable, and what bumps the
version, is in [docs/contract.md](docs/contract.md).

Every `report.json` and `capture.json` is stamped with
`harness: { version, gitSha, contractVersion }` (`harness version --json`
prints the same), and the HTML and Markdown reports name it in their footer.

## Automation

| Workflow | When | Does |
| --- | --- | --- |
| `ci.yml` | every PR | unit and fixture tests; masks land in their own PR; two stacks boot, one journey A/A; migration fixtures pass and fail as they must |
| `nightly-noise.yml` | nightly | A/A on the production tag pulled from Quay (three runs, with load; last night's verified images as the outage fallback, a degraded night); publishes `noise-status.json` as an artifact and to the `noise` branch, and keeps the ratchet — [docs/noise-burndown.md](docs/noise-burndown.md) |
| `release.yml` | monorepo dispatch on a release branch, or by hand | release mode with claims, 3 runs, k6; migration rehearsal; upgrade rehearsal |
| `post-deploy.yml` | monorepo dispatch after deploy, then every 15 minutes | reference journeys against production vs the recorded candidate; opens a rollback issue on a new difference |
| `weekly-mutants.yml` | weekly, and on every PR | the ten mutants; on a PR only when it touches an engine, a mask, a journey, the gate or a mutant, which also needs a version bump |

Images are pulled from Quay (`HARNESS_IMAGE_PREFIX`, default in CI
`quay.io/tutors-sdk/tutors-{app}`) and their cosign signatures verified — the
workflows install cosign 3 with `sigstore/cosign-installer@v4` — or built from the
monorepo ref when the registry lacks the tag, in which case the report header
says `built-from-ref` — [docs/images.md](docs/images.md).
The two workflows the monorepo needs are in [docs/monorepo](docs/monorepo/README.md).

**Everything runs locally; the workflows are an optional convenience.** On a
laptop (Windows, macOS or Linux, with Docker): `pnpm harness doctor` says what is
missing and how to install it, and `pnpm harness local nightly | gate | mutants |
watch` each do what its workflow does, from the same harness commands
(`--dry-run` prints them), keeping the noise status, the override record and the
image cache under `HARNESS_HOME` instead of the `noise` branch, issues and
`actions/cache`. `harness guard masks|engine --base <ref>` runs the PR guards
against a local ref. The step-by-step parity with the workflows, Windows notes,
scheduling and what stays GitHub-only are in [docs/local.md](docs/local.md).

## Determinism

Both sides get the same frozen clock (`HARNESS_NOW`, default
`2026-09-16T09:05:00.000Z`) in the browser and as an env var the apps may
honour; the same viewport, locale, timezone, colour scheme and reduced
motion; the same fixture course on one shared server and the same identity
stub, none of which send `Date`, `ETag` or `Last-Modified`; a persistence
stub per side; and read-only, capability-dropped containers as production runs
them. Anything left that differs between two runs of the same image is what
noise mode is for.

## Status against the runway phases

| Phase | Delivers | Here |
| --- | --- | --- |
| H0 — Two stacks | compose file, one journey against both | ✅ |
| H1 — Capture and A/A | collectors, normaliser, noise mode | ✅ |
| H2 — Claims and gating | claim schema, matcher, reports, release mode, PR comment | ✅ |
| H3 — Mutants | planted images, weekly self-test | ✅ ten (eight edge faults, two image-level; R5) |
| H4 — Statistical and data | repeated runs, k6, metrics and log collectors, persistence diff, migration mode | ✅ |
| H5 — Upgrade and post-deploy | rollout under load, post-deploy mode, synthetic monitor | ✅ (compose edge rollout; kind rolling update) |
| H6 — OpenShift | two namespaces in a local cluster under restricted policy | ✅ kind with restricted PSA (`--substrate kind`); the auth set stays on compose |

Known product finding, recorded rather than worked around: in v16.2.0 the
reader's `/auth/[courseid]` page answers 500 when authentication is enabled
(`__dirname is not defined in ES module scope`, from the sanitiser chunk), so
the `auth` journey fails identically on both sides until that is fixed. The
harness reports it as informational (failed on both), which is the correct
verdict for a diff engine and the wrong state for the product.

## Development

```bash
pnpm typecheck && pnpm lint && pnpm test    # engines, matcher, gate, rehearsal rules, report, fixture stubs
```

`pnpm test` never touches Docker. The real thing is `pnpm harness run --mode noise`
against two local tags, `pnpm harness mutants` to prove it can fail, and the
migration fixtures under `tests/fixtures/migrations`. See [TESTING.md](TESTING.md).

## Where to stop

Twelve journeys, not a hundred; ten mutants, not thirty. The harness
compares artefacts, so its power comes from breadth of *capture* per journey,
not from the number of journeys. Add a journey only when a real regression
escaped that a journey would have caught.

## Licence

MIT.
