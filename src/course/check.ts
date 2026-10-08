import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { MANIFEST, type CourseManifest } from "./capture.ts";
import { headingKey, readerJourneys, readerRoutes, sampleRoutes, type ReaderRoute } from "./routes.ts";

/**
 * `harness course check`: does a captured course load? Two layers, each saying what it proves.
 *
 *   files   the capture is served, on the fixture course server, as it was captured: every file course-capture.json
 *           lists answers 200 with its sha256. Plain HTTP; no reader needed.
 *   pages   with --reader: a reader opens the course from that server. The reader is client-rendered (every page has
 *           ssr = false), so an HTTP GET of /course/<id> is the same shell whether or not the course works; only a
 *           browser shows it loading. A fixed sample of pages (--sample) is opened and each must show its title.
 *           Every request to the course host that fails, and every page error, is recorded with the page.
 *
 * Since 1.32.0 each page is also read as a student meets it (`experience`): the text and headings it shows, the
 * course images that did not load, the links to other pages of the course that lead nowhere, and the serious or
 * critical accessibility violations. And a few student journeys (`journeys`) are clicked through: the course page, a
 * topic, a lab and its steps, each reached by clicking its link on the page before, as a student would.
 *
 * The course is served as course id localhost:<port>, the way the reader reads the fixture course.
 */

export const CHECK_SCHEMA = "tutors-course-check/1";
export const CHECK_FILE = "course-check.json";
export const SERVER = fileURLToPath(new URL("../../fixtures/course-server/serve.mjs", import.meta.url));

export interface PageResult {
  path: string;
  type: string;
  title: string;
  ok: boolean;
  /** From navigation to the title visible, in milliseconds; the time to the error on a failure. */
  ms: number;
  error?: string;
  /** Requests to the course host that failed or answered 400 or more: `404 /unit-1/x.png`. */
  failedRequests: string[];
  /** Uncaught page errors and console errors. */
  pageErrors: string[];
  /** Since 1.32.0: what a student meets on the page once its title shows. */
  experience?: PageExperience;
}

/** Since 1.32.0: the page as a student meets it. Lists are capped at 10 and sorted, so two runs compare. */
export interface PageExperience {
  /** Characters of visible text on the page. */
  textChars: number;
  /** The h1 to h3 headings the page shows that its author wrote in its markdown, in order (at most 40). */
  headings: string[];
  /** Images from the course host on the page, and those that did not load (path on the course host). */
  images: { total: number; broken: string[] };
  /** Links to pages of this course, and those whose page is not in tutors.json (reader path). */
  links: { course: number; broken: string[] };
  /** Serious and critical accessibility violations by rule id (axe, WCAG 2.1 A and AA); absent when axe did not run. */
  axe?: string[];
}

/** Since 1.32.0: one page of a journey, reached by clicking its link on the page before (`via: "click"`). */
export interface JourneyStep {
  path: string;
  title: string;
  ok: boolean;
  /** start: opened by address; click: reached by clicking a link to it; no link: no link to it, so opened by address. */
  via: "start" | "click" | "no link";
  ms: number;
  error?: string;
}

export interface JourneyResult {
  name: string;
  /** The lab's reader path: what a journey is known by from run to run. */
  lab: string;
  /** Every step reached by clicking and showing its title. */
  ok: boolean;
  steps: JourneyStep[];
}

export interface CourseCheck {
  schema: typeof CHECK_SCHEMA;
  course: { id: string; servedAs: string; title?: string };
  checkedAt: string;
  harness: { version: string };
  files: { checked: number; problems: string[] };
  reader?: string;
  pages?: { routes: number; sampled: number; ok: number; failed: number; medianMs?: number; maxMs?: number; results: PageResult[] };
  /** Since 1.32.0, with a reader: the student journeys clicked through. */
  journeys?: JourneyResult[];
}

/** What the driver needs to read a page as a student meets it. */
export interface Probe {
  /** The reader paths of every page of the course, from tutors.json. */
  routes: Set<string>;
  /** The course id the reader reads (localhost:<port>). */
  courseId: string;
  axe: boolean;
  /** The headings the author wrote in this page's markdown; only those are read off the page. */
  headings?: string[];
}

/** What the check needs of a browser; a fake in the unit tests, Playwright's Chromium for real. */
export interface BrowserDriver {
  open(url: string, title: string, courseOrigin: string, timeoutMs: number, probe?: Probe): Promise<Omit<PageResult, "path" | "type" | "title">>;
  /** Since 1.32.0: open the first step by address, then reach each next one by clicking its link. */
  walk?(reader: string, steps: ReaderRoute[], timeoutMs: number): Promise<JourneyStep[]>;
  close(): Promise<void>;
}

export interface CheckOptions {
  /** A course folder of a capture (it holds course-capture.json). */
  dir: string;
  port: number;
  reader?: string;
  /** Pages to open; 0 is every page. */
  sample: number;
  /** Since 1.32.0: student journeys to click through (default 2; 0 for none). */
  journeys?: number;
  /** Since 1.32.0: run axe on each page (default true). */
  axe?: boolean;
  timeoutMs: number;
  harnessVersion: string;
  driver?: () => Promise<BrowserDriver>;
  now?: () => Date;
  log?: (line: string) => void;
}

/** The fixture course server on `port`, serving `dir`; resolves once it listens. */
export function startCourseServer(dir: string, port: number): Promise<{ origin: string; stop: () => void }> {
  return new Promise((ready, failed) => {
    const child: ChildProcess = spawn(process.execPath, [SERVER, dir, String(port)], { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    child.stderr!.on("data", (d: Buffer) => (err += d.toString()));
    child.stdout!.on("data", (d: Buffer) => {
      if (d.toString().includes("listening")) ready({ origin: `http://localhost:${port}`, stop: () => child.kill() });
    });
    child.on("exit", (code) => failed(new Error(`the course server on port ${port} exited (${code})${err ? `: ${err.trim().split("\n")[0]}` : ""}`)));
  });
}

async function checkFiles(origin: string, manifest: CourseManifest): Promise<{ checked: number; problems: string[] }> {
  const all = [manifest.tutorsJson, ...manifest.files];
  const problems: string[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(16, all.length) }, async () => {
      while (next < all.length) {
        const f = all[next++]!;
        try {
          const res = await fetch(`${origin}/${f.path.split("/").map(encodeURIComponent).join("/")}`);
          const body = new Uint8Array(await res.arrayBuffer());
          if (!res.ok) problems.push(`${f.path}: HTTP ${res.status}`);
          else if (createHash("sha256").update(body).digest("hex") !== f.sha256) problems.push(`${f.path}: served bytes differ from the capture`);
        } catch (e) {
          problems.push(`${f.path}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    })
  );
  return { checked: all.length, problems: problems.sort() };
}

const median = (xs: number[]) => {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2);
};

export async function checkCourse(o: CheckOptions): Promise<CourseCheck> {
  const log = o.log ?? (() => {});
  const manifest = JSON.parse(readFileSync(join(o.dir, MANIFEST), "utf8")) as CourseManifest;
  const tree = JSON.parse(readFileSync(join(o.dir, "tutors.json"), "utf8")) as unknown;
  const servedAs = `localhost:${o.port}`;
  const server = await startCourseServer(o.dir, o.port);
  try {
    const files = await checkFiles(server.origin, manifest);
    log(`files: ${files.checked - files.problems.length} of ${files.checked} served as captured`);
    const check: CourseCheck = {
      schema: CHECK_SCHEMA,
      course: { id: manifest.course.id, servedAs, ...(manifest.course.title ? { title: manifest.course.title } : {}) },
      checkedAt: (o.now?.() ?? new Date()).toISOString(),
      harness: { version: o.harnessVersion },
      files
    };
    if (!o.reader) return check;

    const reader = o.reader.replace(/\/+$/, "");
    const routes = readerRoutes(tree, servedAs);
    const sample = sampleRoutes(routes, o.sample);
    log(`pages: opening ${sample.length} of ${routes.length} in ${reader}`);
    const driver = await (o.driver ?? (() => playwrightDriver()))();
    const results: PageResult[] = [];
    const probe: Probe = { routes: new Set(routes.map((r) => r.path)), courseId: servedAs, axe: o.axe ?? true };
    const journeys: JourneyResult[] = [];
    try {
      for (const r of sample) {
        const res = await driver.open(`${reader}${r.path}`, r.title, server.origin, o.timeoutMs, { ...probe, headings: r.headings ?? [] });
        results.push({ path: r.path, type: r.type, title: r.title, ...res });
        const e = res.experience;
        const notes = e ? [e.images.broken.length && `${e.images.broken.length} broken image(s)`, e.links.broken.length && `${e.links.broken.length} broken link(s)`, e.axe?.length && `a11y: ${e.axe.join(" ")}`].filter(Boolean).join(", ") : "";
        log(`  ${res.ok ? "ok  " : "FAIL"} ${String(res.ms).padStart(6)} ms  ${r.path}${res.error ? `  (${res.error})` : ""}${notes ? `  [${notes}]` : ""}`);
      }
      if (driver.walk) {
        for (const j of readerJourneys(tree, servedAs, o.journeys ?? 2)) {
          const steps = await driver.walk(reader, j.steps, o.timeoutMs);
          const ok = steps.every((s) => s.ok && s.via !== "no link");
          journeys.push({ name: j.name, lab: j.lab, ok, steps });
          log(`  ${ok ? "ok  " : "FAIL"} journey ${j.name}: ${steps.filter((s) => s.ok && s.via !== "no link").length} of ${steps.length} pages reached by clicking`);
        }
      }
    } finally {
      await driver.close();
    }
    const ok = results.filter((r) => r.ok);
    const ms = ok.map((r) => r.ms);
    const med = median(ms);
    check.reader = reader;
    check.pages = { routes: routes.length, sampled: sample.length, ok: ok.length, failed: results.length - ok.length, ...(med !== undefined ? { medianMs: med, maxMs: Math.max(...ms) } : {}), results };
    if (driver.walk) check.journeys = journeys;
    return check;
  } finally {
    server.stop();
  }
}

/** Chromium through Playwright, loaded only when pages are checked. */
export async function playwrightDriver(launch: { executablePath?: string } = {}): Promise<BrowserDriver> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch(launch);
  return {
    async open(url, title, courseOrigin, timeoutMs, probe) {
      // A context of its own: a fresh page each time, and what axe needs (it refuses browser.newPage()).
      const context = await browser.newContext();
      const page = await context.newPage();
      const failedRequests: string[] = [];
      const pageErrors: string[] = [];
      const onCourse = (u: string) => u.startsWith(courseOrigin);
      page.on("response", (res) => {
        if (onCourse(res.url()) && res.status() >= 400) failedRequests.push(`${res.status()} ${res.url().slice(courseOrigin.length)}`);
      });
      page.on("requestfailed", (req) => {
        if (onCourse(req.url())) failedRequests.push(`${req.failure()?.errorText ?? "failed"} ${req.url().slice(courseOrigin.length)}`);
      });
      page.on("pageerror", (e) => pageErrors.push(e.message.split("\n")[0]!));
      page.on("console", (m) => m.type() === "error" && pageErrors.push(m.text().split("\n")[0]!));
      const start = Date.now();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
        if (title) await page.getByText(title).first().waitFor({ state: "visible", timeout: timeoutMs });
        else await page.waitForLoadState("networkidle", { timeout: timeoutMs });
        const ms = Date.now() - start;
        const experience = probe ? await readExperience(page, courseOrigin, probe) : undefined;
        return { ok: true, ms, failedRequests: [...new Set(failedRequests)].sort(), pageErrors: [...new Set(pageErrors)].sort(), ...(experience ? { experience } : {}) };
      } catch (e) {
        const error = e instanceof Error ? e.message.split("\n")[0]! : String(e);
        return { ok: false, ms: Date.now() - start, error: title ? `title "${title}" not shown: ${error}` : error, failedRequests, pageErrors };
      } finally {
        await context.close();
      }
    },
    async walk(reader, steps, timeoutMs) {
      // A context of its own: a fresh page each time, and what axe needs (it refuses browser.newPage()).
      const context = await browser.newContext();
      const page = await context.newPage();
      const out: JourneyStep[] = [];
      try {
        for (const [i, step] of steps.entries()) {
          const start = Date.now();
          let via: JourneyStep["via"] = i === 0 ? "start" : "click";
          try {
            if (i === 0) await page.goto(`${reader}${step.path}`, { waitUntil: "domcontentloaded", timeout: timeoutMs });
            else {
              // The link a student would click: the first visible one to this page, else any (a collapsed menu).
              const clicked = await page.evaluate((path) => {
                const links = [...document.querySelectorAll("a[href]")] as HTMLAnchorElement[];
                const to = links.filter((a) => decodeURIComponent(new URL(a.href, location.href).pathname) === path);
                const link = to.find((a) => a.offsetParent !== null) ?? to[0];
                link?.click();
                return !!link;
              }, step.path);
              if (!clicked) {
                via = "no link";
                await page.goto(`${reader}${step.path}`, { waitUntil: "domcontentloaded", timeout: timeoutMs });
              } else await page.waitForURL((u) => decodeURIComponent(u.pathname) === step.path, { timeout: timeoutMs });
            }
            if (step.title) await page.getByText(step.title).first().waitFor({ state: "visible", timeout: timeoutMs });
            out.push({ path: step.path, title: step.title, ok: true, via, ms: Date.now() - start });
          } catch (e) {
            out.push({ path: step.path, title: step.title, ok: false, via, ms: Date.now() - start, error: e instanceof Error ? e.message.split("\n")[0]! : String(e) });
            break;
          }
        }
      } finally {
        await context.close();
      }
      return out;
    },
    close: () => browser.close()
  };
}

/** The page as a student meets it, once its title shows: give images a moment to load, then read the page. */
async function readExperience(page: import("playwright").Page, courseOrigin: string, probe: Probe): Promise<PageExperience> {
  await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
  const seen = await page.evaluate((origin) => {
    const imgs = ([...document.images] as HTMLImageElement[]).filter((i) => i.currentSrc.startsWith(origin) || i.src.startsWith(origin));
    return {
      textChars: (document.body?.innerText ?? "").replace(/\s+/g, " ").trim().length,
      headings: ([...document.querySelectorAll("h1, h2, h3")] as HTMLElement[]).map((h) => h.innerText.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 400),
      images: imgs.length,
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => (i.currentSrc || i.src).slice(origin.length)),
      paths: ([...document.querySelectorAll("a[href]")] as HTMLAnchorElement[]).map((a) => new URL(a.href, location.href)).filter((u) => u.origin === location.origin).map((u) => decodeURIComponent(u.pathname))
    };
  }, courseOrigin);
  // The reader's own headings ("Course Info", a course tree) change with its design; the author's are the course.
  const authored = new Set((probe.headings ?? []).map(headingKey));
  const headings = seen.headings.filter((h) => authored.has(headingKey(h))).slice(0, 40);
  const id = probe.courseId;
  const inCourse = [...new Set(seen.paths.map((p) => p.replace(/\/+$/, "")))].filter((p) => p.split("/")[2] === id && /^\/(course|topic|lab|note|talk|tutorial|notebook)\//.test(p));
  const broken = inCourse.filter((p) => !probe.routes.has(p));
  let axe: string[] | undefined;
  if (probe.axe) {
    try {
      const { AxeBuilder } = await import("@axe-core/playwright");
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      axe = [...new Set(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id))].sort();
    } catch {
      axe = undefined;
    }
  }
  const cap = (xs: string[]) => [...new Set(xs)].sort().slice(0, 10);
  return { textChars: seen.textChars, headings, images: { total: seen.images, broken: cap(seen.broken) }, links: { course: inCourse.length, broken: cap(broken) }, ...(axe ? { axe } : {}) };
}
