/**
 * A flag a command does not take, or one missing its value, used to print a Node stack trace
 * (`TypeError [ERR_PARSE_ARGS_UNKNOWN_OPTION]`). Claims and rules errors were already plain; this is the same for flags.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseArgsErrorText } from "../src/local/usage.ts";

const ROOT = resolve(import.meta.dirname, "..");
const harness = (args: string[]) => {
  const r = spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
};

describe("parseArgsErrorText", () => {
  it("names the flag and points at the command's usage, without Node's positional advice", () => {
    const error = Object.assign(new TypeError("Unknown option '--bogus'. To specify a positional argument starting with a '-', place it at the end of the command after '--', as in '-- \"--bogus\""), { code: "ERR_PARSE_ARGS_UNKNOWN_OPTION" });
    expect(parseArgsErrorText(error, ["run", "--bogus"])).toBe("harness: Unknown option '--bogus'.\nSee `harness help run` for the flags this command takes.");
  });

  it("a missing value is said the same way, and no command falls back to harness's own usage", () => {
    const error = Object.assign(new TypeError("Option '--a <value>' argument missing"), { code: "ERR_PARSE_ARGS_INVALID_OPTION_VALUE" });
    expect(parseArgsErrorText(error, ["--a"])).toBe("harness: Option '--a <value>' argument missing.\nSee `harness help` for the flags harness takes.");
  });

  it("any other error is left alone", () => {
    expect(parseArgsErrorText(new Error("boom"), ["run"])).toBeUndefined();
    expect(parseArgsErrorText(Object.assign(new Error("x"), { code: "ENOENT" }), ["run"])).toBeUndefined();
    expect(parseArgsErrorText(undefined, [])).toBeUndefined();
  });
});

describe("the CLI", () => {
  it("an unknown flag: one plain message, exit 2, no stack", () => {
    const r = harness(["run", "--bogus"]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("Unknown option '--bogus'");
    expect(r.err).toContain("harness help run");
    expect(r.err).not.toMatch(/\bat .*\(|ERR_PARSE_ARGS|node:internal|TypeError/);
    expect(r.out).toBe("");
  });

  it("a flag with no value: the same", () => {
    const r = harness(["run", "--mode"]);
    expect(r.code).toBe(2);
    expect(r.err).toMatch(/argument missing/);
    expect(r.err).not.toMatch(/\bat .*\(|ERR_PARSE_ARGS|node:internal|TypeError/);
  });

  it("the local commands too", () => {
    const r = harness(["local", "gate", "--nope"]);
    expect(r.code).toBe(2);
    expect(r.err).not.toMatch(/\bat .*\(|ERR_PARSE_ARGS|node:internal|TypeError/);
  });

  it("a valid command is untouched: --help still exits 0", () => {
    expect(harness(["run", "--help"]).code).toBe(0);
  });
});
