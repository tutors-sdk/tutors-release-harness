# 07 Reference

Complete tables. Stable means covered by the compatibility promise in [`docs/contract.md`](../contract.md) (a change to it needs a major or minor contract bump as described there); non-stable may change in a minor release. The machine-readable source is [`docs/contract/cli.json`](../contract/cli.json), and `tests/contract.test.ts` fails when it and `src/cli.ts` disagree.

- [Commands](#commands)
- [Flags](#flags)
- [Image specs](#image-specs)
- [Environment variables](#environment-variables)
- [Exit codes](#exit-codes)
- [Files and directories](#files-and-directories)
- [Artefacts](#artefacts)
- [Contract version compatibility](#contract-version-compatibility)

Invoke as `pnpm harness <command>` from a checkout (Node 22 or newer, `pnpm install`, and for capturing modes `pnpm exec playwright install chromium` and Docker). Flags are parsed globally: a flag is accepted after any command, and an unknown flag, or one missing its value, stops with `harness: Unknown option '--x'.` and a pointer to `harness help <command>` (exit 2, no stack trace). `pnpm harness --help`, `-h` and `help` print the usage and exit 0; `pnpm harness <command> --help` (or `pnpm harness help <command>`) prints that command's part of it. A bare `pnpm harness` prints the usage and exits 2.

## Commands

| Command | Stable | Since | What it does |
| --- | --- | --- | --- |
| `harness run --mode <mode> --a <ref> --b <ref>` | yes | | Start both stacks, capture, compare, claim, gate, report. Writes `out/<UTC timestamp>-<mode>/`. |
| `harness compare --dir <run dir> --mode <mode>` | yes | | Re-run normalise, compare, claim and gate on captures already on disk; rewrites the reports in place. No Docker. |
| `harness images ensure --a <ref> --b <ref>` | yes | | Per image: use it if local, else pull it and verify its cosign signature by digest, else (bare tag) build it from the monorepo ref. |
| `harness mutants --base <ref>` | yes | | Build every mutant from the base reader image and prove the harness catches each. |
| `harness version [--json]` | yes | | Harness version, git sha and contract version (they differ: this checkout is harness 1.4.1 on contract 1.4.0). |
| `harness doctor` | yes | 1.3.0 | What this machine lacks to run the harness, and how to install it. Read-only. |
| `harness noise record` | yes | 1.3.0 | Append tonight's A/A to the noise store; keep the ratchet. |
| `harness noise status` | yes | 1.3.0 | Does the latest status license a FAIL? |
| `harness noise history` | **no** | 1.3.0 | The ratchet, the clean streak and the last nights. |
| `harness guard masks\|engine\|all --base <ref>` | yes | 1.3.0 | The CI guards against a local ref. |
| `harness override list` | **no** | 1.3.0 | The local, append-only record of overridden FAILs. |
| `harness local nightly\|gate\|mutants\|watch\|smoke` | **no** | 1.3.0 (`smoke` 1.4.0) | One command per maintainer task, planned from the same commands the workflows run; `--dry-run` prints the plan. `smoke` is the two-stacks smoke `ci.yml` runs (`pnpm smoke`). |
| `harness vuln-db update\|status` | **no** | 1.4.0 | The pinned vulnerability database: `update` fetches it into `HARNESS_VULN_DB_DIR`, else `<HARNESS_HOME>/vuln-db`; `status` says which database a scan would read, its build time, age and checksum. |
| `harness prune` | **no** | 1.4.0 | Free `out/` and the image cache. A dry run unless `--yes`. |
| `harness help [command]`, `--help`, `-h` | yes | | The usage; exit 0. |
| `harness stack up\|down --a <ref> --b <ref>` | **no** | | Start or stop both compose stacks. |
| `harness kind up\|down\|rollout --a <ref> --b <ref>` | **no** | | The kind substrate. `down` deletes the namespaces; the cluster stays. |
| `harness journeys` | **no** | | List the journeys: name, set, anonymous or signed-in. |

### `harness run`

`--mode` is required (`noise`, `release`, `any-two`, `upgrade`, `migration`, `post-deploy`). `--a` and `--b` are required except in post-deploy mode.

| Group | Flags |
| --- | --- |
| images | `--a`, `--b`, `--image-prefix`, `--a-digests`, `--b-digests`, `--allow-unsigned`, `--require-verified` |
| judging | `--claims`, `--rules`, `--noise`, `--claim-max-hunks`, `--noise-max-age-days`, `--override-reason`, `--override-by`, `--masks` |
| traffic | `--runs`, `--set`, `--journey` (repeatable), `--load`, `--now` |
| output and control | `--out`, `--substrate`, `--no-screenshots`, `--no-axe`, `--no-focus`, `--no-runtime`, `--startup-restarts`, `--keep`, `--no-stack` |
| post-deploy | `--recorded`, `--production`, `--deployed`, `--deployed-digests`, `--release-record` |
| migration | `--snapshot` |
| upgrade | `--upgrade-seconds`, `--upgrade-rate` |

The last lines are `verdict: <VERDICT>`, the reasons, and `report: <path to report.html>`. If a FAIL was overridden, `override recorded: #<n> in <HARNESS_HOME>/overrides.jsonl` follows.

### `harness compare`

`--dir` and `--mode` are required. Stable: `--claims`, `--rules`, `--noise`. It also honours `--masks`, `--noise-max-age-days`, `--claim-max-hunks`, `--require-verified`, `--override-reason` and `--override-by`, `--now`, `--runs` and `--substrate`, which set the corresponding fields of the rewritten report.

### `harness images ensure`

`--a`, `--b` (required), `--a-digests`, `--b-digests`, `--ref-a`, `--ref-b`, `--image-prefix`, `--allow-unsigned`, `--image-cache`. Exit `0` every image may be judged, `1` an image could not be obtained, `2` an image may not be judged (2 wins when both happen). With `GITHUB_OUTPUT` set it writes `image_cache=none|used|refreshed`.

### `harness mutants`

`--base` (required), `--out`, `--image-prefix`, `--allow-unsigned`. The run options such as `--runs` also apply; each mutant runs `max(--runs, its own runs)` times.

### `harness doctor`

`--for <nightly,gate,mutants,watch,kind>` (comma separated; default `nightly,gate,mutants,watch`), `--json`, `--port-offset <n>` (non-stable). `--json` prints `{ ok, scopes, platform, checks: [{ id, title, status: ok|warn|fail, detail }] }`; a check id may be added in a minor release. Exit `0` ready (warnings allowed), `1` a needed tool is missing, `2` usage (an unknown scope).

### `harness noise`

| Subcommand | Flags | Exit |
| --- | --- | --- |
| `record` | `--status <noise run dir\|noise-status.json>` (required), `--report`, `--tag`, `--store`, `--run-url`, `--summary`, `--masks` (non-stable) | `0`; `1` ratchet broken (files still written); `2` usage or no status |
| `status` | `--store`, `--require`, `--json`, `--noise-max-age-days` (non-stable, default 7) | `0`; `1` with `--require` when the status does not license a FAIL. With `GITHUB_OUTPUT` set and a usable status it writes `noise_file=<path>` |
| `history` | `--store`, `--last <n>` (default 14), `--json` | `0` |

### `harness guard`

`masks`, `engine` or `all`, with `--base <ref>` (else `HARNESS_BASE_REF`, else `origin/main`, else `main`). Compares `<base>...HEAD`. Exit `0`, `1` a violation, `2` when the ref does not exist or shares no history with `HEAD`.

### `harness vuln-db`

`update` runs `grype db update` into one directory (`HARNESS_VULN_DB_DIR`, else `<HARNESS_HOME>/vuln-db`) and then checks it: exit 0 when the database is usable, 1 when grype is missing, the fetch failed or the result is unusable. `status [--json]` exit 0 when a scan can use it; when it cannot, 1 if the vulnerability artefact is required (`HARNESS_REQUIRE_ARTEFACTS` naming `vulns`, `static` or `all`, or `HARNESS_REQUIRE_STATIC=1`) and 0 otherwise. `--json` prints `{ usable, dir, limitDays, detail, ... }`.

### `harness prune`

`--out <dir>` (default `./out`), `--older-than-days <n>` (default 14), `--keep-last <n>` (default 5), `--image-cache <dir>` (default `<HARNESS_HOME>/image-cache`), `--image-cache-days <n>` (default 30), `--yes` (delete; otherwise a dry run, and `--dry-run` wins over `--yes`), `--json`. Never removes state under `HARNESS_HOME`, the newest release run that did not FAIL, or anything from the last six hours. Exit 0, 1 when something could not be removed (in use), 2 usage or while a `harness local` task or watch holds its lock.

### `harness override list`

`--since <ISO date>`, `--json` (`{ file, count, chainIntact, problems, entries }`). Reads `<HARNESS_HOME>/overrides.jsonl`; a broken hash chain prints a warning per problem.

### `harness local`

| Task | Flags |
| --- | --- |
| `nightly` | `--tag`, `--runs` (default 5), `--load`, `--image-cache`, `--store`, `--no-record`, `--dry-run`, `--port-offset` |
| `gate` | `--a`, `--b` (required), `--a-digests`, `--b-digests`, `--claims`, `--rules`, `--runs` (default 5), `--only release\|migration\|upgrade`, `--migrations-a`, `--migrations-b`, `--override-reason`, `--override-by`, `--dry-run`, `--port-offset` |
| `mutants` | `--base`, `--dry-run`, `--port-offset` |
| `smoke` | `--tag`, `--only stacks\|migration`, `--dry-run`, `--port-offset` |
| `watch` | `--recorded`, `--production`, `--deployed`, `--deployed-digests`, `--release-record`, `--interval` (default `15m`, at least `10s`), `--once`, `--dry-run`, `--port-offset` |

A run holds a lock (`locks/run.lock`; the watch holds `locks/watch.lock`): one per machine at a time. The exit code is the worst of the steps.

### `harness stack` and `harness kind`

`--a` and `--b` are required (except `kind down`). `stack up` starts every profile including the upgrade edge. `kind rollout` also takes `--upgrade-seconds` and `--upgrade-rate`. `kind` refuses a cluster called `tutors-harness` before doing anything.

## Flags

Every flag, alphabetically. Types: strings unless noted. "Stable" is from `cli.json`.

| Flag | Stable | Since | Meaning |
| --- | --- | --- | --- |
| `--a`, `--b` | yes | | The two sides: an image spec ([below](#image-specs)); in migration mode a monorepo git ref or `dir:<path>`; in `local gate` the production and candidate tags |
| `--a-digests`, `--b-digests` | yes | 1.3.0 | Pin a side's images by digest: a JSON object or `reader=sha256:...,catalogue=sha256:...`. Pulled and verified by digest; refused (exit 2) when the tag has moved; a pinned image is never built |
| `--allow-unsigned` (boolean) | yes | 1.1.0 | Judge registry images whose cosign signature could not be verified. Local work only; the report records it. Same as `HARNESS_ALLOW_UNSIGNED=1` |
| `--axe`, `--focus`, `--screenshots`, `--runtime` (boolean, negated as `--no-...`) | no | `--runtime` 1.2.0 | Collectors that are on by default. `--no-runtime` skips container posture |
| `--base` | yes | | `harness mutants`: the base tag or reader image. `harness guard`: the ref to compare with |
| `--claim-max-hunks` | no | 1.2.0 | Flag a claim covering more failing hunks than this (default 10, or `HARNESS_CLAIM_MAX_HUNKS`); reported, never gates |
| `--claims` | yes | | The release's `claims.yaml` |
| `--deployed` | yes | 1.3.0 | Post-deploy mode: the tag that was deployed; names the release record |
| `--deployed-digests` | yes | 1.3.0 | Post-deploy mode: the digests that run |
| `--dir` | yes | | `harness compare`: the run directory containing `a/` and `b/` |
| `--dry-run` (boolean) | no | 1.3.0 | `harness local`: print the plan, start nothing |
| `--for` | yes | 1.3.0 | `harness doctor`: `nightly`, `gate`, `mutants`, `watch`, `kind`, comma separated |
| `--help`, `-h` (boolean) | yes | | Print the usage after a command; exit 0 |
| `--image-cache` | yes | 1.2.0 | `images ensure`, `local nightly`: a directory kept between runs; used, as provenance `cached`, only when the registry cannot be reached |
| `--image-prefix` | yes | | Where bare tags live: a prefix (`tutors`) or a template with `{app}` |
| `--interval` | no | 1.3.0 | `local watch`: `<n>s`, `<n>m` or `<n>h` |
| `--journey` (repeatable) | yes | | Run only this journey |
| `--json` (boolean) | yes | | `version`, `doctor`, `noise status`, `noise history`, `override list`, `prune`, `vuln-db status`: print data |
| `--keep` (boolean) | no | | Leave the stack running afterwards (`pnpm stack:down` stops it) |
| `--last` | no | 1.3.0 | `noise history`: how many nights to show |
| `--load` | yes | | k6 after the journeys on each side: `<rate>x<duration>`, e.g. `20x30s` (the duration is `<n>s`, `<n>m` or `<n>h`) |
| `--masks` | no | | An alternative `masks.yaml` (for trying a mask on captures) |
| `--migrations-a`, `--migrations-b` | no | 1.3.0 | `local gate`: monorepo git refs for the migration rehearsal (default `v<a>`, `v<b>`) |
| `--mode` | yes | | `noise`, `release`, `any-two`, `upgrade`, `migration`, `post-deploy` |
| `--noise` | yes | | A noise status file or the directory that holds it; `skip` waives the requirement (logged, recorded); `none` does not look. Omitted in release and post-deploy mode: the latest status in the local store |
| `--noise-max-age-days` | no | | Days after which a status is too old (default 7) |
| `--no-stack` (`--stack`, boolean) | no | | Do not start or stop the stack; assume it is up |
| `--now` | no | | The frozen clock, an ISO instant (default `HARNESS_NOW`, else `2026-09-16T09:05:00.000Z`) |
| `--once` (boolean) | no | 1.3.0 | `local watch`: one comparison and exit |
| `--older-than-days`, `--keep-last`, `--image-cache-days` | no | 1.4.0 | `prune`: age, newest-per-mode and image-cache thresholds (14, 5, 30) |
| `--only` | no | 1.3.0 | `local gate`: `release`, `migration` or `upgrade`; `local smoke`: `stacks` or `migration` |
| `--out` | yes | | Output root (default `./out`); `prune` uses it as the directory to clean |
| `--override-by` | yes | 1.2.0 | Who accepted the FAIL: a person, not a bot |
| `--override-reason` | yes | 1.2.0 | Accept a FAIL and say why: 20 or more characters, not a rubber stamp. Both override flags are required together |
| `--port-offset` | no | 1.3.0 | `local` and `doctor`: move the compose stack's host ports by this many. A variable you set yourself wins |
| `--production` | yes | | Post-deploy: `reader=URL,catalogue=URL,live=URL` (and optionally `time=URL`) |
| `--recorded` | yes | | Post-deploy: the release run directory whose `b/capture.json` is the recorded side |
| `--record` (`--no-record`, boolean) | no | 1.3.0 | `local nightly`: record the night (default on) |
| `--ref-a`, `--ref-b` | yes | | `images ensure`: monorepo git refs to build from when a pull fails |
| `--release-record` | yes | 1.3.0 | Post-deploy: a release record file, or a directory holding `<tag>.json` (default `<HARNESS_HOME>/releases`) |
| `--report` | yes | 1.3.0 | `noise record`: the `report.json` of the run (default: beside the status) |
| `--require` (boolean) | yes | 1.3.0 | `noise status`: exit 1 when the status does not license a FAIL |
| `--require-verified` (boolean) | yes | 1.2.0 | Noise mode: write the status `degraded` unless every image on both sides was pulled and verified in this run |
| `--rules` | yes | 1.3.0 | `rules.json`, a path or a URL fetched without credentials: the Rules a claim may name |
| `--run-url` | yes | 1.3.0 | `noise record`: the run's URL, kept in the history |
| `--runs` | yes | | Journey repetitions per side (default 1). Timing needs four or more to be able to reach significance; five is recommended |
| `--set` | yes | | Journey sets, comma separated: `fixture`, `auth`, `reference` (default all three) |
| `--since` | no | 1.3.0 | `override list`: only overrides at or after this date |
| `--snapshot` | no | | Migration mode: a `pg_dump` file to restore first |
| `--startup-restarts` | no | 1.2.0 | Restarts per app for the startup artefact (default 5; 0 switches it off) |
| `--status` | yes | 1.3.0 | `noise record`: a noise run directory or `noise-status.json` |
| `--store` | yes | 1.3.0 | `noise ...`, `local nightly`: the noise store directory (default `<HARNESS_HOME>/noise`) |
| `--substrate` | no | | `compose` (default) or `kind` |
| `--summary` | yes | 1.3.0 | `noise record`: a file the summary is appended to |
| `--tag` | yes | 1.3.0 | `noise record`, `local nightly`: the production tag |
| `--yes` (boolean) | no | 1.4.0 | `prune`: delete (the default is a dry run) |
| `--upgrade-rate`, `--upgrade-seconds` | no | | Upgrade mode: requests per second (default 20) and seconds (default 45) |

## Image specs

What `--a`, `--b` and `--base` accept outside migration mode:

| Form | Meaning |
| --- | --- |
| `<tag>` | one image per app through the image prefix, e.g. `16.2.0` |
| `<repo>:<tag>[@sha256:<64 hex>]` | that app's image; the other apps take the prefix and the same tag |
| `reader=<ref>,catalogue=<ref>,live=<ref>[,time=<ref>]` | every image spelled out; each `<ref>` is `<repo>[:<tag>][@sha256:<64 hex>]`. `time` is optional and takes the reader's tag when left out |

Refused (exit 2): `<tag>@sha256:...` (a digest names one image, and there are several apps), and `<repo>@sha256:...` on its own (no tag for the other apps to take). In migration mode `--a` and `--b` are monorepo git refs (`v16.2.0`, `release/16.3.0`, a sha) or `dir:<path>` to a directory of `.sql` files.

The image prefix is `--image-prefix`, else `HARNESS_IMAGE_PREFIX`, else `tutors`. It is either a bare prefix (`tutors` gives `tutors/<app>:<tag>`) or a template containing `{app}` (`quay.io/tutors-sdk/tutors-{app}` gives `quay.io/tutors-sdk/tutors-reader:<tag>`). `<app>` is `reader`, `catalogue`, `live` or `time`.

## Environment variables

**In the contract** (stable):

| Variable | Default | Meaning |
| --- | --- | --- |
| `HARNESS_IMAGE_PREFIX` | `tutors` (`quay.io/tutors-sdk/tutors-{app}` in the workflows and the `local` wrappers) | prefix or `{app}` template for bare tags; `--image-prefix` overrides |
| `HARNESS_COSIGN_IDENTITY` | `^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@` | regular expression the signing certificate's identity must match; empty means the default |
| `HARNESS_COSIGN_ISSUER` | `https://token.actions.githubusercontent.com` | the certificate's OIDC issuer; empty means the default |
| `HARNESS_ALLOW_UNSIGNED` | unset | `1`, `true` or `yes`: the same as `--allow-unsigned` |
| `HARNESS_HOME` | `<checkout>/.harness` | where the harness keeps what outlives a run: `noise/`, `releases/`, `overrides.jsonl`, `image-cache/`, `rollbacks/`, `locks/` |
| `HARNESS_PROJECT` | `tutors-harness-<8 hex>` | this checkout's compose project and kind cluster, when the next two do not say. Derived from the SHA-256 of the checkout's real path (lowercased on Windows) |
| `HARNESS_COMPOSE_PROJECT` | derived | the compose project; wins over `HARNESS_PROJECT` |
| `HARNESS_KIND_CLUSTER` | derived | the kind cluster; wins over `HARNESS_PROJECT`. `tutors-harness` is refused |
| `HARNESS_CLAIM_MAX_HUNKS` | `10` | a positive integer, else the default; `--claim-max-hunks` overrides |
| `HARNESS_SBOM_SOURCE` | `auto` | `auto` or `attestation` (the cosign SPDX attestation of a pulled image) or `generate` (a local generator, on both sides) |
| `HARNESS_SBOM_CMD` | `syft docker:{image} -o spdx-json`; on a Windows host the same syft in its `anchore/syft` container over the Docker socket | the generator for `generate`; `{image}` is the image reference. Split on whitespace and quotes; no shell |
| `HARNESS_VULN_CMD` | `grype sbom:{sbom} -o json` | the scanner; `{sbom}` is the path of the SPDX SBOM; must print grype or trivy JSON. For trivy: `trivy sbom --format json {sbom}` |
| `HARNESS_VULN_DB_DIR` | unset | a pre-fetched scanner database directory. Database updates are always switched off, so a scan uses exactly this database. Unset means `<HARNESS_HOME>/vuln-db` when `harness vuln-db update` has made it, else the scanner's own cache |
| `HARNESS_VULN_DB_MAX_AGE_DAYS` | `5` | how old (days since built) the vulnerability database may be: `harness doctor` warns beyond it, and it is passed to grype as its own limit |
| `HARNESS_REQUIRE_ARTEFACTS` | unset | comma separated artefacts (`image-manifest`, `sbom`, `vulns`, `runtime`, `startup`, `bus`), or `static`, or `all`, whose `NOT COLLECTED` gap is a failing hunk. It only adds to what is already required (`runtime`, `startup`); an unknown name is exit 2 |
| `HARNESS_ROLLBACK_ISSUE` | unset | post-deploy wording only: `1`, `true`, `yes` says a CI step opens a rollback issue; `0`, `false`, `no` says none does (`decide whether to roll back`). Unset: GitHub Actions has the step, anything else does not |
| `HARNESS_REQUIRE_STATIC` | unset | `1`, `true` or `yes`: the alias for `HARNESS_REQUIRE_ARTEFACTS=static`; the two add up |

**Not in the contract** (may change in a minor release):

| Variable | Default | Meaning |
| --- | --- | --- |
| `HARNESS_NOW` | `2026-09-16T09:05:00.000Z` | the frozen clock; `--now` overrides. Given to the browser and every container |
| `HARNESS_PRODUCTION_TAG` | `main` | `local nightly`, `local mutants`: the production tag when `--tag` and `--base` are not given |
| `HARNESS_PRODUCTION_URLS` | the three production URLs | `local watch`: the URLs when `--production` is not given |
| `HARNESS_BASH` | `bash` | the bash that runs `scripts/build-images.sh` and `scripts/fetch-migrations.sh` (set it to Git Bash's on Windows when `bash` is WSL's) |
| `HARNESS_BASE_REF` | unset | `harness guard`: the base when `--base` is not given |
| `HARNESS_K6_IMAGE` | `grafana/k6:latest` | the k6 image; pin it, because `latest` floats |
| `HARNESS_POSTGRES_IMAGE` | `postgres:16-alpine` | the throwaway Postgres of the migration rehearsal |
| `HARNESS_MUTANT_ALT_BASE` | `ubuntu:24.04` | the base the `base-swap` mutant swaps onto |
| `HARNESS_PROVENANCE_FILE` | `<HARNESS_HOME>/image-provenance.json` | the ledger `images ensure` leaves for `run` |
| `HARNESS_GIT_SHA` | `git rev-parse HEAD` | the git sha stamped in reports, for a tarball with no git |
| `HARNESS_BUS` | unset | `<transport>:<address>` to collect bus traffic; see [`docs/bus.md`](../bus.md) |
| `HARNESS_PERSISTENCE_BACKEND` | the Supabase-REST stub | the persistence recorder backend |
| `COURSE_ID`, `COURSE_PORT`, `IDENTITY_PORT`, `EDGE_PORT`, `PERSISTENCE_PORT_A\|B`, `READER_PORT_A\|B`, `CATALOGUE_PORT_A\|B`, `LIVE_PORT_A\|B`, `READER_AUTH_PORT_A\|B`, `TIME_PORT_A\|B` | see [chapter 2](02-running-locally.md#running-beside-your-own-stack) | the compose stack's host ports and the course id |
| `TUTORS_REPO` | `https://github.com/tutors-sdk/tutors-mono-repo.git` | the repository `scripts/build-images.sh` and `scripts/fetch-migrations.sh` clone |
| `GITHUB_OUTPUT` | set by GitHub | `images ensure` writes `image_cache=`, `noise status` writes `noise_file=`, the guards write their booleans |
| `DOCKER_HOST`, `TZ` | | read by `harness doctor` |

The harness starts `docker`, `git` and the scripts with `MSYS_NO_PATHCONV=1`, so `/paths` reach them untouched under Git Bash.

The workflows also set the two contract variables `HARNESS_IMAGE_PREFIX` and `HARNESS_COSIGN_IDENTITY` from repository variables, and `ci.yml` pins `HARNESS_COMPOSE_PROJECT=tutors-harness` (one checkout per runner).

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | verdict pass or warn, or a fail overridden with `--override-reason`; or the command succeeded |
| `1` | verdict fail that was not overridden; or `images ensure` could not obtain an image; or `mutants` or `kind rollout` did not succeed; or `doctor` found a tool a run needs missing; or `noise record` found the ratchet broken; or `noise status --require` found a status that does not license a FAIL; or `guard` found a violation |
| `2` | usage error; the harness itself failed (an uncaught error); or an image may not be judged. No verdict was reached |

By command:

| Command | 0 | 1 | 2 |
| --- | --- | --- | --- |
| `run`, `compare` | pass, warn, or an overridden fail | fail, not overridden | usage; invalid claims or rules (a clean multi-line message, no stack trace); a bad digest; an image may not be judged (`cannot judge:` on stderr, and no output directory is left behind); an invalid override; any harness error |
| `images ensure` | every image may be judged | an image could not be obtained | an image may not be judged (`ERROR:` in the output); 2 wins over 1 |
| `mutants` | all ten caught and attributed | a mutant escaped, or the A/A was not clean | usage |
| `prune` | done (or a dry run) | something could not be removed (in use) | usage; a run or watch holds the lock |
| `vuln-db update` | fetched and usable | grype missing, the fetch failed, or the result is unusable | |
| `vuln-db status` | usable, or unusable but not required | unusable and the vulnerability artefact is required | |
| `kind rollout` | the rollout completed without failed requests | it did not | usage |
| `doctor` | ready (warnings allowed) | a needed tool is missing | an unknown `--for` scope |
| `noise record` | recorded | the ratchet is broken (files still written) | usage, or no status |
| `noise status` | always, unless `--require` | `--require` and the status does not license a FAIL | usage |
| `guard` | no violation | a violation | the ref does not exist or has no common ancestor with `HEAD` |
| `local gate`, `nightly`, `mutants` | every step ok | the worst step failed | usage; another harness run holds the lock |
| `local watch` | (loop: never exits on a difference); `--once`: the comparison passed, or the previous watch was still running | `--once`: production differs | usage; the lock is held (without `--once`) |
| `version`, `journeys`, `override list`, `noise history` | success | | usage |

`warn` exits `0` on purpose. `harness` with no command prints the usage and exits `2`; `--help`, `-h` and `help` print it and exit `0`. On exit `2` there may be no `report.json`.

## Files and directories

| Path | Written by | What |
| --- | --- | --- |
| `out/<UTC timestamp>-<mode>/report.json` | every mode | the machine-readable report ([`report.schema.json`](../contract/report.schema.json)) |
| `out/.../report.md` | every mode | the pull-request comment |
| `out/.../report.html` | every mode | the self-contained report |
| `out/.../noise-status.json` | `noise` mode | `{ schemaVersion, ranAt, clean, hunks, degraded? }` ([schema](../contract/noise-status.schema.json)) |
| `out/.../release-record.json` | `release` mode | what was judged ([schema](../contract/release-record.schema.json)) |
| `out/.../a/capture.json`, `b/capture.json`, screenshots, `a/load/`, `b/load/` | capturing modes | not contract; read back by `compare` and `--recorded` |
| `out/.../diff/` | the screenshot engine | difference images |
| `out/<UTC timestamp>-gate/gate.md`, `gate.json` | `local gate` | the three "pull-request comments" and the verdicts in one place |
| `<HARNESS_HOME>/noise/noise-status.json`, `noise-history.json`, `noise-summary.md` | `noise record` | the local noise store |
| `<HARNESS_HOME>/releases/<candidate>.json`, `<release>.json` | release mode | release records |
| `<HARNESS_HOME>/overrides.jsonl` | any run with an applied override | append-only, hash-chained |
| `<HARNESS_HOME>/rollbacks/<time>-rollback.md` | a failing `local watch` | what a `rollback` issue would have said |
| `<HARNESS_HOME>/image-cache/images.tar`, `manifest.json` | `images ensure --image-cache` | the last verified production images |
| `<HARNESS_HOME>/locks/run.lock`, `watch.lock` | `local` | one heavy run, one watch |
| `<HARNESS_HOME>/image-provenance.json` | `images ensure` | the ledger `run` reads |
| `<HARNESS_HOME>/vuln-db/` | `harness vuln-db update` | the pinned vulnerability database (about 2.1 GB) |
| `normalise/masks.yaml` | people | the masks and thresholds |
| `mutants/mutants.yaml` | people | the ten mutants and what each must be attributed to |
| `claims/example.claims.yaml` | people | an example claims file (real ones live in the monorepo) |
| `compose.harness.yaml`, `deploy/kind/` | people | the two stacks; the kind substrate |
| `docs/contract/*.json`, `docs/contract.md` | people | the contract |

## Artefacts

Nineteen. Scopes and meanings are in [chapter 1](01-concepts.md#artefacts) and [chapter 4](04-writing-claims.md#finding-the-scope).

| Artefact | Since | Compared from |
| --- | --- | --- |
| `dom` | | Playwright accessibility snapshot, per page |
| `screenshot` | | 1280 by 800 PNG, per page |
| `network` | | requests and response shapes, per page |
| `console` | | console errors and warnings, per page |
| `headers` | | document response headers, per page |
| `axe` | | WCAG 2.1 A and AA violations, per page |
| `focus` | | Tab order, per page |
| `timing` | | TTFB, journey duration, k6 load |
| `metrics` | | `/metrics` before and after |
| `logs` | | container logs, shape and volume |
| `persistence` | | writes to the persistence stub, per journey |
| `bus` | 1.2.0 | topics published, per journey (only with a bus) |
| `migration` | | schema before and after the candidate's migrations |
| `upgrade` | | k6 through the edge during a rollout |
| `image-manifest` | 1.2.0 | `docker image inspect` |
| `sbom` | 1.2.0 | the SPDX SBOM |
| `vulns` | 1.2.0 | the SBOM, scanned |
| `runtime` | 1.2.0 | container posture, declared and measured |
| `startup` | 1.2.0 | time to healthy over restarts |

A consumer of `report.json` must tolerate an artefact name it does not know. A `NOT COLLECTED` gap has one shape for every artefact (`NOT COLLECTED: <what> of <app> on side <a|b>: <reason>`, hunk scope `<app>/not-collected` or `<artefact>/not-collected`).

Provenance values, likewise: `local`, `pulled+verified`, `pulled-unverified`, `built-from-ref`, `cached` (since 1.2.0). Verdicts: `pass`, `warn`, `fail`. Severities: `fail`, `info`. Modes: `noise`, `release`, `any-two`, `upgrade`, `migration`, `post-deploy`. Substrates: `compose`, `kind`.

## Contract version compatibility

Three numbers, stamped where a reader can see them:

| Number | Defined in | Shown in |
| --- | --- | --- |
| harness version | `version` in `package.json` | `harness.version` in every `report.json` and `capture.json`; report footers; `harness version`; the git tag `v<version>` |
| contract version | `CONTRACT_VERSION` in `src/version.ts` | `harness.contractVersion`; the first line of `docs/contract.md`; `cli.json`, `workflows.json` |
| `schemaVersion` | the contract's major version | top level of `report.json`, `noise-status.json` and the release record |

```console
$ pnpm harness version
harness 1.4.1 (9513b145e26c871a9b1785fb7a2f752f258407aa) · contract 1.4.0
$ pnpm harness version --json
{"version":"1.4.1","gitSha":"9513b145e26c871a9b1785fb7a2f752f258407aa","contractVersion":"1.4.0"}
```

`gitSha` is `git rev-parse HEAD` of the checkout, or `HARNESS_GIT_SHA` when set, or `null`.

What bumps what:

| Bump | When | Examples |
| --- | --- | --- |
| major (`schemaVersion` changes too) | a consumer written against the contract could break or be misled | removing or renaming a `report.json` field; changing an exit code's meaning or the verdicts a mode can return; changing the A/A rule's default; a valid claims file becoming invalid; removing or renaming a stable command, flag, payload field, variable or artifact; making an optional payload field required; the harness starting to write to pull requests |
| minor | additions a careful consumer survives | a new optional report field; a new artefact name; a new mode, command, stable flag, optional payload field, event type, variable with a default, or artifact; a new optional claims key; any change to non-stable commands and flags |
| patch | nothing above changes | the wording of reasons, summaries, `report.md`, `report.html`; documentation; fixes that make the code match the contract (for example `--help` exiting 0, a claims error without a stack trace) |

The harness version moves at least as far as the contract (this checkout is harness 1.4.1 on contract 1.4.0: 1.4.1 added masks for the CDN in front of production and changed nothing in the contract); a contract major is a harness major. Independently, the harness version must be bumped by any pull request that changes what the harness compares or gates on ([chapter 5](05-noise-and-self-test.md#an-engine-change-needs-a-version-bump-and-the-mutants)).

What each contract version added, for a consumer written against an earlier one:

| Version | Added |
| --- | --- |
| 1.0.0 | the contract: `report.json`, `noise-status.json`, the CLI, the dispatch, the claims file |
| 1.1.0 | Quay images by template, cosign verification by digest, `provenance` in every report, `--image-prefix` template, `--allow-unsigned`, the `HARNESS_COSIGN_*` variables |
| 1.2.0 | six artefacts (`bus`, `image-manifest`, `sbom`, `vulns`, `runtime`, `startup`); `claimHygiene`, `override`, `imageArtefacts`, `provenance: cached`, `noise.degraded`; `--image-cache`, `--require-verified`, `--override-*`; the `noise` branch; the SBOM and scanner variables |
| 1.4.0 | the pinned vulnerability database (`harness vuln-db`), one `NOT COLLECTED` convention and `HARNESS_REQUIRE_ARTEFACTS`, `harness prune`, `harness local smoke`, `--help` and clean exit 2 messages, canonical `content-type` and `cache-control`, symmetric origins and secret redaction for post-deploy, `HARNESS_ROLLBACK_ISSUE`, the `mutant-noise-report` artifact, the `release <candidate>` run title. No `report.json` field, exit code meaning, claims key or payload changes |
| 1.3.0 | digests in the dispatch (`--a-digests`, `--b-digests`), the release record and the deployment check (`--deployed`, `--deployed-digests`, `--release-record`, `report.json` `deployment`), `rule` claims and `--rules` (`rules_url`), the local noise store as the default source of `--noise`, the stable commands `doctor`, `noise record`, `noise status`, `guard`, and checkout-derived project and cluster names (`HARNESS_HOME`, `HARNESS_PROJECT`) |

A run against a dispatch without any 1.3.0 field behaves exactly as under 1.2.0. Four things are not purely additive: a `rule` key in a claim was ignored before and is now checked; a missing `--noise` no longer means "no status" on a machine that has a local noise store; the default name of the compose project and kind cluster changed; and a stack under the old name `tutors-harness` is left alone.

Reports are comparable only when their `harness.version` is the same: a new mask or engine can change the hunks for the same two images without any change to the contract. A report from before contract 1.0.0 lacks `schemaVersion`; refuse any value of `schemaVersion` you do not know.
