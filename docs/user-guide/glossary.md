# Glossary

Terms as this guide uses them. Where a term has a chapter, it is linked. The Lean terms (jidoka, andon, visual management, standard work, gemba, kaizen) are set out in [docs/lean.md](../lean.md).

**5 Whys.** The kaizen tool: ask why a finding happened, up to five times, each answer checkable against an artefact, a PR or a document, until the answer is a process or a tool; then choose one countermeasure. `harness why` writes the file with Why 1 already answered from the run's trace; `harness why check` checks it. "Human error" is not an answer; it is the prompt for the next why. [10](10-running-a-release.md#when-a-trigger-fires-the-5-whys), [kaizen/README.md](../../kaizen/README.md)

**A/A run.** A `noise`-mode run: the production tag against itself. Every difference it finds is noise. Its result is the noise status. [01](01-concepts.md#noise-and-release-the-gate), [05](05-noise-and-self-test.md)

**A/B run.** A `release`-mode run: production (side a) against the candidate (side b).

**andon.** In Lean, the signal anyone may pull to stop the line. Here: `line stopped at <stage>: <why>` from `harness release`, a Gate FAIL, a Red band, a rollback issue, or a run rule firing on the scoreboard. Each is shown where the whole team reads it and each opens a 5 Whys.

**app.** One of the monorepo's deployable images: `reader`, `catalogue`, `live`, `time`. A side has one image per app.

**artefact.** One kind of observable thing the harness captures and compares (`dom`, `headers`, `sbom`, and so on; nineteen). Claims and masks name artefacts. [01](01-concepts.md#artefacts)

**attribution.** In the mutant self-test: a mutant is attributed when the unclaimed hunks of its FAIL include an artefact the mutant was expected to trip. Catching a mutant for the wrong reason does not count. [05](05-noise-and-self-test.md#the-mutant-self-test)

**band.** Where the RCS falls: **Green** (90 or more: ship on the Captain's say), **Amber** (75 to 89: ship only when every glance item is marked verified), **Red** (below 75: hold and open a 5 Whys). Fixed; not tuned per release. [03](03-reading-a-report.md#2-the-score-and-its-band)

**banner (provenance banner).** The warning at the top of `report.md` and `report.html` when a side did not run signature-verified registry images. [03](03-reading-a-report.md#provenance-banners)

**blind spot.** Anything the harness does not compare: a mask, a threshold, an artefact that could not be collected. A mask is a blind spot someone chose.

**broad claim.** A claim whose artefact is `*`, or whose scope is `*`, `**` or only stars. It needs `approvedBy` or it fails the run. [04](04-writing-claims.md#broad-claims-and-hygiene)

**built-from-ref.** Provenance of an image built on this machine from a monorepo git ref because the registry had no such tag. It is not the image that ships and is not evidence for a release. [02](02-running-locally.md#where-the-images-come-from)

**cached.** Provenance of an image restored from the image cache because the registry could not be reached. It was verified when it was cached, but the tag may have moved. A noise run on one is degraded.

**candidate.** The release candidate: side b of a `release` run, tagged `X.Y.Z-rc.N`.

**canonical form.** The single spelling `content-type` and `cache-control` values are put in on both sides before comparing (directives sorted, default charset dropped, legacy JavaScript media types folded). A change of value still differs; a re-spelling does not. [03](03-reading-a-report.md#post-deploy-against-a-live-site)

**Captain.** The SOP role that runs a release and owns the go or no-go. [10](10-running-a-release.md#the-roles)

**capture.** Everything recorded for one side of a run (`a/capture.json`, `b/capture.json`, screenshots, k6 output). `harness compare` re-judges captures without re-running stacks.

**change risk.** The RCS dimension `harness changes` measures: 100 minus the sum of every PR's deductions (churn, hotspots, ownership, orphans, test delta, major bumps); a PR with no approving review breaches its floor. [03](03-reading-a-report.md#5-the-per-pr-change-table)

**claim.** A statement in the release's claims file that a difference is intended: an artefact, a scope glob, a reason or a Rule, and optionally `approvedBy`. [04](04-writing-claims.md)

**claim hygiene.** A section of the report: hunks per claim, and claims that cover many hunks or are broad. Informational; it never gates.

**compose.** The default substrate: two Docker Compose stacks from `compose.harness.yaml`, under a project name derived from the checkout's path.

**contract.** What the monorepo and other consumers may rely on: `docs/contract.md` and the files in `docs/contract/`. Versioned separately from the harness. [07](07-reference.md#contract-version-compatibility)

**countermeasure.** What a 5 Whys ends in: one change to the system, of exactly one of seven kinds (mutant, journey, mask review, EARS spec, claim guidance, SOP change, glance rule), with an owner and a due date. Never "be more careful". A mutant is the best kind: it turns the escape into a permanent self-test.

**degraded.** A noise status (or night) whose evidence is weak even with zero hunks: an image was not pulled and signature-verified in that run. A degraded status is never trusted by the gate and does not extend the clean streak.

**digest.** The `sha256:` identifier of an image manifest. A tag can move; a digest cannot.

**dimension.** One of the eight parts of the RCS (claim coverage, noise health, statistical margin, rehearsals, test signal, requirements traceability, change risk, post-deploy history), each 0 to 100 with a weight and a floor. [01](01-concepts.md#the-gate-and-the-score)

**dispatch.** A `repository_dispatch` event sent to this repository by the monorepo: `release-candidate` or `deployed`. [06](06-ci-integration.md#the-release-candidate-dispatch)

**doctor.** `harness doctor`: the read-only check of what a machine lacks to run the harness.

**edge.** The proxy in front of both readers in `upgrade` mode; it switches new requests from a to b.

**engine.** The code that compares one artefact between two captures. Also, loosely, the code paths whose change requires a version bump and a mutants re-run.

**floor.** A condition on one dimension (a broad claim, a degraded A/A, a skipped rehearsal, a PR merged without review, and so on) that, when breached, caps the RCS at 74, so one hollow dimension cannot hide behind seven strong ones.

**frozen clock.** `HARNESS_NOW`, one instant given to the browser and every container so that time-derived output is identical on both sides.

**gate (the Gate).** The rule that turns a comparison into a verdict (PASS, WARN or FAIL), and the verdict itself: shown first in every report, and the only thing that decides the exit code. It includes the rule that release and post-deploy mode may only FAIL while the A/A is clean, verified and fresh. [01](01-concepts.md#noise-and-release-the-gate)

**gemba.** Lean for "the real place": go to the artefact and look, instead of reading a summary. Here, the Reviewer's glance: each item links to the hunk, the claim and the PR.

**glance (the reviewer's glance).** At most seven places to look, ranked by novelty × exposure, at the top of a release report under the RCS. The Reviewer marks each one at SOP step 8. [03](03-reading-a-report.md#4-the-reviewers-glance)

**guard.** A check run on a pull request against a base ref: masks land in their own PR, an engine change needs a version bump, and the scoreboard only gains lines. `harness guard`. [05](05-noise-and-self-test.md#guards)

**HARNESS_HOME.** The directory where the harness keeps what outlives a run on this machine: the noise store, release records, the override log, the image cache. Default `<checkout>/.harness`. [02](02-running-locally.md#where-state-lives)

**hunk.** One difference an engine found: an artefact, a scope, a summary, a severity. [03](03-reading-a-report.md#how-to-read-a-hunk)

**image cache.** A `docker save` of the last verified production images, used only when the registry cannot be reached.

**info (severity).** A hunk that is reported and never gates.

**jidoka.** Lean for stopping the line when something is wrong, so bad work is not handed on. Here, the Gate: an unclaimed difference stops the release, and no score talks it back on. A dirty A/A stops `harness release` before any A/B.

**journey.** A scripted path through the apps. Six exist, in three sets. [01](01-concepts.md#journeys)

**kaizen.** Lean for continuous improvement of the system. Here: every stop or drop in confidence ends in a 5 Whys and one countermeasure, recorded in the kaizen register until a release shows it working. [kaizen/README.md](../../kaizen/README.md)

**kaizen register.** `kaizen/README.md`: every 5 Whys with its trigger, countermeasure, owner, due date and the release it was verified closed in. The table is generated by `harness why register --write`, never edited by hand; CI fails when it is out of date.

**kind.** The alternative substrate: two namespaces in a local kind cluster.

**licence (the harness's right to fail).** Informal name for the gate's condition that a fresh, clean, verified noise status exists.

**local build.** An image present on the machine that was never pulled (a `docker compose build`, a mutant). Recorded as `local`, not verified.

**Main to RC.** `main-preview.yml`: release mode every day with production on side a and the newest signed images of `main` on side b, against main's claims. A forecast of the next candidate's report, never a gate; the live example on the report pages. [06](06-ci-integration.md#main-to-rc-the-live-exemplar)

**mark.** The Reviewer's record for one glance item: **verified** (looked, and agrees with the claim), **disputed** (looked, and does not agree: a new claim or a hold) or **escalated** (cannot tell from the artefacts: a 5 Whys). `harness glance mark` appends it to `glance-marks.jsonl`.

**mask.** A field, header, series or pattern the harness deliberately does not compare, with a reason. [01](01-concepts.md#normalising-and-masks)

**mode.** What a run is for: `noise`, `release`, `any-two`, `migration`, `upgrade`, `post-deploy`.

**mutant.** A candidate image with one planted regression, built from the production reader image. The harness must fail it and attribute the failure. Ten exist. [05](05-noise-and-self-test.md#the-mutant-self-test)

**noise.** A difference between two runs of the same image. Not a release difference.

**noise status.** `noise-status.json`: `{ schemaVersion, ranAt, clean, hunks, degraded? }`, written by a noise run.

**noise store.** The local directory `<HARNESS_HOME>/noise` holding the latest status, the history and the summary: the `noise` branch of the workflows as a directory.

**normalise.** Make the two captures comparable before diffing: replace each side's origin, apply the masks.

**NOT COLLECTED.** The one text (`NOT COLLECTED: <what> of <app> on side b: <reason>`) and hunk scope (`<app>/not-collected`) an artefact that could not be gathered uses. Informational unless the artefact is required (`runtime` and `startup` always; others through `HARNESS_REQUIRE_ARTEFACTS`). [03](03-reading-a-report.md#degraded-and-not-collected)

**not measured.** A dimension or signal the harness had no input for. It is said, with the reason and the input that would measure it, and left out of the mean. It is never scored 100 and never drawn as a value.

**override.** Accepting a FAIL on the record: `--override-reason` and `--override-by`. The verdict stays FAIL, the exit code is 0, the report and an override log record who and why. [06](06-ci-integration.md#overrides-and-the-record-they-leave)

**page key.** The name of a page in a journey, such as `reader:lab-step`, used in scopes.

**persistence stub.** A Supabase-shaped stub per side that records every write the reader attempts, so writes are attributable to a side.

**post-deploy.** The mode (and the workflow) that replays the reference journeys against live production and compares with the recorded candidate.

**production tag.** The tag that is deployed, and so the tag to pass as `--a`. Held in the repository variable `HARNESS_PRODUCTION_TAG`.

**provenance.** Where an image came from: `local`, `pulled+verified`, `pulled-unverified`, `built-from-ref`, `cached`.

**prune.** `harness prune`: free old run directories under `out/` and an old image cache; a dry run unless `--yes`. [02](02-running-locally.md#disk-harness-prune)

**pulled+verified.** Pulled from a registry and its cosign signature verified, by digest, against the monorepo's build workflow identity. The only provenance that is evidence for a release.

**ratchet.** The rule that once the nightly A/A count has reached zero on verified evidence it must stay there; otherwise the night fails. [05](05-noise-and-self-test.md#the-ratchet-and-the-streak)

**RCS (Release Confidence Score).** 0 to 100: the weighted mean of the measured dimensions, rounded down, capped at 74 when a floor is breached. Computed only when the Gate is PASS or WARN. Advisory: it never feeds the Gate or changes an exit code. `confidence.json`. [01](01-concepts.md#the-gate-and-the-score)

**redaction.** Secret-shaped values (an `apikey=` value, `Authorization`, a bearer token, a JWT, Supabase keys) are replaced with `<redacted>` before a capture or report holds them. [01](01-concepts.md#normalising-and-masks)

**rehearsal.** A mode that tests a process rather than comparing captures: `migration` and `upgrade`.

**release record.** What release mode judged, for a later deployment check: the candidate's digests and the verdict. `releases/<candidate>.json` and `releases/<release>.json`.

**release-command directory.** `out/<UTC timestamp>-release-command/`: what `harness release` writes, whatever happens: `report.md`, `report.html`, `gate.md`, `gate.json`, `status.json`, `confidence.json`, `changes.json`, `glance-marks.jsonl`, `kaizen/`.

**Reviewer.** The SOP role that does the glance (step 8): a second person who authored no PR in the release. Rotates every release.

**Rule.** A numbered requirement in the monorepo (`0031`) that a claim may cite.

**rules file.** `rules.json`, published by the monorepo at the candidate tag: the Rules a claim may name with `rule: "0031"`.

**run directory.** `out/<UTC timestamp>-<mode>/`: one run's reports and captures.

**run rule.** A rule from statistical process control that acts on a trend, not on one release: three declines in a row, or two of the last three releases below 75, in the RCS or any dimension; and open countermeasures rising three releases running. A firing opens a 5 Whys. [10](10-running-a-release.md#step-12-close-the-release)

**scope.** The part of a hunk a claim's glob is matched against: `reader:course`, `reader:course/content-security-policy`, `GET /api/presence`, `reader/@sveltejs/kit`. A claim also matches a hunk's page path.

**scoreboard.** `scoreboard/releases.jsonl`: one line per release run, append-only, and the six trend views and run rules `harness scoreboard trends` draws from it, beside the harness's own health. CI keeps it on the `scoreboard` branch. [06](06-ci-integration.md#the-scoreboard-branch)

**side.** One of the two stacks: a (production) and b (candidate).

**smoke.** `harness local smoke` (`pnpm smoke`): both stacks boot, one journey runs as an A/A, the expanding migration passes and the contracting one is rejected. What CI runs on every pull request. [02](02-running-locally.md#the-two-stacks-smoke-harness-local-smoke)

**SOP (standard operating procedure).** The monorepo's `release/SOP.md`: three roles, twelve steps, one owner and one done-when per step. [10](10-running-a-release.md)

**stale claim.** A claim that matched no hunk in this run. Reported, never gates.

**standard work.** Lean for doing a repeated job the same way each time, written down, and improving the written way. Here, the SOP and the one command `harness release`.

**streak.** Consecutive clean, verified nightly A/A results. The burn-down target is seven.

**substrate.** What the stacks run on: `compose` (default) or `kind`.

**threshold.** A noise floor in `masks.yaml` (screenshot ratio, metrics tolerance, timing alpha and minimum effect). Loosening one is reviewed like a mask.

**unclaimed hunk.** A failing hunk no claim covers. What gates a release.

**verdict.** `pass`, `warn` or `fail`. [01](01-concepts.md#verdicts)

**visual management.** Lean for making the state of the work visible so everyone reads it the same way. Here: the Gate in one word, the RCS with its band and every point it lost, and the scoreboard over releases.

**vulnerability database.** grype's database, fetched once into `HARNESS_VULN_DB_DIR` (else `<HARNESS_HOME>/vuln-db`) by `harness vuln-db update` and never updated during a run, so both sides of a comparison see the same advisories. [02](02-running-locally.md#the-vulnerability-database)

**watch.** `harness local watch`: the local post-deploy monitor, once or every 15 minutes.
