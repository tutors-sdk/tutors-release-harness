import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { addEntry, entryId, keepReport, parseIndex, type ReportEntry, type ReportIndex } from "../src/ci/report-archive.ts";
import { reportsCommand, UsageError } from "../src/local/cli.ts";

const tmp = () => mkdtempSync(join(tmpdir(), "report-archive-"));

function runDir(root: string, ranAt: string, mode = "noise", verdict = "pass", extra: string[] = []): string {
  const dir = join(root, `${ranAt.replace(/:/g, "-")}-${mode}`);
  mkdirSync(join(dir, "a"), { recursive: true });
  const report = { schemaVersion: 1, harness: { version: "1.4.1", gitSha: null, contractVersion: "1.4.0" }, harnessVersion: "1.4.1", mode, ranAt, verdict, reasons: ["no unclaimed differences"], sides: { a: { reader: "16.2.2" }, b: { reader: "16.2.2" } } };
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
    expect(readdirSync(target).sort()).toEqual(["report.html", "report.json", "report.md"]);
    expect(readFileSync(join(target, "report.json"), "utf8")).toBe(readFileSync(join(dir, "report.json"), "utf8"));
    expect(kept).toMatchObject({ mode: "noise", verdict: "pass", harnessVersion: "1.4.1", runUrl: "https://github.com/o/r/actions/runs/1", sides: { a: { reader: "16.2.2" } } });
    expect(kept.files).toEqual(["2026-09-26T07-57-09Z-noise/report.json", "2026-09-26T07-57-09Z-noise/report.md", "2026-09-26T07-57-09Z-noise/report.html"]);
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
    expect(lines.join("\n")).toMatch(/kept release 2026-09-26T07:57:09.931Z \(WARN\): reports\/2026-09-26T07-57-09Z-release\/ 3 file\(s\)/);
  });
});
