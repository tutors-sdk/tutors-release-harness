import { APPS } from "../image-ref.ts";
import type { Hunk, RunReport } from "../types.ts";

/**
 * The report's Policy section (since 1.22.0): the policy family's results on b at a glance, one row per app and one
 * column per check (src/compare/policy.ts). Each cell says whether the check holds, how many findings it has, or that
 * it could not be evaluated; the findings themselves are rows of the differences, and of Informing while the check is
 * informing. Rendering only: the verdict was decided before the report is written.
 */
const FAMILY = ["image-hardening", "build-provenance", "vuln-ceiling"] as const;

type Cell = { kind: "findings"; n: number; informing: boolean; too: number } | { kind: "not evaluated"; why: string } | { kind: "holds"; what: string } | { kind: "none" };

function cellOf(hunks: Hunk[], check: string, app: string): Cell {
  const mine = hunks.filter((h) => h.artefact === check && h.scope.startsWith(`${app}/`));
  const found = mine.filter((h) => !h.scope.endsWith("/summary") && !h.scope.endsWith("/not-evaluated"));
  if (found.length) return { kind: "findings", n: found.length, informing: found.every((h) => h.level === "informing"), too: found.filter((h) => h.summary.endsWith("(production too)")).length };
  const not = mine.find((h) => h.scope.endsWith("/not-evaluated"));
  if (not) return { kind: "not evaluated", why: not.summary };
  const ok = mine.find((h) => h.scope.endsWith("/summary"));
  return ok ? { kind: "holds", what: ok.summary } : { kind: "none" };
}

function levelWord(report: RunReport): string {
  const levels = FAMILY.map((c) => report.levels?.[c]?.level ?? "blocking");
  return levels.every((l) => l === "informing") ? "informing" : levels.every((l) => l === "blocking") ? "blocking" : "mixed";
}

const present = (report: RunReport) => report.compare.hunks.some((h) => (FAMILY as readonly string[]).includes(h.artefact));

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

export function policyHtml(report: RunReport, esc: (s: string) => string): string {
  if (!present(report)) return "";
  const hunks = report.compare.hunks;
  const apps = APPS.filter((app) => FAMILY.some((c) => cellOf(hunks, c, app).kind !== "none"));
  const td = (check: string, app: string) => {
    const c = cellOf(hunks, check, app);
    const label = `data-label="${check}"`;
    if (c.kind === "findings") return `<td ${label}><a href="#${c.informing ? "informing" : "differences"}">${plural(c.n, "finding")}</a>${c.too ? ` <small>(${c.too} on production too)</small>` : ""}</td>`;
    if (c.kind === "not evaluated") return `<td ${label} title="${esc(c.why)}"><em>not evaluated</em></td>`;
    if (c.kind === "holds") return `<td ${label} title="${esc(c.what)}">holds</td>`;
    return `<td ${label}>—</td>`;
  };
  const level = levelWord(report);
  return `<h2 id="policy">Policy: what b must be <span class="level">${level}</span></h2>
<p>Checks on the candidate alone, whatever production is: image hardening (root user, no healthcheck, a secret in the environment or the layer history), build provenance (SLSA provenance from image-build.yml) and the vulnerability ceiling (a critical or high advisory with a fix available).${level === "informing" ? " Informing: reported, never gates; a claim can still cover a finding." : ""} Hover a cell for what was checked.</p>
<table class="policy"><thead><tr><th>app</th>${FAMILY.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${apps.map((app) => `<tr><td><code>${app}</code></td>${FAMILY.map((c) => td(c, app)).join("")}</tr>`).join("")}</tbody></table>`;
}

export function policyMarkdown(report: RunReport): string[] {
  if (!present(report)) return [];
  const hunks = report.compare.hunks;
  const apps = APPS.filter((app) => FAMILY.some((c) => cellOf(hunks, c, app).kind !== "none"));
  const cell = (check: string, app: string) => {
    const c = cellOf(hunks, check, app);
    return c.kind === "findings" ? `${plural(c.n, "finding")}${c.too ? ` (${c.too} on production too)` : ""}` : c.kind === "none" ? "—" : c.kind;
  };
  return [`### Policy: what b must be (${levelWord(report)})`, "", `| app | ${FAMILY.join(" | ")} |`, `|---|${FAMILY.map(() => "---").join("|")}|`, ...apps.map((app) => `| ${app} | ${FAMILY.map((c) => cell(c, app)).join(" | ")} |`), ""];
}
