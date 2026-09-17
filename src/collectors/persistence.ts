import type { PersistenceWrite } from "../types.ts";

/** The stub's URL as the browser and containers see it, rewritten for the harness's own Node process. */
function fromHost(stubUrl: string): string {
  return stubUrl.replace(/persistence-[ab]\.harness\.test/, "localhost");
}

/** Clear the side's persistence stub before a journey so the writes it records are that journey's. */
export async function resetWrites(url: string): Promise<void> {
  const stubUrl = fromHost(url);
  const response = await fetch(`${stubUrl}/_harness/reset`, { method: "POST" });
  if (!response.ok) throw new Error(`POST ${stubUrl}/_harness/reset -> ${response.status}`);
}

/** What the stub recorded, in order, without its sequence numbers. */
export async function fetchWrites(url: string): Promise<PersistenceWrite[]> {
  const stubUrl = fromHost(url);
  const response = await fetch(`${stubUrl}/_harness/writes`);
  if (!response.ok) throw new Error(`GET ${stubUrl}/_harness/writes -> ${response.status}`);
  const raw = (await response.json()) as { kind: "write" | "rpc"; method: string; table: string; rows?: number }[];
  return raw.map((w) => ({ kind: w.kind, method: w.method, table: w.table, rows: w.rows ?? 0 }));
}
