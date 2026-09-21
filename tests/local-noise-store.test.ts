/**
 * The local noise store: the `noise` branch as a directory. What matters is that
 * the gate reads it by default and applies the same rule the workflows do (clean,
 * verified, at most 7 days old), through the real pipeline, and that the ratchet
 * survives the round trip through the files.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { exitCodeForReport } from "../src/override.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { NoiseStatus } from "../src/types.ts";
import { harnessHome, noiseDir } from "../src/local/home.ts";
import { HISTORY_FILE, STATUS_FILE, SUMMARY_FILE, defaultNoise, describeStatus, noiseHistoryCommand, noiseStatusCommand, readStatus, recordNight, statusFileOf } from "../src/local/noise-store.ts";
import { capture, clone } from "./support/captures.ts";

const day = 86_400_000;
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-${name}-`));
const quiet = () => vi.spyOn(console, "log").mockImplementation(() => undefined);

/** A noise run directory as `harness run --mode noise` leaves it: noise-status.json and report.json. */
function noiseRun(status: Partial<NoiseStatus> & { ranAt: string }, extra: object = {}): string {
  const dir = tmp("noise-run");
  writeFileSync(join(dir, STATUS_FILE), JSON.stringify({ schemaVersion: 1, clean: true, hunks: 0, ...status }));
  writeFileSync(join(dir, "report.json"), JSON.stringify({ harness: { version: "1.3.0" }, masksApplied: { "some-mask": 4 }, ...extra }));
  return dir;
}

const ago = (days: number) => new Date(Date.now() - days * day).toISOString();

/** Release mode on a planted change, with the noise argument the CLI would derive from a store at `home`. */
function releaseWith(home: string) {
  const logs: string[] = [];
  const noise = defaultNoise("release", undefined, (m) => logs.push(m), home);
  const b = clone(capture("b"));
  delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
  const outcome = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: tmp("gate"), a: capture("a"), b, claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {}, ...(noise ? { noise } : {}) });
  return { report: outcome.report, exit: exitCodeForReport(outcome.report), logs };
}

describe("the gate reads the local store by default, and applies the 7-day / clean / verified rule", () => {
  const record = (home: string, status: Partial<NoiseStatus> & { ranAt: string }) => {
    const log = quiet();
    recordNight({ status: noiseRun(status), store: noiseDir(home), tag: "16.2.0" });
    log.mockRestore();
  };

  it("no store yet: WARN, exit 0, and it says where it looked", () => {
    const { report, exit, logs } = releaseWith(tmp("home"));
    expect(report.verdict).toBe("warn");
    expect(report.reasons[0]).toMatch(/^advisory only: no A\/A/);
    expect(exit).toBe(0);
    expect(logs.join("\n")).toContain("no local noise status");
  });

  it("a clean, verified A/A recorded yesterday licenses a FAIL: exit 1", () => {
    const home = tmp("home");
    record(home, { ranAt: ago(1) });
    const { report, exit } = releaseWith(home);
    expect(report.verdict).toBe("fail");
    expect(exit).toBe(1);
    expect(report.noise?.clean).toBe(true);
  });

  const weak: [string, Partial<NoiseStatus>, RegExp][] = [
    ["dirty (3 diffs)", { clean: false, hunks: 3 }, /3 diff/],
    ["degraded (a cache, a local build)", { degraded: ["side a did not run pulled+verified images (cached)"] }, /degraded and does not count/]
  ];
  for (const [name, status, why] of weak) {
    it(`a ${name} status only warns`, () => {
      const home = tmp("home");
      record(home, { ranAt: ago(1), ...status });
      const { report, exit } = releaseWith(home);
      expect(report.verdict).toBe("warn");
      expect(report.reasons[0]).toMatch(why);
      expect(exit).toBe(0);
    });
  }

  it("a clean status eight days old only warns; the same status at six days licenses a FAIL", () => {
    const stale = tmp("home");
    record(stale, { ranAt: ago(8) });
    expect(releaseWith(stale).report.reasons[0]).toMatch(/older than 7 day/);
    const fresh = tmp("home");
    record(fresh, { ranAt: ago(6) });
    expect(releaseWith(fresh).report.verdict).toBe("fail");
  });

  it("the latest night wins, clean or not: a dirty night after a clean one takes the licence away", () => {
    const home = tmp("home");
    record(home, { ranAt: ago(2) });
    record(home, { ranAt: ago(1), clean: false, hunks: 2 });
    expect(releaseWith(home).report.verdict).toBe("warn");
  });

  it("an unusable file in the store is ignored with a warning, never read generously", () => {
    const home = tmp("home");
    mkdirSync(noiseDir(home), { recursive: true });
    writeFileSync(join(noiseDir(home), STATUS_FILE), '{"clean": true}');
    const { report, logs } = releaseWith(home);
    expect(report.verdict).toBe("warn");
    expect(logs.join("\n")).toContain("unusable");
  });

  it("--noise is honoured as given: a path or `skip` wins over the store, `none` does not look, other modes never read it", () => {
    const home = tmp("home");
    record(home, { ranAt: ago(1) });
    expect(defaultNoise("release", "skip", () => {}, home)).toBe("skip");
    expect(defaultNoise("release", "/somewhere/else", () => {}, home)).toBe("/somewhere/else");
    expect(defaultNoise("release", "none", () => {}, home)).toBeUndefined();
    expect(defaultNoise("noise", undefined, () => {}, home)).toBeUndefined();
    expect(defaultNoise("migration", undefined, () => {}, home)).toBeUndefined();
    expect(defaultNoise("post-deploy", undefined, () => {}, home)).toBe(join(noiseDir(home), STATUS_FILE));
  });
});

describe("where a release run looks for a status: --noise, then the HARNESS_HOME store, then none (docs/contract.md)", () => {
  /** Release mode over a planted change, given the `--noise` a person typed (undefined: omitted) and a store in `home`. */
  function release(explicit: string | undefined, home: string) {
    const log = quiet();
    try {
      const noise = defaultNoise("release", explicit, () => {}, home);
      const b = clone(capture("b"));
      delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
      const outcome = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: tmp("order"), a: capture("a"), b, claims: [], masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {}, ...(noise ? { noise } : {}) });
      return { verdict: outcome.report.verdict, noise: outcome.report.noise };
    } finally {
      log.mockRestore();
    }
  }
  const status = (s: Partial<NoiseStatus> & { ranAt: string }) => {
    const dir = tmp("explicit");
    writeFileSync(join(dir, STATUS_FILE), JSON.stringify({ schemaVersion: 1, clean: true, hunks: 0, ...s }));
    return dir;
  };
  const cleanStore = () => {
    const home = tmp("home");
    const log = quiet();
    recordNight({ status: noiseRun({ ranAt: ago(1) }), store: noiseDir(home) });
    log.mockRestore();
    return home;
  };

  it("A/A: with the same clean status in both places, omitting --noise and passing it give the same verdict", () => {
    const home = cleanStore();
    expect(release(undefined, home).verdict).toBe("fail");
    expect(release(noiseDir(home), home).verdict).toBe("fail");
  });

  it("planted: an explicit --noise that is dirty wins over a clean store (the store is not a fallback for a bad file), and the reverse", () => {
    const home = cleanStore();
    const dirty = status({ ranAt: ago(1), clean: false, hunks: 3 });
    const viaFlag = release(dirty, home);
    expect(viaFlag.verdict).toBe("warn");
    expect(viaFlag.noise).toMatchObject({ clean: false, hunks: 3 });
    // and a clean explicit status licenses a FAIL although the store holds a dirty one
    const dirtyHome = tmp("home");
    const log = quiet();
    recordNight({ status: noiseRun({ ranAt: ago(1), clean: false, hunks: 2 }), store: noiseDir(dirtyHome) });
    log.mockRestore();
    expect(release(undefined, dirtyHome).verdict).toBe("warn");
    expect(release(status({ ranAt: ago(1) }), dirtyHome).verdict).toBe("fail");
  });

  it("planted: an explicit path that does not exist is exit 2 material (a thrown error), never a quiet fall back to the store", () => {
    const home = cleanStore();
    expect(() => release(join(tmp("nowhere"), "noise-status.json"), home)).toThrow(/ENOENT/);
  });

  it("must not flag: --noise none ignores a clean store (WARN), --noise skip waives (FAIL, no status in the report), and an empty store warns", () => {
    const home = cleanStore();
    expect(release("none", home)).toEqual({ verdict: "warn", noise: undefined });
    expect(release("skip", home)).toEqual({ verdict: "fail", noise: undefined });
    expect(release(undefined, tmp("empty-home"))).toEqual({ verdict: "warn", noise: undefined });
  });

  it("HARNESS_HOME is what says where the store is, and the default is `<checkout>/.harness`", () => {
    const home = cleanStore();
    const before = process.env.HARNESS_HOME;
    process.env.HARNESS_HOME = home;
    try {
      expect(defaultNoise("release", undefined, () => {})).toBe(join(noiseDir(home), STATUS_FILE));
      expect(noiseDir()).toBe(join(home, "noise"));
    } finally {
      if (before === undefined) delete process.env.HARNESS_HOME;
      else process.env.HARNESS_HOME = before;
    }
    delete process.env.HARNESS_HOME;
    expect(harnessHome().replaceAll("\\", "/")).toMatch(/\/\.harness$/);
    if (before !== undefined) process.env.HARNESS_HOME = before;
  });
});

describe("noise record: the same three files the noise branch holds", () => {
  it("copies the status byte for byte, extends the history, writes the summary; the run directory's report is picked up", () => {
    const log = quiet();
    const store = tmp("store");
    const dir = noiseRun({ ranAt: "2026-09-16T02:17:00.000Z" });
    expect(recordNight({ status: dir, store, tag: "16.2.0" })).toBe(0);
    expect(readFileSync(join(store, STATUS_FILE), "utf8")).toBe(readFileSync(join(dir, STATUS_FILE), "utf8"));
    const history = JSON.parse(readFileSync(join(store, HISTORY_FILE), "utf8")) as { entries: { hunks: number; tag: string; harnessVersion: string }[] };
    expect(history.entries).toHaveLength(1);
    expect(history.entries[0]).toMatchObject({ tag: "16.2.0", hunks: 0, harnessVersion: "1.3.0" });
    expect(readFileSync(join(store, SUMMARY_FILE), "utf8")).toContain("Nightly noise (A/A) — clean");
    log.mockRestore();
  });

  it("keeps the ratchet across nights: 0 then not 0 exits 1, and the store says so", () => {
    const log = quiet();
    const store = tmp("store");
    expect(recordNight({ status: noiseRun({ ranAt: "2026-09-15T02:17:00.000Z" }), store })).toBe(0);
    expect(recordNight({ status: noiseRun({ ranAt: "2026-09-16T02:17:00.000Z", clean: false, hunks: 2 }), store })).toBe(1);
    // the broken night is still the latest status, so the gate stops licensing FAIL at once
    expect(readStatus(store).status?.hunks).toBe(2);
    log.mockRestore();
    const lines: string[] = [];
    noiseHistoryCommand({ store, json: false, last: 14, out: (l) => lines.push(l) });
    expect(lines.join("\n")).toContain("RATCHET BROKEN");
  });

  it("a status that is not there is an error that says how to make one", () => {
    expect(() => recordNight({ status: join(tmp("empty"), "nothing"), store: tmp("store") })).toThrow(/harness run --mode noise/);
  });

  it("a status given as a file works too (what the workflows do)", () => {
    const log = quiet();
    const dir = noiseRun({ ranAt: "2026-09-16T02:17:00.000Z" });
    const store = tmp("store");
    expect(recordNight({ status: join(dir, STATUS_FILE), report: join(dir, "report.json"), store })).toBe(0);
    log.mockRestore();
  });
});

describe("noise status", () => {
  const store = (status: Partial<NoiseStatus> & { ranAt: string }) => {
    const dir = tmp("store");
    writeFileSync(join(dir, STATUS_FILE), JSON.stringify({ schemaVersion: 1, clean: true, hunks: 0, ...status }));
    return dir;
  };
  const now = new Date();

  it("says the gate has the right to FAIL, or why it has not, with the gate's own wording", () => {
    expect(describeStatus(store({ ranAt: ago(1) }), now, 7)).toMatchObject({ licensesFail: true, usable: true });
    expect(describeStatus(store({ ranAt: ago(9) }), now, 7).why).toMatch(/older than 7 day/);
    expect(describeStatus(store({ ranAt: ago(1), degraded: ["cached"] }), now, 7).why).toMatch(/degraded/);
    expect(describeStatus(tmp("nothing"), now, 7)).toMatchObject({ present: false, licensesFail: false });
  });

  it("exits 0 (informational) unless --require, and hands a usable file to GITHUB_OUTPUT", () => {
    const dir = store({ ranAt: ago(9) });
    const out: string[] = [];
    const ghOutput = join(tmp("gh"), "output");
    expect(noiseStatusCommand({ store: dir, maxAgeDays: 7, json: false, require: false, out: (l) => out.push(l), env: { GITHUB_OUTPUT: ghOutput, GITHUB_ACTIONS: "true" } })).toBe(0);
    expect(out[0]).toContain("::warning title=Noise status does not license FAIL::");
    expect(readFileSync(ghOutput, "utf8")).toBe(`noise_file=${join(dir, STATUS_FILE)}\n`);
    expect(noiseStatusCommand({ store: dir, maxAgeDays: 7, json: false, require: true, out: () => {}, env: {} })).toBe(1);
    expect(noiseStatusCommand({ store: store({ ranAt: ago(1) }), maxAgeDays: 7, json: false, require: true, out: () => {}, env: {} })).toBe(0);
  });

  it("does not hand an unusable or missing file to --noise", () => {
    const ghOutput = join(tmp("gh"), "output");
    noiseStatusCommand({ store: tmp("nothing"), maxAgeDays: 7, json: false, require: false, out: () => {}, env: { GITHUB_OUTPUT: ghOutput } });
    const bad = tmp("bad");
    writeFileSync(join(bad, STATUS_FILE), "{not json");
    noiseStatusCommand({ store: bad, maxAgeDays: 7, json: false, require: false, out: () => {}, env: { GITHUB_OUTPUT: ghOutput } });
    expect(() => readFileSync(ghOutput, "utf8")).toThrow();
  });

  it("--json prints the same facts", () => {
    const out: string[] = [];
    noiseStatusCommand({ store: store({ ranAt: ago(1) }), maxAgeDays: 7, json: true, require: false, out: (l) => out.push(l), env: {} });
    expect(JSON.parse(out[0]!)).toMatchObject({ present: true, usable: true, licensesFail: true });
  });

  it("history on an empty store says nothing is recorded, on a used one prints the streak", () => {
    const lines: string[] = [];
    noiseHistoryCommand({ store: tmp("nothing"), json: false, last: 14, out: (l) => lines.push(l) });
    expect(lines[0]).toContain("nothing recorded yet");
    const log = quiet();
    const s = tmp("store");
    recordNight({ status: noiseRun({ ranAt: "2026-09-16T02:17:00.000Z" }), store: s });
    log.mockRestore();
    const json: string[] = [];
    noiseHistoryCommand({ store: s, json: true, last: 14, out: (l) => json.push(l) });
    expect(JSON.parse(json[0]!).assessment).toMatchObject({ streak: 1, floor: 0 });
  });
});

describe("paths", () => {
  it("a directory that does not exist yet is a store, a name ending .json is a file", () => {
    expect(statusFileOf(join(tmp("x"), "noise"))).toMatch(/noise[\\/]noise-status\.json$/);
    expect(statusFileOf("some/where/status.json")).toMatch(/status\.json$/);
  });
});
