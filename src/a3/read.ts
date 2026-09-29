/**
 * The A3 Aggregator's inputs, read from what the pages workflow has already put together: the site directory with each
 * stream's reports/index.json and kept reports beside it, the noise history, the kaizen register and, when it was
 * fetched, the GitHub snapshot. A file that is missing or unreadable is left out, never made up; the A3 says what it
 * could not read.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Changes } from "../changes/signals.ts";
import type { Confidence } from "../score/confidence.ts";
import type { RunReport } from "../types.ts";
import { parseWhy } from "../why/format.ts";
import { entryOf, whyFiles } from "../why/register.ts";
import type { GithubSnapshot } from "./github.ts";
import { STREAMS, type A3Inputs, type KaizenFile, type KeptRun, type NoiseNight, type Stream } from "./model.ts";

function json<T>(file: string): T | undefined {
  try {
    return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : undefined;
  } catch {
    return undefined;
  }
}

interface IndexRun {
  id: string;
  ranAt: string;
  verdict: string;
  reasons?: string[];
  harnessVersion?: string;
  runUrl?: string;
  sides?: KeptRun["sides"];
  score?: { score: number; grade: string } | null;
  files?: string[];
}

/** Every kept run of every stream under `site`, each with its report, confidence.json and changes.json when kept. */
export function readRuns(site: string): KeptRun[] {
  const out: KeptRun[] = [];
  for (const stream of STREAMS as Stream[]) {
    const base = join(site, stream, "reports");
    const index = json<{ runs?: IndexRun[] }>(join(base, "index.json"));
    for (const r of index?.runs ?? []) {
      if (!r?.id || !/^[A-Za-z0-9._-]+$/.test(r.id)) continue;
      const file = (name: string) => (r.files ?? []).find((f) => f === `${r.id}/${name}`);
      const at = <T>(name: string) => (file(name) ? json<T>(join(base, file(name)!)) : undefined);
      const report = at<RunReport>("report.json");
      const confidence = at<Confidence>("confidence.json");
      const changes = at<Changes>("changes.json");
      out.push({
        stream,
        id: r.id,
        ranAt: r.ranAt,
        verdict: String(r.verdict ?? ""),
        reasons: Array.isArray(r.reasons) ? r.reasons.map(String) : [],
        harnessVersion: String(r.harnessVersion ?? ""),
        ...(r.runUrl ? { runUrl: r.runUrl } : {}),
        ...(r.sides ? { sides: r.sides } : {}),
        dir: `${stream}/reports/${r.id}`,
        score: r.score ?? null,
        ...(report?.compare ? { report } : {}),
        ...(confidence?.dimensions ? { confidence } : {}),
        ...(changes?.prs ? { changes } : {})
      });
    }
  }
  return out;
}

export function readNoise(file: string | undefined): NoiseNight[] | undefined {
  if (!file) return undefined;
  const h = json<{ entries?: NoiseNight[] }>(file);
  return Array.isArray(h?.entries) ? h.entries.map((e) => ({ ranAt: e.ranAt, hunks: Number(e.hunks ?? 0), degraded: Array.isArray(e.degraded) ? e.degraded : [], harnessVersion: String(e.harnessVersion ?? ""), ...(e.masks ? { masks: e.masks } : {}) })) : undefined;
}

export function readKaizen(dir: string): KaizenFile[] {
  return whyFiles(dir).map((file) => {
    const text = readFileSync(join(dir, file), "utf8");
    return { file, why: parseWhy(text), entry: entryOf(file, text) };
  });
}

export function readScoreboardReleases(file: string | undefined): number | undefined {
  if (!file || !existsSync(file)) return undefined;
  const tags = new Set<string>();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const t = (JSON.parse(line) as { tag?: string }).tag;
      if (t) tags.add(t);
    } catch {
      // a line the scoreboard's own guard would refuse is not counted here either
    }
  }
  return tags.size;
}

export function readInputs(o: { site: string; kaizen: string; noiseHistory?: string; scoreboard?: string; github?: GithubSnapshot; now: Date; harness: string }): A3Inputs {
  const noise = readNoise(o.noiseHistory ?? join(o.site, "noise", "noise-history.json"));
  const releases = readScoreboardReleases(o.scoreboard);
  return {
    now: o.now,
    harness: o.harness,
    runs: readRuns(o.site),
    ...(noise ? { noise } : {}),
    kaizen: readKaizen(o.kaizen),
    ...(o.github ? { github: o.github } : {}),
    ...(releases !== undefined ? { scoreboardReleases: releases } : {})
  };
}
