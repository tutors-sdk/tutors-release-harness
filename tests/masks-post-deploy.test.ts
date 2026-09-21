import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { Mode, NetworkEntry, SideCapture } from "../src/types.ts";
import { capture } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture, mode: Mode) => compareCaptures(normalise(a, masks, mode).capture, normalise(b, masks, mode).capture, masks);

const entry = (over: Partial<NetworkEntry>): NetworkEntry => ({ method: "GET", url: "{{origin}}/x", status: 200, contentType: "text/html", cacheControl: "", schemaHash: "", ...over });

/** What Netlify adds in front of the same app: HSTS, no-cache on the document, its RUM script, revalidate on a static file. */
function behindCdn(side: "a" | "b"): SideCapture {
  const c = capture(side);
  const p = c.journeys[0]!.pages[0]!;
  p.headers["strict-transport-security"] = "max-age=31536000";
  p.headers["cache-control"] = "no-cache";
  p.network[0]!.cacheControl = "no-cache";
  p.network.push(
    entry({ url: "{{origin}}/.netlify/scripts/rum", contentType: "application/javascript; charset=UTF-8", cacheControl: "public,max-age=0,must-revalidate" }),
    entry({ url: "{{origin}}/icons/copy.svg", contentType: "image/svg+xml", cacheControl: "public,max-age=0,must-revalidate" })
  );
  return c;
}
/** The same page as the recorded stack serves it: none of those. */
function plain(side: "a" | "b"): SideCapture {
  const c = capture(side);
  c.journeys[0]!.pages[0]!.network.push(entry({ url: "{{origin}}/icons/copy.svg", contentType: "image/svg+xml", cacheControl: "" }));
  return c;
}
const page = (c: SideCapture) => c.journeys[0]!.pages[0]!;

describe("post-deploy CDN masks", () => {
  it("A/A: production behind Netlify against the bare recorded stack is clean in post-deploy", () => {
    expect(diff(plain("a"), behindCdn("b"), "post-deploy")).toEqual([]);
  });

  it("the same difference is fully visible in release mode (the masks are post-deploy only)", () => {
    const summaries = diff(plain("a"), behindCdn("b"), "release").map((h) => h.summary);
    expect(summaries.some((s) => s.includes("header added on b: strict-transport-security"))).toBe(true);
    expect(summaries.some((s) => s.includes("header added on b: cache-control: no-cache"))).toBe(true);
    expect(summaries.some((s) => s.includes("new request on b: GET /.netlify/scripts/rum"))).toBe(true);
    expect(summaries.some((s) => s.includes("GET /icons/copy.svg cache-control changed"))).toBe(true);
  });

  it("planted: a document that gains max-age or no-store is still a hunk in post-deploy", () => {
    const b = behindCdn("b");
    page(b).headers["cache-control"] = "public, max-age=300";
    page(b).network[0]!.cacheControl = "public, max-age=300";
    const summaries = diff(plain("a"), b, "post-deploy").map((h) => h.summary);
    expect(summaries.some((s) => s.includes("header added on b: cache-control: max-age=300,public"))).toBe(true);
    expect(summaries.some((s) => s.includes("cache-control changed: ∅ → max-age=300,public"))).toBe(true);
    const c = behindCdn("b");
    page(c).headers["cache-control"] = "no-store";
    expect(diff(plain("a"), c, "post-deploy").some((h) => h.summary.includes("cache-control: no-store"))).toBe(true);
  });

  it("planted: max-age 31536000 -> 300 on an immutable asset is a hunk in post-deploy, and so is a lost immutable", () => {
    const asset = (cc: string) => entry({ url: "{{origin}}/_app/immutable/entry/app.{{hash}}.js", contentType: "text/javascript", cacheControl: cc });
    const a = plain("a");
    page(a).network.push(asset("public,max-age=31536000,immutable"));
    const shorter = behindCdn("b");
    page(shorter).network.push(asset("public,max-age=300,immutable"));
    expect(diff(a, shorter, "post-deploy").map((h) => h.summary)).toEqual([expect.stringContaining("cache-control changed: immutable,max-age=31536000,public → immutable,max-age=300,public")]);
    const lost = behindCdn("b");
    page(lost).network.push(asset("public,max-age=31536000"));
    expect(diff(a, lost, "post-deploy").map((h) => h.summary)).toEqual([expect.stringContaining("→ max-age=31536000,public")]);
  });

  it("planted: another request on production, and a static file that gains a real max-age, still show", () => {
    const b = behindCdn("b");
    page(b).network.push(entry({ url: "{{origin}}/.netlify/functions/x" }), entry({ url: "{{origin}}/.netlify/scripts/rum.js" }));
    page(b).network.find((n) => n.url.endsWith("copy.svg"))!.cacheControl = "public,max-age=600";
    const summaries = diff(plain("a"), b, "post-deploy").map((h) => h.summary);
    expect(summaries).toHaveLength(3);
    expect(summaries.some((s) => s.includes("new request on b: GET /.netlify/functions/x"))).toBe(true);
    expect(summaries.some((s) => s.includes("new request on b: GET /.netlify/scripts/rum.js"))).toBe(true);
    expect(summaries.some((s) => s.includes("copy.svg cache-control changed: ∅ → max-age=600,public"))).toBe(true);
  });

  it("must not flag: both sides behind the same CDN, and both sides bare", () => {
    expect(diff(behindCdn("a"), behindCdn("b"), "post-deploy")).toEqual([]);
    expect(diff(plain("a"), plain("b"), "post-deploy")).toEqual([]);
  });

  it("every one of the new masks fires on the CDN capture and counts its hits", () => {
    const { hits } = normalise(behindCdn("b"), masks, "post-deploy");
    for (const id of ["cdn-hsts", "cdn-rum-request", "cdn-document-no-cache", "cdn-static-revalidate"]) expect(hits[id], id).toBeGreaterThan(0);
    expect(normalise(behindCdn("b"), masks, "release").hits).not.toHaveProperty("cdn-hsts");
  });

  it("each new mask is post-deploy only and says why", () => {
    for (const id of ["cdn-hsts", "cdn-rum-request", "cdn-document-no-cache", "cdn-static-revalidate"]) {
      const m = masks.masks.find((x) => x.id === id)!;
      expect(m.modes).toEqual(["post-deploy"]);
      expect(m.reason.length).toBeGreaterThan(80);
    }
  });
});
