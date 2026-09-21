import { APPS } from "../image-ref.ts";
import type { Exec } from "../images.ts";
import type { SideName, SideSpec } from "../types.ts";
import { declaredFromDockerInspect, declaredFromPod, type PostureTarget } from "./posture.ts";
import { ToolError, mustRun, mustRunBoth } from "./tool.ts";

/**
 * How to reach one side's containers, per substrate. Every command goes through
 * the injected `Exec` (src/images.ts), so the unit tests give it a fake
 * docker and a fake kubectl and assert on the exact commands.
 */

export interface StackNames {
  /** The compose project (`tutors-harness-<8 hex>`, src/project.ts). */
  composeProject: string;
  /** The kind cluster's kubectl context (`kind-tutors-harness-<8 hex>`). */
  kubeContext: string;
  /** The namespace a side lives in under kind (`harness-a`). */
  namespace: (side: SideName) => string;
}

/** compose: the anonymous apps and the signed-in reader, all built from the images under test. */
export const COMPOSE_APPS = [...APPS, "reader-auth"] as const;

/** Restarts stop a container and start it again, timing until it answers; see src/runtime/startup.ts. */
export interface Restarter {
  substrate: "compose" | "kind";
  apps: string[];
  /** Host URL of the app's `/`. */
  rootUrl(app: string): string;
  /** Resolve what is needed to control the app; throws ToolError. Called once per app before its restarts. */
  prepare(app: string): void;
  /** Take the app down and return when it is really gone (so that nothing old can answer). */
  down(app: string): Promise<void>;
  /** Start it again; returns as soon as the command has returned, not when the app is healthy. */
  up(app: string): void;
  /** The orchestrator's verdict: compose healthcheck healthy / pod Ready. */
  isReady(app: string): boolean;
  /** Leave the app running however the sampling ended. */
  restore(app: string): void;
}

// ---- compose -------------------------------------------------------------------------

function composeContainerId(exec: Exec, project: string, service: string): string {
  const out = mustRun(exec, "docker", ["ps", "-q", "--filter", `label=com.docker.compose.project=${project}`, "--filter", `label=com.docker.compose.service=${service}`]);
  const ids = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!ids.length) throw new ToolError(`no running container for compose service ${service} in project ${project}`);
  return ids[0]!;
}

export function composeTarget(side: SideName, exec: Exec, names: StackNames): PostureTarget {
  const id = (app: string) => composeContainerId(exec, names.composeProject, `${app}-${side}`);
  return {
    substrate: "compose",
    apps: [...COMPOSE_APPS],
    declared: (app) => declaredFromDockerInspect(JSON.parse(mustRun(exec, "docker", ["inspect", id(app)]))),
    execIn: (app, argv) => mustRun(exec, "docker", ["exec", id(app), ...argv]),
    logs: (app) => mustRunBoth(exec, "docker", ["logs", id(app)])
  };
}

// ---- kind -----------------------------------------------------------------------------

interface Pod {
  metadata?: { name?: string; deletionTimestamp?: string };
  status?: { phase?: string; conditions?: { type: string; status: string }[] };
}

function kubectl(exec: Exec, names: StackNames, args: string[]): string {
  return mustRun(exec, "kubectl", ["--context", names.kubeContext, ...args]);
}

/** The app's current pod: running, and not on its way out. */
function livePod(exec: Exec, names: StackNames, side: SideName, app: string): Pod & Record<string, unknown> {
  const out = kubectl(exec, names, ["-n", names.namespace(side), "get", "pods", "-l", `app.kubernetes.io/name=tutors-${app}`, "-o", "json"]);
  const items = ((JSON.parse(out) as { items?: (Pod & Record<string, unknown>)[] }).items ?? []).filter((p) => !p.metadata?.deletionTimestamp && p.status?.phase === "Running");
  if (!items.length) throw new ToolError(`no running pod for deployment ${app} in namespace ${names.namespace(side)}`);
  return items[0]!;
}

export function kindTarget(side: SideName, exec: Exec, names: StackNames): PostureTarget {
  const pod = (app: string) => livePod(exec, names, side, app);
  const podName = (app: string) => pod(app).metadata!.name!;
  return {
    substrate: "kind",
    apps: [...APPS],
    declared: (app) => declaredFromPod(pod(app)),
    execIn: (app, argv) => kubectl(exec, names, ["-n", names.namespace(side), "exec", podName(app), "-c", "app", "--", ...argv]),
    logs: (app) => mustRunBoth(exec, "kubectl", ["--context", names.kubeContext, "-n", names.namespace(side), "logs", podName(app), "-c", "app"])
  };
}

// ---- restarts -----------------------------------------------------------------------------

export interface RestarterDeps {
  exec: Exec;
  names: StackNames;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
  /** How long to wait for the old container or pod to be gone before giving up. */
  downTimeoutMs?: number;
}

export function composeRestarter(spec: SideSpec, deps: RestarterDeps): Restarter {
  const ids = new Map<string, string>();
  const idOf = (app: string) => {
    const id = ids.get(app);
    if (!id) throw new ToolError(`${app} was not prepared for a restart`);
    return id;
  };
  const urls: Record<string, string | undefined> = { reader: spec.urls.reader, catalogue: spec.urls.catalogue, live: spec.urls.live };
  return {
    substrate: "compose",
    apps: [...APPS],
    rootUrl: (app) => urls[app]!,
    prepare: (app) => void ids.set(app, composeContainerId(deps.exec, deps.names.composeProject, `${app}-${spec.name}`)),
    // `docker stop` returns when the container has exited; three seconds is plenty for a node process with an init.
    down: async (app) => void mustRun(deps.exec, "docker", ["stop", "--time", "3", idOf(app)]),
    up: (app) => void mustRun(deps.exec, "docker", ["start", idOf(app)]),
    isReady: (app) => mustRun(deps.exec, "docker", ["inspect", "--format", "{{if .State.Health}}{{.State.Health.Status}}{{end}}", idOf(app)]).trim() === "healthy",
    restore: (app) => {
      try {
        mustRun(deps.exec, "docker", ["start", idOf(app)]);
      } catch {
        // already running, or gone: nothing more to do
      }
    }
  };
}

export function kindRestarter(spec: SideSpec, deps: RestarterDeps): Restarter {
  const ns = deps.names.namespace(spec.name);
  const selector = (app: string) => `app.kubernetes.io/name=tutors-${app}`;
  const scale = (app: string, replicas: number) => kubectl(deps.exec, deps.names, ["-n", ns, "scale", `deployment/${app}`, `--replicas=${replicas}`]);
  const urls: Record<string, string | undefined> = { reader: spec.urls.reader, catalogue: spec.urls.catalogue, live: spec.urls.live };
  return {
    substrate: "kind",
    apps: [...APPS],
    rootUrl: (app) => urls[app]!,
    prepare: (app) => void livePod(deps.exec, deps.names, spec.name, app),
    // Scale to zero rather than roll: during a rollout the old pod keeps answering, which would make every restart look instant.
    down: async (app) => {
      scale(app, 0);
      const deadline = deps.now() + (deps.downTimeoutMs ?? 60_000);
      for (;;) {
        const left = kubectl(deps.exec, deps.names, ["-n", ns, "get", "pods", "-l", selector(app), "-o", "name"]).trim();
        if (!left) return;
        if (deps.now() > deadline) throw new ToolError(`the old pod of ${app} was still there after ${(deps.downTimeoutMs ?? 60_000) / 1000}s`);
        await deps.sleep(250);
      }
    },
    up: (app) => void scale(app, 1),
    isReady: (app) => {
      const out = kubectl(deps.exec, deps.names, ["-n", ns, "get", "pods", "-l", selector(app), "-o", "json"]);
      const pods = ((JSON.parse(out) as { items?: Pod[] }).items ?? []).filter((p) => !p.metadata?.deletionTimestamp);
      return pods.some((p) => p.status?.conditions?.some((c) => c.type === "Ready" && c.status === "True"));
    },
    restore: (app) => {
      try {
        scale(app, 1);
      } catch {
        // the cluster is gone or the command failed: the run is reporting that already
      }
    }
  };
}
