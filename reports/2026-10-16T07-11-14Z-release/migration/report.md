## ✅ Release harness — migration — PASS

| | a | b |
|---|---|---|
| reader | `migrations:v17.0.0` | `migrations:c867ee87107a603c3d1ea34be9ff70beab119ee2` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- the candidate's migrations respect expand/contract and roll back cleanly

### Informing (0): reported, never gates

18 of 27 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Migration rehearsal

- a: `v17.0.0` — 4 migration(s), 6 table(s)
- b: `c867ee87107a603c3d1ea34be9ff70beab119ee2` — 2 new migration(s): `20261015_calendar_course_day_index.sql`, `20261016_realtime_live_budget.sql`

<details><summary>Informational (11)</summary>

- `migration` new table realtime_budget
- `migration` new table realtime_settings
- `migration` new table realtime_watchers
- `migration` new index idx_calendar_course_day
- `migration` new index realtime_budget_pkey
- `migration` new index realtime_settings_pkey
- `migration` new index realtime_watchers_pkey
- `migration` new function live_budget_tier/1
- `migration` new function realtime_claim_live_publish/1
- `migration` new function realtime_watch/2
- `migration` rollback restores version a's schema exactly

</details>

<sub>harness 1.39.1 (f484596ba717, contract 1.39.0) · 2026-10-16T06:59:11.943Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
