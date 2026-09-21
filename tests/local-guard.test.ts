/**
 * `harness guard`: the CI guards as commands against local refs. The rules
 * themselves are tested where they live (mask-change.test.ts, engine-change.test.ts);
 * this file holds the command: it resolves the ref, refuses one that does not
 * exist with exit 2 (never a stack trace that reads as a violation), runs the very
 * script CI runs, and takes the worst exit code.
 */
import { describe, expect, it } from "vitest";
import { GUARDS, realGit, realScript, resolveBase, runGuard, type GitResult, type GuardDeps } from "../src/local/guard.ts";

const ok = (stdout = ""): GitResult => ({ status: 0, stdout, stderr: "" });
const no = (stderr = ""): GitResult => ({ status: 1, stdout: "", stderr });

interface Fake {
  refs?: string[];
  mergeBase?: boolean;
  shallow?: boolean;
  dirty?: string;
  exits?: Partial<Record<string, number>>;
  env?: NodeJS.ProcessEnv;
}

function fake(f: Fake = {}) {
  const ran: string[] = [];
  const logs: string[] = [];
  const deps: GuardDeps = {
    git: (args) => {
      if (args[0] === "rev-parse" && args[1] === "--verify") return (f.refs ?? ["main"]).includes(args.at(-1)!.replace("^{commit}", "")) ? ok("sha") : no();
      if (args[0] === "merge-base") return f.mergeBase === false ? no() : ok("base");
      if (args[0] === "rev-parse" && args[1] === "--is-shallow-repository") return ok(f.shallow ? "true\n" : "false\n");
      if (args[0] === "status") return ok(f.dirty ?? "");
      throw new Error(`unexpected git ${args.join(" ")}`);
    },
    script: (path, base) => {
      ran.push(`${path} --base ${base}`);
      return f.exits?.[path] ?? 0;
    },
    env: f.env ?? {},
    log: (m) => logs.push(m)
  };
  return { deps, ran, logs };
}

describe("resolving the base", () => {
  it("--base wins, then HARNESS_BASE_REF, then origin/main, then main", () => {
    const { deps } = fake({ refs: ["feature", "env-ref", "origin/main", "main"], env: { HARNESS_BASE_REF: "env-ref" } });
    expect(resolveBase("feature", deps)).toEqual({ ok: true, ref: "feature" });
    expect(resolveBase(undefined, deps)).toEqual({ ok: true, ref: "env-ref" });
    expect(resolveBase(undefined, { ...deps, env: {} })).toEqual({ ok: true, ref: "origin/main" });
    expect(resolveBase(undefined, { git: fake({ refs: ["main"] }).deps.git, env: {} })).toEqual({ ok: true, ref: "main" });
  });

  it("a ref that is not a commit says how to get it, and the default says to name one", () => {
    const { deps } = fake({ refs: [] });
    const named = resolveBase("origin/develop", deps);
    expect(named).toMatchObject({ ok: false });
    expect((named as { message: string }).message).toContain("git fetch origin");
    expect((resolveBase(undefined, deps) as { message: string }).message).toContain("--base <ref>");
  });

  it("no common ancestor names the shallow clone", () => {
    const shallow = resolveBase("main", fake({ mergeBase: false, shallow: true }).deps) as { message: string };
    expect(shallow.message).toContain("git fetch --unshallow");
    expect((resolveBase("main", fake({ mergeBase: false }).deps) as { message: string }).message).not.toContain("unshallow");
  });
});

describe("running the guards", () => {
  it("masks and engine are the scripts CI runs, with the base the command resolved", () => {
    const m = fake();
    expect(runGuard("masks", "main", m.deps)).toBe(0);
    expect(m.ran).toEqual(["src/ci/mask-change.ts --base main"]);
    const e = fake();
    expect(runGuard("engine", "main", e.deps)).toBe(0);
    expect(e.ran).toEqual(["src/ci/engine-change.ts --base main"]);
    expect(GUARDS).toEqual({ masks: "src/ci/mask-change.ts", engine: "src/ci/engine-change.ts" });
  });

  it("all runs both, and the worst exit code wins (a violation is 1, and does not stop the other)", () => {
    const f = fake({ exits: { "src/ci/mask-change.ts": 1 } });
    expect(runGuard("all", "main", f.deps)).toBe(1);
    expect(f.ran).toHaveLength(2);
  });

  it("a ref that does not exist is exit 2 and runs nothing: not a violation, not a pass", () => {
    const f = fake({ refs: [] });
    expect(runGuard("masks", "nope", f.deps)).toBe(2);
    expect(f.ran).toEqual([]);
  });

  it("says that uncommitted work is not compared", () => {
    const f = fake({ dirty: " M src/gate.ts\n?? new.ts\n" });
    runGuard("engine", "main", f.deps);
    expect(f.logs.join("\n")).toContain("2 uncommitted change(s) are not compared");
  });
});

describe("against a real repository", () => {
  it("resolves a local branch and refuses a missing one, with real git", () => {
    // the harness checkout's own history: HEAD is a commit whatever branch this runs on
    expect(resolveBase("HEAD", { git: realGit, env: {} })).toEqual({ ok: true, ref: "HEAD" });
    expect(resolveBase("no-such-ref-anywhere", { git: realGit, env: {} })).toMatchObject({ ok: false });
  });

  it("runs the real masks guard against HEAD: nothing changed since HEAD, so nothing to object to", () => {
    const logs: string[] = [];
    const code = runGuard("masks", "HEAD", { git: realGit, script: realScript, env: {}, log: (m) => logs.push(m) });
    expect(code).toBe(0);
  });
});
