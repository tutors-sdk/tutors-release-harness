/**
 * The block of USAGE that belongs to one command: from its first `  harness <command> ...` line to the next
 * line that starts a different command (a command with several forms, `noise`, `local`, keeps them all;
 * the sentences that follow the last form belong to it). Undefined when the command has no usage.
 */
export function usageFor(command: string, usage: string): string | undefined {
  const start = (line: string) => /^ {2}harness (\S+)/.exec(line)?.[1];
  const out: string[] = [];
  let inside = false;
  for (const line of usage.split("\n")) {
    const cmd = start(line);
    if (cmd !== undefined) inside = cmd === command;
    if (inside) out.push(line);
  }
  return out.length ? `tutors-release-harness\n\n${out.join("\n").trimEnd()}\n` : undefined;
}

/**
 * Help, before any command is looked for: `--help`, `-h` and `help` print the usage and exit 0, `help <command>`
 * and `<command> --help` print that command's usage, and no arguments at all print it and exit 2.
 * Undefined when the arguments are for a command to run.
 */
export function helpFor(argv: string[], usage: string): { text: string; code: number } | undefined {
  const [first, second] = argv;
  if (first === undefined) return { text: usage, code: 2 };
  if (first === "--help" || first === "-h") return { text: usage, code: 0 };
  if (first === "help") {
    if (second === undefined || second === "--help" || second === "-h") return { text: usage, code: 0 };
    const text = usageFor(second, usage);
    return text ? { text, code: 0 } : { text: `no help for "${second}": not a command\n${usage}`, code: 2 };
  }
  if (argv.slice(1).some((a) => a === "--help" || a === "-h")) {
    const text = usageFor(first, usage);
    if (text) return { text, code: 0 };
    // Not a command with usage of its own: the whole usage is still better than a failure.
    return { text: `unknown command "${first}"\n${usage}`, code: 2 };
  }
  return undefined;
}
