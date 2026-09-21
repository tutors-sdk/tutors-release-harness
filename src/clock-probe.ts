/**
 * Does the app honour HARNESS_NOW? (docs/harness-now.md)
 *
 * The harness freezes the browser's clock, so any instant a page shows that is
 * close to the real time of the capture, and not to the frozen instant, was
 * stamped by the server (or came from data the server stamped). That needs no
 * change to the app: read the instants out of what was already captured and
 * see which clock they belong to.
 *
 * The `Date` response header is deliberately not evidence: Node sets it on
 * every response whatever the app does, and it is masked for that reason. The
 * probe reads the other headers that carry a server-stamped date
 * (`last-modified`, `expires`) and the text of every page.
 *
 * Pure: no I/O, no clock of its own. Not wired into the report yet.
 */
import type { SideCapture } from "./types.ts";

export type ClockVerdict =
  /** Every server-stamped instant found is the frozen one. */
  | "honours"
  /** At least one instant is the real time of the capture and not the frozen one. */
  | "ignores"
  /** Instants were found but none can be told apart (the frozen instant is within tolerance of the capture). */
  | "indistinguishable"
  /** Nothing in the capture carries a server-stamped instant: the probe has no evidence either way. */
  | "no-evidence";

export interface ClockSample {
  /** Where it was seen: `<journey>/<pageKey> aria` or `<journey>/<pageKey> header last-modified`. */
  where: string;
  /** The text matched. */
  text: string;
  epochMs: number;
  clock: "frozen" | "wall-clock" | "other";
}

export interface ClockProbe {
  verdict: ClockVerdict;
  frozenNow: string;
  samples: ClockSample[];
}

/** `2026-09-16T09:05:00Z`, `2026-09-16 09:05:00.123+00:00`; a date-only string is matched to the day. */
const INSTANT = /\b(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?\s?(Z|[+-]\d{2}:?\d{2})?)?\b/g;

const DEFAULT_TOLERANCE_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function parse(match: RegExpExecArray): { epochMs: number; dateOnly: boolean } | undefined {
  const [, y, mo, d, h, mi, s, zone] = match;
  const dateOnly = h === undefined;
  const iso = `${y}-${mo}-${d}T${h ?? "00"}:${mi ?? "00"}:${s ?? "00"}${zone ? (zone === "Z" ? "Z" : zone.length === 5 ? `${zone.slice(0, 3)}:${zone.slice(3)}` : zone) : "Z"}`;
  const epochMs = Date.parse(iso);
  return Number.isNaN(epochMs) ? undefined : { epochMs, dateOnly };
}

/**
 * Classify the instants in one side's capture.
 *
 * `toleranceMs` (default 30 minutes) is how close an instant must be to the
 * frozen instant or to the capture's real time to count as belonging to it; a
 * date-only string is matched to the UTC day instead. The real time of the
 * capture is the capture's `capturedAt`.
 */
export function probeClock(capture: SideCapture, frozenNow: string, opts: { toleranceMs?: number } = {}): ClockProbe {
  const tolerance = opts.toleranceMs ?? DEFAULT_TOLERANCE_MS;
  const frozen = Date.parse(frozenNow);
  const wall = Date.parse(capture.capturedAt);
  if (Number.isNaN(frozen)) throw new Error(`frozen instant is not a date: ${frozenNow}`);
  if (Number.isNaN(wall)) throw new Error(`capturedAt is not a date: ${capture.capturedAt}`);

  const near = (epochMs: number, target: number, dateOnly: boolean) => (dateOnly ? Math.floor(epochMs / DAY_MS) === Math.floor(target / DAY_MS) : Math.abs(epochMs - target) <= tolerance);
  const samples: ClockSample[] = [];
  const scan = (where: string, text: string) => {
    for (const match of text.matchAll(INSTANT)) {
      const parsed = parse(match as RegExpExecArray);
      if (!parsed) continue;
      const isFrozen = near(parsed.epochMs, frozen, parsed.dateOnly);
      const isWall = near(parsed.epochMs, wall, parsed.dateOnly);
      // An instant near both clocks says nothing; one near neither is data (a course's start date), not a clock.
      if (isFrozen && isWall) continue;
      samples.push({ where, text: match[0], epochMs: parsed.epochMs, clock: isFrozen ? "frozen" : isWall ? "wall-clock" : "other" });
    }
  };

  let ambiguous = false;
  for (const journey of capture.journeys) {
    for (const page of journey.pages) {
      const here = `${journey.journey}/${page.pageKey}`;
      scan(`${here} aria`, page.aria);
      for (const name of ["last-modified", "expires"]) {
        const value = page.headers[name];
        if (!value) continue;
        const epochMs = Date.parse(value);
        if (Number.isNaN(epochMs)) continue;
        const isFrozen = Math.abs(epochMs - frozen) <= tolerance;
        const isWall = Math.abs(epochMs - wall) <= tolerance;
        if (isFrozen && isWall) ambiguous = true;
        else samples.push({ where: `${here} header ${name}`, text: value, epochMs, clock: isFrozen ? "frozen" : isWall ? "wall-clock" : "other" });
      }
    }
  }
  if (Math.abs(frozen - wall) <= tolerance) ambiguous = true;

  const wallClock = samples.some((s) => s.clock === "wall-clock");
  const frozenSeen = samples.some((s) => s.clock === "frozen");
  const verdict: ClockVerdict = wallClock ? "ignores" : frozenSeen ? "honours" : ambiguous ? "indistinguishable" : "no-evidence";
  return { verdict, frozenNow, samples: samples.filter((s) => s.clock !== "other") };
}
