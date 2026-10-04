/**
 * The release reviewer's daily A3: the README points at it from the top, and pages.yml rebuilds it every night after
 * the nightly A/A (and can be run by hand). These keep the pointer and the daily build from silently going away.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const ROOT = resolve(import.meta.dirname, "..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");
const A3 = "https://tutors-sdk.github.io/tutors-release-harness/a3.html";

describe("the daily A3 for the release reviewer", () => {
  it("the README links it near the top, before anything else", () => {
    const top = read("README.md").split("\n").slice(0, 6).join("\n");
    expect(top).toContain("Daily A3 for the release reviewer");
    expect(top).toContain(A3);
  });

  it("pages.yml rebuilds it after every nightly A/A and Main to RC, and can be run by hand", () => {
    const wf = parse(read(".github/workflows/pages.yml")) as { on: Record<string, unknown> };
    const run = wf.on.workflow_run as { workflows: string[]; types: string[] };
    expect(run.workflows).toContain("Nightly noise (A/A)");
    expect(run.workflows).toContain("Main to RC");
    expect(run.types).toContain("completed");
    expect(wf.on).toHaveProperty("workflow_dispatch");
  });

  it("the workflows it follows are still named that way, and the nightly is still on a schedule", () => {
    const nightly = parse(read(".github/workflows/nightly-noise.yml")) as { name: string; on: Record<string, unknown> };
    expect(nightly.name).toBe("Nightly noise (A/A)");
    expect(nightly.on).toHaveProperty("schedule");
    expect((parse(read(".github/workflows/main-preview.yml")) as { name: string }).name).toBe("Main to RC");
  });

  it("and the A3 it builds is a3.html", () => {
    expect(read(".github/workflows/pages.yml")).toContain("a3.html");
  });
});
