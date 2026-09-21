/**
 * The migration seam: the backend-specific half of migration mode.
 *
 * Mode's rule (expand/contract, in src/modes/migration.ts) works on schema
 * catalogues and is backend-agnostic. What is not is how you get one: start a
 * database, load the platform's baseline (Supabase provisions roles and
 * schemas that migrations take for granted), apply migration files, read the
 * catalogue back, snapshot and restore for the rollback rehearsal. That is
 * this interface. `supabase-postgres` is the first implementation; a
 * successor backend implements the same five operations.
 */
import type { SchemaCatalog } from "../types.ts";

/** One open database the rehearsal runs against. */
export interface SchemaSession {
  /** Apply migration files (already sorted) from `dir`, in order. */
  applyMigrations(dir: string, files: string[], log: (m: string) => void): void;
  /** The schema as it is now. */
  catalog(): SchemaCatalog;
  /** A restorable snapshot of the current state (the rollback point). Opaque to the rehearsal. */
  snapshot(): string;
  /** Restore `snapshot` into a fresh database and read its catalogue: the rollback rehearsal. */
  restoreAndCatalog(snapshot: string): SchemaCatalog;
  /** Release everything the session holds (a container, a connection). Always called. */
  close(): void;
}

export interface SchemaBackend {
  readonly name: string;
  /**
   * Start an empty database with the platform baseline loaded and, when given,
   * a sanitised production snapshot restored on top (a backend-specific file).
   */
  open(opts: { snapshot?: string; log: (m: string) => void }): SchemaSession;
}

/** Where a ref's migration files come from: fetch them into `dest` and return their names, sorted. */
export type MigrationSource = (ref: string, dest: string, log: (m: string) => void) => string[];
