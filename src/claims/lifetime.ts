/**
 * Claims with a lifetime (since 1.25.1; runway improvement E, after Conforma's effectiveUntil and imageRef). A claim may
 * carry `until`, the last day (YYYY-MM-DD, UTC) or the last release (X.Y.Z) it is meant for, and `digests`, the images
 * (app -> sha256) it was written against. A claim past its `until`, or judged against other images than its `digests`,
 * is **expired**: it was written for another release and should not quietly cover this one.
 *
 *   until: "2026-11-30"  expired when the run is after that UTC day
 *   until: "16.3.0"      expired when the candidate (side b) is a later release, or production (side a) has reached it:
 *                        written for 16.3.0, it covers the 16.3.0 candidate and its release candidates, and nothing after
 *   digests: { reader: "sha256:..." }
 *                        expired when side b's digest for a named app is another, or b has none (a local build)
 *
 * The lifetime has a level, like an engine (src/compare/levels.ts). It ships **informing**: an expired claim still
 * covers what it matches, and the report lists it with the failing differences it covers, the ones that would be
 * unclaimed once lifetimes block. Blocking (2.0) is the one-line change below: an expired claim is then left out before
 * matching, so it covers nothing and is reported stale. A claim without `until` or `digests` has no lifetime and is
 * exactly the claim it was.
 */
import type { Level } from "../compare/levels.ts";
import type { Claim, ClaimMatch, ImageInfo } from "../types.ts";

/** Informing until 2.0: expired claims are reported, and still cover. */
export const CLAIM_LIFETIME_LEVEL: Level = "informing";

export const UNTIL_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const UNTIL_RELEASE = /^v?(\d+)\.(\d+)\.(\d+)$/;
export const DIGEST = /^sha256:[0-9a-f]{64}$/;

export type LifetimeState = "live" | "expired";

export interface ClaimLifetime {
  artefact: string;
  scope: string;
  until?: string;
  digests?: Record<string, string>;
  state: LifetimeState;
  /** For people: why it is live or expired. */
  why: string;
  /** Failing differences it covers in this run: those that would be unclaimed if lifetimes were blocking. */
  covers: number;
}

export interface LifetimeContext {
  ranAt: Date;
  /** Side a's and side b's reader tags (production and the candidate). */
  a?: string;
  b?: string;
  /** Side b's registry digests by app. */
  bDigests: Record<string, string | undefined>;
}

type Version = [number, number, number];
/** X.Y.Z of a tag such as 16.3.0, v16.3.0 or 16.3.0-rc.2; undefined for anything else (sha-1234567, main). */
export function versionOf(tag: string | undefined): Version | undefined {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/.exec(tag ?? "");
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : undefined;
}
const cmp = (x: Version, y: Version) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
const tagOf = (ref?: string) => (ref ? ref.split("@")[0]!.split(":").pop() : undefined);

/** Is this claim expired on this run, and why. A claim with neither field is live with no lifetime. */
export function lifetimeOf(claim: Pick<Claim, "until" | "digests">, ctx: LifetimeContext): { state: LifetimeState; why: string } {
  const reasons: string[] = [];
  const holds: string[] = [];
  if (claim.until !== undefined) {
    if (UNTIL_DATE.test(claim.until)) {
      const day = ctx.ranAt.toISOString().slice(0, 10);
      if (day > claim.until) reasons.push(`until ${claim.until}, and this run is on ${day}`);
      else holds.push(`until ${claim.until}`);
    } else {
      const until = versionOf(claim.until)!;
      const b = versionOf(tagOf(ctx.b));
      const a = versionOf(tagOf(ctx.a));
      if (b && cmp(b, until) > 0) reasons.push(`until ${claim.until}, and the candidate is ${tagOf(ctx.b)}`);
      else if (a && cmp(a, until) >= 0) reasons.push(`until ${claim.until}, and production is already ${tagOf(ctx.a)}`);
      else holds.push(`until ${claim.until}`);
    }
  }
  if (claim.digests) {
    const before = reasons.length;
    for (const [app, want] of Object.entries(claim.digests)) {
      const got = ctx.bDigests[app];
      if (!got) reasons.push(`written against ${app} ${want.slice(7, 19)}, and b's ${app} has no registry digest`);
      else if (got !== want) reasons.push(`written against ${app} ${want.slice(7, 19)}, and b's ${app} is ${got.slice(7, 19)}`);
    }
    if (reasons.length === before) holds.push(`b's images are the ${Object.keys(claim.digests).join(", ")} it was written against`);
  }
  return reasons.length ? { state: "expired", why: reasons.join("; ") } : { state: "live", why: holds.join("; ") };
}

/** The context of a run: its date, both sides' reader tags and side b's digests. */
export function lifetimeContext(ranAt: Date, a?: { images?: { reader?: string } }, b?: { images?: { reader?: string }; provenance?: { images?: Partial<Record<string, ImageInfo>> } }): LifetimeContext {
  const bDigests: Record<string, string | undefined> = {};
  for (const [app, info] of Object.entries(b?.provenance?.images ?? {})) bDigests[app] = info?.digest;
  return { ranAt, ...(a?.images?.reader ? { a: a.images.reader } : {}), ...(b?.images?.reader ? { b: b.images.reader } : {}), bDigests };
}

const hasLifetime = (c: Claim) => c.until !== undefined || c.digests !== undefined;

/** With lifetimes blocking: the claims that may cover anything on this run (expired ones left out). Informing: all of them. */
export function claimsInForce(claims: Claim[], ctx: LifetimeContext, level: Level = CLAIM_LIFETIME_LEVEL): Claim[] {
  if (level === "informing") return claims;
  return claims.filter((c) => !hasLifetime(c) || lifetimeOf(c, ctx).state === "live");
}

/** Every claim that has a lifetime, live or expired, with the failing differences it covers on this run. */
export function claimLifetimes(claims: Claim[], matches: ClaimMatch[], ctx: LifetimeContext): ClaimLifetime[] {
  return claims.filter(hasLifetime).map((c) => {
    const { state, why } = lifetimeOf(c, ctx);
    const covers = matches.filter((m) => m.claim === c && m.hunk.severity === "fail").length;
    return { artefact: c.artefact, scope: c.scope, ...(c.until !== undefined ? { until: c.until } : {}), ...(c.digests ? { digests: c.digests } : {}), state, why, covers };
  });
}

/** One line for the report: how many claims have a lifetime, how many expired, and what that would leave unclaimed. */
export function lifetimesLine(l: { level: Level; claims: ClaimLifetime[] } | undefined): string {
  if (!l?.claims.length) return "";
  const expired = l.claims.filter((c) => c.state === "expired");
  if (!expired.length) return `${l.claims.length} claim(s) carry a lifetime (until or digests); none has expired.`;
  const covers = expired.reduce((n, c) => n + c.covers, 0);
  return l.level === "informing"
    ? `${expired.length} of ${l.claims.length} claim(s) with a lifetime have expired; they still cover ${covers} failing difference(s), which would be unclaimed once claim lifetimes block (2.0). Informing: the verdict is unchanged.`
    : `${expired.length} of ${l.claims.length} claim(s) with a lifetime have expired and cover nothing (stale).`;
}
