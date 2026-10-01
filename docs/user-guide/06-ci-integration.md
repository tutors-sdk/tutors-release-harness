# 06 CI integration

This chapter is for the person who connects the monorepo to the harness, or maintains the workflows in this repository. Everything a workflow does with the harness is a `pnpm harness ...` line that also runs locally ([chapter 2](02-running-locally.md)); the workflows add transport (fetch an artifact, push a branch, keep a cache, open an issue) around those commands. The machine-readable form of most of this chapter is [`docs/contract/workflows.json`](../contract/workflows.json) and [`cli.json`](../contract/cli.json); the promise is [`docs/contract.md`](../contract.md).

OpenShift is out of scope; nothing here deploys anything.

- [The workflows](#the-workflows)
- [Repository variables, secrets and settings](#repository-variables-secrets-and-settings)
- [The `release-candidate` dispatch](#the-release-candidate-dispatch)
- [The `deployed` dispatch](#the-deployed-dispatch)
- [The release record](#the-release-record)
- [Main to RC: the live exemplar](#main-to-rc-the-live-exemplar)
- [The scoreboard branch](#the-scoreboard-branch)
- [The rollback issue and its 5 Whys](#the-rollback-issue-and-its-5-whys)
- [Release tags](#release-tags)
- [The monorepo side](#the-monorepo-side)
- [What the pull-request comment shows](#what-the-pull-request-comment-shows)
- [Overrides and the record they leave](#overrides-and-the-record-they-leave)
- [Exit codes for CI](#exit-codes-for-ci)
- [Permissions and artifacts](#permissions-and-artifacts)

## The workflows

Eight workflows live in this repository's `.github/workflows/`. Five judge or check something; `main-preview.yml` forecasts the next release; `pages.yml` only publishes what the others kept; `tags.yml` tags each harness version that lands on `main`. How they line up with the steps of a release is in [chapter 10](10-running-a-release.md#how-ci-runs-the-same-thing).

| Workflow | Runs when | What it does |
| --- | --- | --- |
| `ci.yml` | every pull request, and pushes to `main` | Typecheck, lint, unit and fixture tests. **Masks land in their own PR (required)**: `harness guard masks --base <base sha>`. The two-stacks smoke is one command, `pnpm harness local smoke --tag "$TAG"`: `images ensure`, both stacks boot and one journey runs as an A/A, the expanding migration fixture passes and the contracting one is rejected. Stack logs on failure. Uploads `harness-ci` (7 days). The unit job also runs `harness why check kaizen` and `harness why register --dir kaizen`, so every 5 Whys in `kaizen/` is filled and the register's table is what the files say; the masks job also runs `harness guard scoreboard`, so `scoreboard/*.jsonl` only gains lines. |
| `nightly-noise.yml` | nightly at 02:17 UTC, or by hand (`tag` input) | The A/A on the production tag, pulled from Quay. Job `noise`: install pinned grype (v0.119.0) and restore or fetch its database (`harness vuln-db update` on a cache miss, then `harness vuln-db status`), restore the last verified images, `images ensure ... --image-cache`, `run --mode noise --runs 5 --load 20x30s --require-verified` with `HARNESS_REQUIRE_STATIC=1`, upload `noise-status` and `noise-report` (8 days). Job `publish`: `noise record` into a working directory, force-push the `noise` branch, fail the night if the ratchet is broken. |
| `release.yml` | `repository_dispatch` `release-candidate`, or by hand | The run is titled `release <candidate>`. Job `release`: pinned grype and its database, `images ensure`, fetch claims, fetch the noise status, `run --mode release ... --load 20x30s` with `HARNESS_REQUIRE_STATIC=1` (a release is not judged on an SBOM and vulnerability diff that could not be produced). Job `migration`: `run --mode migration`. Job `upgrade`: `images ensure`, `run --mode upgrade --set fixture --journey anonymous-student-reads-course`. Job `publish-record`: push the release record to the `release-records` branch. Job `override-record`: open a `harness-override` issue for each applied override. Job `scoreboard` (after the three runs, pass or fail): `harness changes` against the monorepo, `harness confidence` over the three reports, `harness scoreboard append`, pushed to the `scoreboard` branch ([below](#the-scoreboard-branch)). Each job's summary says `could not judge` when the run stopped before a verdict, instead of a report. |
| `post-deploy.yml` | `repository_dispatch` `deployed`, every 15 minutes, or by hand (`recorded_run_id` input) | Download the `release-report` artifact of the latest release run, fetch the noise status and the release record, `run --mode post-deploy`. **Exit 1** (a difference) opens a `rollback` issue, with the 5 Whys stub for the rollback in a fold ([below](#the-rollback-issue-and-its-5-whys)). **Exit 2** ("could not judge": an unusable input, an image that cannot be trusted, a run that stopped before a verdict) fails the workflow, says so in the job summary, and opens no issue, because nothing was found that says production is worse. On the 15-minute schedule, when no release run has kept a `release-report` to compare with, the monitor stands down green with a notice in the run summary instead of failing; a `deployed` dispatch or a `recorded_run_id` without a recording still fails. |
| `main-preview.yml` (**Main to RC**) | when the nightly A/A on `main` finishes, passed or failed (`workflow_run`), or by hand (`production`, `candidate`, `force` inputs) | "What would release mode say if main were cut as a release candidate today?" Job `resolve`: `harness preview resolve` picks side a (production: the reader overlay's `newTag` on the monorepo's `main`) and side b (`sha-<short>` of the newest commit on `main` whose images are signed), and skips the run when this harness version already judged that pair (unless `force`). Job `preview`: pinned grype and its database, `images ensure`, main's `release/claims.yaml` and Rules, the latest noise status, `run --mode release --runs 5 --load 20x30s` with `HARNESS_REQUIRE_STATIC=1`; uploads `main-preview-report` (14 days). Jobs `migration` and `upgrade` (since 1.13.1): the same two rehearsals `release.yml` gives a candidate. PASS, WARN and FAIL all end green: a forecast, never a gate; only exit `2` fails it. Job `publish`: `harness changes` over a monorepo checkout and `harness confidence` with the release run, both rehearsals and the `scoreboard` branch's history (read only, never appended), then `harness reports keep` onto the `main-preview` branch (last 60 runs, and since 1.16.0 every run of the last 10 days) with `confidence.json` and `changes.json`, the report leading with Gate, RCS and band, the glance and the per-PR changes (since 1.13.1), and since 1.16.0 both rehearsals' reports beside it (`migration/`, `upgrade/`), which the kept `confidence.json` links. Since 1.18.0 the step "The monorepo's quality record" fetches the monorepo's `quality/<sha>.json` (its Nightly's mutation scores and job results) for the judged commit or the newest before it, keeps it beside the forecast as `quality.json`, and the score reads it as `--test-signal`, joined by the `scoreboard` branch's weekly mutants (`--mutants`); no record leaves Test signal not measured. It never writes `release-records`, so post-deploy cannot mistake a forecast for a judged candidate. It is the live example the guide reads ([below](#main-to-rc-the-live-exemplar)). |
| `pages.yml` (**Report pages**) | after every run of the nightly, the release workflow and Main to RC, on a push to `main` that changes `site/`, or by hand | Copies the kept `reports/` of the `release-records`, `main-preview` and `noise` branches beside `site/index.html` and deploys them to GitHub Pages: [tutors-sdk.github.io/tutors-release-harness](https://tutors-sdk.github.io/tutors-release-harness/), every kept run newest first with its verdict, score and scorecard, and `scoreboard.html` (the release trends and the harness's health, `harness scoreboard trends --site`, from the `scoreboard` branch), and since 1.17.0 `readiness.html` (Main to RC night by night for the last ten nights, each with its commit, Gate and what is new since the night before, `harness readiness --site`), linked at the top of the index. Since 1.18.0 the A3 and each readiness row carry the quality strip (Speed, Metrics, Tests), with `--mutants` from the `scoreboard` branch. Judges nothing and writes no branch. Needs the repository setting Pages, source "GitHub Actions". |
| `weekly-mutants.yml` | Mondays 03:41 UTC, every pull request, or by hand (`tag` input) | Job `changes`: on a pull request, `harness guard engine --base <base sha>`. Job `mutants`: pinned syft (v1.52.0) and grype with its database, `images ensure`, `harness mutants --base <tag>` (only when an engine change was detected, or on the schedule). When the self-test fails it uploads `mutant-noise-report`. Job `required`, named **Mutants re-run (required)**, always reports so it can be a required check. Uploads `mutant-reports` (14 days). Job `record` (the schedule and by hand only): appends the week's `mutants.json` to `scoreboard/mutants.jsonl` on the `scoreboard` branch (`harness scoreboard mutants`). |
| `tags.yml` (**Release tags**) | a push to `main` that changes `package.json`, or by hand | Tags `v<version>` on the first commit of `main` that carries each version (`scripts/release-tags.sh`). A tag is never moved or re-made ([below](#release-tags)). |

Every job that runs journeys (the nightly, release, post-deploy, Main to RC's `preview`, `ci.yml`'s `two-stacks` and the mutants) runs on the pinned `ubuntu-24.04`, not `ubuntu-latest`: the A/A measures the noise floor of that image (fonts, anti-aliasing), so the others must run on the same one. Move them all together, in one pull request, and expect a fresh burn-down afterwards.

Every `uses:` is pinned to a commit with its release in a trailing comment, and Dependabot (`.github/dependabot.yml`) moves both weekly. `ci.yml`'s **Workflow lint (actionlint, zizmor)** job lints the workflows on every pull request; `.github/zizmor.yml` says what it ignores and why.

`release.yml` on a release-candidate dispatch runs for these `client_payload` values, mapped to command lines:

```text
images ensure --a "$PRODUCTION" --b "$CANDIDATE" [--a-digests "$PRODUCTION_DIGESTS"] [--b-digests "$CANDIDATE_DIGESTS"]
run --mode release --a "$PRODUCTION" --b "$CANDIDATE" --runs "$RUNS" --load 20x30s      # RUNS defaults to 5; HARNESS_REQUIRE_STATIC=1
    [--a-digests ...] [--b-digests ...] [--claims claims.yaml] [--rules "$RULES_URL"] [--noise <status file>]
    [--override-reason ... --override-by ...]
run --mode migration --a "${MIGRATIONS_A:-v$PRODUCTION}" --b "${MIGRATIONS_B:-v$CANDIDATE}"
run --mode upgrade --a "$PRODUCTION" --b "$CANDIDATE" --set fixture --journey anonymous-student-reads-course [--a-digests ...] [--b-digests ...]
```

`claims.yaml` is fetched with `curl -fsSL "$CLAIMS_URL"`; the rules file is passed by URL. The vulnerability database is one pinned directory (`.harness/vuln-db`), cached per UTC day and grype version, fetched once by `harness vuln-db update` on a cache miss, and never updated during a run ([chapter 2](02-running-locally.md#the-vulnerability-database)). The noise status is fetched from the `noise` branch by `gh api` and vetted with `harness noise status --store noise`, which writes `noise_file=<path>` to `GITHUB_OUTPUT` when the file parses; the run gets `--noise <file>` only then, and otherwise degrades to a warning.

## Repository variables, secrets and settings

**Repository variables** on this repository. All are optional; each has the default shown.

| Variable | Default when unset | Used for |
| --- | --- | --- |
| `HARNESS_IMAGE_PREFIX` | `quay.io/tutors-sdk/tutors-{app}` | where bare tags resolve: a prefix or an `{app}` template |
| `HARNESS_COSIGN_IDENTITY` | `^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@` | who must have signed a pulled image. Set it only if the signing workflow is another |
| `HARNESS_PRODUCTION_TAG` | `main` | the tag the nightly A/A, the weekly mutants and CI's smoke test use. **Set it to the deployed tag**: `main` is not production. The monorepo's deploy workflow updates it |
| `HARNESS_PRODUCTION_URLS` | `reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev` | the live deployment post-deploy mode reads |

**Secrets.** This repository holds none of its own: the workflows use `github.token`, and the images are public, so no registry credentials are held. Every job that runs `images ensure` installs cosign 3 with `sigstore/cosign-installer`.

**Secrets in the monorepo** that feed the harness:

| Secret | Value |
| --- | --- |
| `HARNESS_TOKEN` | a fine-grained personal access token with `contents: write` on this repository. GitHub requires it for `repository_dispatch` |
| `QUAY_USERNAME`, `QUAY_PASSWORD` | a Quay robot account with write access to the four `tutors-<app>` repositories: what `image-build.yml` publishes with |

**Settings to make on this repository** (the harness cannot do them):

- Protect the `noise` branch with a ruleset: only the `github-actions` app may push (force push allowed, deletion blocked). Release runs let that branch's status license a FAIL, so a person who can push there can forge a clean night.
- Mark **Masks land in their own PR (required)** and **Mutants re-run (required)** as required checks on `main`.
- Allow the workflows to raise their own token permissions if the organisation default is read-only: `nightly-noise.yml`'s `publish` and `release.yml`'s `publish-record` ask for `contents: write` themselves.
- Do not let administrators bypass the harness's check on the monorepo's release pull requests. A bypass is invisible to the harness; the recorded override is the supported way past a FAIL.

## The `release-candidate` dispatch

Send it with a token that has `contents: write` on this repository. The monorepo's `release-dispatch.yml` does exactly:

```console
gh api repos/tutors-sdk/tutors-release-harness/dispatches --input payload.json
```

with `GH_TOKEN` set to `HARNESS_TOKEN`. Any other `event_type` is ignored, unknown payload fields are ignored, and a missing required field fails the run at its first harness step with exit `2`.

| `client_payload` field | Required | Meaning |
| --- | --- | --- |
| `production` | yes | production tag, side a, e.g. `16.2.0` |
| `candidate` | yes | candidate tag, side b, e.g. `16.3.0-rc.4` |
| `claims_url` | no | a URL the runner can GET without credentials for `claims.yaml`. Omitted: no claims |
| `rules_url` | no (since 1.3.0) | a URL the runner can GET without credentials for `rules.json`. Passed as `--rules`. A claim that names a `rule` needs it |
| `runs` | no | journey repetitions per side; default `5` (four is the least that lets timing reach significance). The monorepo sends `5` |
| `migrations_a`, `migrations_b` | no | monorepo git refs for migration mode; default `v<production>` and `v<candidate>` |
| `production_digests` | no (since 1.3.0) | object `app -> "sha256:<64 hex>"`: what production runs. Pins side a: pulled and verified by digest, refused with exit 2 when the tag now resolves to another digest |
| `candidate_digests` | no (since 1.3.0) | the same for the candidate. Pins side b, and is what the release record keeps |

`production_digests` and `candidate_digests` are objects of any of the harness's four apps (`reader`, `catalogue`, `live`, `time`); an unknown app, a digest that is not `sha256:` and 64 lowercase hex, or a digest that contradicts one already in the tag spec is exit `2`. An app with no digest is not pinned; a side may be pinned in part. Send the digest of the manifest the tag points at, the one `docker buildx imagetools inspect <image> --format '{{.Manifest.Digest}}'` prints: that is what cosign signed.

A complete payload:

```json
{
  "event_type": "release-candidate",
  "client_payload": {
    "production": "16.2.0",
    "candidate": "16.3.0-rc.4",
    "claims_url": "https://raw.githubusercontent.com/tutors-sdk/tutors-mono-repo/<sha>/release/claims.yaml",
    "rules_url": "https://raw.githubusercontent.com/tutors-sdk/tutors-mono-repo/<sha>/release/rules.json",
    "runs": 5,
    "migrations_a": "v16.2.0",
    "migrations_b": "<sha>",
    "production_digests": { "reader": "sha256:<64 hex>", "catalogue": "sha256:<64 hex>", "live": "sha256:<64 hex>", "time": "sha256:<64 hex>" },
    "candidate_digests":  { "reader": "sha256:<64 hex>", "catalogue": "sha256:<64 hex>", "live": "sha256:<64 hex>", "time": "sha256:<64 hex>" }
  }
}
```

A minimal one is `{"event_type":"release-candidate","client_payload":{"production":"16.2.0","candidate":"16.3.0-rc.1"}}`: bare tags, no claims (so nothing is claimed and every difference is unclaimed), no pins. That behaves exactly as in contract 1.2.0. By hand, `release.yml` takes the same values as `workflow_dispatch` inputs (`production`, `candidate`, `claims_url`, `rules_url`, `migrations_a`, `migrations_b`, `runs`) and one more, `override_reason`.

**What digests change.** The references become `repo:tag@sha256:...`; the pull is by digest and the signature is verified on it; the harness asks the registry (`docker buildx imagetools inspect`) what each tag resolves to now and refuses to judge (exit 2, "cannot judge") when it is another digest, or when it cannot be resolved; a pinned image that cannot be pulled is exit 1 and is **never built from source**, because a rebuild is not the image the digest names.

## The `deployed` dispatch

Sent by the monorepo's deploy job after a rollout. Both fields are optional; without them (every 1.2.0 payload, and the 15-minute schedule) nothing is compared.

| Field | Meaning |
| --- | --- |
| `production` | the tag that was deployed, e.g. `16.3.0`. Names the release record to compare with; a registry tag (`[A-Za-z0-9_][A-Za-z0-9_.-]*`), because it names a file |
| `digests` | object `app -> sha256:<64 hex>`: the images that run |

```json
{
  "event_type": "deployed",
  "client_payload": {
    "production": "16.3.0",
    "digests": { "reader": "sha256:<64 hex>", "catalogue": "sha256:<64 hex>", "live": "sha256:<64 hex>", "time": "sha256:<64 hex>" }
  }
}
```

`post-deploy.yml` runs the reference journeys against `HARNESS_PRODUCTION_URLS` and compares them with the release-report artifact of the **latest successful `release.yml` run**; the payload cannot choose it (by hand, `workflow_dispatch` with `recorded_run_id` can). With `production` and `digests` it also fetches `releases/<production>.json` from the `release-records` branch and passes it as `--release-record`. The comparison and its five outcomes are under [The release record](#the-release-record).

## The release record

Release mode writes what it judged. It writes `releases/<candidate>.json` in `HARNESS_HOME` (locally) and `release-record.json` in the run's output directory (so the `release-report` artifact carries it). Its shape ([`release-record.schema.json`](../contract/release-record.schema.json)):

```json
{ "schemaVersion": 1, "candidate": "16.3.0-rc.4", "release": "16.3.0", "production": "16.2.0",
  "recordedAt": "2026-09-16T09:10:00.000Z",
  "harness": { "version": "1.4.1", "gitSha": "3f2c...", "contractVersion": "1.4.0" },
  "verdict": "pass", "overridden": false, "pinned": true, "verified": true,
  "digests": { "reader": "sha256:...", "catalogue": "sha256:...", "live": "sha256:...", "time": "sha256:..." } }
```

`digests` are the registry digests of the candidate images that ran, and are evidence only when `verified` is `true` (every image pulled and signature-verified in that run). A candidate built from a git ref, or found locally, has none. `pinned` says the dispatch carried `candidate_digests`.

Alongside `<candidate>.json`, a second file `<release>.json` (`16.3.0` for `16.3.0-rc.4`) holds the newest candidate of that release that **could ship**: one whose verdict is not `fail`, unless the FAIL was overridden. That is the file `--deployed 16.3.0` finds.

The `publish-record` job of `release.yml` pushes both to this repository's `release-records` branch, one commit per candidate, never forced. It does so whenever release mode produced a record, even for a FAIL. A run that never reached a verdict left no record, and that is not an error. Mutant runs leave none.

**Checking a deployment.** Post-deploy mode compares the digests the deploy reported with the record and reports one of:

| `deployment.status` | Meaning |
| --- | --- |
| `match` | every reported digest is the recorded one, and no app is missing on either side |
| `differs` | an app is deployed at another digest than release mode judged |
| `incomplete` | nothing differs, but an app has a digest on one side only |
| `no-record` | no release record was found for the release |
| `not-reported` | the deploy named a tag but sent no digests |

Anything but `match` is **advisory, exit 0**: the first reason says `DEPLOYED IMAGES DIFFER` or `DEPLOYED IMAGES NOT CONFIRMED`, a `pass` becomes a `warn`, and a `fail` is neither softened nor made worse. The record is looked up in this order and nowhere else: `--release-record` (a file, or a directory holding `<tag>.json`), otherwise `<HARNESS_HOME>/releases/<tag>.json`.

## Main to RC: the live exemplar

`main-preview.yml` answers one question every day: what would release mode say if `main` were cut as a release candidate today? Side a is production (the reader overlay's `newTag` on the monorepo's `main`), side b is `sha-<short>` of the newest commit on `main` whose images are signed, and the claims are main's `release/claims.yaml`: the next release's claims so far. It is the same release job as `release.yml` (5 runs, k6 `20x30s`, the pinned vulnerability database, the noise status), with the same migration and upgrade rehearsals, and since 1.13.1 it is scored as a candidate is: change signals from the monorepo, the confidence score, the glance. The kept report opens with the Gate, then the RCS and band, then where to look first, and the top of the [report pages](https://tutors-sdk.github.io/tutors-release-harness/) shows the newest one as "What main would ship today".

It is a forecast, never a gate: PASS, WARN and FAIL all end green, nothing is tagged or recorded as a candidate, and only exit `2` fails the run. Each report is kept on the `main-preview` branch (`reports/<ranAt>-release/`, with its two rehearsals since 1.16.0; the last 60 runs, and every run of the last 10 days, in `reports/index.json`) and published on the [report pages](https://tutors-sdk.github.io/tutors-release-harness/). Because it is the report the next candidate would get, it is the example [chapter 3](03-reading-a-report.md) reads from top to bottom, and the first place to look for an unclaimed difference before a release is cut: each one is a claim, or a fix, the next release needs.

A pair this harness version already judged is skipped (`harness preview resolve`, one API call on a quiet day); `force` judges it again.

## The scoreboard branch

`main` takes changes only through pull requests, so no workflow commits to it. The scoreboard lives on its own branch instead:

- `release.yml`'s `scoreboard` job, after the release, migration and upgrade jobs (pass or fail), downloads the three reports, runs `harness changes --a <production> --b <candidate>` against a checkout of the monorepo, fetches the `scoreboard` branch (so the glance's novelty reads the releases already there), scores with `harness confidence`, and appends one line to `scoreboard/releases.jsonl` with `harness scoreboard append --tag <candidate> --run-url <run>`. One commit per line. A run that reached no verdict has nothing to score and adds no line.
- `weekly-mutants.yml`'s `record` job appends the week's self-test to `scoreboard/mutants.jsonl`.
- Both share the concurrency group `scoreboard-branch`, never force-push, and check before pushing that the old file is exactly the start of the new one.
- `pages.yml` reads the branch and publishes `scoreboard.html` and `scoreboard.json`.
- To bring lines onto `main`, open a pull request that copies them; `harness guard scoreboard` lets it only add.

Until the first release run the branch does not exist, and the page says "No releases scored yet." There is no seed data: a made-up history would draw a trend nobody lived through. A `harness release` on a laptop appends to its own `HARNESS_HOME/scoreboard/releases.jsonl`; the two are separate histories.

## The rollback issue and its 5 Whys

When `post-deploy.yml` exits `1` (production differs from the tested candidate), the step "Open a rollback issue":

1. runs `harness why --run <the post-deploy run> --finding rollback --tag <deployed tag>`, which writes the 5 Whys stub for the rollback with Why 1 answered from the run's trace. If writing it fails, the issue is still opened;
2. builds the body: the post-deploy `report.md`, a link to the run, and the stub in a fold ("copy to kaizen/ in the harness repository, then fill Whys 2-5 and the countermeasure");
3. keeps **one open rollback issue at a time**. The monitor runs every 15 minutes and finds the same differences until someone acts, so a run whose unclaimed differences are already on the open issue (a signature of that section, in a hidden comment) adds nothing; different differences become a comment on it; with none open, a new issue labelled `rollback`.

Exit `2` opens no issue. What to do with the issue is SOP step 11: roll back (`pnpm deploy:pin <previous>` in the monorepo) and take the stub to the register ([chapter 10](10-running-a-release.md#when-a-trigger-fires-the-5-whys)).

## Release tags

Every harness version that lands on `main` is tagged `v<version>`, on the first commit of `main` (first-parent history) whose `package.json` carries it. `tags.yml` does it on a push to `main` that changes `package.json`, and by hand, which also tags any older version that has no tag yet. A tag that exists is never moved or re-made, and a version that never reached `main` gets none. The run's summary lists the tags it made. No workflow creates a GitHub release.

## The monorepo side

What the monorepo owns and how it meets the harness. The monorepo's files are the source of truth; the reference copies under [`docs/monorepo/`](../monorepo/README.md) exist so the contract can be read next to the code that receives it.

**Images.** `image-build.yml` builds the four apps for `linux/amd64` and `linux/arm64` on every push to `main` and every `v*` tag, pushes to `quay.io/tutors-sdk/tutors-<app>` (tags `sha-<short>` always, `main`, `X.Y.Z`, `X.Y`, `latest`, and `X.Y.Z-rc.N` on a prerelease tag that never moves `latest`), signs each image by digest with cosign (keyless, from that workflow) and attaches an SPDX SBOM attestation. The harness verifies exactly that signature identity.

**`release-dispatch.yml`**, on every push to `release/**`:

1. tags the commit `vX.Y.Z-rc.N` (the version comes from the branch name, and the push is a candidate only when `package.json` carries that version);
2. starts `image-build.yml` on the tag (a tag created with the workflow's own token starts no other workflow) and waits until the images can be pulled anonymously;
3. publishes `rules.json` for the commit (`pnpm release:rules --ref <sha>`) as an asset of a prerelease named for the rc tag, because the harness needs a URL it can fetch without credentials (best-effort: without it the dispatch goes out without `rules_url`);
4. sends the `release-candidate` dispatch: `production` (the reader overlay's `images[0].newTag` **on `main`**, because the overlays name what is deployed and move only when a release is), `candidate`, `claims_url` (pinned to the tagged commit), `runs` (5), `migrations_a` (`v<production>`, or `release/<production>` for a release that was never tagged), `migrations_b` (the tagged commit's sha), and, when it can read them, `rules_url`, `production_digests` (the `digest:` of each of the four overlays on `main`) and `candidate_digests` (what the registry serves for the candidate's four images). Optional fields that cannot be read are left out, and the harness then behaves as it did without them.

**`release-claims.yml`**, on the same pushes and on release pull requests: fails when `release/claims.yaml` is missing or is not a file the harness would accept (`pnpm check:release-claims`, which accepts all nineteen artefact names and checks cited Rules against the Rules at the ref), and runs `pnpm check:migrations` for destructive migrations. See [chapter 4](04-writing-claims.md#before-you-push).

**`release-harness-report.yml`: the verdict on the release pull request.** The harness never writes to a pull request; this workflow, on the monorepo's side and with the monorepo's token, closes the gap. `release-dispatch.yml` starts it after the dispatch, on the default branch. It finds the harness run the dispatch started (`release.yml`, event `repository_dispatch`, started after the dispatch, titled `release <candidate>`, matched as a whole tag so `rc.1` is not `rc.10`), waits for it to complete (polling, for at most 45 minutes), downloads the `release-report` artifact, reads the release-mode `report.json`, and creates or updates **one** comment on the release branch's open pull request, found by a hidden marker in its first line: no new comment per push; the comment is rewritten for each candidate. It is best-effort: no run, no pull request yet, a token that cannot read the harness's runs, or a timeout is said in that run's summary and nothing about tagging or dispatching depends on it.

- **Token scope.** Reading another repository's workflow runs and artifacts needs the fine-grained permission **Actions: read** on this repository, *in addition to* the **Contents: write** that `repository_dispatch` needs. `HARNESS_TOKEN` is the monorepo's secret and this is the monorepo's setting; a token without Actions: read gets a 403 or 404 and the summary names the permission to add.
- **The run title is contract.** `release.yml` sets `run-name: release <candidate>` ([`workflows.json`](../contract/workflows.json) `runNames`) so the report workflow can find its run. Without the title it falls back to the one `repository_dispatch` run that started after the dispatch and refuses to guess between two.
- The job holds `pull-requests: write` in the monorepo only; nothing in this repository gains a pull-request permission.

**Promote, do not rebuild.** The harness judges the `X.Y.Z-rc.N` images, so the final tag must ship those same images. A final tag `vX.Y.Z` does not build: for each app `image-build.yml` runs `scripts/promote-image.ts`, which points `X.Y.Z`, `X.Y`, `latest` and `sha-<short>` at the candidate's existing digest (`docker buildx imagetools create`). Nothing is rebuilt, so the digest, the cosign signature and the SBOM attestation are the ones the harness judged. An app is promoted only when the registry has `X.Y.Z-rc.N` for it (the highest N), the git *tree* of the rc tag equals the final tag's commit's tree, the image's revision label is the commit the rc tag points at, and `cosign verify` of the digest succeeds for `image-build.yml` at that ref. So **do not add a commit between the last RC and the final tag**, not even a changelog touch-up. An app that cannot be promoted is rebuilt and the run says `REBUILT` in a warning and the job summary; with the workflow input `require_promotion` a rebuild is a failure instead. For a rebuilt app the deployed digest differs from the judged one, and the deployment check says so.

**`deploy.yml`.** `pnpm deploy:pin X.Y.Z` asks Quay for each app's digest, checks it is signed by `image-build.yml`, and rewrites the overlays together. The workflow verifies the pins (`pnpm check:deploy-pins --registry`). After a push to `main` that changed a pin, the `announce` job waits for approval in the `production` environment, then sets `HARNESS_PRODUCTION_TAG` on this repository (`gh variable set`) and sends the `deployed` dispatch with `production` and `digests` for all four apps, `time` included. The variable is set first, so every harness run that starts afterwards (the dispatch, tonight's noise run) already sees the new tag.

**`release:harness`.** Nothing about judging a candidate needs GitHub. In the monorepo, `pnpm release:harness` builds the `release-candidate` payload from your own clone with git alone, and can hand it to the harness's `local gate`:

```console
pnpm release:harness                    # print the payload (the same as --print)
pnpm release:harness --run              # run `pnpm harness local gate` with those values
pnpm release:harness --deployed --print # the `deployed` payload, from the overlays on main
pnpm release:harness --deployed --run   # `local watch --once`, with HARNESS_PRODUCTION_TAG set
pnpm release:harness --nightly --run    # `local nightly` against the production tag
pnpm release:harness --run -- --only release --dry-run   # arguments after `--` go to the harness
```

Other options: `--candidate <tag>`, `--ref <ref>`, `--main-ref <ref>`, `--production <tag>`, `--runs <n>`, `--claims-url <url>`, `--rules-url <url>`, `--rules <file>` (with `--run`), `--candidate-digest <app=sha256:...>` (repeatable), `--repo <dir>`. It never tags, pushes or dispatches. The harness checkout is a sibling of the monorepo, or named by `HARNESS_DIR`.

**`release:rules`** writes the `rules.json` a dispatch's `rules_url` points at; **`release:claims:draft`** drafts claims from the Rules that changed ([chapter 4](04-writing-claims.md#from-ears-rules-and-changelog-entries)).

## What the pull-request comment shows

The harness never comments on a pull request, sets a commit status, creates a check run, tags, labels, approves or merges. Its workflows never hold `pull-requests`, `checks`, `statuses` or `deployments` permission (a test enforces it). What it produces is `report.md`, written to be a pull-request comment:

- the verdict in the heading, then the provenance and digests of both sides (a `harness release`'s `gate.md` leads instead with the Gate, then the RCS and its band, the glance, the dimension table and the per-PR table);
- the reasons, unclaimed differences (the list to act on), claimed differences with what claims them, claim hygiene, stale claims;
- banners when a side was not verified or a deployment differs;
- load, migration and upgrade tables where they apply.

[Chapter 3](03-reading-a-report.md#reportmd-the-pull-request-comment) walks through one. In CI it is appended to the job's step summary (`cat out/*-release/report.md >> "$GITHUB_STEP_SUMMARY"`) and is in the artifact. **Posting it on the release pull request, and turning the run's conclusion into a check, is the monorepo's job, with the monorepo's token.** To post it by hand from a local run: `gh pr comment <n> --body-file out/<time>-gate/gate.md`.

## Overrides and the record they leave

The harness will sometimes be wrong, or right and inconvenient. A bypass in GitHub's branch protection leaves no trace in the harness, so the supported way past a FAIL is to say so *to the harness*, which records it.

- **How.** Dispatch `release.yml` **by hand** with `override_reason`. Only a person can: a `repository_dispatch` payload cannot override. Every job then passes `--override-reason "<reason>" --override-by "<the dispatching actor>"` (`github.triggering_actor`).
- **The rule.** Both flags are required together. The reason must be at least 20 characters and not a rubber stamp (`ok`, `okay`, `lgtm`, `approved`, `override`, `overridden`, `urgent`, `hotfix`, `because`, `n/a`, `none`, or `see ...`); otherwise the run exits 2. Name the difference and the decision: `Rule 0044: payments hotfix, frame options restored in 16.3.1`.
- **What happens.** The verdict stays FAIL (the harness does not change its mind) and the run exits 0. `report.json` gets `override: { reason, by, verdict, applied, at }`, and the reason and person are the first line of `reasons`, in `report.md` and in `report.html`. An override on a run that did not fail is recorded with `applied: false`, so an unneeded override never looks like a bypass.
- **The record.** The `override-record` job opens an issue labelled `harness-override` in this repository, with the report as its body, for each applied override. Locally the equivalent is `<HARNESS_HOME>/overrides.jsonl` (append-only, hash-chained) and `harness override list [--since <date>] [--json]`.
- **The measure.** Overrides per quarter against the FAILs the harness issued is how you tell whether the harness is trusted or merely tolerated. More than one override of the same rule in a quarter means the rule is wrong or the process is. A quarter with zero of both means the harness has not been exercised. See [docs/noise-burndown.md](../noise-burndown.md#overrides) for the two commands that count them.

## Exit codes for CI

| Code | From | CI should |
| --- | --- | --- |
| `0` | `run`/`compare` with verdict pass or warn, or a FAIL that was overridden; any command that succeeded | treat as success. **A `warn` exits 0 on purpose**; read `verdict` from `report.json` if you need to tell it apart. A `release.yml` run concludes `success` on a warn |
| `1` | `run`/`compare` with a FAIL that was not overridden; `images ensure` could not obtain an image; `mutants` or `kind rollout` did not succeed; `noise record` found the ratchet broken; `noise status --require` found no licence; `guard` found a violation; `doctor` found a missing tool | fail the job. In `release.yml` any of the three jobs exiting non-zero concludes the run `failure`. In `post-deploy.yml` the `rollback` issue is opened on this exit |
| `2` | usage error; the harness itself failed; an image may not be judged (not present locally, unsigned, wrongly signed, cosign missing); an invalid claims file; a rules file that cannot be read; a bad digest; a moved tag | fail the job. No verdict was reached and there may be no `report.json`. The reason is on stderr after `cannot judge:` (`run`) or `ERROR:` (`images ensure`). In `post-deploy.yml` this fails the run and says "could not judge" in the summary, but opens no issue |

Details of the commands' outputs for workflows:

- With `GITHUB_OUTPUT` set, `images ensure` writes `image_cache=none|used|refreshed` (the nightly saves the cache only when it was `refreshed`), and `noise status` writes `noise_file=<path>` when the status parses.
- `noise status` without `--require` always exits 0; the gate decides.
- `guard` writes `masks_changed` and `engine_changed` to `GITHUB_OUTPUT` (the mutants job runs only when an engine change was detected).
- `images ensure` exits 2 when an image may not be judged, even when another was merely unobtainable.

You do not pin the harness from the monorepo: a `repository_dispatch` runs this repository's workflows as they are on `main`. Every report records what ran in `harness.version` and `harness.gitSha`; released versions are marked by `v<version>` tags, made by `tags.yml` ([release tags](#release-tags)). Check `schemaVersion === 1` before reading a report. Two reports are comparable only when their `harness.version` is the same.

## Permissions and artifacts

The only `write` scopes any workflow or job holds, all on **this** repository:

| Workflow | Job | Scope | Why |
| --- | --- | --- | --- |
| `nightly-noise.yml` | `publish` | `contents` | force-pushes the `noise` branch: `noise-status.json`, `noise-history.json`, `noise-summary.md` |
| `post-deploy.yml` | the workflow | `issues` | opens the `rollback` issue when post-deploy mode exits 1 |
| `release.yml` | `override-record` | `issues` | opens a `harness-override` issue for each applied override |
| `release.yml` | `publish-record` | `contents` | pushes the `release-records` branch |
| `main-preview.yml` | `publish` | `contents` | pushes the `main-preview` branch: each Main to RC forecast's report and scorecard |
| `release.yml` | `scoreboard` | `contents` | pushes the `scoreboard` branch: one line per release run |
| `weekly-mutants.yml` | `record` | `contents` | pushes the `scoreboard` branch: the week's mutants |
| `tags.yml` | `tag` | `contents` | creates `v<version>` tags |
| `pages.yml` | `deploy` | `pages`, `id-token` | deploys the kept reports to GitHub Pages; writes no branch |

No other branch, no tag but `v<version>`, no release, no other repository. A test lists these ([`workflows.json`](../contract/workflows.json) `writePermissions`) and fails on any other.

Artifacts, each the run's whole `out/` directory unless noted (so a report is at `<timestamp>-<mode>/report.json` inside it). Download one with `gh run download <run id> -n <name> -D out`:

| Artifact | Workflow | Retention |
| --- | --- | --- |
| `release-report` | `release.yml` | 30 days |
| `migration-report` | `release.yml` | 30 days |
| `upgrade-report` | `release.yml` | 30 days |
| `post-deploy-report` | `post-deploy.yml` | 14 days |
| `noise-status` (only `<timestamp>-noise/noise-status.json`) | `nightly-noise.yml` | 8 days |
| `noise-report` | `nightly-noise.yml` | 8 days |
| `mutant-reports` | `weekly-mutants.yml` | 14 days |
| `mutant-noise-report` (the A/A report of the base: `report.*`, `noise-status.json`, `capture.json`; only when the self-test failed) | `weekly-mutants.yml` | 7 days |
| `harness-ci` | `ci.yml` | 7 days |
| `main-preview-report` | `main-preview.yml` | 14 days |

The `noise`, `release-records`, `main-preview` and `scoreboard` branches carry what would otherwise expire: the noise status past its 8 days, the release record past 30, each Main to RC report past 14, and every release run's score for good.
