/**
 * `harness why`: open a 5 Whys from a finding, check a filled one, regenerate the register. And the two places the
 * harness opens one by itself, so nobody has to remember to: `harness release` (a Gate FAIL, a Red band, a run rule
 * firing, open countermeasures only rising) and `harness glance mark --mark escalated`.
 *
 * A stub is never overwritten: once a file exists someone may be filling it in, so opening the same finding again on the
 * same day says where it already is. Nothing here reaches a verdict or an exit code of a run.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { MarkRecord } from "../glance/marks.ts";
import { checkWhy, parseWhy, type CheckProblem } from "./format.ts";
import { loadContext } from "./read.ts";
import { REGISTER_FILE } from "./register.ts";
import { WhyInputError, automaticFindings, renderStub, resolveFinding, type Finding, type Stub, type WhyContext } from "./trace.ts";

export const KAIZEN_DIR = "kaizen";

export interface Opened {
  file: string;
  /** False when the file was already there (it is left as it is). */
  written: boolean;
  trigger: Stub["trigger"];
  finding: string;
}

export function writeStub(c: WhyContext, f: Finding, o: { outDir: string; now: Date; harness?: string }): Opened {
  const stub = renderStub(c, f, o);
  mkdirSync(o.outDir, { recursive: true });
  const file = join(o.outDir, stub.name);
  const written = !existsSync(file);
  if (written) writeFileSync(file, stub.text);
  return { file, written, trigger: stub.trigger, finding: stub.finding };
}

/** `harness why --run <dir> --finding <id> [--out kaizen/] [--tag T] [--scoreboard f]`. */
export function openWhy(o: { run: string; finding: string; out: string; tag?: string; scoreboard?: string; now: Date; harness?: string }): Opened {
  const outDir = resolve(o.out);
  const c = loadContext(o.run, { ...(o.scoreboard ? { scoreboard: o.scoreboard } : {}), register: outDir, ...(o.tag ? { tag: o.tag } : {}), now: o.now });
  return writeStub(c, resolveFinding(c, o.finding), { outDir, now: o.now, ...(o.harness ? { harness: o.harness } : {}) });
}

/** The stubs a release run opens by itself, into `<dir>/kaizen/`. */
export function openAutomatic(c: WhyContext, o: { outDir: string; now: Date; harness?: string }): Opened[] {
  return automaticFindings(c).map((f) => writeStub(c, f, o));
}

/** An escalated glance mark opens a 5 Whys on why the harness could not show it, beside the release it was marked in. */
export function openEscalated(run: string, record: MarkRecord, o: { now: Date; harness?: string; scoreboard?: string }): Opened {
  const c = loadContext(run, { now: o.now, ...(o.scoreboard ? { scoreboard: o.scoreboard } : {}) });
  const f = resolveFinding(c, `${record.kind}:${record.key}`);
  return writeStub(c, f, { outDir: join(c.dir, KAIZEN_DIR), now: o.now, ...(o.harness ? { harness: o.harness } : {}) });
}

// ---- harness why check ------------------------------------------------------------------------------------

export interface Checked {
  file: string;
  problems: CheckProblem[];
}

/** Files and directories to check: a directory stands for every .md in it but the register's README.md. */
export function expandPaths(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    const abs = resolve(p);
    if (!existsSync(abs)) throw new WhyInputError(`${p} does not exist`);
    if (statSync(abs).isDirectory())
      out.push(
        ...readdirSync(abs)
          .filter((n) => n.endsWith(".md") && n !== REGISTER_FILE)
          .sort()
          .map((n) => join(abs, n))
      );
    else out.push(abs);
  }
  return out;
}

export function checkFiles(paths: string[]): Checked[] {
  return expandPaths(paths).map((file) => ({ file, problems: checkWhy(parseWhy(readFileSync(file, "utf8"))) }));
}

export function renderChecked(results: Checked[]): string {
  if (!results.length) return "no 5 Whys to check";
  const lines: string[] = [];
  for (const r of results) {
    if (!r.problems.length) lines.push(`ok      ${r.file}`);
    else {
      lines.push(`invalid ${r.file}`);
      for (const p of r.problems) lines.push(`  ${p.at}: ${p.why}`);
    }
  }
  const bad = results.filter((r) => r.problems.length).length;
  lines.push(bad ? `${bad} of ${results.length} 5 Whys not ready for the register` : `${results.length} 5 Whys ready for the register`);
  return lines.join("\n");
}
