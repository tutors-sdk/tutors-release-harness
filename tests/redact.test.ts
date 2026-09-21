import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { stripOrigins } from "../src/collectors/browser.ts";
import { compareCaptures } from "../src/compare/index.ts";
import { compareFromCaptures } from "../src/run.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import { REDACTED, REDACTIONS, redactCapture, redactHeader, redactSecrets } from "../src/normalise/redact.ts";
import type { SideCapture } from "../src/types.ts";
import { capture, clone } from "./support/captures.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);

// Synthetic, assembled at run time: nothing in this file is a credential, or looks like one to a scanner.
const jwt = (tag: string) => ["eyJhbGciOiJIUzI1NiJ9", "eyJyb2xlIjoi" + tag + "In0", "c2lnbmF0dXJl" + tag].join(".");
const publishable = (tag: string) => "sb_" + "publishable_" + tag + "abcdefgh1234";
const secretKey = (tag: string) => "sb_" + "secret_" + tag + "abcdefgh1234";

const corsMessage = (key: string) =>
  `Access to resource at 'https://example-project.supabase.co/rest/v1/app_errors?Prefer=return=none&apikey=${key}' from origin '{{origin}}' has been blocked by CORS policy: Response to preflight request doesn't pass access control check.`;

const withConsole = (side: "a" | "b", text: string): SideCapture => {
  const c = capture(side);
  c.journeys[0]!.pages[0]!.console.push({ level: "error", text });
  return c;
};
const diff = (a: SideCapture, b: SideCapture) => compareCaptures(normalise(a, masks, "post-deploy").capture, normalise(b, masks, "post-deploy").capture, masks);

describe("redactSecrets: every entry of the list", () => {
  it("apikey= in a URL: the value goes, the name and the rest of the URL stay", () => {
    const key = jwt("A");
    expect(redactSecrets(corsMessage(key))).toBe(corsMessage(REDACTED));
    expect(redactSecrets(`https://x.supabase.co/rest/v1/t?apikey=${key}&select=id`)).toBe(`https://x.supabase.co/rest/v1/t?apikey=${REDACTED}&select=id`);
    expect(redactSecrets(`https://x.supabase.co/rest/v1/t?select=id&APIKEY=${key}`)).toBe(`https://x.supabase.co/rest/v1/t?select=id&APIKEY=${REDACTED}`);
  });

  it("an apikey member of a logged JSON body", () => {
    expect(redactSecrets(`{"apikey":"${publishable("B")}","x":1}`)).toBe(`{"apikey":"${REDACTED}","x":1}`);
  });

  it("Authorization and Bearer values", () => {
    expect(redactSecrets("Authorization: Bearer abcdef0123456789.token")).toBe(`Authorization: Bearer ${REDACTED}`);
    expect(redactSecrets("authorization=Basic dXNlcjpwYXNz")).toBe(`authorization=Basic ${REDACTED}`);
    expect(redactSecrets('headers {"Authorization":"Bearer abcdef0123456789"}')).toContain(REDACTED);
    expect(redactSecrets("sent Bearer abcdef0123456789 to the API")).toBe(`sent Bearer ${REDACTED} to the API`);
  });

  it("a JWT anywhere, with or without an empty signature", () => {
    expect(redactSecrets(`token ${jwt("C")} rejected`)).toBe(`token ${REDACTED} rejected`);
    expect(redactSecrets("x eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0. y")).toBe(`x ${REDACTED} y`);
  });

  it("sb_publishable_ and sb_secret_ keys", () => {
    expect(redactSecrets(`key ${publishable("D")} and ${secretKey("E")}`)).toBe(`key ${REDACTED} and ${REDACTED}`);
  });

  it("is idempotent, and every entry of the list is exercised above", () => {
    const all = `?apikey=${jwt("F")} {"apikey":"k1234567"} Authorization: Bearer abcdef0123456789 Bearer abcdef0123456789 ${jwt("G")} ${publishable("H")}`;
    const once = redactSecrets(all);
    expect(redactSecrets(once)).toBe(once);
    expect(once).not.toMatch(/eyJ|sb_publishable|k1234567|abcdef0123456789/);
    expect(REDACTIONS.map((r) => r.name)).toEqual(["apikey parameter", "apikey JSON member", "Authorization value", "Bearer token", "JWT", "Supabase publishable or secret key"]);
  });

  it("must not redact what merely resembles one", () => {
    const harmless = [
      "eyJhbGci", // the prefix alone, no dots
      "version 1.2.3 and 4.5.6.7",
      "https://x.supabase.co/rest/v1/t?select=id&key=abc123&token_type=bearer",
      "the apikey header is required",
      "Bearer",
      "Authorization required",
      "sb_publishable_",
      "a.b.c and www.example.com/eyJ",
      "GET {{course}}/_app/immutable/chunks/CkQ9dBEsAAAA.js",
      "  - link \"apikey\":",
      "Failed to load resource: the server responded with a status of 404 ()"
    ];
    for (const text of harmless) expect(redactSecrets(text), text).toBe(text);
  });

  it("redactHeader: a credential header is dropped whole, any other value only where it holds a secret", () => {
    expect(redactHeader("Authorization", "whatever")).toBe(REDACTED);
    expect(redactHeader("x-api-key", "abc")).toBe(REDACTED);
    expect(redactHeader("x-api-key", "")).toBe("");
    expect(redactHeader("content-type", "text/html")).toBe("text/html");
    expect(redactHeader("link", `<https://x/y?apikey=${jwt("I")}>; rel=preload`)).toBe(`<https://x/y?apikey=${REDACTED}>; rel=preload`);
  });
});

describe("redaction through normalise and compare", () => {
  it("A/A: captures that differ only in the key produce no hunks, and no hunk detail holds a key", () => {
    expect(diff(withConsole("a", corsMessage(jwt("J"))), withConsole("b", corsMessage(jwt("K"))))).toEqual([]);
  });

  it("A/A: the same message on both sides is not a hunk either", () => {
    const m = corsMessage(jwt("L"));
    expect(diff(withConsole("a", m), withConsole("b", m))).toEqual([]);
  });

  it("planted: a new message on b is still a hunk, and its detail reads apikey=<redacted>", () => {
    const key = jwt("M");
    const hunks = diff(capture("a"), withConsole("b", corsMessage(key)));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "console", severity: "fail" });
    expect(hunks[0]!.detail).toContain(`app_errors?Prefer=return=none&apikey=${REDACTED}'`);
    expect(JSON.stringify(hunks)).not.toContain("eyJ");
  });

  it("planted: a different endpoint or wording behind the same redacted key is still a hunk", () => {
    const a = withConsole("a", corsMessage(jwt("N")));
    const b = withConsole("b", corsMessage(jwt("N")).replace("app_errors", "other_table"));
    expect(diff(a, b).map((h) => h.severity).sort()).toEqual(["fail", "info"]);
  });

  it("redacts network URLs, the path, the tree, header values and a journey error", () => {
    const c = capture("b");
    const p = c.journeys[0]!.pages[0]!;
    // Not /rest/v1: the persistence-stub-requests mask drops those requests, so the entry would never reach the assertion.
    p.network.push({ method: "GET", url: `{{origin}}/api/t?apikey=${jwt("O")}`, status: 200, contentType: "application/json", cacheControl: "", schemaHash: "" });
    p.path += `?apikey=${jwt("P")}`;
    p.aria += `\n- link "x":\n  - /url: /go?apikey=${publishable("Q")}`;
    p.headers.authorization = "Bearer abcdef0123456789";
    c.journeys[0]!.error = `page.goto failed: ${corsMessage(jwt("R"))}`;
    const out = normalise(c, masks, "release").capture;
    expect(JSON.stringify(out)).not.toMatch(/eyJ|sb_publishable|abcdef0123456789/);
    expect(out.journeys[0]!.pages[0]!.headers.authorization).toBe(REDACTED);
    expect(out.journeys[0]!.pages[0]!.network.at(-1)!.url).toBe(`{{origin}}/api/t?apikey=${REDACTED}`);
  });

  it("is pure: the input capture is untouched", () => {
    const input = withConsole("b", corsMessage(jwt("S")));
    const before = JSON.stringify(input);
    normalise(clone(input), masks, "release");
    redactCapture(input);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("the collector redacts too, so a new capture.json does not hold the value", () => {
    const spec = { name: "b" as const, images: { reader: "external:https://tutors.dev", catalogue: "external:https://c.tutors.dev", live: "external:https://l.tutors.dev", time: "external:https://t.tutors.dev" }, urls: { reader: "https://tutors.dev", catalogue: "https://c.tutors.dev", live: "https://l.tutors.dev", courseId: "reference-course" }, external: true };
    expect(stripOrigins(`from origin 'https://tutors.dev' apikey=${jwt("T")}`, spec)).toBe(`from origin '{{origin}}' apikey=${REDACTED}`);
  });

  it("no report file compare writes holds the key: report.json, report.md and report.html", () => {
    const key = jwt("U");
    const dir = mkdtempSync(join(tmpdir(), "redact-"));
    compareFromCaptures({ mode: "post-deploy", substrate: "compose", captureDir: dir, a: capture("a"), b: withConsole("b", corsMessage(key)), claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {} });
    for (const file of ["report.json", "report.md", "report.html"]) {
      const text = readFileSync(join(dir, file), "utf8");
      expect(text, file).not.toContain(key);
      expect(text, file).not.toContain("eyJ");
    }
    expect(readFileSync(join(dir, "report.json"), "utf8")).toContain(`apikey=${REDACTED}`);
  });
});
