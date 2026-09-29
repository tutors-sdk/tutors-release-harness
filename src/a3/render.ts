/**
 * The A3 Aggregator as a page: a3.html, the centerpiece of the reports site. One sheet, read left to right the way a
 * Lean A3 is: the Gate and the score on top, then Plan on the left (1 Background, 2 Current condition with the value
 * stream map and the Paretos, 3 Goal, 4 Root cause analysis with the 5 Whys) and Do, Check, Act on the right
 * (5 Countermeasures, 6 Plan, 7 Follow-up).
 *
 * Self-contained like scoreboard.html: inline CSS and SVG, no script, no external request, so it opens offline, on
 * Pages and printed on an A3 sheet alike. Light and dark follow the reader's setting. Every chart has its numbers in a
 * table too, and every bar and box says its value on hover.
 */
import { REPO, duration, type A3, type FiveWhys, type Pareto, type Rca, type Score, type ValueStream } from "./model.ts";

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const day = (iso?: string) => (iso ? iso.slice(0, 10) : "");
const when = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;

/** A link only to an https URL or a path inside the site; anything else is text, never guessed into a link. */
export function safeHref(h: string | undefined): string | undefined {
  if (!h) return undefined;
  if (/^https:\/\/[^\s"<>]+$/.test(h)) return h;
  if (/^[A-Za-z0-9_-][A-Za-z0-9._/-]*(#[^\s"<>]*)?$/.test(h) && !h.split("/").includes("..")) return h;
  return undefined;
}
const link = (label: string, href?: string) => {
  const h = safeHref(href);
  return h ? `<a href="${esc(h)}">${esc(label)}</a>` : esc(label);
};

/** The little Markdown a 5 Whys answer carries: links, `code`, **bold**, and "- " lists. Everything else is text. */
export function inlineMd(text: string): string {
  const inline = (s: string) =>
    esc(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
        const h = safeHref(href.replaceAll("&amp;", "&"));
        return h ? `<a href="${esc(h)}">${label}</a>` : label;
      })
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const out: string[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    if (list.length) out.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join("")}</ul>`);
    para = [];
    list = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const item = /^[-*]\s+(.*)$/.exec(line);
    if (item) {
      if (para.length) {
        out.push(`<p>${inline(para.join(" "))}</p>`);
        para = [];
      }
      list.push(item[1]!);
    } else if (list.length) list[list.length - 1] += ` ${line}`;
    else para.push(line.replace(/^>\s?/, ""));
  }
  flush();
  return out.join("");
}

const tone = (gate: string) => (/^PASS/.test(gate) ? "pass" : /^WARN/.test(gate) ? "warn" : "fail");

// ---- the andon board ------------------------------------------------------------------------------------

function andon(s: Score | null, a: A3): string {
  if (!s) return `<section class="andon"><p class="empty">No judged run kept yet: the first Main to RC forecast or release candidate fills this board.</p></section>`;
  const t = tone(s.gate);
  const rcs =
    s.rcs !== null
      ? `<div class="tile rcs"><span class="k">Release Confidence Score</span><span class="big">${s.rcs}</span><span class="band ${esc(String(s.band).toLowerCase())}">${esc(String(s.band))}</span></div>`
      : `<div class="tile rcs"><span class="k">Release Confidence Score</span><span class="big muted">none</span><span class="sub">The Gate wins: no number talks a ${esc(s.gate)} back on</span></div>`;
  const dims = s.dimensions.length
    ? `<div class="tile dims"><span class="k">The eight dimensions ${s.rcs === null ? "(for the root cause, not a decision)" : ""}</span><ul>${s.dimensions
        .map((d) => {
          const w = d.score ?? 0;
          const cls = d.score === null ? "nm" : d.score >= 90 ? "g" : d.score >= 75 ? "a" : "r";
          return `<li title="${esc(`${d.name}: ${d.score === null ? `not measured (${d.reason ?? "no input"})` : `${d.score} of 100, weight ${d.weight}`}`)}"><span class="dn">${esc(d.name)}</span><span class="meter"><span class="fill ${cls}" style="width:${d.score === null ? 100 : Math.max(2, w)}%"></span></span><span class="dv">${d.score === null ? "n/m" : d.score}</span></li>`;
        })
        .join("")}</ul></div>`
    : "";
  const small = [
    s.lastRelease ? `<div class="tile small"><span class="k">Last release gate</span><span class="mid"><span class="verdict ${tone(s.lastRelease.verdict)}">${esc(s.lastRelease.verdict)}</span></span><span class="sub">${esc(s.lastRelease.candidate)} beside ${esc(s.lastRelease.baseline)}, ${esc(day(s.lastRelease.ranAt))} · ${link("report", s.lastRelease.report)}</span></div>` : "",
    s.postDeploy ? `<div class="tile small"><span class="k">Post-deploy</span><span class="mid"><span class="verdict ${s.postDeploy.red ? "fail" : "pass"}">${s.postDeploy.red ? `red × ${s.postDeploy.red}` : "green"}</span></span><span class="sub">${s.postDeploy.red === s.postDeploy.runs && s.postDeploy.red ? "every run since " + esc(day(s.postDeploy.since)) : `${s.postDeploy.runs} runs read`}${s.postDeploy.issue ? ` · ${link(`rollback #${s.postDeploy.issue.number}`, s.postDeploy.issue.url)}` : ""}</span></div>` : "",
    s.aa ? `<div class="tile small"><span class="k">Nightly A/A</span><span class="mid"><span class="verdict ${tone(s.aa.verdict)}">${esc(s.aa.verdict)}</span></span><span class="sub">${esc(day(s.aa.ranAt))} · ${link("report", s.aa.report)}</span></div>` : "",
    `<div class="tile small"><span class="k">Countermeasures open</span><span class="big">${s.openCountermeasures}</span><span class="sub">${a.fiveWhys.filter((w) => w.status === "overdue").length} overdue · <a href="${REPO}/blob/main/kaizen/README.md">register</a></span></div>`
  ].join("");
  return `<section class="andon" aria-label="Final scoring">
  <div class="tile gate ${t}"><span class="k">Gate · ${esc(s.subject)}</span><span class="huge">${esc(s.gate)}</span><span class="sub">${esc(s.candidate ?? "")} beside ${esc(s.baseline ?? "")} · ${esc(s.ranAt ? when(s.ranAt) : "")}<br>${link("full report", s.report)}${s.runUrl ? ` · ${link("the run", s.runUrl)}` : ""}${s.scorecard ? ` · scorecard ${s.scorecard.score} (${esc(s.scorecard.grade)})` : ""}${s.glance ? ` · ${s.glance} glance items` : ""}</span></div>
  ${rcs}${dims}${small}
</section>
<p class="note andon-note">${esc(s.note)}</p>`;
}

// ---- Pareto ---------------------------------------------------------------------------------------------

function paretoHtml(p: Pareto): string {
  const max = Math.max(1, ...p.bars.map((b) => b.value));
  const rows = p.bars
    .map((b, i) => {
      const divider = i === p.vitalFew && p.vitalFew < p.bars.length ? `<li class="cut" aria-hidden="true"><span>${Math.round(p.vitalShare * 100)}%: the vital few above, the useful many below</span></li>` : "";
      return `${divider}<li class="${b.vital ? "vital" : ""}${b.unknown ? " unknown" : ""}" title="${esc(`${b.label}: ${b.value} ${p.unit} (${Math.round((b.value / Math.max(1, p.total)) * 100)}%), cumulative ${Math.round(b.cumulative * 100)}%${b.note ? `; ${b.note}` : ""}`)}">
        <span class="pl">${esc(b.label)}${b.note ? `<small>${esc(b.note)}</small>` : ""}</span>
        <span class="pb"><span class="bar" style="width:${Math.max(1.5, (b.value / max) * 100).toFixed(1)}%"></span></span>
        <span class="pv">${b.value}</span><span class="pc">${Math.round(b.cumulative * 100)}%</span></li>`;
    })
    .join("");
  const table = `<details><summary>Numbers</summary><div class="scroll"><table><thead><tr><th>Cause</th><th>${esc(p.unit)}</th><th>Cumulative</th></tr></thead><tbody>${p.bars.map((b) => `<tr><td>${esc(b.label)}</td><td class="num">${b.value}</td><td class="num">${Math.round(b.cumulative * 100)}%</td></tr>`).join("")}</tbody></table></div></details>`;
  return `<figure class="pareto" id="pareto-${esc(p.id)}"><figcaption><strong>${esc(p.title)}</strong><span class="src">${p.source.map((s) => link(s.label, s.href)).join(" · ")}</span></figcaption>
  <div class="phead" aria-hidden="true"><span></span><span></span><span>n</span><span>cum.</span></div>
  <ol class="bars">${rows}</ol>
  <p class="cap">${esc(p.caption)}</p>${table}</figure>`;
}

// ---- value stream map -----------------------------------------------------------------------------------

/** Split a stage name onto at most two lines of about `max` characters. */
function lines2(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const words = text.split(" ");
  let first = "";
  while (words.length && (first + " " + words[0]).trim().length <= max) first = `${first} ${words.shift()}`.trim();
  const rest = words.join(" ");
  return [first || text.slice(0, max), rest.length > max + 4 ? `${rest.slice(0, max + 3)}…` : rest].filter(Boolean);
}

export function vsmSvg(v: ValueStream): string {
  const n = v.stages.length;
  const L = 64;
  const W = 1180;
  const colW = (W - L) / n;
  const boxW = colW - 30;
  const top = 78;
  const boxH = 62;
  const dataTop = top + boxH + 6;
  const dataH = 44;
  const andonY = dataTop + dataH + 16;
  const ladderY = andonY + 44;
  const H = ladderY + 46;
  const parts: string[] = [];
  const x0 = (i: number) => L + i * colW + 15;
  parts.push(`<text x="${L + (W - L) / 2}" y="16" class="vsm-cap" text-anchor="middle">push: every merge to main flows downstream; nothing pulls a release but a person cutting a tag</text>`);
  v.stages.forEach((s, i) => {
    const x = x0(i);
    const name = lines2(s.name, 17);
    const where = s.where.length > 21 ? `${s.where.slice(0, 20)}…` : s.where;
    parts.push(`<g class="stage${s.andon ? " stopped" : ""}"><title>${esc(`${s.name} (${s.where}): ${s.note}. Process time ${duration(s.processMs)}${s.n ? ` (median of ${s.n})` : ""}${s.firstPass ? `, ${s.firstPass.green} of ${s.firstPass.runs} runs green` : ""}${s.andon ? `. Andon: ${s.andon}` : ""}`)}</title>
      <rect x="${x}" y="${top}" width="${boxW}" height="${boxH}" rx="6" class="box"/>
      ${name.map((t, k) => `<text x="${x + boxW / 2}" y="${top + (name.length === 1 ? 28 : 21) + k * 15}" text-anchor="middle" class="sname">${esc(t)}</text>`).join("")}
      <text x="${x + boxW / 2}" y="${top + boxH - 9}" text-anchor="middle" class="swhere">${esc(where)}</text>
      <rect x="${x}" y="${dataTop}" width="${boxW}" height="${dataH}" class="data"/>
      <text x="${x + 8}" y="${dataTop + 18}" class="dt">P/T ${esc(duration(s.processMs))}${s.n ? ` · n ${s.n}` : ""}</text>
      <text x="${x + 8}" y="${dataTop + 35}" class="dt">${s.firstPass ? `FPY ${Math.round((s.firstPass.green / s.firstPass.runs) * 100)}% (${s.firstPass.green}/${s.firstPass.runs})` : "FPY not measured"}</text>
      ${s.andon ? `<g class="andon-mark"><rect x="${x}" y="${andonY - 13}" width="18" height="18" rx="3"/><text x="${x + 9}" y="${andonY + 1}" text-anchor="middle">!</text></g><text x="${x + 24}" y="${andonY}" class="andon-text">${esc(s.andon.length > 26 ? `${s.andon.slice(0, 25)}…` : s.andon)}</text>` : ""}
    </g>`);
    if (i < n - 1) {
      const ax = x + boxW;
      const bx = x0(i + 1);
      parts.push(`<path d="M${ax + 2} ${top + boxH / 2} L${bx - 4} ${top + boxH / 2}" class="arrow"/><path d="M${bx - 5} ${top + boxH / 2 - 5} L${bx} ${top + boxH / 2} L${bx - 5} ${top + boxH / 2 + 5}" class="arrowhead"/>`);
    }
  });
  // inventory triangles, above the gap in front of the stage they wait for
  for (const inv of v.inventory) {
    const cx = inv.before === 0 ? x0(0) + 14 : x0(inv.before) - 15;
    const cy = top - 26;
    parts.push(`<g class="inv"><title>${esc(`${inv.count} ${inv.label}`)}</title><path d="M${cx} ${cy - 13} L${cx + 13} ${cy + 9} L${cx - 13} ${cy + 9} Z"/><text x="${cx}" y="${cy + 6}" text-anchor="middle">I</text><text x="${cx + 17}" y="${cy + 7}" class="invn">${inv.count}</text></g>`);
  }
  // the timeline ladder: waits up, process down
  parts.push(`<text x="0" y="${ladderY - 18}" class="lad-k">wait</text><text x="0" y="${ladderY + 32}" class="lad-k">process</text>`);
  let path = `M${L - 10} ${ladderY - 12}`;
  v.stages.forEach((s, i) => {
    const x = x0(i);
    path += ` L${x} ${ladderY - 12} L${x} ${ladderY + 12} L${x + boxW} ${ladderY + 12} L${x + boxW} ${ladderY - 12}`;
    parts.push(`<text x="${x + boxW / 2}" y="${ladderY + 30}" text-anchor="middle" class="lad-v${s.processMs === null ? " nm" : ""}">${esc(s.processMs === null ? "n/m" : duration(s.processMs))}</text>`);
  });
  path += ` L${W} ${ladderY - 12}`;
  parts.push(`<path d="${path}" class="ladder"/>`);
  for (const w of v.waits) {
    const x = w.before === 0 ? x0(0) : x0(w.before) - 15;
    parts.push(`<g><title>${esc(`${w.label}: ${duration(w.ms)}`)}</title><text x="${x}" y="${ladderY - 18}" text-anchor="middle" class="lad-w${w.ms === null ? " nm" : ""}">${esc(w.ms === null ? "n/m" : duration(w.ms))}</text></g>`);
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Value stream map of a Tutors release, from merge to post-deploy verify" class="vsm">${parts.join("")}</svg>`;
}

function vsmHtml(v: ValueStream): string {
  const pce = v.flowEfficiency === null ? "not measured" : `${(v.flowEfficiency * 100).toFixed(v.flowEfficiency < 0.01 ? 2 : 1)}%`;
  return `<figure class="vsm-fig"><figcaption><strong>Value stream map: commit to production</strong><span class="src">process times are medians of each workflow's runs on GitHub; waits from the images' and runs' own timestamps</span></figcaption>
  <div class="vsm-scroll">${vsmSvg(v)}</div>
  <div class="vsm-totals"><div><span class="k">Lead time</span><span class="mid">${esc(duration(v.leadMs))}</span><span class="sub">oldest merge to main not in production</span></div><div><span class="k">Process time</span><span class="mid">${esc(duration(v.processMs))}</span><span class="sub">build + forecast + gate, machine time</span></div><div><span class="k">Flow efficiency</span><span class="mid">${esc(pce)}</span><span class="sub">process time / lead time</span></div>${v.inventory.map((i) => `<div><span class="k">Inventory</span><span class="mid">${i.count}</span><span class="sub">${esc(i.label)}</span></div>`).join("")}</div>
  ${v.notMeasured.length ? `<p class="note">Not measured: ${esc(v.notMeasured.join("; "))}.</p>` : ""}
  <details><summary>Numbers</summary><div class="scroll"><table><thead><tr><th>Stage</th><th>Where</th><th>Process time</th><th>First pass</th><th>Note</th></tr></thead><tbody>${v.stages.map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.where)}</td><td class="num">${esc(duration(s.processMs))}${s.n ? ` (n ${s.n})` : ""}</td><td class="num">${s.firstPass ? `${s.firstPass.green}/${s.firstPass.runs}` : "–"}</td><td>${esc(s.note)}${s.andon ? ` <strong>Andon: ${esc(s.andon)}</strong>` : ""}</td></tr>`).join("")}${v.waits.map((w) => `<tr><td colspan="2">Wait: ${esc(w.label)}</td><td class="num">${esc(duration(w.ms))}</td><td></td><td></td></tr>`).join("")}</tbody></table></div></details></figure>`;
}

// ---- RCA and the 5 Whys ---------------------------------------------------------------------------------

function rcaHtml(q: Rca, n: number, whys: FiveWhys[]): string {
  const w = q.depth.kind === "5 whys" ? whys.find((x) => x.file === (q.depth as { file: string }).file) : undefined;
  const depth = q.depth.kind === "5 whys" ? `<span class="depth deep">5 Whys to the root: <a href="#why-${esc(q.depth.file)}">${esc(q.depth.title)}</a>${w?.chainEndsAt ? `, chain ends at Why ${w.chainEndsAt} in a ${esc(w.endsIn)}` : ""}</span>` : `<span class="depth">Evidence stops: ${esc(q.depth.why)}</span>`;
  return `<li class="rca" id="rca-${esc(q.id)}"><span class="qn">Q${n}</span><div><p class="q">${esc(q.question)}</p><p>${esc(q.answer)}</p><p class="ev">${q.pareto ? `<a href="#pareto-${esc(q.pareto)}">Pareto</a> · ` : ""}${q.evidence.map((e) => link(e.label, e.href)).join(" · ")}</p>${depth}</div></li>`;
}

/** An answer's first paragraph, and the rest behind "more": the chain reads at a glance, every fact is one click away. */
function answerHtml(answer: string): string {
  const html = inlineMd(answer);
  const first = /^<p>[\s\S]*?<\/p>/.exec(html)?.[0] ?? "";
  const rest = html.slice(first.length);
  return `${first}${rest ? `<details><summary>${first ? "the evidence" : "the answer"}</summary>${rest}</details>` : ""}`;
}

function whysHtml(w: FiveWhys): string {
  return `<article class="whys" id="why-${esc(w.file)}"><header><strong>${esc(w.title)}</strong><span class="src">Trigger: ${esc(w.trigger)} · <a href="${REPO}/blob/main/kaizen/${encodeURIComponent(w.file)}">kaizen/${esc(w.file)}</a></span></header>
  <ol class="chain">${w.whys.map((y) => `<li class="${y.n === w.chainEndsAt ? "root" : ""}"><span class="wn">Why ${y.n}</span><div><p class="q">${esc(y.question || "Why?")}</p>${answerHtml(y.answer)}${y.n === w.chainEndsAt ? `<p class="rootcause">Root cause, in a ${esc(w.endsIn)}.</p>` : ""}</div></li>`).join("")}</ol>
  <p class="cm"><span class="kind">${esc(w.kind ?? "no kind")}</span> ${esc(w.countermeasure)}</p><p class="src">Owner ${esc(w.owner || "none")} · due ${esc(w.due || "none")} · <span class="status ${w.status}">${w.status}</span></p></article>`;
}

// ---- the page -------------------------------------------------------------------------------------------

const CSS = `
:root{color-scheme:light;--bg:#f4f3ef;--sheet:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--muted:#7a7873;--rule:#dddbd4;--box:#ffffff;
--pass:#2f7a4f;--warn:#8a6119;--fail:#a12a2a;--vital:#2a78d6;--trivial:#b9b7b0;--accent:#2a78d6;--hatch:#c9c7c0}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#121211;--sheet:#1a1a19;--ink:#ffffff;--ink2:#c3c2b7;--muted:#9a988f;--rule:#383835;--box:#232322;
--pass:#3f9a66;--warn:#c28a2a;--fail:#d05050;--vital:#3987e5;--trivial:#5a5953;--accent:#3987e5;--hatch:#4a4945}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#121211;--sheet:#1a1a19;--ink:#ffffff;--ink2:#c3c2b7;--muted:#9a988f;--rule:#383835;--box:#232322;
--pass:#3f9a66;--warn:#c28a2a;--fail:#d05050;--vital:#3987e5;--trivial:#5a5953;--accent:#3987e5;--hatch:#4a4945}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)} a:focus-visible,summary:focus-visible{outline:2px solid currentColor;outline-offset:2px}
code{font:12.5px ui-monospace,Menlo,Consolas,monospace}
.sheet{max-width:1440px;margin:0 auto;padding:20px 16px 40px}
.title{display:flex;flex-wrap:wrap;gap:4px 24px;align-items:baseline;justify-content:space-between;border-bottom:3px solid var(--ink);padding-bottom:8px}
.title h1{font-size:1.7rem;margin:0;letter-spacing:-.01em} .title h1 span{font-weight:400;color:var(--ink2)}
.title .meta{font-size:12.5px;color:var(--ink2)}
.andon{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:10px;margin:16px 0 4px}
.tile{background:var(--sheet);border:1px solid var(--rule);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}
.tile .k{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink2)}
.tile .huge{font-size:2.6rem;font-weight:800;line-height:1.05;letter-spacing:-.02em}
.tile .big{font-size:2rem;font-weight:700;line-height:1.1} .tile .mid{font-size:1.25rem;font-weight:700}
.tile .sub{font-size:12px;color:var(--ink2)} .muted{color:var(--muted)}
.tile.gate{grid-column:span 4;color:#fff;border:0} .tile.gate .k,.tile.gate .sub{color:#ffffffd9} .tile.gate a{color:#fff}
.tile.gate.fail{background:var(--fail)} .tile.gate.warn{background:var(--warn)} .tile.gate.pass{background:var(--pass)}
.tile.dims{grid-column:span 5} .tile.rcs{grid-column:span 3} .tile.small{grid-column:span 3} .dims ul{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:3px}
.dims li{display:grid;grid-template-columns:minmax(0,11rem) minmax(30px,1fr) 2.2rem;gap:8px;align-items:center;font-size:12px}
.dims .dn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .dims .dv{text-align:right;font-variant-numeric:tabular-nums}
.meter{height:8px;background:var(--rule);border-radius:4px;overflow:hidden;display:block}
.fill{display:block;height:100%;border-radius:4px} .fill.g{background:var(--pass)} .fill.a{background:var(--warn)} .fill.r{background:var(--fail)}
.fill.nm{background:repeating-linear-gradient(45deg,var(--hatch) 0 3px,transparent 3px 6px)}
.verdict,.band{display:inline-block;padding:1px 9px;border-radius:4px;color:#fff;font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase}
.verdict.pass,.band.green{background:var(--pass)} .verdict.warn,.band.amber{background:var(--warn)} .verdict.fail,.band.red{background:var(--fail)}
.note{font-size:12.5px;color:var(--ink2);margin:6px 0 0} .andon-note{margin:0 0 14px}
.a3{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:14px;align-items:start;margin:14px 0}
.wide{margin:14px 0}
.whyrow{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:12px;align-items:start}
.whyrow .whys{margin:0}
.terms dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:6px 18px;margin:0} .terms dt{font-weight:700} .terms dd{margin:0;font-size:12.5px;color:var(--ink2)}
.col{display:grid;gap:14px;min-width:0}
.blk{background:var(--sheet);border:1px solid var(--rule);border-radius:8px;padding:12px 16px 14px;min-width:0}
.blk>h2{font-size:1rem;margin:0 0 8px;display:flex;gap:10px;align-items:baseline}
.blk>h2 .n{display:inline-grid;place-items:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--ink);color:var(--sheet);font-size:.85rem}
.blk>h2 .hint{font-weight:400;font-size:12px;color:var(--ink2)}
.blk p{margin:4px 0} ul.facts{margin:6px 0 10px;padding-left:1.1rem}
figure{margin:12px 0 0} figcaption{display:flex;flex-wrap:wrap;gap:2px 12px;align-items:baseline;margin-bottom:6px}
.src{font-size:11.5px;color:var(--ink2)}
.paretos{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,520px),1fr));gap:4px 28px}
.phead,.bars li{display:grid;grid-template-columns:minmax(0,17rem) minmax(40px,1fr) 3.4rem 2.8rem;gap:8px;align-items:center}
.phead{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2)} .phead span:nth-child(n+3){text-align:right}
ol.bars{list-style:none;margin:0;padding:0} .bars li{padding:3px 0;font-size:12.5px}
.pl{overflow-wrap:anywhere} .pl small{display:block;color:var(--ink2);font-size:11px;line-height:1.3;font-weight:400}
.pb{height:14px;display:block} .bar{display:block;height:100%;background:var(--trivial);border-radius:0 4px 4px 0;min-width:2px}
.vital .bar{background:var(--vital)} .vital .pl{font-weight:600}
.unknown .bar{background:repeating-linear-gradient(45deg,var(--hatch) 0 3px,transparent 3px 6px);outline:1px dashed var(--muted)}
.pv,.pc{text-align:right;font-variant-numeric:tabular-nums} .pc{color:var(--ink2)}
.bars li.cut{display:block;border-top:2px dashed var(--ink2);margin:4px 0 2px;padding:2px 0 0;font-size:11px;color:var(--ink2)}
.cap{font-size:12.5px;margin:6px 0 2px}
details{margin:4px 0 0} details summary{cursor:pointer;font-size:12px;color:var(--ink2)}
table{border-collapse:collapse;width:100%;font-size:12.5px;margin:6px 0 0}
th,td{text-align:left;vertical-align:top;padding:4px 6px;border-bottom:1px solid var(--rule)} th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink2)}
td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.scroll,.vsm-scroll{overflow-x:auto}
svg.vsm{width:100%;min-width:760px;height:auto;display:block;font-family:inherit}
.vsm-bg{fill:transparent} .vsm-cap{font-size:12px;fill:var(--ink2)}
.stage .box{fill:var(--box);stroke:var(--ink);stroke-width:1.5} .stage.stopped .box{stroke:var(--fail);stroke-width:2.5}
.sname{font-size:13px;font-weight:700;fill:var(--ink)} .lad-v.nm,.lad-w.nm{fill:var(--muted);font-weight:400} .swhere{font-size:11px;fill:var(--ink2)}
.data{fill:var(--sheet);stroke:var(--rule)} .dt{font-size:11.5px;fill:var(--ink);font-variant-numeric:tabular-nums} .dt.muted{fill:var(--ink2)}
.arrow{stroke:var(--ink);stroke-width:2;fill:none} .arrowhead{stroke:var(--ink);stroke-width:2;fill:none}
.inv path{fill:var(--warn);stroke:var(--sheet);stroke-width:1.5} .inv text{font-size:11px;font-weight:700;fill:#fff} .inv .invn{fill:var(--ink);font-size:12px}
.andon-mark rect{fill:var(--fail)} .andon-mark text{fill:#fff;font-weight:800;font-size:15px} .andon-text{font-size:11px;fill:var(--fail);font-weight:700}
.ladder{stroke:var(--ink);stroke-width:2;fill:none} .lad-k{font-size:10.5px;fill:var(--ink2);text-transform:uppercase;letter-spacing:.06em}
.lad-v{font-size:11.5px;fill:var(--ink);font-weight:600} .lad-w{font-size:11.5px;fill:var(--fail);font-weight:700}
.vsm-totals{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:8px}
.vsm-totals>div{border-left:3px solid var(--ink);padding:0 8px;display:flex;flex-direction:column}
.vsm-totals .k{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2)} .vsm-totals .mid{font-size:1.2rem;font-weight:700} .vsm-totals .sub{font-size:11.5px;color:var(--ink2)}
ol.rcas{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.rca{display:grid;grid-template-columns:2.4rem 1fr;gap:8px;border-top:1px solid var(--rule);padding-top:8px}
.qn{font-weight:800;font-size:1.05rem;color:var(--ink2)} .q{font-weight:700}
.ev{font-size:12px} .depth{display:inline-block;font-size:12px;border-radius:4px;padding:2px 8px;background:var(--bg);border:1px solid var(--rule)} .depth.deep{border-color:var(--accent)}
.whys{border:1px solid var(--rule);border-radius:8px;padding:10px 12px;margin-top:10px;background:var(--box)}
.whys header{display:flex;flex-wrap:wrap;gap:2px 12px;align-items:baseline}
ol.chain{list-style:none;margin:8px 0 0;padding:0;position:relative}
ol.chain>li{display:grid;grid-template-columns:3.6rem 1fr;gap:8px;padding:6px 0 6px;border-left:3px solid var(--rule);padding-left:10px;margin-left:4px}
ol.chain>li.root{border-left-color:var(--fail)}
.wn{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2);padding-top:2px}
ol.chain ul{margin:2px 0;padding-left:1.1rem;font-size:12.5px} ol.chain p{font-size:13px}
.rootcause{color:var(--fail);font-weight:700;font-size:12px!important}
.cm{margin:8px 0 0;font-size:13px} .kind{display:inline-block;background:var(--ink);color:var(--sheet);border-radius:4px;padding:0 7px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-right:4px}
.status{font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em} .status.open{color:var(--warn)} .status.overdue{color:var(--fail)} .status.closed,.status.met{color:var(--pass)}
.ok{color:var(--pass);font-weight:700} .no{color:var(--fail);font-weight:700}
footer{font-size:12px;color:var(--ink2);border-top:1px solid var(--rule);margin-top:18px;padding-top:10px}
.empty{color:var(--ink2)}
@media (max-width:980px){.a3{grid-template-columns:minmax(0,1fr)} .andon{grid-template-columns:repeat(2,minmax(0,1fr))} .tile.gate,.tile.dims{grid-column:1/-1} .tile.rcs,.tile.small{grid-column:span 1}}
@media (max-width:520px){.phead,.bars li{grid-template-columns:minmax(0,9rem) minmax(30px,1fr) 2.6rem 2.4rem}}
@media print{@page{size:A3 landscape;margin:10mm} body{background:#fff;font-size:10.5px} .sheet{max-width:none;padding:0} details{display:none} .blk{break-inside:avoid}}
`;

export function renderA3(a: A3): string {
  const s = a.score;
  const goal = `<div class="scroll"><table><thead><tr><th>Measure</th><th>Now</th><th>Target</th><th></th></tr></thead><tbody>${a.goal.map((g) => `<tr><td>${esc(g.metric)}<br><span class="src">${esc(g.source)}</span></td><td>${esc(g.now)}</td><td>${esc(g.target)}</td><td>${g.met ? `<span class="ok">met</span>` : `<span class="no">gap</span>`}</td></tr>`).join("")}</tbody></table></div>`;
  const cms = a.countermeasures.length
    ? `<div class="scroll"><table><thead><tr><th>Kind</th><th>Countermeasure</th><th>Answers</th><th>Status</th></tr></thead><tbody>${a.countermeasures.map((c) => `<tr><td><span class="kind">${esc(c.kind)}</span></td><td>${esc(c.what)}<br><span class="src"><a href="#why-${esc(c.from)}">from its 5 Whys</a></span></td><td>${c.rca.map((r) => `<a href="#rca-${esc(r)}">${esc(r)}</a>`).join(", ") || "–"}</td><td><span class="status ${c.status}">${c.status}</span></td></tr>`).join("")}</tbody></table></div>`
    : `<p class="empty">The register is empty: no 5 Whys has a countermeasure yet.</p>`;
  const plan = `<div class="scroll"><table><thead><tr><th>What</th><th>Who</th><th>When</th><th>Status</th></tr></thead><tbody>${a.plan.map((p) => `<tr><td>${esc(p.what)}</td><td>${esc(p.who)}</td><td class="num">${esc(p.when)}</td><td><span class="status ${/^(open|overdue|closed|met)$/.test(p.status) ? p.status : "open"}">${esc(p.status)}</span></td></tr>`).join("")}</tbody></table></div>`;
  const follow = `<div class="scroll"><table><thead><tr><th>Check</th><th>Now</th><th></th></tr></thead><tbody>${a.followUp.map((f) => `<tr><td>${esc(f.check)}</td><td>${esc(f.state)}</td><td>${f.met ? `<span class="ok">yes</span>` : `<span class="no">not yet</span>`}</td></tr>`).join("")}</tbody></table></div>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>A3 Aggregator</title>
<meta name="description" content="A Lean A3 of the Tutors release: the Gate and the score, the value stream, the Paretos, the root causes and their countermeasures, from every run the harness kept.">
<style>${CSS}</style>
</head>
<body>
<main class="sheet">
<header class="title"><h1>A3 Aggregator <span>· Tutors release confidence</span></h1><span class="meta">Built ${esc(when(a.builtAt))} by harness <code>${esc(a.harness)}</code> from ${a.sources.runs} kept runs and the kaizen register · <a href="./">all reports</a> · <a href="scoreboard.html">scoreboard</a> · <a href="a3.json">a3.json</a></span></header>
${andon(s, a)}
<div class="a3">
<section class="blk"><h2><span class="n">1</span>Background <span class="hint">why this matters</span></h2>${a.background.map((p) => `<p>${esc(p)}</p>`).join("")}<ul class="facts">${a.current.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section>
<section class="blk"><h2><span class="n">3</span>Goal <span class="hint">the target condition</span></h2>${goal}</section>
</div>
<section class="blk wide"><h2><span class="n">2</span>Current condition <span class="hint">go and see: the value stream, and where the problems pile up</span></h2>
${vsmHtml(a.current.valueStream)}
<div class="paretos">${a.current.paretos.map(paretoHtml).join("")}</div></section>
<div class="a3">
<section class="blk"><h2><span class="n">4</span>Root cause analysis <span class="hint">each question as deep as the evidence goes</span></h2>
<ol class="rcas">${a.rca.map((q, i) => rcaHtml(q, i + 1, a.fiveWhys)).join("")}</ol></section>
<div class="col">
<section class="blk"><h2><span class="n">5</span>Countermeasures <span class="hint">to the system, never to a person</span></h2>${cms}</section>
<section class="blk"><h2><span class="n">6</span>Plan <span class="hint">who, what, when</span></h2>${plan}</section>
<section class="blk"><h2><span class="n">7</span>Follow-up <span class="hint">how we will know it worked</span></h2>${follow}
<p class="note">This sheet is rebuilt with the site after every kept run. A countermeasure closes only when a release names it in <code>Verified by</code>; until then it stays on the plan.</p></section>
</div>
</div>
${a.fiveWhys.length ? `<section class="blk wide"><h2><span class="n">4</span>The 5 Whys <span class="hint">from the kaizen register, as written and checked by harness why check: each answer checkable, each chain ending at the first process or tool</span></h2><div class="whyrow">${a.fiveWhys.map(whysHtml).join("")}</div></section>` : ""}
<section class="blk wide terms"><h2>Lean terms on this sheet</h2><dl>
<div><dt>Jidoka</dt><dd>the Gate stops the line on an unclaimed difference; no score talks it back on</dd></div>
<div><dt>Andon</dt><dd>the red marks: a stopped gate, a red post-deploy, a stage that is not the tested artefact</dd></div>
<div><dt>Gemba</dt><dd>every number links to the report, the hunk or the run it came from</dd></div>
<div><dt>Pareto</dt><dd>the vital few causes (80% of the effect) above the dashed line</dd></div>
<div><dt>5 Whys</dt><dd>asked until the answer is a process or a tool, never a person</dd></div>
<div><dt>VSM</dt><dd>process time (P/T), first-pass yield (FPY), waits and inventory (I) from merge to verify</dd></div>
<div><dt>Flow efficiency</dt><dd>process time as a share of lead time</dd></div>
<div><dt>Kaizen</dt><dd>every finding ends in one of seven countermeasure kinds, closed in a release (<a href="${REPO}/blob/main/docs/lean.md">docs/lean.md</a>)</dd></div>
</dl></section>
<footer>Sources: ${Object.entries(a.sources.streams).map(([k, v]) => `${v} ${esc(k)}`).join(", ")} run(s)${a.sources.first ? ` from ${esc(day(a.sources.first))} to ${esc(day(a.sources.last ?? ""))}` : ""}; GitHub ${esc(a.sources.github)}; ${a.sources.kaizen} 5 Whys in <code>kaizen/</code>. Advisory, like the score: nothing here is an input to the Gate, a verdict or an exit code.</footer>
</main>
</body>
</html>
`;
}
