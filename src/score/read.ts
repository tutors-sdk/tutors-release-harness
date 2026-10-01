/**
 * The files the score reads and the one it writes. Kept apart from src/score/confidence.ts, which is pure.
 *
 * The optional inputs (`--test-signal`, `--traceability`, `--change-risk`, `--post-deploy`) are small JSON files the
 * monorepo or a later phase writes; their shapes are in docs/contract.md ("confidence.json"). One that is given and
 * cannot be read is an error, never silently "not measured": a dimension the caller asked for must be scored or refused.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { readReport } from "../ci/scorecard.ts";
import { MARKS_FILE, applyMarks, parseMarks } from "../glance/marks.ts";
import { glanceOf } from "../glance/read.ts";
import type { RunReport } from "../types.ts";
import { readMutantsFile, withHarnessMutants } from "./test-signal.ts";
import { confidence, gateOfReports, type ChangeRisk, type Confidence, type ConfidenceRun, type GateWord, type Located, type ScoreInputs, type TestSignal, type Traceability } from "./confidence.ts";

export class ScoreInputError extends Error {}

export const CONFIDENCE_FILE = "confidence.json";

/** A run directory, or the report.json in one: its directory. */
export function runDirOf(where: string): string {
  const p = resolve(where);
  return existsSync(p) && statSync(p).isDirectory() ? p : dirname(p);
}

/** `from` to `to` with forward slashes, "" when they are the same directory: how a link in confidence.json is written. */
const rel = (from: string, to: string) => relative(from, to).replaceAll("\\", "/");

function json(file: string, flag: string): unknown {
  if (!existsSync(file)) throw new ScoreInputError(`${flag}: ${file} does not exist`);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new ScoreInputError(`${flag}: ${file} is not JSON`);
  }
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const optStr = (x: unknown) => x === undefined || typeof x === "string";
const bad = (flag: string, file: string, what: string): never => {
  throw new ScoreInputError(`${flag}: ${file}: ${what} (docs/contract.md, "confidence.json", has the shape)`);
};

export function parseTestSignal(raw: unknown, file: string): TestSignal {
  const f = "--test-signal";
  if (!isObj(raw)) bad(f, file, "expected an object");
  const o = raw as Record<string, unknown>;
  // Since 1.18.0 the monorepo's quality record (schemaVersion 1 and a commit) is read as it is: one with no "packages" says
  // its Nightly wrote no mutation scores, and the dimension is then not measured, saying so, never an error.
  const record = o.schemaVersion === 1 && typeof o.commit === "string";
  if (o.packages === undefined && o.harnessMutants === undefined && !record) bad(f, file, 'needs "packages" or "harnessMutants"');
  if (o.packages !== undefined && (!Array.isArray(o.packages) || !o.packages.every((p) => isObj(p) && typeof p.name === "string" && typeof p.mutationScore === "number" && p.mutationScore >= 0 && p.mutationScore <= 100 && (p.changed === undefined || typeof p.changed === "boolean") && optStr(p.evidence))))
    bad(f, file, '"packages" must be [{ "name": string, "mutationScore": 0-100, "changed"?: boolean, "evidence"?: string }]');
  const m = o.harnessMutants;
  if (m !== undefined && !(isObj(m) && Number.isInteger(m.caught) && Number.isInteger(m.total) && (m.caught as number) >= 0 && (m.caught as number) <= (m.total as number) && optStr(m.evidence))) bad(f, file, '"harnessMutants" must be { "caught": n, "total": n, "evidence"?: string } with caught <= total');
  if (!optStr(o.evidence)) bad(f, file, '"evidence" must be a string');
  // What the harness sets itself is never read from the file.
  const { mutantsGap: _ignored, ...signal } = o;
  return { ...(signal as TestSignal), ...(record ? { commit: o.commit as string } : {}) };
}

export function parseTraceability(raw: unknown, file: string): Traceability {
  const f = "--traceability";
  if (!isObj(raw) || !Array.isArray(raw.entries)) return bad(f, file, 'expected { "entries": [...] }');
  const kinds = ["feature", "fix", "other"];
  if (!raw.entries.every((e) => isObj(e) && typeof e.entry === "string" && (e.kind === undefined || kinds.includes(e.kind as string)) && (e.ears === undefined || e.ears === null || typeof e.ears === "string") && (e.claimed === undefined || typeof e.claimed === "boolean") && optStr(e.evidence)))
    bad(f, file, '"entries" must be [{ "entry": string, "kind"?: "feature"|"fix"|"other", "ears"?: string|null, "claimed"?: boolean, "evidence"?: string }]');
  if (raw.untracedClaims !== undefined && !(Array.isArray(raw.untracedClaims) && raw.untracedClaims.every((c) => typeof c === "string"))) bad(f, file, '"untracedClaims" must be a list of strings');
  if (!optStr(raw.evidence)) bad(f, file, '"evidence" must be a string');
  return raw as unknown as Traceability;
}

/**
 * A changes.json (`harness changes`, since 1.10.0: its `changeRisk` block is read, and a deduction's evidence stays as
 * written) or the 1.9.0 shape `{ "prs": [...] }`. `reviewed` may be null since 1.10.0: not known (no token).
 */
export function parseChangeRisk(raw: unknown, file: string): ChangeRisk {
  const f = "--change-risk";
  const whole = isObj(raw) && isObj(raw.changeRisk);
  const o = whole ? (raw as { changeRisk: Record<string, unknown> }).changeRisk : raw;
  if (!isObj(o) || !Array.isArray(o.prs)) return bad(f, file, 'expected a changes.json, or { "prs": [...] }');
  if (!o.prs.every((p) => isObj(p) && Number.isInteger(p.number) && (typeof p.reviewed === "boolean" || p.reviewed === null) && optStr(p.url) && (p.firstTimeContributor === undefined || typeof p.firstTimeContributor === "boolean") && (p.hotspots === undefined || (Array.isArray(p.hotspots) && p.hotspots.every((h) => typeof h === "string")))))
    bad(f, file, '"prs" must be [{ "number": n, "reviewed": boolean|null, "url"?: string, "firstTimeContributor"?: boolean, "hotspots"?: [string] }]');
  if (o.deductions !== undefined && !(Array.isArray(o.deductions) && o.deductions.every((d) => isObj(d) && typeof d.points === "number" && d.points >= 0 && typeof d.why === "string" && typeof d.evidence === "string" && (d.floor === undefined || d.floor === true))))
    bad(f, file, '"deductions" must be [{ "points": n >= 0, "why": string, "evidence": string, "floor"?: true }]');
  if (o.gaps !== undefined && !(Array.isArray(o.gaps) && o.gaps.every((g) => typeof g === "string"))) bad(f, file, '"gaps" must be a list of strings');
  if (o.orphans !== undefined && !(Number.isInteger(o.orphans) && (o.orphans as number) >= 0)) bad(f, file, '"orphans" must be a whole number');
  if (!optStr(o.evidence)) bad(f, file, '"evidence" must be a string');
  // changes.json names itself as "changes.json"; the score names the file it read, relative to confidence.json.
  const { evidence: _named, ...rest } = o;
  return (whole ? rest : o) as unknown as ChangeRisk;
}

/** Where each input is. Run directories may be the directory or its report.json; the rest are files. */
export interface ScoreSources {
  /** Where confidence.json goes; links in it are relative to here. */
  outDir: string;
  /** The Gate as decided elsewhere (`harness release`); absent, it is worded from the reports read, by the gate's own rule. */
  gate?: GateWord;
  release?: string;
  migration?: string;
  upgrade?: string;
  postDeploy?: string;
  testSignal?: string;
  traceability?: string;
  changeRisk?: string;
  candidate?: string;
  baseline?: string;
  harness?: { version: string; contractVersion: string };
  /** releases.jsonl: the history the glance's novelty reads (since 1.12.0). */
  scoreboard?: string;
  /**
   * mutants.jsonl, the harness's weekly self-tests (since 1.18.0): the newest joins a --test-signal that has the
   * monorepo's packages and no harnessMutants of its own (src/score/test-signal.ts).
   */
  mutants?: string;
}

function report(where: string | undefined, outDir: string, flag: string, mode?: RunReport["mode"]): Located<RunReport> | undefined {
  if (!where) return undefined;
  let r: RunReport;
  try {
    r = readReport(where);
  } catch (e) {
    throw new ScoreInputError(`${flag}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (mode && r.mode !== mode) throw new ScoreInputError(`${flag}: ${where} is a ${r.mode}-mode report, not ${mode}`);
  return { data: r, where: rel(outDir, runDirOf(where)) };
}

/** A tag from an image reference (`quay.io/tutors-sdk/tutors-reader:16.2.2` is 16.2.2). */
const tagOf = (ref: string | undefined) => ref?.split("@")[0]?.split(":").pop();

export function scoreInputs(s: ScoreSources): ScoreInputs {
  const release = report(s.release, s.outDir, "--run", "release");
  const migration = report(s.migration, s.outDir, "--migration", "migration");
  const upgrade = report(s.upgrade, s.outDir, "--upgrade", "upgrade");
  const postDeploy = report(s.postDeploy, s.outDir, "--post-deploy", "post-deploy");
  const file = <T>(where: string | undefined, flag: string, parse: (raw: unknown, f: string) => T): Located<T> | undefined => (where ? { data: parse(json(resolve(where), flag), where), where: rel(s.outDir, resolve(where)) } : undefined);
  const given = file(s.testSignal, "--test-signal", parseTestSignal);
  const testSignal = given && s.mutants ? { ...given, data: withHarnessMutants(given.data, readMutantsFile(s.mutants), release?.data.ranAt) } : given;
  const traceability = file(s.traceability, "--traceability", parseTraceability);
  const changeRisk = file(s.changeRisk, "--change-risk", parseChangeRisk);
  const reports = { ...(release ? { release: join(release.where, "report.json").replaceAll("\\", "/") } : {}), ...(migration ? { migration: join(migration.where, "report.json").replaceAll("\\", "/") } : {}), ...(upgrade ? { upgrade: join(upgrade.where, "report.json").replaceAll("\\", "/") } : {}), ...(postDeploy ? { postDeploy: join(postDeploy.where, "report.json").replaceAll("\\", "/") } : {}) };
  const inputs = { ...(testSignal ? { testSignal: testSignal.where } : {}), ...(traceability ? { traceability: traceability.where } : {}), ...(changeRisk ? { changeRisk: changeRisk.where } : {}) };
  const candidate = s.candidate ?? tagOf(release?.data.sides?.b?.reader);
  const baseline = s.baseline ?? tagOf(release?.data.sides?.a?.reader);
  const run: ConfidenceRun = { ...(candidate ? { candidate } : {}), ...(baseline ? { baseline } : {}), ...(release ? { ranAt: release.data.ranAt } : {}), reports, ...(Object.keys(inputs).length ? { inputs } : {}), ...(s.harness ? { harness: s.harness } : {}) };
  const gate = s.gate ?? gateOfReports([release, migration, upgrade].filter((x) => x !== undefined).map((x) => x.data));
  return { gate, ...(release ? { release } : {}), ...(migration ? { migration } : {}), ...(upgrade ? { upgrade } : {}), ...(postDeploy ? { postDeploy } : {}), ...(testSignal ? { testSignal } : {}), ...(traceability ? { traceability } : {}), ...(changeRisk ? { changeRisk } : {}), run };
}

/**
 * Read what is there, score it, rank the reviewer's glance (since 1.12.0), write confidence.json into `outDir`. The glance
 * is ranked after the score and from the same inputs, and is never read back by it. Marks already recorded beside it
 * (a re-score) stay with their findings.
 */
export function scoreAndWrite(s: ScoreSources): { confidence: Confidence; file: string } {
  const inputs = scoreInputs(s);
  const c = confidence(inputs);
  const g = glanceOf({ outDir: s.outDir, inputs, ...(s.changeRisk ? { changeRisk: s.changeRisk } : {}), ...(s.scoreboard ? { scoreboard: s.scoreboard } : {}) });
  const marks = join(s.outDir, MARKS_FILE);
  c.glance = existsSync(marks) ? applyMarks(g.items, parseMarks(readFileSync(marks, "utf8"))) : g.items;
  c.glanceBasis = g.basis;
  const file = join(s.outDir, CONFIDENCE_FILE);
  writeFileSync(file, `${JSON.stringify(c, null, 2)}\n`);
  return { confidence: c, file };
}
