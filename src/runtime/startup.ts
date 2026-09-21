import type { NotCollected, StartupCapture, StartupSample } from "../types.ts";
import type { Restarter } from "./targets.ts";
import { reasonOf } from "./tool.ts";

/**
 * Startup time (contract 1.2.0): how long each app takes from the start
 * command to its first healthy answer, sampled over N restarts of the same
 * container (or, under kind, N scale-to-zero-and-back cycles: a rollout would
 * leave the old pod answering).
 *
 * Two clocks, both from the moment the start command is issued:
 *   rootMs   the first response to GET / with a status below 500 (an app that
 *            answers 404 or a redirect is up; one that resets or 5xxs is not);
 *   readyMs  the orchestrator's verdict: compose's healthcheck says healthy, or
 *            the pod's Ready condition is true. Compose checks every 2 s
 *            (compose.harness.yaml), so this one is coarse by design; rootMs is
 *            the sensitive number.
 *
 * Warm starts: the image is already on the machine and the file cache is warm.
 * That is the case worth comparing (a cold pull measures the registry). The
 * harness never retries a slow restart; a noisy run is answered by more
 * restarts or a wider alpha (normalise/masks.yaml), as for timing.
 */

export const DEFAULT_RESTARTS = 5;
export const DEFAULT_TIMEOUT_MS = 60_000;
export const DEFAULT_POLL_MS = 100;

export interface StartupDeps {
  restarter: Restarter;
  restarts: number;
  timeoutMs?: number;
  pollMs?: number;
  /** GET the URL without following redirects; the status, or null when nothing answered. Never throws. */
  probe: (url: string) => Promise<number | null>;
  /** Monotonic milliseconds. */
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  log?: (m: string) => void;
}

/** One restart, timed. Exported for the tests. */
export async function sampleRestart(app: string, deps: StartupDeps): Promise<StartupSample> {
  const { restarter, probe, now, sleep } = deps;
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const pollMs = deps.pollMs ?? DEFAULT_POLL_MS;
  await restarter.down(app);
  const t0 = now();
  restarter.up(app);
  let rootMs: number | null = null;
  let rootStatus: number | null = null;
  let readyMs: number | null = null;
  const url = restarter.rootUrl(app);
  while (now() - t0 < timeoutMs) {
    if (rootMs === null) {
      const status = await probe(url);
      if (status !== null && status < 500) {
        rootMs = Math.round(now() - t0);
        rootStatus = status;
      }
    }
    if (readyMs === null && restarter.isReady(app)) readyMs = Math.round(now() - t0);
    if (rootMs !== null && readyMs !== null) break;
    await sleep(pollMs);
  }
  return { rootMs, rootStatus, readyMs };
}

/**
 * Sample every app of one side. An app whose restart cannot be driven (no
 * container, a failing docker or kubectl) is `not collected` with the reason;
 * an app that restarts but never comes up has null samples, which the engine
 * turns into a boot failure. Every app is left running.
 */
export async function collectStartup(deps: StartupDeps): Promise<StartupCapture | NotCollected> {
  const { restarter, restarts } = deps;
  const log = deps.log ?? (() => {});
  const apps: StartupCapture["apps"] = {};
  for (const app of restarter.apps) {
    try {
      restarter.prepare(app);
      const samples: StartupSample[] = [];
      try {
        for (let i = 1; i <= restarts; i += 1) {
          const sample = await sampleRestart(app, deps);
          log(`    startup: ${app} restart ${i}/${restarts}: ${sample.rootMs === null ? "no healthy / within the timeout" : `/ in ${sample.rootMs} ms`}, ${sample.readyMs === null ? "never ready" : `ready in ${sample.readyMs} ms`}`);
          samples.push(sample);
        }
      } finally {
        restarter.restore(app);
      }
      apps[app] = { samples };
    } catch (e) {
      const reason = reasonOf(e);
      log(`    startup: ${app} not collected: ${reason}`);
      apps[app] = { collected: false, reason } satisfies NotCollected;
    }
  }
  return { collected: true, substrate: restarter.substrate, restarts, timeoutMs: deps.timeoutMs ?? DEFAULT_TIMEOUT_MS, apps };
}

/** The real probe: GET without following redirects, bounded, never throws. */
export async function fetchStatus(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(2000) });
    await response.body?.cancel();
    return response.status;
  } catch {
    return null;
  }
}
