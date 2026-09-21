/**
 * A claims file or a rules file the harness was given and cannot use. It is a mistake of whoever wrote the file, not a
 * bug of the harness, so the CLI prints its message as it is (no stack trace) and exits 2, before any stack starts.
 */
export class InputFileError extends Error {
  override name = "InputFileError";
}

/** One thing wrong with an input file: where it is, and what is wrong, with optional lines of help below it. */
export interface Problem {
  /** For example `claim 2 of 3 (claims.1)` or `rule "31"`. */
  where: string;
  /** The field the problem is in, when it is in one. */
  field?: string;
  message: string;
  /** Extra lines: what is valid, a suggestion. */
  hints?: string[];
}

/**
 * The message of an {@link InputFileError}: the kind of file and where it came from, how many problems, then one block
 * per problem. Multi-line, and every line is meant to be read by a person.
 */
export function inputProblems(what: string, source: string, problems: Problem[]): InputFileError {
  const head = `${source} is not a valid ${what}: ${problems.length === 1 ? "1 problem" : `${problems.length} problems`}`;
  const blocks = problems.map((p) => {
    const line = `  ${p.where}${p.field ? `, ${p.field}` : ""}: ${p.message}`;
    return [line, ...(p.hints ?? []).map((h) => `      ${h}`)].join("\n");
  });
  return new InputFileError([head, "", ...blocks].join("\n"));
}

/** A file that cannot be read: what it was for, the path, and why in plain words (not an errno). */
export function unreadable(what: string, path: string, e: unknown): InputFileError {
  const code = (e as NodeJS.ErrnoException | undefined)?.code;
  const why =
    code === "ENOENT" ? "no such file"
    : code === "EISDIR" ? "it is a directory, not a file"
    : code === "EACCES" || code === "EPERM" ? "permission denied"
    : e instanceof Error ? e.message : String(e);
  return new InputFileError(`cannot read ${what} ${path}: ${why}`);
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]!;
      row[j] = Math.min(above + 1, row[j - 1]! + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length]!;
}

/** The candidates that are close to `value`: a different case, a typo, or one containing the other. Nearest first, at most three. */
export function nearest(value: string, candidates: readonly string[]): string[] {
  const v = value.trim().toLowerCase();
  if (!v) return [];
  const limit = Math.max(1, Math.floor(v.length / 3));
  return candidates
    .map((c) => ({ c, d: c.toLowerCase() === v ? 0 : c.toLowerCase().includes(v) || v.includes(c.toLowerCase()) ? 1 : distance(v, c.toLowerCase()) }))
    .filter((x) => x.d <= limit)
    .sort((x, y) => x.d - y.d || x.c.localeCompare(y.c))
    .slice(0, 3)
    .map((x) => x.c);
}

/** `Did you mean "dom"?`, or nothing when nothing is close. */
export function didYouMean(value: string, candidates: readonly string[]): string[] {
  const close = nearest(value, candidates);
  return close.length ? [`did you mean ${close.map((c) => `"${c}"`).join(" or ")}?`] : [];
}
