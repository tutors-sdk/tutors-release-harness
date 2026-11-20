## Release gate: sha-b1e19af beside 17.1.0

**Gate: PASS**

#### New since the last forecast

**47 new, 0 gone** in the unclaimed set since the forecast of 2026-11-18T13:59:35.597Z (`sha-556c7f2`), beside the same baseline `17.1.0`. By artefact: logs +1 −0 · metrics +2 −0 · network +44 −0.

| artefact | scope | what |
| --- | --- | --- |
| network | GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 | reader:home: request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 |
| network | GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 | reader:course: request no longer made on b: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 |
| network | GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 | reader:search: request no longer made on b: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 |
| network | GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10 | reader-auth:sign-in: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10 |
| network | GET /actor | reader-auth:sign-in: new request on b: GET /actor |
| network | GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100 | reader-auth:course: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100 |
| network | GET /actor | reader-auth:course: new request on b: GET /actor |
| network | GET /course/reference-course/__data.json?x-sveltekit-invalidated=100 | reference:course: request no longer made on b: GET /course/reference-course/__data.json?x-sveltekit-invalidated=100 |
| network | GET /note/reference-course/topic-07-reference/note-1/__data.json?x-sveltekit-invalidated=100 | reference:note: request no longer made on b: GET /note/reference-course/topic-07-reference/note-1/__data.json?x-sveltekit-invalidated=100 |
| network | GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 | reader-auth:rule-0588-lecturer-locked: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| network | GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 | reader-auth:rule-0588-lecturer-locked: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| network | GET /actor | reader-auth:rule-0588-lecturer-locked: new request on b: GET /actor |
| network | GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 | reader-auth:rule-0588-student-hidden: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| network | GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 | reader-auth:rule-0588-student-hidden: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| network | GET /actor | reader-auth:rule-0588-student-hidden: new request on b: GET /actor |

and 32 more new: each is in the report's unclaimed differences below.

#### Causes and the PRs behind them

19 causes, 19 with a PR named. Merged since the forecast of `sha-556c7f2`: [#607](https://github.com/tutors-sdk/tutors-mono-repo/pull/607), [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612), [#608](https://github.com/tutors-sdk/tutors-mono-repo/pull/608), [#606](https://github.com/tutors-sdk/tutors-mono-repo/pull/606), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609). 13 causes are new since then, and only these PRs can have made them. The others are matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| **new** network: new request on b: GET /actor | 14 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=# | 9 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=# | 7 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=# | 4 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=# | 4 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /course/localhost:#/__data.json?x-sveltekit-invalidated=# | 2 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** logs: info-level lines | 1 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** metrics: http_request_duration_seconds_count moved by # on a and # on b under the same traffic | 1 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** metrics: http_requests_total moved by # on a and # on b under the same traffic | 1 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=#&x-sveltekit-invalidated=# | 1 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /course/reference-course/__data.json?x-sveltekit-invalidated=# | 1 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /lab/harness-fixture/unit-#/topic-#/book-lab-#/__data.json?x-sveltekit-invalidated=# | 1 | [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct), [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (2 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| **new** network: request no longer made on b: GET /note/reference-course/topic-#-reference/note-#/__data.json?x-sveltekit-invalidated=# | 1 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) (7 files, 0 direct), [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) (3 files, 0 direct) and 1 more; not declared: #605's CHANGELOG line says (sbom) |
| dom: semantic DOM differs (+# −# lines at line #) | 48 | [#571](https://github.com/tutors-sdk/tutors-mono-repo/pull/571) (16 files, 12 direct), [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (44 files, 6 direct) and 12 more |
| sbom: package bumped | 8 | [#593](https://github.com/tutors-sdk/tutors-mono-repo/pull/593) (7 files, 2 direct), [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (6 files, 1 direct), [#586](https://github.com/tutors-sdk/tutors-mono-repo/pull/586) (1 file) and 7 more |
| focus: keyboard order changed (# stops on a, # on b) | 7 | [#571](https://github.com/tutors-sdk/tutors-mono-repo/pull/571) (13 files, 9 direct), [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (44 files, 6 direct) and 12 more |
| screenshot: #% of pixels differ in #×# at (#, #) (threshold #%) | 7 | [#571](https://github.com/tutors-sdk/tutors-mono-repo/pull/571) (13 files, 9 direct), [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (44 files, 6 direct) and 12 more |
| network: new request on b: GET {{asset}} | 6 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (44 files, 6 direct), [#593](https://github.com/tutors-sdk/tutors-mono-repo/pull/593) (22 files, 4 direct) and 12 more |
| network: request no longer made on b: GET {{asset}} | 6 | [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) (9 files, 7 direct), [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) (44 files, 6 direct), [#593](https://github.com/tutors-sdk/tutors-mono-repo/pull/593) (22 files, 4 direct) and 12 more |

**PASS, explained: all 129 differences no claim covers yet are pinned on the PR that made them, declared in its CHANGELOG line (#593: 48) or traced by its code (#605: 43, #593: 14, #589: 12, #571: 8, #609: 4). Nothing is owed on main; the release author pastes the claims when the release is cut. 9 claims (9 seen matching beside 17.0.0) matched nothing because 17.1.0 already ships what they claim: archive them from release/claims.yaml. Warning: 5 PRs' hints leave out what its code moved (#605 says (sbom); its code also moved network (40), metrics (2), logs (1); #593 says (dom, axe, network, headers, sbom); its code also moved focus (7), screenshot (7); #589 says (sbom); its code also moved network (12); #571 says (logs, network); its code also moved sbom (8); #609 has no hint; its code also moved network (4)); fix the title so the release's changelog says so.**

#### Claims owed (19)

One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 129, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # dom: semantic DOM differs (+# −# lines at line #): covers its 48 differences. Name the Rule that intends it, or fix it.
  - artefact: "dom"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "semantic DOM differs (+# −# lines at line #): 48 differences (reader, catalogue, live, time; 41 pages); likely #571, #605, #589"
  # network: new request on b: GET /actor: covers its 14 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /actor"
    rule: "????"
    reason: "new request on b: GET /actor: 14 differences (reader, live; 14 pages); likely #605, #609, #612"
  # network: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=#: covers its 9 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /course/harness-rules/__data.json\\?x-sveltekit-invalidated=100"
    rule: "????"
    reason: "request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=#: 9 differences (reader; 9 pages); likely #605, #609, #612"
  # sbom: package bumped: covers its 8 differences. Name the Rule that intends it, or fix it.
  - artefact: "sbom"
    scope: "*/{apt,libapt-pkg6.0}"
    rule: "????"
    reason: "package bumped: 8 differences (reader, catalogue, live, time; 2 packages); likely #593, #589, #586"
  # focus: keyboard order changed (# stops on a, # on b): covers its 7 differences. Name the Rule that intends it, or fix it.
  - artefact: "focus"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader:home}"
    rule: "????"
    reason: "keyboard order changed (# stops on a, # on b): 7 differences (reader, catalogue, live; 7 pages); likely #571, #605, #589"
  # network: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=#: covers its 7 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /auth/harness-rules/__data.json\\?x-sveltekit-invalidated=10"
    rule: "????"
    reason: "request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=#: 7 differences (reader; 7 pages); likely #605, #609, #612"
  # screenshot: #% of pixels differ in #×# at (#, #) (threshold #%): covers its 7 differences. Name the Rule that intends it, or fix it.
  - artefact: "screenshot"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader:home}"
    rule: "????"
    reason: "#% of pixels differ in #×# at (#, #) (threshold #%): 7 differences (reader, catalogue, live; 7 pages); likely #571, #605, #589"
  # network: new request on b: GET {{asset}}: covers its 6 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /_app/immutable/{assets/24.\\{\\{hash\\}\\}.css,nodes/24.\\{\\{hash\\}\\}.js}"
    rule: "????"
    reason: "new request on b: GET {{asset}}: 6 differences (reader; 3 pages; 2 names); likely #605, #589, #593"
  # network: request no longer made on b: GET {{asset}}: covers its 6 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /_app/immutable/{assets/23.\\{\\{hash\\}\\}.css,nodes/23.\\{\\{hash\\}\\}.js}"
    rule: "????"
    reason: "request no longer made on b: GET {{asset}}: 6 differences (reader; 3 pages; 2 names); likely #605, #589, #593"
  # network: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=#: covers its 4 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /auth/harness-fixture/__data.json\\?x-sveltekit-invalidated=10"
    rule: "????"
    reason: "request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=#: 4 differences (reader, live; 4 pages); likely #605, #609, #612"
  # network: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=#: covers its 4 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /course/harness-fixture/__data.json\\?x-sveltekit-invalidated=100"
    rule: "????"
    reason: "request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=#: 4 differences (reader, live; 4 pages); likely #605, #609, #612"
  # network: request no longer made on b: GET /course/localhost:#/__data.json?x-sveltekit-invalidated=#: covers its 2 differences. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /course/localhost:8080/__data.json\\?x-sveltekit-invalidated=100"
    rule: "????"
    reason: "request no longer made on b: GET /course/localhost:#/__data.json?x-sveltekit-invalidated=#: 2 differences (reader; 2 pages); likely #605, #609, #612"
  # logs: info-level lines: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "logs"
    scope: "reader/info"
    rule: "????"
    reason: "info-level lines: 1 difference (reader; 1 name); likely #605, #609, #612"
  # metrics: http_request_duration_seconds_count moved by # on a and # on b under the same traffic: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "metrics"
    scope: "reader/http_request_duration_seconds_count"
    rule: "????"
    reason: "http_request_duration_seconds_count moved by # on a and # on b under the same traffic: 1 difference (reader); likely #605, #609, #612"
  # metrics: http_requests_total moved by # on a and # on b under the same traffic: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "metrics"
    scope: "reader/http_requests_total"
    rule: "????"
    reason: "http_requests_total moved by # on a and # on b under the same traffic: 1 difference (reader); likely #605, #609, #612"
  # network: request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=#&x-sveltekit-invalidated=#: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /__data.json\\?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100"
    rule: "????"
    reason: "request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=#&x-sveltekit-invalidated=#: 1 difference (reader; 1 page); likely #605, #609, #612"
  # network: request no longer made on b: GET /course/reference-course/__data.json?x-sveltekit-invalidated=#: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /course/reference-course/__data.json\\?x-sveltekit-invalidated=100"
    rule: "????"
    reason: "request no longer made on b: GET /course/reference-course/__data.json?x-sveltekit-invalidated=#: 1 difference (reader; 1 page); likely #605, #609, #612"
  # network: request no longer made on b: GET /lab/harness-fixture/unit-#/topic-#/book-lab-#/__data.json?x-sveltekit-invalidated=#: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /lab/harness-fixture/unit-1/topic-01/book-lab-01/__data.json\\?x-sveltekit-invalidated=100"
    rule: "????"
    reason: "request no longer made on b: GET /lab/harness-fixture/unit-#/topic-#/book-lab-#/__data.json?x-sveltekit-invalidated=#: 1 difference (live; 1 page); likely #609, #612, #605"
  # network: request no longer made on b: GET /note/reference-course/topic-#-reference/note-#/__data.json?x-sveltekit-invalidated=#: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "network"
    scope: "GET /note/reference-course/topic-07-reference/note-1/__data.json\\?x-sveltekit-invalidated=100"
    rule: "????"
    reason: "request no longer made on b: GET /note/reference-course/topic-#-reference/note-#/__data.json?x-sveltekit-invalidated=#: 1 difference (reader; 1 page); likely #605, #609, #612"
```

6 of 8 dimensions measured (weight 80 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** | **breached** | −20 unclaimed: dom /: reader:home: semantic DOM differs (+2 −0 lines at line 23); −20 unclaimed: dom /: reader:home: semantic DOM differs (+1 −1 lines at line 64); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+1 −1 lines at line 49); −20 unclaimed: dom /topic/localhost:8080/unit-1/topic-01: reader:topic: semantic DOM differs (+1 −1 lines at line 67); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01: reader:lab-step: semantic DOM differs (+1 −1 lines at line 86) (and 124 more like it, not counted again: report.html#differences); −15 stale claim network * /api/{me,profile,presence,analytics,courses/visit}: matched nothing (Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login); −15 stale claim network * /api/whiteboard*: matched nothing (Rule 0068: a signed-in student's whiteboard edits are saved through the server, in a room only its owner can read or overwrite); −15 stale claim persistence */tutors-connect-{courses,profiles}: matched nothing (Rule 0072: student rows are written by the reader's server under the session's login, not by the browser); −15 stale claim network GET /api/time/*: matched nothing (CHANGELOG Unreleased (Time): the dashboard loads time data from the reader); −15 stale claim logs reader-auth/{courseId,role}: matched nothing (CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320)); −15 stale claim sbom */node: matched nothing (Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541)); −10 stale claim network POST /api/live/activity: matched nothing (Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481)) (and 2 more like it, not counted again); −5 claim network GET /_app/immutable/chunks/\{\{hash\}\}.js covers 20 hunks at once (not narrow) |
| Noise health | 15 | **80** |  | −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask chromium-compute-pressure-policy fired nothing in this run (a mask that never fires is a mask to delete); −5 mask course-media-http2-reset fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete) (and 1 more like it, not counted again) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | not measured |  | quality.json has no mutation scores for 4204154 (the monorepo's Nightly wrote no Stryker report) and no harness mutants |
| Requirements traceability | 10 | **0** | **breached** | floor 13 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry); each costs change risk its points; −10 changelog entry "#571 feat(release): fail fast when a deployment lacks an environment variable or a usable service key (logs, network)" has no claim; −20 changelog entry "#576 fix(nightly): make the Nightly green again (calendar journey, stack clock, mutation dry run and floor)" has no EARS file; −10 changelog entry "#580 feat(create): tutors validate on the CLI (sbom)" has no claim; −20 changelog entry "#590 fix(reader): save content locks independently of student lists (network, persistence)" has no EARS file; −10 changelog entry "#590 fix(reader): save content locks independently of student lists (network, persistence)" has no claim; −10 changelog entry "#593 feat(validator): add course validation app (dom, axe, network, headers, sbom)" has no claim; −10 claim 6 (logs reader-auth/{courseId,role}) names #320, not between 17.1.0 and b1e19afe5af58124dd398b08c957e265ded3e344 traces to no changelog entry; −10 claim 7 (image-manifest */base) names #541, not between 17.1.0 and b1e19afe5af58124dd398b08c957e265ded3e344 traces to no changelog entry; −10 claim 8 (sbom */node) names #541, not between 17.1.0 and b1e19afe5af58124dd398b08c957e265ded3e344 traces to no changelog entry; −10 claim 9 (network POST /api/live/activity) names #481, not between 17.1.0 and b1e19afe5af58124dd398b08c957e265ded3e344 traces to no changelog entry; −10 claim 10 (persistence */realtime_claim_live_publish) names #481, not between 17.1.0 and b1e19afe5af58124dd398b08c957e265ded3e344 traces to no changelog entry; −10 claim 11 (persistence */realtime_watch) names #481, not between 17.1.0 and b1e19afe5af58124dd398b08c957e265ded3e344 traces to no changelog entry; −10 claim 12 (network GET /_app/immutable/chunks/\{\{hash\}\}.js) names #478, #481, not between 17.1.0 and b1e19afe5af58124dd398b08c957e265ded3e344 traces to no changelog entry |
| Change risk | 15 | **0** |  | −3 PR #571 touches 4 hotspots apps/reader/src/hooks.server.ts (4 of the last 6 releases), apps/time/src/hooks.server.ts (4 of the last 6 releases), apps/catalogue/src/hooks.server.ts (3 of the last 6 releases) and 1 more; −10 PR #571 changed Reader, Live, Catalogue, Time, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #573 changed Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #578 changed Shared Packages, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #580 changed Shared Packages, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −5 reader churn 286 lines, above 2× its median of 114 over the last 6 releases; PR #589 is the largest part (171 lines); −10 PR #586 changed Infrastructure but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #569 changed Infrastructure but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −3 PR #593 touches 6 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (4 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (4 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (4 of the last 6 releases) and 3 more; −10 PR #595 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −3 PR #575 touches hotspot packages/jsr/tutors-lite/main.ts (3 of the last 6 releases); −10 PR #575 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #598 changed Infrastructure but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #605 changed Reader, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #612 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #606 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it; −10 PR #609 changed Shared Packages, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 0 (100 − 144), v17.1.0..b1e19afe5af58124dd398b08c957e265ded3e344: 15 of 24 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#571](https://github.com/tutors-sdk/tutors-mono-repo/pull/571) | feat(release): fail fast when a deployment lacks an environment variable or a usable service key (logs, network) | 1254 | 24 | 4 | 1.96 | yes |  | **−13** | −3 [PR #571 touches 4 hotspots apps/reader/src/hooks.server.ts (4 of the last 6 releases), apps/time/src/hooks.server.ts (4 of the last 6 releases), apps/catalogue/src/hooks.server.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/571/files#diff-d6d421ccc99e28b6214f7df730798547515a524700fe6758ff2aaa6b7cdd8856); −10 [PR #571 changed Reader, Live, Catalogue, Time, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/571/files#diff-c5f7478f9ea43955917de963b542918dbd3c74bd2e710935fd2606ee0ce67ecd) |
| [#575](https://github.com/tutors-sdk/tutors-mono-repo/pull/575) | fix(generator): render static builds with bundled templates and report tutors-lite's real version (none) | 375 | 18 | 1 | 0.71 | yes |  | **−13** | −3 [PR #575 touches hotspot packages/jsr/tutors-lite/main.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/575/files#diff-b55bc46dd296ac6e868369322beb79065d754a2f9c80d846dd1f89ec4ad3735e); −10 [PR #575 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/575/files#diff-0f445467b3cec9902bbe35d2b258103c2222ff4247b3ef4db5c5f9e746713f05) |
| [#573](https://github.com/tutors-sdk/tutors-mono-repo/pull/573) | deploy: pin production to 17.1.0 | 30 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #573 changed Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/573/files#diff-462bfbca9b703476f3fe4060b6328ae17d503dc2dd0a5e1622e08b29e639af04) |
| [#578](https://github.com/tutors-sdk/tutors-mono-repo/pull/578) | refactor(gen): expose the unpruned course tree | 97 | 6 | 0 | 1.20 | yes |  | **−10** | −10 [PR #578 changed Shared Packages, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/578/files#diff-e0e5989842fab699476d2b93b4bcd90e7227db970de9f2a4690876f9d99b3531) |
| [#580](https://github.com/tutors-sdk/tutors-mono-repo/pull/580) | feat(create): tutors validate on the CLI (sbom) | 660 | 21 | 0 | 2.08 | yes |  | **−10** | −10 [PR #580 changed Shared Packages, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/580/files#diff-2ac9f030258ef25ea469c8f7640816bd3789bab9bcd342c2ad6595bf45d87f9c) |
| [#586](https://github.com/tutors-sdk/tutors-mono-repo/pull/586) | build(deps): bump library/node from `bc0a2af` to `add5c17` | 2 | 1 | 0 | no production lines | yes |  | **−10** | −10 [PR #586 changed Infrastructure but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/586/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#569](https://github.com/tutors-sdk/tutors-mono-repo/pull/569) | build(deps): bump grafana/grafana from 11.3.0 to 13.3.0 in /observability/grafana | 2 | 1 | 0 | no production lines | yes |  | **−10** | −10 [PR #569 changed Infrastructure but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/569/files#diff-e7b6c114ef82064ee727e4b82ff224a76afb80501270bfc909d0364cb3152656) |
| [#595](https://github.com/tutors-sdk/tutors-mono-repo/pull/595) | course-rules: --fix renames a stray lab page to a step; flag older-course compatibility | 177 | 8 | 0 | 2.32 | yes |  | **−10** | −10 [PR #595 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/595/files#diff-e87e62cad4d9620b66c90fa51631f42e0f08f5b109a45ebb5b10bbf8d900cd65) |
| [#598](https://github.com/tutors-sdk/tutors-mono-repo/pull/598) | build(deps): bump prom/prometheus from v3.15.1 to v3.16.0 in /observability | 2 | 1 | 0 | no production lines | yes |  | **−10** | −10 [PR #598 changed Infrastructure but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/598/files#diff-f95ce1402fb54670d3727b595ea46df5fe29a671cfc9e2242e65d4fcf5b6b44d) |
| [#605](https://github.com/tutors-sdk/tutors-mono-repo/pull/605) | Build the reader as static files that need no server (sbom) | 541 | 22 | 0 | 1.60 | yes |  | **−10** | −10 [PR #605 changed Reader, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/605/files#diff-87605cd0279aafedbea0e96b6151c9963b8bff3e1c83d32246758a92a83b3109) |
| [#612](https://github.com/tutors-sdk/tutors-mono-repo/pull/612) | feat(create): tutors import reads a Moodle backup or a Common Cartridge | 1105 | 12 | 0 | 2.14 | yes |  | **−10** | −10 [PR #612 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/612/files#diff-449ca968d34e5574e949f752bf7dc4ad0490b8563d894c2f251d430747eb730e) |
| [#606](https://github.com/tutors-sdk/tutors-mono-repo/pull/606) | Build the corpus courses on Windows and compare them with Linux | 391 | 7 | 0 | 33.50 | yes |  | **−10** | −10 [PR #606 changed Shared Packages, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/606/files#diff-deb6abf93a76cd4216475d7f7bd3784c8273664c7ecb1541bc55abaf59516aad) |
| [#609](https://github.com/tutors-sdk/tutors-mono-repo/pull/609) | Compile one tutors program for every target on release | 400 | 15 | 0 | 1.68 | yes |  | **−10** | −10 [PR #609 changed Shared Packages, Infrastructure, Development but no changelog entry under vb1e19afe5af58124dd398b08c957e265ded3e344 names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/609/files#diff-5120444e4d184841565d20ffc18b895d7d4d3f1ef63c38671080d41fa47759d9) |
| [#589](https://github.com/tutors-sdk/tutors-mono-repo/pull/589) | Land the merged course-rules stack (#581–#587) on main (sbom) | 7788 | 112 | 0 | 1.27 | yes |  | **−5** | −5 [reader churn 286 lines, above 2× its median of 114 over the last 6 releases; PR #589 is the largest part (171 lines)](https://github.com/tutors-sdk/tutors-mono-repo/pull/589/files#diff-2ea6c6513893a92dd7a8d6ede788516f1791b20b0be0ab5b5daef72d5dbc4d86) |
| [#593](https://github.com/tutors-sdk/tutors-mono-repo/pull/593) | feat(validator): add course validation app (dom, axe, network, headers, sbom) | 2376 | 94 | 6 | 0.66 | yes |  | **−3** | −3 [PR #593 touches 6 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (4 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (4 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (4 of the last 6 releases) and 3 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/593/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741) |
| 9 more | no deductions: #572, #576, #579, #588, #590, #591, #594, #607, #608 | 6425 | 77 |  |  |  |  | 0 |  |

- churn: reader 286 (median 114) ABOVE 2×, catalogue 21 (median 35.5), live 21 (median 26.5), time 21 (median 61)
- hotspots: 47 file(s) changed in 3+ of the last 6 releases; touched this release: apps/reader/src/hooks.server.ts, apps/time/src/hooks.server.ts, apps/catalogue/src/hooks.server.ts, apps/live/src/hooks.server.ts, packages/svelte/utils/i18n/src/messages/fr.ts, packages/svelte/utils/i18n/src/messages/es.ts, packages/svelte/utils/i18n/src/messages/de.ts, packages/svelte/utils/i18n/src/messages/it.ts, packages/svelte/utils/i18n/src/messages/en.ts, packages/svelte/utils/i18n/src/messages/ga.ts, packages/jsr/tutors-lite/main.ts
- ownership: no file with 3+ authors
- orphans: 13 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at b1e19afe5af58124dd398b08c957e265ded3e344 has no "### vb1e19afe5af58124dd398b08c957e265ded3e344" entries under a product section)
- tests: apps/catalogue 36.41, apps/live 36.41, apps/reader 11.31, apps/time 36.41, apps/validator 1.21, packages/jsr/course-rules 2.36, packages/jsr/create 4.06, packages/jsr/gen 1.61, packages/jsr/tutors-cli 1.68, packages/jsr/tutors-lite 5.55, packages/svelte/app-config 4.64, packages/svelte/course 6.18, packages/svelte/quiz 10.19, packages/svelte/ui-components 2.40, packages/svelte/ui-navigators 189.67, packages/svelte/ui-primitives 189.67, packages/svelte/utils 94.83
- reviews: 24 approved, 0 not
- dependencies: no major bump; 22 new direct dependencies (@opentelemetry/api, @prometheus-io/client, @skeletonlabs/skeleton, @skeletonlabs/skeleton-svelte, @sveltejs/adapter-netlify, …)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at b1e19afe5af58124dd398b08c957e265ded3e344 has no "### vb1e19afe5af58124dd398b08c957e265ded3e344" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-11-20T12:53:19.153Z — exit code **0**

| step | result | report |
| --- | --- | --- |
| release | FAIL |  |

<details><summary>release: FAIL</summary>

## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.1.0` | `quay.io/tutors-sdk/tutors-reader:sha-b1e19af` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.1.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-b1e19af` |
| live | `quay.io/tutors-sdk/tutors-live:17.1.0` | `quay.io/tutors-sdk/tutors-live:sha-b1e19af` |
| time | `quay.io/tutors-sdk/tutors-time:17.1.0` | `quay.io/tutors-sdk/tutors-time:sha-b1e19af` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:06fc7c58278e00ab4f311a368ad816e6a6dc001920f1673e09cfef10836a9fc7` · rev `b1e19afe5af5` · version `sha-b1e19af` |
| catalogue image | `sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:8a26025b3c4f2794a3c56096e5fbc632a5df8c2004ca8f6b60b19f78e153edae` · rev `b1e19afe5af5` · version `sha-b1e19af` |
| live image | `sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:0789764a49238f1f4317ad4c07a3bf6d326ba0f47ada4383d1bdad681727752d` · rev `b1e19afe5af5` · version `sha-b1e19af` |
| time image | `sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` · rev `b146cca3900e` · version `17.1.0-rc.1` | `sha256:944f1c60324da3db130b70e8e5defdfb714df36b2118ea8b0b4d52de4aef785b` · rev `b1e19afe5af5` · version `sha-b1e19af` |

- 129 unclaimed diff(s)
- 9 claim(s) matched nothing and should be removed from the changelog
- A/A consulted: clean at 2026-11-20T01:56:35.932Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): 2 difference(s); 20 of this run's 153 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.
  - `dom` `replay:talk-01`: replay:talk-01: semantic DOM differs (+6 −1 lines at line 41)
  - `network` `GET /_app/immutable/chunks/{{hash}}.js`: replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 42× on a2

### 129 unclaimed differences, 19 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `dom` semantic DOM differs (+# −# lines at line #) | 48 | reader, catalogue, live, time | 41: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more | reader:home: semantic DOM differs (+2 −0 lines at line 23) |
| `network` new request on b: GET /actor | 14 | reader, live | 14: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark` and 8 more | reader-auth:sign-in: new request on b: GET /actor |
| `network` request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=# | 9 | reader | 9: `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark`, `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again`, `reader-auth:rule-0587-calendar-assessments`, `reader-auth:rule-0588-lecturer-locked` and 3 more | reader-auth:rule-0588-lecturer-locked: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `sbom` package bumped (2 packages: `apt`, `libapt-pkg6.0`) | 8 | reader, catalogue, live, time | — | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `focus` keyboard order changed (# stops on a, # on b) | 7 | reader, catalogue, live | 7: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again` and 1 more | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `network` request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=# | 7 | reader | 7: `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark`, `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0587-calendar-assessments`, `reader-auth:rule-0588-lecturer-locked`, `reader-auth:rule-0588-student-hidden` and 1 more | reader-auth:rule-0588-lecturer-locked: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 7 | reader, catalogue, live | 7: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again` and 1 more | reader:home: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `network` new request on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/24.{{hash}}.css`, `GET /_app/immutable/nodes/24.{{hash}}.js`) | 6 | reader | 3: `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again`, `reader:home` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` request no longer made on b: GET {{asset}} (2 routes: `GET /_app/immutable/assets/23.{{hash}}.css`, `GET /_app/immutable/nodes/23.{{hash}}.js`) | 6 | reader | 3: `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again`, `reader:home` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=# | 4 | reader, live | 4: `live-auth:rule-0589-courses`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:sign-in` | reader-auth:sign-in: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10 |
| `network` request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=# | 4 | reader, live | 4: `live-auth:rule-0589-courses`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu` | reader-auth:course: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100 |
| `network` request no longer made on b: GET /course/localhost:#/__data.json?x-sveltekit-invalidated=# | 2 | reader | 2: `reader:course`, `reader:search` | reader:course: request no longer made on b: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 |
| `logs` info-level lines (1 field: `info`) | 1 | reader | — | reader: info-level lines: 62 on a, 31 on b |
| `metrics` http_request_duration_seconds_count moved by # on a and # on b under the same traffic | 1 | reader | — | reader: http_request_duration_seconds_count moved by 62 on a and 31 on b under the same traffic |
| `metrics` http_requests_total moved by # on a and # on b under the same traffic | 1 | reader | — | reader: http_requests_total moved by 62 on a and 31 on b under the same traffic |
| `network` request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=#&x-sveltekit-invalidated=# | 1 | reader | 1: `reader:home` | reader:home: request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 |
| `network` request no longer made on b: GET /course/reference-course/__data.json?x-sveltekit-invalidated=# | 1 | reader | 1: `reference:course` | reference:course: request no longer made on b: GET /course/reference-course/__data.json?x-sveltekit-invalidated=100 |
| `network` request no longer made on b: GET /lab/harness-fixture/unit-#/topic-#/book-lab-#/__data.json?x-sveltekit-invalidated=# | 1 | live | 1: `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: request no longer made on b: GET /lab/harness-fixture/unit-1/topic-01/book-lab-01/__data.json?x-sveltekit-invalidated=100 |
| `network` request no longer made on b: GET /note/reference-course/topic-#-reference/note-#/__data.json?x-sveltekit-invalidated=# | 1 | reader | 1: `reference:note` | reference:note: request no longer made on b: GET /note/reference-course/topic-07-reference/note-1/__data.json?x-sveltekit-invalidated=100 |

Moved together on the same pages, so likely one change each:

- `dom`, `network` on 13 pages (42 differences): `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0583-profile-menu`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0585-course-dark`, `reader-auth:rule-0588-lecturer-locked` and 7 more
- `dom`, `focus`, `network`, `screenshot` on 4 pages (38 differences): `live-auth:rule-0589-courses`, `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again`, `reader:home`
- `dom`, `focus`, `screenshot` on 3 pages (12 differences): `catalogue:home`, `live-auth:rule-0589-students`, `live:home`

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0586-private-course`: Rule 0586 (exercises 0011, 0267): 21 differences in dom, focus, network, screenshot
- `rule-0589-live`: Rule 0589 (exercises 0330, 0335): 12 differences in dom, focus, network, screenshot
- `rule-0588-content-lock`: Rule 0588 (exercises 0052, 0053, 0054): 11 differences in dom, network
- `rule-0582-signed-in-lab`: Rule 0582 (exercises 0011, 0250, 0252, 0260, 0303, 0330): 7 differences in dom, network
- `rule-0584-quiz-notebook-talk`: Rule 0584 (exercises 0047, 0049, 0050): 6 differences in dom, network
- `rule-0585-preferences`: Rule 0585 (exercises 0037, 0038, 0039): 5 differences in dom, network
- `rule-0583-presence`: Rule 0583 (exercises 0046, 0064, 0280): 4 differences in dom, network
- `rule-0587-calendar-llm`: Rule 0587 (exercises 0042, 0284): 4 differences in dom, network
- `rule-0591-time-labs`: Rule 0591 (exercises 0319): 4 differences in dom
- `rule-0592-whiteboard`: Rule 0592 (exercises 0275, 0276): 4 differences in dom, network
- `rule-0590-time-calendar`: Rule 0590 (exercises 0319): 3 differences in dom

### Unclaimed differences (129)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `reader:home` | reader:home: semantic DOM differs (+2 −0 lines at line 23) |
| `dom` | `reader:home` | reader:home: semantic DOM differs (+1 −1 lines at line 64) |
| `dom` | `reader:course` | reader:course: semantic DOM differs (+1 −1 lines at line 49) |
| `dom` | `reader:topic` | reader:topic: semantic DOM differs (+1 −1 lines at line 67) |
| `dom` | `reader:lab-step` | reader:lab-step: semantic DOM differs (+1 −1 lines at line 86) |
| `dom` | `reader:lab-step-2` | reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 80) |
| `dom` | `reader:search` | reader:search: semantic DOM differs (+1 −1 lines at line 99) |
| `dom` | `reader:search-results` | reader:search-results: semantic DOM differs (+1 −1 lines at line 69) |
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+2 −0 lines at line 22) |
| `dom` | `catalogue:home` | catalogue:home: semantic DOM differs (+1 −1 lines at line 48) |
| `dom` | `live:home` | live:home: semantic DOM differs (+2 −0 lines at line 22) |
| `dom` | `live:home` | live:home: semantic DOM differs (+1 −1 lines at line 44) |
| `dom` | `reader-auth:course` | reader-auth:course: semantic DOM differs (+1 −1 lines at line 56) |
| `dom` | `reader-auth:topic` | reader-auth:topic: semantic DOM differs (+1 −1 lines at line 74) |
| `dom` | `reference:course` | reference:course: semantic DOM differs (+1 −1 lines at line 113) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 147) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+1 −1 lines at line 100) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+1 −1 lines at line 163) |
| `dom` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: semantic DOM differs (+1 −1 lines at line 61) |
| `dom` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: semantic DOM differs (+1 −1 lines at line 51) |
| `dom` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: semantic DOM differs (+1 −1 lines at line 56) |
| `dom` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: semantic DOM differs (+2 −0 lines at line 22) |
| `dom` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: semantic DOM differs (+1 −1 lines at line 49) |
| `dom` | `live-auth:rule-0589-students` | live-auth:rule-0589-students: semantic DOM differs (+2 −0 lines at line 22) |
| `dom` | `live-auth:rule-0589-students` | live-auth:rule-0589-students: semantic DOM differs (+1 −1 lines at line 51) |
| `dom` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: semantic DOM differs (+1 −1 lines at line 131) |
| `dom` | `time-auth:rule-0590-calendar-byweek` | time-auth:rule-0590-calendar-byweek: semantic DOM differs (+1 −1 lines at line 87) |
| `dom` | `time-auth:rule-0590-calendar-byday` | time-auth:rule-0590-calendar-byday: semantic DOM differs (+1 −1 lines at line 105) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+1 −1 lines at line 102) |
| `dom` | `time-auth:rule-0591-lab-bystep` | time-auth:rule-0591-lab-bystep: semantic DOM differs (+1 −1 lines at line 106) |
| `dom` | `time-auth:rule-0591-learning-records` | time-auth:rule-0591-learning-records: semantic DOM differs (+1 −1 lines at line 98) |
| `dom` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: semantic DOM differs (+1 −1 lines at line 157) |
| `dom` | `reader-auth:rule-0582-course` | reader-auth:rule-0582-course: semantic DOM differs (+1 −1 lines at line 56) |
| `dom` | `reader-auth:rule-0582-lab-step` | reader-auth:rule-0582-lab-step: semantic DOM differs (+1 −1 lines at line 93) |
| `dom` | `reader-auth:rule-0582-lab-step-2` | reader-auth:rule-0582-lab-step-2: semantic DOM differs (+1 −1 lines at line 87) |
| `dom` | `reader-auth:rule-0582-lab-step-back` | reader-auth:rule-0582-lab-step-back: semantic DOM differs (+1 −1 lines at line 93) |
| `dom` | `reader-auth:rule-0583-profile-menu` | reader-auth:rule-0583-profile-menu: semantic DOM differs (+1 −1 lines at line 56) |
| `dom` | `reader-auth:rule-0584-talk-slide-2` | reader-auth:rule-0584-talk-slide-2: semantic DOM differs (+1 −1 lines at line 69) |
| `dom` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: semantic DOM differs (+1 −1 lines at line 74) |
| `dom` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: semantic DOM differs (+1 −1 lines at line 82) |
| `dom` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: semantic DOM differs (+1 −1 lines at line 57) |
| `dom` | `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: semantic DOM differs (+1 −1 lines at line 57) |
| `dom` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: semantic DOM differs (+2 −0 lines at line 24) |
| `dom` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: semantic DOM differs (+1 −1 lines at line 69) |
| `dom` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: semantic DOM differs (+2 −0 lines at line 24) |
| `dom` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: semantic DOM differs (+1 −1 lines at line 69) |
| `dom` | `reader-auth:rule-0587-llm` | reader-auth:rule-0587-llm: semantic DOM differs (+1 −1 lines at line 87) |
| `dom` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: semantic DOM differs (+1 −1 lines at line 65) |
| `screenshot` | `reader:home` | reader:home: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `screenshot` | `catalogue:home` | catalogue:home: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `screenshot` | `live:home` | live:home: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `screenshot` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `screenshot` | `live-auth:rule-0589-students` | live-auth:rule-0589-students: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: 0.12% of pixels differ in 116×125 at (31, 357) (threshold 0.10%) |
| `network` | `GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100` | reader:home: request no longer made on b: GET /__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=100 |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader:home: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader:home: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader:home: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader:home: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `network` | `GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100` | reader:course: request no longer made on b: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100` | reader:search: request no longer made on b: GET /course/localhost:8080/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10` | reader-auth:sign-in: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /actor` | reader-auth:sign-in: new request on b: GET /actor |
| `network` | `GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100` | reader-auth:course: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:course: new request on b: GET /actor |
| `network` | `GET /course/reference-course/__data.json?x-sveltekit-invalidated=100` | reference:course: request no longer made on b: GET /course/reference-course/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /note/reference-course/topic-07-reference/note-1/__data.json?x-sveltekit-invalidated=100` | reference:note: request no longer made on b: GET /note/reference-course/topic-07-reference/note-1/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0588-lecturer-locked: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0588-lecturer-locked: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0588-lecturer-locked: new request on b: GET /actor |
| `network` | `GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0588-student-hidden: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0588-student-hidden: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0588-student-hidden: new request on b: GET /actor |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0588-student-locked-card: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0588-student-locked-card: new request on b: GET /actor |
| `network` | `GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10` | live-auth:rule-0589-courses: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100` | live-auth:rule-0589-courses: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /lab/harness-fixture/unit-1/topic-01/book-lab-01/__data.json?x-sveltekit-invalidated=100` | live-auth:rule-0589-courses: request no longer made on b: GET /lab/harness-fixture/unit-1/topic-01/book-lab-01/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | live-auth:rule-0589-courses: new request on b: GET /actor |
| `network` | `GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0582-course: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0582-course: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0582-course: new request on b: GET /actor |
| `network` | `GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0583-profile-menu: request no longer made on b: GET /auth/harness-fixture/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0583-profile-menu: request no longer made on b: GET /course/harness-fixture/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0583-profile-menu: new request on b: GET /actor |
| `network` | `GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0584-talk-slide-2: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0584-talk-slide-2: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0584-talk-slide-2: new request on b: GET /actor |
| `network` | `GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0585-course-dark: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0585-course-dark: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0585-course-dark: new request on b: GET /actor |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader-auth:rule-0586-turned-away: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader-auth:rule-0586-turned-away: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0586-turned-away: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0586-turned-away: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader-auth:rule-0586-turned-away: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader-auth:rule-0586-turned-away: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `network` | `GET /actor` | reader-auth:rule-0586-turned-away: new request on b: GET /actor |
| `network` | `GET /_app/immutable/assets/23.{{hash}}.css` | reader-auth:rule-0586-turned-away-again: request no longer made on b: GET /_app/immutable/assets/23.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/23.{{hash}}.js` | reader-auth:rule-0586-turned-away-again: request no longer made on b: GET /_app/immutable/nodes/23.{{hash}}.js |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0586-turned-away-again: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /_app/immutable/assets/24.{{hash}}.css` | reader-auth:rule-0586-turned-away-again: new request on b: GET /_app/immutable/assets/24.{{hash}}.css |
| `network` | `GET /_app/immutable/nodes/24.{{hash}}.js` | reader-auth:rule-0586-turned-away-again: new request on b: GET /_app/immutable/nodes/24.{{hash}}.js |
| `network` | `GET /actor` | reader-auth:rule-0586-turned-away-again: new request on b: GET /actor |
| `network` | `GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0587-calendar-assessments: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0587-calendar-assessments: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0587-calendar-assessments: new request on b: GET /actor |
| `network` | `GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10` | reader-auth:rule-0592-stroke-saved: request no longer made on b: GET /auth/harness-rules/__data.json?x-sveltekit-invalidated=10 |
| `network` | `GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100` | reader-auth:rule-0592-stroke-saved: request no longer made on b: GET /course/harness-rules/__data.json?x-sveltekit-invalidated=100 |
| `network` | `GET /actor` | reader-auth:rule-0592-stroke-saved: new request on b: GET /actor |
| `metrics` | `reader/http_request_duration_seconds_count` | reader: http_request_duration_seconds_count moved by 62 on a and 31 on b under the same traffic |
| `metrics` | `reader/http_requests_total` | reader: http_requests_total moved by 62 on a and 31 on b under the same traffic |
| `logs` | `reader/info` | reader: info-level lines: 62 on a, 31 on b |
| `focus` | `reader:home` | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `catalogue:home` | catalogue:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `live:home` | live:home: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `live-auth:rule-0589-courses` | live-auth:rule-0589-courses: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `live-auth:rule-0589-students` | live-auth:rule-0589-students: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: keyboard order changed (12 stops on a, 12 on b) |
| `focus` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: keyboard order changed (12 stops on a, 12 on b) |
| `sbom` | `reader/apt` | reader: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `reader/libapt-pkg6.0` | reader: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/apt` | catalogue: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `catalogue/libapt-pkg6.0` | catalogue: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `live/apt` | live: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `live/libapt-pkg6.0` | live: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |
| `sbom` | `time/apt` | time: package bumped: apt 2.6.1 → 2.6.2 |
| `sbom` | `time/libapt-pkg6.0` | time: package bumped: libapt-pkg6.0 2.6.1 → 2.6.2 |

<details><summary>Detail of 62 difference(s)</summary>

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

`dom` `reader:search`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader:search-results`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `catalogue:home`

```
     - link "Time ↗":
       - /url: https://time.tutors.dev
+    - link "Validator ↗":
+      - /url: https://validator.tutors.dev
     - link "Create":
       - /url: https://tutors.dev/create
```

`dom` `catalogue:home`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `live:home`

```
     - link "Time ↗":
       - /url: https://time.tutors.dev
+    - link "Validator ↗":
+      - /url: https://validator.tutors.dev
     - link "Create":
       - /url: https://tutors.dev/create
```

`dom` `live:home`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader-auth:course`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader-auth:topic`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reference:course`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reference:topic`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reference:lab`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reference:note`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader-auth:rule-0588-lecturer-locked`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

`dom` `reader-auth:rule-0588-student-hidden`

```
     - text: An
     - link "Open Learning Web Toolkit":
-      - /url: /course/tutors-reference-manual
+      - /url: https://tutors.dev/course/tutors-reference-manual
     - text: ": Explore"
     - link "What’s New in Tutors":
```

… and 42 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | 7 findings (7 on production too) |
| catalogue | 1 finding (1 on production too) | holds | 7 findings (7 on production too) |
| live | 1 finding (1 on production too) | holds | 7 findings (7 on production too) |
| time | 1 finding (1 on production too) | holds | 7 findings (7 on production too) |

### Informing (81; 81 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/CVE-2026-123863` | reader: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/CVE-2026-123864` | reader: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/CVE-2026-123865` | reader: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/CVE-2026-123866` | reader: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/CVE-2026-123872` | reader: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/CVE-2026-123874` | reader: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `reader/CVE-2026-126051` | reader: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/CVE-2026-123863` | catalogue: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/CVE-2026-123864` | catalogue: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/CVE-2026-123865` | catalogue: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/CVE-2026-123866` | catalogue: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/CVE-2026-123872` | catalogue: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/CVE-2026-123874` | catalogue: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `catalogue/CVE-2026-126051` | catalogue: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/CVE-2026-123863` | live: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/CVE-2026-123864` | live: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/CVE-2026-123865` | live: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/CVE-2026-123866` | live: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/CVE-2026-123872` | live: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/CVE-2026-123874` | live: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `live/CVE-2026-126051` | live: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/CVE-2026-123863` | time: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/CVE-2026-123864` | time: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/CVE-2026-123865` | time: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/CVE-2026-123866` | time: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/CVE-2026-123872` | time: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/CVE-2026-123874` | time: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `vuln-ceiling` | `time/CVE-2026-126051` | time: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 182 → 185 immutable requests (JS 151 → 154, CSS 31 → 31), 1.7 MB → 1.7 MB; 7 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 528 KB → 528 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 539 KB → 539 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 1219 → 1243 immutable requests (JS 1046 → 1070, CSS 173 → 173), 12.8 MB → 12.8 MB; 22 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 129 → 131 immutable requests (JS 107 → 109, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live-auth` | live-auth: the asset graph changed: 187 → 190 immutable requests (JS 157 → 160, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `time-auth` | time-auth: the asset graph changed: 248 → 248 immutable requests (JS 214 → 214, CSS 34 → 34), 5.1 MB → 5.1 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 46× on b | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100` | replay:topic-02: request no longer made on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100` | replay:talk-01: request no longer made on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 43× on a, 44× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100` | replay:note-02: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100` | replay:lab-02-step-03: request no longer made on b: GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/chunks/{{hash}}.js` | replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 46× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100` | replay:missing-topic: request no longer made on b: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/url/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/body/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0587-calendar-assessments/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
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
| reader | vulns | 118 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 117 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 9 layers, 288.7 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 285.4 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 118 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 117 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 9 layers, 289.0 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 285.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 118 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 117 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 9 layers, 293.8 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 290.6 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 135 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 118 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 117 advisories, db built 2026-11-19T18:41:05Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.25 ms | 2.07 ms |
| b | 600 | 0 | 0 | 1.17 ms | 1.98 ms |

<details><summary>Informational (103)</summary>

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
- `vuln-ceiling` reader: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` reader: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` reader: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` reader: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` reader: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` reader: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` reader: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` catalogue: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` catalogue: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` catalogue: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` catalogue: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` catalogue: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` catalogue: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` catalogue: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` live: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` live: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` live: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` live: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` live: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` live: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` live: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` time: CVE-2026-123863 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` time: CVE-2026-123864 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` time: CVE-2026-123865 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` time: CVE-2026-123866 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` time: CVE-2026-123872 (High) in node@26.13.0 has a fix: 22.23.5, 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` time: CVE-2026-123874 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `vuln-ceiling` time: CVE-2026-126051 (High) in node@26.13.0 has a fix: 24.22.3, 26.13.1 (production too)
- `asset-graph` reader: the asset graph changed: 182 → 185 immutable requests (JS 151 → 154, CSS 31 → 31), 1.7 MB → 1.7 MB; 7 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 528 KB → 528 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 539 KB → 539 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 1219 → 1243 immutable requests (JS 1046 → 1070, CSS 173 → 173), 12.8 MB → 12.8 MB; 22 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 129 → 131 immutable requests (JS 107 → 109, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `asset-graph` live-auth: the asset graph changed: 187 → 190 immutable requests (JS 157 → 160, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn
- `asset-graph` time-auth: the asset graph changed: 248 → 248 immutable requests (JS 214 → 214, CSS 34 → 34), 5.1 MB → 5.1 MB; 0 network and 0 headers difference(s) are this churn
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 46× on b
- `replay` replay:topic-02: request no longer made on b: GET /topic/localhost:8080/unit-1/topic-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 40× on b
- `replay` replay:talk-01: request no longer made on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 43× on a, 44× on b
- `replay` replay:note-01: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b
- `replay` replay:note-02: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 41× on a, 42× on b
- `replay` replay:lab-02-step-03: request no longer made on b: GET /lab/localhost:8080/unit-1/topic-02/book-lab-01/Step-03/__data.json?x-sveltekit-invalidated=100
- `replay` replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 45× on a, 46× on b
- `replay` replay:missing-topic: request no longer made on b: GET /topic/localhost:8080/unit-1/no-such-topic/__data.json?x-sveltekit-invalidated=100
- `slo` reader-availability: 100.0% of 31 reader requests not 5xx on b (its /metrics across the journeys), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-availability: 100.0% of 600 reader requests not 5xx on b (the k6 load leg), objective 99.90% (harness floor; monorepo 99.50%): holds
- `slo` reader-latency: 100.0% of 31 reader requests under 1s on b (its /metrics across the journeys), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` reader-latency: 100.0% of 600 reader requests under 1s on b (the k6 load leg), objective 99.0% (harness floor; monorepo 95.0%): holds
- `slo` catalogue-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` catalogue-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-availability: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` live-latency: not evaluated on b: 5 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-availability: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` time-latency: not evaluated on b: 0 request(s) from its /metrics across the journeys, fewer than 20
- `slo` reader-latency-tail: 100.0% of 31 reader requests under 2.5s on b (its /metrics across the journeys), objective 99.0%: holds
- `slo` reader-latency-tail: 100.0% of 600 reader requests under 2.5s on b (the k6 load leg), objective 99.0%: holds
- `secrets-in-response` reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0587-calendar-assessments: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
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

<sub>harness 1.63.0 (5b80358d0332, contract 1.63.0) · 2026-11-20T12:53:19.153Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×272, request-id×272, etag×272, metrics-process×599, metrics-timing-histograms×32, third-party-requests×6987, persistence-stub-requests×290, oauth-callback-state×110, media-range-status×40, hashed-assets×20954, footer-tutors-version×844, transport-length×272, transport-connection×272, transport-keepalive×272</sub>


</details>
