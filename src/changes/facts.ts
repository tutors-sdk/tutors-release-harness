/**
 * What changed between two tags of the monorepo, as git says it: the raw material of `harness changes`.
 *
 * Everything here reads git through an injected {@link Git} (the real one runs `git -C <monorepo>`; the tests use a
 * temporary repository), and returns plain data. The rules that turn that data into points are in signals.ts, which
 * is pure. Nothing here guesses: a file git cannot show is absent, and the signal that needed it says "not measured".
 */
import { parseLock, lockDelta, type DepChange } from "./lock.ts";

/** `git <args>` in the monorepo checkout; throws when git fails. */
export type Git = (args: string[]) => string;

export class ChangesInputError extends Error {}

export interface FileChange {
  path: string;
  added: number;
  deleted: number;
}

export interface Person {
  name: string;
  email: string;
}

export interface Commit {
  sha: string;
  author: Person;
  files: string[];
}

/**
 * One first-parent commit between the tags: a merged pull request ("Merge pull request #N from …"), a squashed one
 * ("title (#N)"), or a commit that went to main directly (`pr: null`).
 */
export interface Unit {
  sha: string;
  pr: number | null;
  title: string;
  /** A release/* branch coming back to main (the version bump and the changelog): bookkeeping, not a change of behaviour. */
  release: boolean;
  /** The author of its oldest commit: a fact kept for trends, never shown as a reason. */
  author: Person;
  /** Its net diff against its first parent. */
  files: FileChange[];
  /** The commits that make it up, oldest first, merges left out. */
  commits: Commit[];
  /** Nothing by its author is reachable from the older tag. A fact, not a penalty on its own. */
  firstContribution: boolean;
  /** The direct dependencies its pnpm-lock.yaml change moved. */
  deps: DepChange[];
}

export interface Release {
  from: string;
  to: string;
  /** The net diff between the two tags. */
  files: FileChange[];
}

export interface ChangeFacts {
  a: string;
  b: string;
  /** The tags as they are named in the monorepo (`v16.2.2`). */
  refs: { a: string; b: string };
  /** The version the changelog files this release under (`16.3.0` for `v16.3.0-rc.1`). */
  version: string;
  units: Unit[];
  /** The net diff between the two tags. */
  net: FileChange[];
  /** The releases before this one, newest first, each as the net diff between two neighbouring release tags. */
  history: Release[];
  /** How many releases of history were asked for. */
  historyAsked: number;
  /** CHANGELOG.md at the newer tag; absent when there is none. */
  changelog?: string;
  /** The direct dependencies that moved between the two tags; absent when a side has no pnpm-lock.yaml. */
  deps?: DepChange[];
  /** `owner/repo` on GitHub, from the checkout's origin; absent when it is not a GitHub remote. */
  repo?: string;
}

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

/** A release tag's version as numbers; undefined for anything that is not `[v]X.Y.Z[-pre]`. */
export function versionOf(tag: string): { core: [number, number, number]; pre?: string } | undefined {
  const m = SEMVER.exec(tag.trim());
  if (!m) return undefined;
  return { core: [Number(m[1]), Number(m[2]), Number(m[3])], ...(m[4] ? { pre: m[4] } : {}) };
}

const cmpCore = (x: [number, number, number], y: [number, number, number]) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];

/** The plain release tags (`vX.Y.Z` or `X.Y.Z`, no pre-release: an rc is not a release), oldest first. */
export function releaseTags(tags: string[]): string[] {
  return tags
    .map((t) => ({ t, v: versionOf(t) }))
    .filter((x): x is { t: string; v: { core: [number, number, number] } } => !!x.v && x.v.pre === undefined)
    .sort((x, y) => cmpCore(x.v.core, y.v.core))
    .map((x) => x.t);
}

/**
 * The `n` releases that end at or before `a`, newest first: each is (the release tag before, the release tag). A tag
 * that is not a plain release (an rc) ends the history at the last release below it.
 */
export function historyRanges(tags: string[], a: string, n: number): { from: string; to: string }[] {
  const va = versionOf(a);
  if (!va) return [];
  const plain = releaseTags(tags).filter((t) => {
    const c = cmpCore(versionOf(t)!.core, va.core);
    return va.pre === undefined ? c <= 0 : c < 0;
  });
  const out: { from: string; to: string }[] = [];
  for (let i = plain.length - 1; i >= 1 && out.length < n; i--) out.push({ from: plain[i - 1]!, to: plain[i]! });
  return out;
}

/** A harness tag (`16.2.2`) as the monorepo names it (`v16.2.2`): the name given if git knows it, else with a `v`. */
export function resolveTag(git: Git, tag: string): string {
  for (const name of [tag, tag.startsWith("v") ? tag.slice(1) : `v${tag}`]) {
    try {
      git(["rev-parse", "--verify", "--quiet", `${name}^{commit}`]);
      return name;
    } catch {
      // try the other spelling
    }
  }
  throw new ChangesInputError(`the monorepo has no tag ${tag} (nor ${tag.startsWith("v") ? tag.slice(1) : `v${tag}`}); fetch its tags (git fetch --tags) or name one that exists`);
}

/** `git diff --numstat` output; a binary file counts 0 lines. */
export function parseNumstat(text: string): FileChange[] {
  const out: FileChange[] = [];
  for (const line of text.split("\n")) {
    const m = /^(-|\d+)\t(-|\d+)\t(.+)$/.exec(line);
    if (!m) continue;
    out.push({ path: m[3]!, added: m[1] === "-" ? 0 : Number(m[1]), deleted: m[2] === "-" ? 0 : Number(m[2]) });
  }
  return out;
}

const MERGE = /^Merge pull request #(\d+) from (\S+)/;
const SQUASH = /\(#(\d+)\)\s*$/;

/** The PR a first-parent commit carries, as the monorepo's own release:changelog reads it. */
export function pullRequestOf(subject: string, body: string): { pr: number | null; title: string; release: boolean } {
  const merge = MERGE.exec(subject);
  if (merge) {
    const title = body.split(/\r?\n/).find((l) => l.trim() !== "")?.trim() ?? merge[2]!;
    return { pr: Number(merge[1]), title, release: /(^|\/)release\//.test(merge[2]!) };
  }
  const squash = SQUASH.exec(subject);
  if (squash) return { pr: Number(squash[1]), title: subject.replace(SQUASH, "").trim(), release: false };
  return { pr: null, title: subject.trim(), release: false };
}

/** `owner/repo` from a GitHub remote URL (https or ssh); undefined for anything else. */
export function repoOf(url: string): string | undefined {
  const m = /github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(url.trim());
  return m ? `${m[1]}/${m[2]}` : undefined;
}

// Separators git writes (`%x1e`, `%x00`); an argument itself may not carry a NUL byte.
const SEP = "\x1e";
const NUL = "\x00";
const F_SEP = "%x1e";
const F_NUL = "%x00";

function show(git: Git, ref: string, path: string): string | undefined {
  try {
    return git(["show", `${ref}:${path}`]);
  } catch {
    return undefined;
  }
}

/** Commits of a range with their author and files, oldest first, merges left out. */
function commitsIn(git: Git, range: string[]): Commit[] {
  const text = git(["log", "--no-merges", "--reverse", "--no-renames", "--name-only", `--format=${F_SEP}%H${F_NUL}%an${F_NUL}%ae`, ...range]);
  return text
    .split(SEP)
    .filter((c) => c.trim())
    .map((c) => {
      const [head, ...files] = c.split("\n");
      const [sha, name, email] = head!.split(NUL);
      return { sha: sha!, author: { name: name!, email: email! }, files: files.map((f) => f.trim()).filter(Boolean) };
    });
}

/** Everyone with a commit reachable from `ref`, by lowercased name and by lowercased email. */
function knownAuthors(git: Git, ref: string): Set<string> {
  const known = new Set<string>();
  for (const line of git(["log", `--format=%an${F_NUL}%ae`, ref]).split("\n")) {
    const [name, email] = line.split(NUL);
    if (name?.trim()) known.add(`n:${name.trim().toLowerCase()}`);
    if (email?.trim()) known.add(`e:${email.trim().toLowerCase()}`);
  }
  return known;
}

const isKnown = (known: Set<string>, p: Person) => known.has(`n:${p.name.trim().toLowerCase()}`) || known.has(`e:${p.email.trim().toLowerCase()}`);

export const LOCKFILE = "pnpm-lock.yaml";

function depsBetween(git: Git, from: string, to: string): DepChange[] | undefined {
  const before = show(git, from, LOCKFILE);
  const after = show(git, to, LOCKFILE);
  if (before === undefined || after === undefined) return undefined;
  return lockDelta(parseLock(before), parseLock(after));
}

/** Read what changed between `a` and `b` (harness or monorepo tag names), with `history` releases before `a`. */
export function collect(git: Git, o: { a: string; b: string; history: number }): ChangeFacts {
  const refs = { a: resolveTag(git, o.a), b: resolveTag(git, o.b) };
  const vb = versionOf(refs.b);
  const version = vb ? vb.core.join(".") : refs.b;
  const known = knownAuthors(git, refs.a);
  const units: Unit[] = [];
  for (const sha of git(["rev-list", "--first-parent", "--reverse", `${refs.a}..${refs.b}`]).split("\n").filter(Boolean)) {
    const [parents = "", name = "", email = "", subject = "", body = ""] = git(["log", "-1", `--format=%P${F_NUL}%an${F_NUL}%ae${F_NUL}%s${F_NUL}%b`, sha]).split(NUL);
    const merge = parents.trim().split(/\s+/).length > 1;
    const { pr, title, release } = pullRequestOf(subject, body);
    const files = parseNumstat(git(["diff", "--numstat", "--no-renames", `${sha}^1`, sha]));
    const commits = merge ? commitsIn(git, [`${sha}^1..${sha}`]) : [{ sha, author: { name, email }, files: files.map((f) => f.path) }];
    const author = commits[0]?.author ?? { name, email };
    const deps = files.some((f) => f.path === LOCKFILE) ? (depsBetween(git, `${sha}^1`, sha) ?? []) : [];
    units.push({ sha, pr, title, release, author, files, commits, firstContribution: !isKnown(known, author), deps });
  }
  const tags = git(["tag", "--list"]).split("\n").filter(Boolean);
  const history = historyRanges(tags, refs.a, o.history).map((r) => ({ ...r, files: parseNumstat(git(["diff", "--numstat", "--no-renames", r.from, r.to])) }));
  const net = parseNumstat(git(["diff", "--numstat", "--no-renames", refs.a, refs.b]));
  const changelog = show(git, refs.b, "CHANGELOG.md");
  const deps = depsBetween(git, refs.a, refs.b);
  let repo: string | undefined;
  try {
    repo = repoOf(git(["remote", "get-url", "origin"]));
  } catch {
    repo = undefined;
  }
  return { a: o.a, b: o.b, refs, version, units, net, history, historyAsked: o.history, ...(changelog !== undefined ? { changelog } : {}), ...(deps ? { deps } : {}), ...(repo ? { repo } : {}) };
}
