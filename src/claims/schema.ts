import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";
import { ARTEFACTS, type Claim } from "../types.ts";
import { CLAIMS_VERSION } from "../version.ts";
import { RULE_ID, ruleReason, type Rules } from "./rules.ts";

const RUBBER_STAMP = /^(see pr|approved|all|ok|misc)\b/i;

/**
 * A claim names an artefact, a scope glob and the Rule or changelog entry that
 * justifies the difference. Precise claims are cheap; broad ones need a human.
 *
 * The justification is a `reason` (at least 8 characters, not a rubber stamp) or,
 * since 1.3.0, a `rule: "0031"` that the release's rules file must contain, in
 * which case `reason` is optional free text.
 */
export const ClaimSchema = z
  .object({
    artefact: z.union([z.enum(ARTEFACTS), z.literal("*")]),
    scope: z.string().min(1),
    reason: z.string().optional(),
    approvedBy: z.string().min(1).optional(),
    rule: z
      .string({ error: 'rule is the Rule\'s four digits, quoted: rule: "0031" (unquoted, YAML reads 0031 as the number 31)' })
      .regex(RULE_ID, { message: 'rule is four digits, e.g. "0031"' })
      .optional()
  })
  .superRefine((claim, ctx) => {
    const reason = claim.reason?.trim();
    // With a rule the reason is free text. Without one it is the whole justification, and must say something.
    if (claim.rule !== undefined) return;
    if (!reason) ctx.addIssue({ code: "custom", path: ["reason"], message: 'a claim needs a reason (a Rule or a changelog entry), or a rule: "0031" that the rules file contains' });
    else {
      if (reason.length < 8) ctx.addIssue({ code: "custom", path: ["reason"], message: "a reason is at least 8 characters" });
      if (RUBBER_STAMP.test(reason)) ctx.addIssue({ code: "custom", path: ["reason"], message: "a reason names a Rule or a changelog entry, not a rubber stamp" });
    }
  });

/** `version` is optional and defaults to the current format; a file that names another version is refused. */
export const ClaimsFileSchema = z.object({ version: z.literal(CLAIMS_VERSION).optional(), claims: z.array(ClaimSchema) });

/** A claim that could match anything: every artefact, or a scope that matches every scope. */
export function isBroad(claim: Claim): boolean {
  const scope = claim.scope.trim();
  return claim.artefact === "*" || scope === "*" || scope === "**" || /^\*+\/?\*+$/.test(scope);
}

/**
 * Parse a claims file. `rules` is the release's rules file (`--rules`): a claim that names a rule not in it, or names one
 * when no rules file was given, makes the whole file invalid, before anything starts. Nothing else about the rules is
 * checked: a claim never gates on what a Rule says.
 */
export function parseClaims(text: string, source = "claims", rules?: Rules): Claim[] {
  const parsed = ClaimsFileSchema.safeParse(parse(text) ?? { claims: [] });
  if (!parsed.success) {
    throw new Error(`${source} is not a valid claims file:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  const problems: string[] = [];
  const claims = parsed.data.claims.map((c, i) => {
    const claim: Claim = { artefact: c.artefact, scope: c.scope, reason: c.reason?.trim() ?? "" };
    if (c.approvedBy) claim.approvedBy = c.approvedBy;
    if (c.rule !== undefined) {
      const entry = rules?.rules[c.rule];
      if (!rules) problems.push(`  claims.${i}.rule: rule "${c.rule}" was named, but no rules file was given: pass --rules <path|url> (in the release dispatch, rules_url), or give a reason instead`);
      else if (!entry) problems.push(`  claims.${i}.rule: rule "${c.rule}" is not in the rules file ${rules.source}`);
      else {
        claim.rule = c.rule;
        claim.ruleTitle = entry.title;
        if (!claim.reason) claim.reason = ruleReason(c.rule, entry.title);
      }
    }
    return claim;
  });
  if (problems.length) throw new Error(`${source} is not a valid claims file:\n${problems.join("\n")}`);
  return claims;
}

export function loadClaims(path: string, rules?: Rules): Claim[] {
  return parseClaims(readFileSync(path, "utf8"), path, rules);
}
