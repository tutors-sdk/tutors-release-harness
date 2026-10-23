import { parse } from "yaml";
import type { Changes } from "../changes/signals.ts";
import type { Traceability } from "./confidence.ts";

/**
 * The score's traceability input built from what a release already has (since 1.56.0; harness hardening plan, E1): the
 * PRs between the two tags (`harness changes`) and the release's claims.yaml (`harness changes --claims`). It is
 * written into changes.json as its `traceability` block, which `harness confidence --change-risk changes.json` reads
 * as --traceability when none is given. The Requirements traceability dimension was never measured on a release
 * because nobody wrote that file by hand.
 *
 *   entries          one per PR whose title is a feature (`feat`) or a fix (`fix`), by its conventional prefix. Chores,
 *                    docs, CI, tests, refactors and dependency bumps are not changelog entries a Rule is owed for
 *     ears           the first EARS file the PR changed (`tests/bdd/features/**.feature`, where the monorepo keeps its
 *                    Rule blocks), else the Rule ids its title cites (`Rule 0573`), else null
 *     claimed        only for a PR that declared an observable change (its CHANGELOG hint, `(axe, dom)`): whether a claim
 *                    names it, by `#<number>` in its reason, or by a Rule id its title cites. A PR that declared nothing
 *                    owes no claim, so it is left unset
 *   untracedClaims   claims whose reason names a PR (`#<number>`) that is not between the two tags
 */

const EARS_FILE = /^tests\/bdd\/features\/.+\.feature$/;
const KIND = /^(feat|fix)(\([^)]*\))?!?:/i;
const PR_REF = /#(\d+)\b/g;
const RULE_REF = /\bRule\s+(\d{4})\b/gi;

export interface ClaimText {
  label: string;
  reason: string;
  rule?: string;
}

/** The claims of a claims.yaml as text: read leniently, since only their words are traced (the release run already validated them). */
export function claimTexts(yamlText: string): ClaimText[] {
  const raw = parse(yamlText) as unknown;
  const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray((raw as { claims?: unknown }).claims) ? (raw as { claims: unknown[] }).claims : [];
  return list.flatMap((c, i) => {
    if (!c || typeof c !== "object") return [];
    const o = c as Record<string, unknown>;
    const reason = typeof o.reason === "string" ? o.reason : "";
    const rule = typeof o.rule === "string" ? o.rule : undefined;
    return [{ label: `${i + 1} (${String(o.artefact ?? "?")} ${String(o.scope ?? "?")})`, reason, ...(rule ? { rule } : {}) }];
  });
}

export function buildTraceability(changes: Pick<Changes, "a" | "b" | "prs">, claims: ClaimText[], evidence = "changes.json and claims.yaml"): Traceability {
  const prs = changes.prs.filter((p) => !p.release);
  const numbers = new Set(prs.flatMap((p) => (p.pr === null ? [] : [p.pr])));
  const claimPrs = claims.map((c) => new Set([...`${c.reason}`.matchAll(PR_REF)].map((m) => Number(m[1]))));
  const claimRules = claims.map((c) => new Set([...(c.rule ? [c.rule] : []), ...[...c.reason.matchAll(RULE_REF)].map((m) => m[1]!)]));
  const entries: Traceability["entries"] = [];
  for (const p of prs) {
    const kind = KIND.exec(p.title)?.[1]?.toLowerCase();
    if (kind !== "feat" && kind !== "fix") continue;
    const titleRules = new Set([...p.title.matchAll(RULE_REF)].map((m) => m[1]!));
    const ears = p.files.find((f) => EARS_FILE.test(f)) ?? (titleRules.size ? `Rule ${[...titleRules].join(", Rule ")} (cited in the title)` : null);
    const named = claims.some((_, i) => (p.pr !== null && claimPrs[i]!.has(p.pr)) || [...titleRules].some((r) => claimRules[i]!.has(r)));
    const label = p.pr !== null ? `#${p.pr} ${p.title}` : `${p.sha.slice(0, 12)} ${p.title}`;
    entries.push({ entry: label.slice(0, 160), kind: kind === "feat" ? "feature" : "fix", ears, ...(p.declares ? { claimed: named } : {}), ...(p.url ? { evidence: p.url } : {}) });
  }
  const untracedClaims = claims.flatMap((c, i) => {
    const refs = [...claimPrs[i]!];
    return refs.length && refs.every((n) => !numbers.has(n)) ? [`${c.label} names ${refs.map((n) => `#${n}`).join(", ")}, not between ${changes.a} and ${changes.b}`] : [];
  });
  return { entries, ...(untracedClaims.length ? { untracedClaims } : {}), evidence };
}
