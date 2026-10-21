/**
 * Review coverage: did each pull request merged between the tags have at least one approving review? Only GitHub
 * knows, so this is the one signal that needs the network and a token (GITHUB_TOKEN or GH_TOKEN). Without one, or
 * without a GitHub remote, review coverage is "not measured", with the reason; it is never assumed.
 *
 * Behind {@link ReviewSource} so the tests use a fake and nothing here runs in a unit test.
 */

export interface ReviewSource {
  /** True when the PR has at least one APPROVED review; throws when GitHub cannot say. */
  approved: (pr: number) => Promise<boolean>;
}

export type FetchLike = (url: string, init: { headers: Record<string, string> }) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/** The REST source: GET /repos/{repo}/pulls/{n}/reviews. */
export function githubReviews(o: { token: string; repo: string; fetch: FetchLike; api?: string }): ReviewSource {
  const api = o.api ?? "https://api.github.com";
  return {
    approved: async (pr) => {
      const r = await o.fetch(`${api}/repos/${o.repo}/pulls/${pr}/reviews?per_page=100`, {
        headers: { accept: "application/vnd.github+json", authorization: `Bearer ${o.token}`, "x-github-api-version": "2022-11-28", "user-agent": "tutors-release-harness" }
      });
      if (!r.ok) throw new Error(`GitHub answered ${r.status} for the reviews of PR #${pr}`);
      const reviews = (await r.json()) as { state?: string }[];
      return Array.isArray(reviews) && reviews.some((x) => x.state === "APPROVED");
    }
  };
}

/** Since 1.41.0: a PR's body, for its CHANGELOG line (src/changes/declares.ts). Throws when GitHub cannot say. */
export interface BodySource {
  body: (pr: number) => Promise<string>;
  /**
   * Since 1.49.2: the PR's title as GitHub has it now. The merge commit keeps the title the PR had when it merged, and
   * the hint on the title wins over the body's line, so a hint corrected after the merge (#518 and #519 on 20 Oct) was
   * never read. Optional: a source without it leaves the merge commit's title.
   */
  title?: (pr: number) => Promise<string>;
}

/** The REST source: GET /repos/{repo}/pulls/{n}, its `body` and its `title`, one request per PR. */
export function githubBodies(o: { token: string; repo: string; fetch: FetchLike; api?: string }): BodySource {
  const api = o.api ?? "https://api.github.com";
  const pulls = new Map<number, Promise<{ body?: unknown; title?: unknown }>>();
  const pull = (pr: number) => {
    if (!pulls.has(pr)) {
      pulls.set(
        pr,
        o
          .fetch(`${api}/repos/${o.repo}/pulls/${pr}`, {
            headers: { accept: "application/vnd.github+json", authorization: `Bearer ${o.token}`, "x-github-api-version": "2022-11-28", "user-agent": "tutors-release-harness" }
          })
          .then(async (r) => {
            if (!r.ok) throw new Error(`GitHub answered ${r.status} for PR #${pr}`);
            return (await r.json()) as { body?: unknown; title?: unknown };
          })
      );
    }
    return pulls.get(pr)!;
  };
  return {
    body: async (pr) => {
      const body = (await pull(pr)).body;
      return typeof body === "string" ? body : "";
    },
    title: async (pr) => {
      const title = (await pull(pr)).title;
      if (typeof title !== "string" || !title.trim()) throw new Error(`GitHub gave no title for PR #${pr}`);
      return title;
    }
  };
}

/** Since 1.49.2: every PR's title as GitHub has it now; one it could not give keeps its merge commit's title. */
export async function readTitles(source: BodySource | undefined, prs: number[]): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  if (!source?.title) return out;
  for (const pr of prs) {
    try {
      out.set(pr, await source.title(pr));
    } catch {
      // The merge commit's title still speaks for the PR.
    }
  }
  return out;
}

/** Every PR's body GitHub could give; one it could not is left out, and the PR is read from its title alone. */
export async function readBodies(source: BodySource | undefined, prs: number[]): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  if (!source) return out;
  for (const pr of prs) {
    try {
      out.set(pr, await source.body(pr));
    } catch {
      // A declaration is a lead: without the body the title still speaks for the PR.
    }
  }
  return out;
}

/** The token the harness may use: GITHUB_TOKEN, else GH_TOKEN. */
export const tokenFrom = (env: NodeJS.ProcessEnv): string | undefined => env.GITHUB_TOKEN?.trim() || env.GH_TOKEN?.trim() || undefined;

export type Reviews = { status: "measured"; approved: Map<number, boolean | null>; problems: string[] } | { status: "not measured"; reason: string };

/** Ask for every PR; a PR GitHub could not answer for is `null` (unknown) and named in `problems`, never counted as reviewed. */
export async function readReviews(source: ReviewSource | { reason: string }, prs: number[]): Promise<Reviews> {
  if ("reason" in source) return { status: "not measured", reason: source.reason };
  const approved = new Map<number, boolean | null>();
  const problems: string[] = [];
  for (const pr of prs) {
    try {
      approved.set(pr, await source.approved(pr));
    } catch (e) {
      approved.set(pr, null);
      problems.push(e instanceof Error ? e.message : String(e));
    }
  }
  return { status: "measured", approved, problems };
}
