/**
 * How big each past release of the monorepo was, in merged pull requests, and how big the batch on main is now: the data
 * the readiness page's control chart reads (since 1.19.0).
 *
 * A release is a plain `vX.Y.Z` tag of the monorepo. Its size is the pull requests merged on the first-parent line from
 * the tag before it, counted as `harness changes` counts them (src/changes/facts.ts, `pullRequestOf`): a merge or squash
 * of a PR, never a release/* branch coming back to main (the version bump) and never a commit pushed straight to main. Two
 * tags more than one major apart are not consecutive releases (v1.0.0 to v16.1.4 is the project's history, not a batch),
 * so the older one only starts the series.
 *
 * Read once per build of the pages (`harness readiness --fetch-releases`, GET tags and compare, nothing else) into a
 * snapshot, releases.json, kept in the site beside readiness.json, so the page says what it was built from and is never
 * drawn from the API per view. What GitHub did not answer is a line in `errors`; a release it could not count is left
 * out, never guessed. Behind {@link FetchLike} so the tests use a fake; nothing here runs in a unit test against GitHub.
 */
import { pullRequestOf } from "../changes/facts.ts";
import type { FetchLike } from "../changes/github.ts";
import { MONOREPO } from "../a3/github.ts";

export const RELEASES_FILE = "releases.json";
/** The most recent releases measured: enough for stable limits, few enough API calls for every build of the pages. */
export const MAX_RELEASES = 30;
/** Compare pages read per range (100 commits each): a range bigger than this is said, never undercounted. */
const MAX_PAGES = 10;
const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;

export interface ReleaseSize {
  /** The release's tag, as the monorepo has it (v16.2.2). */
  tag: string;
  /** The tag before it: the size counts from here. */
  previous: string;
  /** The tag's commit and its committer date: when the release was cut. */
  sha: string;
  releasedAt: string;
  /** Pull requests merged on the first-parent line from `previous` to `tag`. */
  prs: number;
}

export interface ReleaseHistory {
  schemaVersion: 1;
  fetchedAt: string;
  repo: string;
  /** Oldest first. */
  releases: ReleaseSize[];
  /** The batch on main since the newest release: not yet released. */
  unreleased?: { base: string; head: string; headDate: string; prs: number };
  /** What GitHub did not answer, or what could not be counted, one line each. */
  errors: string[];
}

export interface CompareCommit {
  sha: string;
  parents: string[];
  message: string;
  date: string;
}

type Json = Record<string, unknown>;

/** The plain vX.Y.Z tags, oldest first by version. */
export function releaseTags(tags: { name: string; sha: string }[]): { name: string; sha: string; v: [number, number, number] }[] {
  return tags
    .flatMap((t) => {
      const m = SEMVER.exec(t.name);
      return m ? [{ ...t, v: [Number(m[1]), Number(m[2]), Number(m[3])] as [number, number, number] }] : [];
    })
    .sort((a, b) => a.v[0] - b.v[0] || a.v[1] - b.v[1] || a.v[2] - b.v[2]);
}

/** Consecutive releases: each tag with the one before it, when they are at most one major apart. */
export function releasePairs<T extends { v: [number, number, number] }>(tags: T[]): { previous: T; tag: T }[] {
  return tags.slice(1).flatMap((tag, i) => (tag.v[0] - tags[i]!.v[0] <= 1 ? [{ previous: tags[i]!, tag }] : []));
}

/** The tip of a compare range: the commit no other commit in it names as a parent (or the newest listed). */
export function tipOf(commits: CompareCommit[]): CompareCommit | undefined {
  const parents = new Set(commits.flatMap((c) => c.parents));
  return commits.filter((c) => !parents.has(c.sha)).at(-1) ?? commits.at(-1);
}

/** The PRs merged on the first-parent line from `head` back out of the range: distinct, release/* branches left out. */
export function firstParentPrs(commits: CompareCommit[], head: string): number[] {
  const by = new Map(commits.map((c) => [c.sha, c]));
  const prs = new Set<number>();
  for (let c = by.get(head); c; c = by.get(c.parents[0] ?? "")) {
    const [subject = "", ...rest] = c.message.split("\n");
    const { pr, release } = pullRequestOf(subject, rest.join("\n"));
    if (pr !== null && !release) prs.add(pr);
    by.delete(c.sha);
  }
  return [...prs].sort((a, b) => a - b);
}

const commitOf = (c: Json): CompareCommit => {
  const commit = (c.commit ?? {}) as Json;
  return {
    sha: String(c.sha ?? ""),
    parents: Array.isArray(c.parents) ? (c.parents as Json[]).map((p) => String(p.sha ?? "")) : [],
    message: String(commit.message ?? ""),
    date: String(((commit.committer ?? {}) as Json).date ?? "")
  };
};

/** Ask GitHub for the release history. Never throws for what GitHub answers: every failure is a line in `errors`. */
export async function fetchReleaseHistory(o: { fetch: FetchLike; token?: string; now: Date; api?: string; repo?: string; max?: number }): Promise<ReleaseHistory> {
  const api = o.api ?? "https://api.github.com";
  const repo = o.repo ?? MONOREPO;
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "tutors-release-harness" };
  if (o.token) headers.authorization = `Bearer ${o.token}`;
  const errors: string[] = [];
  const get = async (path: string): Promise<unknown> => {
    try {
      const r = await o.fetch(`${api}/${path}`, { headers });
      if (!r.ok) {
        errors.push(`GitHub answered ${r.status} for ${path.split("?")[0]}`);
        return undefined;
      }
      return await r.json();
    } catch (e) {
      errors.push(`${path.split("?")[0]}: ${e instanceof Error ? e.message : String(e)}`);
      return undefined;
    }
  };
  /** Every commit of base...head, or undefined when GitHub did not answer or the range is too big to read whole. */
  const compare = async (base: string, head: string): Promise<CompareCommit[] | undefined> => {
    const out: CompareCommit[] = [];
    let total = Infinity;
    for (let page = 1; page <= MAX_PAGES && out.length < total; page++) {
      const j = (await get(`repos/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}?per_page=100&page=${page}`)) as Json | undefined;
      if (!j) return undefined;
      total = Number(j.total_commits ?? 0);
      const commits = Array.isArray(j.commits) ? (j.commits as Json[]).map(commitOf) : [];
      if (!commits.length) break;
      out.push(...commits);
    }
    if (out.length < total) {
      errors.push(`${base}...${head}: ${total} commits, more than the ${MAX_PAGES * 100} read: not counted`);
      return undefined;
    }
    return out;
  };

  const history: ReleaseHistory = { schemaVersion: 1, fetchedAt: o.now.toISOString(), repo, releases: [], errors };
  const listed: { name: string; sha: string }[] = [];
  for (let page = 1; page <= 3; page++) {
    const j = await get(`repos/${repo}/tags?per_page=100&page=${page}`);
    if (!Array.isArray(j)) break;
    listed.push(...(j as Json[]).map((t) => ({ name: String(t.name ?? ""), sha: String(((t.commit ?? {}) as Json).sha ?? "") })));
    if (j.length < 100) break;
  }
  const tags = releaseTags(listed.filter((t) => t.name && /^[0-9a-f]{40}$/.test(t.sha)));
  const pairs = releasePairs(tags).slice(-(o.max ?? MAX_RELEASES));
  for (const { previous, tag } of pairs) {
    const commits = await compare(previous.name, tag.name);
    if (!commits) continue;
    const date = commits.find((c) => c.sha === tag.sha)?.date ?? tipOf(commits)?.date ?? "";
    history.releases.push({ tag: tag.name, previous: previous.name, sha: tag.sha, releasedAt: date, prs: firstParentPrs(commits, tag.sha).length });
  }
  const newest = tags.at(-1);
  if (newest) {
    const commits = await compare(newest.name, "main");
    const tip = commits && tipOf(commits);
    if (commits && tip) history.unreleased = { base: newest.name, head: tip.sha, headDate: tip.date, prs: firstParentPrs(commits, tip.sha).length };
    else if (commits) history.unreleased = { base: newest.name, head: newest.sha, headDate: o.now.toISOString(), prs: 0 };
  }
  return history;
}

const isObj = (x: unknown): x is Json => typeof x === "object" && x !== null && !Array.isArray(x);

/** A release history as releases.json has it, or undefined when it is not one. Entries that do not parse are left out. */
export function parseReleaseHistory(x: unknown): ReleaseHistory | undefined {
  if (!isObj(x) || x.schemaVersion !== 1 || !Array.isArray(x.releases)) return undefined;
  const releases = (x.releases as unknown[]).flatMap((r): ReleaseSize[] =>
    isObj(r) && typeof r.tag === "string" && typeof r.previous === "string" && typeof r.prs === "number" && Number.isInteger(r.prs) && r.prs >= 0
      ? [{ tag: r.tag, previous: r.previous, sha: String(r.sha ?? ""), releasedAt: String(r.releasedAt ?? ""), prs: r.prs }]
      : []
  );
  const u = x.unreleased;
  const unreleased = isObj(u) && typeof u.base === "string" && typeof u.prs === "number" && Number.isInteger(u.prs) && u.prs >= 0 ? { base: u.base, head: String(u.head ?? ""), headDate: String(u.headDate ?? ""), prs: u.prs } : undefined;
  return {
    schemaVersion: 1,
    fetchedAt: String(x.fetchedAt ?? ""),
    repo: String(x.repo ?? MONOREPO),
    releases,
    ...(unreleased ? { unreleased } : {}),
    errors: Array.isArray(x.errors) ? x.errors.map(String) : []
  };
}
