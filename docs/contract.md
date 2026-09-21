# The integration contract

Contract version: `1.3.0`

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
harness 1.3.0 (3f2c…) · contract 1.3.0
$ pnpm harness version --json
{"version":"1.3.0","gitSha":"3f2c…","contractVersion":"1.3.0"}
```

`gitSha` is `git rev-parse HEAD` of the harness checkout, or the
`HARNESS_GIT_SHA` environment variable when set, or `null` when neither is
available (a tarball).

Pin the harness by tag (`v1.3.0`) or by sha, and check `schemaVersion === 1`
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
| `release-record.json` | `release` mode only (since 1.3.0) | yes — [the release record](#the-release-record) |
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
| `sides` | `{ a, b }`, each `{ reader, catalogue, live, time? }` | the image reference of each app on each side (`time` since 1.3.0; absent from an earlier report). In migration mode `reader` is `migrations:<ref>` and the others `-`; in post-deploy mode `a` is the recorded candidate's images and each of `b`'s is `external:<URL>` (`-` for `time` when no `time=` URL was given) |
| `provenance` | `{ a?, b? }`, optional — since 1.1.0 | where each side's images came from; see [Image provenance](#image-provenance). A side is absent when it was not inspected: migration mode, the live side of post-deploy mode, a capture recorded before 1.1.0 |
| `imageArtefacts` | `{ a?, b? }`, optional — since 1.2.0 | per side, per app, whether each static image artefact (`manifest`, `sbom`, `vulns`) was collected, and for one that was not, why; see [Static image artefacts](#static-image-artefacts). A side is absent when its images were not inspected: migration mode, the live side of post-deploy mode, a capture recorded before 1.2.0 |
| `verdict` | `pass` \| `warn` \| `fail` | see [Verdicts and exit codes](#verdicts-and-exit-codes) |
| `reasons` | string[] | why, one line each. For people: **do not parse** |
| `noise` | noise status, optional | the status consulted for the gating decision; absent when `--noise` was not given or was `skip`. Carries `degraded` when the status did |
| `compare.hunks` | Hunk[] | every difference, failing and informational |
| `compare.matches` | `{ hunk, claim? }[]` | one per hunk, with the claim that covers it, if any |
| `compare.unclaimed` | Hunk[] | failing hunks no claim covers — what gates |
| `compare.staleClaims` | Claim[] | claims that matched nothing; reported, never gate |
| `compare.broadUnapproved` | Claim[] | broad claims without `approvedBy`; gate in `release` and `post-deploy` |
| `masksApplied` | `{ [maskId]: integer }` | how often each mask in `normalise/masks.yaml` changed something, both sides summed; `0` is a silent mask |
| `migration` | optional | migration mode only: `{ a, b, rolledBack }`; `a`/`b` are `{ ref, files[], catalog }`, a catalog is `{ tables: { [table]: { [column]: { type, nullable, default } } }, indexes[], functions[], policies[] }` |
| `upgrade` | optional | upgrade mode only: `{ substrate, requests, failed, serverErrors, byUpstream: { [side]: { requests, failed, serverErrors, p95 } }, switchedAt, durationMs }`; times in ms |
| `load` | optional | when `--load` ran on both sides: `{ a, b }`, each `{ requests, failed, serverErrors, p50, p95, rate, duration }` |
| `claimHygiene` | optional — since 1.2.0 | present when the claims file had claims; see [Claim hygiene](#claim-hygiene). Informational: never changes the verdict |
| `override` | optional — since 1.2.0 | present only when an override of a FAIL was requested; see [Overriding a FAIL](#overriding-a-fail) |
| `deployment` | optional — since 1.3.0 | post-deploy mode, when the deploy reported what it deployed: `{ production?, status, digests, recorded?, record?, problems[] }`, the deployed digests against the release record; see [Checking a deployment](#checking-a-deployment). Advisory: a `status` other than `match` turns a `pass` into a `warn` and never touches a `fail` |

**Hunk**: `{ id, artefact, scope, path?, summary, detail?, severity }`.
`artefact` is one of `dom`, `screenshot`, `network`, `console`, `headers`,
`axe`, `focus`, `metrics`, `logs`, `timing`, `persistence`, `bus`, `migration`,
`upgrade`, `image-manifest`, `sbom`, `vulns`, `runtime`, `startup`. `bus` and
the last five are since 1.2.0 (see [Static image artefacts](#static-image-artefacts)
and [Container runtime artefacts](#container-runtime-artefacts)); a consumer
must tolerate an artefact name it does not know. `severity` is `fail` (gates unless claimed) or `info` (reported,
never gates). `scope` and `path` are what a claim's glob is matched against.
`id` is stable for the same difference within a run; do not rely on it across
harness versions. `summary` and `detail` are for people.

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
- an informational hunk `<app>/not-collected` under the artefact that could not
  be compared: a failing one when `HARNESS_REQUIRE_STATIC=1`, which is what a
  release pipeline that must not pass without an SBOM diff sets.

The vulnerability scan needs the SBOM; with no SBOM it is not collected either.
A side without `imageArtefacts` (an external side, migration mode) is not
compared at all.

Claims name these artefacts like any other, e.g. `artefact: sbom`,
`scope: "reader/@sveltejs/kit"`; see [`claims/README.md`](../claims/README.md).

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
summary of the form `… not collected: <reason>`. It gates like any unclaimed
difference, and is claimed like one (`artefact: runtime`, `scope:
"*/not-collected"`, a reason a reviewer can weigh). An operator's choice
(`--no-runtime`, `--startup-restarts 0`, and always `--startup-restarts 0` in
`upgrade` mode and in the `mutants` self-test) is `info` and says so. A capture
recorded by a harness older than 1.2.0 has neither field; against a capture that
has them it counts as not collected.

Informational `runtime/summary` and `startup/summary` hunks list what was
collected (per app, both sides), so a report that found nothing still shows what
it looked at. The startup restarts leave every app running.

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
| `degraded` | optional, since 1.2.0: a non-empty list of reasons the evidence is weak even at `hunks: 0` — an image was not pulled and signature-verified in the run (a registry outage was survived from the runner's cache, or the images were built or already present locally). Written only by `noise` mode run with `--require-verified`, which the nightly always passes. Absent or empty means nothing was wrong. `clean` keeps its meaning (`hunks` is `0`); the gate additionally refuses a status that has `degraded` |

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
  "harness": { "version": "1.3.0", "gitSha": "3f2c…", "contractVersion": "1.3.0" },
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
```

- `artefact`: one of the nineteen artefact names above, or `*`.
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

## CLI

Full list: [`contract/cli.json`](contract/cli.json). Invoke as `pnpm harness
<command>` from a checkout (Node ≥ 22, `pnpm install`, and for capturing modes
`pnpm exec playwright install chromium` and Docker). Commands and flags marked
`stable: true` there are the ones below; the rest (`harness stack`, `harness
kind`, `harness journeys`, `harness override`, `harness local`, `harness noise
history`, `--substrate`, `--now`, `--masks`, `--snapshot`,
`--upgrade-*`, `--noise-max-age-days`, `--no-screenshots`, `--no-axe`,
`--no-focus`, `--no-runtime` and `--startup-restarts` (both since 1.2.0),
`--keep`, `--no-stack`) are for people at a terminal and may
change in a minor release.

Which of the 1.3.0 commands are stable: `doctor`, `noise record`, `noise status`
and `guard` are, because workflows and the monorepo call them (the workflows'
`noise status --store noise`, the nightly's `noise record`, CI's `guard`, and any
script that asks whether a machine can run the harness). Their flags (`--status`,
`--report`, `--tag`, `--store`, `--run-url`, `--summary`, `--require`, `--for`,
`--base`, `--json`) are stable with them. `harness local` (the maintainer wrappers,
whose steps are planned from the same commands and change with them), `harness
override list` (a listing for people), `harness noise history` (the ratchet as
text; the file `noise-history.json` is what a program reads) and the flags only
they take (`--only`, `--migrations-a`, `--migrations-b`, `--interval`,
`--port-offset`, `--dry-run`, `--once`, `--record`, `--last`, `--since`) are not.

| Command | Stable flags |
| --- | --- |
| `harness run` | `--mode` (required), `--a`, `--b` (required except in post-deploy), `--claims <file>`, `--rules <path\|url>` (since 1.3.0: the Rules a claim may name, see [The rules file](#the-rules-file)), `--noise <file\|dir\|skip\|none>` (omitted: the latest status in the local store, see [`noise-status.json`](#noise-statusjson-and-the-7-day-rule)), `--runs <n>`, `--set <fixture,auth,reference>`, `--journey <name>` (repeatable), `--load <rate>x<duration>`, `--out <dir>`, `--image-prefix <prefix or {app} template>`, `--allow-unsigned`, `--require-verified` (noise mode: write the status `degraded` unless every image on both sides was pulled and verified in this run), `--override-reason <text>` and `--override-by <who>` (see [Overriding a FAIL](#overriding-a-fail)), `--a-digests <digests>` and `--b-digests <digests>` (since 1.3.0: pin a side's images, see [Image digests](#image-digests-and-the-release-record)); post-deploy: `--recorded <release run dir>`, `--production reader=URL,catalogue=URL,live=URL[,time=URL]`, and since 1.3.0 `--deployed <tag>`, `--deployed-digests <digests>` and `--release-record <file\|dir>` (see [Checking a deployment](#checking-a-deployment)) |
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
| `HARNESS_SBOM_CMD` | `syft docker:{image} -o spdx-json` | since 1.2.0. The generator for `generate`; `{image}` is the image reference. Split on whitespace and quotes; no shell |
| `HARNESS_VULN_CMD` | `grype sbom:{sbom} -o json` | since 1.2.0. The scanner; `{sbom}` is the path of the SPDX SBOM; must print grype or trivy JSON. trivy: `trivy sbom --format json {sbom}` |
| `HARNESS_VULN_DB_DIR` | unset | since 1.2.0. A pre-fetched scanner database directory. Scanner database updates are always switched off, so a scan uses exactly this database |
| `HARNESS_REQUIRE_STATIC` | unset | `1`, `true` or `yes`, since 1.2.0: a static image artefact that could not be collected is a failing hunk, not an informational one |

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
check run, tag, label, approve or merge, in any repository, and pushes to none
but the one branch named below.

What it does instead:

- writes `report.md` — shaped to be a PR comment — to the artifact and the
  run's step summary. Posting it on the release PR, and turning the run's
  conclusion into a check, is the monorepo's job, with the monorepo's token;
- in `post-deploy.yml` only, and only with `issues: write` on **this**
  repository: opens an issue labelled `rollback` with `report.md` as its body
  when post-deploy mode exits `1`;
- since 1.2.0, in `release.yml` only, the `override-record` job, with
  `issues: write` on **this** repository: opens an issue labelled
  `harness-override` for each FAIL a person overrode;
- since 1.2.0, in `nightly-noise.yml` only, the `publish` job, with
  `contents: write` on **this** repository: force-pushes the `noise` branch
  (the latest A/A status, its history and summary);
- since 1.3.0, in `release.yml` only, the `publish-record` job, with
  `contents: write` on **this** repository: pushes the `release-records` branch
  (`releases/<candidate>.json` and `releases/<release>.json`, see [the release
  record](#the-release-record)). No other branch, no tag, no release, no other
  repository. A test lists these four write scopes and fails on any other.

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

Releases are git tags `v<harness version>` on `main`, cut by a maintainer.

## Changes

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
  `sbom`, `vulns`). No journey drives it (a journey is added only when a real regression
  escaped that it would have caught), so it has no `dom`, `network`, `screenshot`, `headers`, `axe`, `focus`
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
