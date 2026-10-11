import type { MetricsSnapshot, RequestSli } from "../types.ts";

const LABEL = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:[^"\\]|\\.)*)"/g;

function labelsOf(text: string | undefined): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const m of (text ?? "").matchAll(LABEL)) labels[m[1]!] = m[2]!;
  return labels;
}

/**
 * Parse Prometheus text exposition into series name -> summed value. Labels
 * are dropped: the harness compares which series exist and how much counters
 * moved under identical traffic, not per-label values.
 *
 * Since 1.34.0 the request SLIs are kept beside them (`sli`): the two labels an
 * SLO is written against, `status_code` (5xx) and `le`, read before the sum.
 */
export function parseMetrics(text: string): MetricsSnapshot {
  const series: Record<string, number> = {};
  const sli: RequestSli = { requests: 0, serverErrors: 0, buckets: {} };
  let sliSeen = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]*\})?\s+(-?[0-9.eE+-]+|NaN|[+-]?Inf)/.exec(line);
    if (!match) continue;
    const name = match[1]!;
    const value = Number(match[3]);
    if (Number.isNaN(value)) continue;
    series[name] = (series[name] ?? 0) + value;
    if (name === "http_requests_total") {
      sliSeen = true;
      sli.requests += value;
      if (/^5\d\d$/.test(labelsOf(match[2]).status_code ?? "")) sli.serverErrors += value;
    } else if (name === "http_request_duration_seconds_bucket") {
      const le = labelsOf(match[2]).le;
      if (le === undefined) continue;
      sliSeen = true;
      sli.buckets[le] = (sli.buckets[le] ?? 0) + value;
    }
  }
  return sliSeen ? { series, sli } : { series };
}

export async function fetchMetrics(baseUrl: string): Promise<MetricsSnapshot> {
  const response = await fetch(`${baseUrl}/metrics`);
  if (!response.ok) throw new Error(`GET ${baseUrl}/metrics -> ${response.status}`);
  return parseMetrics(await response.text());
}
