/**
 * The soak toward 2.0 (since 1.25.0): the count of clean nights the go-live release waits on, and, per check that 2.0
 * may make blocking, whether it has stayed quiet and whether its planted mutant is caught. A panel on the readiness page
 * and `soak` in readiness.json, so the count is read, never worked out by hand.
 *
 * The rule, from the runway to 2.0 ("The gate into 2.0"):
 *
 *   clean night   the nightly A/A of that UTC night was clean and verified (every A/A that night, in noise-history.json),
 *                 AND the Main to RC forecast of that night measured side a against a second production stack (a2, the
 *                 in-run noise) with no difference
 *   paused        the A/A was clean and Main to RC skipped a pair it had already judged, so a-to-a2 was not measured
 *                 again: the night neither counts nor breaks the run of clean nights
 *   broken        anything else: an A/A with differences or weak evidence, no A/A, a forecast with a-to-a2
 *                 differences, a forecast without a2, a Main to RC run that did not judge or did not run
 *   not yet       tonight, before its A/A and its forecast have both finished: neither counts nor breaks
 *
 * The count is the clean nights since the last broken one, from {@link SOAK_FROM}; {@link SOAK_TARGET} of them in a row
 * is the first condition. The others are per check: every check that may become blocking has a planted mutant the
 * weekly self-test caught, and has stayed quiet (no finding on b) for as many judged nights. A check that fires on
 * production too (no HEALTHCHECK, no SLSA provenance) cannot stay quiet until the monorepo fixes production: the panel
 * says so in words rather than counting it down.
 *
 * Pure, and advisory like the rest of the page: nothing here is an input to the Gate, a verdict, an engine level or an
 * exit code. Promoting a check stays a change to ENGINE_LEVELS (src/compare/levels.ts), made by a person, at 2.0.
 */
import { ENGINE_LEVELS, levelOn } from "../compare/levels.ts";
import type { WeeklyMutants } from "../a3/quality.ts";
import type { Night } from "./model.ts";

/**
 * The checks the soak watches: every engine that ships informing (src/compare/levels.ts), the ones 2.0 may promote.
 * The policy family since 1.25.0, the timing tolerance since 1.26.0. A check made blocking leaves the list.
 */
export const SOAK_CHECKS: readonly string[] = Object.entries(ENGINE_LEVELS).filter(([, l]) => l.level === "informing").map(([e]) => e);

/** The first night the soak counts: the night after the a2 stack was switched on for every Main to RC run (1.25.0). */
export const SOAK_FROM = "2026-10-02";
/** Consecutive clean nights 2.0 waits on. */
export const SOAK_TARGET = 10;
/** Nights the panel lists at most, newest first. */
export const SOAK_SHOWN = 21;

export type AaState = "clean" | "unclean" | "degraded" | "missing";
export type A2State = "clean" | "differences" | "not measured" | "unchanged" | "not judged" | "did not run" | "not known" | "pending";
export type SoakNightState = "clean" | "paused" | "broken" | "not yet";

/** One nightly A/A, as noise-history.json records it. */
export interface AaNight {
  ranAt: string;
  hunks: number;
  degraded: string[];
}

/** What the soak reads of a kept forecast: its in-run noise and what each policy check found on b. */
export interface SoakForecast {
  ranAt: string;
  /** a-to-a2 differences; absent when the forecast ran without a2 (or before 1.24.0). */
  a2Hunks?: number;
  /** Per informing check (SOAK_CHECKS): findings on b no claim covers, and how many of them production has too. Absent before 1.22.0. */
  policy?: Partial<Record<string, { findings: number; productionToo: number }>>;
}

export interface SoakNight {
  night: string;
  state: SoakNightState;
  aa: { state: AaState; runs: number; hunks: number };
  a2: { state: A2State; hunks?: number };
  /** The streak after this night. */
  streak: number;
  note: string;
}

export interface SoakCheck {
  check: string;
  level: "blocking" | "informing";
  blockingFrom?: string;
  /** Judged nights in a row, newest back to the soak's start, with no finding of this check on b. */
  quietNights: number;
  /** The newest judged night with a finding: how many, and how many production has too. */
  lastFinding?: { night: string; findings: number; productionToo: number };
  mutant: { names: string[]; state: "caught" | "escaped" | "not run yet" | "none"; ranAt?: string; runUrl?: string };
  /** Quiet for the target and its mutant caught: what 2.0 asks before the check may become blocking. */
  eligible: boolean;
  why: string;
}

export interface Soak {
  from: string;
  target: number;
  /** Clean nights since the last broken one. */
  clean: number;
  met: boolean;
  /** The newest broken night, when there is one since the start. */
  brokenOn?: string;
  /** Newest first, at most {@link SOAK_SHOWN}. */
  nights: SoakNight[];
  checks: SoakCheck[];
  /** The newest weekly mutants self-test. */
  mutants: { ranAt: string; caught: number | null; total: number; runUrl?: string } | null;
  /** One sentence for the top of the panel. */
  headline: string;
}

export interface SoakInputs {
  now: Date;
  /** Every night from SOAK_FROM to tonight, newest first, as the readiness page reads Main to RC. */
  nights: Pick<Night, "night" | "state" | "forecasts">[];
  /** The kept forecasts' soak facts, by forecast id. */
  facts: Record<string, SoakForecast>;
  /** noise-history.json's entries; undefined when it was not read. */
  aa?: AaNight[];
  mutants?: WeeklyMutants[];
  /** Each policy check's planted mutants by name (mutants/mutants.yaml). */
  planted: Partial<Record<string, string[]>>;
  from?: string;
  target?: number;
}

const nightOf = (iso: string) => new Date(Date.parse(iso)).toISOString().slice(0, 10);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function aaOf(entries: AaNight[] | undefined, night: string): SoakNight["aa"] {
  const those = (entries ?? []).filter((e) => Number.isFinite(Date.parse(e.ranAt)) && nightOf(e.ranAt) === night);
  const hunks = those.reduce((n, e) => n + (e.hunks > 0 ? e.hunks : 0), 0);
  if (!those.length) return { state: "missing", runs: 0, hunks: 0 };
  if (those.some((e) => e.degraded.length)) return { state: "degraded", runs: those.length, hunks };
  if (hunks > 0) return { state: "unclean", runs: those.length, hunks };
  return { state: "clean", runs: those.length, hunks: 0 };
}

function a2Of(n: SoakInputs["nights"][number], facts: SoakInputs["facts"]): SoakNight["a2"] {
  if (n.state === "judged") {
    const measured = n.forecasts.map((f) => facts[f.id]?.a2Hunks).filter((h): h is number => typeof h === "number");
    if (measured.length < n.forecasts.length) return { state: "not measured" };
    const hunks = measured.reduce((a, b) => a + b, 0);
    return hunks ? { state: "differences", hunks } : { state: "clean", hunks: 0 };
  }
  if (n.state === "unchanged") return { state: "unchanged" };
  if (n.state === "running" || n.state === "not yet") return { state: "pending" };
  return { state: n.state };
}

function nightState(night: string, today: string, aa: SoakNight["aa"], a2: SoakNight["a2"]): { state: SoakNightState; note: string } {
  const aaWords = aa.state === "clean" ? "A/A clean" : aa.state === "missing" ? "no A/A" : aa.state === "degraded" ? "A/A on weak evidence" : `A/A ${plural(aa.hunks, "difference")}`;
  const a2Words =
    a2.state === "clean"
      ? "a-to-a2 clean"
      : a2.state === "differences"
        ? `a-to-a2 ${plural(a2.hunks ?? 0, "difference")}`
        : a2.state === "not measured"
          ? "the forecast ran without a2"
          : a2.state === "unchanged"
            ? "main unchanged, a-to-a2 not measured again"
            : a2.state === "pending"
              ? "Main to RC still to finish"
              : `Main to RC ${a2.state}`;
  const pending = night === today && (aa.state === "missing" || a2.state === "pending" || a2.state === "did not run" || a2.state === "not known");
  if (pending) return { state: "not yet", note: `${aaWords}; ${a2Words}: tonight is not over.` };
  if (aa.state === "clean" && a2.state === "clean") return { state: "clean", note: `${aaWords}; ${a2Words}.` };
  if (aa.state === "clean" && a2.state === "unchanged") return { state: "paused", note: `${aaWords}; ${a2Words}: neither counts nor breaks.` };
  return { state: "broken", note: `${aaWords}; ${a2Words}.` };
}

/** The newest weekly self-test that planted any of `names`, and whether every one was caught. */
function mutantOf(names: string[], mutants: WeeklyMutants[] | undefined): SoakCheck["mutant"] {
  if (!names.length) return { names, state: "none" };
  const run = [...(mutants ?? [])].reverse().find((m) => m.planted?.some((n) => names.includes(n)));
  if (!run) return { names, state: "not run yet" };
  const at = { ranAt: run.ranAt, ...(run.runUrl ? { runUrl: run.runUrl } : {}) };
  if (run.caught === null || names.some((n) => !run.planted!.includes(n) || run.escaped?.includes(n))) return { names, state: "escaped", ...at };
  return { names, state: "caught", ...at };
}

export function buildSoak(i: SoakInputs): Soak {
  const from = i.from ?? SOAK_FROM;
  const target = i.target ?? SOAK_TARGET;
  const today = i.now.toISOString().slice(0, 10);
  const counted = i.nights.filter((n) => n.night >= from && n.night <= today);
  // Oldest first, to count the run of clean nights forward.
  const forward = [...counted].reverse();
  let streak = 0;
  let brokenOn: string | undefined;
  const rows: SoakNight[] = [];
  for (const n of forward) {
    const aa = aaOf(i.aa, n.night);
    const a2 = a2Of(n, i.facts);
    const { state, note } = i.aa === undefined && n.night !== today ? { state: "broken" as const, note: "The A/A history (noise-history.json) was not read, so this night cannot be counted." } : nightState(n.night, today, aa, a2);
    if (state === "clean") streak += 1;
    if (state === "broken") {
      streak = 0;
      brokenOn = n.night;
    }
    rows.push({ night: n.night, state, aa, a2, streak, note });
  }
  const met = streak >= target;

  // Per check: quiet judged nights, newest back, from the lead forecast of each judged night since the start.
  const judged = counted.filter((n) => n.state === "judged" && n.forecasts.length);
  const checks: SoakCheck[] = SOAK_CHECKS.map((check) => {
    const level = levelOn(check, i.now, ENGINE_LEVELS);
    let quietNights = 0;
    let lastFinding: SoakCheck["lastFinding"];
    for (const n of judged) {
      const got = i.facts[n.forecasts[0]!.id]?.policy?.[check];
      if (!got) break;
      if (got.findings > 0) {
        lastFinding = { night: n.night, findings: got.findings, productionToo: got.productionToo };
        break;
      }
      quietNights += 1;
    }
    const mutant = mutantOf(i.planted[check] ?? [], i.mutants);
    const eligible = quietNights >= target && mutant.state === "caught";
    const fires = lastFinding && lastFinding.night === judged[0]?.night;
    const why = eligible
      ? `Quiet for ${plural(quietNights, "judged night")} and its planted mutant is caught: it may become blocking at 2.0.`
      : fires && lastFinding!.productionToo === lastFinding!.findings
        ? `Fires every night on production too (${plural(lastFinding!.findings, "finding")}): it cannot stay quiet until production is fixed, so it stays informing or is deleted at 2.0.`
        : fires
          ? `${plural(lastFinding!.findings, "finding")} on main's last forecast, ${lastFinding!.findings - lastFinding!.productionToo} new on b: quiet nights start again after the next clean forecast.`
          : !judged.length
            ? "No forecast judged since the soak began."
            : `Quiet for ${plural(quietNights, "judged night")} of ${target}${mutant.state === "caught" ? "" : `; its planted mutant is ${mutant.state}`}.`;
    return { check, level: level.level, ...(level.blockingFrom ? { blockingFrom: level.blockingFrom } : {}), quietNights, ...(lastFinding ? { lastFinding } : {}), mutant, eligible, why };
  });

  const latest = i.mutants?.at(-1);
  const left = Math.max(0, target - streak);
  const headline = met
    ? `${streak} clean nights in a row: the soak's first condition is met.`
    : `${streak} of ${target} clean nights${brokenOn ? ` since ${brokenOn} broke the run` : ` since ${from}`}; ${plural(left, "more clean night")} at the earliest${counted.length ? "" : " (the soak starts on its first night)"}.`;
  return {
    from,
    target,
    clean: streak,
    met,
    ...(brokenOn ? { brokenOn } : {}),
    nights: rows.reverse().slice(0, SOAK_SHOWN),
    checks,
    mutants: latest ? { ranAt: latest.ranAt, caught: latest.caught, total: latest.total, ...(latest.runUrl ? { runUrl: latest.runUrl } : {}) } : null,
    headline
  };
}

/** A night's `{ findings, productionToo }` per policy check, from a kept report's matches: findings on b no claim covers. */
export function policyFacts(matches: readonly { hunk?: { artefact?: string; severity?: string; level?: string; summary?: string }; claim?: unknown }[]): SoakForecast["policy"] {
  const out: Partial<Record<string, { findings: number; productionToo: number }>> = {};
  for (const check of SOAK_CHECKS) out[check] = { findings: 0, productionToo: 0 };
  for (const m of matches) {
    const h = m?.hunk;
    if (!h || !SOAK_CHECKS.includes(h.artefact ?? "") || m.claim) continue;
    // A finding is what the check would fail: informing (turned to info) before 2.0, a failing hunk once blocking.
    if (h.level !== "informing" && h.severity !== "fail") continue;
    const o = out[h.artefact!]!;
    o.findings += 1;
    if (/\(production too\)$/.test(h.summary ?? "")) o.productionToo += 1;
  }
  return out;
}
