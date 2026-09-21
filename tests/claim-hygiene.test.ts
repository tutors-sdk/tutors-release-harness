import { describe, expect, it } from "vitest";
import { DEFAULT_CLAIM_MAX_HUNKS, claimHygiene, claimMaxHunksFromEnv } from "../src/claims/hygiene.ts";
import { matchClaims } from "../src/claims/matcher.ts";
import { parseOverride, recordOverride, exitCodeForReport } from "../src/override.ts";
import { renderHtml, renderMarkdown } from "../src/report/index.ts";
import type { Claim, Hunk, RunReport } from "../src/types.ts";

const hunk = (n: number, scope: string, artefact: Hunk["artefact"] = "dom"): Hunk => ({ id: String(n), artefact, scope, summary: `s${n}`, severity: "fail" });
const many = (count: number, scope: string, artefact: Hunk["artefact"] = "dom") => Array.from({ length: count }, (_, i) => hunk(i, `${scope}${i}`, artefact));

describe("claim hygiene", () => {
  it("reports hunks per claim, including claims that matched nothing", () => {
    const claims: Claim[] = [
      { artefact: "dom", scope: "reader:a*", reason: "Rule 0001: reading time" },
      { artefact: "headers", scope: "reader:*/csp", reason: "Rule 0002: csp host" },
      { artefact: "network", scope: "GET /gone", reason: "Rule 0003: stale" }
    ];
    const h = claimHygiene(matchClaims([hunk(1, "reader:a1"), hunk(2, "reader:a2"), hunk(3, "reader:home/csp", "headers"), hunk(4, "reader:unclaimed")], claims), 10);
    expect(h).toMatchObject({ claims: 3, claimedHunks: 3, hunksPerClaim: 1, maxHunksPerClaim: 2, threshold: 10 });
    expect(h.flagged).toEqual([]);
  });

  it("flags a claim that covers more than N hunks, and only more than N", () => {
    const claims: Claim[] = [{ artefact: "dom", scope: "reader:*", reason: "Rule 0009: everything in reader" }];
    const compare = matchClaims(many(11, "reader:p"), claims);
    expect(claimHygiene(compare, 10).flagged).toEqual([{ claim: claims[0], hunks: 11, flags: ["covers-many-hunks"] }]);
    expect(claimHygiene(compare, 11).flagged).toEqual([]);
    expect(claimHygiene(matchClaims(many(3, "reader:p"), claims), 2).flagged[0]!.hunks).toBe(3);
  });

  it("flags a routine broad claim that a human approved, and a broad claim that covers many hunks gets both flags", () => {
    const broad: Claim = { artefact: "*", scope: "**", reason: "Rule 0099: release-wide", approvedBy: "a-maintainer" };
    const one = claimHygiene(matchClaims([hunk(1, "reader:x")], [broad]), 10);
    expect(one.flagged).toEqual([{ claim: broad, hunks: 1, flags: ["broad-with-approval"] }]);
    const lots = claimHygiene(matchClaims(many(12, "reader:x"), [broad]), 10);
    expect(lots.flagged[0]!.flags).toEqual(["covers-many-hunks", "broad-with-approval"]);
    // an unapproved broad claim is not a hygiene matter: it already gates.
    expect(claimHygiene(matchClaims([hunk(1, "reader:x")], [{ ...broad, approvedBy: "" } as Claim]), 10).flagged).toEqual([]);
  });

  it("with no claims there is nothing to say", () => {
    expect(claimHygiene(matchClaims([hunk(1, "x")], []))).toMatchObject({ claims: 0, claimedHunks: 0, hunksPerClaim: 0, maxHunksPerClaim: 0, threshold: DEFAULT_CLAIM_MAX_HUNKS, flagged: [] });
  });

  it("information hunks are never claimed and never counted", () => {
    const info: Hunk = { ...hunk(1, "reader:x"), severity: "info" };
    expect(claimHygiene(matchClaims([info], [{ artefact: "dom", scope: "reader:*", reason: "Rule 0001: reading time" }])).claimedHunks).toBe(0);
  });

  it("the threshold comes from the environment when it is a positive integer", () => {
    expect(claimMaxHunksFromEnv({})).toBe(10);
    expect(claimMaxHunksFromEnv({ HARNESS_CLAIM_MAX_HUNKS: "25" })).toBe(25);
    for (const bad of ["0", "-3", "x", "2.5", ""]) expect(claimMaxHunksFromEnv({ HARNESS_CLAIM_MAX_HUNKS: bad }), bad).toBe(10);
  });
});

const report = (over: Partial<RunReport> = {}): RunReport => {
  const claims: Claim[] = [{ artefact: "*", scope: "**", reason: "Rule 0099: release-wide", approvedBy: "a-maintainer" }];
  const compare = matchClaims(many(12, "reader:x"), claims);
  return {
    schemaVersion: 1,
    harness: { version: "1.2.0", gitSha: null, contractVersion: "1.2.0" },
    harnessVersion: "1.2.0",
    mode: "release",
    substrate: "compose",
    ranAt: "2026-09-16T09:10:00.000Z",
    now: "2026-09-16T09:05:00.000Z",
    runs: 1,
    sides: { a: { reader: "r:a", catalogue: "c:a", live: "l:a" }, b: { reader: "r:b", catalogue: "c:b", live: "l:b" } },
    verdict: "pass",
    reasons: [],
    compare,
    masksApplied: {},
    claimHygiene: claimHygiene(compare, 10),
    ...over
  };
};

describe("in the PR comment and the html", () => {
  it("the markdown shows the ratio and the flagged claims", () => {
    const md = renderMarkdown(report());
    expect(md).toContain("### Claim hygiene");
    expect(md).toContain("1 claim(s) cover 12 failing hunk(s): 12 hunk(s) per claim");
    expect(md).toContain("covers more than 10 hunks; broad claim, approved by `a-maintainer`");
  });

  it("nothing flagged: one line, no table", () => {
    const compare = matchClaims([hunk(1, "reader:x")], [{ artefact: "dom", scope: "reader:x", reason: "Rule 0001: reading time" }]);
    const md = renderMarkdown(report({ compare, claimHygiene: claimHygiene(compare, 10) }));
    expect(md).toContain("1 claim(s) cover 1 failing hunk(s): 1 hunk(s) per claim");
    expect(md).not.toContain("A claim states that a difference is intended");
  });

  it("no claims file, no section", () => {
    const { claimHygiene: _c, ...rest } = report();
    expect(renderMarkdown(rest as RunReport)).not.toContain("Claim hygiene");
    expect(renderHtml(rest as RunReport)).not.toContain("Claim hygiene");
  });

  it("html carries it too", () => {
    expect(renderHtml(report())).toContain("<h2>Claim hygiene</h2>");
  });
});

describe("override", () => {
  const reason = "Rule 0044: payments hotfix, frame options restored in 16.3.1";

  it("needs a person and a reason that says something, together", () => {
    expect(parseOverride(undefined, undefined)).toBeUndefined();
    expect(parseOverride(reason, "leigh")).toEqual({ reason, by: "leigh" });
    expect(() => parseOverride(reason, undefined)).toThrow(/both/);
    expect(() => parseOverride(undefined, "leigh")).toThrow(/both/);
    expect(() => parseOverride("ok", "leigh")).toThrow(/20 characters/);
    expect(() => parseOverride("lgtm", "leigh")).toThrow(/20 characters/);
    expect(() => parseOverride("   ", "leigh")).toThrow(/both/);
  });

  it("changes the exit code only for a FAIL", () => {
    const at = new Date("2026-09-16T09:10:00.000Z");
    const req = { reason, by: "leigh" };
    expect(exitCodeForReport({ verdict: "fail", override: recordOverride(req, "fail", at) })).toBe(0);
    expect(exitCodeForReport({ verdict: "fail" })).toBe(1);
    expect(exitCodeForReport({ verdict: "warn", override: recordOverride(req, "warn", at) })).toBe(0);
    expect(recordOverride(req, "pass", at)).toEqual({ ...req, verdict: "pass", applied: false, at: at.toISOString() });
  });
});
