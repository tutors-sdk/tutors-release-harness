/**
 * The data-branch jobs (weekly-mutants.yml record, release.yml release-records and scoreboard, main-preview.yml) ask
 * `git ls-remote --heads` whether their branch exists, then clone it or start it. A bare name is a tail match: with
 * refs/heads/feat/scoreboard on the remote, `ls-remote --exit-code --heads <remote> scoreboard` succeeded, the clone of
 * `scoreboard` failed with 128, and the scheduled mutants run never recorded a week. Every probe names the full ref.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "..");
const dir = resolve(ROOT, ".github/workflows");
const probes = readdirSync(dir)
  .filter((f) => f.endsWith(".yml"))
  .flatMap((f) => readFileSync(join(dir, f), "utf8").split("\n").filter((l) => l.includes("ls-remote")).map((line) => ({ f, line })));
const gitOk = spawnSync("git", ["--version"]).status === 0;

describe("data-branch probes name the full ref", () => {
  it("every ls-remote --heads in a workflow asks for refs/heads/<branch>", () => {
    expect(probes.length).toBeGreaterThanOrEqual(4);
    for (const { f, line } of probes) expect(`${f}: ${line}`).toMatch(/ls-remote --exit-code --heads "\$remote" refs\/heads\/[\w-]+ /);
  });

  it.runIf(gitOk)("a branch that only ends in the name is not the branch", () => {
    const remote = mkdtempSync(join(tmpdir(), "probe-"));
    const git = (...a: string[]) => spawnSync("git", ["-C", remote, ...a], { encoding: "utf8" });
    git("init", "-q", "-b", "main");
    git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "--allow-empty", "-m", "x");
    git("branch", "feat/scoreboard");
    expect(spawnSync("git", ["ls-remote", "--exit-code", "--heads", remote, "scoreboard"]).status).toBe(0);
    expect(spawnSync("git", ["ls-remote", "--exit-code", "--heads", remote, "refs/heads/scoreboard"]).status).toBe(2);
    git("branch", "scoreboard");
    expect(spawnSync("git", ["ls-remote", "--exit-code", "--heads", remote, "refs/heads/scoreboard"]).status).toBe(0);
  });
});
