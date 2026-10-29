## ✅ Release harness — upgrade — PASS

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-011b8c6` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-011b8c6` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-011b8c6` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-011b8c6` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:fda990bd84c1cce4018d293cb6ac3279799d73638f55b94dead596854a3012de` · rev `011b8c6b5d3f` · version `sha-011b8c6` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:11e4340e73b3c447e9e0285f960286365ee4699054f41eef70e763d82a7d7b68` · rev `011b8c6b5d3f` · version `sha-011b8c6` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:be04bb60dc3a7d464d859ed9fc694502ef7025b86ae4c6f5780f7c62773a0eb8` · rev `011b8c6b5d3f` · version `sha-011b8c6` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:0996618564598671992fd9f8435fa8b27b5d8d0aae367048f1a21fbcf7002809` · rev `011b8c6b5d3f` · version `sha-011b8c6` |

- the candidate rolled in under load with no failed request
- 115 difference(s) between a and b outside the rollout, judged by release mode
- NOT COLLECTED: vulns of reader, catalogue, live, time on side a: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- NOT COLLECTED: vulns of reader, catalogue, live, time on side b: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)

### 115 unclaimed differences, 11 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `logs` log field gone on b (16 fields: `app`, `duration_ms`, `environment`, `event`, `hostname`, `level`, `loadError`, `message` and 8 more) | 48 | catalogue, live, time | — | catalogue: log field gone on b: app |
| `sbom` package bumped (5 packages: `dompurify`, `entities`, `node`, `tzdata`, `undici`) | 20 | reader, catalogue, live, time | — | reader: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` package added (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | reader | — | reader: package added: @supabase/auth-js@2.117.2 |
| `sbom` package removed (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | time | — | time: package removed: @supabase/auth-js@2.117.2 |
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 6 | catalogue, live, time | — | catalogue: new series on b: http_request_duration_seconds_count |
| `dom` semantic DOM differs (+# −# lines at line #) | 5 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `focus` keyboard order changed (# stops on a, # on b) | 5 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `image-manifest` built FROM a different base image (lowest layer e#fce → #b#de#) | 4 | reader, catalogue, live, time | — | reader: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `image-manifest` label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte #, SvelteKit, and TypeScript." | 4 | reader, catalogue, live, time | — | reader: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built wi… |
| `logs` request-id propagation fell from #% to #% | 3 | catalogue, live, time | — | catalogue: request-id propagation fell from 100% to 0% |
| `network` GET {{asset}} requested #× on a, #× on b (1 route: `GET /_app/immutable/chunks/{{hash}}.js`) | 2 | reader | 2: `reader:course`, `reader:home` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 35× on b |

Moved together on the same pages, so likely one change each:

- `dom`, `focus` on 3 pages (6 differences): `reader:lab-step`, `reader:lab-step-2`, `reader:topic`
- `dom`, `focus`, `network` on 2 pages (6 differences): `reader:course`, `reader:home`

### Unclaimed differences (115)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:home` | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 8) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 35× on b |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:course: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 44× on b |
| `metrics` | `catalogue/http_request_duration_seconds_count` | catalogue: new series on b: http_request_duration_seconds_count |
| `metrics` | `catalogue/http_requests_total` | catalogue: new series on b: http_requests_total |
| `metrics` | `live/http_request_duration_seconds_count` | live: new series on b: http_request_duration_seconds_count |
| `metrics` | `live/http_requests_total` | live: new series on b: http_requests_total |
| `metrics` | `time/http_request_duration_seconds_count` | time: new series on b: http_request_duration_seconds_count |
| `metrics` | `time/http_requests_total` | time: new series on b: http_requests_total |
| `logs` | `catalogue/app` | catalogue: log field gone on b: app |
| `logs` | `catalogue/duration_ms` | catalogue: log field gone on b: duration_ms |
| `logs` | `catalogue/environment` | catalogue: log field gone on b: environment |
| `logs` | `catalogue/event` | catalogue: log field gone on b: event |
| `logs` | `catalogue/hostname` | catalogue: log field gone on b: hostname |
| `logs` | `catalogue/level` | catalogue: log field gone on b: level |
| `logs` | `catalogue/loadError` | catalogue: log field gone on b: loadError |
| `logs` | `catalogue/message` | catalogue: log field gone on b: message |
| `logs` | `catalogue/method` | catalogue: log field gone on b: method |
| `logs` | `catalogue/path` | catalogue: log field gone on b: path |
| `logs` | `catalogue/pid` | catalogue: log field gone on b: pid |
| `logs` | `catalogue/requestId` | catalogue: log field gone on b: requestId |
| `logs` | `catalogue/route` | catalogue: log field gone on b: route |
| `logs` | `catalogue/slow` | catalogue: log field gone on b: slow |
| `logs` | `catalogue/status` | catalogue: log field gone on b: status |
| `logs` | `catalogue/timestamp` | catalogue: log field gone on b: timestamp |
| `logs` | `catalogue/request-id` | catalogue: request-id propagation fell from 100% to 0% |
| `logs` | `live/app` | live: log field gone on b: app |
| `logs` | `live/duration_ms` | live: log field gone on b: duration_ms |
| `logs` | `live/environment` | live: log field gone on b: environment |
| `logs` | `live/event` | live: log field gone on b: event |
| `logs` | `live/hostname` | live: log field gone on b: hostname |
| `logs` | `live/level` | live: log field gone on b: level |
| `logs` | `live/loadError` | live: log field gone on b: loadError |
| `logs` | `live/message` | live: log field gone on b: message |
| `logs` | `live/method` | live: log field gone on b: method |
| `logs` | `live/path` | live: log field gone on b: path |
| `logs` | `live/pid` | live: log field gone on b: pid |
| `logs` | `live/requestId` | live: log field gone on b: requestId |
| `logs` | `live/route` | live: log field gone on b: route |
| `logs` | `live/slow` | live: log field gone on b: slow |
| `logs` | `live/status` | live: log field gone on b: status |
| `logs` | `live/timestamp` | live: log field gone on b: timestamp |
| `logs` | `live/request-id` | live: request-id propagation fell from 100% to 0% |
| `logs` | `time/app` | time: log field gone on b: app |
| `logs` | `time/duration_ms` | time: log field gone on b: duration_ms |
| `logs` | `time/environment` | time: log field gone on b: environment |
| `logs` | `time/event` | time: log field gone on b: event |
| `logs` | `time/hostname` | time: log field gone on b: hostname |
| `logs` | `time/level` | time: log field gone on b: level |
| `logs` | `time/loadError` | time: log field gone on b: loadError |
| `logs` | `time/message` | time: log field gone on b: message |
| `logs` | `time/method` | time: log field gone on b: method |
| `logs` | `time/path` | time: log field gone on b: path |
| `logs` | `time/pid` | time: log field gone on b: pid |
| `logs` | `time/requestId` | time: log field gone on b: requestId |
| `logs` | `time/route` | time: log field gone on b: route |
| `logs` | `time/slow` | time: log field gone on b: slow |
| `logs` | `time/status` | time: log field gone on b: status |
| `logs` | `time/timestamp` | time: log field gone on b: timestamp |
| `logs` | `time/request-id` | time: request-id propagation fell from 100% to 0% |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:course` | reader:course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:topic` | reader:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step` | reader:lab-step: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step-2` | reader:lab-step-2: keyboard order changed (12 stops on a, 12 on b) |
| `image-manifest` | `reader/base` | reader: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `image-manifest` | `reader/label/org.opencontainers.image.description` | reader: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `reader/@supabase/auth-js` | reader: package added: @supabase/auth-js@2.117.2 |
| `sbom` | `reader/@supabase/functions-js` | reader: package added: @supabase/functions-js@2.117.2 |
| `sbom` | `reader/@supabase/phoenix` | reader: package added: @supabase/phoenix@0.4.5 |
| `sbom` | `reader/@supabase/postgrest-js` | reader: package added: @supabase/postgrest-js@2.117.2 |
| `sbom` | `reader/@supabase/realtime-js` | reader: package added: @supabase/realtime-js@2.117.2 |
| `sbom` | `reader/@supabase/storage-js` | reader: package added: @supabase/storage-js@2.117.2 |
| `sbom` | `reader/@supabase/supabase-js` | reader: package added: @supabase/supabase-js@2.117.2 |
| `sbom` | `reader/dompurify` | reader: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `reader/entities` | reader: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `reader/iceberg-js` | reader: package added: iceberg-js@0.8.1 |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `reader/tslib` | reader: package added: tslib@2.8.1 |
| `sbom` | `reader/tzdata` | reader: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| `sbom` | `reader/undici` | reader: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `catalogue/base` | catalogue: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `image-manifest` | `catalogue/label/org.opencontainers.image.description` | catalogue: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `catalogue/dompurify` | catalogue: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `catalogue/entities` | catalogue: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `catalogue/tzdata` | catalogue: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| `sbom` | `catalogue/undici` | catalogue: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `live/base` | live: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `image-manifest` | `live/label/org.opencontainers.image.description` | live: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `live/dompurify` | live: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `live/entities` | live: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `live/node` | live: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `live/tzdata` | live: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| `sbom` | `live/undici` | live: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `time/base` | time: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `image-manifest` | `time/label/org.opencontainers.image.description` | time: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `time/@supabase/auth-js` | time: package removed: @supabase/auth-js@2.117.2 |
| `sbom` | `time/@supabase/functions-js` | time: package removed: @supabase/functions-js@2.117.2 |
| `sbom` | `time/@supabase/phoenix` | time: package removed: @supabase/phoenix@0.4.5 |
| `sbom` | `time/@supabase/postgrest-js` | time: package removed: @supabase/postgrest-js@2.117.2 |
| `sbom` | `time/@supabase/realtime-js` | time: package removed: @supabase/realtime-js@2.117.2 |
| `sbom` | `time/@supabase/storage-js` | time: package removed: @supabase/storage-js@2.117.2 |
| `sbom` | `time/@supabase/supabase-js` | time: package removed: @supabase/supabase-js@2.117.2 |
| `sbom` | `time/dompurify` | time: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `time/entities` | time: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `time/iceberg-js` | time: package removed: iceberg-js@0.8.1 |
| `sbom` | `time/node` | time: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `time/tslib` | time: package removed: tslib@2.8.1 |
| `sbom` | `time/tzdata` | time: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| `sbom` | `time/undici` | time: package bumped: undici 8.11.2 → 8.12.3 |

<details><summary>Detail of 14 difference(s)</summary>

`dom` `reader:home`

```
     - link "My courses":
       - /url: /
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:course`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:topic`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:lab-step`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:lab-step-2`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`focus` `reader:home`

```
 a "My courses"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:course`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:topic`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:lab-step`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`focus` `reader:lab-step-2`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
```

`image-manifest` `reader/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:e58989146fcec76699871403b9897b5c014af1ccd85f5a9300a215e7975525d7 b=sha256:9b35de7893378218e365c34c2c735fb0032a859112fb7345ca8ea73f9aa1db70
```

`image-manifest` `catalogue/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:e58989146fcec76699871403b9897b5c014af1ccd85f5a9300a215e7975525d7 b=sha256:9b35de7893378218e365c34c2c735fb0032a859112fb7345ca8ea73f9aa1db70
```

`image-manifest` `live/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:e58989146fcec76699871403b9897b5c014af1ccd85f5a9300a215e7975525d7 b=sha256:9b35de7893378218e365c34c2c735fb0032a859112fb7345ca8ea73f9aa1db70
```

`image-manifest` `time/base`

```
base.digest label: a=unrecorded b=unrecorded
lowest layer:      a=sha256:e58989146fcec76699871403b9897b5c014af1ccd85f5a9300a215e7975525d7 b=sha256:9b35de7893378218e365c34c2c735fb0032a859112fb7345ca8ea73f9aa1db70
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
| `asset-graph` | `reader` | reader: the asset graph changed: 111 → 115 immutable requests (JS 92 → 96, CSS 19 → 19), 1.1 MB → 1.1 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 311.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 270.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 271.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 275.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |

### Upgrade rehearsal (compose)

| upstream | requests | failed | 5xx | p95 |
|---|---|---|---|---|
| a | 300 | 0 | 0 | 4.5 ms |
| b | 601 | 0 | 0 | 3.9 ms |
| **all** | 901 | 0 | 0 | switched at 16.9 s |

<details><summary>Informational (62)</summary>

- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
- `console` reader:home: console message gone on b
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
- `asset-graph` reader: the asset graph changed: 111 → 115 immutable requests (JS 92 → 96, CSS 19 → 19), 1.1 MB → 1.1 MB; 2 network and 0 headers difference(s) are this churn
- `slo` reader-availability: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency: not evaluated on b: 4 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `secrets-in-response` secrets-in-response holds on b: no secret-shaped value in the accessibility tree, document headers, response URLs, console or HTML and JSON bodies of 5 page capture(s)
- `upgrade` 901 requests through the rollout, none failed; switched at 16.9s

</details>

<sub>harness 1.59.1 (df0eeefb1cf3, contract 1.59.0) · 2026-10-29T09:47:58.960Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×4, request-id×4, etag×4, metrics-process×599, metrics-timing-histograms×18, third-party-requests×62, hashed-assets×226, footer-tutors-version×20, transport-length×4, transport-connection×4, transport-keepalive×4</sub>
