import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { CaptureError, captureCourse, dirFor, INDEX, MANIFEST, type CaptureIndex, type FetchLike } from "./capture.ts";
import { CHECK_FILE, checkCourse, SERVER, type BrowserDriver, type CourseCheck } from "./check.ts";
import { compareCourse, type CourseComparison } from "./compare.ts";
import { CorpusError, loadCorpus, type CourseCorpus } from "./corpus.ts";
import { parseCourseRef, CourseRefError } from "./ref.ts";
import { verifyCapture, VerifyInputError } from "./verify.ts";

/**
 * `harness course capture|verify|serve|check`: a live Tutors course onto disk, verified, served, and shown to load in a
 * reader, so a run can read a known working course from local files (docs/course-capture.md). Exit 0 done, 1 the course
 * (or, with --strict, a file or a linked course) could not be captured, a capture no longer verifies, or a check failed;
 * 2 usage or input that cannot be read.
 */

type Values = Record<string, string | boolean | string[] | undefined>;

export class CourseUsageError extends Error {}

const str = (v: Values, k: string) => (typeof v[k] === "string" ? (v[k] as string) : undefined);

function whole(v: Values, name: string, fallback: number, min: number): number {
  const raw = str(v, name);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min) throw new CourseUsageError(`--${name} takes a whole number, ${min} or more`);
  return n;
}

export interface CourseDeps {
  fetch?: FetchLike;
  now?: () => Date;
  log?: (line: string) => void;
  home?: string;
  harnessVersion: string;
  backoffMs?: number;
  driver?: () => Promise<BrowserDriver>;
}


export async function courseCommand(sub: string | undefined, v: Values, deps: CourseDeps): Promise<number> {
  const log = deps.log ?? ((l: string) => console.log(l));
  try {
    switch (sub) {
      case "capture":
        return await capture(v, deps, log);
      case "verify":
        return verify(v, log);
      case "serve":
        return await serve(v, log);
      case "check":
        return await check(v, deps, log);
      case "compare":
        return compare(v, log);
      default:
        throw new CourseUsageError(`course takes capture, verify, serve, check or compare${sub ? `, not "${sub}"` : ""}: see harness help course`);
    }
  } catch (e) {
    if (e instanceof CourseRefError || e instanceof CaptureError || e instanceof VerifyInputError || e instanceof CorpusError) throw new CourseUsageError(e.message);
    throw e;
  }
}

/** --corpus: the curated courses, captured alone each, into one folder (default HARNESS_HOME/courses/corpus). */
const corpusOut = (v: Values, deps: CourseDeps) => resolve(str(v, "out") ?? join(deps.home ?? join(process.cwd(), ".harness"), "courses", "corpus"));

function corpusOf(v: Values): CourseCorpus | undefined {
  const file = str(v, "corpus");
  if (file === undefined) return undefined;
  for (const flag of ["course", "depth", "skip-ext", "max-file-mb"]) if (v[flag] !== undefined) throw new CourseUsageError(`--corpus names its courses and how to capture them: drop --${flag}`);
  return loadCorpus(resolve(file));
}

async function captureCorpus(corpus: CourseCorpus, v: Values, deps: CourseDeps, log: (l: string) => void): Promise<number> {
  const out = corpusOut(v, deps);
  const quiet = v.json ? () => {} : log;
  const courses: CaptureIndex["courses"] = [];
  let index: CaptureIndex | undefined;
  for (const c of corpus.courses) {
    index = await captureCourse({
      course: c.ref,
      out,
      writeIndex: false,
      depth: 0,
      concurrency: whole(v, "concurrency", 8, 1),
      ...(c.maxFileMb !== undefined ? { maxFileBytes: Math.floor(c.maxFileMb * 1024 * 1024) } : {}),
      skipExt: c.skipExt,
      dryRun: v["dry-run"] === true,
      force: v.force === true,
      harnessVersion: deps.harnessVersion,
      ...(deps.fetch ? { fetch: deps.fetch } : {}),
      ...(deps.now ? { now: deps.now } : {}),
      ...(deps.backoffMs !== undefined ? { backoffMs: deps.backoffMs } : {}),
      log: quiet
    });
    courses.push(...index.courses);
  }
  const all: CaptureIndex = { ...index!, root: corpus.standard, depth: 0, courses };
  if (!all.dryRun) writeFileSync(join(out, INDEX), JSON.stringify(all, null, 2) + "\n");
  report(all, out, v, log);
  // Every course of the corpus was chosen: one that cannot be read fails the capture.
  return courses.every((c) => c.status === "captured") && (v.strict !== true || courses.every((c) => !c.missing)) ? 0 : 1;
}

async function capture(v: Values, deps: CourseDeps, log: (l: string) => void): Promise<number> {
  const corpus = corpusOf(v);
  if (corpus) return captureCorpus(corpus, v, deps, log);
  const given = str(v, "course");
  if (!given) throw new CourseUsageError("course capture needs --course <https://tutors.dev/course/<id> | id> or --corpus <courses.yaml>");
  const course = parseCourseRef(given);
  const maxMb = str(v, "max-file-mb");
  if (maxMb !== undefined && !(Number(maxMb) > 0)) throw new CourseUsageError("--max-file-mb takes a number of megabytes above 0");
  const home = deps.home ?? join(process.cwd(), ".harness");
  const out = resolve(str(v, "out") ?? join(home, "courses", dirFor(course.id)));
  const index = await captureCourse({
    course,
    out,
    depth: whole(v, "depth", 1, 0),
    concurrency: whole(v, "concurrency", 8, 1),
    ...(maxMb !== undefined ? { maxFileBytes: Math.floor(Number(maxMb) * 1024 * 1024) } : {}),
    skipExt: (str(v, "skip-ext") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    dryRun: v["dry-run"] === true,
    force: v.force === true,
    harnessVersion: deps.harnessVersion,
    ...(deps.fetch ? { fetch: deps.fetch } : {}),
    ...(deps.now ? { now: deps.now } : {}),
    ...(deps.backoffMs !== undefined ? { backoffMs: deps.backoffMs } : {}),
    log: v.json ? () => {} : log
  });
  return report(index, out, v, log);
}

function report(index: CaptureIndex, out: string, v: Values, log: (l: string) => void): number {
  const root = index.courses.find((c) => c.id === index.root) ?? index.courses[0]!;
  const captured = index.courses.filter((c) => c.status === "captured");
  const incomplete = index.courses.filter((c) => c.status !== "captured" || (c.missing ?? 0) > 0);
  if (v.json) log(JSON.stringify({ out: index.dryRun ? null : out, ...index }, null, 2));
  else {
    log("");
    for (const c of index.courses) {
      const what = c.status === "captured" ? `${c.files} files, ${c.bytes} bytes${c.missing ? `, ${c.missing} missing` : ""}${c.skipped ? `, ${c.skipped} skipped` : ""}` : c.detail ?? "";
      log(`${"  ".repeat(c.depth)}${c.status.padEnd(12)} ${c.id}  ${what}`);
    }
    log("");
    log(index.dryRun ? `dry run: nothing written (${captured.length} of ${index.courses.length} courses readable)` : `${captured.length} of ${index.courses.length} courses captured into ${out} (${INDEX}; each course's course-capture.json)`);
    if (root.status === "captured" && !index.dryRun) log(`serve it: harness course serve --dir ${join(out, root.dir!)} --port 8080   (the reader's course id is then localhost:8080)`);
  }
  if (root.status !== "captured") return 1;
  return v.strict === true && incomplete.length ? 1 : 0;
}

function verify(v: Values, log: (l: string) => void): number {
  const dir = str(v, "dir");
  if (!dir) throw new CourseUsageError("course verify needs --dir <a capture, or one course folder in it>");
  const verdicts = verifyCapture(resolve(dir));
  if (v.json) log(JSON.stringify(verdicts, null, 2));
  else
    for (const c of verdicts) {
      log(`${c.problems.length ? "DRIFTED" : "ok"}  ${c.id}  ${c.checked} files checked${c.problems.length ? `, ${c.problems.length} differ` : ""}`);
      for (const p of c.problems.slice(0, 20)) log(`  - ${p}`);
      if (c.problems.length > 20) log(`  ... and ${c.problems.length - 20} more`);
    }
  return verdicts.some((c) => c.problems.length) ? 1 : 0;
}

/** The course folder --dir names: itself when it holds tutors.json, else the root course of a capture. */
export function servedDir(dir: string): string {
  if (existsSync(join(dir, "tutors.json"))) return dir;
  if (existsSync(join(dir, INDEX))) {
    const index = JSON.parse(readFileSync(join(dir, INDEX), "utf8")) as CaptureIndex;
    const root = index.courses.find((c) => c.id === index.root && c.dir);
    if (root) return join(dir, root.dir!);
  }
  throw new CourseUsageError(`${dir} holds no tutors.json and no captured root course: pass a course folder of a capture`);
}

async function serve(v: Values, log: (l: string) => void): Promise<number> {
  const dir = str(v, "dir");
  if (!dir) throw new CourseUsageError("course serve needs --dir <a capture, or one course folder in it>");
  const root = servedDir(resolve(dir));
  const port = whole(v, "port", 8080, 1);
  log(`serving ${root} on http://localhost:${port} (the reader's course id: localhost:${port}); Ctrl-C stops it`);
  const child = spawn(process.execPath, [SERVER, root, String(port)], { stdio: "inherit" });
  return await new Promise<number>((done) => {
    const stop = () => child.kill("SIGTERM");
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    child.on("exit", (code, signal) => done(signal ? 0 : code ?? 1));
  });
}

async function check(v: Values, deps: CourseDeps, log: (l: string) => void): Promise<number> {
  const corpus = corpusOf(v);
  if (corpus) {
    const out = resolve(str(v, "dir") ?? corpusOut(v, deps));
    if (str(v, "out") !== undefined) throw new CourseUsageError("check --corpus writes course-check.json in each course folder: drop --out");
    const port = whole(v, "port", 8190, 1);
    let failed = 0;
    for (const [i, c] of corpus.courses.entries()) {
      const folder = join(out, dirFor(c.ref.id));
      if (!existsSync(join(folder, MANIFEST))) {
        log(`FAILED  ${c.ref.id}: not captured in ${out} (run harness course capture --corpus first)`);
        failed++;
        continue;
      }
      failed += await checkOne({ ...v, dir: folder, port: String(port + i) }, deps, log);
    }
    log(`${failed ? "FAILED" : "ok"}  corpus ${corpus.file}: ${corpus.courses.length - failed} of ${corpus.courses.length} courses load`);
    return failed ? 1 : 0;
  }
  return checkOne(v, deps, log);
}

async function checkOne(v: Values, deps: CourseDeps, log: (l: string) => void): Promise<number> {
  const dir = str(v, "dir");
  if (!dir) throw new CourseUsageError("course check needs --dir <a capture, or one course folder in it> [--reader http://localhost:3100]");
  const root = servedDir(resolve(dir));
  if (!existsSync(join(root, MANIFEST))) throw new CourseUsageError(`${root} has no ${MANIFEST}: check a folder harness course capture wrote`);
  const reader = str(v, "reader");
  if (reader !== undefined && !/^https?:\/\/[^/]+/.test(reader)) throw new CourseUsageError(`--reader takes the reader's address, e.g. http://localhost:3100, not "${reader}"`);
  const result = await checkCourse({
    dir: root,
    port: whole(v, "port", 8190, 1),
    ...(reader ? { reader } : {}),
    sample: whole(v, "sample", 20, 0),
    journeys: whole(v, "journeys", 2, 0),
    timeoutMs: 30_000,
    harnessVersion: deps.harnessVersion,
    ...(deps.driver ? { driver: deps.driver } : {}),
    ...(deps.now ? { now: deps.now } : {}),
    log: v.json ? () => {} : log
  });
  const out = resolve(str(v, "out") ?? join(root, CHECK_FILE));
  writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
  const failed = result.files.problems.length + (result.pages?.failed ?? 0);
  if (v.json) log(JSON.stringify(result, null, 2));
  else {
    for (const p of result.files.problems.slice(0, 20)) log(`  - ${p}`);
    const pages = result.pages ? `; pages ${result.pages.ok} of ${result.pages.sampled} loaded${result.pages.medianMs !== undefined ? ` (median ${result.pages.medianMs} ms, max ${result.pages.maxMs} ms)` : ""}` : "; pages not checked (no --reader)";
    const journeys = result.journeys?.length ? `; journeys ${result.journeys.filter((j) => j.ok).length} of ${result.journeys.length} clicked through` : "";
    const schema = result.tutorsJson ? `; tutors.json ${result.tutorsJson.conforms ? "conforms" : `${result.tutorsJson.problems} schema problem(s), reported only`}` : "";
    log(`${failed ? "FAILED" : "ok"}  ${result.course.id} as ${result.course.servedAs}: files ${result.files.checked - result.files.problems.length} of ${result.files.checked}${pages}${journeys}${schema}`);
    log(`written: ${out}`);
  }
  return failed ? 1 : 0;
}

/** The course checks under a directory: <dir>/course-check.json, else <dir>/<course>/course-check.json, by course id. */
function checksIn(dir: string): Map<string, CourseCheck> {
  const out = new Map<string, CourseCheck>();
  const read = (f: string) => {
    const c = JSON.parse(readFileSync(f, "utf8")) as CourseCheck;
    if (c?.course?.id) out.set(c.course.id, c);
  };
  if (existsSync(join(dir, CHECK_FILE))) read(join(dir, CHECK_FILE));
  else if (existsSync(dir)) for (const d of readdirSync(dir, { withFileTypes: true })) if (d.isDirectory() && existsSync(join(dir, d.name, CHECK_FILE))) read(join(dir, d.name, CHECK_FILE));
  return out;
}

/**
 * `harness course compare --a <checks> --b <checks>` (since 1.32.0): production's checks (a) against main's (b), course by
 * course and page by page, as a student would notice (src/course/compare.ts). Exit 1 when anything is worse on b: a
 * course that loads on a and not on b, a page worse, or a journey b clicks less far through. What fails on both sides
 * is not b's doing and does not fail the compare.
 */
function compare(v: Values, log: (l: string) => void): number {
  const a = str(v, "a");
  const b = str(v, "b");
  if (!a || !b) throw new CourseUsageError("course compare needs --a <production's checks> and --b <main's checks>: folders holding course-check.json, or one per course");
  const ca = checksIn(resolve(a));
  const cb = checksIn(resolve(b));
  if (!ca.size || !cb.size) throw new CourseUsageError(`course compare found no ${CHECK_FILE} under ${!ca.size ? a : b}`);
  const courses: { id: string; comparison: CourseComparison | null; missing?: "a" | "b"; filesWorse?: string[] }[] = [];
  let worse = 0;
  for (const id of [...new Set([...ca.keys(), ...cb.keys()])].sort()) {
    const x = ca.get(id);
    const y = cb.get(id);
    if (!x || !y) {
      courses.push({ id, comparison: null, missing: !x ? "a" : "b" });
      if (!y) worse++;
      continue;
    }
    const c = compareCourse(x, y);
    const files = (y.files?.problems?.length ?? 0) > (x.files?.problems?.length ?? 0);
    courses.push({ id, comparison: c, ...(files ? { filesWorse: y.files.problems.slice(0, 3) } : {}) });
    worse += c.worse.length + c.journeys.worse.length + (files ? 1 : 0);
  }
  const result = { schema: "tutors-course-compare/1", a, b, worse, courses };
  const out = str(v, "out");
  if (out) writeFileSync(resolve(out), JSON.stringify(result, null, 2) + "\n");
  if (v.json) log(JSON.stringify(result, null, 2));
  else {
    for (const c of courses) {
      if (!c.comparison) {
        log(`${c.missing === "b" ? "WORSE " : "      "}  ${c.id}: not checked on ${c.missing}`);
        continue;
      }
      const k = c.comparison;
      const bad = k.worse.length + k.journeys.worse.length + (c.filesWorse ? 1 : 0);
      log(`${bad ? "WORSE " : "ok    "}  ${c.id}: ${k.worse.length} of ${k.compared} pages worse on b, ${k.better.length} better; journeys ${k.journeys.worse.length} worse, ${k.journeys.better.length} better of ${k.journeys.compared}`);
      if (c.filesWorse) log(`    - course files not as captured on b: ${c.filesWorse.join("; ")}`);
      for (const p of k.worse.slice(0, 10)) log(`    - ${p.path}: ${p.reasons.join("; ")}`);
      for (const j of k.journeys.worse) log(`    - journey ${j.name}: b clicks through ${j.b} of ${j.of}, a ${j.a}${j.stoppedAt ? `; b stops at ${j.stoppedAt}` : ""}`);
    }
    log(`${worse ? "WORSE" : "ok"}  ${worse} thing(s) worse on b than on a`);
  }
  return worse ? 1 : 0;
}
