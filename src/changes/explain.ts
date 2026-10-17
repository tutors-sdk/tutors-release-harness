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
 * 2a. **Declared by a PR** (since 1.41.0): contributed, and that PR's CHANGELOG line names the difference's artefact
 *    (src/changes/declares.ts). The contributor said so in the PR; the release author turns the line into a claim
 *    when the release is cut, so nothing is owed on main. A contributed row whose PR wrote a CHANGELOG line that does not
 *    name the artefact keeps that PR in `missed`: the line is the thing to fix.
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
import { byPath, declarer, mergedSince, missedBy, named, type AttributedPr } from "./attribute.ts";
import { declaredWords } from "./declares.ts";
import type { Changes } from "./signals.ts";

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
  /** Since 1.41.0: its PRs that wrote a CHANGELOG line naming other artefacts, not the ones that moved. */
  missed?: AttributedPr[];
}

/** Since 1.41.0: differences a PR made and its CHANGELOG line declared. */
export interface DeclaredRow {
  pr: AttributedPr;
  hunks: number;
  causes: LedgerCause[];
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
  /** Since 1.41.0; absent in an explanation kept before it. */
  declared?: { hunks: number; rows: DeclaredRow[] };
  unexplained: { hunks: number; rows: UnexplainedRow[] };
  /** The forecasts read for history, oldest first; the run itself is not among them. */
  history: { runs: number; first: string | null; last: string | null };
}

/** The identity of a difference across runs: artefact, scope and kind, numbers and hashes folded. */
export const differenceKey = (h: Pick<Hunk, "artefact" | "scope" | "summary">) => `${h.artefact}|${h.scope.replace(/\d+/g, "#")}|${kindOf(h).kind}`;

const candidateOf = (r: LedgerRun) => r.report.sides?.b?.reader;
const keysOf = (r: RunReport) => new Set(r.compare.unclaimed.map(differenceKey));
const prId = (p: Pick<AttributedPr, "pr" | "sha">) => (p.pr !== null ? `#${p.pr}` : p.sha.slice(0, 7));

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
  const causesIn = chain.map((r) => new Set(r.report.compare.unclaimed.map(causeKey)));

  // Since 1.41.1: what a PR declares is read from the run's own range, the newest reading of its body: a forecast kept
  // before the PR's CHANGELOG line was written, or corrected, carries the old one or none.
  const live = new Map((run.changes?.prs ?? []).filter((p) => p.declares).map((p) => [prId(p), p.declares!]));
  const declaredNow = (p: AttributedPr): AttributedPr => {
    const d = live.get(prId(p));
    return d ? { ...p, declares: d } : p;
  };

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
  const contributed = new Map<string, { prs: AttributedPr[]; hunks: Hunk[]; firstSeen: Map<string, string>; missed: Map<string, AttributedPr> }>();
  const declared = new Map<string, { pr: AttributedPr; hunks: Hunk[]; firstSeen: Map<string, string> }>();
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
    // Since 1.41.1: the same change seen on more pages. An earlier forecast of the same build that already had this
    // kind of difference judged the same code, so no merge lies between them and the window is the one before it. A new
    // kind of difference on the same build stays where it is: the stack moved, not the code.
    while (first > 0 && candidateOf(chain[first - 1]!) === candidateOf(chain[first]!) && causesIn[first - 1]!.has(causeKey(h))) first -= 1;
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
    const prs = (matched.length ? matched : window.map((p) => named(p))).map(declaredNow);
    if (prs.length > MAX_GROUP) {
      if (before) unexplain("too-many", h, prs);
      else unexplain("before-record", h, prs, at.ranAt);
      continue;
    }
    const by = declarer(prs, h.artefact);
    if (by) {
      const row = declared.get(prId(by)) ?? { pr: by, hunks: [], firstSeen: new Map<string, string>() };
      row.hunks.push(h);
      row.firstSeen.set(at.id, at.ranAt);
      declared.set(prId(by), row);
      continue;
    }
    // A PR that matched more files than any other merged that night leads its row, so one PR's work is one row however
    // many nights it showed up on; otherwise the row is the group.
    const lead = prs.length === 1 || prs[0]!.files > (prs[1]?.files ?? 0) ? prs[0]! : undefined;
    const id = lead ? prId(lead) : prs.map(prId).sort().join(",");
    const row = contributed.get(id) ?? { prs: lead ? [lead] : prs, hunks: [], firstSeen: new Map<string, string>(), missed: new Map<string, AttributedPr>() };
    for (const p of missedBy(prs, h.artefact)) row.missed.set(prId(p), p);
    if (lead) for (const p of prs.slice(1)) if (!row.prs.some((q) => prId(q) === prId(p))) row.prs.push(p);
    row.hunks.push(h);
    row.firstSeen.set(at.id, at.ranAt);
    contributed.set(id, row);
  }

  const seen = (m: Map<string, string>) => [...m].map(([id, ranAt]) => ({ id, ranAt })).sort((x, y) => x.ranAt.localeCompare(y.ranAt));
  const prRows: PrRow[] = [...contributed.values()]
    .map((r) => ({ prs: r.prs, hunks: r.hunks.length, causes: tallyCauses(r.hunks), firstSeen: seen(r.firstSeen), ...(r.missed.size ? { missed: [...r.missed.values()] } : {}) }))
    .sort((x, y) => y.hunks - x.hunks || x.prs.length - y.prs.length);
  const declaredRows: DeclaredRow[] = [...declared.values()]
    .map((r) => ({ pr: r.pr, hunks: r.hunks.length, causes: tallyCauses(r.hunks), firstSeen: seen(r.firstSeen) }))
    .sort((x, y) => y.hunks - x.hunks);
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
    declared: { hunks: sum(declaredRows), rows: declaredRows },
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

/** What the missed lines said, beside what moved: `#505's CHANGELOG line says (axe, dom); focus moved`. */
export function missedWords(r: Pick<PrRow, "missed" | "causes">): string {
  const moved = [...new Set(r.causes.map((c) => c.key.split(":")[0]!))].join(", ");
  return `${(r.missed ?? []).map((p) => `${prWords([p])}'s CHANGELOG line says ${declaredWords(p.declares!)}`).join("; ")}; ${moved} moved`;
}

/** The one-sentence ledger: "1388 differences: claims explain 976; #466 contributed 169; ...; 112 unexplained." */
export function ledgerSentence(e: Explanation, top = 3): string {
  const parts: string[] = [];
  if (e.claimed.hunks) parts.push(`claims explain ${e.claimed.hunks}`);
  for (const r of e.declared?.rows ?? []) parts.push(`${prWords([r.pr])} declared ${r.hunks} in its CHANGELOG line`);
  for (const r of e.contributed.rows.slice(0, top)) parts.push(`${prWords(r.prs)} contributed ${r.hunks}${r.missed?.length ? ` (${missedWords(r)})` : ""}`);
  const rest = e.contributed.rows.slice(top);
  if (rest.length) parts.push(`${rest.length} more PR group${rest.length === 1 ? "" : "s"} contributed ${rest.reduce((n, r) => n + r.hunks, 0)}`);
  parts.push(`${e.unexplained.hunks} unexplained`);
  return `${e.total} difference${e.total === 1 ? "" : "s"}: ${parts.join("; ")}.`;
}

/** A forecast judges a build of main (`sha-<short>` on side b); a release candidate carries a version tag. */
const forecastOf = (r: RunReport) => /:sha-[0-9a-f]{7,40}$/.test(r.sides?.b?.reader?.split("@")[0] ?? "");

/**
 * PASS, explained (since 1.42.0): a forecast whose only reason to fail is unclaimed differences, every one of them
 * declared in the CHANGELOG line of the PR that made it, passes. The sentence says so and names the PRs; the release
 * author still pastes the claims from those lines when the release is cut, and a release candidate still needs them.
 * Undefined for anything else: a release candidate, another reason to fail, or one difference nobody declared.
 */
export function declaredPass(run: Pick<RunReport, "verdict" | "reasons" | "sides" | "compare">, e: Explanation): string | undefined {
  if (run.verdict !== "fail" || !forecastOf(run as RunReport)) return undefined;
  if (!(run.reasons ?? []).every((r) => /^\d+ unclaimed diff\(s\)$/.test(r))) return undefined;
  const unclaimed = (run.compare?.unclaimed ?? []).filter((h) => h.severity === "fail").length;
  const declared = e.declared?.hunks ?? 0;
  if (!unclaimed || declared !== unclaimed || e.contributed.hunks || e.unexplained.hunks) return undefined;
  const by = e.declared!.rows.map((r) => `${prWords([r.pr])}: ${r.hunks}`).join(", ");
  return `PASS, explained: ${unclaimed === 1 ? "the 1 difference no claim covers yet is" : `all ${unclaimed} differences no claim covers yet are`} declared in the CHANGELOG line of the PR that made ${unclaimed === 1 ? "it" : "them"} (${by}). Nothing is owed on main; the release author pastes the claims from those lines when the release is cut.`;
}
