/**
 * The nightly A/A's memory and its stable home.
 *
 *   tsx src/ci/noise-history.ts record --status <noise-status.json> --out <dir> [--report <report.json>]
 *        [--history <noise-history.json>] [--tag T] [--run-url U] [--summary <file>] [--max-masks 40]
 *   tsx src/ci/noise-history.ts vet --status <file>
 *
 * `record` runs in the nightly's publish job. It appends tonight's result to
 * the history read from the `noise` branch, writes the three files that
 * branch holds (noise-status.json verbatim, noise-history.json,
 * noise-summary.md), prints the ratchet to the job summary and exits 1 when the
 * ratchet is broken: the noise count reached 0 on verified evidence once, and
 * must stay there.
 *
 * `vet` runs in the workflows that consult the status (release, post-deploy)
 * right after fetching it from the branch. A file that is missing, corrupt or
 * from another contract major is dropped with a warning so the run degrades to
 * WARN instead of stopping; a file that parses is passed on as it is and
 * `src/gate.ts` says why it does or does not count (dirty, degraded, stale).
 * The staleness rule itself is only ever in the gate.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { parse } from "yaml";
import { trustNoise } from "../gate.ts";
import { parseNoiseStatus } from "../noise.ts";
import type { NoiseStatus, RunReport } from "../types.ts";
import { HARNESS_VERSION } from "../version.ts";

/** The R3 exit criterion: this many consecutive clean, verified nightly A/As. */
export const STREAK_TARGET = 7;
/** Past this many masks nobody reviews the list any more (docs/noise-burndown.md). A warning, not a gate. */
export const DEFAULT_MAX_MASKS = 40;
/** A night with no result within this many hours of the last breaks "consecutive". */
const NIGHT_GAP_HOURS = 36;
const MAX_ENTRIES = 400;

export interface HistoryEntry {
  ranAt: string;
  tag?: string;
  hunks: number;
  /** Reasons the evidence was weak that night; empty when it was pulled and verified. */
  degraded: string[];
  harnessVersion?: string;
  /** Registry digests of the images that ran, by app, when they were pulled. */
  digests?: Record<string, string>;
  masks?: { total: number; silent: number };
  runUrl?: string;
}

export interface NoiseHistory {
  schemaVersion: 1;
  entries: HistoryEntry[];
}

const verified = (e: HistoryEntry) => e.degraded.length === 0;
const clean = (e: HistoryEntry) => verified(e) && e.hunks === 0;

export function parseHistory(text: string | undefined): NoiseHistory {
  if (!text?.trim()) return { schemaVersion: 1, entries: [] };
  try {
    const raw = JSON.parse(text) as Partial<NoiseHistory>;
    if (raw.schemaVersion !== 1 || !Array.isArray(raw.entries)) throw new Error("not a noise history");
    const entries = raw.entries.filter((e): e is HistoryEntry => typeof e?.ranAt === "string" && Number.isInteger(e.hunks)).map((e) => ({ ...e, degraded: Array.isArray(e.degraded) ? e.degraded : [] }));
    return { schemaVersion: 1, entries };
  } catch {
    // A damaged history must not stop tonight's status being published; it starts again, and the status still carries the truth.
    return { schemaVersion: 1, entries: [] };
  }
}

/** Append, replacing an entry for the same instant, oldest first, bounded. */
export function appendEntry(history: NoiseHistory, entry: HistoryEntry): NoiseHistory {
  const entries = [...history.entries.filter((e) => e.ranAt !== entry.ranAt), entry].sort((a, b) => a.ranAt.localeCompare(b.ranAt));
  return { schemaVersion: 1, entries: entries.slice(-MAX_ENTRIES) };
}

export interface Assessment {
  latest: HistoryEntry;
  /** The entry before the latest, if any. */
  previous?: HistoryEntry;
  /** Latest count minus the previous verified count; undefined when there is nothing to compare. */
  delta?: number;
  /** The lowest count seen on verified evidence: the ratchet. */
  floor?: number;
  /** Consecutive most recent clean, verified nights (a gap of more than 36 h, or a degraded night, ends it). */
  streak: number;
  streakTarget: number;
  /** True once the streak reaches the target: the R3 exit criterion on noise. */
  exitCriterionMet: boolean;
  /** The count reached 0 on verified evidence before tonight and tonight it is not: the ratchet is broken. */
  regression: boolean;
  /** Tonight's evidence was weak; the count does not count either way. */
  degraded: boolean;
  /** The count went up on verified evidence, before it ever reached 0. */
  rising: boolean;
}

export function assess(history: NoiseHistory): Assessment | undefined {
  const entries = history.entries;
  const latest = entries.at(-1);
  if (!latest) return undefined;
  const before = entries.slice(0, -1);
  const previous = before.at(-1);
  const previousVerified = [...before].reverse().find(verified);
  const zeroBefore = before.some(clean);
  const floor = entries.filter(verified).reduce<number | undefined>((min, e) => (min === undefined ? e.hunks : Math.min(min, e.hunks)), undefined);

  let streak = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]!;
    if (!clean(e)) break;
    const next = entries[i + 1];
    if (next && new Date(next.ranAt).getTime() - new Date(e.ranAt).getTime() > NIGHT_GAP_HOURS * 3_600_000) break;
    streak += 1;
  }

  const degraded = !verified(latest);
  const regression = !degraded && zeroBefore && latest.hunks > 0;
  const delta = previousVerified ? latest.hunks - previousVerified.hunks : undefined;
  return {
    latest,
    ...(previous ? { previous } : {}),
    ...(delta === undefined || degraded ? {} : { delta }),
    ...(floor === undefined ? {} : { floor }),
    streak,
    streakTarget: STREAK_TARGET,
    exitCriterionMet: streak >= STREAK_TARGET,
    regression,
    degraded,
    rising: !degraded && !regression && delta !== undefined && delta > 0
  };
}

export interface MaskCount {
  total: number;
  silent: number;
}

/** Count the masks in masks.yaml, and how many were silent in `report` (0 hits). */
export function countMasks(masksYaml: string | undefined, report?: Pick<RunReport, "masksApplied">): MaskCount | undefined {
  if (!masksYaml) return undefined;
  const parsed = parse(masksYaml) as { masks?: { id: string }[] } | null;
  const total = parsed?.masks?.length ?? 0;
  const silent = report ? Object.values(report.masksApplied).filter((n) => n === 0).length : 0;
  return { total, silent };
}

const trend = (n: number) => (n === 0 ? "0" : `${"█".repeat(Math.min(n, 30))} ${n}`);

export function renderSummary(history: NoiseHistory, a: Assessment, opts: { tag?: string; runUrl?: string; masks?: MaskCount; maxMasks: number; maxRows?: number }): string {
  const { latest } = a;
  const lines: string[] = [];
  const state = a.regression ? "RATCHET BROKEN" : a.degraded ? "DEGRADED" : latest.hunks === 0 ? "clean" : "noisy";
  lines.push(`## Nightly noise (A/A) — ${state}`);
  lines.push("");
  lines.push("| | |");
  lines.push("|---|---|");
  lines.push(`| noise count tonight | **${latest.hunks}**${a.delta === undefined ? "" : ` (${a.delta > 0 ? "+" : ""}${a.delta} on the last verified night)`} |`);
  lines.push(`| ratchet (lowest verified count) | ${a.floor ?? "—"}${a.floor === 0 ? " — reached 0: it must stay there" : ""} |`);
  lines.push(`| clean streak | ${a.streak} of ${a.streakTarget} consecutive nights${a.exitCriterionMet ? " — the noise exit criterion is met" : ""} |`);
  lines.push(`| evidence | ${a.degraded ? `**DEGRADED, does not count:** ${latest.degraded.join("; ")}` : "pulled and signature-verified in this run"} |`);
  if (opts.tag) lines.push(`| production tag | \`${opts.tag}\` |`);
  if (latest.digests) lines.push(`| digests | ${Object.entries(latest.digests).map(([app, d]) => `${app} \`${d.replace(/^sha256:/, "").slice(0, 12)}\``).join(", ")} |`);
  if (opts.masks) lines.push(`| masks | ${opts.masks.total} (review limit ~${opts.maxMasks})${opts.masks.total > opts.maxMasks ? " — **over the limit: consolidate or fix determinism instead of masking**" : ""}; ${opts.masks.silent} silent tonight |`);
  lines.push(`| harness | ${latest.harnessVersion ?? HARNESS_VERSION}${opts.runUrl ? ` · [run](${opts.runUrl})` : ""} |`);
  lines.push("");
  if (a.regression) lines.push(`The count had reached 0 on verified evidence and is ${latest.hunks} tonight. That is a regression in the images, the masks or the harness: find the change (\`docs/noise-burndown.md\`, "Reading a noisy A/A"), do not retry.`, "");
  if (a.degraded) lines.push("A degraded night neither extends the clean streak nor counts against the ratchet, and release runs will only warn until a verified clean night is published.", "");
  const rows = history.entries.slice(-(opts.maxRows ?? 14)).reverse();
  lines.push("<details><summary>Last nights</summary>", "", "| ran at | count | evidence |", "|---|---|---|");
  for (const e of rows) lines.push(`| ${e.ranAt} | ${trend(e.hunks)} | ${verified(e) ? "verified" : `degraded: ${e.degraded.join("; ").slice(0, 120)}`} |`);
  lines.push("", "</details>", "");
  return lines.join("\n");
}

function annotations(a: Assessment, masks: MaskCount | undefined, maxMasks: number): string[] {
  const out: string[] = [];
  if (a.regression) out.push(`::error title=Noise ratchet broken::the A/A count reached 0 and is ${a.latest.hunks} tonight; find what changed, do not retry`);
  else if (a.degraded) out.push(`::warning title=Noise A/A degraded::${a.latest.degraded.join("; ")} - tonight does not count and release runs will only warn`);
  else if (a.rising) out.push(`::warning title=Noise count rising::${a.latest.hunks} diff(s), up ${a.delta} on the last verified night`);
  if (masks && masks.total > maxMasks) out.push(`::warning title=Too many masks::${masks.total} masks exceed the review limit of ${maxMasks}; consolidate or fix determinism instead of masking`);
  return out;
}

const read = (path: string | undefined): string | undefined => (path && existsSync(path) ? readFileSync(path, "utf8") : undefined);

export function record(argv: string[]): number {
  const { values } = parseArgs({ args: argv, options: { status: { type: "string" }, report: { type: "string" }, masks: { type: "string" }, history: { type: "string" }, out: { type: "string" }, tag: { type: "string" }, "run-url": { type: "string" }, summary: { type: "string" }, "max-masks": { type: "string" } } });
  if (!values.status || !values.out) {
    console.error("usage: noise-history record --status <noise-status.json> --out <dir> [--report r.json] [--history h.json] [--masks masks.yaml] [--tag T] [--run-url U] [--summary file] [--max-masks 40]");
    return 2;
  }
  const statusText = readFileSync(values.status, "utf8");
  const status: NoiseStatus = parseNoiseStatus(statusText, values.status);
  const reportText = read(values.report);
  const report = reportText ? (JSON.parse(reportText) as RunReport) : undefined;
  const maxMasks = values["max-masks"] ? Number(values["max-masks"]) : DEFAULT_MAX_MASKS;
  const masks = countMasks(read(values.masks) ?? read(resolve(import.meta.dirname, "../../normalise/masks.yaml")), report);

  const digests = report?.provenance?.a
    ? Object.fromEntries(Object.entries(report.provenance.a.images).flatMap(([app, info]) => (info.digest ? [[app, info.digest]] : [])))
    : undefined;
  const entry: HistoryEntry = {
    ranAt: status.ranAt,
    ...(values.tag ? { tag: values.tag } : {}),
    hunks: status.hunks,
    degraded: status.degraded ?? [],
    harnessVersion: report?.harness.version ?? HARNESS_VERSION,
    ...(digests && Object.keys(digests).length ? { digests } : {}),
    ...(masks ? { masks } : {}),
    ...(values["run-url"] ? { runUrl: values["run-url"] } : {})
  };
  const history = appendEntry(parseHistory(read(values.history)), entry);
  const assessment = assess(history)!;

  const out = resolve(values.out);
  mkdirSync(out, { recursive: true });
  // The status is copied byte for byte: what release runs read is exactly what the noise run wrote.
  writeFileSync(join(out, "noise-status.json"), statusText);
  writeFileSync(join(out, "noise-history.json"), JSON.stringify(history, null, 2) + "\n");
  const summary = renderSummary(history, assessment, { ...(values.tag ? { tag: values.tag } : {}), ...(values["run-url"] ? { runUrl: values["run-url"] } : {}), ...(masks ? { masks } : {}), maxMasks });
  writeFileSync(join(out, "noise-summary.md"), summary);
  if (values.summary) appendFileSync(values.summary, summary + "\n");
  console.log(summary);
  for (const line of annotations(assessment, masks, maxMasks)) console.log(line);
  return assessment.regression ? 1 : 0;
}

/** What a consuming workflow does with a fetched status. Writes `noise_file=<path>` to $GITHUB_OUTPUT only for one that parses. */
export function vet(argv: string[], now: Date = new Date()): number {
  const { values } = parseArgs({ args: argv, options: { status: { type: "string" }, "max-age-days": { type: "string" } } });
  if (!values.status) {
    console.error("usage: noise-history vet --status <file> [--max-age-days 7]");
    return 2;
  }
  const text = read(values.status);
  if (!text?.trim()) {
    console.log("::warning title=No noise status::none was found on the noise branch; the harness is advisory (verdict WARN, never FAIL) until a nightly A/A publishes a clean one");
    return 0;
  }
  let status: NoiseStatus;
  try {
    status = parseNoiseStatus(text, values.status);
  } catch (e) {
    console.log(`::warning title=Unusable noise status::${(e instanceof Error ? e.message : String(e)).split("\n")[0]}; ignored, so the harness is advisory (WARN, never FAIL)`);
    return 0;
  }
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `noise_file=${resolve(values.status)}\n`);
  const trust = trustNoise({ noise: status, noiseWaived: false, noiseMaxAgeDays: values["max-age-days"] ? Number(values["max-age-days"]) : 7, ranAt: now });
  console.log(trust.ok ? `noise status ${status.ranAt}: clean, verified and fresh: release runs may FAIL` : `::warning title=Noise status does not license FAIL::${trust.why}; release runs will only warn`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, ...rest] = process.argv.slice(2);
  try {
    process.exit(command === "record" ? record(rest) : command === "vet" ? vet(rest) : (console.error("usage: noise-history record|vet ..."), 2));
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(2);
  }
}
