import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, docker } from "../stack.ts";
import type { ColumnInfo, Hunk, MigrationResult, SchemaCatalog } from "../types.ts";
import { hunkId, resetHunkIds } from "../compare/pages.ts";

const PG_IMAGE = process.env.HARNESS_POSTGRES_IMAGE ?? "postgres:16-alpine";
const DB = "tutors";

// ---- catalogue -------------------------------------------------------------------------

/** One query per catalogue facet, all against information_schema / pg_catalog, all ordered. */
const CATALOG_SQL = `
select json_build_object(
  'tables', (
    select coalesce(json_object_agg(t.table_name, t.cols), '{}'::json) from (
      select c.table_name, json_object_agg(c.column_name, json_build_object('type', c.data_type, 'nullable', c.is_nullable = 'YES', 'default', c.column_default) order by c.ordinal_position) as cols
      from information_schema.columns c
      where c.table_schema = 'public'
      group by c.table_name
    ) t
  ),
  'indexes', (select coalesce(json_agg(indexname order by indexname), '[]'::json) from pg_indexes where schemaname = 'public'),
  'functions', (select coalesce(json_agg(p.proname || '/' || p.pronargs order by p.proname, p.pronargs), '[]'::json) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'),
  'policies', (select coalesce(json_agg(tablename || ':' || policyname order by tablename, policyname), '[]'::json) from pg_policies where schemaname = 'public')
);`;

interface Pg {
  container: string;
  psql: (sql: string, opts?: { db?: string }) => string;
  stop: () => void;
}

function startPostgres(log: (m: string) => void): Pg {
  const container = `tutors-harness-pg-${Date.now()}`;
  log(`starting ${PG_IMAGE} as ${container}`);
  docker(["run", "-d", "--rm", "--name", container, "-e", "POSTGRES_PASSWORD=harness", "-e", `POSTGRES_DB=${DB}`, PG_IMAGE], { quiet: true });
  const psql = (sql: string, opts: { db?: string } = {}) => docker(["exec", "-i", container, "psql", "-v", "ON_ERROR_STOP=1", "-q", "-A", "-t", "-U", "postgres", "-d", opts.db ?? DB], { input: sql, quiet: true });
  for (let i = 0; i < 60; i += 1) {
    const ready = spawnSync("docker", ["exec", container, "pg_isready", "-U", "postgres", "-d", DB], { encoding: "utf8" });
    if (ready.status === 0) break;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
  // pg_isready can answer before the init scripts finish restarting the server; a real query settles it.
  for (let i = 0; i < 20; i += 1) {
    try {
      psql("select 1;");
      break;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
  return { container, psql, stop: () => spawnSync("docker", ["stop", "-t", "2", container], { encoding: "utf8" }) };
}

function catalog(pg: Pg, db = DB): SchemaCatalog {
  return JSON.parse(pg.psql(CATALOG_SQL, { db }).trim()) as SchemaCatalog;
}

function migrationFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

function apply(pg: Pg, dir: string, files: string[], log: (m: string) => void) {
  for (const file of files) {
    log(`  applying ${file}`);
    pg.psql(readFileSync(join(dir, file), "utf8"));
  }
}

/** Fetch migrations for a ref into `<work>/<label>` via scripts/fetch-migrations.sh. */
function fetchMigrations(ref: string, dest: string, log: (m: string) => void): string[] {
  mkdirSync(dest, { recursive: true });
  const script = resolve(ROOT, "scripts", "fetch-migrations.sh");
  const result = spawnSync("bash", [script, ref, dest], { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`fetch-migrations ${ref}: ${result.stderr || result.stdout}`);
  log(`  ${result.stdout.trim()}`);
  return migrationFiles(dest);
}

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

/**
 * Rehearse b's migrations on a's schema: apply a, snapshot, apply what b adds,
 * check expand/contract, restore the snapshot and check the rollback.
 */
export function runMigration(opts: MigrationOptions): { result: MigrationResult; hunks: Hunk[] } {
  resetHunkIds();
  const dirA = join(opts.workDir, "migrations-a");
  const dirB = join(opts.workDir, "migrations-b");
  opts.log(`migrations for a (${opts.a})`);
  const filesA = fetchMigrations(opts.a, dirA, opts.log);
  opts.log(`migrations for b (${opts.b})`);
  const filesB = fetchMigrations(opts.b, dirB, opts.log);

  const pg = startPostgres(opts.log);
  try {
    // Supabase provisions roles and schemas the migrations take for granted.
    pg.psql(readFileSync(resolve(ROOT, "fixtures", "migrations", "supabase-baseline.sql"), "utf8"));
    if (opts.snapshot) {
      opts.log(`restoring snapshot ${opts.snapshot}`);
      pg.psql(readFileSync(opts.snapshot, "utf8"));
    }
    apply(pg, dirA, filesA, opts.log);
    const catalogA = catalog(pg);
    const dump = docker(["exec", pg.container, "pg_dump", "-U", "postgres", "--no-owner", DB], { quiet: true });

    const onlyB = filesB.filter((f) => !filesA.includes(f));
    if (!onlyB.length) opts.log("  b adds no migrations");
    apply(pg, dirB, onlyB, opts.log);
    const catalogB = catalog(pg);
    const hunks = expandContract(catalogA, catalogB);

    // Rollback rehearsal: a fresh database from the snapshot must equal a.
    opts.log("  rehearsing rollback from the snapshot");
    pg.psql(`drop database if exists rollback; create database rollback;`, { db: "postgres" });
    pg.psql(dump, { db: "rollback" });
    const rolledBack = catalog(pg, "rollback");
    hunks.push(...rollbackCheck(catalogA, rolledBack));

    return { result: { a: { ref: opts.a, files: filesA, catalog: catalogA }, b: { ref: opts.b, files: filesB, catalog: catalogB }, rolledBack }, hunks };
  } finally {
    pg.stop();
  }
}
