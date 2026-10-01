import type { SecretFinding } from "./types.ts";

/**
 * What looks like a secret baked into an image (since 1.22.0, for the image-hardening policy): an environment variable
 * in the image's config, or a build argument or command in its layer history. Read from what `docker image inspect`
 * and `docker image history` already print; file contents inside the layers are not read. Only names and reasons are
 * kept: a value is matched here and never stored, logged or reported.
 */

/** A name that says it holds a secret. `ANON_KEY` and other public keys do not match; `API_KEY`, `NPM_TOKEN` and `DB_PASSWORD` do. */
const SECRET_NAME = /(^|[_-])(PASS(WORD|WD)?|SECRET|TOKEN|API[_-]?KEY|ACCESS[_-]?KEY|SECRET[_-]?KEY|PRIVATE[_-]?KEY|AUTH[_-]?KEY|CREDENTIALS?)([_-]|$)/i;

/** Values that are a secret whatever they are called. */
const SECRET_VALUES: readonly [RegExp, string][] = [
  [/AKIA[0-9A-Z]{16}/, "an AWS access key id"],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}/, "a GitHub token"],
  [/\bgithub_pat_[A-Za-z0-9_]{22,}/, "a GitHub token"],
  [/\bglpat-[A-Za-z0-9_-]{20,}/, "a GitLab token"],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/, "a Slack token"],
  [/\bnpm_[A-Za-z0-9]{36}\b/, "an npm token"],
  [/\bsk_live_[A-Za-z0-9]{16,}/, "a Stripe live key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
  [/\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/, "a JSON web token"]
];

/** SvelteKit's PUBLIC_ variables are public by design: shipped to every browser. A token-shaped value in one is still flagged, a JWT (an anon key) is not. */
const PUBLIC = /^PUBLIC_/;

function judge(name: string, value: string): string | undefined {
  const pub = PUBLIC.test(name);
  for (const [re, what] of SECRET_VALUES) if (re.test(value) && !(pub && what === "a JSON web token")) return `the value is ${what}`;
  if (!pub && SECRET_NAME.test(name) && value.trim() !== "") return "its name says it holds a secret, and it has a value";
  return undefined;
}

/** The image config's `Env` (`NAME=value` strings): each variable that looks like a secret, by name. */
export function secretsInEnv(env: readonly string[] | null | undefined): SecretFinding[] {
  const out: SecretFinding[] = [];
  for (const entry of env ?? []) {
    const eq = entry.indexOf("=");
    const name = eq < 0 ? entry : entry.slice(0, eq);
    const why = judge(name, eq < 0 ? "" : entry.slice(eq + 1));
    if (why) out.push({ name, why });
  }
  return out;
}

const ASSIGNMENT = /(?:^|[\s|;&])([A-Za-z_][A-Za-z0-9_]*)=("[^"]*"|'[^']*'|[^\s;&|]*)/g;

/**
 * The layer history's `CreatedBy` lines, newest first: each build argument (`|2 NPM_TOKEN=… /bin/sh -c …`), `ENV` or
 * command assignment that looks like a secret, and any secret-shaped value anywhere on the line. Names already flagged
 * in the image's environment are left to that finding.
 */
export function secretsInHistory(createdBy: readonly string[], flaggedInEnv: readonly string[] = []): SecretFinding[] {
  const out: SecretFinding[] = [];
  const seen = new Set(flaggedInEnv);
  createdBy.forEach((line, entry) => {
    for (const m of line.matchAll(ASSIGNMENT)) {
      const name = m[1]!;
      const value = m[2]!.replace(/^["']|["']$/g, "");
      const why = judge(name, value);
      if (why && !seen.has(name)) {
        seen.add(name);
        out.push({ name, entry, why: `${why}, set in the build` });
      }
    }
    // A secret-shaped value anywhere else on the line: what an assignment above already named is taken out first, and so
    // is a PUBLIC_ variable's JWT (an anon key, public by design).
    const rest = line.replace(ASSIGNMENT, (all, name: string, value: string) => (seen.has(name) || (PUBLIC.test(name) && /^["']?eyJ/.test(value)) ? all.slice(0, all.indexOf(name)) : all));
    for (const [re, what] of SECRET_VALUES) {
      if (!re.test(rest)) continue;
      out.push({ name: what.replace(/^an? /, ""), entry, why: `the build history holds ${what}` });
      break;
    }
  });
  return out;
}
