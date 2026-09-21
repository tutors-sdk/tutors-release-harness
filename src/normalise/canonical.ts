/**
 * Canonical forms for the two HTTP header values the harness compares as text: `content-type` and
 * `cache-control`. Applied to BOTH sides by `normalise()` (in every mode), before any mask, so a mask
 * pattern is written against the canonical form.
 *
 * Why this is not a mask. Production sits behind a CDN that re-serialises headers: it sorts and
 * re-spaces `cache-control` directives, spells a media type with a charset, and calls a script
 * `application/javascript`. None of that changes what a browser does. A mask would hide the field;
 * canonicalising keeps the signal: `max-age=31536000` -> `max-age=300`, a lost `immutable` or
 * `text/css` -> `text/plain` still differ after both sides are put in the same form.
 *
 * What is deliberately treated as the same:
 *   cache-control  directive names and values lower-cased, whitespace around `,` and `=` removed,
 *                  directives sorted and de-duplicated ("public,immutable,max-age=1" is
 *                  "max-age=1, public, immutable" is "Public, Max-Age=1, immutable").
 *   content-type   media type and parameter names lower-cased, whitespace around `;` and `=` removed,
 *                  parameters sorted, the DEFAULT charset (utf-8) dropped, and the legacy JavaScript
 *                  aliases (WHATWG MIME Sniffing "JavaScript MIME type") folded into text/javascript.
 * What is deliberately NOT: a different max-age, a missing or extra directive (`immutable`, `no-store`,
 * `private`), another media type, or a non-default charset (iso-8859-1).
 * Known blind spot: a document that loses `charset=utf-8` reads as unchanged; browsers then sniff.
 */

/** The JavaScript MIME type essences the WHATWG MIME Sniffing standard treats as one type. */
const JAVASCRIPT_ALIASES = new Set([
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript"
]);

/** Split on `sep`, ignoring separators inside a quoted string. */
function splitOutsideQuotes(text: string, sep: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (ch === "\\" && quoted) {
      current += ch + (text[i + 1] ?? "");
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
      current += ch;
    } else if (ch === sep && !quoted) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  parts.push(current);
  return parts;
}

/** `name = value` -> [name, value] with the whitespace around `=` removed; value is undefined for a bare token. */
function nameValue(token: string): [string, string | undefined] {
  const eq = token.indexOf("=");
  if (eq < 0) return [token.trim(), undefined];
  return [token.slice(0, eq).trim(), token.slice(eq + 1).trim()];
}

export function canonicalCacheControl(value: string): string {
  const directives = splitOutsideQuotes(value, ",")
    .map((d) => d.trim())
    .filter((d) => d !== "")
    .map((d) => {
      const [name, v] = nameValue(d);
      return v === undefined ? name.toLowerCase() : `${name.toLowerCase()}=${v.toLowerCase()}`;
    });
  return [...new Set(directives)].sort().join(",");
}

export function canonicalContentType(value: string): string {
  const [essence = "", ...rest] = splitOutsideQuotes(value, ";");
  let type = essence.trim().toLowerCase();
  if (type === "") return "";
  if (JAVASCRIPT_ALIASES.has(type)) type = "text/javascript";
  const params: string[] = [];
  for (const raw of rest) {
    if (raw.trim() === "") continue;
    const [name, v] = nameValue(raw);
    const key = name.toLowerCase();
    if (v === undefined) {
      params.push(key);
      continue;
    }
    const unquoted = v.replace(/^"(.*)"$/, "$1");
    if (key === "charset") {
      if (unquoted.toLowerCase() === "utf-8") continue;
      params.push(`charset=${unquoted.toLowerCase()}`);
    } else params.push(`${key}=${v}`);
  }
  params.sort();
  return params.length ? `${type}; ${params.join("; ")}` : type;
}

/** The canonical form of a header value the harness canonicalises; every other header is returned as it is. */
export function canonicalHeaderValue(name: string, value: string): string {
  switch (name.toLowerCase()) {
    case "cache-control":
      return canonicalCacheControl(value);
    case "content-type":
      return canonicalContentType(value);
    default:
      return value;
  }
}
