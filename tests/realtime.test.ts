/**
 * The reader's Supabase Realtime cost per page view (since 1.36.0): the collector's counting rules, and the informing
 * `realtime` engine's two rules (a reader page opened a websocket on b; b sends more Realtime messages per reader page
 * view than a), with the three tests every engine owes (docs/user-guide/09-extending.md).
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isBroadcast, isDataFrame, isRealtimeSocket, phoenixEvent } from "../src/collectors/realtime.ts";
import { compareCaptures } from "../src/compare/index.ts";
import { ENGINE_LEVELS } from "../src/compare/levels.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { PageCapture, RealtimeCost, SideCapture, SideName } from "../src/types.ts";
import { capture, clone, journey, page } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks).filter((h) => h.artefact === "realtime");

const rt = (broadcasts: number, sockets = 0, framesSent = 0): RealtimeCost => ({ broadcasts, sockets, framesSent });
const broadcastEntry = { method: "POST", url: "{{origin}}/realtime/v1/api/broadcast", status: 202, contentType: "", cacheControl: "", schemaHash: "" };
const authPage = (pageKey: string, realtime: RealtimeCost | undefined, o: Partial<PageCapture> = {}) => {
  const p = page({ pageKey, path: `/${pageKey.split(":")[1]}/localhost:8080`, axe: [], focus: [], network: [broadcastEntry], ...o });
  if (realtime) p.realtime = realtime;
  else delete p.realtime;
  return p;
};
/** The signed-in journey: three reader pages, each recording one page view over HTTP (publish-only), and Tutors Live. */
const signedIn = (side: SideName, costs: (RealtimeCost | undefined)[] = [rt(1), rt(1), rt(1)], live: RealtimeCost = rt(0, 1, 2)) =>
  capture(side, {
    journeys: [
      journey({
        journey: "student-signs-in",
        anonymous: false,
        pages: [authPage("reader-auth:sign-in", costs[0]), authPage("reader-auth:course", costs[1]), authPage("reader-auth:topic", costs[2]), authPage("live:home", live)]
      })
    ]
  });

describe("the collector's counting rules", () => {
  it("counts a POST to the broadcast endpoint, and a socket to the Realtime websocket, by path", () => {
    expect(isBroadcast("POST", "http://persistence-a.harness.test:8090/realtime/v1/api/broadcast")).toBe(true);
    expect(isBroadcast("post", "https://x.supabase.co/realtime/v1/api/broadcast?apikey=k")).toBe(true);
    expect(isBroadcast("GET", "https://x.supabase.co/realtime/v1/api/broadcast")).toBe(false);
    expect(isBroadcast("POST", "https://x.supabase.co/rest/v1/tutors-connect-latest?note=/realtime/v1/api/broadcast")).toBe(false);
    expect(isRealtimeSocket("wss://x.supabase.co/realtime/v1/websocket?apikey=k&vsn=2.0.0")).toBe(true);
    expect(isRealtimeSocket("ws://localhost:5173/_app/hmr")).toBe(false);
  });

  it("a data frame is any frame but Phoenix's upkeep (join, leave, heartbeat, access token), in either protocol", () => {
    expect(isDataFrame('["1","1","realtime:course-1","phx_join",{"config":{}}]')).toBe(false);
    expect(isDataFrame('[null,"2","phoenix","heartbeat",{}]')).toBe(false);
    expect(isDataFrame('["1","3","realtime:course-1","access_token",{"access_token":"x"}]')).toBe(false);
    expect(isDataFrame('{"topic":"realtime:course-1","event":"phx_leave","payload":{},"ref":"4"}')).toBe(false);
    expect(isDataFrame('["1","5","realtime:course-1","broadcast",{"type":"broadcast","event":"lo-event","payload":{}}]')).toBe(true);
    expect(isDataFrame('{"topic":"realtime:course-1","event":"presence","payload":{},"ref":"6"}')).toBe(true);
    expect(isDataFrame(Buffer.from([3, 1, 2, 3]))).toBe(true);
    expect(isDataFrame("not json")).toBe(true);
    expect(phoenixEvent('[null,"2","phoenix","heartbeat",{}]')).toBe("heartbeat");
  });
});

describe("realtime", () => {
  it("is informing, with no date", () => {
    expect(ENGINE_LEVELS.realtime).toEqual({ level: "informing" });
  });

  it("A/A: identical publish-only captures, Realtime counts and all, produce nothing", () => {
    const a = signedIn("a", [rt(1), rt(1, 0, 1), rt(2)]);
    expect(diff(a, Object.assign(clone(a), { side: "b" }))).toEqual([]);
  });

  it("the counts survive normalisation: the persistence-stub-requests mask drops /realtime/v1/ from network, not from realtime", () => {
    const n = normalise(signedIn("a"), masks);
    const course = n.capture.journeys[0]!.pages[1]!;
    expect(course.network).toEqual([]);
    expect(course.realtime).toEqual(rt(1));
    expect(n.hits["persistence-stub-requests"]).toBeGreaterThan(0);
  });

  it("planted: a reader page opening a Realtime websocket on b is a finding, new on b or production too", () => {
    const hunks = diff(signedIn("a"), signedIn("b", [rt(1), rt(0, 1, 1), rt(0, 0, 1)]));
    const socket = hunks.find((h) => h.scope === "reader-auth:course/websocket");
    expect(socket).toMatchObject({ artefact: "realtime", severity: "fail", path: "/course/localhost:8080" });
    expect(socket!.summary).toBe("reader-auth:course: a reader page opened a Realtime websocket on b (1 socket(s), 1 data frame(s) sent); readers must be publish-only (new on b)");
    const both = diff(signedIn("a", [rt(1), rt(0, 1, 1), rt(1)]), signedIn("b", [rt(1), rt(0, 1, 1), rt(1)]));
    expect(both).toEqual([expect.objectContaining({ scope: "reader-auth:course/websocket", severity: "fail" })]);
    expect(both[0]!.summary).toMatch(/\(production too\)$/);
  });

  it("planted: more Realtime messages per reader page view on b is a regression, a N / b M per reader page", () => {
    // The 13 Oct 2026 shape: each page view also sent over a joined channel, and a presence frame besides.
    const hunks = diff(signedIn("a"), signedIn("b", [rt(1, 1, 2), rt(1, 0, 2), rt(1, 0, 2)]));
    const rate = hunks.find((h) => h.scope === "reader-auth/messages");
    expect(rate).toMatchObject({ artefact: "realtime", severity: "fail" });
    expect(rate!.summary).toBe("reader-auth: Realtime messages per reader page view rose: a 1 / b 3 per reader page (broadcasts a 3 / b 3, socket data frames a 0 / b 6, over 3 page view(s))");
    expect(hunks.map((h) => h.scope).sort()).toEqual(["reader-auth/messages", "reader-auth:sign-in/websocket"]);
  });

  it("through a run: reported as informing, never gates", () => {
    const report = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-realtime-")), a: signedIn("a"), b: signedIn("b", [rt(1), rt(1, 1, 1), rt(1)]), claims: [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-13T09:00:00.000Z", runs: 1, ranAt: new Date("2026-10-13T09:00:00Z"), log: () => {} }).report;
    expect(report.compare.unclaimed).toEqual([]);
    expect(report.compare.hunks.filter((h) => h.artefact === "realtime")).toEqual([
      expect.objectContaining({ scope: "reader-auth:course/websocket", severity: "info", level: "informing" }),
      expect.objectContaining({ scope: "reader-auth/messages", severity: "info", level: "informing" })
    ]);
    expect(report.levels?.realtime).toEqual({ level: "informing" });
    expect(report.verdict).not.toBe("fail");
  });

  it("not flagged: Tutors Live opening a socket, a message landing in the next page's window, or publish-only replacing a joined channel", () => {
    // Live is a subscriber by design: a socket and more frames there on b are not the reader's cost.
    expect(diff(signedIn("a", undefined, rt(0, 0, 0)), signedIn("b", undefined, rt(0, 3, 9)))).toEqual([]);
    // The same three page views, one broadcast captured a page late on b: the same messages per page view.
    expect(diff(signedIn("a", [rt(1), rt(1), rt(1)]), signedIn("b", [rt(0), rt(2), rt(1)]))).toEqual([]);
    // Production joined the course channel and sent each view over it; main publishes over HTTP only. Fewer is information.
    const fell = diff(signedIn("a", [rt(1, 1, 2), rt(1, 0, 1), rt(1, 0, 1)]), signedIn("b", [rt(1), rt(1), rt(1)]));
    expect(fell).toEqual([expect.objectContaining({ scope: "reader-auth/messages", severity: "info" })]);
    expect(fell[0]!.summary).toContain("fell: a 2.33 / b 1 per reader page");
  });

  it("a capture recorded before 1.36.0 is not judged; one side without counts is one info hunk", () => {
    const old = signedIn("a", [undefined, undefined, undefined], undefined);
    for (const p of old.journeys[0]!.pages) delete p.realtime;
    expect(diff(old, Object.assign(clone(old), { side: "b" }))).toEqual([]);
    const hunks = diff(old, signedIn("b", [rt(1), rt(0, 1, 1), rt(1)]));
    expect(hunks.map((h) => [h.scope, h.severity])).toEqual([
      ["collection", "info"],
      ["reader-auth:course/websocket", "fail"]
    ]);
    expect(hunks[1]!.summary).not.toMatch(/\((new on b|production too)\)$/);
  });
});
