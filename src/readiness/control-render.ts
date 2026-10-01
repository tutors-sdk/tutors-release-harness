/**
 * The control chart at the top of the readiness page (since 1.19.0), as inline SVG drawn here, like the rest of the site:
 * no script, no external request. Two charts on one scale: release sizes with the XmR limits and the batch on main as a
 * distinct marker, then the unreleased count night by night against the same lines.
 *
 * Every chart is drawn twice, wide and narrow, and CSS shows one, so the labels stay legible at 375px and the page never
 * scrolls sideways. The zone is always named in words beside its colour, every point carries a tooltip (<title>), and the
 * numbers are in a table under the charts.
 */
import { PROVISIONAL_BELOW, fmt, type Control, type ZoneId } from "./control.ts";

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const day = (iso: string) => {
  const d = new Date(Date.parse(iso));
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : "?";
};
const short = (tag: string) => tag.replace(/^v/, "");
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const ZONE_TONE: Record<ZoneId, string> = { "below centre": "green", "release soon": "amber", "release now": "red" };
const ZONE_LABEL: Record<ZoneId, string> = { "below centre": "Below the centre line", "release soon": "A good time to release", "release now": "Release now" };

interface Point {
  label: string;
  value: number;
  title: string;
  ring?: boolean;
}

interface Frame {
  w: number;
  h: number;
  pad: { l: number; r: number; t: number; b: number };
  font: number;
}

const WIDE: Frame = { w: 960, h: 300, pad: { l: 40, r: 132, t: 22, b: 34 }, font: 12 };
const NARROW: Frame = { w: 320, h: 260, pad: { l: 28, r: 82, t: 22, b: 34 }, font: 12 };

/** A round top for the y axis: the next step of 1, 2 or 5 × 10ⁿ above `max`. */
export function niceMax(max: number): number {
  if (max <= 5) return 5;
  const p = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= max) return m * p;
  return 10 * p;
}

/** Push labels apart so none overlaps: each at least `gap` below the one above it. */
function spread(ys: { y: number; key: string }[], gap: number, lo: number, hi: number): Map<string, number> {
  const s = [...ys].sort((a, b) => a.y - b.y);
  for (let i = 1; i < s.length; i++) if (s[i]!.y - s[i - 1]!.y < gap) s[i]!.y = s[i - 1]!.y + gap;
  const over = (s.at(-1)?.y ?? 0) - hi;
  if (over > 0) for (const x of s) x.y -= over;
  for (let i = 0; i < s.length; i++) if (s[i]!.y < lo) s[i]!.y = lo + i * gap;
  return new Map(s.map((x) => [x.key, x.y]));
}

/**
 * One chart: points left to right on equal steps, the limit lines across, labelled at the right edge, and an optional
 * final marker (the batch on main) after a gap, drawn as a diamond with its zone named.
 */
function chartSvg(c: Control, f: Frame, o: { title: string; points: Point[]; now?: { value: number; label: string; title: string; zone: ZoneId | null; special: boolean }; max: number; line: boolean; cls: string; every: number }): string {
  const { w, h, pad } = f;
  const n = o.points.length + (o.now ? 1.6 : 0);
  const x = (i: number) => pad.l + (n <= 1 ? (w - pad.l - pad.r) / 2 : 10 + (i * (w - pad.l - pad.r - 20)) / Math.max(1, n - 1));
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - v / o.max);
  const parts: string[] = [];
  const right = w - pad.r;
  // Zone bands behind everything, faint, only when there are limits: the WIP limit's three zones.
  const l = c.limits;
  if (l && c.wipLimit !== null) {
    const bands: [number, number, string][] = [
      [0, l.centre, "green"],
      [l.centre, c.wipLimit, "amber"],
      [c.wipLimit, o.max, "red"]
    ];
    for (const [lo, hi, tone] of bands) if (hi > lo) parts.push(`<rect class="zoneband ${tone}" x="${pad.l}" y="${y(Math.min(hi, o.max)).toFixed(1)}" width="${right - pad.l}" height="${(y(lo) - y(Math.min(hi, o.max))).toFixed(1)}"/>`);
  }
  // Recessive grid: zero and the top.
  for (const t of [0, o.max / 2, o.max]) parts.push(`<line class="grid" x1="${pad.l}" x2="${right}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text class="tick" x="${pad.l - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${fmt(t)}</text>`);
  // The limit lines, labelled at the right edge, pushed apart where they would touch.
  if (l) {
    const lines = [
      { key: "ucl", v: l.ucl, cls: "ucl", text: `UCL ${fmt(l.ucl)}` },
      { key: "centre", v: l.centre, cls: "centre", text: `Centre ${fmt(l.centre)}` },
      { key: "lcl", v: l.lcl, cls: "lcl", text: `LCL ${fmt(l.lcl)}` }
    ].filter((x) => x.v <= o.max);
    const at = spread(lines.map((x) => ({ key: x.key, y: y(x.v) + 4 })), f.font + 2, pad.t, h - pad.b + 4);
    for (const x of lines) parts.push(`<line class="limit ${x.cls}" x1="${pad.l}" x2="${right}" y1="${y(x.v).toFixed(1)}" y2="${y(x.v).toFixed(1)}"/><text class="ll" x="${right + 6}" y="${at.get(x.key)!.toFixed(1)}">${esc(x.text)}</text>`);
    parts.push(`<text class="prov" x="${pad.l}" y="${pad.t - 8}">${l.provisional ? `Provisional limits: ${plural(l.n, "release")} of the ${PROVISIONAL_BELOW} needed` : `Limits from ${plural(l.n, "release")}`}</text>`);
  } else parts.push(`<text class="prov" x="${pad.l}" y="${pad.t - 8}">No limits: fewer than two releases measured</text>`);
  // The points, joined by a thin line in order.
  if (o.line && o.points.length > 1) parts.push(`<polyline class="series" points="${o.points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")}"/>`);
  // Tick labels every `every` points; the last always, in place of the one before it when they would touch.
  const shown = new Set(o.points.map((_, i) => i).filter((i) => i % o.every === 0));
  const last = o.points.length - 1;
  if (last >= 0 && !shown.has(last)) {
    const prev = Math.max(...shown);
    if (last - prev < o.every) shown.delete(prev);
    shown.add(last);
  }
  o.points.forEach((p, i) => {
    parts.push(`<g class="pt${p.ring ? " special" : ""}"><circle class="hit" cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="10"/><circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4.5"/>${p.ring ? `<circle class="ring" cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="8"/>` : ""}<title>${esc(p.title)}</title></g>`);
    if (shown.has(i)) parts.push(`<text class="tick" x="${x(i).toFixed(1)}" y="${h - pad.b + 16}" text-anchor="middle">${esc(p.label)}</text>`);
  });
  // The batch on main: a diamond, its value and its zone in words beside it.
  if (o.now) {
    const special = !!o.now.special;
    const cx = x(n - 1);
    const cy = y(Math.min(o.now.value, o.max));
    const tone = o.now.zone ? ZONE_TONE[o.now.zone] : "none";
    parts.push(`<line class="now-rule" x1="${(cx - (x(1) - x(0)) * 0.8).toFixed(1)}" x2="${(cx - (x(1) - x(0)) * 0.8).toFixed(1)}" y1="${pad.t}" y2="${h - pad.b}"/>`);
    parts.push(`<g class="now ${tone}"><path class="diamond" d="M${cx.toFixed(1)} ${(cy - 8).toFixed(1)} L${(cx + 8).toFixed(1)} ${cy.toFixed(1)} L${cx.toFixed(1)} ${(cy + 8).toFixed(1)} L${(cx - 8).toFixed(1)} ${cy.toFixed(1)} Z"/>${special ? `<circle class="ring" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="12"/>` : ""}<title>${esc(o.now.title)}</title></g>`);
    const above = cy - (special ? 18 : 14) > pad.t + f.font;
    parts.push(`<text class="nowl" x="${(cx - 12).toFixed(1)}" y="${(above ? cy - (special ? 18 : 14) : cy + 26).toFixed(1)}" text-anchor="end">${esc(`${o.now.value}: ${o.now.zone ? ZONE_LABEL[o.now.zone] : "no limits"}`)}</text>`);
    parts.push(`<text class="tick strong" x="${cx.toFixed(1)}" y="${h - pad.b + 16}" text-anchor="middle">${esc(f.w < 500 ? "now" : o.now.label)}</text>`);
  }
  return `<svg class="cc ${o.cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.title)}" style="--fs:${f.font}px">${parts.join("")}</svg>`;
}

/** The section at the top of the page: the zone in words, the two charts, how to read them and the numbers. */
export function controlHtml(c: Control): string {
  const l = c.limits;
  const cur = c.current;
  const tone = cur?.zone ? cur.zone.tone : "none";
  const values = [...c.releases.map((r) => r.prs), ...c.nights.map((n) => n.prs), cur?.prs ?? 0, l?.ucl ?? 0];
  const max = niceMax(Math.max(1, ...values) * 1.08);

  const releasePoints: Point[] = c.releases.map((r) => ({
    label: short(r.tag),
    value: r.prs,
    ring: !!r.special,
    title: `${r.tag} (${day(r.releasedAt)}): ${plural(r.prs, "merged PR")} since ${r.previous}${r.special ? `, ${r.special}: a special cause` : ""}`
  }));
  const now = cur ? { value: cur.prs, label: "main now", zone: cur.zone?.zone ?? null, special: !!cur.special, title: `On main, not yet released: ${plural(cur.prs, "PR")} since ${cur.since}${cur.zone ? `. ${cur.zone.label}` : ""}${cur.special ? ` (${cur.special})` : ""}` } : undefined;
  const sizeTitle = `Release size control chart: merged PRs per release for ${plural(c.releases.length, "release")}${l ? `, centre ${fmt(l.centre)}, UCL ${fmt(l.ucl)}, LCL ${fmt(l.lcl)}${l.provisional ? " (provisional)" : ""}` : ""}${cur ? `; ${cur.prs} on main now, ${cur.zone?.label ?? "no limits"}` : ""}.`;
  const sizeChart = (f: Frame, cls: string, every: number) => chartSvg(c, f, { title: sizeTitle, points: releasePoints, ...(now ? { now } : {}), max, line: true, cls, every });
  const releasesChart = c.releases.length || cur ? `${sizeChart(WIDE, "wide", 1)}${sizeChart(NARROW, "narrow", Math.max(1, Math.ceil(c.releases.length / 3)))}` : `<p class="empty">No release sizes and no count of what is on main: ${esc(c.source)}.</p>`;

  const nightPoints: Point[] = c.nights.map((n) => ({ label: day(n.ranAt), value: n.prs, ring: false, title: `${day(n.ranAt)}: ${plural(n.prs, "PR")} on main since ${n.baseline} (${n.candidate})${n.zone ? `, ${ZONE_LABEL[n.zone]}` : ""}` }));
  const runTitle = `Unreleased PRs on main night by night: ${c.nights.map((n) => `${day(n.ranAt)} ${n.prs}`).join(", ")}.`;
  const runChart = c.nights.length
    ? `${chartSvg(c, { ...WIDE, h: 220 }, { title: runTitle, points: nightPoints, max, line: true, cls: "wide", every: Math.max(1, Math.ceil(c.nights.length / 12)) })}${chartSvg(c, { ...NARROW, h: 210 }, { title: runTitle, points: nightPoints, max, line: true, cls: "narrow", every: Math.max(1, Math.ceil(c.nights.length / 4)) })}`
    : `<p class="empty">No kept forecast counts the PRs since production yet (forecasts kept before harness 1.13.1 have no changes.json).</p>`;

  const headline = cur
    ? `<p class="zone ${tone}"><span class="zl">${esc(cur.zone?.label ?? "No limits yet")}</span> <span class="zw">${esc(cur.zone?.words ?? `${plural(cur.prs, "unreleased PR")} on main; no limits until two releases are measured.`)}</span></p>`
    : `<p class="zone none"><span class="zl">Not counted</span> <span class="zw">Nothing says how many PRs are on main since production: ${esc(c.source)}.</span></p>`;
  const tableRows = [
    ...c.releases.map((r) => `<tr><td>${esc(r.tag)}</td><td>${esc(day(r.releasedAt))}</td><td class="num">${r.prs}</td><td>${r.special ? `<strong>${esc(r.special)}</strong>: a special cause` : l ? "within the limits" : "no limits"}</td></tr>`),
    ...(cur ? [`<tr class="nowrow"><td>main now</td><td>${esc(day(cur.at))}</td><td class="num">${cur.prs}</td><td><strong>${esc(cur.zone?.label ?? "no limits")}</strong>${cur.special ? `, ${esc(cur.special)}` : ""} (not released; since ${esc(cur.since)})</td></tr>`] : [])
  ].join("");
  const nightRows = c.nights.map((n) => `<tr><td>${esc(n.night)}</td><td><code>${esc(n.candidate || "?")}</code></td><td class="num">${n.prs}</td><td>${n.zone ? esc(ZONE_LABEL[n.zone]) : "no limits"} (since ${esc(n.baseline || "?")})</td></tr>`).join("");
  const limitsLine = l
    ? `Centre ${fmt(l.centre)}, mean moving range ${fmt(l.mrBar)}, UCL ${fmt(l.ucl)} (centre + 2.66 × ${fmt(l.mrBar)}), LCL ${fmt(l.lcl)}, from ${plural(l.n, "release")}${l.provisional ? `: provisional until ${PROVISIONAL_BELOW}, so the WIP limit is the centre line` : ""}. WIP limit ${fmt(c.wipLimit!)}.`
    : "No limits: an XmR chart needs at least two releases.";

  return `<section class="control" aria-labelledby="control-title">
<h2 id="control-title">Release size and the WIP limit</h2>
${headline}
<figure class="ccfig"><figcaption><strong>Merged PRs per release</strong>, and what is on main now (the diamond)</figcaption>
${releasesChart}
<p class="key"><span><i class="k-dot"></i>a release</span><span><i class="k-ring"></i>outside the limits: a special cause</span><span><i class="k-centre"></i>centre line (mean)</span><span><i class="k-limit"></i>control limits (UCL, LCL)</span><span><i class="k-now"></i>on main, not released</span><span><i class="k-band"></i>shading: below centre, a good time to release, release now</span></p>
</figure>
<figure class="ccfig"><figcaption><strong>Unreleased PRs on main, night by night</strong>, from each kept forecast, against the same lines</figcaption>
${runChart}
</figure>
<p class="note">${esc(c.summary)} ${esc(limitsLine)}</p>
<details><summary>How to read this chart</summary><div class="how">
<p>Each point is one past release of the monorepo, counted in pull requests merged since the release before it (release branches and direct commits left out). The <strong>centre line</strong> is the mean release size. The <strong>UCL</strong> and <strong>LCL</strong> (upper and lower control limits) are the centre ± 2.66 × the mean moving range, the change from one release to the next: the band a release lands in when nothing unusual happened. A release outside them is a <strong>special cause</strong>, worth asking why.</p>
<p>The diamond is what is on main now, not yet released, against a <strong>WIP limit</strong>: at or below the centre line, <strong>below the centre line</strong>, keep merging; above it and up to the WIP limit, <strong>a good time to release</strong>; over the WIP limit, <strong>release now</strong>. The WIP limit is the UCL; with fewer than ${PROVISIONAL_BELOW} releases the limits are <strong>provisional</strong> and the WIP limit is the centre line, so a short history never licenses a big batch. Smaller, regular releases keep each one easy to judge and to roll back.</p>
<p>The night-by-night chart is the same count from each night's forecast, so a batch can be seen climbing towards the limit. Advisory: none of this changes the Gate, a verdict or an exit code.</p></div></details>
<details><summary>The numbers</summary><div class="scroll"><table class="cct"><thead><tr><th>Release</th><th>Cut</th><th>PRs</th><th>Against the limits</th></tr></thead><tbody>${tableRows || `<tr><td colspan="4">none measured</td></tr>`}</tbody></table>
${c.nights.length ? `<table class="cct"><thead><tr><th>Night</th><th>Main</th><th>PRs</th><th>Zone</th></tr></thead><tbody>${nightRows}</tbody></table>` : ""}</div>
<p class="src">Release history ${esc(c.source)}.</p></details>
</section>`;
}

/** The section's styles, for a page that defines --ink, --ink2, --muted, --rule, --sheet, --pass, --warn, --fail, --accent. */
export const CONTROL_CSS = `
.control{background:var(--sheet);border:1px solid var(--rule);border-radius:8px;padding:6px 16px 14px;margin:16px 0}
.control h2{font-size:1.1rem;margin:10px 0 6px}
.zone{margin:6px 0 10px;padding:8px 12px;border-radius:6px;border-left:6px solid var(--grey);background:var(--bg);font-size:14px}
.zone .zl{display:inline-block;font-weight:800;text-transform:uppercase;letter-spacing:.04em;font-size:12.5px;padding:1px 8px;border-radius:4px;color:#fff;background:var(--grey);margin-right:6px}
.zone.green{border-left-color:var(--pass)} .zone.green .zl{background:var(--pass)}
.zone.amber{border-left-color:var(--warn)} .zone.amber .zl{background:var(--warn)}
.zone.red{border-left-color:var(--fail)} .zone.red .zl{background:var(--fail)}
.ccfig{margin:10px 0 0;min-width:0} .ccfig figcaption{font-size:13px;color:var(--ink2);margin-bottom:4px}
svg.cc{display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
svg.cc.narrow{display:none}
@media (max-width:640px){svg.cc.wide{display:none} svg.cc.narrow{display:block}}
.cc text{font-size:var(--fs);fill:var(--ink2)} .cc .tick{fill:var(--muted)} .cc .tick.strong{fill:var(--ink);font-weight:700}
.cc .grid{stroke:var(--rule);stroke-width:1}
.cc .zoneband{opacity:.11} .cc .zoneband.green{fill:var(--pass)} .cc .zoneband.amber{fill:var(--warn)} .cc .zoneband.red{fill:var(--fail)}
.cc .limit{stroke:var(--ink2);stroke-width:1.25;stroke-dasharray:6 4} .cc .limit.centre{stroke:var(--ink);stroke-dasharray:none;stroke-width:1.5}
.cc .ll{fill:var(--ink);font-weight:600} .cc .prov{fill:var(--ink2);font-style:italic}
.cc .series{fill:none;stroke:var(--accent);stroke-width:2;stroke-linejoin:round;opacity:.8}
.cc .dot{fill:var(--accent);stroke:var(--sheet);stroke-width:2} .cc .hit{fill:transparent}
.cc .ring{fill:none;stroke:var(--fail);stroke-width:2}
.cc .now-rule{stroke:var(--rule);stroke-width:1;stroke-dasharray:2 3}
.cc .diamond{stroke:var(--sheet);stroke-width:2;fill:var(--grey)} .cc .now.green .diamond{fill:var(--pass)} .cc .now.amber .diamond{fill:var(--warn)} .cc .now.red .diamond{fill:var(--fail)}
.cc .nowl{fill:var(--ink);font-weight:700}
.key{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:var(--ink2);margin:6px 0 0}
.key span{display:inline-flex;align-items:center;gap:5px} .key i{display:inline-block;flex:none}
.key .k-dot{width:9px;height:9px;border-radius:50%;background:var(--accent)}
.key .k-ring{width:12px;height:12px;border-radius:50%;border:2px solid var(--fail)}
.key .k-centre{width:18px;border-top:2px solid var(--ink)} .key .k-limit{width:18px;border-top:2px dashed var(--ink2)}
.key .k-now{width:10px;height:10px;transform:rotate(45deg);background:var(--ink2)}
.key .k-band{width:14px;height:10px;background:linear-gradient(var(--fail) 0 33%,var(--warn) 33% 66%,var(--pass) 66%);opacity:.35}
.control .how p{font-size:13.5px;margin:6px 0}
.control .scroll{overflow-x:auto;max-width:100%}
table.cct{border-collapse:collapse;font-size:13px;margin:8px 0;min-width:min(100%,420px)}
.cct th,.cct td{text-align:left;padding:4px 10px 4px 0;border-bottom:1px solid var(--rule);vertical-align:top}
.cct th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2)} .cct td.num{font-variant-numeric:tabular-nums;text-align:right}
.cct tr.nowrow td{font-weight:600}
.control .src{font-size:12px;color:var(--ink2);overflow-wrap:anywhere}
@media (forced-colors:active){.cc .zoneband{display:none} .cc .dot,.cc .diamond{fill:CanvasText} .cc .limit{stroke:CanvasText} .zone .zl{border:1px solid CanvasText}}
`;
