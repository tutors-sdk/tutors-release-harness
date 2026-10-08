/**
 * Production against main on a real course (since 1.32.0): the same pages and journeys checked in two readers
 * (`harness course check`, side a production, side b main), compared page by page as a student would notice. Main is
 * the release candidate: what is worse on main is what releasing it would change for a student, and what is better is
 * a change somebody meant (or should say they meant).
 *
 * A page is worse on main when it: does not load where it did; has more course images that do not load; asks for a
 * course file that fails where it did not; shows a console error it did not; links to a page of the course that does
 * not exist where it did not; lost a heading; shows much less text (a quarter or more, on a page with some text); or
 * has a serious or critical accessibility violation it did not. Better is the same the other way round. A journey is
 * worse when production clicks further through it than main.
 */
import type { CourseCheck, JourneyResult, PageResult } from "./check.ts";

export interface PageChange {
  path: string;
  type: string;
  title: string;
  reasons: string[];
}

export interface JourneyChange {
  name: string;
  /** Pages reached by clicking, on production and on main, of the journey's pages. */
  a: number;
  b: number;
  of: number;
  /** The page main stopped at. */
  stoppedAt?: string;
}

export interface CourseComparison {
  /** Pages checked on both sides. */
  compared: number;
  worse: PageChange[];
  better: PageChange[];
  journeys: { worse: JourneyChange[]; better: JourneyChange[]; compared: number };
}

/** Numbers and hashes out of a console message, so the same error on both sides is the same text. */
const shape = (m: string) => m.replace(/\b[0-9a-f]{8,}\b/gi, "#").replace(/\d+/g, "N").slice(0, 160);
const newIn = (a: string[], b: string[], f: (x: string) => string = (x) => x) => {
  const had = new Set(a.map(f));
  return [...new Set(b.filter((x) => !had.has(f(x))))];
};
const list = (xs: string[], n = 3) => xs.slice(0, n).join(", ") + (xs.length > n ? ` and ${xs.length - n} more` : "");

/** Why page b is worse than page a, in a student's words; empty when it is not. */
export function worseReasons(a: PageResult, b: PageResult): string[] {
  if (a.ok && !b.ok) return [`does not load on main${b.error ? ` (${b.error.slice(0, 120)})` : ""}`];
  if (!b.ok) return [];
  const out: string[] = [];
  const failed = newIn(a.failedRequests, b.failedRequests);
  if (failed.length) out.push(`course files failing: ${list(failed)}`);
  const errors = newIn(a.pageErrors, b.pageErrors, shape);
  if (errors.length) out.push(`new console error: ${list(errors.map((e) => e.slice(0, 100)), 2)}`);
  const ea = a.experience;
  const eb = b.experience;
  if (ea && eb) {
    if (eb.images.broken.length > ea.images.broken.length) out.push(`${eb.images.broken.length} broken image(s) (production ${ea.images.broken.length}): ${list(newIn(ea.images.broken, eb.images.broken))}`);
    const links = newIn(ea.links.broken, eb.links.broken);
    if (links.length) out.push(`links to pages that do not exist: ${list(links)}`);
    const lost = newIn(eb.headings, ea.headings);
    if (lost.length) out.push(`headings missing: ${list(lost.map((h) => `"${h.slice(0, 60)}"`))}`);
    if (ea.textChars >= 200 && eb.textChars < ea.textChars * 0.75) out.push(`${Math.round((1 - eb.textChars / ea.textChars) * 100)}% less text (${eb.textChars} characters, production ${ea.textChars})`);
    if (ea.axe && eb.axe) {
      const axe = newIn(ea.axe, eb.axe);
      if (axe.length) out.push(`new accessibility violation(s): ${axe.join(", ")}`);
    }
  }
  return out;
}

const reached = (j: JourneyResult | undefined) => (j ? j.steps.filter((s) => s.ok && s.via !== "no link").length : 0);

export function compareCourse(a: CourseCheck, b: CourseCheck): CourseComparison {
  const pa = new Map((a.pages?.results ?? []).map((r) => [r.path, r]));
  const worse: PageChange[] = [];
  const better: PageChange[] = [];
  let compared = 0;
  for (const rb of b.pages?.results ?? []) {
    const ra = pa.get(rb.path);
    if (!ra) continue;
    compared++;
    const w = worseReasons(ra, rb);
    if (w.length) worse.push({ path: rb.path, type: rb.type, title: rb.title, reasons: w });
    // Better: the same rules with the sides swapped, said of production ("on production: 2 broken image(s) (main 0)").
    const bt = worseReasons(rb, ra).map((r) => `on production: ${r.replace(/^does not load on main/, "does not load, main does").replace(/\(production (\d+)\)/, "(main $1)").replace(/\(([\d]+) characters, production (\d+)\)/, "($1 characters, main $2)")}`);
    if (bt.length) better.push({ path: rb.path, type: rb.type, title: rb.title, reasons: bt });
  }
  const ja = new Map((a.journeys ?? []).map((j) => [j.lab ?? j.name, j]));
  const jw: JourneyChange[] = [];
  const jb: JourneyChange[] = [];
  let jc = 0;
  for (const j of b.journeys ?? []) {
    const other = ja.get(j.lab ?? j.name);
    if (!other) continue;
    jc++;
    const ra = reached(other);
    const rb = reached(j);
    const of = Math.max(other.steps.length, j.steps.length);
    const stop = j.steps.find((s) => !s.ok || s.via === "no link");
    if (rb < ra) jw.push({ name: j.name, a: ra, b: rb, of, ...(stop ? { stoppedAt: stop.path } : {}) });
    else if (rb > ra) jb.push({ name: j.name, a: ra, b: rb, of });
  }
  return { compared, worse, better, journeys: { worse: jw, better: jb, compared: jc } };
}
