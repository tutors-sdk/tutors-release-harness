import { APPS } from "../image-ref.ts";
import type { RunReport } from "../types.ts";

/**
 * What a reader must not miss when the images that were deployed are not the
 * ones release mode judged (contract 1.3.0): a banner at the very top of both
 * reports, and a table of the digests. Nothing when the deployment matches or
 * post-deploy mode was not told what was deployed.
 */
export function loudDeployment(report: RunReport): string | undefined {
  const d = report.deployment;
  if (!d || d.status === "match") return undefined;
  const head = d.status === "differs" ? "The deployed images are NOT the ones release mode judged" : "The deployed images could not be confirmed against what release mode judged";
  return `${head}${d.record ? ` (${d.record.candidate})` : ""}: ${d.problems.join("; ")}. This is a warning, not a verdict on the deployment.`;
}

const short = (digest: string | undefined) => (digest ? digest : "—");

export function deploymentMarkdown(report: RunReport): string[] {
  const d = report.deployment;
  if (!d) return [];
  const lines = [`### Deployment${d.production ? ` ${d.production}` : ""}: ${d.status}`, ""];
  if (d.record) lines.push(`Judged as \`${d.record.candidate}\` at ${d.record.judgedAt} (${d.record.verdict.toUpperCase()}).`, "");
  lines.push("| app | deployed | judged |", "|---|---|---|");
  for (const app of APPS) if (d.digests[app] || d.recorded?.[app]) lines.push(`| ${app} | \`${short(d.digests[app])}\` | \`${short(d.recorded?.[app])}\` |`);
  lines.push("");
  return lines;
}

export function deploymentHtml(report: RunReport, esc: (s: string) => string): string {
  const d = report.deployment;
  if (!d) return "";
  const rows = APPS.filter((app) => d.digests[app] || d.recorded?.[app]).map((app) => `<tr><td>${app}</td><td><code>${esc(short(d.digests[app]))}</code></td><td><code>${esc(short(d.recorded?.[app]))}</code></td></tr>`);
  return `<h2>Deployment${d.production ? ` ${esc(d.production)}` : ""}: ${esc(d.status)}</h2>${d.record ? `<p>Judged as <code>${esc(d.record.candidate)}</code> at ${esc(d.record.judgedAt)} (${d.record.verdict.toUpperCase()}).</p>` : ""}${rows.length ? `<table class="provenance"><thead><tr><th>app</th><th>deployed</th><th>judged</th></tr></thead><tbody>${rows.join("")}</tbody></table>` : ""}`;
}
