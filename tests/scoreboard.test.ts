/**
 * The scoreboard (C2): the line, append-only, re-run numbering, the six views, the run rules at their edges, the
 * harness's own health, the empty state, the page, and the command. Visual management over time, never a verdict.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { checkAppendOnly } from "../src/ci/scoreboard-append.ts";
import type { HistoryEntry } from "../src/ci/noise-history.ts";
import { UsageError, scoreboardCommand } from "../src/local/cli.ts";
import type { Changes } from "../src/changes/signals.ts";
import type { Confidence } from "../src/score/confidence.ts";
import { DIMENSION_IDS, WEIGHTS_VERSION, type DimensionId } from "../src/score/weights.ts";
import { appendOnlyProblem, buildLine, journeysPassed, nextRun, parseLines, type ScoreboardLine } from "../src/scoreboard/line.ts";
import { lineChart, renderSite, renderTrends, runRuleLines } from "../src/scoreboard/render.ts";
import { appendRun, readTrends, recordMutants } from "../src/scoreboard/store.ts";
import { RUN_RULE_BELOW, countermeasuresRising, releasesOf, runRules, selfHealth, trends, weekOf } from "../src/scoreboard/trends.ts";
import type { RunReport } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-scoreboard-${name}-`));
const NOW = new Date("2026-09-27T12:00:00Z");

function conf(o: { tag?: string; gate?: Confidence["gate"]; rcs?: number | null; scores?: Partial<Record<DimensionId, number | null>>; weightsVersion?: string } = {}): Confidence {
  const rcs = o.rcs === undefined ? 88 : o.rcs;
  return {
    schemaVersion: 1,
    gate: o.gate ?? "PASS",
    rcs,
    band: rcs === null ? null : rcs >= 90 ? "Green" : rcs >= 75 ? "Amber" : "Red",
    mean: rcs,
    weightsUsed: {},
    weightsVersion: o.weightsVersion ?? WEIGHTS_VERSION,
    dimensions: DIMENSION_IDS.map((id) => {
      const score = o.scores && id in o.scores ? o.scores[id]! : 90;
      return { id, name: id, weight: 10, status: score === null ? "not measured" : "measured", score, floorBreached: false, deductions: [], evidence: [] };
    }),
    glance: [],
    run: { candidate: o.tag ?? "16.3.0-rc.1", baseline: "16.2.2", ranAt: "2026-09-27T10:00:00Z", reports: {} }
  } as Confidence;
}

/** A line as the file would hold it: the RCS and the eight dimension scores, the rest as given. */
function line(tag: string, rcs: number | null, dims: Partial<Record<DimensionId, number | null>> = {}, extra: Partial<ScoreboardLine> = {}, run = 1): ScoreboardLine {
  return { ...buildLine({ confidence: conf({ tag, rcs, scores: dims }), existing: [], now: NOW }), run, ...extra };
}

const release = { masksApplied: { "a-mask": 3, "b-mask": 0, "c-mask": 0 }, claimHygiene: { claims: 4 }, compare: { hunks: [], matches: [], unclaimed: [], staleClaims: [{ artefact: "dom", scope: "x", reason: "r" }], broadUnapproved: [] } } as unknown as RunReport;
const changes = {
  prs: [
    { pr: 412, points: 13, author: "alice", firstContribution: true, reviewed: true, files: ["apps/reader/a.ts", "apps/reader/b.ts"], deductions: [{ rule: "hotspot", points: 10, file: "apps/reader/a.ts", pr: 412, why: "w", evidence: "e" }, { rule: "tests", points: 3, file: "apps/reader/b.ts", pr: 412, why: "w", evidence: "e" }] },
    { pr: 413, points: 0, author: "bob", firstContribution: false, reviewed: false, files: ["apps/live/c.ts"], deductions: [{ rule: "review", points: 0, floor: true, pr: 413, why: "w", evidence: "e" }] }
  ]
} as unknown as Changes;

// ---- the line ------------------------------------------------------------------------------------------------

describe("a scoreboard line", () => {
  it("carries the Gate, the RCS and band, the eight dimensions, masks, claims, journeys, mutants and the per-PR risk lines", () => {
    const l = buildLine({ confidence: conf(), release, candidate: { journeys: [{ journey: "a", error: undefined }, { journey: "a" }, { journey: "b", error: "timeout" }, { journey: "c" }] as never }, changes, mutants: { ranAt: "2026-09-22T03:41:00Z", caught: 11, total: 12 }, existing: [], now: NOW });
    expect(l).toMatchObject({ schemaVersion: 1, tag: "16.3.0-rc.1", run: 1, date: "2026-09-27T10:00:00Z", gate: "PASS", rcs: 88, band: "Amber", weightsVersion: WEIGHTS_VERSION, masks: 3, masksNeverFired: ["b-mask", "c-mask"], claims: 4, staleClaims: 1, journeys: { passed: 2, total: 3 }, mutants: { caught: 11, total: 12 } });
    expect(l.dimensions.map((d) => d.id)).toEqual([...DIMENSION_IDS]);
    expect(l.prs).toEqual([
      { pr: 412, points: 13, author: "alice", firstContribution: true, reviewed: true, files: ["apps/reader/a.ts", "apps/reader/b.ts"], deductions: [{ rule: "hotspot", points: 10, file: "apps/reader/a.ts" }, { rule: "tests", points: 3, file: "apps/reader/b.ts" }] },
      { pr: 413, points: 0, author: "bob", firstContribution: false, reviewed: false, files: ["apps/live/c.ts"], deductions: [{ rule: "review", points: 0, floor: true }] }
    ]);
    // no prose: the evidence stays in confidence.json and changes.json
    expect(JSON.stringify(l)).not.toContain('"why"');
  });

  it("says what it could not read as null, never as zero", () => {
    const l = buildLine({ confidence: conf({ gate: "FAIL", rcs: null }), existing: [], now: NOW });
    expect(l).toMatchObject({ gate: "FAIL", rcs: null, band: null, masks: null, masksNeverFired: null, claims: null, staleClaims: null, journeys: null, mutants: null, prs: null });
    const old = conf();
    delete old.weightsVersion;
    expect(buildLine({ confidence: old, existing: [], now: NOW }).weightsVersion).toBeNull();
  });

  it("a re-run is the same tag with the next run number; another tag starts at 1", () => {
    const existing = [{ tag: "16.3.0-rc.1" }, { tag: "16.3.0-rc.2" }, { tag: "16.3.0-rc.1" }];
    expect(nextRun(existing, "16.3.0-rc.1")).toBe(3);
    expect(nextRun(existing, "16.3.0-rc.3")).toBe(1);
    expect(buildLine({ confidence: conf(), existing, now: NOW }).run).toBe(3);
    expect(buildLine({ confidence: conf(), existing, tag: "16.3.0", now: NOW })).toMatchObject({ tag: "16.3.0", run: 1 });
  });

  it("no candidate tag and no --tag is an input error", () => {
    const c = conf();
    delete c.run.candidate;
    expect(() => buildLine({ confidence: c, existing: [], now: NOW })).toThrow(/pass --tag/);
  });

  it("journeys passed: completed in every run, of the distinct journeys run", () => {
    expect(journeysPassed({ journeys: [] })).toEqual({ passed: 0, total: 0 });
    expect(journeysPassed({ journeys: [{ journey: "x" }, { journey: "x", error: "boom" }] as never })).toEqual({ passed: 0, total: 1 });
  });

  it("matches its schema, and the file reads back line by line", () => {
    const schema = JSON.parse(readFileSync(resolve(ROOT, "docs/contract/scoreboard-line.schema.json"), "utf8"));
    const validate = new Ajv({ allErrors: true, strict: true }).compile(schema);
    const full = buildLine({ confidence: conf(), release, candidate: { journeys: [] }, changes, mutants: { ranAt: "x", caught: null, total: 12 }, existing: [], now: NOW, runUrl: "https://example/run" });
    for (const l of [full, buildLine({ confidence: conf({ gate: "NOT JUDGED", rcs: null }), existing: [], now: NOW })]) {
      validate(JSON.parse(JSON.stringify(l)));
      expect(validate.errors ?? []).toEqual([]);
    }
    const text = `${JSON.stringify(full)}\n\n${JSON.stringify({ ...full, run: 2 })}\n`;
    expect(parseLines(text).map((l) => l.run)).toEqual([1, 2]);
    expect(() => parseLines(`${JSON.stringify(full)}\nnot json\n`, "f.jsonl")).toThrow(/f\.jsonl:2: not JSON/);
    expect(() => parseLines(`{"schemaVersion":2}\n`)).toThrow(/not a scoreboard line/);
  });
});

// ---- append-only ---------------------------------------------------------------------------------------------

describe("append-only", () => {
  const a = '{"tag":"1"}\n';
  const b = '{"tag":"2"}\n';

  it("adding lines at the end is an append; from nothing, too", () => {
    expect(appendOnlyProblem(a, a + b)).toBeUndefined();
    expect(appendOnlyProblem("", a)).toBeUndefined();
    expect(appendOnlyProblem(a, a)).toBeUndefined();
    // a last line without its newline, then the next line: still an append
    expect(appendOnlyProblem('{"tag":"1"}', a + b)).toBeUndefined();
  });

  it("changing, reordering or removing a line is not", () => {
    expect(appendOnlyProblem(a + b, a)).toBe("line 2 was deleted");
    expect(appendOnlyProblem(a + b, b + a)).toMatch(/^line 1 was changed/);
    expect(appendOnlyProblem(a + b, a + '{"tag":"2","rcs":99}\n')).toMatch(/^line 2 was changed/);
    expect(appendOnlyProblem(a, "")).toBe("line 1 was deleted");
  });

  it("the guard names each file and what happened; a new file, or one that was empty, may start anywhere", () => {
    expect(checkAppendOnly([{ path: "scoreboard/releases.jsonl", before: a, after: a + b }])).toEqual([]);
    expect(checkAppendOnly([{ path: "scoreboard/releases.jsonl", after: a }, { path: "scoreboard/mutants.jsonl", before: "", after: b }])).toEqual([]);
    const errors = checkAppendOnly([{ path: "scoreboard/releases.jsonl", before: a + b, after: a + '{"tag":"2","rcs":99}\n' }, { path: "scoreboard/mutants.jsonl", before: a }]);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatch(/releases\.jsonl: line 2 was changed.*append-only/);
    expect(errors[1]).toBe("scoreboard/mutants.jsonl was deleted: the scoreboard is append-only");
  });

  it("the repository's own scoreboard is not seeded: no invented history", () => {
    expect(readFileSync(resolve(ROOT, "scoreboard/releases.jsonl"), "utf8")).toBe("");
  });
});

// ---- the run rules, at their edges ---------------------------------------------------------------------------

const pts = (...values: (number | null)[]) => values.map((value, i) => ({ tag: `r${i + 1}`, value }));
const fired = (values: (number | null)[], newest = `r${values.length}`) => runRules("claim-coverage", pts(...values), newest);

describe("run rules", () => {
  it("three consecutive declines fire at the fourth point, and only then", () => {
    expect(fired([90, 85, 80, 79]).map((f) => [f.rule, f.at])).toEqual([["three-declines", "r4"]]);
    expect(fired([90, 85, 80])).toEqual([]); // two declines
    expect(fired([90, 85, 85, 80])).toEqual([]); // flat breaks the run
    expect(fired([90, 85, 86, 80])).toEqual([]); // a rise breaks the run
    // four declines fire at the fourth and the fifth point: the history keeps both
    expect(fired([95, 90, 85, 80, 76]).map((f) => f.at)).toEqual(["r4", "r5"]);
  });

  it("two of three releases below 75 fires with three points, at the edge of 75", () => {
    expect(fired([74, 90, 74]).map((f) => [f.rule, f.at])).toEqual([["two-of-three-below-75", "r3"]]);
    expect(fired([74, 74])).toEqual([]); // two points are not three releases (a Red band opens its own 5 Whys)
    expect(fired([75, 74, 90])).toEqual([]); // 75 is not below 75
    expect(fired([74, 90, 90, 74])).toEqual([]); // two below, but not within three
    expect(RUN_RULE_BELOW).toBe(75);
  });

  it("a release where the series was not measured is skipped: a gap neither breaks nor makes a run", () => {
    expect(fired([90, null, 85, 80, null, 79], "r6").map((f) => f.window.map((w) => w.tag))).toEqual([["r1", "r3", "r4", "r6"]]);
    // the newest release did not measure it: the firing is history, not current
    expect(fired([90, 85, 80, 79, null], "r5")[0]).toMatchObject({ at: "r4", current: false });
  });

  it("a firing names the series, the window, whether it is current, whether the weights changed within it, and the kaizen item", () => {
    const f = runRules("noise-health", [{ tag: "a", value: 90, weightsVersion: "x" }, { tag: "b", value: 80, weightsVersion: "x" }, { tag: "c", value: 70, weightsVersion: "y" }, { tag: "d", value: 60, weightsVersion: "y" }], "d");
    expect(f).toHaveLength(2);
    expect(f[0]).toMatchObject({ rule: "three-declines", series: "noise-health", name: "Noise health", at: "d", current: true, acrossWeightsChange: true, kaizen: "Noise health: three consecutive declines (a 90, b 80, c 70, d 60)" });
    expect(f[1]).toMatchObject({ rule: "two-of-three-below-75", kaizen: "Noise health: two of the last three releases below 75 (b 80, c 70, d 60)" });
  });

  it("apply to every dimension and to the RCS, over the latest run of each release", () => {
    const lines = [line("1", 92, { "test-signal": 90 }), line("2", 88, { "test-signal": 85 }), line("3", 84, { "test-signal": 80 }), line("4", 60, { "test-signal": 70 }), line("4", 83, { "test-signal": 79 }, {}, 2)];
    const t = trends({ lines, now: NOW });
    expect(t.runRules.current.map((f) => f.series).sort()).toEqual(["rcs", "test-signal"]);
    expect(t.runRules.current.every((f) => f.rule === "three-declines" && f.at === "4")).toBe(true);
    // the re-run is plotted, and the first run is not hidden: it is a logged deviation
    expect(t.deviations).toEqual([{ tag: "4", runs: 2, firstRcs: 60, latestRcs: 83 }]);
  });

  it("open countermeasures only rising (C4): not measured until a line records the register's count, fires on three rises", () => {
    expect(countermeasuresRising(undefined)).toMatchObject({ status: "not measured", reason: expect.stringContaining("kaizen/README.md") });
    expect(countermeasuresRising([1, 2, 3, 4])).toMatchObject({ status: "measured", rising: true });
    expect(countermeasuresRising([1, 2, 3])).toMatchObject({ rising: false });
    expect(countermeasuresRising([1, 2, 2, 4])).toMatchObject({ rising: false });
    // since 1.13.0 the register exists; its count reaches the rule through the scoreboard lines (tests/why.test.ts)
    expect(existsSync(resolve(ROOT, "kaizen/README.md"))).toBe(true);
  });

  it("the lines harness release prints: each firing opens a kaizen item, or none fires", () => {
    const t = trends({ lines: [line("1", 90), line("2", 80), line("3", 70), line("4", 60)], now: NOW });
    expect(runRuleLines(t.runRules.current)).toContain("run rule: RCS: three consecutive declines (1 90, 2 80, 3 70, 4 60) -> opens a kaizen item");
    expect(runRuleLines([])).toEqual(["run rules: none firing"]);
    expect(runRuleLines([], countermeasuresRising(undefined))[1]).toMatch(/open countermeasures only rising\): not measured/);
  });
});

// ---- the views -----------------------------------------------------------------------------------------------

describe("the six views", () => {
  it("an empty scoreboard is an explicit empty state, with the harness's health still shown", () => {
    const t = trends({ lines: [], now: NOW });
    expect(t).toMatchObject({ releases: 0, lines: 0, empty: "no releases scored yet", runRules: { firings: [], current: [] } });
    expect(renderTrends(t)).toMatch(/^Scoreboard: no releases scored yet\./);
    expect(renderTrends(t)).toContain("Harness self-health:");
  });

  it("one point per release, in the order the tags first appeared, the latest run of each; a weights change is marked", () => {
    const lines = [line("a", 80), line("b", 85, {}, { weightsVersion: "000000000000" }), line("a", 82, {}, {}, 2)];
    const t = trends({ lines, now: NOW });
    expect(releasesOf(lines).map((r) => [r.latest.tag, r.runs])).toEqual([["a", 2], ["b", 1]]);
    expect(t.views.rcs.map((r) => [r.tag, r.rcs, r.run, r.runs, r.weightsChanged])).toEqual([["a", 82, 2, 2, false], ["b", 85, 1, 1, true]]);
    expect(t.views.dimensions).toHaveLength(8);
    expect(t.views.dimensions[0]!.points.map((p) => p.score)).toEqual([90, 90]);
  });

  it("masks and never fired, claims and stale, from each release", () => {
    const t = trends({ lines: [line("a", 90, {}, { masks: 10, masksNeverFired: ["x"], claims: 5, staleClaims: 0 }), line("b", 90, {}, { masks: 12, masksNeverFired: ["x", "y"], claims: 7, staleClaims: 2 })], now: NOW });
    expect(t.views.masks).toEqual([{ tag: "a", masks: 10, neverFired: 1 }, { tag: "b", masks: 12, neverFired: 2 }]);
    expect(t.views.claims).toEqual([{ tag: "a", claims: 5, stale: 0 }, { tag: "b", claims: 7, stale: 2 }]);
  });

  it("hotspot recurrence: the five files touched by the most releases (not PRs), three or more a refactor candidate", () => {
    const pr = (files: string[], deductions: { rule: string; points: number; file?: string }[] = [], author = "a") => ({ pr: 1, points: deductions.reduce((n, d) => n + d.points, 0), author, firstContribution: false, reviewed: true, files, deductions });
    const lines = [
      line("1", 90, {}, { prs: [pr(["hot.ts", "b.ts"], [{ rule: "hotspot", points: 3, file: "hot.ts" }]), pr(["hot.ts"], [], "z")] }),
      line("2", 90, {}, { prs: [pr(["hot.ts", "c.ts", "d.ts", "e.ts", "f.ts", "g.ts"], [{ rule: "hotspot", points: 10, file: "hot.ts" }, { rule: "tests", points: 10, file: "c.ts" }])] }),
      line("3", 90, {}, { prs: null }),
      line("4", 90, {}, { prs: [pr(["hot.ts", "b.ts"])] })
    ];
    const t = trends({ lines, now: NOW });
    expect(t.views.hotspots.releasesWithChanges).toBe(3);
    expect(t.views.hotspots.top).toHaveLength(5);
    expect(t.views.hotspots.top[0]).toEqual({ file: "hot.ts", releases: 3, tags: ["1", "2", "4"], refactorCandidate: true });
    expect(t.views.hotspots.top[1]).toMatchObject({ file: "b.ts", releases: 2, refactorCandidate: false });
    // per-file risk: the points each file's deductions cost, per release with change signals
    expect(t.views.risk.files[0]).toEqual({ file: "hot.ts", total: 13, points: [{ tag: "1", points: 3 }, { tag: "2", points: 10 }, { tag: "4", points: 0 }] });
    // per contributor: labelled for trends only, never for reviewing people
    expect(t.views.risk.contributors.note).toMatch(/never for reviewing people/);
    expect(t.views.risk.contributors.rows.map((r) => [r.author, r.total])).toEqual([["a", 23], ["z", 0]]);
  });
});

describe("harness self-health", () => {
  const night = (ranAt: string, hunks: number, degraded: string[] = []): HistoryEntry => ({ ranAt, hunks, degraded });

  it("mutants caught per week: the latest self-test of each ISO week", () => {
    expect(weekOf("2026-09-27T12:00:00Z")).toBe("2026-09-21"); // a Sunday belongs to the week that began on Monday
    expect(weekOf("2026-09-21T00:00:00Z")).toBe("2026-09-21");
    const h = selfHealth([{ ranAt: "2026-09-21T03:41:00Z", caught: 10, total: 12 }, { ranAt: "2026-09-23T09:00:00Z", caught: 12, total: 12 }, { ranAt: "2026-09-14T03:41:00Z", caught: null, total: 12 }], undefined, NOW);
    expect(h.mutants).toEqual([{ week: "2026-09-14", ranAt: "2026-09-14T03:41:00Z", caught: null, total: 12 }, { week: "2026-09-21", ranAt: "2026-09-23T09:00:00Z", caught: 12, total: 12 }]);
    expect(h.noise).toMatchObject({ status: "not measured" });
  });

  it("noise: clean nights of the last 30, and days since the last A/A failure (a degraded clean night is not a failure)", () => {
    const h = selfHealth([], [night("2026-09-20T02:00:00Z", 2), night("2026-09-21T02:00:00Z", 0), night("2026-09-22T02:00:00Z", 0, ["cached"]), night("2026-09-23T02:00:00Z", 0)], NOW);
    expect(h.noise).toEqual({ status: "measured", nights: 4, cleanNights: 2, cleanRate: 0.5, lastFailure: "2026-09-20T02:00:00Z", daysSinceLastFailure: 7, since: "2026-09-20T02:00:00Z" });
    const never = selfHealth([], [night("2026-09-26T02:00:00Z", 0)], NOW);
    expect(never.noise).toMatchObject({ lastFailure: null, daysSinceLastFailure: null, cleanRate: 1 });
  });
});

// ---- the page ------------------------------------------------------------------------------------------------

describe("the page (scoreboard.html)", () => {
  it("empty: says no releases are scored yet, draws no trend, still shows the harness's health; no script, nothing external", () => {
    const html = renderSite(trends({ lines: [], now: NOW }));
    expect(html).toContain("No releases scored yet.");
    expect(html).not.toContain('id="rcs"');
    expect(html).toContain('id="self-health"');
    expect(html).not.toMatch(/<script|https?:\/\/(?!github)/);
  });

  it("draws the six views and the run rules; the RCS chart shades Green, Amber and Red; eight small multiples with the 75 line", () => {
    const lines = [line("16.2.0", 92), line("16.3.0-rc.1", 84, {}, { prs: [{ pr: 1, points: 3, author: "a", firstContribution: false, reviewed: true, files: ["x.ts"], deductions: [{ rule: "hotspot", points: 3, file: "x.ts" }] }] }), line("16.3.0", 70), line("16.4.0", 60)];
    const html = renderSite(trends({ lines, now: NOW }));
    for (const id of ["rcs", "dimensions", "masks", "claims", "hotspots", "risk", "run-rules", "self-health"]) expect(html, id).toContain(`id="${id}"`);
    for (const band of ["green", "amber", "red"]) expect(html, band).toContain(`class="band ${band}"`);
    expect(html.match(/<figure>/g)).toHaveLength(8);
    expect(html.match(/class="rule"/g)).toHaveLength(8);
    expect(html).toContain('class="andon"');
    expect(html).toContain("RCS: three consecutive declines");
    expect(html).toContain("<title>16.4.0: RCS 60</title>");
    expect(html).toContain("prefers-color-scheme: dark");
    expect(html).not.toContain("<script");
  });

  it("a release with no RCS is a gap in the line, not a zero; text is escaped", () => {
    const svg = lineChart({ title: "t", labels: ["a", "<b>", "c"], series: [{ name: "s", color: "--series-1", values: [80, null, 90] }], min: 0, max: 100 });
    expect(svg.match(/<polyline/g)).toHaveLength(2);
    expect(svg.match(/<circle/g)).toHaveLength(2);
    expect(svg).toContain("&lt;b&gt;");
    expect(svg).not.toContain("<b>");
  });
});

// ---- the files and the command -------------------------------------------------------------------------------

/** A `harness release` directory as the score stage leaves it: confidence.json, the release run beside it, changes.json. */
function releaseDir(o: { fast?: boolean; tag?: string; changes?: boolean } = {}): string {
  const root = tmp("run");
  const run = join(root, "2026-09-27T10-00-00-release");
  mkdirSync(join(run, "b"), { recursive: true });
  writeFileSync(join(run, "report.json"), JSON.stringify(release));
  writeFileSync(join(run, "b", "capture.json"), JSON.stringify({ journeys: [{ journey: "a" }, { journey: "b" }] }));
  const dir = join(root, "2026-09-27T10-30-00-release-command");
  mkdirSync(dir);
  const c = conf(o.tag ? { tag: o.tag } : {});
  c.run.reports = { release: "../2026-09-27T10-00-00-release/report.json" };
  if (o.changes) c.run.inputs = { changeRisk: "changes.json" };
  writeFileSync(join(dir, "confidence.json"), JSON.stringify(c));
  if (o.changes) writeFileSync(join(dir, "changes.json"), JSON.stringify(changes));
  writeFileSync(join(dir, "status.json"), JSON.stringify({ fast: o.fast ?? false }));
  return dir;
}

describe("appending", () => {
  it("builds the line from what the run left (release report, capture, changes.json, the latest mutants beside the file) and appends it", () => {
    const home = tmp("home");
    const file = join(home, "scoreboard", "releases.jsonl");
    mkdirSync(join(home, "scoreboard"));
    writeFileSync(join(home, "scoreboard", "mutants.jsonl"), `${JSON.stringify({ ranAt: "2026-09-21T03:41:00Z", caught: 12, total: 12 })}\n`);
    const { line: l } = appendRun({ run: releaseDir({ changes: true }), file, now: NOW, runUrl: "https://example/1" });
    expect(l).toMatchObject({ tag: "16.3.0-rc.1", run: 1, masks: 3, claims: 4, staleClaims: 1, journeys: { passed: 2, total: 2 }, mutants: { caught: 12, total: 12 }, runUrl: "https://example/1" });
    expect(l.prs).toHaveLength(2);
    // a re-run of the same tag, from its confidence.json: the next run number, the first line untouched
    const before = readFileSync(file, "utf8");
    const again = appendRun({ run: join(releaseDir(), "confidence.json"), file, now: NOW });
    expect(again.line).toMatchObject({ run: 2, prs: null });
    const after = readFileSync(file, "utf8");
    expect(after.startsWith(before)).toBe(true);
    expect(parseLines(after).map((x) => [x.tag, x.run])).toEqual([["16.3.0-rc.1", 1], ["16.3.0-rc.1", 2]]);
  });

  it("refuses a --fast run, a directory with no score, and a file that is not a scoreboard", () => {
    const file = join(tmp("f"), "releases.jsonl");
    expect(() => appendRun({ run: releaseDir({ fast: true }), file, now: NOW })).toThrow(/--fast run/);
    expect(existsSync(file)).toBe(false);
    expect(() => appendRun({ run: tmp("empty"), file, now: NOW })).toThrow(/no confidence\.json .*harness confidence --run/);
    writeFileSync(file, "garbage\n");
    expect(() => appendRun({ run: releaseDir(), file, now: NOW })).toThrow(/not JSON/);
  });

  it("a file whose last line lost its newline still gets whole lines", () => {
    const file = join(tmp("ragged"), "releases.jsonl");
    appendRun({ run: releaseDir(), file, now: NOW });
    writeFileSync(file, readFileSync(file, "utf8").trimEnd());
    appendRun({ run: releaseDir(), file, now: NOW });
    expect(parseLines(readFileSync(file, "utf8"))).toHaveLength(2);
  });

  it("records a self-test's mutants.json once, however often the job re-runs", () => {
    const out = tmp("mut");
    writeFileSync(join(out, "mutants.json"), JSON.stringify({ schemaVersion: 1, ranAt: "2026-09-21T03:41:00Z", base: "16.2.2", caught: 11, total: 12, escaped: ["x"], harnessVersion: "1.11.0" }));
    const file = join(tmp("mf"), "mutants.jsonl");
    recordMutants({ from: out, file });
    recordMutants({ from: join(out, "mutants.json"), file });
    expect(readFileSync(file, "utf8").trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(readFileSync(file, "utf8"))).toMatchObject({ caught: 11, total: 12, escaped: ["x"], base: "16.2.2" });
    expect(() => recordMutants({ from: tmp("none"), file })).toThrow(/no mutants\.json/);
  });
});

describe("harness scoreboard", () => {
  const values = (v: Record<string, string | boolean>) => v;

  it("append, then trends: defaults to HARNESS_HOME/scoreboard, never the checkout", () => {
    const home = tmp("home");
    const log: string[] = [];
    expect(scoreboardCommand("append", values({ run: releaseDir() }), { home, now: () => NOW, log: (m) => log.push(m) })).toBe(0);
    expect(log[0]).toBe(`appended 16.3.0-rc.1 run 1 (Gate PASS, RCS 88 Amber) to ${join(home, "scoreboard", "releases.jsonl")}`);
    expect(readFileSync(resolve(ROOT, "scoreboard/releases.jsonl"), "utf8")).toBe("");
    log.length = 0;
    expect(scoreboardCommand("trends", values({ json: true }), { home, now: () => NOW, log: (m) => log.push(m) })).toBe(0);
    expect(JSON.parse(log[0]!)).toMatchObject({ releases: 1, views: { rcs: [{ tag: "16.3.0-rc.1", rcs: 88 }] } });
  });

  it("trends --site writes scoreboard.html and scoreboard.json, the empty state included", () => {
    const home = tmp("home");
    const site = tmp("site");
    const log: string[] = [];
    expect(scoreboardCommand("trends", values({ file: join(home, "none.jsonl"), site }), { home, now: () => NOW, log: (m) => log.push(m) })).toBe(0);
    expect(readFileSync(join(site, "scoreboard.html"), "utf8")).toContain("No releases scored yet.");
    expect(JSON.parse(readFileSync(join(site, "scoreboard.json"), "utf8"))).toMatchObject({ empty: "no releases scored yet" });
    expect(log[0]).toContain("Scoreboard: no releases scored yet.");
  });

  it("reads the noise history for the harness's health", () => {
    const dir = tmp("noise");
    const history = join(dir, "noise-history.json");
    writeFileSync(history, JSON.stringify({ schemaVersion: 1, entries: [{ ranAt: "2026-09-25T02:00:00Z", hunks: 1, degraded: [] }] }));
    expect(readTrends({ file: join(dir, "none.jsonl"), noiseHistory: history, now: NOW }).selfHealth.noise).toMatchObject({ status: "measured", daysSinceLastFailure: 2 });
    expect(readTrends({ file: join(dir, "none.jsonl"), noiseHistory: join(dir, "missing.json"), now: NOW }).selfHealth.noise).toMatchObject({ status: "not measured", reason: expect.stringContaining("missing.json") });
  });

  it("usage errors are exit-2 messages, not stacks", () => {
    expect(() => scoreboardCommand("bogus", {}, { home: tmp("h") })).toThrow(/scoreboard append\|trends\|mutants/);
    expect(() => scoreboardCommand("append", {}, { home: tmp("h") })).toThrow(UsageError);
    expect(() => scoreboardCommand("append", values({ run: releaseDir({ fast: true }) }), { home: tmp("h") })).toThrow(UsageError);
    expect(() => scoreboardCommand("mutants", {}, { home: tmp("h") })).toThrow(/--run/);
  });
});
