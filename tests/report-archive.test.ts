import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Ajv } from "ajv";
import { addEntry, entryId, keepReport, parseIndex, relink, type ReportEntry, type ReportIndex } from "../src/ci/report-archive.ts";
import { deltaKey, unclaimedDelta } from "../src/report/delta.ts";
import { DELTA_LISTED } from "../src/report/lead.ts";
import type { Hunk } from "../src/types.ts";
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

// ---- new since the last forecast (since 1.16.1) ---------------------------------------------------------

const hunk = (artefact: string, scope: string, summary: string, n = 1): Hunk => ({ id: `${artefact}:${scope}:${n}`, artefact, scope, summary, severity: "fail" }) as Hunk;

/** A release run with these unclaimed differences, beside `baseline`, as `<root>/<ranAt>-release/`. */
function releaseRun(root: string, ranAt: string, unclaimed: Hunk[], o: { baseline?: string; candidate?: string; harness?: string } = {}): string {
  const dir = join(root, "runs", `${ranAt.replace(/:/g, "-")}-release`);
  mkdirSync(dir, { recursive: true });
  const harness = o.harness ?? "1.16.1";
  const report = {
    schemaVersion: 1,
    harness: { version: harness, gitSha: null, contractVersion: harness },
    harnessVersion: harness,
    mode: "release",
    ranAt,
    verdict: unclaimed.length ? "fail" : "pass",
    reasons: [`${unclaimed.length} unclaimed diff(s)`],
    compare: { hunks: unclaimed, matches: unclaimed.map((h) => ({ hunk: h })), unclaimed, staleClaims: [], broadUnapproved: [] },
    sides: { a: { reader: `quay.io/tutors-sdk/tutors-reader:${o.baseline ?? "16.2.2"}` }, b: { reader: `quay.io/tutors-sdk/tutors-reader:${o.candidate ?? "sha-0000001"}` } }
  };
  writeFileSync(join(dir, "report.json"), JSON.stringify(report));
  writeFileSync(join(dir, "report.md"), "## release\n");
  writeFileSync(join(dir, "report.html"), "<p>report</p>");
  return dir;
}

describe("new since the last forecast: the delta (since 1.16.1)", () => {
  it("a difference is the same across runs when its artefact, scope and summary with every number masked are", () => {
    expect(deltaKey(hunk("dom", "reader:home", "semantic DOM differs (+51 −25 lines at line 4)"))).toBe(deltaKey(hunk("dom", "reader:home", "semantic DOM differs (+6 −7 lines at line 36)", 9)));
    expect(deltaKey(hunk("dom", "reader:home", "x 1.5 ms"))).not.toBe(deltaKey(hunk("dom", "reader:course", "x 1.5 ms")));
    expect(deltaKey(hunk("dom", "reader:home", "x"))).not.toBe(deltaKey(hunk("axe", "reader:home", "x")));
  });

  it("counts as multisets, so new − gone is always the change in the unclaimed count", () => {
    const prev = [hunk("dom", "a", "moved 1"), hunk("dom", "a", "moved 2"), hunk("sbom", "reader", "package removed: curl"), hunk("sbom", "reader", "package removed: git")];
    const cur = [hunk("dom", "a", "moved 7"), hunk("dom", "a", "moved 8"), hunk("dom", "a", "moved 9"), hunk("network", "GET /x", "requested 3 times")];
    const { fresh, gone } = unclaimedDelta(cur, prev);
    expect(fresh.map((h) => h.summary)).toEqual(["moved 9", "requested 3 times"]);
    expect(gone.map((h) => h.summary)).toEqual(["package removed: curl", "package removed: git"]);
    expect(fresh.length - gone.length).toBe(cur.length - prev.length);
    expect(unclaimedDelta(cur, cur)).toEqual({ fresh: [], gone: [] });
  });

  it("stores the delta against the previous kept release run beside the same baseline, and starts again when production moves", () => {
    const root = tmp();
    const store = join(root, "store");
    const first = keepReport({ dir: releaseRun(root, "2026-09-27T09:14:51.000Z", [hunk("dom", "reader:home", "moved 1"), hunk("sbom", "reader", "package removed: curl")], { candidate: "sha-54a8f83" }), store }).entry;
    expect(first.delta).toEqual({ baseline: "16.2.2", against: null });
    const second = keepReport({ dir: releaseRun(root, "2026-09-28T03:45:17.000Z", [hunk("dom", "reader:home", "moved 4"), hunk("axe", "reader:course", "color-contrast"), hunk("axe", "reader:topic", "color-contrast")], { candidate: "sha-017ceb6", harness: "1.16.1" }), store }).entry;
    expect(second.delta).toEqual({
      baseline: "16.2.2",
      against: { id: "2026-09-27T09-14-51Z-release", ranAt: "2026-09-27T09:14:51.000Z", candidate: "sha-54a8f83", harnessVersion: "1.16.1" },
      new: 2,
      gone: 1,
      byArtefact: { axe: { new: 2, gone: 0 }, sbom: { new: 0, gone: 1 } }
    });
    // production moved: nothing is compared across baselines
    const moved = keepReport({ dir: releaseRun(root, "2026-09-29T03:45:17.000Z", [hunk("dom", "reader:home", "moved 4")], { baseline: "16.3.0" }), store }).entry;
    expect(moved.delta).toEqual({ baseline: "16.3.0", against: null });
    // back on 16.2.2 (a run by hand), the previous 16.2.2 run is the one compared with, not the newest
    const back = keepReport({ dir: releaseRun(root, "2026-09-29T09:00:00.000Z", [hunk("dom", "reader:home", "moved 4")]), store }).entry;
    expect(back.delta).toMatchObject({ against: { id: "2026-09-28T03-45-17Z-release" }, new: 0, gone: 2 });
    // kept again (a re-run of the same job): compared with the run before it, never with itself
    expect(keepReport({ dir: releaseRun(root, "2026-09-29T09:00:00.000Z", [hunk("dom", "reader:home", "moved 4")]), store }).entry.delta).toEqual(back.delta);
    expect(parseIndex(readFileSync(join(store, "reports", "index.json"), "utf8")).runs.find((r) => r.id === second.id)!.delta).toEqual(second.delta);
  });

  it("passes over an earlier run whose kept report cannot be read, and never computes a delta for a noise run", () => {
    const root = tmp();
    const store = join(root, "store");
    keepReport({ dir: releaseRun(root, "2026-09-27T00:00:00.000Z", [hunk("dom", "a", "x")], { candidate: "sha-aaaaaaa" }), store });
    keepReport({ dir: releaseRun(root, "2026-09-28T00:00:00.000Z", [], { candidate: "sha-bbbbbbb" }), store });
    writeFileSync(join(store, "reports", "2026-09-28T00-00-00Z-release", "report.json"), "{not json");
    const { entry: kept } = keepReport({ dir: releaseRun(root, "2026-09-29T00:00:00.000Z", [hunk("dom", "a", "x"), hunk("dom", "b", "y")]), store });
    expect(kept.delta).toMatchObject({ against: { candidate: "sha-aaaaaaa" }, new: 1, gone: 0 });
    expect(keepReport({ dir: runDir(root, "2026-09-29T02:17:00.000Z"), store }).entry.delta).toBeUndefined();
  });

  it("leads a kept forecast with the new differences, under the Gate and above the RCS, each linked to its row", async () => {
    const ranAt = "2026-09-28T05:00:00.000Z";
    const id = "2026-09-28T05-00-00Z-release";
    const root = tmp();
    const store = join(root, "store");
    keepReport({ dir: await scoredRun(join(root, "one"), { ranAt: "2026-09-27T05:00:00.000Z", unclaimed: 1 }), store });
    const dir = await scoredRun(join(root, "two"), { ranAt, unclaimed: 3 });
    const { entry: kept } = keepReport({ dir, store });
    // "screenshot /topic moved 0", "... moved 1", "... moved 2": the same kind, one more of it each night
    expect(kept.delta).toMatchObject({ new: 2, gone: 0, byArtefact: { screenshot: { new: 2, gone: 0 } } });
    const md = readFileSync(join(store, "reports", id, "report.md"), "utf8");
    const at = (s: string) => md.indexOf(s);
    expect(at("**Gate: FAIL**")).toBeLessThan(at("#### New since the last forecast"));
    expect(at("#### New since the last forecast")).toBeLessThan(at("**RCS") >= 0 ? at("**RCS") : at("No RCS"));
    expect(md).toContain("**2 new, 0 gone** in the unclaimed set since the forecast of 2026-09-27T05:00:00.000Z (`sha-3f1c2a9`), beside the same baseline `1.0.4`. By artefact: screenshot +2 −0.");
    expect(md).toContain("| screenshot | /topic | screenshot /topic moved 2 |");
    const html = readFileSync(join(store, "reports", id, "report.html"), "utf8");
    expect(html.indexOf('<p class="gate fail">')).toBeLessThan(html.indexOf('<h2 id="delta">New since the last forecast</h2>'));
    expect(html.indexOf('<h2 id="delta">')).toBeLessThan(html.indexOf('<p class="rcs'));
    expect(html).toContain('<a href="#hunk-screenshot:/topic:4"><code>/topic</code></a>');
    // the first forecast beside a baseline says so
    const first = readFileSync(join(store, "reports", "2026-09-27T05-00-00Z-release", "report.md"), "utf8");
    expect(first).toContain("The first kept forecast beside `1.0.4`: nothing earlier to compare with.");
  }, 60_000);

  it("lists at most the first new and gone differences, counts the rest, escapes what it shows, and names a harness change", async () => {
    const { deltaLeadHtml, deltaLeadMarkdown } = await import("../src/report/lead.ts");
    const fresh = Array.from({ length: DELTA_LISTED.fresh + 2 }, (_, i) => hunk("dom", `p${i}`, `a | b <i>`, i));
    const gone = Array.from({ length: DELTA_LISTED.gone + 1 }, (_, i) => hunk("axe", `q${i}`, "gone", i));
    const d = { delta: { baseline: "16.2.2", against: { id: "x", ranAt: "2026-09-28T08:59:53.000Z", candidate: "sha-185e87f", harnessVersion: "1.15.0" }, new: fresh.length, gone: gone.length, byArtefact: { axe: { new: 0, gone: gone.length }, dom: { new: fresh.length, gone: 0 } } }, harnessVersion: "1.16.1", fresh, gone };
    const md = deltaLeadMarkdown(d);
    expect(md.match(/^\| dom \|/gm)).toHaveLength(DELTA_LISTED.fresh);
    expect(md).toContain("| dom | p0 | a \\| b <i> |");
    expect(md).toContain("and 2 more new");
    expect(md).toContain("; and 1 more.");
    expect(md).toContain("judged by harness 1.15.0, this one by 1.16.1");
    const html = deltaLeadHtml(d);
    expect(html).not.toContain("<i>");
    expect(html).toContain("a | b &lt;i&gt;");
    expect(html).toContain("<strong>17 new, 11 gone</strong>");
  });

  it("the index matches docs/contract/reports-index.schema.json, delta included", () => {
    const root = tmp();
    const store = join(root, "store");
    keepReport({ dir: releaseRun(root, "2026-09-27T00:00:00.000Z", [hunk("dom", "a", "x")]), store, runUrl: "https://github.com/o/r/actions/runs/1" });
    keepReport({ dir: releaseRun(root, "2026-09-28T00:00:00.000Z", [hunk("axe", "a", "x")]), store });
    keepReport({ dir: runDir(root, "2026-09-28T02:17:00.000Z"), store });
    const ajv = new Ajv({ allErrors: true, strict: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const validate = ajv.compile(JSON.parse(readFileSync(join(import.meta.dirname, "..", "docs", "contract", "reports-index.schema.json"), "utf8")));
    const index = JSON.parse(readFileSync(join(store, "reports", "index.json"), "utf8"));
    expect(index.runs.map((r: ReportEntry) => (r.delta ? (r.delta.against?.id ?? null) : "-"))).toEqual(["-", "2026-09-27T00-00-00Z-release", null]);
    validate(index);
    expect(validate.errors ?? []).toEqual([]);
    // every field an entry can carry is in the schema (additionalProperties: false does the rest)
    const full: Required<ReportEntry> = {
      ...index.runs[1],
      runUrl: "u",
      confidence: { gate: "FAIL", rcs: null, band: null, meaning: "m", note: "n", glance: 1, scoredBy: "1.16.1" },
      changes: { score: 0, prs: 1, risky: 1, floorBreached: true, range: "v1..v2" }
    };
    validate({ schemaVersion: 1, runs: [full] });
    expect(validate.errors ?? []).toEqual([]);
    validate({ schemaVersion: 1, runs: [{ ...full, delta: { baseline: "16.2.2", against: null, surprise: 1 } }] });
    expect(validate.errors?.length).toBeGreaterThan(0);
  });
});
