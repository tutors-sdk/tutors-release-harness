import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { SideCapture } from "../src/types.ts";
import { capture, journey } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);

describe("focus (keyboard order)", () => {
  it("identical orders produce nothing; a lost stop is a failing focus hunk with the diff", () => {
    expect(diff(capture("a"), capture("b"))).toEqual([]);
    const b = capture("b");
    b.journeys[0]!.pages[0]!.focus = ['a "Skip to content"', 'a "Topic 1"'];
    const hunks = diff(capture("a"), b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "focus", scope: "reader:course", severity: "fail" });
    expect(hunks[0]!.detail).toContain('-button "Open course tree"');
  });

  it("pages without a focus walk are ignored", () => {
    const a = capture("a");
    const b = capture("b");
    a.journeys[0]!.pages[0]!.focus = [];
    b.journeys[0]!.pages[0]!.focus = [];
    expect(diff(a, b)).toEqual([]);
  });
});

describe("persistence", () => {
  it("an anonymous journey that writes on b only is a failing hunk", () => {
    const b = capture("b");
    b.journeys[0]!.persistence = [{ kind: "write", method: "POST", table: "learning_records", rows: 1 }];
    const hunks = diff(capture("a"), b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "persistence", scope: "anonymous-student-reads-course/learning_records", severity: "fail" });
    expect(hunks[0]!.summary).toMatch(/anonymous journey wrote 1 row/);
  });

  it("an anonymous write on both sides is a product finding, reported but not gating", () => {
    const a = capture("a");
    const b = capture("b");
    a.journeys[0]!.persistence = [{ kind: "write", method: "POST", table: "learning_records", rows: 1 }];
    b.journeys[0]!.persistence = [{ kind: "write", method: "POST", table: "learning_records", rows: 1 }];
    const hunks = diff(a, b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "persistence", severity: "info" });
    expect(hunks[0]!.summary).toMatch(/product finding/);
  });

  it("signed-in journeys must agree row for row, by table and method", () => {
    const signed = (side: "a" | "b", rows: number) => capture(side, { journeys: [journey({ journey: "student-signs-in", anonymous: false, persistence: [{ kind: "write", method: "POST", table: "tutors-connect-users", rows }] })] });
    expect(diff(signed("a", 1), signed("b", 1))).toEqual([]);
    const hunks = diff(signed("a", 1), signed("b", 3));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "persistence", scope: "student-signs-in/tutors-connect-users", severity: "fail" });
    expect(hunks[0]!.summary).toContain("1 row(s) on a, 3 on b");
  });

  it("rpc calls are compared but never count as anonymous writes", () => {
    const b = capture("b");
    b.journeys[0]!.persistence = [{ kind: "rpc", method: "POST", table: "get_error_counts", rows: 0 }];
    const hunks = diff(capture("a"), b);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.summary).toContain("RPC get_error_counts");
  });
});

describe("load", () => {
  const withLoad = (side: "a" | "b", p95: number, samples: number[], failed = 0) =>
    capture(side, { load: { requests: samples.length, failed, serverErrors: 0, samples, p50: samples[Math.floor(samples.length / 2)]!, p95, rate: 20, duration: "20s" } });
  const spread = (centre: number) => Array.from({ length: 200 }, (_, i) => centre + (i % 20) - 10);

  it("a significant p95 regression under load fails", () => {
    const hunks = diff(withLoad("a", 60, spread(50)), withLoad("b", 120, spread(100)));
    expect(hunks.map((h) => [h.artefact, h.scope, h.severity])).toEqual([["timing", "load/http_req_duration", "fail"]]);
  });

  it("a k6 run that kept too few samples to ever reach alpha says so instead of passing quietly", () => {
    // 3 v 3 perfectly separated is p = 0.081 at best: no difference could be judged at alpha 0.05.
    const hunks = diff(withLoad("a", 60, [50, 51, 52]), withLoad("b", 120, [100, 101, 102]));
    expect(hunks.map((h) => [h.artefact, h.scope, h.severity])).toEqual([["timing", "load/http_req_duration", "info"]]);
    expect(hunks[0]!.summary).toContain("3/3 samples cannot reach alpha 0.05 (best possible p=0.081)");
  });

  it("a small shift within the noise floor is silent", () => {
    expect(diff(withLoad("a", 60, spread(50)), withLoad("b", 65, spread(52)))).toEqual([]);
  });

  it("a higher failure rate on b fails regardless of latency", () => {
    const hunks = diff(withLoad("a", 60, spread(50)), withLoad("b", 60, spread(50), 5));
    expect(hunks.map((h) => h.scope)).toEqual(["load/errors"]);
  });
});
