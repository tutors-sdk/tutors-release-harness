import { persistenceBackend } from "../persistence/recorder.ts";
import "../persistence/supabase-rest.ts";
import type { PersistenceWrite } from "../types.ts";

/**
 * The persistence collector is backend-agnostic (src/persistence/recorder.ts):
 * these helpers resolve the configured backend's recorder for a side's stub
 * address and use it. The Supabase-REST stub is the default backend.
 */

/** Clear the side's persistence stub before a journey so the writes it records are that journey's. */
export async function resetWrites(url: string): Promise<void> {
  await persistenceBackend().recorder(url).reset();
}

/** What the stub recorded, in order, without its sequence numbers. */
export async function fetchWrites(url: string): Promise<PersistenceWrite[]> {
  return persistenceBackend().recorder(url).writes();
}
