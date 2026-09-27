/**
 * The changelog side of the orphan check: what the release says it changed, against what the diff says it did.
 *
 * Two sources, the first that is usable wins for each half:
 *   - the monorepo's changelog tooling (`pnpm release:changelog --json`, given with `--changelog`): one entry per
 *     pull request with `curated`, whether CHANGELOG.md names it. It is derived from the diff, so it answers "a diff
 *     with no changelog entry" and cannot answer the other half;
 *   - CHANGELOG.md at the newer tag, its `### v<version>` subsection under each product section: the entries, with the
 *     PRs they name. It answers both halves.
 * Neither usable, and the orphan check is "not measured", with the reason; it is never passed by default.
 *
 * The sections and the paths each covers are the monorepo's own (scripts/release-changelog.ts, SECTION_BY_PATH).
 */

export const PRODUCT_SECTIONS = ["Reader", "Live", "Catalogue", "Time", "Shared Packages", "Infrastructure"] as const;
export type ProductSection = (typeof PRODUCT_SECTIONS)[number];

/** First match wins. A path no pattern matches is Development (tests, scripts, guides, CI): it needs no entry. */
const SECTION_BY_PATH: readonly [RegExp, ProductSection][] = [
  [/^apps\/reader\//, "Reader"],
  [/^apps\/live\//, "Live"],
  [/^apps\/catalogue\//, "Catalogue"],
  [/^apps\/time\//, "Time"],
  // The Svelte packages ship inside the apps, and almost all of them inside the reader.
  [/^packages\/svelte\//, "Reader"],
  [/^packages\/jsr\//, "Shared Packages"],
  [/^(deploy|observability|supabase|etc)\/|^Dockerfile$|^compose\.yaml$|^\.github\/workflows\/(image-build|deploy|release-dispatch|release-harness-report)\.yml$/, "Infrastructure"]
];

export function sectionOf(path: string): ProductSection | undefined {
  return SECTION_BY_PATH.find(([re]) => re.test(path))?.[1];
}

export interface ChangelogEntry {
  section: ProductSection;
  text: string;
  /** The PRs it names, as `PR #N` or `(#N)`. */
  prs: number[];
}

const PR_REF = /(?:PR #|\(#)(\d+)\b/g;

/**
 * The entries CHANGELOG.md files under `### v<version>` in each product section. `found` is false when no section has
 * that subsection: the changelog of this release is not written, and nothing can be said about orphans from it.
 */
export function parseChangelog(text: string, version: string): { found: boolean; entries: ChangelogEntry[]; named: Set<number> } {
  const entries: ChangelogEntry[] = [];
  let section: ProductSection | undefined;
  let inVersion = false;
  let found = false;
  const heading = new RegExp(`^###\\s+v?${version.replaceAll(".", "\\.")}(\\s|$)`);
  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) {
      const name = line.slice(3).split(" (")[0]!.trim();
      section = (PRODUCT_SECTIONS as readonly string[]).includes(name) ? (name as ProductSection) : undefined;
      inVersion = false;
    } else if (line.startsWith("### ")) {
      inVersion = !!section && heading.test(line);
      found ||= inVersion;
    } else if (inVersion && section && line.startsWith("- ")) {
      entries.push({ section, text: line.slice(2).trim(), prs: [...line.matchAll(PR_REF)].map((m) => Number(m[1])) });
    }
  }
  return { found, entries, named: new Set(entries.flatMap((e) => e.prs)) };
}

/** `pnpm release:changelog --json`, as far as the orphan check reads it (its `version` 1). */
export interface ToolingChangelog {
  version: 1;
  from?: string;
  to?: string;
  entries: { pr: number | null; sha: string; title: string; sections: string[]; curated: boolean }[];
}

export function parseToolingChangelog(raw: unknown): ToolingChangelog | string {
  const o = raw as Partial<ToolingChangelog> | null;
  if (!o || typeof o !== "object" || o.version !== 1 || !Array.isArray(o.entries)) return 'expected the output of `pnpm release:changelog --json` ({ "version": 1, "entries": [...] })';
  const ok = o.entries.every((e) => e && (e.pr === null || Number.isInteger(e.pr)) && typeof e.sha === "string" && typeof e.title === "string" && Array.isArray(e.sections) && typeof e.curated === "boolean");
  return ok ? (o as ToolingChangelog) : '"entries" must be [{ "pr": n|null, "sha": string, "title": string, "sections": [string], "curated": boolean }]';
}
