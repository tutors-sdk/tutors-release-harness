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
import { leads, missedWords, prWords, unexplainedWords, type Explanation } from "../changes/explain.ts";
import { ruleTouchedWords } from "../report/rules-touched.ts";
import { declaredWords } from "../changes/declares.ts";
import { REPO, duration, type A3, type Decisions, type FiveWhys, type Pareto, type Rca, type Score, type ValueStream } from "./model.ts";
import type { TimingJourney } from "./timing.ts";
import type { CourseLoad, CourseSide } from "./courses.ts";
import type { LightState, QualityLight, QualityStrip } from "./quality.ts";

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
const statusClass = (s: string) => s.replace(/\s+/g, "-");
/** A field that may be a URL (linked), a repo path (linked on GitHub), or words. */
const inline = (v: string) => (/^https:\/\//.test(v) ? link(v.replace(/^https:\/\/github\.com\/[^/]+\/[^/]+\/(pull|issues)\//, "#"), v) : /^[\w.-]+\/[\w./-]+$/.test(v) ? link(v, `${REPO}/blob/main/${v}`) : esc(v));
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
    s.postDeploy ? postDeployTile(s.postDeploy) : "",
    s.aa ? `<div class="tile small"><span class="k">Nightly A/A</span><span class="mid"><span class="verdict ${tone(s.aa.verdict)}">${esc(s.aa.verdict)}</span></span><span class="sub">${esc(day(s.aa.ranAt))} · ${link("report", s.aa.report)}</span></div>` : "",
    countermeasureTile(a)
  ].join("");
  return `<section class="andon" aria-label="Final scoring">
  <div class="tile gate ${t}"><span class="k">Gate · ${esc(s.subject)}</span><span class="huge">${esc(s.gate)}</span><span class="sub">${esc(s.candidate ?? "")} beside ${esc(s.baseline ?? "")} · ${esc(s.ranAt ? when(s.ranAt) : "")}<br>${link("full report", s.report)}${s.runUrl ? ` · ${link("the run", s.runUrl)}` : ""}${s.scorecard ? ` · scorecard ${s.scorecard.score} (${esc(s.scorecard.grade)})` : ""}${s.glance ? ` · ${s.glance} glance items` : ""}</span>${s.why ? `<span class="why">${esc(s.why)}</span>` : ""}</div>
  ${rcs}${dims}${a.quality ? qualityStripHtml(a.quality) : ""}${small}${decideStrip(a.decisions)}
</section>
<p class="note andon-note">${esc(s.note)}</p>`;
}

// ---- real courses (since 1.31.0) ---------------------------------------------------------------------------

const msOf = (ms: number | null | undefined) => (ms === null || ms === undefined ? "–" : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`);

function courseSideHtml(c: CourseSide | null): string {
  if (!c) return `<span class="no">not checked</span>`;
  const pages = c.pages ? `${c.pages.ok} of ${c.pages.sampled} pages` : "no pages checked";
  const files = c.files.problems ? `, ${c.files.problems} of ${c.files.checked} files differ` : "";
  const why = c.failures.length ? `<br><span class="src">${c.failures.map(esc).join("<br>")}</span>` : "";
  return `${c.loaded ? `<span class="ok">loads</span>` : `<span class="no">fails</span>`} ${esc(pages + files)}${why}`;
}

export function coursesHtml(c: CourseLoad | undefined): string {
  if (!c) return "";
  const delta = (d: number | null) => (d === null ? "" : ` (${d > 0 ? "+" : d < 0 ? "−" : "±"}${msOf(Math.abs(d))})`);
  const stateClass = (s: string) => (s === "loads on both" ? "closed" : s === "fixed on main" ? "met" : "overdue");
  const changes = (r: CourseLoad["rows"][number]) => {
    const k = r.compare;
    if (!k) return "–";
    const j = k.journeys.compared ? `<br><span class="src">journeys: ${k.journeys.worse.length} worse, ${k.journeys.better.length} better of ${k.journeys.compared}</span>` : "";
    return `${k.worse.length ? `<a href="#course-${esc(r.id)}-worse"><span class="no">${k.worse.length} worse</span></a>` : `<span class="ok">0 worse</span>`} · ${k.better.length} better<br><span class="src">of ${k.compared} pages compared</span>${j}`;
  };
  // Since 1.33.0: the course's tutors.json against the published schema. Reported, never a fail: older generators wrote
  // courses the reader still opens.
  const schema = (r: CourseLoad["rows"][number]) => {
    const t = r.tutorsJson;
    if (!t) return "–";
    if (t.conforms) return `<span class="ok">conforms</span>`;
    const first = t.sample.slice(0, 3).map(esc).join("<br>");
    return `${t.problems} problem${t.problems === 1 ? "" : "s"}${first ? `<br><span class="src">${first}${t.problems > 3 ? "<br>…" : ""}</span>` : ""}`;
  };
  const withSchema = c.rows.some((r) => r.tutorsJson);
  const rows = c.rows
    .map((r) => `<tr id="course-${esc(r.id)}"><td>${esc(r.title ?? r.id)}<br><span class="src">${esc(r.id)}</span></td><td>${courseSideHtml(r.a)}</td><td>${courseSideHtml(r.b)}</td><td>${changes(r)}</td><td class="num">${msOf(r.a?.pages?.medianMs)} → ${msOf(r.b?.pages?.medianMs)}${esc(delta(r.medianDeltaMs))}</td>${withSchema ? `<td>${schema(r)}</td>` : ""}<td><span class="status ${stateClass(r.state)}">${esc(r.state)}</span></td></tr>`)
    .join("");
  const detail = c.rows
    .filter((r) => r.compare && (r.compare.worse.length || r.compare.better.length || r.compare.journeys.worse.length))
    .map((r) => {
      const k = r.compare!;
      const page = (p: { path: string; type: string; title: string; reasons: string[] }) => `<li><strong>${esc(p.title || p.path)}</strong> <span class="src">${esc(p.type)} · ${esc(p.path)}</span><br>${p.reasons.map(esc).join("<br>")}</li>`;
      const jw = k.journeys.worse.map((j) => `<li><strong>Journey: ${esc(j.name)}</strong><br>main clicks through ${j.b} of ${j.of} pages, production ${j.a}${j.stoppedAt ? `; main stops at <code>${esc(j.stoppedAt)}</code>` : ""}</li>`).join("");
      return `<details id="course-${esc(r.id)}-worse"${k.worse.length || k.journeys.worse.length ? " open" : ""}><summary>${esc(r.title ?? r.id)}: ${k.worse.length + k.journeys.worse.length} worse on main, ${k.better.length} better</summary>${jw || k.worse.length ? `<h4>Worse on main</h4><ul>${jw}${k.worse.map(page).join("")}</ul>` : ""}${k.better.length ? `<h4>Better on main</h4><ul>${k.better.map(page).join("")}</ul>` : ""}</details>`;
    })
    .join("");
  const run = safeHref(c.runUrl);
  return `<div class="courses" id="courses"><h3>Real courses: what a student would notice if main were released <span class="hint">the course corpus, each page read in production's reader and main's, then compared page by page</span></h3>
<p>${esc(c.summary)}</p>
<div class="scroll"><table><thead><tr><th>Course</th><th>Production ${esc(c.production)}</th><th>Main ${esc(c.candidate)}</th><th>Pages on main</th><th>Median time to title</th>${withSchema ? "<th>tutors.json schema</th>" : ""}<th></th></tr></thead><tbody>${rows}</tbody></table></div>
${detail}
<p class="note">Checked ${c.checkedAt ? esc(when(c.checkedAt)) : "at an unknown time"}${run ? ` by <a href="${esc(run)}">course-capture.yml</a>` : ""}. Worse on main: a page that does not load, more broken course images, a course file failing, a new console error, a link to a page that does not exist, a lost heading, a quarter less text or a new serious accessibility violation; or a journey main clicks less far through. One check per side: times are a reading, not a benchmark, and nothing here is an input to the Gate.${c.tutorsJson ? ` tutors.json schema: ${c.tutorsJson.conforming} of ${c.tutorsJson.checked} courses conform to the schema the generator on main promises (mono-repo ${esc(c.tutorsJson.schema)}); reported only, since the reader opens courses older generators wrote.` : ""}</p></div>`;
}

// ---- the quality strip (since 1.18.0) ---------------------------------------------------------------------

const stateClass = (s: LightState) => (s === "within reason" ? "q-ok" : s === "look" ? "q-look" : "q-nm");
const lamp = (s: LightState) => `<span class="lamp ${stateClass(s)}" aria-hidden="true">${s === "look" ? "!" : ""}</span>`;

function lightHtml(l: QualityLight): string {
  const halves = l.halves ? `<span class="halves">${(["harness", "monorepo"] as const).map((h) => `<span class="half ${stateClass(l.halves![h])}">${lamp(l.halves![h])}${h} half: ${esc(l.halves![h])}</span>`).join("")}</span>` : "";
  const ev = l.evidence.length ? `<span class="lev">${l.evidence.map((e) => link(e.label, e.href)).join(" · ")}</span>` : "";
  return `<div class="light ${stateClass(l.state)}" id="quality-${esc(l.id)}">${lamp(l.state)}<div class="lb"><span class="lt"><strong>${esc(l.name)}</strong> <span class="ls">${esc(l.state)}</span></span>${halves}<span class="lr">${esc(l.reading)}</span>${l.beside ? `<span class="beside">Beside it: ${esc(l.beside)}</span>` : ""}<span class="rule">Within reason when: ${esc(l.rule)}</span>${ev}</div></div>`;
}

/** The three lights under the Gate: Speed, Metrics, Tests. Not measured is hatched, never green. */
export function qualityStripHtml(q: QualityStrip): string {
  const rows = q.lights.flatMap((l) => l.checks.map((c) => `<tr><td>${esc(l.name)}${c.half ? ` <span class="src">(${c.half})</span>` : ""}</td><td>${esc(c.label)}</td><td><span class="chip-q ${stateClass(c.state)}">${esc(c.state)}</span></td><td>${esc(c.reading)}${c.evidence.length ? `<br><span class="src">${c.evidence.map((e) => link(e.label, e.href)).join(" · ")}</span>` : ""}</td></tr>`));
  return `<div class="quality-strip" role="group" aria-label="Quality strip: Speed, Metrics, Tests"><span class="k">Quality · a reading aid beside the Gate, never an input to it</span>
  <div class="lights">${q.lights.map(lightHtml).join("")}</div>
  <p class="sub">${esc(q.note)}</p>
  <details><summary>What each light read</summary><div class="scroll"><table><thead><tr><th>Light</th><th>Check</th><th>State</th><th>Reading</th></tr></thead><tbody>${rows.join("")}</tbody></table></div></details></div>`;
}

/** The same three, small, for a row of the readiness page: a lamp and a name each, the reading on hover. */
export function qualityMarksHtml(q: QualityStrip, href?: string): string {
  const marks = q.lights.map((l) => `<span class="qm ${stateClass(l.state)}" title="${esc(`${l.name}: ${l.state}. ${l.reading}`)}">${lamp(l.state)}${esc(l.name)}<span class="vh">: ${esc(l.state)}</span></span>`).join("");
  const h = href && /^#[A-Za-z][\w-]*$/.test(href) ? href : safeHref(href);
  return h ? `<a class="qmarks" href="${esc(h)}">${marks}</a>` : `<span class="qmarks">${marks}</span>`;
}

/** The strip's styles, for any page that defines --pass, --warn, --rule, --ink2 and --hatch. */
export const QUALITY_CSS = `
.quality-strip{grid-column:1/-1;background:var(--sheet);border:1px solid var(--rule);border-radius:8px;padding:8px 12px 10px;display:flex;flex-direction:column;gap:6px;min-width:0}
.quality-strip>.k{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink2)}
.quality-strip>.sub{font-size:12px;color:var(--ink2);margin:0}
.lights{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:8px 14px}
.light{display:grid;grid-template-columns:1.5rem minmax(0,1fr);gap:8px;align-items:start;padding:6px 0 0;border-top:3px solid var(--rule);min-width:0}
.light.q-ok{border-top-color:var(--pass)} .light.q-look{border-top-color:var(--warn)} .light.q-nm{border-top-style:dashed}
.light .lb{display:flex;flex-direction:column;gap:2px;min-width:0;font-size:12.5px}
.light .lt{font-size:14px} .light .ls{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ink2)}
.light .lr{font-weight:600;overflow-wrap:anywhere} .light .rule,.light .beside{color:var(--ink2);font-size:12px} .light .lev{font-size:12px;overflow-wrap:anywhere}
.lamp{display:inline-grid;place-items:center;width:1.1rem;height:1.1rem;border-radius:50%;flex:none;font-size:11px;font-weight:800;line-height:1;color:#fff;vertical-align:-3px}
.lamp.q-ok{background:var(--pass)} .lamp.q-look{background:var(--warn)}
.lamp.q-nm{border:1.5px dashed var(--ink2);background:repeating-linear-gradient(45deg,var(--hatch) 0 2px,transparent 2px 4px)}
.halves{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px} .half{display:inline-flex;gap:4px;align-items:center} .half .lamp{width:.8rem;height:.8rem;font-size:9px}
.chip-q{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap;border:1px solid var(--rule)}
.chip-q.q-ok{background:var(--pass);color:#fff;border-color:var(--pass)} .chip-q.q-look{background:var(--warn);color:#fff;border-color:var(--warn)} .chip-q.q-nm{border-style:dashed;color:var(--ink2)}
.qmarks{display:inline-flex;flex-wrap:wrap;gap:3px 8px;text-decoration:none;color:inherit} .qm{display:inline-flex;gap:3px;align-items:center;font-size:12px;white-space:nowrap} .qm .lamp{width:.8rem;height:.8rem;font-size:9px}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

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

const FIX_NAMES: Record<string, string> = { axe: "accessibility violations", console: "console errors" };

/** Decisions are orange, beside the traffic lights and never on them: a fix on b is a choice, not a pass or a fail. */
function decideStrip(d: Decisions | undefined): string {
  if (!d || !d.fixes) return "";
  const share = d.decided / d.fixes;
  return `<div class="decide-strip" role="group" aria-label="Decisions on b"><span class="k">Fixed on main · good news, never a failure</span><span class="meter" title="${d.decided} of ${d.fixes} fixes explained by a claim"><span class="fill d" style="width:${Math.max(2, Math.round(share * 100))}%"></span></span><span class="pct">${Math.round(share * 100)}% with a note</span><span class="sub">${d.byArtefact.map((x) => `<strong>${x.fixes} ${esc(FIX_NAMES[x.artefact] ?? x.artefact)}</strong> production shows and main does not, ${x.decided ? `${x.decided} with a claim saying why` : "none with a claim saying why yet"}`).join(" · ")}. These count for main, not against it. A claim is an optional note that the fix was meant; nothing waits on it · <a href="#decisions">which ones</a></span></div>`;
}

function decisionsHtml(d: Decisions | undefined): string {
  if (!d || !d.rows.length) return "";
  // Since 1.40.0 the words lead with the fix: "undecided" read as something wrong (16 Oct 2026), and a fix is good news.
  const words = { decided: "fixed, explained", undecided: "fixed", "fixed, or only changed?": "fixed, or only changed?" } as const;
  const chip = (st: Decisions["rows"][number]["state"]) => `<span class="chip ${st === "decided" ? "decided" : st === "undecided" ? "undecided" : "changed"}">${esc(words[st])}</span>`;
  return `<div class="decisions" id="decisions"><h3>Fixed on main <span class="hint">present on production, gone on main: never a failure; a claim records whether it was meant</span></h3><div class="scroll"><table><thead><tr><th>Page</th><th>Fixed on b</th><th>State</th><th>Why (the claim)</th></tr></thead><tbody>${d.rows
    .map((r) => `<tr><td><a href="${esc(safeHref(r.hunk) ?? "#")}"><code>${esc(r.artefact)} ${esc(r.scope)}</code></a></td><td>${esc(r.what.join(", "))}</td><td>${chip(r.state)}</td><td>${r.why ? esc(r.why) : `<span class="muted">no note yet (optional: a claim records that the fix was meant)</span>`}</td></tr>`)
    .join("")}</tbody></table></div></div>`;
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
  <p class="cm"><span class="kind">${esc(w.kind ?? "no kind")}</span> ${esc(w.countermeasure)}</p><p class="src">Owner ${esc(w.owner || "none")} · due ${esc(w.due || "none")} · <span class="status ${statusClass(w.status)}">${w.status}</span></p>${w.inPlace || w.check ? `<p class="src">${w.inPlace ? `Built: ${inline(w.inPlace)}` : "Not built yet"}${w.check ? ` · Check: ${esc(w.check)}` : ""}</p>` : ""}</article>`;
}

// ---- the page -------------------------------------------------------------------------------------------

const CSS = `
:root{color-scheme:light;--bg:#f4f3ef;--sheet:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--muted:#7a7873;--rule:#dddbd4;--box:#ffffff;
--pass:#2f7a4f;--warn:#8a6119;--fail:#a12a2a;--vital:#2a78d6;--trivial:#b9b7b0;--accent:#2a78d6;--hatch:#c9c7c0;--decide:#b04e12;--on-decide:#ffffff;--decide-soft:#fbeadf}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#121211;--sheet:#1a1a19;--ink:#ffffff;--ink2:#c3c2b7;--muted:#9a988f;--rule:#383835;--box:#232322;
--pass:#3f9a66;--warn:#c28a2a;--fail:#d05050;--vital:#3987e5;--trivial:#5a5953;--accent:#3987e5;--hatch:#4a4945;--decide:#ec8a45;--on-decide:#1a1a19;--decide-soft:#3a2618}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#121211;--sheet:#1a1a19;--ink:#ffffff;--ink2:#c3c2b7;--muted:#9a988f;--rule:#383835;--box:#232322;
--pass:#3f9a66;--warn:#c28a2a;--fail:#d05050;--vital:#3987e5;--trivial:#5a5953;--accent:#3987e5;--hatch:#4a4945;--decide:#ec8a45;--on-decide:#1a1a19;--decide-soft:#3a2618}
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
svg.xmr .band{fill:var(--pass);opacity:.12} svg.xmr line.ucl{stroke:var(--pass);stroke-dasharray:3 3} svg.xmr line.cl{stroke:var(--ink);opacity:.4} svg.xmr .prod{fill:none;stroke:var(--ink);opacity:.35} svg.xmr circle.in{fill:var(--ink)} svg.xmr circle.out{fill:var(--fail)} svg.xmr text{font-size:11px;fill:var(--ink2)} svg.xmr text.pt{fill:var(--ink);font-weight:600}
.tile.gate .why{display:block;margin-top:8px;font-size:14px;line-height:1.4;color:#fff}
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
.decide-strip{grid-column:1/-1;display:grid;grid-template-columns:auto minmax(80px,1fr) auto;gap:6px 14px;align-items:center;background:var(--decide-soft);border:1px solid var(--decide);border-radius:8px;padding:8px 12px}
.decide-strip .k{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink2)} .decide-strip .sub{grid-column:1/-1;font-size:12px;color:var(--ink2)}
.decide-strip .meter{height:10px} .fill.d{background:var(--decide)} .decide-strip .pct{font-weight:800;font-size:1.15rem;font-variant-numeric:tabular-nums}
.chip{display:inline-block;padding:0 7px;border-radius:4px;font-size:11.5px;font-weight:700;letter-spacing:.03em;white-space:nowrap}
.chip.decided{background:var(--decide);color:var(--on-decide)} .chip.undecided{border:1px dashed var(--decide);color:var(--ink)} .chip.changed{border:1px solid var(--fail);color:var(--ink)}
.decisions h3{font-size:13px;margin:14px 0 4px} .decisions h3 .hint{font-weight:400;font-size:12px;color:var(--ink2)}
.courses{margin-top:16px} .courses h3{font-size:13px;margin:0 0 4px} .courses h3 .hint{font-weight:400;font-size:12px;color:var(--ink2)} .courses td .src,.courses li .src{font-size:11px;color:var(--ink2)} .courses details{margin:8px 0;border:1px solid var(--rule);border-radius:6px;padding:6px 10px} .courses summary{cursor:pointer;font-weight:600} .courses h4{font-size:12px;margin:8px 0 2px} .courses ul{margin:0;padding-left:18px} .courses li{margin:4px 0;overflow-wrap:anywhere}
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
.status{font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em} .status.open{color:var(--warn)} .status.overdue{color:var(--fail)} .status.closed,.status.met{color:var(--pass)} .status.in-place{color:var(--accent)}
.ok{color:var(--pass);font-weight:700} .no{color:var(--fail);font-weight:700}
footer{font-size:12px;color:var(--ink2);border-top:1px solid var(--rule);margin-top:18px;padding-top:10px}
.empty{color:var(--ink2)}
@media (max-width:980px){.a3{grid-template-columns:minmax(0,1fr)} .andon{grid-template-columns:repeat(2,minmax(0,1fr))} .tile.gate,.tile.dims{grid-column:1/-1} .tile.rcs,.tile.small{grid-column:span 1}}
@media (max-width:520px){.phead,.bars li{grid-template-columns:minmax(0,9rem) minmax(30px,1fr) 2.6rem 2.4rem}}
.comparing{font-size:1.05rem;margin:.2rem 0 .8rem}
.gap .ledger{font-size:1.05rem;margin:.2rem 0 .5rem}
.gap tr.grp th{text-align:left}
.gap tr.grp.ok th{color:var(--pass)} .gap tr.grp.no th{color:var(--fail)}
${QUALITY_CSS}
@media print{@page{size:A3 landscape;margin:10mm} body{background:#fff;font-size:10.5px} .sheet{max-width:none;padding:0} details{display:none} .blk{break-inside:avoid}}
`;

/** Rows of the gap table shown before "and N more". */
export const GAP_ROWS = 12;

/** Since 1.37.0: every failing difference of the subject run in one row: claimed, contributed by a PR, or unexplained. */
function gapHtml(a: A3): string {
  const g = a.gap;
  if (!g) return "";
  const e: Explanation = g.explanation;
  const share = (n: number) => (e.total ? `${Math.round((n / e.total) * 100)}%` : "");
  const causes = (cs: { key: string; hunks: number }[]) => cs.slice(0, 3).map((c) => `${esc(c.key)} (${c.hunks})`).join("<br>") + (cs.length > 3 ? `<br><span class="src">and ${cs.length - 3} more kinds</span>` : "");
  const prLinks = (prs: Explanation["contributed"]["rows"][number]["prs"]) => {
    const words = esc(prWords(prs));
    const name = (p: (typeof prs)[number]) => link(`${p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7)} ${p.title}`, p.url);
    const ledBy = prs.length > 1 && leads(prs[0]!, prs[1]);
    const listed = ledBy ? `${name(prs[0]!)}<br>also merged those nights: ${prs.slice(1, 6).map((p) => link(p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7), p.url)).join(", ")}${prs.length > 6 ? ` and ${prs.length - 6} more` : ""}` : `${prs.slice(0, 3).map(name).join("<br>")}${prs.length > 3 ? `<br>and ${prs.length - 3} more` : ""}`;
    return `<strong>${words}</strong><br><span class="src">${listed}</span>`;
  };
  const head = (label: string, n: number, cls: string) => `<tr class="grp ${cls}"><th scope="row">${esc(label)}</th><td class="num">${n}</td><td class="num">${share(n)}</td><td></td><td></td></tr>`;
  const more = (rows: { hunks: number }[], what: string) => (rows.length > GAP_ROWS ? `<tr><td>${rows.length - GAP_ROWS} more ${what}</td><td class="num">${rows.slice(GAP_ROWS).reduce((n, r) => n + r.hunks, 0)}</td><td></td><td></td><td></td></tr>` : "");
  const rows = [
    head("Claimed: a Rule or CHANGELOG entry says so", e.claimed.hunks, "ok"),
    ...e.claimed.rows.slice(0, GAP_ROWS).map((r) => `<tr><td>${esc(r.label)}</td><td class="num">${r.hunks}</td><td class="num">${share(r.hunks)}</td><td></td><td></td></tr>`),
    more(e.claimed.rows, "claims"),
    ...(e.declared?.rows.length
      ? [
          head("Declared by its PR: the CHANGELOG line names it, claimed when the release is cut", e.declared.hunks, "ok"),
          ...e.declared.rows.slice(0, GAP_ROWS).map((r) => `<tr><td>${prLinks([r.pr])}<br><span class="src">${esc(declaredWords(r.pr.declares!))}${r.pr.declares!.entry ? `: ${esc(r.pr.declares!.entry)}` : ""}</span></td><td class="num">${r.hunks}</td><td class="num">${share(r.hunks)}</td><td>${causes(r.causes)}</td><td class="num">${r.firstSeen.map((f) => esc(day(f.ranAt))).join(", ")}</td></tr>`),
          more(e.declared.rows, "PRs")
        ]
      : []),
    head("Contributed by a PR: first seen the night it merged", e.contributed.hunks, "lead"),
    ...e.contributed.rows.slice(0, GAP_ROWS).map((r) => `<tr><td>${prLinks(r.prs)}${r.missed?.length ? `<br><span class="src">${esc(missedWords(r))}: fix the line, or claim it</span>` : ""}</td><td class="num">${r.hunks}</td><td class="num">${share(r.hunks)}</td><td>${causes(r.causes)}</td><td class="num">${r.firstSeen.map((f) => esc(day(f.ranAt))).join(", ")}</td></tr>`),
    more(e.contributed.rows, "PR groups"),
    head("Unexplained: the record cannot say who", e.unexplained.hunks, "no"),
    ...e.unexplained.rows.map((r) => `<tr><td>${esc(unexplainedWords(r))}${r.suspects?.length ? `<br><span class="src">files point at ${esc(r.suspects.map((p) => (p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7))).join(", "))}</span>` : ""}</td><td class="num">${r.hunks}</td><td class="num">${share(r.hunks)}</td><td>${causes(r.causes)}</td><td></td></tr>`)
  ].join("");
  return `<section class="blk wide gap" id="gap"><h2>The gap, explained <span class="hint">every difference ${esc(g.comparing)} found, in one row each</span></h2>
<p class="ledger"><strong>${esc(g.sentence)}</strong></p>${g.verdictNote ? `<p class="src">${esc(g.verdictNote)}</p>` : ""}
<div class="scroll"><table><thead><tr><th>Explained by</th><th>Differences</th><th>Share</th><th>What changed (kinds)</th><th>First seen</th></tr></thead><tbody>${rows}</tbody></table></div>${e.rules?.length ? `\n<p class="src">The behaviour behind these Rules moved: ${e.rules.map((r) => esc(ruleTouchedWords(r))).join("; ")}.</p>` : ""}
<p class="src">A PR is named when the difference first appeared in the forecast after it merged and its files touch what changed; several PRs merged the same night stay one row ("one of"), never split by guesswork. A PR whose CHANGELOG line names the artefact that moved, as CONTRIBUTING.md asks (<code>(axe, dom)</code>), declared it: nothing is owed on main, and the release author claims it from that line. Read from ${e.history.runs} earlier forecasts beside the same production${e.history.first ? `, ${esc(day(e.history.first))} to ${esc(day(e.history.last ?? ""))}` : ""}.</p></section>`;
}

/**
 * Since 1.39.0: one small XmR chart per journey: production's limits as a band, main's nightly median as points. Since
 * 1.40.0 each line carries its figure (UCL, centre, LCL in ms) and the newest point its value, so the chart reads without
 * hovering.
 */
function timingChart(j: TimingJourney): string {
  const W = 360;
  const H = 110;
  const L = 6;
  const R = 92;
  const values = [...j.nights.flatMap((n) => [n.main, n.production]), j.limits.ucl, j.limits.lcl];
  const lo = Math.min(...values) * 0.95;
  const hi = Math.max(...values) * 1.05;
  const y = (v: number) => Math.round(8 + (H - 16) - ((v - lo) / (hi - lo || 1)) * (H - 16));
  const plotW = W - L - R;
  const x = (i: number) => Math.round(L + (j.nights.length === 1 ? plotW / 2 : 8 + (i * (plotW - 16)) / (j.nights.length - 1)));
  const line = (v: number, cls: string) => `<line class="${cls}" x1="${L}" x2="${L + plotW}" y1="${y(v)}" y2="${y(v)}"/>`;
  // Labels sit right of the plot; when two would overlap they are pushed apart, never dropped.
  const labels = [
    { v: j.limits.ucl, t: `UCL ${ms(j.limits.ucl)}` },
    { v: j.limits.centre, t: `centre ${ms(j.limits.centre)}` },
    { v: j.limits.lcl, t: `LCL ${ms(j.limits.lcl)}` }
  ].map((l) => ({ ...l, at: y(l.v) + 4 }));
  for (let k = 1; k < labels.length; k++) labels[k]!.at = Math.max(labels[k]!.at, labels[k - 1]!.at + 12);
  const text = labels.map((l) => `<text class="lim" x="${L + plotW + 6}" y="${l.at}">${esc(l.t)}</text>`).join("");
  const dots = j.nights.map((n, i) => `<circle class="${n.main > j.limits.ucl || n.main < j.limits.lcl ? "out" : "in"}" cx="${x(i)}" cy="${y(n.main)}" r="3.5"><title>${esc(day(n.ranAt))}: main ${n.main}ms, production ${n.production}ms</title></circle>`).join("");
  const last = j.nights.at(-1)!;
  const lastLabel = `<text class="pt" x="${x(j.nights.length - 1)}" y="${y(last.main) - 7}" text-anchor="${j.nights.length === 1 ? "middle" : "end"}">main ${esc(ms(last.main))}</text>`;
  const prod = j.nights.map((n, i) => `${x(i)},${y(n.production)}`).join(" ");
  return `<svg class="xmr" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(j.journey)}: ${esc(j.words)}"><rect class="band" x="${L}" width="${plotW}" y="${y(j.limits.ucl)}" height="${Math.max(1, y(j.limits.lcl) - y(j.limits.ucl))}"/>${line(j.limits.ucl, "ucl")}${line(j.limits.centre, "cl")}${line(j.limits.lcl, "ucl")}${j.nights.length > 1 ? `<polyline class="prod" points="${prod}"/>` : ""}${dots}${lastLabel}${text}</svg>`;
}

const ms = (v: number) => `${Math.round(v).toLocaleString("en-GB")}ms`;

/**
 * Since 1.40.0: what "countermeasures" means, on the tile itself, and where each one stands. A countermeasure is a fix
 * to the system that a 5 Whys asked for; it closes only when a release shows it working (its Check, then Verified by),
 * so a countermeasure already built is "waiting on a release", not unfinished work.
 */
function countermeasureTile(a: A3): string {
  const w = a.fiveWhys;
  const n = (st: FiveWhys["status"]) => w.filter((x) => x.status === st).length;
  const parts = [n("in place") ? `${n("in place")} built, waiting on a release to show ${n("in place") === 1 ? "it works" : "they work"}` : "", n("open") ? `${n("open")} not built yet` : "", n("overdue") ? `${n("overdue")} not built and overdue` : "", n("closed") ? `${n("closed")} verified` : ""].filter(Boolean);
  return `<div class="tile small"><span class="k">Countermeasures open</span><span class="big">${w.length - n("closed")}</span><span class="sub" title="Fixes to the system that a 5 Whys asked for. Each closes when a release shows it working.">fixes a 5 Whys asked for${parts.length ? `: ${parts.join(" · ")}` : ""} · <a href="#countermeasures">each one</a></span></div>`;
}

/** Since 1.40.0: the post-deploy tile reads the current release's runs only, and says so. */
function postDeployTile(p: NonNullable<Score["postDeploy"]>): string {
  const window = p.deployedAt ? `${p.runs} runs since ${p.release ? esc(p.release) : "this release"} was deployed ${esc(day(p.deployedAt))}` : `${p.runs} runs read (no deploy announced)`;
  const red = p.red ? `red since ${esc(when(p.since))} · ` : "";
  const links = [
    p.latest ? link("newest run", p.latest) : "",
    `<a href="#rca-post-deploy">why</a>`,
    p.issue ? link(`rollback #${p.issue.number}`, p.issue.url) : "",
    p.earlierIssue ? `${link(`#${p.earlierIssue.number}`, p.earlierIssue.url)} is from an earlier release` : ""
  ].filter(Boolean);
  return `<div class="tile small"><span class="k">Post-deploy${p.release ? ` · ${esc(p.release)}` : ""}</span><span class="mid"><span class="verdict ${p.red ? "fail" : "pass"}">${p.red ? `red × ${p.red}` : "green"}</span></span><span class="sub">${red}${window} · ${links.join(" · ")}</span></div>`;
}

/** Since 1.40.0: how a journey's UCL and LCL were worked out, with its own figures. */
function limitsWords(j: TimingJourney): string {
  const l = j.limits;
  const from = j.from === "nights" ? `production's median on each of the last ${l.n} nights` : `production's ${l.n} runs of this journey in the newest forecast`;
  return `Limits from ${from}: centre ${ms(l.centre)} is their mean; the average jump from one to the next (mR̄) is ${ms(l.mrBar)}; UCL = ${ms(l.centre)} + 2.66 × ${ms(l.mrBar)} = ${ms(l.ucl)}; LCL = ${ms(l.centre)} − 2.66 × ${ms(l.mrBar)} = ${ms(l.lcl)}.${l.provisional ? ` Provisional: under 10 points, so they will move as more are added.` : ""}`;
}

function timingHtml(a: A3): string {
  const t = a.timing;
  if (!t) return "";
  const out = t.journeys.filter((j) => j.state !== "inside").length;
  const rows = t.journeys
    .map((j) => `<tr><th scope="row">${esc(j.journey)}</th><td>${timingChart(j)}</td><td><span class="chip ${j.state === "inside" ? "decided" : "changed"}">${j.state === "inside" ? "common cause" : `special cause: ${esc(j.state)}`}</span><br>${esc(j.words)}<br><span class="src">${esc(limitsWords(j))}</span></td></tr>`)
    .join("");
  return `<section class="blk wide timing" id="timing"><h2>Timing on control charts <span class="hint">advice, never a failure: an outlier against production's own variation is something to investigate</span></h2>
<p class="ledger"><strong>${out ? `${out} of ${t.journeys.length} journeys outside production's limits: investigate ${out === 1 ? "it" : "them"}, starting with "what to check" in the report.` : `Every journey inside production's limits (${t.journeys.length}): common-cause variation, nothing to investigate.`}</strong></p>
<div class="scroll"><table><thead><tr><th>Journey</th><th>Main's median night by night (dots), production's limits (band)</th><th>Reading</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="src">How to read it: the band is how much production's own time for the journey varies when nothing has changed. The UCL (upper control limit) is the top of that band and the LCL (lower control limit) the bottom, each the centre ± 2.66 times the average jump between consecutive points (an XmR chart; 2.66 puts the limits about three standard deviations out, so a point beyond one happens by chance well under 1 time in 100). A dot inside the band is ordinary variation; a red dot outside it is a special cause, something changed, worth investigating. Limits come from production's nightly medians beside the same production, or from its runs in the newest forecast until there are two nights.</p></section>`;
}

export function renderA3(a: A3): string {
  const s = a.score;
  const goal = `<div class="scroll"><table><thead><tr><th>Measure</th><th>Now</th><th>Target</th><th></th></tr></thead><tbody>${a.goal.map((g) => `<tr><td>${esc(g.metric)}<br><span class="src">${esc(g.source)}</span></td><td>${esc(g.now)}</td><td>${esc(g.target)}</td><td>${g.met ? `<span class="ok">met</span>` : `<span class="no">gap</span>`}</td></tr>`).join("")}</tbody></table></div>`;
  const cms = a.countermeasures.length
    ? `<p class="note">A countermeasure is a fix to the system that a 5 Whys asked for. It moves from <em>open</em> (not built) to <em>in place</em> (built, with a link) to <em>closed</em>, and it closes only when a release shows it working: its check is read in that release's report and the release goes in <code>Verified by</code>.</p><div class="scroll"><table><thead><tr><th>Countermeasure</th><th>Built</th><th>How a release shows it works</th><th>Status</th></tr></thead><tbody>${a.countermeasures.map((c) => `<tr><td><span class="kind">${esc(c.kind)}</span> ${esc(c.what)}<br><span class="src"><a href="#why-${esc(c.from)}">its 5 Whys</a>${c.rca.length ? ` · answers ${c.rca.map((r) => `<a href="#rca-${esc(r)}">${esc(r)}</a>`).join(", ")}` : ""} · <a href="${REPO}/blob/main/kaizen/${encodeURIComponent(c.from)}">kaizen/${esc(c.from)}</a></span></td><td>${c.inPlace ? inline(c.inPlace) : `<span class="muted">not yet</span>`}</td><td>${c.check ? esc(c.check) : `<span class="muted">no check written: say what a release must show</span>`}</td><td><span class="status ${statusClass(c.status)}">${c.status === "closed" ? `verified in ${esc(c.verifiedBy)}` : c.status === "in place" ? "waiting on a release" : esc(c.status)}</span></td></tr>`).join("")}</tbody></table></div>`
    : `<p class="empty">The register is empty: no 5 Whys has a countermeasure yet.</p>`;
  const plan = `<div class="scroll"><table><thead><tr><th>What</th><th>Who</th><th>When</th><th>Status</th></tr></thead><tbody>${a.plan.map((p) => `<tr><td>${esc(p.what)}</td><td>${esc(p.who)}</td><td class="num">${esc(p.when)}</td><td><span class="status ${/^(open|in place|overdue|closed|met)$/.test(p.status) ? statusClass(p.status) : "open"}">${esc(p.status)}</span></td></tr>`).join("")}</tbody></table></div>`;
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
<header class="title"><h1>A3 Aggregator <span>· Tutors release confidence</span></h1><span class="meta">Built ${esc(when(a.builtAt))} by harness <code>${esc(a.harness)}</code> from ${a.sources.runs} kept runs and the kaizen register · <a href="./">home</a> · <a href="readiness.html">overnight readiness</a> · <a href="scoreboard.html">scoreboard</a> · <a href="a3.json">a3.json</a></span></header>
${a.gap ? `<p class="comparing">This sheet compares <strong>${esc(a.gap.comparing)}</strong>.</p>` : ""}
${andon(s, a)}
${gapHtml(a)}
${timingHtml(a)}
<div class="a3">
<section class="blk"><h2><span class="n">1</span>Background <span class="hint">why this matters</span></h2>${a.background.map((p) => `<p>${esc(p)}</p>`).join("")}<ul class="facts">${a.current.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section>
<section class="blk"><h2><span class="n">3</span>Goal <span class="hint">the target condition</span></h2>${goal}</section>
</div>
<section class="blk wide"><h2><span class="n">2</span>Current condition <span class="hint">go and see: the value stream, and where the problems pile up</span></h2>
${vsmHtml(a.current.valueStream)}
<div class="paretos">${a.current.paretos.map(paretoHtml).join("")}</div>${coursesHtml(a.courses)}</section>
<div class="a3">
<section class="blk"><h2><span class="n">4</span>Root cause analysis <span class="hint">each question as deep as the evidence goes</span></h2>
<ol class="rcas">${a.rca.map((q, i) => rcaHtml(q, i + 1, a.fiveWhys)).join("")}</ol>${decisionsHtml(a.decisions)}</section>
<div class="col">
<section class="blk" id="countermeasures"><h2><span class="n">5</span>Countermeasures <span class="hint">to the system, never to a person</span></h2>${cms}</section>
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
<div><dt>Decision</dt><dd>a fix on b is a choice, not a failure: orange, beside the traffic lights, and switched off by the claim that says why</dd></div>
<div><dt>Kaizen</dt><dd>every finding ends in one of seven countermeasure kinds, closed in a release (<a href="${REPO}/blob/main/docs/lean.md">docs/lean.md</a>)</dd></div>
</dl></section>
<footer>Sources: ${Object.entries(a.sources.streams).map(([k, v]) => `${v} ${esc(k)}`).join(", ")} run(s)${a.sources.first ? ` from ${esc(day(a.sources.first))} to ${esc(day(a.sources.last ?? ""))}` : ""}; GitHub ${esc(a.sources.github)}; ${a.sources.kaizen} 5 Whys in <code>kaizen/</code>. Advisory, like the score: nothing here is an input to the Gate, a verdict or an exit code.</footer>
</main>
</body>
</html>
`;
}
