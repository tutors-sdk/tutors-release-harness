/**
 * CI guard for the rule in TESTING.md: a change to an engine, a collector, a
 * mask, a journey, a fixture, the stacks, the gate or a mutant (ENGINE_PATHS
 * below) changes what the harness can promise, so the
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

/**
 * Paths whose change requires a mutants re-run and a version bump: everything
 * that can change what is captured, compared, judged or gated, or what the two
 * stacks are made of, and so what a report says for the same two images.
 * Two reports are comparable only when their `harness.version` is the same
 * (docs/contract.md, Compatibility), which is why a change here bumps it.
 *
 * Every entry directly under `src/` and at the repository root must be either
 * here or in {@link NON_ENGINE_PATHS} with a reason; `tests/engine-change.test.ts`
 * fails when a new one is neither, so this list cannot quietly rot as the tree grows.
 */
export const ENGINE_PATHS = [
  // What is compared and how it is judged.
  "src/compare/**",
  "src/gate.ts",
  "src/claims/**",
  "src/normalise/**",
  "normalise/**",
  // What is captured, from the browser, the stacks, the images and the backends.
  "src/collectors/**",
  "src/runtime/**",
  "src/image-static/**",
  "src/persistence/**",
  "src/migration/**",
  "src/bus/**",
  "src/clock-probe.ts",
  // How a run is put together and which images and stacks are judged.
  "src/run.ts",
  "src/modes/**",
  "src/noise.ts",
  "src/stack.ts",
  "src/substrate/**",
  "src/images.ts",
  "src/image-ref.ts",
  "src/image-cache.ts",
  "src/digests.ts",
  "src/release-record.ts",
  "compose.harness.yaml",
  "deploy/**",
  "fixtures/**",
  "scripts/**",
  // What is driven through the stacks.
  "traffic/**",
  // The harness's own negative fixtures, and the code that builds and runs them.
  "mutants/**",
  "src/mutants.ts",
  "src/mutant-build.ts",
  // A dependency bump (Playwright, axe-core, pixelmatch, diff) changes what is captured and compared.
  "pnpm-lock.yaml"
] as const;

/**
 * Entries directly under `src/` or at the repository root that are deliberately
 * NOT engine code, each with why. Adding an entry here is a decision that a
 * change to it can never alter a verdict, a hunk or what is captured.
 * Dot-entries (`.git`, `.github`, `.nvmrc` ...) and generated directories are
 * ignored by the test; workflows are held to the contract by `tests/contract.test.ts`.
 */
export const NON_ENGINE_PATHS: Readonly<Record<string, string>> = {
  "src/ci": "the CI guards themselves (this file, mask-change, noise-history): unit tested; the mutants say nothing about them",
  "src/report": "renders what the engines decided; wording is a contract patch, and the mutants assert on the verdict, not the rendering (tests/report.test.ts and the schema tests hold it)",
  "src/cli.ts": "parses arguments and dispatches; the defaults and behaviour live in src/run.ts (engine); the flag surface is held by tests/contract.test.ts",
  "src/local": "the maintainer's wrappers and `harness doctor`: they plan and run the stable commands (which are engine code) and report what a machine lacks; a change here cannot alter what a run captures, compares or decides",
  "src/project.ts": "names the compose project and the kind cluster after the checkout; a name alters no capture, hunk or verdict",
  "src/override.ts": "records that a FAIL was overridden; the verdict stays what the gate decided",
  "src/types.ts": "types only, no behaviour",
  "src/version.ts": "stamps the versions; bumping it is the very change the rule asks for",
  "tests": "the tests; a change to one cannot change a report",
  "docs": "documentation",
  "claims": "an example claims file and its README, not read by the harness",
  "bin": "the executable shim that starts src/cli.ts",
  "package.json": "a version bump is the required change itself; dependencies are covered through pnpm-lock.yaml",
  "README.md": "documentation",
  "TESTING.md": "documentation",
  "LICENSE": "a licence",
  "eslint.config.mjs": "lint rules",
  "tsconfig.json": "type-checking options",
  "vitest.config.ts": "test runner options"
};

/** Directories at the repository root that are generated, not source, and never classified. */
export const GENERATED_ROOT_ENTRIES = ["node_modules", "out", "coverage", "playwright-report", "test-results", "dist"] as const;

const isEngine = picomatch([...ENGINE_PATHS], { dot: true });

export type Classification = "engine" | "non-engine" | "unclassified";

/** How one entry, a file or a directory directly under `src/` or the repository root, is classified. */
export function classify(entry: string): Classification {
  const e = entry.replaceAll("\\", "/").replace(/\/$/, "");
  const engine = isEngine(e) || isEngine(`${e}/x`);
  const non = Object.hasOwn(NON_ENGINE_PATHS, e);
  if (engine && non) throw new Error(`${e} is both an engine path and listed as non-engine`);
  return engine ? "engine" : non ? "non-engine" : "unclassified";
}

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
    console.log("no engine, mask, journey, fixture, stack, gate, collector or mutant change: mutants re-run and version bump not required");
    return 0;
  }
  console.log(`engine, mask, journey, fixture, stack, gate, collector or mutant change:\n${engine.map((f) => `  ${f}`).join("\n")}`);
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
