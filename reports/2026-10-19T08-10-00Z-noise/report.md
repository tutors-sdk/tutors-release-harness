## ⚠️ Release harness — noise — WARN

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

- A/A produced 1 diff(s): the normaliser needs a mask for each, or the stack is not deterministic; the harness is advisory until this is 0

### 1 unclaimed difference, 1 cause

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `focus` keyboard order changed (# stops on a, # on b) | 1 | reader | 1: `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: keyboard order changed (12 stops on a, 5 on b) |

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0585-preferences`: Rule 0585 (exercises 0037, 0038, 0039): 1 difference in focus

### Unclaimed differences (1)

| artefact | scope | what changed |
|---|---|---|
| `focus` | `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: keyboard order changed (12 stops on a, 5 on b) |

<details><summary>Detail of 1 difference(s)</summary>

`focus` `reader-auth:rule-0585-preferences-after-reload`

```
 button "Open Theme Menu"
-a "Course home"
-button "Open course info"
-button "Open course tree"
-a "Resources"
-button "View Calendar for this course"
-a "A version of this course for LLMs"
-a "My time"
-a "Live now ↗"
\ No newline at end of file
+button "Light"
\ No newline at end of file
```

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (28; 28 unclaimed): reported, never gates

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
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:topic-02 GET {{course}}/tutors.json` | replay:topic-02: new request on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:topic-02: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100` | replay:topic-02: new request on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:talk-01 GET {{course}}/tutors.json` | replay:talk-01: GET {{course}}/tutors.json requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 39× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100` | replay:talk-01: request no longer made on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 37× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET {{course}}/tutors.json` | replay:note-01: new request on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-01: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:note-01 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-02: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |

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
| a | 600 | 0 | 0 | 1.38 ms | 2.22 ms |
| b | 601 | 0 | 0 | 1.34 ms | 2.2 ms |

<details><summary>Informational (44)</summary>

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
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b
- `replay` replay:topic-02: new request on b: GET {{course}}/tutors.json
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:topic-02: new request on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:talk-01: GET {{course}}/tutors.json requested 2× on a, 1× on b
- `replay` replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 39× on b
- `replay` replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b
- `replay` replay:talk-01: request no longer made on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 37× on a, 38× on b
- `replay` replay:note-01: new request on b: GET {{course}}/tutors.json
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:note-01: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 38× on b
- `replay` replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b
- `replay` replay:note-02: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
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

<sub>harness 1.48.5 (1eb3f30f102b, contract 1.48.5) · 2026-10-19T08:10:00.716Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×272, request-id×272, etag×272, metrics-process×599, metrics-timing-histograms×12, third-party-requests×6809, persistence-stub-requests×2600, oauth-callback-state×110, media-range-status×44, chromium-compute-pressure-policy×1, hashed-assets×20124, footer-tutors-version×842, transport-length×272, transport-connection×272, transport-keepalive×272</sub>
