import { APPS, formatRef, parseRef, type App, type AppImages } from "./image-ref.ts";

/**
 * Image digests as the release dispatch carries them (contract 1.3.0).
 *
 * The monorepo's `release-candidate` dispatch may say, per app, exactly which
 * image it built and which one production runs: `production_digests` and
 * `candidate_digests`, objects `app -> "sha256:<64 hex>"`. The harness pins
 * the references with them (`repo:tag@sha256:…`, a form `imagesFor` already
 * reads), so the run judges those bytes and not whatever the tag resolves to a
 * minute later. Every app in `APPS` is accepted; nothing here names one.
 *
 * Pure: no Docker, no network. The one network question (does the tag still
 * resolve to the pinned digest?) is asked in `src/images.ts`.
 */
export type Digests = Partial<Record<App, string>>;

export const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;

export class DigestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DigestError";
  }
}

function fromObject(value: unknown, label: string): Digests | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) throw new DigestError(`${label}: expected an object of app -> sha256:<64 hex>, e.g. {"reader":"sha256:…"}`);
  const out: Digests = {};
  for (const [app, digest] of Object.entries(value as Record<string, unknown>)) {
    if (!(APPS as readonly string[]).includes(app)) throw new DigestError(`${label}: unknown app "${app}" (the apps are ${APPS.join(", ")})`);
    if (typeof digest !== "string" || !DIGEST_PATTERN.test(digest)) throw new DigestError(`${label}: the digest of ${app} must be sha256: followed by 64 lowercase hex characters (got ${JSON.stringify(digest)})`);
    out[app as App] = digest;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * The digests of a side, as a flag or a workflow gives them: a JSON object
 * (`{"reader":"sha256:…"}`) or `reader=sha256:…,catalogue=sha256:…`. Empty,
 * whitespace or the literal `null` (what a workflow expression makes of a
 * missing payload field) mean none: an old dispatch has no digests and behaves
 * exactly as before.
 */
export function parseDigests(input: string | undefined, label: string): Digests | undefined {
  const text = (input ?? "").trim();
  if (!text || text === "null" || text === "{}") return undefined;
  if (text.startsWith("{") || text.startsWith("[")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new DigestError(`${label}: not valid JSON`);
    }
    return fromObject(parsed, label);
  }
  const pairs: Record<string, string> = {};
  for (const part of text.split(",")) {
    const i = part.indexOf("=");
    if (i === -1) throw new DigestError(`${label}: "${part.trim()}" is not app=sha256:<64 hex>`);
    pairs[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return fromObject(pairs, label);
}

/**
 * Pin a side's references with its digests. An app without a digest keeps its
 * reference; an app whose reference already carries a different digest is a
 * contradiction and is refused rather than resolved in either direction.
 */
export function pinImages(images: AppImages, digests: Digests | undefined, label = "digests"): AppImages {
  if (!digests) return images;
  const pinned = { ...images };
  for (const app of Object.keys(digests) as App[]) {
    const digest = digests[app]!;
    const ref = images[app];
    if (ref === undefined) throw new DigestError(`${label}: ${app} is not one of this side's images`);
    const parsed = parseRef(ref);
    if (parsed.digest && parsed.digest !== digest) throw new DigestError(`${label}: ${app} is given as ${ref} but the digest for it is ${digest}: they name different images`);
    pinned[app] = formatRef({ ...parsed, digest });
  }
  return pinned;
}
