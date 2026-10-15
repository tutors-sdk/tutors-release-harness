import { xmr, type XmrLimits } from "../readiness/control.ts";
import type { SideCapture } from "../types.ts";

/**
 * Timing on a control chart (since 1.39.0). Timing never fails a release (1.38.0); instead each journey's durations on
 * b are read against production's natural limits, an XmR chart of a's runs: a run on b above the UCL or below the LCL
 * is a special cause, an outlier to investigate, and a run inside them is the common-cause variation production has
 * anyway. The A3 extends the chart across nights from the kept reports (src/a3/timing.ts).
 */
export interface JourneyControl {
  journey: string;
  /** Each completed run's duration in ms, in run order. */
  a: number[];
  b: number[];
  /** XmR limits of a's runs; absent with fewer than two. */
  limits?: XmrLimits;
  /** b's runs above the UCL, and below the LCL. */
  above: number;
  below: number;
}

export interface TimingControl {
  journeys: JourneyControl[];
}

export function timingControl(a: SideCapture, b: SideCapture): TimingControl | undefined {
  if (a.external || b.external) return undefined;
  const runs = (c: SideCapture) => {
    const by = new Map<string, number[]>();
    for (const j of [...c.journeys].sort((x, y) => x.run - y.run)) if (!j.error) by.set(j.journey, [...(by.get(j.journey) ?? []), j.durationMs]);
    return by;
  };
  const ra = runs(a);
  const rb = runs(b);
  const journeys: JourneyControl[] = [];
  for (const [journey, xs] of ra) {
    const ys = rb.get(journey);
    if (!ys) continue;
    const limits = xmr(xs) ?? undefined;
    journeys.push({ journey, a: xs, b: ys, ...(limits ? { limits } : {}), above: limits ? ys.filter((y) => y > limits.ucl).length : 0, below: limits ? ys.filter((y) => y < limits.lcl).length : 0 });
  }
  return journeys.length ? { journeys: journeys.sort((x, y) => x.journey.localeCompare(y.journey)) } : undefined;
}

/**
 * Since 1.39.1: whether b's median is outside production's limits, the reading that flags a journey. A single run
 * outside is reported but does not flag it: the first run of every journey is a cold start on both sides (15 Oct 2026:
 * production 6480ms then about 4000ms; main 6610ms then about 3900ms), so one cold run just over the UCL is the same
 * special cause production has, not a change in main.
 */
export function controlState(j: JourneyControl): "inside" | "above UCL" | "below LCL" | "no limits" {
  if (!j.limits || !j.b.length) return "no limits";
  const m = median(j.b);
  return m > j.limits.ucl ? "above UCL" : m < j.limits.lcl ? "below LCL" : "inside";
}

/** One line for a journey: where b's median, and any single run, sits against production's limits, in words. */
export function controlLine(j: JourneyControl): string {
  if (!j.limits) return `${j.journey}: production has fewer than two runs, so no limits`;
  const l = j.limits;
  const where = `production's limits ${Math.round(l.lcl)}–${Math.round(l.ucl)}ms (centre ${Math.round(l.centre)}ms${l.provisional ? `, provisional: ${l.n} runs` : ""})`;
  const state = controlState(j);
  const out = j.above + j.below;
  const runs = out ? `; ${out} of ${j.b.length} single runs outside${j.above ? `, ${j.above} above` : ""}${j.below ? `, ${j.below} below` : ""}` : "";
  if (state === "inside") return `${j.journey}: main's median ${Math.round(median(j.b))}ms inside ${where}${runs}: common cause`;
  return `${j.journey}: main's median ${Math.round(median(j.b))}ms ${state === "above UCL" ? "above" : "below"} ${where}${runs}: special cause, investigate`;
}

function median(xs: number[]): number {
  const s = [...xs].sort((p, q) => p - q);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}
