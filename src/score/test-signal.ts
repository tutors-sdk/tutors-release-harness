/**
 * Test signal has two halves, and they come from two places (since 1.18.0). The monorepo's half is its quality record
 * (quality/<sha>.json on its `quality` branch: Stryker's mutation score per package, written by its Nightly), which
 * `--test-signal` reads as it is. The harness's half is its own weekly mutants self-test, recorded in mutants.jsonl on
 * the `scoreboard` branch; the monorepo never writes it. `harness confidence --mutants <mutants.jsonl>` joins the two.
 *
 * The rule: the weekly mutants join a test signal that carries the monorepo's packages and no harnessMutants of its own;
 * they never measure the dimension alone (a Test signal of 100 from the harness's mutants with the monorepo unread would
 * claim a measurement nobody made). The self-test read is the newest that ran before the release run, at most
 * MUTANTS_FRESH_DAYS old, and one that could not run is no reading. When they cannot join, the dimension's gaps say why.
 */
import { existsSync, readFileSync } from "node:fs";
import type { TestSignal } from "./confidence.ts";

/** The newest weekly mutants self-test is read only when it is at most this old: two weekly runs missed is no reading. */
export const MUTANTS_FRESH_DAYS = 14;
const DAY_MS = 86_400_000;

/** One weekly mutants self-test, as `harness scoreboard mutants` recorded it in mutants.jsonl. */
export interface WeeklyMutants {
  ranAt: string;
  /** null when the self-test could not run (its A/A on the base was not clean). */
  caught: number | null;
  total: number;
  runUrl?: string;
}

/** mutants.jsonl, one self-test per line, oldest first. A line that cannot be read is skipped: it is the harness's health. */
export function parseWeeklyMutants(text: string): WeeklyMutants[] {
  const out: WeeklyMutants[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line) as Record<string, unknown>;
      if (typeof o.ranAt === "string" && Number.isFinite(Date.parse(o.ranAt)) && (o.caught === null || Number.isInteger(o.caught)) && Number.isInteger(o.total))
        out.push({ ranAt: o.ranAt, caught: o.caught as number | null, total: o.total as number, ...(typeof o.runUrl === "string" ? { runUrl: o.runUrl } : {}) });
    } catch {
      /* skipped */
    }
  }
  return out.sort((a, b) => Date.parse(a.ranAt) - Date.parse(b.ranAt));
}

/** mutants.jsonl read, or undefined when there is no such file (no weekly self-test recorded yet). */
export function readMutantsFile(file: string | undefined): WeeklyMutants[] | undefined {
  if (!file || !existsSync(file)) return undefined;
  try {
    return parseWeeklyMutants(readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
}

/** The self-test that speaks for a run at `ranAt`, or why none does. */
export function weeklyFor(mutants: WeeklyMutants[] | undefined, ranAt: string | undefined): { point: WeeklyMutants & { caught: number } } | { gap: string; point?: WeeklyMutants } {
  if (!mutants) return { gap: "no weekly mutants record (mutants.jsonl) to read" };
  const at = ranAt && Number.isFinite(Date.parse(ranAt)) ? Date.parse(ranAt) : Number.POSITIVE_INFINITY;
  const m = [...mutants].reverse().find((x) => Date.parse(x.ranAt) <= at);
  if (!m) return { gap: mutants.length ? "no weekly mutants self-test before this run" : "no weekly mutants self-test recorded yet" };
  const days = Number.isFinite(at) ? (at - Date.parse(m.ranAt)) / DAY_MS : 0;
  if (days > MUTANTS_FRESH_DAYS) return { gap: `the newest weekly mutants self-test (${m.ranAt.slice(0, 10)}) is ${Math.round(days)} days old, more than ${MUTANTS_FRESH_DAYS}`, point: m };
  if (m.caught === null) return { gap: `the weekly mutants self-test of ${m.ranAt.slice(0, 10)} could not run (its A/A was not clean)`, point: m };
  return { point: m as WeeklyMutants & { caught: number } };
}

/** The test signal with the harness's own half joined to the monorepo's, by the rule above. */
export function withHarnessMutants(t: TestSignal, mutants: WeeklyMutants[] | undefined, ranAt: string | undefined): TestSignal {
  if (!t.packages || t.harnessMutants) return t;
  const w = weeklyFor(mutants, ranAt);
  if ("gap" in w) return { ...t, mutantsGap: w.gap };
  return { ...t, harnessMutants: { caught: w.point.caught, total: w.point.total, evidence: w.point.runUrl ?? `mutants.jsonl, the self-test of ${w.point.ranAt.slice(0, 10)}` } };
}
