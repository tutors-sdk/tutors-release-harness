import { describe, expect, it } from "vitest";
import { timingAdvice } from "../src/compare/timing-advice.ts";
import { capture, journey, page } from "./support/captures.ts";

describe("timingAdvice: what to check when a journey is slower on b, read from the two captures", () => {
  it("names the requests only b makes, says where the time went, and how to confirm it", () => {
    const a = capture("a", { journeys: [journey({ journey: "student-signs-in" })] });
    const base = page();
    const b = capture("b", {
      journeys: [journey({ journey: "student-signs-in", pages: [page({ network: [...base.network, { method: "POST", url: "{{origin}}/api/live/activity?x=1", status: 202, contentType: "application/json", cacheControl: "", schemaHash: "unread" }] })] })]
    });
    const advice = timingAdvice(a, b, "student-signs-in", "journey");
    expect(advice[0]).toBe("Requests b makes here that a does not: POST {{origin}}/api/live/activity. Check these first: a request that is slow, or that the browser never reports finished, holds the page open.");
    expect(advice[1]).toMatch(/^No page's first byte moved by 50ms or more/);
    expect(advice[2]).toContain("--journey student-signs-in --runs 5");
    expect(advice).toHaveLength(4);
  });

  it("points at the server when a page's first byte moved", () => {
    const a = capture("a", { journeys: [journey({ journey: "j" })] });
    const b = capture("b", { journeys: [journey({ journey: "j", pages: [page({ timing: { ttfbMs: 400, responseEndMs: 420 } })] })] });
    expect(timingAdvice(a, b, "j", "journey")[0]).toBe("Pages whose first byte moved most: reader:course 40ms → 400ms. A slower first byte is the server; the rest is the browser.");
  });
});
