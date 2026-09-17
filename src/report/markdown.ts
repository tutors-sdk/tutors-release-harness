import type { RunReport } from "../types.ts";

const ICON = { pass: "✅", warn: "⚠️", fail: "❌" } as const;

/** The PR comment: verdict first, then what needs a claim, then what is claimed. */
export function renderMarkdown(report: RunReport): string {
  const { compare } = report;
  const lines: string[] = [];
  lines.push(`## ${ICON[report.verdict]} Release harness — ${report.mode} — ${report.verdict.toUpperCase()}`);
  lines.push("");
  lines.push(`| | a | b |`);
  lines.push(`|---|---|---|`);
  for (const app of ["reader", "catalogue", "live"] as const) lines.push(`| ${app} | \`${report.sides.a[app]}\` | \`${report.sides.b[app]}\` |`);
  lines.push("");
  for (const reason of report.reasons) lines.push(`- ${reason}`);
  if (report.noise) lines.push(`- A/A consulted: ${report.noise.clean ? "clean" : `${report.noise.hunks} diff(s)`} at ${report.noise.ranAt}`);
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

  const claimed = compare.matches.filter((m) => m.claim);
  if (claimed.length) {
    lines.push(`### Claimed differences (${claimed.length})`);
    lines.push("");
    lines.push("| artefact | scope | claimed by |");
    lines.push("|---|---|---|");
    for (const m of claimed) lines.push(`| \`${m.hunk.artefact}\` | \`${m.hunk.scope}\` | ${escape(m.claim!.reason)} |`);
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
  lines.push(`<sub>harness ${report.harnessVersion} · ${report.ranAt} · clock ${report.now} · ${report.runs} run(s) · masks fired: ${fired.length ? fired.map(([id, n]) => `${id}×${n}`).join(", ") : "none"}</sub>`);
  return lines.join("\n") + "\n";
}

function escape(text: string): string {
  return text.replaceAll("|", "\\|").replaceAll("\n", " ");
}
