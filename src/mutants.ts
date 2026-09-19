import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { run, type RunOptions } from "./run.ts";
import { dockerRef, imagesFor, specFor } from "./image-ref.ts";
import { ROOT } from "./stack.ts";
import { ARTEFACTS } from "./types.ts";

const MutantsFileSchema = z.object({
  mutants: z.array(
    z.object({
      name: z.string().regex(/^[a-z0-9-]+$/),
      plants: z.string().min(1),
      expect: z.array(z.enum(ARTEFACTS)).min(1),
      runs: z.number().int().min(1).optional()
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

function buildMutant(name: string, base: string, log: (m: string) => void) {
  const image = mutantImage(name);
  log(`building ${image} from ${base}`);
  const result = spawnSync("docker", ["build", "-q", "-f", join(ROOT, "mutants", "Dockerfile"), "--build-arg", `BASE=${dockerRef(base)}`, "--build-arg", `MUTANT=${name}`, "-t", image, join(ROOT, "mutants")], {
    stdio: ["ignore", "pipe", "inherit"],
    encoding: "utf8"
  });
  if (result.status !== 0) throw new Error(`docker build for mutant ${name} exited ${result.status}`);
  return image;
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
export async function runMutants(opts: MutantsOptions): Promise<boolean> {
  const mutants = loadMutants();
  const baseImages = imagesFor(opts.base, opts.imagePrefix);
  const baseSpec = specFor(baseImages);

  // The fixture and signed-in journeys are enough to catch every mutant, and
  // they need nothing outside this stack.
  const sets = opts.sets.filter((s) => s !== "reference");
  opts.log(`self-test: A/A on ${baseImages.reader} first`);
  const noise = await run({ ...opts, sets, mode: "noise", a: baseSpec, b: baseSpec, runs: 1 });
  const noiseStatus = join(noise.outDir, "noise-status.json");
  if (noise.report.verdict !== "pass") {
    opts.log(`A/A is not clean (${noise.report.compare.hunks.length} diff(s)); the mutant self-test cannot be trusted. Report: ${noise.files.html}`);
    return false;
  }

  const results: { name: string; caught: boolean; attributed: boolean; verdict: string; artefacts: string[]; report: string }[] = [];
  for (const mutant of mutants) {
    const image = buildMutant(mutant.name, baseImages.reader, opts.log);
    const bSpec = specFor({ ...baseImages, reader: image });
    const outcome = await run({ ...opts, sets, mode: "release", a: baseSpec, b: bSpec, noise: noiseStatus, runs: Math.max(opts.runs, mutant.runs ?? 1) });
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
