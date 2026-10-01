/**
 * The reports that outlive their artifact.
 *
 *   harness reports keep --dir <run dir> [--store dir] [--run-url U] [--keep-last n] [--keep-days n]
 *                        [--migration <run dir>] [--upgrade <run dir>]
 *
 * An Actions artifact is gone after 8 to 30 days, and reading one needs a token
 * and the artifact storage host. The branches the workflows already publish
 * (`noise`, `release-records`) are readable by anyone at a raw URL, so the run's
 * report goes there too: report.json, report.md and report.html (no captures,
 * screenshots or k6 output, so a run costs tens of kilobytes, not megabytes),
 * and one `index.json` that lists every kept run, newest first, for a page or a
 * person to find them.
 *
 *   <store>/reports/index.json          { schemaVersion: 1, runs: [ReportEntry, ...] }
 *   <store>/reports/<id>/report.json    the run's report, byte for byte
 *   <store>/reports/<id>/report.md
 *   <store>/reports/<id>/report.html
 *   <store>/reports/<id>/scorecard.json   since 1.5.0: score, normalness, Rules and PRs, what to test by hand (src/ci/scorecard.ts)
 *   <store>/reports/<id>/scorecard.md
 *   <store>/reports/<id>/confidence.json  since 1.13.1, when the run was scored beside it (harness confidence --run <run dir>)
 *   <store>/reports/<id>/changes.json     since 1.13.1, when harness changes wrote it beside the run
 *   <store>/reports/<id>/migration/report.{json,md,html}  since 1.16.0, the rehearsals given by --migration and --upgrade
 *   <store>/reports/<id>/upgrade/report.{json,md,html}
 *   <store>/reports/<id>/quality.json     since 1.18.0, the monorepo's quality record beside a release run (main-preview.yml)
 *
 * A release run scored beside it (Main to RC does this) is kept with its score: confidence.json and changes.json byte
 * for byte, and report.md and report.html led by the Gate, the RCS and its band, the reviewer's glance and the change
 * risk per PR, exactly as `harness release` leads its report (src/report/lead.ts). The run's own report follows the lead
 * unchanged. The index entry then carries the Gate, the RCS, the band and its meaning, and the glance and PR counts, so a
 * page can say what main would ship without opening a file. A confidence.json that scored another run is not kept.
 *
 * Since 1.16.0 the migration and upgrade rehearsals of the run (--migration, --upgrade) are kept beside it, in
 * `migration/` and `upgrade/`, report files only. confidence.json linked each one relative to where it was scored
 * (`../../rehearsals/upgrade/<ranAt>-upgrade/report.html#upgrade`, a directory of a runner that is gone); the kept
 * confidence.json names the kept copy instead (`upgrade/report.html#upgrade`), and is otherwise as written.
 *
 * Since 1.16.1 a release run's entry carries `delta`: what moved in its unclaimed set since the previous kept release run
 * beside the same baseline (side a's tag), read from that run's kept report.json (src/report/delta.ts). A new baseline
 * starts again (`against: null`). A kept report that is led (a scored run) leads with the new differences, under the Gate.
 *
 * Since 1.20.1 a led report follows that with its causes and the PRs behind them (src/changes/attribute.ts): a cause new
 * since the previous forecast against the PRs merged since (its changes.json less the previous one's), the rest by path.
 *
 * `<id>` is the run's ranAt and mode (`2026-09-26T07-57-09Z-noise`), so a re-run
 * of the same job replaces its entry and never duplicates it. With --keep-last
 * only the newest n runs are kept and older directories are removed: the
 * `noise` branch is force-pushed every night and must not grow. Without it every
 * run is kept (the release records are one commit per candidate). Since 1.16.0
 * --keep-days n is a floor under --keep-last: a run that ran less than n days
 * ago is never dropped, whatever the count, so a day of runs by hand cannot push
 * a night out of the record. No store keeps more than 400 runs either way.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import type { Hunk, Mode, RunReport, Verdict } from "../types.ts";
import { readRulePrs, renderScorecard, scorecard, type Scorecard } from "./scorecard.ts";
import { CHANGES_FILE, type Changes } from "../changes/signals.ts";
import type { Confidence } from "../score/confidence.ts";
import { CONFIDENCE_FILE } from "../score/read.ts";
import { LEAD_CSS, attributionLeadHtml, attributionLeadMarkdown, claimsOwedHtml, claimsOwedMarkdown, deltaLeadHtml, deltaLeadMarkdown, gateLineHtml, scoreLeadHtml, scoreLeadMarkdown } from "../report/lead.ts";
import { attribute, type Attribution } from "../changes/attribute.ts";
import { foldCauses } from "../report/causes.ts";
import { draftClaims, type ClaimDraft } from "../claims/draft.ts";
import { deltaCounts, unclaimedDelta, type DeltaLead, type ReportDelta } from "../report/delta.ts";
import { renderGateSummary } from "../local/tasks.ts";
import { QUALITY_FILE, parseQualityRecord } from "../a3/quality.ts";

export const REPORTS_DIR = "reports";
export const INDEX_FILE = "index.json";
export const KEPT_FILES = ["report.json", "report.md", "report.html"] as const;
/** The rehearsals kept beside a run (since 1.16.0), each in the directory of its name. */
export const REHEARSALS = ["migration", "upgrade"] as const;
export type Rehearsal = (typeof REHEARSALS)[number];
const MAX_ENTRIES = 400;
const DAY_MS = 86_400_000;

export interface ReportEntry {
  id: string;
  mode: Mode;
  ranAt: string;
  verdict: Verdict;
  /** One line per reason, as in the report. */
  reasons: string[];
  /** The tag or ref each side ran, by app. */
  sides: { a: Record<string, string>; b: Record<string, string> };
  harnessVersion: string;
  runUrl?: string;
  /** The scorecard's headline, so a page can list runs without opening each one. */
  score?: { score: number; grade: Scorecard["grade"]; normalness: Scorecard["normalness"]["state"]; manual: number };
  /** Since 1.13.1: the Release Confidence Score kept with the run (confidence.json beside it); absent when it was not scored. */
  confidence?: { gate: Confidence["gate"]; rcs: number | null; band: Confidence["band"]; meaning?: string; note?: string; glance: number; scoredBy?: string };
  /** Since 1.13.1: the change signals kept with the run (changes.json beside it). */
  changes?: { score: number; prs: number; risky: number; floorBreached: boolean; range: string };
  /**
   * Since 1.16.1, release runs only: what moved in the unclaimed set since the previous kept release run beside the same
   * baseline. Absent on a run kept before 1.16.1 or of another mode; `against: null` when there was no such run.
   */
  delta?: ReportDelta;
  /** Paths relative to the store's reports/ directory. */
  files: string[];
}

export interface ReportIndex {
  schemaVersion: 1;
  runs: ReportEntry[];
}

/** A stable directory name: the run's instant and its mode, safe in a URL and on every file system. */
export function entryId(report: Pick<RunReport, "ranAt" | "mode">): string {
  const instant = report.ranAt.replace(/\.\d+Z$/, "Z").replace(/:/g, "-");
  const id = `${instant}-${report.mode}`;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(id)) throw new Error(`report ranAt/mode make an unsafe directory name: ${JSON.stringify(id)}`);
  return id;
}

export function parseIndex(text: string | undefined): ReportIndex {
  if (!text?.trim()) return { schemaVersion: 1, runs: [] };
  try {
    const raw = JSON.parse(text) as Partial<ReportIndex>;
    if (raw.schemaVersion !== 1 || !Array.isArray(raw.runs)) throw new Error("not a report index");
    return { schemaVersion: 1, runs: raw.runs.filter((r): r is ReportEntry => typeof r?.id === "string" && typeof r.ranAt === "string") };
  } catch {
    // A damaged index must not stop tonight's report being kept; the directories are still there to rebuild it from.
    return { schemaVersion: 1, runs: [] };
  }
}

/** How far back --keep-days reaches: never drop a run that ran at or after `since` (ms since the epoch). */
export interface KeepFloor {
  keepDays: number;
  now: number;
}

/**
 * Upsert by id, newest first, bounded. Returns the index and the ids that fell off the end. `keepLast` bounds the count;
 * `floor` (since 1.16.0) keeps every run younger than its days even past that count. 400 runs is the ceiling of both.
 */
export function addEntry(index: ReportIndex, entry: ReportEntry, keepLast?: number, floor?: KeepFloor): { index: ReportIndex; dropped: string[] } {
  const runs = [entry, ...index.runs.filter((r) => r.id !== entry.id)].sort((x, y) => y.ranAt.localeCompare(x.ranAt));
  const limit = Math.min(keepLast ?? MAX_ENTRIES, MAX_ENTRIES);
  const since = floor ? floor.now - floor.keepDays * DAY_MS : undefined;
  // Newest first, so the runs inside the floor are a prefix: keep whichever of the two prefixes is longer.
  const young = since === undefined ? 0 : runs.filter((r) => Date.parse(r.ranAt) >= since).length;
  const keep = Math.min(Math.max(limit, young), MAX_ENTRIES);
  return { index: { schemaVersion: 1, runs: runs.slice(0, keep) }, dropped: runs.slice(keep).map((r) => r.id) };
}

/** The run's report.json: the directory that holds it, or the file itself. */
function reportFileOf(dir: string): string {
  const p = resolve(dir);
  const file = existsSync(p) && statSync(p).isDirectory() ? join(p, "report.json") : p;
  if (!existsSync(file)) throw new Error(`no report.json in ${dir}: the run stopped before it wrote a report, nothing to keep`);
  return file;
}

export interface KeepOptions {
  dir: string;
  store: string;
  runUrl?: string;
  keepLast?: number;
  /** Since 1.16.0: never drop a run younger than this many days, whatever --keep-last says. */
  keepDays?: number;
  /** The clock --keep-days reads (ms since the epoch); the wall clock when absent. */
  now?: number;
  /** rules.json, for the PRs a Rule names; optional. */
  rules?: string;
  /** Since 1.16.0: the migration and upgrade rehearsals of this run, a run directory or its report.json each. */
  migration?: string;
  upgrade?: string;
}

export function keepReport(opts: KeepOptions): { entry: ReportEntry; dropped: string[]; notKept: string[] } {
  const reportFile = reportFileOf(opts.dir);
  const runDir = resolve(reportFile, "..");
  const report = JSON.parse(readFileSync(reportFile, "utf8")) as RunReport;
  const id = entryId(report);

  const root = join(resolve(opts.store), REPORTS_DIR);
  const target = join(root, id);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const files: string[] = [];
  // The rehearsals first: where each was, as confidence.json linked it, so the kept score can name the kept copy.
  // A rehearsal that cannot be kept is said and skipped: it must not cost the run its record.
  const moved: [string, string][] = [];
  const notKept: string[] = [];
  for (const name of REHEARSALS) {
    const where = opts[name];
    if (!where) continue;
    const from = keepRehearsal(name, where, join(target, name));
    if (typeof from === "string") {
      notKept.push(from);
      continue;
    }
    files.push(...from.files.map((f) => `${id}/${name}/${f}`));
    moved.push([relative(runDir, from.dir).replaceAll("\\", "/"), name]);
  }
  const indexFile = join(root, INDEX_FILE);
  const before = parseIndex(existsSync(indexFile) ? readFileSync(indexFile, "utf8") : undefined);
  const delta = deltaLead(report, id, before, root);
  const beside = scoredBeside(runDir, report);
  const scored = beside && moved.length ? { ...beside, confidence: relink(beside.confidence, moved) } : beside;
  const attribution = scored?.changes ? attributionLead(report, scored.changes, delta, root) : undefined;
  for (const name of KEPT_FILES) {
    const from = join(runDir, name);
    if (!existsSync(from)) continue;
    // Byte for byte: what is kept is exactly what the run wrote; a scored run's report.md and report.html get the lead on top.
    const lead = scored && name !== "report.json" ? withLead(name, readFileSync(from, "utf8"), report, scored, `${REPORTS_DIR}/${id}`, delta, attribution) : undefined;
    writeFileSync(join(target, name), lead ?? readFileSync(from));
    files.push(`${id}/${name}`);
  }
  if (scored) {
    for (const name of [CONFIDENCE_FILE, ...(scored.changes ? [CHANGES_FILE] : [])]) {
      // Byte for byte, except confidence.json when a rehearsal it links was kept beside it: then with the kept links.
      const relinked = name === CONFIDENCE_FILE && scored.confidence !== beside!.confidence;
      writeFileSync(join(target, name), relinked ? `${JSON.stringify(scored.confidence, null, 2)}\n` : readFileSync(join(runDir, name)));
      files.push(`${id}/${name}`);
    }
  }

  // Since 1.18.0: the monorepo's quality record the score read (main-preview.yml fetches it beside the run), byte for byte,
  // so the quality strip on the A3 and the readiness page can read it. Kept only when it is one; anything else is left.
  if (report.mode === "release" && parseQualityRecord(readJson<unknown>(join(runDir, QUALITY_FILE)))) {
    writeFileSync(join(target, QUALITY_FILE), readFileSync(join(runDir, QUALITY_FILE)));
    files.push(`${id}/${QUALITY_FILE}`);
  }

  const card = scorecard(report, readRulePrs(opts.rules));
  writeFileSync(join(target, "scorecard.json"), JSON.stringify(card, null, 2) + "\n");
  writeFileSync(join(target, "scorecard.md"), renderScorecard(card));
  files.push(`${id}/scorecard.json`, `${id}/scorecard.md`);

  const entry: ReportEntry = {
    id,
    mode: report.mode,
    ranAt: report.ranAt,
    verdict: report.verdict,
    reasons: report.reasons ?? [],
    sides: report.sides,
    harnessVersion: report.harness?.version ?? report.harnessVersion,
    ...(opts.runUrl ? { runUrl: opts.runUrl } : {}),
    score: { score: card.score, grade: card.grade, normalness: card.normalness.state, manual: card.manual.length },
    ...(scored ? { confidence: confidenceHeadline(scored.confidence) } : {}),
    ...(scored?.changes ? { changes: changesHeadline(scored.changes) } : {}),
    ...(delta ? { delta: delta.delta } : {}),
    files
  };
  const floor = opts.keepDays ? { keepDays: opts.keepDays, now: opts.now ?? Date.now() } : undefined;
  const { index, dropped } = addEntry(before, entry, opts.keepLast, floor);
  for (const old of dropped) rmSync(join(root, old), { recursive: true, force: true });
  // A directory the index no longer names (a damaged index, a hand edit) is not kept either.
  const named = new Set(index.runs.map((r) => r.id));
  for (const name of readdirSync(root)) if (name !== INDEX_FILE && !named.has(name)) rmSync(join(root, name), { recursive: true, force: true });
  writeFileSync(indexFile, JSON.stringify(index, null, 2) + "\n");
  return { entry, dropped, notKept };
}

// ---- new since the last forecast (since 1.16.1) --------------------------------------------------------

const unclaimedOf = (r: Partial<RunReport> | undefined): Hunk[] | undefined => (Array.isArray(r?.compare?.unclaimed) ? r.compare.unclaimed : undefined);

/**
 * The delta of a release run against the newest kept release run before it with the same baseline whose report.json can
 * be read (one that cannot is passed over). Undefined for another mode, or a run with no side a or no unclaimed set.
 */
export function deltaLead(report: RunReport, id: string, index: ReportIndex, root: string): DeltaLead | undefined {
  const baseline = tagOf(report.sides?.a?.reader);
  const current = unclaimedOf(report);
  if (report.mode !== "release" || !baseline || !current) return undefined;
  const at = Date.parse(report.ranAt);
  const harnessVersion = report.harness?.version ?? report.harnessVersion;
  const earlier = index.runs
    .filter((r) => r.id !== id && r.mode === report.mode && Date.parse(r.ranAt) < at && tagOf(r.sides?.a?.reader) === baseline)
    .sort((x, y) => Date.parse(y.ranAt) - Date.parse(x.ranAt));
  for (const r of earlier) {
    const previous = unclaimedOf(readJson<RunReport>(join(root, r.id, "report.json")));
    if (!previous) continue;
    const { fresh, gone } = unclaimedDelta(current, previous);
    const against = { id: r.id, ranAt: r.ranAt, candidate: tagOf(r.sides?.b?.reader), harnessVersion: r.harnessVersion };
    return { delta: { baseline, against, ...deltaCounts(fresh, gone) }, harnessVersion, fresh, gone };
  }
  return { delta: { baseline, against: null }, harnessVersion, fresh: [], gone: [] };
}

// ---- causes and the PRs behind them (since 1.20.1) -----------------------------------------------------

const causesOf = (r: Partial<RunReport> | undefined) => r?.causes?.causes ?? (unclaimedOf(r) ? foldCauses(unclaimedOf(r)!).causes : undefined);

/**
 * The causes of a scored release run beside the PRs that could have made them: by delta against the previous forecast
 * the delta was counted against (its kept report.json and changes.json), by path for the rest. Undefined for a run with
 * no unclaimed set.
 */
export function attributionLead(report: RunReport, changes: Changes, delta: DeltaLead | undefined, root: string): Attribution | undefined {
  const causes = causesOf(report);
  if (!causes) return undefined;
  const against = delta?.delta.against;
  const prev = against ? causesOf(readJson<RunReport>(join(root, against.id, "report.json"))) : undefined;
  const prevChanges = against ? readJson<Changes>(join(root, against.id, CHANGES_FILE)) : undefined;
  const previous = against && prev ? { id: against.id, candidate: against.candidate, keys: new Set(prev.map((c) => c.key)), ...(prevChanges && Array.isArray(prevChanges.prs) ? { changes: prevChanges } : {}) } : undefined;
  return attribute(causes, changes, previous);
}

// ---- claims owed, in place of the glance on a forecast (since 1.20.2) -------------------------------------

/** A forecast judges a build of main, `sha-<short>` on side b (Main to RC); a release candidate carries a version tag. */
export const isForecast = (report: Pick<RunReport, "sides">) => /^sha-[0-9a-f]{7,40}$/.test(tagOf(report.sides?.b?.reader));

/** One draft claim per cause of the run, each naming the first PRs attribution found for it. */
export function claimsOwed(report: RunReport, attribution?: Attribution): ClaimDraft[] | undefined {
  const causes = causesOf(report);
  const unclaimed = unclaimedOf(report);
  if (!causes || !unclaimed) return undefined;
  const prs = Object.fromEntries((attribution?.causes ?? []).map((c) => [c.cause, c.prs.slice(0, 3).map((p) => (p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7)))]));
  return draftClaims(causes, unclaimed, prs);
}

// ---- the rehearsals kept beside it (since 1.16.0) ------------------------------------------------------

/**
 * Copy a rehearsal's report files into `into`: its directory and the files copied, or why it was not kept (no report,
 * not JSON, or a run of another mode).
 */
function keepRehearsal(name: Rehearsal, where: string, into: string): { dir: string; files: string[] } | string {
  let file: string;
  let mode: unknown;
  try {
    file = reportFileOf(where);
    mode = (JSON.parse(readFileSync(file, "utf8")) as Partial<RunReport>).mode;
  } catch (e) {
    return `--${name} ${where}: ${e instanceof Error ? e.message : String(e)}`;
  }
  if (mode !== name) return `--${name} ${where}: a ${String(mode)}-mode report, not ${name}`;
  const dir = resolve(file, "..");
  mkdirSync(into, { recursive: true });
  const files: string[] = [];
  for (const f of KEPT_FILES) {
    if (!existsSync(join(dir, f))) continue;
    writeFileSync(join(into, f), readFileSync(join(dir, f)));
    files.push(f);
  }
  return { dir, files };
}

/**
 * The score with each link into a rehearsal's old directory pointed at the kept copy: every string that is `from`, or
 * starts with `from/` or `from#`, gets `to` in place of `from`. Anything else, and a score that links none, is unchanged.
 */
export function relink(c: Confidence, moved: [from: string, to: string][]): Confidence {
  let changed = false;
  const one = (s: string): string => {
    for (const [from, to] of moved) {
      if (!from || !(s === from || s.startsWith(`${from}/`) || s.startsWith(`${from}#`))) continue;
      changed = true;
      return `${to}${s.slice(from.length)}`;
    }
    return s;
  };
  const walk = (x: unknown): unknown => (typeof x === "string" ? one(x) : Array.isArray(x) ? x.map(walk) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, walk(v)])) : x);
  const out = walk(c) as Confidence;
  return changed ? out : c;
}

// ---- a release run scored beside it (since 1.13.1) ------------------------------------------------------

interface Scored {
  confidence: Confidence;
  changes?: Changes;
}

const readJson = <T>(file: string): T | undefined => {
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return undefined;
  }
};

/**
 * confidence.json (and changes.json) beside a release run, when they scored this run: the score's `run.ranAt` is the
 * report's. Anything else (another run's score, a file that is not JSON, a noise run) is not kept and nothing is led.
 */
export function scoredBeside(runDir: string, report: Pick<RunReport, "mode" | "ranAt">): Scored | undefined {
  if (report.mode !== "release") return undefined;
  const c = readJson<Confidence>(join(runDir, CONFIDENCE_FILE));
  if (!c || !Array.isArray(c.dimensions) || !Array.isArray(c.glance) || c.run?.ranAt !== report.ranAt) return undefined;
  const ch = readJson<Changes>(join(runDir, CHANGES_FILE));
  return { confidence: c, ...(ch && Array.isArray(ch.prs) && typeof ch.score === "number" ? { changes: ch } : {}) };
}

export function confidenceHeadline(c: Confidence): NonNullable<ReportEntry["confidence"]> {
  return { gate: c.gate, rcs: c.rcs, band: c.band, ...(c.meaning ? { meaning: c.meaning } : {}), ...(c.note ? { note: c.note } : {}), glance: c.glance.length, ...(c.run.harness?.version ? { scoredBy: c.run.harness.version } : {}) };
}

export function changesHeadline(c: Changes): NonNullable<ReportEntry["changes"]> {
  return { score: c.score, prs: c.prs.length, risky: c.prs.filter((p) => p.deductions.length).length, floorBreached: c.floorBreached, range: `${c.refs.a}..${c.refs.b}` };
}

const tagOf = (ref: string | undefined) => ref?.split("@")[0]?.split(":").pop() ?? "";

/**
 * The kept report.md or report.html of a scored run: the lead of `harness release` on top, the run's own report under
 * it. report.md is the gate summary `harness release` writes (gate.md), with this one run as its only step; report.html
 * is the run's own page with the Gate and the lead first. Undefined (keep it as written) when the page has no body.
 */
export function withLead(name: string, text: string, report: RunReport, s: Scored, dir: string, delta?: DeltaLead, attribution?: Attribution): string | undefined {
  const overridden = report.override?.applied === true;
  const code = report.verdict === "fail" && !overridden ? 1 : 0;
  // Since 1.20.2 a forecast shows the claims it owes where the glance would be; a release candidate keeps its glance.
  const owed = isForecast(report) ? claimsOwed(report, attribution) : undefined;
  if (name === "report.md") {
    const entry = { id: "release", title: "release", code, verdict: report.verdict, reasons: report.reasons ?? [], overridden, markdown: text };
    return renderGateSummary({ production: tagOf(report.sides?.a?.reader), candidate: tagOf(report.sides?.b?.reader), entries: [entry], code, at: report.ranAt, gate: s.confidence.gate, score: `${delta ? `${deltaLeadMarkdown(delta)}\n\n` : ""}${attribution?.causes.length ? `${attributionLeadMarkdown(attribution)}\n\n` : ""}${scoreLeadMarkdown(s.confidence, s.changes, dir, owed && claimsOwedMarkdown(owed))}` });
  }
  const body = /<body[^>]*>/.exec(text);
  const head = text.indexOf("</head>");
  if (!body || head < 0 || head > body.index) return undefined;
  const lead = `\n<section class="lead">\n${gateLineHtml(s.confidence.gate, code)}\n${delta ? `${deltaLeadHtml(delta)}\n` : ""}${attribution?.causes.length ? `${attributionLeadHtml(attribution)}\n` : ""}${scoreLeadHtml(s.confidence, s.changes, dir, owed && claimsOwedHtml(owed))}\n</section>\n`;
  const at = body.index + body[0].length;
  return `${text.slice(0, head)}<style>\n${LEAD_CSS}\n</style>\n${text.slice(head, at)}${lead}${text.slice(at)}`;
}
