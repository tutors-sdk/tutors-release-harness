/**
 * The Release Confidence Score (RCS): how much the evidence behind a gate that did not FAIL is worth, as one number
 * a whole team reads the same way, decomposed into eight dimensions so nobody has to take the number on trust.
 *
 * Visual management, not a gate. Two results, in this order: the Gate (PASS, WARN, FAIL, as src/gate.ts decided it)
 * and then the RCS, which is only computed when the Gate is not FAIL. A FAIL is a FAIL at RCS 99: the score is never
 * an input to the gate and never changes an exit code (the andon comes first and no number talks it back on).
 *
 * Honesty rules:
 *   - every point lost is a deduction that names what it read: a hunk, a claim, a PR, a file or a run, with a link
 *     into that run's report.html where there is one;
 *   - a dimension whose input the harness does not have is "not measured", with the reason, and is left out of the
 *     weighted mean (the remaining weights are renormalised and recorded in `weightsUsed`); it is never scored 100;
 *   - what a measured dimension cannot see yet is listed in its `gaps`, so a 100 says what it did not look at.
 *
 * Pure: the caller reads the files (src/score/read.ts) and passes their contents.
 */
import { isBroad, normalnessOf } from "../ci/scorecard.ts";
import type { Hunk, RunReport } from "../types.ts";
import { DIMENSIONS, FLOOR_CAP, RULES, WEIGHTS_VERSION, bandOf, type Band, type DimensionId } from "./weights.ts";

export const CONFIDENCE_SCHEMA_VERSION = 1 as const;

/** The Gate as `harness release` words it. Only PASS and WARN get an RCS. */
export const GATE_WORDS = ["PASS", "WARN", "FAIL", "FAIL (OVERRIDDEN)", "NOT JUDGED"] as const;
export type GateWord = (typeof GATE_WORDS)[number];

export interface Deduction {
  points: number;
  why: string;
  /** Where the point went: a link into a report.html (`<run>/report.html#hunk-…`), a file, a PR or a run. */
  evidence: string;
  /** True when this finding breaches the dimension's floor (the RCS is then capped at 74). */
  floor?: true;
}

export interface DimensionScore {
  id: DimensionId;
  name: string;
  weight: number;
  status: "measured" | "not measured";
  /** 0-100; null when not measured. */
  score: number | null;
  floorBreached: boolean;
  /** Why it is not measured: which input is missing and how to give it. */
  reason?: string;
  deductions: Deduction[];
  /** Where the evidence for this dimension is: sections of the runs' report.html, or the input files. */
  evidence: string[];
  /** Parts of the "100 means" this dimension could not check with what it was given. */
  gaps?: string[];
}

export interface Confidence {
  schemaVersion: typeof CONFIDENCE_SCHEMA_VERSION;
  gate: GateWord;
  /** 0-100, or null when the Gate is not PASS or WARN, or nothing could be measured. */
  rcs: number | null;
  band: Band | null;
  /** The band's one-line meaning; absent with no band. */
  meaning?: string;
  /** Why there is no RCS, or why it was capped. */
  note?: string;
  /** The weighted mean before the floor cap, two decimals; null when there is no RCS. */
  mean: number | null;
  /** The weights the mean used, renormalised to sum to 100 over the measured dimensions. */
  weightsUsed: Partial<Record<DimensionId, number>>;
  /** Since 1.11.0: which weights, floors, bands and rules scored it (src/score/weights.ts, WEIGHTS_VERSION). */
  weightsVersion?: string;
  dimensions: DimensionScore[];
  /** The reviewer's glance (C3): empty until it is built. */
  glance: never[];
  run: ConfidenceRun;
}

export interface ConfidenceRun {
  candidate?: string;
  baseline?: string;
  /** When the release run ran (its report's ranAt). */
  ranAt?: string;
  /** The reports read, relative to confidence.json. */
  reports: { release?: string; migration?: string; upgrade?: string; postDeploy?: string };
  /** The optional inputs read, as given. */
  inputs?: { testSignal?: string; traceability?: string; changeRisk?: string };
  /** The harness that scored it. */
  harness?: { version: string; contractVersion: string };
}

// ---- the optional inputs ---------------------------------------------------------------------------------

/** `--test-signal <json>`: the monorepo's mutation scores and this week's harness mutants. */
export interface TestSignal {
  /** Mutation score per package; a package with `changed: false` is not counted. */
  packages?: { name: string; mutationScore: number; changed?: boolean; evidence?: string }[];
  harnessMutants?: { caught: number; total: number; evidence?: string };
  evidence?: string;
}

/** `--traceability <json>`: the changelog against the EARS files and the claims. */
export interface Traceability {
  entries: { entry: string; kind?: "feature" | "fix" | "other"; ears?: string | null; claimed?: boolean; evidence?: string }[];
  /** Claims that trace to no changelog entry, one line each. */
  untracedClaims?: string[];
  evidence?: string;
}

/**
 * `--change-risk <json>`: the PRs between the two tags. `harness changes` (C1) writes it as the `changeRisk` block of
 * changes.json, with every deduction already made (its rules are in src/changes/signals.ts); a file with only `prs`
 * (the 1.9.0 shape) is still read, and scored from them by the same rules.
 */
export interface ChangeRisk {
  prs: { number: number; url?: string; reviewed: boolean | null; firstTimeContributor?: boolean; hotspots?: string[] }[];
  /** Every point lost, one per finding, each naming its PR and file (C1). Present, they are the score. */
  deductions?: { points: number; why: string; evidence: string; floor?: true; pr?: number | null; file?: string }[];
  /** What the change signals could not look at (a signal not measured, and why). */
  gaps?: string[];
  /** Orphan changes (a changelog entry with no diff, a diff with no entry): a floor signal for traceability. */
  orphans?: number;
  evidence?: string;
}

/** An input and where it came from: for a run report, its directory relative to confidence.json ("" when the same). */
export interface Located<T> {
  data: T;
  where: string;
}

export interface ScoreInputs {
  gate: GateWord;
  release?: Located<RunReport>;
  migration?: Located<RunReport>;
  upgrade?: Located<RunReport>;
  testSignal?: Located<TestSignal>;
  traceability?: Located<Traceability>;
  changeRisk?: Located<ChangeRisk>;
  postDeploy?: Located<RunReport>;
  run: ConfidenceRun;
}

// ---- helpers ---------------------------------------------------------------------------------------------

/** A link into a run's report.html, relative to confidence.json. */
export const reportLink = (where: string, anchor?: string) => `${where ? `${where.replace(/\/$/, "")}/` : ""}report.html${anchor ? `#${anchor}` : ""}`;
export const hunkAnchor = (h: Pick<Hunk, "id">) => `hunk-${h.id}`;

const failing = (h: Hunk) => h.severity === "fail";
const spec = (id: DimensionId) => DIMENSIONS.find((d) => d.id === id)!;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const DAY = 86_400_000;

function measured(id: DimensionId, deductions: Deduction[], evidence: string[], gaps: string[] = []): DimensionScore {
  const s = spec(id);
  const lost = deductions.reduce((n, d) => n + d.points, 0);
  return { id, name: s.name, weight: s.weight, status: "measured", score: Math.max(0, 100 - lost), floorBreached: deductions.some((d) => d.floor), deductions, evidence, ...(gaps.length ? { gaps } : {}) };
}

function notMeasured(id: DimensionId, reason: string): DimensionScore {
  const s = spec(id);
  return { id, name: s.name, weight: s.weight, status: "not measured", score: null, floorBreached: false, reason, deductions: [], evidence: [] };
}

/**
 * Up to `max` points for a list of findings at `each`, one deduction per finding so each names its own evidence. The
 * findings past the cap cost nothing more, and the last deduction says how many there were and where they are.
 */
function capped(items: { why: string; evidence: string; floor?: boolean }[], each: number, max = 100, rest?: string): Deduction[] {
  const out: Deduction[] = [];
  let left = max;
  for (const it of items) {
    const points = Math.min(each, left);
    if (points <= 0) break;
    left -= points;
    out.push({ points, why: it.why, evidence: it.evidence, ...(it.floor ? { floor: true as const } : {}) });
  }
  const more = items.length - out.length;
  const last = out.at(-1);
  if (more > 0 && last) last.why += ` (and ${more} more like it, not counted again${rest ? `: ${rest}` : ""})`;
  return out;
}

const NO_RELEASE = "no release-mode report.json to read (the release step did not run or wrote no report)";

// ---- the eight dimensions --------------------------------------------------------------------------------

/** Claim coverage, from the release report's claims matcher. */
export function claimCoverage(release: Located<RunReport> | undefined): DimensionScore {
  if (!release) return notMeasured("claim-coverage", NO_RELEASE);
  const { data: r, where } = release;
  const c = r.compare;
  const R = RULES.claims;
  const d: Deduction[] = [];
  d.push(...capped((c.unclaimed ?? []).filter(failing).map((h) => ({ why: `unclaimed: ${h.artefact} ${h.path ?? h.scope}: ${h.summary}`, evidence: reportLink(where, hunkAnchor(h)) })), R.unclaimed, 100, reportLink(where, "differences")));
  // A broad claim, approved or not: every hunk it absorbed is a place nobody said precisely what changed.
  const broad = new Map<string, { claim: string; hunks: Hunk[] }>();
  for (const m of c.matches ?? []) {
    if (!m.claim || !isBroad(m.claim) || !failing(m.hunk)) continue;
    const key = `${m.claim.artefact} ${m.claim.scope}`;
    const g = broad.get(key) ?? { claim: `${key}${m.claim.approvedBy ? ` (approvedBy ${m.claim.approvedBy})` : ""}`, hunks: [] };
    g.hunks.push(m.hunk);
    broad.set(key, g);
  }
  for (const b of c.broadUnapproved ?? []) {
    const key = `${b.artefact} ${b.scope}`;
    if (!broad.has(key)) broad.set(key, { claim: `${key} (no approvedBy)`, hunks: [] });
  }
  d.push(...capped([...broad.values()].map((g) => ({ why: `broad claim ${g.claim} absorbed ${plural(g.hunks.length, "hunk")}`, evidence: g.hunks[0] ? reportLink(where, hunkAnchor(g.hunks[0])) : reportLink(where, "broad-claims"), floor: true })), R.broad));
  const stale = c.staleClaims ?? [];
  d.push(...capped(stale.map((s) => ({ why: `stale claim ${s.artefact} ${s.scope}: matched nothing (${s.reason})`, evidence: reportLink(where, "stale-claims"), floor: stale.length > R.staleFloorAbove })), R.stale));
  const many = (r.claimHygiene?.flagged ?? []).filter((f) => f.flags.includes("covers-many-hunks"));
  d.push(...capped(many.map((f) => ({ why: `claim ${f.claim.artefact} ${f.claim.scope} covers ${f.hunks} hunks at once (not narrow)`, evidence: reportLink(where, "claim-hygiene") })), R.coversMany, R.coversManyMax));
  return measured("claim-coverage", d, [reportLink(where, "differences")]);
}

/** Noise health, from the A/A the release run consulted and the masks that fired. */
export function noiseHealth(release: Located<RunReport> | undefined): DimensionScore {
  if (!release) return notMeasured("noise-health", NO_RELEASE);
  const { data: r, where } = release;
  const R = RULES.noise;
  const n = normalnessOf(r);
  const at = n.state === "unknown" ? reportLink(where) : reportLink(where, "noise");
  const d: Deduction[] = [];
  if (n.state === "unknown") d.push({ points: R.none, why: "no A/A recorded in report.json (none was supplied, or --noise skip): nothing says the stacks are quiet", evidence: at, floor: true });
  else if (n.state === "degraded") d.push({ points: R.degraded, why: `the A/A of ${n.ranAt} is DEGRADED and does not count: ${(n.degraded ?? []).join("; ")}`, evidence: at, floor: true });
  else if (n.state === "noisy") d.push({ points: R.notClean, why: `the A/A of ${n.ranAt} had ${plural(n.hunks ?? 0, "diff")}: differences may be noise`, evidence: at, floor: true });
  if (n.ranAt && n.state !== "unknown") {
    const days = (Date.parse(r.ranAt) - Date.parse(n.ranAt)) / DAY;
    if (days > R.oldDays) d.push({ points: R.old, why: `the A/A of ${n.ranAt} was ${days.toFixed(1)} days old when the release ran (more than ${R.oldDays})`, evidence: at, floor: true });
    else if (days > R.freshDays) d.push({ points: R.aging, why: `the A/A of ${n.ranAt} was ${days.toFixed(1)} days old when the release ran (more than ${R.freshDays})`, evidence: at });
  }
  const silent = Object.entries(r.masksApplied ?? {}).filter(([, count]) => count === 0).map(([id]) => id);
  d.push(...capped(silent.map((id) => ({ why: `mask ${id} fired nothing in this run (a mask that never fires is a mask to delete)`, evidence: reportLink(where, "masks") })), R.silentMask, R.silentMaskMax));
  return measured("noise-health", d, [at, reportLink(where, "masks")], ["masks added this release (needs the diff of normalise/masks.yaml between the two tags: C1)"]);
}

const UNJUDGED = /cannot reach alpha|need \d+ to judge/;
const P_VALUE = /\bp=([0-9.]+(?:e[-+]?\d+)?)/i;

/** Statistical margin, from the timing and load hunks' Mann-Whitney p-values and the k6 failure rate. */
export function statisticalMargin(release: Located<RunReport> | undefined): DimensionScore {
  if (!release) return notMeasured("statistical-margin", NO_RELEASE);
  const { data: r, where } = release;
  const R = RULES.stats;
  const d: Deduction[] = [];
  const timing = (r.compare.hunks ?? []).filter((h) => h.artefact === "timing");
  const unjudged: Hunk[] = [];
  for (const h of timing) {
    if (UNJUDGED.test(h.summary)) {
      unjudged.push(h);
      continue;
    }
    const m = P_VALUE.exec(h.summary);
    if (!m) continue;
    const p = Number(m[1]);
    const scope = h.path ?? h.scope;
    if (p >= R.nearMissLow && p <= R.nearMissHigh) d.push({ points: R.nearMiss, why: `${scope}: p=${m[1]}, within 0.05-0.10 of significance`, evidence: reportLink(where, hunkAnchor(h)), floor: true });
    else if (p > R.nearMissHigh && p <= R.thinHigh) d.push({ points: R.thin, why: `${scope}: p=${m[1]}, not above 0.20`, evidence: reportLink(where, hunkAnchor(h)) });
  }
  d.push(...capped(unjudged.map((h) => ({ why: `${h.path ?? h.scope} moved but could not be judged: ${h.summary}`, evidence: reportLink(where, hunkAnchor(h)) })), R.unjudged, R.unjudgedMax));
  if (!r.load) d.push({ points: R.noLoad, why: "no k6 load ran in the release run (--load): the load failure rate is unknown", evidence: reportLink(where) });
  else {
    const b = r.load.b;
    const bad = b.failed + b.serverErrors;
    if (bad > 0) d.push({ points: R.loadFailures, why: `k6 on the candidate: ${bad} of ${b.requests} request(s) failed or answered 5xx`, evidence: reportLink(where, "load"), floor: true });
  }
  return measured("statistical-margin", d, [reportLink(where, "differences"), ...(r.load ? [reportLink(where, "load")] : [])]);
}

/** Rehearsals, from the migration and upgrade runs. */
export function rehearsals(migration: Located<RunReport> | undefined, upgrade: Located<RunReport> | undefined): DimensionScore {
  const R = RULES.rehearsals;
  const d: Deduction[] = [];
  const evidence: string[] = [];
  const one = (name: "migration" | "upgrade", x: Located<RunReport> | undefined) => {
    if (!x) {
      d.push({ points: R.skipped, why: `the ${name} rehearsal was skipped (no ${name} run)`, evidence: `no ${name} run directory`, floor: true });
      return;
    }
    const at = reportLink(x.where, name);
    evidence.push(at);
    const r = x.data;
    if (r.verdict === "fail") d.push({ points: R.failed, why: `the ${name} rehearsal FAILED: ${r.reasons?.[0] ?? "see its report"}`, evidence: at });
    else if (r.verdict === "warn") d.push({ points: R.warned, why: `the ${name} rehearsal only WARNED: ${r.reasons?.[0] ?? "see its report"}`, evidence: at });
    const u = r.upgrade;
    if (name === "upgrade" && u && u.failed + u.serverErrors > 0) d.push({ points: R.failedRequests, why: `${u.failed + u.serverErrors} of ${u.requests} request(s) failed or answered 5xx during the rollout`, evidence: at });
  };
  one("migration", migration);
  one("upgrade", upgrade);
  return measured("rehearsals", d, evidence);
}

/** Test signal: the monorepo's mutation scores on changed packages and the weekly harness mutants (`--test-signal`). */
export function testSignal(t: Located<TestSignal> | undefined): DimensionScore {
  if (!t) return notMeasured("test-signal", "needs the monorepo's CI and Stryker mutation scores and the weekly harness mutants: pass --test-signal <json>");
  const R = RULES.testSignal;
  const d: Deduction[] = [];
  const gaps: string[] = [];
  const src = t.data.evidence ?? t.where;
  const changed = (t.data.packages ?? []).filter((p) => p.changed !== false);
  for (const p of changed) {
    if (p.mutationScore >= R.target) continue;
    d.push({ points: R.belowTarget, why: `mutation score ${p.mutationScore}% on ${p.name}, below ${R.target}%`, evidence: p.evidence ?? src, ...(p.mutationScore < R.floorBelow ? { floor: true as const } : {}) });
  }
  if (!t.data.packages) gaps.push("mutation scores on the changed packages (none given)");
  const m = t.data.harnessMutants;
  if (!m) gaps.push("the weekly harness mutants (none given)");
  else if (m.caught < m.total) d.push({ points: R.mutantMissed * (m.total - m.caught), why: `${m.total - m.caught} of ${m.total} harness mutants missed this week`, evidence: m.evidence ?? src, floor: true });
  return measured("test-signal", d, [src], gaps);
}

/**
 * Requirements traceability: changelog entries against EARS files and claims (`--traceability`). The orphan changes
 * change risk found (C1) are a floor signal here too: an orphan is a change the claims matcher could not match.
 */
export function traceability(t: Located<Traceability> | undefined, change?: Located<ChangeRisk>): DimensionScore {
  const orphans = change?.data.orphans ?? 0;
  const orphanWhy = `${plural(orphans, "orphan change")} between the tags (a changelog entry with no diff, or a diff with no entry)`;
  if (!t) return notMeasured("traceability", `needs the changelog, the EARS files and the claims side by side: pass --traceability <json>${orphans ? `; ${change!.data.evidence ?? change!.where} already reports ${orphanWhy}, a floor breach once it is measured` : ""}`);
  const R = RULES.traceability;
  const d: Deduction[] = [];
  const src = t.data.evidence ?? t.where;
  if (orphans) d.push({ points: 0, why: `${orphanWhy}; each costs change risk its points`, evidence: change!.data.evidence ?? change!.where, floor: true });
  for (const e of t.data.entries) {
    if (!e.ears) d.push({ points: R.noEars, why: `changelog entry "${e.entry}" has no EARS file`, evidence: e.evidence ?? src, ...(e.kind === "feature" ? { floor: true as const } : {}) });
    if (e.claimed === false) d.push({ points: R.noClaim, why: `changelog entry "${e.entry}" has no claim`, evidence: e.evidence ?? src });
  }
  for (const c of t.data.untracedClaims ?? []) d.push({ points: R.untracedClaim, why: `claim ${c} traces to no changelog entry`, evidence: src });
  return measured("traceability", d, [src]);
}

/**
 * Change risk: the PRs between the two tags (`--change-risk`, or the changes stage of `harness release`). From
 * changes.json the deductions are taken as `harness changes` made them, one per finding on the PR that carries it, and
 * summed (never averaged); its gaps are this dimension's gaps. A file with only `prs` is scored from them by the same
 * rules, as far as they go: reviews and hotspots, with churn, ownership, orphans, tests and dependencies as gaps.
 */
export function changeRisk(t: Located<ChangeRisk> | undefined): DimensionScore {
  if (!t) return notMeasured("change-risk", "needs the PRs between the two tags: run harness changes (or harness release with --monorepo) and pass --change-risk <changes.json>");
  const R = RULES.changeRisk;
  const src = t.data.evidence ?? t.where;
  if (t.data.deductions) {
    const d = t.data.deductions.map((x) => ({ points: x.points, why: x.why, evidence: x.evidence, ...(x.floor ? { floor: true as const } : {}) }));
    return measured("change-risk", d, [src], t.data.gaps ?? []);
  }
  const d: Deduction[] = [];
  const gaps: string[] = ["churn, ownership, orphans, tests and dependencies (a --change-risk with only prs; harness changes measures them)"];
  for (const pr of t.data.prs) {
    const at = pr.url ?? `PR #${pr.number}`;
    if (pr.reviewed === false) d.push({ points: R.unreviewed, why: `PR #${pr.number} was merged with no approving review`, evidence: at, floor: true });
    // The PR and the file, never the person: contributor lines are for trends and glances, not for reviews of people.
    if (pr.hotspots?.length) d.push({ points: pr.firstTimeContributor ? R.hotspotFirstTime : R.hotspot, why: `PR #${pr.number}${pr.firstTimeContributor ? ", a first contribution," : ""} touches hotspot ${pr.hotspots.join(", ")}`, evidence: at });
  }
  const unknown = t.data.prs.filter((pr) => pr.reviewed === null);
  if (unknown.length) gaps.push(`review coverage of ${unknown.map((pr) => `PR #${pr.number}`).join(", ")} (not known)`);
  return measured("change-risk", d, [src], gaps);
}

/** Post-deploy history: the last release's post-deploy run (`--post-deploy`). */
export function postDeploy(t: Located<RunReport> | undefined): DimensionScore {
  if (!t) return notMeasured("post-deploy", "needs the last release's post-deploy record: pass --post-deploy <its run dir or report.json>");
  const R = RULES.postDeploy;
  const r = t.data;
  const at = reportLink(t.where);
  const d: Deduction[] = [];
  if (r.verdict === "fail") d.push({ points: R.failed, why: `the last release's post-deploy check of ${r.ranAt} FAILED: ${r.reasons?.[0] ?? "a rollback issue"}`, evidence: at, floor: true });
  else if (r.verdict === "warn") d.push({ points: R.warned, why: `the last release's post-deploy check of ${r.ranAt} only WARNED: ${r.reasons?.[0] ?? "see its report"}`, evidence: at });
  return measured("post-deploy", d, [at], ["a rollback issue opened after this check ran, within the first 24 h"]);
}

// ---- the score --------------------------------------------------------------------------------------------

/** The Gate worded from run reports, the gate's own rule: any FAIL fails (an override is still a FAIL), else any WARN. */
export function gateOfReports(reports: RunReport[]): GateWord {
  if (reports.some((r) => r.verdict === "fail" && !r.override?.applied)) return "FAIL";
  if (reports.some((r) => r.verdict === "fail")) return "FAIL (OVERRIDDEN)";
  return reports.some((r) => r.verdict === "warn") ? "WARN" : "PASS";
}

/** The weighted mean of the measured dimensions, over their own weights (renormalised), two decimals. */
export function weightedMean(dims: DimensionScore[]): { mean: number | null; weightsUsed: Partial<Record<DimensionId, number>> } {
  const m = dims.filter((d) => d.status === "measured" && d.score !== null);
  const total = m.reduce((s, d) => s + d.weight, 0);
  if (!total) return { mean: null, weightsUsed: {} };
  const round2 = (x: number) => Math.round(x * 100) / 100;
  return { mean: round2(m.reduce((s, d) => s + d.weight * d.score!, 0) / total), weightsUsed: Object.fromEntries(m.map((d) => [d.id, round2((d.weight * 100) / total)])) };
}

export function confidence(i: ScoreInputs): Confidence {
  const dimensions = [claimCoverage(i.release), noiseHealth(i.release), statisticalMargin(i.release), rehearsals(i.migration, i.upgrade), testSignal(i.testSignal), traceability(i.traceability, i.changeRisk), changeRisk(i.changeRisk), postDeploy(i.postDeploy)];
  const { mean, weightsUsed } = weightedMean(dimensions);
  const base = { schemaVersion: CONFIDENCE_SCHEMA_VERSION, gate: i.gate, weightsUsed, weightsVersion: WEIGHTS_VERSION, dimensions, glance: [] as never[], run: i.run };
  if (i.gate !== "PASS" && i.gate !== "WARN") {
    const why = i.gate === "NOT JUDGED" ? "The Gate did not judge, so there is nothing to put a number on." : "The Gate wins: no number talks a FAIL back on. The dimensions are shown for the 5 Whys, not for a decision.";
    return { ...base, rcs: null, band: null, mean: null, note: `No RCS: Gate ${i.gate}. ${why}` };
  }
  if (mean === null) return { ...base, rcs: null, band: null, mean: null, note: "No RCS: no dimension could be measured." };
  // Rounded down: a score never claims more confidence than the evidence gives (84.99 is 84).
  const raw = Math.floor(mean);
  const breached = dimensions.filter((d) => d.floorBreached);
  const rcs = breached.length ? Math.min(raw, FLOOR_CAP) : raw;
  const { band, meaning } = bandOf(rcs);
  const note = breached.length && raw > FLOOR_CAP ? `Capped at ${FLOOR_CAP} from ${raw}: the floor of ${breached.map((d) => d.name).join(", ")} is breached.` : undefined;
  return { ...base, rcs, band, meaning, mean, ...(note ? { note } : {}) };
}
