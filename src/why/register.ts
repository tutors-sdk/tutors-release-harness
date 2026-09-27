/**
 * The kaizen register: kaizen/README.md, one row per 5 Whys, regenerated from the files and never edited by hand.
 *
 * The header of README.md is written by people (what the register is, how to use it); the table between the two
 * markers is `harness why register --write`'s alone, so a row always says what its file says. CI regenerates it and
 * fails when the two differ, the same way `harness guard scoreboard` keeps the scoreboard honest.
 *
 * Open is "no release named in Verified by"; overdue is open with a due date before today. Today is never written into
 * README.md (it would change every day with nothing changed): the counts that depend on it are computed where they are
 * shown (`harness release`'s summary for SOP step 12, `harness why register`).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkWhy, countermeasureOf, parseWhy, type CountermeasureKind } from "./format.ts";

export const REGISTER_FILE = "README.md";
export const REGISTER_START = "<!-- register:start -->";
export const REGISTER_END = "<!-- register:end -->";

export interface RegisterEntry {
  /** The file's name in the register directory. */
  file: string;
  title: string;
  trigger: string;
  /** The release the 5 Whys opened on (the first word of its Release field). */
  release: string;
  kind: CountermeasureKind | null;
  countermeasure: string;
  /** Kind mutant: the path under mutants/, which the register links. */
  mutant: string | null;
  owner: string;
  due: string;
  /** The release it was verified closed in; "" while open. */
  verifiedBy: string;
  open: boolean;
  /** How many problems `harness why check` finds in it (0: a filled 5 Whys). */
  problems: number;
}

export interface RegisterSummary {
  total: number;
  open: number;
  closed: number;
  /** Open, and due before today. */
  overdue: number;
  /** Open with no owner or no due date: SOP step 12 is not done for these. */
  unassigned: number;
}

/** The 5 Whys files of a register directory: every .md but README.md, in name order (which is date order). */
export function whyFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".md") && n !== REGISTER_FILE)
    .sort();
}

export function entryOf(file: string, text: string): RegisterEntry {
  const f = parseWhy(text);
  const cm = countermeasureOf(f);
  return {
    file,
    title: f.title.replace(/^5 Whys:\s*/i, ""),
    trigger: (f.fields.Trigger ?? "").trim(),
    release: ((f.fields.Release ?? "").trim().split(/\s+/)[0] ?? "").replace(/^`|`$/g, ""),
    kind: cm.kind,
    countermeasure: cm.what,
    mutant: cm.mutant,
    owner: cm.owner,
    due: cm.due,
    verifiedBy: cm.verifiedBy,
    open: !cm.verifiedBy,
    problems: checkWhy(f).length
  };
}

export function readRegister(dir: string): RegisterEntry[] {
  return whyFiles(dir).map((n) => entryOf(n, readFileSync(join(dir, n), "utf8")));
}

export function registerSummary(entries: RegisterEntry[], today: Date): RegisterSummary {
  const day = today.toISOString().slice(0, 10);
  const open = entries.filter((e) => e.open);
  return {
    total: entries.length,
    open: open.length,
    closed: entries.length - open.length,
    overdue: open.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.due) && e.due < day).length,
    unassigned: open.filter((e) => !e.owner || !e.due).length
  };
}

const cell = (s: string) => (s ? s.replaceAll("|", "\\|").replaceAll("\n", " ") : "—");
const short = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** The generated block: the table and one line of counts. Deterministic: the same files give the same bytes. */
export function renderRegisterBlock(entries: RegisterEntry[]): string {
  const rows = entries.map((e) => {
    const kind = e.kind ? (e.kind === "mutant" && e.mutant ? `mutant: [${e.mutant}](../${e.mutant})` : e.kind) : "—";
    const what = e.countermeasure ? `${kind}: ${short(e.countermeasure)}` : kind;
    const status = e.verifiedBy ? `closed in ${e.verifiedBy}` : e.problems ? `open (${e.problems} to fill: \`harness why check\`)` : "open";
    return `| [${cell(e.title || e.file)}](${e.file}) | ${cell(e.trigger)} | ${cell(e.release)} | ${cell(what)} | ${cell(e.owner)} | ${cell(e.due)} | ${status} |`;
  });
  const open = entries.filter((e) => e.open).length;
  return [
    REGISTER_START,
    "| 5 Whys | Trigger | Release | Countermeasure | Owner | Due | Verified closed in |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
    entries.length ? `${entries.length} 5 Whys: ${open} open, ${entries.length - open} closed.` : "No 5 Whys yet.",
    REGISTER_END
  ].join("\n");
}

/** A README.md written when there is none: the header people keep, and the block. */
export const DEFAULT_HEADER = `# Kaizen register

Every 5 Whys the harness opens, one row each, generated from the files in this directory by
\`harness why register --write\`. Do not edit the rows: edit the 5 Whys, then regenerate.
`;

/** README.md with its block replaced (or appended, the first time); the rest of the file is left as people wrote it. */
export function withBlock(readme: string | undefined, block: string): string {
  if (readme === undefined) return `${DEFAULT_HEADER}\n${block}\n`;
  const start = readme.indexOf(REGISTER_START);
  const end = readme.indexOf(REGISTER_END);
  if (start < 0 || end < start) return `${readme.trimEnd()}\n\n${block}\n`;
  return `${readme.slice(0, start)}${block}${readme.slice(end + REGISTER_END.length)}`;
}

export interface RegisterOutcome {
  file: string;
  entries: RegisterEntry[];
  block: string;
  /** README.md's block already says what the files say. */
  inSync: boolean;
  written: boolean;
}

/** Regenerate the table; write it only when asked. Without --write it says whether README.md is in sync with the files. */
export function registerOf(dir: string, write: boolean): RegisterOutcome {
  const file = join(dir, REGISTER_FILE);
  const entries = readRegister(dir);
  const block = renderRegisterBlock(entries);
  const before = existsSync(file) ? readFileSync(file, "utf8") : undefined;
  const after = withBlock(before, block);
  const inSync = before !== undefined && before === after;
  if (write && !inSync) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, after);
  }
  return { file, entries, block, inSync, written: write && !inSync };
}

/** One line for SOP step 12: the register's open and overdue counts, and where it is. */
export function registerLine(dir: string, today: Date): string {
  if (!existsSync(dir)) return `register: none at ${dir} (harness why register --write --dir ${dir} starts one)`;
  const s = registerSummary(readRegister(dir), today);
  const extra = s.unassigned ? `, ${s.unassigned} without an owner or a due date` : "";
  return `register: ${s.open} open countermeasure(s), ${s.overdue} overdue${extra}, ${s.closed} closed (${join(dir, REGISTER_FILE)}); review it at SOP step 12`;
}
