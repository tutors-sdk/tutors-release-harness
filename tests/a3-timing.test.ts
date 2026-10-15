import { describe, expect, it } from "vitest";
import { timingCharts } from "../src/a3/timing.ts";

const run = (ranAt: string, a: number[], b: number[]) => ({ ranAt, report: { timingControl: { journeys: [{ journey: "student-signs-in", a, b, limits: { n: a.length, centre: 3400, mrBar: 60, ucl: 3560, lcl: 3240, provisional: true }, above: 0, below: 0 }] } } });

describe("timingCharts: each journey against production's control limits, night by night", () => {
  it("uses production's runs tonight until there are two nights, and calls main above them a special cause, not a failure", () => {
    const t = timingCharts([run("2026-10-15T19:51:00Z", [3400, 3450, 3380], [8400, 8479, 8500])])!;
    expect(t.journeys[0]).toMatchObject({ journey: "student-signs-in", from: "runs", state: "above UCL" });
    expect(t.journeys[0]!.words).toBe("main 8479ms is above the limits from production's 3 runs tonight (3240–3560ms): a special cause to investigate, not a failure; provisional limits, 3 runs");
  });

  it("moves to production's nightly medians once there are two nights, and reads main inside them as common cause", () => {
    const t = timingCharts([run("2026-10-14T02:00:00Z", [3400, 3420, 3410], [3430, 3440, 3420]), run("2026-10-15T02:00:00Z", [3500, 3480, 3490], [3470, 3460, 3480])])!;
    expect(t.journeys[0]).toMatchObject({ from: "nights", state: "inside", nights: [{ production: 3410, main: 3430 }, { production: 3490, main: 3470 }] });
    expect(t.journeys[0]!.words).toMatch(/^main 3470ms is inside the limits from production's last 2 nights .*: common cause, nothing to investigate/);
  });

  it("has nothing to say before a forecast recorded timing", () => {
    expect(timingCharts([{ ranAt: "2026-10-15T00:00:00Z", report: {} }])).toBeUndefined();
  });
});
