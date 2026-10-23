import { createHash } from "node:crypto";
import type { ProductionBuild, ProductionBuildStatus } from "../types.ts";

/**
 * Post-deploy mode: which build does production's reader serve, and is it the recorded candidate's?
 *
 * tutors.dev is deployed by hand and nothing records which build it serves, so the reader is asked. A SvelteKit app
 * names its build in `/_app/version.json` (`{"version":"<name>"}`): built with `GIT_SHA` or Netlify's `COMMIT_REF` the
 * name is `sha256(commit)` in hex, first 16 characters; built with neither it is `Date.now()` at build time. The reader's
 * `/version` carries `revision`, the commit or `unknown`, and is absent from older builds.
 *
 * Informational only: the answer is a report section and, when it is not `match`, a line in `reasons`. It never changes
 * the verdict and is never a hunk.
 *
 * Since 1.54.0 (harness hardening plan, A2) it also says which kind of build serves, not only which commit:
 * `servingBuild`. Netlify answers with `server: Netlify` and an `x-nf-request-id` on every response; a container image
 * is known by the digest `/version` names (`digest` or `imageDigest`). `/version`'s `buildId` (a Netlify deploy id,
 * for one) and `builtAt` are kept when it sends them. Anything else is `unknown`.
 */

/** How long each of the two requests may take. Production answers these in milliseconds; a slow one is "not answered". */
export const PRODUCTION_BUILD_TIMEOUT_MS = 5000;

/** Longest value kept from a response: a build name is 16 characters and a commit 40; anything longer is not one. */
const MAX_VALUE = 200;

const HASHED_NAME = /^[0-9a-f]{16}$/;
/** `Date.now()` has 13 digits from 2001 until 2286; a 16-digit name is a hash that happens to be all digits. */
const TIMESTAMP_NAME = /^\d{13}$/;

/** The build name a SvelteKit build given `commit` carries: sha256 of the commit, hex, first 16 characters. */
export function hashedBuildName(commit: string): string {
  return createHash("sha256").update(commit).digest("hex").slice(0, 16);
}

/** A value from the network, fit to quote in one line of plain text; anything unusual is not quoted. */
function token(value: string): string {
  return /^[\w.:+-]{1,80}$/.test(value) ? value : "an unrecognised value";
}

const shortCommit = (commit: string) => (/^[0-9a-f]{40}$/i.test(commit) ? commit.slice(0, 12) : token(commit));

/** Two spellings of one commit: equal ignoring case, or one an abbreviation (7 or more characters) of the other. */
function sameCommit(x: string, y: string): boolean {
  const [a, b] = [x.toLowerCase(), y.toLowerCase()];
  if (a === b) return true;
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.length >= 7 && /^[0-9a-f]+$/.test(shorter) && longer.startsWith(shorter);
}

/** The instant a timestamp build name was built at, or undefined when it is not one. */
export function builtAt(name: string | undefined): string | undefined {
  if (!name || !TIMESTAMP_NAME.test(name)) return undefined;
  return new Date(Number(name)).toISOString();
}

export interface ProductionAnswers {
  /** The reader URL asked. */
  url: string;
  /** The recorded candidate's commit, when the recording has one. */
  recordedRevision?: string;
  /** `version` from `/_app/version.json`; undefined when it did not answer. */
  buildName?: string;
  /** `revision` from `/version`; undefined when it did not answer. */
  revision?: string;
  /** Since 1.54.0: `buildId`, `builtAt` and `digest` (or `imageDigest`) from `/version`, when it sends them. */
  buildId?: string;
  versionBuiltAt?: string;
  digest?: string;
  /** Since 1.54.0: the `server` and `x-nf-request-id` response headers of either request, lower-cased names. */
  headers?: Record<string, string>;
}

const DIGEST = /^sha256:[0-9a-f]{64}$/;

/** Since 1.54.0: which kind of build answered, and its id when it said one. Pure. */
export function servingBuildOf(answers: Pick<ProductionAnswers, "buildId" | "versionBuiltAt" | "digest" | "headers">): NonNullable<ProductionBuild["servingBuild"]> {
  const server = answers.headers?.["server"] ?? "";
  const netlify = /netlify/i.test(server) || answers.headers?.["x-nf-request-id"] !== undefined;
  const digest = answers.digest !== undefined && DIGEST.test(answers.digest) ? answers.digest : undefined;
  const at = answers.versionBuiltAt !== undefined && !Number.isNaN(Date.parse(answers.versionBuiltAt)) ? new Date(answers.versionBuiltAt).toISOString() : undefined;
  const builtAtPart = at ? { builtAt: at } : {};
  if (digest && !netlify) return { kind: "image", id: digest, ...builtAtPart, evidence: "/version names the image digest" };
  if (netlify) return { kind: "netlify", ...(answers.buildId ? { id: token(answers.buildId) } : {}), ...builtAtPart, evidence: `${/netlify/i.test(server) ? "server: Netlify" : "an x-nf-request-id header"}${answers.buildId ? "; /version names the build id" : "; /version names no build id"}` };
  return { kind: "unknown", ...(answers.buildId ? { id: token(answers.buildId) } : {}), ...builtAtPart, evidence: server ? `server: ${token(server)}, and /version names no image digest` : "no server header, and /version names no image digest" };
}

/** Judge what production says about its build against the recorded candidate's commit. Pure. */
export function judgeProductionBuild(answers: ProductionAnswers): ProductionBuild {
  const recorded = answers.recordedRevision?.trim() || undefined;
  const name = answers.buildName;
  const revision = answers.revision;
  const namedRevision = revision !== undefined && revision.trim() !== "" && revision.trim().toLowerCase() !== "unknown" ? revision.trim() : undefined;
  const hashed = name !== undefined && HASHED_NAME.test(name.toLowerCase()) ? name.toLowerCase() : undefined;
  const at = builtAt(name);

  const byRevision = recorded !== undefined && namedRevision !== undefined && sameCommit(namedRevision, recorded);
  const byHash = recorded !== undefined && hashed !== undefined && hashedBuildName(recorded) === hashed;
  const status: ProductionBuildStatus = byRevision || byHash ? "match" : recorded !== undefined && (namedRevision !== undefined || hashed !== undefined) ? "differs" : "unknown";

  const says: string[] = [];
  if (namedRevision !== undefined) says.push(`/version names commit ${shortCommit(namedRevision)}`);
  else if (revision !== undefined) says.push("/version names no commit");
  else says.push("/version did not answer");
  if (at) says.push(`built at ${at} from an unnamed build`);
  else if (hashed) says.push(`build name ${hashed}`);
  else if (name !== undefined) says.push(`build name ${token(name)}, which is neither a commit hash nor a build time`);
  else says.push("/_app/version.json did not answer");

  const recordedText = recorded ? `the recorded candidate's commit ${shortCommit(recorded)}` : "the recorded candidate's commit (not recorded)";
  const summary =
    status === "match"
      ? `production serves ${recordedText} (${byRevision ? "/version names it" : "its build name is that commit's hash"})`
      : status === "differs"
        ? `production does not serve ${recordedText}: ${says.join("; ")}`
        : `cannot tell whether production serves ${recordedText}: ${says.join("; ")}`;

  return {
    url: answers.url,
    status,
    ...(recorded ? { recordedRevision: recorded } : {}),
    ...(name !== undefined ? { buildName: name } : {}),
    ...(at ? { builtAt: at } : {}),
    ...(revision !== undefined ? { revision } : {}),
    servingBuild: servingBuildOf(answers),
    summary
  };
}

/**
 * Since 1.54.0: the WARN line when the release that was deployed was judged on pinned images and Netlify serves it: the
 * judged artefact is not the one students get. Undefined otherwise.
 */
export function servingBuildReason(build: ProductionBuild | undefined, pinned: boolean | undefined): string | undefined {
  if (!build?.servingBuild || build.servingBuild.kind !== "netlify" || pinned !== true) return undefined;
  return `PRODUCTION IS NOT THE PINNED ARTEFACT: the release was judged on images pinned by digest, and production is served by a Netlify build${build.servingBuild.id ? ` (${build.servingBuild.id})` : ""} (${build.servingBuild.evidence}). The verdict is WARN, never FAIL: until the cutover the Gate speaks about the image, not what students get.`;
}

/** The line `reasons` gets for anything but a match. */
export function productionBuildReason(build: ProductionBuild): string | undefined {
  if (build.status === "match") return undefined;
  const head = build.status === "differs" ? "PRODUCTION BUILD DIFFERS" : "PRODUCTION BUILD NOT CONFIRMED";
  return `${head}: ${build.summary}. Informational: the verdict is unchanged.`;
}

const SERVING_HEADERS = ["server", "x-nf-request-id"] as const;

/** GET a JSON document; undefined for anything but a 2xx JSON answer in time, with the serving headers of any answer. Never throws. */
async function getJson(url: string, timeoutMs: number): Promise<{ doc?: unknown; headers: Record<string, string> }> {
  try {
    const response = await fetch(url, { redirect: "follow", headers: { accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
    const headers: Record<string, string> = {};
    for (const name of SERVING_HEADERS) {
      const value = response.headers.get(name);
      if (value !== null) headers[name] = value.slice(0, MAX_VALUE);
    }
    if (!response.ok) return { headers };
    return { doc: JSON.parse(await response.text()) as unknown, headers };
  } catch {
    return { headers: {} };
  }
}

const field = (doc: unknown, key: string): string | undefined => {
  if (!doc || typeof doc !== "object") return undefined;
  const value = (doc as Record<string, unknown>)[key];
  return typeof value === "string" ? value.slice(0, MAX_VALUE) : typeof value === "number" && Number.isFinite(value) ? String(value) : undefined;
};

/** Ask production's reader which build it serves and judge it against the recorded commit. Never throws. */
export async function readProductionBuild(readerUrl: string, recordedRevision: string | undefined, opts: { timeoutMs?: number } = {}): Promise<ProductionBuild> {
  const base = readerUrl.replace(/\/+$/, "");
  const timeoutMs = opts.timeoutMs ?? PRODUCTION_BUILD_TIMEOUT_MS;
  const [app, version] = await Promise.all([getJson(`${base}/_app/version.json`, timeoutMs), getJson(`${base}/version`, timeoutMs)]);
  const buildName = field(app.doc, "version");
  const revision = field(version.doc, "revision");
  const buildId = field(version.doc, "buildId");
  const versionBuiltAt = field(version.doc, "builtAt");
  const digest = field(version.doc, "digest") ?? field(version.doc, "imageDigest");
  const headers = { ...app.headers, ...version.headers };
  return judgeProductionBuild({ url: base, ...(recordedRevision ? { recordedRevision } : {}), ...(buildName !== undefined ? { buildName } : {}), ...(revision !== undefined ? { revision } : {}), ...(buildId !== undefined ? { buildId } : {}), ...(versionBuiltAt !== undefined ? { versionBuiltAt } : {}), ...(digest !== undefined ? { digest } : {}), headers });
}
