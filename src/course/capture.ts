import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { courseAssets, type AssetRef } from "./assets.ts";
import type { CourseRef } from "./ref.ts";

/**
 * `harness course capture`: a published Tutors course, as the reader sees it, onto disk. Reads `tutors.json` from the
 * course host, every file it names on that host (src/course/assets.ts), and, to --depth, the courses its `web` learning
 * objects link to. Only what answers an anonymous GET is read: a course that asks for a sign-in is recorded as not
 * public and nothing is guessed. Every file is written byte for byte with its sha256 in course-capture.json, so a
 * capture is a pinned fixture: `harness course verify` says whether it is still what was captured.
 *
 * Self-contained on purpose (node built-ins, `fetch`, nothing else from the harness), so the folder can be lifted into
 * any tool that wants a real course on disk.
 */

export const CAPTURE_SCHEMA = "tutors-course-capture/1";
export const INDEX_SCHEMA = "tutors-course-capture-index/1";
export const MANIFEST = "course-capture.json";
export const INDEX = "courses.json";

export type FetchLike = (url: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<Response>;

export interface CaptureOptions {
  course: CourseRef;
  /** The folder the capture is written to: one sub-folder per course and courses.json. */
  out: string;
  /** How many levels of linked courses to follow: 0 is the course alone. */
  depth: number;
  concurrency: number;
  /** Files larger than this are recorded as skipped, not written. */
  maxFileBytes?: number;
  /** File extensions (no dot, any case) recorded as skipped, not fetched: e.g. mp4, zip. */
  skipExt: string[];
  /** Fetch nothing but tutors.json and write nothing: what a capture would read. */
  dryRun: boolean;
  /** Replace a course folder that is already there. Without it, a non-empty --out is refused. */
  force: boolean;
  harnessVersion: string;
  fetch?: FetchLike;
  now?: () => Date;
  log?: (line: string) => void;
  retries?: number;
  timeoutMs?: number;
  backoffMs?: number;
}

export interface CapturedFile {
  path: string;
  bytes: number;
  sha256: string;
  contentType?: string;
}

export interface CourseManifest {
  schema: typeof CAPTURE_SCHEMA;
  course: { id: string; origin: string; reader: string; title?: string };
  capturedAt: string;
  harness: { version: string };
  tutorsJson: CapturedFile;
  types: Record<string, number>;
  files: CapturedFile[];
  missing: { path: string; from: string; status?: number; error?: string }[];
  skipped: { path: string; from: string; reason: string; bytes?: number }[];
  links: { id: string; origin: string }[];
}

export type CourseStatus = "captured" | "not-public" | "not-found" | "unreachable" | "not-a-course";

export interface IndexEntry {
  id: string;
  origin: string;
  depth: number;
  status: CourseStatus;
  dir?: string;
  linkedFrom?: string;
  title?: string;
  files?: number;
  bytes?: number;
  missing?: number;
  skipped?: number;
  detail?: string;
}

export interface CaptureIndex {
  schema: typeof INDEX_SCHEMA;
  root: string;
  capturedAt: string;
  harness: { version: string };
  depth: number;
  dryRun: boolean;
  courses: IndexEntry[];
}

export class CaptureError extends Error {}

const USER_AGENT = "tutors-release-harness course capture (+https://github.com/tutors-sdk/tutors-release-harness)";

const sha256 = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");

/** A course id as a folder name: ids are already safe, a host-shaped id (localhost:8080) is made so. */
export const dirFor = (id: string) => id.replace(/[^A-Za-z0-9._-]/g, "_");

/** The address of a path on the course host, each segment encoded. */
const urlOf = (origin: string, path: string) => `${origin}/${path.split("/").map(encodeURIComponent).join("/")}`;

interface Got {
  status: number;
  body?: Uint8Array;
  contentType?: string;
  tooLarge?: number;
  error?: string;
}

async function get(url: string, o: CaptureOptions): Promise<Got> {
  const doFetch = o.fetch ?? (globalThis.fetch as FetchLike);
  const retries = o.retries ?? 2;
  let last: Got = { status: 0, error: "not tried" };
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, (o.backoffMs ?? 500) * 2 ** (attempt - 1)));
    try {
      const res = await doFetch(url, { signal: AbortSignal.timeout(o.timeoutMs ?? 60_000), headers: { "user-agent": USER_AGENT } });
      const contentType = res.headers.get("content-type") ?? undefined;
      const declared = Number(res.headers.get("content-length") ?? NaN);
      if (res.ok && o.maxFileBytes !== undefined && declared > o.maxFileBytes) {
        await res.body?.cancel();
        return { status: res.status, tooLarge: declared, ...(contentType ? { contentType } : {}) };
      }
      if (!res.ok) {
        await res.body?.cancel();
        last = { status: res.status };
        // Retry what may pass: the host or a proxy in trouble. A 4xx is the answer.
        if (res.status >= 500 || res.status === 429) continue;
        return last;
      }
      const body = new Uint8Array(await res.arrayBuffer());
      if (o.maxFileBytes !== undefined && body.byteLength > o.maxFileBytes) return { status: res.status, tooLarge: body.byteLength };
      return { status: res.status, body, ...(contentType ? { contentType } : {}) };
    } catch (e) {
      last = { status: 0, error: e instanceof Error ? (e.cause instanceof Error ? `${e.message}: ${e.cause.message}` : e.message) : String(e) };
    }
  }
  return last;
}

async function pool<T>(items: T[], size: number, work: (item: T) => Promise<void>) {
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(size, items.length)) }, async () => {
    while (next < items.length) await work(items[next++]!);
  });
  await Promise.all(workers);
}

function write(file: string, body: Uint8Array) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
}

/** Why a tutors.json could not be read, in the index's words. */
function statusOf(got: Got): { status: CourseStatus; detail: string } {
  if (got.status === 401 || got.status === 403) return { status: "not-public", detail: `HTTP ${got.status}: the host asks for a sign-in; nothing is captured` };
  if (got.status === 404) return { status: "not-found", detail: "HTTP 404: no tutors.json at this host" };
  return { status: "unreachable", detail: got.error ?? `HTTP ${got.status}` };
}

async function captureOne(ref: CourseRef, o: CaptureOptions, capturedAt: string): Promise<{ entry: Omit<IndexEntry, "depth">; links: CourseRef[] }> {
  const log = o.log ?? (() => {});
  const { maxFileBytes: _uncapped, ...uncapped } = o;
  const got = await get(`${ref.origin}/tutors.json`, uncapped);
  if (!got.body) {
    const s = statusOf(got);
    log(`${ref.id}: ${s.status} (${s.detail})`);
    return { entry: { id: ref.id, origin: ref.origin, ...s }, links: [] };
  }
  let tree: unknown;
  try {
    tree = JSON.parse(new TextDecoder().decode(got.body));
  } catch {
    tree = undefined;
  }
  const type = (tree as { type?: unknown } | undefined)?.type;
  if (!tree || typeof tree !== "object" || type !== "course") {
    const detail = tree === undefined ? "tutors.json is not JSON (a sign-in page or an error page?)" : `tutors.json is a ${String(type)}, not a course`;
    log(`${ref.id}: not-a-course (${detail})`);
    return { entry: { id: ref.id, origin: ref.origin, status: "not-a-course", detail }, links: [] };
  }
  const title = typeof (tree as { title?: unknown }).title === "string" ? ((tree as { title: string }).title).trim() : undefined;
  const { assets, links, types } = courseAssets(tree);
  const dir = dirFor(ref.id);
  const root = join(o.out, dir);
  const skip = new Set(o.skipExt.map((e) => e.toLowerCase().replace(/^\./, "")));
  const files: CapturedFile[] = [];
  const missing: CourseManifest["missing"] = [];
  const skipped: CourseManifest["skipped"] = [];
  log(`${ref.id}: tutors.json ${got.body.byteLength} bytes, ${Object.values(types).reduce((a, b) => a + b, 0)} learning objects, ${assets.length} files named on ${ref.origin}, ${links.length} linked courses`);

  const fetchable: AssetRef[] = [];
  for (const a of assets) {
    const ext = a.path.split(".").pop()!.toLowerCase();
    if (skip.has(ext)) skipped.push({ path: a.path, from: a.from, reason: `--skip-ext ${ext}` });
    else fetchable.push(a);
  }

  if (!o.dryRun) {
    if (existsSync(root) && readdirSync(root).length) {
      if (!o.force) throw new CaptureError(`${root} is not empty: pass --force to replace it, or another --out`);
      rmSync(root, { recursive: true, force: true });
    }
    write(join(root, "tutors.json"), got.body);
    let done = 0;
    await pool(fetchable, o.concurrency, async (a) => {
      const r = await get(urlOf(ref.origin, a.path), o);
      if (r.tooLarge !== undefined) skipped.push({ path: a.path, from: a.from, reason: `larger than --max-file-mb`, bytes: r.tooLarge });
      else if (r.body) {
        write(join(root, ...a.path.split("/")), r.body);
        files.push({ path: a.path, bytes: r.body.byteLength, sha256: sha256(r.body), ...(r.contentType ? { contentType: r.contentType } : {}) });
      } else missing.push({ path: a.path, from: a.from, ...(r.status ? { status: r.status } : {}), ...(r.error ? { error: r.error } : {}) });
      if (++done % 50 === 0) log(`${ref.id}: ${done}/${fetchable.length} files`);
    });
  }

  const byPath = (a: { path: string }, b: { path: string }) => a.path.localeCompare(b.path);
  files.sort(byPath);
  missing.sort(byPath);
  skipped.sort(byPath);
  const manifest: CourseManifest = {
    schema: CAPTURE_SCHEMA,
    course: { id: ref.id, origin: ref.origin, reader: `https://tutors.dev/course/${ref.id}`, ...(title ? { title } : {}) },
    capturedAt,
    harness: { version: o.harnessVersion },
    tutorsJson: { path: "tutors.json", bytes: got.body.byteLength, sha256: sha256(got.body), ...(got.contentType ? { contentType: got.contentType } : {}) },
    types,
    files,
    missing,
    skipped,
    links: links.map((l) => ({ id: l.id, origin: l.origin }))
  };
  if (!o.dryRun) writeFileSync(join(root, MANIFEST), JSON.stringify(manifest, null, 2) + "\n");
  const bytes = files.reduce((n, f) => n + f.bytes, got.body.byteLength);
  log(o.dryRun ? `${ref.id}: would fetch ${fetchable.length} files (dry run)` : `${ref.id}: ${files.length} files, ${bytes} bytes, ${missing.length} missing, ${skipped.length} skipped`);
  return {
    entry: {
      id: ref.id,
      origin: ref.origin,
      status: "captured",
      ...(title ? { title } : {}),
      ...(o.dryRun ? {} : { dir }),
      files: o.dryRun ? fetchable.length : files.length,
      bytes,
      missing: missing.length,
      skipped: skipped.length
    },
    links
  };
}

/** The course, then its linked courses breadth first to --depth, each once. Writes courses.json beside them. */
export async function captureCourse(o: CaptureOptions): Promise<CaptureIndex> {
  const capturedAt = (o.now?.() ?? new Date()).toISOString();
  if (!o.dryRun) mkdirSync(o.out, { recursive: true });
  const seen = new Set<string>([o.course.id]);
  const courses: IndexEntry[] = [];
  let frontier: { ref: CourseRef; from?: string }[] = [{ ref: o.course }];
  for (let depth = 0; depth <= o.depth && frontier.length; depth++) {
    const next: typeof frontier = [];
    for (const { ref, from } of frontier) {
      const { entry, links } = await captureOne(ref, o, capturedAt);
      courses.push({ ...entry, depth, ...(from ? { linkedFrom: from } : {}) });
      for (const l of links) if (!seen.has(l.id)) {
        seen.add(l.id);
        next.push({ ref: l, from: ref.id });
      }
    }
    frontier = next;
  }
  const index: CaptureIndex = { schema: INDEX_SCHEMA, root: o.course.id, capturedAt, harness: { version: o.harnessVersion }, depth: o.depth, dryRun: o.dryRun, courses };
  if (!o.dryRun) writeFileSync(join(o.out, INDEX), JSON.stringify(index, null, 2) + "\n");
  return index;
}
