import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { selectJourneys, type Journey, type JourneySet } from "../traffic/journeys/journeys.ts";
import { reference } from "../traffic/journeys/reference.ts";
import { matchClaims } from "./claims/matcher.ts";
import { DEFAULT_CLAIM_MAX_HUNKS, claimHygiene, claimMaxHunksFromEnv } from "./claims/hygiene.ts";
import { loadClaims } from "./claims/schema.ts";
import { loadRules } from "./claims/rules.ts";
import { captureSide } from "./collectors/index.ts";
import { compareCaptures } from "./compare/index.ts";
import { gate } from "./gate.ts";
import { runMigration } from "./modes/migration.ts";
import { runUpgrade } from "./modes/upgrade.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise, type MaskHits } from "./normalise/masks.ts";
import { writeReports } from "./report/index.ts";
import { fileLedger, realExec, resolveSideProvenance, trustPolicyFromEnv } from "./images.ts";
import { pinImages, type Digests } from "./digests.ts";
import { deploymentReason, findReleaseRecord, judgeDeployment, releaseRecordOf, writeReleaseRecord } from "./release-record.ts";
import { ROOT, externalSide, imagesFor, sideSpec, stackDown, stackUp } from "./stack.ts";
import { kindDown, kindSide, kindUp } from "./substrate/kind.ts";
import { overrideLine, recordOverride, type OverrideRequest } from "./override.ts";
import type { Claim, Deployment, Hunk, Mode, NoiseStatus, RunReport, SideCapture, SideSpec, Substrate } from "./types.ts";

import { HARNESS_VERSION, SCHEMA_VERSION, harnessInfo } from "./version.ts";
import { DEFAULT_RESTARTS } from "./runtime/startup.ts";
import { parseNoiseStatus } from "./noise.ts";
import { collectImageStatic, staticPolicyFromEnv } from "./image-static/collect.ts"; // R5
import { imageArtefactsSection, imageStaticReasons } from "./image-static/report.ts"; // R5

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
  /** Since 1.3.0: the release's rules.json, a path or an http(s) URL (`--rules`). A claim's `rule` must be in it. */
  rules?: string;
  masksFile: string;
  /** Path to a noise-status.json, or "skip" to waive (logged in the report). */
  noise?: string;
  noiseMaxAgeDays: number;
  /** A claim covering more failing hunks than this is flagged in the report (`--claim-max-hunks`). */
  claimMaxHunks: number;
  /**
   * Noise mode: write the status as DEGRADED unless every image on both sides was pulled and
   * signature-verified in this run (`--require-verified`). The nightly sets it; the gate never
   * trusts a degraded status, so a night that survived on a cache or a local build cannot
   * license a release FAIL.
   */
  requireVerified: boolean;
  /** Record a human's decision to accept a FAIL (`--override-reason`, `--override-by`). */
  override?: OverrideRequest;
  screenshots: boolean;
  axe: boolean;
  focusStops: number;
  /** k6 after the journeys on each side. */
  load?: { rate: number; duration: string };
  /** R5 (contract 1.2.0): collect container posture (identity, capabilities, filesystem, limits). */
  runtime: boolean;
  /** R5: restarts per app to sample startup time from; 0 switches it off. */
  startupRestarts: number;
  /** Leave the stack running afterwards (for investigation). */
  keep: boolean;
  /** Don't start or stop the stack; assume it is up. */
  noStack: boolean;
  /** Judge registry images whose signature could not be verified. Loud, and recorded in the report. */
  allowUnsigned: boolean;
  /** R5: overrides for how static image artefacts are collected (the mutants force a local SBOM generator). */
  static?: Partial<import("./image-static/collect.ts").StaticPolicy>;
  /** post-deploy: the release-mode run directory whose b capture is the recorded side. */
  recorded?: string;
  /** post-deploy: live URLs, reader=...,catalogue=...,live=... */
  production?: string;
  /** Since 1.3.0. The digest of each side's images, from the release dispatch (`--a-digests`, `--b-digests`): the references are pinned with them. */
  aDigests?: Digests;
  bDigests?: Digests;
  /**
   * Since 1.3.0, post-deploy: what the deploy says it deployed (`--deployed <tag>`, `--deployed-digests`), and where the
   * release record is (`--release-record`; default the store under HARNESS_HOME). Compared with the record; a difference warns.
   */
  deployed?: { production?: string; digests: Digests; record?: string };
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
  claimMaxHunks?: number;
  requireVerified?: boolean;
  override?: OverrideRequest;
  now: string;
  runs: number;
  /** Since 1.3.0: post-deploy's comparison of what was deployed with what release mode recorded. Never changes a FAIL; a PASS becomes a WARN. */
  deployment?: Deployment;
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
  const degraded = input.mode === "noise" && input.requireVerified ? evidenceGaps(input.a, input.b) : [];
  const gated = gate({ mode: input.mode, compare, noiseWaived: noise.waived, noiseMaxAgeDays: input.noiseMaxAgeDays, ranAt, ...(degraded.length ? { degraded } : {}), ...(noise.status ? { noise: noise.status } : {}) });
  // Deployed images that are not the ones judged: loud, advisory. A FAIL stays a FAIL, and a PASS is not a clean one.
  const deploymentLine = input.deployment ? deploymentReason(input.deployment) : undefined;
  const verdict = deploymentLine && gated.verdict === "pass" ? { ...gated, verdict: "warn" as const } : gated;
  const override = input.override ? recordOverride(input.override, verdict.verdict, ranAt) : undefined;
  const hygiene = input.claims.length ? claimHygiene(compare, input.claimMaxHunks ?? DEFAULT_CLAIM_MAX_HUNKS) : undefined;

  const strip = (l: NonNullable<SideCapture["load"]>) => {
    const { samples: _s, ...rest } = l;
    return rest;
  };
  const imageArtefacts = imageArtefactsSection(input.a, input.b); // R5
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
    reasons: [...(override ? [overrideLine(override)] : []), ...(deploymentLine ? [deploymentLine] : []), ...verdict.reasons, ...provenanceReasons(input.a, input.b), ...imageStaticReasons(input.a, input.b)],
    ...(noise.status ? { noise: noise.status } : {}),
    compare,
    masksApplied,
    ...(input.extras ?? {}),
    ...(input.a.load && input.b.load ? { load: { a: strip(input.a.load), b: strip(input.b.load) } } : {}),
    ...(hygiene ? { claimHygiene: hygiene } : {}),
    ...(override ? { override } : {}),
    ...(imageArtefacts ? { imageArtefacts } : {}),
    ...(input.deployment ? { deployment: input.deployment } : {})
  };

  const files = writeReports(input.captureDir, report);
  if (input.mode === "noise") {
    const failing = compare.hunks.filter((h) => h.severity === "fail").length;
    const status: NoiseStatus = { schemaVersion: SCHEMA_VERSION, ranAt: report.ranAt, clean: failing === 0, hunks: failing, ...(degraded.length ? { degraded } : {}) };
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
    const cached = images.filter((i) => i.provenance === "cached");
    if (cached.length) reasons.push(`side ${side.side} ran ${cached.length} image(s) restored from the runner's cache because the registry could not be reached (cached ${cached[0]?.cachedAt ?? "earlier"}): the tag may have moved; this run is not evidence for a release`);
    const built = images.find((i) => i.provenance === "built-from-ref");
    if (built) reasons.push(`side ${side.side} was built here from monorepo ref ${built.builtFrom?.ref ?? "?"}, not pulled from the registry: it is not the image that ships`);
  }
  return [...new Set(reasons)];
}

/**
 * Why a noise run's own evidence is weak: any side whose images were not all
 * pulled and signature-verified in this very run. A clean A/A over a cache, a
 * local build or an unverified pull says nothing about production.
 */
export function evidenceGaps(a: SideCapture, b: SideCapture): string[] {
  const gaps: string[] = [];
  for (const side of [a, b]) {
    if (!side.provenance) {
      gaps.push(`side ${side.side}: image provenance was not recorded`);
      continue;
    }
    if (Object.values(side.provenance.images).some((i) => i.provenance !== "pulled+verified")) gaps.push(`side ${side.side} did not run pulled+verified images (${side.provenance.summary})`);
  }
  return gaps;
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
  // Before anything starts: an unreadable rules file, or a claim naming a rule it does not hold, is exit 2 with no stack up.
  const rules = opts.rules ? await loadRules(opts.rules) : undefined;
  const claims = opts.claimsFile ? loadClaims(opts.claimsFile, rules) : [];
  const outDir = resolve(opts.outDir, timestampDir(opts.mode));
  mkdirSync(outDir, { recursive: true });
  opts.log(`harness ${HARNESS_VERSION} · mode ${opts.mode} · substrate ${opts.substrate} · clock ${opts.now} · ${opts.runs} run(s) · out ${outDir}`);

  const common = { substrate: opts.substrate, captureDir: outDir, claims, masksFile: opts.masksFile, noiseMaxAgeDays: opts.noiseMaxAgeDays, claimMaxHunks: opts.claimMaxHunks, requireVerified: opts.requireVerified, ...(opts.override ? { override: opts.override } : {}), now: opts.now, runs: opts.runs, log: opts.log, ...(opts.noise ? { noise: opts.noise } : {}) };

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
    return compareFromCaptures({ ...common, mode: "post-deploy", a: recordedRef, b: captureB, ...(opts.deployed ? { deployment: checkDeployment(opts.deployed, opts.log) } : {}) });
  }

  const a: SideSpec = sideSpec("a", pinImages(imagesFor(opts.a, opts.imagePrefix), opts.aDigests, "--a-digests"));
  const b: SideSpec = sideSpec("b", pinImages(imagesFor(opts.b, opts.imagePrefix), opts.bDigests, "--b-digests"));
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
  // R5: what the images are (manifest, SBOM, vulnerabilities), read from the images before anything runs.
  const staticPolicy = { ...staticPolicyFromEnv(process.env, trust.policy), ...opts.static };
  opts.log("collecting static image artefacts (manifest, SBOM, vulnerabilities)…");
  a.imageStatic = collectImageStatic(a.images, a.provenance, { exec: realExec, policy: staticPolicy, log: opts.log });
  b.imageStatic = collectImageStatic(b.images, b.provenance, { exec: realExec, policy: staticPolicy, log: opts.log });
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
    const captureOpts = { outDir, now: opts.now, runs: opts.runs, screenshots: opts.screenshots, axe: opts.axe, focusStops: opts.focusStops, log: opts.log, ...(opts.substrate === "compose" ? { logsFrom: { a, b } } : {}), ...(opts.load ? { load: opts.load } : {}), runtime: { substrate: opts.substrate, posture: opts.runtime, startupRestarts: opts.mode === "upgrade" ? 0 : opts.startupRestarts } };
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
  const outcome = compareFromCaptures({ ...common, mode: opts.mode, a: captureA, b: captureB, extraHunks, ...(upgrade ? { extras: { upgrade } } : {}) });
  // Release mode leaves the record post-deploy mode checks a deployment against (docs/contract.md, "The release record").
  if (opts.mode === "release") {
    const made = releaseRecordOf(outcome.report, { pinned: opts.bDigests !== undefined });
    if ("record" in made) writeReleaseRecord(made.record, { outDir: outcome.outDir, log: opts.log });
    else opts.log(made.skipped);
  }
  return outcome;
}

/** Post-deploy: what the deploy says it deployed, against the release record; logs what it found. */
function checkDeployment(deployed: NonNullable<RunOptions["deployed"]>, log: (m: string) => void): Deployment {
  const found = deployed.production ? findReleaseRecord(deployed.production, deployed.record) : undefined;
  const deployment = judgeDeployment({ ...(deployed.production ? { production: deployed.production } : {}), digests: deployed.digests, ...(found ? { found } : {}) });
  log(deployment.status === "match" ? `  deployed images match the release record of ${deployment.record?.candidate} (${found?.file})` : `  WARNING: ${deploymentReason(deployment)}`);
  return deployment;
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
  claimMaxHunks: claimMaxHunksFromEnv(),
  requireVerified: false,
  screenshots: true,
  axe: true,
  focusStops: 12,
  runtime: true,
  startupRestarts: DEFAULT_RESTARTS,
  keep: false,
  noStack: false,
  allowUnsigned: false,
  upgrade: { seconds: 45, rate: 20 },
  log: (m) => console.log(m)
});
