# Tutors release harness: user guide

The release harness answers one question before a Tutors release ships: **is every observable difference between production and the candidate one that somebody meant?**

It runs the production images (side a) and the candidate images (side b) in two identical stacks, drives the same scripted traffic through both, records everything it can observe, normalises the noise away, and diffs the two. A difference passes only when a claim from the release covers it. Anything unclaimed fails the run.

## What it is, and what it is not

It is:

- a diff engine over what you can observe from outside: page structure, screenshots, network calls, response headers, console output, accessibility findings, keyboard order, timing, `/metrics`, logs, what a page writes, and what the container images and their runtime posture are.
- a gate that may fail a release, but only while its own noise check (the A/A run) is clean, verified and recent.
- a rehearsal for two risky things a diff cannot show: a database migration (expand/contract) and a rolling upgrade under load.
- a runner you can start on your own machine. The GitHub workflows are an optional convenience; every step of them is a `harness` command that also runs locally.
- one command for a release, `harness release`, that ends in the Gate, then a Release Confidence Score with its band, then at most seven ranked places for a Reviewer to look. The score is advisory: it never changes the Gate or an exit code.

It is not:

- a test suite for the apps. It never reads the apps' source and never says why something changed, only that it did.
- a proof that the candidate equals production. A release should differ. The harness proves that the differences are *claimed*.
- a place to weaken the check. A mask (a field the harness ignores) is a blind spot someone chose, and it lands in its own reviewed change.
- a tool for OpenShift. The compose and kind substrates are what runs; OpenShift is out of scope and this guide does not cover it.
- something that writes to your pull requests. It produces a Markdown comment; posting it is the monorepo's job.

## Start here

- **To run a release:** [10 Running a release](10-running-a-release.md). Every step of the release SOP with its command, what you see, and when it is done.
- **To read a report:** [03 Reading a report](03-reading-a-report.md). A real Main to RC report, top to bottom: the Gate, the score, the glance, the differences.
- **To see one now:** the [report pages](https://tutors-sdk.github.io/tutors-release-harness/). Main to RC judges today's `main` against production every day, exactly as a release candidate would be judged. It is the live example the guide teaches from.

## Who reads which chapter

| You are | Start with | Then |
| --- | --- | --- |
| **The Captain**: you run a release and own the go or no-go | [10 Running a release](10-running-a-release.md), [03 Reading a report](03-reading-a-report.md) | [01 Concepts](01-concepts.md), [08 Troubleshooting](08-troubleshooting.md) |
| **The Reviewer**: you do the glance at step 8 | [03 Reading a report](03-reading-a-report.md) (sections 1 to 4), [10, step 8](10-running-a-release.md#step-8-the-reviewers-glance) | [01 Concepts](01-concepts.md) |
| **A Contributor**: you write changelog lines and claims | [04 Writing claims](04-writing-claims.md), [03 Reading a report](03-reading-a-report.md) | [10, steps 3 and 4](10-running-a-release.md#steps-3-and-4-the-changelog-and-the-claims), [08 Troubleshooting](08-troubleshooting.md) |
| **A maintainer or operator**: you run the harness locally and schedule it | [02 Running locally](02-running-locally.md), [05 Noise and self-test](05-noise-and-self-test.md) | [01 Concepts](01-concepts.md), [08 Troubleshooting](08-troubleshooting.md) |
| **A CI integrator** on the monorepo side | [06 CI integration](06-ci-integration.md), [07 Reference](07-reference.md) | [10 Running a release](10-running-a-release.md#how-ci-runs-the-same-thing) |
| **A harness developer**: you add an artefact, mask, mutant or journey | [09 Extending](09-extending.md) | [01 Concepts](01-concepts.md), [05 Noise and self-test](05-noise-and-self-test.md) |

Read in this order the first time: 01, 10, 03, 04, then the rest as you need them. The roles are the monorepo's `release/SOP.md`; the Lean ideas behind them are in [docs/lean.md](../lean.md).

| Chapter | Covers |
| --- | --- |
| [01 Concepts](01-concepts.md) | A and B, the stacks, journeys, artefacts, masks, claims, verdicts, the gate, the score, exit codes, and the five Lean ideas |
| [02 Running locally](02-running-locally.md) | `HARNESS_HOME`, every `local` wrapper and `run` mode, ports, image sources, scheduling, retention |
| [03 Reading a report](03-reading-a-report.md) | A real report top to bottom: the Gate, the RCS and its band, the eight dimensions, the glance, the per-PR change table, the differences, the 5 Whys; then each file and each kind of finding, real regression versus noise versus missing claim, timing statistics |
| [04 Writing claims](04-writing-claims.md) | The claims schema, a cookbook of worked examples, hygiene, rejections and fixes |
| [05 Noise and self-test](05-noise-and-self-test.md) | The A/A run, the noise store and ratchet, the mutants, the guards, the harness's own health on the scoreboard |
| [06 CI integration](06-ci-integration.md) | Workflows, variables, dispatch payloads, the monorepo side, Main to RC, the scoreboard branch, release tags, the rollback issue, overrides, exit codes |
| [07 Reference](07-reference.md) | Every command and flag, environment variables, exit codes, files, artefacts, contract versions |
| [08 Troubleshooting](08-troubleshooting.md) | Symptom, cause, fix |
| [09 Extending](09-extending.md) | Adding an artefact, mask, mutant, journey or stub; the versioning rules; the unit suite |
| [10 Running a release](10-running-a-release.md) | The release SOP step by step: prerequisites, `pnpm release:candidate`, `harness release` and its seven stages, the Gate, the score and the glance, go or no-go, deploy and the watch window, the 5 Whys, closing the release, `--fast`, how CI runs the same |
| [Glossary](glossary.md) | The terms used in this guide |

Older, narrower documents this guide builds on and links to: [the integration contract](../contract.md), [Lean in the harness](../lean.md), [where the images come from](../images.md), [modes](../modes.md), [running locally (parity matrix)](../local.md), [the noise burn-down playbook](../noise-burndown.md), [the kaizen register](../../kaizen/README.md), [claims](../../claims/README.md), [mutants](../../mutants/README.md) and [TESTING.md](../../TESTING.md). Where they and this guide disagree, the code and the contract win; please report the difference.

This guide describes what is on `main`: harness 1.14.0, contract 1.14.0 (`pnpm harness version` prints both). What changed in each release is in [docs/releases/](../releases/1.14.0.md).

## Quickstart: ten minutes to a first local run

You need Docker (Linux containers), Node 22 or newer, pnpm and git. Windows 11 (Git Bash or PowerShell), macOS and Linux are supported. The commands below are the same in every shell unless a variant is shown.

**1. Install the harness.**

```console
git clone https://github.com/tutors-sdk/tutors-release-harness.git
cd tutors-release-harness
pnpm install
pnpm exec playwright install chromium
```

**2. Ask the machine what it lacks.** `harness doctor` is read-only: it never starts a container, pulls an image or touches a stack.

```console
pnpm harness doctor
```

It prints one line per check and, under each problem, the fix for your operating system. This is a real run on a Windows machine that has no grype (long lines shortened):

```text
harness doctor (nightly, gate, mutants, watch) on windows

  ok    Node.js                                       v24.19.0 (needs >= 22)
  ok    pnpm                                          10.28.1
  ok    Docker                                        engine 29.7.2 via context desktop-linux
  ok    Docker runs Linux containers                  linux
  ok    docker compose v2                             5.4.0
  ok    cosign >= 3                                   3.1.3
  ok    syft                                          not installed, and not needed: on Windows the default SBOM generator runs syft in its own container (Docker)
  warn  grype >= 0.96.0                               not installed: the vulnerability artefact is 'not collected' (informational)
                                                      fix: no admin needed: unzip https://github.com/anchore/grype/releases/download/v0.119.0/grype_0.119.0_windows_amd64.zip and put grype.exe on PATH ...
  ok    Playwright's Chromium                         C:\Users\...\ms-playwright\chromium-1243\chrome-win64\chrome.exe
  warn  the k6 image is pinned                        grafana/k6:latest moves: two nightlies can run different k6 versions. Pin it with HARNESS_K6_IMAGE=grafana/k6:<version>
  ok    the host ports the stack publishes are free   15 ports, 3100-8443
  ok    the stack's fixed subnet 172.29.0.0/24 is unused   no other Docker network overlaps it

ready, with 2 warning(s).
```

Exit `0` means ready (warnings are allowed), `1` means something a run needs is missing, `2` is a usage error. Fix every `FAIL`. A machine that only needs to run the post-deploy watch can ask for less: `pnpm harness doctor --for watch`.

**3. Point the harness at the published images.** Bare tags such as `main` expand to `tutors/<app>:main`, your own local build, unless you say otherwise. The `local` wrappers use Quay by default; the direct commands need the variable:

```bash
# bash, zsh, Git Bash
export HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'
```

```powershell
# PowerShell
$env:HARNESS_IMAGE_PREFIX = 'quay.io/tutors-sdk/tutors-{app}'
```

**4. Fetch and verify the images, then run one journey on both sides.** This is what the harness's own smoke test does on every pull request: production against itself, one journey. `main` is a tag Quay always has; use the deployed tag when you want to judge production.

```console
pnpm harness images ensure --a main --b main
pnpm harness run --mode noise --a main --b main --set fixture --journey anonymous-student-reads-course
```

`images ensure` pulls each image and verifies its cosign signature against the monorepo's build workflow, so cosign 3 or newer must be on your `PATH`. The first run also pulls the helper images (k6, Postgres, the Node base for the stubs), so its length depends on your connection. `run` refuses any registry image that is not present locally and verified, and says so (exit 2).

**5. Find the report.** The last lines of the run are:

```text
verdict: PASS
  - A/A is clean: the harness may gate releases
report: <checkout>/out/2026-09-21T11-24-39-noise/report.html
```

Open that `report.html`. The same directory holds `report.md` (the text of a pull-request comment), `report.json` (what programs read), `noise-status.json` (the A/A result), and `a/` and `b/` with each side's captures. [Chapter 3](03-reading-a-report.md) explains how to read them.

A `WARN` on a first A/A is normal: it means the run found differences between production and itself, which is noise the masks do not yet cover. See [chapter 5](05-noise-and-self-test.md).

**6. Or run the whole smoke in one command.** `pnpm smoke` (`harness local smoke`) is what CI runs: it fetches the images, boots both stacks, runs one journey as an A/A, and checks that the expanding migration fixture passes and the contracting one is rejected. It takes roughly ten minutes.

**7. Rehearse a release without starting anything.** `--dry-run` prints the baseline, the noise decision and every command a release would run, and starts nothing:

```console
pnpm harness release --candidate 16.3.0-rc.1 --baseline 16.2.2 --dry-run
```

Where to go next: to run a real release, [chapter 10](10-running-a-release.md); the maintainer tasks are in [chapter 2](02-running-locally.md); if you are writing claims for a release, [chapter 4](04-writing-claims.md).

## A note on the command line

`pnpm harness ...` is `tsx src/cli.ts ...` and prints two banner lines from pnpm before its own output. `pnpm -s harness ...` (silent) or `node bin/harness.mjs ...` prints only the harness's output; both work. This guide writes `pnpm harness` throughout. `pnpm harness --help`, `-h` and `help` print the usage and exit 0; `pnpm harness run --help` (or `pnpm harness help run`) prints that command's part of it. A bare `pnpm harness` prints the usage and exits 2.
