import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SECRET_VALUES } from "../image-static/secrets.ts";
import { ROOT } from "../root.ts";
import type { ResponseSecret } from "../types.ts";

/**
 * Secrets in what the browser was sent (since 1.52.0, the `secrets-in-response` engine; harness hardening plan, D3).
 *
 * The collector redacts secret-shaped text before it keeps any (src/normalise/redact.ts), so a JWT or a key a page
 * leaked never reaches a capture, a hunk or a report. That keeps reports safe and makes a leak invisible. So the raw
 * text is scanned here first, as the browser received it: the accessibility tree, the document's response headers,
 * every response URL, every console message, and the body of every HTML document and JSON response. Only a name and
 * a reason are kept, never the value.
 *
 * Two kinds of finding:
 *   canary   a value the stack itself sets as a server-only secret (every PRIVATE_* value in compose.harness.yaml): the
 *            app's own secret reached the browser. Not a real secret, so it can be planted (mutant secret-in-body)
 *   pattern  a value that is a secret whatever it is called (src/image-static/secrets.ts: AWS, GitHub, npm, Stripe, a
 *            private key), and a JWT only when its payload says it is a service key (role service_role or
 *            supabase_admin): a signed-in student's session token is meant to reach their browser, a service key never is
 */

/** Below this length a value is too common to call a canary. */
const MIN_CANARY = 12;

let canaries: readonly { name: string; value: string }[] | undefined;

/** Every `PRIVATE_<NAME>: <value>` in a compose file, distinct by value, longest first. */
export function canariesIn(compose: string): { name: string; value: string }[] {
  const seen = new Map<string, string>();
  for (const m of compose.matchAll(/^\s+(PRIVATE_[A-Z0-9_]+):\s*["']?([^\s"'#]+)["']?\s*$/gm)) {
    const value = m[2]!;
    if (value.length >= MIN_CANARY && !value.startsWith("$") && !seen.has(value)) seen.set(value, m[1]!);
  }
  return [...seen].map(([value, name]) => ({ name, value })).sort((x, y) => y.value.length - x.value.length);
}

/** The stack's canaries, read once from compose.harness.yaml; none when the file cannot be read. */
export function stackCanaries(): readonly { name: string; value: string }[] {
  if (!canaries) {
    try {
      canaries = canariesIn(readFileSync(join(ROOT, "compose.harness.yaml"), "utf8"));
    } catch {
      canaries = [];
    }
  }
  return canaries;
}

const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.(eyJ[A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]*/g;
const SERVICE_ROLES = new Set(["service_role", "supabase_admin"]);

/** The role a JWT's payload claims, or undefined when it is not readable JSON. */
export function jwtRole(payload: string): string | undefined {
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: unknown };
    return typeof claims.role === "string" ? claims.role : undefined;
  } catch {
    return undefined;
  }
}

/** What in one piece of raw text is a secret, by name and why. Never the value. */
export function secretsInText(source: ResponseSecret["source"], text: string, canaryList: readonly { name: string; value: string }[] = stackCanaries()): ResponseSecret[] {
  if (!text) return [];
  const out: ResponseSecret[] = [];
  for (const c of canaryList) if (text.includes(c.value)) out.push({ source, name: c.name, why: `the value of ${c.name}, which the stack sets as a server-only secret` });
  for (const [re, what] of SECRET_VALUES) {
    if (what === "a JSON web token") continue;
    if (re.test(text)) out.push({ source, name: what.replace(/^an? /, ""), why: `the text holds ${what}` });
  }
  for (const m of text.matchAll(JWT)) {
    const role = jwtRole(m[1]!);
    if (role && SERVICE_ROLES.has(role)) {
      out.push({ source, name: `${role} JWT`, why: `a JSON web token whose role is ${role}: a service key, which bypasses row-level security` });
      break;
    }
  }
  return out;
}

/** Findings of one page, each (source, name) once, in a stable order. */
export function distinctSecrets(found: readonly ResponseSecret[]): ResponseSecret[] {
  const byKey = new Map<string, ResponseSecret>();
  for (const f of found) if (!byKey.has(`${f.source}/${f.name}`)) byKey.set(`${f.source}/${f.name}`, f);
  return [...byKey.values()].sort((x, y) => `${x.source}/${x.name}`.localeCompare(`${y.source}/${y.name}`));
}
