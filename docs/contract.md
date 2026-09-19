# The integration contract

Contract version: `1.0.0`

This is what `tutors-sdk/tutors-mono-repo` (or anything else) may build
against. Everything here is derived from the code, and
[`tests/contract.test.ts`](../tests/contract.test.ts) fails when the two
drift. What is not written here is not promised.

The machine-readable half lives in [`docs/contract/`](contract/):

| File | Describes |
| --- | --- |
| [`report.schema.json`](contract/report.schema.json) | `report.json` (JSON Schema, draft-07) |
| [`noise-status.schema.json`](contract/noise-status.schema.json) | `noise-status.json` |
| [`cli.json`](contract/cli.json) | every command and flag, which are stable, the exit codes |
| [`workflows.json`](contract/workflows.json) | dispatch events and payloads, repository variables, artifacts, permissions the workflows never hold |

## Versions

Three numbers, all stamped where a reader can see them:

| Number | Where it is defined | Where it shows up |
| --- | --- | --- |
| Harness version | `version` in `package.json` | `harness.version` in every `report.json` and `capture.json`; report footers; `harness version`; the git tag `v<version>` |
| Contract version | `CONTRACT_VERSION` in `src/version.ts` | `harness.contractVersion`; the first line of this file; `cli.json`, `workflows.json` |
| `schemaVersion` | the contract's major version | top level of `report.json` and `noise-status.json` |

```console
$ pnpm harness version
harness 1.0.0 (3f2c…) · contract 1.0.0
$ pnpm harness version --json
{"version":"1.0.0","gitSha":"3f2c…","contractVersion":"1.0.0"}
```

`gitSha` is `git rev-parse HEAD` of the harness checkout, or the
`HARNESS_GIT_SHA` environment variable when set, or `null` when neither is
available (a tarball).

Pin the harness by tag (`v1.0.0`) or by sha, and check `schemaVersion === 1`
before reading a report.

## Output directory

`harness run` writes `<--out, default ./out>/<UTC timestamp>-<mode>/`, e.g.
`out/2026-09-17T14-00-00-release/`:

| Path | Written by | Part of the contract |
| --- | --- | --- |
| `report.json` | every mode | yes — below |
| `report.md` | every mode | the file exists and is GitHub-flavoured Markdown starting with a `##` heading that carries the mode and the verdict; its wording and layout are for people and may change in a patch |
| `report.html` | every mode | the file exists and is self-contained (no scripts, no external requests); its content is for people |
| `noise-status.json` | `noise` mode only | yes — below |
| `a/capture.json`, `b/capture.json`, screenshots, `a/load/`, `b/load/` | capturing modes | no. The harness reads its own captures back (`harness compare`, `--recorded`); nobody else should. Each `capture.json` carries the same `harness` stamp as the report |

`harness compare --dir <run dir>` rewrites the three reports (and, in noise
mode, the status) in place.

## `report.json`

Schema: [`contract/report.schema.json`](contract/report.schema.json)
(`additionalProperties: false` throughout: a field not listed here is not
written). Source of truth: `RunReport` in `src/types.ts`.

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | `1` | major version of this contract; refuse a value you do not know |
| `harness` | `{ version, gitSha, contractVersion }` | which harness judged the run; `gitSha` is a string or `null` |
| `harnessVersion` | string | same as `harness.version`; kept for readers of pre-contract reports |
| `mode` | `noise` \| `release` \| `any-two` \| `upgrade` \| `migration` \| `post-deploy` | |
| `substrate` | `compose` \| `kind` | |
| `ranAt` | ISO 8601 UTC instant | when the comparison was judged (wall clock) |
| `now` | string | the frozen clock both sides were given (`--now` / `HARNESS_NOW`) |
| `runs` | integer ≥ 1 | journey repetitions per side |
| `sides` | `{ a, b }`, each `{ reader, catalogue, live }` | the image reference of each app on each side. In migration mode `reader` is `migrations:<ref>` and the others `-`; in post-deploy mode `a` is the recorded candidate's images and each of `b`'s is `external:<URL>` |
| `verdict` | `pass` \| `warn` \| `fail` | see [Verdicts and exit codes](#verdicts-and-exit-codes) |
| `reasons` | string[] | why, one line each. For people: **do not parse** |
| `noise` | noise status, optional | the status consulted for the gating decision; absent when `--noise` was not given or was `skip` |
| `compare.hunks` | Hunk[] | every difference, failing and informational |
| `compare.matches` | `{ hunk, claim? }[]` | one per hunk, with the claim that covers it, if any |
| `compare.unclaimed` | Hunk[] | failing hunks no claim covers — what gates |
| `compare.staleClaims` | Claim[] | claims that matched nothing; reported, never gate |
| `compare.broadUnapproved` | Claim[] | broad claims without `approvedBy`; gate in `release` and `post-deploy` |
| `masksApplied` | `{ [maskId]: integer }` | how often each mask in `normalise/masks.yaml` changed something, both sides summed; `0` is a silent mask |
| `migration` | optional | migration mode only: `{ a, b, rolledBack }`; `a`/`b` are `{ ref, files[], catalog }`, a catalog is `{ tables: { [table]: { [column]: { type, nullable, default } } }, indexes[], functions[], policies[] }` |
| `upgrade` | optional | upgrade mode only: `{ substrate, requests, failed, serverErrors, byUpstream: { [side]: { requests, failed, serverErrors, p95 } }, switchedAt, durationMs }`; times in ms |
| `load` | optional | when `--load` ran on both sides: `{ a, b }`, each `{ requests, failed, serverErrors, p50, p95, rate, duration }` |

**Hunk**: `{ id, artefact, scope, path?, summary, detail?, severity }`.
`artefact` is one of `dom`, `screenshot`, `network`, `console`, `headers`,
`axe`, `focus`, `metrics`, `logs`, `timing`, `persistence`, `migration`,
`upgrade`. `severity` is `fail` (gates unless claimed) or `info` (reported,
never gates). `scope` and `path` are what a claim's glob is matched against.
`id` is stable for the same difference within a run; do not rely on it across
harness versions. `summary` and `detail` are for people.

**Claim**: `{ artefact, scope, reason, approvedBy? }`, exactly as parsed from
the claims file.

What a consumer can rely on: `verdict`, `compare.unclaimed.length`,
`compare.broadUnapproved.length`, `compare.staleClaims`, the `artefact`,
`scope`, `path` and `severity` of each hunk, `sides`, `harness`, and the
numbers under `migration`, `upgrade` and `load`.

## Verdicts and exit codes

| Exit code | Meaning |
| --- | --- |
| `0` | Verdict pass or warn; or the command succeeded |
| `1` | Verdict fail; or images ensure, mutants or kind rollout did not succeed |
| `2` | Usage error, or the harness itself failed (an uncaught error); no verdict was reached |

`warn` exits `0` on purpose: a harness that has not earned the right to fail
must not block. A consumer that wants to treat `warn` differently reads
`verdict` from `report.json`. `harness` with no command prints usage and exits
`2`; `--help` after a command prints usage and exits `0`. On exit `2` there
may be no `report.json`.

Per mode, for `harness run` and `harness compare` (`src/gate.ts`):

| Mode | `pass` (0) | `warn` (0) | `fail` (1) |
| --- | --- | --- | --- |
| `noise` | no failing hunk | any failing hunk — the harness is advisory until this is fixed | never |
| `any-two` | always | never | never |
| `release` | no unclaimed hunk and no unapproved broad claim | the same findings as `fail`, but the A/A rule below is not met | unclaimed hunk(s) or unapproved broad claim(s), **and** the A/A rule is met |
| `post-deploy` | as `release` | as `release` | as `release`; the workflow then opens a rollback issue |
| `migration` | no unclaimed violation | never | any unclaimed expand/contract or rollback violation; needs no A/A |
| `upgrade` | no unclaimed finding | never | any unclaimed failed or 5xx request, or b never serving; needs no A/A |

Stale claims add a reason and never change the verdict. Claims apply in every
mode.

## `noise-status.json` and the 7-day rule

Schema: [`contract/noise-status.schema.json`](contract/noise-status.schema.json).
Written next to `report.json` by `noise` mode only:

```json
{ "schemaVersion": 1, "ranAt": "2026-09-16T02:17:31.412Z", "clean": true, "hunks": 0 }
```

| Field | Meaning |
| --- | --- |
| `schemaVersion` | `1`. Optional on read (files written before 1.0.0 lack it); any other value is refused |
| `ranAt` | the noise run's `report.json` `ranAt` |
| `clean` | `true` exactly when `hunks` is `0` |
| `hunks` | failing hunks the A/A produced |

`--noise <path>` takes the file, or a directory containing it (the noise run's
output directory). A file that is not exactly this shape stops the run with
exit `2` — it is never read generously.

**The A/A rule.** `release` and `post-deploy` may return `fail` only when one
of these holds:

- a status was supplied, `clean` is `true`, and `ranAt` is no more than 7 days
  before the judging run's `ranAt` (`--noise-max-age-days`, default 7, not a
  stable flag);
- `--noise skip` was given — an explicit waiver, logged to stdout. The report
  then has no `noise` field.

Otherwise the same findings come back as `warn`, exit `0`, and the first
reason starts `advisory only:` and says which condition failed. The
`nightly-noise.yml` workflow publishes the status as the `noise-status`
artifact with 8 days' retention, so a status older than the rule allows
disappears by itself.

Not checked: a `ranAt` in the future is trusted (its age is negative).

## Claims file

Claims format version: `1`

YAML, parsed by `ClaimsFileSchema` in `src/claims/schema.ts`; semantics in
[`claims/README.md`](../claims/README.md).

```yaml
version: 1            # optional; any other value is refused
claims:
  - artefact: headers                                   # an artefact name, or "*"
    scope: "reader:*/content-security-policy"           # picomatch glob, non-empty
    reason: "fix(reader): #270 CSP allows the new host" # ≥ 8 characters, not a rubber stamp
    approvedBy: "a-maintainer"                          # optional; required for a broad claim to count
```

- `artefact`: one of the thirteen artefact names above, or `*`.
- `scope`: matched with picomatch (`dot: true`, case-insensitive) against the
  hunk's `scope` **or** its `path`.
- `reason`: at least 8 characters, and must not start with `see pr`,
  `approved`, `all`, `ok` or `misc`.
- A claim is *broad* when `artefact` is `*` or `scope` is `*`, `**` or a
  pattern of only stars (`*/*`, `**/**`). A broad claim without `approvedBy`
  is listed in `compare.broadUnapproved` and gates.
- Unknown keys are ignored. An empty file is no claims. An invalid file stops
  the run with exit `2`.
- Each failing hunk is assigned to at most one claim; `info` hunks need none.

The claims file lives with the release (the monorepo's `release/claims.yaml`),
never in this repository.

## CLI

Full list: [`contract/cli.json`](contract/cli.json). Invoke as `pnpm harness
<command>` from a checkout (Node ≥ 22, `pnpm install`, and for capturing modes
`pnpm exec playwright install chromium` and Docker). Commands and flags marked
`stable: true` there are the ones below; the rest (`harness stack`, `harness
kind`, `harness journeys`, `--substrate`, `--now`, `--masks`, `--snapshot`,
`--upgrade-*`, `--noise-max-age-days`, `--no-screenshots`, `--no-axe`,
`--no-focus`, `--keep`, `--no-stack`) are for people at a terminal and may
change in a minor release.

| Command | Stable flags |
| --- | --- |
| `harness run` | `--mode` (required), `--a`, `--b` (required except in post-deploy), `--claims <file>`, `--noise <file\|dir\|skip>`, `--runs <n>`, `--set <fixture,auth,reference>`, `--journey <name>` (repeatable), `--load <rate>x<duration>`, `--out <dir>`, `--image-prefix <registry/namespace>`; post-deploy: `--recorded <release run dir>`, `--production reader=URL,catalogue=URL,live=URL` |
| `harness compare` | `--dir <run dir>` (required), `--mode` (required), `--claims`, `--noise` |
| `harness images ensure` | `--a`, `--b` (required), `--ref-a`, `--ref-b` (monorepo git refs to build from when the pull fails), `--image-prefix` |
| `harness mutants` | `--base <tag or reader image>` (required), `--out` |
| `harness version` | `--json` |
| any | `--help` |

`--a` / `--b` take a bare tag (`16.2.0`, resolved as
`<image prefix>/<app>:<tag>`), one reader image reference, or
`reader=…,catalogue=…,live=…`; in migration mode a monorepo git ref or
`dir:<path>`. The image prefix is `--image-prefix`, else the
`HARNESS_IMAGE_PREFIX` environment variable, else `tutors`
([images.md](images.md)).

Stdout is for people, except `harness version --json`. The last lines of
`run` and `compare` are `verdict: <VERDICT>`, the reasons, and
`report: <path to report.html>`; read `report.json` instead of parsing them.

## Workflows: what the harness accepts

Full list: [`contract/workflows.json`](contract/workflows.json).

### `repository_dispatch`

Send with a token that has `contents: write` on this repository (a
fine-grained PAT, or a GitHub App installation token); sample sender:
[`monorepo/release-dispatch.yml`](monorepo/release-dispatch.yml).

| `event_type` | Workflow | `client_payload` |
| --- | --- | --- |
| `release-candidate` | `release.yml` — release mode (3 runs, k6 `20x30s`), migration rehearsal, upgrade rehearsal, as three jobs | `production` (required): production tag, side a. `candidate` (required): candidate tag, side b. `claims_url`: a URL the runner can `curl` without credentials; omitted means no claims. `runs`: default `3`. `migrations_a`, `migrations_b`: monorepo git refs for migration mode; default `v<production>` and `v<candidate>` |
| `deployed` | `post-deploy.yml` — post-deploy mode against `HARNESS_PRODUCTION_URLS` | none read. The recorded side is the `release-report` artifact of the latest successful `release.yml` run; the payload cannot choose it (by hand, `workflow_dispatch` with `recorded_run_id` can) |

Any other event type is ignored. Unknown payload fields are ignored. A missing
required field fails the run at its first harness step (exit `2`).

`release.yml` also takes the same values as `workflow_dispatch` inputs
(`production`, `candidate`, `claims_url`, `migrations_a`, `migrations_b`,
`runs`); `nightly-noise.yml` and `weekly-mutants.yml` take `tag`.

### Repository variables (on this repository)

| Variable | Default when unset | Used for |
| --- | --- | --- |
| `HARNESS_IMAGE_PREFIX` | `tutors` | registry/namespace bare tags are resolved under, e.g. `ghcr.io/tutors-sdk/tutors` |
| `HARNESS_PRODUCTION_TAG` | `main` | the tag nightly noise, weekly mutants and CI's smoke run use; the deploy updates it |
| `HARNESS_PRODUCTION_URLS` | `reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev` | the live deployment post-deploy mode reads |

### Artifacts

Each is the run's whole `out/` directory unless noted, so a report is at
`<timestamp>-<mode>/report.json` inside it.

| Artifact | Workflow | Retention |
| --- | --- | --- |
| `release-report` | `release.yml` | 30 days |
| `migration-report` | `release.yml` | 30 days |
| `upgrade-report` | `release.yml` | 30 days |
| `post-deploy-report` | `post-deploy.yml` | 14 days |
| `noise-status` (only `<timestamp>-noise/noise-status.json`) | `nightly-noise.yml` | 8 days |
| `noise-report` | `nightly-noise.yml` | 8 days |
| `mutant-reports` | `weekly-mutants.yml` | 14 days |
| `harness-ci` | `ci.yml` | 7 days |

Each job also appends `report.md` to its step summary. A `release.yml` run
concludes `failure` when any of its three jobs exits non-zero, `success`
otherwise — including on `warn`.

## What the harness does to a pull request

Nothing. The harness has no token for the monorepo and its workflows never
hold `pull-requests`, `checks`, `statuses` or `deployments` permission (a test
enforces this). It will not comment on a PR, set a commit status, create a
check run, push, tag, label, approve or merge, in any repository.

What it does instead:

- writes `report.md` — shaped to be a PR comment — to the artifact and the
  run's step summary. Posting it on the release PR, and turning the run's
  conclusion into a check, is the monorepo's job, with the monorepo's token;
- in `post-deploy.yml` only, and only with `issues: write` on **this**
  repository: opens an issue labelled `rollback` with `report.md` as its body
  when post-deploy mode exits `1`.

Post-deploy mode sends anonymous, read-only requests for the published
reference course to the production URLs. It never signs in and never writes.

## Compatibility

The contract version is semver, and the harness version moves at least as far:
a contract major is a harness major.

| Bump | When | Examples |
| --- | --- | --- |
| **major** (`schemaVersion` changes too) | a consumer written against this document could break or be misled | removing or renaming a `report.json` / `noise-status.json` field, or changing its type or meaning; removing a value from `mode`, `verdict` or `severity`; changing what an exit code means, or which verdicts a mode can return; loosening or tightening the A/A rule's default; a claims file that was valid becoming invalid, or matching differently; removing or renaming a stable command or flag, or changing its meaning; removing a dispatch event type, a payload field, a repository variable or an artifact, or making an optional payload field required; the harness starting to write to pull requests |
| **minor** | additions a careful consumer survives | a new optional `report.json` field; a new artefact name (consumers must tolerate artefacts they do not know); a new mode, command, stable flag, optional payload field, dispatch event type, variable with a default, or artifact; a new optional claims key; any change to non-stable commands and flags |
| **patch** | no change to anything above | wording of `reasons`, `summary`, `detail`, `report.md`, `report.html`, stdout; documentation; bug fixes that make the code match this document |

Independently of the contract, the **harness version** must be bumped by any
PR that changes what the harness compares or gates on — an engine, a mask, a
journey, the gate, a mutant (`src/ci/engine-change.ts` lists the paths; CI
enforces it and re-runs the mutants, see [TESTING.md](../TESTING.md)). Two
reports are comparable only when their `harness.version` is the same: a new
mask or engine can change the hunks for the same two images without any
change to this contract.

Releases are git tags `v<harness version>` on `main`, cut by a maintainer.
