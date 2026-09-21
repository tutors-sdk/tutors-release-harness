/**
 * The compose project and kind cluster of a checkout (contract 1.3.0): derived from where the checkout is, so two
 * worktrees never share a stack, the same one always gets the same name, and the old shared name is never adopted.
 * The three tests TESTING.md asks: the A/A (the same path, the same name, whatever the case on Windows), a planted
 * collision (two paths, two names), and what must not change (overrides win; the legacy name is refused for kind).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { COMPOSE_NETWORK, COMPOSE_PROJECT } from "../src/stack.ts";
import { CLUSTER } from "../src/substrate/kind.ts";
import { LEGACY_PROJECT, checkoutId, composeProject, derivedName, harnessRoot, kindCluster, refuseLegacyCluster } from "../src/project.ts";

const ROOT = resolve(import.meta.dirname, "..");
const sha8 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex").slice(0, 8);

describe("the derived name", () => {
  it("A/A: the same checkout always gets the same name: tutors-harness- and the first 8 hex of sha256 of its real path", () => {
    expect(checkoutId("/home/me/tutors-release-harness", "linux")).toBe(sha8("/home/me/tutors-release-harness"));
    expect(derivedName("/home/me/tutors-release-harness", "linux")).toBe(`tutors-harness-${sha8("/home/me/tutors-release-harness")}`);
    expect(derivedName("/home/me/tutors-release-harness", "linux")).toMatch(/^tutors-harness-[0-9a-f]{8}$/);
    expect(derivedName("/home/me/tutors-release-harness", "linux")).toBe(derivedName("/home/me/tutors-release-harness", "linux"));
    // and the running code, from its own module, agrees with the function
    expect(COMPOSE_PROJECT).toBe(derivedName(harnessRoot()));
    expect(CLUSTER).toBe(derivedName(harnessRoot()));
    expect(COMPOSE_NETWORK).toBe(`${COMPOSE_PROJECT}_default`);
  });

  it("planted: two worktrees, or a second checkout, get different names", () => {
    const names = ["/d/code/tutors-release-harness", "/d/code/wt/harness-1.3.0", "/d/code/wt/harness-followups", "/home/me/tutors-release-harness"].map((p) => derivedName(p, "linux"));
    expect(new Set(names).size).toBe(names.length);
    // a path that differs only by a trailing part is another checkout
    expect(derivedName("/a/b", "linux")).not.toBe(derivedName("/a/b2", "linux"));
  });

  it("on Windows the path is lowercased first (D:\\Code\\Harness and d:\\code\\harness are one directory); elsewhere case is significant", () => {
    expect(derivedName("D:\\Code\\Harness", "win32")).toBe(derivedName("d:\\code\\harness", "win32"));
    expect(derivedName("D:\\Code\\Harness", "win32")).toBe(`tutors-harness-${sha8("d:\\code\\harness")}`);
    expect(derivedName("/Code/Harness", "linux")).not.toBe(derivedName("/code/harness", "linux"));
    expect(derivedName("/Code/Harness", "darwin")).not.toBe(derivedName("/code/harness", "darwin"));
  });

  it("the root is the real path of the harness checkout, so a checkout reached through a link is the same checkout", () => {
    expect(harnessRoot()).toBe(realpathSync.native(ROOT));
  });
});

describe("overrides still win", () => {
  const root = "/home/me/harness";
  const derived = derivedName(root, "linux");

  it("compose: HARNESS_COMPOSE_PROJECT, then HARNESS_PROJECT, then the derived name", () => {
    expect(composeProject({}, root, "linux")).toEqual({ name: derived, source: `this checkout's path (${root})` });
    expect(composeProject({ HARNESS_PROJECT: "mine" }, root, "linux")).toEqual({ name: "mine", source: "HARNESS_PROJECT" });
    expect(composeProject({ HARNESS_PROJECT: "mine", HARNESS_COMPOSE_PROJECT: "specific" }, root, "linux")).toEqual({ name: "specific", source: "HARNESS_COMPOSE_PROJECT" });
    expect(composeProject({ HARNESS_PROJECT: "  ", HARNESS_COMPOSE_PROJECT: "" }, root, "linux").name).toBe(derived);
  });

  it("kind: HARNESS_KIND_CLUSTER, then HARNESS_PROJECT, then the derived name; the compose variable does not touch the cluster", () => {
    expect(kindCluster({}, root, "linux").name).toBe(derived);
    expect(kindCluster({ HARNESS_PROJECT: "mine" }, root, "linux")).toEqual({ name: "mine", source: "HARNESS_PROJECT" });
    expect(kindCluster({ HARNESS_PROJECT: "mine", HARNESS_KIND_CLUSTER: "specific" }, root, "linux")).toEqual({ name: "specific", source: "HARNESS_KIND_CLUSTER" });
    expect(kindCluster({ HARNESS_COMPOSE_PROJECT: "compose-only" }, root, "linux").name).toBe(derived);
  });

  it("a name docker or kind would refuse is refused here, saying which variable", () => {
    expect(() => composeProject({ HARNESS_COMPOSE_PROJECT: "Has Spaces" }, root, "linux")).toThrow(/HARNESS_COMPOSE_PROJECT=Has Spaces is not a valid compose project name/);
    expect(() => composeProject({ HARNESS_PROJECT: "-lead" }, root, "linux")).toThrow(/HARNESS_PROJECT/);
    expect(() => kindCluster({ HARNESS_KIND_CLUSTER: "under_score" }, root, "linux")).toThrow(/not a valid kind cluster name/);
    expect(composeProject({ HARNESS_COMPOSE_PROJECT: "harness_local-2" }, root, "linux").name).toBe("harness_local-2");
  });

  it("the old default name is allowed for compose by choice (it was always an override), and refused for kind, which is never adopted", () => {
    expect(composeProject({ HARNESS_COMPOSE_PROJECT: LEGACY_PROJECT }, root, "linux").name).toBe(LEGACY_PROJECT);
    expect(() => refuseLegacyCluster(LEGACY_PROJECT)).toThrow(/not adopted or deleted by any harness command/);
    expect(() => refuseLegacyCluster(derived)).not.toThrow();
    expect(() => refuseLegacyCluster("harness-local")).not.toThrow();
  });
});

describe("through the process", () => {
  const cli = (env: Record<string, string>, ...args: string[]) => spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });

  it("`kind up` and `kind down` refuse a cluster called tutors-harness before touching kind or docker", () => {
    for (const args of [["kind", "down"], ["kind", "up", "--a", "16.2.0", "--b", "16.2.0"], ["kind", "rollout", "--a", "16.2.0", "--b", "16.3.0"]]) {
      // an empty PATH: if the refusal did not come first, docker and kind could not even be started
      const r = cli({ HARNESS_KIND_CLUSTER: LEGACY_PROJECT, PATH: mkdtempSync(join(tmpdir(), "harness-nopath-")) }, ...args);
      expect(r.status, args.join(" ")).toBe(2);
      expect(r.stderr, args.join(" ")).toContain(`the kind cluster name is "${LEGACY_PROJECT}"`);
      expect(r.stderr, args.join(" ")).toContain("not adopted or deleted by any harness command");
    }
  });

  it("an invalid HARNESS_PROJECT stops every command with the variable named", () => {
    const r = cli({ HARNESS_PROJECT: "No Good" }, "journeys");
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/HARNESS_PROJECT=No Good is not a valid compose project name/);
  });

  it("no source file still names the shared project as the default: the only `tutors-harness` left is the legacy constant, image names and prose", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(join(ROOT, dir))) {
        const rel = `${dir}/${name}`;
        if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
        else if (rel.endsWith(".ts")) for (const [i, line] of readFileSync(join(ROOT, rel), "utf8").split("\n").entries()) if (/["'`]tutors-harness["'`]/.test(line) && !/^\s*(\*|\/\*|\/\/)/.test(line)) hits.push(`${rel}:${i + 1}: ${line.trim()}`);
      }
    };
    walk("src");
    // the constant itself, and nothing else in src
    expect(hits.map((h) => h.split(":")[0]!)).toEqual(["src/project.ts"]);
  });
});
