/**
 * What a CI log and a failed job carry when the mutant self-test's A/A is not clean: the hunks themselves, in the log, and the
 * noise report as a small artifact. Both were missing once, and it cost hours to find out which twelve differences had failed.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { NOISE_HUNK_LOG_CAP, describeNoiseHunks } from "../src/mutants.ts";
import type { Hunk } from "../src/types.ts";

const hunk = (n: number, over: Partial<Hunk> = {}): Hunk => ({ id: `h${n}`, artefact: "dom", scope: `reader:page-${n}`, summary: `change ${n}`, severity: "fail", ...over });

describe("describeNoiseHunks", () => {
  it("names every non-info hunk (severity, artefact, scope, summary) and counts the info ones", () => {
    const lines = describeNoiseHunks([hunk(1), hunk(2, { artefact: "timing", scope: "reader:course", summary: "p95\n  moved   by 30%" }), hunk(3, { severity: "info", artefact: "metrics" })]);
    expect(lines).toEqual(["  fail dom            reader:page-1: change 1", "  fail timing         reader:course: p95 moved by 30%", "  1 info hunk(s) not listed"]);
  });

  it("caps the list and says how many more there are", () => {
    const hunks = Array.from({ length: NOISE_HUNK_LOG_CAP + 5 }, (_, i) => hunk(i));
    const lines = describeNoiseHunks(hunks);
    expect(lines).toHaveLength(NOISE_HUNK_LOG_CAP + 2);
    expect(lines[NOISE_HUNK_LOG_CAP]).toBe("  ... and 5 more");
    expect(describeNoiseHunks(hunks, 2)).toContain("  ... and " + (hunks.length - 2) + " more");
  });

  it("says so when an unclean A/A has no non-info hunk, rather than printing nothing", () => {
    const lines = describeNoiseHunks([hunk(1, { severity: "info" })]);
    expect(lines[0]).toMatch(/no non-info hunk/);
    expect(lines.at(-1)).toBe("  1 info hunk(s) not listed");
  });

  it("prints only the info count for a clean result", () => {
    expect(describeNoiseHunks([])).toEqual(["  (no non-info hunk: the A/A did not pass for another reason, see the report)", "  0 info hunk(s) not listed"]);
  });
});

describe("the mutants workflow", () => {
  interface Step {
    name?: string;
    uses?: string;
    if?: string;
    run?: string;
    with?: { name?: string; path?: string; "retention-days"?: number };
  }
  const workflow = parse(readFileSync(resolve(import.meta.dirname, "..", ".github", "workflows", "weekly-mutants.yml"), "utf8")) as { jobs: Record<string, { steps?: Step[] }> };
  const steps = workflow.jobs.mutants!.steps!;

  it("uploads the A/A report when the job fails, for seven days, without the screenshots", () => {
    const upload = steps.find((s) => s.uses?.startsWith("actions/upload-artifact") && s.if === "failure()");
    expect(upload).toBeDefined();
    expect(upload!.with!["retention-days"]).toBe(7);
    const paths = upload!.with!.path!.split(/\s+/).filter(Boolean);
    expect(paths).toContain("out/*-noise/report.md");
    expect(paths).toContain("out/*-noise/report.json");
    for (const p of paths) expect(p).toMatch(/^out\/\*-noise\//);
    expect(paths.join(" ")).not.toMatch(/png|screenshot/);
    // After the step that fails, so failure() is about the mutants run.
    expect(steps.indexOf(upload!)).toBeGreaterThan(steps.findIndex((s) => s.run?.includes("harness mutants")));
  });
});
