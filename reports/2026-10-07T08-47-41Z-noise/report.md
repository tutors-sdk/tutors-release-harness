## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:86a1b45cf6354a95449ecce956319d33bcfade92c3b4a9802670405b8f41bf32` · rev `a40307aa1953` · version `sha-a40307a` | `sha256:86a1b45cf6354a95449ecce956319d33bcfade92c3b4a9802670405b8f41bf32` · rev `a40307aa1953` · version `sha-a40307a` |
| catalogue image | `sha256:f668b8f60f6e7465ec412b7086ef8c794cd2d6f28c14534938208e3cd65be5c8` · rev `a40307aa1953` · version `sha-a40307a` | `sha256:f668b8f60f6e7465ec412b7086ef8c794cd2d6f28c14534938208e3cd65be5c8` · rev `a40307aa1953` · version `sha-a40307a` |
| live image | `sha256:8863b090b4f9874b189cad60ab9293cabda430a87b0b6280d82a9977e4d56839` · rev `a40307aa1953` · version `sha-a40307a` | `sha256:8863b090b4f9874b189cad60ab9293cabda430a87b0b6280d82a9977e4d56839` · rev `a40307aa1953` · version `sha-a40307a` |
| time image | `sha256:6867925a2504fdafd45bf4ae068b1745e2d00d238ce4929547b2577e6a6ea7d3` · rev `a40307aa1953` · version `sha-a40307a` | `sha256:6867925a2504fdafd45bf4ae068b1745e2d00d238ce4929547b2577e6a6ea7d3` · rev `a40307aa1953` · version `sha-a40307a` |

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
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 86a1b45cf635 (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on f668b8f60f6e (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 8863b090b4f9 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on 6867925a2504 (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 258.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 237.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 238.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 243.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) | 88 advisories, db built 2026-10-07T06:31:48Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.39 ms | 2.04 ms |
| b | 600 | 0 | 0 | 1.35 ms | 2.12 ms |

<details><summary>Informational (14)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 86a1b45cf635 (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on f668b8f60f6e (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 8863b090b4f9 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on 6867925a2504 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 88 advisories scanned, 18 critical or high, none with a fix available

</details>

<sub>harness 1.28.4 (d37855be1384, contract 1.28.4) · 2026-10-07T08:47:41.661Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×92, request-id×92, etag×92, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1549, persistence-stub-requests×410, media-range-status×44, chromium-compute-pressure-policy×1, hashed-assets×8344, footer-tutors-version×344, transport-length×92, transport-connection×92, transport-keepalive×92</sub>
