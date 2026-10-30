## ✅ Release harness — migration — PASS

| | a | b |
|---|---|---|
| reader | `migrations:v17.0.0` | `migrations:83231ea49b49f78803e3403f7e614f0878e041c0` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- the candidate's migrations respect expand/contract and roll back cleanly

### Informing (0): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Claimed differences (1)

| artefact | scope | claimed by |
|---|---|---|
| `migration` | `app_errors:anon_select_app_errors` | CHANGELOG Unreleased: app_errors is no longer readable with the anon key; the table has never existed on tutors-prod, so no deployed version reads it (migration) |

### Claim hygiene

1 claim(s) cover 1 failing hunk(s): 1 hunk(s) per claim, at most 1 under one claim (flagged above 10).

### Migration rehearsal

- a: `v17.0.0` — 4 migration(s), 6 table(s)
- b: `83231ea49b49f78803e3403f7e614f0878e041c0` — 5 new migration(s): `20261015_calendar_course_day_index.sql`, `20261016_realtime_live_budget.sql`, `20261017000000_create_whiteboard_scenes.sql`, `20261017000100_restrict_app_errors_reads.sql`, `20261017000200_create_get_student_count.sql`

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

<sub>harness 1.60.0 (5678e03ccebb, contract 1.60.0) · 2026-10-30T10:56:30.074Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
