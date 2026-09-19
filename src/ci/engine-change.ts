/**
 * CI guard for the rule in TESTING.md: a change to an engine, a mask, a
 * journey, the gate or a mutant changes what the harness can promise, so the
 * PR must (1) re-run the mutants and (2) bump the harness version, so that
 * every report says which harness judged it.
 *
 *   tsx src/ci/engine-change.ts --base <sha>
 *
 * Writes `engine_changed=true|false` to $GITHUB_OUTPUT (the mutants job keys
 * off it) and exits 1 when such a change comes without a version bump.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import picomatch from "picomatch";

/** Paths whose change requires a mutants re-run and a version bump. */
export const ENGINE_PATHS = ["src/compare/**", "src/gate.ts", "normalise/**", "src/normalise/**", "traffic/journeys/**", "mutants/**"] as const;

export function engineFiles(changed: string[]): string[] {
  const matches = picomatch([...ENGINE_PATHS], { dot: true });
  return changed.map((f) => f.replaceAll("\\", "/")).filter((f) => matches(f));
}

const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

/** True when `head` is a strictly greater semver than `base` (a prerelease sorts before its release). */
export function isBumped(base: string, head: string): boolean {
  const b = SEMVER.exec(base);
  const h = SEMVER.exec(head);
  if (!h) return false;
  if (!b) return true;
  for (const i of [1, 2, 3]) {
    const d = Number(h[i]) - Number(b[i]);
    if (d !== 0) return d > 0;
  }
  if (b[4] === h[4]) return false;
  if (!h[4]) return true;
  if (!b[4]) return false;
  return h[4].localeCompare(b[4], undefined, { numeric: true }) > 0;
}

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" });
}

function main(argv: string[]): number {
  const at = argv.indexOf("--base");
  const base = at >= 0 ? argv[at + 1] : undefined;
  if (!base) {
    console.error("usage: engine-change --base <sha>");
    return 2;
  }
  const changed = git("diff", "--name-only", `${base}...HEAD`).split("\n").filter(Boolean);
  const engine = engineFiles(changed);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `engine_changed=${engine.length > 0}\n`);
  if (!engine.length) {
    console.log("no engine, mask, journey, gate or mutant change: mutants re-run and version bump not required");
    return 0;
  }
  console.log(`engine, mask, journey, gate or mutant change:\n${engine.map((f) => `  ${f}`).join("\n")}`);
  const before: string = JSON.parse(git("show", `${base}:package.json`)).version;
  const after: string = JSON.parse(readFileSync("package.json", "utf8")).version;
  if (!isBumped(before, after)) {
    console.error(`package.json version is ${after} (base: ${before}). A change to what the harness compares or gates on needs a version bump; see TESTING.md.`);
    return 1;
  }
  console.log(`version ${before} -> ${after}; the mutants must pass on this PR`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
