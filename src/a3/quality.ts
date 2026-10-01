/**
 * The quality strip (since 1.18.0): three lights under the Gate on the A3, and the same three as small marks on every
 * row of the overnight readiness page. Speed, Metrics and Tests, each "within reason", "look" or "not measured", with
 * the number and the rule beside it and a link to what it read.
 *
 *   Speed    the timing, load and startup hunks and the load block of report.json: within reason when no timing, load
 *            or startup hunk fails and k6 saw no failed or 5xx request on main. Main is measured beside production in
 *            the same run, so "within reason" means "not worse than production, measured together".
 *   Metrics  the metrics hunks: within reason when none is unclaimed. Log differences are shown beside it, not counted.
 *   Tests    two halves, each said apart. The harness half: every journey completed on both sides, the A/A the run
 *            relied on clean and at most 2 days old, and the newest weekly mutants self-test caught every mutant. The
 *            monorepo half, from its quality record (quality.json, kept beside the forecast): the Nightly green on that
 *            commit, and no changed package below the Test signal target. The record is for the judged commit or the
 *            newest one before it; the light says which, and how old.
 *
 * "Not measured" is a state of its own, drawn differently from green, and a light is "within reason" only when every
 * check under it was read and in reason. Pure, and advisory: nothing here is an input to the Gate, the score, a verdict
 * or an exit code. It reads kept files only (src/a3/read.ts and src/readiness/read.ts read them).
 */
import { hunkAnchor } from "../score/confidence.ts";
import { weeklyFor, type WeeklyMutants } from "../score/test-signal.ts";
import { RULES } from "../score/weights.ts";
import type { Hunk, NoiseStatus, RunReport } from "../types.ts";
import type { Link } from "./model.ts";

export { parseWeeklyMutants, type WeeklyMutants } from "../score/test-signal.ts";

/** The monorepo's quality record, kept beside a forecast under this name (since 1.18.0). */
export const QUALITY_FILE = "quality.json";
/** The A/A the run relied on is fresh enough at this age (the same 2 days as the score's noise health). */
export const AA_FRESH_DAYS = 2;
const DAY_MS = 86_400_000;

export type LightState = "within reason" | "look" | "not measured";

/**
 * The quality record the monorepo's Nightly publishes for a commit (`pnpm release:quality`, on its `quality` branch as
 * quality/<sha>.json). `packages` is the shape `--test-signal` reads; it is absent when the Nightly wrote no Stryker report.
 */
export interface QualityRecord {
  schemaVersion: 1;
  commit: string;
  base?: string | null;
  generatedAt?: string;
  evidence?: string;
  packages?: { name: string; mutationScore: number; changed?: boolean; path?: string; evidence?: string }[];
  nightly?: { result: string; jobs?: Record<string, string> };
}

export interface QualityCheck {
  id: "slower" | "load" | "metrics" | "journeys" | "aa" | "mutants" | "nightly" | "mutation";
  /** For the Tests light: which half it belongs to. */
  half?: "harness" | "monorepo";
  label: string;
  state: LightState;
  /** What was read, in words, with the number. */
  reading: string;
  evidence: Link[];
}

export interface QualityLight {
  id: "speed" | "metrics" | "tests";
  name: string;
  state: LightState;
  /** The number, in one line. */
  reading: string;
  /** When the light is within reason. */
  rule: string;
  checks: QualityCheck[];
  /** Tests only: each half's own state, so a half-measured light says which half. */
  halves?: { harness: LightState; monorepo: LightState };
  /** Shown beside the light, never counted (the log differences beside Metrics). */
  beside?: string;
  evidence: Link[];
}

export interface QualityStrip {
  lights: QualityLight[];
  /** The monorepo's quality record the Tests light read; absent when none was kept beside the forecast. */
  record?: {
    commit: string;
    /** The record is for the commit side b was built from; false when it is for an earlier one (the newest before it). */
    judged: boolean;
    generatedAt: string | null;
    /** How long before the forecast ran the record was generated; null without a generatedAt. */
    ageMs: number | null;
    href: string;
    evidence?: string;
  };
  /** One sentence for people. */
  note: string;
}

export interface QualityInputs {
  /** The forecast's report.json, as kept. Absent: nothing to read, every light is not measured. */
  report?: Partial<Pick<RunReport, "ranAt" | "compare" | "load" | "noise" | "provenance">>;
  /** The kept quality.json, parsed; undefined when none was kept, null when one was kept and could not be read. */
  record?: QualityRecord | null;
  /** The weekly mutants self-tests (mutants.jsonl); undefined when the record was not read. */
  mutants?: WeeklyMutants[];
  /** The run's directory relative to the site, for the links. */
  dir: string;
}

// ---- reading the inputs ----------------------------------------------------------------------------------

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

/**
 * A quality record, or undefined when it is not one: `schemaVersion` 1 and a hex `commit`. A `packages` entry that is not
 * `{ name, mutationScore 0-100 }` drops the whole list (no mutation evidence, never part of it); a `nightly` without a
 * string `result` is dropped the same way.
 */
export function parseQualityRecord(raw: unknown): QualityRecord | undefined {
  if (!isObj(raw) || raw.schemaVersion !== 1 || typeof raw.commit !== "string" || !/^[0-9a-f]{7,40}$/.test(raw.commit)) return undefined;
  const pkgOk = (p: unknown) => isObj(p) && typeof p.name === "string" && typeof p.mutationScore === "number" && p.mutationScore >= 0 && p.mutationScore <= 100 && (p.changed === undefined || typeof p.changed === "boolean");
  const packages = Array.isArray(raw.packages) && raw.packages.every(pkgOk) ? (raw.packages as QualityRecord["packages"]) : undefined;
  const n = raw.nightly;
  const nightly = isObj(n) && typeof n.result === "string" ? { result: n.result, ...(isObj(n.jobs) ? { jobs: Object.fromEntries(Object.entries(n.jobs).map(([k, v]) => [k, String(v)])) } : {}) } : undefined;
  return {
    schemaVersion: 1,
    commit: raw.commit,
    ...(typeof raw.base === "string" || raw.base === null ? { base: raw.base as string | null } : {}),
    ...(typeof raw.generatedAt === "string" && Number.isFinite(Date.parse(raw.generatedAt)) ? { generatedAt: raw.generatedAt } : {}),
    ...(typeof raw.evidence === "string" ? { evidence: raw.evidence } : {}),
    ...(packages ? { packages } : {}),
    ...(nightly ? { nightly } : {})
  };
}

// ---- helpers ---------------------------------------------------------------------------------------------

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const day = (iso: string) => iso.slice(0, 10);
/** An age the way a person says it: 40m, 6h, 3 days. */
export function age(ms: number): string {
  if (ms < 90 * 60_000) return `${Math.max(0, Math.round(ms / 60_000))}m`;
  if (ms < 36 * 3_600_000) return `${Math.round(ms / 3_600_000)}h`;
  return plural(Math.round(ms / DAY_MS), "day");
}
const short = (sha: string) => sha.slice(0, 7);

/** Within reason when every check is, look when any is, else not measured. */
export function combine(states: LightState[]): LightState {
  if (states.includes("look")) return "look";
  return states.length && states.every((s) => s === "within reason") ? "within reason" : "not measured";
}

const JOURNEY = /^journey "([^"]+)" (completed on a but failed on b|failed on a but completed on b \(fixed\)|failed on both sides)$/;

// ---- the three lights ------------------------------------------------------------------------------------

function speed(i: QualityInputs, hunkLink: (h: Hunk, label?: string) => Link, at: (anchor: string, label: string) => Link): QualityLight {
  const rule = "No failing timing, load or startup hunk; k6 failure rate 0 on main";
  const r = i.report;
  if (!r?.compare) return { id: "speed", name: "Speed", state: "not measured", reading: "no report.json kept", rule, checks: [], evidence: [] };
  const claimed = new Set((r.compare.matches ?? []).filter((m) => m.claim).map((m) => m.hunk.id));
  const failing = (r.compare.hunks ?? []).filter((h) => h.severity === "fail" && (h.artefact === "timing" || h.artefact === "startup"));
  const slower = failing.filter((h) => !h.scope.startsWith("load/"));
  const loadFails = failing.filter((h) => h.scope.startsWith("load/"));
  const named = (hs: Hunk[]) => hs.slice(0, 3).map((h) => `${h.summary}${claimed.has(h.id) ? " (claimed)" : ""}`).join("; ") + (hs.length > 3 ? `; and ${hs.length - 3} more` : "");
  const checks: QualityCheck[] = [
    {
      id: "slower",
      label: "No journey or startup significantly slower",
      state: slower.length ? "look" : "within reason",
      reading: slower.length ? `${plural(slower.length, "failing timing or startup hunk")}: ${named(slower)}` : "no journey significantly slower",
      evidence: slower.length ? slower.slice(0, 3).map((h) => hunkLink(h)) : [at("differences", "the differences")]
    }
  ];
  const load = r.load;
  if (!load?.a || !load?.b) checks.push({ id: "load", label: "k6 failure rate 0 on main", state: "not measured", reading: "no k6 leg in this run", evidence: [] });
  else {
    const failed = (load.b.failed ?? 0) + (load.b.serverErrors ?? 0);
    const state: LightState = failed > 0 || loadFails.length ? "look" : "within reason";
    checks.push({
      id: "load",
      label: "k6 failure rate 0 on main",
      state,
      reading: `p95 ${load.a.p95} ms on production, ${load.b.p95} ms on main; ${failed} of ${load.b.requests} requests failed${loadFails.length ? `; ${named(loadFails)}` : ""}`,
      evidence: [at("load", "the load"), ...loadFails.slice(0, 2).map((h) => hunkLink(h))]
    });
  }
  const loadCheck = checks.find((c) => c.id === "load")!;
  const reading = [loadCheck.state === "not measured" ? "no k6 leg" : loadCheck.reading, checks[0]!.state === "look" ? checks[0]!.reading : "no journey significantly slower"].join("; ");
  return { id: "speed", name: "Speed", state: combine(checks.map((c) => c.state)), reading, rule, checks, evidence: checks.flatMap((c) => c.evidence).slice(0, 4) };
}

function metrics(i: QualityInputs, hunkLink: (h: Hunk, label?: string) => Link, at: (anchor: string, label: string) => Link): QualityLight {
  const rule = "No unclaimed metrics hunk";
  const r = i.report;
  if (!r?.compare) return { id: "metrics", name: "Metrics", state: "not measured", reading: "no report.json kept", rule, checks: [], evidence: [] };
  const unclaimed = r.compare.unclaimed ?? [];
  const m = unclaimed.filter((h) => h.artefact === "metrics");
  const logs = unclaimed.filter((h) => h.artefact === "logs").length;
  const reading = m.length ? `${plural(m.length, "unclaimed metrics hunk")}: ${m.slice(0, 2).map((h) => h.summary).join("; ")}${m.length > 2 ? "; …" : ""}` : "no unclaimed metrics hunk";
  const evidence = m.length ? m.slice(0, 3).map((h) => hunkLink(h)) : [at("differences", "the differences")];
  const check: QualityCheck = { id: "metrics", label: rule, state: m.length ? "look" : "within reason", reading, evidence };
  return { id: "metrics", name: "Metrics", state: check.state, reading, rule, checks: [check], ...(logs ? { beside: `${plural(logs, "log difference")} unclaimed, shown beside it, not counted` } : {}), evidence };
}

function tests(i: QualityInputs, hunkLink: (h: Hunk, label?: string) => Link, at: (anchor: string, label: string) => Link, recordHref: string): { light: QualityLight; record?: QualityStrip["record"] } {
  const rule = `Harness: every journey completed on both sides, the A/A clean and at most ${AA_FRESH_DAYS} days old, every mutant caught. Monorepo: the Nightly green on the commit, no changed package below ${RULES.testSignal.target}% mutation score`;
  const r = i.report;
  const ranAt = r?.ranAt && Number.isFinite(Date.parse(r.ranAt)) ? Date.parse(r.ranAt) : undefined;
  const checks: QualityCheck[] = [];

  // ---- the harness half
  if (!r?.compare) checks.push({ id: "journeys", half: "harness", label: "Every journey completed on both sides", state: "not measured", reading: "no report.json kept", evidence: [] });
  else {
    const out = (r.compare.hunks ?? []).filter((h) => h.artefact === "dom" && JOURNEY.test(h.summary));
    checks.push({
      id: "journeys",
      half: "harness",
      label: "Every journey completed on both sides",
      state: out.length ? "look" : "within reason",
      reading: out.length ? out.slice(0, 3).map((h) => h.summary).join("; ") + (out.length > 3 ? `; and ${out.length - 3} more` : "") : "every journey completed on both sides",
      evidence: out.length ? out.slice(0, 3).map((h) => hunkLink(h)) : []
    });
  }
  const aa: NoiseStatus | undefined = r?.noise;
  if (!aa || !Number.isFinite(Date.parse(aa.ranAt))) checks.push({ id: "aa", half: "harness", label: `The A/A it relied on clean, at most ${AA_FRESH_DAYS} days old`, state: "not measured", reading: r?.compare ? "the run consulted no A/A" : "no report.json kept", evidence: [] });
  else {
    const old = ranAt !== undefined ? ranAt - Date.parse(aa.ranAt) : 0;
    const problems = [...(aa.degraded?.length ? [`degraded (${aa.degraded.join("; ")})`] : []), ...(!aa.clean || aa.hunks > 0 ? [`${plural(aa.hunks, "difference")}`] : []), ...(old > AA_FRESH_DAYS * DAY_MS ? [`${age(old)} old`] : [])];
    checks.push({
      id: "aa",
      half: "harness",
      label: `The A/A it relied on clean, at most ${AA_FRESH_DAYS} days old`,
      state: problems.length ? "look" : "within reason",
      reading: problems.length ? `A/A of ${day(aa.ranAt)}: ${problems.join(", ")}` : `A/A clean (0 differences), ${age(Math.max(0, old))} before the run`,
      evidence: [at("noise", "the A/A")]
    });
  }
  const label = "The newest weekly mutants self-test caught every mutant";
  if (!i.mutants) checks.push({ id: "mutants", half: "harness", label, state: "not measured", reading: "the weekly mutants record (mutants.jsonl) was not read", evidence: [] });
  else {
    // The same self-test the score would join to Test signal for this run (src/score/test-signal.ts).
    const w = weeklyFor(i.mutants, r?.ranAt);
    const ev = w.point?.runUrl ? [{ label: `self-test of ${day(w.point.ranAt)}`, href: w.point.runUrl }] : [];
    if ("gap" in w) checks.push({ id: "mutants", half: "harness", label, state: "not measured", reading: w.gap, evidence: ev });
    else checks.push({ id: "mutants", half: "harness", label, state: w.point.caught < w.point.total ? "look" : "within reason", reading: `${w.point.caught} of ${w.point.total} mutants caught, ${day(w.point.ranAt)}`, evidence: ev });
  }

  // ---- the monorepo half
  const rec = i.record;
  let record: QualityStrip["record"];
  if (!rec) {
    const why = rec === null ? "the kept quality.json is not a quality record" : "no quality record kept beside this forecast";
    checks.push({ id: "nightly", half: "monorepo", label: "The Nightly green on the commit", state: "not measured", reading: why, evidence: [] });
    checks.push({ id: "mutation", half: "monorepo", label: `No changed package below ${RULES.testSignal.target}% mutation score`, state: "not measured", reading: why, evidence: [] });
  } else {
    const judgedCommit = r?.provenance?.b?.images?.reader?.revision ?? "";
    const judged = !!judgedCommit && (judgedCommit.startsWith(rec.commit) || rec.commit.startsWith(judgedCommit));
    const gen = rec.generatedAt ? Date.parse(rec.generatedAt) : NaN;
    const ageMs = Number.isFinite(gen) && ranAt !== undefined ? ranAt - gen : null;
    record = { commit: rec.commit, judged, generatedAt: rec.generatedAt ?? null, ageMs, href: recordHref, ...(rec.evidence ? { evidence: rec.evidence } : {}) };
    const ev: Link[] = [{ label: QUALITY_FILE, href: recordHref }, ...(rec.evidence ? [{ label: "the Nightly run", href: rec.evidence }] : [])];
    const n = rec.nightly;
    if (!n) checks.push({ id: "nightly", half: "monorepo", label: "The Nightly green on the commit", state: "not measured", reading: "the record carries no Nightly result", evidence: ev });
    else {
      const failed = Object.entries(n.jobs ?? {}).filter(([, v]) => v === "failure" || v === "cancelled").map(([k, v]) => `${k} ${v}`);
      checks.push({ id: "nightly", half: "monorepo", label: "The Nightly green on the commit", state: n.result === "success" ? "within reason" : "look", reading: n.result === "success" ? `Nightly green on ${short(rec.commit)}` : `Nightly ${n.result} on ${short(rec.commit)}${failed.length ? `: ${failed.join(", ")}` : ""}`, evidence: ev });
    }
    const target = RULES.testSignal.target;
    if (!rec.packages) checks.push({ id: "mutation", half: "monorepo", label: `No changed package below ${target}% mutation score`, state: "not measured", reading: "no mutation scores in the record (the Nightly wrote no Stryker report)", evidence: ev });
    else {
      const changed = rec.packages.filter((p) => p.changed !== false);
      const below = changed.filter((p) => p.mutationScore < target).sort((x, y) => x.mutationScore - y.mutationScore);
      const lowest = [...changed].sort((x, y) => x.mutationScore - y.mutationScore)[0];
      checks.push({
        id: "mutation",
        half: "monorepo",
        label: `No changed package below ${target}% mutation score`,
        state: below.length ? "look" : "within reason",
        reading: below.length
          ? `${plural(below.length, "changed package")} below ${target}%: ${below.slice(0, 3).map((p) => `${p.name} ${p.mutationScore}%`).join(", ")}${below.length > 3 ? ", …" : ""}`
          : changed.length
            ? `${plural(changed.length, "changed package")}, the lowest ${lowest!.name} at ${lowest!.mutationScore}%`
            : `no package changed${rec.base ? ` since ${rec.base}` : ""} (${plural(rec.packages.length, "package")} scored)`,
        evidence: ev
      });
    }
  }
  const half = (h: "harness" | "monorepo") => combine(checks.filter((c) => c.half === h).map((c) => c.state));
  const halves = { harness: half("harness"), monorepo: half("monorepo") };
  const SHORT: Record<QualityCheck["id"], string> = { slower: "timing", load: "load", metrics: "metrics", journeys: "journeys", aa: "the A/A", mutants: "the weekly mutants", nightly: "the Nightly", mutation: "mutation scores" };
  const and = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
  const whose = (h: "harness" | "monorepo") => {
    const cs = checks.filter((c) => c.half === h);
    if (halves[h] === "within reason") return "within reason";
    const nm = cs.filter((c) => c.state === "not measured");
    if (nm.length === cs.length && new Set(nm.map((c) => c.reading)).size === 1) return `not measured (${nm[0]!.reading})`;
    const ok = cs.filter((c) => c.state === "within reason").map((c) => SHORT[c.id]);
    return [...cs.filter((c) => c.state === "look").map((c) => c.reading), ...(ok.length ? [`${and(ok)} within reason`] : []), ...(nm.length ? [`${and(nm.map((c) => SHORT[c.id]))} not measured`] : [])].join("; ");
  };
  const recWords = record ? ` (record ${record.judged ? "for the judged commit" : `for ${short(record.commit)}, an earlier commit`}${record.ageMs !== null ? `, ${age(Math.max(0, record.ageMs))} old` : ""})` : "";
  const reading = `Harness: ${whose("harness")}. Monorepo${recWords}: ${whose("monorepo")}.`;
  return { light: { id: "tests", name: "Tests", state: combine(checks.map((c) => c.state)), reading, rule, checks, halves, evidence: checks.flatMap((c) => c.evidence).filter((l, k, all) => all.findIndex((x) => x.href === l.href) === k).slice(0, 5) }, ...(record ? { record } : {}) };
}

/** The strip for one kept forecast. */
export function qualityOf(i: QualityInputs): QualityStrip {
  const report = `${i.dir}/report.html`;
  const hunkLink = (h: Hunk, label?: string): Link => ({ label: label ?? h.id, href: `${report}#${hunkAnchor(h)}` });
  const at = (anchor: string, label: string): Link => ({ label, href: `${report}#${anchor}` });
  const t = tests(i, hunkLink, at, `${i.dir}/${QUALITY_FILE}`);
  const lights = [speed(i, hunkLink, at), metrics(i, hunkLink, at), t.light];
  const r = t.record;
  const note = r
    ? `Tests read the monorepo's quality record ${r.judged ? "for the judged commit" : `for ${short(r.commit)}, the newest before the judged commit`}${r.generatedAt ? `, generated ${day(r.generatedAt)}${r.ageMs !== null ? ` (${age(Math.max(0, r.ageMs))} before the forecast)` : ""}` : ""}. The strip is a reading aid: it never changes the Gate, the score or an exit code.`
    : "No monorepo quality record was kept with this forecast (its Nightly publishes one per commit to the monorepo's quality branch), so the Tests light reads the harness half only. The strip is a reading aid: it never changes the Gate, the score or an exit code.";
  return { lights, ...(r ? { record: r } : {}), note };
}
