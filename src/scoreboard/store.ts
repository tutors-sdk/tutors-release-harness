/**
 * The scoreboard's files: reading what a release run left behind, appending its line, recording the week's mutants.
 *
 *   <dir>/releases.jsonl   one line per release run, append-only (src/scoreboard/line.ts)
 *   <dir>/mutants.jsonl    one line per weekly mutants self-test, append-only (`harness scoreboard mutants`)
 *
 * Where <dir> is: HARNESS_HOME/scoreboard on a laptop (`harness release` appends there, never into the checkout
 * unasked); the `scoreboard` branch of the harness repository in CI (release.yml and weekly-mutants.yml append and
 * push it, one commit per line, never forced); `scoreboard/` on main holds what a PR copied from that branch, and the
 * guard lets such a PR only add lines.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import type { Changes } from "../changes/signals.ts";
import { MARKS_FILE, parseMarks, type MarkRecord } from "../glance/marks.ts";
import { parseHistory, type HistoryEntry } from "../ci/noise-history.ts";
import { readReport } from "../ci/scorecard.ts";
import type { Confidence } from "../score/confidence.ts";
import { CONFIDENCE_FILE } from "../score/read.ts";
import type { RunReport, SideCapture } from "../types.ts";
import { readRegister } from "../why/register.ts";
import { MUTANTS_FILE, MUTANTS_SUMMARY, SCOREBOARD_FILE, ScoreboardInputError, buildLine, parseLines, parseMutants, serialise, type MutantsPoint, type ScoreboardLine } from "./line.ts";
import { trends, type Trends } from "./trends.ts";

export const scoreboardDir = (home: string) => join(home, "scoreboard");
export const defaultScoreboardFile = (home: string) => join(scoreboardDir(home), SCOREBOARD_FILE);
/** The mutants record beside a releases.jsonl. */
export const mutantsFileBeside = (file: string) => join(dirname(file), MUTANTS_FILE);

const readJson = <T>(file: string, what: string): T => {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    throw new ScoreboardInputError(`${file} is not JSON (${what})`);
  }
};

export function readLines(file: string): ScoreboardLine[] {
  return existsSync(file) ? parseLines(readFileSync(file, "utf8"), file) : [];
}

export function readMutants(file: string | undefined): MutantsPoint[] {
  return file && existsSync(file) ? parseMutants(readFileSync(file, "utf8")) : [];
}

/** Append text as whole lines: when the file does not end in a newline (a hand-truncated file), the line still starts on its own. */
export function appendLine(file: string, line: object): void {
  mkdirSync(dirname(file), { recursive: true });
  const ragged = existsSync(file) && statSync(file).size > 0 && !readFileSync(file, "utf8").endsWith("\n");
  appendFileSync(file, `${ragged ? "\n" : ""}${serialise(line)}`);
}

// ---- harness scoreboard append ---------------------------------------------------------------------------

/** What a release run left behind, found from `--run`: a `harness release` directory, or a confidence.json. */
export interface RunFiles {
  dir: string;
  confidence: Confidence;
  release?: RunReport;
  candidate?: Pick<SideCapture, "journeys">;
  changes?: Changes;
  /** The Reviewer's marks so far (glance-marks.jsonl beside confidence.json). */
  marks: MarkRecord[];
  fast: boolean;
}

export function readRun(where: string): RunFiles {
  const p = resolve(where);
  if (!existsSync(p)) throw new ScoreboardInputError(`--run: ${where} does not exist`);
  const isDir = statSync(p).isDirectory();
  const dir = isDir ? p : dirname(p);
  const file = isDir ? join(p, CONFIDENCE_FILE) : p;
  if (!existsSync(file)) throw new ScoreboardInputError(`--run: no ${CONFIDENCE_FILE} in ${where}: score it first (harness confidence --run ${where})`);
  const confidence = readJson<Confidence>(file, "--run");
  if (!Array.isArray(confidence.dimensions) || typeof confidence.gate !== "string") throw new ScoreboardInputError(`--run: ${file} is not a confidence.json`);
  // A --fast report "cannot be used for a go decision", so it never goes on the board: the status.json of harness release says so.
  const status = join(dir, "status.json");
  const fast = existsSync(status) && readJson<{ fast?: boolean }>(status, "status.json").fast === true;
  const relPath = confidence.run.reports?.release;
  let release: RunReport | undefined;
  let candidate: RunFiles["candidate"];
  if (relPath) {
    const reportFile = resolve(dir, relPath);
    if (existsSync(reportFile)) {
      release = readReport(reportFile);
      const capture = join(dirname(reportFile), "b", "capture.json");
      if (existsSync(capture)) candidate = readJson<SideCapture>(capture, "the candidate's capture");
    }
  }
  // changes.json: the change-risk input the score read, when it is a whole changes.json; else one beside confidence.json.
  const named = confidence.run.inputs?.changeRisk ? resolve(dir, confidence.run.inputs.changeRisk) : undefined;
  let changes: Changes | undefined;
  for (const f of [named, join(dir, "changes.json")]) {
    if (!f || !existsSync(f)) continue;
    const c = readJson<Partial<Changes>>(f, "changes.json");
    if (Array.isArray(c.prs) && c.prs.every((x) => Array.isArray(x.files) && Array.isArray(x.deductions))) {
      changes = c as Changes;
      break;
    }
  }
  const marksFile = join(dir, MARKS_FILE);
  const marks = existsSync(marksFile) ? parseMarks(readFileSync(marksFile, "utf8")) : [];
  return { dir, confidence, ...(release ? { release } : {}), ...(candidate ? { candidate } : {}), ...(changes ? { changes } : {}), marks, fast };
}

export interface AppendOptions {
  run: string;
  file: string;
  /** mutants.jsonl; absent, the one beside `file`. */
  mutants?: string;
  tag?: string;
  runUrl?: string;
  now: Date;
  /** The kaizen register's directory (kaizen/): its open countermeasures go on the line (since 1.13.0). Absent, or no such directory: not recorded. */
  kaizen?: string;
}

/** Build the line from what the run left and append it. Never rewrites a line: the history is the history. */
export function appendRun(o: AppendOptions): { line: ScoreboardLine; file: string } {
  const run = readRun(o.run);
  if (run.fast) throw new ScoreboardInputError(`--run: ${run.dir} is a --fast run: its report cannot be used for a go decision, so it is not put on the scoreboard`);
  const file = resolve(o.file);
  const existing = readLines(file);
  const mutants = readMutants(o.mutants ?? mutantsFileBeside(file)).at(-1);
  const open = o.kaizen && existsSync(o.kaizen) ? readRegister(o.kaizen).filter((e) => e.open).length : undefined;
  const line = buildLine({ confidence: run.confidence, ...(run.release ? { release: run.release } : {}), ...(run.candidate ? { candidate: run.candidate } : {}), ...(run.changes ? { changes: run.changes } : {}), ...(mutants ? { mutants } : {}), marks: run.marks, existing, ...(o.tag ? { tag: o.tag } : {}), now: o.now, ...(o.runUrl ? { runUrl: o.runUrl } : {}), ...(open !== undefined ? { openCountermeasures: open } : {}) });
  appendLine(file, line);
  return { line, file };
}

// ---- harness scoreboard mutants --------------------------------------------------------------------------

/** Record one self-test's `mutants.json` (written by `harness mutants` into its --out) in mutants.jsonl. */
export function recordMutants(o: { from: string; file: string; runUrl?: string }): { record: object; file: string } {
  const p = resolve(o.from);
  const src = existsSync(p) && statSync(p).isDirectory() ? join(p, MUTANTS_SUMMARY) : p;
  if (!existsSync(src)) throw new ScoreboardInputError(`--run: no ${MUTANTS_SUMMARY} at ${o.from} (harness mutants writes it into its --out)`);
  const s = readJson<{ ranAt?: unknown; caught?: unknown; total?: unknown; escaped?: unknown; base?: unknown; harnessVersion?: unknown; note?: unknown }>(src, basename(src));
  if (typeof s.ranAt !== "string" || !(s.caught === null || Number.isInteger(s.caught)) || !Number.isInteger(s.total)) throw new ScoreboardInputError(`${src} is not a mutants summary (ranAt, caught, total)`);
  const file = resolve(o.file);
  const record = { ranAt: s.ranAt, caught: s.caught, total: s.total, escaped: Array.isArray(s.escaped) ? s.escaped : [], ...(typeof s.base === "string" ? { base: s.base } : {}), ...(typeof s.harnessVersion === "string" ? { harnessVersion: s.harnessVersion } : {}), ...(typeof s.note === "string" ? { note: s.note } : {}), ...(o.runUrl ? { runUrl: o.runUrl } : {}) };
  // The same self-test recorded twice (a re-run of the publishing job) is one record.
  if (readMutants(file).some((m) => m.ranAt === s.ranAt)) return { record, file };
  appendLine(file, record);
  return { record, file };
}

// ---- harness scoreboard trends ---------------------------------------------------------------------------

export interface TrendsSources {
  file: string;
  mutants?: string;
  /** noise-history.json (the local noise store's, or the noise branch's). */
  noiseHistory?: string;
  now: Date;
}

export function readTrends(s: TrendsSources): Trends {
  const lines = readLines(resolve(s.file));
  const mutants = readMutants(s.mutants ?? mutantsFileBeside(resolve(s.file)));
  let noise: HistoryEntry[] | undefined;
  let noiseReason: string | undefined;
  if (s.noiseHistory && existsSync(s.noiseHistory)) noise = parseHistory(readFileSync(s.noiseHistory, "utf8")).entries;
  else noiseReason = s.noiseHistory ? `no noise history at ${s.noiseHistory}` : undefined;
  return trends({ lines, mutants, ...(noise ? { noise } : {}), ...(noiseReason ? { noiseReason } : {}), now: s.now });
}
