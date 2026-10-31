## ✅ Release harness — noise — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:17.0.0` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:17.0.0` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:17.0.0` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` |

- A/A is clean: the harness may gate releases

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (33; 33 unclaimed): reported, never gates

18 of 27 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `realtime` | `reader-auth:rule-0592-stroke-saved/websocket` | reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 6 data frame(s) sent); readers must be publish-only (production too) | no date set | unclaimed |
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 15e3aa22476d (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on e9f2764654cb (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 52740e55cfa7 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on d0a9f4a2f462 (production too) | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 36× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100` | replay:talk-01: request no longer made on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-01 GET {{course}}/tutors.json` | replay:note-01: GET {{course}}/tutors.json requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-01: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 39× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: new request on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 37× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET {{course}}/tutors.json` | replay:note-02: new request on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-02: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100` | replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET {{course}}/tutors.json` | replay:lab-02-step-03: GET {{course}}/tutors.json requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/1.{{hash}}.css` | replay:lab-02-step-03: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100` | replay:lab-02-step-03: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/chunks/{{hash}}.js` | replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET {{course}}/tutors.json` | replay:missing-topic: new request on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/1.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/nodes/1.{{hash}}.js` | replay:missing-topic: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100` | replay:missing-topic: new request on b: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10 (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.44 ms | 2.54 ms |
| b | 601 | 0 | 0 | 1.46 ms | 2.33 ms |

<details><summary>Informational (50)</summary>

- `dom` journey "anonymous-student-reads-course" failed on a but completed on b (fixed)
- `realtime` reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 6 data frame(s) sent); readers must be publish-only (production too)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 15e3aa22476d (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on e9f2764654cb (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on 52740e55cfa7 (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on d0a9f4a2f462 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `replay` replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 36× on b
- `replay` replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b
- `replay` replay:talk-01: request no longer made on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-01: GET {{course}}/tutors.json requested 1× on a, 2× on b
- `replay` replay:note-01: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b
- `replay` replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 39× on b
- `replay` replay:note-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b
- `replay` replay:note-01: new request on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 37× on a, 38× on b
- `replay` replay:note-02: new request on b: GET {{course}}/tutors.json
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:lab-02-step-03: GET {{course}}/tutors.json requested 2× on a, 1× on b
- `replay` replay:lab-02-step-03: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 38× on b
- `replay` replay:lab-02-step-03: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b
- `replay` replay:lab-02-step-03: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b
- `replay` replay:missing-topic: new request on b: GET {{course}}/tutors.json
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:missing-topic: new request on b: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor): holds
- `slo` reader-availability: 100.0% of 601 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor): holds
- `slo` reader-latency: 100.0% of 601 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for time
- `slo` time-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for time

</details>

<sub>harness 1.48.6 (bdb61b759965, contract 1.48.6) · 2026-10-19T09:47:56.867Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×270, request-id×270, etag×270, metrics-process×599, metrics-timing-histograms×12, third-party-requests×6752, persistence-stub-requests×2600, oauth-callback-state×110, media-range-status×44, hashed-assets×20007, footer-tutors-version×826, transport-length×270, transport-connection×270, transport-keepalive×270</sub>
