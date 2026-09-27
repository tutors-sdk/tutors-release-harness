/**
 * `harness changes --a <tag> --b <tag> --monorepo <dir>`: the change signals between two tags of the monorepo, from
 * the same two tags the diff engine compared, not from whatever branch is checked out. Writes changes.json (--out) and
 * prints the board (or the JSON with --json).
 *
 * Advisory, like the score it feeds: exit 0 when computed, whatever it found; 2 when it cannot read what it was
 * given (no checkout, a tag the monorepo does not have, an unreadable --changelog). Orphans are reported, never fatal.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseToolingChangelog, type ToolingChangelog } from "./changelog.ts";
import { ChangesInputError, collect, type Git } from "./facts.ts";
import { githubReviews, readReviews, tokenFrom, type FetchLike, type ReviewSource } from "./github.ts";
import { renderChangesBoard } from "./render.ts";
import { computeChanges, type Changes } from "./signals.ts";

export const CHANGES_DEFAULTS = { history: 6 } as const;

/** `git -C <dir> <args>`, its stdout; throws with git's own words when it fails. */
export function realGit(dir: string): Git {
  return (args) => {
    const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${(r.stderr || r.error?.message || "failed").trim()}`);
    return r.stdout;
  };
}

export interface ChangesOptions {
  a: string;
  b: string;
  monorepo: string;
  history: number;
  /** `pnpm release:changelog --json` output, when given. */
  changelog?: string;
  out?: string;
  harness?: { version: string; contractVersion: string };
}

export interface ChangesDeps {
  git?: Git;
  env?: NodeJS.ProcessEnv;
  /** The review source; absent, GitHub's REST API when a token and a GitHub remote are there. */
  reviews?: ReviewSource;
  fetch?: FetchLike;
}

function tooling(file: string): ToolingChangelog {
  if (!existsSync(file)) throw new ChangesInputError(`--changelog: ${file} does not exist`);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new ChangesInputError(`--changelog: ${file} is not JSON`);
  }
  const t = parseToolingChangelog(raw);
  if (typeof t === "string") throw new ChangesInputError(`--changelog: ${file}: ${t}`);
  return t;
}

/** Collect, ask GitHub for the reviews (or say why not), compute; write changes.json when --out is given. */
export async function runChanges(o: ChangesOptions, deps: ChangesDeps = {}): Promise<{ changes: Changes; file?: string }> {
  const dir = resolve(o.monorepo);
  if (!deps.git && !existsSync(join(dir, ".git"))) throw new ChangesInputError(`--monorepo: ${dir} is not a git checkout of the monorepo`);
  const git = deps.git ?? realGit(dir);
  const facts = collect(git, { a: o.a, b: o.b, history: o.history });
  const prs = facts.units.map((u) => u.pr).filter((n): n is number => n !== null);
  const env = deps.env ?? process.env;
  const token = tokenFrom(env);
  const source: ReviewSource | { reason: string } =
    deps.reviews ??
    (!token
      ? { reason: "no GITHUB_TOKEN or GH_TOKEN, so no PR's reviews could be read" }
      : !facts.repo
        ? { reason: "the monorepo checkout's origin is not a GitHub repository" }
        : githubReviews({ token, repo: facts.repo, fetch: deps.fetch ?? (globalThis.fetch as unknown as FetchLike) }));
  const reviews = await readReviews(source, prs);
  const changes = computeChanges(facts, { reviews, ...(o.changelog ? { tooling: tooling(resolve(o.changelog)) } : {}), ...(o.harness ? { harness: o.harness } : {}) });
  if (!o.out) return { changes };
  const file = resolve(o.out);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(changes, null, 2)}\n`);
  return { changes, file };
}

export { renderChangesBoard, ChangesInputError };
