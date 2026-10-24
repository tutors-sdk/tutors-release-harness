/**
 * headers-policy (since 1.55.0; harness hardening plan, D1): the monorepo's header contract, judged on b. The contract
 * parser (its own format, exit 2 on a bad file), the A/A, the planted missing and wrong header and weak session cookie,
 * what it must not flag, and a whole run whose verdict it must not change.
 */
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { InputFileError } from "../src/claims/input-error.ts";
import { appOfPage, breaches, headersPolicy, loadHeaderContract, parseHeaderContract } from "../src/compare/headers-policy.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { SideCapture } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

/** The monorepo's file as it is (tests/security/header-contract.json, 2026-10-23), trimmed of its reasons. */
const MONOREPO = JSON.stringify({
  $comment: "Response headers every Tutors app must send on every response (runway tier M).",
  headers: {
    "X-Frame-Options": { equals: "SAMEORIGIN", reason: "clickjacking" },
    "X-Content-Type-Options": { equals: "nosniff" },
    "Referrer-Policy": { equals: "strict-origin-when-cross-origin" },
    "Permissions-Policy": { matches: "camera=\\(\\).*microphone=\\(\\)" },
    "Strict-Transport-Security": { matches: "max-age=\\d{7,}" },
    "Content-Security-Policy": { matches: "default-src|frame-ancestors" }
  },
  apps: { reader: { paths: ["/"] } }
});
const contract = parseHeaderContract(MONOREPO, "header-contract.json");
const GOOD = { "content-type": "text/html", "x-frame-options": "SAMEORIGIN", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "permissions-policy": "camera=(), microphone=(), geolocation=()", "strict-transport-security": "max-age=31536000; includeSubDomains", "content-security-policy": "default-src 'self'; frame-ancestors 'self'" };
const side = (name: "a" | "b", headers: Record<string, string>, pageKey = "reader:course"): SideCapture => capture(name, { journeys: [journey({ pages: [page({ pageKey, headers })] })] });
const without = (name: string) => Object.fromEntries(Object.entries(GOOD).filter(([k]) => k !== name));

describe("the contract file", () => {
  it("reads the monorepo's format: equals or matches per header, apps ignored", () => {
    expect(contract.headers.map((h) => h.name)).toEqual(["x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy", "strict-transport-security", "content-security-policy"]);
    expect(contract.headers[0]).toMatchObject({ display: "X-Frame-Options", equals: "SAMEORIGIN", reason: "clickjacking" });
  });

  it("refuses what it cannot use, naming each problem: not JSON, both or neither of equals and matches, a bad pattern, an unknown key", () => {
    expect(() => parseHeaderContract("{", "x.json")).toThrow(InputFileError);
    expect(() => parseHeaderContract(JSON.stringify({ headers: { A: { equals: "x", matches: "y" } } }), "x.json")).toThrow(/header A: a header has exactly one of equals or matches/);
    expect(() => parseHeaderContract(JSON.stringify({ headers: { A: {} } }), "x.json")).toThrow(/exactly one/);
    expect(() => parseHeaderContract(JSON.stringify({ headers: { A: { matches: "(" } } }), "x.json")).toThrow(/not a valid regular expression/);
    expect(() => parseHeaderContract(JSON.stringify({ headers: {}, extra: 1 }), "x.json")).toThrow(InputFileError);
    expect(() => loadHeaderContract("/nonexistent/header-contract.json")).toThrow(/no such file/);
  });
});

describe("the engine", () => {
  it("A/A: every header right on both sides is one summary per app, informational", () => {
    const hunks = headersPolicy(side("a", GOOD), side("b", GOOD), contract);
    expect(hunks.map((h) => `${h.scope} ${h.severity}`)).toEqual(["reader/summary info"]);
    expect(hunks[0]!.summary).toBe("reader: headers-policy holds on b: 1 document(s) send all 6 header(s) of header-contract.json");
  });

  it("planted: a missing CSP and a wrong frame option on b are findings, saying whether production has them too", () => {
    const b = side("b", { ...without("content-security-policy"), "x-frame-options": "DENY" });
    const hunks = headersPolicy(side("a", without("content-security-policy")), b, contract);
    expect(hunks.map((h) => h.scope)).toEqual(["reader/x-frame-options", "reader/content-security-policy"]);
    expect(hunks[0]!.summary).toBe('reader: reader:course sends X-Frame-Options "DENY", not "SAMEORIGIN": clickjacking (new on b)');
    expect(hunks[1]!.summary).toBe("reader: reader:course sends no Content-Security-Policy (production too)");
    expect(hunks.every((h) => h.severity === "fail" && h.path === "/course/localhost:8080")).toBe(true);
  });

  it("planted: a session cookie without HttpOnly or SameSite; must not flag one with both, Secure or not, nor another cookie", () => {
    const set = (cookie: string) => breaches({ headers: { ...GOOD, "set-cookie": cookie } }, contract);
    expect([...set("better-auth.session_token=abc; Path=/").entries()]).toEqual([["cookie/better-auth.session_token", "sets the session cookie better-auth.session_token without HttpOnly or SameSite"]]);
    expect([...set("authjs.session-token=abc; Path=/; HttpOnly").values()]).toEqual(["sets the session cookie authjs.session-token without SameSite"]);
    expect(set("authjs.session-token=abc; Path=/; HttpOnly; SameSite=Lax").size).toBe(0);
    expect(set("theme=dark; Path=/\nauthjs.session-token=abc; HttpOnly; SameSite=Lax; Secure").size).toBe(0);
  });

  it("must not flag: a value with other case or space, a stronger matching value, a client-side route change, a page of no app, and no contract at all", () => {
    expect(breaches({ headers: { ...GOOD, "x-frame-options": " sameorigin ", "Strict-Transport-Security": "max-age=63072000" } }, contract).size).toBe(0);
    expect(headersPolicy(side("a", {}), side("b", {}), contract)).toEqual([]);
    expect(headersPolicy(side("a", {}, "replay:x"), side("b", {}, "replay:x"), contract)).toEqual([]);
    expect(headersPolicy(side("a", without("x-frame-options")), side("b", without("x-frame-options")), undefined)).toEqual([]);
    expect(appOfPage("reader-auth:course")).toBe("reader");
    expect(appOfPage("reference:home")).toBe("reader");
    expect(appOfPage("time:home")).toBe("time");
    expect(appOfPage("replay:note")).toBeUndefined();
  });

  it("through a run: informing, so a release that breaks the contract still passes when nothing else moved", () => {
    const dir = mkdtempSync(join(tmpdir(), "harness-headers-policy-"));
    const file = join(dir, "header-contract.json");
    writeFileSync(file, MONOREPO);
    const a = side("a", without("content-security-policy"));
    const r = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: dir, a, b: { ...a, side: "b" }, claims: [], headerContract: loadHeaderContract(file), masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, ranAt: new Date("2026-10-23T09:00:00Z"), log: () => {} }).report;
    expect(r.verdict).toBe("pass");
    expect(r.compare.hunks.filter((h) => h.artefact === "headers-policy")).toMatchObject([{ scope: "reader/content-security-policy", severity: "info", level: "informing" }]);
  });
});
