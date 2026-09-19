/**
 * Image naming. Every place that turns `--a 16.2.0` into image references, or
 * takes a reference apart, goes through this file — the compose stack, the
 * kind substrate, `images ensure`, the mutants' base image. It is pure (no
 * Docker, no filesystem) so it can be unit-tested exhaustively.
 * `scripts/build-images.sh` carries the one shell mirror of `imageRepo`, and a
 * unit test holds the two to the same answers.
 */

export const APPS = ["reader", "catalogue", "live"] as const;
export type App = (typeof APPS)[number];
export type AppImages = Record<App, string>;

/** The local default: what `docker compose build` in the monorepo produces (`tutors/<app>:local`). */
export const DEFAULT_IMAGE_PREFIX = "tutors";
/** Where the monorepo publishes. Quay has no nested repositories, so the app is part of the repository name. */
export const QUAY_IMAGE_TEMPLATE = "quay.io/tutors-sdk/tutors-{app}";

const APP_PLACEHOLDER = "{app}";
const DIGEST = /^sha256:[a-f0-9]{64}$/;

/**
 * The repository for one app. `prefix` is either a bare prefix
 * (`tutors` -> `tutors/reader`) or a template containing `{app}`
 * (`quay.io/tutors-sdk/tutors-{app}` -> `quay.io/tutors-sdk/tutors-reader`).
 */
export function imageRepo(prefix: string, app: App): string {
  if (!prefix) throw new Error("the image prefix is empty; set HARNESS_IMAGE_PREFIX or --image-prefix");
  if (prefix.includes(APP_PLACEHOLDER)) return prefix.replaceAll(APP_PLACEHOLDER, app);
  if (/[{}]/.test(prefix)) throw new Error(`image prefix "${prefix}": the only placeholder is {app}`);
  return `${prefix.replace(/\/+$/, "")}/${app}`;
}

export interface ParsedRef {
  repo: string;
  tag?: string;
  digest?: string;
}

/** Take `repo[:tag][@sha256:…]` apart. A registry port (`localhost:5000/x`) is not a tag. */
export function parseRef(ref: string): ParsedRef {
  const at = ref.indexOf("@");
  const name = at === -1 ? ref : ref.slice(0, at);
  const digest = at === -1 ? undefined : ref.slice(at + 1);
  if (digest !== undefined && !DIGEST.test(digest)) throw new Error(`image reference "${ref}": a digest is sha256: followed by 64 hex characters`);
  const slash = name.lastIndexOf("/");
  const colon = name.indexOf(":", slash + 1);
  const repo = colon === -1 ? name : name.slice(0, colon);
  const tag = colon === -1 ? undefined : name.slice(colon + 1);
  if (!repo) throw new Error(`image reference "${ref}" has no repository`);
  if (tag === "") throw new Error(`image reference "${ref}" has an empty tag`);
  return { repo, ...(tag !== undefined ? { tag } : {}), ...(digest !== undefined ? { digest } : {}) };
}

export function formatRef(ref: ParsedRef): string {
  return `${ref.repo}${ref.tag ? `:${ref.tag}` : ""}${ref.digest ? `@${ref.digest}` : ""}`;
}

/**
 * The spelling handed to docker, compose and kubectl. When a digest is given
 * it alone identifies the image; the tag is kept in reports for the reader
 * but dropped here, so no tool has to agree on what `repo:tag@digest` means.
 */
export function dockerRef(ref: string): string {
  const parsed = parseRef(ref);
  return parsed.digest ? `${parsed.repo}@${parsed.digest}` : ref;
}

/**
 * True when the reference names a registry host (`quay.io/…`, `localhost:5000/…`):
 * Docker's own rule — the first path component contains a dot or a colon, or is
 * `localhost`. `tutors/reader:local` and `tutors-harness/mutant-x` are local
 * names; the harness never pulls those (they would resolve to whoever owns
 * that namespace on Docker Hub).
 */
export function isRegistryRef(ref: string): boolean {
  const { repo } = parseRef(ref);
  const slash = repo.indexOf("/");
  if (slash === -1) return false;
  const host = repo.slice(0, slash);
  return host === "localhost" || host.includes(".") || host.includes(":");
}

/** Which app a full reference names: the prefix's own repository for it, else a last path segment of `<app>` or `…-<app>`. */
export function appOf(ref: string, prefix: string): App | undefined {
  const { repo } = parseRef(ref);
  const exact = APPS.find((app) => imageRepo(prefix, app) === repo);
  if (exact) return exact;
  const last = repo.slice(repo.lastIndexOf("/") + 1);
  return APPS.find((app) => last === app || last.endsWith(`-${app}`));
}

const isBareTag = (spec: string) => !spec.includes("/") && !spec.includes(":") && !spec.includes("=") && !spec.includes("@");

/** A bare tag is the only form the build-from-ref fallback can produce. */
export function isBuildable(spec: string): boolean {
  return isBareTag(spec);
}

/**
 * Resolve `--a` / `--b` / `--base` into the three image references of a side.
 *
 *   16.2.0                                  <prefix>(app):16.2.0 for every app
 *   quay.io/tutors-sdk/tutors-reader:16.2.0 that image for its app; the others take the prefix and the same tag
 *   reader=REF,catalogue=REF,live=REF       every image spelled out; each REF may carry @sha256:…
 *
 * A digest names exactly one image, so it only appears in a full reference.
 * `16.2.0@sha256:…` is refused: three apps cannot share a digest.
 */
export function imagesFor(spec: string, prefix: string): AppImages {
  if (!spec) throw new Error("an image spec is empty");
  if (spec.includes("=")) {
    const parts = Object.fromEntries(spec.split(",").map((kv) => [kv.slice(0, kv.indexOf("=")).trim(), kv.slice(kv.indexOf("=") + 1).trim()]));
    const missing = APPS.filter((app) => !parts[app]);
    if (missing.length) throw new Error(`--a/--b with app=image pairs must name every app; missing ${missing.join(", ")}`);
    const unknown = Object.keys(parts).filter((k) => !(APPS as readonly string[]).includes(k));
    if (unknown.length) throw new Error(`--a/--b with app=image pairs: unknown app ${unknown.join(", ")}`);
    for (const app of APPS) parseRef(parts[app]!);
    return { reader: parts.reader!, catalogue: parts.catalogue!, live: parts.live! };
  }
  if (isBareTag(spec)) return { reader: `${imageRepo(prefix, "reader")}:${spec}`, catalogue: `${imageRepo(prefix, "catalogue")}:${spec}`, live: `${imageRepo(prefix, "live")}:${spec}` };
  if (/^[^/:@]*@/.test(spec)) {
    throw new Error(`"${spec}": a digest names one image, and the three apps have three digests; spell them out as reader=REPO@sha256:…,catalogue=REPO@sha256:…,live=REPO@sha256:…`);
  }

  // A full reference for one app, e.g. tutors/reader:16.2.0 or a mutant image.
  const parsed = parseRef(spec);
  if (!parsed.tag) {
    throw new Error(`"${spec}" has no tag for the other apps to take; spell all three out as reader=…,catalogue=…,live=…`);
  }
  const images: AppImages = { reader: `${imageRepo(prefix, "reader")}:${parsed.tag}`, catalogue: `${imageRepo(prefix, "catalogue")}:${parsed.tag}`, live: `${imageRepo(prefix, "live")}:${parsed.tag}` };
  const app = appOf(spec, prefix);
  if (app) images[app] = spec;
  return images;
}

/** `reader=…,catalogue=…,live=…` for a set of images: the spelled-out form `imagesFor` reads back unchanged. */
export function specFor(images: AppImages): string {
  return APPS.map((app) => `${app}=${images[app]}`).join(",");
}

/**
 * The name an image goes by inside the kind cluster. `kind load docker-image`
 * carries tags, not digests, so a digest-pinned image is given a local tag
 * derived from its digest (`repo:16.2.0-sha256-0123456789ab`); the content is
 * the same image, and the pod's `IfNotPresent` never reaches for a registry.
 */
export function kindImageName(ref: string): string {
  const parsed = parseRef(ref);
  if (!parsed.digest) return ref;
  const short = `sha256-${parsed.digest.slice("sha256:".length, "sha256:".length + 12)}`;
  return `${parsed.repo}:${parsed.tag ? `${parsed.tag}-${short}` : short}`;
}
