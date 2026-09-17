#!/usr/bin/env node
// Thin launcher so `pnpm harness ...` and `npx harness ...` both work without a build step.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(process.execPath, ["--import", "tsx", resolve(root, "src/cli.ts"), ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: root
});
process.exit(result.status ?? 1);
