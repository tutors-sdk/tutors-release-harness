# The noise burn-down (phase R3)

The playbook for the person who takes the harness from "built" to "allowed to
fail a release". Everything the code can do towards that is done; what is left
is running it against production reality, reading what it says, and deciding,
for each difference between production and *itself*, whether it is a mask or a
bug.

The exit criterion, from the development plan:

1. **seven consecutive clean nightly A/As** on the production tag, from Quay,
   on verified images;
2. **10 of 10 mutants** caught and attributed against that same tag;
3. `release.yml` produces a **FAIL** (not a warn) on an unclaimed change.

The ratchet that measures 1: the count of failing hunks in the nightly A/A
reaches 0 and stays there. It ends when the streak says so, not when the
calendar does.

- [What is already built](#what-is-already-built)
- [Before you start (what only a human can do)](#before-you-start)
- [Reading a noisy A/A](#reading-a-noisy-aa)
- [Mask or determinism fix: the decision tree](#mask-or-determinism-fix)
- [Likely noise sources](#likely-noise-sources)
- [What the monorepo owes the burn-down: M15, M16–M20](#what-the-monorepo-owes-the-burn-down)
- [If the count plateaus](#if-the-count-plateaus)
- [Overrides](#overrides)

## What is already built

| Piece | Where | What it guarantees |
| --- | --- | --- |
| Nightly A/A on the production tag, from the registry, on the CI runner | `.github/workflows/nightly-noise.yml` | Three runs, with the same `--load 20x30s` a release run uses, on `HARNESS_PRODUCTION_TAG` pulled from Quay and signature-verified. Never image-against-itself on a laptop |
| Registry-outage fallback | `harness images ensure --image-cache`, `src/image-cache.ts` | The registry is always asked first. If it cannot answer (rate limit, outage, timeout), last night's verified images come back from the runner cache. That night is **degraded**: it counts as neither clean nor dirty, and licenses nothing |
| The ratchet and the streak | `src/ci/noise-history.ts` | Tonight's count is appended to `noise-history.json`; the job **fails** if the count had reached 0 on verified evidence and is not 0 tonight; the run summary shows count, ratchet, streak (of 7), evidence, masks |
| A stable home for the latest status | the `noise` branch of this repository | `noise-status.json` (and the history) force-pushed by the nightly's `publish` job. `release.yml` and `post-deploy.yml` fetch the latest from there; the 8-day artifact is no longer the only copy |
| "May this run FAIL?" | `src/gate.ts`, `tests/release-gate.test.ts` | Release and post-deploy FAIL on an unclaimed change only with a status that is **clean, not degraded, and at most 7 days old**. Otherwise the same findings are **WARN** and the first reason says which condition failed. Tested end to end for each case |
| Masks in their own PR | `src/ci/mask-change.ts`, CI job "Masks land in their own PR (required)" | A PR that adds or loosens a mask (or an engine threshold) may change only masks, their notes and tests, and the version bump. Warns past 40 masks |
| Claim hygiene | `report.json` `claimHygiene`, the PR comment | Hunks per claim, and the claims that cover more than N hunks or are broad-with-approval |
| Recorded overrides | `--override-reason`, `release.yml` input `override_reason` | See [Overrides](#overrides) |

### How a night is judged

```
nightly-noise.yml
  noise   restore cache -> images ensure (pull + cosign verify by digest,
                            else cache, else build)         evidence: verified | degraded
          -> run --mode noise --runs 5 --load 20x30s --require-verified
          -> noise-status.json { clean, hunks, degraded? }
  publish append to noise-history.json -> ratchet, streak, summary
          -> force-push noise branch (noise-status.json, noise-history.json, noise-summary.md)
          -> fail the night if the ratchet is broken

release.yml / post-deploy.yml
  gh api .../contents/noise-status.json?ref=noise -> vet (missing or corrupt: dropped, WARN)
  -> harness run ... --noise <that file>
       fresh (<= 7 d) + clean + not degraded + unclaimed diff  ->  FAIL, exit 1
       anything else with an unclaimed diff                     ->  WARN, exit 0, reason first
```

Evidence is **verified** only when every image on both sides was pulled and
signature-verified *in that run*. Anything else (`cached`, `built-from-ref`,
`local`, `pulled-unverified`) makes the status `degraded`. A degraded night
does not extend the clean streak, does not set the ratchet, does not count as
a regression, and shows as a `::warning` annotation and a **DEGRADED** summary.
It is never green in the sense that matters: the gate will not trust it.

The `noise` branch holds the **latest** night, clean or not, on purpose. If it
held "the latest clean one", a good night last Tuesday would keep licensing
FAILs after a bad night last night.

## Before you start

None of this can be done by the code.

**In the monorepo** (all of R3 depends on it; see the last section):

- M15, the `/auth` 500. Until it lands, the whole `auth` set, the persistence
  diff and the anonymous-write mutant are blind, and an A/A over a broken
  route is meaningless.
- Signed images on Quay for the production tag (R1/R2: M1–M4, M7–M9).
- Set the repository variable `HARNESS_PRODUCTION_TAG` on this repository to
  the **deployed** tag. If it is unset the nightly uses `main`, which is not
  production.

**In this repository's settings:**

- **The `noise` branch.** The first nightly creates it. Then protect it with a
  ruleset: *only* the `github-actions` app may push (force push allowed,
  deletion blocked), everyone else blocked. Release runs let the branch's
  status license a FAIL, so a person who can push there can forge a clean night.
- **GITHUB_TOKEN permissions.** The `publish` job asks for `contents: write`
  itself. If the organisation's default workflow permissions are "read only"
  and it does not allow workflows to raise them, allow it for this repository.
- **Required checks on `main`:** "Masks land in their own PR (required)" and
  "Mutants re-run (required)".
- **Do not let admins bypass the harness's check on the monorepo's release
  PRs.** A bypass is invisible to the harness; the recorded override is the
  supported way past a FAIL ([Overrides](#overrides)).
- Optionally pin `HARNESS_K6_IMAGE` (default `grafana/k6:latest`, which floats)
  and the Playwright version, so the tooling does not change under the A/A.

**First nights.** Run the nightly by hand (`workflow_dispatch`) and read the
summary before trusting the schedule. Expect it to be dirty.

## Reading a noisy A/A

An A/A compares the same image with itself, so **every hunk is noise**: either
something the app or the harness does differently between two identical boots
(non-determinism), or something the harness compares that it should not. There
is no "true" regression in this run. That is what makes the burn-down tractable.

1. **Open the run summary first.** It says the count, the delta since the last
   verified night, the ratchet, the streak, and the evidence.
   - **DEGRADED?** Stop. The count says nothing. Find why (`images ensure`
     logged `REGISTRY UNREACHABLE`, or `BUILDING FROM SOURCE`) and wait for the
     next verified night. Do not chase a degraded night's hunks.
   - **RATCHET BROKEN?** The count had reached 0 and is not 0 tonight. Something
     changed: the production tag, the runner image, a mask was removed, the
     harness version. `noise-history.json` on the `noise` branch records the
     digests and harness version per night; diff them.
2. **Get the report.** The `noise-report` artifact holds the whole `out/`
   (kept 8 days): `report.html` for people, `report.json`, and each side's
   `capture.json` and screenshots. `gh run download <id> -n noise-report`.
3. **Group by artefact.** Every hunk has `artefact` and `scope`; the scope tells
   you where to look.

   | artefact | scope looks like | look at |
   | --- | --- | --- |
   | `dom` | `reader:lab-step` | the aria diff in `detail`: a date, a counter, an id, a random order |
   | `screenshot` | `reader:home` | the diff PNG next to `capture.json`: where do pixels differ, is it text (fonts), an animation, an image that had not loaded |
   | `network` | `GET {{origin}}/x` | a request made on one side only, made a different number of times, or with a different status: prefetch races, third parties |
   | `console` | `reader:home` | a message on one side: a warning that depends on timing |
   | `headers` | `reader:home/last-modified` | the header name is the scope: which header, and is it derived from time or a build |
   | `axe`, `focus` | `reader:course` | usually a DOM difference in disguise |
   | `metrics` | `reader/http_requests_total`, `reader/process_…` | a series that is a gauge of the host, or a counter delta that differs under the same traffic |
   | `logs` | `reader/level`, `reader/requestId` | key set, level counts, request-id ratio, or a non-JSON line |
   | `timing` | `reader:home` (TTFB), `load/http_req_duration` | a slower side under the Mann–Whitney test |
   | `persistence` | `POST learner` | a write on one side only |
4. **Is it reproducible?** A hunk that appears once in five nights is a race or
   a scheduler; one that appears every night is a rule. Compare several nights
   from the history before deciding. Never "fix" a flake by retrying: the
   harness has no retries anywhere, on purpose (TESTING.md, ratchets).
5. **Iterate without Docker.** Everything after capture is a pure function of
   the captures on disk, so a mask or a threshold can be tried in seconds on a
   downloaded artifact:

   ```bash
   gh run download <run id> -n noise-report -D out
   pnpm harness compare --dir out/<timestamp>-noise --mode noise --masks path/to/candidate-masks.yaml
   ```

   Then look at `masksApplied` in the new `report.json`: the mask you wrote must
   fire (count > 0) on exactly what you meant, and the other masks' counts must
   not move.
6. **Decide** with the tree below, one hunk class at a time, smallest change
   first. Land each mask in its own PR; land each determinism fix wherever it
   belongs.

## Mask or determinism fix

Ask in this order and stop at the first yes.

```
Could a real regression ever show up in this same field?
 ├─ yes ─ Never mask the field. Make it deterministic (or narrow the mask so the
 │        regression shows, e.g. mask the number inside a string, not the string).
 └─ no
    Where does the difference come from?
     ├─ the harness (clock, ordering, capture timing, a race in a journey,
     │   a screenshot taken before fonts/animations settle)
     │     -> fix the harness. Bump the version, re-run the mutants. Not a mask.
     ├─ the app (server-rendered date, random id, build time, per-process value,
     │   non-JSON log line)
     │     -> fix the app: monorepo M16-M20. Until it lands, a TEMPORARY mask whose
     │        reason names the M-number. It is deleted the day it goes silent.
     ├─ the environment or transport (CDN headers, compression, connection reuse,
     │   a third-party host the fixture stack does not serve)
     │     -> a mask, the narrowest that works, with a reason that says why the
     │        release cannot control it.
     └─ statistical (timing, load, counter deltas under retries)
           -> a threshold or `--runs`, never a mask on the artefact, and never a
              retry. See "k6 timing spread" below.
```

Rules that apply to every mask (`normalise/masks.yaml` says the same at the top):

- **Narrowest possible.** A header by name, a series by anchored prefix, a
  regex that keeps the surrounding text (`replace: "$1{{hash}}$2"`). A mask on
  `artefact: dom` with a broad pattern is a blind spot the size of the page.
- **A reason a reviewer can weigh:** what noise it hides, and why that noise
  cannot be a regression. At least 20 characters, and the schema enforces it;
  aim for a paragraph.
- **Temporary masks say so** and name the monorepo item that removes the need.
- **Its own PR.** CI fails a PR that adds or loosens a mask *and* changes
  anything else (`src/ci/mask-change.ts`). This is deliberate: the reviewer of
  a change should never also review the blind spot that hides it. The PR may
  carry this document, the mask's tests, and the version bump.
- **A mask is a version bump and a mutants re-run** (`src/ci/engine-change.ts`).
  The mutants proving the harness still catches its ten planted faults is the
  cost of narrowing what it looks at.
- **Thresholds are masks.** `screenshot.maxDiffRatio`, `pixelThreshold`,
  `metrics.deltaTolerance`, `logs.*`, `timing.*` in `masks.yaml` are noise
  floors. Loosening one is reviewed like a mask, and the mask-PR rule applies.
- **Silent masks go.** Every report lists masks that never fired ("Silent this
  run"). A mask silent across a week of nights is deleted, in a PR that may
  travel with anything (removing a mask only tightens the harness).
- **Past ~40 masks nobody reviews the list.** CI and the nightly summary warn.
  That is the signal to fix determinism at the source instead.

## Likely noise sources

What the first dirty nights will most likely contain, what it looks like, and
where the fix belongs. What `masks.yaml` already covers is named.

### k6 timing spread

*Shows as* `timing` hunks, scope `load/http_req_duration` or a page's TTFB,
"slower on b".

The rules (`src/compare/engines.ts`, `extra.ts`, the test itself in `stats.ts`): a hunk needs side b's median
(or p95 under load) to exceed a's by **both** `minEffect` (20%) **and**
`minShiftMs` (20 ms), and then Mann–Whitney p < `alpha` (0.05) with at least
`minRuns` (3) runs. **Three runs cannot reach alpha:** the smallest p the test can
produce for 3 v 3 (every sample of a below every sample of b) is 0.081, so a
release run with `--runs 3` could never call a slowdown significant however large.
The engine says so as information ("3/3 samples cannot reach alpha 0.05 (best
possible p=0.081). Raise --runs") and never as a pass. What `--runs` can reach at
alpha 0.05, for n v n perfectly separated (p, normal approximation with continuity
correction):

| runs a side | 2 | 3 | 4 | 5 | 6 | 8 |
| --- | --- | --- | --- | --- | --- | --- |
| best possible p | 0.245 | 0.081 | 0.030 | 0.012 | 0.005 | 0.0009 |
| reaches alpha 0.05 | no | no | yes | yes | yes | yes |

Four is the least; five is the default of the nightly, the release workflow and
the `slow-ssr` mutant because with four a single overlapping pair (p = 0.061)
already hides a real regression, and with five it does not (p = 0.022). Until
1.2.1 the p-value function was wrong (it reported 0.0004 for 5 v 5 and 0.014 for
3 v 3) and three runs *seemed* to work: A/A history taken with the earlier
harness says nothing about the noise floor of these engines. Cost: each run is
one more pass of every selected journey on each side, so five runs against
three is two more passes per side (about two thirds more journey wall-clock;
the k6 load and the startup restarts are unchanged). On a shared GitHub-hosted runner, two identical stacks
sharing one noisy machine can clear that bar; with dozens of pages each judged
separately, at α = 0.05 the odd false hunk is expected, not a surprise. Note
too that under load the sample count is in the hundreds, so the p-value is
tiny for any visible shift: the effect-size guards carry the load comparison.

Order of remedies, never a retry:

1. `--runs 5` in the nightly and release (more samples per page, and the test
   has power to tell noise from shift). Done in 1.2.1; more runs cost wall-clock
   linearly and tighten the floor (8 v 8: p = 0.0009).
2. Tighten `alpha` (0.01) or raise `minShiftMs` / `minEffect`: a threshold
   change, so a mask-style PR with the reason measured from the A/A history.
3. The sides are captured one after the other (a, then b), so a machine that
   drifts (a noisy neighbour, throttling, a warming cache) makes b
   systematically different from a. The test is one-sided ("slower on b"): if
   the hunks always point the same way, that is harness bias, and a harness fix
   (alternate the order, interleave the runs, warm both sides first) beats a
   threshold.
4. Pin the k6 image (`HARNESS_K6_IMAGE`); `grafana/k6:latest` floats.
5. If it still plateaus, take the timing and load collectors (only) to a
   **self-hosted or larger dedicated runner**; the deterministic collectors
   stay on GitHub-hosted runners. See [If the count plateaus](#if-the-count-plateaus).

### Font and anti-aliasing in screenshots

*Shows as* `screenshot` hunks: "N% of pixels differ" on text-heavy pages.

The nightly, release and post-deploy jobs run on **one pinned runner image**
(`ubuntu-24.04`, not `ubuntu-latest`) so the A/A measures the noise floor the
release runs will meet; a floating image changes fonts and rasteriser under
you. Move all three together, in one PR, and expect a fresh burn-down after.
Within one image, identical stacks should render identically: a diff there is
usually the harness screenshotting before web fonts or an animation settle, or
a lazy image that had not loaded. Fix by waiting for the specific condition
(`document.fonts.ready`, a stable-layout check) in the collector, not by a
threshold. `screenshot.pixelThreshold` and `maxDiffRatio` are thresholds and
follow the mask rules; loosening them hides real visual regressions.

### `/metrics` process-level series

*Shows as* `metrics` hunks: a series that moves differently under the same
traffic, or a series present on one side only.

`metrics-process` (`^(process_|nodejs_)`) and `metrics-timing-histograms`
(`_(seconds|milliseconds)_(bucket|sum)$`) already mask the runtime gauges and
latency histograms. What is left is counters whose delta depends on timing
(prefetch, retries, a health probe hitting `/metrics` itself) and the
tolerance: `deltaTolerance` 0.25 or `deltaAbsolute` 2 counts, whichever is
greater. Fix at the source: **M19** gives the process-level series a prefix
the mask can name as a group, and stabilises the names; until then, mask by
exact series name, not by a wide regex.

### Log timestamps and request ids

*Shows as* `logs` hunks: `log field gone/new on b`, a level count off by more
than 25%, `request-id propagation fell`, or `logs are no longer JSON lines`.

The collector compares **shape and volume**, never the text of a line: the
keys seen, the per-level histogram, the fraction of lines with a request id,
whether they are JSON. Timestamp and request-id *values* therefore never
matter; a timestamp only causes a hunk when a key appears on some boots and not
others (an `err`/`stack` field, a startup banner in plain text, a warning that
depends on timing). Fix at the source: **M18** gives every app one JSON shape
with a stable field set and request-id propagation. The `request-id` header
mask covers the response header only.

### `Date`, `ETag`, `Last-Modified`

*Shows as* `headers` hunks, scope `<page>/<header>`.

`Date` (`response-date`) and `ETag` (`etag`) are masked, and `x-request-id`.
`Last-Modified`, `Expires`, and anything computed from build time or the
process are not, and are the usual next hits. Prefer **M17** (derive them from
content or omit them) over a mask: a mask on `last-modified` would hide a
regression that drops or wrongs it. Any `Date` the apps render *into the page*
is a `dom` hunk, and needs **M16**: the harness freezes only the browser clock
(`page.clock.setFixedTime`), so anything the **server** stamps must honour the
same instant (`HARNESS_NOW`) or it is permanent noise.

### Also on the list

- **Build strings** (git sha, build date) in the DOM: **M20** moves them to one
  known endpoint so the harness can mask that route instead of chasing the sha.
- **Third-party requests** (`third-party-requests`, dropped today: the KaTeX
  stylesheet on `cdn.jsdelivr.net`). Stubbing the CDN in the fixture stack
  would let that mask go.
- **Hashed asset names** (`hashed-assets`): masks the hash, keeps the chunk
  count and statuses, so a bundle that grows or splits still shows.
- **Tooling that floats:** `grafana/k6:latest`, the Playwright browser build,
  the runner image. The A/A is only comparable night to night while these stand
  still; the history records the harness version and image digests per night.

## What the monorepo owes the burn-down

The harness cannot compensate for a product bug or for an app that stamps the
wall clock into its output. These are the items from the monorepo table in
the plan, with how each shows up in the A/A and what the harness does until
it lands.

| # | Monorepo change | Shows in the A/A as | Until it lands |
| --- | --- | --- | --- |
| **M15** | Fix `/auth/[courseid]` answering 500 (`__dirname` in ESM, sanitiser chunk). **Highest leverage: do it first** | The `auth` set fails identically on both sides: no hunks, so it *looks* clean. `console`/`dom` failures on both sides show as `journey … failed on both sides` (info). Blind: identity, persistence writes, and the anonymous-write mutant | Nothing compensates. Treat a red `auth` set on both sides beyond R3 as a monorepo release blocker; the mutants' `anonymous-write` cannot be trusted |
| **M16** | Honour `HARNESS_NOW` on the server | `dom` hunks with a date, "last updated", a relative time | Temporary, narrow `dom` mask on the exact rendered string, reason naming M16 |
| **M17** | No non-deterministic response headers (`ETag`/`Last-Modified` from build time, per-process ids) | `headers` hunks per page and header | `etag` and `response-date` are masked already; do not add `last-modified` as a mask, wait for the fix |
| **M18** | Structured JSON logs, stable field set, request-id propagation | `logs` hunks: a key on some boots only, level counts, non-JSON lines | Log key masks (`key: <name>`) for genuinely optional keys only |
| **M19** | Stable `/metrics` names; process series tagged with a maskable prefix | `metrics` hunks | Exact-name series masks; the two existing group masks stay |
| **M20** | Build strings (sha, build date) on one known endpoint only | `dom`/`network` hunks carrying the sha | A `pattern` mask on that route, when it exists; not on the DOM |

**M15 first, then M16–M20 in the order the A/A's own hunks ask for them.** The
harness plan groups M16, M17 and M20 (determinism) and M18 and M19 (logs and
metrics shape) as two monorepo PRs; a night of the burn-down will show which
matters more. Each landed item should make one or more masks go silent: delete
them, and the mask count and the `masks-applied` list are the burn-down's
scoreboard as well as the noise count.

## If the count plateaus

A count that stays above 0 after two weeks, with the *same* hunks each night, is
a rule you have not found. One that hovers with different hunks each night is
runner noise, and only the timing and load collectors should be sensitive to
it. In that case:

- confirm the deterministic artefacts are clean on their own: if the only hunks
  left across several nights are `timing` and `load`, everything else is done
  and the remaining noise is the machine's;
- move **only the timing and load collectors** to a self-hosted or larger
  dedicated runner and leave the deterministic collectors on GitHub-hosted
  runners. This is a repository decision (a runner, a label), not code;
- do not raise the noise tolerance until the count is 0 by hiding it: a
  threshold raised to reach the streak is a mask, and gets a mask's review.

## Overrides

The harness will sometimes be wrong, or right and inconvenient. The measure of
whether it is *trusted* or merely *tolerated* is how often a FAIL is
overridden. A bypass in GitHub's branch protection leaves no trace in the
harness, so the supported path is to override *through* the harness, which
records it.

**How.** Dispatch `release.yml` by hand with `override_reason` (a
`workflow_dispatch` input; a `repository_dispatch` from another repository
cannot override). Every job then passes
`--override-reason … --override-by <the dispatching actor>`:

- the verdict stays **FAIL** (the harness does not change its mind) and the
  run exits 0;
- `report.json` gets `override: { reason, by, verdict, applied, at }`, and the
  reason appears first in `reasons`, in `report.md` and in `report.html`;
- the `override-record` job opens an issue labelled **`harness-override`** in
  this repository with the report as its body. An override on a run that did not
  fail is recorded with `applied: false` and opens no issue.

On a machine, `harness local gate --override-reason … [--override-by <who>]`
does the same, and every applied override is appended to the local record
`<HARNESS_HOME>/overrides.jsonl` (the issue's equivalent, hash-chained; see
[docs/local.md](local.md)): `harness override list --since 2026-07-01` is the
count.

The reason must be 20+ characters and not a rubber stamp; name the difference
and the decision (`Rule 0044: payments hotfix, frame options restored in
16.3.1`).

**The metric: overrides per quarter.** Overrides applied, and the FAILs the
harness issued, over a quarter:

```bash
# overrides applied this quarter
gh issue list --repo tutors-sdk/tutors-release-harness --label harness-override --state all \
  --search "created:2026-07-01..2026-09-30" --json number --jq length

# FAIL verdicts issued this quarter (release runs that concluded failure or were overridden)
gh run list --repo tutors-sdk/tutors-release-harness --workflow release.yml \
  --created "2026-07-01..2026-09-30" --limit 500 --json conclusion --jq '[.[] | select(.conclusion=="failure")] | length'
```

Read the two together: overrides ÷ FAILs is the tolerance rate. More than one
override of the same rule in a quarter means the rule is wrong (fix the
harness or the claim discipline) or the process is (fix the process); it does
not mean overriding is fine. A quarter with **zero** overrides *and* zero FAILs
means the harness has not been exercised, not that it is trusted.

Keep the count honest: an admin bypass in branch protection is invisible here.
Disable admin bypass on the harness's required check, so the only way past is
the recorded one.

**Claim hygiene** feeds the same judgement from the other side. Every claimed
run reports hunks per claim and flags claims covering more than N hunks
(`--claim-max-hunks`, `HARNESS_CLAIM_MAX_HUNKS`, default 10) and broad claims a
human approved (`scope: "**"` with `approvedBy`). One of those is a decision;
routinely appearing is a checkbox. Count the releases whose report carries a
`broad-with-approval` flag per quarter alongside the overrides.
