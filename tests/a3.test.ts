/**
 * The A3 Aggregator (harness a3, since 1.14.0): the Pareto rule, the causes it ranks, the value stream it maps, the root
 * cause questions it links to the kaizen register, and the page. Built from a small site laid out the way pages.yml lays
 * out _site, the repository's own kaizen register and a fake GitHub; nothing here reaches the network.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { FetchLike } from "../src/changes/github.ts";
import { fetchGithub, type GithubSnapshot, type WorkflowRun } from "../src/a3/github.ts";
import { VITAL_SHARE, buildA3, causeOf, duration, pareto, postDeployCause, stopCauses, subjectOf, type A3Inputs } from "../src/a3/model.ts";
import { readInputs } from "../src/a3/read.ts";
import { inlineMd, renderA3, safeHref } from "../src/a3/render.ts";
import { a3Command, UsageError } from "../src/local/cli.ts";
import { checkFiles } from "../src/why/command.ts";
import type { Artefact } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const NOW = new Date("2026-09-29T02:00:00Z");
const hunk = (id: string, artefact: Artefact, scope: string, summary: string, severity = "fail") => ({ id, artefact, scope, summary, severity });

const unclaimed = [
  ...["reader", "catalogue", "live", "time"].flatMap((app) => ["npm", "corepack", "yarn"].map((p) => hunk(`sbom:${app}/${p}`, "sbom", `${app}/${p}`, `${app}: package removed: ${p}@1.0.0`))),
  hunk("network:1", "network", "GET /_app/a.js", "reader:home: new request on b: GET /_app/a.js"),
  hunk("dom:1", "dom", "reader:home", "reader:home: semantic DOM differs (+47 −26 lines at line 4)")
];
const fixes = [hunk("axe:1", "axe", "reader-auth:sign-in", "reader-auth:sign-in: axe violation fixed on b: document-title (serious)", "info")];

/** A site as pages.yml lays out _site: one scored Main to RC forecast, one release candidate, one A/A night, the noise history. */
function site(): string {
  const root = mkdtempSync(join(tmpdir(), "harness-a3-"));
  const keep = (stream: string, id: string, entry: Record<string, unknown>, files: Record<string, unknown>) => {
    const dir = join(root, stream, "reports", id);
    mkdirSync(dir, { recursive: true });
    for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), JSON.stringify(body));
    writeFileSync(join(dir, "report.html"), "<p>report</p>");
    const index = join(root, stream, "reports", "index.json");
    writeFileSync(index, JSON.stringify({ runs: [{ id, files: [...Object.keys(files), "report.html"].map((f) => `${id}/${f}`), ...entry }] }));
  };
  const provenance = {
    a: { summary: "pulled+verified", images: { reader: { ref: "r:16.2.2", version: "16.2.2", revision: "caa53d0", created: "2026-09-19T18:07:41Z" } } },
    b: { summary: "pulled+verified", images: { reader: { ref: "r:sha-185e87f", version: "sha-185e87f", revision: "185e87f12d34", created: "2026-09-28T07:45:43Z" } } }
  };
  keep(
    "main-preview",
    "2026-09-28T08-59-53Z-release",
    { ranAt: "2026-09-28T08:59:53Z", verdict: "fail", reasons: [`${unclaimed.length} unclaimed diff(s)`, "1 claim(s) matched nothing and should be removed from the changelog"], harnessVersion: "1.13.2", runUrl: "https://github.com/x/y/actions/runs/1", sides: { a: { reader: "quay.io/t/tutors-reader:16.2.2" }, b: { reader: "quay.io/t/tutors-reader:sha-185e87f" } }, score: { score: 25, grade: "D" } },
    {
      "report.json": { ranAt: "2026-09-28T08:59:53Z", provenance, compare: { hunks: [...unclaimed, ...fixes], matches: [], unclaimed, staleClaims: [{ artefact: "axe", scope: "reader-auth:sign-in", reason: "Rule 0216" }], broadUnapproved: [] } },
      "confidence.json": {
        gate: "FAIL",
        rcs: null,
        band: null,
        note: "No RCS: Gate FAIL.",
        glance: [],
        run: { candidate: "sha-185e87f", baseline: "16.2.2", reports: {} },
        dimensions: [
          { id: "claim-coverage", name: "Claim coverage", weight: 20, status: "measured", score: 0, floorBreached: true, deductions: [{ points: 20, why: "unclaimed: dom", evidence: "report.html#hunk-dom:1" }], evidence: [] },
          { id: "change-risk", name: "Change risk", weight: 15, status: "measured", score: 20, floorBreached: true, deductions: [], evidence: [] },
          { id: "test-signal", name: "Test signal", weight: 15, status: "not measured", score: null, floorBreached: false, reason: "pass --test-signal", deductions: [], evidence: [] },
          { id: "statistical-margin", name: "Statistical margin", weight: 10, status: "measured", score: 100, floorBreached: false, deductions: [], evidence: [] }
        ]
      },
      "changes.json": {
        score: 20,
        refs: { a: "v16.2.2", b: "185e87f12d34" },
        prs: [
          { pr: 1, sha: "m1", reviewed: false, deductions: [{ points: 0, rule: "review", floor: true, why: "PR #1 was merged with no approving review" }, { points: 10, rule: "tests", why: "no tests" }] },
          { pr: 2, sha: "m2", reviewed: false, deductions: [{ points: 0, rule: "review", floor: true, why: "PR #2 was merged with no approving review" }] }
        ]
      }
    }
  );
  keep("release-records", "2026-09-27T16-11-58Z-release", { ranAt: "2026-09-27T16:11:58Z", verdict: "pass", reasons: ["every difference is claimed"], harnessVersion: "1.4.14", sides: { a: { reader: "r:16.2.2" }, b: { reader: "r:16.2.2" } } }, {});
  keep("noise", "2026-09-28T08-49-05Z-noise", { ranAt: "2026-09-28T08:49:05Z", verdict: "pass", reasons: ["A/A is clean"], harnessVersion: "1.13.2" }, {});
  mkdirSync(join(root, "noise"), { recursive: true });
  writeFileSync(
    join(root, "noise", "noise-history.json"),
    JSON.stringify({ entries: [{ ranAt: "2026-09-25T08:04:27Z", hunks: 0, degraded: [], harnessVersion: "1.4.1" }, { ranAt: "2026-09-27T13:59:55Z", hunks: 1, degraded: [], harnessVersion: "1.4.13" }, { ranAt: "2026-09-28T08:49:05Z", hunks: 0, degraded: [], harnessVersion: "1.13.2", masks: { total: 25, silent: 3 } }] })
  );
  return root;
}

const run = (o: Partial<WorkflowRun>): WorkflowRun => ({ id: 1, event: "schedule", conclusion: "success", createdAt: "2026-09-28T08:00:00Z", startedAt: "2026-09-28T08:00:00Z", updatedAt: "2026-09-28T08:10:00Z", url: "", headSha: "", ...o });

const github: GithubSnapshot = {
  schemaVersion: 1,
  fetchedAt: NOW.toISOString(),
  workflows: {
    "main-preview.yml": [run({ updatedAt: "2026-09-28T08:11:00Z" })],
    "release.yml": [run({ conclusion: "failure" }), run({})],
    "post-deploy.yml": [run({ id: 3, conclusion: "failure" }), run({ id: 4, conclusion: "failure" }), run({ id: 5, conclusion: "failure", createdAt: "2026-09-17T14:00:00Z" })]
  },
  postDeploySteps: [{ id: 3, step: "Post-deploy mode" }, { id: 4, step: "Fetch the recorded release run" }, { id: 5, step: null }],
  imageBuild: [run({ headSha: "185e87f12d34", startedAt: "2026-09-28T07:40:00Z", updatedAt: "2026-09-28T07:50:00Z" })],
  commits: { base: "v16.2.2", head: "185e87f12d34", baseDate: "2026-09-18T08:03:14Z", headDate: "2026-09-28T07:39:00Z", commits: [{ sha: "m1", date: "2026-09-19T02:00:00Z" }, { sha: "branch-only", date: "2026-08-01T00:00:00Z" }, { sha: "m2", date: "2026-09-28T07:39:00Z" }], total: 3 },
  rollbackIssues: [{ number: 38, title: "Rollback candidate", createdAt: "2026-09-27T16:21:57Z", url: "https://github.com/x/y/issues/38", comments: 7 }],
  errors: []
};

const inputs = (g?: GithubSnapshot): A3Inputs => ({ ...readInputs({ site: site(), kaizen: join(ROOT, "kaizen"), now: NOW, harness: "1.14.0" }), ...(g ? { github: g } : {}) });

describe("the Pareto", () => {
  it("marks as vital every cause up to and including the one that crosses 80%, and folds a long tail into one bar", () => {
    const counts = new Map(Object.entries({ a: 60, b: 25, c: 5, d: 4, e: 3, f: 1, g: 1, h: 1, i: 1 }).map(([k, v]) => [k, { value: v }]));
    const p = pareto({ id: "x", title: "x", unit: "n", counts, source: [], caption: () => "" });
    expect(VITAL_SHARE).toBe(0.8);
    expect(p.total).toBe(101);
    expect(p.bars.filter((b) => b.vital).map((b) => b.label)).toEqual(["a", "b"]);
    expect(p.vitalFew).toBe(2);
    expect(p.bars).toHaveLength(8);
    expect(p.bars.at(-1)!.label).toBe("everything else (2 causes)");
    expect(p.bars.at(-1)!.cumulative).toBe(1);
  });

  it("names a change by its kind, never by its page, package or numbers", () => {
    expect(causeOf(hunk("1", "sbom", "reader/@npmcli/agent", "reader: package removed: @npmcli/agent@3.0.0"))).toBe("sbom: package removed");
    expect(causeOf(hunk("2", "dom", "reader:home", "reader:home: semantic DOM differs (+47 −26 lines at line 4)"))).toBe("dom: semantic DOM differs");
    expect(causeOf(hunk("3", "screenshot", "reader:topic", "reader:topic: 0.60% of pixels differ (threshold 0.1%)"))).toBe("screenshot: N% of pixels differ");
    expect(subjectOf(hunk("4", "sbom", "live/npm", ""))).toBe("npm");
    expect(subjectOf(hunk("5", "dom", "reader:home", ""))).toBe("reader:home");
  });

  it("reads why a run stopped from its reasons, and why post-deploy went red from the step it stopped at", () => {
    expect(stopCauses({ verdict: "warn", reasons: ["advisory only: the last A/A run was degraded", "865 unclaimed diff(s)"] })).toEqual(["unclaimed differences"]);
    expect(stopCauses({ verdict: "warn", reasons: ['A/A is clean but DEGRADED, so it does not count: journey "x" failed on both sides'] })).toEqual(["A/A degraded: a journey saw nothing"]);
    expect(stopCauses({ verdict: "pass", reasons: ["every difference is claimed"] })).toEqual([]);
    expect(postDeployCause(null)).toBe("the workflow could not start");
    expect(postDeployCause("Fetch the recorded release run")).toBe("no recorded release to compare with");
    expect(postDeployCause("Post-deploy mode")).toBe("production differs from the recorded release");
  });
});

describe("the A3", () => {
  it("reads the Gate and the score from confidence.json and never makes an RCS up for a FAIL", () => {
    const a = buildA3(inputs(github));
    expect(a.score!.gate).toBe("FAIL");
    expect(a.score!.rcs).toBeNull();
    expect(a.score!.candidate).toBe("sha-185e87f");
    expect(a.score!.scorecard).toEqual({ score: 25, grade: "D" });
    expect(a.score!.lastRelease!.verdict).toBe("PASS");
    expect(a.score!.postDeploy).toMatchObject({ red: 3, runs: 3, issue: { number: 38 } });
    expect(a.goal.find((g) => g.metric === "Release Confidence Score")!.now).toBe("none (Gate wins)");
  });

  it("ranks the unclaimed differences so one removed tool reads as one cause, counted once per package", () => {
    const u = buildA3(inputs()).current.paretos.find((p) => p.id === "unclaimed")!;
    expect(u.total).toBe(14);
    expect(u.bars[0]).toMatchObject({ label: "sbom: package removed", value: 12, vital: true, note: "3 distinct, once in each of 4 images" });
    expect(u.caption).toContain("86%");
  });

  it("counts what is not measured as a ceiling, never as a score, in the confidence Pareto", () => {
    const c = buildA3(inputs()).current.paretos.find((p) => p.id === "confidence")!;
    expect(c.bars.find((b) => b.label === "Test signal (not measured)")).toMatchObject({ value: 15, unknown: true });
    expect(c.bars.find((b) => b.label === "Claim coverage")!.value).toBe(20);
    expect(c.bars.some((b) => b.label === "Statistical margin")).toBe(false);
  });

  it("maps the value stream from GitHub's runs: medians, first-pass yield, the andon, waits and a lead time from merges only", () => {
    const v = buildA3(inputs(github)).current.valueStream;
    const stage = (id: string) => v.stages.find((s) => s.id === id)!;
    expect(stage("forecast").processMs).toBe(11 * 60_000);
    expect(stage("gate").firstPass).toEqual({ green: 1, runs: 2 });
    expect(stage("verify").andon).toBe("red × 3");
    expect(stage("deploy").andon).toBe("not the gated build");
    expect(v.waits.find((w) => w.label === "merge to image build")!.ms).toBe(60_000);
    expect(v.waits.find((w) => w.label === "images ready to forecast")!.ms).toBe(Date.parse("2026-09-28T08:59:53Z") - Date.parse("2026-09-28T07:50:00Z"));
    // The branch-only commit of 1 August is not a merge to main: the lead time starts at PR #1's merge.
    expect(v.leadMs).toBe(NOW.getTime() - Date.parse("2026-09-19T02:00:00Z"));
    expect(v.flowEfficiency).toBeGreaterThan(0);
    expect(v.inventory.map((i) => i.count)).toEqual([2, 14, 3]);
  });

  it("says what it could not measure without GitHub, and makes nothing up", () => {
    const a = buildA3(inputs());
    expect(a.current.valueStream.leadMs).toBeNull();
    expect(a.current.valueStream.notMeasured.join(" ")).toContain("--fetch-github");
    expect(a.score!.postDeploy).toBeUndefined();
    expect(a.rca.find((q) => q.id === "flow")!.answer).toMatch(/^Not measured/);
    expect(a.sources.github).toContain("not read");
  });

  it("links each root cause question to the 5 Whys in the register that answers it, and says where the evidence stops for the rest", () => {
    const a = buildA3(inputs(github));
    const q = (id: string) => a.rca.find((r) => r.id === id)!;
    expect(q("gate").depth).toMatchObject({ kind: "5 whys", file: "2026-09-29-sha-185e87f-gate.md" });
    expect(q("post-deploy").depth).toMatchObject({ kind: "5 whys", file: "2026-09-29-16.2.2-rollback.md" });
    expect(q("decisions").depth).toMatchObject({ kind: "5 whys", file: "2026-09-29-sha-185e87f-fixed-on-b.md" });
    expect(q("decisions").answer).toContain("Decided: reader-auth:sign-in (document-title) by a changelog entry.");
    // A report written before 1.15.0 called the claim stale; it decides a fix, so it is not.
    expect(a.rca.find((r) => r.id === "stale-claims")).toBeUndefined();
    expect(q("change-risk").depth.kind).toBe("evidence stops");
    expect(q("aa").answer).toContain("older than 1.4.4");
    expect(a.fiveWhys.map((w) => w.file)).toEqual(["2026-09-29-sha-185e87f-gate.md", "2026-09-29-16.2.2-rollback.md", "2026-09-29-sha-185e87f-fixed-on-b.md"]);
    for (const w of a.fiveWhys) expect(w.whys.length).toBe(w.chainEndsAt);
    expect(a.countermeasures.map((c) => c.kind).sort()).toEqual(["SOP change", "claim guidance", "glance rule"]);
  });

  it("reads fixes on b as decisions: orange on the board, a row each with the claim that says why, by artefact", () => {
    const a = buildA3(inputs(github));
    expect(a.decisions).toMatchObject({ fixes: 1, pages: 1, decided: 1, byArtefact: [{ artefact: "axe", fixes: 1, decided: 1 }] });
    expect(a.decisions!.rows).toEqual([{ artefact: "axe", scope: "reader-auth:sign-in", what: ["document-title"], hunk: "main-preview/reports/2026-09-28T08-59-53Z-release/report.html#hunk-axe:1", state: "decided", why: "Rule 0216" }]);
    const html = renderA3(a);
    expect(html).toContain('class="decide-strip"');
    expect(html).toContain("100% decided");
    expect(html).toContain('<span class="chip decided">decided</span>');
  });

  it("carries only 5 Whys the register's own check accepts", () => {
    const results = checkFiles([join(ROOT, "kaizen")]);
    expect(results.length).toBeGreaterThanOrEqual(3);
    for (const r of results) expect(r.problems, r.file).toEqual([]);
  });

  it("says durations the way a person does", () => {
    expect(duration(null)).toBe("not measured");
    expect(duration(40_000)).toBe("40s");
    expect(duration(11 * 60_000)).toBe("11m");
    expect(duration(34 * 3600_000)).toBe("34h");
    expect(duration(9.3 * 86400_000)).toBe("9.3d");
  });
});

describe("the page", () => {
  const html = renderA3(buildA3(inputs(github)));

  it("is one self-contained sheet: the scoring on top, then the seven A3 blocks, the VSM and the 5 Whys", () => {
    expect(html).not.toMatch(/<script|<link[^>]+stylesheet|@import|https:\/\/fonts/);
    const order = ["Background", "Goal", "Current condition", "Root cause analysis", "Countermeasures", "Plan", "Follow-up", "The 5 Whys"].map((h) => html.indexOf(`</span>${h} `));
    for (const at of order) expect(at).toBeGreaterThan(0);
    expect(html.indexOf('aria-label="Final scoring"')).toBeLessThan(order[0]!);
    expect(html).toContain('aria-label="Value stream map');
    expect(html).toContain("@page{size:A3 landscape");
    expect(html).toContain("prefers-color-scheme:dark");
  });

  it("links only to https or inside the site, and escapes what a 5 Whys says", () => {
    expect(safeHref("https://github.com/x")).toBe("https://github.com/x");
    expect(safeHref("main-preview/reports/x/report.html#hunk-a")).toBe("main-preview/reports/x/report.html#hunk-a");
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("../../../etc/passwd")).toBeUndefined();
    expect(inlineMd("- **Gate:** `FAIL` [run](https://x.test/1) <b>x</b> [bad](javascript:void)")).toBe('<ul><li><strong>Gate:</strong> <code>FAIL</code> <a href="https://x.test/1">run</a> &lt;b&gt;x&lt;/b&gt; bad</li></ul>');
  });
});

describe("harness a3", () => {
  it("writes a3.html and a3.json into the site, and github.json when it asked GitHub", async () => {
    const root = site();
    const logs: string[] = [];
    const fetch: FetchLike = async (url) => ({ ok: !url.includes("tutors-mono-repo"), status: url.includes("tutors-mono-repo") ? 403 : 200, json: async () => (url.includes("/jobs") ? { jobs: [] } : url.includes("/issues") ? [] : { workflow_runs: [] }) });
    const code = await a3Command({ site: root, kaizen: join(ROOT, "kaizen"), "fetch-github": true }, { now: () => NOW, log: (m) => logs.push(m), fetch, env: {} });
    expect(code).toBe(0);
    const a = JSON.parse(readFileSync(join(root, "a3.json"), "utf8"));
    expect(a.score.gate).toBe("FAIL");
    expect(readFileSync(join(root, "a3.html"), "utf8")).toContain("A3 Aggregator");
    const g = JSON.parse(readFileSync(join(root, "github.json"), "utf8")) as GithubSnapshot;
    expect(g.errors.some((e) => e.includes("403") && e.includes("tutors-mono-repo"))).toBe(true);
    expect(logs.join("\n")).toContain("wrote");
  });

  it("needs --site, and one GitHub source at most", async () => {
    await expect(a3Command({})).rejects.toThrow(UsageError);
    await expect(a3Command({ site: "x", github: "g.json", "fetch-github": true })).rejects.toThrow(/give one/);
    await expect(a3Command({ site: join(tmpdir(), "no-such-site-a3") })).rejects.toThrow(/no site directory/);
  });
});

describe("the GitHub snapshot", () => {
  it("reads runs, the step each failed post-deploy stopped at, merge dates and the open rollback issue; a refusal is a line in errors", async () => {
    const calls: string[] = [];
    const fetch: FetchLike = async (url, init) => {
      calls.push(url);
      expect(init.headers.authorization).toBe("Bearer t");
      const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
      if (url.includes("post-deploy.yml/runs")) return ok({ workflow_runs: [{ id: 9, event: "schedule", conclusion: "failure", created_at: "a", run_started_at: "2026-09-28T01:00:00Z", updated_at: "2026-09-28T01:01:00Z", html_url: "u", head_sha: "h" }] });
      if (url.includes("/runs/9/jobs")) return ok({ jobs: [{ steps: [{ name: "Set up", conclusion: "success" }, { name: "Post-deploy mode", conclusion: "failure" }] }] });
      if (url.includes("image-build.yml")) return { ok: false, status: 403, json: async () => ({}) };
      if (url.includes("/compare/v16.2.2...")) return ok({ base_commit: { commit: { committer: { date: "2026-09-18T08:03:14Z" } } }, total_commits: 1, commits: [{ sha: "abc123", commit: { committer: { date: "2026-09-20T00:00:00Z" } } }] });
      if (url.includes("/issues")) return ok([{ number: 38, title: "Rollback", created_at: "2026-09-27T16:21:57Z", html_url: "i", comments: 7 }]);
      return ok({ workflow_runs: [] });
    };
    const g = await fetchGithub({ fetch, token: "t", now: NOW, production: "16.2.2", head: "abc123" });
    expect(g.workflows["post-deploy.yml"]![0]).toMatchObject({ id: 9, conclusion: "failure", headSha: "h" });
    expect(g.postDeploySteps).toEqual([{ id: 9, step: "Post-deploy mode" }]);
    expect(g.imageBuild).toBeUndefined();
    expect(g.errors).toEqual(["GitHub answered 403 for repos/tutors-sdk/tutors-mono-repo/actions/workflows/image-build.yml/runs"]);
    expect(g.commits).toMatchObject({ base: "v16.2.2", headDate: "2026-09-20T00:00:00Z", commits: [{ sha: "abc123", date: "2026-09-20T00:00:00Z" }] });
    expect(g.rollbackIssues![0]!.number).toBe(38);
    expect(calls.every((c) => c.startsWith("https://api.github.com/repos/tutors-sdk/"))).toBe(true);
  });
});
