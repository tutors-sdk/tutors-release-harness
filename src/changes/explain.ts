/**
 * The gap, explained (since 1.37.0): one ledger per run, so a person can decide on it. "1,388 differences: claims
 * explain 976, #466 contributed 169, #313 contributed 40, ... and 112 are unexplained."
 *
 * Every failing difference of the run lands in exactly one row:
 *
 * 1. **Claimed**: a claim matched it. The row is the claim (its Rule or CHANGELOG reason).
 * 2. **Contributed by a PR**: unclaimed, and the kept history of forecasts beside the same baseline shows when it first
 *    appeared: the newest forecast before the current streak lacked it, the next one had it. Only the PRs merged
 *    between those two forecasts can have made it. Of those, the ones whose files touch what the difference is about
 *    (src/changes/attribute.ts, `byPath`) are named; when none do, all of them are. When one of them matched more files
 *    than the rest it leads the row ("#466 most likely, one of #466, #468"), and every night it led adds to that row;
 *    otherwise the group is the row ("one of #a, #b"). A difference is never split between PRs by guesswork.
 *    A difference already there in the oldest kept forecast is narrowed the same way within that forecast's whole
 *    range (every PR since the baseline), which is what the first forecast beside a new release reads.
 * 3. **Unexplained**: unclaimed, and the history cannot say who made it: it appeared between two forecasts with no PR
 *    merged between them (the stack or the world moved, not the code), or more than `MAX_GROUP` PRs could have made it
 *    (named as suspects, never counted as theirs).
 *
 * Differences are matched across runs by artefact, scope and kind (src/report/causes.ts `kindOf`), with numbers and
 * hashes folded away, so a difference whose figures move a little is still the same difference.
 *
 * It is a lead to read, never a verdict: nothing that judges reads it.
 */
import type { Hunk, RunReport } from "../types.ts";
import { claimLabel } from "../claims/rules.ts";
import { causeKey, foldCauses, kindOf } from "../report/causes.ts";
import { byPath, mergedSince, type AttributedPr } from "./attribute.ts";
import type { Changes, PrRisk } from "./signals.ts";

/** A run the ledger reads: the report it judged and the range of PRs it was built from. */
export interface LedgerRun {
  id: string;
  ranAt: string;
  report: RunReport;
  changes?: Changes;
}

export interface LedgerCause {
  /** `<artefact>: <kind>` (src/report/causes.ts). */
  key: string;
  hunks: number;
}

export interface ClaimRow {
  /** The claim as the reports name it (src/claims/rules.ts `claimLabel`). */
  label: string;
  rule?: string;
  reason?: string;
  hunks: number;
}

export interface PrRow {
  /** One PR, or the group the history could not narrow further. */
  prs: AttributedPr[];
  hunks: number;
  causes: LedgerCause[];
  /** The forecast it first appeared in (the run id and the candidate it judged). */
  firstSeen: { id: string; ranAt: string }[];
}

/** More PRs than this in one window is not an explanation anyone can act on. */
export const MAX_GROUP = 8;

export type UnexplainedWhy = "before-record" | "too-many" | "no-merge";

export interface UnexplainedRow {
  why: UnexplainedWhy;
  hunks: number;
  causes: LedgerCause[];
  /** before-record: the oldest kept forecast, which already had it. */
  since?: string;
  /** too-many and before-record: the PRs whose files match best, as leads to read. */
  suspects?: AttributedPr[];
}

export interface Explanation {
  /** Every failing difference of the run: claimed and unclaimed. */
  total: number;
  claimed: { hunks: number; rows: ClaimRow[] };
  contributed: { hunks: number; rows: PrRow[] };
  unexplained: { hunks: number; rows: UnexplainedRow[] };
  /** The forecasts read for history, oldest first; the run itself is not among them. */
  history: { runs: number; first: string | null; last: string | null };
}

/** The identity of a difference across runs: artefact, scope and kind, numbers and hashes folded. */
export const differenceKey = (h: Pick<Hunk, "artefact" | "scope" | "summary">) => `${h.artefact}|${h.scope.replace(/\d+/g, "#")}|${kindOf(h).kind}`;

const keysOf = (r: RunReport) => new Set(r.compare.unclaimed.map(differenceKey));
const prId = (p: Pick<AttributedPr, "pr" | "sha">) => (p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7));
const named = (p: PrRisk): AttributedPr => ({ pr: p.pr, sha: p.sha, title: p.title, ...(p.url ? { url: p.url } : {}), files: 0, direct: 0 });

function tallyCauses(hunks: Hunk[]): LedgerCause[] {
  const m = new Map<string, number>();
  for (const h of hunks) m.set(causeKey(h), (m.get(causeKey(h)) ?? 0) + 1);
  return [...m].map(([key, n]) => ({ key, hunks: n })).sort((x, y) => y.hunks - x.hunks || x.key.localeCompare(y.key));
}

/**
 * The ledger of `run`. `history` is the kept forecasts beside the same baseline, in any order; those that ran after
 * `run`, or beside another baseline, are ignored.
 */
export function explainGap(run: LedgerRun, history: LedgerRun[]): Explanation {
  const baseline = run.report.sides?.a?.reader;
  const past = history
    .filter((h) => h.id !== run.id && Date.parse(h.ranAt) < Date.parse(run.ranAt) && h.report.sides?.a?.reader === baseline && h.report.compare)
    .sort((x, y) => Date.parse(x.ranAt) - Date.parse(y.ranAt));
  const chain = [...past, run];
  const keys = chain.map((r) => keysOf(r.report));

  // Claimed: one row per claim.
  const claims = new Map<string, ClaimRow>();
  let claimedHunks = 0;
  for (const m of run.report.compare.matches ?? []) {
    if (!m?.claim || m.hunk.severity !== "fail") continue;
    const c = m.claim;
    const label = claimLabel(c) || `${c.artefact} ${c.scope}`;
    const row = claims.get(label) ?? { label, ...(c.rule ? { rule: c.rule } : {}), ...(c.reason ? { reason: c.reason } : {}), hunks: 0 };
    row.hunks += 1;
    claims.set(label, row);
    claimedHunks += 1;
  }

  // Unclaimed: walk back from the run to the start of the difference's current streak.
  const contributed = new Map<string, { prs: AttributedPr[]; hunks: Hunk[]; firstSeen: Map<string, string> }>();
  type Pending = { why: UnexplainedWhy; since?: string; hunks: Hunk[]; suspects: Map<string, { pr: AttributedPr; n: number }> };
  const unexplained = new Map<string, Pending>();
  const unexplain = (why: UnexplainedWhy, h: Hunk, suspects: AttributedPr[] = [], since?: string) => {
    const row: Pending = unexplained.get(why) ?? { why, ...(since ? { since } : {}), hunks: [], suspects: new Map() };
    row.hunks.push(h);
    for (const p of suspects.slice(0, 3)) {
      const s = row.suspects.get(prId(p)) ?? { pr: p, n: 0 };
      s.n += 1;
      row.suspects.set(prId(p), s);
    }
    unexplained.set(why, row);
  };
  const unclaimed = run.report.compare.unclaimed.filter((h) => h.severity === "fail");
  for (const h of unclaimed) {
    const k = differenceKey(h);
    let first = chain.length - 1;
    while (first > 0 && keys[first - 1]!.has(k)) first -= 1;
    const at = chain[first]!;
    const before = first > 0 ? chain[first - 1] : undefined;
    // The oldest kept forecast's window is its whole range, every PR since the baseline; when it kept no range, the
    // oldest range that was kept.
    const window = before ? (at.changes && before.changes ? mergedSince(at.changes, before.changes) : []) : ((at.changes ?? chain.find((r) => r.changes)?.changes)?.prs.filter((p) => !p.release) ?? []);
    if (!window.length) {
      if (before) unexplain("no-merge", h);
      else unexplain("before-record", h, [], at.ranAt);
      continue;
    }
    const cause = foldCauses([h]).causes[0];
    // A range kept by an older harness may carry PRs without their files: they match no path.
    const matched = cause ? byPath(cause, window.map((p) => ({ ...p, files: p.files ?? [] }))) : [];
    const prs = matched.length ? matched : window.map(named);
    if (prs.length > MAX_GROUP) {
      if (before) unexplain("too-many", h, prs);
      else unexplain("before-record", h, prs, at.ranAt);
      continue;
    }
    // A PR that matched more files than any other merged that night leads its row, so one PR's work is one row however
    // many nights it showed up on; otherwise the row is the group.
    const lead = prs.length === 1 || prs[0]!.files > (prs[1]?.files ?? 0) ? prs[0]! : undefined;
    const id = lead ? prId(lead) : prs.map(prId).sort().join(",");
    const row = contributed.get(id) ?? { prs: lead ? [lead] : prs, hunks: [], firstSeen: new Map<string, string>() };
    if (lead) for (const p of prs.slice(1)) if (!row.prs.some((q) => prId(q) === prId(p))) row.prs.push(p);
    row.hunks.push(h);
    row.firstSeen.set(at.id, at.ranAt);
    contributed.set(id, row);
  }

  const prRows: PrRow[] = [...contributed.values()]
    .map((r) => ({ prs: r.prs, hunks: r.hunks.length, causes: tallyCauses(r.hunks), firstSeen: [...r.firstSeen].map(([id, ranAt]) => ({ id, ranAt })).sort((x, y) => x.ranAt.localeCompare(y.ranAt)) }))
    .sort((x, y) => y.hunks - x.hunks || x.prs.length - y.prs.length);
  const unexplainedRows: UnexplainedRow[] = [...unexplained.values()]
    .map((r) => {
      const suspects = [...r.suspects.values()].sort((x, y) => y.n - x.n).slice(0, 3).map((x) => x.pr);
      return { why: r.why, hunks: r.hunks.length, causes: tallyCauses(r.hunks), ...(r.since ? { since: r.since } : {}), ...(suspects.length ? { suspects } : {}) };
    })
    .sort((x, y) => y.hunks - x.hunks);
  const sum = (rows: { hunks: number }[]) => rows.reduce((n, r) => n + r.hunks, 0);
  return {
    total: claimedHunks + unclaimed.length,
    claimed: { hunks: claimedHunks, rows: [...claims.values()].sort((x, y) => y.hunks - x.hunks || x.label.localeCompare(y.label)) },
    contributed: { hunks: sum(prRows), rows: prRows },
    unexplained: { hunks: sum(unexplainedRows), rows: unexplainedRows },
    history: { runs: past.length, first: past[0]?.ranAt ?? null, last: past.at(-1)?.ranAt ?? null }
  };
}

/** `#466`, `#466 most likely` (it matched the most files of the PRs merged that night), or `one of #a, #b`. */
export function prWords(prs: Pick<AttributedPr, "pr" | "sha" | "files">[]): string {
  const ids = prs.map(prId);
  if (ids.length === 1) return ids[0]!;
  return prs[0]!.files > (prs[1]?.files ?? 0) ? `${ids[0]} most likely` : `one of ${ids.join(", ")}`;
}

/** Why a row is unexplained, in words. */
export function unexplainedWords(r: Pick<UnexplainedRow, "why" | "since">): string {
  if (r.why === "no-merge") return "appeared between two forecasts with no PR merged between them (the stack moved, not the code)";
  if (r.why === "too-many") return `appeared on a night more than ${MAX_GROUP} PRs could have made it`;
  return `already in the oldest kept forecast${r.since ? ` (${r.since.slice(0, 10)})` : ""}, and more than ${MAX_GROUP} PRs since the baseline could have made it`;
}

/** The one-sentence ledger: "1388 differences: claims explain 976; #466 contributed 169; ...; 112 unexplained." */
export function ledgerSentence(e: Explanation, top = 3): string {
  const parts: string[] = [];
  if (e.claimed.hunks) parts.push(`claims explain ${e.claimed.hunks}`);
  for (const r of e.contributed.rows.slice(0, top)) parts.push(`${prWords(r.prs)} contributed ${r.hunks}`);
  const rest = e.contributed.rows.slice(top);
  if (rest.length) parts.push(`${rest.length} more PR group${rest.length === 1 ? "" : "s"} contributed ${rest.reduce((n, r) => n + r.hunks, 0)}`);
  parts.push(`${e.unexplained.hunks} unexplained`);
  return `${e.total} difference${e.total === 1 ? "" : "s"}: ${parts.join("; ")}.`;
}
