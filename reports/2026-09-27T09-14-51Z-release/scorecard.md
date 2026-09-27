## Scorecard — 30/100 (D)

Verdict WARN · release · 2026-09-27T09:14:51.337Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 865 diff(s) no claim covers |
| −10 | the A/A noise status is degraded: diffs may be noise |

**Normalness:** degraded (0 A/A diff(s), nightly of 2026-09-27T08:21:17.849Z): journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 865 | dom, screenshot, network, console, headers, logs, focus, persistence, image-manifest, sbom | — |

### Test by hand

- `/` (dom, screenshot, network, console, headers, focus; 36 diff(s)): moved and no claim covers it
- `/course/localhost:8080` (dom, screenshot, network, headers, focus; 32 diff(s)): moved and no claim covers it
- `/search/localhost:8080` (dom, screenshot, network, focus; 20 diff(s)): moved and no claim covers it
- `/course/reference-course` (dom, screenshot, network, headers, focus; 16 diff(s)): moved and no claim covers it
- `/topic/localhost:8080/unit-1/topic-01` (dom, screenshot, focus; 8 diff(s)): moved and no claim covers it
