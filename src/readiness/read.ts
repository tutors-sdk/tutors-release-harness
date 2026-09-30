/**
 * The readiness page's inputs, read from what the pages workflow has already put together: the `main-preview` branch's
 * reports/index.json and kept reports under the site, and github.json, the snapshot of workflow runs `harness a3
 * --fetch-github` wrote beside them. A file that is missing or unreadable is left out, never made up: a forecast whose
 * report.json cannot be read has no unclaimed count, and without github.json a night with nothing kept is "not known".
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GithubSnapshot, WorkflowRun } from "../a3/github.ts";
import type { ReportDelta } from "../report/delta.ts";
import type { RunReport } from "../types.ts";
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
      ...(images ? { images: Object.fromEntries(Object.entries(images).map(([app, i]) => [app, { ...(i?.revision ? { revision: i.revision } : {}), ...(i?.digest ? { digest: i.digest } : {}) }])) } : {}),
      ...(Object.keys(rehearsals).length ? { rehearsals } : {})
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
