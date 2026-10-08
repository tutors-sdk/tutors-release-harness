/**
 * `harness course check` (since 1.30.0, docs/course-capture.md): a captured course is served as captured (HTTP), and a
 * reader shows its pages (a browser). The browser is a fake driver here; course-capture.yml runs Chromium against a
 * real reader.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { captureCourse, type FetchLike } from "../src/course/capture.ts";
import { checkCourse, CHECK_FILE, CHECK_SCHEMA, type BrowserDriver } from "../src/course/check.ts";
import { courseCommand } from "../src/course/command.ts";
import { CORPUS_FILE, loadCorpus, MAX_CORPUS } from "../src/course/corpus.ts";
import { parseCourseRef } from "../src/course/ref.ts";
import { readerRoutes, sampleRoutes } from "../src/course/routes.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FIXTURE = join(ROOT, "fixtures", "course-server", "course");
const tree = JSON.parse(readFileSync(join(FIXTURE, "tutors.json"), "utf8"));
const freePort = () => 20000 + Math.floor(Math.random() * 20000);

describe("readerRoutes and sampleRoutes", () => {
  const routes = readerRoutes(tree, "localhost:8090");

  it("the course page, then every page of the tree with its title; no unit, web link or archive", () => {
    expect(routes[0]).toEqual({ path: "/course/localhost:8090", type: "course", title: "Runway Fixture Course", headings: ["Runway Fixture Course"] });
    expect(routes.map((r) => r.type).filter((t, i, a) => a.indexOf(t) === i)).toEqual(["course", "topic", "talk", "lab", "step", "note"]);
    expect(routes).toContainEqual(expect.objectContaining({ path: "/lab/localhost:8090/unit-1/topic-01/book-lab-01/Step-01", type: "step", title: "Step 1" }));
    expect(routes.some((r) => r.path.endsWith("/"))).toBe(false);
    expect(routes).toHaveLength(1 + 2 + 2 + 2 + 12 + 2);
  });

  it("a fixed sample: the course page, the first of each type, then evenly spread; 0 is all", () => {
    const s = sampleRoutes(routes, 8);
    expect(s).toHaveLength(8);
    expect(s[0]!.type).toBe("course");
    for (const t of ["topic", "talk", "lab", "step", "note"]) expect(s.some((r) => r.type === t), t).toBe(true);
    expect(sampleRoutes(routes, 8)).toEqual(s);
    expect(sampleRoutes(routes, 0)).toEqual(routes);
    expect(sampleRoutes(routes, 100)).toEqual(routes);
    expect(sampleRoutes(routes, 1)).toEqual([routes[0]]);
  });
});

/** A driver that answers ok for every page except the paths it is told to fail, and records what it opened. */
function fakeDriver(failing: string[] = []) {
  const opened: string[] = [];
  let closed = false;
  const driver: BrowserDriver = {
    async open(url, title) {
      opened.push(url);
      const bad = failing.some((f) => url.includes(f));
      return bad ? { ok: false, ms: 30000, error: `title "${title}" not shown`, failedRequests: ["404 /tutors.json"], pageErrors: ["boom"] } : { ok: true, ms: 100 + opened.length, failedRequests: [], pageErrors: [] };
    },
    async close() {
      closed = true;
    }
  };
  return { driver: async () => driver, opened, isClosed: () => closed };
}

describe("checkCourse on a capture of the fixture course", () => {
  let server: ChildProcess;
  let capture = "";
  let course = "";

  beforeAll(async () => {
    const port = freePort();
    server = spawn(process.execPath, [join(ROOT, "fixtures", "course-server", "serve.mjs"), FIXTURE, String(port)], { stdio: ["ignore", "pipe", "inherit"] });
    await new Promise<void>((ready) => server.stdout!.on("data", (d: Buffer) => d.toString().includes("listening") && ready()));
    capture = mkdtempSync(join(tmpdir(), "harness-course-check-"));
    await captureCourse({ course: parseCourseRef(`http://localhost:${port}`), out: capture, depth: 0, concurrency: 4, skipExt: [], dryRun: false, force: false, harnessVersion: "0.0.0-test", fetch: globalThis.fetch as FetchLike });
    course = join(capture, `localhost_${port}`);
  });
  afterAll(() => server?.kill());

  it("files only, without --reader: every captured file is served as captured", async () => {
    const result = await checkCourse({ dir: course, port: freePort(), sample: 5, timeoutMs: 1000, harnessVersion: "0.0.0-test", now: () => new Date("2026-10-08T09:00:00Z") });
    expect(result).toMatchObject({ schema: CHECK_SCHEMA, checkedAt: "2026-10-08T09:00:00.000Z", files: { checked: 1, problems: [] } });
    expect(result.pages).toBeUndefined();
  });

  it("with --reader: opens the sample at <reader><path>, in order, and counts what loaded", async () => {
    const port = freePort();
    const fake = fakeDriver(["/note/localhost:" + port + "/unit-1/topic-02/note-02"]);
    const result = await checkCourse({ dir: course, port, reader: "http://localhost:3100/", sample: 0, timeoutMs: 1000, harnessVersion: "0.0.0-test", driver: fake.driver });
    expect(fake.opened[0]).toBe(`http://localhost:3100/course/localhost:${port}`);
    expect(fake.opened).toHaveLength(21);
    expect(fake.isClosed()).toBe(true);
    expect(result.reader).toBe("http://localhost:3100");
    expect(result.pages).toMatchObject({ routes: 21, sampled: 21, ok: 20, failed: 1, maxMs: 120 });
    expect(result.pages!.results.find((r) => !r.ok)).toMatchObject({ type: "note", failedRequests: ["404 /tutors.json"], pageErrors: ["boom"] });
  });

  it("a served file that differs from the capture is a problem", async () => {
    const tampered = mkdtempSync(join(tmpdir(), "harness-course-check-t-"));
    for (const f of ["tutors.json", "course-capture.json"]) writeFileSync(join(tampered, f), readFileSync(join(course, f)));
    writeFileSync(join(tampered, "tutors.json"), "{}");
    const result = await checkCourse({ dir: tampered, port: freePort(), sample: 5, timeoutMs: 1000, harnessVersion: "0.0.0-test" });
    expect(result.files.problems).toEqual(["tutors.json: served bytes differ from the capture"]);
  });

  it("the command: writes course-check.json, exit 0 when all loaded and 1 when a page or file failed", async () => {
    const lines: string[] = [];
    const deps = (failing: string[] = []) => ({ harnessVersion: "0.0.0-test", log: (l: string) => lines.push(l), driver: fakeDriver(failing).driver });
    expect(await courseCommand("check", { dir: capture, reader: "http://localhost:3100", port: String(freePort()), sample: "4" }, deps())).toBe(0);
    expect(existsSync(join(course, CHECK_FILE))).toBe(true);
    expect(lines.join("\n")).toMatch(/ok {2}localhost:\d+ as localhost:\d+: files 1 of 1; pages 4 of 4 loaded \(median \d+ ms, max \d+ ms\)/);
    const out = join(capture, "elsewhere.json");
    expect(await courseCommand("check", { dir: course, reader: "http://localhost:3100", port: String(freePort()), sample: "1", out }, deps(["/course/"]))).toBe(1);
    expect(JSON.parse(readFileSync(out, "utf8")).pages.failed).toBe(1);
    await expect(courseCommand("check", {}, deps())).rejects.toThrow(/needs --dir/);
    await expect(courseCommand("check", { dir: course, reader: "localhost:3100" }, deps())).rejects.toThrow(/--reader takes the reader's address/);
    await expect(courseCommand("check", { dir: course, sample: "-1" }, deps())).rejects.toThrow(/--sample takes a whole number/);
  });
});

describe("the course corpus", () => {
  const write = (yaml: string) => {
    const f = join(mkdtempSync(join(tmpdir(), "harness-corpus-")), "courses.yaml");
    writeFileSync(f, yaml);
    return f;
  };
  const entry = (id: string) => `  - course: https://tutors.dev/course/${id}\n    why: a reason that is long enough\n`;

  it("the committed corpus: at most five courses, wit-hdip-comp-sci-2024 the standard and in it", () => {
    const corpus = loadCorpus(join(ROOT, CORPUS_FILE));
    expect(corpus.courses.length).toBeGreaterThanOrEqual(1);
    expect(corpus.courses.length).toBeLessThanOrEqual(MAX_CORPUS);
    expect(MAX_CORPUS).toBe(5);
    expect(corpus.standard).toBe("wit-hdip-comp-sci-2024");
    expect(corpus.courses[0]!.ref).toEqual({ id: "wit-hdip-comp-sci-2024", origin: "https://wit-hdip-comp-sci-2024.netlify.app" });
  });

  it("refuses a sixth course, a course twice, a standard not listed, a course with no reason, and an unknown key", () => {
    const six = ["a1", "a2", "a3", "a4", "a5", "a6"].map(entry).join("");
    expect(() => loadCorpus(write(`standard: a1\ncourses:\n${six}`))).toThrow(/at most 5 courses/);
    expect(() => loadCorpus(write(`standard: a1\ncourses:\n${entry("a1")}${entry("a1")}`))).toThrow(/a1 is listed twice/);
    expect(() => loadCorpus(write(`standard: zz\ncourses:\n${entry("a1")}`))).toThrow(/the standard, zz, is not one of the courses/);
    expect(() => loadCorpus(write(`standard: a1\ncourses:\n  - course: a1\n    why: no\n`))).toThrow(/say why/);
    expect(() => loadCorpus(write(`standard: a1\ndepth: 1\ncourses:\n${entry("a1")}`))).toThrow(/depth/);
    expect(() => loadCorpus("/nowhere/courses.yaml")).toThrow(/cannot read the course corpus/);
  });

  it("capture --corpus: each course alone into one folder, one index with the standard as root; check --corpus checks each", async () => {
    const corpus = write(`standard: one\ncourses:\n${entry("one")}${entry("two")}  - course: https://tutors.dev/course/gone\n    why: a course that went away\n`);
    const course = (title: string) => JSON.stringify({ type: "course", title, route: "/", los: [{ type: "web", route: "/course/elsewhere" }] });
    const fetch: FetchLike = async (url) => {
      if (url === "https://one.netlify.app/tutors.json") return new Response(course("One"));
      if (url === "https://two.netlify.app/tutors.json") return new Response(course("Two"));
      return new Response("no", { status: 404 });
    };
    const out = mkdtempSync(join(tmpdir(), "harness-corpus-out-"));
    const lines: string[] = [];
    const deps = { harnessVersion: "0.0.0-test", fetch, log: (l: string) => lines.push(l), driver: fakeDriver().driver, backoffMs: 1 };
    // a corpus course that cannot be read fails the capture, and linked courses are never followed
    expect(await courseCommand("capture", { corpus, out }, deps)).toBe(1);
    const index = JSON.parse(readFileSync(join(out, "courses.json"), "utf8"));
    expect(index.root).toBe("one");
    expect(index.courses.map((c: { id: string; status: string }) => `${c.id}:${c.status}`)).toEqual(["one:captured", "two:captured", "gone:not-found"]);
    await expect(courseCommand("capture", { corpus, course: "x" }, deps)).rejects.toThrow(/drop --course/);

    lines.length = 0;
    expect(await courseCommand("check", { corpus, dir: out, reader: "http://localhost:3100", port: String(freePort()) }, deps)).toBe(1);
    expect(lines.join("\n")).toMatch(/FAILED {2}gone: not captured/);
    expect(lines.at(-1)).toMatch(/^FAILED {2}corpus .*: 2 of 3 courses load$/);
    expect(existsSync(join(out, "one", CHECK_FILE))).toBe(true);
    expect(existsSync(join(out, "two", CHECK_FILE))).toBe(true);
  });
});
