import picomatch from "picomatch";
import type { Claim, ClaimMatch, CompareResult, Hunk } from "../types.ts";
import { isBroad } from "./schema.ts";

export function matcherFor(claim: Claim): (hunk: Hunk) => boolean {
  const isMatch = picomatch(claim.scope, { dot: true, nocase: true });
  return (hunk) => {
    if (claim.artefact !== "*" && claim.artefact !== hunk.artefact) return false;
    if (isMatch(hunk.scope)) return true;
    if (hunk.path && isMatch(hunk.path)) return true;
    // "reader:lab-step" claims should also cover "reader:lab-step/x-frame-options".
    const head = hunk.scope.split("/")[0]!;
    return head !== hunk.scope && isMatch(head);
  };
}

/**
 * Assign every failing hunk to at most one claim (the first that matches, in
 * file order). Unclaimed failing hunks are what gate a release; claims that
 * match nothing are stale; broad claims without an approver are refused.
 * Info hunks never need a claim, but since 1.15.0 one that a claim names is
 * recorded as matching it: a fix on b (an axe violation or a console error
 * gone) is a decision, and the claim is where its why is written. Such a claim
 * is used, so it is not stale, and an info hunk is never unclaimed.
 */
export function matchClaims(hunks: Hunk[], claims: Claim[]): CompareResult {
  const matchers = claims.map((claim) => ({ claim, matches: matcherFor(claim), used: false }));
  const matches: ClaimMatch[] = [];
  const unclaimed: Hunk[] = [];

  for (const hunk of hunks) {
    const found = matchers.find((m) => m.matches(hunk));
    if (found) {
      found.used = true;
      matches.push({ hunk, claim: found.claim });
    } else {
      matches.push({ hunk });
      if (hunk.severity === "fail") unclaimed.push(hunk);
    }
  }

  return {
    hunks,
    matches,
    unclaimed,
    staleClaims: matchers.filter((m) => !m.used).map((m) => m.claim),
    broadUnapproved: claims.filter((c) => isBroad(c) && !c.approvedBy)
  };
}
