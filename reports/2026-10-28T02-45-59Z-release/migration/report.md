## ❌ Release harness — migration — FAIL

| | a | b |
|---|---|---|
| reader | `migrations:v17.0.0` | `migrations:d3504043ef2d56a06dd96e376394758415987fec` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- 1 expand/contract or rollback violation(s)

### 1 unclaimed difference, 1 cause

Folded by kind across apps, pages and packages. Read beside the verdict; it never changes it.

| cause | differences | apps | pages | example |
|---|---|---|---|---|
| `migration` policy app_errors:anon_select_app_errors removed | 1 | — | — | policy app_errors:anon_select_app_errors removed |

### Unclaimed differences (1)

| artefact | scope | what changed |
|---|---|---|
| `migration` | `app_errors:anon_select_app_errors` | policy app_errors:anon_select_app_errors removed |

Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.

### Informing (0): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Migration rehearsal

- a: `v17.0.0` — 4 migration(s), 6 table(s)
- b: `d3504043ef2d56a06dd96e376394758415987fec` — 5 new migration(s): `20261015_calendar_course_day_index.sql`, `20261016_realtime_live_budget.sql`, `20261017000000_create_whiteboard_scenes.sql`, `20261017000100_restrict_app_errors_reads.sql`, `20261017000200_create_get_student_count.sql`

<details><summary>Informational (14)</summary>

- `migration` new table realtime_budget
- `migration` new table realtime_settings
- `migration` new table realtime_watchers
- `migration` new table whiteboard_scenes
- `migration` new index idx_calendar_course_day
- `migration` new index realtime_budget_pkey
- `migration` new index realtime_settings_pkey
- `migration` new index realtime_watchers_pkey
- `migration` new index whiteboard_scenes_pkey
- `migration` new function get_student_count/0
- `migration` new function live_budget_tier/1
- `migration` new function realtime_claim_live_publish/1
- `migration` new function realtime_watch/2
- `migration` rollback restores version a's schema exactly

</details>

<sub>harness 1.57.1 (b2c7295c4a4a, contract 1.57.0) · 2026-10-28T01:56:16.818Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
