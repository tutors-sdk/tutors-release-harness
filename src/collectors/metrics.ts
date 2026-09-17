import type { MetricsSnapshot } from "../types.ts";

/**
 * Parse Prometheus text exposition into series name -> summed value. Labels
 * are dropped: the harness compares which series exist and how much counters
 * moved under identical traffic, not per-label values.
 */
export function parseMetrics(text: string): MetricsSnapshot {
  const series: Record<string, number> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]*\})?\s+(-?[0-9.eE+-]+|NaN|[+-]?Inf)/.exec(line);
    if (!match) continue;
    const name = match[1]!;
    const value = Number(match[3]);
    if (Number.isNaN(value)) continue;
    series[name] = (series[name] ?? 0) + value;
  }
  return { series };
}

export async function fetchMetrics(baseUrl: string): Promise<MetricsSnapshot> {
  const response = await fetch(`${baseUrl}/metrics`);
  if (!response.ok) throw new Error(`GET ${baseUrl}/metrics -> ${response.status}`);
  return parseMetrics(await response.text());
}
