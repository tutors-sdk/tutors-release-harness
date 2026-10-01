/**
 * Claims owed (since 1.20.2): one draft claim per cause of a forecast (src/report/causes.ts), in the shape of the
 * monorepo's release/claims.yaml, scope already narrowed, so the claim a maintainer writes starts from the differences
 * it has to cover and not from jq. Rule 0220's sbom claim was written by hand from a jq query over 696 hunks.
 *
 * A draft names the cause's artefact and the narrowest scope glob that covers every difference of the cause, checked with
 * the claims matcher itself against the run's unclaimed set: a single scope as it is; `app/name` scopes as
 * `{apps}/{names}` or `*\/{names}`; a brace list with a common prefix and suffix taken out; or the plain brace list. Of
 * those that cover the whole cause, the one that takes fewest differences of other causes, then the shortest. Glob characters in a scope are escaped. The draft says how many differences it covers,
 * and any it would also cover from another cause.
 *
 * A draft is not a claim: its `rule` is "????", which the claims schema refuses, so a draft pasted unedited stops the
 * run (exit 2, "rule is four digits") rather than claiming anything. Naming the Rule that intends the difference, or
 * fixing it, is the maintainer's. Nothing that judges reads a draft: it never changes a verdict, the Gate or an exit
 * code.
 */
import { stringify } from "yaml";
import type { Cause } from "../report/causes.ts";
import { causeKey } from "../report/causes.ts";
import type { Hunk } from "../types.ts";
import { matcherFor } from "./matcher.ts";

/** What a draft's `rule` says until a person names the Rule: the schema refuses it, so a draft cannot claim anything. */
export const DRAFT_RULE = "????";

export interface ClaimDraft {
  /** The cause it is for (src/report/causes.ts). */
  cause: string;
  key: string;
  artefact: Cause["artefact"];
  /** The glob, escaped where a scope holds a glob character. */
  scope: string;
  /** The free text beside the rule: what the cause is, where, and the PRs named for it. */
  reason: string;
  /** The cause's differences the scope covers: always all of them. */
  covers: number;
  /** Unclaimed differences of other causes the scope would also take, by the first-match rule of the claims file. */
  alsoCovers: number;
}

/** Escape what picomatch reads as a glob: a scope is matched as a glob, and `{{hash}}` or a comma must stay literal. */
export const globEscape = (s: string) => s.replace(/[\\*?[\]{}()|,]/g, "\\$&").replace(/^!/, "\\!");

const braces = (xs: string[]) => (xs.length === 1 ? xs[0]! : `{${xs.join(",")}}`);

const SEPARATOR = /[/:. _-]/;

/**
 * The longest common prefix and suffix of some strings, cut at a separator (`/`, `:`, `.`, a space, `-`, `_`) so a
 * name is never split ("reader:{course,home}", not "reader:{cours,hom}e"), and never overlapping in the shortest.
 */
function affixes(xs: string[]): [string, string] {
  const first = xs[0] ?? "";
  let p = 0;
  while (p < first.length && xs.every((x) => x[p] === first[p])) p++;
  while (p > 0 && !SEPARATOR.test(first[p - 1]!)) p--;
  const min = Math.min(...xs.map((x) => x.length));
  let q = 0;
  while (q < min - p && xs.every((x) => x[x.length - 1 - q] === first[first.length - 1 - q])) q++;
  while (q > 0 && !SEPARATOR.test(first[first.length - q]!)) q--;
  return [first.slice(0, p), q ? first.slice(first.length - q) : ""];
}

/** The candidate globs for a set of scopes; draftClaims keeps the one that covers least else, then the shortest. */
export function scopeCandidates(scopes: string[]): string[] {
  const s = [...new Set(scopes)].sort();
  if (s.length === 1) return [globEscape(s[0]!)];
  const out: string[] = [];
  if (s.every((x) => x.includes("/"))) {
    const heads = [...new Set(s.map((x) => x.slice(0, x.indexOf("/"))))].sort();
    const tails = [...new Set(s.map((x) => x.slice(x.indexOf("/") + 1)))].sort();
    if (heads.length > 1) out.push(`*/${braces(tails.map(globEscape))}`);
    out.push(`${braces(heads.map(globEscape))}/${braces(tails.map(globEscape))}`);
  }
  const [pre, suf] = affixes(s);
  if (pre || suf) out.push(`${globEscape(pre)}${braces(s.map((x) => globEscape(x.slice(pre.length, x.length - suf.length))))}${globEscape(suf)}`);
  out.push(braces(s.map(globEscape)));
  return out;
}

/** Draft one claim per cause. `unclaimed` is the run's unclaimed set the causes were folded from; `prs` names PRs per cause id. */
export function draftClaims(causes: Cause[], unclaimed: Hunk[], prs: Record<string, string[]> = {}): ClaimDraft[] {
  const byKey = new Map<string, Hunk[]>();
  for (const h of unclaimed) {
    const k = causeKey(h);
    byKey.set(k, [...(byKey.get(k) ?? []), h]);
  }
  return causes.map((c) => {
    const own = byKey.get(c.key) ?? [];
    const others = unclaimed.filter((h) => h.artefact === c.artefact && causeKey(h) !== c.key);
    let best: { scope: string; also: number } | undefined;
    for (const scope of scopeCandidates(own.map((h) => h.scope))) {
      const match = matcherFor({ artefact: c.artefact, scope, reason: "draft" });
      if (!own.every(match)) continue;
      const also = others.filter(match).length;
      if (!best || also < best.also || (also === best.also && scope.length < best.scope.length)) best = { scope, also };
    }
    // The full brace list of escaped scopes always covers every difference of the cause.
    const chosen = best ?? { scope: braces([...new Set(own.map((h) => globEscape(h.scope)))].sort()), also: 0 };
    const where = [c.apps.length ? c.apps.join(", ") : "", c.pages.length ? `${c.pages.length} page${c.pages.length === 1 ? "" : "s"}` : "", c.items.length ? `${c.items.length} ${c.artefact === "sbom" ? "package" : "name"}${c.items.length === 1 ? "" : "s"}` : ""].filter(Boolean).join("; ");
    const named = prs[c.id]?.length ? `; likely ${prs[c.id]!.join(", ")}` : "";
    return { cause: c.id, key: c.key, artefact: c.artefact, scope: chosen.scope, reason: `${c.kind}: ${c.hunks} difference${c.hunks === 1 ? "" : "s"}${where ? ` (${where})` : ""}${named}`, covers: own.length, alsoCovers: chosen.also };
  });
}

/** The drafts as release/claims.yaml list items, each under a comment that says what it covers. Ready to paste under `claims:`. */
export function draftsYaml(drafts: ClaimDraft[]): string {
  return drafts
    .map((d) => {
      const item = stringify([{ artefact: d.artefact, scope: d.scope, rule: DRAFT_RULE, reason: d.reason }], { lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" }).trimEnd();
      const note = `  # ${d.key}: covers its ${d.covers} difference${d.covers === 1 ? "" : "s"}${d.alsoCovers ? `, and ${d.alsoCovers} of another cause` : ""}. Name the Rule that intends it, or fix it.`;
      return `${note}\n${item.replace(/^/gm, "  ")}`;
    })
    .join("\n");
}
