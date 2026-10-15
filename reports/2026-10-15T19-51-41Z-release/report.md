## Release gate: sha-c867ee8 beside 17.0.0

**Gate: FAIL**

#### New since the last forecast

**0 new, 5 gone** in the unclaimed set since the forecast of 2026-10-15T18:04:41.578Z (`sha-d3d7227`), beside the same baseline `17.0.0`. By artefact: network +0 −4 · persistence +0 −1. The previous forecast was judged by harness 1.37.3, this one by 1.37.4: a harness change can move differences too.

Gone since then: network `POST /api/live/activity`: reader-auth:course: new request on b: POST /api/live/activity; network `POST /api/live/activity`: reader-auth:topic: new request on b: POST /api/live/activity; network `GET /_app/immutable/chunks/{{hash}}.js`: reference:course: GET /_app/immutable/chunks/{{hash}}.js requested 43× on a, 44× on b; network `GET /_app/immutable/chunks/{{hash}}.js`: reference:note: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b; persistence `student-signs-in/realtime_claim_live_publish`: student-signs-in: RPC realtime_claim_live_publish — 0 row(s) on a, 2 on b.

#### Causes and the PRs behind them

1 cause, 1 with a PR named. Merged since the forecast of `sha-d3d7227`: [#493](https://github.com/tutors-sdk/tutors-mono-repo/pull/493). No cause is new since then. Each is matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| timing: journey student-signs-in slower on b | 1 | [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (4 files), [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct), [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) (6 files, 1 direct) and 3 more |

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

#### Claims owed (1)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 1, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # timing: journey student-signs-in slower on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "timing"
    scope: "student-signs-in"
    rule: "????"
    reason: "journey student-signs-in slower on b: 1 difference (1 name); likely #483, #478, #481"
```

5 of 8 dimensions measured (weight 70 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **80** |  | −20 unclaimed: timing student-signs-in: journey student-signs-in slower on b: median 3435ms → 8479ms (+147%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 70%) |
| Noise health | 15 | **85** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | not measured |  | quality.json has no mutation scores for 7c4028a (the monorepo's Nightly wrote no Stryker report) and no harness mutants |
| Requirements traceability | 10 | not measured |  | needs the changelog, the EARS files and the claims side by side: pass --traceability <json>; changes.json already reports 7 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry), a floor breach once it is measured |
| Change risk | 15 | **27** |  | −10 PR #476 changed Reader, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it; −3 PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it; −10 PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it; −10 PR #481 changed Reader, Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it; −10 PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it; −10 PR #484 changed Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it; −10 PR #487 changed Reader, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 27 (100 − 73), v17.0.0..c867ee87107a603c3d1ea34be9ff70beab119ee2: 7 of 9 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) | Route every Realtime channel through a budgeted port | 1349 | 41 | 1 | 1.46 | yes |  | **−13** | −3 [PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) | Give each whiteboard room a Realtime budget | 377 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #476 changed Reader, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/476/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#480](https://github.com/tutors-sdk/tutors-mono-repo/pull/480) | Tutors Time: read only the chosen days of a course's calendar | 92 | 6 | 0 | 3.30 | yes |  | **−10** | −10 [PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/480/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) | Tutors Live: publish from the reader's server within a daily Realtime budget | 1421 | 23 | 0 | 3.38 | yes |  | **−10** | −10 [PR #481 changed Reader, Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/481/files#diff-e4fcc76d91071866c7d54b16b300e500d67b42190747baa90741fe8de58a8179) |
| [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) | Release 17.0.0 to main and pin production to it | 424 | 13 | 0 | no production lines | yes |  | **−10** | −10 [PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/483/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#484](https://github.com/tutors-sdk/tutors-mono-repo/pull/484) | ci(deploy): open the pin pull request when a release tag's images are published | 247 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #484 changed Infrastructure, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/484/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#487](https://github.com/tutors-sdk/tutors-mono-repo/pull/487) | fix(community): show an empty catalogue without Supabase instead of logging errors | 67 | 3 | 0 | 3.47 | yes |  | **−10** | −10 [PR #487 changed Reader, Development but no changelog entry under vc867ee87107a603c3d1ea34be9ff70beab119ee2 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/487/files#diff-13d8ab5e67e09ca92971e77ee1fcbb71b39dd5a018144bf33a3bbabd5b3da020) |
| 2 more | no deductions: #485, #493 | 576 | 5 |  |  |  |  | 0 |  |

- churn: reader 111 (median 101.5), catalogue 0 (median 7.5), live 0 (median 3.5), time 0 (median 14)
- hotspots: 15 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/connect/src/services/connect.svelte.ts
- ownership: no file with 3+ authors
- orphans: 7 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at c867ee87107a603c3d1ea34be9ff70beab119ee2 has no "### vc867ee87107a603c3d1ea34be9ff70beab119ee2" entries under a product section)
- tests: apps/reader 59.38, packages/jsr/realtime 2.32, packages/jsr/time 3.30, packages/svelte/community 4.02, packages/svelte/connect 650.00, packages/svelte/realtime-supabase 19.12
- reviews: 9 approved, 0 not
- dependencies: no major bump; 1 new direct dependency (@supabase/supabase-js)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at c867ee87107a603c3d1ea34be9ff70beab119ee2 has no "### vc867ee87107a603c3d1ea34be9ff70beab119ee2" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-10-15T19:51:41.408Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-c867ee8` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-c867ee8` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-c867ee8` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-c867ee8` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:d72750b7cc2f11aa0cb60226f8fbcd434cbb07da9a867715a98c897426b757e0` · rev `c867ee87107a` · version `sha-c867ee8` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:21ce90483d4de95247f85c1e2593ac7caedd87adb65215367805bc9e638eae3d` · rev `c867ee87107a` · version `sha-c867ee8` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:5aee8b0d07dc699002d64e28f2cf42c28045c64d3d9e638ff32bc432021cc51a` · rev `c867ee87107a` · version `sha-c867ee8` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:13b46ba247e41534e91796cfde73f929d086e62f633501cc6b22c4475eb919f3` · rev `c867ee87107a` · version `sha-c867ee8` |

- 1 unclaimed diff(s)
- A/A consulted: clean at 2026-10-15T19:39:16.959Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): 6 difference(s); 2 of this run's 6 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.
  - `dom` `replay:topic-02`: replay:topic-02: semantic DOM differs (+0 −75 lines at line 1)
  - `network` `GET {{course}}/tutors.json`: replay:topic-02: request no longer made on a2: GET {{course}}/tutors.json
  - `network` `GET /_app/immutable/assets/1.{{hash}}.css`: replay:topic-02: request no longer made on a2: GET /_app/immutable/assets/1.{{hash}}.css
  - `network` `GET /_app/immutable/chunks/{{hash}}.js`: replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 41× on a2
  - `network` `GET /_app/immutable/nodes/1.{{hash}}.js`: replay:topic-02: request no longer made on a2: GET /_app/immutable/nodes/1.{{hash}}.js
  - `network` `GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100`: replay:topic-02: request no longer made on a2: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100

### 1 unclaimed difference, 1 cause

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `timing` journey student-signs-in slower on b (1 name: `median 3435ms → 8479ms (+147%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 70%)`) | 1 | — | — | journey student-signs-in slower on b: median 3435ms → 8479ms (+147%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 70%) |

### Unclaimed differences (1)

| artefact | scope | what changed |
|---|---|---|
| `timing` | `student-signs-in` | journey student-signs-in slower on b: median 3435ms → 8479ms (+147%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 70%) |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (14; 14 unclaimed): reported, never gates

19 of 27 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on d72750b7cc2f (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 21ce90483d4d (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 5aee8b0d07dc (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on 13b46ba247e4 (production too) | no date set | unclaimed |
| `timing-tolerance` | `student-signs-in` | journey student-signs-in slower on b beyond the 10% tolerance: 3435ms → 8479ms (+147%, p=0.012, n=5/5 runs; smallest detectable about 70%); timing fails it too (its floor is 20%) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 173 → 173 immutable requests (JS 142 → 142, CSS 31 → 31), 1.6 MB → 1.6 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 542 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 96 → 96 immutable requests (JS 83 → 83, CSS 13 → 13), 1.0 MB → 1.0 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |

### Claimed differences (5)

| artefact | scope | claimed by |
|---|---|---|
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `persistence` | `student-signs-in/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |

### Claim hygiene

3 claim(s) cover 5 failing hunk(s): 1.67 hunk(s) per claim, at most 2 under one claim (flagged above 10).

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 308.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.26 ms | 2.12 ms |
| b | 601 | 0 | 0 | 1.32 ms | 2.2 ms |

<details><summary>Informational (36)</summary>

- `console` reader:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.33 / b 0 per reader page (broadcasts a 4 / b 0, socket data frames a 0 / b 0, over 3 page view(s))
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on d72750b7cc2f (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 21ce90483d4d (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 5aee8b0d07dc (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on 13b46ba247e4 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `timing-tolerance` journey student-signs-in slower on b beyond the 10% tolerance: 3435ms → 8479ms (+147%, p=0.012, n=5/5 runs; smallest detectable about 70%); timing fails it too (its floor is 20%)
- `asset-graph` reader: the asset graph changed: 173 → 173 immutable requests (JS 142 → 142, CSS 31 → 31), 1.6 MB → 1.6 MB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 542 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 96 → 96 immutable requests (JS 83 → 83, CSS 13 → 13), 1.0 MB → 1.0 MB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-availability: 100.0% of 601 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` reader-latency: 100.0% of 601 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for time
- `slo` time-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for time
- `slo` reader-latency-tail: 100.0% of 62 reader requests under 2.5s on b (its /metrics across the journeys), objective 99.0%: holds
- `slo` reader-latency-tail: 100.0% of 601 reader requests under 2.5s on b (the k6 load leg), objective 99.0%: holds

</details>

<sub>harness 1.37.4 (489eb3fddf46, contract 1.37.0) · 2026-10-15T19:51:41.408Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×92, request-id×92, etag×92, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1539, persistence-stub-requests×140, oauth-callback-state×10, media-range-status×42, chromium-compute-pressure-policy×1, hashed-assets×5014, footer-tutors-version×344, transport-length×92, transport-connection×92, transport-keepalive×92</sub>


</details>
