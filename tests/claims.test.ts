import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { isBroad, parseClaims } from "../src/claims/schema.ts";
import type { Hunk } from "../src/types.ts";

const hunk = (over: Partial<Hunk>): Hunk => ({ id: "x", artefact: "dom", scope: "reader:lab-step", path: "/lab/localhost:8080/unit-1/topic-01/book-lab-01", summary: "s", severity: "fail", ...over });

describe("claims schema", () => {
  it("parses the documented shape", () => {
    const claims = parseClaims(`claims:\n  - artefact: dom\n    scope: "/course/*/lab/*"\n    reason: "Rule 0031: lab steps shall show estimated reading time"\n`);
    expect(claims).toEqual([{ artefact: "dom", scope: "/course/*/lab/*", reason: "Rule 0031: lab steps shall show estimated reading time" }]);
  });

  it("rejects rubber-stamp reasons (negative fixture)", () => {
    expect(() => parseClaims(`claims:\n  - artefact: dom\n    scope: "*"\n    reason: "see PR"\n`)).toThrow(/rubber stamp/);
    expect(() => parseClaims(`claims:\n  - artefact: dom\n    scope: "*"\n    reason: "approved: all"\n`)).toThrow(/rubber stamp/);
  });

  it("rejects unknown artefacts (negative fixture)", () => {
    expect(() => parseClaims(`claims:\n  - artefact: vibes\n    scope: "*"\n    reason: "Rule 0001: something"\n`)).toThrow(/claims file/);
  });

  it("knows a broad claim when it sees one", () => {
    expect(isBroad({ artefact: "*", scope: "reader:home", reason: "r" })).toBe(true);
    expect(isBroad({ artefact: "dom", scope: "**", reason: "r" })).toBe(true);
    expect(isBroad({ artefact: "dom", scope: "reader:*", reason: "r" })).toBe(false);
  });
});

describe("matcher", () => {
  it("assigns a hunk to the first matching claim by scope", () => {
    const h = hunk({});
    const result = matchClaims([h], [{ artefact: "dom", scope: "reader:lab*", reason: "Rule 0031: x" }]);
    expect(result.unclaimed).toEqual([]);
    expect(result.matches[0]!.claim?.reason).toBe("Rule 0031: x");
    expect(result.staleClaims).toEqual([]);
  });

  it("matches a route glob against the hunk's path", () => {
    const result = matchClaims([hunk({})], [{ artefact: "dom", scope: "/lab/**", reason: "Rule 0031: x" }]);
    expect(result.unclaimed).toEqual([]);
  });

  it("does not let a claim for one artefact cover another", () => {
    const result = matchClaims([hunk({ artefact: "headers", scope: "reader:lab-step/x-frame-options" })], [{ artefact: "dom", scope: "reader:*", reason: "Rule 0031: x" }]);
    expect(result.unclaimed).toHaveLength(1);
    expect(result.staleClaims).toHaveLength(1);
  });

  it("a page-level claim covers that page's header hunks", () => {
    const result = matchClaims([hunk({ artefact: "headers", scope: "reader:lab-step/x-frame-options" })], [{ artefact: "headers", scope: "reader:lab-step", reason: "fix(reader): #270 frame options" }]);
    expect(result.unclaimed).toEqual([]);
  });

  it("matches network scopes with spaces", () => {
    const result = matchClaims([hunk({ artefact: "network", scope: "GET /api/presence" })], [{ artefact: "network", scope: "GET /api/presence", reason: "Rule 0044: presence polled every 15s" }]);
    expect(result.unclaimed).toEqual([]);
  });

  it("info hunks never need a claim", () => {
    const result = matchClaims([hunk({ severity: "info" })], []);
    expect(result.unclaimed).toEqual([]);
  });

  it("reports stale claims and broad unapproved claims", () => {
    const result = matchClaims([hunk({})], [
      { artefact: "network", scope: "GET /nothing", reason: "Rule 0002: stale" },
      { artefact: "*", scope: "**", reason: "Rule 0003: everything" }
    ]);
    expect(result.unclaimed).toEqual([]); // the broad claim swallowed the hunk...
    expect(result.broadUnapproved).toHaveLength(1); // ...but is refused without approval
    expect(result.staleClaims.map((c) => c.scope)).toEqual(["GET /nothing"]);
  });
});
