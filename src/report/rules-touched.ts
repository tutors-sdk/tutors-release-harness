/**
 * Since 1.43.0: which Rules a set of differences is about. A Rule journey (traffic/journeys/features) captures its pages
 * as `<app>:rule-<id>-<name>` and is named `rule-<id>-<slug>`, so a difference on one of its pages, or in its persistence
 * or bus ledger (scope `<journey>/<table>`), belongs to that journey's Rule and to the monorepo Rules its scenario
 * exercises. A report then says "the behaviour behind Rules 0582 and 0303 moved", not only "a page changed".
 *
 * Informational, like the causes it sits beside: nothing that judges reads it, and it never changes a verdict.
 */
import { ruleJourneys } from "../../traffic/journeys/rules.ts";
import type { Hunk } from "../types.ts";

export interface RuleTouched {
  /** The Rule journey's own id (0582 and up). */
  rule: string;
  /** Its journey's name. */
  journey: string;
  /** The monorepo Rules its scenario exercises. */
  exercises: string[];
  /** Differences on its pages or ledgers. */
  hunks: number;
  /** Their artefacts, sorted. */
  artefacts: string[];
}

/** The Rule journey a hunk belongs to, from its scope's head or its summary's page; undefined for any other hunk. */
export function ruleOfHunk(h: Pick<Hunk, "scope" | "summary">): string | undefined {
  const head = h.scope.split("/")[0] ?? "";
  return /(?:^|:)rule-(\d{4})-/.exec(head)?.[1] ?? /^[a-z0-9-]+:rule-(\d{4})-[a-z0-9-]+: /.exec(h.summary ?? "")?.[1];
}

const BY_ID = new Map(ruleJourneys.map((j) => [j.rules![0]!, j]));

/** The Rules a set of hunks touched, most differences first. */
export function rulesTouched(hunks: Pick<Hunk, "scope" | "summary" | "artefact">[], journeys = BY_ID): RuleTouched[] {
  const by = new Map<string, { hunks: number; artefacts: Set<string> }>();
  for (const h of hunks) {
    const id = ruleOfHunk(h);
    if (!id) continue;
    const r = by.get(id) ?? { hunks: 0, artefacts: new Set<string>() };
    by.set(id, r);
    r.hunks++;
    r.artefacts.add(h.artefact);
  }
  return [...by]
    .map(([rule, r]) => {
      const j = journeys.get(rule);
      return { rule, journey: j?.name ?? `rule-${rule}`, exercises: (j?.rules ?? []).slice(1), hunks: r.hunks, artefacts: [...r.artefacts].sort() };
    })
    .sort((x, y) => y.hunks - x.hunks || x.rule.localeCompare(y.rule));
}

/** "Rule 0582 (exercises 0011, 0303): 4 differences in dom, persistence". */
export function ruleTouchedWords(r: RuleTouched): string {
  return `Rule ${r.rule}${r.exercises.length ? ` (exercises ${r.exercises.join(", ")})` : ""}: ${r.hunks} difference${r.hunks === 1 ? "" : "s"} in ${r.artefacts.join(", ")}`;
}

/**
 * Since 1.48.1: the Rule journeys a report ran, read from its timing control chart (every journey that completed on both
 * sides). Undefined for a report kept before 1.39.0, which did not record them: then every journey counts as run.
 */
export function rulesRun(r: { timingControl?: { journeys: { journey: string }[] } }): Set<string> | undefined {
  const journeys = r.timingControl?.journeys;
  if (!journeys) return undefined;
  return new Set(journeys.map((j) => /^rule-(\d{4})-/.exec(j.journey)?.[1]).filter((id): id is string => id !== undefined));
}

/** Since 1.48.1: the Rule journey of a difference an earlier report could not have seen, because it did not run that journey. */
export function unrunRule(h: Pick<Hunk, "scope" | "summary">, ran: Set<string> | undefined): string | undefined {
  const id = ran ? ruleOfHunk(h) : undefined;
  return id && !ran!.has(id) ? id : undefined;
}
