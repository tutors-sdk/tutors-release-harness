## ⚠️ Release harness — noise — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:0e60d5620e9c696edcfa696afcad0a10758d1630d6617c636e552a69b5644b91` · rev `7feefea6742f` · version `sha-7feefea` | `sha256:0e60d5620e9c696edcfa696afcad0a10758d1630d6617c636e552a69b5644b91` · rev `7feefea6742f` · version `sha-7feefea` |
| catalogue image | `sha256:b96d70205d2dff530580f44ad3f72f26074b35895745e66c4ffe491693b1b951` · rev `7feefea6742f` · version `sha-7feefea` | `sha256:b96d70205d2dff530580f44ad3f72f26074b35895745e66c4ffe491693b1b951` · rev `7feefea6742f` · version `sha-7feefea` |
| live image | `sha256:7eb35aa4c95da3bf78ec474c71a58b75ce603794eacc9ec1fc9bb6b5ae96aacb` · rev `7feefea6742f` · version `sha-7feefea` | `sha256:7eb35aa4c95da3bf78ec474c71a58b75ce603794eacc9ec1fc9bb6b5ae96aacb` · rev `7feefea6742f` · version `sha-7feefea` |
| time image | `sha256:58a8496865d6f8d6a206345cbe66b7eadc78d6c273b91bc0c17bdf84f9270458` · rev `7feefea6742f` · version `sha-7feefea` | `sha256:58a8496865d6f8d6a206345cbe66b7eadc78d6c273b91bc0c17bdf84f9270458` · rev `7feefea6742f` · version `sha-7feefea` |

- A/A is clean but DEGRADED, so it does not count: journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (9; 9 unclaimed): reported, never gates

19 of 27 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `realtime` | `reader-auth:course/websocket` | reader-auth:course: a reader page opened a Realtime websocket on b (1 socket(s), 0 data frame(s) sent); readers must be publish-only (production too) | no date set | unclaimed |
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 0e60d5620e9c (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on b96d70205d2d (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 7eb35aa4c95d (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on 58a8496865d6 (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.1 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 274.4 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.4 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 285.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.1 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-14T06:30:34Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.36 ms | 2.16 ms |
| b | 600 | 0 | 0 | 1.27 ms | 1.97 ms |

<details><summary>Informational (27)</summary>

- `dom` journey "reference-course-reads" failed on both sides
- `timing` journey live-loads median 1418ms → 1706ms but not significant (p=0.676, +20%, n=5/5; smallest slowdown 5/5 runs could detect: about 81%)
- `realtime` reader-auth:course: a reader page opened a Realtime websocket on b (1 socket(s), 0 data frame(s) sent); readers must be publish-only (production too)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 0e60d5620e9c (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on b96d70205d2d (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 7eb35aa4c95d (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on 58a8496865d6 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 18 critical or high, none with a fix available
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor): holds
- `slo` reader-availability: 100.0% of 600 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor): holds
- `slo` reader-latency: 100.0% of 600 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for time
- `slo` time-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for time

</details>

<sub>harness 1.36.1 (f49f4b5e6bf8, contract 1.36.0) · 2026-10-14T07:49:29.993Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×82, request-id×82, etag×82, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1186, persistence-stub-requests×260, realtime-rest-fallback-warning×10, oauth-callback-state×10, hashed-assets×4454, footer-tutors-version×324, transport-length×82, transport-connection×82, transport-keepalive×82</sub>
