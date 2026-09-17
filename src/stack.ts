import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { SideName, SideSpec, StackUrls } from "./types.ts";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const COMPOSE_FILE = resolve(ROOT, "compose.harness.yaml");
export const COMPOSE_PROJECT = process.env.HARNESS_COMPOSE_PROJECT ?? "tutors-harness";

/** Host ports per side; the compose file's defaults, overridable through the environment. */
const PORTS: Record<SideName, { reader: number; catalogue: number; live: number }> = {
  a: {
    reader: Number(process.env.READER_PORT_A ?? 3100),
    catalogue: Number(process.env.CATALOGUE_PORT_A ?? 3101),
    live: Number(process.env.LIVE_PORT_A ?? 3102)
  },
  b: {
    reader: Number(process.env.READER_PORT_B ?? 3200),
    catalogue: Number(process.env.CATALOGUE_PORT_B ?? 3201),
    live: Number(process.env.LIVE_PORT_B ?? 3202)
  }
};

export const COURSE_ID = process.env.COURSE_ID ?? `localhost:${process.env.COURSE_PORT ?? 8080}`;

export function urlsFor(side: SideName): StackUrls {
  const p = PORTS[side];
  return {
    reader: `http://localhost:${p.reader}`,
    catalogue: `http://localhost:${p.catalogue}`,
    live: `http://localhost:${p.live}`,
    courseId: COURSE_ID
  };
}

/**
 * Resolve `--a 16.2.0` or `--a ghcr.io/tutors-sdk/tutors/reader:16.2.0` into the
 * three image references for a side. A bare tag uses `prefix/<app>:<tag>`; a
 * full reference for one app is used for that app only, the rest take the
 * prefix and that reference's tag. `reader=..,catalogue=..,live=..` sets each.
 */
export function imagesFor(spec: string, prefix: string): SideSpec["images"] {
  if (spec.includes("=")) {
    const parts = Object.fromEntries(spec.split(",").map((kv) => kv.split("=") as [string, string]));
    const missing = ["reader", "catalogue", "live"].filter((app) => !parts[app]);
    if (missing.length) throw new Error(`--a/--b with app=image pairs must name every app; missing ${missing.join(", ")}`);
    return { reader: parts.reader!, catalogue: parts.catalogue!, live: parts.live! };
  }
  if (spec.includes("/") || spec.includes(":")) {
    // Full reference for one app, e.g. tutors/reader:16.2.0 or a mutant image.
    const tag = spec.split(":").pop()!;
    const app = /\/(reader|catalogue|live)(?::|$)/.exec(spec)?.[1] as keyof SideSpec["images"] | undefined;
    const images = { reader: `${prefix}/reader:${tag}`, catalogue: `${prefix}/catalogue:${tag}`, live: `${prefix}/live:${tag}` };
    if (app) images[app] = spec;
    return images;
  }
  return { reader: `${prefix}/reader:${spec}`, catalogue: `${prefix}/catalogue:${spec}`, live: `${prefix}/live:${spec}` };
}

export function sideSpec(name: SideName, images: SideSpec["images"]): SideSpec {
  return { name, images, urls: urlsFor(name) };
}

function composeEnv(a: SideSpec, b: SideSpec, now: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HARNESS_NOW: now,
    READER_IMAGE_A: a.images.reader,
    CATALOGUE_IMAGE_A: a.images.catalogue,
    LIVE_IMAGE_A: a.images.live,
    READER_IMAGE_B: b.images.reader,
    CATALOGUE_IMAGE_B: b.images.catalogue,
    LIVE_IMAGE_B: b.images.live
  };
}

function compose(args: string[], env: NodeJS.ProcessEnv, opts: { capture?: boolean } = {}): string {
  const result = spawnSync("docker", ["compose", "-p", COMPOSE_PROJECT, "-f", COMPOSE_FILE, ...args], {
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

/** Start both sides and the shared fixtures; returns when every healthcheck passes. */
export function stackUp(a: SideSpec, b: SideSpec, now: string): void {
  compose(["up", "-d", "--wait", "--remove-orphans"], composeEnv(a, b, now));
}

export function stackDown(a: SideSpec, b: SideSpec, now: string): void {
  compose(["down", "--remove-orphans", "--timeout", "5"], composeEnv(a, b, now));
}

/**
 * Raw log lines of one service since `since` (RFC 3339). Bounded by the side's
 * own capture window so a stack that was already up (or was probed by hand)
 * does not carry earlier traffic into the comparison.
 */
export function serviceLogs(service: string, since: string, a: SideSpec, b: SideSpec, now: string): string {
  return compose(["logs", "--no-color", "--no-log-prefix", "--since", since, service], composeEnv(a, b, now), { capture: true });
}

export function serviceName(side: SideName, app: keyof SideSpec["images"]): string {
  return `${app}-${side}`;
}
