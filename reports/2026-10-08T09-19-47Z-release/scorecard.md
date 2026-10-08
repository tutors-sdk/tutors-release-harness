## Scorecard — 37/100 (D)

Verdict FAIL · release · 2026-10-08T09:19:47.687Z. Informational: the score never changes the verdict.

| points | why |
|---|---|
| −60 | 216 diff(s) no claim covers |
| −3 | 1 claim(s) covering many diffs at once |

**Normalness:** normal (0 A/A diff(s), nightly of 2026-10-08T09:07:10.204Z)

### EARS Rules, diffs and PRs

| Rule | status | diffs | artefacts | PRs |
|---|---|---|---|---|
| no Rule | unclaimed | 216 | dom, screenshot, network, console, headers, logs, focus, persistence, image-manifest, sbom | — |
| 0220 Tutors shall ship its runtime images with no package manager, removing npm, npx, corepack and yarn in the runtime stage. | covered | 696 | sbom | — |
| 0051 The reader shall show course pages with no critical or serious WCAG 2.1 AA violations in either appearance. | covered | 2 | axe | — |
| 0216 The reader shall show the sign-in page with no critical or serious WCAG 2.1 AA violations. | covered | 2 | axe | — |
| 0036 The reader shall show a note's table of contents collapsed under "On this page" and give each code block a "Copy code" button. | covered | 1 | axe | — |

### Test by hand

- `/` (dom, screenshot, network, console, headers, focus; 38 diff(s)): moved and no claim covers it
- `/course/localhost:8080` (dom, screenshot, network, headers, focus; 32 diff(s)): moved and no claim covers it
- `/search/localhost:8080` (dom, screenshot, network, focus; 20 diff(s)): moved and no claim covers it
- `/course/reference-course` (dom, screenshot, network, headers, focus; 16 diff(s)): moved and no claim covers it
- `/note/reference-course/topic-07-reference/note-1` (dom, screenshot, network, headers, focus; 16 diff(s)): moved and no claim covers it
