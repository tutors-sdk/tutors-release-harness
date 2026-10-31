## Scorecard — 34/100 (D)

Verdict FAIL · release · 2026-10-31T02:33:01.192Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 167 diff(s) no claim covers |
| −6 | 2 claim(s) covering many diffs at once |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-10-31T01:56:50.377Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 167 | dom, screenshot, network, metrics, logs, focus, persistence, image-manifest, sbom | — |
| 0072 The reader shall store a signed-in student's learning records, calendar, sentiment, online status and shared presence under the GitHub login of the session, whatever student id the request names. | covered | 85 | network, persistence | — |
| 0330 When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. | covered | 33 | network | — |
| 0667 Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. | covered | 8 | image-manifest, sbom | [#541](https://github.com/tutors-sdk/tutors-mono-repo/pull/541) |
| 0331 When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. | covered | 4 | persistence | — |
| 0068 While a student is signed in, the reader shall save the student's edits to a whiteboard learning object in a room that only that student's session can read or overwrite. | covered | 2 | network | — |
| 0334 While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. | covered | 1 | persistence | — |
| CHANGELOG Unreleased (Time): the dashboard loads time data from the reader | changelog | 7 | network | — |
| CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320) | changelog | 2 | logs | [#320](https://github.com/tutors-sdk/tutors-mono-repo/pull/320) |

### Test by hand

- `/` (dom, screenshot, focus; 18 diff(s)): moved and no claim covers it
- `/course/harness-rules` (dom, network, focus; 17 diff(s)): moved and no claim covers it
- `/harness-rules/lab/bylab` (dom, screenshot, focus; 8 diff(s)): moved and no claim covers it
- `/course/harness-fixture` (dom, focus; 6 diff(s)): moved and no claim covers it
- `/harness-rules/harness-quiet` (dom, screenshot, focus; 4 diff(s)): moved and no claim covers it
