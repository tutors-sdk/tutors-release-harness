## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:970a356acfdffffe80d318f5476b51ef71ffd174b551e4dbc672deeef22bf623` · rev `185e87f12d34` · version `sha-185e87f` | `sha256:970a356acfdffffe80d318f5476b51ef71ffd174b551e4dbc672deeef22bf623` · rev `185e87f12d34` · version `sha-185e87f` |
| catalogue image | `sha256:ef345ed63a1882abebfade6f28ef06bf8e1e99876957b76efe8d464faa6d82df` · rev `185e87f12d34` · version `sha-185e87f` | `sha256:ef345ed63a1882abebfade6f28ef06bf8e1e99876957b76efe8d464faa6d82df` · rev `185e87f12d34` · version `sha-185e87f` |
| live image | `sha256:aec7d6db4af50545b559d44920089e4a16e3779d3a72febd859663bdc7eb0cda` · rev `185e87f12d34` · version `sha-185e87f` | `sha256:aec7d6db4af50545b559d44920089e4a16e3779d3a72febd859663bdc7eb0cda` · rev `185e87f12d34` · version `sha-185e87f` |
| time image | `sha256:eefab5df8ffb855853b3df328ec5ffc7dede69ef34e36203b45360601e64f6e4` · rev `185e87f12d34` · version `sha-185e87f` | `sha256:eefab5df8ffb855853b3df328ec5ffc7dede69ef34e36203b45360601e64f6e4` · rev `185e87f12d34` · version `sha-185e87f` |

- A/A is clean: the harness may gate releases

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 233.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.3 ms | 2.18 ms |
| b | 601 | 0 | 0 | 1.25 ms | 2.15 ms |

<details><summary>Informational (2)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.13.2 (184e2e582382, contract 1.13.1) · 2026-09-28T08:49:05.584Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1414, persistence-stub-requests×410, hashed-assets×7000, footer-tutors-version×320, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
