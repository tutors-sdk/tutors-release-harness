/**
 * The vocabulary of the harness. Everything captured, normalised, compared,
 * claimed and reported is one of these shapes.
 */

export type SideName = "a" | "b";

/** Every kind of thing the harness captures or rehearses. Claims and masks name these. */
export const ARTEFACTS = ["dom", "screenshot", "network", "console", "headers", "axe", "focus", "metrics", "logs", "timing", "persistence", "migration", "upgrade"] as const;
export type Artefact = (typeof ARTEFACTS)[number];

export const MODES = ["noise", "release", "any-two", "upgrade", "migration", "post-deploy"] as const;
export type Mode = (typeof MODES)[number];

export const SUBSTRATES = ["compose", "kind"] as const;
export type Substrate = (typeof SUBSTRATES)[number];

/** Where one side's services answer. Journeys are parameterised by this and nothing else. */
export interface StackUrls {
  reader: string;
  catalogue: string;
  live: string;
  /** The reader configured for sign-in (identity + persistence stubs); absent for an external side. */
  readerAuth?: string;
  /** The side's persistence stub, when it has one. */
  persistence?: string;
  /** A course id the reader resolves to http(s)://<id>/tutors.json. */
  courseId: string;
}

export interface SideSpec {
  name: SideName;
  /** Image references per app, as passed to compose. */
  images: { reader: string; catalogue: string; live: string };
  urls: StackUrls;
  /** Where the images came from; filled in by `run` before the stack starts. */
  provenance?: SideProvenance;
  /** True when the side is a live deployment the harness did not start (post-deploy mode). */
  external?: boolean;
}

// ---- image provenance ----------------------------------------------------------

/**
 * How an image came to be on this machine, which is how far it can be trusted:
 *   local              present and never pulled (a `docker compose build`, a mutant): not verified, by design
 *   pulled+verified    pulled from a registry and its cosign signature checked against the publishing workflow's identity
 *   pulled-unverified  pulled from a registry and NOT verified; only ever under --allow-unsigned
 *   built-from-ref     built here from a monorepo git ref because the registry had no such tag
 *   cached             restored from the runner's image cache because the registry could not be reached; it was
 *                      pulled and verified on an earlier run, but the tag's freshness is unconfirmed (since 1.2.0)
 */
export const PROVENANCES = ["local", "pulled+verified", "pulled-unverified", "built-from-ref", "cached"] as const;
export type Provenance = (typeof PROVENANCES)[number];

/** What the harness knows about one image it ran. */
export interface ImageInfo {
  /** The reference as given on the command line (or expanded from the tag). */
  ref: string;
  /** The local image id (`sha256:…` of the config). */
  id?: string;
  /** The registry digest of the manifest (`sha256:…`), for a pulled image. */
  digest?: string;
  /** `org.opencontainers.image.revision`: the monorepo commit the image was built from. */
  revision?: string;
  /** `org.opencontainers.image.version`. */
  version?: string;
  /** `org.opencontainers.image.created`. */
  created?: string;
  provenance: Provenance;
  /** The signing identity a verified image was checked against. */
  verifiedIdentity?: string;
  /** Why a pulled image is unverified. */
  unverifiedReason?: string;
  /** For built-from-ref: the git ref and the commit it resolved to. */
  builtFrom?: { ref: string; sha?: string };
  /** For cached: when the cache entry was saved (the earlier run that pulled and verified it). */
  cachedAt?: string;
}

export interface SideProvenance {
  /** One line for the report header, e.g. `pulled+verified` or `built-from-ref v16.2.0@1a2b3c4`. */
  summary: string;
  /** True when the run was allowed to judge unverified registry images. */
  allowedUnsigned?: boolean;
  images: Record<"reader" | "catalogue" | "live", ImageInfo>;
}

// ---- captured artefacts ------------------------------------------------------

export interface NetworkEntry {
  method: string;
  /** Path and query with the side's own origin replaced by {{origin}} and the course host by {{course}}. */
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
  /** Response headers of the document request; empty after a client-side route change. */
  headers: Record<string, string>;
  network: NetworkEntry[];
  console: ConsoleEntry[];
  axe: AxeFinding[];
  /** Keyboard order: what receives focus on each successive Tab from the top of the page. */
  focus: string[];
  timing: Timing;
}

export interface PersistenceWrite {
  kind: "write" | "rpc";
  method: string;
  table: string;
  rows: number;
}

export interface JourneyCapture {
  journey: string;
  run: number;
  /** True when the journey ran without a session; any persistence write is then a finding. */
  anonymous: boolean;
  durationMs: number;
  pages: PageCapture[];
  /** What the side's persistence stub recorded during this journey (empty when the side has no stub). */
  persistence: PersistenceWrite[];
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

/** One k6 run against a side. */
export interface LoadSummary {
  requests: number;
  failed: number;
  /** Count of responses with status >= 500. */
  serverErrors: number;
  /** http_req_duration samples in ms (subsampled to at most `maxSamples`). */
  samples: number[];
  p50: number;
  p95: number;
  rate: number;
  duration: string;
}

/** Which harness produced a report or a capture. */
export interface HarnessInfo {
  /** `version` in the harness's package.json. */
  version: string;
  /** Commit of the harness checkout, or null when it is not a git checkout and HARNESS_GIT_SHA is unset. */
  gitSha: string | null;
  /** Version of the integration contract (docs/contract.md) the harness implements. */
  contractVersion: string;
}

export interface SideCapture {
  side: SideName;
  /** Absent only in captures written before contract 1.0.0. */
  harness?: HarnessInfo;
  images: SideSpec["images"];
  /** Where those images came from and what they say about themselves; absent for an external or recorded-before-R1 side. */
  provenance?: SideProvenance;
  capturedAt: string;
  /** A live deployment rather than a harness stack: latency and load are not comparable with a laptop's. */
  external?: boolean;
  journeys: JourneyCapture[];
  metrics: { before: Record<string, MetricsSnapshot>; after: Record<string, MetricsSnapshot> };
  logs: Record<string, LogSummary>;
  load?: LoadSummary;
}

// ---- schema catalogue (migration mode) -------------------------------------------

export interface ColumnInfo {
  type: string;
  nullable: boolean;
  default: string | null;
}

export interface SchemaCatalog {
  tables: Record<string, Record<string, ColumnInfo>>;
  indexes: string[];
  functions: string[];
  policies: string[];
}

export interface MigrationResult {
  a: { ref: string; files: string[]; catalog: SchemaCatalog };
  b: { ref: string; files: string[]; catalog: SchemaCatalog };
  /** Catalog after restoring a's snapshot over b's schema: the rollback rehearsal. */
  rolledBack: SchemaCatalog;
}

// ---- upgrade rehearsal -----------------------------------------------------------------

export interface UpgradeResult {
  substrate: Substrate;
  /** Every request the load generator made, attributed to the side that answered it. */
  requests: number;
  failed: number;
  serverErrors: number;
  byUpstream: Record<string, { requests: number; failed: number; serverErrors: number; p95: number }>;
  switchedAt: number;
  durationMs: number;
}

// ---- comparison ----------------------------------------------------------------

/** A single observable difference between the two sides. */
export interface Hunk {
  id: string;
  artefact: Artefact;
  /** What a claim's scope glob is matched against: a page key, a route, a series name, a header, a table.column. */
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
  /** The contract's major version; absent in files written before contract 1.0.0. */
  schemaVersion?: number;
  /** ISO timestamp of the noise run this status describes. */
  ranAt: string;
  clean: boolean;
  hunks: number;
  /**
   * Since 1.2.0. Why this A/A is weak evidence even at `hunks: 0`: an image was not
   * pulled and signature-verified in the run (a registry outage was survived from cache,
   * or an image was built locally). Absent or empty means nothing was wrong with the evidence.
   * The gate never trusts a status that carries reasons here.
   */
  degraded?: string[];
}

export interface RunReport {
  /** The contract's major version (docs/contract.md). A reader should refuse a value it does not know. */
  schemaVersion: number;
  harness: HarnessInfo;
  /** Same as harness.version; kept for readers of pre-contract reports. */
  harnessVersion: string;
  mode: Mode;
  substrate: Substrate;
  ranAt: string;
  now: string;
  runs: number;
  sides: { a: SideSpec["images"]; b: SideSpec["images"] };
  /** Per-side image provenance, digests and OCI labels; shown in the report header. */
  provenance?: { a?: SideProvenance; b?: SideProvenance };
  verdict: Verdict;
  /** Why the verdict is what it is, in one line each. */
  reasons: string[];
  /** The last noise status consulted for a gating decision, if any. */
  noise?: NoiseStatus;
  compare: CompareResult;
  /** Masks that actually changed something in this run, by id, with a count. */
  masksApplied: Record<string, number>;
  migration?: MigrationResult;
  upgrade?: UpgradeResult;
  load?: { a: Omit<LoadSummary, "samples">; b: Omit<LoadSummary, "samples"> };
  /** Since 1.2.0. How broadly the claims cover; present whenever a claims file with claims was given. Informational: never changes the verdict. */
  claimHygiene?: ClaimHygiene;
  /** Since 1.2.0. Present only when an override of a harness FAIL was requested (`--override-reason`): a recorded event, not a verdict. */
  override?: OverrideRecord;
}

/** Why a claim was flagged for review. */
export type ClaimFlag = "covers-many-hunks" | "broad-with-approval";

export interface FlaggedClaim {
  claim: Claim;
  /** Failing hunks this claim covers. */
  hunks: number;
  flags: ClaimFlag[];
}

export interface ClaimHygiene {
  /** Claims in the file. */
  claims: number;
  /** Failing hunks covered by some claim. */
  claimedHunks: number;
  /** claimedHunks / claims, to two decimals; 0 when there are no claims. */
  hunksPerClaim: number;
  /** The most failing hunks any one claim covers. */
  maxHunksPerClaim: number;
  /** The configured N: a claim covering more than this many hunks is flagged (`--claim-max-hunks`). */
  threshold: number;
  /** Claims a reviewer should look at twice. */
  flagged: FlaggedClaim[];
}

/**
 * A human's recorded decision to let a change through despite a harness FAIL.
 * The verdict stays `fail`; the exit code becomes 0 (`applied`), and the event
 * is in the report, the step summary and (in the workflows) an issue.
 */
export interface OverrideRecord {
  reason: string;
  by: string;
  /** The verdict the harness reached before the override. */
  verdict: Verdict;
  /** True when the verdict was fail and so the override changed the exit code; false when it was not needed. */
  applied: boolean;
  /** ISO instant the override was recorded. */
  at: string;
}
