## Scorecard — 22/100 (D)

Verdict WARN · release · 2026-10-10T08:55:01.350Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 202 diff(s) no claim covers |
| −10 | the A/A noise status is degraded: diffs may be noise |
| −5 | 1 claim(s) that matched nothing: the changelog promises what the release does not show |
| −3 | 1 claim(s) covering many diffs at once |

**Normalness:** degraded (0 A/A diff(s), nightly of 2026-10-10T08:41:44.073Z): journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 202 | dom, screenshot, network, console, headers, logs, timing, focus, persistence, image-manifest, sbom | — |
| 0220 Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. | covered | 696 | sbom | — |
| 0051 The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. | covered | 2 | axe | — |
| 0216 The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. | covered | 2 | axe | — |
| 0036 The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. | stale | 0 | axe | — |

### Test by hand

- `/` (dom, screenshot, network, console, headers, focus; 37 diff(s)): moved and no claim covers it
- `/course/localhost:8080` (dom, screenshot, network, console, headers, focus; 32 diff(s)): moved and no claim covers it
- `/search/localhost:8080` (dom, screenshot, network, focus; 19 diff(s)): moved and no claim covers it
- `/course/reference-course` (dom, screenshot, network, headers, focus; 15 diff(s)): moved and no claim covers it
- `/topic/localhost:8080/unit-1/topic-01` (dom, screenshot, console, focus; 10 diff(s)): moved and no claim covers it
