import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { addEntry, entryId, keepReport, parseIndex, type ReportEntry, type ReportIndex } from "../src/ci/report-archive.ts";
import type { Changes } from "../src/changes/signals.ts";
import { reportsCommand, UsageError } from "../src/local/cli.ts";
import { GLANCE_END, GLANCE_START } from "../src/glance/render.ts";
import { LEAD_CSS } from "../src/report/lead.ts";
import type { Confidence } from "../src/score/confidence.ts";
import { scoredRun } from "./support/scored-run.ts";

const tmp = () => mkdtempSync(join(tmpdir(), "report-archive-"));

function runDir(root: string, ranAt: string, mode = "noise", verdict = "pass", extra: string[] = []): string {
  const dir = join(root, `${ranAt.replace(/:/g, "-")}-${mode}`);
  mkdirSync(join(dir, "a"), { recursive: true });
  const report = { schemaVersion: 1, harness: { version: "1.4.1", gitSha: null, contractVersion: "1.4.0" }, harnessVersion: "1.4.1", mode, ranAt, verdict, reasons: ["no unclaimed differences"], compare: { hunks: [], matches: [], unclaimed: [], staleClaims: [], broadUnapproved: [] }, sides: { a: { reader: "16.2.2" }, b: { reader: "16.2.2" } } };
  writeFileSync(join(dir, "report.json"), JSON.stringify(report));
  writeFileSync(join(dir, "report.md"), `## ${mode} ${ranAt}\n`);
  writeFileSync(join(dir, "report.html"), "<p>report</p>");
  writeFileSync(join(dir, "a", "capture.json"), "{}");
  for (const f of extra) writeFileSync(join(dir, f), "x");
  return dir;
}

const entry = (ranAt: string, id = ranAt): ReportEntry => ({ id, mode: "noise", ranAt, verdict: "pass", reasons: [], sides: { a: {}, b: {} }, harnessVersion: "1.4.1", files: [] });

describe("the report index", () => {
  it("names a run by its instant and mode, safe in a URL", () => {
    expect(entryId({ ranAt: "2026-09-26T07:57:09.931Z", mode: "noise" })).toBe("2026-09-26T07-57-09Z-noise");
    expect(() => entryId({ ranAt: "../../etc", mode: "noise" })).toThrow(/unsafe/);
  });

  it("keeps runs newest first and replaces a run kept twice", () => {
    let index: ReportIndex = { schemaVersion: 1, runs: [] };
    index = addEntry(index, entry("2026-09-24T00:00:00Z", "b")).index;
    index = addEntry(index, entry("2026-09-25T00:00:00Z", "c")).index;
    index = addEntry(index, entry("2026-09-23T00:00:00Z", "a")).index;
    index = addEntry(index, { ...entry("2026-09-25T00:00:00Z", "c"), verdict: "warn" }).index;
    expect(index.runs.map((r) => r.id)).toEqual(["c", "b", "a"]);
    expect(index.runs[0]!.verdict).toBe("warn");
  });

  it("drops the oldest past --keep-last and says which", () => {
    let index: ReportIndex = { schemaVersion: 1, runs: [] };
    for (const d of ["21", "22", "23"]) index = addEntry(index, entry(`2026-09-${d}T00:00:00Z`, d), 2).index;
    const { index: after, dropped } = addEntry(index, entry("2026-09-24T00:00:00Z", "24"), 2);
    expect(after.runs.map((r) => r.id)).toEqual(["24", "23"]);
    expect(dropped).toEqual(["22"]);
  });

  it("a damaged or foreign index starts again instead of stopping the publish", () => {
    expect(parseIndex("{not json").runs).toEqual([]);
    expect(parseIndex(JSON.stringify({ schemaVersion: 2, runs: [entry("x")] })).runs).toEqual([]);
    expect(parseIndex(undefined).runs).toEqual([]);
  });
});

describe("keeping a run's report", () => {
  it("copies the three report files byte for byte, and nothing else of the run", () => {
    const root = tmp();
    const dir = runDir(root, "2026-09-26T07:57:09.931Z", "noise", "pass", ["summary.txt"]);
    const store = join(root, "store");
    const { entry: kept } = keepReport({ dir, store, runUrl: "https://github.com/o/r/actions/runs/1" });
    const target = join(store, "reports", "2026-09-26T07-57-09Z-noise");
    expect(readdirSync(target).sort()).toEqual(["report.html", "report.json", "report.md", "scorecard.json", "scorecard.md"]);
    expect(readFileSync(join(target, "report.json"), "utf8")).toBe(readFileSync(join(dir, "report.json"), "utf8"));
    expect(kept).toMatchObject({ mode: "noise", verdict: "pass", harnessVersion: "1.4.1", runUrl: "https://github.com/o/r/actions/runs/1", sides: { a: { reader: "16.2.2" } } });
    expect(kept.files).toEqual(["report.json", "report.md", "report.html", "scorecard.json", "scorecard.md"].map((f) => `2026-09-26T07-57-09Z-noise/${f}`));
    expect(kept.score).toEqual({ score: 100, grade: "A", normalness: "normal", manual: 0 });
    const index = parseIndex(readFileSync(join(store, "reports", "index.json"), "utf8"));
    expect(index.runs.map((r) => r.id)).toEqual(["2026-09-26T07-57-09Z-noise"]);
  });

  it("with --keep-last, the directories of dropped runs go too, so a force-pushed branch does not grow", () => {
    const root = tmp();
    const store = join(root, "store");
    for (const day of ["22", "23", "24"]) keepReport({ dir: runDir(root, `2026-09-${day}T07:50:00.000Z`), store, keepLast: 2 });
    const reports = join(store, "reports");
    expect(readdirSync(reports).sort()).toEqual(["2026-09-23T07-50-00Z-noise", "2026-09-24T07-50-00Z-noise", "index.json"]);
  });

  it("without --keep-last, every run stays (the release records keep every candidate)", () => {
    const root = tmp();
    const store = join(root, "store");
    for (const day of ["22", "23", "24"]) keepReport({ dir: runDir(root, `2026-09-${day}T07:50:00.000Z`, "release"), store });
    expect(parseIndex(readFileSync(join(store, "reports", "index.json"), "utf8")).runs).toHaveLength(3);
  });

  it("takes the report.json itself as well as its directory", () => {
    const root = tmp();
    const dir = runDir(root, "2026-09-26T07:57:09.931Z");
    keepReport({ dir: join(dir, "report.json"), store: join(root, "store") });
    expect(existsSync(join(root, "store", "reports", "2026-09-26T07-57-09Z-noise", "report.html"))).toBe(true);
  });

  it("a run that wrote no report is said plainly", () => {
    const root = tmp();
    expect(() => keepReport({ dir: root, store: join(root, "store") })).toThrow(/no report\.json/);
  });
});

describe("keeping a release run scored beside it (Main to RC, since 1.13.1)", () => {
  const ranAt = "2026-09-28T05:00:00.000Z";
  const id = "2026-09-28T05-00-00Z-release";

  it("keeps confidence.json and changes.json byte for byte, and says the Gate, the RCS, the glance and the change risk in the index", async () => {
    const root = tmp();
    const dir = await scoredRun(root, { ranAt, unclaimed: 1 });
    const store = join(root, "store");
    const { entry: kept } = keepReport({ dir, store });
    const target = join(store, "reports", id);
    expect(readdirSync(target).sort()).toEqual(["changes.json", "confidence.json", "report.html", "report.json", "report.md", "scorecard.json", "scorecard.md"]);
    for (const f of ["confidence.json", "changes.json", "report.json"]) expect(readFileSync(join(target, f), "utf8"), f).toBe(readFileSync(join(dir, f), "utf8"));
    const c = JSON.parse(readFileSync(join(dir, "confidence.json"), "utf8")) as Confidence;
    const ch = JSON.parse(readFileSync(join(dir, "changes.json"), "utf8")) as Changes;
    expect(kept.confidence).toEqual({ gate: "FAIL", rcs: null, band: null, note: c.note, glance: c.glance.length, scoredBy: "1.13.1" });
    expect(kept.changes).toEqual({ score: ch.score, prs: ch.prs.length, risky: ch.prs.filter((p) => p.deductions.length).length, floorBreached: ch.floorBreached, range: "v1.0.4..v1.1.0" });
    expect(parseIndex(readFileSync(join(store, "reports", "index.json"), "utf8")).runs[0]).toEqual(kept);
  }, 60_000);

  it("leads report.md as harness release leads its own: the Gate, the RCS, the glance, the dimensions, the change risk per PR, then the run's report", async () => {
    const root = tmp();
    const dir = await scoredRun(root, { ranAt });
    const store = join(root, "store");
    keepReport({ dir, store });
    const md = readFileSync(join(store, "reports", id, "report.md"), "utf8");
    const c = JSON.parse(readFileSync(join(dir, "confidence.json"), "utf8")) as Confidence;
    const at = (s: string) => {
      const i = md.indexOf(s);
      expect(i, s).toBeGreaterThanOrEqual(0);
      return i;
    };
    expect(md.startsWith("## Release gate: sha-3f1c2a9 beside 1.0.4\n\n**Gate: PASS**\n")).toBe(true);
    const order = [at("**Gate: PASS**"), at(`**RCS ${c.rcs} ${c.band}: ${c.meaning}**`), at(GLANCE_START), at(GLANCE_END), at("| dimension | weight |"), at("#### Change risk per PR"), at("<details><summary>release: PASS</summary>"), at(readFileSync(join(dir, "report.md"), "utf8").trim())];
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    // the glance's mark hint names the kept directory, not the runner's
    expect(md).toContain(`--run reports/${id} --item <n>`);
  }, 60_000);

  it("leads report.html with the same blocks and styles, and keeps the run's page under them", async () => {
    const root = tmp();
    const dir = await scoredRun(root, { ranAt, unclaimed: 1 });
    keepReport({ dir, store: join(root, "store") });
    const html = readFileSync(join(root, "store", "reports", id, "report.html"), "utf8");
    const own = readFileSync(join(dir, "report.html"), "utf8");
    expect(html).toContain(`<style>\n${LEAD_CSS}\n</style>\n</head>`);
    const body = html.indexOf("<body>");
    // the run's own page, from its <body> on, follows the lead unchanged
    const ownBody = own.slice(own.indexOf("<body>") + "<body>".length);
    expect(html.endsWith(ownBody)).toBe(true);
    const order = [body, html.indexOf('<section class="lead">'), html.indexOf('<p class="gate fail">Gate: FAIL <small>(exit 1)</small></p>'), html.indexOf('<p class="rcs none">'), html.indexOf(GLANCE_START), html.indexOf('<h2 id="change-risk">'), html.length - ownBody.length];
    for (const i of order) expect(i).toBeGreaterThan(0);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    expect(html).toContain('href="report.html#hunk-dom:/course:1"');
  }, 60_000);

  it("keeps nothing extra and leads nothing when the score beside the run scored another run, or is not a score", async () => {
    const root = tmp();
    const dir = await scoredRun(root, { ranAt });
    const c = JSON.parse(readFileSync(join(dir, "confidence.json"), "utf8")) as Confidence;
    writeFileSync(join(dir, "confidence.json"), JSON.stringify({ ...c, run: { ...c.run, ranAt: "2026-09-27T05:00:00.000Z" } }));
    const { entry: stale } = keepReport({ dir, store: join(root, "a") });
    expect(stale.confidence).toBeUndefined();
    expect(stale.changes).toBeUndefined();
    expect(readdirSync(join(root, "a", "reports", id))).not.toContain("confidence.json");
    expect(readFileSync(join(root, "a", "reports", id, "report.md"), "utf8")).toBe(readFileSync(join(dir, "report.md"), "utf8"));
    writeFileSync(join(dir, "confidence.json"), "{not json");
    expect(keepReport({ dir, store: join(root, "b") }).entry.confidence).toBeUndefined();
  }, 60_000);

  it("a noise run is never led, whatever sits beside it", () => {
    const root = tmp();
    const dir = runDir(root, ranAt, "noise", "pass", ["confidence.json", "changes.json"]);
    const { entry: kept } = keepReport({ dir, store: join(root, "store") });
    expect(kept.confidence).toBeUndefined();
    expect(kept.files.some((f) => f.endsWith("confidence.json"))).toBe(false);
  });
});

describe("harness reports keep", () => {
  it("needs keep and --dir", () => {
    expect(() => reportsCommand("list", {})).toThrow(UsageError);
    expect(() => reportsCommand("keep", {})).toThrow(/--dir/);
  });

  it("says what it kept", () => {
    const root = tmp();
    const lines: string[] = [];
    const code = reportsCommand("keep", { dir: runDir(root, "2026-09-26T07:57:09.931Z", "release", "warn"), store: join(root, "store"), "keep-last": "5" }, (m) => lines.push(m));
    expect(code).toBe(0);
    expect(lines.join("\n")).toMatch(/kept release 2026-09-26T07:57:09.931Z \(WARN\): reports\/2026-09-26T07-57-09Z-release\/ 5 file\(s\), score 90 \(A\)/);
  });
});
