import { ARTEFACTS, type Artefact, type Hunk } from "../types.ts";

/**
 * Engine levels (since 1.21.0): informing before blocking.
 *
 * Every engine has a level, and the level is what lets a new check be watched before it may stop a release:
 *
 *   blocking    its failing hunks gate as they always have: unclaimed, they FAIL a release (with a clean A/A)
 *   informing   its findings are reported, labelled "informing", and never gate: a hunk it would have failed is turned
 *               into an informational one carrying `level: "informing"`, so no verdict, Gate, exit code or A/A count
 *               reads it. It stays claimable: a claim that names it is recorded as matching it, as for any
 *               informational hunk (src/claims/matcher.ts)
 *
 * An informing engine may carry `blockingFrom`, a UTC date (YYYY-MM-DD): from that date on it is blocking, with no
 * release of the harness in between. The level a run used is the one on its `ranAt`, and the report records every
 * engine's (`report.json` `levels`), so a reader can tell a quiet engine from an informing one.
 *
 * An engine is named by its artefact, the word claims and masks already use; every artefact must be here (the type
 * says so). Every diff engine is blocking, so a run that passed before 1.21.0 passes now and one that failed fails.
 * A new engine or check ships informing, with a date when there is one (TESTING.md, "Rules for a new engine").
 */
export type Level = "blocking" | "informing";

export interface EngineLevel {
  level: Level;
  /** Informing only: the UTC date (YYYY-MM-DD) from which the engine is blocking. Absent: informing until changed here. */
  blockingFrom?: string;
}

export type EngineLevels = Readonly<Record<string, EngineLevel>>;

/**
 * The level of every engine, by artefact. The single place a level is set. Every diff engine is blocking. The policy
 * family (src/compare/policy.ts, since 1.22.0) ships informing with no date: 2.0 decides which become blocking, and
 * none does before it has a planted mutant that it catches.
 */
export const ENGINE_LEVELS: Readonly<Record<Artefact, EngineLevel>> = Object.freeze({
  ...(Object.fromEntries(ARTEFACTS.map((a) => [a, { level: "blocking" }])) as Record<Artefact, EngineLevel>),
  "image-hardening": { level: "informing" },
  "build-provenance": { level: "informing" },
  "vuln-ceiling": { level: "informing" }
});

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The level an engine has on `at`: an informing engine whose `blockingFrom` has come is blocking. An unknown engine is blocking: no check escapes the Gate by being left out. */
export function levelOn(engine: string, at: Date, table: EngineLevels = ENGINE_LEVELS): EngineLevel {
  const set = table[engine];
  if (!set || set.level === "blocking") return { level: "blocking" };
  if (set.blockingFrom !== undefined) {
    if (!DATE.test(set.blockingFrom) || !Number.isFinite(Date.parse(`${set.blockingFrom}T00:00:00Z`))) throw new Error(`engine ${engine}: blockingFrom must be a date, YYYY-MM-DD, not ${JSON.stringify(set.blockingFrom)}`);
    if (at.getTime() >= Date.parse(`${set.blockingFrom}T00:00:00Z`)) return { level: "blocking" };
    return { level: "informing", blockingFrom: set.blockingFrom };
  }
  return { level: "informing" };
}

/** Every engine's level on `at`, for the report: what this run treated as informing, and until when. */
export function levelsOn(at: Date, table: EngineLevels = ENGINE_LEVELS): Record<string, EngineLevel> {
  return Object.fromEntries(Object.keys(table).map((engine) => [engine, levelOn(engine, at, table)]));
}

/**
 * The hunks as the Gate is to see them on `at`: a failing hunk of an informing engine becomes informational and says
 * so (`level: "informing"`, and `blockingFrom` when set). Everything else is returned as it was, the same object, so a
 * run whose engines are all blocking is exactly the run it was before levels existed.
 */
export function applyLevels(hunks: Hunk[], at: Date, table: EngineLevels = ENGINE_LEVELS): Hunk[] {
  return hunks.map((h) => {
    if (h.severity !== "fail") return h;
    const level = levelOn(h.artefact, at, table);
    if (level.level === "blocking") return h;
    return { ...h, severity: "info", level: "informing", ...(level.blockingFrom ? { blockingFrom: level.blockingFrom } : {}) };
  });
}

/** The hunks reported as informing, and whether a claim covers each: what the report's Informing section lists. */
export const isInforming = (h: Pick<Hunk, "level">) => h.level === "informing";

/** One line for people: which engines are informing on this run, or that every engine blocks. */
export function levelsLine(levels: Record<string, EngineLevel> | undefined): string {
  if (!levels) return "";
  const informing = Object.entries(levels).filter(([, l]) => l.level === "informing");
  const total = Object.keys(levels).length;
  if (!informing.length) return `Every engine is blocking (${total} of ${total}).`;
  return `${total - informing.length} of ${total} engines are blocking; informing (reported, never gates): ${informing.map(([e, l]) => `${e}${l.blockingFrom ? ` (blocking from ${l.blockingFrom})` : " (no date set to block)"}`).join(", ")}.`;
}
