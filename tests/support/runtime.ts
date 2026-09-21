import type { ContainerPosture, RuntimeCapture, SideCapture, StartupCapture, StartupSample } from "../../src/types.ts";
import { capture, clone } from "./captures.ts";

/** A container the way the harness stacks run it: non-root, no capabilities, read-only root, tmpfs /tmp. */
export function posture(overrides: Partial<ContainerPosture> = {}): ContainerPosture {
  const base: ContainerPosture = {
    user: "",
    runAsNonRoot: null,
    privileged: false,
    readOnlyRootfs: true,
    capAdd: [],
    capDrop: ["ALL"],
    securityOpt: ["no-new-privileges:true"],
    writablePaths: ["/tmp"],
    resources: { memoryRequest: null, memoryLimit: null, cpuRequest: null, cpuLimit: null, pidsLimit: null },
    effective: { uid: 1001, gid: 0, capEff: [], capBnd: [], noNewPrivs: true, seccomp: "filter", rootfsReadOnly: true, tmpWritable: true, cwdWritable: false },
    readOnlyViolations: 0
  };
  return { ...clone(base), ...overrides, effective: { ...base.effective, ...overrides.effective } };
}

export const APPS = ["reader", "catalogue", "live", "time"] as const;

export function runtimeCapture(overrides: Partial<Record<(typeof APPS)[number], ContainerPosture>> = {}): RuntimeCapture {
  return { collected: true, substrate: "compose", containers: Object.fromEntries(APPS.map((app) => [app, overrides[app] ?? posture()])) };
}

export const sample = (rootMs: number, readyMs = 2100, rootStatus = 200): StartupSample => ({ rootMs, rootStatus, readyMs });

/** Five warm restarts: about 1.8 s to a healthy / and one healthcheck tick to ready. */
export const STEADY = [1790, 1810, 1805, 1795, 1820].map((ms) => sample(ms));

export function startupCapture(perApp: Partial<Record<(typeof APPS)[number], StartupSample[]>> = {}): StartupCapture {
  return { collected: true, substrate: "compose", restarts: 5, timeoutMs: 60_000, apps: Object.fromEntries(APPS.map((app) => [app, { samples: clone(perApp[app] ?? STEADY) }])) };
}

/** A side that ran both R5 collectors. */
export function sideWithRuntime(side: "a" | "b", overrides: Partial<SideCapture> = {}): SideCapture {
  return capture(side, { runtime: runtimeCapture(), startup: startupCapture(), ...overrides });
}
