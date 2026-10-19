## ✅ Release harness — upgrade — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-2bff81a` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-2bff81a` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-2bff81a` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-2bff81a` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:73b1ebbdfe9bce2ab10e7a98152233b228b9fc77cdbb734fc1bce265f4fa4d6e` · rev `2bff81a77942` · version `sha-2bff81a` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:b2ab9fd4335643301310e95f2cf72b5b92bd7a7dd5fd18294829d29195c78cdf` · rev `2bff81a77942` · version `sha-2bff81a` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:186f1ca2bdb02c72334940831a2f1addcc88bcfa7fc7e53a5f635e49e41e135f` · rev `2bff81a77942` · version `sha-2bff81a` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:5925f643dc9a39f96eb5e9625fc1669662a23f91655b55d68bbad8cb061a3f76` · rev `2bff81a77942` · version `sha-2bff81a` |

- the candidate rolled in under load with no failed request
- 16 difference(s) between a and b outside the rollout, judged by release mode
- NOT COLLECTED: vulns of reader, catalogue, live, time on side a: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- NOT COLLECTED: vulns of reader, catalogue, live, time on side b: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)

### 16 unclaimed differences, 3 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 6 | catalogue, live, time | — | catalogue: new series on b: http_request_duration_seconds_count |
| `dom` semantic DOM differs (+# −# lines at line #) | 5 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `focus` keyboard order changed (# stops on a, # on b) | 5 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: keyboard order changed (12 stops on a, 12 on b) |

Moved together on the same pages, so likely one change each:

- `dom`, `focus` on 5 pages (10 differences): `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic`

### Unclaimed differences (16)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:home` | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 8) |
| `metrics` | `catalogue/http_request_duration_seconds_count` | catalogue: new series on b: http_request_duration_seconds_count |
| `metrics` | `catalogue/http_requests_total` | catalogue: new series on b: http_requests_total |
| `metrics` | `live/http_request_duration_seconds_count` | live: new series on b: http_request_duration_seconds_count |
| `metrics` | `live/http_requests_total` | live: new series on b: http_requests_total |
| `metrics` | `time/http_request_duration_seconds_count` | time: new series on b: http_request_duration_seconds_count |
| `metrics` | `time/http_requests_total` | time: new series on b: http_requests_total |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:course` | reader:course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:topic` | reader:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step` | reader:lab-step: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step-2` | reader:lab-step-2: keyboard order changed (12 stops on a, 12 on b) |

<details><summary>Detail of 10 difference(s)</summary>

`dom` `reader:home`

```
     - link "My courses":
       - /url: /
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:course`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:topic`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:lab-step`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:lab-step-2`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`focus` `reader:home`

```
 a "My courses"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:course`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:topic`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:lab-step`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:lab-step-2`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | holds | holds | not evaluated |
| catalogue | holds | holds | not evaluated |
| live | holds | holds | not evaluated |
| time | holds | holds | not evaluated |

### Informing (1; 1 unclaimed): reported, never gates

18 of 27 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `asset-graph` | `reader` | reader: the asset graph changed: 111 → 111 immutable requests (JS 92 → 92, CSS 19 → 19), 1.1 MB → 1.1 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 309.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
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
| a | 300 | 0 | 0 | 3 ms |
| b | 601 | 0 | 0 | 2.7 ms |
| **all** | 901 | 0 | 0 | switched at 19.6 s |

<details><summary>Informational (30)</summary>

- `console` reader:home: console message gone on b
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
- `asset-graph` reader: the asset graph changed: 111 → 111 immutable requests (JS 92 → 92, CSS 19 → 19), 1.1 MB → 1.1 MB; 0 network and 0 headers difference(s) are this churn
- `slo` reader-availability: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `upgrade` 901 requests through the rollout, none failed; switched at 19.6s

</details>

<sub>harness 1.48.7 (f3bb893e37de, contract 1.48.7) · 2026-10-19T10:23:42.732Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×4, request-id×4, etag×4, metrics-process×599, metrics-timing-histograms×18, third-party-requests×61, hashed-assets×222, footer-tutors-version×20, transport-length×4, transport-connection×4, transport-keepalive×4</sub>
