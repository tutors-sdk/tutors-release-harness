## Scorecard — 25/100 (D)

Verdict FAIL · release · 2026-10-15T18:04:41.578Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 6 diff(s) no claim covers |
| −15 | 43 claim(s) that matched nothing: the changelog promises what the release does not show |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-10-15T17:50:33.391Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 6 | network, timing, persistence | — |
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
| 0019 The reader shall lay out every page without horizontal scrolling at viewport widths from 320 to 1440 pixels. | stale | 0 | dom | — |
| 0036 The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. | stale | 0 | axe | — |
| 0051 The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. | stale | 0 | axe | — |
| 0173 The catalogue shall give each link in its header an accessible name that no other link in the header has. | stale | 0 | axe | — |
| 0216 The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. | stale | 0 | axe | — |
| 0220 Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. | stale | 0 | sbom | — |
| 0250 When a visitor starts GitHub sign-in, the reader shall send the visitor to GitHub's authorization page for the reader's OAuth app with the scopes "read:user" and "user:email". | stale | 0 | network | — |
| 0259 When the reader starts a session, the reader shall set the session cookie as HttpOnly, Secure and SameSite=Lax. | stale | 0 | headers | — |
| 0271 If a learning event is published for a course the student is not reading, then the reader shall not receive it. | stale | 0 | bus | — |
| 0272 When a student opens a learning object, the reader shall report one learning event for it. | stale | 0 | bus | — |
| 0303 When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. | stale | 0 | persistence | — |
| 0304 While a course page is visible, the reader shall record each 30 seconds of activity in one database request. | stale | 0 | persistence | — |
| 0317 When a sharing student enters a course, the reader shall load the course online list from stored activity without joining a course Realtime channel. | stale | 0 | network | — |

### Test by hand

- `/course/localhost:8080` (network; 1 diff(s)): moved and no claim covers it
- `/course/reference-course` (network; 1 diff(s)): moved and no claim covers it
- `/note/reference-course/topic-07-reference/note-1` (network; 1 diff(s)): moved and no claim covers it
- `/topic/localhost:8080/unit-1/topic-01` (network; 1 diff(s)): moved and no claim covers it
- `student-signs-in` (timing; 1 diff(s)): moved and no claim covers it
