## ✅ Release harness — upgrade — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-d3d7227` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-d3d7227` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-d3d7227` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-d3d7227` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:bc7ca09526ac59b2f936dd27a68ad7a9527cb8dc3be17ca41f8ec8c79c4c7abd` · rev `d3d72277634a` · version `sha-d3d7227` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:fbae335184067b5763c61c60b419c8a7293903f7a8eff6f85c0acf93b279bcf5` · rev `d3d72277634a` · version `sha-d3d7227` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:95666ae77a2816d74629566810ebcbeae8a3d7647140e449083fd8fac78a52bb` · rev `d3d72277634a` · version `sha-d3d7227` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:accb1ea9807d95df261cbd5244ecfd98a419903011d00d84f49eaccccd026236` · rev `d3d72277634a` · version `sha-d3d7227` |

- the candidate rolled in under load with no failed request
- NOT COLLECTED: vulns of reader, catalogue, live, time on side a: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- NOT COLLECTED: vulns of reader, catalogue, live, time on side b: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |

### Informing (9; 9 unclaimed): reported, never gates

19 of 27 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on bc7ca09526ac (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on fbae33518406 (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 95666ae77a28 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on accb1ea9807d (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 111 → 111 immutable requests (JS 92 → 92, CSS 19 → 19), 1.1 MB → 1.1 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 308.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |

### Upgrade rehearsal (compose)

| upstream | requests | failed | 5xx | p95 |
|---|---|---|---|---|
| a | 300 | 0 | 0 | 4.3 ms |
| b | 600 | 0 | 0 | 3.5 ms |
| **all** | 900 | 0 | 0 | switched at 17.4 s |

<details><summary>Informational (29)</summary>

- `vulns` NOT COLLECTED: vulns of reader on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of catalogue on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of live on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of time on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` NOT COLLECTED: startup time on side a: switched off with --startup-restarts 0
- `startup` NOT COLLECTED: startup time on side b: switched off with --startup-restarts 0
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on bc7ca09526ac (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on fbae33518406 (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 95666ae77a28 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on accb1ea9807d (production too)
- `vuln-ceiling` reader: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` catalogue: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` live: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` time: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `asset-graph` reader: the asset graph changed: 111 → 111 immutable requests (JS 92 → 92, CSS 19 → 19), 1.1 MB → 1.1 MB; 0 network and 0 headers difference(s) are this churn
- `slo` reader-availability: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for catalogue
- `slo` catalogue-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for catalogue
- `slo` live-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for live
- `slo` live-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for live
- `slo` time-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for time
- `slo` time-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for time
- `upgrade` 900 requests through the rollout, none failed; switched at 17.4s

</details>

<sub>harness 1.37.3 (2fc966f3a1d9, contract 1.37.0) · 2026-10-15T17:55:33.724Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×4, request-id×4, etag×4, metrics-process×602, metrics-timing-histograms×4, third-party-requests×62, hashed-assets×222, footer-tutors-version×28, transport-length×4, transport-connection×4, transport-keepalive×4</sub>
