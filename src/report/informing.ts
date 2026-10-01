import { claimLabel } from "../claims/rules.ts";
import { levelsLine } from "../compare/levels.ts";
import type { ClaimMatch, RunReport } from "../types.ts";

/**
 * The report's Informing section (since 1.21.0): what an informing engine found on this run, labelled so it cannot be
 * read as a failure or as a pass, and every engine's level. Reported, never gated: nothing here is an input to the
 * verdict, the Gate or the exit code, which are decided before the report is written (src/compare/levels.ts).
 */
export function informingMatches(report: Pick<RunReport, "compare">): ClaimMatch[] {
  return report.compare.matches.filter((m) => m.hunk.level === "informing");
}

const when = (m: ClaimMatch) => (m.hunk.blockingFrom ? `blocking from ${m.hunk.blockingFrom}` : "no date set");

export function informingHtml(report: RunReport, esc: (s: string) => string): string {
  if (!report.levels) return "";
  const found = informingMatches(report);
  const open = found.filter((m) => !m.claim).length;
  const rows = found
    .map((m) => `<tr id="informing-${esc(m.hunk.id)}"><td data-label="engine"><code>${esc(m.hunk.artefact)}</code></td><td data-label="scope"><code>${esc(m.hunk.scope)}</code></td><td data-label="found">${esc(m.hunk.summary)}${m.hunk.detail ? `<details><summary>detail</summary><pre>${esc(m.hunk.detail)}</pre></details>` : ""}</td><td data-label="level">${esc(when(m))}</td><td data-label="claimed by">${m.claim ? esc(claimLabel(m.claim)) : "<em>unclaimed</em>"}</td></tr>`)
    .join("\n");
  return `<h2 id="informing">Informing (${found.length}${found.length ? `; ${open} unclaimed` : ""}) <span class="level">reported, never gates</span></h2>
<p>${esc(levelsLine(report.levels))} An informing engine's findings are listed here and never change the verdict, the Gate or the exit code; a claim can still cover one.</p>
${found.length ? `<table class="informing"><thead><tr><th>engine</th><th>scope</th><th>what it found</th><th>level</th><th>claimed by</th></tr></thead><tbody>${rows}</tbody></table>` : "<p>No informing results on this run.</p>"}`;
}

/** The pull-request comment says nothing while every engine blocks and nothing was found: report.html still says so. */
export function informingMarkdown(report: RunReport): string[] {
  if (!report.levels) return [];
  const found = informingMatches(report);
  if (!found.length && Object.values(report.levels).every((l) => l.level === "blocking")) return [];
  const lines = [`### Informing (${found.length}${found.length ? `; ${found.filter((m) => !m.claim).length} unclaimed` : ""}): reported, never gates`, "", `${levelsLine(report.levels)} An informing engine's findings never change the verdict, the Gate or the exit code; a claim can still cover one.`, ""];
  if (!found.length) return [...lines, "No informing results on this run.", ""];
  lines.push("| engine | scope | what it found | level | claimed by |", "|---|---|---|---|---|");
  const cell = (s: string) => s.replaceAll("|", "\\|").replace(/\s+/g, " ");
  for (const m of found) lines.push(`| \`${m.hunk.artefact}\` | \`${cell(m.hunk.scope)}\` | ${cell(m.hunk.summary)} | ${when(m)} | ${m.claim ? cell(claimLabel(m.claim)) : "unclaimed"} |`);
  return [...lines, ""];
}
