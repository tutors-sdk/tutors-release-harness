import type { WeeklyMutants } from "../a3/quality.ts";
import type { Night } from "./model.ts";
import type { AaNight } from "./soak.ts";

/**
 * The harness's own service levels (since 1.35.0; tutors-sdk/tutors-mono-repo#170). The monorepo's SLOs say what the
 * college aims for; these say what the harness owes the people who read it, and it is opinionated about them: a
 * forecast nobody can trust is stale or rare, not merely red. Two kinds:
 *
 *   freshness   how old the newest of something is, against a limit: the Main to RC forecast and the nightly A/A
 *               (a day, plus two hours of slack for a slow runner), the mutants self-test (a week, plus a day)
 *   rate        a share over the last {@link SERVICE_LEVEL_NIGHTS} finished nights, against a target: nights Main to RC
 *               judged (or found unchanged), nights whose A/A was clean and verified, and the mutants the newest
 *               self-test caught
 *
 * Each says whether it holds, or `null` when what it reads was not read (never guessed). Advisory, like the rest of the
 * readiness page: never an input to the Gate, a verdict, an engine level or an exit code. The targets are a ratchet:
 * tests/service-levels.test.ts pins them; raise them by PR, never lower one to make the page green.
 */
export const SERVICE_LEVEL_NIGHTS = 14;
const HOUR_MS = 3_600_000;

export interface ServiceLevelTargets {
  forecastMaxAgeHours: number;
  aaMaxAgeHours: number;
  mutantsMaxAgeHours: number;
  nightsJudged: number;
  aaClean: number;
  mutantsCaught: number;
}

export const SERVICE_LEVEL_TARGETS: Readonly<ServiceLevelTargets> = Object.freeze({
  forecastMaxAgeHours: 26,
  aaMaxAgeHours: 26,
  mutantsMaxAgeHours: 8 * 24,
  nightsJudged: 0.9,
  aaClean: 0.9,
  mutantsCaught: 1
});

export interface ServiceLevel {
  id: "forecast-fresh" | "aa-fresh" | "mutants-fresh" | "nights-judged" | "aa-clean" | "mutants-caught";
  kind: "freshness" | "rate";
  /** For people: "at most 26 hours old", "at least 90% of 14 nights". */
  target: string;
  /** For people: "7 hours old", "12 of 14 nights (86%)", "not read". */
  value: string;
  holds: boolean | null;
}

export interface ServiceLevels {
  nights: number;
  levels: ServiceLevel[];
  /** How many hold, and how many could be judged. */
  holding: number;
  judged: number;
  headline: string;
}

export interface ServiceLevelInputs {
  now: Date;
  /** The page's nights, newest first (tonight's included and left out of the rates). */
  nights: Pick<Night, "night" | "state" | "forecasts">[];
  /** Every kept forecast's ranAt. */
  forecasts: { ranAt: string }[];
  aa?: AaNight[];
  mutants?: WeeklyMutants[];
  targets?: ServiceLevelTargets;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const nightOf = (iso: string) => new Date(Date.parse(iso)).toISOString().slice(0, 10);

function age(now: Date, isos: string[]): number | undefined {
  const times = isos.map((s) => Date.parse(s)).filter(Number.isFinite);
  return times.length ? (now.getTime() - Math.max(...times)) / HOUR_MS : undefined;
}

function ageWords(hours: number): string {
  return hours < 48 ? `${plural(Math.max(0, Math.round(hours)), "hour")} old` : `${plural(Math.round(hours / 24), "day")} old`;
}

function freshness(id: ServiceLevel["id"], what: string, now: Date, isos: string[] | undefined, maxHours: number): ServiceLevel {
  const target = `${what} at most ${maxHours < 48 ? plural(maxHours, "hour") : plural(maxHours / 24, "day")} old`;
  if (isos === undefined) return { id, kind: "freshness", target, value: "not read", holds: null };
  const hours = age(now, isos);
  if (hours === undefined) return { id, kind: "freshness", target, value: "none kept", holds: false };
  return { id, kind: "freshness", target, value: ageWords(hours), holds: hours <= maxHours };
}

function rate(id: ServiceLevel["id"], target: string, good: number, total: number, want: number, unit: string): ServiceLevel {
  if (!total) return { id, kind: "rate", target, value: `no ${unit}s to count`, holds: null };
  return { id, kind: "rate", target, value: `${good} of ${plural(total, unit)} (${pct(good / total)})`, holds: good / total >= want };
}

export function buildServiceLevels(i: ServiceLevelInputs): ServiceLevels {
  const t = i.targets ?? SERVICE_LEVEL_TARGETS;
  const today = i.now.toISOString().slice(0, 10);
  // Finished nights only: tonight is not over, and a night still running has not said what it is.
  const counted = i.nights.filter((n) => n.night !== today && n.state !== "running").slice(0, SERVICE_LEVEL_NIGHTS);
  const known = counted.filter((n) => n.state !== "not known");
  const judged = known.filter((n) => n.state === "judged" || n.state === "unchanged").length;

  const aaNights = i.aa === undefined ? undefined : counted.map((n) => (i.aa ?? []).filter((e) => Number.isFinite(Date.parse(e.ranAt)) && nightOf(e.ranAt) === n.night));
  const aaClean = aaNights?.filter((those) => those.length && those.every((e) => !e.degraded.length && e.hunks <= 0)).length ?? 0;

  const newestMutants = i.mutants?.length ? [...i.mutants].sort((x, y) => Date.parse(y.ranAt) - Date.parse(x.ranAt))[0] : undefined;
  const levels: ServiceLevel[] = [
    freshness("forecast-fresh", "the newest Main to RC forecast", i.now, i.forecasts.map((f) => f.ranAt), t.forecastMaxAgeHours),
    freshness("aa-fresh", "the newest nightly A/A", i.now, i.aa?.map((e) => e.ranAt), t.aaMaxAgeHours),
    freshness("mutants-fresh", "the newest mutants self-test", i.now, i.mutants?.map((m) => m.ranAt), t.mutantsMaxAgeHours),
    rate("nights-judged", `at least ${pct(t.nightsJudged)} of the last ${SERVICE_LEVEL_NIGHTS} nights judged or unchanged`, judged, known.length, t.nightsJudged, "night"),
    aaNights === undefined
      ? { id: "aa-clean", kind: "rate", target: `at least ${pct(t.aaClean)} of the last ${SERVICE_LEVEL_NIGHTS} nights with a clean, verified A/A`, value: "not read", holds: null }
      : rate("aa-clean", `at least ${pct(t.aaClean)} of the last ${SERVICE_LEVEL_NIGHTS} nights with a clean, verified A/A`, aaClean, counted.length, t.aaClean, "night"),
    newestMutants === undefined
      ? { id: "mutants-caught", kind: "rate", target: `${pct(t.mutantsCaught)} of planted mutants caught by the newest self-test`, value: i.mutants === undefined ? "not read" : "none run", holds: null }
      : newestMutants.caught === null
        ? { id: "mutants-caught", kind: "rate", target: `${pct(t.mutantsCaught)} of planted mutants caught by the newest self-test`, value: "the self-test could not run (its A/A was not clean)", holds: false }
        : rate("mutants-caught", `${pct(t.mutantsCaught)} of planted mutants caught by the newest self-test`, newestMutants.caught, newestMutants.total, t.mutantsCaught, "mutant")
  ];
  const decided = levels.filter((l) => l.holds !== null);
  const holding = decided.filter((l) => l.holds).length;
  const missing = levels.filter((l) => l.holds === false).map((l) => l.id);
  const headline = !decided.length
    ? "Nothing the harness's service levels read was read, so none is judged."
    : missing.length
      ? `${holding} of ${decided.length} hold; missed: ${missing.join(", ")}. A stale or rare forecast is one nobody can trust, whatever its Gate.`
      : `All ${decided.length} hold.`;
  return { nights: SERVICE_LEVEL_NIGHTS, levels, holding, judged: decided.length, headline };
}
