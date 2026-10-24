import { readFileSync } from "node:fs";
import { z } from "zod";
import { InputFileError, inputProblems, unreadable, type Problem } from "../claims/input-error.ts";
import type { Hunk, PageCapture, SideCapture } from "../types.ts";
import { hunkId } from "./pages.ts";

/**
 * headers-policy (since 1.55.0; harness hardening plan, D1): the response headers b must send, whatever a sends. The
 * `headers` engine fails when a header changes between the sides; it says nothing when a header is missing on both,
 * which CSP and HSTS are today. This check reads the monorepo's own contract, `tests/security/header-contract.json`
 * (`--header-contract`, as `--slo` reads slo.yaml), and judges every document b served against it:
 *
 *   <app>/<header>          a document of the app did not send the header, or sent it without the value the contract
 *                           asks (`equals`, case-insensitive, or `matches`, a regular expression); "(production too)"
 *                           when a's documents of the app fail the same way, "(new on b)" when they do not
 *   <app>/cookie/<name>     a session cookie (its name says session) set without HttpOnly or without SameSite
 *   <app>/summary           every document of the app holds the contract
 *
 * Absent `--header-contract`, nothing is judged. Cookies' Secure flag is not judged: the harness serves its stacks over
 * plain HTTP, where an app may rightly leave it off. Informing (src/compare/levels.ts) until the monorepo ships a CSP
 * (its hardening Stage 1.2), and only blocking after its mutant `dropped-csp` is caught.
 */

const HeaderRule = z
  .object({ equals: z.string().optional(), matches: z.string().optional(), reason: z.string().optional() })
  .strict()
  .refine((r) => (r.equals === undefined) !== (r.matches === undefined), { message: "a header has exactly one of equals or matches" })
  .refine(
    (r) => {
      if (r.matches === undefined) return true;
      try {
        new RegExp(r.matches);
        return true;
      } catch {
        return false;
      }
    },
    { message: "matches is not a valid regular expression" }
  );

const ContractSchema = z.object({ $comment: z.string().optional(), headers: z.record(z.string().regex(/^[A-Za-z0-9-]+$/, { message: "a header name is letters, digits and -" }), HeaderRule), apps: z.record(z.string(), z.unknown()).optional() }).strict();

export interface HeaderContract {
  /** Where it was read from, for the summary line. */
  source: string;
  /** Lower-case header name -> what it must be. */
  headers: { name: string; display: string; equals?: string; matches?: RegExp; reason?: string }[];
}

/** Parse the monorepo's header contract; anything wrong is an {@link InputFileError} (exit 2, before any stack starts). */
export function parseHeaderContract(text: string, source: string): HeaderContract {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new InputFileError(`${source} is not a valid header contract: it is not JSON: ${(e as Error).message}`);
  }
  const parsed = ContractSchema.safeParse(raw);
  if (!parsed.success) {
    const problems: Problem[] = parsed.error.issues.map((issue) => ({ where: issue.path[0] === "headers" && issue.path[1] !== undefined ? `header ${String(issue.path[1])}` : "the file", ...(issue.path.length > 2 ? { field: issue.path.slice(2).join(".") } : {}), message: issue.message }));
    throw inputProblems("header contract", source, problems);
  }
  return {
    source,
    headers: Object.entries(parsed.data.headers).map(([display, r]) => ({ name: display.toLowerCase(), display, ...(r.equals !== undefined ? { equals: r.equals } : {}), ...(r.matches !== undefined ? { matches: new RegExp(r.matches, "i") } : {}), ...(r.reason ? { reason: r.reason } : {}) }))
  };
}

export function loadHeaderContract(path: string): HeaderContract {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    throw unreadable("the header contract", path, e);
  }
  return parseHeaderContract(text, path);
}

/** The app a page belongs to, by its key (`reader-auth:course` is the reader, `reference:` pages are the reader's); undefined for anything else. */
export function appOfPage(pageKey: string): string | undefined {
  const prefix = pageKey.split(":")[0]!.replace(/-auth$/, "");
  if (prefix === "reference") return "reader";
  return ["reader", "catalogue", "live", "time"].includes(prefix) ? prefix : undefined;
}

/** A document the side served: a page with response headers (a client-side route change has none). */
const documents = (side: SideCapture) => side.journeys.flatMap((j) => j.pages).filter((p) => Object.keys(p.headers).length > 0);

const SESSION_COOKIE = /session/i;

/** What one document breaks: key -> words. */
export function breaches(page: Pick<PageCapture, "headers">, contract: HeaderContract): Map<string, string> {
  const out = new Map<string, string>();
  const headers = Object.fromEntries(Object.entries(page.headers).map(([k, v]) => [k.toLowerCase(), v]));
  for (const rule of contract.headers) {
    const value = headers[rule.name];
    const why = rule.reason ? `: ${rule.reason}` : "";
    if (value === undefined) out.set(rule.name, `sends no ${rule.display}${why}`);
    else if (rule.equals !== undefined && value.trim().toLowerCase() !== rule.equals.toLowerCase()) out.set(rule.name, `sends ${rule.display} "${value.slice(0, 120)}", not "${rule.equals}"${why}`);
    else if (rule.matches && !rule.matches.test(value)) out.set(rule.name, `sends ${rule.display} "${value.slice(0, 120)}", which does not match /${rule.matches.source}/${why}`);
  }
  for (const line of (headers["set-cookie"] ?? "").split("\n")) {
    const name = line.split("=")[0]!.trim();
    if (!name || !SESSION_COOKIE.test(name)) continue;
    const attrs = line.split(";").slice(1).map((a) => a.trim().toLowerCase());
    const missing = [!attrs.includes("httponly") ? "HttpOnly" : "", !attrs.some((a) => a.startsWith("samesite=")) ? "SameSite" : ""].filter(Boolean);
    if (missing.length) out.set(`cookie/${name}`, `sets the session cookie ${name} without ${missing.join(" or ")}`);
  }
  return out;
}

/** Every app of b against the contract; a only says whether production breaks it too. */
export const headersPolicy = (a: SideCapture, b: SideCapture, contract: HeaderContract | undefined): Hunk[] => {
  if (!contract) return [];
  const byApp = (side: SideCapture) => {
    const m = new Map<string, { pages: number; found: Map<string, { text: string; path: string; pageKey: string }> }>();
    for (const page of documents(side)) {
      const app = appOfPage(page.pageKey);
      if (!app) continue;
      const entry = m.get(app) ?? { pages: 0, found: new Map() };
      entry.pages += 1;
      for (const [key, text] of breaches(page, contract)) if (!entry.found.has(key)) entry.found.set(key, { text, path: page.path, pageKey: page.pageKey });
      m.set(app, entry);
    }
    return m;
  };
  const onB = byApp(b);
  const onA = byApp(a);
  const hunks: Hunk[] = [];
  for (const [app, { pages, found }] of [...onB].sort(([x], [y]) => x.localeCompare(y))) {
    const prodA = onA.get(app);
    for (const [key, f] of found) {
      const where = prodA ? (prodA.found.has(key) ? " (production too)" : " (new on b)") : "";
      hunks.push({ id: hunkId("headers-policy", `${app}/${key}`), artefact: "headers-policy", scope: `${app}/${key}`, path: f.path, severity: "fail", summary: `${app}: ${f.pageKey} ${f.text}${where}` });
    }
    if (!found.size) hunks.push({ id: hunkId("headers-policy", `${app}/summary`), artefact: "headers-policy", scope: `${app}/summary`, severity: "info", summary: `${app}: headers-policy holds on b: ${pages} document(s) send all ${contract.headers.length} header(s) of ${contract.source}` });
  }
  return hunks;
};
