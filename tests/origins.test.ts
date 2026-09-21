import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { compareFromCaptures } from "../src/run.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { externalOrigins, rewriteOrigins } from "../src/normalise/origins.ts";
import type { Mode, SideCapture } from "../src/types.ts";
import { capture } from "./support/captures.ts";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const PROD = "https://tutors.dev";

const external = (c: SideCapture): SideCapture => ({ ...c, images: { reader: `external:${PROD}`, catalogue: "external:https://catalogue.tutors.dev", live: "external:https://live.tutors.dev/" } });
const withLinks = (c: SideCapture, ...urls: string[]): SideCapture => {
  c.journeys[0]!.pages[0]!.aria += "\n" + urls.map((u) => `- link "x":\n  - /url: ${u}`).join("\n");
  return c;
};
/** The comparison exactly as compareFromCaptures does it. */
function diff(a: SideCapture, b: SideCapture, mode: Mode = "post-deploy") {
  const origins = externalOrigins(a, b);
  return compareCaptures(normalise(a, masks, mode, { origins }).capture, normalise(b, masks, mode, { origins }).capture, masks);
}

describe("externalOrigins", () => {
  it("reads the URLs of an external side's images, once each, without a trailing slash", () => {
    expect(externalOrigins(capture("a"), external(capture("b")))).toEqual(["https://catalogue.tutors.dev", "https://live.tutors.dev", PROD]);
  });
  it("is empty when neither side is external", () => {
    expect(externalOrigins(capture("a"), capture("b"))).toEqual([]);
  });
});

describe("rewriteOrigins", () => {
  it("rewrites the origin, the origin with a path, a query and a fragment", () => {
    expect(rewriteOrigins(`${PROD} ${PROD}/x?y=1 ${PROD}#top "${PROD}"`, [PROD]).text).toBe('{{origin}} {{origin}}/x?y=1 {{origin}}#top "{{origin}}"');
  });
  it("leaves a different origin alone: another host, another port, a userinfo trick, a longer host", () => {
    const text = `${PROD}:8443/x ${PROD}.evil.example ${PROD}-x.example ${PROD}@evil.example http://tutors.dev`;
    expect(rewriteOrigins(text, [PROD]).text).toBe(text);
  });
});

describe("the recorded side's literal link to production (G2)", () => {
  // The recorded side was captured at http://reader-a:3000: its literal https://tutors.dev links stay literal.
  // Production's own origin was rewritten to {{origin}} by the collector. Same link, same destination.
  const recorded = () => withLinks(capture("a"), PROD, `${PROD}/note/tutors-reference-manual/side/note-whats-new`, "https://setu.ie");
  const production = () => external(withLinks(capture("b"), "{{origin}}", "{{origin}}/note/tutors-reference-manual/side/note-whats-new", "https://setu.ie"));

  it("A/A: a literal link to the production origin on the recorded side matches production's rewritten one", () => {
    expect(diff(recorded(), production())).toEqual([]);
  });

  it("A/A: the same holds when the recorded side's own runtime origin was already rewritten", () => {
    const a = withLinks(capture("a"), "{{origin}}", "{{origin}}/x");
    expect(diff(a, external(withLinks(capture("b"), "{{origin}}", "{{origin}}/x")))).toEqual([]);
  });

  it("planted: a link that changes path, host or port is still a dom hunk", () => {
    for (const changed of ["{{origin}}/other", "https://example.org", `${PROD}:8443`, `${PROD}.evil.example`]) {
      const b = external(withLinks(capture("b"), changed));
      const hunks = diff(withLinks(capture("a"), PROD), b);
      expect(hunks.map((h) => h.artefact), changed).toEqual(["dom"]);
    }
  });

  it("planted: a link that was to another site and now goes to production is a hunk", () => {
    expect(diff(withLinks(capture("a"), "https://setu.ie"), external(withLinks(capture("b"), "{{origin}}"))).map((h) => h.artefact)).toEqual(["dom"]);
  });

  it("must not flag: a literal link to another site that both sides carry, or a side with no external origin (release mode)", () => {
    expect(diff(withLinks(capture("a"), "https://setu.ie"), withLinks(capture("b"), "https://setu.ie"), "release")).toEqual([]);
    // Neither side external: a literal https://tutors.dev is just a literal, on both sides, and is not touched.
    const a = withLinks(capture("a"), PROD);
    expect(normalise(a, masks, "release", { origins: externalOrigins(a, capture("b")) }).capture.journeys[0]!.pages[0]!.aria).toContain(`/url: ${PROD}`);
  });

  it("rewrites the recorded side's network URLs and console text too, and they are compared as production's are", () => {
    const a = capture("a");
    a.journeys[0]!.pages[0]!.console.push({ level: "error", text: `Failed to load ${PROD}/x` });
    a.journeys[0]!.pages[0]!.network.push({ method: "GET", url: `${PROD}/api/x`, status: 200, contentType: "application/json", cacheControl: "", schemaHash: "s" });
    const b = external(capture("b"));
    b.journeys[0]!.pages[0]!.console.push({ level: "error", text: "Failed to load {{origin}}/x" });
    b.journeys[0]!.pages[0]!.network.push({ method: "GET", url: "{{origin}}/api/x", status: 200, contentType: "application/json", cacheControl: "", schemaHash: "s" });
    expect(diff(a, b)).toEqual([]);
  });

  it("goes through compareFromCaptures, which is what `harness run` and `harness compare` call", () => {
    const dir = mkdtempSync(join(tmpdir(), "origins-"));
    const outcome = compareFromCaptures({ mode: "post-deploy", substrate: "compose", captureDir: dir, a: recorded(), b: production(), claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {} });
    expect(outcome.report.compare.hunks.filter((h) => h.artefact === "dom")).toEqual([]);
  });
});
