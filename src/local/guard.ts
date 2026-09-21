import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { ROOT } from "../stack.ts";

/**
 * `harness guard masks|engine|all --base <ref>`: the two PR guards of CI as
 * commands against local refs.
 *
 *   masks   src/ci/mask-change.ts    a PR that adds or loosens a mask changes nothing else
 *   engine  src/ci/engine-change.ts  a change to an engine, mask, journey, the gate or a mutant needs a version bump
 *
 * This file only resolves and checks the ref, then runs the very script CI runs
 * (`ci.yml` and `weekly-mutants.yml` call this command), so the rule has one
 * implementation. The scripts compare `<base>...HEAD`: what the current branch
 * has committed since it left `<base>`; uncommitted work is not compared, and
 * this says so.
 *
 * Exit codes are the scripts': 0 ok, 1 a violation, 2 usage (no such ref).
 */
export const GUARDS = { masks: "src/ci/mask-change.ts", engine: "src/ci/engine-change.ts" } as const;
export type GuardKind = keyof typeof GUARDS;

export interface GitResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

export interface GuardDeps {
  git: (args: string[]) => GitResult;
  /** Run a guard script with `--base <ref>`; returns its exit code. */
  script: (path: string, base: string) => number;
  env: NodeJS.ProcessEnv;
  log: (message: string) => void;
}

export const realGit = (args: string[]): GitResult => {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};

export const realScript = (path: string, base: string): number => {
  const r = spawnSync(process.execPath, ["--import", "tsx", join(ROOT, path), "--base", base], { cwd: ROOT, stdio: "inherit", env: process.env });
  return r.status ?? 2;
};

const isCommit = (git: GuardDeps["git"], ref: string) => git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]).status === 0;

/** The base to compare with: --base, else HARNESS_BASE_REF, else origin/main, else main. */
export function resolveBase(explicit: string | undefined, deps: Pick<GuardDeps, "git" | "env">): { ok: true; ref: string } | { ok: false; message: string } {
  const wanted = explicit ?? deps.env.HARNESS_BASE_REF;
  const candidates = wanted ? [wanted] : ["origin/main", "main"];
  const ref = candidates.find((c) => isCommit(deps.git, c));
  if (!ref) {
    return {
      ok: false,
      message: wanted
        ? `base ref "${wanted}" is not a commit in this repository. Fetch it (git fetch origin) or name another with --base.`
        : "no --base given and neither origin/main nor main exists here. Name the branch this one will merge into with --base <ref>."
    };
  }
  if (deps.git(["merge-base", ref, "HEAD"]).status !== 0) {
    const shallow = deps.git(["rev-parse", "--is-shallow-repository"]).stdout.trim() === "true";
    return { ok: false, message: `no common ancestor between ${ref} and HEAD${shallow ? ": this is a shallow clone, run `git fetch --unshallow`" : ""}.` };
  }
  return { ok: true, ref };
}

/** Run one guard, or both. The worst exit code wins. */
export function runGuard(kind: GuardKind | "all", explicitBase: string | undefined, deps: GuardDeps): number {
  const base = resolveBase(explicitBase, deps);
  if (!base.ok) {
    deps.log(base.message);
    return 2;
  }
  const dirty = deps.git(["status", "--porcelain"]).stdout.split(/\r?\n/).filter(Boolean).length;
  if (dirty) deps.log(`note: ${dirty} uncommitted change(s) are not compared; the guards look at ${base.ref}...HEAD, as CI does. Commit first to see them.`);
  const kinds: GuardKind[] = kind === "all" ? ["masks", "engine"] : [kind];
  let worst = 0;
  for (const k of kinds) {
    deps.log(`guard ${k} against ${base.ref}`);
    worst = Math.max(worst, deps.script(GUARDS[k], base.ref));
  }
  return worst;
}
