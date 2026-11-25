## ✅ Release harness — upgrade — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.1.0` | `quay.io/tutors-sdk/tutors-reader:sha-2b96b69` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.1.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-2b96b69` |
| live | `quay.io/tutors-sdk/tutors-live:17.1.0` | `quay.io/tutors-sdk/tutors-live:sha-2b96b69` |
| time | `quay.io/tutors-sdk/tutors-time:17.1.0` | `quay.io/tutors-sdk/tutors-time:sha-2b96b69` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:baf4fa65b3de4a7aed633fcaaf373c0183fa81f13b8e89836aaed2666454b961` · rev `2b96b69b6e99` · version `sha-2b96b69` |
| catalogue image | `sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:539b065c073f04407c2d2a09529ac35a0b7446609be2a306c77240c45eed4927` · rev `2b96b69b6e99` · version `sha-2b96b69` |
| live image | `sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:f582e4747230dd1d281c14bffdcf4450e3f1e7e14760ddd65425b47f3f3aa72a` · rev `2b96b69b6e99` · version `sha-2b96b69` |
| time image | `sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:c42b51afbef9644c59abbafd7a2ae97e6f964138f3cb5a5ebda6a82582f047e5` · rev `2b96b69b6e99` · version `sha-2b96b69` |

- the candidate rolled in under load with no failed request
- 32 difference(s) between a and b outside the rollout, judged by release mode
- NOT COLLECTED: vulns of reader, catalogue, live, time on side a: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- NOT COLLECTED: vulns of reader, catalogue, live, time on side b: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)

### 32 unclaimed differences, 10 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `sbom` package bumped (3 packages: `apt`, `libapt-pkg6.0`, `node`) | 12 | reader, catalogue, live, time | — | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `dom` semantic DOM differs (+# −# lines at line #) | 6 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: semantic DOM differs (+2 −0 lines at line 23) |
| `image-manifest` built FROM a different base image (lowest layer #a#b# → #e#) | 4 | reader, catalogue, live, time | — | reader: built FROM a different base image (lowest layer 44a87794b739 → 606229031e76) |
| `network` GET {{asset}} requested #× on a, #× on b (1 route: `GET /_app/immutable/chunks/{{hash}}.js`) | 2 | reader | 2: `reader:course`, `reader:home` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 37× on b |
| `network` new request on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/24.{{hash}}.css`, `GET /_app/immutable/nodes/24.{{hash}}.js`) | 2 | reader | 1: `reader:home` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` request no longer made on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/23.{{hash}}.css`, `GET /_app/immutable/nodes/23.{{hash}}.js`) | 2 | reader | 1: `reader:home` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `focus` keyboard order changed (# stops on a, # on b) | 1 | reader | 1: `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `network` request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=#&x-sveltekit-invalidated=# | 1 | reader | 1: `reader:home` | reader:home: request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 |
| `network` request no longer made on b: GET /course/localhost:#/__data.json?x-sveltekit-invalidated=# | 1 | reader | 1: `reader:course` | reader:course: request no longer made on b: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 1 | reader | 1: `reader:home` | reader:home: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |

Moved together on the same pages, so likely one change each:

- `dom`, `focus`, `network`, `screenshot` on 1 page (10 differences): `reader:home`
- `dom`, `network` on 1 page (3 differences): `reader:course`

### Unclaimed differences (32)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:home` | reader:home: semantic DOM differs (+2 −0 lines at line 23) |
| `dom` | `reader:home` | reader:home: semantic DOM differs (+1 −1 lines at line 64) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+1 −1 lines at line 49) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+1 −1 lines at line 67) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+1 −1 lines at line 86) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 80) |
| `screenshot` | `reader:home` | reader:home: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `network` | `GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100` | reader:home: request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 37× on b |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader:home: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader:home: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:course: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 46× on b |
| `network` | `GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100` | reader:course: request no longer made on b: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `image-manifest` | `reader/base` | reader: built FROM a different base image (lowest layer 44a87794b739 → 606229031e76) |
| `sbom` | `reader/apt` | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `reader/libapt-pkg6.0` | reader: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `reader/node` | reader: package bumped: node 26.13.0 → 26.13.1 |
| `image-manifest` | `catalogue/base` | catalogue: built FROM a different base image (lowest layer 44a87794b739 → 606229031e76) |
| `sbom` | `catalogue/apt` | catalogue: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/libapt-pkg6.0` | catalogue: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 26.13.0 → 26.13.1 |
| `image-manifest` | `live/base` | live: built FROM a different base image (lowest layer 44a87794b739 → 606229031e76) |
| `sbom` | `live/apt` | live: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `live/libapt-pkg6.0` | live: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `live/node` | live: package bumped: node 26.13.0 → 26.13.1 |
| `image-manifest` | `time/base` | time: built FROM a different base image (lowest layer 44a87794b739 → 606229031e76) |
| `sbom` | `time/apt` | time: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `time/libapt-pkg6.0` | time: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `time/node` | time: package bumped: node 26.13.0 → 26.13.1 |

<details><summary>Detail of 12 difference(s)</summary>

`dom` `reader:home`

```
     - link "Time ↗":
       - /url: https://time.tutors.dev
+    - link "Validator ↗":
+      - /url: https://validator.tutors.dev
     - link "Create":
       - /url: /create
```

`dom` `reader:home`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader:course`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader:topic`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader:lab-step`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader:lab-step-2`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`screenshot` `reader:home`

```
diff image: diff/anonymous-student-reads-course-1/reader_home.png
```

`focus` `reader:home`

```
 a "Time ↗"
+a "Validator ↗"
 a "Create"
-a "Docs"
-a "SETU"
\ No newline at end of file
+a "Docs"
\ No newline at end of file
```

`image-manifest` `reader/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:44a87794b739d471ec360bec56cc0ceac640d06bbf579ee7d9061a0b88d09818 b=sha256:606229031e76a82c486df00d2565c45a89bb848a4df0fb315d9c4c47b3682530
```

`image-manifest` `catalogue/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:44a87794b739d471ec360bec56cc0ceac640d06bbf579ee7d9061a0b88d09818 b=sha256:606229031e76a82c486df00d2565c45a89bb848a4df0fb315d9c4c47b3682530
```

`image-manifest` `live/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:44a87794b739d471ec360bec56cc0ceac640d06bbf579ee7d9061a0b88d09818 b=sha256:606229031e76a82c486df00d2565c45a89bb848a4df0fb315d9c4c47b3682530
```

`image-manifest` `time/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:44a87794b739d471ec360bec56cc0ceac640d06bbf579ee7d9061a0b88d09818 b=sha256:606229031e76a82c486df00d2565c45a89bb848a4df0fb315d9c4c47b3682530
```

</details>

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
| `asset-graph` | `reader` | reader: the asset graph changed: 117 → 119 immutable requests (JS 98 → 100, CSS 19 → 19), 1.1 MB → 1.1 MB; 6 network and 0 headers difference(s) are this churn | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 108.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 107.3 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 144 distinct package(s) (cosign attestation (signature verified)) | 144 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| catalogue | manifest | 9 layers, 94.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 93.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| live | manifest | 9 layers, 94.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 93.3 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| time | manifest | 9 layers, 94.3 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 93.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |

### Upgrade rehearsal (compose)

| upstream | requests | failed | 5xx | p95 |
|---|---|---|---|---|
| a | 300 | 0 | 0 | 4.1 ms |
| b | 601 | 0 | 0 | 3.8 ms |
| **all** | 901 | 0 | 0 | switched at 16.8 s |

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
- `asset-graph` reader: the asset graph changed: 117 → 119 immutable requests (JS 98 → 100, CSS 19 → 19), 1.1 MB → 1.1 MB; 6 network and 0 headers difference(s) are this churn
- `slo` reader-availability: not evaluated on b: 2 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency: not evaluated on b: 2 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `secrets-in-response` secrets-in-response holds on b: no secret-shaped value in the accessibility tree, document headers, response URLs, console or HTML and JSON bodies of 5 page capture(s)
- `upgrade` 901 requests through the rollout, none failed; switched at 16.8s

</details>

<sub>harness 1.63.0 (5b80358d0332, contract 1.63.0) · 2026-11-25T13:40:00.310Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×4, request-id×4, etag×4, metrics-process×599, metrics-timing-histograms×32, third-party-requests×62, hashed-assets×236, footer-tutors-version×20, transport-length×4, transport-connection×4, transport-keepalive×4</sub>
