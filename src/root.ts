import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The harness checkout's root directory. A leaf module, so the code after capture (the compare engines, masks, claims,
 * SLO file and gate) can find the files it reads without importing src/stack.ts and its Docker plumbing; src/stack.ts
 * re-exports it. tests/purity.test.ts holds that.
 */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
