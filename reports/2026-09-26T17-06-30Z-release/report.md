## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.1` | `quay.io/tutors-sdk/tutors-reader:16.2.2` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.1` | `quay.io/tutors-sdk/tutors-catalogue:16.2.2` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.1` | `quay.io/tutors-sdk/tutors-live:16.2.2` |
| time | `quay.io/tutors-sdk/tutors-time:16.2.1` | `quay.io/tutors-sdk/tutors-time:16.2.2` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:a1d772187c5a85d54975fd69830a97be0304864cfd2d9b576971f219f1534745` · rev `c2915322a0dc` · version `16.2.1` | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` |
| catalogue image | `sha256:4bd2e9bdae61cbde7ad8ff670488090c52882ff612bd5b775c64ebedcbfc7fad` · rev `c2915322a0dc` · version `16.2.1` | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` |
| live image | `sha256:0f1b790f5116b47829216ac6ccdf6da5a5ae374e5f52a61fa0c86631483cff8b` · rev `c2915322a0dc` · version `16.2.1` | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` |
| time image | `sha256:87a87ac1c59b1e39e902934f67f65180858b74933fae0d248a133eab1535eb79` · rev `c2915322a0dc` · version `16.2.1` | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` |

- 71 unclaimed diff(s)
- A/A consulted: clean at 2026-09-26T07:57:09.931Z

### Unclaimed differences (71)

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
| `network` | `GET {{course}}/topic-07-reference/web-1/link.png` | reference:topic: request no longer made on b: GET {{course}}/topic-07-reference/web-1/link.png |
| `network` | `GET {{course}}/topic-07-reference/web-1/link.png` | reference:lab: new request on b: GET {{course}}/topic-07-reference/web-1/link.png |
| `network` | `GET {{course}}/topic-07-reference/note-1/note.png` | reference:note: GET {{course}}/topic-07-reference/note-1/note.png status changed: 304 → 200 |
| `network` | `GET {{course}}/topic-07-reference/note-1/note.png` | reference:note: GET {{course}}/topic-07-reference/note-1/note.png content-type changed: ∅ → image/png |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `reader-auth:course` | reader-auth:course: new console message on b |
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
| `sbom` | `reader/corepack` | reader: package bumped: corepack 0.36.0 → 0.34.6 |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.3 → 22.23.2 |
| `sbom` | `reader/npm` | reader: package bumped: npm 10.9.9 → 10.9.8 |
| `sbom` | `reader/tar` | reader: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.22 → 1.34+dfsg-1.2+deb12u1, 7.5.11 |
| `sbom` | `reader/tutors-reader` | reader: package bumped: tutors-reader 16.2.1 → 16.2.2 |
| `vulns` | `reader/GHSA-23hp-3jrh-7fpw` | reader: new vulnerability on b: GHSA-23hp-3jrh-7fpw (Critical) in tar@7.5.11; fixed in 7.5.19 |
| `vulns` | `reader/GHSA-8x88-c5mf-7j5w` | reader: new vulnerability on b: GHSA-8x88-c5mf-7j5w (High) in tar@7.5.11; fixed in 7.5.18 |
| `vulns` | `reader/GHSA-gvwx-54wh-qm9j` | reader: new vulnerability on b: GHSA-gvwx-54wh-qm9j (Medium) in tar@7.5.11; fixed in 7.5.17 |
| `vulns` | `reader/GHSA-r292-9mhp-454m` | reader: new vulnerability on b: GHSA-r292-9mhp-454m (High) in tar@7.5.11; fixed in 7.5.21 |
| `vulns` | `reader/GHSA-vmf3-w455-68vh` | reader: new vulnerability on b: GHSA-vmf3-w455-68vh (Medium) in tar@7.5.11; fixed in 7.5.16 |
| `vulns` | `reader/GHSA-w8wr-v893-vjvp` | reader: new vulnerability on b: GHSA-w8wr-v893-vjvp (Medium) in tar@7.5.11; fixed in 7.5.18 |
| `sbom` | `catalogue/corepack` | catalogue: package bumped: corepack 0.36.0 → 0.34.6 |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.3 → 22.23.2 |
| `sbom` | `catalogue/npm` | catalogue: package bumped: npm 10.9.9 → 10.9.8 |
| `sbom` | `catalogue/tar` | catalogue: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.22 → 1.34+dfsg-1.2+deb12u1, 7.5.11 |
| `sbom` | `catalogue/tutors-catalogue` | catalogue: package bumped: tutors-catalogue 16.2.1 → 16.2.2 |
| `vulns` | `catalogue/GHSA-23hp-3jrh-7fpw` | catalogue: new vulnerability on b: GHSA-23hp-3jrh-7fpw (Critical) in tar@7.5.11; fixed in 7.5.19 |
| `vulns` | `catalogue/GHSA-8x88-c5mf-7j5w` | catalogue: new vulnerability on b: GHSA-8x88-c5mf-7j5w (High) in tar@7.5.11; fixed in 7.5.18 |
| `vulns` | `catalogue/GHSA-gvwx-54wh-qm9j` | catalogue: new vulnerability on b: GHSA-gvwx-54wh-qm9j (Medium) in tar@7.5.11; fixed in 7.5.17 |
| `vulns` | `catalogue/GHSA-r292-9mhp-454m` | catalogue: new vulnerability on b: GHSA-r292-9mhp-454m (High) in tar@7.5.11; fixed in 7.5.21 |
| `vulns` | `catalogue/GHSA-vmf3-w455-68vh` | catalogue: new vulnerability on b: GHSA-vmf3-w455-68vh (Medium) in tar@7.5.11; fixed in 7.5.16 |
| `vulns` | `catalogue/GHSA-w8wr-v893-vjvp` | catalogue: new vulnerability on b: GHSA-w8wr-v893-vjvp (Medium) in tar@7.5.11; fixed in 7.5.18 |
| `sbom` | `live/corepack` | live: package bumped: corepack 0.36.0 → 0.34.6 |
| `sbom` | `live/node` | live: package bumped: node 22.23.3 → 22.23.2 |
| `sbom` | `live/npm` | live: package bumped: npm 10.9.9 → 10.9.8 |
| `sbom` | `live/tar` | live: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.22 → 1.34+dfsg-1.2+deb12u1, 7.5.11 |
| `sbom` | `live/tutors-live` | live: package bumped: tutors-live 16.2.1 → 16.2.2 |
| `vulns` | `live/GHSA-23hp-3jrh-7fpw` | live: new vulnerability on b: GHSA-23hp-3jrh-7fpw (Critical) in tar@7.5.11; fixed in 7.5.19 |
| `vulns` | `live/GHSA-8x88-c5mf-7j5w` | live: new vulnerability on b: GHSA-8x88-c5mf-7j5w (High) in tar@7.5.11; fixed in 7.5.18 |
| `vulns` | `live/GHSA-gvwx-54wh-qm9j` | live: new vulnerability on b: GHSA-gvwx-54wh-qm9j (Medium) in tar@7.5.11; fixed in 7.5.17 |
| `vulns` | `live/GHSA-r292-9mhp-454m` | live: new vulnerability on b: GHSA-r292-9mhp-454m (High) in tar@7.5.11; fixed in 7.5.21 |
| `vulns` | `live/GHSA-vmf3-w455-68vh` | live: new vulnerability on b: GHSA-vmf3-w455-68vh (Medium) in tar@7.5.11; fixed in 7.5.16 |
| `vulns` | `live/GHSA-w8wr-v893-vjvp` | live: new vulnerability on b: GHSA-w8wr-v893-vjvp (Medium) in tar@7.5.11; fixed in 7.5.18 |
| `sbom` | `time/corepack` | time: package bumped: corepack 0.36.0 → 0.34.6 |
| `sbom` | `time/node` | time: package bumped: node 22.23.3 → 22.23.2 |
| `sbom` | `time/npm` | time: package bumped: npm 10.9.9 → 10.9.8 |
| `sbom` | `time/tar` | time: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.22 → 1.34+dfsg-1.2+deb12u1, 7.5.11 |
| `sbom` | `time/tutors-time` | time: package bumped: tutors-time 16.2.1 → 16.2.2 |
| `vulns` | `time/GHSA-23hp-3jrh-7fpw` | time: new vulnerability on b: GHSA-23hp-3jrh-7fpw (Critical) in tar@7.5.11; fixed in 7.5.19 |
| `vulns` | `time/GHSA-8x88-c5mf-7j5w` | time: new vulnerability on b: GHSA-8x88-c5mf-7j5w (High) in tar@7.5.11; fixed in 7.5.18 |
| `vulns` | `time/GHSA-gvwx-54wh-qm9j` | time: new vulnerability on b: GHSA-gvwx-54wh-qm9j (Medium) in tar@7.5.11; fixed in 7.5.17 |
| `vulns` | `time/GHSA-r292-9mhp-454m` | time: new vulnerability on b: GHSA-r292-9mhp-454m (High) in tar@7.5.11; fixed in 7.5.21 |
| `vulns` | `time/GHSA-vmf3-w455-68vh` | time: new vulnerability on b: GHSA-vmf3-w455-68vh (Medium) in tar@7.5.11; fixed in 7.5.16 |
| `vulns` | `time/GHSA-w8wr-v893-vjvp` | time: new vulnerability on b: GHSA-w8wr-v893-vjvp (Medium) in tar@7.5.11; fixed in 7.5.18 |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 251.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 291 distinct package(s) (cosign attestation (signature verified)) | 291 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 108 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 9 layers, 230.4 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 277 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 108 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 9 layers, 230.4 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 277 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 108 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 9 layers, 231.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 287 distinct package(s) (cosign attestation (signature verified)) | 287 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 108 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) | 114 advisories, db built 2026-09-26T06:29:14Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.21 ms | 2.2 ms |
| b | 601 | 0 | 0 | 1.29 ms | 1.97 ms |

<details><summary>Informational (6)</summary>

- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reference:topic: console message gone on b
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.4.1 (6487642c6f3f, contract 1.4.0) · 2026-09-26T17:06:30.740Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×835, persistence-stub-requests×215, realtime-rest-fallback-warning×80, hashed-assets×5320, footer-tutors-version×220, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
