import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT } from "../src/root.ts";

// docs/user-guide/09-extending.md: "Everything after capture is a pure function of the two captures on disk".
// The code after capture is the compare engines, masks, claims, the SLO file, the gate and the report.
const AFTER_CAPTURE = ["src/compare", "src/normalise", "src/claims", "src/slo", "src/report", "src/gate.ts"];
// What capture is made of: the stacks, the images, the collectors and the backends, and spawning processes.
const CAPTURE = ["src/stack.ts", "src/images.ts", "src/run.ts", "src/collectors/", "src/runtime/", "src/substrate/", "src/persistence/", "src/migration/", "src/modes/"];
const SPAWN = ["node:child_process", "child_process"];

const files = (path: string): string[] => {
  const abs = resolve(ROOT, path);
  if (!statSync(abs).isDirectory()) return [abs];
  return readdirSync(abs).flatMap((f) => files(join(path, f))).filter((f) => f.endsWith(".ts"));
};

// A type-only import is erased before it runs, so it is not an edge.
const imports = (file: string): string[] =>
  [...readFileSync(file, "utf8").matchAll(/^\s*(import|export)\s(type\s)?[^;]*?from\s+"([^"]+)"/gms)].filter((m) => !m[2]).map((m) => m[3]!);

// Stamps which harness judged (its version and its own git sha, via `git rev-parse`): never reads a capture or a stack.
const EXEMPT = ["src/version.ts"];

/** Every module reachable from `start`, with the chain that reached it. */
function reach(start: string): Map<string, string[]> {
  const seen = new Map<string, string[]>([[start, [relative(ROOT, start)]]]);
  const queue = [start];
  while (queue.length) {
    const file = queue.shift()!;
    for (const spec of imports(file)) {
      const key = spec.startsWith(".") ? resolve(dirname(file), spec) : spec;
      if (seen.has(key)) continue;
      seen.set(key, [...seen.get(file)!, spec.startsWith(".") ? relative(ROOT, key) : spec]);
      if (spec.startsWith(".") && key.endsWith(".ts") && !EXEMPT.includes(relative(ROOT, key))) queue.push(key);
    }
  }
  return seen;
}

describe("everything after capture is a pure function of the captures", () => {
  const start = AFTER_CAPTURE.flatMap(files);

  it("finds the code after capture", () => {
    expect(start.length).toBeGreaterThan(20);
  });

  it("imports no stack, image, collector or backend module and spawns no process, even transitively", () => {
    const bad: string[] = [];
    for (const file of start) {
      for (const [key, chain] of reach(file)) {
        const rel = key.startsWith("/") ? relative(ROOT, key) : key;
        if (SPAWN.includes(rel) || CAPTURE.some((c) => (c.endsWith("/") ? rel.startsWith(c) : rel === c))) bad.push(chain.join(" -> "));
      }
    }
    expect([...new Set(bad)]).toEqual([]);
  });
});
