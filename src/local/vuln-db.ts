import { existsSync, mkdirSync } from "node:fs";
import type { Exec } from "../images.ts";
import { scannerEnv } from "../image-static/vulns.ts";
import { harnessHome, vulnDbDir } from "./home.ts";

/**
 * The vulnerability database, as one directory that CI and a laptop treat the same way.
 *
 * The scanner (grype) may never update its database during a run: a CVE published
 * between the two sides' scans would look like a change in the release
 * (`scannerEnv` in src/image-static/vulns.ts switches updates off). So the
 * database is fetched ONCE, before the run, into one directory, and every scan of
 * every image on both sides reads that directory:
 *
 *   CI      .harness/vuln-db, restored from the actions cache (one entry per UTC day and grype version),
 *           fetched with `harness vuln-db update` only on a cache miss
 *   local   <HARNESS_HOME>/vuln-db, the same command; `harness doctor` says how old it is
 *
 * HARNESS_VULN_DB_DIR names another directory; unset, the directory above is used
 * when it exists (and only then, so a machine that never ran `vuln-db update`
 * behaves exactly as before: grype's own cache, updates off).
 */

/** The grype CI installs (anchore/scan-action/download-grype takes the tag, with its `v`). tests/workflows hold every workflow to it. */
export const PINNED_GRYPE_VERSION = "v0.119.0";

/**
 * The oldest grype `harness doctor` accepts. The database schema the harness reads (v6) arrived in 0.88; 0.96 fixed the
 * listing URL of the v6 database. The output shapes the harness parses are tested against PINNED_GRYPE_VERSION, not against
 * every release in between: this is a floor, not a promise.
 */
export const MIN_GRYPE_VERSION = "0.96.0";

/**
 * How old a database may be before the harness calls it stale. 5 days is grype's own limit (`db.max-allowed-built-age`, 120h):
 * beyond it grype refuses to scan at all, so a doctor that waited longer would say "ready" about a machine whose every scan is
 * NOT COLLECTED. HARNESS_VULN_DB_MAX_AGE_DAYS moves both the doctor's warning and grype's own limit, so the two never disagree.
 */
export const DEFAULT_VULN_DB_MAX_AGE_DAYS = 5;

export const GRYPE_INSTALL = {
  windows: `no admin needed: unzip https://github.com/anchore/grype/releases/download/${PINNED_GRYPE_VERSION}/grype_${PINNED_GRYPE_VERSION.slice(1)}_windows_amd64.zip and put grype.exe on PATH (or: scoop install grype)`,
  macos: `brew install grype, or the pinned version: curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b ~/.local/bin ${PINNED_GRYPE_VERSION}`,
  linux: `curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b ~/.local/bin ${PINNED_GRYPE_VERSION}`
};

export const GRYPE_DB_FIX = "harness vuln-db update (fetches the database into HARNESS_HOME/vuln-db once; needs the network), then run again";

// ---- where it lives ----------------------------------------------------------------------------

/** The directory a scan reads: HARNESS_VULN_DB_DIR, else <HARNESS_HOME>/vuln-db when it exists, else undefined (grype's own cache). */
export function vulnDbDirFromEnv(env: NodeJS.ProcessEnv = process.env, exists: (path: string) => boolean = existsSync, home: string = harnessHome(env)): string | undefined {
  const explicit = env.HARNESS_VULN_DB_DIR?.trim();
  if (explicit) return explicit;
  const dir = vulnDbDir(home);
  return exists(dir) ? dir : undefined;
}

/** HARNESS_VULN_DB_MAX_AGE_DAYS: a positive number of days; anything else is reported and the default used. */
export function maxAgeDays(env: NodeJS.ProcessEnv = process.env): { days: number; explicit: boolean; invalid?: string } {
  const raw = env.HARNESS_VULN_DB_MAX_AGE_DAYS?.trim();
  if (!raw) return { days: DEFAULT_VULN_DB_MAX_AGE_DAYS, explicit: false };
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return { days: DEFAULT_VULN_DB_MAX_AGE_DAYS, explicit: false, invalid: raw };
  return { days: n, explicit: true };
}

// ---- reading `grype db status` ------------------------------------------------------------------

export interface DbStatus {
  valid: boolean;
  schemaVersion?: string;
  /** ISO time the database was built (grype's `built`). Absent, or year 1, when there is no database. */
  built?: string;
  /** Where it was downloaded from; the URL carries the archive's sha256 as `?checksum=sha256:...`. */
  from?: string;
  path?: string;
  error?: string;
}

/**
 * `grype db status -o json` prints `{schemaVersion, from, built, path, valid, error?}` (grype 0.119) and exits 1, with the
 * same JSON, when the database is missing or invalid. Older grype prints `Built: ...` / `Status: valid` lines.
 */
export function parseDbStatus(text: string): DbStatus | undefined {
  const t = text.trim();
  if (!t) return undefined;
  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t) as Record<string, unknown>;
      const s = (k: string) => (typeof j[k] === "string" && j[k] !== "" ? (j[k] as string) : undefined);
      return { valid: j.valid === true, ...(s("schemaVersion") ? { schemaVersion: s("schemaVersion")! } : {}), ...(s("built") ? { built: s("built")! } : {}), ...(s("from") ? { from: s("from")! } : {}), ...(s("path") ? { path: s("path")! } : {}), ...(s("error") ? { error: s("error")! } : {}) };
    } catch {
      return undefined;
    }
  }
  const field = (name: string) => new RegExp(`^${name}:\\s*(\\S.*)$`, "mi").exec(t)?.[1]?.trim();
  const built = field("Built");
  if (!built && !field("Status")) return undefined;
  return { valid: /^valid$/i.test(field("Status") ?? ""), ...(field("Schema") ? { schemaVersion: field("Schema")! } : {}), ...(built ? { built } : {}), ...(field("From") ? { from: field("From")! } : {}), ...(field("Path") ? { path: field("Path")! } : {}) };
}

/** The archive checksum the database was downloaded with, out of its URL. */
export function dbChecksum(from: string | undefined): string | undefined {
  const m = /[?&]checksum=sha256(?::|%3A)([0-9a-f]{64})/i.exec(from ?? "");
  return m ? `sha256:${m[1]!.toLowerCase()}` : undefined;
}

/** Days since the database was built, or undefined when it says none (grype prints year 1 for "no database"). */
export function dbAgeDays(status: DbStatus, now: Date): number | undefined {
  if (!status.built) return undefined;
  const t = Date.parse(status.built);
  if (Number.isNaN(t) || new Date(t).getUTCFullYear() < 2000) return undefined;
  return (now.getTime() - t) / 86_400_000;
}

export const formatAge = (days: number): string => (days < 0 ? "built in the future (clock skew?)" : days < 1 / 24 ? "under an hour ago" : days < 1 ? `${Math.round(days * 24)} h ago` : `${(Math.round(days * 10) / 10).toString()} days ago`);

/** `Version:  0.119.0` out of `grype version`. */
export function parseGrypeVersion(text: string): string | undefined {
  return /^Version:\s*v?(\d+\.\d+\.\d+\S*)/m.exec(text)?.[1];
}

/** -1, 0, 1 for dotted numeric versions; a suffix such as `-rc.1` is ignored. */
export function compareVersions(a: string, b: string): number {
  const n = (v: string) => v.split(/[-+]/)[0]!.split(".").map(Number);
  const x = n(a);
  const y = n(b);
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

// ---- judging it ------------------------------------------------------------------------------------

export interface DbVerdict {
  usable: boolean;
  /** One line: what a person reads. */
  detail: string;
  ageDays?: number;
  checksum?: string;
}

/** Whether a scan will read this database, and the line that says so. `status` is undefined when grype printed nothing usable. */
export function judgeDb(status: DbStatus | undefined, rawFailure: string, now: Date, limitDays: number): DbVerdict {
  if (!status) return { usable: false, detail: `grype has no usable database (${rawFailure || "no answer"}), and the harness never lets it update mid-run: every scan would be 'not collected'` };
  const age = dbAgeDays(status, now);
  const checksum = dbChecksum(status.from);
  const facts = [status.schemaVersion ? `schema ${status.schemaVersion}` : undefined, status.built && age !== undefined ? `built ${status.built} (${formatAge(age)})` : undefined, checksum].filter(Boolean).join(", ");
  if (!status.valid || age === undefined) return { usable: false, detail: `grype's database is not usable (${status.error ?? "no database"}${facts ? `; ${facts}` : ""}), and the harness never lets it update mid-run: every scan would be 'not collected'`, ...(checksum ? { checksum } : {}) };
  if (age > limitDays) return { usable: false, ageDays: age, detail: `${facts}: older than ${limitDays} days, the limit grype scans with (HARNESS_VULN_DB_MAX_AGE_DAYS), so every scan would be 'not collected'`, ...(checksum ? { checksum } : {}) };
  return { usable: true, ageDays: age, detail: `${facts}; limit ${limitDays} days`, ...(checksum ? { checksum } : {}) };
}

// ---- the command --------------------------------------------------------------------------------------

export interface VulnDbDeps {
  exec: Exec;
  env: NodeJS.ProcessEnv;
  platform: NodeJS.Platform;
  now: () => Date;
  mkdir: (path: string) => void;
  exists: (path: string) => boolean;
  log: (line: string) => void;
}

export function realVulnDbDeps(env: NodeJS.ProcessEnv, exec: Exec): VulnDbDeps {
  return { exec, env, platform: process.platform, now: () => new Date(), mkdir: (p) => void mkdirSync(p, { recursive: true }), exists: existsSync, log: (l) => console.log(l) };
}

const isRequired = (env: NodeJS.ProcessEnv) => /^(1|true|yes)$/i.test(env.HARNESS_REQUIRE_STATIC ?? "");
const tailLine = (s: string) => s.trim().split(/\r?\n/).filter(Boolean).slice(-1)[0] ?? "";
// eslint-disable-next-line no-control-regex -- strips the escape sequences grype colours its errors with
const noAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "");

/** The status of the database a scan would read, as the scan would see it (updates off, this directory, this age limit). */
export function readDbStatus(deps: Pick<VulnDbDeps, "exec" | "env">, dir: string | undefined): { status?: DbStatus; failure: string; missingTool: boolean } {
  const limit = maxAgeDays(deps.env);
  // The doctor and this command judge the age themselves, so grype's own age check is off for this one call: `valid` then means intact.
  const env = { ...scannerEnv(dir, limit.explicit ? limit.days : undefined), GRYPE_DB_VALIDATE_AGE: "false" };
  const r = deps.exec("grype", ["db", "status", "-o", "json"], { env });
  if (r.error) return { failure: r.error.code === "ENOENT" ? "grype is not installed" : r.error.message, missingTool: r.error.code === "ENOENT" };
  const status = parseDbStatus(r.stdout);
  return { ...(status ? { status } : {}), failure: noAnsi(tailLine(r.stderr) || tailLine(r.stdout) || `exit ${r.status}`), missingTool: false };
}

/**
 * `harness vuln-db update`: fetch the database into the harness's directory. The ONE place a database is ever updated.
 * Run it before a run, never during one; both sides of a comparison are then scanned with what it left behind.
 */
export function vulnDbUpdate(deps: VulnDbDeps): number {
  const { exec, env, log } = deps;
  const dir = env.HARNESS_VULN_DB_DIR?.trim() || vulnDbDir(harnessHome(env));
  deps.mkdir(dir);
  log(`fetching grype's vulnerability database into ${dir}`);
  const r = exec("grype", ["db", "update"], { env: { GRYPE_DB_CACHE_DIR: dir, GRYPE_DB_AUTO_UPDATE: "true", GRYPE_CHECK_FOR_APP_UPDATE: "false" } });
  if (r.error?.code === "ENOENT") {
    const p = deps.platform === "win32" ? "windows" : deps.platform === "darwin" ? "macos" : "linux";
    log(`grype is not installed: ${GRYPE_INSTALL[p]}`);
    return 1;
  }
  if (r.error || r.status !== 0) {
    log(`grype db update failed: ${noAnsi(tailLine(r.stderr) || tailLine(r.stdout) || r.error?.message || `exit ${r.status}`)}`);
    return 1;
  }
  return vulnDbStatus(deps, { json: false, requireUsable: true });
}

/**
 * `harness vuln-db status`: the database a scan would read, its build time, age and checksum. Exit 0 when a scan can use it;
 * when it cannot, 1 under HARNESS_REQUIRE_STATIC (the run would fail on it anyway) and 0 otherwise, as the scan is then
 * informational. `requireUsable` (after an update) always exits 1 on an unusable database.
 */
export function vulnDbStatus(deps: VulnDbDeps, o: { json: boolean; requireUsable?: boolean }): number {
  const { env, log } = deps;
  const dir = vulnDbDirFromEnv(env, deps.exists);
  const limit = maxAgeDays(env);
  const read = readDbStatus(deps, dir);
  const verdict = read.missingTool ? { usable: false, detail: "grype is not installed" } : judgeDb(read.status, read.failure, deps.now(), limit.days);
  const failing = !verdict.usable && (o.requireUsable || isRequired(env));
  if (o.json) {
    log(JSON.stringify({ usable: verdict.usable, dir: dir ?? null, limitDays: limit.days, ...(read.status ?? {}), ...("ageDays" in verdict && verdict.ageDays !== undefined ? { ageDays: Math.round(verdict.ageDays * 100) / 100 } : {}), ...("checksum" in verdict && verdict.checksum ? { checksum: verdict.checksum } : {}), detail: verdict.detail }, null, 2));
  } else {
    log(`vulnerability database: ${verdict.usable ? "usable" : "NOT USABLE"}`);
    log(`  directory  ${dir ?? "grype's own default cache (no HARNESS_VULN_DB_DIR, and no HARNESS_HOME/vuln-db yet)"}`);
    log(`  ${verdict.detail}`);
    if (limit.invalid) log(`  HARNESS_VULN_DB_MAX_AGE_DAYS=${limit.invalid} is not a positive number: using ${limit.days}`);
    if (!verdict.usable) log(`  fix: ${GRYPE_DB_FIX}${failing ? "" : "; until then the vulnerability artefact is 'not collected' (informational: HARNESS_REQUIRE_STATIC is not set)"}`);
  }
  return failing ? 1 : 0;
}
