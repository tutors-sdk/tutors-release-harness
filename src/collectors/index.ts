import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import type { Journey } from "../../traffic/journeys/journeys.ts";
import { serviceLogs, serviceName } from "../stack.ts";
import type { JourneyCapture, LogSummary, MetricsSnapshot, SideCapture, SideSpec } from "../types.ts";
import { captureJourney } from "./browser.ts";
import { summariseLogs } from "./logs.ts";
import { fetchMetrics } from "./metrics.ts";

export interface CaptureOptions {
  outDir: string;
  now: string;
  runs: number;
  screenshots: boolean;
  axe: boolean;
  /** Needed to read container logs; absent when capturing a stack the harness did not start. */
  logsFrom?: { a: SideSpec; b: SideSpec };
  log: (message: string) => void;
}

const APPS = ["reader", "catalogue", "live"] as const;

async function metricsFor(spec: SideSpec): Promise<Record<string, MetricsSnapshot>> {
  const out: Record<string, MetricsSnapshot> = {};
  for (const app of APPS) {
    try {
      out[app] = await fetchMetrics(spec.urls[app]);
    } catch (e) {
      out[app] = { series: {} };
      // A missing endpoint is itself a finding: with no series, every series the other side has is "missing".
      void e;
    }
  }
  return out;
}

/**
 * Capture everything for one side: metrics before, every journey `runs`
 * times, metrics after, then the containers' logs. Writes `capture.json` and
 * the screenshots under `outDir`.
 */
export async function captureSide(spec: SideSpec, journeys: Journey[], opts: CaptureOptions): Promise<SideCapture> {
  const sideDir = join(opts.outDir, spec.name);
  mkdirSync(sideDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const before = await metricsFor(spec);
  const browser = await chromium.launch();
  const captured: JourneyCapture[] = [];
  try {
    for (let run = 1; run <= opts.runs; run += 1) {
      for (const journey of journeys) {
        opts.log(`  ${spec.name}: ${journey.name} (run ${run}/${opts.runs})`);
        const result = await captureJourney(browser, spec, journey, run, { outDir: sideDir, now: opts.now, screenshots: opts.screenshots && run === 1, axe: opts.axe && run === 1 });
        if (result.error) opts.log(`    failed: ${result.error}`);
        captured.push(result);
      }
    }
  } finally {
    await browser.close();
  }
  const after = await metricsFor(spec);

  const logs: Record<string, LogSummary> = {};
  if (opts.logsFrom) {
    for (const app of APPS) {
      try {
        logs[app] = summariseLogs(serviceLogs(serviceName(spec.name, app), startedAt, opts.logsFrom.a, opts.logsFrom.b, opts.now));
      } catch (e) {
        opts.log(`    could not read logs for ${app}-${spec.name}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  const capture: SideCapture = { side: spec.name, images: spec.images, capturedAt: new Date().toISOString(), journeys: captured, metrics: { before, after }, logs };
  writeFileSync(join(sideDir, "capture.json"), JSON.stringify(capture, null, 2));
  return capture;
}
