## ⚠️ Release harness — noise — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:29e46ef42cb7cc681f5abe51afc820bbcb092488b368719d890674773e184b68` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` | `sha256:29e46ef42cb7cc681f5abe51afc820bbcb092488b368719d890674773e184b68` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` |
| catalogue image | `sha256:3dea3b6230695a6fa96e2b17c72c4191e11a3dbadf05eb5c2a4990d054169bfc` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` | `sha256:3dea3b6230695a6fa96e2b17c72c4191e11a3dbadf05eb5c2a4990d054169bfc` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` |
| live image | `sha256:a82cc2f7ed1b40f6fac489ed9a214f605d29e9d8b2cb5e3332918f444c61cb3a` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` | `sha256:a82cc2f7ed1b40f6fac489ed9a214f605d29e9d8b2cb5e3332918f444c61cb3a` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` |
| time image | `sha256:aaed550bbfb6fc74505ddd2b9e6488b13a200428b0cdb85e5f4194a856377429` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` | `sha256:aaed550bbfb6fc74505ddd2b9e6488b13a200428b0cdb85e5f4194a856377429` · rev `ff4fe9c5bba5` · version `sha-ff4fe9c` |

- A/A is clean but DEGRADED, so it does not count: journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages

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
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 29e46ef42cb7 (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 3dea3b623069 (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on a82cc2f7ed1b (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on aaed550bbfb6 (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-09T06:32:32Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.35 ms | 2.11 ms |
| b | 601 | 0 | 0 | 1.4 ms | 2.58 ms |

<details><summary>Informational (15)</summary>

- `dom` journey "reference-course-reads" failed on both sides
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 29e46ef42cb7 (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 3dea3b623069 (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on a82cc2f7ed1b (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on aaed550bbfb6 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available

</details>

<sub>harness 1.33.0 (695e2f813f7f, contract 1.33.0) · 2026-10-09T09:12:52.291Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×82, request-id×82, etag×82, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1180, persistence-stub-requests×450, hashed-assets×7116, footer-tutors-version×324, transport-length×82, transport-connection×82, transport-keepalive×82</sub>
