import type { RunReport } from "../types.ts";
import { loudProvenance } from "./provenance.ts";
import { imageArtefactsMarkdown } from "./image-static.ts";
import { deploymentMarkdown, loudDeployment } from "./deployment.ts";

const ICON = { pass: "✅", warn: "⚠️", fail: "❌" } as const;

/** The PR comment: verdict first, then what needs a claim, then what is claimed. */
export function renderMarkdown(report: RunReport): string {
  const { compare } = report;
  const lines: string[] = [];
  lines.push(`## ${ICON[report.verdict]} Release harness — ${report.mode} — ${report.verdict.toUpperCase()}`);
  lines.push("");
  const loud = loudProvenance(report);
  if (loud) {
    lines.push(`> ⚠️ **${loud.text}**`);
    lines.push("");
  }
  const loudDeploy = loudDeployment(report);
  if (loudDeploy) {
    lines.push(`> ⚠️ **${loudDeploy}**`);
    lines.push("");
  }
  lines.push(`| | a | b |`);
  lines.push(`|---|---|---|`);
  for (const app of ["reader", "catalogue", "live"] as const) lines.push(`| ${app} | \`${report.sides.a[app]}\` | \`${report.sides.b[app]}\` |`);
  if (report.provenance?.a || report.provenance?.b) {
    const p = report.provenance;
    const short = (v: string | undefined) => (v ? v.replace(/^sha256:/, "").slice(0, 12) : "—");
    lines.push(`| **provenance** | **${p.a?.summary ?? "not recorded"}** | **${p.b?.summary ?? "not recorded"}** |`);
    for (const app of ["reader", "catalogue", "live"] as const) {
      const cell = (side: "a" | "b") => {
        const info = p[side]?.images[app];
        return info ? `${info.digest ? `\`${info.digest}\`` : "no registry digest"} · rev \`${short(info.revision)}\` · version \`${info.version ?? "—"}\`` : "—";
      };
      lines.push(`| ${app} image | ${cell("a")} | ${cell("b")} |`);
    }
  }
  lines.push("");
  for (const reason of report.reasons) lines.push(`- ${reason}`);
  if (report.noise) lines.push(`- A/A consulted: ${report.noise.clean ? "clean" : `${report.noise.hunks} diff(s)`}${report.noise.degraded?.length ? " but DEGRADED (does not count)" : ""} at ${report.noise.ranAt}`);
  lines.push("");

  if (compare.unclaimed.length) {
    lines.push(`### Unclaimed differences (${compare.unclaimed.length})`);
    lines.push("");
    lines.push("| artefact | scope | what changed |");
    lines.push("|---|---|---|");
    for (const h of compare.unclaimed) lines.push(`| \`${h.artefact}\` | \`${h.scope}\` | ${escape(h.summary)} |`);
    lines.push("");
    lines.push("Claim each one in the release's `claims.yaml` with the Rule or changelog entry that intends it, or fix it.");
    lines.push("");
  }

  if (report.override) {
    const o = report.override;
    lines.push(`### ${o.applied ? "Harness FAIL overridden" : "Override recorded, not needed"}`);
    lines.push("");
    lines.push(`- by \`${o.by}\` at ${o.at}`);
    lines.push(`- verdict before the override: ${o.verdict.toUpperCase()}`);
    lines.push(`- reason: ${escape(o.reason)}`);
    lines.push("");
  }

  const claimed = compare.matches.filter((m) => m.claim);
  if (claimed.length) {
    lines.push(`### Claimed differences (${claimed.length})`);
    lines.push("");
    lines.push("| artefact | scope | claimed by |");
    lines.push("|---|---|---|");
    for (const m of claimed) lines.push(`| \`${m.hunk.artefact}\` | \`${m.hunk.scope}\` | ${escape(m.claim!.reason)} |`);
    lines.push("");
  }

  if (report.claimHygiene) {
    const h = report.claimHygiene;
    lines.push(`### Claim hygiene`);
    lines.push("");
    lines.push(`${h.claims} claim(s) cover ${h.claimedHunks} failing hunk(s): ${h.hunksPerClaim} hunk(s) per claim, at most ${h.maxHunksPerClaim} under one claim (flagged above ${h.threshold}).`);
    if (h.flagged.length) {
      lines.push("");
      lines.push("| artefact | scope | hunks | flag |");
      lines.push("|---|---|---|---|");
      for (const f of h.flagged) {
        const why = f.flags.map((x) => (x === "covers-many-hunks" ? `covers more than ${h.threshold} hunks` : `broad claim, approved by \`${f.claim.approvedBy}\``)).join("; ");
        lines.push(`| \`${f.claim.artefact}\` | \`${f.claim.scope}\` | ${f.hunks} | ${why} |`);
      }
      lines.push("");
      lines.push("A claim states that a difference is intended. One that covers many hunks, or everything, has stopped saying which. Split it, or explain it in the reason.");
    }
    lines.push("");
  }
  lines.push(...deploymentMarkdown(report)); // 1.3.0
  lines.push(...imageArtefactsMarkdown(report)); // R5 static image artefacts

  if (report.migration) {
    const m = report.migration;
    lines.push(`### Migration rehearsal`);
    lines.push("");
    lines.push(`- a: \`${m.a.ref}\` — ${m.a.files.length} migration(s), ${Object.keys(m.a.catalog.tables).length} table(s)`);
    lines.push(`- b: \`${m.b.ref}\` — ${m.b.files.filter((f) => !m.a.files.includes(f)).length} new migration(s): ${m.b.files.filter((f) => !m.a.files.includes(f)).map((f) => `\`${f}\``).join(", ") || "none"}`);
    lines.push("");
  }
  if (report.upgrade) {
    const u = report.upgrade;
    lines.push(`### Upgrade rehearsal (${u.substrate})`);
    lines.push("");
    lines.push(`| upstream | requests | failed | 5xx | p95 |`);
    lines.push(`|---|---|---|---|---|`);
    for (const [k, v] of Object.entries(u.byUpstream)) lines.push(`| ${k} | ${v.requests} | ${v.failed} | ${v.serverErrors} | ${v.p95} ms |`);
    lines.push(`| **all** | ${u.requests} | ${u.failed} | ${u.serverErrors} | switched at ${(u.switchedAt / 1000).toFixed(1)} s |`);
    lines.push("");
  }
  if (report.load) {
    lines.push(`### Load (k6, ${report.load.a.rate} req/s for ${report.load.a.duration})`);
    lines.push("");
    lines.push(`| side | requests | failed | 5xx | p50 | p95 |`);
    lines.push(`|---|---|---|---|---|---|`);
    for (const side of ["a", "b"] as const) {
      const l = report.load[side];
      lines.push(`| ${side} | ${l.requests} | ${l.failed} | ${l.serverErrors} | ${l.p50} ms | ${l.p95} ms |`);
    }
    lines.push("");
  }

  const info = compare.hunks.filter((h) => h.severity === "info");
  if (info.length) {
    lines.push(`<details><summary>Informational (${info.length})</summary>`);
    lines.push("");
    for (const h of info) lines.push(`- \`${h.artefact}\` ${escape(h.summary)}`);
    lines.push("");
    lines.push("</details>");
    lines.push("");
  }

  if (compare.staleClaims.length) {
    lines.push(`<details><summary>Stale claims (${compare.staleClaims.length})</summary>`);
    lines.push("");
    for (const c of compare.staleClaims) lines.push(`- \`${c.artefact}\` \`${c.scope}\` — ${escape(c.reason)}`);
    lines.push("");
    lines.push("</details>");
    lines.push("");
  }

  const fired = Object.entries(report.masksApplied).filter(([, n]) => n > 0);
  lines.push(`<sub>harness ${report.harness.version} (${report.harness.gitSha?.slice(0, 12) ?? "no git sha"}, contract ${report.harness.contractVersion}) · ${report.ranAt} · clock ${report.now} · ${report.runs} run(s) · masks fired: ${fired.length ? fired.map(([id, n]) => `${id}×${n}`).join(", ") : "none"}</sub>`);
  return lines.join("\n") + "\n";
}

function escape(text: string): string {
  return text.replaceAll("|", "\\|").replaceAll("\n", " ");
}
