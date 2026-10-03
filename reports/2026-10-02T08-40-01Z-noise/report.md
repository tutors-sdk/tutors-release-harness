## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:e7efea4cede2f3345e6d35a01f68524baecb86f863a625215928e92c4ef5ea1e` · rev `b35eddd742f1` · version `sha-b35eddd` | `sha256:e7efea4cede2f3345e6d35a01f68524baecb86f863a625215928e92c4ef5ea1e` · rev `b35eddd742f1` · version `sha-b35eddd` |
| catalogue image | `sha256:9c938e1158af66a510117e53b6ff4210f510a96654b7ae31718f17980374b1c1` · rev `b35eddd742f1` · version `sha-b35eddd` | `sha256:9c938e1158af66a510117e53b6ff4210f510a96654b7ae31718f17980374b1c1` · rev `b35eddd742f1` · version `sha-b35eddd` |
| live image | `sha256:ac205da45bcd86febbb33f134a13a757770c21445bada92b0348c7593c4f8c76` · rev `b35eddd742f1` · version `sha-b35eddd` | `sha256:ac205da45bcd86febbb33f134a13a757770c21445bada92b0348c7593c4f8c76` · rev `b35eddd742f1` · version `sha-b35eddd` |
| time image | `sha256:d93376cc52c4cabd87091c09109afb63c0dc9b06594b91795f253a5f3756bb6d` · rev `b35eddd742f1` · version `sha-b35eddd` | `sha256:d93376cc52c4cabd87091c09109afb63c0dc9b06594b91795f253a5f3756bb6d` · rev `b35eddd742f1` · version `sha-b35eddd` |

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
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on e7efea4cede2 (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 9c938e1158af (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on ac205da45bcd (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on d93376cc52c4 (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 254.4 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.4 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 10 layers, 239.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) | 100 advisories, db built 2026-10-02T06:31:53Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.45 ms | 2.84 ms |
| b | 600 | 0 | 0 | 1.46 ms | 2.4 ms |

<details><summary>Informational (14)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on e7efea4cede2 (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 9c938e1158af (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on ac205da45bcd (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on d93376cc52c4 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 100 advisories scanned, 28 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 100 advisories scanned, 28 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 100 advisories scanned, 28 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 100 advisories scanned, 28 critical or high, none with a fix available

</details>

<sub>harness 1.28.0 (a33c731e16fb, contract 1.28.0) · 2026-10-02T08:40:01.695Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×92, request-id×92, etag×92, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1552, persistence-stub-requests×410, hashed-assets×8344, footer-tutors-version×344, transport-length×92, transport-connection×92, transport-keepalive×92</sub>
