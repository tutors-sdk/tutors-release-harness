## ❌ Release harness — release — FAIL

> ⚠️ **Side a did not run signature-verified registry images (built-from-ref v16.2.1@c2915322a0dc). This run is not evidence about the images that ship.**

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.1` | `quay.io/tutors-sdk/tutors-reader:16.2.2` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.1` | `quay.io/tutors-sdk/tutors-catalogue:16.2.2` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.1` | `quay.io/tutors-sdk/tutors-live:16.2.2` |
| time | `quay.io/tutors-sdk/tutors-time:16.2.1` | `quay.io/tutors-sdk/tutors-time:16.2.2` |
| **provenance** | **built-from-ref v16.2.1@c2915322a0dc** | **pulled+verified** |
| reader image | no registry digest · rev `c2915322a0dc` · version `16.2.1` | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` |
| catalogue image | no registry digest · rev `c2915322a0dc` · version `16.2.1` | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` |
| live image | no registry digest · rev `c2915322a0dc` · version `16.2.1` | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` |
| time image | no registry digest · rev `c2915322a0dc` · version `16.2.1` | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` |

- 38 unclaimed diff(s)
- side a was built here from monorepo ref v16.2.1, not pulled from the registry: it is not the image that ships
- NOT COLLECTED: sbom of reader on side a: quay.io/tutors-sdk/tutors-reader:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- NOT COLLECTED: vulns of reader on side a: nothing to scan: quay.io/tutors-sdk/tutors-reader:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- NOT COLLECTED: sbom of catalogue on side a: quay.io/tutors-sdk/tutors-catalogue:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- NOT COLLECTED: vulns of catalogue on side a: nothing to scan: quay.io/tutors-sdk/tutors-catalogue:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- NOT COLLECTED: sbom of live on side a: quay.io/tutors-sdk/tutors-live:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- NOT COLLECTED: vulns of live on side a: nothing to scan: quay.io/tutors-sdk/tutors-live:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- NOT COLLECTED: sbom of time on side a: quay.io/tutors-sdk/tutors-time:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- NOT COLLECTED: vulns of time on side a: nothing to scan: quay.io/tutors-sdk/tutors-time:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself
- A/A consulted: clean at 2026-09-26T07:57:09.931Z

### Unclaimed differences (38)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+5 −3 lines at line 41) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+5 −3 lines at line 43) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 91) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 97) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 103) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 126) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 136) |
| `screenshot` | `reader:topic` | reader:topic: 0.60% of pixels differ (threshold 0.10%) |
| `screenshot` | `reader-auth:topic` | reader-auth:topic: 0.60% of pixels differ (threshold 0.10%) |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:course` | reader:course: keyboard order changed (11 stops on a, 11 on b) |
| `focus` | `reader:topic` | reader:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:search` | reader:search: keyboard order changed (6 stops on a, 6 on b) |
| `focus` | `reader:search-results` | reader:search-results: keyboard order changed (6 stops on a, 6 on b) |
| `focus` | `catalogue:home` | catalogue:home: keyboard order changed (6 stops on a, 6 on b) |
| `focus` | `live:home` | live:home: keyboard order changed (5 stops on a, 5 on b) |
| `focus` | `reader-auth:course` | reader-auth:course: keyboard order changed (11 stops on a, 11 on b) |
| `focus` | `reader-auth:topic` | reader-auth:topic: keyboard order changed (12 stops on a, 12 on b) |
| `image-manifest` | `reader/label/org.opencontainers.image.description` | reader: label org.opencontainers.image.description added () |
| `image-manifest` | `reader/label/org.opencontainers.image.url` | reader: label org.opencontainers.image.url added (https://github.com/tutors-sdk/tutors-mono-repo) |
| `sbom` | `reader/not-collected` | NOT COLLECTED: sbom of reader on side a: quay.io/tutors-sdk/tutors-reader:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |
| `vulns` | `reader/not-collected` | NOT COLLECTED: vulns of reader on side a: nothing to scan: quay.io/tutors-sdk/tutors-reader:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |
| `image-manifest` | `catalogue/label/org.opencontainers.image.description` | catalogue: label org.opencontainers.image.description added () |
| `image-manifest` | `catalogue/label/org.opencontainers.image.url` | catalogue: label org.opencontainers.image.url added (https://github.com/tutors-sdk/tutors-mono-repo) |
| `sbom` | `catalogue/not-collected` | NOT COLLECTED: sbom of catalogue on side a: quay.io/tutors-sdk/tutors-catalogue:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |
| `vulns` | `catalogue/not-collected` | NOT COLLECTED: vulns of catalogue on side a: nothing to scan: quay.io/tutors-sdk/tutors-catalogue:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |
| `image-manifest` | `live/label/org.opencontainers.image.description` | live: label org.opencontainers.image.description added () |
| `image-manifest` | `live/label/org.opencontainers.image.url` | live: label org.opencontainers.image.url added (https://github.com/tutors-sdk/tutors-mono-repo) |
| `sbom` | `live/not-collected` | NOT COLLECTED: sbom of live on side a: quay.io/tutors-sdk/tutors-live:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |
| `vulns` | `live/not-collected` | NOT COLLECTED: vulns of live on side a: nothing to scan: quay.io/tutors-sdk/tutors-live:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |
| `image-manifest` | `time/label/org.opencontainers.image.description` | time: label org.opencontainers.image.description added () |
| `image-manifest` | `time/label/org.opencontainers.image.url` | time: label org.opencontainers.image.url added (https://github.com/tutors-sdk/tutors-mono-repo) |
| `sbom` | `time/not-collected` | NOT COLLECTED: sbom of time on side a: quay.io/tutors-sdk/tutors-time:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |
| `vulns` | `time/not-collected` | NOT COLLECTED: vulns of time on side a: nothing to scan: quay.io/tutors-sdk/tutors-time:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself (required by HARNESS_REQUIRE_ARTEFACTS) |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 251.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | **NOT COLLECTED: quay.io/tutors-sdk/tutors-reader:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 291 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | **NOT COLLECTED: nothing to scan: quay.io/tutors-sdk/tutors-reader:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 9 layers, 230.4 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | **NOT COLLECTED: quay.io/tutors-sdk/tutors-catalogue:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 277 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | **NOT COLLECTED: nothing to scan: quay.io/tutors-sdk/tutors-catalogue:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 9 layers, 230.4 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | **NOT COLLECTED: quay.io/tutors-sdk/tutors-live:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 277 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | **NOT COLLECTED: nothing to scan: quay.io/tutors-sdk/tutors-live:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 9 layers, 231.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | **NOT COLLECTED: quay.io/tutors-sdk/tutors-time:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 287 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | **NOT COLLECTED: nothing to scan: quay.io/tutors-sdk/tutors-time:16.2.1 is built-from-ref, not a pulled image: there is no cosign attestation to read. Set HARNESS_SBOM_SOURCE=generate to generate an SBOM from the image itself** | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.33 ms | 2.3 ms |
| b | 600 | 0 | 0 | 1.28 ms | 2.04 ms |

<details><summary>Informational (9)</summary>

- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:topic: console message gone on b
- `console` reader-auth:topic: console message gone on b
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.4.1 (6648ea6660f2, contract 1.4.0) · 2026-09-26T12:38:31.986Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×825, persistence-stub-requests×211, realtime-rest-fallback-warning×80, hashed-assets×5320, footer-tutors-version×220, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
