/**
 * What `harness why --run <dir>` reads: a `harness release` directory (gate.json names the release run; confidence.json,
 * changes.json, glance-marks.jsonl and status.json sit beside it) or one run directory (its report.json, and a
 * confidence.json or changes.json beside it when `harness confidence` or `harness changes --out` put one there). A file
 * that is not there is simply absent from the context: the stub then says "not measured", never makes a fact up.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Changes } from "../changes/signals.ts";
import { MARKS_FILE, parseMarks } from "../glance/marks.ts";
import { captures } from "../glance/read.ts";
import type { Confidence } from "../score/confidence.ts";
import { CONFIDENCE_FILE } from "../score/read.ts";
import { readTrends } from "../scoreboard/store.ts";
import type { RunReport } from "../types.ts";
import { readRegister } from "./register.ts";
import { WhyInputError, type WhyContext } from "./trace.ts";

const readJson = <T>(file: string): T => {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    throw new WhyInputError(`${file} is not JSON`);
  }
};
const optionalJson = <T>(file: string): T | undefined => (existsSync(file) ? readJson<T>(file) : undefined);

function report(dir: string): WhyContext["report"] {
  const file = join(dir, "report.json");
  if (!existsSync(file)) return undefined;
  const data = readJson<RunReport>(file);
  if (!data.compare || !Array.isArray(data.compare.hunks)) throw new WhyInputError(`${file} is not a report.json`);
  return { data, dir };
}

/** A whole changes.json (per-PR files), else nothing: the 1.9.0 `{ prs }` shape cannot say which files a PR changed. */
function changesIn(dir: string, named?: string): Changes | undefined {
  for (const f of [named, join(dir, "changes.json")]) {
    if (!f || !existsSync(f)) continue;
    const c = readJson<Partial<Changes>>(f);
    if (Array.isArray(c.prs) && c.prs.every((p) => Array.isArray(p.files))) return c as Changes;
  }
  return undefined;
}

const gateOfCode = (code: number, steps: { verdict?: string; overridden?: boolean }[]) =>
  code === 2 ? "NOT JUDGED" : code === 1 ? "FAIL" : steps.some((s) => s.overridden) ? "FAIL (OVERRIDDEN)" : steps.some((s) => s.verdict === "warn") ? "WARN" : "PASS";

export interface ContextOptions {
  /** releases.jsonl, for a run-rule finding (and the rules `harness release` opens by itself). */
  scoreboard?: string;
  /** The register directory, for countermeasures-rising. */
  register?: string;
  /** --tag: the release, when the run does not name it (a post-deploy run). */
  tag?: string;
  now: Date;
}

export function loadContext(where: string, o: ContextOptions): WhyContext {
  const p = resolve(where);
  if (!existsSync(p)) throw new WhyInputError(`--run: ${where} does not exist`);
  const dir = statSync(p).isDirectory() ? p : dirname(p);
  const marksFile = join(dir, MARKS_FILE);
  const marks = existsSync(marksFile) ? parseMarks(readFileSync(marksFile, "utf8")) : [];
  const confidence = optionalJson<Confidence>(join(dir, CONFIDENCE_FILE));
  const gateFile = join(dir, "gate.json");
  let ctx: WhyContext;
  if (!existsSync(join(dir, "report.json")) && existsSync(gateFile)) {
    // A harness release directory: gate.json names the runs and the Gate.
    const g = readJson<{ production?: string; candidate?: string; code: number; steps: { id: string; runDir?: string; verdict?: string; overridden?: boolean }[] }>(gateFile);
    const releaseDir = g.steps?.find((s) => s.id === "release")?.runDir;
    const status = optionalJson<{ stopped?: { stage: string; why: string } }>(join(dir, "status.json"));
    const rep = releaseDir && existsSync(releaseDir) ? report(releaseDir) : undefined;
    ctx = {
      dir,
      kind: "release-command",
      ...(o.tag || g.candidate ? { tag: o.tag ?? g.candidate } : {}),
      ...(g.production ? { baseline: g.production } : {}),
      gate: confidence?.gate ?? gateOfCode(g.code, g.steps ?? []),
      ...(rep ? { report: rep, captures: captures(rep.dir) } : {}),
      ...(confidence ? { confidence } : {}),
      ...(status?.stopped ? { stopped: { stage: status.stopped.stage, why: status.stopped.why } } : {}),
      marks
    };
  } else {
    const rep = report(dir);
    if (!rep && !confidence) throw new WhyInputError(`--run: ${dir} has no report.json, gate.json or ${CONFIDENCE_FILE}: name a run directory or a harness release directory`);
    const tag = o.tag ?? confidence?.run.candidate ?? rep?.data.deployment?.production ?? rep?.data.deployment?.record?.candidate;
    ctx = {
      dir,
      kind: "run",
      ...(tag ? { tag } : {}),
      ...(confidence?.run.baseline ? { baseline: confidence.run.baseline } : {}),
      ...(confidence || rep ? { gate: confidence?.gate ?? rep!.data.verdict.toUpperCase() } : {}),
      ...(rep ? { report: rep, captures: captures(dir) } : {}),
      ...(confidence ? { confidence } : {}),
      marks
    };
  }
  const changes = changesIn(dir, confidence?.run.inputs?.changeRisk ? resolve(dir, confidence.run.inputs.changeRisk) : undefined);
  if (changes) ctx.changes = changes;
  if (o.scoreboard && existsSync(o.scoreboard)) {
    ctx.trends = readTrends({ file: o.scoreboard, now: o.now });
    ctx.trendsSource = o.scoreboard;
  }
  if (o.register && existsSync(o.register)) ctx.register = readRegister(o.register);
  return ctx;
}
