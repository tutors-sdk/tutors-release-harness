import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { journeyByName, journeys as allJourneys, type Journey } from "../traffic/journeys/journeys.ts";
import { matchClaims } from "./claims/matcher.ts";
import { loadClaims } from "./claims/schema.ts";
import { captureSide } from "./collectors/index.ts";
import { compareCaptures } from "./compare/index.ts";
import { gate } from "./gate.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise, type MaskHits } from "./normalise/masks.ts";
import { writeReports } from "./report/index.ts";
import { ROOT, imagesFor, sideSpec, stackDown, stackUp } from "./stack.ts";
import type { Claim, Mode, NoiseStatus, RunReport, SideCapture, SideSpec } from "./types.ts";

export const HARNESS_VERSION: string = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")).version;
export const DEFAULT_NOW = "2026-09-16T09:05:00.000Z";

export interface RunOptions {
  mode: Mode;
  a: string;
  b: string;
  imagePrefix: string;
  outDir: string;
  now: string;
  runs: number;
  journeys: string[];
  claimsFile?: string;
  masksFile: string;
  /** Path to a noise-status.json, or "skip" to waive (logged in the report). */
  noise?: string;
  noiseMaxAgeDays: number;
  screenshots: boolean;
  axe: boolean;
  /** Leave the stack running afterwards (for investigation). */
  keep: boolean;
  /** Don't start or stop the stack; assume it is up. */
  noStack: boolean;
  log: (message: string) => void;
}

export interface RunOutcome {
  report: RunReport;
  outDir: string;
  files: { json: string; html: string; md: string };
}

function timestampDir(mode: Mode): string {
  return `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${mode}`;
}

function readNoise(path: string | undefined, log: (m: string) => void): { status?: NoiseStatus; waived: boolean } {
  if (!path) return { waived: false };
  if (path === "skip") {
    log("A/A requirement waived with --noise skip; the report records this.");
    return { waived: true };
  }
  const file = existsSync(path) && !path.endsWith(".json") ? join(path, "noise-status.json") : path;
  const status = JSON.parse(readFileSync(file, "utf8")) as NoiseStatus;
  return { status, waived: false };
}

/**
 * Compare two captures that already exist on disk (a `run` output directory,
 * or two captures from anywhere). Used by `harness compare`, by the tests, and
 * by `run` itself once both sides are captured.
 */
export function compareFromCaptures(input: {
  mode: Mode;
  captureDir: string;
  a: SideCapture;
  b: SideCapture;
  claims: Claim[];
  masksFile: string;
  noise?: string;
  noiseMaxAgeDays: number;
  now: string;
  runs: number;
  log: (m: string) => void;
}): RunOutcome {
  const masks = loadMasks(input.masksFile);
  const na = normalise(input.a, masks);
  const nb = normalise(input.b, masks);
  const masksApplied: MaskHits = {};
  for (const id of Object.keys(na.hits)) masksApplied[id] = (na.hits[id] ?? 0) + (nb.hits[id] ?? 0);

  const hunks = compareCaptures(na.capture, nb.capture, masks, input.captureDir);
  const compare = matchClaims(hunks, input.claims);
  const ranAt = new Date();
  const noise = readNoise(input.noise, input.log);
  const verdict = gate({ mode: input.mode, compare, noiseWaived: noise.waived, noiseMaxAgeDays: input.noiseMaxAgeDays, ranAt, ...(noise.status ? { noise: noise.status } : {}) });

  const report: RunReport = {
    harnessVersion: HARNESS_VERSION,
    mode: input.mode,
    ranAt: ranAt.toISOString(),
    now: input.now,
    runs: input.runs,
    sides: { a: input.a.images, b: input.b.images },
    verdict: verdict.verdict,
    reasons: verdict.reasons,
    ...(noise.status ? { noise: noise.status } : {}),
    compare,
    masksApplied
  };

  const files = writeReports(input.captureDir, report);
  if (input.mode === "noise") {
    const failing = compare.hunks.filter((h) => h.severity === "fail").length;
    const status: NoiseStatus = { ranAt: report.ranAt, clean: failing === 0, hunks: failing };
    writeFileSync(join(input.captureDir, "noise-status.json"), JSON.stringify(status, null, 2));
  }
  return { report, outDir: input.captureDir, files };
}

export function loadCapture(dir: string, side: "a" | "b"): SideCapture {
  const file = join(dir, side, "capture.json");
  if (!existsSync(file)) throw new Error(`no capture at ${file}`);
  return JSON.parse(readFileSync(file, "utf8")) as SideCapture;
}

/** The whole thing: stack up, capture both sides, normalise, compare, claim, gate, report, stack down. */
export async function run(opts: RunOptions): Promise<RunOutcome> {
  if (opts.mode === "upgrade" || opts.mode === "migration" || opts.mode === "post-deploy") {
    throw new Error(`mode "${opts.mode}" is not implemented yet: see README (phases H4–H5)`);
  }
  const a: SideSpec = sideSpec("a", imagesFor(opts.a, opts.imagePrefix));
  const b: SideSpec = sideSpec("b", imagesFor(opts.b, opts.imagePrefix));
  if (opts.mode === "noise" && JSON.stringify(a.images) !== JSON.stringify(b.images)) {
    throw new Error("noise mode compares a tag with itself; --a and --b differ");
  }
  const selected: Journey[] = opts.journeys.length ? opts.journeys.map(journeyByName) : allJourneys;
  const claims = opts.claimsFile ? loadClaims(opts.claimsFile) : [];
  const outDir = resolve(opts.outDir, timestampDir(opts.mode));
  mkdirSync(outDir, { recursive: true });

  opts.log(`harness ${HARNESS_VERSION} · mode ${opts.mode} · clock ${opts.now} · ${opts.runs} run(s) · out ${outDir}`);
  opts.log(`  a: ${a.images.reader}, ${a.images.catalogue}, ${a.images.live}`);
  opts.log(`  b: ${b.images.reader}, ${b.images.catalogue}, ${b.images.live}`);

  if (!opts.noStack) {
    opts.log("starting both stacks…");
    stackUp(a, b, opts.now);
  }
  let captureA: SideCapture;
  let captureB: SideCapture;
  try {
    // Logs are read from the compose project either way; a stack the harness
    // did not start is usually still that project (`harness stack up`).
    const captureOpts = { outDir, now: opts.now, runs: opts.runs, screenshots: opts.screenshots, axe: opts.axe, log: opts.log, logsFrom: { a, b } };
    opts.log("capturing side a…");
    captureA = await captureSide(a, selected, captureOpts);
    opts.log("capturing side b…");
    captureB = await captureSide(b, selected, captureOpts);
  } finally {
    if (!opts.noStack && !opts.keep) {
      opts.log("stopping stacks…");
      stackDown(a, b, opts.now);
    } else if (opts.keep) {
      opts.log("stack left running (--keep); stop with: pnpm stack:down");
    }
  }

  opts.log("comparing…");
  const outcome = compareFromCaptures({
    mode: opts.mode,
    captureDir: outDir,
    a: captureA,
    b: captureB,
    claims,
    masksFile: opts.masksFile,
    noiseMaxAgeDays: opts.noiseMaxAgeDays,
    now: opts.now,
    runs: opts.runs,
    log: opts.log,
    ...(opts.noise ? { noise: opts.noise } : {})
  });
  return outcome;
}

export const defaultRunOptions = (): Omit<RunOptions, "mode" | "a" | "b"> => ({
  imagePrefix: process.env.HARNESS_IMAGE_PREFIX ?? "tutors",
  outDir: resolve(ROOT, "out"),
  now: process.env.HARNESS_NOW ?? DEFAULT_NOW,
  runs: 1,
  journeys: [],
  masksFile: DEFAULT_MASKS_FILE,
  noiseMaxAgeDays: 7,
  screenshots: true,
  axe: true,
  keep: false,
  noStack: false,
  log: (m) => console.log(m)
});
