/**
 * What is new since the last forecast (since 1.16.1): the unclaimed set of a kept release run beside the unclaimed set of
 * the previous kept run with the same baseline. `harness reports keep` stores the counts on the run's index entry and
 * leads the kept report with the new differences (src/report/lead.ts), so a morning reader sees what tonight added
 * instead of re-reading 899 differences to find the dozen that moved.
 *
 * A difference is the same across two runs when its artefact, its scope and its summary with every number masked are:
 * hunk ids carry a counter, and a summary's numbers (lines added at line 4, a p95 in ms, a version) move from night to
 * night without the difference being a new one. The sets are multisets, so new − gone is always the change in the count.
 *
 * Pure, and read by nothing that judges: it never changes a verdict, the Gate, the score or an exit code.
 */
import type { Hunk } from "../types.ts";

/** On the index entry: the counts, and which run they were counted against. */
export interface ReportDelta {
  /** Side a's tag (the reader's): the baseline both runs were judged beside. */
  baseline: string;
  /** The previous kept run of the same mode with that baseline; null when there is none (the first, or a new baseline). */
  against: { id: string; ranAt: string; candidate: string; harnessVersion: string } | null;
  /** Present when `against` is: unclaimed differences this run has that the previous did not, and the reverse. */
  new?: number;
  gone?: number;
  /** The same two counts per artefact, only the artefacts where something moved, in the artefact's name order. */
  byArtefact?: Record<string, { new: number; gone: number }>;
}

/** The delta with the differences behind it, for the lead of the kept report. */
export interface DeltaLead {
  delta: ReportDelta;
  /** This run's harness version, to say when the previous run was judged by another. */
  harnessVersion: string;
  fresh: Hunk[];
  gone: Hunk[];
}

/** The identity of a difference across runs: artefact, scope, and the summary with every number masked. */
export const deltaKey = (h: Pick<Hunk, "artefact" | "scope" | "summary">): string => `${h.artefact}\u0000${h.scope}\u0000${(h.summary ?? "").replace(/\d+(?:\.\d+)?/g, "#")}`;

/** `from` less `take`, as multisets by deltaKey, in `from`'s order: when `from` has one more of a kind, its last is left. */
function minus(from: Hunk[], take: Hunk[]): Hunk[] {
  const left = new Map<string, number>();
  for (const h of take) left.set(deltaKey(h), (left.get(deltaKey(h)) ?? 0) + 1);
  const out: Hunk[] = [];
  for (const h of from) {
    const n = left.get(deltaKey(h)) ?? 0;
    if (n > 0) left.set(deltaKey(h), n - 1);
    else out.push(h);
  }
  return out;
}

/** What is new in `current` and gone from `previous`. */
export function unclaimedDelta(current: Hunk[], previous: Hunk[]): { fresh: Hunk[]; gone: Hunk[] } {
  return { fresh: minus(current, previous), gone: minus(previous, current) };
}

/** The counts for the index entry. */
export function deltaCounts(fresh: Hunk[], gone: Hunk[]): Required<Pick<ReportDelta, "new" | "gone" | "byArtefact">> {
  const by: Record<string, { new: number; gone: number }> = {};
  for (const h of fresh) (by[h.artefact] ??= { new: 0, gone: 0 }).new += 1;
  for (const h of gone) (by[h.artefact] ??= { new: 0, gone: 0 }).gone += 1;
  const byArtefact = Object.fromEntries(Object.entries(by).sort(([x], [y]) => x.localeCompare(y)));
  return { new: fresh.length, gone: gone.length, byArtefact };
}
