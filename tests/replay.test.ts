/**
 * The replay set (since 1.28.0, runway improvement G): a fixed list of course URLs, compared on status, headers and
 * network only, as the informing `replay` artefact; no other engine sees those pages.
 */
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { ENGINE_LEVELS } from "../src/compare/levels.ts";
import { isReplayJourney, replay, withoutReplay } from "../src/compare/replay.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { blindJourneys, compareFromCaptures, defaultRunOptions } from "../src/run.ts";
import type { PageCapture, SideCapture } from "../src/types.ts";
import { REPLAY_URLS } from "../traffic/replay/urls.ts";
import { replayCourseUrls, selectJourneys } from "../traffic/journeys/journeys.ts";
import { capture, journey, page } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
const notePage = (o: Partial<PageCapture> = {}) => page({ pageKey: "replay:note-01", path: "/note/localhost:8080/unit-1/topic-01/note-01", network: [{ method: "GET", url: "{{origin}}/note/localhost:8080/unit-1/topic-01/note-01", status: 200, contentType: "text/html", cacheControl: "", schemaHash: "" }], axe: [], focus: [], ...o });
const withReplay = (side: "a" | "b", p: PageCapture, error?: string) => capture(side, { journeys: [journey(), journey({ journey: "replay-course-urls", pages: error ? [] : [p], ...(error ? { error } : {}) })] });

describe("the set", () => {
  it("is one anonymous journey over a fixed list of the fixture course's URLs, run by default", () => {
    expect(replayCourseUrls).toMatchObject({ name: "replay-course-urls", set: "replay", anonymous: true, target: "reader", replay: true });
    expect(isReplayJourney("replay-course-urls")).toBe(true);
    expect(selectJourneys(["replay"]).map((j) => j.name)).toEqual(["replay-course-urls"]);
    expect(defaultRunOptions().sets).toContain("replay");
    expect(ENGINE_LEVELS.replay).toEqual({ level: "informing" });
    // every URL but the deliberately missing one is a route of the pinned fixture course
    const routes = new Set<string>();
    const walk = (lo: { route?: string; los?: unknown[] }) => {
      if (lo.route) routes.add(lo.route.replace("{{COURSEURL}}", "{course}"));
      for (const c of (lo.los ?? []) as { route?: string; los?: unknown[] }[]) walk(c);
    };
    walk(JSON.parse(readFileSync(resolve(import.meta.dirname, "../fixtures/course-server/course/tutors.json"), "utf8")));
    for (const u of REPLAY_URLS.filter((x) => x.key !== "missing-topic")) expect(routes, u.path).toContain(u.path);
    expect(new Set(REPLAY_URLS.map((u) => u.key)).size).toBe(REPLAY_URLS.length);
  });
});

describe("status, headers and network only", () => {
  it("a header dropped on a replay page is a replay hunk, and no other engine sees replay pages", () => {
    const b = notePage();
    delete b.headers["x-content-type-options"];
    b.aria += '\n  - note "planted"';
    b.console = [{ level: "error", text: "boom" }];
    const hunks = diff(withReplay("a", notePage()), withReplay("b", b));
    expect(hunks.map((h) => [h.artefact, h.scope, h.severity])).toEqual([["replay", "replay:note-01/x-content-type-options", "fail"]]);
    expect(hunks[0]!.summary).toBe("replay:note-01: header dropped on b: x-content-type-options (was nosniff)");
    expect(hunks[0]!.id).toMatch(/^replay:/);
  });

  it("a status change is network's words, with the page key in the scope", () => {
    const b = notePage({ network: [{ method: "GET", url: "{{origin}}/note/localhost:8080/unit-1/topic-01/note-01", status: 404, contentType: "text/html", cacheControl: "", schemaHash: "" }] });
    const hunks = replay(withReplay("a", notePage()), withReplay("b", b));
    expect(hunks.map((h) => [h.artefact, h.scope])).toEqual([["replay", "replay:note-01 GET /note/localhost:8080/unit-1/topic-01/note-01"]]);
    expect(hunks[0]!.summary).toContain("status changed: 200 → 404");
  });

  it("the replay journey failing on b only is a replay finding; on both sides it does not blind an A/A", () => {
    const failed = replay(withReplay("a", notePage()), withReplay("b", notePage(), "net::ERR_CONNECTION_REFUSED"));
    expect(failed.map((h) => [h.artefact, h.scope, h.severity])).toEqual([["replay", "replay-course-urls", "fail"]]);
    expect(blindJourneys(withReplay("a", notePage(), "x"), withReplay("b", notePage(), "x"))).toEqual([]);
  });

  it("a capture without the set is compared exactly as before", () => {
    const a = capture("a");
    expect(withoutReplay(a)).toBe(a);
    expect(replay(a, capture("b"))).toEqual([]);
  });
});

describe("informing", () => {
  it("through a run: reported, never gates", () => {
    const b = notePage();
    delete b.headers["x-content-type-options"];
    const run = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-replay-")), a: withReplay("a", notePage()), b: withReplay("b", b), claims: [], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-10T09:00:00.000Z", runs: 1, ranAt: new Date("2026-10-10T09:00:00Z"), log: () => {} }).report;
    expect(run.compare.unclaimed).toEqual([]);
    expect(run.compare.hunks).toEqual([expect.objectContaining({ artefact: "replay", severity: "info", level: "informing" })]);
    expect(run.verdict).not.toBe("fail");
  });
});
