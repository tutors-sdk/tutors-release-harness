## ✅ Release harness — migration — PASS

| | a | b |
|---|---|---|
| reader | `migrations:v17.0.0` | `migrations:d3d72277634afc7370a4432eb3fdd64d57e5bf9a` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- the candidate's migrations respect expand/contract and roll back cleanly

### Informing (0): reported, never gates

19 of 27 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Migration rehearsal

- a: `v17.0.0` — 4 migration(s), 6 table(s)
- b: `d3d72277634afc7370a4432eb3fdd64d57e5bf9a` — 2 new migration(s): `20261015_calendar_course_day_index.sql`, `20261016_realtime_live_budget.sql`

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

<sub>harness 1.37.3 (2fc966f3a1d9, contract 1.37.0) · 2026-10-15T17:51:59.691Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
