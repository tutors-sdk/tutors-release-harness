import type { PageCapture, SideCapture } from "../types.ts";

/**
 * Secret-shaped values, redacted from everything a capture records as text: console messages, network
 * URLs, page paths, the accessibility tree, response header values and a journey's error.
 *
 * Why. A page can log the URL it failed to fetch, and a Supabase REST URL carries the project's anon
 * key as `?apikey=eyJ…`. It is a public client key, but a report is published as a CI artifact and pasted
 * into PR summaries, and secret scanners flag it wherever it lands. So the value never reaches a hunk, a
 * report or `report.json`; a hunk reads `apikey=<redacted>`.
 *
 * Same on both sides. `normalise()` applies it to every capture it is given, before origins, canonical
 * forms and masks, so two captures that differ only in a secret compare equal and a redaction can never
 * produce a diff. The collector applies it too (`stripOrigins`), so a new `capture.json` does not hold the
 * value either; `normalise()` still redacts captures recorded before that. It is idempotent.
 *
 * The list is deliberately narrow and every entry is tested. Nothing is redacted because it merely looks
 * random. Logs are not text here (the harness keeps a service's log keys and counts, never a line), so
 * there is nothing to redact in them.
 */
export const REDACTED = "<redacted>";

interface Pattern {
  /** What it catches, for the tests and the docs. */
  name: string;
  re: RegExp;
  /** `$1` keeps the part that says what was redacted (`apikey=`). */
  replace: string;
}

export const REDACTIONS: readonly Pattern[] = [
  // ?apikey=…, &apikey=…, apikey=… : Supabase and PostgREST put the anon key in the query string.
  { name: "apikey parameter", re: /(\bapikey=)[^&\s"'<>)\]]+/gi, replace: `$1${REDACTED}` },
  // {"apikey":"…"} in a logged request or response body.
  { name: "apikey JSON member", re: /("apikey"\s*:\s*")[^"]+/gi, replace: `$1${REDACTED}` },
  // Authorization: Bearer …, Authorization=Basic …, authorization: <anything>
  { name: "Authorization value", re: /(\bAuthorization\s*[:=]\s*(?:(?:Bearer|Basic|Token)\s+)?)[^\s"',;)]+/gi, replace: `$1${REDACTED}` },
  // A bare "Bearer <token>" (a logged header object, an error message).
  { name: "Bearer token", re: /(\bBearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi, replace: `$1${REDACTED}` },
  // A JSON Web Token: three base64url parts, the first starting with the encoding of `{"` (eyJ). The signature may be empty (alg none).
  { name: "JWT", re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*/g, replace: REDACTED },
  // Supabase's newer key format.
  { name: "Supabase publishable or secret key", re: /\bsb_(?:publishable|secret)_[A-Za-z0-9_-]{8,}/g, replace: REDACTED }
];

/** Response headers whose whole value is a credential, whatever it looks like. */
const SECRET_HEADERS = new Set(["authorization", "proxy-authorization", "x-api-key", "apikey"]);

export function redactSecrets(text: string): string {
  if (!text) return text;
  let out = text;
  for (const { re, replace } of REDACTIONS) out = out.replace(re, replace);
  return out;
}

export function redactHeader(name: string, value: string): string {
  return SECRET_HEADERS.has(name.toLowerCase()) && value !== "" ? REDACTED : redactSecrets(value);
}

/** A page with every recorded string redacted. Pure. */
export function redactPage(page: PageCapture): PageCapture {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(page.headers)) headers[name] = redactHeader(name, value);
  return {
    ...page,
    path: redactSecrets(page.path),
    aria: redactSecrets(page.aria),
    headers,
    network: page.network.map((n) => ({ ...n, url: redactSecrets(n.url) })),
    console: page.console.map((c) => ({ ...c, text: redactSecrets(c.text) }))
  };
}

/** A capture with every recorded string redacted. Pure; what `run` writes for the recorded side, so an older capture does not carry a key into the new report directory. */
export function redactCapture(capture: SideCapture): SideCapture {
  return {
    ...capture,
    journeys: capture.journeys.map((j) => ({ ...j, pages: j.pages.map(redactPage), ...(j.error !== undefined ? { error: redactSecrets(j.error) } : {}) }))
  };
}
