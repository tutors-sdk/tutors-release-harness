## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:d762443173876708d631b81ff70d8042eb1ef7572e69a2d5c7813bc030f80f88` · rev `865d02f82cd6` · version `sha-865d02f` | `sha256:d762443173876708d631b81ff70d8042eb1ef7572e69a2d5c7813bc030f80f88` · rev `865d02f82cd6` · version `sha-865d02f` |
| catalogue image | `sha256:25318d08ba744eae4ed29e2da3a0ce22dcff03c9b650cb7dbcac9d521553476e` · rev `865d02f82cd6` · version `sha-865d02f` | `sha256:25318d08ba744eae4ed29e2da3a0ce22dcff03c9b650cb7dbcac9d521553476e` · rev `865d02f82cd6` · version `sha-865d02f` |
| live image | `sha256:a74b94e7e5f8c1f4fb8a13ba4a04c5009865bd9d5fc1c9cc28ccc546e260056d` · rev `865d02f82cd6` · version `sha-865d02f` | `sha256:a74b94e7e5f8c1f4fb8a13ba4a04c5009865bd9d5fc1c9cc28ccc546e260056d` · rev `865d02f82cd6` · version `sha-865d02f` |
| time image | `sha256:86951ef3ca3556b46a143fbbfc1969270204f8755e9f183c20e94ffccf40fc07` · rev `865d02f82cd6` · version `sha-865d02f` | `sha256:86951ef3ca3556b46a143fbbfc1969270204f8755e9f183c20e94ffccf40fc07` · rev `865d02f82cd6` · version `sha-865d02f` |

- A/A is clean: the harness may gate releases

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.35 ms | 1.99 ms |
| b | 601 | 0 | 0 | 1.24 ms | 2.12 ms |

<details><summary>Informational (2)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.15.0 (c324525fdeca, contract 1.15.0) · 2026-09-30T08:40:44.617Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1413, persistence-stub-requests×410, hashed-assets×7110, footer-tutors-version×320, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
