/**
 * The reviewer's glance (C3): gemba, go to the artefact and look. At most seven places, ranked, each a one-line finding
 * with a link straight to the hunk in the run's report.html, the claim that covers it and the PR that caused it, so a
 * Reviewer with fifteen minutes opens the artefact, not the summary, and records one mark per item (SOP step 8).
 *
 * The ranking is novelty × exposure, and it is written out in full so it can be reviewed too:
 *   novelty   how unusual the finding is against the last six releases on the scoreboard: (n − seen + 1) ÷ (n + 1),
 *             where n is the releases that recorded this kind of finding and `seen` those that had this one. 1 with
 *             no history ("no history yet"); never 0, so a finding seen every release still ranks, just lower.
 *   exposure  the share of the journey set the finding touches. A finding that cannot be placed on a journey
 *             (unmapped) counts as the whole set: what the harness cannot place is not ranked below what it can.
 *
 * Candidates, in the plan's order (the order breaks ties): broad claims, masks added this release, timing or load
 * p-values in 0.05-0.10, hotspots touched by a first contribution, persistence writes in a journey that wrote nothing
 * before, console errors or axe violations fixed on b, major dependency bumps, journeys whose duration moved > 20%.
 * A kind whose input the harness does not have is listed under `notChecked` with the reason, never made up.
 *
 * Advisory like the score: nothing here is an input to src/gate.ts, a verdict or an exit code. Pure: src/glance/read.ts
 * reads the files.
 */
import { MONOREPO_PULLS, isBroad, prsIn } from "../ci/scorecard.ts";
import { decisionsOf } from "../claims/decisions.ts";
import { claimLabel } from "../claims/rules.ts";
import type { Changes } from "../changes/signals.ts";
import { hunkAnchor, reportLink, type Located } from "../score/confidence.ts";
import { RULES } from "../score/weights.ts";
import type { ScoreboardLine } from "../scoreboard/line.ts";
import type { Claim, Hunk, JourneyCapture, RunReport, SideCapture } from "../types.ts";

export const GLANCE_KINDS = ["broad-claim", "mask-added", "near-miss", "first-time-hotspot", "new-persistence", "fixed-on-b", "major-bump", "duration-moved"] as const;
export type GlanceKind = (typeof GLANCE_KINDS)[number];

/** Seven places to look: the plan's "where to stop". Add one only when a 5 Whys shows an escape the seven could not surface. */
export const GLANCE_MAX = 7;
/** How far back novelty looks: the last six releases on the scoreboard. */
export const HISTORY_RELEASES = 6;
/** A journey whose median duration moved more than this share is a place to look, significant or not. */
export const DURATION_MOVED = 0.2;
/** The near-miss window of the statistical margin dimension (src/score/weights.ts), so the two never disagree. */
export const NEAR_MISS = { low: RULES.stats.nearMissLow, high: RULES.stats.nearMissHigh } as const;
/** How many candidate keys a scoreboard line keeps for the next release's novelty. */
export const SEEN_MAX = 200;

export const KIND_TITLES: Record<GlanceKind, string> = {
  "broad-claim": "Broad claim",
  "mask-added": "Mask added",
  "near-miss": "Near miss",
  "first-time-hotspot": "Hotspot, first contribution",
  "new-persistence": "New persistence write",
  "fixed-on-b": "Fixed on b",
  "major-bump": "Major bump",
  "duration-moved": "Duration moved"
};

export const MARK_WORDS = ["verified", "disputed", "escalated"] as const;
export type MarkWord = (typeof MARK_WORDS)[number];

/** What each mark means and what it turns into: the Reviewer's whole job is one of these three per item. */
export const MARK_MEANS: Record<MarkWord, { means: string; becomes: string }> = {
  verified: { means: "looked, and agrees with the claim", becomes: "counts towards go" },
  disputed: { means: "looked, and does not agree", becomes: "becomes a new claim or a hold" },
  escalated: { means: "cannot tell from the artefacts", becomes: "becomes a 5 Whys" }
};

export interface GlanceLinks {
  /** The hunk (or section) in the run's report.html, relative to confidence.json. */
  hunk?: string;
  /** The claim that covers it, as the report labels it. */
  claim?: string;
  /** The PR that caused it. */
  pr?: string;
  /** The file in that PR's diff (changes.json's evidence). */
  diff?: string;
}

export interface GlanceMark {
  mark: MarkWord;
  by: string;
  at: string;
  note?: string;
  becomes: string;
  /** Escalated: a 5 Whys is wanted (C4 opens it). */
  whyWanted?: true;
}

export interface GlanceItem {
  rank: number;
  kind: GlanceKind;
  /** What makes this finding the same finding in another release: novelty reads it off the scoreboard. */
  key: string;
  finding: string;
  links: GlanceLinks;
  /** Every hunk it stands for (a broad claim's absorbed hunks), when more than one. */
  hunks?: string[];
  /** The evidence side by side (both distributions, the messages fixed), when there is more to see than one line. */
  detail?: string;
  novelty: number;
  exposure: number;
  /** novelty × exposure, two decimals: the ranking. */
  score: number;
  /** Why each factor is what it is, in words, so the ranking can be reviewed. */
  basis: { novelty: string; exposure: string };
  /** The Reviewer's latest mark (glance-marks.jsonl), or null until there is one. */
  mark: GlanceMark | null;
}

export interface GlanceBasis {
  rule: string;
  /** The releases novelty read, oldest first, and where from. */
  history: { releases: string[]; source?: string; note?: string };
  /** The journey set exposure is a share of, and where it came from. */
  journeys: { total: number; names: string[]; source: string };
  /** Candidates found per checked kind (the seven shown are the top of these). */
  checked: { kind: GlanceKind; candidates: number }[];
  notChecked: { kind: GlanceKind; reason: string }[];
  /** Every candidate's `kind:key`, ranked or not (at most 200): what the scoreboard keeps for the next release's novelty. */
  seen: string[];
}

export interface Glance {
  items: GlanceItem[];
  basis: GlanceBasis;
}

type Capture = Pick<SideCapture, "journeys">;

export interface GlanceInputs {
  release?: Located<RunReport>;
  /** The two sides' capture.json beside the release run; `reason` says why one is missing. */
  captures?: { a?: Capture; b?: Capture; reason?: string };
  /** A whole changes.json (`harness changes`); `changesReason` says why there is none. */
  changes?: Changes;
  changesReason?: string;
  /** The scoreboard read for novelty; `historyReason` says why there is none. */
  history?: { lines: ScoreboardLine[]; source: string };
  historyReason?: string;
  /** The candidate tag: its own earlier runs are not history. */
  tag?: string;
  /** The harness's masks (normalise/masks.yaml), for a mask's reason. */
  masks?: Record<string, { artefact: string[]; reason: string }>;
}

// ---- helpers ------------------------------------------------------------------------------------------

const round2 = (x: number) => Math.round(x * 100) / 100;
const uniq = <T>(xs: T[]) => [...new Set(xs)];
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const short = (s: string, n = 100) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const failing = (h: Hunk) => h.severity === "fail";

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** A page key's first part is the app (or the signed-in reader) it was read from: `reader-auth:topic`. */
export const APP_OF_PREFIX: Record<string, string> = { reader: "reader", "reader-auth": "reader", reference: "reader", catalogue: "catalogue", live: "live", time: "time" };
const appOfFile = (path: string) => /^apps\/([^/]+)\//.exec(path)?.[1];

// ---- the journey set -------------------------------------------------------------------------------------

export interface JourneySet {
  names: string[];
  source: string;
  ofPage(pageKey: string): string[];
  ofApp(app: string): string[];
}

/** The journeys both sides ran (capture.json); without the captures, the page groups of the report's hunks stand in. */
export function journeySet(i: Pick<GlanceInputs, "captures" | "release">): JourneySet {
  const caps = [i.captures?.a, i.captures?.b].filter((c): c is Capture => !!c);
  if (caps.length) {
    const pages = new Map<string, Set<string>>();
    for (const c of caps)
      for (const j of c.journeys)
        for (const p of j.pages) {
          const s = pages.get(p.pageKey) ?? new Set<string>();
          s.add(j.journey);
          pages.set(p.pageKey, s);
        }
    const names = uniq(caps.flatMap((c) => c.journeys.map((j) => j.journey))).sort();
    const ofPage = (pk: string) => [...(pages.get(pk) ?? [])].sort();
    const ofApp = (app: string) => uniq([...pages].filter(([pk]) => APP_OF_PREFIX[pk.split(":")[0]!] === app).flatMap(([, js]) => [...js])).sort();
    return { names, source: "the journeys in the release run's a/ and b/ capture.json", ofPage, ofApp };
  }
  const groups = uniq((i.release?.data.compare.hunks ?? []).map((h) => h.scope.split("/")[0]!).filter((s) => s.includes(":")).map((s) => s.split(":")[0]!)).sort();
  if (!groups.length) return { names: [], source: i.release ? "no capture.json beside the release run and no page in its report: the journey set is unknown" : "no release run", ofPage: () => [], ofApp: () => [] };
  return {
    names: groups,
    source: "no capture.json beside the release run: the page groups of report.json's hunks (reader, reader-auth, …) stand in for journeys",
    ofPage: (pk) => (groups.includes(pk.split(":")[0]!) ? [pk.split(":")[0]!] : []),
    ofApp: (app) => groups.filter((g) => APP_OF_PREFIX[g] === app)
  };
}

/** The journeys a hunk belongs to, or null when it cannot be placed on one. */
export function hunkJourneys(h: Hunk, js: JourneySet): string[] | null {
  const head = h.scope.split("/")[0]!;
  const found = (xs: string[]) => (xs.length ? xs : null);
  if (h.artefact === "persistence" || h.artefact === "bus") return js.names.includes(head) ? [head] : null;
  if (head.includes(":")) return found(js.ofPage(head));
  if (js.names.includes(h.scope)) return [h.scope];
  // k6 drives the reader.
  if (h.scope.startsWith("load/")) return found(js.ofApp("reader"));
  const app = APP_OF_PREFIX[head];
  return app ? found(js.ofApp(app)) : null;
}

type Touched = string[] | { unmapped: string } | { exposure: number; why: string };

function exposureOf(t: Touched, js: JourneySet): { exposure: number; basis: string } {
  if (!Array.isArray(t) && "exposure" in t) return { exposure: t.exposure, basis: t.why };
  const n = js.names.length;
  if (!n) return { exposure: 1, basis: `${js.source}: counted as the whole set` };
  if (!Array.isArray(t) || !t.length) return { exposure: 1, basis: `unmapped (${Array.isArray(t) ? "no journey reaches it" : t.unmapped}): counted as all ${n} journeys, so what cannot be placed is not ranked below what can` };
  const hit = uniq(t).filter((j) => js.names.includes(j)).sort();
  return { exposure: round2(hit.length / n), basis: `${hit.length} of ${n} journeys: ${hit.join(", ")}` };
}

/** The union of the hunks' journeys; unmapped only when none of them can be placed. */
function touchedByHunks(hunks: Hunk[], js: JourneySet): Touched {
  const placed = hunks.map((h) => hunkJourneys(h, js));
  const hit = placed.flatMap((p) => p ?? []);
  return hit.length ? uniq(hit) : { unmapped: "not a page, a journey or an app the journeys drive" };
}

// ---- candidates -----------------------------------------------------------------------------------------

interface Candidate {
  kind: GlanceKind;
  key: string;
  finding: string;
  links: GlanceLinks;
  hunks?: string[];
  detail?: string;
  touched: Touched;
}

type Found = { candidates: Candidate[] } | { notChecked: string };

const NO_RELEASE = "no release-mode report.json (the release step did not run, or wrote no report)";

/** The claim a hunk matched, when one did. */
const claimOf = (r: RunReport, h: Hunk): Claim | undefined => r.compare.matches.find((m) => m.hunk.id === h.id)?.claim;

function prUrl(pr: number, changes?: Changes): string {
  const known = changes?.prs.find((p) => p.pr === pr)?.url;
  return known ?? (changes?.repo ? `https://github.com/${changes.repo}/pull/${pr}` : `${MONOREPO_PULLS}${pr}`);
}

/** The claim label and the first PR its reason names. */
function claimLinks(c: Claim | undefined, changes?: Changes): Pick<GlanceLinks, "claim" | "pr"> {
  if (!c) return {};
  const pr = prsIn(c.reason)[0];
  return { claim: `${c.artefact} ${c.scope}: ${claimLabel(c)}${c.approvedBy ? ` (approvedBy ${c.approvedBy})` : ""}`, ...(pr !== undefined ? { pr: prUrl(pr, changes) } : {}) };
}

function broadClaims(i: GlanceInputs, js: JourneySet): Found {
  if (!i.release) return { notChecked: NO_RELEASE };
  const { data: r, where } = i.release;
  const groups = new Map<string, { claim: Claim; hunks: Hunk[] }>();
  for (const m of r.compare.matches ?? []) {
    if (!m.claim || !isBroad(m.claim) || !failing(m.hunk)) continue;
    const key = `${m.claim.artefact} ${m.claim.scope}`;
    const g = groups.get(key) ?? { claim: m.claim, hunks: [] };
    g.hunks.push(m.hunk);
    groups.set(key, g);
  }
  for (const c of r.compare.broadUnapproved ?? []) if (!groups.has(`${c.artefact} ${c.scope}`)) groups.set(`${c.artefact} ${c.scope}`, { claim: c, hunks: [] });
  const candidates = [...groups].map(([key, g]): Candidate => {
    const who = g.claim.approvedBy ? `approvedBy ${g.claim.approvedBy}` : "no approvedBy";
    const anchors = g.hunks.map((h) => reportLink(where, hunkAnchor(h)));
    return {
      kind: "broad-claim",
      key,
      finding: `broad claim ${key} (${who}) absorbed ${plural(g.hunks.length, "hunk")}${g.hunks[0] ? `, first: ${short(g.hunks[0].summary, 80)}` : ""}`,
      links: { hunk: anchors[0] ?? reportLink(where, "broad-claims"), ...claimLinks(g.claim, i.changes) },
      ...(anchors.length > 1 ? { hunks: anchors } : {}),
      touched: g.hunks.length ? touchedByHunks(g.hunks, js) : { exposure: 0, why: "it absorbed no hunk in this run: it hides nothing yet" }
    };
  });
  return { candidates };
}

function masksAdded(i: GlanceInputs, window: ScoreboardLine[]): Found {
  if (!i.release) return { notChecked: NO_RELEASE };
  const prev = window.at(-1);
  if (!prev) return { notChecked: `no earlier release on the scoreboard to compare the masks with${i.historyReason ? ` (${i.historyReason})` : ""}` };
  if (!prev.maskIds) return { notChecked: `the last release on the scoreboard (${prev.tag}) did not record its mask ids (recorded since 1.12.0): the next release can compare` };
  const { data: r, where } = i.release;
  const before = new Set(prev.maskIds);
  const added = Object.keys(r.masksApplied ?? {}).filter((id) => !before.has(id)).sort();
  return {
    candidates: added.map((id): Candidate => {
      const hits = r.masksApplied[id] ?? 0;
      const def = i.masks?.[id];
      return {
        kind: "mask-added",
        key: id,
        finding: `mask ${id}${def ? ` (${def.artefact.join(", ")})` : ""} added since ${prev.tag}: it hid ${plural(hits, "value")} in this run`,
        links: { hunk: reportLink(where, "masks") },
        detail: `reason: ${def?.reason ?? "not in this harness's normalise/masks.yaml"}`,
        touched: hits ? { unmapped: "a mask's hits are not recorded per journey" } : { exposure: 0, why: "it hid nothing in this run: a mask that never fires is a mask to delete" }
      };
    })
  };
}

const UNJUDGED = /cannot reach alpha|need \d+ to judge/;
const P_VALUE = /\bp=([0-9.]+(?:e[-+]?\d+)?)/i;
const ms = (xs: number[]) => `${[...xs].sort((x, y) => x - y).map((x) => Math.round(x)).join(", ")} ms`;

/** Both distributions side by side, from the captures (journey durations or a page's TTFB), or k6's summary. */
function distributions(h: Hunk, i: GlanceInputs): string | undefined {
  const r = i.release!.data;
  if (h.scope.startsWith("load/") && r.load) return `k6 a: p50 ${r.load.a.p50} ms, p95 ${r.load.a.p95} ms, n=${r.load.a.requests} · b: p50 ${r.load.b.p50} ms, p95 ${r.load.b.p95} ms, n=${r.load.b.requests} (the report's load table)`;
  const a = i.captures?.a;
  const b = i.captures?.b;
  if (!a || !b) return undefined;
  const durations = (c: Capture) => c.journeys.filter((j) => j.journey === h.scope && !j.error).map((j) => j.durationMs);
  if (durations(a).length && durations(b).length) return `duration a: ${ms(durations(a))} · b: ${ms(durations(b))}`;
  const ttfb = (c: Capture) => c.journeys.flatMap((j) => j.pages).filter((p) => p.pageKey === h.scope && p.timing.ttfbMs >= 0).map((p) => p.timing.ttfbMs);
  if (ttfb(a).length && ttfb(b).length) return `TTFB a: ${ms(ttfb(a))} · b: ${ms(ttfb(b))}`;
  return undefined;
}

function nearMisses(i: GlanceInputs, js: JourneySet): Found {
  if (!i.release) return { notChecked: NO_RELEASE };
  const { data: r, where } = i.release;
  const candidates: Candidate[] = [];
  for (const h of (r.compare.hunks ?? []).filter((x) => x.artefact === "timing")) {
    if (UNJUDGED.test(h.summary)) continue;
    const m = P_VALUE.exec(h.summary);
    if (!m) continue;
    const p = Number(m[1]);
    if (p < NEAR_MISS.low || p > NEAR_MISS.high) continue;
    const claim = claimOf(r, h);
    const detail = distributions(h, i);
    candidates.push({
      kind: "near-miss",
      key: h.scope,
      finding: `${short(h.summary, 120)}: p=${m[1]}, within ${NEAR_MISS.low}-${NEAR_MISS.high} of significance${claim ? "" : ", unclaimed"}`,
      links: { hunk: reportLink(where, hunkAnchor(h)), ...claimLinks(claim, i.changes) },
      ...(detail ? { detail } : {}),
      touched: hunkJourneys(h, js) ?? { unmapped: "a timing scope no journey or page names" }
    });
  }
  return { candidates };
}

function firstTimeHotspots(i: GlanceInputs, js: JourneySet): Found {
  if (!i.changes) return { notChecked: i.changesReason ?? "no changes.json (harness changes, or harness release with --monorepo)" };
  const h = i.changes.signals.hotspots;
  if (h.status === "not measured") return { notChecked: `hotspots not measured: ${h.reason}` };
  const candidates = i.changes.prs
    .filter((p) => p.firstContribution && !p.release && p.hotspotsTouched.length)
    .map((p): Candidate => {
      const d = p.deductions.find((x) => x.rule === "hotspot");
      const name = p.pr !== null ? `PR #${p.pr}` : `commit ${p.sha.slice(0, 7)}`;
      const apps = uniq(p.hotspotsTouched.map(appOfFile).filter((a): a is string => !!a));
      const touched: Touched = apps.length ? uniq(apps.flatMap((a) => js.ofApp(a))) : { unmapped: `${p.hotspotsTouched[0]} is outside apps/, and a package's reach into the journeys is not mapped` };
      return {
        kind: "first-time-hotspot",
        key: d?.file ?? p.hotspotsTouched[0]!,
        finding: `${name}, a first contribution, touches ${p.hotspotsTouched.length === 1 ? "hotspot" : `${p.hotspotsTouched.length} hotspots`} ${p.hotspotsTouched.slice(0, 3).join(", ")}${p.hotspotsTouched.length > 3 ? ` and ${p.hotspotsTouched.length - 3} more` : ""}: "${short(p.title, 60)}"`,
        links: { ...(p.url ? { pr: p.url } : {}), ...(d ? { diff: d.evidence } : {}) },
        touched
      };
    });
  return { candidates };
}

const NO_CAPTURES = (i: GlanceInputs) => i.captures?.reason ?? "no a/ and b/ capture.json beside the release run";

/** Rows written per journey (all runs), and to which tables. Reads and RPC calls are not writes. */
function writesOf(c: Capture, journey: string): { rows: number; tables: string[]; ran: boolean } {
  const js = c.journeys.filter((j) => j.journey === journey);
  const ws = js.flatMap((j: JourneyCapture) => j.persistence.filter((w) => w.kind === "write"));
  return { rows: ws.reduce((n, w) => n + Math.max(1, w.rows), 0), tables: uniq(ws.map((w) => w.table)).sort(), ran: js.length > 0 };
}

function newPersistence(i: GlanceInputs): Found {
  const a = i.captures?.a;
  const b = i.captures?.b;
  if (!a || !b) return { notChecked: NO_CAPTURES(i) };
  const r = i.release?.data;
  const candidates: Candidate[] = [];
  for (const journey of uniq(b.journeys.map((j) => j.journey)).sort()) {
    const wa = writesOf(a, journey);
    const wb = writesOf(b, journey);
    if (!wa.ran || wa.rows > 0 || wb.rows === 0) continue;
    const h = r?.compare.hunks.find((x) => x.artefact === "persistence" && x.scope.startsWith(`${journey}/`));
    const claim = r && h ? claimOf(r, h) : undefined;
    candidates.push({
      kind: "new-persistence",
      key: journey,
      finding: `${journey} wrote nothing on a and ${plural(wb.rows, "row")} to ${wb.tables.join(", ")} on b${claim ? ", claimed" : h ? ", unclaimed" : ""}: a journey that starts writing is a behaviour change, even when claimed`,
      links: { ...(h && i.release ? { hunk: reportLink(i.release.where, hunkAnchor(h)) } : {}), ...claimLinks(claim, i.changes) },
      touched: [journey]
    });
  }
  return { candidates };
}

function fixedOnB(i: GlanceInputs, js: JourneySet): Found {
  if (!i.release) return { notChecked: NO_RELEASE };
  const { data: r, where } = i.release;
  // A fix on b is a decision (src/claims/decisions.ts). A claim records it and switches the item off, unless the same
  // page also has new failures of the same kind, when "fixed" may only mean "changed".
  const candidates = decisionsOf(r.compare)
    .filter((d) => !d.claim || d.fresh)
    .map((d): Candidate => {
      const h = d.hunks[0]!;
      const claim = d.claim;
      const what = h.artefact === "console" ? plural(d.hunks.length, "console error") : plural(d.hunks.length, "axe violation");
      const anchors = d.hunks.map((x) => reportLink(where, hunkAnchor(x)));
      const why = d.fresh ? `but ${plural(d.fresh, h.artefact === "console" ? "new console error" : "new axe violation")} on the same page: fixed, or only changed?` : "a fix is a decision: claim it to say why, and this item switches off";
      return {
        kind: "fixed-on-b",
        key: `${d.artefact} ${d.scope}`,
        finding: `${h.scope}: ${what} fixed on b, ${claim ? "decided" : "undecided"}; ${why}`,
        links: { hunk: anchors[0]!, ...claimLinks(claim, i.changes) },
        ...(anchors.length > 1 ? { hunks: anchors } : {}),
        detail: d.hunks.slice(0, 3).map((x) => short(h.artefact === "axe" ? x.summary.replace(/^.*fixed on b: /, "") : x.detail ?? x.summary, 90)).join(" | ") + (d.hunks.length > 3 ? ` | and ${d.hunks.length - 3} more` : ""),
        touched: touchedByHunks(d.hunks, js)
      };
    });
  return { candidates };
}

function majorBumps(i: GlanceInputs, js: JourneySet): Found {
  if (!i.changes) return { notChecked: i.changesReason ?? "no changes.json (harness changes, or harness release with --monorepo)" };
  const d = i.changes.signals.dependencies;
  if (d.status === "not measured") return { notChecked: `dependency movement not measured: ${d.reason}` };
  const candidates = d.majorBumps.map((b): Candidate => {
    const line = i.changes!.prs.find((p) => p.pr === b.pr && b.pr !== null);
    const ded = line?.deductions.find((x) => x.rule === "dependency" && x.why.includes(` ${b.name} `));
    const app = appOfFile(`${b.importer}/`);
    const where = b.importer === "." ? "the root" : b.importer;
    const reach = app ? js.ofApp(app) : [];
    const touched: Touched = app ? (reach.length ? reach : { unmapped: `no journey drives ${app}` }) : { unmapped: `${where} is not an app, and a package's reach into the journeys is not mapped` };
    return {
      kind: "major-bump",
      key: b.name,
      finding: `${b.name} ${b.from ?? "?"} → ${b.to} in ${where}${b.pr !== null ? ` (PR #${b.pr})` : ""}: a major bump; ${Array.isArray(touched) ? `journeys exercising ${app}: ${touched.join(", ")}` : `unmapped: ${touched.unmapped}`}`,
      links: { ...(b.pr !== null ? { pr: line?.url ?? prUrl(b.pr, i.changes) } : {}), ...(ded ? { diff: ded.evidence } : {}) },
      touched
    };
  });
  return { candidates };
}

function durationsMoved(i: GlanceInputs): Found {
  const a = i.captures?.a;
  const b = i.captures?.b;
  if (!a || !b) return { notChecked: NO_CAPTURES(i) };
  const r = i.release;
  const candidates: Candidate[] = [];
  const of = (c: Capture, j: string) => c.journeys.filter((x) => x.journey === j && !x.error).map((x) => x.durationMs);
  for (const journey of uniq(a.journeys.map((j) => j.journey)).sort()) {
    const xa = of(a, journey);
    const xb = of(b, journey);
    const ma = median(xa);
    const mb = median(xb);
    if (ma === null || mb === null || ma <= 0) continue;
    const moved = (mb - ma) / ma;
    if (Math.abs(moved) <= DURATION_MOVED) continue;
    const h = r?.data.compare.hunks.find((x) => x.artefact === "timing" && x.scope === journey);
    const judged = h ? (h.severity === "fail" ? "significant" : `not significant (${short(h.summary.replace(/^.*?(\(|;)/, "$1"), 60)})`) : "not judged by the timing engine (below its thresholds or runs)";
    candidates.push({
      kind: "duration-moved",
      key: journey,
      finding: `${journey}: median duration ${Math.round(ma)} ms → ${Math.round(mb)} ms (${moved > 0 ? "+" : ""}${Math.round(moved * 100)}%), ${judged}`,
      links: { ...(h && r ? { hunk: reportLink(r.where, hunkAnchor(h)) } : {}) },
      detail: `duration a: ${ms(xa)} · b: ${ms(xb)}`,
      touched: [journey]
    });
  }
  return { candidates };
}

const FINDERS: Record<GlanceKind, (i: GlanceInputs, js: JourneySet, window: ScoreboardLine[]) => Found> = {
  "broad-claim": (i, js) => broadClaims(i, js),
  "mask-added": (i, _js, w) => masksAdded(i, w),
  "near-miss": (i, js) => nearMisses(i, js),
  "first-time-hotspot": (i, js) => firstTimeHotspots(i, js),
  "new-persistence": (i) => newPersistence(i),
  "fixed-on-b": (i, js) => fixedOnB(i, js),
  "major-bump": (i, js) => majorBumps(i, js),
  "duration-moved": (i) => durationsMoved(i)
};

// ---- novelty -------------------------------------------------------------------------------------------

/** The last six releases before this one: each tag's latest line, in the order they were last appended; this tag's own runs left out. */
export function historyWindow(lines: ScoreboardLine[], tag?: string): ScoreboardLine[] {
  const latest = new Map<string, ScoreboardLine>();
  for (const l of lines) {
    if (l.tag === tag) continue;
    latest.delete(l.tag);
    latest.set(l.tag, l);
  }
  return [...latest.values()].slice(-HISTORY_RELEASES);
}

/**
 * Did an earlier release have this finding? From its glance record when that release checked the kind; else, for
 * a first contribution on a hotspot and an added mask, from the per-PR lines and mask ids it kept; else it cannot tell.
 */
export function seenIn(line: ScoreboardLine, kind: GlanceKind, key: string): boolean | undefined {
  if (line.glance?.checked.includes(kind)) return line.glance.seen.includes(`${kind}:${key}`);
  if (kind === "first-time-hotspot" && line.prs) return line.prs.some((p) => p.firstContribution && p.deductions.some((d) => d.rule === "hotspot" && d.file === key));
  if (kind === "mask-added" && line.maskIds) return line.maskIds.includes(key);
  return undefined;
}

export function noveltyOf(window: ScoreboardLine[], kind: GlanceKind, key: string): { novelty: number; basis: string } {
  const told = window.map((l) => ({ tag: l.tag, seen: seenIn(l, kind, key) })).filter((x) => x.seen !== undefined);
  if (!told.length) return { novelty: 1, basis: window.length ? `no history yet: none of the last ${plural(window.length, "release")} on the scoreboard recorded this kind` : "no history yet" };
  const seen = told.filter((x) => x.seen);
  const n = told.length;
  return { novelty: round2((n - seen.length + 1) / (n + 1)), basis: `seen in ${seen.length} of the last ${plural(n, "release")} that recorded it${seen.length ? ` (${seen.map((x) => x.tag).join(", ")})` : ""}` };
}

// ---- the glance -----------------------------------------------------------------------------------------

export const RANKING_RULE = `novelty × exposure, highest first, at most ${GLANCE_MAX}; ties in the plan's order (${GLANCE_KINDS.join(", ")}). Novelty is (n − seen + 1) ÷ (n + 1) over the last ${HISTORY_RELEASES} releases on the scoreboard that recorded the kind (1 with no history); exposure is the share of the journey set the finding touches (1 when it cannot be placed).`;

export function glance(i: GlanceInputs): Glance {
  const js = journeySet(i);
  const window = i.history ? historyWindow(i.history.lines, i.tag) : [];
  const checked: GlanceBasis["checked"] = [];
  const notChecked: GlanceBasis["notChecked"] = [];
  const all: (Candidate & { order: number })[] = [];
  GLANCE_KINDS.forEach((kind, order) => {
    const f = FINDERS[kind](i, js, window);
    if ("notChecked" in f) notChecked.push({ kind, reason: f.notChecked });
    else {
      checked.push({ kind, candidates: f.candidates.length });
      all.push(...f.candidates.map((c) => ({ ...c, order })));
    }
  });
  const scored = all.map((c) => {
    const n = noveltyOf(window, c.kind, c.key);
    const e = exposureOf(c.touched, js);
    return { c, novelty: n.novelty, exposure: e.exposure, score: round2(n.novelty * e.exposure), basis: { novelty: n.basis, exposure: e.basis } };
  });
  scored.sort((x, y) => y.score - x.score || x.c.order - y.c.order || y.exposure - x.exposure || x.c.key.localeCompare(y.c.key));
  const items = scored.slice(0, GLANCE_MAX).map(
    (s, n): GlanceItem => ({
      rank: n + 1,
      kind: s.c.kind,
      key: s.c.key,
      finding: s.c.finding,
      links: s.c.links,
      ...(s.c.hunks ? { hunks: s.c.hunks } : {}),
      ...(s.c.detail ? { detail: s.c.detail } : {}),
      novelty: s.novelty,
      exposure: s.exposure,
      score: s.score,
      basis: s.basis,
      mark: null
    })
  );
  const history: GlanceBasis["history"] = { releases: window.map((l) => l.tag), ...(i.history ? { source: i.history.source } : {}), ...(!i.history && i.historyReason ? { note: i.historyReason } : !window.length ? { note: "no earlier release on the scoreboard: novelty is 1 for every finding" } : {}) };
  return {
    items,
    basis: { rule: RANKING_RULE, history, journeys: { total: js.names.length, names: js.names, source: js.source }, checked, notChecked, seen: uniq(all.map((c) => `${c.kind}:${c.key}`)).slice(0, SEEN_MAX) }
  };
}
