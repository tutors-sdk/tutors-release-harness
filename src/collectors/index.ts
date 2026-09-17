import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Journey } from "../../traffic/journeys/journeys.ts";
import { serviceLogs, serviceName } from "../stack.ts";
import type { JourneyCapture, LogSummary, MetricsSnapshot, SideCapture, SideSpec } from "../types.ts";
import { captureJourney, launchBrowser } from "./browser.ts";
import { runLoad } from "./load.ts";
import { summariseLogs } from "./logs.ts";
import { fetchMetrics } from "./metrics.ts";
import { fetchWrites, resetWrites } from "./persistence.ts";

export interface CaptureOptions {
  outDir: string;
  now: string;
  runs: number;
  screenshots: boolean;
  axe: boolean;
  focusStops: number;
  /** Needed to read container logs; absent when capturing a stack the harness did not start. */
  logsFrom?: { a: SideSpec; b: SideSpec };
  /** k6 against the side's reader after the journeys. */
  load?: { rate: number; duration: string };
  log: (message: string) => void;
}

const APPS = ["reader", "catalogue", "live"] as const;

async function metricsFor(spec: SideSpec): Promise<Record<string, MetricsSnapshot>> {
  const out: Record<string, MetricsSnapshot> = {};
  for (const app of APPS) {
    try {
      out[app] = await fetchMetrics(spec.urls[app]);
    } catch {
      // A missing endpoint is itself a finding: with no series, every series the other side has is "missing".
      out[app] = { series: {} };
    }
  }
  return out;
}

/**
 * Capture everything for one side: metrics before, every journey `runs`
 * times (with the persistence stub reset before and read after each), metrics
 * after, the containers' logs, and optionally a k6 run. Writes `capture.json`
 * and the screenshots under `outDir`.
 */
export async function captureSide(spec: SideSpec, journeys: Journey[], opts: CaptureOptions): Promise<SideCapture> {
  const sideDir = join(opts.outDir, spec.name);
  mkdirSync(sideDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const before = spec.external ? {} : await metricsFor(spec);
  const browser = await launchBrowser();
  const captured: JourneyCapture[] = [];
  try {
    for (let run = 1; run <= opts.runs; run += 1) {
      for (const journey of journeys) {
        if (journey.target === "readerAuth" && !spec.urls.readerAuth) {
          opts.log(`  ${spec.name}: ${journey.name} skipped (no signed-in reader on this side)`);
          continue;
        }
        opts.log(`  ${spec.name}: ${journey.name} (run ${run}/${opts.runs})`);
        const stub = spec.urls.persistence;
        if (stub) await resetWrites(stub);
        const result = await captureJourney(browser, spec, journey, run, {
          outDir: sideDir,
          now: opts.now,
          screenshots: opts.screenshots && run === 1,
          axe: opts.axe && run === 1,
          focusStops: run === 1 ? opts.focusStops : 0
        });
        if (stub) result.persistence = await fetchWrites(stub);
        if (result.error) opts.log(`    failed: ${result.error}`);
        captured.push(result);
      }
    }
  } finally {
    await browser.close();
  }
  const after = spec.external ? {} : await metricsFor(spec);

  const logs: Record<string, LogSummary> = {};
  if (opts.logsFrom && !spec.external) {
    for (const app of [...APPS, "reader-auth"] as const) {
      try {
        logs[app] = summariseLogs(serviceLogs(serviceName(spec.name, app), startedAt, opts.logsFrom.a, opts.logsFrom.b, opts.now));
      } catch (e) {
        opts.log(`    could not read logs for ${app}-${spec.name}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  const capture: SideCapture = { side: spec.name, images: spec.images, capturedAt: new Date().toISOString(), journeys: captured, metrics: { before, after }, logs, ...(spec.external ? { external: true } : {}) };
  if (opts.load) {
    capture.load = runLoad({
      base: spec.external ? spec.urls.reader : `http://reader-${spec.name}:3000`,
      courseId: spec.urls.courseId,
      rate: opts.load.rate,
      duration: opts.load.duration,
      outDir: join(sideDir, "load"),
      onNetwork: !spec.external,
      log: opts.log
    });
  }
  writeFileSync(join(sideDir, "capture.json"), JSON.stringify(capture, null, 2));
  return capture;
}
