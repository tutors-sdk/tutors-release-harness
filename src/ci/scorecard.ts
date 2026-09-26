/**
 * The release scorecard: what a person wants from a run at a glance, derived from
 * its report.json and nothing else the harness does not already record.
 *
 *   harness scorecard --report <run dir | report.json> [--rules rules.json] [--json]
 *
 *   score        0-100 and a grade, with every deduction and its reason. Deterministic:
 *                the same report gives the same score on any machine.
 *   normalness   whether production looks like production: the A/A noise this run
 *                measured (noise mode) or relied on (release and post-deploy mode).
 *   rules        EARS Rule -> the diffs it claimed -> the PRs behind it. PRs come from
 *                the Rule's `prs` in rules.json when the monorepo publishes them, and from
 *                "PR #123" in the claim's reason. A claimed Rule that moved nothing, and the
 *                diffs no Rule claimed, are rows too.
 *   manual       at most five pages or scopes to test by hand, most urgent first: what
 *                no claim covers, then what only a person can judge (screenshots,
 *                accessibility, focus, DOM), then broad claims.
 *
 * Informational only. It never changes the verdict, the exit code or the gate: those
 * stay in src/gate.ts. A report that predates a field it reads scores without it.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Artefact, Claim, Hunk, RunReport } from "../types.ts";

export const SCORECARD_VERSION = 1;
export const MANUAL_LIMIT = 5;

/** Artefacts where a claimed difference still needs a person's eyes: a machine can say it moved, not that it is right. */
const HUMAN_JUDGED: readonly Artefact[] = ["screenshot", "axe", "focus", "dom"];

export interface Deduction {
  points: number;
  why: string;
}

export interface Normalness {
  /** normal: clean and verified. noisy: diffs between identical images. unknown: nothing to go on. */
  state: "normal" | "noisy" | "degraded" | "unknown";
  /** Where it came from: this run's own A/A, or the latest nightly status the run consulted. */
  source: "this-run" | "noise-status" | "none";
  hunks?: number;
  ranAt?: string;
  degraded?: string[];
}

export interface RuleRow {
  /** Four digits, or null for diffs no Rule claimed. */
  rule: string | null;
  title?: string;
  /** Diffs this Rule's claims covered. 0 for a stale claim: the Rule was claimed and nothing moved. */
  hunks: number;
  artefacts: Artefact[];
  scopes: string[];
  prs: number[];
  /** covered: claimed and moved. stale: claimed, nothing moved. unclaimed: moved, no Rule. changelog: claimed by a CHANGELOG entry, not a Rule. */
  status: "covered" | "stale" | "unclaimed" | "changelog";
}

export interface ManualCheck {
  scope: string;
  path?: string;
  artefacts: Artefact[];
  hunks: number;
  rule?: string;
  why: string;
}

export interface Scorecard {
  schemaVersion: typeof SCORECARD_VERSION;
  mode: RunReport["mode"];
  ranAt: string;
  verdict: RunReport["verdict"];
  score: number;
  grade: "A" | "B" | "C" | "D";
  deductions: Deduction[];
  normalness: Normalness;
  rules: RuleRow[];
  manual: ManualCheck[];
}

/** Rule id -> the PRs the monorepo says delivered it. rules.json entries may carry `prs`; the harness's own rules parser ignores the key. */
export type RulePrs = Record<string, { title?: string; prs?: number[] }>;

const RULE_IN_REASON = /\bRule (\d{4})\b/;
const PR_IN_TEXT = /\bPR #(\d+)\b/g;

const failing = (h: Hunk) => h.severity === "fail";
const uniq = <T>(xs: T[]) => [...new Set(xs)];
const byNumber = (a: number, b: number) => a - b;

function ruleOf(claim: Claim): string | undefined {
  return claim.rule ?? claim.reason?.match(RULE_IN_REASON)?.[1];
}

function prsIn(text: string | undefined): number[] {
  return text ? [...text.matchAll(PR_IN_TEXT)].map((m) => Number(m[1])) : [];
}

/** Take at most `max` points for `count` occurrences at `each`, and say why. */
function deduct(out: Deduction[], count: number, each: number, max: number, why: (n: number) => string) {
  if (count <= 0) return;
  out.push({ points: Math.min(count * each, max), why: why(count) });
}

export function normalnessOf(report: RunReport): Normalness {
  if (report.mode === "noise") {
    const hunks = report.compare.hunks.filter(failing).length;
    return { state: hunks === 0 ? "normal" : "noisy", source: "this-run", hunks, ranAt: report.ranAt };
  }
  const n = report.noise;
  if (!n) return { state: "unknown", source: "none" };
  const degraded = n.degraded ?? [];
  const state = degraded.length ? "degraded" : n.hunks === 0 && n.clean ? "normal" : "noisy";
  return { state, source: "noise-status", hunks: n.hunks, ranAt: n.ranAt, ...(degraded.length ? { degraded } : {}) };
}

export function ruleRows(report: RunReport, rules: RulePrs = {}): RuleRow[] {
  type Acc = { hunks: number; artefacts: Artefact[]; scopes: string[]; prs: number[]; title?: string; changelog?: boolean };
  const groups = new Map<string, Acc>();
  const add = (key: string, init: Partial<Acc>) => {
    const acc = groups.get(key) ?? { hunks: 0, artefacts: [], scopes: [], prs: [] };
    groups.set(key, { ...acc, ...init, hunks: acc.hunks + (init.hunks ?? 0), artefacts: [...acc.artefacts, ...(init.artefacts ?? [])], scopes: [...acc.scopes, ...(init.scopes ?? [])], prs: [...acc.prs, ...(init.prs ?? [])] });
  };
  const keyOf = (c: Claim) => {
    const rule = ruleOf(c);
    return rule ? `rule:${rule}` : `changelog:${c.reason}`;
  };
  const titleOf = (c: Claim, rule: string | undefined) => (rule ? c.ruleTitle ?? rules[rule]?.title ?? c.reason?.replace(RULE_IN_REASON, "").replace(/^:\s*/, "") : c.reason);

  for (const m of report.compare.matches) {
    if (!m.claim || !failing(m.hunk)) continue;
    const rule = ruleOf(m.claim);
    add(keyOf(m.claim), { hunks: 1, artefacts: [m.hunk.artefact], scopes: [m.hunk.path ?? m.hunk.scope], prs: [...prsIn(m.claim.reason), ...(rule ? rules[rule]?.prs ?? [] : [])], ...(titleOf(m.claim, rule) ? { title: titleOf(m.claim, rule)! } : {}), changelog: !rule });
  }
  const rows: RuleRow[] = [...groups.entries()].map(([key, g]) => ({
    rule: key.startsWith("rule:") ? key.slice(5) : null,
    ...(g.title ? { title: g.title } : {}),
    hunks: g.hunks,
    artefacts: uniq(g.artefacts),
    scopes: uniq(g.scopes),
    prs: uniq(g.prs).sort(byNumber),
    status: g.changelog ? "changelog" : "covered"
  }));
  for (const c of report.compare.staleClaims) {
    const rule = ruleOf(c);
    if (rows.some((r) => r.rule !== null && r.rule === rule)) continue;
    rows.push({ rule: rule ?? null, ...(titleOf(c, rule) ? { title: titleOf(c, rule)! } : {}), hunks: 0, artefacts: c.artefact === "*" ? [] : [c.artefact], scopes: [c.scope], prs: uniq([...prsIn(c.reason), ...(rule ? rules[rule]?.prs ?? [] : [])]).sort(byNumber), status: "stale" });
  }
  const unclaimed = report.compare.unclaimed.filter(failing);
  if (unclaimed.length) rows.push({ rule: null, hunks: unclaimed.length, artefacts: uniq(unclaimed.map((h) => h.artefact)), scopes: uniq(unclaimed.map((h) => h.path ?? h.scope)), prs: [], status: "unclaimed" });
  const order = { unclaimed: 0, covered: 1, changelog: 2, stale: 3 } as const;
  return rows.sort((a, b) => order[a.status] - order[b.status] || b.hunks - a.hunks || (a.rule ?? "").localeCompare(b.rule ?? ""));
}

export function manualSlice(report: RunReport, limit = MANUAL_LIMIT): ManualCheck[] {
  type Acc = { hunks: Hunk[]; rule?: string | undefined; tier: number; why: string };
  const byScope = new Map<string, Acc>();
  const put = (h: Hunk, tier: number, why: string, claim?: Claim) => {
    const key = h.path ?? h.scope;
    const rule = claim ? ruleOf(claim) : undefined;
    const prev = byScope.get(key);
    if (!prev) {
      byScope.set(key, { hunks: [h], tier, why, ...(rule ? { rule } : {}) });
      return;
    }
    prev.hunks.push(h);
    // The most urgent reason wins for the whole page.
    if (tier < prev.tier) Object.assign(prev, { tier, why, rule });
    else if (!prev.rule && rule) prev.rule = rule;
  };
  for (const h of report.compare.unclaimed.filter(failing)) put(h, 0, "moved and no claim covers it");
  for (const m of report.compare.matches) {
    if (!m.claim || !failing(m.hunk)) continue;
    const broad = m.claim.artefact === "*" || m.claim.scope === "*" || m.claim.scope === "**";
    if (broad) put(m.hunk, 2, "covered only by a broad claim");
    else if (HUMAN_JUDGED.includes(m.hunk.artefact)) put(m.hunk, 1, `intended change a person must see (${m.hunk.artefact})`, m.claim);
  }
  return [...byScope.entries()]
    .sort(([ka, a], [kb, b]) => a.tier - b.tier || b.hunks.length - a.hunks.length || ka.localeCompare(kb))
    .slice(0, limit)
    .map(([scope, a]) => ({ scope, ...(a.hunks[0]?.path ? { path: a.hunks[0].path } : {}), artefacts: uniq(a.hunks.map((h) => h.artefact)), hunks: a.hunks.length, ...(a.rule ? { rule: a.rule } : {}), why: a.why }));
}

export function scoreOf(report: RunReport, normalness: Normalness): Deduction[] {
  const d: Deduction[] = [];
  const unclaimed = report.compare.unclaimed.filter(failing).length;
  if (report.mode === "noise") {
    deduct(d, unclaimed, 5, 40, (n) => `${n} diff(s) between identical images: noise the gate has to mask or fix`);
  } else {
    deduct(d, unclaimed, 15, 60, (n) => `${n} diff(s) no claim covers`);
    if (normalness.state !== "normal") d.push({ points: 10, why: normalness.state === "unknown" ? "no A/A noise status: nothing says production is quiet" : `the A/A noise status is ${normalness.state}: diffs may be noise` });
  }
  deduct(d, report.compare.broadUnapproved.length, 10, 20, (n) => `${n} broad claim(s) without an approver`);
  deduct(d, report.compare.staleClaims.length, 5, 15, (n) => `${n} claim(s) that matched nothing: the changelog promises what the release does not show`);
  deduct(d, report.claimHygiene?.flagged.filter((f) => f.flags.includes("covers-many-hunks")).length ?? 0, 3, 9, (n) => `${n} claim(s) covering many diffs at once`);
  if (report.override) d.push({ points: 20, why: `a FAIL was overridden by ${report.override.by}` });
  return d;
}

const gradeOf = (score: number): Scorecard["grade"] => (score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D");

export function scorecard(report: RunReport, rules: RulePrs = {}): Scorecard {
  const normalness = normalnessOf(report);
  const deductions = scoreOf(report, normalness);
  const score = Math.max(0, 100 - deductions.reduce((s, x) => s + x.points, 0));
  return { schemaVersion: SCORECARD_VERSION, mode: report.mode, ranAt: report.ranAt, verdict: report.verdict, score, grade: gradeOf(score), deductions, normalness, rules: ruleRows(report, rules), manual: manualSlice(report) };
}

export function renderScorecard(s: Scorecard): string {
  const lines = [`## Scorecard — ${s.score}/100 (${s.grade})`, "", `Verdict ${s.verdict.toUpperCase()} · ${s.mode} · ${s.ranAt}. Informational: the score never changes the verdict.`, ""];
  lines.push(s.deductions.length ? "| points | why |\n|---|---|\n" + s.deductions.map((x) => `| −${x.points} | ${x.why} |`).join("\n") : "No deductions.", "");
  const n = s.normalness;
  lines.push(`**Normalness:** ${n.state}${n.hunks === undefined ? "" : ` (${n.hunks} A/A diff(s)${n.source === "noise-status" ? `, nightly of ${n.ranAt}` : ""})`}${n.degraded?.length ? `: ${n.degraded.join("; ")}` : ""}`, "");
  if (s.rules.length) {
    lines.push("### EARS Rules, diffs and PRs", "", "| Rule | status | diffs | artefacts | PRs |", "|---|---|---|---|---|");
    for (const r of s.rules) lines.push(`| ${r.rule ? `${r.rule}${r.title ? ` ${r.title}` : ""}` : r.status === "unclaimed" ? "no Rule" : r.title ?? "CHANGELOG"} | ${r.status} | ${r.hunks} | ${r.artefacts.join(", ") || "—"} | ${r.prs.map((p) => `#${p}`).join(", ") || "—"} |`);
    lines.push("");
  }
  lines.push("### Test by hand", "");
  if (s.manual.length) for (const m of s.manual) lines.push(`- \`${m.scope}\` (${m.artefacts.join(", ")}; ${m.hunks} diff(s)${m.rule ? `; Rule ${m.rule}` : ""}): ${m.why}`);
  else lines.push("Nothing: no diff needs a person's eyes.");
  return lines.join("\n") + "\n";
}

/** The run's report.json: the directory that holds it, or the file itself. */
export function readReport(where: string): RunReport {
  const p = resolve(where);
  const file = existsSync(p) && statSync(p).isDirectory() ? join(p, "report.json") : p;
  if (!existsSync(file)) throw new Error(`no report.json in ${where}`);
  return JSON.parse(readFileSync(file, "utf8")) as RunReport;
}

/** rules.json's Rules, keeping the optional `prs` the harness's own rules parser ignores. A file that cannot be read gives no PRs, never an error. */
export function readRulePrs(file: string | undefined): RulePrs {
  if (!file || !existsSync(file)) return {};
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { rules?: Record<string, { title?: unknown; prs?: unknown }> };
    return Object.fromEntries(
      Object.entries(raw.rules ?? {}).map(([id, r]) => [id, { ...(typeof r?.title === "string" ? { title: r.title } : {}), ...(Array.isArray(r?.prs) ? { prs: r.prs.filter((x): x is number => Number.isInteger(x) && x > 0) } : {}) }])
    );
  } catch {
    return {};
  }
}
