## ⚠️ Release harness — release — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.2@sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` | `quay.io/tutors-sdk/tutors-reader:17.0.0-rc.1@sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.2@sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` | `quay.io/tutors-sdk/tutors-catalogue:17.0.0-rc.1@sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.2@sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` | `quay.io/tutors-sdk/tutors-live:17.0.0-rc.1@sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` |
| time | `quay.io/tutors-sdk/tutors-time:16.2.2@sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` | `quay.io/tutors-sdk/tutors-time:17.0.0-rc.1@sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` |
| catalogue image | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` |
| live image | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` |
| time image | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` |

- advisory only: the last A/A run (2026-10-15T07:38:30.465Z) was degraded and does not count: journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages
- 382 unclaimed diff(s)
- 28 claim(s) matched nothing and should be removed from the changelog
- A/A consulted: clean but DEGRADED (does not count) at 2026-10-15T07:38:30.465Z
- 24 claim(s) carry a lifetime (until or digests); none has expired.

### 382 unclaimed differences, 30 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `sbom` package added (43 packages: `@asamuzakjp/css-color`, `@asamuzakjp/dom-selector`, `@bramus/specificity`, `@csstools/color-helpers`, `@csstools/css-calc`, `@csstools/css-color-parser`, `@csstools/css-parser-algorithms`, `@csstools/css-syntax-patches-for-csstree` and 35 more) | 169 | reader, catalogue, live, time | — | reader: package added: @asamuzakjp/css-color@7.1.5 |
| `network` new request on b: GET {{asset}} (16 routes: `GET /_app/immutable/assets/1.{{hash}}.css`, `GET /_app/immutable/assets/14.{{hash}}.css`, `GET /_app/immutable/assets/2.{{hash}}.css`, `GET /_app/immutable/assets/23.{{hash}}.css`, `GET /_app/immutable/assets/8.{{hash}}.css`, `GET /_app/immutable/assets/Card.{{hash}}.css`, `GET /_app/immutable/assets/Composite.{{hash}}.css`, `GET /_app/immutable/assets/Context.{{hash}}.css` and 8 more) | 60 | reader, catalogue, live | 9: `catalogue:home`, `live:home`, `reader-auth:course`, `reader:course`, `reader:home`, `reader:lab-step` and 3 more | reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `sbom` package bumped (16 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `dompurify`, `libpcre2-8-0` and 8 more) | 31 | reader, catalogue, live, time | — | reader: package bumped: dompurify 3.4.14 → 3.4.16 |
| `logs` new log field on b (4 fields: `consoleMethod`, `event`, `loadError`, `slow`) | 16 | reader, catalogue, live, time | — | reader: new log field on b: event |
| `focus` keyboard order changed (# stops on a, # on b) | 14 | reader, catalogue, live | 14: `catalogue:home`, `live:home`, `reader-auth:course`, `reader-auth:topic`, `reader:course`, `reader:home` and 8 more | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `sbom` package removed (12 packages: `@auth/core`, `@panva/hkdf`, `jose`, `jsx-runtime`, `oauth4webapi`, `preact`, `preact-compat`, `preact-debug` and 4 more) | 12 | reader | — | reader: package removed: @auth/core@0.41.3 |
| `dom` semantic DOM differs (+# −# lines at line #) | 11 | reader | 5: `reader-auth:course`, `reader-auth:topic`, `reference:course`, `reference:lab`, `reference:topic` | reader-auth:course: semantic DOM differs (+40 −35 lines at line 4) |
| `console` new console message on b | 10 | reader, catalogue | 3: `catalogue:home`, `reader-auth:course`, `reader-auth:topic` | catalogue:home: new console message on b |
| `network` GET {{asset}} requested #× on a, #× on b (1 route: `GET /_app/immutable/chunks/{{hash}}.js`) | 9 | reader, catalogue, live | 9: `catalogue:home`, `live:home`, `reader-auth:course`, `reader:course`, `reader:home`, `reader:lab-step` and 3 more | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 33× on b |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 6 | reader | 6: `reader-auth:course`, `reader-auth:sign-in`, `reader-auth:topic`, `reference:course`, `reference:lab`, `reference:topic` | reader-auth:sign-in: 10.80% of pixels differ in 996×776 at (142, 24) (threshold 0.10%) |
| `headers` header dropped on b (1 header: `link`) | 5 | reader, catalogue, live | 5: `catalogue:home`, `live:home`, `reader-auth:course`, `reader-auth:sign-in`, `reference:course` | catalogue:home: header dropped on b: link (was <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{has… |
| `image-manifest` # layer(s) on a, # on b | 4 | reader, catalogue, live, time | — | reader: 9 layer(s) on a, 10 on b |
| `image-manifest` built FROM a different base image (lowest layer #cc# → e#fce) | 4 | reader, catalogue, live, time | — | reader: built FROM a different base image (lowest layer 34467cc93912 → e58989146fce) |
| `image-manifest` image size # MB → # MB (+#%) | 4 | reader, catalogue, live, time | — | reader: image size 251.5 MB → 309.2 MB (+23%) |
| `image-manifest` label org.opencontainers.image.vendor added (Tutors SDK) | 4 | reader, catalogue, live, time | — | reader: label org.opencontainers.image.vendor added (Tutors SDK) |
| `network` new request on b: GET /_app/version.json | 4 | reader | 4: `reader-auth:course`, `reader-auth:topic`, `reader:lab-step`, `reader:topic` | reader:topic: new request on b: GET /_app/version.json |
| `network` GET /course/localhost:#/__data.json?x-sveltekit-invalidated=# response schema changed: f#a#e#ea#da → #b#f#d#c# | 3 | reader | 3: `reader-auth:course`, `reader:course`, `reader:search` | reader:course: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 |
| `network` request no longer made on b: GET /logo.svg | 3 | reader, catalogue, live | 3: `catalogue:home`, `live:home`, `reader:home` | reader:home: request no longer made on b: GET /logo.svg |
| `network` request no longer made on b: GET /global.css | 2 | catalogue, live | 2: `catalogue:home`, `live:home` | catalogue:home: request no longer made on b: GET /global.css |
| `dom` journey "reference-course-reads" completed on a but failed on b | 1 | — | — | journey "reference-course-reads" completed on a but failed on b |
| `headers` header added on b (1 header: `cache-control`) | 1 | reader | 1: `reader-auth:course` | reader-auth:course: header added on b: cache-control: no-store,private |
| `network` GET /__data.json?x-sveltekit-trailing-slash=#&x-sveltekit-invalidated=# response schema changed: f#a#e#ea#da → #b#f#d#c# | 1 | reader | 1: `reader:home` | reader:home: GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 |
| `network` GET /course/localhost:# cache-control changed: ∅ → no-store,private | 1 | reader | 1: `reader-auth:course` | reader-auth:course: GET /course/localhost:8080 cache-control changed: ∅ → no-store,private |
| `network` new request on b: GET /api/auth/callback/github?code=code-student&state={{state}} | 1 | reader | 1: `reader-auth:course` | reader-auth:course: new request on b: GET /api/auth/callback/github?code=code-student&state={{state}} |
| `network` new request on b: POST /api/auth/sign-in/social | 1 | reader | 1: `reader-auth:course` | reader-auth:course: new request on b: POST /api/auth/sign-in/social |
| `network` request no longer made on b: GET /auth/callback/github?code=code-student | 1 | reader | 1: `reader-auth:course` | reader-auth:course: request no longer made on b: GET /auth/callback/github?code=code-student |
| `network` request no longer made on b: POST /auth/signin/github? | 1 | reader | 1: `reader-auth:course` | reader-auth:course: request no longer made on b: POST /auth/signin/github? |
| `persistence` POST app_errors — # row(s) on a, # on b | 1 | — | — | student-signs-in: POST app_errors — 20 row(s) on a, 4 on b |
| `persistence` POST tutors-connect-latest — # row(s) on a, # on b | 1 | — | — | student-signs-in: POST tutors-connect-latest — 4 row(s) on a, 2 on b |
| `timing` journey student-signs-in slower on b (1 name: `median 3986ms → 23032ms (+478%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 74%)`) | 1 | — | — | journey student-signs-in slower on b: median 3986ms → 23032ms (+478%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 74%) |

Moved together on the same pages, so likely one change each:

- `focus`, `network` on 5 pages (44 differences): `reader:course`, `reader:home`, `reader:lab-step`, `reader:search`, `reader:topic`
- `console`, `dom`, `focus`, `headers`, `network`, `screenshot` on 1 page (28 differences): `reader-auth:course`
- `dom`, `focus`, `headers`, `network`, `screenshot` on 1 page (16 differences): `reference:course`
- `console`, `focus`, `headers`, `network` on 1 page (11 differences): `catalogue:home`
- `focus`, `headers`, `network` on 1 page (10 differences): `live:home`
- `console`, `dom`, `focus`, `network`, `screenshot` on 1 page (9 differences): `reader-auth:topic`
- `dom`, `focus`, `network`, `screenshot` on 1 page (7 differences): `reference:lab`
- `dom`, `focus`, `screenshot` on 1 page (5 differences): `reference:topic`
- `headers`, `screenshot` on 1 page (2 differences): `reader-auth:sign-in`

### Unclaimed differences (382)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reference-course-reads` | journey "reference-course-reads" completed on a but failed on b |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+40 −35 lines at line 4) |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+6 −7 lines at line 49) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+56 −45 lines at line 4) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+6 −7 lines at line 61) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+80 −87 lines at line 4) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+6 −7 lines at line 118) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+50 −59 lines at line 4) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+55 −44 lines at line 74) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+6 −7 lines at line 143) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+64 −60 lines at line 2) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+18 −42 lines at line 85) |
| `screenshot` | `reader-auth:sign-in` | reader-auth:sign-in: 10.80% of pixels differ in 996×776 at (142, 24) (threshold 0.10%) |
| `screenshot` | `reader-auth:course` | reader-auth:course: 7.93% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader-auth:topic` | reader-auth:topic: 15.46% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:course` | reference:course: 15.15% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:topic` | reference:topic: 22.02% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reference:lab` | reference:lab: 15.27% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 33× on b |
| `network` | `GET /logo.svg` | reader:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | reader:home: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js |
| `network` | `GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100` | reader:home: GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:course: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 42× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | reader:course: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js |
| `network` | `GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100` | reader:course: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 |
| `network` | `GET /_app/version.json` | reader:topic: new request on b: GET /_app/version.json |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:lab-step: GET /_app/immutable/chunks/{{hash}}.js requested 2× on a, 1× on b |
| `network` | `GET /_app/immutable/assets/8.{{hash}}.css` | reader:lab-step: new request on b: GET /_app/immutable/assets/8.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Context.{{hash}}.css` | reader:lab-step: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css |
| `network` | `GET /_app/version.json` | reader:lab-step: new request on b: GET /_app/version.json |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:search: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 42× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/14.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/14.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reader:search: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | reader:search: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js |
| `network` | `GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100` | reader:search: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | catalogue:home: GET /_app/immutable/chunks/{{hash}}.js requested 6× on a, 9× on b |
| `network` | `GET /global.css` | catalogue:home: request no longer made on b: GET /global.css |
| `network` | `GET /logo.svg` | catalogue:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | catalogue:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/2.{{hash}}.css` | catalogue:home: new request on b: GET /_app/immutable/assets/2.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | catalogue:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | catalogue:home: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | live:home: GET /_app/immutable/chunks/{{hash}}.js requested 9× on a, 13× on b |
| `network` | `GET /global.css` | live:home: request no longer made on b: GET /global.css |
| `network` | `GET /logo.svg` | live:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/2.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/2.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | live:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | live:home: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader-auth:course: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 42× on b |
| `network` | `GET /auth/callback/github?code=code-student` | reader-auth:course: request no longer made on b: GET /auth/callback/github?code=code-student |
| `network` | `POST /auth/signin/github?` | reader-auth:course: request no longer made on b: POST /auth/signin/github? |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reader-auth:course: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | reader-auth:course: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js |
| `network` | `GET /_app/version.json` | reader-auth:course: new request on b: GET /_app/version.json |
| `network` | `GET /api/auth/callback/github?code=code-student&state={{state}}` | reader-auth:course: new request on b: GET /api/auth/callback/github?code=code-student&state={{state}} |
| `network` | `POST /api/auth/sign-in/social` | reader-auth:course: new request on b: POST /api/auth/sign-in/social |
| `network` | `GET /course/localhost:8080` | reader-auth:course: GET /course/localhost:8080 cache-control changed: ∅ → no-store,private |
| `network` | `GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100` | reader-auth:course: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 |
| `network` | `GET /_app/version.json` | reader-auth:topic: new request on b: GET /_app/version.json |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:course: GET /_app/immutable/chunks/{{hash}}.js requested 34× on a, 43× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reference:course: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | reference:course: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reference:lab: GET /_app/immutable/chunks/{{hash}}.js requested 2× on a, 1× on b |
| `network` | `GET /_app/immutable/assets/8.{{hash}}.css` | reference:lab: new request on b: GET /_app/immutable/assets/8.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Context.{{hash}}.css` | reference:lab: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `catalogue:home` | catalogue:home: new console message on b |
| `console` | `reader-auth:course` | reader-auth:course: new console message on b |
| `console` | `reader-auth:course` | reader-auth:course: new console message on b |
| `console` | `reader-auth:course` | reader-auth:course: new console message on b |
| `console` | `reader-auth:course` | reader-auth:course: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `headers` | `catalogue:home/link` | catalogue:home: header dropped on b: link (was <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush) |
| `headers` | `live:home/link` | live:home: header dropped on b: link (was <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) |
| `headers` | `reader-auth:sign-in/link` | reader-auth:sign-in: header dropped on b: link (was <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SigninWithGithub.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/6.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) |
| `headers` | `reader-auth:course/cache-control` | reader-auth:course: header added on b: cache-control: no-store,private |
| `headers` | `reader-auth:course/link` | reader-auth:course: header dropped on b: link (was <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) |
| `headers` | `reference:course/link` | reference:course: header dropped on b: link (was <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) |
| `logs` | `reader/event` | reader: new log field on b: event |
| `logs` | `reader/loadError` | reader: new log field on b: loadError |
| `logs` | `reader/slow` | reader: new log field on b: slow |
| `logs` | `catalogue/event` | catalogue: new log field on b: event |
| `logs` | `catalogue/loadError` | catalogue: new log field on b: loadError |
| `logs` | `catalogue/slow` | catalogue: new log field on b: slow |
| `logs` | `live/event` | live: new log field on b: event |
| `logs` | `live/loadError` | live: new log field on b: loadError |
| `logs` | `live/slow` | live: new log field on b: slow |
| `logs` | `time/event` | time: new log field on b: event |
| `logs` | `time/loadError` | time: new log field on b: loadError |
| `logs` | `time/slow` | time: new log field on b: slow |
| `logs` | `reader-auth/consoleMethod` | reader-auth: new log field on b: consoleMethod |
| `logs` | `reader-auth/event` | reader-auth: new log field on b: event |
| `logs` | `reader-auth/loadError` | reader-auth: new log field on b: loadError |
| `logs` | `reader-auth/slow` | reader-auth: new log field on b: slow |
| `timing` | `student-signs-in` | journey student-signs-in slower on b: median 3986ms → 23032ms (+478%, p=0.012, n=5/5; smallest slowdown 5/5 runs could detect: about 74%) |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:course` | reader:course: keyboard order changed (11 stops on a, 7 on b) |
| `focus` | `reader:topic` | reader:topic: keyboard order changed (12 stops on a, 11 on b) |
| `focus` | `reader:lab-step` | reader:lab-step: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step-2` | reader:lab-step-2: keyboard order changed (6 stops on a, 11 on b) |
| `focus` | `reader:search` | reader:search: keyboard order changed (6 stops on a, 12 on b) |
| `focus` | `reader:search-results` | reader:search-results: keyboard order changed (6 stops on a, 12 on b) |
| `focus` | `catalogue:home` | catalogue:home: keyboard order changed (6 stops on a, 12 on b) |
| `focus` | `live:home` | live:home: keyboard order changed (5 stops on a, 5 on b) |
| `focus` | `reader-auth:course` | reader-auth:course: keyboard order changed (11 stops on a, 7 on b) |
| `focus` | `reader-auth:topic` | reader-auth:topic: keyboard order changed (12 stops on a, 11 on b) |
| `focus` | `reference:course` | reference:course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:topic` | reference:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:lab` | reference:lab: keyboard order changed (12 stops on a, 10 on b) |
| `persistence` | `student-signs-in/app_errors` | student-signs-in: POST app_errors — 20 row(s) on a, 4 on b |
| `persistence` | `student-signs-in/tutors-connect-latest` | student-signs-in: POST tutors-connect-latest — 4 row(s) on a, 2 on b |
| `image-manifest` | `reader/base` | reader: built FROM a different base image (lowest layer 34467cc93912 → e58989146fce) |
| `image-manifest` | `reader/layers` | reader: 9 layer(s) on a, 10 on b |
| `image-manifest` | `reader/size` | reader: image size 251.5 MB → 309.2 MB (+23%) |
| `image-manifest` | `reader/label/org.opencontainers.image.vendor` | reader: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `reader/@asamuzakjp/css-color` | reader: package added: @asamuzakjp/css-color@7.1.5 |
| `sbom` | `reader/@asamuzakjp/dom-selector` | reader: package added: @asamuzakjp/dom-selector@9.2.4 |
| `sbom` | `reader/@auth/core` | reader: package removed: @auth/core@0.41.3 |
| `sbom` | `reader/@bramus/specificity` | reader: package added: @bramus/specificity@2.4.2 |
| `sbom` | `reader/@csstools/color-helpers` | reader: package added: @csstools/color-helpers@6.1.2 |
| `sbom` | `reader/@csstools/css-calc` | reader: package added: @csstools/css-calc@3.4.3 |
| `sbom` | `reader/@csstools/css-color-parser` | reader: package added: @csstools/css-color-parser@4.2.6 |
| `sbom` | `reader/@csstools/css-parser-algorithms` | reader: package added: @csstools/css-parser-algorithms@4.0.2 |
| `sbom` | `reader/@csstools/css-syntax-patches-for-csstree` | reader: package added: @csstools/css-syntax-patches-for-csstree@1.1.15 |
| `sbom` | `reader/@csstools/css-tokenizer` | reader: package added: @csstools/css-tokenizer@4.0.2 |
| `sbom` | `reader/@exodus/bytes` | reader: package added: @exodus/bytes@1.16.0 |
| `sbom` | `reader/@noble/hashes` | reader: package added: @noble/hashes@2.4.0 |
| `sbom` | `reader/@opentelemetry/api` | reader: package added: @opentelemetry/api@1.9.1 |
| `sbom` | `reader/@panva/hkdf` | reader: package removed: @panva/hkdf@1.2.1 |
| `sbom` | `reader/@prometheus-io/client` | reader: package added: @prometheus-io/client@0.16.1 |
| `sbom` | `reader/bidi-js` | reader: package added: bidi-js@1.1.0 |
| `sbom` | `reader/bintrees` | reader: package added: bintrees@1.0.2 |
| `sbom` | `reader/css-tree` | reader: package added: css-tree@3.2.1 |
| `sbom` | `reader/data-urls` | reader: package added: data-urls@8.0.0 |
| `sbom` | `reader/decimal.js` | reader: package added: decimal.js@10.6.0 |
| `sbom` | `reader/dompurify` | reader: package bumped: dompurify 3.4.14 → 3.4.16 |
| `sbom` | `reader/entities` | reader: package added: entities@8.0.0 |
| `sbom` | `reader/html-encoding-sniffer` | reader: package added: html-encoding-sniffer@7.0.0 |
| `sbom` | `reader/is-potential-custom-element-name` | reader: package added: is-potential-custom-element-name@1.0.1 |
| `sbom` | `reader/isomorphic-dompurify` | reader: package added: isomorphic-dompurify@4.5.0 |
| `sbom` | `reader/jose` | reader: package removed: jose@6.2.4 |
| `sbom` | `reader/jsdom` | reader: package added: jsdom@30.1.2 |
| `sbom` | `reader/jsx-runtime` | reader: package removed: jsx-runtime@1.0.0 |
| `sbom` | `reader/libpcre2-8-0` | reader: package bumped: libpcre2-8-0 10.42-1+deb12u1 → 10.42-1+deb12u2 |
| `sbom` | `reader/mdn-data` | reader: package added: mdn-data@2.27.1 |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `reader/oauth4webapi` | reader: package removed: oauth4webapi@3.8.6 |
| `sbom` | `reader/parse5` | reader: package added: parse5@8.0.1 |
| `sbom` | `reader/perl-base` | reader: package bumped: perl-base 5.36.0-7+deb12u3 → 5.36.0-7+deb12u4 |
| `sbom` | `reader/preact` | reader: package removed: preact@10.24.3 |
| `sbom` | `reader/preact-compat` | reader: package removed: preact-compat@4.0.0 |
| `sbom` | `reader/preact-debug` | reader: package removed: preact-debug@1.0.0 |
| `sbom` | `reader/preact-devtools` | reader: package removed: preact-devtools@1.0.0 |
| `sbom` | `reader/preact-hooks` | reader: package removed: preact-hooks@0.1.0 |
| `sbom` | `reader/preact-render-to-string` | reader: package removed: preact-render-to-string@6.5.11 |
| `sbom` | `reader/punycode` | reader: package added: punycode@2.3.1 |
| `sbom` | `reader/require-from-string` | reader: package added: require-from-string@2.0.2 |
| `sbom` | `reader/saxes` | reader: package added: saxes@6.0.0 |
| `sbom` | `reader/source-map-js` | reader: package added: source-map-js@1.2.2 |
| `sbom` | `reader/tar` | reader: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `reader/tdigest` | reader: package added: tdigest@0.1.3 |
| `sbom` | `reader/test-utils` | reader: package removed: test-utils@0.1.0 |
| `sbom` | `reader/tldts` | reader: package added: tldts@7.4.10 |
| `sbom` | `reader/tldts-core` | reader: package added: tldts-core@7.4.10 |
| `sbom` | `reader/tough-cookie` | reader: package added: tough-cookie@6.0.2 |
| `sbom` | `reader/tr46` | reader: package added: tr46@7.0.0 |
| `sbom` | `reader/tutors-reader` | reader: package bumped: tutors-reader 16.2.2 → 17.0.0 |
| `sbom` | `reader/tzdata` | reader: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `reader/undici` | reader: package added: undici@8.11.2 |
| `sbom` | `reader/w3c-xmlserializer` | reader: package added: w3c-xmlserializer@6.0.0 |
| `sbom` | `reader/webidl-conversions` | reader: package added: webidl-conversions@8.0.1 |
| `sbom` | `reader/whatwg-mimetype` | reader: package added: whatwg-mimetype@5.0.0 |
| `sbom` | `reader/whatwg-url` | reader: package added: whatwg-url@17.2.0 |
| `sbom` | `reader/xml-name-validator` | reader: package added: xml-name-validator@5.0.0 |
| `sbom` | `reader/xmlchars` | reader: package added: xmlchars@2.2.0 |
| `image-manifest` | `catalogue/base` | catalogue: built FROM a different base image (lowest layer 34467cc93912 → e58989146fce) |
| `image-manifest` | `catalogue/layers` | catalogue: 9 layer(s) on a, 10 on b |
| `image-manifest` | `catalogue/size` | catalogue: image size 230.8 MB → 274.2 MB (+19%) |
| `image-manifest` | `catalogue/label/org.opencontainers.image.vendor` | catalogue: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `catalogue/@asamuzakjp/css-color` | catalogue: package added: @asamuzakjp/css-color@7.1.5 |
| `sbom` | `catalogue/@asamuzakjp/dom-selector` | catalogue: package added: @asamuzakjp/dom-selector@9.2.4 |
| `sbom` | `catalogue/@bramus/specificity` | catalogue: package added: @bramus/specificity@2.4.2 |
| `sbom` | `catalogue/@csstools/color-helpers` | catalogue: package added: @csstools/color-helpers@6.1.2 |
| `sbom` | `catalogue/@csstools/css-calc` | catalogue: package added: @csstools/css-calc@3.4.3 |
| `sbom` | `catalogue/@csstools/css-color-parser` | catalogue: package added: @csstools/css-color-parser@4.2.6 |
| `sbom` | `catalogue/@csstools/css-parser-algorithms` | catalogue: package added: @csstools/css-parser-algorithms@4.0.2 |
| `sbom` | `catalogue/@csstools/css-syntax-patches-for-csstree` | catalogue: package added: @csstools/css-syntax-patches-for-csstree@1.1.15 |
| `sbom` | `catalogue/@csstools/css-tokenizer` | catalogue: package added: @csstools/css-tokenizer@4.0.2 |
| `sbom` | `catalogue/@exodus/bytes` | catalogue: package added: @exodus/bytes@1.16.0 |
| `sbom` | `catalogue/@noble/hashes` | catalogue: package added: @noble/hashes@2.4.0 |
| `sbom` | `catalogue/@opentelemetry/api` | catalogue: package added: @opentelemetry/api@1.9.1 |
| `sbom` | `catalogue/@prometheus-io/client` | catalogue: package added: @prometheus-io/client@0.16.1 |
| `sbom` | `catalogue/@types/trusted-types` | catalogue: package added: @types/trusted-types@2.0.7 |
| `sbom` | `catalogue/bidi-js` | catalogue: package added: bidi-js@1.1.0 |
| `sbom` | `catalogue/bintrees` | catalogue: package added: bintrees@1.0.2 |
| `sbom` | `catalogue/css-tree` | catalogue: package added: css-tree@3.2.1 |
| `sbom` | `catalogue/data-urls` | catalogue: package added: data-urls@8.0.0 |
| `sbom` | `catalogue/decimal.js` | catalogue: package added: decimal.js@10.6.0 |
| `sbom` | `catalogue/dompurify` | catalogue: package added: dompurify@3.4.16 |
| `sbom` | `catalogue/entities` | catalogue: package added: entities@8.0.0 |
| `sbom` | `catalogue/html-encoding-sniffer` | catalogue: package added: html-encoding-sniffer@7.0.0 |
| `sbom` | `catalogue/is-potential-custom-element-name` | catalogue: package added: is-potential-custom-element-name@1.0.1 |
| `sbom` | `catalogue/isomorphic-dompurify` | catalogue: package added: isomorphic-dompurify@4.5.0 |
| `sbom` | `catalogue/jsdom` | catalogue: package added: jsdom@30.1.2 |
| `sbom` | `catalogue/libpcre2-8-0` | catalogue: package bumped: libpcre2-8-0 10.42-1+deb12u1 → 10.42-1+deb12u2 |
| `sbom` | `catalogue/mdn-data` | catalogue: package added: mdn-data@2.27.1 |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `catalogue/parse5` | catalogue: package added: parse5@8.0.1 |
| `sbom` | `catalogue/perl-base` | catalogue: package bumped: perl-base 5.36.0-7+deb12u3 → 5.36.0-7+deb12u4 |
| `sbom` | `catalogue/punycode` | catalogue: package added: punycode@2.3.1 |
| `sbom` | `catalogue/require-from-string` | catalogue: package added: require-from-string@2.0.2 |
| `sbom` | `catalogue/saxes` | catalogue: package added: saxes@6.0.0 |
| `sbom` | `catalogue/source-map-js` | catalogue: package added: source-map-js@1.2.2 |
| `sbom` | `catalogue/tar` | catalogue: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `catalogue/tdigest` | catalogue: package added: tdigest@0.1.3 |
| `sbom` | `catalogue/tldts` | catalogue: package added: tldts@7.4.10 |
| `sbom` | `catalogue/tldts-core` | catalogue: package added: tldts-core@7.4.10 |
| `sbom` | `catalogue/tough-cookie` | catalogue: package added: tough-cookie@6.0.2 |
| `sbom` | `catalogue/tr46` | catalogue: package added: tr46@7.0.0 |
| `sbom` | `catalogue/tutors-catalogue` | catalogue: package bumped: tutors-catalogue 16.2.2 → 17.0.0 |
| `sbom` | `catalogue/tzdata` | catalogue: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `catalogue/undici` | catalogue: package added: undici@8.11.2 |
| `sbom` | `catalogue/w3c-xmlserializer` | catalogue: package added: w3c-xmlserializer@6.0.0 |
| `sbom` | `catalogue/webidl-conversions` | catalogue: package added: webidl-conversions@8.0.1 |
| `sbom` | `catalogue/whatwg-mimetype` | catalogue: package added: whatwg-mimetype@5.0.0 |
| `sbom` | `catalogue/whatwg-url` | catalogue: package added: whatwg-url@17.2.0 |
| `sbom` | `catalogue/xml-name-validator` | catalogue: package added: xml-name-validator@5.0.0 |
| `sbom` | `catalogue/xmlchars` | catalogue: package added: xmlchars@2.2.0 |
| `image-manifest` | `live/base` | live: built FROM a different base image (lowest layer 34467cc93912 → e58989146fce) |
| `image-manifest` | `live/layers` | live: 9 layer(s) on a, 10 on b |
| `image-manifest` | `live/size` | live: image size 230.8 MB → 274.5 MB (+19%) |
| `image-manifest` | `live/label/org.opencontainers.image.vendor` | live: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `live/@asamuzakjp/css-color` | live: package added: @asamuzakjp/css-color@7.1.5 |
| `sbom` | `live/@asamuzakjp/dom-selector` | live: package added: @asamuzakjp/dom-selector@9.2.4 |
| `sbom` | `live/@bramus/specificity` | live: package added: @bramus/specificity@2.4.2 |
| `sbom` | `live/@csstools/color-helpers` | live: package added: @csstools/color-helpers@6.1.2 |
| `sbom` | `live/@csstools/css-calc` | live: package added: @csstools/css-calc@3.4.3 |
| `sbom` | `live/@csstools/css-color-parser` | live: package added: @csstools/css-color-parser@4.2.6 |
| `sbom` | `live/@csstools/css-parser-algorithms` | live: package added: @csstools/css-parser-algorithms@4.0.2 |
| `sbom` | `live/@csstools/css-syntax-patches-for-csstree` | live: package added: @csstools/css-syntax-patches-for-csstree@1.1.15 |
| `sbom` | `live/@csstools/css-tokenizer` | live: package added: @csstools/css-tokenizer@4.0.2 |
| `sbom` | `live/@exodus/bytes` | live: package added: @exodus/bytes@1.16.0 |
| `sbom` | `live/@noble/hashes` | live: package added: @noble/hashes@2.4.0 |
| `sbom` | `live/@opentelemetry/api` | live: package added: @opentelemetry/api@1.9.1 |
| `sbom` | `live/@prometheus-io/client` | live: package added: @prometheus-io/client@0.16.1 |
| `sbom` | `live/@types/trusted-types` | live: package added: @types/trusted-types@2.0.7 |
| `sbom` | `live/bidi-js` | live: package added: bidi-js@1.1.0 |
| `sbom` | `live/bintrees` | live: package added: bintrees@1.0.2 |
| `sbom` | `live/css-tree` | live: package added: css-tree@3.2.1 |
| `sbom` | `live/data-urls` | live: package added: data-urls@8.0.0 |
| `sbom` | `live/decimal.js` | live: package added: decimal.js@10.6.0 |
| `sbom` | `live/dompurify` | live: package added: dompurify@3.4.16 |
| `sbom` | `live/entities` | live: package added: entities@8.0.0 |
| `sbom` | `live/html-encoding-sniffer` | live: package added: html-encoding-sniffer@7.0.0 |
| `sbom` | `live/is-potential-custom-element-name` | live: package added: is-potential-custom-element-name@1.0.1 |
| `sbom` | `live/isomorphic-dompurify` | live: package added: isomorphic-dompurify@4.5.0 |
| `sbom` | `live/jsdom` | live: package added: jsdom@30.1.2 |
| `sbom` | `live/libpcre2-8-0` | live: package bumped: libpcre2-8-0 10.42-1+deb12u1 → 10.42-1+deb12u2 |
| `sbom` | `live/mdn-data` | live: package added: mdn-data@2.27.1 |
| `sbom` | `live/node` | live: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `live/parse5` | live: package added: parse5@8.0.1 |
| `sbom` | `live/perl-base` | live: package bumped: perl-base 5.36.0-7+deb12u3 → 5.36.0-7+deb12u4 |
| `sbom` | `live/punycode` | live: package added: punycode@2.3.1 |
| `sbom` | `live/require-from-string` | live: package added: require-from-string@2.0.2 |
| `sbom` | `live/saxes` | live: package added: saxes@6.0.0 |
| `sbom` | `live/source-map-js` | live: package added: source-map-js@1.2.2 |
| `sbom` | `live/tar` | live: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `live/tdigest` | live: package added: tdigest@0.1.3 |
| `sbom` | `live/tldts` | live: package added: tldts@7.4.10 |
| `sbom` | `live/tldts-core` | live: package added: tldts-core@7.4.10 |
| `sbom` | `live/tough-cookie` | live: package added: tough-cookie@6.0.2 |
| `sbom` | `live/tr46` | live: package added: tr46@7.0.0 |
| `sbom` | `live/tutors-live` | live: package bumped: tutors-live 16.2.2 → 17.0.0 |
| `sbom` | `live/tzdata` | live: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `live/undici` | live: package added: undici@8.11.2 |
| `sbom` | `live/w3c-xmlserializer` | live: package added: w3c-xmlserializer@6.0.0 |
| `sbom` | `live/webidl-conversions` | live: package added: webidl-conversions@8.0.1 |
| `sbom` | `live/whatwg-mimetype` | live: package added: whatwg-mimetype@5.0.0 |
| `sbom` | `live/whatwg-url` | live: package added: whatwg-url@17.2.0 |
| `sbom` | `live/xml-name-validator` | live: package added: xml-name-validator@5.0.0 |
| `sbom` | `live/xmlchars` | live: package added: xmlchars@2.2.0 |
| `image-manifest` | `time/base` | time: built FROM a different base image (lowest layer 34467cc93912 → e58989146fce) |
| `image-manifest` | `time/layers` | time: 9 layer(s) on a, 10 on b |
| `image-manifest` | `time/size` | time: image size 232.1 MB → 285.2 MB (+23%) |
| `image-manifest` | `time/label/org.opencontainers.image.vendor` | time: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `time/@asamuzakjp/css-color` | time: package added: @asamuzakjp/css-color@7.1.5 |
| `sbom` | `time/@asamuzakjp/dom-selector` | time: package added: @asamuzakjp/dom-selector@9.2.4 |
| `sbom` | `time/@bramus/specificity` | time: package added: @bramus/specificity@2.4.2 |
| `sbom` | `time/@csstools/color-helpers` | time: package added: @csstools/color-helpers@6.1.2 |
| `sbom` | `time/@csstools/css-calc` | time: package added: @csstools/css-calc@3.4.3 |
| `sbom` | `time/@csstools/css-color-parser` | time: package added: @csstools/css-color-parser@4.2.6 |
| `sbom` | `time/@csstools/css-parser-algorithms` | time: package added: @csstools/css-parser-algorithms@4.0.2 |
| `sbom` | `time/@csstools/css-syntax-patches-for-csstree` | time: package added: @csstools/css-syntax-patches-for-csstree@1.1.15 |
| `sbom` | `time/@csstools/css-tokenizer` | time: package added: @csstools/css-tokenizer@4.0.2 |
| `sbom` | `time/@exodus/bytes` | time: package added: @exodus/bytes@1.16.0 |
| `sbom` | `time/@noble/hashes` | time: package added: @noble/hashes@2.4.0 |
| `sbom` | `time/@prometheus-io/client` | time: package added: @prometheus-io/client@0.16.1 |
| `sbom` | `time/@supabase/auth-js` | time: package bumped: @supabase/auth-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/functions-js` | time: package bumped: @supabase/functions-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/postgrest-js` | time: package bumped: @supabase/postgrest-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/realtime-js` | time: package bumped: @supabase/realtime-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/storage-js` | time: package bumped: @supabase/storage-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/supabase-js` | time: package bumped: @supabase/supabase-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@types/trusted-types` | time: package added: @types/trusted-types@2.0.7 |
| `sbom` | `time/bidi-js` | time: package added: bidi-js@1.1.0 |
| `sbom` | `time/bintrees` | time: package added: bintrees@1.0.2 |
| `sbom` | `time/css-tree` | time: package added: css-tree@3.2.1 |
| `sbom` | `time/data-urls` | time: package added: data-urls@8.0.0 |
| `sbom` | `time/decimal.js` | time: package added: decimal.js@10.6.0 |
| `sbom` | `time/dompurify` | time: package added: dompurify@3.4.16 |
| `sbom` | `time/entities` | time: package added: entities@8.0.0 |
| `sbom` | `time/html-encoding-sniffer` | time: package added: html-encoding-sniffer@7.0.0 |
| `sbom` | `time/is-potential-custom-element-name` | time: package added: is-potential-custom-element-name@1.0.1 |
| `sbom` | `time/isomorphic-dompurify` | time: package added: isomorphic-dompurify@4.5.0 |
| `sbom` | `time/jsdom` | time: package added: jsdom@30.1.2 |
| `sbom` | `time/libpcre2-8-0` | time: package bumped: libpcre2-8-0 10.42-1+deb12u1 → 10.42-1+deb12u2 |
| `sbom` | `time/mdn-data` | time: package added: mdn-data@2.27.1 |
| `sbom` | `time/node` | time: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `time/parse5` | time: package added: parse5@8.0.1 |
| `sbom` | `time/perl-base` | time: package bumped: perl-base 5.36.0-7+deb12u3 → 5.36.0-7+deb12u4 |
| `sbom` | `time/punycode` | time: package added: punycode@2.3.1 |
| `sbom` | `time/require-from-string` | time: package added: require-from-string@2.0.2 |
| `sbom` | `time/saxes` | time: package added: saxes@6.0.0 |
| `sbom` | `time/source-map-js` | time: package added: source-map-js@1.2.2 |
| `sbom` | `time/tar` | time: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `time/tdigest` | time: package added: tdigest@0.1.3 |
| `sbom` | `time/tldts` | time: package added: tldts@7.4.10 |
| `sbom` | `time/tldts-core` | time: package added: tldts-core@7.4.10 |
| `sbom` | `time/tough-cookie` | time: package added: tough-cookie@6.0.2 |
| `sbom` | `time/tr46` | time: package added: tr46@7.0.0 |
| `sbom` | `time/tutors-time` | time: package bumped: tutors-time 16.2.2 → 17.0.0 |
| `sbom` | `time/tzdata` | time: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `time/undici` | time: package added: undici@8.11.2 |
| `sbom` | `time/w3c-xmlserializer` | time: package added: w3c-xmlserializer@6.0.0 |
| `sbom` | `time/webidl-conversions` | time: package added: webidl-conversions@8.0.1 |
| `sbom` | `time/whatwg-mimetype` | time: package added: whatwg-mimetype@5.0.0 |
| `sbom` | `time/whatwg-url` | time: package added: whatwg-url@17.2.0 |
| `sbom` | `time/xml-name-validator` | time: package added: xml-name-validator@5.0.0 |
| `sbom` | `time/xmlchars` | time: package added: xmlchars@2.2.0 |

<details><summary>Detail of 46 difference(s)</summary>

`dom` `reference-course-reads`

```
locator.waitFor: Error: strict mode violation: getByRole('article') resolved to 2 elements:
```

`dom` `reader-auth:course`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Runway Fixture Course" [level=2]
-    - paragraph: Tutors CI
-    - navigation:
-      - 'button "Sentiment: neutral. Open menu to change."'
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Profile menu":
-        - img "Harness Student"
-      - button "Open course tree"
+    - heading "Runway Fixture Course" [level=1]:
+      - link "Runway Fixture Course":
+        - /url: /course/localhost:8080
+    - text: Tutors CI
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Profile menu":
+      - img "Harness Student"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
+    - paragraph: Activity
+    - link "My time":
+      - /url: /time/localhost:8080
+    - link "Live now":
+      - /url: https://live.tutors.dev/localhost:8080
+    - button "View Online 1"
 - main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture
… (1345 more characters in report.json)
```

`dom` `reader-auth:course`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reader-auth:topic`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Topic 1" [level=2]
-    - paragraph: Runway Fixture Course
-    - navigation:
-      - 'button "Sentiment: neutral. Open menu to change."'
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Profile menu":
-        - img "Harness Student"
-      - button "Open course tree"
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - text: Tutors CI
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Profile menu":
+      - img "Harness Student"
+- complementary "Course navigation":
+  - navigation:
+    - article:
+      - heading "Topic 1" [level=2]
+      - paragraph: Summary of this topic (this line appears on the topic card).
+    - link "← Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
+    - paragraph: Activity
+    - link "My time":
+      - /url: /time/localhost:8080
+    - link "Live now":
+      - /url: https://live.tutors.dev/localhost:8080
+    - button "View Online 1"
 - main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        -
… (2232 more characters in report.json)
```

`dom` `reader-auth:topic`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reference:course`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
     - img "Reference Course"
-    - heading "Reference Course" [level=2]
-    - paragraph: A reference course containing all supported learning objects
-    - navigation:
-      - button "View Calendar for this course":
-        - button "Current Week Control Flow (if statements)"
-      - link "A version of this course for LLMs":
-        - /url: /llm/reference-course
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
-- main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /course/tutors-reference-manual
-        - listitem:
-          - link "Reference Cour...":
-            - /url: /course/reference-course
-    - link "Edit this course (opens in a new Window)":
+    - heading "Reference Course" [level=1]:
+      - link "Reference Course":
+        - /url: /course/reference-course
+    - text: A reference course containing all supported learning objects
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:

… (5726 more characters in report.json)
```

`dom` `reference:course`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reference:topic`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - img "Reference"
-    - heading "Reference" [level=2]
-    - paragraph: Reference Course
-    - navigation:
-      - button "View Calendar for this course":
-        - button "Current Week Control Flow (if statements)"
-      - link "A version of this course for LLMs":
-        - /url: /llm/reference-course
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
-- main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /course/tutors-reference-manual
-        - listitem:
-          - link "Reference Cour...":
-            - /url: /course/reference-course
-        - listitem:
-          - link "Reference":
-            - /url: /topic/reference-course/topic-07-reference
-    - link "Edit this course (opens in a new Window)":
+    - img "Reference Course"
+    - link "Reference Course":
+      - /url: /course/reference-course
+    - text: A reference course containing all supported learning objects
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary
… (2999 more characters in report.json)
```

`dom` `reference:topic`

```
       - strong: markdown
       - text: styles
-  - link "Tutorial 2 This is a tutorial":
-    - /url: /tutorial/reference-course/topic-07-reference/tutorial-1
-    - text: Tutorial 2
-    - figure:
+  - article:
+    - link "Tutorial 2 tutorial Tutorial 2":
+      - /url: /tutorial/reference-course/topic-07-reference/tutorial-1
+      - heading "Tutorial 2" [level=3]
+      - text: tutorial
       - img "Tutorial 2"
     - paragraph: This is a tutorial
-  - link "Tutorial 3 This is a tutorial":
-    - /url: /tutorial/reference-course/topic-07-reference/tutorial-2
-    - text: Tutorial 3
-    - figure:
+  - article:
+    - link "Tutorial 3 tutorial Tutorial 3":
+      - /url: /tutorial/reference-course/topic-07-reference/tutorial-2
+      - heading "Tutorial 3" [level=3]
+      - text: tutorial
       - img "Tutorial 3"
     - paragraph: This is a tutorial
-  - link "Lab-07-(md) A set of practical instructions or a walk-though":
-    - /url: /lab/reference-course/topic-07-reference/book-a
-    - text: Lab-07-(md)
-    - figure:
+  - article:
+    - link "Lab-07-(md) lab Lab-07-(md)":
+      - /url: /lab/reference-course/topic-07-reference/book-a
+      - heading "Lab-07-(md)" [level=3]
+      - text: lab
       - img "Lab-07-(md)"
     - paragraph: A set of practical instructions or a walk-though
-  - link "Note 3 This is an example of a note.":
-    - /url: /note/reference-course/topic-07-reference/note-1
-    - text: Note 3
-    - figure:
+  - article:
+    - link "Note 3 
… (3412 more characters in report.json)
```

`dom` `reference:topic`

```
     - paragraph: Tutors v:{{version}}
   - paragraph:
-    - paragraph:
-      - text: An
-      - link "Open Learning Web Toolkit":
-        - /url: /course/tutors-reference-manual
-      - text: ": Explore"
-      - link "What’s New in Tutors":
-        - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
   - link "South East Technological University":
     - /url: https://setu.ie
```

`dom` `reference:lab`

```
 - link "Skip to content":
   - /url: "#main-content"
-- banner
-- main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /course/tutors-reference-manual
-        - listitem:
-          - link "Reference Cour...":
-            - /url: /course/reference-course
-        - listitem:
-          - link "Reference":
-            - /url: /topic/reference-course/topic-07-reference
-        - listitem:
-          - link "Lab-07-(md)":
-            - /url: /lab/reference-course/topic-07-reference/book-a
-    - link "Edit this course (opens in a new Window)":
-      - /url: https://github.com/tutors-sdk/tutors-reference-course/blob/master/topic-07-reference/book-a
-    - link "Go to module Moodle page (opens in a new Window)":
-      - /url: https://moodle.wit.ie
-    - link "Go to module YouTube channel (opens in a new Window)":
-      - /url: https://www.youtube.com/playlist?list=PLMW4bgOfD3Dwi6FWirJ3AQtXZ-N_hV3Eo
-    - link "Piazza Q & A for this course (opens in a new Window)":
-      - /url: https://piazza.com/
-    - link "All talks in the course":
-      - /url: /wall/talk/reference-course
-    - link "All tutorials in the course":
-      - /url: /wall/tutorial/reference-course
-    - link "All notes in the course":
-      - /url: /wall/note/reference-
… (4113 more characters in report.json)
```

`dom` `reference:lab`

```
         - /url: "#objectives"
     - paragraph: A set of practical instructions or a walk-though
-  - heading "Reference" [level=3]
-  - figure:
-    - img "Lab-07-(md)"
-  - button "Expand all"
-  - tree "Tree View":
-    - treeitem "Lecture 8 (Marp)" [level=1]:
-      - link "Lecture 8 (Marp)":
-        - /url: /talk/reference-course/topic-07-reference/talk-1
-    - treeitem "Tutorial 2" [level=1]:
-      - link "Tutorial 2":
-        - /url: /tutorial/reference-course/topic-07-reference/tutorial-1
-    - treeitem "Tutorial 3" [level=1]:
-      - link "Tutorial 3":
-        - /url: /tutorial/reference-course/topic-07-reference/tutorial-2
-    - 'treeitem "Show or hide contents: Lab-07-(md) Lab-07-(md)" [level=1]':
-      - 'button "Show or hide contents: Lab-07-(md)"'
-      - link "Lab-07-(md)":
-        - /url: /lab/reference-course/topic-07-reference/book-a
-    - treeitem "Note 3" [level=1]:
-      - link "Note 3":
-        - /url: /note/reference-course/topic-07-reference/note-1
-    - treeitem "Note 4" [level=1]:
-      - link "Note 4":
-        - /url: /note/reference-course/topic-07-reference/note-2
-    - treeitem "Web Site 4" [level=1]:
-      - link "Web Site 4":
-        - /url: https://tutors.dev
-    - treeitem "Github Repo 1" [level=1]:
-      - link "Github Repo 1":
-        - /url: https://github.com/tutors-sdk/tutors
-    - treeitem "Resource 3" [level=1]:
-      - link "Resource 3":
-        - /url: {{course}}/topic-07-reference/archive/archive.zip
-    
… (1172 more characters in report.json)
```

`screenshot` `reader-auth:sign-in`

```
diff image: diff/student-signs-in-1/reader-auth_sign-in.png
```

`screenshot` `reader-auth:course`

```
diff image: diff/student-signs-in-1/reader-auth_course.png
```

`screenshot` `reader-auth:topic`

```
diff image: diff/student-signs-in-1/reader-auth_topic.png
```

`screenshot` `reference:course`

```
diff image: diff/reference-course-reads-1/reference_course.png
```

`screenshot` `reference:topic`

```
diff image: diff/reference-course-reads-1/reference_topic.png
```

`screenshot` `reference:lab`

```
diff image: diff/reference-course-reads-1/reference_lab.png
```

`console` `catalogue:home`

```
error: {"app":"tutors-catalogue","environment":"production","error":"Cannot read properties of undefined (reading 'from')","stack":"TypeError: Cannot read properties of undefined (reading 'from')\n    at Object.getCatalogue ({{origin}}/_app/immutable/chunks/2lYorbfj.js:69:102918)\n    at V ({{origin}}/_app/immutable/nodes/2.NAkx_ofm.js:1:484)\n    at Wn ({{origin}}/_app/immutable/chunks/XgCIYxIE.js:2:24206)","timestamp":"2026-09-16T09:05:00.000Z","level":"error","message":"Error fetching courses:"}
```

`console` `catalogue:home`

```
error: {"app":"tutors-catalogue","environment":"production","error":"Cannot read properties of undefined (reading 'from')","stack":"TypeError: Cannot read properties of undefined (reading 'from')\n    at Object.getStudentCount ({{origin}}/_app/immutable/chunks/2lYorbfj.js:69:103346)\n    at {{origin}}/_app/immutable/nodes/2.NAkx_ofm.js:1:5193\n    at Cr ({{origin}}/_app/immutable/chunks/Cv2zGAZD.js:1:23871)\n    at {{origin}}/_app/immutable/chunks/Cv2zGAZD.js:2:2704\n    at mr ({{origin}}/_app/immutable/chunks/Cv2zGAZD.js:1:21611)\n    at vr ({{origin}}/_app/immutable/chunks/Cv2zGAZD.js:1:22749)\n    at Xt ({{origin}}/_app/immutable/chunks/Cv2zGAZD.js:1:12091)\n    at #_ ({{origin}}/_app/immutable/chunks/Cv2zGAZD.js:1:9277)\n    at e.flush ({{origin}}/_app/immutable/chunks/Cv2zGAZD.js:1:10794)\n    at Array.<anonymous> ({{origin}}/_app/immutable/chunks/Cv2zGAZD.js:1:11554)","timestamp":"2026-09-16T09:05:00.000Z","level":"error","message":"Error fetching course count:"}
```

… and 26 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | holds |

### Informing (81; 81 unclaimed): reported, never gates

19 of 27 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 15e3aa22476d (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on e9f2764654cb (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on 52740e55cfa7 (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on d0a9f4a2f462 (production too) | no date set | unclaimed |
| `timing-tolerance` | `student-signs-in` | journey student-signs-in slower on b beyond the 10% tolerance: 3986ms → 23032ms (+478%, p=0.012, n=5/5 runs; smallest detectable about 74%); timing fails it too (its floor is 20%) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 120 → 173 immutable requests (JS 115 → 142, CSS 5 → 31), 1.5 MB → 1.6 MB; 33 network and 2 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 12 → 19 immutable requests (JS 11 → 15, CSS 1 → 4), 499 KB → 529 KB; 5 network and 1 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 15 → 24 immutable requests (JS 14 → 19, CSS 1 → 5), 510 KB → 540 KB; 6 network and 1 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 66 → 96 immutable requests (JS 62 → 83, CSS 4 → 13), 742 KB → 1.0 MB; 15 network and 2 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 46 → 66 immutable requests (JS 44 → 53, CSS 2 → 13), 587 KB → 626 KB; 14 network and 1 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/Card.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/Composite.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/Icon.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/StudentCard.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/entry/payload.{{hash}}.js` | replay:topic-02: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 39× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:talk-01: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/Context.{{hash}}.css` | replay:talk-01: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/Icon.{{hash}}.css` | replay:talk-01: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | replay:talk-01: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/StudentCard.{{hash}}.css` | replay:talk-01: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | replay:talk-01: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/entry/payload.{{hash}}.js` | replay:talk-01: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100` | replay:talk-01: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 30× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/Context.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/Icon.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/StudentCard.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | replay:note-01: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/entry/payload.{{hash}}.js` | replay:note-01: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:note-01 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 30× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/Context.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/Icon.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/StudentCard.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | replay:note-02: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/entry/payload.{{hash}}.js` | replay:note-02: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 31× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/1.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/8.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/8.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/Context.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/Icon.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/StudentCard.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/entry/payload.{{hash}}.js` | replay:lab-02-step-03: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/chunks/{{hash}}.js` | replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/1.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/Card.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/Composite.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/Icon.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/StudentCard.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | replay:missing-topic: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/entry/payload.{{hash}}.js` | replay:missing-topic: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100` | replay:missing-topic: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048 | no date set | unclaimed |
| `replay` | `replay:topic-02/link` | replay:topic-02: header dropped on b: link (was <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/17.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) | no date set | unclaimed |
| `replay` | `replay:talk-01/link` | replay:talk-01: header dropped on b: link (was <../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/15.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) | no date set | unclaimed |
| `replay` | `replay:note-01/link` | replay:note-01: header dropped on b: link (was <../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) | no date set | unclaimed |
| `replay` | `replay:note-02/link` | replay:note-02: header dropped on b: link (was <../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03/link` | replay:lab-02-step-03: header dropped on b: link (was <../../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/nodes/8.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) | no date set | unclaimed |
| `replay` | `replay:missing-topic/link` | replay:missing-topic: header dropped on b: link (was <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/17.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush) | no date set | unclaimed |

### Claimed differences (737)

| artefact | scope | claimed by |
|---|---|---|
| `dom` | `reader:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:course` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:course` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:topic` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:topic` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:lab-step` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:lab-step` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:lab-step-2` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:lab-step-2` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:search` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:search` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:search-results` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `reader:search-results` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `dom` | `catalogue:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Catalogue: the catalogue is brought onto the Paper design system (#313, #331) |
| `dom` | `catalogue:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Catalogue: the catalogue is brought onto the Paper design system (#313, #331) |
| `dom` | `live:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Live: Live is brought onto the Paper design system and the reader's UX patterns (#313, #331) |
| `dom` | `live:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Live: Live is brought onto the Paper design system and the reader's UX patterns (#313, #331) |
| `dom` | `reader-auth:sign-in` | Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: sign-in runs on Better Auth (#417, #461, #463) |
| `screenshot` | `reader:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `screenshot` | `reader:course` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `screenshot` | `reader:topic` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `screenshot` | `reader:lab-step` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `screenshot` | `reader:lab-step-2` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `screenshot` | `reader:search` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `screenshot` | `reader:search-results` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Reader: Tutors is rebuilt on the Paper design system (Rules 0019-0058, #313) |
| `screenshot` | `catalogue:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Catalogue: the catalogue is brought onto the Paper design system (#313, #331) |
| `screenshot` | `live:home` | Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Live: Live is brought onto the Paper design system and the reader's UX patterns (#313, #331) |
| `network` | `GET /_app/immutable/assets/SigninWithGithub.{{hash}}.css` | Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the Auth.js routes under /auth are gone with the move to Better Auth (#463) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the Auth.js routes under /auth are gone with the move to Better Auth (#463) |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the Auth.js routes under /auth are gone with the move to Better Auth (#463) |
| `network` | `GET /_app/immutable/entry/payload.{{hash}}.js` | Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the Auth.js routes under /auth are gone with the move to Better Auth (#463) |
| `network` | `GET /auth/localhost:8080/__data.json?x-sveltekit-invalidated=10` | Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the Auth.js routes under /auth are gone with the move to Better Auth (#463) |
| `headers` | `reader:home/link` | Rule 0259: When the reader starts a session, the reader shall set the session cookie as HttpOnly, Secure and SameSite=Lax. — CHANGELOG 17.0.0 Reader: the session cookie is Better Auth's, set HttpOnly, Secure and SameSite=Lax (#417, #461) |
| `headers` | `reader:course/link` | Rule 0259: When the reader starts a session, the reader shall set the session cookie as HttpOnly, Secure and SameSite=Lax. — CHANGELOG 17.0.0 Reader: the session cookie is Better Auth's, set HttpOnly, Secure and SameSite=Lax (#417, #461) |
| `axe` | `reader-auth:sign-in` | Rule 0216: The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. — sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious) |
| `axe` | `reader-auth:sign-in` | Rule 0216: The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. — sign-in button text contrast (color-contrast, serious) fixed by #313; page title added (document-title, serious) |
| `axe` | `reference:course` | Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313 |
| `axe` | `reference:topic` | Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — navigation dialog trigger no longer wraps a control (nested-interactive, serious) fixed by #313 |
| `persistence` | `student-signs-in/get_count_learning_records` | Rule 0303: When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. — the per-table page-view requests are replaced by record_page_view (#475) |
| `persistence` | `student-signs-in/record_page_view` | Rule 0303: When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. — a page view is recorded against the learning object and the day's calendar in one request (#475) |
| `sbom` | `reader/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `reader/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `catalogue/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `live/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@isaacs/cliui` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@isaacs/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@isaacs/string-locale-compare` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/arborist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/config` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/git` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/installed-package-contents` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/map-workspaces` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/metavuln-calculator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/name-from-folder` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/promise-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/query` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/redact` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@npmcli/run-script` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@pkgjs/parseargs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/bundle` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/core` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/protobuf-specs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/sign` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/tuf` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@sigstore/verify` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@tufjs/canonical-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/@tufjs/models` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/abbrev` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/agent-base` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ansi-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ansi-styles` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/aproba` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/archy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/balanced-match` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/bin-links` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/binary-extensions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/brace-expansion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cacache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/chalk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/chownr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ci-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cidr-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cli-columns` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/color-convert` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/color-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/common-ancestor-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/corepack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cross-spawn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/cssesc` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/debug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/eastasianwidth` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/emoji-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/encoding` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/env-paths` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/err-code` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/exponential-backoff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/fastest-levenshtein` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/fdir` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/foreground-child` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/fs-minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/glob` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/graceful-fs` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/hosted-git-info` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/http-cache-semantics` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/http-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/https-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/iconv-lite` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ignore-walk` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/imurmurhash` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ini` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/init-package-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ip-address` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ip-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/is-cidr` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/is-fullwidth-code-point` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/isexe` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/jackspeak` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/json-parse-even-better-errors` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/json-stringify-nice` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/jsonparse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/just-diff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/just-diff-apply` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmaccess` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmdiff` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmexec` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmfund` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmhook` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmorg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmpack` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmpublish` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmsearch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmteam` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/libnpmversion` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/lru-cache` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/make-fetch-happen` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minimatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-collect` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-flush` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-pipeline` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minipass-sized` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/minizlib` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ms` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/mute-stream` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/negotiator` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/node-gyp` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/nopt` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/normalize-package-data` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-audit-report` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-bundled` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-install-checks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-normalize-package-bin` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-package-arg` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-packlist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-pick-manifest` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-profile` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-registry-fetch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/npm-user-validate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/p-map` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/package-json-from-dist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/pacote` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/parse-conflict-json` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/path-key` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/path-scurry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/picomatch` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/postcss-selector-parser` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/proc-log` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/proggy` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promise-all-reject-late` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promise-call-limit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promise-retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/promzard` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/qrcode-terminal` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/read` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/read-cmd-shim` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/read-package-json-fast` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/retry` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/safer-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/semver` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/shebang-command` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/shebang-regex` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/signal-exit` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/sigstore` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/smart-buffer` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/socks` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/socks-proxy-agent` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-correct` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-exceptions` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-expression-parse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/spdx-license-ids` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/ssri` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/string-width` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/strip-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/supports-color` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/text-table` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/tiny-relative-date` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/tinyglobby` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/treeverse` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/tuf-js` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/unique-filename` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/unique-slug` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/util-deprecate` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/validate-npm-package-license` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/validate-npm-package-name` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/walk-up-path` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/which` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/wrap-ansi` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/write-file-atomic` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/yallist` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |
| `sbom` | `time/yarn` | Rule 0220: Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. — runtime image ships no package manager: npm, npx, corepack and yarn removed by #143 (4070315), rationale in tests/bdd/features/developer/runtime-image.feature |

### Claim hygiene

43 claim(s) cover 733 failing hunk(s): 17.05 hunk(s) per claim, at most 696 under one claim (flagged above 10).

| artefact | scope | hunks | flag |
|---|---|---|---|
| `sbom` | `*/{@isaacs/cliui,@isaacs/fs-minipass,@isaacs/string-locale-compare,@npmcli/agent,@npmcli/arborist,@npmcli/config,@npmcli/fs,@npmcli/git,@npmcli/installed-package-contents,@npmcli/map-workspaces,@npmcli/metavuln-calculator,@npmcli/name-from-folder,@npmcli/node-gyp,@npmcli/package-json,@npmcli/promise-spawn,@npmcli/query,@npmcli/redact,@npmcli/run-script,@pkgjs/parseargs,@sigstore/bundle,@sigstore/core,@sigstore/protobuf-specs,@sigstore/sign,@sigstore/tuf,@sigstore/verify,@tufjs/canonical-json,@tufjs/models,abbrev,agent-base,ansi-regex,ansi-styles,aproba,archy,balanced-match,bin-links,binary-extensions,brace-expansion,cacache,chalk,chownr,ci-info,cidr-regex,cli-columns,cmd-shim,color-convert,color-name,common-ancestor-path,corepack,cross-spawn,cssesc,debug,diff,eastasianwidth,emoji-regex,encoding,env-paths,err-code,exponential-backoff,fastest-levenshtein,fdir,foreground-child,fs-minipass,glob,graceful-fs,hosted-git-info,http-cache-semantics,http-proxy-agent,https-proxy-agent,iconv-lite,ignore-walk,imurmurhash,ini,init-package-json,ip-address,ip-regex,is-cidr,is-fullwidth-code-point,isexe,jackspeak,json-parse-even-better-errors,json-stringify-nice,jsonparse,just-diff,just-diff-apply,libnpmaccess,libnpmdiff,libnpmexec,libnpmfund,libnpmhook,libnpmorg,libnpmpack,libnpmpublish,libnpmsearch,libnpmteam,libnpmversion,lru-cache,make-fetch-happen,minimatch,minipass,minipass-collect,minipass-fetch,minipass-flush,minipass-pipeline,minipass-sized,minizlib,ms,mute-stream,negotiator,node-gyp,nopt,normalize-package-data,npm,npm-audit-report,npm-bundled,npm-install-checks,npm-normalize-package-bin,npm-package-arg,npm-packlist,npm-pick-manifest,npm-profile,npm-registry-fetch,npm-user-validate,p-map,package-json-from-dist,pacote,parse-conflict-json,path-key,path-scurry,picomatch,postcss-selector-parser,proc-log,proggy,promise-all-reject-late,promise-call-limit,promise-retry,promzard,qrcode-terminal,read,read-cmd-shim,read-package-json-fast,retry,safer-buffer,semver,shebang-command,shebang-regex,signal-exit,sigstore,smart-buffer,socks,socks-proxy-agent,spdx-correct,spdx-exceptions,spdx-expression-parse,spdx-license-ids,ssri,string-width,strip-ansi,supports-color,text-table,tiny-relative-date,tinyglobby,treeverse,tuf-js,unique-filename,unique-slug,util-deprecate,validate-npm-package-license,validate-npm-package-name,walk-up-path,which,wrap-ansi,write-file-atomic,yallist,yarn}` | 696 | covers more than 10 hunks |
| `dom` | `reader:*` | 14 | covers more than 10 hunks |

A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 291 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 136 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 134 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 134 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 287 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 134 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-15T06:30:36Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.34 ms | 1.97 ms |
| b | 600 | 0 | 0 | 1.38 ms | 2.1 ms |

<details><summary>Informational (279)</summary>

- `console` reader:course: console message gone on b
- `console` reader:lab-step: console message gone on b
- `console` reader:search: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:course: console message gone on b
- `console` reader-auth:topic: console message gone on b
- `console` reader-auth:topic: console message gone on b
- `console` reference:course: console message gone on b
- `console` reference:lab: console message gone on b
- `axe` reader-auth:sign-in: axe violation fixed on b: color-contrast (serious)
- `axe` reader-auth:sign-in: axe violation fixed on b: document-title (serious)
- `axe` reference:course: axe violation fixed on b: nested-interactive (serious)
- `axe` reference:topic: axe violation fixed on b: nested-interactive (serious)
- `timing` journey live-loads median 1372ms → 1798ms but not significant (p=0.210, +31%, n=5/5; smallest slowdown 5/5 runs could detect: about 120%)
- `realtime` reader-auth: Realtime messages per reader page view fell: a 2.67 / b 1.33 per reader page (broadcasts a 0 / b 4, socket data frames a 8 / b 0, over 3 page view(s))
- `vulns` reader: CVE-2025-15649 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-103111 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-12087 (Critical) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-13221 (Critical) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-19487 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-42496 (Critical) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-42497 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-48959 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-48962 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-57432 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-57433 (Critical) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-7010 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-7017 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-8376 (Critical) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-6688-9rhm-gjv2 (Low) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-ch52-4w7c-c8xp (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-p98j-92pf-mc4p (Low) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-rj75-hqrm-r3gf (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2025-15649 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-103111 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-12087 (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-13221 (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-19487 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-42496 (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-42497 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-48959 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-48962 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-57432 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-57433 (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-7010 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-7017 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-8376 (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-ch52-4w7c-c8xp (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-rj75-hqrm-r3gf (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` live: CVE-2025-15649 (Medium) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-103111 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-12087 (Critical) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-13221 (Critical) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-19487 (Medium) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-42496 (Critical) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-42497 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-48959 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-48962 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-57432 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-57433 (Critical) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-7010 (Medium) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-7017 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-8376 (Critical) is present on a and gone on b (fixed)
- `vulns` live: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` live: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-ch52-4w7c-c8xp (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-rj75-hqrm-r3gf (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
- `vulns` time: CVE-2025-15649 (Medium) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-103111 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-12087 (Critical) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-13221 (Critical) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-19487 (Medium) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-42496 (Critical) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-42497 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-48959 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-48962 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-57432 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-57433 (Critical) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-7010 (Medium) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-7017 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-8376 (Critical) is present on a and gone on b (fixed)
- `vulns` time: GHSA-23hp-3jrh-7fpw (Critical) is present on a and gone on b (fixed)
- `vulns` time: GHSA-3jxr-9vmj-r5cp (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-3v7f-55p6-f55p (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-52v5-jr5w-gjxr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-6j4f-fj2g-mc7p (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-8x88-c5mf-7j5w (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-c2c7-rcm5-vvqj (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-ch52-4w7c-c8xp (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-f886-m6hf-6m8v (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-gvwx-54wh-qm9j (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-h3mg-xc3c-68pw (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-j6r3-76f7-8jcv (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-jfc7-64v2-mr8c (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mh99-v99m-4gvg (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mwp4-54f8-5fhr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-q2hr-2g5m-vwhr (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-qhr7-859c-m2p7 (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-r292-9mhp-454m (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-rgw5-rvv9-x895 (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-rj75-hqrm-r3gf (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-rpw4-54j3-4h4q (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-v2v4-37r5-5v8g (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-vmf3-w455-68vh (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w4pp-8pjf-rmxw (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w8wr-v893-vjvp (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-w9m9-85wc-3x92 (Low) is present on a and gone on b (fixed)
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
- `timing-tolerance` journey student-signs-in slower on b beyond the 10% tolerance: 3986ms → 23032ms (+478%, p=0.012, n=5/5 runs; smallest detectable about 74%); timing fails it too (its floor is 20%)
- `asset-graph` reader: the asset graph changed: 120 → 173 immutable requests (JS 115 → 142, CSS 5 → 31), 1.5 MB → 1.6 MB; 33 network and 2 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 12 → 19 immutable requests (JS 11 → 15, CSS 1 → 4), 499 KB → 529 KB; 5 network and 1 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 15 → 24 immutable requests (JS 14 → 19, CSS 1 → 5), 510 KB → 540 KB; 6 network and 1 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 66 → 96 immutable requests (JS 62 → 83, CSS 4 → 13), 742 KB → 1.0 MB; 15 network and 2 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 46 → 66 immutable requests (JS 44 → 53, CSS 2 → 13), 587 KB → 626 KB; 14 network and 1 headers difference(s) are this churn
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 42× on b
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 39× on b
- `replay` replay:talk-01: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:talk-01: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css
- `replay` replay:talk-01: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css
- `replay` replay:talk-01: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css
- `replay` replay:talk-01: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css
- `replay` replay:talk-01: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css
- `replay` replay:talk-01: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js
- `replay` replay:talk-01: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048
- `replay` replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 30× on a, 38× on b
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css
- `replay` replay:note-01: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js
- `replay` replay:note-01: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 30× on a, 38× on b
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css
- `replay` replay:note-02: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 31× on a, 38× on b
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/8.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css
- `replay` replay:lab-02-step-03: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js
- `replay` replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 42× on b
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css
- `replay` replay:missing-topic: new request on b: GET /_app/immutable/entry/payload.{{hash}}.js
- `replay` replay:missing-topic: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100 response schema changed: f6160a19e92ea0da → 578b11f8d4c89048
- `replay` replay:topic-02: header dropped on b: link (was <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/17.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush)
- `replay` replay:talk-01: header dropped on b: link (was <../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/15.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush)
- `replay` replay:note-01: header dropped on b: link (was <../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush)
- `replay` replay:note-02: header dropped on b: link (was <../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/nodes/10.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush)
- `replay` replay:lab-02-step-03: header dropped on b: link (was <../../../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/nodes/8.{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush)
- `replay` replay:missing-topic: header dropped on b: link (was <../../../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../../../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/nodes/17.{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../../../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush)
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-availability: 100.0% of 600 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` reader-latency: 100.0% of 600 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: its /metrics across the journeys carries no availability SLI for time
- `slo` time-latency: not evaluated on b: its /metrics across the journeys carries no latency SLI for time
- `slo` reader-latency-tail: 100.0% of 62 reader requests under 2.5s on b (its /metrics across the journeys), objective 99.0%: holds
- `slo` reader-latency-tail: 100.0% of 600 reader requests under 2.5s on b (the k6 load leg), objective 99.0%: holds

</details>

<details><summary>Stale claims (28)</summary>

- `axe` `reference:note` — Rule 0036: The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. — code block copy buttons are named "Copy code" (button-name, critical) fixed by #313
- `persistence` `*/record_heartbeat` — Rule 0304: While a course page is visible, the reader shall record each 30 seconds of activity in one database request. — each 30 seconds of activity on a visible course page is one request (#475)
- `persistence` `*/increment_calendar` — Rule 0304: While a course page is visible, the reader shall record each 30 seconds of activity in one database request. — the calendar's time-active increment is replaced by record_heartbeat (#475)
- `axe` `reader:*` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — CHANGELOG 17.0.0 Reader: course pages carry no critical or serious WCAG 2.1 AA violations after the Paper rebuild (#313, #338, #364, #420)
- `axe` `live:*` — Rule 0051: The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. — CHANGELOG 17.0.0 Live: Live is brought onto the Paper design system and the reader's UX patterns (#313, #331)
- `axe` `catalogue:*` — Rule 0173: The catalogue shall give each link in its header an accessible name that no other link in the header has. — CHANGELOG 17.0.0 Catalogue: every link in the catalogue header has an accessible name no other header link shares (#338)
- `dom` `time:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Time: Time is brought onto the Paper design system (#313, #331)
- `screenshot` `time:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Time: Time is brought onto the Paper design system (#313, #331)
- `axe` `time:*` — Rule 0019: The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. — CHANGELOG 17.0.0 Time: Time is brought onto the Paper design system (#313, #331)
- `network` `*/api/auth/*` — Rule 0250: When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". — CHANGELOG 17.0.0 Reader: the GitHub OAuth callback URL has moved to /api/auth/callback/github (#417, #461, #463)
- `network` `reader:*` — Rule 0317: When a sharing student enters a course, the reader shall load the course online list from stored activity without joining a course Realtime channel. — CHANGELOG 17.0.0 Reader: readers no longer join a course Realtime channel; the online list is read from stored activity (#414, #429, #474)
- `bus` `reader:*` — Rule 0271: If a learning event is published for a course the student is not reading, then the reader shall not receive it. — CHANGELOG 17.0.0 Reader: the reader no longer subscribes to tutors-all-course-access and course activity channels (#414, #429, #474)
- `bus` `live:*` — Rule 0272: When a student opens a learning object, the reader shall report one learning event for it. — CHANGELOG 17.0.0 Live: Live's landing page is the only subscriber to tutors-all-course-access (#414, #429, #474)
- `migration` `*/idx_tutors_connect_latest_course_recent` — Rule 0317: When a sharing student enters a course, the reader shall load the course online list from stored activity without joining a course Realtime channel. — CHANGELOG 17.0.0 Infrastructure: 20261013_tutors_connect_latest_recent_index.sql indexes (course_id, received_at DESC) for the online list (#474)
- `migration` `*/record_page_view` — Rule 0303: When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. — CHANGELOG 17.0.0 Infrastructure: 20261014_record_page_view_and_heartbeat.sql adds record_page_view (#475)
- `migration` `*/record_heartbeat` — Rule 0304: While a course page is visible, the reader shall record each 30 seconds of activity in one database request. — CHANGELOG 17.0.0 Infrastructure: 20261014_record_page_view_and_heartbeat.sql adds record_heartbeat (#475)
- `logs` `reader:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape, and variable data kept out of log messages (#283, #297)
- `logs` `live:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283)
- `logs` `catalogue:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283)
- `logs` `time:*` — CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283)
- `metrics` `reader:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `metrics` `live:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `metrics` `catalogue:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `metrics` `time:*` — CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283)
- `asset-graph` `reader:*` — CHANGELOG 17.0.0 Reader: the reader runs on SvelteKit 3 (#466)
- `asset-graph` `live:*` — CHANGELOG 17.0.0 Live: Live runs on SvelteKit 3 (#466)
- `asset-graph` `catalogue:*` — CHANGELOG 17.0.0 Catalogue: the catalogue runs on SvelteKit 3 (#466)
- `asset-graph` `time:*` — CHANGELOG 17.0.0 Time: Time runs on SvelteKit 3 (#466)

</details>

<sub>harness 1.36.1 (f49f4b5e6bf8, contract 1.36.0) · 2026-10-15T09:18:21.299Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×87, request-id×87, etag×87, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1056, persistence-stub-requests×200, oauth-callback-state×5, media-range-status×21, hashed-assets×5354, footer-tutors-version×287, transport-length×87, transport-connection×87, transport-keepalive×87</sub>
