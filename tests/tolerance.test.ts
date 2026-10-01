/**
 * The timing tolerance (since 1.26.0, runway improvement D): a significant slowdown of 10% or more of a's median
 * "matters"; one under 10% is within tolerance. Informing until 2.0: reported, never gates.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { ENGINE_LEVELS } from "../src/compare/levels.ts";
import { TIMING_TOLERANCE, timingTolerance } from "../src/compare/tolerance.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { SideCapture } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
const tol = (a: SideCapture, b: SideCapture) => diff(a, b).filter((h) => h.artefact === "timing-tolerance");
const withRuns = (side: "a" | "b", ttfbs: number[], durations: number[]) =>
  capture(side, { journeys: ttfbs.map((ttfb, i) => journey({ run: i + 1, durationMs: durations[i]!, pages: [page({ timing: { ttfbMs: ttfb, responseEndMs: ttfb + 20 } })] })) });
const scale = (xs: number[], f: number) => xs.map((x) => Math.round(x * f));
const TTFB = [200, 204, 202, 206, 201];
const DUR = [4000, 4100, 4050, 4020, 4080];

describe("the tolerance", () => {
  it("is 10%, and the check ships informing with no date", () => {
    expect(TIMING_TOLERANCE).toBe(0.1);
    expect(ENGINE_LEVELS["timing-tolerance"]).toEqual({ level: "informing" });
  });

  it("a significant 15% slowdown matters: timing's 20% floor hides it, the tolerance reports it", () => {
    const hunks = diff(withRuns("a", TTFB, DUR), withRuns("b", scale(TTFB, 1.15), scale(DUR, 1.15)));
    expect(hunks.filter((h) => h.artefact === "timing")).toEqual([]);
    const t = hunks.filter((h) => h.artefact === "timing-tolerance");
    expect(t.map((h) => h.scope).sort()).toEqual(["anonymous-student-reads-course", "reader:course"]);
    const page_ = t.find((h) => h.scope === "reader:course")!;
    expect(page_).toMatchObject({ severity: "fail", path: "/course/localhost:8080" });
    expect(page_.summary).toMatch(/^reader:course TTFB slower on b beyond the 10% tolerance: 202ms → 232ms \(\+15%, p=0\.012, n=5\/5 samples; smallest detectable about \d+%\); under timing's 20% floor, so only the tolerance reports it$/);
    expect(t.find((h) => h.scope === "anonymous-student-reads-course")!.summary).toContain("n=5/5 runs");
  });

  it("a significant 30% slowdown: timing fails it too, and the tolerance says so", () => {
    const t = tol(withRuns("a", TTFB, DUR), withRuns("b", scale(TTFB, 1.3), scale(DUR, 1.3)));
    expect(t).toHaveLength(2);
    for (const h of t) expect(h.summary).toMatch(/timing fails it too \(its floor is 20%\)$/);
  });

  it("a significant 5% slowdown is within tolerance: not a finding", () => {
    expect(tol(withRuns("a", TTFB, DUR), withRuns("b", scale(TTFB, 1.05), scale(DUR, 1.05)))).toEqual([]);
  });

  it("15% that is not significant is not a finding (timing's own lines say what the runs could detect)", () => {
    expect(tol(withRuns("a", [200, 260, 210, 240, 205], [4000, 4600, 4200, 4300, 4050]), withRuns("b", [215, 250, 245, 230, 270], [4100, 4500, 4800, 4250, 4900]))).toEqual([]);
  });

  it("three runs can never reach alpha, and too small a shift in milliseconds is not a finding", () => {
    expect(tol(withRuns("a", TTFB.slice(0, 3), DUR.slice(0, 3)), withRuns("b", scale(TTFB.slice(0, 3), 1.5), scale(DUR.slice(0, 3), 1.5)))).toEqual([]);
    // 40ms → 46ms is +15% but under timing.minShiftMs (20 ms)
    expect(tol(withRuns("a", [40, 41, 40, 42, 41], DUR), withRuns("b", [46, 47, 46, 48, 47], DUR))).toEqual([]);
  });

  it("the k6 leg: judged on its p95 over every request", () => {
    const spread = (centre: number) => Array.from({ length: 200 }, (_, i) => centre + (i % 20) - 10);
    const withLoad = (side: "a" | "b", p95: number, samples: number[]) => capture(side, { load: { requests: samples.length, failed: 0, serverErrors: 0, samples, p50: samples[100]!, p95, rate: 20, duration: "20s" } });
    const t = timingTolerance(withLoad("a", 200, spread(190)), withLoad("b", 230, spread(219)), { config: masks });
    expect(t.map((h) => [h.scope, h.severity])).toEqual([["load/http_req_duration", "fail"]]);
    expect(t[0]!.summary).toMatch(/^under load, p95 slower on b beyond the 10% tolerance: 200ms → 230ms \(\+15%, p=[0-9.e-]+, n=200\/200 samples/);
  });

  it("a live deployment is not the same clock: nothing", () => {
    const a = withRuns("a", TTFB, DUR);
    const b = withRuns("b", scale(TTFB, 1.15), scale(DUR, 1.15));
    expect(timingTolerance({ ...a, external: true }, b, { config: masks })).toEqual([]);
  });

  it("through a run: informing, so the verdict is what it would be without it, and the report lists it", () => {
    const run = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-tol-")), a: withRuns("a", TTFB, DUR), b: withRuns("b", scale(TTFB, 1.15), scale(DUR, 1.15)), claims: [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-10T09:00:00.000Z", runs: 5, ranAt: new Date("2026-10-10T09:00:00Z"), log: () => {} }).report;
    expect(run.compare.unclaimed.filter((h) => h.artefact === "timing-tolerance")).toEqual([]);
    const informing = run.compare.hunks.filter((h) => h.artefact === "timing-tolerance");
    expect(informing).toHaveLength(2);
    for (const h of informing) expect(h).toMatchObject({ severity: "info", level: "informing" });
    expect(run.levels!["timing-tolerance"]).toEqual({ level: "informing" });
  });
});
