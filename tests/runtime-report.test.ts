import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { parseClaims } from "../src/claims/schema.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { Claim, Mode, RunReport, SideCapture } from "../src/types.ts";
import { STEADY, posture, runtimeCapture, sideWithRuntime, startupCapture } from "./support/runtime.ts";

const schema = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", "docs/contract/report.schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: true });
ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
const validate = ajv.compile(schema);

function run(mode: Mode, b: SideCapture, claims: Claim[] = []) {
  const dir = mkdtempSync(join(tmpdir(), "harness-runtime-"));
  const outcome = compareFromCaptures({ mode, substrate: "compose", captureDir: dir, a: sideWithRuntime("a"), b, claims, masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {}, noise: "skip" });
  return { dir, outcome, written: JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport };
}

describe("runtime artefacts in a whole run", () => {
  it("A/A in noise mode is clean with both artefacts collected, and the report still shows what was looked at", () => {
    const { written, dir } = run("noise", sideWithRuntime("b"));
    expect(validate.errors ?? []).toEqual([]);
    expect(validate(written)).toBe(true);
    expect(written.verdict).toBe("pass");
    expect(written.compare.hunks.map((h) => h.scope).sort()).toEqual(["runtime/summary", "startup/summary"]);
    expect(JSON.parse(readFileSync(join(dir, "noise-status.json"), "utf8"))).toMatchObject({ clean: true, hunks: 0 });
    expect(readFileSync(join(dir, readdirSync(dir).find((f) => f === "report.md")!), "utf8")).toContain("container posture collected for catalogue, live, reader");
  });

  it("a candidate that runs as root fails release mode with a report the schema accepts, and a claim on runtime/uid waives exactly that", () => {
    const rooted = sideWithRuntime("b", { runtime: runtimeCapture({ reader: posture({ effective: { ...posture().effective, uid: 0 } }) }) });
    const failed = run("release", rooted);
    expect(validate(failed.written)).toBe(true);
    expect(failed.written.verdict).toBe("fail");
    expect(failed.written.compare.unclaimed.map((h) => `${h.artefact} ${h.scope}`)).toEqual(["runtime reader/uid"]);

    const claims = parseClaims('claims:\n  - artefact: runtime\n    scope: "reader/uid"\n    reason: "Rule 0042: the reader image now runs as UID 0 for the migration window"\n');
    const claimed = run("release", rooted, claims);
    expect(claimed.written.verdict).toBe("pass");
    expect(claimed.written.compare.matches.find((m) => m.hunk.scope === "reader/uid")?.claim?.artefact).toBe("runtime");
  });

  it("a slow boot fails release mode as startup; the markdown names the artefact and the numbers", () => {
    const slow = sideWithRuntime("b", { startup: startupCapture({ reader: STEADY.map((s) => ({ ...s, rootMs: s.rootMs! * 2 })) }) });
    const { written, outcome } = run("release", slow);
    expect(written.verdict).toBe("fail");
    expect(written.compare.unclaimed.map((h) => `${h.artefact} ${h.scope}`)).toEqual(["startup reader/root"]);
    expect(readFileSync(outcome.files.md, "utf8")).toContain("median 1805 ms → 3610 ms");
  });

  it("an artefact that could not be collected shows in the PR comment as `not collected: <reason>` and gates until claimed", () => {
    const blind = sideWithRuntime("b", { runtime: { collected: false, reason: "kubectl is not installed or not on PATH" } });
    const { written, outcome } = run("release", blind);
    expect(written.verdict).toBe("fail");
    expect(readFileSync(outcome.files.md, "utf8")).toContain("not collected: kubectl is not installed or not on PATH (side b)");
  });

  it("post-deploy mode never asks for either artefact: the live side cannot be inspected", () => {
    const live = { ...sideWithRuntime("b"), external: true };
    const { written } = run("post-deploy", live);
    expect(written.compare.hunks.filter((h) => h.artefact === "runtime" || h.artefact === "startup")).toEqual([]);
  });
});
