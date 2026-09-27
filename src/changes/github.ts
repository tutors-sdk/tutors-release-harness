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
