## ⚠️ Release harness — noise — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:main` | `quay.io/tutors-sdk/tutors-reader:main` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:main` | `quay.io/tutors-sdk/tutors-catalogue:main` |
| live | `quay.io/tutors-sdk/tutors-live:main` | `quay.io/tutors-sdk/tutors-live:main` |
| time | `quay.io/tutors-sdk/tutors-time:main` | `quay.io/tutors-sdk/tutors-time:main` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:8eaf959c863cd49e06a669294a8a661b39702be657f84c828a0bf0fea98e3e19` · rev `c117f56e34a2` · version `sha-c117f56` | `sha256:8eaf959c863cd49e06a669294a8a661b39702be657f84c828a0bf0fea98e3e19` · rev `c117f56e34a2` · version `sha-c117f56` |
| catalogue image | `sha256:7a9f63d7f239a6dbb90f492df6c2f568c180acd434738cd97bd4f0387db56d76` · rev `c117f56e34a2` · version `sha-c117f56` | `sha256:7a9f63d7f239a6dbb90f492df6c2f568c180acd434738cd97bd4f0387db56d76` · rev `c117f56e34a2` · version `sha-c117f56` |
| live image | `sha256:81fa500e73b1daf488d0aecf6e31ec4d8f7e6ba68fb342cb2db73b36ecb68563` · rev `c117f56e34a2` · version `sha-c117f56` | `sha256:81fa500e73b1daf488d0aecf6e31ec4d8f7e6ba68fb342cb2db73b36ecb68563` · rev `c117f56e34a2` · version `sha-c117f56` |
| time image | `sha256:9fe66d095f0b97a2335ee2ce6f2b121a3ade4d2d075c81175ea10af276f69522` · rev `54a8f832d413` · version `sha-54a8f83` | `sha256:9fe66d095f0b97a2335ee2ce6f2b121a3ade4d2d075c81175ea10af276f69522` · rev `54a8f832d413` · version `sha-54a8f83` |

- A/A produced 1 diff(s): the normaliser needs a mask for each, or the stack is not deterministic; the harness is advisory until this is 0

### Unclaimed differences (1)

| artefact | scope | what changed |
|---|---|---|
| `network` | `GET {{course}}/topic-07-reference/note-1/img/video.mov` | reference:note: GET {{course}}/topic-07-reference/note-1/img/video.mov requested 4× on a, 5× on b |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 256.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 256.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 105 distinct package(s) (cosign attestation (signature verified)) | 105 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 233.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| live | manifest | 10 layers, 233.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 90 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |
| time | manifest | 10 layers, 235.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 235.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 100 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) | 96 advisories, db built 2026-09-27T06:30:30Z schema v6.1.9 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.36 ms | 2.08 ms |
| b | 601 | 0 | 0 | 1.28 ms | 2.23 ms |

<details><summary>Informational (2)</summary>

- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)

</details>

<sub>harness 1.4.13 (0d60fe58fa9f, contract 1.4.0) · 2026-09-27T13:59:55.645Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×80, request-id×80, etag×80, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1393, persistence-stub-requests×410, hashed-assets×7000, footer-tutors-version×320, transport-length×80, transport-connection×80, transport-keepalive×80</sub>
