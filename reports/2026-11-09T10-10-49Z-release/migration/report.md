## ✅ Release harness — migration — PASS

| | a | b |
|---|---|---|
| reader | `migrations:v17.1.0` | `migrations:2ec6307f1335b3f1d2ceaecd7a90b790408dd163` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- the candidate's migrations respect expand/contract and roll back cleanly
- 1 claim(s) matched nothing and should be removed from the changelog

### Informing (0): reported, never gates

18 of 29 engines are blocking; informing (reported, never gates): timing (no date set to block; load/errors still blocks), image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block), realtime (no date set to block), secrets-in-response (no date set to block), headers-policy (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Claim hygiene

1 claim(s) cover 0 failing hunk(s): 0 hunk(s) per claim, at most 0 under one claim (flagged above 10).

### Migration rehearsal

- a: `v17.1.0` — 9 migration(s), 10 table(s)
- b: `2ec6307f1335b3f1d2ceaecd7a90b790408dd163` — 0 new migration(s): none

<details><summary>Informational (1)</summary>

- `migration` rollback restores version a's schema exactly

</details>

<details><summary>Stale claims (1)</summary>

- `migration` `app_errors:anon_select_app_errors` — CHANGELOG Unreleased: app_errors is no longer readable with the anon key; the table has never existed on tutors-prod, so no deployed version reads it (migration)

</details>

<sub>harness 1.61.1 (4e746bcea8ad, contract 1.61.0) · 2026-11-09T09:45:02.740Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
