## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:b0342d7fd698fbe253ed95e4cc37fc158224e39161db37cf7ab14dde0cb41630` · rev `a5796e9ca874` · version `sha-a5796e9` | `sha256:b0342d7fd698fbe253ed95e4cc37fc158224e39161db37cf7ab14dde0cb41630` · rev `a5796e9ca874` · version `sha-a5796e9` |
| catalogue image | `sha256:73c7db7693dce97809009b1091774acfd71fe3a6f20213310732bbf54a4aa87d` · rev `a5796e9ca874` · version `sha-a5796e9` | `sha256:73c7db7693dce97809009b1091774acfd71fe3a6f20213310732bbf54a4aa87d` · rev `a5796e9ca874` · version `sha-a5796e9` |
| live image | `sha256:907cb73077a3636d431c20292c351b0a78bd0f190d3caab4fb112f5054e9c2eb` · rev `a5796e9ca874` · version `sha-a5796e9` | `sha256:907cb73077a3636d431c20292c351b0a78bd0f190d3caab4fb112f5054e9c2eb` · rev `a5796e9ca874` · version `sha-a5796e9` |
| time image | `sha256:b1a65d6aa3ac3b4f45f7edfab803064a192ad3ed41b7221af2b6ed447843f61a` · rev `a5796e9ca874` · version `sha-a5796e9` | `sha256:b1a65d6aa3ac3b4f45f7edfab803064a192ad3ed41b7221af2b6ed447843f61a` · rev `a5796e9ca874` · version `sha-a5796e9` |

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
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on b0342d7fd698 (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 73c7db7693dc (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 907cb73077a3 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on b1a65d6aa3ac (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 262.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 262.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 241.6 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 241.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 241.6 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 241.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 247.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 247.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-06T06:32:14Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.37 ms | 2.06 ms |
| b | 600 | 0 | 0 | 1.34 ms | 2.28 ms |

<details><summary>Informational (15)</summary>

- `timing` journey catalogue-loads median 1346ms → 1768ms but not significant (p=0.144, +31%, n=5/5; smallest slowdown 5/5 runs could detect: about 96%)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on b0342d7fd698 (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 73c7db7693dc (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 907cb73077a3 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on b1a65d6aa3ac (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available

</details>

<sub>harness 1.28.4 (0a06fe17a209, contract 1.28.4) · 2026-10-06T09:07:56.414Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×92, request-id×92, etag×92, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1549, persistence-stub-requests×410, media-range-status×42, hashed-assets×8344, footer-tutors-version×344, transport-length×92, transport-connection×92, transport-keepalive×92</sub>
