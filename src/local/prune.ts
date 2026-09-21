import { existsSync, lstatSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { CACHE_MANIFEST, CACHE_TAR, readManifest } from "../image-cache.ts";

/**
 * `harness prune`: the run directories under `out/` and the image cache grow
 * without bound (screenshots, k6 output, `docker save` tars). This decides what
 * can go, and only ever names three kinds of thing:
 *
 *   - a directory directly under the output root called `<UTC timestamp>-<mode>`,
 *     the shape `harness run`, `harness local gate` and `harness kind rollout`
 *     give theirs (anything else in `out/` is not the harness's and is left alone);
 *   - `images.tar` and `manifest.json` of an image cache directory.
 *
 * It never names HARNESS_HOME state that has to persist: the noise store, the
 * release records, the override log, the rollbacks, the locks and the image
 * provenance ledger are not under `out/` and are not looked at.
 *
 * A run directory goes only when ALL of these hold (each one is a reason to keep it):
 *   1. it is not protected: the newest release run that did not FAIL is what
 *      `harness local watch` compares production with;
 *   2. it is not recent: nothing started or touched in the last six hours is
 *      removed, whatever the flags say, because `harness run` takes no lock and
 *      may be running (the lock protects the local tasks; this protects the rest);
 *   3. it is not one of the newest `keepLast` of its mode: evidence of a mode that
 *      runs rarely (a release, an upgrade rehearsal) outlives a busy nightly;
 *   4. it started more than `olderThanDays` ago.
 *
 * Defaults (`PRUNE_DEFAULTS`): 14 days and the newest 5 per mode. The
 * nightly A/A makes one noise directory a day, so a fortnight of them is what a
 * person looks back through to see a mask or a regression arrive; a run older
 * than that is in the noise store's history anyway (the status, not the
 * screenshots). Five per mode keeps the last few gate runs of a slow release
 * cycle even when they are older than the age.
 */

export const RECENT_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const PRUNE_DEFAULTS = {
  /** Removed only when older than this. 0: age is no reason to keep one. */
  olderThanDays: 14,
  /** Kept, per mode, whatever their age. 0: no run is kept for being one of the newest. */
  keepLast: 5,
  /** An image cache written longer ago than this is a fallback nobody refreshed: the nightly rewrites it daily. */
  imageCacheDays: 30
} as const;

/** `2026-09-01T02-00-00-noise`: the name `timestampDir` in src/run.ts makes (UTC), and the two other tasks that write to `out/`. */
const RUN_DIR = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-([a-z][a-z0-9-]*)$/;

export function parseRunDirName(name: string): { startedAt: Date; mode: string } | undefined {
  const m = RUN_DIR.exec(name);
  if (!m) return undefined;
  const startedAt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])));
  // Date.UTC rolls 2026-13-45 over into a real date: only a name that survives the round trip is a timestamp.
  const same = startedAt.toISOString().slice(0, 19).replace(/[:]/g, "-") === m[0]!.slice(0, 19);
  return same ? { startedAt, mode: m[7]! } : undefined;
}

export interface RunDirEntry {
  name: string;
  path: string;
  mode: string;
  startedAt: Date;
  /** When anything directly in it last changed (a run writes `a/`, `b/`, the report into it as it goes). */
  touchedAt: Date;
  bytes: number;
}

export type Verdict = { action: "remove" | "keep"; reason: string };

export interface PruneRules {
  olderThanDays: number;
  keepLast: number;
  now: Date;
  /** Run directory names never removed. */
  protectedNames: ReadonlySet<string>;
}

/** Pure: which of these run directories go, and why each one that stays does. */
export function planRunDirs(entries: RunDirEntry[], rules: PruneRules): (RunDirEntry & Verdict)[] {
  const newestFirst = [...entries].sort((x, y) => y.startedAt.getTime() - x.startedAt.getTime() || (x.name < y.name ? 1 : -1));
  const rank = new Map<string, number>();
  const seen = new Map<string, number>();
  for (const e of newestFirst) {
    const n = (seen.get(e.mode) ?? 0) + 1;
    seen.set(e.mode, n);
    rank.set(e.name, n);
  }
  return newestFirst.map((e) => {
    const verdict = ((): Verdict => {
      if (rules.protectedNames.has(e.name)) return { action: "keep", reason: "the newest release run that did not FAIL: what `harness local watch` compares production with" };
      if (rules.now.getTime() - Math.max(e.startedAt.getTime(), e.touchedAt.getTime()) < RECENT_MS) return { action: "keep", reason: "started or changed in the last 6 hours: it may be running" };
      if (rank.get(e.name)! <= rules.keepLast) return { action: "keep", reason: `one of the newest ${rules.keepLast} ${e.mode} runs` };
      const ageDays = (rules.now.getTime() - e.startedAt.getTime()) / DAY_MS;
      if (ageDays <= rules.olderThanDays) return { action: "keep", reason: `younger than ${rules.olderThanDays} days` };
      return { action: "remove", reason: `${Math.floor(ageDays)} days old, and not one of the newest ${rules.keepLast} ${e.mode} runs` };
    })();
    return { ...e, ...verdict };
  });
}

// ---- looking at the disk --------------------------------------------------------------------------

/** The size of a tree in bytes. Symbolic links count as themselves and are not followed; what cannot be read counts as 0. */
export function treeBytes(path: string): number {
  let total = 0;
  const pending = [path];
  while (pending.length) {
    const p = pending.pop()!;
    try {
      const st = lstatSync(p);
      total += st.size;
      if (st.isDirectory()) for (const name of readdirSync(p)) pending.push(join(p, name));
    } catch {
      // vanished or unreadable: it cannot be counted, and pruning will say if it cannot be removed
    }
  }
  return total;
}

/** The harness's run directories directly under `outRoot`. A symbolic link or a plain file with such a name is not one. */
export function listRunDirs(outRoot: string): RunDirEntry[] {
  if (!existsSync(outRoot)) return [];
  const entries: RunDirEntry[] = [];
  for (const name of readdirSync(outRoot)) {
    const parsed = parseRunDirName(name);
    if (!parsed) continue;
    const path = join(outRoot, name);
    try {
      const st = lstatSync(path);
      if (!st.isDirectory()) continue;
      let touched = st.mtimeMs;
      for (const child of readdirSync(path)) touched = Math.max(touched, lstatSync(join(path, child)).mtimeMs);
      entries.push({ name, path, mode: parsed.mode, startedAt: parsed.startedAt, touchedAt: new Date(touched), bytes: treeBytes(path) });
    } catch {
      continue;
    }
  }
  return entries;
}

export interface CacheEntry {
  dir: string;
  files: string[];
  bytes: number;
  savedAt: Date;
}

/** What the image cache directory holds, and when it was written (the manifest says; else the newest file's time). Undefined when it holds nothing. */
export function readImageCache(dir: string): CacheEntry | undefined {
  const files = [CACHE_TAR, CACHE_MANIFEST].filter((f) => existsSync(join(dir, f)));
  if (!files.length) return undefined;
  const stats = files.map((f) => lstatSync(join(dir, f)));
  const written = readManifest(dir)?.savedAt;
  const savedAt = written && !Number.isNaN(Date.parse(written)) ? new Date(written) : new Date(Math.max(...stats.map((s) => s.mtimeMs)));
  return { dir, files, bytes: stats.reduce((n, s) => n + s.size, 0), savedAt };
}

export function planImageCache(entry: CacheEntry | undefined, days: number, now: Date): (CacheEntry & Verdict) | undefined {
  if (!entry) return undefined;
  const ageDays = (now.getTime() - entry.savedAt.getTime()) / DAY_MS;
  return ageDays > days
    ? { ...entry, action: "remove", reason: `saved ${Math.floor(ageDays)} days ago, older than ${days} days` }
    : { ...entry, action: "keep", reason: `saved ${Math.floor(ageDays)} days ago, within ${days} days` };
}

// ---- doing it -------------------------------------------------------------------------------------

export interface Removal {
  what: string;
  path: string;
  bytes: number;
  freed: number;
  ok: boolean;
  problem?: string;
}

/** Remove a file or tree. On Windows a file another process holds open (a scanner, an editor, a still-running browser) fails with EBUSY or EPERM: retried a few times, then reported, never forced. */
export type Remover = (path: string) => void;

export const removeTree: Remover = (path) => rmSync(path, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

/**
 * Remove what the plan says, one at a time. A failure on one is recorded and the
 * others go on: what could not be removed stays exactly where it is (a partly
 * removed directory is measured again, so "freed" is what is really gone).
 */
export function removeAll(items: { what: string; path: string; bytes: number }[], remove: Remover = removeTree, measure: (path: string) => number = (p) => (existsSync(p) ? treeBytes(p) : 0)): Removal[] {
  return items.map((item) => {
    try {
      remove(item.path);
      const left = measure(item.path);
      return left === 0 && !existsSync(item.path) ? { ...item, freed: item.bytes, ok: true } : { ...item, freed: Math.max(0, item.bytes - left), ok: false, problem: "still there after removal" };
    } catch (e) {
      const left = measure(item.path);
      const code = (e as NodeJS.ErrnoException).code;
      return { ...item, freed: Math.max(0, item.bytes - left), ok: false, problem: `${code ?? "error"}: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}${code === "EBUSY" || code === "EPERM" || code === "EACCES" ? " (in use by another process?)" : ""}` };
    }
  });
}

export const human = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = -1;
  do {
    n /= 1024;
    i += 1;
  } while (n >= 1024 && i < units.length - 1);
  return `${n >= 100 ? n.toFixed(0) : n.toFixed(1)} ${units[i]}`;
};

export interface PruneResult {
  applied: boolean;
  outRoot: string;
  runs: (RunDirEntry & Verdict)[];
  cache: ((CacheEntry & Verdict) | undefined)[];
  removals: Removal[];
  /** Bytes that would go (dry run) or did go. */
  bytes: number;
  failed: number;
}

export interface PruneOptions {
  outRoot: string;
  imageCacheDirs: string[];
  olderThanDays: number;
  keepLast: number;
  imageCacheDays: number;
  now: Date;
  protectedNames: ReadonlySet<string>;
  /** False (the default of the command): decide and report, delete nothing. */
  apply: boolean;
  remove?: Remover;
}

export function prune(o: PruneOptions): PruneResult {
  const runs = planRunDirs(listRunDirs(o.outRoot), { olderThanDays: o.olderThanDays, keepLast: o.keepLast, now: o.now, protectedNames: o.protectedNames });
  const cache = [...new Set(o.imageCacheDirs)].map((dir) => planImageCache(readImageCache(dir), o.imageCacheDays, o.now));
  const doomed = [
    ...runs.filter((r) => r.action === "remove").map((r) => ({ what: r.name, path: r.path, bytes: r.bytes })),
    ...cache.flatMap((c) => (c && c.action === "remove" ? c.files.map((f) => ({ what: join(c.dir, f), path: join(c.dir, f), bytes: lstatSync(join(c.dir, f)).size })) : []))
  ];
  if (!o.apply) return { applied: false, outRoot: o.outRoot, runs, cache, removals: doomed.map((d) => ({ ...d, freed: d.bytes, ok: true })), bytes: doomed.reduce((n, d) => n + d.bytes, 0), failed: 0 };
  const removals = removeAll(doomed, o.remove);
  return { applied: true, outRoot: o.outRoot, runs, cache, removals, bytes: removals.reduce((n, r) => n + r.freed, 0), failed: removals.filter((r) => !r.ok).length };
}

export function renderPrune(r: PruneResult, o: { olderThanDays: number; keepLast: number; imageCacheDays: number }): string {
  const lines: string[] = [];
  lines.push(r.applied ? "harness prune" : "harness prune (a dry run: nothing is deleted; add --yes to delete)");
  lines.push(`  ${r.outRoot}: run directories older than ${o.olderThanDays} days that are not among the newest ${o.keepLast} of their mode`);
  const gone = new Map(r.removals.map((x) => [x.what, x]));
  const removing = r.runs.filter((x) => x.action === "remove");
  for (const x of removing) {
    const done = gone.get(x.name);
    const state = !r.applied ? "would remove" : done?.ok ? "removed" : "COULD NOT REMOVE";
    lines.push(`    ${state.padEnd(16)} ${x.name}  ${human(x.bytes)}  (${x.reason})`);
    if (done && !done.ok) lines.push(`      ${done.problem}`);
  }
  const kept = r.runs.filter((x) => x.action === "keep");
  if (!removing.length) lines.push("    nothing to remove");
  if (kept.length) {
    const group = (reason: string) => reason.replace(/^one of the newest \d+ .* runs$/, `one of the newest ${o.keepLast} of its mode`);
    const byReason = new Map<string, number>();
    for (const k of kept) byReason.set(group(k.reason), (byReason.get(group(k.reason)) ?? 0) + 1);
    lines.push(`    kept ${kept.length}: ${[...byReason].map(([why, n]) => `${n} ${why}`).join("; ")}`);
  }
  for (const c of r.cache) {
    if (!c) continue;
    const done = c.action === "remove" ? c.files.map((f) => gone.get(join(c.dir, f))) : [];
    const state = c.action === "keep" ? "kept" : !r.applied ? "would remove" : done.every((d) => d?.ok) ? "removed" : "COULD NOT REMOVE";
    lines.push(`  image cache ${c.dir}: ${state.padEnd(16)} ${c.files.join(", ")}  ${human(c.bytes)}  (${c.reason}; --image-cache-days ${o.imageCacheDays})`);
    for (const d of done) if (d && !d.ok) lines.push(`      ${d.problem}`);
  }
  const words = r.applied ? "freed" : "would free";
  lines.push(`  ${words} ${human(r.bytes)} in ${removing.length} run director${removing.length === 1 ? "y" : "ies"}${r.cache.some((c) => c?.action === "remove") ? " and the image cache" : ""}`);
  if (r.failed) lines.push(`  ${r.failed} item(s) could not be removed and were left as they were; close whatever holds them open and run it again`);
  return lines.join("\n");
}
