/**
 * `harness glance mark` and `harness glance status`: the Reviewer's record of SOP step 8, in the `harness release`
 * directory beside confidence.json.
 *
 * mark    appends one line to glance-marks.jsonl and re-renders the glance where it is shown (confidence.json's `mark`
 *         fields, and the glance block of report.md, gate.md and report.html), nothing else: the Gate, the RCS and every
 *         exit code stay what they were.
 * status  prints the glance with its marks and what they mean for go (an Amber release goes only once every item is
 *         recorded verified). Informational: it exits 0 whatever the marks say.
 */
import { appendFileSync, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Changes } from "../changes/signals.ts";
import type { Confidence } from "../score/confidence.ts";
import { CONFIDENCE_FILE } from "../score/read.ts";
import { MARKS_FILE, MarkError, applyMarks, glanceStatus, isMark, markRecord, parseMarks, type GlanceStatus, type MarkRecord } from "./marks.ts";
import { MARK_MEANS, MARK_WORDS } from "./rank.ts";
import { renderGlanceHtml, renderGlanceMarkdown, replaceGlanceBlock } from "./render.ts";

export class GlanceInputError extends Error {}

export interface Scored {
  dir: string;
  file: string;
  confidence: Confidence;
  records: MarkRecord[];
}

/** `--run`: a `harness release` directory (or any directory with a confidence.json), or the confidence.json itself. */
export function readScored(where: string): Scored {
  const p = resolve(where);
  if (!existsSync(p)) throw new GlanceInputError(`--run: ${where} does not exist`);
  const dir = statSync(p).isDirectory() ? p : dirname(p);
  const file = join(dir, CONFIDENCE_FILE);
  if (!existsSync(file)) throw new GlanceInputError(`--run: no ${CONFIDENCE_FILE} in ${dir}: the glance is ranked by the score stage of harness release (or harness confidence)`);
  let confidence: Confidence;
  try {
    confidence = JSON.parse(readFileSync(file, "utf8")) as Confidence;
  } catch {
    throw new GlanceInputError(`${file} is not JSON`);
  }
  if (!Array.isArray(confidence.glance)) throw new GlanceInputError(`${file} is not a confidence.json`);
  const marks = join(dir, MARKS_FILE);
  const records = existsSync(marks) ? parseMarks(readFileSync(marks, "utf8")) : [];
  return { dir, file, confidence, records };
}

/**
 * The glance where it is shown, with the marks so far: confidence.json's `mark` fields, and the block between the glance
 * markers of report.md, gate.md and report.html. A file without the block (a run's own report beside a `harness
 * confidence` score) is left alone. Returns the files rewritten.
 */
export function rerender(s: Scored): string[] {
  const c: Confidence = { ...s.confidence, glance: applyMarks(s.confidence.glance, s.records) };
  const done: string[] = [];
  writeFileSync(s.file, `${JSON.stringify(c, null, 2)}\n`);
  done.push(s.file);
  const blocks = { md: renderGlanceMarkdown(c, { dir: s.dir, records: s.records }), html: renderGlanceHtml(c, { dir: s.dir, records: s.records }) };
  for (const name of ["report.md", "gate.md", "report.html"]) {
    const f = join(s.dir, name);
    if (!existsSync(f)) continue;
    const r = replaceGlanceBlock(readFileSync(f, "utf8"), name.endsWith(".html") ? blocks.html : blocks.md);
    if (!r.replaced) continue;
    writeFileSync(f, r.text);
    done.push(f);
  }
  return done;
}

/** SOP roles: the Reviewer authored no PR in the release. A name that matches an author in changes.json is said, not refused. */
function roleWarning(dir: string, by: string): string | undefined {
  const f = join(dir, "changes.json");
  if (!existsSync(f)) return undefined;
  try {
    const c = JSON.parse(readFileSync(f, "utf8")) as Partial<Changes>;
    const prs = (c.prs ?? []).filter((p) => p.author?.trim().toLowerCase() === by.trim().toLowerCase());
    if (!prs.length) return undefined;
    return `note: ${by} is named as the author of ${prs.map((p) => (p.pr !== null ? `PR #${p.pr}` : `commit ${p.sha.slice(0, 7)}`)).join(", ")} in changes.json; the SOP's Reviewer authored no PR in this release. If that is so, record the deviation in the release PR.`;
  } catch {
    return undefined;
  }
}

export interface MarkOutcome {
  record: MarkRecord;
  status: GlanceStatus;
  files: string[];
  warning?: string;
}

export function markItem(o: { run: string; item: string | undefined; mark: string | undefined; by: string | undefined; note?: string; now: Date }): MarkOutcome {
  const s = readScored(o.run);
  const n = Number(o.item);
  if (!s.confidence.glance.length) throw new GlanceInputError(`the glance of ${s.dir} has no items: nothing to mark`);
  if (!o.item || !Number.isInteger(n) || n < 1 || n > s.confidence.glance.length) throw new GlanceInputError(`--item takes a number from 1 to ${s.confidence.glance.length} (the glance's ranks)`);
  if (!o.mark || !isMark(o.mark)) throw new GlanceInputError(`--mark takes one of ${MARK_WORDS.join(", ")} (${MARK_WORDS.map((m) => `${m}: ${MARK_MEANS[m].means}`).join("; ")})`);
  const item = s.confidence.glance.find((i) => i.rank === n)!;
  let record: MarkRecord;
  try {
    record = markRecord({ item, mark: o.mark, by: o.by ?? "", at: o.now, ...(o.note ? { note: o.note } : {}) });
  } catch (e) {
    if (e instanceof MarkError) throw new GlanceInputError(e.message);
    throw e;
  }
  appendFileSync(join(s.dir, MARKS_FILE), `${JSON.stringify(record)}\n`);
  const records = [...s.records, record];
  const files = rerender({ ...s, records });
  const warning = roleWarning(s.dir, record.by);
  return { record, status: glanceStatus({ glance: s.confidence.glance, band: s.confidence.band, gate: s.confidence.gate }, records), files: [join(s.dir, MARKS_FILE), ...files], ...(warning ? { warning } : {}) };
}

export function statusOf(run: string): Scored & { status: GlanceStatus } {
  const s = readScored(run);
  return { ...s, status: glanceStatus({ glance: s.confidence.glance, band: s.confidence.band, gate: s.confidence.gate }, s.records) };
}
