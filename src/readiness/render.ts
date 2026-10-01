/**
 * The overnight readiness page as HTML: readiness.html, beside the reports site's index. Last night first, expanded, then
 * one row per night for the last ten, newest on top. A night that kept nothing is said in words (unchanged, in grey, with
 * the verdict it repeats; or did not run), never left out, so a quiet night cannot be mistaken for a missing one.
 *
 * Since 1.19.0 the release-size control chart leads the page (src/readiness/control-render.ts): how big each release
 * was, the XmR limits, and where the batch on main sits against the WIP limit.
 *
 * Self-contained like a3.html: inline CSS, no script, no external request. Light and dark follow the reader's setting,
 * and below 640px each row becomes a card, so the page never scrolls sideways on a phone.
 */
import { QUALITY_CSS, qualityMarksHtml, qualityStripHtml, safeHref } from "../a3/render.ts";
import { CONTROL_CSS, controlHtml } from "./control-render.ts";
import { NIGHTS, deltaWords, type Forecast, type Night, type Readiness } from "./model.ts";

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const when = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
const time = (iso: string) => `${iso.slice(11, 16)} UTC`;
const link = (label: string, href?: string | null) => {
  const h = safeHref(href ?? undefined);
  return h ? `<a href="${esc(h)}">${esc(label)}</a>` : esc(label);
};
const tone = (gate: string) => (/^PASS/.test(gate) ? "pass" : /^WARN/.test(gate) ? "warn" : /^FAIL/.test(gate) ? "fail" : "none");
const gateBadge = (gate: string, grey = false) => `<span class="verdict ${grey ? "grey" : tone(gate)}">${esc(gate)}</span>`;
const nightLabel = (night: string) => {
  const d = new Date(`${night}T00:00:00Z`);
  return `${d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })} ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}`;
};

function deltaHtml(f: Forecast): string {
  const d = f.delta;
  if (!d) return `<span class="muted" title="kept before harness 1.16.1, which counts what is new since the previous forecast">not counted</span>`;
  if (!d.against) return `<span class="muted">${esc(deltaWords(d))}</span>`;
  return `<span class="delta" title="${esc(`against ${d.against.candidate} (${when(d.against.ranAt)}), judged by harness ${d.against.harnessVersion}`)}"><span class="new">+${d.new ?? 0}</span> / <span class="gone">−${d.gone ?? 0}</span></span>`;
}

function evidence(f: Forecast): string {
  const parts = [f.links.report ? link("report", f.links.report) : "", ...f.links.rehearsals.map((r) => `${link(r.mode, r.href)}${r.verdict ? ` <span class="rv ${tone(r.verdict)}">${esc(r.verdict)}</span>` : ""}`), f.runUrl ? link("run", f.runUrl) : ""].filter(Boolean);
  return parts.join(" · ") || `<span class="muted">none kept</span>`;
}

const commitHtml = (f: Forecast) => `<code>${esc(f.candidate || "?")}</code>${f.commitUrl ? ` <a class="sha" href="${esc(f.commitUrl)}" title="${esc(f.commit!)}">commit</a>` : ""}`;

function forecastRow(night: Night, f: Forecast, first: boolean, lastId?: string): string {
  const nightCell = first ? `<strong>${esc(nightLabel(night.night))}</strong> <span class="t">${esc(time(f.ranAt))}</span>` : `<span class="t">earlier, ${esc(time(f.ranAt))}</span>`;
  return `<tr class="judged${first ? "" : " earlier"}">
<td data-k="Night"><span class="v">${nightCell}</span></td>
<td data-k="Main"><span class="v">${commitHtml(f)}<span class="base">beside ${esc(f.baseline || "?")}</span></span></td>
<td data-k="Gate"><span class="v">${gateBadge(f.gate)}</span></td>
<td data-k="Unclaimed" class="num"><span class="v">${f.unclaimed === null ? `<span class="muted">?</span>` : f.unclaimed}</span></td>
<td data-k="New / gone" class="num"><span class="v">${deltaHtml(f)}</span></td>
<td data-k="Quality"><span class="v">${qualityMarksHtml(f.quality, first && f.id === lastId ? "#quality" : f.links.report)}</span></td>
<td data-k="Evidence"><span class="v">${evidence(f)}</span></td>
</tr>`;
}

function quietRow(n: Night): string {
  const runs = n.runs.map((r) => link(r.conclusion ?? "running", r.url)).join(" · ");
  if (n.state === "unchanged" && n.since)
    return `<tr class="quiet unchanged">
<td data-k="Night"><span class="v"><strong>${esc(nightLabel(n.night))}</strong></span></td>
<td data-k="Main"><span class="v"><code>${esc(n.since.candidate || "?")}</code><span class="base">unchanged since ${esc(nightLabel(n.since.night))}</span></span></td>
<td data-k="Gate"><span class="v">${gateBadge(n.since.gate, true)}</span></td>
<td data-k="Unclaimed" class="num muted"><span class="v">as then</span></td>
<td data-k="New / gone" class="num muted"><span class="v">+0 / −0</span></td>
<td data-k="Quality" class="muted"><span class="v">as then</span></td>
<td data-k="Evidence"><span class="v">${runs ? `skipped: ${runs}` : ""}</span></td>
</tr>`;
  return `<tr class="quiet ${n.state.replaceAll(" ", "-")}">
<td data-k="Night"><span class="v"><strong>${esc(nightLabel(n.night))}</strong></span></td>
<td data-k="State" colspan="6"><span class="v"><span class="state">${esc(n.state)}</span> ${esc(n.note)}${runs ? ` ${runs}` : ""}</span></td>
</tr>`;
}

function rowsHtml(r: Readiness): string {
  const lastId = r.nights.find((x) => x.forecasts.length)?.forecasts[0]?.id;
  return r.nights
    .map((n) => {
      const body = n.forecasts.length ? n.forecasts.map((f, i) => forecastRow(n, f, i === 0, lastId)).join("\n") : quietRow(n);
      const rule = n.baselineMoved ? `\n<tr class="rule"><td colspan="7">Production moved here: ${esc(n.baselineMoved.from)} below, ${esc(n.baselineMoved.to)} above. The delta starts again: two baselines are never compared.</td></tr>` : "";
      return body + rule;
    })
    .join("\n");
}

/** Last night, expanded: the newest judged forecast on the page, with everything needed to cut a release from it. */
function lastNight(r: Readiness): string {
  const n = r.nights.find((x) => x.forecasts.length);
  const top = r.nights[0]!;
  if (!n) return `<section class="last"><p class="empty">No forecast kept in the last ${NIGHTS} nights. The first lands the morning after the nightly A/A; Main to RC can also be run by hand (workflow_dispatch).</p></section>`;
  const f = n.forecasts[0]!;
  const by = f.delta?.byArtefact ? Object.entries(f.delta.byArtefact) : [];
  const since = n === top ? "" : `<p class="note">Tonight: ${esc(top.note)}</p>`;
  const digests = Object.entries(f.digests);
  return `<section class="last" aria-labelledby="last-title">
<h2 id="last-title">${n === top ? "Tonight" : "Latest forecast"}: ${esc(nightLabel(n.night))}, ${esc(time(f.ranAt))}</h2>${since}
<div class="tiles">
<div class="tile gate ${tone(f.gate)}"><span class="k">Gate</span><span class="huge">${esc(f.gate)}</span><span class="sub">main ${esc(f.candidate)} beside production ${esc(f.baseline)}</span></div>
<div class="tile"><span class="k">Unclaimed</span><span class="big">${f.unclaimed ?? "?"}</span><span class="sub">differences the next release owes a claim or a fix</span></div>
<div class="tile"><span class="k">New / gone since the last forecast</span><span class="big">${deltaHtml(f)}</span><span class="sub">${f.delta?.against ? `against ${esc(f.delta.against.candidate)}, ${esc(when(f.delta.against.ranAt))}` : f.delta ? "nothing earlier beside this production" : "kept before harness 1.16.1 counted it"}</span></div>
</div>
${by.length ? `<p class="by">By artefact: ${by.map(([a, v]) => `<code>${esc(a)}</code> <span class="new">+${v.new}</span>/<span class="gone">−${v.gone}</span>`).join(" · ")}${f.links.report ? ` · ${link("the new ones, in the report", `${f.links.report}#delta`)}` : ""}</p>` : ""}
<dl class="pick">
<div><dt>Commit to branch from</dt><dd>${f.commit ? `${f.commitUrl ? `<a href="${esc(f.commitUrl)}"><code>${esc(f.commit)}</code></a>` : `<code>${esc(f.commit)}</code>`}` : `<span class="muted">not in the kept report</span>`}</dd></div>
<div><dt>Evidence</dt><dd>${evidence(f)}</dd></div>
<div><dt>Judged by</dt><dd>harness <code>${esc(f.harnessVersion)}</code></dd></div>
</dl>
<div class="quality" id="quality">${qualityStripHtml(f.quality)}</div>
${digests.length ? `<details><summary>The ${digests.length} image digests</summary><ul class="digests">${digests.map(([app, d]) => `<li><code>${esc(app)}</code> <code class="dg">${esc(d)}</code></li>`).join("")}</ul></details>` : ""}
</section>`;
}

const CSS = `
:root{color-scheme:light;--bg:#f4f3ef;--sheet:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--muted:#6f6d68;--rule:#dddbd4;--grey:#8a8883;
--pass:#2f7a4f;--warn:#8a6119;--fail:#a12a2a;--accent:#2a78d6;--new:#a12a2a;--gone:#2f7a4f;--hatch:#c9c7c0}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#121211;--sheet:#1a1a19;--ink:#ffffff;--ink2:#c3c2b7;--muted:#a19f96;--rule:#383835;--grey:#77756f;
--pass:#3f9a66;--warn:#c28a2a;--fail:#d05050;--accent:#3987e5;--new:#e07070;--gone:#5fb886;--hatch:#4a4945}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#121211;--sheet:#1a1a19;--ink:#ffffff;--ink2:#c3c2b7;--muted:#a19f96;--rule:#383835;--grey:#77756f;
--pass:#3f9a66;--warn:#c28a2a;--fail:#d05050;--accent:#3987e5;--new:#e07070;--gone:#5fb886;--hatch:#4a4945}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)} a:focus-visible,summary:focus-visible{outline:2px solid currentColor;outline-offset:2px}
code{font:13px ui-monospace,Menlo,Consolas,monospace;overflow-wrap:anywhere}
.page{max-width:72rem;margin:0 auto;padding:20px 16px 40px}
.title{border-bottom:3px solid var(--ink);padding-bottom:8px}
.title h1{font-size:1.5rem;margin:0} .title h1 span{font-weight:400;color:var(--ink2)}
.meta,.note{font-size:13px;color:var(--ink2);margin:4px 0 0}
.muted{color:var(--muted)}
.last{background:var(--sheet);border:1px solid var(--rule);border-radius:8px;padding:6px 16px 14px;margin:16px 0}
.last h2{font-size:1.1rem;margin:10px 0 6px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:10px;margin:10px 0}
.tile{border:1px solid var(--rule);border-radius:8px;padding:8px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}
.tile .k{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink2)}
.tile .huge{font-size:2.2rem;font-weight:800;line-height:1.05} .tile .big{font-size:1.6rem;font-weight:700;line-height:1.2} .tile .sub{font-size:12.5px;color:var(--ink2)}
.tile.gate{color:#fff;border:0} .tile.gate .k,.tile.gate .sub{color:#ffffffd9}
.tile.gate.fail{background:var(--fail)} .tile.gate.warn{background:var(--warn)} .tile.gate.pass{background:var(--pass)} .tile.gate.none{background:var(--grey)}
.by{font-size:13px;margin:4px 0}
dl.pick{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:6px 18px;margin:8px 0 0} dl.pick dt{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2)} dl.pick dd{margin:0;font-size:13.5px}
ul.digests{margin:6px 0 0;padding-left:1.1rem;font-size:12.5px} .dg{font-size:11.5px}
details summary{cursor:pointer;font-size:13px;color:var(--ink2);margin-top:8px}
.verdict{display:inline-block;padding:1px 8px;border-radius:4px;color:#fff;font-weight:700;font-size:12px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
.verdict.pass{background:var(--pass)} .verdict.warn{background:var(--warn)} .verdict.fail{background:var(--fail)} .verdict.none{background:var(--grey)}
.verdict.grey{background:transparent;color:var(--muted);border:1px solid var(--grey)}
.rv{font-size:11px;font-weight:700} .rv.pass{color:var(--pass)} .rv.warn{color:var(--warn)} .rv.fail{color:var(--fail)}
.new{color:var(--new);font-weight:700} .gone{color:var(--gone);font-weight:700}
h2.strip-title{font-size:1.1rem;margin:22px 0 2px}
table.strip{border-collapse:collapse;width:100%;margin:8px 0 0;font-size:14px;background:var(--sheet);border:1px solid var(--rule);border-radius:8px}
.strip th,.strip td{text-align:left;vertical-align:top;padding:7px 9px;border-bottom:1px solid var(--rule)}
.strip th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2);white-space:nowrap}
.strip td.num{font-variant-numeric:tabular-nums;white-space:nowrap}
.strip .t{color:var(--ink2);font-size:12.5px;white-space:nowrap} .strip .base{display:block;font-size:12px;color:var(--ink2)}
.strip tr.earlier td{font-size:13px;border-top:0;padding-top:2px} .strip tr.earlier .verdict{font-size:11px}
.strip tr.quiet td{color:var(--muted)} .strip tr.quiet code{color:var(--muted)}
.strip .state{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border:1px solid var(--grey);border-radius:4px;padding:0 6px;margin-right:4px}
.strip tr.rule td{border-top:3px double var(--ink);font-size:12.5px;color:var(--ink2);font-style:italic}
.quality{margin:10px 0 0} .quality .quality-strip{background:transparent}
.quality-strip details summary{margin-top:2px}
${QUALITY_CSS}
${CONTROL_CSS}
footer{font-size:12px;color:var(--ink2);border-top:1px solid var(--rule);margin-top:20px;padding-top:10px}
.empty{color:var(--ink2)}
@media (max-width:640px){
  table.strip,.strip tbody,.strip tr,.strip td{display:block;width:100%}
  .strip thead{display:none}
  .strip tr{border-bottom:1px solid var(--rule);padding:8px 10px}
  .strip td{border:0;padding:2px 0;display:grid;grid-template-columns:6.5rem minmax(0,1fr);gap:8px;align-items:start} .strip td .v{min-width:0}
  .strip td::before{content:attr(data-k);font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2);padding-top:2px}
  .strip td[data-k="Night"]{display:block} .strip td[data-k="Night"]::before{content:none}
  .strip td.num{white-space:normal}
  .strip tr.earlier{padding-top:0;margin-left:12px;width:auto;border-left:3px solid var(--rule);padding-left:10px}
  .strip tr.rule td{display:block} .strip tr.rule td::before{content:none}
}
`;

export function renderReadiness(r: Readiness): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Overnight readiness</title>
<meta name="description" content="Main to RC, night by night: the commit judged, its Gate and what is new since the night before, for the last ${NIGHTS} nights.">
<style>${CSS}</style>
</head>
<body>
<main class="page">
<header class="title"><h1>Overnight readiness <span>· main against production, the last ${NIGHTS} nights</span></h1>
<p class="meta">Built ${esc(when(r.builtAt))} by harness <code>${esc(r.harness)}</code> · <a href="./">all reports</a> · <a href="a3.html">A3</a> · <a href="readiness.json">readiness.json</a></p></header>
<p class="note">One row per night (UTC), newest on top, from the Main to RC forecasts kept on the <code>main-preview</code> branch. To pick a night, read two rows: what the later one added, and whether its Gate moved. The quality marks (Speed, Metrics, Tests) are a reading aid and never change the Gate. A night that kept nothing says why in words. The band is left off the rows while the review floor caps the score; the Gate is what decides. A forecast, never a gate.</p>
${controlHtml(r.control)}
${lastNight(r)}
<h2 class="strip-title">Night by night</h2>
<table class="strip"><thead><tr><th>Night</th><th>Main</th><th>Gate</th><th>Unclaimed</th><th>New / gone</th><th>Quality</th><th>Evidence</th></tr></thead>
<tbody>
${rowsHtml(r)}
</tbody></table>
<footer>${r.sources.forecasts} forecast(s) kept in these ${NIGHTS} nights. Workflow history: ${esc(r.sources.github)}. Advisory: nothing here is an input to the Gate, a verdict or an exit code. Run by hand with Main to RC's workflow_dispatch (force judges a pair again); the page rebuilds when it finishes.</footer>
</main>
</body>
</html>
`;
}
