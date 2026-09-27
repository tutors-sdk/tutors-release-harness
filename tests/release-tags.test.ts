import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT = resolve(import.meta.dirname, "../scripts/release-tags.sh");

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}

/** A main with versions 1.0.0, 1.0.0 again, 1.1.0 (via a merged branch that also passed through 1.0.9), then 1.1.0 again. */
function repo(): { dir: string; commits: { first: string; onBranch: string; merge: string } } {
  const dir = mkdtempSync(join(tmpdir(), "release-tags-"));
  git(dir, "init", "-q", "-b", "main");
  const commit = (version: string, message: string) => {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "x", version }, null, 2));
    git(dir, "add", "package.json");
    git(dir, "commit", "-q", "--allow-empty", "-m", message);
    return git(dir, "rev-parse", "HEAD");
  };
  const first = commit("1.0.0", "one");
  commit("1.0.0", "docs");
  git(dir, "checkout", "-q", "-b", "feature");
  commit("1.0.9", "on the branch only");
  const onBranch = commit("1.1.0", "bump");
  git(dir, "checkout", "-q", "main");
  git(dir, "merge", "-q", "--no-ff", "-m", "merge", "feature");
  const merge = git(dir, "rev-parse", "HEAD");
  commit("1.1.0", "more docs");
  commit("not-a-version", "odd");
  return { dir, commits: { first, onBranch, merge } };
}

function run(dir: string, ...args: string[]) {
  return spawnSync("bash", [SCRIPT, ...args], { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t", REMOTE: "", AUTH: "" } });
}

describe("scripts/release-tags.sh", () => {
  it("tags each version on the first main commit that carries it, and skips what never reached main or is not semver", () => {
    const { dir, commits } = repo();
    const r = run(dir);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout.trim().split("\n")).toEqual([`v1.0.0 ${commits.first}`, `v1.1.0 ${commits.merge}`]);
    expect(git(dir, "rev-parse", "v1.1.0^{commit}")).toBe(commits.merge);
    expect(git(dir, "cat-file", "-t", "v1.1.0")).toBe("tag"); // annotated
    expect(git(dir, "tag", "-l")).not.toContain("v1.0.9");
  });

  it("never moves or re-makes a tag, and a dry run makes none", () => {
    const { dir, commits } = repo();
    git(dir, "tag", "v1.0.0", commits.onBranch); // a tag somewhere else already
    const dry = run(dir, "--dry-run");
    expect(dry.stdout.trim()).toBe(`v1.1.0 ${commits.merge}`);
    expect(git(dir, "tag", "-l")).toBe("v1.0.0");
    run(dir);
    expect(git(dir, "rev-parse", "v1.0.0^{commit}")).toBe(commits.onBranch);
    expect(run(dir).stdout.trim()).toBe("");
  });

  /** A bare remote whose pre-receive hook refuses the named tags, as GitHub refuses a workflow token's tag on a commit with other workflows. */
  function refusingRemote(...refused: string[]): string {
    const remote = mkdtempSync(join(tmpdir(), "release-tags-remote-"));
    git(remote, "init", "-q", "--bare");
    const hook = join(remote, "hooks", "pre-receive");
    writeFileSync(hook, `#!/bin/sh\nwhile read old new ref; do case "$ref" in ${refused.map((t) => `refs/tags/${t}`).join("|")}) echo "refusing $ref" >&2; exit 1;; esac; done\n`);
    chmodSync(hook, 0o755);
    return remote;
  }
  const push = (dir: string, remote: string) => spawnSync("bash", [SCRIPT], { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t", REMOTE: remote, AUTH: "", GITHUB_API_REPO: "", GH_TOKEN: "" } });

  it("an older version the remote refuses is named and skipped, and the rest are still tagged", () => {
    const { dir } = repo();
    const remote = refusingRemote("v1.0.0");
    const r = push(dir, remote);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toContain("not tagged: v1.0.0");
    expect(git(remote, "tag", "-l")).toBe("v1.1.0");
    expect(git(dir, "tag", "-l")).toBe("v1.1.0"); // the refused tag is not left behind locally, so a later run tries again
  });

  it("fails when the newest version cannot be tagged", () => {
    const { dir } = repo();
    const r = push(dir, refusingRemote("v1.1.0"));
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("the newest version, v1.1.0, could not be tagged");
  });

  it("pushes each new tag to REMOTE", () => {
    const { dir } = repo();
    const remote = mkdtempSync(join(tmpdir(), "release-tags-remote-"));
    git(remote, "init", "-q", "--bare");
    const r = spawnSync("bash", [SCRIPT], { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t", REMOTE: remote, AUTH: "" } });
    expect(r.status, r.stderr).toBe(0);
    expect(git(remote, "tag", "-l").split("\n") as string[]).toEqual(["v1.0.0", "v1.1.0"]);
  });
});
