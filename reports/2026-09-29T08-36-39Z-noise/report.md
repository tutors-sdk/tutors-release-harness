## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:13342ee30fd62a5a8d63cfafcfcebaf5c822feaae725aaa3233fdcf1ebefa42c` · rev `90cb998977c5` · version `sha-90cb998` | `sha256:13342ee30fd62a5a8d63cfafcfcebaf5c822feaae725aaa3233fdcf1ebefa42c` · rev `90cb998977c5` · version `sha-90cb998` |
| catalogue image | `sha256:f461d8cbbf06bf8c03bbf5c204fb9fc624de9927575b08e85088d1f36be6db3e` · rev `90cb998977c5` · version `sha-90cb998` | `sha256:f461d8cbbf06bf8c03bbf5c204fb9fc624de9927575b08e85088d1f36be6db3e` · rev `90cb998977c5` · version `sha-90cb998` |
| live image | `sha256:4c8648b5271c2c4715a3d88628e0630e8c0f1df331b009505d09df0ffec6e366` · rev `90cb998977c5` · version `sha-90cb998` | `sha256:4c8648b5271c2c4715a3d88628e0630e8c0f1df331b009505d09df0ffec6e366` · rev `90cb998977c5` · version `sha-90cb998` |
| time image | `sha256:dc84ae53fbfa4689c742463b87fbd1f428810e9e07764ebc3fe66457ba7e51f1` · rev `90cb998977c5` · version `sha-90cb998` | `sha256:dc84ae53fbfa4689c742463b87fbd1f428810e9e07764ebc3fe66457ba7e51f1` · rev `90cb998977c5` · version `sha-90cb998` |

- A/A is clean: the harness may gate releases

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-29T06:32:31Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.48 ms | 2.25 ms |
| b | 600 | 0 | 0 | 1.46 ms | 2.17 ms |

<details><summary>Informational (2)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.15.0 (c324525fdeca, contract 1.15.0) · 2026-09-29T08:36:39.973Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1413, persistence-stub-requests×410, hashed-assets×7110, footer-tutors-version×320, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
