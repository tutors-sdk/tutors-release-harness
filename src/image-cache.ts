import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dockerRef } from "./image-ref.ts";
import type { Exec } from "./images.ts";

/**
 * A cache of the production images on the runner between nights: a
 * `docker save` tar and a manifest of what is in it, kept by the workflow with
 * actions/cache. It exists for one reason: a registry outage or rate limit must
 * not stop the nightly A/A from producing evidence — and must not let that
 * evidence pass for what it is not. An image restored from here is recorded as
 * provenance `cached`, and a noise run that used one is DEGRADED (see
 * `src/noise.ts`, `docs/noise-burndown.md`).
 *
 * The cache is only ever a fallback: `images ensure` always tries the registry
 * first, so a tag that moved is picked up the moment the registry answers, and
 * a cache is only written from images that were pulled and signature-verified
 * in the same run.
 */

export const CACHE_TAR = "images.tar";
export const CACHE_MANIFEST = "manifest.json";

export interface CacheEntry {
  ref: string;
  /** Local image id when saved; a restored image must have the same one. */
  id: string;
  digest: string;
  verifiedIdentity: string;
}

export interface CacheManifest {
  /** ISO instant the cache was written: the earlier run that pulled and verified these images. */
  savedAt: string;
  images: CacheEntry[];
}

export function readManifest(dir: string): CacheManifest | undefined {
  const file = join(dir, CACHE_MANIFEST);
  if (!existsSync(file) || !existsSync(join(dir, CACHE_TAR))) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<CacheManifest>;
    if (typeof parsed.savedAt !== "string" || !Array.isArray(parsed.images)) return undefined;
    return { savedAt: parsed.savedAt, images: parsed.images.filter((i): i is CacheEntry => Boolean(i?.ref && i.id && i.digest && i.verifiedIdentity)) };
  } catch {
    return undefined;
  }
}

/** Save images that were pulled and verified in this run. The caller passes only such images. */
export function saveImageCache(exec: Exec, entries: CacheEntry[], dir: string, now: Date): { ok: boolean; problem?: string } {
  if (!entries.length) return { ok: false, problem: "no verified image to cache" };
  mkdirSync(dir, { recursive: true });
  const refs = [...new Set(entries.map((e) => dockerRef(e.ref)))];
  const saved = exec("docker", ["save", "-o", join(dir, CACHE_TAR), ...refs]);
  if (saved.status !== 0) return { ok: false, problem: `docker save failed: ${saved.stderr.trim().split(/\r?\n/).pop() ?? saved.status}` };
  const manifest: CacheManifest = { savedAt: now.toISOString(), images: entries };
  writeFileSync(join(dir, CACHE_MANIFEST), JSON.stringify(manifest, null, 2));
  return { ok: true };
}

/**
 * Load the cache's images and report which of `wanted` it restored. `keep`
 * maps refs that were just pulled fresh to their local ids: `docker load`
 * retags every image in the tar, so any of those it displaced is tagged back.
 */
export function restoreImageCache(exec: Exec, dir: string, wanted: string[], keep: Map<string, string>, inspectId: (ref: string) => string | undefined): { manifest: CacheManifest; restored: CacheEntry[] } | undefined {
  const manifest = readManifest(dir);
  if (!manifest) return undefined;
  const loaded = exec("docker", ["load", "--quiet", "-i", join(dir, CACHE_TAR)]);
  if (loaded.status !== 0) return undefined;
  for (const [ref, id] of keep) if (inspectId(ref) !== id) exec("docker", ["tag", id, dockerRef(ref)]);
  const restored = manifest.images.filter((entry) => wanted.includes(entry.ref) && !keep.has(entry.ref) && inspectId(entry.ref) === entry.id);
  return { manifest, restored };
}

/**
 * Why `docker pull` failed: the tag is not in the registry ("absent": a cache
 * of some other night must not stand in for it), or the registry could not
 * answer ("unreachable": an outage, a rate limit, a timeout, a 5xx). When in
 * doubt it is unreachable — but only for the purpose of using a cache, which
 * degrades the run to a warning either way.
 */
export function classifyPullFailure(stderr: string): "absent" | "unreachable" {
  if (/toomanyrequests|rate limit|too many requests|timeout|timed out|temporary failure|connection (refused|reset)|no such host|EOF|50[0-9]|unavailable|network is unreachable/i.test(stderr)) return "unreachable";
  if (/manifest unknown|not found|name unknown|no such manifest|repository does not exist|invalid reference format|denied/i.test(stderr)) return "absent";
  return "unreachable";
}
