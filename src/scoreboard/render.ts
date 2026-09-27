/**
 * The scoreboard as people read it: a terminal board (`harness scoreboard trends`), the run-rule lines `harness release`
 * prints after the score, and the static page the reports site serves (scoreboard.html, beside scoreboard.json).
 *
 * The page is self-contained: inline SVG, no script, no external request, so it opens offline and on Pages alike. Each
 * chart is a line over releases; the RCS chart shades the three bands, and every dimension chart draws the 75 line the
 * second run rule reads. Hover a point for its value (an SVG <title>); every chart has its numbers in a table too.
 */
import { BANDS } from "../score/weights.ts";
import type { ScoreboardLine } from "./line.ts";
import { RUN_RULE_BELOW, type RunRuleFiring, type Trends } from "./trends.ts";

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const num = (n: number | null | undefined) => (n === null || n === undefined ? "–" : String(n));

// ---- terminal -------------------------------------------------------------------------------------------

/** One line per run rule firing at the newest release, or one line saying none does. */
export function runRuleLines(current: RunRuleFiring[], countermeasures?: Trends["runRules"]["countermeasures"]): string[] {
  const lines = current.length ? current.map((f) => `run rule: ${f.kaizen}${f.acrossWeightsChange ? " [the window spans a change of weights or rules]" : ""} -> opens a kaizen item`) : ["run rules: none firing"];
  if (countermeasures?.status === "not measured") lines.push(`run rule (open countermeasures only rising): not measured, ${countermeasures.reason}`);
  else if (countermeasures?.rising) lines.push(`run rule: open countermeasures rose three releases running (${countermeasures.counts.join(" -> ")}) -> opens a kaizen item`);
  return lines;
}

/** What `harness release` prints after the score: the line it appended, then the run rules. */
export function renderAppended(line: ScoreboardLine, file: string, t: Trends): string[] {
  const measured = line.dimensions.filter((d) => d.status === "measured").length;
  return [`scoreboard: ${line.tag} run ${line.run}, Gate ${line.gate}, ${line.rcs === null ? "no RCS" : `RCS ${line.rcs} ${line.band}`}, ${measured} of 8 dimensions measured -> ${file}`, ...runRuleLines(t.runRules.current, t.runRules.countermeasures).map((l) => `  ${l}`)];
}

export function renderTrends(t: Trends, file?: string): string {
  if (t.empty) return [`Scoreboard: ${t.empty}.${file ? ` (${file})` : ""}`, "", ...healthLines(t)].join("\n");
  const v = t.views;
  const lines = [`Scoreboard: ${t.releases} release(s), ${t.lines} line(s)${file ? ` (${file})` : ""}`, "", "RCS per release:"];
  for (const r of v.rcs) lines.push(`  ${r.tag.padEnd(16)} ${r.gate.padEnd(18)} ${r.rcs === null ? "no RCS" : `${r.rcs} ${r.band}`}${r.runs > 1 ? `  (run ${r.run} of ${r.runs})` : ""}${r.weightsChanged ? "  [new weights or rules]" : ""}`);
  lines.push("", "Dimensions (oldest to newest):");
  for (const d of v.dimensions) lines.push(`  ${d.name.padEnd(27)} ${d.points.map((p) => num(p.score)).join(" ")}`);
  lines.push("", `Masks / never fired: ${v.masks.map((m) => `${num(m.masks)}/${num(m.neverFired)}`).join(" ")}`, `Claims / stale:      ${v.claims.map((c) => `${num(c.claims)}/${num(c.stale)}`).join(" ")}`);
  lines.push("", `Hotspot recurrence (of ${v.hotspots.releasesWithChanges} release(s) with change signals):`);
  if (!v.hotspots.top.length) lines.push("  none yet: no release on the board carries per-PR risk lines");
  for (const h of v.hotspots.top) lines.push(`  ${String(h.releases).padStart(3)}  ${h.file}${h.refactorCandidate ? "  (refactor candidate)" : ""}`);
  lines.push("", ...runRuleLines(t.runRules.current, t.runRules.countermeasures));
  const history = t.runRules.firings.filter((f) => !f.current);
  if (history.length) lines.push(`  earlier firings: ${history.length} (see --json)`);
  for (const d of t.deviations) lines.push(`deviation: ${d.tag} was run ${d.runs} times (RCS ${num(d.firstRcs)} first, ${num(d.latestRcs)} latest)`);
  lines.push("", ...healthLines(t), "", "Advisory: never an input to the gate, a verdict or an exit code.");
  return lines.join("\n");
}

function healthLines(t: Trends): string[] {
  const h = t.selfHealth;
  const m = h.mutants.at(-1);
  const noise = h.noise.status === "measured" ? `noise: ${h.noise.cleanNights} of the last ${h.noise.nights} A/A nights clean; ${h.noise.lastFailure ? `${h.noise.daysSinceLastFailure} day(s) since the last A/A failure (${h.noise.lastFailure})` : `no A/A failure since ${h.noise.since}`}` : `noise: not measured, ${h.noise.reason}`;
  return ["Harness self-health:", `  mutants: ${m ? `${m.caught === null ? "did not run" : `${m.caught} of ${m.total} caught`} in the week of ${m.week} (${h.mutants.length} week(s) recorded)` : "no weekly record yet (harness scoreboard mutants)"}`, `  ${noise}`];
}

// ---- the page -------------------------------------------------------------------------------------------

const W = 640;
const H = 180;
const PAD = { l: 34, r: 12, t: 10, b: 28 };

interface Series {
  name: string;
  /** A CSS custom property holding its colour. */
  color: string;
  values: (number | null)[];
}

/** A line chart over releases on one axis. `bands` shades Green/Amber/Red; `rule` draws a dashed reference line. */
export function lineChart(o: { title: string; labels: string[]; series: Series[]; min?: number; max?: number; bands?: boolean; rule?: number; w?: number; h?: number }): string {
  const w = o.w ?? W;
  const h = o.h ?? H;
  const all = o.series.flatMap((s) => s.values).filter((v): v is number => v !== null);
  const min = o.min ?? 0;
  const max = o.max ?? Math.max(1, ...all);
  const x = (i: number) => PAD.l + (o.labels.length <= 1 ? (w - PAD.l - PAD.r) / 2 : (i * (w - PAD.l - PAD.r)) / (o.labels.length - 1));
  const y = (v: number) => PAD.t + (h - PAD.t - PAD.b) * (1 - (v - min) / (max - min || 1));
  const parts: string[] = [];
  if (o.bands) {
    // Highest first: Green from its min to the top, then Amber, then Red down to the bottom.
    let top = max;
    for (const b of BANDS) {
      const lo = Math.max(min, b.min);
      if (top > lo) parts.push(`<rect class="band ${b.band.toLowerCase()}" x="${PAD.l}" y="${y(top).toFixed(1)}" width="${w - PAD.l - PAD.r}" height="${(y(lo) - y(top)).toFixed(1)}"><title>${b.band}: ${b.min} or more</title></rect>`);
      top = lo;
    }
  }
  for (const t of [min, max, ...(o.bands ? [75, 90] : [])]) parts.push(`<line class="grid" x1="${PAD.l}" x2="${w - PAD.r}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text class="tick" x="${PAD.l - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${t}</text>`);
  if (o.rule !== undefined) parts.push(`<line class="rule" x1="${PAD.l}" x2="${w - PAD.r}" y1="${y(o.rule).toFixed(1)}" y2="${y(o.rule).toFixed(1)}"/>`);
  const every = Math.max(1, Math.ceil(o.labels.length / 8));
  o.labels.forEach((l, i) => {
    if (i % every === 0 || i === o.labels.length - 1) parts.push(`<text class="tick" x="${x(i).toFixed(1)}" y="${h - 8}" text-anchor="middle">${esc(l)}</text>`);
  });
  for (const s of o.series) {
    // A gap (not measured) breaks the line rather than being drawn as zero.
    const runs: string[] = [];
    let cur: string[] = [];
    s.values.forEach((v, i) => {
      if (v === null) {
        if (cur.length) runs.push(cur.join(" "));
        cur = [];
      } else cur.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    });
    if (cur.length) runs.push(cur.join(" "));
    for (const r of runs) parts.push(`<polyline class="line" style="stroke:var(${s.color})" points="${r}"/>`);
    s.values.forEach((v, i) => {
      if (v !== null) parts.push(`<circle class="dot" style="fill:var(${s.color})" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4"><title>${esc(`${o.labels[i]}: ${s.name} ${v}`)}</title></circle>`);
    });
  }
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.title)}">${parts.join("")}</svg>`;
}

function legend(series: Series[]): string {
  return series.length < 2 ? "" : `<p class="legend">${series.map((s) => `<span><i style="background:var(${s.color})"></i>${esc(s.name)}</span>`).join("")}</p>`;
}

function table(headers: string[], rows: (string | number | null)[][]): string {
  return `<details><summary>Table</summary><div class="scroll"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(num(c as number | null))}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
}

function spark(values: number[]): string {
  const max = Math.max(1, ...values);
  const w = 120;
  const h = 24;
  const x = (i: number) => (values.length <= 1 ? w / 2 : 2 + (i * (w - 4)) / (values.length - 1));
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${(h - 2 - ((h - 4) * v) / max).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline class="line" style="stroke:var(--series-2)" points="${pts}"/></svg>`;
}

function section(id: string, title: string, about: string, body: string): string {
  return `<section id="${id}"><h2>${esc(title)}</h2><p class="note">${about}</p>${body}</section>`;
}

function runRulesHtml(t: Trends): string {
  const cur = t.runRules.current;
  const earlier = t.runRules.firings.filter((f) => !f.current);
  const item = (f: RunRuleFiring) => `<li>${esc(f.kaizen)}${f.acrossWeightsChange ? " <em>(the window spans a change of weights or rules)</em>" : ""}</li>`;
  const cm = t.runRules.countermeasures;
  return `${cur.length ? `<div class="andon"><strong>Run rules firing at ${esc(cur[0]!.at)}: each opens a kaizen item naming the dimension.</strong><ul>${cur.map(item).join("")}</ul></div>` : `<p>No run rule fires at the newest release.</p>`}
${earlier.length ? `<details><summary>Earlier firings (${earlier.length})</summary><ul>${earlier.map(item).join("")}</ul></details>` : ""}
<p class="note">Open countermeasures only rising: ${cm.status === "measured" ? (cm.rising ? "<strong>firing</strong>" : "not firing") : esc(`not measured, ${cm.reason}`)}.</p>
${t.deviations.length ? `<p class="note">Re-runs (each a logged deviation; the trend plots the latest run): ${t.deviations.map((d) => esc(`${d.tag} ×${d.runs}, RCS ${num(d.firstRcs)} then ${num(d.latestRcs)}`)).join("; ")}.</p>` : ""}`;
}

function healthHtml(t: Trends): string {
  const h = t.selfHealth;
  const n = h.noise;
  const tiles = `<div class="tiles">
<div class="tile"><span class="big">${n.status === "measured" ? `${Math.round(n.cleanRate * 100)}%` : "–"}</span><span>A/A nights clean${n.status === "measured" ? `, last ${n.nights}` : ""}</span></div>
<div class="tile"><span class="big">${n.status === "measured" ? (n.daysSinceLastFailure === null ? "none" : String(n.daysSinceLastFailure)) : "–"}</span><span>${n.status === "measured" ? (n.lastFailure ? "days since the last A/A failure" : `A/A failures since ${esc(n.since.slice(0, 10))}`) : esc(`noise not measured: ${n.reason}`)}</span></div>
<div class="tile"><span class="big">${h.mutants.at(-1) ? (h.mutants.at(-1)!.caught === null ? "not run" : `${h.mutants.at(-1)!.caught}/${h.mutants.at(-1)!.total}`) : "–"}</span><span>mutants caught, latest week</span></div>
</div>`;
  const series: Series[] = [
    { name: "caught", color: "--series-1", values: h.mutants.map((m) => m.caught) },
    { name: "planted", color: "--series-2", values: h.mutants.map((m) => m.total) }
  ];
  const chart = h.mutants.length ? `${legend(series)}${lineChart({ title: "Mutants caught per week", labels: h.mutants.map((m) => m.week), series, min: 0 })}${table(["week", "caught", "planted"], h.mutants.map((m) => [m.week, m.caught, m.total]))}` : `<p class="empty">No weekly mutants record yet.</p>`;
  return `${tiles}${chart}`;
}

/** scoreboard.html: the six views, the run rules and the harness's own health, or an explicit empty state. */
export function renderSite(t: Trends): string {
  const v = t.views;
  const labels = v.rcs.map((r) => r.tag);
  const body: string[] = [];
  if (t.empty) {
    body.push(`<p class="empty-state"><strong>No releases scored yet.</strong> Each release run appends one line to <code>scoreboard/releases.jsonl</code>; the six trend views appear with the first.</p>`);
  } else {
    const rcs: Series[] = [{ name: "RCS", color: "--series-1", values: v.rcs.map((r) => r.rcs) }];
    const breaks = v.rcs.filter((r) => r.weightsChanged).map((r) => r.tag);
    body.push(
      section("rcs", "1. RCS per release", `Against the bands: Green 90 or more, Amber 75 to 89, Red below 75. A release with no RCS (a FAIL, or nothing measured) is a gap, never a zero.${breaks.length ? ` New weights or rules from ${breaks.map(esc).join(", ")}: a discontinuity, not an improvement.` : ""}`, `${lineChart({ title: "RCS per release", labels, series: rcs, min: 0, max: 100, bands: true })}${table(["release", "run", "gate", "RCS", "band"], v.rcs.map((r) => [r.tag, r.run, r.gate, r.rcs, r.band]))}`)
    );
    body.push(
      section(
        "dimensions",
        "2. The eight dimensions",
        `Small multiples, so a slow slide in one shows before the total moves. The dashed line is ${RUN_RULE_BELOW}: two of three releases below it, or three declines in a row, is a run rule.`,
        `<div class="multiples">${v.dimensions.map((d) => `<figure><figcaption>${esc(d.name)}</figcaption>${lineChart({ title: d.name, labels, series: [{ name: d.name, color: "--series-1", values: d.points.map((p) => p.score) }], min: 0, max: 100, rule: RUN_RULE_BELOW, w: 300, h: 130 })}</figure>`).join("")}</div>${table(["release", ...v.dimensions.map((d) => d.name)], labels.map((l, i) => [l, ...v.dimensions.map((d) => d.points[i]!.score)]))}`
      )
    );
    const masks: Series[] = [
      { name: "masks", color: "--series-1", values: v.masks.map((m) => m.masks) },
      { name: "never fired", color: "--series-2", values: v.masks.map((m) => m.neverFired) }
    ];
    body.push(section("masks", "3. Masks, and masks that never fired", "Both growing means the harness is going blind: a mask is a blind spot you chose.", `${legend(masks)}${lineChart({ title: "Masks and masks that never fired", labels, series: masks })}${table(["release", "masks", "never fired"], v.masks.map((m) => [m.tag, m.masks, m.neverFired]))}`));
    const claims: Series[] = [
      { name: "claims", color: "--series-1", values: v.claims.map((c) => c.claims) },
      { name: "stale", color: "--series-2", values: v.claims.map((c) => c.stale) }
    ];
    body.push(section("claims", "4. Claims and stale claims", "A rising stale count means changelogs are drifting from the code.", `${legend(claims)}${lineChart({ title: "Claims and stale claims", labels, series: claims })}${table(["release", "claims", "stale"], v.claims.map((c) => [c.tag, c.claims, c.stale]))}`));
    const hs = v.hotspots;
    const maxR = Math.max(1, ...hs.top.map((x) => x.releases));
    body.push(
      section(
        "hotspots",
        "5. Hotspot recurrence",
        `The five files touched by the most releases, of ${hs.releasesWithChanges} with change signals. A file that appears every time is a refactor candidate.`,
        hs.top.length ? `<table class="bars"><tbody>${hs.top.map((x) => `<tr><td><code>${esc(x.file)}</code>${x.refactorCandidate ? " <small>refactor candidate</small>" : ""}</td><td class="num">${x.releases}</td><td class="barcell"><span class="bar" style="width:${Math.round((x.releases / maxR) * 100)}%" title="${esc(x.tags.join(", "))}"></span></td></tr>`).join("")}</tbody></table>` : `<p class="empty">No release on the board carries per-PR risk lines yet (change risk needs the monorepo checkout).</p>`
      )
    );
    const files = v.risk.files;
    const people = v.risk.contributors;
    body.push(
      section(
        "risk",
        "6. Per-file risk over time",
        "The change-risk points each file cost, per release with change signals.",
        `${files.length ? `<table><thead><tr><th>file</th><th>points</th><th>over releases</th></tr></thead><tbody>${files.map((f) => `<tr><td><code>${esc(f.file)}</code></td><td class="num">${f.total}</td><td>${spark(f.points.map((p) => p.points))}</td></tr>`).join("")}</tbody></table>` : `<p class="empty">No file has cost change-risk points yet.</p>`}
<details><summary>Per contributor (for trends only)</summary><p class="note">${esc(people.note)}</p>${people.rows.length ? `<table><thead><tr><th>contributor</th><th>points</th><th>over releases</th></tr></thead><tbody>${people.rows.map((r) => `<tr><td>${esc(r.author)}</td><td class="num">${r.total}</td><td>${spark(r.points.map((p) => p.points))}</td></tr>`).join("")}</tbody></table>` : "<p class=\"empty\">None yet.</p>"}</details>`
      )
    );
    body.push(section("run-rules", "Run rules (the andon for trends)", "Statistical process control over each dimension and the RCS: three consecutive declines, or two of three releases below 75. They fire on trends, not on a single bad release.", runRulesHtml(t)));
  }
  body.push(section("self-health", "Harness self-health", "Is the harness itself getting better? Mutants caught per week, how clean the nightly A/A runs are, and days since the last A/A failure.", healthHtml(t)));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Release scoreboard</title>
<style>
  :root { color-scheme: light; --surface:#fcfcfb; --ink:#0b0b0b; --ink-2:#52514e; --muted:#898781; --grid:#e1e0d9; --axis:#c3c2b7; --series-1:#2a78d6; --series-2:#eb6834; --good:#0ca30c; --warning:#fab219; --critical:#d03b3b; --rule:#8884; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; --surface:#1a1a19; --ink:#ffffff; --ink-2:#c3c2b7; --grid:#2c2c2a; --axis:#383835; --series-1:#3987e5; --series-2:#d95926; } }
  :root[data-theme="dark"] { color-scheme: dark; --surface:#1a1a19; --ink:#ffffff; --ink-2:#c3c2b7; --grid:#2c2c2a; --axis:#383835; --series-1:#3987e5; --series-2:#d95926; }
  body { margin:0 auto; padding:24px 16px 48px; max-width:64rem; font:15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; background:var(--surface); color:var(--ink); }
  h1 { font-size:1.4rem; margin:0 0 4px; } h2 { font-size:1.1rem; margin:32px 0 2px; }
  .note { font-size:13px; color:var(--ink-2); margin:0 0 8px; max-width:75ch; }
  .chart { width:100%; height:auto; display:block; } .spark { width:120px; height:24px; }
  .chart .band.green { fill:var(--good); opacity:.12; } .chart .band.amber { fill:var(--warning); opacity:.16; } .chart .band.red { fill:var(--critical); opacity:.12; }
  .chart .grid { stroke:var(--grid); stroke-width:1; } .chart .rule { stroke:var(--muted); stroke-width:1; stroke-dasharray:4 3; }
  .chart .tick { fill:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; }
  .line { fill:none; stroke-width:2; stroke-linejoin:round; stroke-linecap:round; } .dot { stroke:var(--surface); stroke-width:2; }
  .multiples { display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:12px; } figure { margin:0; } figcaption { font-size:13px; color:var(--ink-2); }
  .legend { display:flex; gap:16px; font-size:13px; color:var(--ink-2); margin:4px 0; } .legend i { display:inline-block; width:12px; height:3px; border-radius:2px; margin-right:6px; vertical-align:middle; }
  .scroll { overflow-x:auto; } table { border-collapse:collapse; width:100%; margin:8px 0 0; font-size:14px; }
  th, td { text-align:left; vertical-align:middle; padding:5px 8px; border-bottom:1px solid var(--rule); } th { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--ink-2); }
  td.num { font-variant-numeric:tabular-nums; white-space:nowrap; } .barcell { width:40%; } .bar { display:block; height:10px; border-radius:0 4px 4px 0; background:var(--series-1); }
  details summary { cursor:pointer; font-size:13px; color:var(--ink-2); } code { font:13px ui-monospace, Menlo, Consolas, monospace; word-break:break-all; }
  .andon { border-left:4px solid var(--critical); padding:4px 12px; } .andon ul { margin:6px 0; padding-left:1.2rem; }
  .tiles { display:flex; flex-wrap:wrap; gap:12px; margin:8px 0; } .tile { flex:1 1 180px; border:1px solid var(--rule); border-radius:6px; padding:10px 12px; display:flex; flex-direction:column; font-size:13px; color:var(--ink-2); }
  .tile .big { font-size:1.6rem; font-weight:600; color:var(--ink); }
  .empty, .empty-state { color:var(--ink-2); } .empty-state { font-size:15px; border:1px dashed var(--rule); border-radius:6px; padding:16px; }
  a:focus-visible, summary:focus-visible { outline:2px solid currentColor; outline-offset:2px; }
  footer { font-size:12px; color:var(--ink-2); border-top:1px solid var(--rule); padding-top:12px; margin-top:40px; }
</style>
</head>
<body>
<h1>Release scoreboard</h1>
<p class="note">Visual management over time: one line per release run, drawn from <code>scoreboard/releases.jsonl</code> (${t.releases} release(s), ${t.lines} line(s)). Advisory: the Gate wins, and nothing here changes a verdict or an exit code. The same numbers are in <a href="scoreboard.json">scoreboard.json</a>.</p>
${body.join("\n")}
<footer>Generated ${esc(t.generatedAt)} by <code>harness scoreboard trends --site</code>. <a href="./">All kept reports</a>.</footer>
</body>
</html>
`;
}
