/**
 * One scoreboard line: what a release run scored, as one line of scoreboard/releases.jsonl.
 *
 * Visual management over time. The line carries only numbers and names the trends need (the Gate, the RCS and its
 * band, the eight dimension scores, masks, claims, journeys, the week's mutants and the per-PR risk lines), never a
 * deduction's prose: the evidence stays in the run's confidence.json and changes.json, which the line points back to.
 *
 * Append-only: the history is the history. A re-run of the same tag is a new line with the next `run` number, never an
 * edit, and the guard (src/ci/scoreboard-append.ts, `harness guard scoreboard`) fails a diff that changes or removes
 * a line already there. Pure: src/scoreboard/store.ts reads the files and appends.
 */
import type { Changes } from "../changes/signals.ts";
import { applyMarks, type MarkRecord } from "../glance/marks.ts";
import type { GlanceKind, MarkWord } from "../glance/rank.ts";
import type { Confidence, GateWord } from "../score/confidence.ts";
import { DIMENSION_IDS, type Band, type DimensionId } from "../score/weights.ts";
import type { RunReport, SideCapture } from "../types.ts";

export const SCOREBOARD_SCHEMA_VERSION = 1 as const;
export const SCOREBOARD_FILE = "releases.jsonl";
export const MUTANTS_FILE = "mutants.jsonl";
/** What `harness mutants` writes into its --out: one self-test's result (src/mutants.ts). */
export const MUTANTS_SUMMARY = "mutants.json";

export interface DimensionPoint {
  id: DimensionId;
  status: "measured" | "not measured";
  /** 0-100; null when not measured. */
  score: number | null;
  floorBreached: boolean;
}

/** One PR's risk line, as the trends read it: points and where they landed, never the prose. */
export interface PrRiskLine {
  /** null for a commit straight to main. */
  pr: number | null;
  points: number;
  /** A fact for the per-contributor trend only: never a reason, never for reviewing a person. */
  author?: string;
  firstContribution: boolean;
  reviewed: boolean | null;
  files: string[];
  deductions: { rule: string; points: number; file?: string; floor?: true }[];
}

/** The harness's own weekly self-test, as `harness scoreboard mutants` recorded it. */
export interface MutantsPoint {
  ranAt: string;
  /** Caught and attributed; null when the self-test could not run (its A/A on the base was not clean). */
  caught: number | null;
  total: number;
}

export interface ScoreboardLine {
  schemaVersion: typeof SCOREBOARD_SCHEMA_VERSION;
  /** The candidate tag. */
  tag: string;
  /** 1 for the first line of this tag; a re-run is the next number (a logged deviation, never an edit). */
  run: number;
  /** When the release run ran (its ranAt); else when the line was appended. */
  date: string;
  appendedAt: string;
  baseline?: string;
  gate: GateWord;
  rcs: number | null;
  band: Band | null;
  /** Which weights, floors, bands and rules scored it; null for a confidence.json written before 1.11.0. */
  weightsVersion: string | null;
  harness?: { version: string; contractVersion: string };
  /** The eight, in the order of src/score/weights.ts. */
  dimensions: DimensionPoint[];
  /** Masks the release run applied (null without a release report). */
  masks: number | null;
  /** The masks that fired nothing in that run, by id. */
  masksNeverFired: string[] | null;
  /** Claims in the release's claims file, and those that matched nothing. */
  claims: number | null;
  staleClaims: number | null;
  /** Journeys the candidate completed in every run, of those it ran; null without the candidate's capture. */
  journeys: { passed: number; total: number } | null;
  /** The latest weekly mutants record when there is one; else null. */
  mutants: MutantsPoint | null;
  /** The per-PR risk lines from changes.json; null when change risk was not measured. */
  prs: PrRiskLine[] | null;
  /** Since 1.12.0: every mask id the release run loaded (its masksApplied keys), so the next release's glance can see a mask added. */
  maskIds?: string[];
  /** Since 1.12.0: the reviewer's glance as the line was appended: its items, their marks so far, and what it looked at. */
  glance?: GlanceSummary;
  /**
   * Since 1.13.0: the countermeasures open in the kaizen register (kaizen/README.md, `harness why register`) when the line
   * was appended. Over releases, a count that only rises is the register's own run rule: the loop is not closing.
   */
  openCountermeasures?: number;
  runUrl?: string;
}

/** The glance on the scoreboard: counts and marks for the trends, and every candidate's key for the next release's novelty. */
export interface GlanceSummary {
  items: number;
  marks: Record<MarkWord | "unmarked", number>;
  /** The kinds the glance could check (the rest were not checked, and say nothing about novelty). */
  checked: GlanceKind[];
  /** Every candidate's `kind:key`, ranked or not. */
  seen: string[];
}

/** What a line is built from: the score, and what it read, as found beside it. */
export interface LineSources {
  confidence: Confidence;
  release?: RunReport;
  /** The candidate's capture (`<release run>/b/capture.json`), for journeys. */
  candidate?: Pick<SideCapture, "journeys">;
  changes?: Changes;
  mutants?: MutantsPoint;
  /** Lines already in the file: the run number counts them. */
  existing: Pick<ScoreboardLine, "tag">[];
  /** The Reviewer's marks so far (glance-marks.jsonl beside confidence.json): the latest per item. */
  marks?: MarkRecord[];
  /** Overrides confidence.run.candidate (a tag given with --tag). */
  tag?: string;
  now: Date;
  runUrl?: string;
  /** Open countermeasures in the kaizen register, when it was read. */
  openCountermeasures?: number;
}

export class ScoreboardInputError extends Error {}

/** The next run number of a tag: one more than the lines it already has. */
export const nextRun = (existing: Pick<ScoreboardLine, "tag">[], tag: string) => existing.filter((l) => l.tag === tag).length + 1;

/** Journeys the side completed in every run (no `error`), of the distinct journeys it ran. */
export function journeysPassed(capture: Pick<SideCapture, "journeys">): { passed: number; total: number } {
  const names = [...new Set(capture.journeys.map((j) => j.journey))];
  const failed = new Set(capture.journeys.filter((j) => j.error).map((j) => j.journey));
  return { passed: names.filter((n) => !failed.has(n)).length, total: names.length };
}

export function prLines(changes: Changes): PrRiskLine[] {
  return changes.prs.map((p) => ({
    pr: p.pr,
    points: p.points,
    ...(p.author ? { author: p.author } : {}),
    firstContribution: p.firstContribution,
    reviewed: p.reviewed,
    files: p.files,
    deductions: p.deductions.map((d) => ({ rule: d.rule, points: d.points, ...(d.file ? { file: d.file } : {}), ...(d.floor ? { floor: true as const } : {}) }))
  }));
}

/** The glance of a score as a line carries it; an item with no mark yet is `unmarked` (marks usually come after the line). */
export function glanceSummary(c: Confidence, marks: MarkRecord[]): GlanceSummary {
  const counts = { verified: 0, disputed: 0, escalated: 0, unmarked: 0 };
  for (const item of marks.length ? applyMarks(c.glance, marks) : c.glance) counts[item.mark?.mark ?? "unmarked"] += 1;
  return { items: c.glance.length, marks: counts, checked: c.glanceBasis?.checked.map((k) => k.kind) ?? [], seen: c.glanceBasis?.seen ?? [] };
}

export function buildLine(s: LineSources): ScoreboardLine {
  const c = s.confidence;
  const tag = s.tag ?? c.run.candidate;
  if (!tag) throw new ScoreboardInputError("the score names no candidate tag (confidence.json run.candidate): pass --tag <tag>");
  const byId = new Map(c.dimensions.map((d) => [d.id, d]));
  const dimensions = DIMENSION_IDS.map((id): DimensionPoint => {
    const d = byId.get(id);
    return d ? { id, status: d.status, score: d.score, floorBreached: d.floorBreached } : { id, status: "not measured", score: null, floorBreached: false };
  });
  const r = s.release;
  const masksApplied = r ? Object.entries(r.masksApplied ?? {}) : undefined;
  return {
    schemaVersion: SCOREBOARD_SCHEMA_VERSION,
    tag,
    run: nextRun(s.existing, tag),
    date: c.run.ranAt ?? s.now.toISOString(),
    appendedAt: s.now.toISOString(),
    ...(c.run.baseline ? { baseline: c.run.baseline } : {}),
    gate: c.gate,
    rcs: c.rcs,
    band: c.band,
    weightsVersion: c.weightsVersion ?? null,
    ...(c.run.harness ? { harness: c.run.harness } : {}),
    dimensions,
    masks: masksApplied ? masksApplied.length : null,
    masksNeverFired: masksApplied ? masksApplied.filter(([, n]) => n === 0).map(([id]) => id).sort() : null,
    claims: r ? (r.claimHygiene?.claims ?? 0) : null,
    staleClaims: r ? (r.compare.staleClaims ?? []).length : null,
    journeys: s.candidate ? journeysPassed(s.candidate) : null,
    mutants: s.mutants ?? null,
    prs: s.changes ? prLines(s.changes) : null,
    ...(masksApplied ? { maskIds: masksApplied.map(([id]) => id).sort() } : {}),
    ...(c.glanceBasis ? { glance: glanceSummary(c, s.marks ?? []) } : {}),
    ...(s.openCountermeasures !== undefined ? { openCountermeasures: s.openCountermeasures } : {}),
    ...(s.runUrl ? { runUrl: s.runUrl } : {})
  };
}

// ---- reading the file ------------------------------------------------------------------------------------

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

/** One line as read back: the fields the trends need are checked; a line that fails is reported, never dropped quietly. */
export function parseLine(text: string, where: string): ScoreboardLine {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ScoreboardInputError(`${where}: not JSON`);
  }
  if (!isObj(raw) || raw.schemaVersion !== SCOREBOARD_SCHEMA_VERSION) throw new ScoreboardInputError(`${where}: not a scoreboard line (schemaVersion ${SCOREBOARD_SCHEMA_VERSION})`);
  if (typeof raw.tag !== "string" || !Number.isInteger(raw.run) || typeof raw.date !== "string" || typeof raw.gate !== "string" || !Array.isArray(raw.dimensions)) throw new ScoreboardInputError(`${where}: needs tag, run, date, gate and dimensions (docs/contract/scoreboard-line.schema.json)`);
  if (!(raw.rcs === null || typeof raw.rcs === "number")) throw new ScoreboardInputError(`${where}: rcs must be a number or null`);
  return raw as unknown as ScoreboardLine;
}

/** Every line of a releases.jsonl, in file order (the order they were appended). Blank lines are skipped. */
export function parseLines(text: string, file = "releases.jsonl"): ScoreboardLine[] {
  return text
    .split("\n")
    .map((t, i) => ({ t: t.trim(), n: i + 1 }))
    .filter((x) => x.t)
    .map((x) => parseLine(x.t, `${file}:${x.n}`));
}

/** One mutants record per line: `{ ranAt, caught, total, ... }`. A record that cannot be read is skipped: it is the harness's health, not a release's. */
export function parseMutants(text: string): MutantsPoint[] {
  const out: MutantsPoint[] = [];
  for (const t of text.split("\n")) {
    if (!t.trim()) continue;
    try {
      const o = JSON.parse(t) as Record<string, unknown>;
      if (typeof o.ranAt === "string" && (o.caught === null || Number.isInteger(o.caught)) && Number.isInteger(o.total)) out.push({ ranAt: o.ranAt, caught: o.caught as number | null, total: o.total as number });
    } catch {
      /* skipped */
    }
  }
  return out.sort((a, b) => a.ranAt.localeCompare(b.ranAt));
}

/** The line as it goes into the file: one JSON object, one line, a newline at the end. */
export const serialise = (line: ScoreboardLine | object) => `${JSON.stringify(line)}\n`;

// ---- append-only ----------------------------------------------------------------------------------------

/**
 * Is `after` `before` with lines added at the end, and nothing else? The one rule the guard holds scoreboard files to.
 * Returns the problem in words, or undefined when it is an append. A missing trailing newline on the old text is
 * tolerated (the next line starts on its own line either way).
 */
export function appendOnlyProblem(before: string, after: string): string | undefined {
  const lines = (t: string) => t.split("\n").filter((l, i, all) => l !== "" || i < all.length - 1);
  const old = lines(before);
  const now = lines(after);
  for (let i = 0; i < old.length; i++) {
    if (now[i] === undefined) return `line ${i + 1} was deleted`;
    if (now[i] !== old[i]) return `line ${i + 1} was changed (was ${JSON.stringify(old[i]!.slice(0, 80))})`;
  }
  return undefined;
}
