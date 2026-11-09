## ✅ Release harness — upgrade — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.1.0` | `quay.io/tutors-sdk/tutors-reader:sha-ab462bd` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.1.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-ab462bd` |
| live | `quay.io/tutors-sdk/tutors-live:17.1.0` | `quay.io/tutors-sdk/tutors-live:sha-ab462bd` |
| time | `quay.io/tutors-sdk/tutors-time:17.1.0` | `quay.io/tutors-sdk/tutors-time:sha-ab462bd` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:833fea8bfc84e217ef73ae3870bb61aae9c47963f5e7c24b073527399fd37d70` · rev `ab462bd72c54` · version `sha-ab462bd` |
| catalogue image | `sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:c511018166f9af7ec087124d451bdbb837ef234aaa6099197d6e16ee80a177e1` · rev `ab462bd72c54` · version `sha-ab462bd` |
| live image | `sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:4099944550b8496e1df53b89aa348512c1d385d801b1b033c0ce6682bc0bb38a` · rev `ab462bd72c54` · version `sha-ab462bd` |
| time image | `sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:8612c86fb1547920de81e19be44b3b4bfb96f6c7d0a616db41a86402ecc8929b` · rev `ab462bd72c54` · version `sha-ab462bd` |

- the candidate rolled in under load with no failed request
- 14 difference(s) between a and b outside the rollout, judged by release mode
- NOT COLLECTED: vulns of reader, catalogue, live, time on side a: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- NOT COLLECTED: vulns of reader, catalogue, live, time on side b: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)

### 14 unclaimed differences, 4 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `sbom` package bumped (2 packages: `apt`, `libapt-pkg6.0`) | 8 | reader, catalogue, live, time | — | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `network` GET {{asset}} requested #× on a, #× on b (1 route: `GET /_app/immutable/chunks/{{hash}}.js`) | 2 | reader | 2: `reader:course`, `reader:home` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 38× on b |
| `network` new request on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/24.{{hash}}.css`, `GET /_app/immutable/nodes/24.{{hash}}.js`) | 2 | reader | 1: `reader:home` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` request no longer made on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/23.{{hash}}.css`, `GET /_app/immutable/nodes/23.{{hash}}.js`) | 2 | reader | 1: `reader:home` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |

### Unclaimed differences (14)

| artefact | scope | what changed |
|---|---|---|
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 38× on b |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader:home: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader:home: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:course: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 47× on b |
| `sbom` | `reader/apt` | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `reader/libapt-pkg6.0` | reader: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/apt` | catalogue: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/libapt-pkg6.0` | catalogue: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `live/apt` | live: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `live/libapt-pkg6.0` | live: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `time/apt` | time: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `time/libapt-pkg6.0` | time: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | not evaluated |
| catalogue | 1 finding (1 on production too) | holds | not evaluated |
| live | 1 finding (1 on production too) | holds | not evaluated |
| time | 1 finding (1 on production too) | holds | not evaluated |

### Informing (5; 5 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 117 → 121 immutable requests (JS 98 → 102, CSS 19 → 19), 1.1 MB → 1.1 MB; 6 network and 0 headers difference(s) are this churn | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 108.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 109.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 144 distinct package(s) (cosign attestation (signature verified)) | 144 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| catalogue | manifest | 9 layers, 94.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 95.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| live | manifest | 9 layers, 94.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 95.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| time | manifest | 9 layers, 94.3 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 95.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |

### Upgrade rehearsal (compose)

| upstream | requests | failed | 5xx | p95 |
|---|---|---|---|---|
| a | 301 | 0 | 0 | 3.4 ms |
| b | 599 | 0 | 0 | 3 ms |
| **all** | 900 | 0 | 0 | switched at 18.0 s |

<details><summary>Informational (30)</summary>

- `vulns` NOT COLLECTED: vulns of reader on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of catalogue on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of live on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of time on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` NOT COLLECTED: startup time on side a: switched off with --startup-restarts 0
- `startup` NOT COLLECTED: startup time on side b: switched off with --startup-restarts 0
- `image-hardening` reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `build-provenance` reader: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` catalogue: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` live: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` time: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `vuln-ceiling` reader: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` catalogue: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` live: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` time: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `asset-graph` reader: the asset graph changed: 117 → 121 immutable requests (JS 98 → 102, CSS 19 → 19), 1.1 MB → 1.1 MB; 6 network and 0 headers difference(s) are this churn
- `slo` reader-availability: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `secrets-in-response` secrets-in-response holds on b: no secret-shaped value in the accessibility tree, document headers, response URLs, console or HTML and JSON bodies of 5 page capture(s)
- `upgrade` 900 requests through the rollout, none failed; switched at 18.0s

</details>

<sub>harness 1.61.1 (4e746bcea8ad, contract 1.61.0) · 2026-11-09T12:15:58.229Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×4, request-id×4, etag×4, metrics-process×599, metrics-timing-histograms×32, third-party-requests×62, hashed-assets×238, footer-tutors-version×20, transport-length×4, transport-connection×4, transport-keepalive×4</sub>
