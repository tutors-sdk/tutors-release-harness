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
import type { RunReport } from "../types.ts";
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
  if (o.packages === undefined && o.harnessMutants === undefined) bad(f, file, 'needs "packages" or "harnessMutants"');
  if (o.packages !== undefined && (!Array.isArray(o.packages) || !o.packages.every((p) => isObj(p) && typeof p.name === "string" && typeof p.mutationScore === "number" && p.mutationScore >= 0 && p.mutationScore <= 100 && (p.changed === undefined || typeof p.changed === "boolean") && optStr(p.evidence))))
    bad(f, file, '"packages" must be [{ "name": string, "mutationScore": 0-100, "changed"?: boolean, "evidence"?: string }]');
  const m = o.harnessMutants;
  if (m !== undefined && !(isObj(m) && Number.isInteger(m.caught) && Number.isInteger(m.total) && (m.caught as number) >= 0 && (m.caught as number) <= (m.total as number) && optStr(m.evidence))) bad(f, file, '"harnessMutants" must be { "caught": n, "total": n, "evidence"?: string } with caught <= total');
  if (!optStr(o.evidence)) bad(f, file, '"evidence" must be a string');
  return o as TestSignal;
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

export function parseChangeRisk(raw: unknown, file: string): ChangeRisk {
  const f = "--change-risk";
  if (!isObj(raw) || !Array.isArray(raw.prs)) return bad(f, file, 'expected { "prs": [...] }');
  if (!raw.prs.every((p) => isObj(p) && Number.isInteger(p.number) && typeof p.reviewed === "boolean" && optStr(p.url) && (p.firstTimeContributor === undefined || typeof p.firstTimeContributor === "boolean") && (p.hotspots === undefined || (Array.isArray(p.hotspots) && p.hotspots.every((h) => typeof h === "string")))))
    bad(f, file, '"prs" must be [{ "number": n, "reviewed": boolean, "url"?: string, "firstTimeContributor"?: boolean, "hotspots"?: [string] }]');
  if (!optStr(raw.evidence)) bad(f, file, '"evidence" must be a string');
  return raw as unknown as ChangeRisk;
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
  const testSignal = file(s.testSignal, "--test-signal", parseTestSignal);
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

/** Read what is there, score it, write confidence.json into `outDir`. */
export function scoreAndWrite(s: ScoreSources): { confidence: Confidence; file: string } {
  const c = confidence(scoreInputs(s));
  const file = join(s.outDir, CONFIDENCE_FILE);
  writeFileSync(file, `${JSON.stringify(c, null, 2)}\n`);
  return { confidence: c, file };
}
