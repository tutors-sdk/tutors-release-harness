import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { COMPOSE_NETWORK, ROOT, docker } from "../stack.ts";
import type { LoadSummary } from "../types.ts";

export interface LoadOptions {
  /** Base URL as seen from inside the compose network, e.g. http://reader-a:3000, or an external URL. */
  base: string;
  courseId: string;
  rate: number;
  duration: string;
  /** Directory the k6 output lands in. */
  outDir: string;
  /** Join the compose network (needed for service names); off for external targets. */
  onNetwork: boolean;
  maxSamples?: number;
  log: (m: string) => void;
}

const K6_IMAGE = process.env.HARNESS_K6_IMAGE ?? "grafana/k6:latest";

/** Turn a Windows path into the form Docker Desktop accepts in -v. */
function mountPath(p: string): string {
  return resolve(p).replaceAll("\\", "/");
}

/**
 * Run traffic/load/reader.js with k6 in a container and summarise the per-request
 * samples it exports. k6 is a container, not a dependency: the same image runs
 * on a laptop and in CI.
 */
export function runLoad(opts: LoadOptions): LoadSummary {
  mkdirSync(opts.outDir, { recursive: true });
  const jsonFile = join(opts.outDir, "k6.json");
  if (existsSync(jsonFile)) rmSync(jsonFile);
  const args = ["run", "--rm", "--user", "0"];
  if (opts.onNetwork) args.push("--network", COMPOSE_NETWORK);
  else args.push("--add-host", "host.docker.internal:host-gateway");
  args.push(
    "-v", `${mountPath(join(ROOT, "traffic", "load"))}:/scripts:ro`,
    "-v", `${mountPath(opts.outDir)}:/out`,
    K6_IMAGE, "run", "--quiet", "--no-color",
    "--out", "json=/out/k6.json",
    "--summary-export=/out/k6-summary.json",
    "-e", `BASE=${opts.base}`, "-e", `COURSE=${opts.courseId}`, "-e", `RATE=${opts.rate}`, "-e", `DURATION=${opts.duration}`,
    "/scripts/reader.js"
  );
  opts.log(`  k6: ${opts.rate} req/s for ${opts.duration} against ${opts.base}`);
  docker(args, { quiet: true });
  return summariseK6(readFileSync(jsonFile, "utf8"), opts.rate, opts.duration, opts.maxSamples ?? 2000);
}

/** Parse k6's JSON line output into a LoadSummary. Exported for tests. */
export function summariseK6(lines: string, rate: number, duration: string, maxSamples = 2000): LoadSummary {
  const durations: number[] = [];
  let requests = 0;
  let failed = 0;
  let serverErrors = 0;
  for (const line of lines.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let entry: { type: string; metric: string; data: { value: number; tags?: Record<string, string> } };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.type !== "Point") continue;
    if (entry.metric === "http_req_duration") {
      durations.push(entry.data.value);
      requests += 1;
      const status = Number(entry.data.tags?.status ?? 0);
      if (status >= 500 || status === 0) serverErrors += 1;
    } else if (entry.metric === "http_req_failed" && entry.data.value === 1) {
      failed += 1;
    }
  }
  const sorted = [...durations].sort((x, y) => x - y);
  const pct = (p: number) => (sorted.length ? Number(sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]!.toFixed(2)) : 0);
  const step = Math.max(1, Math.ceil(durations.length / maxSamples));
  return { requests, failed, serverErrors, samples: durations.filter((_, i) => i % step === 0), p50: pct(0.5), p95: pct(0.95), rate, duration };
}
