import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { DEFAULT_MAX_MASKS, assess, parseHistory, record, renderSummary } from "../ci/noise-history.ts";
import { trustNoise } from "../gate.ts";
import { parseNoiseStatus } from "../noise.ts";
import type { Mode, NoiseStatus } from "../types.ts";
import { harnessHome, noiseDir } from "./home.ts";

/**
 * The local home of the nightly A/A's memory: the `noise` branch of the
 * workflows as a directory. Same three files, written by the same
 * `record` (src/ci/noise-history.ts), read by the same gate (src/gate.ts): the
 * 7-day / clean / verified rule is applied in one place and this file never
 * restates it.
 *
 *   <store>/noise-status.json   the latest night, clean or not (never an older clean one)
 *   <store>/noise-history.json  one entry per night, for the ratchet
 *   <store>/noise-summary.md    tonight's summary
 *
 * The default store is `<HARNESS_HOME>/noise`.
 */
export const STATUS_FILE = "noise-status.json";
export const HISTORY_FILE = "noise-history.json";
export const SUMMARY_FILE = "noise-summary.md";

/** A file, or the directory that holds noise-status.json. */
export function statusFileOf(pathOrDir: string): string {
  const p = resolve(pathOrDir);
  if (existsSync(p)) return statSync(p).isDirectory() ? join(p, STATUS_FILE) : p;
  // Not there yet: a name that does not end in .json is a directory that has not been made.
  return p.toLowerCase().endsWith(".json") ? p : join(p, STATUS_FILE);
}

export interface StoreStatus {
  file: string;
  /** A file exists at `file`. */
  present: boolean;
  /** Parsed and valid; the gate decides whether it counts. */
  status?: NoiseStatus;
  /** Why a present file is unusable. */
  problem?: string;
}

/** Read a status the way the workflows' `vet` step does: missing, empty or unusable is reported, never thrown. */
export function readStatus(pathOrDir: string): StoreStatus {
  const file = statusFileOf(pathOrDir);
  if (!existsSync(file)) return { file, present: false };
  const text = readFileSync(file, "utf8");
  if (!text.trim()) return { file, present: false };
  try {
    return { file, present: true, status: parseNoiseStatus(text, file) };
  } catch (e) {
    return { file, present: true, problem: (e instanceof Error ? e.message : String(e)).split("\n")[0]! };
  }
}

/**
 * What `--noise` means when it is not given. Release and post-deploy mode take the
 * latest status from the local store (the workflows fetch it from the `noise`
 * branch); `--noise none` says "do not look". Any other mode never reads one.
 * Returns the value to hand the run, or undefined.
 */
export function defaultNoise(mode: Mode | undefined, explicit: string | undefined, log: (m: string) => void, home = harnessHome()): string | undefined {
  if (explicit === "none") return undefined;
  if (explicit !== undefined) return explicit;
  if (mode !== "release" && mode !== "post-deploy") return undefined;
  const found = readStatus(noiseDir(home));
  if (!found.present) {
    log(`no local noise status at ${found.file}: the harness is advisory (WARN, never FAIL) until \`harness local nightly\` records a clean, verified A/A`);
    return undefined;
  }
  if (!found.status) {
    log(`the local noise status ${found.file} is unusable (${found.problem}); ignored, so the harness is advisory (WARN, never FAIL)`);
    return undefined;
  }
  log(`noise status from the local store ${found.file} (A/A of ${found.status.ranAt}); whether it licenses a FAIL is the gate's decision`);
  return found.file;
}

export interface RecordOptions {
  /** A noise run directory (containing noise-status.json and report.json) or the status file itself. */
  status: string;
  report?: string;
  store: string;
  tag?: string;
  runUrl?: string;
  summary?: string;
  masks?: string;
}

/** Append a night to the store and rewrite its three files. Exit 1 when the ratchet is broken, as in the workflow. */
export function recordNight(o: RecordOptions): number {
  const statusFile = statusFileOf(o.status);
  if (!existsSync(statusFile)) throw new Error(`no noise status at ${statusFile}: run \`harness run --mode noise\` first (or \`harness local nightly\`)`);
  const sibling = join(resolve(statusFile, ".."), "report.json");
  const report = o.report ?? (existsSync(sibling) ? sibling : undefined);
  const store = resolve(o.store);
  mkdirSync(store, { recursive: true });
  const argv = ["--status", statusFile, "--history", join(store, HISTORY_FILE), "--out", store];
  if (report) argv.push("--report", report);
  if (o.tag) argv.push("--tag", o.tag);
  if (o.runUrl) argv.push("--run-url", o.runUrl);
  if (o.summary) argv.push("--summary", o.summary);
  if (o.masks) argv.push("--masks", o.masks);
  return record(argv);
}

export interface StatusReport {
  store: string;
  file: string;
  present: boolean;
  usable: boolean;
  status?: NoiseStatus;
  /** Would a release run FAIL on this status right now. */
  licensesFail: boolean;
  why: string;
  ageHours?: number;
}

export function describeStatus(pathOrDir: string, now: Date, maxAgeDays: number): StatusReport {
  const found = readStatus(pathOrDir);
  const base = { store: resolve(pathOrDir), file: found.file, present: found.present, usable: found.status !== undefined };
  if (!found.present) return { ...base, licensesFail: false, why: `no noise status at ${found.file}: release runs will only warn until a nightly A/A records one` };
  if (!found.status) return { ...base, licensesFail: false, why: `${found.file} is unusable (${found.problem}); release runs will only warn` };
  const trust = trustNoise({ noise: found.status, noiseWaived: false, noiseMaxAgeDays: maxAgeDays, ranAt: now });
  const ageHours = Math.round(((now.getTime() - new Date(found.status.ranAt).getTime()) / 3_600_000) * 10) / 10;
  return { ...base, status: found.status, licensesFail: trust.ok, why: trust.ok ? `A/A of ${found.status.ranAt} is clean, verified and fresh (${ageHours} h old): release runs may FAIL` : `${trust.why}; release runs will only warn`, ageHours };
}

/** `harness noise status`: prints; exit 0 unless `require` and the status does not license a FAIL. */
export function noiseStatusCommand(o: { store: string; maxAgeDays: number; json: boolean; require: boolean; now?: Date; out?: (line: string) => void; env?: NodeJS.ProcessEnv }): number {
  const out = o.out ?? ((l: string) => console.log(l));
  const env = o.env ?? process.env;
  const report = describeStatus(o.store, o.now ?? new Date(), o.maxAgeDays);
  if (o.json) out(JSON.stringify(report, null, 2));
  else out(report.licensesFail ? `noise status: ${report.why}` : `${env.GITHUB_ACTIONS ? "::warning title=Noise status does not license FAIL::" : "warning: "}${report.why}`);
  // For workflows: hand the file to `--noise` only when it parses; the gate decides the rest.
  if (env.GITHUB_OUTPUT && report.usable) appendFileSync(env.GITHUB_OUTPUT, `noise_file=${report.file}\n`);
  return o.require && !report.licensesFail ? 1 : 0;
}

/** `harness noise history`: the ratchet, the streak and the last nights. */
export function noiseHistoryCommand(o: { store: string; json: boolean; last: number; out?: (line: string) => void }): number {
  const out = o.out ?? ((l: string) => console.log(l));
  const file = join(resolve(o.store), HISTORY_FILE);
  const history = parseHistory(existsSync(file) ? readFileSync(file, "utf8") : undefined);
  const assessment = assess(history);
  if (o.json) {
    out(JSON.stringify({ file, entries: history.entries.slice(-o.last), assessment: assessment ?? null }, null, 2));
    return 0;
  }
  if (!assessment) {
    out(`no noise history at ${file}: nothing recorded yet (\`harness local nightly\`, or \`harness noise record --status <noise run dir>\`)`);
    return 0;
  }
  out(renderSummary(history, assessment, { maxMasks: DEFAULT_MAX_MASKS, maxRows: o.last }));
  return 0;
}
