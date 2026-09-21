# Migrations fixture (migration mode)

`harness run --mode migration --a <ref> --b <ref>` rehearses the candidate's
database migrations against the production schema on a throwaway Postgres:

1. Fetch `supabase/migrations/*.sql` from the monorepo at ref **a** (the
   deployed version) and ref **b** (the candidate) — `scripts/fetch-migrations.sh`,
   a sparse checkout, nothing else from the repo.
2. Start `postgres:16-alpine`, apply a's migrations in filename order, and read
   the schema catalogue (tables, columns, types, nullability, defaults,
   indexes, functions, policies).
3. `pg_dump` that state — the snapshot.
4. Apply the migrations in b that a does not have, read the catalogue again.
5. Compare: the **expand/contract** rule, checked mechanically. While the
   rollout runs, pods of version a still read the schema, so b may not:
   - drop a table or a column a has;
   - change a column's type;
   - make an existing column `NOT NULL` without a default.
   Each violation is a `migration` hunk (`<table>.<column>`) that fails the
   run. Additions are informational.
6. Roll back: drop the database, restore the snapshot, read the catalogue and
   assert it equals a's. If it does not, the rollback path is broken and that
   is a failing hunk too.

Everything backend-specific sits behind `SchemaBackend`
(`src/migration/backend.ts`): open a database with the platform baseline (and
the optional `--snapshot`), apply migration files, read the catalogue,
snapshot and restore. `src/migration/supabase-postgres.ts` (Docker,
`supabase-baseline.sql`) is the first implementation; the file source
(`fetch-migrations.sh`) is a second seam. The expand/contract rule and the
rollback check work on catalogues and know neither.
`tests/migration-seam.test.ts` runs the whole rehearsal on an in-memory
backend, no Docker. A successor to Supabase is a new `SchemaBackend` (and its
baseline), not a change to the rule.

Refs can be git refs (`main`, `release/16.3.0`, a sha) or a local directory
(`dir:tests/fixtures/migrations/b`) for negative fixtures and offline runs.

## Sanitised production snapshot

The runway asks for the migrations to also run against a sanitised production
snapshot — real shape, synthetic identities. That job produces a `pg_dump`
file; pass it with `--snapshot <file>` and the harness restores it before
applying b's migrations instead of starting from a's migrations alone, and
asserts row counts by table are within tolerance afterwards. Producing the
snapshot is the monorepo's job (nightly, from production, through its
sanitiser); this directory holds only the contract.
