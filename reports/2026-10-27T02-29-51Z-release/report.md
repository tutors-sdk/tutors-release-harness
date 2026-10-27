## Release gate: sha-eef3a27 beside 17.0.0

**Gate: FAIL**

#### New since the last forecast

**17 new, 0 gone** in the unclaimed set since the forecast of 2026-10-24T21:55:12.430Z (`sha-180700e`), beside the same baseline `17.0.0`. By artefact: sbom +16 −0 · screenshot +1 −0.

| artefact | scope | what |
| --- | --- | --- |
| screenshot | reader-auth:rule-0584-quiz-results | reader-auth:rule-0584-quiz-results: 0.11% of pixels differ in 335×16 at (355, 473) (threshold 0.10%) |
| sbom | reader/dompurify | reader: package bumped: dompurify 3.4.16 → 3.4.17 |
| sbom | reader/entities | reader: package bumped: entities 8.0.0 → 8.1.0 |
| sbom | reader/tzdata | reader: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| sbom | reader/undici | reader: package bumped: undici 8.11.2 → 8.12.3 |
| sbom | catalogue/dompurify | catalogue: package bumped: dompurify 3.4.16 → 3.4.17 |
| sbom | catalogue/entities | catalogue: package bumped: entities 8.0.0 → 8.1.0 |
| sbom | catalogue/tzdata | catalogue: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| sbom | catalogue/undici | catalogue: package bumped: undici 8.11.2 → 8.12.3 |
| sbom | live/dompurify | live: package bumped: dompurify 3.4.16 → 3.4.17 |
| sbom | live/entities | live: package bumped: entities 8.0.0 → 8.1.0 |
| sbom | live/tzdata | live: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| sbom | live/undici | live: package bumped: undici 8.11.2 → 8.12.3 |
| sbom | time/dompurify | time: package bumped: dompurify 3.4.16 → 3.4.17 |
| sbom | time/entities | time: package bumped: entities 8.0.0 → 8.1.0 |

and 2 more new: each is in the report's unclaimed differences below.

#### Causes and the PRs behind them

11 causes, 11 with a PR named. Merged since the forecast of `sha-180700e`: [#425](https://github.com/tutors-sdk/tutors-mono-repo/pull/425), [#546](https://github.com/tutors-sdk/tutors-mono-repo/pull/546), [#547](https://github.com/tutors-sdk/tutors-mono-repo/pull/547), [#548](https://github.com/tutors-sdk/tutors-mono-repo/pull/548), [#489](https://github.com/tutors-sdk/tutors-mono-repo/pull/489), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517). No cause is new since then. Each is matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| dom: semantic DOM differs (+# −# lines at line #) | 50 | [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (29 files, 18 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (20 files, 6 direct) and 20 more |
| focus: keyboard order changed (# stops on a, # on b) | 41 | [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (29 files, 18 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (20 files, 6 direct) and 20 more |
| sbom: package bumped | 20 | [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (5 files, 4 direct), [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (2 files, 1 direct) and 11 more |
| sbom: package added | 9 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct), [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (5 files, 1 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (2 files, 1 direct) and 11 more |
| sbom: package removed | 9 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct), [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (5 files, 1 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (2 files, 1 direct) and 11 more |
| image-manifest: built FROM a different base image (lowest layer e#fce → #b#de#) | 4 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (2 files), [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) (1 file) |
| screenshot: #% of pixels differ in #×# at (#, #) (threshold #%) | 4 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct) and 20 more |
| metrics: new series on b | 2 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (16 files, 9 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (15 files, 4 direct), [#511](https://github.com/tutors-sdk/tutors-mono-repo/pull/511) (5 files, 2 direct) and 18 more |
| network: new request on b: PUT /api/courses/harness-rules/locks | 2 | [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct) and 20 more |
| persistence: POST tutors-connect-courses — # row(s) on a, # on b | 1 | [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct) and 20 more |
| persistence: POST tutors-connect-profiles — # row(s) on a, # on b | 1 | [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (12 files, 5 direct), [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) (9 files, 5 direct) and 20 more |

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

#### Claims owed (11)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 143, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # dom: semantic DOM differs (+# −# lines at line #): covers its 50 differences. Name the Rule that intends it, or fix it.
  - artefact: "dom"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "semantic DOM differs (+# −# lines at line #): 50 differences (reader, catalogue, live, time; 41 pages); likely #517, #519, #520"
  # focus: keyboard order changed (# stops on a, # on b): covers its 41 differences. Name the Rule that intends it, or fix it.
  - artefact: "focus"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "keyboard order changed (# stops on a, # on b): 41 differences (reader, catalogue, live, time; 41 pages); likely #517, #519, #520"
  # sbom: package bumped: covers its 20 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "*/{dompurify,entities,node,tzdata,undici}"
    rule: "????"
    reason: "package bumped: 20 differences (reader, catalogue, live, time; 5 packages); likely #483, #504, #518"
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
    reason: "built FROM a different base image (lowest layer e#fce → #b#de#): 4 differences (reader, catalogue, live, time); likely #504, #501"
  # screenshot: #% of pixels differ in #×# at (#, #) (threshold #%): covers its 4 differences. Name the Rule that intends it, or fix it.
  - artefact: "screenshot"
    scope: "{reader-auth:rule-0584-quiz-results,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-student}"
    rule: "????"
    reason: "#% of pixels differ in #×# at (#, #) (threshold #%): 4 differences (reader, time; 4 pages); likely #519, #517, #518"
  # metrics: new series on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "metrics"
    scope: "time/http_{request_duration_seconds_count,requests_total}"
    rule: "????"
    reason: "new series on b: 2 differences (time; 2 names); likely #519, #517, #511"
  # network: new request on b: PUT /api/courses/harness-rules/locks: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "PUT /api/courses/harness-rules/locks"
    rule: "????"
    reason: "new request on b: PUT /api/courses/harness-rules/locks: 2 differences (reader; 2 pages); likely #517, #519, #518"
  # persistence: POST tutors-connect-courses — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0586-private-course/tutors-connect-courses"
    rule: "????"
    reason: "POST tutors-connect-courses — # row(s) on a, # on b: 1 difference; likely #517, #519, #518"
  # persistence: POST tutors-connect-profiles — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0586-private-course/tutors-connect-profiles"
    rule: "????"
    reason: "POST tutors-connect-profiles — # row(s) on a, # on b: 1 difference; likely #517, #519, #518"
```

7 of 8 dimensions measured (weight 95 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** |  | −20 unclaimed: dom /: reader:home: semantic DOM differs (+1 −1 lines at line 10); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+1 −1 lines at line 9); −20 unclaimed: dom /topic/localhost:8080/unit-1/topic-01: reader:topic: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01: reader:lab-step: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-01: reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 8) (and 138 more like it, not counted again: report.html#differences); −5 claim network GET /_app/immutable/chunks/\{\{hash\}\}.js covers 19 hunks at once (not narrow) |
| Noise health | 15 | **80** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask chromium-compute-pressure-policy fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | **0** | **breached** | −30 mutation score 67.12% on @tutors/course, below 80%; −30 mutation score 72.73% on @tutors/i18n, below 80%; −30 mutation score 75.93% on @tutors/metrics, below 80%; −30 mutation score 65.4% on @tutors/rbac, below 80%; −30 mutation score 75% on @tutors/ui-components, below 80%; −30 mutation score 55.11% on @tutors/ui-navigators, below 80%; −30 mutation score 1.43% on @tutors/ui-primitives, below 80% |
| Requirements traceability | 10 | **0** | **breached** | floor 27 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry); each costs change risk its points; −20 changelog entry "#485 fix(deps): clear the three advisories failing the dependency audit" has no EARS file; −20 changelog entry "#504 fix(nightly): make the three red Nightly jobs pass for real" has no EARS file; −10 changelog entry "#504 fix(nightly): make the three red Nightly jobs pass for real" has no claim; −10 changelog entry "#505 fix(a11y): button names contain their visible text" has no claim; −20 changelog entry "#500 fix(deploy): immutable Cache-Control on /_app/immutable/* for Netlify" has no EARS file; −10 changelog entry "#501 feat(image): declare a HEALTHCHECK and expose request SLIs from start (image-hardening, image-manifest, metrics)" has no claim; −10 changelog entry "#514 feat(reader): export enrollment drafts from course visitors (dom, network, headers)" has no claim; −10 changelog entry "#506 fix(reader): link a local course's LLM downloads over http (dom)" has no claim; −10 changelog entry "#510 fix(reader): keep a private course out of Recently accessed for someone it turns away (found by the release harness)" has no claim; −10 changelog entry "#507 fix(time): reuse one Supabase client per url and key (console, network)" has no claim; −10 changelog entry "#491 feat(dev): EARS dashboard, one page for every Rule and the format" has no claim; −10 changelog entry "#511 fix(time): key labs by their full path, found by the release harness (dom)" has no claim; −10 changelog entry "#509 fix(time): lay heat maps out the same on every load (screenshot)" has no claim; −10 changelog entry "#518 fix(reader): [bug] check the educator on the server before a content lock changes (persistence)" has no claim; −10 changelog entry "#519 fix(reader): [bug] make the Moodle sync educator-only in the reader (persistence)" has no claim; −20 changelog entry "#547 fix(deps): patch dompurify, undici, markdown-it, vite and happy-dom advisories (sbom)" has no EARS file; −10 changelog entry "#547 fix(deps): patch dompurify, undici, markdown-it, vite and happy-dom advisories (sbom)" has no claim; −10 changelog entry "#548 feat(quiz): fenced code blocks in quiz questions and options (dom)" has no claim |
| Change risk | 15 | **0** |  | −10 PR #476 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #481 changed Reader, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #484 changed Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #487 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #504 changed Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2; −10 PR #505 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #501 changed Infrastructure, Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #502 changed Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #514 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #514 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #506 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #508 changed Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #510 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #510 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #507 changed Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #511 changed Time, Reader, Shared Packages, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #509 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #518 changed Reader, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #519 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −5 reader churn 1015 lines, above 2× its median of 101.5 over the last 6 releases; PR #519 is the largest part (498 lines); −5 time churn 590 lines, above 2× its median of 14 over the last 6 releases; PR #519 is the largest part (533 lines); −10 PR #519 changed Reader, Time, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #520 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #520 changed Reader, Live, Catalogue, Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #516 changed Live, Catalogue, Time, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #425 changed Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −10 PR #548 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #489 touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases); −10 PR #489 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −3 PR #517 touches 3 hotspots apps/reader/src/hooks.server.ts (3 of the last 6 releases), packages/svelte/community/src/utils/error-transport.ts (3 of the last 6 releases), apps/time/src/hooks.server.ts (3 of the last 6 releases); −10 PR #517 changed 21 production lines in apps/catalogue with 0 test lines (0.00); 21 production lines in apps/live with 0 test lines (0.00); 36 production lines in apps/reader with 0 test lines (0.00); 22 production lines in apps/time with 0 test lines (0.00); 16 production lines in packages/svelte/community with 0 test lines (0.00); 16 production lines in packages/svelte/identity-sveltekit with 0 test lines (0.00); 23 production lines in packages/svelte/utils with 0 test lines (0.00): below 0.2; −5 catalogue churn 35 lines, above 2× its median of 7.5 over the last 6 releases; PR #517 is the largest part (21 lines); −5 live churn 35 lines, above 2× its median of 3.5 over the last 6 releases; PR #517 is the largest part (21 lines); −10 PR #517 changed Reader, Live, Catalogue, Time, Infrastructure but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it; −5 the release moves happy-dom 20.14.0 → 21.0.4 in the root: a major bump, ground the journeys may not cover |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 0 (100 − 339), v17.0.0..eef3a27815e743c059e0fd74ed5a1efb149c7ff5: 27 of 35 PRs carry a finding, and 1 finding(s) no PR carries.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) | docs(comments): header comments on the production request path | 166 | 32 | 3 | 0.00 | yes |  | **−33** | −3 [PR #517 touches 3 hotspots apps/reader/src/hooks.server.ts (3 of the last 6 releases), packages/svelte/community/src/utils/error-transport.ts (3 of the last 6 releases), apps/time/src/hooks.server.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-d6d421ccc99e28b6214f7df730798547515a524700fe6758ff2aaa6b7cdd8856); −10 [PR #517 changed 21 production lines in apps/catalogue with 0 test lines (0.00); 21 production lines in apps/live with 0 test lines (0.00); 36 production lines in apps/reader with 0 test lines (0.00); 22 production lines in apps/time with 0 test lines (0.00); 16 production lines in packages/svelte/community with 0 test lines (0.00); 16 production lines in packages/svelte/identity-sveltekit with 0 test lines (0.00); 23 production lines in packages/svelte/utils with 0 test lines (0.00): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-d6d421ccc99e28b6214f7df730798547515a524700fe6758ff2aaa6b7cdd8856); −5 [catalogue churn 35 lines, above 2× its median of 7.5 over the last 6 releases; PR #517 is the largest part (21 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-681a6274b9d04d85e52f7f862f2dc5bcff947154b547367bdf9eaf0e3ab2b849); −5 [live churn 35 lines, above 2× its median of 3.5 over the last 6 releases; PR #517 is the largest part (21 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-e53bd4734255e1d22ae9cadb161045e24b80541b0a23ffa3dfd06daddf4af5ac); −10 [PR #517 changed Reader, Live, Catalogue, Time, Infrastructure but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-d6a0a4bcd386b6be385bc1065b14c63cdcb15c76c5de9b6842895eb698fad6e3) |
| [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505) | fix(a11y): button names contain their visible text | 47 | 15 | 4 | 1.76 | yes |  | **−23** | −3 [PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-d4a40094af72b0eb12eea04ebee4e682bfc581553326bf472d1c2f849c7c623b); −10 [PR #505 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-4be7739a1047b396bc6d3e9502bee98cfdd9bde50bfcb576e9df02edfd063dd3) |
| [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) | fix(reader): [bug] make the Moodle sync educator-only in the reader (persistence) | 1438 | 40 | 4 | 0.19 | yes |  | **−23** | −3 [PR #519 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −5 [reader churn 1015 lines, above 2× its median of 101.5 over the last 6 releases; PR #519 is the largest part (498 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-bdaa17518b67acb5b869730457e3db4212cd7d8deb8fdadd72d7a4fb7c1463f2); −5 [time churn 590 lines, above 2× its median of 14 over the last 6 releases; PR #519 is the largest part (533 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-8b7f790b5271e1164ee6cf94a7cfe8769a79823cd718721e7a17e34b5ca22800); −10 [PR #519 changed Reader, Time, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-40c77f2136c77d652b67d1cdf92b44089e2e0ebfbfb2cff443a6ff2119d6457f) |
| [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) | Route every Realtime channel through a budgeted port | 1349 | 41 | 1 | 1.46 | yes |  | **−13** | −3 [PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#514](https://github.com/tutors-sdk/tutors-mono-repo/pull/514) | feat(reader): export enrollment drafts from course visitors (dom, network, headers) | 651 | 15 | 4 | 2.55 | yes |  | **−13** | −3 [PR #514 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/514/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #514 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/514/files#diff-13bc0a33f184cb8d792a48300081d13e799b31f2a6adebb9b06a5609f0068def) |
| [#510](https://github.com/tutors-sdk/tutors-mono-repo/pull/510) | fix(reader): keep a private course out of Recently accessed for someone it turns away (found by the release harness) | 86 | 3 | 1 | 1.87 | yes |  | **−13** | −3 [PR #510 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/510/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #510 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/510/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b) |
| [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) | test: signed-in, resilience and authorisation journeys, message contracts, migrations on Postgres, mutation on PRs (dom, network) | 5082 | 99 | 4 | 30.01 | yes |  | **−13** | −3 [PR #520 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/520/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #520 changed Reader, Live, Catalogue, Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/520/files#diff-98f22a8fb8b7ad0d757eac9bc6007fc2108d28a4346433c4ccddce39c1ec079f) |
| [#489](https://github.com/tutors-sdk/tutors-mono-repo/pull/489) | Close the prose and code gaps from #488 that main can fix today | 182 | 16 | 1 | 0.50 | yes |  | **−13** | −3 [PR #489 touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/489/files#diff-3805a328d2572205ef2f52b7b2b8eb8164c3c1dc10b3c867d195122994548757); −10 [PR #489 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/489/files#diff-8af0bde393b8123c01d17adc2011a612037eadcac15e56cf825b51b5b3c9654b) |
| [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) | Give each whiteboard room a Realtime budget | 377 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #476 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/476/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#480](https://github.com/tutors-sdk/tutors-mono-repo/pull/480) | Tutors Time: read only the chosen days of a course's calendar | 92 | 6 | 0 | 3.30 | yes |  | **−10** | −10 [PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/480/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) | Tutors Live: publish from the reader's server within a daily Realtime budget | 1421 | 23 | 0 | 3.38 | yes |  | **−10** | −10 [PR #481 changed Reader, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/481/files#diff-e4fcc76d91071866c7d54b16b300e500d67b42190747baa90741fe8de58a8179) |
| [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) | Release 17.0.0 to main and pin production to it | 424 | 13 | 0 | no production lines | yes |  | **−10** | −10 [PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/483/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#484](https://github.com/tutors-sdk/tutors-mono-repo/pull/484) | ci(deploy): open the pin pull request when a release tag's images are published | 247 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #484 changed Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/484/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#487](https://github.com/tutors-sdk/tutors-mono-repo/pull/487) | fix(community): show an empty catalogue without Supabase instead of logging errors | 67 | 3 | 0 | 3.47 | yes |  | **−10** | −10 [PR #487 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/487/files#diff-13d8ab5e67e09ca92971e77ee1fcbb71b39dd5a018144bf33a3bbabd5b3da020) |
| [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) | fix(nightly): make the three red Nightly jobs pass for real | 357 | 18 | 0 | no production lines | yes |  | **−10** | −10 [PR #504 changed Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/504/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500) | fix(deploy): immutable Cache-Control on /_app/immutable/* for Netlify | 30 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/500/files#diff-c5f7478f9ea43955917de963b542918dbd3c74bd2e710935fd2606ee0ce67ecd) |
| [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) | feat(image): declare a HEALTHCHECK and expose request SLIs from start (image-hardening, image-manifest, metrics) | 256 | 7 | 0 | 11.68 | yes |  | **−10** | −10 [PR #501 changed Infrastructure, Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/501/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#502](https://github.com/tutors-sdk/tutors-mono-repo/pull/502) | ci(image): attest SLSA v1 build provenance to every published image (build-provenance) | 205 | 3 | 0 | no production lines | yes |  | **−10** | −10 [PR #502 changed Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/502/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#506](https://github.com/tutors-sdk/tutors-mono-repo/pull/506) | fix(reader): link a local course's LLM downloads over http (dom) | 72 | 4 | 0 | 1.18 | yes |  | **−10** | −10 [PR #506 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/506/files#diff-7eefe5446d7d2d9f6a5a3758cefc8ac0ac9a1927189261d6f36b902293bf0588) |
| [#508](https://github.com/tutors-sdk/tutors-mono-repo/pull/508) | fix(time): read the course PIN from where the course is served (found by the release harness) | 91 | 3 | 0 | 3.55 | yes |  | **−10** | −10 [PR #508 changed Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/508/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#507](https://github.com/tutors-sdk/tutors-mono-repo/pull/507) | fix(time): reuse one Supabase client per url and key (console, network) | 84 | 3 | 0 | 8.33 | yes |  | **−10** | −10 [PR #507 changed Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/507/files#diff-5b11ac08ac0f8f58902608d1c44c6ee5c2bc78063e10e0e32fa3e757c51ccaa7) |
| [#511](https://github.com/tutors-sdk/tutors-mono-repo/pull/511) | fix(time): key labs by their full path, found by the release harness (dom) | 230 | 14 | 0 | 2.14 | yes |  | **−10** | −10 [PR #511 changed Time, Reader, Shared Packages, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/511/files#diff-89be349f0f1b3e21c15df9cf0ed382f7aefd1707b11ba8e0ca717547553a53fb) |
| [#509](https://github.com/tutors-sdk/tutors-mono-repo/pull/509) | fix(time): lay heat maps out the same on every load (screenshot) | 84 | 4 | 0 | 5.00 | yes |  | **−10** | −10 [PR #509 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/509/files#diff-d585d9ff35154e35a9681cefa655ae71605ca24958d3f758d9d5e7fea85751c2) |
| [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) | fix(reader): [bug] check the educator on the server before a content lock changes (persistence) | 484 | 21 | 0 | 0.92 | yes |  | **−10** | −10 [PR #518 changed Reader, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/518/files#diff-97f47dfbbef70b6e2647599895724dd6f2ea689bb666f485238bff0bfb08cb8d) |
| [#516](https://github.com/tutors-sdk/tutors-mono-repo/pull/516) | docs: bring docs in line with main after SvelteKit 3 | 94 | 12 | 0 | no production lines | yes |  | **−10** | −10 [PR #516 changed Live, Catalogue, Time, Infrastructure, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/516/files#diff-9c75df02d09573d64deea0a822ba5807d540ccad75393b98b2feeae95f98f449) |
| [#425](https://github.com/tutors-sdk/tutors-mono-repo/pull/425) | fix(gen): leave folders of no kind out of tutors.json at any depth | 101 | 11 | 0 | 6.14 | yes |  | **−10** | −10 [PR #425 changed Shared Packages, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/425/files#diff-ec67d57817841e44513dccfa91d1cb28eceb4c1ba442961cdb893247c05ff218) |
| [#548](https://github.com/tutors-sdk/tutors-mono-repo/pull/548) | feat(quiz): fenced code blocks in quiz questions and options (dom) | 774 | 20 | 0 | 1.91 | yes |  | **−10** | −10 [PR #548 changed Reader, Development but no changelog entry under veef3a27815e743c059e0fd74ed5a1efb149c7ff5 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/548/files#diff-22d70ca7e354eea60e156d8536e28c645b1beef66a935ecd4e9770fa168f8364) |
| 8 more | no deductions: #485, #493, #513, #491, #512, #539, #546, #547 | 3249 | 37 |  |  |  |  | 0 |  |

No PR between the tags carries these:

- −5 the release moves happy-dom 20.14.0 → 21.0.4 in the root: a major bump, ground the journeys may not cover (pnpm-lock.yaml)

- churn: reader 1015 (median 101.5) ABOVE 2×, catalogue 35 (median 7.5) ABOVE 2×, live 35 (median 3.5) ABOVE 2×, time 590 (median 14) ABOVE 2×
- hotspots: 15 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/connect/src/services/connect.svelte.ts, packages/svelte/utils/i18n/src/messages/fr.ts, packages/svelte/utils/i18n/src/messages/es.ts, packages/svelte/utils/i18n/src/messages/de.ts, packages/svelte/utils/i18n/src/messages/it.ts, packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte, apps/reader/src/hooks.server.ts, packages/svelte/community/src/utils/error-transport.ts, apps/time/src/hooks.server.ts
- ownership: no file with 3+ authors
- orphans: 27 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at eef3a27815e743c059e0fd74ed5a1efb149c7ff5 has no "### veef3a27815e743c059e0fd74ed5a1efb149c7ff5" entries under a product section)
- tests: apps/catalogue 159.08, apps/live 159.08, apps/reader 6.90, apps/time 0.64, packages/jsr/gen 6.14, packages/jsr/realtime 2.32, packages/jsr/time 42.84, packages/svelte/app-config 225.00, packages/svelte/community 12.72, packages/svelte/connect 22.77, packages/svelte/course 133.42, packages/svelte/identity-sveltekit 0.00 LOW, packages/svelte/quiz 2.46, packages/svelte/realtime-supabase 19.12, packages/svelte/ui-components 9.88, packages/svelte/ui-navigators 4.92, packages/svelte/ui-primitives 85.35, packages/svelte/utils 17.82
- reviews: 35 approved, 0 not
- dependencies: happy-dom 20.14.0 → 21.0.4; 3 new direct dependencies (@electric-sql/pglite, @supabase/supabase-js, @supabase/supabase-js)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at eef3a27815e743c059e0fd74ed5a1efb149c7ff5 has no "### veef3a27815e743c059e0fd74ed5a1efb149c7ff5" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-10-27T02:29:51.926Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-eef3a27` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-eef3a27` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-eef3a27` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-eef3a27` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:89f1ab9b78c7583da62b273331378945af46fee3a20d1659127bc3ab82d34a75` · rev `eef3a27815e7` · version `sha-eef3a27` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:f81da77012d032029dbe865741c31c1a69233efc01049a65761d6c1c87b95fd7` · rev `eef3a27815e7` · version `sha-eef3a27` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:66b4b810911da9cfa086e481ea1b642d25900dc4cc5e5d53ad7061c16d181d61` · rev `eef3a27815e7` · version `sha-eef3a27` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:6f9ff5a7580e1779ffa9b9d9128e9a90a5ee73e157a802af66fdc9756e09e617` · rev `eef3a27815e7` · version `sha-eef3a27` |

- 143 unclaimed diff(s)
- A/A consulted: clean at 2026-10-27T01:57:55.534Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): 8 difference(s); 19 of this run's 175 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.
  - `dom` `replay:topic-02`: replay:topic-02: semantic DOM differs (+75 −0 lines at line 1)
  - `dom` `replay:talk-01`: replay:talk-01: semantic DOM differs (+1 −9 lines at line 40)
  - `network` `GET /_app/immutable/chunks/{{hash}}.js`: replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on a2
  - `network` `GET {{course}}/tutors.json`: replay:topic-02: new request on a2: GET {{course}}/tutors.json
  - `network` `GET /_app/immutable/assets/1.{{hash}}.css`: replay:topic-02: new request on a2: GET /_app/immutable/assets/1.{{hash}}.css
  - `network` `GET /_app/immutable/nodes/1.{{hash}}.js`: replay:topic-02: new request on a2: GET /_app/immutable/nodes/1.{{hash}}.js
  - `network` `GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100`: replay:topic-02: new request on a2: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100
  - `network` `GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100`: replay:talk-01: request no longer made on a2: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100

### 143 unclaimed differences, 11 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `dom` semantic DOM differs (+# −# lines at line #) | 50 | reader, catalogue, live, time | 41: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `focus` keyboard order changed (# stops on a, # on b) | 41 | reader, catalogue, live, time | 41: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `sbom` package bumped (5 packages: `dompurify`, `entities`, `node`, `tzdata`, `undici`) | 20 | reader, catalogue, live, time | — | reader: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` package added (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | reader | — | reader: package added: @supabase/auth-js@2.117.2 |
| `sbom` package removed (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | time | — | time: package removed: @supabase/auth-js@2.117.2 |
| `image-manifest` built FROM a different base image (lowest layer e#fce → #b#de#) | 4 | reader, catalogue, live, time | — | reader: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 4 | reader, time | 4: `reader-auth:rule-0584-quiz-results`, `time-auth:rule-0590-medians`, `time-auth:rule-0591-lab-bylab`, `time-auth:rule-0591-student` | time-auth:rule-0590-medians: 0.49% of pixels differ in 950×195 at (289, 605) (threshold 0.10%) |
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 2 | time | — | time: new series on b: http_request_duration_seconds_count |
| `network` new request on b: PUT /api/courses/harness-rules/locks | 2 | reader | 2: `reader-auth:rule-0588-lecturer-locked`, `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/harness-rules/locks |
| `persistence` POST tutors-connect-courses — # row(s) on a, # on b | 1 | — | — | rule-0586-private-course: POST tutors-connect-courses — 2 row(s) on a, 0 on b |
| `persistence` POST tutors-connect-profiles — # row(s) on a, # on b | 1 | — | — | rule-0586-private-course: POST tutors-connect-profiles — 2 row(s) on a, 0 on b |

Moved together on the same pages, so likely one change each:

- `dom`, `focus` on 35 pages (72 differences): `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 29 more
- `dom`, `focus`, `screenshot` on 4 pages (19 differences): `reader-auth:rule-0584-quiz-results`, `time-auth:rule-0590-medians`, `time-auth:rule-0591-lab-bylab`, `time-auth:rule-0591-student`
- `dom`, `focus`, `network` on 2 pages (6 differences): `reader-auth:rule-0588-lecturer-locked`, `reader-auth:rule-0588-student-locked-card`

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0591-time-labs`: Rule 0591 (exercises 0319): 16 differences in dom, focus, screenshot
- `rule-0582-signed-in-lab`: Rule 0582 (exercises 0011, 0250, 0252, 0260, 0303, 0330): 8 differences in dom, focus
- `rule-0586-private-course`: Rule 0586 (exercises 0011, 0267): 8 differences in dom, focus, persistence
- `rule-0588-content-lock`: Rule 0588 (exercises 0052, 0053, 0054): 8 differences in dom, focus, network
- `rule-0590-time-calendar`: Rule 0590 (exercises 0319): 8 differences in dom, focus, screenshot
- `rule-0584-quiz-notebook-talk`: Rule 0584 (exercises 0047, 0049, 0050): 7 differences in dom, focus, screenshot
- `rule-0585-preferences`: Rule 0585 (exercises 0037, 0038, 0039): 4 differences in dom, focus
- `rule-0589-live`: Rule 0589 (exercises 0330, 0335): 4 differences in dom, focus
- `rule-0583-presence`: Rule 0583 (exercises 0046, 0064, 0280): 2 differences in dom, focus
- `rule-0587-calendar-llm`: Rule 0587 (exercises 0042, 0284): 2 differences in dom, focus
- `rule-0592-whiteboard`: Rule 0592 (exercises 0275, 0276): 2 differences in dom, focus

### Unclaimed differences (143)

| artefact | scope | what changed |
|---|---|---|
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
| `dom` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: semantic DOM differs (+1 −1 lines at line 9) |
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
| `screenshot` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: 0.11% of pixels differ in 335×16 at (355, 473) (threshold 0.10%) |
| `network` | `PUT /api/courses/harness-rules/locks` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/harness-rules/locks |
| `network` | `PUT /api/courses/harness-rules/locks` | reader-auth:rule-0588-student-locked-card: new request on b: PUT /api/courses/harness-rules/locks |
| `metrics` | `time/http_request_duration_seconds_count` | time: new series on b: http_request_duration_seconds_count |
| `metrics` | `time/http_requests_total` | time: new series on b: http_requests_total |
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
| `focus` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: keyboard order changed (12 stops on a, 12 on b) |
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
| `sbom` | `reader/dompurify` | reader: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `reader/entities` | reader: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `reader/iceberg-js` | reader: package added: iceberg-js@0.8.1 |
| `sbom` | `reader/node` | reader: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `reader/tslib` | reader: package added: tslib@2.8.1 |
| `sbom` | `reader/tzdata` | reader: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| `sbom` | `reader/undici` | reader: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `catalogue/base` | catalogue: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `sbom` | `catalogue/dompurify` | catalogue: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `catalogue/entities` | catalogue: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `catalogue/node` | catalogue: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `catalogue/tzdata` | catalogue: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| `sbom` | `catalogue/undici` | catalogue: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `live/base` | live: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `sbom` | `live/dompurify` | live: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `live/entities` | live: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `live/node` | live: package bumped: node 22.23.3 → 22.23.4 |
| `sbom` | `live/tzdata` | live: package bumped: tzdata 2026c-0+deb12u1 → 2026e-0+deb12u1 |
| `sbom` | `live/undici` | live: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `time/base` | time: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
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

<details><summary>Detail of 99 difference(s)</summary>

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

`dom` `reader-auth:rule-0588-student-hidden`

```
     - text: Tutors CI
     - button "Search this course": Search
-    - button "Open Theme Menu": Preferences
+    - button "Preferences"
 - complementary "Course navigation":
   - navigation:
```

`dom` `reader-auth:rule-0588-student-locked-card`

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

… and 79 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | holds |
| catalogue | 1 finding (1 on production too) | holds | holds |
| live | 1 finding (1 on production too) | holds | holds |
| time | 1 finding (1 on production too) | holds | holds |

### Informing (59; 59 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `realtime` | `reader-auth:rule-0592-stroke-saved/websocket` | reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 6 data frame(s) sent); readers must be publish-only (production too) | no date set | unclaimed |
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 173 → 176 immutable requests (JS 142 → 145, CSS 31 → 31), 1.6 MB → 1.6 MB; 3 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 526 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 538 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 1160 → 1183 immutable requests (JS 987 → 1010, CSS 173 → 173), 12.7 MB → 12.7 MB; 13 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 125 immutable requests (JS 99 → 103, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live-auth` | live-auth: the asset graph changed: 179 → 182 immutable requests (JS 149 → 152, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `time-auth` | time-auth: the asset graph changed: 269 → 269 immutable requests (JS 235 → 235, CSS 34 → 34), 5.1 MB → 5.0 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET {{course}}/tutors.json` | replay:talk-01: GET {{course}}/tutors.json requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 41× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET {{course}}/tutors.json` | replay:note-01: request no longer made on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-01: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-01: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:note-01 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-02 GET {{course}}/tutors.json` | replay:note-02: GET {{course}}/tutors.json requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/assets/1.{{hash}}.css` | replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 39× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET {{course}}/tutors.json` | replay:missing-topic: request no longer made on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/assets/1.{{hash}}.css` | replay:missing-topic: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/nodes/1.{{hash}}.js` | replay:missing-topic: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100` | replay:missing-topic: request no longer made on b: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
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
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/strict-transport-security` | catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/content-security-policy` | catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `live/strict-transport-security` | live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `live/content-security-policy` | live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/strict-transport-security` | reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/content-security-policy` | reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `time/strict-transport-security` | time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `time/content-security-policy` | time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |

### Claimed differences (32)

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

4 claim(s) cover 32 failing hunk(s): 8 hunk(s) per claim, at most 19 under one claim (flagged above 10).

| artefact | scope | hunks | flag |
|---|---|---|---|
| `network` | `GET /_app/immutable/chunks/\{\{hash\}\}.js` | 19 | covers more than 10 hunks |

A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 311.4 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 100 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 270.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 100 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 271.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 100 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 275.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 100 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-26T06:38:44Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.49 ms | 2.8 ms |
| b | 600 | 0 | 0 | 1.45 ms | 2.88 ms |

<details><summary>Informational (137)</summary>

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
- `realtime` reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 6 data frame(s) sent); readers must be publish-only (production too)
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.14 / b 0.27 per reader page (broadcasts a 18 / b 0, socket data frames a 7 / b 6, over 22 page view(s))
- `vulns` reader: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-xjj6-f33q-929c (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-xjj6-f33q-929c (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` live: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` live: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-xjj6-f33q-929c (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` time: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` time: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-xjj6-f33q-929c (High) is present on a and gone on b (fixed)
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
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `asset-graph` reader: the asset graph changed: 173 → 176 immutable requests (JS 142 → 145, CSS 31 → 31), 1.6 MB → 1.6 MB; 3 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 526 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 538 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 1160 → 1183 immutable requests (JS 987 → 1010, CSS 173 → 173), 12.7 MB → 12.7 MB; 13 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 125 immutable requests (JS 99 → 103, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `asset-graph` live-auth: the asset graph changed: 179 → 182 immutable requests (JS 149 → 152, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn
- `asset-graph` time-auth: the asset graph changed: 269 → 269 immutable requests (JS 235 → 235, CSS 34 → 34), 5.1 MB → 5.0 MB; 0 network and 0 headers difference(s) are this churn
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b
- `replay` replay:talk-01: GET {{course}}/tutors.json requested 1× on a, 2× on b
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 41× on b
- `replay` replay:note-01: request no longer made on b: GET {{course}}/tutors.json
- `replay` replay:note-01: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:note-01: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:note-01: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-02: GET {{course}}/tutors.json requested 1× on a, 2× on b
- `replay` replay:note-02: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b
- `replay` replay:note-02: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b
- `replay` replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 39× on b
- `replay` replay:missing-topic: request no longer made on b: GET {{course}}/tutors.json
- `replay` replay:missing-topic: request no longer made on b: GET /_app/immutable/assets/1.{{hash}}.css
- `replay` replay:missing-topic: request no longer made on b: GET /_app/immutable/nodes/1.{{hash}}.js
- `replay` replay:missing-topic: request no longer made on b: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100
- `slo` reader-availability: 100.0% of 62 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-availability: 100.0% of 600 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-latency: 100.0% of 62 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` reader-latency: 100.0% of 600 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency-tail: 100.0% of 62 reader requests under 2.5s on b (its /metrics across the journeys), objective 99.0%: holds
- `slo` reader-latency-tail: 100.0% of 600 reader requests under 2.5s on b (the k6 load leg), objective 99.0%: holds
- `secrets-in-response` reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
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
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `headers-policy` catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)

</details>

<sub>harness 1.57.1 (b2c7295c4a4a, contract 1.57.0) · 2026-10-27T02:29:51.926Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×272, request-id×272, etag×272, metrics-process×599, metrics-timing-histograms×22, third-party-requests×6816, persistence-stub-requests×2430, oauth-callback-state×110, media-range-status×43, course-media-http2-reset×1, hashed-assets×20292, footer-tutors-version×838, transport-length×272, transport-connection×272, transport-keepalive×272</sub>


</details>
