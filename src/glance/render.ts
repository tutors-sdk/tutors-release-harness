/**
 * The glance as people read it: the top of report.md, report.html and the PR comment, right after the Gate, the RCS and
 * its band. A numbered list of at most seven places to look, each with its links, the ranking written out, the mark so
 * far, and one line saying how to mark. Gemba: the links go to the artefact, not to another summary.
 *
 * The block sits between two markers so `harness glance mark` can re-render it in place once a mark is recorded,
 * without re-running anything else.
 */
import type { Confidence } from "../score/confidence.ts";
import { MARKS_FILE, glanceStatus, type MarkRecord } from "./marks.ts";
import { KIND_TITLES, MARK_MEANS, type GlanceItem } from "./rank.ts";

export const GLANCE_START = "<!-- glance:start -->";
export const GLANCE_END = "<!-- glance:end -->";

type Scored = Pick<Confidence, "gate" | "band" | "glance" | "glanceBasis">;

/** How to mark, in one line, with the run's own directory filled in. */
export function markHint(dir: string): string {
  return `harness glance mark --run ${dir} --item <n> --mark verified|disputed|escalated --by <name> [--note text]`;
}

const means = `verified: ${MARK_MEANS.verified.means}; disputed: ${MARK_MEANS.disputed.becomes}; escalated: ${MARK_MEANS.escalated.becomes}`;
const fixed2 = (x: number) => x.toFixed(2);
const markText = (i: GlanceItem) => (i.mark ? `**${i.mark.mark}** by ${i.mark.by}${i.mark.note ? ` (${i.mark.note})` : ""}` : "not marked yet");
const md = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");

/** The line that says what the marks mean for go, by band (SOP step 9). */
function goLine(c: Scored, records: MarkRecord[]): string {
  return glanceStatus({ glance: c.glance, band: c.band, gate: c.gate }, records).go;
}

/** The ranking of one item, written out so it can be reviewed. */
export const rankingText = (i: GlanceItem) => `novelty ${fixed2(i.novelty)} (${i.basis.novelty}) × exposure ${fixed2(i.exposure)} (${i.basis.exposure}) = ${fixed2(i.score)}`;

export function renderGlanceMarkdown(c: Scored, o: { dir: string; records?: MarkRecord[] }): string {
  const lines = [GLANCE_START, "### The reviewer's glance (gemba: go to the artefact and look)", ""];
  const basis = c.glanceBasis;
  if (!basis) {
    lines.push("Not ranked: this confidence.json was written before the glance existed (1.12.0). Re-score it with `harness confidence --run <dir>`.", "", GLANCE_END);
    return lines.join("\n");
  }
  if (!c.glance.length) lines.push(`Nothing ranked: none of the ${basis.checked.length} kinds checked found a place to look.`, "");
  else {
    lines.push(`${c.glance.length === 1 ? "One place" : `${c.glance.length} places`} to look, ranked by novelty × exposure. Mark each one: \`${markHint(o.dir)}\` (${means}).`, "");
    for (const i of c.glance) {
      const links = [i.links.hunk ? `[hunk](${i.links.hunk})` : "", i.links.claim ? `claim: ${md(i.links.claim)}` : "", i.links.pr ? `[PR](${i.links.pr})` : "", i.links.diff ? `[diff](${i.links.diff})` : ""].filter(Boolean);
      lines.push(`${i.rank}. **${KIND_TITLES[i.kind]}**: ${md(i.finding)}`);
      if (links.length) lines.push(`   ${links.join(" · ")}`);
      if (i.hunks && i.hunks.length > 1) lines.push(`   every hunk: ${i.hunks.slice(0, 10).map((h, n) => `[${n + 1}](${h})`).join(" ")}${i.hunks.length > 10 ? ` and ${i.hunks.length - 10} more in confidence.json` : ""}`);
      if (i.detail) lines.push(`   ${md(i.detail)}`);
      lines.push(`   _${md(rankingText(i))}_ · mark: ${markText(i)}`);
    }
    lines.push("");
  }
  lines.push(`**${goLine(c, o.records ?? [])}**`, "");
  if (basis.notChecked.length) lines.push(`Not checked (no input, so nothing is claimed about them): ${basis.notChecked.map((n) => `${KIND_TITLES[n.kind].toLowerCase()}: ${md(n.reason)}`).join("; ")}.`, "");
  lines.push(`_The ranking is in confidence.json (glance, glanceBasis) so it can be reviewed too; marks go to ${MARKS_FILE} and never change the Gate or an exit code._`, GLANCE_END);
  return lines.join("\n");
}

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const a = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`;

export function renderGlanceHtml(c: Scored, o: { dir: string; records?: MarkRecord[] }): string {
  const basis = c.glanceBasis;
  const head = `${GLANCE_START}\n<section class="glance"><h2 id="glance">The reviewer's glance <small>(gemba: go to the artefact and look)</small></h2>`;
  if (!basis) return `${head}<p class="seam">Not ranked: this confidence.json was written before the glance existed (1.12.0).</p></section>\n${GLANCE_END}`;
  const items = c.glance
    .map((i) => {
      const links = [i.links.hunk ? a(i.links.hunk, "hunk") : "", i.links.claim ? `claim: ${esc(i.links.claim)}` : "", i.links.pr ? a(i.links.pr, "PR") : "", i.links.diff ? a(i.links.diff, "diff") : ""].filter(Boolean).join(" · ");
      const every = i.hunks && i.hunks.length > 1 ? `<br><small>every hunk: ${i.hunks.map((h, n) => a(h, String(n + 1))).join(" ")}</small>` : "";
      const mark = i.mark ? `<span class="mark ${i.mark.mark}">${esc(i.mark.mark)} by ${esc(i.mark.by)}</span>` : `<span class="mark none">not marked yet</span>`;
      return `<li><strong>${esc(KIND_TITLES[i.kind])}</strong>: ${esc(i.finding)} ${mark}${links ? `<br>${links}` : ""}${every}${i.detail ? `<br><small>${esc(i.detail)}</small>` : ""}<br><small class="seam">${esc(rankingText(i))}</small></li>`;
    })
    .join("\n");
  const list = c.glance.length ? `<p>Mark each one: <code>${esc(markHint(o.dir))}</code> (${esc(means)}).</p><ol>\n${items}\n</ol>` : `<p>Nothing ranked: none of the ${basis.checked.length} kinds checked found a place to look.</p>`;
  const notChecked = basis.notChecked.length ? `<p class="seam">Not checked (no input, so nothing is claimed about them): ${basis.notChecked.map((n) => `${esc(KIND_TITLES[n.kind].toLowerCase())}: ${esc(n.reason)}`).join("; ")}.</p>` : "";
  return `${head}${list}<p><strong>${esc(goLine(c, o.records ?? []))}</strong></p>${notChecked}<p class="seam">The ranking is in <a href="confidence.json">confidence.json</a> so it can be reviewed too; marks go to ${MARKS_FILE} and never change the Gate or an exit code.</p></section>\n${GLANCE_END}`;
}

/** The glance for a terminal: `harness confidence` and `harness glance status`. */
export function renderGlanceBoard(c: Scored, o: { dir: string; records?: MarkRecord[] }): string {
  const basis = c.glanceBasis;
  if (!basis) return "The reviewer's glance: not ranked (a confidence.json written before 1.12.0).";
  const s = glanceStatus({ glance: c.glance, band: c.band, gate: c.gate }, o.records ?? []);
  const lines = [`The reviewer's glance (gemba): ${c.glance.length} item(s); ${s.counts.verified} verified, ${s.counts.disputed} disputed, ${s.counts.escalated} escalated, ${s.counts.unmarked} not marked`];
  for (const i of s.items) {
    lines.push(`  ${i.rank}. [${i.mark ? `${i.mark.mark} by ${i.mark.by}` : "not marked"}] ${KIND_TITLES[i.kind]}: ${i.finding}`);
    for (const [k, v] of Object.entries(i.links)) lines.push(`       ${k}: ${v}`);
    if (i.detail) lines.push(`       ${i.detail}`);
    lines.push(`       ${rankingText(i)}`);
  }
  lines.push(s.go);
  for (const f of s.followUps) lines.push(`  ${f}`);
  if (basis.notChecked.length) lines.push(`not checked: ${basis.notChecked.map((n) => `${n.kind}: ${n.reason}`).join("; ")}`);
  if (c.glance.length) lines.push(`mark: ${markHint(o.dir)}`);
  lines.push("Marks never change the Gate or an exit code.");
  return lines.join("\n");
}

/** Replace the glance block in a rendered file; the text unchanged when it has none (a file written before 1.12.0). */
export function replaceGlanceBlock(text: string, block: string): { text: string; replaced: boolean } {
  const start = text.indexOf(GLANCE_START);
  const end = text.indexOf(GLANCE_END, start);
  if (start < 0 || end < 0) return { text, replaced: false };
  return { text: `${text.slice(0, start)}${block}${text.slice(end + GLANCE_END.length)}`, replaced: true };
}
