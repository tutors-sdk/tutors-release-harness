import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, MasksFileSchema, loadMasks, normalise, type Mask } from "../src/normalise/masks.ts";
import type { NetworkEntry, SideCapture, SideName } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

/**
 * `status: [...]` on a network pattern mask (since 1.28.1). The engine's own test mask: this PR adds no entry to
 * masks.yaml. The noise it exists for: a media file the browser fetches whole (200) on one side and by range (206)
 * on the other, on the same URL, from the same image.
 */
const parseMask = (m: object): Mask => MasksFileSchema.shape.masks.element.parse(m);
const mediaStatus = parseMask({
  id: "test-media-status",
  artefact: "network",
  pattern: "\\.mov$",
  status: [206, 200],
  reason: "test-only mask: a media file answered whole on one side and by range on the other"
});
const masks = { ...loadMasks(DEFAULT_MASKS_FILE), masks: [mediaStatus] };

const URL = "{{course}}/topic-07-reference/note-1/img/video.mov";
const DOC: NetworkEntry = { method: "GET", url: "{{origin}}/note/x/topic-07-reference/note-1", status: 200, contentType: "text/html", cacheControl: "", schemaHash: "" };
const video = (status: number, contentType = "video/quicktime"): NetworkEntry => ({ method: "GET", url: URL, status, contentType, cacheControl: "", schemaHash: "" });

function side(name: SideName, network: NetworkEntry[]): SideCapture {
  return capture(name, { journeys: [journey({ journey: "reference", pages: [page({ pageKey: "reference:note", path: "/note/x/topic-07-reference/note-1", network })] })] });
}

function diff(a: SideCapture, b: SideCapture, m = masks) {
  return compareCaptures(normalise(a, m, "noise").capture, normalise(b, m, "noise").capture, m);
}

describe("network status masks", () => {
  it("is accepted on network pattern masks only, with two or more different statuses (schema)", () => {
    const ok = (extra: object) => MasksFileSchema.shape.masks.element.safeParse({ id: "m", artefact: "network", pattern: "x", status: [206, 200], reason: "a reason of more than twenty characters", ...extra }).success;
    expect(ok({})).toBe(true);
    expect(ok({ artefact: ["network"] })).toBe(true);
    expect(ok({ artefact: "console" })).toBe(false);
    expect(ok({ artefact: ["network", "headers"] })).toBe(false);
    expect(ok({ pattern: undefined })).toBe(false);
    expect(ok({ drop: true })).toBe(false);
    expect(ok({ replace: "y" })).toBe(false);
    expect(ok({ pattern: undefined, header: "cache-control" })).toBe(false);
    expect(ok({ pattern: "x", header: "cache-control" })).toBe(false);
    expect(ok({ status: [206] })).toBe(false);
    expect(ok({ status: [206, 206] })).toBe(false);
    expect(ok({ status: [206, 99] })).toBe(false);
    expect(ok({ status: [206, 200.5] })).toBe(false);
  });

  it("without the mask, the 2026-10-03 A/A difference shows: status changed 200 -> 206", () => {
    const none = { ...masks, masks: [] };
    const hunks = diff(side("a", [DOC, video(200)]), side("b", [DOC, video(206)]), none);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.summary).toContain("video.mov status changed: 200 → 206");
  });

  it("must-not-flag: 200 against 206 on the same URL, either way round, and several range requests", () => {
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC, video(206)]))).toEqual([]);
    expect(diff(side("a", [DOC, video(206)]), side("b", [DOC, video(200)]))).toEqual([]);
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC, video(206), video(206), video(206)]))).toEqual([]);
  });

  it("planted: a status outside the list still shows, on the masked URL", () => {
    for (const bad of [404, 500, 416, 304]) {
      const hunks = diff(side("a", [DOC, video(206)]), side("b", [DOC, video(bad)]));
      expect(hunks, String(bad)).toHaveLength(1);
      expect(hunks[0]).toMatchObject({ artefact: "network", severity: "fail" });
      expect(hunks[0]!.summary).toContain(`status changed: 206 → ${bad}`);
    }
    // from 200 too: the side that answered 200 is recorded as 206, so the change reads from 206
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC, video(404)]))[0]!.summary).toContain("status changed: 206 → 404");
  });

  it("planted: the request gone, a new one, a changed type, and a 200/206 on another URL all still show", () => {
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC]))[0]!.summary).toContain("request no longer made on b");
    expect(diff(side("a", [DOC]), side("b", [DOC, video(206)]))[0]!.summary).toContain("new request on b");
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC, video(206, "text/html")]))[0]!.summary).toContain("content-type changed");
    const mp4 = (status: number): NetworkEntry => ({ ...video(status), url: "{{course}}/x/clip.mp4", contentType: "video/mp4" });
    expect(diff(side("a", [DOC, mp4(200)]), side("b", [DOC, mp4(206)]))).toHaveLength(1);
    // the document itself is not touched
    expect(diff(side("a", [{ ...DOC, status: 200 }]), side("b", [{ ...DOC, status: 206 }]))).toHaveLength(1);
  });

  it("records the first listed status, keeps the URL, counts every match on both sides, and is pure", () => {
    const input = side("a", [DOC, video(200), video(206)]);
    const before = JSON.stringify(input);
    const { capture: out, hits } = normalise(input, masks, "noise");
    expect(JSON.stringify(input)).toBe(before);
    expect(out.journeys[0]!.pages[0]!.network).toEqual([DOC, video(206), video(206)]);
    expect(hits["test-media-status"]).toBe(2);
    expect(normalise(side("b", [DOC, video(404)]), masks, "noise").hits["test-media-status"]).toBe(0);
  });

  it("honours modes", () => {
    const onlyRelease = { ...masks, masks: [{ ...mediaStatus, modes: ["release" as const] }] };
    expect(normalise(side("a", [video(200)]), onlyRelease, "noise").capture.journeys[0]!.pages[0]!.network[0]!.status).toBe(200);
    expect(normalise(side("a", [video(200)]), onlyRelease, "release").capture.journeys[0]!.pages[0]!.network[0]!.status).toBe(206);
  });
});
