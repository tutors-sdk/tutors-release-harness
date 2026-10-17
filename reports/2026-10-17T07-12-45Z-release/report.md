## Release gate: sha-83d4ccf beside 17.0.0

**Gate: FAIL**

#### New since the last forecast

**12 new, 0 gone** in the unclaimed set since the forecast of 2026-10-16T07:11:14.011Z (`sha-c867ee8`), beside the same baseline `17.0.0`. By artefact: dom +10 −0 · focus +2 −0. The previous forecast was judged by harness 1.39.1, this one by 1.40.0: a harness change can move differences too.

| artefact | scope | what |
| --- | --- | --- |
| dom | reader:search | reader:search: semantic DOM differs (+1 −1 lines at line 8) |
| dom | reader:search-results | reader:search-results: semantic DOM differs (+1 −1 lines at line 8) |
| dom | catalogue:home | catalogue:home: semantic DOM differs (+1 −1 lines at line 10) |
| dom | live:home | live:home: semantic DOM differs (+1 −1 lines at line 10) |
| dom | reader-auth:course | reader-auth:course: semantic DOM differs (+1 −1 lines at line 9) |
| dom | reader-auth:topic | reader-auth:topic: semantic DOM differs (+1 −1 lines at line 8) |
| dom | reference:course | reference:course: semantic DOM differs (+1 −1 lines at line 10) |
| dom | reference:topic | reference:topic: semantic DOM differs (+1 −1 lines at line 9) |
| dom | reference:lab | reference:lab: semantic DOM differs (+1 −1 lines at line 9) |
| dom | reference:note | reference:note: semantic DOM differs (+1 −1 lines at line 9) |
| focus | catalogue:home | catalogue:home: keyboard order changed (12 stops on a, 12 on b) |
| focus | reference:course | reference:course: keyboard order changed (12 stops on a, 12 on b) |

#### Causes and the PRs behind them

2 causes, 2 with a PR named. Merged since the forecast of `sha-c867ee8`: [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504), [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505). 2 causes are new since then, and only these PRs can have made them. The others are matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| **new** dom: semantic DOM differs (+# −# lines at line #) | 10 | [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505) (8 files, 0 direct) |
| **new** focus: keyboard order changed (# stops on a, # on b) | 2 | [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505) (8 files, 0 direct) |

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

#### Claims owed (2)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 12, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # dom: semantic DOM differs (+# −# lines at line #): covers its 10 differences. Name the Rule that intends it, or fix it.
  - artefact: "dom"
    scope: "{catalogue:home,live:home,reader-auth:course,reader-auth:topic,reader:search,reader:search-results,reference:course,reference:lab,reference:note,reference:topic}"
    rule: "????"
    reason: "semantic DOM differs (+# −# lines at line #): 10 differences (reader, catalogue, live; 10 pages); likely #505"
  # focus: keyboard order changed (# stops on a, # on b): covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "focus"
    scope: "{catalogue:home,reference:course}"
    rule: "????"
    reason: "keyboard order changed (# stops on a, # on b): 2 differences (reader, catalogue; 2 pages); likely #505"
```

5 of 8 dimensions measured (weight 70 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** |  | −20 unclaimed: dom /search/localhost:8080: reader:search: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /search/localhost:8080?q=reference+material: reader:search-results: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /: catalogue:home: semantic DOM differs (+1 −1 lines at line 10); −20 unclaimed: dom /: live:home: semantic DOM differs (+1 −1 lines at line 10); −20 unclaimed: dom /course/localhost:8080: reader-auth:course: semantic DOM differs (+1 −1 lines at line 9) (and 7 more like it, not counted again: report.html#differences) |
| Noise health | 15 | **85** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | not measured |  | quality.json has no mutation scores for c867ee8 (the monorepo's Nightly wrote no Stryker report) and no harness mutants |
| Requirements traceability | 10 | not measured |  | needs the changelog, the EARS files and the claims side by side: pass --traceability <json>; changes.json already reports 9 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry), a floor breach once it is measured |
| Change risk | 15 | **0** |  | −10 PR #476 changed Reader, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −3 PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −10 PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −10 PR #481 changed Reader, Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −10 PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −10 PR #484 changed Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −10 PR #487 changed Reader, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −10 PR #504 changed Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it; −3 PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2; −10 PR #505 changed Reader, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 0 (100 − 106), v17.0.0..83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9: 9 of 11 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505) | fix(a11y): button names contain their visible text | 47 | 15 | 4 | 1.76 | yes |  | **−23** | −3 [PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-d4a40094af72b0eb12eea04ebee4e682bfc581553326bf472d1c2f849c7c623b); −10 [PR #505 changed Reader, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-4be7739a1047b396bc6d3e9502bee98cfdd9bde50bfcb576e9df02edfd063dd3) |
| [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) | Route every Realtime channel through a budgeted port | 1349 | 41 | 1 | 1.46 | yes |  | **−13** | −3 [PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) | Give each whiteboard room a Realtime budget | 377 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #476 changed Reader, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/476/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#480](https://github.com/tutors-sdk/tutors-mono-repo/pull/480) | Tutors Time: read only the chosen days of a course's calendar | 92 | 6 | 0 | 3.30 | yes |  | **−10** | −10 [PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/480/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) | Tutors Live: publish from the reader's server within a daily Realtime budget | 1421 | 23 | 0 | 3.38 | yes |  | **−10** | −10 [PR #481 changed Reader, Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/481/files#diff-e4fcc76d91071866c7d54b16b300e500d67b42190747baa90741fe8de58a8179) |
| [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) | Release 17.0.0 to main and pin production to it | 424 | 13 | 0 | no production lines | yes |  | **−10** | −10 [PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/483/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#484](https://github.com/tutors-sdk/tutors-mono-repo/pull/484) | ci(deploy): open the pin pull request when a release tag's images are published | 247 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #484 changed Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/484/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#487](https://github.com/tutors-sdk/tutors-mono-repo/pull/487) | fix(community): show an empty catalogue without Supabase instead of logging errors | 67 | 3 | 0 | 3.47 | yes |  | **−10** | −10 [PR #487 changed Reader, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/487/files#diff-13d8ab5e67e09ca92971e77ee1fcbb71b39dd5a018144bf33a3bbabd5b3da020) |
| [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) | fix(nightly): make the three red Nightly jobs pass for real | 357 | 18 | 0 | no production lines | yes |  | **−10** | −10 [PR #504 changed Infrastructure, Development but no changelog entry under v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/504/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| 2 more | no deductions: #485, #493 | 576 | 5 |  |  |  |  | 0 |  |

- churn: reader 139 (median 101.5), catalogue 0 (median 7.5), live 0 (median 3.5), time 0 (median 14)
- hotspots: 15 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/connect/src/services/connect.svelte.ts, packages/svelte/utils/i18n/src/messages/fr.ts, packages/svelte/utils/i18n/src/messages/es.ts, packages/svelte/utils/i18n/src/messages/de.ts, packages/svelte/utils/i18n/src/messages/it.ts
- ownership: no file with 3+ authors
- orphans: 9 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at 83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 has no "### v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9" entries under a product section)
- tests: apps/reader 59.38, packages/jsr/realtime 2.32, packages/jsr/time 3.30, packages/svelte/community 4.02, packages/svelte/connect 650.00, packages/svelte/realtime-supabase 19.12, packages/svelte/ui-navigators 0.18 LOW, packages/svelte/utils 0.33
- reviews: 11 approved, 0 not
- dependencies: no major bump; 1 new direct dependency (@supabase/supabase-js)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at 83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9 has no "### v83d4ccf7f5ca2440bbc94224e40c5bfef3e410d9" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-10-17T07:12:45.685Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-83d4ccf` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-83d4ccf` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-83d4ccf` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-83d4ccf` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:0627d3940eb982013b4491015586ea36e738fa1f22aebf648ad94e049a9e6d99` · rev `83d4ccf7f5ca` · version `sha-83d4ccf` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:8c61baa1c1e97df5cd6db100733809c404ca87044b0a05c40a2acbfccb996195` · rev `83d4ccf7f5ca` · version `sha-83d4ccf` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:af5231fe19ed7c74d30dc7fec5a55ea3819c7b3ff1a22c3d4e803436aef97bd2` · rev `83d4ccf7f5ca` · version `sha-83d4ccf` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:4db2acd4bfa8059eb2ad18a87f68583a19dbd358cd6b6e99e1aab4913830abc8` · rev `83d4ccf7f5ca` · version `sha-83d4ccf` |

- 12 unclaimed diff(s)
- A/A consulted: clean at 2026-10-17T07:00:11.159Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): 8 difference(s); 2 of this run's 17 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.
  - `dom` `replay:note-02`: replay:note-02: semantic DOM differs (+62 −0 lines at line 1)
  - `dom` `replay:missing-topic`: replay:missing-topic: semantic DOM differs (+56 −0 lines at line 1)
  - `network` `GET /_app/immutable/chunks/{{hash}}.js`: replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 37× on a, 38× on a2
  - `network` `GET {{course}}/tutors.json`: replay:note-02: new request on a2: GET {{course}}/tutors.json
  - `network` `GET /_app/immutable/assets/1.{{hash}}.css`: replay:note-02: new request on a2: GET /_app/immutable/assets/1.{{hash}}.css
  - `network` `GET /_app/immutable/nodes/1.{{hash}}.js`: replay:note-02: new request on a2: GET /_app/immutable/nodes/1.{{hash}}.js
  - `network` `GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100`: replay:note-02: new request on a2: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
  - `network` `GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100`: replay:missing-topic: new request on a2: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100

### 12 unclaimed differences, 2 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `dom` semantic DOM differs (+# −# lines at line #) | 10 | reader, catalogue, live | 10: `catalogue:home`, `live:home`, `reader-auth:course`, `reader-auth:topic`, `reader:search`, `reader:search-results` and 4 more | reader:search: semantic DOM differs (+1 −1 lines at line 8) |
| `focus` keyboard order changed (# stops on a, # on b) | 2 | reader, catalogue | 2: `catalogue:home`, `reference:course` | catalogue:home: keyboard order changed (12 stops on a, 12 on b) |

Moved together on the same pages, so likely one change each:

- `dom`, `focus` on 2 pages (4 differences): `catalogue:home`, `reference:course`

### Unclaimed differences (12)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:search` | reader:search: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader:search-results` | reader:search-results: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `live:home` | live:home: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+1 −1 lines at line 9) |
| `focus` | `catalogue:home` | catalogue:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:course` | reference:course: keyboard order changed (12 stops on a, 12 on b) |

<details><summary>Detail of 12 difference(s)</summary>

`dom` `reader:search`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reader:search-results`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `catalogue:home`

```
     - link "Catalogue":
       - /url: /
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
 - complementary "Course navigation":
   - navigation:
```

`dom` `live:home`

```
     - link "Live":
       - /url: /
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
 - complementary "Course navigation":
   - navigation:
```

`dom` `reader-auth:course`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Profile menu":
       - img "Harness Student"
```

`dom` `reader-auth:topic`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Profile menu":
       - img "Harness Student"
```

`dom` `reference:course`

```
     - text: A reference course containing all supported learning objects
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reference:topic`

```
     - text: A reference course containing all supported learning objects
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reference:lab`

```
     - text: A reference course containing all supported learning objects
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`dom` `reference:note`

```
     - text: A reference course containing all supported learning objects
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
     - button "Anonymous Tutors Profile"
 - complementary "Course navigation":
```

`focus` `catalogue:home`

```
 a "Catalogue"
-button "Open Theme Menu"
+button "Preferences"
 a "My courses"
```

`focus` `reference:course`

```
 button "Search this course"
-button "Open Theme Menu"
+button "Preferences"
 button "Anonymous Tutors Profile"
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
| `image-hardening` | `reader/healthcheck` | reader: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/healthcheck` | catalogue: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `live/healthcheck` | live: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `image-hardening` | `time/healthcheck` | time: declares no HEALTHCHECK (production too) | no date set | unclaimed |
| `build-provenance` | `reader/slsa` | reader: carries no SLSA provenance verified under the publishing identity on 0627d3940eb9 (production too) | no date set | unclaimed |
| `build-provenance` | `catalogue/slsa` | catalogue: carries no SLSA provenance verified under the publishing identity on 8c61baa1c1e9 (production too) | no date set | unclaimed |
| `build-provenance` | `live/slsa` | live: carries no SLSA provenance verified under the publishing identity on af5231fe19ed (production too) | no date set | unclaimed |
| `build-provenance` | `time/slsa` | time: carries no SLSA provenance verified under the publishing identity on 4db2acd4bfa8 (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 62 → 62 immutable requests (JS 50 → 50, CSS 12 → 12), 564 KB → 565 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 541 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 96 → 96 immutable requests (JS 83 → 83, CSS 13 → 13), 1.0 MB → 1.0 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
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

### Claimed differences (5)

| artefact | scope | claimed by |
|---|---|---|
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `persistence` | `student-signs-in/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |

### Claim hygiene

3 claim(s) cover 5 failing hunk(s): 1.67 hunk(s) per claim, at most 2 under one claim (flagged above 10).

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 308.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-16T06:29:51Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.43 ms | 2.67 ms |
| b | 600 | 0 | 0 | 1.37 ms | 2.31 ms |

<details><summary>Informational (50)</summary>

- `dom` journey "anonymous-student-reads-course" failed on a but completed on b (fixed)
- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.33 / b 0 per reader page (broadcasts a 4 / b 0, socket data frames a 0 / b 0, over 3 page view(s))
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: declares no HEALTHCHECK (production too)
- `image-hardening` catalogue: declares no HEALTHCHECK (production too)
- `image-hardening` live: declares no HEALTHCHECK (production too)
- `image-hardening` time: declares no HEALTHCHECK (production too)
- `build-provenance` reader: carries no SLSA provenance verified under the publishing identity on 0627d3940eb9 (production too)
- `build-provenance` catalogue: carries no SLSA provenance verified under the publishing identity on 8c61baa1c1e9 (production too)
- `build-provenance` live: carries no SLSA provenance verified under the publishing identity on af5231fe19ed (production too)
- `build-provenance` time: carries no SLSA provenance verified under the publishing identity on 4db2acd4bfa8 (production too)
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `asset-graph` reader: the asset graph changed: 62 → 62 immutable requests (JS 50 → 50, CSS 12 → 12), 564 KB → 565 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 541 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 96 → 96 immutable requests (JS 83 → 83, CSS 13 → 13), 1.0 MB → 1.0 MB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
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

<sub>harness 1.40.0 (46819186dd9c, contract 1.40.0) · 2026-10-17T07:12:45.685Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×90, request-id×90, etag×90, metrics-process×599, metrics-timing-histograms×12, third-party-requests×1471, persistence-stub-requests×140, oauth-callback-state×10, media-range-status×44, chromium-compute-pressure-policy×1, hashed-assets×4900, footer-tutors-version×322, transport-length×90, transport-connection×90, transport-keepalive×90</sub>


</details>
