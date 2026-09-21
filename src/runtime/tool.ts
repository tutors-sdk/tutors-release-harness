import type { Exec, ExecResult } from "../images.ts";

/**
 * A command the collectors depend on failed: not installed, no such container,
 * a non-zero exit. The collector that hit it reports "not collected: <message>"
 * rather than guessing, and never retries: a tool that fails is a finding, not
 * noise to be waited out.
 */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

/** One line of stderr (or stdout) to say why a command failed, without a wall of text in a report. */
function firstLine(result: ExecResult): string {
  const text = (result.stderr.trim() || result.stdout.trim()).split(/\r?\n/).find((l) => l.trim()) ?? "";
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}

function check(cmd: string, args: string[], result: ExecResult): void {
  if (result.error) {
    throw new ToolError(result.error.code === "ENOENT" ? `${cmd} is not installed or not on PATH` : `${cmd} could not be started: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const why = firstLine(result);
    throw new ToolError(`${cmd} ${args.slice(0, 2).join(" ")} exited ${result.status}${why ? `: ${why}` : ""}`);
  }
}

/** Run a command and return its stdout, or throw a ToolError that names the command and says why. */
export function mustRun(exec: Exec, cmd: string, args: string[]): string {
  const result = exec(cmd, args);
  check(cmd, args, result);
  return result.stdout;
}

/** Like mustRun, but returns stdout and stderr together: `docker logs` writes the container's stderr to ours. */
export function mustRunBoth(exec: Exec, cmd: string, args: string[]): string {
  const result = exec(cmd, args);
  check(cmd, args, result);
  return `${result.stdout}\n${result.stderr}`;
}

export function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
