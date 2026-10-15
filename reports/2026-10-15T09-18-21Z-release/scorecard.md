## Scorecard — 9/100 (D)

Verdict WARN · release · 2026-10-15T09:18:21.299Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 382 diff(s) no claim covers |
| −10 | the A/A noise status is degraded: diffs may be noise |
| −15 | 28 claim(s) that matched nothing: the changelog promises what the release does not show |
| −6 | 2 claim(s) covering many diffs at once |

**Normalness:** degraded (0 A/A diff(s), nightly of 2026-10-15T07:38:30.465Z): journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 382 | dom, screenshot, network, console, headers, logs, timing, focus, persistence, image-manifest, sbom | — |
| 0220 Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. | covered | 696 | sbom | [#376](https://github.com/tutors-sdk/tutors-mono-repo/pull/376) |
| 0019 The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. | covered | 27 | dom, screenshot | [#313](https://github.com/tutors-sdk/tutors-mono-repo/pull/313) |
| 0250 When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". | covered | 6 | dom, network | [#417](https://github.com/tutors-sdk/tutors-mono-repo/pull/417) |
| 0051 The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. | covered | 2 | axe | [#313](https://github.com/tutors-sdk/tutors-mono-repo/pull/313), [#364](https://github.com/tutors-sdk/tutors-mono-repo/pull/364) |
| 0216 The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. | covered | 2 | axe | [#364](https://github.com/tutors-sdk/tutors-mono-repo/pull/364) |
| 0259 When the reader starts a session, the reader shall set the session cookie as HttpOnly, Secure and SameSite=Lax. | covered | 2 | headers | [#417](https://github.com/tutors-sdk/tutors-mono-repo/pull/417) |
| 0303 When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. | covered | 2 | persistence | [#475](https://github.com/tutors-sdk/tutors-mono-repo/pull/475) |
| CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape, and variable data kept out of log messages (#283, #297) | stale | 0 | logs | — |
| CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283) | stale | 0 | logs | — |
| CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283) | stale | 0 | logs | — |
| CHANGELOG 17.0.0 Infrastructure: stable log and metrics shape (#283) | stale | 0 | logs | — |
| CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283) | stale | 0 | metrics | — |
| CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283) | stale | 0 | metrics | — |
| CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283) | stale | 0 | metrics | — |
| CHANGELOG 17.0.0 Infrastructure: stable metrics shape for release-harness A/A runs (#283) | stale | 0 | metrics | — |
| CHANGELOG 17.0.0 Reader: the reader runs on SvelteKit 3 (#466) | stale | 0 | asset-graph | — |
| CHANGELOG 17.0.0 Live: Live runs on SvelteKit 3 (#466) | stale | 0 | asset-graph | — |
| CHANGELOG 17.0.0 Catalogue: the catalogue runs on SvelteKit 3 (#466) | stale | 0 | asset-graph | — |
| CHANGELOG 17.0.0 Time: Time runs on SvelteKit 3 (#466) | stale | 0 | asset-graph | — |
| 0036 The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. | stale | 0 | axe | [#313](https://github.com/tutors-sdk/tutors-mono-repo/pull/313) |
| 0173 The catalogue shall give each link in its header an accessible name that no other link in the header has. | stale | 0 | axe | [#338](https://github.com/tutors-sdk/tutors-mono-repo/pull/338) |
| 0271 If a learning event is published for a course the student is not reading, then the reader shall not receive it. | stale | 0 | bus | [#414](https://github.com/tutors-sdk/tutors-mono-repo/pull/414) |
| 0272 When a student opens a learning object, the reader shall report one learning event for it. | stale | 0 | bus | [#414](https://github.com/tutors-sdk/tutors-mono-repo/pull/414) |
| 0304 While a course page is visible, the reader shall record each 30 seconds of activity in one database request. | stale | 0 | persistence | [#475](https://github.com/tutors-sdk/tutors-mono-repo/pull/475) |
| 0317 When a sharing student enters a course, the reader shall load the course online list from stored activity without joining a course Realtime channel. | stale | 0 | network | [#474](https://github.com/tutors-sdk/tutors-mono-repo/pull/474) |

### Test by hand

- `/course/localhost:8080` (dom, screenshot, network, console, headers, focus; 44 diff(s); Rule 0019): moved and no claim covers it
- `/` (network, console, headers, focus, dom, screenshot; 40 diff(s); Rule 0019): moved and no claim covers it
- `/search/localhost:8080` (network, focus, dom, screenshot; 21 diff(s); Rule 0019): moved and no claim covers it
- `/course/reference-course` (dom, screenshot, network, headers, focus; 16 diff(s)): moved and no claim covers it
- `/topic/localhost:8080/unit-1/topic-01` (dom, screenshot, network, console, focus; 14 diff(s); Rule 0019): moved and no claim covers it
