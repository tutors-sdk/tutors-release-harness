/**
 * The Reviewer's marks: one of three per glance item, recorded, never inferred (SOP step 8).
 *
 *   verified   looked, and agrees with the claim            counts towards go
 *   disputed   looked, and does not agree                   becomes a new claim or a hold
 *   escalated  cannot tell from the artefacts               becomes a 5 Whys (whyWanted: true, for C4's harness why)
 *
 * `glance-marks.jsonl` in the `harness release` directory, one line per mark, append-only: a changed mind is a new line,
 * and the latest line for an item is its mark. A mark names the item by rank and by `kind:key`, and applies by key, so
 * a re-score that reorders the glance does not move a mark onto another finding.
 *
 * Marks are standard work, not a verdict: nothing here changes the Gate, a verdict or an exit code. An Amber release
 * goes only when every item is recorded verified (SOP step 9); that is the Captain's decision, which this makes visible.
 */
import type { Band } from "../score/weights.ts";
import { MARK_MEANS, MARK_WORDS, type GlanceItem, type GlanceKind, type GlanceMark, type MarkWord } from "./rank.ts";

export const MARKS_FILE = "glance-marks.jsonl";
export const MARKS_SCHEMA_VERSION = 1 as const;

export interface MarkRecord {
  schemaVersion: typeof MARKS_SCHEMA_VERSION;
  /** The item's rank when it was marked. */
  item: number;
  kind: GlanceKind;
  key: string;
  finding: string;
  mark: MarkWord;
  by: string;
  at: string;
  note?: string;
  /** What the mark turns into: counts towards go, a new claim or a hold, a 5 Whys. */
  becomes: string;
  /** Escalated: the seam for C4, which opens a 5 Whys on why the harness could not show it. */
  whyWanted?: true;
}

export class MarkError extends Error {}

export const isMark = (x: string): x is MarkWord => (MARK_WORDS as readonly string[]).includes(x);

export function markRecord(o: { item: GlanceItem; mark: MarkWord; by: string; at: Date; note?: string }): MarkRecord {
  const by = o.by.trim();
  if (!by) throw new MarkError("--by names who looked (the Reviewer), and cannot be empty");
  return {
    schemaVersion: MARKS_SCHEMA_VERSION,
    item: o.item.rank,
    kind: o.item.kind,
    key: o.item.key,
    finding: o.item.finding,
    mark: o.mark,
    by,
    at: o.at.toISOString(),
    ...(o.note?.trim() ? { note: o.note.trim() } : {}),
    becomes: MARK_MEANS[o.mark].becomes,
    ...(o.mark === "escalated" ? { whyWanted: true as const } : {})
  };
}

/** Every mark in the file, in order; a line that is not a mark is skipped (it is a record for people, not a gate). */
export function parseMarks(text: string): MarkRecord[] {
  const out: MarkRecord[] = [];
  for (const t of text.split("\n")) {
    if (!t.trim()) continue;
    try {
      const o = JSON.parse(t) as Partial<MarkRecord>;
      if (Number.isInteger(o.item) && typeof o.kind === "string" && typeof o.key === "string" && typeof o.mark === "string" && isMark(o.mark) && typeof o.by === "string" && typeof o.at === "string") out.push(o as MarkRecord);
    } catch {
      /* skipped */
    }
  }
  return out;
}

const markOf = (r: MarkRecord): GlanceMark => ({ mark: r.mark, by: r.by, at: r.at, ...(r.note ? { note: r.note } : {}), becomes: r.becomes, ...(r.whyWanted ? { whyWanted: true as const } : {}) });

/** The glance with each item's latest mark, matched by `kind:key` (the finding), not by rank. */
export function applyMarks(items: GlanceItem[], records: MarkRecord[]): GlanceItem[] {
  const latest = new Map<string, MarkRecord>();
  for (const r of records) latest.set(`${r.kind}:${r.key}`, r);
  return items.map((i) => {
    const r = latest.get(`${i.kind}:${i.key}`);
    return { ...i, mark: r ? markOf(r) : null };
  });
}

export interface GlanceStatus {
  items: GlanceItem[];
  counts: Record<MarkWord | "unmarked", number>;
  /** Every item recorded verified (an empty glance has nothing to verify). */
  allVerified: boolean;
  /** An Amber release goes only with the glance recorded verified (SOP step 9). */
  amber: boolean;
  /** One line: what the marks mean for go / no-go. Informational: the Captain decides, and no exit code follows it. */
  go: string;
  /** Items that became work: disputed (a new claim or a hold) and escalated (a 5 Whys). */
  followUps: string[];
}

export function glanceStatus(c: { glance: GlanceItem[]; band: Band | null; gate: string }, records: MarkRecord[]): GlanceStatus {
  const items = applyMarks(c.glance, records);
  const counts = { verified: 0, disputed: 0, escalated: 0, unmarked: 0 };
  for (const i of items) counts[i.mark?.mark ?? "unmarked"] += 1;
  const allVerified = counts.verified === items.length;
  const amber = c.band === "Amber";
  const of = `${counts.verified} of ${items.length} verified`;
  let go: string;
  if (c.gate === "FAIL" || c.gate === "NOT JUDGED" || c.gate === "FAIL (OVERRIDDEN)") go = `Gate ${c.gate}: the glance does not decide go; it is kept for the 5 Whys.`;
  else if (amber) go = !items.length ? "Amber: the glance has no items, so there is nothing to verify; go is the Captain's (SOP step 9)." : allVerified ? `Amber: the glance is recorded verified (${of}): go may be recorded (SOP step 9).` : `Amber: the glance is not yet recorded verified (${of}): not a go (SOP step 9).`;
  else if (c.band === "Red") go = "Red: hold and open a 5 Whys whatever the marks say (SOP step 9).";
  else go = `${c.band ?? "No band"}: ${of}. Green ships on the captain's say; the glance is still step 8.`;
  const followUps = items.flatMap((i) => (i.mark?.mark === "disputed" ? [`item ${i.rank} disputed by ${i.mark.by}: becomes a new claim or a hold`] : i.mark?.mark === "escalated" ? [`item ${i.rank} escalated by ${i.mark.by}: becomes a 5 Whys (whyWanted)`] : []));
  return { items, counts, allVerified, amber, go, followUps };
}
