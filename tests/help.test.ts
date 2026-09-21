/**
 * `harness --help`, `-h`, `help` and `<command> --help`: usage on stdout, exit 0. `harness` alone is still exit 2.
 * The contract (docs/contract.md, "General options") lists --help; it used to be read as an unknown command.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { helpFor, usageFor } from "../src/local/usage.ts";

const ROOT = resolve(import.meta.dirname, "..");
const harness = (args: string[]) => {
  const r = spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
};

// What the CLI itself prints for --help (console.log adds one newline to the text).
const USAGE = harness(["--help"]).out.slice(0, -1);

describe("helpFor", () => {
  it("--help, -h and help are the whole usage, exit 0; nothing at all is the usage, exit 2", () => {
    for (const argv of [["--help"], ["-h"], ["help"], ["help", "--help"]]) expect(helpFor(argv, USAGE)).toEqual({ text: USAGE, code: 0 });
    expect(helpFor([], USAGE)).toEqual({ text: USAGE, code: 2 });
  });

  it("a command's own usage, by `help <command>` or `<command> --help`, wherever the flag stands", () => {
    for (const argv of [["run", "--help"], ["help", "run"], ["run", "--mode", "release", "-h"]]) {
      const h = helpFor(argv, USAGE)!;
      expect(h.code).toBe(0);
      expect(h.text).toContain("harness run --mode <mode>");
      expect(h.text).not.toContain("harness compare");
    }
    const local = helpFor(["local", "--help"], USAGE)!.text;
    for (const sub of ["nightly", "gate", "mutants", "watch"]) expect(local).toContain(`harness local ${sub}`);
    expect(helpFor(["noise", "--help"], USAGE)!.text).toContain("harness noise history");
  });

  it("a name that is not a command is refused, with the usage", () => {
    expect(helpFor(["bogus", "--help"], USAGE)).toMatchObject({ code: 2 });
    expect(helpFor(["help", "bogus"], USAGE)).toMatchObject({ code: 2 });
  });

  it("a command to run is left alone", () => {
    expect(helpFor(["journeys"], USAGE)).toBeUndefined();
    expect(helpFor(["run", "--mode", "noise"], USAGE)).toBeUndefined();
  });

  it("every command the CLI dispatches has usage of its own", () => {
    for (const c of ["run", "compare", "images", "stack", "kind", "mutants", "journeys", "version", "doctor", "noise", "guard", "override", "local"]) {
      expect(usageFor(c, USAGE), c).toContain(`harness ${c}`);
    }
  });
});

describe("through the process", () => {
  it("--help prints the usage and exits 0", () => {
    for (const args of [["--help"], ["-h"], ["help"]]) {
      const r = harness(args);
      expect(r.code).toBe(0);
      expect(r.out).toContain("harness run --mode");
      expect(r.err).toBe("");
    }
  });

  it("a command's --help exits 0 with that command's usage", () => {
    const r = harness(["guard", "--help"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("harness guard masks|engine|all");
    expect(r.out).not.toContain("harness run");
  });

  it("bare `harness` is exit 2 with the usage", () => {
    const r = harness([]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("harness run --mode");
  });
});
