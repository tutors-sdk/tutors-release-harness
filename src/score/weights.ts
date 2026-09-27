/**
 * The Release Confidence Score's constants: the eight dimensions, their weights, the floor cap and the bands.
 *
 * These change only by a pull request with a 5 Whys attached, never in the release that would benefit from the change
 * (docs/releases/1.9.0.md, "Guardrails"). A change here moves every score after it, so it lands on the next release's
 * scoreboard line as a visible discontinuity, not as a quiet improvement. Nothing here is read by src/gate.ts or
 * src/run.ts, and nothing here can change a verdict or an exit code (tests/confidence.test.ts holds both).
 */

import { createHash } from "node:crypto";

export const DIMENSION_IDS = ["claim-coverage", "noise-health", "statistical-margin", "rehearsals", "test-signal", "traceability", "change-risk", "post-deploy"] as const;
export type DimensionId = (typeof DIMENSION_IDS)[number];

export interface DimensionSpec {
  id: DimensionId;
  name: string;
  weight: number;
  /** What 100 means, as the plan says it. */
  full: string;
  /** Below this the RCS is capped at {@link FLOOR_CAP}, whatever the mean. */
  floor: string;
}

/** The weights sum to 100. */
export const DIMENSIONS: readonly DimensionSpec[] = [
  { id: "claim-coverage", name: "Claim coverage", weight: 20, full: "every failing hunk claimed by a narrow claim; no stale claims; no broad claims", floor: "any broad claim, or more than 2 stale claims" },
  { id: "noise-health", name: "Noise health", weight: 15, full: "a clean, verified A/A at most 2 days old; every mask fired", floor: "no usable A/A (none, --noise skip, dirty or degraded), or one older than 7 days" },
  { id: "statistical-margin", name: "Statistical margin", weight: 10, full: "every timing p-value above 0.20; k6 failure rate 0", floor: "any p-value in 0.05-0.10, or a k6 failure rate above 0" },
  { id: "rehearsals", name: "Rehearsals", weight: 10, full: "migration and upgrade both pass with zero failed requests", floor: "either rehearsal skipped" },
  { id: "test-signal", name: "Test signal", weight: 15, full: "mutation score at least 80% on every changed package; every harness mutant caught", floor: "a mutation score below 60%, or any harness mutant missed" },
  { id: "traceability", name: "Requirements traceability", weight: 10, full: "every changelog entry has an EARS file and a claim; every claim traces to a changelog entry", floor: "any new-feature entry without an EARS file" },
  { id: "change-risk", name: "Change risk", weight: 15, full: "low churn; no hotspot touched by a first-time contributor; every PR reviewed", floor: "any PR merged without review (or a commit straight to main)" },
  { id: "post-deploy", name: "Post-deploy history", weight: 5, full: "no rollback after the last release", floor: "the last release's post-deploy check FAILED (a rollback issue)" }
];

/** A breached floor caps the RCS here (the top of Red), so one hollow dimension cannot hide behind seven strong ones. */
export const FLOOR_CAP = 74;

export type Band = "Green" | "Amber" | "Red";

/** Fixed, not tunable per release. Highest first: the first whose `min` the RCS reaches is its band. */
export const BANDS: readonly { band: Band; min: number; meaning: string }[] = [
  { band: "Green", min: 90, meaning: "ship on the captain's say" },
  { band: "Amber", min: 75, meaning: "ship only after the reviewer's glance is recorded verified" },
  { band: "Red", min: 0, meaning: "hold, open a 5 Whys, do not re-run hoping for a better number" }
];

export function bandOf(rcs: number): { band: Band; meaning: string } {
  const b = BANDS.find((x) => rcs >= x.min)!;
  return { band: b.band, meaning: b.meaning };
}

// ---- the deduction rules, in points ---------------------------------------------------------------------
// Each rule names what it read, so every point lost can be pointed at (a hunk, a claim, a PR, a file, a run).

export const RULES = {
  claims: { unclaimed: 20, broad: 25, stale: 15, staleFloorAbove: 2, coversMany: 5, coversManyMax: 15 },
  noise: { none: 60, notClean: 40, degraded: 40, freshDays: 2, oldDays: 7, aging: 10, old: 40, silentMask: 5, silentMaskMax: 20 },
  stats: { nearMissLow: 0.05, nearMissHigh: 0.1, thinHigh: 0.2, nearMiss: 20, thin: 10, unjudged: 10, unjudgedMax: 30, noLoad: 20, loadFailures: 30 },
  rehearsals: { skipped: 50, failed: 50, warned: 20, failedRequests: 50 },
  testSignal: { target: 80, floorBelow: 60, belowTarget: 30, mutantMissed: 25 },
  traceability: { noEars: 20, noClaim: 10, untracedClaim: 10 },
  // The plan's table, "Code-level change signals"; src/changes/signals.ts applies them per PR (docs/releases/1.10.0.md).
  changeRisk: {
    /** An app whose churn is above this many times its median over the history releases. */
    churnFactor: 2,
    churnApp: 5,
    /** A hotspot: a production file changed in at least this many of the history releases. */
    hotspotReleases: 3,
    hotspotFirstTime: 10,
    hotspot: 3,
    /** A file with at least this many authors this release. */
    dispersionAuthors: 3,
    dispersion: 5,
    dispersionMax: 15,
    orphan: 10,
    /** Test lines ÷ production lines below this, on a package with production churn. */
    testRatio: 0.2,
    lowTests: 10,
    majorBump: 5,
    /** No points: an unreviewed PR breaches the floor, which caps the RCS at 74. */
    unreviewed: 0
  },
  postDeploy: { failed: 100, warned: 20 }
} as const;

/**
 * Which weights, floors, bands and deduction rules made a score: the first 12 hex of a SHA-256 over all of them. Any
 * change here gives a new value, with nothing to remember to bump, so the scoreboard shows the discontinuity on the
 * first release scored under the new rules (docs/lean.md, "Guardrails") and the run rules can say a window spans it.
 */
export const WEIGHTS_VERSION = createHash("sha256")
  .update(JSON.stringify({ dimensions: DIMENSIONS.map((d) => [d.id, d.weight, d.floor]), floorCap: FLOOR_CAP, bands: BANDS.map((b) => [b.band, b.min]), rules: RULES }))
  .digest("hex")
  .slice(0, 12);
