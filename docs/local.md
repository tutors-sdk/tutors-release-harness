# Running the harness on your own machine

Everything the harness does runs from one command on a laptop: Windows 11 (Git
Bash or PowerShell), macOS or Linux, with Docker, Node 22 and pnpm. The GitHub
workflows are an optional convenience. **Nothing exists only inside a
workflow:** what a workflow does with the harness is a `pnpm harness ...` line,
and [`tests/local-parity.test.ts`](../tests/local-parity.test.ts) holds those
lines to the plans of the local wrappers, so a CI run and a local run cannot
mean different things by the same name. What only GitHub can do (fetch an
artifact, push a branch, keep a cache, open an issue) is transport around those
commands, and each piece of it has a local equivalent below.

OpenShift is out of scope. The compose and kind substrates are what runs.

- [Start here](#start-here)
- [The five tasks](#the-five-tasks)
- [Parity matrix](#parity-matrix)
- [Where state lives](#where-state-lives)
- [The vulnerability database](#the-vulnerability-database)
- [The noise store is this machine's calibration](#the-noise-store-is-this-machines-calibration)
- [Scheduling](#scheduling)
- [Windows notes](#windows-notes)
- [Running beside your own stack](#running-beside-your-own-stack)
- [Still GitHub-only, and optional](#still-github-only-and-optional)
- [What the monorepo needed to change](#what-the-monorepo-needed-to-change)

## Start here

```console
pnpm install
pnpm exec playwright install chromium
pnpm harness doctor            # what is missing, and how to install it on this OS
```

`harness doctor` is read-only (it never starts a container, pulls an image or
touches a stack). Exit `0` means ready (warnings allowed), `1` means something a
run needs is missing, `2` is a usage error. `--json` prints the same as data;
`--for nightly,gate,mutants,watch,kind` says what the machine is wanted for
(default: the first four; `kind` only when asked). It checks:

| Check | Why |
| --- | --- |
| Node >= 22, pnpm, git | the harness itself, the guards, the version stamp |
| Docker daemon reachable, **Linux containers**, Compose v2, the daemon's clock against the host's | every stack; Docker Desktop's VM clock drifts after sleep and breaks pulls and signature checks |
| cosign >= 3 | a registry image is not judged without a verified signature (exit 2); cosign 2 reads the monorepo's signatures as missing |
| syft; grype (>= 0.96.0) and its database | mutants need syft; the vulnerability artefact is "NOT COLLECTED" without grype (informational, unless `HARNESS_REQUIRE_ARTEFACTS` names `vulns`), and the harness switches database updates off during a run, so the doctor checks that the database directory exists, is intact, and how old it is (build time, age, checksum; a warning past `HARNESS_VULN_DB_MAX_AGE_DAYS`, default 5, and a failure instead when `HARNESS_REQUIRE_ARTEFACTS` names `vulns`, or its alias `HARNESS_REQUIRE_STATIC` is set); the fix is [`harness vuln-db update`](#the-vulnerability-database) |
| Playwright's Chromium | every journey, including the post-deploy watch |
| helper images already local: k6, `postgres:16-alpine`, the fixture stubs' `node:22-bookworm-slim` | a run that has to work offline |
| free disk, `HARNESS_HOME` writable | images, SBOMs and captures |
| the 15 host ports the stack publishes | a developer's own service on 8080 or 3100 |
| the fixed subnet `172.29.0.0/24` against every other Docker network | `docker compose up` fails with "Pool overlaps" otherwise |
| a leftover compose project of this checkout (`tutors-harness-<8 hex>`) | a run replaces it, `--remove-orphans` included. A stack under the old default name `tutors-harness` is reported by `harness doctor` as "legacy stack, not touched" and never removed |
| Windows: WSL's `bash` first on PATH, CRLF in `scripts/*.sh`, long paths off | see [Windows notes](#windows-notes) |

## The five tasks

Each is one command, planned as the list of `harness` commands the workflow
runs. `--dry-run` prints the plan and starts nothing; each printed command line and the
environment line are quoted for the shell you are in, so they can be pasted back (single
quotes, a quote inside doubled in PowerShell and written `'''` in bash, zsh and Git Bash;
cmd.exe does not read single quotes). All of them take
`--port-offset <n>` ([below](#running-beside-your-own-stack)); nightly, gate,
mutants and smoke hold a lock so only one runs on the machine at a time; the environment
defaults are the workflows' (`HARNESS_IMAGE_PREFIX` defaults to
`quay.io/tutors-sdk/tutors-{app}`, the production tag to `HARNESS_PRODUCTION_TAG`
or `main`). Runs land in `<checkout>/out/`.

### Nightly A/A: `harness local nightly`

```console
pnpm harness local nightly [--tag 16.2.2] [--runs 5] [--load 20x30s] [--no-record] [--dry-run]
```

1. `images ensure --a T --b T --image-cache <HARNESS_HOME>/image-cache`: pull the production images from Quay and verify their signatures; with the registry down, last night's verified images come back from the cache and the night is *degraded*.
2. `run --mode noise --a T --b T --runs 5 --load 20x30s --require-verified`.
3. `noise record --status <that run> --tag T`: append the night to the [noise store](#the-noise-store-is-this-machines-calibration), keep the ratchet, write the summary. Exit `1` when the ratchet is broken (the count had reached 0 and is not 0 tonight).

The exit code is the worst of the steps.

Before the first one (and after a quiet week), `harness vuln-db update`: the run scans with the database already in `<HARNESS_HOME>/vuln-db` and never updates it ([details](#the-vulnerability-database)); CI's job fetches it before it starts, in the same way.

### Release gate for a candidate: `harness local gate`

```console
pnpm harness local gate --a 16.2.0 --b 16.3.0-rc.1 [--claims path\to\claims.yaml] [--runs 5] \
    [--migrations-a v16.2.0 --migrations-b <sha>] [--only release|migration|upgrade] \
    [--override-reason "why, 20+ characters" --override-by leigh] [--dry-run]
```

The three jobs of `release.yml`, in order, on one machine: the noise status
(does the gate have the right to FAIL?), `images ensure`, **release** (A/B,
claims, k6), **migration** rehearsal (refs default to `v<tag>`), **upgrade**
rehearsal. A FAIL in one does not hide the others; a candidate image the
registry lacks is built from the monorepo ref, loudly, as in CI (and is not
evidence for a release). Afterwards `out/<time>-gate/gate.md` holds the three
"PR comments" in one file, `gate.json` the verdicts. Exit `1` when any
rehearsal FAILs and was not overridden.

`--claims` is a file: take it from the monorepo checkout's
`release/claims.yaml` (CI fetches the same file by URL).

### The harness's own signal: `harness local mutants`

```console
pnpm harness local mutants [--base 16.2.2] [--dry-run]
```

`images ensure --a T --b T`, then `mutants --base T`: A/A first, then each of the
ten planted regressions must FAIL and be attributed. The mutants are built
locally; syft must be installed (`harness doctor --for mutants`).

### The two-stacks smoke: `harness local smoke`

```console
pnpm smoke                                  # the same command
pnpm harness local smoke [--tag 16.2.0] [--only stacks|migration] [--dry-run]
```

What the CI job "Two stacks boot and one journey runs (A/A)" does, and ci.yml now
calls exactly this: `images ensure --a T --b T`; both stacks boot and one journey
(`anonymous-student-reads-course`) runs A/A; the expanding migration fixture must
pass; the contracting one (`b-bad`) must be **rejected**. That last step is the one
that used to be `if cmd; then exit 1` in the workflow's shell: it is now a step that
expects the FAIL verdict (exit 1), so accepting the fixture fails the smoke, and so
does a harness error (exit 2), which is not a rejection. The first step that does not
do what it must stops the rest. `--only stacks` or `--only migration` runs half;
`--dry-run` prints the four commands. Roughly ten minutes; it needs what
`harness doctor --for nightly` checks (Docker, cosign, Chromium), and `bash` on a
machine whose registry lacks the tag.

### Post-deploy watch: `harness local watch`

```console
pnpm harness local watch [--recorded out\<time>-release] [--production reader=URL,catalogue=URL,live=URL[,time=URL]] \
    [--interval 15m] [--once] [--dry-run]
```

Runs the reference journeys against production and compares with the recorded
candidate: by default the newest `out/*-release` run that did not FAIL (an
overridden FAIL counts), or the one you name. Without `--once` it loops every 15
minutes until Ctrl-C, starting each iteration one interval after the last
*started*; it never exits on a difference. A difference (verdict FAIL) writes
`<HARNESS_HOME>/rollbacks/<time>-rollback.md`, what the `rollback` issue would
have said. A watch that finds the previous one still running does nothing
(`--once` exits 0), as the workflow's concurrency group does. It needs no
Docker.

**A fresh checkout or worktree has no recorded run.** The recorded candidate is a
release run under *this* checkout's `out/` (the run directories; `.harness/` holds
the noise store, locks and rollback notes), and a new `git worktree` has its own,
empty `out/` and `.harness/`. Until `harness local gate` has produced
a release run there, or you pass `--recorded <dir>` (a release run directory from
another checkout, or a downloaded `release-report` artifact), `harness local watch`
runs nothing and exits **2** ("no recorded release run to compare production
with"). It is not a failure of production.

Each log line is stamped with the time it is printed, which is when the comparison
ended (a run takes tens of seconds), followed by `(run started <time>)`. The schedule
still counts from the start. A local WARN or FAIL says `decide whether to roll
back`, not `open a rollback issue`: nothing here opens an issue (the note under
`rollbacks/` is written on a FAIL only), whereas the workflow's reason keeps the CI
wording (`HARNESS_ROLLBACK_ISSUE`, or GitHub Actions).

## Parity matrix

Where each step runs today, and what runs it locally. **CLI** is a harness
command already; **WF** is logic that lived only in workflow YAML (or a script
only the workflow called); **GH** is a GitHub service. "Status" is after the
commits that came with this document.

### nightly-noise.yml

| # | Step | Today | Local equivalent | Gap, status |
| --- | --- | --- | --- | --- |
| N1 | Toolchain: node, pnpm, Chromium, cosign 3 (setup actions) | GH | `harness doctor` | cosign, syft and grype have no reliable `winget` package: `scoop` or a release binary. **Closed** |
| N2 | Restore last verified images (`actions/cache/restore`) | GH | `--image-cache <HARNESS_HOME>/image-cache`, the default of `local nightly` (same relative path as the workflow: `.harness/image-cache`) | keeps the last save only, which is what `restore-keys` picked. **Closed** |
| N3 | Pull from Quay, `cosign verify` by digest | CLI | same | `cosign verify` needs the network (Sigstore TUF and Rekor): no offline verification. Inherent; the cache is the outage path and is degraded. **Documented** |
| N4 | Save the cache if refreshed (`actions/cache/save`, `image_cache=` output) | GH | `images ensure` refreshes the directory itself | none. **Closed** |
| N5 | A/A, 5 runs, `--load 20x30s --require-verified` | CLI | same | none. **Closed** |
| N6 | Report in the job summary | GH | `out/<time>-noise/report.md` and `report.html` | none |
| N7 | Upload `noise-status` and `noise-report` (8 days) | GH | `out/` | the artifact expires on GitHub; locally `out/` grows with screenshots. **Closed**: [`harness prune`](#disk-harness-prune) |
| N8 | History from the `noise` branch (`gh api`) | GH | `<HARNESS_HOME>/noise/noise-history.json` | none. **Closed** |
| N9 | Record tonight, ratchet, summary (`noise-history.ts record`) | WF | `harness noise record` | none. **Closed** |
| N10 | Force-push the `noise` branch | GH | the store directory is the publication | none. **Closed** |
| N11 | Fail the night when the ratchet is broken | WF | `noise record` exits 1; `local nightly` exits 1 | none. **Closed** |
| N12 | Cron `17 2 * * *` (UTC), concurrency group | GH | Task Scheduler or cron, and the run lock ([Scheduling](#scheduling)) | the machine must be awake; a night without a result breaks "consecutive" after 36 h. **Documented** |
| N13 | Runner pinned to `ubuntu-24.04` | GH | none | the A/A measures the noise floor of the machine that ran it: see [the calibration](#the-noise-store-is-this-machines-calibration). **By design** |
| N14 | grype at a pinned version (`anchore/scan-action/download-grype`) | GH | install grype ([how](#the-vulnerability-database)); `harness doctor` names the version CI pins | none. **Closed** |
| N15 | The vulnerability database: restore per UTC day (`actions/cache/restore`), fetch on a miss, save, check | GH + CLI | `harness vuln-db update` into `<HARNESS_HOME>/vuln-db` (the same `.harness/vuln-db`), `harness vuln-db status`; `harness doctor` for the age | a laptop refreshes by hand (there is no daily key: one directory, until you update it), and `local nightly`/`local gate` do not run the update themselves. **Closed** (recipe) |
| N16 | `HARNESS_REQUIRE_STATIC=1` in the nightly job | GH | set the variable | the local run is informational unless you set it. **Documented** |

### release.yml

| # | Step | Today | Local equivalent | Gap, status |
| --- | --- | --- | --- | --- |
| R1 | `repository_dispatch: release-candidate` from the monorepo | GH | `harness local gate --a --b` | the monorepo's `pnpm release:harness --run` (its PR #307, on `main`) builds the same `client_payload` from a clone, with git alone, and hands it to `harness local gate`; `--print` shows it. Needs the harness cloned beside the monorepo (or `HARNESS_DIR`). **Closed** |
| R2 | Production tag and migration refs derived by `gh api` in the monorepo's workflow | GH | `--a`, `--migrations-a` by hand | `pnpm release:harness` reads the production tag from the reader overlay and probes `migrations_a` (`v<tag>`, then `release/<tag>`) with git, and passes them to `harness local gate`. **Closed** |
| R3 | Fetch `claims.yaml` (`curl`) | WF | `--claims <file>` | none. **Closed** |
| R4 | Fetch the latest noise status (`gh api`) and vet it | GH + WF | the default store; `harness noise status` | none. **Closed** |
| R5 | Release mode (A/B, claims, k6) | CLI | same | none. **Closed** |
| R6 | Migration and upgrade rehearsals, on separate runners | CLI | same, one after the other | one machine shares one compose project, so they run in sequence under the lock: longer wall clock. **Closed** |
| R7 | Override: `override_reason` input, actor from `github.triggering_actor` | GH | `--override-reason`, `--override-by` (default: git `user.name`) | none. **Closed** |
| R8 | Record the override (`gh issue create`, label `harness-override`) | GH | `<HARNESS_HOME>/overrides.jsonl`, append-only and hash-chained; `harness override list [--since]` | tamper-evident, not tamper-proof: a person with the file can rewrite it. **Closed** |
| R9 | "PR comment" (`report.md` into the job summary) | GH | `report.md` and `report.html` in each run directory, and `gate.md` | the contract forbids workflows any PR permission, so nothing is ever posted; to post by hand: `gh pr comment <n> --body-file out\<time>-gate\gate.md`. **Closed** |
| R10 | `release-report` artifact (30 days) | GH | `out/` | as N7. **Closed** |
| R11 | grype, its database, and `HARNESS_REQUIRE_STATIC=1` in the release job | GH + CLI | as N14 to N16 | none beyond those. **Closed** |

### post-deploy.yml

| # | Step | Today | Local equivalent | Gap, status |
| --- | --- | --- | --- | --- |
| P1 | `repository_dispatch: deployed` after a deploy | GH | `harness local watch --once` | the monorepo's `deploy.yml` (its PR #298) sets `HARNESS_PRODUCTION_TAG` on this repository and dispatches `deployed` with `production` and `digests` once the pins are on `main` and the `production` environment is approved. Locally, `pnpm release:harness --deployed --run` in the monorepo runs `harness local watch --once` with `HARNESS_PRODUCTION_TAG` set. **Closed** |
| P2 | Recorded run: the `release-report` artifact of the latest successful release run | GH | the newest local `*-release` run that did not FAIL, or `--recorded` | a CI release run's artifact is not visible locally: download it and pass `--recorded`. **Closed** |
| P3 | Every 15 minutes | GH | `local watch` loop, or `--once` under Task Scheduler or cron | none. **Closed** |
| P4 | Rollback issue (`gh issue create`, label `rollback`) | GH | `<HARNESS_HOME>/rollbacks/*.md` | nothing notifies you: watch the folder, or wrap the command. **Closed** |
| P5 | `HARNESS_PRODUCTION_URLS` variable | GH | the same environment variable, or `--production` | none. **Closed** |

### weekly-mutants.yml and ci.yml

| # | Step | Today | Local equivalent | Gap, status |
| --- | --- | --- | --- | --- |
| M1 | syft from `anchore/sbom-action/download-syft` (pinned, v1.52.0) | GH | install syft; `HARNESS_SBOM_CMD` to point at it | `harness doctor`. **Closed**; on Windows see X12 |
| M2 | The ten mutants | CLI | `harness local mutants` | none. **Closed** |
| M3 | Engine-change guard and version bump (`engine-change.ts`) | WF | `harness guard engine --base <ref>` | compares `<base>...HEAD`, so committed work only (it says so when the tree is dirty). **Closed** |
| M4 | "Mutants re-run (required)": shell that combines two job results | WF + GH | the exit codes of `guard engine` and `local mutants` | nothing to port: a required status check is a GitHub setting. **n/a** |
| M5 | grype and its database in the mutants job; no `HARNESS_REQUIRE_STATIC` there | GH + CLI | as N14 and N15 | none: the mutants job does not require it, and neither does a local run. **Closed** |
| C1 | Masks land in their own PR (`mask-change.ts`) | WF | `harness guard masks --base <ref>` | as M3. **Closed** |
| C2 | Typecheck, lint, unit and fixture tests | CLI | `pnpm typecheck`, `pnpm lint`, `pnpm test` | none |
| C3 | Two-stacks smoke, including "the contracting fixture must be rejected" (`if cmd; then exit 1`) | CLI | `harness local smoke` (`pnpm smoke`); ci.yml calls it | the inversion is a step that expects the FAIL verdict. **Closed** |
| C4 | Stack logs on failure | WF | `docker compose -p <project> -f compose.harness.yaml --profile upgrade logs`, where `<project>` is this checkout's compose project (`harness doctor` prints it) | CI pins `HARNESS_COMPOSE_PROJECT=tutors-harness`, one checkout per runner. **Documented** |
| C5 | Claims hygiene | CLI | reported in every report that has claims; never gates | none |

### Prerequisites and platform

| # | Concern | Finding | Status |
| --- | --- | --- | --- |
| X1 | `bash` for `scripts/*.sh` | on a Windows PATH the first `bash` is often WSL's launcher (`System32` or `WindowsApps`): it cannot read `D:\` paths and fails with no distribution. `HARNESS_BASH` names another; `harness doctor` tells the two apart with `uname -s` | **Fixed**, `HARNESS_BASH` |
| X2 | MSYS path conversion | the harness starts its children with `MSYS_NO_PATHCONV=1` so `/paths` reach docker untouched. That also switched off the conversion `build-images.sh` needed for `mktemp -d` (`/tmp/tmp.X` handed to native `git.exe` and `docker.exe`). Both scripts now use `cygpath -m` | **Fixed**; unverified end to end (no build was run) |
| X3 | CRLF | `.gitattributes` forces LF on checkout; a copied or zipped tree can still bring CR into `scripts/*.sh` (`\r: command not found`) | `harness doctor` checks. **Closed** |
| X4 | `pnpm` on Windows is `pnpm.cmd` | Node will not spawn it without a shell; the harness only spawns `docker`, `cosign`, `syft`, `grype`, `kind`, `kubectl`, `git`, `bash` (all `.exe`). A tool installed as a `.cmd` shim (npm-global) will not start | **Documented** |
| X5 | Docker socket | the harness only shells out to the `docker` CLI, which follows its context. `syft docker:` reads the daemon itself; if it cannot connect, `DOCKER_HOST` from `docker context inspect --format '{{.Endpoints.docker.Host}}'` | **Verified** on Docker Desktop's `desktop-linux` context (syft 1.52.0 reached the daemon and listed the layers), but see X12 |
| X6 | k6 image | `grafana/k6:latest`, unpinned | `harness doctor` warns; pin with `HARNESS_K6_IMAGE` |
| X7 | Time zone, `HARNESS_NOW` | no verdict depends on the host zone: the browser is pinned to Europe/Dublin, the frozen clock is a UTC instant, run directories and the noise status are UTC. `HARNESS_NOW` is read from the environment (PowerShell `$env:HARNESS_NOW = "..."`, cmd `set`), or `--now`. The **Docker VM's clock** is what drifts | `harness doctor` checks the skew and the value. **Closed** |
| X8 | Parallel runs and a developer's own stack | see [below](#running-beside-your-own-stack) | project name and ports **configurable**; the subnet is **not**. **Open (compose file)** |
| X9 | kind | cluster name: `HARNESS_KIND_CLUSTER`, then `HARNESS_PROJECT`, else `tutors-harness-<8 hex of the checkout's path>`: two checkouts get two clusters, and a cluster called plain `tutors-harness` (the pre-1.3.0 default, which may be yours) is refused by `harness kind up` and `down`, never adopted or deleted. Host ports 4100-4203 are fixed in `deploy/kind/kind-config.yaml`, so two clusters of two checkouts cannot run at once | `harness doctor --for kind` names the cluster, warns when it already exists, and reports a legacy `tutors-harness` cluster as not touched. **Closed** (names), ports **open, low** |
| X10 | Playwright's Chromium | the host's Chromium takes the screenshots, not a container's, so fonts and anti-aliasing are the host's | [calibration](#the-noise-store-is-this-machines-calibration) |
| X11 | CI-only environment assumptions in the code | none: `GITHUB_OUTPUT` is the only `GITHUB_*` variable read, and only to write to it when set | none |
| X12 | `syft docker:<image>` on Windows | syft 1.52.0 (Windows, Docker Desktop) fails on any image: `failed to fetch layer 2: unable to place layer cache ... The filename, directory name, or volume label syntax is incorrect`; it caches layers in files whose names contain `:` (`2-sha256:...`), which Windows forbids. `docker save` then `syft docker-archive:<tar>` fails the same way. Scanning the extracted root filesystem (`syft dir:<rootfs>`) works, and is how the SPDX fixtures of `tests/fixtures/real-tools` were made. `harness mutants` needs `syft docker:`, which is what native syft cannot do on Windows, hence the container | **Fixed**: on a Windows host the default `HARNESS_SBOM_CMD` runs syft in its own `anchore/syft` container over the Docker socket (`defaultSbomCmd`), so a local mutant run generates its SBOMs and needs no native syft (`harness doctor` says so); the nightly and release use attested SBOMs and are not affected |

Counts. The matrix was written for 37 steps in the four workflows (7 were already a harness command
(**CLI**), 7 were **workflow-only logic**, 23 were **GitHub-only services**); the vulnerability-database work
added five more (N14 to N16, R11, M5), and there are 12 platform rows (X), which are not steps: 54 rows. Of them 42 are
closed or fixed (N7 and R10 by `harness prune`, C3 by `harness local smoke`, X12 by running syft in a container on Windows), 8 documented
as a limit that stays (N3, N12, N13, N16, C4, X4, X5, X10), 2 not applicable (M4, X11), and 2 open: X8 (the fixed subnet) and
X9 (kind's fixed ports). R1, R2 and P1 were the
monorepo's; its `release:harness` script and `deploy.yml` closed them.

## Where state lives

`HARNESS_HOME`, default `<checkout>/.harness` (gitignored). Set it to move all of it,
for example to a backed-up folder.

| Path | What | The workflow's version |
| --- | --- | --- |
| `noise/noise-status.json`, `noise-history.json`, `noise-summary.md` | the latest night, the ratchet's history, tonight's summary | the `noise` branch |
| `image-cache/` | `docker save` of the last verified production images | `actions/cache` |
| `vuln-db/` | the pinned vulnerability database, fetched by `harness vuln-db update` (about 2.1 GB) | `actions/cache`, `.harness/vuln-db` |
| `overrides.jsonl` | every applied override, one JSON line each, hash-chained | `harness-override` issues |
| `releases/<candidate>.json`, `releases/<release>.json` | what release mode judged: the digests of the candidate's images, and the verdict. Written by every release-mode run; `--deployed <release>` in post-deploy mode checks a deployment against it | the `release-records` branch |
| `rollbacks/` | what a failing watch would have opened as an issue | `rollback` issues |
| `locks/run.lock`, `locks/watch.lock` | one heavy run per machine; one watch | `concurrency:` groups |
| `image-provenance.json` | the ledger `images ensure` leaves for `run` (`HARNESS_PROVENANCE_FILE` still moves it) | a file on the runner |

Run output stays in `<checkout>/out/<time>-<mode>/` (`--out` on `harness run`).

### Disk: `harness prune`

`out/` (screenshots, k6 output, captures) and the image cache (a `docker save` tar of
the production images, a gigabyte or more) grow without bound. `harness prune` frees
them:

```
pnpm harness prune                       # what would go, and how much it frees; deletes nothing
pnpm harness prune --yes                 # delete it
pnpm harness prune --older-than-days 7 --keep-last 2 --yes
```

It is a dry run unless you say `--yes`: deleting is the one thing it does that cannot be
undone, and a dry run costs a second. (`--dry-run` is accepted, and wins over `--yes`.)

A run directory (`<UTC time>-<mode>` directly under `out/`; nothing else in `out/` is
touched) goes only when **all** of these hold:

| Rule | Default | Why |
| --- | --- | --- |
| older than `--older-than-days` | 14 | the nightly makes one directory a day: a fortnight is what you look back through when a mask or a regression arrives; the noise store's history keeps the verdicts for longer |
| not among the newest `--keep-last` of its mode | 5 | a mode that runs rarely (release, upgrade) keeps its last few runs however old they are |
| not the newest release run that did not FAIL | always | it is what `harness local watch` compares production with |
| not started or changed in the last 6 hours | always | `harness run` takes no lock and may be running; the flags cannot override this |

`--older-than-days 0` makes age no reason to keep a directory; `--keep-last 0` makes
"newest" none. The image cache (`<HARNESS_HOME>/image-cache`, or `--image-cache <dir>`)
loses its `images.tar` and `manifest.json` when it was saved more than
`--image-cache-days` (30) ago: the nightly rewrites it every night, so an older one means
nothing refreshed it and it would no longer stand for production.

It never touches the state that has to persist: the noise store, the release records, the
override log, the rollbacks, the locks and the provenance ledger are not under `out/` and
are not looked at. It refuses (exit 2, nothing removed) while a `harness local` task or a
watch holds its lock, and holds the run lock itself while it deletes. Exit 1 means something
could not be removed, on Windows usually a file another program has open: it is reported,
left exactly as it was, and the rest goes on; close the program and run it again. Removal
retries a busy file a few times before giving up and never forces it; long paths need no
special handling (Node uses the extended-length path form itself), though the Windows notes above still
advise a short checkout path.

## The vulnerability database

The `vulns` artefact scans each image's SBOM with grype, and the harness never lets
grype update its database during a run (a CVE published between the two sides'
scans would look like a change in the release). So the database is a directory you
fetch once, before a run, and refresh when it is old: the same directory, command
and rules as CI ([images.md, "The vulnerability database"](images.md#the-vulnerability-database)
has the mechanism and the reasons).

```console
harness vuln-db update            # once, online: about a minute, a 160 MB download, 2.1 GB on disk, into <HARNESS_HOME>/vuln-db
harness vuln-db status            # which database a scan will read: schema, build time, age, checksum (--json for a program)
harness doctor --for nightly      # grype's version (CI pins 0.119.0), the directory, the database's age against the limit
```

- **Where:** `<HARNESS_HOME>/vuln-db` (`.harness/vuln-db`, the path CI caches),
  or `HARNESS_VULN_DB_DIR`. Unset, a scan uses `<HARNESS_HOME>/vuln-db` if it exists, so
  after one `harness vuln-db update` every run on this machine reads it without a
  variable, and before that it behaves as before (grype's own cache, updates off).
- **How old:** grype refuses a database older than 5 days, so `harness doctor`
  warns at 5 (`HARNESS_VULN_DB_MAX_AGE_DAYS` moves both). CI's is at most a day or
  two old; on a laptop, run `harness vuln-db update` before a `local gate` or
  `local nightly` that follows a quiet week. The update is the only thing that
  changes the database, so a run's two sides are always scanned with the same one.
- **Without it**, or without grype, the artefact is `NOT COLLECTED: <reason>`, with the
  command that fixes it in the reason, and informational. CI sets
  `HARNESS_REQUIRE_STATIC=1` (the alias for `HARNESS_REQUIRE_ARTEFACTS=static`) in the nightly and the release job (not in the mutants):
  a local run does not, because a laptop may lack grype or an attestation. Set it
  (`$env:HARNESS_REQUIRE_ARTEFACTS = "static"`, `export HARNESS_REQUIRE_ARTEFACTS=static`, or `vulns` alone) to judge with
  CI's strictness; `harness doctor` then fails, instead of warning, on a missing
  grype or database, and `harness vuln-db status` exits 1 on an unusable one.
- **Install grype** with no admin rights: on Windows, unzip
  `grype_0.119.0_windows_amd64.zip` from the
  [release page](https://github.com/anchore/grype/releases/tag/v0.119.0) and put
  `grype.exe` on `PATH` (that is what was done to check the parsers against the real
  tool: `tests/fixtures/real-tools`); on macOS `brew install grype`; on Linux
  `curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b ~/.local/bin v0.119.0`.
  `harness doctor` prints the same for your platform.

## The noise store is this machine's calibration

The A/A measures the noise floor of the machine that ran it: fonts, anti-aliasing,
timing. CI pins `ubuntu-24.04` for that reason. Locally the store holds *this*
machine's floor, and the gate applies the same rule to it as in CI: it may FAIL a
release only on the evidence of a status that is **clean, verified (no `degraded`)
and no more than seven days old**, else it warns. Consequences:

- Release and post-deploy mode read `<HARNESS_HOME>/noise/noise-status.json` when `--noise` is not given (they log which file). `--noise <file|dir>` names another; `--noise skip` waives the requirement, loudly; `--noise none` does not look.
- `harness noise status` says whether the gate has the right to FAIL and why not; `--require` makes it exit 1 when it has not. `harness noise history` prints the ratchet, the streak (of 7) and the last nights.
- Do not copy CI's `noise-status.json` into the local store to gain the licence: a Linux runner's clean A/A says nothing about this machine's Chromium.
- The 36-hour rule for "consecutive" nights applies: a laptop that sleeps through a night breaks the streak.

## Scheduling

The harness runs a task and exits; scheduling belongs to the operating system.
Both examples log to `.harness/logs/` (create it once). Docker Desktop must be
running for the user the task runs as: schedule it "only when the user is logged
on" and let Docker Desktop start at login.

### Windows Task Scheduler (PowerShell)

```powershell
mkdir D:\code\tutors-release-harness\.harness\logs -Force | Out-Null
$repo = "D:\code\tutors-release-harness"

# nightly A/A at 02:17 local time; run it when the machine was off at that time; never two at once
$nightly = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d $repo && pnpm harness local nightly >> .harness\logs\nightly.log 2>&1"
Register-ScheduledTask -TaskName "Tutors harness nightly" -Action $nightly `
  -Trigger (New-ScheduledTaskTrigger -Daily -At 02:17) `
  -Settings (New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2))

# the 15-minute synthetic monitor: one comparison per start (--once); the watch lock makes an overlap a no-op
$watch = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d $repo && pnpm harness local watch --once >> .harness\logs\watch.log 2>&1"
Register-ScheduledTask -TaskName "Tutors harness watch" -Action $watch `
  -Trigger (New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 3650)) `
  -Settings (New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 20))
```

Or leave `pnpm harness local watch` running in a terminal: it loops by itself.
The scheduler starts tasks with a minimal environment: if `pnpm` is not found,
give the full path (`%APPDATA%\npm\pnpm.cmd`, or `corepack`'s), and set
`HARNESS_PRODUCTION_TAG` and `HARNESS_HOME` with `setx` if you use them.

### cron (Linux, macOS)

```cron
PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin
17 2 * * *    cd ~/tutors-release-harness && pnpm harness local nightly >> .harness/logs/nightly.log 2>&1
*/15 * * * *  cd ~/tutors-release-harness && pnpm harness local watch --once >> .harness/logs/watch.log 2>&1
```

cron uses the machine's local time, GitHub's schedule uses UTC; neither matters to
a verdict. On macOS a `launchd` agent with `StartCalendarInterval` does the same
and survives sleep better than cron.

## Windows notes

- **PowerShell or Git Bash: same commands.** `pnpm harness ...` works in both. Environment variables: `$env:HARNESS_NOW = "2026-09-16T09:05:00.000Z"` (PowerShell), `set HARNESS_NOW=...` (cmd), `HARNESS_NOW=... pnpm harness ...` (bash). In PowerShell 5.1 `pnpm` may be `pnpm.ps1`, which an execution policy of `Restricted` refuses: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use `pnpm.cmd`.
- **bash.** Only two things need it: the from-source image build (`scripts/build-images.sh`, when the registry lacks a tag) and the migration rehearsal's fetch (`scripts/fetch-migrations.sh`). Install Git for Windows. If `harness doctor` says `bash` is WSL's: `$env:HARNESS_BASH = "C:\Program Files\Git\bin\bash.exe"` (or put Git's `bin` before `System32` on PATH).
- **MSYS path conversion.** The harness starts `docker`, `git` and the scripts with `MSYS_NO_PATHCONV=1`. If you run `docker run -v /c/... ` by hand in Git Bash, set it yourself, or write `//c/...`.
- **Line endings.** `.gitattributes` forces LF. Do not open the shell scripts in a tool that rewrites them; `harness doctor` checks.
- **Paths.** Keep the checkout short (`D:\code\...`); run directories nest deep. `git config --global core.longpaths true` and Windows' `LongPathsEnabled` if you cannot.
- **Ports.** Windows reserves ranges (Hyper-V, WinNAT). `netsh int ipv4 show excludedportrange protocol=tcp` lists them; `harness doctor` reports a reserved port as such. Move the stack with `--port-offset`.
- **Docker Desktop:** Linux containers (WSL 2 backend). Its VM clock drifts after sleep or hibernation; `harness doctor` compares it with the host's, and a restart fixes it.
- **Installing the tools:** `winget install Docker.DockerDesktop Git.Git OpenJS.NodeJS.LTS Kubernetes.kind Kubernetes.kubectl`; `scoop install cosign syft grype` (cosign must be v3 or later), or the release binaries on GitHub, renamed `.exe` on PATH. grype and syft need no admin rights: unzip the release archive somewhere on `PATH`.

## Running beside your own stack

| What | Configurable? | How |
| --- | --- | --- |
| Compose project name | yes | `HARNESS_COMPOSE_PROJECT`, then `HARNESS_PROJECT`, else `tutors-harness-<first 8 hex of sha256(real path of the harness checkout, lowercased on Windows)>`: never `tutors`, so a developer's own project is not touched, and **two checkouts or git worktrees of the harness on one machine get two names** (the same checkout always gets the same one; `harness doctor` prints it). Host ports and the compose subnet are still fixed: use `--port-offset` and stop one stack before starting the other |
| Container names | not set anywhere | compose derives them from the project name |
| Host ports (15) | yes | one variable each (`READER_PORT_A`, `COURSE_PORT`, `IDENTITY_PORT`, `EDGE_PORT`, ...), or all at once with `--port-offset 1000` on `harness local ...` and `harness doctor` (a variable you set yourself wins). `COURSE_PORT` also changes the course id, identically on both sides |
| The network subnet `172.29.0.0/24` and the identity stub's address `172.29.0.10` | **no**, fixed in `compose.harness.yaml` | two harness stacks, or any other Docker network on that range, cannot coexist. The run lock serialises harness runs; `harness doctor` names the network that clashes |
| kind cluster | name yes (derived from the checkout, `HARNESS_KIND_CLUSTER`, `HARNESS_PROJECT`), ports no | see X9 |

A run never stops, removes or prunes anything outside its own compose project
(`docker compose -p <project> down`) and its own kind namespaces.

## Still GitHub-only, and optional

- The monorepo's dispatches, as GitHub events (`release-candidate`, `deployed`). Locally the monorepo's `pnpm release:harness --run` and `--deployed --run` do what they carry: they run `harness local gate` and `harness local watch --once` with the same values.
- The `noise` branch as a published, browsable page, `gh issue` records, the job summaries, artifact retention.
- Branch protection and the required checks named in the workflows.
- Posting a report to a pull request (the contract forbids the workflows every PR permission).

## What the monorepo needed to change

Raised here first, and since done in the monorepo (both on its `main`):

- **A local trigger for the release gate** (its PR #307). `pnpm release:harness` builds the `release-candidate` payload (production tag from the reader overlay, `migrations_a` by probing `v<tag>` then `release/<tag>`, claims path, digests when the overlays carry them) from a clone with git alone; `--print` shows it and `--run` hands it to `harness local gate`. `release-dispatch.yml` itself is unchanged (it tags and dispatches through the API), and a conformance test holds its payload to the script's. Closes R1 and R2.
- **The deploy job** (its PR #298, `deploy.yml`). After the overlays are verified against the registry, and the `production` environment approved, it sets `HARNESS_PRODUCTION_TAG` on this repository and dispatches `deployed` with `production` and `digests`. `pnpm release:harness --deployed --run` is the local equivalent (`harness local watch --once`, with the tag set). Closes P1.

Still open, and not ours to edit:

1. **`deploy.yml` reports three digests, not four.** Its `digests` object is `{reader, catalogue, live}`, though the overlays pin `time` too and the harness stacks four apps. Release mode records a digest for each app it verified, so a deployment check against a four-digest record says `incomplete` (a warning: "the release record has a digest for `time`, but the deploy did not report one"). Adding `time` to the `jq` object in its `verify` job clears it.
2. **`release/claims.yaml` is checked by the monorepo's `pnpm check:release-claims`,** a mirror of the harness's parser; the harness has no validate-only command, so a local check runs a whole `harness run`, which reads the claims file first and stops with exit 2 on a bad one before any stack starts.
3. **`image-build.yml` signs with GitHub OIDC keyless.** Every image a local run verifies was signed by that workflow; a locally built image cannot be signed the same way, so it is `built-from-ref` and refused as evidence. That is intended.

## Contract notes

Contract 1.3.0 made these commands part of the contract (`docs/contract.md`, "CLI"
and the changelog): `doctor`, `noise record`, `noise status` and `guard` are
**stable**, because workflows and the monorepo depend on them; `local` (with `smoke`),
`prune`, `vuln-db`, `override list` and `noise history` are not. The default it documents is the one
described above: without `--noise`, release and post-deploy mode read
`<HARNESS_HOME>/noise` (explicit `--noise`, then the store, then none; a missing
status still only warns). `tests/contract.test.ts` lets this repository's own
workflows call any command `cli.json` declares; what the monorepo copies may use
only stable ones.
