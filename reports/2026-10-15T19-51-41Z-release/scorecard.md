## Scorecard — 85/100 (B)

Verdict FAIL · release · 2026-10-15T19:51:41.408Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −15 | 1 diff(s) no claim covers |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-10-15T19:39:16.959Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 1 | timing | — |
| 0330 When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. | covered | 4 | network | — |
| 0331 When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. | covered | 1 | persistence | — |

### Test by hand

- `student-signs-in` (timing; 1 diff(s)): moved and no claim covers it
