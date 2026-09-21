import type { PersistenceBackend, WriteRecorder } from "../../src/persistence/recorder.ts";
import { normaliseWrite } from "../../src/persistence/recorder.ts";
import type { PersistenceWrite } from "../../src/types.ts";

/**
 * A second implementation of the persistence seam, shaped nothing like the
 * Supabase-REST stub: a stand-in for a Postgres-wire recorder that sees SQL
 * statements, not HTTP requests. It keeps everything in memory (no Docker, no
 * sockets) and normalises to the same `PersistenceWrite` records.
 *
 *   INSERT INTO t ... VALUES (..),(..)   -> write INSERT t, one row per tuple
 *   UPDATE t / DELETE FROM t             -> write UPDATE|DELETE t, rows unknown (0)
 *   SELECT fn(...)                       -> rpc t
 *   SELECT ... FROM t                    -> a read: not recorded
 */
export class FakePostgresWire {
  private log: PersistenceWrite[] = [];

  execute(sql: string): void {
    const text = sql.trim().replace(/\s+/g, " ");
    const ident = (s: string) => s.replace(/^"|"$/g, "").replace(/^public\./, "");
    let m: RegExpExecArray | null;
    if ((m = /^insert into ("?[\w.-]+"?)/i.exec(text))) {
      const values = text.slice(text.toLowerCase().indexOf("values") + 6);
      const rows = (values.match(/\([^()]*\)/g) ?? []).length;
      this.log.push(normaliseWrite({ kind: "write", method: "insert", table: ident(m[1]!), rows }));
    } else if ((m = /^update ("?[\w.-]+"?)/i.exec(text))) {
      this.log.push(normaliseWrite({ kind: "write", method: "update", table: ident(m[1]!) }));
    } else if ((m = /^delete from ("?[\w.-]+"?)/i.exec(text))) {
      this.log.push(normaliseWrite({ kind: "write", method: "delete", table: ident(m[1]!) }));
    } else if ((m = /^select ("?[\w.-]+"?)\(/i.exec(text)) && !/\sfrom\s/i.test(text)) {
      this.log.push(normaliseWrite({ kind: "rpc", method: "select", table: ident(m[1]!) }));
    }
  }

  reset(): void {
    this.log = [];
  }

  snapshot(): PersistenceWrite[] {
    return [...this.log];
  }
}

/** The wire fake behind the seam: what `persistenceBackend()` would hand the collector if it were configured. */
export function fakePostgresBackend(wires: Map<string, FakePostgresWire>): PersistenceBackend {
  return {
    name: "fake-postgres-wire",
    recorder(address: string): WriteRecorder {
      const wire = wires.get(address) ?? wires.set(address, new FakePostgresWire()).get(address)!;
      return { backend: "fake-postgres-wire", reset: async () => wire.reset(), writes: async () => wire.snapshot() };
    }
  };
}
