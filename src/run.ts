import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { selectJourneys, type Journey, type JourneySet } from "../traffic/journeys/journeys.ts";
import { reference } from "../traffic/journeys/reference.ts";
import { matchClaims } from "./claims/matcher.ts";
import { loadClaims } from "./claims/schema.ts";
import { captureSide } from "./collectors/index.ts";
import { compareCaptures } from "./compare/index.ts";
import { gate } from "./gate.ts";
import { runMigration } from "./modes/migration.ts";
import { runUpgrade } from "./modes/upgrade.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise, type MaskHits } from "./normalise/masks.ts";
import { writeReports } from "./report/index.ts";
import { fileLedger, realExec, resolveSideProvenance, trustPolicyFromEnv } from "./images.ts";
import { ROOT, externalSide, imagesFor, sideSpec, stackDown, stackUp } from "./stack.ts";
import { kindDown, kindSide, kindUp } from "./substrate/kind.ts";
import type { Claim, Hunk, Mode, NoiseStatus, RunReport, SideCapture, SideSpec, Substrate } from "./types.ts";

import { HARNESS_VERSION, SCHEMA_VERSION, harnessInfo } from "./version.ts";
import { parseNoiseStatus } from "./noise.ts";

export { HARNESS_VERSION };
export const DEFAULT_NOW = "2026-09-16T09:05:00.000Z";

export interface RunOptions {
  mode: Mode;
  a: string;
  b: string;
  substrate: Substrate;
  imagePrefix: string;
  outDir: string;
  now: string;
  runs: number;
  sets: JourneySet[];
  journeys: string[];
  claimsFile?: string;
  masksFile: string;
  /** Path to a noise-status.json, or "skip" to waive (logged in the report). */
  noise?: string;
  noiseMaxAgeDays: number;
  screenshots: boolean;
  axe: boolean;
  focusStops: number;
  /** k6 after the journeys on each side. */
  load?: { rate: number; duration: string };
  /** Leave the stack running afterwards (for investigation). */
  keep: boolean;
  /** Don't start or stop the stack; assume it is up. */
  noStack: boolean;
  /** Judge registry images whose signature could not be verified. Loud, and recorded in the report. */
  allowUnsigned: boolean;
  /** post-deploy: the release-mode run directory whose b capture is the recorded side. */
  recorded?: string;
  /** post-deploy: live URLs, reader=...,catalogue=...,live=... */
  production?: string;
  /** migration: a pg_dump to restore before applying the candidate's migrations. */
  snapshot?: string;
  /** upgrade: seconds of load and requests per second. */
  upgrade: { seconds: number; rate: number };
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
  return { status: parseNoiseStatus(readFileSync(file, "utf8"), file), waived: false };
}

interface CompareInput {
  mode: Mode;
  substrate: Substrate;
  captureDir: string;
  a: SideCapture;
  b: SideCapture;
  claims: Claim[];
  masksFile: string;
  noise?: string;
  noiseMaxAgeDays: number;
  now: string;
  runs: number;
  /** Hunks produced by a rehearsal mode rather than by capture comparison. */
  extraHunks?: Hunk[];
  extras?: Pick<RunReport, "migration" | "upgrade">;
  log: (m: string) => void;
}

/**
 * Compare two captures (from disk or just taken): normalise, diff, match
 * claims, gate, write the reports. Used by `run`, `harness compare` and the tests.
 */
export function compareFromCaptures(input: CompareInput): RunOutcome {
  const masks = loadMasks(input.masksFile);
  const na = normalise(input.a, masks, input.mode);
  const nb = normalise(input.b, masks, input.mode);
  const masksApplied: MaskHits = {};
  for (const id of Object.keys(na.hits)) masksApplied[id] = (na.hits[id] ?? 0) + (nb.hits[id] ?? 0);

  const hunks = [...compareCaptures(na.capture, nb.capture, masks, input.captureDir), ...(input.extraHunks ?? [])];
  const compare = matchClaims(hunks, input.claims);
  const ranAt = new Date();
  const noise = readNoise(input.noise, input.log);
  const verdict = gate({ mode: input.mode, compare, noiseWaived: noise.waived, noiseMaxAgeDays: input.noiseMaxAgeDays, ranAt, ...(noise.status ? { noise: noise.status } : {}) });

  const strip = (l: NonNullable<SideCapture["load"]>) => {
    const { samples: _s, ...rest } = l;
    return rest;
  };
  const report: RunReport = {
    schemaVersion: SCHEMA_VERSION,
    harness: harnessInfo(),
    harnessVersion: HARNESS_VERSION,
    mode: input.mode,
    substrate: input.substrate,
    ranAt: ranAt.toISOString(),
    now: input.now,
    runs: input.runs,
    sides: { a: input.a.images, b: input.b.images },
    ...(input.a.provenance || input.b.provenance ? { provenance: { ...(input.a.provenance ? { a: input.a.provenance } : {}), ...(input.b.provenance ? { b: input.b.provenance } : {}) } } : {}),
    verdict: verdict.verdict,
    reasons: [...verdict.reasons, ...provenanceReasons(input.a, input.b)],
    ...(noise.status ? { noise: noise.status } : {}),
    compare,
    masksApplied,
    ...(input.extras ?? {}),
    ...(input.a.load && input.b.load ? { load: { a: strip(input.a.load), b: strip(input.b.load) } } : {})
  };

  const files = writeReports(input.captureDir, report);
  if (input.mode === "noise") {
    const failing = compare.hunks.filter((h) => h.severity === "fail").length;
    const status: NoiseStatus = { schemaVersion: SCHEMA_VERSION, ranAt: report.ranAt, clean: failing === 0, hunks: failing };
    writeFileSync(join(input.captureDir, "noise-status.json"), JSON.stringify(status, null, 2));
  }
  return { report, outDir: input.captureDir, files };
}

/** Anything about where the images came from that a reader of the verdict must not miss. */
function provenanceReasons(a: SideCapture, b: SideCapture): string[] {
  const reasons: string[] = [];
  for (const side of [a, b]) {
    if (!side.provenance) continue;
    const images = Object.values(side.provenance.images);
    const unverified = images.filter((i) => i.provenance === "pulled-unverified");
    if (unverified.length) reasons.push(`side ${side.side} ran ${unverified.length} registry image(s) whose signature was NOT verified (--allow-unsigned); this run is not evidence for a release`);
    const built = images.find((i) => i.provenance === "built-from-ref");
    if (built) reasons.push(`side ${side.side} was built here from monorepo ref ${built.builtFrom?.ref ?? "?"}, not pulled from the registry: it is not the image that ships`);
  }
  return [...new Set(reasons)];
}

export function loadCapture(dir: string, side: "a" | "b"): SideCapture {
  const file = join(dir, side, "capture.json");
  if (!existsSync(file)) throw new Error(`no capture at ${file}`);
  return JSON.parse(readFileSync(file, "utf8")) as SideCapture;
}

/** An empty capture standing in for a side that has nothing to compare (migration mode). */
function emptyCapture(spec: SideSpec): SideCapture {
  return { side: spec.name, harness: harnessInfo(), images: spec.images, capturedAt: new Date().toISOString(), journeys: [], metrics: { before: {}, after: {} }, logs: {} };
}

/** The whole thing: stack up, capture both sides, normalise, compare, claim, gate, report, stack down. */
export async function run(opts: RunOptions): Promise<RunOutcome> {
  const claims = opts.claimsFile ? loadClaims(opts.claimsFile) : [];
  const outDir = resolve(opts.outDir, timestampDir(opts.mode));
  mkdirSync(outDir, { recursive: true });
  opts.log(`harness ${HARNESS_VERSION} · mode ${opts.mode} · substrate ${opts.substrate} · clock ${opts.now} · ${opts.runs} run(s) · out ${outDir}`);

  const common = { substrate: opts.substrate, captureDir: outDir, claims, masksFile: opts.masksFile, noiseMaxAgeDays: opts.noiseMaxAgeDays, now: opts.now, runs: opts.runs, log: opts.log, ...(opts.noise ? { noise: opts.noise } : {}) };

  // ---- migration: no stacks, a throwaway Postgres and two sets of migrations.
  if (opts.mode === "migration") {
    const a = sideSpec("a", { reader: `migrations:${opts.a}`, catalogue: "-", live: "-" });
    const b = sideSpec("b", { reader: `migrations:${opts.b}`, catalogue: "-", live: "-" });
    const { result, hunks } = runMigration({ a: opts.a, b: opts.b, workDir: outDir, log: opts.log, ...(opts.snapshot ? { snapshot: opts.snapshot } : {}) });
    return compareFromCaptures({ ...common, mode: "migration", a: emptyCapture(a), b: emptyCapture(b), extraHunks: hunks, extras: { migration: result } });
  }

  // ---- post-deploy: a is the recorded candidate, b is live production, synthetic traffic only.
  if (opts.mode === "post-deploy") {
    if (!opts.recorded || !opts.production) throw new Error("post-deploy needs --recorded <release run dir> and --production reader=..,catalogue=..,live=..");
    const recorded = loadCapture(opts.recorded, "b");
    const b = externalSide("b", opts.production, reference.courseId);
    const journeys = selectJourneys(["reference"], opts.journeys);
    opts.log(`  a: recorded ${recorded.images.reader} from ${opts.recorded}`);
    opts.log(`  b: live ${b.urls.reader}`);
    const captureB = await captureSide(b, journeys, { outDir, now: opts.now, runs: opts.runs, screenshots: opts.screenshots, axe: opts.axe, focusStops: opts.focusStops, log: opts.log });
    // Only the reference journeys are comparable against production.
    const recordedRef: SideCapture = { ...recorded, side: "a", journeys: recorded.journeys.filter((j) => journeys.some((s) => s.name === j.journey)), logs: {}, metrics: { before: {}, after: {} } };
    delete recordedRef.load;
    mkdirSync(join(outDir, "a"), { recursive: true });
    writeFileSync(join(outDir, "a", "capture.json"), JSON.stringify(recordedRef, null, 2));
    if (!recordedRef.journeys.length) opts.log("  warning: the recorded run has no reference journeys; run release mode with --set reference included");
    return compareFromCaptures({ ...common, mode: "post-deploy", a: recordedRef, b: captureB });
  }

  const a: SideSpec = sideSpec("a", imagesFor(opts.a, opts.imagePrefix));
  const b: SideSpec = sideSpec("b", imagesFor(opts.b, opts.imagePrefix));
  if (opts.substrate === "kind") {
    // Kind publishes on its own host ports; the signed-in reader and the stubs are compose-only (deploy/kind/README.md).
    Object.assign(a, kindSide(a));
    Object.assign(b, kindSide(b));
  }
  if (opts.mode === "noise" && JSON.stringify(a.images) !== JSON.stringify(b.images)) {
    throw new Error("noise mode compares a tag with itself; --a and --b differ");
  }
  const selected: Journey[] = selectJourneys(opts.sets, opts.journeys);
  // Before anything starts: read each image's digest and labels, and refuse a
  // registry image with no verified signature (ImageTrustError -> exit 2).
  const trust = { exec: realExec, ledger: fileLedger(), policy: trustPolicyFromEnv(process.env, opts.allowUnsigned), log: opts.log };
  a.provenance = resolveSideProvenance(a.images, trust);
  b.provenance = resolveSideProvenance(b.images, trust);
  opts.log(`  a: ${a.images.reader}, ${a.images.catalogue}, ${a.images.live} — ${a.provenance.summary}`);
  opts.log(`  b: ${b.images.reader}, ${b.images.catalogue}, ${b.images.live} — ${b.provenance.summary}`);
  opts.log(`  journeys: ${selected.map((j) => j.name).join(", ")}`);

  const up = () => {
    if (opts.noStack) return;
    opts.log(`starting both stacks (${opts.substrate})…`);
    if (opts.substrate === "kind") kindUp(a, b, opts.now, opts.log);
    else stackUp(a, b, opts.now, { profiles: opts.mode === "upgrade" ? ["upgrade"] : [] });
  };
  const down = () => {
    if (opts.noStack) return;
    if (opts.keep) {
      opts.log("stack left running (--keep); stop with: pnpm stack:down");
      return;
    }
    opts.log("stopping stacks…");
    if (opts.substrate === "kind") kindDown(opts.log);
    else stackDown(a, b, opts.now);
  };

  up();
  let captureA: SideCapture;
  let captureB: SideCapture;
  let upgrade: RunReport["upgrade"] | undefined;
  let extraHunks: Hunk[] = [];
  try {
    const captureOpts = { outDir, now: opts.now, runs: opts.runs, screenshots: opts.screenshots, axe: opts.axe, focusStops: opts.focusStops, log: opts.log, ...(opts.substrate === "compose" ? { logsFrom: { a, b } } : {}), ...(opts.load ? { load: opts.load } : {}) };
    if (opts.mode === "upgrade") {
      if (opts.substrate !== "compose") throw new Error("upgrade mode runs on the compose substrate; kind rolling updates are rehearsed by `harness kind rollout`");
      // A short capture of both sides first (they must both be healthy), then the rollout.
      opts.log("capturing side a…");
      captureA = await captureSide(a, selected, { ...captureOpts, load: undefined as never });
      opts.log("capturing side b…");
      captureB = await captureSide(b, selected, { ...captureOpts, load: undefined as never });
      opts.log("rolling b in under load…");
      const rolled = await runUpgrade({ a, b, now: opts.now, outDir, rate: opts.upgrade.rate, seconds: opts.upgrade.seconds, courseId: a.urls.courseId, log: opts.log });
      upgrade = rolled.result;
      extraHunks = rolled.hunks;
    } else {
      opts.log("capturing side a…");
      captureA = await captureSide(a, selected, captureOpts);
      opts.log("capturing side b…");
      captureB = await captureSide(b, selected, captureOpts);
    }
  } finally {
    down();
  }

  opts.log("comparing…");
  return compareFromCaptures({ ...common, mode: opts.mode, a: captureA, b: captureB, extraHunks, ...(upgrade ? { extras: { upgrade } } : {}) });
}

export const defaultRunOptions = (): Omit<RunOptions, "mode" | "a" | "b"> => ({
  substrate: "compose",
  imagePrefix: process.env.HARNESS_IMAGE_PREFIX ?? "tutors",
  outDir: resolve(ROOT, "out"),
  now: process.env.HARNESS_NOW ?? DEFAULT_NOW,
  runs: 1,
  sets: ["fixture", "auth", "reference"],
  journeys: [],
  masksFile: DEFAULT_MASKS_FILE,
  noiseMaxAgeDays: 7,
  screenshots: true,
  axe: true,
  focusStops: 12,
  keep: false,
  noStack: false,
  allowUnsigned: false,
  upgrade: { seconds: 45, rate: 20 },
  log: (m) => console.log(m)
});
