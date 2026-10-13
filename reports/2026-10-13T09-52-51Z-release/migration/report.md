## ✅ Release harness — migration — PASS

| | a | b |
|---|---|---|
| reader | `migrations:v16.2.2` | `migrations:f0a9159a342329f90788c5cb82400207ad7dd0e8` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- the candidate's migrations respect expand/contract and roll back cleanly

### Informing (0): reported, never gates

19 of 26 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block), slo (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Migration rehearsal

- a: `v16.2.2` — 1 migration(s), 1 table(s)
- b: `f0a9159a342329f90788c5cb82400207ad7dd0e8` — 1 new migration(s): `20260924_enable_rls_public_tables.sql`

<details><summary>Informational (1)</summary>

- `migration` rollback restores version a's schema exactly

</details>

<sub>harness 1.35.1 (c761140ce03f, contract 1.35.0) · 2026-10-13T09:38:58.230Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
