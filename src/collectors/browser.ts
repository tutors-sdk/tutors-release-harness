import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { AxeBuilder } from "@axe-core/playwright";
import { chromium, type Browser, type BrowserContext, type Page, type Response } from "playwright";
import type { Journey } from "../../traffic/journeys/journeys.ts";
import { reference } from "../../traffic/journeys/reference.ts";
import { redactSecrets } from "../normalise/redact.ts";
import { IDENTITY_URL } from "../stack.ts";
import type { AxeFinding, ConsoleEntry, JourneyCapture, NetworkEntry, PageCapture, SideSpec, Timing } from "../types.ts";

export interface BrowserCaptureOptions {
  /** Absolute directory the side's screenshots are written under. */
  outDir: string;
  /** Frozen wall clock for the page. */
  now: string;
  screenshots: boolean;
  axe: boolean;
  /** How many Tab presses the keyboard-order walk records per page. */
  focusStops: number;
}

const VIEWPORT = { width: 1280, height: 800 };
const MAX_HASHED_BODY = 512 * 1024;

/**
 * One browser for the whole run. `*.harness.test` resolves to the host, so the
 * page can reach each side's persistence stub at the same name the containers
 * use (see compose.harness.yaml extra_hosts).
 */
export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({ args: ['--host-resolver-rules=MAP *.harness.test 127.0.0.1'] });
}

/**
 * Replace a side's own origins with {{origin}} and every course host the
 * journeys use with {{course}} so the two sides' captures are comparable.
 * This is structural, not a mask: both sides necessarily answer on different
 * ports, and nothing about that is a finding. The course hosts are the same on
 * both sides in a run; they are normalised so a recorded run compares with a
 * later one that pins the course elsewhere.
 *
 * Secret-shaped values (an `apikey=` in a logged URL, a bearer token, a JWT) are
 * redacted here too, so `capture.json` does not hold them; `normalise()` redacts
 * again for captures recorded before this (src/normalise/redact.ts).
 */
export function stripOrigins(text: string, spec: SideSpec): string {
  let out = text;
  const origins = [spec.urls.reader, spec.urls.catalogue, spec.urls.live, spec.urls.time, spec.urls.readerAuth, spec.urls.persistence].filter((o): o is string => !!o);
  for (const origin of origins) {
    out = out.split(origin).join("{{origin}}");
    // The same origin over a WebSocket (`ws://persistence-a.harness.test:8090/realtime/...`, which the browser prints in a
    // console error): the two sides' stubs are on different ports and are the same finding-free noise as their http origins.
    const socket = origin.replace(/^http/, "ws");
    if (socket !== origin) out = out.split(socket).join("{{origin}}");
  }
  const courseHosts = [...new Set([spec.urls.courseId, reference.host, reference.courseId])].sort((x, y) => y.length - x.length);
  for (const host of courseHosts) for (const scheme of ["http://", "https://"]) out = out.split(`${scheme}${host}`).join("{{course}}");
  return redactSecrets(out);
}

/** How long to wait for a JSON response body before recording it as unread. */
const BODY_READ_MS = 3_000;

/** `NetworkEntry.schemaHash` of a JSON response whose body could not be read; never equal to a real hash. */
export const SCHEMA_UNREAD = "unread";

/** A hash of a JSON document's shape — keys and value types, not values — so data differences are not schema differences. */
export function schemaHash(json: unknown): string {
  const shape = (value: unknown): unknown => {
    if (Array.isArray(value)) return [value.length ? shape(value[0]) : "empty"];
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.keys(value as object)
          .sort()
          .map((k) => [k, shape((value as Record<string, unknown>)[k])])
      );
    }
    return value === null ? "null" : typeof value;
  };
  return createHash("sha256").update(JSON.stringify(shape(json))).digest("hex").slice(0, 16);
}

async function entryFor(response: Response, spec: SideSpec): Promise<NetworkEntry> {
  const request = response.request();
  const headers = response.headers();
  const contentType = headers["content-type"] ?? "";
  let hash = "";
  if (/json/.test(contentType) && response.status() < 300) {
    let timer: NodeJS.Timeout | undefined;
    try {
      // Bounded: the browser only finishes a body that someone reads. A page that fires a request and never reads its
      // response (the anon-write mutant's fetch, or a beacon) can leave `text()` pending until the context closes, and an
      // unbounded await here stalled the whole run for as long as anyone was willing to wait.
      const text = await Promise.race([response.text(), new Promise<never>((_, reject) => (timer = setTimeout(() => reject(new Error("body not read")), BODY_READ_MS)))]);
      if (text.length <= MAX_HASHED_BODY) hash = schemaHash(JSON.parse(text));
    } catch {
      // The browser dropped the body (the page navigated away while an invalidation request was in flight) or it was not
      // valid JSON: say that this side's body was not read, rather than that it had no shape. The engine does not compare
      // a shape against "not read" (that is timing, not the release), and still compares status and content type.
      hash = SCHEMA_UNREAD;
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    method: request.method(),
    url: stripOrigins(response.url(), spec),
    status: response.status(),
    contentType,
    cacheControl: headers["cache-control"] ?? "",
    schemaHash: hash
  };
}

const NO_TIMING: Timing = { ttfbMs: -1, responseEndMs: -1 };

/**
 * Document timing from Playwright's own network stack. The Performance API is
 * not an option: the frozen page clock (fixtures/clock) replaces `performance`
 * and leaves no navigation entries.
 */
function timingOf(response: Response | undefined): Timing {
  if (!response) return NO_TIMING;
  const t = response.request().timing();
  if (t.responseStart < 0) return NO_TIMING;
  return { ttfbMs: Math.round(t.responseStart - Math.max(t.requestStart, 0)), responseEndMs: Math.round(t.responseEnd) };
}

async function axeOn(page: Page): Promise<AxeFinding[]> {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return results.violations
    .flatMap((v) => v.nodes.map((n) => ({ rule: v.id, impact: v.impact ?? "unknown", target: n.target.join(" ") })))
    .sort((x, y) => `${x.rule} ${x.target}`.localeCompare(`${y.rule} ${y.target}`));
}

/**
 * Keyboard order: what receives focus on each successive Tab from the top of
 * the page. Roles and names only, so the sequence survives markup churn but
 * not a lost focus stop or a reordered one.
 */
async function focusWalk(page: Page, stops: number): Promise<string[]> {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.scrollTo(0, 0);
  });
  const seen: string[] = [];
  for (let i = 0; i < stops; i += 1) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return "(body)";
      const role = el.getAttribute("role") ?? el.tagName.toLowerCase();
      const name = (el.getAttribute("aria-label") ?? el.getAttribute("title") ?? el.innerText ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
      return `${role} "${name}"`;
    });
    if (label === "(body)" && seen.length) break;
    seen.push(label);
  }
  return seen;
}

async function newContext(browser: Browser, now: string): Promise<BrowserContext> {
  // Everything that could differ between two runs on the same machine is pinned.
  return browser.newContext({
    viewport: VIEWPORT,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-IE",
    timezoneId: "Europe/Dublin",
    ignoreHTTPSErrors: true,
    userAgent: `tutors-release-harness (${now})`
  });
}

/**
 * Send the browser's GitHub OAuth hops to the identity stub. The reader
 * redirects to https://github.com/login/oauth/authorize; the stub answers on
 * the host's published port and redirects straight back to the callback.
 */
async function routeIdentity(context: BrowserContext) {
  await context.route(/^https:\/\/(api\.)?github\.com\//, async (route) => {
    const original = new URL(route.request().url());
    const target = `${IDENTITY_URL}${original.pathname}${original.search}`;
    try {
      const response = await route.fetch({ url: target, maxRedirects: 0 });
      await route.fulfill({ response });
    } catch (error) {
      await route.fulfill({ status: 502, body: `identity stub unreachable at ${target}: ${error instanceof Error ? error.message : error}` });
    }
  });
}

/**
 * Run one journey against one side and capture everything observable at every
 * page it reaches. A journey that throws is recorded with its error and the
 * pages it did reach; the run continues with the next journey.
 */
export async function captureJourney(browser: Browser, spec: SideSpec, journey: Journey, run: number, opts: BrowserCaptureOptions): Promise<JourneyCapture> {
  const context = await newContext(browser, opts.now);
  if (journey.target === "readerAuth") await routeIdentity(context);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(opts.now));

  const pages: PageCapture[] = [];
  let pendingNetwork: Promise<NetworkEntry>[] = [];
  let pendingConsole: ConsoleEntry[] = [];
  let documentResponse: Response | undefined;

  page.on("response", (response) => {
    pendingNetwork.push(entryFor(response, spec));
    if (response.request().isNavigationRequest() && response.frame() === page.mainFrame()) documentResponse = response;
  });
  page.on("console", (message) => {
    const type = message.type();
    if (type === "error" || type === "warning") pendingConsole.push({ level: type, text: stripOrigins(message.text(), spec) });
  });
  page.on("pageerror", (error) => pendingConsole.push({ level: "error", text: stripOrigins(error.message, spec) }));

  const shotDir = join(opts.outDir, `${journey.name}-${run}`);
  if (opts.screenshots) mkdirSync(shotDir, { recursive: true });

  const started = Date.now();
  let error: string | undefined;
  try {
    await journey.run(page, spec.urls, async (pageKey) => {
      // Let in-flight requests settle so the network set is the page's, not the race's.
      await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
      const network = (await Promise.all(pendingNetwork)).sort((x, y) => `${x.method} ${x.url}`.localeCompare(`${y.method} ${y.url}`));
      pendingNetwork = [];
      const consoleEntries = pendingConsole.sort((x, y) => `${x.level} ${x.text}`.localeCompare(`${y.level} ${y.text}`));
      pendingConsole = [];

      // Headers and timing belong to the document request only. After a
      // client-side route change the last document response is a different
      // page's, so the page gets none rather than a stale set.
      const isDocument = documentResponse !== undefined && documentResponse.url() === page.url();
      const capture: PageCapture = {
        pageKey,
        path: stripOrigins(page.url(), spec).replace("{{origin}}", ""),
        aria: stripOrigins(await page.locator("body").ariaSnapshot(), spec),
        headers: isDocument ? { ...documentResponse!.headers() } : {},
        network,
        console: consoleEntries,
        axe: opts.axe ? await axeOn(page) : [],
        focus: [],
        timing: isDocument ? timingOf(documentResponse) : timingOf(undefined)
      };
      if (opts.screenshots) {
        // The course shell loads its typeface from Google Fonts with display=swap, so until the font
        // arrives the page paints in the fallback face, and a screenshot taken on that race can differ
        // between two identical sides. Wait for the fonts the page has asked for (bounded, so a
        // font that never loads cannot hang the run; it then shows in the screenshot as it would to a person).
        await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5_000))])).catch(() => undefined);
        // No ":" in file names: NTFS reads "reader:home.png" as an alternate data stream of "reader".
        const file = join(shotDir, `${pageKey.replace(/[^a-z0-9-]/gi, "_")}.png`);
        await page.screenshot({ path: file, animations: "disabled", caret: "hide", fullPage: false });
        capture.screenshot = file.slice(opts.outDir.length + 1).replaceAll("\\", "/");
      }
      // Last, because it moves focus.
      if (opts.focusStops > 0) capture.focus = await focusWalk(page, opts.focusStops);
      pages.push(capture);
    });
  } catch (e) {
    error = e instanceof Error ? stripOrigins(e.message.split("\n")[0] ?? e.message, spec) : String(e);
  } finally {
    await context.close();
  }

  const result: JourneyCapture = { journey: journey.name, run, anonymous: journey.anonymous, durationMs: Date.now() - started, pages, persistence: [] };
  if (error !== undefined) result.error = error;
  return result;
}
