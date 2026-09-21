import { readFileSync } from "node:fs";
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
    return false;
  }

  const results: { name: string; caught: boolean; attributed: boolean; verdict: string; artefacts: string[]; report: string }[] = [];
  for (const mutant of mutants) {
    const image = buildMutant(mutant, baseImages.reader, opts.log);
    const bSpec = specFor({ ...baseImages, reader: image });
    const outcome = await run({ ...opts, static: staticOpts, sets, mode: "release", recordRelease: false, a: baseSpec, b: bSpec, noise: noiseStatus, runs: Math.max(opts.runs, mutant.runs ?? 1) });
    const artefacts = [...new Set(outcome.report.compare.unclaimed.map((h) => h.artefact))];
    const caught = outcome.report.verdict === "fail";
    const attributed = mutant.expect.some((a) => artefacts.includes(a));
    results.push({ name: mutant.name, caught, attributed, verdict: outcome.report.verdict, artefacts, report: outcome.files.html });
  }

  opts.log("");
  opts.log("mutant           caught  attributed  unclaimed artefacts");
  for (const r of results) {
    opts.log(`${r.name.padEnd(16)} ${(r.caught ? "yes" : "NO").padEnd(7)} ${(r.attributed ? "yes" : "NO").padEnd(11)} ${r.artefacts.join(", ") || "—"}`);
  }
  const failed = results.filter((r) => !r.caught || !r.attributed);
  if (failed.length) {
    opts.log("");
    for (const r of failed) opts.log(`escaped: ${r.name} (verdict ${r.verdict}) — ${r.report}`);
    opts.log(`${failed.length} of ${results.length} mutants escaped; the harness must not gate releases until this is 0 of ${results.length}.`);
    return false;
  }
  opts.log(`${results.length} of ${results.length} mutants caught and attributed.`);
  return true;
}
