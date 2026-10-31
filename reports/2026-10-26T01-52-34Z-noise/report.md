## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:17.0.0` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:17.0.0` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:17.0.0` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` |

- A/A is clean: the harness may gate releases

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 2 findings (2 on production too) | 1 finding (1 on production too) | 3 findings (3 on production too) |
| catalogue | 2 findings (2 on production too) | 1 finding (1 on production too) | 3 findings (3 on production too) |
| live | 2 findings (2 on production too) | 1 finding (1 on production too) | 3 findings (3 on production too) |
| time | 2 findings (2 on production too) | 1 finding (1 on production too) | 3 findings (3 on production too) |

### Informing (46; 46 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `realtime` | `reader-auth:rule-0592-stroke-saved/websocket` | reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 5 data frame(s) sent); readers must be publish-only (production too) | no date set | unclaimed |
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 15e3aa22476d (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on e9f2764654cb (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 52740e55cfa7 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on d0a9f4a2f462 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/GHSA-cg2g-xh64-v4q7` | reader: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/GHSA-mrv2-3pqr-j5jr` | reader: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/GHSA-xjj6-f33q-929c` | reader: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/GHSA-cg2g-xh64-v4q7` | catalogue: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/GHSA-mrv2-3pqr-j5jr` | catalogue: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/GHSA-xjj6-f33q-929c` | catalogue: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/GHSA-cg2g-xh64-v4q7` | live: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/GHSA-mrv2-3pqr-j5jr` | live: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/GHSA-xjj6-f33q-929c` | live: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/GHSA-cg2g-xh64-v4q7` | time: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/GHSA-mrv2-3pqr-j5jr` | time: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/GHSA-xjj6-f33q-929c` | time: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/url/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/body/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) | 100 advisories, db built 2026-10-25T06:27:34Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.3 ms | 1.94 ms |
| b | 601 | 0 | 0 | 1.12 ms | 2.04 ms |

<details><summary>Informational (59)</summary>

- `realtime` reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 5 data frame(s) sent); readers must be publish-only (production too)
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.09 / b 1.05 per reader page (broadcasts a 18 / b 18, socket data frames a 6 / b 5, over 22 page view(s))
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `image-hardening` time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 15e3aa22476d (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on e9f2764654cb (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 52740e55cfa7 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on d0a9f4a2f462 (production too)
- `vuln-ceiling` reader: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` reader: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` reader: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too)
- `vuln-ceiling` catalogue: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` catalogue: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` catalogue: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too)
- `vuln-ceiling` live: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` live: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` live: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too)
- `vuln-ceiling` time: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` time: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` time: GHSA-xjj6-f33q-929c (High) in undici@8.11.2 has a fix: 8.12.2 (production too)
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor): holds
- `slo` reader-availability: 100.0% of 601 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor): holds
- `slo` reader-latency: 100.0% of 601 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for time
- `slo` time-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for time
- `secrets-in-response` reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)

</details>

<sub>harness 1.57.1 (b2c7295c4a4a, contract 1.57.0) · 2026-10-26T01:52:34.896Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×272, request-id×272, etag×272, metrics-process×599, metrics-timing-histograms×12, third-party-requests×6862, persistence-stub-requests×2600, oauth-callback-state×110, media-range-status×47, hashed-assets×20124, footer-tutors-version×846, transport-length×272, transport-connection×272, transport-keepalive×272</sub>
