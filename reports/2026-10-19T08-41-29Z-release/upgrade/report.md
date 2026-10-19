## ✅ Release harness — upgrade — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-8534430` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-8534430` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-8534430` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-8534430` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:89ca1729eb2fdb53522bbe8903109c4b00c8d563bfba20149226fd6812c85a29` · rev `8534430cb068` · version `sha-8534430` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:4eac027a536ceb22e8265d3a7459711189cea1c8d899be64f15c7cf938590f44` · rev `8534430cb068` · version `sha-8534430` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:f922989906f59960be3b293604848dbd43ed551596ed090908e2acf448474b20` · rev `8534430cb068` · version `sha-8534430` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:60b3524d78783f90cba5e3d32b32b74d26e2a4c14373e6426a6018a14d1ae4eb` · rev `8534430cb068` · version `sha-8534430` |

- the candidate rolled in under load with no failed request
- 7 difference(s) between a and b outside the rollout, judged by release mode
- NOT COLLECTED: vulns of reader, catalogue, live, time on side a: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- NOT COLLECTED: vulns of reader, catalogue, live, time on side b: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)

### 7 unclaimed differences, 2 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 6 | catalogue, live, time | — | catalogue: new series on b: http_request_duration_seconds_count |
| `logs` info-level lines (1 field: `info`) | 1 | reader | — | reader: info-level lines: 3 on a, 6 on b |

### Unclaimed differences (7)

| artefact | scope | what changed |
|---|---|---|
| `metrics` | `catalogue/http_request_duration_seconds_count` | catalogue: new series on b: http_request_duration_seconds_count |
| `metrics` | `catalogue/http_requests_total` | catalogue: new series on b: http_requests_total |
| `metrics` | `live/http_request_duration_seconds_count` | live: new series on b: http_request_duration_seconds_count |
| `metrics` | `live/http_requests_total` | live: new series on b: http_requests_total |
| `metrics` | `time/http_request_duration_seconds_count` | time: new series on b: http_request_duration_seconds_count |
| `metrics` | `time/http_requests_total` | time: new series on b: http_requests_total |
| `logs` | `reader/info` | reader: info-level lines: 3 on a, 6 on b |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | holds | holds | not evaluated |
| catalogue | holds | holds | not evaluated |
| live | holds | holds | not evaluated |
| time | holds | holds | not evaluated |

### Informing (0): reported, never gates

18 of 27 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

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
| b | 601 | 0 | 0 | 3.9 ms |
| **all** | 901 | 0 | 0 | switched at 17.2 s |

<details><summary>Informational (29)</summary>

- `dom` journey "anonymous-student-reads-course" failed on a but completed on b (fixed)
- `vulns` NOT COLLECTED: vulns of reader on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of catalogue on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of live on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of time on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` NOT COLLECTED: startup time on side a: switched off with --startup-restarts 0
- `startup` NOT COLLECTED: startup time on side b: switched off with --startup-restarts 0
- `image-hardening` reader: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `image-hardening` catalogue: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `image-hardening` live: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `image-hardening` time: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `build-provenance` reader: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` catalogue: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` live: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` time: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `vuln-ceiling` reader: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` catalogue: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` live: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` time: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `slo` reader-availability: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `upgrade` 901 requests through the rollout, none failed; switched at 17.2s

</details>

<sub>harness 1.48.5 (1eb3f30f102b, contract 1.48.5) · 2026-10-19T08:15:15.609Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×2, request-id×2, etag×2, metrics-process×599, metrics-timing-histograms×18, third-party-requests×31, hashed-assets×111, footer-tutors-version×10, transport-length×2, transport-connection×2, transport-keepalive×2</sub>
