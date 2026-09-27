/**
 * The Release Confidence Score (src/score): the plan's worked example, the floors, the Gate winning, the dimensions that
 * are not measured, the board, the command, and the guardrails (the score is never an input to the gate).
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { UsageError, confidenceCommand } from "../src/local/cli.ts";
import { renderHtml } from "../src/report/html.ts";
import {
  changeRisk,
  claimCoverage,
  confidence,
  gateOfReports,
  noiseHealth,
  postDeploy,
  rehearsals,
  statisticalMargin,
  testSignal,
  traceability,
  weightedMean,
  type Confidence,
  type DimensionScore,
  type GateWord,
  type ScoreInputs
} from "../src/score/confidence.ts";
import { ScoreInputError, scoreInputs } from "../src/score/read.ts";
import { renderBoard, renderScoreMarkdown } from "../src/score/render.ts";
import { BANDS, DIMENSIONS, FLOOR_CAP, bandOf } from "../src/score/weights.ts";
import type { Artefact, Claim, Hunk, RunReport } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-confidence-${name}-`));

let n = 0;
const hunk = (artefact: Artefact, scope: string, extra: Partial<Hunk> = {}): Hunk => ({ id: `${artefact}:${scope}:${++n}`, artefact, scope, summary: `${artefact} ${scope} moved`, severity: "fail", ...extra });
const claim = (artefact: Artefact | "*", scope: string, reason: string, extra: Partial<Claim> = {}): Claim => ({ artefact, scope, reason, ...extra });

interface Shape {
  mode?: RunReport["mode"];
  verdict?: RunReport["verdict"];
  matched?: [Hunk, Claim][];
  unclaimed?: Hunk[];
  info?: Hunk[];
  stale?: Claim[];
  broad?: Claim[];
  noise?: RunReport["noise"] | null;
  masks?: Record<string, number>;
  load?: { failed: number; serverErrors?: number } | null;
  upgrade?: { failed: number; serverErrors: number };
  ranAt?: string;
}

/** A report shaped as the harness writes one, with only what a test sets differing from a quiet release that passed. */
function report(p: Shape = {}): RunReport {
  const matched = p.matched ?? [];
  const unclaimed = p.unclaimed ?? [];
  const side = (failed: number, serverErrors = 0) => ({ requests: 600, failed, serverErrors, p50: 1.2, p95: 2.1, rate: 20, duration: "30s" });
  return {
    schemaVersion: 1,
    harness: { version: "1.9.0", gitSha: null, contractVersion: "1.9.0" },
    harnessVersion: "1.9.0",
    mode: p.mode ?? "release",
    substrate: "compose",
    ranAt: p.ranAt ?? "2026-09-27T10:00:00.000Z",
    now: "2026-01-15T12:00:00Z",
    runs: 3,
    verdict: p.verdict ?? (unclaimed.length ? "fail" : "pass"),
    reasons: [p.verdict === "fail" ? "1 finding" : "ok"],
    sides: { a: { reader: "quay.io/tutors-sdk/tutors-reader:16.2.2", catalogue: "c", live: "l" }, b: { reader: "quay.io/tutors-sdk/tutors-reader:16.3.0-rc.1", catalogue: "c", live: "l" } },
    compare: { hunks: [...matched.map(([h]) => h), ...unclaimed, ...(p.info ?? [])], matches: [...matched.map(([hunk, c]) => ({ hunk, claim: c })), ...unclaimed.map((hunk) => ({ hunk })), ...(p.info ?? []).map((hunk) => ({ hunk }))], unclaimed, staleClaims: p.stale ?? [], broadUnapproved: p.broad ?? [] },
    ...(p.noise === null ? {} : { noise: p.noise ?? { ranAt: "2026-09-27T02:00:00.000Z", clean: true, hunks: 0 } }),
    masksApplied: p.masks ?? { "a-mask": 4 },
    ...(p.load === null ? {} : { load: { a: side(0), b: side(p.load?.failed ?? 0, p.load?.serverErrors ?? 0) } }),
    ...(p.upgrade ? { upgrade: { substrate: "compose", requests: 900, ...p.upgrade, byUpstream: {}, switchedAt: 15000, durationMs: 45000 } } : {})
  } as unknown as RunReport;
}

const at = <T>(data: T, where = "") => ({ data, where });
const quiet = () => ({ release: at(report()), migration: at(report({ mode: "migration" }), "../m"), upgrade: at(report({ mode: "upgrade", upgrade: { failed: 0, serverErrors: 0 } }), "../u") });
const inputs = (o: Partial<ScoreInputs> = {}): ScoreInputs => ({ gate: "PASS", ...quiet(), run: { reports: {} }, ...o });
const dim = (c: Confidence, id: DimensionScore["id"]) => c.dimensions.find((d) => d.id === id)!;

// ---- the plan's worked example ------------------------------------------------------------------------------

/**
 * "A fictitious 16.3.0-rc.1: claim coverage 85 (one stale claim), noise health 90, statistical margin 100, rehearsals
 * 100, test signal 70 (mutation score 72% on reader), traceability 100, change risk 60 (a hotspot file touched by a new
 * contributor), post-deploy history 100." Built here from inputs that say exactly that, not from the eight numbers.
 */
function workedExample(): ScoreInputs {
  return inputs({
    release: at(report({ matched: [[hunk("dom", "reader:lab"), claim("dom", "reader:lab", "Rule 0031: reading time", { rule: "0031" })]], stale: [claim("dom", "reader:old", "Rule 0040: removed banner")], masks: { "a-mask": 3, "transport-encoding": 0, "transport-transfer": 0 } })),
    testSignal: at({ packages: [{ name: "reader", mutationScore: 72 }, { name: "catalogue", mutationScore: 88 }], harnessMutants: { caught: 8, total: 8 } }, "test-signal.json"),
    traceability: at({ entries: [{ entry: "Reader: reading time on lab steps", kind: "feature" as const, ears: "specs/0031.feature", claimed: true }] }, "traceability.json"),
    changeRisk: at({ prs: [{ number: 412, reviewed: true, firstTimeContributor: true, hotspots: ["packages/reader/src/lib/course.ts"] }, { number: 413, reviewed: true }] }, "change-risk.json"),
    postDeploy: at(report({ mode: "post-deploy" }), "../pd")
  });
}

describe("the plan's worked example, 16.3.0-rc.1", () => {
  it("scores each dimension from what the plan says happened: 85, 90, 100, 100, 70, 100, 60, 100", () => {
    const c = confidence(workedExample());
    expect(c.dimensions.map((d) => d.score)).toEqual([85, 90, 100, 100, 70, 100, 60, 100]);
    expect(c.dimensions.every((d) => d.status === "measured" && !d.floorBreached)).toBe(true);
    expect(dim(c, "claim-coverage").deductions).toEqual([{ points: 15, why: "stale claim dom reader:old: matched nothing (Rule 0040: removed banner)", evidence: "report.html#stale-claims" }]);
    expect(dim(c, "test-signal").deductions[0]).toMatchObject({ points: 30, why: "mutation score 72% on reader, below 80%", evidence: "test-signal.json" });
    expect(dim(c, "change-risk").deductions[0]).toMatchObject({ points: 40, why: "PR #412, a first contribution, touches hotspot packages/reader/src/lib/course.ts", evidence: "PR #412" });
  });

  it("is Amber: the glance is mandatory. The weights give a mean of 85.00 (the plan's text says 84.5, an arithmetic slip), so RCS 85", () => {
    // 20*85 + 15*90 + 10*100 + 10*100 + 15*70 + 10*100 + 15*60 + 5*100 = 8500, over 100. Same band either way.
    const c = confidence(workedExample());
    expect(c).toMatchObject({ gate: "PASS", mean: 85, rcs: 85, band: "Amber", meaning: "ship only after the reviewer's glance is recorded verified" });
    expect(c.weightsUsed).toEqual(Object.fromEntries(DIMENSIONS.map((d) => [d.id, d.weight])));
    expect(c.glance).toEqual([]);
  });

  it("rounds down, never up: a mean of 84.5 is RCS 84", () => {
    const dims = DIMENSIONS.map((d) => ({ id: d.id, name: d.name, weight: d.weight, status: "measured" as const, score: d.id === "claim-coverage" ? 82 : d.id === "noise-health" ? 90 : d.id === "test-signal" ? 70 : d.id === "change-risk" ? 60 : 100, floorBreached: false, deductions: [], evidence: [] }));
    // 20*82 = 1640 instead of 1700: 8440 / 100 = 84.4; and 84.5 exactly with claim coverage 82.5 (not an integer score)
    expect(weightedMean(dims).mean).toBe(84.4);
    expect(weightedMean(dims.map((d) => (d.id === "claim-coverage" ? { ...d, score: 82.5 } : d))).mean).toBe(84.5);
    expect(Math.floor(84.5)).toBe(84);
  });
});

// ---- the Gate wins -------------------------------------------------------------------------------------------

describe("the Gate comes first and wins", () => {
  it("FAIL, FAIL (OVERRIDDEN) and NOT JUDGED get no RCS and no band, whatever the dimensions say; the dimensions are still there", () => {
    for (const gate of ["FAIL", "FAIL (OVERRIDDEN)", "NOT JUDGED"] as GateWord[]) {
      const c = confidence(inputs({ gate }));
      expect(c, gate).toMatchObject({ gate, rcs: null, band: null, mean: null });
      expect(c.note).toContain(`No RCS: Gate ${gate}.`);
      expect(c.dimensions).toHaveLength(8);
    }
    expect(confidence(inputs({ gate: "FAIL" })).note).toContain("no number talks a FAIL back on");
    expect(confidence(inputs({ gate: "WARN" }))).toMatchObject({ rcs: 100, band: "Green" });
  });

  it("worded from the reports by the gate's rule when no Gate is given", () => {
    expect(gateOfReports([report(), report({ mode: "migration" })])).toBe("PASS");
    expect(gateOfReports([report(), report({ verdict: "warn" })])).toBe("WARN");
    expect(gateOfReports([report({ verdict: "warn" }), report({ verdict: "fail" })])).toBe("FAIL");
    expect(gateOfReports([{ ...report({ verdict: "fail" }), override: { reason: "x".repeat(20), by: "a", verdict: "fail", applied: true, at: "t" } }])).toBe("FAIL (OVERRIDDEN)");
  });
});

// ---- floors and bands ------------------------------------------------------------------------------------------

describe("floors and bands", () => {
  it("the weights sum to 100; the bands are Green >= 90, Amber 75-89, Red < 75; a floor caps at 74", () => {
    expect(DIMENSIONS.reduce((s, d) => s + d.weight, 0)).toBe(100);
    expect(DIMENSIONS.map((d) => [d.name, d.weight])).toEqual([["Claim coverage", 20], ["Noise health", 15], ["Statistical margin", 10], ["Rehearsals", 10], ["Test signal", 15], ["Requirements traceability", 10], ["Change risk", 15], ["Post-deploy history", 5]]);
    expect(BANDS.map((b) => [b.band, b.min])).toEqual([["Green", 90], ["Amber", 75], ["Red", 0]]);
    expect([100, 90, 89, 75, 74, 0].map((x) => bandOf(x).band)).toEqual(["Green", "Green", "Amber", "Amber", "Red", "Red"]);
    expect(FLOOR_CAP).toBe(74);
  });

  it("one hollow dimension cannot hide behind strong ones: a skipped rehearsal caps a 95 at 74, Red, and says why", () => {
    const c = confidence(inputs({ upgrade: undefined as never }));
    expect(dim(c, "rehearsals")).toMatchObject({ score: 50, floorBreached: true, deductions: [{ points: 50, why: "the upgrade rehearsal was skipped (no upgrade run)", floor: true }] });
    expect(c.mean).toBe(90.91);
    expect(c).toMatchObject({ rcs: 74, band: "Red", note: "Capped at 74 from 90: the floor of Rehearsals is breached." });
  });

  it("each dimension's floor is the plan's", () => {
    const floored = (d: DimensionScore) => d.floorBreached;
    expect(floored(claimCoverage(at(report({ matched: [[hunk("dom", "x"), claim("*", "**", "all", { approvedBy: "a" })]] }))))).toBe(true);
    expect(floored(claimCoverage(at(report({ stale: [1, 2].map((i) => claim("dom", `s${i}`, "r")) }))))).toBe(false);
    expect(floored(claimCoverage(at(report({ stale: [1, 2, 3].map((i) => claim("dom", `s${i}`, "r")) }))))).toBe(true);
    expect(floored(noiseHealth(at(report({ noise: null }))))).toBe(true);
    expect(floored(noiseHealth(at(report({ noise: { ranAt: "2026-09-19T10:00:00.000Z", clean: true, hunks: 0 } }))))).toBe(true);
    expect(floored(noiseHealth(at(report({ noise: { ranAt: "2026-09-24T10:00:00.000Z", clean: true, hunks: 0 } }))))).toBe(false);
    expect(floored(noiseHealth(at(report({ noise: { ranAt: "2026-09-27T02:00:00.000Z", clean: true, hunks: 0, degraded: ["cached"] } }))))).toBe(true);
    expect(floored(statisticalMargin(at(report({ info: [hunk("timing", "reader:home", { severity: "info", summary: "reader:home TTFB median 10ms → 14ms but not significant (p=0.071)" })] }))))).toBe(true);
    expect(floored(statisticalMargin(at(report({ load: { failed: 1 } }))))).toBe(true);
    expect(floored(testSignal(at({ packages: [{ name: "live", mutationScore: 59 }] }, "t.json")))).toBe(true);
    expect(floored(testSignal(at({ harnessMutants: { caught: 7, total: 8 } }, "t.json")))).toBe(true);
    expect(floored(traceability(at({ entries: [{ entry: "x", kind: "feature" as const }] }, "t.json")))).toBe(true);
    expect(floored(traceability(at({ entries: [{ entry: "x", kind: "fix" as const }] }, "t.json")))).toBe(false);
    expect(floored(changeRisk(at({ prs: [{ number: 1, reviewed: false }] }, "c.json")))).toBe(true);
    expect(floored(postDeploy(at(report({ mode: "post-deploy", verdict: "fail" }), "../pd")))).toBe(true);
  });
});

// ---- not measured ----------------------------------------------------------------------------------------------

describe("a dimension without its input is not measured, never 100", () => {
  it("left out of the mean, which is renormalised over the rest, and the weights used are recorded", () => {
    const c = confidence(inputs({ release: at(report({ stale: [claim("dom", "old", "r")] })) }));
    for (const id of ["test-signal", "traceability", "change-risk", "post-deploy"] as const) {
      expect(dim(c, id)).toMatchObject({ status: "not measured", score: null, floorBreached: false, deductions: [] });
      expect(dim(c, id).reason).toMatch(/pass --[a-z-]+ </);
      expect(c.weightsUsed[id]).toBeUndefined();
    }
    // 20*85 + 15*100 + 10*100 + 10*100 = 5200 over 55
    expect(c.mean).toBe(94.55);
    expect(c.rcs).toBe(94);
    expect(c.weightsUsed).toEqual({ "claim-coverage": 36.36, "noise-health": 27.27, "statistical-margin": 18.18, rehearsals: 18.18 });
    expect(renderBoard(c)).toContain("4 of 8 dimensions measured (weight 55 of 100, renormalised); the rest are not measured and not counted");
  });

  it("with no release report the release dimensions are not measured either, and nothing measured is no RCS", () => {
    const c = confidence({ gate: "PASS", run: { reports: {} } });
    expect(dim(c, "claim-coverage").status).toBe("not measured");
    expect(dim(c, "rehearsals").status).toBe("measured");
    const none = confidence({ gate: "PASS", run: { reports: {} } });
    expect(none.dimensions.filter((d) => d.status === "measured").map((d) => d.id)).toEqual(["rehearsals"]);
    expect(weightedMean(none.dimensions.filter((d) => d.status === "not measured")).mean).toBeNull();
  });

  it("a measured dimension says what it could not look at", () => {
    const c = confidence(workedExample());
    expect(dim(c, "noise-health").gaps).toEqual([expect.stringContaining("masks added this release")]);
    expect(dim(c, "change-risk").gaps).toEqual(["churn between the two tags"]);
    expect(testSignal(at({ packages: [] }, "t.json")).gaps).toEqual(["the weekly harness mutants (none given)"]);
  });
});

// ---- deductions are explainable ---------------------------------------------------------------------------

describe("every point lost names where it went", () => {
  it("a hunk's deduction links to that hunk's row in the run's report.html, and the anchor is there", () => {
    const h = hunk("dom", "reader:course");
    const t = hunk("timing", "reader:home", { severity: "info", summary: "reader:home TTFB median 10ms → 13ms but not significant (p=0.150)" });
    const r = report({ unclaimed: [h], info: [t], masks: { quiet: 0 } });
    const html = renderHtml(r);
    const c = confidence(inputs({ gate: "WARN", release: at(r, "../2026-09-27T10-00-00-release") }));
    const all = c.dimensions.flatMap((d) => d.deductions);
    expect(all.length).toBeGreaterThanOrEqual(3);
    for (const d of all) {
      expect(d.why.length, JSON.stringify(d)).toBeGreaterThan(10);
      const [file, anchor] = d.evidence.split("#");
      expect(file).toBe("../2026-09-27T10-00-00-release/report.html");
      if (anchor) expect(html, anchor).toContain(`id="${anchor}"`);
    }
    expect(all.map((d) => d.evidence)).toContain(`../2026-09-27T10-00-00-release/report.html#hunk-${h.id}`);
    expect(all.map((d) => d.evidence)).toContain(`../2026-09-27T10-00-00-release/report.html#hunk-${t.id}`);
  });

  it("statistical margin reads the p-values the engines print, and what could not be judged", () => {
    const d = statisticalMargin(
      at(
        report({
          info: [
            hunk("timing", "a", { severity: "info", summary: "a TTFB median 10ms → 12ms but not significant (p=0.081)" }),
            hunk("timing", "b", { severity: "info", summary: "b TTFB median 10ms → 12ms but not significant (p=0.190)" }),
            hunk("timing", "c", { severity: "info", summary: "c TTFB median 10ms → 12ms but not significant (p=0.450)" }),
            hunk("timing", "d", { severity: "info", summary: "d TTFB median 10ms → 20ms (+100%); 3/3 samples cannot reach alpha 0.05 (best possible p=0.100). Raise --runs" })
          ],
          matched: [[hunk("timing", "load/http_req_duration", { summary: "under load, p95 2ms → 4ms, p=1.2e-5" }), claim("timing", "load/**", "Rule 0050: heavier page")]],
          load: null
        })
      )
    );
    expect(d.deductions.map((x) => [x.points, x.why.slice(0, 23), x.floor ?? false])).toEqual([
      [20, "a: p=0.081, within 0.05", true],
      [10, "b: p=0.190, not above 0", false],
      [10, "d moved but could not b", false],
      [20, "no k6 load ran in the r", false]
    ]);
    expect(d.score).toBe(40);
  });

  it("rehearsals: a failed or warned rehearsal and failed requests during the rollout", () => {
    const d = rehearsals(at(report({ mode: "migration", verdict: "warn" }), "../m"), at(report({ mode: "upgrade", upgrade: { failed: 2, serverErrors: 1 } }), "../u"));
    expect(d.deductions).toEqual([
      { points: 20, why: "the migration rehearsal only WARNED: ok", evidence: "../m/report.html#migration" },
      { points: 50, why: "3 of 900 request(s) failed or answered 5xx during the rollout", evidence: "../u/report.html#upgrade" }
    ]);
  });

  it("change risk names the PR and the file, never the person", () => {
    const d = changeRisk(at({ prs: [{ number: 7, url: "https://github.com/tutors-sdk/tutors-mono-repo/pull/7", reviewed: true, firstTimeContributor: true, hotspots: ["a.ts"] }] }, "c.json"));
    expect(d.deductions).toEqual([{ points: 40, why: "PR #7, a first contribution, touches hotspot a.ts", evidence: "https://github.com/tutors-sdk/tutors-mono-repo/pull/7" }]);
  });
});

// ---- rendering -------------------------------------------------------------------------------------------------

describe("the board", () => {
  it("Gate first, then the RCS and band with its meaning, then one row per dimension with its score or 'not measured', and any floor breach", () => {
    const c = confidence(inputs({ upgrade: undefined as never }));
    const lines = renderBoard(c, "/o/confidence.json").split("\n");
    expect(lines[0]).toBe("Gate: PASS");
    expect(lines[1]).toBe("RCS 74 Red: hold, open a 5 Whys, do not re-run hoping for a better number");
    const rows = lines.slice(5, 13);
    expect(rows.map((l) => l.trim().split(/\s{2,}/)[0])).toEqual(DIMENSIONS.map((d) => d.name));
    expect(rows[3]).toMatch(/^ {2}Rehearsals\s+10 {2}50\s+BREACHED \(caps the RCS at 74\) {2}-50: 1 deduction\(s\)$/);
    expect(rows[4]).toMatch(/^ {2}Test signal\s+15 {2}not measured {2}needs the monorepo's CI/);
    expect(lines).toContain("  -50 Rehearsals: the upgrade rehearsal was skipped (no upgrade run) [floor]");
    expect(lines.at(-1)).toBe("confidence.json: /o/confidence.json");
  });

  it("a FAIL board shows the Gate and no RCS", () => {
    const lines = renderBoard(confidence(inputs({ gate: "FAIL" }))).split("\n");
    expect(lines[0]).toBe("Gate: FAIL");
    expect(lines[1]).toMatch(/^No RCS: Gate FAIL\. The Gate wins/);
  });

  it("the Markdown lead: RCS and band in bold, then the dimension table", () => {
    const md = renderScoreMarkdown(confidence(workedExample()));
    expect(md.split("\n")[0]).toBe("**RCS 85 Amber: ship only after the reviewer's glance is recorded verified**");
    expect(md).toContain("| Change risk | 15 | **60** |  | −40 PR #412, a first contribution, touches hotspot packages/reader/src/lib/course.ts |");
  });
});

// ---- confidence.json and the command ----------------------------------------------------------------------------

const schema = JSON.parse(readFileSync(resolve(ROOT, "docs/contract/confidence.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true, strict: true }).compile(schema);

describe("confidence.json", () => {
  it("matches its schema: PASS, FAIL, not measured, a floor breach, the worked example", () => {
    for (const c of [confidence(workedExample()), confidence(inputs({ gate: "FAIL" })), confidence(inputs({ upgrade: undefined as never })), confidence({ gate: "NOT JUDGED", run: { reports: {} } })]) {
      validate(JSON.parse(JSON.stringify(c)));
      expect(validate.errors ?? []).toEqual([]);
    }
  });
});

function runDir(root: string, name: string, r: RunReport): string {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "report.json"), JSON.stringify(r));
  return dir;
}

describe("harness confidence", () => {
  it("--run <release run dir> writes confidence.json beside report.json and prints the board; exit 0", () => {
    const root = tmp("cmd");
    const rel = runDir(root, "2026-09-27T10-00-00-release", report());
    const mig = runDir(root, "2026-09-27T10-30-00-migration", report({ mode: "migration" }));
    const out: string[] = [];
    expect(confidenceCommand({ run: join(rel, "report.json"), migration: mig }, (m) => out.push(m))).toBe(0);
    const c = JSON.parse(readFileSync(join(rel, "confidence.json"), "utf8")) as Confidence;
    expect(c).toMatchObject({ gate: "PASS", rcs: 74, band: "Red", run: { candidate: "16.3.0-rc.1", baseline: "16.2.2", reports: { release: "report.json", migration: "../2026-09-27T10-30-00-migration/report.json" } } });
    expect(c.run.harness?.contractVersion).toBe("1.9.0");
    expect(out[0]!.split("\n")[0]).toBe("Gate: PASS");
    validate(c);
    expect(validate.errors ?? []).toEqual([]);
  });

  it("--run <harness release dir> reads gate.json: its runs and its Gate, and writes confidence.json there", () => {
    const root = tmp("cmd-release");
    const rel = runDir(root, "a-release", report({ verdict: "warn" }));
    const cmd = join(root, "x-release-command");
    mkdirSync(cmd);
    writeFileSync(join(cmd, "gate.json"), JSON.stringify({ production: "16.2.2", candidate: "16.3.0-rc.1", code: 0, steps: [{ id: "release", title: "r", code: 0, runDir: rel, verdict: "warn" }, { id: "migration", title: "m", code: "skipped" }] }));
    const out: string[] = [];
    expect(confidenceCommand({ run: cmd, json: true }, (m) => out.push(m))).toBe(0);
    const c = JSON.parse(out[0]!) as Confidence;
    expect(c).toMatchObject({ gate: "WARN", run: { candidate: "16.3.0-rc.1", baseline: "16.2.2", reports: { release: "../a-release/report.json" } } });
    expect(existsSync(join(cmd, "confidence.json"))).toBe(true);
  });

  it("the score never sets the exit code: a Red score and a FAIL both exit 0; only an input it cannot read is 2", () => {
    const root = tmp("cmd-exit");
    const fail = runDir(root, "f-release", report({ unclaimed: [hunk("dom", "x")] }));
    expect(confidenceCommand({ run: fail }, () => {})).toBe(0);
    expect(JSON.parse(readFileSync(join(fail, "confidence.json"), "utf8"))).toMatchObject({ gate: "FAIL", rcs: null });
    expect(() => confidenceCommand({}, () => {})).toThrow(UsageError);
    expect(() => confidenceCommand({ run: join(root, "nope") }, () => {})).toThrow(/no report\.json/);
    const noise = runDir(root, "n-noise", report({ mode: "noise" }));
    expect(() => confidenceCommand({ run: noise }, () => {})).toThrow(/a noise-mode report, not release/);
    const bad = join(root, "ts.json");
    writeFileSync(bad, JSON.stringify({ packages: [{ name: "reader", mutationScore: 172 }] }));
    expect(() => confidenceCommand({ run: fail, "test-signal": bad }, () => {})).toThrow(/--test-signal: .*"packages" must be/);
  });

  it("the optional inputs are refused when malformed, never silently not measured", () => {
    const root = tmp("inputs");
    const rel = runDir(root, "r-release", report());
    const write = (name: string, v: unknown) => {
      const f = join(root, name);
      writeFileSync(f, typeof v === "string" ? v : JSON.stringify(v));
      return f;
    };
    const cases: [keyof Parameters<typeof scoreInputs>[0], unknown, RegExp][] = [
      ["testSignal", {}, /needs "packages" or "harnessMutants"/],
      ["testSignal", { harnessMutants: { caught: 9, total: 8 } }, /caught <= total/],
      ["traceability", { entries: [{ entry: "x", kind: "epic" }] }, /"entries" must be/],
      ["changeRisk", { prs: [{ number: 1 }] }, /"prs" must be/],
      ["changeRisk", "not json", /is not JSON/]
    ];
    for (const [key, v, re] of cases) expect(() => scoreInputs({ outDir: rel, release: rel, [key]: write(`${key}.json`, v) }), String(key)).toThrow(re);
    expect(() => scoreInputs({ outDir: rel, release: rel, postDeploy: rel })).toThrow(ScoreInputError);
  });

  it("scores a real release run: the checked-in 16.2.1 -> 16.2.2 report (a FAIL, so no RCS)", () => {
    const root = tmp("example");
    cpSync(resolve(ROOT, "examples/release-16.2.1-to-16.2.2"), join(root, "run"), { recursive: true });
    const out: string[] = [];
    expect(confidenceCommand({ run: join(root, "run") }, (m) => out.push(m))).toBe(0);
    const c = JSON.parse(readFileSync(join(root, "run", "confidence.json"), "utf8")) as Confidence;
    expect(c).toMatchObject({ gate: "FAIL", rcs: null, band: null, run: { candidate: "16.2.2", baseline: "16.2.1" } });
    expect(c.dimensions.map((d) => [d.id, d.status])).toEqual([
      ["claim-coverage", "measured"],
      ["noise-health", "measured"],
      ["statistical-margin", "measured"],
      ["rehearsals", "measured"],
      ["test-signal", "not measured"],
      ["traceability", "not measured"],
      ["change-risk", "not measured"],
      ["post-deploy", "not measured"]
    ]);
    validate(c);
    expect(validate.errors ?? []).toEqual([]);
  });
});

// ---- guardrails ---------------------------------------------------------------------------------------------------

/** Every local module `file` imports, transitively. */
function importsOf(file: string, seen = new Set<string>()): Set<string> {
  if (seen.has(file)) return seen;
  seen.add(file);
  for (const m of readFileSync(file, "utf8").matchAll(/^\s*(?:import|export)\b[^;]*?from\s+"(\.[^"]+)"/gm)) {
    const target = resolve(dirname(file), m[1]!);
    if (existsSync(target)) importsOf(target, seen);
  }
  return seen;
}

describe("guardrails", () => {
  it("the score is never an input to the gate: src/gate.ts and src/run.ts import nothing under src/score, directly or through anything they import", () => {
    for (const f of ["src/gate.ts", "src/run.ts"]) {
      const reached = [...importsOf(resolve(ROOT, f))].map((p) => p.slice(ROOT.length + 1).replaceAll("\\", "/"));
      expect(reached.length, f).toBeGreaterThan(1);
      expect(reached.filter((p) => p.startsWith("src/score/")), f).toEqual([]);
    }
  });

  it("the weights and the bands live in one file, which says they change only by a PR with a 5 Whys attached", () => {
    const weights = readFileSync(resolve(ROOT, "src/score/weights.ts"), "utf8");
    expect(weights).toContain("change only by a pull request with a 5 Whys attached");
    for (const f of readdirSync(resolve(ROOT, "src/score")).filter((x) => x !== "weights.ts")) {
      const text = readFileSync(resolve(ROOT, "src/score", f), "utf8");
      expect(text, f).not.toMatch(/weight:\s*\d|min:\s*(90|75)\b/);
    }
  });
});
