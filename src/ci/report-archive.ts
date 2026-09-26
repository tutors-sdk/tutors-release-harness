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
  for (const name of KEPT_FILES) {
    const from = join(runDir, name);
    if (!existsSync(from)) continue;
    // Byte for byte: what is kept is exactly what the run wrote.
    writeFileSync(join(target, name), readFileSync(from));
    files.push(`${id}/${name}`);
  }

  const entry: ReportEntry = {
    id,
    mode: report.mode,
    ranAt: report.ranAt,
    verdict: report.verdict,
    reasons: report.reasons ?? [],
    sides: report.sides,
    harnessVersion: report.harness?.version ?? report.harnessVersion,
    ...(opts.runUrl ? { runUrl: opts.runUrl } : {}),
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
