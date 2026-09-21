/**
 * docs/contract.md: post-deploy mode exiting 1 opens the `rollback` issue; exiting 2 is "could not judge" and does not.
 * The workflow used to open the issue on any failure of the step, exit 2 included, with a body cat'ed from a report
 * that a refused run never wrote. Here the workflow is read as data, and its two scripts are run under bash with the
 * harness stubbed to exit with each code.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const ROOT = resolve(import.meta.dirname, "..");

interface Step {
  name?: string;
  id?: string;
  if?: string;
  run?: string;
  env?: Record<string, string>;
}
const workflow = (name: string) => parse(readFileSync(resolve(ROOT, ".github/workflows", name), "utf8")) as { jobs: Record<string, { steps: Step[] }> };
const steps = (name: string, job: string) => workflow(name).jobs[job]!.steps;
const bashOk = spawnSync("bash", ["-c", "true"]).status === 0;

describe("post-deploy.yml: exit 1 is a rollback issue, exit 2 is not", () => {
  const all = steps("post-deploy.yml", "post-deploy");
  const runStep = all.find((s) => s.id === "run")!;
  const rollback = all.find((s) => s.run?.includes("gh issue create"))!;
  const couldNot = all.find((s) => s.name === "Say that the harness could not judge")!;

  it("the rollback issue is opened on exit 1 only, never on 'the step failed'", () => {
    expect(rollback.if).toContain("steps.run.outputs.exit_code == '1'");
    expect(rollback.if).not.toContain("outcome");
    expect(rollback.if).not.toContain("exit_code == '2'");
    // the only place in the workflow that opens an issue
    expect(all.filter((s) => s.run?.includes("gh issue create"))).toEqual([rollback]);
  });

  it("exit 2 is visible: the run step still fails the job, and a step says 'could not judge' in the summary", () => {
    expect(couldNot.if).toContain("failure()");
    expect(couldNot.if).toContain("steps.run.outputs.exit_code == '2'");
    expect(couldNot.run).toContain("could not judge");
    expect(couldNot.run).toContain("$GITHUB_STEP_SUMMARY");
    expect(couldNot.run).not.toContain("gh issue");
  });

  it.skipIf(!bashOk)("the run step hands its exit code on and exits with it, for 0, 1 and 2", () => {
    for (const code of [0, 1, 2]) {
      const dir = mkdtempSync(join(tmpdir(), "harness-wf-"));
      mkdirSync(join(dir, "recorded", "2026-01-01T00-00-00-release"), { recursive: true });
      const output = join(dir, "output");
      writeFileSync(output, "");
      const r = spawnSync("bash", ["-c", `pnpm() { return ${code}; }\n${runStep.run}`], { cwd: dir, encoding: "utf8", env: { ...process.env, GITHUB_OUTPUT: output, PRODUCTION_URLS: "reader=a,catalogue=b,live=c", DEPLOYED: "", DEPLOYED_DIGESTS: "", NOISE_FILE: "" } });
      expect(r.status, r.stderr).toBe(code);
      expect(readFileSync(output, "utf8").trim()).toBe(`exit_code=${code}`);
    }
  });

  it.skipIf(!bashOk)("the could-not-judge step writes its line to the job summary and touches no issue", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-wf-"));
    const summary = join(dir, "summary.md");
    writeFileSync(summary, "");
    const r = spawnSync("bash", ["-c", couldNot.run!], { cwd: dir, encoding: "utf8", env: { ...process.env, GITHUB_STEP_SUMMARY: summary } });
    expect(r.status).toBe(0);
    expect(readFileSync(summary, "utf8")).toMatch(/could not judge/i);
    expect(readFileSync(summary, "utf8")).toMatch(/no rollback issue was opened/);
  });
});

describe("the other workflows do not open an issue for a run that could not judge", () => {
  it("release.yml and nightly-noise.yml open issues only from the override record, on an applied override", () => {
    const opens = (file: string) => Object.entries(workflow(file).jobs).flatMap(([job, j]) => j.steps.filter((s) => s.run?.includes("gh issue create")).map(() => job));
    expect(opens("release.yml")).toEqual(["override-record"]);
    expect(opens("nightly-noise.yml")).toEqual([]);
    const record = steps("release.yml", "override-record").find((s) => s.run?.includes("gh issue create"))!;
    // it reads override.applied from the reports; it is not keyed to a failure
    expect(record.run).toContain("override");
    expect(record.if ?? "").not.toMatch(/failure\(\)/);
  });
});
