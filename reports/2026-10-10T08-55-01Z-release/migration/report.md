## ✅ Release harness — migration — PASS

| | a | b |
|---|---|---|
| reader | `migrations:v16.2.2` | `migrations:a5d00c5dbd7ae766f550ef74c4ecf2fc8b66f9b3` |
| catalogue | `-` | `-` |
| live | `-` | `-` |
| time | `-` | `-` |

- the candidate's migrations respect expand/contract and roll back cleanly

### Informing (0): reported, never gates

19 of 25 engines are blocking; informing (reported, never gates): image-hardening (no date set to block), build-provenance (no date set to block), vuln-ceiling (no date set to block), timing-tolerance (no date set to block), asset-graph (no date set to block), replay (no date set to block). An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.

No informing results on this run.

### Migration rehearsal

- a: `v16.2.2` — 1 migration(s), 1 table(s)
- b: `a5d00c5dbd7ae766f550ef74c4ecf2fc8b66f9b3` — 1 new migration(s): `20260924_enable_rls_public_tables.sql`

<details><summary>Informational (1)</summary>

- `migration` rollback restores version a's schema exactly

</details>

<sub>harness 1.33.0 (695e2f813f7f, contract 1.33.0) · 2026-10-10T08:42:59.980Z · clock 2026-09-16T09:05:00.000Z · 1 run(s) · masks fired: none</sub>
