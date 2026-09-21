/**
 * The vocabulary of the harness. Everything captured, normalised, compared,
 * claimed and reported is one of these shapes.
 */

import type { AppImages } from "./image-ref.ts";
import type { ImageArtefactKind, ImageArtefactStatus, SideImageArtefacts, SideImageStatic } from "./image-static/types.ts";
import type { Digests } from "./digests.ts";

export type SideName = "a" | "b";

/** Every kind of thing the harness captures or rehearses. Claims and masks name these. */
export const ARTEFACTS = ["dom", "screenshot", "network", "console", "headers", "axe", "focus", "metrics", "logs", "timing", "persistence", "bus", "migration", "upgrade", /* R5 static image artefacts */ "image-manifest", "sbom", "vulns", /* R5 runtime artefacts */ "runtime", "startup"] as const;
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
  /**
   * The time app (contract 1.3.0). Absent for an external side that was given no `time=` URL. No journey
   * drives it (twelve journeys until a real regression escapes); it is here for the app-level collectors
   * (metrics, logs, startup, runtime, image artefacts) and for the origin every side's URLs are normalised by.
   */
  time?: string;
  /** The reader configured for sign-in (identity + persistence stubs); absent for an external side. */
  readerAuth?: string;
  /** The side's persistence stub, when it has one. */
  persistence?: string;
  /** A course id the reader resolves to http(s)://<id>/tutors.json. */
  courseId: string;
}

/**
 * A value per app as it is stored in a capture or a report: `time` is absent from those written before
 * contract 1.3.0, so a reader of one must tolerate its absence.
 */
export type PerApp<T> = Record<"reader" | "catalogue" | "live", T> & { time?: T };

export interface SideSpec {
  name: SideName;
  /** Image references per app, as passed to compose. */
  images: AppImages;
  urls: StackUrls;
  /** Where the images came from; filled in by `run` before the stack starts. */
  provenance?: SideProvenance;
  /** True when the side is a live deployment the harness did not start (post-deploy mode). */
  external?: boolean;
  /** R5: what the side's images are (manifest, SBOM, vulnerabilities), collected before the stack starts. */
  imageStatic?: SideImageStatic;
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
  images: PerApp<ImageInfo>;
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

/**
 * One write a side tried to persist, normalised: the same shape whatever
 * backend recorded it (see src/persistence/recorder.ts). `table` is the table
 * or collection; `method` is upper case (`POST`, `PATCH`, `DELETE`, `INSERT`…).
 */
export interface PersistenceWrite {
  kind: "write" | "rpc";
  method: string;
  table: string;
  rows: number;
}

/** One topic a side published to during a journey, normalised (see src/bus/transport.ts). */
export interface BusPublish {
  topic: string;
  /** How many messages were published to the topic. At least 1. */
  messages: number;
}

/** Whether a side's bus traffic was collected, and if not, why. Loud by design: recorded even when nothing was collected. */
export type BusStatus = { collected: true; transport: string } | { collected: false; reason: string };

export interface JourneyCapture {
  journey: string;
  run: number;
  /** True when the journey ran without a session; any persistence write is then a finding. */
  anonymous: boolean;
  durationMs: number;
  pages: PageCapture[];
  /** What the side's persistence stub recorded during this journey (empty when the side has no stub). */
  persistence: PersistenceWrite[];
  /** Topics the side published to during this journey; present only when the side's bus traffic was collected. */
  bus?: BusPublish[];
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
  images: PerApp<string>;
  /** Where those images came from and what they say about themselves; absent for an external or recorded-before-R1 side. */
  provenance?: SideProvenance;
  capturedAt: string;
  /** A live deployment rather than a harness stack: latency and load are not comparable with a laptop's. */
  external?: boolean;
  journeys: JourneyCapture[];
  metrics: { before: Record<string, MetricsSnapshot>; after: Record<string, MetricsSnapshot> };
  logs: Record<string, LogSummary>;
  load?: LoadSummary;
  /** Whether bus traffic was collected on this side; absent in captures written before the bus collector existed. */
  bus?: BusStatus;
  /** R5: static artefacts of the side's images. Absent for an external side, a migration run, or a capture recorded before contract 1.2.0. */
  imageStatic?: SideImageStatic;
  // ---- R5 runtime artefacts (contract 1.2.0): src/runtime/*, src/compare/runtime.ts
  /** What the side's containers are: identity, capabilities, filesystem, limits. Absent for an external side or a capture recorded before 1.2.0. */
  runtime?: RuntimeCapture | NotCollected;
  /** How long the side's apps take to come up after a restart. Same absence rules as `runtime`. */
  startup?: StartupCapture | NotCollected;
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
  /** Since 1.3.0. The Rule that intends the difference (`"0031"`), checked to exist in the rules file (`--rules`). */
  rule?: string;
  /** Since 1.3.0. That Rule's title in the rules file, which the report shows. Present exactly when `rule` is. */
  ruleTitle?: string;
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
  sides: { a: PerApp<string>; b: PerApp<string> };
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
  /** Since contract 1.2.0. Per side, per app: which static image artefacts were collected and, for those that were not, why. */
  imageArtefacts?: { a?: SideImageArtefacts; b?: SideImageArtefacts };
  /** Since contract 1.3.0. Post-deploy mode only, and only when the deploy said what it deployed: does it match what release mode judged? */
  deployment?: Deployment;
}

/** How what was deployed compares with the release record of the candidate that was judged. */
export type DeploymentStatus = "match" | "differs" | "incomplete" | "no-record" | "not-reported";

export interface Deployment {
  /** The production tag the deploy reported (`--deployed`, the `deployed` dispatch's `production`). */
  production?: string;
  status: DeploymentStatus;
  /** The digest of each deployed image, as the deploy reported it. */
  digests: Digests;
  /** The digests recorded when the candidate was judged; absent without a record. */
  recorded?: Digests;
  /** The release record consulted; absent when none was found. */
  record?: { candidate: string; judgedAt: string; verdict: Verdict };
  /** One line per disagreement or gap. Empty exactly when `status` is `match`. */
  problems: string[];
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

export type { ImageArtefactKind, ImageArtefactStatus, SideImageArtefacts };
// ---- R5 runtime artefacts: container posture and startup (contract 1.2.0) --------------
// Logic lives in src/runtime/ (collect) and src/compare/runtime.ts (compare).

/**
 * A collector that could not, or was told not to, produce its artefact. It is
 * kept in the capture and turned into a hunk: an artefact that silently goes
 * missing is a gate that quietly stops gating.
 */
export interface NotCollected {
  collected: false;
  /** Why, for people: "docker inspect exited 1: no such container". The report says `not collected: <reason>`. */
  reason: string;
  /** True when an operator asked for this (--no-runtime, --startup-restarts 0): informational, not a failure. */
  disabled?: boolean;
}

/** What a container is declared to be, and what it measurably is from inside. */
export interface ContainerPosture {
  // -- declared: docker inspect (compose) or the pod spec (kind) --
  /** `Config.User` / `securityContext.runAsUser`; "" when the image decides. */
  user: string;
  /** kind only: `runAsNonRoot`; null under compose. */
  runAsNonRoot: boolean | null;
  privileged: boolean;
  readOnlyRootfs: boolean;
  capAdd: string[];
  capDrop: string[];
  /** compose: `HostConfig.SecurityOpt`; kind: `no-new-privileges:true` / `seccomp=<type>` derived from the security context. Sorted. */
  securityOpt: string[];
  /** Mount points the container may write to, other than the root filesystem (tmpfs, emptyDir, volumes). Sorted. */
  writablePaths: string[];
  /** Resource requests and limits: bytes for memory, millicores for cpu; null when unset. */
  resources: { memoryRequest: number | null; memoryLimit: number | null; cpuRequest: number | null; cpuLimit: number | null; pidsLimit: number | null };
  // -- measured: a process started inside the container (node reading /proc) --
  effective: {
    uid: number;
    gid: number;
    /** Effective and bounding capability sets, as names (CAP_ prefix dropped), sorted; unknown bits as `CAP_<n>`. */
    capEff: string[];
    capBnd: string[];
    noNewPrivs: boolean;
    seccomp: "disabled" | "strict" | "filter" | "unknown";
    /** `/proc/self/mountinfo` says the root filesystem is mounted `ro`. */
    rootfsReadOnly: boolean;
    /** A file could be created and removed in /tmp. */
    tmpWritable: boolean;
    /** A file could be created in the process's working directory (where the app's own files are). Expected false. */
    cwdWritable: boolean;
  };
  /** Log lines saying a write hit a read-only filesystem (EROFS): the app wrote outside /tmp. */
  readOnlyViolations: number;
}

export interface RuntimeCapture {
  collected: true;
  substrate: Substrate;
  /** By app (`reader`, `catalogue`, `live`, `time`, and `reader-auth` under compose). */
  containers: Record<string, ContainerPosture | NotCollected>;
}

/** One restart: milliseconds from the start command to the first healthy answer; null when it never came. */
export interface StartupSample {
  /** First response to GET / with a status below 500. */
  rootMs: number | null;
  /** The status of that response. */
  rootStatus: number | null;
  /** The orchestrator's own verdict: compose's healthcheck reports healthy, or the pod's Ready condition is true. */
  readyMs: number | null;
}

export interface StartupCapture {
  collected: true;
  substrate: Substrate;
  restarts: number;
  /** The give-up time for one restart, in ms; a sample that hit it has null fields. */
  timeoutMs: number;
  apps: Record<string, { samples: StartupSample[] } | NotCollected>;
}
