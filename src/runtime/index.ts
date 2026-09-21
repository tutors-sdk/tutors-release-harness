import { performance } from "node:perf_hooks";
import { realExec, type Exec } from "../images.ts";
import type { NotCollected, RuntimeCapture, SideSpec, StartupCapture, Substrate } from "../types.ts";
import { COMPOSE_PROJECT } from "../stack.ts";
import { CLUSTER, namespaceFor } from "../substrate/kind.ts";
import { collectPosture } from "./posture.ts";
import { DEFAULT_RESTARTS, collectStartup, fetchStatus } from "./startup.ts";
import { composeRestarter, composeTarget, kindRestarter, kindTarget, type StackNames } from "./targets.ts";
import { reasonOf } from "./tool.ts";

export { DEFAULT_RESTARTS };

/** The names of the real stacks: the compose project, the kind cluster's context, the per-side namespaces. */
export const realStackNames = (): StackNames => ({ composeProject: COMPOSE_PROJECT, kubeContext: `kind-${CLUSTER}`, namespace: namespaceFor });

export interface RuntimeCaptureOptions {
  substrate: Substrate;
  /** Collect container posture (`--no-runtime` turns it off). */
  posture: boolean;
  /** Restarts per app for startup time; 0 turns it off (`--startup-restarts 0`). */
  startupRestarts: number;
  /** Defaults to the real stacks' names. */
  names?: StackNames;
  log: (m: string) => void;
}

/** Everything that touches the world, injectable so the tests never reach Docker, kubectl or a socket. */
export interface RuntimeDeps {
  exec: Exec;
  probe: (url: string) => Promise<number | null>;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
}

export const realRuntimeDeps: RuntimeDeps = {
  exec: realExec,
  probe: fetchStatus,
  now: () => performance.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms))
};

/**
 * The two R5 collectors for one side, run after everything else has been
 * captured (the restarts must not disturb the journeys, and the posture's
 * log scan should see them). A collector that cannot run says why; nothing here
 * throws, and nothing is retried.
 */
export async function captureRuntime(spec: SideSpec, opts: RuntimeCaptureOptions, deps: RuntimeDeps = realRuntimeDeps): Promise<{ runtime: RuntimeCapture | NotCollected; startup: StartupCapture | NotCollected }> {
  const names = opts.names ?? realStackNames();
  const disabled = (flag: string): NotCollected => ({ collected: false, disabled: true, reason: `switched off with ${flag}` });

  let runtime: RuntimeCapture | NotCollected;
  if (!opts.posture) runtime = disabled("--no-runtime");
  else {
    try {
      const target = opts.substrate === "kind" ? kindTarget(spec.name, deps.exec, names) : composeTarget(spec.name, deps.exec, names);
      runtime = collectPosture(target, opts.log);
    } catch (e) {
      runtime = { collected: false, reason: reasonOf(e) };
    }
  }

  let startup: StartupCapture | NotCollected;
  if (opts.startupRestarts < 1) startup = disabled("--startup-restarts 0");
  else {
    try {
      const restarterDeps = { exec: deps.exec, names, sleep: deps.sleep, now: deps.now };
      const restarter = opts.substrate === "kind" ? kindRestarter(spec, restarterDeps) : composeRestarter(spec, restarterDeps);
      startup = await collectStartup({ restarter, restarts: opts.startupRestarts, probe: deps.probe, now: deps.now, sleep: deps.sleep, log: opts.log });
    } catch (e) {
      startup = { collected: false, reason: reasonOf(e) };
    }
  }
  return { runtime, startup };
}
