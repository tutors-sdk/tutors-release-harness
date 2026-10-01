import type { RunReport } from "../types.ts";

/**
 * The in-run noise line (since 1.24.0, `--a2`), beside the nightly A/A it may one day replace: how many differences
 * side a2 (a second copy of production in this run) showed against a, and which of this run's a/b differences have the
 * same artefact and scope. Rendering only: the verdict was decided without it.
 */
const SHOWN = 20;

function words(n: NonNullable<RunReport["inRunNoise"]>, b: number): string {
  const head = `In-run A/A (a to a2, ${n.runs} run, ${n.artefacts.join(", ")}; ${n.journeys.length} journey(s)): `;
  const found = n.hunks.length ? `${n.hunks.length} difference(s)` : "clean";
  const also = n.hunks.length ? `; ${n.alsoOnB.length} of this run's ${b} a/b difference(s) also seen a to a2 (noise by measurement)` : "";
  return `${head}${found}${also}. Reported, never gates.`;
}

const failing = (report: RunReport) => report.compare.hunks.filter((h) => h.severity === "fail").length;

export function inRunNoiseHtml(report: RunReport, esc: (s: string) => string): string {
  const n = report.inRunNoise;
  if (!n) return "";
  const list = n.hunks.length
    ? `<details><summary>the differences a to a2</summary><ul>${n.hunks
        .slice(0, SHOWN)
        .map((h) => `<li><code>${esc(h.artefact)}</code> <code>${esc(h.scope)}</code>: ${esc(h.summary)}</li>`)
        .join("")}${n.hunks.length > SHOWN ? `<li>and ${n.hunks.length - SHOWN} more in report.json (inRunNoise)</li>` : ""}</ul></details>`
    : "";
  return `<li id="in-run-noise">${esc(words(n, failing(report)))}${list}</li>`;
}

export function inRunNoiseMarkdown(report: RunReport): string[] {
  const n = report.inRunNoise;
  if (!n) return [];
  return [`- ${words(n, failing(report))}`, ...n.hunks.slice(0, SHOWN).map((h) => `  - \`${h.artefact}\` \`${h.scope}\`: ${h.summary}`), ...(n.hunks.length > SHOWN ? [`  - and ${n.hunks.length - SHOWN} more in report.json (inRunNoise)`] : [])];
}
