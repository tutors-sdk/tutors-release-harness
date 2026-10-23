import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { attributeClock, clockReading, clockReasons, probeClock } from "../src/clock-probe.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { Hunk, Mode, SideCapture } from "../src/types.ts";
import { capture, clone, page, journey } from "./support/captures.ts";

const FROZEN = "2026-09-16T09:05:00.000Z";
/** The capture happened on another day: the two clocks are distinguishable. */
const CAPTURED = "2026-09-21T14:30:00.000Z";

const withAria = (aria: string, headers: Record<string, string> = {}): SideCapture => {
  const c = capture("a", { capturedAt: CAPTURED, journeys: [journey({ pages: [page({ aria, headers })] })] });
  return c;
};

describe("clock probe", () => {
  it("honours: the server stamped the frozen instant", () => {
    const probe = probeClock(withAria('- text: "Updated 2026-09-16T09:05:00Z"\n- text: "Week of 2026-09-16"'), FROZEN);
    expect(probe.verdict).toBe("honours");
    expect(probe.samples.every((s) => s.clock === "frozen")).toBe(true);
  });

  it("ignores: an instant near the real time of the capture, which the frozen browser cannot have produced", () => {
    const probe = probeClock(withAria('- text: "Updated 2026-09-21T14:29:12Z"'), FROZEN);
    expect(probe.verdict).toBe("ignores");
    expect(probe.samples).toEqual([expect.objectContaining({ clock: "wall-clock", text: "2026-09-21T14:29:12Z" })]);
  });

  it("a date-only stat label is matched to the day", () => {
    expect(probeClock(withAria('- heading "Today, 2026-09-21"'), FROZEN).verdict).toBe("ignores");
    expect(probeClock(withAria('- heading "Today, 2026-09-16"'), FROZEN).verdict).toBe("honours");
  });

  it("last-modified and expires count; the Date header never does", () => {
    expect(probeClock(withAria("- main:", { date: "Mon, 21 Sep 2026 14:30:00 GMT" }), FROZEN).verdict).toBe("no-evidence");
    expect(probeClock(withAria("- main:", { "last-modified": "Mon, 21 Sep 2026 14:29:00 GMT" }), FROZEN).verdict).toBe("ignores");
    expect(probeClock(withAria("- main:", { expires: "Wed, 16 Sep 2026 09:05:00 GMT" }), FROZEN).verdict).toBe("honours");
  });

  it("must not flag: dates that are data (a course's start date) are neither clock", () => {
    const probe = probeClock(withAria('- text: "Starts 2026-01-12"\n- text: "Build 2025-11-02T10:00:00Z"'), FROZEN);
    expect(probe.verdict).toBe("no-evidence");
    expect(probe.samples).toEqual([]);
  });

  it("no instants at all: no evidence, not a pass", () => {
    expect(probeClock(capture("a", { capturedAt: CAPTURED }), FROZEN).verdict).toBe("no-evidence");
  });

  it("when the frozen instant is within tolerance of the capture there is nothing to tell them apart by", () => {
    const c = clone(withAria('- text: "Updated 2026-09-16T09:10:00Z"'));
    c.capturedAt = "2026-09-16T09:12:00.000Z";
    expect(probeClock(c, FROZEN).verdict).toBe("indistinguishable");
  });

  it("refuses a frozen instant that is not a date", () => {
    expect(() => probeClock(capture("a"), "yesterday")).toThrow(/frozen instant/);
  });
});

describe("clock probe, wired (1.51.0)", () => {
  const plain = () => withAria('- heading "Runway Fixture Course" [level=1]');
  const stamped = () => withAria('- heading "Runway Fixture Course" [level=1]\n- text: "Updated 2026-09-21T14:29:12Z"');
  const run = (a: SideCapture, b: SideCapture, mode: Mode = "release") =>
    compareFromCaptures({ mode, substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-clock-")), a, b: { ...b, side: "b" }, claims: [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: FROZEN, runs: 1, ranAt: new Date("2026-09-21T14:40:00Z"), log: () => {} }).report;

  it("A/A: no stamp on either side is no-evidence on both, no reason, no advice", () => {
    const r = run(plain(), plain());
    expect(r.clock).toEqual({ a: { verdict: "no-evidence", samples: [] }, b: { verdict: "no-evidence", samples: [] } });
    expect(r.reasons.join("\n")).not.toMatch(/HARNESS_NOW/);
  });

  it("planted: b stamps the wall clock; a reason names it, and the dom hunk it caused carries the advice", () => {
    const r = run(plain(), stamped());
    expect(r.clock?.b).toEqual({ verdict: "ignores", samples: [{ where: "anonymous-student-reads-course/reader:course aria", text: "2026-09-21T14:29:12Z", clock: "wall-clock" }] });
    expect(r.reasons).toContain(`side b ignores HARNESS_NOW: "2026-09-21T14:29:12Z" at anonymous-student-reads-course/reader:course aria is the real time of the capture, not the frozen ${FROZEN}; a difference it causes is the app's clock, not a change (docs/harness-now.md)`);
    const dom = r.compare.hunks.filter((h) => h.artefact === "dom");
    expect(dom).toHaveLength(1);
    expect(dom[0]!.advice?.[0]).toMatch(/^"2026-09-21T14:29:12Z" is side b's real clock, not the frozen/);
    // Advice, not a verdict: the hunk still fails and is still unclaimed.
    expect(dom[0]!.severity).toBe("fail");
    expect(r.verdict).toBe("fail");
  });

  it("must not flag: a stamp of the frozen clock, a date that is data, and post-deploy, whose live side never has HARNESS_NOW", () => {
    expect(run(plain(), withAria('- text: "Updated 2026-09-16T09:05:00Z"')).reasons.join("\n")).not.toMatch(/ignores HARNESS_NOW/);
    expect(run(plain(), withAria('- text: "Starts 2026-01-12"')).clock?.b.verdict).toBe("no-evidence");
    const pd = run(plain(), stamped(), "post-deploy");
    expect(pd.clock).toBeUndefined();
    expect(pd.reasons.join("\n")).not.toMatch(/HARNESS_NOW/);
  });

  it("advice only on a dom hunk of the page the stamp was seen on, holding the stamp; a side that cannot be probed is skipped", () => {
    const clock = clockReading(plain(), stamped(), "release", FROZEN)!;
    const h = (scope: string, detail: string): Hunk => ({ id: scope, artefact: "dom", scope, severity: "fail", summary: "x", detail });
    const other: Hunk = { ...h("reader:course", "+ 2026-09-21T14:29:12Z"), artefact: "network" };
    const hunks = [h("reader:course", '+  - text: "Updated 2026-09-21T14:29:12Z"'), h("reader:course", "+ Topic 2"), h("reader:lab", "+ 2026-09-21T14:29:12Z"), other];
    const got = attributeClock(hunks, clock, FROZEN);
    expect(got.map((x) => Boolean(x.advice))).toEqual([true, false, false, false]);
    expect(got[1]).toBe(hunks[1]);
    expect(attributeClock(hunks, undefined, FROZEN)).toBe(hunks);
    expect(clockReading(plain(), stamped(), "release", "yesterday")).toBeUndefined();
    expect(clockReasons(undefined, FROZEN)).toEqual([]);
  });

  it("keeps at most five samples a side, and counts the rest in the reason", () => {
    const many = withAria(Array.from({ length: 7 }, (_, i) => `- text: "Updated 2026-09-21T14:2${i}:00Z"`).join("\n"));
    const clock = clockReading(plain(), many, "release", FROZEN)!;
    expect(clock.b.samples).toHaveLength(5);
    expect(clockReasons(clock, FROZEN)[0]).toContain("(and 4 more)");
  });
});
