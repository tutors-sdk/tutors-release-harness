# 10 Running a release

This chapter is how to run a Tutors release with the harness, from a machine that has never run one to a closed release. It follows the monorepo's standard work sheet, `release/SOP.md`, step by step and in its order. The SOP says who owns each step and when it is done; this chapter says which command does it, what you will see, and what stops the line.

Every command below is in the harness's usage text (`pnpm harness --help`) or in the monorepo's `package.json`. Nothing here needs GitHub: CI runs the same commands ([How CI runs the same thing](#how-ci-runs-the-same-thing)).

The live example of what a release run produces is the **Main to RC** report on the [report pages](https://tutors-sdk.github.io/tutors-release-harness/): today's `main` judged against production, exactly as a release candidate would be. [Chapter 3](03-reading-a-report.md) reads one from top to bottom.

- [The roles](#the-roles)
- [The steps at a glance](#the-steps-at-a-glance)
- [Before the first release: prerequisites](#before-the-first-release-prerequisites)
- [Step 1: cut the branch and tag the candidate](#step-1-cut-the-branch-and-tag-the-candidate)
- [Step 2: confirm a clean A/A](#step-2-confirm-a-clean-aa)
- [Steps 3 and 4: the changelog and the claims](#steps-3-and-4-the-changelog-and-the-claims)
- [Steps 5 to 7: the one command](#steps-5-to-7-the-one-command)
- [Reading the result: Gate, then score, then glance](#reading-the-result-gate-then-score-then-glance)
- [Step 8: the reviewer's glance](#step-8-the-reviewers-glance)
- [Step 9: go or no-go](#step-9-go-or-no-go)
- [Steps 10 and 11: deploy and the watch window](#steps-10-and-11-deploy-and-the-watch-window)
- [When a trigger fires: the 5 Whys](#when-a-trigger-fires-the-5-whys)
- [Step 12: close the release](#step-12-close-the-release)
- [A branch smoke: `--fast`](#a-branch-smoke---fast)
- [How CI runs the same thing](#how-ci-runs-the-same-thing)
- [Stop the line: every stop in one table](#stop-the-line-every-stop-in-one-table)

## The roles

| Role | Who | Owns |
| --- | --- | --- |
| **Captain** | one person per release; one person can captain many | running the release and the go or no-go (steps 1, 2, 5 to 7, 9 to 12) |
| **Reviewer** | a second person who authored no PR in this release; rotates every release | the glance (step 8) |
| **Contributors** | everyone whose PR is in the release | their changelog lines, their claims and their EARS Rules (steps 3 and 4) |

The five Lean ideas behind the steps are in [docs/lean.md](../lean.md). In one line each: the Gate stops the line (jidoka); one score, broken down, read the same way by everyone (visual management); the same steps in the same order every time (standard work); the Reviewer goes to the artefact, not the summary (gemba); every stop ends in a countermeasure to the system, never in blame (kaizen).

## The steps at a glance

| # | Step | Owner | Command | Done when |
| --- | --- | --- | --- | --- |
| 1 | Cut the branch, tag the candidate | Captain | `pnpm release:candidate X.Y.Z` (monorepo) | `vX.Y.Z-rc.N` tagged and its four images on quay.io |
| 2 | Confirm a clean A/A | Captain | `pnpm harness noise status`; `pnpm harness local nightly --tag <production>` if not clean | a clean, verified A/A at most 7 days old |
| 3 | Write the changelog | Contributors | `pnpm release:changelog` (monorepo) | every merged PR has a `CHANGELOG.md` entry with its artefact hints |
| 4 | Author claims | Contributors | `pnpm release:claims:draft`, `pnpm check:release-claims` (monorepo) | `release/claims.yaml` passes the check |
| 5 | Run release mode | Captain | `harness release` (started by step 1) | `report.md`, `report.html`, `gate.md` written |
| 6 | Run rehearsals | Captain | the same command | migration and upgrade reported |
| 7 | Changes and confidence | Captain | the same command | `changes.json` and `confidence.json` written |
| 8 | The reviewer's glance | Reviewer | `pnpm harness glance mark` | every glance item marked |
| 9 | Go or no-go | Captain | `pnpm harness glance status` | the decision recorded in the release PR |
| 10 | Deploy | Captain | tag `vX.Y.Z`, `pnpm deploy:pin X.Y.Z` (monorepo) | the pin PR merged; post-deploy running |
| 11 | Watch window | Captain | post-deploy every 15 minutes | 24 hours with no rollback issue |
| 12 | Close the release | Captain | `pnpm harness scoreboard trends`, `pnpm harness why register` | scoreboard line appended, register reviewed |

Active time is about three hours. Wall time is about a day and a half, because of the watch window.

## Before the first release: prerequisites

Once per machine, and again when a check starts failing.

**Where things are.** A harness checkout and a monorepo checkout, side by side:

```console
git clone https://github.com/tutors-sdk/tutors-release-harness.git
git clone https://github.com/tutors-sdk/tutors-mono-repo.git
cd tutors-release-harness && pnpm install && pnpm exec playwright install chromium
```

Tell the monorepo where the harness is, and the harness where the monorepo is:

```bash
export HARNESS_DIR=$PWD/tutors-release-harness          # pnpm release:candidate runs this checkout's harness
export HARNESS_MONOREPO_DIR=$PWD/tutors-mono-repo      # harness release reads the baseline and the claims here
```

Set `HARNESS_DIR`. Without it `pnpm release:candidate` falls back to `npx github:tutors-sdk/tutors-release-harness`, and a harness run that way keeps its state (`HARNESS_HOME`: the noise store, the scoreboard) and reads its kaizen register inside npx's cache, where you will not find them again.

**Ask the machine what it lacks.**

```console
pnpm harness doctor --for gate
```

It is read-only. Exit `0` means ready (warnings allowed); `1` means something a run needs is missing, with the fix for your operating system under it. Chapter 2 [explains each line](02-running-locally.md#set-up-the-machine). Then fetch the vulnerability database once; a run never updates it:

```console
pnpm harness vuln-db update
```

**Keep the monorepo current.** The baseline is what production runs, read from `release/deployed.json` on your monorepo checkout. A checkout that is behind `origin/main` names the wrong production, or none:

```console
git -C ../tutors-mono-repo pull --ff-only && git -C ../tutors-mono-repo fetch --tags
```

`harness changes` reads `git log` between the two tags, so it needs the tags too.

**A token, for review coverage.** Change risk asks GitHub whether each PR had an approving review. Set `GITHUB_TOKEN` or `GH_TOKEN`. Behind an HTTPS proxy, Node's `fetch` also needs `NODE_USE_ENV_PROXY=1`. Without a token that works, review coverage is reported as not measured, never as clean ([chapter 8](08-troubleshooting.md#release-confidence-and-the-one-command)).

**Done when:** `harness doctor --for gate` exits `0`, and `harness release --candidate <any tag> --dry-run` prints a plan (below) instead of an error.

## When to cut: the release-size control chart

Since harness 1.19.0 the top of the [overnight readiness page](https://tutors-sdk.github.io/tutors-release-harness/readiness.html) answers "is it time to release?" with a control chart. Small, regular releases are easier to judge, to review at the glance and to roll back; the chart tells the Captain when the batch waiting on `main` is getting bigger than this project's releases usually are.

**What it plots.** Each point is one past release of the monorepo (a plain `vX.Y.Z` tag), counted in **merged PRs** since the release before it, the way `harness changes` counts them: release branches and commits pushed straight to `main` are left out. After the last release, a **diamond** is what is on `main` now, not yet released.

**The lines.** It is an XmR (individuals) chart, the Shewhart chart for one number per release:

- the **centre line** is the mean release size;
- the **UCL** (upper control limit) is the centre + 2.66 × the mean moving range (the average change in size from one release to the next); the **LCL** is the centre − 2.66 × the same, and never below 0;
- a release above the UCL or below the LCL is a **special cause**, ringed on the chart and named under it: something other than the usual variation made it that size, and it is worth asking why.

**The WIP limit and its three zones.** The diamond is read against a WIP (work in progress) limit, and the zone is always written in words beside its colour:

| Unreleased PRs on `main` | Zone | What to do |
| --- | --- | --- |
| at or below the centre line | **Below the centre line** (green) | keep merging |
| above the centre line, up to the WIP limit | **A good time to release** (amber) | cut a candidate in the next day or two |
| over the WIP limit | **Release now** (red) | cut a candidate now; the batch is already unusually large |

The WIP limit is the UCL. **Provisional limits:** with fewer than 10 releases measured the limits are labelled provisional and will move as releases are added, and the WIP limit is the centre line instead, so a short history never licenses a big batch (while provisional there is no amber zone).

**Night by night.** The second chart is the unreleased count from each night's Main to RC forecast against the same lines, so you can see the batch climbing towards the limit before it gets there. Each chart has a table of its numbers under "The numbers".

**Where the numbers come from.** The pages workflow asks GitHub once per build for the monorepo's tags and the PRs between them (`harness readiness --fetch-releases`) and keeps the answer in the site as `releases.json`; the night-by-night counts are each forecast's kept `changes.json`. If GitHub does not answer, the page says so and draws the batch from the newest forecast with no limits. To build it locally: `pnpm harness readiness --site _site --fetch-releases` (set `GITHUB_TOKEN` or `GH_TOKEN`; behind a proxy also `NODE_USE_ENV_PROXY=1`).

Like the rest of the page it is **advisory**: it never changes the Gate, a verdict or an exit code. It tells you when to start step 1, not whether the candidate may ship.

## Step 1: cut the branch and tag the candidate

**Owner:** Captain. **Input:** `main` at the cut commit.

Cut `release/X.Y.Z` from `main`, set `package.json` to `X.Y.Z`, reset `release/claims.yaml` to `claims: []`, and push. Then, from the monorepo checkout on that branch:

```console
pnpm release:candidate 16.3.0 --dry-run    # print every command, run none
pnpm release:candidate 16.3.0              # tag v16.3.0-rc.N, publish the images, run the harness
```

The command does three things. It tags the next free `vX.Y.Z-rc.N` (or reuses the one already on the commit, such as the tag `release-dispatch.yml` made when the branch was pushed) and pushes it. It waits until quay.io serves all four images for that tag (the tag starts `image-build.yml`). Then it runs steps 5 to 7:

```console
harness release --candidate 16.3.0-rc.1 --baseline prod --monorepo <this checkout>
```

Arguments after `--` go to `harness release`, for example `pnpm release:candidate 16.3.0 -- --fast`.

Steps 3 and 4 are people's work, not the command's: the changelog and the claims must be on the branch before this command runs, or the report lists every difference as unclaimed. A new commit with better claims means a new candidate: run the command again and it tags `rc.N+1`.

**Done when:** `release/X.Y.Z` is pushed with `package.json` at `X.Y.Z`, `vX.Y.Z-rc.N` is tagged, and the four `X.Y.Z-rc.N` images are on quay.io.

## Step 2: confirm a clean A/A

**Owner:** Captain. **Input:** this machine's noise store.

The A/A run compares production with itself. Anything it finds is noise, and while there is noise the harness has not earned the right to fail a release ([chapter 1](01-concepts.md#noise-and-release-the-gate)). The gate reads the A/A from **this machine's** noise store, because the A/A measures the machine that ran it. A clean night in CI says nothing about your laptop's Chromium, so do not copy CI's status into the local store.

```console
pnpm harness noise status
```

It says whether the latest status licenses a FAIL: clean (no failing hunk), verified (every image pulled and signature-checked) and at most 7 days old. If it does not, record a new one on the production tag:

```console
pnpm harness local nightly --tag 16.2.2
```

You can also skip this step and let `harness release` decide: its noise stage reuses the store when it licenses a FAIL, and otherwise runs an A/A of the baseline (3 runs) before any A/B.

**Stop the line:** a dirty A/A. `harness release` stops at the noise stage, attempts no A/B, exits `2` and lists each difference that needs a mask reviewed or a determinism fix. [Chapter 5](05-noise-and-self-test.md) and [the noise burn-down](../noise-burndown.md) say how to decide between them.

**Done when:** `harness noise status` reports a clean, verified status no more than 7 days old, or `harness release`'s noise stage says `clean A/A`.

## Steps 3 and 4: the changelog and the claims

**Owners:** Contributors. **Input:** the merged PRs, their EARS Rules.

In the monorepo:

```console
pnpm release:changelog --from v16.2.2 --to release/16.3.0              # a draft of the changelog from the merged PRs
pnpm release:claims:draft --from v16.2.2 --to release/16.3.0           # a claim stub per added or changed Rule
pnpm check:release-claims                                              # the harness's rules for a claims file
```

A changelog entry names the artefacts it expects to move, `(axe, dom)`, so it turns into one claim per artefact. An entry with no artefact hint claims nothing: if the harness then finds a difference, the entry was incomplete, and that is the signal. [Chapter 4](04-writing-claims.md) is the full guide to claims, with a cookbook.

**Done when:** every merged PR has a `CHANGELOG.md` entry with its artefact hints; every new feature names its Rule id; `release/claims.yaml` passes `pnpm check:release-claims`; no broad claim lacks `approvedBy`.

## Steps 5 to 7: the one command

**Owner:** Captain. **Input:** the candidate tag, the claims, the noise status.

`pnpm release:candidate` starts this for you. To run it directly, from the harness checkout:

```console
pnpm harness release --candidate 16.3.0-rc.1 --baseline prod --monorepo ../tutors-mono-repo --dry-run
pnpm harness release --candidate 16.3.0-rc.1 --baseline prod --monorepo ../tutors-mono-repo --open
```

`--baseline prod` (the default) reads the tag and digests production runs from `release/deployed.json` in the monorepo checkout; `--baseline 16.2.2` names a tag instead. The claims default to `release/claims.yaml` in the same checkout (`--claims` for another file). `--open` opens `report.html` at the end.

**Start with `--dry-run`.** It prints the baseline, the noise decision and every command, and starts nothing. A real one, against the monorepo's `main` on 28 September 2026 (paths shortened, digests elided):

```text
harness release: 16.3.0-rc.1 beside 16.2.2 (<monorepo>/release/deployed.json, deployed 2026-09-21T10:57:28Z, pinned by digest)

environment: HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'

  1. resolve: the baseline 16.2.2 (...); pull and verify, or build, both sides
       harness images ensure --a 16.2.2 --b 16.3.0-rc.1 --a-digests '{...}'
  2. noise: an A/A of the baseline first: no noise status at <HARNESS_HOME>/noise/noise-status.json: release runs will only warn until a nightly A/A records one
       harness run --mode noise --a 16.2.2 --b 16.2.2 --runs 3 --load 20x30s --require-verified --a-digests '{...}' --b-digests '{...}'
  3. changes: what changed between 16.2.2 and 16.3.0-rc.1: per-PR risk lines
       harness changes --a 16.2.2 --b 16.3.0-rc.1 --monorepo <monorepo> --out '<release-command dir>/changes.json'
  4. release: release mode: 16.3.0-rc.1 beside 16.2.2, 3 runs, k6 20x30s, with the claims
       harness run --mode release --a 16.2.2 --b 16.3.0-rc.1 --runs 3 --load 20x30s --a-digests '{...}' --claims <monorepo>/release/claims.yaml --noise '{latest:noise}'
  5. rehearse: migration, then upgrade
       harness run --mode migration --a v16.2.2 --b v16.3.0-rc.1
       harness run --mode upgrade --a 16.2.2 --b 16.3.0-rc.1 --set fixture --journey anonymous-student-reads-course --a-digests '{...}'
  6. score: the score and the reviewer's glance (confidence.json); a 5 Whys stub for each trigger that fires
  7. report: report.md, report.html, gate.md, gate.json

scoreboard: the line is appended to <HARNESS_HOME>/scoreboard/releases.jsonl
5 Whys: a stub for each trigger that fires (a Gate FAIL, a Red band, a run rule) in <release-command dir>/kaizen/; the register is <harness>/kaizen

dry run: nothing was pulled or run (16.3.0-rc.1 beside 16.2.2)
```

**Then run it.** It asks nothing and retries nothing silently. It holds the run lock (one heavy run per machine) and writes everything into `out/<UTC timestamp>-release-command/`, whatever happens, a stopped line or Ctrl-C included. Ctrl-C takes the stacks down first. The plan expects about 45 minutes, and about 20 more when it has to run its own A/A; `status.json` in that directory says which stage is running and how long it is expected to take.

### What each stage prints

Each stage prints one line when it ends: `[n/7] <stage> <state> <elapsed> <note>`. The steps' own output scrolls past in between.

| Stage | SOP step | What it does | The note when it goes well | What stops the line |
| --- | --- | --- | --- | --- |
| `resolve` | 5 | the baseline, then `images ensure` for both sides: pulled and cosign-verified by digest | `baseline 16.2.2 (<where it came from>)` | an image missing or unverifiable: `line stopped at resolve`, exit `2` |
| `noise` | 2 | reuse the local store's A/A when it licenses a FAIL, else an A/A of the baseline, 3 runs | `clean A/A`, or `reusing the local noise store: ...` | a dirty A/A: `line stopped at noise`, no A/B attempted, exit `2` |
| `changes` | 7 | `harness changes` between the two tags in the monorepo checkout: `changes.json` | `change risk <n>: <k> of <m> line(s) lost points[, floor breached]; changes.json` | never. Without a checkout it is `skipped` and change risk is not measured |
| `release` | 5 | release mode, 3 runs, k6 at `20x30s`, the claims, the rules and that A/A | `gate PASS` or `gate WARN` | a Gate FAIL: `line stopped at release`, exit `1`. The rehearsals still run, for the evidence |
| `rehearse` | 6 | migration, then upgrade | `migration PASS, upgrade PASS` | a rehearsal that does not pass |
| `score` | 7 | `confidence.json`: the score, and the glance ranked | `RCS <n> <band>; <m> of 8 dimensions measured; glance: <k> to mark; confidence.json` | never. It runs after the exit code is decided and cannot change it |
| `report` | 7 | `report.md`, `report.html`, `gate.md`, `gate.json` | the files written | never; always written |

When the line stops, two lines say where, why, and the next standard step:

```text
line stopped at noise: the A/A of 16.2.2 is dirty (3 difference(s) between two identical stacks), so no A/B was attempted
  next: review each difference below: a mask in normalise/masks.yaml in its own PR, or a determinism fix (docs/noise-burndown.md, "Mask or determinism fix"); then `harness local nightly` for a clean A/A, and run this command again
```

### The closing lines

After the stages, in this order and always with the Gate first:

```text
gate: <PASS | WARN | FAIL | NOT JUDGED> -> exit <0 | 1 | 2>
confidence: RCS <n> <Green | Amber | Red>: <what the band means>
scoreboard: 16.3.0-rc.1 run 1, Gate <word>, RCS <n> <band>, <m> of 8 dimensions measured -> <file>
  run rules: none firing
5 Whys: no trigger fired (no Gate FAIL, no Red band, no run rule firing)
register: <n> open countermeasure(s), <n> overdue, <n> closed (<harness>/kaizen/README.md); review it at SOP step 12
glance: <k> place(s) to look (step 8, the one step that stays human); mark each: harness glance mark --run <dir> --item <n> --mark verified|disputed|escalated --by <name> [--note text]
report: <dir>/report.html
```

A Gate FAIL has no RCS: the confidence line says so. When a trigger fires, the `5 Whys` line names the stub it wrote in `<dir>/kaizen/` instead ([below](#when-a-trigger-fires-the-5-whys)).

**Exit codes are the Gate's:** `0` PASS or WARN, `1` FAIL, `2` not judged (a stopped line before the A/B, Ctrl-C) or a usage error. Nothing after the release stage can change it.

**Done when:** the release-command directory holds `report.md`, `report.html`, `gate.md` and `gate.json`, with `confidence.json` and `changes.json` beside them.

## Reading the result: Gate, then score, then glance

Open `report.html` (or `report.md`). Read it in this order, and stop at the first thing that decides.

1. **The Gate**, one word. FAIL means an observable difference no claim covers, while the harness had the right to fail. Nothing below it can turn a FAIL into a go.
2. **The Release Confidence Score (RCS) and its band.** Only when the Gate is PASS or WARN. One number from 0 to 100 over eight dimensions, each with every point it lost and where. A dimension without data is "not measured" and left out, never scored 100.
3. **The glance.** At most seven places to look, ranked, each with its links. This is the Reviewer's list for step 8.
4. Under them: the dimension table, the per-PR change table, the stages, the scoreboard lines, the 5 Whys, and a link to each run's own report.

[Chapter 3](03-reading-a-report.md) walks through all of it on a real report.

## Step 8: the reviewer's glance

**Owner:** Reviewer. **Input:** the glance, at most seven items.

The Reviewer goes to the artefact, not the summary. Each item links to the hunk in `report.html`, the claim that covers it and the PR (and the file in its diff) that caused it. Look at each, then record one mark:

| Mark | Means | Becomes |
| --- | --- | --- |
| `verified` | looked, and agrees with the claim | counts towards go |
| `disputed` | looked, and does not agree | a new claim or a hold |
| `escalated` | cannot tell from the artefacts | a 5 Whys on why the harness could not show it |

```console
pnpm harness glance status --run out/<time>-release-command
pnpm harness glance mark --run out/<time>-release-command --item 2 --mark verified --by <reviewer> --note "opened the diff"
```

A real mark, on a copy of the kept Main to RC report (16.2.2 against `sha-54a8f83`):

```text
item 2 marked verified by <reviewer> (looked, and agrees with the claim): counts towards go
  PR #313, a first contribution, touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte: "feat(ui): rebuild Tutors with the Paper design system"
Red: hold and open a 5 Whys whatever the marks say (SOP step 9).
recorded in <dir>/glance-marks.jsonl; re-rendered confidence.json
```

The mark is one line in `glance-marks.jsonl` in the release directory. A changed mind is a new line; the latest one counts. The glance in `confidence.json`, `report.md`, `gate.md` and `report.html` is re-rendered; nothing else moves. An `escalated` mark also opens a 5 Whys stub in `<dir>/kaizen/`. When `--by` is the author of a PR in the release, the command says so and records the mark anyway: the deviation is the Captain's to log.

The Reviewer needs the release directory. Work on the Captain's machine, or copy the whole directory: the marks belong beside `confidence.json`.

**Done when:** every item is marked `verified`, `disputed` or `escalated`, and `harness glance status` shows no item "not marked".

## Step 9: go or no-go

**Owner:** Captain. **Input:** the Gate, the band, the glance marks.

```console
pnpm harness glance status --run out/<time>-release-command
```

| Gate | Band | Decision |
| --- | --- | --- |
| FAIL | (no RCS) | **Hold.** Fix the difference or claim it, then cut the next rc. A 5 Whys is already open. |
| PASS or WARN | **Red** (below 75) | **Hold** and open a 5 Whys, even though the Gate passed. Do not re-run hoping for a better number. |
| PASS or WARN | **Amber** (75 to 89) | **Go only when every glance item is marked `verified`.** `glance status` says whether it is. |
| PASS or WARN | **Green** (90 or more) | **Go** on the Captain's say. |

A WARN exits `0` but says why the harness could not fail (usually `advisory only:`, no licensing A/A). Read the reason before you decide.

The score is advisory while the team checks that the weights match its judgement (three releases, [lean.md](../lean.md#build-order)), and no band changes an exit code. The SOP still holds on Red; the band is the prompt for the 5 Whys.

Record the decision in the release PR. `gate.md` is written to be the comment; the harness never posts it:

```console
gh pr comment <n> --body-file out/<time>-release-command/gate.md
```

**Done when:** the decision (go or hold, with the Gate, the band and the marks) is recorded in the release PR.

## Steps 10 and 11: deploy and the watch window

**Owner:** Captain.

**Step 10, deploy.** In the monorepo: tag `vX.Y.Z` on the commit the last rc was cut from. Do not add a commit between the last rc and the final tag: the final tag promotes the judged rc images instead of rebuilding, and only when the trees match ([chapter 6](06-ci-integration.md#the-monorepo-side)). Then:

```console
pnpm deploy:pin 16.3.0      # rewrites the overlays and release/deployed.json; open it as a PR
```

Merging the pin PR is the deploy. `deploy.yml`'s `announce` job waits for approval in the `production` environment, sets `HARNESS_PRODUCTION_TAG` on the harness repository, and dispatches `deployed` with the digests. `post-deploy.yml` then runs every 15 minutes.

**Step 11, the watch window.** 24 hours. `post-deploy.yml` replays the reference journeys against production and compares them with the recorded candidate. A new difference (exit `1`) opens one `rollback` issue on the harness repository, with the report and the 5 Whys stub for the rollback in a fold. Exit `2` (could not judge) fails the workflow but opens no issue, because nothing says production is worse.

To watch from your own machine instead (it needs no Docker):

```console
pnpm harness local watch --once --deployed 16.3.0
```

**Stop the line:** a rollback issue in the watch window. Roll back (`pnpm deploy:pin <previous>` in the monorepo) and open the 5 Whys the issue carries.

**Done when:** the pin PR is merged, `post-deploy.yml` is running, and 24 hours pass with no rollback issue.

## When a trigger fires: the 5 Whys

A 5 Whys opens on four triggers, and none is optional: a Gate FAIL, a Red band, a rollback issue, and a run rule firing on the scoreboard. An escalated glance mark opens one too. The harness opens it, not a person remembering to:

| Trigger | Opened by | Where the stub is |
| --- | --- | --- |
| Gate FAIL | `harness release` | `<release-command dir>/kaizen/<date>-<tag>-gate.md` |
| Red band | `harness release` | `.../kaizen/<date>-<tag>-band.md` |
| a run rule at this release | `harness release` | `.../kaizen/<date>-<tag>-<rule>-<series>.md` |
| an escalated glance mark | `harness glance mark --mark escalated` | `.../kaizen/<date>-<tag>-<kind>-<key>.md` |
| rollback | `post-deploy.yml` | in the rollback issue, folded |

Anything else can be opened by hand, for example one hunk:

```console
pnpm harness why --run out/<time>-release-command --finding <hunk id> --tag 16.3.0-rc.1
```

**Why 1 is already answered**, from the run's own files: for a Red band, the RCS, the floors breached, the dimensions below 100 and where the most points went, each with a link. Whys 2 to 5 are yours. Each answer must be checkable against an artefact, a PR or a document. "Human error" is not an answer; it is the prompt for the next why. Stop at the first answer that is a process or a tool, and choose exactly one countermeasure of seven kinds: mutant, journey, mask review, EARS spec, claim guidance, SOP change, glance rule.

Then, in the harness checkout:

```console
cp out/<time>-release-command/kaizen/<file>.md kaizen/
pnpm harness why check kaizen/<file>.md       # exit 1, with each gap and its reason, until it is ready
pnpm harness why register --write             # regenerate the table in kaizen/README.md
```

Open a PR with the file and the regenerated register. CI runs both checks. The register, and how to close an item, is [kaizen/README.md](../../kaizen/README.md).

**Done when** (SOP step 12): every open 5 Whys has an owner and a due date.

## Step 12: close the release

**Owner:** Captain. **Input:** the scoreboard line, the kaizen items.

**The scoreboard line.** `harness release` appended one line to `HARNESS_HOME/scoreboard/releases.jsonl` after the score (a `--fast` run is never appended; a failing run is, with no RCS). CI appends its own copy to the `scoreboard` branch. Read the trends:

```console
pnpm harness scoreboard trends
```

It draws six views over releases (the RCS in its bands, the eight dimensions, masks, claims, hotspots, per-file risk) and the run rules: three declines in a row, or two of three releases below 75, in any dimension or the RCS. Beside them is the harness's own health ([chapter 5](05-noise-and-self-test.md#the-harnesss-own-health-on-the-scoreboard)). Until a release is scored it says `Scoreboard: no releases scored yet.` That is the honest empty state.

**The register.**

```console
pnpm harness why register
```

prints the open, overdue and closed counts and exits `1` when `kaizen/README.md` is out of date. Review each open item: owner, due date, and whether this release shows a countermeasure working. If it does, put the release in `Verified by` and regenerate.

**Deviations.** Any step skipped, reordered or done differently is a deviation. Record it in the release PR (the step, what happened, why) and add it to the kaizen register. A deviation is not blame; it shows where the sheet does not fit the work.

**Done when:** the scoreboard line is appended, the report pages are refreshed, every open 5 Whys has an owner and a due date, and the register has been reviewed.

## A branch smoke: `--fast`

For a branch, or to check the machine before a real candidate:

```console
pnpm harness release --candidate 16.3.0-rc.1 --baseline prod --monorepo ../tutors-mono-repo --fast
pnpm release:candidate 16.3.0 -- --fast        # the same, from the monorepo
```

One run, no load, no rehearsals and no A/A of its own (a licensing store is still used; otherwise the release step can only warn). The terminal, `report.md`, `report.html` and `status.json` all say: `--fast: one run, no load, no rehearsals. This report cannot be used for a go decision.` It appends no scoreboard line and opens no 5 Whys.

A lighter look at what `main` changes since the last release, without a candidate, is `pnpm compare` ([chapter 2](02-running-locally.md#comparing-main-with-the-last-release)).

## How CI runs the same thing

The workflows add transport (a dispatch, an artifact, a branch, an issue) around the same harness commands. The difference that matters: CI runs release mode with 5 runs, and `harness release` with 3.

| Step | On your machine | In CI |
| --- | --- | --- |
| 1 | `pnpm release:candidate X.Y.Z` | a push to `release/**`: the monorepo's `release-dispatch.yml` tags `vX.Y.Z-rc.N`, waits for the images and dispatches `release-candidate` to the harness |
| 2 | the local noise store, or the noise stage's A/A | `nightly-noise.yml`, every night, on the `noise` branch |
| 5, 6 | `harness release` | `release.yml`: jobs `release` (5 runs, k6), `migration`, `upgrade`; titled `release <candidate>` |
| 7 | the changes and score stages | `release.yml`'s `scoreboard` job: `harness changes`, `harness confidence`, `harness scoreboard append`, pushed to the `scoreboard` branch |
| comment | `gh pr comment <n> --body-file gate.md` | the monorepo's `release-harness-report.yml` posts one comment on the release PR from `release.yml`'s release report (the verdict and the unclaimed differences) |
| 11 | `harness local watch` | `post-deploy.yml`, every 15 minutes, and the `rollback` issue |
| 12 | `harness scoreboard trends` | `pages.yml` publishes `scoreboard.html` beside the reports |

Every day, **Main to RC** (`main-preview.yml`) runs step 5 on the newest signed images of `main` against production and main's claims so far: the report the next candidate would get today. It is a forecast, never a gate, and it is the live example on the [report pages](https://tutors-sdk.github.io/tutors-release-harness/). The details are in [chapter 6](06-ci-integration.md).

## Stop the line: every stop in one table

| Where | What you see | What to do |
| --- | --- | --- |
| resolve | `line stopped at resolve: the images of <a> or <b> could not be obtained or verified` | make both sides exist and be signed; `harness images ensure --a <a> --b <b>` says why; run again |
| noise | `line stopped at noise: the A/A of <tag> is dirty` | review each difference: a mask in its own PR or a determinism fix; `harness local nightly`; run again |
| release | `gate: FAIL -> exit 1` | claim or fix each unclaimed difference; cut the next rc; fill the 5 Whys stub |
| rehearse | `line stopped at rehearse: <migration and/or upgrade> did not pass` | fix it in the candidate; a migration that breaks expand/contract or a rollout that drops requests is not claimed |
| score | `RCS <n> Red` | hold; fill the 5 Whys stub. No re-run for a better number |
| watch | a `rollback` issue | roll back with `pnpm deploy:pin <previous>`; fill the 5 Whys stub in the issue |

A re-run of the same candidate only adds evidence. To add timing samples, run the gate with more runs (`pnpm harness local gate --a 16.2.2 --b 16.3.0-rc.1 --runs 5`) and say so in the release PR. A re-run to change the verdict is a deviation, and it is logged.
