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
    summary
  };
}

/** The line `reasons` gets for anything but a match. */
export function productionBuildReason(build: ProductionBuild): string | undefined {
  if (build.status === "match") return undefined;
  const head = build.status === "differs" ? "PRODUCTION BUILD DIFFERS" : "PRODUCTION BUILD NOT CONFIRMED";
  return `${head}: ${build.summary}. Informational: the verdict is unchanged.`;
}

/** GET a JSON document; undefined for anything but a 2xx JSON answer in time. Never throws. */
async function getJson(url: string, timeoutMs: number): Promise<unknown> {
  try {
    const response = await fetch(url, { redirect: "follow", headers: { accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return undefined;
    return JSON.parse(await response.text()) as unknown;
  } catch {
    return undefined;
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
  const buildName = field(app, "version");
  const revision = field(version, "revision");
  return judgeProductionBuild({ url: base, ...(recordedRevision ? { recordedRevision } : {}), ...(buildName !== undefined ? { buildName } : {}), ...(revision !== undefined ? { revision } : {}) });
}
