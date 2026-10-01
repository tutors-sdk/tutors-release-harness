import type { EngineConfig } from "../normalise/masks.ts";
import type { Hunk, SideCapture } from "../types.ts";
import { median, timingSamples } from "./engines.ts";
import { hunkId } from "./pages.ts";
import { mannWhitney, smallestAttainableP, smallestDetectableSlowdown } from "./stats.ts";

/**
 * The timing tolerance (since 1.26.0; runway improvement D, after Kayenta's effect-size tolerance). The timing engine
 * says "slower" when Mann-Whitney is significant and the median moved by at least `timing.minEffect` (20% in
 * normalise/masks.yaml). A significant slowdown below that floor is not reported at all, and nothing separates "slower"
 * from "slower and it matters". The tolerance draws that line: a slowdown that is significant AND at least
 * {@link TIMING_TOLERANCE} of a's median **matters**. One under it is "slower, within tolerance" and is not a finding.
 *
 * The check is its own engine, artefact `timing-tolerance`, over the same samples as `timing` (each page's TTFB, each
 * journey's duration) and the k6 leg's request durations. Its scopes are timing's, so one claim glob can name both. It
 * ships **informing** (src/compare/levels.ts), with no date. Every finding is reported and none gates. A finding says
 * whether `timing` fails it too (at or over timing's floor) or only the tolerance sees it (between the two). At 2.0 it
 * becomes blocking: a significant slowdown of 10% or more then fails a release, where today it takes 20%.
 *
 * Reported, never judged here: the smallest slowdown the samples could have detected (stats.ts), so a reader can tell
 * "within tolerance" from "could not have seen it". No result is drawn from fewer samples than timing.minRuns, or from
 * samples that could never reach alpha. Those are timing's own "Raise --runs" lines.
 */
export const TIMING_TOLERANCE = 0.1;

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

export function timingTolerance(a: SideCapture, b: SideCapture, ctx: { config: EngineConfig }): Hunk[] {
  const hunks: Hunk[] = [];
  if (a.external || b.external) return hunks;
  const { minRuns, alpha, minEffect, minShiftMs } = ctx.config.timing;

  const judge = (scope: string, path: string | undefined, label: string, xs: number[], ys: number[], unit: "runs" | "samples", ma = median(xs), mb = median(ys)) => {
    if (!xs.length || !ys.length || xs.length < minRuns || ys.length < minRuns) return;
    if (smallestAttainableP(xs.length, ys.length) >= alpha) return;
    const effect = ma > 0 ? (mb - ma) / ma : 0;
    if (effect < TIMING_TOLERANCE || mb - ma < minShiftMs) return;
    const { p } = mannWhitney(xs, ys);
    if (!(p < alpha)) return;
    const d = smallestDetectableSlowdown(xs, ys, alpha);
    const seen = effect >= minEffect ? `timing fails it too (its floor is ${pct(minEffect)})` : `under timing's ${pct(minEffect)} floor, so only the tolerance reports it`;
    hunks.push({
      id: hunkId("timing-tolerance", scope),
      artefact: "timing-tolerance",
      scope,
      ...(path ? { path } : {}),
      severity: "fail",
      summary: `${label} slower on b beyond the ${pct(TIMING_TOLERANCE)} tolerance: ${ma}ms → ${mb}ms (+${pct(effect)}, p=${p < 0.001 ? p.toExponential(1) : p.toFixed(3)}, n=${xs.length}/${ys.length} ${unit}${d === null ? "" : `; smallest detectable about ${pct(d)}`}); ${seen}`
    });
  };

  const sa = timingSamples(a);
  const sb = timingSamples(b);
  for (const [pageKey, ea] of sa.byPage) {
    const eb = sb.byPage.get(pageKey);
    if (eb) judge(pageKey, ea.path, `${pageKey} TTFB`, ea.ttfb, eb.ttfb, "samples");
  }
  for (const [journey, xs] of sa.byJourney) {
    const ys = sb.byJourney.get(journey);
    if (ys) judge(journey, undefined, `journey ${journey}`, xs, ys, "runs");
  }
  // The k6 leg: judged on its p95, as the load engine is, over every request's duration.
  if (a.load && b.load) judge("load/http_req_duration", undefined, "under load, p95", a.load.samples, b.load.samples, "samples", a.load.p95, b.load.p95);
  return hunks;
}
