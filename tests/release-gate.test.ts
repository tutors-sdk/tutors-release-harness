/**
 * The rule that makes the harness honest, end to end: release mode may FAIL
 * only on the evidence of a fresh, clean, verified A/A, and WARNS otherwise.
 * Every case runs the real pipeline (`compareFromCaptures`: normalise, diff,
 * claims, gate, reports) on a planted change, with a real noise-status.json on
 * disk, and reads back report.json and the exit code.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseClaims } from "../src/claims/schema.ts";
import { exitCodeForReport } from "../src/override.ts";
import { compareFromCaptures, evidenceGaps } from "../src/run.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import type { Mode, NoiseStatus, RunReport, SideCapture, SideProvenance } from "../src/types.ts";
import { capture, clone } from "./support/captures.ts";

const NOW = "2026-09-16T09:05:00.000Z";
const day = 86_400_000;

function writeStatus(status: NoiseStatus | undefined, raw?: string): string | undefined {
  if (!status && raw === undefined) return undefined;
  const dir = mkdtempSync(join(tmpdir(), "harness-noise-"));
  writeFileSync(join(dir, "noise-status.json"), raw ?? JSON.stringify(status));
  return dir;
}

interface Run {
  mode?: Mode;
  changed?: boolean;
  noise?: string;
  claims?: string;
  override?: { reason: string; by: string };
  a?: SideCapture;
  b?: SideCapture;
  requireVerified?: boolean;
}

function go(opts: Run = {}) {
  const dir = mkdtempSync(join(tmpdir(), "harness-gate-"));
  const b = opts.b ?? clone(capture("b"));
  if (opts.changed !== false) delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
  const outcome = compareFromCaptures({
    mode: opts.mode ?? "release",
    substrate: "compose",
    captureDir: dir,
    a: opts.a ?? capture("a"),
    b,
    claims: opts.claims ? parseClaims(opts.claims) : [],
    masksFile: DEFAULT_MASKS_FILE,
    noiseMaxAgeDays: 7,
    now: NOW,
    runs: 1,
    log: () => {},
    ...(opts.noise ? { noise: opts.noise } : {}),
    ...(opts.override ? { override: opts.override } : {}),
    ...(opts.requireVerified ? { requireVerified: true } : {})
  });
  const written = JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport;
  return { dir, report: outcome.report, written, exit: exitCodeForReport(outcome.report) };
}

// compareFromCaptures stamps ranAt with the wall clock, so "fresh" is relative to now.
const fresh = (daysAgo: number, extra: Partial<NoiseStatus> = {}): NoiseStatus => ({ schemaVersion: 1, ranAt: new Date(Date.now() - daysAgo * day).toISOString(), clean: true, hunks: 0, ...extra });

describe("release mode without a fresh, clean, verified noise status: WARN, exit 0", () => {
  const cases: [string, () => string | undefined, RegExp][] = [
    ["none supplied (the noise branch does not exist yet, or the file was dropped by `vet`)", () => undefined, /no A\/A/],
    ["the last A/A had diffs", () => writeStatus(fresh(1, { clean: false, hunks: 3 })), /3 diff/],
    ["the last clean A/A is eight days old", () => writeStatus(fresh(8)), /older than 7/],
    ["the last A/A was degraded (a cache, a local build)", () => writeStatus(fresh(1, { degraded: ["side a did not run pulled+verified images (cached 2026-09-14)"] })), /degraded and does not count/]
  ];
  for (const [name, noise, why] of cases) {
    it(name, () => {
      const { report, exit } = go({ ...(noise() ? { noise: noise()! } : {}) });
      expect(report.verdict).toBe("warn");
      expect(report.reasons[0]).toMatch(/^advisory only:/);
      expect(report.reasons[0]).toMatch(why);
      expect(report.compare.unclaimed).toHaveLength(1);
      expect(exit).toBe(0);
    });
  }

  it("a status that is not valid stops the run, it is never read generously (the workflows vet it first)", () => {
    expect(() => go({ noise: writeStatus(undefined, '{"clean": true}')! })).toThrow(/not a valid noise status/);
  });
});

describe("release mode with a fresh, clean, verified noise status: FAIL on an unclaimed change, exit 1", () => {
  it("fails, and the report says which A/A licensed it", () => {
    const { report, written, exit } = go({ noise: writeStatus(fresh(1))! });
    expect(report.verdict).toBe("fail");
    expect(report.reasons[0]).toMatch(/1 unclaimed/);
    expect(written.noise?.clean).toBe(true);
    expect(exit).toBe(1);
  });

  it("a status written by an older harness (no degraded field) still counts", () => {
    const { verdict } = go({ noise: writeStatus({ ranAt: fresh(2).ranAt, clean: true, hunks: 0 })! }).report;
    expect(verdict).toBe("fail");
  });

  it("passes when the change is claimed, and still needs no A/A to say so", () => {
    const claims = 'claims:\n  - artefact: headers\n    scope: "reader:course/x-frame-options"\n    reason: "Rule 0012: frame options dropped on purpose"\n';
    expect(go({ noise: writeStatus(fresh(1))!, claims }).report.verdict).toBe("pass");
    expect(go({ claims }).report.verdict).toBe("pass");
  });

  it("post-deploy obeys the same rule", () => {
    expect(go({ mode: "post-deploy", noise: writeStatus(fresh(1))! }).report.verdict).toBe("fail");
    expect(go({ mode: "post-deploy" }).report.verdict).toBe("warn");
    expect(go({ mode: "post-deploy", noise: writeStatus(fresh(9))! }).report.verdict).toBe("warn");
  });

  it("an explicit waiver is the only other way to FAIL without a status, and the report has no noise field", () => {
    const { report } = go({ noise: "skip" });
    expect(report.verdict).toBe("fail");
    expect(report.noise).toBeUndefined();
  });

  it("nothing to claim, nothing to warn about: identical sides pass with or without a status", () => {
    expect(go({ changed: false }).report.verdict).toBe("pass");
    expect(go({ changed: false, noise: writeStatus(fresh(1))! }).report.verdict).toBe("pass");
  });
});

describe("noise mode: the A/A that produces the status", () => {
  const local: SideProvenance = { summary: "local (unverified)", images: { reader: { ref: "x/reader:a", provenance: "local" }, catalogue: { ref: "x/catalogue:a", provenance: "local" }, live: { ref: "x/live:a", provenance: "local" } } };
  const cached: SideProvenance = { summary: "cached", images: { reader: { ref: "q/reader:a", provenance: "cached", cachedAt: "2026-09-14T02:30:00.000Z" }, catalogue: { ref: "q/catalogue:a", provenance: "pulled+verified" }, live: { ref: "q/live:a", provenance: "pulled+verified" } } };
  const verified: SideProvenance = { summary: "pulled+verified", images: { reader: { ref: "q/reader:a", provenance: "pulled+verified" }, catalogue: { ref: "q/catalogue:a", provenance: "pulled+verified" }, live: { ref: "q/live:a", provenance: "pulled+verified" } } };
  const status = (dir: string) => JSON.parse(readFileSync(join(dir, "noise-status.json"), "utf8")) as NoiseStatus;

  it("pulled and verified on both sides: pass, clean, not degraded", () => {
    const run = go({ mode: "noise", changed: false, requireVerified: true, a: capture("a", { provenance: verified }), b: capture("b", { provenance: verified }) });
    expect(run.report.verdict).toBe("pass");
    expect(status(run.dir)).toEqual({ schemaVersion: 1, ranAt: run.report.ranAt, clean: true, hunks: 0 });
  });

  it("a cache used during a registry outage: hunks 0 but WARN and degraded, so the gate will not trust it", () => {
    const run = go({ mode: "noise", changed: false, requireVerified: true, a: capture("a", { provenance: cached }), b: capture("b", { provenance: cached }) });
    expect(run.report.verdict).toBe("warn");
    expect(run.report.reasons[0]).toMatch(/DEGRADED/);
    expect(run.report.reasons.join("\n")).toMatch(/restored from the runner's cache/);
    const written = status(run.dir);
    expect(written.clean).toBe(true);
    expect(written.hunks).toBe(0);
    expect(written.degraded?.join(" ")).toMatch(/side a.*side b|side a/s);
    // ... and a release run handed that status may only warn.
    const release = go({ noise: run.dir });
    expect(release.report.verdict).toBe("warn");
    expect(release.exit).toBe(0);
    expect(release.report.reasons.join("\n")).toMatch(/degraded and does not count/);
  });

  it("a local build is degraded when verification is required, and not otherwise (mutants and laptops keep working)", () => {
    const opts = { mode: "noise" as const, changed: false, a: capture("a", { provenance: local }), b: capture("b", { provenance: local }) };
    expect(go({ ...opts, requireVerified: true }).report.verdict).toBe("warn");
    const relaxed = go(opts);
    expect(relaxed.report.verdict).toBe("pass");
    expect(status(relaxed.dir).degraded).toBeUndefined();
  });

  it("a dirty verified A/A is just dirty, not degraded", () => {
    const run = go({ mode: "noise", requireVerified: true, a: capture("a", { provenance: verified }), b: (() => ({ ...clone(capture("b")), provenance: verified }))() });
    expect(status(run.dir).clean).toBe(false);
    expect(status(run.dir).degraded).toBeUndefined();
  });

  it("evidenceGaps names each side that was not fully pulled and verified", () => {
    expect(evidenceGaps(capture("a", { provenance: verified }), capture("b", { provenance: verified }))).toEqual([]);
    expect(evidenceGaps(capture("a", { provenance: verified }), capture("b", { provenance: cached }))).toEqual([expect.stringContaining("side b")]);
    expect(evidenceGaps(capture("a"), capture("b"))).toHaveLength(2);
  });
});

describe("recorded overrides of a harness FAIL", () => {
  const reason = "Rule 0044: payments hotfix, frame options restored in 16.3.1";

  it("keeps the verdict FAIL, exits 0, and records who and why in report.json, report.md and report.html", () => {
    const { report, written, exit, dir } = go({ noise: writeStatus(fresh(1))!, override: { reason, by: "leigh" } });
    expect(report.verdict).toBe("fail");
    expect(exit).toBe(0);
    expect(written.override).toMatchObject({ reason, by: "leigh", verdict: "fail", applied: true });
    expect(written.reasons[0]).toContain("OVERRIDDEN by leigh");
    expect(readFileSync(join(dir, "report.md"), "utf8")).toContain("Harness FAIL overridden");
    expect(readFileSync(join(dir, "report.html"), "utf8")).toContain("Harness FAIL overridden");
  });

  it("without an override the same run exits 1", () => {
    expect(go({ noise: writeStatus(fresh(1))! }).exit).toBe(1);
  });

  it("an override on a run that did not fail is recorded as not needed, and changes nothing", () => {
    const warned = go({ override: { reason, by: "leigh" } });
    expect(warned.report.verdict).toBe("warn");
    expect(warned.written.override).toMatchObject({ verdict: "warn", applied: false });
    expect(warned.exit).toBe(0);
    const passed = go({ changed: false, override: { reason, by: "leigh" } });
    expect(passed.written.override?.applied).toBe(false);
  });

  it("no override, no field", () => {
    expect(go({ noise: writeStatus(fresh(1))! }).written.override).toBeUndefined();
  });
});
