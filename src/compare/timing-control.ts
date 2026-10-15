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

/** One line for a journey: where b's runs sit against production's limits, in words. */
export function controlLine(j: JourneyControl): string {
  if (!j.limits) return `${j.journey}: production has fewer than two runs, so no limits`;
  const l = j.limits;
  const where = `production's limits ${Math.round(l.lcl)}–${Math.round(l.ucl)}ms (centre ${Math.round(l.centre)}ms${l.provisional ? `, provisional: ${l.n} runs` : ""})`;
  const out = j.above + j.below;
  if (!out) return `${j.journey}: every run on b inside ${where}: common cause`;
  return `${j.journey}: ${out} of ${j.b.length} runs on b outside ${where}${j.above ? `, ${j.above} above` : ""}${j.below ? `, ${j.below} below` : ""}: special cause, investigate`;
}
