import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ENGINE_PATHS, engineFiles, isBumped } from "../src/ci/engine-change.ts";

describe("which changes need the mutants and a version bump", () => {
  it("engines, the gate, masks, journeys and mutants do", () => {
    const changed = ["src/compare/headers.ts", "src/compare/stats/mann-whitney.ts", "src/gate.ts", "normalise/masks.yaml", "src/normalise/masks.ts", "traffic/journeys/fixture.ts", "mutants/mutants.yaml", "mutants/Dockerfile"];
    expect(engineFiles(changed)).toEqual(changed);
  });

  it("docs, reports, the CLI, tests and workflows do not", () => {
    expect(engineFiles(["README.md", "docs/contract.md", "src/report/html.ts", "src/cli.ts", "tests/gate.test.ts", "traffic/load/k6.js", ".github/workflows/ci.yml", "src/mutants.ts"])).toEqual([]);
  });

  it("reads Windows paths too", () => {
    expect(engineFiles(["src\\compare\\dom.ts"])).toEqual(["src/compare/dom.ts"]);
  });

  it("TESTING.md names every path", () => {
    const doc = readFileSync(new URL("../TESTING.md", import.meta.url), "utf8");
    for (const p of ENGINE_PATHS) expect(doc).toContain(`\`${p}\``);
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
