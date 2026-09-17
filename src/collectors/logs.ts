import type { LogSummary } from "../types.ts";

/**
 * Summarise a service's log output: how many lines, how many were JSON, the
 * level histogram, the set of keys seen, and how many lines carried a request
 * id. The harness compares shape and volume, never the text of a line.
 */
export function summariseLogs(raw: string): LogSummary {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const byLevel: Record<string, number> = {};
  const keys = new Set<string>();
  let jsonLines = 0;
  let withRequestId = 0;
  for (const line of lines) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) continue;
    jsonLines += 1;
    const record = parsed as Record<string, unknown>;
    for (const key of Object.keys(record)) keys.add(key);
    const level = typeof record.level === "string" ? record.level : typeof record.level === "number" ? String(record.level) : "none";
    byLevel[level] = (byLevel[level] ?? 0) + 1;
    if (record.requestId || record.request_id || record.reqId || record["x-request-id"]) withRequestId += 1;
  }
  return {
    lines: lines.length,
    jsonLines,
    byLevel,
    keys: [...keys].sort(),
    requestIdRatio: jsonLines ? Number((withRequestId / jsonLines).toFixed(3)) : 0
  };
}
