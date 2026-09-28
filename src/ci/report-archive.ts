/**
 * The reports that outlive their artifact.
 *
 *   harness reports keep --dir <run dir> [--store dir] [--run-url U] [--keep-last n]
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
 *
 * A release run scored beside it (Main to RC does this) is kept with its score: confidence.json and changes.json byte
 * for byte, and report.md and report.html led by the Gate, the RCS and its band, the reviewer's glance and the change
 * risk per PR, exactly as `harness release` leads its report (src/report/lead.ts). The run's own report follows the lead
 * unchanged. The index entry then carries the Gate, the RCS, the band and its meaning, and the glance and PR counts, so a
 * page can say what main would ship without opening a file. A confidence.json that scored another run is not kept.
 *
 * `<id>` is the run's ranAt and mode (`2026-09-26T07-57-09Z-noise`), so a re-run
 * of the same job replaces its entry and never duplicates it. With --keep-last
 * only the newest n runs are kept and older directories are removed: the
 * `noise` branch is force-pushed every night and must not grow. Without it every
 * run is kept (the release records are one commit per candidate).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Mode, RunReport, Verdict } from "../types.ts";
import { readRulePrs, renderScorecard, scorecard, type Scorecard } from "./scorecard.ts";
import { CHANGES_FILE, type Changes } from "../changes/signals.ts";
import type { Confidence } from "../score/confidence.ts";
import { CONFIDENCE_FILE } from "../score/read.ts";
import { LEAD_CSS, gateLineHtml, scoreLeadHtml, scoreLeadMarkdown } from "../report/lead.ts";
import { renderGateSummary } from "../local/tasks.ts";

export const REPORTS_DIR = "reports";
export const INDEX_FILE = "index.json";
export const KEPT_FILES = ["report.json", "report.md", "report.html"] as const;
const MAX_ENTRIES = 400;

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

/** Upsert by id, newest first, bounded. Returns the index and the ids that fell off the end. */
export function addEntry(index: ReportIndex, entry: ReportEntry, keepLast?: number): { index: ReportIndex; dropped: string[] } {
  const runs = [entry, ...index.runs.filter((r) => r.id !== entry.id)].sort((x, y) => y.ranAt.localeCompare(x.ranAt));
  const limit = Math.min(keepLast ?? MAX_ENTRIES, MAX_ENTRIES);
  return { index: { schemaVersion: 1, runs: runs.slice(0, limit) }, dropped: runs.slice(limit).map((r) => r.id) };
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
  /** rules.json, for the PRs a Rule names; optional. */
  rules?: string;
}

export function keepReport(opts: KeepOptions): { entry: ReportEntry; dropped: string[] } {
  const reportFile = reportFileOf(opts.dir);
  const runDir = resolve(reportFile, "..");
  const report = JSON.parse(readFileSync(reportFile, "utf8")) as RunReport;
  const id = entryId(report);

  const root = join(resolve(opts.store), REPORTS_DIR);
  const target = join(root, id);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const files: string[] = [];
  const scored = scoredBeside(runDir, report);
  for (const name of KEPT_FILES) {
    const from = join(runDir, name);
    if (!existsSync(from)) continue;
    // Byte for byte: what is kept is exactly what the run wrote; a scored run's report.md and report.html get the lead on top.
    const lead = scored && name !== "report.json" ? withLead(name, readFileSync(from, "utf8"), report, scored, `${REPORTS_DIR}/${id}`) : undefined;
    writeFileSync(join(target, name), lead ?? readFileSync(from));
    files.push(`${id}/${name}`);
  }
  if (scored) {
    for (const name of [CONFIDENCE_FILE, ...(scored.changes ? [CHANGES_FILE] : [])]) {
      writeFileSync(join(target, name), readFileSync(join(runDir, name)));
      files.push(`${id}/${name}`);
    }
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
    files
  };
  const indexFile = join(root, INDEX_FILE);
  const { index, dropped } = addEntry(parseIndex(existsSync(indexFile) ? readFileSync(indexFile, "utf8") : undefined), entry, opts.keepLast);
  for (const old of dropped) rmSync(join(root, old), { recursive: true, force: true });
  // A directory the index no longer names (a damaged index, a hand edit) is not kept either.
  const named = new Set(index.runs.map((r) => r.id));
  for (const name of readdirSync(root)) if (name !== INDEX_FILE && !named.has(name)) rmSync(join(root, name), { recursive: true, force: true });
  writeFileSync(indexFile, JSON.stringify(index, null, 2) + "\n");
  return { entry, dropped };
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
export function withLead(name: string, text: string, report: RunReport, s: Scored, dir: string): string | undefined {
  const overridden = report.override?.applied === true;
  const code = report.verdict === "fail" && !overridden ? 1 : 0;
  if (name === "report.md") {
    const entry = { id: "release", title: "release", code, verdict: report.verdict, reasons: report.reasons ?? [], overridden, markdown: text };
    return renderGateSummary({ production: tagOf(report.sides?.a?.reader), candidate: tagOf(report.sides?.b?.reader), entries: [entry], code, at: report.ranAt, gate: s.confidence.gate, score: scoreLeadMarkdown(s.confidence, s.changes, dir) });
  }
  const body = /<body[^>]*>/.exec(text);
  const head = text.indexOf("</head>");
  if (!body || head < 0 || head > body.index) return undefined;
  const lead = `\n<section class="lead">\n${gateLineHtml(s.confidence.gate, code)}\n${scoreLeadHtml(s.confidence, s.changes, dir)}\n</section>\n`;
  const at = body.index + body[0].length;
  return `${text.slice(0, head)}<style>\n${LEAD_CSS}\n</style>\n${text.slice(head, at)}${lead}${text.slice(at)}`;
}
