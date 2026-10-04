/**
 * Claims: known and gaps (since 1.28.1). The readiness page shows the known side (claimed differences) beside the gaps
 * (unclaimed), per artefact, with the claims owed and the claim-hygiene findings, read from the kept report.json and
 * linked to its sections. Advisory: nothing here reaches a verdict.
 */
import { describe, expect, it } from "vitest";
import { atLeast, claimsSentence, claimsView, coverageWords, SCOPE_MAX } from "../src/readiness/claims.ts";
import { buildReadiness, type KeptForecast } from "../src/readiness/model.ts";
import { renderReadiness } from "../src/readiness/render.ts";
import type { Claim, Hunk, RunReport } from "../src/types.ts";

const NOW = new Date("2026-10-04T12:00:00Z");
const hunk = (artefact: string, n: number, severity: Hunk["severity"] = "fail"): Hunk => ({ id: `${artefact}:reader:home:${n}`, artefact: artefact as Hunk["artefact"], scope: `reader:${artefact}${n}`, summary: `${artefact} ${n} moved`, severity });
const claim = (artefact: string, scope: string, o: Partial<Claim> = {}): Claim => ({ artefact: artefact as Claim["artefact"], scope, reason: "intended", ...o });

function report(): Partial<RunReport> {
  const sbomClaim = claim("sbom", `*/{${"pkg,".repeat(80)}last}`);
  const axeClaim = claim("axe", "reader:*");
  const claimed = [hunk("sbom", 1), hunk("sbom", 2), hunk("sbom", 3), hunk("axe", 1, "info")];
  const unclaimed = [hunk("network", 1), hunk("network", 2), hunk("dom", 1), hunk("sbom", 4)];
  return {
    sides: { a: { reader: "q/r:16.2.2" }, b: { reader: "q/r:sha-4993e86" } } as RunReport["sides"],
    compare: {
      hunks: [...claimed, ...unclaimed],
      matches: [...claimed.slice(0, 3).map((h) => ({ hunk: h, claim: sbomClaim })), { hunk: claimed[3]!, claim: axeClaim }, ...unclaimed.map((h) => ({ hunk: h }))],
      unclaimed,
      staleClaims: [claim("console", "reader:gone")],
      broadUnapproved: [claim("*", "**")]
    },
    claimHygiene: { claims: 3, claimedHunks: 3, hunksPerClaim: 1, maxHunksPerClaim: 3, threshold: 2, flagged: [{ claim: sbomClaim, hunks: 3, flags: ["covers-many-hunks"] }] },
    claimLifetimes: { level: "informing", claims: [{ artefact: "headers", scope: "reader:/", until: "2026-09-01", state: "expired", why: "past 2026-09-01", covers: 2 }] }
  };
}

describe("claimsView", () => {
  it("counts the known side and the gaps per artefact, most first, with the first row of each to link to", () => {
    const v = claimsView(report(), "1.28.0")!;
    expect(v).toMatchObject({ claimed: 4, unclaimed: 4, coverage: 0.5 });
    expect(v.byArtefact).toEqual([
      { artefact: "sbom", claimed: 3, unclaimed: 1, firstClaimed: "sbom:reader:home:1", firstUnclaimed: "sbom:reader:home:4" },
      { artefact: "network", claimed: 0, unclaimed: 2, firstUnclaimed: "network:reader:home:1" },
      { artefact: "axe", claimed: 1, unclaimed: 0, firstClaimed: "axe:reader:home:1" },
      { artefact: "dom", claimed: 0, unclaimed: 1, firstUnclaimed: "dom:reader:home:1" }
    ]);
    expect(v.hygiene).toEqual({ claims: 3, claimedHunks: 3, hunksPerClaim: 1, maxHunksPerClaim: 3, threshold: 2 });
  });

  it("lists every claim a reviewer should look at twice: too broad, stale, broad without approval, expired", () => {
    const v = claimsView(report(), "1.28.0")!;
    expect(v.findings.map((f) => [f.kind, f.artefact, f.anchor, f.hunks])).toEqual([
      ["covers-many-hunks", "sbom", "claim-hygiene", 3],
      ["stale", "console", "stale-claims", undefined],
      ["broad-unapproved", "*", "broad-claims", undefined],
      ["expired", "headers", "claim-lifetimes", 2]
    ]);
    // a long scope is cut on the page; the report has it whole
    expect(v.findings[0]!.scope).toHaveLength(SCOPE_MAX);
    expect(v.findings[0]!.scope.endsWith("…")).toBe(true);
  });

  it("drafts the claims owed, one per cause, and links them only where the kept report has the section", () => {
    const r = report();
    const v = claimsView(r, "1.28.0")!;
    expect(v.owed).toBeGreaterThan(0);
    expect(v.anchors).toEqual({ claimed: "differences", unclaimed: "differences", owed: "claims-owed", hygiene: "claim-hygiene" });
    expect(claimsView(r, "1.20.1")!.anchors.owed).toBeNull();
    expect(claimsView({ ...r, causes: { causes: [] } as unknown as NonNullable<RunReport["causes"]> }, "1.28.0")!.anchors.unclaimed).toBe("causes");
    const bare = claimsView({ compare: { hunks: [], matches: [], unclaimed: [], staleClaims: [], broadUnapproved: [] } }, "1.13.2")!;
    expect(bare).toMatchObject({ claimed: 0, unclaimed: 0, coverage: null, owed: 0, hygiene: null, findings: [] });
    expect(bare.anchors.hygiene).toBeNull();
    expect(claimsView({}, "1.28.0")).toBeUndefined();
    expect(claimsView({ compare: { matches: "x" } as unknown as RunReport["compare"] }, "1.28.0")).toBeUndefined();
  });

  it("says coverage in words, rounding down so a gap never reads as 100%", () => {
    expect(coverageWords(0.999)).toBe("99%");
    expect(coverageWords(1)).toBe("100%");
    expect(coverageWords(null)).toBe("?");
    expect(claimsSentence({ claimed: 701, unclaimed: 204, coverage: 0.775, owed: 18 })).toBe("701 claimed (known), 204 unclaimed (gaps): 77% covered; 18 claims owed.");
    expect(claimsSentence({ claimed: 1, unclaimed: 0, coverage: 1, owed: 1 })).toBe("1 claimed (known), 0 unclaimed (gaps): 100% covered; 1 claim owed.");
    expect(claimsSentence({ claimed: 0, unclaimed: 0, coverage: null, owed: null })).toBe("0 claimed (known), 0 unclaimed (gaps): ? covered.");
    expect(atLeast("1.28.1", "1.20.2")).toBe(true);
    expect(atLeast("1.20.2", "1.20.2")).toBe(true);
    expect(atLeast("1.20.1", "1.20.2")).toBe(false);
    expect(atLeast("1.9.0", "1.20.2")).toBe(false);
    expect(atLeast("2.0.0", "1.20.2")).toBe(true);
    expect(atLeast("", "1.20.2")).toBe(false);
    expect(atLeast("x.y.z", "1.20.2")).toBe(false);
  });
});

describe("the readiness page's claims", () => {
  const kept = (ranAt: string, o: Partial<KeptForecast> = {}): KeptForecast => ({
    id: `${ranAt.replace(/[:.]/g, "-")}-release`,
    ranAt,
    verdict: "fail",
    harnessVersion: "1.28.0",
    sides: { a: { reader: "q/r:16.2.2" }, b: { reader: "q/r:sha-4993e86" } },
    gate: "FAIL",
    files: [`${ranAt.replace(/[:.]/g, "-")}-release/report.html`],
    unclaimed: 4,
    ...o
  });

  it("fills claimed and coverage on each forecast, and draws the panel for the latest with its links into the report", () => {
    const r = buildReadiness({ now: NOW, harness: "1.28.1", forecasts: [kept("2026-10-03T08:27:00Z", { claims: claimsView(report(), "1.28.0")! }), kept("2026-09-28T08:00:00Z")], workflowRuns: [], github: "read" });
    const [latest, old] = r.nights.flatMap((n) => n.forecasts);
    expect(latest).toMatchObject({ claimed: 4, unclaimed: 4, coverage: 0.5 });
    expect(old).toMatchObject({ claimed: null, coverage: null });
    expect(old!.claims).toBeUndefined();
    const html = renderReadiness(r);
    const panel = html.slice(html.indexOf('<section class="claims"'), html.indexOf("</section>", html.indexOf('<section class="claims"')));
    const rep = "main-preview/reports/2026-10-03T08-27-00Z-release/report.html";
    expect(panel).toContain("Claims: known and gaps");
    expect(panel).toContain("4 claimed (known), 4 unclaimed (gaps): 50% covered;");
    expect(panel).toContain(`<a href="${rep}#differences">in the report</a>`);
    expect(panel).toContain(`<a href="${rep}#claims-owed">the drafts</a>`);
    expect(panel).toContain(`<a href="${rep}#hunk-sbom:reader:home:1">3</a>`);
    expect(panel).toContain(`<strong class="gap"><a href="${rep}#hunk-network:reader:home:1">2</a></strong>`);
    expect(panel).toContain(`<a href="${rep}#stale-claims">in the report</a>`);
    expect(panel).toContain("too broad: covers many differences");
    expect(panel).toContain("expired: past its lifetime");
    expect(panel).toContain("broad claim without approval");
    expect(panel).toContain('aria-label="sbom: 3 claimed, 1 unclaimed"');
    // the night table: a Claimed and a Coverage column, "?" where the report was not read, "as then" when unchanged
    expect(html).toContain("<th>Unclaimed</th><th>Claimed</th><th>Coverage</th>");
    expect(html).toContain('<td data-k="Claimed" class="num"><span class="v">4</span></td>');
    expect(html).toContain('<td data-k="Coverage" class="num"><span class="v"><span class="cov" title="4 claimed of 8: the known side">50%</span></span></td>');
    expect(html).toContain('<td data-k="Claimed" class="num"><span class="v"><span class="muted">?</span></span></td>');
    expect(html).toContain('<a href="#claims">claims</a>');
    // the panel comes before the control chart, near the top
    expect(html.indexOf('id="claims"')).toBeLessThan(html.indexOf('id="control"'));
  });

  it("says so when there is no forecast, or none it could read", () => {
    const none = renderReadiness(buildReadiness({ now: NOW, harness: "1.28.1", forecasts: [], workflowRuns: [], github: "read" }));
    expect(none).toContain("No forecast kept in the last 10 nights, so nothing to count.");
    const unread = renderReadiness(buildReadiness({ now: NOW, harness: "1.28.1", forecasts: [kept("2026-10-03T08:27:00Z")], workflowRuns: [], github: "read" }));
    expect(unread).toContain("kept no report.json the page could read, so its claims are not counted.");
    const clean = claimsView({ compare: { hunks: [], matches: [], unclaimed: [], staleClaims: [], broadUnapproved: [] } }, "1.28.0")!;
    const empty = renderReadiness(buildReadiness({ now: NOW, harness: "1.28.1", forecasts: [kept("2026-10-03T08:27:00Z", { unclaimed: 0, claims: clean })], workflowRuns: [], github: "read" }));
    expect(empty).toContain("No difference either side.");
    expect(empty).toContain("The forecast ran without a claims file: no claim to judge.");
    expect(empty).toContain("none: every difference is claimed");
    expect(empty).toContain('<span class="cbar empty"');
  });
});
