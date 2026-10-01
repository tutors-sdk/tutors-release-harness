/**
 * The lead of a release report, in the one order people read it: the Gate (the andon), then the RCS and its band with
 * what the band means, then the reviewer's glance, then the change risk per PR. `harness release` writes it at the top of
 * report.md, gate.md and report.html; `harness reports keep` (since 1.13.1) puts the same lead on top of a kept release
 * run that was scored beside it (Main to RC), so the kept forecast reads like the report a release candidate gets.
 *
 * One renderer for both: the score, glance and changes blocks are src/score/render.ts, src/glance/render.ts and
 * src/changes/render.ts; this only puts them in order.
 *
 * Since 1.16.1 a kept forecast leads with what is new since the last forecast, right under the Gate: the unclaimed
 * differences it has that the previous kept forecast beside the same baseline did not (src/report/delta.ts).
 *
 * Since 1.20.1 it follows that with its causes and the PRs behind them (src/changes/attribute.ts): the new causes against
 * the PRs merged since the last forecast, the rest by path.
 */
import { renderChangesHtml, renderChangesMarkdown } from "../changes/render.ts";
import type { Changes } from "../changes/signals.ts";
import { renderGlanceHtml, renderGlanceMarkdown } from "../glance/render.ts";
import { hunkAnchor, type Confidence } from "../score/confidence.ts";
import type { DeltaLead } from "./delta.ts";
import type { Attribution, AttributedPr } from "../changes/attribute.ts";
import { renderScoreHtml, renderScoreMarkdown } from "../score/render.ts";

/** The styles the lead's blocks use (the Gate, the RCS band, the glance, the marks), for any page that shows it. */
export const LEAD_CSS = `.gate{font-size:1.6rem;font-weight:700;padding:.6rem 1rem;border-radius:6px;color:#1b1b1b}
.gate.pass{background:#e3f4e6}.gate.fail{background:#fbe3e3}.gate.none{background:#f1f1f1}
.seam{color:#555}
.rcs{font-size:1.3rem;font-weight:700;padding:.4rem 1rem;border-radius:6px;color:#1b1b1b}
.rcs.green{background:#e3f4e6}.rcs.amber{background:#fff4e0}.rcs.red{background:#fbe3e3}.rcs.none{background:#f1f1f1}
.glance{border-left:4px solid #1f5fa8;padding:0 1rem;margin:1rem 0}.glance li{margin:.5rem 0}
.delta{border-left:4px solid #8a5a00;padding:0 1rem;margin:1rem 0}.delta table{font-size:.9rem}
.attribution{border-left:4px solid #5a4a8a;padding:0 1rem;margin:1rem 0}.attribution table{font-size:.9rem}.attribution td{overflow-wrap:anywhere}
.mark{font-size:.8rem;padding:0 .4rem;border-radius:4px;background:#f1f1f1;color:#1b1b1b}.mark.verified{background:#e3f4e6}.mark.disputed{background:#fbe3e3}.mark.escalated{background:#fff4e0}`;

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** The Gate line of report.html, toned by the exit code (0 pass or warn, 1 FAIL, 2 not judged). */
export function gateLineHtml(gate: string, code: number): string {
  const tone = code === 0 ? "pass" : code === 1 ? "fail" : "none";
  return `<p class="gate ${tone}">Gate: ${esc(gate)} <small>(exit ${code})</small></p>`;
}

/** Under the Gate in report.md and gate.md: the RCS and band, the glance, the dimension table, then the change risk per PR. */
export function scoreLeadMarkdown(c: Confidence, changes: Changes | undefined, dir: string): string {
  return `${renderScoreMarkdown(c, renderGlanceMarkdown(c, { dir }))}${changes ? `\n\n#### Change risk per PR\n\n${renderChangesMarkdown(changes)}` : ""}`;
}

/** Under the Gate in report.html: the same blocks, in the same order. */
export function scoreLeadHtml(c: Confidence, changes: Changes | undefined, dir: string): string {
  return `${renderScoreHtml(c, renderGlanceHtml(c, { dir }))}\n${changes ? renderChangesHtml(changes) : ""}`;
}

// ---- new since the last forecast (since 1.16.1) ---------------------------------------------------------

/** How many new differences the lead lists, and how many gone ones; the rest are counted, and all are in the report. */
export const DELTA_LISTED = { fresh: 15, gone: 10 } as const;

const mdCell = (s: string) => s.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
const sign = (d: { new: number; gone: number }) => `+${d.new} −${d.gone}`;

/** The sentence that says what was compared, or why nothing was. */
function deltaSentence(d: DeltaLead, f: { code: (s: string) => string; text: (s: string) => string; strong: (s: string) => string }): string {
  const { code, text } = f;
  const { delta } = d;
  if (!delta.against) return `The first kept forecast beside ${code(delta.baseline)}: nothing earlier to compare with.`;
  const a = delta.against;
  const by = Object.entries(delta.byArtefact ?? {}).map(([k, v]) => `${text(k)} ${sign(v)}`).join(" · ");
  const harness = a.harnessVersion !== d.harnessVersion ? ` The previous forecast was judged by harness ${text(a.harnessVersion)}, this one by ${text(d.harnessVersion)}: a harness change can move differences too.` : "";
  return `${f.strong(`${delta.new ?? 0} new, ${delta.gone ?? 0} gone`)} in the unclaimed set since the forecast of ${text(a.ranAt)} (${code(a.candidate)}), beside the same baseline ${code(delta.baseline)}.${by ? ` By artefact: ${by}.` : ""}${harness}`;
}

/** Under the Gate in a kept forecast's report.md: the new differences first, then a line for the gone ones. */
export function deltaLeadMarkdown(d: DeltaLead): string {
  const code = (s: string) => `\`${s}\``;
  const lines = ["#### New since the last forecast", "", deltaSentence(d, { code, text: (x) => x, strong: (x) => `**${x}**` })];
  if (d.fresh.length) {
    lines.push("", "| artefact | scope | what |", "| --- | --- | --- |");
    for (const h of d.fresh.slice(0, DELTA_LISTED.fresh)) lines.push(`| ${h.artefact} | ${mdCell(h.scope)} | ${mdCell(h.summary)} |`);
    if (d.fresh.length > DELTA_LISTED.fresh) lines.push("", `and ${d.fresh.length - DELTA_LISTED.fresh} more new: each is in the report's unclaimed differences below.`);
  }
  if (d.gone.length) {
    const listed = d.gone.slice(0, DELTA_LISTED.gone).map((h) => `${h.artefact} ${code(mdCell(h.scope))}: ${mdCell(h.summary)}`);
    lines.push("", `Gone since then: ${listed.join("; ")}${d.gone.length > listed.length ? `; and ${d.gone.length - listed.length} more` : ""}.`);
  }
  return lines.join("\n");
}

/** Under the Gate in a kept forecast's report.html: the same, each new difference linked to its row in the report. */
export function deltaLeadHtml(d: DeltaLead): string {
  const code = (s: string) => `<code>${esc(s)}</code>`;
  const parts = [`<section class="delta">`, `<h2 id="delta">New since the last forecast</h2>`, `<p>${deltaSentence(d, { code, text: esc, strong: (x) => `<strong>${x}</strong>` })}</p>`];
  if (d.fresh.length) {
    parts.push("<table><thead><tr><th>artefact</th><th>scope</th><th>what</th></tr></thead><tbody>");
    for (const h of d.fresh.slice(0, DELTA_LISTED.fresh)) parts.push(`<tr><td><code>${esc(h.artefact)}</code></td><td><a href="#${esc(hunkAnchor(h))}"><code>${esc(h.scope)}</code></a></td><td>${esc(h.summary)}</td></tr>`);
    parts.push("</tbody></table>");
    if (d.fresh.length > DELTA_LISTED.fresh) parts.push(`<p>and ${d.fresh.length - DELTA_LISTED.fresh} more new: each is in the unclaimed differences below.</p>`);
  }
  if (d.gone.length) {
    const listed = d.gone.slice(0, DELTA_LISTED.gone).map((h) => `${esc(h.artefact)} <code>${esc(h.scope)}</code>: ${esc(h.summary)}`);
    parts.push(`<p>Gone since then: ${listed.join("; ")}${d.gone.length > listed.length ? `; and ${d.gone.length - listed.length} more` : ""}.</p>`);
  }
  parts.push("</section>");
  return parts.join("\n");
}

// ---- causes and the PRs behind them (since 1.20.1) --------------------------------------------------------

/** How many PRs a cause row names; the rest are counted. */
export const ATTRIBUTION_LISTED = 3;

const prName = (p: AttributedPr) => (p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7));
const prWhy = (p: AttributedPr) => (!p.files ? "" : ` (${p.files} file${p.files === 1 ? "" : "s"}${p.direct === p.files ? "" : `, ${p.direct} direct`})`);

/** The sentence over the table: how many causes, which are new and what was merged since, how the rest were matched. */
function attributionSentence(a: Attribution, f: { code: (s: string) => string; pr: (p: AttributedPr) => string }): string {
  const fresh = a.causes.filter((c) => c.how === "new").length;
  const total = a.causes.length;
  const since = a.mergedSince;
  const head = `${total} cause${total === 1 ? "" : "s"}, ${a.attributed} with a PR named.`;
  const delta = a.against
    ? since?.length
      ? ` Merged since the forecast of ${f.code(a.against.candidate)}: ${since.map(f.pr).join(", ")}. ${fresh ? `${fresh} cause${fresh === 1 ? " is" : "s are"} new since then, and only these PRs can have made ${fresh === 1 ? "it" : "them"}.` : "No cause is new since then."}`
      : ` Nothing was merged since the forecast of ${f.code(a.against.candidate)}.`
    : "";
  return `${head}${delta} ${fresh ? "The others are" : "Each is"} matched by path: the PRs whose files touch what the cause is about, ranked by the direct ones (the app's own source for a page, a Dockerfile for an image) before the indirect (the shared packages, a manifest). A lead to ask, never a verdict.`;
}

/** The kept forecast's report.md: one row per cause, the new ones first, with the PRs that could have made it. */
export function attributionLeadMarkdown(a: Attribution): string {
  const pr = (p: AttributedPr) => (p.url ? `[${prName(p)}](${p.url})` : prName(p));
  const lines = ["#### Causes and the PRs behind them", "", attributionSentence(a, { code: (s) => `\`${s}\``, pr }), "", "| cause | differences | PRs |", "| --- | --- | --- |"];
  for (const c of [...a.causes].sort((x, y) => Number(y.how === "new") - Number(x.how === "new"))) {
    const named = c.prs.slice(0, ATTRIBUTION_LISTED).map((p) => `${pr(p)}${prWhy(p)}`).join(", ");
    const more = c.prs.length > ATTRIBUTION_LISTED ? ` and ${c.prs.length - ATTRIBUTION_LISTED} more` : "";
    lines.push(`| ${c.how === "new" ? "**new** " : ""}${mdCell(c.key)} | ${c.hunks} | ${named ? `${named}${more}` : "none matched"} |`);
  }
  return lines.join("\n");
}

/** The kept forecast's report.html: the same, each cause linked to its row in the cause table below. */
export function attributionLeadHtml(a: Attribution): string {
  const pr = (p: AttributedPr) => (p.url ? `<a href="${esc(p.url)}">${esc(prName(p))}</a>` : esc(prName(p)));
  const rows = [...a.causes]
    .sort((x, y) => Number(y.how === "new") - Number(x.how === "new"))
    .map((c) => {
      const named = c.prs.slice(0, ATTRIBUTION_LISTED).map((p) => `${pr(p)}${esc(prWhy(p))}`).join(", ");
      const more = c.prs.length > ATTRIBUTION_LISTED ? ` and ${c.prs.length - ATTRIBUTION_LISTED} more` : "";
      return `<tr><td>${c.how === "new" ? "<strong>new</strong> " : ""}<a href="#cause-${esc(c.cause)}">${esc(c.key)}</a></td><td>${c.hunks}</td><td>${named ? `${named}${more}` : "none matched"}</td></tr>`;
    });
  return [`<section class="attribution">`, `<h2 id="attribution">Causes and the PRs behind them</h2>`, `<p>${attributionSentence(a, { code: (s) => `<code>${esc(s)}</code>`, pr })}</p>`, "<table><thead><tr><th>cause</th><th>differences</th><th>PRs</th></tr></thead><tbody>", ...rows, "</tbody></table>", "</section>"].join("\n");
}
