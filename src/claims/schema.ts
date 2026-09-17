import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";
import { ARTEFACTS, type Claim } from "../types.ts";

/**
 * A claim names an artefact, a scope glob and the Rule or changelog entry that
 * justifies the difference. Precise claims are cheap; broad ones need a human.
 */
export const ClaimSchema = z.object({
  artefact: z.union([z.enum(ARTEFACTS), z.literal("*")]),
  scope: z.string().min(1),
  reason: z
    .string()
    .min(8)
    .refine((r) => !/^(see pr|approved|all|ok|misc)\b/i.test(r.trim()), { message: "a reason names a Rule or a changelog entry, not a rubber stamp" }),
  approvedBy: z.string().min(1).optional()
});

export const ClaimsFileSchema = z.object({ claims: z.array(ClaimSchema) });

/** A claim that could match anything: every artefact, or a scope that matches every scope. */
export function isBroad(claim: Claim): boolean {
  const scope = claim.scope.trim();
  return claim.artefact === "*" || scope === "*" || scope === "**" || /^\*+\/?\*+$/.test(scope);
}

export function parseClaims(text: string, source = "claims"): Claim[] {
  const parsed = ClaimsFileSchema.safeParse(parse(text) ?? { claims: [] });
  if (!parsed.success) {
    throw new Error(`${source} is not a valid claims file:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  return parsed.data.claims.map((c) => {
    const claim: Claim = { artefact: c.artefact, scope: c.scope, reason: c.reason };
    if (c.approvedBy) claim.approvedBy = c.approvedBy;
    return claim;
  });
}

export function loadClaims(path: string): Claim[] {
  return parseClaims(readFileSync(path, "utf8"), path);
}
