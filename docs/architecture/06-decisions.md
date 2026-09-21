# 6. Architecture decisions visible in the code

Each is a choice the code makes and defends, with a one-line reason and where to
see it. They are read from the code and its comments, not from a decision log: there is
none, and `docs/harness-now.md` (item 18) is the only document written as a
decision record. Order is roughly the order a run meets them.

| # | Decision | Why | Look at |
| --- | --- | --- | --- |
| 1 | **Compare images, not checkouts** | The harness can compare any two tags, including ones it did not build, and cannot be weakened by the PR it is judging | `README.md` (intro), `docs/images.md` (first paragraph) |
| 2 | **Two stacks, differing only in the image, not one stack against a stored baseline** | Both sides share a clock, viewport, course and identity, so anything that differs between two runs of one image is noise the normaliser must handle, not a difference in the release | `compose.harness.yaml` header, `tests/stack.test.ts`, `README.md` "Determinism" |
| 3 | **Normalise, then diff; every blind spot is a listed mask with a reason** | A field the harness does not compare is a choice a reviewer must be able to weigh. The report lists which masks fired, so a silent one can be deleted | `normalise/masks.yaml` header, `src/normalise/masks.ts` (`reason` at least 20 characters), `.github/CODEOWNERS` |
| 4 | **Masks land in their own PR** | The failure to prevent is a mask added in the same change that needs it to pass, where a green run and a diff both explain and hide the difference | `src/ci/mask-change.ts`, `ci.yml` job `masks` |
| 5 | **Each artefact has its own engine, chosen for what a diff means** | Exact for headers and posture, set diff for console and axe, multiset plus fields for network, ordered sequence for focus, statistics for timing, so the report says what kind of change it is | `src/compare/engines.ts`, `extra.ts`, `image-static.ts`, `runtime.ts` |
| 6 | **One write-ledger rule for persistence and the bus** | The sides must agree, and an anonymous journey must write nothing. A backend change should not need a new rule | `src/compare/ledger.ts` |
| 7 | **Claims must cover every failing hunk, and are matched precisely** | The harness proves that every observable difference is intended, not that there is none. A claim names an artefact and a scope, matches the first in file order, and a stale claim is reported. Broad claims need a named human | `src/claims/matcher.ts`, `src/claims/schema.ts`, `src/gate.ts` |
| 8 | **Claims are a smell detector too, and never gate** | Routine broad claims mean claims have become a checkbox, so hygiene is reported and left to people | `src/claims/hygiene.ts`, `docs/contract.md` "Claim hygiene" |
| 9 | **The A/A run gates the gate: FAIL only while the last A/A is clean, verified and at most 7 days old** | A harness that has not earned the right to fail must not block, and must not quietly lose its teeth. Otherwise the same findings are a warning with the reason stated | `src/gate.ts` (`trustNoise`), `docs/contract.md` "noise-status.json and the 7-day rule" |
| 10 | **Degraded evidence is never trusted** | A clean A/A over a cache, a local build or an unverified pull says nothing about production. Such a night is recorded as degraded, and neither counts as clean nor licenses a FAIL | `src/run.ts` (`evidenceGaps`), `src/noise.ts`, `src/gate.ts`, `src/image-cache.ts` |
| 11 | **No image is judged until its signature verifies, by digest, against a named identity** | "Signed by someone" is worthless. The tag can move between pull and check. Unsigned or unverifiable is exit 2, "cannot judge", not a warning | `src/images.ts` (`verifySignature`, `ImageTrustError`), `docs/images.md` section 2 |
| 12 | **A pinned image must agree with its tag, and is never built from source** | A rebuild is not the image the digest names, and a tag that moved after the digests were taken is not what was dispatched | `src/images.ts` (`tagAgreesWithDigest`), `src/digests.ts` |
| 13 | **Build-from-ref exists but is loud and never evidence** | A registry can lack a tag, but a local build is a different builder, base pull and no signature. Every report says `built-from-ref` | `scripts/build-images.sh`, `src/run.ts` (`provenanceReasons`), `docs/images.md` section 5 |
| 14 | **Mutants are the self-test** | A harness that cannot catch its own planted regressions has no business gating a release. A/A runs first, then each of ten mutants must FAIL and be attributed to the expected artefact | `mutants/mutants.yaml`, `src/mutants.ts`, `weekly-mutants.yml`, `TESTING.md` |
| 15 | **A change to what is compared or gated must bump the version and re-run the mutants** | Two reports are comparable only when the harness version is the same, and the gate's promise changes with its engines | `src/ci/engine-change.ts`, `docs/contract.md` "Compatibility" |
| 16 | **Never retry a noisy measurement; state what a sample cannot judge** | A retry hides the noise floor. Timing needs `minRuns`, an effect floor and a shift floor, and fewer than that is information, never a failure. "Zero retries anywhere" is a ratchet | `src/compare/engines.ts` (`timing`), `normalise/masks.yaml` `timing`, `docs/modes.md` `startup`, `TESTING.md` "Ratchets" |
| 17 | **"Not collected" is a failing hunk for runtime and startup** | A collector that cannot run must not read as a clean one. Static image artefacts default to informational, and `HARNESS_REQUIRE_STATIC=1` makes them fail | `src/compare/runtime.ts`, `src/compare/image-static.ts`, `docs/bus.md` |
| 18 | **Freeze the clock for both sides** | Time-derived stats differ only when a boundary falls between the two sides. `HARNESS_NOW` makes them deterministic, and the apps must derive stats from it | `docs/harness-now.md`, `fixtures/clock/README.md`, `compose.harness.yaml` |
| 19 | **Seams before backends** | The monorepo may leave Supabase or add a bus. Persistence, bus and migration each sit behind a small interface with a second, in-memory implementation in the tests | `src/persistence/recorder.ts`, `src/bus/transport.ts`, `src/migration/backend.ts`, `tests/persistence-seam.test.ts` |
| 20 | **Local-first: workflows are thin wrappers, nothing exists only inside one** | Every step a workflow takes is a harness command with a local twin, held together by a parity test. GitHub adds scheduling, dispatch and a place to keep state | `docs/local.md`, `src/local/tasks.ts`, `tests/local-parity.test.ts` |
| 21 | **The local noise store is the machine's own calibration** | A laptop's Chromium has a different noise floor from a Linux runner's, so the gate applies the same rule to a local status and a CI status must not be copied in | `src/local/noise-store.ts` (`defaultNoise`), `docs/local.md` |
| 22 | **The harness never writes to a pull request** | It holds no token for the monorepo and no PR, check or status permission. It writes `report.md` as a comment-shaped artifact, and the monorepo posts it. Four write scopes on this repository, tested | `docs/contract.md` "What the harness does to a pull request", `docs/contract/workflows.json` |
| 23 | **A FAIL can be overridden only by saying so to the harness** | A bypass in branch protection is invisible. An override keeps the verdict FAIL, exits 0, and records who and why, so the count of overrides measures whether the gate is trusted or merely tolerated | `src/override.ts`, `src/local/override-log.ts`, `release.yml` `override-record` |
| 24 | **The release record is evidence, never a gate** | The harness cannot see what production really runs, only what the deploy reports (the overlay pins that `deploy.yml` verified). A mismatch or a missing record turns a PASS into a WARN and never softens a FAIL | `src/release-record.ts`, `docs/contract.md` "Checking a deployment" |
| 25 | **A checkout gets its own stack name, and a legacy name is never touched** | Two checkouts once shared `tutors-harness` and replaced each other's stack. The default is derived from the path, and a cluster or project called `tutors-harness` is assumed to be somebody else's | `src/project.ts`, `tests/project-name.test.ts` |
| 26 | **kind under restricted PSA stands in for a cluster; OpenShift is out of scope** | Restricted PSA requires the same security context as OpenShift's restricted SCC, so a release that passes admission here would pass there. Routes and arbitrary UIDs are not rehearsed, and the harness does not claim to | `deploy/kind/README.md`, `docs/local.md:13` |
| 27 | **The contract is versioned and held to the code by a test** | The monorepo builds against `docs/contract.md`, so a drift between document and code fails a test rather than a release | `docs/contract.md`, `tests/contract.test.ts`, `docs/contract/*.json` |

## Decisions the code makes that are worth questioning

Not defects, but places a reviewer should look:

- **Mann-Whitney is hand-written and dependency-free**, and the version in this
  branch has the wrong normal CDF argument, which made every p-value too small.
  The pending PR fixes it in `src/compare/stats.ts` and shows that three runs a
  side can never reach alpha 0.05 (`docs/releases/1.3.0.md` on
  `feat/harness-1.2.1-followups`). The nightly and release defaults move from 3
  runs to 5.
- **`ENGINE_PATHS` is a list a person maintains.** The pending PR widens it and
  adds a test that fails when a new top-level entry is in neither the engine list
  nor the non-engine list, because the list "could quietly rot".
- **The deployed digests come from the deploy job, not from production**
  (decision 24). The monorepo now promotes the judged rc digest on the final tag
  instead of rebuilding it (#303), so the digests match by construction for a
  promoted app, and `deploy.yml` (#298) sends them. It sends three, and the
  harness will record four once the time app lands, so expect an `incomplete`
  warning until one side changes (`04-dynamic.md` 4c-1, inferred).
- **k6 is `grafana/k6:latest` unless pinned** with `HARNESS_K6_IMAGE`; `harness
  doctor` warns (`docs/local.md` X6).
- **Journeys are six, not a hundred.** A journey is added only when a real
  regression escaped that one would have caught (`README.md`, "Where to stop").
  The README's count of "twelve" is stale.

## Monorepo-side decisions the harness depends on

Not the harness's decisions, but the ones its verdicts rest on. Read from the
monorepo's `origin/main` (`c14c3ee`).

| Decision | Why | Look at |
| --- | --- | --- |
| **The final tag promotes the judged rc digest; it does not rebuild** | The harness judges `X.Y.Z-rc.N`, so the release must ship those bytes. An app that cannot be promoted is rebuilt with a `REBUILT` warning, and `require_promotion` turns that into a failure | monorepo `scripts/promote-image.ts`, `image-build.yml` (#303) |
| **One image publisher** | Two workflows publishing the same tags could disagree about digests and signatures. The harness pins the identity of `image-build.yml` | monorepo `image-build.yml`; `images.yml` removed (#305) |
| **Deploy overlays are pinned by digest and verified before anything is announced** | A tag can move; the runtime pulls the digest. The `deployed` event carries what was pinned, verified against the registry and signature | monorepo `deploy.yml`, `scripts/checks/deploy-pins.ts` (#298) |
| **The local trigger builds the same payload as the workflow** | Judging a candidate should not need GitHub; a test holds the script and the workflow to the same fields | monorepo `scripts/release-harness.ts` (#307) |
