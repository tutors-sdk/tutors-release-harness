/**
 * Claims: known and gaps (since 1.28.1). What a kept forecast's report already says about its claims, brought up to the
 * readiness page so the known side is as visible as the gaps:
 *
 *   claimed      differences a claim in the monorepo's release/claims.yaml covers (the report's "Claimed differences")
 *   unclaimed    failing differences no claim covers, the gaps (the report's "Unclaimed differences"); the Gate's count
 *   coverage     claimed / (claimed + unclaimed), null when there is nothing either side
 *   byArtefact   the two, per artefact (dom, network, console, headers, axe, sbom, ...), with the first difference of each
 *                side so the page can link straight to its row in report.html (`#hunk-<id>`)
 *   owed         the claims owed: one draft per cause of the unclaimed differences (src/claims/draft.ts), the count the
 *                report's "Claims owed" section shows
 *   hygiene      the report's claim hygiene (src/claims/hygiene.ts) and every finding a reviewer should look at twice:
 *                a claim that covers too many differences, a broad claim, one that matched nothing (stale), one past
 *                its lifetime (expired)
 *
 * Pure, and read from the kept report.json only. Informing results stay out of both sides: the page counts them in their
 * own tile. Advisory: nothing here is an input to the Gate, a verdict or an exit code.
 */
import { claimsOwed } from "../ci/report-archive.ts";
import type { RunReport } from "../types.ts";

/** A claim scope longer than this is cut on the page and in readiness.json; the report has it whole. */
export const SCOPE_MAX = 120;

export type ClaimFindingKind = "covers-many-hunks" | "broad-with-approval" | "broad-unapproved" | "stale" | "expired";

export interface ClaimFinding {
  kind: ClaimFindingKind;
  artefact: string;
  /** The claim's scope, cut at SCOPE_MAX characters with an ellipsis. */
  scope: string;
  /** Failing differences it covers, where the report counts them. */
  hunks?: number;
  /** The report.html section that lists it. */
  anchor: string;
}

export interface ArtefactClaims {
  artefact: string;
  claimed: number;
  unclaimed: number;
  /** The first claimed / unclaimed difference of the artefact: its row in report.html is `#hunk-<id>`. */
  firstClaimed?: string;
  firstUnclaimed?: string;
}

export interface ClaimsView {
  claimed: number;
  unclaimed: number;
  /** claimed / (claimed + unclaimed), to three decimals; null when both are 0. */
  coverage: number | null;
  /** Most differences first. */
  byArtefact: ArtefactClaims[];
  /** Claims owed (one draft per cause); null when the report has no unclaimed set to draft from. */
  owed: number | null;
  /** The report's claim hygiene; null when it ran without a claims file. */
  hygiene: { claims: number; claimedHunks: number; hunksPerClaim: number; maxHunksPerClaim: number; threshold: number } | null;
  findings: ClaimFinding[];
  /** Where each side and the drafts sit in the kept report.html. */
  anchors: { claimed: string; unclaimed: string; owed: string | null; hygiene: string | null };
}

const cut = (s: string) => (s.length > SCOPE_MAX ? `${s.slice(0, SCOPE_MAX - 1)}…` : s);

/** True when `v` is at least `min`, both X.Y.Z; an unreadable version is not. */
export function atLeast(v: string, min: string): boolean {
  const p = (s: string) => s.split(/[.-]/).slice(0, 3).map(Number);
  const [a, b] = [p(v), p(min)];
  if (a.length < 3 || a.some((n) => !Number.isFinite(n))) return false;
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i]! > b[i]!;
  return true;
}

/** Claims owed is a section of a forecast's report.html since 1.20.2. */
const OWED_SINCE = "1.20.2";

/** The claims owed: drafted as the report drafts them; null when it cannot be (no unclaimed set, or a malformed one). */
function owedOf(report: Partial<RunReport>): number | null {
  try {
    return claimsOwed(report as RunReport)?.length ?? null;
  } catch {
    return null;
  }
}

/**
 * The claims of a kept report: undefined when it has no comparison to read. `keptBy` is the harness version that kept
 * it (the index entry's), which says which sections its report.html has.
 */
export function claimsView(report: Partial<RunReport> | undefined, keptBy: string): ClaimsView | undefined {
  const c = report?.compare;
  if (!c || !Array.isArray(c.matches) || !Array.isArray(c.unclaimed)) return undefined;
  const per = new Map<string, ArtefactClaims>();
  const row = (a: string) => per.get(a) ?? per.set(a, { artefact: a, claimed: 0, unclaimed: 0 }).get(a)!;
  let claimed = 0;
  for (const m of c.matches) {
    if (!m?.claim || !m.hunk) continue;
    claimed++;
    const r = row(m.hunk.artefact);
    r.claimed++;
    r.firstClaimed ??= m.hunk.id;
  }
  for (const h of c.unclaimed) {
    if (!h) continue;
    const r = row(h.artefact);
    r.unclaimed++;
    r.firstUnclaimed ??= h.id;
  }
  const unclaimed = c.unclaimed.length;
  const total = claimed + unclaimed;
  const byArtefact = [...per.values()].sort((x, y) => y.claimed + y.unclaimed - (x.claimed + x.unclaimed) || x.artefact.localeCompare(y.artefact));

  const owed = owedOf(report);

  const h = report.claimHygiene;
  const findings: ClaimFinding[] = [];
  for (const f of h?.flagged ?? []) for (const kind of f.flags) findings.push({ kind, artefact: f.claim.artefact, scope: cut(f.claim.scope), hunks: f.hunks, anchor: "claim-hygiene" });
  for (const s of c.staleClaims ?? []) findings.push({ kind: "stale", artefact: s.artefact, scope: cut(s.scope), anchor: "stale-claims" });
  for (const s of c.broadUnapproved ?? []) findings.push({ kind: "broad-unapproved", artefact: s.artefact, scope: cut(s.scope), anchor: "broad-claims" });
  for (const l of report.claimLifetimes?.claims ?? []) if (l.state === "expired") findings.push({ kind: "expired", artefact: l.artefact, scope: cut(l.scope), hunks: l.covers, anchor: "claim-lifetimes" });

  return {
    claimed,
    unclaimed,
    coverage: total ? Math.round((claimed / total) * 1000) / 1000 : null,
    byArtefact,
    owed,
    hygiene: h ? { claims: h.claims, claimedHunks: h.claimedHunks, hunksPerClaim: h.hunksPerClaim, maxHunksPerClaim: h.maxHunksPerClaim, threshold: h.threshold } : null,
    findings,
    anchors: { claimed: "differences", unclaimed: report.causes ? "causes" : "differences", owed: owed !== null && atLeast(keptBy, OWED_SINCE) ? "claims-owed" : null, hygiene: h ? "claim-hygiene" : null }
  };
}

/** "77%" of a coverage, or "?" when there is none to give. */
export const coverageWords = (coverage: number | null) => (coverage === null ? "?" : `${Math.floor(coverage * 100)}%`);

/** One sentence: "701 claimed (known), 204 unclaimed (gaps): 77% covered; 18 claims owed." */
export function claimsSentence(v: Pick<ClaimsView, "claimed" | "unclaimed" | "coverage" | "owed">): string {
  return `${v.claimed} claimed (known), ${v.unclaimed} unclaimed (gaps): ${coverageWords(v.coverage)} covered${v.owed === null ? "" : `; ${v.owed} ${v.owed === 1 ? "claim" : "claims"} owed`}.`;
}
