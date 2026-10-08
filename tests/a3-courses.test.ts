/**
 * Real courses on the A3 (since 1.31.0, src/a3/courses.ts): the course corpus checked in production's reader (a) and
 * main's (b), read from the site's courses/ as pages.yml lays it out from course-capture.yml's course-corpus-check.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { readCourseLoad } from "../src/a3/courses.ts";
import { buildA3 } from "../src/a3/model.ts";
import { readInputs } from "../src/a3/read.ts";
import { renderA3 } from "../src/a3/render.ts";
import { CHECK_SCHEMA, type CourseCheck } from "../src/course/check.ts";
import type { TutorsJsonConformance } from "../src/course/schema.ts";

const ROOT = resolve(import.meta.dirname, "..");
const NOW = new Date("2026-10-08T10:00:00Z");

function check(id: string, o: { ok: number; sampled: number; median: number; problems?: number; failing?: string[] }): CourseCheck {
  const results = Array.from({ length: o.sampled }, (_, n) => {
    const path = o.failing?.[n] ?? `/topic/${id}/t${n}`;
    const ok = n >= (o.failing?.length ?? 0);
    return { path, type: "topic", title: `T${n}`, ok, ms: o.median, ...(ok ? {} : { error: `title "T${n}" not shown` }), failedRequests: [], pageErrors: [] };
  });
  return {
    schema: CHECK_SCHEMA,
    course: { id, servedAs: "localhost:8190", title: id.toUpperCase() },
    checkedAt: "2026-10-08T04:55:00.000Z",
    harness: { version: "1.31.0" },
    files: { checked: 10, problems: Array.from({ length: o.problems ?? 0 }, (_, n) => `f${n}: missing`) },
    reader: "http://localhost:3100",
    pages: { routes: 40, sampled: o.sampled, ok: o.ok, failed: o.sampled - o.ok, medianMs: o.median, maxMs: o.median * 2, results }
  };
}

function site(sides: Record<string, unknown> | null, a: Record<string, CourseCheck>, b: Record<string, CourseCheck>): string {
  const root = mkdtempSync(join(tmpdir(), "harness-a3-courses-"));
  const base = join(root, "courses");
  mkdirSync(base, { recursive: true });
  if (sides) writeFileSync(join(base, "sides.json"), JSON.stringify(sides));
  for (const [side, checks] of [["a", a], ["b", b]] as const)
    for (const [id, c] of Object.entries(checks)) {
      mkdirSync(join(base, side, id), { recursive: true });
      writeFileSync(join(base, side, id, "course-check.json"), JSON.stringify(c));
    }
  return root;
}

const SIDES = { production: "16.2.2", candidate: "sha-abc1234", sha: "abc1234", checkedAt: "2026-10-08T04:58:00Z", runUrl: "https://github.com/tutors-sdk/tutors-release-harness/actions/runs/1" };

describe("readCourseLoad", () => {
  it("names a course that loads on production and breaks on main, and counts each side", () => {
    const dir = site(
      SIDES,
      { one: check("one", { ok: 25, sampled: 25, median: 800 }), two: check("two", { ok: 25, sampled: 25, median: 900 }) },
      { one: check("one", { ok: 25, sampled: 25, median: 1000 }), two: check("two", { ok: 23, sampled: 25, median: 950, failing: ["/lab/two/a", "/lab/two/b"] }) }
    );
    const c = readCourseLoad(dir)!;
    expect(c).toMatchObject({ production: "16.2.2", candidate: "sha-abc1234", total: 2, loadOnProduction: 2, loadOnMain: 1, pagesOnMain: { ok: 48, sampled: 50 } });
    expect(c.rows.map((r) => `${r.id}:${r.state}:${r.medianDeltaMs}`)).toEqual(["one:loads on both:200", "two:breaks on main:50"]);
    expect(c.rows[1]!.b!.failures).toEqual(['/lab/two/a: title "T0" not shown', '/lab/two/b: title "T1" not shown']);
    expect(c.summary).toMatch(/^1 of 2 real courses load on production 16\.2\.2 but not on main sha-abc1234: two\. Releasing main would stop a student/);
  });

  it("a file that differs is not a load; a side with no check is not checked on both; none kept is undefined", () => {
    const dir = site(SIDES, { one: check("one", { ok: 5, sampled: 5, median: 1 }), two: check("two", { ok: 5, sampled: 5, median: 1 }) }, { one: check("one", { ok: 5, sampled: 5, median: 1, problems: 1 }) });
    const c = readCourseLoad(dir)!;
    expect(c.rows.map((r) => r.state)).toEqual(["breaks on main", "not checked on both"]);
    expect(readCourseLoad(site(null, { one: check("one", { ok: 1, sampled: 1, median: 1 }) }, {}))).toBeUndefined();
    expect(readCourseLoad(mkdtempSync(join(tmpdir(), "harness-a3-none-")))).toBeUndefined();
  });

  it("every course loading on main says so", () => {
    const dir = site(SIDES, { one: check("one", { ok: 3, sampled: 3, median: 1 }) }, { one: check("one", { ok: 3, sampled: 3, median: 1 }) });
    expect(readCourseLoad(dir)!.summary).toBe("Every real course in the corpus (1) loads on main sha-abc1234 and no page a student uses is worse than on production 16.2.2: 3 of 3 sampled pages showed their title.");
  });
});

describe("tutors.json against the schema on the A3 (since 1.33.0)", () => {
  const conforms: TutorsJsonConformance = { schema: "55f3aff", conforms: true, problems: 0, sample: [] };
  const refused: TutorsJsonConformance = { schema: "55f3aff", conforms: false, problems: 4, sample: ["/los/[t]/hide must be boolean", "/los/[t]/los/[n] has a field the schema does not allow: pdf", "/x a", "/y b"] };
  const withSchema = (c: CourseCheck, t: TutorsJsonConformance): CourseCheck => ({ ...c, tutorsJson: t });

  it("one reading per course from the capture both sides checked, counted, and never a state", () => {
    const one = check("one", { ok: 3, sampled: 3, median: 1 });
    const two = check("two", { ok: 3, sampled: 3, median: 1 });
    const dir = site(SIDES, { one: withSchema(one, conforms), two: withSchema(two, refused) }, { one: withSchema(one, conforms), two: withSchema(two, refused) });
    const c = readCourseLoad(dir)!;
    expect(c.tutorsJson).toEqual({ checked: 2, conforming: 1, schema: "55f3aff" });
    expect(c.rows.map((r) => `${r.id}:${r.state}:${r.tutorsJson?.conforms}`)).toEqual(["one:loads on both:true", "two:loads on both:false"]);
    const html = renderA3(buildA3(readInputs({ site: dir, kaizen: join(ROOT, "kaizen"), now: NOW, harness: "1.33.0" })));
    expect(html).toContain("<th>tutors.json schema</th>");
    expect(html).toContain('<span class="ok">conforms</span>');
    expect(html).toContain("4 problems<br><span class=\"src\">/los/[t]/hide must be boolean<br>");
    expect(html).toContain("1 of 2 courses conform to the schema the generator on main promises (mono-repo 55f3aff); reported only");
  });

  it("checks from before 1.33.0 carry no reading: no column, no count", () => {
    const dir = site(SIDES, { one: check("one", { ok: 1, sampled: 1, median: 1 }) }, { one: check("one", { ok: 1, sampled: 1, median: 1 }) });
    const c = readCourseLoad(dir)!;
    expect(c.tutorsJson).toBeUndefined();
    expect(renderA3(buildA3(readInputs({ site: dir, kaizen: join(ROOT, "kaizen"), now: NOW, harness: "1.33.0" })))).not.toContain("tutors.json schema");
  });
});

describe("the A3 with real courses", () => {
  it("a fact line, a goal row and the table under the current condition; without courses/ none of it", () => {
    const dir = site(SIDES, { one: check("one", { ok: 25, sampled: 25, median: 800 }) }, { one: check("one", { ok: 24, sampled: 25, median: 1200, failing: ["/lab/one/x"] }) });
    const a3 = buildA3(readInputs({ site: dir, kaizen: join(ROOT, "kaizen"), now: NOW, harness: "1.31.0" }));
    expect(a3.courses?.loadOnMain).toBe(0);
    expect(a3.current.facts.some((f) => f.startsWith("Real courses: 1 of 1 real courses load on production 16.2.2 but not on main"))).toBe(true);
    expect(a3.goal.find((g) => g.metric === "Real courses load on main (course corpus)")).toMatchObject({ now: "0 of 1 courses, 24 of 25 pages (production: 1 of 1)", met: false });
    const html = renderA3(a3);
    expect(html).toContain('id="courses"');
    expect(html).toContain("Real courses: what a student would notice if main were released");
    expect(html).toContain("breaks on main");
    expect(html).toContain("800 ms → 1.2 s (+400 ms)");
    expect(html).toContain('href="https://github.com/tutors-sdk/tutors-release-harness/actions/runs/1"');

    const bare = buildA3(readInputs({ site: mkdtempSync(join(tmpdir(), "harness-a3-bare-")), kaizen: join(ROOT, "kaizen"), now: NOW, harness: "1.31.0" }));
    expect(bare.courses).toBeUndefined();
    expect(bare.goal.some((g) => g.metric.startsWith("Real courses"))).toBe(false);
    expect(renderA3(bare)).not.toContain('id="courses"');
  });
});
