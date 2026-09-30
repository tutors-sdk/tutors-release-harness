import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { addEntry, entryId, keepReport, parseIndex, relink, type ReportEntry, type ReportIndex } from "../src/ci/report-archive.ts";
import type { Changes } from "../src/changes/signals.ts";
import { reportsCommand, UsageError } from "../src/local/cli.ts";
import { GLANCE_END, GLANCE_START } from "../src/glance/render.ts";
import { LEAD_CSS } from "../src/report/lead.ts";
import type { Confidence } from "../src/score/confidence.ts";
import { rehearsalRun, scoredRun } from "./support/scored-run.ts";

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

  it("--keep-days is a floor under --keep-last: a run younger than n days is never dropped, whatever the count (since 1.16.0)", () => {
    const now = Date.parse("2026-09-30T12:00:00Z");
    let index: ReportIndex = { schemaVersion: 1, runs: [] };
    // a night eleven days ago, a night nine days ago, then a day of runs by hand
    const ids = ["2026-09-19T03:00:00Z", "2026-09-21T03:00:00Z", "2026-09-30T08:00:00Z", "2026-09-30T09:00:00Z", "2026-09-30T10:00:00Z"];
    for (const at of ids) index = addEntry(index, entry(at), 2, { keepDays: 10, now }).index;
    expect(index.runs.map((r) => r.id)).toEqual([...ids].reverse().slice(0, 4));
    // exactly n days old is still inside the floor; a moment older is not
    const edge = addEntry({ schemaVersion: 1, runs: [entry("2026-09-20T12:00:00Z"), entry("2026-09-20T11:59:59Z")] }, entry("2026-09-30T11:00:00Z"), 1, { keepDays: 10, now });
    expect(edge.index.runs.map((r) => r.id)).toEqual(["2026-09-30T11:00:00Z", "2026-09-20T12:00:00Z"]);
    expect(edge.dropped).toEqual(["2026-09-20T11:59:59Z"]);
    // the floor only ever keeps more: past it, --keep-last decides as before
    const many = Array.from({ length: 5 }, (_, i) => entry(`2026-09-0${i + 1}T00:00:00Z`));
    const counted = addEntry({ schemaVersion: 1, runs: many }, entry("2026-09-30T11:00:00Z"), 3, { keepDays: 10, now });
    expect(counted.index.runs).toHaveLength(3);
    expect(counted.dropped).toEqual(["2026-09-03T00:00:00Z", "2026-09-02T00:00:00Z", "2026-09-01T00:00:00Z"]);
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

  it("with --keep-days, the directories of runs inside the floor stay even past --keep-last", () => {
    const root = tmp();
    const store = join(root, "store");
    const now = Date.parse("2026-09-24T12:00:00.000Z");
    for (const day of ["10", "22", "23", "24"]) keepReport({ dir: runDir(root, `2026-09-${day}T07:50:00.000Z`), store, keepLast: 2, keepDays: 3, now });
    expect(readdirSync(join(store, "reports")).sort()).toEqual(["2026-09-22T07-50-00Z-noise", "2026-09-23T07-50-00Z-noise", "2026-09-24T07-50-00Z-noise", "index.json"]);
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

  it("keeps the migration and upgrade rehearsals beside the run, and the kept confidence.json links them there (since 1.16.0)", async () => {
    const root = tmp();
    const migration = rehearsalRun(root, "migration", { ranAt: "2026-09-28T04:40:00.000Z" });
    const upgrade = rehearsalRun(root, "upgrade", { ranAt: "2026-09-28T04:41:00.000Z", verdict: "fail" });
    const dir = await scoredRun(root, { ranAt, unclaimed: 1, rehearsals: { migration, upgrade } });
    const written = readFileSync(join(dir, "confidence.json"), "utf8");
    // as scored on the runner: links into a directory the kept pages do not have
    expect(written).toContain('"../../rehearsals/upgrade/2026-09-28T04-41-00-000Z-upgrade/report.html#upgrade"');
    const store = join(root, "store");
    const { entry: kept, notKept } = keepReport({ dir, store, migration, upgrade: join(upgrade, "report.json") });
    expect(notKept).toEqual([]);
    const target = join(store, "reports", id);
    for (const [name, from] of [["migration", migration], ["upgrade", upgrade]] as const) {
      expect(readdirSync(join(target, name)).sort(), name).toEqual(["report.html", "report.json", "report.md"]);
      for (const f of ["report.json", "report.md", "report.html"]) expect(readFileSync(join(target, name, f), "utf8"), `${name}/${f}`).toBe(readFileSync(join(from, f), "utf8"));
    }
    expect(kept.files).toEqual(expect.arrayContaining([`${id}/migration/report.json`, `${id}/migration/report.html`, `${id}/upgrade/report.md`]));
    const c = JSON.parse(readFileSync(join(target, "confidence.json"), "utf8")) as Confidence;
    expect(c.run.reports).toMatchObject({ release: "report.json", migration: "migration/report.json", upgrade: "upgrade/report.json" });
    const dim = c.dimensions.find((d) => d.id === "rehearsals")!;
    expect(dim.evidence).toEqual(["migration/report.html#migration", "upgrade/report.html#upgrade"]);
    expect(dim.deductions?.map((d) => d.evidence)).toEqual(["upgrade/report.html#upgrade"]);
    // nothing else of the score moved, and nothing in it still points off the kept pages
    const kept2 = readFileSync(join(target, "confidence.json"), "utf8");
    expect(kept2).not.toContain("../");
    expect(kept2.replaceAll(/"(migration|upgrade)\/report/g, "X")).toBe(written.replaceAll(/"\.\.\/\.\.\/rehearsals\/(migration|upgrade)\/[^/]+\/report/g, "X"));
    // and the lead of the kept report links the kept copy
    expect(readFileSync(join(target, "report.html"), "utf8")).toContain("upgrade/report.html#upgrade");
    expect(readFileSync(join(target, "report.html"), "utf8")).not.toContain("../../rehearsals/");
  }, 60_000);

  it("keeps confidence.json byte for byte when no rehearsal is given, and says why a rehearsal it could not keep was not kept", async () => {
    const root = tmp();
    const migration = rehearsalRun(root, "migration", { ranAt: "2026-09-28T04:40:00.000Z" });
    const dir = await scoredRun(root, { ranAt, rehearsals: { migration } });
    keepReport({ dir, store: join(root, "a") });
    expect(readFileSync(join(root, "a", "reports", id, "confidence.json"), "utf8")).toBe(readFileSync(join(dir, "confidence.json"), "utf8"));
    // a release run given as the upgrade rehearsal, and a directory with no report: the run is still kept, with what could be
    const { entry: kept, notKept } = keepReport({ dir, store: join(root, "b"), migration, upgrade: dir });
    expect(notKept).toEqual([`--upgrade ${dir}: a release-mode report, not upgrade`]);
    expect(kept.files.some((f) => f.includes("/upgrade/"))).toBe(false);
    expect(keepReport({ dir, store: join(root, "c"), upgrade: join(root, "nowhere") }).notKept[0]).toMatch(/^--upgrade .*nowhere: no report\.json/);
    const c = JSON.parse(readFileSync(join(root, "b", "reports", id, "confidence.json"), "utf8")) as Confidence;
    expect(c.run.reports.migration).toBe("migration/report.json");
  }, 60_000);

  it("relink moves whole path segments only, and leaves a score that links nothing moved as the same object", () => {
    const c = { run: { reports: { release: "report.json", migration: "../m/x-migration/report.json" } }, dimensions: [{ evidence: ["../m/x-migration#top", "../m/x-migration-2/report.html", "no migration run directory"] }] } as unknown as Confidence;
    const out = relink(c, [["../m/x-migration", "migration"]]) as unknown as { run: { reports: Record<string, string> }; dimensions: { evidence: string[] }[] };
    expect(out.run.reports).toEqual({ release: "report.json", migration: "migration/report.json" });
    expect(out.dimensions[0]!.evidence).toEqual(["migration#top", "../m/x-migration-2/report.html", "no migration run directory"]);
    expect(relink(c, [["../elsewhere", "upgrade"], ["", "migration"]])).toBe(c);
  });

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

  it("takes --keep-days, --migration and --upgrade, and says which rehearsals it kept and which it could not", () => {
    const root = tmp();
    const lines: string[] = [];
    const dir = runDir(root, "2026-09-26T07:57:09.931Z", "release", "warn");
    const migration = rehearsalRun(root, "migration", { ranAt: "2026-09-26T07:40:00.000Z" });
    const upgrade = rehearsalRun(root, "upgrade", { ranAt: "2026-09-26T07:41:00.000Z" });
    expect(reportsCommand("keep", { dir, store: join(root, "store"), "keep-last": "5", "keep-days": "10", migration, upgrade }, (m) => lines.push(m))).toBe(0);
    expect(lines.join("\n")).toMatch(/11 file\(s\), score 90 \(A\), with the migration and upgrade rehearsals$/);
    lines.length = 0;
    expect(reportsCommand("keep", { dir, store: join(root, "store"), upgrade: migration }, (m) => lines.push(m))).toBe(0);
    expect(lines).toEqual([expect.stringMatching(/5 file\(s\), score 90 \(A\)$/), `  rehearsal not kept: --upgrade ${migration}: a migration-mode report, not upgrade`]);
    expect(() => reportsCommand("keep", { dir, "keep-days": "0" })).toThrow(/--keep-days takes a whole number, 1 or more/);
  });
});
