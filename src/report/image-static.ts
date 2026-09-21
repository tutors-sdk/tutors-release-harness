import { IMAGE_APPS, IMAGE_ARTEFACT_KINDS, type ImageArtefactStatus } from "../image-static/types.ts";
import type { RunReport } from "../types.ts";

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const mdEscape = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");

function cellText(s: ImageArtefactStatus | undefined): string {
  if (!s) return "—";
  return s.collected ? `${s.summary ?? "collected"}${s.source ? ` (${s.source})` : ""}` : `NOT COLLECTED: ${s.reason ?? "no reason recorded"}`;
}

/** The static image artefacts as a Markdown table; empty when the run collected none. */
export function imageArtefactsMarkdown(report: RunReport): string[] {
  const section = report.imageArtefacts;
  if (!section?.a && !section?.b) return [];
  const lines = ["### Image artefacts (from the images, not the running apps)", "", "| app | artefact | a | b |", "|---|---|---|---|"];
  for (const app of IMAGE_APPS) {
    for (const kind of IMAGE_ARTEFACT_KINDS) {
      const a = section.a?.[app][kind];
      const b = section.b?.[app][kind];
      const loud = (s: ImageArtefactStatus | undefined) => (s && !s.collected ? `**${mdEscape(cellText(s))}**` : mdEscape(cellText(s)));
      lines.push(`| ${app} | ${kind} | ${loud(a)} | ${loud(b)} |`);
    }
  }
  lines.push("");
  return lines;
}

/** The same as an HTML block; a not-collected cell is shown in the loud style. */
export function imageArtefactsHtml(report: RunReport): string {
  const section = report.imageArtefacts;
  if (!section?.a && !section?.b) return "";
  const cell = (s: ImageArtefactStatus | undefined) => (s && !s.collected ? `<td class="loud">${esc(cellText(s))}</td>` : `<td>${esc(cellText(s))}</td>`);
  const rows = IMAGE_APPS.flatMap((app) => IMAGE_ARTEFACT_KINDS.map((kind) => `<tr><td>${app}</td><td>${kind}</td>${cell(section.a?.[app][kind])}${cell(section.b?.[app][kind])}</tr>`)).join("");
  return `<h2>Image artefacts</h2><p><small>Collected from the images, not the running apps. A cell that says NOT COLLECTED was not compared.</small></p><table><thead><tr><th>app</th><th>artefact</th><th>a</th><th>b</th></tr></thead><tbody>${rows}</tbody></table>`;
}
