/**
 * `harness changes`: every signal from a real (temporary) git repository, the plan's score effects, a first
 * contribution as a fact and not a penalty, review coverage without a token as "not measured", the orphan check's
 * sources, changes.json against its schema, and the score reading it. Nothing here touches the network: GitHub is a fake.
 */
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { beforeAll, describe, expect, it } from "vitest";
import { parseChangelog, parseToolingChangelog, sectionOf } from "../src/changes/changelog.ts";
import { runChanges } from "../src/changes/command.ts";
import { ChangesInputError, historyRanges, pullRequestOf, releaseTags, repoOf, resolveTag, versionOf, type ChangeFacts, type Unit } from "../src/changes/facts.ts";
import { githubReviews, readReviews, tokenFrom, type FetchLike } from "../src/changes/github.ts";
import { lockDelta, majorOf, parseLock } from "../src/changes/lock.ts";
import { headline, renderChangesBoard, renderChangesHtml, renderChangesMarkdown } from "../src/changes/render.ts";
import { computeChanges, evidenceFor, isProduction, isTest, median, testDeltaOf, type Changes } from "../src/changes/signals.ts";
import { UsageError, changesCommand } from "../src/local/cli.ts";
import { confidence } from "../src/score/confidence.ts";
import { parseChangeRisk, scoreInputs } from "../src/score/read.ts";
import { ADA, changesRepo, git } from "./support/changes-repo.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-changes-${name}-`));
const approvedBut = (...not: number[]) => ({ approved: async (pr: number) => !not.includes(pr) });
const line = (c: Changes, pr: number | null) => c.prs.find((p) => (pr === null ? p.direct : p.pr === pr))!;

let repo: string;
let c: Changes;
beforeAll(async () => {
  repo = changesRepo();
  c = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6 }, { env: {}, reviews: approvedBut(11) })).changes;
}, 30_000);

// ---- the release in the fixture ------------------------------------------------------------------------------

describe("the signals, from git log A..B in the monorepo checkout", () => {
  it("one line per first-parent commit: squash and merge PRs by number, a commit straight to main on its own line, the release branch as bookkeeping", () => {
    expect(c.refs).toEqual({ a: "v1.0.4", b: "v1.1.0" });
    expect(c.prs.map((p) => [p.pr, p.direct, p.release])).toEqual([
      [10, false, false],
      [11, false, false],
      [12, false, false],
      [null, true, false],
      [13, false, true]
    ]);
    expect(line(c, 11).title).toBe("fix(reader): hot path fixed");
    expect(line(c, 10).title).toBe("feat(reader): hot path faster");
    // history: the releases before A, newest first; the rc tag is not a release
    expect(c.history.releases).toEqual([
      { from: "v1.0.3", to: "v1.0.4" },
      { from: "v1.0.2", to: "v1.0.3" },
      { from: "v1.0.1", to: "v1.0.2" },
      { from: "v1.0.0", to: "v1.0.1" }
    ]);
  });

  it("churn: each app against its own median over the history; above 2x costs 5, on the PR with the most of it", () => {
    expect(c.signals.churn).toMatchObject({ status: "measured" });
    const apps = c.signals.churn.status === "measured" ? c.signals.churn.apps : [];
    expect(apps.find((a) => a.app === "reader")).toEqual({ app: "reader", churn: 23, median: 8, above: true, history: [8, 8, 8, 8] });
    // an app that never changed has a median of 0: nothing to be above
    expect(apps.find((a) => a.app === "live")).toMatchObject({ churn: 1, median: 0, above: false });
    expect(line(c, 10).deductions.find((d) => d.rule === "churn")).toMatchObject({ points: 5, pr: 10, file: "apps/reader/src/hot.ts", why: expect.stringContaining("reader churn 23 lines, above 2× its median of 8") });
  });

  it("hotspots: a file changed in 3+ of the history releases; −3 when touched, −10 when a first contribution touches it", () => {
    expect(c.signals.hotspots).toMatchObject({ status: "measured", files: [{ path: "apps/reader/src/hot.ts", releases: 4 }], touched: [{ path: "apps/reader/src/hot.ts", prs: [10, 11] }] });
    expect(line(c, 10).deductions.find((d) => d.rule === "hotspot")).toMatchObject({ points: 3, file: "apps/reader/src/hot.ts" });
    expect(line(c, 11).deductions.find((d) => d.rule === "hotspot")).toMatchObject({ points: 10, why: expect.stringContaining("PR #11, a first contribution, touches hotspot apps/reader/src/hot.ts (4 of the last 4 releases)") });
    expect(line(c, 11).hotspotsTouched).toEqual(["apps/reader/src/hot.ts"]);
  });

  it("ownership dispersion: a file with 3 authors costs 5, on the PR that brought the third", () => {
    expect(c.signals.ownership.files).toEqual([{ path: "packages/jsr/model/src/shared.ts", authors: 3, prs: [10, 11, 12] }]);
    expect(line(c, 12).deductions.find((d) => d.rule === "ownership")).toMatchObject({ points: 5, file: "packages/jsr/model/src/shared.ts" });
  });

  it("test delta: test lines ÷ production lines per package; root tests count for the PR's packages; below 0.2 costs 10", () => {
    expect(line(c, 10).testDelta).toEqual({ production: 21, tests: 12, ratio: 0.57, packages: [{ package: "apps/reader", production: 20, tests: 12, ratio: 0.6 }, { package: "packages/jsr/model", production: 1, tests: 12, ratio: 12 }] });
    expect(line(c, 10).deductions.some((d) => d.rule === "tests")).toBe(false);
    expect(line(c, 12).deductions.find((d) => d.rule === "tests")).toMatchObject({ points: 10, file: "packages/jsr/model/src/model.ts", why: "PR #12 changed 301 production lines in packages/jsr/model with 0 test lines (0.00): below 0.2" });
    expect(line(c, 13).testDelta.ratio).toBeNull(); // a release branch changes no production line
    expect(c.signals.tests.packages).toEqual([
      { package: "apps/reader", production: 23, tests: 12, ratio: 0.52, below: false },
      { package: "packages/jsr/model", production: 303, tests: 12, ratio: 0.04, below: true }
    ]);
  });

  it("orphans: a diff with no changelog entry, and an entry with no diff under its scope, −10 each; the release branch is not one", () => {
    expect(c.signals.orphans.diffs).toMatchObject({ status: "measured", source: "CHANGELOG.md at v1.1.0", items: [{ pr: null, title: "chore: tweak live", sections: ["Live"] }] });
    expect(c.signals.orphans.entries).toMatchObject({ status: "measured", items: [{ section: "Reader", entry: "A feature that never merged (PR #99)", prs: [99], why: "names PR #99, not merged between v1.0.4 and v1.1.0" }] });
    expect(line(c, null).deductions.find((d) => d.rule === "orphan")).toMatchObject({ points: 10, why: expect.stringMatching(/^commit [0-9a-f]{7} changed Live but no changelog entry under v1\.1\.0 names it$/) });
    // an entry no PR between the tags carries is the release's own line
    expect(c.changeRisk.deductions.filter((d) => d.pr === null && !d.commit)).toEqual([expect.objectContaining({ rule: "orphan", points: 10, file: "CHANGELOG.md", evidence: "CHANGELOG.md at v1.1.0" })]);
    expect(c.changeRisk.orphans).toBe(2);
  });

  it("review coverage: a PR with no approving review, and a commit straight to main, breach the floor and cost no points", () => {
    expect(c.signals.reviews).toMatchObject({ status: "measured", reviewed: [10, 12, 13], unreviewed: [11], unknown: [], direct: [expect.stringMatching(/^[0-9a-f]{7}$/)] });
    expect(line(c, 11).deductions.find((d) => d.rule === "review")).toEqual(expect.objectContaining({ points: 0, floor: true, why: "PR #11 was merged with no approving review" }));
    expect(line(c, null).deductions.find((d) => d.rule === "review")).toMatchObject({ points: 0, floor: true, why: expect.stringContaining("reached main without a pull request") });
    expect(line(c, null).reviewed).toBe(false);
    expect(c.floorBreached).toBe(true);
  });

  it("dependency movement: −5 per major bump of a direct dependency, on the PR that moved it; new packages listed", () => {
    expect(c.signals.dependencies).toEqual({ status: "measured", majorBumps: [{ kind: "major", name: "foo", importer: ".", from: "1.2.0", to: "2.0.1", pr: 12 }], newPackages: [{ kind: "new", name: "bar", importer: ".", to: "0.3.0", pr: 12 }] });
    expect(line(c, 12).deductions.find((d) => d.rule === "dependency")).toMatchObject({ points: 5, file: "pnpm-lock.yaml", why: "PR #12 moves foo 1.2.0 → 2.0.1 in the root: a major bump, ground the journeys may not cover" });
  });

  it("the plan's score effects: change risk is 100 minus the sum of every line's deductions, not an average", () => {
    expect(c.prs.map((p) => [p.pr, p.points])).toEqual([
      [10, 8],
      [11, 20],
      [12, 20],
      [null, 10],
      [13, 0]
    ]);
    expect(c.lost).toBe(68);
    expect(c.score).toBe(32);
    expect(c.changeRisk.score).toBe(32);
    expect(c.notMeasured).toEqual([]);
  });
});

describe("guardrails: explainable line by line, and never about the person", () => {
  it("every deduction names its PR (or commit) and file, keeps the author as a fact field, and never puts the author in why", () => {
    for (const d of c.changeRisk.deductions) {
      expect(d.why, d.why).not.toMatch(/Ada|Bob|Newbie|example\.org/);
      if (d.pr !== null) expect(d.why).toContain(`PR #${d.pr}`);
      if (d.commit) expect(d.why).toContain(d.commit.slice(0, 7));
      if (d.rule !== "review") expect(d.file, d.why).toBeTruthy();
    }
    expect(line(c, 11).deductions.every((d) => d.author === "Newbie")).toBe(true);
    expect(line(c, 11).author).toBe("Newbie");
  });

  it("a first contribution is a fact: flagged, and nothing on its own", () => {
    expect(c.prs.filter((p) => p.firstContribution).map((p) => p.pr)).toEqual([11]);
    const first = unit(20, { firstContribution: true, files: [f("apps/reader/src/new.ts", 10), f("apps/reader/src/new.test.ts", 10)] });
    const x = computeChanges(facts([first]), { reviews: allReviewed([20]) });
    expect(x.prs[0]).toMatchObject({ firstContribution: true, points: 0, deductions: [] });
    expect(x.score).toBe(100);
  });

  it("the penalty lands only when a first contribution meets a hotspot (10, not 3) or lacks tests (the 10 anyone's would)", () => {
    const history = [1, 2, 3].map((n) => ({ from: `v1.0.${n - 1}`, to: `v1.0.${n}`, files: [f("apps/reader/src/hot.ts", 4)] }));
    const mk = (first: boolean) => computeChanges(facts([unit(20, { firstContribution: first, files: [f("apps/reader/src/hot.ts", 1), f("tests/x.test.ts", 1)] })], { history }), { reviews: allReviewed([20]) });
    expect(mk(false).prs[0]!.deductions.map((d) => [d.rule, d.points])).toEqual([["hotspot", 3]]);
    expect(mk(true).prs[0]!.deductions.map((d) => [d.rule, d.points])).toEqual([["hotspot", 10]]);
    const untested = (first: boolean) => computeChanges(facts([unit(21, { firstContribution: first, files: [f("apps/live/src/x.ts", 50)] })]), { reviews: allReviewed([21]) }).prs[0]!.points;
    expect(untested(true)).toBe(10);
    expect(untested(false)).toBe(10);
  });

  it("the report's table has no author column and says a first contribution is a fact", () => {
    for (const text of [renderChangesMarkdown(c), renderChangesHtml(c), renderChangesBoard(c)]) {
      expect(text).not.toMatch(/Ada|Bob|Newbie|example\.org/);
      expect(text).toContain("a first contribution is a fact and costs nothing on its own");
    }
  });

  it("links go to the exact file in the PR's diff on GitHub (its sha256 anchor), or name the PR and file without a GitHub remote", () => {
    expect(evidenceFor("o/r", { pr: 7, sha: "abc" }, "a.ts")).toBe(`https://github.com/o/r/pull/7/files#diff-${sha256("a.ts")}`);
    expect(evidenceFor("o/r", { pr: null, sha: "abcdef0123" }, "a.ts")).toBe(`https://github.com/o/r/commit/abcdef0123#diff-${sha256("a.ts")}`);
    expect(evidenceFor(undefined, { pr: 7, sha: "abc" }, "a.ts")).toBe("PR #7 a.ts");
    expect(repoOf("git@github.com:tutors-sdk/tutors-mono-repo.git")).toBe("tutors-sdk/tutors-mono-repo");
    expect(repoOf("https://github.com/tutors-sdk/tutors-mono-repo")).toBe("tutors-sdk/tutors-mono-repo");
    expect(repoOf("https://gitlab.com/x/y")).toBeUndefined();
  });
});

// ---- not measured, never clean ------------------------------------------------------------------------------

describe("what cannot be read is not measured, never scored clean", () => {
  it("no GITHUB_TOKEN or GH_TOKEN: review coverage is not measured and no PR is called reviewed; a commit straight to main still breaches", async () => {
    const x = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6 }, { env: {} })).changes;
    expect(x.signals.reviews).toMatchObject({ status: "not measured", reason: "no GITHUB_TOKEN or GH_TOKEN, so no PR's reviews could be read" });
    expect(x.prs.filter((p) => !p.direct).every((p) => p.reviewed === null)).toBe(true);
    expect(x.changeRisk.deductions.filter((d) => d.rule === "review").map((d) => d.pr)).toEqual([null]);
    expect(x.notMeasured).toEqual([{ signal: "review coverage", reason: "no GITHUB_TOKEN or GH_TOKEN, so no PR's reviews could be read" }]);
    expect(x.changeRisk.gaps).toEqual(["review coverage: no GITHUB_TOKEN or GH_TOKEN, so no PR's reviews could be read"]);
    // a token with no GitHub remote says so
    const y = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6 }, { env: { GH_TOKEN: "t" } })).changes;
    expect(y.signals.reviews).toMatchObject({ status: "not measured", reason: "the monorepo checkout's origin is not a GitHub repository" });
  });

  it("a PR GitHub cannot answer for is unknown, named, and not counted as reviewed", async () => {
    const x = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6 }, { env: {}, reviews: { approved: async (pr) => (pr === 12 ? Promise.reject(new Error("GitHub answered 502 for the reviews of PR #12")) : true) } })).changes;
    expect(x.signals.reviews).toMatchObject({ unknown: [12], problems: ["GitHub answered 502 for the reviews of PR #12"] });
    expect(line(x, 12).reviewed).toBeNull();
    expect(x.notMeasured.map((n) => n.signal)).toEqual(["review coverage"]);
  });

  it("the REST source reads GET /repos/{repo}/pulls/{n}/reviews with the token; GITHUB_TOKEN first, then GH_TOKEN", async () => {
    const seen: string[] = [];
    const fetch: FetchLike = async (url, init) => {
      seen.push(`${url} ${init.headers.authorization}`);
      const n = Number(/pulls\/(\d+)/.exec(url)![1]);
      return n === 3 ? { ok: false, status: 404, json: async () => ({}) } : { ok: true, status: 200, json: async () => (n === 1 ? [{ state: "COMMENTED" }, { state: "APPROVED" }] : [{ state: "CHANGES_REQUESTED" }]) };
    };
    const r = await readReviews(githubReviews({ token: "tok", repo: "o/r", fetch }), [1, 2, 3]);
    expect(r).toEqual({ status: "measured", approved: new Map([[1, true], [2, false], [3, null]]), problems: ["GitHub answered 404 for the reviews of PR #3"] });
    expect(seen[0]).toBe("https://api.github.com/repos/o/r/pulls/1/reviews?per_page=100 Bearer tok");
    expect(tokenFrom({ GITHUB_TOKEN: "a", GH_TOKEN: "b" })).toBe("a");
    expect(tokenFrom({ GH_TOKEN: "b" })).toBe("b");
    expect(tokenFrom({})).toBeUndefined();
  });

  it("no CHANGELOG.md entries for the version and no --changelog: the orphan check is not measured, and costs nothing", () => {
    const x = computeChanges(facts([unit(20, { files: [f("apps/reader/src/a.ts", 1), f("tests/a.test.ts", 1)] })], { changelog: "# Changelog\n\n## Reader\n\n### v1.0.0\n\n- old (PR #1)\n" }), { reviews: allReviewed([20]) });
    expect(x.signals.orphans.diffs).toEqual({ status: "not measured", reason: 'CHANGELOG.md at v1.1.0 has no "### v1.1.0" entries under a product section, and no --changelog (pnpm release:changelog --json) was given' });
    expect(x.signals.orphans.entries.status).toBe("not measured");
    expect(x.score).toBe(100);
    expect(x.notMeasured.map((n) => n.signal)).toEqual(["churn", "hotspots", "orphan diffs (a diff with no changelog entry)", "orphan entries (a changelog entry with no diff)"]);
  });

  it("no history: churn and hotspots are not measured; fewer than 3 releases: hotspots are not", () => {
    const none = computeChanges(facts([unit(20)]), { reviews: allReviewed([20]) });
    expect(none.signals.churn).toMatchObject({ status: "not measured" });
    expect(none.signals.hotspots).toMatchObject({ status: "not measured", reason: "only 0 releases of history before v1.0.0; a hotspot is a file changed in 3 of them" });
    const two = computeChanges(facts([unit(20)], { history: [{ from: "a", to: "b", files: [] }, { from: "c", to: "a", files: [] }] }), { reviews: allReviewed([20]) });
    expect(two.signals.churn.status).toBe("measured");
    expect(two.signals.hotspots.status).toBe("not measured");
  });

  it("no pnpm-lock.yaml on a side: dependency movement is not measured", () => {
    const { deps: _, ...rest } = facts([unit(20)]);
    expect(computeChanges(rest, { reviews: allReviewed([20]) }).signals.dependencies).toEqual({ status: "not measured", reason: "pnpm-lock.yaml is missing at v1.0.0 or v1.1.0" });
  });
});

// ---- the sources ---------------------------------------------------------------------------------------------

describe("the orphan check's sources", () => {
  it("CHANGELOG.md: the entries under ### v<version> in each product section, with the PRs they name", () => {
    const p = parseChangelog("## Reader (`tutors-reader`)\n\n### v1.1.0 (2026-09)\n\n- A (PR #10)\n  continued\n- B (#11) and (PR #12)\n\n### v1.0.0\n\n- old (PR #1)\n\n## Pre-Monorepo History\n\n### v1.1.0\n\n- not a product section (PR #5)\n", "1.1.0");
    expect(p.found).toBe(true);
    expect(p.entries).toEqual([
      { section: "Reader", text: "A (PR #10)", prs: [10] },
      { section: "Reader", text: "B (#11) and (PR #12)", prs: [11, 12] }
    ]);
    expect([...p.named]).toEqual([10, 11, 12]);
    expect(parseChangelog("## Reader\n\n### v1.1.0-rc.1\n", "1.1.0").found).toBe(false);
  });

  it("the monorepo's sections by path: the Svelte packages ship in the reader; tests, scripts and guides need no entry", () => {
    expect(sectionOf("packages/svelte/course/src/x.ts")).toBe("Reader");
    expect(sectionOf("packages/jsr/model/src/x.ts")).toBe("Shared Packages");
    expect(sectionOf("deploy/k8s/x.yaml")).toBe("Infrastructure");
    expect(sectionOf("tests/unit/x.test.ts")).toBeUndefined();
    expect(sectionOf(".github/workflows/nightly.yml")).toBeUndefined();
  });

  it("an Infrastructure entry is satisfied by CI, tests or guides (CHANGELOG.md has no Development section)", () => {
    const x = computeChanges(facts([unit(20, { files: [f("guides/TESTING.md", 5)] })], { changelog: "## Infrastructure\n\n### v1.1.0\n\n- Testing guides rewritten (PR #20)\n" }), { reviews: allReviewed([20]) });
    expect(x.signals.orphans.entries).toEqual({ status: "measured", items: [] });
  });

  it("--changelog, the output of pnpm release:changelog --json: a PR it marks not curated is an orphan diff", async () => {
    const file = join(tmp("tooling"), "changelog.json");
    writeFileSync(file, JSON.stringify({ version: 1, from: "v1.0.4", to: "v1.1.0", entries: [{ pr: 12, sha: "abc1234", title: "The model grows", sections: ["Shared Packages"], curated: false }, { pr: 10, sha: "def5678", title: "x", sections: ["Reader"], curated: true }, { pr: 14, sha: "0000000", title: "tests", sections: ["Development"], curated: false }] }));
    const x = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6, changelog: file }, { env: {}, reviews: approvedBut() })).changes;
    expect(x.signals.orphans.diffs).toMatchObject({ status: "measured", source: "pnpm release:changelog --json", items: [{ pr: 12 }] });
    expect(line(x, 12).deductions.some((d) => d.rule === "orphan")).toBe(true);
    expect(line(x, null).deductions.some((d) => d.rule === "orphan")).toBe(false);
    expect(parseToolingChangelog({ version: 2, entries: [] })).toMatch(/release:changelog --json/);
    writeFileSync(file, "{");
    await expect(runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 6, changelog: file }, { env: {}, reviews: approvedBut() })).rejects.toThrow(ChangesInputError);
  });

  it("pnpm-lock.yaml: the direct dependencies of each importer; a major is the first non-zero part (0.3 -> 0.4 is one)", () => {
    const lock = (v: string, extra = "") => `lockfileVersion: '9.0'\n\nimporters:\n\n  .:\n    devDependencies:\n      '@x/y':\n        specifier: ^${v}\n        version: ${v}(peer@1.0.0)\n${extra}\n  apps/reader:\n    dependencies:\n      local:\n        specifier: workspace:*\n        version: link:../../packages/local\n\npackages:\n\n  '@x/y@${v}':\n    resolution: {}\n`;
    const a = parseLock(lock("0.3.1"));
    expect([...a.get(".")!]).toEqual([["@x/y", "0.3.1"]]);
    expect(a.get("apps/reader")!.size).toBe(0);
    expect(lockDelta(a, parseLock(lock("0.4.0", "      z:\n        specifier: 1.0.0\n        version: 1.0.0\n")))).toEqual([
      { kind: "major", name: "@x/y", importer: ".", from: "0.3.1", to: "0.4.0" },
      { kind: "new", name: "z", importer: ".", to: "1.0.0" }
    ]);
    expect(lockDelta(a, parseLock(lock("0.3.9")))).toEqual([]);
    expect(majorOf("2.1.0")).toBe("2");
    expect(majorOf("0.9.1")).toBe("0.9");
  });
});

describe("tags and PRs", () => {
  it("a harness tag finds the monorepo's v-tag; one it does not have is an input error", () => {
    const g = (args: string[]) => git(repo, args);
    expect(resolveTag(g, "1.0.4")).toBe("v1.0.4");
    expect(resolveTag(g, "v1.0.4")).toBe("v1.0.4");
    expect(() => resolveTag(g, "9.9.9")).toThrow(ChangesInputError);
  });

  it("history: plain X.Y.Z tags only, in semver order, the n before A; an rc A ends at the release below it", () => {
    const tags = ["v1.0.0", "v2.0.0-runes", "v1.10.0", "v1.9.0", "v1.10.1-rc.1", "junk", "v1.2.0"];
    expect(releaseTags(tags)).toEqual(["v1.0.0", "v1.2.0", "v1.9.0", "v1.10.0"]);
    expect(historyRanges(tags, "v1.10.0", 2)).toEqual([
      { from: "v1.9.0", to: "v1.10.0" },
      { from: "v1.2.0", to: "v1.9.0" }
    ]);
    expect(historyRanges(tags, "v1.10.1-rc.1", 1)).toEqual([{ from: "v1.9.0", to: "v1.10.0" }]);
    expect(versionOf("16.3.0-rc.1")).toEqual({ core: [16, 3, 0], pre: "rc.1" });
  });

  it("squash (#N), Merge pull request #N (title from the body), a release/* branch, and a commit with neither", () => {
    expect(pullRequestOf("fix: x (#12)", "")).toEqual({ pr: 12, title: "fix: x", release: false });
    expect(pullRequestOf("Merge pull request #263 from tutors-sdk/fix/card", "\nfix(reader): cards\n")).toEqual({ pr: 263, title: "fix(reader): cards", release: false });
    expect(pullRequestOf("Merge pull request #264 from tutors-sdk/release/16.2.2", "Release 16.2.2")).toMatchObject({ pr: 264, release: true });
    expect(pullRequestOf("chore: version bumps", "")).toEqual({ pr: null, title: "chore: version bumps", release: false });
  });

  it("what a path is: tests (in a package or at the root), production code in a package, and neither", () => {
    expect(isTest("tests/unit/a.test.ts")).toBe(true);
    expect(isTest("apps/reader/src/lib/a.spec.ts")).toBe(true);
    expect(isTest("tests/contract/__snapshots__/x.snap")).toBe(true);
    expect(isProduction("apps/reader/src/lib/a.svelte")).toBe(true);
    expect(isProduction("apps/reader/package.json")).toBe(false);
    expect(isProduction("scripts/x.ts")).toBe(false);
    expect(isProduction("packages/svelte/utils/i18n/src/messages/de.ts")).toBe(true);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(testDeltaOf([f("apps/a/x.ts", 10), f("tests/t.test.ts", 1)]).packages).toEqual([{ package: "apps/a", production: 10, tests: 1, ratio: 0.1 }]);
  });
});

// ---- rendering: one risky PR reads as one risky PR -------------------------------------------------------------

describe("the per-PR table", () => {
  it("six clean PRs and one risky one read as one risky PR: one row for it, one folded row for the rest", () => {
    const clean = [30, 31, 32, 33, 34, 35].map((n) => unit(n, { files: [f(`apps/reader/src/c${n}.ts`, 2), f(`apps/reader/src/c${n}.test.ts`, 2)] }));
    const risky = unit(36, { files: [f("apps/reader/src/big.ts", 400)] });
    const x = computeChanges(facts([...clean, risky]), { reviews: allReviewed([30, 31, 32, 33, 34, 35, 36]) });
    const md = renderChangesMarkdown(x);
    const rows = md.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| PR") && !l.startsWith("| ---"));
    expect(rows).toHaveLength(2);
    expect(rows[0]!.startsWith("| #36 | PR 36 | 400 | 1 | 0 | 0.00 | yes |  | **−10** |")).toBe(true);
    expect(rows[1]).toMatch(/^\| 6 more \| no deductions: #30, #31, #32, #33, #34, #35 \|/);
    expect(headline(x)).toBe("Change risk 90 (100 − 10), v1.0.0..v1.1.0: 1 of 7 PRs carry a finding.");
    expect(renderChangesHtml(x)).toContain('<tr class="seam"><td>6 more</td>');
  });

  it("the board: the headline, risky lines first, where the points went, the release signals, what was not measured", () => {
    const text = renderChangesBoard(c, "/o/changes.json");
    const lines = text.split("\n");
    expect(lines[0]).toBe("Change risk 32 (100 − 68), v1.0.4..v1.1.0: 4 of 5 changes (4 PRs, 1 direct commit) carry a finding, and 1 finding(s) no PR carries; floor breached (caps the RCS at 74).");
    expect(text.indexOf("#11 ")).toBeLessThan(text.indexOf("#10 "));
    expect(text).toContain("Where the points went, most first:");
    expect(text).toContain("reviews: 3 approved, 1 not; 1 commit(s) straight to main");
    expect(text).toContain("Advisory: never changes a verdict or an exit code.");
    expect(lines.at(-1)).toBe("changes.json: /o/changes.json");
  });
});

// ---- changes.json, the command, and the score reading it ---------------------------------------------------------

const schema = JSON.parse(readFileSync(resolve(ROOT, "docs/contract/changes.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true }).compile(schema);

describe("changes.json and harness changes", () => {
  it("matches its schema, measured or not", async () => {
    const none = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: 2 }, { env: {} })).changes;
    for (const x of [c, none, computeChanges(facts([unit(1)]), { reviews: { status: "not measured", reason: "r" } })]) {
      validate(JSON.parse(JSON.stringify(x)));
      expect(validate.errors ?? []).toEqual([]);
    }
  });

  it("--out writes changes.json; --json prints it; HARNESS_MONOREPO_DIR stands in for --monorepo; exit 0 whatever it found", async () => {
    const out = join(tmp("out"), "sub", "changes.json");
    const logged: string[] = [];
    expect(await changesCommand({ a: "1.0.4", b: "1.1.0", out, json: true }, { env: { HARNESS_MONOREPO_DIR: repo }, reviews: approvedBut(11), log: (m) => logged.push(m) })).toBe(0);
    const written = JSON.parse(readFileSync(out, "utf8")) as Changes;
    expect(written.score).toBe(32);
    expect(written.harness?.contractVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(JSON.parse(logged[0]!).score).toBe(32);
    const board: string[] = [];
    await changesCommand({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: "3" }, { env: {}, log: (m) => board.push(m) });
    expect(board[0]).toContain("history: 3 release(s), v1.0.1..v1.0.4");
  });

  it("what it cannot read is a usage error (exit 2): no tags, no checkout, a tag the monorepo lacks, a bad --history", async () => {
    await expect(changesCommand({ a: "1.0.4" }, { env: {} })).rejects.toThrow(UsageError);
    await expect(changesCommand({ a: "1.0.4", b: "1.1.0" }, { env: {} })).rejects.toThrow(/--monorepo <dir> or set HARNESS_MONOREPO_DIR/);
    await expect(changesCommand({ a: "1.0.4", b: "1.1.0", monorepo: tmp("empty") }, { env: {} })).rejects.toThrow(/is not a git checkout/);
    await expect(changesCommand({ a: "1.0.4", b: "7.0.0", monorepo: repo }, { env: {} })).rejects.toThrow(/has no tag 7\.0\.0/);
    await expect(changesCommand({ a: "1.0.4", b: "1.1.0", monorepo: repo, history: "0" }, { env: {} })).rejects.toThrow(/--history takes a whole number, 1 or more/);
  });
});

describe("the score reads changes.json as its change risk", () => {
  it("the deductions as harness changes made them, summed; the floor; the gaps; the evidence named as the file read", () => {
    const dir = tmp("score");
    const file = join(dir, "changes.json");
    writeFileSync(file, JSON.stringify(c));
    const i = scoreInputs({ outDir: dir, changeRisk: file, gate: "PASS" });
    const conf = confidence(i);
    const d = conf.dimensions.find((x) => x.id === "change-risk")!;
    expect(d).toMatchObject({ status: "measured", score: 32, floorBreached: true, evidence: ["changes.json"] });
    expect(d.deductions).toHaveLength(c.changeRisk.deductions.length);
    expect(d.deductions.find((x) => x.points === 0)).toMatchObject({ floor: true, why: "PR #11 was merged with no approving review" });
    expect(conf.run.inputs).toEqual({ changeRisk: "changes.json" });
    // the orphans are a traceability floor signal: named in its reason while it is not measured
    expect(conf.dimensions.find((x) => x.id === "traceability")!.reason).toContain("already reports 2 orphan changes");
  });

  it("with --traceability too, the orphans breach its floor, at no points of their own", () => {
    const dir = tmp("trace");
    writeFileSync(join(dir, "changes.json"), JSON.stringify(c));
    writeFileSync(join(dir, "t.json"), JSON.stringify({ entries: [{ entry: "x", ears: "a.feature", claimed: true }] }));
    const t = confidence(scoreInputs({ outDir: dir, changeRisk: join(dir, "changes.json"), traceability: join(dir, "t.json"), gate: "PASS" })).dimensions.find((x) => x.id === "traceability")!;
    expect(t).toMatchObject({ score: 100, floorBreached: true, deductions: [{ points: 0, floor: true, evidence: "changes.json", why: expect.stringContaining("2 orphan changes between the tags") }] });
  });

  it("the 1.9.0 shape is still read: reviewed may be null (unknown, a gap, no floor); hotspots by the plan's points", () => {
    const r = parseChangeRisk({ prs: [{ number: 1, reviewed: null, firstTimeContributor: true, hotspots: ["a.ts"] }, { number: 2, reviewed: true, hotspots: ["b.ts"] }] }, "c.json");
    const dir = tmp("legacy");
    writeFileSync(join(dir, "c.json"), JSON.stringify(r));
    const d = confidence(scoreInputs({ outDir: dir, changeRisk: join(dir, "c.json"), gate: "PASS" })).dimensions.find((x) => x.id === "change-risk")!;
    expect(d.deductions.map((x) => x.points)).toEqual([10, 3]);
    expect(d.floorBreached).toBe(false);
    expect(d.gaps).toContain("review coverage of PR #1 (not known)");
    expect(() => parseChangeRisk({ changeRisk: { prs: [], deductions: [{ points: -1, why: "x", evidence: "y" }] } }, "c.json")).toThrow(/"deductions" must be/);
  });
});

// ---- helpers ---------------------------------------------------------------------------------------------------

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

function f(path: string, added: number, deleted = 0) {
  return { path, added, deleted };
}

function unit(pr: number, o: Partial<Unit> = {}): Unit {
  return { sha: String(pr).padStart(40, "0"), pr, title: `PR ${pr}`, release: false, author: ADA, files: [], commits: [], firstContribution: false, deps: [], ...o };
}

function facts(units: Unit[], o: Partial<ChangeFacts> = {}): ChangeFacts {
  return { a: "1.0.0", b: "1.1.0", refs: { a: "v1.0.0", b: "v1.1.0" }, version: "1.1.0", units, net: units.flatMap((u) => u.files), history: [], historyAsked: 6, deps: [], ...o };
}

function allReviewed(prs: number[]) {
  return { status: "measured" as const, approved: new Map<number, boolean | null>(prs.map((n) => [n, true])), problems: [] };
}
