import type { PersistenceBackend, WriteRecorder } from "./recorder.ts";
import { normaliseWrite, registerPersistenceBackend } from "./recorder.ts";

/** The stub's URL as the browser and containers see it, rewritten for the harness's own Node process. */
function fromHost(stubUrl: string): string {
  return stubUrl.replace(/persistence-[ab]\.harness\.test/, "localhost");
}

type Fetch = typeof fetch;

/**
 * First implementation of the seam: the Supabase-REST-shaped stub in
 * fixtures/persistence/stub.mjs. It answers reads with nothing and records
 * writes, which the harness reads over `/_harness/writes` and clears over
 * `/_harness/reset`.
 */
export function supabaseRestBackend(fetchImpl: Fetch = (input, init) => fetch(input, init)): PersistenceBackend {
  return {
    name: "supabase-rest",
    recorder(address: string): WriteRecorder {
      const stubUrl = fromHost(address);
      return {
        backend: "supabase-rest",
        async reset() {
          const response = await fetchImpl(`${stubUrl}/_harness/reset`, { method: "POST" });
          if (!response.ok) throw new Error(`POST ${stubUrl}/_harness/reset -> ${response.status}`);
        },
        async writes() {
          const response = await fetchImpl(`${stubUrl}/_harness/writes`);
          if (!response.ok) throw new Error(`GET ${stubUrl}/_harness/writes -> ${response.status}`);
          const raw = (await response.json()) as { kind: "write" | "rpc"; method: string; table: string; rows?: number }[];
          return raw.map(normaliseWrite);
        }
      };
    }
  };
}

registerPersistenceBackend(supabaseRestBackend());
