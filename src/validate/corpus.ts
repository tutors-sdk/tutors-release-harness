import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";

/**
 * The validate corpus (since 1.63.0): real course *sources*, pinned by commit, that `harness validate forecast` runs
 * `tutors validate` over. The course corpus (fixtures/course-corpus) is what students read from Netlify; validate reads
 * a lecturer's folder, so this one names Git repositories. The mono-repo's own CI holds a copy of the same list
 * (tests/validate-corpus/corpus.yaml, Rules 0758-0760) and fails a rule change that moves a finding; this one asks the
 * release question instead: what would lecturers see if main's validate shipped.
 */

export const VALIDATE_CORPUS_FILE = "fixtures/validate-corpus/courses.yaml";
export const MAX_VALIDATE_CORPUS = 8;

const Entry = z
  .object({
    name: z.string().regex(/^[a-z0-9-]+$/, "lower-case letters, digits and dashes"),
    repo: z.string().regex(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, "a https://github.com/owner/name URL"),
    commit: z.string().regex(/^[0-9a-f]{40}$/, "a full 40-character commit SHA"),
    why: z.string().min(10, "say why this course is in the corpus (10+ characters)")
  })
  .strict();

const Corpus = z.object({ courses: z.array(Entry).min(1).max(MAX_VALIDATE_CORPUS, `the corpus holds at most ${MAX_VALIDATE_CORPUS} courses`) }).strict();

export type ValidateCourse = z.infer<typeof Entry>;

export class ValidateCorpusError extends Error {}

export function loadValidateCorpus(file: string): ValidateCourse[] {
  let raw: unknown;
  try {
    raw = parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new ValidateCorpusError(`cannot read the validate corpus ${file}: ${e instanceof Error ? e.message : String(e)}`);
  }
  const parsed = Corpus.safeParse(raw);
  if (!parsed.success) throw new ValidateCorpusError(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`).join("; ")}`);
  const names = parsed.data.courses.map((c) => c.name);
  const twice = names.find((n, i) => names.indexOf(n) !== i);
  if (twice) throw new ValidateCorpusError(`${file}: ${twice} is listed twice`);
  return parsed.data.courses;
}
