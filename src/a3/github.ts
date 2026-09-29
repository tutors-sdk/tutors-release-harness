/**
 * What only GitHub knows, for the A3 Aggregator's value stream and its line-stop Pareto: how long each workflow of the
 * value stream takes and how it ended, which step a failed post-deploy run stopped at, the monorepo's image builds, the
 * commit dates between production and the newest forecast, and whether a rollback issue is open.
 *
 * Read once, when the pages are built (`harness a3 --fetch-github`), into a snapshot (github.json) kept beside a3.json,
 * so the page says what it was built from. Everything is optional: what GitHub did not answer is named in `errors`
 * and the part of the A3 that needed it says "not measured", never a guess. Behind {@link FetchLike} so the tests use
 * a fake; nothing here runs in a unit test.
 */
import type { FetchLike } from "../changes/github.ts";

export const HARNESS_REPO = "tutors-sdk/tutors-release-harness";
export const MONOREPO = "tutors-sdk/tutors-mono-repo";
/** The harness workflows of the value stream, by file. */
export const STREAM_WORKFLOWS = ["nightly-noise.yml", "main-preview.yml", "release.yml", "post-deploy.yml", "pages.yml"] as const;
/** The monorepo workflow that builds and signs the images the harness judges. */
export const IMAGE_BUILD = "image-build.yml";

export interface WorkflowRun {
  id: number;
  event: string;
  /** success, failure, cancelled, skipped, …; null while running. */
  conclusion: string | null;
  createdAt: string;
  startedAt: string;
  updatedAt: string;
  url: string;
  /** The commit the run ran on. */
  headSha: string;
}

export interface GithubSnapshot {
  schemaVersion: 1;
  fetchedAt: string;
  /** Harness workflows by file, newest first. */
  workflows: Partial<Record<string, WorkflowRun[]>>;
  /** Post-deploy runs that failed: the first failed step's name, or null when the run had no job (it could not start). */
  postDeploySteps?: { id: number; step: string | null }[];
  /** The monorepo's image builds, newest first. */
  imageBuild?: WorkflowRun[];
  /** The monorepo's commits from production's tag to the forecast's commit (GET compare). */
  commits?: { base: string; head: string; baseDate: string; headDate: string | null; commits: { sha: string; date: string }[]; total: number };
  /** Open issues labelled rollback in this repository. */
  rollbackIssues?: { number: number; title: string; createdAt: string; url: string; comments: number }[];
  /** What GitHub did not answer, one line each. */
  errors: string[];
}

type Json = Record<string, unknown>;

const runOf = (r: Json): WorkflowRun => ({
  id: Number(r.id),
  event: String(r.event ?? ""),
  conclusion: (r.conclusion as string | null) ?? null,
  createdAt: String(r.created_at ?? ""),
  startedAt: String(r.run_started_at ?? r.created_at ?? ""),
  updatedAt: String(r.updated_at ?? ""),
  url: String(r.html_url ?? ""),
  headSha: String(r.head_sha ?? "")
});

/** The run's length as GitHub reports it (start to last update), in milliseconds; undefined for a run still going. */
export const runMs = (r: WorkflowRun): number | undefined => {
  if (r.conclusion === null) return undefined;
  const ms = Date.parse(r.updatedAt) - Date.parse(r.startedAt);
  return Number.isFinite(ms) && ms >= 0 ? ms : undefined;
};

/**
 * Read the snapshot. `production` is the tag production serves (16.2.2 or v16.2.2) and `head` the forecast's commit; both
 * optional. Never throws for what GitHub answers: every failure is a line in `errors`.
 */
export async function fetchGithub(o: { fetch: FetchLike; token?: string; now: Date; production?: string; head?: string; api?: string; maxPostDeploy?: number }): Promise<GithubSnapshot> {
  const api = o.api ?? "https://api.github.com";
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "tutors-release-harness" };
  if (o.token) headers.authorization = `Bearer ${o.token}`;
  const errors: string[] = [];
  const get = async (path: string): Promise<Json | undefined> => {
    try {
      const r = await o.fetch(`${api}/${path}`, { headers });
      if (!r.ok) {
        errors.push(`GitHub answered ${r.status} for ${path.split("?")[0]}`);
        return undefined;
      }
      return (await r.json()) as Json;
    } catch (e) {
      errors.push(`${path.split("?")[0]}: ${e instanceof Error ? e.message : String(e)}`);
      return undefined;
    }
  };
  const runs = async (repo: string, file: string) => {
    const j = await get(`repos/${repo}/actions/workflows/${file}/runs?per_page=100`);
    return Array.isArray(j?.workflow_runs) ? (j.workflow_runs as Json[]).map(runOf) : undefined;
  };

  const snap: GithubSnapshot = { schemaVersion: 1, fetchedAt: o.now.toISOString(), workflows: {}, errors };
  for (const file of STREAM_WORKFLOWS) {
    const r = await runs(HARNESS_REPO, file);
    if (r) snap.workflows[file] = r;
  }

  const failed = (snap.workflows["post-deploy.yml"] ?? []).filter((r) => r.conclusion === "failure").slice(0, o.maxPostDeploy ?? 100);
  if (failed.length) {
    snap.postDeploySteps = [];
    for (const r of failed) {
      const j = await get(`repos/${HARNESS_REPO}/actions/runs/${r.id}/jobs`);
      if (!j) continue;
      const jobs = Array.isArray(j.jobs) ? (j.jobs as Json[]) : [];
      const steps = jobs.flatMap((job) => (Array.isArray(job.steps) ? (job.steps as Json[]) : []));
      const step = steps.find((s) => s.conclusion === "failure");
      snap.postDeploySteps.push({ id: r.id, step: jobs.length ? String(step?.name ?? "the job failed outside a step") : null });
    }
  }

  const images = await runs(MONOREPO, IMAGE_BUILD);
  if (images) snap.imageBuild = images;

  if (o.production && o.head) {
    const tags = o.production.startsWith("v") ? [o.production, o.production.slice(1)] : [`v${o.production}`, o.production];
    for (const tag of tags) {
      const before = errors.length;
      const j = await get(`repos/${MONOREPO}/compare/${encodeURIComponent(tag)}...${encodeURIComponent(o.head)}?per_page=250`);
      if (!j) continue;
      errors.splice(before);
      const commits = Array.isArray(j.commits) ? (j.commits as Json[]) : [];
      const dateOf = (c: Json | undefined) => ((c?.commit as Json | undefined)?.committer as Json | undefined)?.date as string | undefined;
      const head = commits.find((c) => String(c.sha).startsWith(o.head!)) ?? commits.at(-1);
      snap.commits = {
        base: tag,
        head: o.head,
        baseDate: dateOf(j.base_commit as Json) ?? "",
        headDate: dateOf(head) ?? null,
        commits: commits.map((x) => ({ sha: String(x.sha ?? ""), date: dateOf(x) ?? "" })).filter((x) => x.sha && x.date),
        total: Number(j.total_commits ?? commits.length)
      };
      break;
    }
  }

  const issues = await get(`repos/${HARNESS_REPO}/issues?labels=rollback&state=open&per_page=20`);
  if (Array.isArray(issues))
    snap.rollbackIssues = (issues as Json[]).map((i) => ({ number: Number(i.number), title: String(i.title ?? ""), createdAt: String(i.created_at ?? ""), url: String(i.html_url ?? ""), comments: Number(i.comments ?? 0) }));
  return snap;
}
