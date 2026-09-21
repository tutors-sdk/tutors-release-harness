import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { MasksFileSchema, loadMasks, normalise, DEFAULT_MASKS_FILE, type Mask } from "../src/normalise/masks.ts";
import type { ConsoleEntry, SideCapture, SideName } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

/**
 * `drop: true` on a console pattern mask. The engine's own test mask (this PR adds no entry to masks.yaml): a
 * warning whose COUNT depends on timers, which a rewrite cannot hide because the console engine compares each
 * page's messages as a set, and a message present on one side and absent on the other is a finding.
 */
const NOISE = "Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future.";
const dropNoise: Mask = MasksFileSchema.shape.masks.element.parse({
  id: "test-console-drop",
  artefact: "console",
  pattern: "^Realtime send\\(\\) is automatically falling back",
  drop: true,
  reason: "test-only mask: a timer-driven warning whose count differs between two sides of the same image"
});
const masks = { ...loadMasks(DEFAULT_MASKS_FILE), masks: [dropNoise] };

const warn = (text: string): ConsoleEntry => ({ level: "warning", text });
const noise = (n: number): ConsoleEntry[] => Array.from({ length: n }, () => warn(NOISE));
const WS = warn("WebSocket connection to 'ws://localhost:1/realtime/v1/websocket' failed: Error during WebSocket handshake: Unexpected response code: 404");

/** A course page and a topic page, with the given console entries on each. */
function side(name: SideName, course: ConsoleEntry[], topic: ConsoleEntry[]): SideCapture {
  return capture(name, {
    journeys: [
      journey({
        pages: [
          page({ pageKey: "reader-auth:course", path: "/course/x", console: course }),
          page({ pageKey: "reader-auth:topic", path: "/course/x/topic-1", console: topic })
        ]
      })
    ]
  });
}

function diff(a: SideCapture, b: SideCapture) {
  return compareCaptures(normalise(a, masks, "noise").capture, normalise(b, masks, "noise").capture, masks);
}

describe("console drop masks", () => {
  it("is accepted on console (and network) pattern masks, and refused elsewhere (schema)", () => {
    const ok = (artefact: string | string[], extra: object = { pattern: "x" }) =>
      MasksFileSchema.shape.masks.element.safeParse({ id: "m", artefact, drop: true, reason: "a reason of more than twenty characters", ...extra }).success;
    expect(ok("console")).toBe(true);
    expect(ok("network")).toBe(true);
    expect(ok(["network", "console"])).toBe(true);
    expect(ok("dom")).toBe(false);
    expect(ok("headers")).toBe(false);
    expect(ok(["console", "dom"])).toBe(false);
    expect(ok("console", { header: "x" })).toBe(false);
    expect(ok("logs", { key: "x" })).toBe(false);
  });

  it("A/A: identical consoles are clean, and the WebSocket message still counts", () => {
    expect(diff(side("a", [WS, ...noise(1)], [WS, ...noise(6)]), side("b", [WS, ...noise(1)], [WS, ...noise(6)]))).toEqual([]);
  });

  it("planted: a real new console error is still flagged when only the fallback warning is dropped", () => {
    const boom: ConsoleEntry = { level: "error", text: "TypeError: Cannot read properties of undefined (reading 'title')" };
    const hunks = diff(side("a", noise(2), noise(6)), side("b", noise(2), [...noise(5), boom]));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "console", severity: "fail", scope: "reader-auth:topic" });
    expect(hunks[0]!.detail).toContain("Cannot read properties of undefined");
    // a different warning that merely resembles the noise is not dropped either
    const near = warn("Realtime channel closed unexpectedly");
    expect(diff(side("a", [], []), side("b", [near], []))).toHaveLength(1);
    // and the WebSocket failure, when it appears on one side only, is a finding
    expect(diff(side("a", [], []), side("b", [WS], []))).toHaveLength(1);
  });

  it("must-not-flag: differing counts of the dropped message, on the same page or on different pages", () => {
    // same page: 6 on a, 2 on b (and 0 on one side against 2 on the other, which a set comparison would flag)
    expect(diff(side("a", [], noise(6)), side("b", [], noise(2)))).toEqual([]);
    expect(diff(side("a", [], []), side("b", [], noise(2)))).toEqual([]);
    expect(diff(side("a", noise(3), []), side("b", [], noise(3)))).toEqual([]);
    // different pages: side b settled one page earlier, so the count lands on the previous page
    expect(diff(side("a", [WS], [WS, ...noise(6)]), side("b", [WS, ...noise(2)], [WS, ...noise(5)]))).toEqual([]);
  });

  it("counts every dropped entry in the hits, on both sides, and reports silence as zero", () => {
    const a = normalise(side("a", [WS, ...noise(1)], noise(6)), masks, "noise");
    expect(a.hits["test-console-drop"]).toBe(7);
    expect(a.capture.journeys[0]!.pages.map((p) => p.console)).toEqual([[WS], []]);
    expect(normalise(side("b", [WS], []), masks, "noise").hits["test-console-drop"]).toBe(0);
  });

  it("is pure and honours modes", () => {
    const input = side("a", noise(2), []);
    const before = JSON.stringify(input);
    normalise(input, masks, "noise");
    expect(JSON.stringify(input)).toBe(before);
    const onlyRelease = { ...masks, masks: [{ ...dropNoise, modes: ["release" as const] }] };
    expect(normalise(input, onlyRelease, "noise").capture.journeys[0]!.pages[0]!.console).toHaveLength(2);
    expect(normalise(input, onlyRelease, "release").capture.journeys[0]!.pages[0]!.console).toHaveLength(0);
  });
});
