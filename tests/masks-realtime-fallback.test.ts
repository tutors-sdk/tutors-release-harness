import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { ConsoleEntry, SideCapture, SideName } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const ID = "realtime-rest-fallback-warning";

const FALLBACK =
  "Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.";
const warn = (text: string): ConsoleEntry => ({ level: "warning", text });
const fallback = (n: number): ConsoleEntry[] => Array.from({ length: n }, () => warn(FALLBACK));
const WS = warn("WebSocket connection to 'ws://localhost:1/realtime/v1/websocket?apikey=k' failed: Error during WebSocket handshake: Unexpected response code: 404");

/** The signed-in reader's course page and the topic page after it, with the given console entries on each. */
function side(name: SideName, course: ConsoleEntry[], topic: ConsoleEntry[]): SideCapture {
  return capture(name, {
    journeys: [
      journey({
        journey: "reader-auth",
        anonymous: false,
        pages: [
          page({ pageKey: "reader-auth:course", path: "/course/x", console: course }),
          page({ pageKey: "reader-auth:topic", path: "/course/x/topic-1", console: topic })
        ]
      })
    ]
  });
}

function diff(a: SideCapture, b: SideCapture, mode: "noise" | "release" | "post-deploy" = "noise") {
  return compareCaptures(normalise(a, masks, mode).capture, normalise(b, masks, mode).capture, masks);
}

describe("realtime-rest-fallback-warning mask", () => {
  it("is narrow: console only, a drop anchored on the warning's opening words, every mode, with a reason", () => {
    const m = masks.masks.find((x) => x.id === ID)!;
    expect(m.artefact).toEqual(["console"]);
    expect(m.drop).toBe(true);
    expect(m.modes).toBeUndefined();
    expect(m.pattern!.startsWith("^Realtime send")).toBe(true);
    expect(m.reason.length).toBeGreaterThanOrEqual(200);
    expect(m.reason).toContain("WebSocket");
    expect(new RegExp(m.pattern!).test(FALLBACK)).toBe(true);
    expect(new RegExp(m.pattern!).test(`prefix ${FALLBACK}`)).toBe(false);
  });

  it("A/A: the counts and pages the failing CI run showed are clean (a: 0+6, b: 2+5), in every mode", () => {
    const a = side("a", [WS], [WS, ...fallback(6)]);
    const b = side("b", [WS, ...fallback(2)], [WS, ...fallback(5)]);
    for (const mode of ["noise", "release", "post-deploy"] as const) expect(diff(a, b, mode)).toEqual([]);
    expect(diff(b, a)).toEqual([]);
  });

  it("A/A: the mask reports how many entries it dropped, on both sides", () => {
    const { hits } = normalise(side("a", [WS], [WS, ...fallback(6)]), masks, "noise");
    expect(hits[ID]).toBe(6);
    expect(normalise(side("b", [WS], [WS]), masks, "noise").hits[ID]).toBe(0);
  });

  it("planted: a different console warning or error is still flagged", () => {
    const boom: ConsoleEntry = { level: "error", text: "TypeError: Cannot read properties of undefined (reading 'title')" };
    const hunks = diff(side("a", [WS], [WS, ...fallback(6)]), side("b", [WS], [WS, ...fallback(5), boom]));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "console", severity: "fail", scope: "reader-auth:topic" });
    expect(hunks[0]!.detail).toContain("Cannot read properties of undefined");
    // a different Realtime warning is not swallowed by the anchored pattern
    const other = warn("Realtime channel closed unexpectedly, reconnecting");
    expect(diff(side("a", [WS], [WS]), side("b", [WS, other], [WS]))).toHaveLength(1);
    // the same words mid-message are a different message
    expect(diff(side("a", [WS], [WS]), side("b", [WS], [WS, warn(`retry: ${FALLBACK}`)]))).toHaveLength(1);
  });

  it("must still count: the WebSocket-failed message is not masked", () => {
    expect(diff(side("a", [WS], [WS]), side("b", [], [WS]))).toHaveLength(1);
    expect(diff(side("a", [], [WS]), side("b", [WS], [WS]))).toHaveLength(1);
    expect(normalise(side("a", [WS], [WS]), masks, "noise").capture.journeys[0]!.pages[0]!.console).toEqual([WS]);
  });
});
