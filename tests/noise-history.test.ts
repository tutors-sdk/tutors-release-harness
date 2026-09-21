import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { STREAK_TARGET, appendEntry, assess, countMasks, parseHistory, record, renderSummary, vet, type HistoryEntry, type NoiseHistory } from "../src/ci/noise-history.ts";

const HOUR = 3_600_000;
const T0 = Date.parse("2026-09-01T02:17:00.000Z");
const night = (n: number, hunks: number, degraded: string[] = []): HistoryEntry => ({ ranAt: new Date(T0 + n * 24 * HOUR).toISOString(), hunks, degraded });
const history = (...entries: HistoryEntry[]): NoiseHistory => entries.reduce<NoiseHistory>((h, e) => appendEntry(h, e), { schemaVersion: 1, entries: [] });

describe("the ratchet", () => {
  it("reaching 0 on verified evidence and then going above 0 is a regression", () => {
    const a = assess(history(night(0, 9), night(1, 4), night(2, 0), night(3, 2)))!;
    expect(a.regression).toBe(true);
    expect(a.floor).toBe(0);
    expect(a.streak).toBe(0);
  });

  it("before it has ever reached 0, going up is a warning (rising), not a regression", () => {
    const a = assess(history(night(0, 9), night(1, 4), night(2, 6)))!;
    expect(a.regression).toBe(false);
    expect(a.rising).toBe(true);
    expect(a.delta).toBe(2);
    expect(a.floor).toBe(4);
  });

  it("a night that stays at 0 keeps the ratchet and extends the streak", () => {
    const a = assess(history(night(0, 3), night(1, 0), night(2, 0), night(3, 0)))!;
    expect(a.regression).toBe(false);
    expect(a.streak).toBe(3);
  });

  it("seven consecutive clean verified nights meet the exit criterion, six do not", () => {
    const nights = (n: number) => history(...Array.from({ length: n }, (_, i) => night(i, 0)));
    expect(STREAK_TARGET).toBe(7);
    expect(assess(nights(6))!.exitCriterionMet).toBe(false);
    expect(assess(nights(7))!.exitCriterionMet).toBe(true);
  });

  it("a degraded night is not a clean night: it ends the streak, and is not a regression either", () => {
    const h = history(night(0, 0), night(1, 0), night(2, 0, ["side a did not run pulled+verified images (cached)"]), night(3, 0));
    expect(assess(h)!.streak).toBe(1);
    const dirtyDegraded = assess(history(night(0, 0), night(1, 5, ["side a cached"])))!;
    expect(dirtyDegraded.degraded).toBe(true);
    expect(dirtyDegraded.regression).toBe(false);
    expect(dirtyDegraded.floor).toBe(0);
  });

  it("a hunks:0 night on degraded evidence never sets the ratchet", () => {
    const a = assess(history(night(0, 0, ["local build"]), night(1, 3)))!;
    expect(a.floor).toBe(3);
    expect(a.regression).toBe(false);
  });

  it("a missing night (no result for more than 36 hours) breaks 'consecutive'", () => {
    const a = assess(history(night(0, 0), night(1, 0), night(4, 0), night(5, 0)))!;
    expect(a.streak).toBe(2);
  });

  it("is idempotent for a re-run of the same night, and bounded", () => {
    const h = appendEntry(history(night(0, 3)), { ...night(0, 1) });
    expect(h.entries).toHaveLength(1);
    expect(h.entries[0]!.hunks).toBe(1);
    const long = Array.from({ length: 450 }, (_, i) => night(i, 1));
    expect(history(...long).entries).toHaveLength(400);
  });

  it("tolerates a missing, empty or damaged history (tonight's status must still be published)", () => {
    expect(parseHistory(undefined).entries).toEqual([]);
    expect(parseHistory("").entries).toEqual([]);
    expect(parseHistory("{not json").entries).toEqual([]);
    expect(parseHistory('{"schemaVersion":2,"entries":[]}').entries).toEqual([]);
  });
});

describe("the summary", () => {
  it("leads with the count, the ratchet, the streak and the evidence", () => {
    const h = history(night(0, 4), night(1, 2));
    const md = renderSummary(h, assess(h)!, { tag: "16.2.0", masks: { total: 18, silent: 3 }, maxMasks: 40 });
    expect(md).toContain("## Nightly noise (A/A) — noisy");
    expect(md).toContain("**2** (-2 on the last verified night)");
    expect(md).toContain("clean streak | 0 of 7");
    expect(md).toContain("18 (review limit ~40); 3 silent tonight");
  });

  it("says DEGRADED and RATCHET BROKEN plainly, and flags a mask list over the limit", () => {
    const d = history(night(0, 0), night(1, 0, ["side a cached"]));
    expect(renderSummary(d, assess(d)!, { maxMasks: 40 })).toContain("## Nightly noise (A/A) — DEGRADED");
    const r = history(night(0, 0), night(1, 2));
    const md = renderSummary(r, assess(r)!, { masks: { total: 41, silent: 0 }, maxMasks: 40 });
    expect(md).toContain("RATCHET BROKEN");
    expect(md).toContain("over the limit");
  });
});

describe("countMasks", () => {
  it("counts the masks in the file and those that were silent in the report", () => {
    expect(countMasks("masks:\n  - id: a\n  - id: b\n  - id: c\n", { masksApplied: { a: 3, b: 0, c: 0 } })).toEqual({ total: 3, silent: 2 });
    expect(countMasks(undefined)).toBeUndefined();
  });
});

describe("record (the nightly's publish step)", () => {
  function setup(status: object, previous?: HistoryEntry[]) {
    const dir = mkdtempSync(join(tmpdir(), "harness-record-"));
    writeFileSync(join(dir, "status.json"), JSON.stringify(status));
    if (previous) writeFileSync(join(dir, "history.json"), JSON.stringify({ schemaVersion: 1, entries: previous }));
    writeFileSync(join(dir, "masks.yaml"), "masks:\n  - id: a\n  - id: b\n");
    return dir;
  }
  const args = (dir: string, extra: string[] = []) => ["--status", join(dir, "status.json"), "--history", join(dir, "history.json"), "--masks", join(dir, "masks.yaml"), "--out", join(dir, "out"), "--tag", "16.2.0", "--summary", join(dir, "summary.md"), ...extra];

  it("publishes the status byte for byte, extends the history, writes the summary, exits 0", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const status = { schemaVersion: 1, ranAt: "2026-09-16T02:17:00.000Z", clean: true, hunks: 0 };
    const dir = setup(status, [night(-1, 3)]);
    expect(record(args(dir))).toBe(0);
    expect(readFileSync(join(dir, "out", "noise-status.json"), "utf8")).toBe(JSON.stringify(status));
    const written = JSON.parse(readFileSync(join(dir, "out", "noise-history.json"), "utf8")) as NoiseHistory;
    expect(written.entries.map((e) => e.hunks)).toEqual([3, 0]);
    expect(written.entries[1]).toMatchObject({ tag: "16.2.0", masks: { total: 2, silent: 0 } });
    expect(readFileSync(join(dir, "summary.md"), "utf8")).toContain("Nightly noise (A/A)");
    log.mockRestore();
  });

  it("exits 1 when the ratchet is broken, and prints the annotation", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const dir = setup({ schemaVersion: 1, ranAt: "2026-09-16T02:17:00.000Z", clean: false, hunks: 2 }, [{ ranAt: "2026-09-15T02:17:00.000Z", hunks: 0, degraded: [] }]);
    expect(record(args(dir))).toBe(1);
    expect(log.mock.calls.flat().join("\n")).toContain("::error title=Noise ratchet broken");
    log.mockRestore();
  });

  it("records a degraded status as degraded and warns, exit 0", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const dir = setup({ schemaVersion: 1, ranAt: "2026-09-16T02:17:00.000Z", clean: true, hunks: 0, degraded: ["side a cached"] }, [{ ranAt: "2026-09-15T02:17:00.000Z", hunks: 0, degraded: [] }]);
    expect(record(args(dir))).toBe(0);
    expect(log.mock.calls.flat().join("\n")).toContain("::warning title=Noise A/A degraded");
    const written = JSON.parse(readFileSync(join(dir, "out", "noise-history.json"), "utf8")) as NoiseHistory;
    expect(written.entries.at(-1)!.degraded).toEqual(["side a cached"]);
    log.mockRestore();
  });

  it("refuses a status that is not a valid noise status", () => {
    const dir = setup({ clean: true });
    expect(() => record(args(dir))).toThrow(/not a valid noise status/);
  });
});

describe("vet (what release and post-deploy do with the fetched status)", () => {
  const now = new Date("2026-09-16T09:05:00.000Z");
  function run(text: string | undefined) {
    const dir = mkdtempSync(join(tmpdir(), "harness-vet-"));
    const file = join(dir, "noise-status.json");
    if (text !== undefined) writeFileSync(file, text);
    const out = join(dir, "output");
    writeFileSync(out, "");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    process.env.GITHUB_OUTPUT = out;
    try {
      const code = vet(["--status", file], now);
      return { code, output: readFileSync(out, "utf8"), logged: log.mock.calls.flat().join("\n"), file };
    } finally {
      delete process.env.GITHUB_OUTPUT;
      log.mockRestore();
    }
  }

  it("a missing or empty file passes nothing on and warns: the run degrades to WARN", () => {
    for (const text of [undefined, "", "  \n"]) {
      const r = run(text);
      expect(r.code).toBe(0);
      expect(r.output).toBe("");
      expect(r.logged).toContain("No noise status");
    }
  });

  it("a corrupt file or another contract major is dropped with a warning, not passed to the gate", () => {
    for (const text of ["{oops", '{"schemaVersion":2,"ranAt":"2026-09-16T02:00:00.000Z","clean":true,"hunks":0}', '{"clean":true}']) {
      const r = run(text);
      expect(r.output, text).toBe("");
      expect(r.logged, text).toContain("Unusable noise status");
    }
  });

  it("a fresh clean status is passed on and says FAIL is licensed", () => {
    const r = run('{"schemaVersion":1,"ranAt":"2026-09-15T02:17:00.000Z","clean":true,"hunks":0}');
    expect(r.output).toBe(`noise_file=${r.file}\n`);
    expect(r.logged).toContain("release runs may FAIL");
  });

  it("a stale, dirty or degraded status is still passed on (the gate states the reason) but the workflow warns", () => {
    const cases: [string, RegExp][] = [
      ['{"schemaVersion":1,"ranAt":"2026-09-01T02:17:00.000Z","clean":true,"hunks":0}', /older than 7/],
      ['{"schemaVersion":1,"ranAt":"2026-09-15T02:17:00.000Z","clean":false,"hunks":4}', /4 diff/],
      ['{"schemaVersion":1,"ranAt":"2026-09-15T02:17:00.000Z","clean":true,"hunks":0,"degraded":["side a cached"]}', /degraded/]
    ];
    for (const [text, why] of cases) {
      const r = run(text);
      expect(r.output).toContain("noise_file=");
      expect(r.logged).toContain("::warning title=Noise status does not license FAIL");
      expect(r.logged).toMatch(why);
    }
  });
});
