/**
 * The release-size control chart on the readiness page (since 1.19.0): the XmR maths against hand-computed cases, the WIP
 * zones at their boundaries, provisional limits, an empty history, the release history read from GitHub through a fake,
 * and the page and readiness.json it writes. Nothing here reaches the network.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import type { FetchLike } from "../src/changes/github.ts";
import { readinessCommand, UsageError } from "../src/local/cli.ts";
import { buildControl, specialCause, wipLimitOf, wipZone, xmr, type XmrLimits } from "../src/readiness/control.ts";
import { controlHtml, niceMax } from "../src/readiness/control-render.ts";
import { readForecasts, readReleaseHistory } from "../src/readiness/read.ts";
import { fetchReleaseHistory, firstParentPrs, parseReleaseHistory, releasePairs, releaseTags, tipOf, type CompareCommit, type ReleaseHistory } from "../src/readiness/releases.ts";

const ROOT = resolve(import.meta.dirname, "..");
const NOW = new Date("2026-10-01T06:00:00Z");

const history = (sizes: number[], unreleased?: number): ReleaseHistory => ({
  schemaVersion: 1,
  fetchedAt: "2026-10-01T05:00:00Z",
  repo: "tutors-sdk/tutors-mono-repo",
  releases: sizes.map((prs, i) => ({ tag: `v16.${i + 1}.0`, previous: `v16.${i}.0`, sha: `${i}`.padStart(40, "a"), releasedAt: `2026-09-${String(i + 1).padStart(2, "0")}T08:00:00Z`, prs })),
  ...(unreleased === undefined ? {} : { unreleased: { base: `v16.${sizes.length}.0`, head: "b".repeat(40), headDate: "2026-09-30T11:00:00Z", prs: unreleased } }),
  errors: []
});

describe("the XmR limits", () => {
  it("match a hand-computed case: the monorepo's six releases v16.1.5 to v16.2.2", () => {
    // 6, 1, 8, 5, 11, 4: mean 35/6 = 5.833; moving ranges 5, 7, 3, 6, 7, mean 28/5 = 5.6;
    // UCL = 5.833 + 2.66 × 5.6 = 20.729; LCL = 5.833 − 14.896 < 0, so 0.
    expect(xmr([6, 1, 8, 5, 11, 4])).toEqual({ n: 6, centre: 5.83, mrBar: 5.6, ucl: 20.73, lcl: 0, provisional: true });
  });

  it("match a hand-computed case with a positive LCL, and stop being provisional at ten releases", () => {
    // 10 12 11 13 9 10 12 11 10 12: mean 110/10 = 11; ranges 2 1 2 4 1 2 1 1 2 = 16, /9 = 1.778;
    // UCL = 11 + 2.66 × 1.778 = 15.73; LCL = 11 − 4.73 = 6.27.
    expect(xmr([10, 12, 11, 13, 9, 10, 12, 11, 10, 12])).toEqual({ n: 10, centre: 11, mrBar: 1.78, ucl: 15.73, lcl: 6.27, provisional: false });
    expect(xmr([10, 12, 11, 13, 9, 10, 12, 11, 10])!.provisional).toBe(true);
  });

  it("need two releases: none or one has no moving range; two equal releases have zero-width limits", () => {
    expect(xmr([])).toBeNull();
    expect(xmr([7])).toBeNull();
    expect(xmr([5, 5])).toEqual({ n: 2, centre: 5, mrBar: 0, ucl: 5, lcl: 5, provisional: true });
  });

  it("flag a release outside them as a special cause, and nothing on the limit itself", () => {
    const l: XmrLimits = { n: 12, centre: 10, mrBar: 3, ucl: 18, lcl: 2, provisional: false };
    expect(specialCause(19, l)).toBe("above UCL");
    expect(specialCause(18, l)).toBeNull();
    expect(specialCause(2, l)).toBeNull();
    expect(specialCause(1, l)).toBe("below LCL");
    expect(specialCause(50, null)).toBeNull();
  });
});

describe("the WIP limit", () => {
  const settled: XmrLimits = { n: 12, centre: 10, mrBar: 3.76, ucl: 20, lcl: 0, provisional: false };
  const provisional: XmrLimits = { ...settled, n: 6, provisional: true };

  it("is the UCL once settled, the centre line while provisional", () => {
    expect(wipLimitOf(settled)).toBe(20);
    expect(wipLimitOf(provisional)).toBe(10);
  });

  it("has three zones, each named in words: at the boundaries the lower zone holds", () => {
    expect(wipZone(0, settled)).toMatchObject({ zone: "below centre", tone: "green", label: "Below the centre line" });
    expect(wipZone(10, settled).zone).toBe("below centre");
    expect(wipZone(11, settled)).toMatchObject({ zone: "release soon", tone: "amber", label: "A good time to release" });
    expect(wipZone(20, settled).zone).toBe("release soon");
    expect(wipZone(21, settled)).toMatchObject({ zone: "release now", tone: "red", label: "Release now" });
    expect(wipZone(21, settled).words).toContain("UCL 20");
  });

  it("while provisional, goes straight from below the centre line to release now", () => {
    expect(wipZone(10, provisional).zone).toBe("below centre");
    expect(wipZone(11, provisional).zone).toBe("release now");
    expect(wipZone(11, provisional).words).toContain("the centre line, 10, while the limits are provisional");
  });
});

describe("the control block", () => {
  const forecast = (ranAt: string, prs: number, candidate = "sha-865d02f") => ({ ranAt, prs, baseline: "16.2.2", candidate, head: null });

  it("with no history and nothing kept: no limits, no current batch, and says so", () => {
    const c = buildControl({ source: "not read (no releases.json)", forecasts: [] });
    expect(c).toMatchObject({ releases: [], limits: null, wipLimit: null, current: null, nights: [] });
    expect(c.summary).toBe("No release history read: no limits yet.");
    const html = controlHtml(c);
    expect(html).toContain("Not counted");
    expect(html).toContain("not read (no releases.json)");
    expect(html).not.toContain("<svg");
  });

  it("reads the batch on main from GitHub when it was read, the newest forecast otherwise", () => {
    const fromGithub = buildControl({ history: history([6, 1, 8, 5, 11, 4], 68), source: "read", forecasts: [forecast("2026-09-30T08:52:00Z", 67)] });
    expect(fromGithub.current).toMatchObject({ prs: 68, since: "v16.6.0", from: "github", special: "above UCL", zone: { zone: "release now" } });
    expect(fromGithub.wipLimit).toBe(5.83);
    expect(fromGithub.summary).toContain("Limits provisional: 6 releases measured, 10 needed.");
    const fromForecast = buildControl({ history: history([6, 1, 8, 5, 11, 4]), source: "read", forecasts: [forecast("2026-09-29T08:48:00Z", 65), forecast("2026-09-30T08:52:00Z", 67)] });
    expect(fromForecast.current).toMatchObject({ prs: 67, since: "16.2.2", from: "forecast" });
  });

  it("keeps the newest forecast of each night, oldest night first, each with its zone", () => {
    const c = buildControl({ history: history([10, 12, 11, 13, 9, 10, 12, 11, 10, 12]), source: "read", forecasts: [forecast("2026-09-28T08:59:00Z", 14), forecast("2026-09-28T03:45:00Z", 11), forecast("2026-09-27T09:00:00Z", 9)] });
    expect(c.nights.map((n) => [n.night, n.prs, n.zone])).toEqual([
      ["2026-09-27", 9, "below centre"],
      ["2026-09-28", 14, "release soon"]
    ]);
    expect(c.limits!.provisional).toBe(false);
  });

  it("flags the releases outside the limits and names them", () => {
    const c = buildControl({ history: history([10, 12, 11, 13, 9, 10, 12, 11, 10, 40]), source: "read", forecasts: [] });
    expect(c.releases.filter((r) => r.special).map((r) => r.tag)).toEqual(["v16.10.0"]);
    expect(c.summary).toContain("1 release outside the limits (special cause): v16.10.0 (40)");
  });

  it("one release: the point, no limits", () => {
    const c = buildControl({ history: history([7], 3), source: "read", forecasts: [] });
    expect(c.limits).toBeNull();
    expect(c.current!.zone).toBeNull();
    expect(c.summary).toBe("Only 1 release measured: no limits yet; 3 PRs on main not yet released.");
    expect(controlHtml(c)).toContain("No limits: fewer than two releases measured");
  });

  it("draws the zone in words beside its colour, both chart widths, a table and the provisional label", () => {
    const c = buildControl({ history: history([6, 1, 8, 5, 11, 4], 68), source: "read 2026-10-01", forecasts: [forecast("2026-09-28T08:59:00Z", 58), forecast("2026-09-30T08:52:00Z", 67)] });
    const html = controlHtml(c);
    expect(html).toContain('<p class="zone red"><span class="zl">Release now</span>');
    expect(html).toContain('class="cc wide"');
    expect(html).toContain('class="cc narrow"');
    expect(html).toContain("Provisional limits: 6 releases of the 10 needed");
    expect(html).toContain("UCL 20.7");
    expect(html).toContain("Centre 5.8");
    expect(html).toContain("LCL 0");
    expect(html).toContain('<tr class="nowrow"><td>main now</td>');
    expect(html).toContain("<strong>Release now</strong>, above UCL");
    expect(html).toContain("How to read this chart");
    expect(html).not.toMatch(/<script|NaN|undefined/);
  });

  it("puts the y axis on a round top", () => {
    expect([niceMax(3), niceMax(7), niceMax(11), niceMax(22), niceMax(73), niceMax(101)]).toEqual([5, 10, 20, 25, 100, 200]);
  });
});

describe("the release history", () => {
  it("keeps plain vX.Y.Z tags in version order and pairs only releases at most one major apart", () => {
    const tags = releaseTags([
      { name: "v16.2.2", sha: "c" },
      { name: "v16.10.0", sha: "e" },
      { name: "v7.0.0-apps", sha: "x" },
      { name: "v1.0.0", sha: "a" },
      { name: "v16.1.4", sha: "b" },
      { name: "17.0.0", sha: "d" }
    ]);
    expect(tags.map((t) => t.name)).toEqual(["v1.0.0", "v16.1.4", "v16.2.2", "v16.10.0", "17.0.0"]);
    expect(releasePairs(tags).map((p) => `${p.previous.name}..${p.tag.name}`)).toEqual(["v16.1.4..v16.2.2", "v16.2.2..v16.10.0", "v16.10.0..17.0.0"]);
  });

  // main: m1 (direct) -> m2 merge #10 (branch b1, b2 with "(#11)") -> m3 squash (#12) -> m4 merge of release/16.2.3 (#13)
  const commits: CompareCommit[] = [
    { sha: "m1", parents: ["base"], message: "fix: straight to main", date: "2026-09-20T00:00:00Z" },
    { sha: "b1", parents: ["m1"], message: "feat: on a branch (#11)", date: "2026-09-21T00:00:00Z" },
    { sha: "b2", parents: ["b1"], message: "Merge pull request #99 from fork/feature\n\ninto the branch", date: "2026-09-21T01:00:00Z" },
    { sha: "m2", parents: ["m1", "b2"], message: "Merge pull request #10 from tutors-sdk/feat/x\n\nfeat: x", date: "2026-09-22T00:00:00Z" },
    { sha: "m3", parents: ["m2"], message: "fix: y (#12)", date: "2026-09-23T00:00:00Z" },
    { sha: "r1", parents: ["m3"], message: "chore: bump version to 16.2.3", date: "2026-09-24T00:00:00Z" },
    { sha: "m4", parents: ["m3", "r1"], message: "Merge pull request #13 from tutors-sdk/release/16.2.3\n\nrelease", date: "2026-09-24T01:00:00Z" }
  ];

  it("counts the PRs on the first-parent line: not the branch's own commits, not a release branch, not a direct commit", () => {
    expect(firstParentPrs(commits, "m4")).toEqual([10, 12]);
    expect(tipOf(commits)?.sha).toBe("m4");
    expect(firstParentPrs(commits, "nowhere")).toEqual([]);
  });

  const fake = (routes: Record<string, unknown>, seen: string[] = []): FetchLike => async (url) => {
    seen.push(url);
    const key = Object.keys(routes).find((k) => url.includes(k));
    return key && routes[key] !== 404 ? { ok: true, status: 200, json: async () => routes[key] } : { ok: false, status: 404, json: async () => ({}) };
  };
  const asApi = (c: CompareCommit) => ({ sha: c.sha, parents: c.parents.map((sha) => ({ sha })), commit: { message: c.message, committer: { date: c.date } } });
  const SHA = (c: string) => c.repeat(40);

  it("reads tags and compares from GitHub into releases.json, paging a long range and leaving out what it could not read", async () => {
    const seen: string[] = [];
    const big = Array.from({ length: 150 }, (_, i) => ({ sha: `c${i}`, parents: [i ? `c${i - 1}` : "x"], message: `fix ${i} (#${1000 + i})`, date: "2026-09-10T00:00:00Z" }));
    big[149] = { ...big[149]!, sha: SHA("b") };
    const f = fake(
      {
        "tags?per_page=100&page=1": [{ name: "v16.1.0", commit: { sha: SHA("a") } }, { name: "v16.2.0", commit: { sha: SHA("b") } }, { name: "v16.3.0", commit: { sha: SHA("c") } }],
        "compare/v16.1.0...v16.2.0?per_page=100&page=1": { total_commits: 150, commits: big.slice(0, 100).map(asApi) },
        "compare/v16.1.0...v16.2.0?per_page=100&page=2": { total_commits: 150, commits: big.slice(100).map(asApi) },
        "compare/v16.2.0...v16.3.0": 404,
        "compare/v16.3.0...main?per_page=100&page=1": { total_commits: 7, commits: commits.map(asApi) }
      },
      seen
    );
    const h = await fetchReleaseHistory({ fetch: f, token: "t", now: NOW, api: "https://api.test" });
    expect(h.releases).toEqual([{ tag: "v16.2.0", previous: "v16.1.0", sha: SHA("b"), releasedAt: "2026-09-10T00:00:00Z", prs: 150 }]);
    expect(h.unreleased).toEqual({ base: "v16.3.0", head: "m4", headDate: "2026-09-24T01:00:00Z", prs: 2 });
    expect(h.errors).toEqual(["GitHub answered 404 for repos/tutors-sdk/tutors-mono-repo/compare/v16.2.0...v16.3.0"]);
    expect(seen.every((u) => u.startsWith("https://api.test/repos/tutors-sdk/tutors-mono-repo/"))).toBe(true);
    expect(parseReleaseHistory(JSON.parse(JSON.stringify(h)))).toEqual(h);
  });

  it("says so when GitHub does not answer, and parses only what is a history", async () => {
    const h = await fetchReleaseHistory({ fetch: fake({}), now: NOW });
    expect(h.releases).toEqual([]);
    expect(h.unreleased).toBeUndefined();
    expect(h.errors[0]).toContain("GitHub answered 404 for repos/tutors-sdk/tutors-mono-repo/tags");
    expect(parseReleaseHistory({ schemaVersion: 2, releases: [] })).toBeUndefined();
    expect(parseReleaseHistory({ schemaVersion: 1, releases: [{ tag: "v1", previous: "v0", prs: -1 }, { tag: "v2", previous: "v1", prs: 3 }] })!.releases.map((r) => r.tag)).toEqual(["v2"]);
  });
});

describe("harness readiness with the control chart", () => {
  const site = () => {
    const s = mkdtempSync(join(tmpdir(), "harness-control-"));
    const base = join(s, "main-preview", "reports");
    const id = "2026-09-30T08-52-05Z-release";
    mkdirSync(join(base, id), { recursive: true });
    writeFileSync(
      join(base, "index.json"),
      JSON.stringify({ runs: [{ id, mode: "release", ranAt: "2026-09-30T08:52:05Z", verdict: "fail", harnessVersion: "1.18.0", sides: { a: { reader: "q/r:16.2.2" }, b: { reader: "q/r:sha-865d02f" } }, files: [`${id}/changes.json`] }] })
    );
    // 4 PRs, one a release branch, one a direct commit: 2 count.
    writeFileSync(join(base, id, "changes.json"), JSON.stringify({ refs: { a: "v16.2.2" }, prs: [{ pr: 1, release: false }, { pr: 2, release: false }, { pr: 3, release: true }, { pr: null, release: false }] }));
    return s;
  };
  const validator = () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    for (const f of ["reports-index", "quality-strip", "release-control"]) ajv.addSchema(JSON.parse(readFileSync(join(ROOT, `docs/contract/${f}.schema.json`), "utf8")), `${f}.schema.json`);
    return ajv;
  };

  it("counts each kept forecast's PRs since production from its changes.json", () => {
    expect(readForecasts(site())[0]!.unreleased).toEqual({ prs: 2, base: "v16.2.2" });
  });

  it("without releases.json draws the batch from the newest forecast with no limits, and says why", () => {
    const s = site();
    expect(readinessCommand({ site: s }, { now: () => NOW, log: () => {} })).toBe(0);
    const r = JSON.parse(readFileSync(join(s, "readiness.json"), "utf8"));
    expect(r.control).toMatchObject({ limits: null, current: { prs: 2, from: "forecast" }, nights: [{ night: "2026-09-30", prs: 2 }] });
    expect(r.control.source).toContain("no releases.json");
    const v = validator().compile(JSON.parse(readFileSync(join(ROOT, "docs/contract/readiness.schema.json"), "utf8")));
    v(r);
    expect(v.errors ?? []).toEqual([]);
  });

  it("--releases reads a history, valid against the schema; one that is not a history, or both flags, is a usage error", () => {
    const s = site();
    writeFileSync(join(s, "h.json"), JSON.stringify(history([6, 1, 8, 5, 11, 4], 68)));
    const logs: string[] = [];
    expect(readinessCommand({ site: s, releases: join(s, "h.json") }, { now: () => NOW, log: (m) => logs.push(m) })).toBe(0);
    expect(logs.join("\n")).toContain("release size: Release now: 68 PRs on main since v16.6.0");
    const r = JSON.parse(readFileSync(join(s, "readiness.json"), "utf8"));
    expect(r.control.limits).toEqual({ n: 6, centre: 5.83, mrBar: 5.6, ucl: 20.73, lcl: 0, provisional: true });
    const ajv = validator();
    const v = ajv.compile(JSON.parse(readFileSync(join(ROOT, "docs/contract/readiness.schema.json"), "utf8")));
    v(r);
    expect(v.errors ?? []).toEqual([]);
    const h = ajv.compile({ $ref: "release-control.schema.json#/definitions/history" });
    expect(h(history([6, 1]))).toBe(true);
    v({ ...r, control: { ...r.control, current: { ...r.control.current, zone: { ...r.control.current.zone, zone: "amber" } } } });
    expect(v.errors?.length).toBeGreaterThan(0);
    const html = readFileSync(join(s, "readiness.html"), "utf8");
    expect(html.indexOf('id="control-title"')).toBeLessThan(html.indexOf('class="last"'));
    writeFileSync(join(s, "bad.json"), JSON.stringify({ not: "a history" }));
    expect(() => readinessCommand({ site: s, releases: join(s, "bad.json") }, { now: () => NOW, log: () => {} })).toThrow(UsageError);
    expect(() => readinessCommand({ site: s, releases: join(s, "h.json"), "fetch-releases": true }, { now: () => NOW, log: () => {} })).toThrow(UsageError);
    expect(readReleaseHistory(join(s, "none.json")).source).toContain("not read");
  });

  it("--fetch-releases asks GitHub once, writes releases.json into the site and reads it", async () => {
    const s = site();
    const f: FetchLike = async (url) => ({
      ok: true,
      status: 200,
      json: async () =>
        url.includes("/tags")
          ? [{ name: "v16.2.1", commit: { sha: "1".repeat(40) } }, { name: "v16.2.2", commit: { sha: "2".repeat(40) } }]
          : { total_commits: 1, commits: [{ sha: url.includes("main") ? "3".repeat(40) : "2".repeat(40), parents: [{ sha: "0" }], commit: { message: "fix: z (#5)", committer: { date: "2026-09-18T08:00:00Z" } } }] }
    });
    expect(await readinessCommand({ site: s, "fetch-releases": true }, { now: () => NOW, log: () => {}, env: {}, fetch: f })).toBe(0);
    const h = JSON.parse(readFileSync(join(s, "releases.json"), "utf8"));
    expect(h.releases).toEqual([{ tag: "v16.2.2", previous: "v16.2.1", sha: "2".repeat(40), releasedAt: "2026-09-18T08:00:00Z", prs: 1 }]);
    const r = JSON.parse(readFileSync(join(s, "readiness.json"), "utf8"));
    expect(r.control.current).toMatchObject({ prs: 1, from: "github" });
    expect(r.control.limits).toBeNull();
  });
});
