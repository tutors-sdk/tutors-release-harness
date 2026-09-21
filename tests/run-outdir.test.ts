/**
 * A run that cannot judge (exit 2: an image that is not there, or not verified) leaves no output directory behind.
 * It used to create out/<timestamp>-<mode>/ first, so every refused run left an empty one, and `harness local` took
 * the newest for a run. Through the real process; no Docker is needed for the refusal.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "..");

describe("run: the output directory is made when there is something to put in it", () => {
  it("an image that cannot be judged is exit 2 with no directory made", () => {
    const out = join(mkdtempSync(join(tmpdir(), "harness-outdir-")), "out");
    // A tag that no machine has: the images are looked up locally first, and refused before anything starts.
    const r = spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), "run", "--mode", "release", "--a", "0.0.0-no-such-a", "--b", "0.0.0-no-such-b", "--image-prefix", "harness-no-such-registry.invalid/{app}", "--noise", "none", "--out", out], {
      cwd: ROOT,
      encoding: "utf8"
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/cannot judge/);
    expect(r.stderr).not.toContain("    at ");
    // the root itself is not made either; if it were, it must be empty of run directories
    expect(existsSync(out) ? readdirSync(out) : []).toEqual([]);
  });
});
