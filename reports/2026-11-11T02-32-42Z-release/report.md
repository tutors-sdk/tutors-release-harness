## Release gate: sha-94f384b beside 17.1.0

**Gate: PASS**

#### New since the last forecast

**0 new, 0 gone** in the unclaimed set since the forecast of 2026-11-09T19:30:57.058Z (`sha-41243b2`), beside the same baseline `17.1.0`.

#### Causes and the PRs behind them

3 causes, 3 with a PR named. Merged since the forecast of `sha-41243b2`: [#590](https://github.com/tutors-sdk/tutors-mono-repo/pull/590), [#586](https://github.com/tutors-sdk/tutors-mono-repo/pull/586). No cause is new since then. Each is matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| sbom: package bumped | 8 | [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (6 files, 1 direct), [#586](https://github.com/tutors-sdk/tutors-mono-repo/pull/586) (1 file), [#580](https://github.com/tutors-sdk/tutors-mono-repo/pull/580) (3 files, 0 direct) and 1 more |
| network: new request on b: GET {{asset}} | 6 | [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (44 files, 6 direct), [#571](https://github.com/tutors-sdk/tutors-mono-repo/pull/571) (7 files, 3 direct), [#590](https://github.com/tutors-sdk/tutors-mono-repo/pull/590) (2 files) and 4 more |
| network: request no longer made on b: GET {{asset}} | 6 | [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (44 files, 6 direct), [#571](https://github.com/tutors-sdk/tutors-mono-repo/pull/571) (7 files, 3 direct), [#590](https://github.com/tutors-sdk/tutors-mono-repo/pull/590) (2 files) and 4 more |

**PASS, explained: all 20 differences no claim covers yet are pinned on the PR that made them, traced by its code (#589: 12, #571: 8). Nothing is owed on main; the release author pastes the claims when the release is cut. 9 claims (9 seen matching beside 17.0.0) matched nothing because 17.1.0 already ships what they claim: archive them from release/claims.yaml. Warning: 2 PRs' hints leave out what its code moved (#589 says (sbom); its code also moved network (12); #571 says (logs, network); its code also moved sbom (8)); fix the title so the release's changelog says so.**

#### Claims owed (3)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 20, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # sbom: package bumped: covers its 8 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "*/{apt,libapt-pkg6.0}"
    rule: "????"
    reason: "package bumped: 8 differences (reader, catalogue, live, time; 2 packages); likely #589, #586, #580"
  # network: new request on b: GET {{asset}}: covers its 6 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /_app/immutable/{assets/24.\\{\\{hash\\}\\}.css,nodes/24.\\{\\{hash\\}\\}.js}"
    rule: "????"
    reason: "new request on b: GET {{asset}}: 6 differences (reader; 3 pages; 2 names); likely #589, #571, #590"
  # network: request no longer made on b: GET {{asset}}: covers its 6 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /_app/immutable/{assets/23.\\{\\{hash\\}\\}.css,nodes/23.\\{\\{hash\\}\\}.js}"
    rule: "????"
    reason: "request no longer made on b: GET {{asset}}: 6 differences (reader; 3 pages; 2 names); likely #589, #571, #590"
```

7 of 8 dimensions measured (weight 95 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** | **breached** | −20 unclaimed: network /: reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css; −20 unclaimed: network /: reader:home: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js; −20 unclaimed: network /: reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css; −20 unclaimed: network /: reader:home: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js; −20 unclaimed: network /: reader-auth:rule-0586-turned-away: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css (and 15 more like it, not counted again: report.html#differences); −15 stale claim network * /api/{me,profile,presence,analytics,courses/visit}: matched nothing (Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login); −15 stale claim network * /api/whiteboard*: matched nothing (Rule 0068: a signed-in student's whiteboard edits are saved through the server, in a room only its owner can read or overwrite); −15 stale claim persistence */tutors-connect-{courses,profiles}: matched nothing (Rule 0072: student rows are written by the reader's server under the session's login, not by the browser); −15 stale claim network GET /api/time/*: matched nothing (CHANGELOG Unreleased (Time): the dashboard loads time data from the reader); −15 stale claim logs reader-auth/{courseId,role}: matched nothing (CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320)); −15 stale claim sbom */node: matched nothing (Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541)); −10 stale claim network POST /api/live/activity: matched nothing (Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481)) (and 2 more like it, not counted again); −5 claim network GET /_app/immutable/chunks/\{\{hash\}\}.js covers 20 hunks at once (not narrow) |
| Noise health | 15 | **80** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask course-media-http2-reset fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | **100** |  | — |
| Requirements traceability | 10 | **0** | **breached** | floor 5 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry); each costs change risk its points; −10 changelog entry "#571 feat(release): fail fast when a deployment lacks an environment variable or a usable service key (logs, network)" has no claim; −20 changelog entry "#576 fix(nightly): make the Nightly green again (calendar journey, stack clock, mutation dry run and floor)" has no EARS file; −10 changelog entry "#580 feat(create): tutors validate on the CLI (sbom)" has no claim; −20 changelog entry "#590 fix(reader): save content locks independently of student lists (network, persistence)" has no EARS file; −10 changelog entry "#590 fix(reader): save content locks independently of student lists (network, persistence)" has no claim; −10 claim 6 (logs reader-auth/{courseId,role}) names #320, not between 17.1.0 and 94f384ba3c954db2f2e7f1095ab3228198a563e8 traces to no changelog entry; −10 claim 7 (image-manifest */base) names #541, not between 17.1.0 and 94f384ba3c954db2f2e7f1095ab3228198a563e8 traces to no changelog entry; −10 claim 8 (sbom */node) names #541, not between 17.1.0 and 94f384ba3c954db2f2e7f1095ab3228198a563e8 traces to no changelog entry; −10 claim 9 (network POST /api/live/activity) names #481, not between 17.1.0 and 94f384ba3c954db2f2e7f1095ab3228198a563e8 traces to no changelog entry; −10 claim 10 (persistence */realtime_claim_live_publish) names #481, not between 17.1.0 and 94f384ba3c954db2f2e7f1095ab3228198a563e8 traces to no changelog entry; −10 claim 11 (persistence */realtime_watch) names #481, not between 17.1.0 and 94f384ba3c954db2f2e7f1095ab3228198a563e8 traces to no changelog entry; −10 claim 12 (network GET /_app/immutable/chunks/\{\{hash\}\}.js) names #478, #481, not between 17.1.0 and 94f384ba3c954db2f2e7f1095ab3228198a563e8 traces to no changelog entry |
| Change risk | 15 | **42** |  | −3 PR #571 touches 4 hotspots apps/reader/src/hooks.server.ts (4 of the last 6 releases), apps/time/src/hooks.server.ts (4 of the last 6 releases), apps/catalogue/src/hooks.server.ts (3 of the last 6 releases) and 1 more; −10 PR #571 changed Reader, Live, Catalogue, Time, Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it; −10 PR #573 changed Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it; −10 PR #578 changed Shared Packages, Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it; −10 PR #580 changed Shared Packages, Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it; −5 reader churn 232 lines, above 2× its median of 114 over the last 6 releases; PR #589 is the largest part (171 lines); −10 PR #586 changed Infrastructure but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 42 (100 − 58), v17.1.0..94f384ba3c954db2f2e7f1095ab3228198a563e8: 6 of 11 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#571](https://github.com/tutors-sdk/tutors-mono-repo/pull/571) | feat(release): fail fast when a deployment lacks an environment variable or a usable service key (logs, network) | 1254 | 24 | 4 | 1.96 | yes |  | **−13** | −3 [PR #571 touches 4 hotspots apps/reader/src/hooks.server.ts (4 of the last 6 releases), apps/time/src/hooks.server.ts (4 of the last 6 releases), apps/catalogue/src/hooks.server.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/571/files#diff-d6d421ccc99e28b6214f7df730798547515a524700fe6758ff2aaa6b7cdd8856); −10 [PR #571 changed Reader, Live, Catalogue, Time, Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/571/files#diff-c5f7478f9ea43955917de963b542918dbd3c74bd2e710935fd2606ee0ce67ecd) |
| [#573](https://github.com/tutors-sdk/tutors-mono-repo/pull/573) | deploy: pin production to 17.1.0 | 30 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #573 changed Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/573/files#diff-462bfbca9b703476f3fe4060b6328ae17d503dc2dd0a5e1622e08b29e639af04) |
| [#578](https://github.com/tutors-sdk/tutors-mono-repo/pull/578) | refactor(gen): expose the unpruned course tree | 97 | 6 | 0 | 1.20 | yes |  | **−10** | −10 [PR #578 changed Shared Packages, Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/578/files#diff-e0e5989842fab699476d2b93b4bcd90e7227db970de9f2a4690876f9d99b3531) |
| [#580](https://github.com/tutors-sdk/tutors-mono-repo/pull/580) | feat(create): tutors validate on the CLI (sbom) | 660 | 21 | 0 | 2.08 | yes |  | **−10** | −10 [PR #580 changed Shared Packages, Infrastructure, Development but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/580/files#diff-2ac9f030258ef25ea469c8f7640816bd3789bab9bcd342c2ad6595bf45d87f9c) |
| [#586](https://github.com/tutors-sdk/tutors-mono-repo/pull/586) | build(deps): bump library/node from `bc0a2af` to `add5c17` | 2 | 1 | 0 | no production lines | yes |  | **−10** | −10 [PR #586 changed Infrastructure but no changelog entry under v94f384ba3c954db2f2e7f1095ab3228198a563e8 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/586/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) | Land the merged course-rules stack (#581–#587) on main (sbom) | 7788 | 112 | 0 | 1.27 | yes |  | **−5** | −5 [reader churn 232 lines, above 2× its median of 114 over the last 6 releases; PR #589 is the largest part (171 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/589/files#diff-2ea6c6513893a92dd7a8d6ede788516f1791b20b0be0ab5b5daef72d5dbc4d86) |
| 5 more | no deductions: #572, #576, #579, #588, #590 | 1472 | 45 |  |  |  |  | 0 |  |

- churn: reader 232 (median 114) ABOVE 2×, catalogue 21 (median 35.5), live 21 (median 26.5), time 21 (median 61)
- hotspots: 47 file(s) changed in 3+ of the last 6 releases; touched this release: apps/reader/src/hooks.server.ts, apps/time/src/hooks.server.ts, apps/catalogue/src/hooks.server.ts, apps/live/src/hooks.server.ts
- ownership: no file with 3+ authors
- orphans: 5 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at 94f384ba3c954db2f2e7f1095ab3228198a563e8 has no "### v94f384ba3c954db2f2e7f1095ab3228198a563e8" entries under a product section)
- tests: apps/catalogue 36.41, apps/live 36.41, apps/reader 18.08, apps/time 36.41, packages/jsr/course-rules 2.15, packages/jsr/create 4.92, packages/jsr/gen 1.20, packages/svelte/app-config 2.68, packages/svelte/quiz 10.19
- reviews: 11 approved, 0 not
- dependencies: no major bump; 3 new direct dependencies (@types/js-yaml, fflate, js-yaml)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at 94f384ba3c954db2f2e7f1095ab3228198a563e8 has no "### v94f384ba3c954db2f2e7f1095ab3228198a563e8" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-11-11T02:32:42.663Z — exit code **0**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.1.0` | `quay.io/tutors-sdk/tutors-reader:sha-94f384b` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.1.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-94f384b` |
| live | `quay.io/tutors-sdk/tutors-live:17.1.0` | `quay.io/tutors-sdk/tutors-live:sha-94f384b` |
| time | `quay.io/tutors-sdk/tutors-time:17.1.0` | `quay.io/tutors-sdk/tutors-time:sha-94f384b` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:fde5a42e32bc938d602b8f94aed446435a1e84ca9f7f528dcd08adf9637ed3db` · rev `94f384ba3c95` · version `sha-94f384b` |
| catalogue image | `sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:16c46d1d03340af41f95600d5a8e8be8bfe1d1fe2ab6ab8082caaf0babc641ff` · rev `94f384ba3c95` · version `sha-94f384b` |
| live image | `sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:867d005ab0b596b8906b80b8fce9bbfcbfbf5c45666f965c8ebbd400a0280953` · rev `94f384ba3c95` · version `sha-94f384b` |
| time image | `sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:e0cdaf6a1f94770378b35c4f03fe9436ed65d22fc0732364c2d99dc3259d303c` · rev `94f384ba3c95` · version `sha-94f384b` |

- 20 unclaimed diff(s)
- 9 claim(s) matched nothing and should be removed from the changelog
- A/A consulted: clean at 2026-11-11T02:00:09.658Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): 9 difference(s); 20 of this run's 44 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.
  - `dom` `replay:talk-01`: replay:talk-01: semantic DOM differs (+65 −0 lines at line 1)
  - `dom` `replay:note-01`: replay:note-01: semantic DOM differs (+62 −0 lines at line 1)
  - `dom` `replay:note-02`: replay:note-02: semantic DOM differs (+62 −0 lines at line 1)
  - `network` `GET /_app/immutable/assets/1.{{hash}}.css`: replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on a2
  - `network` `GET /_app/immutable/chunks/{{hash}}.js`: replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 43× on a2
  - `network` `GET /_app/immutable/nodes/1.{{hash}}.js`: replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on a2
  - `network` `GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100`: replay:talk-01: new request on a2: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100
  - `network` `GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100`: replay:note-01: new request on a2: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
  - `network` `GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100`: replay:note-02: new request on a2: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100

### 20 unclaimed differences, 3 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `sbom` package bumped (2 packages: `apt`, `libapt-pkg6.0`) | 8 | reader, catalogue, live, time | — | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `network` new request on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/24.{{hash}}.css`, `GET /_app/immutable/nodes/24.{{hash}}.js`) | 6 | reader | 3: `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again`, `reader:home` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` request no longer made on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/23.{{hash}}.css`, `GET /_app/immutable/nodes/23.{{hash}}.js`) | 6 | reader | 3: `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again`, `reader:home` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0586-private-course`: Rule 0586 (exercises 0011, 0267): 8 differences in network

### Unclaimed differences (20)

| artefact | scope | what changed |
|---|---|---|
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader:home: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader:home: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader-auth:rule-0586-turned-away: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader-auth:rule-0586-turned-away: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader-auth:rule-0586-turned-away: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader-auth:rule-0586-turned-away: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader-auth:rule-0586-turned-away-again: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader-auth:rule-0586-turned-away-again: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader-auth:rule-0586-turned-away-again: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader-auth:rule-0586-turned-away-again: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `sbom` | `reader/apt` | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `reader/libapt-pkg6.0` | reader: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/apt` | catalogue: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/libapt-pkg6.0` | catalogue: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `live/apt` | live: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `live/libapt-pkg6.0` | live: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `time/apt` | time: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `time/libapt-pkg6.0` | time: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | holds |
| catalogue | 1 finding (1 on production too) | holds | holds |
| live | 1 finding (1 on production too) | holds | holds |
| time | 1 finding (1 on production too) | holds | holds |

### Informing (63; 63 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 182 → 188 immutable requests (JS 151 → 157, CSS 31 → 31), 1.7 MB → 1.7 MB; 7 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 1219 → 1266 immutable requests (JS 1046 → 1093, CSS 173 → 173), 12.8 MB → 12.8 MB; 22 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 129 → 133 immutable requests (JS 107 → 111, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live-auth` | live-auth: the asset graph changed: 187 → 193 immutable requests (JS 157 → 163, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 44× on a, 47× on b | no date set | unclaimed |
| `replay` | `replay:topic-02 GET {{course}}/tutors.json` | replay:topic-02: new request on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:topic-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:topic-02: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100` | replay:topic-02: new request on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:talk-01 GET {{course}}/tutors.json` | replay:talk-01: request no longer made on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:talk-01: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:talk-01: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100` | replay:talk-01: request no longer made on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 43× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET {{course}}/tutors.json` | replay:note-02: GET {{course}}/tutors.json requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 44× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100` | replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET {{course}}/tutors.json` | replay:lab-02-step-03: request no longer made on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/1.{{hash}}.css` | replay:lab-02-step-03: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:lab-02-step-03: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100` | replay:lab-02-step-03: request no longer made on b: GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100` | replay:lab-02-step-03: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/1.{{hash}}.css` | replay:missing-topic: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/chunks/{{hash}}.js` | replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 48× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/nodes/1.{{hash}}.js` | replay:missing-topic: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100` | replay:missing-topic: new request on b: GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/body/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/url/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/strict-transport-security` | catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/content-security-policy` | catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `live/strict-transport-security` | live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `live/content-security-policy` | live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/strict-transport-security` | reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/content-security-policy` | reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `time/strict-transport-security` | time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `time/content-security-policy` | time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |

### Claimed differences (24)

| artefact | scope | claimed by |
|---|---|---|
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `image-manifest` | `reader/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `image-manifest` | `catalogue/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `image-manifest` | `live/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `image-manifest` | `time/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |

### Claim hygiene

11 claim(s) cover 24 failing hunk(s): 2.18 hunk(s) per claim, at most 20 under one claim (flagged above 10).

| artefact | scope | hunks | flag |
|---|---|---|---|
| `network` | `GET /_app/immutable/chunks/\{\{hash\}\}.js` | 20 | covers more than 10 hunks |

A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 9 layers, 329.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 326.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 144 distinct package(s) (cosign attestation (signature verified)) | 144 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 96 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 9 layers, 288.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 285.4 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 96 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 9 layers, 289.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 285.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 96 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 9 layers, 293.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 290.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 96 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-10T06:21:20Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.49 ms | 2.43 ms |
| b | 601 | 0 | 0 | 1.5 ms | 2.69 ms |

<details><summary>Informational (92)</summary>

- `timing` journey rule-0583-presence median 4562ms → 6570ms but not significant (p=0.676, +44%, n=5/5; smallest slowdown 5/5 runs could detect: about 144%)
- `timing` journey rule-0585-preferences median 6671ms → 9044ms but not significant (p=0.403, +36%, n=5/5; smallest slowdown 5/5 runs could detect: about 93%)
- `timing` journey rule-0587-calendar-llm median 4238ms → 6337ms but not significant (p=0.210, +50%, n=5/5; smallest slowdown 5/5 runs could detect: about 181%)
- `vulns` reader: CVE-2026-109518 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-109518 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-109518 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-109518 (High) is present on a and gone on b (fixed)
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `image-hardening` time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too)
- `build-provenance` reader: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` catalogue: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` live: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` time: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `vuln-ceiling` reader: vuln-ceiling holds on b: 95 advisories scanned, 19 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 95 advisories scanned, 19 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 95 advisories scanned, 19 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 95 advisories scanned, 19 critical or high, none with a fix available
- `asset-graph` reader: the asset graph changed: 182 → 188 immutable requests (JS 151 → 157, CSS 31 → 31), 1.7 MB → 1.7 MB; 7 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 1219 → 1266 immutable requests (JS 1046 → 1093, CSS 173 → 173), 12.8 MB → 12.8 MB; 22 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 129 → 133 immutable requests (JS 107 → 111, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `asset-graph` live-auth: the asset graph changed: 187 → 193 immutable requests (JS 157 → 163, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 44× on a, 47× on b
- `replay` replay:topic-02: new request on b: GET {{course}}/tutors.json
- `replay` replay:topic-02: new request on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:topic-02: new request on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:topic-02: new request on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:talk-01: request no longer made on b: GET {{course}}/tutors.json
- `replay` replay:talk-01: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b
- `replay` replay:talk-01: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:talk-01: request no longer made on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 43× on b
- `replay` replay:note-02: GET {{course}}/tutors.json requested 1× on a, 2× on b
- `replay` replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 44× on b
- `replay` replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b
- `replay` replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:lab-02-step-03: request no longer made on b: GET {{course}}/tutors.json
- `replay` replay:lab-02-step-03: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:lab-02-step-03: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:lab-02-step-03: request no longer made on b: GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100
- `replay` replay:lab-02-step-03: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:missing-topic: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b
- `replay` replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 48× on b
- `replay` replay:missing-topic: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b
- `replay` replay:missing-topic: new request on b: GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-availability: 100.0% of 601 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` reader-latency: 100.0% of 601 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency-tail: 100.0% of 62 reader requests under 2.5s on b (its /metrics across the journeys), objective 99.0%: holds
- `slo` reader-latency-tail: 100.0% of 601 reader requests under 2.5s on b (the k6 load leg), objective 99.0%: holds
- `secrets-in-response` reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `headers-policy` catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)

</details>

<details><summary>Stale claims (9)</summary>

- `network` `* /api/{me,profile,presence,analytics,courses/visit}` — Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login
- `network` `* /api/whiteboard*` — Rule 0068: a signed-in student's whiteboard edits are saved through the server, in a room only its owner can read or overwrite
- `persistence` `*/tutors-connect-{courses,profiles}` — Rule 0072: student rows are written by the reader's server under the session's login, not by the browser
- `network` `GET /api/time/*` — CHANGELOG Unreleased (Time): the dashboard loads time data from the reader
- `logs` `reader-auth/{courseId,role}` — CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320)
- `sbom` `*/node` — Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541)
- `network` `POST /api/live/activity` — Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481)
- `persistence` `*/realtime_claim_live_publish` — Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481)
- `persistence` `*/realtime_watch` — Rule 0334: While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. — Rule 0334: while it shows a course or the platform feed, Tutors Live reports itself as a watcher of that feed through realtime_watch every 60 seconds (#481)

</details>

<sub>harness 1.62.0 (7790aee6e818, contract 1.62.0) · 2026-11-11T02:32:42.663Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×272, request-id×272, etag×272, metrics-process×599, metrics-timing-histograms×32, third-party-requests×6904, persistence-stub-requests×290, oauth-callback-state×110, media-range-status×42, chromium-compute-pressure-policy×1, hashed-assets×21111, footer-tutors-version×830, transport-length×272, transport-connection×272, transport-keepalive×272</sub>


</details>
