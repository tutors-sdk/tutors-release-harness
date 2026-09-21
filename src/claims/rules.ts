import { readFileSync } from "node:fs";
import { z } from "zod";
import type { Claim } from "../types.ts";

/**
 * The Rules a claim may name (contract 1.3.0).
 *
 * The monorepo publishes `rules.json` at the candidate tag, and a claim can say
 * `rule: "0031"` instead of pasting the Rule's wording into `reason`. The
 * harness checks one thing about it: that the Rule exists in the file the run
 * was given. It never reads what the Rule says, never judges whether a change
 * is what the Rule intends, and never gates on the file's contents beyond that
 * existence: the title is shown in the report, that is all.
 *
 *   { "version": 1, "rules": { "0031": { "title": "Lab steps show estimated reading time", "digest": "…" } } }
 */
export const RULES_VERSION = 1;

/** A Rule is named by four digits, as the monorepo numbers them. */
export const RULE_ID = /^\d{4}$/;

export const RulesFileSchema = z.object({
  version: z.literal(RULES_VERSION),
  rules: z
    .record(
      z.string(),
      // Unknown keys of a rule are ignored, so the monorepo can add to what it publishes without breaking a run.
      z.object({ title: z.string().trim().min(1, { message: "a rule needs a title" }), digest: z.string().min(1).optional() })
    )
    .superRefine((rules, ctx) => {
      for (const id of Object.keys(rules)) if (!RULE_ID.test(id)) ctx.addIssue({ code: "custom", path: [id], message: `"${id}" is not a rule id: a rule is named by four digits, e.g. "0031"` });
    })
});

export interface Rules {
  /** Where the rules came from (a path or a URL), for messages. */
  source: string;
  rules: Record<string, { title: string; digest?: string | undefined }>;
}

export function parseRules(text: string, source = "rules.json"): Rules {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(`${source} is not valid JSON`);
  }
  const parsed = RulesFileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`${source} is not a valid rules file:\n${parsed.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n")}`);
  }
  return { source, rules: parsed.data.rules };
}

export type FetchText = (url: string) => Promise<{ status: number; text: string }>;

const realFetch: FetchText = async (url) => {
  // Anonymous, like `curl` of claims_url: the runner holds no credential for the monorepo.
  const response = await fetch(url, { redirect: "follow", credentials: "omit", signal: AbortSignal.timeout(30_000) });
  return { status: response.status, text: await response.text() };
};

/** `--rules` names a URL when it starts with http:// or https://; anything else is a path. */
export const isUrl = (where: string) => /^https?:\/\//i.test(where);

/** `--rules <path|url>`: a file, or an http(s) URL the runner can GET without credentials. Throws with the reason; the run exits 2 before any stack starts. */
export async function loadRules(where: string, fetchText: FetchText = realFetch): Promise<Rules> {
  if (!isUrl(where)) return parseRules(readFileSync(where, "utf8"), where);
  let got: { status: number; text: string };
  try {
    got = await fetchText(where);
  } catch (e) {
    throw new Error(`cannot fetch the rules file ${where}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (got.status < 200 || got.status > 299) throw new Error(`cannot fetch the rules file ${where}: HTTP ${got.status}`);
  return parseRules(got.text, where);
}

/** What `reason` is for a claim that gave none: the Rule and its title. */
export const ruleReason = (rule: string, title: string) => `Rule ${rule}: ${title}`;

/**
 * How a claim reads in a report. A claim that names a rule shows the Rule and its title (and its own words after them
 * when it has any); any other claim shows its reason, as before.
 */
export function claimLabel(claim: Pick<Claim, "reason" | "rule" | "ruleTitle">): string {
  if (!claim.rule || !claim.ruleTitle) return claim.reason;
  const base = ruleReason(claim.rule, claim.ruleTitle);
  return claim.reason === base ? base : `${base} — ${claim.reason}`;
}
