/**
 * In-run noise (since 1.24.0, `--a2`): side a2, a second copy of side a started in the same run, captured once for the
 * deterministic artefacts. Its differences from a are reported beside the nightly A/A, with the a/b differences that
 * share an artefact and scope with one of them; none of it is ever read by the verdict, the Gate or the exit code.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { A2_ARTEFACTS, a2Hunks, inRunNoise } from "../src/compare/in-run-noise.ts";
import { planGate } from "../src/local/tasks.ts";
import { DEFAULT_PORTS } from "../src/local/ports.ts";
import { DEFAULT_MASKS_FILE, loadMasks } from "../src/normalise/masks.ts";
import { exitCodeForReport } from "../src/override.ts";
import { renderHtml } from "../src/report/html.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { compareFromCaptures, loadA2Capture } from "../src/run.ts";
import { a2Spec, sideSpec } from "../src/stack.ts";
import type { Hunk, SideCapture } from "../src/types.ts";
import { capture, clone, page } from "./support/captures.ts";

const AT = new Date("2026-10-01T09:00:00Z");
const masks = loadMasks(DEFAULT_MASKS_FILE);

/** Side a2: side a again (side "a", a's images), as `harness run --a2` captures it. */
const a2Of = (a: SideCapture, change?: (c: SideCapture) => void): SideCapture => {
  const c = clone(a);
  change?.(c);
  return c;
};
const dropHeader = (c: SideCapture) => {
  delete c.journeys[0]!.pages[0]!.headers["x-frame-options"];
};

describe("a against a2: the deterministic artefacts, once", () => {
  it("two copies of the same capture have no differences", () => {
    expect(a2Hunks(capture("a"), a2Of(capture("a")), masks)).toEqual([]);
  });

  it("a difference on a2 is reported as one, worded for a2", () => {
    const got = a2Hunks(capture("a"), a2Of(capture("a"), dropHeader), masks);
    expect(got).toEqual([expect.objectContaining({ artefact: "headers", scope: "reader:course/x-frame-options", severity: "fail", summary: "reader:course: header dropped on a2: x-frame-options (was SAMEORIGIN)" })]);
  });

  it("only what a gate would read, and only the deterministic artefacts: timing, metrics and logs are left to the A/A", () => {
    const a2 = a2Of(capture("a"), (c) => {
      c.journeys[0]!.pages[0]!.axe = []; // a violation gone on a2: information, not a difference a gate reads
      c.journeys[0]!.pages[0]!.timing = { ttfbMs: 4000, responseEndMs: 6000 };
      c.metrics.after = {};
      c.logs = {};
    });
    expect(a2Hunks(capture("a"), a2, masks)).toEqual([]);
    expect([...A2_ARTEFACTS]).toEqual(["dom", "network", "console", "headers", "axe", "focus"]);
  });

  it("a page a2 did not reach (a signed-in journey: a2 has no signed-in reader) is not a difference", () => {
    const a = capture("a", { journeys: [capture("a").journeys[0]!, { ...capture("a").journeys[0]!, journey: "signed-in-student", anonymous: false, pages: [page({ pageKey: "reader:signed-in" })] }] });
    const a2 = a2Of(capture("a"));
    expect(a2Hunks(a, a2, masks)).toEqual([]);
    expect(inRunNoise(a2, [], []).journeys).toEqual(["anonymous-student-reads-course"]);
  });

  it("an a/b difference is noise by measurement when a/a2 has the same artefact and scope, whatever the ids", () => {
    const aToA2 = a2Hunks(capture("a"), a2Of(capture("a"), dropHeader), masks);
    const aToB: Hunk[] = [
      { id: "headers:reader:course:7", artefact: "headers", scope: "reader:course/x-frame-options", severity: "fail", summary: "dropped on b" },
      { id: "headers:reader:course:8", artefact: "headers", scope: "reader:course/x-content-type-options", severity: "fail", summary: "dropped on b" },
      { id: "dom:reader:course:9", artefact: "dom", scope: "reader:course/x-frame-options", severity: "fail", summary: "another artefact" }
    ];
    const n = inRunNoise(capture("a"), aToA2, aToB);
    expect(n).toMatchObject({ stack: "a2", runs: 1, hunks: [{ artefact: "headers", scope: "reader:course/x-frame-options" }], alsoOnB: ["headers:reader:course:7"] });
  });
});

describe("the run: reported beside the A/A, never judged", () => {
  const run = (a2?: SideCapture, b = capture("b")) =>
    compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-a2-")), a: capture("a"), b, ...(a2 ? { a2 } : {}), claims: [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, ranAt: AT, log: () => {} }).report;

  it("with the same difference on b and on a2, the verdict, Gate, exit code and every hunk are what they are without a2", () => {
    const b = clone(capture("b"));
    dropHeader(b);
    const without = run(undefined, b);
    const withA2 = run(a2Of(capture("a"), dropHeader), b);
    expect(without.verdict).toBe("fail");
    expect(withA2.verdict).toBe(without.verdict);
    expect(withA2.reasons).toEqual(without.reasons);
    expect(withA2.compare).toEqual(without.compare);
    expect(exitCodeForReport(withA2)).toBe(exitCodeForReport(without));
    expect(without.inRunNoise).toBeUndefined();
    expect(withA2.inRunNoise).toMatchObject({ hunks: [{ artefact: "headers" }], alsoOnB: [without.compare.unclaimed[0]!.id] });
  });

  it("a clean pass stays a clean pass however noisy a2 is", () => {
    const r = run(a2Of(capture("a"), (c) => (c.journeys[0]!.pages[0]!.focus = [])));
    expect(r.verdict).toBe("pass");
    expect(r.inRunNoise!.hunks).toEqual([expect.objectContaining({ artefact: "focus" })]);
    expect(r.inRunNoise!.alsoOnB).toEqual([]);
  });

  it("the report says it beside the A/A line, in HTML and Markdown; a run without a2 says nothing of it", () => {
    const b = clone(capture("b"));
    dropHeader(b);
    const r = run(a2Of(capture("a"), dropHeader), b);
    const html = renderHtml(r);
    expect(html).toContain(`<li id="in-run-noise">In-run A/A (a to a2, 1 run, dom, network, console, headers, axe, focus; 1 journey(s)): 1 difference(s); 1 of this run's 1 a/b difference(s) also seen a to a2 (noise by measurement). Reported, never gates.`);
    expect(html).toContain("<summary>the differences a to a2</summary>");
    expect(renderMarkdown(r)).toContain("- In-run A/A (a to a2, 1 run,");
    const clean = run(a2Of(capture("a")));
    expect(renderHtml(clean)).toContain("1 journey(s)): clean. Reported, never gates.");
    expect(renderHtml(run())).not.toContain("in-run-noise");
    expect(renderMarkdown(run())).not.toContain("In-run A/A");
  });

  it("harness compare reads a2/capture.json when the run kept one", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-a2-dir-"));
    expect(loadA2Capture(dir)).toBeUndefined();
    mkdirSync(join(dir, "a2"));
    writeFileSync(join(dir, "a2", "capture.json"), JSON.stringify(capture("a")));
    expect(loadA2Capture(dir)).toEqual(capture("a"));
  });
});

describe("side a2 is side a's images on four more ports, with no signed-in reader", () => {
  it("a2Spec", () => {
    const a = sideSpec("a", { reader: "r:1", catalogue: "c:1", live: "l:1", time: "t:1" });
    const a2 = a2Spec(a);
    expect(a2).toMatchObject({ name: "a", dir: "a2", images: a.images, urls: { reader: "http://localhost:3400", catalogue: "http://localhost:3401", live: "http://localhost:3402", time: "http://localhost:3404" } });
    expect(a2.urls.readerAuth).toBeUndefined();
    expect(a2.urls.persistence).toBeUndefined();
    expect(Object.entries(DEFAULT_PORTS).filter(([k]) => k.endsWith("_A2"))).toEqual([["READER_PORT_A2", 3400], ["CATALOGUE_PORT_A2", 3401], ["LIVE_PORT_A2", 3402], ["TIME_PORT_A2", 3404]]);
  });

  it("harness local gate --a2 plans the release run with --a2, and without it plans none", () => {
    const step = (a2: boolean) => planGate({ production: "16.2.2", candidate: "main", only: "release", ...(a2 ? { a2 } : {}) }).steps.find((s) => s.id === "release")!.argv;
    expect(step(true)).toContain("--a2");
    expect(step(false)).not.toContain("--a2");
  });
});
