/**
 * The vocabulary of the harness. Everything captured, normalised, compared,
 * claimed and reported is one of these shapes.
 */

export type SideName = "a" | "b";

/** Every kind of thing the harness captures. Claims and masks name these. */
export const ARTEFACTS = ["dom", "screenshot", "network", "console", "headers", "axe", "metrics", "logs", "timing"] as const;
export type Artefact = (typeof ARTEFACTS)[number];

export const MODES = ["noise", "release", "any-two", "upgrade", "migration", "post-deploy"] as const;
export type Mode = (typeof MODES)[number];

/** Where one side's apps answer. Journeys are parameterised by this and nothing else. */
export interface StackUrls {
  reader: string;
  catalogue: string;
  live: string;
  /** A course id the reader resolves to http://<id>/tutors.json. */
  courseId: string;
}

export interface SideSpec {
  name: SideName;
  /** Image references per app, as passed to compose. */
  images: { reader: string; catalogue: string; live: string };
  urls: StackUrls;
}

// ---- captured artefacts ------------------------------------------------------

export interface NetworkEntry {
  method: string;
  /** Path and query with the side's own origin replaced by {{origin}}. */
  url: string;
  status: number;
  contentType: string;
  cacheControl: string;
  /** Shape hash of a JSON body (keys and types, not values), or "" for non-JSON. */
  schemaHash: string;
}

export interface ConsoleEntry {
  level: "error" | "warning";
  text: string;
}

export interface AxeFinding {
  rule: string;
  impact: string;
  target: string;
}

export interface Timing {
  /** Time to first byte of the document request, from the browser's network stack; -1 for client-side route changes. */
  ttfbMs: number;
  /** Time to the last byte of the document request; -1 for client-side route changes. */
  responseEndMs: number;
}

export interface PageCapture {
  pageKey: string;
  /** Path of the page within the side (origin stripped). */
  path: string;
  /** Playwright aria snapshot of <body>: roles, names, text, structure. */
  aria: string;
  /** Relative path of the PNG within the capture directory, when taken. */
  screenshot?: string;
  /** Response headers of the document request. */
  headers: Record<string, string>;
  network: NetworkEntry[];
  console: ConsoleEntry[];
  axe: AxeFinding[];
  timing: Timing;
}

export interface JourneyCapture {
  journey: string;
  run: number;
  durationMs: number;
  pages: PageCapture[];
  /** Set when the journey did not complete; the pages captured so far are kept. */
  error?: string;
}

export interface MetricsSnapshot {
  /** Series name -> summed value over all label sets. */
  series: Record<string, number>;
}

export interface LogSummary {
  lines: number;
  jsonLines: number;
  byLevel: Record<string, number>;
  /** Every distinct top-level key seen in JSON lines. */
  keys: string[];
  /** Fraction of JSON lines that carry a request id. */
  requestIdRatio: number;
}

export interface SideCapture {
  side: SideName;
  images: SideSpec["images"];
  capturedAt: string;
  journeys: JourneyCapture[];
  metrics: { before: Record<string, MetricsSnapshot>; after: Record<string, MetricsSnapshot> };
  logs: Record<string, LogSummary>;
}

// ---- comparison ----------------------------------------------------------------

/** A single observable difference between the two sides. */
export interface Hunk {
  id: string;
  artefact: Artefact;
  /** What a claim's scope glob is matched against: a page key, a route, a series name, a header. */
  scope: string;
  /** The page's route, when the hunk belongs to a page; a claim's scope glob also matches this. */
  path?: string;
  summary: string;
  detail?: string;
  /**
   * fail: gates in gating modes unless claimed.
   * info: reported, never gates (an improvement, or a statistic without enough runs).
   */
  severity: "fail" | "info";
}

export interface Claim {
  artefact: Artefact | "*";
  scope: string;
  reason: string;
  /** Required for broad claims; set by a human, never generated. */
  approvedBy?: string;
}

export interface ClaimMatch {
  hunk: Hunk;
  claim?: Claim;
}

export interface CompareResult {
  hunks: Hunk[];
  matches: ClaimMatch[];
  unclaimed: Hunk[];
  staleClaims: Claim[];
  broadUnapproved: Claim[];
}

// ---- outcome -------------------------------------------------------------------

export type Verdict = "pass" | "fail" | "warn";

export interface NoiseStatus {
  /** ISO timestamp of the noise run this status describes. */
  ranAt: string;
  clean: boolean;
  hunks: number;
}

export interface RunReport {
  harnessVersion: string;
  mode: Mode;
  ranAt: string;
  now: string;
  runs: number;
  sides: { a: SideSpec["images"]; b: SideSpec["images"] };
  verdict: Verdict;
  /** Why the verdict is what it is, in one line each. */
  reasons: string[];
  /** The last noise status consulted for a gating decision, if any. */
  noise?: NoiseStatus;
  compare: CompareResult;
  /** Masks that actually changed something in this run, by id, with a count. */
  masksApplied: Record<string, number>;
}
