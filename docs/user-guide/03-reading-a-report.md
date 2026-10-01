# 03 Reading a report

A release report is read top to bottom, and the order is the point: **the Gate, then the score and its band, then the glance, then the differences.** Stop at the first thing that decides. This chapter walks through one real report in that order, then covers each file and each kind of finding in detail.

The live example is **Main to RC** on the [report pages](https://tutors-sdk.github.io/tutors-release-harness/): every day, the newest signed images of the monorepo's `main` judged against production, exactly as a release candidate would be. It is the report the next candidate would get if it were cut today. How to produce your own is [chapter 10](10-running-a-release.md).

- [The exemplar: 16.2.2 against main](#the-exemplar-1622-against-main)
- [1. The Gate](#1-the-gate)
- [2. The score and its band](#2-the-score-and-its-band)
- [3. The eight dimensions, and where the points went](#3-the-eight-dimensions-and-where-the-points-went)
- [4. The reviewer's glance](#4-the-reviewers-glance)
- [5. The per-PR change table](#5-the-per-pr-change-table)
- [6. The differences](#6-the-differences)
- [7. The 5 Whys stubs](#7-the-5-whys-stubs)
- [The files](#the-files)
- [report.md: the pull-request comment](#reportmd-the-pull-request-comment)
- [report.html](#reporthtml)
- [report.json](#reportjson)
- [How to read a hunk](#how-to-read-a-hunk)
- [Provenance banners](#provenance-banners)
- [Degraded and not collected](#degraded-and-not-collected)
- [Post-deploy against a live site](#post-deploy-against-a-live-site)
- [Real regression, noise or missing claim?](#real-regression-noise-or-missing-claim)
- [Timing and statistics](#timing-and-statistics)

## The exemplar: 16.2.2 against main

The example is a real Main to RC run, kept on the `main-preview` branch of this repository: production `16.2.2` on side a, `sha-54a8f83` (the newest commit on the monorepo's `main` with signed images on 27 September 2026) on side b, 5 runs, k6 load, judged against main's claims so far. Fetch it:

```console
git fetch origin +refs/heads/main-preview:refs/remotes/origin/main-preview
git show origin/main-preview:reports/2026-09-27T09-14-51Z-release/report.md
```

That run was judged by harness 1.4.11, before the score, the glance and the change signals existed, so its own report stops at the differences. Sections 2 to 5 and 7 below are the same run scored with harness 1.13.0, from its `report.json` and the monorepo's git history, and nothing else:

```console
git show origin/main-preview:reports/2026-09-27T09-14-51Z-release/report.json > mp/report.json
pnpm harness changes --a 16.2.2 --b 54a8f83 --monorepo ../tutors-mono-repo --out mp/changes.json
pnpm harness confidence --run mp/report.json --change-risk mp/changes.json
pnpm harness why --run mp --finding band --tag sha-54a8f83
```

Every number below is output of those commands. A `harness release` report shows the same sections in the same order, in one file.

## 1. The Gate

The first line is the verdict. In a run's `report.md` it is the heading; in a `harness release` report it is `**Gate: <word>**` under the heading.

```markdown
## [warning sign] Release harness — release — WARN
```

Then the two sides. Check them before anything else: are these the two things you meant to compare?

```markdown
| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.2` | `quay.io/tutors-sdk/tutors-reader:sha-54a8f83` |
| ... | | |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:7567d592...` · rev `caa53d021e63` · version `16.2.2` | `sha256:af109450...` · rev `54a8f832d413` · version `sha-54a8f83` |
```

Both sides are `pulled+verified`: pulled from quay.io and their cosign signatures checked by digest. That is the only provenance that is evidence for a release ([provenance banners](#provenance-banners)). Side a's reader digest is the one in the monorepo's `release/deployed.json`, so side a is what production runs.

Then the reasons, one line each. The first is the headline:

```markdown
- advisory only: the last A/A run (2026-09-27T08:21:17.849Z) was degraded and does not count: journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages
- 865 unclaimed diff(s)
- A/A consulted: clean but DEGRADED (does not count) at 2026-09-27T08:21:17.849Z
```

**What it says.** The harness found 865 differences that no claim covers. It would fail on them, but it has not earned the right to: the nightly A/A it consulted was clean yet degraded, because one journey failed on both sides, so that night saw nothing of the reference course's pages. Without a clean, verified, fresh A/A, a FAIL comes back as **WARN** and exits `0` ([the gate](01-concepts.md#noise-and-release-the-gate)).

**What stops the line.** A FAIL. A WARN does not stop it, but its first reason says what is missing, and here it is the harness's own evidence. That is the first thing to fix.

| Gate | Means | Exit |
| --- | --- | --- |
| PASS | every difference claimed, and nothing else gates | `0` |
| WARN | findings the harness may not fail on (read the first reason), or weak evidence | `0` |
| FAIL | an unclaimed difference while the harness had the right to fail | `1` |
| NOT JUDGED | nothing was compared (`harness release` only: a stopped line before the A/B, Ctrl-C) | `2` |

## 2. The score and its band

Under the Gate, and only when the Gate is PASS or WARN, is the Release Confidence Score (RCS):

```text
Gate: WARN
RCS 27 Red: hold, open a 5 Whys, do not re-run hoping for a better number
  weighted mean 27.50 over 5 of 8 dimensions measured (weight 70 of 100, renormalised); the rest are not measured and not counted.
```

The RCS is the weighted mean of the dimensions that were measured, rounded down. Three were not measured here, so the mean is over a weight of 70: (20×0 + 15×45 + 10×80 + 10×0 + 15×30) ÷ 70 = 1925 ÷ 70 = 27.50. A breached floor caps the RCS at 74 whatever the mean; four floors are breached here.

| Band | RCS | What happens |
| --- | --- | --- |
| **Green** | 90 or more | ship on the Captain's say |
| **Amber** | 75 to 89 | ship only when every glance item is marked verified |
| **Red** | below 75 | hold, open a 5 Whys, do not re-run hoping for a better number |

A FAIL has no RCS and no band. The checked-in 16.2.1 → 16.2.2 run ([examples/release-16.2.1-to-16.2.2](../../examples/release-16.2.1-to-16.2.2/README.md)) is one, and `harness confidence` says so before anything else:

```text
Gate: FAIL
No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.
```

The score never feeds the Gate and never changes an exit code.

## 3. The eight dimensions, and where the points went

```text
  dimension                  weight  score         floor, points lost
  Claim coverage                 20  0             -100: 5 deduction(s)
  Noise health                   15  45            BREACHED (caps the RCS at 74)  -55: 4 deduction(s)
  Statistical margin             10  80            BREACHED (caps the RCS at 74)  -20: 1 deduction(s)
  Rehearsals                     10  0             BREACHED (caps the RCS at 74)  -100: 2 deduction(s)
  Test signal                    15  not measured  needs the monorepo's CI and Stryker mutation scores and the weekly harness mutants: pass --test-signal <json>
  Requirements traceability      10  not measured  needs the changelog, the EARS files and the claims side by side: pass --traceability <json>
  Change risk                    15  30            BREACHED (caps the RCS at 74)  -70: 60 deduction(s)
  Post-deploy history             5  not measured  needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json>
```

Each dimension is 100 minus its deductions, and every deduction names its evidence: a hunk in `report.html`, a PR, a file or a run. Read the lowest first.

- **Claim coverage 0.** −20 for each unclaimed hunk. The first five are listed with their links (`report.html#hunk-dom:reference-course-reads:1`, the failed journey, is first); the other 860 are "not counted again". Main's claims file was empty, so nothing was claimed.
- **Noise health 45, floor breached.** −40 because the A/A is degraded (the same fact as the Gate's first reason), and −5 for each of three masks that fired nothing (`realtime-rest-fallback-warning`, `transport-encoding`, `transport-transfer`): a mask that never fires is a mask to delete.
- **Statistical margin 80, floor breached.** −20 for a near miss: `anonymous-student-searches` took 2493 ms on a and 3006 ms on b, with p = 0.095. Not significant, and too close to call.
- **Rehearsals 0, floor breached.** This kept forecast (harness 1.4.11) ran release mode only, so the migration and upgrade rehearsals are reported as skipped (−50 each). Since 1.13.1 Main to RC runs both rehearsals, as `harness release` does for a real candidate, so a forecast is no longer held at this floor.
- **Change risk 30, floor breached.** From `changes.json`: see [section 5](#5-the-per-pr-change-table).
- **Not measured** is not 100. Each says which input would measure it (`--test-signal`, `--traceability`, `--post-deploy`). It is left out of the mean, and the weights used are recorded in `confidence.json`.

The full list (72 deductions here) is in `confidence.json`, under each dimension's `deductions`.

## 4. The reviewer's glance

Right under the RCS, at most seven places to look. This is the Reviewer's whole job at SOP step 8: go to each artefact and record one mark ([chapter 10](10-running-a-release.md#step-8-the-reviewers-glance)). Three of the seven, as the report shows them:

```markdown
1. **Near miss**: journey anonymous-student-searches median 2493ms → 3006ms but not significant (p=0.095): p=0.095, within 0.05-0.1 of significance, unclaimed
   [hunk](report.html#hunk-timing:anonymous-student-searches:150)
   _novelty 1.00 (no history yet) × exposure 1.00 (unmapped (a timing scope no journey or page names): counted as all 5 journeys, ...) = 1.00_ · mark: not marked yet
2. **Hotspot, first contribution**: PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte: "feat(ui): rebuild Tutors with the Paper design system"
   [PR](https://github.com/tutors-sdk/tutors-mono-repo/pull/313) · [diff](https://github.com/tutors-sdk/tutors-mono-repo/pull/313/files#diff-3805a328...)
   _novelty 1.00 (no history yet) × exposure 1.00 (unmapped (... is outside apps/, and a package's reach into the journeys is not mapped): counted as all 5 journeys, ...) = 1.00_ · mark: not marked yet
5. **Fixed on b**: catalogue:home: 2 console errors fixed on b, unclaimed; but 2 new console errors on the same page: fixed, or only changed?
   [hunk](report.html#hunk-console:catalogue:home:116)
   _novelty 1.00 (no history yet) × exposure 0.20 (1 of 5 journeys: catalogue) = 0.20_ · mark: not marked yet

**Red: hold and open a 5 Whys whatever the marks say (SOP step 9).**
```

- **Ranked by novelty × exposure**, both written out so the ranking can itself be reviewed. Novelty is how unusual the finding is against the last six releases on the scoreboard; with no scoreboard yet every item is `1.00 (no history yet)`. Exposure is the share of the five journeys the finding touches. A finding the harness cannot place on a journey counts as all five and says `unmapped`, so what it cannot place is never ranked below what it can.
- **Each item is a question with its links.** Item 5 asks whether the catalogue's errors were fixed or only changed: open the hunk, compare the two messages, and mark.
- **Not checked** is listed under the glance with the reason, never guessed. Here: masks added (no earlier release on the scoreboard), persistence writes and duration moves (the kept report has no captures beside it).
- **The band's rule** closes the glance: on Red, hold whatever the marks say; on Amber, go only when every item is marked verified.

## 5. The per-PR change table

Under the glance and the dimension table, one line per PR between the two tags (and per commit that reached `main` without a PR):

```text
Change risk 30 (100 − 70), v16.2.2..54a8f83: ...; floor breached (caps the RCS at 74).
  history: 6 release(s), v16.1.4..v16.2.2

  PR       points   churn  files  tests   reviewed     first title
  #313        -25   11781    253  0.65    no           yes   feat(ui): rebuild Tutors with the Paper design system
  #276        -10      49     12  0.00    no                 fix(infra): consolidate .env to the repository root
  #269        -10      42     11  0.00    no                 ci: make the three type-check steps blocking
  #316        -10     318      7  0.15    no                 fix(whiteboard): load the scene, follow dark mode, match the Paper UI (supersedes #304)
  #330        -10     197     20  0.37    no           yes   tutors-sdk/codex/course-shell-mobile-header
  #282         -5     541     43  0.77    no                 feat: deterministic responses for the release harness (HARNESS_NOW, /version, stable headers)
  #279      floor     144      9  -       no                 feat(deploy): make the container spec files Quay-compatible
  ...
  96e9e4d   floor      64      1  -       no PR              Create images.yml
```

- **Change risk is 100 minus the sum** of every line's points, not an average: one risky PR is not diluted by many clean ones. Here: 100 − 70 = 30.
- **Where #313's 25 points went:** −10 because a first contribution touched a hotspot (a file changed in 3 of the last 6 releases), and −5 each for the reader, live and time apps, whose churn was more than twice their median and of which #313 was the largest part. Each deduction links to the file in the PR's diff.
- **A first contribution is a fact, not a penalty.** It costs nothing on its own; the points land only where it meets a hotspot or lacks tests. The author is never a column.
- **`floor`** means no approving review: no points, but the RCS is capped at 74. Here all 49 PRs merged without an approving review, and two commits (`96e9e4d`, `8582ef2`) reached `main` without a PR.
- **Release signals** follow the table: churn per app against its median, hotspots touched, files with three or more authors, orphans, test lines per production line, reviews, dependency bumps.
- **Not measured** is listed at the end, never scored clean. Here, orphans: `CHANGELOG.md` at `54a8f83` has no `### v54a8f83` entry. A release candidate has its version's entries; for anything else, pass `--changelog` (the output of `pnpm release:changelog --json`).

## 6. The differences

Below the score comes what the harness found, and this part is the same in every report since 1.0.

**Unclaimed differences** are what gates. Each row is one hunk: the artefact, the scope (what a claim's glob must match) and what changed.

```markdown
### Unclaimed differences (865)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reference-course-reads` | journey "reference-course-reads" completed on a but failed on b |
| `dom` | `reader:home` | reader:home: semantic DOM differs (+47 −26 lines at line 4) |
| ... | | |
```

Since 1.20.0 the report does the counting for you: the differences open with **the causes**, the unclaimed hunks folded by kind across apps, pages and packages, one row each with its count, the apps and pages it spans, what it folded and an example linked to its row. The same forecast, judged by 1.20.0, reads "865 unclaimed differences, 19 causes": `sbom` package removed (696, 174 packages in four images), hashed build assets newly requested (57), the semantic DOM (26), new log fields (15), and fifteen smaller ones. Under it, **moved together** names the pages on which several artefacts moved at once (`dom`, `focus`, `headers`, `network`, `screenshot` on four pages): likely one change, claimed together. Read the causes first; they never change the verdict ([contract](../contract.md#causes)).

With 865 rows, count by artefact before reading any row. Here: `sbom` 709, `network` 70, `dom` 27, `logs` 15, `screenshot` 13, `focus` 11, `image-manifest` 8, `headers` 7, `persistence` 3, `console` 2. Then read in this order:

1. **A journey that failed on b.** It is the loudest hunk there is: `reference-course-reads` completed on a and failed on b. A broken journey is a bug, not a claim.
2. **What a journey writes.** `student-signs-in: POST app_errors — 20 row(s) on a, 0 on b` and `POST calendar — 0 row(s) on a, 5 on b`. Data written differently is a behaviour change someone must own.
3. **What a person sees and uses:** `dom`, `screenshot` (`reader:home: 6.72% of pixels differ`), `focus` (`reader:course: keyboard order changed (11 stops on a, 7 on b)`), `console`.
4. **What the images are:** `sbom` and `image-manifest`. 709 package rows usually trace back to a few dependency changes; one changelog entry can claim them ([chapter 4](04-writing-claims.md#7-a-dependency-bump-in-the-sbom)).

**Image artefacts** summarises each app's image on each side: layers and size, package count (reader: 291 packages on a, 105 on b), and advisories with the database they were scanned with. **Load** gives the k6 numbers per side (600 and 601 requests, no failures, p95 1.96 ms and 2.09 ms). **Informational** (90 here, in a fold) never gates: console messages gone on b, axe violations fixed, a timing move that was not significant, vulnerabilities fixed on b. Read it anyway: it is how you notice that a fix landed, or that a check quietly stopped.

**The footer** names the harness version and commit, the contract version, when it ran, the frozen clock, the number of runs and every mask that fired:

```markdown
<sub>harness 1.4.11 (0c331f14998e, contract 1.4.0) · 2026-09-27T09:14:51.337Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×75, request-id×75, ...</sub>
```

Two reports are comparable only when the same harness version judged them.

What to do with each unclaimed hunk (a missing claim, a real regression, noise, or missing evidence) is [below](#real-regression-noise-or-missing-claim).

## 7. The 5 Whys stubs

A Red band is one of the triggers of a 5 Whys, so `harness release` would have opened one by itself; here `harness why --finding band` did:

```text
5 Whys opened (band): kaizen/2026-09-28-sha-54a8f83-band.md
  Why 1 is the harness's trace; fill Whys 2-5, where the chain ends and the countermeasure, then: harness why check kaizen/2026-09-28-sha-54a8f83-band.md
```

Why 1 is already answered, from the run's own files:

```markdown
## Why 1: Why was sha-54a8f83 Red (RCS 27)?

- **RCS:** 27 Red (mean 27.5); the Gate was WARN
- **Floors breached:** Noise health, Statistical margin, Rehearsals, Change risk
- **Dimensions below 100:** Claim coverage 0, Rehearsals 0, Change risk 30, Noise health 45, Statistical margin 80
- **Not measured (a gap, not a cause):** Test signal, Requirements traceability, Post-deploy history
- **Where the most points went** (confidence.json): ...
```

Whys 2 to 5, where the chain ends, and one countermeasure of seven kinds are for people to fill. In a `harness release` report the "5 Whys (kaizen)" section lists each stub with the register's open and overdue counts. [Chapter 10](10-running-a-release.md#when-a-trigger-fires-the-5-whys) and [kaizen/README.md](../../kaizen/README.md) say how to take one to the register.

## The files

A **run** (`harness run`, one mode) writes `out/<UTC timestamp>-<mode>/`. A **release** (`harness release`) writes `out/<UTC timestamp>-release-command/` beside the run directories of its steps, and links to each.

| File | Where | For | Notes |
| --- | --- | --- | --- |
| `report.html` | both | people | one self-contained page (no scripts, no external requests). A release's leads with the Gate, the RCS and the glance; a run's with the verdict and the sides. A kept forecast (since 1.16.1) leads with what is new since the last forecast, right under the Gate |
| `report.md` | both | the pull-request comment | GitHub-flavoured Markdown, verdict first. The harness never posts it |
| `report.json` | run | programs | schema in `docs/contract/report.schema.json`. What gating and re-comparison read |
| `gate.md`, `gate.json` | release | the release PR | the Gate, the RCS and its band, the glance, the dimension table, the per-PR table, then each step's result and comment |
| `status.json` | release | a dashboard | the stage running, each stage's state and elapsed time, where the line stopped, the exit code |
| `confidence.json` | release | the score and the glance | the Gate, the RCS, the band, the eight dimensions with every deduction, the glance with its basis |
| `changes.json` | release | change risk | one line per PR with its deductions, the release signals, what was not measured |
| `glance-marks.jsonl` | release | the Reviewer's marks | one line per mark; absent until the first mark |
| `kaizen/` | release | the 5 Whys | one stub per trigger that fired |
| `noise-status.json` | run | the gate | `noise` mode only: `{ schemaVersion, ranAt, clean, hunks, degraded? }` |
| `release-record.json` | run | the deployment check | `release` mode only: what was judged, with the digests of the candidate's images |
| `a/`, `b/` | run | re-comparison, debugging | each side's `capture.json`, screenshots, k6 output. Not part of the contract; `harness compare` reads them |
| `diff/` | run | debugging | screenshot difference images, written for a failing screenshot hunk |

A run that stops with exit `2` may leave no report. An invalid claims file stops the run before any output directory is created. `harness release` always leaves its report, a stopped line included.

## report.md: the pull-request comment

A run's `report.md` has the sections of [section 6](#6-the-differences) in this order. Read it top to bottom.

1. **The heading** carries the mode and the verdict.
2. **The banner slot.** If a side did not run signature-verified registry images, a warning appears here, above the table ([provenance banners](#provenance-banners)). A banner about deployed images (post-deploy mode) also appears here.
3. **The sides table.** The image reference of each app on each side, then the **provenance**, then the registry digest, source revision and version of each image. A digest of "no registry digest" means the image was not pulled from a registry.
4. **The reasons**, one line each. The first line is the headline. Others you will meet: `advisory only: ...` (the harness had no right to fail), `OVERRIDDEN by ...`, `NOT COLLECTED: ...`, `DEPLOYED IMAGES DIFFER ...`, and the `A/A consulted` line.
5. **Unclaimed differences**: what gates. This table is the to-do list.
6. **Claimed differences** show which claim covers each hunk, so a reviewer can check that the claim says what the hunk does. The label is the claim's reason, or `Rule NNNN: <title>` for a claim that names a Rule.
7. **Claim hygiene.** Claims, the failing hunks they cover, hunks per claim; a table only if a claim covers more hunks than the threshold or is broad but approved.
8. **Stale claims**, in a fold: claims that matched nothing. Remove each, or find out why the release did not change what it said it would.
9. Further sections when they apply: *Harness FAIL overridden*, *Deployment*, *Image artefacts*, *Migration rehearsal*, *Upgrade rehearsal*, *Load* and, in a fold, *Informational*.
10. **The footer**: harness version, git sha, contract version, run time, frozen clock, runs, masks fired.

A release's `report.md` and `gate.md` start `## Release gate: <candidate> beside <production>`, then `**Gate: <word>**`, then the RCS line and the glance (sections 1 to 4 above), the dimension table and the per-PR table, then the stages, the scoreboard lines, the 5 Whys, and each step's own `report.md` in a fold.

## report.html

A release's `report.html` has the sections of `gate.md` (above) on one page, and each deduction and glance item links into the release run's own `report.html` by anchor (`#hunk-<id>`, `#stale-claims`, `#masks`, `#noise`, `#load`, `#migration`, `#upgrade`), so a link lands on the row it is about.

A run's `report.html` has the same content as its `report.md`, in this order: the title with a coloured verdict badge; the time, the frozen clock, the run count and the harness version; the banners; the reasons list (including the A/A line); since 1.20.0 the causes and the pages that moved together; the sides table; the provenance table; the deployment table, the image artefacts table and the rehearsal and load tables when they apply; **Differences** (every hunk, failing and informational); stale claims; broad claims without approval; the override, if any; claim hygiene; the masks, split into *Fired* and *Silent this run*; and the footer.

The Differences table has four columns: artefact, scope (with the page path underneath), what changed (with a fold for the detail), and *claimed by*. A failing hunk with no claim says **unclaimed** in red; an information hunk says *informational* and is dimmed. The detail of a `dom` or `focus` hunk is a small diff (lines starting with `-` exist on a, `+` on b). A `screenshot` hunk's detail names the difference image under `diff/`.

The Masks section is worth a glance: a mask listed under *Silent this run* never changed anything, and a maintainer should consider deleting it.

## report.json

The report is the machine-readable record. Its shape (`additionalProperties: false` throughout, so a field not listed in the contract is not written), abridged from a run judged without Docker from the harness's own test-fixture captures, with three claims and a clean A/A ([chapter 9](09-extending.md#trying-an-engine-or-a-claim-without-docker)):

```jsonc
{
  "schemaVersion": 1,                      // the contract's major version: refuse a value you do not know
  "harness": { "version": "1.4.1", "gitSha": "9513b145...", "contractVersion": "1.4.0" },
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

Other optional fields appear when they apply: `causes` (since 1.20.0, the unclaimed differences folded into causes), `imageArtefacts` (per side, per app: was each of manifest, SBOM and vulnerabilities collected, and if not, why), `load`, `migration`, `upgrade`, `override`, and `deployment` (post-deploy mode). The score, the glance and the change signals are not in `report.json`: they are in `confidence.json` and `changes.json` beside a release ([docs/contract.md](../contract.md#confidencejson-the-release-confidence-score)). To check whether a run is evidence for a release, read `verdict`, `provenance.*.images.*.provenance` (all `pulled+verified`), `compare.unclaimed.length`, `compare.broadUnapproved.length` and `noise`. A consumer must tolerate an artefact name or provenance value it does not know.

## How to read a hunk

A hunk is `{ id, artefact, scope, path?, summary, detail?, severity }`. The **scope** is what your claim will match; the **path** is the page's route (a claim's glob also matches it); the **summary** says what changed; the **detail** shows it.

What the summaries look like, per artefact:

| Artefact | Summary | Detail |
| --- | --- | --- |
| `dom` | `reader:course: semantic DOM differs (+1 −1 lines at line 2)` | a diff of the accessibility snapshot: `-  - link "Topic 1"` then `+  - link "Topic 1 (4 min read)"` |
| `dom` | `journey "student-signs-in" completed on a but failed on b` | the error b hit. Not a claim: a journey that breaks is a bug |
| `screenshot` | `reader:home: 0.42% of pixels differ (threshold 0.10%)` | `diff image: diff/<file>.png` |
| `network` | `reader:course: new request on b: GET /api/presence` / `request no longer made on b` / `requested 1× on a, 2× on b` / `... status changed: 200 → 304` / `... cache-control changed: ...` | |
| `console` | `reader:course: new console message on b` | `error: Failed to load resource: 404 /assets/logo.svg`. Secret-shaped values are already redacted here: `error: Failed to load https://x.test/?apikey=<redacted>&x=1` |
| `headers` | `reader:course: header added on b: content-security-policy: ...` / `... cache-control changed: immutable,max-age=31536000,public → immutable,max-age=300,public` | the values are the canonical ones: a mere reordering or re-spelling is not a hunk, a changed `max-age` is |
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

**Not collected.** An artefact that could not be gathered: no SBOM attestation for a locally built image, syft or grype not installed, no vulnerability database, a container that could not be inspected, a restart that could not be driven. Every artefact says so in one shape, in the reasons, in the hunk's summary, in the run log and, for the image artefacts, in a cell of the Image artefacts table:

```text
NOT COLLECTED: sbom of reader, catalogue, live on side b: <reason>
```

The hunk is `<app>/not-collected` (or `<artefact>/not-collected` when the whole artefact is missing: `runtime/not-collected`, `startup/not-collected`). Its severity follows one rule: **informational, unless the artefact is required, and then failing.**

| Artefact | Required | Notes |
| --- | --- | --- |
| `runtime`, `startup` | always | their collectors run against stacks the harness started, so a gap is a fault: fix the collector, or claim it only with a reason a reviewer can weigh |
| `image-manifest`, `sbom`, `vulns` | when `HARNESS_REQUIRE_ARTEFACTS` names them (`sbom`, `vulns`, `static` for all three, `all`), or `HARNESS_REQUIRE_STATIC=1` | the nightly A/A and the release job set the latter, so a missing SBOM or scanner is a dirty night or a failed release there; a laptop is informational |
| `bus` | only with `HARNESS_REQUIRE_ARTEFACTS=bus` | adds no hunk at all until a bus exists |

An operator's choice (`--no-runtime`, `--startup-restarts 0`, always in `upgrade` mode and in the mutants) is informational and says so. A missing artefact is never a clean artefact.

**Deployed images.** In post-deploy mode, if the deploy told the harness what it deployed, the report has a *Deployment* section with the digests deployed against the digests judged, and a banner when they differ:

```text
The deployed images are NOT the ones release mode judged (16.3.0-rc.4): reader: deployed sha256:..., but release mode judged sha256:... (16.3.0-rc.4). This is a warning, not a verdict on the deployment.
```

`match`, `differs`, `incomplete`, `no-record` and `not-reported` are the five states; anything but `match` is a warning and turns a `pass` into a `warn`. It never turns anything into a `fail`.

## Post-deploy against a live site

Post-deploy mode compares the recorded candidate (side a, a capture made against the harness's own stack) with production (side b, a live deployment behind a CDN). Left alone, that would show a wall of differences that are spelling, not behaviour. What the harness does about it, and what you will see:

- **Canonical headers.** `content-type` and `cache-control` are compared in one form on both sides. `public,immutable,max-age=1` and `max-age=1, public, immutable` are equal; a different `max-age`, a lost `immutable`, another media type or a non-default charset is still a hunk. The values in a hunk's summary are the canonical ones.
- **Symmetric origins.** The URLs of the external side (`HARNESS_PRODUCTION_URLS`) read as `{{origin}}` in *both* sides' captures: DOM, network URLs, console and page path. A literal absolute link to production in the recorded side (the "Tutors v16" and "What's New" links in the reader, a link to `https://tutors.dev`) now reads the same as production's own. A link to another host, port or path is still a DOM hunk.
- **CDN-only masks.** A few masks apply only in this mode, for headers and requests that exist solely because production sits behind Netlify (HSTS, its real-user-monitoring request, `no-cache` on documents, `max-age=0,must-revalidate,public` on static files). The report's Masks section says which fired.
- **Redaction.** Secret-shaped values never reach a capture or a report ([chapter 1](01-concepts.md#normalising-and-masks)).
- **The verdict wording.** `N new difference(s) between production and the recorded candidate: open a rollback issue` appears where a CI step opens one (`HARNESS_ROLLBACK_ISSUE`, else GitHub Actions); a local run says `decide whether to roll back` and never promises an issue.

These changes were driven by a real, read-only run against production: before them it produced **67** differences, and after them **7** real ones, which is the difference between a verdict that could never be clean and one that says something. If a post-deploy report still lists differences that look like spelling, that is a candidate for a mask or a canonical form, not a claim: tell a maintainer.

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
