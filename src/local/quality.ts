import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The monorepo's quality record for the candidate (since 1.56.0; harness hardening plan, E1): what `harness release`
 * passes the score as --test-signal when none is given, as release.yml's scoreboard job and main-preview.yml do. The
 * monorepo's Nightly pushes quality/<sha>.json to its `quality` branch; this reads that branch from the checkout
 * (fetching it once, best effort) for the candidate's commit or the newest of the 60 first-parent commits before it,
 * since the Nightly can be later than the rc. Nothing found is a reason, and Test signal stays not measured.
 */
export const QUALITY_FILE = "quality.json";
const LOOKBACK = 60;

export type QualityGit = (args: string[]) => string | undefined;

export function realQualityGit(monorepo: string): QualityGit {
  return (args) => {
    const r = spawnSync("git", ["-C", monorepo, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 60_000 });
    return r.status === 0 ? r.stdout : undefined;
  };
}

export function qualityRecord(git: QualityGit, candidate: string, dir: string): { file: string; note: string } | { reason: string } {
  const commitOf = (ref: string) => git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`])?.trim() || undefined;
  const sha = commitOf(`refs/tags/v${candidate}`) ?? commitOf(`refs/tags/${candidate}`);
  if (!sha) return { reason: `the monorepo checkout has no tag v${candidate}` };
  const branch = () => ["refs/remotes/origin/quality", "refs/heads/quality"].find((r) => commitOf(r));
  if (!branch()) git(["fetch", "--quiet", "origin", "quality:refs/remotes/origin/quality"]);
  const ref = branch();
  if (!ref) return { reason: "the monorepo has no quality branch (or it could not be fetched)" };
  const kept = new Set((git(["ls-tree", "--name-only", ref, "quality/"]) ?? "").split("\n").map((l) => l.trim().replace(/^quality\//, "")).filter(Boolean));
  const commits = (git(["rev-list", "--first-parent", `--max-count=${LOOKBACK}`, sha]) ?? sha).split("\n").map((l) => l.trim()).filter(Boolean);
  const commit = commits.find((c) => kept.has(`${c}.json`));
  if (!commit) return { reason: `no quality record for ${sha.slice(0, 12)} or the ${LOOKBACK} commits before it` };
  const body = git(["show", `${ref}:quality/${commit}.json`]);
  if (body === undefined) return { reason: `quality/${commit}.json could not be read from ${ref}` };
  const file = join(dir, QUALITY_FILE);
  writeFileSync(file, body);
  return { file, note: `quality record for ${commit.slice(0, 12)}${commit === sha ? ", the candidate's commit" : `, the newest before v${candidate}`}` };
}
