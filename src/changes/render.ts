/**
 * Change risk as people read it. The per-PR table puts the PRs that lost points first, one row each, and folds every
 * PR that lost nothing into one row, so six clean PRs and one risky one read as one risky PR.
 *
 * No author column, anywhere: contributor lines are for the scoreboard's trends and the glance, never for reviewing
 * people. A first contribution is shown as a fact (and says it costs nothing on its own).
 */
import type { Changes, ChangeDeduction, PrRisk } from "./signals.ts";

const name = (p: Pick<PrRisk, "pr" | "sha">) => (p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7));
const pts = (d: Pick<ChangeDeduction, "points" | "floor">) => (d.points ? `−${d.points}` : "floor");
const ratio = (p: PrRisk) => (p.testDelta.ratio === null ? "no production lines" : p.testDelta.ratio.toFixed(2));
const reviewed = (p: PrRisk) => (p.direct ? "no PR" : p.reviewed === null ? "not measured" : p.reviewed ? "yes" : "**no**");
const risky = (c: Changes) => c.prs.filter((p) => p.deductions.length).sort((x, y) => y.points - x.points || Number(!!y.deductions.some((d) => d.floor)) - Number(!!x.deductions.some((d) => d.floor)));
const clean = (c: Changes) => c.prs.filter((p) => !p.deductions.length);
const released = (c: Changes) => `${c.refs.a}..${c.refs.b}`;

/** "Change risk 87 (100 − 13): 1 of 5 PRs lost points; floor breached." */
export function headline(c: Changes): string {
  const r = risky(c);
  const loose = c.changeRisk.deductions.filter((d) => d.pr === null && !d.commit);
  const direct = c.prs.filter((p) => p.direct).length;
  const merged = c.prs.length - direct;
  const units = direct ? `${c.prs.length} changes (${merged} ${merged === 1 ? "PR" : "PRs"}, ${direct} direct ${direct === 1 ? "commit" : "commits"})` : `${merged} ${merged === 1 ? "PR" : "PRs"}`;
  return `Change risk ${c.score} (100 − ${c.lost}), ${released(c)}: ${r.length} of ${units} carry a finding${loose.length ? `, and ${loose.length} finding(s) no PR carries` : ""}${c.floorBreached ? "; floor breached (caps the RCS at 74)" : ""}.`;
}

const FACT = "Contributor lines are for trends and glances, never for reviewing people: a first contribution is a fact and costs nothing on its own.";

/** The terminal board of `harness changes`. */
export function renderChangesBoard(c: Changes, file?: string): string {
  const lines = [headline(c), `  history: ${c.history.releases.length ? `${c.history.releases.length} release(s), ${c.history.releases.at(-1)!.from}..${c.history.releases[0]!.to}` : "none"}`, ""];
  lines.push(`  ${"PR".padEnd(9)}${"points".padStart(6)}  ${"churn".padStart(6)}  ${"files".padStart(5)}  ${"tests".padEnd(8)}${"reviewed".padEnd(13)}${"first".padEnd(6)}title`);
  for (const p of [...risky(c), ...clean(c)]) {
    lines.push(`  ${name(p).padEnd(9)}${(p.points ? `-${p.points}` : p.deductions.length ? "floor" : "0").padStart(6)}  ${String(p.churn).padStart(6)}  ${String(p.files.length).padStart(5)}  ${(p.testDelta.ratio === null ? "-" : p.testDelta.ratio.toFixed(2)).padEnd(8)}${reviewed(p).replaceAll("*", "").padEnd(13)}${(p.firstContribution ? "yes" : "").padEnd(6)}${p.title}`);
  }
  const ds = c.changeRisk.deductions;
  if (ds.length) lines.push("", "Where the points went, most first:", ...[...ds].sort((x, y) => y.points - x.points).flatMap((d) => [`  ${d.points ? `-${d.points}` : "floor"} ${d.why}`, `      ${d.evidence}`]));
  lines.push("", "Release signals:", ...signalLines(c).map((l) => `  ${l}`));
  if (c.notMeasured.length) lines.push("", "Not measured (never scored as clean):", ...c.notMeasured.map((n) => `  ${n.signal}: ${n.reason}`));
  lines.push("", FACT, "Advisory: never changes a verdict or an exit code.");
  if (file) lines.push(`changes.json: ${file}`);
  return lines.join("\n");
}

/** One line per release-level signal. */
export function signalLines(c: Changes): string[] {
  const s = c.signals;
  const out: string[] = [];
  out.push(s.churn.status === "measured" ? `churn: ${s.churn.apps.map((a) => `${a.app} ${a.churn}${a.median === null ? "" : ` (median ${a.median})`}${a.above ? " ABOVE 2×" : ""}`).join(", ")}` : `churn: not measured (${s.churn.reason})`);
  out.push(s.hotspots.status === "measured" ? `hotspots: ${s.hotspots.files.length} file(s) changed in 3+ of the last ${c.history.releases.length} releases; touched this release: ${s.hotspots.touched.map((t) => t.path).join(", ") || "none"}` : `hotspots: not measured (${s.hotspots.reason})`);
  out.push(`ownership: ${s.ownership.files.length ? s.ownership.files.map((f) => `${f.path} (${f.authors} authors)`).join(", ") : "no file with 3+ authors"}`);
  const o = s.orphans;
  out.push(`orphans: ${o.diffs.status === "measured" ? `${o.diffs.items.length} diff(s) with no changelog entry (${o.diffs.source})` : `diffs not measured (${o.diffs.reason})`}; ${o.entries.status === "measured" ? `${o.entries.items.length} changelog entr${o.entries.items.length === 1 ? "y" : "ies"} with no diff` : `entries not measured (${o.entries.reason})`}`);
  out.push(`tests: ${s.tests.packages.map((p) => `${p.package} ${p.ratio.toFixed(2)}${p.below ? " LOW" : ""}`).join(", ") || "no production lines changed"}`);
  const r = s.reviews;
  out.push(`reviews: ${r.status === "measured" ? `${r.reviewed.length} approved, ${r.unreviewed.length} not${r.unknown.length ? `, ${r.unknown.length} unknown` : ""}` : `not measured (${r.reason})`}${r.direct.length ? `; ${r.direct.length} commit(s) straight to main: ${r.direct.join(", ")}` : ""}`);
  const d = s.dependencies;
  out.push(d.status === "measured" ? `dependencies: ${d.majorBumps.length ? d.majorBumps.map((x) => `${x.name} ${x.from} → ${x.to}`).join(", ") : "no major bump"}; ${d.newPackages.length} new direct dependenc${d.newPackages.length === 1 ? "y" : "ies"}${d.newPackages.length ? ` (${d.newPackages.slice(0, 5).map((x) => x.name).join(", ")}${d.newPackages.length > 5 ? ", …" : ""})` : ""}` : `dependencies: not measured (${d.reason})`);
  return out;
}

const cell = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");

/** The per-PR table, for report.md under the score: risky PRs one row each, the clean ones folded into one row. */
export function renderChangesMarkdown(c: Changes): string {
  const out = [`**${headline(c)}**`, "", "| PR | title | churn | files | hotspots | tests ÷ production | reviewed | first contribution | points | where the points went |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"];
  for (const p of risky(c)) {
    const where = p.deductions.map((d) => `${pts(d)} ${d.evidence.startsWith("https://") ? `[${d.why}](${d.evidence})` : `${d.why} (${d.evidence})`}`).join("; ");
    out.push(`| ${p.url ? `[${name(p)}](${p.url})` : name(p)} | ${cell(p.title)} | ${p.churn} | ${p.files.length} | ${p.hotspotsTouched.length} | ${ratio(p)} | ${reviewed(p)} | ${p.firstContribution ? "yes (a fact)" : ""} | **${p.points ? `−${p.points}` : "floor"}** | ${cell(where)} |`);
  }
  const ok = clean(c);
  if (ok.length) out.push(`| ${ok.length} more | no deductions: ${ok.map(name).join(", ")} | ${ok.reduce((n, p) => n + p.churn, 0)} | ${ok.reduce((n, p) => n + p.files.length, 0)} |  |  |  |  | 0 |  |`);
  const loose = c.changeRisk.deductions.filter((d) => d.pr === null && !d.commit);
  if (loose.length) out.push("", "No PR between the tags carries these:", "", ...loose.map((d) => `- ${pts(d)} ${cell(d.why)} (${d.evidence})`));
  out.push("", ...signalLines(c).map((l) => `- ${l}`));
  if (c.notMeasured.length) out.push("", `Not measured: ${c.notMeasured.map((n) => `${n.signal} (${n.reason})`).join("; ")}.`);
  out.push("", `_${FACT} Every deduction, with the PR, the file and the link, is in changes.json._`);
  return out.join("\n");
}

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const href = (s: string) => (s.startsWith("https://") ? s : "changes.json");

/** The same table for report.html, under the score. Links go to the file in the PR's diff on GitHub. */
export function renderChangesHtml(c: Changes): string {
  const rows = risky(c)
    .map((p) => {
      const where = p.deductions.map((d) => `${esc(pts(d))} <a href="${esc(href(d.evidence))}">${esc(d.why)}</a>`).join("<br>");
      return `<tr><td>${p.url ? `<a href="${esc(p.url)}">${esc(name(p))}</a>` : esc(name(p))}</td><td>${esc(p.title)}</td><td>${p.churn}</td><td>${p.files.length}</td><td>${p.hotspotsTouched.length}</td><td>${esc(ratio(p))}</td><td>${esc(reviewed(p).replaceAll("*", ""))}</td><td>${p.firstContribution ? "yes (a fact)" : ""}</td><td><strong>${p.points ? `−${p.points}` : "floor"}</strong></td><td>${where}</td></tr>`;
    })
    .join("\n");
  const ok = clean(c);
  const folded = ok.length ? `<tr class="seam"><td>${ok.length} more</td><td>no deductions: ${ok.map((p) => esc(name(p))).join(", ")}</td><td>${ok.reduce((n, p) => n + p.churn, 0)}</td><td>${ok.reduce((n, p) => n + p.files.length, 0)}</td><td></td><td></td><td></td><td></td><td>0</td><td></td></tr>` : "";
  return `<h2 id="change-risk">Change risk per PR</h2>
<p class="rcs ${c.floorBreached ? "red" : c.lost ? "amber" : "green"}">${esc(headline(c))}</p>
<table><thead><tr><th>PR</th><th>title</th><th>churn</th><th>files</th><th>hotspots</th><th>tests ÷ production</th><th>reviewed</th><th>first contribution</th><th>points</th><th>where the points went</th></tr></thead><tbody>
${rows}
${folded}
</tbody></table>
<ul class="seam">${signalLines(c).map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
${c.notMeasured.length ? `<p class="seam">Not measured: ${esc(c.notMeasured.map((n) => `${n.signal} (${n.reason})`).join("; "))}.</p>` : ""}
<p class="seam">${esc(FACT)} Every deduction is in <a href="changes.json">changes.json</a>.</p>`;
}
