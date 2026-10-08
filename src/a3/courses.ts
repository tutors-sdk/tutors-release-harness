/**
 * Real courses on the A3 (since 1.31.0): the course corpus (fixtures/course-corpus/courses.yaml) checked in production's
 * reader and in main's, side by side, from the newest `course-corpus-check` artifact course-capture.yml kept. The pages
 * workflow puts it in the site as:
 *
 *   courses/sides.json                  { production, candidate, sha?, checkedAt?, runUrl? }
 *   courses/a/<course>/course-check.json  production's reader (side a), as harness course check writes it
 *   courses/b/<course>/course-check.json  main's reader (side b)
 *
 * A course loads on a side when every captured file came back as captured and every sampled page showed its title. One
 * check per side is a reading, not a benchmark: the time to the title is shown beside the other side, never judged.
 * Since 1.33.0 each row also says whether the course's tutors.json conforms to the mono-repo's published schema: both
 * sides check the same capture, so it is one reading per course, never a state or a goal. Advisory, as the whole A3 is.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CourseCheck } from "../course/check.ts";
import { CHECK_FILE } from "../course/check.ts";
import { compareCourse, type CourseComparison } from "../course/compare.ts";
import type { TutorsJsonConformance } from "../course/schema.ts";

export const COURSES_DIR = "courses";
export const SIDES_FILE = "sides.json";

export interface CourseSide {
  loaded: boolean;
  files: { checked: number; problems: number };
  pages: { sampled: number; ok: number; failed: number; medianMs: number | null; maxMs: number | null } | null;
  /** The first few pages that did not load, with why. */
  failures: string[];
}

export type CourseState = "loads on both" | "worse on main" | "breaks on main" | "fixed on main" | "fails on both" | "not checked on both";

export interface CourseRow {
  id: string;
  title?: string;
  a: CourseSide | null;
  b: CourseSide | null;
  state: CourseState;
  /** Main's median time to the title less production's; null when either side has none. */
  medianDeltaMs: number | null;
  /** Since 1.32.0: page by page and journey by journey, production against main (src/course/compare.ts). */
  compare?: CourseComparison;
  /** Since 1.33.0: the course's tutors.json against the mono-repo's published schema; one capture, so one reading. */
  tutorsJson?: TutorsJsonConformance;
}

export interface CourseLoad {
  production: string;
  candidate: string;
  sha?: string;
  checkedAt: string | null;
  runUrl?: string;
  total: number;
  loadOnProduction: number;
  loadOnMain: number;
  pagesOnMain: { ok: number; sampled: number };
  /** Since 1.32.0: pages worse and better on main, over every course; journeys main clicks less far through. */
  worsePages: number;
  betterPages: number;
  worseJourneys: number;
  /** Since 1.33.0: courses whose tutors.json was held to the schema, and how many conform. Reported, never judged. */
  tutorsJson?: { checked: number; conforming: number; schema: string };
  rows: CourseRow[];
  summary: string;
}

interface Sides {
  production?: string;
  candidate?: string;
  sha?: string;
  checkedAt?: string;
  runUrl?: string;
}

function json<T>(file: string): T | undefined {
  try {
    return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function sideOf(c: CourseCheck | undefined): CourseSide | null {
  if (!c?.files) return null;
  const p = c.pages;
  const problems = Array.isArray(c.files.problems) ? c.files.problems.length : 0;
  const failures = (p?.results ?? []).filter((r) => !r.ok).slice(0, 3).map((r) => `${r.path}: ${r.error ?? "did not load"}`);
  return {
    loaded: problems === 0 && !!p && p.sampled > 0 && p.failed === 0,
    files: { checked: Number(c.files.checked ?? 0), problems },
    pages: p ? { sampled: p.sampled, ok: p.ok, failed: p.failed, medianMs: p.medianMs ?? null, maxMs: p.maxMs ?? null } : null,
    failures
  };
}

function stateOf(a: CourseSide | null, b: CourseSide | null, c?: CourseComparison): CourseState {
  if (!a || !b) return "not checked on both";
  if (a.loaded && b.loaded) return c && (c.worse.length || c.journeys.worse.length) ? "worse on main" : "loads on both";
  if (a.loaded) return "breaks on main";
  if (b.loaded) return "fixed on main";
  return "fails on both";
}

const sideIds = (dir: string) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);

/** The corpus check under `<site>/courses`, or undefined when the site has none (course-capture.yml has not kept one). */
export function readCourseLoad(site: string): CourseLoad | undefined {
  const base = join(site, COURSES_DIR);
  const sides = json<Sides>(join(base, SIDES_FILE));
  if (!sides) return undefined;
  const ids = [...new Set([...sideIds(join(base, "a")), ...sideIds(join(base, "b"))])].sort();
  if (!ids.length) return undefined;
  const checks: string[] = [];
  const rows = ids.map((id): CourseRow => {
    const ca = json<CourseCheck>(join(base, "a", id, CHECK_FILE));
    const cb = json<CourseCheck>(join(base, "b", id, CHECK_FILE));
    for (const c of [ca, cb]) if (c?.checkedAt) checks.push(c.checkedAt);
    const a = sideOf(ca);
    const b = sideOf(cb);
    const title = cb?.course?.title ?? ca?.course?.title;
    const ma = a?.pages?.medianMs ?? null;
    const mb = b?.pages?.medianMs ?? null;
    const compare = ca?.pages && cb?.pages ? compareCourse(ca, cb) : undefined;
    const tutorsJson = cb?.tutorsJson ?? ca?.tutorsJson;
    return { id, ...(title ? { title } : {}), a, b, state: stateOf(a, b, compare), medianDeltaMs: ma !== null && mb !== null ? mb - ma : null, ...(compare ? { compare } : {}), ...(tutorsJson ? { tutorsJson } : {}) };
  });
  const loadOnProduction = rows.filter((r) => r.a?.loaded).length;
  const loadOnMain = rows.filter((r) => r.b?.loaded).length;
  const pagesOnMain = rows.reduce((s, r) => ({ ok: s.ok + (r.b?.pages?.ok ?? 0), sampled: s.sampled + (r.b?.pages?.sampled ?? 0) }), { ok: 0, sampled: 0 });
  const production = sides.production ?? "production";
  const candidate = sides.candidate ?? "main";
  const breaks = rows.filter((r) => r.state === "breaks on main").map((r) => r.id);
  const worsePages = rows.reduce((n, r) => n + (r.compare?.worse.length ?? 0), 0);
  const betterPages = rows.reduce((n, r) => n + (r.compare?.better.length ?? 0), 0);
  const worseJourneys = rows.reduce((n, r) => n + (r.compare?.journeys.worse.length ?? 0), 0);
  const worseCourses = rows.filter((r) => r.state === "worse on main").map((r) => r.id);
  const held = rows.filter((r) => r.tutorsJson);
  const summary = breaks.length
    ? `${breaks.length} of ${rows.length} real courses load on production ${production} but not on main ${candidate}: ${breaks.join(", ")}. Releasing main would stop a student on those courses.`
    : worseCourses.length
      ? `Releasing main ${candidate} would make ${worsePages} page(s)${worseJourneys ? ` and ${worseJourneys} journey(s)` : ""} worse for a student than production ${production}, on ${worseCourses.join(", ")}; ${betterPages} page(s) are better.`
      : loadOnMain === rows.length
        ? `Every real course in the corpus (${rows.length}) loads on main ${candidate} and no page a student uses is worse than on production ${production}: ${pagesOnMain.ok} of ${pagesOnMain.sampled} sampled pages showed their title${betterPages ? `; ${betterPages} page(s) are better` : ""}.`
        : `${loadOnMain} of ${rows.length} real courses load on main ${candidate}, ${loadOnProduction} on production ${production}; none is broken by main alone.`;
  return {
    production,
    candidate,
    ...(sides.sha ? { sha: sides.sha } : {}),
    checkedAt: sides.checkedAt ?? (checks.sort().at(-1) ?? null),
    ...(sides.runUrl ? { runUrl: sides.runUrl } : {}),
    total: rows.length,
    loadOnProduction,
    loadOnMain,
    pagesOnMain,
    worsePages,
    betterPages,
    worseJourneys,
    ...(held.length ? { tutorsJson: { checked: held.length, conforming: held.filter((r) => r.tutorsJson!.conforms).length, schema: held[0]!.tutorsJson!.schema } } : {}),
    rows,
    summary
  };
}
