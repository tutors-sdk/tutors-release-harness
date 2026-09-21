import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { COMPOSE_PROJECT, ROOT, docker } from "../stack.ts";
import type { SchemaCatalog } from "../types.ts";
import type { SchemaBackend, SchemaSession } from "./backend.ts";

const PG_IMAGE = process.env.HARNESS_POSTGRES_IMAGE ?? "postgres:16-alpine";
const DB = "tutors";

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
  const container = `${COMPOSE_PROJECT}-pg-${Date.now()}`;
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

/**
 * First implementation of the seam: a throwaway `postgres:16-alpine` in
 * Docker, with fixtures/migrations/supabase-baseline.sql standing in for what
 * Supabase provisions. Needs Docker; nothing in the unit tests uses it.
 */
export const supabasePostgres: SchemaBackend = {
  name: "supabase-postgres",
  open(opts): SchemaSession {
    const pg = startPostgres(opts.log);
    try {
      // Supabase provisions roles and schemas the migrations take for granted.
      pg.psql(readFileSync(resolve(ROOT, "fixtures", "migrations", "supabase-baseline.sql"), "utf8"));
      if (opts.snapshot) {
        opts.log(`restoring snapshot ${opts.snapshot}`);
        pg.psql(readFileSync(opts.snapshot, "utf8"));
      }
    } catch (e) {
      pg.stop();
      throw e;
    }
    return {
      applyMigrations(dir, files, log) {
        for (const file of files) {
          log(`  applying ${file}`);
          pg.psql(readFileSync(join(dir, file), "utf8"));
        }
      },
      catalog: () => catalog(pg),
      snapshot: () => docker(["exec", pg.container, "pg_dump", "-U", "postgres", "--no-owner", DB], { quiet: true }),
      restoreAndCatalog(snapshot) {
        pg.psql(`drop database if exists rollback; create database rollback;`, { db: "postgres" });
        pg.psql(snapshot, { db: "rollback" });
        return catalog(pg, "rollback");
      },
      close: () => void pg.stop()
    };
  }
};
