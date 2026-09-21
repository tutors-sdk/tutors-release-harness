import type { Hunk, RunReport } from "../types.ts";
import { loudProvenance } from "./provenance.ts";
import { deploymentHtml, loudDeployment } from "./deployment.ts";
import { imageArtefactsHtml } from "./image-static.ts";

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function hunkRow(h: Hunk, claimedBy?: string): string {
  const detail = h.detail ? `<details><summary>detail</summary><pre>${esc(h.detail)}</pre></details>` : "";
  return `<tr class="${h.severity}"><td><code>${h.artefact}</code></td><td><code>${esc(h.scope)}</code>${h.path ? `<br><small>${esc(h.path)}</small>` : ""}</td><td>${esc(h.summary)}${detail}</td><td>${claimedBy ? esc(claimedBy) : h.severity === "info" ? "<em>informational</em>" : "<strong>unclaimed</strong>"}</td></tr>`;
}

const short = (v: string | undefined) => (v ? v.replace(/^sha256:/, "").slice(0, 12) : "");

/** The header block that says where each side's images came from and what they say about themselves. */
function provenanceBlock(report: RunReport): string {
  const p = report.provenance;
  if (!p?.a && !p?.b) return "";
  const cell = (side: "a" | "b", app: "reader" | "catalogue" | "live") => {
    const info = p[side]?.images[app];
    if (!info) return "<td>—</td>";
    const bits = [info.digest ? `digest <code>${esc(info.digest)}</code>` : info.id ? `id <code>${esc(short(info.id))}</code> (no registry digest)` : "", info.revision ? `revision <code>${esc(short(info.revision))}</code>` : "revision <em>unlabelled</em>", info.version ? `version <code>${esc(info.version)}</code>` : "version <em>unlabelled</em>", info.unverifiedReason ? `<strong>not verified:</strong> ${esc(info.unverifiedReason)}` : ""].filter(Boolean);
    return `<td>${bits.join("<br>")}</td>`;
  };
  return `<table class="provenance">
<thead><tr><th>provenance</th><th>a — ${esc(p.a?.summary ?? "not recorded")}</th><th>b — ${esc(p.b?.summary ?? "not recorded")}</th></tr></thead>
<tbody>${(["reader", "catalogue", "live"] as const).map((app) => `<tr><td>${app}</td>${cell("a", app)}${cell("b", app)}</tr>`).join("")}</tbody>
</table>`;
}

/** One self-contained HTML file per run: verdict, sides, every hunk with its claim, masks that fired. */
export function renderHtml(report: RunReport): string {
  const { compare } = report;
  const loud = loudProvenance(report);
  const rows = compare.matches.map((m) => hunkRow(m.hunk, m.claim?.reason)).join("\n");
  const fired = Object.entries(report.masksApplied).filter(([, n]) => n > 0);
  const silent = Object.entries(report.masksApplied).filter(([, n]) => n === 0);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Harness ${esc(report.mode)} ${esc(report.verdict)}</title>
<style>
  :root { color-scheme: light dark; --pass:#2f7a4f; --warn:#8a6119; --fail:#a12a2a; --rule:#8884; }
  body { margin:0; padding:24px 16px; font:15px/1.5 system-ui, sans-serif; max-width: 64rem; margin-inline:auto; }
  h1 { font-size:1.4rem; margin:0 0 4px; }
  .verdict { display:inline-block; padding:2px 10px; border-radius:4px; color:#fff; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
  .verdict.pass { background:var(--pass);} .verdict.warn { background:var(--warn);} .verdict.fail { background:var(--fail);}
  table { border-collapse:collapse; width:100%; margin:12px 0 24px; font-size:14px; }
  th, td { text-align:left; vertical-align:top; padding:6px 8px; border-bottom:1px solid var(--rule); }
  th { font-size:12px; text-transform:uppercase; letter-spacing:.06em; opacity:.7; }
  tr.info td { opacity:.75; }
  tr.fail td:last-child strong { color:var(--fail); }
  table.provenance td { font-size:13px; word-break:break-all; }
  .loud { border-left:4px solid var(--warn); padding:6px 10px; font-weight:600; }
  code, pre { font-family: ui-monospace, Menlo, Consolas, monospace; font-size:13px; }
  pre { white-space:pre-wrap; margin:6px 0 0; padding:8px; background:#8881; border-radius:4px; }
  details summary { cursor:pointer; font-size:13px; opacity:.8; }
  ul { padding-left:1.2rem; }
  footer { font-size:12px; opacity:.7; border-top:1px solid var(--rule); padding-top:12px; }
</style>
</head>
<body>
<h1>Tutors release harness — <code>${esc(report.mode)}</code> <span class="verdict ${report.verdict}">${report.verdict}</span></h1>
<p><small>${esc(report.ranAt)} · clock ${esc(report.now)} · ${report.runs} run(s) per side · harness ${esc(report.harnessVersion)}</small></p>
${loud ? `<p class="loud">${esc(loud.text)}</p>` : ""}
${loudDeployment(report) ? `<p class="loud">${esc(loudDeployment(report)!)}</p>` : ""}
<ul>${report.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}${report.noise ? `<li>A/A consulted: ${report.noise.clean ? "clean" : `${report.noise.hunks} diff(s)`}${report.noise.degraded?.length ? " but DEGRADED (does not count)" : ""} at ${esc(report.noise.ranAt)}</li>` : ""}</ul>

<table>
<thead><tr><th></th><th>a</th><th>b</th></tr></thead>
<tbody>${(["reader", "catalogue", "live"] as const).map((app) => `<tr><td>${app}</td><td><code>${esc(report.sides.a[app])}</code></td><td><code>${esc(report.sides.b[app])}</code></td></tr>`).join("")}</tbody>
</table>
${provenanceBlock(report)}
${deploymentHtml(report, esc)}
${imageArtefactsHtml(report)}

${
  report.migration
    ? `<h2>Migration rehearsal</h2><p>a: <code>${esc(report.migration.a.ref)}</code> — ${report.migration.a.files.length} migration(s), ${Object.keys(report.migration.a.catalog.tables).length} table(s).<br>b: <code>${esc(report.migration.b.ref)}</code> — new migration(s): ${report.migration.b.files.filter((f) => !report.migration!.a.files.includes(f)).map((f) => `<code>${esc(f)}</code>`).join(", ") || "none"}.</p>`
    : ""
}
${
  report.upgrade
    ? `<h2>Upgrade rehearsal (${esc(report.upgrade.substrate)})</h2><table><thead><tr><th>upstream</th><th>requests</th><th>failed</th><th>5xx</th><th>p95</th></tr></thead><tbody>${Object.entries(report.upgrade.byUpstream)
        .map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.requests}</td><td>${v.failed}</td><td>${v.serverErrors}</td><td>${v.p95} ms</td></tr>`)
        .join("")}<tr><td><strong>all</strong></td><td>${report.upgrade.requests}</td><td>${report.upgrade.failed}</td><td>${report.upgrade.serverErrors}</td><td>switched at ${(report.upgrade.switchedAt / 1000).toFixed(1)} s</td></tr></tbody></table>`
    : ""
}
${
  report.load
    ? `<h2>Load (k6, ${report.load.a.rate} req/s for ${esc(report.load.a.duration)})</h2><table><thead><tr><th>side</th><th>requests</th><th>failed</th><th>5xx</th><th>p50</th><th>p95</th></tr></thead><tbody>${(["a", "b"] as const)
        .map((s) => `<tr><td>${s}</td><td>${report.load![s].requests}</td><td>${report.load![s].failed}</td><td>${report.load![s].serverErrors}</td><td>${report.load![s].p50} ms</td><td>${report.load![s].p95} ms</td></tr>`)
        .join("")}</tbody></table>`
    : ""
}

<h2>Differences (${compare.hunks.length}; ${compare.unclaimed.length} unclaimed)</h2>
${compare.hunks.length ? `<table><thead><tr><th>artefact</th><th>scope</th><th>what changed</th><th>claimed by</th></tr></thead><tbody>${rows}</tbody></table>` : "<p>None. The two sides are observably identical after normalisation.</p>"}

${compare.staleClaims.length ? `<h2>Stale claims (${compare.staleClaims.length})</h2><ul>${compare.staleClaims.map((c) => `<li><code>${c.artefact}</code> <code>${esc(c.scope)}</code> — ${esc(c.reason)}</li>`).join("")}</ul>` : ""}
${compare.broadUnapproved.length ? `<h2>Broad claims without approval (${compare.broadUnapproved.length})</h2><ul>${compare.broadUnapproved.map((c) => `<li><code>${c.artefact}</code> <code>${esc(c.scope)}</code> — ${esc(c.reason)}</li>`).join("")}</ul>` : ""}

${
  report.override
    ? `<h2>${report.override.applied ? "Harness FAIL overridden" : "Override recorded, not needed"}</h2><p class="loud">By <code>${esc(report.override.by)}</code> at ${esc(report.override.at)}; verdict before the override: ${report.override.verdict.toUpperCase()}.<br>Reason: ${esc(report.override.reason)}</p>`
    : ""
}
${
  report.claimHygiene
    ? `<h2>Claim hygiene</h2><p>${report.claimHygiene.claims} claim(s) cover ${report.claimHygiene.claimedHunks} failing hunk(s): ${report.claimHygiene.hunksPerClaim} per claim, at most ${report.claimHygiene.maxHunksPerClaim} under one (flagged above ${report.claimHygiene.threshold}).</p>${report.claimHygiene.flagged.length ? `<ul>${report.claimHygiene.flagged.map((f) => `<li><code>${f.claim.artefact}</code> <code>${esc(f.claim.scope)}</code> — ${f.hunks} hunk(s): ${f.flags.map((x) => (x === "covers-many-hunks" ? "covers many hunks" : `broad claim approved by ${esc(f.claim.approvedBy ?? "")}`)).join("; ")}</li>`).join("")}</ul>` : ""}`
    : ""
}

<h2>Masks</h2>
<p>Fired: ${fired.length ? fired.map(([id, n]) => `<code>${esc(id)}</code>×${n}`).join(", ") : "none"}.<br>
Silent this run: ${silent.length ? silent.map(([id]) => `<code>${esc(id)}</code>`).join(", ") : "none"} — a mask that never fires is a mask to delete.</p>

<footer>Every masked field is listed in <code>normalise/masks.yaml</code> with a reason. A mask is a blind spot you chose.<br>harness ${esc(report.harness.version)} · ${esc(report.harness.gitSha?.slice(0, 12) ?? "no git sha")} · contract ${esc(report.harness.contractVersion)}</footer>
</body>
</html>
`;
}
