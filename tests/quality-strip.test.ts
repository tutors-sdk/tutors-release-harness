/**
 * The quality strip (since 1.18.0): Speed, Metrics and Tests under the Gate on the A3 and on every row of the readiness
 * page, and Test signal reading the monorepo's quality record joined by the harness's own weekly mutants. The monorepo's
 * `quality` branch does not exist until its first Nightly after tutors-mono-repo#382, so every reader here is held to a
 * missing record, and a record with no `packages`, being "not measured": never an error, never green. Nothing here can
 * move a Gate. Nothing here reaches the network.
 */
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { QUALITY_FILE, combine, parseQualityRecord, parseWeeklyMutants, qualityOf, type QualityInputs, type QualityLight } from "../src/a3/quality.ts";
import { readInputs } from "../src/a3/read.ts";
import { buildA3 } from "../src/a3/model.ts";
import { renderA3 } from "../src/a3/render.ts";
import { keepReport } from "../src/ci/report-archive.ts";
import { a3Command, confidenceCommand, readinessCommand, UsageError } from "../src/local/cli.ts";
import { readForecasts } from "../src/readiness/read.ts";
import { scoreAndWrite } from "../src/score/read.ts";
import { MUTANTS_FRESH_DAYS, weeklyFor, withHarnessMutants } from "../src/score/test-signal.ts";
import type { Hunk, NoiseStatus } from "../src/types.ts";
import { releaseReport, scoredRun } from "./support/scored-run.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FIXTURES = join(ROOT, "tests", "fixtures", "quality");
const EARLIER = "76cd877126a7cb5e7cee00e88edcaaacb624d6e8";
const JUDGED = "865d02f82cd64caaa3056209e17eec3bea66f070";
const RECORD = JSON.parse(readFileSync(join(FIXTURES, `${EARLIER}.json`), "utf8"));
const NO_PACKAGES = JSON.parse(readFileSync(join(FIXTURES, "no-packages.json"), "utf8"));
const MUTANTS = parseWeeklyMutants(readFileSync(join(FIXTURES, "mutants.jsonl"), "utf8"));
const RAN = "2026-09-30T08:52:05.000Z";
const SITE_RAN = "2026-09-28T08:52:05.000Z";
const SITE_ID = "2026-09-28T08-52-05Z-release";

const hunk = (id: string, artefact: Hunk["artefact"], scope: string, summary: string, severity: Hunk["severity"] = "fail"): Hunk => ({ id, artefact, scope, summary, severity });
const side = (o: Record<string, number> = {}) => ({ requests: 601, failed: 0, serverErrors: 0, p50: 1.4, p95: 2.2, rate: 20, duration: "30s", ...o });

/** A forecast's report, the parts the strip reads: clean unless told otherwise. */
function report(o: { hunks?: Hunk[]; unclaimed?: Hunk[]; load?: boolean; b?: Record<string, number>; noise?: NoiseStatus | null } = {}): NonNullable<QualityInputs["report"]> {
  const unclaimed = o.unclaimed ?? [];
  return {
    ranAt: RAN,
    compare: { hunks: [...(o.hunks ?? []), ...unclaimed], matches: unclaimed.map((hunk) => ({ hunk })), unclaimed, staleClaims: [], broadUnapproved: [] },
    ...(o.load === false ? {} : { load: { a: side({ p95: 2.19 }), b: side({ p95: 2.06, requests: 600, ...o.b }) } }),
    ...(o.noise === null ? {} : { noise: o.noise ?? { ranAt: "2026-09-30T08:40:44.617Z", clean: true, hunks: 0 } }),
    provenance: { b: { images: { reader: { revision: JUDGED } } } }
  } as unknown as NonNullable<QualityInputs["report"]>;
}
const light = (q: ReturnType<typeof qualityOf>, id: QualityLight["id"]) => q.lights.find((l) => l.id === id)!;
const check = (q: ReturnType<typeof qualityOf>, id: string) => q.lights.flatMap((l) => l.checks).find((c) => c.id === id)!;
const DIR = "main-preview/reports/2026-09-30T08-52-05Z-release";

describe("the quality record, as the monorepo publishes it (tutors-mono-repo#382)", () => {
  it("reads a record, and drops a part it cannot read rather than half of it", () => {
    expect(parseQualityRecord(RECORD)).toMatchObject({ commit: EARLIER, packages: [{ name: "@tutors/tutors-model-lib" }, {}, {}], nightly: { result: "failure" } });
    expect(parseQualityRecord(NO_PACKAGES)!.packages).toBeUndefined();
    expect(parseQualityRecord({ ...RECORD, packages: [{ name: "x", mutationScore: 140 }] })!.packages).toBeUndefined();
    expect(parseQualityRecord({ ...RECORD, nightly: { jobs: {} } })!.nightly).toBeUndefined();
    for (const bad of [null, [], {}, { ...RECORD, schemaVersion: 2 }, { ...RECORD, commit: "main" }]) expect(parseQualityRecord(bad), JSON.stringify(bad)).toBeUndefined();
  });

  it("reads mutants.jsonl with its run links, skipping a line it cannot read", () => {
    expect(MUTANTS.map((m) => [m.ranAt.slice(0, 10), m.caught])).toEqual([["2026-09-21", null], ["2026-09-28", 10]]);
    expect(parseWeeklyMutants('not json\n{"ranAt":"x","caught":1,"total":1}\n{"ranAt":"2026-01-01T00:00:00Z","caught":1,"total":1}\n')).toHaveLength(1);
  });
});

describe("the three lights", () => {
  it("a clean forecast with no quality record: Speed and Metrics within reason, Tests not measured, its monorepo half said", () => {
    const q = qualityOf({ report: report(), dir: DIR });
    expect(q.lights.map((l) => [l.name, l.state])).toEqual([["Speed", "within reason"], ["Metrics", "within reason"], ["Tests", "not measured"]]);
    expect(light(q, "speed").reading).toBe("p95 2.19 ms on production, 2.06 ms on main; 0 of 600 requests failed; no journey significantly slower");
    expect(light(q, "tests").halves).toEqual({ harness: "not measured", monorepo: "not measured" });
    expect(light(q, "tests").reading).toBe("Harness: journeys and the A/A within reason; the weekly mutants not measured. Monorepo: not measured (no quality record kept beside this forecast).");
    expect(q.record).toBeUndefined();
    expect(q.note).toContain("reads the harness half only");
    expect(q.note).toContain("never changes the Gate");
  });

  it("not measured is its own state: within reason only when every check was read and in reason", () => {
    expect(combine(["within reason", "within reason"])).toBe("within reason");
    expect(combine(["within reason", "not measured"])).toBe("not measured");
    expect(combine(["not measured", "look"])).toBe("look");
    expect(combine([])).toBe("not measured");
    expect(qualityOf({ dir: DIR }).lights.every((l) => l.state === "not measured")).toBe(true);
  });

  it("Speed looks at a failing timing, load or startup hunk and at a k6 failure on main, and is not measured without k6", () => {
    const slower = hunk("timing:catalogue-loads:7", "timing", "catalogue-loads", "journey catalogue-loads slower on b: median 1422ms → 1971ms (+39%, p=0.008, n=5/5)");
    const q = qualityOf({ report: report({ hunks: [slower, hunk("timing:x:8", "timing", "x", "not significant", "info")], b: { failed: 2, serverErrors: 1 } }), dir: DIR });
    expect(light(q, "speed").state).toBe("look");
    expect(check(q, "slower").reading).toContain("1 failing timing or startup hunk: journey catalogue-loads slower on b");
    expect(check(q, "slower").evidence[0]!.href).toBe(`${DIR}/report.html#hunk-timing:catalogue-loads:7`);
    expect(check(q, "load")).toMatchObject({ state: "look", reading: "p95 2.19 ms on production, 2.06 ms on main; 3 of 600 requests failed" });
    const startup = qualityOf({ report: report({ hunks: [hunk("startup:reader:1", "startup", "startup/reader", "reader starts slower on b")] }), dir: DIR });
    expect(light(startup, "speed").state).toBe("look");
    const noK6 = qualityOf({ report: report({ load: false }), dir: DIR });
    expect(light(noK6, "speed")).toMatchObject({ state: "not measured", reading: "no k6 leg; no journey significantly slower" });
  });

  it("Metrics looks only at an unclaimed metrics hunk; log differences sit beside it, not counted", () => {
    const logs = [1, 2, 3].map((n) => hunk(`logs:${n}`, "logs", "reader", `reader: new log field f${n}`));
    const clean = qualityOf({ report: report({ unclaimed: logs }), dir: DIR });
    expect(light(clean, "metrics")).toMatchObject({ state: "within reason", beside: "3 log differences unclaimed, shown beside it, not counted" });
    const m = hunk("metrics:1", "metrics", "reader/http_requests_total", "reader: series missing on b: http_requests_total");
    const look = qualityOf({ report: report({ unclaimed: [m, ...logs] }), dir: DIR });
    expect(light(look, "metrics")).toMatchObject({ state: "look", reading: "1 unclaimed metrics hunk: reader: series missing on b: http_requests_total" });
    // claimed is not counted
    expect(light(qualityOf({ report: report({ hunks: [m] }), dir: DIR }), "metrics").state).toBe("within reason");
  });

  it("Tests, harness half: a journey that did not complete on both sides, an A/A that is dirty, degraded or stale, a missed mutant", () => {
    const journey = hunk("dom:reference-course-reads:1", "dom", "reference-course-reads", 'journey "reference-course-reads" completed on a but failed on b');
    const q = qualityOf({ report: report({ hunks: [journey] }), mutants: MUTANTS, dir: DIR });
    expect(check(q, "journeys")).toMatchObject({ state: "look", reading: 'journey "reference-course-reads" completed on a but failed on b' });
    // a timing hunk that names a journey is not a journey outcome
    expect(check(qualityOf({ report: report({ hunks: [hunk("timing:a:1", "timing", "a", "journey a median 1ms → 2ms but not significant (p=0.5)", "info")] }), dir: DIR }), "journeys").state).toBe("within reason");
    expect(check(q, "mutants")).toMatchObject({ state: "within reason", reading: "10 of 10 mutants caught, 2026-09-28" });
    expect(check(q, "mutants").evidence[0]!.href).toBe("https://github.com/tutors-sdk/tutors-release-harness/actions/runs/16000000001");
    const old = qualityOf({ report: report({ noise: { ranAt: "2026-09-26T08:00:00Z", clean: true, hunks: 0 } }), dir: DIR });
    expect(check(old, "aa")).toMatchObject({ state: "look", reading: "A/A of 2026-09-26: 4 days old" });
    expect(check(qualityOf({ report: report({ noise: { ranAt: RAN, clean: false, hunks: 3, degraded: ["reader built here"] } }), dir: DIR }), "aa").reading).toBe("A/A of 2026-09-30: degraded (reader built here), 3 differences");
    expect(check(qualityOf({ report: report({ noise: null }), dir: DIR }), "aa")).toMatchObject({ state: "not measured", reading: "the run consulted no A/A" });
    expect(check(qualityOf({ report: report(), mutants: [{ ranAt: "2026-09-28T00:00:00Z", caught: 8, total: 10 }], dir: DIR }), "mutants").state).toBe("look");
  });

  it("the weekly mutants: the newest before the run, not one that could not run, not one older than two weeks", () => {
    expect(weeklyFor(undefined, RAN)).toEqual({ gap: "no weekly mutants record (mutants.jsonl) to read" });
    expect(weeklyFor([], RAN)).toEqual({ gap: "no weekly mutants self-test recorded yet" });
    expect(weeklyFor(MUTANTS, "2026-09-25T00:00:00Z")).toMatchObject({ gap: "the weekly mutants self-test of 2026-09-21 could not run (its A/A was not clean)" });
    expect(weeklyFor(MUTANTS, "2026-09-20T00:00:00Z")).toMatchObject({ gap: "no weekly mutants self-test before this run" });
    expect(weeklyFor(MUTANTS, "2026-10-20T00:00:00Z")).toMatchObject({ gap: `the newest weekly mutants self-test (2026-09-28) is 22 days old, more than ${MUTANTS_FRESH_DAYS}` });
    expect(weeklyFor(MUTANTS, RAN)).toMatchObject({ point: { caught: 10, total: 10 } });
  });

  it("Tests, monorepo half: the record for an earlier commit says which and how old; a failed Nightly and a changed package below 80% look", () => {
    const q = qualityOf({ report: report(), record: parseQualityRecord(RECORD)!, mutants: MUTANTS, dir: DIR });
    expect(q.record).toMatchObject({ commit: EARLIER, judged: false, generatedAt: "2026-09-30T03:41:07Z", href: `${DIR}/${QUALITY_FILE}` });
    expect(q.record!.ageMs).toBe(Date.parse(RAN) - Date.parse("2026-09-30T03:41:07Z"));
    expect(check(q, "nightly")).toMatchObject({ state: "look", reading: "Nightly failure on 76cd877: lighthouse failure" });
    // the package that did not change (55%) is not counted
    expect(check(q, "mutation")).toMatchObject({ state: "look", reading: "1 changed package below 80%: @tutors/tutors-reader-lib 72.1%" });
    expect(light(q, "tests")).toMatchObject({ state: "look", halves: { harness: "within reason", monorepo: "look" } });
    expect(light(q, "tests").reading).toContain("Monorepo (record for 76cd877, an earlier commit, 5h old)");
    expect(q.note).toContain("for 76cd877, the newest before the judged commit, generated 2026-09-30 (5h before the forecast)");
    // the judged commit's own record, green and above the target
    const own = qualityOf({ report: report(), record: { ...parseQualityRecord(RECORD)!, commit: JUDGED, nightly: { result: "success" }, packages: [{ name: "a", mutationScore: 91, changed: true }, { name: "b", mutationScore: 40, changed: false }] }, mutants: MUTANTS, dir: DIR });
    expect(own.record!.judged).toBe(true);
    expect(own.lights.map((l) => l.state)).toEqual(["within reason", "within reason", "within reason"]);
    expect(check(own, "mutation").reading).toBe("1 changed package, the lowest a at 91%");
  });

  it("a record with no packages (the Nightly wrote no Stryker report) is not measured on mutation scores, never green", () => {
    const q = qualityOf({ report: report(), record: parseQualityRecord(NO_PACKAGES)!, mutants: MUTANTS, dir: DIR });
    expect(check(q, "mutation")).toMatchObject({ state: "not measured", reading: "no mutation scores in the record (the Nightly wrote no Stryker report)" });
    expect(check(q, "nightly").reading).toBe("Nightly failure on 90cb998: mutation-nightly failure");
    expect(light(q, "tests").halves!.monorepo).toBe("look");
    const green = qualityOf({ report: report(), record: { ...parseQualityRecord(NO_PACKAGES)!, nightly: { result: "success" } }, mutants: MUTANTS, dir: DIR });
    expect(light(green, "tests")).toMatchObject({ state: "not measured", halves: { harness: "within reason", monorepo: "not measured" } });
    // a kept quality.json that is not a record
    expect(check(qualityOf({ report: report(), record: null, dir: DIR }), "nightly").reading).toBe("the kept quality.json is not a quality record");
  });
});

describe("Test signal: the monorepo's half from its quality record, the harness's half from its weekly mutants", () => {
  const work = () => mkdtempSync(join(tmpdir(), "harness-test-signal-"));

  it("reads the record as --test-signal; with no packages it is not measured, and says so, never exit 2", async () => {
    const root = work();
    const dir = await scoredRun(root, { ranAt: RAN, unclaimed: 0 });
    const file = join(root, "no-packages.json");
    copyFileSync(join(FIXTURES, "no-packages.json"), file);
    const c = scoreAndWrite({ outDir: dir, release: dir, testSignal: file }).confidence;
    const t = c.dimensions.find((d) => d.id === "test-signal")!;
    expect(t.status).toBe("not measured");
    expect(t.reason).toContain("has no mutation scores for 90cb998 (the monorepo's Nightly wrote no Stryker report)");
    // a hand-written file with neither half is still refused, as before
    writeFileSync(join(root, "empty.json"), "{}");
    expect(() => confidenceCommand({ run: dir, "test-signal": join(root, "empty.json") }, () => {})).toThrow(UsageError);
  }, 60_000);

  it("joins the newest weekly mutants to the packages, and the Gate is the same with or without either", async () => {
    const root = work();
    const dir = await scoredRun(root, { ranAt: RAN, unclaimed: 0 });
    const without = scoreAndWrite({ outDir: dir, release: dir }).confidence;
    const file = join(root, "quality.json");
    copyFileSync(join(FIXTURES, `${EARLIER}.json`), file);
    const logs: string[] = [];
    expect(confidenceCommand({ run: dir, "test-signal": file, mutants: join(FIXTURES, "mutants.jsonl"), json: true }, (m) => logs.push(m))).toBe(0);
    const c = JSON.parse(logs.join(""));
    const t = c.dimensions.find((d: { id: string }) => d.id === "test-signal");
    expect(t.status).toBe("measured");
    // the package below 80% costs its points, the unchanged one at 55% does not; every mutant caught costs nothing
    expect(t.deductions).toEqual([{ points: 30, why: "mutation score 72.1% on @tutors/tutors-reader-lib, below 80%", evidence: RECORD.evidence }]);
    expect(t.gaps ?? []).toEqual([]);
    expect(t.evidence).toEqual([RECORD.evidence]);
    expect(c.gate).toBe(without.gate);
    expect(c.run.inputs.testSignal).toBe("../../quality.json");
  }, 60_000);

  it("never lets the harness's mutants measure the dimension alone, and says why they could not join", () => {
    const pk = { packages: [{ name: "a", mutationScore: 90, changed: true }] };
    expect(withHarnessMutants({}, MUTANTS, RAN)).toEqual({});
    expect(withHarnessMutants(pk, MUTANTS, RAN).harnessMutants).toEqual({ caught: 10, total: 10, evidence: "https://github.com/tutors-sdk/tutors-release-harness/actions/runs/16000000001" });
    expect(withHarnessMutants({ ...pk, harnessMutants: { caught: 1, total: 2 } }, MUTANTS, RAN).harnessMutants).toEqual({ caught: 1, total: 2 });
    expect(withHarnessMutants(pk, undefined, RAN)).toMatchObject({ mutantsGap: "no weekly mutants record (mutants.jsonl) to read" });
    expect(withHarnessMutants(pk, [{ ranAt: "2026-09-29T00:00:00Z", caught: 9, total: 10 }], RAN).harnessMutants).toEqual({ caught: 9, total: 10, evidence: "mutants.jsonl, the self-test of 2026-09-29" });
  });

  it("a missing mutants.jsonl leaves the harness half a gap, named", async () => {
    const root = work();
    const dir = await scoredRun(root, { ranAt: RAN, unclaimed: 0 });
    const file = join(root, "quality.json");
    copyFileSync(join(FIXTURES, `${EARLIER}.json`), file);
    const c = scoreAndWrite({ outDir: dir, release: dir, testSignal: file, mutants: join(root, "none.jsonl") }).confidence;
    expect(c.dimensions.find((d) => d.id === "test-signal")!.gaps).toEqual(["the weekly harness mutants (no weekly mutants record (mutants.jsonl) to read)"]);
  }, 60_000);
});

describe("kept beside the forecast, and drawn on the A3 and the readiness page", () => {
  async function site(o: { quality?: string } = {}): Promise<string> {
    const root = mkdtempSync(join(tmpdir(), "harness-quality-site-"));
    const work = join(root, "work");
    // a day after the fixture report's A/A, so the strip's A/A is fresh
    const dir = await scoredRun(work, { ranAt: SITE_RAN, unclaimed: 1 });
    if (o.quality) copyFileSync(o.quality, join(dir, QUALITY_FILE));
    keepReport({ dir, store: join(root, "site", "main-preview") });
    return join(root, "site");
  }
  const ajv = () => {
    const a = new Ajv({ allErrors: true, strict: true });
    a.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    return a;
  };
  const strip = () => ajv().compile(JSON.parse(readFileSync(join(ROOT, "docs/contract/quality-strip.schema.json"), "utf8")));

  it("reports keep keeps a quality record beside a release run, byte for byte, and nothing that is not one", async () => {
    const s = await site({ quality: join(FIXTURES, `${EARLIER}.json`) });
    const index = JSON.parse(readFileSync(join(s, "main-preview", "reports", "index.json"), "utf8"));
    expect(index.runs[0].files).toContain(`${SITE_ID}/${QUALITY_FILE}`);
    expect(readFileSync(join(s, "main-preview", "reports", SITE_ID, QUALITY_FILE), "utf8")).toBe(readFileSync(join(FIXTURES, `${EARLIER}.json`), "utf8"));
    const bad = join(tmpdir(), `not-a-record-${process.pid}.json`);
    writeFileSync(bad, JSON.stringify({ hello: "world" }));
    const t = await site({ quality: bad });
    expect(JSON.parse(readFileSync(join(t, "main-preview", "reports", "index.json"), "utf8")).runs[0].files).not.toContain(`${SITE_ID}/${QUALITY_FILE}`);
  }, 60_000);

  it("the A3 draws the strip under the Gate from the kept record, valid against its schema; without a record it says not measured", async () => {
    const s = await site({ quality: join(FIXTURES, `${EARLIER}.json`) });
    mkdirSync(join(s, "sb"), { recursive: true });
    copyFileSync(join(FIXTURES, "mutants.jsonl"), join(s, "sb", "mutants.jsonl"));
    // the weekly mutants beside --scoreboard, as harness scoreboard trends reads them
    const a = buildA3(readInputs({ site: s, kaizen: join(ROOT, "kaizen"), scoreboard: join(s, "sb", "releases.jsonl"), now: new Date("2026-10-01T03:00:00Z"), harness: "1.18.0" }));
    expect(a.quality!.lights.map((l) => l.state)).toEqual(["within reason", "within reason", "look"]);
    expect(a.quality!.record).toMatchObject({ commit: EARLIER, judged: false });
    expect(a.current.facts).toContain("Quality: Speed within reason, Metrics within reason, Tests look.");
    const validate = strip();
    validate(JSON.parse(JSON.stringify(a.quality)));
    expect(validate.errors ?? []).toEqual([]);
    const html = renderA3(a);
    expect(html.indexOf('class="quality-strip"')).toBeGreaterThan(html.indexOf('class="tile gate'));
    expect(html.indexOf('class="quality-strip"')).toBeLessThan(html.indexOf("Background"));
    expect(html).toContain('<span class="half q-look">');
    expect(html).not.toMatch(/<script/);

    const none = await site();
    const logs: string[] = [];
    expect(await a3Command({ site: none, kaizen: join(ROOT, "kaizen"), json: true }, { now: () => new Date("2026-10-01T03:00:00Z"), log: (m) => logs.push(m) })).toBe(0);
    const q = JSON.parse(logs.join("")).quality;
    expect(q.lights[2]).toMatchObject({ state: "not measured", halves: { monorepo: "not measured" } });
    expect(q.record).toBeUndefined();
    validate(q);
    expect(validate.errors ?? []).toEqual([]);
  }, 60_000);

  it("the readiness page marks every row and draws the whole strip for the latest forecast", async () => {
    const s = await site({ quality: join(FIXTURES, "no-packages.json") });
    const f = readForecasts(s)[0]!;
    expect(f.quality).toMatchObject({ commit: "90cb998977c587e5e2c1147287db6ea5bb9aeb1e" });
    expect(f.report?.load).toBeDefined();
    expect(readinessCommand({ site: s, mutants: join(FIXTURES, "mutants.jsonl") }, { now: () => new Date("2026-10-01T03:00:00Z"), log: () => {} })).toBe(0);
    const r = JSON.parse(readFileSync(join(s, "readiness.json"), "utf8"));
    const q = r.nights[3].forecasts[0].quality;
    expect(q.lights.map((l: QualityLight) => l.state)).toEqual(["within reason", "within reason", "look"]);
    expect(q.lights[2].checks.find((c: { id: string }) => c.id === "mutation").state).toBe("not measured");
    const html = readFileSync(join(s, "readiness.html"), "utf8");
    expect(html).toContain('<td data-k="Quality">');
    expect(html).toContain('<a class="qmarks" href="#quality">');
    expect(html).toContain('<div class="quality" id="quality">');
    // without the mutants the harness half says it did not read them
    expect(readinessCommand({ site: s }, { now: () => new Date("2026-10-01T03:00:00Z"), log: () => {} })).toBe(0);
    const bare = JSON.parse(readFileSync(join(s, "readiness.json"), "utf8")).nights[3].forecasts[0].quality.lights[2].checks.find((c: { id: string }) => c.id === "mutants");
    expect(bare).toMatchObject({ state: "not measured", reading: "the weekly mutants record (mutants.jsonl) was not read" });
  }, 60_000);

  it("a forecast kept before the strip existed still gets one: what it can read, and not measured for the rest", () => {
    const q = qualityOf({ report: releaseReport({ ranAt: SITE_RAN }) as unknown as NonNullable<QualityInputs["report"]>, dir: DIR });
    expect(q.lights.map((l) => l.state)).toEqual(["within reason", "within reason", "not measured"]);
  });
});
