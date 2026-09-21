import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ENGINE_PATHS, GENERATED_ROOT_ENTRIES, NON_ENGINE_PATHS, classify, engineFiles, isBumped } from "../src/ci/engine-change.ts";

const ROOT = new URL("..", import.meta.url);
const list = (dir: string) => readdirSync(new URL(dir, ROOT)).sort();

describe("which changes need the mutants and a version bump", () => {
  it("engines, the gate, masks, journeys and mutants do", () => {
    const changed = ["src/compare/headers.ts", "src/compare/stats/mann-whitney.ts", "src/gate.ts", "normalise/masks.yaml", "src/normalise/masks.ts", "traffic/journeys/fixture.ts", "mutants/mutants.yaml", "mutants/Dockerfile"];
    expect(engineFiles(changed)).toEqual(changed);
  });

  it("everything that decides what is collected does: collectors, runtime, static image artefacts, persistence, migration, bus, the clock probe", () => {
    const changed = ["src/collectors/browser.ts", "src/collectors/load.ts", "src/runtime/startup.ts", "src/image-static/sbom.ts", "src/persistence/recorder.ts", "src/migration/backend.ts", "src/bus/transport.ts", "src/clock-probe.ts"];
    expect(engineFiles(changed)).toEqual(changed);
  });

  it("so does everything that decides how a run is put together or which stacks and images are judged", () => {
    const changed = ["src/run.ts", "src/modes/upgrade.ts", "src/noise.ts", "src/claims/matcher.ts", "src/stack.ts", "src/substrate/kind.ts", "src/images.ts", "src/image-ref.ts", "src/image-cache.ts", "compose.harness.yaml", "deploy/kind/kind-config.yaml", "fixtures/persistence/stub.mjs", "scripts/build-images.sh", "traffic/load/reader.js", "pnpm-lock.yaml"];
    expect(engineFiles(changed)).toEqual(changed);
  });

  it("and so do the mutants, the code that builds them and the code that runs them", () => {
    const changed = ["mutants/wrap.mjs", "src/mutant-build.ts", "src/mutants.ts"];
    expect(engineFiles(changed)).toEqual(changed);
  });

  it("docs, reports, the CLI, the CI guards, tests and workflows do not", () => {
    expect(engineFiles(["README.md", "TESTING.md", "docs/contract.md", "src/report/html.ts", "src/cli.ts", "src/ci/engine-change.ts", "src/override.ts", "src/types.ts", "src/version.ts", "tests/gate.test.ts", ".github/workflows/ci.yml", "package.json", "bin/harness.mjs", "claims/example.claims.yaml"])).toEqual([]);
  });

  it("reads Windows paths too", () => {
    expect(engineFiles(["src\\compare\\dom.ts"])).toEqual(["src/compare/dom.ts"]);
  });

  it("TESTING.md names every path, and every deliberate exclusion", () => {
    const doc = readFileSync(new URL("../TESTING.md", import.meta.url), "utf8");
    for (const p of ENGINE_PATHS) expect(doc, p).toContain(`\`${p}\``);
    for (const p of Object.keys(NON_ENGINE_PATHS)) expect(doc, p).toContain(`\`${p}\``);
  });
});

/**
 * The list of engine paths rotted once: the collectors, runtime, static image
 * artefacts and the rest were added and never listed, so a change to what is
 * collected needed neither a version bump nor the mutants. These tests fail the
 * day a new file or directory appears under `src/` or at the root and nobody
 * has said whether it is engine code.
 */
describe("every top-level entry is classified, so the list cannot silently rot", () => {
  const srcEntries = () => list("src").map((e) => `src/${e}`);
  const rootEntries = () => list(".").filter((e) => e !== "src" && !e.startsWith(".") && !(GENERATED_ROOT_ENTRIES as readonly string[]).includes(e));

  it("every file and directory directly under src/ is an engine path or explicitly non-engine", () => {
    const unclassified = srcEntries().filter((e) => classify(e) === "unclassified");
    expect(unclassified, `add ${unclassified.join(", ")} to ENGINE_PATHS (src/ci/engine-change.ts) if it can change what a report says, else to NON_ENGINE_PATHS with a reason`).toEqual([]);
  });

  it("every file and directory at the repository root is too", () => {
    const unclassified = rootEntries().filter((e) => classify(e) === "unclassified");
    expect(unclassified, `add ${unclassified.join(", ")} to ENGINE_PATHS or NON_ENGINE_PATHS in src/ci/engine-change.ts`).toEqual([]);
  });

  it("a new top-level directory or file under src/ that nobody classified is caught", () => {
    expect(classify("src/brand-new-collector")).toBe("unclassified");
    expect(classify("src/brand-new-collector.ts")).toBe("unclassified");
    expect(classify("brand-new-root-dir")).toBe("unclassified");
    // ...and the check above would flag it, because it goes through the same function.
    expect([...srcEntries(), "src/brand-new-collector"].filter((e) => classify(e) === "unclassified")).toEqual(["src/brand-new-collector"]);
  });

  it("nothing is both engine and non-engine, and no exclusion is stale", () => {
    const present = new Set([...srcEntries(), ...rootEntries()]);
    for (const e of Object.keys(NON_ENGINE_PATHS)) {
      expect(() => classify(e), e).not.toThrow();
      expect(present.has(e), `${e} is listed as non-engine but does not exist: remove it`).toBe(true);
      expect(NON_ENGINE_PATHS[e]!.length, `${e} needs a reason`).toBeGreaterThan(8);
    }
  });

  it("no engine path is stale: each one names something that exists", () => {
    const present = new Set([...srcEntries(), ...rootEntries()]);
    for (const p of ENGINE_PATHS) {
      const entry = p.replace(/\/\*\*$/, "").split("/").slice(0, p.startsWith("src/") ? 2 : 1).join("/");
      expect(present.has(entry), `${p} names ${entry}, which does not exist`).toBe(true);
    }
  });

  it("the engine paths cover every directory under src/ except those listed as non-engine", () => {
    const dirs = readdirSync(new URL("src", ROOT), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `src/${d.name}`);
    expect(dirs.filter((d) => classify(d) === "non-engine").sort()).toEqual(["src/ci", "src/report"]);
  });
});

describe("a version bump", () => {
  it("is any strict semver increase", () => {
    expect(isBumped("1.0.0", "1.0.1")).toBe(true);
    expect(isBumped("1.0.9", "1.1.0")).toBe(true);
    expect(isBumped("1.9.9", "2.0.0")).toBe(true);
    expect(isBumped("0.1.0", "1.0.0")).toBe(true);
    expect(isBumped("1.1.0-rc.1", "1.1.0")).toBe(true);
    expect(isBumped("1.1.0-rc.1", "1.1.0-rc.2")).toBe(true);
    expect(isBumped("1.1.0-rc.9", "1.1.0-rc.10")).toBe(true);
  });

  it("is not the same version, a lower one, a prerelease of the same one, or nonsense", () => {
    expect(isBumped("1.0.0", "1.0.0")).toBe(false);
    expect(isBumped("1.1.0", "1.0.9")).toBe(false);
    expect(isBumped("1.1.0", "1.1.0-rc.1")).toBe(false);
    expect(isBumped("1.0.0", "next")).toBe(false);
    expect(isBumped("1.0.0", "1.0.0+build.2")).toBe(false);
  });
});
