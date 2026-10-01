/**
 * The release-size control chart and the WIP limit on the readiness page (since 1.19.0): how many pull requests each past
 * release of the monorepo carried, the limits of what is usual for this project, and where the batch waiting on main sits
 * against them. Small, regular releases are easier to judge and to roll back; the chart says when the batch is getting
 * big enough that the next release should be cut.
 *
 * An XmR (individuals and moving range) chart, the Shewhart chart for one count per release:
 *
 *   centre line  the mean release size, x̄
 *   mR̄           the mean of the moving ranges |xᵢ − xᵢ₋₁|
 *   UCL          x̄ + 2.66 × mR̄          (2.66 = 3 / d₂, d₂ = 1.128 for ranges of two)
 *   LCL          max(0, x̄ − 2.66 × mR̄)  (a release cannot hold fewer than none)
 *
 * A release above the UCL or below the LCL is a special cause: something other than the usual variation made it that
 * size. With fewer than {@link PROVISIONAL_BELOW} releases the limits are provisional, and the WIP limit is the centre line
 * rather than the UCL, so a short history never licenses a big batch.
 *
 * The WIP limit on unreleased PRs on main, in three zones, always named in words beside the colour:
 *   below the centre line  (count ≤ x̄)            keep merging
 *   a good time to release (x̄ < count ≤ the limit) amber
 *   release now            (count > the limit)     red
 *
 * Pure. Advisory like the rest of the page: nothing here is an input to the Gate, a verdict or an exit code.
 */
import type { ReleaseHistory, ReleaseSize } from "./releases.ts";

/** 3 / d₂ for a moving range of two (d₂ = 1.128). */
export const XMR_FACTOR = 2.66;
/** Releases needed before the limits stop being provisional. */
export const PROVISIONAL_BELOW = 10;

export interface XmrLimits {
  /** Releases the limits were computed from. */
  n: number;
  /** The centre line: the mean release size. */
  centre: number;
  /** The mean moving range. */
  mrBar: number;
  ucl: number;
  lcl: number;
  /** Fewer than {@link PROVISIONAL_BELOW} releases: the limits will move as releases are added. */
  provisional: boolean;
}

export type ZoneId = "below centre" | "release soon" | "release now";

export interface WipZone {
  zone: ZoneId;
  /** The tone the page draws it in; never shown without `label`. */
  tone: "green" | "amber" | "red";
  label: string;
  /** One sentence: the count against the line it crossed. */
  words: string;
}

export type SpecialCause = "above UCL" | "below LCL";

export interface ControlNight {
  /** The UTC date of the forecast, YYYY-MM-DD. */
  night: string;
  ranAt: string;
  /** Unreleased PRs on main when the forecast judged it: changes.json's PRs since production. */
  prs: number;
  /** Production, the tag the count starts from. */
  baseline: string;
  candidate: string;
  zone: ZoneId | null;
}

export interface Control {
  /** What each point counts. */
  unit: "merged PRs";
  /** Past releases, oldest first, each flagged when it falls outside the limits. */
  releases: (ReleaseSize & { special: SpecialCause | null })[];
  /** Null with fewer than two releases: no moving range, no limits. */
  limits: XmrLimits | null;
  /** The UCL, or the centre line while the limits are provisional; null without limits. */
  wipLimit: number | null;
  /** The batch on main not yet released. */
  current: {
    prs: number;
    /** The release it counts from. */
    since: string;
    head: string;
    at: string;
    /** releases.json (GitHub, when the pages were built) or the newest kept forecast's changes.json. */
    from: "github" | "forecast";
    zone: WipZone | null;
    special: SpecialCause | null;
  } | null;
  /** The unreleased count night by night, oldest first, from the kept forecasts. */
  nights: ControlNight[];
  /** What the release history said about itself: when it was read, or why not. */
  source: string;
  /** One sentence for the top of the page. */
  summary: string;
}

const round2 = (x: number) => Math.round(x * 100) / 100;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/** A limit as the page prints it: one decimal, no trailing ".0". */
export const fmt = (x: number) => String(Math.round(x * 10) / 10);

/** The XmR limits of a series of release sizes, oldest first; null with fewer than two (no moving range). */
export function xmr(values: number[]): XmrLimits | null {
  if (values.length < 2) return null;
  const centre = sum(values) / values.length;
  const ranges = values.slice(1).map((v, i) => Math.abs(v - values[i]!));
  const mrBar = sum(ranges) / ranges.length;
  return { n: values.length, centre: round2(centre), mrBar: round2(mrBar), ucl: round2(centre + XMR_FACTOR * mrBar), lcl: round2(Math.max(0, centre - XMR_FACTOR * mrBar)), provisional: values.length < PROVISIONAL_BELOW };
}

/** The WIP limit: the UCL, or the centre line while the limits are provisional. */
export const wipLimitOf = (l: XmrLimits): number => (l.provisional ? l.centre : l.ucl);

export function specialCause(prs: number, l: XmrLimits | null): SpecialCause | null {
  if (!l) return null;
  if (prs > l.ucl) return "above UCL";
  if (prs < l.lcl) return "below LCL";
  return null;
}

/** Where an unreleased count sits against the limits, in words. */
export function wipZone(prs: number, l: XmrLimits): WipZone {
  const limit = wipLimitOf(l);
  const limitName = l.provisional ? `the WIP limit (the centre line, ${fmt(limit)}, while the limits are provisional)` : `the WIP limit (UCL ${fmt(limit)})`;
  const n = plural(prs, "unreleased PR");
  if (prs <= l.centre) return { zone: "below centre", tone: "green", label: "Below the centre line", words: `${n}: no more than a usual release (${fmt(l.centre)}). Keep merging.` };
  if (prs <= limit) return { zone: "release soon", tone: "amber", label: "A good time to release", words: `${n}: more than a usual release (${fmt(l.centre)}), within ${limitName}. A good time to release.` };
  return { zone: "release now", tone: "red", label: "Release now", words: `${n}: over ${limitName}. Release now: the batch is bigger than this project's releases usually are.` };
}

export interface ControlInputs {
  /** releases.json, when it was read. */
  history?: ReleaseHistory;
  /** Why it was not read, or when it was. */
  source: string;
  /** Every kept forecast with a count: when it ran, the count and what it counted from. */
  forecasts: { ranAt: string; prs: number; baseline: string; candidate: string; head: string | null }[];
}

export function buildControl(i: ControlInputs): Control {
  const releases = [...(i.history?.releases ?? [])].sort((a, b) => Date.parse(a.releasedAt) - Date.parse(b.releasedAt) || 0);
  const limits = xmr(releases.map((r) => r.prs));
  const wipLimit = limits ? wipLimitOf(limits) : null;
  const zoneOf = (prs: number) => (limits ? wipZone(prs, limits) : null);

  // Night by night: the newest kept forecast of each UTC night.
  const byNight = new Map<string, ControlInputs["forecasts"][number]>();
  for (const f of [...i.forecasts].sort((a, b) => Date.parse(a.ranAt) - Date.parse(b.ranAt))) byNight.set(f.ranAt.slice(0, 10), f);
  const nights: ControlNight[] = [...byNight.entries()].map(([night, f]) => ({ night, ranAt: f.ranAt, prs: f.prs, baseline: f.baseline, candidate: f.candidate, zone: zoneOf(f.prs)?.zone ?? null }));

  const u = i.history?.unreleased;
  const newest = [...i.forecasts].sort((a, b) => Date.parse(b.ranAt) - Date.parse(a.ranAt))[0];
  const current: Control["current"] = u
    ? { prs: u.prs, since: u.base, head: u.head, at: u.headDate, from: "github", zone: zoneOf(u.prs), special: specialCause(u.prs, limits) }
    : newest
      ? { prs: newest.prs, since: newest.baseline, head: newest.head ?? newest.candidate, at: newest.ranAt, from: "forecast", zone: zoneOf(newest.prs), special: specialCause(newest.prs, limits) }
      : null;

  const flagged = releases.map((r) => ({ ...r, special: specialCause(r.prs, limits) }));
  const outside = flagged.filter((r) => r.special);
  const summary = !limits
    ? `${releases.length ? `Only ${plural(releases.length, "release")} measured` : "No release history read"}: no limits yet${current ? `; ${plural(current.prs, "PR")} on main not yet released` : ""}.`
    : `${current ? `${current.zone!.label}: ${plural(current.prs, "PR")} on main since ${current.since}, against a centre line of ${fmt(limits.centre)} and a WIP limit of ${fmt(wipLimit!)}.` : "No count of what is on main."} ${limits.provisional ? `Limits provisional: ${plural(limits.n, "release")} measured, ${PROVISIONAL_BELOW} needed.` : `Limits from ${plural(limits.n, "release")}.`}${outside.length ? ` ${plural(outside.length, "release")} outside the limits (special cause): ${outside.map((r) => `${r.tag} (${r.prs})`).join(", ")}.` : ""}`;
  return { unit: "merged PRs", releases: flagged, limits, wipLimit, current, nights, source: i.source, summary };
}
