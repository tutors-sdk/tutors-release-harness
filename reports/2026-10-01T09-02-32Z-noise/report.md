## ⚠️ Release harness — noise — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:45933525efec1a4dbf9d1a95a956cfa8fbf85a3752a19f9f9cd25143b181bd5a` · rev `c0a0965900cd` · version `sha-c0a0965` | `sha256:45933525efec1a4dbf9d1a95a956cfa8fbf85a3752a19f9f9cd25143b181bd5a` · rev `c0a0965900cd` · version `sha-c0a0965` |
| catalogue image | `sha256:8a10486ad56e59e04c40f4d200f8837fd1157461e18573d014d81d8c21460cb4` · rev `c0a0965900cd` · version `sha-c0a0965` | `sha256:8a10486ad56e59e04c40f4d200f8837fd1157461e18573d014d81d8c21460cb4` · rev `c0a0965900cd` · version `sha-c0a0965` |
| live image | `sha256:82c95354e55229726f7c2f2f5676d3fe74d842a79b4a52d071921c1a4548346b` · rev `c0a0965900cd` · version `sha-c0a0965` | `sha256:82c95354e55229726f7c2f2f5676d3fe74d842a79b4a52d071921c1a4548346b` · rev `c0a0965900cd` · version `sha-c0a0965` |
| time image | `sha256:e0715dade5f5ec3c17f4bb1a7e4ad5975be249bf3704528f0fe3fb70173eadd3` · rev `c0a0965900cd` · version `sha-c0a0965` | `sha256:e0715dade5f5ec3c17f4bb1a7e4ad5975be249bf3704528f0fe3fb70173eadd3` · rev `c0a0965900cd` · version `sha-c0a0965` |

- A/A produced 1 diff(s): the normaliser needs a mask for each, or the stack is not deterministic; the harness is advisory until this is 0

### 1 unclaimed difference, 1 cause

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `network` GET {{course}}/topic-#-reference/note-#/img/video.mov status changed: # → # | 1 | reader | 1: `reference:note` | reference:note: GET {{course}}/topic-07-reference/note-1/img/video.mov status changed: 200 → 206 |

### Unclaimed differences (1)

| artefact | scope | what changed |
|---|---|---|
| `network` | `GET {{course}}/topic-07-reference/note-1/img/video.mov` | reference:note: GET {{course}}/topic-07-reference/note-1/img/video.mov status changed: 200 → 206 |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (8; 8 unclaimed): reported, never gates

19 of 22 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 45933525efec (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 8a10486ad56e (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 82c95354e552 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on e0715dade5f5 (production too) | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 104 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) | 97 advisories, db built 2026-09-30T06:32:47Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.23 ms | 2.12 ms |
| b | 601 | 0 | 0 | 1.32 ms | 2.06 ms |

<details><summary>Informational (14)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 45933525efec (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 8a10486ad56e (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 82c95354e552 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on e0715dade5f5 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 97 advisories scanned, 26 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 97 advisories scanned, 26 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 97 advisories scanned, 26 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 97 advisories scanned, 26 critical or high, none with a fix available

</details>

<sub>harness 1.23.0 (c68ae097b9d5, contract 1.23.0) · 2026-10-01T09:02:32.421Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1412, persistence-stub-requests×410, hashed-assets×7110, footer-tutors-version×320, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
