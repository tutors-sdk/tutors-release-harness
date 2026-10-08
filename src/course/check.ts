import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { MANIFEST, type CourseManifest } from "./capture.ts";
import { readerRoutes, sampleRoutes } from "./routes.ts";

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
}

export interface CourseCheck {
  schema: typeof CHECK_SCHEMA;
  course: { id: string; servedAs: string; title?: string };
  checkedAt: string;
  harness: { version: string };
  files: { checked: number; problems: string[] };
  reader?: string;
  pages?: { routes: number; sampled: number; ok: number; failed: number; medianMs?: number; maxMs?: number; results: PageResult[] };
}

/** What the check needs of a browser; a fake in the unit tests, Playwright's Chromium for real. */
export interface BrowserDriver {
  open(url: string, title: string, courseOrigin: string, timeoutMs: number): Promise<Omit<PageResult, "path" | "type" | "title">>;
  close(): Promise<void>;
}

export interface CheckOptions {
  /** A course folder of a capture (it holds course-capture.json). */
  dir: string;
  port: number;
  reader?: string;
  /** Pages to open; 0 is every page. */
  sample: number;
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
    try {
      for (const r of sample) {
        const res = await driver.open(`${reader}${r.path}`, r.title, server.origin, o.timeoutMs);
        results.push({ path: r.path, type: r.type, title: r.title, ...res });
        log(`  ${res.ok ? "ok  " : "FAIL"} ${String(res.ms).padStart(6)} ms  ${r.path}${res.error ? `  (${res.error})` : ""}`);
      }
    } finally {
      await driver.close();
    }
    const ok = results.filter((r) => r.ok);
    const ms = ok.map((r) => r.ms);
    const med = median(ms);
    check.reader = reader;
    check.pages = { routes: routes.length, sampled: sample.length, ok: ok.length, failed: results.length - ok.length, ...(med !== undefined ? { medianMs: med, maxMs: Math.max(...ms) } : {}), results };
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
    async open(url, title, courseOrigin, timeoutMs) {
      const page = await browser.newPage();
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
        return { ok: true, ms: Date.now() - start, failedRequests, pageErrors };
      } catch (e) {
        const error = e instanceof Error ? e.message.split("\n")[0]! : String(e);
        return { ok: false, ms: Date.now() - start, error: title ? `title "${title}" not shown: ${error}` : error, failedRequests, pageErrors };
      } finally {
        await page.close();
      }
    },
    close: () => browser.close()
  };
}
