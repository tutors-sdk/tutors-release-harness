# Testing the harness

The harness gates releases, so it needs the same discipline it enforces: one
owning tier per failure class, a signal per tier that proves the tier can
fail, and ratchets. This is the runway for the runway.

## The map

| Failure class | Example | Owning tier |
| --- | --- | --- |
| An engine misses a diff | a dropped header produces no hunk | Unit, with a planted change per engine |
| An engine invents a diff | identical captures produce a hunk | Unit A/A |
| A mask hides too much or too little | a mask with no reason; a pattern that never fires | Unit (schema), report (silent masks), nightly A/A |
| The claim matcher is too generous | a `dom` claim covers a `headers` hunk; `scope: "**"` passes without a human | Unit |
| The gate fails without the right to | release FAILS with no clean A/A | Unit |
| A rehearsal rule is wrong | expand/contract accepts a dropped column; a rollout with 5xx passes | Unit on catalogues and k6 output |
| A fixture stub misbehaves | persistence stub sends a Date header; identity stub mints a token for a bad code; edge drops in-flight requests | Fixture tests (in-process servers) |
| A static image artefact is missed or invented | a new package is not a hunk; an SBOM for another digest is read; a changed `revision` label flags every release; a missing scanner reads as "no vulnerabilities" | Unit on `src/compare/image-static.ts` and `src/image-static/*` with the process runner injected (a fake docker, cosign, syft and grype): A/A, planted change and must-not-flag per artefact; not-collected is asserted loud |
| An image is named wrongly | the Quay template expands to `quay.io/…/tutors/reader`; the shell script and the CLI disagree | Unit on `src/image-ref.ts`, with `build-images.sh --print-images` held to the same answers |
| An untrusted image is judged | an unsigned or wrongly-signed pull passes; a missing cosign is skipped; a stale verification vouches for new content | Unit on `src/images.ts` with the process runner injected (a fake docker, registry and cosign) |
| A report hides where its images came from | a side built from source reads like a published one | Unit on the report header and on capture → report flow |
| A backend leaks into a rule | the anonymous-write rule only works on Supabase REST; migration mode only on the Docker Postgres | Unit: a second, in-memory backend behind each seam (`tests/persistence-seam.test.ts`, `tests/migration-seam.test.ts`) drives the same collector, rule and rehearsal |
| The bus collector is silent when absent, or fails a run it cannot judge | no bus configured reads as a clean bus; a live side with no recorder fails | Unit on the collector and engine with an in-memory transport (`tests/bus.test.ts`) |
| The app ignores the frozen clock | a stat rendered from the wall clock differs run to run | Unit on `probeClock` (`tests/clock-probe.test.ts`); the decision is `docs/harness-now.md` |
| A container's posture drifts, or an artefact silently stops being collected | a candidate whose image runs as root, adds a capability or a `VOLUME`, or writes outside `/tmp`; docker missing on the runner and the report saying nothing | Unit on the `runtime` engine, on the posture parsers and on the collectors with the process runner injected (a fake docker and kubectl); "not collected" is a failing hunk |
| Startup time regresses, or the sample cannot judge | a candidate that boots twice as slowly; three restarts a side reported as if judged | Unit on the `startup` engine (Mann-Whitney, the shift floor, "cannot reach alpha") and on the restart sampler with a fake clock |
| A claim names a Rule that is not there, or that nobody can check | `rule: "0999"` with no such Rule; `rule` with no rules file; an unquoted `rule: 0031` read as 31; the claims that spell a Rule out in `reason` broken by the new key | Unit (`tests/rules.test.ts`): the A/A (a claims file with no `rule` reads exactly as before), the planted missing rule / missing file / malformed id, and the must-not-flag (free-text `Rule 0031:` claims, an unused Rule, extra keys in `rules.json`); through the process, exit 2 before any output directory exists |
| The stacks are not identical | side b has an env var side a lacks | Unit on `compose.harness.yaml` and the kind manifests |
| The whole thing cannot boot | compose or kind fails on a laptop or in CI | Smoke: A/A on one journey (CI, every PR) |
| The harness cannot fail | a planted regression passes release mode | Mutants (weekly, and in CI on any PR that changes an engine, a mask, a journey, the gate or a mutant) |
| The contract drifts | `report.json` gains a field the schema does not know; a workflow uses an undocumented flag | Unit (`tests/contract.test.ts`) |
| The harness is noisy | A/A on the production tag is not clean | Nightly noise; the gate degrades to warn automatically |
| The harness FAILs on weak evidence | release FAILs with no status, a stale, dirty or degraded one; a cache or a local build passes as a clean A/A | Unit, end to end (`tests/release-gate.test.ts`) and on the gate |
| A pinned image is not the one judged | a tag that moved after the dispatch took its digests; a source rebuild standing in for a pinned digest; a digest nobody signed; a digest that contradicts the spec | Unit on `ensureImages` with digests (`tests/images.test.ts`, a fake registry that says what each tag resolves to) and on `src/digests.ts` (`tests/digests.test.ts`): the A/A, the planted moved tag, the must-not-flag of a dispatch with no digests |
| A deployment runs something other than what was judged | a digest that differs, an app with a digest on one side only, no release record, a deploy that reports none; a FAIL softened or a PASS left clean | Unit on `src/release-record.ts` and, through the real pipeline, on post-deploy mode (`tests/release-record.test.ts`): the verdict becomes WARN, never FAIL, and the reports are loud |
| The registry is down and the night is green | the nightly used last night's cached image and reported clean | Unit on `images ensure` with a fake registry (`tests/image-cache.test.ts`); the status is `degraded` and the gate refuses it |
| The ratchet loosens | the noise count reaches 0 and creeps back without anyone noticing | Unit on the history (`tests/noise-history.test.ts`); the nightly's publish job fails |
| A mask hides the change that needs it | a mask added in the same PR as the engine change it makes pass | Unit (`tests/mask-change.test.ts`) and the CI job "Masks land in their own PR (required)" |
| Claims become a checkbox | one claim swallows a dozen hunks; `scope: "**"` with `approvedBy` on every release | Unit (`tests/claim-hygiene.test.ts`); reported, never gates |
| Local and CI diverge | a workflow step changes and the local wrapper does not; logic that lives only in workflow YAML; a masks guard that only CI can run | Unit (`tests/local-parity.test.ts`): every `pnpm harness` line in a workflow is held to the plan of `harness local nightly\|gate\|mutants\|watch`, and no workflow may run `src/ci/*.ts` directly |
| The machine cannot run the harness | cosign 2, WSL's `bash` first on a Windows PATH, CRLF in a shell script, a port or the compose subnet already taken, a Docker VM clock adrift | Unit on fake machines (`tests/local-doctor.test.ts`); `harness doctor` on the real one |
| The local noise store loosens the gate | a stale, dirty or degraded local status licenses a FAIL; the default store is ignored | Unit, end to end through the real pipeline (`tests/local-noise-store.test.ts`) |
| A FAIL is bypassed and nobody knows | an admin merges past the check | The recorded override (`--override-reason`), unit-tested; the quarterly count in `docs/noise-burndown.md` |

## Tiers

### Unit (`pnpm test`, seconds, every PR)

Vitest over `tests/*.test.ts`. No Docker, no browser. Every engine has an A/A
case (identical in → nothing out) and at least one planted change; every
schema (masks, claims, mutants) has a negative fixture; the gate is tested
per mode with and without a clean A/A; migration's expand/contract and
upgrade's judgement run on hand-built catalogues and k6 output.

Anything that would run `docker`, `cosign` or `bash` takes its process runner
as a parameter (`Exec` in `src/images.ts`); the tests pass a fake and assert on
the exact commands, so the ensure flow — local, pull, verify by digest, build,
refuse — is covered without Docker.

Container posture and startup time (`src/runtime/`, `src/compare/runtime.ts`)
are collected through docker and kubectl behind the same injected `Exec`:
`tests/runtime-collectors.test.ts` feeds them what the real tools print and
asserts on every command line, `tests/runtime-engines.test.ts` has the three
tests per engine, and `tests/runtime-report.test.ts` runs a whole comparison
and checks the report against the schema. What they cannot prove is that the
assumptions about a real container hold (`node` on the PATH inside every app
image, `/proc/self/mountinfo`, the health status format): the first
`--mode noise` run on a machine with Docker is that proof, and it must be
clean before the harness gates on these artefacts.

Rules for a new engine or rule: it does not merge without (1) the A/A test,
(2) a planted change it catches, (3) a change it must *not* flag.

### Fixture tests (`pnpm test`, seconds, every PR)

`tests/fixtures.test.ts` starts each stub in-process on an ephemeral port and
drives it with `fetch`: the persistence stub records writes and resets, sends
CORS and no Date header; the identity stub completes the authorise → token →
profile flow for every role and refuses a bad code; the course server serves
the fixture with CORS and no caching headers; the edge switches upstreams
without dropping an in-flight request; the mutant wrapper plants each fault.
The fixtures are code the harness ships; they get tests like any other.

### Smoke (CI `two-stacks`, ~10 minutes, every PR)

Both stacks up from the base tag, one journey, A/A, reports uploaded. Proves
the substrate and the collectors end to end. Phase H0's exit criterion, kept
running.

### Mutants (`pnpm harness mutants`, ~15 minutes, weekly and on demand)

The harness's own negative fixtures: ten planted regressions
(`mutants/mutants.yaml`), each of which must produce a FAIL verdict
attributed to the expected artefact. Eight plant a fault at the HTTP edge;
two (`base-swap`, `added-package`) change what the image *is*, and are caught
by the static image artefacts (`image-manifest`, `sbom`). They are built
locally, so `harness mutants` generates their SBOMs with a local `syft` on both
sides (`HARNESS_SBOM_SOURCE=generate`); without `syft`, `added-package` escapes
and the run says why. A/A runs first, so the mutants are
caught by a harness that has the right to gate.

**A re-run is required when an engine, a mask, a journey, the gate or a mutant
changes, and CI enforces it.** `weekly-mutants.yml` also runs on every pull
request. Its first job (`src/ci/engine-change.ts`) looks at the files the PR
touches:

| Paths | |
| --- | --- |
| `src/compare/**`, `src/gate.ts` | engines and the gate |
| `normalise/**`, `src/normalise/**` | masks and how they are applied |
| `traffic/journeys/**` | journeys |
| `mutants/**` | the mutants themselves |

If none is touched, the mutants are skipped and the check passes in a minute.
If any is, the PR must

1. **bump `version` in `package.json`** (any semver increase over the base
   branch) — reports carry the harness version, and two reports are only
   comparable when it is the same; and
2. **pass the mutants**, all caught and attributed, on the PR's own code.

The job named **Mutants re-run (required)** always reports — pass when nothing
relevant changed, otherwise the result of both conditions — so it is the one
to mark as a required status check on `main` (a path-filtered workflow cannot
be required: it never reports on PRs it skips). The rule's own logic is unit
tested in `tests/engine-change.test.ts`.

### Noise (nightly)

A/A on the production tag pulled from the registry, three runs with the same
k6 load a release run uses, on a pinned runner image. Zero diffs, or the
harness is advisory until the normaliser is fixed. The status it writes is what
release mode consults, from the `noise` branch; a release run without a fresh,
clean, **verified** one warns instead of failing. A night that could not pull
(the registry is down or rate-limiting) falls back to the runner's cache of the
last verified images and is **degraded**: it neither counts as clean nor
licenses a FAIL. The burn-down playbook is [docs/noise-burndown.md](docs/noise-burndown.md).

The tests around it never touch Docker or the network:
`tests/release-gate.test.ts` (WARN without a fresh clean verified status, FAIL
with one, per case, through the real pipeline), `tests/image-cache.test.ts`
(the outage fallback, with a fake docker and registry),
`tests/noise-history.test.ts` (the ratchet, the streak, publishing, fetching).

### Rehearsal fixtures (on demand, ~1 minute each)

`tests/fixtures/migrations/{a,b-good,b-bad}`: migration mode must PASS on
`b-good` and FAIL on `b-bad` with exactly four violations. Run both when the
expand/contract rule changes:

```bash
pnpm harness run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-good   # PASS
pnpm harness run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-bad    # FAIL, 4
```

Upgrade mode's negative fixture is the `route-500` mutant rolled in through
the edge: `pnpm harness run --mode upgrade --a local --b tutors-harness/mutant-route-500:latest`
must fail with failures attributed to `b`.

### Local-first (`pnpm test`, seconds)

`tests/local-*.test.ts`: the doctor on fake machines, the noise store and the
guards, the plans of `harness local ...` and how a plan runs (a fake executor:
which failure stops which stream), the watch loop with a fake clock, the run
lock, the override log, and the CLI through a real process for exit codes and
`--dry-run`. Nothing starts Docker: the one thing they cannot prove is that the
Windows paths in `scripts/*.sh` and the tools' install locations hold on a real
machine, which is what `harness doctor` and the first `harness local nightly` are
for. Setup, scheduling and the parity matrix are in [docs/local.md](docs/local.md).

## Ratchets

| Metric | Direction | Enforced where |
| --- | --- | --- |
| A/A diff count on the production tag | stays 0 once it reaches 0 | nightly `publish` job fails on a regression; gate degrades |
| Consecutive clean, verified nightly A/As | reaches 7 (R3 exit) | the nightly summary |
| Mutants caught and attributed | 10 of 10 | weekly mutants; required on PRs that change an engine, mask, journey, gate or mutant |
| Harness version on such PRs | goes up | `src/ci/engine-change.ts` in the same workflow |
| `report.json`, `noise-status.json`, CLI, dispatch payloads vs `docs/contract.md` | no drift | `tests/contract.test.ts` |
| Masks in `normalise/masks.yaml` | grow only with review, in their own PR, and stay under ~40 | CODEOWNERS; CI "Masks land in their own PR (required)" |
| Masks that never fire | → 0 | listed in every report as "silent" |
| Engines without a planted-change test | 0 | review |
| Artefacts that could not be collected in a nightly A/A | 0 | `not collected` is a failing hunk, so a dirty A/A |
| Retries anywhere in the harness | 0 | `vitest.config.ts`, no Playwright retries |
| Overrides of a harness FAIL | → 0 per quarter | `harness-override` issues; `docs/noise-burndown.md` |

## What is deliberately not tested here

- The apps. A journey that fails on both sides is reported, not fixed here.
- Production. Post-deploy mode reads production; it never writes to it, and it
  runs only the anonymous reference-course journeys.
- OpenShift itself. kind with restricted PSA is the stand-in; the monorepo's
  conformance tier owns the real overlays.
