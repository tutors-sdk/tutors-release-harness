/**
 * What the glance reads, found beside what the score read: the release run's two capture.json, the whole changes.json,
 * the scoreboard (for novelty) and the harness's masks (for a mask's reason). Kept apart from src/glance/rank.ts, which
 * is pure. Anything missing is a reason, which the glance turns into `notChecked`; nothing here throws for a missing file.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Changes } from "../changes/signals.ts";
import { loadMasks } from "../normalise/masks.ts";
import type { ScoreInputs } from "../score/confidence.ts";
import { parseLines } from "../scoreboard/line.ts";
import type { SideCapture } from "../types.ts";
import { GLANCE_KINDS, glance, type Glance, type GlanceInputs } from "./rank.ts";

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, "utf8"));

export function captures(runDir: string): NonNullable<GlanceInputs["captures"]> {
  const out: NonNullable<GlanceInputs["captures"]> = {};
  const missing: string[] = [];
  for (const side of ["a", "b"] as const) {
    const file = join(runDir, side, "capture.json");
    if (!existsSync(file)) {
      missing.push(`${side}/capture.json`);
      continue;
    }
    try {
      const c = readJson(file) as Partial<SideCapture>;
      if (Array.isArray(c.journeys)) out[side] = { journeys: c.journeys };
      else missing.push(`${side}/capture.json (no journeys)`);
    } catch {
      missing.push(`${side}/capture.json (not JSON)`);
    }
  }
  if (missing.length) out.reason = `no ${missing.join(" or ")} beside the release run`;
  return out;
}

/** A whole changes.json: per-PR files and the signals. The 1.9.0 `{ prs }` shape has neither. */
function wholeChanges(file: string | undefined): { changes?: Changes; reason?: string } {
  if (!file) return { reason: "no changes.json (harness changes, or harness release with --monorepo)" };
  try {
    const c = readJson(resolve(file)) as Partial<Changes>;
    if (Array.isArray(c.prs) && c.prs.every((p) => Array.isArray(p.files) && Array.isArray(p.deductions)) && c.signals) return { changes: c as Changes };
    return { reason: `${file} is not a whole changes.json (the 1.9.0 shape has no per-PR files or signals)` };
  } catch {
    return { reason: `${file} could not be read` };
  }
}

function history(file: string | undefined): Pick<GlanceInputs, "history" | "historyReason"> {
  if (!file) return { historyReason: "no scoreboard was given" };
  const f = resolve(file);
  if (!existsSync(f)) return { historyReason: `no scoreboard yet at ${f}` };
  try {
    return { history: { lines: parseLines(readFileSync(f, "utf8"), f), source: f } };
  } catch (e) {
    return { historyReason: `the scoreboard could not be read: ${e instanceof Error ? e.message : String(e)}` };
  }
}

function masks(): GlanceInputs["masks"] {
  try {
    return Object.fromEntries(loadMasks().masks.map((m) => [m.id, { artefact: m.artefact, reason: m.reason }]));
  } catch {
    return undefined;
  }
}

export interface GlanceSources {
  /** Where confidence.json is: the release run's `where` is relative to it. */
  outDir: string;
  inputs: ScoreInputs;
  /** The --change-risk file (or the changes stage's changes.json), when there was one. */
  changeRisk?: string;
  /** releases.jsonl, for novelty. */
  scoreboard?: string;
}

export function glanceInputs(s: GlanceSources): GlanceInputs {
  const release = s.inputs.release;
  const caps = release ? captures(resolve(s.outDir, release.where)) : { reason: "no release run" };
  const ch = wholeChanges(s.changeRisk);
  const m = masks();
  return {
    ...(release ? { release } : {}),
    captures: caps,
    ...(ch.changes ? { changes: ch.changes } : { changesReason: ch.reason! }),
    ...history(s.scoreboard),
    ...(s.inputs.run.candidate ? { tag: s.inputs.run.candidate } : {}),
    ...(m ? { masks: m } : {})
  };
}

/** The glance, or, if it cannot be built, an empty one that says why for every kind: a finding about the glance, never about the release. */
export function glanceOf(s: GlanceSources): Glance {
  try {
    return glance(glanceInputs(s));
  } catch (e) {
    const reason = `the glance could not be built: ${e instanceof Error ? e.message : String(e)}`;
    return { items: [], basis: { rule: "", history: { releases: [] }, journeys: { total: 0, names: [], source: reason }, checked: [], notChecked: GLANCE_KINDS.map((kind) => ({ kind, reason })), seen: [] } };
  }
}
