## ❌ Release harness — release — FAIL

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0@sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` | `quay.io/tutors-sdk/tutors-reader:17.1.0-rc.1@sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0@sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` | `quay.io/tutors-sdk/tutors-catalogue:17.1.0-rc.1@sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0@sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` | `quay.io/tutors-sdk/tutors-live:17.1.0-rc.1@sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0@sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` | `quay.io/tutors-sdk/tutors-time:17.1.0-rc.1@sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:84aa66d82a6482006b0c92ed6db363ca244c5afea3d5673806560371e062f5c3` · rev `b146cca3900e` · version `17.1.0-rc.1` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:ecd47ce9b7cc160b8a913a31309e3b2aa637933988569d6aaedab3ae5fe78361` · rev `b146cca3900e` · version `17.1.0-rc.1` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:ca80e0e78a9b225b297ce4ccee1825204cd8fd501f3784829680ac4c0e49a6f9` · rev `b146cca3900e` · version `17.1.0-rc.1` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:786e81c15a7a9537d71845df7e46efe49e3706df3c27656ee7d8072ada164b90` · rev `b146cca3900e` · version `17.1.0-rc.1` |

- 199 unclaimed diff(s)
- A/A consulted: clean at 2026-11-03T01:59:57.657Z

### 199 unclaimed differences, 15 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `dom` semantic DOM differs (+# −# lines at line #) | 63 | reader, catalogue, live, time | 40: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 34 more | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `focus` keyboard order changed (# stops on a, # on b) | 40 | reader, catalogue, live, time | 40: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 34 more | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `sbom` package bumped (11 packages: `@asamuzakjp/dom-selector`, `dompurify`, `entities`, `isomorphic-dompurify`, `jsdom`, `tutors-catalogue`, `tutors-live`, `tutors-reader` and 3 more) | 32 | reader, catalogue, live, time | — | reader: package bumped: @asamuzakjp/dom-selector 9.2.4 → 10.0.5 |
| `screenshot` #% of pixels differ in #×# at (#, #) (threshold #%) | 25 | reader, catalogue, live, time | 25: `catalogue:home`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0582-lab-step`, `reader-auth:rule-0582-lab-step-2` and 19 more | reader:course: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `sbom` package added (10 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 2 more) | 13 | reader, catalogue, live, time | — | reader: package added: @supabase/auth-js@2.118.0 |
| `sbom` package removed (9 packages: `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/phoenix`, `@supabase/postgrest-js`, `@supabase/realtime-js`, `@supabase/storage-js`, `@supabase/supabase-js`, `iceberg-js` and 1 more) | 9 | time | — | time: package removed: @supabase/auth-js@2.117.2 |
| `image-manifest` # layer(s) on a, # on b | 4 | reader, catalogue, live, time | — | reader: 10 layer(s) on a, 9 on b |
| `image-manifest` label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte #, SvelteKit, and TypeScript." | 4 | reader, catalogue, live, time | — | reader: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built wi… |
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 2 | time | — | time: new series on b: http_request_duration_seconds_count |
| `network` new request on b: PUT /api/courses/harness-rules/locks | 2 | reader | 2: `reader-auth:rule-0588-lecturer-locked`, `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/harness-rules/locks |
| `dom` journey "rule-#-calendar-llm" completed on a but failed on b | 1 | — | — | journey "rule-0587-calendar-llm" completed on a but failed on b |
| `logs` info-level lines (1 field: `info`) | 1 | reader | — | reader-auth: info-level lines: 430 on a, 1315 on b |
| `logs` wrote no log line on b (# on a): nothing reached it, or it stopped logging | 1 | time | — | time: wrote no log line on b (2 on a): nothing reached it, or it stopped logging |
| `persistence` RPC record_heartbeat — # row(s) on a, # on b | 1 | — | — | rule-0587-calendar-llm: RPC record_heartbeat — 0 row(s) on a, 1 on b |
| `persistence` RPC record_page_view — # row(s) on a, # on b | 1 | — | — | rule-0587-calendar-llm: RPC record_page_view — 2 row(s) on a, 1 on b |

Moved together on the same pages, so likely one change each:

- `dom`, `focus`, `screenshot` on 22 pages (80 differences): `catalogue:home`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course`, `reader-auth:rule-0582-lab-step`, `reader-auth:rule-0582-lab-step-2` and 16 more
- `dom`, `focus` on 16 pages (39 differences): `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `reader-auth:rule-0584-talk-slide-2`, `reader-auth:rule-0586-turned-away`, `reader-auth:rule-0586-turned-away-again`, `reader-auth:rule-0592-stroke-saved` and 10 more
- `dom`, `focus`, `network`, `screenshot` on 2 pages (10 differences): `reader-auth:rule-0588-lecturer-locked`, `reader-auth:rule-0588-student-locked-card`

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0591-time-labs`: Rule 0591 (exercises 0319): 16 differences in dom, focus, screenshot
- `rule-0588-content-lock`: Rule 0588 (exercises 0052, 0053, 0054): 14 differences in dom, focus, network, screenshot
- `rule-0582-signed-in-lab`: Rule 0582 (exercises 0011, 0250, 0252, 0260, 0303, 0330): 12 differences in dom, focus, screenshot
- `rule-0584-quiz-notebook-talk`: Rule 0584 (exercises 0047, 0049, 0050): 11 differences in dom, focus, screenshot
- `rule-0585-preferences`: Rule 0585 (exercises 0037, 0038, 0039): 8 differences in dom, focus, screenshot
- `rule-0590-time-calendar`: Rule 0590 (exercises 0319): 8 differences in dom, focus, screenshot
- `rule-0586-private-course`: Rule 0586 (exercises 0011, 0267): 6 differences in dom, focus
- `rule-0583-presence`: Rule 0583 (exercises 0046, 0064, 0280): 4 differences in dom, focus, screenshot
- `rule-0589-live`: Rule 0589 (exercises 0330, 0335): 4 differences in dom, focus
- `rule-0587-calendar-llm`: Rule 0587 (exercises 0042, 0284): 3 differences in dom, persistence
- `rule-0592-whiteboard`: Rule 0592 (exercises 0275, 0276): 3 differences in dom, focus

### Unclaimed differences (199)

| artefact | scope | what changed |
|---|---|---|
| `dom` | `rule-0587-calendar-llm` | journey "rule-0587-calendar-llm" completed on a but failed on b |
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
| `dom` | `reference:course` | reference:course: semantic DOM differs (+1 −1 lines at line 21) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reference:topic` | reference:topic: semantic DOM differs (+1 −1 lines at line 26) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reference:lab` | reference:lab: semantic DOM differs (+1 −1 lines at line 55) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reference:note` | reference:note: semantic DOM differs (+1 −1 lines at line 26) |
| `dom` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: semantic DOM differs (+1 −1 lines at line 19) |
| `dom` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: semantic DOM differs (+1 −1 lines at line 19) |
| `dom` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: semantic DOM differs (+1 −1 lines at line 19) |
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
| `dom` | `reader-auth:rule-0584-talk-slide-2` | reader-auth:rule-0584-talk-slide-2: semantic DOM differs (+1 −1 lines at line 23) |
| `dom` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: semantic DOM differs (+1 −1 lines at line 29) |
| `dom` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: semantic DOM differs (+1 −1 lines at line 23) |
| `dom` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: semantic DOM differs (+1 −1 lines at line 19) |
| `dom` | `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: semantic DOM differs (+1 −1 lines at line 9) |
| `dom` | `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: semantic DOM differs (+1 −1 lines at line 19) |
| `dom` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader-auth:rule-0586-turned-away` | reader-auth:rule-0586-turned-away: semantic DOM differs (+1 −8 lines at line 60) |
| `dom` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: semantic DOM differs (+1 −8 lines at line 60) |
| `dom` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: semantic DOM differs (+1 −1 lines at line 23) |
| `screenshot` | `reader:course` | reader:course: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader:topic` | reader:topic: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader:lab-step` | reader:lab-step: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader:lab-step-2` | reader:lab-step-2: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `catalogue:home` | catalogue:home: 1.06% of pixels differ in 950×563 at (289, 197) (threshold 0.10%) |
| `screenshot` | `live:home` | live:home: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:course` | reader-auth:course: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:topic` | reader-auth:topic: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reference:lab` | reference:lab: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0588-lecturer-locked` | reader-auth:rule-0588-lecturer-locked: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0588-student-hidden` | reader-auth:rule-0588-student-hidden: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0588-student-locked-card` | reader-auth:rule-0588-student-locked-card: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0590-medians` | time-auth:rule-0590-medians: 0.49% of pixels differ in 950×195 at (289, 605) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: 0.23% of pixels differ in 84×246 at (857, 271) (threshold 0.10%) |
| `screenshot` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: 0.48% of pixels differ in 310×194 at (317, 606) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0582-course` | reader-auth:rule-0582-course: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0582-lab-step` | reader-auth:rule-0582-lab-step: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0582-lab-step-2` | reader-auth:rule-0582-lab-step-2: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0582-lab-step-back` | reader-auth:rule-0582-lab-step-back: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0583-profile-menu` | reader-auth:rule-0583-profile-menu: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0583-online-list` | reader-auth:rule-0583-online-list: 0.21% of pixels differ in 444×13 at (390, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0584-notebook-cell-2` | reader-auth:rule-0584-notebook-cell-2: 0.24% of pixels differ in 445×13 at (389, 747) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0584-quiz-results` | reader-auth:rule-0584-quiz-results: 0.11% of pixels differ in 335×16 at (355, 473) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0585-course-dark` | reader-auth:rule-0585-course-dark: 0.17% of pixels differ in 532×13 at (413, 749) (threshold 0.10%) |
| `screenshot` | `reader-auth:rule-0585-preferences-after-reload` | reader-auth:rule-0585-preferences-after-reload: 0.17% of pixels differ in 532×13 at (413, 749) (threshold 0.10%) |
| `network` | `PUT /api/courses/harness-rules/locks` | reader-auth:rule-0588-lecturer-locked: new request on b: PUT /api/courses/harness-rules/locks |
| `network` | `PUT /api/courses/harness-rules/locks` | reader-auth:rule-0588-student-locked-card: new request on b: PUT /api/courses/harness-rules/locks |
| `metrics` | `time/http_request_duration_seconds_count` | time: new series on b: http_request_duration_seconds_count |
| `metrics` | `time/http_requests_total` | time: new series on b: http_requests_total |
| `logs` | `time/silent` | time: wrote no log line on b (2 on a): nothing reached it, or it stopped logging |
| `logs` | `reader-auth/info` | reader-auth: info-level lines: 430 on a, 1315 on b |
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
| `focus` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: keyboard order changed (12 stops on a, 12 on b) |
| `persistence` | `rule-0587-calendar-llm/record_heartbeat` | rule-0587-calendar-llm: RPC record_heartbeat — 0 row(s) on a, 1 on b |
| `persistence` | `rule-0587-calendar-llm/record_page_view` | rule-0587-calendar-llm: RPC record_page_view — 2 row(s) on a, 1 on b |
| `image-manifest` | `reader/layers` | reader: 10 layer(s) on a, 9 on b |
| `image-manifest` | `reader/label/org.opencontainers.image.description` | reader: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `reader/@asamuzakjp/dom-selector` | reader: package bumped: @asamuzakjp/dom-selector 9.2.4 → 10.0.5 |
| `sbom` | `reader/@supabase/auth-js` | reader: package added: @supabase/auth-js@2.118.0 |
| `sbom` | `reader/@supabase/functions-js` | reader: package added: @supabase/functions-js@2.118.0 |
| `sbom` | `reader/@supabase/phoenix` | reader: package added: @supabase/phoenix@0.4.5 |
| `sbom` | `reader/@supabase/postgrest-js` | reader: package added: @supabase/postgrest-js@2.118.0 |
| `sbom` | `reader/@supabase/realtime-js` | reader: package added: @supabase/realtime-js@2.118.0 |
| `sbom` | `reader/@supabase/storage-js` | reader: package added: @supabase/storage-js@2.118.0 |
| `sbom` | `reader/@supabase/supabase-js` | reader: package added: @supabase/supabase-js@2.118.0 |
| `sbom` | `reader/dompurify` | reader: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `reader/entities` | reader: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `reader/iceberg-js` | reader: package added: iceberg-js@0.8.1 |
| `sbom` | `reader/isomorphic-dompurify` | reader: package bumped: isomorphic-dompurify 4.5.0 → 4.6.0 |
| `sbom` | `reader/jsdom` | reader: package bumped: jsdom 30.1.2 → 30.1.3 |
| `sbom` | `reader/libatomic1` | reader: package added: libatomic1@12.2.0-14+deb12u1 |
| `sbom` | `reader/tslib` | reader: package added: tslib@2.8.1 |
| `sbom` | `reader/tutors-reader` | reader: package bumped: tutors-reader 17.0.0 → 17.1.0 |
| `sbom` | `reader/tzdata` | reader: package bumped: tzdata 2026c-0+deb12u1 → 2026f-0+deb12u1 |
| `sbom` | `reader/undici` | reader: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `catalogue/layers` | catalogue: 10 layer(s) on a, 9 on b |
| `image-manifest` | `catalogue/label/org.opencontainers.image.description` | catalogue: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `catalogue/@asamuzakjp/dom-selector` | catalogue: package bumped: @asamuzakjp/dom-selector 9.2.4 → 10.0.5 |
| `sbom` | `catalogue/dompurify` | catalogue: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `catalogue/entities` | catalogue: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `catalogue/isomorphic-dompurify` | catalogue: package bumped: isomorphic-dompurify 4.5.0 → 4.6.0 |
| `sbom` | `catalogue/jsdom` | catalogue: package bumped: jsdom 30.1.2 → 30.1.3 |
| `sbom` | `catalogue/libatomic1` | catalogue: package added: libatomic1@12.2.0-14+deb12u1 |
| `sbom` | `catalogue/tutors-catalogue` | catalogue: package bumped: tutors-catalogue 17.0.0 → 17.1.0 |
| `sbom` | `catalogue/tzdata` | catalogue: package bumped: tzdata 2026c-0+deb12u1 → 2026f-0+deb12u1 |
| `sbom` | `catalogue/undici` | catalogue: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `live/layers` | live: 10 layer(s) on a, 9 on b |
| `image-manifest` | `live/label/org.opencontainers.image.description` | live: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `live/@asamuzakjp/dom-selector` | live: package bumped: @asamuzakjp/dom-selector 9.2.4 → 10.0.5 |
| `sbom` | `live/dompurify` | live: package bumped: dompurify 3.4.16 → 3.4.17 |
| `sbom` | `live/entities` | live: package bumped: entities 8.0.0 → 8.1.0 |
| `sbom` | `live/isomorphic-dompurify` | live: package bumped: isomorphic-dompurify 4.5.0 → 4.6.0 |
| `sbom` | `live/jsdom` | live: package bumped: jsdom 30.1.2 → 30.1.3 |
| `sbom` | `live/libatomic1` | live: package added: libatomic1@12.2.0-14+deb12u1 |
| `sbom` | `live/tutors-live` | live: package bumped: tutors-live 17.0.0 → 17.1.0 |
| `sbom` | `live/tzdata` | live: package bumped: tzdata 2026c-0+deb12u1 → 2026f-0+deb12u1 |
| `sbom` | `live/undici` | live: package bumped: undici 8.11.2 → 8.12.3 |
| `image-manifest` | `time/layers` | time: 10 layer(s) on a, 9 on b |
| `image-manifest` | `time/label/org.opencontainers.image.description` | time: label org.opencontainers.image.description "" → "The Tutors educational platform - an open-source course reader and learning management system built with Svelte 5, SvelteKit, and TypeScript." |
| `sbom` | `time/@asamuzakjp/dom-selector` | time: package bumped: @asamuzakjp/dom-selector 9.2.4 → 10.0.5 |
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
| `sbom` | `time/isomorphic-dompurify` | time: package bumped: isomorphic-dompurify 4.5.0 → 4.6.0 |
| `sbom` | `time/jsdom` | time: package bumped: jsdom 30.1.2 → 30.1.3 |
| `sbom` | `time/libatomic1` | time: package added: libatomic1@12.2.0-14+deb12u1 |
| `sbom` | `time/tslib` | time: package removed: tslib@2.8.1 |
| `sbom` | `time/tutors-time` | time: package bumped: tutors-time 17.0.0 → 17.1.0 |
| `sbom` | `time/tzdata` | time: package bumped: tzdata 2026c-0+deb12u1 → 2026f-0+deb12u1 |
| `sbom` | `time/undici` | time: package bumped: undici 8.11.2 → 8.12.3 |

<details><summary>Detail of 129 difference(s)</summary>

`dom` `rule-0587-calendar-llm`

```
step "When the student presses the button starting "View Calendar"" (traffic/journeys/features/student.feature:108) failed: locator.click: Timeout 30000ms exceeded.
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

`dom` `reference:course`

```
     - link "Resources":
       - /url: /search/reference-course
-    - button "View Calendar for this course": Calendar This week · Control Flow (if statements)
+    - button "Calendar This week · Control Flow (if statements), View Calendar for this course": Calendar This week · Control Flow (if statements)
     - link "A version of this course for LLMs":
       - /url: /llm/reference-course
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

`dom` `reference:topic`

```
     - link "Resources":
       - /url: /search/reference-course
-    - button "View Calendar for this course": Calendar This week · Control Flow (if statements)
+    - button "Calendar This week · Control Flow (if statements), View Calendar for this course": Calendar This week · Control Flow (if statements)
     - link "A version of this course for LLMs":
       - /url: /llm/reference-course
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

`dom` `reference:lab`

```
     - link "Resources":
       - /url: /search/reference-course
-    - button "View Calendar for this course": Calendar This week · Control Flow (if statements)
+    - button "Calendar This week · Control Flow (if statements), View Calendar for this course": Calendar This week · Control Flow (if statements)
     - link "A version of this course for LLMs":
       - /url: /llm/reference-course
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

… and 109 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | 1 finding (1 on production too) | holds | holds |
| catalogue | 1 finding (1 on production too) | holds | holds |
| live | 1 finding (1 on production too) | holds | holds |
| time | 1 finding (1 on production too) | holds | holds |

### Informing (47; 47 unclaimed): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `image-hardening` | `reader/unrecorded-base` | reader: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `catalogue/unrecorded-base` | catalogue: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `live/unrecorded-base` | live: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `image-hardening` | `time/unrecorded-base` | time: records no base image (no org.opencontainers.image.base.name label), so a base that moved upstream reads as a rebuild no PR declared (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 173 → 182 immutable requests (JS 142 → 151, CSS 31 → 31), 1.6 MB → 1.7 MB; 3 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 528 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 539 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 1064 → 1118 immutable requests (JS 904 → 958, CSS 160 → 160), 11.7 MB → 11.8 MB; 12 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 129 immutable requests (JS 99 → 107, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live-auth` | live-auth: the asset graph changed: 179 → 187 immutable requests (JS 149 → 157, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `time-auth` | time-auth: the asset graph changed: 269 → 248 immutable requests (JS 235 → 214, CSS 34 → 34), 5.1 MB → 5.1 MB; 7 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:topic-02 GET {{course}}/tutors.json` | replay:topic-02: request no longer made on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:topic-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 45× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET {{course}}/tutors.json` | replay:talk-01: GET {{course}}/tutors.json requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 42× on b | no date set | unclaimed |
| `replay` | `replay:note-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 41× on b | no date set | unclaimed |
| `replay` | `replay:note-02 GET /_app/immutable/chunks/{{hash}}.js` | replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 41× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 41× on b | no date set | unclaimed |
| `replay` | `replay:missing-topic GET /_app/immutable/chunks/{{hash}}.js` | replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 45× on b | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-student-hidden/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/body/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `live-auth:rule-0589-courses/url/PRIVATE_AUTH_GITHUB_ID` | live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0582-course/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0586-turned-away/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0592-stroke-saved/url/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0588-lecturer-locked/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0585-course-dark/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0583-profile-menu/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `secrets-in-response` | `reader-auth:rule-0584-talk-slide-2/body/PRIVATE_AUTH_GITHUB_ID` | reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/strict-transport-security` | catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `catalogue/content-security-policy` | catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `live/strict-transport-security` | live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `live/content-security-policy` | live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/strict-transport-security` | reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `reader/content-security-policy` | reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |
| `headers-policy` | `time/strict-transport-security` | time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too) | no date set | unclaimed |
| `headers-policy` | `time/content-security-policy` | time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too) | no date set | unclaimed |

### Claimed differences (142)

| artefact | scope | claimed by |
|---|---|---|
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/time/harness-rules` | CHANGELOG Unreleased (Time): the dashboard loads time data from the reader |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/time/harness-rules` | CHANGELOG Unreleased (Time): the dashboard loads time data from the reader |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/time/harness-rules` | CHANGELOG Unreleased (Time): the dashboard loads time data from the reader |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/time/harness-rules` | CHANGELOG Unreleased (Time): the dashboard loads time data from the reader |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/time/harness-rules` | CHANGELOG Unreleased (Time): the dashboard loads time data from the reader |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/time/harness-rules` | CHANGELOG Unreleased (Time): the dashboard loads time data from the reader |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/time/harness-rules` | CHANGELOG Unreleased (Time): the dashboard loads time data from the reader |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PATCH /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/presence` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `GET /api/whiteboard?courseId=harness-rules&route=%2Fwhiteboard%2Fharness-rules%2Funit-1%2Ftopic-01%2Fwhiteboard-01&shared=false` | Rule 0068: a signed-in student's whiteboard edits are saved through the server, in a room only its owner can read or overwrite |
| `network` | `POST /api/analytics` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `POST /api/courses/visit` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/me` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/profile` | Rule 0072: the reader stores a signed-in student's data through its /api routes, under the session's login |
| `network` | `PUT /api/whiteboard` | Rule 0068: a signed-in student's whiteboard edits are saved through the server, in a room only its owner can read or overwrite |
| `logs` | `reader-auth/courseId` | CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320) |
| `logs` | `reader-auth/role` | CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320) |
| `persistence` | `student-signs-in/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |
| `persistence` | `rule-0589-live/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |
| `persistence` | `rule-0589-live/realtime_watch` | Rule 0334: While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. — Rule 0334: while it shows a course or the platform feed, Tutors Live reports itself as a watcher of that feed through realtime_watch every 60 seconds (#481) |
| `persistence` | `rule-0582-signed-in-lab/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |
| `persistence` | `rule-0583-presence/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |
| `persistence` | `rule-0586-private-course/tutors-connect-courses` | Rule 0072: student rows are written by the reader's server under the session's login, not by the browser |
| `persistence` | `rule-0586-private-course/tutors-connect-profiles` | Rule 0072: student rows are written by the reader's server under the session's login, not by the browser |
| `image-manifest` | `reader/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `sbom` | `reader/node` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `image-manifest` | `catalogue/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `sbom` | `catalogue/node` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `image-manifest` | `live/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `sbom` | `live/node` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `image-manifest` | `time/base` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |
| `sbom` | `time/node` | Rule 0667: Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. — Rule 0667: the Node base image is pinned by digest, node 22.23.3 -> 22.23.4 in every image (PR #541) |

### Claim hygiene

11 claim(s) cover 142 failing hunk(s): 12.91 hunk(s) per claim, at most 83 under one claim (flagged above 10).

| artefact | scope | hunks | flag |
|---|---|---|---|
| `network` | `* /api/{me,profile,presence,analytics,courses/visit}` | 83 | covers more than 10 hunks |
| `network` | `GET /_app/immutable/chunks/\{\{hash\}\}.js` | 25 | covers more than 10 hunks |

A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 329.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 144 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 113 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 288.7 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 113 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 289.0 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 113 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 9 layers, 293.8 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 135 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 113 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 95 advisories, db built 2026-11-02T06:26:52Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 601 | 0 | 0 | 1.29 ms | 2.03 ms |
| b | 601 | 0 | 0 | 1.14 ms | 2.04 ms |

<details><summary>Informational (180)</summary>

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
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.15 / b 0 per reader page (broadcasts a 18 / b 0, socket data frames a 5 / b 0, over 20 page view(s))
- `vulns` reader: CVE-2026-105481 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-105482 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-106069 (High) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-106072 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-106073 (Low) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-106074 (Medium) is present on a and gone on b (fixed)
- `vulns` reader: CVE-2026-111497 (Critical) is present on a and gone on b (fixed)
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
- `vulns` catalogue: CVE-2026-105481 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-105482 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-106069 (High) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-106072 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-106073 (Low) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-106074 (Medium) is present on a and gone on b (fixed)
- `vulns` catalogue: CVE-2026-111497 (Critical) is present on a and gone on b (fixed)
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
- `vulns` live: CVE-2026-105481 (Medium) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-105482 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-106069 (High) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-106072 (Medium) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-106073 (Low) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-106074 (Medium) is present on a and gone on b (fixed)
- `vulns` live: CVE-2026-111497 (Critical) is present on a and gone on b (fixed)
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
- `vulns` time: CVE-2026-105481 (Medium) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-105482 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-106069 (High) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-106072 (Medium) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-106073 (Low) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-106074 (Medium) is present on a and gone on b (fixed)
- `vulns` time: CVE-2026-111497 (Critical) is present on a and gone on b (fixed)
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
- `build-provenance` reader: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `build-provenance` catalogue: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `build-provenance` live: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `build-provenance` time: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/tags/v17.1.0-rc.1
- `vuln-ceiling` reader: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 95 advisories scanned, 18 critical or high, none with a fix available
- `asset-graph` reader: the asset graph changed: 173 → 182 immutable requests (JS 142 → 151, CSS 31 → 31), 1.6 MB → 1.7 MB; 3 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 528 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 539 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 1064 → 1118 immutable requests (JS 904 → 958, CSS 160 → 160), 11.7 MB → 11.8 MB; 12 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 129 immutable requests (JS 99 → 107, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `asset-graph` live-auth: the asset graph changed: 179 → 187 immutable requests (JS 149 → 157, CSS 30 → 30), 2.1 MB → 2.1 MB; 1 network and 0 headers difference(s) are this churn
- `asset-graph` time-auth: the asset graph changed: 269 → 248 immutable requests (JS 235 → 214, CSS 34 → 34), 5.1 MB → 5.1 MB; 7 network and 0 headers difference(s) are this churn
- `replay` replay:topic-02: request no longer made on b: GET {{course}}/tutors.json
- `replay` replay:topic-02: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 45× on b
- `replay` replay:talk-01: GET {{course}}/tutors.json requested 1× on a, 2× on b
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 42× on b
- `replay` replay:note-01: GET /_app/immutable/chunks/{{hash}}.js requested 40× on a, 41× on b
- `replay` replay:note-02: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 41× on b
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 38× on a, 41× on b
- `replay` replay:missing-topic: GET /_app/immutable/chunks/{{hash}}.js requested 42× on a, 45× on b
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
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-student-hidden: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` live-auth:rule-0589-courses: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0582-course: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0586-turned-away: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0592-stroke-saved: the a response URL holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0588-lecturer-locked: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0585-course-dark: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0583-profile-menu: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `secrets-in-response` reader-auth:rule-0584-talk-slide-2: the a response body holds PRIVATE_AUTH_GITHUB_ID: the value of PRIVATE_AUTH_GITHUB_ID, which the stack sets as a server-only secret (production too)
- `headers-policy` catalogue: catalogue:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` catalogue: catalogue:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` live: live:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` live: live:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` reader: reader:home sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` reader: reader:home sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Strict-Transport-Security: Pins HTTPS for at least ~115 days. Browsers ignore it over plain HTTP, so sending it locally is harmless. (production too)
- `headers-policy` time: time-auth:rule-0590-medians sends no Content-Security-Policy: Limits where scripts, frames and styles may load from; the main defence if course markdown ever renders unsafe HTML. (production too)

</details>

<sub>harness 1.60.0 (5678e03ccebb, contract 1.60.0) · 2026-11-03T12:18:35.239Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×267, request-id×267, etag×267, metrics-process×599, metrics-timing-histograms×22, third-party-requests×6869, persistence-stub-requests×1430, oauth-callback-state×105, media-range-status×44, hashed-assets×19951, footer-tutors-version×835, transport-length×267, transport-connection×267, transport-keepalive×267</sub>
