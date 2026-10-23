import type { Hunk, ResponseSecret, SideCapture } from "../types.ts";
import { hunkId } from "./pages.ts";

/**
 * secrets-in-response (since 1.52.0; harness hardening plan, D3): a secret in what b sent the browser, judged on b
 * alone like the policy family. The collector scans the raw text before it is redacted and keeps names only
 * (src/collectors/secrets.ts); this engine turns each (page, source, name) b holds into a failing hunk, saying whether
 * production sent it too. Informing until a release of the harness promotes it (src/compare/levels.ts); its mutant is
 * `secret-in-body`.
 *
 *   <pageKey>/<source>/<name>   source: aria, header, url, console, body; name: PRIVATE_AUTH_SECRET, GitHub token, …
 *   summary                     nothing found on b, and how much was scanned
 *
 * A capture recorded before 1.52.0 holds no scan, and the engine says nothing about it: every capture taken since is
 * scanned, so only a re-compare of an old recording (`harness compare`, `--recorded`) has none.
 */
export const secretsInResponse = (a: SideCapture, b: SideCapture): Hunk[] => {
  const pagesB = b.journeys.flatMap((j) => j.pages);
  if (!pagesB.length) return [];
  if (pagesB.every((p) => p.secrets === undefined)) return [];
  const onA = new Set(a.journeys.flatMap((j) => j.pages.flatMap((p) => (p.secrets ?? []).map((s) => key(p.pageKey, s)))));
  const aScanned = a.journeys.some((j) => j.pages.some((p) => p.secrets !== undefined));
  const hunks: Hunk[] = [];
  const seen = new Set<string>();
  for (const page of pagesB) {
    for (const s of page.secrets ?? []) {
      const k = key(page.pageKey, s);
      if (seen.has(k)) continue;
      seen.add(k);
      const where = aScanned ? (onA.has(k) ? " (production too)" : " (new on b)") : "";
      hunks.push({ ...hunk(k, "fail", `${page.pageKey}: the ${SOURCE[s.source]} holds ${s.name}: ${s.why}${where}`), path: page.path });
    }
  }
  if (!hunks.length) hunks.push(hunk("summary", "info", `secrets-in-response holds on b: no secret-shaped value in the accessibility tree, document headers, response URLs, console or HTML and JSON bodies of ${pagesB.length} page capture(s)`));
  return hunks;
};

const SOURCE: Record<ResponseSecret["source"], string> = { aria: "accessibility tree", header: "document response headers", url: "a response URL", console: "console", body: "a response body" };
const key = (pageKey: string, s: ResponseSecret) => `${pageKey}/${s.source}/${s.name}`;
const hunk = (scope: string, severity: Hunk["severity"], summary: string): Hunk => ({ id: hunkId("secrets-in-response", scope), artefact: "secrets-in-response", scope, severity, summary });
