/**
 * The reviewer's glance (C3, src/glance): the ranking and its cap, novelty with and without history, each kind of
 * candidate from fixtures, what is not checked and why, the marks and their status, the Amber rule, and the guardrail
 * that a mark never changes a Gate or an exit code.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import type { Changes } from "../src/changes/signals.ts";
import { markItem, readScored } from "../src/glance/command.ts";
import { MARKS_FILE, applyMarks, glanceStatus, markRecord, parseMarks } from "../src/glance/marks.ts";
import { GLANCE_KINDS, GLANCE_MAX, glance, historyWindow, noveltyOf, type GlanceInputs, type GlanceItem } from "../src/glance/rank.ts";
import { GLANCE_END, GLANCE_START, renderGlanceMarkdown, replaceGlanceBlock } from "../src/glance/render.ts";
import { UsageError, glanceCommand } from "../src/local/cli.ts";
import type { Confidence } from "../src/score/confidence.ts";
import { scoreAndWrite } from "../src/score/read.ts";
import { DIMENSION_IDS } from "../src/score/weights.ts";
import { buildLine, type ScoreboardLine } from "../src/scoreboard/line.ts";
import type { Claim, Hunk, JourneyCapture, PageCapture, RunReport } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-glance-${name}-`));
const NOW = new Date("2026-09-27T12:00:00Z");

let n = 0;
const hunk = (artefact: Hunk["artefact"], scope: string, extra: Partial<Hunk> = {}): Hunk => ({ id: `${artefact}:${scope}:${++n}`, artefact, scope, summary: `${scope} moved`, severity: "fail", ...extra });

function report(o: { matched?: [Hunk, Claim][]; hunks?: Hunk[]; broad?: Claim[]; masks?: Record<string, number>; load?: boolean } = {}): RunReport {
  const matched = o.matched ?? [];
  const hunks = o.hunks ?? [];
  const side = { requests: 600, failed: 0, serverErrors: 0, p50: 1.2, p95: 2.1, rate: 20, duration: "30s" };
  return {
    schemaVersion: 1,
    mode: "release",
    ranAt: "2026-09-27T10:00:00Z",
    verdict: "pass",
    reasons: [],
    compare: { hunks: [...matched.map(([h]) => h), ...hunks], matches: [...matched.map(([hunk, claim]) => ({ hunk, claim })), ...hunks.map((hunk) => ({ hunk }))], unclaimed: [], staleClaims: [], broadUnapproved: o.broad ?? [] },
    masksApplied: o.masks ?? { "a-mask": 3 },
    ...(o.load ? { load: { a: side, b: { ...side, p50: 1.5, p95: 2.6 } } } : {})
  } as unknown as RunReport;
}

const page = (pageKey: string, ttfbMs = 10): PageCapture => ({ pageKey, path: `/${pageKey}`, aria: "", headers: {}, network: [], console: [], axe: [], focus: [], timing: { ttfbMs, responseEndMs: ttfbMs + 1 } });
const journey = (name: string, run: number, pages: string[], o: Partial<JourneyCapture> = {}): JourneyCapture => ({ journey: name, run, anonymous: true, durationMs: 1000, pages: pages.map((p) => page(p)), persistence: [], ...o });

/** Six journeys, three runs each, over the four apps; `b` differs only where a test says so. */
function captures(o: { bDuration?: Record<string, number>; bWrites?: Record<string, number>; aWrites?: Record<string, number> } = {}) {
  const set: [string, string[]][] = [
    ["anonymous-student-reads-course", ["reader:home", "reader:course", "reader:topic"]],
    ["anonymous-student-searches", ["reader:search"]],
    ["catalogue-loads", ["catalogue:home"]],
    ["live-loads", ["live:home"]],
    ["student-signs-in", ["reader-auth:course", "reader-auth:topic"]],
    ["reference-course-reads", ["reference:topic"]]
  ];
  const side = (dur: Record<string, number> = {}, writes: Record<string, number> = {}) => ({
    journeys: set.flatMap(([name, pages]) => [1, 2, 3].map((run) => journey(name, run, pages, { durationMs: (dur[name] ?? 1000) + run, persistence: writes[name] ? [{ kind: "write" as const, method: "POST", table: "learning_records", rows: writes[name]! }] : [] })))
  });
  return { a: side({}, o.aWrites), b: side(o.bDuration, o.bWrites) };
}

function changes(o: { prs?: object[]; deps?: object[]; hotspots?: "not measured" } = {}): Changes {
  return {
    repo: "tutors-sdk/tutors-mono-repo",
    prs: o.prs ?? [],
    signals: {
      hotspots: o.hotspots ? { status: "not measured", reason: "only 1 release of history" } : { status: "measured", files: [], touched: [] },
      dependencies: { status: "measured", majorBumps: o.deps ?? [], newPackages: [] }
    }
  } as unknown as Changes;
}

const pr = (number: number, o: { first?: boolean; hotspots?: string[]; deps?: string[] } = {}) => ({
  pr: number,
  sha: `abc${number}def`,
  title: `PR ${number}`,
  url: `https://github.com/tutors-sdk/tutors-mono-repo/pull/${number}`,
  release: false,
  author: `author-${number}`,
  firstContribution: o.first ?? false,
  files: [...(o.hotspots ?? []), "pnpm-lock.yaml"],
  hotspotsTouched: o.hotspots ?? [],
  deductions: [
    ...(o.hotspots?.length ? [{ rule: "hotspot", points: o.first ? 10 : 3, file: o.hotspots[0], pr: number, why: "w", evidence: `https://github.com/tutors-sdk/tutors-mono-repo/pull/${number}/files#diff-x` }] : []),
    ...(o.deps ?? []).map((d) => ({ rule: "dependency", points: 5, file: "pnpm-lock.yaml", pr: number, why: `PR #${number} moves ${d} 1.0.0 → 2.0.0 in apps/reader: a major bump`, evidence: `https://github.com/tutors-sdk/tutors-mono-repo/pull/${number}/files#diff-lock` }))
  ]
});

const at = (r: RunReport): NonNullable<GlanceInputs["release"]> => ({ data: r, where: "../run-release" });

/** A scoreboard line for history, with a glance record (or none, a pre-1.12.0 line). */
function histLine(tag: string, o: { seen?: string[]; checked?: string[]; maskIds?: string[]; prs?: ScoreboardLine["prs"] } = {}): ScoreboardLine {
  return {
    schemaVersion: 1,
    tag,
    run: 1,
    date: "2026-09-01T00:00:00Z",
    appendedAt: "2026-09-01T00:00:00Z",
    gate: "PASS",
    rcs: 90,
    band: "Green",
    weightsVersion: null,
    dimensions: DIMENSION_IDS.map((id) => ({ id, status: "measured", score: 90, floorBreached: false })),
    masks: 1,
    masksNeverFired: [],
    claims: 0,
    staleClaims: 0,
    journeys: null,
    mutants: null,
    prs: o.prs ?? null,
    ...(o.maskIds ? { maskIds: o.maskIds } : {}),
    ...(o.seen ? { glance: { items: 1, marks: { verified: 1, disputed: 0, escalated: 0, unmarked: 0 }, checked: (o.checked ?? [...GLANCE_KINDS]) as never, seen: o.seen } } : {})
  };
}

const kinds = (items: GlanceItem[]) => items.map((i) => i.kind);

// ---- the ranking -----------------------------------------------------------------------------------------

describe("the ranking", () => {
  it("is novelty × exposure, highest first, ties in the plan's order, and never more than seven", () => {
    // ten fixed-on-b pages and one broad claim over three journeys: eleven candidates, seven shown
    const errors = ["reader:home", "reader:course", "reader:topic", "reader:search", "catalogue:home", "live:home", "reader-auth:course", "reader-auth:topic", "reference:topic", "reader:home"].map((pk, k) => hunk("console", pk, { severity: "info", summary: `${pk}: console message gone on b`, detail: `error: boom ${k}` }));
    const broadHunks = [hunk("dom", "reader:home"), hunk("dom", "catalogue:home"), hunk("dom", "live:home")];
    const claim: Claim = { artefact: "*", scope: "**", reason: "everything (PR #41)", approvedBy: "leigh" };
    const g = glance({ release: at(report({ matched: broadHunks.map((h) => [h, claim]), hunks: errors })), captures: captures() });
    expect(g.items).toHaveLength(GLANCE_MAX);
    expect(g.items.map((i) => i.rank)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const scores = g.items.map((i) => i.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    // the broad claim touches four of six journeys (reader:home is in the course journey), so it is first
    expect(g.items[0]).toMatchObject({ kind: "broad-claim", novelty: 1, exposure: 0.5, score: 0.5, basis: { novelty: "no history yet" } });
    expect(g.items[0]!.basis.exposure).toBe("3 of 6 journeys: anonymous-student-reads-course, catalogue-loads, live-loads");
    expect(g.items[0]!.links).toMatchObject({ hunk: `../run-release/report.html#hunk-${broadHunks[0]!.id}`, claim: "* **: everything (PR #41) (approvedBy leigh)", pr: "https://github.com/tutors-sdk/tutors-mono-repo/pull/41" });
    expect(g.items[0]!.hunks).toHaveLength(3);
    // the rest rank on exposure (the course journey's pages are one journey of six), and all eleven are kept for novelty
    expect(g.basis.checked.find((c) => c.kind === "fixed-on-b")!.candidates).toBe(9);
    expect(g.basis.seen).toHaveLength(10);
    expect(g.basis.rule).toContain("novelty × exposure");
  });

  it("an unmapped finding counts as the whole journey set: what cannot be placed is not ranked below what can", () => {
    const g = glance({ release: at(report()), captures: captures(), changes: changes({ prs: [pr(7, { deps: ["zod"] })], deps: [{ kind: "major", name: "zod", importer: "packages/common", from: "3.0.0", to: "4.0.0", pr: 7 }] }) });
    const bump = g.items.find((i) => i.kind === "major-bump")!;
    expect(bump.exposure).toBe(1);
    expect(bump.basis.exposure).toMatch(/^unmapped \(packages\/common is not an app, and a package's reach into the journeys is not mapped\): counted as all 6 journeys/);
    expect(bump.finding).toContain("unmapped");
  });
});

// ---- novelty ---------------------------------------------------------------------------------------------

describe("novelty", () => {
  it("is 1 with no history, and says so", () => {
    expect(noveltyOf([], "near-miss", "reader:course")).toEqual({ novelty: 1, basis: "no history yet" });
    // lines that did not check the kind say nothing about it
    const old = [histLine("16.1.0"), histLine("16.2.0")];
    expect(noveltyOf(old, "near-miss", "x")).toEqual({ novelty: 1, basis: "no history yet: none of the last 2 releases on the scoreboard recorded this kind" });
  });

  it("falls with each of the last six releases that had the same finding, and is never 0", () => {
    const lines = ["16.0.0", "16.0.1", "16.1.0", "16.1.1", "16.2.0", "16.2.1", "16.2.2"].map((t, k) => histLine(t, { seen: k % 2 ? ["near-miss:reader:course"] : [] }));
    const w = historyWindow(lines, "16.3.0");
    expect(w.map((l) => l.tag)).toEqual(["16.0.1", "16.1.0", "16.1.1", "16.2.0", "16.2.1", "16.2.2"]);
    // seen in 16.0.1, 16.1.1, 16.2.1: 3 of 6 → (6 − 3 + 1) ÷ 7
    expect(noveltyOf(w, "near-miss", "reader:course")).toEqual({ novelty: 0.57, basis: "seen in 3 of the last 6 releases that recorded it (16.0.1, 16.1.1, 16.2.1)" });
    expect(noveltyOf(w, "near-miss", "reader:search").novelty).toBe(1);
    const every = ["a", "b", "c", "d", "e", "f"].map((t) => histLine(t, { seen: ["near-miss:x"] }));
    expect(noveltyOf(every, "near-miss", "x").novelty).toBe(0.14);
  });

  it("the candidate's own earlier runs are not history, and a tag's latest line stands for it", () => {
    const lines = [histLine("16.2.2", { seen: [] }), histLine("16.3.0", { seen: ["near-miss:x"] }), histLine("16.2.2", { seen: ["near-miss:x"] })];
    const w = historyWindow(lines, "16.3.0");
    expect(w.map((l) => l.tag)).toEqual(["16.2.2"]);
    expect(noveltyOf(w, "near-miss", "x").novelty).toBe(0.5);
  });

  it("reads a first contribution on a hotspot from a pre-1.12.0 line's per-PR risk lines", () => {
    const legacy = histLine("16.2.1", { prs: [{ pr: 3, points: 10, firstContribution: true, reviewed: true, files: ["apps/reader/src/a.ts"], deductions: [{ rule: "hotspot", points: 10, file: "apps/reader/src/a.ts" }] }] });
    expect(noveltyOf([legacy], "first-time-hotspot", "apps/reader/src/a.ts")).toEqual({ novelty: 0.5, basis: "seen in 1 of the last 1 release that recorded it (16.2.1)" });
  });

  it("history lowers a finding's rank: the same score falls behind a new one", () => {
    const h = [hunk("console", "catalogue:home", { severity: "info", summary: "catalogue:home: console message gone on b", detail: "error: a" }), hunk("console", "live:home", { severity: "info", summary: "live:home: console message gone on b", detail: "error: b" })];
    const history = { lines: [histLine("16.2.2", { seen: ["fixed-on-b:console catalogue:home"] })], source: "releases.jsonl" };
    const g = glance({ release: at(report({ hunks: h })), captures: captures(), history, tag: "16.3.0" });
    expect(g.items.map((i) => i.key)).toEqual(["console live:home", "console catalogue:home"]);
    expect(g.items[1]).toMatchObject({ novelty: 0.5, basis: { novelty: "seen in 1 of the last 1 release that recorded it (16.2.2)" } });
    expect(g.basis.history).toEqual({ releases: ["16.2.2"], source: "releases.jsonl" });
  });
});

// ---- each kind -------------------------------------------------------------------------------------------

describe("each kind of candidate, from fixtures", () => {
  it("broad claim: its approvedBy and every hunk it absorbed; a broad claim with no approvedBy and no hunk too", () => {
    const hs = [hunk("dom", "reader:topic"), hunk("screenshot", "reader:topic")];
    const g = glance({ release: at(report({ matched: hs.map((h) => [h, { artefact: "*", scope: "reader:*", reason: "the new shell", approvedBy: "ana" }]), broad: [{ artefact: "dom", scope: "**", reason: "later" }] })), captures: captures() });
    const items = g.items.filter((i) => i.kind === "broad-claim");
    expect(items.map((i) => i.finding)).toEqual(["broad claim * reader:* (approvedBy ana) absorbed 2 hunks, first: reader:topic moved", "broad claim dom ** (no approvedBy) absorbed 0 hunks"]);
    expect(items[0]!.hunks).toEqual(hs.map((h) => `../run-release/report.html#hunk-${h.id}`));
    expect(items[1]!.links.hunk).toBe("../run-release/report.html#broad-claims");
  });

  it("mask added: against the last release's mask ids, with its reason and what it hid; one that hid nothing has no exposure", () => {
    const history = { lines: [histLine("16.2.2", { maskIds: ["a-mask"] })], source: "releases.jsonl" };
    const masks = { "new-mask": { artefact: ["headers"], reason: "a header that varies per request and is asserted elsewhere" }, "idle-mask": { artefact: ["dom"], reason: "nothing yet" } };
    const g = glance({ release: at(report({ masks: { "a-mask": 3, "new-mask": 80, "idle-mask": 0 } })), captures: captures(), history, masks, tag: "16.3.0" });
    const added = g.items.filter((i) => i.kind === "mask-added");
    expect(added.map((i) => [i.key, i.exposure])).toEqual([
      ["new-mask", 1],
      ["idle-mask", 0]
    ]);
    expect(added[0]).toMatchObject({ finding: "mask new-mask (headers) added since 16.2.2: it hid 80 values in this run", detail: "reason: a header that varies per request and is asserted elsewhere", links: { hunk: "../run-release/report.html#masks" } });
    expect(added[1]!.basis.exposure).toContain("it hid nothing in this run");
  });

  it("near miss: p in 0.05-0.10 with both distributions side by side; outside it, or unjudged, is not a candidate", () => {
    const hs = [
      hunk("timing", "anonymous-student-searches", { severity: "info", summary: "journey anonymous-student-searches median 1000ms → 1200ms but not significant (p=0.071)" }),
      hunk("timing", "reader:course", { severity: "info", summary: "reader:course TTFB median 10ms → 13ms but not significant (p=0.300)" }),
      hunk("timing", "reader:topic", { severity: "info", summary: "reader:topic TTFB median 10ms → 13ms; 3/3 samples cannot reach alpha 0.05 (best possible p=0.081). Raise --runs" }),
      hunk("timing", "load/http_req_duration", { severity: "info", summary: "under load, p95 2.1ms → 2.6ms (+24%), p50 1.2ms → 1.5ms, n=600/600, p=6.0e-2" })
    ];
    const g = glance({ release: at(report({ hunks: hs, load: true })), captures: captures({ bDuration: { "anonymous-student-searches": 1200 } }) });
    const near = g.items.filter((i) => i.kind === "near-miss");
    expect(near.map((i) => i.key).sort()).toEqual(["anonymous-student-searches", "load/http_req_duration"]);
    expect(near.find((i) => i.key === "anonymous-student-searches")!.detail).toBe("duration a: 1001, 1002, 1003 ms · b: 1201, 1202, 1203 ms");
    expect(near.find((i) => i.key === "load/http_req_duration")!.detail).toContain("k6 a: p50 1.2 ms, p95 2.1 ms, n=600 · b: p50 1.5 ms, p95 2.6 ms");
    expect(near.every((i) => i.links.hunk?.includes("#hunk-timing:"))).toBe(true);
  });

  it("hotspot touched by a first contribution: the PR, the diff link, the journeys of its app; not by a regular contributor", () => {
    const g = glance({ release: at(report()), captures: captures(), changes: changes({ prs: [pr(12, { first: true, hotspots: ["apps/reader/src/lib/course.ts"] }), pr(13, { hotspots: ["apps/reader/src/lib/course.ts"] })] }) });
    const items = g.items.filter((i) => i.kind === "first-time-hotspot");
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ key: "apps/reader/src/lib/course.ts", links: { pr: "https://github.com/tutors-sdk/tutors-mono-repo/pull/12", diff: "https://github.com/tutors-sdk/tutors-mono-repo/pull/12/files#diff-x" } });
    expect(items[0]!.finding).toBe('PR #12, a first contribution, touches hotspot apps/reader/src/lib/course.ts: "PR 12"');
    expect(items[0]!.basis.exposure).toBe("4 of 6 journeys: anonymous-student-reads-course, anonymous-student-searches, reference-course-reads, student-signs-in");
  });

  it("new persistence: a journey that wrote nothing on a and writes on b, even when claimed", () => {
    const h = hunk("persistence", "student-signs-in/learning_records", { summary: "student-signs-in: POST learning_records — 0 row(s) on a, 3 on b" });
    const g = glance({ release: at(report({ matched: [[h, { artefact: "persistence", scope: "student-signs-in/*", reason: "Rule 0042: records reading time" }]] })), captures: captures({ bWrites: { "student-signs-in": 3, "live-loads": 1 }, aWrites: { "live-loads": 2 } }) });
    const items = g.items.filter((i) => i.kind === "new-persistence");
    expect(items.map((i) => i.key)).toEqual(["student-signs-in"]);
    expect(items[0]!.finding).toBe("student-signs-in wrote nothing on a and 9 rows to learning_records on b, claimed: a journey that starts writing is a behaviour change, even when claimed");
    expect(items[0]!.links).toMatchObject({ hunk: `../run-release/report.html#hunk-${h.id}`, claim: "persistence student-signs-in/*: Rule 0042: records reading time" });
    expect(items[0]!.exposure).toBe(0.17);
  });

  it("fixed on b: console errors and axe violations gone on b, claimed or not; a warning gone is not one", () => {
    const hs = [
      hunk("console", "reader:topic", { severity: "info", summary: "reader:topic: console message gone on b", detail: "error: Cannot read properties of undefined" }),
      hunk("console", "reader:topic", { severity: "info", summary: "reader:topic: console message gone on b", detail: "warning: deprecated" }),
      hunk("axe", "live:home", { severity: "info", summary: "live:home: axe violation fixed on b: color-contrast (serious)" })
    ];
    const g = glance({ release: at(report({ hunks: hs })), captures: captures() });
    const items = g.items.filter((i) => i.kind === "fixed-on-b");
    expect(items.map((i) => i.finding).sort()).toEqual(["live:home: 1 axe violation fixed on b, unclaimed; a fix nobody claimed can be a behaviour change", "reader:topic: 1 console error fixed on b, unclaimed; a fix nobody claimed can be a behaviour change"]);
    expect(items.find((i) => i.key === "axe live:home")!.detail).toBe("color-contrast (serious)");
  });

  it("fixed on b, with new errors on the same page: it asks whether the error was fixed or only changed", () => {
    const hs = [hunk("console", "catalogue:home", { severity: "info", summary: "catalogue:home: console message gone on b", detail: "error: boom at a.js:1" }), hunk("console", "catalogue:home", { summary: "catalogue:home: new console message on b", detail: "error: boom at b.js:9" })];
    const g = glance({ release: at(report({ hunks: hs })), captures: captures() });
    expect(g.items[0]!.finding).toBe("catalogue:home: 1 console error fixed on b, unclaimed; but 1 new console error on the same page: fixed, or only changed?");
  });

  it("major bump: the journeys exercising the app it lands in, or unmapped, said", () => {
    const g = glance({ release: at(report()), captures: captures(), changes: changes({ prs: [pr(20, { deps: ["svelte"] })], deps: [{ kind: "major", name: "svelte", importer: "apps/live", from: "4.2.0", to: "5.0.0", pr: 20 }] }) });
    const item = g.items.find((i) => i.kind === "major-bump")!;
    expect(item.finding).toBe("svelte 4.2.0 → 5.0.0 in apps/live (PR #20): a major bump; journeys exercising live: live-loads");
    expect(item.links).toEqual({ pr: "https://github.com/tutors-sdk/tutors-mono-repo/pull/20", diff: "https://github.com/tutors-sdk/tutors-mono-repo/pull/20/files#diff-lock" });
    expect(item.exposure).toBe(0.17);
  });

  it("duration moved: more than 20% either way, significant or not, with both samples; 20% or less is not", () => {
    const g = glance({ release: at(report()), captures: captures({ bDuration: { "catalogue-loads": 1300, "live-loads": 700, "anonymous-student-searches": 1200 } }) });
    const items = g.items.filter((i) => i.kind === "duration-moved");
    expect(items.map((i) => i.key).sort()).toEqual(["catalogue-loads", "live-loads"]);
    expect(items.find((i) => i.key === "catalogue-loads")!.finding).toBe("catalogue-loads: median duration 1002 ms → 1302 ms (+30%), not judged by the timing engine (below its thresholds or runs)");
    expect(items.find((i) => i.key === "live-loads")!.finding).toContain("(-30%)");
  });
});

// ---- not checked -----------------------------------------------------------------------------------------

describe("what the glance could not check", () => {
  it("with nothing to read, every kind is not checked, with its reason; nothing is made up", () => {
    const g = glance({});
    expect(g.items).toEqual([]);
    expect(g.basis.checked).toEqual([]);
    expect(g.basis.notChecked.map((x) => x.kind)).toEqual([...GLANCE_KINDS]);
    for (const x of g.basis.notChecked) expect(x.reason.length).toBeGreaterThan(10);
  });

  it("a release report alone checks broad claims, near misses and fixes; the rest say which input is missing", () => {
    const g = glance({ release: at(report()), changesReason: "no changes.json (harness changes, or harness release with --monorepo)" });
    expect(g.basis.checked.map((c) => c.kind)).toEqual(["broad-claim", "near-miss", "fixed-on-b"]);
    expect(Object.fromEntries(g.basis.notChecked.map((x) => [x.kind, x.reason]))).toEqual({
      "mask-added": "no earlier release on the scoreboard to compare the masks with",
      "first-time-hotspot": "no changes.json (harness changes, or harness release with --monorepo)",
      "new-persistence": "no a/ and b/ capture.json beside the release run",
      "major-bump": "no changes.json (harness changes, or harness release with --monorepo)",
      "duration-moved": "no a/ and b/ capture.json beside the release run"
    });
    expect(g.basis.journeys.source).toContain("no capture.json");
  });

  it("a signal changes.json did not measure is not checked, with its reason; a line without mask ids cannot tell a mask added", () => {
    const g = glance({ release: at(report()), changes: changes({ hotspots: "not measured" }), history: { lines: [histLine("16.2.2")], source: "f" }, tag: "16.3.0" });
    const why = Object.fromEntries(g.basis.notChecked.map((x) => [x.kind, x.reason]));
    expect(why["first-time-hotspot"]).toBe("hotspots not measured: only 1 release of history");
    expect(why["mask-added"]).toBe("the last release on the scoreboard (16.2.2) did not record its mask ids (recorded since 1.12.0): the next release can compare");
    expect(g.basis.checked.map((c) => c.kind)).toContain("major-bump");
  });

  it("the checked-in 16.2.1 → 16.2.2 run: three kinds live from report.json alone, five not checked", () => {
    const dir = tmp("example");
    cpSync(join(ROOT, "examples/release-16.2.1-to-16.2.2/report.json"), join(dir, "report.json"));
    const { confidence: c } = scoreAndWrite({ outDir: dir, release: dir });
    expect(c.glanceBasis!.checked.map((k) => k.kind)).toEqual(["broad-claim", "near-miss", "fixed-on-b"]);
    expect(c.glanceBasis!.notChecked.map((k) => k.kind)).toEqual(["mask-added", "first-time-hotspot", "new-persistence", "major-bump", "duration-moved"]);
    expect(kinds(c.glance)).toEqual(["fixed-on-b", "fixed-on-b", "fixed-on-b"]);
    expect(c.glance[0]!.links.hunk).toMatch(/^report\.html#hunk-console:/);
  });
});

// ---- marks ------------------------------------------------------------------------------------------------

/** A scored harness release directory with a glance of `count` fixed-on-b items and a report.md carrying the block. */
function scoredDir(band: Confidence["band"], count = 3): string {
  const dir = tmp("marks");
  const run = join(dir, "run-release");
  mkdirSync(run, { recursive: true });
  const pages = ["catalogue:home", "live:home", "reader:search", "reader:home"].slice(0, count);
  writeFileSync(join(run, "report.json"), JSON.stringify({ ...report({ hunks: pages.map((pk) => hunk("console", pk, { severity: "info", summary: `${pk}: console message gone on b`, detail: "error: x" })) }) }));
  const { confidence: c } = scoreAndWrite({ outDir: dir, release: run, gate: "PASS" });
  const forced = { ...c, band, rcs: band === "Amber" ? 85 : band === "Green" ? 95 : 60 };
  writeFileSync(join(dir, "confidence.json"), JSON.stringify(forced, null, 2));
  const block = renderGlanceMarkdown(forced, { dir });
  writeFileSync(join(dir, "report.md"), `## Release gate\n\n**Gate: PASS**\n\n${block}\n\n### Stages\n`);
  writeFileSync(join(dir, "report.html"), `<p>gate</p>\n${block.replace("###", "<h2>")}\n<h2>Stages</h2>`);
  return dir;
}

describe("marks", () => {
  it("mark appends one line to glance-marks.jsonl, re-renders the glance, and leaves the rest alone", () => {
    const dir = scoredDir("Amber");
    const before = readFileSync(join(dir, "report.md"), "utf8");
    const out: string[] = [];
    expect(glanceCommand("mark", { run: dir, item: "2", mark: "disputed", by: "ana", note: "the error is a real fix, claim it" }, { now: () => NOW, log: (m) => out.push(m) })).toBe(0);
    const lines = readFileSync(join(dir, MARKS_FILE), "utf8").trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]!)).toMatchObject({ schemaVersion: 1, item: 2, kind: "fixed-on-b", mark: "disputed", by: "ana", at: NOW.toISOString(), becomes: "becomes a new claim or a hold", note: "the error is a real fix, claim it" });
    expect(out[0]).toMatch(/^item 2 marked disputed by ana \(looked, and does not agree\): becomes a new claim or a hold/);
    const after = readFileSync(join(dir, "report.md"), "utf8");
    expect(after).toContain("mark: **disputed** by ana (the error is a real fix, claim it)");
    expect(after.slice(0, after.indexOf(GLANCE_START))).toBe(before.slice(0, before.indexOf(GLANCE_START)));
    expect(after.slice(after.indexOf(GLANCE_END))).toBe(before.slice(before.indexOf(GLANCE_END)));
    const c = readScored(dir).confidence;
    expect(c.glance[1]!.mark).toMatchObject({ mark: "disputed", by: "ana" });
    expect(c.glance[0]!.mark).toBeNull();
    expect(c.rcs).toBe(85);
  });

  it("escalated records whyWanted for the 5 Whys; a changed mind is a new line and the latest wins", () => {
    const dir = scoredDir("Green");
    markItem({ run: dir, item: "1", mark: "escalated", by: "ana", now: NOW });
    const first = parseMarks(readFileSync(join(dir, MARKS_FILE), "utf8"));
    expect(first[0]).toMatchObject({ mark: "escalated", whyWanted: true, becomes: "becomes a 5 Whys" });
    const o = markItem({ run: dir, item: "1", mark: "verified", by: "ana", now: NOW });
    expect(parseMarks(readFileSync(join(dir, MARKS_FILE), "utf8"))).toHaveLength(2);
    expect(o.status.items[0]!.mark!.mark).toBe("verified");
  });

  it("a mark follows its finding, not its rank, when a re-score reorders the glance", () => {
    const items = [{ rank: 1, kind: "fixed-on-b", key: "a" }, { rank: 2, kind: "fixed-on-b", key: "b" }] as GlanceItem[];
    const rec = markRecord({ item: items[1]!, mark: "verified", by: "ana", at: NOW });
    const reordered = applyMarks([{ ...items[1]!, rank: 1 }, { ...items[0]!, rank: 2 }], [rec]);
    expect(reordered.map((i) => [i.key, i.mark?.mark ?? null])).toEqual([
      ["b", "verified"],
      ["a", null]
    ]);
  });

  it("refuses what it cannot use, as usage errors: no --run, an item out of range, a mark that is not one of three, no --by", () => {
    const dir = scoredDir("Amber");
    const run = (v: Record<string, string>) => () => glanceCommand("mark", v, { now: () => NOW, log: () => {} });
    expect(run({ item: "1", mark: "verified", by: "a" })).toThrow(UsageError);
    expect(run({ run: dir, item: "4", mark: "verified", by: "a" })).toThrow(/--item takes a number from 1 to 3/);
    expect(run({ run: dir, item: "1", mark: "fine", by: "a" })).toThrow(/--mark takes one of verified, disputed, escalated/);
    expect(run({ run: dir, item: "1", mark: "verified" })).toThrow(/--by names who looked/);
    expect(existsSync(join(dir, MARKS_FILE))).toBe(false);
  });

  it("says, without refusing, when the Reviewer is named as a PR's author in changes.json", () => {
    const dir = scoredDir("Amber");
    writeFileSync(join(dir, "changes.json"), JSON.stringify({ prs: [{ pr: 9, sha: "abc", author: "Ana" }] }));
    const o = markItem({ run: dir, item: "1", mark: "verified", by: "ana", now: NOW });
    expect(o.warning).toContain("the author of PR #9 in changes.json; the SOP's Reviewer authored no PR in this release");
  });
});

describe("status, and the Amber rule", () => {
  it("Amber: go only once every item is recorded verified", () => {
    const dir = scoredDir("Amber");
    const status = () => {
      const out: string[] = [];
      expect(glanceCommand("status", { run: dir, json: true }, { log: (m) => out.push(m) })).toBe(0);
      return JSON.parse(out[0]!) as { allVerified: boolean; amber: boolean; go: string; counts: Record<string, number> };
    };
    expect(status()).toMatchObject({ amber: true, allVerified: false, counts: { verified: 0, unmarked: 3 }, go: "Amber: the glance is not yet recorded verified (0 of 3 verified): not a go (SOP step 9)." });
    for (const item of ["1", "2"]) markItem({ run: dir, item, mark: "verified", by: "ana", now: NOW });
    markItem({ run: dir, item: "3", mark: "disputed", by: "ana", now: NOW });
    expect(status()).toMatchObject({ allVerified: false, go: "Amber: the glance is not yet recorded verified (2 of 3 verified): not a go (SOP step 9)." });
    markItem({ run: dir, item: "3", mark: "verified", by: "ana", now: NOW });
    expect(status()).toMatchObject({ allVerified: true, go: "Amber: the glance is recorded verified (3 of 3 verified): go may be recorded (SOP step 9)." });
    expect(readFileSync(join(dir, "report.md"), "utf8")).toContain("**Amber: the glance is recorded verified (3 of 3 verified): go may be recorded (SOP step 9).**");
  });

  it("the text board lists each item with its links and mark, the follow-ups, and how to mark", () => {
    const dir = scoredDir("Green");
    markItem({ run: dir, item: "2", mark: "escalated", by: "ana", now: NOW });
    const out: string[] = [];
    glanceCommand("status", { run: dir }, { log: (m) => out.push(m) });
    const text = out.join("\n");
    expect(text).toMatch(/^Gate: PASS\nRCS 95 Green/);
    expect(text).toContain("2. [escalated by ana] Fixed on b:");
    expect(text).toContain("item 2 escalated by ana: becomes a 5 Whys (whyWanted)");
    expect(text).toContain(`mark: harness glance mark --run ${dir} --item <n>`);
    expect(text).toContain("Marks never change the Gate or an exit code.");
  });

  it("exits 0 always once --run is given: no directory, no confidence.json, a Red or FAIL release", () => {
    const log = () => {};
    expect(glanceCommand("status", { run: "/does/not/exist" }, { log })).toBe(0);
    expect(glanceCommand("status", { run: tmp("empty") }, { log })).toBe(0);
    expect(glanceCommand("status", { run: scoredDir("Red") }, { log })).toBe(0);
    expect(glanceStatus({ glance: [], band: null, gate: "FAIL" }, []).go).toBe("Gate FAIL: the glance does not decide go; it is kept for the 5 Whys.");
    expect(glanceStatus({ glance: [], band: "Red", gate: "PASS" }, []).go).toBe("Red: hold and open a 5 Whys whatever the marks say (SOP step 9).");
    expect(() => glanceCommand("status", {}, { log })).toThrow(UsageError);
    expect(() => glanceCommand("nope", {}, { log })).toThrow(UsageError);
  });
});

// ---- the files ---------------------------------------------------------------------------------------------

describe("the files", () => {
  const schema = (name: string) => new Ajv({ allErrors: true, strict: true }).compile(JSON.parse(readFileSync(join(ROOT, "docs/contract", name), "utf8")));

  it("confidence.json with a glance and marks matches its schema; a mark line matches its own", () => {
    const dir = scoredDir("Amber");
    markItem({ run: dir, item: "1", mark: "escalated", by: "ana", note: "cannot tell", now: NOW });
    const v = schema("confidence.schema.json");
    v(JSON.parse(readFileSync(join(dir, "confidence.json"), "utf8")));
    expect(v.errors ?? []).toEqual([]);
    const m = schema("glance-marks.schema.json");
    m(JSON.parse(readFileSync(join(dir, MARKS_FILE), "utf8").trim()));
    expect(m.errors ?? []).toEqual([]);
  });

  it("the scoreboard line carries the glance's count, marks and seen keys, and the mask ids; both optional, additive", () => {
    const dir = scoredDir("Amber");
    markItem({ run: dir, item: "1", mark: "verified", by: "ana", now: NOW });
    const { confidence, records } = readScored(dir);
    const r = report({ masks: { "b-mask": 1, "a-mask": 0 } });
    const line = buildLine({ confidence, release: r, marks: records, existing: [], tag: "16.3.0-rc.1", now: NOW });
    expect(line.glance).toMatchObject({ items: 3, marks: { verified: 1, disputed: 0, escalated: 0, unmarked: 2 }, checked: ["broad-claim", "near-miss", "fixed-on-b"] });
    expect(line.glance!.seen).toHaveLength(3);
    expect(line.maskIds).toEqual(["a-mask", "b-mask"]);
    const v = schema("scoreboard-line.schema.json");
    v(JSON.parse(JSON.stringify(line)));
    expect(v.errors ?? []).toEqual([]);
    // a confidence.json from before 1.12.0 has no glanceBasis: no glance on the line
    const { glanceBasis: _b, ...old } = confidence;
    expect(buildLine({ confidence: old as Confidence, existing: [], tag: "16.3.0-rc.1", now: NOW }).glance).toBeUndefined();
  });

  it("the block is replaced between its markers and nowhere else; a file without it is left alone", () => {
    expect(replaceGlanceBlock("a\nb", "X")).toEqual({ text: "a\nb", replaced: false });
    expect(replaceGlanceBlock(`top\n${GLANCE_START}\nold\n${GLANCE_END}\nend`, `${GLANCE_START}new${GLANCE_END}`)).toEqual({ text: `top\n${GLANCE_START}new${GLANCE_END}\nend`, replaced: true });
  });
});
