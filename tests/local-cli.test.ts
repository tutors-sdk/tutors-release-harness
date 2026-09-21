/**
 * The new commands through the real CLI process, for what only the process can
 * show: exit codes, that usage errors are a message and exit 2 (not a stack trace),
 * and that `--dry-run` starts nothing. HARNESS_HOME points at a temp directory, so
 * nothing is written to the checkout. No Docker: doctor is covered on fake machines
 * in local-doctor.test.ts.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { bashCommand } from "../src/local/bash.ts";
import { UsageError, doctorCommand, guardCommand, localCommand, noiseCommand, overrideCommand, vulnDbCommand } from "../src/local/cli.ts";
import { appendOverride } from "../src/local/override-log.ts";

const ROOT = resolve(import.meta.dirname, "..");

function harness(args: string[], home = mkdtempSync(join(tmpdir(), "harness-cli-")), env: NodeJS.ProcessEnv = {}) {
  const r = spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, HARNESS_HOME: home, ...env } });
  return { code: r.status, out: r.stdout, err: r.stderr, home };
}

describe("harness local ... --dry-run", () => {
  it("prints every command of the task and exits 0, without a lock or a state directory; --port-offset shows in the environment", () => {
    const gate = harness(["local", "gate", "--dry-run", "--a", "16.2.0", "--b", "16.3.0-rc.1", "--port-offset", "1000"]);
    expect(gate.code).toBe(0);
    expect(gate.out).toContain("harness run --mode migration --a v16.2.0 --b v16.3.0-rc.1");
    expect(gate.out).toContain("READER_PORT_A=4100");
    expect(readdirSync(gate.home)).toEqual([]);
  });
});

describe("usage errors are a message and exit 2, not a stack trace", () => {
  it("through the process", () => {
    const r = harness(["local", "gate", "--dry-run"]);
    expect(r.code).toBe(2);
    expect(r.err).toMatch(/needs --a <production tag> and --b/);
    expect(r.err).not.toContain("    at ");
    const ref = harness(["guard", "masks", "--base", "no-such-ref-anywhere"]);
    expect(ref.code).toBe(2);
    expect(ref.out).toMatch(/not a commit/);
  });

  it("from the commands", async () => {
    await expect(localCommand("teleport", {})).rejects.toThrow(/local nightly\|gate\|mutants\|watch/);
    expect(() => noiseCommand("record", {})).toThrow(UsageError);
    expect(() => noiseCommand("bogus", {})).toThrow(/noise record\|status\|history/);
    expect(() => guardCommand("nothing", {})).toThrow(/guard masks\|engine\|all --base/);
    expect(() => overrideCommand("delete", {})).toThrow(/override list/);
    expect(() => overrideCommand("list", { since: "yesterday" })).toThrow(/ISO date/);
    await expect(doctorCommand({ for: "everything" })).rejects.toThrow(/--for takes/);
    expect(() => vulnDbCommand("refresh", {})).toThrow(/vuln-db update\|status/);
    expect(() => vulnDbCommand(undefined, {})).toThrow(UsageError);
  });

  it("vuln-db with no scanner on PATH says so and how to install it (through the process, an empty PATH, nothing fetched)", () => {
    const home = mkdtempSync(join(tmpdir(), "harness-cli-"));
    const r = harness(["vuln-db", "update"], home, { PATH: dirname(process.execPath) });
    expect(r.code).toBe(1);
    expect(r.out).toContain("grype is not installed");
    expect(r.out).toContain("v0.119.0");
    const status = harness(["vuln-db", "status"], home, { PATH: dirname(process.execPath) });
    expect(status.code).toBe(0);
    expect(status.out).toContain("NOT USABLE");
    expect(harness(["vuln-db", "status"], home, { PATH: dirname(process.execPath), HARNESS_REQUIRE_STATIC: "1" }).code).toBe(1);
    expect(harness(["vuln-db", "bogus"], home).code).toBe(2);
  });

  it("an interval that is not one is refused even in a dry run", async () => {
    await expect(localCommand("watch", { "dry-run": true, interval: "soon" })).rejects.toThrow(UsageError);
  });
});

describe("noise and override commands", () => {
  it("noise record, status and history through the process: a clean night licenses the gate, and the store lives under HARNESS_HOME/noise", () => {
    const home = mkdtempSync(join(tmpdir(), "harness-cli-"));
    const empty = harness(["noise", "status", "--require"], home);
    expect(empty.code).toBe(1);
    expect(empty.out).toContain("release runs will only warn");
    const run = mkdtempSync(join(tmpdir(), "harness-run-"));
    writeFileSync(join(run, "noise-status.json"), JSON.stringify({ schemaVersion: 1, ranAt: new Date().toISOString(), clean: true, hunks: 0 }));
    expect(harness(["noise", "record", "--status", run, "--tag", "main"], home).code).toBe(0);
    expect(JSON.parse(readFileSync(join(home, "noise", "noise-history.json"), "utf8")).entries).toHaveLength(1);
    const status = harness(["noise", "status", "--require", "--json"], home);
    expect(status.code).toBe(0);
    expect(JSON.parse(status.out)).toMatchObject({ licensesFail: true });
  });

  it("override list reads the log HARNESS_HOME points at and counts what was applied", () => {
    const home = mkdtempSync(join(tmpdir(), "harness-cli-"));
    appendOverride(join(home, "overrides.jsonl"), { at: "2026-09-01T09:00:00.000Z", by: "leigh", reason: "accepting the header change, ticket 42", mode: "release", verdict: "fail", a: "r:1", b: "r:2", harnessVersion: "1.2.0" });
    const r = harness(["override", "list", "--json"], home);
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out)).toMatchObject({ count: 1, chainIntact: true });
  });
});

describe("bash", () => {
  it("is `bash` unless HARNESS_BASH names one (WSL's launcher on a Windows PATH is the reason)", () => {
    expect(bashCommand({})).toBe("bash");
    expect(bashCommand({ HARNESS_BASH: "C:\\Program Files\\Git\\bin\\bash.exe" })).toBe("C:\\Program Files\\Git\\bin\\bash.exe");
    expect(bashCommand({ HARNESS_BASH: "  " })).toBe("bash");
  });
});

describe("harness local smoke", () => {
  it("--dry-run prints the four commands of the two-stacks smoke and starts nothing", () => {
    const r = harness(["local", "smoke", "--dry-run", "--tag", "16.2.0"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("harness local smoke: 4 step(s)");
    expect(r.out).toContain("harness images ensure --a 16.2.0 --b 16.2.0");
    expect(r.out).toContain("harness run --mode noise --a 16.2.0 --b 16.2.0 --set fixture --journey anonymous-student-reads-course");
    expect(r.out).toContain("b-bad");
    expect(readdirSync(r.home)).toEqual([]);
  });

  it("--only stacks|migration, and anything else is a usage error", () => {
    expect(harness(["local", "smoke", "--dry-run", "--only", "migration"]).out).toContain("2 step(s)");
    const bad = harness(["local", "smoke", "--dry-run", "--only", "all"]);
    expect(bad.code).toBe(2);
    expect(bad.err).toMatch(/--only takes stacks or migration/);
    expect(bad.err).not.toContain("    at ");
  });
});
