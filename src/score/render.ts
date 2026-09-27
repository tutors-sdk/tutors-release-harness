/**
 * The score as people read it, always in the same order: the Gate first (the andon), then the RCS and its band with
 * what the band means, then the eight dimensions as rows. A dimension that is not measured says so in its row; it is
 * never shown as a number.
 */
import { dirname } from "node:path";
import { renderGlanceBoard } from "../glance/render.ts";
import type { Confidence, DimensionScore } from "./confidence.ts";
import { FLOOR_CAP } from "./weights.ts";

const scoreText = (d: DimensionScore) => (d.status === "measured" ? String(d.score) : "not measured");
/** A deduction's points as shown: a floor-only finding (0 points, since 1.10.0) says "floor" instead of −0. */
const pts = (x: { points: number }) => (x.points ? `−${x.points}` : "floor");
const lost = (d: DimensionScore) => d.deductions.reduce((n, x) => n + x.points, 0);

/** "RCS 85 Amber: ship only after …", or why there is none. */
export function rcsLine(c: Confidence): string {
  if (c.rcs === null || !c.band) return c.note ?? "No RCS.";
  return `RCS ${c.rcs} ${c.band}: ${c.meaning}`;
}

/** How the number was made, in one line: the mean, which weights, any cap. */
export function basisLine(c: Confidence): string {
  const measured = c.dimensions.filter((d) => d.status === "measured");
  const weight = measured.reduce((n, d) => n + d.weight, 0);
  const mean = c.mean === null ? "" : `weighted mean ${c.mean.toFixed(2)} over `;
  const cap = c.rcs !== null && c.note ? ` ${c.note}` : "";
  return `${mean}${measured.length} of ${c.dimensions.length} dimensions measured (weight ${weight} of 100, renormalised)${measured.length < c.dimensions.length ? "; the rest are not measured and not counted" : ""}.${cap}`;
}

/** The board lists this many deductions; confidence.json has them all. */
export const BOARD_DEDUCTIONS = 10;

/** The terminal board of `harness confidence`: Gate, RCS and band, then one row per dimension. */
export function renderBoard(c: Confidence, file?: string): string {
  const lines = [`Gate: ${c.gate}`, rcsLine(c), `  ${basisLine(c)}`, ""];
  lines.push(`  ${"dimension".padEnd(27)}${"weight".padStart(6)}  ${"score".padEnd(14)}floor, points lost`);
  for (const d of c.dimensions) {
    const floor = d.floorBreached ? `BREACHED (caps the RCS at ${FLOOR_CAP})` : "";
    const why = d.status === "measured" ? (d.deductions.length ? `-${lost(d)}: ${d.deductions.length} deduction(s)` : "") : d.reason ?? "";
    lines.push(`  ${d.name.padEnd(27)}${String(d.weight).padStart(6)}  ${scoreText(d).padEnd(14)}${floor}${floor && why ? "  " : ""}${why}`.trimEnd());
  }
  const deductions = c.dimensions.flatMap((d) => d.deductions.map((x) => `  ${x.points ? `-${x.points}` : "floor"} ${d.name}: ${x.why}${x.floor && x.points ? " [floor]" : ""}\n      ${x.evidence}`));
  if (deductions.length) lines.push("", "Where the points went:", ...deductions.slice(0, BOARD_DEDUCTIONS));
  if (deductions.length > BOARD_DEDUCTIONS) lines.push(`  … ${deductions.length - BOARD_DEDUCTIONS} more in confidence.json`);
  if (c.glanceBasis) lines.push("", renderGlanceBoard(c, { dir: file ? dirname(file) : "<dir>" }));
  lines.push("", "The score never changes the gate, a verdict or an exit code.");
  if (file) lines.push(`confidence.json: ${file}`);
  return lines.join("\n");
}

const cell = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");

/** The lead of report.md and gate.md, under the Gate: RCS and band, then `lead` (the glance, since 1.12.0), then the dimension table. */
export function renderScoreMarkdown(c: Confidence, lead?: string): string {
  const lines = [`**${rcsLine(c)}**`, "", ...(lead ? [lead, ""] : []), basisLine(c), "", "| dimension | weight | score | floor | where it lost points |", "| --- | --- | --- | --- | --- |"];
  for (const d of c.dimensions) {
    const detail = d.status === "measured" ? d.deductions.map((x) => `${pts(x)} ${x.why}`).join("; ") || "—" : d.reason ?? "";
    lines.push(`| ${d.name} | ${d.weight} | ${d.status === "measured" ? `**${d.score}**` : "not measured"} | ${d.floorBreached ? "**breached**" : ""} | ${cell(detail)} |`);
  }
  lines.push("", "_Visual management: never an input to the gate or the exit code. Every deduction names its evidence in confidence.json._");
  return lines.join("\n");
}

/** Every deduction with its evidence link, for the section further down report.md. */
export function renderDeductionsMarkdown(c: Confidence): string {
  const rows = c.dimensions.flatMap((d) => d.deductions.map((x) => `| ${d.name} | ${pts(x)}${x.floor && x.points ? " (floor)" : ""} | ${cell(x.why)} | ${cell(x.evidence)} |`));
  const gaps = c.dimensions.flatMap((d) => (d.gaps ?? []).map((g) => `- ${d.name}: ${g}`));
  const out = [rows.length ? ["| dimension | points | why | evidence |", "| --- | --- | --- | --- |", ...rows].join("\n") : "No deductions."];
  if (gaps.length) out.push("", "Not looked at yet by a measured dimension:", "", ...gaps);
  return out.join("\n");
}

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** The score block of the release report.html, right under the Gate; `lead` (the glance) right under the RCS. Evidence links are relative, so they open offline. */
export function renderScoreHtml(c: Confidence, lead?: string): string {
  const tone = c.band ? c.band.toLowerCase() : "none";
  const rows = c.dimensions
    .map((d) => {
      const detail = d.status === "measured" ? d.deductions.map((x) => `${pts(x)} <a href="${esc(x.evidence)}">${esc(x.why)}</a>`).join("<br>") || "—" : esc(d.reason ?? "");
      return `<tr><td>${esc(d.name)}</td><td>${d.weight}</td><td>${d.status === "measured" ? `<strong>${d.score}</strong>` : "<em>not measured</em>"}</td><td>${d.floorBreached ? "<strong>breached</strong>" : ""}</td><td>${detail}</td></tr>`;
    })
    .join("\n");
  return `<p class="rcs ${tone}">${esc(rcsLine(c))}</p>
${lead ?? ""}
<p class="seam">${esc(basisLine(c))}</p>
<table><thead><tr><th>dimension</th><th>weight</th><th>score</th><th>floor</th><th>where it lost points</th></tr></thead><tbody>
${rows}
</tbody></table>`;
}
