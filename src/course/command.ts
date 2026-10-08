import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CaptureError, captureCourse, dirFor, INDEX, type CaptureIndex, type FetchLike } from "./capture.ts";
import { parseCourseRef, CourseRefError } from "./ref.ts";
import { verifyCapture, VerifyInputError } from "./verify.ts";

/**
 * `harness course capture|verify|serve`: a live Tutors course onto disk, checked, and served, so a run can read a
 * known working course from local files (docs/course-capture.md). Exit 0 done, 1 the course (or, with --strict, a file
 * or a linked course) could not be captured or a capture no longer verifies, 2 usage or input that cannot be read.
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
}

export const SERVER = fileURLToPath(new URL("../../fixtures/course-server/serve.mjs", import.meta.url));

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
      default:
        throw new CourseUsageError(`course takes capture, verify or serve${sub ? `, not "${sub}"` : ""}: see harness help course`);
    }
  } catch (e) {
    if (e instanceof CourseRefError || e instanceof CaptureError || e instanceof VerifyInputError) throw new CourseUsageError(e.message);
    throw e;
  }
}

async function capture(v: Values, deps: CourseDeps, log: (l: string) => void): Promise<number> {
  const given = str(v, "course");
  if (!given) throw new CourseUsageError("course capture needs --course <https://tutors.dev/course/<id> | id>");
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
  const root = index.courses[0]!;
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
