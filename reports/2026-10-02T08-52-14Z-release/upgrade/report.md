## ❌ Release harness — upgrade — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:16.2.2` | `quay.io/tutors-sdk/tutors-reader:sha-b35eddd` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:16.2.2` | `quay.io/tutors-sdk/tutors-catalogue:sha-b35eddd` |
| live | `quay.io/tutors-sdk/tutors-live:16.2.2` | `quay.io/tutors-sdk/tutors-live:sha-b35eddd` |
| time | `quay.io/tutors-sdk/tutors-time:16.2.2` | `quay.io/tutors-sdk/tutors-time:sha-b35eddd` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:7567d5927767bd39b7991a586d594f6c310387471109a456d2cff49fa12488cb` · rev `caa53d021e63` · version `16.2.2` | `sha256:e7efea4cede2f3345e6d35a01f68524baecb86f863a625215928e92c4ef5ea1e` · rev `b35eddd742f1` · version `sha-b35eddd` |
| catalogue image | `sha256:f6cdb7f6adaba1d227e2cf62260ec2fe7064c58114666774331da3530bf52187` · rev `caa53d021e63` · version `16.2.2` | `sha256:9c938e1158af66a510117e53b6ff4210f510a96654b7ae31718f17980374b1c1` · rev `b35eddd742f1` · version `sha-b35eddd` |
| live image | `sha256:12ed5642e5cbec601790771a8f9fc85221f8202679a312a0e707622bb6e84e9a` · rev `caa53d021e63` · version `16.2.2` | `sha256:ac205da45bcd86febbb33f134a13a757770c21445bada92b0348c7593c4f8c76` · rev `b35eddd742f1` · version `sha-b35eddd` |
| time image | `sha256:ddf3ad22b79bbba96199791a49367677bf9ad0ebdd7542f3246d56e7879d5e4e` · rev `caa53d021e63` · version `16.2.2` | `sha256:d93376cc52c4cabd87091c09109afb63c0dc9b06594b91795f253a5f3756bb6d` · rev `b35eddd742f1` · version `sha-b35eddd` |

- 779 finding(s) during the rollout
- NOT COLLECTED: vulns of reader, catalogue, live, time on side a: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- NOT COLLECTED: vulns of reader, catalogue, live, time on side b: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)

### 779 unclaimed differences, 12 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `sbom` package removed (174 packages: `@isaacs/cliui`, `@isaacs/fs-minipass`, `@isaacs/string-locale-compare`, `@npmcli/agent`, `@npmcli/arborist`, `@npmcli/config`, `@npmcli/fs`, `@npmcli/git` and 166 more) | 696 | reader, catalogue, live, time | — | reader: package removed: @isaacs/cliui@8.0.2 |
| `sbom` package bumped (10 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `dompurify`, `node` and 2 more) | 19 | reader, catalogue, live, time | — | reader: package bumped: dompurify 3.4.14 → 3.4.16 |
| `network` new request on b: GET {{asset}} (13 routes: `GET /_app/immutable/assets/1.{{hash}}.css`, `GET /_app/immutable/assets/23.{{hash}}.css`, `GET /_app/immutable/assets/8.{{hash}}.css`, `GET /_app/immutable/assets/Card.{{hash}}.css`, `GET /_app/immutable/assets/Composite.{{hash}}.css`, `GET /_app/immutable/assets/Context.{{hash}}.css`, `GET /_app/immutable/assets/Icon.{{hash}}.css`, `GET /_app/immutable/assets/Image.{{hash}}.css` and 5 more) | 18 | reader | 3: `reader:course`, `reader:home`, `reader:lab-step` | reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `logs` new log field on b (3 fields: `event`, `loadError`, `slow`) | 12 | reader, catalogue, live, time | — | reader: new log field on b: event |
| `dom` semantic DOM differs (+# −# lines at line #) | 10 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: semantic DOM differs (+51 −25 lines at line 4) |
| `focus` keyboard order changed (# stops on a, # on b) | 5 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 5 | reader | 5: `reader:course`, `reader:home`, `reader:lab-step`, `reader:lab-step-2`, `reader:topic` | reader:home: 6.79% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `image-manifest` # layer(s) on a, # on b | 4 | reader, catalogue, live, time | — | reader: 9 layer(s) on a, 10 on b |
| `image-manifest` label org.opencontainers.image.vendor added (Tutors SDK) | 4 | reader, catalogue, live, time | — | reader: label org.opencontainers.image.vendor added (Tutors SDK) |
| `network` GET {{asset}} requested #× on a, #× on b (1 route: `GET /_app/immutable/chunks/{{hash}}.js`) | 3 | reader | 3: `reader:course`, `reader:home`, `reader:lab-step` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 30× on b |
| `headers` header link changed (1 header: `link`) | 2 | reader | 2: `reader:course`, `reader:home` | reader:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel=… |
| `network` request no longer made on b: GET /logo.svg | 1 | reader | 1: `reader:home` | reader:home: request no longer made on b: GET /logo.svg |

Moved together on the same pages, so likely one change each:

- `dom`, `focus`, `headers`, `network`, `screenshot` on 2 pages (29 differences): `reader:course`, `reader:home`
- `dom`, `focus`, `screenshot` on 2 pages (8 differences): `reader:lab-step-2`, `reader:topic`
- `dom`, `focus`, `network`, `screenshot` on 1 page (7 differences): `reader:lab-step`

### Unclaimed differences (779)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:home` | reader:home: semantic DOM differs (+51 −25 lines at line 4) |
| `dom` | `reader:home` | reader:home: semantic DOM differs (+6 −7 lines at line 36) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+32 −33 lines at line 4) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+6 −7 lines at line 47) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+45 −43 lines at line 4) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+6 −7 lines at line 59) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+45 −35 lines at line 2) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+18 −14 lines at line 62) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+45 −35 lines at line 2) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+20 −14 lines at line 54) |
| `screenshot` | `reader:home` | reader:home: 6.79% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:course` | reader:course: 8.40% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:topic` | reader:topic: 14.70% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:lab-step` | reader:lab-step: 12.63% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `screenshot` | `reader:lab-step-2` | reader:lab-step-2: 11.61% of pixels differ in 1280×792 at (0, 8) (threshold 0.10%) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:home: GET /_app/immutable/chunks/{{hash}}.js requested 26× on a, 30× on b |
| `network` | `GET /logo.svg` | reader:home: request no longer made on b: GET /logo.svg |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:course: GET /_app/immutable/chunks/{{hash}}.js requested 33× on a, 39× on b |
| `network` | `GET /_app/immutable/assets/1.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/1.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Card.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Card.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Composite.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Composite.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Icon.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Icon.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Image.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/Image.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/SecondaryNavigator.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/StudentCard.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/StudentCard.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TalkMarp.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/TalkMarp.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/TutorsShell.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/TutorsShell.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/WidthToggle.{{hash}}.css` | reader:course: new request on b: GET /_app/immutable/assets/WidthToggle.{{hash}}.css |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | reader:lab-step: GET /_app/immutable/chunks/{{hash}}.js requested 2× on a, 1× on b |
| `network` | `GET /_app/immutable/assets/8.{{hash}}.css` | reader:lab-step: new request on b: GET /_app/immutable/assets/8.{{hash}}.css |
| `network` | `GET /_app/immutable/assets/Context.{{hash}}.css` | reader:lab-step: new request on b: GET /_app/immutable/assets/Context.{{hash}}.css |
| `headers` | `reader:home/link` | reader:home: header link changed: <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/4.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/23.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <./_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/assets/23.{{hash}}.css>; rel="preload"; as="style"; nopush, <./_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/4.{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <./_app/immutable/nodes/23.{{hash}}.js>; rel="modulepreload"; nopush |
| `headers` | `reader:course/link` | reader:course: header link changed: <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush → <../_app/immutable/assets/0.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Icon.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Image.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/StudentCard.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TutorsShell.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/WidthToggle.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Note.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Card.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/SecondaryNavigator.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/Composite.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/assets/TalkMarp.{{hash}}.css>; rel="preload"; as="style"; nopush, <../_app/immutable/entry/start.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/entry/app.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/0.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/2.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/nodes/7.{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush, <../_app/immutable/chunks/{{hash}}.js>; rel="modulepreload"; nopush |
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
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:course` | reader:course: keyboard order changed (11 stops on a, 7 on b) |
| `focus` | `reader:topic` | reader:topic: keyboard order changed (12 stops on a, 11 on b) |
| `focus` | `reader:lab-step` | reader:lab-step: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step-2` | reader:lab-step-2: keyboard order changed (6 stops on a, 11 on b) |
| `image-manifest` | `reader/layers` | reader: 9 layer(s) on a, 10 on b |
| `image-manifest` | `reader/label/org.opencontainers.image.vendor` | reader: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `reader/@isaacs/cliui` | reader: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `reader/@isaacs/fs-minipass` | reader: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `reader/@isaacs/string-locale-compare` | reader: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `reader/@npmcli/agent` | reader: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `reader/@npmcli/arborist` | reader: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `reader/@npmcli/config` | reader: package removed: @npmcli/config@9.0.0 |
| `sbom` | `reader/@npmcli/fs` | reader: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `reader/@npmcli/git` | reader: package removed: @npmcli/git@6.0.3 |
| `sbom` | `reader/@npmcli/installed-package-contents` | reader: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `reader/@npmcli/map-workspaces` | reader: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `reader/@npmcli/metavuln-calculator` | reader: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `reader/@npmcli/name-from-folder` | reader: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `reader/@npmcli/node-gyp` | reader: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `reader/@npmcli/package-json` | reader: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `reader/@npmcli/promise-spawn` | reader: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `reader/@npmcli/query` | reader: package removed: @npmcli/query@4.0.1 |
| `sbom` | `reader/@npmcli/redact` | reader: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `reader/@npmcli/run-script` | reader: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `reader/@pkgjs/parseargs` | reader: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `reader/@sigstore/bundle` | reader: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `reader/@sigstore/core` | reader: package removed: @sigstore/core@2.0.0 |
| `sbom` | `reader/@sigstore/protobuf-specs` | reader: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `reader/@sigstore/sign` | reader: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `reader/@sigstore/tuf` | reader: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `reader/@sigstore/verify` | reader: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `reader/@tufjs/canonical-json` | reader: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `reader/@tufjs/models` | reader: package removed: @tufjs/models@3.0.1 |
| `sbom` | `reader/abbrev` | reader: package removed: abbrev@3.0.1 |
| `sbom` | `reader/agent-base` | reader: package removed: agent-base@7.1.4 |
| `sbom` | `reader/ansi-regex` | reader: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `reader/ansi-styles` | reader: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `reader/aproba` | reader: package removed: aproba@2.1.0 |
| `sbom` | `reader/archy` | reader: package removed: archy@1.0.0 |
| `sbom` | `reader/balanced-match` | reader: package removed: balanced-match@1.0.2 |
| `sbom` | `reader/bin-links` | reader: package removed: bin-links@5.0.0 |
| `sbom` | `reader/binary-extensions` | reader: package removed: binary-extensions@2.3.0 |
| `sbom` | `reader/brace-expansion` | reader: package removed: brace-expansion@2.0.2 |
| `sbom` | `reader/cacache` | reader: package removed: cacache@19.0.1 |
| `sbom` | `reader/chalk` | reader: package removed: chalk@5.6.2 |
| `sbom` | `reader/chownr` | reader: package removed: chownr@3.0.0 |
| `sbom` | `reader/ci-info` | reader: package removed: ci-info@4.4.0 |
| `sbom` | `reader/cidr-regex` | reader: package removed: cidr-regex@4.1.3 |
| `sbom` | `reader/cli-columns` | reader: package removed: cli-columns@4.0.0 |
| `sbom` | `reader/cmd-shim` | reader: package removed: cmd-shim@7.0.0 |
| `sbom` | `reader/color-convert` | reader: package removed: color-convert@2.0.1 |
| `sbom` | `reader/color-name` | reader: package removed: color-name@1.1.4 |
| `sbom` | `reader/common-ancestor-path` | reader: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `reader/corepack` | reader: package removed: corepack@0.34.6 |
| `sbom` | `reader/cross-spawn` | reader: package removed: cross-spawn@7.0.6 |
| `sbom` | `reader/cssesc` | reader: package removed: cssesc@3.0.0 |
| `sbom` | `reader/debug` | reader: package removed: debug@4.4.3 |
| `sbom` | `reader/diff` | reader: package removed: diff@5.2.2 |
| `sbom` | `reader/dompurify` | reader: package bumped: dompurify 3.4.14 → 3.4.16 |
| `sbom` | `reader/eastasianwidth` | reader: package removed: eastasianwidth@0.2.0 |
| `sbom` | `reader/emoji-regex` | reader: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `reader/encoding` | reader: package removed: encoding@0.1.13 |
| `sbom` | `reader/env-paths` | reader: package removed: env-paths@2.2.1 |
| `sbom` | `reader/err-code` | reader: package removed: err-code@2.0.3 |
| `sbom` | `reader/exponential-backoff` | reader: package removed: exponential-backoff@3.1.3 |
| `sbom` | `reader/fastest-levenshtein` | reader: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `reader/fdir` | reader: package removed: fdir@6.5.0 |
| `sbom` | `reader/foreground-child` | reader: package removed: foreground-child@3.3.1 |
| `sbom` | `reader/fs-minipass` | reader: package removed: fs-minipass@3.0.3 |
| `sbom` | `reader/glob` | reader: package removed: glob@10.5.0 |
| `sbom` | `reader/graceful-fs` | reader: package removed: graceful-fs@4.2.11 |
| `sbom` | `reader/hosted-git-info` | reader: package removed: hosted-git-info@8.1.0 |
| `sbom` | `reader/http-cache-semantics` | reader: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `reader/http-proxy-agent` | reader: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `reader/https-proxy-agent` | reader: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `reader/iconv-lite` | reader: package removed: iconv-lite@0.6.3 |
| `sbom` | `reader/ignore-walk` | reader: package removed: ignore-walk@7.0.0 |
| `sbom` | `reader/imurmurhash` | reader: package removed: imurmurhash@0.1.4 |
| `sbom` | `reader/ini` | reader: package removed: ini@5.0.0 |
| `sbom` | `reader/init-package-json` | reader: package removed: init-package-json@7.0.2 |
| `sbom` | `reader/ip-address` | reader: package removed: ip-address@10.1.0 |
| `sbom` | `reader/ip-regex` | reader: package removed: ip-regex@5.0.0 |
| `sbom` | `reader/is-cidr` | reader: package removed: is-cidr@5.1.1 |
| `sbom` | `reader/is-fullwidth-code-point` | reader: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `reader/isexe` | reader: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `reader/jackspeak` | reader: package removed: jackspeak@3.4.3 |
| `sbom` | `reader/json-parse-even-better-errors` | reader: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `reader/json-stringify-nice` | reader: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `reader/jsonparse` | reader: package removed: jsonparse@1.3.1 |
| `sbom` | `reader/just-diff` | reader: package removed: just-diff@6.0.2 |
| `sbom` | `reader/just-diff-apply` | reader: package removed: just-diff-apply@5.5.0 |
| `sbom` | `reader/libnpmaccess` | reader: package removed: libnpmaccess@9.0.0 |
| `sbom` | `reader/libnpmdiff` | reader: package removed: libnpmdiff@7.0.5 |
| `sbom` | `reader/libnpmexec` | reader: package removed: libnpmexec@9.0.5 |
| `sbom` | `reader/libnpmfund` | reader: package removed: libnpmfund@6.0.5 |
| `sbom` | `reader/libnpmhook` | reader: package removed: libnpmhook@11.0.0 |
| `sbom` | `reader/libnpmorg` | reader: package removed: libnpmorg@7.0.0 |
| `sbom` | `reader/libnpmpack` | reader: package removed: libnpmpack@8.0.5 |
| `sbom` | `reader/libnpmpublish` | reader: package removed: libnpmpublish@10.0.2 |
| `sbom` | `reader/libnpmsearch` | reader: package removed: libnpmsearch@8.0.0 |
| `sbom` | `reader/libnpmteam` | reader: package removed: libnpmteam@7.0.0 |
| `sbom` | `reader/libnpmversion` | reader: package removed: libnpmversion@7.0.0 |
| `sbom` | `reader/lru-cache` | reader: package removed: lru-cache@10.4.3 |
| `sbom` | `reader/make-fetch-happen` | reader: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `reader/minimatch` | reader: package removed: minimatch@9.0.9 |
| `sbom` | `reader/minipass` | reader: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `reader/minipass-collect` | reader: package removed: minipass-collect@2.0.1 |
| `sbom` | `reader/minipass-fetch` | reader: package removed: minipass-fetch@4.0.1 |
| `sbom` | `reader/minipass-flush` | reader: package removed: minipass-flush@1.0.5 |
| `sbom` | `reader/minipass-pipeline` | reader: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `reader/minipass-sized` | reader: package removed: minipass-sized@1.0.3 |
| `sbom` | `reader/minizlib` | reader: package removed: minizlib@3.1.0 |
| `sbom` | `reader/ms` | reader: package removed: ms@2.1.3 |
| `sbom` | `reader/mute-stream` | reader: package removed: mute-stream@2.0.0 |
| `sbom` | `reader/negotiator` | reader: package removed: negotiator@1.0.0 |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `reader/node-gyp` | reader: package removed: node-gyp@11.5.0 |
| `sbom` | `reader/nopt` | reader: package removed: nopt@8.1.0 |
| `sbom` | `reader/normalize-package-data` | reader: package removed: normalize-package-data@7.0.1 |
| `sbom` | `reader/npm` | reader: package removed: npm@10.9.8 |
| `sbom` | `reader/npm-audit-report` | reader: package removed: npm-audit-report@6.0.0 |
| `sbom` | `reader/npm-bundled` | reader: package removed: npm-bundled@4.0.0 |
| `sbom` | `reader/npm-install-checks` | reader: package removed: npm-install-checks@7.1.2 |
| `sbom` | `reader/npm-normalize-package-bin` | reader: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `reader/npm-package-arg` | reader: package removed: npm-package-arg@12.0.2 |
| `sbom` | `reader/npm-packlist` | reader: package removed: npm-packlist@9.0.0 |
| `sbom` | `reader/npm-pick-manifest` | reader: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `reader/npm-profile` | reader: package removed: npm-profile@11.0.1 |
| `sbom` | `reader/npm-registry-fetch` | reader: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `reader/npm-user-validate` | reader: package removed: npm-user-validate@3.0.0 |
| `sbom` | `reader/p-map` | reader: package removed: p-map@7.0.4 |
| `sbom` | `reader/package-json-from-dist` | reader: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `reader/pacote` | reader: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `reader/parse-conflict-json` | reader: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `reader/path-key` | reader: package removed: path-key@3.1.1 |
| `sbom` | `reader/path-scurry` | reader: package removed: path-scurry@1.11.1 |
| `sbom` | `reader/picomatch` | reader: package removed: picomatch@4.0.3 |
| `sbom` | `reader/postcss-selector-parser` | reader: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `reader/proc-log` | reader: package removed: proc-log@5.0.0 |
| `sbom` | `reader/proggy` | reader: package removed: proggy@3.0.0 |
| `sbom` | `reader/promise-all-reject-late` | reader: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `reader/promise-call-limit` | reader: package removed: promise-call-limit@3.0.2 |
| `sbom` | `reader/promise-retry` | reader: package removed: promise-retry@2.0.1 |
| `sbom` | `reader/promzard` | reader: package removed: promzard@2.0.0 |
| `sbom` | `reader/qrcode-terminal` | reader: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `reader/read` | reader: package removed: read@4.1.0 |
| `sbom` | `reader/read-cmd-shim` | reader: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `reader/read-package-json-fast` | reader: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `reader/retry` | reader: package removed: retry@0.12.0 |
| `sbom` | `reader/safer-buffer` | reader: package removed: safer-buffer@2.1.2 |
| `sbom` | `reader/semver` | reader: package removed: semver@7.7.4 |
| `sbom` | `reader/shebang-command` | reader: package removed: shebang-command@2.0.0 |
| `sbom` | `reader/shebang-regex` | reader: package removed: shebang-regex@3.0.0 |
| `sbom` | `reader/signal-exit` | reader: package removed: signal-exit@4.1.0 |
| `sbom` | `reader/sigstore` | reader: package removed: sigstore@3.1.0 |
| `sbom` | `reader/smart-buffer` | reader: package removed: smart-buffer@4.2.0 |
| `sbom` | `reader/socks` | reader: package removed: socks@2.8.7 |
| `sbom` | `reader/socks-proxy-agent` | reader: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `reader/spdx-correct` | reader: package removed: spdx-correct@3.2.0 |
| `sbom` | `reader/spdx-exceptions` | reader: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `reader/spdx-expression-parse` | reader: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `reader/spdx-license-ids` | reader: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `reader/ssri` | reader: package removed: ssri@12.0.0 |
| `sbom` | `reader/string-width` | reader: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `reader/strip-ansi` | reader: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `reader/supports-color` | reader: package removed: supports-color@9.4.0 |
| `sbom` | `reader/tar` | reader: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `reader/text-table` | reader: package removed: text-table@0.2.0 |
| `sbom` | `reader/tiny-relative-date` | reader: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `reader/tinyglobby` | reader: package removed: tinyglobby@0.2.15 |
| `sbom` | `reader/treeverse` | reader: package removed: treeverse@3.0.0 |
| `sbom` | `reader/tuf-js` | reader: package removed: tuf-js@3.1.0 |
| `sbom` | `reader/tzdata` | reader: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `reader/unique-filename` | reader: package removed: unique-filename@4.0.0 |
| `sbom` | `reader/unique-slug` | reader: package removed: unique-slug@5.0.0 |
| `sbom` | `reader/util-deprecate` | reader: package removed: util-deprecate@1.0.2 |
| `sbom` | `reader/validate-npm-package-license` | reader: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `reader/validate-npm-package-name` | reader: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `reader/walk-up-path` | reader: package removed: walk-up-path@3.0.1 |
| `sbom` | `reader/which` | reader: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `reader/wrap-ansi` | reader: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `reader/write-file-atomic` | reader: package removed: write-file-atomic@6.0.0 |
| `sbom` | `reader/yallist` | reader: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `reader/yarn` | reader: package removed: yarn@1.22.22 |
| `image-manifest` | `catalogue/layers` | catalogue: 9 layer(s) on a, 10 on b |
| `image-manifest` | `catalogue/label/org.opencontainers.image.vendor` | catalogue: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `catalogue/@isaacs/cliui` | catalogue: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `catalogue/@isaacs/fs-minipass` | catalogue: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `catalogue/@isaacs/string-locale-compare` | catalogue: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `catalogue/@npmcli/agent` | catalogue: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `catalogue/@npmcli/arborist` | catalogue: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `catalogue/@npmcli/config` | catalogue: package removed: @npmcli/config@9.0.0 |
| `sbom` | `catalogue/@npmcli/fs` | catalogue: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `catalogue/@npmcli/git` | catalogue: package removed: @npmcli/git@6.0.3 |
| `sbom` | `catalogue/@npmcli/installed-package-contents` | catalogue: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `catalogue/@npmcli/map-workspaces` | catalogue: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `catalogue/@npmcli/metavuln-calculator` | catalogue: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `catalogue/@npmcli/name-from-folder` | catalogue: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `catalogue/@npmcli/node-gyp` | catalogue: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `catalogue/@npmcli/package-json` | catalogue: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `catalogue/@npmcli/promise-spawn` | catalogue: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `catalogue/@npmcli/query` | catalogue: package removed: @npmcli/query@4.0.1 |
| `sbom` | `catalogue/@npmcli/redact` | catalogue: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `catalogue/@npmcli/run-script` | catalogue: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `catalogue/@pkgjs/parseargs` | catalogue: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `catalogue/@sigstore/bundle` | catalogue: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `catalogue/@sigstore/core` | catalogue: package removed: @sigstore/core@2.0.0 |
| `sbom` | `catalogue/@sigstore/protobuf-specs` | catalogue: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `catalogue/@sigstore/sign` | catalogue: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `catalogue/@sigstore/tuf` | catalogue: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `catalogue/@sigstore/verify` | catalogue: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `catalogue/@tufjs/canonical-json` | catalogue: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `catalogue/@tufjs/models` | catalogue: package removed: @tufjs/models@3.0.1 |
| `sbom` | `catalogue/abbrev` | catalogue: package removed: abbrev@3.0.1 |
| `sbom` | `catalogue/agent-base` | catalogue: package removed: agent-base@7.1.4 |
| `sbom` | `catalogue/ansi-regex` | catalogue: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `catalogue/ansi-styles` | catalogue: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `catalogue/aproba` | catalogue: package removed: aproba@2.1.0 |
| `sbom` | `catalogue/archy` | catalogue: package removed: archy@1.0.0 |
| `sbom` | `catalogue/balanced-match` | catalogue: package removed: balanced-match@1.0.2 |
| `sbom` | `catalogue/bin-links` | catalogue: package removed: bin-links@5.0.0 |
| `sbom` | `catalogue/binary-extensions` | catalogue: package removed: binary-extensions@2.3.0 |
| `sbom` | `catalogue/brace-expansion` | catalogue: package removed: brace-expansion@2.0.2 |
| `sbom` | `catalogue/cacache` | catalogue: package removed: cacache@19.0.1 |
| `sbom` | `catalogue/chalk` | catalogue: package removed: chalk@5.6.2 |
| `sbom` | `catalogue/chownr` | catalogue: package removed: chownr@3.0.0 |
| `sbom` | `catalogue/ci-info` | catalogue: package removed: ci-info@4.4.0 |
| `sbom` | `catalogue/cidr-regex` | catalogue: package removed: cidr-regex@4.1.3 |
| `sbom` | `catalogue/cli-columns` | catalogue: package removed: cli-columns@4.0.0 |
| `sbom` | `catalogue/cmd-shim` | catalogue: package removed: cmd-shim@7.0.0 |
| `sbom` | `catalogue/color-convert` | catalogue: package removed: color-convert@2.0.1 |
| `sbom` | `catalogue/color-name` | catalogue: package removed: color-name@1.1.4 |
| `sbom` | `catalogue/common-ancestor-path` | catalogue: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `catalogue/corepack` | catalogue: package removed: corepack@0.34.6 |
| `sbom` | `catalogue/cross-spawn` | catalogue: package removed: cross-spawn@7.0.6 |
| `sbom` | `catalogue/cssesc` | catalogue: package removed: cssesc@3.0.0 |
| `sbom` | `catalogue/debug` | catalogue: package removed: debug@4.4.3 |
| `sbom` | `catalogue/diff` | catalogue: package removed: diff@5.2.2 |
| `sbom` | `catalogue/eastasianwidth` | catalogue: package removed: eastasianwidth@0.2.0 |
| `sbom` | `catalogue/emoji-regex` | catalogue: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `catalogue/encoding` | catalogue: package removed: encoding@0.1.13 |
| `sbom` | `catalogue/env-paths` | catalogue: package removed: env-paths@2.2.1 |
| `sbom` | `catalogue/err-code` | catalogue: package removed: err-code@2.0.3 |
| `sbom` | `catalogue/exponential-backoff` | catalogue: package removed: exponential-backoff@3.1.3 |
| `sbom` | `catalogue/fastest-levenshtein` | catalogue: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `catalogue/fdir` | catalogue: package removed: fdir@6.5.0 |
| `sbom` | `catalogue/foreground-child` | catalogue: package removed: foreground-child@3.3.1 |
| `sbom` | `catalogue/fs-minipass` | catalogue: package removed: fs-minipass@3.0.3 |
| `sbom` | `catalogue/glob` | catalogue: package removed: glob@10.5.0 |
| `sbom` | `catalogue/graceful-fs` | catalogue: package removed: graceful-fs@4.2.11 |
| `sbom` | `catalogue/hosted-git-info` | catalogue: package removed: hosted-git-info@8.1.0 |
| `sbom` | `catalogue/http-cache-semantics` | catalogue: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `catalogue/http-proxy-agent` | catalogue: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `catalogue/https-proxy-agent` | catalogue: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `catalogue/iconv-lite` | catalogue: package removed: iconv-lite@0.6.3 |
| `sbom` | `catalogue/ignore-walk` | catalogue: package removed: ignore-walk@7.0.0 |
| `sbom` | `catalogue/imurmurhash` | catalogue: package removed: imurmurhash@0.1.4 |
| `sbom` | `catalogue/ini` | catalogue: package removed: ini@5.0.0 |
| `sbom` | `catalogue/init-package-json` | catalogue: package removed: init-package-json@7.0.2 |
| `sbom` | `catalogue/ip-address` | catalogue: package removed: ip-address@10.1.0 |
| `sbom` | `catalogue/ip-regex` | catalogue: package removed: ip-regex@5.0.0 |
| `sbom` | `catalogue/is-cidr` | catalogue: package removed: is-cidr@5.1.1 |
| `sbom` | `catalogue/is-fullwidth-code-point` | catalogue: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `catalogue/isexe` | catalogue: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `catalogue/jackspeak` | catalogue: package removed: jackspeak@3.4.3 |
| `sbom` | `catalogue/json-parse-even-better-errors` | catalogue: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `catalogue/json-stringify-nice` | catalogue: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `catalogue/jsonparse` | catalogue: package removed: jsonparse@1.3.1 |
| `sbom` | `catalogue/just-diff` | catalogue: package removed: just-diff@6.0.2 |
| `sbom` | `catalogue/just-diff-apply` | catalogue: package removed: just-diff-apply@5.5.0 |
| `sbom` | `catalogue/libnpmaccess` | catalogue: package removed: libnpmaccess@9.0.0 |
| `sbom` | `catalogue/libnpmdiff` | catalogue: package removed: libnpmdiff@7.0.5 |
| `sbom` | `catalogue/libnpmexec` | catalogue: package removed: libnpmexec@9.0.5 |
| `sbom` | `catalogue/libnpmfund` | catalogue: package removed: libnpmfund@6.0.5 |
| `sbom` | `catalogue/libnpmhook` | catalogue: package removed: libnpmhook@11.0.0 |
| `sbom` | `catalogue/libnpmorg` | catalogue: package removed: libnpmorg@7.0.0 |
| `sbom` | `catalogue/libnpmpack` | catalogue: package removed: libnpmpack@8.0.5 |
| `sbom` | `catalogue/libnpmpublish` | catalogue: package removed: libnpmpublish@10.0.2 |
| `sbom` | `catalogue/libnpmsearch` | catalogue: package removed: libnpmsearch@8.0.0 |
| `sbom` | `catalogue/libnpmteam` | catalogue: package removed: libnpmteam@7.0.0 |
| `sbom` | `catalogue/libnpmversion` | catalogue: package removed: libnpmversion@7.0.0 |
| `sbom` | `catalogue/lru-cache` | catalogue: package removed: lru-cache@10.4.3 |
| `sbom` | `catalogue/make-fetch-happen` | catalogue: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `catalogue/minimatch` | catalogue: package removed: minimatch@9.0.9 |
| `sbom` | `catalogue/minipass` | catalogue: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `catalogue/minipass-collect` | catalogue: package removed: minipass-collect@2.0.1 |
| `sbom` | `catalogue/minipass-fetch` | catalogue: package removed: minipass-fetch@4.0.1 |
| `sbom` | `catalogue/minipass-flush` | catalogue: package removed: minipass-flush@1.0.5 |
| `sbom` | `catalogue/minipass-pipeline` | catalogue: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `catalogue/minipass-sized` | catalogue: package removed: minipass-sized@1.0.3 |
| `sbom` | `catalogue/minizlib` | catalogue: package removed: minizlib@3.1.0 |
| `sbom` | `catalogue/ms` | catalogue: package removed: ms@2.1.3 |
| `sbom` | `catalogue/mute-stream` | catalogue: package removed: mute-stream@2.0.0 |
| `sbom` | `catalogue/negotiator` | catalogue: package removed: negotiator@1.0.0 |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `catalogue/node-gyp` | catalogue: package removed: node-gyp@11.5.0 |
| `sbom` | `catalogue/nopt` | catalogue: package removed: nopt@8.1.0 |
| `sbom` | `catalogue/normalize-package-data` | catalogue: package removed: normalize-package-data@7.0.1 |
| `sbom` | `catalogue/npm` | catalogue: package removed: npm@10.9.8 |
| `sbom` | `catalogue/npm-audit-report` | catalogue: package removed: npm-audit-report@6.0.0 |
| `sbom` | `catalogue/npm-bundled` | catalogue: package removed: npm-bundled@4.0.0 |
| `sbom` | `catalogue/npm-install-checks` | catalogue: package removed: npm-install-checks@7.1.2 |
| `sbom` | `catalogue/npm-normalize-package-bin` | catalogue: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `catalogue/npm-package-arg` | catalogue: package removed: npm-package-arg@12.0.2 |
| `sbom` | `catalogue/npm-packlist` | catalogue: package removed: npm-packlist@9.0.0 |
| `sbom` | `catalogue/npm-pick-manifest` | catalogue: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `catalogue/npm-profile` | catalogue: package removed: npm-profile@11.0.1 |
| `sbom` | `catalogue/npm-registry-fetch` | catalogue: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `catalogue/npm-user-validate` | catalogue: package removed: npm-user-validate@3.0.0 |
| `sbom` | `catalogue/p-map` | catalogue: package removed: p-map@7.0.4 |
| `sbom` | `catalogue/package-json-from-dist` | catalogue: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `catalogue/pacote` | catalogue: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `catalogue/parse-conflict-json` | catalogue: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `catalogue/path-key` | catalogue: package removed: path-key@3.1.1 |
| `sbom` | `catalogue/path-scurry` | catalogue: package removed: path-scurry@1.11.1 |
| `sbom` | `catalogue/picomatch` | catalogue: package removed: picomatch@4.0.3 |
| `sbom` | `catalogue/postcss-selector-parser` | catalogue: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `catalogue/proc-log` | catalogue: package removed: proc-log@5.0.0 |
| `sbom` | `catalogue/proggy` | catalogue: package removed: proggy@3.0.0 |
| `sbom` | `catalogue/promise-all-reject-late` | catalogue: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `catalogue/promise-call-limit` | catalogue: package removed: promise-call-limit@3.0.2 |
| `sbom` | `catalogue/promise-retry` | catalogue: package removed: promise-retry@2.0.1 |
| `sbom` | `catalogue/promzard` | catalogue: package removed: promzard@2.0.0 |
| `sbom` | `catalogue/qrcode-terminal` | catalogue: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `catalogue/read` | catalogue: package removed: read@4.1.0 |
| `sbom` | `catalogue/read-cmd-shim` | catalogue: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `catalogue/read-package-json-fast` | catalogue: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `catalogue/retry` | catalogue: package removed: retry@0.12.0 |
| `sbom` | `catalogue/safer-buffer` | catalogue: package removed: safer-buffer@2.1.2 |
| `sbom` | `catalogue/semver` | catalogue: package removed: semver@7.7.4 |
| `sbom` | `catalogue/shebang-command` | catalogue: package removed: shebang-command@2.0.0 |
| `sbom` | `catalogue/shebang-regex` | catalogue: package removed: shebang-regex@3.0.0 |
| `sbom` | `catalogue/signal-exit` | catalogue: package removed: signal-exit@4.1.0 |
| `sbom` | `catalogue/sigstore` | catalogue: package removed: sigstore@3.1.0 |
| `sbom` | `catalogue/smart-buffer` | catalogue: package removed: smart-buffer@4.2.0 |
| `sbom` | `catalogue/socks` | catalogue: package removed: socks@2.8.7 |
| `sbom` | `catalogue/socks-proxy-agent` | catalogue: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `catalogue/spdx-correct` | catalogue: package removed: spdx-correct@3.2.0 |
| `sbom` | `catalogue/spdx-exceptions` | catalogue: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `catalogue/spdx-expression-parse` | catalogue: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `catalogue/spdx-license-ids` | catalogue: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `catalogue/ssri` | catalogue: package removed: ssri@12.0.0 |
| `sbom` | `catalogue/string-width` | catalogue: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `catalogue/strip-ansi` | catalogue: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `catalogue/supports-color` | catalogue: package removed: supports-color@9.4.0 |
| `sbom` | `catalogue/tar` | catalogue: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `catalogue/text-table` | catalogue: package removed: text-table@0.2.0 |
| `sbom` | `catalogue/tiny-relative-date` | catalogue: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `catalogue/tinyglobby` | catalogue: package removed: tinyglobby@0.2.15 |
| `sbom` | `catalogue/treeverse` | catalogue: package removed: treeverse@3.0.0 |
| `sbom` | `catalogue/tuf-js` | catalogue: package removed: tuf-js@3.1.0 |
| `sbom` | `catalogue/tzdata` | catalogue: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `catalogue/unique-filename` | catalogue: package removed: unique-filename@4.0.0 |
| `sbom` | `catalogue/unique-slug` | catalogue: package removed: unique-slug@5.0.0 |
| `sbom` | `catalogue/util-deprecate` | catalogue: package removed: util-deprecate@1.0.2 |
| `sbom` | `catalogue/validate-npm-package-license` | catalogue: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `catalogue/validate-npm-package-name` | catalogue: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `catalogue/walk-up-path` | catalogue: package removed: walk-up-path@3.0.1 |
| `sbom` | `catalogue/which` | catalogue: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `catalogue/wrap-ansi` | catalogue: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `catalogue/write-file-atomic` | catalogue: package removed: write-file-atomic@6.0.0 |
| `sbom` | `catalogue/yallist` | catalogue: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `catalogue/yarn` | catalogue: package removed: yarn@1.22.22 |
| `image-manifest` | `live/layers` | live: 9 layer(s) on a, 10 on b |
| `image-manifest` | `live/label/org.opencontainers.image.vendor` | live: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `live/@isaacs/cliui` | live: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `live/@isaacs/fs-minipass` | live: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `live/@isaacs/string-locale-compare` | live: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `live/@npmcli/agent` | live: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `live/@npmcli/arborist` | live: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `live/@npmcli/config` | live: package removed: @npmcli/config@9.0.0 |
| `sbom` | `live/@npmcli/fs` | live: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `live/@npmcli/git` | live: package removed: @npmcli/git@6.0.3 |
| `sbom` | `live/@npmcli/installed-package-contents` | live: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `live/@npmcli/map-workspaces` | live: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `live/@npmcli/metavuln-calculator` | live: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `live/@npmcli/name-from-folder` | live: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `live/@npmcli/node-gyp` | live: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `live/@npmcli/package-json` | live: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `live/@npmcli/promise-spawn` | live: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `live/@npmcli/query` | live: package removed: @npmcli/query@4.0.1 |
| `sbom` | `live/@npmcli/redact` | live: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `live/@npmcli/run-script` | live: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `live/@pkgjs/parseargs` | live: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `live/@sigstore/bundle` | live: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `live/@sigstore/core` | live: package removed: @sigstore/core@2.0.0 |
| `sbom` | `live/@sigstore/protobuf-specs` | live: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `live/@sigstore/sign` | live: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `live/@sigstore/tuf` | live: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `live/@sigstore/verify` | live: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `live/@tufjs/canonical-json` | live: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `live/@tufjs/models` | live: package removed: @tufjs/models@3.0.1 |
| `sbom` | `live/abbrev` | live: package removed: abbrev@3.0.1 |
| `sbom` | `live/agent-base` | live: package removed: agent-base@7.1.4 |
| `sbom` | `live/ansi-regex` | live: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `live/ansi-styles` | live: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `live/aproba` | live: package removed: aproba@2.1.0 |
| `sbom` | `live/archy` | live: package removed: archy@1.0.0 |
| `sbom` | `live/balanced-match` | live: package removed: balanced-match@1.0.2 |
| `sbom` | `live/bin-links` | live: package removed: bin-links@5.0.0 |
| `sbom` | `live/binary-extensions` | live: package removed: binary-extensions@2.3.0 |
| `sbom` | `live/brace-expansion` | live: package removed: brace-expansion@2.0.2 |
| `sbom` | `live/cacache` | live: package removed: cacache@19.0.1 |
| `sbom` | `live/chalk` | live: package removed: chalk@5.6.2 |
| `sbom` | `live/chownr` | live: package removed: chownr@3.0.0 |
| `sbom` | `live/ci-info` | live: package removed: ci-info@4.4.0 |
| `sbom` | `live/cidr-regex` | live: package removed: cidr-regex@4.1.3 |
| `sbom` | `live/cli-columns` | live: package removed: cli-columns@4.0.0 |
| `sbom` | `live/cmd-shim` | live: package removed: cmd-shim@7.0.0 |
| `sbom` | `live/color-convert` | live: package removed: color-convert@2.0.1 |
| `sbom` | `live/color-name` | live: package removed: color-name@1.1.4 |
| `sbom` | `live/common-ancestor-path` | live: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `live/corepack` | live: package removed: corepack@0.34.6 |
| `sbom` | `live/cross-spawn` | live: package removed: cross-spawn@7.0.6 |
| `sbom` | `live/cssesc` | live: package removed: cssesc@3.0.0 |
| `sbom` | `live/debug` | live: package removed: debug@4.4.3 |
| `sbom` | `live/diff` | live: package removed: diff@5.2.2 |
| `sbom` | `live/eastasianwidth` | live: package removed: eastasianwidth@0.2.0 |
| `sbom` | `live/emoji-regex` | live: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `live/encoding` | live: package removed: encoding@0.1.13 |
| `sbom` | `live/env-paths` | live: package removed: env-paths@2.2.1 |
| `sbom` | `live/err-code` | live: package removed: err-code@2.0.3 |
| `sbom` | `live/exponential-backoff` | live: package removed: exponential-backoff@3.1.3 |
| `sbom` | `live/fastest-levenshtein` | live: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `live/fdir` | live: package removed: fdir@6.5.0 |
| `sbom` | `live/foreground-child` | live: package removed: foreground-child@3.3.1 |
| `sbom` | `live/fs-minipass` | live: package removed: fs-minipass@3.0.3 |
| `sbom` | `live/glob` | live: package removed: glob@10.5.0 |
| `sbom` | `live/graceful-fs` | live: package removed: graceful-fs@4.2.11 |
| `sbom` | `live/hosted-git-info` | live: package removed: hosted-git-info@8.1.0 |
| `sbom` | `live/http-cache-semantics` | live: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `live/http-proxy-agent` | live: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `live/https-proxy-agent` | live: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `live/iconv-lite` | live: package removed: iconv-lite@0.6.3 |
| `sbom` | `live/ignore-walk` | live: package removed: ignore-walk@7.0.0 |
| `sbom` | `live/imurmurhash` | live: package removed: imurmurhash@0.1.4 |
| `sbom` | `live/ini` | live: package removed: ini@5.0.0 |
| `sbom` | `live/init-package-json` | live: package removed: init-package-json@7.0.2 |
| `sbom` | `live/ip-address` | live: package removed: ip-address@10.1.0 |
| `sbom` | `live/ip-regex` | live: package removed: ip-regex@5.0.0 |
| `sbom` | `live/is-cidr` | live: package removed: is-cidr@5.1.1 |
| `sbom` | `live/is-fullwidth-code-point` | live: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `live/isexe` | live: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `live/jackspeak` | live: package removed: jackspeak@3.4.3 |
| `sbom` | `live/json-parse-even-better-errors` | live: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `live/json-stringify-nice` | live: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `live/jsonparse` | live: package removed: jsonparse@1.3.1 |
| `sbom` | `live/just-diff` | live: package removed: just-diff@6.0.2 |
| `sbom` | `live/just-diff-apply` | live: package removed: just-diff-apply@5.5.0 |
| `sbom` | `live/libnpmaccess` | live: package removed: libnpmaccess@9.0.0 |
| `sbom` | `live/libnpmdiff` | live: package removed: libnpmdiff@7.0.5 |
| `sbom` | `live/libnpmexec` | live: package removed: libnpmexec@9.0.5 |
| `sbom` | `live/libnpmfund` | live: package removed: libnpmfund@6.0.5 |
| `sbom` | `live/libnpmhook` | live: package removed: libnpmhook@11.0.0 |
| `sbom` | `live/libnpmorg` | live: package removed: libnpmorg@7.0.0 |
| `sbom` | `live/libnpmpack` | live: package removed: libnpmpack@8.0.5 |
| `sbom` | `live/libnpmpublish` | live: package removed: libnpmpublish@10.0.2 |
| `sbom` | `live/libnpmsearch` | live: package removed: libnpmsearch@8.0.0 |
| `sbom` | `live/libnpmteam` | live: package removed: libnpmteam@7.0.0 |
| `sbom` | `live/libnpmversion` | live: package removed: libnpmversion@7.0.0 |
| `sbom` | `live/lru-cache` | live: package removed: lru-cache@10.4.3 |
| `sbom` | `live/make-fetch-happen` | live: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `live/minimatch` | live: package removed: minimatch@9.0.9 |
| `sbom` | `live/minipass` | live: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `live/minipass-collect` | live: package removed: minipass-collect@2.0.1 |
| `sbom` | `live/minipass-fetch` | live: package removed: minipass-fetch@4.0.1 |
| `sbom` | `live/minipass-flush` | live: package removed: minipass-flush@1.0.5 |
| `sbom` | `live/minipass-pipeline` | live: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `live/minipass-sized` | live: package removed: minipass-sized@1.0.3 |
| `sbom` | `live/minizlib` | live: package removed: minizlib@3.1.0 |
| `sbom` | `live/ms` | live: package removed: ms@2.1.3 |
| `sbom` | `live/mute-stream` | live: package removed: mute-stream@2.0.0 |
| `sbom` | `live/negotiator` | live: package removed: negotiator@1.0.0 |
| `sbom` | `live/node` | live: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `live/node-gyp` | live: package removed: node-gyp@11.5.0 |
| `sbom` | `live/nopt` | live: package removed: nopt@8.1.0 |
| `sbom` | `live/normalize-package-data` | live: package removed: normalize-package-data@7.0.1 |
| `sbom` | `live/npm` | live: package removed: npm@10.9.8 |
| `sbom` | `live/npm-audit-report` | live: package removed: npm-audit-report@6.0.0 |
| `sbom` | `live/npm-bundled` | live: package removed: npm-bundled@4.0.0 |
| `sbom` | `live/npm-install-checks` | live: package removed: npm-install-checks@7.1.2 |
| `sbom` | `live/npm-normalize-package-bin` | live: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `live/npm-package-arg` | live: package removed: npm-package-arg@12.0.2 |
| `sbom` | `live/npm-packlist` | live: package removed: npm-packlist@9.0.0 |
| `sbom` | `live/npm-pick-manifest` | live: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `live/npm-profile` | live: package removed: npm-profile@11.0.1 |
| `sbom` | `live/npm-registry-fetch` | live: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `live/npm-user-validate` | live: package removed: npm-user-validate@3.0.0 |
| `sbom` | `live/p-map` | live: package removed: p-map@7.0.4 |
| `sbom` | `live/package-json-from-dist` | live: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `live/pacote` | live: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `live/parse-conflict-json` | live: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `live/path-key` | live: package removed: path-key@3.1.1 |
| `sbom` | `live/path-scurry` | live: package removed: path-scurry@1.11.1 |
| `sbom` | `live/picomatch` | live: package removed: picomatch@4.0.3 |
| `sbom` | `live/postcss-selector-parser` | live: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `live/proc-log` | live: package removed: proc-log@5.0.0 |
| `sbom` | `live/proggy` | live: package removed: proggy@3.0.0 |
| `sbom` | `live/promise-all-reject-late` | live: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `live/promise-call-limit` | live: package removed: promise-call-limit@3.0.2 |
| `sbom` | `live/promise-retry` | live: package removed: promise-retry@2.0.1 |
| `sbom` | `live/promzard` | live: package removed: promzard@2.0.0 |
| `sbom` | `live/qrcode-terminal` | live: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `live/read` | live: package removed: read@4.1.0 |
| `sbom` | `live/read-cmd-shim` | live: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `live/read-package-json-fast` | live: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `live/retry` | live: package removed: retry@0.12.0 |
| `sbom` | `live/safer-buffer` | live: package removed: safer-buffer@2.1.2 |
| `sbom` | `live/semver` | live: package removed: semver@7.7.4 |
| `sbom` | `live/shebang-command` | live: package removed: shebang-command@2.0.0 |
| `sbom` | `live/shebang-regex` | live: package removed: shebang-regex@3.0.0 |
| `sbom` | `live/signal-exit` | live: package removed: signal-exit@4.1.0 |
| `sbom` | `live/sigstore` | live: package removed: sigstore@3.1.0 |
| `sbom` | `live/smart-buffer` | live: package removed: smart-buffer@4.2.0 |
| `sbom` | `live/socks` | live: package removed: socks@2.8.7 |
| `sbom` | `live/socks-proxy-agent` | live: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `live/spdx-correct` | live: package removed: spdx-correct@3.2.0 |
| `sbom` | `live/spdx-exceptions` | live: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `live/spdx-expression-parse` | live: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `live/spdx-license-ids` | live: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `live/ssri` | live: package removed: ssri@12.0.0 |
| `sbom` | `live/string-width` | live: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `live/strip-ansi` | live: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `live/supports-color` | live: package removed: supports-color@9.4.0 |
| `sbom` | `live/tar` | live: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `live/text-table` | live: package removed: text-table@0.2.0 |
| `sbom` | `live/tiny-relative-date` | live: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `live/tinyglobby` | live: package removed: tinyglobby@0.2.15 |
| `sbom` | `live/treeverse` | live: package removed: treeverse@3.0.0 |
| `sbom` | `live/tuf-js` | live: package removed: tuf-js@3.1.0 |
| `sbom` | `live/tzdata` | live: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `live/unique-filename` | live: package removed: unique-filename@4.0.0 |
| `sbom` | `live/unique-slug` | live: package removed: unique-slug@5.0.0 |
| `sbom` | `live/util-deprecate` | live: package removed: util-deprecate@1.0.2 |
| `sbom` | `live/validate-npm-package-license` | live: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `live/validate-npm-package-name` | live: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `live/walk-up-path` | live: package removed: walk-up-path@3.0.1 |
| `sbom` | `live/which` | live: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `live/wrap-ansi` | live: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `live/write-file-atomic` | live: package removed: write-file-atomic@6.0.0 |
| `sbom` | `live/yallist` | live: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `live/yarn` | live: package removed: yarn@1.22.22 |
| `image-manifest` | `time/layers` | time: 9 layer(s) on a, 10 on b |
| `image-manifest` | `time/label/org.opencontainers.image.vendor` | time: label org.opencontainers.image.vendor added (Tutors SDK) |
| `sbom` | `time/@isaacs/cliui` | time: package removed: @isaacs/cliui@8.0.2 |
| `sbom` | `time/@isaacs/fs-minipass` | time: package removed: @isaacs/fs-minipass@4.0.1 |
| `sbom` | `time/@isaacs/string-locale-compare` | time: package removed: @isaacs/string-locale-compare@1.1.0 |
| `sbom` | `time/@npmcli/agent` | time: package removed: @npmcli/agent@3.0.0 |
| `sbom` | `time/@npmcli/arborist` | time: package removed: @npmcli/arborist@8.0.5 |
| `sbom` | `time/@npmcli/config` | time: package removed: @npmcli/config@9.0.0 |
| `sbom` | `time/@npmcli/fs` | time: package removed: @npmcli/fs@4.0.0 |
| `sbom` | `time/@npmcli/git` | time: package removed: @npmcli/git@6.0.3 |
| `sbom` | `time/@npmcli/installed-package-contents` | time: package removed: @npmcli/installed-package-contents@3.0.0 |
| `sbom` | `time/@npmcli/map-workspaces` | time: package removed: @npmcli/map-workspaces@4.0.2 |
| `sbom` | `time/@npmcli/metavuln-calculator` | time: package removed: @npmcli/metavuln-calculator@8.0.1 |
| `sbom` | `time/@npmcli/name-from-folder` | time: package removed: @npmcli/name-from-folder@3.0.0 |
| `sbom` | `time/@npmcli/node-gyp` | time: package removed: @npmcli/node-gyp@4.0.0 |
| `sbom` | `time/@npmcli/package-json` | time: package removed: @npmcli/package-json@6.2.0 |
| `sbom` | `time/@npmcli/promise-spawn` | time: package removed: @npmcli/promise-spawn@8.0.3 |
| `sbom` | `time/@npmcli/query` | time: package removed: @npmcli/query@4.0.1 |
| `sbom` | `time/@npmcli/redact` | time: package removed: @npmcli/redact@3.2.2 |
| `sbom` | `time/@npmcli/run-script` | time: package removed: @npmcli/run-script@9.1.0 |
| `sbom` | `time/@pkgjs/parseargs` | time: package removed: @pkgjs/parseargs@0.11.0 |
| `sbom` | `time/@sigstore/bundle` | time: package removed: @sigstore/bundle@3.1.0 |
| `sbom` | `time/@sigstore/core` | time: package removed: @sigstore/core@2.0.0 |
| `sbom` | `time/@sigstore/protobuf-specs` | time: package removed: @sigstore/protobuf-specs@0.4.3 |
| `sbom` | `time/@sigstore/sign` | time: package removed: @sigstore/sign@3.1.0 |
| `sbom` | `time/@sigstore/tuf` | time: package removed: @sigstore/tuf@3.1.1 |
| `sbom` | `time/@sigstore/verify` | time: package removed: @sigstore/verify@2.1.1 |
| `sbom` | `time/@supabase/auth-js` | time: package bumped: @supabase/auth-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/functions-js` | time: package bumped: @supabase/functions-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/postgrest-js` | time: package bumped: @supabase/postgrest-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/realtime-js` | time: package bumped: @supabase/realtime-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/storage-js` | time: package bumped: @supabase/storage-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@supabase/supabase-js` | time: package bumped: @supabase/supabase-js 2.116.0 → 2.117.2 |
| `sbom` | `time/@tufjs/canonical-json` | time: package removed: @tufjs/canonical-json@2.0.0 |
| `sbom` | `time/@tufjs/models` | time: package removed: @tufjs/models@3.0.1 |
| `sbom` | `time/abbrev` | time: package removed: abbrev@3.0.1 |
| `sbom` | `time/agent-base` | time: package removed: agent-base@7.1.4 |
| `sbom` | `time/ansi-regex` | time: package removed: ansi-regex@5.0.1, 6.2.2 |
| `sbom` | `time/ansi-styles` | time: package removed: ansi-styles@4.3.0, 6.2.3 |
| `sbom` | `time/aproba` | time: package removed: aproba@2.1.0 |
| `sbom` | `time/archy` | time: package removed: archy@1.0.0 |
| `sbom` | `time/balanced-match` | time: package removed: balanced-match@1.0.2 |
| `sbom` | `time/bin-links` | time: package removed: bin-links@5.0.0 |
| `sbom` | `time/binary-extensions` | time: package removed: binary-extensions@2.3.0 |
| `sbom` | `time/brace-expansion` | time: package removed: brace-expansion@2.0.2 |
| `sbom` | `time/cacache` | time: package removed: cacache@19.0.1 |
| `sbom` | `time/chalk` | time: package removed: chalk@5.6.2 |
| `sbom` | `time/chownr` | time: package removed: chownr@3.0.0 |
| `sbom` | `time/ci-info` | time: package removed: ci-info@4.4.0 |
| `sbom` | `time/cidr-regex` | time: package removed: cidr-regex@4.1.3 |
| `sbom` | `time/cli-columns` | time: package removed: cli-columns@4.0.0 |
| `sbom` | `time/cmd-shim` | time: package removed: cmd-shim@7.0.0 |
| `sbom` | `time/color-convert` | time: package removed: color-convert@2.0.1 |
| `sbom` | `time/color-name` | time: package removed: color-name@1.1.4 |
| `sbom` | `time/common-ancestor-path` | time: package removed: common-ancestor-path@1.0.1 |
| `sbom` | `time/corepack` | time: package removed: corepack@0.34.6 |
| `sbom` | `time/cross-spawn` | time: package removed: cross-spawn@7.0.6 |
| `sbom` | `time/cssesc` | time: package removed: cssesc@3.0.0 |
| `sbom` | `time/debug` | time: package removed: debug@4.4.3 |
| `sbom` | `time/diff` | time: package removed: diff@5.2.2 |
| `sbom` | `time/eastasianwidth` | time: package removed: eastasianwidth@0.2.0 |
| `sbom` | `time/emoji-regex` | time: package removed: emoji-regex@8.0.0, 9.2.2 |
| `sbom` | `time/encoding` | time: package removed: encoding@0.1.13 |
| `sbom` | `time/env-paths` | time: package removed: env-paths@2.2.1 |
| `sbom` | `time/err-code` | time: package removed: err-code@2.0.3 |
| `sbom` | `time/exponential-backoff` | time: package removed: exponential-backoff@3.1.3 |
| `sbom` | `time/fastest-levenshtein` | time: package removed: fastest-levenshtein@1.0.16 |
| `sbom` | `time/fdir` | time: package removed: fdir@6.5.0 |
| `sbom` | `time/foreground-child` | time: package removed: foreground-child@3.3.1 |
| `sbom` | `time/fs-minipass` | time: package removed: fs-minipass@3.0.3 |
| `sbom` | `time/glob` | time: package removed: glob@10.5.0 |
| `sbom` | `time/graceful-fs` | time: package removed: graceful-fs@4.2.11 |
| `sbom` | `time/hosted-git-info` | time: package removed: hosted-git-info@8.1.0 |
| `sbom` | `time/http-cache-semantics` | time: package removed: http-cache-semantics@4.2.0 |
| `sbom` | `time/http-proxy-agent` | time: package removed: http-proxy-agent@7.0.2 |
| `sbom` | `time/https-proxy-agent` | time: package removed: https-proxy-agent@7.0.6 |
| `sbom` | `time/iconv-lite` | time: package removed: iconv-lite@0.6.3 |
| `sbom` | `time/ignore-walk` | time: package removed: ignore-walk@7.0.0 |
| `sbom` | `time/imurmurhash` | time: package removed: imurmurhash@0.1.4 |
| `sbom` | `time/ini` | time: package removed: ini@5.0.0 |
| `sbom` | `time/init-package-json` | time: package removed: init-package-json@7.0.2 |
| `sbom` | `time/ip-address` | time: package removed: ip-address@10.1.0 |
| `sbom` | `time/ip-regex` | time: package removed: ip-regex@5.0.0 |
| `sbom` | `time/is-cidr` | time: package removed: is-cidr@5.1.1 |
| `sbom` | `time/is-fullwidth-code-point` | time: package removed: is-fullwidth-code-point@3.0.0 |
| `sbom` | `time/isexe` | time: package removed: isexe@2.0.0, 3.1.5 |
| `sbom` | `time/jackspeak` | time: package removed: jackspeak@3.4.3 |
| `sbom` | `time/json-parse-even-better-errors` | time: package removed: json-parse-even-better-errors@4.0.0 |
| `sbom` | `time/json-stringify-nice` | time: package removed: json-stringify-nice@1.1.4 |
| `sbom` | `time/jsonparse` | time: package removed: jsonparse@1.3.1 |
| `sbom` | `time/just-diff` | time: package removed: just-diff@6.0.2 |
| `sbom` | `time/just-diff-apply` | time: package removed: just-diff-apply@5.5.0 |
| `sbom` | `time/libnpmaccess` | time: package removed: libnpmaccess@9.0.0 |
| `sbom` | `time/libnpmdiff` | time: package removed: libnpmdiff@7.0.5 |
| `sbom` | `time/libnpmexec` | time: package removed: libnpmexec@9.0.5 |
| `sbom` | `time/libnpmfund` | time: package removed: libnpmfund@6.0.5 |
| `sbom` | `time/libnpmhook` | time: package removed: libnpmhook@11.0.0 |
| `sbom` | `time/libnpmorg` | time: package removed: libnpmorg@7.0.0 |
| `sbom` | `time/libnpmpack` | time: package removed: libnpmpack@8.0.5 |
| `sbom` | `time/libnpmpublish` | time: package removed: libnpmpublish@10.0.2 |
| `sbom` | `time/libnpmsearch` | time: package removed: libnpmsearch@8.0.0 |
| `sbom` | `time/libnpmteam` | time: package removed: libnpmteam@7.0.0 |
| `sbom` | `time/libnpmversion` | time: package removed: libnpmversion@7.0.0 |
| `sbom` | `time/lru-cache` | time: package removed: lru-cache@10.4.3 |
| `sbom` | `time/make-fetch-happen` | time: package removed: make-fetch-happen@14.0.3 |
| `sbom` | `time/minimatch` | time: package removed: minimatch@9.0.9 |
| `sbom` | `time/minipass` | time: package removed: minipass@3.3.6, 7.1.3 |
| `sbom` | `time/minipass-collect` | time: package removed: minipass-collect@2.0.1 |
| `sbom` | `time/minipass-fetch` | time: package removed: minipass-fetch@4.0.1 |
| `sbom` | `time/minipass-flush` | time: package removed: minipass-flush@1.0.5 |
| `sbom` | `time/minipass-pipeline` | time: package removed: minipass-pipeline@1.2.4 |
| `sbom` | `time/minipass-sized` | time: package removed: minipass-sized@1.0.3 |
| `sbom` | `time/minizlib` | time: package removed: minizlib@3.1.0 |
| `sbom` | `time/ms` | time: package removed: ms@2.1.3 |
| `sbom` | `time/mute-stream` | time: package removed: mute-stream@2.0.0 |
| `sbom` | `time/negotiator` | time: package removed: negotiator@1.0.0 |
| `sbom` | `time/node` | time: package bumped: node 22.23.2 → 22.23.3 |
| `sbom` | `time/node-gyp` | time: package removed: node-gyp@11.5.0 |
| `sbom` | `time/nopt` | time: package removed: nopt@8.1.0 |
| `sbom` | `time/normalize-package-data` | time: package removed: normalize-package-data@7.0.1 |
| `sbom` | `time/npm` | time: package removed: npm@10.9.8 |
| `sbom` | `time/npm-audit-report` | time: package removed: npm-audit-report@6.0.0 |
| `sbom` | `time/npm-bundled` | time: package removed: npm-bundled@4.0.0 |
| `sbom` | `time/npm-install-checks` | time: package removed: npm-install-checks@7.1.2 |
| `sbom` | `time/npm-normalize-package-bin` | time: package removed: npm-normalize-package-bin@4.0.0 |
| `sbom` | `time/npm-package-arg` | time: package removed: npm-package-arg@12.0.2 |
| `sbom` | `time/npm-packlist` | time: package removed: npm-packlist@9.0.0 |
| `sbom` | `time/npm-pick-manifest` | time: package removed: npm-pick-manifest@10.0.0 |
| `sbom` | `time/npm-profile` | time: package removed: npm-profile@11.0.1 |
| `sbom` | `time/npm-registry-fetch` | time: package removed: npm-registry-fetch@18.0.2 |
| `sbom` | `time/npm-user-validate` | time: package removed: npm-user-validate@3.0.0 |
| `sbom` | `time/p-map` | time: package removed: p-map@7.0.4 |
| `sbom` | `time/package-json-from-dist` | time: package removed: package-json-from-dist@1.0.1 |
| `sbom` | `time/pacote` | time: package removed: pacote@19.0.2, 20.0.1 |
| `sbom` | `time/parse-conflict-json` | time: package removed: parse-conflict-json@4.0.0 |
| `sbom` | `time/path-key` | time: package removed: path-key@3.1.1 |
| `sbom` | `time/path-scurry` | time: package removed: path-scurry@1.11.1 |
| `sbom` | `time/picomatch` | time: package removed: picomatch@4.0.3 |
| `sbom` | `time/postcss-selector-parser` | time: package removed: postcss-selector-parser@7.1.1 |
| `sbom` | `time/proc-log` | time: package removed: proc-log@5.0.0 |
| `sbom` | `time/proggy` | time: package removed: proggy@3.0.0 |
| `sbom` | `time/promise-all-reject-late` | time: package removed: promise-all-reject-late@1.0.1 |
| `sbom` | `time/promise-call-limit` | time: package removed: promise-call-limit@3.0.2 |
| `sbom` | `time/promise-retry` | time: package removed: promise-retry@2.0.1 |
| `sbom` | `time/promzard` | time: package removed: promzard@2.0.0 |
| `sbom` | `time/qrcode-terminal` | time: package removed: qrcode-terminal@0.12.0 |
| `sbom` | `time/read` | time: package removed: read@4.1.0 |
| `sbom` | `time/read-cmd-shim` | time: package removed: read-cmd-shim@5.0.0 |
| `sbom` | `time/read-package-json-fast` | time: package removed: read-package-json-fast@4.0.0 |
| `sbom` | `time/retry` | time: package removed: retry@0.12.0 |
| `sbom` | `time/safer-buffer` | time: package removed: safer-buffer@2.1.2 |
| `sbom` | `time/semver` | time: package removed: semver@7.7.4 |
| `sbom` | `time/shebang-command` | time: package removed: shebang-command@2.0.0 |
| `sbom` | `time/shebang-regex` | time: package removed: shebang-regex@3.0.0 |
| `sbom` | `time/signal-exit` | time: package removed: signal-exit@4.1.0 |
| `sbom` | `time/sigstore` | time: package removed: sigstore@3.1.0 |
| `sbom` | `time/smart-buffer` | time: package removed: smart-buffer@4.2.0 |
| `sbom` | `time/socks` | time: package removed: socks@2.8.7 |
| `sbom` | `time/socks-proxy-agent` | time: package removed: socks-proxy-agent@8.0.5 |
| `sbom` | `time/spdx-correct` | time: package removed: spdx-correct@3.2.0 |
| `sbom` | `time/spdx-exceptions` | time: package removed: spdx-exceptions@2.5.0 |
| `sbom` | `time/spdx-expression-parse` | time: package removed: spdx-expression-parse@3.0.1, 4.0.0 |
| `sbom` | `time/spdx-license-ids` | time: package removed: spdx-license-ids@3.0.23 |
| `sbom` | `time/ssri` | time: package removed: ssri@12.0.0 |
| `sbom` | `time/string-width` | time: package removed: string-width@4.2.3, 5.1.2 |
| `sbom` | `time/strip-ansi` | time: package removed: strip-ansi@6.0.1, 7.2.0 |
| `sbom` | `time/supports-color` | time: package removed: supports-color@9.4.0 |
| `sbom` | `time/tar` | time: package bumped: tar 1.34+dfsg-1.2+deb12u1, 7.5.11 → 1.34+dfsg-1.2+deb12u1 |
| `sbom` | `time/text-table` | time: package removed: text-table@0.2.0 |
| `sbom` | `time/tiny-relative-date` | time: package removed: tiny-relative-date@1.3.0 |
| `sbom` | `time/tinyglobby` | time: package removed: tinyglobby@0.2.15 |
| `sbom` | `time/treeverse` | time: package removed: treeverse@3.0.0 |
| `sbom` | `time/tuf-js` | time: package removed: tuf-js@3.1.0 |
| `sbom` | `time/tzdata` | time: package bumped: tzdata 2026b-0+deb12u1 → 2026c-0+deb12u1 |
| `sbom` | `time/unique-filename` | time: package removed: unique-filename@4.0.0 |
| `sbom` | `time/unique-slug` | time: package removed: unique-slug@5.0.0 |
| `sbom` | `time/util-deprecate` | time: package removed: util-deprecate@1.0.2 |
| `sbom` | `time/validate-npm-package-license` | time: package removed: validate-npm-package-license@3.0.4 |
| `sbom` | `time/validate-npm-package-name` | time: package removed: validate-npm-package-name@6.0.2 |
| `sbom` | `time/walk-up-path` | time: package removed: walk-up-path@3.0.1 |
| `sbom` | `time/which` | time: package removed: which@2.0.2, 5.0.0 |
| `sbom` | `time/wrap-ansi` | time: package removed: wrap-ansi@7.0.0, 8.1.0 |
| `sbom` | `time/write-file-atomic` | time: package removed: write-file-atomic@6.0.0 |
| `sbom` | `time/yallist` | time: package removed: yallist@4.0.0, 5.0.0 |
| `sbom` | `time/yarn` | time: package removed: yarn@1.22.22 |

<details><summary>Detail of 20 difference(s)</summary>

`dom` `reader:home`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - img "Tutors Open Source Project"
-      - heading "Tutors Open Source Project" [level=2]
-      - paragraph: Open Web Learning Components
-    - navigation:
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
+    - link "Tutors home":
+      - /url: /
+      - img "Tutors"
+      - text: tutors
+    - link "My courses":
+      - /url: /
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Tutors
+    - link "My courses":
+      - /url: /
+    - link "Catalogue ↗":
+      - /url: https://catalogue.tutors.dev
+    - link "Live ↗":
+      - /url: https://live.tutors.dev
+    - link "Time ↗":
+      - /url: https://time.tutors.dev
+    - link "Create":
+      - /url: /create
+    - link "Docs":
+      - /url: /course/tutors-reference-manual
 - main:
-  - heading "Tutors:An Open Learning Web Toolkit" [level=1]
-  - paragraph:
-    - text: Open source components & services supporting the creation of learning experiences using web standards. Developed at
-    - link "SETU":
-      - /url: https://www.setu.ie
-    - text: ", Waterford, Ireland."
-  - link "Create":
-    - /url: /create
-  - link "Docs":
-    - /url: /course/tutors-reference-manual
-  - link "Source":
-    - /url: https://github.com/tutors-sdk/tutors-mono-repo
-  - link "Catalogue":
-    - /url: https://cata
… (1300 more characters in report.json)
```

`dom` `reader:home`

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

`dom` `reader:course`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Runway Fixture Course" [level=2]
-    - paragraph: Tutors CI
-    - navigation:
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
+    - heading "Runway Fixture Course" [level=1]:
+      - link "Runway Fixture Course":
+        - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
 - main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-      - /url: /wall/note/localhost:8080
-    - link "All labs in the course":
-      - /url: /wall/lab/localhost:8080
+  - navigation "Breadcrumbs":
+
… (1025 more characters in report.json)
```

`dom` `reader:course`

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

`dom` `reader:topic`

```
 - banner:
   - navigation "Main navigation":
-    - navigation:
-      - button "Open course info"
-    - heading "Topic 1" [level=2]
-    - paragraph: Runway Fixture Course
-    - navigation:
-      - button "Search this course": Search
-      - button "Open Theme Menu": Layout
-      - button "Anonymous Tutors Profile"
-      - button "Open course tree"
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - paragraph: Learn
+    - link "Course home":
+      - /url: /course/localhost:8080
+    - button "Open course info": Course Info
+    - button "Open course tree": Course Tree
+    - link "Resources":
+      - /url: /search/localhost:8080
 - main:
-  - navigation "Secondary navigation":
-    - navigation "Breadcrumbs":
-      - list:
-        - listitem:
-          - link "Go to Course Home":
-            - /url: /
-            - img "Tutors"
-        - listitem:
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Unit 1":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Topic 1":
-            - /url: /topic/localhost:8080/unit-1/topic-01
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-    
… (1800 more characters in report.json)
```

`dom` `reader:topic`

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

`dom` `reader:lab-step`

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
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Unit 1":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Topic 1":
-            - /url: /topic/localhost:8080/unit-1/topic-01
-        - listitem:
-          - link "Lab 1":
-            - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-      - /url: /wall/note/localhost:8080
-    - link "All labs in the course":
-      - /url: /wall/lab/localhost:8080
-  - navigation "Lab steps":
-    - list:
+- banner:
+  - navigation "Main navigation":
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - link "← Topic 1":
+      - /url: /topic/localhost:8080/unit-1/topic-01
+    - heading "Lab 1" [level=2]
+    - paragraph: Steps · 1 / 6
+    - list "Steps":
       - listitem:
-        - link "Lab 1":
+        - l
… (1611 more characters in report.json)
```

`dom` `reader:lab-step`

```
         - /url: "#getting-started"
     - paragraph: Describe the initial setup steps here.
-  - heading "Topic 1" [level=3]
-  - figure
-  - button "Expand all"
-  - tree "Tree View":
-    - treeitem "Talk 1" [level=1]:
-      - link "Talk 1":
-        - /url: /talk/localhost:8080/unit-1/topic-01/talk-01
-    - 'treeitem "Show or hide contents: Lab 1 Lab 1" [level=1]':
-      - 'button "Show or hide contents: Lab 1"'
-      - link "Lab 1":
-        - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - treeitem "Note 1" [level=1]:
-      - link "Note 1":
-        - /url: /note/localhost:8080/unit-1/topic-01/note-01
+  - navigation "Previous and next step":
+    - link "Next → Step 1":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-01
+- contentinfo "Site footer":
+  - img "Tutors"
+  - link "Tutors v:{{version}}":
+    - /url: https://tutors.dev
+    - paragraph: Tutors v:{{version}}
+  - paragraph:
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+  - link "South East Technological University":
+    - /url: https://setu.ie
+    - img "South East Technological University"
 - text: Runway Fixture Course
\ No newline at end of file
```

`dom` `reader:lab-step-2`

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
-          - link "Runway Fixture...":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Unit 1":
-            - /url: /course/localhost:8080
-        - listitem:
-          - link "Topic 1":
-            - /url: /topic/localhost:8080/unit-1/topic-01
-        - listitem:
-          - link "Lab 1":
-            - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - link "All talks in the course":
-      - /url: /wall/talk/localhost:8080
-    - link "All notes in the course":
-      - /url: /wall/note/localhost:8080
-    - link "All labs in the course":
-      - /url: /wall/lab/localhost:8080
-  - navigation "Lab steps":
-    - list:
+- banner:
+  - navigation "Main navigation":
+    - link "Runway Fixture Course":
+      - /url: /course/localhost:8080
+    - button "Search this course": Search
+    - button "Open Theme Menu": Preferences
+    - button "Anonymous Tutors Profile"
+- complementary "Course navigation":
+  - navigation:
+    - link "← Topic 1":
+      - /url: /topic/localhost:8080/unit-1/topic-01
+    - heading "Lab 1" [level=2]
+    - paragraph: Steps · 2 / 6
+    - list "Steps":
       - listitem:
-        - link "Lab 1":
+        - l
… (1612 more characters in report.json)
```

`dom` `reader:lab-step-2`

```
         - /url: "#step-1"
     - paragraph: Write your lab instructions for step 1 of 5 here.
-  - heading "Topic 1" [level=3]
-  - figure
-  - button "Expand all"
-  - tree "Tree View":
-    - treeitem "Talk 1" [level=1]:
-      - link "Talk 1":
-        - /url: /talk/localhost:8080/unit-1/topic-01/talk-01
-    - 'treeitem "Show or hide contents: Lab 1 Lab 1" [level=1]':
-      - 'button "Show or hide contents: Lab 1"'
-      - link "Lab 1":
-        - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01
-    - treeitem "Note 1" [level=1]:
-      - link "Note 1":
-        - /url: /note/localhost:8080/unit-1/topic-01/note-01
+  - navigation "Previous and next step":
+    - link "← Previous Lab 1":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Setup
+    - link "Next → Step 2":
+      - /url: /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-02
+- contentinfo "Site footer":
+  - img "Tutors"
+  - link "Tutors v:{{version}}":
+    - /url: https://tutors.dev
+    - paragraph: Tutors v:{{version}}
+  - paragraph:
+    - text: An
+    - link "Open Learning Web Toolkit":
+      - /url: /course/tutors-reference-manual
+    - text: ": Explore"
+    - link "What’s New in Tutors":
+      - /url: https://tutors.dev/note/tutors-reference-manual/side/note-whats-new
+  - link "South East Technological University":
+    - /url: https://setu.ie
+    - img "South East Technological University"
 - text: Runway Fixture Course
\ No newline at end of file
```

`screenshot` `reader:home`

```
diff image: diff/anonymous-student-reads-course-1/reader_home.png
```

`screenshot` `reader:course`

```
diff image: diff/anonymous-student-reads-course-1/reader_course.png
```

`screenshot` `reader:topic`

```
diff image: diff/anonymous-student-reads-course-1/reader_topic.png
```

`screenshot` `reader:lab-step`

```
diff image: diff/anonymous-student-reads-course-1/reader_lab-step.png
```

`screenshot` `reader:lab-step-2`

```
diff image: diff/anonymous-student-reads-course-1/reader_lab-step-2.png
```

`focus` `reader:home`

```
 a "Skip to content"
+a "Tutors home"
+a "My courses"
 button "Open Theme Menu"
 button "Anonymous Tutors Profile"
-a "SETU"
+a "My courses"
+a "Catalogue ↗"
+a "Live ↗"
+a "Time ↗"
 a "Create"
 a "Docs"
-a "Source"
-a "Catalogue"
-a "Live"
-a "Tutors v:{{version}}"
-a "Open Learning Web Toolkit"
-a "What’s New in Tutors"
\ No newline at end of file
+a "SETU"
\ No newline at end of file
```

`focus` `reader:course`

```
-a "Go to Course Home"
-a "Runway Fixture..."
-a "All talks in the course"
-a "All notes in the course"
-a "All labs in the course"
-a "Topic 1 Summary of this topic (this line"
-a "Topic 2 Summary of this topic (this line"
+a "My courses"
+a "Topic 1 topic"
+a "Topic 2 topic"
 a "Tutors v:{{version}}"
```

`focus` `reader:topic`

```
-a "Go to Course Home"
-a "Runway Fixture..."
+a "My courses"
+a "Runway Fixture Course"
 a "Unit 1"
-a "Topic 1"
-a "All talks in the course"
-a "All notes in the course"
-a "All labs in the course"
-a "Talk 1 Summary of this talk (appears on "
-a "Lab 1 Prerequisites"
+a "Talk 1 talk"
+a "Lab 1 lab"
 a "Prerequisites"
-a "Note 1 Summary of this note (appears on "
-a "Tutors v:{{version}}"
\ No newline at end of file
+a "Note 1 note"
+a "Tutors v:{{version}}"
+a "Open Learning Web Toolkit"
+a "What’s New in Tutors"
+a ""
\ No newline at end of file
```

`focus` `reader:lab-step`

```
-a "Go to Course Home"
-a "Runway Fixture..."
+a "My courses"
+a "Runway Fixture Course"
 a "Unit 1"
...
 a "Lab 1"
-a "All talks in the course"
-a "All notes in the course"
-a "All labs in the course"
-a "Lab 1"
-a "Step 1"
-a "Step 2"
-a "Step 3"
\ No newline at end of file
+a "Prerequisites"
+a "Getting Started"
+a "Next → Step 1"
+a "Tutors v:{{version}}"
+a "Open Learning Web Toolkit"
+a "What’s New in Tutors"
+a ""
\ No newline at end of file
```

`focus` `reader:lab-step-2`

```
+a "My courses"
+a "Runway Fixture Course"
+a "Unit 1"
+a "Topic 1"
 a "Step 1"
-button "Expand all"
-treeitem "Talk 1"
-a "Talk 1"
-a "Lab 1"
-a "Note 1"
\ No newline at end of file
+a "← Previous Lab 1"
+a "Next → Step 2"
+a "Tutors v:{{version}}"
+a "Open Learning Web Toolkit"
+a "What’s New in Tutors"
+a ""
\ No newline at end of file
```

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |
| catalogue | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |
| live | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |
| time | 1 finding (1 on production too) | 1 finding (1 on production too) | not evaluated |

### Informing (9; 9 unclaimed): reported, never gates

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
| `asset-graph` | `reader` | reader: the asset graph changed: 78 → 105 immutable requests (JS 75 → 84, CSS 3 → 21), 1.0 MB → 1.0 MB; 21 network and 2 headers difference(s) are this churn | no date set | unclaimed |

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 251.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 254.4 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 291 distinct package(s) (cosign attestation (signature verified)) | 104 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| catalogue | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| live | manifest | 9 layers, 230.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 233.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 277 distinct package(s) (cosign attestation (signature verified)) | 90 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |
| time | manifest | 9 layers, 232.1 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 239.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 287 distinct package(s) (cosign attestation (signature verified)) | 100 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** | **NOT COLLECTED: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)** |

### Upgrade rehearsal (compose)

| upstream | requests | failed | 5xx | p95 |
|---|---|---|---|---|
| a | 300 | 0 | 0 | 3.1 ms |
| b | 601 | 0 | 0 | 2.6 ms |
| **all** | 901 | 0 | 0 | switched at 16.6 s |

<details><summary>Informational (23)</summary>

- `console` reader:course: console message gone on b
- `console` reader:lab-step: console message gone on b
- `vulns` NOT COLLECTED: vulns of reader on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of catalogue on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of live on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vulns` NOT COLLECTED: vulns of time on both sides: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` NOT COLLECTED: startup time on side a: switched off with --startup-restarts 0
- `startup` NOT COLLECTED: startup time on side b: switched off with --startup-restarts 0
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on e7efea4cede2 (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 9c938e1158af (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on ac205da45bcd (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on d93376cc52c4 (production too)
- `vuln-ceiling` reader: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` catalogue: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` live: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `vuln-ceiling` time: vuln-ceiling could not be evaluated on b: no vulnerability scan: grype is not installed (https://github.com/anchore/grype#installation, or set HARNESS_VULN_CMD to another scanner, e.g. trivy)
- `asset-graph` reader: the asset graph changed: 78 → 105 immutable requests (JS 75 → 84, CSS 3 → 21), 1.0 MB → 1.0 MB; 21 network and 2 headers difference(s) are this churn
- `upgrade` 901 requests through the rollout, none failed; switched at 16.6s

</details>

<sub>harness 1.28.0 (a33c731e16fb, contract 1.28.0) · 2026-10-02T08:44:16.433Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: response-date×4, request-id×4, etag×4, metrics-process×599, metrics-timing-histograms×4, third-party-requests×42, hashed-assets×348, footer-tutors-version×23, transport-length×4, transport-connection×4, transport-keepalive×4</sub>
