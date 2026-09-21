import { dockerRef } from "../image-ref.ts";
import type { Exec } from "../images.ts";
import type { Collected, ImageManifest } from "./types.ts";

const BASE_NAME = "org.opencontainers.image.base.name";
const BASE_DIGEST = "org.opencontainers.image.base.digest";

interface RawInspect {
  Os?: string;
  Architecture?: string;
  Size?: number;
  Config?: { User?: string; ExposedPorts?: Record<string, unknown> | null; Entrypoint?: string[] | null; Cmd?: string[] | null; Labels?: Record<string, string> | null };
  RootFS?: { Layers?: string[] | null };
}

/** The image's manifest facts from `docker image inspect`, through the injected runner. */
export function collectManifest(exec: Exec, ref: string): Collected<ImageManifest> {
  const result = exec("docker", ["image", "inspect", "--format", "{{json .}}", dockerRef(ref)]);
  if (result.error) return { ok: false, reason: `docker could not be run: ${result.error.message}` };
  if (result.status !== 0) return { ok: false, reason: `${ref} is not present locally (docker image inspect exited ${result.status})` };
  let raw: RawInspect;
  try {
    raw = JSON.parse(result.stdout.trim()) as RawInspect;
  } catch {
    return { ok: false, reason: `docker image inspect of ${ref} did not return JSON` };
  }
  const layers = raw.RootFS?.Layers ?? [];
  if (!layers.length) return { ok: false, reason: `${ref}: docker reports no filesystem layers (the containerd image store needs a build that keeps them, or the image is a manifest list for another platform)` };
  const labels = Object.fromEntries(Object.entries(raw.Config?.Labels ?? {}).filter(([k]) => k.startsWith("org.opencontainers.")));
  const config = raw.Config ?? {};
  return {
    ok: true,
    source: "docker image inspect",
    data: {
      os: raw.Os ?? "",
      arch: raw.Architecture ?? "",
      user: config.User ?? "",
      ports: Object.keys(config.ExposedPorts ?? {}).sort(),
      entrypoint: config.Entrypoint ?? null,
      cmd: config.Cmd ?? null,
      layers: layers.length,
      size: raw.Size ?? 0,
      bottomLayer: layers[0]!,
      ...(labels[BASE_NAME] ? { baseName: labels[BASE_NAME] } : {}),
      ...(labels[BASE_DIGEST] ? { baseDigest: labels[BASE_DIGEST] } : {}),
      labels
    }
  };
}

/** True when the image's USER means root: unset, `root`, or uid 0 (with or without a group). */
export function runsAsRoot(user: string): boolean {
  const uid = user.split(":")[0]!.trim();
  return uid === "" || uid === "root" || uid === "0";
}
