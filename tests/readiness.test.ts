/**
 * The overnight readiness page (harness readiness, since 1.17.0): one row per calendar night for the last ten, built from
 * the Main to RC forecasts kept on the main-preview branch and Main to RC's workflow runs (github.json). A night that
 * kept nothing is said in words, never left out and never guessed; the band stays off the row. Nothing here reaches the
 * network.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import type { WorkflowRun } from "../src/a3/github.ts";
import { keepReport } from "../src/ci/report-archive.ts";
import { readinessCommand, UsageError } from "../src/local/cli.ts";
import { buildReadiness, deltaWords, forecastOf, nightsUpTo, type KeptForecast } from "../src/readiness/model.ts";
import { readForecasts, readWorkflowRuns } from "../src/readiness/read.ts";
import { renderReadiness } from "../src/readiness/render.ts";
import { rehearsalRun, scoredRun } from "./support/scored-run.ts";

const ROOT = resolve(import.meta.dirname, "..");
const NOW = new Date("2026-10-06T12:00:00Z");
const SHA = "865d02f82cd64caaa3056209e17eec3bea66f070";

const kept = (ranAt: string, o: Partial<KeptForecast> = {}): KeptForecast => ({
  id: `${ranAt.replace(/[:.]/g, "-")}-release`,
  ranAt,
  verdict: "fail",
  harnessVersion: "1.16.1",
  sides: { a: { reader: "quay.io/t/tutors-reader:16.2.2" }, b: { reader: "quay.io/t/tutors-reader:sha-865d02f" } },
  gate: "FAIL",
  files: [],
  unclaimed: 204,
  images: { reader: { revision: SHA, digest: "sha256:aa" }, live: { revision: SHA, digest: "sha256:bb" } },
  ...o
});
const run = (createdAt: string, conclusion: string | null, id = 1): WorkflowRun => ({ id, event: "workflow_run", conclusion, createdAt, startedAt: createdAt, updatedAt: createdAt, url: `https://github.com/o/r/actions/runs/${id}`, headSha: "h" });

describe("the nights", () => {
  it("are the last ten UTC dates, tonight first", () => {
    const n = nightsUpTo(NOW);
    expect(n).toHaveLength(10);
    expect(n[0]).toBe("2026-10-06");
    expect(n[9]).toBe("2026-09-27");
    expect(nightsUpTo(new Date("2026-10-01T00:30:00Z"), 2)).toEqual(["2026-10-01", "2026-09-30"]);
  });

  it("tells judged, unchanged, not judged, running, not yet and did not run apart, and never guesses without the history", () => {
    const forecasts = [kept("2026-10-02T08:50:00Z", { delta: { baseline: "16.2.2", against: null } }), kept("2026-10-04T08:50:00Z", { sides: { a: { reader: "r:16.2.2" }, b: { reader: "r:sha-aaaaaaa" } } }), kept("2026-10-04T03:40:00Z"), kept("2026-09-20T08:00:00Z")];
    const runs = [run("2026-10-05T08:40:00Z", "success", 5), run("2026-10-03T08:40:00Z", "failure", 3), run("2026-10-01T08:40:00Z", "success", 1), run("2026-09-30T08:40:00Z", null, 9)];
    const r = buildReadiness({ now: NOW, harness: "1.17.0", forecasts, workflowRuns: runs, github: "read" });
    const state = Object.fromEntries(r.nights.map((n) => [n.night, n.state]));
    expect(state).toMatchObject({ "2026-10-06": "not yet", "2026-10-05": "unchanged", "2026-10-04": "judged", "2026-10-03": "not judged", "2026-10-02": "judged", "2026-10-01": "unchanged", "2026-09-30": "running", "2026-09-29": "did not run" });
    // an unchanged night repeats the newest forecast kept before it, in grey
    const five = r.nights.find((n) => n.night === "2026-10-05")!;
    expect(five.since).toMatchObject({ candidate: "sha-aaaaaaa", night: "2026-10-04", gate: "FAIL" });
    expect(five.note).toContain("Unchanged since sha-aaaaaaa (2026-10-04)");
    expect(r.nights.find((n) => n.night === "2026-10-01")!.since?.night).toBe("2026-09-20");
    // two runs in one night: the newest leads
    expect(r.nights.find((n) => n.night === "2026-10-04")!.forecasts.map((f) => f.ranAt)).toEqual(["2026-10-04T08:50:00Z", "2026-10-04T03:40:00Z"]);
    expect(r.nights.find((n) => n.night === "2026-10-04")!.note).toContain("1 earlier run that night");
    expect(r.sources.forecasts).toBe(3);
    // without the history, a night with nothing kept is not known: never "did not run"
    const blind = buildReadiness({ now: NOW, harness: "1.17.0", forecasts, github: "not read" });
    expect(blind.nights.filter((n) => !n.forecasts.length).every((n) => n.state === "not known")).toBe(true);
  });

  it("draws a rule where production moved, so two baselines are never read as one strip", () => {
    const forecasts = [kept("2026-10-05T08:00:00Z", { sides: { a: { reader: "r:16.3.0" }, b: { reader: "r:sha-bbbbbbb" } } }), kept("2026-10-03T08:00:00Z")];
    const r = buildReadiness({ now: NOW, harness: "1.17.0", forecasts, workflowRuns: [], github: "read" });
    expect(r.nights.find((n) => n.night === "2026-10-05")!.baselineMoved).toEqual({ from: "16.2.2", to: "16.3.0" });
    expect(r.nights.filter((n) => n.baselineMoved)).toHaveLength(1);
    expect(renderReadiness(r)).toContain("Production moved here: 16.2.2 below, 16.3.0 above.");
  });

  it("a row carries the commit to branch from, its digests, the Gate and the delta; no band", () => {
    const f = forecastOf(kept("2026-10-05T08:00:00Z", { delta: { baseline: "16.2.2", against: { id: "x", ranAt: "2026-10-04T08:00:00Z", candidate: "sha-1", harnessVersion: "1.16.1" }, new: 11, gone: 5, byArtefact: { dom: { new: 11, gone: 5 } } } }));
    expect(f).toMatchObject({ commit: SHA, commitUrl: `https://github.com/tutors-sdk/tutors-mono-repo/commit/${SHA}`, digests: { reader: "sha256:aa", live: "sha256:bb" }, gate: "FAIL", candidate: "sha-865d02f", baseline: "16.2.2", unclaimed: 204 });
    expect(deltaWords(f.delta)).toBe("+11 / −5");
    expect(deltaWords({ baseline: "16.2.2", against: null })).toBe("first beside 16.2.2");
    expect(deltaWords(null)).toBe("not counted");
    expect(Object.keys(f)).not.toContain("band");
    // images that disagree on a commit name none; a forecast kept before the score shows its verdict
    const { gate: _gate, ...unscored } = kept("2026-10-05T08:00:00Z", { verdict: "warn", images: { reader: { revision: SHA }, live: { revision: "0".repeat(40) } } });
    const odd = forecastOf(unscored);
    expect(odd.commit).toBeNull();
    expect(odd.gate).toBe("WARN");
  });
});

describe("harness readiness", () => {
  async function site(): Promise<string> {
    const root = mkdtempSync(join(tmpdir(), "harness-readiness-"));
    const work = join(root, "work");
    const store = join(root, "site", "main-preview");
    const migration = rehearsalRun(work, "migration", { ranAt: "2026-10-05T04:40:00.000Z" });
    const upgrade = rehearsalRun(work, "upgrade", { ranAt: "2026-10-05T04:41:00.000Z", verdict: "fail" });
    keepReport({ dir: await scoredRun(work, { ranAt: "2026-10-04T05:00:00.000Z", unclaimed: 2 }), store, runUrl: "https://github.com/o/r/actions/runs/1" });
    keepReport({ dir: await scoredRun(work, { ranAt: "2026-10-05T05:00:00.000Z", unclaimed: 3, rehearsals: { migration, upgrade } }), store, runUrl: "https://github.com/o/r/actions/runs/2", migration, upgrade });
    return join(root, "site");
  }

  it("reads the kept forecasts with their rehearsals and delta, writes readiness.html and readiness.json, valid against the schema", async () => {
    const s = await site();
    writeFileSync(join(s, "github.json"), JSON.stringify({ schemaVersion: 1, fetchedAt: "2026-10-06T11:00:00Z", workflows: { "main-preview.yml": [run("2026-10-06T08:40:00Z", "success", 7)] }, errors: [] }));
    const forecasts = readForecasts(s);
    expect(forecasts.map((f) => f.unclaimed)).toEqual([3, 2]);
    // since 1.28.1: the known side beside the gaps, from the same report.json
    expect(forecasts.map((f) => [f.claims?.claimed, f.claims?.unclaimed])).toEqual([[1, 3], [1, 2]]);
    expect(forecasts[0]!.rehearsals).toEqual({ migration: "pass", upgrade: "fail" });
    expect(forecasts[0]!.delta).toMatchObject({ new: 1, gone: 0 });
    const logs: string[] = [];
    expect(readinessCommand({ site: s }, { now: () => NOW, log: (m) => logs.push(m) })).toBe(0);
    const r = JSON.parse(readFileSync(join(s, "readiness.json"), "utf8"));
    expect(r.nights[0]).toMatchObject({ night: "2026-10-06", state: "unchanged", since: { candidate: "sha-3f1c2a9", night: "2026-10-05" } });
    const top = r.nights[1].forecasts[0];
    expect(top.links.rehearsals).toEqual([
      { mode: "migration", href: "main-preview/reports/2026-10-05T05-00-00Z-release/migration/report.html", verdict: "PASS" },
      { mode: "upgrade", href: "main-preview/reports/2026-10-05T05-00-00Z-release/upgrade/report.html", verdict: "FAIL" }
    ]);
    expect(logs.join("\n")).toContain("2026-10-06 unchanged");
    const html = readFileSync(join(s, "readiness.html"), "utf8");
    expect(html).toContain('href="main-preview/reports/2026-10-05T05-00-00Z-release/report.html"');
    expect(top).toMatchObject({ claimed: 1, unclaimed: 3, coverage: 0.25 });
    expect(html).toContain("1 claimed (known), 3 unclaimed (gaps): 25% covered;");
    expect(html).toContain('<span class="new">+1</span>');
    expect(html).toContain('<span class="verdict grey">FAIL</span>');
    expect(html).not.toMatch(/<script|class="band/);
    const ajv = new Ajv({ allErrors: true, strict: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    ajv.addSchema(JSON.parse(readFileSync(join(ROOT, "docs/contract/reports-index.schema.json"), "utf8")), "reports-index.schema.json");
    ajv.addSchema(JSON.parse(readFileSync(join(ROOT, "docs/contract/quality-strip.schema.json"), "utf8")), "quality-strip.schema.json");
    ajv.addSchema(JSON.parse(readFileSync(join(ROOT, "docs/contract/release-control.schema.json"), "utf8")), "release-control.schema.json");
    const validate = ajv.compile(JSON.parse(readFileSync(join(ROOT, "docs/contract/readiness.schema.json"), "utf8")));
    validate(r);
    expect(validate.errors ?? []).toEqual([]);
    validate({ ...r, nights: [{ ...r.nights[1], forecasts: [{ ...top, band: "Red" }] }] });
    expect(validate.errors?.length).toBeGreaterThan(0);
  }, 60_000);

  it("without github.json says so and writes the page; an explicit --github that is not a snapshot is a usage error", async () => {
    const s = await site();
    expect(readinessCommand({ site: s, json: true }, { now: () => NOW, log: () => {} })).toBe(0);
    const r = JSON.parse(readFileSync(join(s, "readiness.json"), "utf8"));
    expect(r.sources.github).toContain("not read");
    expect(r.nights[0].state).toBe("not known");
    writeFileSync(join(s, "bad.json"), "{not json");
    expect(() => readinessCommand({ site: s, github: join(s, "bad.json") }, { now: () => NOW, log: () => {} })).toThrow(UsageError);
    expect(readWorkflowRuns(join(s, "none.json")).runs).toBeUndefined();
    writeFileSync(join(s, "empty.json"), JSON.stringify({ schemaVersion: 1, fetchedAt: "t", workflows: {}, errors: ["GitHub answered 403"] }));
    expect(readWorkflowRuns(join(s, "empty.json")).github).toContain("did not answer for main-preview.yml");
  }, 60_000);

  it("needs --site, and a site that exists", () => {
    expect(() => readinessCommand({})).toThrow(UsageError);
    expect(() => readinessCommand({ site: join(tmpdir(), "no-such-site-readiness") })).toThrow(/no site directory/);
  });

  it("skips index entries it cannot place: another mode, a bad id, no time", () => {
    const s = mkdtempSync(join(tmpdir(), "harness-readiness-odd-"));
    mkdirSync(join(s, "main-preview", "reports"), { recursive: true });
    writeFileSync(join(s, "main-preview", "reports", "index.json"), JSON.stringify({ runs: [{ id: "../x", mode: "release", ranAt: "2026-10-01T00:00:00Z" }, { id: "a", mode: "noise", ranAt: "2026-10-01T00:00:00Z" }, { id: "b", mode: "release" }, { id: "c", mode: "release", ranAt: "2026-10-01T00:00:00Z", verdict: "pass" }] }));
    expect(readForecasts(s).map((f) => f.id)).toEqual(["c"]);
  });
});
