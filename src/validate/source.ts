import { execFileSync } from "node:child_process";
import { closeSync, existsSync, ftruncateSync, mkdirSync, openSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ValidateCourse } from "./corpus.ts";

/**
 * A corpus course's source on disk, without its slide decks and videos (since 1.63.0). The courses are big (a module is
 * 0.5 to 1 GB, nearly all PDFs, Keynote decks and video), so each is a partial clone that skips blobs of 256 KB and
 * over; the skipped text and images are then fetched in one request, and any other big file is written as a sparse
 * placeholder of 256 KB. tutors validate reads only text and the size of images, so it sees the course as a full
 * checkout would show it. The same approach as the mono-repo's scripts/checks/validate-corpus.ts.
 */

export const BLOB_LIMIT = 256 * 1024;
const TEXT = /(^|\/)[^./]+$|\.(md|markdown|yaml|yml|toml|marp|json|txt|csv)$/i;
const IMAGE = /\.(png|jpe?g|gif|svg|webp|bmp|ico|avif|tiff?)$/i;

export type Git = (args: string[], cwd: string, input?: string) => Buffer;

export const realGit: Git = (args, cwd, input) =>
  execFileSync("git", args, { cwd, ...(input !== undefined ? { input } : {}), stdio: ["pipe", "pipe", "pipe"], maxBuffer: 512 * 1024 * 1024 });

function store(course: ValidateCourse, work: string, git: Git): string {
  const dir = join(work, "sources", `${course.name}-${course.commit.slice(0, 12)}`);
  if (existsSync(join(dir, ".git", "harness-fetched"))) return dir;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  git(["init", "--quiet"], dir);
  git(["remote", "add", "origin", course.repo], dir);
  git(["fetch", "--quiet", "--depth", "1", `--filter=blob:limit=${BLOB_LIMIT}`, "origin", course.commit], dir);
  writeFileSync(join(dir, ".git", "harness-fetched"), course.commit);
  return dir;
}

function readBlobs(dir: string, shas: string[], git: Git): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  if (shas.length === 0) return out;
  const raw = git(["cat-file", "--batch"], dir, shas.join("\n") + "\n");
  let at = 0;
  while (at < raw.length) {
    const end = raw.indexOf(10, at);
    const [sha, type, size] = raw.subarray(at, end).toString("utf8").split(" ");
    if (type === "missing") throw new Error(`blob ${sha} is missing from the partial clone`);
    const bytes = Number(size);
    out.set(sha!, raw.subarray(end + 1, end + 1 + bytes));
    at = end + 1 + bytes + 1;
  }
  return out;
}

/** Writes the course under <work>/courses/<name> (replacing what was there) and returns that folder. */
export function materialise(course: ValidateCourse, work: string, git: Git = realGit): string {
  const source = store(course, work, git);
  const tree = git(["ls-tree", "-r", "-z", course.commit], source)
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((line) => {
      const [meta = "", path = ""] = line.split("\t");
      const [mode, type, sha] = meta.split(" ");
      return { mode, type, sha: sha!, path };
    })
    .filter((e) => e.type === "blob" && e.mode !== "120000");
  const present = new Set(
    git(["cat-file", "--batch-check", "--batch-all-objects"], source)
      .toString("utf8")
      .split("\n")
      .filter((l) => l.includes(" blob "))
      .map((l) => l.split(" ")[0]!)
  );
  const wanted = [...new Set(tree.filter((e) => !present.has(e.sha) && (TEXT.test(e.path) || IMAGE.test(e.path))).map((e) => e.sha))];
  if (wanted.length > 0) {
    git(["-c", "fetch.negotiationAlgorithm=noop", "fetch", "--quiet", "--no-tags", "--no-write-fetch-head", "--filter=blob:none", "--stdin", "origin"], source, wanted.join("\n") + "\n");
    for (const sha of wanted) present.add(sha);
  }
  const blobs = readBlobs(source, [...new Set(tree.filter((e) => present.has(e.sha)).map((e) => e.sha))], git);
  const root = join(work, "courses", course.name);
  rmSync(root, { recursive: true, force: true });
  for (const entry of tree) {
    const file = join(root, entry.path);
    mkdirSync(dirname(file), { recursive: true });
    const bytes = blobs.get(entry.sha);
    if (bytes) writeFileSync(file, bytes);
    else {
      const fd = openSync(file, "w");
      ftruncateSync(fd, BLOB_LIMIT);
      closeSync(fd);
    }
  }
  return root;
}
