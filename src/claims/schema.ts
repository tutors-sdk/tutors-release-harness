import { readFileSync } from "node:fs";
import { parse, YAMLParseError } from "yaml";
import { z } from "zod";
import { ARTEFACTS, type Claim } from "../types.ts";
import { CLAIMS_VERSION } from "../version.ts";
import { InputFileError, didYouMean, inputProblems, nearest, unreadable, type Problem } from "./input-error.ts";
import { RULE_ID, ruleReason, type Rules } from "./rules.ts";

const RUBBER_STAMP = /^(see pr|approved|all|ok|misc)\b/i;

/** The keys a claim has; a key that is close to one of them and is not one is a typo. */
const CLAIM_KEYS = ["artefact", "scope", "reason", "approvedBy", "rule"] as const;

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
    scope: z
      .string({ error: 'scope is the glob of what the claim covers, e.g. "reader:lab-*"; it is missing or is not text' })
      .min(1, { message: 'scope is empty: give the glob of what the claim covers, e.g. "reader:lab-*"' }),
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

const at = (raw: unknown, path: PropertyKey[]): unknown =>
  path.reduce<unknown>((v, k) => (v !== null && typeof v === "object" ? (v as Record<PropertyKey, unknown>)[k] : undefined), raw);

/** A value as the file had it, for a message: text quoted, a number as one (YAML turns an unquoted 0031 into 31). */
const show = (v: unknown): string =>
  typeof v === "string" ? `"${v}"` : typeof v === "number" ? `the number ${v}` : v === undefined || v === null ? "nothing" : `a ${Array.isArray(v) ? "list" : typeof v}`;

const ARTEFACT_HELP = `valid artefacts: ${ARTEFACTS.join(", ")}; or "*" for every artefact`;

/** One zod issue as what it means for a person writing a claims file. */
function claimProblem(issue: z.core.$ZodIssue, raw: unknown): Problem {
  const path = issue.path;
  if (path[0] !== "claims") {
    if (path[0] === "version") {
      return { where: "the file", field: "version", message: `this harness reads claims format ${CLAIMS_VERSION}; the file says ${show(at(raw, path))}`, hints: [`write version: ${CLAIMS_VERSION}, or leave version out`] };
    }
    return { where: "the file", message: `${path.length ? `${path.join(".")}: ` : ""}${issue.message}` };
  }
  if (path.length === 1) {
    const found = at(raw, path);
    const top = raw && typeof raw === "object" ? Object.keys(raw as object).filter((k) => k !== "version") : [];
    return {
      where: "the file",
      field: "claims",
      message: found === undefined ? 'there is no top-level "claims:" list' : `claims must be a list of claims, and the file has ${show(found)}`,
      hints: top.length && found === undefined ? [`found instead: ${top.join(", ")}`, ...didYouMean(top[0]!, ["claims"])] : ['start with "claims:" and put one "- artefact: ..." item under it']
    };
  }
  const index = path[1] as number;
  const total = (at(raw, ["claims"]) as unknown[] | undefined)?.length ?? 0;
  const where = `claim ${index + 1} of ${total} (claims.${index})`;
  const item = at(raw, ["claims", index]);
  if (path.length === 2) return { where, message: `a claim is a mapping of artefact, scope and reason (or rule), and this is ${show(item)}` };
  const field = String(path[2]);
  const value = at(raw, path);
  if (field === "artefact") {
    if (value === undefined) {
      const keys = item && typeof item === "object" ? Object.keys(item as object) : [];
      const typo = keys.find((k) => !(CLAIM_KEYS as readonly string[]).includes(k) && nearest(k, ["artefact"]).length);
      return { where, field, message: "artefact is missing", hints: [ARTEFACT_HELP, ...(typo ? [`the claim has "${typo}": the key is spelled "artefact"`] : [])] };
    }
    return { where, field, message: `${show(value)} is not an artefact`, hints: [ARTEFACT_HELP, ...(typeof value === "string" ? didYouMean(value, [...ARTEFACTS, "*"]) : [])] };
  }
  if (field === "rule" && typeof value === "number") {
    return { where, field, message: `${issue.message}`, hints: [`the file has ${show(value)}; write rule: "${String(value).padStart(4, "0")}"`] };
  }
  if (field === "scope" && value !== undefined && typeof value !== "string") return { where, field, message: issue.message, hints: [`the file has ${show(value)}`] };
  return { where, field, message: issue.message };
}

/**
 * Parse a claims file. `rules` is the release's rules file (`--rules`): a claim that names a rule not in it, or names one
 * when no rules file was given, makes the whole file invalid, before anything starts. Nothing else about the rules is
 * checked: a claim never gates on what a Rule says.
 *
 * A file that cannot be used throws an {@link InputFileError}: the file, the claim, the field, what is wrong and what
 * would be right, for every problem at once, so the CLI prints it and exits 2 (no stack trace).
 */
export function parseClaims(text: string, source = "claims", rules?: Rules): Claim[] {
  let raw: unknown;
  try {
    raw = parse(text) ?? { claims: [] };
  } catch (e) {
    if (e instanceof YAMLParseError) {
      const line = e.linePos ? ` (line ${e.linePos[0].line}, column ${e.linePos[0].col})` : "";
      throw new InputFileError(`${source} is not a valid claims file: it is not valid YAML${line}:${e.message.split("\n")[0]}`);
    }
    throw e;
  }
  const parsed = ClaimsFileSchema.safeParse(raw);
  if (!parsed.success) throw inputProblems("claims file", source, parsed.error.issues.map((i) => claimProblem(i, raw)));
  const problems: Problem[] = [];
  const known = rules ? Object.keys(rules.rules) : [];
  const claims = parsed.data.claims.map((c, i) => {
    const claim: Claim = { artefact: c.artefact, scope: c.scope, reason: c.reason?.trim() ?? "" };
    if (c.approvedBy) claim.approvedBy = c.approvedBy;
    const where = `claim ${i + 1} of ${parsed.data.claims.length} (claims.${i})`;
    if (c.rule !== undefined) {
      const entry = rules?.rules[c.rule];
      if (!rules) {
        problems.push({ where, field: "rule", message: `rule "${c.rule}" was named, but no rules file was given`, hints: ["pass --rules <path|url> (in the release dispatch, rules_url), or give a reason instead"] });
      } else if (!entry) {
        const has = known.length ? `the rules file has: ${known.slice(0, 12).join(", ")}${known.length > 12 ? `, and ${known.length - 12} more` : ""}` : "the rules file has no rules";
        problems.push({ where, field: "rule", message: `rule "${c.rule}" is not in the rules file ${rules.source}`, hints: [has, ...didYouMean(c.rule, known)] });
      } else {
        claim.rule = c.rule;
        claim.ruleTitle = entry.title;
        if (!claim.reason) claim.reason = ruleReason(c.rule, entry.title);
      }
    }
    return claim;
  });
  if (problems.length) throw inputProblems("claims file", source, problems);
  return claims;
}

export function loadClaims(path: string, rules?: Rules): Claim[] {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    throw unreadable("the claims file", path, e);
  }
  return parseClaims(text, path, rules);
}
