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

## Pending: two changes on their way

Everything in this guide describes what is on `main` (harness 1.4.1, contract 1.4.0). Two small changes are in flight and will land as their own pull requests; the guide mentions them where they matter and does not rely on them.

- **`harness local compare`** (`pnpm compare`): main against the last release in one command: it finds the release, pulls and verifies both sides, runs release mode with no claims, and prints the verdict, the counts and the report path. An exploration: exit 0 whenever a report was produced. See [chapter 2](02-running-locally.md#comparing-main-with-the-last-release).
- **A deterministic settle for the signed-in reader's A/A**: a known flake class on the `reader-auth` course page (extra console messages, or extra lines in the accessibility tree) that a page settle fix will remove. Until then, [chapter 5](05-noise-and-self-test.md#a-known-flake-class-the-signed-in-reader) says how to recognise it and how to read the artifact the weekly mutants job now uploads.

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

**7. Rehearse a release without starting anything.** `--dry-run` prints the commands a task would run and starts nothing:

```console
pnpm harness local gate --a 16.2.0 --b 16.3.0-rc.1 --runs 5 --dry-run
```

Where to go next: the full maintainer tasks are in [chapter 2](02-running-locally.md); if you are writing claims for a release, go to [chapter 4](04-writing-claims.md).

## A note on the command line

`pnpm harness ...` is `tsx src/cli.ts ...` and prints two banner lines from pnpm before its own output. `pnpm -s harness ...` (silent) or `node bin/harness.mjs ...` prints only the harness's output; both work. This guide writes `pnpm harness` throughout. `pnpm harness --help`, `-h` and `help` print the usage and exit 0; `pnpm harness run --help` (or `pnpm harness help run`) prints that command's part of it. A bare `pnpm harness` prints the usage and exits 2.
