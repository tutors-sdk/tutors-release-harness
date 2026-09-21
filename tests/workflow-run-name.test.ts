/**
 * release.yml's runs are titled for the candidate, so the monorepo's release-harness-report workflow (its
 * scripts/release-report-comment.ts, `titleNames`) can find the run a release-candidate dispatch started, and read the
 * verdict from it. Without the title it falls back to guessing by time. This holds the title to the contract.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const ROOT = resolve(import.meta.dirname, "..");
const read = (...p: string[]) => readFileSync(resolve(ROOT, ...p), "utf8");
const release = parse(read(".github/workflows/release.yml")) as { "run-name"?: string; on: { workflow_dispatch: { inputs: Record<string, unknown> } } };
const contract = JSON.parse(read("docs/contract/workflows.json")) as { runNames: Record<string, string>; repositoryDispatch: Record<string, { workflow: string; clientPayload: Record<string, unknown> }> };

/** The monorepo's matcher, as it is written there: a title names a candidate as a whole tag. */
const titleNames = (title: string, candidate: string) => new RegExp(`(^|[^0-9A-Za-z.-])v?${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^0-9A-Za-z-]|\\.(?![0-9A-Za-z]))`).test(title);

describe("release.yml titles its runs for the candidate", () => {
  it("has a top-level run-name of `release <candidate>`, from the dispatch payload or the manual input", () => {
    expect(release["run-name"]).toBe("release ${{ github.event.client_payload.candidate || inputs.candidate }}");
  });

  it("both names in it exist: the release-candidate payload's `candidate` and the workflow_dispatch input `candidate`", () => {
    expect(contract.repositoryDispatch["release-candidate"]!.workflow).toBe("release.yml");
    expect(Object.keys(contract.repositoryDispatch["release-candidate"]!.clientPayload)).toContain("candidate");
    expect(Object.keys(release.on.workflow_dispatch.inputs)).toContain("candidate");
  });

  it("is what workflows.json (runNames) and the contract say, and the monorepo copy of the story says so too", () => {
    expect(contract.runNames["release.yml"]).toBe(release["run-name"]);
    expect(read("docs/contract.md")).toContain("run-name: release <candidate>");
    expect(read("docs/monorepo/README.md")).toContain("run-name: release ${{ github.event.client_payload.candidate || inputs.candidate }}");
  });

  it("is a title the monorepo's matcher finds for that candidate, and only for that one", () => {
    const title = (candidate: string) => `release ${candidate}`;
    expect(titleNames(title("16.3.0-rc.1"), "16.3.0-rc.1")).toBe(true);
    expect(titleNames(title("16.3.0-rc.10"), "16.3.0-rc.1")).toBe(false);
    expect(titleNames(title("16.3.0-rc.1"), "16.3.0-rc.10")).toBe(false);
    expect(titleNames(title("16.3.0"), "16.3.0-rc.1")).toBe(false);
    // and it starts the way the monorepo recognises a harness title that names some other candidate
    expect(title("16.3.0-rc.1")).toMatch(/^release v?\d+\.\d+\.\d+/);
  });

  it("no other workflow of this repository sets one: the other runs are not releases", () => {
    for (const f of ["ci.yml", "nightly-noise.yml", "post-deploy.yml", "weekly-mutants.yml"]) expect(read(".github/workflows", f), f).not.toMatch(/^run-name:/m);
  });
});
