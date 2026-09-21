/**
 * The persistence seam: what the harness needs from whatever a side persists
 * to, and nothing about how that backend is shaped.
 *
 * A backend (a Supabase-REST stub today; a Postgres-wire proxy or something
 * else when the monorepo leaves Supabase) answers one question: "what did the
 * side try to write during this journey?", as normalised records by table (or
 * collection) and method. The collector resets a recorder before a journey and
 * reads it after; the diff engine and the anonymous-write rule consume only
 * `PersistenceWrite`, so they never learn which backend produced it.
 */
import type { PersistenceWrite } from "../types.ts";

export type { PersistenceWrite };

/** Records every write one side makes, for one journey at a time. */
export interface WriteRecorder {
  /** Which backend this is (`supabase-rest`, …); for logs and errors only, never for behaviour. */
  readonly backend: string;
  /** Forget everything recorded so far, so what `writes()` returns is the next journey's. */
  reset(): Promise<void>;
  /** What was recorded since the last reset, oldest first, normalised. */
  writes(): Promise<PersistenceWrite[]>;
}

/** A persistence backend the harness knows how to record. */
export interface PersistenceBackend {
  readonly name: string;
  /** A recorder for the stub or proxy at `address` (the URL the side is configured with). */
  recorder(address: string): WriteRecorder;
}

/** What a backend may report before normalisation; everything but `table` is optional. */
export interface RawWrite {
  kind?: string;
  method?: string;
  table: string;
  rows?: number;
}

/**
 * The normal form every backend must produce: `kind` is `write` or `rpc`,
 * `method` upper case, `rows` a non-negative integer (0 when the backend does
 * not say). The diff engine's tally and the anonymous rule rely on this.
 */
export function normaliseWrite(raw: RawWrite): PersistenceWrite {
  const rows = Number.isFinite(raw.rows) && (raw.rows as number) > 0 ? Math.floor(raw.rows as number) : 0;
  return { kind: raw.kind === "rpc" ? "rpc" : "write", method: (raw.method ?? "").toUpperCase(), table: raw.table, rows };
}

const BACKENDS = new Map<string, PersistenceBackend>();

export function registerPersistenceBackend(backend: PersistenceBackend): void {
  BACKENDS.set(backend.name, backend);
}

export const DEFAULT_PERSISTENCE_BACKEND = "supabase-rest";

/**
 * The backend named by `HARNESS_PERSISTENCE_BACKEND` (default
 * `supabase-rest`). An unknown name is an error, not a fallback: recording
 * with the wrong backend would silently record nothing.
 */
export function persistenceBackend(name: string | undefined = process.env.HARNESS_PERSISTENCE_BACKEND): PersistenceBackend {
  const wanted = name?.trim() || DEFAULT_PERSISTENCE_BACKEND;
  const found = BACKENDS.get(wanted);
  if (!found) throw new Error(`unknown persistence backend "${wanted}" (HARNESS_PERSISTENCE_BACKEND); known: ${[...BACKENDS.keys()].sort().join(", ")}`);
  return found;
}
