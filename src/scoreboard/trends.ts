/**
 * The scoreboard read over time: six trend views, the run rules, and the harness's own health beside them.
 *
 *   1. RCS per release, against the Green/Amber/Red bands
 *   2. the eight dimensions as small multiples, so a slow slide in one shows before the total moves
 *   3. mask count and masks that never fired (both growing means the harness is going blind)
 *   4. claims and stale claims (a rising stale count means changelogs drift from code)
 *   5. hotspot recurrence: the five files touched by the most releases, refactor candidates
 *   6. per-file risk over time, and per-contributor risk labelled for trends only
 *
 * Run rules (statistical process control), per series: three consecutive declines, or two of three releases below 75.
 * They act on trends, not on one bad release (a Red band already opens a 5 Whys on its own), which keeps them from
 * becoming noise. A firing opens a kaizen item naming the dimension. Advisory like the score: nothing here reaches a
 * verdict or an exit code.
 *
 * One point per release: the latest run of its tag (what the go decision was made on). An earlier run is not hidden:
 * every re-run is listed under `deviations` with its first and latest RCS, because re-running for a better number is a
 * logged deviation (docs/lean.md, "Guardrails"). Pure: the command reads the files.
 */
import type { HistoryEntry } from "../ci/noise-history.ts";
import { BANDS, DIMENSIONS, RULES, type Band, type DimensionId } from "../score/weights.ts";
import type { MutantsPoint, ScoreboardLine } from "./line.ts";

export const TRENDS_SCHEMA_VERSION = 1 as const;

/** The bottom of Amber (75): below it a release is Red, and two of three below it is a run rule. */
export const RUN_RULE_BELOW = BANDS.find((b) => b.band === "Amber")!.min;
/** Consecutive declines that fire the first rule. */
export const RUN_RULE_DECLINES = 3;
export const TOP_HOTSPOTS = 5;
export const TOP_RISK_FILES = 10;
/** The noise nights cleanliness is read over. */
export const NOISE_WINDOW = 30;

export const CONTRIBUTOR_NOTE = "For trends and glances only, never for reviewing people: the register records countermeasures to the system, and \"a person was careless\" is never one.";

export type SeriesId = DimensionId | "rcs";
export type RunRuleId = "three-declines" | "two-of-three-below-75";

export interface ReleasePoint {
  tag: string;
  /** The run this point is (the tag's latest), and how many runs the tag has. */
  run: number;
  runs: number;
  date: string;
  gate: string;
  rcs: number | null;
  band: Band | null;
  weightsVersion: string | null;
  /** True when this release was scored under other weights or rules than the one before it (both known): a discontinuity. */
  weightsChanged: boolean;
}

export interface RunRuleFiring {
  rule: RunRuleId;
  series: SeriesId;
  name: string;
  /** The release the rule fired at, and the window of releases it read. */
  at: string;
  window: { tag: string; value: number }[];
  /** True when it fires at the newest release: an andon now, not history. */
  current: boolean;
  /** The window spans a change of weights or rules, so part of the movement may be the rules, not the product. */
  acrossWeightsChange: boolean;
  /** The kaizen item it opens: `harness release` writes it as a 5 Whys stub (`harness why --finding <rule>:<series>`, since 1.13.0). */
  kaizen: string;
}

export interface Trends {
  schemaVersion: typeof TRENDS_SCHEMA_VERSION;
  generatedAt: string;
  lines: number;
  releases: number;
  /** "no releases scored yet" when the file has no line. */
  empty?: string;
  views: {
    rcs: ReleasePoint[];
    dimensions: { id: DimensionId; name: string; points: { tag: string; score: number | null; status: "measured" | "not measured"; floorBreached: boolean }[] }[];
    masks: { tag: string; masks: number | null; neverFired: number | null }[];
    claims: { tag: string; claims: number | null; stale: number | null }[];
    hotspots: { releasesWithChanges: number; top: { file: string; releases: number; tags: string[]; refactorCandidate: boolean }[] };
    risk: {
      files: { file: string; total: number; points: { tag: string; points: number }[] }[];
      contributors: { note: string; rows: { author: string; total: number; points: { tag: string; points: number }[] }[] };
    };
  };
  runRules: {
    firings: RunRuleFiring[];
    /** The firings at the newest release: what `harness release` prints after the score. */
    current: RunRuleFiring[];
    countermeasures: { status: "measured"; rising: boolean; counts: number[] } | { status: "not measured"; reason: string };
  };
  /** Re-runs of a tag: each is a logged deviation, with the first and the latest RCS side by side. */
  deviations: { tag: string; runs: number; firstRcs: number | null; latestRcs: number | null }[];
  selfHealth: SelfHealth;
}

export interface SelfHealth {
  mutants: { week: string; ranAt: string; caught: number | null; total: number }[];
  noise:
    | { status: "measured"; nights: number; cleanNights: number; cleanRate: number; lastFailure: string | null; daysSinceLastFailure: number | null; since: string }
    | { status: "not measured"; reason: string };
}

const NAME: Record<SeriesId, string> = { rcs: "RCS", ...(Object.fromEntries(DIMENSIONS.map((d) => [d.id, d.name])) as Record<DimensionId, string>) };
const DAY = 86_400_000;

/** One line per release, in the order each tag first appeared: the tag's latest run, with the count of its runs. */
export function releasesOf(lines: ScoreboardLine[]): { latest: ScoreboardLine; first: ScoreboardLine; runs: number }[] {
  const byTag = new Map<string, ScoreboardLine[]>();
  for (const l of lines) byTag.set(l.tag, [...(byTag.get(l.tag) ?? []), l]);
  return [...byTag.values()].map((ls) => ({ latest: ls.at(-1)!, first: ls[0]!, runs: ls.length }));
}

// ---- run rules ---------------------------------------------------------------------------------------------

/**
 * The two rules over one series. Releases where the series has no value (not measured, or no RCS) are left out, so a
 * gap neither breaks nor makes a run. Each firing names the release it fired at and the window it read.
 */
export function runRules(series: SeriesId, points: { tag: string; value: number | null; weightsVersion?: string | null }[], newest: string | undefined): RunRuleFiring[] {
  const p = points.filter((x): x is { tag: string; value: number; weightsVersion?: string | null } => x.value !== null);
  const out: RunRuleFiring[] = [];
  const fire = (rule: RunRuleId, j: number, from: number, words: string) => {
    const win = p.slice(from, j + 1);
    // An unknown version (a line scored before 1.11.0) is not a change: only two known, different versions are.
    const versions = new Set(win.map((x) => x.weightsVersion).filter((v) => v));
    out.push({
      rule,
      series,
      name: NAME[series],
      at: p[j]!.tag,
      window: win.map((x) => ({ tag: x.tag, value: x.value })),
      current: p[j]!.tag === newest,
      acrossWeightsChange: versions.size > 1,
      kaizen: `${NAME[series]}: ${words} (${win.map((x) => `${x.tag} ${x.value}`).join(", ")})`
    });
  };
  for (let j = 0; j < p.length; j++) {
    if (j >= RUN_RULE_DECLINES && p.slice(j - RUN_RULE_DECLINES, j + 1).every((x, i, w) => i === 0 || x.value < w[i - 1]!.value)) fire("three-declines", j, j - RUN_RULE_DECLINES, "three consecutive declines");
    if (j >= 2 && p.slice(j - 2, j + 1).filter((x) => x.value < RUN_RULE_BELOW).length >= 2) fire("two-of-three-below-75", j, j - 2, `two of the last three releases below ${RUN_RULE_BELOW}`);
  }
  return out;
}

/** Why the register's rule has nothing to read: no line has recorded the open countermeasures yet. */
export const NO_COUNTERMEASURES = "no scoreboard line records openCountermeasures yet (since 1.13.0, from the kaizen register, kaizen/README.md)";

/**
 * The kaizen loop's own run rule (C4): open countermeasures that only rise mean the loop is not closing. Fires on three
 * consecutive rises (four releases, each higher than the one before). The counts are each release's `openCountermeasures`
 * (its latest run), releases without one left out. Without any there is nothing to count, and it says so.
 */
export function countermeasuresRising(counts: number[] | undefined, reason = NO_COUNTERMEASURES): Trends["runRules"]["countermeasures"] {
  if (!counts) return { status: "not measured", reason };
  const last = counts.slice(-(RUN_RULE_DECLINES + 1));
  const rising = last.length === RUN_RULE_DECLINES + 1 && last.every((x, i) => i === 0 || x > last[i - 1]!);
  return { status: "measured", rising, counts };
}

/** Each release's open countermeasures, oldest first; undefined when no line has recorded one. */
export function openCounts(lines: Pick<ScoreboardLine, "openCountermeasures">[]): number[] | undefined {
  const counts = lines.map((l) => l.openCountermeasures).filter((n): n is number => typeof n === "number");
  return counts.length ? counts : undefined;
}

// ---- self-health -------------------------------------------------------------------------------------------

/** Monday of the ISO week an instant falls in (UTC), as YYYY-MM-DD. */
export function weekOf(iso: string): string {
  const d = new Date(iso);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));
  return monday.toISOString().slice(0, 10);
}

export function selfHealth(mutants: MutantsPoint[], noise: HistoryEntry[] | undefined, now: Date, noiseReason = "no noise history (the local noise store, or the noise branch's noise-history.json)"): SelfHealth {
  const byWeek = new Map<string, MutantsPoint>();
  for (const m of [...mutants].sort((a, b) => a.ranAt.localeCompare(b.ranAt))) byWeek.set(weekOf(m.ranAt), m);
  const weeks = [...byWeek.entries()].map(([week, m]) => ({ week, ranAt: m.ranAt, caught: m.caught, total: m.total }));
  if (!noise?.length) return { mutants: weeks, noise: { status: "not measured", reason: noiseReason } };
  const nights = [...noise].sort((a, b) => a.ranAt.localeCompare(b.ranAt));
  const recent = nights.slice(-NOISE_WINDOW);
  const clean = recent.filter((e) => e.hunks === 0 && !e.degraded.length).length;
  // An A/A failure is a dirty A/A: a difference between two identical stacks. A degraded night is weak evidence, not a failure.
  const lastFailure = [...nights].reverse().find((e) => e.hunks > 0)?.ranAt ?? null;
  return {
    mutants: weeks,
    noise: { status: "measured", nights: recent.length, cleanNights: clean, cleanRate: Math.round((clean / recent.length) * 100) / 100, lastFailure, daysSinceLastFailure: lastFailure ? Math.floor((now.getTime() - Date.parse(lastFailure)) / DAY) : null, since: nights[0]!.ranAt }
  };
}

// ---- the views ------------------------------------------------------------------------------------------

const sumBy = <K>(pairs: [K, number][]) => {
  const m = new Map<K, number>();
  for (const [k, n] of pairs) m.set(k, (m.get(k) ?? 0) + n);
  return m;
};

export interface TrendsInputs {
  lines: ScoreboardLine[];
  mutants?: MutantsPoint[];
  noise?: HistoryEntry[];
  noiseReason?: string;
  countermeasures?: number[];
  countermeasuresReason?: string;
  now: Date;
}

export function trends(i: TrendsInputs): Trends {
  const releases = releasesOf(i.lines);
  const newest = releases.at(-1)?.latest.tag;
  const rcs: ReleasePoint[] = releases.map(({ latest: l, runs }, k) => ({ tag: l.tag, run: l.run, runs, date: l.date, gate: l.gate, rcs: l.rcs, band: l.band, weightsVersion: l.weightsVersion, weightsChanged: k > 0 && !!l.weightsVersion && !!releases[k - 1]!.latest.weightsVersion && l.weightsVersion !== releases[k - 1]!.latest.weightsVersion }));
  const dimensions = DIMENSIONS.map((spec) => ({
    id: spec.id,
    name: spec.name,
    points: releases.map(({ latest: l }) => {
      const d = l.dimensions.find((x) => x.id === spec.id);
      return { tag: l.tag, score: d?.score ?? null, status: d?.status ?? ("not measured" as const), floorBreached: d?.floorBreached ?? false };
    })
  }));

  // Hotspot recurrence: releases (not runs, not PRs) that touched each file.
  const withChanges = releases.filter(({ latest: l }) => l.prs !== null);
  const touched = new Map<string, string[]>();
  for (const { latest: l } of withChanges) for (const f of new Set(l.prs!.flatMap((p) => p.files))) touched.set(f, [...(touched.get(f) ?? []), l.tag]);
  const top = [...touched.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .slice(0, TOP_HOTSPOTS)
    .map(([file, tags]) => ({ file, releases: tags.length, tags, refactorCandidate: tags.length >= RULES.changeRisk.hotspotReleases }));

  // Per-file risk: the points each file's deductions cost, per release. Per contributor: the points of their PRs.
  const fileRows = new Map<string, Map<string, number>>();
  const authorRows = new Map<string, Map<string, number>>();
  for (const { latest: l } of withChanges) {
    for (const [file, n] of sumBy(l.prs!.flatMap((p) => p.deductions.filter((d) => d.file).map((d): [string, number] => [d.file!, d.points])))) fileRows.set(file, (fileRows.get(file) ?? new Map()).set(l.tag, n));
    for (const [author, n] of sumBy(l.prs!.filter((p) => p.author).map((p): [string, number] => [p.author!, p.points]))) authorRows.set(author, (authorRows.get(author) ?? new Map()).set(l.tag, n));
  }
  const rows = (m: Map<string, Map<string, number>>) =>
    [...m.entries()].map(([key, byTag]) => ({ key, total: [...byTag.values()].reduce((a, b) => a + b, 0), points: withChanges.map(({ latest: l }) => ({ tag: l.tag, points: byTag.get(l.tag) ?? 0 })) })).sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));

  const firings = [
    ...runRules("rcs", rcs.map((r) => ({ tag: r.tag, value: r.rcs, weightsVersion: r.weightsVersion })), newest),
    ...dimensions.flatMap((d) => runRules(d.id, d.points.map((p, k) => ({ tag: p.tag, value: p.score, weightsVersion: rcs[k]!.weightsVersion })), newest))
  ];

  return {
    schemaVersion: TRENDS_SCHEMA_VERSION,
    generatedAt: i.now.toISOString(),
    lines: i.lines.length,
    releases: releases.length,
    ...(releases.length ? {} : { empty: "no releases scored yet" }),
    views: {
      rcs,
      dimensions,
      masks: releases.map(({ latest: l }) => ({ tag: l.tag, masks: l.masks, neverFired: l.masksNeverFired?.length ?? null })),
      claims: releases.map(({ latest: l }) => ({ tag: l.tag, claims: l.claims, stale: l.staleClaims })),
      hotspots: { releasesWithChanges: withChanges.length, top },
      risk: {
        files: rows(fileRows).slice(0, TOP_RISK_FILES).map(({ key, ...r }) => ({ file: key, ...r })),
        contributors: { note: CONTRIBUTOR_NOTE, rows: rows(authorRows).map(({ key, ...r }) => ({ author: key, ...r })) }
      }
    },
    runRules: { firings, current: firings.filter((f) => f.current), countermeasures: countermeasuresRising(i.countermeasures ?? openCounts(releases.map((r) => r.latest)), i.countermeasuresReason) },
    deviations: releases.filter((r) => r.runs > 1).map((r) => ({ tag: r.latest.tag, runs: r.runs, firstRcs: r.first.rcs, latestRcs: r.latest.rcs })),
    selfHealth: selfHealth(i.mutants ?? [], i.noise, i.now, i.noiseReason)
  };
}
