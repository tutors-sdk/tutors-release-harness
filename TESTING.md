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
| An image is named wrongly | the Quay template expands to `quay.io/…/tutors/reader`; the shell script and the CLI disagree | Unit on `src/image-ref.ts`, with `build-images.sh --print-images` held to the same answers |
| An untrusted image is judged | an unsigned or wrongly-signed pull passes; a missing cosign is skipped; a stale verification vouches for new content | Unit on `src/images.ts` with the process runner injected (a fake docker, registry and cosign) |
| A report hides where its images came from | a side built from source reads like a published one | Unit on the report header and on capture → report flow |
| A backend leaks into a rule | the anonymous-write rule only works on Supabase REST; migration mode only on the Docker Postgres | Unit: a second, in-memory backend behind each seam (`tests/persistence-seam.test.ts`, `tests/migration-seam.test.ts`) drives the same collector, rule and rehearsal |
| The bus collector is silent when absent, or fails a run it cannot judge | no bus configured reads as a clean bus; a live side with no recorder fails | Unit on the collector and engine with an in-memory transport (`tests/bus.test.ts`) |
| The app ignores the frozen clock | a stat rendered from the wall clock differs run to run | Unit on `probeClock` (`tests/clock-probe.test.ts`); the decision is `docs/harness-now.md` |
| The stacks are not identical | side b has an env var side a lacks | Unit on `compose.harness.yaml` and the kind manifests |
| The whole thing cannot boot | compose or kind fails on a laptop or in CI | Smoke: A/A on one journey (CI, every PR) |
| The harness cannot fail | a planted regression passes release mode | Mutants (weekly, and in CI on any PR that changes an engine, a mask, a journey, the gate or a mutant) |
| The contract drifts | `report.json` gains a field the schema does not know; a workflow uses an undocumented flag | Unit (`tests/contract.test.ts`) |
| The harness is noisy | A/A on the production tag is not clean | Nightly noise; the gate degrades to warn automatically |

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

The harness's own negative fixtures: eight planted regressions
(`mutants/mutants.yaml`), each of which must produce a FAIL verdict
attributed to the expected artefact. A/A runs first, so the mutants are
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

A/A on the production tag, three runs. Zero diffs, or the harness is advisory
until the normaliser is fixed. The status it writes is what release mode
consults; a release run without it warns instead of failing.

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

## Ratchets

| Metric | Direction | Enforced where |
| --- | --- | --- |
| A/A diff count on the production tag | stays 0 | nightly noise → gate degrades |
| Mutants caught and attributed | 8 of 8 | weekly mutants; required on PRs that change an engine, mask, journey, gate or mutant |
| Harness version on such PRs | goes up | `src/ci/engine-change.ts` in the same workflow |
| `report.json`, `noise-status.json`, CLI, dispatch payloads vs `docs/contract.md` | no drift | `tests/contract.test.ts` |
| Masks in `normalise/masks.yaml` | grow only with review | CODEOWNERS |
| Masks that never fire | → 0 | listed in every report as "silent" |
| Engines without a planted-change test | 0 | review |
| Retries anywhere in the harness | 0 | `vitest.config.ts`, no Playwright retries |

## What is deliberately not tested here

- The apps. A journey that fails on both sides is reported, not fixed here.
- Production. Post-deploy mode reads production; it never writes to it, and it
  runs only the anonymous reference-course journeys.
- OpenShift itself. kind with restricted PSA is the stand-in; the monorepo's
  conformance tier owns the real overlays.
