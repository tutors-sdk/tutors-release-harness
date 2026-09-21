import { describe, expect, it } from "vitest";
import { probeClock } from "../src/clock-probe.ts";
import type { SideCapture } from "../src/types.ts";
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
