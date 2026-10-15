import { xmr, type XmrLimits } from "../readiness/control.ts";
import type { RunReport } from "../types.ts";

/**
 * Timing on control charts, on the A3 (since 1.39.0). Lean's reading of a duration: production's own variation sets
 * the natural limits, and only a point outside them is a special cause worth investigating. Advice: never a failure.
 *
 * Per journey, night by night from the kept forecasts that recorded `timingControl`: production's median and main's.
 * The limits are the XmR limits of production's nightly medians once there are two nights, else of production's runs
 * in the newest forecast (in-run). Main's newest median above the UCL or below the LCL is the outlier.
 */
export interface TimingNight {
  ranAt: string;
  production: number;
  main: number;
}

export interface TimingJourney {
  journey: string;
  nights: TimingNight[];
  limits: XmrLimits;
  /** Where the limits come from: production's nightly medians, or its runs in the newest forecast. */
  from: "nights" | "runs";
  /** Main's newest median against the limits. */
  state: "above UCL" | "below LCL" | "inside";
  words: string;
}

export interface TimingCharts {
  journeys: TimingJourney[];
}

type Run = { ranAt: string; report?: Pick<RunReport, "timingControl"> };

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2);
};

/** `runs` are the kept Main to RC forecasts, any order; the newest that recorded timing is the subject. */
export function timingCharts(runs: Run[]): TimingCharts | undefined {
  const kept = runs.filter((r) => r.report?.timingControl?.journeys.length).sort((x, y) => Date.parse(x.ranAt) - Date.parse(y.ranAt)).slice(-30);
  const newest = kept.at(-1);
  if (!newest) return undefined;
  const journeys: TimingJourney[] = [];
  for (const j of newest.report!.timingControl!.journeys) {
    const nights = kept.flatMap((r) => {
      const c = r.report!.timingControl!.journeys.find((x) => x.journey === j.journey);
      return c && c.a.length && c.b.length ? [{ ranAt: r.ranAt, production: median(c.a), main: median(c.b) }] : [];
    });
    const overNights = nights.length >= 2 ? xmr(nights.map((n) => n.production)) : null;
    const limits = overNights ?? j.limits;
    if (!limits || !nights.length) continue;
    const main = nights.at(-1)!.main;
    const state = main > limits.ucl ? "above UCL" : main < limits.lcl ? "below LCL" : "inside";
    const range = `${Math.round(limits.lcl)}–${Math.round(limits.ucl)}ms`;
    const basis = overNights ? `production's last ${plural(nights.length, "night")}` : `production's ${plural(limits.n, "run")} tonight`;
    const words =
      state === "inside"
        ? `main ${main}ms is inside the limits from ${basis} (${range}): common cause, nothing to investigate`
        : `main ${main}ms is ${state === "above UCL" ? "above" : "below"} the limits from ${basis} (${range}): a special cause to investigate, not a failure`;
    journeys.push({ journey: j.journey, nights, limits, from: overNights ? "nights" : "runs", state, words: `${words}${limits.provisional ? `; provisional limits, ${plural(limits.n, overNights ? "night" : "run")}` : ""}` });
  }
  return journeys.length ? { journeys: journeys.sort((x, y) => Number(y.state !== "inside") - Number(x.state !== "inside") || x.journey.localeCompare(y.journey)) } : undefined;
}

function plural(n: number, one: string): string {
  return `${n} ${n === 1 ? one : `${one}s`}`;
}
