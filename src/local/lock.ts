import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * One heavy run at a time per machine.
 *
 * The compose project name, the host ports and the subnet are fixed per
 * checkout, so two `harness run`s on one machine collide (the second `up`
 * would `--remove-orphans` the first). On GitHub `concurrency:` groups
 * serialise them; locally this lock does. It is a file holding the holder's
 * pid: a holder that is no longer running is stale and is taken over.
 */
export interface LockInfo {
  pid: number;
  since: string;
  task: string;
}

export class LockHeldError extends Error {
  constructor(
    readonly file: string,
    readonly holder: LockInfo
  ) {
    super(`another harness run holds ${file}: ${holder.task} (pid ${holder.pid}, since ${holder.since}). Two runs on one machine share the compose project, its ports and its subnet; wait for it, or stop it.`);
    this.name = "LockHeldError";
  }
}

export interface LockDeps {
  pid?: number;
  isAlive?: (pid: number) => boolean;
  now?: () => Date;
}

export const processAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    // EPERM: it exists, we may not signal it.
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
};

function readInfo(file: string): LockInfo | undefined {
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as Partial<LockInfo>;
    return typeof raw.pid === "number" ? { pid: raw.pid, since: String(raw.since ?? "?"), task: String(raw.task ?? "?") } : undefined;
  } catch {
    return undefined;
  }
}

/** Who holds the lock right now: undefined when nobody does (no file, an unreadable one, or a holder that is no longer running). */
export function lockHolder(file: string, deps: Pick<LockDeps, "isAlive"> = {}): LockInfo | undefined {
  const holder = readInfo(file);
  return holder && (deps.isAlive ?? processAlive)(holder.pid) ? holder : undefined;
}

/** Take the lock, or throw LockHeldError. Returns the function that releases it. */
export function acquireLock(file: string, task: string, deps: LockDeps = {}): () => void {
  const pid = deps.pid ?? process.pid;
  const alive = deps.isAlive ?? processAlive;
  mkdirSync(dirname(file), { recursive: true });
  const info: LockInfo = { pid, since: (deps.now?.() ?? new Date()).toISOString(), task };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      writeFileSync(file, JSON.stringify(info), { flag: "wx" });
      return () => {
        // Only remove our own lock.
        if (readInfo(file)?.pid === pid) rmSync(file, { force: true });
      };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      const holder = readInfo(file);
      if (holder && holder.pid !== pid && alive(holder.pid)) throw new LockHeldError(file, holder);
      // Stale (holder gone, or unreadable): take it over.
      rmSync(file, { force: true });
    }
  }
  const holder = existsSync(file) ? readInfo(file) : undefined;
  throw new LockHeldError(file, holder ?? info);
}
