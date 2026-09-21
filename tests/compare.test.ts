import { describe, expect, it } from "vitest";
import { compareCaptures, mannWhitney } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { SideCapture } from "../src/types.ts";
import { capture, clone, journey, page } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);

function diff(a: SideCapture, b: SideCapture) {
  return compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
}

describe("A/A", () => {
  it("two identical captures produce no hunks at all", () => {
    expect(diff(capture("a"), capture("b"))).toEqual([]);
  });

  it("differences only in masked fields produce no hunks", () => {
    const b = capture("b");
    b.journeys[0]!.pages[0]!.headers.date = "Thu, 17 Sep 2026 10:00:00 GMT";
    b.journeys[0]!.pages[0]!.headers["x-request-id"] = "zzz";
    b.metrics.after.reader!.series.process_cpu_seconds_total = 99;
    expect(diff(capture("a"), b)).toEqual([]);
  });
});

describe("engines catch one planted change each", () => {
  it("dom: a changed accessible tree is a dom hunk on that page", () => {
    const b = capture("b");
    b.journeys[0]!.pages[0]!.aria += '\n  - note "planted"';
    const hunks = diff(capture("a"), b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "dom", scope: "reader:course", path: "/course/localhost:8080", severity: "fail" });
    expect(hunks[0]!.detail).toContain('+  - note "planted"');
  });

  it("headers: a dropped security header is a headers hunk scoped to page/header", () => {
    const b = capture("b");
    delete b.journeys[0]!.pages[0]!.headers["x-content-type-options"];
    const hunks = diff(capture("a"), b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "headers", scope: "reader:course/x-content-type-options", severity: "fail" });
    expect(hunks[0]!.summary).toContain("dropped");
  });

  it("network: a status change and a new request are separate hunks", () => {
    const b = capture("b");
    b.journeys[0]!.pages[0]!.network[0]!.status = 500;
    b.journeys[0]!.pages[0]!.network.push({ method: "GET", url: "{{origin}}/api/presence", status: 200, contentType: "application/json", cacheControl: "", schemaHash: "x" });
    const hunks = diff(capture("a"), b);
    expect(hunks.map((h) => h.artefact)).toEqual(["network", "network"]);
    expect(hunks.map((h) => h.scope).sort()).toEqual(["GET /api/presence", "GET /course/localhost:8080"]);
    expect(hunks.find((h) => h.scope === "GET /course/localhost:8080")!.summary).toContain("200 → 500");
  });

  it("network: a changed response schema is a hunk even when status and type match", () => {
    const b = capture("b");
    b.journeys[0]!.pages[0]!.network[1]!.schemaHash = "cafebabe";
    const hunks = diff(capture("a"), b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.summary).toContain("response schema");
  });

  it("network: a body one side never got to read is not a schema change, but status and content type are still compared", () => {
    const b = capture("b");
    const entry = b.journeys[0]!.pages[0]!.network[1]!;
    const a = capture("a");
    a.journeys[0]!.pages[0]!.network[1]!.schemaHash = "unread"; // the page navigated away while this request was in flight on a
    expect(diff(a, b)).toEqual([]);
    expect(diff(b, a)).toEqual([]);
    entry.status = 500;
    expect(diff(a, b).map((h) => h.summary).join(" ")).toContain("status changed");
  });

  it("console: a new error on b fails, an error gone on b is informational", () => {
    const a = capture("a");
    a.journeys[0]!.pages[0]!.console.push({ level: "warning", text: "old warning" });
    const b = capture("b");
    b.journeys[0]!.pages[0]!.console.push({ level: "error", text: "planted" });
    const hunks = diff(a, b);
    expect(hunks.map((h) => [h.artefact, h.severity])).toEqual([
      ["console", "fail"],
      ["console", "info"]
    ]);
  });

  it("axe: a new violation fails, a fixed one is informational", () => {
    const b = capture("b");
    b.journeys[0]!.pages[0]!.axe = [{ rule: "image-alt", impact: "critical", target: "img" }];
    const hunks = diff(capture("a"), b);
    expect(hunks.map((h) => [h.artefact, h.severity, h.summary.includes("image-alt")])).toEqual([
      ["axe", "fail", true],
      ["axe", "info", false]
    ]);
  });

  it("metrics: a missing series and a delta out of band are hunks", () => {
    const b = capture("b");
    delete b.metrics.after.reader!.series.tutors_course_loads_total;
    b.metrics.after.reader!.series.http_requests_total = 60; // delta 50 vs 12
    const hunks = diff(capture("a"), b);
    expect(hunks.map((h) => h.scope).sort()).toEqual(["reader/http_requests_total", "reader/tutors_course_loads_total"]);
  });

  it("metrics: small delta differences within tolerance are not hunks", () => {
    const b = capture("b");
    b.metrics.after.reader!.series.http_requests_total = 23; // delta 13 vs 12
    expect(diff(capture("a"), b)).toEqual([]);
  });

  it("logs: a lost field and a request-id propagation drop are hunks", () => {
    const b = capture("b");
    b.logs.reader!.keys = ["level", "message", "time"];
    b.logs.reader!.requestIdRatio = 0.5;
    const hunks = diff(capture("a"), b);
    expect(hunks.map((h) => h.scope)).toEqual(["reader/requestId", "reader/request-id"]);
  });

  it("journey outcome: a journey that fails only on b is a failing hunk", () => {
    const b = capture("b");
    b.journeys[0]!.error = "Timeout waiting for heading";
    b.journeys[0]!.pages = [];
    const hunks = diff(capture("a"), b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "dom", scope: "anonymous-student-reads-course", severity: "fail" });
  });
});

describe("timing", () => {
  const withRuns = (side: "a" | "b", ttfbs: number[], durations: number[]) =>
    capture(side, { journeys: ttfbs.map((ttfb, i) => journey({ run: i + 1, durationMs: durations[i]!, pages: [page({ timing: { ttfbMs: ttfb, responseEndMs: ttfb + 20 } })] })) });

  it("with one run, a big shift is informational only", () => {
    const hunks = diff(withRuns("a", [40], [4000]), withRuns("b", [80], [6000]));
    expect(hunks.every((h) => h.artefact === "timing" && h.severity === "info")).toBe(true);
    expect(hunks.length).toBeGreaterThan(0);
  });

  it("with five runs, a consistent 30%+ regression fails", () => {
    const hunks = diff(withRuns("a", [40, 42, 41, 43, 40], [4000, 4100, 4050, 4020, 4080]), withRuns("b", [70, 72, 69, 71, 73], [5600, 5700, 5650, 5620, 5710]));
    const fails = hunks.filter((h) => h.severity === "fail");
    expect(fails.map((h) => h.scope).sort()).toEqual(["anonymous-student-reads-course", "reader:course"]);
    expect(fails[0]!.summary).toContain("p=0.012, n=5/5)");
  });

  it("with three runs a perfectly separated regression cannot reach alpha, and the engine says so instead of passing quietly", () => {
    // 3 v 3 perfectly separated: p = 0.081 at best (stats.test.ts), so never below alpha 0.05, whatever the shift.
    const hunks = diff(withRuns("a", [40, 42, 41], [4000, 4100, 4050]), withRuns("b", [70, 72, 69], [5600, 5700, 5650]));
    expect(hunks.filter((h) => h.severity === "fail")).toEqual([]);
    expect(hunks.map((h) => [h.artefact, h.scope, h.severity]).sort()).toEqual([
      ["timing", "anonymous-student-reads-course", "info"],
      ["timing", "reader:course", "info"]
    ]);
    for (const h of hunks) {
      expect(h.summary).toContain("3/3 samples cannot reach alpha 0.05 (best possible p=0.081). Raise --runs");
    }
  });

  it("four runs is the least that can reach alpha 0.05 (p = 0.030 when perfectly separated)", () => {
    const hunks = diff(withRuns("a", [40, 42, 41, 43], [4000, 4100, 4050, 4020]), withRuns("b", [70, 72, 69, 71], [5600, 5700, 5650, 5620]));
    expect(hunks.filter((h) => h.severity === "fail")).toHaveLength(2);
  });

  it("with five runs and overlapping samples, nothing fails", () => {
    const hunks = diff(withRuns("a", [40, 60, 45, 52, 41], [4000, 4600, 4200, 4300, 4050]), withRuns("b", [44, 58, 50, 47, 62], [4100, 4500, 4300, 4250, 4650]));
    expect(hunks.filter((h) => h.severity === "fail")).toEqual([]);
  });

  it("a large relative shift of a few milliseconds is not reported", () => {
    expect(diff(withRuns("a", [3, 3, 3], [4000, 4000, 4000]), withRuns("b", [5, 5, 5], [4000, 4000, 4000]))).toEqual([]);
  });

  it("client-side navigations (ttfb -1) are ignored", () => {
    const hunks = diff(withRuns("a", [-1, -1, -1], [4000, 4100, 4050]), withRuns("b", [-1, -1, -1], [4000, 4100, 4050]));
    expect(hunks).toEqual([]);
  });

  it("mann-whitney: separated samples are significant, mixed samples are not", () => {
    expect(mannWhitney([1, 2, 3, 4, 5], [10, 11, 12, 13, 14]).p).toBeLessThan(0.05);
    expect(mannWhitney([1, 5, 3, 7, 9], [2, 6, 4, 8, 10]).p).toBeGreaterThan(0.05);
  });
});

describe("external sides", () => {
  it("latency is not compared between a harness stack and a live deployment", () => {
    const a = capture("a");
    const b = capture("b", { external: true });
    b.journeys[0]!.pages[0]!.timing = { ttfbMs: 400, responseEndMs: 420 };
    b.journeys[0]!.durationMs = 9000;
    expect(diff(a, b)).toEqual([]);
  });
});

describe("determinism", () => {
  it("the same inputs give the same hunks in the same order", () => {
    const a = capture("a");
    const b = capture("b");
    b.journeys[0]!.pages[0]!.aria += "\n  - note";
    delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
    expect(diff(clone(a), clone(b))).toEqual(diff(clone(a), clone(b)));
  });
});
