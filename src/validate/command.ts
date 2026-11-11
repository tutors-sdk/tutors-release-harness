import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { FetchLike } from "../course/capture.ts";
import { loadValidateCorpus, VALIDATE_CORPUS_FILE, ValidateCorpusError, type ValidateCourse } from "./corpus.ts";
import { buildForecast, forecastCourse, forecastFails, forecastText, type Finding, type SideRun } from "./forecast.ts";
import { buildCommand, checkDeployCommand, jsrSpecs, resolveJsr, type DeployCheck } from "./jsr.ts";
import { materialise } from "./source.ts";

/**
 * `harness validate deploy|forecast` (since 1.63.0, docs/validate-forecast.md). The mono-repo's `tutors validate`
 * checks a lecturer's course folder; since mono-repo #591 the standard netlify.toml runs it before the generator, so it
 * decides whether a course deploys. deploy asks JSR whether the command in main's template can run at all; forecast
 * runs main's validate and the published one over the validate corpus and explains every difference by rule.
 * Exit 0 done, 1 deploy: the command cannot run; forecast --strict: main would stop a course deploying that
 * production lets through; 2 usage or input that cannot be read.
 */

type Values = Record<string, string | boolean | string[] | undefined>;

export class ValidateUsageError extends Error {}

/** The template the standard netlify.toml comes from, in a mono-repo checkout. */
export const TEMPLATE = "packages/jsr/course-rules/src/templates.ts";
/** main's validate, run from source in a mono-repo checkout. */
export const CREATE_MAIN = "packages/jsr/create/main.ts";

/** Runs one validator over one course folder and returns its findings (tutors validate --format json). */
export type ValidatorRun = (args: string[], cwd: string) => Finding[];

export const realValidator: ValidatorRun = (args, cwd) => {
  const r = spawnSync("deno", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  // 0 clean, 1 errors, 2 warnings under --strict: all print the report. 3 (or a crash) printed none.
  if (r.error) throw r.error;
  if (r.status === null || r.status > 2) throw new Error((r.stderr || `deno exited ${r.status}`).trim().split("\n").slice(-3).join(" "));
  return JSON.parse(r.stdout) as Finding[];
};

export interface ValidateDeps {
  fetch?: FetchLike;
  run?: ValidatorRun;
  materialise?: (course: ValidateCourse, work: string) => string;
  log?: (line: string) => void;
  home: string;
}

const str = (v: Values, k: string) => (typeof v[k] === "string" ? (v[k] as string) : undefined);

function candidateDir(v: Values): string {
  const dir = str(v, "candidate");
  if (!dir) throw new ValidateUsageError("--candidate <mono-repo checkout> is required: the folder holding main's packages/jsr");
  const abs = resolve(dir);
  if (!existsSync(join(abs, TEMPLATE))) throw new ValidateUsageError(`${abs} is not a mono-repo checkout with tutors validate: no ${TEMPLATE}`);
  return abs;
}

const write = (path: string | undefined, data: unknown) => {
  if (!path) return;
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(resolve(path), JSON.stringify(data, null, 2) + "\n");
};

export function deployText(d: DeployCheck): string {
  const lines = [`The standard netlify.toml builds with: ${d.command}`];
  for (const s of d.specs) lines.push(s.problem ? `  FAIL ${s.spec}: ${s.problem}.` : `  ok   ${s.spec} -> ${s.version}${s.hasValidate ? " (has validate)" : ""}`);
  lines.push(d.ok ? "Every course built from the template can deploy." : "A course built from this template fails its Netlify deploy until JSR has what the command names.");
  return lines.join("\n") + "\n";
}

async function deploy(v: Values, deps: ValidateDeps, log: (l: string) => void): Promise<number> {
  const dir = candidateDir(v);
  const result = await checkDeployCommand(readFileSync(join(dir, TEMPLATE), "utf8"), deps.fetch ?? (globalThis.fetch as FetchLike));
  write(str(v, "out"), result);
  log(v.json ? JSON.stringify(result) : deployText(result).trimEnd());
  return result.ok ? 0 : 1;
}

const sha = (dir: string): string | undefined => {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return undefined;
  }
};

async function forecast(v: Values, deps: ValidateDeps, log: (l: string) => void): Promise<number> {
  const dir = candidateDir(v);
  const fetch = deps.fetch ?? (globalThis.fetch as FetchLike);
  const run = deps.run ?? realValidator;
  const corpus = loadValidateCorpus(resolve(str(v, "corpus") ?? VALIDATE_CORPUS_FILE));
  const work = resolve(str(v, "dir") ?? join(deps.home, "validate"));

  // What lecturers run today: the tutors-create the template runs as validate, as JSR resolves it now (or --production).
  const asked = str(v, "production") ?? "auto";
  const template = buildCommand(readFileSync(join(dir, TEMPLATE), "utf8")) ?? "";
  const specText = asked === "auto" ? (jsrSpecs(template).find((s) => s.name === "tutors-create")?.spec ?? "jsr:@tutors/tutors-create") : asked;
  const [spec] = jsrSpecs(specText);
  if (!spec) throw new ValidateUsageError(`--production takes auto or a jsr: specifier such as jsr:@tutors/tutors-create@^5.4.0, not "${asked}"`);
  const resolved = await resolveJsr(spec, fetch, true);
  const production = { spec: spec.spec, ...(resolved.version ? { version: resolved.version } : {}), ...(resolved.problem ? { problem: resolved.problem } : {}) };
  const prodModule = resolved.version ? `jsr:@${spec.scope}/${spec.name}@${resolved.version}` : undefined;

  const courses = [];
  for (const course of corpus) {
    const root = (deps.materialise ?? materialise)(course, work);
    const side = (args: string[] | undefined, cwd: string, problem?: string): SideRun => {
      if (!args) return { problem: problem ?? "not available" };
      try {
        return { findings: run(args, cwd) };
      } catch (e) {
        return { problem: e instanceof Error ? e.message : String(e) };
      }
    };
    const prodRun = side(prodModule ? ["run", "-A", "--quiet", prodModule, "validate", root, "--format", "json"] : undefined, work, production.problem);
    const mainRun = side(["run", "-A", "--quiet", "--no-check", "--no-lock", join(dir, CREATE_MAIN), "validate", root, "--format", "json"], dir);
    courses.push(forecastCourse(course.name, course.commit, prodRun, mainRun));
    log(`${course.name}: main ${mainRun.problem ? `cannot run (${mainRun.problem})` : `${mainRun.findings!.length} findings`}`);
  }
  const candidateSha = sha(dir);
  const result = buildForecast(production, { dir, ...(candidateSha ? { sha: candidateSha } : {}) }, courses);
  write(str(v, "out") ?? join(work, "validate-forecast.json"), result);
  log(v.json ? JSON.stringify(result) : forecastText(result).trimEnd());
  if (courses.some((c) => c.candidate.problem)) return 1;
  return v.strict && forecastFails(result) ? 1 : 0;
}

export async function validateCommand(sub: string | undefined, v: Values, deps: ValidateDeps): Promise<number> {
  const log = deps.log ?? ((l: string) => console.log(l));
  try {
    switch (sub) {
      case "deploy":
        return await deploy(v, deps, log);
      case "forecast":
        return await forecast(v, deps, log);
      default:
        throw new ValidateUsageError(`validate takes deploy or forecast${sub ? `, not "${sub}"` : ""}: see harness help validate`);
    }
  } catch (e) {
    if (e instanceof ValidateUsageError || e instanceof ValidateCorpusError) {
      console.error(`harness validate: ${e.message}`);
      return 2;
    }
    throw e;
  }
}
