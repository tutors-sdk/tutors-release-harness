/**
 * Main to RC: what would release mode say if main were cut as a release candidate today?
 *
 *   harness preview resolve [--a <production>] [--b <candidate>] [--force]
 *
 * `main-preview.yml` runs release mode with production on side a and the images of the monorepo's main on side b, with
 * main's own `release/claims.yaml`, and keeps the report and its scorecard on the `main-preview` branch. Nothing is
 * tagged, recorded or deployed: the verdict is a forecast for whoever cuts the next release branch, and the unclaimed
 * diffs are the claims that release will need.
 *
 * This file decides WHAT to judge, from the same sources the monorepo's release-dispatch.yml uses:
 *
 *   production  the reader overlay's `newTag` on the monorepo's main (deploy/k8s/overlays/reader/kustomization.yaml)
 *   candidate   `sha-<short>` of the newest commit on main whose image-build.yml push run succeeded. A run that
 *               succeeded has pushed, signed and attested all four images, so the tag is never caught mid-build (the
 *               `:main` tag is pushed before it is signed, and a run that picks it up in that window cannot verify it)
 *
 * and skips a pair it has already judged with this harness version, so a quiet day costs one API call, not a run.
 * Writes production, candidate, sha, claims_url, skip and reason to $GITHUB_OUTPUT. Exit 2 when it cannot decide.
 */
import { appendFileSync } from "node:fs";
import { parseIndex, type ReportIndex } from "./report-archive.ts";
import { harnessInfo } from "../version.ts";

export const MONOREPO = "tutors-sdk/tutors-mono-repo";
export const PREVIEW_BRANCH = "main-preview";
export const READER_OVERLAY = "deploy/k8s/overlays/reader/kustomization.yaml";
export const IMAGE_WORKFLOW = "image-build.yml";

const TAG = /^[0-9A-Za-z][0-9A-Za-z._-]{0,127}$/;
const VERSION = /^[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.-]+)?$/;

/** The first `newTag:` in a kustomization, as release-dispatch.yml's sed reads it; undefined unless it is a version. */
export function overlayTag(kustomization: string): string | undefined {
  for (const line of kustomization.split("\n")) {
    const m = /^\s*newTag:\s*"?([^"\s]*)"?\s*$/.exec(line);
    if (m) return VERSION.test(m[1]!) ? m[1]! : undefined;
  }
  return undefined;
}

export interface WorkflowRun {
  head_sha: string;
  head_branch: string | null;
  event: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  updated_at: string;
}

export interface BuiltMain {
  sha: string;
  /** What image-build.yml tagged it: docker/metadata-action's `type=sha,prefix=sha-,format=short`, seven characters. */
  tag: string;
  runUrl: string;
  builtAt: string;
}

/** The newest push to main whose images were built, signed and attested; runs are newest first, as the API lists them. */
export function newestBuiltMain(runs: WorkflowRun[]): BuiltMain | undefined {
  const run = runs.find((r) => r.head_branch === "main" && r.event === "push" && r.status === "completed" && r.conclusion === "success" && /^[0-9a-f]{40}$/.test(r.head_sha));
  return run && { sha: run.head_sha, tag: `sha-${run.head_sha.slice(0, 7)}`, runUrl: run.html_url, builtAt: run.updated_at };
}

/** The kept run that already judged this pair with this harness, if any: the same question has the same answer. */
export function judgedBefore(index: ReportIndex, o: { production: string; candidate: string; harnessVersion: string }) {
  const tagOf = (ref: string | undefined) => ref?.slice(ref.lastIndexOf(":") + 1);
  return index.runs.find((r) => r.mode === "release" && r.harnessVersion === o.harnessVersion && tagOf(r.sides.a.reader) === o.production && tagOf(r.sides.b.reader) === o.candidate);
}

export interface Decision {
  production: string;
  candidate: string;
  sha: string;
  claimsUrl: string;
  skip: boolean;
  reason: string;
}

export interface Sources {
  /** The reader overlay on the monorepo's main. */
  overlay(): Promise<string>;
  /** image-build.yml's runs on main, newest first. */
  imageRuns(): Promise<WorkflowRun[]>;
  /** `reports/index.json` on the main-preview branch; undefined before the first run. */
  index(): Promise<string | undefined>;
}

export async function decide(src: Sources, o: { production?: string | undefined; candidate?: string | undefined; force?: boolean; harnessVersion?: string } = {}): Promise<Decision> {
  const production = o.production || overlayTag(await src.overlay());
  if (!production) throw new Error(`could not read a version from newTag in ${READER_OVERLAY} on ${MONOREPO}@main`);
  let candidate = o.candidate;
  let sha = "";
  let built = "";
  if (!candidate) {
    const main = newestBuiltMain(await src.imageRuns());
    if (!main) throw new Error(`no successful push run of ${IMAGE_WORKFLOW} on ${MONOREPO}@main: main has no signed images to judge`);
    ({ tag: candidate, sha } = main);
    built = ` (built ${main.builtAt}, ${main.runUrl})`;
  }
  for (const [side, tag] of [["production", production], ["candidate", candidate]] as const) if (!TAG.test(tag)) throw new Error(`${side} "${tag}" is not a registry tag`);
  // Main's claims are the next release's claims so far. A candidate given by hand names no commit: its claims are main's.
  const claimsUrl = `https://raw.githubusercontent.com/${MONOREPO}/${sha || "main"}/release/claims.yaml`;
  const harnessVersion = o.harnessVersion ?? harnessInfo().version;
  const seen = o.force ? undefined : judgedBefore(parseIndex(await src.index()), { production, candidate, harnessVersion });
  if (seen) return { production, candidate, sha, claimsUrl, skip: true, reason: `${candidate} against ${production} was already judged by harness ${harnessVersion}: ${seen.verdict.toUpperCase()} at ${seen.ranAt}${seen.runUrl ? ` (${seen.runUrl})` : ""}. Nothing new on main since.` };
  return { production, candidate, sha, claimsUrl, skip: false, reason: `judging main ${candidate}${built} against production ${production}` };
}

/** The real sources: GitHub's REST API with the workflow's token (the monorepo is public; the token only lifts the rate limit). */
export function githubSources(env: NodeJS.ProcessEnv = process.env): Sources {
  const repo = env.GITHUB_REPOSITORY ?? "tutors-sdk/tutors-release-harness";
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", ...(env.GH_TOKEN ? { authorization: `Bearer ${env.GH_TOKEN}` } : {}) };
  const get = async (path: string, raw = false, missingOk = false) => {
    const res = await fetch(`https://api.github.com/${path}`, { headers: raw ? { ...headers, accept: "application/vnd.github.raw" } : headers });
    if (missingOk && res.status === 404) return undefined;
    if (!res.ok) throw new Error(`GET ${path}: HTTP ${res.status}`);
    return res.text();
  };
  return {
    overlay: async () => (await get(`repos/${MONOREPO}/contents/${READER_OVERLAY}?ref=main`, true))!,
    imageRuns: async () => (JSON.parse((await get(`repos/${MONOREPO}/actions/workflows/${IMAGE_WORKFLOW}/runs?branch=main&event=push&status=success&per_page=20`))!) as { workflow_runs: WorkflowRun[] }).workflow_runs,
    index: () => get(`repos/${repo}/contents/reports/index.json?ref=${PREVIEW_BRANCH}`, true, true)
  };
}

/** `harness preview resolve`: decide, print why, and hand the decision to the workflow. Exit 2 when it cannot decide. */
export async function previewResolve(v: { a?: unknown; b?: unknown; force?: unknown }, sources: Sources = githubSources(), env: NodeJS.ProcessEnv = process.env): Promise<number> {
  const text = (x: unknown) => (typeof x === "string" && x ? x : undefined);
  let d: Decision;
  try {
    d = await decide(sources, { production: text(v.a), candidate: text(v.b), force: v.force === true });
  } catch (e) {
    console.error(`::error title=Main to RC::${(e as Error).message}`);
    return 2;
  }
  console.log(d.reason);
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `production=${d.production}\ncandidate=${d.candidate}\nsha=${d.sha}\nclaims_url=${d.claimsUrl}\nskip=${d.skip}\n`);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `### Main to RC\n\n${d.reason}\n`);
  return 0;
}
