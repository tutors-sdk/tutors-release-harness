## Release gate: sha-b146cca beside 17.1.0

**Gate: PASS**

#### New since the last forecast

The first kept forecast beside `17.1.0`: nothing earlier to compare with.

**RCS 55 Red: hold, open a 5 Whys, do not re-run hoping for a better number**

#### Claims owed

None: no unclaimed difference.

weighted mean 55.00 over 6 of 8 dimensions measured (weight 80 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** | **breached** | −15 stale claim network * /api/{me,profile,presence,analytics,courses/visit}: matched nothing (Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login); −15 stale claim network * /api/whiteboard*: matched nothing (Rule 0068: a signed-in student's whiteboard edits are saved through the server, in a room only its owner can read or overwrite); −15 stale claim persistence */tutors-connect-{courses,profiles}: matched nothing (Rule 0072: student rows are written by the reader's server under the session's login, not by the browser); −15 stale claim network GET /api/time/*: matched nothing (CHANGELOG Unreleased (Time): the dashboard loads time data from the reader); −15 stale claim logs reader-auth/{courseId,role}: matched nothing (CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320)); −15 stale claim image-manifest */base: matched nothing (Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541)); −10 stale claim sbom */node: matched nothing (Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541)) (and 4 more like it, not counted again) |
| Noise health | 15 | **40** | **breached** | −40 the A/A of 2026-11-04T10:15:59.796Z is DEGRADED and does not count: journey "rule-0587-calendar-llm" failed on both sides, so this run saw nothing of its pages; −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask chromium-compute-pressure-policy fired nothing in this run (a mask that never fires is a mask to delete); −5 mask course-media-http2-reset fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete) (and 1 more like it, not counted again) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | not measured |  | quality.json has no mutation scores for b146cca (the monorepo's Nightly wrote no Stryker report) and no harness mutants |
| Requirements traceability | 10 | **30** |  | −10 claim 6 (logs reader-auth/{courseId,role}) names #320, not between 17.1.0 and b146cca3900e27a2be21e99e873e731dfa6f9df8 traces to no changelog entry; −10 claim 7 (image-manifest */base) names #541, not between 17.1.0 and b146cca3900e27a2be21e99e873e731dfa6f9df8 traces to no changelog entry; −10 claim 8 (sbom */node) names #541, not between 17.1.0 and b146cca3900e27a2be21e99e873e731dfa6f9df8 traces to no changelog entry; −10 claim 9 (network POST /api/live/activity) names #481, not between 17.1.0 and b146cca3900e27a2be21e99e873e731dfa6f9df8 traces to no changelog entry; −10 claim 10 (persistence */realtime_claim_live_publish) names #481, not between 17.1.0 and b146cca3900e27a2be21e99e873e731dfa6f9df8 traces to no changelog entry; −10 claim 11 (persistence */realtime_watch) names #481, not between 17.1.0 and b146cca3900e27a2be21e99e873e731dfa6f9df8 traces to no changelog entry; −10 claim 12 (network GET /_app/immutable/chunks/\{\{hash\}\}.js) names #478, #481, not between 17.1.0 and b146cca3900e27a2be21e99e873e731dfa6f9df8 traces to no changelog entry |
| Change risk | 15 | **100** |  | — |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 100 (100 − 0), v17.1.0..b146cca3900e27a2be21e99e873e731dfa6f9df8: 0 of 0 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

- churn: reader 0 (median 114), catalogue 0 (median 35.5), live 0 (median 26.5), time 0 (median 61)
- hotspots: 47 file(s) changed in 3+ of the last 6 releases; touched this release: none
- ownership: no file with 3+ authors
- orphans: 0 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at b146cca3900e27a2be21e99e873e731dfa6f9df8 has no "### vb146cca3900e27a2be21e99e873e731dfa6f9df8" entries under a product section)
- tests: no production lines changed
- reviews: 0 approved, 0 not
- dependencies: no major bump; 0 new direct dependencies

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at b146cca3900e27a2be21e99e873e731dfa6f9df8 has no "### vb146cca3900e27a2be21e99e873e731dfa6f9df8" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-11-04T10:47:41.834Z — exit code **0**

| step | result | report |
| --- | --- | --- |
| release | PASS |  |

<details><summary>release: PASS</summary>

## ✅ Release harness — release — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.1.0` | `quay.io/tutors-sdk/tutors-reader:sha-b146cca` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.1.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-b146cca` |
| live | `quay.io/tutors-sdk/tutors-live:17.1.0` | `quay.io/tutors-sdk/tutors-live:sha-b146cca` |
| time | `quay.io/tutors-sdk/tutors-time:17.1.0` | `quay.io/tutors-sdk/tutors-time:sha-b146cca` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` · rev `b146cca3900e` · version `17.1.0-rc.1` |
| catalogue image | `sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` · rev `b146cca3900e` · version `17.1.0-rc.1` |
| live image | `sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` · rev `b146cca3900e` · version `17.1.0-rc.1` |
| time image | `sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` · rev `b146cca3900e` · version `17.1.0-rc.1` |

- every difference is claimed
- 11 claim(s) matched nothing and should be removed from the changelog
- journey "rule-0587-calendar-llm" failed on both sides, so this run saw nothing of its pages
- A/A consulted: clean but DEGRADED (does not count) at 2026-11-04T10:15:59.796Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): clean. Reported, never gates.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | holds |
| catalogue | 1 finding (1 on production too) | holds | holds |
| live | 1 finding (1 on production too) | holds | holds |
| time | 1 finding (1 on production too) | holds | holds |

### Informing (32; 32 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/body/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/url/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/strict-transport-security` | catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/content-security-policy` | catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `live/strict-transport-security` | live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `live/content-security-policy` | live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/strict-transport-security` | reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/content-security-policy` | reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `time/strict-transport-security` | time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `time/content-security-policy` | time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |

### Claim hygiene

11 claim(s) cover 0 failing hunk(s): 0 hunk(s) per claim, at most 0 under one claim (flagged above 10).

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 329.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 329.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 144 distinct package(s) (cosign attestation (signature verified)) | 144 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 9 layers, 288.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 288.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 9 layers, 289.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 289.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 9 layers, 293.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 293.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-03T06:20:47Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.09 ms | 2.21 ms |
| b | 600 | 0 | 0 | 1.06 ms | 1.78 ms |

<details><summary>Informational (62)</summary>

- `dom` journey "rule-0587-calendar-llm" failed on both sides
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `build-provenance` reader: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `build-provenance` catalogue: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `build-provenance` live: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `build-provenance` time: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `vuln-ceiling` reader: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-availability: 100.0% of 600 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` reader-latency: 100.0% of 600 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency-tail: 100.0% of 62 reader requests under 2.5s on b (its /metrics across the journeys), objective 99.0%: holds
- `slo` reader-latency-tail: 100.0% of 600 reader requests under 2.5s on b (the k6 load leg), objective 99.0%: holds
- `secrets-in-response` reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `headers-policy` catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)

</details>

<details><summary>Stale claims (11)</summary>

- `network` `* /api/{me,profile,presence,analytics,courses/visit}` — Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login
- `network` `* /api/whiteboard*` — Rule 0068: a signed-in student's whiteboard edits are saved through the server, in a room only its owner can read or overwrite
- `persistence` `*/tutors-connect-{courses,profiles}` — Rule 0072: student rows are written by the reader's server under the session's login, not by the browser
- `network` `GET /api/time/*` — CHANGELOG Unreleased (Time): the dashboard loads time data from the reader
- `logs` `reader-auth/{courseId,role}` — CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320)
- `image-manifest` `*/base` — Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541)
- `sbom` `*/node` — Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541)
- `network` `POST /api/live/activity` — Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481)
- `persistence` `*/realtime_claim_live_publish` — Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481)
- `persistence` `*/realtime_watch` — Rule 0334: While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. — Rule 0334: while it shows a course or the platform feed, Tutors Live reports itself as a watcher of that feed through realtime_watch every 60 seconds (#481)
- `network` `GET /_app/immutable/chunks/\{\{hash\}\}.js` — Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481)

</details>

<sub>harness 1.61.0 (14c31db47699, contract 1.61.0) · 2026-11-04T10:47:41.834Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×262, request-id×262, etag×262, metrics-process×599, metrics-timing-histograms×32, third-party-requests×6767, persistence-stub-requests×260, oauth-callback-state×100, media-range-status×41, hashed-assets×19780, footer-tutors-version×824, transport-length×262, transport-connection×262, transport-keepalive×262</sub>


</details>
