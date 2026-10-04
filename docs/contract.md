# The integration contract

Contract version: `1.28.1`

This is what `tutors-sdk/tutors-mono-repo` (or anything else) may build
against. Everything here is derived from the code, and
[`tests/contract.test.ts`](../tests/contract.test.ts) fails when the two
drift. What is not written here is not promised.

The machine-readable half lives in [`docs/contract/`](contract/):

| File | Describes |
| --- | --- |
| [`report.schema.json`](contract/report.schema.json) | `report.json` (JSON Schema, draft-07) |
| [`noise-status.schema.json`](contract/noise-status.schema.json) | `noise-status.json` |
| [`release-record.schema.json`](contract/release-record.schema.json) | the release record (since 1.3.0) |
| [`rules.schema.json`](contract/rules.schema.json) | `rules.json`, the Rules a claim may name (since 1.3.0) |
| [`release-status.schema.json`](contract/release-status.schema.json) | `status.json` of `harness release` (since 1.8.0, not stable) |
| [`confidence.schema.json`](contract/confidence.schema.json) | `confidence.json`, the Release Confidence Score (since 1.9.0, not stable) |
| [`changes.schema.json`](contract/changes.schema.json) | `changes.json`, the change signals between two tags (since 1.10.0, not stable) |
| [`scoreboard-line.schema.json`](contract/scoreboard-line.schema.json) | one line of `scoreboard/releases.jsonl`, the release scoreboard (since 1.11.0, not stable) |
| [`glance-marks.schema.json`](contract/glance-marks.schema.json) | one line of `glance-marks.jsonl`, the Reviewer's marks on the glance (since 1.12.0, not stable) |
| [`reports-index.schema.json`](contract/reports-index.schema.json) | `reports/index.json`, the kept reports of a branch (since 1.5.0; the schema since 1.16.1, not stable) |
| [`readiness.schema.json`](contract/readiness.schema.json) | `readiness.json`, the overnight readiness page (since 1.17.0, not stable) |
| [`quality-strip.schema.json`](contract/quality-strip.schema.json) | `quality` in `a3.json` and on each forecast of `readiness.json`: the quality strip (since 1.18.0, not stable) |
| [`release-control.schema.json`](contract/release-control.schema.json) | `control` in `readiness.json` and `releases.json`: the release-size control chart (since 1.19.0, not stable) |
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
harness 1.13.1 (3f2c…) · contract 1.13.1
$ pnpm harness version --json
{"version":"1.13.1","gitSha":"3f2c…","contractVersion":"1.13.1"}
```

`gitSha` is `git rev-parse HEAD` of the harness checkout, or the
`HARNESS_GIT_SHA` environment variable when set, or `null` when neither is
available (a tarball).

Which harness judged a run is recorded, not chosen by the caller: a
`repository_dispatch` runs this repository's workflows as they are on its
default branch (`main`), so a dispatch always gets the harness on `main` at that
moment. Every `report.json` and `capture.json` carries `harness.version` and
`harness.gitSha`, which name exactly what ran. Released versions are marked by
git tags `v<harness version>` on `main`. Since 1.7.0 `tags.yml` creates them: each
version is tagged on the first commit of `main` that carries it, when `package.json`
changes on `main`, and a tag is never moved or re-made (`scripts/release-tags.sh`;
`tests/contract.test.ts` keeps it that way). A version that never reached `main`
has no tag, and no workflow creates a GitHub release. To reproduce a run, check out its
`harness.gitSha`; to build against a released contract, read this file at the
tag. Check `schemaVersion === 1` before reading a report.

## Output directory

`harness run` writes `<--out, default ./out>/<UTC timestamp>-<mode>/`, e.g.
`out/2026-09-17T14-00-00-release/`:

| Path | Written by | Part of the contract |
| --- | --- | --- |
| `report.json` | every mode | yes — below |
| `report.md` | every mode | the file exists and is GitHub-flavoured Markdown starting with a `##` heading that carries the mode and the verdict; its wording and layout are for people and may change in a patch |
| `report.html` | every mode | the file exists and is self-contained (no scripts, no external requests); its content is for people |
| `noise-status.json` | `noise` mode only | yes — below |
| `release-record.json` | `release` mode only (since 1.3.0) | yes — [the release record](#the-release-record) |
| `confidence.json` | `harness confidence --run <this run>` (since 1.9.0), never `harness run` | not stable: [`confidence.json`](#confidencejson-the-release-confidence-score) |
| `a/capture.json`, `b/capture.json`, screenshots, `a/load/`, `b/load/`, and since 1.24.0 `a2/capture.json` (with `--a2`) | capturing modes | no. The harness reads its own captures back (`harness compare`, `--recorded`); nobody else should. Each `capture.json` carries the same `harness` stamp as the report |

`harness mutants --out <dir>` writes, since 1.11.0, `<dir>/mutants.json` beside its run
directories: `{ schemaVersion: 1, ranAt, base, caught, total, escaped, harnessVersion, note? }`,
`caught` counting the mutants caught **and** attributed (`null` when the A/A on the base was not
clean and no mutant ran). Not stable; `harness scoreboard mutants` reads it.

`harness compare --dir <run dir>` rewrites the three reports (and, in noise
mode, the status) in place.

Since 1.8.0 `harness release` also writes `<--out, default ./out>/<UTC
timestamp>-release-command/` beside the run directories of its steps (the
suffix is not `-release`, so it is never taken for a release-mode run). It is
written whatever happened, a stopped line or Ctrl-C included:

| Path | Part of the contract |
| --- | --- |
| `status.json` | not stable: [`release-status.schema.json`](contract/release-status.schema.json). Rewritten whole at every change: the stage running, each stage's `state`, `startedAt`, `elapsed` and `expected` seconds, where the line stopped (`stopped`: `stage`, `why`, `next`), and `exitCode` at the end |
| `report.md` | the file exists and starts with the gate (`## Release gate: …`, then `**Gate: <word>**`); with `--fast` the next line is the banner that it cannot be used for a go decision. Its wording is for people |
| `report.html` | the file exists and is self-contained; its content is for people |
| `gate.md`, `gate.json` | the combined gate summary `harness local gate` writes to `<timestamp>-gate/`; since 1.9.0 `gate.md` (and so `report.md`) has the RCS, its band and the dimension table right under the Gate |
| `confidence.json` | since 1.9.0, not stable: [`confidence.json`](#confidencejson-the-release-confidence-score), from the release, migration and upgrade runs. Absent when there was no release run to score (a stopped line before the A/B, Ctrl-C) or when the score could not be computed (the score stage says why) |
| `glance-marks.jsonl` | since 1.12.0, not stable: [`glance-marks.schema.json`](contract/glance-marks.schema.json), one line per mark `harness glance mark` records ([the reviewer's glance](#the-reviewers-glance)). Absent until the Reviewer marks an item. Since 1.12.0 `gate.md`, `report.md` and `report.html` carry the glance right under the RCS and its band, between `<!-- glance:start -->` and `<!-- glance:end -->`, which a mark re-renders in place |
| `kaizen/` | since 1.13.0, not stable: one [5 Whys](#the-5-whys-and-the-kaizen-register) stub per trigger that fired, `<date>-<tag>-<finding>.md` (`gate` for a Gate FAIL, `band` for a Red band, `<rule>:<series>` slugged for a run rule firing at this release, `countermeasures-rising`), Why 1 answered from this run's trace; and one for each glance item marked `escalated` (`harness glance mark`). Absent when no trigger fired, and for a `--fast` run. `report.md` and `report.html` list them under "5 Whys (kaizen)" with the register's open and overdue counts |
| `changes.json` | since 1.10.0, not stable: [`changes.json`](#changesjson-the-change-signals), written by the changes stage (`harness changes --a <baseline> --b <candidate>` in the monorepo checkout) and read by the score as change risk. Absent without a checkout (`--monorepo` or `HARNESS_MONOREPO_DIR`), or when `harness changes` could not run; the stage's note says which, and change risk is then not measured. Since 1.10.0 `gate.md` and `report.md` carry the per-PR table under the dimension table |

Since 1.11.0 `harness release` writes no new file here: after the score it appends the run's
[scoreboard line](#the-scoreboard) to `HARNESS_HOME/scoreboard/releases.jsonl` (or the file
`--scoreboard` names; never into the repository checkout unasked; a `--fast` run and a run with no
score are not appended), prints the line and any run rule firing after the RCS, and lists the same
lines in `report.md` and `report.html` under "Scoreboard".

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
| `sides` | `{ a, b }`, each `{ reader, catalogue, live, time? }` | the image reference of each app on each side (`time` since 1.3.0; absent from an earlier report). In migration mode `reader` is `migrations:<ref>` and the others `-`; in post-deploy mode `a` is the recorded candidate's images and each of `b`'s is `external:<URL>` (`-` for `time` when no `time=` URL was given) |
| `provenance` | `{ a?, b? }`, optional — since 1.1.0 | where each side's images came from; see [Image provenance](#image-provenance). A side is absent when it was not inspected: migration mode, the live side of post-deploy mode, a capture recorded before 1.1.0 |
| `imageArtefacts` | `{ a?, b? }`, optional — since 1.2.0 | per side, per app, whether each static image artefact (`manifest`, `sbom`, `vulns`) was collected, and for one that was not, why; see [Static image artefacts](#static-image-artefacts). A side is absent when its images were not inspected: migration mode, the live side of post-deploy mode, a capture recorded before 1.2.0 |
| `verdict` | `pass` \| `warn` \| `fail` | see [Verdicts and exit codes](#verdicts-and-exit-codes) |
| `reasons` | string[] | why, one line each. For people: **do not parse** |
| `noise` | noise status, optional | the status consulted for the gating decision; absent when `--noise` was not given or was `skip`. Carries `degraded` when the status did |
| `compare.hunks` | Hunk[] | every difference, failing and informational |
| `compare.matches` | `{ hunk, claim? }[]` | one per hunk, with the claim that covers it, if any. Since 1.15.0 an info hunk a claim names carries that claim too (a fix on b is a decision; the claim is its why); it never gates |
| `compare.unclaimed` | Hunk[] | failing hunks no claim covers — what gates |
| `compare.staleClaims` | Claim[] | claims that matched no hunk, failing or info (before 1.15.0: no failing hunk); reported, never gate |
| `compare.broadUnapproved` | Claim[] | broad claims without `approvedBy`; gate in `release` and `post-deploy` |
| `masksApplied` | `{ [maskId]: integer }` | how often each mask in `normalise/masks.yaml` changed something, both sides summed; `0` is a silent mask |
| `migration` | optional | migration mode only: `{ a, b, rolledBack }`; `a`/`b` are `{ ref, files[], catalog }`, a catalog is `{ tables: { [table]: { [column]: { type, nullable, default } } }, indexes[], functions[], policies[] }` |
| `upgrade` | optional | upgrade mode only: `{ substrate, requests, failed, serverErrors, byUpstream: { [side]: { requests, failed, serverErrors, p95 } }, switchedAt, durationMs }`; times in ms |
| `load` | optional | when `--load` ran on both sides: `{ a, b }`, each `{ requests, failed, serverErrors, p50, p95, rate, duration }` |
| `claimHygiene` | optional — since 1.2.0 | present when the claims file had claims; see [Claim hygiene](#claim-hygiene). Informational: never changes the verdict |
| `override` | optional — since 1.2.0 | present only when an override of a FAIL was requested; see [Overriding a FAIL](#overriding-a-fail) |
| `deployment` | optional — since 1.3.0 | post-deploy mode, when the deploy reported what it deployed: `{ production?, status, digests, recorded?, record?, problems[] }`, the deployed digests against the release record; see [Checking a deployment](#checking-a-deployment). Advisory: a `status` other than `match` turns a `pass` into a `warn` and never touches a `fail` |
| `productionBuild` | optional — since 1.6.0 | post-deploy mode only: `{ url, status, recordedRevision?, buildName?, builtAt?, revision?, summary }`, which build production's reader says it serves against the recorded candidate's commit; see [Which build production serves](#which-build-production-serves). Informational: never changes the verdict and is never a hunk |
| `levels` | optional — since 1.21.0 | `{ [engine]: { level, blockingFrom? } }`: every engine's level on this run, by engine (its artefact), `blocking` or `informing`, and for an informing one the UTC date (`YYYY-MM-DD`) it becomes blocking when one is set; see [Engine levels](#engine-levels). Absent from a report written before 1.21.0, in which every engine was blocking |
| `inRunNoise` | optional — since 1.24.0 | `{ stack: "a2", runs, artefacts, journeys, hunks: [{ artefact, scope, summary }], alsoOnB: [hunk id] }`: with `--a2`, side a against a second production stack started in the same run; see [In-run noise: side a2](#in-run-noise-side-a2). Never read by the verdict |
| `causes` | optional — since 1.20.0 | `{ unclaimed, causes[], together[] }`: the unclaimed differences folded into causes, computed after the verdict when the report is written; see [Causes](#causes). Informational: never read by a verdict or the Gate |

**Hunk**: `{ id, artefact, scope, path?, summary, detail?, severity, level?, blockingFrom? }`.
`artefact` is one of `dom`, `screenshot`, `network`, `console`, `headers`,
`axe`, `focus`, `metrics`, `logs`, `timing`, `persistence`, `bus`, `migration`,
`upgrade`, `image-manifest`, `sbom`, `vulns`, `runtime`, `startup`, `image-hardening`,
`build-provenance`, `vuln-ceiling`, `timing-tolerance`, `asset-graph`, `replay`. `bus` and `image-manifest` to `startup` are since 1.2.0;
`image-hardening` to `vuln-ceiling`, the policy family, since 1.22.0 (see [The policy family](#the-policy-family));
`timing-tolerance` since 1.26.0 (see [The timing tolerance](#the-timing-tolerance)); `asset-graph` since
1.27.0 (see [Asset-graph folding](#asset-graph-folding)); `replay` since 1.28.0 (see [The replay set](#the-replay-set)) (see [Static image artefacts](#static-image-artefacts)
and [Container runtime artefacts](#container-runtime-artefacts)); a consumer
must tolerate an artefact name it does not know. `severity` is `fail` (gates unless claimed) or `info` (reported,
never gates). `scope` and `path` are what a claim's glob is matched against.
`id` is stable for the same difference within a run; do not rely on it across
harness versions. `summary` and `detail` are for people. `level` (since 1.21.0) is
`informing` on a hunk its engine would have failed had the engine been blocking: its
`severity` is then `info`, so it never gates, and `blockingFrom` carries the date its
engine becomes blocking when one is set; see [Engine levels](#engine-levels).

The `bus` artefact (since 1.2.0) is the topics a side published to during a
journey, under the same two rules as `persistence`. It is produced only when
bus traffic was collected on both sides, which needs a bus and
`HARNESS_BUS`; until then no hunk carries it and no report changes. See
[bus.md](bus.md). The environment variables `HARNESS_BUS` and
`HARNESS_PERSISTENCE_BACKEND` are not part of the contract.

**Claim**: `{ artefact, scope, reason, approvedBy?, rule?, ruleTitle? }`, as parsed from
the claims file. `reason` is always a string: for a claim that named a `rule` and
gave no reason, the harness writes `Rule NNNN: <title>`. `rule` and `ruleTitle`
(since 1.3.0) are present exactly when the claim named a Rule; see
[Claims file](#claims-file).

### Image provenance

Since 1.1.0. `provenance.a` and `provenance.b` are each
`{ summary, allowedUnsigned?, images: { reader, catalogue, live, time? } }`, and each
image is:

| Field | Meaning |
| --- | --- |
| `ref` | the reference as given or expanded; the same string as in `sides` |
| `provenance` | `local` \| `pulled+verified` \| `pulled-unverified` \| `built-from-ref` \| `cached` — below |
| `id` | local image id (`sha256:…` of the config) |
| `digest` | registry digest of the manifest (of the index, for a multi-arch image), `sha256:` + 64 hex. **Only for a pulled image** |
| `revision`, `version`, `created` | the image's `org.opencontainers.image.*` labels, as the image states them; absent when unlabelled |
| `verifiedIdentity` | `pulled+verified`: the certificate-identity regular expression the signature was checked against |
| `unverifiedReason` | `pulled-unverified`: why verification failed. For people |
| `builtFrom` | `built-from-ref`: `{ ref, sha? }`, the monorepo git ref and the commit it resolved to |
| `cachedAt` | `cached` (since 1.2.0): ISO instant the cache entry was saved, i.e. the earlier run that pulled and verified the image |

| `provenance` | Means |
| --- | --- |
| `local` | present on the machine and never pulled (a `docker compose build`, a mutant). Not verified, by design |
| `pulled+verified` | pulled from a registry, and `cosign verify` succeeded **by digest** against `verifiedIdentity` and the OIDC issuer |
| `pulled-unverified` | pulled, not verified, and judged only because `--allow-unsigned` was given. `allowedUnsigned: true` is set on the side |
| `built-from-ref` | built on this machine from `builtFrom.ref` because the registry had no such tag. Not the image that ships |
| `cached` | since 1.2.0. Restored from the runner's image cache (`images ensure --image-cache`) because the registry could not be reached: an outage, a rate limit. The image was pulled and verified on the earlier run named by `cachedAt`, but the tag may have moved since. Judged, and the run says so in `reasons`; a **noise** run on it is `degraded` |

`summary` is one line for people (`pulled+verified`,
`built-from-ref v16.2.0@1a2b3c4d5e6f`, or each app spelled out when they
differ): do not parse it. A consumer deciding whether a run is evidence for a
release checks that every `images.*.provenance` on both sides is
`pulled+verified`. A side that is `pulled-unverified`, `built-from-ref` or `cached` also
adds a line to `reasons`; it does not change the verdict.

What a consumer can rely on: `verdict`, `provenance.*.images.*.provenance` and
`.digest`, `compare.unclaimed.length`,
`compare.broadUnapproved.length`, `compare.staleClaims`, the `artefact`,
`scope`, `path` and `severity` of each hunk, `sides`, `harness`, and the
numbers under `migration`, `upgrade` and `load`.

### Static image artefacts

Since 1.2.0. Three artefacts describe what the two sides' images *are*,
collected from the images themselves (before the stacks start), not from the
running apps. Each is per app (`reader`, `catalogue`, `live` and, since 1.3.0, `time`); a hunk's
`scope` starts with the app.

| `artefact` | Collected from | `scope` | A hunk means |
| --- | --- | --- | --- |
| `image-manifest` | `docker image inspect` | `<app>/base`, `/platform`, `/user`, `/ports/<port>`, `/entrypoint`, `/cmd`, `/layers`, `/size`, `/label/<key>` | built FROM a different base (the `org.opencontainers.image.base.digest` label when the build sets it, and the lowest layer always); now runs as root, or another USER; a port added or removed; entrypoint or cmd changed; a different layer count; size grown by at least 10% and 5 MB (shrinking is informational); an OCI label other than `revision`, `version`, `created` changed |
| `sbom` | the SPDX SBOM: the attestation cosign attached to a pulled image (`cosign verify-attestation --type spdxjson` against the same identity and issuer as the signature check, by digest), or generated locally (`HARNESS_SBOM_SOURCE=generate`) | `<app>/<package name>` | a package added, removed or bumped: a set diff over `name@version`. The package the SBOM describes (the image itself) is left out |
| `vulns` | the SBOM, scanned by a pluggable scanner with its database pinned (grype by default, trivy by command) | `<app>/<advisory id>`, or `<app>/db` | a vulnerability **new on b** (fail); one that was on a and is gone on b (`info`); the two sides scanned with different scanner versions or databases (fail, and the diff is not to be trusted) |

**Not collected, never silent.** An image built locally has no attestation; a
scanner or generator may not be installed; an SBOM may be for another digest.
None of that is reported as "no difference". The report carries:

- `imageArtefacts.<side>.<app>.<manifest|sbom|vulns>` = `{ collected: false, reason }`;
- a line in `reasons` starting `NOT COLLECTED:`;
- a hunk `<app>/not-collected` under the artefact that could not be compared:
  informational, and failing when the artefact is required
  (`HARNESS_REQUIRE_ARTEFACTS=sbom`, `=static` for all three, or the older alias
  `HARNESS_REQUIRE_STATIC=1`), which is what a release pipeline that must not
  pass without an SBOM diff sets. The convention is the same for every artefact,
  see [Not collected](#not-collected-one-convention).

The vulnerability scan needs the SBOM; with no SBOM it is not collected either.
A side without `imageArtefacts` (an external side, migration mode) is not
compared at all.

Claims name these artefacts like any other, e.g. `artefact: sbom`,
`scope: "reader/@sveltejs/kit"`; see [`claims/README.md`](../claims/README.md).

### Not collected: one convention

Since 1.4.0, one rule for every artefact whose collector can come up empty
(`image-manifest`, `sbom`, `vulns`, `runtime`, `startup`, `bus`); it lives in
`src/not-collected.ts`.

| | |
| --- | --- |
| Text | `NOT COLLECTED: <what>[ of <app>][ on side <a or b>, or on both sides]: <reason>`, in a hunk's `summary`, in `reasons` (static artefacts) and in the run log |
| Hunk | the artefact's own `artefact`; `scope` `<app>/not-collected`, or `<artefact>/not-collected` when the whole artefact is missing (`runtime/not-collected`, `startup/not-collected`, `bus/not-collected`) |
| Severity | informational, unless the artefact is **required**, and then `fail`; always informational when an operator switched the artefact off (`--no-runtime`, `--startup-restarts 0`) |
| Required | `runtime` and `startup` always (their collectors run against the stacks the harness started, so a gap is a fault); and what `HARNESS_REQUIRE_ARTEFACTS` lists, with `HARNESS_REQUIRE_STATIC=1` as an alias for `static` |

The artefacts that depend on a tool that may legitimately be absent from a
developer's machine (`syft`, `grype`, an SBOM attestation, a message bus) are
therefore informational until a pipeline requires them. `bus` is the one that adds
no hunk while it is informational: no bus exists yet, and a hunk on every report
would change every report; it stays a run-log line and a `capture.json` field
until `HARNESS_REQUIRE_ARTEFACTS` includes it, and is never asked of a live
deployment. Like any other hunk, a not-collected one is claimed with `artefact` and
a scope glob (`runtime`, any app, `/not-collected`).

### Container runtime artefacts

Since 1.2.0. Two artefacts describe what the containers *are* rather than what
the apps do. They add no field to `report.json`: their findings are hunks with
`artefact` `runtime` or `startup`, claimable like any other, and what was captured is
recorded in each `capture.json` (not part of the contract).
Both are collected after everything else on each side that the harness started
(never on a live deployment, so never in post-deploy mode), on the compose
and the kind substrate.

| Artefact | Scope of a hunk | What is compared |
| --- | --- | --- |
| `runtime` | `<app>/<field>`, `app` being `reader`, `catalogue`, `live`, `time` (since 1.3.0; and `reader-auth` under compose) | exact match of each container's declared posture (configured user, privileged, read-only root filesystem, capabilities added and dropped, security options, writable mounts, memory/cpu/pids requests and limits — `docker inspect` under compose, the pod spec under kind) and measured posture (effective UID and GID, effective and bounding capabilities, no-new-privileges, seccomp mode, root filesystem mounted `ro`, /tmp and the working directory writable — a process started inside the container reading /proc). Fields: `user`, `run-as-non-root`, `privileged`, `read-only-rootfs`, `cap-add`, `cap-drop`, `security-opt`, `writable-paths`, `memory-request`, `memory-limit`, `cpu-request`, `cpu-limit`, `pids-limit`, `uid`, `gid`, `cap-effective`, `cap-bounding`, `no-new-privileges`, `seccomp`, `rootfs-mounted-ro`, `tmp-writable`, `cwd-writable` |
| `runtime` | `<app>/writes-outside-tmp` | the app logged a read-only filesystem error (`EROFS`) on b and not on a: with a read-only root and a tmpfs /tmp, that is a write outside /tmp |
| `startup` | `<app>/root`, `<app>/ready` | time from the start command to the first response to `GET /` with a status below 500, and to the orchestrator's ready verdict (compose healthcheck healthy; pod Ready), over `--startup-restarts` restarts of the same container (kind: scale to zero and back, so no old pod answers), Mann-Whitney U like `timing` (`timing.minRuns`, `timing.alpha`, `timing.minEffect`, and `startup.minShiftMs` in `normalise/masks.yaml`) |
| `startup` | `<app>/boot`, `<app>/root-status` | b failed to become healthy within the timeout in more restarts than a; `GET /` answers a different status after a restart |

Severity. A difference is `fail`, except that a change which only *tightens*
the posture (root to non-root, a writable root filesystem to a read-only one,
fewer capabilities, privileged to unprivileged, an EROFS error fixed, a faster
startup) is `info`. Two absolute rules apply as the anonymous-write rule does
for persistence: b running as root, with a writable root filesystem, or unable
to write /tmp is called out in the hunk; the same fault on both sides is an
`info` hunk (a product finding, not a release diff). A startup that cannot be
judged, because the samples are too few to ever reach alpha, is `info` and says
that more restarts are needed.

**Never silent.** An artefact that could not be collected — no such container,
`docker` or `kubectl` missing or failing, the in-container probe unreadable,
a restart that could not be driven — is a `fail` hunk with scope
`runtime/not-collected`, `startup/not-collected` or `<app>/not-collected` and a
summary of the form `NOT COLLECTED: <what> …: <reason>`. It gates like any unclaimed
difference, and is claimed like one (`artefact: runtime`, `scope:
"*/not-collected"`, a reason a reviewer can weigh). An operator's choice
(`--no-runtime`, `--startup-restarts 0`, and always `--startup-restarts 0` in
`upgrade` mode and in the `mutants` self-test) is `info` and says so. A capture
recorded by a harness older than 1.2.0 has neither field; against a capture that
has them it counts as not collected.

Informational `runtime/summary` and `startup/summary` hunks list what was
collected (per app, both sides), so a report that found nothing still shows what
it looked at. The startup restarts leave every app running.


### Causes

Since 1.20.0 every report carries `causes`: the unclaimed differences folded by kind across apps,
pages and packages (`src/report/causes.ts`), so 899 differences read as the 19 changes behind them.
It is computed from `compare.unclaimed` after the verdict, when the report is written, and nothing
that judges reads it: no verdict, Gate, score or exit code changes.

A **cause** is an artefact and a kind. The kind is the hunk's summary with its app or page prefix
taken off (`reader:home: `), the name it ends in folded into `items` (`package removed:
@isaacs/cliui@8.0.2` is `package removed`, the package an item), hashed build assets
(`{{hash}}` in a route) folded into one `{{asset}}`, and every number masked (`#`). A network
request keeps its route unless it is a hashed build asset: a new `/logo.svg` is a cause of its own.
Each cause carries `id` (8 hex characters of sha256 of `key`, the same in every report), `key`
(`<artefact>: <kind>`), `artefact`, `kind`, `hunks`, `apps` (reader, catalogue, live, time, in that
order), `pages` (`app:page`), `items` and `example` (the first hunk's `id`, `scope` and
`summary`). Causes are listed biggest first; their `hunks` add up to `unclaimed`.

`together` lists the pages on which two or more artefacts moved, grouped by the same set of
artefacts (`dom`, `focus`, `network`, `screenshot` on 16 pages): likely one change each, to be
claimed together. `report.md` and `report.html` lead their differences with the cause table
("899 unclaimed differences, 19 causes") and these groups. The wording of `kind` follows the
engines' summaries and may change in a patch; `key` is stable within a harness version.

### Engine levels

Since 1.21.0 every engine has a level (`src/compare/levels.ts`, `ENGINE_LEVELS`): **blocking**,
whose failing hunks gate as they always have, or **informing**, whose findings are reported and
never gate. An engine is named by its artefact, the word claims and masks already use. An
informing engine may carry `blockingFrom`, a UTC date: from that date on it is blocking, with no
harness release in between. The level a run used is the one on its `ranAt`.

A hunk an informing engine would have failed is written with `severity: info`, `level:
informing` and its `blockingFrom`, so no verdict, Gate, exit code or A/A count reads it; it is
not in `compare.unclaimed`. It is still claimable: a claim that names it is recorded in
`compare.matches` as matching it, as for any informational hunk, and is not stale. `report.html`
and `report.md` list these results under **Informing** ("reported, never gates") with each
engine's level, and `report.json` records every engine's level in `levels`. The readiness page
shows the unclaimed informing results of each kept forecast beside its Gate, labelled
"informing", and in a tile of their own on the latest forecast.

Every diff engine is **blocking**, so a run decides exactly what it decided before 1.21.0. A
new engine or check ships informing, with the date it starts to block when there is one, and is
watched on the readiness page before it may stop a release: since 1.22.0 the three checks of
[the policy family](#the-policy-family) are informing, with no date set, since 1.26.0
[the timing tolerance](#the-timing-tolerance), since 1.27.0 [asset-graph folding](#asset-graph-folding), and since 1.28.0 [the replay set](#the-replay-set). An engine missing from
the table is blocking: no check escapes the Gate by being left out.

### The policy family

Since 1.22.0 a second kind of check judges the candidate alone (`src/compare/policy.ts`): not
"b equals a" but "b must". Its results are hunks beside the diff, under the same Gate and
claimable the same way (artefact and scope), and all three checks are **informing**: a finding is
reported and never gates ([Engine levels](#engine-levels)). Only side b is judged; each finding
ends "(production too)" when side a, judged the same way, has it, or "(new on b)", so a fault on
both sides is visible, which no diff can show.

| Artefact | Scopes | A finding when b's image | Reads |
| --- | --- | --- | --- |
| `image-hardening` | `<app>/user`, `<app>/healthcheck`, `<app>/env/<NAME>`, `<app>/history/<NAME>` | runs as root; declares no `HEALTHCHECK` (unset, empty or `NONE`); has an environment variable, or a build argument or command in its layer history, that looks like a secret | the image config the manifest engine collects (`docker image inspect`), and `docker image history --no-trunc` |
| `build-provenance` | `<app>/slsa`, `<app>/builder`, `<app>/unverified` (since 1.25.0) | carries no SLSA provenance verified under the publishing identity; or one whose builder and workflow do not name `image-build.yml`; or (since 1.25.0) was not pulled and signature-verified in this run at all (`local`, `built-from-ref`, `pulled-unverified`), so it cannot carry any | `cosign verify-attestation --type slsaprovenance1`, then `slsaprovenance`, on the digest, with the same identity and issuer as its signature and SBOM attestation (`HARNESS_COSIGN_IDENTITY`, `HARNESS_COSIGN_ISSUER`) |
| `vuln-ceiling` | `<app>/<advisory id>` | has a critical or high advisory with a fix available, whether or not production has it | the vulnerability scan already run on b (`vulns`) |

What looks like a secret (`src/image-static/secrets.ts`): a variable whose name says it holds one
(`PASSWORD`, `SECRET`, `TOKEN`, `API_KEY`, `ACCESS_KEY`, `PRIVATE_KEY`, `CREDENTIALS` and the
like, as a whole word) and has a value, or a value shaped like an AWS access key id, a GitHub,
GitLab, Slack or npm token, a Stripe live key, a private key or a JSON web token under any name.
SvelteKit's `PUBLIC_` variables are public by design and only a token-shaped value in one is
flagged. Names and reasons are kept; **a value is never stored, logged or reported**. File
contents inside the layers are not read.

Every app also gets an informational `<app>/summary` hunk saying what was checked, or
`<app>/not-evaluated` saying why it could not be (a `cached` image, verified when it was pulled,
whose attestations were not asked for in this run; a capture recorded before 1.22.0 has no
healthcheck, environment or provenance; before 1.25.0 also any image not pulled and verified in the
run, which is now the `unverified` finding), so a quiet check reads differently from one
that did not run. `report.html` and `report.md` show a **Policy** table, one row per app and one
column per check, under the differences; the findings are listed under Informing. The readiness
page's informing count is broken down by engine (`informingBy`).

The capture (not `report.json`) gains, per app, the manifest's `healthcheck`, `secretEnv` and
`secretHistory` (names and reasons only) and `buildProvenance` (the verified SLSA statements:
predicate type, builder and workflow). The manifest engine compares none of them, so no diff moves.

Since 1.25.0 each check has a **planted mutant** in `mutants/mutants.yaml`: `secret-env`
(image hardening), `vulnerable-package` (the ceiling) and `unsigned-build` (build provenance).
While a check is informing, `harness mutants` counts its mutant caught and attributed when the
check reports a finding whose scope it did not report on the base in the self-test's own A/A;
the day the check is blocking, the mutant must FAIL the run like any other. `mutants.json` (and
the line `harness scoreboard mutants` appends) gains `planted`, every mutant run by name, and
`byInforming`, those caught only by an informing check.

### The timing tolerance

Since 1.26.0 (runway improvement D) the timing engine's samples are judged a second time, by
`timing-tolerance` (`src/compare/tolerance.ts`). `timing` says "slower" when Mann-Whitney is
significant at `timing.alpha` and the median moved by at least `timing.minEffect` (20%). A
significant slowdown under that floor is not reported at all, so nothing separates "slower" from
"slower and it matters". The tolerance draws that line at `TIMING_TOLERANCE`, **10%** of a's
median.

| Artefact | Scopes | A finding when | Reads |
| --- | --- | --- | --- |
| `timing-tolerance` | timing's own: a page key (its TTFB), a journey (its duration), `load/http_req_duration` (the k6 leg's p95) | the slowdown is significant (p below `timing.alpha`, at least `timing.minRuns` samples a side, and samples that can reach alpha), at least 10% of a's median, and at least `timing.minShiftMs` | the same samples as `timing` |

A finding says whether `timing` fails it too (at or over its floor) or only the tolerance reports
it (between 10% and the floor). It also says the smallest slowdown the samples could have
detected. A significant slowdown under 10% is **within tolerance** and is not a finding. The check
is **informing**, with no date ([Engine levels](#engine-levels)): every finding is reported and
none gates, and the readiness page's soak watches it beside the policy family. At 2.0 it becomes
blocking: a significant slowdown of 10% or more then fails a release, where today it takes 20%.
Its planted mutant is `slow-ssr-mild` (150 ms on every HTML response).

### Asset-graph folding

Since 1.27.0 (runway change 9), `asset-graph` (`src/compare/asset-graph.ts`) handles build churn.
A change to how an app is chunked repeats on every page: the hashed JS chunks and CSS under
`/_app/immutable/` are requested more or fewer times, appear or go, and the document's `link`
preload header changes with them. On the 2026-10-01 forecast that was 79 of 85 `network` hunks
and all 8 `headers` hunks. The check folds it into **one hunk per app**, scope `<app>` (e.g.
`reader`). The hunk gives the immutable requests a to b (JS and CSS, from run 1 of the pages both
sides reached), their bytes when every response sent a `content-length`, and how many `network` and
`headers` differences are this churn.

| What is churn | What is not |
| --- | --- |
| a `network` hunk for a request under `/_app/immutable/` that was made more or fewer times, or on one side only | the same request answering with another status, content type, cache header or schema; any request outside `/_app/immutable/` |
| a `headers` hunk on `<page>/link` whose links, on both sides, all point under `/_app/immutable/` | any other header, or a `link` header naming anything else |

The check is **informing**, with no date ([Engine levels](#engine-levels)). Its hunk is reported and
never gates, and `network` and `headers` are exactly as they were, so each churn hunk still needs
its claim. At 2.0 it becomes blocking. Each failing churn hunk then becomes information ending
"(folded into asset-graph)", and the app's one `asset-graph` hunk is what gates: one claim on
`<app>` covers a re-chunking. Its planted mutant is `extra-chunk` (every page loads one more chunk).
The capture's network entries gain `bytes` (the response's `content-length`, when sent). No engine
diffs it.

### The replay set

Since 1.28.0 (runway improvement G) a fourth journey set, `replay`, gives breadth without new
journeys to write. Its one journey, `replay-course-urls` (anonymous, read-only), opens each URL of
a fixed list (`traffic/replay/urls.ts`) directly on both sides. It runs once (run 1 of `--runs`) and
takes no screenshot, axe scan or focus walk. The list starts with the pinned fixture course: the
second topic, a talk, both notes, a step of the second lab, and a topic that does not exist. Page
keys are `replay:<key>`. `--set` takes `replay`, and it is in the default.

The `replay` artefact (`src/compare/replay.ts`) compares those pages on **status, headers and
network only**, with the words of `network`, `headers` and journey outcomes, relabelled `replay`:

| Scope | A finding when |
| --- | --- |
| `replay:<key>/<header>` | a document header was added, dropped or changed |
| `replay:<key> <METHOD> <route>` | a request appeared, went, was made a different number of times, or its status (the document's among them), content type, cache header or schema changed |
| `replay-course-urls` | the journey failed on b only |

No other engine sees replay pages, so they add no `dom`, `screenshot`, `console`, `timing` or
`persistence` hunks. The glance and the scoreboard's journey counts leave the set out, and the set
failing on both sides does not degrade an A/A. The check is **informing**, with no date
([Engine levels](#engine-levels)). The runway puts G after 2.0, so it is the last to be promoted.
Its planted mutant is `replay-header`: `X-Content-Type-Options` dropped on `/note/` pages, which
only the replay set opens on the fixture course.

## Verdicts and exit codes

| Exit code | Meaning |
| --- | --- |
| `0` | Verdict pass or warn, or a fail overridden with --override-reason; or the command succeeded |
| `1` | Verdict fail that was not overridden; or images ensure could not obtain an image, or mutants or kind rollout did not succeed; or doctor found a tool a run needs missing, noise record found the ratchet broken, noise status --require found a status that does not license a FAIL, or guard found a violation |
| `2` | Usage error, the harness itself failed (an uncaught error), or an image may not be judged; no verdict was reached |

"An image may not be judged" (since 1.1.0) is: at `run`, an image that is not
present locally (run `harness images ensure` first — the harness never lets
compose pull one unverified); at `run` or `images ensure`, a registry image
whose cosign signature is missing, is by another identity, or cannot be checked
because cosign (≥ 3) is not installed. The reason is printed to stderr after
`cannot judge:` (`run`) or `ERROR:` (`images ensure`). `images ensure` still
exits `1`, as in 1.0.0, when an image is simply not obtainable — not in the
registry and not buildable from a git ref; `2` wins when both happen.

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
mode. A "failing hunk" is one with `severity: fail`; since 1.21.0 an informing engine's findings
are `info` ([Engine levels](#engine-levels)) and never count.

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
| `degraded` | optional, since 1.2.0: a non-empty list of reasons the evidence is weak even at `hunks: 0` — an image was not pulled and signature-verified in the run (a registry outage was survived from the runner's cache, or the images were built or already present locally; written only with `--require-verified`, which the nightly always passes), or, since 1.5.0, a journey failed on both sides, so the run saw nothing of its pages (written by every `noise` run). Absent or empty means nothing was wrong. `clean` keeps its meaning (`hunks` is `0`); the gate additionally refuses a status that has `degraded` |

`--noise <path>` takes the file, or a directory containing it (the noise run's
output directory). A file that is not exactly this shape stops the run with
exit `2` — it is never read generously.

**Where a run looks for a status** (since 1.3.0: the default source is the local
store). `release` and `post-deploy` mode resolve `--noise` in exactly this order,
first match wins, and look nowhere else:

1. **`--noise <file or dir>`** as given. It is used as it is: a status that is dirty,
   stale or unreadable there is never replaced by a better one from the store.
   `--noise skip` waives the requirement, loudly (below). `--noise none` says do
   not look: no store is read and the run has no status.
2. **`--noise` omitted: the latest status in the local store**,
   `<HARNESS_HOME>/noise/noise-status.json` (`HARNESS_HOME` defaults to
   `<checkout>/.harness`), which `harness noise record` and `harness local
   nightly` write. A file there that is not a valid status is ignored with a
   logged warning, as the workflows' fetch ignores one, and the run goes on as if
   there were none.
3. **none**: no status was supplied.

Every other mode never reads a status. The store is not a second rule: whatever it
yields goes to the same gate, so a status from it licenses a `fail` only when it
is clean, without `degraded`, and no more than 7 days old, exactly like one from
the `noise` branch. A **missing** status (step 3, or an unusable one in step 2) still
**warns**, as before: same findings, `warn`, exit `0`, first reason
`advisory only: no A/A …`. The workflows are unchanged by this: they fetch the
`noise` branch into `noise/` and pass `--noise <file>` when it is usable, so step 1
applies on a runner and the store under `.harness` is never consulted there.

**The A/A rule.** `release` and `post-deploy` may return `fail` only when one
of these holds:

- a status was supplied, `clean` is `true`, it has no `degraded` (since 1.2.0),
  and `ranAt` is no more than 7 days before the judging run's `ranAt`
  (`--noise-max-age-days`, default 7, not a stable flag);
- `--noise skip` was given — an explicit waiver, logged to stdout. The report
  then has no `noise` field.

Otherwise the same findings come back as `warn`, exit `0`, and the first
reason starts `advisory only:` and says which condition failed. The
`nightly-noise.yml` workflow publishes the status twice: as the `noise-status`
artifact (8 days' retention), and, since 1.2.0, to the `noise` branch of this
repository, which is where `release.yml` and `post-deploy.yml` read it. The
branch holds the **latest** night's status, clean or not: a clean night from
last week never stands in for a dirty one since. The fetch drops a file that is
missing or not a valid status, with a warning, and the run degrades to `warn`;
whether a valid one is fresh and clean is only ever the gate's decision, so the
7-day rule is applied in one place.

The `noise` branch (`noise-status.json`, `noise-history.json`,
`noise-summary.md`) is force-pushed by the nightly and by nothing else; see
[`noise-burndown.md`](noise-burndown.md).

Not checked: a `ranAt` in the future is trusted (its age is negative).

### In-run noise: side a2

Since 1.24.0, not stable. `harness run --mode release --a2` (compose only) also starts **side
a2**: side a's four app images again, as a compose profile (`reader-a2`, `catalogue-a2`,
`live-a2`, `time-a2` on host ports 3400, 3401, 3402 and 3404; anonymous apps only, so no signed-in
reader and no persistence stub). After a and b, a2 is captured **once**, with no load and no
screenshots, and compared with a's run 1 for the deterministic artefacts only: `dom`, `network`,
`console`, `headers`, `axe` and `focus`. Timing, screenshots, metrics, logs and load need the
repeated runs and the nightly A/A; the images are a's on both, so the static artefacts are equal by
construction.

A difference between a and a2 is the harness's own noise, measured in this run on these images. An
a/b difference with the same artefact and scope as one of them is **noise by measurement**.
`report.json` carries both as `inRunNoise` (`hunks`, and `alsoOnB`, the a/b hunk ids), and
`report.html` and `report.md` say it on the line after "A/A consulted". **It is reported, never
judged**: no verdict, Gate, exit code, count or claim reads it, and the A/A above stays the noise
reference. Replacing that reference with a2 is a 2.0 decision, after nights of clean a-to-a2.

a2's capture is kept in `a2/capture.json`, and `harness compare --dir` reports the same in-run noise
from it. Any other mode or substrate logs that `--a2` was dropped. The cost is four containers and
one capture of the anonymous journeys. `main-preview.yml` ran it only when dispatched with
`a2: true` in 1.24.0 ([releases/1.24.0.md](releases/1.24.0.md)); since 1.25.0 it runs it every
night and by default, because the soak toward 2.0 counts nights with a clean a-to-a2
([the readiness page](#the-overnight-readiness-page)).

## Claim hygiene

Since 1.2.0. When the claims file has claims, `report.json` carries
`claimHygiene`, and the Markdown comment and HTML report a "Claim hygiene"
section:

| Field | Meaning |
| --- | --- |
| `claims` | claims in the file, stale ones included |
| `claimedHunks` | failing hunks covered by some claim |
| `hunksPerClaim` | `claimedHunks / claims`, two decimals |
| `maxHunksPerClaim` | the most failing hunks any one claim covers |
| `threshold` | N: `--claim-max-hunks`, else `HARNESS_CLAIM_MAX_HUNKS`, else `10` |
| `flagged` | `{ claim, hunks, flags[] }`; `covers-many-hunks` when `hunks` exceeds `threshold`, `broad-with-approval` for a broad claim (artefact `*`, scope `**`) that a human approved |

It is a smell detector and never gates: the gate's rule for a broad claim
(`approvedBy` or it fails) is unchanged. Routine use of `broad-with-approval`,
or a claim that swallows many hunks, is the sign that claims have become a
checkbox.

## Overriding a FAIL

Since 1.2.0. A bypass in GitHub's branch protection is invisible to the
harness, so the supported way past a FAIL is to say so to the harness:

```console
$ pnpm harness run --mode release … --override-reason "Rule 0044: payments hotfix, frame options restored in 16.3.1" --override-by leigh
```

- both flags are required together; the reason must be at least 20 characters
  and not a rubber stamp (`ok`, `lgtm`, `approved`…), or the run exits `2`;
- the **verdict stays what the harness decided**. When it was `fail`, the exit
  code is `0` instead of `1` and `report.json` gets
  `override: { reason, by, verdict, applied: true, at }`. When it was not,
  `applied` is `false`, so an unneeded override never looks like a bypass;
- the reason and the person are the first `reasons` entry, and in the Markdown
  comment and the HTML report;
- in `release.yml`, only a person dispatching by hand can do this
  (`override_reason`; the actor is `github.triggering_actor`); a
  `repository_dispatch` payload cannot. The `override-record` job then opens a
  `harness-override` issue in this repository for each applied override. The
  quarterly count of those issues, against the FAILs the harness issued, is the
  measure of whether the harness is trusted or tolerated
  ([`noise-burndown.md`](noise-burndown.md#overrides)).

## Image digests and the release record

Since 1.3.0. A tag can move between the moment the monorepo builds an image and
the moment the harness pulls it, and a deployment can run something other than
what release mode judged. Three additions close both gaps, and every one of
them is optional: a dispatch without them behaves exactly as in 1.2.0.

### Digests in the dispatch

`release-candidate` may carry `production_digests` and `candidate_digests`:
objects `app -> "sha256:<64 hex>"`, for any of the harness's apps (`reader`,
`catalogue`, `live`, `time`; the harness accepts every app it stacks and names no other).

```json
{ "production_digests": { "reader": "sha256:…", "catalogue": "sha256:…", "live": "sha256:…", "time": "sha256:…" },
  "candidate_digests":  { "reader": "sha256:…", "catalogue": "sha256:…", "live": "sha256:…", "time": "sha256:…" } }
```

`release.yml` hands them to `harness images ensure` and `harness run` as
`--a-digests` (production) and `--b-digests` (candidate). Each flag takes a JSON
object or `reader=sha256:…,catalogue=sha256:…,live=sha256:…[,time=sha256:…]`; an empty value,
`{}` and `null` mean none. What changes when they are given:

- the references become `repo:tag@sha256:…` (the form `--a`/`--b` already read,
  since 1.1.0) and `report.json` says so in `sides`;
- the pull is **by digest**, and the cosign signature is verified **on that
  digest** — by the same rule as an unpinned image, which is already by digest;
- a digest that disagrees with what the tag resolves to now is **exit `2`,
  "cannot judge"**, with the reason stated: the harness asks the registry
  (`docker buildx imagetools inspect <repo>:<tag>`) which digest the tag has
  today, and refuses to judge when it is another one (the tag moved after the
  digests were taken, or the digest belongs to another image). A tag that cannot
  be resolved at all is refused the same way: a pinned image is only judged when
  its tag and its digest are known to agree;
- a pinned image that cannot be pulled is exit `1` (not obtainable), and is
  **never built from source**: a rebuild is not the image the digest names;
- a digest for an app the harness does not know, one that is not
  `sha256:` and 64 lowercase hex, or one that contradicts a digest already in
  `--a`/`--b`, is exit `2`;
- an app with no digest is not pinned; a side may be pinned in part.

### The release record

Release mode writes what it judged, as `releases/<candidate>.json` in the
harness's state directory (`HARNESS_HOME`, default `<checkout>/.harness`, beside
the noise store; see [local.md](local.md)) and as `release-record.json` in the
run's output directory (so the `release-report` artifact carries it).
[`contract/release-record.schema.json`](contract/release-record.schema.json):

```json
{ "schemaVersion": 1, "candidate": "16.3.0-rc.4", "release": "16.3.0", "production": "16.2.0",
  "recordedAt": "2026-09-16T09:10:00.000Z",
  "harness": { "version": "1.7.0", "gitSha": "3f2c…", "contractVersion": "1.7.0" },
  "verdict": "pass", "overridden": false, "pinned": true, "verified": true,
  "digests": { "reader": "sha256:…", "catalogue": "sha256:…", "live": "sha256:…", "time": "sha256:…" } }
```

`digests` are the registry digests of the candidate images that ran, and are
evidence only when `verified` is `true` (every image pulled and signature-verified
in the run). A candidate built from a git ref, or found locally, has none.
Alongside `<candidate>.json`, the store keeps `<release>.json` (`16.3.0` for
`16.3.0-rc.4`): the newest candidate of that release that could ship, that is one
whose verdict is not `fail` unless the FAIL was overridden. That is the file
`--deployed 16.3.0` finds.

CI publishes it the way it publishes the noise status: `release.yml`'s
`publish-record` job pushes `releases/<candidate>.json` (and `<release>.json`)
to this repository's `release-records` branch, and nothing else.

### Checking a deployment

The `deployed` dispatch may carry `production` (string: the tag that was
deployed) and `digests` (an object like the above: what runs). Post-deploy mode
compares them with the release record and **warns**:

| `deployment.status` | Meaning |
| --- | --- |
| `match` | every reported digest is the recorded one, and no app is missing on either side |
| `differs` | an app is deployed at another digest than the one release mode judged |
| `incomplete` | nothing differs, but an app has a digest on one side only (the record has none for it, or the deploy reported none) |
| `no-record` | no release record was found for the release |
| `not-reported` | the deploy named a tag but sent no digests |

Anything but `match` is **advisory, exit `0`**: `report.json` gets `deployment`
(see the schema), the first `reasons` entry says `DEPLOYED IMAGES DIFFER` or
`DEPLOYED IMAGES NOT CONFIRMED`, a `pass` verdict becomes `warn`, and the
step summary carries it. It never turns anything into a `fail`, and never
softens one. A `deployed` payload without `production` and `digests` (every
1.2.0 dispatch, and the 15-minute schedule) is not checked at all.

The record is looked up in this order, and nowhere else: `--release-record`
(a file, or a directory holding `<tag>.json`); otherwise
`<HARNESS_HOME>/releases/<tag>.json`. `post-deploy.yml` fetches
`releases/<production>.json` from the `release-records` branch into a directory
and passes it as `--release-record`. `<tag>` is the `--deployed` value, which
must be a registry tag (`[A-Za-z0-9_][A-Za-z0-9_.-]*`): it names a file.

### Which build production serves

Since 1.6.0. Production (tutors.dev) is deployed by hand and nothing records
which build it serves, so every post-deploy run asks its reader, after capturing
it, with a 5-second timeout per request:

- `GET <reader>/_app/version.json`, SvelteKit's `{"version":"<name>"}`. A build
  given its commit (`GIT_SHA` in the images; Netlify's `COMMIT_REF` since
  tutors-mono-repo#354) is named `sha256(commit)` in hex, first 16 characters;
  a build given neither is named `Date.now()` at build time, 13 digits, which the
  report shows as "built at <ISO time> from an unnamed build".
- `GET <reader>/version`, whose `revision` is the commit or `unknown`; older
  builds answer 404.

A request that fails, times out, or answers anything but a 2xx JSON document is
"not answered". The recorded commit is the recorded capture's reader image
`revision` (`provenance.b.images.reader.revision` of the release run). The
result is `productionBuild` in `report.json` and a "Production build" section
in `report.md` and `report.html`:

| `productionBuild.status` | Meaning |
| --- | --- |
| `match` | `/version` names the recorded commit (or an abbreviation of it, 7 characters or more), or the build name is that commit's hash |
| `differs` | production names a commit, or carries a hashed build name, that is not the recorded one |
| `unknown` | anything else: no recorded commit, neither answered, `revision` is `unknown` and the build is unnamed |

`differs` adds a `PRODUCTION BUILD DIFFERS` line to `reasons`, `unknown` a
`PRODUCTION BUILD NOT CONFIRMED` line. Either is **informational**: the verdict
and the exit code are exactly what they would be without it, and no hunk is
added. What production answered is escaped in `report.html` and kept inside code
spans in `report.md`; `reasons` and `summary` quote only values made of letters,
digits and `._:+-`.

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
  - artefact: dom                                       # since 1.3.0: a claim may name a Rule instead
    scope: "reader:lab-step*"
    rule: "0031"                                        # four digits, quoted; must be in the rules file (--rules)
    until: "16.3.0"                                     # since 1.25.1, optional: the last day (YYYY-MM-DD) or release (X.Y.Z)
    digests: { reader: "sha256:…" }                     # since 1.25.1, optional: the images it was written against, by app
```

- `artefact`: one of the twenty-five artefact names above, or `*`.
- `scope`: matched with picomatch (`dot: true`, case-insensitive) against the
  hunk's `scope` **or** its `path`.
- `reason`: at least 8 characters, and must not start with `see pr`,
  `approved`, `all`, `ok` or `misc`. Required unless the claim has a `rule`.
- `rule` (since 1.3.0): a Rule's four digits, **quoted** (`"0031"`: unquoted, YAML
  reads `0031` as the number 31, which is refused with that hint). When it is
  present `reason` becomes optional free text, and the report shows
  `Rule 0031: <title>` (then the reason, when there is one) in place of the
  reason. The title comes from the rules file, below. `reason: "Rule 0031: ..."`
  free-text claims keep working unchanged, with or without a rules file.
- A claim is *broad* when `artefact` is `*` or `scope` is `*`, `**` or a
  pattern of only stars (`*/*`, `**/**`). A broad claim without `approvedBy`
  is listed in `compare.broadUnapproved` and gates.
- Unknown keys are ignored (before 1.3.0 that included `rule`). An empty file is
  no claims. An invalid file stops the run with exit `2`, before any stack starts.
- Each failing hunk is assigned to at most one claim; `info` hunks need none.
- `until` and `digests` (since 1.25.1) give a claim a **lifetime**
  (`src/claims/lifetime.ts`). `until` is a calendar day, `"YYYY-MM-DD"` (a real one), or a
  release, `"X.Y.Z"` or `"vX.Y.Z"`. `digests` maps one or more of `reader`, `catalogue`, `live`
  and `time` to `sha256:` and 64 hex characters. A claim is **expired** when the run's UTC day is
  after its date; when side b's reader tag is a later release than its release (a release
  candidate `X.Y.Z-rc.N` of that release is not later); when side a's reader tag has reached its
  release (a forecast, whose side b is `sha-<short>`); or when side b's registry digest for a
  named app is another, or absent. Anything else in either field is an invalid claim (exit `2`).
- Claim lifetimes have a level, as an engine does (`CLAIM_LIFETIME_LEVEL`), and ship
  **informing**: an expired claim still covers what it matches, so the verdict is what it would be
  without the fields. `report.json` gains `claimLifetimes` (`{ level, claims: [{ artefact, scope,
  until?, digests?, state: live | expired, why, covers }] }`, only when a claim has a lifetime;
  `covers` is the failing differences it covers), and `report.html` and `report.md` say how many
  expired and what they still cover, beside the A/A lines. At 2.0 the level becomes **blocking**:
  an expired claim is left out before matching, covers nothing and is stale.

The claims file lives with the release (the monorepo's `release/claims.yaml`),
never in this repository.

### The rules file

Since 1.3.0. The monorepo publishes `rules.json` at the candidate tag
([`contract/rules.schema.json`](contract/rules.schema.json)):

```json
{ "version": 1,
  "rules": {
    "0031": { "title": "Lab steps show their estimated reading time", "digest": "sha256:…" },
    "0044": { "title": "Presence is polled every 15 seconds" } } }
```

`--rules <path or url>` takes it (`release.yml`: the `rules_url` of the
dispatch, or the workflow input of that name; a URL the runner can GET without
credentials). What the harness does with it, and nothing more:

- a claim whose `rule` is not in the file is **invalid**, the same class as any
  other invalid claim: exit `2`, before any stack starts, naming the claim and
  the rule;
- a claim that names a `rule` when no rules file was given is invalid, with a
  message that says to pass `--rules` (in the dispatch, `rules_url`) or to give a
  `reason`;
- a rules file that cannot be read or fetched (an HTTP status other than 2xx, a
  timeout), or that is not valid, is exit `2` too. `--rules` given with no claims
  file, or with claims that name no rule, is still read and checked;
- the Rule's `title` is shown in the report (`Claim.ruleTitle`, the Markdown
  comment, the HTML report). `digest` is optional and never read; keys the
  harness does not know in a Rule are ignored;
- **a claim never gates on the file's contents beyond the Rule's existence**: the
  harness does not read what a Rule says, and does not judge whether the change
  is what it intends. Matching, the stale-claim report and the broad-claim rule
  are exactly as before.

### OpenVEX: exceptions the scanner reads

Since 1.23.0. The monorepo may keep `release/openvex.json` beside `release/claims.yaml`: an
[OpenVEX](https://openvex.dev) document saying which advisories do not affect the release, in a
form any scanner reads. `--vex <file>` takes it, and the harness hands it to the scanner it already
pins, on **both** sides (`grype ... --vex <file>`; trivy takes the same flag; a scanner command of
another kind, `HARNESS_VULN_CMD`, runs without it). An advisory the scanner sets aside under a
statement is left out of `vulns` and of the vulnerability ceiling on both sides; the scan records
the file (name, sha256, statement counts) and the advisories it set aside, and the report's image
artefacts line for `vulns` says "OpenVEX openvex.json (N statement(s)): M set aside, ids".

The harness checks the file before any stack starts, as `pnpm check:openvex` in the monorepo does,
and a file it cannot use is exit `2` naming the statement and field:

- `@context` is the OpenVEX context (`https://openvex.dev/ns/v0.2.0`); `@id`, `author`,
  `timestamp` and `version` (a whole number from 1) are present; `statements` is a list, which
  may be empty;
- each statement names `vulnerability.name`, at least one product whose `@id` is a package URL
  (`pkg:npm/tar@7.4.3`), and a `status` of `not_affected`, `affected`, `fixed` or
  `under_investigation`;
- `not_affected` needs one of the five standard justifications (`component_not_present`,
  `vulnerable_code_not_present`, `vulnerable_code_not_in_execute_path`,
  `vulnerable_code_cannot_be_controlled_by_adversary`, `inline_mitigations_already_exist`); an
  `impact_statement` alone is not enough. `affected` needs an `action_statement`.

A product is a package URL because the harness scans each image's SBOM, not the image: grype
matches a statement whose product is the vulnerable package's purl, and cannot tell which image an
SBOM describes. `release.yml` fetches `openvex.json` from beside `claims_url` (a `claims_url`
ending `/claims.yaml`), and Main to RC from beside main's claims; none there (a 404) runs without
one, exactly as before. **The harness never reads a statement to decide anything itself**: the
scanner applies it, and a run with no file, or with an empty one, is the run it was.

## `confidence.json`: the Release Confidence Score

Since 1.9.0, not stable: [`contract/confidence.schema.json`](contract/confidence.schema.json).
Source of truth: `Confidence` in `src/score/confidence.ts`; the weights, floors and bands are
constants in `src/score/weights.ts`. Written by `harness confidence --run <…>` beside the run
it scores and by `harness release` in its `<timestamp>-release-command/` directory.

Since 1.11.0 it also carries `weightsVersion`: 12 hex of a SHA-256 over the weights, floors,
bands and deduction rules that scored it (`WEIGHTS_VERSION` in `src/score/weights.ts`). Any change
to them gives a new value with nothing to remember to bump, so the scoreboard shows the
discontinuity on the first release scored under the new rules.

**Advisory, and always second.** `gate` (`PASS`, `WARN`, `FAIL`, `FAIL (OVERRIDDEN)`, `NOT
JUDGED`) is the Gate as the gate decided it. `rcs` (0-100) and `band` are computed only when
the Gate is `PASS` or `WARN`; otherwise both are `null` and `note` says why. The score is never
an input to `src/gate.ts` or `src/run.ts` (a test holds it), never changes a verdict, and never
changes an exit code: `harness release` decides its exit code before the score exists.

**The number.** Eight dimensions, each 0-100 (100 minus its deductions). `rcs` is the mean of
the measured ones weighted by `weightsUsed`, **rounded down**; `mean` is the unrounded mean.
When any measured dimension's floor is breached, `rcs` is capped at **74**. Bands, fixed:
`Green` ≥ 90 (ship on the captain's say), `Amber` 75-89 (ship only after the reviewer's glance
is recorded verified), `Red` < 75 (hold, open a 5 Whys, do not re-run hoping for a better
number).

| Dimension (`id`) | Weight | Read from | Floor (caps the RCS at 74) |
| --- | --- | --- | --- |
| Claim coverage (`claim-coverage`) | 20 | the release report: unclaimed failing hunks (−20 each, at most 100), broad claims (`*`/`**`, approved or not, −25 each), stale claims (−15 each), claims flagged as covering many hunks (−5 each, at most 15) | any broad claim, or more than 2 stale claims |
| Noise health (`noise-health`) | 15 | the A/A the release run consulted (`report.noise`) and `masksApplied`: no A/A (−60), dirty or degraded (−40), older than 2 days (−10) or 7 (−40) when the release ran, each mask that fired nothing (−5, at most 20) | no A/A (none or `--noise skip`), a dirty or degraded one, or one older than 7 days |
| Statistical margin (`statistical-margin`) | 10 | the timing and load hunks' p-values: 0.05-0.10 (−20), 0.10-0.20 (−10), moved but could not be judged (−10, at most 30); no k6 (−20); k6 failures or 5xx on the candidate (−30) | a p-value in 0.05-0.10, or a k6 failure rate above 0 |
| Rehearsals (`rehearsals`) | 10 | the migration and upgrade reports: skipped (−50 each), FAIL (−50), WARN (−20), failed requests during the rollout (−50) | either rehearsal skipped |
| Test signal (`test-signal`) | 15 | `--test-signal`: a changed package below 80% mutation score (−30 each), each harness mutant missed (−25) | a mutation score below 60%, or a harness mutant missed |
| Requirements traceability (`traceability`) | 10 | `--traceability`: an entry with no EARS file (−20), with no claim (−10), a claim tracing to no entry (−10) | a `feature` entry with no EARS file |
| Change risk (`change-risk`) | 15 | `--change-risk` (a `changes.json`, or the changes stage of `harness release`): the deductions `harness changes` made, summed, as [`changes.json`](#changesjson-the-change-signals) lists them (since 1.10.0; the plan's table: −5 per app above 2× its churn median, −10 a hotspot touched by a first contribution and −3 by anyone else, −5 per file with 3+ authors at most −15, −10 per orphan change, −10 per PR below 0.2 test lines per production line, −5 per major bump) | a PR with no approving review, or a commit straight to main (no points of its own) |
| Post-deploy history (`post-deploy`) | 5 | `--post-deploy`: the last release's post-deploy run FAILED (−100), WARNED (−20) | it FAILED (a rollback issue) |

**Every point lost is a deduction** `{ points, why, evidence, floor? }`: `why` names the hunk,
claim, PR, file or run, and `evidence` is where to look, relative to `confidence.json`: a
section of a run's `report.html` (`…/report.html#hunk-<hunk id>`, `#differences`,
`#stale-claims`, `#broad-claims`, `#claim-hygiene`, `#noise`, `#masks`, `#load`,
`#migration`, `#upgrade`; since 1.9.0 `report.html` carries these ids), an input file, or a
PR. A dimension's `gaps` list what its 100 could not check with what it was given (masks added
this release, churn, a rollback issue opened after the post-deploy run).

**A dimension without its input is `status: "not measured"`**, with `score: null` and a
`reason` naming the flag that would measure it. It is left out of the mean: `weightsUsed`
holds only the measured dimensions, renormalised to sum to 100. It is never scored 100. On a
`harness release` run today the first four are measured and the last four are not unless their
inputs are given.

**The optional inputs** are small JSON files, validated on read; one that is given and cannot
be used is exit `2` for `harness confidence` (and "failed, and changes nothing" in the score
stage of `harness release`), never silently "not measured". `evidence` is optional everywhere
and replaces the file name in a deduction (a CI run URL, a report):

```jsonc
// --test-signal: the monorepo's CI and Stryker, and this week's harness mutants. Either key may be left out.
{ "packages": [{ "name": "reader", "mutationScore": 72, "changed": true, "evidence": "https://…" }],
  "harnessMutants": { "caught": 8, "total": 8, "evidence": "https://…" } }
// --traceability: the changelog against the EARS files and the claims.
{ "entries": [{ "entry": "Reader: reading time on lab steps", "kind": "feature", "ears": "specs/0031.feature", "claimed": true }],
  "untracedClaims": ["dom reader:lab"] }
// --change-risk: a changes.json (since 1.10.0; its changeRisk block is read), or the 1.9.0 shape below, still read:
// reviewed may be null (not known) since 1.10.0; hotspots cost −10 on a first contribution, −3 otherwise; an unreviewed
// PR breaches the floor at no points; churn, ownership, orphans, tests and dependencies are then gaps.
{ "prs": [{ "number": 412, "url": "https://…/pull/412", "reviewed": true, "firstTimeContributor": true, "hotspots": ["packages/reader/src/lib/course.ts"] }] }
```

Since 1.10.0 a deduction may be `points: 0` with `floor: true`: a finding that caps the RCS
and costs no points of its own (a PR with no approving review; orphan changes in
requirements traceability, where `changes.json`'s orphans are a floor signal once it is measured
and are named in its `reason` while it is not). The board and the report show it as `floor`.

`--post-deploy` takes the last release's post-deploy run directory or its `report.json`.

**Test signal's two halves** (since 1.18.0). `--test-signal` also reads the monorepo's
**quality record** as it is: the file its Nightly publishes per commit on its `quality` branch
(`quality/<sha>.json`, written by `pnpm release:quality`):

```jsonc
{ "schemaVersion": 1, "commit": "<sha>", "base": "<ref the packages are compared with, or null>",
  "generatedAt": "2026-09-30T03:41:07Z", "evidence": "<the Nightly run>",
  "packages": [{ "name": "@tutors/tutors-model-lib", "mutationScore": 87.5, "changed": true, "path": "packages/jsr/model" }],
  "nightly": { "result": "failure", "jobs": { "mutation-nightly": "success", "lighthouse": "failure" } } }
```

`packages` is the shape above; the other keys are read by the quality strip, not the score. A
record (`schemaVersion` 1 and a `commit`) with no `packages` (the Nightly wrote no Stryker
report) is **not measured**, with a `reason` naming the file and the commit, never exit `2`; a
file that is not a record still needs `packages` or `harnessMutants`. The record never carries
`harnessMutants`: that half is the harness's own. **`--mutants <mutants.jsonl>`** (since 1.18.0;
the weekly self-tests `harness scoreboard mutants` records, on the `scoreboard` branch) joins
it: when the test signal has `packages` and no `harnessMutants`, the newest self-test that ran
before the release run is its `harnessMutants` (`evidence`: that self-test's run). One that
could not run (`caught: null`), one older than 14 days, or no file at all joins nothing, and
the dimension's `gaps` say which. The weekly mutants never measure Test signal alone: without
the monorepo's packages they are not read.

`glance` is the reviewer's glance (since 1.12.0; empty before), ranked after the score from the
same inputs and never read back by it; `glanceBasis` says how it was ranked ([the reviewer's
glance](#the-reviewers-glance)). `run` names the candidate, the baseline, when the release ran,
the reports and inputs read (relative paths) and the harness that scored it.

### The reviewer's glance

Since 1.12.0, not stable. Source of truth: `glance` in `src/glance/rank.ts`; the marks are
`src/glance/marks.ts`. Gemba: at most **seven** places to look, each a one-line `finding` with
`links` straight to the artefact (`hunk`: the hunk or section in the run's `report.html`,
relative to `confidence.json`; `claim`: the claim that covers it; `pr`: the PR that caused it;
`diff`: the file in that PR's diff), for the Reviewer's fifteen minutes at SOP step 8.

**The ranking** is `score` = `novelty` × `exposure`, highest first, ties in the order below, and
it is written out (`basis.novelty`, `basis.exposure`, `glanceBasis.rule`) so it can be reviewed:

- `novelty`: (n − seen + 1) ÷ (n + 1), where n is how many of the last six releases on the
  scoreboard (`--scoreboard`, default `HARNESS_HOME/scoreboard/releases.jsonl`; each tag's
  latest line, this tag's own runs left out) recorded this kind of finding, and `seen` how many
  had this one (its `kind` and `key`). 1 with no history, and the item says "no history yet".
  A line from before 1.12.0 has no glance record; it still tells for a first contribution on a
  hotspot (its per-PR lines) and, once lines carry `maskIds`, for a mask.
- `exposure`: the share of the journey set (the journeys in the release run's `a/` and `b/`
  `capture.json`; without them the page groups of `report.json`'s hunks, and `glanceBasis.journeys.source`
  says so) the finding touches. A finding that cannot be placed on a journey counts as the
  whole set and says "unmapped", so what the harness cannot place is not ranked below what it can.

| `kind` | A candidate is | Reads | `key` |
| --- | --- | --- | --- |
| `broad-claim` | a broad claim, with its `approvedBy` and every hunk it absorbed (`hunks`) | the release report | the claim's artefact and scope |
| `mask-added` | a mask the run loaded that the last release on the scoreboard did not, with its reason and how many values it hid | the release report's `masksApplied`, the last line's `maskIds`, `normalise/masks.yaml` | the mask id |
| `near-miss` | a timing or load hunk whose p-value is in 0.05-0.10, with both distributions (`detail`) | the release report, the captures, k6 | the hunk's scope |
| `first-time-hotspot` | a PR by a first-time contributor that touches a hotspot, with its diff link | `changes.json` | the hotspot file |
| `new-persistence` | a journey that wrote nothing on a and writes on b, even when claimed | the captures | the journey |
| `fixed-on-b` | console errors or axe violations gone on b (an unclaimed fix can be a behaviour change) | the release report | the artefact and page |
| `major-bump` | a major dependency bump and the journeys exercising the app it lands in (a package outside `apps/` is "unmapped") | `changes.json` | the package |
| `duration-moved` | a journey whose median duration moved more than 20%, significant or not | the captures | the journey |

A kind whose input is missing is listed in `glanceBasis.notChecked` with the reason, never
made up; `glanceBasis.checked` counts the candidates of the rest, and `glanceBasis.seen` keeps
every candidate's `kind:key` (at most 200) for the scoreboard.

**Marks.** `harness glance mark --run <harness release dir> --item <n> --mark
verified|disputed|escalated --by <name> [--note text]` appends one line to
`glance-marks.jsonl` beside `confidence.json` ([schema](contract/glance-marks.schema.json)):
`verified` (looked, agrees with the claim), `disputed` (becomes a new claim or a hold),
`escalated` (becomes a 5 Whys; the line carries `whyWanted: true`, and since 1.13.0 the mark writes
the stub `harness why --finding <kind>:<key>` would into `kaizen/` beside `confidence.json`).
A changed mind is a new line; the latest line for a finding is its mark, matched by `kind` and
`key`, so a re-score that reorders the glance keeps it. The mark is shown in each item's `mark`
(null until there is one) and the glance is re-rendered in `report.md`, `gate.md` and
`report.html`. `harness glance status --run <dir> [--json]` prints the glance with its marks and
says whether an Amber release's glance is recorded verified (go only then, SOP step 9).
**Marks never change the Gate, a verdict or an exit code**: `mark` exits `0` when recorded and
`2` for what it cannot use; `status` exits `0` whatever it finds once `--run` is given.

## `changes.json`: the change signals

Since 1.10.0, not stable: [`contract/changes.schema.json`](contract/changes.schema.json).
Source of truth: `Changes` in `src/changes/signals.ts`; the points are `RULES.changeRisk` in
`src/score/weights.ts`. Written by `harness changes --out <file>` and by the changes stage of
`harness release` in its `<timestamp>-release-command/` directory.

**What it reads.** `git log A..B` in the monorepo checkout, from the two tags the diff engine
compared (a harness tag `16.2.2` finds the monorepo's `v16.2.2`), not whatever is checked out.
Each first-parent commit is one line: a merged PR (`Merge pull request #N from …`, title from
the body), a squashed one (`title (#N)`), or a commit straight to main (`pr: null`,
`direct: true`). A `release/*` branch coming back is `release: true`: bookkeeping, left out of
the hotspot, ownership, test and orphan checks. The history is the `--history` (default 6)
releases before `A`, each the net diff between two neighbouring plain `X.Y.Z` tags (an rc is
not a release).

| Signal | Measured as | Points (on the PR that carries it) | Not measured when |
| --- | --- | --- | --- |
| churn | lines added + deleted under `apps/<reader, catalogue, live, time>/` between the tags, against that app's median over the history | −5 per app above 2× its median, on the PR with most of that churn | no release tag before `A` |
| hotspots | production files changed in 3+ of the history releases, heaviest first | −10 when a first contribution touches one, −3 otherwise (once per PR) | fewer than 3 releases of history |
| ownership | production files with 3+ distinct authors (by name or email) this release | −5 per file, at most −15, on the PR that brought the third author | never |
| orphans | a PR (or direct commit) that changed a product section's paths with no entry under `### v<version>` naming it; an entry whose PRs did not merge between the tags or changed nothing under its section (CHANGELOG.md has no Development section, so Infrastructure also covers CI, tests and guides) | −10 each; an entry no PR between the tags carries is a line of its own (`pr: null`) | CHANGELOG.md at `B` has no `### v<version>` entries and no `--changelog` (the output of `pnpm release:changelog --json`, whose `curated: false` then answers the diff half) was given |
| tests | test lines ÷ production lines per package (`apps/<x>`, `packages/jsr/<x>`, `packages/svelte/<x>`); tests outside a package (the root `tests/`) count for the packages the same PR changed | −10 per PR below 0.2 on any package it changed | never |
| reviews | at least one `APPROVED` review, from `GET /repos/{repo}/pulls/{n}/reviews` with `GITHUB_TOKEN` (else `GH_TOKEN`) | floor, no points, per PR without one and per commit straight to main (known without a token) | no token, or an origin that is not GitHub; a PR GitHub cannot answer for is `reviewed: null` and named |
| dependencies | the direct dependencies of each importer in `pnpm-lock.yaml`, `A` against `B` | −5 per major bump (for 0.x, a minor), on the PR that moved it; new ones listed | a side has no `pnpm-lock.yaml` |

**Every deduction** is `{ points, why, evidence, floor?, rule, pr, commit?, file?, author? }`:
`why` names the PR (or commit) and the file, and never the author; `evidence` is the file in
that PR's diff on GitHub (`https://github.com/<repo>/pull/<n>/files#diff-<sha256 of the
path>`), the commit, or `CHANGELOG.md` at `B`. `author` is a fact field for the scoreboard's
trends. A first contribution (`firstContribution`: nothing by that author reachable from `A`)
is a fact and costs nothing on its own: the points land only when it meets a hotspot or lacks
tests. The report's table has no author column.

**The score** is `score` (and `changeRisk.score`): 100 minus the sum of every deduction on every
line, floored at 0 — a sum, not an average. `changeRisk` is what `harness confidence
--change-risk` reads (it takes the whole file): `prs`, `direct`, `deductions`, `gaps` (each
signal not measured, and why) and `orphans`. `notMeasured` lists what could not be read; a
signal not measured is never scored clean.

## The scoreboard

Since 1.11.0, not stable: [`contract/scoreboard-line.schema.json`](contract/scoreboard-line.schema.json).
Source of truth: `ScoreboardLine` in `src/scoreboard/line.ts`, the views and run rules in
`src/scoreboard/trends.ts`. Visual management over time: one line per release run.

**Where it lives.** `scoreboard/releases.jsonl` (one JSON object per line) and, beside it,
`scoreboard/mutants.jsonl` (one line per weekly mutants self-test):

| Where | Written by |
| --- | --- |
| the `scoreboard` branch of this repository | `release.yml`'s `scoreboard` job (one line per release run) and `weekly-mutants.yml`'s `record` job (scheduled and dispatched self-tests only), one commit each, never forced; each checks the file before is exactly the start of the file after before it pushes. `main` takes changes only through a pull request, so CI appends here, the way the release records do |
| `scoreboard/` on `main` | only a pull request that copies lines over from the branch; `harness guard scoreboard` (CI's masks job) fails a diff that changes or removes a line already there |
| `HARNESS_HOME/scoreboard/` | `harness release` on a laptop, and `harness scoreboard append` without `--file` |

**Append-only.** The history is the history: a line is never edited, reordered or removed. A
re-run of a tag is a new line with the same `tag` and the next `run` number (a logged deviation).
Nothing is seeded: an empty file is "no releases scored yet".

**A line** (`harness scoreboard append --run <harness release dir | confidence.json>`): `tag`,
`run`, `date` (the release run's `ranAt`), `gate`, `rcs`, `band`, `weightsVersion`, the eight
`dimensions` (`id`, `status`, `score`, `floorBreached`), `masks` and `masksNeverFired` (the release
run's `masksApplied`, and those at 0), `claims` and `staleClaims`, `journeys` (`passed` of `total`:
the journeys the candidate completed in every run, from `b/capture.json`), `mutants` (the latest
line of `mutants.jsonl` beside the file, or `--mutants`; else `null`), and `prs`: the per-PR risk
lines of `changes.json` (`pr`, `points`, `author`, `firstContribution`, `reviewed`, `files`, and
each deduction's `rule`, `points`, `file`), `null` when change risk was not measured. A `--fast`
run is refused (exit `2`): its report cannot be used for a go decision. Since 1.12.0, both
optional (absent on older lines): `maskIds`, every mask the release run loaded, and `glance`:
`items`, `marks` (`verified`, `disputed`, `escalated`, `unmarked`, from `glance-marks.jsonl`
beside the run at the time of the append; `harness release` and CI both append when the run
is scored, before step 8, so today the line reads them `unmarked` and `glance-marks.jsonl`
holds the record), `checked` (the kinds the glance could check) and `seen` (every candidate's
`kind:key`): what the next release's novelty reads. Since 1.13.0, optional: `openCountermeasures`,
the countermeasures open in the kaizen register when the line was appended (`harness release` and
`harness scoreboard append` read the checkout's `kaizen/`; `release.yml`'s `scoreboard` job runs in
the harness checkout, so CI's lines carry it too).

**Trends** (`harness scoreboard trends [--json] [--site dir]`): one point per release, its tag's
latest run (every re-run is listed in `deviations` with its first and latest RCS), in the order
the tags first appeared. Six views: `rcs` (with `band`, and `weightsChanged` marking a
discontinuity), `dimensions` (the eight as series), `masks` (count and never fired), `claims`
(claims and stale), `hotspots` (the five files touched by the most releases; 3 or more is a
refactor candidate) and `risk` (per file: the change-risk points its deductions cost per release;
per contributor: the points of their PRs, labelled for trends only, never for reviewing people).
`selfHealth`: `mutants` caught per week (the latest self-test of each ISO week), and `noise`: clean
nights of the last 30, the last A/A failure (a night with any difference) and days since it, from
`noise-history.json` (`--noise-history`, default the local noise store's).

**Run rules** (statistical process control), over each dimension and the RCS, skipping releases
where the series has no value:

| Rule | Fires at a release when |
| --- | --- |
| `three-declines` | the value fell three releases running (four points, each lower than the one before) |
| `two-of-three-below-75` | two of the last three releases are below 75 (three points needed) |

Each firing names the series, the release, the window, whether the window spans a change of
`weightsVersion`, and the kaizen item it opens (`kaizen`). `runRules.current` are those at the
newest release: what `harness release` prints after the RCS, and, since 1.13.0, what it opens a
5 Whys for (`harness why --finding <rule>:<series>`). The kaizen register's own rule, open
countermeasures only rising (`runRules.countermeasures`), reads each release's `openCountermeasures`
and fires on three consecutive rises; until a line records one it is not measured, and says so.
**Advisory: no run rule changes a verdict or an exit code.**

`--site <dir>` writes `scoreboard.html` (self-contained, inline SVG, the bands shaded) and
`scoreboard.json` (the trends, as `--json` prints them); `pages.yml` publishes both beside the
kept reports.

## The 5 Whys and the kaizen register

Since 1.13.0, not stable. Source of truth: `src/why/` (`format.ts`: the file and the check;
`trace.ts`: the stub; `register.ts`: the register). Kaizen: every escape or drop in confidence
ends in a countermeasure to the system, never in blame.

**Triggers.** The harness opens a 5 Whys, not a person remembering to:

| Trigger (`Trigger:` in the file) | `--finding` | Opened by |
| --- | --- | --- |
| `Gate FAIL` | `gate` | `harness release`, on a release run that FAILED |
| `Red band` | `band` | `harness release`, when the RCS is below 75 |
| `rollback` | `rollback` | `post-deploy.yml`, in the body of the rollback issue (post-deploy mode exit `1`) |
| `run rule` | `three-declines:<series>`, `two-of-three-below-75:<series>` (`rcs` or a dimension id), `countermeasures-rising` | `harness release`, for each run rule firing at this release |
| `escalated glance mark` | `<glance kind>:<key>`, or `glance:<rank>` | `harness glance mark --mark escalated` |
| `finding` | a hunk id from `report.json` | a person, by hand (in a post-deploy run it is `rollback`, after a Gate FAIL `Gate FAIL`) |

A trigger that did not fire is refused (exit `2`, with the ids the run has): a 5 Whys starts
from a fact.

**`harness why --run <run dir | harness release dir> --finding <id> [--out kaizen/] [--tag T]
[--scoreboard f] [--json]`** writes `<out>/<YYYY-MM-DD>-<tag>-<finding slug>.md` (the tag is
`--tag`, else the run's candidate, else the deployed tag of a post-deploy run; `--scoreboard`,
default `HARNESS_HOME/scoreboard/releases.jsonl`, is read for a run-rule finding). A file already
there is left as it is. Exit `0` when written or found, `2` for what it cannot read.

**The file.** Markdown with a shape `harness why check` reads:

| Part | Written by `harness why` | Filled by people |
| --- | --- | --- |
| `# 5 Whys: <title>` and `- **Trigger:**`, `**Finding:**`, `**Release:**`, `**Run:**`, `**Opened:**` | yes | |
| `## Why 1: <question>` | the harness's trace, each line a link or a file: the finding; its artefact and scope; the journeys that reach it (from the run's `capture.json`); the link to the hunk in `report.html`; the covering claim, or the nearest claim and why it did not cover (the matcher's rule: the artefact, then the scope glob against the scope, the route and the page); the PR (one the claim names, else those that changed the hunk's app, said as such) with its files and churn from `changes.json`, and a first contribution as a fact, never a cause (the author is never named); the glance rank and the Reviewer's mark. For `gate`, `band`, `rollback` and a run rule, the whole-release facts instead | corrections, never recollections |
| `## Why 2` to `## Why 5` | a prompt (an HTML comment, which never counts as an answer) | the answers |
| `- **Chain ends at:**` `Why 1` to `Why 5`, `- **Ends in:**` `process` or `tool` | | yes |
| `- **Kind:**` exactly one of `mutant`, `journey`, `mask review`, `EARS spec`, `claim guidance`, `SOP change`, `glance rule`; `- **Countermeasure:**`; `- **Mutant:**` a path under `mutants/` (kind `mutant` only); `- **Owner:**`; `- **Due:**` `YYYY-MM-DD`; `- **Verified by:**` the release it was verified closed in, empty while open | the prompts | yes |

**`harness why check <file|dir...> [--json]`** (a directory is every `.md` in it but
`README.md`) exits `1` when a file is not ready for the register, naming each problem and its
reason: an answer missing up to where the chain ends; an answer (or countermeasure) that is only
"human error", carelessness, a mistake or a person's name (*"human error" is not an answer, it is
the prompt for the next why*; *a person's name is not a cause: the register records
countermeasures to the system*); no `Chain ends at`; `Ends in` not a process or a tool; not
exactly one of the seven kinds; kind `mutant` without a path under `mutants/`; no owner; a due
date that is not a date; `Verified by` that is not a release. Blame beside a checkable cause is an
answer. `0` when every file is ready, `2` for a path that does not exist. A docs lint: never a
release gate, never read by a run.

**The register** is `kaizen/README.md` in this repository. People write its header; the table
between `<!-- register:start -->` and `<!-- register:end -->` is generated by **`harness why
register [--dir kaizen] [--write] [--json]`** from the files, one row each: the 5 Whys (linked),
trigger, release, countermeasure (a `mutant` links its path), owner, due, and "closed in
<release>" or "open" (with how many problems `why check` still finds). Rows are never edited by
hand. Without `--write` it prints the table and the counts and exits `1` when `README.md` does not
say what the files say; with it, it writes and exits `0`. Open is no `Verified by`; overdue is open
with a due date before today; neither count is written into `README.md` (they would change with
nothing changed), they are printed: by `harness why register`, and by `harness release` after the
score (`register: N open countermeasure(s), M overdue …`, SOP step 12). CI's unit job runs `harness
why check kaizen` and `harness why register --dir kaizen`.

**Closing the loop.** Each scoreboard line records `openCountermeasures`; three consecutive rises
fire the register's own run rule, which `harness release` opens as a 5 Whys
(`countermeasures-rising`) listing what is open. **Nothing here changes a verdict, a Gate or an
exit code**: `harness release` opens the stubs after its exit code is decided.

## The A3 Aggregator

**`harness a3 --site <dir> [--kaizen kaizen] [--noise-history f] [--scoreboard f] [--mutants f]
[--github f | --fetch-github] [--out <dir>]`** (not stable) reads what the pages workflow has already put
together (each stream's `reports/index.json` and kept reports, `confidence.json` and
`changes.json` beside them, the noise history, the kaizen register, the scoreboard) and writes
one A3 on one page: `a3.html` (self-contained, printable on A3 landscape), `a3.json` (the same
numbers, for the site's own A3 section) and, with `--fetch-github`, `github.json` (the snapshot
of workflow runs, the monorepo's image builds and commit dates it was built from; `--github f`
reads such a snapshot instead of fetching). `--out` defaults to `--site`.

The A3 carries, in order: background; current condition, with the value stream map (merge,
image build, accessibility audit, forecast, release gate, deploy, verify; waits, inventory, lead
time and the andon on a stage that stopped) and four Paretos (unclaimed hunks by cause, line
stops by cause, confidence points lost by dimension, change-risk points by rule, each with the
vital few that make up 80% cut out); the goal; the root-cause questions, each answered from the
data with a link to the 5 Whys in `kaizen/` that goes deeper; countermeasures, plan and
follow-up from the register; the 5 Whys themselves; and the Lean terms the page uses. The final
scoring (the Gate and, when the Gate passes, the RCS with its band and dimensions) leads it.

**Decisions on b** (since 1.15.0): a fix on b (an axe violation fixed, an error-level console
message gone) is an info hunk and never gates, but it is a behaviour change someone chose. The
A3 shows each one as a decision, in orange beside the traffic lights and never on them: decided
when a claim names it (the claim is the why), undecided when none does, and "fixed, or only
changed?" when the same page also has new failures of that kind; with the share decided per
artefact.

**The quality strip** (since 1.18.0, `quality` in `a3.json`,
[`quality-strip.schema.json`](contract/quality-strip.schema.json)): three lights under the Gate,
for the A3's subject run, each **within reason**, **look** or **not measured** with the number,
the rule and links to what it read (`src/a3/quality.ts`):

| Light | Reads | Within reason when |
| --- | --- | --- |
| Speed | `report.json`'s timing, load and startup hunks and its `load` block | no failing timing, load or startup hunk (claimed or not), and no failed or 5xx k6 request on main; not measured without a k6 leg |
| Metrics | the unclaimed `metrics` hunks | none; unclaimed `logs` hunks are shown beside it, not counted |
| Tests, harness half | the journey outcome hunks (`journey "<name>" completed on a but failed on b`, and the rest), `report.noise`, and the newest weekly mutants self-test before the run (`--mutants`, default `mutants.jsonl` beside `--scoreboard`) | every journey completed on both sides; the A/A clean, not degraded and at most 2 days older than the run; every mutant caught (a self-test that could not run, or one older than 14 days, is not measured) |
| Tests, monorepo half | the quality record kept beside the forecast (`quality.json`, see [Kept reports](#kept-reports)) | its Nightly `result` is `success`, and no changed package is below 80% mutation score (Test signal's target); a record with no `packages` is not measured |

A light is within reason only when every check under it was read and in reason; any look makes
it look; otherwise it is not measured, drawn hatched and never green. The Tests light carries
each half's state (`halves`), so a half-measured light says which half, and `record` says which
commit the monorepo's record is for (the judged one, or the newest before it with a record) and
how long before the forecast it was generated. CI on the commit is not in the record and is not
read. **The strip never changes the Gate, the score, a verdict or an exit code.**

What was not read is **not measured**, never a guess: a missing file, a stream with no kept
run, or a GitHub call that failed (named in `github.json`'s `errors`). Exit `0` when the A3 is
written, `2` for a usage error (no `--site`, a directory that does not exist, an unreadable
`--github`). Advisory: **nothing here changes a verdict, a Gate or an exit code**, and nothing
reads `a3.json` but the site. `pages.yml` runs it after the reports are copied, with
`actions: read` for the workflow runs; a failure is a warning and the site deploys without it.

## The overnight readiness page

**`harness readiness --site <dir> [--github f] [--mutants f] [--releases f | --fetch-releases] [--noise-history f]`** (not stable, since 1.17.0) reads the Main to
RC forecasts the pages workflow has copied into the site (`main-preview/reports/index.json` and
the kept `report.json` and rehearsals beside each run) and Main to RC's workflow runs from
`github.json` (the snapshot `harness a3 --fetch-github` writes into the site; `--github f` reads
another), and writes `readiness.html` and `readiness.json`
([`readiness.schema.json`](contract/readiness.schema.json)) into the site.

One row per **calendar night** (UTC) for the last ten nights, tonight included, newest on top.
A night on which a forecast was kept carries, for each run that night (the newest leads): the
commit side b was built from (the full sha when every image agrees, with a link to it in the
monorepo) and its image digests, side a (production) and side b's tag, the Gate
(`confidence.json`'s, or the verdict for a run kept before the score), the unclaimed count, the
index entry's `delta` (new and gone since the previous forecast beside the same production;
"not counted" for a run kept before 1.16.1), and links to the kept `report.html`, its
rehearsals (since 1.16.0, with their verdicts) and the workflow run. The band is left off the
row: while the change-risk review floor caps the score at 74 it is Red on any night the Gate
passes, so the Gate is what the row carries.

A night that kept nothing is said in words, from the workflow history: **unchanged** when Main
to RC finished green and kept nothing (`harness preview resolve` skipped a pair it had already
judged), shown in grey with the Gate of the forecast it repeats and that forecast's commit;
**not judged** when it failed or was cancelled; **running**; **not yet** (tonight, before a
run); **did not run**. Without `github.json`, or when GitHub did not answer for
`main-preview.yml`, such a night is **not known**, never "did not run". Where production moved
between two rows the page draws a rule and says so: the delta starts again.

Since 1.21.0 each forecast carries `informing`: its kept report's informing results that no
claim covers ([Engine levels](#engine-levels)), shown beside the Gate as "N informing" and, on
the latest forecast, in a tile of their own, labelled "reported, never gates"; `null` for a
forecast kept before engine levels. Since 1.22.0 `informingBy` breaks it down by engine (the
policy family's checks among them), in the badge's title and the tile.

Since 1.18.0 each forecast carries `quality`, the same strip the A3 draws under its Gate
([the A3 Aggregator](#the-a3-aggregator)): the row shows Speed, Metrics and Tests as marks, and
the latest forecast at the top shows the whole strip. `--mutants <mutants.jsonl>` is the Tests
mark's weekly self-tests; without it that check is not measured. An unchanged night repeats no
marks ("as then").

**Claims: known and gaps** (since 1.28.1): each forecast carries `claimed`, the differences a
claim covers (its report's "Claimed differences", the known side), beside `unclaimed` (the gaps),
and `coverage`, claimed / (claimed + unclaimed) to three decimals; `null` when its `report.json`
could not be read. The night table shows both, with coverage as a whole percentage rounded down
(so one gap never reads as 100%). `claims` (`src/readiness/claims.ts`) breaks the latest down: the two sides per artefact, most
differences first, each linked to its first row in the kept `report.html` (`#hunk-<id>`); the
**claims owed** (one draft claim per cause, the count the report's "Claims owed" section shows,
linked to `#claims-owed` on a report kept since 1.20.2); the report's claim hygiene; and every
finding to look at twice: a claim that covers more differences than the hygiene threshold, a
broad claim with or without approval, a stale claim (matched nothing), an expired one (past its
lifetime), each linked to its section of the report. A scope longer than 120 characters is cut;
the report has it whole. Informing results are in neither side. The panel (`#claims`) comes
before the control chart. The A3's goal gains a "Claims: known and gaps" row, and the landing
page's readiness card leads with the same sentence. Advisory: nothing here changes a verdict, a
Gate or an exit code.

**The release-size control chart** (since 1.19.0) leads the page: `control` in `readiness.json`
([`release-control.schema.json`](contract/release-control.schema.json)). It plots the size of
each past release of the monorepo in **merged PRs** (the PRs on the first-parent line from the
tag before it, counted as `harness changes` counts them: release/* branches and direct commits
left out), and the batch on main not yet released as a distinct marker. A release is a plain
`vX.Y.Z` tag; two tags more than one major apart are not consecutive releases, so the older only
starts the series. The chart is an XmR (individuals) chart over at most the 30 most recent
releases:

- **centre line** = the mean release size; **mR̄** = the mean moving range |xᵢ − xᵢ₋₁|;
- **UCL** = centre + 2.66 × mR̄; **LCL** = max(0, centre − 2.66 × mR̄);
- a release above the UCL or below the LCL is a **special cause** (`special`);
- with fewer than **10** releases the limits are **provisional** and the WIP limit is the
  centre line instead of the UCL;
- the **WIP limit** on the PRs on main: at or below the centre line, **below the centre line**
  (`below centre`, green); above it and at or below the WIP limit, **a good time to release**
  (`release soon`, amber); over it, **release now** (`release now`, red). The zone is always
  named in words beside its colour.

A second chart plots the count of PRs not yet released, night by night (the newest kept
forecast of each UTC night, from its kept `changes.json`) against the same lines. The sizes come from `releases.json`
([`release-control.schema.json`](contract/release-control.schema.json), `definitions/history`),
which `--fetch-releases` reads from GitHub once per build (GET the monorepo's tags and a compare
per pair of releases; GITHUB_TOKEN or GH_TOKEN, read only) and writes into the site;
`--releases f` reads one, and without either the site's own `releases.json` is read when present.
What GitHub did not answer is a line in its `errors`, and a release it could not count is left
out. Without a history the page draws the batch from the newest forecast's `changes.json` with
no limits and says why; never a guess.

**The soak toward 2.0** (since 1.25.0): `soak` in `readiness.json` and a panel after the control
chart (`#soak`). It counts what the go-live release waits on, from the first night,
**2026-10-02** (`SOAK_FROM` in `src/readiness/soak.ts`), so nobody counts nights by hand:

- a night is **clean** when every nightly A/A of that UTC night was clean and verified (the noise
  history, `noise/noise-history.json` in the site as `pages.yml` copies it, or
  `--noise-history f`) **and** that night's Main to RC forecast measured side a against side a2
  with no difference (its kept `report.json`'s `inRunNoise`);
- **paused** when the A/A was clean and Main to RC skipped a pair it had already judged (an
  unchanged night): a-to-a2 was not measured again, so the night neither counts nor breaks;
- **broken** otherwise: an A/A with differences or on weak evidence, no A/A, a-to-a2 differences,
  a forecast run without a2, a Main to RC run that did not judge or did not run; and every night
  when the A/A history was not read;
- **not yet**: tonight, until its A/A and its forecast have both finished.

The count is the clean nights since the last broken one; the target is **10**, the runway's
"ten consecutive nights with a clean A/A and a clean a-to-a2". Below it, one row per check that
2.0 may make blocking (the policy family): its level now, its **quiet nights** (judged nights
in a row, newest back to the soak's start, with no unclaimed finding on b), its planted mutant
and the newest weekly self-test that planted it (`caught`, `escaped`, `not run yet`), and
whether it is **eligible**: quiet for the target and its mutant caught. A check that fires on
production too is named as such: it cannot stay quiet until production is fixed. The panel is
advisory: it never changes an engine level, a verdict or an exit code; promoting a check stays a
change to `ENGINE_LEVELS`, made at 2.0.

Exit `0` when the page is written, `2` for a usage error (no `--site`, a directory that does not
exist, a `--github` that is not a snapshot, a `--releases` that is not a release history, a
`--noise-history` that is not a noise history, or both `--releases` and `--fetch-releases`). Advisory: **nothing here changes a verdict, a Gate
or an exit code**. `pages.yml` runs it after the A3, which writes `github.json`; a failure is a
warning and the site deploys without it.

## CLI

Full list: [`contract/cli.json`](contract/cli.json). Invoke as `pnpm harness
<command>` from a checkout (Node ≥ 22, `pnpm install`, and for capturing modes
`pnpm exec playwright install chromium` and Docker). Commands and flags marked
`stable: true` there are the ones below; the rest (`harness stack`, `harness
kind`, `harness journeys`, `harness override`, `harness local`, `harness release` (since 1.8.0), `harness confidence` (since 1.9.0), `harness changes` (since 1.10.0), `harness scoreboard` (since 1.11.0), `harness glance` (since 1.12.0), `harness why` (since 1.13.0), `harness prune`, `harness reports`, `harness scorecard`, `harness noise
history`, `--substrate`, `--now`, `--masks`, `--snapshot`,
`--upgrade-*`, `--noise-max-age-days`, `--no-screenshots`, `--no-axe`,
`--no-focus`, `--no-runtime` and `--startup-restarts` (both since 1.2.0),
`--keep`, `--no-stack`) are for people at a terminal and may
change in a minor release.

Which of the 1.3.0 commands are stable (`harness prune` and `harness vuln-db`, new in 1.4.0, are not): `doctor`, `noise record`, `noise status`
and `guard` are, because workflows and the monorepo call them (the workflows'
`noise status --store noise`, the nightly's `noise record`, CI's `guard`, and any
script that asks whether a machine can run the harness). Their flags (`--status`,
`--report`, `--tag`, `--store`, `--run-url`, `--summary`, `--require`, `--for`,
`--base`, `--json`) are stable with them. `harness local` (the maintainer wrappers,
whose steps are planned from the same commands and change with them), `harness
override list` (a listing for people), `harness noise history` (the ratchet as
text; the file `noise-history.json` is what a program reads), `harness prune` (deletes
old run directories and an old image cache: a dry run unless `--yes`, and no workflow
calls it) and the flags only they take (`--only`, `--migrations-a`, `--migrations-b`,
`--interval`, `--port-offset`, `--dry-run`, `--once`, `--record`, `--last`, `--since`,
`--older-than-days`, `--keep-last`, `--keep-days` (since 1.16.0), `--image-cache-days`, `--yes`, `--strict`, `--no-load`) are not,
and neither are `harness release` and the flags only it takes (`--candidate`, `--baseline`,
`--monorepo`, `--fast`, `--open`; since 1.8.0), nor `harness confidence` and the flags it takes
(`--run`, `--migration`, `--upgrade`, `--test-signal`, `--traceability`, `--change-risk`,
`--post-deploy`; since 1.9.0; `harness release` takes the last four too), nor `harness changes`
and the flags only it takes (`--history`, `--changelog`; since 1.10.0; it also takes `--a`, `--b`,
`--monorepo`, `--json` and `--out`), nor `harness scoreboard` and the flags only it takes (`--file`,
`--mutants`, `--noise-history`, `--site`; since 1.11.0; it also takes `--run`, `--tag`, `--run-url`
and `--json`), nor `--scoreboard` of `harness release` (and, since 1.12.0, of `harness
confidence`), nor `harness guard scoreboard` (since 1.11.0; `guard all` runs it too), nor
`harness glance` and the flags only it takes (`--item`, `--mark`, `--by`, `--note`; since
1.12.0; it also takes `--run` and `--json`), nor `harness why` and the flags only it takes
(`--finding`, `--write`; since 1.13.0; it also takes `--run`, `--out`, `--tag`, `--scoreboard`,
`--dir` and `--json`).

| Command | Stable flags |
| --- | --- |
| `harness run` | `--mode` (required), `--a`, `--b` (required except in post-deploy), `--claims <file>`, `--rules <path\|url>` (since 1.3.0: the Rules a claim may name, see [The rules file](#the-rules-file)), `--vex <file>` (since 1.23.0: the release's OpenVEX file, handed to the scanner, see [OpenVEX](#openvex-exceptions-the-scanner-reads)), `--a2` (since 1.24.0, not stable: side a2, see [In-run noise](#in-run-noise-side-a2)), `--noise <file\|dir\|skip\|none>` (omitted: the latest status in the local store, see [`noise-status.json`](#noise-statusjson-and-the-7-day-rule)), `--runs <n>`, `--set <fixture,auth,reference,replay>` (`replay` since 1.28.0), `--journey <name>` (repeatable), `--load <rate>x<duration>`, `--out <dir>`, `--image-prefix <prefix or {app} template>`, `--allow-unsigned`, `--require-verified` (noise mode: write the status `degraded` unless every image on both sides was pulled and verified in this run), `--override-reason <text>` and `--override-by <who>` (see [Overriding a FAIL](#overriding-a-fail)), `--a-digests <digests>` and `--b-digests <digests>` (since 1.3.0: pin a side's images, see [Image digests](#image-digests-and-the-release-record)); post-deploy: `--recorded <release run dir>`, `--production reader=URL,catalogue=URL,live=URL[,time=URL]`, and since 1.3.0 `--deployed <tag>`, `--deployed-digests <digests>` and `--release-record <file\|dir>` (see [Checking a deployment](#checking-a-deployment)) |
| `harness compare` | `--dir <run dir>` (required), `--mode` (required), `--claims`, `--rules`, `--noise` |
| `harness images ensure` | `--a`, `--b` (required), `--a-digests`, `--b-digests` (since 1.3.0: pull by digest, verify on it, refuse a tag that has moved; a pinned image is never built), `--ref-a`, `--ref-b` (monorepo git refs to build from when the pull fails), `--image-prefix`, `--allow-unsigned`, `--image-cache <dir>` (since 1.2.0: refreshed from images pulled and verified in this run; used, as provenance `cached`, only when the registry cannot be reached, and never for a tag the registry says does not exist). With `GITHUB_OUTPUT` set it writes `image_cache=none\|used\|refreshed` |
| `harness mutants` | `--base <tag or reader image>` (required), `--out`, `--image-prefix`, `--allow-unsigned` |
| `harness version` | `--json` |
| `harness doctor` (since 1.3.0) | `--for <nightly,gate,mutants,watch,kind>` (comma separated; default the first four), `--json`. Read-only: what this machine lacks to run the harness, and how to install it. Exit `0` ready (warnings allowed), `1` something a run needs is missing, `2` usage. `--json` prints `{ ok, scopes, platform, checks: [{ id, title, status: ok\|warn\|fail, detail }] }`; a check id may be added in a minor release |
| `harness noise record` (since 1.3.0) | `--status <noise run dir\|noise-status.json>` (required), `--report <report.json>`, `--tag <tag>`, `--store <dir>` (default `<HARNESS_HOME>/noise`), `--run-url <url>`, `--summary <file>`. Appends a night to the store and rewrites its three files, exactly as the nightly publishes them to the `noise` branch: `noise-status.json` (a copy of the status), `noise-history.json`, `noise-summary.md`. Exit `0`, `1` when the ratchet is broken (the count had reached 0 and is not 0 tonight; the files are still written), `2` usage or no status |
| `harness noise status` (since 1.3.0) | `--store <dir>`, `--require`, `--json`. Says whether the latest status licenses a FAIL (clean, without `degraded`, fresh); exit `0`, or `1` with `--require` when it does not. With `GITHUB_OUTPUT` set and a usable status it writes `noise_file=<path>` |
| `harness guard masks\|engine\|all` (since 1.3.0) | `--base <ref>`. The PR guards of CI against a local ref: masks land in their own PR (`masks`); an engine, mask, journey, gate or mutant change needs a harness version bump (`engine`). Compares `<base>...HEAD`. Exit `0`, `1` a violation, `2` when the ref does not exist |
| any | `--help` |

`--a` / `--b` take a bare tag (`16.2.0`), one app's image reference (the other
apps take the prefix and that reference's tag), or
`reader=REF,catalogue=REF,live=REF[,time=REF]` (`time=` is optional since
1.3.0: left out, it takes the prefix's `time` image at the reader's tag, else
the first tag among the others, so a spec written for 1.2 keeps working); in migration mode a monorepo git ref or
`dir:<path>`. Since 1.1.0 a `REF` may be pinned by digest —
`repo:tag@sha256:<64 hex>` or `repo@sha256:<64 hex>` — and then the digest
alone decides what runs. A digest names one image, so `16.2.0@sha256:…` is
refused (exit `2`), as is a lone `repo@sha256:…` with no tag for the other
apps to take.

The image prefix is `--image-prefix`, else the `HARNESS_IMAGE_PREFIX`
environment variable, else `tutors`. It is either a bare prefix
(`tutors` → `tutors/<app>:<tag>`) or, since 1.1.0, a template containing
`{app}` (`quay.io/tutors-sdk/tutors-{app}` →
`quay.io/tutors-sdk/tutors-reader:<tag>`); `<app>` is `reader`, `catalogue`,
`live` or `time` ([images.md](images.md)).

`--allow-unsigned` (or `HARNESS_ALLOW_UNSIGNED=1`) lets a registry image whose
signature could not be verified be judged anyway; the report records it
(`pulled-unverified`, `allowedUnsigned`). The workflows never pass it.

Environment variables in the contract, all since 1.1.0 unless the row says otherwise:

| Variable | Default | Meaning |
| --- | --- | --- |
| `HARNESS_IMAGE_PREFIX` | `tutors` | as above |
| `HARNESS_COSIGN_IDENTITY` | `^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@` | regular expression the signing certificate's identity must match; empty means the default |
| `HARNESS_COSIGN_ISSUER` | `https://token.actions.githubusercontent.com` | the certificate's OIDC issuer; empty means the default |
| `HARNESS_ALLOW_UNSIGNED` | unset | `1`, `true` or `yes`: the same as `--allow-unsigned` |
| `HARNESS_HOME` | `<checkout>/.harness` | since 1.3.0. Where the harness keeps what outlives a run on this machine: the noise store (`noise/`, the default source of `--noise`), the release records (`releases/`), the override log, the image cache. See [local.md](local.md) |
| `HARNESS_PROJECT` | `tutors-harness-<8 hex>` | since 1.3.0. The name of this checkout's compose project and kind cluster when the next two do not say. Unset, it is `tutors-harness-` and the first 8 hex characters of the SHA-256 of the checkout's real path (lowercased on Windows): two checkouts or git worktrees never share a stack, and one checkout always gets the same name. `harness doctor` prints the names this checkout uses |
| `HARNESS_COMPOSE_PROJECT` | derived | since 1.3.0 (an override that already existed). The compose project of the stack; wins over `HARNESS_PROJECT` |
| `HARNESS_KIND_CLUSTER` | derived | since 1.3.0 (an override that already existed). The kind cluster; wins over `HARNESS_PROJECT`. `tutors-harness` is refused: it is the pre-1.3.0 default name, and a cluster of that name is never adopted or deleted |
| `HARNESS_CLAIM_MAX_HUNKS` | `10` | since 1.2.0: a claim covering more failing hunks than this is flagged in `claimHygiene`; a positive integer, else the default. `--claim-max-hunks` overrides |
| `HARNESS_SBOM_SOURCE` | `auto` | since 1.2.0. Where each image's SBOM comes from: `auto` or `attestation` (the cosign SPDX attestation of a pulled image), or `generate` (a local generator, on both sides) |
| `HARNESS_SBOM_CMD` | `syft docker:{image} -o spdx-json`; on a Windows host `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock anchore/syft:latest docker:{image} -o spdx-json -q`, because native syft cannot unpack an image there (colons in layer file names) | since 1.2.0. The generator for `generate`; `{image}` is the image reference. Split on whitespace and quotes; no shell |
| `HARNESS_VULN_CMD` | `grype sbom:{sbom} -o json` | since 1.2.0. The scanner; `{sbom}` is the path of the SPDX SBOM; must print grype or trivy JSON. trivy: `trivy sbom --format json {sbom}` |
| `HARNESS_VULN_DB_DIR` | unset | since 1.2.0. A pre-fetched scanner database directory. Scanner database updates are always switched off, so a scan uses exactly this database. Since 1.4.0, unset means `<HARNESS_HOME>/vuln-db` when `harness vuln-db update` has created it, else the scanner's own cache |
| `HARNESS_VULN_DB_MAX_AGE_DAYS` | `5` | since 1.4.0. Days since the vulnerability database was built beyond which `harness doctor` warns; also passed to grype as its own limit (`GRYPE_DB_MAX_ALLOWED_BUILT_AGE`), so a scan and the doctor agree. 5 days is grype's own default |
| `HARNESS_ROLLBACK_ISSUE` | unset | since 1.4.0. Post-deploy wording only: `1`, `true` or `yes` says a CI step opens a rollback issue on a FAIL (the reason says `open a rollback issue`); `0`, `false` or `no` says none does (`decide whether to roll back`). Unset: GitHub Actions has the step, anything else does not |
| `HARNESS_REQUIRE_ARTEFACTS` | unset | since 1.4.0. A comma separated list of artefacts (`image-manifest`, `sbom`, `vulns`, `runtime`, `startup`, `bus`), or `static` (the first three), or `all`, whose "not collected" gap is a failing hunk instead of an informational one. It only adds to what is already required (`runtime` and `startup`); a name it does not know is an error (exit 2), so a typo cannot loosen a gate. See [Not collected](#not-collected-one-convention) |
| `HARNESS_MONOREPO_DIR` | unset | since 1.8.0. The monorepo checkout `harness release` reads `release/deployed.json` (the baseline, when `--baseline` is `prod` or omitted) and `release/claims.yaml` (when `--claims` is omitted) from, and since 1.23.0 `release/openvex.json` (when `--vex` is omitted); `--monorepo` overrides |
| `HARNESS_REQUIRE_STATIC` | unset | `1`, `true` or `yes`, since 1.2.0: the same as `HARNESS_REQUIRE_ARTEFACTS=static`, kept as an alias; the two add up |

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
| `release-candidate` | `release.yml` — release mode (5 runs, k6 `20x30s`), migration rehearsal, upgrade rehearsal, as three jobs; then the release record is published | `production` (required): production tag, side a. `candidate` (required): candidate tag, side b. `claims_url`: a URL the runner can `curl` without credentials; omitted means no claims. `rules_url` (since 1.3.0): a URL the runner can GET without credentials for `rules.json` ([The rules file](#the-rules-file)); a claim that names a `rule` needs it. `runs`: default `5` (was `3`; three cannot reach alpha, see [Changes](#changes)). `migrations_a`, `migrations_b`: monorepo git refs for migration mode; default `v<production>` and `v<candidate>`. Since 1.3.0: `production_digests`, `candidate_digests`: objects `app -> sha256:<64 hex>` ([Image digests](#image-digests-and-the-release-record)) |
| `deployed` | `post-deploy.yml` — post-deploy mode against `HARNESS_PRODUCTION_URLS` | Since 1.3.0, both optional: `production` (the tag that was deployed) and `digests` (an object `app -> sha256:<64 hex>`: the images that run), compared with the release record ([Checking a deployment](#checking-a-deployment)). Without them (every 1.2.0 payload) nothing is compared. The recorded side is the `release-report` artifact of the latest successful `release.yml` run; the payload cannot choose it (by hand, `workflow_dispatch` with `recorded_run_id` can) |

Any other event type is ignored. Unknown payload fields are ignored. A missing
required field fails the run at its first harness step (exit `2`).

`release.yml` also takes the same values as `workflow_dispatch` inputs
(`production`, `candidate`, `claims_url`, `rules_url` (since 1.3.0), `migrations_a`,
`migrations_b`, `runs`) and, since 1.2.0, `override_reason` (a `workflow_dispatch` input only:
see [Overriding a FAIL](#overriding-a-fail)); `nightly-noise.yml` and
`weekly-mutants.yml` take `tag`.

### Repository variables (on this repository)

| Variable | Default when unset | Used for |
| --- | --- | --- |
| `HARNESS_IMAGE_PREFIX` | `quay.io/tutors-sdk/tutors-{app}` (since 1.1.0; was `tutors`) | where bare tags are resolved: a prefix or an `{app}` template. When the registry lacks the tag the workflows still build from the monorepo ref, as before, and the report says `built-from-ref` |
| `HARNESS_COSIGN_IDENTITY` | `^https://github.com/tutors-sdk/tutors-mono-repo/\.github/workflows/image-build\.yml@` (since 1.1.0) | who must have signed a pulled image: the monorepo's `image-build.yml` workflow. Set it only if the signing workflow is another |
| `HARNESS_PRODUCTION_TAG` | `main` | the tag nightly noise, weekly mutants and CI's smoke run use; the deploy updates it |
| `HARNESS_PRODUCTION_URLS` | `reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev` | the live deployment post-deploy mode reads; `time=<URL>` may be added (since 1.3.0), and is optional |

Every job that runs `harness images ensure` first installs cosign ≥ 3 with
`sigstore/cosign-installer`; the images are public, so no registry credentials
are held.

Since 1.4.0 the jobs that judge images (nightly noise, the release job, weekly
mutants, and since 1.5.0 the Main to RC preview) also install grype, pinned (`anchore/scan-action/download-grype`), fetch
its vulnerability database once with `harness vuln-db update` into
`.harness/vuln-db`, cache it per UTC day and grype version, and never update it
during a run; the nightly, release and preview jobs set `HARNESS_REQUIRE_STATIC=1`, the
mutants job does not. See [`contract/workflows.json`](contract/workflows.json)
(`tools.grype`, `vulnerabilityDatabase`) and
[images.md](images.md#the-vulnerability-database).

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
| `mutant-noise-report` | `weekly-mutants.yml` | 7 days (only when the self-test failed: the A/A report of the base, reports and captures only) |
| `mutants-summary` | `weekly-mutants.yml` | 14 days (since 1.11.0: `out/mutants.json` only, what the `record` job puts on the scoreboard) |
| `harness-ci` | `ci.yml` | 7 days |
| `main-preview-report` | `main-preview.yml` | 14 days (since 1.5.0; see [Main to RC](#main-to-rc)) |
| `main-preview-migration-report` | `main-preview.yml` | 14 days (since 1.13.1: the forecast's migration rehearsal) |
| `main-preview-upgrade-report` | `main-preview.yml` | 14 days (since 1.13.1: the forecast's upgrade rehearsal) |

Each job also appends `report.md` to its step summary. A `release.yml` run
concludes `failure` when any of its three jobs exits non-zero, `success`
otherwise — including on `warn`. Since 1.4.0 the run is titled for the candidate
(`run-name: release <candidate>`, `workflows.json` `runNames`), so a caller that
dispatched `release-candidate` can find the run it started by title; a title matches only
as a whole tag (`16.3.0-rc.1` is not `16.3.0-rc.10`).

### Kept reports

Since 1.5.0. An artifact expires, and reading one needs a token.
So the branches the workflows already push also keep each run's `report.json`,
`report.md` and `report.html` (no captures, screenshots or k6 output), with an
index, readable by anyone at a raw URL:

| Branch | Written by | Keeps |
| --- | --- | --- |
| `noise` | `nightly-noise.yml`, `publish` job | the last 14 nights |
| `release-records` | `release.yml`, `publish-record` job | every judged candidate |
| `main-preview` | `main-preview.yml`, `publish` job | the last 60 forecasts, and since 1.16.0 every forecast of the last 10 days ([Main to RC](#main-to-rc)) |

`reports/index.json` is `{ "schemaVersion": 1, "runs": [...] }`, newest first. Each
run has `id` (`<ranAt>-<mode>`, the colons as dashes: `2026-09-26T07-57-09Z-noise`),
`mode`, `ranAt`, `verdict`, `reasons`, `sides`, `harnessVersion`, `runUrl` and
`files`, paths relative to `reports/`, and `score` (`score`, `grade`, `normalness`,
`manual`: the scorecard's headline). `harness reports keep` writes both (see
[CLI](#cli)); keeping is best effort and never stops the status or record being
published. No new branch, write permission or push, apart from `main-preview`
below.

Since 1.13.1, a release run scored beside it (a `confidence.json` in its directory whose
`run.ranAt` is the report's, as [Main to RC](#main-to-rc) leaves one) is kept with its
score: `confidence.json`, and `changes.json` when it is there too, byte for byte, and its
`report.md` and `report.html` are led the way `harness release` leads its own: the Gate,
the RCS and its band, the reviewer's glance, the dimension table, the change risk per PR,
then the run's own report unchanged (in `report.md` folded, as `gate.md` folds a step's
report). The run's entry in `index.json` then also has `confidence` (`gate`, `rcs`, `band`,
`meaning` and `note` when the score has them, `glance`: the number of places to look,
`scoredBy`: the harness that scored it) and `changes` (`score`, `prs`, `risky`: the PRs
with a deduction, `floorBreached`, `range`). Both are optional: a run kept before 1.13.1, or
not scored, has neither, and a reader must not invent them. `report.json` is still kept byte
for byte.

Since 1.16.0, `--keep-days n` is a floor under `--keep-last`: a run whose `ranAt` is less than
`n` days before the keep is never dropped, whatever the count, so a day of runs by hand cannot
push a night out of the record (400 runs is the ceiling of any store either way). And
`--migration` and `--upgrade` keep the run's two rehearsals beside it, in
`reports/<id>/migration/` and `reports/<id>/upgrade/` (`report.json`, `report.md` and
`report.html`, byte for byte, listed in `files`). The kept `confidence.json` then links them
there: every path it wrote relative to the runner's rehearsal directory
(`run.reports.migration`, `run.reports.upgrade` and the Rehearsals dimension's evidence, such
as `../../rehearsals/upgrade/<ranAt>-upgrade/report.html#upgrade`, which the pages never had)
reads from the kept copy (`upgrade/report.html#upgrade`), and nothing else in it changes. A
rehearsal that cannot be kept (no report, or a report of another mode) is said and skipped;
the run is kept without it. Without either flag `confidence.json` is kept byte for byte, as
before.

Since 1.16.1 the index has a schema, [`reports-index.schema.json`](contract/reports-index.schema.json),
and a release run's entry carries `delta`: what moved in its unclaimed set since the previous
kept release run beside the same baseline (side a's reader tag), read from that run's kept
`report.json`. `baseline`; `against` (`id`, `ranAt`, `candidate`, `harnessVersion` of the run
compared with, or `null` when none was kept beside this baseline: the first forecast, or
production moved, so two baselines are never compared); and, when `against` is not null,
`new`, `gone` and `byArtefact` (`{ new, gone }` for each artefact where something moved). A
difference is the same in both runs when its artefact, its scope and its summary with every
number masked are (hunk ids carry a counter, and a summary's line counts or milliseconds move
from night to night); both are counted as multisets, so `new - gone` is always the change in the
unclaimed count. A kept report that is led (a scored run) leads with **New since the last
forecast** right under the Gate: the counts, the first 15 new differences, each linked to its row
in `report.html`, and the first 10 gone ones; and it says when the run compared with was judged
by another harness version, since a harness change can move differences too. `delta` is absent
on a run kept before 1.16.1 and on a run of another mode. Advisory like the rest of the index: no
verdict, Gate or exit code reads it.

Since 1.20.1 a led report follows **New since the last forecast** with **Causes and the PRs
behind them** (`src/changes/attribute.ts`): each cause of the run ([Causes](#causes)) with the
pull requests of its kept `changes.json` that could have made it. A cause whose key the previous
forecast (the delta's `against`) did not have is new, and only the PRs merged since can have made
it: those in this run's `changes.json` and not in that run's. Of those, the ones whose files
match the cause's paths are named, or all of them when none match. Every other cause is matched
by path: for a page, log, metric or journey table the app's own source (`apps/<app>/**`, direct)
and then `packages/**`; for an image a Dockerfile (direct) and then a package manifest or
`pnpm-lock.yaml` (`sbom`, `vulns`). Documentation, tests and workflows never match. The first
three PRs of each cause are named, most direct files first. No field is added to `report.json` or
the index; a lead to ask, never read by a verdict, the Gate or an exit code.

Since 1.20.2 a led report of a **forecast** (side b is a build of main, `sha-<short>`) shows
**Claims owed** where the reviewer's glance was (`src/claims/draft.ts`); a release candidate
keeps its glance. One draft claim per cause, as `release/claims.yaml` list items (`artefact`,
`scope`, `rule`, `reason`, the monorepo's fields), each under a comment that says how many
differences it covers. The scope is the narrowest glob the harness finds that covers every
difference of the cause, checked with the claims matcher against the run's unclaimed set: one
scope as it is, `app/name` scopes as `*/{names}` or `{apps}/{names}`, otherwise a brace list
with the common prefix and suffix taken out; of these, the one that takes fewest differences of
other causes, then the shortest. Glob characters in a scope (`{{hash}}`, a comma) are escaped.
The comment says when a draft would also take a difference of another cause. The `reason` names
the cause, where it is, and the PRs [attribution](#kept-reports) named for it. The `rule` is
`"????"`, which the claims schema (and the monorepo's `pnpm check:release-claims`) refuses, so a
draft pasted unedited stops the run with exit `2` instead of claiming anything: a person names
the Rule, or gives the CHANGELOG entry as the reason, or fixes the difference. Nothing that
judges reads a draft. The index's `confidence.glance` still counts the glance in
`confidence.json`.

Since 1.18.0 a release run keeps `quality.json` beside it, byte for byte and listed in `files`,
when its directory holds the monorepo's quality record ([`confidence.json`](#confidencejson-the-release-confidence-score),
Test signal's two halves): [Main to RC](#main-to-rc) fetches it there. A file that is not a
record is not kept. The quality strip reads it.

Since 1.5.0 the same reports are also a website:
[tutors-sdk.github.io/tutors-release-harness](https://tutors-sdk.github.io/tutors-release-harness/).
`pages.yml` copies each branch's `reports/` beside `site/index.html`, which lists
them newest first with each run's verdict, score and scorecard, and deploys the
lot to GitHub Pages after every workflow that keeps a report. Its `deploy` job
holds `pages: write` and `id-token: write`, and writes no branch. Since 1.11.0 it also
runs `harness scoreboard trends --site` on the `scoreboard` branch and the `noise` branch's
history, and serves `scoreboard.html` and `scoreboard.json` beside the index
([the scoreboard](#the-scoreboard)); with no branch yet the page says "no releases scored yet".
Since 1.13.1 the page opens with the newest Main to RC forecast, "What main would ship
today": its Gate, RCS and band with the band's meaning, what stops the line, the glance
with its links, the change risk per PR, when it ran and with which harness, and links to
the full report, [docs/lean.md](lean.md) and the how-to-run guide. A forecast kept
before the score existed says so and shows no number.
Since 1.17.0 its top links `readiness.html`, [the overnight readiness page](#the-overnight-readiness-page),
which `pages.yml` builds after the A3.
Since 1.25.2 the index is the harness's landing page. "Start here", before every section, links
the readiness page and its `#control` (the release-size control chart) and `#soak` sections,
`a3.html`, the forecasts, the rehearsals, the release candidates, the nightly A/A,
`scoreboard.html`, and the user guide on GitHub. Under the readiness link it shows that page's soak headline and
control-chart summary, read from `readiness.json`. A **Rehearsals** section lists each kept run's
`migration/report.html` and `upgrade/report.html`, with the verdicts `readiness.json` has for them.
`readiness.html`, `a3.html` and `scoreboard.html` link back to the index (`home`) and to each other.

Each kept run also has `scorecard.json` and `scorecard.md` (`harness scorecard`,
`src/ci/scorecard.ts`), derived from its `report.json` alone. **Informational:
it never changes a verdict, an exit code or the gate.**

- `score` 0-100 and `grade` (A ≥ 90, B ≥ 75, C ≥ 60, else D), with every
  `deduction` and its reason: unclaimed diffs (15 each, at most 60; in noise mode
  5 each, at most 40), an A/A status that is missing, noisy or degraded (10),
  broad claims without an approver (10 each, at most 20), claims that matched
  nothing (5 each, at most 15), claims flagged for covering many diffs (3 each, at
  most 9), an overridden FAIL (20).
- `normalness`: `normal`, `noisy`, `degraded` or `unknown`, from this run's own
  diffs in noise mode, else from the `noise` status the run consulted.
- `rules`: one row per EARS Rule a claim cited (by `rule`, or "Rule NNNN" in the
  reason), per CHANGELOG reason, per stale claim, and one for unclaimed diffs, with
  the diffs, artefacts, scopes and PRs. PRs are a Rule's `prs` in rules.json (an
  optional key the monorepo may publish; the rules schema already allows unknown
  keys) and "PR #n" in the claim's reason.
- `manual`: at most five pages or scopes to test by hand: unclaimed diffs first,
  then claimed diffs in `screenshot`, `axe`, `focus` or `dom`, then diffs covered
  only by a broad claim.

### Main to RC

Since 1.5.0. `main-preview.yml` answers "what would release mode say
if main were cut as a release candidate today?", every day as soon as the nightly
A/A on main finishes (`workflow_run`, whether it passed or failed; not a cancelled
one, nor one on another branch) (and by hand, `workflow_dispatch` with optional `production`, `candidate`,
`force` and, since 1.24.0, `a2`: side a2 and the [in-run noise](#in-run-noise-side-a2); since
1.25.0 on every night and on a dispatch unless unticked). It is a **forecast, never a gate**: it tags, records and deploys nothing,
and it cannot be mistaken for a judged candidate, because it never writes the
`release-records` branch that post-deploy reads.

- **Side a** is production as the monorepo's `release-dispatch.yml` reads it: the
  first `newTag` of `deploy/k8s/overlays/reader/kustomization.yaml` on main.
- **Side b** is `sha-<short>` of the newest commit on main whose `image-build.yml`
  push run succeeded, so its four images are signed and attested. (`:main` is
  pushed before it is signed; a run that picks it up in that window cannot verify it.)
- **Claims** are `release/claims.yaml` at that commit, the next release's claims so
  far; the Rules they may name come from `pnpm release:rules` at the commit, best
  effort, as in the monorepo. Since 1.23.0 `release/openvex.json` beside them, when main has
  one, goes to the scanner ([OpenVEX](#openvex-exceptions-the-scanner-reads)). Every unclaimed diff is a claim, or a fix, the next
  release needs, which is the forecast's point.
- **The judging** is the release job's: 5 runs, k6 `20x30s`, the pinned
  vulnerability database with `HARNESS_REQUIRE_STATIC=1`, the latest noise status.
  PASS, WARN and FAIL all end the run green; only exit `2` (could not judge) fails it.
- **Skipped** when this harness version has already judged the same pair (the
  `main-preview` branch's `reports/index.json`), so a quiet day is one API call.
  `harness preview resolve` (not stable) makes that decision.
- **Rehearsed** (since 1.13.1) as a candidate is: the `migration` job runs migration
  mode from `v<production>` to the judged commit, the `upgrade` job the rollout under
  load, as `release.yml` does. A FAIL is a forecast here too; only exit `2` fails a job.
- **Scored** (since 1.13.1) in the `publish` job, after every verdict and never an
  input to one, as `release.yml`'s `scoreboard` job scores a candidate: `harness changes
  --a <production> --b <commit>` over the monorepo's history (`changes.json`), then
  `harness confidence` over the release run, both rehearsals and `changes.json`, with the
  `scoreboard` branch's `releases.jsonl` for the glance's novelty (`confidence.json`).
  Since 1.20.4 `harness changes` is given `--changelog`: the monorepo's `pnpm release:changelog
  --from v<production> --to <commit> --json`, built in the same full-history checkout, so orphan
  diffs are measured on a forecast, whose CHANGELOG.md has no section for a commit. When it cannot
  be built, or is not version 1, changes runs without it and orphan diffs stay not measured.
  Since 1.18.0 the score's Test signal reads the monorepo's quality record for the judged
  commit, or the newest first-parent commit before it that has one (the last 60; the
  monorepo's Nightly starts at 03:00 UTC, so a forecast can finish first), saved beside the
  run as `quality.json` and passed as `--test-signal`, joined by the harness's own newest
  weekly mutants self-test (`--mutants`, the `scoreboard` branch's `mutants.jsonl`). No
  `quality` branch yet, or no record within those commits, leaves Test signal not measured.
  Both are advisory: a step that cannot run says why and the forecast is kept without it.
  Nothing is appended to the scoreboard: a forecast is not a release.
- **Kept** on the `main-preview` branch, one commit per run, never forced, the last
  60 runs and (since 1.16.0) every run of the last 10 days: `reports/index.json` and each
  run's report and scorecard, as in [Kept reports](#kept-reports), and since 1.13.1 its
  `confidence.json` and `changes.json`, the kept report led by the Gate, the RCS, the glance
  and the change risk. Since 1.16.0 the migration and upgrade rehearsals are kept beside it
  (`migration/`, `upgrade/`) and the kept `confidence.json` links them there, so the
  Rehearsals dimension's evidence opens on the pages after the 14-day artifact is gone. Since
  1.16.1 each forecast's entry carries `delta`, what is new and gone in its unclaimed set since
  the previous forecast beside the same production, and its kept report leads with the new ones.
  Since 1.20.1 the lead names the PRs behind each cause: a new one against those merged since.
  Since 1.20.2 it shows the claims it owes, one draft per cause, where the glance was.
  Since 1.18.0 the quality record the score read is kept beside it (`quality.json`).
  The report pages show the newest at the top.

## What the harness does to a pull request

Nothing. The harness has no token for the monorepo and its workflows never
hold `pull-requests`, `checks`, `statuses` or `deployments` permission (a test
enforces this). It will not comment on a PR, set a commit status, create a
check run, tag, label, approve or merge, in any repository, and pushes to none
but the branches named below.

What it does instead:

- writes `report.md` — shaped to be a PR comment — to the artifact and the
  run's step summary. Posting it on the release PR, and turning the run's
  conclusion into a check, is the monorepo's job, with the monorepo's token;
- in `post-deploy.yml` only, and only with `issues: write` on **this**
  repository: opens an issue labelled `rollback` with `report.md` as its body
  when post-deploy mode exits `1` (since 1.13.0 followed, folded, by the 5 Whys stub
  `harness why --finding rollback` writes; no new permission);
- since 1.2.0, in `release.yml` only, the `override-record` job, with
  `issues: write` on **this** repository: opens an issue labelled
  `harness-override` for each FAIL a person overrode;
- since 1.2.0, in `nightly-noise.yml` only, the `publish` job, with
  `contents: write` on **this** repository: force-pushes the `noise` branch
  (the latest A/A status, its history and summary, and since 1.5.0 the last 14
  nights' reports);
- since 1.3.0, in `release.yml` only, the `publish-record` job, with
  `contents: write` on **this** repository: pushes the `release-records` branch
  (`releases/<candidate>.json` and `releases/<release>.json`, see [the release
  record](#the-release-record), and since 1.5.0 each candidate's report);
- since 1.5.0, in `main-preview.yml` only, the `publish` job, with
  `contents: write` on **this** repository: pushes the `main-preview` branch
  ([Main to RC](#main-to-rc));
- since 1.11.0, in `release.yml` the `scoreboard` job and in `weekly-mutants.yml` the `record`
  job (scheduled and dispatched runs only), each with `contents: write` on **this** repository:
  append to the `scoreboard` branch ([the scoreboard](#the-scoreboard)), never forced;
- since 1.5.0, in `pages.yml` only, the `deploy` job, with `pages: write` and
  `id-token: write` on **this** repository: publishes the kept reports to GitHub
  Pages ([Kept reports](#kept-reports)). No other branch, no tag, no release, no other
  repository. A test lists these write scopes and fails on any other.

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
PR that changes what the harness compares or gates on — an engine, a collector, a mask, a
journey, a fixture, a stack, the gate, a mutant (`src/ci/engine-change.ts` lists the paths; CI
enforces it and re-runs the mutants, see [TESTING.md](../TESTING.md)). Two
reports are comparable only when their `harness.version` is the same: a new
mask or engine can change the hunks for the same two images without any
change to this contract.

Releases are git tags `v<harness version>` on `main`, created by `tags.yml` on the first commit that carries each version.

## Changes

### 1.28.1 (patch; claims: known and gaps)

The release note is [releases/1.28.1.md](releases/1.28.1.md). A patch: three optional fields on
each forecast in `readiness.json` (not stable), and pages; no input, `report.json` field, verdict,
Gate or exit code changes.

- [The overnight readiness page](#the-overnight-readiness-page): each forecast's `claimed`,
  `coverage` and `claims` ([`readiness.schema.json`](contract/readiness.schema.json)); a Claimed
  and a Coverage column in the night table; and a **Claims: known and gaps** panel (`#claims`)
  for the latest forecast: claimed beside unclaimed per artefact, the claims owed, and the
  claim-hygiene findings (too broad, stale, expired), each linked to its section of the kept
  report.
- The A3's goal gains "Claims: known and gaps"; `site/index.html`'s readiness card leads with
  the same sentence, linked to `readiness.html#claims`.
- `site/index.html` no longer scrolls sideways at 375px: a long path in the latest forecast's
  change-risk list wraps.

### 1.28.0 (minor; the replay set, informing)

The release note is [releases/1.28.0.md](releases/1.28.0.md). Runway improvement G. A minor: a new
journey set (`replay`), a new journey (`replay-course-urls`) and a new artefact name (`replay`).
The check ships **informing**, so no verdict, Gate or exit code moves.

- [The replay set](#the-replay-set): a fixed list of fixture-course URLs (`traffic/replay/urls.ts`),
  opened once per side and compared on status, headers and network only. No other engine sees those
  pages.
- `--set` takes `replay`, and the default is all four sets. Seven journeys in four sets.
- A claim may name `replay` (twenty-five artefact names). `report.schema.json`'s artefact enum gains it.
- A new planted mutant, `replay-header`, must be attributed to it: sixteen mutants. The readiness
  soak watches it beside the other informing checks.

### 1.27.0 (minor; asset-graph folding, informing)

The release note is [releases/1.27.0.md](releases/1.27.0.md). Runway change 9. A minor: a new
check and artefact name, `asset-graph`. It ships **informing**, so no verdict, Gate or exit code
moves, and `network` and `headers` are unchanged.

- `asset-graph` ([Asset-graph folding](#asset-graph-folding)): one hunk per app whose immutable
  assets moved, with the requests a to b (JS, CSS), their bytes, and how many `network` and `headers`
  differences are this churn. `foldAssetChurn` turns those into information once the check is
  blocking (2.0). Until then it returns the hunks unchanged.
- A claim may name it (twenty-four artefact names). `report.schema.json`'s artefact enum gains it.
  A capture's network entry gains optional `bytes` (`content-length`).
- A new planted mutant, `extra-chunk`, must be attributed to it: fifteen mutants. The readiness
  soak watches it beside the other informing checks.

### 1.26.0 (minor; the timing tolerance, informing)

The release note is [releases/1.26.0.md](releases/1.26.0.md). Runway improvement D. A minor:
a new check and artefact name, `timing-tolerance`. It ships **informing**, so no verdict, Gate or
exit code moves.

- `timing-tolerance` ([The timing tolerance](#the-timing-tolerance), `src/compare/tolerance.ts`):
  a significant slowdown of at least `TIMING_TOLERANCE` (10%) of a's median, on timing's own
  samples and scopes (page TTFB, journey duration, the k6 leg's p95). A finding says whether
  `timing` fails it too or only the tolerance reports it, and the smallest slowdown the samples
  could have detected. `ENGINE_LEVELS` lists it as informing with no `blockingFrom`.
- A claim may name it (twenty-three artefact names). `report.schema.json`'s artefact enum gains it.
- A new planted mutant, `slow-ssr-mild` (150 ms on every HTML response), must be attributed to
  it: fourteen mutants.
- The readiness page's soak watches every informing check (`SOAK_CHECKS`): the policy family and
  now the timing tolerance, each with its quiet nights and its planted mutant.

### 1.25.2 (patch; the landing page, and the usage audit)

The release note is [releases/1.25.2.md](releases/1.25.2.md). A patch: no input, output field or exit
code changes.

- `site/index.html` is the landing page ([kept reports](#kept-reports)): "Start here" links the
  readiness page with its `#control` and `#soak` sections, the A3, the forecasts, a new
  **Rehearsals** section, the scoreboard and the guides. `readiness.html`, `a3.html` and
  `scoreboard.html` link back to it.
- The documented usage was run from a clean checkout. `harness compare`'s usage now lists
  `--masks`, which it always took. Several examples in the docs were wrong and are fixed: the
  `pnpm stack:down` example, the upgrade rehearsal's mutant command in `TESTING.md`, and the
  version output example.

### 1.25.1 (patch; claims with a lifetime: until and digests)

The release note is [releases/1.25.1.md](releases/1.25.1.md). Runway improvement E. A patch for two
optional claim fields and one optional `report.json` field; a claims file without them is read and
matched exactly as before, and a run with them decides exactly what it would without them.

- A claim may carry `until` (the last UTC day, `"YYYY-MM-DD"`, or release, `"X.Y.Z"`) and `digests`
  (app to `sha256:` digest), [the claims file](#claims-file). A claim past either is **expired**.
- `CLAIM_LIFETIME_LEVEL` is **informing**: an expired claim still covers. `report.json` gains
  `claimLifetimes` (`level`, and per claim `state`, `why` and `covers`), shown beside the A/A lines
  in `report.html` and `report.md`. 2.0 makes it blocking: an expired claim is left out before
  matching and is stale.
- The monorepo's `pnpm check:release-claims` accepts both fields and the three policy-check
  artefacts (tutors-mono-repo, Rules 0230 to 0233).

### 1.25.0 (minor; soak prep: a planted mutant per policy check, a2 every night, the clean-night count)

The release note is [releases/1.25.0.md](releases/1.25.0.md). The soak toward 2.0 can be counted
from the night of 2026-10-02. A minor for three mutant kinds, one finding and one optional field;
no engine level changes and nothing new gates.

- `mutants/mutants.yaml` plants one fault per policy check: `secret-env` (`planted-secret`),
  `vulnerable-package` (`planted-vuln`) and `unsigned-build` (`unsigned`), thirteen mutants in
  all. An informing check catches its mutant with a finding the base did not have in the A/A;
  `mutants.json` and `scoreboard/mutants.jsonl` gain `planted` and `byInforming`. See
  [The policy family](#the-policy-family).
- `build-provenance` reports an image the run did not pull and verify (`local`,
  `built-from-ref`, `pulled-unverified`) as the finding `<app>/unverified`, where it said
  `not-evaluated`. Informing, so no verdict moves.
- `main-preview.yml` passes `--a2` every night, and its dispatch input `a2` defaults to on.
- `harness readiness` takes `--noise-history` and writes `soak` into `readiness.json`
  ([`readiness.schema.json`](contract/readiness.schema.json)), drawn as the soak panel: clean
  nights in a row against 10, and each check's quiet nights and planted mutant. See
  [The overnight readiness page](#the-overnight-readiness-page).

### 1.24.0 (minor; in-run noise: side a2)

The release note is [releases/1.24.0.md](releases/1.24.0.md). The fourth and last step of the
"Policy" release. A minor for one new flag (not stable) and one optional `report.json` field; a run
without `--a2` is the run it was, and a run with it decides exactly what it would without it.

- `harness run --mode release --a2` (compose) starts side a2, a second copy of side a's four apps
  (compose profile `a2`, host ports 3400 to 3404), captures it once for `dom`, `network`,
  `console`, `headers`, `axe` and `focus`, and compares it with a's run 1. See
  [In-run noise: side a2](#in-run-noise-side-a2).
- `report.json` gains `inRunNoise` (the a/a2 differences, and `alsoOnB`, the a/b differences with
  the same artefact and scope); `report.html` and `report.md` say it beside the A/A line. Never
  read by the verdict, Gate or exit code.
- `harness compare --dir` reads `a2/capture.json` when the run kept one. `harness local gate`
  takes `--a2`. `main-preview.yml` gains the dispatch input `a2` (default off).
- The compose file publishes 19 host ports (four for a2), each with a variable
  (`READER_PORT_A2`, `CATALOGUE_PORT_A2`, `LIVE_PORT_A2`, `TIME_PORT_A2`).

### 1.23.0 (minor; OpenVEX: exceptions the scanner reads)

The release note is [releases/1.23.0.md](releases/1.23.0.md). The third step of the "Policy"
release. A minor for one new stable flag; a run without it is the run it was, so no verdict, Gate
or exit code changes for a run that passes today.

- New stable flag `harness run --vex <file>`: the release's OpenVEX document, checked before any
  stack starts (exit `2` with the statement and field when the harness cannot use it) and handed
  to grype or trivy as `--vex` on both sides. See
  [OpenVEX](#openvex-exceptions-the-scanner-reads). `not_affected` needs a standard justification.
- The capture's vulnerability scan gains `vex` (the file's name, sha256, statement counts and the
  advisories set aside); the report's image artefacts line for `vulns` says what it set aside.
- `release.yml` fetches `openvex.json` beside `claims_url`, and Main to RC beside main's claims;
  none there runs without one. `harness local gate` takes `--vex`, and `harness release` reads
  `release/openvex.json` in the monorepo checkout when `--vex` is omitted.

### 1.22.0 (minor; the policy family: what b must be)

The release note is [releases/1.22.0.md](releases/1.22.0.md). The second step of the "Policy"
release. A minor for three artefacts and the new capture and `readiness.json` fields; no command,
flag, verdict, Gate or exit code changes, because all three checks are informing.

- Three artefacts, the policy family, judged on b alone (`src/compare/policy.ts`):
  `image-hardening` (root user, no healthcheck, a secret in the environment or the layer
  history), `build-provenance` (no SLSA provenance verified under the publishing identity, or a
  builder other than `image-build.yml`) and `vuln-ceiling` (a critical or high advisory with a
  fix available). See [The policy family](#the-policy-family). All three are **informing**
  (`ENGINE_LEVELS`), with no date set: reported, never gated, claimable like any hunk.
- Collection gains `docker image history --no-trunc` per image (scanned for secrets; names only)
  and, for an image pulled and signature-verified in the run, `cosign verify-attestation --type
  slsaprovenance1` and `slsaprovenance` on its digest. The capture's manifest gains
  `healthcheck`, `secretEnv`, `secretHistory`, and each app `buildProvenance`. The manifest engine
  compares none of them.
- `report.html` and `report.md` gain a **Policy** table (one row per app, one column per check).
  `readiness.json`'s forecast gains `informingBy`.
- The claims file accepts the three new artefact names. The monorepo's `pnpm
  check:release-claims` mirrors the nineteen diff names and does not accept them yet; an
  informing finding needs no claim.

### 1.21.0 (minor; engine levels: informing before blocking)

The release note is [releases/1.21.0.md](releases/1.21.0.md). The first step of the "Policy"
release. A minor for the new `report.json` and `readiness.json` fields; no command, flag,
verdict, Gate or exit code changes for any run, because every engine is blocking.

- Every engine has a level, `blocking` or `informing`, with an optional `blockingFrom` date
  (`src/compare/levels.ts`, `ENGINE_LEVELS`); see [Engine levels](#engine-levels). An informing
  engine's findings are written as `severity: info` with `level: informing` (and
  `blockingFrom`), so they never gate and never count in the A/A; they stay claimable.
- `report.json` gains the optional `levels` (every engine's level on the run), and a hunk the
  optional `level` and `blockingFrom`. `report.html` and `report.md` gain an **Informing**
  section, "reported, never gates", with every engine's level.
- `readiness.json`'s forecast gains `informing` (unclaimed informing results; `null` before
  1.21.0); the readiness page shows it beside the Gate and in a tile on the latest forecast.
- Every engine is blocking: no run decides anything differently.

### 1.20.5 (patch; a report fits a phone)

The release note is [releases/1.20.5.md](releases/1.20.5.md). A patch: no command, flag,
`report.json` or index field, verdict, Gate or exit code changes; the styling of `report.html`
and of the lead a kept report is given does.

- Under 640px wide a table in `report.html` (provenance, differences, image artefacts) or in the
  lead (the score's dimensions, the glance, the change risk per PR) scrolls inside its own box, and
  a long name in a sentence breaks where it must, so the page itself never scrolls sideways. At
  375px the 30 Sep forecast was 1,131px wide; it is now 375px. `NARROW_CSS` in
  `src/report/narrow.ts`, in both the report's own style and `LEAD_CSS`, so a kept report rendered
  by an older harness gets it when it is kept.

### 1.20.4 (patch; orphan diffs measured on a forecast)

The release note is [releases/1.20.4.md](releases/1.20.4.md). The fifth step of the "Explain"
release. A patch: no command, flag, `report.json`, `changes.json` or index field, verdict, Gate
or exit code changes; `main-preview.yml`'s publish job gives `harness changes` a flag it has
taken since 1.10.0.

- Main to RC's "What changed between production and main" step builds the monorepo's
  `pnpm release:changelog --from v<production> --to <commit> --json` in its full-history
  checkout, in a step of its own that holds no token, and passes it as `--changelog`, so orphan diffs (a diff with no changelog entry) are
  measured on a forecast instead of "not measured". Orphan entries stay not measured: the
  tooling's changelog is derived from the diff. Best effort: when it cannot be built, or is not
  version 1, changes runs as before. See [Main to RC](#main-to-rc).

### 1.20.3 (patch; the smallest detectable slowdown)

The release note is [releases/1.20.3.md](releases/1.20.3.md). The fourth step of the "Explain"
release. A patch: no command, flag, `report.json` or index field, claims key, verdict, Gate or
exit code changes; the wording of `timing` hunks does. The harness version moves because
`src/compare/` changed.

- A `timing` hunk the test judged (page TTFB, journey duration, load) ends with the smallest
  slowdown its samples could have detected: `smallest slowdown 5/5 runs could detect: about 25%`
  (`src/compare/stats.ts`, `smallestDetectableSlowdown`). A not significant one also says its
  effect and sample sizes: `median 4200ms → 5100ms but not significant (p=0.095, +21%, n=5/5;
  ...)`. Reported, never judged: the figure is not a tolerance and gates nothing. The first `p=`
  in a summary is still the test's, the one confidence and the glance read.
- Because the wording changed, a timing cause's key changes once: the first forecast on 1.20.3
  lists its timing causes as new beside a 1.20.2 forecast.

### 1.20.2 (patch; claims owed)

The release note is [releases/1.20.2.md](releases/1.20.2.md). The third step of the "Explain"
release. A patch: no command, flag, `report.json` or index field, claims key, verdict, Gate or exit
code changes; what a kept forecast leads with changes. The harness version moves because
`src/claims/` changed (`src/claims/draft.ts`, new; nothing that matches or gates calls it).

- A kept, scored forecast (side b `sha-<short>`) shows "Claims owed" in place of the reviewer's
  glance: one draft claim per cause, scope narrowed and checked with the claims matcher,
  `rule: "????"` until a person names the Rule. A release candidate keeps its glance. See
  [Kept reports](#kept-reports).

### 1.20.1 (patch; which PR did it)

The release note is [releases/1.20.1.md](releases/1.20.1.md). The second step of the "Explain"
release. A patch: no command, flag, `report.json` or index field, verdict, Gate or exit code
changes; only what a kept forecast's `report.md` and `report.html` lead with.

- A kept, scored report (Main to RC) follows "New since the last forecast" with "Causes and the
  PRs behind them": a cause new since the previous forecast against the PRs merged since, the
  rest by path. See [Kept reports](#kept-reports).

### 1.20.0 (minor; causes, not hunks)

The release note is [releases/1.20.0.md](releases/1.20.0.md). The first step of the "Explain"
release. Additive for a consumer written against 1.19.0: no command, flag, verdict, Gate or exit
code changes. A minor because `report.json` gains an optional field.

- `report.json` gains the optional `causes` (`unclaimed`, `causes[]`, `together[]`): the unclaimed
  differences folded by kind across apps, pages and packages, computed after the verdict. See
  [Causes](#causes); `report.schema.json` describes it.
- `report.md` and `report.html` lead their differences with the cause table and the pages on which
  several artefacts moved together.

### 1.19.0 (minor; release size under control: the control chart and the WIP limit)

The release note is [releases/1.19.0.md](releases/1.19.0.md). Additive for a consumer written
against 1.18.0: no `report.json` field, verdict, Gate or exit code changes, and the new field is
optional. A minor because `harness readiness` takes two flags it did not (`--releases`,
`--fetch-releases`).

- `readiness.json` gains the optional `control`
  ([the release-size control chart](#the-overnight-readiness-page)): each past release's size in
  merged PRs, the XmR limits (centre, UCL, LCL; provisional under 10 releases), the WIP limit and
  the zone of the PRs waiting on main, and the count night by night; `readiness.html` draws it
  at the top of the page.
- `releases.json`: the monorepo's release history, written into the site by
  `harness readiness --fetch-releases` (GITHUB_TOKEN or GH_TOKEN); `--releases f` reads one.
- `release-control.schema.json`: the schema of `control` and of `releases.json`, referenced by
  `readiness.schema.json`.
- `pages.yml`: "The overnight readiness page" passes `--fetch-releases` with the job's token,
  which already reads. No new permission, job or artifact.

### 1.18.0 (minor; the quality strip: Speed, Metrics, Tests)

The release note is [releases/1.18.0.md](releases/1.18.0.md). The fourth step of the "Page"
release, and the last. Additive for a consumer written against 1.17.0: no `report.json` field,
verdict, Gate or exit code changes, and every new field is optional. A minor because three
non-stable commands take a flag they did not (`--mutants`, a flag `scoreboard` has had since
1.11.0).

- `a3.json` gains the optional `quality` ([the quality strip](#the-a3-aggregator)): Speed,
  Metrics and Tests under the Gate, each within reason, look or not measured; `a3.html` draws
  it. `harness a3 --mutants f` (default `mutants.jsonl` beside `--scoreboard`).
- `readiness.json`: each forecast gains `quality`; `readiness.html` marks every row and draws
  the strip for the latest. `harness readiness --mutants f`.
- `quality-strip.schema.json`: the schema of `quality`, referenced by `readiness.schema.json`.
- `harness confidence`: `--test-signal` reads the monorepo's quality record as it is, and a
  record with no `packages` is not measured instead of exit `2`; `--mutants f` joins the newest
  weekly mutants self-test as `harnessMutants` when the record has packages
  ([Test signal's two halves](#confidencejson-the-release-confidence-score)).
- `reports keep`: keeps `quality.json` beside a release run when it is a quality record.
- `main-preview.yml`: a step "The monorepo's quality record" in the `publish` job fetches it
  for the judged commit or the newest before it, and "Score the forecast" passes
  `--test-signal` and `--mutants`. `pages.yml` passes `--mutants` to `harness a3` and
  `harness readiness`. No new permission, job or artifact.

### 1.17.0 (minor; the overnight readiness page: `harness readiness`)

The release note is [releases/1.17.0.md](releases/1.17.0.md). The third step of the "Page"
release. Additive for a consumer written against 1.16.1: no `report.json` field, verdict or
exit code of an existing command changes. A minor because it adds a command.

- `harness readiness --site <dir> [--github f]` (not stable): writes `readiness.html` and
  `readiness.json` ([the overnight readiness page](#the-overnight-readiness-page)): one row per
  night for the last ten, from the kept Main to RC forecasts and Main to RC's workflow runs in
  `github.json`; no flag is new.
- `readiness.schema.json`: the schema of `readiness.json`.
- `pages.yml`: a step "The overnight readiness page" after the A3 (a failure is a warning). No
  new permission, job or artifact.
- `site/index.html`: a link to `readiness.html` at the top.

### 1.16.1 (patch; new since the last forecast)

The release note is [releases/1.16.1.md](releases/1.16.1.md). The second step of the "Page"
release. Additive for a consumer written against 1.16.0: no command, flag, `report.json` field,
verdict or exit code changes, and the new field is optional (the same kind of change as 1.13.1's
`confidence` and `changes`).

- `reports/index.json`: a release run's entry gains the optional `delta` (`baseline`, `against`,
  `new`, `gone`, `byArtefact`): what moved in the unclaimed set since the previous kept release
  run beside the same baseline. See [Kept reports](#kept-reports).
- `reports-index.schema.json`: the index's first schema, covering every field since 1.5.0.
- A kept, scored report (Main to RC) leads with "New since the last forecast" under the Gate,
  in `report.md` and `report.html`.

### 1.16.0 (minor; the record keeps its rehearsals and ten days)

The release note is [releases/1.16.0.md](releases/1.16.0.md). The first step of the "Page"
release (the overnight readiness page). Additive for a consumer written against 1.15.0: no
verdict, exit code, `report.json` field, stable command or flag changes; a new flag on a
command that is not stable.

- `harness reports keep` (not stable) takes `--keep-days n`: a floor under `--keep-last`, so a
  run younger than `n` days is never pruned, whatever the count.
- `harness reports keep` takes `--migration` and `--upgrade`: the run's rehearsals are kept
  beside it in `reports/<id>/migration/` and `reports/<id>/upgrade/`, and the kept
  `confidence.json` links them there instead of the runner's `../../rehearsals/...`, which did
  not exist on the pages. Its `run.reports.migration`, `run.reports.upgrade` and the
  Rehearsals dimension's evidence change; nothing else in it does. Kept before 1.16.0, a
  forecast still has the dead links: nothing rewrites history.
- `main-preview.yml`'s `publish` job passes both rehearsals and `--keep-days 10` beside
  `--keep-last 60`. No new permission, job or artifact.

### 1.15.0 (minor; fixes on b are decisions, not failures)

The release note is [releases/1.15.0.md](releases/1.15.0.md). Additive for a consumer written
against 1.14.0: no verdict, exit code, command or flag changes.

- The claims matcher offers info hunks to claims too. A claim that names an info hunk (an axe
  violation fixed on b, an error-level console message gone on b) is recorded in
  `compare.matches` beside it and is no longer in `compare.staleClaims`, so the Gate's "claim(s)
  matched nothing" reason and the stale-claim deduction no longer fire for the claim written for a
  fix. An info hunk is still never in `compare.unclaimed` and never gates. `claimHygiene` still
  counts failing hunks only.
- The glance's `fixed-on-b` rule: a claimed fix is **decided** and is no longer a glance item,
  unless the same page has new failures of the same kind ("fixed, or only changed?"); an
  unclaimed one reads "undecided". The claim is the switch.
- The scorecard's Rule table counts a Rule whose claims matched only fixes as `covered`.
- `a3.json` gains the optional `decisions` (fixes, pages, decided, `byArtefact`, one row per page
  with its state and the claim that says why), and the RCA question `decisions`; `a3.html` shows
  them in orange, beside the traffic lights, with a "Decisions on b" table. A claim a report
  written before 1.15.0 called stale but that names a fix reads as deciding it.

### 1.14.0 (minor; the A3 Aggregator: `harness a3`)

The release note is [releases/1.14.0.md](releases/1.14.0.md). Additive for a consumer written
against 1.13.1: no `report.json` field, verdict or exit code of an existing command changes.

- `harness a3 --site <dir> [--kaizen d] [--noise-history f] [--scoreboard f] [--github f |
  --fetch-github] [--out d]` (not stable): writes `a3.html`, `a3.json` and, when fetched,
  `github.json` ([the A3 Aggregator](#the-a3-aggregator)).
- `pages.yml`: runs `harness a3` into the site (a failure is a warning) and gains `actions: read`
  to read workflow runs; copies the noise history to `noise/noise-history.json`.
- `site/index.html`: the A3 section, the final scoring and the vital few, linking to `a3.html`.
- `claims/README.md`: how to claim a tool removed from an image with one brace-list SBOM claim.
- `kaizen/`: the first three 5 Whys (the Gate FAIL on the newest forecast, the 16.2.2 rollback,
  a fixed-on-B finding the glance called unclaimed).

### 1.13.1 (the exemplar: Main to RC carries the score, and the report pages lead with it)

The release note is [releases/1.13.1.md](releases/1.13.1.md). Additive for a consumer written
against 1.13.0: no command, flag, `report.json` field, verdict or exit code changes, and every new
field and file is optional.

- `main-preview.yml`: two new jobs, `migration` and `upgrade`, rehearse main as `release.yml`
  rehearses a candidate (artifacts `main-preview-migration-report` and
  `main-preview-upgrade-report`, 14 days); the `publish` job runs `harness changes` and
  `harness confidence` before it keeps the forecast, reading the `scoreboard` branch. No new
  permission: `publish` still holds `contents: write` and pushes only `main-preview`.
- `harness reports keep` (not stable): a release run scored beside it is kept with
  `confidence.json` and `changes.json`, its `report.md` and `report.html` led by the Gate, the
  RCS and its band, the glance and the change risk per PR (one renderer with `harness release`:
  `src/report/lead.ts`); its `index.json` entry gains the optional `confidence` and `changes`.
- `site/index.html`: "What main would ship today", the newest Main to RC forecast, at the top.

### 1.13.0 (minor; the 5 Whys and the kaizen register: `harness why`)

The release note is [releases/1.13.0.md](releases/1.13.0.md), which also sums up the Release
Confidence companion from 1.8.0. Additive for a consumer written against 1.12.0: no `report.json`
field, verdict, or exit code of an existing command changes.

- `harness why --run <run dir | harness release dir> --finding <id> [--out kaizen/] [--tag T]
  [--scoreboard f]` (not stable): writes `kaizen/<date>-<tag>-<finding>.md`, Why 1 answered from
  the run's own trace, Whys 2-5 blank, the countermeasure one of seven kinds (mutant, journey,
  mask review, EARS spec, claim guidance, SOP change, glance rule; [the 5 Whys and the kaizen
  register](#the-5-whys-and-the-kaizen-register)). Finding ids: `gate`, `band`, `rollback`,
  `<rule>:<series>`, `countermeasures-rising`, a glance item, a hunk id.
- `harness why check <file|dir...>` (not stable): exit `1` for a 5 Whys not ready for the
  register, each problem with its Lean reason.
- `harness why register [--dir kaizen] [--write]` (not stable): the table of `kaizen/README.md`,
  regenerated from the files; exit `1` without `--write` when it is out of date.
- `kaizen/README.md`: the register, seeded with its header and an empty table. CI's unit job
  checks every 5 Whys in `kaizen/` and that the table is regenerated.
- `harness release`: a Gate FAIL, a Red band, each run rule firing at the release, and open
  countermeasures only rising each write a stub into `<timestamp>-release-command/kaizen/`;
  `report.md` and `report.html` list them under "5 Whys (kaizen)" with the register's open and
  overdue counts, and the terminal prints the same. `harness glance mark --mark escalated` writes
  the escalated item's stub. No exit code changes.
- The scoreboard line: optional `openCountermeasures`; the register's run rule (open
  countermeasures only rising) reads it and is measured from the first line that has it.
  `harness scoreboard append` records it from the checkout's `kaizen/`.
- `post-deploy.yml`: the rollback issue's body carries the `harness why --finding rollback` stub,
  folded. No new permission.
- New flags, not stable: `--finding`, `--write`.

### 1.12.0 (minor; the reviewer's glance: `harness glance`)

The release note is [releases/1.12.0.md](releases/1.12.0.md). Additive for a consumer written
against 1.11.0: no `report.json` field, verdict, or exit code of an existing command changes.

- `confidence.json`: `glance` holds at most seven ranked items (`rank`, `kind`, `key`,
  `finding`, `links` with `hunk`, `claim`, `pr`, `diff`, `novelty`, `exposure`, `score`,
  `basis`, `mark`), and the new `glanceBasis` says how they were ranked and which kinds were
  not checked, and why ([the reviewer's glance](#the-reviewers-glance)). `harness confidence`
  and the score stage of `harness release` rank it; `harness confidence` takes `--scoreboard`
  for the history novelty reads.
- `harness glance mark --run <dir> --item <n> --mark verified|disputed|escalated --by <name>
  [--note text]` and `harness glance status --run <dir> [--json]` (not stable): record the
  Reviewer's marks in `glance-marks.jsonl` ([`glance-marks.schema.json`](contract/glance-marks.schema.json))
  and read them back, with whether an Amber release's glance is recorded verified. Marks never
  change the Gate or an exit code.
- `harness release`: `report.md`, `gate.md` (the PR comment) and `report.html` show the glance
  right under the Gate, the RCS and its band, with one line on how to mark, and for Amber that
  the glance must be recorded verified before go; the terminal prints one line for it.
- The scoreboard line: optional `maskIds` and `glance` (count, marks, checked kinds, seen keys);
  older lines stay valid.
- `release.yml`'s `scoreboard` job scores after it fetches the `scoreboard` branch and passes it
  to `harness confidence --scoreboard`, so CI's glance has its history.
- New flags, not stable: `--item`, `--mark`, `--by`, `--note`.

### 1.11.0 (minor; the scoreboard: `harness scoreboard`, the trends and the run rules)

The release note is [releases/1.11.0.md](releases/1.11.0.md). Additive for a consumer written
against 1.10.0: no `report.json` field, verdict, or exit code of an existing command changes.

- `scoreboard/releases.jsonl` ([`scoreboard-line.schema.json`](contract/scoreboard-line.schema.json),
  not stable): one line per release run, append-only; a re-run is the same tag with the next run
  number ([the scoreboard](#the-scoreboard)). `scoreboard/mutants.jsonl` beside it: one line per
  weekly mutants self-test.
- `harness scoreboard append --run <harness release dir | confidence.json> [--file f] [--mutants f]
  [--tag T] [--run-url u] [--json]`, `harness scoreboard trends [--file f] [--mutants f]
  [--noise-history f] [--site dir] [--json]` and `harness scoreboard mutants --run <dir |
  mutants.json> [--file f] [--run-url u]` (not stable): append a line, read the six trend views,
  the run rules and the harness's own health, and record a self-test. Exit `0` when done, `2` for
  what they cannot read.
- The run rules: three consecutive declines, or two of three releases below 75, in any of the
  eight dimensions or the RCS, opens a kaizen item naming it. In the trends JSON and after the
  score of `harness release`. No exit code changes.
- `harness release`: appends its line to `HARNESS_HOME/scoreboard/releases.jsonl` after the score
  (`--scoreboard <file>` writes there instead; a `--fast` run is not appended) and prints it and
  the run rules firing; `report.md` and `report.html` list the same lines.
- `harness guard scoreboard` (not stable; `guard all` runs it): a diff may only add lines to
  `scoreboard/*.jsonl`. CI runs it in the masks job.
- `confidence.json`: `weightsVersion` (optional in the schema; absent before 1.11.0).
- `harness mutants` writes `mutants.json` into its `--out`.
- Workflows: `release.yml` gains the `scoreboard` job and `weekly-mutants.yml` the `record` job,
  each with `contents: write`, appending to the new `scoreboard` branch; `weekly-mutants.yml`
  uploads `mutants-summary`; `pages.yml` publishes `scoreboard.html` and `scoreboard.json`.
- New flags, not stable: `--file`, `--mutants`, `--noise-history`, `--site`, `--scoreboard`.

### 1.10.0 (minor; change signals: `harness changes`)

The release note is [releases/1.10.0.md](releases/1.10.0.md). Additive for a consumer written
against 1.9.0: no `report.json` field, verdict, or exit code of an existing command changes.

- `harness changes --a <tag> --b <tag> [--monorepo dir] [--history 6] [--changelog f] [--json]
  [--out file]` (not stable): the change signals between two tags of the monorepo (`git log
  A..B` in the checkout, `--monorepo` or `HARNESS_MONOREPO_DIR`), one risk line per PR, and the
  change risk they add up to. Exit `0` whatever it found; `2` for what it cannot read.
- `changes.json` ([`changes.schema.json`](contract/changes.schema.json), not stable): the
  per-PR lines, the release-level signals, what was not measured, and the `changeRisk` block
  ([`changes.json`](#changesjson-the-change-signals)).
- `harness release`: the changes stage is no longer a seam. With a monorepo checkout it runs
  `harness changes --a <baseline> --b <candidate>` and writes `changes.json` into
  `<timestamp>-release-command/`; the score stage reads it as change risk (an explicit
  `--change-risk` wins); `report.md`, `gate.md` and `report.html` carry the per-PR table under the
  score. Without a checkout the stage is skipped with the reason and change risk stays not
  measured. Its exit code reaches nothing; the command's exit code is unchanged.
- `harness confidence --change-risk` takes a `changes.json` (its `changeRisk` block); the 1.9.0
  `{ "prs": [...] }` shape is still read, `reviewed` may now be `null`. Change risk's points
  follow the plan's table (a hotspot touched by a first contribution −10, by anyone else −3; a PR
  with no approving review breaches the floor at no points, where 1.9.0 took −40 for each).
- `confidence.json`: a deduction may be `points: 0` with `floor: true` (the schema's
  `exclusiveMinimum: 0` is now `minimum: 0`); orphan changes are a floor signal for
  requirements traceability once it is measured.
- New flags, not stable: `--history`, `--changelog`.

### 1.9.0 (minor; the Release Confidence Score)

The release note is [releases/1.9.0.md](releases/1.9.0.md). Additive for a consumer written
against 1.8.0: no `report.json` field, verdict, or exit code of an existing command changes.

- `harness confidence --run <release run dir | report.json | harness release dir>
  [--migration dir] [--upgrade dir] [--test-signal f] [--traceability f] [--change-risk f]
  [--post-deploy dir] [--json]` (not stable): writes `confidence.json` beside the run and
  prints the board, the Gate first, then the RCS and its band, then the eight dimensions. Exit
  `0` when written, whatever the score or the Gate; `2` for an input it cannot read.
- `confidence.json` ([`confidence.schema.json`](contract/confidence.schema.json), not
  stable): the Gate, the RCS (only when the Gate is PASS or WARN), the band, the weights used,
  and each dimension with every deduction and its evidence
  ([`confidence.json`](#confidencejson-the-release-confidence-score)).
- `harness release`: the score stage is no longer a seam. It writes `confidence.json` into
  `<timestamp>-release-command/`; `report.md`, `gate.md` and `report.html` lead with the Gate,
  then the RCS and its band with the band's meaning, then the dimension table; the terminal
  prints `confidence: RCS <n> <band>: <meaning>` after the gate line. The exit code is decided
  before the score is computed and is unchanged. It takes `--test-signal`, `--traceability`,
  `--change-risk` and `--post-deploy` too.
- `report.html` of a run gains `id`s: each hunk's row (`hunk-<id>`) and the sections the
  score links to. Nothing else in it changes.
- New flags, not stable: `--run`, `--migration`, `--upgrade`, `--test-signal`,
  `--traceability`, `--change-risk`, `--post-deploy`.

### 1.8.0 (minor; one command: `harness release`)

The release note is [releases/1.8.0.md](releases/1.8.0.md). Additive for a consumer
written against 1.7.0: no `report.json` field, exit code of an existing command, flag
or payload changes.

- `harness release --candidate <tag> [--baseline <tag|prod>] [--monorepo <dir>]
  [--claims f] [--rules f] [--fast] [--open] [--out dir] [--dry-run]` (not stable): the
  gate's plan as seven stages (resolve, noise, changes, release, rehearse, score,
  report), asking nothing. The baseline is `--baseline`, else `tag` in
  `release/deployed.json` of the monorepo checkout (`--monorepo`, else
  `HARNESS_MONOREPO_DIR`; its `digests` pin production), else
  `HARNESS_PRODUCTION_TAG`, else exit `2`. The local noise store's A/A is reused when
  it licenses a FAIL; otherwise an A/A of the baseline (3 runs) runs first, and a
  dirty one stops the line before any A/B (exit `2`, with each difference that needs
  a mask reviewed). The release step is 3 runs with k6 `20x30s`; a FAIL still writes
  the report and exits `1`. `--fast` is one run, no load, no rehearsals and no A/A,
  with a banner that the report cannot be used for a go decision. Ctrl-C takes the
  stacks down (`harness stack down`) and exits `2`. `changes` and `score` are seams
  that report "not built yet" and can never change the exit code.
- A new output directory, `<timestamp>-release-command/`, with `status.json`
  ([`release-status.schema.json`](contract/release-status.schema.json)),
  `report.md`, `report.html`, `gate.md` and `gate.json`
  ([Output directory](#output-directory)).
- New flags, not stable: `--candidate`, `--baseline`, `--monorepo`, `--fast`,
  `--open`. New environment variable: `HARNESS_MONOREPO_DIR`.
- `pnpm release` is unchanged (it is still `harness run --mode release`); the one
  command is `pnpm harness release`.

### 1.7.0 (minor; release tags from a workflow)

Additive for a consumer written against 1.6.0: no `report.json` field, exit code,
command, flag or payload changes. It is a minor because it adds a workflow and a
write scope.

- `tags.yml` creates the git tag `v<harness version>` on the first commit of `main`
  that carries each version, when `package.json` changes on `main` and by hand
  (`workflow_dispatch`, which also tags earlier versions that have none). Its `tag`
  job holds `contents: write`. A tag is never moved or re-made, and a version that
  never reached `main` has none (`scripts/release-tags.sh`). Before, a maintainer
  tagged by hand and no version after 1.0.0 had been tagged.
- A tag GitHub refuses a workflow token (its commit carries workflow files other than
  the default branch's) is created through the REST API as a lightweight tag; one
  still refused is named in the log and skipped, and only the newest version failing
  fails the run (harness 1.7.1). Before, the first refusal ended the run, green.

### 1.6.0 (minor; which build production serves)

The release note is [releases/1.6.0.md](releases/1.6.0.md). Additive for a consumer written against 1.5.0: one new optional `report.json`
field, nothing removed or changed. The harness version is 1.6.0 as well, because a
contract minor moves the harness at least as far ([Compatibility](#compatibility)).

- `productionBuild` (optional, post-deploy mode only): the build production's
  reader names in `/_app/version.json` and `/version`, against the recorded
  candidate's commit, with `status` `match`, `differs` or `unknown`. `report.md`
  and `report.html` get a "Production build" section beside the deployment
  section, and `differs` or `unknown` adds a line to `reasons`. It never changes
  the verdict or the exit code, and is never a hunk. See
  [Which build production serves](#which-build-production-serves). It follows
  tutors-sdk/tutors-release-harness#38 and tutors-sdk/tutors-mono-repo#354 (Netlify
  builds named from `COMMIT_REF`).

### 1.5.0 (minor; kept reports, the scorecard, Main to RC, report pages, one recorded copy of third-party hosts)

The release note is [releases/1.5.0.md](releases/1.5.0.md). Additive for a consumer
written against 1.4.0: no `report.json` or `noise-status.json` field, exit code
meaning, stable command or flag, or dispatch payload field changes.


- `harness reports keep` (not stable): copies a run's `report.json`, `report.md`
  and `report.html` into `<store>/reports/<ranAt>-<mode>/` and lists it in
  `<store>/reports/index.json`. See [Kept reports](#kept-reports).
- `nightly-noise.yml` keeps the last 14 nights' reports on the `noise` branch;
  `release.yml` keeps each candidate's report on the `release-records` branch.
  Same branches, same jobs, same permissions.
- `harness scorecard` (not stable): score, normalness, Rules and PRs, and what to
  test by hand, for one run. `reports keep` writes it beside each kept report
  and its headline into `index.json`. See [Kept reports](#kept-reports).
- Pattern masks may name `focus`: each keyboard stop (its role and accessible
  name) is rewritten like the ARIA snapshot. Before, a `focus` pattern mask
  loaded but changed nothing.
- `image-manifest`: when a side's image was built here from a monorepo ref, a
  difference in a label the publishing pipeline stamps (`title`, `description`,
  `url`, `source`, `vendor`, `documentation`, `authors`) is an `info` hunk, not a
  failure: it says where the image came from, not what it is. Every other label,
  `licenses` included, still fails.
- A journey that fails on both sides now makes a noise run DEGRADED (verdict
  `warn`, `degraded` in `noise-status.json`), whether or not verification is
  required: the A/A saw nothing of that journey's pages, so it is not clean
  evidence, and a release run will not trust it. Any other mode names such a
  journey in its `reasons`.
- The scorecard's PRs are links to the monorepo's pull requests,
  `[#313](https://github.com/tutors-sdk/tutors-mono-repo/pull/313)`: a bare `#313` in a
  report kept in this repository linked to this repository's #313. The monorepo's
  `pnpm release:rules --since` now fills each Rule's `prs` from the PRs that touched it.
- Main to RC: `main-preview.yml` runs release mode every day with production on
  side a and main's newest signed images on side b, against main's claims, and
  keeps each forecast on a new `main-preview` branch (its `publish` job holds
  `contents: write`, the one new write scope). `harness preview resolve` (not
  stable) and the `--force` flag (not stable) decide what it judges. See
  [Main to RC](#main-to-rc).
- A journey has a deadline (3 minutes; the slowest seen takes about 30 s) and ends
  at once when its renderer crashes: it is recorded with `error` "journey timed out
  after 180s" or "renderer crashed" and the pages it reached, and the run moves on.
  Every Playwright call without a timeout of its own gets 30 s. Before, a dead
  renderer could hold a run until the job timed out. `harness mutants` prints each
  mutant's result as it finishes, and a mutant whose run throws counts as escaped
  instead of ending the self-test.
- The kept reports are published to GitHub Pages by a new `pages.yml`
  (`pages: write`, `id-token: write`), with `site/index.html` listing every run
  of every branch. See [Kept reports](#kept-reports).
- A failing `screenshot` hunk's summary says where the pixels differ: `…% of
  pixels differ in W×H at (x, y) (threshold …)`, the box around every differing
  pixel. The diff image stays in `diff/`; the summary is what a CI log shows.
- What the apps load in the browser from Google Fonts, Iconify and
  `cdn.jsdelivr.net` is answered from one recorded copy (harness 1.4.13): each URL is
  fetched once, recorded without its volatile headers, and served from the record
  on both sides and in later runs, so a font or an icon can no longer arrive on one
  side only. The records live in `HARNESS_THIRD_PARTY_CACHE_DIR`, else
  `HARNESS_HOME/third-party-cache`; every workflow job that runs journeys restores
  and saves that directory with `actions/cache` (`thirdPartyCache` in
  `workflows.json`). A URL never recorded whose host is unreachable is answered 504,
  alike on both sides.
- A streamed media request (a `video/*` or `audio/*` body, or any `206` partial
  response) is compared by whether it was made, its status and its type, not by
  how many times (harness 1.4.14). The browser fetches a video in as many range
  requests as its buffering needs, so "requested 4× on a, 5× on b" was timing.
  A video one side never requests is still a `network` hunk.
- The scheduled synthetic monitor (`post-deploy.yml`) stands down, green, with a
  notice in the run summary, when no release run has kept a `release-report`
  artifact to compare production with; before, every scheduled run failed. A
  `deployed` dispatch or a `recorded_run_id` without a recording still fails.
- A console "Failed to load resource" message now carries the resource's URL (without its query), so a report says which resource failed, and two different failures on one page are two differences (harness 1.5.2).
- Dependencies updated in one batch (harness 1.5.3): `diff` 9, whose `structuredPatch` output was checked byte-identical to 8's, so `dom` and `focus` hunk text does not change; the rest (tsx, Vitest 5, ESLint 10, `@types/pixelmatch` 7) are tooling. No report, flag or payload changes.

### 1.4.0 (minor; the pinned vulnerability database, one "not collected" convention, housekeeping commands, clean exit 2, post-deploy on an external side)

Follow-ups to 1.3.0, which is merged. Additive for a consumer written against
1.3.0: no `report.json` or `noise-status.json` field, no exit code meaning, no
verdict rule, no claims key and no dispatch payload changes. The harness version is
1.4.0 as well, because the engine, the collectors and the workflows change (the
engine guard requires it).

What makes this a **minor** release, per [Compatibility](#compatibility):

- new environment variables with defaults (`HARNESS_REQUIRE_ARTEFACTS`,
  `HARNESS_VULN_DB_MAX_AGE_DAYS`, `HARNESS_ROLLBACK_ISSUE`);
- new non-stable commands (`harness prune`, `harness vuln-db`, `harness local
  smoke`, `harness local compare`) and the flags only they take, and a new artifact (`mutant-noise-report`);
- reports that say things differently for the same two images: the canonical
  header forms, redacted secrets and `{{origin}}` on an external side change
  hunks and hunk summaries, and the `NOT COLLECTED` text is one shape. Two reports
  from either side of that are not comparable (the harness version, above).

What is **patch-level**, bug fixes that make the code do what this document already
said: `harness --help`, `-h` and `help` work as documented; a claims or rules file
that cannot be used is a clean message, not a stack trace; a run that cannot judge
leaves no empty output directory; `post-deploy.yml` opens its rollback issue on exit
`1` only; and the post-deploy reason wording.
A consumer must not match a hunk's summary, only its `artefact`, `scope`, `path`
and `severity`, which the contract has always said.

**Not collected: one convention** ([details](#not-collected-one-convention); [release note](releases/1.4.0.md#not-collected-one-convention))

- New environment variable `HARNESS_REQUIRE_ARTEFACTS` (a list of artefacts, or
  `static`, or `all`), which supersedes `HARNESS_REQUIRE_STATIC`; that stays as an
  alias for `static`. It only adds to the required set, and an unknown name is exit `2`.
- Severity, hunk scopes and `artefact` values are unchanged: static artefacts
  are informational unless required, `runtime` and `startup` are failing unless
  switched off, so no existing gate changes. The text is one shape,
  `NOT COLLECTED: <what> …: <reason>`, where `runtime` and `startup` said
  `… not collected: <reason> (side b)` and the static artefacts' summary said
  `<app>: sbom NOT COLLECTED on side b, so it was not compared`. A consumer that
  matched a summary's text (the contract only promises `artefact`, `scope`,
  `path` and `severity`) must match the new one.
- Decided for 1.4.0: `runtime` and `startup` stay failing when not collected, by default (their collectors run
  against stacks the harness started, so an empty one is a fault, not a missing tool); `bus` stays informational and
  adds no hunk until a bus exists (a run with no bus is byte-for-byte what it was), and fails only under
  `HARNESS_REQUIRE_ARTEFACTS=bus` on a side that has none. `harness doctor` and `harness vuln-db status` read the
  same requirement for the vulnerability artefact.

**Command stability** ([command line](#cli))

- Not stable, and new: `harness vuln-db update|status` (fetches, or reads, the pinned
  vulnerability database; the workflows call it, and its output is for people),
  `harness prune` (removes old run directories under `out/` and an old image cache; a
  dry run unless `--yes`), `harness local smoke`, and the flags only they take:
  `--older-than-days`, `--keep-last`, `--image-cache-days`, `--yes`, `--strict`, `--no-load`.
  They may change in a minor release. `smoke` and `compare` join `nightly|gate|mutants|watch` as
  wrappers planned from the stable commands. `harness local compare` runs the gate's release
  step with `main` against the last release (the highest `X.Y.Z` present for all four apps on
  quay.io), 3 runs, and no claims unless `--claims`: an exploration, so its exit code is
  `0` whenever a report was produced, `2` when it could not judge and `1` for a harness fault;
  `--strict` makes it follow the verdict as `local gate` does. The exit codes of `run` are unchanged.

**Exit 2 ("could not judge") is cleaner** (behaviour a consumer sees; no field changes; patch-level)

- `harness --help`, `-h` and `help` print usage and exit `0`, and `harness
  <command> --help` (or `harness help <command>`) prints that command's usage,
  as this document always said; they used to answer `unknown command` with exit
  `2`. `harness` with no arguments still prints usage and exits `2`.
- A claims file or rules file that cannot be used (missing, unreadable, not
  YAML or JSON, the wrong version, an unknown artefact, an unquoted `rule`, a
  missing reason, a rule the file does not have) is a multi-line message naming
  the file, the claim, the field and what would be right, and exit `2`: no stack
  trace. The exit code and the "before anything starts" rule are as before.
- A run that exits `2` before it has images to judge (not present, not
  verified) no longer leaves an empty `<out>/<timestamp>-<mode>/` behind.
- `post-deploy.yml` opens the `rollback` issue on exit `1` only. Exit `2` fails
  the workflow and says "could not judge" in the job summary, without an issue;
  before, any failure of the step opened one, which said nothing about production.

**Post-deploy on an external side, and secrets in captures** (engine; no `report.json` field changes)

What a production run showed: an external side behind a CDN differs from the recorded stack in ways that are
spelling, not behaviour, and made a clean post-deploy verdict unreachable. What reports SAY changes, and it can
change hunks in every mode; two reports from either side of it are not comparable (the harness version, above).

- **Canonical header forms** (engine, every mode). `content-type` and `cache-control` are put in one form on both
  sides before comparing and before any mask, for the document headers and for each network entry. `cache-control`:
  directives lower-cased, whitespace stripped, sorted, de-duplicated (`public,immutable,max-age=1` and
  `max-age=1, public, immutable` are equal). `content-type`: lower-cased media type and parameter names, the default
  charset (`utf-8`) dropped, the legacy JavaScript aliases (`application/javascript` …) folded into `text/javascript`.
  A changed `max-age`, a lost `immutable`, another media type or a non-default charset is still a hunk. What changes
  for a consumer: the values quoted in a hunk summary are the canonical ones (`cache-control changed:
  immutable,max-age=31536000,public → immutable,max-age=300,public`), and a reordering that used to be a hunk is not.
  Known blind spot: a document that loses `charset=utf-8` reads as unchanged.
- **Header masks may carry a pattern** (`normalise/masks.yaml`). `header: cache-control` with `pattern: "^no-cache$"`
  drops the header only when its canonical value matches, and `artefact: network` on a header mask clears
  `content-type` or `cache-control` of the network entries. Existing masks are unaffected. Comments only in
  `masks.yaml`: the CDN-only masks that use this are a masks-only change of their own.
- **Origins are symmetric on an external side** (engine, post-deploy). The URLs of an external side (from its
  `external:<url>` images, i.e. `HARNESS_PRODUCTION_URLS`) count as `{{origin}}` in BOTH sides' captures (DOM,
  network URLs, console, page path), not only in the side that was captured at them. A literal absolute link to
  production in the recorded side (the reader's "Tutors v16" and "What's New" links, a course link to
  `https://tutors.dev`) now reads as production's own rewritten one. A link to another host, another port or another
  path is still a DOM hunk. Nothing changes when neither side is external (release, noise). Consumers see fewer DOM
  hunks in post-deploy; `{{origin}}` in a hunk may now stand for a literal link to production on the recorded side.
- **Secret-shaped values are redacted** (engine, every mode; `src/normalise/redact.ts`). Before anything else,
  `normalise()` replaces, in console messages, network URLs, page paths, the accessibility tree, response header
  values and a journey's error: the value of `apikey=` (and a `"apikey"` JSON member), an `Authorization` value,
  a `Bearer` token, a JWT (`eyJ…` in three base64url parts), and `sb_publishable_…` / `sb_secret_…` keys with
  `<redacted>`, keeping the name (`…&apikey=<redacted>`); the whole value of an `authorization`,
  `proxy-authorization`, `x-api-key` or `apikey` header goes. It is the same on both sides, so it never causes or hides a
  hunk, and `report.json`, `report.md`, `report.html` and PR summaries never hold the value. The collector redacts
  too (a new `capture.json` does not hold it), and post-deploy re-redacts the recorded side it copies into
  `a/capture.json`. Not covered: captures written before this change keep the value on disk in the run directory
  that recorded them (delete them or the artifact), logs (the harness keeps keys and counts, never a line), and
  anything not on the list, which is narrow on purpose.
- **Post-deploy reason wording** (patch-level). The reason `N new difference(s) between production and the recorded
  candidate: open a rollback issue` says so only where a CI step opens one (`HARNESS_ROLLBACK_ISSUE`, else
  `GITHUB_ACTIONS`); a local run says `decide whether to roll back`. Verdicts are unchanged. `harness local watch`
  stamps each log line with the time it is printed and says `(run started <time>)`.
- **New environment variable `HARNESS_ROLLBACK_ISSUE`** (post-deploy wording only): `1`, `true` or `yes` says a CI step
  opens a rollback issue; `0`, `false` or `no` says none does. Unset: GitHub Actions has the step, anything else does not.

**Workflows: the release run has a title, and one more artifact** (no field changes)

- `release.yml` sets `run-name: release <candidate>` (from the dispatch payload's
  `candidate`, or the manual input), so a caller can find the run a `release-candidate`
  dispatch started by title (`workflows.json` `runNames`). A title matches only as a whole
  tag. Before, a repository-dispatched run was titled after a commit message.
- `weekly-mutants.yml` uploads `mutant-noise-report` (7 days) when its self-test fails: the
  A/A report of the base, reports and captures only. A new artifact is a minor addition.
- The nightly, the release job and the weekly mutants install grype, pinned, and cache one
  vulnerability database; the nightly and the release job set `HARNESS_REQUIRE_STATIC=1`,
  the mutants job does not (see [Workflows](#workflows-what-the-harness-accepts)).

**The vulnerability database is one pinned directory** ([environment](#cli))

- New command `harness vuln-db update|status` (not stable: see above). `update`
  fetches grype's database into `HARNESS_VULN_DB_DIR`, else `<HARNESS_HOME>/vuln-db`:
  the only place a database is ever updated, before a run, never during one.
  `status` prints the database a scan would read, its build time, age and checksum.
- `HARNESS_VULN_DB_DIR`, unset, now means `<HARNESS_HOME>/vuln-db` when that
  directory exists (it did mean grype's own cache before); a machine that never ran
  `vuln-db update` behaves as before. New environment variable
  `HARNESS_VULN_DB_MAX_AGE_DAYS` (default `5`, grype's own limit): `harness doctor`
  warns beyond it and it is passed to grype, so the two agree. Scans and reports are
  unchanged.

### 1.3.0 (minor; digests, rules, the local store, the local commands, checkout names, the `time` app, statistics)

`main` is at 1.1.0 and this is its next release: 1.2.0 (below) was never
released on its own, so 1.3.0 carries everything of 1.2.0 as well, and its entry
stays as the history of that part. One bump carrying every contract-visible change
of the local-first work, of the release-gate follow-ups and of the `time` app.
Additive for a consumer written against 1.2.0 (or 1.1.0, plus the additions
listed under 1.2.0): a dispatch payload without the new fields, a claims file
without `rule`, a workflow that passes `--noise`, a checkout with one stack and a
`--a`/`--b` spec without `time=` all behave as they did. The harness version is
1.3.0 as well. Five things are not purely additive and are called out where they
occur: a `rule` key in a claim was ignored before and is now checked; a missing
`--noise` no longer means "no status" on a machine that has a local noise store;
the default name of the compose project and kind cluster changed; a stack under
the old name is left alone; and the `runs` default of `release-candidate` is now
`5`, not `3`.

**Image digests in the dispatch, the release record, the deployment check**
([details](#image-digests-and-the-release-record))

- `release-candidate` payload: optional `production_digests` and
  `candidate_digests` (objects `app -> sha256:<64 hex>`, any app the harness
  stacks). `deployed` payload: optional `production` (tag) and `digests`.
- CLI, all stable: `--a-digests` and `--b-digests` (`run`, `images ensure`),
  which pin the references as `repo:tag@sha256:…`, pull and verify by digest, and
  refuse with **exit `2`, cannot judge**, a digest that disagrees with what the
  tag resolves to now (or a tag that cannot be resolved); a pinned image is never
  built from source. For post-deploy mode: `--deployed`, `--deployed-digests`,
  `--release-record`.
- Release mode writes a **release record**
  ([`release-record.schema.json`](contract/release-record.schema.json)):
  `releases/<candidate>.json` (and `releases/<release>.json` for a candidate that
  could ship) in `HARNESS_HOME`, and `release-record.json` in its output
  directory. `release.yml`'s new `publish-record` job publishes it, never forced,
  to the `release-records` branch of this repository: **a fourth `contents: write`
  scope**, in `release.yml` only, named in `workflows.json` and enforced by the
  tests.
- `report.json`: optional `deployment` (post-deploy mode only). Post-deploy mode
  compares what the deploy reported with the record and **warns** (exit `0`, a
  `pass` becomes `warn`, a `fail` is untouched) on a difference, an app with a
  digest on one side only, no record, or no digests reported.
- Without any of the new fields every run is exactly what it was in 1.2.0.

**`rule` on claims** ([the rules file](#the-rules-file))

- Claims: optional `rule: "NNNN"` (four digits, quoted). With a rule `reason`
  becomes optional free text and the report shows `Rule NNNN: <title>`. A `rule`
  key was an ignored unknown key before 1.3.0; a claims file that carried one now
  has it checked, and a malformed or unknown one is invalid (exit `2`).
- New stable input `--rules <path or url>`, dispatch field and workflow input
  `rules_url`, and [`rules.schema.json`](contract/rules.schema.json)
  (`{ "version": 1, "rules": { "0031": { "title": "…", "digest": "…" } } }`). A
  claim whose rule is not in the file, or that names one with no file, is invalid
  before any stack starts; nothing else about the file gates anything.
- `report.json`: a claim gains optional `rule` and `ruleTitle`; `reason` stays
  always present.
- `reason: "Rule 0031: …"` free-text claims, matching, stale claims and the
  broad-claim rule are unchanged.

**The local noise store is the default source of `--noise`**
([where a run looks](#noise-statusjson-and-the-7-day-rule))

- In `release` and `post-deploy` mode, `--noise` omitted now means the latest
  status in `<HARNESS_HOME>/noise` (written by `harness noise record` and
  `harness local nightly`). The lookup order is exactly: an explicit `--noise`
  (file, directory, `skip`, or the new `none`, which does not look), then the local
  store, then none. A missing status (or an unusable one in the store) still
  **warns**; the store goes through the same gate, so the 7-day / clean / verified
  rule is unchanged. The workflows pass `--noise` and are unaffected.
- New environment variable `HARNESS_HOME`.

**Commands: which are stable, and why**
([the CLI](#cli))

- **Stable since 1.3.0:** `harness doctor`, `harness noise record`, `harness noise
  status` and `harness guard masks|engine|all`, with the flags they take
  (`--status`, `--report`, `--tag`, `--store`, `--run-url`, `--summary`,
  `--require`, `--for`; `--base` and `--json` already were). Reason: the workflows
  and the monorepo depend on them (the nightly's `noise record`, the release and
  post-deploy `noise status`, CI's `guard`, and any script that asks whether a
  machine can run the harness), and each has a small, checkable contract (files it
  writes, exit codes).
- **Not stable:** `harness local nightly|gate|mutants|watch` (wrappers planned
  from the stable commands, which change with the workflows), `harness override
  list` (a listing for people), `harness noise history` (the ratchet as text; the
  file `noise-history.json` is what a program reads), and the flags only they
  take: `--only`, `--migrations-a`, `--migrations-b`, `--interval`,
  `--port-offset`, `--dry-run`, `--once`, `--record`, `--last`, `--since`. They may
  change in a minor release.
- Exit code `1` also covers `doctor` finding a tool a run needs missing, `noise
  record` finding the ratchet broken, `noise status --require` finding a status
  that does not license a FAIL, and `guard` finding a violation.
- This repository's own workflows may call any command `cli.json` declares; the
  copies handed to the monorepo (`docs/monorepo/`) may call only stable ones.

**Checkout names** ([environment](#cli))

- The default compose project and kind cluster name is now
  `tutors-harness-<first 8 hex of sha256 of the checkout's real path>` (lowercased
  on Windows), so two checkouts or git worktrees never share a stack. New
  environment variable `HARNESS_PROJECT`; `HARNESS_COMPOSE_PROJECT` and
  `HARNESS_KIND_CLUSTER` (which already existed) are now contract and win over it.
- A stack under the old default name `tutors-harness` is reported by `harness
  doctor` as a legacy stack, not touched, and never removed. A kind cluster called
  `tutors-harness` is never adopted or deleted: `harness kind` refuses that name.
**Statistics: the Mann-Whitney p-value, and `runs` defaults to `5`**
(no field, flag, artefact or verdict rule changes)

- **Bug fix: the Mann-Whitney p-value was too small.** The normal CDF behind
  the `timing` (page TTFB, journey duration, load) and `startup` artefacts
  passed z where it needed z / sqrt 2: a perfectly separated 5 v 5 reported
  p = 0.0004 (correct: 0.0122), 3 v 3 reported 0.014 (correct: 0.081). Reports
  of 1.2.0 and earlier judged those artefacts on the wrong p, so they are not
  comparable with 1.3.0 reports (harness version, above).
- **Three samples a side cannot reach alpha 0.05.** The `timing` engine (as
  `startup` already did) now says so, as information: `n/n samples cannot reach
  alpha 0.05 (best possible p=0.081). Raise --runs`, for a shift that clears
  `minEffect` and `minShiftMs`. Load says the same when k6 left too few samples.
  Nothing new fails, and nothing that failed before for a reason other than
  the wrong p stops failing.
- **Workflow default: `release-candidate` `runs` is `5` (was `3`)**, and the
  nightly A/A runs `--runs 5`, so both can judge timing at all. A dispatch that
  passes `runs` is unaffected; one that omits it runs two more passes of the
  journeys per side. `weekly-mutants.yml`'s `slow-ssr` mutant runs five, and
  `harness local nightly|gate` default to five as well.

**The `time` app joins the stack**

- The monorepo ships four apps (reader, catalogue, live, time) and the harness
  knew three. `time` is now built into both sides of the compose stack (`time-a`,
  `time-b`, host ports `3104` and `3204`; kind NodePorts `30103` and `30203`,
  published on `4103` and `4203`) and gets the app-level artefacts: `metrics`,
  `logs`, `runtime`, `startup`, and the static image artefacts (`image-manifest`,
  `sbom`, `vulns`). No journey drives it (twelve until a real regression
  escapes), so it has no `dom`, `network`, `screenshot`, `headers`, `axe`, `focus`
  or `timing` artefacts of its own.
- `report.json`: an optional `time` beside `reader`, `catalogue` and `live` in
  `sides.{a,b}`, in `provenance.{a,b}.images` and in `imageArtefacts.{a,b}`. A
  report written before 1.3.0 has none, and a reader of one must tolerate that.
  Hunks for `time` use the app name as the first part of their scope, as for the
  others (`time/user`, `time/root`, `time/ready`).
- CLI: `--a` / `--b` accept `time=REF` in the spelled-out form, optional; left
  out it takes the reader's tag. `--production` and `HARNESS_PRODUCTION_URLS`
  accept `time=URL`, optional. `scripts/build-images.sh` builds four apps.
- Compatibility that is not free: a base tag must now exist for `time` as well
  (`harness images ensure` fails, loudly, if the registry has none), and a kind
  cluster created before 1.3.0 must be recreated (it never published the time
  ports). Reports of 1.2.x are not comparable with 1.3.0 reports (the harness
  version, above): there are more artefacts to differ.

### 1.2.0 (minor; R3, R5 and R7)

All additive: a consumer written against 1.1.0 keeps working. The harness
version is 1.2.0 as well.

- Artefact names (a consumer must tolerate one it does not know): `bus`
  (topics published during a journey; produced only when a bus is configured),
  `image-manifest`, `sbom`, `vulns` (static image artefacts) and `runtime`,
  `startup` (container posture and startup time). Nineteen in all. See
  [Static image artefacts](#static-image-artefacts) and
  [Container runtime artefacts](#container-runtime-artefacts).
- `report.json`: optional `claimHygiene`, `override` and `imageArtefacts`; a
  new `provenance` value `cached` with an optional `cachedAt` on an image;
  `noise.degraded`.
  Consumers must tolerate a `provenance` value they do not know, as they
  tolerate an unknown artefact.
- `noise-status.json`: optional `degraded`. `clean` keeps its meaning. The gate
  refuses a status that carries it (the A/A rule, above); a 1.1.0 status has
  none and is trusted as before.
- CLI: stable flags `--image-cache` (`images ensure`), `--require-verified`,
  `--override-reason`, `--override-by` (`run`, `compare`); non-stable
  `--claim-max-hunks`, `--no-runtime` and `--startup-restarts`. Environment
  variables `HARNESS_CLAIM_MAX_HUNKS`, `HARNESS_SBOM_SOURCE`,
  `HARNESS_SBOM_CMD`, `HARNESS_VULN_CMD`, `HARNESS_VULN_DB_DIR` and
  `HARNESS_REQUIRE_STATIC`. A run without them behaves as in 1.1.0, except
  that the new artefacts are collected by default (`runtime`, `startup` and the
  three static ones), and a `runtime` or `startup` artefact that could not be
  collected is a failing hunk. Exit code `0` for a FAIL now also covers one overridden with
  `--override-reason`; without the flag, `1` as before.
- `normalise/masks.yaml`: an optional `startup:` block (`minShiftMs`, default
  250). Absent, the default applies.
- Workflows: the latest noise status is read from the `noise` branch
  (`nightly-noise.yml` writes it; `release.yml` and `post-deploy.yml` read it)
  instead of the expiring artifact; `release.yml` takes `override_reason` and
  holds `issues: write` in one job; `nightly-noise.yml` holds `contents: write`
  in one job, for that branch only. The runner image of the three jobs that
  produce screenshots is pinned to `ubuntu-24.04`.
