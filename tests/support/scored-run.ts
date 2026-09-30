/**
 * A release run scored beside it, as main-preview.yml leaves one: report.json, report.md and report.html from the
 * harness's own renderers, changes.json from `harness changes` over the small monorepo of tests/support/changes-repo.ts,
 * and confidence.json from `harness confidence --run <dir> --change-risk <dir>/changes.json`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runChanges } from "../../src/changes/command.ts";
import { writeReports } from "../../src/report/index.ts";
import { scoreAndWrite } from "../../src/score/read.ts";
import type { Claim, Hunk, RunReport } from "../../src/types.ts";
import { changesRepo } from "./changes-repo.ts";

const side = (failed: number) => ({ requests: 600, failed, serverErrors: 0, p50: 1.2, p95: 2.1, rate: 20, duration: "30s" });

/** A release report shaped as the harness writes one: one diff under a broad claim, and `unclaimed` diffs no claim covers. */
export function releaseReport(o: { ranAt: string; unclaimed?: number; harness?: string }): RunReport {
  const broad: Claim = { artefact: "dom", scope: "**", reason: "PR #10 restyles every page", approvedBy: "ada" };
  const claimed: Hunk = { id: "dom:/course:1", artefact: "dom", scope: "/course", summary: "dom /course moved", severity: "fail" };
  const unclaimed: Hunk[] = Array.from({ length: o.unclaimed ?? 0 }, (_, i) => ({ id: `screenshot:/topic:${i + 2}`, artefact: "screenshot", scope: "/topic", summary: `screenshot /topic moved ${i}`, severity: "fail" }));
  const version = o.harness ?? "1.13.1";
  return {
    schemaVersion: 1,
    harness: { version, gitSha: null, contractVersion: version },
    harnessVersion: version,
    mode: "release",
    substrate: "compose",
    ranAt: o.ranAt,
    now: "2026-01-15T12:00:00Z",
    runs: 5,
    verdict: unclaimed.length ? "fail" : "pass",
    reasons: unclaimed.length ? [`${unclaimed.length} unclaimed diff(s)`] : ["no unclaimed differences"],
    sides: { a: { reader: "quay.io/tutors-sdk/tutors-reader:1.0.4", catalogue: "c", live: "l" }, b: { reader: "quay.io/tutors-sdk/tutors-reader:sha-3f1c2a9", catalogue: "c", live: "l" } },
    compare: { hunks: [claimed, ...unclaimed], matches: [{ hunk: claimed, claim: broad }, ...unclaimed.map((hunk) => ({ hunk }))], unclaimed, staleClaims: [], broadUnapproved: [] },
    noise: { ranAt: "2026-09-27T02:00:00.000Z", clean: true, hunks: 0 },
    masksApplied: { "a-mask": 4 },
    load: { a: side(0), b: side(0) }
  } as unknown as RunReport;
}

/**
 * `<root>/rehearsals/<mode>/<ranAt>-<mode>/` with report.json, report.md and report.html, as the publish job of
 * main-preview.yml downloads a rehearsal's artifact. An upgrade rehearsal carries its rollout under load.
 */
export function rehearsalRun(root: string, mode: "migration" | "upgrade", o: { ranAt: string; verdict?: "pass" | "fail" }): string {
  const dir = join(root, "rehearsals", mode, `${o.ranAt.replace(/[:.]/g, "-")}-${mode}`);
  mkdirSync(dir, { recursive: true });
  const verdict = o.verdict ?? "pass";
  const report = {
    schemaVersion: 1,
    harness: { version: "1.15.0", gitSha: null, contractVersion: "1.15.0" },
    harnessVersion: "1.15.0",
    mode,
    ranAt: o.ranAt,
    verdict,
    reasons: verdict === "fail" ? ["778 finding(s) during the rollout"] : ["no findings"],
    sides: { a: { reader: "1.0.4" }, b: { reader: "sha-3f1c2a9" } },
    compare: { hunks: [], matches: [], unclaimed: [], staleClaims: [], broadUnapproved: [] },
    ...(mode === "upgrade" ? { upgrade: { substrate: "compose", requests: 600, failed: 0, serverErrors: 0, byUpstream: {} } } : {})
  };
  writeFileSync(join(dir, "report.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(dir, "report.md"), `## ${mode} rehearsal: ${verdict.toUpperCase()}\n`);
  writeFileSync(join(dir, "report.html"), `<html><head></head><body><h2 id="${mode}">${mode}</h2></body></html>`);
  return dir;
}

/**
 * `<root>/out/<ranAt>-release/` with the report, changes.json and confidence.json, as the preview job leaves it. With
 * `rehearsals`, the score read them too, as the publish job's "Score the forecast" step does.
 */
export async function scoredRun(root: string, o: { ranAt: string; unclaimed?: number; rehearsals?: { migration?: string; upgrade?: string } }): Promise<string> {
  const dir = join(root, "out", `${o.ranAt.replace(/[:.]/g, "-")}-release`);
  mkdirSync(dir, { recursive: true });
  writeReports(dir, releaseReport(o));
  const changes = join(dir, "changes.json");
  await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: changesRepo(), history: 6, out: changes }, { env: {}, reviews: { approved: async (pr: number) => pr !== 11 } });
  scoreAndWrite({ outDir: dir, release: dir, ...o.rehearsals, changeRisk: changes, harness: { version: "1.13.1", contractVersion: "1.13.1" } });
  return dir;
}

/** A run kept by harness 1.4.11, before the score existed: report files only. */
export function unscoredRun(root: string, ranAt: string): string {
  const dir = join(root, "old", `${ranAt.replace(/[:.]/g, "-")}-release`);
  mkdirSync(dir, { recursive: true });
  writeReports(dir, releaseReport({ ranAt, unclaimed: 3, harness: "1.4.11" }));
  writeFileSync(join(dir, "note.txt"), "nothing else");
  return dir;
}
