/**
 * The lead of a release report, in the one order people read it: the Gate (the andon), then the RCS and its band with
 * what the band means, then the reviewer's glance, then the change risk per PR. `harness release` writes it at the top of
 * report.md, gate.md and report.html; `harness reports keep` (since 1.13.1) puts the same lead on top of a kept release
 * run that was scored beside it (Main to RC), so the kept forecast reads like the report a release candidate gets.
 *
 * One renderer for both: the score, glance and changes blocks are src/score/render.ts, src/glance/render.ts and
 * src/changes/render.ts; this only puts them in order.
 */
import { renderChangesHtml, renderChangesMarkdown } from "../changes/render.ts";
import type { Changes } from "../changes/signals.ts";
import { renderGlanceHtml, renderGlanceMarkdown } from "../glance/render.ts";
import type { Confidence } from "../score/confidence.ts";
import { renderScoreHtml, renderScoreMarkdown } from "../score/render.ts";

/** The styles the lead's blocks use (the Gate, the RCS band, the glance, the marks), for any page that shows it. */
export const LEAD_CSS = `.gate{font-size:1.6rem;font-weight:700;padding:.6rem 1rem;border-radius:6px;color:#1b1b1b}
.gate.pass{background:#e3f4e6}.gate.fail{background:#fbe3e3}.gate.none{background:#f1f1f1}
.seam{color:#555}
.rcs{font-size:1.3rem;font-weight:700;padding:.4rem 1rem;border-radius:6px;color:#1b1b1b}
.rcs.green{background:#e3f4e6}.rcs.amber{background:#fff4e0}.rcs.red{background:#fbe3e3}.rcs.none{background:#f1f1f1}
.glance{border-left:4px solid #1f5fa8;padding:0 1rem;margin:1rem 0}.glance li{margin:.5rem 0}
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
