## Scorecard — 12/100 (D)

Verdict WARN · release · 2026-10-15T07:53:06.516Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 412 diff(s) no claim covers |
| −10 | the A/A noise status is degraded: diffs may be noise |
| −15 | 3 claim(s) that matched nothing: the changelog promises what the release does not show |
| −3 | 1 claim(s) covering many diffs at once |

**Normalness:** degraded (0 A/A diff(s), nightly of 2026-10-15T07:38:30.465Z): journey "reference-course-reads" failed on both sides, so this run saw nothing of its pages

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 412 | dom, screenshot, network, console, headers, logs, timing, focus, persistence, image-manifest, sbom | — |
| 0220 Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. | covered | 696 | sbom | — |
| 0051 The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. | covered | 2 | axe | — |
| 0216 The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. | covered | 2 | axe | — |
| 0303 When a student opens a learning object, the reader shall record the page view against the learning object and the day's calendar in one database request. | covered | 2 | persistence | — |
| 0036 The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. | stale | 0 | axe | — |
| 0304 While a course page is visible, the reader shall record each 30 seconds of activity in one database request. | stale | 0 | persistence | — |

### Test by hand

- `/course/localhost:8080` (dom, screenshot, network, console, headers, focus; 43 diff(s)): moved and no claim covers it
- `/` (dom, screenshot, network, console, headers, focus; 41 diff(s)): moved and no claim covers it
- `/search/localhost:8080` (dom, screenshot, network, focus; 21 diff(s)): moved and no claim covers it
- `/course/reference-course` (dom, screenshot, network, headers, focus; 17 diff(s)): moved and no claim covers it
- `/topic/localhost:8080/unit-1/topic-01` (dom, screenshot, network, console, focus; 14 diff(s)): moved and no claim covers it
