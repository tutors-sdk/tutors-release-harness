import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { APPS, imageRepo, type App } from "../image-ref.ts";
import type { RunReport } from "../types.ts";
import { LockHeldError } from "./lock.ts";
import { WORKFLOW_DEFAULTS, executePlan, planGate, renderPlan, type Executor, type Plan } from "./tasks.ts";

/**
 * `harness local compare`: the release gate's release step (`local gate --only release`), run with `main` as the
 * candidate against the newest released version as production, as an exploration: no claims unless asked for, so every
 * difference is listed as unclaimed, and the exit code says whether the run produced a report, not what it found
 * (`--strict` makes it follow the verdict like `gate`).
 *
 * This file adds two things to the gate's plan builder and nothing else: finding "the last release" (a query of the
 * public Quay API, through an injectable fetch) and a summary after the run. The steps are `planGate`'s.
 */

export const COMPARE_DEFAULTS = { candidate: "main", runs: 3 } as const;

// ---- which release is the last one -------------------------------------------------------------------

/** A release tag: strict `X.Y.Z`. No `v` prefix, no prerelease (`-rc.1`), no build metadata, no `16.2` alias, no `main`, `latest` or `sha-…`. */
const RELEASE_TAG = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const isReleaseTag = (tag: string): boolean => RELEASE_TAG.test(tag);

/** Order two release tags numerically, so `16.10.0` is above `16.9.0`. */
export function compareReleases(a: string, b: string): number {
  const x = a.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) if (x[i] !== y[i]) return x[i]! - y[i]!;
  return 0;
}

/** The highest release tag every app has; undefined when they share none. An app missing the newest tag makes it the previous one. */
export function highestCommonRelease(tagsByApp: Record<string, Iterable<string>>): string | undefined {
  const sets = Object.values(tagsByApp).map((tags) => new Set([...tags].filter(isReleaseTag)));
  if (sets.length === 0) return undefined;
  const common = [...sets[0]!].filter((t) => sets.every((s) => s.has(t)));
  return common.sort(compareReleases).at(-1);
}

/** What the fetch of this file needs of a response: the subset of `fetch`'s that a test can fake. */
export interface HttpResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}
export type FetchLike = (url: string) => Promise<HttpResponse>;

/** `fetch`, given a timeout: a registry that does not answer must not hang the command. */
export const realFetch: FetchLike = (url) => fetch(url, { signal: AbortSignal.timeout(20_000), headers: { accept: "application/json" } });

/** `quay.io/<namespace>/<repository>` from an image repository, or undefined when it is not on Quay. */
export function quayRepository(repo: string): { namespace: string; name: string } | undefined {
  const m = /^quay\.io\/([^/]+)\/([^/]+)$/.exec(repo);
  return m ? { namespace: m[1]!, name: m[2]! } : undefined;
}

/** More pages than any of these repositories will have; a bound, so a misbehaving API cannot loop the command. */
const MAX_PAGES = 20;

/** Every active tag name of one Quay repository (`limit=100` a page, paged while Quay says there are more). */
export async function quayTags(repo: { namespace: string; name: string }, fetchJson: FetchLike): Promise<string[]> {
  const names: string[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `https://quay.io/api/v1/repository/${repo.namespace}/${repo.name}/tag/?limit=100&onlyActiveTags=true${page > 1 ? `&page=${page}` : ""}`;
    const res = await fetchJson(url);
    if (!res.ok) throw new Error(`${url} answered ${res.status}`);
    const body = (await res.json()) as { tags?: { name?: unknown }[]; has_additional?: unknown };
    if (!Array.isArray(body.tags)) throw new Error(`${url} did not answer with a tag list`);
    for (const t of body.tags) if (typeof t.name === "string") names.push(t.name);
    if (body.has_additional !== true) return names;
  }
  return names;
}

export interface ResolvedRelease {
  tag: string;
  /** Where it came from, as `resolved: <tag> (<how>)` prints it. */
  how: string;
}

/** Nothing to compare against: exit 2, with what to do about it. */
export class ReleaseResolutionError extends Error {}

/**
 * The newest released version: the highest `X.Y.Z` tag that exists for all four apps under `HARNESS_IMAGE_PREFIX`
 * (default quay.io/tutors-sdk/tutors-{app}), read from the public Quay API. A prefix that is not a Quay one, or an
 * answer that cannot be had or used, falls back to `HARNESS_PRODUCTION_TAG` (not its literal default `main`); with
 * neither, {@link ReleaseResolutionError} says how to pass `--a`.
 */
export async function resolveLastRelease(env: NodeJS.ProcessEnv, fetchJson: FetchLike = realFetch): Promise<ResolvedRelease> {
  const prefix = env.HARNESS_IMAGE_PREFIX || WORKFLOW_DEFAULTS.imagePrefix;
  let why: string;
  try {
    const repos = APPS.map((app) => ({ app, repo: quayRepository(imageRepo(prefix, app)) }));
    if (repos.some((r) => !r.repo)) why = `the image prefix ${prefix} is not a quay.io one`;
    else {
      const tags = await Promise.all(repos.map(async (r) => [r.app, await quayTags(r.repo!, fetchJson)] as const));
      const found = highestCommonRelease(Object.fromEntries(tags) as Record<App, string[]>);
      if (found) return { tag: found, how: `highest X.Y.Z present for ${APPS.join(", ")} on quay.io` };
      why = `no X.Y.Z tag exists for all of ${APPS.join(", ")} on quay.io`;
    }
  } catch (e) {
    why = `quay.io could not be queried (${e instanceof Error ? e.message : String(e)})`;
  }
  const fallback = env.HARNESS_PRODUCTION_TAG?.trim();
  if (fallback && fallback !== WORKFLOW_DEFAULTS.productionTag) return { tag: fallback, how: `HARNESS_PRODUCTION_TAG, because ${why}` };
  throw new ReleaseResolutionError(`cannot find the last release: ${why}, and HARNESS_PRODUCTION_TAG is not set to a release. Pass it: harness local compare --a <tag> (for example --a 16.2.2).`);
}

// ---- the plan ---------------------------------------------------------------------------------------

export interface CompareOptions {
  /** The last release (resolved before this is called). */
  production: string;
  candidate: string;
  runs: number;
  /** `<rate>x<duration>`, or false for no load leg. */
  load: string | false;
  claims?: string;
}

/** The gate's release step and the two things before it (the noise status, the pull and verify), with this command's defaults. */
export function planCompare(o: CompareOptions): Plan {
  const plan = planGate({ production: o.production, candidate: o.candidate, only: "release", runs: o.runs, load: o.load, ...(o.claims ? { claims: o.claims } : {}) });
  const titles: Record<string, string> = {
    ensure: "pull and verify both sides (nothing is built)",
    release: `release mode: ${o.candidate} beside ${o.production}, ${o.claims ? "with your claims" : "no claims, so every difference is unclaimed"}${o.load === false ? ", no load" : `, k6 ${o.load}`}`
  };
  return { ...plan, task: "compare", steps: plan.steps.map((s) => ({ ...s, title: titles[s.id] ?? s.title })) };
}

// ---- after the run ----------------------------------------------------------------------------------

export interface CompareSummary {
  a: string;
  b: string;
  resolved: string;
  verdict: string;
  reasons: string[];
  differences: number;
  claimed: number;
  unclaimed: number;
  informational: number;
  runDir: string;
  reportMd: string;
  reportHtml: string;
  elapsedSeconds: number;
  exitCode: number;
}

/** The run's report.json. `problem` when it is there and cannot be used: a harness error, not a verdict. */
export function readCompareReport(runDir: string): { report: RunReport } | { problem: string } {
  const file = join(runDir, "report.json");
  try {
    const report = JSON.parse(readFileSync(file, "utf8")) as RunReport;
    if (typeof report.verdict !== "string" || !Array.isArray(report.compare?.hunks)) return { problem: `${file} is not a run report` };
    return { report };
  } catch (e) {
    return { problem: `${file} cannot be read: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export function countHunks(report: RunReport): { differences: number; claimed: number; unclaimed: number; informational: number } {
  const c = report.compare;
  return {
    differences: c.hunks.length,
    claimed: c.matches.filter((m) => m.claim).length,
    unclaimed: c.unclaimed.length,
    informational: c.hunks.filter((h) => h.severity === "info").length
  };
}

export function formatElapsed(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = String(s % 60).padStart(2, "0");
  return m < 60 ? `${m}m ${rest}s` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m ${rest}s`;
}

/** The end-of-run block: what to read first, where it is, and the commands that exist to go on with. */
export function renderSummary(s: CompareSummary, o: { strict: boolean }): string {
  const lines = [
    "",
    `== compare: ${s.b} beside the last release ${s.a}`,
    `verdict:      ${s.verdict.toUpperCase()}${s.verdict === "fail" ? " (a difference nobody claimed; here that means \"this changed\", not \"this is broken\")" : ""}`,
    ...s.reasons.map((r) => `              - ${r}`),
    `differences:  ${s.differences} (${s.claimed} claimed, ${s.unclaimed} unclaimed${s.informational ? `, ${s.informational} informational` : ""})`,
    `report.md:    ${s.reportMd}`,
    `report.html:  ${s.reportHtml}`,
    `              open ${relativeReport(s)} in a browser to read it`,
    `elapsed:      ${formatElapsed(s.elapsedSeconds)}`,
    `exit code:    ${s.exitCode} (${o.strict ? "--strict: follows the verdict like `local gate`" : "an exploration: 0 whenever a report was produced; --strict follows the verdict"})`,
    "",
    "next:",
    `  1. read ${s.reportHtml}`,
    `  2. judge these captures against a claims file, without running anything again: pnpm harness compare --dir ${quoteArg(s.runDir)} --mode release --claims <claims.yaml>`,
    `  3. the gate as CI runs it (claims, five runs, load, the migration and upgrade rehearsals): pnpm harness local gate --a ${s.a} --b ${s.b} --claims <claims.yaml>`
  ];
  return lines.join("\n");
}

const quoteArg = (p: string): string => (/^[A-Za-z0-9_@%+=:,./\\-]+$/.test(p) ? p : `'${p.replaceAll("'", "''")}'`);
/** `out/<timestamp>-release/report.html` as the person finds it under the checkout; absolute when the run directory is elsewhere. */
const relativeReport = (s: CompareSummary): string => {
  const parts = s.reportHtml.replaceAll("\\", "/").split("/");
  const at = parts.lastIndexOf("out");
  return at >= 0 ? parts.slice(at).join("/") : s.reportHtml;
};

// ---- running it -------------------------------------------------------------------------------------

export interface CompareRun {
  plan: Plan;
  /** The environment of every step: where bare tags live, the port offset. */
  env: Record<string, string>;
  ex: Executor;
  /** Take the run lock; throws {@link LockHeldError}. Returns the release. */
  lock: () => () => void;
  a: string;
  b: string;
  /** How `--a` was found, for the summary. */
  resolved: string;
  strict: boolean;
  json: boolean;
  now?: () => number;
  /** Where messages for a person go; with `--json` that is stderr, so stdout is the one JSON document. */
  say: (message: string) => void;
  /** The one JSON document of `--json`. */
  emit: (text: string) => void;
}

/**
 * Run the plan and report. Exit codes:
 *   0  the run completed and wrote a report, whatever it found (with `--strict`: the verdict is pass or warn)
 *   1  with `--strict`, the verdict is fail; without it, the report it wrote cannot be read (a harness fault)
 *   2  it could not judge: an image missing or unverifiable, the run lock held, or no report was written
 */
export function runCompare(r: CompareRun): number {
  const now = r.now ?? Date.now;
  let release: () => void;
  try {
    release = r.lock();
  } catch (e) {
    if (e instanceof LockHeldError) {
      console.error(e.message);
      return 2;
    }
    throw e;
  }
  try {
    const started = now();
    const { code, results } = executePlan(r.plan, r.env, r.ex);
    const step = results.find((s) => s.id === "release");
    const ensure = results.find((s) => s.id === "ensure");
    if (ensure && ensure.code !== 0) {
      r.say(`\ncould not judge: pulling and verifying the images failed (exit ${ensure.code}), so nothing was compared. ${r.b} and ${r.a} must both exist on the registry and be signed; nothing is built.`);
      return 2;
    }
    if (!step?.runDir || !existsSync(join(step.runDir, "report.json"))) {
      r.say(`\ncould not judge: the release run produced no report (exit ${step?.code ?? "not run"}). Its output is above.`);
      return 2;
    }
    const read = readCompareReport(step.runDir);
    if ("problem" in read) {
      r.say(`\nharness error: ${read.problem}`);
      return 1;
    }
    const report = read.report;
    const elapsedSeconds = (now() - started) / 1000;
    // --strict: the verdict decides, as it does for `local gate` (the run's own exit code, which an override can turn to 0). Otherwise a report is all it takes.
    const exitCode = r.strict ? code : 0;
    const summary: CompareSummary = {
      a: r.a,
      b: r.b,
      resolved: r.resolved,
      verdict: report.verdict,
      reasons: report.reasons,
      ...countHunks(report),
      runDir: step.runDir,
      reportMd: join(step.runDir, "report.md"),
      reportHtml: join(step.runDir, "report.html"),
      elapsedSeconds,
      exitCode
    };
    if (r.json) r.emit(JSON.stringify(summary, null, 2));
    else r.say(renderSummary(summary, { strict: r.strict }));
    return exitCode;
  } finally {
    release();
  }
}

/** `--dry-run`: what was resolved and the plan, and nothing pulled or run. */
export function renderDryRun(o: { announce: string; a: string; b: string; plan: Plan; env: Record<string, string>; platform?: NodeJS.Platform }): string {
  return [o.announce, "", renderPlan(o.plan, o.env, o.platform), "", `dry run: nothing was pulled or run (${o.b} beside ${o.a})`].join("\n");
}
