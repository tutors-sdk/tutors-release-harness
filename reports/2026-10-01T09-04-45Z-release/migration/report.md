## ✅ Release harness — migration — PASS

| | a | b |
|---|---|---|
| reader | `migrations:v16.2.2` | `migrations:c0a0965900cd0d058e1a75542e4ad5e548c246d8` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- the candidate's migrations respect expand/contract and roll back cleanly

### Informing (0): reported, never gates

19 of 22 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Migration rehearsal

- a: `v16.2.2` — 1 migration(s), 1 table(s)
- b: `c0a0965900cd0d058e1a75542e4ad5e548c246d8` — 1 new migration(s): `20260924_enable_rls_public_tables.sql`

<details><summary>Informational (1)</summary>

- `migration` rollback restores version a's schema exactly

</details>

<sub>harness 1.24.0 (e065c7df5817, contract 1.24.0) · 2026-10-01T08:54:47.263Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
