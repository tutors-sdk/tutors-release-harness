import { join, resolve } from "node:path";
import { ROOT } from "../stack.ts";

/**
 * Where the harness keeps what outlives one run, on the machine that runs it.
 *
 * Everything the GitHub workflows keep in a service (the `noise` branch, the
 * runner's image cache, the `harness-override` issues, the artifact of the
 * latest release run) has a local home under one directory:
 *
 *   <home>/noise/               noise-status.json, noise-history.json, noise-summary.md (the `noise` branch)
 *   <home>/image-cache/         the last verified production images (the runner's actions/cache)
 *   <home>/overrides.jsonl      every applied override, append-only (the `harness-override` issues)
 *   <home>/rollbacks/           what a failing post-deploy watch leaves (the `rollback` issue)
 *   <home>/locks/               one run at a time per machine
 *   <home>/image-provenance.json  the ledger `images ensure` leaves for `run` (HARNESS_PROVENANCE_FILE moves it)
 *
 * Default `<repo>/.harness` (gitignored). `HARNESS_HOME` moves all of it, e.g. to a
 * directory that is backed up, or that several checkouts of the harness share.
 */
export function harnessHome(env: NodeJS.ProcessEnv = process.env): string {
  return env.HARNESS_HOME?.trim() ? resolve(env.HARNESS_HOME) : resolve(ROOT, ".harness");
}

export const noiseDir = (home = harnessHome()) => join(home, "noise");
export const imageCacheDir = (home = harnessHome()) => join(home, "image-cache");
export const overridesFile = (home = harnessHome()) => join(home, "overrides.jsonl");
export const rollbacksDir = (home = harnessHome()) => join(home, "rollbacks");
export const locksDir = (home = harnessHome()) => join(home, "locks");
