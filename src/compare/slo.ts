import type { Objective, SloFile } from "../slo/schema.ts";
import type { Hunk, LoadSummary, RequestSli, SideCapture } from "../types.ts";
import { hunkId } from "./pages.ts";

/**
 * Service level objectives (since 1.34.0; tutors-sdk/tutors-mono-repo#170). Every other timing check is relative: "b is
 * slower than a". This one is absolute: does b meet the targets the monorepo's `release/slo.yaml` sets, the same
 * targets its burn-rate alerts are written against in production? A candidate as slow as a slow production passes
 * `timing`; it does not pass here, and a production that misses its own objective is said so ("production too").
 *
 * Two sources, each judged on its own, so a reader can tell the journeys' light traffic from the k6 leg's load:
 *
 *   `<id>`       the app's own /metrics, the delta across the journeys: `http_requests_total` (5xx share) and
 *                `http_request_duration_seconds_bucket` at the objective's threshold, exactly the SLI production's alerts read
 *   `<id>/load`  the k6 leg (`--load`), reader only: its 5xx share, and the share of its request durations under the threshold
 *
 * Like the policy family, only b is judged, and a finding ends "(production too)" or "(new on b)". An objective b meets
 * gets an info `<id>` hunk saying so; one that cannot be judged (no SLI exported, fewer than {@link SLO_MIN_REQUESTS}
 * requests) an info `<id>/not-evaluated`, so a quiet check reads differently from one that did not run. External sides
 * (post-deploy) carry neither source and are not judged. Without an SLO file nothing is judged and no hunk is written.
 *
 * Informing with no date (src/compare/levels.ts): every finding is reported and none gates.
 */
export const SLO_MIN_REQUESTS = 20;

interface Attainment {
  good: number;
  total: number;
}

const pct = (x: number) => `${(x * 100).toFixed(x >= 0.995 && x < 1 ? 2 : 1)}%`;
const share = (a: Attainment) => (a.total ? a.good / a.total : 1);
const leKey = (seconds: number) => String(seconds);

function sliDelta(capture: SideCapture, app: string): RequestSli | undefined {
  const after = capture.metrics.after[app]?.sli;
  if (!after) return undefined;
  const before = capture.metrics.before[app]?.sli ?? { requests: 0, serverErrors: 0, buckets: {} };
  const buckets: Record<string, number> = {};
  for (const [le, n] of Object.entries(after.buckets)) buckets[le] = n - (before.buckets[le] ?? 0);
  return { requests: after.requests - before.requests, serverErrors: after.serverErrors - before.serverErrors, buckets };
}

function fromMetrics(o: Objective, sli: RequestSli | undefined): Attainment | undefined {
  if (!sli) return undefined;
  if (o.kind === "availability") return { good: sli.requests - sli.serverErrors, total: sli.requests };
  const total = sli.buckets["+Inf"];
  const under = sli.buckets[leKey(o.threshold!)];
  return total === undefined || under === undefined ? undefined : { good: under, total };
}

function fromLoad(o: Objective, load: LoadSummary | undefined): Attainment | undefined {
  if (!load) return undefined;
  if (o.kind === "availability") return { good: load.requests - load.serverErrors, total: load.requests };
  const ms = o.threshold! * 1000;
  return { good: load.samples.filter((d) => d <= ms).length, total: load.samples.length };
}

function what(o: Objective): string {
  return o.kind === "availability" ? "not 5xx" : `under ${o.threshold}s`;
}

export function slo(a: SideCapture, b: SideCapture, file: SloFile | undefined): Hunk[] {
  if (!file || a.external || b.external) return [];
  const hunks: Hunk[] = [];
  const push = (scope: string, severity: Hunk["severity"], summary: string) => hunks.push({ id: hunkId("slo", scope), artefact: "slo", scope, severity, summary });

  const judge = (o: Objective, scope: string, source: string, onA: Attainment | undefined, onB: Attainment | undefined) => {
    if (!onB) return push(`${scope}/not-evaluated`, "info", `${o.id}: not evaluated on b: ${source} carries no ${o.kind} SLI for ${o.app}`);
    if (onB.total < SLO_MIN_REQUESTS) return push(`${scope}/not-evaluated`, "info", `${o.id}: not evaluated on b: ${onB.total} request(s) from ${source}, fewer than ${SLO_MIN_REQUESTS}`);
    const got = share(onB);
    const line = `${o.id}: ${pct(got)} of ${onB.total} ${o.app} requests ${what(o)} on b (${source}), objective ${pct(o.target)}`;
    if (got >= o.target) return push(scope, "info", `${line}: holds`);
    if (onA === undefined || onA.total < SLO_MIN_REQUESTS) return push(scope, "fail", `${line}: missed`);
    push(scope, "fail", `${line}; production ${pct(share(onA))}: missed ${share(onA) < o.target ? "(production too)" : "(new on b)"}`);
  };

  for (const o of file.objectives) {
    judge(o, o.id, "its /metrics across the journeys", fromMetrics(o, sliDelta(a, o.app)), fromMetrics(o, sliDelta(b, o.app)));
    // The k6 leg drives the reader alone (traffic/load/reader.js).
    if (o.app === "reader" && b.load) judge(o, `${o.id}/load`, "the k6 load leg", fromLoad(o, a.load), fromLoad(o, b.load));
  }
  return hunks;
}
