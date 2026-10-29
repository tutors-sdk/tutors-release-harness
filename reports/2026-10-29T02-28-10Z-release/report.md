## Release gate: sha-0aeb178 beside 17.0.0

**Gate: FAIL**

#### New since the last forecast

**2 new, 2 gone** in the unclaimed set since the forecast of 2026-10-28T10:32:38.087Z (`sha-d350404`), beside the same baseline `17.0.0`. By artefact: console +0 −2 · dom +1 −0 · screenshot +1 −0. The previous forecast was judged by harness 1.59.0, this one by 1.59.1: a harness change can move differences too.

| artefact | scope | what |
| --- | --- | --- |
| dom | catalogue:home | catalogue:home: semantic DOM differs (+9 −1 lines at line 29) |
| screenshot | catalogue:home | catalogue:home: 0.82% of pixels differ in 950×266 at (289, 197) (threshold 0.10%) |

Gone since then: console `live-auth:rule-0589-courses`: live-auth:rule-0589-courses: new console message on b; console `live-auth:rule-0589-courses`: live-auth:rule-0589-courses: new console message on b.

#### Causes and the PRs behind them

30 causes, 30 with a PR named. Merged since the forecast of `sha-d350404`: [#553](https://github.com/tutors-sdk/tutors-mono-repo/pull/553), [#554](https://github.com/tutors-sdk/tutors-mono-repo/pull/554), [#552](https://github.com/tutors-sdk/tutors-mono-repo/pull/552), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490), [#492](https://github.com/tutors-sdk/tutors-mono-repo/pull/492), [#530](https://github.com/tutors-sdk/tutors-mono-repo/pull/530), [#531](https://github.com/tutors-sdk/tutors-mono-repo/pull/531). No cause is new since then. Each is matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| dom: semantic DOM differs (+# −# lines at line #) | 51 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (55 files, 29 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (29 files, 18 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct) and 28 more |
| console: new console message on b | 50 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (54 files, 28 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (25 files, 14 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct) and 28 more |
| focus: keyboard order changed (# stops on a, # on b) | 41 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (55 files, 29 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (29 files, 18 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct) and 28 more |
| network: new request on b: POST /api/analytics | 20 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (19 files, 5 direct) and 28 more |
| sbom: package bumped | 20 | [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (5 files, 4 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (9 files, 2 direct), [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct) and 15 more |
| logs: log field gone on b | 16 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (16 files, 9 direct), [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (34 files, 8 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (15 files, 4 direct) and 26 more |
| network: new request on b: GET /api/me | 13 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (19 files, 5 direct) and 28 more |
| network: new request on b: GET /api/profile | 13 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (19 files, 5 direct) and 28 more |
| network: new request on b: PUT /api/me | 13 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (19 files, 5 direct) and 28 more |
| persistence: RPC record_page_view — # row(s) on a, # on b | 12 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| network: new request on b: POST /api/courses/visit | 11 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (19 files, 5 direct) and 28 more |
| network: new request on b: PUT /api/profile | 11 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (19 files, 5 direct) and 28 more |
| persistence: POST app_errors — # row(s) on a, # on b | 9 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| sbom: package added | 9 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (9 files, 1 direct), [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (7 files, 1 direct) and 15 more |
| sbom: package removed | 9 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (4 files, 2 direct), [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (5 files, 1 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (2 files, 1 direct) and 15 more |
| network: new request on b: POST /api/presence | 8 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (21 files, 10 direct), [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) (19 files, 5 direct) and 28 more |
| network: new request on b: GET /api/time/harness-rules | 7 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (16 files, 9 direct), [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (34 files, 8 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (15 files, 4 direct) and 26 more |
| screenshot: #% of pixels differ in #×# at (#, #) (threshold #%) | 5 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (55 files, 29 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (25 files, 14 direct), [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (21 files, 14 direct) and 28 more |
| image-manifest: built FROM a different base image (lowest layer e#fce → #b#de#) | 4 | [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) (2 files), [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) (1 file), [#541](https://github.com/tutors-sdk/tutors-mono-repo/pull/541) (1 file) |
| logs: new log field on b | 2 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| metrics: new series on b | 2 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (16 files, 9 direct), [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (34 files, 8 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (15 files, 4 direct) and 26 more |
| network: new request on b: PUT /api/courses/harness-rules/locks | 2 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| logs: info-level lines | 1 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| logs: request-id propagation fell from #% to #% | 1 | [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) (16 files, 9 direct), [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (34 files, 8 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (15 files, 4 direct) and 26 more |
| logs: warn-level lines | 1 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| network: new request on b: GET /api/whiteboard?courseId=harness-rules&route=%#Fwhiteboard%#Fharness-rules%#Funit-#%#Ftopic-#%#Fwhiteboard-#&shared=false | 1 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| network: new request on b: PATCH /api/me | 1 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| network: new request on b: PUT /api/whiteboard | 1 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| persistence: POST tutors-connect-courses — # row(s) on a, # on b | 1 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |
| persistence: POST tutors-connect-profiles — # row(s) on a, # on b | 1 | [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) (46 files, 20 direct), [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) (17 files, 6 direct), [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) (13 files, 5 direct) and 28 more |

**No RCS: Gate FAIL. The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.**

#### Claims owed (30)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 336, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # dom: semantic DOM differs (+# −# lines at line #): covers its 51 differences. Name the Rule that intends it, or fix it.
  - artefact: "dom"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "semantic DOM differs (+# −# lines at line #): 51 differences (reader, catalogue, live, time; 41 pages); likely #327, #517, #519"
  # console: new console message on b: covers its 50 differences. Name the Rule that intends it, or fix it.
  - artefact: "console"
    scope: "{live-auth:rule-0589-courses,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-calendar-assessments,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab}"
    rule: "????"
    reason: "new console message on b: 50 differences (reader, live, time; 22 pages); likely #327, #517, #519"
  # focus: keyboard order changed (# stops on a, # on b): covers its 41 differences. Name the Rule that intends it, or fix it.
  - artefact: "focus"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "keyboard order changed (# stops on a, # on b): 41 differences (reader, catalogue, live, time; 41 pages); likely #327, #517, #519"
  # network: new request on b: POST /api/analytics: covers its 20 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "POST /api/analytics"
    rule: "????"
    reason: "new request on b: POST /api/analytics: 20 differences (reader, live; 20 pages); likely #327, #517, #520"
  # sbom: package bumped: covers its 20 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "*/{dompurify,entities,node,tzdata,undici}"
    rule: "????"
    reason: "package bumped: 20 differences (reader, catalogue, live, time; 5 packages); likely #483, #490, #504"
  # logs: log field gone on b: covers its 16 differences. Name the Rule that intends it, or fix it.
  - artefact: "logs"
    scope: "time/{app,duration_ms,environment,event,hostname,level,loadError,message,method,path,pid,requestId,route,slow,status,timestamp}"
    rule: "????"
    reason: "log field gone on b: 16 differences (time; 16 names); likely #519, #327, #517"
  # network: new request on b: GET /api/me: covers its 13 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /api/me"
    rule: "????"
    reason: "new request on b: GET /api/me: 13 differences (reader, live; 13 pages); likely #327, #517, #520"
  # network: new request on b: GET /api/profile: covers its 13 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /api/profile"
    rule: "????"
    reason: "new request on b: GET /api/profile: 13 differences (reader, live; 13 pages); likely #327, #517, #520"
  # network: new request on b: PUT /api/me: covers its 13 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "PUT /api/me"
    rule: "????"
    reason: "new request on b: PUT /api/me: 13 differences (reader, live; 13 pages); likely #327, #517, #520"
  # persistence: RPC record_page_view — # row(s) on a, # on b: covers its 12 differences. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "*/record_page_view"
    rule: "????"
    reason: "RPC record_page_view — # row(s) on a, # on b: 12 differences; likely #327, #517, #490"
  # network: new request on b: POST /api/courses/visit: covers its 11 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "POST /api/courses/visit"
    rule: "????"
    reason: "new request on b: POST /api/courses/visit: 11 differences (reader, live; 11 pages); likely #327, #517, #520"
  # network: new request on b: PUT /api/profile: covers its 11 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "PUT /api/profile"
    rule: "????"
    reason: "new request on b: PUT /api/profile: 11 differences (reader, live; 11 pages); likely #327, #517, #520"
  # persistence: POST app_errors — # row(s) on a, # on b: covers its 9 differences. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "*/app_errors"
    rule: "????"
    reason: "POST app_errors — # row(s) on a, # on b: 9 differences; likely #327, #517, #490"
  # sbom: package added: covers its 9 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "reader/{@supabase/auth-js,@supabase/functions-js,@supabase/phoenix,@supabase/postgrest-js,@supabase/realtime-js,@supabase/storage-js,@supabase/supabase-js,iceberg-js,tslib}"
    rule: "????"
    reason: "package added: 9 differences (reader; 9 packages); likely #504, #490, #327"
  # sbom: package removed: covers its 9 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "time/{@supabase/auth-js,@supabase/functions-js,@supabase/phoenix,@supabase/postgrest-js,@supabase/realtime-js,@supabase/storage-js,@supabase/supabase-js,iceberg-js,tslib}"
    rule: "????"
    reason: "package removed: 9 differences (time; 9 packages); likely #504, #483, #519"
  # network: new request on b: POST /api/presence: covers its 8 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "POST /api/presence"
    rule: "????"
    reason: "new request on b: POST /api/presence: 8 differences (reader, live; 8 pages); likely #327, #517, #520"
  # network: new request on b: GET /api/time/harness-rules: covers its 7 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /api/time/harness-rules"
    rule: "????"
    reason: "new request on b: GET /api/time/harness-rules: 7 differences (time; 7 pages); likely #519, #327, #517"
  # screenshot: #% of pixels differ in #×# at (#, #) (threshold #%): covers its 5 differences. Name the Rule that intends it, or fix it.
  - artefact: "screenshot"
    scope: "{catalogue:home,reader-auth:rule-0584-quiz-results,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-student}"
    rule: "????"
    reason: "#% of pixels differ in #×# at (#, #) (threshold #%): 5 differences (reader, catalogue, time; 5 pages); likely #327, #517, #519"
  # image-manifest: built FROM a different base image (lowest layer e#fce → #b#de#): covers its 4 differences. Name the Rule that intends it, or fix it.
  - artefact: "image-manifest"
    scope: "*/base"
    rule: "????"
    reason: "built FROM a different base image (lowest layer e#fce → #b#de#): 4 differences (reader, catalogue, live, time); likely #504, #501, #541"
  # logs: new log field on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "logs"
    scope: "reader-auth/{courseId,role}"
    rule: "????"
    reason: "new log field on b: 2 differences (reader; 2 names); likely #327, #517, #490"
  # metrics: new series on b: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "metrics"
    scope: "time/http_{request_duration_seconds_count,requests_total}"
    rule: "????"
    reason: "new series on b: 2 differences (time; 2 names); likely #519, #327, #517"
  # network: new request on b: PUT /api/courses/harness-rules/locks: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "PUT /api/courses/harness-rules/locks"
    rule: "????"
    reason: "new request on b: PUT /api/courses/harness-rules/locks: 2 differences (reader; 2 pages); likely #327, #517, #490"
  # logs: info-level lines: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "logs"
    scope: "reader-auth/info"
    rule: "????"
    reason: "info-level lines: 1 difference (reader; 1 name); likely #327, #517, #490"
  # logs: request-id propagation fell from #% to #%: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "logs"
    scope: "time/request-id"
    rule: "????"
    reason: "request-id propagation fell from #% to #%: 1 difference (time); likely #519, #327, #517"
  # logs: warn-level lines: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "logs"
    scope: "reader-auth/warn"
    rule: "????"
    reason: "warn-level lines: 1 difference (reader; 1 name); likely #327, #517, #490"
  # network: new request on b: GET /api/whiteboard?courseId=harness-rules&route=%#Fwhiteboard%#Fharness-rules%#Funit-#%#Ftopic-#%#Fwhiteboard-#&shared=false: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /api/whiteboard\\?courseId=harness-rules&route=%2Fwhiteboard%2Fharness-rules%2Funit-1%2Ftopic-01%2Fwhiteboard-01&shared=false"
    rule: "????"
    reason: "new request on b: GET /api/whiteboard?courseId=harness-rules&route=%#Fwhiteboard%#Fharness-rules%#Funit-#%#Ftopic-#%#Fwhiteboard-#&shared=false: 1 difference (reader; 1 page); likely #327, #517, #490"
  # network: new request on b: PATCH /api/me: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "PATCH /api/me"
    rule: "????"
    reason: "new request on b: PATCH /api/me: 1 difference (reader; 1 page); likely #327, #517, #490"
  # network: new request on b: PUT /api/whiteboard: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "PUT /api/whiteboard"
    rule: "????"
    reason: "new request on b: PUT /api/whiteboard: 1 difference (reader; 1 page); likely #327, #517, #490"
  # persistence: POST tutors-connect-courses — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0586-private-course/tutors-connect-courses"
    rule: "????"
    reason: "POST tutors-connect-courses — # row(s) on a, # on b: 1 difference; likely #327, #517, #490"
  # persistence: POST tutors-connect-profiles — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0586-private-course/tutors-connect-profiles"
    rule: "????"
    reason: "POST tutors-connect-profiles — # row(s) on a, # on b: 1 difference; likely #327, #517, #490"
```

7 of 8 dimensions measured (weight 95 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** | **breached** | −20 unclaimed: dom /: reader:home: semantic DOM differs (+1 −1 lines at line 10); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+1 −1 lines at line 9); −20 unclaimed: dom /topic/localhost:8080/unit-1/topic-01: reader:topic: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01: reader:lab-step: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-01: reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 8) (and 331 more like it, not counted again: report.html#differences); −15 stale claim network reader:*: matched nothing (Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login); −15 stale claim persistence reader:*: matched nothing (Rule 0072: student rows are written by the reader's server under the session's login, not by the browser); −15 stale claim dom reader:whiteboard*: matched nothing (Rule 0068: an anonymous visitor's whiteboard edits are not saved, and the status line says so); −15 stale claim network time:*: matched nothing (CHANGELOG Unreleased (Time): the dashboard loads time data from the reader); −15 stale claim dom time:*: matched nothing (CHANGELOG Unreleased (Time): signed-out viewers see a sign-in link); −15 stale claim screenshot time:*: matched nothing (CHANGELOG Unreleased (Time): signed-out viewers see a sign-in link); −10 stale claim network catalogue:*: matched nothing (Rule 0070: the catalogue shows the number of students without reading any student's profile); −5 claim network GET /_app/immutable/chunks/\{\{hash\}\}.js covers 26 hunks at once (not narrow) |
| Noise health | 15 | **80** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask chromium-compute-pressure-policy fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **90** |  | −10 rule-0590-time-calendar: p=0.144, not above 0.20 |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | **0** | **breached** | −30 mutation score 67.12% on @tutors/course, below 80%; −30 mutation score 72.73% on @tutors/i18n, below 80%; −30 mutation score 75.93% on @tutors/metrics, below 80%; −30 mutation score 70.08% on @tutors/rbac, below 80%; −30 mutation score 42.45% on @tutors/tutors-create, below 80%; −30 mutation score 75% on @tutors/ui-components, below 80%; −30 mutation score 55.11% on @tutors/ui-navigators, below 80%; −30 mutation score 1.43% on @tutors/ui-primitives, below 80% |
| Requirements traceability | 10 | **0** | **breached** | floor 32 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry); each costs change risk its points; −20 changelog entry "#485 fix(deps): clear the three advisories failing the dependency audit" has no EARS file; −20 changelog entry "#504 fix(nightly): make the three red Nightly jobs pass for real" has no EARS file; −10 changelog entry "#504 fix(nightly): make the three red Nightly jobs pass for real" has no claim; −10 changelog entry "#505 fix(a11y): button names contain their visible text" has no claim; −20 changelog entry "#500 fix(deploy): immutable Cache-Control on /_app/immutable/* for Netlify" has no EARS file; −10 changelog entry "#501 feat(image): declare a HEALTHCHECK and expose request SLIs from start (image-hardening, image-manifest, metrics)" has no claim; −10 changelog entry "#514 feat(reader): export enrollment drafts from course visitors (dom, network, headers)" has no claim; −10 changelog entry "#506 fix(reader): link a local course's LLM downloads over http (dom)" has no claim; −10 changelog entry "#510 fix(reader): keep a private course out of Recently accessed for someone it turns away (found by the release harness)" has no claim; −10 changelog entry "#507 fix(time): reuse one Supabase client per url and key (console, network)" has no claim; −10 changelog entry "#491 feat(dev): EARS dashboard, one page for every Rule and the format" has no claim; −10 changelog entry "#511 fix(time): key labs by their full path, found by the release harness (dom)" has no claim; −10 changelog entry "#509 fix(time): lay heat maps out the same on every load (screenshot)" has no claim; −10 changelog entry "#518 fix(reader): [bug] check the educator on the server before a content lock changes (persistence)" has no claim; −10 changelog entry "#519 fix(reader): [bug] make the Moodle sync educator-only in the reader (persistence)" has no claim; −20 changelog entry "#547 fix(deps): patch dompurify, undici, markdown-it, vite and happy-dom advisories (sbom)" has no EARS file; −10 changelog entry "#547 fix(deps): patch dompurify, undici, markdown-it, vite and happy-dom advisories (sbom)" has no claim; −10 changelog entry "#548 feat(quiz): fenced code blocks in quiz questions and options (dom)" has no claim; −20 changelog entry "#544 fix(ci): turn the Nightly green again (sbom)" has no EARS file; −10 changelog entry "#544 fix(ci): turn the Nightly green again (sbom)" has no claim; −10 changelog entry "#327 feat(data-api): make the browser-to-data seam explicit and enforce it (logs, sbom)" has no claim; −20 changelog entry "#515 fix(logger): stop logging /metrics scrapes and keep every server line JSON (logs)" has no EARS file; −10 changelog entry "#515 fix(logger): stop logging /metrics scrapes and keep every server line JSON (logs)" has no claim; −10 changelog entry "#552 feat(catalogue): sort and search the catalogue (dom, screenshot)" has no claim; −10 changelog entry "#530 fix(reader): keep one analytics timer and stop it when the course reader unmounts (network, persistence)" has no claim |
| Change risk | 15 | **0** |  | −10 PR #476 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #481 changed Reader, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #484 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #487 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #504 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2; −10 PR #505 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #501 changed Infrastructure, Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #502 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #514 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #514 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #506 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #508 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #510 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #510 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #507 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #511 changed Time, Reader, Shared Packages, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #509 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #518 changed Reader, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #519 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −5 time churn 933 lines, above 2× its median of 14 over the last 6 releases; PR #519 is the largest part (533 lines); −10 PR #519 changed Reader, Time, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #520 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #520 changed Reader, Live, Catalogue, Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #516 changed Live, Catalogue, Time, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #425 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #548 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #489 touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases); −10 PR #489 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #517 touches 3 hotspots apps/reader/src/hooks.server.ts (3 of the last 6 releases), packages/svelte/community/src/utils/error-transport.ts (3 of the last 6 releases), apps/time/src/hooks.server.ts (3 of the last 6 releases); −10 PR #517 changed 21 production lines in apps/catalogue with 0 test lines (0.00); 21 production lines in apps/live with 0 test lines (0.00); 36 production lines in apps/reader with 0 test lines (0.00); 22 production lines in apps/time with 0 test lines (0.00); 16 production lines in packages/svelte/community with 0 test lines (0.00); 16 production lines in packages/svelte/identity-sveltekit with 0 test lines (0.00); 23 production lines in packages/svelte/utils with 0 test lines (0.00): below 0.2; −5 catalogue churn 45 lines, above 2× its median of 7.5 over the last 6 releases; PR #517 is the largest part (21 lines); −5 live churn 35 lines, above 2× its median of 3.5 over the last 6 releases; PR #517 is the largest part (21 lines); −10 PR #517 changed Reader, Live, Catalogue, Time, Infrastructure but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #544 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #541 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −10 PR #542 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #327 touches hotspot packages/svelte/ui-components/src/learning-objects/content/whiteboard/WhiteboardViewer.svelte (3 of the last 6 releases); −5 reader churn 2077 lines, above 2× its median of 101.5 over the last 6 releases; PR #327 is the largest part (1011 lines); −3 PR #328 touches hotspot packages/svelte/ui-components/src/learning-objects/content/whiteboard/WhiteboardViewer.svelte (3 of the last 6 releases); −3 PR #515 touches hotspot packages/svelte/utils/logger/src/request-logger.ts (3 of the last 6 releases); −10 PR #515 changed Shared Packages, Reader, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #552 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −3 PR #490 touches hotspot packages/svelte/course/src/course/services/lo-tree.ts (3 of the last 6 releases); −10 PR #490 changed Reader, Catalogue, Time, Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it; −3 PR #530 touches 2 hotspots packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases), apps/reader/src/routes/(course-reader)/+layout.svelte (3 of the last 6 releases); −5 the release moves happy-dom 20.14.0 → 21.0.4 in the root: a major bump, ground the journeys may not cover |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 0 (100 − 407), v17.0.0..0aeb178cec131fffbdb864217b19af3945d5a18d: 36 of 48 PRs carry a finding, and 1 finding(s) no PR carries.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#517](https://github.com/tutors-sdk/tutors-mono-repo/pull/517) | docs(comments): header comments on the production request path | 166 | 32 | 3 | 0.00 | yes |  | **−33** | −3 [PR #517 touches 3 hotspots apps/reader/src/hooks.server.ts (3 of the last 6 releases), packages/svelte/community/src/utils/error-transport.ts (3 of the last 6 releases), apps/time/src/hooks.server.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-d6d421ccc99e28b6214f7df730798547515a524700fe6758ff2aaa6b7cdd8856); −10 [PR #517 changed 21 production lines in apps/catalogue with 0 test lines (0.00); 21 production lines in apps/live with 0 test lines (0.00); 36 production lines in apps/reader with 0 test lines (0.00); 22 production lines in apps/time with 0 test lines (0.00); 16 production lines in packages/svelte/community with 0 test lines (0.00); 16 production lines in packages/svelte/identity-sveltekit with 0 test lines (0.00); 23 production lines in packages/svelte/utils with 0 test lines (0.00): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-d6d421ccc99e28b6214f7df730798547515a524700fe6758ff2aaa6b7cdd8856); −5 [catalogue churn 45 lines, above 2× its median of 7.5 over the last 6 releases; PR #517 is the largest part (21 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-681a6274b9d04d85e52f7f862f2dc5bcff947154b547367bdf9eaf0e3ab2b849); −5 [live churn 35 lines, above 2× its median of 3.5 over the last 6 releases; PR #517 is the largest part (21 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-e53bd4734255e1d22ae9cadb161045e24b80541b0a23ffa3dfd06daddf4af5ac); −10 [PR #517 changed Reader, Live, Catalogue, Time, Infrastructure but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/517/files#diff-d6a0a4bcd386b6be385bc1065b14c63cdcb15c76c5de9b6842895eb698fad6e3) |
| [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505) | fix(a11y): button names contain their visible text | 47 | 15 | 4 | 1.76 | yes |  | **−23** | −3 [PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-d4a40094af72b0eb12eea04ebee4e682bfc581553326bf472d1c2f849c7c623b); −10 [PR #505 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-4be7739a1047b396bc6d3e9502bee98cfdd9bde50bfcb576e9df02edfd063dd3) |
| [#519](https://github.com/tutors-sdk/tutors-mono-repo/pull/519) | fix(reader): [bug] make the Moodle sync educator-only in the reader (persistence) | 1438 | 40 | 4 | 0.19 | yes |  | **−18** | −3 [PR #519 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −5 [time churn 933 lines, above 2× its median of 14 over the last 6 releases; PR #519 is the largest part (533 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-8b7f790b5271e1164ee6cf94a7cfe8769a79823cd718721e7a17e34b5ca22800); −10 [PR #519 changed Reader, Time, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/519/files#diff-40c77f2136c77d652b67d1cdf92b44089e2e0ebfbfb2cff443a6ff2119d6457f) |
| [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) | Route every Realtime channel through a budgeted port | 1349 | 41 | 1 | 1.46 | yes |  | **−13** | −3 [PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#514](https://github.com/tutors-sdk/tutors-mono-repo/pull/514) | feat(reader): export enrollment drafts from course visitors (dom, network, headers) | 651 | 15 | 4 | 2.55 | yes |  | **−13** | −3 [PR #514 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/514/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #514 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/514/files#diff-13bc0a33f184cb8d792a48300081d13e799b31f2a6adebb9b06a5609f0068def) |
| [#510](https://github.com/tutors-sdk/tutors-mono-repo/pull/510) | fix(reader): keep a private course out of Recently accessed for someone it turns away (found by the release harness) | 86 | 3 | 1 | 1.87 | yes |  | **−13** | −3 [PR #510 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/510/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #510 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/510/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b) |
| [#520](https://github.com/tutors-sdk/tutors-mono-repo/pull/520) | test: signed-in, resilience and authorisation journeys, message contracts, migrations on Postgres, mutation on PRs (dom, network) | 5082 | 99 | 4 | 30.01 | yes |  | **−13** | −3 [PR #520 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/520/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #520 changed Reader, Live, Catalogue, Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/520/files#diff-98f22a8fb8b7ad0d757eac9bc6007fc2108d28a4346433c4ccddce39c1ec079f) |
| [#489](https://github.com/tutors-sdk/tutors-mono-repo/pull/489) | Close the prose and code gaps from #488 that main can fix today | 182 | 16 | 1 | 0.50 | yes |  | **−13** | −3 [PR #489 touches hotspot packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/489/files#diff-3805a328d2572205ef2f52b7b2b8eb8164c3c1dc10b3c867d195122994548757); −10 [PR #489 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/489/files#diff-8af0bde393b8123c01d17adc2011a612037eadcac15e56cf825b51b5b3c9654b) |
| [#515](https://github.com/tutors-sdk/tutors-mono-repo/pull/515) | fix(logger): stop logging /metrics scrapes and keep every server line JSON (logs) | 58 | 6 | 1 | 2.85 | yes |  | **−13** | −3 [PR #515 touches hotspot packages/svelte/utils/logger/src/request-logger.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/515/files#diff-056fa8b9ee956a1c1e1a40989edcd3bbcf0e8c4db55f12b6ca848b246953c63e); −10 [PR #515 changed Shared Packages, Reader, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/515/files#diff-0db16276644fc4f21eae05d761a230f6438feca8b7c0a92427c9d3b3ea85726a) |
| [#490](https://github.com/tutors-sdk/tutors-mono-repo/pull/490) | Empty the knip baseline: remove unused dependencies, files and exports (sbom) | 2859 | 40 | 1 | 8.60 | yes |  | **−13** | −3 [PR #490 touches hotspot packages/svelte/course/src/course/services/lo-tree.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/490/files#diff-6cfa06c80cbc78eb30020d8f766b7af03b1b276f55cc879f666d9822779b89cd); −10 [PR #490 changed Reader, Catalogue, Time, Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/490/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) | Give each whiteboard room a Realtime budget | 377 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #476 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/476/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#480](https://github.com/tutors-sdk/tutors-mono-repo/pull/480) | Tutors Time: read only the chosen days of a course's calendar | 92 | 6 | 0 | 3.30 | yes |  | **−10** | −10 [PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/480/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) | Tutors Live: publish from the reader's server within a daily Realtime budget | 1421 | 23 | 0 | 3.38 | yes |  | **−10** | −10 [PR #481 changed Reader, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/481/files#diff-e4fcc76d91071866c7d54b16b300e500d67b42190747baa90741fe8de58a8179) |
| [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) | Release 17.0.0 to main and pin production to it | 424 | 13 | 0 | no production lines | yes |  | **−10** | −10 [PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/483/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#484](https://github.com/tutors-sdk/tutors-mono-repo/pull/484) | ci(deploy): open the pin pull request when a release tag's images are published | 247 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #484 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/484/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#487](https://github.com/tutors-sdk/tutors-mono-repo/pull/487) | fix(community): show an empty catalogue without Supabase instead of logging errors | 67 | 3 | 0 | 3.47 | yes |  | **−10** | −10 [PR #487 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/487/files#diff-13d8ab5e67e09ca92971e77ee1fcbb71b39dd5a018144bf33a3bbabd5b3da020) |
| [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) | fix(nightly): make the three red Nightly jobs pass for real | 357 | 18 | 0 | no production lines | yes |  | **−10** | −10 [PR #504 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/504/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500) | fix(deploy): immutable Cache-Control on /_app/immutable/* for Netlify | 30 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/500/files#diff-c5f7478f9ea43955917de963b542918dbd3c74bd2e710935fd2606ee0ce67ecd) |
| [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) | feat(image): declare a HEALTHCHECK and expose request SLIs from start (image-hardening, image-manifest, metrics) | 256 | 7 | 0 | 11.68 | yes |  | **−10** | −10 [PR #501 changed Infrastructure, Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/501/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#502](https://github.com/tutors-sdk/tutors-mono-repo/pull/502) | ci(image): attest SLSA v1 build provenance to every published image (build-provenance) | 205 | 3 | 0 | no production lines | yes |  | **−10** | −10 [PR #502 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/502/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#506](https://github.com/tutors-sdk/tutors-mono-repo/pull/506) | fix(reader): link a local course's LLM downloads over http (dom) | 72 | 4 | 0 | 1.18 | yes |  | **−10** | −10 [PR #506 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/506/files#diff-7eefe5446d7d2d9f6a5a3758cefc8ac0ac9a1927189261d6f36b902293bf0588) |
| [#508](https://github.com/tutors-sdk/tutors-mono-repo/pull/508) | fix(time): read the course PIN from where the course is served (found by the release harness) | 91 | 3 | 0 | 3.55 | yes |  | **−10** | −10 [PR #508 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/508/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#507](https://github.com/tutors-sdk/tutors-mono-repo/pull/507) | fix(time): reuse one Supabase client per url and key (console, network) | 84 | 3 | 0 | 8.33 | yes |  | **−10** | −10 [PR #507 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/507/files#diff-5b11ac08ac0f8f58902608d1c44c6ee5c2bc78063e10e0e32fa3e757c51ccaa7) |
| [#511](https://github.com/tutors-sdk/tutors-mono-repo/pull/511) | fix(time): key labs by their full path, found by the release harness (dom) | 230 | 14 | 0 | 2.14 | yes |  | **−10** | −10 [PR #511 changed Time, Reader, Shared Packages, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/511/files#diff-89be349f0f1b3e21c15df9cf0ed382f7aefd1707b11ba8e0ca717547553a53fb) |
| [#509](https://github.com/tutors-sdk/tutors-mono-repo/pull/509) | fix(time): lay heat maps out the same on every load (screenshot) | 84 | 4 | 0 | 5.00 | yes |  | **−10** | −10 [PR #509 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/509/files#diff-d585d9ff35154e35a9681cefa655ae71605ca24958d3f758d9d5e7fea85751c2) |
| [#518](https://github.com/tutors-sdk/tutors-mono-repo/pull/518) | fix(reader): [bug] check the educator on the server before a content lock changes (persistence) | 484 | 21 | 0 | 0.92 | yes |  | **−10** | −10 [PR #518 changed Reader, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/518/files#diff-97f47dfbbef70b6e2647599895724dd6f2ea689bb666f485238bff0bfb08cb8d) |
| [#516](https://github.com/tutors-sdk/tutors-mono-repo/pull/516) | docs: bring docs in line with main after SvelteKit 3 | 94 | 12 | 0 | no production lines | yes |  | **−10** | −10 [PR #516 changed Live, Catalogue, Time, Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/516/files#diff-9c75df02d09573d64deea0a822ba5807d540ccad75393b98b2feeae95f98f449) |
| [#425](https://github.com/tutors-sdk/tutors-mono-repo/pull/425) | fix(gen): leave folders of no kind out of tutors.json at any depth | 101 | 11 | 0 | 6.14 | yes |  | **−10** | −10 [PR #425 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/425/files#diff-ec67d57817841e44513dccfa91d1cb28eceb4c1ba442961cdb893247c05ff218) |
| [#548](https://github.com/tutors-sdk/tutors-mono-repo/pull/548) | feat(quiz): fenced code blocks in quiz questions and options (dom) | 774 | 20 | 0 | 1.91 | yes |  | **−10** | −10 [PR #548 changed Reader, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/548/files#diff-22d70ca7e354eea60e156d8536e28c645b1beef66a935ecd4e9770fa168f8364) |
| [#544](https://github.com/tutors-sdk/tutors-mono-repo/pull/544) | fix(ci): turn the Nightly green again (sbom) | 25 | 4 | 0 | 11.50 | yes |  | **−10** | −10 [PR #544 changed Shared Packages, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/544/files#diff-0bcef4d9c5db361fff96288f24ab1cca984e6349ac9a1c237b8742d40ce8e64d) |
| [#541](https://github.com/tutors-sdk/tutors-mono-repo/pull/541) | build(image): pin the Node base image by digest, moved by Dependabot (image-manifest) | 107 | 6 | 0 | no production lines | yes |  | **−10** | −10 [PR #541 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/541/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#542](https://github.com/tutors-sdk/tutors-mono-repo/pull/542) | ci: production hardening 0.4/1.1, pin the toolchain and time out every job (none) | 121 | 17 | 0 | no production lines | yes |  | **−10** | −10 [PR #542 changed Infrastructure, Development but no changelog entry under v0aeb178cec131fffbdb864217b19af3945d5a18d names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/542/files#diff-28802fbf11c83a2eee09623fb192785e7ca92a3f40602a517c011b947a1822d3) |
| [#327](https://github.com/tutors-sdk/tutors-mono-repo/pull/327) | feat(data-api): make the browser-to-data seam explicit and enforce it (logs, sbom) | 5720 | 140 | 1 | 0.97 | yes |  | **−8** | −3 [PR #327 touches hotspot packages/svelte/ui-components/src/learning-objects/content/whiteboard/WhiteboardViewer.svelte (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/327/files#diff-df9fd1dd4556d3b501ea96a8bfc85aeae703e79866841d36fa27aab651c128d6); −5 [reader churn 2077 lines, above 2× its median of 101.5 over the last 6 releases; PR #327 is the largest part (1011 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/327/files#diff-563197f9fa115e0d3f0f9a0f1f7b8a5eade03512f09d31538aa93f1512f13431) |
| [#328](https://github.com/tutors-sdk/tutors-mono-repo/pull/328) | fix(whiteboard): give personal rooms their own namespace and keep them off Realtime | 80 | 12 | 1 | 6.71 | yes |  | **−3** | −3 [PR #328 touches hotspot packages/svelte/ui-components/src/learning-objects/content/whiteboard/WhiteboardViewer.svelte (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/328/files#diff-df9fd1dd4556d3b501ea96a8bfc85aeae703e79866841d36fa27aab651c128d6) |
| [#552](https://github.com/tutors-sdk/tutors-mono-repo/pull/552) | feat(catalogue): sort and search the catalogue (dom, screenshot) | 467 | 16 | 4 | 1.41 | yes |  | **−3** | −3 [PR #552 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/552/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741) |
| [#530](https://github.com/tutors-sdk/tutors-mono-repo/pull/530) | fix(reader): keep one analytics timer and stop it when the course reader unmounts (network, persistence) | 362 | 8 | 2 | 14.04 | yes |  | **−3** | −3 [PR #530 touches 2 hotspots packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases), apps/reader/src/routes/(course-reader)/+layout.svelte (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/530/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b) |
| 12 more | no deductions: #485, #493, #513, #491, #512, #539, #546, #547, #553, #554, #492, #531 | 7056 | 103 |  |  |  |  | 0 |  |

No PR between the tags carries these:

- −5 the release moves happy-dom 20.14.0 → 21.0.4 in the root: a major bump, ground the journeys may not cover (pnpm-lock.yaml)

- churn: reader 2077 (median 101.5) ABOVE 2×, catalogue 45 (median 7.5) ABOVE 2×, live 35 (median 3.5) ABOVE 2×, time 933 (median 14) ABOVE 2×
- hotspots: 15 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/connect/src/services/connect.svelte.ts, packages/svelte/utils/i18n/src/messages/fr.ts, packages/svelte/utils/i18n/src/messages/es.ts, packages/svelte/utils/i18n/src/messages/de.ts, packages/svelte/utils/i18n/src/messages/it.ts, packages/svelte/ui-primitives/src/components/LoContextTreeView.svelte, apps/reader/src/hooks.server.ts, packages/svelte/community/src/utils/error-transport.ts, apps/time/src/hooks.server.ts, packages/svelte/ui-components/src/learning-objects/content/whiteboard/WhiteboardViewer.svelte, packages/svelte/utils/logger/src/request-logger.ts, packages/svelte/course/src/course/services/lo-tree.ts, apps/reader/src/routes/(course-reader)/+layout.svelte
- ownership: no file with 3+ authors
- orphans: 32 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at 0aeb178cec131fffbdb864217b19af3945d5a18d has no "### v0aeb178cec131fffbdb864217b19af3945d5a18d" entries under a product section)
- tests: apps/catalogue 200.94, apps/live 159.08, apps/reader 4.82, apps/time 3.52, packages/jsr/create 9.10, packages/jsr/gen 6.14, packages/jsr/model 12.33, packages/jsr/realtime 2.32, packages/jsr/time 16.06, packages/svelte/app-config 529.60, packages/svelte/community 6.80, packages/svelte/connect 35.73, packages/svelte/course 192.30, packages/svelte/data-api 16.71, packages/svelte/identity-sveltekit 105.35, packages/svelte/quiz 2.46, packages/svelte/realtime-supabase 19.12, packages/svelte/ui-components 23.55, packages/svelte/ui-navigators 4.92, packages/svelte/ui-primitives 85.35, packages/svelte/utils 18.72
- reviews: 48 approved, 0 not
- dependencies: happy-dom 20.14.0 → 21.0.4; 6 new direct dependencies (@electric-sql/pglite, @supabase/supabase-js, @supabase/supabase-js, @sveltejs/kit, @sveltejs/kit, …)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at 0aeb178cec131fffbdb864217b19af3945d5a18d has no "### v0aeb178cec131fffbdb864217b19af3945d5a18d" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-10-29T02:28:10.151Z — exit code **1**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-0aeb178` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-0aeb178` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-0aeb178` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-0aeb178` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:22a41cc6ca2a6083e96a231685fbbd78a78517f702a2c0dfe320718e6d8672a4` · rev `0aeb178cec13` · version `sha-0aeb178` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:d13c6f23dd2e7fab98aed9bacd5a09580b9a80a69b9a594b373e57345c717f9a` · rev `0aeb178cec13` · version `sha-0aeb178` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:f1017f8828785c23132c3844ccd79f25a54f6c81c84dd4b65e1aecda3e2e1062` · rev `0aeb178cec13` · version `sha-0aeb178` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:da096eca49980652b89a76e20ca1fcb820cdf9a05747128be3256b4afb85a5e3` · rev `0aeb178cec13` · version `sha-0aeb178` |

- 336 unclaimed diff(s)
- 7 claim(s) matched nothing and should be removed from the changelog
- A/A consulted: clean at 2026-10-29T01:54:45.032Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): 6 difference(s); 26 of this run's 375 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.
  - `dom` `replay:note-01`: replay:note-01: semantic DOM differs (+0 −62 lines at line 1)
  - `network` `GET {{course}}/tutors.json`: replay:note-01: GET {{course}}/tutors.json requested 2× on a, 1× on a2
  - `network` `GET /_app/immutable/assets/1.{{hash}}.css`: replay:note-01: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on a2
  - `network` `GET /_app/immutable/chunks/{{hash}}.js`: replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 38× on a2
  - `network` `GET /_app/immutable/nodes/1.{{hash}}.js`: replay:note-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on a2
  - `network` `GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100`: replay:note-01: request no longer made on a2: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100

### 336 unclaimed differences, 30 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `dom` semantic DOM differs (+# −# lines at line #) | 51 | reader, catalogue, live, time | 41: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `console` new console message on b | 50 | reader, live, time | 22: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0582-lab-step`, `reader-auth:rule-0582-lab-step-2`, `reader-auth:rule-0582-lab-step-back` and 16 more | reader-auth:course: new console message on b |
| `focus` keyboard order changed (# stops on a, # on b) | 41 | reader, catalogue, live, time | 41: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `network` new request on b: POST /api/analytics | 20 | reader, live | 20: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0582-lab-step`, `reader-auth:rule-0582-lab-step-2`, `reader-auth:rule-0582-lab-step-back` and 14 more | reader-auth:course: new request on b: POST /api/analytics |
| `sbom` package bumped (5 packages: `dompurify`, `entities`, `node`, `tzdata`, `undici`) | 20 | reader, catalogue, live, time | — | reader: package bumped: dompurify 3.4.16 → 3.4.17 |
| `logs` log field gone on b (16 fields: `app`, `duration_ms`, `environment`, `event`, `hostname`, `level`, `loadError`, `message` and 8 more) | 16 | time | — | time: log field gone on b: app |
| `network` new request on b: GET /api/me | 13 | reader, live | 13: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark` and 7 more | reader-auth:course: new request on b: GET /api/me |
| `network` new request on b: GET /api/profile | 13 | reader, live | 13: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark` and 7 more | reader-auth:course: new request on b: GET /api/profile |
| `network` new request on b: PUT /api/me | 13 | reader, live | 13: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark` and 7 more | reader-auth:course: new request on b: PUT /api/me |
| `persistence` RPC record_page_view — # row(s) on a, # on b | 12 | — | — | student-signs-in: RPC record_page_view — 2 row(s) on a, 0 on b |
| `network` new request on b: POST /api/courses/visit | 11 | reader, live | 11: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark` and 5 more | reader-auth:course: new request on b: POST /api/courses/visit |
| `network` new request on b: PUT /api/profile | 11 | reader, live | 11: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark` and 5 more | reader-auth:course: new request on b: PUT /api/profile |
| `persistence` POST app_errors — # row(s) on a, # on b | 9 | — | — | rule-0588-content-lock: POST app_errors — 0 row(s) on a, 2 on b |
| `sbom` package added (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | reader | — | reader: package added: @supabase/auth-js@2.117.2 |
| `sbom` package removed (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | time | — | time: package removed: @supabase/auth-js@2.117.2 |
| `network` new request on b: POST /api/presence | 8 | reader, live | 8: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0582-lab-step`, `reader-auth:rule-0582-lab-step-2`, `reader-auth:rule-0582-lab-step-back` and 2 more | reader-auth:course: new request on b: POST /api/presence |
| `network` new request on b: GET /api/time/harness-rules | 7 | time | 7: `time-auth:rule-0590-calendar-byday`, `time-auth:rule-0590-calendar-byweek`, `time-auth:rule-0590-medians`, `time-auth:rule-0591-lab-bylab`, `time-auth:rule-0591-lab-bystep`, `time-auth:rule-0591-learning-records` and 1 more | time-auth:rule-0590-medians: new request on b: GET /api/time/harness-rules |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 5 | reader, catalogue, time | 5: `catalogue:home`, `reader-auth:rule-0584-quiz-results`, `time-auth:rule-0590-medians`, `time-auth:rule-0591-lab-bylab`, `time-auth:rule-0591-student` | catalogue:home: 0.82% of pixels differ in 950×266 at (289, 197) (threshold 0.10%) |
| `image-manifest` built FROM a different base image (lowest layer e#fce → #b#de#) | 4 | reader, catalogue, live, time | — | reader: built FROM a different base image (lowest layer e58989146fce → 9b35de789337) |
| `logs` new log field on b (2 fields: `courseId`, `role`) | 2 | reader | — | reader-auth: new log field on b: courseId |
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 2 | time | — | time: new series on b: http_request_duration_seconds_count |
| `network` new request on b: PUT /api/courses/harness-rules/locks | 2 | reader | 2: `reader-auth:rule-0588-lecturer-locked`, `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/harness-rules/locks |
| `logs` info-level lines (1 field: `info`) | 1 | reader | — | reader-auth: info-level lines: 430 on a, 1145 on b |
| `logs` request-id propagation fell from #% to #% | 1 | time | — | time: request-id propagation fell from 100% to 0% |
| `logs` warn-level lines (1 field: `warn`) | 1 | reader | — | reader-auth: warn-level lines: 0 on a, 170 on b |
| `network` new request on b: GET /api/whiteboard?courseId=harness-rules&route=%#Fwhiteboard%#Fharness-rules%#Funit-#%#Ftopic-#%#Fwhiteboard-#&shared=false | 1 | reader | 1: `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: new request on b: GET /api/whiteboard?courseId=harness-rules&route=%2Fwhiteboard%2Fharness-rules%2Funit-1%2Ftopic-01%2Fwhit… |
| `network` new request on b: PATCH /api/me | 1 | reader | 1: `reader-auth:rule-0583-profile-menu` | reader-auth:rule-0583-profile-menu: new request on b: PATCH /api/me |
| `network` new request on b: PUT /api/whiteboard | 1 | reader | 1: `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: new request on b: PUT /api/whiteboard |
| `persistence` POST tutors-connect-courses — # row(s) on a, # on b | 1 | — | — | rule-0586-private-course: POST tutors-connect-courses — 2 row(s) on a, 0 on b |
| `persistence` POST tutors-connect-profiles — # row(s) on a, # on b | 1 | — | — | rule-0586-private-course: POST tutors-connect-profiles — 2 row(s) on a, 0 on b |

Moved together on the same pages, so likely one change each:

- `console`, `dom`, `focus`, `network` on 18 pages (167 differences): `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0582-lab-step`, `reader-auth:rule-0582-lab-step-2`, `reader-auth:rule-0582-lab-step-back` and 12 more
- `dom`, `focus` on 14 pages (28 differences): `live-auth:rule-0589-students`, `live:home`, `reader-auth:rule-0585-preferences-after-reload`, `reader:course`, `reader:home`, `reader:lab-step` and 8 more
- `dom`, `focus`, `network` on 4 pages (12 differences): `time-auth:rule-0590-calendar-byday`, `time-auth:rule-0590-calendar-byweek`, `time-auth:rule-0591-lab-bystep`, `time-auth:rule-0591-learning-records`
- `console`, `dom`, `focus`, `network`, `screenshot` on 3 pages (24 differences): `reader-auth:rule-0584-quiz-results`, `time-auth:rule-0590-medians`, `time-auth:rule-0591-lab-bylab`
- `console`, `network` on 1 page (8 differences): `reader-auth:rule-0587-calendar-assessments`
- `dom`, `focus`, `network`, `screenshot` on 1 page (5 differences): `time-auth:rule-0591-student`
- `dom`, `focus`, `screenshot` on 1 page (4 differences): `catalogue:home`

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0588-content-lock`: Rule 0588 (exercises 0052, 0053, 0054): 36 differences in console, dom, focus, network, persistence
- `rule-0582-signed-in-lab`: Rule 0582 (exercises 0011, 0250, 0252, 0260, 0303, 0330): 31 differences in console, dom, focus, network, persistence
- `rule-0586-private-course`: Rule 0586 (exercises 0011, 0267): 24 differences in console, dom, focus, network, persistence
- `rule-0591-time-labs`: Rule 0591 (exercises 0319): 24 differences in console, dom, focus, network, persistence, screenshot
- `rule-0584-quiz-notebook-talk`: Rule 0584 (exercises 0047, 0049, 0050): 23 differences in console, dom, focus, network, persistence, screenshot
- `rule-0585-preferences`: Rule 0585 (exercises 0037, 0038, 0039): 16 differences in console, dom, focus, network, persistence
- `rule-0589-live`: Rule 0589 (exercises 0330, 0335): 15 differences in console, dom, focus, network, persistence
- `rule-0590-time-calendar`: Rule 0590 (exercises 0319): 15 differences in console, dom, focus, network, persistence, screenshot
- `rule-0587-calendar-llm`: Rule 0587 (exercises 0042, 0284): 14 differences in console, dom, focus, network, persistence
- `rule-0592-whiteboard`: Rule 0592 (exercises 0275, 0276): 14 differences in console, dom, focus, network, persistence
- `rule-0583-presence`: Rule 0583 (exercises 0046, 0064, 0280): 13 differences in console, dom, focus, network, persistence

### Unclaimed differences (336)

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
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+9 −1 lines at line 29) |
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
| `screenshot` | `catalogue:home` | catalogue:home: 0.82% of pixels differ in 950×266 at (289, 197) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: 0.49% of pixels differ in 950×195 at (289, 605) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: 0.23% of pixels differ in 84×246 at (857, 271) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: 0.48% of pixels differ in 310×194 at (317, 606) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: 0.11% of pixels differ in 335×16 at (355, 473) (threshold 0.10%) |
| `network` | `GET /api/me` | reader-auth:course: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:course: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:course: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:course: new request on b: POST /api/courses/visit |
| `network` | `POST /api/presence` | reader-auth:course: new request on b: POST /api/presence |
| `network` | `PUT /api/me` | reader-auth:course: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:course: new request on b: PUT /api/profile |
| `network` | `POST /api/analytics` | reader-auth:topic: new request on b: POST /api/analytics |
| `network` | `POST /api/presence` | reader-auth:topic: new request on b: POST /api/presence |
| `network` | `GET /api/me` | reader-auth:rule-0588-lecturer-locked: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0588-lecturer-locked: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0588-lecturer-locked: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0588-lecturer-locked: new request on b: POST /api/courses/visit |
| `network` | `PUT /api/courses/harness-rules/locks` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/harness-rules/locks |
| `network` | `PUT /api/me` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/profile |
| `network` | `GET /api/me` | reader-auth:rule-0588-student-hidden: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0588-student-hidden: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0588-student-hidden: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0588-student-hidden: new request on b: POST /api/courses/visit |
| `network` | `PUT /api/me` | reader-auth:rule-0588-student-hidden: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0588-student-hidden: new request on b: PUT /api/profile |
| `network` | `GET /api/me` | reader-auth:rule-0588-student-locked-card: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0588-student-locked-card: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0588-student-locked-card: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0588-student-locked-card: new request on b: POST /api/courses/visit |
| `network` | `PUT /api/courses/harness-rules/locks` | reader-auth:rule-0588-student-locked-card: new request on b: PUT /api/courses/harness-rules/locks |
| `network` | `PUT /api/me` | reader-auth:rule-0588-student-locked-card: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0588-student-locked-card: new request on b: PUT /api/profile |
| `network` | `GET /api/me` | live-auth:rule-0589-courses: new request on b: GET /api/me |
| `network` | `GET /api/profile` | live-auth:rule-0589-courses: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | live-auth:rule-0589-courses: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | live-auth:rule-0589-courses: new request on b: POST /api/courses/visit |
| `network` | `POST /api/presence` | live-auth:rule-0589-courses: new request on b: POST /api/presence |
| `network` | `PUT /api/me` | live-auth:rule-0589-courses: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | live-auth:rule-0589-courses: new request on b: PUT /api/profile |
| `network` | `GET /api/time/harness-rules` | time-auth:rule-0590-medians: new request on b: GET /api/time/harness-rules |
| `network` | `GET /api/time/harness-rules` | time-auth:rule-0590-calendar-byweek: new request on b: GET /api/time/harness-rules |
| `network` | `GET /api/time/harness-rules` | time-auth:rule-0590-calendar-byday: new request on b: GET /api/time/harness-rules |
| `network` | `GET /api/time/harness-rules` | time-auth:rule-0591-lab-bylab: new request on b: GET /api/time/harness-rules |
| `network` | `GET /api/time/harness-rules` | time-auth:rule-0591-lab-bystep: new request on b: GET /api/time/harness-rules |
| `network` | `GET /api/time/harness-rules` | time-auth:rule-0591-learning-records: new request on b: GET /api/time/harness-rules |
| `network` | `GET /api/time/harness-rules` | time-auth:rule-0591-student: new request on b: GET /api/time/harness-rules |
| `network` | `GET /api/me` | reader-auth:rule-0582-course: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0582-course: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0582-course: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0582-course: new request on b: POST /api/courses/visit |
| `network` | `POST /api/presence` | reader-auth:rule-0582-course: new request on b: POST /api/presence |
| `network` | `PUT /api/me` | reader-auth:rule-0582-course: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0582-course: new request on b: PUT /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0582-lab-step: new request on b: POST /api/analytics |
| `network` | `POST /api/presence` | reader-auth:rule-0582-lab-step: new request on b: POST /api/presence |
| `network` | `POST /api/analytics` | reader-auth:rule-0582-lab-step-2: new request on b: POST /api/analytics |
| `network` | `POST /api/presence` | reader-auth:rule-0582-lab-step-2: new request on b: POST /api/presence |
| `network` | `POST /api/analytics` | reader-auth:rule-0582-lab-step-back: new request on b: POST /api/analytics |
| `network` | `POST /api/presence` | reader-auth:rule-0582-lab-step-back: new request on b: POST /api/presence |
| `network` | `GET /api/me` | reader-auth:rule-0583-profile-menu: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0583-profile-menu: new request on b: GET /api/profile |
| `network` | `PATCH /api/me` | reader-auth:rule-0583-profile-menu: new request on b: PATCH /api/me |
| `network` | `POST /api/analytics` | reader-auth:rule-0583-profile-menu: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0583-profile-menu: new request on b: POST /api/courses/visit |
| `network` | `POST /api/presence` | reader-auth:rule-0583-profile-menu: new request on b: POST /api/presence |
| `network` | `PUT /api/me` | reader-auth:rule-0583-profile-menu: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0583-profile-menu: new request on b: PUT /api/profile |
| `network` | `GET /api/me` | reader-auth:rule-0584-talk-slide-2: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0584-talk-slide-2: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0584-talk-slide-2: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0584-talk-slide-2: new request on b: POST /api/courses/visit |
| `network` | `PUT /api/me` | reader-auth:rule-0584-talk-slide-2: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0584-talk-slide-2: new request on b: PUT /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0584-notebook-cell-2: new request on b: POST /api/analytics |
| `network` | `POST /api/analytics` | reader-auth:rule-0584-quiz-results: new request on b: POST /api/analytics |
| `network` | `GET /api/me` | reader-auth:rule-0585-course-dark: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0585-course-dark: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0585-course-dark: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0585-course-dark: new request on b: POST /api/courses/visit |
| `network` | `PUT /api/me` | reader-auth:rule-0585-course-dark: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0585-course-dark: new request on b: PUT /api/profile |
| `network` | `GET /api/me` | reader-auth:rule-0586-turned-away: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0586-turned-away: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0586-turned-away: new request on b: POST /api/analytics |
| `network` | `PUT /api/me` | reader-auth:rule-0586-turned-away: new request on b: PUT /api/me |
| `network` | `GET /api/me` | reader-auth:rule-0586-turned-away-again: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0586-turned-away-again: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0586-turned-away-again: new request on b: POST /api/analytics |
| `network` | `PUT /api/me` | reader-auth:rule-0586-turned-away-again: new request on b: PUT /api/me |
| `network` | `GET /api/me` | reader-auth:rule-0587-calendar-assessments: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0587-calendar-assessments: new request on b: GET /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0587-calendar-assessments: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0587-calendar-assessments: new request on b: POST /api/courses/visit |
| `network` | `PUT /api/me` | reader-auth:rule-0587-calendar-assessments: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0587-calendar-assessments: new request on b: PUT /api/profile |
| `network` | `POST /api/analytics` | reader-auth:rule-0587-llm: new request on b: POST /api/analytics |
| `network` | `GET /api/me` | reader-auth:rule-0592-stroke-saved: new request on b: GET /api/me |
| `network` | `GET /api/profile` | reader-auth:rule-0592-stroke-saved: new request on b: GET /api/profile |
| `network` | `GET /api/whiteboard?courseId=harness-rules&route=%2Fwhiteboard%2Fharness-rules%2Funit-1%2Ftopic-01%2Fwhiteboard-01&shared=false` | reader-auth:rule-0592-stroke-saved: new request on b: GET /api/whiteboard?courseId=harness-rules&route=%2Fwhiteboard%2Fharness-rules%2Funit-1%2Ftopic-01%2Fwhiteboard-01&shared=false |
| `network` | `POST /api/analytics` | reader-auth:rule-0592-stroke-saved: new request on b: POST /api/analytics |
| `network` | `POST /api/courses/visit` | reader-auth:rule-0592-stroke-saved: new request on b: POST /api/courses/visit |
| `network` | `PUT /api/me` | reader-auth:rule-0592-stroke-saved: new request on b: PUT /api/me |
| `network` | `PUT /api/profile` | reader-auth:rule-0592-stroke-saved: new request on b: PUT /api/profile |
| `network` | `PUT /api/whiteboard` | reader-auth:rule-0592-stroke-saved: new request on b: PUT /api/whiteboard |
| `console` | `reader-auth:course` | reader-auth:course: new console message on b |
| `console` | `reader-auth:course` | reader-auth:course: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `console` | `reader-auth:topic` | reader-auth:topic: new console message on b |
| `console` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: new console message on b |
| `console` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: new console message on b |
| `console` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: new console message on b |
| `console` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: new console message on b |
| `console` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: new console message on b |
| `console` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: new console message on b |
| `console` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: new console message on b |
| `console` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: new console message on b |
| `console` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: new console message on b |
| `console` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: new console message on b |
| `console` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: new console message on b |
| `console` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: new console message on b |
| `console` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: new console message on b |
| `console` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: new console message on b |
| `console` | `reader-auth:rule-0582-course` | reader-auth:rule-0582-course: new console message on b |
| `console` | `reader-auth:rule-0582-course` | reader-auth:rule-0582-course: new console message on b |
| `console` | `reader-auth:rule-0582-lab-step` | reader-auth:rule-0582-lab-step: new console message on b |
| `console` | `reader-auth:rule-0582-lab-step` | reader-auth:rule-0582-lab-step: new console message on b |
| `console` | `reader-auth:rule-0582-lab-step-2` | reader-auth:rule-0582-lab-step-2: new console message on b |
| `console` | `reader-auth:rule-0582-lab-step-2` | reader-auth:rule-0582-lab-step-2: new console message on b |
| `console` | `reader-auth:rule-0582-lab-step-back` | reader-auth:rule-0582-lab-step-back: new console message on b |
| `console` | `reader-auth:rule-0582-lab-step-back` | reader-auth:rule-0582-lab-step-back: new console message on b |
| `console` | `reader-auth:rule-0583-profile-menu` | reader-auth:rule-0583-profile-menu: new console message on b |
| `console` | `reader-auth:rule-0583-profile-menu` | reader-auth:rule-0583-profile-menu: new console message on b |
| `console` | `reader-auth:rule-0584-talk-slide-2` | reader-auth:rule-0584-talk-slide-2: new console message on b |
| `console` | `reader-auth:rule-0584-talk-slide-2` | reader-auth:rule-0584-talk-slide-2: new console message on b |
| `console` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: new console message on b |
| `console` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: new console message on b |
| `console` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: new console message on b |
| `console` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: new console message on b |
| `console` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: new console message on b |
| `console` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: new console message on b |
| `console` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: new console message on b |
| `console` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: new console message on b |
| `console` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: new console message on b |
| `console` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: new console message on b |
| `console` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: new console message on b |
| `console` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: new console message on b |
| `console` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: new console message on b |
| `console` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: new console message on b |
| `console` | `reader-auth:rule-0587-calendar-assessments` | reader-auth:rule-0587-calendar-assessments: new console message on b |
| `console` | `reader-auth:rule-0587-calendar-assessments` | reader-auth:rule-0587-calendar-assessments: new console message on b |
| `console` | `reader-auth:rule-0587-llm` | reader-auth:rule-0587-llm: new console message on b |
| `console` | `reader-auth:rule-0587-llm` | reader-auth:rule-0587-llm: new console message on b |
| `console` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: new console message on b |
| `console` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: new console message on b |
| `metrics` | `time/http_request_duration_seconds_count` | time: new series on b: http_request_duration_seconds_count |
| `metrics` | `time/http_requests_total` | time: new series on b: http_requests_total |
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
| `logs` | `reader-auth/courseId` | reader-auth: new log field on b: courseId |
| `logs` | `reader-auth/role` | reader-auth: new log field on b: role |
| `logs` | `reader-auth/info` | reader-auth: info-level lines: 430 on a, 1145 on b |
| `logs` | `reader-auth/warn` | reader-auth: warn-level lines: 0 on a, 170 on b |
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
| `persistence` | `student-signs-in/record_page_view` | student-signs-in: RPC record_page_view — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0588-content-lock/app_errors` | rule-0588-content-lock: POST app_errors — 0 row(s) on a, 2 on b |
| `persistence` | `rule-0588-content-lock/record_page_view` | rule-0588-content-lock: RPC record_page_view — 3 row(s) on a, 0 on b |
| `persistence` | `rule-0589-live/app_errors` | rule-0589-live: POST app_errors — 0 row(s) on a, 4 on b |
| `persistence` | `rule-0589-live/record_page_view` | rule-0589-live: RPC record_page_view — 4 row(s) on a, 0 on b |
| `persistence` | `rule-0590-time-calendar/app_errors` | rule-0590-time-calendar: POST app_errors — 0 row(s) on a, 1 on b |
| `persistence` | `rule-0590-time-calendar/record_page_view` | rule-0590-time-calendar: RPC record_page_view — 1 row(s) on a, 0 on b |
| `persistence` | `rule-0591-time-labs/app_errors` | rule-0591-time-labs: POST app_errors — 0 row(s) on a, 1 on b |
| `persistence` | `rule-0591-time-labs/record_page_view` | rule-0591-time-labs: RPC record_page_view — 1 row(s) on a, 0 on b |
| `persistence` | `rule-0582-signed-in-lab/app_errors` | rule-0582-signed-in-lab: POST app_errors — 0 row(s) on a, 4 on b |
| `persistence` | `rule-0582-signed-in-lab/record_page_view` | rule-0582-signed-in-lab: RPC record_page_view — 5 row(s) on a, 0 on b |
| `persistence` | `rule-0583-presence/record_page_view` | rule-0583-presence: RPC record_page_view — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0584-quiz-notebook-talk/app_errors` | rule-0584-quiz-notebook-talk: POST app_errors — 0 row(s) on a, 5 on b |
| `persistence` | `rule-0584-quiz-notebook-talk/record_page_view` | rule-0584-quiz-notebook-talk: RPC record_page_view — 7 row(s) on a, 0 on b |
| `persistence` | `rule-0585-preferences/app_errors` | rule-0585-preferences: POST app_errors — 0 row(s) on a, 1 on b |
| `persistence` | `rule-0585-preferences/record_page_view` | rule-0585-preferences: RPC record_page_view — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0586-private-course/app_errors` | rule-0586-private-course: POST app_errors — 0 row(s) on a, 1 on b |
| `persistence` | `rule-0586-private-course/tutors-connect-courses` | rule-0586-private-course: POST tutors-connect-courses — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0586-private-course/tutors-connect-profiles` | rule-0586-private-course: POST tutors-connect-profiles — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0586-private-course/record_page_view` | rule-0586-private-course: RPC record_page_view — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0587-calendar-llm/record_page_view` | rule-0587-calendar-llm: RPC record_page_view — 2 row(s) on a, 0 on b |
| `persistence` | `rule-0592-whiteboard/app_errors` | rule-0592-whiteboard: POST app_errors — 0 row(s) on a, 3 on b |
| `persistence` | `rule-0592-whiteboard/record_page_view` | rule-0592-whiteboard: RPC record_page_view — 3 row(s) on a, 0 on b |
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

<details><summary>Detail of 151 difference(s)</summary>

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

`dom` `catalogue:home`

```
   - paragraph: Catalogue
   - heading "Tutors Catalogue" [level=1]
-  - paragraph: Courses published with Tutors, most visited first. 0 modules · 0 students
+  - paragraph: Courses published with Tutors. 0 modules · 0 students
   - heading "Most visited courses" [level=2]
+  - text: Search courses
+  - searchbox "Search courses"
+  - text: Sort by
+  - combobox "Sort by":
+    - option "Most visited" [selected]
+    - option "Most recently visited"
+    - option "Title (A–Z)"
+    - option "Credits (A–Z)"
   - paragraph: No courses are available to display.
 - contentinfo "Site footer":
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

… and 131 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | holds |
| catalogue | 1 finding (1 on production too) | holds | holds |
| live | 1 finding (1 on production too) | holds | holds |
| time | 1 finding (1 on production too) | holds | holds |

### Informing (51; 51 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `timing` | `rule-0591-time-labs` | journey rule-0591-time-labs slower on b: median 12635ms → 29399ms (+133%, p=0.037, n=5/5; smallest slowdown 5/5 runs could detect: about 128%) | no date set | unclaimed |
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `timing-tolerance` | `rule-0591-time-labs` | journey rule-0591-time-labs slower on b beyond the 10% tolerance: 12635ms → 29399ms (+133%, p=0.037, n=5/5 runs; smallest detectable about 128%); timing fails it too (its floor is 20%) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 173 → 179 immutable requests (JS 142 → 148, CSS 31 → 31), 1.6 MB → 1.6 MB; 3 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 527 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 538 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 1160 → 1206 immutable requests (JS 987 → 1033, CSS 173 → 173), 12.7 MB → 12.7 MB; 13 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 127 immutable requests (JS 99 → 105, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live-auth` | live-auth: the asset graph changed: 179 → 185 immutable requests (JS 149 → 155, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `time-auth` | time-auth: the asset graph changed: 269 → 241 immutable requests (JS 235 → 207, CSS 34 → 34), 5.1 MB → 5.0 MB; 7 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 43× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET {{course}}/tutors.json` | replay:talk-01: request no longer made on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET {{course}}/tutors.json` | replay:note-01: GET {{course}}/tutors.json requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 41× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/chunks/{{hash}}.js` | replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 44× on b | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
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
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/strict-transport-security` | catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/content-security-policy` | catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `live/strict-transport-security` | live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `live/content-security-policy` | live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/strict-transport-security` | reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/content-security-policy` | reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `time/strict-transport-security` | time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `time/content-security-policy` | time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |

### Claimed differences (39)

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
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
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

11 claim(s) cover 39 failing hunk(s): 3.55 hunk(s) per claim, at most 26 under one claim (flagged above 10).

| artefact | scope | hunks | flag |
|---|---|---|---|
| `network` | `GET /_app/immutable/chunks/\{\{hash\}\}.js` | 26 | covers more than 10 hunks |

A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 311.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 105 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 270.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 105 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 271.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 105 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 275.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 105 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-28T06:23:30Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.45 ms | 2.65 ms |
| b | 600 | 0 | 0 | 1.4 ms | 2.48 ms |

<details><summary>Informational (158)</summary>

- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-medians: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byweek: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0590-calendar-byday: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bylab: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-lab-bystep: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-learning-records: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `console` time-auth:rule-0591-student: console message gone on b
- `timing` journey rule-0588-content-lock median 9606ms → 13321ms but not significant (p=0.531, +39%, n=5/5; smallest slowdown 5/5 runs could detect: about 107%)
- `timing` journey rule-0590-time-calendar median 10396ms → 23547ms but not significant (p=0.144, +127%, n=5/5; smallest slowdown 5/5 runs could detect: about 132%)
- `timing` journey rule-0591-time-labs slower on b: median 12635ms → 29399ms (+133%, p=0.037, n=5/5; smallest slowdown 5/5 runs could detect: about 128%)
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.05 / b 0 per reader page (broadcasts a 18 / b 0, socket data frames a 5 / b 0, over 22 page view(s))
- `vulns` reader: GHSA-2m5v-pch6-74hx (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-4w7w-5xrc-9h26 (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-55wc-3pg8-jfw6 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-9fm3-97px-rjf6 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-qrxm-fqhp-jwvm (High) is present on a and gone on b (fixed)
- `vulns` reader: GHSA-xjj6-f33q-929c (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-2m5v-pch6-74hx (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-4w7w-5xrc-9h26 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-55wc-3pg8-jfw6 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-9fm3-97px-rjf6 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-qrxm-fqhp-jwvm (High) is present on a and gone on b (fixed)
- `vulns` catalogue: GHSA-xjj6-f33q-929c (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-2m5v-pch6-74hx (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-4w7w-5xrc-9h26 (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-55wc-3pg8-jfw6 (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-9fm3-97px-rjf6 (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` live: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` live: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` live: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-qrxm-fqhp-jwvm (High) is present on a and gone on b (fixed)
- `vulns` live: GHSA-xjj6-f33q-929c (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-2m5v-pch6-74hx (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-4qv8-2p9j-2685 (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-4w7w-5xrc-9h26 (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-55wc-3pg8-jfw6 (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-9fm3-97px-rjf6 (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-c6gr-qvv4-5v3f (Low) is present on a and gone on b (fixed)
- `vulns` time: GHSA-cg2g-xh64-v4q7 (Critical) is present on a and gone on b (fixed)
- `vulns` time: GHSA-f72v-6w45-q472 (Medium) is present on a and gone on b (fixed)
- `vulns` time: GHSA-mrv2-3pqr-j5jr (High) is present on a and gone on b (fixed)
- `vulns` time: GHSA-qrxm-fqhp-jwvm (High) is present on a and gone on b (fixed)
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
- `timing-tolerance` journey rule-0591-time-labs slower on b beyond the 10% tolerance: 12635ms → 29399ms (+133%, p=0.037, n=5/5 runs; smallest detectable about 128%); timing fails it too (its floor is 20%)
- `asset-graph` reader: the asset graph changed: 173 → 179 immutable requests (JS 142 → 148, CSS 31 → 31), 1.6 MB → 1.6 MB; 3 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 527 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 538 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 1160 → 1206 immutable requests (JS 987 → 1033, CSS 173 → 173), 12.7 MB → 12.7 MB; 13 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 127 immutable requests (JS 99 → 105, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `asset-graph` live-auth: the asset graph changed: 179 → 185 immutable requests (JS 149 → 155, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn
- `asset-graph` time-auth: the asset graph changed: 269 → 241 immutable requests (JS 235 → 207, CSS 34 → 34), 5.1 MB → 5.0 MB; 7 network and 0 headers difference(s) are this churn
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 43× on b
- `replay` replay:talk-01: request no longer made on b: GET {{course}}/tutors.json
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 38× on b
- `replay` replay:note-01: GET {{course}}/tutors.json requested 2× on a, 1× on b
- `replay` replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 41× on b
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 40× on b
- `replay` replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 44× on b
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
- `secrets-in-response` reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
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
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `headers-policy` catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)

</details>

<details><summary>Stale claims (7)</summary>

- `network` `reader:*` — Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login
- `persistence` `reader:*` — Rule 0072: student rows are written by the reader's server under the session's login, not by the browser
- `dom` `reader:whiteboard*` — Rule 0068: an anonymous visitor's whiteboard edits are not saved, and the status line says so
- `network` `time:*` — CHANGELOG Unreleased (Time): the dashboard loads time data from the reader
- `dom` `time:*` — CHANGELOG Unreleased (Time): signed-out viewers see a sign-in link
- `screenshot` `time:*` — CHANGELOG Unreleased (Time): signed-out viewers see a sign-in link
- `network` `catalogue:*` — Rule 0070: the catalogue shows the number of students without reading any student's profile

</details>

<sub>harness 1.59.1 (df0eeefb1cf3, contract 1.59.0) · 2026-10-29T02:28:10.151Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×272, request-id×272, etag×272, metrics-process×602, metrics-timing-histograms×22, third-party-requests×6926, persistence-stub-requests×1454, oauth-callback-state×110, media-range-status×44, course-media-http2-reset×1, hashed-assets×20310, footer-tutors-version×837, transport-length×272, transport-connection×272, transport-keepalive×272</sub>


</details>
