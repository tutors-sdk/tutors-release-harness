## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:edf78868bcff2df308ba1601d2d35f0119b0211928d41d421195a5931b1673f8` · rev `7c5f24826944` · version `sha-7c5f248` | `sha256:edf78868bcff2df308ba1601d2d35f0119b0211928d41d421195a5931b1673f8` · rev `7c5f24826944` · version `sha-7c5f248` |
| catalogue image | `sha256:334c2d6d0be2952095ee8dc89090ba34e869650b9adf15b2c1b410ee288d6752` · rev `7c5f24826944` · version `sha-7c5f248` | `sha256:334c2d6d0be2952095ee8dc89090ba34e869650b9adf15b2c1b410ee288d6752` · rev `7c5f24826944` · version `sha-7c5f248` |
| live image | `sha256:cb931c5d95231c0b0c1ff7db3377b028280fb0980be093717da05dbba72e1e34` · rev `7c5f24826944` · version `sha-7c5f248` | `sha256:cb931c5d95231c0b0c1ff7db3377b028280fb0980be093717da05dbba72e1e34` · rev `7c5f24826944` · version `sha-7c5f248` |
| time image | `sha256:d3d9f65ddccc22e7ee35f6d7add19a6468393065da3c38a4d933c253fb9d9afd` · rev `7c5f24826944` · version `sha-7c5f248` | `sha256:d3d9f65ddccc22e7ee35f6d7add19a6468393065da3c38a4d933c253fb9d9afd` · rev `7c5f24826944` · version `sha-7c5f248` |

- A/A is clean: the harness may gate releases

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (8; 8 unclaimed): reported, never gates

19 of 25 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on edf78868bcff (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 334c2d6d0be2 (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on cb931c5d9523 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on d3d9f65ddccc (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-08T06:33:47Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.33 ms | 2.25 ms |
| b | 601 | 0 | 0 | 1.25 ms | 2.17 ms |

<details><summary>Informational (14)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on edf78868bcff (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 334c2d6d0be2 (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on cb931c5d9523 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on d3d9f65ddccc (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available

</details>

<sub>harness 1.29.0 (309b6a538815, contract 1.29.0) · 2026-10-08T09:07:10.204Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×92, request-id×92, etag×92, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1553, persistence-stub-requests×410, media-range-status×46, hashed-assets×8344, footer-tutors-version×344, transport-length×92, transport-connection×92, transport-keepalive×92</sub>
