import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MASKS_FILE, checkMaskPr, diffMasks, onlyVersionChanged } from "../src/ci/mask-change.ts";
import { ENGINE_PATHS, engineFiles } from "../src/ci/engine-change.ts";

const base = `masks:
  - id: response-date
    artefact: headers
    header: date
    reason: Node sets Date on every response; a wall clock is not under the harness's control.
screenshot: { maxDiffRatio: 0.001, pixelThreshold: 0.1 }
timing: { minRuns: 3, alpha: 0.01 }
`;
const withMask = (id: string) => base.replace("screenshot:", `  - id: ${id}\n    artefact: headers\n    header: etag\n    reason: The etag is derived from the build time, which differs by design.\nscreenshot:`);
const pkg = (version: string, extra = "") => `{"name":"h","version":"${version}"${extra}}`;

describe("diffMasks", () => {
  it("identical files loosen nothing", () => {
    expect(diffMasks(base, base)).toMatchObject({ added: [], changed: [], removed: [], thresholds: [], loosens: false, baseCount: 1, headCount: 1 });
  });

  it("an added mask loosens", () => {
    expect(diffMasks(base, withMask("etag"))).toMatchObject({ added: ["etag"], loosens: true, headCount: 2 });
  });

  it("a changed mask loosens, a changed threshold loosens, a removed mask does not", () => {
    expect(diffMasks(base, base.replace("header: date", "header: (date|age)"))).toMatchObject({ changed: ["response-date"], loosens: true });
    expect(diffMasks(base, base.replace("maxDiffRatio: 0.001", "maxDiffRatio: 0.01"))).toMatchObject({ thresholds: ["screenshot"], loosens: true });
    expect(diffMasks(withMask("etag"), base)).toMatchObject({ removed: ["etag"], loosens: false });
  });

  it("a brand new file, or a missing base, is all additions", () => {
    expect(diffMasks(undefined, base)).toMatchObject({ added: ["response-date"], loosens: true });
  });

  it("re-ordering masks or reformatting the YAML is not a change", () => {
    expect(diffMasks(base, base.replace("screenshot: { maxDiffRatio: 0.001, pixelThreshold: 0.1 }", "screenshot:\n  maxDiffRatio: 0.001\n  pixelThreshold: 0.1"))).toMatchObject({ loosens: false });
  });
});

describe("masks land in their own PR", () => {
  const added = diffMasks(base, withMask("etag"));
  const noneAdded = diffMasks(base, base);

  it("fails a PR that adds a mask and changes anything else", () => {
    const r = checkMaskPr({ changedFiles: [MASKS_FILE, "src/compare/engines.ts"], diff: added, packageJson: { base: pkg("1.2.0"), head: pkg("1.3.0") } });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("added etag");
    expect(r.errors[0]).toContain("src/compare/engines.ts");
    expect(r.errors[0]).toContain("their own PR");
  });

  it("fails a mask PR that touches a journey, the gate, a workflow or a release file", () => {
    for (const other of ["traffic/journeys/anonymous.ts", "src/gate.ts", ".github/workflows/release.yml", "claims/example.claims.yaml"]) {
      expect(checkMaskPr({ changedFiles: [MASKS_FILE, other], diff: added }).ok, other).toBe(false);
    }
  });

  it("passes a PR that changes masks and only their notes, tests and the version bump", () => {
    const r = checkMaskPr({ changedFiles: [MASKS_FILE, "docs/noise-burndown.md", "tests/normalise.test.ts", "package.json"], diff: added, packageJson: { base: pkg("1.2.0"), head: pkg("1.3.0") } });
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("a package.json change beyond the version does not ride along", () => {
    const r = checkMaskPr({ changedFiles: [MASKS_FILE, "package.json"], diff: added, packageJson: { base: pkg("1.2.0"), head: pkg("1.3.0", ',"dependencies":{"x":"1"}') } });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("package.json");
  });

  it("a PR that adds no mask is not restricted, whatever else it changes", () => {
    expect(checkMaskPr({ changedFiles: [MASKS_FILE, "src/compare/engines.ts"], diff: diffMasks(withMask("etag"), base) }).ok).toBe(true);
    expect(checkMaskPr({ changedFiles: ["src/compare/engines.ts", "src/gate.ts"], diff: noneAdded }).ok).toBe(true);
  });

  it("warns, and does not fail, when the list is over the limit", () => {
    const ids = Array.from({ length: 41 }, (_, i) => `m${i}`);
    const many = `masks:\n${ids.map((id) => `  - id: ${id}\n    artefact: headers\n    header: x-${id}\n    reason: ${"a reason of at least twenty characters ".repeat(1)}\n`).join("")}`;
    const r = checkMaskPr({ changedFiles: ["README.md"], diff: diffMasks(many, many), maxMasks: 40 });
    expect(r.ok).toBe(true);
    expect(r.warnings[0]).toContain("41 masks");
    expect(checkMaskPr({ changedFiles: ["README.md"], diff: diffMasks(many, many), maxMasks: 41 }).warnings).toEqual([]);
  });

  it("the real masks.yaml is under the limit today", () => {
    const real = readFileSync(resolve(import.meta.dirname, "..", MASKS_FILE), "utf8");
    expect(checkMaskPr({ changedFiles: [], diff: diffMasks(real, real) }).warnings).toEqual([]);
  });

  it("the file it watches is one the engine-change rule also treats as an engine path", () => {
    expect(engineFiles([MASKS_FILE])).toEqual([MASKS_FILE]);
    expect(ENGINE_PATHS.some((p) => p.startsWith("normalise"))).toBe(true);
  });
});

describe("onlyVersionChanged", () => {
  it("is true for a version bump alone, false for anything else or when a side is missing", () => {
    expect(onlyVersionChanged(pkg("1.2.0"), pkg("1.3.0"))).toBe(true);
    expect(onlyVersionChanged(pkg("1.2.0"), pkg("1.3.0", ',"scripts":{}'))).toBe(false);
    expect(onlyVersionChanged(undefined, pkg("1.3.0"))).toBe(false);
  });
});
