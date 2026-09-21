# 02 Running locally

Everything the harness does runs from one command on a laptop: Windows 11 (Git Bash or PowerShell), macOS or Linux, with Docker, Node 22 and pnpm. The GitHub workflows are an optional convenience. What a workflow does with the harness is a `pnpm harness ...` line, and `tests/local-parity.test.ts` holds those lines to the plans of the local wrappers, so a CI run and a local run cannot mean different things by the same name.

OpenShift is out of scope. Compose and kind are what runs.

- [Set up the machine](#set-up-the-machine)
- [Where state lives](#where-state-lives)
- [The four maintainer tasks](#the-four-maintainer-tasks)
- [The run modes](#the-run-modes)
- [Running beside your own stack](#running-beside-your-own-stack)
- [Where the images come from](#where-the-images-come-from)
- [Scheduling](#scheduling)
- [Retention of `out/`](#retention-of-out)
- [Windows notes](#windows-notes)

## Set up the machine

```console
pnpm install
pnpm exec playwright install chromium
pnpm harness doctor
```

`harness doctor` is read-only. It takes `--for nightly,gate,mutants,watch,kind` to say what the machine is wanted for (default: the first four; `kind` only when you ask for it), `--json` to print the same result as data, and `--port-offset <n>` to check the ports a shifted stack would use. Exit `0` means ready, `1` means a tool a run needs is missing, `2` means a usage error.

| Check | Why it matters |
| --- | --- |
| Node 22 or newer, pnpm, git | the harness itself, the guards and the version stamp |
| Docker daemon reachable, running **Linux containers**, Compose v2, and the daemon's clock against the host's | every stack. Docker Desktop's VM clock drifts after sleep and breaks pulls and signature checks |
| cosign 3 or newer | a registry image is not judged without a verified signature (exit 2). cosign 2 reads the monorepo's signatures as missing |
| syft, grype and grype's database | the mutants need syft. Without grype the vulnerability artefact is "not collected" |
| Playwright's Chromium | every journey, including the post-deploy watch |
| helper images already local: k6, `postgres:16-alpine`, the fixture stubs' Node image | a run that has to work offline |
| free disk (fails under 5 GiB, warns under 15 GiB), `HARNESS_HOME` writable | images, SBOMs and captures |
| the host ports the stack publishes | your own service on 8080 or 3100 |
| the fixed subnet `172.29.0.0/24` against every other Docker network | otherwise `docker compose up` fails with "Pool overlaps" |
| a leftover compose project of this checkout, and a legacy `tutors-harness` stack or kind cluster | reported, never removed |
| Windows: WSL's `bash` first on `PATH`, CRLF in `scripts/*.sh`, long paths | see [Windows notes](#windows-notes) |

Install the tools that are missing with the platform commands the doctor prints. On Windows: `winget install Docker.DockerDesktop Git.Git OpenJS.NodeJS.LTS Kubernetes.kind Kubernetes.kubectl`, and `scoop install cosign syft grype` (cosign must be version 3 or later) or the release binaries from GitHub, renamed `.exe`, on `PATH`. On macOS: `brew install cosign syft grype`. On Linux: your package manager, or the release binaries.

## Where state lives

`HARNESS_HOME` is where the harness keeps what outlives one run. The default is `<checkout>/.harness` (git-ignored). Set the variable to move all of it, for example to a backed-up folder.

| Path under `HARNESS_HOME` | What | The workflow's version of it |
| --- | --- | --- |
| `noise/noise-status.json`, `noise-history.json`, `noise-summary.md` | the latest night, the ratchet's history, tonight's summary | the `noise` branch |
| `image-cache/` | `docker save` of the last verified production images | `actions/cache` |
| `overrides.jsonl` | every applied override, one JSON line each, hash-chained, append-only | `harness-override` issues |
| `releases/<candidate>.json`, `releases/<release>.json` | what release mode judged: the digests of the candidate's images and the verdict | the `release-records` branch |
| `rollbacks/` | what a failing watch would have opened as an issue | `rollback` issues |
| `locks/run.lock`, `locks/watch.lock` | one heavy run per machine; one watch | `concurrency:` groups |
| `image-provenance.json` | the ledger `images ensure` leaves for `run` (`HARNESS_PROVENANCE_FILE` moves it) | a file on the runner |

Run output stays in `<checkout>/out/<UTC timestamp>-<mode>/` (`--out` on `harness run`). The `local` wrappers always use `<checkout>/out`.

The noise store is **this machine's calibration**. The A/A measures the noise floor of the machine that ran it (fonts, anti-aliasing, timing), and the gate applies the same rule locally as in CI. Do not copy CI's `noise-status.json` into the local store to gain the right to fail: a Linux runner's clean A/A says nothing about this machine's Chromium.

## The four maintainer tasks

Each `harness local` task is one command, planned as the list of `harness` commands the matching workflow runs. `--dry-run` prints the plan and starts nothing, which is the safest way to learn what a task will do:

```console
pnpm harness local nightly --runs 5 --dry-run
```

```text
harness local nightly: 3 step(s)

environment: HARNESS_IMAGE_PREFIX=quay.io/tutors-sdk/tutors-{app}

  1. pull and verify the production images
       harness images ensure --a main --b main --image-cache <checkout>\.harness\image-cache
  2. A/A on main, 5 runs, with load
       harness run --mode noise --a main --b main --runs 5 --load 20x30s --require-verified
  3. record the night in the local noise store
       harness noise record --status {latest:noise} --tag main
```

Things every task has in common:

- The environment default is the workflows': `HARNESS_IMAGE_PREFIX` defaults to `quay.io/tutors-sdk/tutors-{app}` (a value you set yourself wins), and the production tag defaults to `HARNESS_PRODUCTION_TAG`, else `main`. `main` is a moving tag; set the deployed tag for anything you will rely on.
- `--port-offset <n>` moves the compose stack's host ports ([below](#running-beside-your-own-stack)).
- Nightly, gate and mutants hold a lock (`locks/run.lock`): one heavy run per machine. A second one stops at once with `another harness run holds ...` and exit 2. A lock whose holder has died is taken over. The `watch` holds its own lock.
- The exit code is the worst of the steps.
- A plan prints the override reason without quotes; if you copy a printed line to run it by hand, quote the reason yourself.

### Nightly A/A: `harness local nightly`

```console
pnpm harness local nightly [--tag T] [--runs n] [--load 20x30s] [--image-cache dir] [--store dir] [--no-record] [--dry-run] [--port-offset n]
```

1. `images ensure --a T --b T --image-cache <HARNESS_HOME>/image-cache`: pull the production images and verify their signatures. With the registry down, last night's verified images come back from the cache and the night is *degraded*.
2. `run --mode noise --a T --b T --runs n --load 20x30s --require-verified`, where `n` is `--runs` or the workflow's run count, and the load is `--load` or `20x30s`.
3. `noise record --status <that run> --tag T`: append the night to the noise store, keep the ratchet, write the summary. Exit `1` when the ratchet is broken. `--no-record` leaves this step out.

`--store` names another noise store for step 3 (default `<HARNESS_HOME>/noise`). See [chapter 5](05-noise-and-self-test.md).

### Release gate for a candidate: `harness local gate`

```console
pnpm harness local gate --a 16.2.0 --b 16.3.0-rc.1 [--claims path/to/claims.yaml] [--rules path-or-url] [--runs n] \
    [--a-digests d] [--b-digests d] [--only release|migration|upgrade] \
    [--migrations-a v16.2.0 --migrations-b <sha>] \
    [--override-reason "why, 20+ characters" --override-by leigh] [--dry-run]
```

The three jobs of `release.yml`, in order, on one machine:

1. `noise status`: does the gate have the right to FAIL? (informational)
2. `images ensure` for both sides (skipped with `--only migration`).
3. **release** mode: A/B with claims and k6 load (`--load 20x30s`).
4. **migration** rehearsal (`--a` and `--b` default to `v<production>` and `v<candidate>`; `--migrations-a` and `--migrations-b` name other git refs).
5. **upgrade** rehearsal (`--set fixture --journey anonymous-student-reads-course`).

A FAIL in one does not hide the others. If `images ensure` fails, the release and upgrade steps are skipped. Afterwards `out/<time>-gate/gate.md` holds the three "pull-request comments" in one file and `gate.json` the verdicts. Exit `1` when any rehearsal FAILs and was not overridden.

`--claims` is a file: take it from the monorepo checkout's `release/claims.yaml`. `--rules` is the release's `rules.json` (a path or a URL); without it, a claim that names a `rule` is invalid. `--a-digests` and `--b-digests` pin a side's images by digest, exactly as the release dispatch does ([chapter 6](06-ci-integration.md#the-release-candidate-dispatch)). `--override-by` defaults to git's `user.name`, else the operating-system account.

A candidate image the registry lacks is built from the monorepo ref, loudly, as in CI; that build is not evidence for a release.

Because the gate does not pass `--noise`, the release step reads the local noise store. If it has no clean, verified, fresh status the release step will only warn.

### The harness's own signal: `harness local mutants`

```console
pnpm harness local mutants [--base T] [--dry-run]
```

`images ensure --a T --b T`, then `mutants --base T`: an A/A first, then each of the ten planted regressions must FAIL and be attributed. The mutants are built locally and syft must be installed (`harness doctor --for mutants`). `--base` defaults like the nightly's tag. See [chapter 5](05-noise-and-self-test.md#the-mutant-self-test).

### Post-deploy watch: `harness local watch`

```console
pnpm harness local watch [--recorded out/<time>-release] [--production reader=URL,catalogue=URL,live=URL] \
    [--deployed <tag> [--deployed-digests d] [--release-record f]] [--interval 15m] [--once] [--dry-run]
```

Runs the reference journeys against production and compares them with the recorded candidate: by default the newest `out/*-release` run that did not FAIL (an overridden FAIL counts), or the one you name with `--recorded`. `--production` defaults to `HARNESS_PRODUCTION_URLS`, else `reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev`.

- Without `--once` it loops until Ctrl-C, starting each iteration one `--interval` after the last *started* (default `15m`, at least `10s`). It never exits on a difference.
- A difference (verdict FAIL) writes `<HARNESS_HOME>/rollbacks/<time>-rollback.md`, what the `rollback` issue would have said. Nothing notifies you: watch the folder, or wrap the command.
- A watch that finds the previous one still running does nothing (`--once` exits 0), as the workflow's concurrency group does.
- It needs no Docker.
- `--deployed`, `--deployed-digests` and `--release-record` add the deployment check: what the deploy says it deployed is compared with the release record of the judged candidate, and a difference (or no record) makes a pass a warn ([chapter 6](06-ci-integration.md#the-deployed-dispatch)).

## The run modes

`harness run --mode <mode> --a <ref> --b <ref>` is the command underneath. Use it directly when you want one mode, a flag a wrapper does not expose, or a smaller run. It does **not** take the run lock; do not start two at once.

```console
pnpm harness run --mode <mode> --a <ref> --b <ref> [options]
```

The flags shared by the capturing modes:

| Flag | Meaning |
| --- | --- |
| `--runs n` | journey repetitions per side. Default 1; timing needs at least four to be judgeable, five is the recommendation |
| `--set fixture,auth,reference` | journey sets (default all three) |
| `--journey name` | one journey; repeatable |
| `--load 20x30s` | k6 after the journeys on each side, `<rate>x<duration>` |
| `--out dir` | output root (default `./out`) |
| `--now iso` | the frozen clock (default `HARNESS_NOW`, else `2026-09-16T09:05:00.000Z`) |
| `--substrate compose\|kind` | default compose |
| `--no-screenshots`, `--no-axe`, `--no-focus`, `--no-runtime` | switch a collector off; the report says so |
| `--startup-restarts n` | restarts per app for the startup artefact (default 5; 0 switches it off) |
| `--keep`, `--no-stack` | leave the stack running afterwards; assume it is already up |
| `--image-prefix`, `--allow-unsigned` | where bare tags live; judge unverified registry images (local work only) |

### `noise`: is the harness itself clean?

```console
pnpm harness run --mode noise --a 16.2.0 --b 16.2.0 --runs 5 --load 20x30s --require-verified
```

`--a` and `--b` must be the same images (the run refuses otherwise). `--require-verified` writes the status *degraded* unless every image on both sides was pulled and signature-verified in this run; the nightly always sets it. It writes `noise-status.json` beside the report.

### `release`: gate the candidate

```console
pnpm harness run --mode release --a 16.2.0 --b 16.3.0-rc.1 \
  --claims ../tutors-mono-repo/release/claims.yaml --rules ../tutors-mono-repo/release/rules.json \
  --runs 5 --load 20x30s
```

Both stacks come up, every selected journey runs `--runs` times per side, each page is captured, and the two sides are compared, matched against claims and judged. Extra flags: `--claims`, `--rules`, `--noise <file|dir|skip|none>` (omitted: the local store), `--claim-max-hunks n`, `--a-digests`, `--b-digests`, `--override-reason` and `--override-by`. A claims file that is invalid stops the run with exit 2 before any stack starts. Release mode also writes the release record ([chapter 6](06-ci-integration.md#the-release-record)).

### `migration`: can the candidate's migrations run beside version a?

```console
pnpm harness run --mode migration --a v16.2.0 --b release/16.3.0
pnpm harness run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-good   # PASS
pnpm harness run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-bad    # FAIL, four violations
```

No app stacks. A throwaway `postgres:16-alpine` gets the Supabase baseline roles, then a's migrations, is snapshotted with `pg_dump`, gets the migrations b adds, and the two schemas are compared with the expand/contract rule. The snapshot is then restored into a fresh database and must equal a's schema. `--snapshot <pg_dump file>` restores a sanitised production dump first. The refs are monorepo git refs (fetched with `scripts/fetch-migrations.sh`, which needs `bash`) or `dir:<path>`.

### `upgrade`: does a rolling upgrade drop requests?

```console
pnpm harness run --mode upgrade --a 16.2.0 --b 16.3.0-rc.1 --upgrade-seconds 45 --upgrade-rate 20
```

Both stacks plus the edge proxy. Both sides are captured once (both must work), then k6 runs through the edge for `--upgrade-seconds` at `--upgrade-rate` requests a second; a third of the way in the edge switches new requests to b, two thirds in `reader-a` is stopped. Every response carries `x-harness-upstream`, so a failure is attributed to a side. Zero failed or 5xx requests and at least one request served by b, or it fails. Upgrade mode runs on compose only; on kind use `pnpm harness kind rollout --a ... --b ...`, a real `RollingUpdate`. Upgrade mode does not sample startup.

### `post-deploy`: does production behave like the tested candidate?

```console
pnpm harness run --mode post-deploy \
  --recorded out/2026-09-17T14-00-00-release \
  --production reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev
```

No stacks. Side a is the recorded candidate's capture from a release run (filtered to the `reference` journeys, so that release run must have included that set); side b is captured now against the live URLs with the same journeys: anonymous, read-only traffic against the published reference course. Metrics, logs, runtime and persistence are not compared, and a set of CDN-only header masks applies. `--deployed <tag>`, `--deployed-digests <digests>` and `--release-record <file|dir>` add the deployment check.

### `any-two`: an investigation

`--mode any-two` compares any two images and never fails; use it to look at a pull-request image or your own build. It is not evidence.

### Re-judging a finished run: `harness compare`

```console
pnpm harness compare --dir out/<run> --mode release --claims new-claims.yaml --rules rules.json --noise skip
```

Normalise, compare, match claims and gate again on captures already on disk. Use it to try a new claims file, a mask or an engine without re-running the stacks. It rewrites `report.md`, `report.html` and `report.json` in place (and, for noise mode, the status). It needs no Docker. It does not write a release record. `--noise skip` waives the A/A requirement and is recorded in the report: fine for finding out what would fail, never a verdict to rely on.

### Hand-driving the stacks

`harness stack up|down --a <ref> --b <ref>` starts or stops both compose stacks; `harness kind up|down|rollout` does the same for kind (`down` deletes the namespaces; the cluster stays). `up` (and `kind up`, `kind rollout`) refuses an image that is not present locally, or a registry image that is not verified. A kind cluster called plain `tutors-harness` is refused, never adopted or deleted.

## Running beside your own stack

| What | Configurable | How |
| --- | --- | --- |
| Compose project name | yes | `HARNESS_COMPOSE_PROJECT`, then `HARNESS_PROJECT`, else `tutors-harness-<first 8 hex of the sha256 of the checkout's real path>` (lowercased on Windows). Never `tutors`, so a developer's own project is not touched. Two checkouts or git worktrees get two names; the same checkout always gets the same one. `harness doctor` prints it. |
| kind cluster name | yes | `HARNESS_KIND_CLUSTER`, then `HARNESS_PROJECT`, else the same derived name. Plain `tutors-harness` is refused. |
| Host ports | yes, compose only | one variable each, or all at once with `--port-offset n` on `harness local ...` and `harness doctor`. A variable you set yourself wins. |
| The network subnet `172.29.0.0/24` and the identity stub's address `172.29.0.10` | **no** | fixed in `compose.harness.yaml`. Two harness stacks, or any Docker network on that range, cannot coexist. The run lock serialises harness runs. |
| kind host ports 4100 to 4202 | **no** | fixed in `deploy/kind/kind-config.yaml` |

The host ports of the compose stack, and the variable that moves each:

| Variable | Default | What |
| --- | --- | --- |
| `COURSE_PORT` | 8080 | the fixture course server (also changes the course id, identically on both sides) |
| `IDENTITY_PORT` | 8443 | the identity stub (TLS, test CA) |
| `EDGE_PORT` | 3300 | the edge proxy (`upgrade` mode) |
| `PERSISTENCE_PORT_A`, `PERSISTENCE_PORT_B` | 8090, 8091 | each side's persistence stub |
| `READER_PORT_A`, `READER_PORT_B` | 3100, 3200 | reader |
| `CATALOGUE_PORT_A`, `CATALOGUE_PORT_B` | 3101, 3201 | catalogue |
| `LIVE_PORT_A`, `LIVE_PORT_B` | 3102, 3202 | live |
| `READER_AUTH_PORT_A`, `READER_AUTH_PORT_B` | 3103, 3203 | the signed-in reader |
| `TIME_PORT_A`, `TIME_PORT_B` | 3104, 3204 | time |

`--port-offset 1000` shows in the plan's environment:

```text
environment: HARNESS_IMAGE_PREFIX=quay.io/tutors-sdk/tutors-{app} COURSE_PORT=9080 IDENTITY_PORT=9443 EDGE_PORT=4300 PERSISTENCE_PORT_A=9090 READER_PORT_A=4100 CATALOGUE_PORT_A=4101 LIVE_PORT_A=4102 READER_AUTH_PORT_A=4103 PERSISTENCE_PORT_B=9091 READER_PORT_B=4200 ...
```

An offset of 1000 lands the stack on 4100 to 4203, which is where a kind cluster's fixed host ports live (4100 to 4202). If you keep a kind cluster around, use an offset such as 2000.

A run never stops, removes or prunes anything outside its own compose project (`docker compose -p <project> down`) and its own kind namespaces.

## Where the images come from

The harness compares images, and a verdict is only worth something if they are the images that ship. So it records where each came from and checks what it can. `harness images ensure` gets each image by the first of these that works:

| # | Source | When | Recorded as |
| --- | --- | --- | --- |
| 1 | already local | you built it, or an earlier `ensure` pulled it | `local (unverified)`, or what the earlier `ensure` recorded |
| 2 | registry pull, signature verified | the reference names a registry and the tag or digest is there | `pulled+verified` |
| 3 | the image cache | the registry could not be reached (an outage, a rate limit) and `--image-cache` was given | `cached` (a degraded night) |
| 4 | build from a git ref | a bare tag the registry does not have | `built-from-ref <ref>@<sha>` |

### Quay, by tag or by digest

The monorepo publishes `quay.io/tutors-sdk/tutors-<app>`. Give the template through the environment (or `--image-prefix`):

```bash
export HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'
pnpm harness images ensure --a 16.2.0 --b 16.3.0-rc.1
```

```powershell
$env:HARNESS_IMAGE_PREFIX = 'quay.io/tutors-sdk/tutors-{app}'
pnpm harness images ensure --a 16.2.0 --b 16.3.0-rc.1
```

Typical output (digests shortened; the wording comes from the code):

```text
16.2.0:
  pulling quay.io/tutors-sdk/tutors-reader:16.2.0
  verified quay.io/tutors-sdk/tutors-reader@sha256:4f1c... signed by ^https://github.com/tutors-sdk/tutors-mono-repo/...
  reader: quay.io/tutors-sdk/tutors-reader:16.2.0 - pulled+verified · sha256:4f1c... · revision 1a2b3c4d5e6f · version 16.2.0
```

A tag can move; a digest cannot. To compare against exactly what is deployed, pin the digests, either with `--a-digests` and `--b-digests` beside bare tags, or spelled out per app:

```console
pnpm harness images ensure --a 16.2.0 --a-digests reader=sha256:<64 hex>,catalogue=sha256:<64 hex>,live=sha256:<64 hex> --b 16.3.0-rc.1
pnpm harness images ensure --a "reader=quay.io/tutors-sdk/tutors-reader:16.2.0@sha256:<64 hex>,catalogue=quay.io/tutors-sdk/tutors-catalogue@sha256:<64 hex>,live=quay.io/tutors-sdk/tutors-live@sha256:<64 hex>" --b 16.3.0-rc.1
```

A pinned image is pulled by digest, verified on that digest, and refused (exit 2, "cannot judge") when its tag now resolves to another digest. A pinned image is never built from source. `--a 16.2.0@sha256:...` is refused (a digest names one image), as is a lone `repo@sha256:...` with no tag for the other apps to take.

Both `--a-digests` and `--b-digests` take a JSON object (`{"reader":"sha256:..."}`) or `reader=sha256:...,catalogue=sha256:...`. An app you leave out is not pinned.

### Verification

A registry image is not judged until its cosign signature has been checked, **by digest** and **against an identity**: the certificate must have been issued to the monorepo's `image-build.yml` workflow by GitHub's OIDC issuer (`HARNESS_COSIGN_IDENTITY` and `HARNESS_COSIGN_ISSUER` override who must have signed). `harness run` checks again before starting anything: a registry image with no verification on record for that exact local image, or one that is not present at all, is refused with exit 2 (`cannot judge: ...`), because otherwise compose would pull it silently and unverified. Run `images ensure` first.

Verification needs the network (Sigstore's transparency log): there is no offline verification. The image cache is the outage path, and it is degraded.

`--allow-unsigned` (or `HARNESS_ALLOW_UNSIGNED=1`) judges a registry image whose signature could not be verified. It is for local investigation only: the images are recorded `pulled-unverified` with the reason, the report header says so, and the reasons say the run "is not evidence for a release".

### The image cache

`images ensure --image-cache <dir>` always asks the registry first. When the pull fails because the registry cannot answer, it loads last night's verified images from the directory and records them `cached`. A tag the registry says **does not exist** never borrows another night's cache. The cache is refreshed only from images pulled and verified in the same run, so an unverified or locally built image can never enter it. `harness local nightly` uses `<HARNESS_HOME>/image-cache`.

### The local build fallback

When the registry lacks a bare tag, `images ensure` builds the images from the monorepo ref with `scripts/build-images.sh`, trying `v<tag>`, `<tag>` and `release/<tag>` in turn (`--ref-a` and `--ref-b` name the ref explicitly; `TUTORS_REPO` names another repository). It is loud on purpose, because a local build is not the image that ships:

```text
  BUILDING FROM SOURCE: 16.9.9 is not in the registry; building the three images from monorepo ref v16.9.9
```

The side is recorded `built-from-ref v16.9.9@<sha>`, the report shows a warning at the top, and the reasons say the side "was built here from monorepo ref ..., not pulled from the registry: it is not the image that ships". A release decision should rest on `pulled+verified` on both sides. It needs `bash` (Git Bash on Windows; see below).

### Your own build

In the monorepo, `docker compose build` produces `tutors/<app>:local`. With the default prefix `tutors`, that is enough:

```console
pnpm harness run --mode noise --a local --b local
```

To compare your working tree against production, mix the two namings:

```bash
export HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'
B="reader=tutors/reader:local,catalogue=tutors/catalogue:local,live=tutors/live:local"
pnpm harness images ensure --a 16.2.0 --b "$B"
pnpm harness run --mode any-two --a 16.2.0 --b "$B"
```

Local images are recorded `local (unverified)`. The result is an investigation, not a release verdict.

## Scheduling

The harness runs a task and exits; scheduling belongs to the operating system. Docker Desktop must be running for the user the task runs as: schedule it "only when the user is logged on" and let Docker Desktop start at login. Both examples log to `.harness/logs/` (create it once). A night without a result breaks "consecutive" after 36 hours, so a laptop that sleeps through the night breaks the streak; tell the scheduler to run a missed task when the machine wakes.

### Windows Task Scheduler (PowerShell)

```powershell
mkdir D:\code\tutors-release-harness\.harness\logs -Force | Out-Null
$repo = "D:\code\tutors-release-harness"

# nightly A/A at 02:17 local time; run it if the machine was off at that time; never two at once
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

The scheduler starts tasks with a minimal environment. If `pnpm` is not found, give the full path (`%APPDATA%\npm\pnpm.cmd`, or corepack's), and set `HARNESS_PRODUCTION_TAG` and `HARNESS_HOME` with `setx` if you use them (open a new terminal after `setx`; it does not change the current one). Or leave `pnpm harness local watch` running in a terminal: it loops by itself.

Remove the tasks with `Unregister-ScheduledTask -TaskName "Tutors harness nightly" -Confirm:$false` (and the watch).

### cron (Linux)

```cron
PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin
17 2 * * *    cd ~/tutors-release-harness && pnpm harness local nightly >> .harness/logs/nightly.log 2>&1
*/15 * * * *  cd ~/tutors-release-harness && pnpm harness local watch --once >> .harness/logs/watch.log 2>&1
```

cron uses the machine's local time; GitHub's schedule uses UTC (`17 2 * * *`); neither matters to a verdict.

### macOS

cron works. A `launchd` agent with `StartCalendarInterval` does the same and survives sleep better than cron: run the same two commands from it. Docker Desktop must be running in your session.

### What to watch

- `.harness/logs/nightly.log` for the exit code line `harness local nightly: ensure=0 noise=0 record=0 -> exit 0`.
- `harness noise status` and `harness noise history` for the streak.
- `.harness/rollbacks/` for what a failing watch found.

## Retention of `out/`

**Nothing prunes `out/`.** Each run directory holds screenshots and captures for both sides, so `out/` grows with every nightly, gate and mutants run. Delete old run directories by hand or on a schedule. Two cautions:

- `harness local watch` compares production with the newest `out/*-release` run that did not FAIL. Keep at least that one, or pass `--recorded` with a copy you have kept.
- `HARNESS_HOME` is different: `noise-history.json` keeps the most recent 400 nights, `image-cache/` is overwritten by each verified night, `releases/` holds one small file per candidate, `rollbacks/` accumulates, and `overrides.jsonl` is an append-only, hash-chained record that you should keep.

Delete run directories older than 14 days:

```bash
# bash, zsh, Git Bash
find out -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
```

```powershell
# PowerShell
Get-ChildItem out -Directory | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } | Remove-Item -Recurse -Force
```

Docker keeps images too. `docker system prune` drops unused images, yours included; use it deliberately, not from a schedule.

## Windows notes

- **PowerShell or Git Bash: same commands.** Set an environment variable with `HARNESS_NOW=... pnpm harness ...` (bash), `$env:HARNESS_NOW = "..."` (PowerShell) or `set HARNESS_NOW=...` (cmd). In PowerShell 5.1, `pnpm` may be `pnpm.ps1`, which an execution policy of `Restricted` refuses: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use `pnpm.cmd`.
- **bash.** Only two things need it: the from-source image build (`scripts/build-images.sh`) and the migration rehearsal's fetch (`scripts/fetch-migrations.sh`). Install Git for Windows. If `harness doctor` says `bash` is WSL's launcher, either put Git's `bin` before `System32` on `PATH` or set `HARNESS_BASH`:

  ```powershell
  $env:HARNESS_BASH = "C:\Program Files\Git\bin\bash.exe"
  ```

- **MSYS path conversion.** The harness starts `docker`, `git` and the scripts with `MSYS_NO_PATHCONV=1`. If you run `docker run -v /c/... ` by hand in Git Bash, set it yourself, or write `//c/...`.
- **Line endings.** `.gitattributes` forces LF. Do not open the shell scripts in a tool that rewrites them; `harness doctor` checks.
- **Paths.** Keep the checkout short; run directories nest deep. `git config --global core.longpaths true` and Windows' `LongPathsEnabled` if you cannot.
- **Ports.** Windows reserves ranges (Hyper-V, WinNAT). `netsh int ipv4 show excludedportrange protocol=tcp` lists them; `harness doctor` reports a reserved port as such. Move the stack with `--port-offset`.
- **Docker Desktop** must be on Linux containers (WSL 2 backend). Its VM clock drifts after sleep or hibernation; `harness doctor` compares it with the host's, and restarting Docker Desktop fixes it.
- **Tools installed as `.cmd` shims** (npm-global installs) will not start: the harness only spawns `docker`, `cosign`, `syft`, `grype`, `kind`, `kubectl`, `git` and `bash`, which are `.exe` files.
