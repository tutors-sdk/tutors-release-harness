import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";
import { parseCourseRef, type CourseRef } from "./ref.ts";

/**
 * The course corpus (since 1.30.0): a short, curated list of live courses the harness captures and checks, in
 * fixtures/course-corpus/courses.yaml. At most five courses, each captured alone (no linked courses), so the corpus is
 * exactly the courses the file names. One of them is the standard: the course a check or a benchmark uses when it is
 * given none.
 */

export const CORPUS_FILE = "fixtures/course-corpus/courses.yaml";
export const MAX_CORPUS = 5;

const Entry = z
  .object({
    course: z.string().min(1),
    why: z.string().min(10, "say why this course is in the corpus (10+ characters)"),
    skipExt: z.array(z.string().regex(/^[A-Za-z0-9]+$/)).optional(),
    maxFileMb: z.number().positive().optional()
  })
  .strict();

const Corpus = z
  .object({
    standard: z.string().min(1),
    courses: z.array(Entry).min(1).max(MAX_CORPUS, `the corpus holds at most ${MAX_CORPUS} courses`)
  })
  .strict();

export interface CorpusCourse {
  ref: CourseRef;
  why: string;
  skipExt: string[];
  maxFileMb?: number;
}

export interface CourseCorpus {
  file: string;
  standard: string;
  courses: CorpusCourse[];
}

export class CorpusError extends Error {}

export function loadCorpus(file: string): CourseCorpus {
  let raw: unknown;
  try {
    raw = parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new CorpusError(`cannot read the course corpus ${file}: ${e instanceof Error ? e.message : String(e)}`);
  }
  const parsed = Corpus.safeParse(raw);
  if (!parsed.success) throw new CorpusError(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`).join("; ")}`);
  const courses = parsed.data.courses.map((c, i) => {
    let ref: CourseRef;
    try {
      ref = parseCourseRef(c.course);
    } catch (e) {
      throw new CorpusError(`${file}: courses.${i}.course: ${e instanceof Error ? e.message : String(e)}`);
    }
    return { ref, why: c.why, skipExt: c.skipExt ?? [], ...(c.maxFileMb !== undefined ? { maxFileMb: c.maxFileMb } : {}) };
  });
  const ids = courses.map((c) => c.ref.id);
  const twice = ids.find((id, i) => ids.indexOf(id) !== i);
  if (twice) throw new CorpusError(`${file}: ${twice} is listed twice`);
  const standard = parseCourseRef(parsed.data.standard).id;
  if (!ids.includes(standard)) throw new CorpusError(`${file}: the standard, ${standard}, is not one of the courses`);
  return { file, standard, courses };
}
