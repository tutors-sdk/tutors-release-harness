## Scorecard — 22/100 (D)

Verdict FAIL · release · 2026-10-28T10:32:38.087Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 336 diff(s) no claim covers |
| −15 | 8 claim(s) that matched nothing: the changelog promises what the release does not show |
| −3 | 1 claim(s) covering many diffs at once |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-10-28T01:54:59.302Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 336 | dom, screenshot, network, console, metrics, logs, focus, persistence, image-manifest, sbom | — |
| 0330 When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. | covered | 34 | network | — |
| 0331 When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. | covered | 4 | persistence | — |
| 0334 While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. | covered | 1 | persistence | — |
| CHANGELOG Unreleased: app_errors is no longer readable with the anon key; the table has never existed on tutors-prod, so no deployed version reads it (migration) | stale | 0 | migration | — |
| CHANGELOG Unreleased (Time): the dashboard loads time data from the reader | stale | 0 | network | — |
| CHANGELOG Unreleased (Time): signed-out viewers see a sign-in link | stale | 0 | dom | — |
| CHANGELOG Unreleased (Time): signed-out viewers see a sign-in link | stale | 0 | screenshot | — |
| 0068 While a student is signed in, the reader shall save the student's edits to a whiteboard learning object in a room that only that student's session can read or overwrite. | stale | 0 | dom | — |
| 0070 When a visitor opens the catalogue, the catalogue shall show the number of students without reading any student's profile. | stale | 0 | network | — |
| 0072 The reader shall store a signed-in student's learning records, calendar, sentiment, online status and shared presence under the GitHub login of the session, whatever student id the request names. | stale | 0 | network | — |

### Test by hand

- `/course/harness-rules` (dom, network, console, focus; 56 diff(s)): moved and no claim covers it
- `/` (dom, network, console, focus; 41 diff(s)): moved and no claim covers it
- `/course/harness-fixture` (dom, network, console, focus; 34 diff(s)): moved and no claim covers it
- `/whiteboard/harness-rules/unit-1/topic-01/whiteboard-01` (dom, network, console, focus; 12 diff(s)): moved and no claim covers it
- `/harness-rules/lab/bylab` (dom, screenshot, network, console, focus; 11 diff(s)): moved and no claim covers it
