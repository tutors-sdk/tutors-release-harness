import { describe, expect, it } from "vitest";
import { timingAdvice } from "../src/compare/timing-advice.ts";
import { controlLine, timingControl } from "../src/compare/timing-control.ts";
import { capture, journey, page } from "./support/captures.ts";

describe("timingAdvice: what to check when a journey is slower on b, read from the two captures", () => {
  it("names the requests only b makes, says where the time went, and how to confirm it", () => {
    const a = capture("a", { journeys: [journey({ journey: "student-signs-in" })] });
    const base = page();
    const b = capture("b", {
      journeys: [journey({ journey: "student-signs-in", pages: [page({ network: [...base.network, { method: "POST", url: "{{origin}}/api/live/activity?x=1", status: 202, contentType: "application/json", cacheControl: "", schemaHash: "unread" }] })] })]
    });
    const advice = timingAdvice(a, b, "student-signs-in", "journey");
    expect(advice[0]).toBe("Control chart: student-signs-in: production has fewer than two runs, so no limits.");
    expect(advice[1]).toBe("Requests b makes here that a does not: POST {{origin}}/api/live/activity. Check these first: a request that is slow, or that the browser never reports finished, holds the page open.");
    expect(advice[2]).toMatch(/^No page's first byte moved by 50ms or more/);
    expect(advice[3]).toContain("--journey student-signs-in --runs 5");
    expect(advice).toHaveLength(5);
  });

  it("points at the server when a page's first byte moved", () => {
    const a = capture("a", { journeys: [journey({ journey: "j" })] });
    const b = capture("b", { journeys: [journey({ journey: "j", pages: [page({ timing: { ttfbMs: 400, responseEndMs: 420 } })] })] });
    expect(timingAdvice(a, b, "j", "journey")[1]).toBe("Pages whose first byte moved most: reader:course 40ms → 400ms. A slower first byte is the server; the rest is the browser.");
  });
});

describe("timingControl: b's runs against the XmR limits of production's", () => {
  const runs = (side: "a" | "b", ms: number[]) => capture(side, { journeys: ms.map((durationMs, i) => journey({ journey: "student-signs-in", run: i + 1, durationMs })) });

  it("calls runs inside production's limits common cause, and runs outside them a special cause to investigate", () => {
    const a = runs("a", [3400, 3500, 3450, 3380, 3435]);
    const inside = timingControl(a, runs("b", [3420, 3460, 3500, 3410, 3440]))!.journeys[0]!;
    expect(inside).toMatchObject({ above: 0, below: 0, limits: { n: 5, centre: 3433, provisional: true } });
    expect(controlLine(inside)).toMatch(/^student-signs-in: every run on b inside production's limits \d+–\d+ms \(centre 3433ms, provisional: 5 runs\): common cause$/);
    const slow = timingControl(a, runs("b", [8400, 8500, 3450, 8470, 8479]))!.journeys[0]!;
    expect(slow).toMatchObject({ above: 4, below: 0 });
    expect(controlLine(slow)).toMatch(/4 of 5 runs on b outside .*, 4 above: special cause, investigate$/);
  });

  it("says nothing for a live deployment, whose clock is not the stack's", () => {
    expect(timingControl({ ...runs("a", [1, 2]), external: true }, runs("b", [1, 2]))).toBeUndefined();
  });
});
