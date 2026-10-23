## Scorecard — 27/100 (D)

Verdict WARN · release · 2026-10-23T02:29:10.104Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 131 diff(s) no claim covers |
| −10 | the A/A noise status is noisy: diffs may be noise |
| −3 | 1 claim(s) covering many diffs at once |

**Normalness:** noisy (1 A/A diff(s), nightly of 2026-10-23T02:01:40.258Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 131 | dom, screenshot, network, console, metrics, logs, focus, persistence, image-manifest, sbom | — |
| 0330 When a student opens a learning object, the reader shall send the learning event to the reader's server without publishing it over Realtime from the browser. | covered | 25 | network | — |
| 0331 When the reader's server receives a learning event, the reader shall publish it only to the activity feeds a live dashboard has watched in the last 90 seconds. | covered | 4 | persistence | — |
| 0334 While it shows a course or the platform feed, the live dashboard shall report itself as a watcher of that feed every 60 seconds. | covered | 1 | persistence | — |

### Test by hand

- `/` (dom, focus; 16 diff(s)): moved and no claim covers it
- `/course/localhost:8081` (dom, network, console, focus; 9 diff(s)): moved and no claim covers it
- `/course/localhost:8080` (dom, focus; 8 diff(s)): moved and no claim covers it
- `/harness-rules/lab/bylab` (dom, screenshot, focus; 8 diff(s)): moved and no claim covers it
- `/harness-rules/harness-quiet` (dom, screenshot, focus; 4 diff(s)): moved and no claim covers it
