import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { AxeBuilder } from "@axe-core/playwright";
import type { Browser, BrowserContext, Page, Response } from "playwright";
import type { Journey } from "../../traffic/journeys/journeys.ts";
import type { AxeFinding, ConsoleEntry, JourneyCapture, NetworkEntry, PageCapture, SideSpec, Timing } from "../types.ts";

export interface BrowserCaptureOptions {
  /** Absolute directory the side's screenshots are written under. */
  outDir: string;
  /** Frozen wall clock for the page. */
  now: string;
  screenshots: boolean;
  axe: boolean;
}

const VIEWPORT = { width: 1280, height: 800 };
const MAX_HASHED_BODY = 512 * 1024;

/**
 * Replace a side's own origins with a placeholder so the two sides' captures
 * are comparable. This is structural, not a mask: both sides necessarily
 * answer on different ports, and nothing about that is a finding.
 */
export function stripOrigins(text: string, spec: SideSpec): string {
  let out = text;
  for (const origin of [spec.urls.reader, spec.urls.catalogue, spec.urls.live]) {
    out = out.split(origin).join("{{origin}}");
  }
  return out;
}

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
    try {
      const text = await response.text();
      if (text.length <= MAX_HASHED_BODY) hash = schemaHash(JSON.parse(text));
    } catch {
      hash = "";
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
 * Run one journey against one side and capture everything observable at every
 * page it reaches. A journey that throws is recorded with its error and the
 * pages it did reach; the run continues with the next journey.
 */
export async function captureJourney(browser: Browser, spec: SideSpec, journey: Journey, run: number, opts: BrowserCaptureOptions): Promise<JourneyCapture> {
  const context = await newContext(browser, opts.now);
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
        timing: isDocument ? timingOf(documentResponse) : timingOf(undefined)
      };
      if (opts.screenshots) {
        // No ":" in file names: NTFS reads "reader:home.png" as an alternate data stream of "reader".
        const file = join(shotDir, `${pageKey.replace(/[^a-z0-9-]/gi, "_")}.png`);
        await page.screenshot({ path: file, animations: "disabled", caret: "hide", fullPage: false });
        capture.screenshot = file.slice(opts.outDir.length + 1).replaceAll("\\", "/");
      }
      pages.push(capture);
    });
  } catch (e) {
    error = e instanceof Error ? stripOrigins(e.message.split("\n")[0] ?? e.message, spec) : String(e);
  } finally {
    await context.close();
  }

  const result: JourneyCapture = { journey: journey.name, run, durationMs: Date.now() - started, pages };
  if (error !== undefined) result.error = error;
  return result;
}
