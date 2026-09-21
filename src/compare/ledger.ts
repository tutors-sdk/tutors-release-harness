import type { Artefact, Hunk, JourneyCapture, SideCapture } from "../types.ts";
import { hunkId, journeyPairs } from "./pages.ts";

/**
 * The write-ledger rule, independent of what is being written to.
 *
 * A side's writes during a journey — rows in a table, messages on a topic —
 * are a ledger of (operation, target, count). Two rules apply to every
 * ledger, whatever the backend or transport that recorded it:
 *
 *   1. the sides must agree, by operation and target;
 *   2. an anonymous journey must write nothing: a write on side b is a failing
 *      hunk (an info hunk when a made it too, because then it is a product
 *      finding rather than a release diff).
 *
 * The persistence engine and the bus engine are two instances of it.
 */
export interface LedgerEntry {
  /** `POST`, `PATCH`, `RPC`, `PUBLISH`…: what was done. */
  operation: string;
  /** The table, collection or topic it was done to. */
  target: string;
  /** Rows or messages; at least 1 (an entry is an event). */
  count: number;
  /** Whether the rule for anonymous journeys counts this as a write. Reads and RPC calls do not. */
  isWrite: boolean;
}

export interface LedgerSpec {
  artefact: Artefact;
  /** The unit a count is in, for summaries: `row(s)`, `message(s)`. */
  unit: string;
  /** The past tense of what the anonymous rule forbids: `wrote`, `published`. */
  anonymousVerb: string;
  /** The ledger of one journey capture, or undefined when that side did not collect one. */
  entries(journey: JourneyCapture): LedgerEntry[] | undefined;
}

function tally(entries: LedgerEntry[]): Map<string, { operation: string; target: string; count: number; isWrite: boolean }> {
  const map = new Map<string, { operation: string; target: string; count: number; isWrite: boolean }>();
  for (const e of entries) {
    const key = `${e.operation} ${e.target}`;
    const seen = map.get(key);
    if (seen) seen.count += Math.max(1, e.count);
    else map.set(key, { operation: e.operation, target: e.target, count: Math.max(1, e.count), isWrite: e.isWrite });
  }
  return map;
}

/** Diff two sides' ledgers journey by journey (first run only) under both rules. */
export function ledgerHunks(a: SideCapture, b: SideCapture, spec: LedgerSpec): Hunk[] {
  const hunks: Hunk[] = [];
  for (const pair of journeyPairs(a, b)) {
    if (pair.a.run !== 1) continue;
    const ea = spec.entries(pair.a);
    const eb = spec.entries(pair.b);
    if (!ea && !eb) continue;
    const ta = tally(ea ?? []);
    const tb = tally(eb ?? []);
    const keys = new Set([...ta.keys(), ...tb.keys()]);
    for (const key of [...keys].sort()) {
      const entryA = ta.get(key);
      const entryB = tb.get(key);
      const ca = entryA?.count ?? 0;
      const cb = entryB?.count ?? 0;
      const { operation, target, isWrite } = (entryB ?? entryA)!;
      const scope = `${pair.a.journey}/${target}`;
      if (pair.a.anonymous && isWrite && cb > 0) {
        // The anonymous rule, regardless of what a did.
        const also = ca > 0 ? ` (also ${ca} on a: a product finding, not a release diff)` : "";
        hunks.push({ id: hunkId(spec.artefact, scope), artefact: spec.artefact, scope, severity: ca > 0 ? "info" : "fail", summary: `${pair.a.journey}: anonymous journey ${spec.anonymousVerb} ${cb} ${spec.unit} to ${target} (${operation}) on b${also}` });
        continue;
      }
      if (ca === cb) continue;
      hunks.push({
        id: hunkId(spec.artefact, scope),
        artefact: spec.artefact,
        scope,
        severity: "fail",
        summary: `${pair.a.journey}: ${operation} ${target} — ${ca} ${spec.unit} on a, ${cb} on b`
      });
    }
  }
  return hunks;
}
