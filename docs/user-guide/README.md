# Tutors release harness: user guide

The release harness answers one question before a Tutors release ships: **is every observable difference between production and the candidate one that somebody meant?**

It runs the production images (side a) and the candidate images (side b) in two identical stacks, drives the same scripted traffic through both, records everything it can observe, normalises the noise away, and diffs the two. A difference passes only when a claim from the release covers it. Anything unclaimed fails the run.

## What it is, and what it is not

It is:

- a diff engine over what you can observe from outside: page structure, screenshots, network calls, response headers, console output, accessibility findings, keyboard order, timing, `/metrics`, logs, what a page writes, and what the container images and their runtime posture are.
- a gate that may fail a release, but only while its own noise check (the A/A run) is clean, verified and recent.
- a rehearsal for two risky things a diff cannot show: a database migration (expand/contract) and a rolling upgrade under load.
- a runner you can start on your own machine. The GitHub workflows are an optional convenience; every step of them is a `harness` command that also runs locally.

It is not:

- a test suite for the apps. It never reads the apps' source and never says why something changed, only that it did.
- a proof that the candidate equals production. A release should differ. The harness proves that the differences are *claimed*.
- a place to weaken the check. A mask (a field the harness ignores) is a blind spot someone chose, and it lands in its own reviewed change.
- a tool for OpenShift. The compose and kind substrates are what runs; OpenShift is out of scope and this guide does not cover it.
- something that writes to your pull requests. It produces a Markdown comment; posting it is the monorepo's job.

## Who reads which chapter

| You are | Start with | Then |
| --- | --- | --- |
| **A release author**: you write claims and read a report | [03 Reading a report](03-reading-a-report.md), [04 Writing claims](04-writing-claims.md) | [01 Concepts](01-concepts.md), [08 Troubleshooting](08-troubleshooting.md) |
| **A maintainer or operator**: you run the harness locally and schedule it | [02 Running locally](02-running-locally.md), [05 Noise and self-test](05-noise-and-self-test.md) | [01 Concepts](01-concepts.md), [08 Troubleshooting](08-troubleshooting.md) |
| **A CI integrator** on the monorepo side | [06 CI integration](06-ci-integration.md), [07 Reference](07-reference.md) | [04 Writing claims](04-writing-claims.md) |
| **A harness developer**: you add an artefact, mask, mutant or journey | [09 Extending](09-extending.md) | [01 Concepts](01-concepts.md), [05 Noise and self-test](05-noise-and-self-test.md) |

| Chapter | Covers |
| --- | --- |
| [01 Concepts](01-concepts.md) | A and B, the stacks, journeys, artefacts, masks, claims, verdicts, the gate, exit codes |
| [02 Running locally](02-running-locally.md) | `HARNESS_HOME`, every `local` wrapper and `run` mode, ports, image sources, scheduling, retention |
| [03 Reading a report](03-reading-a-report.md) | `report.md`, `report.html`, `report.json`, one annotated example, real regression versus noise versus missing claim, timing statistics |
| [04 Writing claims](04-writing-claims.md) | The claims schema, a cookbook of worked examples, hygiene, rejections and fixes |
| [05 Noise and self-test](05-noise-and-self-test.md) | The A/A run, the noise store and ratchet, the mutants, the guards |
| [06 CI integration](06-ci-integration.md) | Workflows, variables, dispatch payloads, the monorepo side, overrides, exit codes |
| [07 Reference](07-reference.md) | Every command and flag, environment variables, exit codes, files, artefacts, contract versions |
| [08 Troubleshooting](08-troubleshooting.md) | Symptom, cause, fix |
| [09 Extending](09-extending.md) | Adding an artefact, mask, mutant, journey or stub; the versioning rules; the unit suite |
| [Glossary](glossary.md) | The terms used in this guide |

Older, narrower documents this guide builds on and links to: [the integration contract](../contract.md), [where the images come from](../images.md), [modes](../modes.md), [running locally (parity matrix)](../local.md), [the noise burn-down playbook](../noise-burndown.md), [claims](../../claims/README.md), [mutants](../../mutants/README.md) and [TESTING.md](../../TESTING.md). Where they and this guide disagree, the code and the contract win; please report the difference.

## Status: what depends on pending work

Everything in this guide is checked against the code in this checkout (contract and harness version 1.3.0: digests in the dispatch, `rule` claims, the local noise store, the `local` wrappers). The guide also describes work that is finished on the branch `feat/harness-1.2.1-followups` but **not yet in this checkout**. Those statements are correct once that pull request lands (lands with the follow-ups PR), and not before. They are listed here and nowhere else in the guide.

| Change | What you will see once it lands | Chapters that rely on it |
| --- | --- | --- |
| **Corrected Mann-Whitney statistics.** The p-value used by the `timing` (page TTFB, journey duration and k6 load) and `startup` artefacts is fixed. Today it is too small: a perfectly separated 5 against 5 reports p = 0.0004 (correct: 0.0122) and 3 against 3 reports 0.0136 (correct: 0.0809). | Reports say "N/N samples cannot reach alpha 0.05 (best possible p=0.081). Raise --runs" as information when the run count cannot ever be significant. Four runs per side is the least that can reach alpha 0.05 and five is the least that survives one overlapping pair. The release workflow and the nightly A/A default to `--runs 5` (today 3), and the `slow-ssr` mutant runs five. Reports and A/A history taken before the fix are not evidence about these artefacts. The local wrappers' default of 3 runs is tied to the workflows by `tests/local-parity.test.ts`, so expect it to move to 5 as well. | 03 (timing and statistics), 05, 06, 07 |
| **A wider engine-path guard.** `harness guard engine` and the "Mutants re-run (required)" check treat every collector, runtime, image-artefact, persistence, migration and bus directory, the claim matcher, `run`, the modes, stacks, image resolution, fixtures, scripts, `traffic/**`, the mutant runner and `pnpm-lock.yaml` as engine code, not only `src/compare/**`, `src/gate.ts`, masks, journeys and mutants. A new top-level entry that is in neither list fails a unit test. | More pull requests need a version bump and a mutants re-run. | 05, 09 |
| **The `time` app joins the stack.** The monorepo ships four apps; the harness stacks reader, catalogue, live and, after this, time. It appears on both compose sides (host ports 3104 and 3204), in the kind manifests (NodePorts published on host 4103 and 4203), in image resolution, verification, the image artefacts, `runtime`, `startup`, `metrics` and `logs`. No journey drives it. `--a`/`--b` accept an optional `time=REF`, `--production` an optional `time=URL`. | A base tag must exist for `time` too, and a kind cluster made earlier must be recreated. The doctor's port check covers 15 ports instead of 13, and `--port-offset` has two more ports to move. | 01, 02, 07, 08 |
| **Related fixes on the same branch.** A mask `persistence-stub-requests` (19 masks instead of 18) for the signed-in reader's timer-driven calls to its persistence stub; `ws://` origins of the persistence stub are normalised in console text; a JSON response body the browser never delivered is recorded as unread and its shape is not compared; that read is bounded to three seconds; the `base-swap` mutant swaps onto `ubuntu:24.04` because Alpine cannot receive the production filesystem (`HARNESS_MUTANT_ALT_BASE` still overrides it). | A/A runs are cleaner and the mutants self-test can build every mutant. | 01, 05, 09 |

Version numbers in this guide (1.3.0) are those of this checkout. The follow-ups branch carries its own 1.2.1 and 1.3.0 entries in `docs/contract.md`; the numbering will be settled when the two are merged.

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

It prints one line per check and, under each problem, the fix for your operating system. This is a real run on a Windows machine that lacked syft and had a leftover Docker network on the stack's fixed subnet (long lines shortened):

```text
harness doctor (nightly, gate, mutants, watch) on windows

  ok    Node.js                                       v24.19.0 (needs >= 22)
  ok    pnpm                                          10.28.1
  ok    Docker                                        engine 29.7.2 via context desktop-linux
  ok    Docker runs Linux containers                  linux
  ok    docker compose v2                             5.4.0
  ok    cosign >= 3                                   3.1.3
  FAIL  syft                                          not installed: the mutants generate SBOMs with it, and without it the added-package mutant escapes
                                                      fix: scoop install syft, or the syft_*_windows_amd64.zip from https://github.com/anchore/syft/releases on PATH
  warn  grype                                         not installed: the vulnerability artefact is 'not collected' (informational)
  ok    Playwright's Chromium                         C:\Users\...\ms-playwright\chromium-1243\chrome-win64\chrome.exe
  ok    the host ports the stack publishes are free   13 ports, 3100-8443
  FAIL  the stack's fixed subnet 172.29.0.0/24 is unused   overlaps tutors-harness_default (172.29.0.0/24): `docker compose up` fails with "Pool overlaps ..."
                                                      fix: docker network ls; docker network rm <name> (only if it is not in use)

2 problem(s) to fix before these runs can be trusted, 3 warning(s).
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

**6. Rehearse a release without starting anything.** `--dry-run` prints the commands a task would run and starts nothing:

```console
pnpm harness local gate --a 16.2.0 --b 16.3.0-rc.1 --runs 5 --dry-run
```

Where to go next: the full maintainer tasks are in [chapter 2](02-running-locally.md); if you are writing claims for a release, go to [chapter 4](04-writing-claims.md).

## A note on the command line

`pnpm harness ...` is `tsx src/cli.ts ...` and prints two banner lines from pnpm before its own output. `pnpm -s harness ...` (silent) or `node bin/harness.mjs ...` prints only the harness's output; both work. This guide writes `pnpm harness` throughout. `--help` prints the usage after a command (`pnpm harness run --help`, exit 0). A bare `pnpm harness` prints it and exits 2, and `pnpm harness --help` answers `unknown command "--help"` followed by the usage, exit 2.
