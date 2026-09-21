import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { dockerRef } from "./image-ref.ts";
import { composeProject, orExit } from "./project.ts";
import type { SideName, SideSpec, StackUrls } from "./types.ts";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const COMPOSE_FILE = resolve(ROOT, "compose.harness.yaml");
/**
 * This checkout's compose project (src/project.ts): `tutors-harness-<8 hex of the checkout's path>`, so two checkouts or
 * worktrees never share a stack. HARNESS_COMPOSE_PROJECT, then HARNESS_PROJECT, win. `-p` always overrides the `name:`
 * in compose.harness.yaml, which is only what a hand-typed `docker compose` without `-p` would use.
 */
export const COMPOSE_PROJECT = orExit(() => composeProject().name);
/** The compose network the k6 container joins to reach the sides by service name. */
export const COMPOSE_NETWORK = `${COMPOSE_PROJECT}_default`;

/** Host ports per side; the compose file's defaults, overridable through the environment. */
const PORTS: Record<SideName, { reader: number; catalogue: number; live: number; readerAuth: number; persistence: number }> = {
  a: {
    reader: Number(process.env.READER_PORT_A ?? 3100),
    catalogue: Number(process.env.CATALOGUE_PORT_A ?? 3101),
    live: Number(process.env.LIVE_PORT_A ?? 3102),
    readerAuth: Number(process.env.READER_AUTH_PORT_A ?? 3103),
    persistence: Number(process.env.PERSISTENCE_PORT_A ?? 8090)
  },
  b: {
    reader: Number(process.env.READER_PORT_B ?? 3200),
    catalogue: Number(process.env.CATALOGUE_PORT_B ?? 3201),
    live: Number(process.env.LIVE_PORT_B ?? 3202),
    readerAuth: Number(process.env.READER_AUTH_PORT_B ?? 3203),
    persistence: Number(process.env.PERSISTENCE_PORT_B ?? 8091)
  }
};

export const COURSE_ID = process.env.COURSE_ID ?? `localhost:${process.env.COURSE_PORT ?? 8080}`;
export const IDENTITY_URL = `https://localhost:${process.env.IDENTITY_PORT ?? 8443}`;
export const EDGE_URL = `http://localhost:${process.env.EDGE_PORT ?? 3300}`;

export function urlsFor(side: SideName): StackUrls {
  const p = PORTS[side];
  return {
    reader: `http://localhost:${p.reader}`,
    catalogue: `http://localhost:${p.catalogue}`,
    live: `http://localhost:${p.live}`,
    readerAuth: `http://localhost:${p.readerAuth}`,
    persistence: `http://persistence-${side}.harness.test:${p.persistence}`,
    courseId: COURSE_ID
  };
}

// Image naming lives in image-ref.ts; re-exported here because a side is made of images.
export { imagesFor } from "./image-ref.ts";

export function sideSpec(name: SideName, images: SideSpec["images"]): SideSpec {
  return { name, images, urls: urlsFor(name) };
}

/** A live deployment the harness did not start: `reader=https://tutors.dev,catalogue=...,live=...`. */
export function externalSide(name: SideName, spec: string, courseId: string): SideSpec {
  const parts = Object.fromEntries(spec.split(",").map((kv) => kv.split("=") as [string, string]));
  const missing = ["reader", "catalogue", "live"].filter((app) => !parts[app]);
  if (missing.length) throw new Error(`an external side needs reader=,catalogue=,live= URLs; missing ${missing.join(", ")}`);
  const strip = (u: string) => u.replace(/\/+$/, "");
  return {
    name,
    images: { reader: `external:${parts.reader}`, catalogue: `external:${parts.catalogue}`, live: `external:${parts.live}` },
    urls: { reader: strip(parts.reader!), catalogue: strip(parts.catalogue!), live: strip(parts.live!), courseId },
    external: true
  };
}

function composeEnv(a: SideSpec, b: SideSpec, now: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HARNESS_NOW: now,
    READER_IMAGE_A: dockerRef(a.images.reader),
    CATALOGUE_IMAGE_A: dockerRef(a.images.catalogue),
    LIVE_IMAGE_A: dockerRef(a.images.live),
    READER_IMAGE_B: dockerRef(b.images.reader),
    CATALOGUE_IMAGE_B: dockerRef(b.images.catalogue),
    LIVE_IMAGE_B: dockerRef(b.images.live)
  };
}

export function compose(args: string[], env: NodeJS.ProcessEnv, opts: { capture?: boolean; profiles?: string[] } = {}): string {
  const profileArgs = (opts.profiles ?? []).flatMap((p) => ["--profile", p]);
  const result = spawnSync("docker", ["compose", "-p", COMPOSE_PROJECT, "-f", COMPOSE_FILE, ...profileArgs, ...args], {
    cwd: ROOT,
    env,
    encoding: "utf8",
    stdio: opts.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`docker compose ${args.join(" ")} exited ${result.status}${opts.capture ? `\n${result.stderr}` : ""}`);
  }
  return result.stdout ?? "";
}

export interface StackOptions {
  profiles?: string[];
}

/** Start both sides and the shared fixtures; returns when every healthcheck passes. */
export function stackUp(a: SideSpec, b: SideSpec, now: string, opts: StackOptions = {}): void {
  compose(["up", "-d", "--wait", "--remove-orphans"], composeEnv(a, b, now), { ...(opts.profiles ? { profiles: opts.profiles } : {}) });
}

export function stackDown(a: SideSpec, b: SideSpec, now: string): void {
  compose(["down", "--remove-orphans", "--timeout", "5"], composeEnv(a, b, now), { profiles: ["upgrade"] });
}

/** Stop one service (the old version's pods going away during a rollout). */
export function stackStop(service: string, a: SideSpec, b: SideSpec, now: string): void {
  compose(["stop", "--timeout", "10", service], composeEnv(a, b, now));
}

/**
 * Raw log lines of one service since `since` (RFC 3339). Bounded by the side's
 * own capture window so a stack that was already up (or was probed by hand)
 * does not carry earlier traffic into the comparison.
 */
export function serviceLogs(service: string, since: string, a: SideSpec, b: SideSpec, now: string): string {
  return compose(["logs", "--no-color", "--no-log-prefix", "--since", since, service], composeEnv(a, b, now), { capture: true });
}

export function serviceName(side: SideName, app: "reader" | "catalogue" | "live" | "reader-auth"): string {
  return `${app}-${side}`;
}

/** Run a docker CLI command and return stdout; throws on non-zero exit. */
export function docker(args: string[], opts: { input?: string; quiet?: boolean; env?: NodeJS.ProcessEnv } = {}): string {
  const result = spawnSync("docker", args, {
    cwd: ROOT,
    encoding: "utf8",
    ...(opts.input !== undefined ? { input: opts.input } : {}),
    // MSYS on Windows rewrites "/x" arguments to Windows paths; docker needs them as given.
    env: { ...process.env, MSYS_NO_PATHCONV: "1", ...opts.env },
    stdio: ["pipe", "pipe", opts.quiet ? "pipe" : "inherit"],
    maxBuffer: 256 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`docker ${args.slice(0, 3).join(" ")} exited ${result.status}${opts.quiet ? `\n${result.stderr}` : ""}`);
  return result.stdout ?? "";
}
