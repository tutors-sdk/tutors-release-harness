import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { bashCommand } from "../local/bash.ts";
import { ROOT } from "../stack.ts";
import type { Hunk, MigrationResult, ColumnInfo, SchemaCatalog } from "../types.ts";
import { hunkId, resetHunkIds } from "../compare/pages.ts";
import type { MigrationSource, SchemaBackend } from "../migration/backend.ts";
import { supabasePostgres } from "../migration/supabase-postgres.ts";

// ---- migration files ---------------------------------------------------------------------

function migrationFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

/** Fetch migrations for a ref into `<work>/<label>` via scripts/fetch-migrations.sh. */
export const fetchMigrations: MigrationSource = (ref, dest, log) => {
  mkdirSync(dest, { recursive: true });
  const script = resolve(ROOT, "scripts", "fetch-migrations.sh");
  const result = spawnSync(bashCommand(), [script, ref, dest], { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`fetch-migrations ${ref}: ${result.stderr || result.stdout}`);
  log(`  ${result.stdout.trim()}`);
  return migrationFiles(dest);
};

// ---- expand/contract --------------------------------------------------------------------------

/**
 * The rule, mechanically: while version a still runs, b's schema may not
 * remove or narrow anything a reads. Pure, so the tests can feed it catalogues.
 */
export function expandContract(a: SchemaCatalog, b: SchemaCatalog): Hunk[] {
  const hunks: Hunk[] = [];
  for (const [table, cols] of Object.entries(a.tables)) {
    const bCols = b.tables[table];
    if (!bCols) {
      hunks.push({ id: hunkId("migration", table), artefact: "migration", scope: table, severity: "fail", summary: `table ${table} dropped while version a still reads it` });
      continue;
    }
    for (const [name, col] of Object.entries(cols)) {
      const scope = `${table}.${name}`;
      const bCol: ColumnInfo | undefined = bCols[name];
      if (!bCol) {
        hunks.push({ id: hunkId("migration", scope), artefact: "migration", scope, severity: "fail", summary: `column ${scope} dropped or renamed while version a still reads it` });
        continue;
      }
      if (bCol.type !== col.type) hunks.push({ id: hunkId("migration", scope), artefact: "migration", scope, severity: "fail", summary: `column ${scope} changed type ${col.type} → ${bCol.type}` });
      if (col.nullable && !bCol.nullable && bCol.default === null) hunks.push({ id: hunkId("migration", scope), artefact: "migration", scope, severity: "fail", summary: `column ${scope} became NOT NULL without a default; version a's inserts will fail` });
    }
    for (const name of Object.keys(bCols)) {
      if (!(name in cols)) {
        const bCol = bCols[name]!;
        const risky = !bCol.nullable && bCol.default === null;
        hunks.push({ id: hunkId("migration", `${table}.${name}`), artefact: "migration", scope: `${table}.${name}`, severity: risky ? "fail" : "info", summary: risky ? `new column ${table}.${name} is NOT NULL with no default; version a's inserts will fail` : `new column ${table}.${name} (${bCol.type})` });
      }
    }
  }
  for (const table of Object.keys(b.tables)) if (!(table in a.tables)) hunks.push({ id: hunkId("migration", table), artefact: "migration", scope: table, severity: "info", summary: `new table ${table}` });
  const setDiff = (label: string, xs: string[], ys: string[]) => {
    for (const x of xs) if (!ys.includes(x)) hunks.push({ id: hunkId("migration", x), artefact: "migration", scope: x, severity: "fail", summary: `${label} ${x} removed` });
    for (const y of ys) if (!xs.includes(y)) hunks.push({ id: hunkId("migration", y), artefact: "migration", scope: y, severity: "info", summary: `new ${label} ${y}` });
  };
  setDiff("index", a.indexes, b.indexes);
  setDiff("function", a.functions, b.functions);
  setDiff("policy", a.policies, b.policies);
  return hunks;
}

export function rollbackCheck(a: SchemaCatalog, rolledBack: SchemaCatalog): Hunk[] {
  if (JSON.stringify(a) === JSON.stringify(rolledBack)) {
    return [{ id: hunkId("migration", "rollback"), artefact: "migration", scope: "rollback", severity: "info", summary: "rollback restores version a's schema exactly" }];
  }
  return [{ id: hunkId("migration", "rollback"), artefact: "migration", scope: "rollback", severity: "fail", summary: "restoring the pre-migration snapshot does not reproduce version a's schema; the rollback path is broken", detail: JSON.stringify({ a, rolledBack }, null, 1).slice(0, 4000) }];
}

// ---- the mode ---------------------------------------------------------------------------------

export interface MigrationOptions {
  a: string;
  b: string;
  /** Optional pg_dump of a sanitised production snapshot to restore before b's migrations. */
  snapshot?: string;
  workDir: string;
  log: (m: string) => void;
}

/** The two seams of migration mode: where migration files come from, and what database they run on. */
export interface MigrationDeps {
  backend: SchemaBackend;
  source: MigrationSource;
}

/**
 * Rehearse b's migrations on a's schema: apply a, snapshot, apply what b adds,
 * check expand/contract, restore the snapshot and check the rollback. Runs
 * against the Supabase-flavoured Postgres in Docker; `rehearseMigrations`
 * takes the backend and the file source as parameters.
 */
export function runMigration(opts: MigrationOptions): { result: MigrationResult; hunks: Hunk[] } {
  return rehearseMigrations({ backend: supabasePostgres, source: fetchMigrations }, opts);
}

export function rehearseMigrations(deps: MigrationDeps, opts: MigrationOptions): { result: MigrationResult; hunks: Hunk[] } {
  resetHunkIds();
  const dirA = join(opts.workDir, "migrations-a");
  const dirB = join(opts.workDir, "migrations-b");
  opts.log(`migrations for a (${opts.a})`);
  const filesA = deps.source(opts.a, dirA, opts.log);
  opts.log(`migrations for b (${opts.b})`);
  const filesB = deps.source(opts.b, dirB, opts.log);

  const session = deps.backend.open({ ...(opts.snapshot ? { snapshot: opts.snapshot } : {}), log: opts.log });
  try {
    session.applyMigrations(dirA, filesA, opts.log);
    const catalogA = session.catalog();
    const dump = session.snapshot();

    const onlyB = filesB.filter((f) => !filesA.includes(f));
    if (!onlyB.length) opts.log("  b adds no migrations");
    session.applyMigrations(dirB, onlyB, opts.log);
    const catalogB = session.catalog();
    const hunks = expandContract(catalogA, catalogB);

    // Rollback rehearsal: a fresh database from the snapshot must equal a.
    opts.log("  rehearsing rollback from the snapshot");
    const rolledBack = session.restoreAndCatalog(dump);
    hunks.push(...rollbackCheck(catalogA, rolledBack));

    return { result: { a: { ref: opts.a, files: filesA, catalog: catalogA }, b: { ref: opts.b, files: filesB, catalog: catalogB }, rolledBack }, hunks };
  } finally {
    session.close();
  }
}
