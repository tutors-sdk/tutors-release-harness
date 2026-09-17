import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { ROOT, docker, imagesFor } from "./stack.ts";

export interface ImageRequest {
  /** What --a / --b was given. */
  spec: string;
  /** The monorepo git ref to build from when the registry has no such tag; defaults to `v<tag>` then `<tag>`. */
  ref?: string;
}

function present(image: string): boolean {
  return spawnSync("docker", ["image", "inspect", image], { encoding: "utf8", stdio: ["ignore", "ignore", "ignore"] }).status === 0;
}

function pull(image: string, log: (m: string) => void): boolean {
  log(`  pulling ${image}`);
  const result = spawnSync("docker", ["pull", "--quiet", image], { encoding: "utf8" });
  return result.status === 0;
}

function build(ref: string, tag: string, prefix: string, log: (m: string) => void): boolean {
  log(`  building ${prefix}/{reader,catalogue,live}:${tag} from monorepo ref ${ref}`);
  const result = spawnSync("bash", [resolve(ROOT, "scripts", "build-images.sh"), ref, tag], { cwd: ROOT, encoding: "utf8", stdio: "inherit", env: { ...process.env, HARNESS_IMAGE_PREFIX: prefix } });
  return result.status === 0;
}

/**
 * Make sure every image a side needs exists locally: already present, or
 * pulled from the registry, or — for a bare tag — built from the monorepo at
 * the matching git ref. This is the one place the harness touches source, and
 * only to produce an image it then treats like any other.
 */
export function ensureImages(requests: ImageRequest[], prefix: string, log: (m: string) => void): boolean {
  let ok = true;
  for (const request of requests) {
    const images = imagesFor(request.spec, prefix);
    const missing = Object.values(images).filter((image) => !present(image));
    if (!missing.length) {
      log(`${request.spec}: all images present`);
      continue;
    }
    const pulled = missing.every((image) => pull(image, log));
    if (pulled) continue;
    const bare = !request.spec.includes("/") && !request.spec.includes(":") && !request.spec.includes("=");
    if (!bare) {
      log(`${request.spec}: not in the registry and not a bare tag, so it cannot be built; give --ref-a/--ref-b`);
      ok = false;
      continue;
    }
    const refs = request.ref ? [request.ref] : [`v${request.spec}`, request.spec, `release/${request.spec}`];
    const built = refs.some((ref) => build(ref, request.spec, prefix, log));
    if (!built) {
      log(`${request.spec}: could not build from any of ${refs.join(", ")}`);
      ok = false;
    }
  }
  if (ok) for (const request of requests) for (const image of Object.values(imagesFor(request.spec, prefix))) log(`  ${image}: ${docker(["image", "inspect", "--format", "{{.Id}}", image], { quiet: true }).trim().slice(7, 19)}`);
  return ok;
}
