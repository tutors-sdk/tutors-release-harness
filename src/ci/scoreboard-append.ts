/**
 * CI guard: the scoreboard is append-only.
 *
 *   tsx src/ci/scoreboard-append.ts --base <sha>
 *
 * scoreboard/releases.jsonl (and scoreboard/mutants.jsonl) is the history of every release run, and the history is the
 * history: a line is never edited, reordered or removed, and a re-run is a new line with the next run number. A PR
 * that brings lines over from the `scoreboard` branch may only add them at the end. This compares each `.jsonl` under
 * scoreboard/ at `<base>` with the working tree and fails when a line that was there is changed or gone.
 *
 * Exits 1 on a violation, 2 on usage.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { appendOnlyProblem } from "../scoreboard/line.ts";

export const SCOREBOARD_GLOB = /^scoreboard\/[^/]+\.jsonl$/;

export interface FileState {
  path: string;
  /** undefined when the file does not exist on that side. */
  before?: string;
  after?: string;
}

/** Every append-only problem in the changed scoreboard files, one line each. */
export function checkAppendOnly(files: FileState[]): string[] {
  const errors: string[] = [];
  for (const f of files) {
    if (f.before === undefined || !f.before.trim()) continue;
    if (f.after === undefined) {
      errors.push(`${f.path} was deleted: the scoreboard is append-only`);
      continue;
    }
    const problem = appendOnlyProblem(f.before, f.after);
    if (problem) errors.push(`${f.path}: ${problem}. The scoreboard is append-only: add a new line (a re-run is the same tag with the next run number), never edit one`);
  }
  return errors;
}

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024 });
}

function gitShow(base: string, path: string): string | undefined {
  try {
    return git("show", `${base}:${path}`);
  } catch {
    return undefined;
  }
}

function main(argv: string[]): number {
  const at = argv.indexOf("--base");
  const base = at >= 0 ? argv[at + 1] : undefined;
  if (!base) {
    console.error("usage: scoreboard-append --base <sha>");
    return 2;
  }
  const changed = git("diff", "--name-only", `${base}...HEAD`).split("\n").filter((p) => SCOREBOARD_GLOB.test(p));
  const files = changed.map((path) => ({ path, ...(gitShow(base, path) !== undefined ? { before: gitShow(base, path)! } : {}), ...(existsSync(path) ? { after: readFileSync(path, "utf8") } : {}) }));
  const errors = checkAppendOnly(files);
  for (const e of errors) console.error(`::error title=The scoreboard is append-only::${e}`);
  if (!errors.length) console.log(changed.length ? `scoreboard: ${changed.join(", ")} only gained lines: ok` : "scoreboard: unchanged: ok");
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
