import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { BrowserContext, Route } from "playwright";
import { thirdPartyCacheDir } from "../local/home.ts";

/**
 * Third-party hosts the Tutors apps load in the browser, answered from one recorded copy.
 *
 * The course shell loads its typeface from Google Fonts, its icons from the Iconify API on first use, and the reader
 * the KaTeX stylesheet from jsDelivr. Fetched live, each arrives when the network lets it: a screenshot taken on one
 * side after an icon or the font arrived and on the other before it differed in an A/A ("reader:home: 0.37% of pixels
 * differ"), and an outage of any of them broke a run that had nothing to do with them.
 *
 * So the browser never fetches them itself. The first request for a URL is fetched once (by Node, see `liveFetcher`) and recorded:
 * status, the headers that describe the content (not the ones that describe the moment: date, age, expires, cookies,
 * the CDN's own ids), and the body. Every later request for it, on either side, in every run and every later run on
 * this machine, is fulfilled from that record: the same bytes on both sides, at once.
 *
 * The records live in one directory (HARNESS_THIRD_PARTY_CACHE_DIR, else <HARNESS_HOME>/third-party-cache), which CI
 * restores and saves with actions/cache, so a run does not depend on the hosts being up. A URL that was never recorded
 * and cannot be fetched now (host unreachable, or a 5xx) is answered with the same failure for the rest of the process,
 * so both sides see it alike; it is not written down, and the next run tries again. Delete the directory to re-record.
 */

/** The hosts answered from the record. Iconify's API has fallback hosts the client tries when the first does not answer. */
export const THIRD_PARTY_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "api.iconify.design", "api.simplesvg.com", "api.unisvg.com", "cdn.jsdelivr.net"] as const;

/** Any http(s) URL on one of THIRD_PARTY_HOSTS (the host exactly, any path). */
export const THIRD_PARTY_URL = new RegExp(`^https?://(${THIRD_PARTY_HOSTS.map((h) => h.replaceAll(".", "\\.")).join("|")})(:\\d+)?(/|$)`);

/** The status a URL that was never recorded and cannot be fetched now is answered with. */
export const UNREACHABLE_STATUS = 504;

/**
 * Response headers that describe the moment or the CDN node, not the content, and are dropped from a record: the two
 * sides (and two nights) would otherwise be served different ones. The encoding and length go too: `route.fetch`
 * hands back the decoded body, and `fulfill` sets the length of what it sends.
 */
const VOLATILE_HEADERS = new Set([
  "date",
  "age",
  "expires",
  "last-modified",
  "set-cookie",
  "server-timing",
  "report-to",
  "nel",
  "alt-svc",
  "via",
  "x-served-by",
  "x-cache",
  "x-cache-hits",
  "x-timer",
  "x-request-id",
  "x-jsd-version",
  "x-jsd-version-type",
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive"
]);
const VOLATILE_PREFIXES = ["cf-", "x-amz-", "x-goog-", "x-guploader-", "x-fastly-", "x-proxy-"];

/** The headers of a response a record keeps: lower-cased names, volatile ones dropped, sorted so the record is stable. */
export function stableHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers)
      .map(([k, v]) => [k.toLowerCase(), v] as const)
      .filter(([k]) => !VOLATILE_HEADERS.has(k) && !VOLATILE_PREFIXES.some((p) => k.startsWith(p)))
      .sort(([x], [y]) => x.localeCompare(y))
  );
}

/** What a third-party URL is answered with. */
export interface Recorded {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

/** Fetch a URL live: the real one is `route.fetch`; a test hands in its own. Throws when the host cannot be reached. */
export type Fetcher = (url: string) => Promise<{ status: number; headers: Record<string, string>; body: Buffer }>;

interface OnDisk {
  url: string;
  status: number;
  headers: Record<string, string>;
  /** base64 */
  body: string;
}

/** The record-once cache. One per directory per process (see `thirdPartyCache`), shared by both sides and every journey. */
export class ThirdPartyCache {
  private readonly memory = new Map<string, Promise<Recorded>>();

  /** `dir` undefined keeps the records in memory only (both sides of one run still see the same bytes). */
  constructor(readonly dir: string | undefined) {}

  /** The file a URL is recorded in. */
  fileFor(url: string): string | undefined {
    return this.dir ? join(this.dir, `${createHash("sha256").update(url).digest("hex").slice(0, 40)}.json`) : undefined;
  }

  /** The recorded answer for `url`: from memory, else from disk, else fetched once with `fetcher` (and recorded when it is not a failure). */
  get(url: string, fetcher: Fetcher): Promise<Recorded> {
    let answer = this.memory.get(url);
    if (!answer) {
      answer = this.load(url, fetcher);
      this.memory.set(url, answer);
    }
    return answer;
  }

  private async load(url: string, fetcher: Fetcher): Promise<Recorded> {
    const onDisk = this.read(url);
    if (onDisk) return onDisk;
    let fetched: Awaited<ReturnType<Fetcher>>;
    try {
      fetched = await fetcher(url);
    } catch {
      return unreachable(url);
    }
    const recorded: Recorded = { url, status: fetched.status, headers: stableHeaders(fetched.headers), body: fetched.body };
    // A 5xx is the host having a bad moment, not the content: answered alike for the rest of this process, never written down.
    if (recorded.status < 500) this.write(recorded);
    return recorded;
  }

  private read(url: string): Recorded | undefined {
    const file = this.fileFor(url);
    if (!file || !existsSync(file)) return undefined;
    try {
      const raw = JSON.parse(readFileSync(file, "utf8")) as OnDisk;
      if (raw.url !== url || typeof raw.status !== "number" || typeof raw.body !== "string") return undefined;
      return { url, status: raw.status, headers: raw.headers ?? {}, body: Buffer.from(raw.body, "base64") };
    } catch {
      return undefined; // a torn or foreign file is a miss, and is overwritten by the next record
    }
  }

  private write(recorded: Recorded): void {
    const file = this.fileFor(recorded.url);
    if (!file || !this.dir) return;
    try {
      mkdirSync(this.dir, { recursive: true });
      const body: OnDisk = { url: recorded.url, status: recorded.status, headers: recorded.headers, body: recorded.body.toString("base64") };
      // Written beside and renamed over, so a reader in another process never sees half a record.
      const tmp = `${file}.${process.pid}.tmp`;
      writeFileSync(tmp, `${JSON.stringify(body, null, 2)}\n`);
      renameSync(tmp, file);
    } catch {
      // Not persisted: this process still answers from memory, and the next run records it again.
    }
  }
}

function unreachable(url: string): Recorded {
  const host = new URL(url).host;
  return {
    url,
    status: UNREACHABLE_STATUS,
    headers: { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*" },
    // No error text from the network stack in the body: it is the same on both sides whatever the stack said.
    body: Buffer.from(`${host} was unreachable and ${url} has no recorded copy (harness third-party cache)\n`)
  };
}

const caches = new Map<string, ThirdPartyCache>();

/** The one cache for `dir` in this process, so both sides (captured one after the other) share the records and the in-flight fetches. */
export function thirdPartyCache(dir: string = thirdPartyCacheDir()): ThirdPartyCache {
  let cache = caches.get(dir);
  if (!cache) {
    cache = new ThirdPartyCache(dir);
    caches.set(dir, cache);
  }
  return cache;
}

/** How long one live fetch of a third-party URL may take before the host counts as unreachable. */
export const FETCH_TIMEOUT_MS = 15_000;

/** Request headers passed on to the live fetch: what the host picks its content by (Google Fonts serves by user agent), nothing about the side. */
const FORWARDED = ["user-agent", "accept", "accept-language"];

/**
 * The live fetch: Node's own, not `route.fetch`. The first request for a URL can come from a page whose journey ends
 * (and whose context closes) before the answer arrives; `route.fetch` would then fail, and the failure would be kept as
 * the answer for the rest of the run, so the other side would be served an outage that never happened.
 */
export function liveFetcher(requestHeaders: Record<string, string>, timeoutMs = FETCH_TIMEOUT_MS): Fetcher {
  const headers = Object.fromEntries(Object.entries(requestHeaders).filter(([k]) => FORWARDED.includes(k.toLowerCase())));
  return async (url) => {
    const response = await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
    return { status: response.status, headers: Object.fromEntries(response.headers.entries()), body: Buffer.from(await response.arrayBuffer()) };
  };
}

/** Answer one intercepted request from the cache. Only GET is recorded; anything else goes to the network as before. */
export async function answerFromCache(route: Route, cache: ThirdPartyCache, fetcher: (headers: Record<string, string>) => Fetcher = liveFetcher): Promise<void> {
  const request = route.request();
  if (request.method() !== "GET") {
    await route.fallback();
    return;
  }
  const recorded = await cache.get(request.url(), fetcher(request.headers()));
  // Any origin may read it: the host answered the first side's origin, and the other side's differs (its port).
  const headers = "access-control-allow-origin" in recorded.headers ? { ...recorded.headers, "access-control-allow-origin": "*" } : recorded.headers;
  // The page may have gone (the journey moved on) while the first fetch was in flight: nothing is left to answer.
  await route.fulfill({ status: recorded.status, headers, body: recorded.body }).catch(() => undefined);
}

/** Route every THIRD_PARTY_HOSTS request of `context` through `cache`. */
export async function routeThirdParty(context: BrowserContext, cache: ThirdPartyCache = thirdPartyCache()): Promise<void> {
  await context.route(THIRD_PARTY_URL, (route) => answerFromCache(route, cache));
}
