/**
 * Claims with a lifetime (since 1.25.1, runway improvement E): `until` (a date or a release) and `digests` (the images a
 * claim was written against). Informing until 2.0: an expired claim still covers and is reported with what it covers;
 * blocking leaves it out before matching. A claim with neither is exactly the claim it was.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CLAIM_LIFETIME_LEVEL, claimLifetimes, claimsInForce, lifetimeContext, lifetimeOf, lifetimesLine, versionOf, type LifetimeContext } from "../src/claims/lifetime.ts";
import { matchClaims } from "../src/claims/matcher.ts";
import { parseClaims } from "../src/claims/schema.ts";
import { InputFileError } from "../src/claims/input-error.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { renderHtml } from "../src/report/html.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { Claim, Hunk } from "../src/types.ts";
import { manifest, staticSide, vulns, withStatic } from "./support/image-static.ts";

const D = (c: string) => `sha256:${c.repeat(64)}`;
const ctx = (o: Partial<LifetimeContext> = {}): LifetimeContext => ({ ranAt: new Date("2026-10-10T09:00:00Z"), a: "quay.io/t/tutors-reader:16.2.2", b: "quay.io/t/tutors-reader:16.3.0", bDigests: { reader: D("a"), live: D("b") }, ...o });

describe("parsing until and digests", () => {
  it("accepts a date (YAML 1.2 keeps an unquoted one as text), a release with or without v, and digests by app", () => {
    const [c1, c2, c3] = parseClaims(`claims:
  - { artefact: dom, scope: "reader:*", reason: "fix(reader): #313 Paper rebuild", until: 2026-11-30 }
  - { artefact: dom, scope: "reader:*", reason: "fix(reader): #313 Paper rebuild", until: "v16.3.0" }
  - { artefact: sbom, scope: "reader/*", reason: "chore(deps): #143 slimmer image", digests: { reader: "${D("a")}" } }
`);
    expect(c1!.until).toBe("2026-11-30");
    expect(c2!.until).toBe("v16.3.0");
    expect(c3!.digests).toEqual({ reader: D("a") });
    expect(c1!.digests).toBeUndefined();
  });

  it("a claim without either is exactly the claim it was", () => {
    expect(parseClaims(`claims:\n  - { artefact: dom, scope: "reader:*", reason: "fix(reader): #313 Paper rebuild" }\n`)).toEqual([{ artefact: "dom", scope: "reader:*", reason: "fix(reader): #313 Paper rebuild" }]);
  });

  it("refuses an impossible date, a bad until, an unknown app and a short digest, all at once", () => {
    const text = `claims:
  - { artefact: dom, scope: "a", reason: "fix(reader): #1 thing", until: 2026-02-30 }
  - { artefact: dom, scope: "a", reason: "fix(reader): #1 thing", until: "next week" }
  - { artefact: dom, scope: "a", reason: "fix(reader): #1 thing", digests: { web: "${D("a")}" } }
  - { artefact: dom, scope: "a", reason: "fix(reader): #1 thing", digests: { reader: "sha256:abc" } }
  - { artefact: image-hardening, scope: "reader/healthcheck", reason: "fix(image): #400 healthcheck coming", until: "16.3.0" }
`;
    let err: unknown;
    try {
      parseClaims(text, "claims.yaml");
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(InputFileError);
    const m = (err as Error).message;
    expect(m).toContain("claim 1 of 5 (claims.0), until");
    expect(m).toContain('until is a date, "YYYY-MM-DD", or a release, "X.Y.Z"');
    expect(m).toContain("digests are keyed by app (reader, catalogue, live, time), not web");
    expect(m).toContain("a digest is sha256: and 64 hex characters");
    expect(m).not.toContain("claim 5 of 5");
  });
});

describe("when a claim has expired", () => {
  it("a date: after that UTC day, not on it", () => {
    expect(lifetimeOf({ until: "2026-10-10" }, ctx()).state).toBe("live");
    expect(lifetimeOf({ until: "2026-10-09" }, ctx())).toEqual({ state: "expired", why: "until 2026-10-09, and this run is on 2026-10-10" });
  });

  it("a release: covers that candidate and its rcs; expired for a later candidate, or once production has reached it", () => {
    expect(lifetimeOf({ until: "16.3.0" }, ctx()).state).toBe("live");
    expect(lifetimeOf({ until: "16.3.0" }, ctx({ b: "r:16.3.0-rc.2" })).state).toBe("live");
    expect(lifetimeOf({ until: "16.3.0" }, ctx({ b: "r:16.3.1" }))).toEqual({ state: "expired", why: "until 16.3.0, and the candidate is 16.3.1" });
    // a forecast: side b is sha-<short>, so production decides
    expect(lifetimeOf({ until: "v16.3.0" }, ctx({ b: "r:sha-90cb998" })).state).toBe("live");
    expect(lifetimeOf({ until: "16.3.0" }, ctx({ a: "r:16.3.0", b: "r:sha-90cb998" }))).toEqual({ state: "expired", why: "until 16.3.0, and production is already 16.3.0" });
    expect(versionOf("sha-1234567")).toBeUndefined();
    expect(versionOf("v16.3.0-rc.1")).toEqual([16, 3, 0]);
  });

  it("digests: every named app must be b's, and an image with no registry digest is not", () => {
    expect(lifetimeOf({ digests: { reader: D("a"), live: D("b") } }, ctx())).toEqual({ state: "live", why: "b's images are the reader, live it was written against" });
    expect(lifetimeOf({ digests: { reader: D("c") } }, ctx())).toEqual({ state: "expired", why: `written against reader ${"c".repeat(12)}, and b's reader is ${"a".repeat(12)}` });
    expect(lifetimeOf({ digests: { time: D("a") } }, ctx()).why).toContain("b's time has no registry digest");
    expect(lifetimeOf({ until: "16.3.1", digests: { reader: D("a") } }, ctx()).state).toBe("live");
  });

  it("reads the context from the sides: both reader tags and b's digests", () => {
    const c = lifetimeContext(new Date(0), { images: { reader: "r:16.2.2" } }, { images: { reader: "r:16.3.0" }, provenance: { images: { reader: { ref: "r", provenance: "pulled+verified", digest: D("a") }, live: { ref: "l", provenance: "local" } } } });
    expect(c).toEqual({ ranAt: new Date(0), a: "r:16.2.2", b: "r:16.3.0", bDigests: { reader: D("a"), live: undefined } });
  });
});

describe("informing, then blocking", () => {
  const hunks: Hunk[] = [
    { id: "1", artefact: "dom", scope: "reader:home", summary: "x", severity: "fail" },
    { id: "2", artefact: "dom", scope: "reader:course", summary: "y", severity: "fail" }
  ];
  const old: Claim = { artefact: "dom", scope: "reader:*", reason: "fix(reader): #313 Paper rebuild", until: "16.2.2" };
  const forever: Claim = { artefact: "dom", scope: "reader:course", reason: "fix(reader): #400 course page" };

  it("ships informing: an expired claim still covers, and is reported with what it covers", () => {
    expect(CLAIM_LIFETIME_LEVEL).toBe("informing");
    const claims = claimsInForce([old, forever], ctx());
    const compare = matchClaims(hunks, claims);
    expect(compare.unclaimed).toEqual([]);
    const l = claimLifetimes([old, forever], compare.matches, ctx());
    expect(l).toEqual([{ artefact: "dom", scope: "reader:*", until: "16.2.2", state: "expired", why: "until 16.2.2, and the candidate is 16.3.0", covers: 2 }]);
    expect(lifetimesLine({ level: "informing", claims: l })).toBe("1 of 1 claim(s) with a lifetime have expired; they still cover 2 failing difference(s), which would be unclaimed once claim lifetimes block (2.0). Informing: the verdict is unchanged.");
  });

  it("blocking (2.0) leaves an expired claim out before matching: what it covered is unclaimed, and the claim is stale", () => {
    const compare = matchClaims(hunks, claimsInForce([old, forever], ctx(), "blocking"));
    expect(compare.unclaimed.map((h) => h.id)).toEqual(["1"]);
    expect(lifetimesLine({ level: "blocking", claims: claimLifetimes([old], compare.matches, ctx()) })).toBe("1 of 1 claim(s) with a lifetime have expired and cover nothing (stale).");
    expect(claimsInForce([{ ...old, until: "16.4.0" }], ctx(), "blocking")).toHaveLength(1);
  });

  it("a whole run: the verdict is what it was, and report.json, report.html and report.md carry the lifetimes", () => {
    const side = (name: "a" | "b") => withStatic(name, staticSide({ manifest: manifest({ healthcheck: "CMD x", secretEnv: [], secretHistory: [] }), vulns: vulns({}) }));
    const a = side("a");
    const b = { ...side("b"), images: { ...side("b").images, reader: "quay.io/t/tutors-reader:16.3.1" } };
    const claims: Claim[] = [{ artefact: "dom", scope: "nothing-here", reason: "fix(reader): #313 Paper rebuild", until: "16.3.0" }];
    const run = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-life-")), a, b, claims, masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-10T09:00:00.000Z", runs: 1, ranAt: new Date("2026-10-10T09:00:00Z"), log: () => {} }).report;
    const without = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-life-")), a, b, claims: [{ artefact: "dom", scope: "nothing-here", reason: "fix(reader): #313 Paper rebuild" }], masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-10-10T09:00:00.000Z", runs: 1, ranAt: new Date("2026-10-10T09:00:00Z"), log: () => {} }).report;
    expect(run.verdict).toBe(without.verdict);
    expect(without.claimLifetimes).toBeUndefined();
    expect(run.claimLifetimes).toEqual({ level: "informing", claims: [{ artefact: "dom", scope: "nothing-here", until: "16.3.0", state: "expired", why: "until 16.3.0, and the candidate is 16.3.1", covers: 0 }] });
    expect(renderHtml(run)).toContain('<li id="claim-lifetimes">1 of 1 claim(s) with a lifetime have expired');
    expect(renderMarkdown(run)).toContain("  - `dom` `nothing-here`: until 16.3.0, and the candidate is 16.3.1 (covers 0)");
  });
});
