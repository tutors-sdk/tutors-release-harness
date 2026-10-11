import { harnessFloors, judgedObjectives, type JudgedObjective, type SloFile } from "../slo/schema.ts";
import type { Hunk, LoadSummary, RequestSli, SideCapture } from "../types.ts";
import { hunkId } from "./pages.ts";
import { normalUpperTail } from "./stats.ts";

/**
 * Service level objectives (since 1.34.0; tutors-sdk/tutors-mono-repo#170). Every other timing check is relative: "b is
 * slower than a". This one is absolute, and stricter than the monorepo: the target is the stricter of the monorepo's
 * indicative `release/slo.yaml` (what the college aims for, what production's alerts burn against) and the harness's
 * own floor (`slo/floors.yaml`), and the floors are judged alone when the monorepo keeps no file. A candidate as slow
 * as a slow production passes `timing`; it does not pass here, and a production that misses too is said so.
 *
 * Two sources, each judged on its own, so a reader can tell the journeys' light traffic from the k6 leg's load:
 *
 *   `<id>`       the app's own /metrics, the delta across the journeys: `http_requests_total` (5xx share) and
 *                `http_request_duration_seconds_bucket` at the objective's threshold, exactly the SLI production's alerts read
 *   `<id>/load`  the k6 leg (`--load`), reader only: its 5xx share, and the share of its request durations under the threshold
 *
 * Two findings per source:
 *
 *   missed       b's share of good requests is under the target; ends "(production too)" or "(new on b)"
 *   regression   (`<scope>/regression`) b's share of bad requests is significantly worse than a's (one-sided
 *                two-proportion test at {@link SLO_REGRESSION_ALPHA}), whether or not the target is met: the harness goes
 *                harder on a candidate that is getting worse, not only on one that is already bad
 *
 * An objective b meets gets an info `<id>` hunk ending "holds"; one that cannot be judged (no SLI on b, fewer than
 * {@link SLO_MIN_REQUESTS} requests) an info `.../not-evaluated`. A side b with no SLI at all (a capture recorded before
 * 1.34.0, a test fixture) and external sides (post-deploy) are not judged and write nothing.
 *
 * Informing with no date (src/compare/levels.ts): every finding is reported and none gates.
 */
export const SLO_MIN_REQUESTS = 20;
export const SLO_REGRESSION_ALPHA = 0.05;

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

function fromMetrics(o: JudgedObjective, sli: RequestSli | undefined): Attainment | undefined {
  if (!sli) return undefined;
  if (o.kind === "availability") return { good: sli.requests - sli.serverErrors, total: sli.requests };
  const total = sli.buckets["+Inf"];
  const under = sli.buckets[leKey(o.threshold!)];
  return total === undefined || under === undefined ? undefined : { good: under, total };
}

function fromLoad(o: JudgedObjective, load: LoadSummary | undefined): Attainment | undefined {
  if (!load) return undefined;
  if (o.kind === "availability") return { good: load.requests - load.serverErrors, total: load.requests };
  const ms = o.threshold! * 1000;
  return { good: load.samples.filter((d) => d <= ms).length, total: load.samples.length };
}

/** One-sided p that b's bad share is higher than a's (pooled two-proportion z-test). */
export function worseP(a: Attainment, b: Attainment): number {
  const badA = a.total - a.good;
  const badB = b.total - b.good;
  const pooled = (badA + badB) / (a.total + b.total);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / a.total + 1 / b.total));
  if (se === 0) return 1;
  return normalUpperTail((badB / b.total - badA / a.total) / se);
}

function what(o: JudgedObjective): string {
  return o.kind === "availability" ? "not 5xx" : `under ${o.threshold}s`;
}

/** The target and where it came from: "99.9% (harness floor; monorepo 99.0%)". */
function objectiveText(o: JudgedObjective): string {
  const from =
    o.floor !== undefined && o.target === o.floor && o.monorepo !== undefined && o.monorepo < o.floor ? ` (harness floor; monorepo ${pct(o.monorepo)})`
    : o.monorepo === undefined ? " (harness floor)"
    : "";
  return `${pct(o.target)}${from}`;
}

export function slo(a: SideCapture, b: SideCapture, monorepo: SloFile | undefined, floors: SloFile = harnessFloors()): Hunk[] {
  if (a.external || b.external) return [];
  if (!Object.values(b.metrics.after).some((s) => s.sli)) return [];
  const hunks: Hunk[] = [];
  const push = (scope: string, severity: Hunk["severity"], summary: string) => hunks.push({ id: hunkId("slo", scope), artefact: "slo", scope, severity, summary });

  const judge = (o: JudgedObjective, scope: string, source: string, onA: Attainment | undefined, onB: Attainment | undefined) => {
    if (!onB) return push(`${scope}/not-evaluated`, "info", `${o.id}: not evaluated on b: ${source} carries no ${o.kind} SLI for ${o.app}`);
    if (onB.total < SLO_MIN_REQUESTS) return push(`${scope}/not-evaluated`, "info", `${o.id}: not evaluated on b: ${onB.total} request(s) from ${source}, fewer than ${SLO_MIN_REQUESTS}`);
    const got = share(onB);
    const line = `${o.id}: ${pct(got)} of ${onB.total} ${o.app} requests ${what(o)} on b (${source}), objective ${objectiveText(o)}`;
    const aKnown = onA !== undefined && onA.total >= SLO_MIN_REQUESTS;
    if (got >= o.target) push(scope, "info", `${line}: holds`);
    else if (!aKnown) push(scope, "fail", `${line}: missed`);
    else push(scope, "fail", `${line}; production ${pct(share(onA))}: missed ${share(onA) < o.target ? "(production too)" : "(new on b)"}`);
    if (!aKnown) return;
    const p = worseP(onA, onB);
    if (p < SLO_REGRESSION_ALPHA && got < share(onA)) {
      push(`${scope}/regression`, "fail", `${o.id}: ${o.app} requests ${what(o)} fell from ${pct(share(onA))} of ${onA.total} on a to ${pct(got)} of ${onB.total} on b (${source}; p=${p < 0.001 ? p.toExponential(1) : p.toFixed(3)}): regressed (new on b)`);
    }
  };

  for (const o of judgedObjectives(floors, monorepo)) {
    judge(o, o.id, "its /metrics across the journeys", fromMetrics(o, sliDelta(a, o.app)), fromMetrics(o, sliDelta(b, o.app)));
    // The k6 leg drives the reader alone (traffic/load/reader.js).
    if (o.app === "reader" && b.load) judge(o, `${o.id}/load`, "the k6 load leg", fromLoad(o, a.load), fromLoad(o, b.load));
  }
  return hunks;
}
