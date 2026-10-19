## Release gate: sha-8534430 beside 17.0.0

**Gate: WARN**

#### New since the last forecast

**6 new, 0 gone** in the unclaimed set since the forecast of 2026-10-19T02:24:07.366Z (`sha-83d4ccf`), beside the same baseline `17.0.0`. By artefact: metrics +2 −0 · startup +4 −0.

| artefact | scope | what |
| --- | --- | --- |
| metrics | time/http_request_duration_seconds_count | time: new series on b: http_request_duration_seconds_count |
| metrics | time/http_requests_total | time: new series on b: http_requests_total |
| startup | catalogue/ready | catalogue: ready slower on b: median 2490 ms → 5395 ms (+117%), p=0.012, n=5/5 |
| startup | live/ready | live: ready slower on b: median 2446 ms → 5439 ms (+122%), p=0.012, n=5/5 |
| startup | reader/ready | reader: ready slower on b: median 2429 ms → 5462 ms (+125%), p=0.012, n=5/5 |
| startup | time/ready | time: ready slower on b: median 2384 ms → 5428 ms (+128%), p=0.012, n=5/5 |

#### Causes and the PRs behind them

6 causes, 6 with a PR named, 1 declared in that PR's CHANGELOG line (claimed from it when the release is cut, nothing owed on main). Merged since the forecast of `sha-83d4ccf`: [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500), [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501), [#502](https://github.com/tutors-sdk/tutors-mono-repo/pull/502). 2 causes are new since then, and only these PRs can have made them. The others are matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.

| cause | differences | PRs |
| --- | --- | --- |
| **new** startup: ready slower on b | 4 | [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) (1 file); not declared: #501's CHANGELOG line says (image-hardening, image-manifest, metrics) |
| **new** metrics: new series on b | 2 | [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500) (1 file), [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) (1 file, 0 direct); declared by #501 (image-hardening, image-manifest, metrics) |
| dom: semantic DOM differs (+# −# lines at line #) | 41 | [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (4 files), [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500) (4 files), [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct) and 6 more |
| focus: keyboard order changed (# stops on a, # on b) | 41 | [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) (4 files), [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500) (4 files), [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct) and 6 more |
| persistence: RPC realtime_claim_live_publish — # row(s) on a, # on b | 3 | [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct), [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) (6 files, 1 direct), [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) (1 file) and 6 more |
| persistence: RPC realtime_watch — # row(s) on a, # on b | 1 | [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) (13 files, 1 direct), [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) (6 files, 1 direct), [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) (1 file) and 6 more |

**RCS 37 Red: hold, open a 5 Whys, do not re-run hoping for a better number**

#### Claims owed (5, and 1 declared)

1 of the 6 drafts is declared in a PR's CHANGELOG line (#501) and carries that line as the reason: nothing is owed on main, and the release author pastes it when the release is cut. 5 are owed. One draft claim per cause, its scope narrowed and checked against this forecast's unclaimed differences: together they cover all 92, and none takes another cause's. Paste them under `claims:` in `release/claims.yaml` and name the Rule that intends each (`rule: "????"` is refused until you do), or drop `rule` and give the CHANGELOG entry as the reason, or fix the difference and drop its draft. On a forecast this takes the glance's place; the glance stays for release candidates.

```yaml
  # dom: semantic DOM differs (+# −# lines at line #): covers its 41 differences. Name the Rule that intends it, or fix it.
  - artefact: "dom"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "semantic DOM differs (+# −# lines at line #): 41 differences (reader, catalogue, live, time; 41 pages); likely #483, #500, #478"
  # focus: keyboard order changed (# stops on a, # on b): covers its 41 differences. Name the Rule that intends it, or fix it.
  - artefact: "focus"
    scope: "{catalogue:home,live-auth:rule-0589-courses,live-auth:rule-0589-students,live:home,reader-auth:course,reader-auth:rule-0582-course,reader-auth:rule-0582-lab-step,reader-auth:rule-0582-lab-step-2,reader-auth:rule-0582-lab-step-back,reader-auth:rule-0583-profile-menu,reader-auth:rule-0584-notebook-cell-2,reader-auth:rule-0584-quiz-results,reader-auth:rule-0584-talk-slide-2,reader-auth:rule-0585-course-dark,reader-auth:rule-0585-preferences-after-reload,reader-auth:rule-0586-turned-away,reader-auth:rule-0586-turned-away-again,reader-auth:rule-0587-llm,reader-auth:rule-0588-lecturer-locked,reader-auth:rule-0588-student-hidden,reader-auth:rule-0588-student-locked-card,reader-auth:rule-0592-stroke-saved,reader-auth:topic,reader:course,reader:home,reader:lab-step,reader:lab-step-2,reader:search,reader:search-results,reader:topic,reference:course,reference:lab,reference:note,reference:topic,time-auth:rule-0590-calendar-byday,time-auth:rule-0590-calendar-byweek,time-auth:rule-0590-medians,time-auth:rule-0591-lab-bylab,time-auth:rule-0591-lab-bystep,time-auth:rule-0591-learning-records,time-auth:rule-0591-student}"
    rule: "????"
    reason: "keyboard order changed (# stops on a, # on b): 41 differences (reader, catalogue, live, time; 41 pages); likely #483, #500, #478"
  # startup: ready slower on b: covers its 4 differences. Name the Rule that intends it, or fix it.
  - artefact: "startup"
    scope: "*/ready"
    rule: "????"
    reason: "ready slower on b: 4 differences (reader, catalogue, live, time; 1 name); likely #501"
  # persistence: RPC realtime_claim_live_publish — # row(s) on a, # on b: covers its 3 differences. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "*/realtime_claim_live_publish"
    rule: "????"
    reason: "RPC realtime_claim_live_publish — # row(s) on a, # on b: 3 differences; likely #478, #481, #476"
  # metrics: new series on b: covers its 2 differences. Declared by #501 in its CHANGELOG line: ready to paste when the release is cut.
  - artefact: "metrics"
    scope: "time/http_{request_duration_seconds_count,requests_total}"
    reason: "CHANGELOG: feat(image): declare a HEALTHCHECK and expose request SLIs from start (#501)"
  # persistence: RPC realtime_watch — # row(s) on a, # on b: covers its 1 difference. Name the Rule that intends it, or fix it.
  - artefact: "persistence"
    scope: "rule-0589-live/realtime_watch"
    rule: "????"
    reason: "RPC realtime_watch — # row(s) on a, # on b: 1 difference; likely #478, #481, #476"
```

weighted mean 37.65 over 6 of 8 dimensions measured (weight 85 of 100, renormalised); the rest are not measured and not counted.

| dimension | weight | score | floor | where it lost points |
| --- | --- | --- | --- | --- |
| Claim coverage | 20 | **0** |  | −20 unclaimed: dom /: reader:home: semantic DOM differs (+1 −1 lines at line 10); −20 unclaimed: dom /course/localhost:8080: reader:course: semantic DOM differs (+1 −1 lines at line 9); −20 unclaimed: dom /topic/localhost:8080/unit-1/topic-01: reader:topic: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01: reader:lab-step: semantic DOM differs (+1 −1 lines at line 8); −20 unclaimed: dom /lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-01: reader:lab-step-2: semantic DOM differs (+1 −1 lines at line 8) (and 87 more like it, not counted again: report.html#differences) |
| Noise health | 15 | **40** | **breached** | −40 the A/A of 2026-10-19T08:10:00.716Z had 1 diff: differences may be noise; −5 mask realtime-rest-fallback-warning fired nothing in this run (a mask that never fires is a mask to delete); −5 mask chromium-compute-pressure-policy fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-encoding fired nothing in this run (a mask that never fires is a mask to delete); −5 mask transport-transfer fired nothing in this run (a mask that never fires is a mask to delete) |
| Statistical margin | 10 | **100** |  | — |
| Rehearsals | 10 | **100** |  | — |
| Test signal | 15 | **40** | **breached** | −30 mutation score 72.73% on @tutors/i18n, below 80%; −30 mutation score 55.11% on @tutors/ui-navigators, below 80% |
| Requirements traceability | 10 | not measured |  | needs the changelog, the EARS files and the claims side by side: pass --traceability <json>; changes.json already reports 12 orphan changes between the tags (a changelog entry with no diff, or a diff with no entry), a floor breach once it is measured |
| Change risk | 15 | **0** |  | −10 PR #476 changed Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −3 PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases); −10 PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #481 changed Reader, Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #484 changed Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #487 changed Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #504 changed Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −3 PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more; −10 PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2; −10 PR #505 changed Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #501 changed Infrastructure, Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it; −10 PR #502 changed Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it |
| Post-deploy history | 5 | not measured |  | needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json> |

_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._

#### Change risk per PR

**Change risk 0 (100 − 136), v17.0.0..8534430cb0681d2f21383b56e7227bfbf35bfd2c: 12 of 14 PRs carry a finding.**

| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#505](https://github.com/tutors-sdk/tutors-mono-repo/pull/505) | fix(a11y): button names contain their visible text | 47 | 15 | 4 | 1.76 | yes |  | **−23** | −3 [PR #505 touches 4 hotspots packages/svelte/utils/i18n/src/messages/fr.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/es.ts (3 of the last 6 releases), packages/svelte/utils/i18n/src/messages/de.ts (3 of the last 6 releases) and 1 more](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-6b04260c901911736eca0c9f57d6921cf6ec7c4c4308d209b08bfb4774bc8741); −10 [PR #505 changed 11 production lines in packages/svelte/ui-navigators with 2 test lines (0.18): below 0.2](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-d4a40094af72b0eb12eea04ebee4e682bfc581553326bf472d1c2f849c7c623b); −10 [PR #505 changed Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/505/files#diff-4be7739a1047b396bc6d3e9502bee98cfdd9bde50bfcb576e9df02edfd063dd3) |
| [#478](https://github.com/tutors-sdk/tutors-mono-repo/pull/478) | Route every Realtime channel through a budgeted port | 1349 | 41 | 1 | 1.46 | yes |  | **−13** | −3 [PR #478 touches hotspot packages/svelte/connect/src/services/connect.svelte.ts (3 of the last 6 releases)](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-fd4035ac7c862123cdae65175cc120073c7245aa50e8aab37b76da2aaefd542b); −10 [PR #478 changed Reader, Shared Packages, Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/478/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#476](https://github.com/tutors-sdk/tutors-mono-repo/pull/476) | Give each whiteboard room a Realtime budget | 377 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #476 changed Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/476/files#diff-f9cfd30e49727585d340eb245e9e85897abbbba627faf3c588167b9ed13bf276) |
| [#480](https://github.com/tutors-sdk/tutors-mono-repo/pull/480) | Tutors Time: read only the chosen days of a course's calendar | 92 | 6 | 0 | 3.30 | yes |  | **−10** | −10 [PR #480 changed Shared Packages, Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/480/files#diff-058494e42758c8229a1aa355997e6c7f3996785e11ea8dffba79c3870e22bce2) |
| [#481](https://github.com/tutors-sdk/tutors-mono-repo/pull/481) | Tutors Live: publish from the reader's server within a daily Realtime budget | 1421 | 23 | 0 | 3.38 | yes |  | **−10** | −10 [PR #481 changed Reader, Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/481/files#diff-e4fcc76d91071866c7d54b16b300e500d67b42190747baa90741fe8de58a8179) |
| [#483](https://github.com/tutors-sdk/tutors-mono-repo/pull/483) | Release 17.0.0 to main and pin production to it | 424 | 13 | 0 | no production lines | yes |  | **−10** | −10 [PR #483 changed Infrastructure, Reader, Live, Catalogue, Time, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/483/files#diff-c19c016987c6b7d3f8a014d7e4df17402c3557f0741538318a2b573727ddfff4) |
| [#484](https://github.com/tutors-sdk/tutors-mono-repo/pull/484) | ci(deploy): open the pin pull request when a release tag's images are published | 247 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #484 changed Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/484/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| [#487](https://github.com/tutors-sdk/tutors-mono-repo/pull/487) | fix(community): show an empty catalogue without Supabase instead of logging errors | 67 | 3 | 0 | 3.47 | yes |  | **−10** | −10 [PR #487 changed Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/487/files#diff-13d8ab5e67e09ca92971e77ee1fcbb71b39dd5a018144bf33a3bbabd5b3da020) |
| [#504](https://github.com/tutors-sdk/tutors-mono-repo/pull/504) | fix(nightly): make the three red Nightly jobs pass for real | 357 | 18 | 0 | no production lines | yes |  | **−10** | −10 [PR #504 changed Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/504/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#500](https://github.com/tutors-sdk/tutors-mono-repo/pull/500) | fix(deploy): immutable Cache-Control on /_app/immutable/* for Netlify | 30 | 5 | 0 | no production lines | yes |  | **−10** | −10 [PR #500 changed Reader, Live, Catalogue, Time, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/500/files#diff-c5f7478f9ea43955917de963b542918dbd3c74bd2e710935fd2606ee0ce67ecd) |
| [#501](https://github.com/tutors-sdk/tutors-mono-repo/pull/501) | feat(image): declare a HEALTHCHECK and expose request SLIs from start (image-hardening, image-manifest, metrics) | 256 | 7 | 0 | 11.68 | yes |  | **−10** | −10 [PR #501 changed Infrastructure, Reader, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/501/files#diff-dd2c0eb6ea5cfc6c4bd4eac30934e2d5746747af48fef6da689e85b752f39557) |
| [#502](https://github.com/tutors-sdk/tutors-mono-repo/pull/502) | ci(image): attest SLSA v1 build provenance to every published image (build-provenance) | 205 | 3 | 0 | no production lines | yes |  | **−10** | −10 [PR #502 changed Infrastructure, Development but no changelog entry under v8534430cb0681d2f21383b56e7227bfbf35bfd2c names it](https://github.com/tutors-sdk/tutors-mono-repo/pull/502/files#diff-a36c2b23480830b1d23bfca9ee3e98f172b1bee39d034c06780f9790dcd8c3f4) |
| 2 more | no deductions: #485, #493 | 576 | 5 |  |  |  |  | 0 |  |

- churn: reader 141 (median 101.5), catalogue 2 (median 7.5), live 2 (median 3.5), time 2 (median 14)
- hotspots: 15 file(s) changed in 3+ of the last 6 releases; touched this release: packages/svelte/connect/src/services/connect.svelte.ts, packages/svelte/utils/i18n/src/messages/fr.ts, packages/svelte/utils/i18n/src/messages/es.ts, packages/svelte/utils/i18n/src/messages/de.ts, packages/svelte/utils/i18n/src/messages/it.ts
- ownership: no file with 3+ authors
- orphans: 12 diff(s) with no changelog entry (pnpm release:changelog --json); entries not measured (CHANGELOG.md at 8534430cb0681d2f21383b56e7227bfbf35bfd2c has no "### v8534430cb0681d2f21383b56e7227bfbf35bfd2c" entries under a product section)
- tests: apps/reader 59.38, packages/jsr/realtime 2.32, packages/jsr/time 3.30, packages/svelte/community 4.02, packages/svelte/connect 650.00, packages/svelte/realtime-supabase 19.12, packages/svelte/ui-navigators 0.18 LOW, packages/svelte/utils 8.96
- reviews: 14 approved, 0 not
- dependencies: no major bump; 1 new direct dependency (@supabase/supabase-js)

Not measured: orphan entries (a changelog entry with no diff) (CHANGELOG.md at 8534430cb0681d2f21383b56e7227bfbf35bfd2c has no "### v8534430cb0681d2f21383b56e7227bfbf35bfd2c" entries under a product section).

_Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own. Every deduction, with the PR, the file and the link, is in changes.json._

2026-10-19T08:41:29.517Z — exit code **0**

| step | result | report |
| --- | --- | --- |
| release | WARN |  |

<details><summary>release: WARN</summary>

## ⚠️ Release harness — release — WARN

| | a | b |
|---|---|---|
| reader | `quay.io/tutors-sdk/tutors-reader:17.0.0` | `quay.io/tutors-sdk/tutors-reader:sha-8534430` |
| catalogue | `quay.io/tutors-sdk/tutors-catalogue:17.0.0` | `quay.io/tutors-sdk/tutors-catalogue:sha-8534430` |
| live | `quay.io/tutors-sdk/tutors-live:17.0.0` | `quay.io/tutors-sdk/tutors-live:sha-8534430` |
| time | `quay.io/tutors-sdk/tutors-time:17.0.0` | `quay.io/tutors-sdk/tutors-time:sha-8534430` |
| **provenance** | **pulled+verified** | **pulled+verified** |
| reader image | `sha256:15e3aa22476d608db97e05917b1990ade0a7871e7ec6e113da5fec741b427233` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:89ca1729eb2fdb53522bbe8903109c4b00c8d563bfba20149226fd6812c85a29` · rev `8534430cb068` · version `sha-8534430` |
| catalogue image | `sha256:e9f2764654cb074d7dd4412ca163bf4c2666870444d5520361d5425bda4cec0b` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:4eac027a536ceb22e8265d3a7459711189cea1c8d899be64f15c7cf938590f44` · rev `8534430cb068` · version `sha-8534430` |
| live image | `sha256:52740e55cfa7e7db3b2944137caada4e876990b937f1034c0c5e79796054f8a0` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:f922989906f59960be3b293604848dbd43ed551596ed090908e2acf448474b20` · rev `8534430cb068` · version `sha-8534430` |
| time image | `sha256:d0a9f4a2f4624038ecea3629d1a536567756d458410bee43b45e060d738d195d` · rev `432d46864626` · version `17.0.0-rc.1` | `sha256:60b3524d78783f90cba5e3d32b32b74d26e2a4c14373e6426a6018a14d1ae4eb` · rev `8534430cb068` · version `sha-8534430` |

- advisory only: the last A/A run (2026-10-19T08:10:00.716Z) had 1 diff(s)
- 92 unclaimed diff(s)
- A/A consulted: 1 diff(s) at 2026-10-19T08:10:00.716Z
- In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 6 journey(s)): 10 difference(s); 2 of this run's 103 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.
  - `dom` `replay:talk-01`: replay:talk-01: semantic DOM differs (+65 −0 lines at line 1)
  - `dom` `replay:note-01`: replay:note-01: semantic DOM differs (+62 −0 lines at line 1)
  - `dom` `replay:note-02`: replay:note-02: semantic DOM differs (+62 −0 lines at line 1)
  - `network` `GET {{course}}/tutors.json`: replay:talk-01: GET {{course}}/tutors.json requested 1× on a, 2× on a2
  - `network` `GET /_app/immutable/assets/1.{{hash}}.css`: replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on a2
  - `network` `GET /_app/immutable/chunks/{{hash}}.js`: replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 40× on a2
  - `network` `GET /_app/immutable/nodes/1.{{hash}}.js`: replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on a2
  - `network` `GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100`: replay:talk-01: new request on a2: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100
  - `network` `GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100`: replay:note-01: new request on a2: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
  - `network` `GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100`: replay:note-02: new request on a2: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100

### 92 unclaimed differences, 6 causes

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `dom` semantic DOM differs (+# −# lines at line #) | 41 | reader, catalogue, live, time | 41: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more | reader:home: semantic DOM differs (+1 −1 lines at line 10) |
| `focus` keyboard order changed (# stops on a, # on b) | 41 | reader, catalogue, live, time | 41: `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more | reader:home: keyboard order changed (12 stops on a, 12 on b) |
| `startup` ready slower on b (1 name: `ready`) | 4 | reader, catalogue, live, time | — | catalogue: ready slower on b: median 2490 ms → 5395 ms (+117%), p=0.012, n=5/5 |
| `persistence` RPC realtime_claim_live_publish — # row(s) on a, # on b | 3 | — | — | rule-0589-live: RPC realtime_claim_live_publish — 0 row(s) on a, 4 on b |
| `metrics` new series on b (2 names: `http_request_duration_seconds_count`, `http_requests_total`) | 2 | time | — | time: new series on b: http_request_duration_seconds_count |
| `persistence` RPC realtime_watch — # row(s) on a, # on b | 1 | — | — | rule-0589-live: RPC realtime_watch — 0 row(s) on a, 1 on b |

Moved together on the same pages, so likely one change each:

- `dom`, `focus` on 41 pages (82 differences): `catalogue:home`, `live-auth:rule-0589-courses`, `live-auth:rule-0589-students`, `live:home`, `reader-auth:course`, `reader-auth:rule-0582-course` and 35 more

The behaviour behind these Rules moved: their journeys' pages or ledgers differ:

- `rule-0582-signed-in-lab`: Rule 0582 (exercises 0011, 0250, 0252, 0260, 0303, 0330): 9 differences in dom, focus, persistence
- `rule-0591-time-labs`: Rule 0591 (exercises 0319): 8 differences in dom, focus
- `rule-0584-quiz-notebook-talk`: Rule 0584 (exercises 0047, 0049, 0050): 6 differences in dom, focus
- `rule-0588-content-lock`: Rule 0588 (exercises 0052, 0053, 0054): 6 differences in dom, focus
- `rule-0589-live`: Rule 0589 (exercises 0330, 0335): 6 differences in dom, focus, persistence
- `rule-0590-time-calendar`: Rule 0590 (exercises 0319): 6 differences in dom, focus
- `rule-0585-preferences`: Rule 0585 (exercises 0037, 0038, 0039): 4 differences in dom, focus
- `rule-0586-private-course`: Rule 0586 (exercises 0011, 0267): 4 differences in dom, focus
- `rule-0583-presence`: Rule 0583 (exercises 0046, 0064, 0280): 3 differences in dom, focus, persistence
- `rule-0587-calendar-llm`: Rule 0587 (exercises 0042, 0284): 2 differences in dom, focus
- `rule-0592-whiteboard`: Rule 0592 (exercises 0275, 0276): 2 differences in dom, focus

### Unclaimed differences (92)

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
| `dom` | `time-auth:rule-0590-calendar-byweek` | time-auth:rule-0590-calendar-byweek: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0590-calendar-byday` | time-auth:rule-0590-calendar-byday: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-lab-bylab` | time-auth:rule-0591-lab-bylab: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-lab-bystep` | time-auth:rule-0591-lab-bystep: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-learning-records` | time-auth:rule-0591-learning-records: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `time-auth:rule-0591-student` | time-auth:rule-0591-student: semantic DOM differs (+1 −1 lines at line 10) |
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
| `dom` | `reader-auth:rule-0586-turned-away-again` | reader-auth:rule-0586-turned-away-again: semantic DOM differs (+1 −1 lines at line 10) |
| `dom` | `reader-auth:rule-0587-llm` | reader-auth:rule-0587-llm: semantic DOM differs (+1 −1 lines at line 8) |
| `dom` | `reader-auth:rule-0592-stroke-saved` | reader-auth:rule-0592-stroke-saved: semantic DOM differs (+1 −1 lines at line 8) |
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
| `persistence` | `rule-0589-live/realtime_claim_live_publish` | rule-0589-live: RPC realtime_claim_live_publish — 0 row(s) on a, 4 on b |
| `persistence` | `rule-0589-live/realtime_watch` | rule-0589-live: RPC realtime_watch — 0 row(s) on a, 1 on b |
| `persistence` | `rule-0582-signed-in-lab/realtime_claim_live_publish` | rule-0582-signed-in-lab: RPC realtime_claim_live_publish — 0 row(s) on a, 5 on b |
| `persistence` | `rule-0583-presence/realtime_claim_live_publish` | rule-0583-presence: RPC realtime_claim_live_publish — 0 row(s) on a, 2 on b |
| `startup` | `catalogue/ready` | catalogue: ready slower on b: median 2490 ms → 5395 ms (+117%), p=0.012, n=5/5 |
| `startup` | `live/ready` | live: ready slower on b: median 2446 ms → 5439 ms (+122%), p=0.012, n=5/5 |
| `startup` | `reader/ready` | reader: ready slower on b: median 2429 ms → 5462 ms (+125%), p=0.012, n=5/5 |
| `startup` | `time/ready` | time: ready slower on b: median 2384 ms → 5428 ms (+128%), p=0.012, n=5/5 |

<details><summary>Detail of 82 difference(s)</summary>

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

… and 62 more in report.json.

</details>

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Policy: what b must be (informing)

| app | image-hardening | build-provenance | vuln-ceiling |
|---|---|---|---|
| reader | holds | holds | holds |
| catalogue | holds | holds | holds |
| live | holds | holds | holds |
| time | holds | holds | holds |

### Informing (21; 21 unclaimed): reported, never gates

18 of 27 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

| engine | scope | what it found | level | claimed by |
|---|---|---|---|---|
| `realtime` | `reader-auth:rule-0592-stroke-saved/websocket` | reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 5 data frame(s) sent); readers must be publish-only (production too) | no date set | unclaimed |
| `asset-graph` | `reader` | reader: the asset graph changed: 173 → 173 immutable requests (JS 142 → 142, CSS 31 → 31), 1.6 MB → 1.6 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `catalogue` | catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live` | live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 541 KB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reader-auth` | reader-auth: the asset graph changed: 1160 → 1160 immutable requests (JS 987 → 987, CSS 173 → 173), 12.7 MB → 12.7 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `reference` | reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `live-auth` | live-auth: the asset graph changed: 179 → 179 immutable requests (JS 149 → 149, CSS 30 → 30), 2.1 MB → 2.1 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `asset-graph` | `time-auth` | time-auth: the asset graph changed: 269 → 269 immutable requests (JS 235 → 235, CSS 34 → 34), 5.1 MB → 5.1 MB; 0 network and 0 headers difference(s) are this churn | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/assets/1.{{hash}}.css` | replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/chunks/{{hash}}.js` | replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 40× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b | no date set | unclaimed |
| `replay` | `replay:talk-01 GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100` | replay:talk-01: new request on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-01 GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: request no longer made on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-01 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-01: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100` | replay:note-02: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:note-02 GET {{course}}/tutors.json` | replay:note-02: new request on b: GET {{course}}/tutors.json | no date set | unclaimed |
| `replay` | `replay:note-02 GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100` | replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/assets/1.{{hash}}.css` | replay:lab-02-step-03: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/chunks/{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 38× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /_app/immutable/nodes/1.{{hash}}.js` | replay:lab-02-step-03: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b | no date set | unclaimed |
| `replay` | `replay:lab-02-step-03 GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100` | replay:lab-02-step-03: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100 | no date set | unclaimed |

### Claimed differences (11)

| artefact | scope | claimed by |
|---|---|---|
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `GET /_app/immutable/chunks/{{hash}}.js` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: moving learning events from browser Realtime to the reader's server adds one immutable chunk on reference:course and reference:note (#478, #481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `network` | `POST /api/live/activity` | Rule 0330: When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. — Rule 0330: the reader sends each learning event to its own server (POST /api/live/activity) instead of broadcasting it from the browser (#481) |
| `persistence` | `student-signs-in/realtime_claim_live_publish` | Rule 0331: When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. — Rule 0331: the reader's server claims the topics to publish to, and charges the day's Live budget, through realtime_claim_live_publish (#481) |

### Claim hygiene

3 claim(s) cover 11 failing hunk(s): 3.67 hunk(s) per claim, at most 8 under one claim (flagged above 10).

### Image artefacts (from the images, not the running apps)

| app | artefact | a | b |
|---|---|---|---|
| reader | manifest | 10 layers, 309.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 308.9 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| reader | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| reader | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| catalogue | manifest | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| catalogue | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| catalogue | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| live | manifest | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 274.5 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| live | sbom | 134 distinct package(s) (cosign attestation (signature verified)) | 134 distinct package(s) (cosign attestation (signature verified)) |
| live | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |
| time | manifest | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) | 10 layers, 285.2 MB, USER 1001, ports 3000/tcp (docker image inspect) |
| time | sbom | 143 distinct package(s) (cosign attestation (signature verified)) | 143 distinct package(s) (cosign attestation (signature verified)) |
| time | vulns | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) | 94 advisories, db built 2026-10-18T06:27:17Z schema v6.1.10, OpenVEX openvex.json (0 statement(s)): none set aside (grype 0.119.0) |

### Load (k6, 20 req/s for 30s)

| side | requests | failed | 5xx | p50 | p95 |
|---|---|---|---|---|---|
| a | 600 | 0 | 0 | 1.33 ms | 2.77 ms |
| b | 601 | 0 | 0 | 1.3 ms | 2.35 ms |

<details><summary>Informational (50)</summary>

- `console` catalogue:home: console message gone on b
- `console` catalogue:home: console message gone on b
- `realtime` reader-auth:rule-0592-stroke-saved: a reader page opened a Realtime websocket on b (1 socket(s), 5 data frame(s) sent); readers must be publish-only (production too)
- `realtime` reader-auth: Realtime messages per reader page view fell: a 1.09 / b 0.23 per reader page (broadcasts a 18 / b 0, socket data frames a 6 / b 5, over 22 page view(s))
- `runtime` container posture collected for catalogue, live, reader, reader-auth, time on both sides (compose)
- `startup` startup time collected on both sides (compose, 5 restart(s) per app)
- `image-hardening` reader: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `image-hardening` catalogue: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `image-hardening` live: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `image-hardening` time: image-hardening holds on b: USER 1001, HEALTHCHECK CMD node -e fetch('http://127.0.0.1:' + (process.env.PORT \|\| 3000) + '/healthz/live').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1)), 0 secret-looking environment variable(s), 0 in the layer history
- `build-provenance` reader: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` catalogue: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` live: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `build-provenance` time: build-provenance holds on b: SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main
- `vuln-ceiling` reader: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` catalogue: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` live: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `vuln-ceiling` time: vuln-ceiling holds on b: 94 advisories scanned, 20 critical or high, none with a fix available
- `asset-graph` reader: the asset graph changed: 173 → 173 immutable requests (JS 142 → 142, CSS 31 → 31), 1.6 MB → 1.6 MB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` catalogue: the asset graph changed: 19 → 19 immutable requests (JS 15 → 15, CSS 4 → 4), 529 KB → 530 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` live: the asset graph changed: 24 → 24 immutable requests (JS 19 → 19, CSS 5 → 5), 540 KB → 541 KB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reader-auth: the asset graph changed: 1160 → 1160 immutable requests (JS 987 → 987, CSS 173 → 173), 12.7 MB → 12.7 MB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` reference: the asset graph changed: 121 → 123 immutable requests (JS 99 → 101, CSS 22 → 22), 1.2 MB → 1.2 MB; 2 network and 0 headers difference(s) are this churn
- `asset-graph` live-auth: the asset graph changed: 179 → 179 immutable requests (JS 149 → 149, CSS 30 → 30), 2.1 MB → 2.1 MB; 0 network and 0 headers difference(s) are this churn
- `asset-graph` time-auth: the asset graph changed: 269 → 269 immutable requests (JS 235 → 235, CSS 34 → 34), 5.1 MB → 5.1 MB; 0 network and 0 headers difference(s) are this churn
- `replay` replay:talk-01: GET /_app/immutable/assets/1.{{hash}}.css requested 1× on a, 2× on b
- `replay` replay:talk-01: GET /_app/immutable/chunks/{{hash}}.js requested 36× on a, 40× on b
- `replay` replay:talk-01: GET /_app/immutable/nodes/1.{{hash}}.js requested 1× on a, 2× on b
- `replay` replay:talk-01: new request on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-01: request no longer made on b: GET /talk/localhost:8080/unit-1/topic-01/talk-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-01: new request on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-02: request no longer made on b: GET /note/localhost:8080/unit-1/topic-01/note-01/__data.json?x-sveltekit-invalidated=100
- `replay` replay:note-02: new request on b: GET {{course}}/tutors.json
- `replay` replay:note-02: new request on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
- `replay` replay:lab-02-step-03: GET /_app/immutable/assets/1.{{hash}}.css requested 2× on a, 1× on b
- `replay` replay:lab-02-step-03: GET /_app/immutable/chunks/{{hash}}.js requested 39× on a, 38× on b
- `replay` replay:lab-02-step-03: GET /_app/immutable/nodes/1.{{hash}}.js requested 2× on a, 1× on b
- `replay` replay:lab-02-step-03: request no longer made on b: GET /note/localhost:8080/unit-1/topic-02/note-02/__data.json?x-sveltekit-invalidated=100
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

</details>

<sub>harness 1.48.5 (1eb3f30f102b, contract 1.48.5) · 2026-10-19T08:41:29.517Z · clock 2026-09-16T09:05:00.000Z · 5 run(s) · masks fired: response-date×272, request-id×272, etag×272, metrics-process×602, metrics-timing-histograms×22, third-party-requests×6771, persistence-stub-requests×2480, oauth-callback-state×110, media-range-status×47, hashed-assets×20131, footer-tutors-version×836, transport-length×272, transport-connection×272, transport-keepalive×272</sub>


</details>
