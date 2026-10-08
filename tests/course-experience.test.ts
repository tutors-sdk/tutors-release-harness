/**
 * The student experience on real courses (since 1.32.0): journeys from tutors.json, what each page shows, and
 * production against main page by page (src/course/compare.ts), as the A3 reads it.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { readCourseLoad } from "../src/a3/courses.ts";
import { buildA3 } from "../src/a3/model.ts";
import { readInputs } from "../src/a3/read.ts";
import { renderA3 } from "../src/a3/render.ts";
import { CHECK_SCHEMA, type CourseCheck, type PageExperience, type PageResult } from "../src/course/check.ts";
import { courseCommand, CourseUsageError } from "../src/course/command.ts";
import { compareCourse, worseReasons } from "../src/course/compare.ts";
import { headingKey, markdownHeadings, readerJourneys, readerRoutes } from "../src/course/routes.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tree = JSON.parse(readFileSync(join(ROOT, "fixtures", "course-server", "course", "tutors.json"), "utf8"));

const exp = (o: Partial<PageExperience> = {}): PageExperience => ({ textChars: 1000, headings: ["Intro", "Setup"], images: { total: 2, broken: [] }, links: { course: 5, broken: [] }, axe: [], ...o });
const page = (path: string, o: Partial<PageResult> = {}): PageResult => ({ path, type: "step", title: path, ok: true, ms: 500, failedRequests: [], pageErrors: [], experience: exp(), ...o });
const check = (results: PageResult[], journeys: CourseCheck["journeys"] = []): CourseCheck => ({
  schema: CHECK_SCHEMA,
  course: { id: "c", servedAs: "localhost:8190", title: "C" },
  checkedAt: "2026-10-08T05:00:00.000Z",
  harness: { version: "1.32.0" },
  files: { checked: 3, problems: [] },
  reader: "http://localhost:3100",
  pages: { routes: 10, sampled: results.length, ok: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, medianMs: 500, maxMs: 500, results },
  journeys
});

describe("readerJourneys", () => {
  it("the course page, the topic, the lab and its steps in order; the first lab, then spread; none asked, none given", () => {
    const js = readerJourneys(tree, "localhost:8190", 2, 3);
    expect(js).toHaveLength(2);
    expect(js[0]!.steps.map((s) => s.type)).toEqual(["course", "topic", "lab", "step", "step", "step"]);
    expect(js[0]!.steps[0]!.path).toBe("/course/localhost:8190");
    expect(js[0]!.steps[3]!.path).toBe("/lab/localhost:8190/unit-1/topic-01/book-lab-01/Setup");
    expect(js[0]!.steps[2]!.path).not.toBe(js[1]!.steps[2]!.path);
    expect(js[0]!.name).toBe("Topic 1 › Lab 1");
    expect(js[0]!.lab).toBe(js[0]!.steps[2]!.path);
    expect(readerJourneys(tree, "localhost:8190", 0)).toEqual([]);
    expect(readerJourneys({ type: "course", title: "x", los: [] }, "x")).toEqual([]);
  });
});

describe("markdownHeadings", () => {
  it("the author's h1 to h3, outside code, as plain text; each route carries its own", () => {
    expect(markdownHeadings("# Lab *One*\n\ntext\n## [Setup](x.md)\n```\n# not a heading\n```\n#### too deep\n### `npm` install ##")).toEqual(["Lab One", "Setup", "npm install"]);
    expect(markdownHeadings(undefined)).toEqual([]);
    expect(headingKey("01: Node.js")).toBe(headingKey("01 node js"));
    const routes = readerRoutes(tree, "localhost:8190");
    expect(routes.every((r) => Array.isArray(r.headings))).toBe(true);
    expect(routes.some((r) => r.type === "step" && r.headings!.length > 0)).toBe(true);
  });
});

describe("worseReasons and compareCourse", () => {
  it("each way a page can be worse for a student, in words", () => {
    expect(worseReasons(page("/p"), page("/p"))).toEqual([]);
    expect(worseReasons(page("/p"), page("/p", { ok: false, error: "title not shown" }))[0]).toBe("does not load on main (title not shown)");
    const b = page("/p", {
      failedRequests: ["404 /img/a.png"],
      pageErrors: ["TypeError: x is undefined at 123"],
      experience: exp({ textChars: 400, headings: ["Intro"], images: { total: 2, broken: ["/img/a.png"] }, links: { course: 5, broken: ["/lab/localhost:8190/gone"] }, axe: ["color-contrast"] })
    });
    const r = worseReasons(page("/p"), b);
    expect(r).toEqual([
      "course files failing: 404 /img/a.png",
      "new console error: TypeError: x is undefined at 123",
      "1 broken image(s) (production 0): /img/a.png",
      "links to pages that do not exist: /lab/localhost:8190/gone",
      'headings missing: "Setup"',
      "60% less text (400 characters, production 1000)",
      "new accessibility violation(s): color-contrast"
    ]);
    // the same console error with other numbers is the same error
    expect(worseReasons(page("/p", { pageErrors: ["boom at 1"] }), page("/p", { pageErrors: ["boom at 2"] }))).toEqual([]);
  });

  it("page by page and journey by journey, in both directions", () => {
    const steps = (n: number, of: number) => Array.from({ length: of }, (_, i) => ({ path: `/s${i}`, title: `S${i}`, ok: i < n, via: (i === 0 ? "start" : "click") as "start" | "click", ms: 1 }));
    const a = check([page("/1"), page("/2", { experience: exp({ images: { total: 2, broken: ["/x.png"] } }) }), page("/3")], [{ name: "Lab 1", lab: "/lab/1", ok: true, steps: steps(5, 5) }]);
    const b = check([page("/1", { ok: false }), page("/2"), page("/3")], [{ name: "Lab 1", lab: "/lab/1", ok: false, steps: steps(2, 3) }]);
    const c = compareCourse(a, b);
    expect(c.compared).toBe(3);
    expect(c.worse.map((p) => p.path)).toEqual(["/1"]);
    expect(c.better).toEqual([{ path: "/2", type: "step", title: "/2", reasons: ["on production: 1 broken image(s) (main 0): /x.png"] }]);
    expect(c.journeys).toEqual({ compared: 1, worse: [{ name: "Lab 1", a: 5, b: 2, of: 5, stoppedAt: "/s2" }], better: [] });
  });
});

describe("harness course compare", () => {
  it("exit 1 when main is worse than production, 0 when production fails alone; --out keeps it", async () => {
    const root = mkdtempSync(join(tmpdir(), "harness-compare-"));
    const write = (side: string, c: CourseCheck) => {
      mkdirSync(join(root, side, "c"), { recursive: true });
      writeFileSync(join(root, side, "c", "course-check.json"), JSON.stringify(c));
    };
    const run = async (v: Record<string, string>) => {
      const lines: string[] = [];
      const code = await courseCommand("compare", { a: join(root, "a"), b: join(root, "b"), ...v }, { harnessVersion: "1.32.0", log: (l) => lines.push(l) });
      return { code, text: lines.join("\n") };
    };
    write("a", check([page("/1", { ok: false }), page("/2")]));
    write("b", check([page("/1", { ok: false }), page("/2")]));
    expect(await run({})).toMatchObject({ code: 0 });
    write("b", check([page("/1", { ok: false }), page("/2", { ok: false, error: "title not shown" })]));
    const out = join(root, "compare.json");
    const r = await run({ out });
    expect(r.code).toBe(1);
    expect(r.text).toContain("/2: does not load on main (title not shown)");
    expect(JSON.parse(readFileSync(out, "utf8"))).toMatchObject({ schema: "tutors-course-compare/1", worse: 1 });
    await expect(courseCommand("compare", { a: join(root, "a") }, { harnessVersion: "1.32.0" })).rejects.toBeInstanceOf(CourseUsageError);
  });
});

describe("the A3: what a student would notice", () => {
  it("a course that loads on both but is worse on main is named, with its pages, and the goal row counts them", () => {
    const root = mkdtempSync(join(tmpdir(), "harness-a3-exp-"));
    const write = (side: string, c: CourseCheck) => {
      mkdirSync(join(root, "courses", side, "c"), { recursive: true });
      writeFileSync(join(root, "courses", side, "c", "course-check.json"), JSON.stringify(c));
    };
    mkdirSync(join(root, "courses"), { recursive: true });
    writeFileSync(join(root, "courses", "sides.json"), JSON.stringify({ production: "16.2.2", candidate: "sha-abc1234" }));
    write("a", check([page("/1"), page("/2")]));
    write("b", check([page("/1"), page("/2", { experience: exp({ headings: ["Intro"] }) })]));
    const load = readCourseLoad(root)!;
    expect(load.rows[0]!.state).toBe("worse on main");
    expect(load).toMatchObject({ worsePages: 1, betterPages: 0, worseJourneys: 0 });
    expect(load.summary).toBe("Releasing main sha-abc1234 would make 1 page(s) worse for a student than production 16.2.2, on c; 0 page(s) are better.");
    const a3 = buildA3(readInputs({ site: root, kaizen: join(ROOT, "kaizen"), now: new Date("2026-10-08T10:00:00Z"), harness: "1.32.0" }));
    expect(a3.goal.find((g) => g.metric === "Nothing a student uses is worse on main (real courses)")).toMatchObject({ now: "1 page(s) and 0 journey(s) worse, 0 page(s) better", met: false });
    const html = renderA3(a3);
    expect(html).toContain('id="course-c-worse"');
    expect(html).toContain("headings missing: &quot;Setup&quot;");
  });
});
