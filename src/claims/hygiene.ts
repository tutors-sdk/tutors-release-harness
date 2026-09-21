import type { ClaimFlag, ClaimHygiene, CompareResult, FlaggedClaim } from "../types.ts";
import { isBroad } from "./schema.ts";

/** A claim that covers more failing hunks than this is flagged for a second look (`--claim-max-hunks`, `HARNESS_CLAIM_MAX_HUNKS`). */
export const DEFAULT_CLAIM_MAX_HUNKS = 10;

/** The threshold from the environment; an unset, non-numeric or non-positive value means the default. */
export function claimMaxHunksFromEnv(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env.HARNESS_CLAIM_MAX_HUNKS);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_CLAIM_MAX_HUNKS;
}

/**
 * How broadly the claims cover, so a claim used as a checkbox is visible.
 *
 * A claim is the statement "this difference is intended", and the rule that
 * keeps it honest is that it is narrow. Two smells: a claim that swallows many
 * hunks (a scope that was widened until the run went green), and a broad claim
 * (`*` artefact, `**` scope) that a human approved: allowed, but routine use of
 * it means claims have become a checkbox. Both are reported, neither gates:
 * what may fail a release is decided by the gate, not by a heuristic.
 *
 * Only claims that were in the file count, and a hunk is covered by at most
 * one claim (the matcher's rule), so the ratio is claimed hunks per claim.
 */
export function claimHygiene(compare: CompareResult, threshold: number = DEFAULT_CLAIM_MAX_HUNKS): ClaimHygiene {
  const covered = new Map<CompareResult["staleClaims"][number], number>();
  for (const m of compare.matches) {
    if (m.claim) covered.set(m.claim, (covered.get(m.claim) ?? 0) + 1);
  }
  const claims = covered.size + compare.staleClaims.length;
  const claimedHunks = [...covered.values()].reduce((sum, n) => sum + n, 0);

  const flagged: FlaggedClaim[] = [];
  for (const [claim, hunks] of covered) {
    const flags: ClaimFlag[] = [];
    if (hunks > threshold) flags.push("covers-many-hunks");
    if (isBroad(claim) && claim.approvedBy) flags.push("broad-with-approval");
    if (flags.length) flagged.push({ claim, hunks, flags });
  }
  flagged.sort((a, b) => b.hunks - a.hunks);

  return {
    claims,
    claimedHunks,
    hunksPerClaim: claims ? Math.round((claimedHunks / claims) * 100) / 100 : 0,
    maxHunksPerClaim: Math.max(0, ...covered.values()),
    threshold,
    flagged
  };
}
