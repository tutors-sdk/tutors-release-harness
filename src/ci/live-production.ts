/**
 * Which images is production running? Ask production, not the pin.
 *
 *   harness production resolve [--pinned <tag>] [--production reader=URL,...] [--tag <tag>]
 *
 * Until 1.61.0 the nightly A/A took production from the harness variable HARNESS_PRODUCTION_TAG and Main to RC from the
 * reader overlay's `newTag` on the monorepo's main. Both move only when a final vX.Y.Z tag's `pnpm deploy:pin` pull
 * request merges (release/SOP.md, step 10). tutors.dev is deployed by hand on Netlify, outside that pipeline: on
 * 3 November 2026 it was moved to b146cca (the 17.1.0 release-prep merge, tagged v17.1.0-rc.1, no final tag), and that
 * night's A/A and the monorepo's nightly still judged 17.0.0. Post-deploy had seen it ("production build: differs")
 * since 17:01 and said so for information only.
 *
 * So the production a nightly judges is now what production's reader says it serves:
 *
 *   1. ask the reader: `/version`'s `revision` (the commit; `unknown` on a Netlify build that does not pass COMMIT_REF),
 *      else `/_app/version.json`'s build name, which is sha256(commit) for a build given GIT_SHA or COMMIT_REF
 *   2. find that commit among the monorepo's release tags (a final X.Y.Z before its rcs, the newest rc first), then
 *      among main's recent commits (`sha-<short>`, the tag image-build.yml gives every push to main)
 *   3. use what was found; else the pin, with a warning that says why
 *
 * A disagreement with the pin is `drift`: a warning on the run and its summary, and the run judges what production
 * serves. A tag given by hand (`--tag`, a workflow input) is used as given: it is what the person meant.
 */
import { appendFileSync } from "node:fs";
import { askProduction, hashedBuildName, sameCommit, type ProductionAnswers } from "../modes/production-build.ts";
const MONOREPO = "tutors-sdk/tutors-mono-repo";

/** A monorepo tag and the commit it names. */
export interface TagCommit {
  name: string;
  sha: string;
}

/** What production's reader said: the two answers this needs. */
export type LiveAnswers = Pick<ProductionAnswers, "url" | "revision" | "buildName">;

export interface LiveProduction {
  /** The tag the run should judge as production. */
  tag: string;
  /** Where it came from: `live` (production said, and a tag was found), `pin` (the fallback), `input` (given by hand). */
  source: "live" | "pin" | "input";
  /** One sentence: how the tag was found. */
  how: string;
  /** The commit production serves, when it said one that was found. */
  commit?: string;
  /** Set when production serves something other than the pin: the warning. */
  drift?: string;
}

const RELEASE = /^v?(\d+)\.(\d+)\.(\d+)(?:-rc\.(\d+))?$/;
const HASHED = /^[0-9a-f]{16}$/;
const SHA = /^[0-9a-f]{40}$/i;

/** Release tags first (final before rc, newer before older), as a registry tag (no `v`). */
export function rankReleaseTags(tags: TagCommit[]): TagCommit[] {
  const parsed = tags.flatMap((t) => {
    const m = RELEASE.exec(t.name);
    if (!m || !SHA.test(t.sha)) return [];
    return [{ name: t.name.replace(/^v/, ""), sha: t.sha, key: [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? Infinity : Number(m[4])] as const }];
  });
  parsed.sort((x, y) => y.key[0] - x.key[0] || y.key[1] - x.key[1] || y.key[2] - x.key[2] || (y.key[3] === x.key[3] ? 0 : y.key[3] > x.key[3] ? 1 : -1));
  return parsed.map(({ name, sha }) => ({ name, sha }));
}

/** Does production's answer name this commit, by `/version` revision or by build-name hash? */
export function servesCommit(answers: LiveAnswers, commit: string): boolean {
  const revision = answers.revision?.trim();
  if (revision && revision.toLowerCase() !== "unknown" && sameCommit(revision, commit)) return true;
  const name = answers.buildName?.trim().toLowerCase();
  return name !== undefined && HASHED.test(name) && hashedBuildName(commit) === name;
}

/** What production's answer says, in a few words, for a warning. */
function said(answers: LiveAnswers | undefined): string {
  if (!answers) return "production's reader was not asked";
  const revision = answers.revision?.trim();
  if (revision && revision.toLowerCase() !== "unknown") return `/version names commit ${revision.slice(0, 12)}`;
  const name = answers.buildName?.trim().toLowerCase();
  if (name && HASHED.test(name)) return `its build name is ${name}`;
  if (answers.revision === undefined && answers.buildName === undefined) return `${answers.url} did not answer /version or /_app/version.json`;
  return `${answers.url} names no commit (no /version revision, and a build name that is not a commit hash)`;
}

const usablePin = (pin: string | undefined) => (pin && pin.trim() && pin.trim() !== "main" ? pin.trim() : undefined);

/**
 * Decide the production tag. Pure.
 *   given    a tag given by hand: used as is
 *   answers  production's reader; undefined when it could not be asked
 *   pinned   the pin (HARNESS_PRODUCTION_TAG, or the overlay's newTag)
 *   tags     the monorepo's tags with their commits
 *   main     main's recent commit shas, newest first
 */
export function resolveLiveProduction(o: { given?: string | undefined; answers?: LiveAnswers | undefined; pinned?: string | undefined; tags: TagCommit[]; main: string[] }): LiveProduction {
  if (o.given?.trim()) return { tag: o.given.trim(), source: "input", how: `${o.given.trim()}, given by hand` };
  const pin = usablePin(o.pinned);
  const answers = o.answers;
  let found: { tag: string; commit: string; what: string } | undefined;
  if (answers) {
    const release = rankReleaseTags(o.tags).find((t) => servesCommit(answers, t.sha));
    if (release) found = { tag: release.name, commit: release.sha, what: `release tag v${release.name}` };
    else {
      const commit = o.main.find((sha) => SHA.test(sha) && servesCommit(answers, sha));
      if (commit) found = { tag: `sha-${commit.slice(0, 7).toLowerCase()}`, commit, what: `main's commit ${commit.slice(0, 12)}, which no release tag names` };
    }
  }
  if (found) {
    const how = `production serves ${found.commit.slice(0, 12)} (${said(answers)}): ${found.what}`;
    const samePin = pin !== undefined && (pin === found.tag || pin.replace(/^v/, "") === found.tag);
    if (samePin) return { tag: found.tag, source: "live", how, commit: found.commit };
    const drift = pin
      ? `production serves ${found.tag} (commit ${found.commit.slice(0, 12)}), but the pin says ${pin}: this run judges ${found.tag}. The pin moves when a final vX.Y.Z tag's \`pnpm deploy:pin\` pull request merges (release/SOP.md, step 10); production was deployed outside it`
      : `production serves ${found.tag} (commit ${found.commit.slice(0, 12)}), and there is no pin: this run judges ${found.tag}`;
    return { tag: found.tag, source: "live", how, commit: found.commit, drift };
  }
  if (!pin) return { tag: "main", source: "pin", how: `no pin, and production could not be matched (${said(answers)}): judging main`, drift: `production could not be matched to an image (${said(answers)}), and there is no pin: this run judges main` };
  const how = `the pin ${pin}, because production could not be matched to a release tag or a commit on main (${said(answers)})`;
  // Production said a commit and it is none of ours: that is drift too, and louder than "did not answer".
  const answeredCommit = answers && (/^[0-9a-f]{7,40}$/i.test(answers.revision?.trim() ?? "") || HASHED.test(answers.buildName?.trim().toLowerCase() ?? ""));
  return answeredCommit
    ? { tag: pin, source: "pin", how, drift: `production serves a build no release tag or recent commit on main names (${said(answers)}): this run judges the pin ${pin}, which production may not be running` }
    : { tag: pin, source: "pin", how };
}

/** The reader URL from `reader=URL,catalogue=URL,...`, or a bare URL. */
export function readerUrlOf(production: string | undefined): string | undefined {
  if (!production?.trim()) return undefined;
  const parts = production.split(",").map((p) => p.trim());
  const reader = parts.find((p) => p.startsWith("reader="));
  if (reader) return reader.slice("reader=".length) || undefined;
  return /^https?:\/\//.test(parts[0]!) ? parts[0] : undefined;
}

export const DEFAULT_PRODUCTION_URLS = "reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev";

export interface LiveSources {
  ask(readerUrl: string): Promise<LiveAnswers>;
  tags(): Promise<TagCommit[]>;
  main(): Promise<string[]>;
}

/** The real sources: production's reader and GitHub's REST API (the monorepo is public; a token only lifts the rate limit). */
export function liveSources(env: NodeJS.ProcessEnv = process.env): LiveSources {
  const headers: Record<string, string> = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", ...(env.GH_TOKEN ? { authorization: `Bearer ${env.GH_TOKEN}` } : {}) };
  const get = async <T>(path: string): Promise<T> => {
    const res = await fetch(`https://api.github.com/${path}`, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`GET ${path}: HTTP ${res.status}`);
    return (await res.json()) as T;
  };
  return {
    ask: (url) => askProduction(url),
    tags: async () => (await get<{ name: string; commit: { sha: string } }[]>(`repos/${MONOREPO}/tags?per_page=100`)).map((t) => ({ name: t.name, sha: t.commit.sha })),
    main: async () => (await get<{ sha: string }[]>(`repos/${MONOREPO}/commits?sha=main&per_page=100`)).map((c) => c.sha)
  };
}

/** Resolve with the sources; a source that fails counts as not answered, never as an error. */
export async function liveProduction(o: { given?: string | undefined; pinned?: string | undefined; production?: string | undefined }, src: LiveSources = liveSources()): Promise<LiveProduction> {
  if (o.given?.trim()) return resolveLiveProduction({ given: o.given, tags: [], main: [] });
  const reader = readerUrlOf(o.production ?? DEFAULT_PRODUCTION_URLS);
  const [answers, tags, main] = await Promise.all([reader ? src.ask(reader).catch(() => undefined) : Promise.resolve(undefined), src.tags().catch(() => []), src.main().catch(() => [])]);
  return resolveLiveProduction({ given: o.given, answers, pinned: o.pinned, tags, main });
}

/** `harness production resolve`: print how, warn on drift, write tag/source/drift to $GITHUB_OUTPUT. Exit 0. */
export async function productionResolve(v: { tag?: unknown; pinned?: unknown; production?: unknown }, src: LiveSources = liveSources(), env: NodeJS.ProcessEnv = process.env): Promise<number> {
  const text = (x: unknown) => (typeof x === "string" && x.trim() ? x.trim() : undefined);
  const r = await liveProduction({ given: text(v.tag), pinned: text(v.pinned), production: text(v.production) ?? text(env.PRODUCTION_URLS) }, src);
  console.log(`production: ${r.tag} (${r.how})`);
  if (r.drift) console.log(`::warning title=Production is not the pin::${r.drift}`);
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `tag=${r.tag}\nsource=${r.source}\ncommit=${r.commit ?? ""}\ndrift=${r.drift ? "true" : "false"}\n`);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `### Production\n\n${r.tag}: ${r.how}.\n${r.drift ? `\n**Production is not the pin:** ${r.drift}.\n` : ""}`);
  return 0;
}
