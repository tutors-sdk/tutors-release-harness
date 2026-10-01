import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { run, type RunOptions } from "./run.ts";
import { imagesFor, specFor } from "./image-ref.ts";
import { realExec } from "./images.ts";
import { osTempFiles } from "./image-static/command.ts";
import { DEFAULT_ALT_BASE, MUTANT_KINDS, buildMutantImage } from "./mutant-build.ts";
import { ROOT } from "./stack.ts";
import { ARTEFACTS, type Hunk } from "./types.ts";
import { HARNESS_VERSION } from "./version.ts";
import { MUTANTS_SUMMARY } from "./scoreboard/line.ts";

const MutantsFileSchema = z.object({
  mutants: z.array(
    z.object({
      name: z.string().regex(/^[a-z0-9-]+$/),
      plants: z.string().min(1),
      expect: z.array(z.enum(ARTEFACTS)).min(1),
      runs: z.number().int().min(1).optional(),
      kind: z.enum(MUTANT_KINDS).default("edge")
    })
  )
});

export function loadMutants(path = resolve(ROOT, "mutants", "mutants.yaml")) {
  const parsed = MutantsFileSchema.safeParse(parse(readFileSync(path, "utf8")));
  if (!parsed.success) throw new Error(`${path}: ${parsed.error.message}`);
  return parsed.data.mutants;
}

export function mutantImage(name: string): string {
  return `tutors-harness/mutant-${name}:latest`;
}

function buildMutant(mutant: { name: string; kind: (typeof MUTANT_KINDS)[number] }, base: string, log: (m: string) => void) {
  const image = mutantImage(mutant.name);
  log(`building ${image} from ${base} (${mutant.kind})`);
  return buildMutantImage(mutant, base, image, { exec: realExec, files: osTempFiles(), mutantsDir: join(ROOT, "mutants"), altBase: process.env.HARNESS_MUTANT_ALT_BASE || DEFAULT_ALT_BASE, log });
}

/** The most non-info hunks of an unclean A/A the log carries; the rest is in the report. */
export const NOISE_HUNK_LOG_CAP = 40;

/**
 * The log lines that say WHICH differences made an A/A unclean: severity, artefact, scope and summary of every non-info hunk (the
 * columns of report.md's unclaimed table), capped, then a count of the info hunks. The report lives on the runner that produced it;
 * without these lines a CI log says only "N diff(s)" and nobody can tell what failed.
 */
export function describeNoiseHunks(hunks: Hunk[], cap = NOISE_HUNK_LOG_CAP): string[] {
  const failing = hunks.filter((h) => h.severity !== "info");
  const info = hunks.length - failing.length;
  const lines = failing.slice(0, cap).map((h) => `  ${h.severity.padEnd(4)} ${h.artefact.padEnd(14)} ${h.scope}: ${h.summary.replace(/\s+/g, " ").trim()}`);
  if (failing.length > cap) lines.push(`  ... and ${failing.length - cap} more`);
  if (!failing.length) lines.push("  (no non-info hunk: the A/A did not pass for another reason, see the report)");
  lines.push(`  ${info} info hunk(s) not listed`);
  return lines;
}


/** The self-test's result in one small file, `<out>/mutants.json`: what the scoreboard records as the week's mutants caught (since 1.11.0). */
export interface MutantsSummary {
  schemaVersion: 1;
  ranAt: string;
  base: string;
  /** Caught AND attributed: the self-test's own pass rule. null when the A/A on the base was not clean and no mutant ran. */
  caught: number | null;
  total: number;
  escaped: string[];
  /** Since 1.25.0: every mutant this self-test planted, by name, so a reader can tell which were part of it. */
  planted?: string[];
  /** Since 1.25.0: the mutants caught only by an informing check (a policy check before 2.0): a finding the base did not have. */
  byInforming?: string[];
  harnessVersion: string;
  note?: string;
}

/** Written whatever happened, so a self-test that could not run is on record as that, not as missing. */
export function writeMutantsSummary(outDir: string, s: Omit<MutantsSummary, "schemaVersion" | "harnessVersion">): void {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, MUTANTS_SUMMARY), `${JSON.stringify({ schemaVersion: 1, ...s, harnessVersion: HARNESS_VERSION }, null, 2)}\n`);
}

/** `artefact` and `scope` of every informing finding in a run's hunks: what an informing check would have failed. */
export function informingKeys(hunks: readonly Hunk[]): Set<string> {
  return new Set(hunks.filter((h) => h.level === "informing").map((h) => `${h.artefact}\u0000${h.scope}`));
}

/**
 * Was a mutant caught, and attributed to the artefact it plants a fault in? A blocking engine catches a mutant the way it
 * always has: the verdict is FAIL and an unclaimed hunk is of an expected artefact. An informing check (since 1.21.0;
 * the policy family until 2.0) can never FAIL a run, so it catches a mutant when it reports a finding (`level:
 * "informing"`) of an expected artefact whose scope it did not report on the base in the self-test's own A/A: a
 * finding the planted fault made, not one production already has. The day the check becomes blocking, the same
 * mutant must FAIL the run like any other.
 */
export function judgeMutant(mutant: { expect: readonly string[] }, verdict: string, unclaimed: readonly Hunk[], hunks: readonly Hunk[], baseInforming: ReadonlySet<string>): { caught: boolean; attributed: boolean; byInforming: boolean; artefacts: string[] } {
  const blocking: string[] = [...new Set(unclaimed.map((h) => h.artefact))];
  const informing: string[] = [...new Set(hunks.filter((h) => h.level === "informing" && !baseInforming.has(`${h.artefact}\u0000${h.scope}`)).map((h) => h.artefact))].filter((a) => !blocking.includes(a));
  const byBlocking = mutant.expect.some((a) => blocking.includes(a));
  const byInforming = mutant.expect.some((a) => informing.includes(a));
  return {
    caught: verdict === "fail" || byInforming,
    attributed: byBlocking || byInforming,
    byInforming: byInforming && !(verdict === "fail" && byBlocking),
    artefacts: [...blocking, ...informing.map((a) => `${a} (informing)`)]
  };
}

export interface MutantsOptions extends Omit<RunOptions, "mode" | "a" | "b"> {
  base: string;
}

/**
 * The harness's own signal. Mutants are built FROM the base reader image —
 * with a registry prefix, the pulled and signature-verified production image
 * (`images ensure` first; `run` refuses an unverified one) — so a mutant is
 * production plus exactly one planted fault. The mutant itself is a local
 * build and is recorded as such.
 * Noise mode on the base first (a harness whose A/A
 * is not clean cannot fail anything), then release mode against each mutant,
 * asserting FAIL and the expected artefact.
 */
export async function runMutants(options: MutantsOptions): Promise<boolean> {
  // R5: startup time restarts every app N times per side. The self-test would pay that on every one of its runs (A/A plus one per mutant) for no signal (no
  // mutant plants a slow boot); nightly noise and real release runs sample it. Posture is cheap and stays on.
  const opts: MutantsOptions = { ...options, startupRestarts: 0 };
  const mutants = loadMutants();
  const baseImages = imagesFor(opts.base, opts.imagePrefix);
  const baseSpec = specFor(baseImages);
  const ranAt = new Date().toISOString();

  // The fixture and signed-in journeys are enough to catch every mutant, and
  // they need nothing outside this stack.
  const sets = opts.sets.filter((s) => s !== "reference");
  opts.log(`self-test: A/A on ${baseImages.reader} first`);
  // A mutant is a local build with no attestation, and the base is a pulled image with one: the SBOMs are generated locally
  // on both sides so they are comparable, and so the added-package mutant can be seen at all.
  const staticOpts = { ...opts.static, sbomSource: "generate" as const };
  const noise = await run({ ...opts, static: staticOpts, sets, mode: "noise", a: baseSpec, b: baseSpec, runs: 1 });
  const noiseStatus = join(noise.outDir, "noise-status.json");
  if (noise.report.verdict !== "pass") {
    for (const reason of noise.report.reasons) opts.log(`  reason: ${reason}`);
    for (const line of describeNoiseHunks(noise.report.compare.hunks)) opts.log(line);
    opts.log(`A/A is not clean (${noise.report.compare.hunks.length} diff(s)); the mutant self-test cannot be trusted. Report: ${noise.files.html}`);
    writeMutantsSummary(opts.outDir, { ranAt, base: opts.base, caught: null, total: mutants.length, escaped: [], planted: mutants.map((m) => m.name), note: "the A/A on the base was not clean, so no mutant ran" });
    return false;
  }

  // What the informing checks already report on the base: a mutant is caught by one only for a finding beyond these.
  const baseInforming = informingKeys(noise.report.compare.hunks);
  const results: { name: string; caught: boolean; attributed: boolean; byInforming: boolean; verdict: string; artefacts: string[]; report: string }[] = [];
  for (const mutant of mutants) {
    const image = buildMutant(mutant, baseImages.reader, opts.log);
    const bSpec = specFor({ ...baseImages, reader: image });
    // One mutant that cannot be run is that mutant escaping, not the end of the self-test: the others still report.
    let outcome: Awaited<ReturnType<typeof run>>;
    try {
      outcome = await run({ ...opts, static: staticOpts, sets, mode: "release", recordRelease: false, a: baseSpec, b: bSpec, noise: noiseStatus, runs: Math.max(opts.runs, mutant.runs ?? 1) });
    } catch (e) {
      const message = e instanceof Error ? e.message.split("\n")[0]! : String(e);
      results.push({ name: mutant.name, caught: false, attributed: false, byInforming: false, verdict: "error", artefacts: [], report: message });
      opts.log(`mutant ${mutant.name}: ERROR, not caught (${message})`);
      continue;
    }
    const judged = judgeMutant(mutant, outcome.report.verdict, outcome.report.compare.unclaimed, outcome.report.compare.hunks, baseInforming);
    results.push({ name: mutant.name, ...judged, verdict: outcome.report.verdict, report: outcome.files.html });
    // As it finishes, so a run that is killed later still says what it had found.
    opts.log(`mutant ${mutant.name}: ${judged.caught ? "caught" : "NOT caught"}${judged.byInforming ? " by an informing check" : ""}, ${judged.attributed ? "attributed" : "NOT attributed"} (${outcome.report.verdict}${judged.artefacts.length ? `; ${judged.artefacts.join(", ")}` : ""})`);
  }

  opts.log("");
  opts.log("mutant           caught  attributed  unclaimed artefacts");
  for (const r of results) {
    opts.log(`${r.name.padEnd(16)} ${(r.caught ? "yes" : "NO").padEnd(7)} ${(r.attributed ? "yes" : "NO").padEnd(11)} ${r.artefacts.join(", ") || "—"}`);
  }
  const failed = results.filter((r) => !r.caught || !r.attributed);
  writeMutantsSummary(opts.outDir, { ranAt, base: opts.base, caught: results.length - failed.length, total: results.length, escaped: failed.map((r) => r.name), planted: results.map((r) => r.name), byInforming: results.filter((r) => r.byInforming && r.caught && r.attributed).map((r) => r.name) });
  if (failed.length) {
    opts.log("");
    for (const r of failed) opts.log(`escaped: ${r.name} (verdict ${r.verdict}) — ${r.report}`);
    opts.log(`${failed.length} of ${results.length} mutants escaped; the harness must not gate releases until this is 0 of ${results.length}.`);
    return false;
  }
  opts.log(`${results.length} of ${results.length} mutants caught and attributed.`);
  return true;
}
