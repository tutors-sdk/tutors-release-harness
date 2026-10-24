## Release gate: sha-180700e beside 17.0.0

**Gate: FAIL**

#### New since the last forecast

**0 new, 0 gone** in the unclaimed set since the forecast of 2026-10-23T09:22:04.773Z (`sha-180700e`), beside the same baseline `17.0.0`. The previous forecast was judged by harness 1.49.4, this one by 1.57.0: a harness change can move differences too.

#### Causes and the PRs behind them

18 causes, 16 with a PR named. Merged since the forecast of `sha-260bdc4`: [#516](https://github.com/tutors-sdk/tutors-mono-repo/pull/516). 2 causes are new since then, and only these PRs can have made them. The others are matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| **new** image-manifest: built FROM a different base image (lowest layer e#fce → #b#de#) | 4 | none matched; no PR merged since touched what builds the image (a Dockerfile, a manifest, the lockfile): main was rebuilt and its base image or a package moved upstream |
| **new** sbom: package bumped | 4 | none matched; no PR merged since touched what builds the image (a Dockerfile, a manifest, the lockfile): main was rebuilt and its base image or a package moved upstream |
| dom: semantic DOM differs (+# −# lines at line #) | 48 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (20 files, 6 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct) and 16 more |
| focus: keyboard order changed (# stops on a, # on b) | 39 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (20 files, 6 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct) and 16 more |
| sbom: package added | 9 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct), [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (5 files, 1 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (2 files, 1 direct) and 8 more |
| sbom: package removed | 9 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct), [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (5 files, 1 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (2 files, 1 direct) and 8 more |
| screenshot: #% of pixels differ in #×# at (#, #) (threshold #%) | 3 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (16 files, 9 direct), [#511](https://github.com/tutors-sdk/tutors-mono-repo/pull/511) (5 files, 2 direct), [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (1 file) and 14 more |
| console: new console message on b | 2 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| metrics: new series on b | 2 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (16 files, 9 direct), [#511](https://github.com/tutors-sdk/tutors-mono-repo/pull/511) (5 files, 2 direct), [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (1 file) and 14 more |
| persistence: POST tutors-connect-courses — # row(s) on a, # on b | 2 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| persistence: POST tutors-connect-profiles — # row(s) on a, # on b | 2 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| dom: journey "rule-#-content-lock" completed on a but failed on b | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (20 files, 6 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct) and 16 more |
| logs: error-level lines | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| network: new request on b: PUT /api/courses/localhost%#A#/locks | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| persistence: POST app_errors — # row(s) on a, # on b | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| persistence: POST tutors_content_locks — # row(s) on a, # on b | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| persistence: POST tutors-connect-users — # row(s) on a, # on b | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |
| persistence: RPC record_page_view — # row(s) on a, # on b | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (18 files, 4 direct) and 16 more |

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

#### Claims owed (18)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 131, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # dom: semantic DOM differs (+# −# lines at line #): covers its 48 differences. Name the Rule that intends it, or fix it.
  - artefact: "dom"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "semantic DOM differs (+# −# lines at line #): 48 differences (reader, catalogue, live, time; 39 pages); likely #519, #520, #518"
  # focus: keyboard order changed (# stops on a, # on b): covers its 39 differences. Name the Rule that intends it, or fix it.
  - artefact: "focus"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "keyboard order changed (# stops on a, # on b): 39 differences (reader, catalogue, live, time; 39 pages); likely #519, #520, #518"
  # sbom: package added: covers its 9 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "reader/{@supabase/auth-js,@supabase/functions-js,@supabase/phoenix,@supabase/postgrest-js,@supabase/realtime-js,@supabase/storage-js,@supabase/supabase-js,iceberg-js,tslib}"
    rule: "????"
    reason: "package added: 9 differences (reader; 9 packages); likely #504, #483, #518"
  # sbom: package removed: covers its 9 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "time/{@supabase/auth-js,@supabase/functions-js,@supabase/phoenix,@supabase/postgrest-js,@supabase/realtime-js,@supabase/storage-js,@supabase/supabase-js,iceberg-js,tslib}"
    rule: "????"
    reason: "package removed: 9 differences (time; 9 packages); likely #504, #483, #519"
  # image-manifest: built FROM a different base image (lowest layer e#fce → #b#de#): covers its 4 differences. Name the Rule that intends it, or fix it.
  - artefact: "image-manifest"
    scope: "*/base"
    rule: "????"
    reason: "built FROM a different base image (lowest layer e#fce → #b#de#): 4 differences (reader, catalogue, live, time)"
  # sbom: package bumped: covers its 4 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "*/node"
    rule: "????"
    reason: "package bumped: 4 differences (reader, catalogue, live, time; 1 package)"
  # screenshot: #% of pixels differ in #×# at (#, #) (threshold #%): covers its 3 differences. Name the Rule that intends it, or fix it.
  - artefact: "screenshot"
    scope: "time-auth:rule-{0590-medians,0591-lab-bylab,0591-student}"
    rule: "????"
    reason: "#% of pixels differ in #×# at (#, #) (threshold #%): 3 differences (time; 3 pages); likely #519, #511, #483"
  # console: new console message on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "console"
    scope: "reader-auth:rule-0588-lecturer-locked"
    rule: "????"
    reason: "new console message on b: 2 differences (reader; 1 page); likely #519, #518, #520"
  # metrics: new series on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "metrics"
    scope: "time/http_{request_duration_seconds_count,requests_total}"
    rule: "????"
    reason: "new series on b: 2 differences (time; 2 names); likely #519, #511, #483"
  # persistence: POST tutors-connect-courses — # row(s) on a, # on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "*/tutors-connect-courses"
    rule: "????"
    reason: "POST tutors-connect-courses — # row(s) on a, # on b: 2 differences; likely #519, #518, #520"
  # persistence: POST tutors-connect-profiles — # row(s) on a, # on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "*/tutors-connect-profiles"
    rule: "????"
    reason: "POST tutors-connect-profiles — # row(s) on a, # on b: 2 differences; likely #519, #518, #520"
  # dom: journey "rule-#-content-lock" completed on a but failed on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "dom"
    scope: "rule-0588-content-lock"
    rule: "????"
    reason: "journey \"rule-#-content-lock\" completed on a but failed on b: 1 difference; likely #519, #520, #518"
  # logs: error-level lines: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "logs"
    scope: "reader-auth/error"
    rule: "????"
    reason: "error-level lines: 1 difference (reader; 1 name); likely #519, #518, #520"
  # network: new request on b: PUT /api/courses/localhost%#A#/locks: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "PUT /api/courses/localhost%3A8081/locks"
    rule: "????"
    reason: "new request on b: PUT /api/courses/localhost%#A#/locks: 1 difference (reader; 1 page); likely #519, #518, #520"
  # persistence: POST app_errors — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0588-content-lock/app_errors"
    rule: "????"
    reason: "POST app_errors — # row(s) on a, # on b: 1 difference; likely #519, #518, #520"
  # persistence: POST tutors_content_locks — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0588-content-lock/tutors_content_locks"
    rule: "????"
    reason: "POST tutors_content_locks — # row(s) on a, # on b: 1 difference; likely #519, #518, #520"
  # persistence: POST tutors-connect-users — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0588-content-lock/tutors-connect-users"
    rule: "????"
    reason: "POST tutors-connect-users — # row(s) on a, # on b: 1 difference; likely #519, #518, #520"
  # persistence: RPC record_page_view — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0588-content-lock/record_page_view"
    rule: "????"
    reason: "RPC record_page_view — # row(s) on a, # on b: 1 difference; likely #519, #518, #520"
```

7 of 8 dimensions measured (weight 95 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** |  | −20 unclaimed: dom rule-0588-content-lock: journey "rule-0588-content-lock" completed on a but failed on b; −20 unclaimed: dom /: reader:home: semantic DOM differs (+1 −1 lines at line 10); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+1 −1 lines at line 9); −20 unclaimed: dom /topic/localhost:8080/unit-1/topic-01: reader:topic: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01: reader:lab-step: semantic DOM differs (+1 −1 lines at line 8) (and 126 more like it, not counted again: report.html#differences); −5 claim network GET /_app/immutable/chunks/\{\{hash\}\}.js covers 17 hunks at once (not narrow) |
| Noise health | 15 | **80** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask chromium-compute-pressure-policy fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | **0** | **breached** | −30 mutation score 67.12% on @tutors/course, below 80%; −30 mutation score 72.73% on @tutors/i18n, below 80%; −30 mutation score 75.93% on @tutors/metrics, below 80%; −30 mutation score 65.4% on @tutors/rbac, below 80%; −30 mutation score 50% on @tutors/ui-components, below 80%; −30 mutation score 55.11% on @tutors/ui-navigators, below 80%; −30 mutation score 0% on @tutors/ui-primitives, below 80% |
| Requirements traceability | 10 | **0** | **breached** | floor 23 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry); each costs change risk its points; −20 changelog entry "#485 fix(deps): clear the three advisories failing the dependency audit" has no EARS file; −20 changelog entry "#504 fix(nightly): make the three red Nightly jobs pass for real" has no EARS file; −10 changelog entry "#504 fix(nightly): make the three red Nightly jobs pass for real" has no claim; −10 changelog entry "#505 fix(a11y): button names contain their visible text" has no claim; −20 changelog entry "#500 fix(deploy): immutable Cache-Control on /_app/immutable/* for Netlify" has no EARS file; −10 changelog entry "#501 feat(image): declare a HEALTHCHECK and expose request SLIs from start (image-hardening, image-manifest, metrics)" has no claim; −10 changelog entry "#514 feat(reader): export enrollment drafts from course visitors (dom, network, headers)" has no claim; −10 changelog entry "#506 fix(reader): link a local course's LLM downloads over http (dom)" has no claim; −10 changelog entry "#510 fix(reader): keep a private course out of Recently accessed for someone it turns away (found by the release harness)" has no claim; −10 changelog entry "#507 fix(time): reuse one Supabase client per url and key (console, network)" has no claim; −10 changelog entry "#491 feat(dev): EARS dashboard, one page for every Rule and the format" has no claim; −10 changelog entry "#511 fix(time): key labs by their full path, found by the release harness (dom)" has no claim; −10 changelog entry "#509 fix(time): lay heat maps out the same on every load (screenshot)" has no claim; −10 changelog entry "#518 fix(reader): [bug] check the educator on the server before a content lock changes (persistence)" has no claim; −10 changelog entry "#519 fix(reader): [bug] make the Moodle sync educator-only in the reader (persistence)" has no claim |
| Change risk | 15 | **0** |  | −10 PR #476 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −3 PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #481 changed Reader, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #484 changed Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #487 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #504 changed Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −3 PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2; −10 PR #505 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #501 changed Infrastructure, Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #502 changed Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −5 PR #513 moves happy-dom 20.14.0 → 21.0.1 in the root: a major bump, ground the journeys may not cover; −3 PR #514 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #514 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #506 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #508 changed Shared Packages, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −3 PR #510 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #510 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #507 changed Shared Packages, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #511 changed Time, Reader, Shared Packages, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #509 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −10 PR #518 changed Reader, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −3 PR #519 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −5 reader churn 979 lines, above 2× its median of 101.5 over the last 6 releases; PR #519 is the largest part (498 lines); −5 time churn 568 lines, above 2× its median of 14 over the last 6 releases; PR #519 is the largest part (533 lines); −10 PR #519 changed Reader, Time, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −3 PR #520 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #520 changed Reader, Live, Catalogue, Shared Packages, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it; −5 live churn 14 lines, above 2× its median of 3.5 over the last 6 releases; PR #516 is the largest part (7 lines); −10 PR #516 changed Live, Catalogue, Time, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 0 (100 − 278), v17.0.0..180700e171ab642aa5eeefbf34b4c35e2be958d9: 24 of 29 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505) | fix(a11y): button names contain their visible text | 47 | 15 | 4 | 1.76 | yes |  | **−23** | −3 [PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-d4a40094af72b0eb12eea04ebee4e682bfc581553326bf472d1c2f849c7c623b); −10 [PR #505 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-4be7739a1047b396bc6d3e9502bee98cfdd9bde50bfcb576e9df02edfd063dd3) |
| [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) | fix(reader): [bug] make the Moodle sync educator-only in the reader (persistence) | 1438 | 40 | 4 | 0.19 | yes |  | **−23** | −3 [PR #519 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −5 [reader churn 979 lines, above 2× its median of 101.5 over the last 6 releases; PR #519 is the largest part (498 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-bdaa17518b67acb5b869730457e3db4212cd7d8deb8fdadd72d7a4fb7c1463f2); −5 [time churn 568 lines, above 2× its median of 14 over the last 6 releases; PR #519 is the largest part (533 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-8b7f790b5271e1164ee6cf94a7cfe8769a79823cd718721e7a17e34b5ca22800); −10 [PR #519 changed Reader, Time, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-40c77f2136c77d652b67d1cdf92b44089e2e0ebfbfb2cff443a6ff2119d6457f) |
| [#516](https://github.com/tutors-sdk/tutors-mono-repo/pull/516) | docs: bring docs in line with main after SvelteKit 3 | 94 | 12 | 0 | no production lines | yes |  | **−15** | −5 [live churn 14 lines, above 2× its median of 3.5 over the last 6 releases; PR #516 is the largest part (7 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/516/files#diff-cef73ce2edd030f570849f1de10c0568d309627d37334ffaf85e447e94389350); −10 [PR #516 changed Live, Catalogue, Time, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/516/files#diff-9c75df02d09573d64deea0a822ba5807d540ccad75393b98b2feeae95f98f449) |
| [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) | Route every Realtime channel through a budgeted port | 1349 | 41 | 1 | 1.46 | yes |  | **−13** | −3 [PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#514](https://github.com/tutors-sdk/tutors-mono-repo/pull/514) | feat(reader): export enrollment drafts from course visitors (dom, network, headers) | 651 | 15 | 4 | 2.55 | yes |  | **−13** | −3 [PR #514 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/514/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #514 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/514/files#diff-13bc0a33f184cb8d792a48300081d13e799b31f2a6adebb9b06a5609f0068def) |
| [#510](https://github.com/tutors-sdk/tutors-mono-repo/pull/510) | fix(reader): keep a private course out of Recently accessed for someone it turns away (found by the release harness) | 86 | 3 | 1 | 1.87 | yes |  | **−13** | −3 [PR #510 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/510/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #510 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/510/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b) |
| [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) | test: signed-in, resilience and authorisation journeys, message contracts, migrations on Postgres, mutation on PRs (dom, network) | 5082 | 99 | 4 | 30.01 | yes |  | **−13** | −3 [PR #520 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/520/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #520 changed Reader, Live, Catalogue, Shared Packages, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/520/files#diff-98f22a8fb8b7ad0d757eac9bc6007fc2108d28a4346433c4ccddce39c1ec079f) |
| [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) | Give each whiteboard room a Realtime budget | 377 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #476 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/476/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#480](https://github.com/tutors-sdk/tutors-mono-repo/pull/480) | Tutors Time: read only the chosen days of a course's calendar | 92 | 6 | 0 | 3.30 | yes |  | **−10** | −10 [PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/480/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) | Tutors Live: publish from the reader's server within a daily Realtime budget | 1421 | 23 | 0 | 3.38 | yes |  | **−10** | −10 [PR #481 changed Reader, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/481/files#diff-e4fcc76d91071866c7d54b16b300e500d67b42190747baa90741fe8de58a8179) |
| [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) | Release 17.0.0 to main and pin production to it | 424 | 13 | 0 | no production lines | yes |  | **−10** | −10 [PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/483/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#484](https://github.com/tutors-sdk/tutors-mono-repo/pull/484) | ci(deploy): open the pin pull request when a release tag's images are published | 247 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #484 changed Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/484/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#487](https://github.com/tutors-sdk/tutors-mono-repo/pull/487) | fix(community): show an empty catalogue without Supabase instead of logging errors | 67 | 3 | 0 | 3.47 | yes |  | **−10** | −10 [PR #487 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/487/files#diff-13d8ab5e67e09ca92971e77ee1fcbb71b39dd5a018144bf33a3bbabd5b3da020) |
| [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) | fix(nightly): make the three red Nightly jobs pass for real | 357 | 18 | 0 | no production lines | yes |  | **−10** | −10 [PR #504 changed Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/504/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500) | fix(deploy): immutable Cache-Control on /_app/immutable/* for Netlify | 30 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/500/files#diff-c5f7478f9ea43955917de963b542918dbd3c74bd2e710935fd2606ee0ce67ecd) |
| [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) | feat(image): declare a HEALTHCHECK and expose request SLIs from start (image-hardening, image-manifest, metrics) | 256 | 7 | 0 | 11.68 | yes |  | **−10** | −10 [PR #501 changed Infrastructure, Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/501/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#502](https://github.com/tutors-sdk/tutors-mono-repo/pull/502) | ci(image): attest SLSA v1 build provenance to every published image (build-provenance) | 205 | 3 | 0 | no production lines | yes |  | **−10** | −10 [PR #502 changed Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/502/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#506](https://github.com/tutors-sdk/tutors-mono-repo/pull/506) | fix(reader): link a local course's LLM downloads over http (dom) | 72 | 4 | 0 | 1.18 | yes |  | **−10** | −10 [PR #506 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/506/files#diff-7eefe5446d7d2d9f6a5a3758cefc8ac0ac9a1927189261d6f36b902293bf0588) |
| [#508](https://github.com/tutors-sdk/tutors-mono-repo/pull/508) | fix(time): read the course PIN from where the course is served (found by the release harness) | 91 | 3 | 0 | 3.55 | yes |  | **−10** | −10 [PR #508 changed Shared Packages, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/508/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#507](https://github.com/tutors-sdk/tutors-mono-repo/pull/507) | fix(time): reuse one Supabase client per url and key (console, network) | 84 | 3 | 0 | 8.33 | yes |  | **−10** | −10 [PR #507 changed Shared Packages, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/507/files#diff-5b11ac08ac0f8f58902608d1c44c6ee5c2bc78063e10e0e32fa3e757c51ccaa7) |
| [#511](https://github.com/tutors-sdk/tutors-mono-repo/pull/511) | fix(time): key labs by their full path, found by the release harness (dom) | 230 | 14 | 0 | 2.14 | yes |  | **−10** | −10 [PR #511 changed Time, Reader, Shared Packages, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/511/files#diff-89be349f0f1b3e21c15df9cf0ed382f7aefd1707b11ba8e0ca717547553a53fb) |
| [#509](https://github.com/tutors-sdk/tutors-mono-repo/pull/509) | fix(time): lay heat maps out the same on every load (screenshot) | 84 | 4 | 0 | 5.00 | yes |  | **−10** | −10 [PR #509 changed Reader, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/509/files#diff-d585d9ff35154e35a9681cefa655ae71605ca24958d3f758d9d5e7fea85751c2) |
| [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) | fix(reader): [bug] check the educator on the server before a content lock changes (persistence) | 484 | 21 | 0 | 0.92 | yes |  | **−10** | −10 [PR #518 changed Reader, Infrastructure, Development but no changelog entry under v180700e171ab642aa5eeefbf34b4c35e2be958d9 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/518/files#diff-97f47dfbbef70b6e2647599895724dd6f2ea689bb666f485238bff0bfb08cb8d) |
| [#513](https://github.com/tutors-sdk/tutors-mono-repo/pull/513) | Bump the "dependencies" group with 2 updates across multiple ecosystems | 237 | 4 | 0 | no production lines | yes |  | **−5** | −5 [PR #513 moves happy-dom 20.14.0 → 21.0.1 in the root: a major bump, ground the journeys may not cover](https://github.com/tutors-sdk/tutors-mono-repo/pull/513/files#diff-32824c984905bb02bc7ffcef96a77addd1f1602cff71a11fbbfdd7f53ee026bb) |
| 5 more | no deductions: #485, #493, #491, #512, #539 | 2309 | 22 |  |  |  |  | 0 |  |

- churn: reader 979 (median 101.5) ABOVE 2×, catalogue 14 (median 7.5), live 14 (median 3.5) ABOVE 2×, time 568 (median 14) ABOVE 2×
- hotspots: 15 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/connect/src/services/connect.svelte.ts, packages/svelte/utils/i18n/src/messages/fr.ts, packages/svelte/utils/i18n/src/messages/es.ts, packages/svelte/utils/i18n/src/messages/de.ts, packages/svelte/utils/i18n/src/messages/it.ts
- ownership: no file with 3+ authors
- orphans: 23 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at 180700e171ab642aa5eeefbf34b4c35e2be958d9 has no "### v180700e171ab642aa5eeefbf34b4c35e2be958d9" entries under a product section)
- tests: apps/catalogue 827.20, apps/live 827.20, apps/reader 7.20, apps/time 0.67, packages/jsr/realtime 2.32, packages/jsr/time 42.84, packages/svelte/app-config 225.00, packages/svelte/community 13.18, packages/svelte/connect 22.77, packages/svelte/course 133.42, packages/svelte/realtime-supabase 19.12, packages/svelte/ui-components 12.22, packages/svelte/ui-navigators 6.93, packages/svelte/ui-primitives 1034.00, packages/svelte/utils 19.35
- reviews: 29 approved, 0 not
- dependencies: happy-dom 20.14.0 → 21.0.1; 3 new direct dependencies (@electric-sql/pglite, @supabase/supabase-js, @supabase/supabase-js)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at 180700e171ab642aa5eeefbf34b4c35e2be958d9 has no "### v180700e171ab642aa5eeefbf34b4c35e2be958d9" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-10-24T02:25:48.075Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-180700e` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-180700e` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-180700e` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-180700e` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:44821edcd4584fca26da7fc01a5854577c1182d94f8faeb7f760823f5d68fc22` · rev `180700e171ab` · version `sha-180700e` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:e55011378ee1a897ee741eeefd2a664ca6f946e78191eb29dba3f56cd37dc7e9` · rev `180700e171ab` · version `sha-180700e` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:8235ab24435067d9c7e87b83795e29351c339da01b855263c65d63ffee402038` · rev `180700e171ab` · version `sha-180700e` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:2cb867820f61453e449904ea9e920f3602e80134f676110c51ba466b5012b1d3` · rev `180700e171ab` · version `sha-180700e` |

- 131 unclaimed diff(s)
- A/A consulted: clean at 2026-10-24T01:56:58.020Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): clean. Reported, never gates.

### 131 unclaimed differences, 18 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `dom` semantic DOM differs (+# −# lines at line #) | 48 | reader, catalogue, live, time | 39: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 33 more | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `focus` keyboard order changed (# stops on a, # on b) | 39 | reader, catalogue, live, time | 39: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 33 more | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `sbom` package added (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | reader | — | reader: package added: @supabase/auth-js@2.117.2 |
| `sbom` package removed (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | time | — | time: package removed: @supabase/auth-js@2.117.2 |
| `image-manifest` built FROM a different base image (lowest layer e#fce → #b#de#) | 4 | reader, catalogue, live, time | — | reader: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `sbom` package bumped (1 package: `node`) | 4 | reader, catalogue, live, time | — | reader: package bumped: node 22.23.3 → 22.23.4 |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 3 | time | 3: `time-auth:rule-0590-medians`, `time-auth:rule-0591-lab-bylab`, `time-auth:rule-0591-student` | time-auth:rule-0590-medians: 0.49% of pixels differ in 950×195 at (289, 605) (threshold 0.10%) |
| `console` new console message on b | 2 | reader | 1: `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: new console message on b |
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 2 | time | — | time: new series on b: http_request_duration_seconds_count |
| `persistence` POST tutors-connect-courses — # row(s) on a, # on b | 2 | — | — | rule-0588-content-lock: POST tutors-connect-courses — 3 row(s) on a, 2 on b |
| `persistence` POST tutors-connect-profiles — # row(s) on a, # on b | 2 | — | — | rule-0588-content-lock: POST tutors-connect-profiles — 3 row(s) on a, 2 on b |
| `dom` journey "rule-#-content-lock" completed on a but failed on b | 1 | — | — | journey "rule-0588-content-lock" completed on a but failed on b |
| `logs` error-level lines (1 field: `error`) | 1 | reader | — | reader-auth: error-level lines: 0 on a, 5 on b |
| `network` new request on b: PUT /api/courses/localhost%#A#/locks | 1 | reader | 1: `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/localhost%3A8081/locks |
| `persistence` POST app_errors — # row(s) on a, # on b | 1 | — | — | rule-0588-content-lock: POST app_errors — 0 row(s) on a, 1 on b |
| `persistence` POST tutors_content_locks — # row(s) on a, # on b | 1 | — | — | rule-0588-content-lock: POST tutors_content_locks — 2 row(s) on a, 0 on b |
| `persistence` POST tutors-connect-users — # row(s) on a, # on b | 1 | — | — | rule-0588-content-lock: POST tutors-connect-users — 3 row(s) on a, 2 on b |
| `persistence` RPC record_page_view — # row(s) on a, # on b | 1 | — | — | rule-0588-content-lock: RPC record_page_view — 3 row(s) on a, 2 on b |

Moved together on the same pages, so likely one change each:

- `dom`, `focus` on 35 pages (72 differences): `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 29 more
- `dom`, `focus`, `screenshot` on 3 pages (16 differences): `time-auth:rule-0590-medians`, `time-auth:rule-0591-lab-bylab`, `time-auth:rule-0591-student`
- `console`, `dom`, `focus`, `network` on 1 page (5 differences): `reader-auth:rule-0588-lecturer-locked`

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0591-time-labs`: Rule 0591 (exercises 0319): 16 differences in dom, focus, screenshot
- `rule-0588-content-lock`: Rule 0588 (exercises 0052, 0053, 0054): 12 differences in console, dom, focus, network, persistence
- `rule-0582-signed-in-lab`: Rule 0582 (exercises 0011, 0250, 0252, 0260, 0303, 0330): 8 differences in dom, focus
- `rule-0586-private-course`: Rule 0586 (exercises 0011, 0267): 8 differences in dom, focus, persistence
- `rule-0590-time-calendar`: Rule 0590 (exercises 0319): 8 differences in dom, focus, screenshot
- `rule-0584-quiz-notebook-talk`: Rule 0584 (exercises 0047, 0049, 0050): 6 differences in dom, focus
- `rule-0585-preferences`: Rule 0585 (exercises 0037, 0038, 0039): 4 differences in dom, focus
- `rule-0589-live`: Rule 0589 (exercises 0330, 0335): 4 differences in dom, focus
- `rule-0583-presence`: Rule 0583 (exercises 0046, 0064, 0280): 2 differences in dom, focus
- `rule-0587-calendar-llm`: Rule 0587 (exercises 0042, 0284): 2 differences in dom, focus
- `rule-0592-whiteboard`: Rule 0592 (exercises 0275, 0276): 2 differences in dom, focus

### Unclaimed differences (131)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `rule-0588-content-lock` | journey "rule-0588-content-lock" completed on a but failed on b |
| `dom` | `reader:home` | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 8) |
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
| `dom` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `live-auth:rule-0589-students` | live-auth:rule-0589-students: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: semantic DOM differs (+5 −3 lines at line 96) |
| `dom` | `time-auth:rule-0590-calendar-byweek` | time-auth:rule-0590-calendar-byweek: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0590-calendar-byday` | time-auth:rule-0590-calendar-byday: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+1 −1 lines at line 40) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+3 −2 lines at line 47) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+2 −1 lines at line 61) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+1 −0 lines at line 76) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+1 −0 lines at line 90) |
| `dom` | `time-auth:rule-0591-lab-bystep` | time-auth:rule-0591-lab-bystep: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-learning-records` | time-auth:rule-0591-learning-records: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: semantic DOM differs (+7 −4 lines at line 111) |
| `dom` | `reader-auth:rule-0582-course` | reader-auth:rule-0582-course: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0582-lab-step` | reader-auth:rule-0582-lab-step: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0582-lab-step-2` | reader-auth:rule-0582-lab-step-2: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0582-lab-step-back` | reader-auth:rule-0582-lab-step-back: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0583-profile-menu` | reader-auth:rule-0583-profile-menu: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0584-talk-slide-2` | reader-auth:rule-0584-talk-slide-2: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: semantic DOM differs (+1 −8 lines at line 60) |
| `dom` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: semantic DOM differs (+1 −8 lines at line 60) |
| `dom` | `reader-auth:rule-0587-llm` | reader-auth:rule-0587-llm: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: semantic DOM differs (+1 −1 lines at line 8) |
| `screenshot` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: 0.49% of pixels differ in 950×195 at (289, 605) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: 0.23% of pixels differ in 84×246 at (857, 271) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: 0.48% of pixels differ in 310×194 at (317, 606) (threshold 0.10%) |
| `network` | `PUT /api/courses/localhost%3A8081/locks` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/localhost%3A8081/locks |
| `console` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: new console message on b |
| `console` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: new console message on b |
| `metrics` | `time/http_request_duration_seconds_count` | time: new series on b: http_request_duration_seconds_count |
| `metrics` | `time/http_requests_total` | time: new series on b: http_requests_total |
| `logs` | `reader-auth/error` | reader-auth: error-level lines: 0 on a, 5 on b |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:course` | reader:course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:topic` | reader:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step` | reader:lab-step: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:lab-step-2` | reader:lab-step-2: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:search` | reader:search: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader:search-results` | reader:search-results: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `catalogue:home` | catalogue:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `live:home` | live:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:course` | reader-auth:course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:topic` | reader-auth:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:course` | reference:course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:topic` | reference:topic: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:lab` | reference:lab: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reference:note` | reference:note: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `live-auth:rule-0589-students` | live-auth:rule-0589-students: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `time-auth:rule-0590-calendar-byweek` | time-auth:rule-0590-calendar-byweek: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `time-auth:rule-0590-calendar-byday` | time-auth:rule-0590-calendar-byday: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `time-auth:rule-0591-lab-bystep` | time-auth:rule-0591-lab-bystep: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `time-auth:rule-0591-learning-records` | time-auth:rule-0591-learning-records: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0582-course` | reader-auth:rule-0582-course: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0582-lab-step` | reader-auth:rule-0582-lab-step: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0582-lab-step-2` | reader-auth:rule-0582-lab-step-2: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0582-lab-step-back` | reader-auth:rule-0582-lab-step-back: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0583-profile-menu` | reader-auth:rule-0583-profile-menu: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0584-talk-slide-2` | reader-auth:rule-0584-talk-slide-2: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0587-llm` | reader-auth:rule-0587-llm: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: keyboard order changed (12 stops on a, 12 on b) |
| `persistence` | `rule-0588-content-lock/app_errors` | rule-0588-content-lock: POST app_errors — 0 row(s) on a, 1 on b |
| `persistence` | `rule-0588-content-lock/tutors-connect-courses` | rule-0588-content-lock: POST tutors-connect-courses — 3 row(s) on a, 2 on b |
| `persistence` | `rule-0588-content-lock/tutors-connect-profiles` | rule-0588-content-lock: POST tutors-connect-profiles — 3 row(s) on a, 2 on b |
| `persistence` | `rule-0588-content-lock/tutors-connect-users` | rule-0588-content-lock: POST tutors-connect-users — 3 row(s) on a, 2 on b |
| `persistence` | `rule-0588-content-lock/tutors_content_locks` | rule-0588-content-lock: POST tutors_content_locks — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0588-content-lock/record_page_view` | rule-0588-content-lock: RPC record_page_view — 3 row(s) on a, 2 on b |
| `persistence` | `rule-0586-private-course/tutors-connect-courses` | rule-0586-private-course: POST tutors-connect-courses — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0586-private-course/tutors-connect-profiles` | rule-0586-private-course: POST tutors-connect-profiles — 2 row(s) on a, 0 on b |
| `image-manifest` | `reader/base` | reader: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `sbom` | `reader/@supabase/auth-js` | reader: package added: @supabase/auth-js@2.117.2 |
| `sbom` | `reader/@supabase/functions-js` | reader: package added: @supabase/functions-js@2.117.2 |
| `sbom` | `reader/@supabase/phoenix` | reader: package added: @supabase/phoenix@0.4.5 |
| `sbom` | `reader/@supabase/postgrest-js` | reader: package added: @supabase/postgrest-js@2.117.2 |
| `sbom` | `reader/@supabase/realtime-js` | reader: package added: @supabase/realtime-js@2.117.2 |
| `sbom` | `reader/@supabase/storage-js` | reader: package added: @supabase/storage-js@2.117.2 |
| `sbom` | `reader/@supabase/supabase-js` | reader: package added: @supabase/supabase-js@2.117.2 |
| `sbom` | `reader/iceberg-js` | reader: package added: iceberg-js@0.8.1 |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `reader/tslib` | reader: package added: tslib@2.8.1 |
| `image-manifest` | `catalogue/base` | catalogue: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.3 → 22.23.4 |
| `image-manifest` | `live/base` | live: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `sbom` | `live/node` | live: package bumped: node 22.23.3 → 22.23.4 |
| `image-manifest` | `time/base` | time: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `sbom` | `time/@supabase/auth-js` | time: package removed: @supabase/auth-js@2.117.2 |
| `sbom` | `time/@supabase/functions-js` | time: package removed: @supabase/functions-js@2.117.2 |
| `sbom` | `time/@supabase/phoenix` | time: package removed: @supabase/phoenix@0.4.5 |
| `sbom` | `time/@supabase/postgrest-js` | time: package removed: @supabase/postgrest-js@2.117.2 |
| `sbom` | `time/@supabase/realtime-js` | time: package removed: @supabase/realtime-js@2.117.2 |
| `sbom` | `time/@supabase/storage-js` | time: package removed: @supabase/storage-js@2.117.2 |
| `sbom` | `time/@supabase/supabase-js` | time: package removed: @supabase/supabase-js@2.117.2 |
| `sbom` | `time/iceberg-js` | time: package removed: iceberg-js@0.8.1 |
| `sbom` | `time/node` | time: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `time/tslib` | time: package removed: tslib@2.8.1 |

<details><summary>Detail of 97 difference(s)</summary>

`dom` `rule-0588-content-lock`

```
step "Then the page shows no heading "Topic 2"" (traffic/journeys/features/lecturer.feature:22) failed: the page shows 1 heading(s) "Topic 2"
```

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

`dom` `reader-auth:rule-0588-lecturer-locked`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
 - complementary "Course navigation":
   - navigation:
```

`dom` `live-auth:rule-0589-courses`

```
     - link "Live":
       - /url: /
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
 - complementary "Course navigation":
   - navigation:
```

`dom` `live-auth:rule-0589-students`

```
     - link "Live":
       - /url: /
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
 - complementary "Course navigation":
   - navigation:
```

`dom` `time-auth:rule-0590-medians`

```
     - link "Harness Rules Course":
       - /url: /harness-rules
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
 - complementary "Course navigation":
   - navigation "Class activity":
```

… and 77 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | 2 findings (2 on production too) |
| catalogue | 1 finding (1 on production too) | holds | 2 findings (2 on production too) |
| live | 1 finding (1 on production too) | holds | 2 findings (2 on production too) |
| time | 1 finding (1 on production too) | holds | 2 findings (2 on production too) |

### Informing (60; 60 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `realtime` | `reader-auth:rule-0592-stroke-saved/websocket` | reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 5 data frame(s) sent); readers must be publish-only (production too) | no date set | unclaimed |
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/GHSA-cg2g-xh64-v4q7` | reader: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/GHSA-mrv2-3pqr-j5jr` | reader: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/GHSA-cg2g-xh64-v4q7` | catalogue: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/GHSA-mrv2-3pqr-j5jr` | catalogue: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/GHSA-cg2g-xh64-v4q7` | live: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/GHSA-mrv2-3pqr-j5jr` | live: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/GHSA-cg2g-xh64-v4q7` | time: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/GHSA-mrv2-3pqr-j5jr` | time: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 173 → 176 immutable requests (JS 142 → 145, CSS 31 → 31), 1.6 MB → 1.7 MB; 3 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 532 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 543 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 1005 → 1025 immutable requests (JS 856 → 876, CSS 149 → 149), 11.1 MB → 11.2 MB; 11 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 125 immutable requests (JS 99 → 103, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live-auth` | live-auth: the asset graph changed: 179 → 182 immutable requests (JS 149 → 152, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `time-auth` | time-auth: the asset graph changed: 269 → 269 immutable requests (JS 235 → 235, CSS 34 → 34), 5.1 MB → 5.1 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 43× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET {{course}}/tutors.json` | replay:note-01: request no longer made on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-01: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-01: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:note-01 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 39× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/chunks/{{hash}}.js` | replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 43× on b | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/body/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/url/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/strict-transport-security` | catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/content-security-policy` | catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `live/strict-transport-security` | live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `live/content-security-policy` | live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/strict-transport-security` | reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/content-security-policy` | reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `time/strict-transport-security` | time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `time/content-security-policy` | time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |

### Claimed differences (30)

| artefact | scope | claimed by |
|---|---|---|
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `persistence` | `student-signs-in/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |
| `persistence` | `rule-0589-live/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |
| `persistence` | `rule-0589-live/realtime_watch` | Rule 0334: While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. — Rule 0334: while it shows a course or the platform feed, Tutors Live reports itself as a watcher of that feed through realtime_watch every 60 seconds (#481) |
| `persistence` | `rule-0582-signed-in-lab/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |
| `persistence` | `rule-0583-presence/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |

### Claim hygiene

4 claim(s) cover 30 failing hunk(s): 7.5 hunk(s) per claim, at most 17 under one claim (flagged above 10).

| artefact | scope | hunks | flag |
|---|---|---|---|
| `network` | `GET /_app/immutable/chunks/\{\{hash\}\}.js` | 17 | covers more than 10 hunks |

A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 307.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 267.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 267.3 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 272.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 97 advisories, db built 2026-10-23T06:30:15Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.32 ms | 2.14 ms |
| b | 601 | 0 | 0 | 1.23 ms | 2.01 ms |

<details><summary>Informational (110)</summary>

- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `realtime` reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 5 data frame(s) sent); readers must be publish-only (production too)
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.2 / b 0.25 per reader page (broadcasts a 18 / b 0, socket data frames a 6 / b 5, over 20 page view(s))
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
- `vuln-ceiling` reader: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` reader: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` catalogue: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` catalogue: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` live: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` live: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` time: GHSA-cg2g-xh64-v4q7 (Critical) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `vuln-ceiling` time: GHSA-mrv2-3pqr-j5jr (High) in dompurify@3.4.16 has a fix: 3.4.17 (production too)
- `asset-graph` reader: the asset graph changed: 173 → 176 immutable requests (JS 142 → 145, CSS 31 → 31), 1.6 MB → 1.7 MB; 3 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 532 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 543 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 1005 → 1025 immutable requests (JS 856 → 876, CSS 149 → 149), 11.1 MB → 11.2 MB; 11 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 125 immutable requests (JS 99 → 103, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `asset-graph` live-auth: the asset graph changed: 179 → 182 immutable requests (JS 149 → 152, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn
- `asset-graph` time-auth: the asset graph changed: 269 → 269 immutable requests (JS 235 → 235, CSS 34 → 34), 5.1 MB → 5.1 MB; 0 network and 0 headers difference(s) are this churn
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 43× on b
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b
- `replay` replay:note-01: request no longer made on b: GET {{course}}/tutors.json
- `replay` replay:note-01: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:note-01: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:note-01: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b
- `replay` replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b
- `replay` replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 39× on b
- `replay` replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 43× on b
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
- `secrets-in-response` reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `headers-policy` catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)

</details>

<sub>harness 1.57.0 (51b6752a4014, contract 1.57.0) · 2026-10-24T02:25:48.075Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×262, request-id×262, etag×262, metrics-process×602, metrics-timing-histograms×22, third-party-requests×6650, persistence-stub-requests×2330, oauth-callback-state×105, media-range-status×48, course-media-http2-reset×1, hashed-assets×19505, footer-tutors-version×824, transport-length×262, transport-connection×262, transport-keepalive×262</sub>


</details>
