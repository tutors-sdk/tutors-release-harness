# 03 Reading a report

Every run writes a directory `out/<UTC timestamp>-<mode>/` (for example `out/2026-09-17T14-00-00-release/`). The last lines a run prints are the verdict, the reasons and the path of the HTML report:

```text
verdict: FAIL
  - 3 unclaimed diff(s)
  - 1 claim(s) matched nothing and should be removed from the changelog
report: <checkout>/out/2026-09-21T11-26-16-release/report.html
```

- [The files](#the-files)
- [report.md: the pull-request comment](#reportmd-the-pull-request-comment)
- [report.html](#reporthtml)
- [report.json](#reportjson)
- [How to read a hunk](#how-to-read-a-hunk)
- [Provenance banners](#provenance-banners)
- [Degraded and not collected](#degraded-and-not-collected)
- [Real regression, noise or missing claim?](#real-regression-noise-or-missing-claim)
- [Timing and statistics](#timing-and-statistics)

## The files

| File | For | Notes |
| --- | --- | --- |
| `report.html` | people | one self-contained page (no scripts, no external requests): verdict, both sides, every hunk with the claim that covers it, the masks that fired |
| `report.md` | the pull-request comment | GitHub-flavoured Markdown, verdict first, then what needs a claim, then what is claimed. In CI it goes to the job summary; the harness never posts it to a pull request |
| `report.json` | programs | schema in `docs/contract/report.schema.json`. What gating and re-comparison read |
| `noise-status.json` | the gate | `noise` mode only: `{ schemaVersion, ranAt, clean, hunks, degraded? }` |
| `release-record.json` | the deployment check | `release` mode only: what was judged, with the digests of the candidate's images |
| `a/`, `b/` | re-comparison, debugging | each side's `capture.json`, screenshots, k6 output. Not part of the contract; `harness compare` reads them |
| `diff/` | debugging | screenshot difference images, written for a failing screenshot hunk |

A run that stops with exit `2` may leave no report. An invalid claims file stops the run before any output directory is created.

## report.md: the pull-request comment

This is a real report. It was built without Docker from the harness's own test-fixture captures (the recipe is in [chapter 9](09-extending.md#trying-an-engine-or-a-claim-without-docker)) with five deliberate differences between a and b, then judged with `harness compare` against three claims and a clean A/A. The icon before the verdict (a tick, a warning sign or a cross) is left out here; digests are shortened.

```markdown
## [icon] Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.0` | `quay.io/tutors-sdk/tutors-reader:16.3.0-rc.1` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.0` | `quay.io/tutors-sdk/tutors-catalogue:16.3.0-rc.1` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.0` | `quay.io/tutors-sdk/tutors-live:16.3.0-rc.1` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:aaaa...` · rev `1a2b3c4d5e6f` · version `16.2.0` | `sha256:bbbb...` · rev `9f8e7d6c5b4a` · version `16.3.0-rc.1` |
| catalogue image | ... | ... |
| live image | ... | ... |

- 3 unclaimed diff(s)
- 1 claim(s) matched nothing and should be removed from the changelog
- A/A consulted: clean at 2026-09-21T11:26:14.000Z

### Unclaimed differences (3)

| artefact | scope | what changed |
|---|---|---|
| `console` | `reader:course` | reader:course: new console message on b |
| `metrics` | `reader/tutors_course_loads_total` | reader: tutors_course_loads_total moved by 1 on a and 9 on b under the same traffic |
| `focus` | `reader:course` | reader:course: keyboard order changed (3 stops on a, 2 on b) |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Claimed differences (2)

| artefact | scope | claimed by |
|---|---|---|
| `dom` | `reader:course` | Rule 0031: Lab steps show their estimated reading time |
| `headers` | `reader:course/content-security-policy` | fix(reader): #270 CSP allows the new video host |

### Claim hygiene

3 claim(s) cover 2 failing hunk(s): 0.67 hunk(s) per claim, at most 1 under one claim (flagged above 10).

<details><summary>Stale claims (1)</summary>

- `network` `GET /api/presence` — Rule 0044: Presence is polled every 15 seconds

</details>

<sub>harness 1.3.0 (164963a0b8cf, contract 1.3.0) · 2026-09-21T11:26:16.613Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×2, request-id×2, metrics-process×4</sub>
```

Read it top to bottom.

1. **The heading** carries the mode and the verdict. `FAIL` here means: at least one failing hunk has no claim, and the A/A rule is met (the noise status line says the A/A was clean and fresh).
2. **The banner slot.** If a side did not run signature-verified registry images, a warning appears here, above the table ([provenance banners](#provenance-banners)). There is none in this example. A banner about deployed images (post-deploy mode) would also appear here.
3. **The sides table.** The image reference of each app on each side, then the **provenance**, then the registry digest, source revision and version of each image. This is how you check that the two sides are the two things you meant to compare. A digest of "no registry digest" means the image was not pulled from a registry.
4. **The reasons**, one line each. The first line is the headline. Other lines you will meet: `advisory only: ...` (the harness had no right to fail), `OVERRIDDEN by ...`, `NOT COLLECTED: ...`, `DEPLOYED IMAGES DIFFER ...`, and the `A/A consulted` line.
5. **Unclaimed differences** are what gates. Each row is one hunk: the artefact, the scope (what a claim's glob must match), and a one-line summary. This table is the to-do list.
6. **Claimed differences** show which claim covers each hunk, so a reviewer can see that the claim says what the hunk does. The label is the claim's reason, or `Rule NNNN: <title>` for a claim that names a Rule.
7. **Claim hygiene.** Claims, failing hunks they cover, hunks per claim; a table appears only if a claim covers more hunks than the threshold or is broad but approved.
8. **Stale claims**, in a fold. A claim that matched nothing. Remove it, or find out why the release did not change what it said it would.
9. Further sections appear when they apply: *Harness FAIL overridden*, *Deployment*, *Image artefacts*, *Migration rehearsal*, *Upgrade rehearsal*, *Load* (k6 requests, failures, p50 and p95 per side) and, in a fold, the *Informational* hunks (`info` severity: never gate, worth a skim).
10. **The footer** names the harness version, git sha and contract version, the run time, the frozen clock, the number of runs, and the masks that fired. Two reports are comparable only when they carry the same harness version.

## report.html

The same content as one page, in this order: the title with a coloured verdict badge; the time, the frozen clock, the run count and the harness version; the banners; the reasons list (including the A/A line); the sides table; the provenance table; the deployment table, the image artefacts table and the rehearsal and load tables when they apply; **Differences** (every hunk, failing and informational); stale claims; broad claims without approval; the override, if any; claim hygiene; the masks, split into *Fired* and *Silent this run*; and the footer.

The Differences table has four columns: artefact, scope (with the page path underneath), what changed (with a fold for the detail), and *claimed by*. A failing hunk with no claim says **unclaimed** in red; an information hunk says *informational* and is dimmed. The detail of a `dom` or `focus` hunk is a small diff (lines starting with `-` exist on a, `+` on b). A `screenshot` hunk's detail names the difference image under `diff/`.

The Masks section is worth a glance: a mask listed under *Silent this run* never changed anything, and a maintainer should consider deleting it.

## report.json

The report is the machine-readable record. Its shape (`additionalProperties: false` throughout, so a field not listed in the contract is not written), abridged from the same run:

```jsonc
{
  "schemaVersion": 1,                      // the contract's major version: refuse a value you do not know
  "harness": { "version": "1.3.0", "gitSha": "164963a0...", "contractVersion": "1.3.0" },
  "mode": "release",                       // noise | release | any-two | upgrade | migration | post-deploy
  "substrate": "compose",
  "ranAt": "2026-09-21T11:26:16.613Z",     // when the comparison was judged (wall clock)
  "now": "2026-09-16T09:05:00.000Z",       // the frozen clock both sides were given
  "runs": 1,
  "sides": { "a": { "reader": "quay.io/tutors-sdk/tutors-reader:16.2.0", "...": "..." }, "b": { "...": "..." } },
  "provenance": { "a": { "summary": "pulled+verified", "images": { "reader": {
      "ref": "quay.io/tutors-sdk/tutors-reader:16.2.0", "digest": "sha256:aaaa...", "revision": "1a2b3c4d...",
      "version": "16.2.0", "provenance": "pulled+verified", "verifiedIdentity": "^https://github.com/tutors-sdk/..." } } } },
  "verdict": "fail",                       // pass | warn | fail
  "reasons": ["3 unclaimed diff(s)", "1 claim(s) matched nothing ..."],   // for people: do not parse
  "noise": { "schemaVersion": 1, "ranAt": "2026-09-21T11:26:14.000Z", "clean": true, "hunks": 0 },
  "compare": {
    "hunks": [ { "id": "dom:reader:course:1", "artefact": "dom", "scope": "reader:course", "path": "/course/localhost:8080",
                 "severity": "fail", "summary": "reader:course: semantic DOM differs (+1 −1 lines at line 2)", "detail": "..." } ],
    "matches": [ { "hunk": { "...": "..." }, "claim": { "artefact": "dom", "scope": "reader:course", "reason": "Rule 0031: ...", "rule": "0031", "ruleTitle": "..." } } ],
    "unclaimed": [ "failing hunks no claim covers: what gates" ],
    "staleClaims": [ { "artefact": "network", "scope": "GET /api/presence", "reason": "Rule 0044: ...", "rule": "0044", "ruleTitle": "..." } ],
    "broadUnapproved": []                  // broad claims without approvedBy: gate in release and post-deploy
  },
  "masksApplied": { "response-date": 2, "request-id": 2, "etag": 0, "metrics-process": 4 },   // 0 = a silent mask
  "claimHygiene": { "claims": 3, "claimedHunks": 2, "hunksPerClaim": 0.67, "maxHunksPerClaim": 1, "threshold": 10, "flagged": [] }
}
```

Other optional fields appear when they apply: `imageArtefacts` (per side, per app: was each of manifest, SBOM and vulnerabilities collected, and if not, why), `load`, `migration`, `upgrade`, `override`, and `deployment` (post-deploy mode). To check whether a run is evidence for a release, read `verdict`, `provenance.*.images.*.provenance` (all `pulled+verified`), `compare.unclaimed.length`, `compare.broadUnapproved.length` and `noise`. A consumer must tolerate an artefact name or provenance value it does not know.

## How to read a hunk

A hunk is `{ id, artefact, scope, path?, summary, detail?, severity }`. The **scope** is what your claim will match; the **path** is the page's route (a claim's glob also matches it); the **summary** says what changed; the **detail** shows it.

What the summaries look like, per artefact:

| Artefact | Summary | Detail |
| --- | --- | --- |
| `dom` | `reader:course: semantic DOM differs (+1 −1 lines at line 2)` | a diff of the accessibility snapshot: `-  - link "Topic 1"` then `+  - link "Topic 1 (4 min read)"` |
| `dom` | `journey "student-signs-in" completed on a but failed on b` | the error b hit. Not a claim: a journey that breaks is a bug |
| `screenshot` | `reader:home: 0.42% of pixels differ (threshold 0.10%)` | `diff image: diff/<file>.png` |
| `network` | `reader:course: new request on b: GET /api/presence` / `request no longer made on b` / `requested 1× on a, 2× on b` / `... status changed: 200 → 304` | |
| `console` | `reader:course: new console message on b` | `error: Failed to load resource: 404 /assets/logo.svg` |
| `headers` | `reader:course: header added on b: content-security-policy: ...` | |
| `axe` | `reader:topic: new axe violation on b: color-contrast (serious)` | the CSS target |
| `focus` | `reader:course: keyboard order changed (3 stops on a, 2 on b)` | the stops, diffed |
| `metrics` | `reader: tutors_course_loads_total moved by 1 on a and 9 on b under the same traffic` / `series missing on b` / `new series on b` | |
| `logs` | `reader: new log field on b: traceId` / `info-level lines: 28 on a, 60 on b` / `request-id propagation fell from 90% to 40%` / `logs are no longer JSON lines on b` | |
| `persistence` | `student-signs-in: POST progress — 1 row(s) on a, 2 on b` / `anonymous-student-reads-course: anonymous journey wrote 1 row(s) to learner (POST) on b` | |
| `timing` | `reader:course TTFB slower on b: median 40ms → 90ms (+125%, p=0.012, n=5/5)` | |
| `image-manifest` | scope `reader/user`, `reader/base`, `reader/ports/3000` ... | |
| `sbom` | scope `reader/@sveltejs/kit`: name, version on a, version on b | |
| `runtime`, `startup` | scope `reader/uid`, `reader/ready`, ... | |

`info` hunks (a message gone on b, an axe violation fixed, a size that shrank, a tightened posture) never gate and need no claim. Read them anyway: they are how you notice that a fix landed, or that a check quietly stopped.

## Provenance banners

The provenance line under the sides table says where each side's images came from. A banner appears at the very top of `report.md` and `report.html` when a side is not a published, signature-verified image. This is real output for a side built from source (the banner starts with a warning sign, left out of the icon-free rendering here):

```markdown
> [warning sign] **Side b did not run signature-verified registry images (built-from-ref v16.3.0-rc.1@9f8e7d6c5b4a). This run is not evidence about the images that ship.**
```

and the reasons gain `side b was built here from monorepo ref v16.3.0-rc.1, not pulled from the registry: it is not the image that ships`.

| Provenance | Meaning | Banner? | What to do |
| --- | --- | --- | --- |
| `pulled+verified` | pulled from a registry; cosign signature verified by digest against the monorepo's build identity | no | nothing: this is the only evidence for a release |
| `local` | present on the machine and never pulled (your own build, a mutant) | no | fine for investigation, not for a release decision |
| `pulled-unverified` | pulled but not verified; judged only because `--allow-unsigned` was given | yes | rerun without the flag once cosign is set up |
| `built-from-ref` | built here from a monorepo git ref because the registry had no such tag | yes | push the tag so the registry has it; do not rely on this run |
| `cached` | restored from the image cache because the registry was unreachable | yes | wait for the registry; the tag may have moved |

The banner does **not** change the verdict: a run with a banner can still say FAIL and exit 1. It changes what the verdict is worth. A release decision should rest on `pulled+verified` on both sides.

## Degraded and not collected

Two ways a report says "I could not see this", both loud on purpose.

**Degraded.** A noise run (nightly, with `--require-verified`) whose evidence is weak. The verdict is `WARN` even with zero hunks:

```text
A/A is clean but DEGRADED, so it does not count: side a did not run pulled+verified images (cached ...)
```

The noise status carries `degraded: [...]`. The gate never trusts a degraded status, so release runs made against it only warn:

```text
advisory only: the last A/A run (2026-09-21T13:25:01.000Z) was degraded and does not count: reader: cached
```

**Not collected.** An artefact that could not be gathered: no SBOM attestation for a locally built image, syft or grype not installed, a container that could not be inspected, a restart that could not be driven. It appears as a line in the reasons and, in the Image artefacts table, as a cell:

```text
NOT COLLECTED: sbom of reader, catalogue, live on side b: <reason>. It was not compared.
```

For the image artefacts it is an informational hunk (`<app>/not-collected`), unless `HARNESS_REQUIRE_STATIC=1` makes it a failing one. For `runtime` and `startup` it is always a failing hunk (`runtime/not-collected`, `startup/not-collected`, `<app>/not-collected`): claim it only with a reason a reviewer can weigh, or fix the collector. An operator's choice (`--no-runtime`, `--startup-restarts 0`, always in `upgrade` mode and in the mutants) is informational and says so. A missing artefact is never a clean artefact.

**Deployed images.** In post-deploy mode, if the deploy told the harness what it deployed, the report has a *Deployment* section with the digests deployed against the digests judged, and a banner when they differ:

```text
The deployed images are NOT the ones release mode judged (16.3.0-rc.4): reader: deployed sha256:..., but release mode judged sha256:... (16.3.0-rc.4). This is a warning, not a verdict on the deployment.
```

`match`, `differs`, `incomplete`, `no-record` and `not-reported` are the five states; anything but `match` is a warning and turns a `pass` into a `warn`. It never turns anything into a `fail`.

## Real regression, noise or missing claim?

Work through an unclaimed hunk in this order.

**1. Was the harness allowed to fail?** Read the reasons. If the first reason starts `advisory only:`, the verdict is `WARN` because the harness had no clean, verified, fresh A/A to stand on. The hunks are still real findings; only the gate is missing. Fix the evidence ([chapter 5](05-noise-and-self-test.md)) or treat the WARN as a review checklist.

**2. Does this hunk describe a change someone meant?** Compare the summary with the changelog and the Rules of the release.

| You find | It is | Do |
| --- | --- | --- |
| a hunk the changelog or a Rule describes | a **missing claim**, or a claim whose scope is too narrow | write or widen the claim ([chapter 4](04-writing-claims.md)). Check the claim's scope against the hunk's *scope and path* exactly; compare the *Stale claims* fold, which often holds the claim you meant |
| a hunk nobody intended (a console error, a lost focus stop, a dropped header, a slower page, a write on an anonymous journey) | a **real regression** | fix it in the release, or, if it is a conscious trade, claim it with a reason a reviewer will accept |
| a hunk that looks unrelated to any change and shows up in unrelated releases and in A/A runs (a date, an id, an ordering, a third-party host, a timing that is sometimes slower) | **noise** the masks do not cover | do not claim it: tell a maintainer. Check the nightly's noise report (`noise-report` artifact in CI, or `out/*-noise/report.html`) for the same scope. It is a mask or a determinism fix ([noise burn-down](../noise-burndown.md)) |
| a `not-collected` line | **missing evidence** | fix the tool or the image, do not claim it |

**3. Is it timing?** A single slower page in a run with dozens of pages is expected occasionally at alpha 0.05. See the next section. Never "fix" a flake by re-running until it goes away: the harness has no retries, on purpose.

**4. Is the run itself trustworthy?** Provenance banners, `DEGRADED`, an A/A older than seven days, a side with a different harness version: any of these changes what the run is worth.

**5. Try your fix without re-running the stacks.** Download the run's artifact, or use the run directory on your machine, and re-judge it with the new claims:

```console
pnpm harness compare --dir out/<run> --mode release --claims new-claims.yaml --rules rules.json --noise skip
```

`--noise skip` waives the A/A requirement (recorded in the report) so that you see what would fail regardless. It is for finding out, never a verdict.

## Timing and statistics

Timing is the only artefact that is statistical. Everything else is deterministic and needs one run; timing needs several, because one sample of a duration says nothing.

### What the engine does

For each page's document time to first byte (TTFB), each journey's duration, and, with `--load`, each k6 request's duration, the engine collects side a's samples and side b's samples (one sample per run for pages and journeys; hundreds for load) and asks whether b is *slower* beyond noise. A hunk is raised only when **all** of these hold:

1. b's median (p95 under load) exceeds a's by at least `timing.minEffect` (20%) **and** by at least `timing.minShiftMs` (20 ms). A move from 3 ms to 4 ms is +33% and means nothing.
2. There are at least `timing.minRuns` (3) runs on each side.
3. A Mann-Whitney U test gives a p-value below `timing.alpha` (0.05).

Mann-Whitney U compares two sets of samples by ranking them together; it needs no assumption about the shape of the timings. **Alpha** is how surprising a result must be before it counts: a p-value below 0.05 means a difference this large between two sets of this size would arise by chance less than one time in twenty. **Runs** are the samples per side for pages and journeys, set with `--runs`.

### How many runs

With few samples, no difference, however large, can be significant. For n runs a side, perfectly separated (every sample of b above every sample of a), the smallest p-value the test can produce is:

| runs a side | 2 | 3 | 4 | 5 | 6 | 8 |
| --- | --- | --- | --- | --- | --- | --- |
| best possible p | 0.245 | 0.081 | 0.030 | 0.012 | 0.005 | 0.0009 |
| can reach alpha 0.05 | no | no | yes | yes | yes | yes |

Three runs cannot reach 0.05. Four is the least that can. With one overlapping pair (one of b's samples below one of a's), 4 against 4 gives p = 0.061 and stops being significant, while 5 against 5 gives 0.022 and still is: five runs is the least that survives one overlap, and is what the nightly, the release workflow and the `slow-ssr` mutant use.

When the runs cannot reach alpha, the harness says so instead of looking quiet. The hunk is informational and reads:

```text
reader:course TTFB median 40ms → 130ms (+225%); 3/3 samples cannot reach alpha 0.05 (best possible p=0.081). Raise --runs
```

Below `minRuns` it says `N run(s), need 3 to judge. Raise --runs`. When the samples are enough but the shift is not significant it says `median 100ms → 130ms but not significant (p=0.222)`, also information. A significant one fails:

```text
reader:course TTFB slower on b: median 40ms → 90ms (+125%, p=0.012, n=5/5)
```

The fix for any of these is more runs (`--runs 5` or more), or, with a reason and its own reviewed change, a different threshold in `masks.yaml`. Never a retry. The cost of a run is one more pass of every selected journey on both sides.

### Load and startup

Under `--load`, the p95 comparison uses every k6 request as a sample, so there are hundreds and the p-value is tiny for any visible shift; the 20% and 20 ms guards do the work. The failure rate is compared separately: b's failed or 5xx rate more than half a percentage point above a's is a failing `load/errors` hunk. If k6 lost most of its requests, the engine says the samples cannot reach alpha and asks for a higher rate or duration.

`startup` restarts each app `--startup-restarts` times (default 5) and compares the time to the first healthy `GET /` and to the orchestrator's ready verdict with the same test and thresholds, plus a floor of `startup.minShiftMs` (250 ms) because startups are seconds long and compose's healthcheck only ticks every two seconds. Three restarts cannot reach alpha; five can.

### Reading a timing hunk

- Look at `n=`: is it the number of runs you meant?
- Look at the size: +20% and 20 ms is the floor, not a big regression.
- Look at whether the *same* page shows it in the nightly A/A. If it does, the cause is the machine or the harness, not the release.
- The two sides are captured one after the other (a, then b), so a machine that drifts can make b systematically different. Hunks that always point the same way in an A/A are harness bias, not noise ([noise burn-down](../noise-burndown.md#k6-timing-spread)).
