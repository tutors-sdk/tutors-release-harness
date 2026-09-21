/**
 * `harness prune` on real temp directories: what it may delete, what it must not, that it is a dry run
 * unless told otherwise, that it steps aside for a run in progress, and that a file it cannot remove
 * is reported and left. No Docker, nothing outside the temp directories.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pruneCommand, UsageError } from "../src/local/cli.ts";
import { locksDir } from "../src/local/home.ts";
import { PRUNE_DEFAULTS, RECENT_MS, listRunDirs, parseRunDirName, planImageCache, planRunDirs, prune, readImageCache, treeBytes, type RunDirEntry } from "../src/local/prune.ts";

const ROOT = resolve(import.meta.dirname, "..");
const NOW = new Date("2026-09-21T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

const stamp = (daysAgo: number, hours = 0) => new Date(NOW.getTime() - daysAgo * DAY - hours * 3600_000).toISOString().replace(/[:.]/g, "-").slice(0, 19);

/** A run directory as `harness run` leaves one, dated by its name and by its files' times. */
function runDir(out: string, daysAgo: number, mode: string, opts: { hours?: number; bytes?: number; verdict?: string; recorded?: boolean } = {}): string {
  const name = `${stamp(daysAgo, opts.hours ?? 0)}-${mode}`;
  const dir = join(out, name);
  mkdirSync(join(dir, "b"), { recursive: true });
  writeFileSync(join(dir, "b", "shot.png"), Buffer.alloc(opts.bytes ?? 100));
  if (opts.verdict) writeFileSync(join(dir, "report.json"), JSON.stringify({ verdict: opts.verdict }));
  if (opts.recorded) writeFileSync(join(dir, "b", "capture.json"), "{}");
  const when = new Date(NOW.getTime() - daysAgo * DAY - (opts.hours ?? 0) * 3600_000);
  for (const p of [join(dir, "b", "shot.png"), join(dir, "b"), dir]) utimesSync(p, when, when);
  for (const f of ["report.json", join("b", "capture.json")]) if (existsSync(join(dir, f))) utimesSync(join(dir, f), when, when);
  return name;
}

const temp = () => mkdtempSync(join(tmpdir(), "harness-prune-"));
const list = (dir: string) => readdirSync(dir).sort();
const entry = (name: string, extra: Partial<RunDirEntry> = {}): RunDirEntry => {
  const parsed = parseRunDirName(name)!;
  return { name, path: `/out/${name}`, mode: parsed.mode, startedAt: parsed.startedAt, touchedAt: parsed.startedAt, bytes: 10, ...extra };
};

describe("which directories are the harness's", () => {
  it("only <UTC timestamp>-<mode>", () => {
    expect(parseRunDirName("2026-09-01T02-00-00-noise")).toEqual({ startedAt: new Date("2026-09-01T02:00:00.000Z"), mode: "noise" });
    expect(parseRunDirName("2026-09-01T02-00-00-post-deploy")?.mode).toBe("post-deploy");
    expect(parseRunDirName("2026-09-01T02-00-00-kind-rollout")?.mode).toBe("kind-rollout");
    for (const not of ["harness-ci", "2026-09-01T02-00-00", "2026-09-01-noise", "notes", "2026-13-45T99-00-00-noise", ".keep", "2026-09-01T02-00-00-"]) expect(parseRunDirName(not), not).toBeUndefined();
  });
});

describe("the plan", () => {
  const rules = { olderThanDays: 14, keepLast: 2, now: NOW, protectedNames: new Set<string>() };
  const verdicts = (names: string[], r = rules) => Object.fromEntries(planRunDirs(names.map((n) => entry(n)), r).map((e) => [e.name, e.action]));

  it("removes a run that is old AND beyond the newest K of its mode, and nothing else", () => {
    const noise = [1, 3, 20, 21, 30].map((d) => `${stamp(d)}-noise`);
    const v = verdicts(noise);
    expect(v[noise[0]!]).toBe("keep"); // young and newest
    expect(v[noise[1]!]).toBe("keep"); // young
    expect(v[noise[2]!]).toBe("remove"); // 20 days old, third newest
    expect(v[noise[3]!]).toBe("remove");
    expect(v[noise[4]!]).toBe("remove");
  });

  it("keeps the newest K of each mode however old: a rare mode outlives a busy one", () => {
    const names = [`${stamp(100)}-release`, `${stamp(90)}-release`, `${stamp(80)}-release`, `${stamp(100)}-noise`, `${stamp(90)}-noise`, `${stamp(80)}-noise`];
    const v = verdicts(names);
    expect(v[names[0]!]).toBe("remove");
    expect(v[names[1]!]).toBe("keep");
    expect(v[names[2]!]).toBe("keep");
    expect(v[names[3]!]).toBe("remove");
  });

  it("the two limits are independent: age 0 keeps only the newest K, keep 0 removes everything old", () => {
    const names = [1, 2, 4, 5].map((d) => `${stamp(d)}-noise`);
    expect(Object.values(verdicts(names, { ...rules, olderThanDays: 0, keepLast: 2 }))).toEqual(["keep", "keep", "remove", "remove"]);
    expect(Object.values(verdicts(names, { ...rules, olderThanDays: 3, keepLast: 0 }))).toEqual(["keep", "keep", "remove", "remove"]);
  });

  it("never removes the protected run or anything from the last six hours, whatever the flags", () => {
    const old = `${stamp(90)}-release`;
    const fresh = new Date(NOW.getTime() - RECENT_MS / 2).toISOString().replace(/[:.]/g, "-").slice(0, 19) + "-noise";
    const running = entry(`${stamp(60)}-upgrade`, { touchedAt: new Date(NOW.getTime() - 60_000) });
    const plan = planRunDirs([entry(old), entry(fresh), running, entry(`${stamp(60)}-migration`)], { olderThanDays: 0, keepLast: 0, now: NOW, protectedNames: new Set([old]) });
    const by = Object.fromEntries(plan.map((p) => [p.name, p]));
    expect(by[old]!.action).toBe("keep");
    expect(by[old]!.reason).toMatch(/watch/);
    expect(by[fresh]!.action).toBe("keep");
    expect(by[running.name]!.action).toBe("keep"); // old by name, but something wrote to it a minute ago
    expect(by[running.name]!.reason).toMatch(/6 hours/);
    expect(plan.find((p) => p.name.endsWith("-migration"))!.action).toBe("remove");
  });

  it("the defaults are 14 days, the newest 5 per mode, 30 days for the cache", () => {
    expect(PRUNE_DEFAULTS).toEqual({ olderThanDays: 14, keepLast: 5, imageCacheDays: 30 });
  });
});

describe("prune on disk", () => {
  const base = { olderThanDays: 14, keepLast: 1, imageCacheDays: 30, now: NOW, protectedNames: new Set<string>() };

  it("a dry run reports and frees what would go, and deletes nothing; --yes deletes exactly that", () => {
    const out = temp();
    const gone = [runDir(out, 40, "noise", { bytes: 1000 }), runDir(out, 30, "noise", { bytes: 2000 })];
    const kept = [runDir(out, 2, "noise"), runDir(out, 40, "release", { bytes: 500 })];
    writeFileSync(join(out, "notes.txt"), "not the harness's");
    mkdirSync(join(out, "harness-ci"));
    const before = list(out);
    const dry = prune({ ...base, outRoot: out, imageCacheDirs: [], apply: false });
    expect(dry.applied).toBe(false);
    expect(list(out)).toEqual(before);
    expect(dry.removals.map((r) => r.what).sort()).toEqual([...gone].sort());
    expect(dry.bytes).toBeGreaterThanOrEqual(3000);

    const done = prune({ ...base, outRoot: out, imageCacheDirs: [], apply: true });
    expect(done.failed).toBe(0);
    expect(done.bytes).toBe(dry.bytes);
    expect(list(out)).toEqual([...kept, "harness-ci", "notes.txt"].sort());
  });

  it("leaves a file or a link with a run directory's name alone", () => {
    const out = temp();
    writeFileSync(join(out, `${stamp(90)}-noise`), "a file");
    expect(listRunDirs(out)).toEqual([]);
    const other = temp();
    try {
      // a symbolic link to a directory elsewhere (needs a privilege on Windows: skipped there when refused)
      symlinkSync(other, join(out, `${stamp(80)}-noise`), "junction");
      expect(listRunDirs(out)).toEqual([]);
      prune({ ...base, keepLast: 0, outRoot: out, imageCacheDirs: [], apply: true });
      expect(existsSync(other)).toBe(true);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EPERM") throw e;
    }
  });

  it("an output root that does not exist is nothing to do", () => {
    const r = prune({ ...base, outRoot: join(temp(), "nope"), imageCacheDirs: [], apply: true });
    expect(r.removals).toEqual([]);
    expect(r.failed).toBe(0);
  });

  it("the image cache goes when the manifest says it was saved long ago, and only its two files", () => {
    const dir = temp();
    writeFileSync(join(dir, "images.tar"), Buffer.alloc(4000));
    writeFileSync(join(dir, "manifest.json"), JSON.stringify({ savedAt: new Date(NOW.getTime() - 45 * DAY).toISOString(), images: [] }));
    writeFileSync(join(dir, "mine.txt"), "someone else's");
    expect(readImageCache(dir)!.files).toEqual(["images.tar", "manifest.json"]);
    const dry = prune({ ...base, outRoot: temp(), imageCacheDirs: [dir], apply: false });
    expect(dry.cache[0]!.action).toBe("remove");
    expect(list(dir)).toEqual(["images.tar", "manifest.json", "mine.txt"]);
    const done = prune({ ...base, outRoot: temp(), imageCacheDirs: [dir], apply: true });
    expect(done.bytes).toBeGreaterThanOrEqual(4000);
    expect(list(dir)).toEqual(["mine.txt"]);
  });

  it("a recent cache stays; a cache with no manifest is dated by its file; none at all is fine", () => {
    const fresh = temp();
    writeFileSync(join(fresh, "images.tar"), "x");
    writeFileSync(join(fresh, "manifest.json"), JSON.stringify({ savedAt: new Date(NOW.getTime() - 3 * DAY).toISOString(), images: [] }));
    expect(planImageCache(readImageCache(fresh), 30, NOW)!.action).toBe("keep");
    const orphan = temp();
    writeFileSync(join(orphan, "images.tar"), "x");
    const old = new Date(NOW.getTime() - 60 * DAY);
    utimesSync(join(orphan, "images.tar"), old, old);
    expect(planImageCache(readImageCache(orphan), 30, NOW)!.action).toBe("remove");
    expect(readImageCache(temp())).toBeUndefined();
    expect(planImageCache(undefined, 30, NOW)).toBeUndefined();
  });

  it("a directory that cannot be removed (in use) is reported and left, and the others still go", () => {
    const out = temp();
    const busy = runDir(out, 60, "noise", { bytes: 300 });
    const free = runDir(out, 50, "release", { bytes: 300 });
    runDir(out, 1, "noise");
    runDir(out, 1, "release");
    const r = prune({
      ...base,
      keepLast: 1,
      outRoot: out,
      imageCacheDirs: [],
      apply: true,
      remove: (path) => {
        if (path.endsWith(busy)) throw Object.assign(new Error("EBUSY: resource busy or locked"), { code: "EBUSY" });
        // the real remover for the others
        rmSync(path, { recursive: true, force: true });
      }
    });
    expect(r.failed).toBe(1);
    expect(r.removals.find((x) => x.what === busy)).toMatchObject({ ok: false, freed: 0 });
    expect(r.removals.find((x) => x.what === busy)!.problem).toMatch(/EBUSY.*in use/);
    expect(existsSync(join(out, busy))).toBe(true);
    expect(existsSync(join(out, free))).toBe(false);
  });

  it("counts a tree's bytes without following links", () => {
    const dir = temp();
    mkdirSync(join(dir, "a"));
    writeFileSync(join(dir, "a", "f"), Buffer.alloc(1000));
    expect(treeBytes(dir)).toBeGreaterThanOrEqual(1000);
    expect(treeBytes(join(dir, "missing"))).toBe(0);
  });
});

describe("harness prune, the command", () => {
  const withHome = () => {
    const home = temp();
    for (const d of ["noise", "releases", "rollbacks"]) mkdirSync(join(home, d), { recursive: true });
    writeFileSync(join(home, "noise", "noise-history.json"), "{}");
    writeFileSync(join(home, "releases", "16.3.0.json"), "{}");
    writeFileSync(join(home, "overrides.jsonl"), "{}\n");
    writeFileSync(join(home, "image-provenance.json"), "{}");
    return home;
  };
  const collect = () => {
    const lines: string[] = [];
    return { lines, log: (m: string) => lines.push(m) };
  };

  it("is a dry run by default, and says so and how to delete", () => {
    const out = temp();
    const old = runDir(out, 60, "noise");
    runDir(out, 1, "noise");
    const { lines, log } = collect();
    expect(pruneCommand({ out, "keep-last": "1" }, { home: withHome(), now: NOW, log })).toBe(0);
    expect(existsSync(join(out, old))).toBe(true);
    expect(lines.join("\n")).toMatch(/a dry run.*--yes/);
    expect(lines.join("\n")).toMatch(new RegExp(`would remove\\s+${old}`));
    expect(lines.join("\n")).toMatch(/would free/);
  });

  it("--yes deletes and prints what it freed; HARNESS_HOME state is untouched even at its most aggressive", () => {
    const out = temp();
    const home = withHome();
    const old = runDir(out, 60, "noise", { bytes: 5000 });
    const before = list(home);
    const { lines, log } = collect();
    expect(pruneCommand({ out, yes: true, "older-than-days": "0", "keep-last": "0" }, { home, now: NOW, log })).toBe(0);
    expect(existsSync(join(out, old))).toBe(false);
    expect(lines.join("\n")).toMatch(/removed\s+/);
    expect(lines.join("\n")).toMatch(/freed \d/);
    expect(list(home).filter((n) => n !== "locks")).toEqual(before.filter((n) => n !== "locks"));
    for (const f of ["noise/noise-history.json", "releases/16.3.0.json", "overrides.jsonl", "image-provenance.json"]) expect(existsSync(join(home, f)), f).toBe(true);
    // the lock it held is released
    expect(existsSync(join(locksDir(home), "run.lock"))).toBe(false);
  });

  it("--dry-run beats --yes", () => {
    const out = temp();
    const old = runDir(out, 60, "noise");
    const { log } = collect();
    expect(pruneCommand({ out, yes: true, "dry-run": true, "keep-last": "0" }, { home: withHome(), now: NOW, log })).toBe(0);
    expect(existsSync(join(out, old))).toBe(true);
  });

  it("the newest release run that did not FAIL survives, even at its most aggressive: it is what the watch compares production with", () => {
    const out = temp();
    const failed = runDir(out, 50, "release", { verdict: "fail", recorded: true });
    const passed = runDir(out, 60, "release", { verdict: "pass", recorded: true });
    const older = runDir(out, 70, "release", { verdict: "pass", recorded: true });
    const { log } = collect();
    expect(pruneCommand({ out, yes: true, "older-than-days": "0", "keep-last": "0" }, { home: withHome(), now: NOW, log })).toBe(0);
    expect(list(out)).toEqual([passed]);
    expect([failed, older].some((n) => existsSync(join(out, n)))).toBe(false);
  });

  it("refuses to delete while a run or a watch holds its lock; a dry run says so and still lists", () => {
    for (const lock of ["run.lock", "watch.lock"]) {
      const out = temp();
      const home = withHome();
      const old = runDir(out, 60, "noise");
      mkdirSync(locksDir(home), { recursive: true });
      // this process is alive, so it is a live holder
      writeFileSync(join(locksDir(home), lock), JSON.stringify({ pid: process.pid, since: NOW.toISOString(), task: "harness local gate" }));
      const refused = collect();
      const errors: string[] = [];
      const orig = console.error;
      console.error = (m: string) => errors.push(m);
      try {
        expect(pruneCommand({ out, yes: true, "keep-last": "0" }, { home, now: NOW, log: refused.log })).toBe(2);
      } finally {
        console.error = orig;
      }
      expect(errors.join("\n")).toMatch(/not pruning: harness local gate is running/);
      expect(existsSync(join(out, old))).toBe(true);
      const dry = collect();
      expect(pruneCommand({ out, "keep-last": "0" }, { home, now: NOW, log: dry.log })).toBe(0);
      expect(dry.lines.join("\n")).toMatch(/a real prune would refuse/);
    }
  });

  it("a lock whose holder has gone is stale: it does not stop a prune", () => {
    const out = temp();
    const home = withHome();
    const old = runDir(out, 60, "noise");
    mkdirSync(locksDir(home), { recursive: true });
    writeFileSync(join(locksDir(home), "run.lock"), JSON.stringify({ pid: 2 ** 22 + 12345, since: NOW.toISOString(), task: "harness local gate" }));
    expect(pruneCommand({ out, yes: true, "keep-last": "0" }, { home, now: NOW, log: () => {} })).toBe(0);
    expect(existsSync(join(out, old))).toBe(false);
  });

  it("--json is the plan and the outcome, for scripts", () => {
    const out = temp();
    const old = runDir(out, 60, "noise");
    const { lines, log } = collect();
    pruneCommand({ out, json: true, "keep-last": "0" }, { home: withHome(), now: NOW, log });
    const parsed = JSON.parse(lines.join("\n"));
    expect(parsed).toMatchObject({ applied: false, failed: 0, running: null });
    expect(parsed.removals.map((r: { what: string }) => r.what)).toEqual([old]);
  });

  it("numbers that are not whole numbers are usage errors", () => {
    for (const bad of [{ "older-than-days": "soon" }, { "keep-last": "-1" }, { "image-cache-days": "1.5" }]) expect(() => pruneCommand({ out: temp(), ...bad }, { home: temp(), now: NOW, log: () => {} })).toThrow(UsageError);
  });

  it("through the process: dry run by default (exit 0, nothing removed), --yes removes, a bad number is exit 2", () => {
    const out = temp();
    const home = temp();
    const stale = `${new Date(Date.now() - 90 * DAY).toISOString().replace(/[:.]/g, "-").slice(0, 19)}-noise`;
    const staleDir = join(out, stale);
    mkdirSync(staleDir);
    writeFileSync(join(staleDir, "report.json"), "{}");
    const old = new Date(Date.now() - 90 * DAY);
    utimesSync(join(staleDir, "report.json"), old, old);
    utimesSync(staleDir, old, old);
    const harness = (args: string[]) => spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), "prune", "--out", out, "--keep-last", "0", ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, HARNESS_HOME: home } });
    const dry = harness([]);
    expect(dry.status).toBe(0);
    expect(dry.stdout).toContain("a dry run");
    expect(existsSync(staleDir)).toBe(true);
    const bad = harness(["--older-than-days", "soon"]);
    expect(bad.status).toBe(2);
    expect(bad.stderr).toMatch(/--older-than-days takes a whole number/);
    expect(bad.stderr).not.toContain("    at ");
    const yes = harness(["--yes"]);
    expect(yes.status).toBe(0);
    expect(existsSync(staleDir)).toBe(false);
  });
});
