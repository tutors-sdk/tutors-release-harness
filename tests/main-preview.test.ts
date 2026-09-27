import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { decide, judgedBefore, newestBuiltMain, overlayTag, type Sources, type WorkflowRun } from "../src/ci/main-preview.ts";
import type { ReportIndex } from "../src/ci/report-archive.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SHA = "3f1c2a9d8e7b6a5f4e3d2c1b0a9f8e7d6c5b4a39";
const OLDER = "aaaaaaa1111111111111111111111111111111111".slice(0, 40);

const OVERLAY = `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
images:
  - name: quay.io/tutors-sdk/tutors-reader
    newTag: "16.2.2"
    digest: sha256:${"7".repeat(64)}
`;

const run = (o: Partial<WorkflowRun> = {}): WorkflowRun => ({ head_sha: SHA, head_branch: "main", event: "push", status: "completed", conclusion: "success", html_url: "https://github.com/tutors-sdk/tutors-mono-repo/actions/runs/1", updated_at: "2026-09-27T03:00:00Z", ...o });

const entry = (a: string, b: string, harnessVersion = "1.4.9") => ({
  id: "2026-09-27T04-30-00Z-release",
  mode: "release" as const,
  ranAt: "2026-09-27T04:30:00.000Z",
  verdict: "fail" as const,
  reasons: ["3 unclaimed diff(s)"],
  sides: { a: { reader: `quay.io/tutors-sdk/tutors-reader:${a}` }, b: { reader: `quay.io/tutors-sdk/tutors-reader:${b}` } },
  harnessVersion,
  runUrl: "https://github.com/tutors-sdk/tutors-release-harness/actions/runs/9",
  files: []
});
const index = (...runs: ReturnType<typeof entry>[]): ReportIndex => ({ schemaVersion: 1, runs });

const sources = (o: { overlay?: string; runs?: WorkflowRun[]; index?: ReportIndex } = {}): Sources => ({
  overlay: async () => o.overlay ?? OVERLAY,
  imageRuns: async () => o.runs ?? [run()],
  index: async () => (o.index ? JSON.stringify(o.index) : undefined)
});

describe("overlayTag: production, read as release-dispatch.yml reads it", () => {
  it("takes the first newTag, quoted or not", () => {
    expect(overlayTag(OVERLAY)).toBe("16.2.2");
    expect(overlayTag("images:\n  - name: r\n    newTag: 16.3.0-rc.2\n  - name: c\n    newTag: 9.9.9\n")).toBe("16.3.0-rc.2");
  });

  it("is undefined when the tag is missing or not a version", () => {
    expect(overlayTag("images: []\n")).toBeUndefined();
    expect(overlayTag("  newTag: main\n")).toBeUndefined();
  });
});

describe("newestBuiltMain: main's images, only once they are signed", () => {
  it("is the newest successful push run on main, tagged sha-<7>", () => {
    expect(newestBuiltMain([run({ head_sha: SHA }), run({ head_sha: OLDER })])).toEqual({ sha: SHA, tag: "sha-3f1c2a9", runUrl: run().html_url, builtAt: run().updated_at });
  });

  it("skips runs that failed, are still running, are not pushes to main, or carry no full sha", () => {
    const runs = [run({ conclusion: "failure" }), run({ status: "in_progress", conclusion: null }), run({ head_branch: "rc/16.3.0" }), run({ event: "workflow_dispatch" }), run({ head_sha: "abc" }), run({ head_sha: OLDER })];
    expect(newestBuiltMain(runs)?.sha).toBe(OLDER);
    expect(newestBuiltMain(runs.slice(0, 5))).toBeUndefined();
  });
});

describe("judgedBefore", () => {
  it("finds a release run of the same pair by the same harness version, and nothing else", () => {
    const i = index(entry("16.2.2", "sha-3f1c2a9"));
    expect(judgedBefore(i, { production: "16.2.2", candidate: "sha-3f1c2a9", harnessVersion: "1.4.9" })).toBeDefined();
    expect(judgedBefore(i, { production: "16.2.2", candidate: "sha-3f1c2a9", harnessVersion: "1.5.0" })).toBeUndefined();
    expect(judgedBefore(i, { production: "16.2.3", candidate: "sha-3f1c2a9", harnessVersion: "1.4.9" })).toBeUndefined();
    expect(judgedBefore(i, { production: "16.2.2", candidate: "sha-0000000", harnessVersion: "1.4.9" })).toBeUndefined();
  });
});

describe("decide", () => {
  it("judges main's newest signed commit against production, with main's claims at that commit", async () => {
    const d = await decide(sources(), { harnessVersion: "1.4.9" });
    expect(d).toMatchObject({ production: "16.2.2", candidate: "sha-3f1c2a9", sha: SHA, skip: false, claimsUrl: `https://raw.githubusercontent.com/tutors-sdk/tutors-mono-repo/${SHA}/release/claims.yaml` });
    expect(d.reason).toContain("judging main sha-3f1c2a9");
  });

  it("skips a pair this harness version already judged, and says what it found", async () => {
    const d = await decide(sources({ index: index(entry("16.2.2", "sha-3f1c2a9")) }), { harnessVersion: "1.4.9" });
    expect(d.skip).toBe(true);
    expect(d.reason).toContain("FAIL at 2026-09-27T04:30:00.000Z");
  });

  it("judges it again when forced, or when the harness has changed", async () => {
    const seen = sources({ index: index(entry("16.2.2", "sha-3f1c2a9")) });
    expect((await decide(seen, { harnessVersion: "1.4.9", force: true })).skip).toBe(false);
    expect((await decide(seen, { harnessVersion: "1.5.0" })).skip).toBe(false);
  });

  it("takes either side by hand; a candidate given by hand is judged against main's claims", async () => {
    const d = await decide(sources({ overlay: "nothing here" }), { production: "16.2.1", candidate: "16.3.0-rc.1", harnessVersion: "1.4.9" });
    expect(d).toMatchObject({ production: "16.2.1", candidate: "16.3.0-rc.1", sha: "", claimsUrl: "https://raw.githubusercontent.com/tutors-sdk/tutors-mono-repo/main/release/claims.yaml" });
  });

  it("refuses when it cannot say what to judge", async () => {
    await expect(decide(sources({ overlay: "images: []" }))).rejects.toThrow(/newTag/);
    await expect(decide(sources({ runs: [run({ conclusion: "failure" })] }))).rejects.toThrow(/no successful push run/);
    await expect(decide(sources(), { candidate: "sha-1;rm -rf" })).rejects.toThrow(/not a registry tag/);
  });
});

describe("main-preview.yml", () => {
  const wf = parse(readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8")) as { jobs: Record<string, { if?: string; steps: { name?: string; run?: string }[] }> };

  it("runs the preview only when resolve said so, and a FAIL is a forecast: only exit 2 fails the job", () => {
    expect(wf.jobs.preview!.if).toBe("needs.resolve.outputs.skip == 'false'");
    const release = wf.jobs.preview!.steps.find((s) => s.name === "Release mode")!.run!;
    expect(release).toContain("--mode release");
    expect(release).toContain("--claims claims.yaml");
    expect(release).toContain('if [ "$code" -gt 1 ]; then exit "$code"; fi');
  });

  it("keeps each run on the main-preview branch, never on release-records: a forecast is not a release record", () => {
    const text = readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8");
    expect(text).toContain("push \"https://github.com/${GITHUB_REPOSITORY}.git\" main-preview");
    expect(text).not.toContain("release-records");
    expect(text).not.toMatch(/push --force/);
  });
});
