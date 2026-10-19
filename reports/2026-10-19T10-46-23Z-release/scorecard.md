## Scorecard — 40/100 (D)

Verdict FAIL · release · 2026-10-19T10:46:23.293Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 92 diff(s) no claim covers |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-10-19T09:47:56.867Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 92 | dom, metrics, focus, persistence, startup | — |
| 0330 When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. | covered | 10 | network | — |
| 0331 When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. | covered | 1 | persistence | — |

### Test by hand

- `/` (dom, focus; 14 diff(s)): moved and no claim covers it
- `/course/localhost:8081` (dom, focus; 10 diff(s)): moved and no claim covers it
- `/course/localhost:8080` (dom, focus; 8 diff(s)): moved and no claim covers it
- `/lab/localhost:8080/unit-1/topic-01/book-lab-01` (dom, focus; 4 diff(s)): moved and no claim covers it
- `/lab/localhost:8080/unit-1/topic-01/book-lab-01/Step-01` (dom, focus; 4 diff(s)): moved and no claim covers it
