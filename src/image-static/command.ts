import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExecResult } from "../images.ts";

/**
 * Split a command template into argv, honouring single and double quotes. There
 * is no shell: nothing is expanded, so a scanner command in an environment
 * variable cannot smuggle in a pipeline.
 */
export function splitCommand(template: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: string | null = null;
  let started = false;
  for (const ch of template.trim()) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      started = true;
    } else if (/\s/.test(ch)) {
      if (started || cur) out.push(cur);
      cur = "";
      started = false;
    } else {
      cur += ch;
    }
  }
  if (quote) throw new Error(`unterminated ${quote} in command: ${template}`);
  if (started || cur) out.push(cur);
  return out;
}

/** Fill `{name}` placeholders in every argument. */
export function fillCommand(template: string, values: Record<string, string>): string[] {
  return splitCommand(template).map((arg) => arg.replace(/\{([a-z]+)\}/g, (whole, name: string) => values[name] ?? whole));
}

/** Where a scanner reads an SBOM from. Injected so unit tests write nowhere. */
export interface TempFiles {
  write(name: string, content: string): string;
}

export function osTempFiles(): TempFiles {
  let dir: string | undefined;
  return {
    write(name, content) {
      dir ??= mkdtempSync(join(tmpdir(), "harness-static-"));
      const path = join(dir, name);
      writeFileSync(path, content);
      return path;
    }
  };
}

/** Why a command that could not run, or exited non-zero, did not produce output: one line, with an install hint for a missing tool. */
export function failureReason(tool: string, result: ExecResult, hint: string): string {
  if (result.error) return result.error.code === "ENOENT" ? `${tool} is not installed (${hint})` : `${tool} could not be run: ${result.error.message}`;
  const why = result.stderr.trim().split(/\r?\n/).filter(Boolean).slice(-2).join(" / ") || `exited ${result.status}`;
  return `${tool} failed: ${why}`;
}
