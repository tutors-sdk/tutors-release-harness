/**
 * Fixes on b are decisions, not failures. An axe violation or a console error that b no longer has is an info hunk:
 * it never gates. But it is still a behaviour change somebody chose, so the harness asks for the why, and the why is
 * a claim (usually a Rule). A claimed fix is decided: the glance stops asking about it and the A3 shows it as a
 * decision, in orange, beside the traffic lights rather than on them. An unclaimed fix is a decision nobody wrote down.
 *
 * Claiming is the switch: there is no other setting to turn a decision off.
 */
import type { Claim, CompareResult, Hunk } from "../types.ts";
import { matcherFor } from "./matcher.ts";

/** An info hunk that says b fixed something: an axe violation fixed on b, or an error-level console message gone on b. */
export const isFixOnB = (h: Hunk): boolean =>
  h.severity === "info" && ((h.artefact === "console" && /console message gone on b/.test(h.summary) && /^error\b/i.test(h.detail ?? "")) || (h.artefact === "axe" && /axe violation fixed on b/.test(h.summary)));

export interface Decision {
  artefact: Hunk["artefact"];
  scope: string;
  /** The fixes on this page, in report order. */
  hunks: Hunk[];
  /** What was fixed, each name once: the axe rule id, or the console message. */
  what: string[];
  /** The claim that says why; absent while undecided. */
  claim?: Claim;
  /** Failing hunks of the same artefact on the same page: fixed, or only changed? */
  fresh: number;
}

/** A console message as a person would name it: the error of a structured log line, or the line itself. */
function messageOf(detail: string): string {
  const text = detail.replace(/^error:?\s*/i, "");
  try {
    const o = JSON.parse(text) as Record<string, unknown>;
    const m = [o.error, o.reason, o.message].find((x) => typeof x === "string");
    if (m) return m as string;
  } catch {
    // not a structured line: the text is the message
  }
  return text;
}

const nameOf = (h: Hunk) => (h.artefact === "axe" ? h.summary.replace(/^.*fixed on b: /, "").replace(/\s*\(.*$/, "") : messageOf(h.detail ?? h.summary).slice(0, 80));
const uniq = (xs: string[]) => [...new Set(xs)];

/**
 * The fixes on b of one comparison, a decision per page and artefact. The claim is the one the matcher recorded; for a
 * report written before 1.15.0 (when info hunks were never offered to a claim) it is the stale claim that names the
 * hunk, so an older report reads as decided too.
 */
export function decisionsOf(compare: Pick<CompareResult, "hunks" | "matches" | "staleClaims">): Decision[] {
  const hunks = compare.hunks ?? [];
  const stale = (compare.staleClaims ?? []).map((claim) => ({ claim, matches: matcherFor(claim) }));
  const claimOf = (h: Hunk) => compare.matches?.find((m) => m.hunk.id === h.id)?.claim ?? stale.find((s) => s.matches(h))?.claim;
  const groups = new Map<string, Hunk[]>();
  for (const h of hunks.filter(isFixOnB)) groups.set(`${h.artefact} ${h.scope}`, [...(groups.get(`${h.artefact} ${h.scope}`) ?? []), h]);
  return [...groups.values()].map((hs) => {
    const h = hs[0]!;
    const claim = hs.map(claimOf).find((c) => c);
    const fresh = hunks.filter((x) => x.artefact === h.artefact && x.scope === h.scope && x.severity === "fail" && (h.artefact === "axe" || /^error\b/i.test(x.detail ?? ""))).length;
    return { artefact: h.artefact, scope: h.scope, hunks: hs, what: uniq(hs.map(nameOf)), ...(claim ? { claim } : {}), fresh };
  });
}

/** The claims a decision used: not stale, whatever an older report said. */
export const decidingClaims = (ds: Decision[]): Set<Claim> => new Set(ds.flatMap((d) => (d.claim ? [d.claim] : [])));
