/**
 * The A3 Aggregator: every kept run of the harness, the kaizen register and what GitHub knows about the value stream,
 * folded into one Lean A3, the single sheet a team reads to see where it stands and why. Background, current condition,
 * goal, root cause analysis, countermeasures, plan and follow-up, with the Gate and the Release Confidence Score on top.
 *
 * Nothing here judges anything. The Gate and the score are read from the kept confidence.json, never recomputed, and
 * the Gate wins as it does everywhere else (docs/lean.md, Jidoka): with a FAIL there is no RCS, and the dimensions are
 * shown for the root cause analysis, not for a decision. Every number names where it came from, and what the inputs
 * cannot show is said to be not measured, never filled in. The 5 Whys are the kaizen register's files, not text
 * written here: the A3 only says which root cause question each one answers.
 *
 * Pure: src/a3/read.ts reads the files, src/a3/github.ts asks GitHub, src/a3/render.ts draws the page.
 */
import { coverageWords } from "../readiness/claims.ts";
import type { Changes } from "../changes/signals.ts";
import { decidingClaims, decisionsOf } from "../claims/decisions.ts";
import { claimLabel } from "../claims/rules.ts";
import { hunkAnchor, type Confidence } from "../score/confidence.ts";
import { DIMENSIONS } from "../score/weights.ts";
import type { Hunk, RunReport } from "../types.ts";
import type { WhyFile } from "../why/format.ts";
import { chainEnd, countermeasureOf } from "../why/format.ts";
import type { RegisterEntry } from "../why/register.ts";
import { runMs, type GithubSnapshot, type WorkflowRun } from "./github.ts";
import { qualityOf, type QualityRecord, type QualityStrip, type WeeklyMutants } from "./quality.ts";

export const A3_SCHEMA_VERSION = 1 as const;
/** The Pareto rule: the causes that together make up this share are the vital few. */
export const VITAL_SHARE = 0.8;
/** At most this many bars; the rest are one "everything else" bar, so the vital few stay visible. */
export const PARETO_BARS = 8;
/** Degraded A/A detection (a journey that fails on both sides) exists from this harness on (PR #22). */
export const DEGRADED_SINCE = "1.4.4";
export const SITE = "https://tutors-sdk.github.io/tutors-release-harness";
export const REPO = "https://github.com/tutors-sdk/tutors-release-harness";

export type Stream = "release-records" | "main-preview" | "noise";
export const STREAMS: readonly Stream[] = ["release-records", "main-preview", "noise"];
export const STREAM_NAMES: Record<Stream, string> = { "release-records": "Release candidate", "main-preview": "Main to RC forecast", noise: "Nightly A/A" };

export interface KeptRun {
  stream: Stream;
  id: string;
  ranAt: string;
  verdict: string;
  reasons: string[];
  harnessVersion: string;
  runUrl?: string;
  sides?: { a?: Record<string, string>; b?: Record<string, string> };
  /** The run's directory, relative to the site root. */
  dir: string;
  score?: { score: number; grade: string } | null;
  report?: RunReport;
  confidence?: Confidence;
  changes?: Changes;
  /** Since 1.18.0: the monorepo's quality record kept beside the run (quality.json); null when kept and not a record. */
  quality?: QualityRecord | null;
}

export interface NoiseNight {
  ranAt: string;
  hunks: number;
  degraded: string[];
  harnessVersion: string;
  masks?: { total: number; silent: number };
}

export interface KaizenFile {
  file: string;
  why: WhyFile;
  entry: RegisterEntry;
}

export interface A3Inputs {
  now: Date;
  harness: string;
  runs: KeptRun[];
  noise?: NoiseNight[];
  kaizen: KaizenFile[];
  github?: GithubSnapshot;
  /** Releases on the scoreboard (the `scoreboard` branch); undefined when there is none yet. */
  scoreboardReleases?: number;
  /** Since 1.18.0: the harness's weekly mutants self-tests (mutants.jsonl); undefined when not read. */
  mutants?: WeeklyMutants[];
}

export interface Link {
  label: string;
  href?: string;
}

export interface ParetoBar {
  label: string;
  value: number;
  /** Cumulative share up to and including this bar, 0-1. */
  cumulative: number;
  vital: boolean;
  note?: string;
  /** Drawn hatched: a value that is a ceiling, not a measurement (a dimension not measured). */
  unknown?: boolean;
}

export interface Pareto {
  id: string;
  title: string;
  unit: string;
  total: number;
  bars: ParetoBar[];
  /** How many bars make up the vital few, and their share. */
  vitalFew: number;
  vitalShare: number;
  caption: string;
  source: Link[];
}

export interface Stage {
  id: string;
  name: string;
  /** Who or what runs it. */
  where: string;
  /** Median process time in ms over `n` runs; null when not measured. */
  processMs: number | null;
  n: number;
  /** Share of runs that ended green, when the stage is a workflow. */
  firstPass?: { green: number; runs: number };
  /** A standing condition worth a mark on the map (an andon). */
  andon?: string;
  note: string;
}

export interface Wait {
  /** Between which stages: the index of the stage it ends at. */
  before: number;
  ms: number | null;
  label: string;
}

export interface Inventory {
  before: number;
  count: number;
  label: string;
}

export interface ValueStream {
  stages: Stage[];
  waits: Wait[];
  inventory: Inventory[];
  /** From the oldest change not yet in production to now; null when GitHub could not say. */
  leadMs: number | null;
  processMs: number;
  /** processMs / leadMs, 0-1; null without a lead time. */
  flowEfficiency: number | null;
  notMeasured: string[];
}

export interface Rca {
  id: string;
  question: string;
  answer: string;
  evidence: Link[];
  /** Where the chain of whys goes: a 5 Whys in the register, or where the evidence stops and why. */
  depth: { kind: "5 whys"; file: string; title: string } | { kind: "evidence stops"; why: string };
  pareto?: string;
}

export interface FiveWhys {
  file: string;
  title: string;
  trigger: string;
  release: string;
  whys: { n: number; question: string; answer: string }[];
  chainEndsAt: number | null;
  endsIn: string;
  kind: string | null;
  countermeasure: string;
  owner: string;
  due: string;
  verifiedBy: string;
  status: "open" | "overdue" | "closed";
  answers: string[];
}

export interface GoalRow {
  metric: string;
  now: string;
  target: string;
  met: boolean;
  source: string;
}

export interface Score {
  subject: string;
  candidate?: string;
  baseline?: string;
  ranAt?: string;
  report?: string;
  runUrl?: string;
  gate: string;
  rcs: number | null;
  band: string | null;
  note: string;
  dimensions: { id: string; name: string; weight: number; score: number | null; status: string; lost: number | null; reason?: string }[];
  scorecard?: { score: number; grade: string };
  glance: number;
  lastRelease?: { candidate: string; baseline: string; verdict: string; ranAt: string; report?: string };
  aa?: { verdict: string; ranAt: string; report?: string };
  postDeploy?: { red: number; runs: number; since: string; lastConclusion: string | null; issue?: { number: number; url: string; openedAt: string } };
  openCountermeasures: number;
}

/**
 * Fixes on b, read as decisions (src/claims/decisions.ts): orange beside the traffic lights, never on them. A claim
 * decides a fix and says why; the share decided is the switch the glance reads.
 */
export interface Decisions {
  /** Fixes on b (info hunks), and on how many pages. */
  fixes: number;
  pages: number;
  /** Fixes a claim decides. */
  decided: number;
  /** The same, by artefact: accessibility (axe) and console errors are separate decisions. */
  byArtefact: { artefact: string; fixes: number; decided: number }[];
  rows: { artefact: string; scope: string; what: string[]; hunk: string; state: "decided" | "undecided" | "fixed, or only changed?"; why?: string; rule?: string }[];
}

export interface A3 {
  schemaVersion: typeof A3_SCHEMA_VERSION;
  builtAt: string;
  harness: string;
  title: string;
  score: Score | null;
  background: string[];
  current: { facts: string[]; paretos: Pareto[]; valueStream: ValueStream };
  goal: GoalRow[];
  rca: Rca[];
  fiveWhys: FiveWhys[];
  /** Since 1.15.0; absent when the subject run kept no report. */
  decisions?: Decisions;
  /** Since 1.18.0: Speed, Metrics and Tests under the Gate (src/a3/quality.ts); absent without a subject run. */
  quality?: QualityStrip;
  countermeasures: { kind: string; what: string; owner: string; due: string; status: FiveWhys["status"]; from: string; rca: string[] }[];
  plan: { what: string; who: string; when: string; status: string }[];
  followUp: { check: string; state: string; met: boolean }[];
  sources: { runs: number; streams: Partial<Record<Stream, number>>; first: string | null; last: string | null; github: string; kaizen: number };
}

// ---- small helpers ---------------------------------------------------------------------------------------

const pct = (x: number) => `${Math.round(x * 100)}%`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const tagOf = (ref?: string) => (ref ? ref.slice(ref.lastIndexOf(":") + 1) : "");
const newest = (runs: KeptRun[]) => [...runs].sort((x, y) => Date.parse(y.ranAt) - Date.parse(x.ranAt));
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2);
};
const cmpVersion = (a: string, b: string) => {
  const x = a.split(/[.-]/).map(Number);
  const y = b.split(/[.-]/).map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};

/** A duration the way a person says it: 42s, 11m, 3.5h, 9.2d. */
export function duration(ms: number | null): string {
  if (ms === null) return "not measured";
  const s = ms / 1000;
  if (s < 90) return `${Math.round(s)}s`;
  const m = s / 60;
  if (m < 90) return `${Math.round(m)}m`;
  const h = m / 60;
  if (h < 36) return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`;
  const d = h / 24;
  return `${d < 10 ? d.toFixed(1) : Math.round(d)}d`;
}

/** Rank counts into a Pareto: largest first, the vital few marked, the long tail folded into one bar. */
export function pareto(o: { id: string; title: string; unit: string; counts: Map<string, { value: number; note?: string; unknown?: boolean }>; caption: (p: Omit<Pareto, "caption">) => string; source: Link[] }): Pareto {
  const sorted = [...o.counts].map(([label, v]) => ({ label, ...v })).filter((b) => b.value > 0).sort((x, y) => y.value - x.value || x.label.localeCompare(y.label));
  let rows = sorted;
  if (sorted.length > PARETO_BARS) {
    const tail = sorted.slice(PARETO_BARS - 1);
    rows = [...sorted.slice(0, PARETO_BARS - 1), { label: `everything else (${tail.length} causes)`, value: tail.reduce((s, b) => s + b.value, 0), note: tail.slice(0, 4).map((b) => `${b.label} ${b.value}`).join(", ") + (tail.length > 4 ? ", …" : "") }];
  }
  const total = rows.reduce((s, b) => s + b.value, 0);
  let run = 0;
  let vitalFew = 0;
  const bars: ParetoBar[] = rows.map((b) => {
    const before = run;
    run += b.value;
    // A bar is vital while the share before it is still short of the rule: the bar that crosses 80% is one of the few.
    const vital = total > 0 && before / total < VITAL_SHARE;
    if (vital) vitalFew++;
    return { label: b.label, value: b.value, cumulative: total ? run / total : 0, vital, ...(b.note ? { note: b.note } : {}), ...(b.unknown ? { unknown: true } : {}) };
  });
  const vitalShare = vitalFew ? bars[vitalFew - 1]!.cumulative : 0;
  const base = { id: o.id, title: o.title, unit: o.unit, total, bars, vitalFew, vitalShare, source: o.source };
  return { ...base, caption: o.caption(base) };
}

// ---- causes ----------------------------------------------------------------------------------------------

/** Image artefacts name `<app>/<thing>`: the thing is what changed, the app is only where. */
const IMAGE_ARTEFACTS = new Set(["sbom", "vulns", "image-manifest", "runtime", "startup"]);

/** What kind of change a hunk is, without the page, the package or the numbers: "sbom: package removed". */
export function causeOf(h: Pick<Hunk, "artefact" | "scope" | "summary">): string {
  let rest = h.summary;
  if (rest.startsWith(`${h.scope}: `)) rest = rest.slice(h.scope.length + 2);
  else {
    const first = rest.indexOf(": ");
    if (first > 0 && !/\s/.test(rest.slice(0, first))) rest = rest.slice(first + 2);
  }
  const kind = rest.split(/: | \(/)[0]!.replace(/\d+(\.\d+)?/g, "N").replace(/\s+/g, " ").trim();
  return `${h.artefact}: ${kind.length > 48 ? `${kind.slice(0, 47)}…` : kind || "differs"}`;
}

/** What a hunk is about, the same in every image: `npm` for `reader/npm`, the page key otherwise. */
export const subjectOf = (h: Pick<Hunk, "artefact" | "scope">) => (IMAGE_ARTEFACTS.has(h.artefact) && h.scope.includes("/") ? h.scope.slice(h.scope.indexOf("/") + 1) : h.scope);

/** Why a kept run did not pass, one cause per reason it gives. */
export function stopCauses(run: Pick<KeptRun, "verdict" | "reasons">): string[] {
  if (run.verdict === "pass") return [];
  const out = new Set<string>();
  for (const r of run.reasons) {
    if (/^advisory only/.test(r)) continue;
    if (/unclaimed diff/.test(r)) out.add("unclaimed differences");
    else if (/DEGRADED|failed on both sides|degraded/.test(r)) out.add("A/A degraded: a journey saw nothing");
    else if (/A\/A produced \d+ diff/.test(r)) out.add("A/A noise: the normaliser needs a mask");
    else if (/built here from monorepo ref|NOT COLLECTED/.test(r)) out.add("an image not pulled from the registry");
    else if (/claim\(s\) matched nothing/.test(r)) out.add("stale claims");
    else out.add(r.length > 60 ? `${r.slice(0, 59)}…` : r);
  }
  return [...out];
}

/** Why a post-deploy run went red, from the step it stopped at. */
export function postDeployCause(step: string | null): string {
  if (step === null) return "the workflow could not start";
  if (/recorded release run|recording/i.test(step)) return "no recorded release to compare with";
  if (/post-deploy mode/i.test(step)) return "production differs from the recorded release";
  return `stopped at "${step}"`;
}

// ---- the A3 ----------------------------------------------------------------------------------------------

/** The run the A3 is about: the newest scored Main to RC forecast, else the newest release candidate, else any run. */
export function subjectRun(runs: KeptRun[]): KeptRun | undefined {
  const judged = newest(runs.filter((r) => r.stream !== "noise"));
  return judged.find((r) => r.stream === "main-preview" && r.confidence) ?? judged.find((r) => r.confidence) ?? judged.find((r) => r.report) ?? judged[0];
}

function scoreOf(i: A3Inputs, subject: KeptRun | undefined, postDeploy: Score["postDeploy"]): Score | null {
  if (!subject) return null;
  const c = subject.confidence;
  const lastRelease = newest(i.runs.filter((r) => r.stream === "release-records"))[0];
  const aa = newest(i.runs.filter((r) => r.stream === "noise"))[0];
  const open = i.kaizen.filter((k) => k.entry.open).length;
  const dims = (c?.dimensions ?? []).map((d) => ({ id: d.id, name: d.name, weight: d.weight, score: d.score, status: d.status, lost: d.score === null ? null : Math.round((d.weight * (100 - d.score)) / 10) / 10, ...(d.reason ? { reason: d.reason } : {}) }));
  const file = (name: string) => `${subject.dir}/${name}`;
  return {
    subject: STREAM_NAMES[subject.stream],
    candidate: c?.run.candidate ?? tagOf(subject.sides?.b?.reader),
    baseline: c?.run.baseline ?? tagOf(subject.sides?.a?.reader),
    ranAt: subject.ranAt,
    report: file("report.html"),
    ...(subject.runUrl ? { runUrl: subject.runUrl } : {}),
    gate: c?.gate ?? subject.verdict.toUpperCase(),
    rcs: c?.rcs ?? null,
    band: c?.band ?? null,
    note: c ? (c.rcs !== null ? `${c.band}: ${c.meaning ?? ""}${c.note ? ` ${c.note}` : ""}` : (c.note ?? "No RCS.")) : `Judged by harness ${subject.harnessVersion} before the confidence score existed: no RCS.`,
    dimensions: dims,
    ...(subject.score ? { scorecard: { score: subject.score.score, grade: subject.score.grade } } : {}),
    glance: c?.glance?.length ?? 0,
    ...(lastRelease ? { lastRelease: { candidate: tagOf(lastRelease.sides?.b?.reader), baseline: tagOf(lastRelease.sides?.a?.reader), verdict: lastRelease.verdict.toUpperCase(), ranAt: lastRelease.ranAt, report: `${lastRelease.dir}/report.html` } } : {}),
    ...(aa ? { aa: { verdict: aa.verdict.toUpperCase(), ranAt: aa.ranAt, report: `${aa.dir}/report.html` } } : {}),
    ...(postDeploy ? { postDeploy } : {}),
    openCountermeasures: open
  };
}

function postDeployState(g: GithubSnapshot | undefined): Score["postDeploy"] | undefined {
  const runs = g?.workflows["post-deploy.yml"];
  if (!runs?.length) return undefined;
  const done = runs.filter((r) => r.conclusion !== null);
  let red = 0;
  for (const r of done) {
    if (r.conclusion !== "failure") break;
    red++;
  }
  const issue = g?.rollbackIssues?.[0];
  return { red, runs: done.length, since: done.at(-1)?.createdAt ?? "", lastConclusion: done[0]?.conclusion ?? null, ...(issue ? { issue: { number: issue.number, url: issue.url, openedAt: issue.createdAt } } : {}) };
}

function unclaimedPareto(subject: KeptRun | undefined): Pareto | undefined {
  const r = subject?.report;
  if (!r) return undefined;
  const counts = new Map<string, { value: number; subjects: Set<string>; apps: Set<string> }>();
  for (const h of r.compare.unclaimed) {
    const k = causeOf(h);
    const c = counts.get(k) ?? { value: 0, subjects: new Set<string>(), apps: new Set<string>() };
    c.value++;
    c.subjects.add(subjectOf(h));
    if (IMAGE_ARTEFACTS.has(h.artefact) && h.scope.includes("/")) c.apps.add(h.scope.split("/")[0]!);
    counts.set(k, c);
  }
  const noted = new Map([...counts].map(([k, c]) => [k, { value: c.value, ...(c.apps.size > 1 && c.subjects.size < c.value ? { note: `${c.subjects.size} distinct, once in each of ${c.apps.size} images` } : c.subjects.size < c.value ? { note: `${plural(c.subjects.size, "place")}` } : {}) }]));
  return pareto({
    id: "unclaimed",
    title: "Unclaimed differences, by cause",
    unit: "differences",
    counts: noted,
    source: [{ label: `${STREAM_NAMES[subject!.stream]} ${tagOf(subject!.sides?.b?.reader)}: report.json`, href: `${subject!.dir}/report.html` }],
    caption: (p) => (p.total ? `${plural(p.vitalFew, "cause")} of ${counts.size} carry ${pct(p.vitalShare)} of the ${p.total} unclaimed differences. ${p.bars[0]!.label} alone is ${pct(p.bars[0]!.value / p.total)}${p.bars[0]!.note ? ` (${p.bars[0]!.note})` : ""}.` : "Nothing unclaimed.")
  });
}

function lineStopPareto(i: A3Inputs): Pareto {
  const counts = new Map<string, { value: number }>();
  const add = (k: string) => counts.set(k, { value: (counts.get(k)?.value ?? 0) + 1 });
  for (const r of i.runs) for (const c of stopCauses(r)) add(`${STREAM_NAMES[r.stream]}: ${c}`);
  for (const s of i.github?.postDeploySteps ?? []) add(`Post-deploy: ${postDeployCause(s.step)}`);
  const source: Link[] = [{ label: `${i.runs.length} kept runs (index.json of each stream)` }];
  if (i.github?.postDeploySteps) source.push({ label: `${i.github.postDeploySteps.length} failed post-deploy runs (GitHub Actions)`, href: `${REPO}/actions/workflows/post-deploy.yml` });
  return pareto({
    id: "line-stops",
    title: "Why the line stops, every red run",
    unit: "stops",
    counts,
    source,
    caption: (p) => (p.total ? `${p.total} stops over the kept runs and the post-deploy history. ${plural(p.vitalFew, "cause")} carry ${pct(p.vitalShare)}: ${p.bars.slice(0, p.vitalFew).map((b) => b.label).join("; ")}.` : "No red run kept.")
  });
}

function confidencePareto(subject: KeptRun | undefined): Pareto | undefined {
  const c = subject?.confidence;
  if (!c) return undefined;
  const counts = new Map<string, { value: number; note?: string; unknown?: boolean }>();
  for (const d of c.dimensions) {
    if (d.status === "not measured" || d.score === null) counts.set(`${d.name} (not measured)`, { value: d.weight, unknown: true, note: `up to ${d.weight}: ${d.reason ?? "no input"}` });
    else if (d.score < 100) counts.set(d.name, { value: Math.round((d.weight * (100 - d.score)) / 10) / 10, ...(d.deductions[0] ? { note: `${plural(d.deductions.length, "deduction")}, e.g. ${d.deductions[0].why}` } : {}) });
  }
  const measuredLost = [...counts].filter(([, v]) => !v.unknown).reduce((s, [, v]) => s + v.value, 0);
  return pareto({
    id: "confidence",
    title: "Where confidence is lost, points of 100",
    unit: "points",
    counts,
    source: [{ label: "confidence.json", href: `${subject!.dir}/confidence.json` }],
    caption: (p) => `${Math.round(measuredLost)} points lost on the dimensions measured${[...counts.values()].some((v) => v.unknown) ? `, and ${[...counts].filter(([, v]) => v.unknown).reduce((s, [, v]) => s + v.value, 0)} more are not measured on this run (hatched: a ceiling, never scored)` : ""}. The vital few: ${p.bars.slice(0, p.vitalFew).map((b) => b.label).join(", ")}.`
  });
}

function changeRiskPareto(subject: KeptRun | undefined): Pareto | undefined {
  const ch = subject?.changes;
  if (!ch || !Array.isArray(ch.prs)) return undefined;
  const RULE_NAMES: Record<string, string> = { review: "merged with no approving review", tests: "production lines with too few test lines", churn: "churn above the app's median", hotspot: "a hotspot file touched", ownership: "a file with many authors", orphan: "a diff and its changelog entry disagree" };
  const tally = new Map<string, { value: number; points: number }>();
  for (const p of ch.prs)
    for (const d of p.deductions) {
      const k = RULE_NAMES[d.rule] ?? d.rule;
      const c = tally.get(k) ?? { value: 0, points: 0 };
      tally.set(k, { value: c.value + 1, points: c.points + d.points });
    }
  const withNotes = new Map([...tally].map(([k, v]) => [k, { value: v.value, note: `${v.points} points${v.points === 0 ? " (a floor: caps the RCS at 74)" : ""}` }]));
  const prs = ch.prs.length;
  return pareto({
    id: "change-risk",
    title: "Change risk findings, by rule",
    unit: "findings",
    counts: withNotes,
    source: [{ label: `changes.json (${ch.refs?.a}..${String(ch.refs?.b ?? "").slice(0, 7)})`, href: `${subject!.dir}/changes.json` }],
    caption: (p) => (p.total ? `${p.total} findings over ${prs} PRs; ${p.bars[0]!.label}: ${p.bars[0]!.value} of ${prs}.` : `No findings over ${prs} PRs.`)
  });
}

function valueStream(i: A3Inputs, subject: KeptRun | undefined): ValueStream {
  const g = i.github;
  const notMeasured: string[] = [];
  const wf = (file: string) => g?.workflows[file];
  const proc = (runs: WorkflowRun[] | undefined) => {
    const done = (runs ?? []).filter((r) => r.conclusion === "success" || r.conclusion === "failure");
    const green = done.filter((r) => r.conclusion === "success");
    const ms = (green.length ? green : done).map(runMs).filter((x): x is number => x !== undefined);
    return { processMs: median(ms), n: ms.length, ...(done.length ? { firstPass: { green: green.length, runs: done.length } } : {}) };
  };
  const prod = subject?.report?.provenance?.a?.images?.reader;
  const cand = subject?.report?.provenance?.b?.images?.reader;
  const pd = postDeployState(g);
  const dispatched = (wf("post-deploy.yml") ?? []).filter((r) => r.event === "repository_dispatch").length;
  const stages: Stage[] = [
    { id: "merge", name: "Merge to main", where: "monorepo pull requests", processMs: null, n: 0, note: "review and merge: people's time, not measured here" },
    { id: "build", name: "Build and sign images", where: "monorepo image-build.yml", ...proc(g?.imageBuild), note: "four images to Quay, signed with cosign, SBOM attested" },
    { id: "aa", name: "Nightly A/A", where: "nightly-noise.yml", ...proc(wf("nightly-noise.yml")), note: "production against itself: the noise floor" },
    { id: "forecast", name: "Main to RC forecast", where: "main-preview.yml", ...proc(wf("main-preview.yml")), note: "main judged as if it were a candidate" },
    { id: "gate", name: "Release gate (Jidoka)", where: "release.yml", ...proc(wf("release.yml")), note: "stops the line on any unclaimed difference" },
    { id: "deploy", name: "Promote and deploy", where: "monorepo deploy.yml, and today Netlify", processMs: null, n: 0, note: dispatched ? `${dispatched} deploy(s) announced to the harness` : "no deploy has ever been announced to the harness", ...(dispatched ? {} : { andon: "not the gated build" }) },
    { id: "verify", name: "Post-deploy verify", where: "post-deploy.yml", ...proc(wf("post-deploy.yml")), note: "production against the recorded release", ...(pd && pd.red ? { andon: `red × ${pd.red}` } : {}) }
  ];
  if (!g) notMeasured.push("process times and first-pass yield: the pages were built without --fetch-github");
  if (g && !g.imageBuild) notMeasured.push("image build time: GitHub did not answer for the monorepo's image-build.yml");

  const waits: Wait[] = [];
  const inventory: Inventory[] = [];
  const at = (x?: string | null) => (x ? Date.parse(x) : NaN);
  const c = g?.commits;
  const headDate = at(c?.headDate);
  // When the images were ready: the image build of the forecast's commit, else the image's own created label (which a
  // reproducible build may pin to the commit time, so it is only the fallback).
  const rev = cand?.revision ?? "";
  const build = rev ? (g?.imageBuild ?? []).filter((r) => r.conclusion === "success" && r.headSha === rev).sort((x, y) => Date.parse(x.updatedAt) - Date.parse(y.updatedAt))[0] : undefined;
  const ready = build ? at(build.updatedAt) : at(cand?.created);
  const gap = (from: number, to: number) => (Number.isFinite(to - from) && to >= from ? to - from : null);
  waits.push({ before: 1, ms: build ? gap(headDate, at(build.startedAt)) : null, label: "merge to image build" });
  waits.push({ before: 3, ms: gap(ready, at(subject?.ranAt)), label: "images ready to forecast" });
  const lastGate = newest(i.runs.filter((r) => r.stream === "release-records"))[0];
  waits.push({ before: 4, ms: lastGate ? i.now.getTime() - Date.parse(lastGate.ranAt) : null, label: lastGate ? "since the last release gate" : "no release gate kept" });
  const prodCreated = at(prod?.created);
  waits.push({ before: 5, ms: Number.isFinite(prodCreated) ? i.now.getTime() - prodCreated : null, label: `production ${tagOf(subject?.sides?.a?.reader) || "?"} unchanged` });

  const prs = subject?.changes?.prs?.length;
  if (prs !== undefined) inventory.push({ before: 0, count: prs, label: `PRs merged since ${subject?.changes?.refs?.a ?? "production"}, not in production` });
  const unclaimed = subject?.report?.compare.unclaimed.length;
  if (unclaimed !== undefined) inventory.push({ before: 4, count: unclaimed, label: "unclaimed differences the next release owes" });
  const open = i.kaizen.filter((k) => k.entry.open).length;
  inventory.push({ before: 6, count: open, label: "open countermeasures" });

  // Lead time: from the oldest merge to main (a first-parent commit changes.json names) not yet in production.
  const merged = new Set((subject?.changes?.prs ?? []).map((p) => p.sha));
  const mergeDates = (c?.commits ?? []).filter((x) => merged.has(x.sha)).map((x) => Date.parse(x.date)).filter(Number.isFinite);
  const oldest = mergeDates.length ? Math.min(...mergeDates) : NaN;
  const leadMs = Number.isFinite(oldest) ? i.now.getTime() - oldest : null;
  if (leadMs === null) notMeasured.push("lead time: needs the monorepo's merge dates between production and the forecast (GitHub compare, matched to changes.json)");
  const processMs = stages.reduce((s, st) => s + (st.id === "verify" || st.id === "aa" ? 0 : (st.processMs ?? 0)), 0);
  return { stages, waits, inventory, leadMs, processMs, flowEfficiency: leadMs ? processMs / leadMs : null, notMeasured };
}

function fiveWhysOf(k: KaizenFile, now: Date): FiveWhys {
  const cm = countermeasureOf(k.why);
  const end = chainEnd(k.why.fields["Chain ends at"]) ?? null;
  const today = now.toISOString().slice(0, 10);
  return {
    file: k.file,
    title: k.entry.title,
    trigger: k.entry.trigger,
    release: k.entry.release,
    whys: k.why.whys.filter((w) => w.answer && (end === null || w.n <= end)).map((w) => ({ n: w.n, question: w.question, answer: w.answer })),
    chainEndsAt: end,
    endsIn: (k.why.fields["Ends in"] ?? "").trim(),
    kind: cm.kind,
    countermeasure: cm.what,
    owner: cm.owner,
    due: cm.due,
    verifiedBy: cm.verifiedBy,
    status: cm.verifiedBy ? "closed" : cm.due && cm.due < today ? "overdue" : "open",
    answers: k.why.whys.filter((w) => w.answer).map((w) => w.answer)
  };
}

/** Which 5 Whys answers a root cause question: by trigger, then by finding. */
const whyFor = (whys: FiveWhys[], k: KaizenFile[], test: (trigger: string, finding: string) => boolean) => {
  const i = k.findIndex((x) => test(x.entry.trigger, (x.why.fields.Finding ?? "").replace(/`/g, "")));
  return i >= 0 ? whys[i] : undefined;
};

export function decisionsFor(subject: KeptRun | undefined): Decisions | undefined {
  const r = subject?.report;
  if (!r) return undefined;
  // Accessibility first: it is the decision a reader of the sheet is most often asked to make.
  const ds = decisionsOf(r.compare).sort((x, y) => Number(y.artefact === "axe") - Number(x.artefact === "axe"));
  const rows = ds.map((d) => ({
    artefact: d.artefact,
    scope: d.scope,
    what: d.what,
    hunk: `${subject!.dir}/report.html#${hunkAnchor(d.hunks[0]!)}`,
    state: d.fresh ? ("fixed, or only changed?" as const) : d.claim ? ("decided" as const) : ("undecided" as const),
    ...(d.claim ? { why: claimLabel(d.claim) } : {}),
    ...(d.claim?.rule ? { rule: d.claim.rule } : {})
  }));
  const count = (xs: typeof ds) => ({ fixes: xs.reduce((n, d) => n + d.hunks.length, 0), decided: xs.filter((d) => d.claim).reduce((n, d) => n + d.hunks.length, 0) });
  const byArtefact = [...new Set(ds.map((d) => d.artefact))].map((artefact) => ({ artefact, ...count(ds.filter((d) => d.artefact === artefact)) }));
  return { ...count(ds), pages: ds.length, byArtefact, rows };
}

function rcaOf(i: A3Inputs, subject: KeptRun | undefined, paretos: Map<string, Pareto>, vs: ValueStream, whys: FiveWhys[]): Rca[] {
  const out: Rca[] = [];
  const depth = (w: FiveWhys | undefined, stops: string): Rca["depth"] => (w ? { kind: "5 whys", file: w.file, title: w.title } : { kind: "evidence stops", why: stops });
  const r = subject?.report;
  const cand = tagOf(subject?.sides?.b?.reader);
  const u = paretos.get("unclaimed");
  if (r && u) {
    const w = whyFor(whys, i.kaizen, (t, f) => t === "Gate FAIL" || f === "gate");
    out.push({
      id: "gate",
      question: `Why does main (${cand}) stop the line?`,
      answer: u.total ? `${u.total} unclaimed differences. ${u.caption}` : "It does not: every difference is claimed.",
      evidence: [{ label: "report.html", href: `${subject!.dir}/report.html` }, ...(subject!.runUrl ? [{ label: "the run", href: subject!.runUrl }] : [])],
      depth: depth(w, "no 5 Whys in the register answers this yet: open one with harness why --finding gate"),
      pareto: "unclaimed"
    });
  }
  const pd = postDeployState(i.github);
  if (pd) {
    const steps = i.github?.postDeploySteps ?? [];
    const by = new Map<string, number>();
    for (const s of steps) by.set(postDeployCause(s.step), (by.get(postDeployCause(s.step)) ?? 0) + 1);
    const w = whyFor(whys, i.kaizen, (t) => t === "rollback");
    out.push({
      id: "post-deploy",
      question: "Why is post-deploy red?",
      answer: pd.red
        ? `The last ${plural(pd.red, "run")} of post-deploy ${pd.red === 1 ? "is" : "are"} red${pd.red === pd.runs ? ", every run it has made" : ""}${pd.since ? ` since ${pd.since.slice(0, 10)}` : ""}: ${[...by].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`).join(", ")}.${pd.issue ? ` Rollback issue #${pd.issue.number} has been open since ${pd.issue.openedAt.slice(0, 10)}.` : ""}`
        : `Post-deploy is green on its latest run (${pd.runs} runs read).`,
      evidence: [{ label: "post-deploy runs", href: `${REPO}/actions/workflows/post-deploy.yml` }, ...(pd.issue ? [{ label: `issue #${pd.issue.number}`, href: pd.issue.url }] : [])],
      depth: depth(w, pd.red ? "no 5 Whys in the register answers this yet: the rollback issue carries the stub" : "nothing to ask: green")
    });
  }
  if (r) {
    const ds = decisionsOf(r.compare);
    const deciding = decidingClaims(ds);
    const fixes = ds.reduce((n, d) => n + d.hunks.length, 0);
    const w = whyFor(whys, i.kaizen, (_t, f) => f.startsWith("fixed-on-b"));
    if (fixes) {
      const decided = ds.filter((d) => d.claim);
      const open = ds.filter((d) => !d.claim);
      out.push({
        id: "decisions",
        question: "Which differences were decisions, not failures, and why were they made?",
        answer: `${plural(fixes, "fix", "fixes")} on b across ${plural(ds.length, "page")} (${[...new Set(ds.map((d) => d.artefact))].join(", ")}). A fix never gates: it is a decision, and a claim is where its why is written. ${decided.length ? `Decided: ${decided.map((d) => `${d.scope} (${d.what.join(", ")}) by ${d.claim!.rule ? `Rule ${d.claim!.rule}` : "a changelog entry"}`).join("; ")}.` : "None is decided yet."}${open.length ? ` Undecided: ${open.map((d) => `${d.scope} (${d.what.join(", ")})`).join("; ")}; a claim records the why and switches the glance item off.` : " Every one is decided, so the glance asks about none of them."}`,
        evidence: [{ label: "report.html, differences", href: `${subject!.dir}/report.html#differences` }, { label: "src/claims/decisions.ts", href: `${REPO}/blob/main/src/claims/decisions.ts` }],
        depth: depth(w, "no 5 Whys in the register answers this yet")
      });
    }
    // A claim the report calls stale but that decides a fix (a report written before 1.15.0) is not stale.
    const stale = (r.compare.staleClaims ?? []).filter((c) => !deciding.has(c));
    if (stale.length) {
      out.push({
        id: "stale-claims",
        question: "Why do claims match nothing?",
        answer: `${plural(stale.length, "claim")} matched nothing in this run: each is a claim to remove or a difference that did not happen (${stale.map((c) => `${c.artefact} ${c.scope}`).join("; ")}).`,
        evidence: [{ label: "report.html, stale claims", href: `${subject!.dir}/report.html#stale-claims` }],
        depth: { kind: "evidence stops", why: "the report names each claim; whether it is early or wrong is the author's to say" }
      });
    }
  }
  const cp = paretos.get("confidence");
  if (cp && subject?.confidence) {
    const nm = subject.confidence.dimensions.filter((d) => d.status === "not measured");
    out.push({
      id: "confidence",
      question: "Where is confidence lost?",
      answer: `${cp.caption}${subject.confidence.gate.startsWith("FAIL") ? " The Gate is FAIL, so none of this is a score: it is where the next release has to earn its points." : ""}`,
      evidence: [{ label: "confidence.json", href: `${subject.dir}/confidence.json` }, { label: "docs/lean.md, visual management", href: `${REPO}/blob/main/docs/lean.md#visual-management-one-number-broken-down` }],
      depth: { kind: "evidence stops", why: nm.length ? `${plural(nm.length, "dimension")} not measured on this run: ${nm.map((d) => `${d.name} (${d.reason ?? "no input"})`).join("; ")}` : "every dimension is measured: each deduction names its evidence in confidence.json" },
      pareto: "confidence"
    });
  }
  const crp = paretos.get("change-risk");
  if (crp && subject?.changes) {
    const prs = subject.changes.prs.length;
    const unreviewed = subject.changes.prs.filter((p) => p.reviewed === false).length;
    out.push({
      id: "change-risk",
      question: `Why is change risk ${subject.changes.score} of 100?`,
      answer: `${crp.total} findings over ${prs} PRs. ${unreviewed} of ${prs} were merged with no approving review, and any one of them breaches the floor, so change risk cannot rise above it until review coverage does. The points themselves go to ${crp.bars.filter((b) => !/^merged with no/.test(b.label)).map((b) => `${b.label} (${b.value})`).join(", ") || "nothing else"}.`,
      evidence: [{ label: "changes.json", href: `${subject.dir}/changes.json` }],
      depth: { kind: "evidence stops", why: "the next why is the monorepo's branch rules and review load, which the kept reports do not carry; open a 5 Whys with harness why --finding two-of-three-below-75:change-risk once the scoreboard fires it" },
      pareto: "change-risk"
    });
  }
  if (i.noise?.length) {
    const nights = i.noise;
    const clean = nights.filter((n) => n.hunks === 0 && !n.degraded.length);
    const blindable = nights.filter((n) => cmpVersion(n.harnessVersion, DEGRADED_SINCE) < 0 && n.hunks === 0);
    const noisy = nights.filter((n) => n.hunks > 0);
    const silent = nights.at(-1)?.masks;
    out.push({
      id: "aa",
      question: "Can the A/A be trusted to say the harness sees clearly?",
      answer: `${clean.length} of ${nights.length} A/A nights were clean, ${noisy.length} noisy (${noisy.map((n) => `${n.hunks} on ${n.ranAt.slice(0, 10)}`).join(", ") || "none"}) and ${nights.filter((n) => n.degraded.length).length} degraded. ${blindable.length ? `${plural(blindable.length, "clean night")} ran on a harness older than ${DEGRADED_SINCE}, which could not tell a clean night from a blind one (a journey failing on both sides), so ${blindable.length === 1 ? "its" : "their"} clean cannot be counted as seeing. ` : ""}${silent ? `${silent.silent} of ${silent.total} masks fired nothing on the latest night: each is a blind spot to review.` : ""}`,
      evidence: [{ label: "noise-history.json", href: "noise/noise-history.json" }, { label: "PR #22", href: `${REPO}/pull/22` }],
      depth: { kind: "evidence stops", why: blindable.length ? `the detection that answers it shipped in ${DEGRADED_SINCE}; every night since says degraded when it is` : "every night was judged by a harness that detects a blind A/A" }
    });
  }
  out.push({
    id: "flow",
    question: "How long does a change wait to reach production, and where?",
    answer:
      vs.leadMs === null
        ? `Not measured: ${vs.notMeasured.join("; ")}.`
        : `The oldest merge to main not yet in production has waited ${duration(vs.leadMs)}, while the machine time of the whole stream is ${duration(vs.processMs)}: flow efficiency ${(vs.flowEfficiency! * 100).toFixed(vs.flowEfficiency! < 0.01 ? 2 : 1)}%. The wait is inventory: ${vs.inventory.map((x) => `${x.count} ${x.label}`).join("; ")}.`,
    evidence: [{ label: "the value stream map below" }],
    depth: { kind: "evidence stops", why: "release cadence is a decision, not a defect: the map shows the batch, the team chooses its size" }
  });
  return out;
}

export function buildA3(i: A3Inputs): A3 {
  const subject = subjectRun(i.runs);
  const whys = i.kaizen.map((k) => fiveWhysOf(k, i.now));
  const paretos = [unclaimedPareto(subject), lineStopPareto(i), confidencePareto(subject), changeRiskPareto(subject)].filter((p): p is Pareto => !!p);
  const byId = new Map(paretos.map((p) => [p.id, p]));
  const vs = valueStream(i, subject);
  const rca = rcaOf(i, subject, byId, vs, whys);
  // The 5 Whys in the order of the questions they answer; any other after them, in file order.
  const order = (w: FiveWhys) => {
    const n = rca.findIndex((q) => q.depth.kind === "5 whys" && q.depth.file === w.file);
    return n < 0 ? rca.length : n;
  };
  whys.sort((x, y) => order(x) - order(y));
  const score = scoreOf(i, subject, postDeployState(i.github));
  const decisions = decisionsFor(subject);
  const quality = subject ? qualityOf({ ...(subject.report ? { report: subject.report } : {}), ...(subject.quality !== undefined ? { record: subject.quality } : {}), ...(i.mutants ? { mutants: i.mutants } : {}), dir: subject.dir }) : undefined;
  const times = i.runs.map((r) => r.ranAt).sort();
  const streams: Partial<Record<Stream, number>> = {};
  for (const r of i.runs) streams[r.stream] = (streams[r.stream] ?? 0) + 1;

  const cand = score?.candidate ?? "main";
  const prod = score?.baseline ?? "production";
  const background = [
    `Tutors ships four apps (reader, catalogue, live, time) as signed images. The release harness runs each candidate beside production, diffs everything a student can observe, and stops the line unless every difference is claimed by a Rule or a changelog entry.`,
    `This A3 reads every run the harness has kept: ${i.runs.length} runs${times.length ? ` from ${times[0]!.slice(0, 10)} to ${times.at(-1)!.slice(0, 10)}` : ""} (${STREAMS.filter((s) => streams[s]).map((s) => `${STREAM_NAMES[s]} ${streams[s]}`).join(", ")}), the kaizen register (${i.kaizen.length} filled 5 Whys)${i.github ? ", and the workflows' own history on GitHub" : ""}. It is rebuilt with the site, so it always describes the newest evidence.`,
    `Why it matters: production is ${prod}; main (${cand}) is what the next release would ship. Every unclaimed difference is a claim or a fix that release will need, and every red check after a deploy is a question about what students are running.`
  ];

  const facts: string[] = [];
  if (score) facts.push(`Gate ${score.gate} on the ${score.subject} ${cand} beside ${prod}${score.rcs !== null ? `, RCS ${score.rcs} ${score.band}` : ", so no RCS"}.`);
  if (score?.lastRelease) facts.push(`Last release candidate kept: ${score.lastRelease.candidate} beside ${score.lastRelease.baseline}, ${score.lastRelease.verdict} on ${score.lastRelease.ranAt.slice(0, 10)}.`);
  if (score?.postDeploy) facts.push(`Post-deploy: ${score.postDeploy.red ? `red ${score.postDeploy.red} runs running` : "green"}${score.postDeploy.issue ? `, rollback issue #${score.postDeploy.issue.number} open` : ""}.`);
  if (score?.aa) facts.push(`A/A: ${score.aa.verdict} on ${score.aa.ranAt.slice(0, 10)}.`);
  if (quality) facts.push(`Quality: ${quality.lights.map((l) => `${l.name} ${l.state}`).join(", ")}.`);

  const unclaimed = subject?.report?.compare.unclaimed.length;
  const glances = 0;
  const scored = i.scoreboardReleases ?? 0;
  const closed = whys.filter((w) => w.status === "closed").length;
  const goal: GoalRow[] = [];
  if (score) goal.push({ metric: "Gate on the newest forecast", now: score.gate, target: "PASS", met: score.gate === "PASS", source: "confidence.json" });
  if (unclaimed !== undefined) goal.push({ metric: "Unclaimed differences", now: String(unclaimed), target: "0", met: unclaimed === 0, source: "report.json" });
  // Since 1.28.1: the known side beside the gaps, so the claims that already hold are as visible as the ones owed.
  const claimed = subject?.report?.compare.matches?.filter((m) => m?.claim).length;
  if (unclaimed !== undefined && claimed !== undefined) goal.push({ metric: "Claims: known and gaps", now: `${claimed} claimed, ${unclaimed} unclaimed (${coverageWords(claimed + unclaimed ? claimed / (claimed + unclaimed) : null)} covered)`, target: "every difference claimed or fixed", met: unclaimed === 0, source: "report.json" });
  if (score) goal.push({ metric: "Release Confidence Score", now: score.rcs === null ? "none (Gate wins)" : `${score.rcs} ${score.band}`, target: "75 or more (Amber), on the way to 90 (Green)", met: (score.rcs ?? 0) >= 75, source: "docs/lean.md, bands" });
  if (score?.postDeploy) goal.push({ metric: "Post-deploy", now: score.postDeploy.red ? `red, ${score.postDeploy.red} runs` : "green", target: "green on a confirmed build", met: !score.postDeploy.red, source: "post-deploy.yml" });
  goal.push({ metric: "Releases scored (C0 evidence gate)", now: String(scored), target: "3", met: scored >= 3, source: "scoreboard branch" });
  goal.push({ metric: "Countermeasures verified closed (C4 evidence gate)", now: `${closed} of ${whys.length}`, target: "every one, in a release", met: whys.length > 0 && closed === whys.length, source: "kaizen/README.md" });

  const rcaOfWhy = (w: FiveWhys) => rca.filter((q) => q.depth.kind === "5 whys" && q.depth.file === w.file).map((q) => q.id);
  const countermeasures = whys.map((w) => ({ kind: w.kind ?? "(not one of the seven)", what: w.countermeasure, owner: w.owner, due: w.due, status: w.status, from: w.file, rca: rcaOfWhy(w) }));
  const plan = [
    ...whys.filter((w) => w.status !== "closed").map((w) => ({ what: w.countermeasure, who: w.owner || "no owner", when: w.due || "no due date", status: w.status })),
    { what: "Score 3 real releases so the weights can be judged against the team's view (C0)", who: "the release captain", when: "the next three releases", status: scored >= 3 ? "met" : `${scored} of 3` },
    { what: "Record 2 reviewer's glances (C3)", who: "the reviewer", when: "the next two releases", status: `${glances} of 2` }
  ];
  const followUp = [
    { check: "Every countermeasure closed in a release (Verified by)", state: `${closed} of ${whys.length} closed`, met: whys.length > 0 && closed === whys.length },
    { check: "Open countermeasures not rising (run rule)", state: `${whys.filter((w) => w.status !== "closed").length} open, ${whys.filter((w) => w.status === "overdue").length} overdue`, met: whys.every((w) => w.status !== "overdue") },
    { check: "The next forecast's Pareto: the top bar shrinks", state: paretos[0] ? `${paretos[0].bars[0]?.label ?? "none"}: ${paretos[0].bars[0]?.value ?? 0}` : "no forecast", met: !paretos[0]?.total },
    { check: "Post-deploy green on a build it can confirm", state: score?.postDeploy ? (score.postDeploy.red ? `red ${score.postDeploy.red} runs` : "green") : "not measured", met: !!score?.postDeploy && !score.postDeploy.red }
  ];

  return {
    schemaVersion: A3_SCHEMA_VERSION,
    builtAt: i.now.toISOString(),
    harness: i.harness,
    title: "A3 Aggregator: release confidence",
    score,
    background,
    current: { facts, paretos, valueStream: vs },
    goal,
    rca,
    fiveWhys: whys,
    ...(decisions ? { decisions } : {}),
    ...(quality ? { quality } : {}),
    countermeasures,
    plan,
    followUp,
    sources: { runs: i.runs.length, streams, first: times[0] ?? null, last: times.at(-1) ?? null, github: i.github ? `read ${i.github.fetchedAt}${i.github.errors.length ? `; not answered: ${i.github.errors.join("; ")}` : ""}` : "not read (built without --fetch-github)", kaizen: i.kaizen.length }
  };
}

export { DIMENSIONS };
