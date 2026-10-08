import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CAPTURE_SCHEMA, INDEX, INDEX_SCHEMA, MANIFEST, type CaptureIndex, type CourseManifest } from "./capture.ts";

/**
 * `harness course verify`: is a capture still what was captured? Every file course-capture.json lists (tutors.json
 * first) must be there with its size and sha256. A file added beside them is not looked at: the manifest is the
 * fixture. Pure reading; nothing is fetched.
 */

export interface CourseVerdict {
  id: string;
  dir: string;
  checked: number;
  problems: string[];
}

export class VerifyInputError extends Error {}

function readJson<T>(file: string): T {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch (e) {
    throw new VerifyInputError(`cannot read ${file}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** The course folders under --dir: the folder itself when it holds course-capture.json, else each captured course in courses.json. */
export function courseDirs(dir: string): string[] {
  if (existsSync(join(dir, MANIFEST))) return [dir];
  if (!existsSync(join(dir, INDEX))) throw new VerifyInputError(`${dir} holds neither ${MANIFEST} nor ${INDEX}: not a course capture`);
  const index = readJson<CaptureIndex>(join(dir, INDEX));
  if (index.schema !== INDEX_SCHEMA) throw new VerifyInputError(`${join(dir, INDEX)}: schema is ${String(index.schema)}, expected ${INDEX_SCHEMA}`);
  if (index.dryRun) throw new VerifyInputError(`${join(dir, INDEX)} is from a dry run: nothing was captured`);
  return index.courses.filter((c) => c.status === "captured" && c.dir).map((c) => join(dir, c.dir!));
}

export function verifyCourse(dir: string): CourseVerdict {
  const manifest = readJson<CourseManifest>(join(dir, MANIFEST));
  if (manifest.schema !== CAPTURE_SCHEMA) throw new VerifyInputError(`${join(dir, MANIFEST)}: schema is ${String(manifest.schema)}, expected ${CAPTURE_SCHEMA}`);
  const problems: string[] = [];
  const all = [manifest.tutorsJson, ...manifest.files];
  for (const f of all) {
    const file = join(dir, ...f.path.split("/"));
    if (!existsSync(file)) {
      problems.push(`${f.path}: missing`);
      continue;
    }
    const body = readFileSync(file);
    if (body.byteLength !== f.bytes) problems.push(`${f.path}: ${body.byteLength} bytes, captured ${f.bytes}`);
    else if (createHash("sha256").update(body).digest("hex") !== f.sha256) problems.push(`${f.path}: sha256 differs from the capture`);
  }
  return { id: manifest.course.id, dir, checked: all.length, problems };
}

export function verifyCapture(dir: string): CourseVerdict[] {
  return courseDirs(dir).map(verifyCourse);
}
