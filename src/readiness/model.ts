/**
 * The overnight readiness page (since 1.17.0): one row per calendar night (UTC) for the last ten nights, newest on top,
 * built from what the `main-preview` branch keeps and what GitHub says about the Main to RC workflow. A reader picks a
 * night to cut a release from by reading two rows: what the later one added, and whether its Gate moved.
 *
 * A night is one of:
 *   judged       a forecast was kept that night: its commit, Gate, unclaimed count and delta, with links to the kept
 *                report and its rehearsals (more than one run that night: the newest leads, the others follow it)
 *   unchanged    Main to RC ran and finished green but kept nothing: `harness preview resolve` skipped a pair it had
 *                already judged, so the row repeats the verdict of the forecast it skipped to, in grey
 *   not judged   Main to RC ran and failed or was cancelled, and kept nothing
 *   running      a Main to RC run of that night has not finished
 *   not yet      tonight, before any run
 *   did not run  no Main to RC run that night
 *   not known    no forecast kept and the workflow history was not read (no github.json): never guessed
 *
 * The band stays off the row: while the review floor caps the score at 74 the band is Red on any night the Gate passes,
 * so it would say nothing a night-to-night reader can act on. The Gate is what the row carries.
 *
 * Pure: src/readiness/read.ts reads the files, src/readiness/render.ts draws the page. Advisory like the A3: nothing
 * here is an input to the Gate, a verdict or an exit code.
 */
import type { WorkflowRun } from "../a3/github.ts";
import { qualityOf, type QualityInputs, type QualityRecord, type QualityStrip, type WeeklyMutants } from "../a3/quality.ts";
import type { ReportDelta } from "../report/delta.ts";
import { buildControl, type Control } from "./control.ts";
import type { ReleaseHistory } from "./releases.ts";

export const READINESS_SCHEMA_VERSION = 1 as const;
/** Calendar nights on the page, tonight included. */
export const NIGHTS = 10;
export const MONOREPO_COMMIT = "https://github.com/tutors-sdk/tutors-mono-repo/commit/";
/** Where the kept forecasts sit under the site. */
export const STREAM_DIR = "main-preview/reports";
export const MAIN_TO_RC = "main-preview.yml";
const DAY_MS = 86_400_000;

/** A kept Main to RC forecast, as read from the branch: its index entry and what its kept report.json says. */
export interface KeptForecast {
  id: string;
  ranAt: string;
  verdict: string;
  harnessVersion: string;
  runUrl?: string;
  sides?: { a?: Record<string, string>; b?: Record<string, string> };
  /** The Gate from the index entry's confidence headline (since 1.13.1); absent on a run kept before the score. */
  gate?: string;
  /** The index entry's delta (since 1.16.1); absent on a run kept before it. */
  delta?: ReportDelta;
  files: string[];
  /** From the kept report.json, when it could be read. */
  unclaimed?: number;
  /** Since 1.21.0: the kept report.json's informing results no claim covers; absent when it was kept before engine levels. */
  informing?: number;
  /** Since 1.22.0: the same, by engine (the policy family's checks among them); absent with `informing`. */
  informingBy?: Record<string, number>;
  /** Side b's images: the commit each was built from and its digest. */
  images?: Record<string, { revision?: string; digest?: string }>;
  /** The kept rehearsals' verdicts (since 1.16.0), by mode, when their report.json could be read. */
  rehearsals?: Partial<Record<Rehearsal, string>>;
  /** Since 1.18.0: what the quality strip reads of the kept report.json, when it could be read. */
  report?: QualityInputs["report"];
  /** Since 1.18.0: the monorepo's quality record kept beside it; null when kept and not a record. */
  quality?: QualityRecord | null;
  /** Since 1.19.0: the PRs since production its kept changes.json counts (release/* and direct commits left out). */
  unreleased?: { prs: number; base: string };
}

export type Rehearsal = "migration" | "upgrade";
export const REHEARSALS: readonly Rehearsal[] = ["migration", "upgrade"];

export interface ReadinessInputs {
  now: Date;
  harness: string;
  forecasts: KeptForecast[];
  /** Main to RC's runs from github.json (`workflows["main-preview.yml"]`); undefined when it was not read. */
  workflowRuns?: WorkflowRun[];
  /** What github.json said about itself: when it was fetched, or why it was not read. */
  github: string;
  /** Since 1.18.0: the harness's weekly mutants self-tests (mutants.jsonl); undefined when not read. */
  mutants?: WeeklyMutants[];
  /** Since 1.19.0: the monorepo's release sizes (releases.json); undefined when not read. */
  releases?: ReleaseHistory;
  /** What releases.json said about itself: when it was fetched, or why it was not read. */
  releasesSource?: string;
}

export interface Forecast {
  id: string;
  ranAt: string;
  harnessVersion: string;
  runUrl?: string;
  /** Side a's reader tag: production, the baseline the forecast was judged beside. */
  baseline: string;
  /** Side b's reader tag (`sha-<short>`). */
  candidate: string;
  /** The full commit side b was built from, when every image agrees on one; null when the report does not say. */
  commit: string | null;
  commitUrl: string | null;
  /** Side b's image digests, by app: what to pull to cut a release from this night. */
  digests: Record<string, string>;
  /** The Gate (confidence.json's), or the verdict in capitals for a forecast kept before the score. */
  gate: string;
  verdict: string;
  unclaimed: number | null;
  /** Since 1.21.0: informing results no claim covers (reported, never gates); null for a forecast kept before engine levels. */
  informing: number | null;
  /** Since 1.22.0: `informing` by engine, e.g. `{ "vuln-ceiling": 3 }`; absent when `informing` is null or 0. */
  informingBy?: Record<string, number>;
  /** New and gone since the previous forecast beside the same baseline; null when it was kept before 1.16.1. */
  delta: ReportDelta | null;
  links: { report?: string; rehearsals: { mode: Rehearsal; href: string; verdict: string | null }[] };
  /** Since 1.18.0: Speed, Metrics and Tests, as the A3 draws them under its Gate (src/a3/quality.ts). */
  quality: QualityStrip;
}

export type NightState = "judged" | "unchanged" | "not judged" | "running" | "not yet" | "did not run" | "not known";

export interface Night {
  /** The UTC date, YYYY-MM-DD. */
  night: string;
  state: NightState;
  /** The forecasts kept that night, newest first; only on a judged night. */
  forecasts: Forecast[];
  /** On an unchanged night: the forecast whose verdict it repeats. */
  since?: { id: string; night: string; candidate: string; commit: string | null; gate: string; baseline: string };
  /** Main to RC's runs that night, newest first; empty when there were none or the history was not read. */
  runs: { url: string; conclusion: string | null; event: string; createdAt: string }[];
  /** Production moved between this row and the judged row below it: two baselines are never compared. */
  baselineMoved?: { from: string; to: string };
  /** One sentence for the row. */
  note: string;
}

export interface Readiness {
  schemaVersion: typeof READINESS_SCHEMA_VERSION;
  builtAt: string;
  harness: string;
  nights: Night[];
  /** Since 1.19.0: the release-size control chart and the WIP limit on what is waiting on main (src/readiness/control.ts). */
  control: Control;
  sources: { forecasts: number; github: string };
}

// ---- helpers -------------------------------------------------------------------------------------------

export const tagOf = (ref?: string) => (ref ? (ref.split("@")[0]!.split(":").pop() ?? "") : "");
export const nightOf = (iso: string) => new Date(Date.parse(iso)).toISOString().slice(0, 10);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The last `n` UTC dates up to and including `now`'s, newest first. */
export function nightsUpTo(now: Date, n = NIGHTS): string[] {
  const today = Date.parse(now.toISOString().slice(0, 10));
  return Array.from({ length: n }, (_, i) => new Date(today - i * DAY_MS).toISOString().slice(0, 10));
}

/** The one commit side b's images were built from, or null when they disagree or do not say. */
function commitOf(images: KeptForecast["images"]): string | null {
  const revs = new Set(Object.values(images ?? {}).map((i) => i.revision).filter((r): r is string => !!r && /^[0-9a-f]{7,40}$/.test(r)));
  return revs.size === 1 ? [...revs][0]! : null;
}

export function forecastOf(k: KeptForecast, mutants?: WeeklyMutants[]): Forecast {
  const commit = commitOf(k.images);
  const file = (path: string) => (k.files.includes(`${k.id}/${path}`) ? `${STREAM_DIR}/${k.id}/${path}` : undefined);
  const digests = Object.fromEntries(Object.entries(k.images ?? {}).flatMap(([app, i]) => (i.digest ? [[app, i.digest]] : [])));
  const report = file("report.html");
  return {
    id: k.id,
    ranAt: k.ranAt,
    harnessVersion: k.harnessVersion,
    ...(k.runUrl ? { runUrl: k.runUrl } : {}),
    baseline: tagOf(k.sides?.a?.reader),
    candidate: tagOf(k.sides?.b?.reader),
    commit,
    commitUrl: commit && commit.length === 40 ? `${MONOREPO_COMMIT}${commit}` : null,
    digests,
    gate: k.gate ?? k.verdict.toUpperCase(),
    verdict: k.verdict,
    unclaimed: k.unclaimed ?? null,
    informing: k.informing ?? null,
    ...(k.informing && k.informingBy ? { informingBy: k.informingBy } : {}),
    delta: k.delta ?? null,
    links: {
      ...(report ? { report } : {}),
      rehearsals: REHEARSALS.flatMap((mode) => {
        const href = file(`${mode}/report.html`);
        return href ? [{ mode, href, verdict: k.rehearsals?.[mode]?.toUpperCase() ?? null }] : [];
      })
    },
    quality: qualityOf({ ...(k.report ? { report: k.report } : {}), ...(k.quality !== undefined ? { record: k.quality } : {}), ...(mutants ? { mutants } : {}), dir: `${STREAM_DIR}/${k.id}` })
  };
}

/** "+11 / −5", "first beside 16.2.2", or "not counted" for a forecast kept before 1.16.1. */
export function deltaWords(d: ReportDelta | null): string {
  if (!d) return "not counted";
  if (!d.against) return `first beside ${d.baseline}`;
  return `+${d.new ?? 0} / −${d.gone ?? 0}`;
}

// ---- the page ------------------------------------------------------------------------------------------

export function buildReadiness(i: ReadinessInputs): Readiness {
  const nights = nightsUpTo(i.now);
  const today = nights[0]!;
  const forecasts = i.forecasts.map((k) => forecastOf(k, i.mutants)).sort((x, y) => Date.parse(y.ranAt) - Date.parse(x.ranAt));
  const runs = [...(i.workflowRuns ?? [])].sort((x, y) => Date.parse(y.createdAt) - Date.parse(x.createdAt));
  const rows: Night[] = nights.map((night) => {
    const kept = forecasts.filter((f) => nightOf(f.ranAt) === night);
    const those = runs.filter((r) => r.createdAt && nightOf(r.createdAt) === night).map((r) => ({ url: r.url, conclusion: r.conclusion, event: r.event, createdAt: r.createdAt }));
    const base = { night, runs: those };
    if (kept.length) {
      const lead = kept[0]!;
      const more = kept.length > 1 ? `, and ${plural(kept.length - 1, "earlier run")} that night` : "";
      return { ...base, state: "judged", forecasts: kept, note: `Main ${lead.candidate || "?"} judged beside ${lead.baseline || "?"}: Gate ${lead.gate}${lead.unclaimed === null ? "" : `, ${plural(lead.unclaimed, "unclaimed difference")}`}${more}.` };
    }
    if (i.workflowRuns === undefined) return { ...base, state: "not known", forecasts: [], note: "No forecast kept, and the workflow history does not say whether Main to RC ran (the footer says why)." };
    if (those.some((r) => r.conclusion === null)) return { ...base, state: "running", forecasts: [], note: "Main to RC is running." };
    if (those.some((r) => r.conclusion === "success")) {
      // Finished green and kept nothing: resolve skipped a pair already judged. The verdict is the newest kept before it.
      const end = Math.max(...those.filter((r) => r.conclusion === "success").map((r) => Date.parse(r.createdAt)));
      const prior = forecasts.find((f) => Date.parse(f.ranAt) <= end);
      if (prior)
        return {
          ...base,
          state: "unchanged",
          forecasts: [],
          since: { id: prior.id, night: nightOf(prior.ranAt), candidate: prior.candidate, commit: prior.commit, gate: prior.gate, baseline: prior.baseline },
          note: `Unchanged since ${prior.candidate} (${nightOf(prior.ranAt)}): main and production were the pair already judged, so nothing new was kept. Gate ${prior.gate} as then.`
        };
      return { ...base, state: "unchanged", forecasts: [], note: "Main to RC finished and kept nothing, and no earlier forecast is kept to say what it repeated." };
    }
    if (those.length) return { ...base, state: "not judged", forecasts: [], note: `Main to RC ran and did not judge (${[...new Set(those.map((r) => r.conclusion))].join(", ")}): nothing was kept.` };
    if (night === today) return { ...base, state: "not yet", forecasts: [], note: "Not run yet tonight." };
    return { ...base, state: "did not run", forecasts: [], note: "Main to RC did not run." };
  });
  // Production moved: mark the row where the baseline changed from the judged row below it.
  let below: string | undefined;
  for (let n = rows.length - 1; n >= 0; n--) {
    const row = rows[n]!;
    const baseline = row.forecasts.at(-1)?.baseline ?? row.since?.baseline;
    if (!baseline) continue;
    if (below && below !== baseline) row.baselineMoved = { from: below, to: baseline };
    below = row.forecasts[0]?.baseline ?? baseline;
  }
  const inWindow = new Set(nights);
  return {
    schemaVersion: READINESS_SCHEMA_VERSION,
    builtAt: i.now.toISOString(),
    harness: i.harness,
    nights: rows,
    control: buildControl({
      ...(i.releases ? { history: i.releases } : {}),
      source: i.releasesSource ?? "not read",
      forecasts: i.forecasts.flatMap((k) => {
        if (!k.unreleased) return [];
        const f = forecastOf(k);
        return [{ ranAt: k.ranAt, prs: k.unreleased.prs, baseline: f.baseline || k.unreleased.base, candidate: f.candidate, head: f.commit }];
      })
    }),
    sources: { forecasts: forecasts.filter((f) => inWindow.has(nightOf(f.ranAt))).length, github: i.github }
  };
}
