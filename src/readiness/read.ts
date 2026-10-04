/**
 * The readiness page's inputs, read from what the pages workflow has already put together: the `main-preview` branch's
 * reports/index.json and kept reports under the site, and github.json, the snapshot of workflow runs `harness a3
 * --fetch-github` wrote beside them. A file that is missing or unreadable is left out, never made up: a forecast whose
 * report.json cannot be read has no unclaimed count, and without github.json a night with nothing kept is "not known".
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GithubSnapshot, WorkflowRun } from "../a3/github.ts";
import { QUALITY_FILE, parseQualityRecord } from "../a3/quality.ts";
import type { ReportDelta } from "../report/delta.ts";
import type { RunReport } from "../types.ts";
import { claimsView } from "./claims.ts";
import { parseReleaseHistory, type ReleaseHistory } from "./releases.ts";
import { SOAK_CHECKS, policyFacts, type AaNight } from "./soak.ts";
import { MAIN_TO_RC, REHEARSALS, STREAM_DIR, type KeptForecast, type Rehearsal } from "./model.ts";

function json<T>(file: string): T | undefined {
  try {
    return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : undefined;
  } catch {
    return undefined;
  }
}

interface IndexRun {
  id?: string;
  mode?: string;
  ranAt?: string;
  verdict?: string;
  harnessVersion?: string;
  runUrl?: string;
  sides?: KeptForecast["sides"];
  confidence?: { gate?: string };
  delta?: ReportDelta;
  files?: string[];
}

/** Since 1.21.0: a kept report's informing results no claim covers, and (since 1.22.0) how many by engine. */
function informingOf(matches: NonNullable<RunReport["compare"]>["matches"]): { informing: number; informingBy: Record<string, number> } {
  const open = matches.filter((m) => m?.hunk?.level === "informing" && !m.claim);
  const informingBy: Record<string, number> = {};
  for (const m of open) informingBy[m.hunk.artefact] = (informingBy[m.hunk.artefact] ?? 0) + 1;
  return { informing: open.length, informingBy };
}

/** Every kept Main to RC release run under `<site>/main-preview/reports`, with what its report.json and rehearsals say. */
export function readForecasts(site: string): KeptForecast[] {
  const base = join(site, STREAM_DIR);
  const index = json<{ runs?: IndexRun[] }>(join(base, "index.json"));
  const out: KeptForecast[] = [];
  for (const r of index?.runs ?? []) {
    if (!r?.id || !/^[A-Za-z0-9._-]+$/.test(r.id) || r.mode !== "release" || !r.ranAt || !Number.isFinite(Date.parse(r.ranAt))) continue;
    const files = Array.isArray(r.files) ? r.files.map(String) : [];
    const at = <T>(path: string) => (files.includes(`${r.id}/${path}`) ? json<T>(join(base, r.id!, path)) : undefined);
    const report = at<Partial<RunReport>>("report.json");
    const images = report?.provenance?.b?.images;
    // Since 1.18.0: the monorepo's quality record kept beside it. Kept but not a record is null, never a guess.
    const quality = files.includes(`${r.id}/${QUALITY_FILE}`) ? (parseQualityRecord(at<unknown>(QUALITY_FILE)) ?? null) : undefined;
    // Since 1.19.0: the PRs since production its changes.json counts, for the control chart's night-by-night run.
    const changes = at<{ refs?: { a?: string }; a?: string; prs?: { pr?: number | null; release?: boolean }[] }>("changes.json");
    const unreleased = Array.isArray(changes?.prs) ? { prs: changes.prs.filter((p) => typeof p?.pr === "number" && !p.release).length, base: String(changes.refs?.a ?? changes.a ?? "") } : undefined;
    // Since 1.28.1: the known side beside the gaps, read from the same report.json.
    const claims = claimsView(report, String(r.harnessVersion ?? ""));
    const rehearsals: Partial<Record<Rehearsal, string>> = {};
    for (const mode of REHEARSALS) {
      const v = at<Partial<RunReport>>(`${mode}/report.json`)?.verdict;
      if (typeof v === "string") rehearsals[mode] = v;
    }
    out.push({
      id: r.id,
      ranAt: r.ranAt,
      verdict: String(r.verdict ?? ""),
      harnessVersion: String(r.harnessVersion ?? ""),
      ...(r.runUrl ? { runUrl: r.runUrl } : {}),
      ...(r.sides ? { sides: r.sides } : {}),
      ...(typeof r.confidence?.gate === "string" ? { gate: r.confidence.gate } : {}),
      ...(r.delta && typeof r.delta === "object" ? { delta: r.delta } : {}),
      files,
      ...(Array.isArray(report?.compare?.unclaimed) ? { unclaimed: report.compare.unclaimed.length } : {}),
      ...(claims ? { claims } : {}),
      // Since 1.21.0: a report that records its engine levels says what its informing engines found; an older one is not counted.
      ...(report?.levels && Array.isArray(report.compare?.matches) ? informingOf(report.compare.matches) : {}),
      ...(images ? { images: Object.fromEntries(Object.entries(images).map(([app, i]) => [app, { ...(i?.revision ? { revision: i.revision } : {}), ...(i?.digest ? { digest: i.digest } : {}) }])) } : {}),
      ...(Object.keys(rehearsals).length ? { rehearsals } : {}),
      ...(report?.compare ? { report: { ...(report.ranAt ? { ranAt: report.ranAt } : {}), compare: report.compare, ...(report.load ? { load: report.load } : {}), ...(report.noise ? { noise: report.noise } : {}), ...(report.provenance ? { provenance: report.provenance } : {}) } } : {}),
      ...(quality !== undefined ? { quality } : {}),
      ...(unreleased ? { unreleased } : {}),
      // Since 1.25.0, for the soak: the in-run noise this forecast measured, and what each policy check found on b.
      ...(Array.isArray(report?.inRunNoise?.hunks) ? { a2Hunks: report.inRunNoise.hunks.length } : {}),
      ...(Array.isArray(report?.compare?.matches) && report.compare.hunks?.some((h) => SOAK_CHECKS.includes(h.artefact)) ? { policy: policyFacts(report.compare.matches) } : {})
    });
  }
  return out;
}

/**
 * Main to RC's runs from a GitHub snapshot: the runs, and a line saying what was read. `undefined` runs when the file is
 * missing, unreadable, or GitHub did not answer for the workflow (so a quiet night cannot be told from a missing one).
 */
export function readWorkflowRuns(file: string): { runs?: WorkflowRun[]; github: string } {
  if (!existsSync(file)) return { github: "not read (no github.json: the pages were built without harness a3 --fetch-github)" };
  const g = json<Partial<GithubSnapshot>>(file);
  if (!g || typeof g !== "object") return { github: "not read (github.json is not JSON)" };
  const runs = g.workflows?.[MAIN_TO_RC];
  if (!Array.isArray(runs)) return { github: `read ${g.fetchedAt ?? "?"}, but GitHub did not answer for ${MAIN_TO_RC}` };
  return { runs, github: `read ${g.fetchedAt ?? "?"}` };
}

/** The release history (releases.json) and a line saying what was read; undefined history when missing or not one. */
export function readReleaseHistory(file: string): { history?: ReleaseHistory; source: string } {
  if (!existsSync(file)) return { source: "not read (no releases.json: the pages were built without harness readiness --fetch-releases)" };
  const h = parseReleaseHistory(json<unknown>(file));
  if (!h) return { source: "not read (releases.json is not a release history)" };
  return { history: h, source: `read ${h.fetchedAt || "?"}${h.errors.length ? `; GitHub did not answer everything: ${h.errors.join("; ")}` : ""}` };
}

/** Since 1.25.0, for the soak: the nightly A/As from noise-history.json, and a line saying what was read. */
export function readAaNights(file: string): { aa?: AaNight[]; source: string } {
  if (!existsSync(file)) return { source: "not read (no noise-history.json in the site: the pages were built without the noise branch)" };
  const h = json<{ entries?: unknown }>(file);
  if (!h || !Array.isArray(h.entries)) return { source: "not read (noise-history.json has no entries)" };
  const aa = h.entries.flatMap((e: unknown) => {
    const o = e as { ranAt?: unknown; hunks?: unknown; degraded?: unknown };
    return typeof o?.ranAt === "string" && Number.isFinite(Date.parse(o.ranAt)) && typeof o.hunks === "number" ? [{ ranAt: o.ranAt, hunks: o.hunks, degraded: Array.isArray(o.degraded) ? o.degraded.map(String) : [] }] : [];
  });
  return { aa, source: `read, ${aa.length} A/A(s)` };
}
