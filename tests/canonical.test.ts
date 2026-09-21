import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, MasksFileSchema, loadMasks, normalise } from "../src/normalise/masks.ts";
import { canonicalCacheControl, canonicalContentType } from "../src/normalise/canonical.ts";
import type { NetworkEntry, SideCapture } from "../src/types.ts";
import { capture, clone } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture, mode: "release" | "post-deploy" = "release") => compareCaptures(normalise(a, masks, mode).capture, normalise(b, masks, mode).capture, masks);

const asset = (over: Partial<NetworkEntry> = {}): NetworkEntry => ({
  method: "GET",
  url: "{{origin}}/_app/immutable/entry/app.{{hash}}.js",
  status: 200,
  contentType: "text/javascript",
  cacheControl: "public,max-age=31536000,immutable",
  schemaHash: "",
  ...over
});

/** A capture whose only network entry is the asset, plus the document headers given. */
function withAsset(side: "a" | "b", entry: NetworkEntry, headers: Record<string, string> = {}): SideCapture {
  const c = capture(side);
  const p = c.journeys[0]!.pages[0]!;
  p.network = [entry];
  Object.assign(p.headers, headers);
  return c;
}

describe("canonical forms", () => {
  it("cache-control: order, case and whitespace do not matter", () => {
    const forms = ["public,max-age=31536000,immutable", "public,immutable,max-age=31536000", "max-age=31536000, public, immutable", "Public , Immutable, MAX-AGE = 31536000", "public, public, immutable, max-age=31536000,"];
    expect(new Set(forms.map(canonicalCacheControl))).toEqual(new Set(["immutable,max-age=31536000,public"]));
    expect(canonicalCacheControl("private, no-store")).toBe(canonicalCacheControl("private,no-store"));
    expect(canonicalCacheControl("")).toBe("");
  });

  it("cache-control: a comma inside a quoted value does not split the directive", () => {
    expect(canonicalCacheControl('no-cache="Set-Cookie, X-Foo", max-age=0')).toBe('max-age=0,no-cache="set-cookie, x-foo"');
  });

  it("cache-control: a different max-age, or a lost directive, is a different value", () => {
    expect(canonicalCacheControl("public,max-age=300,immutable")).not.toBe(canonicalCacheControl("public,max-age=31536000,immutable"));
    expect(canonicalCacheControl("public,max-age=31536000")).not.toBe(canonicalCacheControl("public,max-age=31536000,immutable"));
    expect(canonicalCacheControl("no-store")).not.toBe(canonicalCacheControl("no-cache"));
  });

  it("content-type: the default charset, case, spacing and the JavaScript aliases do not matter", () => {
    expect(canonicalContentType("text/css; charset=UTF-8")).toBe("text/css");
    expect(canonicalContentType("TEXT/CSS;charset=utf-8")).toBe("text/css");
    expect(canonicalContentType('text/css; charset="utf-8"')).toBe("text/css");
    expect(canonicalContentType("application/javascript; charset=UTF-8")).toBe("text/javascript");
    expect(canonicalContentType("application/x-javascript")).toBe("text/javascript");
    expect(canonicalContentType("text/html;  a=1 ;charset=utf-8; b=2")).toBe("text/html; a=1; b=2");
    expect(canonicalContentType("")).toBe("");
  });

  it("content-type: another media type or another charset is a different value", () => {
    expect(canonicalContentType("text/css")).not.toBe(canonicalContentType("text/plain"));
    expect(canonicalContentType("text/html; charset=iso-8859-1")).toBe("text/html; charset=iso-8859-1");
    expect(canonicalContentType("text/html; charset=ISO-8859-1")).not.toBe(canonicalContentType("text/html"));
    expect(canonicalContentType("application/json")).not.toBe(canonicalContentType("text/javascript"));
  });
});

describe("canonicalisation through normalise and compare", () => {
  it("A/A: captures that differ only in header spelling produce no hunks, network entries and document headers alike", () => {
    const a = withAsset("a", asset(), { "content-type": "text/html", "cache-control": "public,max-age=60,must-revalidate" });
    const b = withAsset("b", asset({ contentType: "application/javascript; charset=UTF-8", cacheControl: "public, immutable, max-age=31536000" }), {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "Must-Revalidate, Max-Age=60, Public"
    });
    for (const mode of ["release", "post-deploy"] as const) expect(diff(a, b, mode)).toEqual([]);
  });

  it("planted: max-age 31536000 -> 300 is still a network hunk after canonicalisation", () => {
    const a = withAsset("a", asset());
    const b = withAsset("b", asset({ cacheControl: "public, immutable, max-age=300" }));
    const hunks = diff(a, b, "post-deploy");
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "network", severity: "fail" });
    expect(hunks[0]!.summary).toContain("cache-control changed: immutable,max-age=31536000,public → immutable,max-age=300,public");
  });

  it("planted: a lost immutable, a changed media type and a document header's max-age are hunks", () => {
    const a = withAsset("a", asset(), { "cache-control": "public,max-age=600" });
    const b = withAsset("b", asset({ contentType: "text/plain", cacheControl: "public,max-age=31536000" }), { "cache-control": "public,max-age=60" });
    const summaries = diff(a, b, "post-deploy").map((h) => h.summary);
    expect(summaries.some((s) => s.includes("cache-control changed: immutable,max-age=31536000,public → max-age=31536000,public"))).toBe(true);
    expect(summaries.some((s) => s.includes("content-type changed: text/javascript → text/plain"))).toBe(true);
    expect(summaries.some((s) => s.includes("header cache-control changed: max-age=600,public → max-age=60,public"))).toBe(true);
  });

  it("planted: a non-default charset is a hunk", () => {
    const a = withAsset("a", asset({ contentType: "text/css" }));
    const b = withAsset("b", asset({ contentType: "text/css; charset=iso-8859-1" }));
    expect(diff(a, b)).toHaveLength(1);
  });

  it("must not flag: pure reordering, spacing, case and the default charset, in every mode", () => {
    const a = withAsset("a", asset({ contentType: "text/css", cacheControl: "private, no-store" }));
    const b = withAsset("b", asset({ contentType: "text/css; charset=UTF-8", cacheControl: "private,no-store" }));
    expect(diff(a, b, "release")).toEqual([]);
    expect(diff(a, b, "post-deploy")).toEqual([]);
  });

  it("is pure and leaves every other header alone", () => {
    const input = withAsset("a", asset(), { link: "<x>; rel=preload,   <y>", vary: "Accept-Encoding, Origin" });
    const before = JSON.stringify(input);
    const out = normalise(clone(input), masks, "release").capture.journeys[0]!.pages[0]!;
    expect(JSON.stringify(input)).toBe(before);
    expect(out.headers.link).toBe("<x>; rel=preload,   <y>");
    expect(out.headers.vary).toBe("Accept-Encoding, Origin");
  });
});

describe("a header mask with a pattern (conditional drop)", () => {
  const base = { screenshot: masks.screenshot, metrics: masks.metrics, logs: masks.logs, timing: masks.timing };
  const withMask = (m: Record<string, unknown>) => MasksFileSchema.parse({ ...base, masks: [{ id: "test-cc", reason: "test-only mask to prove a header is dropped only when its value matches", ...m }] });

  it("drops the header and the network field only when the canonical value matches, and counts each", () => {
    const file = withMask({ artefact: ["headers", "network"], header: "cache-control", pattern: "^no-cache$" });
    const input = withAsset("a", asset({ cacheControl: "No-Cache" }), { "cache-control": "no-cache" });
    input.journeys[0]!.pages[0]!.network.push(asset({ url: "{{origin}}/other", cacheControl: "max-age=60" }));
    const { capture: out, hits } = normalise(input, file);
    const p = out.journeys[0]!.pages[0]!;
    expect(p.headers).not.toHaveProperty("cache-control");
    expect(p.network.map((n) => n.cacheControl)).toEqual(["", "max-age=60"]);
    expect(hits["test-cc"]).toBe(2);
  });

  it("keeps a header whose value does not match: no-cache -> max-age=300 still shows", () => {
    const file = withMask({ artefact: ["headers", "network"], header: "cache-control", pattern: "^no-cache$" });
    const a = withAsset("a", asset({ cacheControl: "max-age=300" }));
    const b = withAsset("b", asset({ cacheControl: "no-cache" }));
    expect(compareCaptures(normalise(a, file).capture, normalise(b, file).capture, masks).map((h) => h.summary.includes("cache-control changed"))).toEqual([true]);
  });

  it("rejects a network header mask on a header a network entry does not record (negative fixture)", () => {
    expect(() => withMask({ artefact: "network", header: "vary" })).toThrow();
    expect(() => withMask({ artefact: "dom", header: "cache-control" })).toThrow();
    expect(() => withMask({ artefact: "network", header: "cache-control", pattern: "x", drop: true })).toThrow();
  });
});
