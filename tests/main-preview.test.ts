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

  it("runs when the nightly A/A on this repository's main finishes, not on a cron that a slow night could overtake", () => {
    const raw = parse(readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8")) as { on: Record<string, { workflows?: string[]; types?: string[] } | null> };
    const nightly = parse(readFileSync(resolve(ROOT, ".github/workflows/nightly-noise.yml"), "utf8")) as { name: string };
    expect(Object.keys(raw.on).sort()).toEqual(["workflow_dispatch", "workflow_run"]);
    expect(raw.on.workflow_run).toEqual({ workflows: [nightly.name], types: ["completed"] });
    // a nightly on another branch or from a fork, or a cancelled one, starts nothing
    const gate = wf.jobs.resolve!.if!.replace(/\s+/g, " ");
    expect(gate).toContain("github.event_name != 'workflow_run' ||");
    expect(gate).toContain("github.event.workflow_run.head_branch == 'main'");
    expect(gate).toContain("github.event.workflow_run.head_repository.full_name == github.repository");
    expect(gate).not.toContain("cancelled");
    // after a nightly there are no inputs: every input reaches `preview resolve` only when set, so it resolves main's own
    const step = wf.jobs.resolve!.steps.find((s) => s.run?.includes("harness preview resolve"))!.run!;
    expect(step).toContain('${PRODUCTION:+--a "$PRODUCTION"}');
    expect(step).toContain('${CANDIDATE:+--b "$CANDIDATE"}');
    expect(step).toContain('[ "$FORCE" = true ]');
    // nothing of the triggering run is checked out or downloaded
    const text = readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8");
    expect(text).not.toMatch(/workflow_run\.(head_sha|id)|run-id:|github-token:/);
  });

  it("keeps each run on the main-preview branch, never on release-records: a forecast is not a release record", () => {
    const text = readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8");
    expect(text).toContain("push \"https://github.com/${GITHUB_REPOSITORY}.git\" main-preview");
    expect(text).not.toContain("release-records");
    expect(text).not.toMatch(/push --force/);
  });
});

describe("main-preview.yml: the forecast is scored as a candidate is (since 1.13.1), and nothing of the score reaches a verdict", () => {
  type Step = { name?: string; run?: string; uses?: string; if?: string; with?: Record<string, unknown>; "continue-on-error"?: boolean; "working-directory"?: string };
  type Job = { needs?: string | string[]; if?: string; permissions?: Record<string, string>; steps: Step[] };
  const wf = parse(readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8")) as { jobs: Record<string, Job> };
  const release = parse(readFileSync(resolve(ROOT, ".github/workflows/release.yml"), "utf8")) as { jobs: Record<string, Job> };
  const run = (job: string, name: string) => wf.jobs[job]!.steps.find((s) => s.name === name)!;

  it("rehearses main as release.yml rehearses a candidate, and a rehearsal FAIL is a forecast too: only exit 2 fails the job", () => {
    for (const [job, mode] of [["migration", "--mode migration"], ["upgrade", "--mode upgrade"]] as const) {
      const j = wf.jobs[job]!;
      expect(j.needs, job).toBe("resolve");
      expect(j.if, job).toBe("needs.resolve.outputs.skip == 'false'");
      expect(j.permissions, job).toBeUndefined();
      const step = j.steps.find((s) => s.run?.includes(mode))!.run!;
      expect(step, job).toContain('if [ "$code" -gt 1 ]; then exit "$code"; fi');
      expect(j.steps.find((s) => s.uses?.startsWith("actions/upload-artifact@"))!.with!.name).toBe(`main-preview-${job}-report`);
    }
    expect(run("migration", "Migration mode").run).toContain('--a "v$PRODUCTION" --b "${SHA:-v$CANDIDATE}"');
    // the upgrade rehearsal is release.yml's: the same journey, the same set
    const theirs = release.jobs.upgrade!.steps.find((s) => s.name === "Upgrade mode")!.run!;
    expect(theirs).toContain("--set fixture --journey anonymous-student-reads-course");
    expect(run("upgrade", "Upgrade mode").run).toContain("--set fixture --journey anonymous-student-reads-course");
  });

  it("scores in the publish job, after every verdict: changes over the monorepo's history, then the score with both rehearsals and the scoreboard's history", () => {
    const p = wf.jobs.publish!;
    expect(p.needs).toEqual(["resolve", "preview", "migration", "upgrade"]);
    expect(p.permissions).toEqual({ contents: "write" });
    const names = p.steps.map((s) => s.name ?? s.uses ?? "");
    const at = (n: string) => names.findIndex((x) => x.startsWith(n));
    for (const n of ["actions/download-artifact", "What changed between production and main", "Score the forecast", "Push the report to the main-preview branch"]) expect(at(n), n).toBeGreaterThanOrEqual(0);
    const mono = p.steps.find((s) => s.with?.repository === "tutors-sdk/tutors-mono-repo")!;
    expect(mono.with).toMatchObject({ "fetch-depth": 0, "persist-credentials": false, path: "mono" });
    expect(p.steps.indexOf(mono)).toBeLessThan(at("What changed between production and main"));
    expect(at("What changed between production and main")).toBeLessThan(at("Score the forecast"));
    expect(at("Score the forecast")).toBeLessThan(at("Push the report to the main-preview branch"));
    for (const a of ["main-preview-report", "main-preview-migration-report", "main-preview-upgrade-report"]) expect(p.steps.some((s) => s.with?.name === a), a).toBe(true);

    const changes = run("publish", "What changed between production and main");
    expect(changes["continue-on-error"]).toBe(true);
    expect(changes.if).toBe("needs.resolve.outputs.sha != ''");
    expect(changes.run).toContain('pnpm harness changes --a "$PRODUCTION" --b "$SHA" --monorepo ../mono --out "$(dirname "$report")/changes.json"');

    const score = run("publish", "Score the forecast");
    expect(score["continue-on-error"]).toBe(true);
    for (const flag of ["--migration", "--upgrade", '--change-risk "$run_dir/changes.json"', "--scoreboard", "contents/scoreboard/releases.jsonl?ref=scoreboard"]) expect(score.run, flag).toContain(flag);
    expect(score.run).toContain('pnpm harness confidence "${score[@]}"');
  });

  it("a forecast is not a release: it never appends to the scoreboard or pushes anything but main-preview", () => {
    const text = readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8");
    expect(text).not.toContain("scoreboard append");
    expect([...text.matchAll(/\bpush "https:\/\/github\.com\/\$\{GITHUB_REPOSITORY\}\.git" ([\w-]+)/g)].map((m) => m[1])).toEqual(["main-preview"]);
    // the verdict comes first: the release job neither scores nor reads a score
    const preview = JSON.stringify(wf.jobs.preview);
    expect(preview).not.toMatch(/harness confidence|harness changes|confidence\.json/);
  });

  it("keeps the score with the forecast: reports keep runs on the scored run directory", () => {
    const push = run("publish", "Push the report to the main-preview branch").run!;
    expect(push).toContain("pnpm harness reports keep --dir \"../$(dirname \"$report\")\"");
    expect(push).toContain("confidence.json");
  });

  it("keeps both rehearsals beside the forecast, and ten days of forecasts whatever the count (since 1.16.0)", () => {
    const push = run("publish", "Push the report to the main-preview branch").run!;
    expect(push).toContain("--keep-last 60 --keep-days 10");
    // the same rehearsal directories the score read, so the kept confidence.json can link the kept copies
    const score = run("publish", "Score the forecast").run!;
    for (const mode of ["migration", "upgrade"]) {
      const find = `${mode}="$(find rehearsals/${mode} -path '*-${mode}/report.json' 2>/dev/null | head -1)"`;
      expect(score, mode).toContain(find);
      expect(push, mode).toContain(find);
      expect(push, mode).toContain(`keep_flags+=(--${mode} "../$(dirname "$${mode}")")`);
    }
  });
});
