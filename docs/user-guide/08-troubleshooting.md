# 08 Troubleshooting

Symptom, cause, fix. The messages are the ones the harness prints. Start with `pnpm harness doctor`: it finds most machine problems and prints the fix for your operating system. Never stop, remove or prune a container, network or cluster that is not this checkout's: other people's `tutors-*` projects and clusters share the machine, and no harness command touches them.

- [Images and signatures](#images-and-signatures)
- [The A/A run and the gate](#the-aa-run-and-the-gate)
- [Claims and rules](#claims-and-rules)
- [Ports, projects and clusters](#ports-projects-and-clusters)
- [The machine](#the-machine)
- [Guards and pull requests](#guards-and-pull-requests)
- [Commands and locks](#commands-and-locks)

## Images and signatures

### `cannot judge: tutors/reader:main is not present locally; run harness images ensure first`

**Cause.** `run`, `stack up` and `kind up` never let Docker pull an image: it must be present locally (and, if it came from a registry, verified). Two usual reasons: you did not run `images ensure`, or `HARNESS_IMAGE_PREFIX` is not set, so a bare tag expanded to `tutors/reader:main`, your own local build name, which is never pulled (a name without a registry host would resolve on Docker Hub to whoever owns that namespace). **Fix.** Set the prefix and ensure:

```bash
export HARNESS_IMAGE_PREFIX='quay.io/tutors-sdk/tutors-{app}'    # PowerShell: $env:HARNESS_IMAGE_PREFIX = '...'
pnpm harness images ensure --a main --b main
```

The `local` wrappers set the Quay prefix for you. Exit 2.

### `cosign is not installed ..., so the signature cannot be checked`

**Cause.** A registry image is not judged without a verified signature, and cosign is missing. **Fix.** Install cosign 3 or newer (`scoop install cosign`, `brew install cosign`, or the release binary on `PATH`; `harness doctor` prints the command). Missing cosign is a refusal, not a skip. Exit 2.

### `... and this is cosign 2.x.y: the images are signed with cosign 3, and verifying them needs cosign >= 3`

**Cause.** The monorepo signs with cosign 3; an older cosign reports those signatures as missing. **Fix.** Upgrade cosign. The workflows install it with `sigstore/cosign-installer@v4`.

### `no valid signature for <repo>@sha256:... by <identity> (issuer <issuer>): <cosign's last lines>`

**Cause.** The image is unsigned, or was signed by a different identity than the monorepo's `image-build.yml` workflow (a fork, a renamed workflow file, a manual push). The identity must match `HARNESS_COSIGN_IDENTITY` (default `^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@`) and the issuer `HARNESS_COSIGN_ISSUER`. **Fix.** If the signing workflow legitimately changed, set both variables to match. If it is your own unsigned image and this is investigation, `--allow-unsigned` (the report says the run is not evidence for a release). Never use it for a release decision. Exit 2.

### `the dispatch pins sha256:..., but <repo>:<tag> resolves to sha256:... now`

**Cause.** A digest was pinned (`--a-digests`, `--b-digests`, or `production_digests` and `candidate_digests` in the dispatch) and the tag has since moved, or the digest belongs to another image. The harness refuses to judge on a guess. **Fix.** Re-read the digests from the registry (`docker buildx imagetools inspect <image> --format '{{.Manifest.Digest}}'`) and re-dispatch, or drop the pin and accept that the tag decides. Exit 2.

### `cannot check that <tag> still resolves to the pinned digest (<why>)`

**Cause.** The registry could not be asked (network, an offline machine, a tag that does not exist). A pinned image is only judged when its tag and digest are known to agree. **Fix.** Restore the network; check the tag exists. Exit 2.

### A pinned image "cannot be obtained" (exit 1) and is not built

**Cause.** A pinned side is never built from source: a rebuild is not the image the digest names. **Fix.** Make the image reachable in the registry.

### `BUILDING FROM SOURCE: <tag> is not in the registry; building ... from monorepo ref <ref>`, and a `built-from-ref` banner

**Cause.** A bare tag the registry does not have. Common: a release candidate whose images were not published (the candidate's `image-build.yml` run failed or has not finished), a typo, or the wrong prefix. **Fix.** Publish the tag (the monorepo's `release-dispatch.yml` waits for it), or correct the tag. A local build is not the image that ships and is not evidence for a release. The build needs `bash` (see the `bash for scripts/*.sh` entry under [The machine](#the-machine)).

### `REGISTRY UNREACHABLE: using <image> from the image cache saved <time>; the tag may have moved, so this run is DEGRADED`

**Cause.** The registry could not answer (rate limit, outage, timeout), and `--image-cache` had last night's verified images. **Fix.** Nothing to fix in the harness. The night is degraded and counts as neither clean nor dirty; wait for the next verified night. A tag the registry says does not exist never borrows the cache.

### `images ensure` fails for `time`

**Cause.** The harness stacks four apps, so a base tag must exist for `time` too. **Fix.** Publish the `time` image for the tag, or use a tag that has all four. A kind cluster created before `time` joined the stack never published its ports: recreate it (`kind delete cluster --name <this checkout's cluster>`, then run again).

### `--a-digests: "..." is not app=sha256:<64 hex>` or `the digest of reader must be sha256: followed by 64 lowercase hex characters`

**Cause.** A malformed digest. **Fix.** Use `sha256:` and 64 lowercase hex characters, per app: `reader=sha256:<64 hex>,catalogue=...` or a JSON object. An unknown app name, or a digest contradicting one already in `--a`, is also exit 2.

## The A/A run and the gate

### The A/A is not clean: how do I find the hunk?

**Cause.** Every hunk in an A/A is noise: something differs between two identical boots. **Fix.** Open `out/<time>-noise/report.html`, and read the *Differences* table: the artefact and scope say where. Group by artefact; the table in [docs/noise-burndown.md](../noise-burndown.md#reading-a-noisy-aa) says what to look at for each. Check reproducibility across nights (once in five is a race, every night is a rule). Iterate without Docker:

```console
pnpm harness compare --dir out/<time>-noise --mode noise --masks path/to/candidate-masks.yaml
```

Then check `masksApplied`. Never retry a flake; the harness has no retries.

### `A/A is clean but DEGRADED, so it does not count: ...`

**Cause.** A zero-hunk night on evidence that was not pulled and signature-verified in that run (a cache, a local build, an unverified pull). **Fix.** Find why (`images ensure` logged `REGISTRY UNREACHABLE` or `BUILDING FROM SOURCE`) and run the next night with verified images.

### `advisory only: no A/A (noise) result was supplied ...`, and the verdict is WARN not FAIL

**Cause.** The harness had no right to fail. Release and post-deploy mode FAIL only against a status that is clean, verified and no more than seven days old. Locally, the store `<HARNESS_HOME>/noise` is empty or unusable; in CI, the `noise` branch had no usable file. **Fix.** Run `harness local nightly` (or wait for the nightly workflow), then `pnpm harness noise status` to confirm it says `release runs may FAIL`.

### `advisory only: the last A/A run (<time>) had N diff(s)` / `was degraded and does not count` / `is older than 7 day(s)`

**Cause.** The latest status does not license a FAIL: it was dirty, degraded or stale. **Fix.** Burn the noise down (dirty), fix the evidence (degraded), or run a night (stale). See the next entry for staleness on a laptop.

### `harness noise status` says the status is stale, or the streak keeps resetting

**Cause.** The machine was off or asleep at the scheduled time. A night with no result breaks "consecutive" after 36 hours, and a status older than seven days stops licensing FAILs. **Fix.** Give the scheduled task `-StartWhenAvailable` (Windows) or use `launchd` (macOS), keep the machine awake at night, or run `harness local nightly` by hand. Do not copy CI's status into your store to get the licence back.

### `noise record` exits 1: `RATCHET BROKEN`

**Cause.** The count had reached 0 on verified evidence and tonight's verified count is not 0. Something changed: the production tag, a removed mask, the harness version, the runner image. **Fix.** Diff the history (`harness noise history`): digests and harness version per night. A clean verified night clears it.

### `noise mode compares a tag with itself; --a and --b differ`

**Cause.** `--mode noise` needs the same images on both sides. **Fix.** Pass the same `--a` and `--b`.

### `the recorded run has no reference journeys; run release mode with --set reference included`

**Cause.** Post-deploy mode compares the `reference` journeys against production, and the recorded release run did not include that set. **Fix.** Run release mode with the default sets (or include `reference`) and record from that.

### `no recorded release run to compare production with: run harness local gate first, or pass --recorded`

**Cause.** `harness local watch` finds the newest `out/*-release` run that did not FAIL, and there is none (never run, only FAILs, or `out/` was pruned). **Fix.** Run `harness local gate`, or point `--recorded` at a release run directory you kept.

### Timing hunks that say `samples cannot reach alpha` or `need 3 to judge`

**Cause.** Too few runs to ever call a slowdown significant: three runs a side cannot reach alpha 0.05. **Fix.** `--runs 5`. Not a retry, and not a threshold change without its own reviewed change. See [chapter 3](03-reading-a-report.md#timing-and-statistics).

### Screenshot or font hunks in an A/A on a laptop that are clean in CI (or the other way round)

**Cause.** The A/A measures the noise floor of the machine that ran it, and the screenshots come from the host's Chromium, so fonts and anti-aliasing are the host's. **Fix.** Treat the local store as this machine's calibration and CI's as CI's. Never copy one into the other.

## Claims and rules

The messages of an invalid claims file are in [chapter 4](04-writing-claims.md#rejections-and-fixes). The ones that trip people up:

### `claim 1 of 1 (claims.0), artefact: "header" is not an artefact`

**Cause.** The artefact is not one of the nineteen names or `*`: a typo (`header`, `a11y`). **Fix.** The message prints the valid names and, when it can, `did you mean "headers"?`. Exit 2, before any stack starts, with no output directory.

### `rule: rule is the Rule's four digits, quoted: rule: "0031" ...`

**Cause.** `rule: 0031` without quotes; YAML reads it as the number 31. The message adds `the file has the number 31; write rule: "0031"`. **Fix.** Quote it.

### `rule "0031" was named, but no rules file was given`, or `rule "0999" is not in the rules file`

**Cause.** A `rule` with no rules file, or a Rule the file does not contain. The messages say what to do (`pass --rules <path|url> (in the release dispatch, rules_url), or give a reason instead`) and list the Rules the file has (`the rules file has: 0031, 0044`). **Fix.** Pass `--rules` (in a dispatch, `rules_url`), publish the rules file for the candidate's commit, or check the id.

### `cannot fetch the rules file <url>: HTTP 404` or `fetch failed`

**Cause.** The URL is not published yet, needs credentials, or the runner cannot reach it. **Fix.** Publish the file and use a URL a runner can GET without credentials (a `raw.githubusercontent.com` URL pinned to the sha).

### The report says the claim matched nothing and the hunk is still unclaimed

**Cause.** The scope or the artefact does not match. **Fix.** Compare the claim with the hunk's scope and path character by character: `reader:` versus `reader-auth:`, `:` versus `/`, the artefact. Copy the scope from the report.

### A broad claim gates even though it has `approvedBy`

**Cause.** A typo the harness ignores (`approvedby`, `approved_by`): unknown keys are silently dropped. **Fix.** `approvedBy`, exactly. The monorepo's `pnpm check:release-claims` catches unknown fields.

### The monorepo pre-check rejects a claim the harness accepts

**Cause.** The pre-check is stricter in three ways: it rejects unknown fields (`approvedby`), a broad claim with no `approvedBy`, and a cited Rule that no feature under `tests/bdd/features` defines at the ref being checked. It accepts all nineteen artefact names. **Fix.** Fix the claim as its message says; the harness's parse is the authority if the two ever disagree.

### `--override-reason must say why the FAIL is being accepted, in at least 20 characters ...`, or `an override needs both --override-reason and --override-by`

**Cause.** A rubber-stamp or too short reason (`ok`, `lgtm`, `hotfix`), or only one of the two flags. **Fix.** Name the difference and the decision, in 20 or more characters, and give both flags. Exit 2.

## Ports, projects and clusters

### `the host ports the stack publishes are free`: FAIL (`4100 (READER_PORT_A) is in use ...`)

**Cause.** Something is listening on a port the stack publishes, or Windows reserves the range. **Fix.** Stop what holds it, or move the stack with `--port-offset <n>` on `harness local ...` and `harness doctor`. `netsh int ipv4 show excludedportrange protocol=tcp` lists Windows' reserved ranges. Beware: an offset of 1000 puts the stack on 4100 to 4204, which overlaps where a kind cluster's fixed host ports are; use another offset (2000) if a kind cluster exists.

### `the stack's fixed subnet 172.29.0.0/24 is unused`: FAIL, `Pool overlaps with other one on this address space`

**Cause.** Another Docker network (another harness stack, or anything) holds the subnet the compose file fixes. The identity stub has a fixed address in it, so it cannot be moved without editing the compose file. **Fix.** `docker network ls`, and remove the network **only if it is yours and not in use**. Two harness stacks cannot run at once on one machine.

### `legacy compose project "tutors-harness"` (warning)

**Cause.** Before 1.3.0 every checkout called its stack `tutors-harness`. That stack is somebody's, not this checkout's: it is reported, never adopted or removed. It holds the fixed ports and subnet, so this checkout's stack cannot start beside it while it runs. **Fix.** If it is yours and you no longer need it, stop it yourself (`docker compose -p tutors-harness down`). If it is not yours, leave it and use a machine or a time when it is not running.

### `compose project "tutors-harness-<8 hex>" already exists`

**Cause.** A leftover of an interrupted run of this checkout, or a run in progress. A new run replaces it (`--remove-orphans`). **Fix.** Make sure no other run is in progress (the run lock stops a second `harness local` task), then run again.

### `the kind cluster name is "tutors-harness", the name the harness used before 1.3.0 for everyone ...`

**Cause.** `HARNESS_KIND_CLUSTER` or `HARNESS_PROJECT` is set to the legacy name, and a cluster of that name may be the machine owner's. **Fix.** Unset the variable to use this checkout's own derived name. The harness never adopts or deletes the legacy cluster.

### `kind cluster "<name>" already exists and would be reused` (warning)

**Cause.** A cluster of this checkout's name exists. Only its `harness-a` and `harness-b` namespaces are created and deleted. **Fix.** If it was not made from `deploy/kind/kind-config.yaml`, the host ports 4100 to 4203 are not mapped: set `HARNESS_KIND_CLUSTER` to give the harness a fresh cluster of its own.

## The machine

### `Docker runs Linux containers`: FAIL, or `the docker CLI is there but the daemon does not answer`

**Cause.** Docker Desktop is stopped, still starting, or on Windows containers. **Fix.** Start Docker Desktop and wait for it to say running; on Windows switch to Linux containers (the tray icon, or `& 'C:\Program Files\Docker\Docker\DockerCli.exe' -SwitchLinuxEngine`). The harness only shells out to the `docker` CLI, which follows the active context (`docker context show`).

### `Docker's clock agrees with this machine's`: warning, `the engine's clock is ahead/behind by N s`

**Cause.** Docker Desktop's VM clock drifts after sleep or hibernation; pulls, cosign and Sigstore are sensitive to skew (more than 60 seconds warns). **Fix.** Restart Docker Desktop (or `wsl --shutdown`, then start it again).

### `bash for scripts/*.sh`: FAIL, or `bash on PATH is WSL's, not Git Bash`

**Cause.** On a Windows `PATH` the first `bash` is often WSL's launcher (`System32` or `WindowsApps`), which cannot read `D:\` paths and fails with no distribution. Only the from-source image build and the migration rehearsal's fetch need bash. **Fix.** Install Git for Windows and put its `bin` before `System32`, or:

```powershell
$env:HARNESS_BASH = "C:\Program Files\Git\bin\bash.exe"
```

### `scripts/*.sh have LF line endings`: fail, `\r: command not found`

**Cause.** A copied or zipped tree brought CRLF into `scripts/*.sh`; `.gitattributes` forces LF on checkout. **Fix.** Re-checkout (`git config core.autocrlf false`, then re-checkout) or `dos2unix scripts/*.sh`.

### `the k6 image is pinned`: warning, `grafana/k6:latest moves`

**Cause.** The k6 image floats, so two nightlies can run different k6 versions and the A/A is not comparable night to night. **Fix.** `HARNESS_K6_IMAGE=grafana/k6:<version>`.

### `helper images are already local`: warning

**Cause.** k6, `postgres:16-alpine` and the stubs' Node image are pulled on first use; a run with no network would fail. **Fix.** `docker pull <image>` while online.

### `free disk space`: FAIL (under 5 GiB) or warning (under 15 GiB)

**Cause.** Images, SBOMs and captures need room, and `out/` and the image cache grow with every run. **Fix.** `pnpm harness prune` (a dry run: it prints what would go and how much it frees), then `pnpm harness prune --yes`. It keeps the newest five runs of each mode, anything from the last six hours, and the newest release run that did not FAIL ([chapter 2](02-running-locally.md#disk-harness-prune)). Move `HARNESS_HOME` and `--out` to a bigger drive if you must, and `docker system prune` deliberately (it drops other unused images too).

### `Playwright's Chromium`: FAIL, `not installed: no journey can run`

**Fix.** `pnpm exec playwright install chromium` (on Linux CI, `--with-deps`).

### `Node.js v20...: the harness needs >= 22`

**Fix.** Install Node 22 or newer (`winget install OpenJS.NodeJS.LTS`, `brew install node@22`, `nvm install 22`).

### `pnpm` is refused by PowerShell (`running scripts is disabled`), or a scheduled task cannot find `pnpm`

**Cause.** In PowerShell 5.1 `pnpm` may be `pnpm.ps1`, which an execution policy of `Restricted` refuses; the scheduler starts tasks with a minimal environment. **Fix.** `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use `pnpm.cmd`; give the scheduler the full path to `pnpm.cmd` and set `HARNESS_HOME` and `HARNESS_PRODUCTION_TAG` with `setx`.

### Paths too long on Windows

**Cause.** Run directories nest deep; the checkout is long. **Fix.** Keep the checkout short, enable `LongPathsEnabled` and `git config --global core.longpaths true` (the doctor warns when the path is over 90 characters and long paths are off).

### `harness prune` exits 1, or refuses with exit 2

**Cause.** Exit 1: something could not be removed, on Windows usually a file another program has open. It is reported, left as it was, and the rest goes on. Exit 2: a `harness local` task or a watch holds its lock. **Fix.** Close the program and run `harness prune` again; wait for the running task to finish.

### `vulnerability database: NOT USABLE`, or a `vulns` NOT COLLECTED line

**Cause.** grype is not installed, or its database has never been fetched, or it is older than `HARNESS_VULN_DB_MAX_AGE_DAYS` (5). The message names the command that fixes it. **Fix.** Install grype (on Windows unzip the release archive on `PATH`; no admin needed), run `pnpm harness vuln-db update` once, online, then `pnpm harness vuln-db status`. The artefact is informational unless `HARNESS_REQUIRE_ARTEFACTS` names it (the nightly and release jobs require it in CI). See [chapter 2](02-running-locally.md#the-vulnerability-database).

### An SBOM cannot be generated on Windows (`unable to place layer cache ... The filename, directory name, or volume label syntax is incorrect`)

**Cause.** Native syft on Windows caches layers in files whose names contain `:`, which Windows forbids. **Fix.** Nothing: the default generator on a Windows host runs syft in its own `anchore/syft` container over the Docker socket, so this arises only if you set `HARNESS_SBOM_CMD` to a native syft. Unset it.

### `NOT COLLECTED: runtime ...` or `startup ...` fails the run

**Cause.** `runtime` and `startup` are required by default: their collectors run against stacks the harness started, so a gap is a fault (no such container, a probe that crashed, `docker` or `kubectl` failing). **Fix.** Read the reason after the last colon and fix it; claim it only with a reason a reviewer can weigh. `--no-runtime` or `--startup-restarts 0` switch the artefact off as information, for local work only.

### `HARNESS_REQUIRE_ARTEFACTS takes artefact names (...), static or all; "x" is not one` (exit 2)

**Cause.** An unknown name in the variable; a typo must not loosen a gate. **Fix.** Use `image-manifest`, `sbom`, `vulns`, `runtime`, `startup`, `bus`, `static` or `all`.

### Post-deploy shows a wall of differences that look like spelling

**Cause.** Headers or origins that differ only in form. Since 1.4.0 `content-type` and `cache-control` are compared canonically, production's own URLs read as `{{origin}}` on both sides, and a few CDN-only masks apply in this mode. What is left is real or needs a mask. **Fix.** Compare with [chapter 3](03-reading-a-report.md#post-deploy-against-a-live-site); do not claim spelling; tell a maintainer, who will add a canonical form or a CDN-only mask in its own pull request.

### `harness compare`: `no capture at <dir>/a/capture.json`

**Cause.** `--dir` is not a run directory containing `a/` and `b/`. **Fix.** Point at `out/<time>-<mode>`, not at `out/`; for a downloaded artifact, at the timestamped directory inside it.

## Guards and pull requests

### `Masks land in their own PR`: `<masks.yaml> added <id>, and this PR also changes: <files>`

**Cause.** A pull request that adds or loosens a mask (or a threshold) also changes something else. **Fix.** Split it: the mask, its notes, its tests and the version bump go in one pull request; everything else in another. Removing a mask may travel with anything. `pnpm harness guard masks --base <ref>` checks it locally.

### `package.json version is X (base: X). A change to what the harness compares or gates on needs a version bump`

**Cause.** The pull request touches engine code (an engine, collector, mask, journey, fixture, stack, the gate or a mutant) without raising `version`. **Fix.** Bump the version, and make sure the mutants pass on the branch: `pnpm harness local mutants`.

### `base ref "<ref>" is not a commit in this repository` / `no common ancestor between <ref> and HEAD: this is a shallow clone`

**Cause.** The base is not fetched, or the clone is shallow. **Fix.** `git fetch origin`, or `git fetch --unshallow`; or name a base with `--base`. Exit 2.

### The guard passes locally but says nothing about my edits

**Cause.** The guards compare `<base>...HEAD`: committed work only. **Fix.** Commit first. The command notes how many uncommitted changes were not compared.

## Commands and locks

### `another harness run holds <file>: <task> (pid N, since <time>) ...` (exit 2)

**Cause.** One heavy run per machine: two would share the compose project, its ports and its subnet. **Fix.** Wait for the other run. A lock whose holder has died is taken over automatically; a scheduled `local watch --once` that finds the previous watch still running does nothing and exits 0.

### `harness --help` prints usage, or `harness help run` prints one command's part

**Not an error.** `pnpm harness --help`, `-h` and `help` print the usage and exit 0; `pnpm harness <command> --help` (or `pnpm harness help <command>`) prints that command's part. A bare `pnpm harness` prints the usage and exits 2.

### `TypeError [ERR_PARSE_ARGS_UNKNOWN_OPTION]: Unknown option '--x'`

**Cause.** A flag that does not exist (a typo, or from another version). **Fix.** Check [chapter 7](07-reference.md#flags). Exit 2.

### `run needs --a and --b`, `--mode must be one of ...`, `--load takes <rate>x<duration>, e.g. 20x30s`

**Cause.** Usage errors, printed without a stack, exit 2. **Fix.** As the message says.

### `no noise status at <file>: run harness run --mode noise first (or harness local nightly)`

**Cause.** `noise record` was given a directory or file with no `noise-status.json`. **Fix.** Point `--status` at the noise run's directory.

### A flag that does not exist prints a stack trace

**Cause.** An unknown flag is rejected by the argument parser, which is the one usage error that still prints a stack (`TypeError [ERR_PARSE_ARGS_UNKNOWN_OPTION]`). **Fix.** Read the first line and check the flag against [chapter 7](07-reference.md#flags). Claims and rules problems, by contrast, are clean multi-line messages.

### `cannot judge` and no output directory

**Not a problem.** A run that exits 2 before it has images to judge (not present, not verified) leaves no `out/<time>-<mode>/` behind. The reason is printed after `cannot judge:`.

### The post-deploy workflow failed but no rollback issue was opened

**Cause.** The harness exited 2 ("could not judge": an unusable input, an image that cannot be trusted, a run that stopped before a verdict). The workflow fails so it is seen and says so in the job summary, but a rollback issue is opened only for exit 1, a difference between production and the recorded candidate. **Fix.** Read the step log for the reason and correct it.

