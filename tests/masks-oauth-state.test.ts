import { describe, expect, it } from "vitest";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { NetworkEntry, SideCapture, SideName } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

/**
 * `oauth-callback-state`, held against the shape PR #109's mutants A/A showed (run 38395493155): the same Better Auth
 * image requested the GitHub callback with a different random `state` on each side of reader-auth:course.
 */
const masks = loadMasks(DEFAULT_MASKS_FILE);
const ID = "oauth-callback-state";

const DOC: NetworkEntry = { method: "GET", url: "{{origin}}/course/reference-course", status: 200, contentType: "text/html", cacheControl: "", schemaHash: "" };
const at = (url: string, status = 302): NetworkEntry => ({ method: "GET", url, status, contentType: "", cacheControl: "", schemaHash: "" });
const callback = (state: string, code = "code-student") => at(`{{origin}}/api/auth/callback/github?code=${code}&state=${state}`);
const A = "V36Oi14EqPxFminiVbL9qCkM7usONpMh";
const B = "rv2ShZ0B6FZivLOQ3xAndga_a1NOD-kY";

function side(name: SideName, network: NetworkEntry[]): SideCapture {
  return capture(name, { journeys: [journey({ journey: "student-signs-in", pages: [page({ pageKey: "reader-auth:course", path: "/course/reference-course", network })] })] });
}

function diff(a: SideCapture, b: SideCapture, mode: "noise" | "release" | "post-deploy" = "noise") {
  return compareCaptures(normalise(a, masks, mode).capture, normalise(b, masks, mode).capture, masks);
}

describe("oauth-callback-state mask", () => {
  it("is narrow: network only, rewrites only the state on the GitHub callback, every mode, with its evidence", () => {
    const m = masks.masks.find((x) => x.id === ID)!;
    expect(m.artefact).toEqual(["network"]);
    expect(m.drop).toBeUndefined();
    expect(m.status).toBeUndefined();
    expect(m.modes).toBeUndefined();
    for (const evidence of ["38395493155", "reader-auth:course", A, B]) expect(m.reason).toContain(evidence);
    const re = new RegExp(m.pattern!);
    for (const url of [callback(A).url, callback(B).url, callback(A, "code-lecturer").url]) expect(re.test(url), url).toBe(true);
    for (const url of [
      "{{origin}}/api/auth/callback/github?code=code-student",
      "{{origin}}/api/auth/callback/github?code=code-student&state=short",
      "{{origin}}/api/auth/callback/github?error=access_denied&state=" + A,
      "{{origin}}/api/auth/callback/google?code=code-student&state=" + A,
      "{{origin}}/api/auth/callback/github?code=code-student&state=" + A + "&extra=1",
      "https://elsewhere.test/api/auth/callback/github?code=code-student&state=" + A
    ]) expect(re.test(url), url).toBe(false);
  });

  it("A/A: two random states on the same callback are clean, in every mode", () => {
    for (const mode of ["noise", "release", "post-deploy"] as const) expect(diff(side("a", [DOC, callback(A)]), side("b", [DOC, callback(B)]), mode)).toEqual([]);
  });

  it("fires on both sides and is counted", () => {
    expect(normalise(side("a", [DOC, callback(A)]), masks, "noise").hits[ID]).toBe(1);
    expect(normalise(side("b", [DOC]), masks, "noise").hits[ID]).toBe(0);
  });

  it("planted: a lost callback, a second callback, another role's code and a failing callback all still show", () => {
    expect(diff(side("a", [DOC, callback(A)]), side("b", [DOC]))).toHaveLength(1);
    expect(diff(side("a", [DOC, callback(A)]), side("b", [DOC, callback(B), callback(A, "code-lecturer")]))).toHaveLength(1);
    expect(diff(side("a", [DOC, callback(A)]), side("b", [DOC, callback(B, "code-lecturer")])).length).toBeGreaterThan(0);
    const failing = { ...callback(B), status: 500 };
    expect(diff(side("a", [DOC, callback(A)]), side("b", [DOC, failing])).length).toBeGreaterThan(0);
  });
});
