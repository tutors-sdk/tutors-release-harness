# Glossary

Terms as this guide uses them. Where a term has a chapter, it is linked.

**A/A run.** A `noise`-mode run: the production tag against itself. Every difference it finds is noise. Its result is the noise status. [01](01-concepts.md#noise-and-release-the-gate), [05](05-noise-and-self-test.md)

**A/B run.** A `release`-mode run: production (side a) against the candidate (side b).

**app.** One of the monorepo's deployable images: `reader`, `catalogue`, `live`, `time`. A side has one image per app.

**artefact.** One kind of observable thing the harness captures and compares (`dom`, `headers`, `sbom`, and so on; nineteen). Claims and masks name artefacts. [01](01-concepts.md#artefacts)

**attribution.** In the mutant self-test: a mutant is attributed when the unclaimed hunks of its FAIL include an artefact the mutant was expected to trip. Catching a mutant for the wrong reason does not count. [05](05-noise-and-self-test.md#the-mutant-self-test)

**banner (provenance banner).** The warning at the top of `report.md` and `report.html` when a side did not run signature-verified registry images. [03](03-reading-a-report.md#provenance-banners)

**blind spot.** Anything the harness does not compare: a mask, a threshold, an artefact that could not be collected. A mask is a blind spot someone chose.

**broad claim.** A claim whose artefact is `*`, or whose scope is `*`, `**` or only stars. It needs `approvedBy` or it fails the run. [04](04-writing-claims.md#broad-claims-and-hygiene)

**built-from-ref.** Provenance of an image built on this machine from a monorepo git ref because the registry had no such tag. It is not the image that ships and is not evidence for a release. [02](02-running-locally.md#where-the-images-come-from)

**cached.** Provenance of an image restored from the image cache because the registry could not be reached. It was verified when it was cached, but the tag may have moved. A noise run on one is degraded.

**candidate.** The release candidate: side b of a `release` run, tagged `X.Y.Z-rc.N`.

**capture.** Everything recorded for one side of a run (`a/capture.json`, `b/capture.json`, screenshots, k6 output). `harness compare` re-judges captures without re-running stacks.

**claim.** A statement in the release's claims file that a difference is intended: an artefact, a scope glob, a reason or a Rule, and optionally `approvedBy`. [04](04-writing-claims.md)

**claim hygiene.** A section of the report: hunks per claim, and claims that cover many hunks or are broad. Informational; it never gates.

**compose.** The default substrate: two Docker Compose stacks from `compose.harness.yaml`, under a project name derived from the checkout's path.

**contract.** What the monorepo and other consumers may rely on: `docs/contract.md` and the files in `docs/contract/`. Versioned separately from the harness. [07](07-reference.md#contract-version-compatibility)

**degraded.** A noise status (or night) whose evidence is weak even with zero hunks: an image was not pulled and signature-verified in that run. A degraded status is never trusted by the gate and does not extend the clean streak.

**digest.** The `sha256:` identifier of an image manifest. A tag can move; a digest cannot.

**dispatch.** A `repository_dispatch` event sent to this repository by the monorepo: `release-candidate` or `deployed`. [06](06-ci-integration.md#the-release-candidate-dispatch)

**doctor.** `harness doctor`: the read-only check of what a machine lacks to run the harness.

**edge.** The proxy in front of both readers in `upgrade` mode; it switches new requests from a to b.

**engine.** The code that compares one artefact between two captures. Also, loosely, the code paths whose change requires a version bump and a mutants re-run.

**frozen clock.** `HARNESS_NOW`, one instant given to the browser and every container so that time-derived output is identical on both sides.

**gate.** The rule that turns a comparison into a verdict, including the rule that release and post-deploy mode may only FAIL while the A/A is clean, verified and fresh. [01](01-concepts.md#noise-and-release-the-gate)

**guard.** A check run on a pull request against a base ref: masks land in their own PR, and an engine change needs a version bump. `harness guard`. [05](05-noise-and-self-test.md#guards)

**HARNESS_HOME.** The directory where the harness keeps what outlives a run on this machine: the noise store, release records, the override log, the image cache. Default `<checkout>/.harness`. [02](02-running-locally.md#where-state-lives)

**hunk.** One difference an engine found: an artefact, a scope, a summary, a severity. [03](03-reading-a-report.md#how-to-read-a-hunk)

**image cache.** A `docker save` of the last verified production images, used only when the registry cannot be reached.

**info (severity).** A hunk that is reported and never gates.

**journey.** A scripted path through the apps. Six exist, in three sets. [01](01-concepts.md#journeys)

**kind.** The alternative substrate: two namespaces in a local kind cluster.

**licence (the harness's right to fail).** Informal name for the gate's condition that a fresh, clean, verified noise status exists.

**local build.** An image present on the machine that was never pulled (a `docker compose build`, a mutant). Recorded as `local`, not verified.

**mask.** A field, header, series or pattern the harness deliberately does not compare, with a reason. [01](01-concepts.md#normalising-and-masks)

**mode.** What a run is for: `noise`, `release`, `any-two`, `migration`, `upgrade`, `post-deploy`.

**mutant.** A candidate image with one planted regression, built from the production reader image. The harness must fail it and attribute the failure. Ten exist. [05](05-noise-and-self-test.md#the-mutant-self-test)

**noise.** A difference between two runs of the same image. Not a release difference.

**noise status.** `noise-status.json`: `{ schemaVersion, ranAt, clean, hunks, degraded? }`, written by a noise run.

**noise store.** The local directory `<HARNESS_HOME>/noise` holding the latest status, the history and the summary: the `noise` branch of the workflows as a directory.

**normalise.** Make the two captures comparable before diffing: replace each side's origin, apply the masks.

**override.** Accepting a FAIL on the record: `--override-reason` and `--override-by`. The verdict stays FAIL, the exit code is 0, the report and an override log record who and why. [06](06-ci-integration.md#overrides-and-the-record-they-leave)

**page key.** The name of a page in a journey, such as `reader:lab-step`, used in scopes.

**persistence stub.** A Supabase-shaped stub per side that records every write the reader attempts, so writes are attributable to a side.

**post-deploy.** The mode (and the workflow) that replays the reference journeys against live production and compares with the recorded candidate.

**production tag.** The tag that is deployed, and so the tag to pass as `--a`. Held in the repository variable `HARNESS_PRODUCTION_TAG`.

**provenance.** Where an image came from: `local`, `pulled+verified`, `pulled-unverified`, `built-from-ref`, `cached`.

**pulled+verified.** Pulled from a registry and its cosign signature verified, by digest, against the monorepo's build workflow identity. The only provenance that is evidence for a release.

**ratchet.** The rule that once the nightly A/A count has reached zero on verified evidence it must stay there; otherwise the night fails. [05](05-noise-and-self-test.md#the-ratchet-and-the-streak)

**release record.** What release mode judged, for a later deployment check: the candidate's digests and the verdict. `releases/<candidate>.json` and `releases/<release>.json`.

**rehearsal.** A mode that tests a process rather than comparing captures: `migration` and `upgrade`.

**Rule.** A numbered requirement in the monorepo (`0031`) that a claim may cite.

**rules file.** `rules.json`, published by the monorepo at the candidate tag: the Rules a claim may name with `rule: "0031"`.

**run directory.** `out/<UTC timestamp>-<mode>/`: one run's reports and captures.

**scope.** The part of a hunk a claim's glob is matched against: `reader:course`, `reader:course/content-security-policy`, `GET /api/presence`, `reader/@sveltejs/kit`. A claim also matches a hunk's page path.

**side.** One of the two stacks: a (production) and b (candidate).

**stale claim.** A claim that matched no hunk in this run. Reported, never gates.

**streak.** Consecutive clean, verified nightly A/A results. The burn-down target is seven.

**substrate.** What the stacks run on: `compose` (default) or `kind`.

**threshold.** A noise floor in `masks.yaml` (screenshot ratio, metrics tolerance, timing alpha and minimum effect). Loosening one is reviewed like a mask.

**unclaimed hunk.** A failing hunk no claim covers. What gates a release.

**verdict.** `pass`, `warn` or `fail`. [01](01-concepts.md#verdicts)

**watch.** `harness local watch`: the local post-deploy monitor, once or every 15 minutes.
