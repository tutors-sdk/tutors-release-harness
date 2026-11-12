## Scorecard — 22/100 (D)

Verdict FAIL · release · 2026-11-12T12:27:03.513Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 82 diff(s) no claim covers |
| −15 | 9 claim(s) that matched nothing: the changelog promises what the release does not show |
| −3 | 1 claim(s) covering many diffs at once |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-11-12T02:00:10.123Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 82 | dom, screenshot, network, focus, sbom | — |
| 0330 When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. | covered | 20 | network | — |
| 0667 Tutors shall build its images on a Node base image pinned by digest, moved only by a Dependabot pull request. | covered | 4 | image-manifest | [#541](https://github.com/tutors-sdk/tutors-mono-repo/pull/541) |
| CHANGELOG Unreleased (Time): the dashboard loads time data from the reader | stale | 0 | network | — |
| CHANGELOG Unreleased (Time): the reader logs each time data read with the course and the viewer's role (logs) (PR #320) | stale | 0 | logs | [#320](https://github.com/tutors-sdk/tutors-mono-repo/pull/320) |
| 0068 While a student is signed in, the reader shall save the student's edits to a whiteboard learning object in a room that only that student's session can read or overwrite. | stale | 0 | network | — |
| 0072 The reader shall store a signed-in student's learning records, calendar, sentiment, online status and shared presence under the GitHub login of the session, whatever student id the request names. | stale | 0 | network | — |
| 0331 When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. | stale | 0 | persistence | — |
| 0334 While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. | stale | 0 | persistence | — |

### Test by hand

- `/` (dom, screenshot, network, focus; 40 diff(s)): moved and no claim covers it
- `/course/harness-rules` (dom; 5 diff(s)): moved and no claim covers it
- `/course/harness-fixture` (dom; 3 diff(s)): moved and no claim covers it
- `/course/localhost:8080` (dom; 1 diff(s)): moved and no claim covers it
- `/course/reference-course` (dom; 1 diff(s)): moved and no claim covers it
