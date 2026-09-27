## ✅ Release harness — release — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.2` | `quay.io/tutors-sdk/tutors-reader:16.2.2` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.2` | `quay.io/tutors-sdk/tutors-catalogue:16.2.2` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.2` | `quay.io/tutors-sdk/tutors-live:16.2.2` |
| time | `quay.io/tutors-sdk/tutors-time:16.2.2` | `quay.io/tutors-sdk/tutors-time:16.2.2` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` |
| catalogue image | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` |
| live image | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` |
| time image | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` |

- every difference is claimed
- A/A consulted: clean at 2026-09-27T14:44:00.475Z

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 291 distinct package(s) (cosign attestation (signature verified)) | 291 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 277 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 277 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 287 distinct package(s) (cosign attestation (signature verified)) | 287 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.29 ms | 2.22 ms |
| b | 600 | 0 | 0 | 1.29 ms | 2.29 ms |

<details><summary>Informational (3)</summary>

- `console` reader-auth:course: console message gone on b
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.4.14 (912b40fcf8f4, contract 1.4.0) · 2026-09-27T16:11:58.711Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×872, persistence-stub-requests×220, hashed-assets×5320, footer-tutors-version×238, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
