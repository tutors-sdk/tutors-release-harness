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
 * Advisory, as the whole A3 is.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CourseCheck } from "../course/check.ts";
import { CHECK_FILE } from "../course/check.ts";

export const COURSES_DIR = "courses";
export const SIDES_FILE = "sides.json";

export interface CourseSide {
  loaded: boolean;
  files: { checked: number; problems: number };
  pages: { sampled: number; ok: number; failed: number; medianMs: number | null; maxMs: number | null } | null;
  /** The first few pages that did not load, with why. */
  failures: string[];
}

export type CourseState = "loads on both" | "breaks on main" | "fixed on main" | "fails on both" | "not checked on both";

export interface CourseRow {
  id: string;
  title?: string;
  a: CourseSide | null;
  b: CourseSide | null;
  state: CourseState;
  /** Main's median time to the title less production's; null when either side has none. */
  medianDeltaMs: number | null;
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

function stateOf(a: CourseSide | null, b: CourseSide | null): CourseState {
  if (!a || !b) return "not checked on both";
  if (a.loaded && b.loaded) return "loads on both";
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
    return { id, ...(title ? { title } : {}), a, b, state: stateOf(a, b), medianDeltaMs: ma !== null && mb !== null ? mb - ma : null };
  });
  const loadOnProduction = rows.filter((r) => r.a?.loaded).length;
  const loadOnMain = rows.filter((r) => r.b?.loaded).length;
  const pagesOnMain = rows.reduce((s, r) => ({ ok: s.ok + (r.b?.pages?.ok ?? 0), sampled: s.sampled + (r.b?.pages?.sampled ?? 0) }), { ok: 0, sampled: 0 });
  const production = sides.production ?? "production";
  const candidate = sides.candidate ?? "main";
  const breaks = rows.filter((r) => r.state === "breaks on main").map((r) => r.id);
  const summary = breaks.length
    ? `${breaks.length} of ${rows.length} real courses load on production ${production} but not on main ${candidate}: ${breaks.join(", ")}. A student on those courses would be stopped by this release.`
    : loadOnMain === rows.length
      ? `Every real course in the corpus (${rows.length}) loads on main ${candidate}: ${pagesOnMain.ok} of ${pagesOnMain.sampled} sampled pages showed their title.`
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
    rows,
    summary
  };
}
