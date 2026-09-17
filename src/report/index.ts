import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { RunReport } from "../types.ts";
import { renderHtml } from "./html.ts";
import { renderMarkdown } from "./markdown.ts";

/** Write report.json (for gating and re-comparison), report.html (for people) and report.md (for the PR comment). */
export function writeReports(dir: string, report: RunReport): { json: string; html: string; md: string } {
  const json = join(dir, "report.json");
  const html = join(dir, "report.html");
  const md = join(dir, "report.md");
  writeFileSync(json, JSON.stringify(report, null, 2));
  writeFileSync(html, renderHtml(report));
  writeFileSync(md, renderMarkdown(report));
  return { json, html, md };
}

export { renderHtml, renderMarkdown };
