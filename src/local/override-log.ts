import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import type { RunReport } from "../types.ts";

/**
 * The local record of overrides: the equivalent of the `harness-override`
 * issues release.yml opens. An override is a person accepting a harness FAIL
 * (`--override-reason`, `--override-by`); the quarterly count of these is the
 * measure of whether the harness is trusted or tolerated (docs/noise-burndown.md).
 *
 * Append-only JSON lines. Each line carries the sha256 of the line before it
 * (`prev`), so a line removed or edited afterwards shows as a broken chain in
 * `harness override list`. That is tamper-evidence, not tamper-proofing: someone
 * with the file can rewrite the whole chain, as someone with admin rights can
 * close an issue.
 */
export interface OverrideEntry {
  seq: number;
  /** When the override was recorded (the report's override.at). */
  at: string;
  by: string;
  reason: string;
  mode: string;
  /** The verdict the harness reached: always "fail" for an applied override. */
  verdict: string;
  reportDir?: string;
  a?: string;
  b?: string;
  harnessVersion: string;
  /** sha256 of the previous line, or 64 zeros for the first. */
  prev: string;
}

const ZERO = "0".repeat(64);
const sha = (line: string) => createHash("sha256").update(line).digest("hex");

const lines = (file: string): string[] => (existsSync(file) ? readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean) : []);

/** Append an override to the log. Returns the entry written. */
export function appendOverride(file: string, entry: Omit<OverrideEntry, "seq" | "prev">): OverrideEntry {
  const existing = lines(file);
  const last = existing.at(-1);
  let seq = 1;
  if (last) {
    try {
      seq = (JSON.parse(last) as OverrideEntry).seq + 1;
    } catch {
      seq = existing.length + 1;
    }
  }
  const full: OverrideEntry = { seq, ...entry, prev: last ? sha(last) : ZERO };
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(full) + "\n");
  return full;
}

export interface OverrideLog {
  entries: OverrideEntry[];
  /** False when a line is unreadable or does not chain from the one before it. */
  chainIntact: boolean;
  problems: string[];
}

export function readOverrides(file: string): OverrideLog {
  const entries: OverrideEntry[] = [];
  const problems: string[] = [];
  let prev = ZERO;
  lines(file).forEach((line, i) => {
    try {
      const entry = JSON.parse(line) as OverrideEntry;
      if (entry.prev !== prev) problems.push(`line ${i + 1} (seq ${entry.seq}) does not chain from the line before it: a line was removed or changed`);
      entries.push(entry);
    } catch {
      problems.push(`line ${i + 1} is not valid JSON`);
    }
    prev = sha(line);
  });
  return { entries, chainIntact: problems.length === 0, problems };
}

/** The entry for a finished run's report, when the report records an applied override. */
export function overrideFromReport(report: Pick<RunReport, "override" | "mode" | "sides" | "harness">, reportDir: string): Omit<OverrideEntry, "seq" | "prev"> | undefined {
  const o = report.override;
  if (!o?.applied) return undefined;
  return {
    at: o.at,
    by: o.by,
    reason: o.reason,
    mode: report.mode,
    verdict: o.verdict,
    reportDir,
    a: report.sides.a.reader,
    b: report.sides.b.reader,
    harnessVersion: report.harness.version
  };
}
