## ⚠️ Release harness — noise — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:11bd6b2f4eed3f680b69bf598eaf48992247cf99cc2693910c028c8259346a0f` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` | `sha256:11bd6b2f4eed3f680b69bf598eaf48992247cf99cc2693910c028c8259346a0f` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` |
| catalogue image | `sha256:62f3233d073c3de4506a015684994b8764977bfeb7b0e1bce93ba9c2ea34f09f` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` | `sha256:62f3233d073c3de4506a015684994b8764977bfeb7b0e1bce93ba9c2ea34f09f` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` |
| live image | `sha256:2a87139106f611bb03d54ba36443b632a92bd1dac3aa372c866cf7a9bb84d2e9` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` | `sha256:2a87139106f611bb03d54ba36443b632a92bd1dac3aa372c866cf7a9bb84d2e9` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` |
| time image | `sha256:a5f5b6eda7d057ce60c5c1a4a171b8b3bf57e862fdac81b5a7ff99320e53ba36` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` | `sha256:a5f5b6eda7d057ce60c5c1a4a171b8b3bf57e862fdac81b5a7ff99320e53ba36` · rev `a5d00c5dbd7a` · version `sha-a5d00c5` |

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
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 11bd6b2f4eed (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 62f3233d073c (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 2a87139106f6 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on a5f5b6eda7d0 (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-10T06:30:01Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.04 ms | 1.57 ms |
| b | 600 | 0 | 0 | 1.01 ms | 1.55 ms |

<details><summary>Informational (15)</summary>

- `dom` journey "reference-course-reads" failed on both sides
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 11bd6b2f4eed (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 62f3233d073c (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 2a87139106f6 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on a5f5b6eda7d0 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 22 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 22 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 22 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 22 critical or high, none with a fix available

</details>

<sub>harness 1.33.0 (695e2f813f7f, contract 1.33.0) · 2026-10-10T08:41:44.073Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×82, request-id×82, etag×82, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1186, persistence-stub-requests×460, realtime-rest-fallback-warning×10, hashed-assets×7116, footer-tutors-version×324, transport-length×82, transport-connection×82, transport-keepalive×82</sub>
