## ⚠️ Release harness — noise — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:224bc2d5d94602eaf4120ef5c76bf0945dfcca79f34922d092ec20b30fa4805f` · rev `591c54e16694` · version `sha-591c54e` | `sha256:224bc2d5d94602eaf4120ef5c76bf0945dfcca79f34922d092ec20b30fa4805f` · rev `591c54e16694` · version `sha-591c54e` |
| catalogue image | `sha256:d312ec017e0b21c9ce6ee6a05641a4a325ce1f1e0bef877ea806f878ce8a21ed` · rev `591c54e16694` · version `sha-591c54e` | `sha256:d312ec017e0b21c9ce6ee6a05641a4a325ce1f1e0bef877ea806f878ce8a21ed` · rev `591c54e16694` · version `sha-591c54e` |
| live image | `sha256:28af11ec1e565231cb64f9ca9a1eed4a519859b54b04931e9641e2f955904f90` · rev `591c54e16694` · version `sha-591c54e` | `sha256:28af11ec1e565231cb64f9ca9a1eed4a519859b54b04931e9641e2f955904f90` · rev `591c54e16694` · version `sha-591c54e` |
| time image | `sha256:657868c992d176424774c00cc3ab1d9639dfb9c02ea59dbcf2a4c4aadd233e6d` · rev `591c54e16694` · version `sha-591c54e` | `sha256:657868c992d176424774c00cc3ab1d9639dfb9c02ea59dbcf2a4c4aadd233e6d` · rev `591c54e16694` · version `sha-591c54e` |

- A/A is clean but DEGRADED, so it does not count: journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (8; 8 unclaimed): reported, never gates

19 of 26 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 224bc2d5d946 (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on d312ec017e0b (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 28af11ec1e56 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on 657868c992d1 (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 254.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 92 distinct package(s) (cosign attestation (signature verified)) | 92 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-12T06:45:22Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.12 ms | 1.87 ms |
| b | 600 | 0 | 0 | 1.13 ms | 2.07 ms |

<details><summary>Informational (25)</summary>

- `dom` journey "reference-course-reads" failed on both sides
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 224bc2d5d946 (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on d312ec017e0b (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 28af11ec1e56 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on 657868c992d1 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 23 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 23 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 23 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 23 critical or high, none with a fix available
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

<sub>harness 1.35.0 (195e0d10cccd, contract 1.35.0) · 2026-10-12T09:22:42.894Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×82, request-id×82, etag×82, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1166, persistence-stub-requests×419, realtime-rest-fallback-warning×10, hashed-assets×7116, footer-tutors-version×324, transport-length×82, transport-connection×82, transport-keepalive×82</sub>
