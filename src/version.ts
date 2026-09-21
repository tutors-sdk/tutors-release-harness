import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { HarnessInfo } from "./types.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Version of the integration contract in docs/contract.md: the shape of
 * report.json and noise-status.json, exit codes, the claims format, the CLI
 * surface the workflows use, and the dispatch payloads. Semver, independent of
 * the harness version; docs/contract.md says what bumps which part.
 */
export const CONTRACT_VERSION = "1.2.0";

/** The contract's major version, stamped into report.json and noise-status.json as `schemaVersion`. */
export const SCHEMA_VERSION = Number(CONTRACT_VERSION.split(".")[0]);

/** Version of the claims file format (`version:` in claims.yaml; optional, defaults to this). */
export const CLAIMS_VERSION = 1;

export const HARNESS_VERSION: string = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")).version;

function gitSha(): string | null {
  const fromEnv = process.env.HARNESS_GIT_SHA?.trim();
  if (fromEnv) return fromEnv;
  try {
    const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return /^[0-9a-f]{40}$/.test(sha) ? sha : null;
  } catch {
    return null;
  }
}

let cached: HarnessInfo | undefined;

/** Which harness produced an artefact: package version, commit when the checkout has one, contract version. */
export function harnessInfo(): HarnessInfo {
  cached ??= { version: HARNESS_VERSION, gitSha: gitSha(), contractVersion: CONTRACT_VERSION };
  return { ...cached };
}
