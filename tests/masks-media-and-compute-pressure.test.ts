import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { ConsoleEntry, NetworkEntry, SideCapture, SideName } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

/**
 * The two masks the 2.0 soak needed (1.28.3), held against the shapes the kept reports showed:
 * - `media-range-status`: `GET {{course}}/topic-07-reference/note-1/img/video.mov status changed: 200 → 206` on
 *   reference:note (A/A 2026-10-01T09-02-32Z and 2026-10-03T08-13-38Z; a to a2 in the 2026-10-02T08-52-14Z forecast);
 * - `chromium-compute-pressure-policy`: `error: Permissions policy violation: compute-pressure is not allowed in this
 *   document.` on reference:note, side b only (A/A 2026-10-03T08-13-38Z).
 */
const masks = loadMasks(DEFAULT_MASKS_FILE);
const MEDIA = "media-range-status";
const PRESSURE = "chromium-compute-pressure-policy";

const VIDEO_URL = "{{course}}/topic-07-reference/note-1/img/video.mov";
const DOC: NetworkEntry = { method: "GET", url: "{{origin}}/note/x/topic-07-reference/note-1", status: 200, contentType: "text/html", cacheControl: "", schemaHash: "" };
const at = (url: string, status: number, contentType = "video/quicktime"): NetworkEntry => ({ method: "GET", url, status, contentType, cacheControl: "", schemaHash: "" });
const video = (status: number) => at(VIDEO_URL, status);

const PRESSURE_TEXT = "Permissions policy violation: compute-pressure is not allowed in this document.";
const error = (text: string): ConsoleEntry => ({ level: "error", text });

function side(name: SideName, network: NetworkEntry[], console: ConsoleEntry[] = []): SideCapture {
  return capture(name, { journeys: [journey({ journey: "reference", pages: [page({ pageKey: "reference:note", path: "/note/x/topic-07-reference/note-1", network, console })] })] });
}

function diff(a: SideCapture, b: SideCapture, mode: "noise" | "release" | "post-deploy" = "noise") {
  return compareCaptures(normalise(a, masks, mode).capture, normalise(b, masks, mode).capture, masks);
}

describe("media-range-status mask", () => {
  it("is narrow: network only, 206 and 200 only, media files under {{course}}, every mode, with its evidence", () => {
    const m = masks.masks.find((x) => x.id === MEDIA)!;
    expect(m.artefact).toEqual(["network"]);
    expect(m.status).toEqual([206, 200]);
    expect(m.drop).toBeUndefined();
    expect(m.replace).toBeUndefined();
    expect(m.modes).toBeUndefined();
    for (const evidence of ["2026-10-01T09-02-32Z", "2026-10-03T08-13-38Z", "2026-10-02T08-52-14Z", "reference:note"]) expect(m.reason).toContain(evidence);
    const re = new RegExp(m.pattern!);
    for (const url of [VIDEO_URL, "{{course}}/a/b.mp4", "{{course}}/a/b.webm", "{{course}}/a/b.mp3"]) expect(re.test(url), url).toBe(true);
    for (const url of ["{{origin}}/a/video.mov", "{{course}}/a/video.mov?x=1", "{{course}}/a/video.mov.json", "{{course}}/course.png", "{{course}}/tutors.json", "https://cdn.example/a/video.mov"]) expect(re.test(url), url).toBe(false);
  });

  it("A/A: the 200 → 206 the soak broke on is clean, either way round, in every mode", () => {
    for (const mode of ["noise", "release", "post-deploy"] as const) {
      expect(diff(side("a", [DOC, video(200)]), side("b", [DOC, video(206)]), mode)).toEqual([]);
      expect(diff(side("a", [DOC, video(206)]), side("b", [DOC, video(200)]), mode)).toEqual([]);
    }
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC, video(206), video(206)]))).toEqual([]);
  });

  it("fires on both sides and is counted", () => {
    expect(normalise(side("a", [DOC, video(200)]), masks, "noise").hits[MEDIA]).toBe(1);
    expect(normalise(side("b", [DOC, video(206)]), masks, "noise").hits[MEDIA]).toBe(1);
    expect(normalise(side("b", [DOC]), masks, "noise").hits[MEDIA]).toBe(0);
  });

  it("planted: a 206 → 404 (or 416, 500) on the video still shows", () => {
    for (const bad of [404, 416, 500]) {
      const hunks = diff(side("a", [DOC, video(206)]), side("b", [DOC, video(bad)]));
      expect(hunks, String(bad)).toHaveLength(1);
      expect(hunks[0]).toMatchObject({ artefact: "network", severity: "fail", scope: `GET ${VIDEO_URL}` });
      expect(hunks[0]!.summary).toContain(`status changed: 206 → ${bad}`);
    }
  });

  it("planted: the video gone, a new media request, and 200/206 on a non-media or non-course URL all still show", () => {
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC]))).toHaveLength(1);
    expect(diff(side("a", [DOC]), side("b", [DOC, video(206)]))).toHaveLength(1);
    expect(diff(side("a", [DOC, at("{{course}}/course.png", 200, "image/png")]), side("b", [DOC, at("{{course}}/course.png", 206, "image/png")]))).toHaveLength(1);
    expect(diff(side("a", [DOC, at("{{origin}}/x/video.mov", 200)]), side("b", [DOC, at("{{origin}}/x/video.mov", 206)]))).toHaveLength(1);
  });
});

describe("chromium-compute-pressure-policy mask", () => {
  it("is narrow: console only, a drop of that exact message anchored at both ends, every mode, with its evidence", () => {
    const m = masks.masks.find((x) => x.id === PRESSURE)!;
    expect(m.artefact).toEqual(["console"]);
    expect(m.drop).toBe(true);
    expect(m.modes).toBeUndefined();
    expect(m.reason).toContain("2026-10-03T08-13-38Z");
    const re = new RegExp(m.pattern!);
    expect(re.test(PRESSURE_TEXT)).toBe(true);
    expect(re.test(`${PRESSURE_TEXT} extra`)).toBe(false);
    expect(re.test(`x ${PRESSURE_TEXT}`)).toBe(false);
    expect(re.test("Permissions policy violation: camera is not allowed in this document.")).toBe(false);
  });

  it("A/A: the message on side b only (2026-10-03) is clean, in every mode, and with the media status too", () => {
    for (const mode of ["noise", "release", "post-deploy"] as const) {
      expect(diff(side("a", [DOC]), side("b", [DOC], [error(PRESSURE_TEXT)]), mode)).toEqual([]);
      expect(diff(side("a", [DOC], [error(PRESSURE_TEXT)]), side("b", [DOC]), mode)).toEqual([]);
    }
    // the whole 2026-10-03 A/A: both of its differences at once
    expect(diff(side("a", [DOC, video(200)]), side("b", [DOC, video(206)], [error(PRESSURE_TEXT)]))).toEqual([]);
    expect(normalise(side("b", [DOC], [error(PRESSURE_TEXT)]), masks, "noise").hits[PRESSURE]).toBe(1);
  });

  it("planted: another permissions-policy violation, or another error beside it, still shows", () => {
    const camera = error("Permissions policy violation: camera is not allowed in this document.");
    const hunks = diff(side("a", [DOC]), side("b", [DOC], [error(PRESSURE_TEXT), camera]));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "console", severity: "fail", scope: "reference:note" });
    expect(hunks[0]!.detail).toContain("camera");
    const boom = error("TypeError: Cannot read properties of undefined (reading 'title')");
    expect(diff(side("a", [DOC], [error(PRESSURE_TEXT)]), side("b", [DOC], [boom]))).toHaveLength(1);
  });

  it("a changed Permissions-Policy header still shows on the headers artefact", () => {
    const withPolicy = (name: SideName, value: string) =>
      capture(name, { journeys: [journey({ journey: "reference", pages: [page({ pageKey: "reference:note", headers: { ...page().headers, "permissions-policy": value } })] })] });
    const hunks = diff(withPolicy("a", "camera=()"), withPolicy("b", "camera=(), compute-pressure=()"));
    expect(hunks.some((h) => h.artefact === "headers")).toBe(true);
  });
});
