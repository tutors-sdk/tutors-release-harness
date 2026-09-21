import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * What a checkout of the harness calls its stack (contract 1.3.0).
 *
 * The compose project and the kind cluster used to be called `tutors-harness`
 * for everybody, so a second checkout, or a git worktree, on one machine shared a
 * name: its `docker compose up --remove-orphans` replaced the other's stack. The
 * default is now derived from where the checkout is:
 *
 *   tutors-harness-<first 8 hex of sha256(real path of the harness root)>
 *
 * The real path is lowercased on Windows, where `D:\code\Harness` and
 * `d:\code\harness` are one directory. The same checkout always gets the same name;
 * two checkouts get different ones. Overrides still win, most specific first:
 *
 *   compose   HARNESS_COMPOSE_PROJECT, then HARNESS_PROJECT, then the derived name
 *   kind      HARNESS_KIND_CLUSTER,    then HARNESS_PROJECT, then the derived name
 *
 * The name `tutors-harness` itself is the LEGACY default. A machine that ran the
 * harness before 1.3.0 may have a stack, or a kind cluster, under it: the owner's, not
 * this checkout's. No command adopts it or removes it (`harness doctor` reports it
 * and says it is not touched), and a kind cluster of that name is refused outright.
 */
export const LEGACY_PROJECT = "tutors-harness";

/** A docker compose project name: lowercase letters, digits, dashes and underscores, starting with a letter or digit. */
const COMPOSE_NAME = /^[a-z0-9][a-z0-9_-]*$/;
/** A kind cluster name is a DNS label. */
const KIND_NAME = /^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$/;

/** The harness's root directory, resolved through symlinks (a checkout reached two ways is one checkout). */
export function harnessRoot(): string {
  const here = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  try {
    return realpathSync.native(here);
  } catch {
    return here;
  }
}

/** The 8 hex characters that tell this checkout from another: sha256 of its path, lowercased on Windows. */
export function checkoutId(root: string, platform: NodeJS.Platform = process.platform): string {
  const path = platform === "win32" ? root.toLowerCase() : root;
  return createHash("sha256").update(path, "utf8").digest("hex").slice(0, 8);
}

export const derivedName = (root: string, platform: NodeJS.Platform = process.platform) => `${LEGACY_PROJECT}-${checkoutId(root, platform)}`;

export interface ProjectName {
  name: string;
  /** Where the name came from, in words, for `harness doctor`. */
  source: string;
}

const set = (value: string | undefined) => (value?.trim() ? value.trim() : undefined);

function valid(name: string, variable: string, pattern: RegExp, what: string): string {
  if (!pattern.test(name)) throw new Error(`${variable}=${name} is not a valid ${what} name: lowercase letters, digits, "-" and "_" only, starting with a letter or digit`);
  return name;
}

export function composeProject(env: NodeJS.ProcessEnv = process.env, root: string = harnessRoot(), platform: NodeJS.Platform = process.platform): ProjectName {
  const specific = set(env.HARNESS_COMPOSE_PROJECT);
  if (specific) return { name: valid(specific, "HARNESS_COMPOSE_PROJECT", COMPOSE_NAME, "compose project"), source: "HARNESS_COMPOSE_PROJECT" };
  const general = set(env.HARNESS_PROJECT);
  if (general) return { name: valid(general, "HARNESS_PROJECT", COMPOSE_NAME, "compose project"), source: "HARNESS_PROJECT" };
  return { name: derivedName(root, platform), source: `this checkout's path (${root})` };
}

export function kindCluster(env: NodeJS.ProcessEnv = process.env, root: string = harnessRoot(), platform: NodeJS.Platform = process.platform): ProjectName {
  const specific = set(env.HARNESS_KIND_CLUSTER);
  if (specific) return { name: valid(specific, "HARNESS_KIND_CLUSTER", KIND_NAME, "kind cluster"), source: "HARNESS_KIND_CLUSTER" };
  const general = set(env.HARNESS_PROJECT);
  if (general) return { name: valid(general, "HARNESS_PROJECT", KIND_NAME, "kind cluster"), source: "HARNESS_PROJECT" };
  return { name: derivedName(root, platform), source: `this checkout's path (${root})` };
}

/**
 * Name a project or cluster from the environment, or say why not and stop with exit 2 (a bad name is a usage error; this
 * runs when the module loads, before any command could catch a throw).
 */
export function orExit<T>(name: () => T): T {
  try {
    return name();
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(2);
  }
}

/**
 * A kind cluster called `tutors-harness` is not the harness's: it is whatever the machine's owner made under
 * that name before the default was derived. Refuse to create, load into or delete anything in it.
 */
export function refuseLegacyCluster(cluster: string): void {
  if (cluster === LEGACY_PROJECT) {
    throw new Error(`the kind cluster name is "${LEGACY_PROJECT}", the name the harness used before 1.3.0 for everyone. A cluster of that name is not adopted or deleted by any harness command; unset HARNESS_KIND_CLUSTER / HARNESS_PROJECT to use this checkout's own name, or choose another`);
  }
}
