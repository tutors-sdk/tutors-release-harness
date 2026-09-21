import { readFileSync } from "node:fs";
import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { SchemaBackend, SchemaSession } from "../src/migration/backend.ts";
import { rehearseMigrations } from "../src/modes/migration.ts";
import type { ColumnInfo, SchemaCatalog } from "../src/types.ts";

const FIXTURES = resolve(import.meta.dirname, "fixtures", "migrations");

/**
 * A second implementation of the migration seam: an in-memory schema that
 * understands just enough DDL (CREATE TABLE, ALTER TABLE ADD/DROP/ALTER
 * COLUMN, CREATE/DROP INDEX, CREATE POLICY, CREATE FUNCTION) to run the
 * repository's migration fixtures. No Docker, no Postgres, no Supabase
 * baseline: the seam is the only thing it shares with the real backend.
 */
class InMemorySchema {
  tables: Record<string, Record<string, ColumnInfo>> = {};
  indexes = new Set<string>();
  functions = new Set<string>();
  policies = new Set<string>();

  private column(def: string): [string, ColumnInfo] | undefined {
    const m = /^\s*(\w+)\s+(\w+)(.*)$/is.exec(def);
    if (!m || /^(constraint|primary|check|unique|foreign)$/i.test(m[1]!)) return undefined;
    const rest = m[3]!;
    const notNull = /not null/i.test(rest) || /primary key/i.test(rest);
    const dflt = /default\s+(.+?)(?:\s+(?:not null|primary key|check|references)\b.*)?$/is.exec(rest);
    return [m[1]!.toLowerCase(), { type: m[2]!.toLowerCase(), nullable: !notNull, default: dflt ? dflt[1]!.trim() : null }];
  }

  apply(sql: string): void {
    const clean = sql.replace(/--.*$/gm, "");
    // Functions carry $$ bodies with semicolons in them: take them out first.
    for (const fn of clean.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(\w+)\s*\(([^)]*)\)/gi)) {
      const args = fn[2]!.trim() ? fn[2]!.split(",").length : 0;
      this.functions.add(`${fn[1]!.toLowerCase()}/${args}`);
    }
    const statements = clean.replace(/\$\$[\s\S]*?\$\$/g, "").split(";");
    for (const raw of statements) {
      const s = raw.trim();
      let m: RegExpExecArray | null;
      if ((m = /^create table (?:if not exists )?(\w+)\s*\(([\s\S]*)\)$/i.exec(s))) {
        const cols: Record<string, ColumnInfo> = {};
        // Split on commas that are not inside parentheses.
        for (const def of m[2]!.split(/,(?![^(]*\))/)) {
          const col = this.column(def);
          if (col) cols[col[0]] = col[1];
        }
        this.tables[m[1]!.toLowerCase()] = cols;
      } else if ((m = /^alter table (\w+) add column (?:if not exists )?([\s\S]+)$/i.exec(s))) {
        const col = this.column(m[2]!);
        if (col) this.tables[m[1]!.toLowerCase()]![col[0]] ??= col[1];
      } else if ((m = /^alter table (\w+) drop column (\w+)$/i.exec(s))) {
        delete this.tables[m[1]!.toLowerCase()]![m[2]!.toLowerCase()];
      } else if ((m = /^alter table (\w+) alter column (\w+) type (\w+)$/i.exec(s))) {
        this.tables[m[1]!.toLowerCase()]![m[2]!.toLowerCase()]!.type = m[3]!.toLowerCase();
      } else if ((m = /^create index (?:if not exists )?(\w+)/i.exec(s))) {
        this.indexes.add(m[1]!.toLowerCase());
      } else if ((m = /^drop index (?:if exists )?(\w+)$/i.exec(s))) {
        this.indexes.delete(m[1]!.toLowerCase());
      } else if ((m = /^create policy "([^"]+)" on (\w+)/i.exec(s))) {
        this.policies.add(`${m[2]!.toLowerCase()}:${m[1]}`);
      }
    }
  }

  catalog(): SchemaCatalog {
    return JSON.parse(JSON.stringify({ tables: this.tables, indexes: [...this.indexes].sort(), functions: [...this.functions].sort(), policies: [...this.policies].sort() }));
  }
}

interface FakeOptions {
  /** Restore the wrong schema, to prove the rollback check can fail through the seam. */
  breakRollback?: boolean;
}

function inMemoryBackend(events: string[], options: FakeOptions = {}): SchemaBackend {
  return {
    name: "in-memory",
    open(opts): SchemaSession {
      events.push(`open${opts.snapshot ? `:${opts.snapshot}` : ""}`);
      const db = new InMemorySchema();
      return {
        applyMigrations(dir, files) {
          for (const f of files) {
            events.push(`apply:${f}`);
            db.apply(readFileSync(join(dir, f), "utf8"));
          }
        },
        catalog: () => db.catalog(),
        snapshot: () => JSON.stringify(db.catalog()),
        restoreAndCatalog(snapshot) {
          const restored = JSON.parse(snapshot) as SchemaCatalog;
          if (options.breakRollback) restored.indexes.pop();
          return restored;
        },
        close: () => void events.push("close")
      };
    }
  };
}

/** Migration files come from a directory in tests/fixtures, as `dir:<path>` does in the real source. */
function dirSource(dirs: Record<string, string>) {
  return (ref: string, dest: string) => {
    const from = join(FIXTURES, dirs[ref]!);
    mkdirSync(dest, { recursive: true });
    const files = readdirSync(from).filter((f) => f.endsWith(".sql")).sort();
    for (const f of files) writeFileSync(join(dest, f), readFileSync(join(from, f)));
    return files;
  };
}

const run = (b: string, options: FakeOptions = {}) => {
  const events: string[] = [];
  const source = dirSource({ a: "a", "b-good": "b-good", "b-bad": "b-bad" });
  const out = rehearseMigrations({ backend: inMemoryBackend(events, options), source }, { a: "a", b, workDir: mkdtempSync(join(tmpdir(), "harness-mig-")), log: () => {} });
  return { ...out, events };
};

describe("migration mode on a second backend", () => {
  it("a purely additive candidate: only informational hunks, and the rollback restores a exactly", () => {
    const { hunks, events, result } = run("b-good");
    expect(hunks.filter((h) => h.severity === "fail")).toEqual([]);
    expect(hunks.map((h) => h.summary)).toEqual(expect.arrayContaining(["new column app_errors.release (text)", "new index idx_app_errors_release", "new policy app_errors:anon_update_app_errors", "rollback restores version a's schema exactly"]));
    expect(result.a.files).toEqual(["20260822_create_app_errors.sql"]);
    expect(result.b.files).toEqual(["20260822_create_app_errors.sql", "20260901_expand_app_errors.sql"]);
    // Backend calls, in the order the rehearsal makes them: a's files, then only what b adds, and the session is always closed.
    expect(events).toEqual(["open", "apply:20260822_create_app_errors.sql", "apply:20260901_expand_app_errors.sql", "close"]);
  });

  it("a contracting candidate fails expand/contract exactly as it would on Postgres", () => {
    const { hunks } = run("b-bad");
    const failing = hunks.filter((h) => h.severity === "fail").map((h) => h.scope);
    expect(failing).toEqual(expect.arrayContaining(["app_errors.user_agent", "app_errors.context", "app_errors.tenant", "idx_app_errors_level"]));
    expect(hunks.find((h) => h.scope === "app_errors.user_agent")!.summary).toMatch(/dropped or renamed while version a still reads it/);
    expect(hunks.find((h) => h.scope === "app_errors.context")!.summary).toMatch(/changed type jsonb → json/);
    expect(hunks.find((h) => h.scope === "app_errors.tenant")!.summary).toMatch(/NOT NULL with no default/);
  });

  it("a rollback that does not reproduce a's schema fails, through the same seam", () => {
    const { hunks } = run("b-good", { breakRollback: true });
    expect(hunks.find((h) => h.scope === "rollback")).toMatchObject({ severity: "fail" });
  });

  it("a candidate identical to a adds no migrations and no hunks but the rollback note", () => {
    const events: string[] = [];
    const source = dirSource({ a: "a" });
    const { hunks } = rehearseMigrations({ backend: inMemoryBackend(events), source }, { a: "a", b: "a", workDir: mkdtempSync(join(tmpdir(), "harness-mig-")), log: () => {} });
    expect(hunks.map((h) => h.scope)).toEqual(["rollback"]);
    expect(events).toEqual(["open", "apply:20260822_create_app_errors.sql", "close"]);
  });

  it("the session is closed even when a migration fails", () => {
    const events: string[] = [];
    const backend = inMemoryBackend(events);
    const boom: SchemaBackend = { name: "boom", open: (o) => ({ ...backend.open(o), applyMigrations: () => { throw new Error("syntax error"); } }) };
    expect(() => rehearseMigrations({ backend: boom, source: dirSource({ a: "a" }) }, { a: "a", b: "a", workDir: mkdtempSync(join(tmpdir(), "harness-mig-")), log: () => {} })).toThrow(/syntax error/);
    expect(events).toEqual(["open", "close"]);
  });

  it("a snapshot is handed to the backend, which alone knows what it is", () => {
    const events: string[] = [];
    rehearseMigrations({ backend: inMemoryBackend(events), source: dirSource({ a: "a" }) }, { a: "a", b: "a", snapshot: "prod.dump", workDir: mkdtempSync(join(tmpdir(), "harness-mig-")), log: () => {} });
    expect(events[0]).toBe("open:prod.dump");
  });
});
