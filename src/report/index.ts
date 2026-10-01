import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { RunReport } from "../types.ts";
import { renderHtml } from "./html.ts";
import { renderMarkdown } from "./markdown.ts";
import { foldCauses } from "./causes.ts";

/**
 * Write report.json (for gating and re-comparison), report.html (for people) and report.md (for the PR comment).
 *
 * Since 1.20.0 the report gains `causes` here, after the verdict: the unclaimed differences folded by kind
 * (src/report/causes.ts). It is set on the report given, so the caller's copy carries it too; nothing that judges reads it.
 */
export function writeReports(dir: string, report: RunReport): { json: string; html: string; md: string } {
  report.causes = foldCauses(report.compare.unclaimed);
  const json = join(dir, "report.json");
  const html = join(dir, "report.html");
  const md = join(dir, "report.md");
  writeFileSync(json, JSON.stringify(report, null, 2));
  writeFileSync(html, renderHtml(report));
  writeFileSync(md, renderMarkdown(report));
  return { json, html, md };
}

export { renderHtml, renderMarkdown };
