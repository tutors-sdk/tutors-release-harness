import { mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { hunkId, resetHunkIds } from "../compare/pages.ts";
import { COMPOSE_NETWORK, EDGE_URL, ROOT, docker, stackStop } from "../stack.ts";
import type { Hunk, SideSpec, UpgradeResult } from "../types.ts";

export interface UpgradeOptions {
  a: SideSpec;
  b: SideSpec;
  now: string;
  outDir: string;
  rate: number;
  /** Total load window in seconds; the switch happens a third of the way in, a's shutdown two thirds. */
  seconds: number;
  courseId: string;
  log: (m: string) => void;
}

const K6_IMAGE = process.env.HARNESS_K6_IMAGE ?? "grafana/k6:latest";

function mountPath(p: string): string {
  return p.replaceAll("\\", "/");
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Roll the candidate in under load, the way a rolling deployment does: traffic
 * enters through the edge, the candidate becomes an upstream while the old
 * version still serves, the edge switches, the old version stops. Every
 * request is attributed to the upstream that answered it, so a failure during
 * the rollout names its side.
 */
export async function runUpgrade(opts: UpgradeOptions): Promise<{ result: UpgradeResult; hunks: Hunk[] }> {
  resetHunkIds();
  const outDir = join(opts.outDir, "upgrade");
  mkdirSync(outDir, { recursive: true });
  const jsonFile = join(outDir, "k6.json");
  if (existsSync(jsonFile)) rmSync(jsonFile);

  const started = Date.now();
  // k6 in the background, against the edge by service name.
  const name = `tutors-harness-k6-upgrade`;
  docker(["rm", "-f", name], { quiet: true });
  docker(
    [
      "run", "-d", "--name", name, "--user", "0", "--network", COMPOSE_NETWORK,
      "-v", `${mountPath(join(ROOT, "traffic", "load"))}:/scripts:ro`,
      "-v", `${mountPath(outDir)}:/out`,
      K6_IMAGE, "run", "--quiet", "--no-color", "--out", "json=/out/k6.json",
      "-e", "BASE=http://edge:3000", "-e", `COURSE=${opts.courseId}`, "-e", `RATE=${opts.rate}`, "-e", `DURATION=${opts.seconds}s`,
      "/scripts/reader.js"
    ],
    { quiet: true }
  );
  opts.log(`  load running through the edge for ${opts.seconds}s at ${opts.rate} req/s`);

  const third = (opts.seconds * 1000) / 3;
  await sleep(third);
  opts.log("  switching the edge to b");
  const switchedAt = Date.now() - started;
  const switched = await fetch(`${EDGE_URL}/_harness/switch?to=b`, { method: "POST" });
  if (!switched.ok) throw new Error(`edge switch failed: ${switched.status}`);

  await sleep(third);
  opts.log("  stopping reader-a (the old version's pods going away)");
  stackStop("reader-a", opts.a, opts.b, opts.now);

  // Wait for k6 to finish.
  docker(["wait", name], { quiet: true });
  docker(["rm", "-f", name], { quiet: true });

  const result = summariseUpgrade(readFileSync(jsonFile, "utf8"), switchedAt, Date.now() - started);
  return { result, hunks: judgeUpgrade(result) };
}

/** Parse k6's JSON lines with the edge's x-harness-upstream attribution. Exported for tests. */
export function summariseUpgrade(lines: string, switchedAt: number, durationMs: number): UpgradeResult {
  const by: Record<string, { requests: number; failed: number; serverErrors: number; durations: number[] }> = {};
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
    const upstream = entry.data.tags?.upstream ?? "unknown";
    if (entry.metric === "edge_req_duration") {
      const bucket = (by[upstream] ??= { requests: 0, failed: 0, serverErrors: 0, durations: [] });
      bucket.requests += 1;
      bucket.durations.push(entry.data.value);
      requests += 1;
      const status = Number(entry.data.tags?.status ?? 0);
      if (status >= 500 || status === 0) {
        serverErrors += 1;
        bucket.serverErrors += 1;
      }
    } else if (entry.metric === "edge_req_failed" && entry.data.value === 1) {
      failed += 1;
      (by[upstream] ??= { requests: 0, failed: 0, serverErrors: 0, durations: [] }).failed += 1;
    }
  }
  const byUpstream: UpgradeResult["byUpstream"] = {};
  for (const [k, v] of Object.entries(by)) {
    const sorted = [...v.durations].sort((x, y) => x - y);
    byUpstream[k] = { requests: v.requests, failed: v.failed, serverErrors: v.serverErrors, p95: sorted.length ? Number(sorted[Math.floor(0.95 * (sorted.length - 1))]!.toFixed(1)) : 0 };
  }
  return { substrate: "compose", requests, failed, serverErrors, byUpstream, switchedAt, durationMs };
}

export function judgeUpgrade(result: UpgradeResult): Hunk[] {
  const hunks: Hunk[] = [];
  if (result.requests === 0) {
    hunks.push({ id: hunkId("upgrade", "load"), artefact: "upgrade", scope: "load", severity: "fail", summary: "the load generator made no requests; the rehearsal proved nothing" });
    return hunks;
  }
  const bad = result.failed + result.serverErrors;
  if (bad > 0) {
    const where = Object.entries(result.byUpstream)
      .filter(([, v]) => v.failed + v.serverErrors > 0)
      .map(([k, v]) => `${v.failed + v.serverErrors} via ${k}`)
      .join(", ");
    hunks.push({ id: hunkId("upgrade", "rollout"), artefact: "upgrade", scope: "rollout", severity: "fail", summary: `${bad} of ${result.requests} requests failed or returned 5xx during the rollout (${where})` });
  } else {
    hunks.push({ id: hunkId("upgrade", "rollout"), artefact: "upgrade", scope: "rollout", severity: "info", summary: `${result.requests} requests through the rollout, none failed; switched at ${(result.switchedAt / 1000).toFixed(1)}s` });
  }
  // Only the compose edge attributes requests to a side; on kind the kubelet does the switching.
  if (result.substrate === "compose" && (!result.byUpstream.b || result.byUpstream.b.requests === 0)) {
    hunks.push({ id: hunkId("upgrade", "b"), artefact: "upgrade", scope: "b", severity: "fail", summary: "no request was served by b: the switch did not take effect" });
  }
  return hunks;
}
