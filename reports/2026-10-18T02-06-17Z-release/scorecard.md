## Scorecard — 40/100 (D)

Verdict FAIL · release · 2026-10-18T02:06:17.110Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 35 diff(s) no claim covers |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-10-18T01:45:23.090Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 35 | dom, focus, persistence | — |
| 0330 When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. | covered | 9 | network | — |
| 0331 When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. | covered | 1 | persistence | — |

### Test by hand

- `/` (dom, focus; 9 diff(s)): moved and no claim covers it
- `/course/localhost:8080` (dom; 4 diff(s)): moved and no claim covers it
- `/course/localhost:8081` (dom; 2 diff(s)): moved and no claim covers it
- `/course/reference-course` (dom, focus; 2 diff(s)): moved and no claim covers it
- `/lab/localhost:8080/unit-1/topic-01/book-lab-01` (dom; 2 diff(s)): moved and no claim covers it
