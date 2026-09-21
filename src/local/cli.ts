import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { userInfo } from "node:os";
import { basename, join, resolve } from "node:path";
import { isUrl } from "../claims/rules.ts";
import { ROOT } from "../stack.ts";
import type { RunReport } from "../types.ts";
import { DEFAULT_SCOPES, SCOPES, renderDoctor, runDoctor, type Scope } from "./doctor.ts";
import { realDoctorDeps } from "./doctor-real.ts";
import { GUARDS, realGit, realScript, runGuard, type GuardKind } from "./guard.ts";
import { harnessHome, imageCacheDir, locksDir, noiseDir, overridesFile, rollbacksDir } from "./home.ts";
import { LockHeldError, acquireLock, lockHolder } from "./lock.ts";
import { noiseHistoryCommand, noiseStatusCommand, recordNight } from "./noise-store.ts";
import { PRUNE_DEFAULTS, prune, renderPrune } from "./prune.ts";
import { appendOverride, overrideFromReport, readOverrides } from "./override-log.ts";
import {
  PRODUCTION_DEFAULT_TAG,
  PRODUCTION_URLS,
  WORKFLOW_DEFAULTS,
  executePlan,
  latestRecordedIn,
  latestRunIn,
  parseInterval,
  planGate,
  planMutants,
  planNightly,
  planSmoke,
  planWatch,
  portEnv,
  readGateEntry,
  renderPlan,
  watch,
  workflowEnv,
  writeGateSummary,
  type Executor,
  type GateStream,
  type Plan,
  type SmokePart
} from "./tasks.ts";

/** The parsed flags of src/cli.ts, as far as the local commands read them. */
export type Values = Record<string, string | boolean | string[] | undefined>;

const str = (v: Values, name: string): string | undefined => {
  const x = v[name];
  return typeof x === "string" && x !== "" ? x : undefined;
};
const flag = (v: Values, name: string): boolean => v[name] === true;

/** A usage error, printed and turned into exit code 2 by the caller. */
export class UsageError extends Error {}

function integer(v: Values, name: string, fallback: number, min = 0): number {
  const raw = str(v, name);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min) throw new UsageError(`--${name} takes a whole number, ${min} or more`);
  return n;
}

// ---- override recording, for `run` and `compare` ------------------------------------------------------

/** After a run: an applied override is written to the local, append-only log (the `harness-override` issue of the workflows). */
export function recordAppliedOverride(report: RunReport, reportDir: string, log: (m: string) => void = console.log, file = overridesFile()): void {
  const entry = overrideFromReport(report, reportDir);
  if (!entry) return;
  const written = appendOverride(file, entry);
  log(`override recorded: #${written.seq} in ${file} (\`harness override list\`)`);
}

// ---- harness doctor -----------------------------------------------------------------------------------

export async function doctorCommand(v: Values): Promise<number> {
  const raw = str(v, "for");
  const scopes = raw ? raw.split(",").map((s) => s.trim()) : DEFAULT_SCOPES;
  for (const s of scopes) if (!(SCOPES as readonly string[]).includes(s)) throw new UsageError(`--for takes ${SCOPES.join(", ")} (comma separated); "${s}" is not one`);
  const env = { ...process.env, ...portEnv(integer(v, "port-offset", 0), process.env) };
  const result = await runDoctor(scopes as Scope[], realDoctorDeps(env));
  console.log(flag(v, "json") ? JSON.stringify(result, null, 2) : renderDoctor(result, process.platform));
  return result.ok ? 0 : 1;
}

// ---- harness noise ------------------------------------------------------------------------------------

export function noiseCommand(sub: string | undefined, v: Values): number {
  const store = str(v, "store") ?? noiseDir();
  switch (sub) {
    case "record": {
      const status = str(v, "status");
      if (!status) throw new UsageError("noise record needs --status <noise run directory | noise-status.json> [--report r.json] [--tag T] [--store dir]");
      return recordNight({
        status,
        store,
        ...(str(v, "report") ? { report: str(v, "report")! } : {}),
        ...(str(v, "tag") ? { tag: str(v, "tag")! } : {}),
        ...(str(v, "run-url") ? { runUrl: str(v, "run-url")! } : {}),
        ...(str(v, "summary") ? { summary: str(v, "summary")! } : {}),
        ...(str(v, "masks") ? { masks: str(v, "masks")! } : {})
      });
    }
    case "status":
      return noiseStatusCommand({ store, maxAgeDays: integer(v, "noise-max-age-days", 7, 1), json: flag(v, "json"), require: flag(v, "require") });
    case "history":
      return noiseHistoryCommand({ store, json: flag(v, "json"), last: integer(v, "last", 14, 1) });
    default:
      throw new UsageError("noise record|status|history");
  }
}

// ---- harness guard ------------------------------------------------------------------------------------

export function guardCommand(sub: string | undefined, v: Values): number {
  if (sub !== "masks" && sub !== "engine" && sub !== "all") throw new UsageError(`guard ${Object.keys(GUARDS).join("|")}|all --base <ref>`);
  return runGuard(sub as GuardKind | "all", str(v, "base"), { git: realGit, script: realScript, env: process.env, log: (m) => console.log(m) });
}

// ---- harness override ---------------------------------------------------------------------------------

export function overrideCommand(sub: string | undefined, v: Values): number {
  if (sub !== "list") throw new UsageError("override list [--since <ISO date>] [--json]");
  const file = overridesFile();
  const log = readOverrides(file);
  const since = str(v, "since");
  if (since && Number.isNaN(Date.parse(since))) throw new UsageError("--since takes an ISO date, e.g. 2026-07-01");
  const entries = since ? log.entries.filter((e) => Date.parse(e.at) >= Date.parse(since)) : log.entries;
  if (flag(v, "json")) {
    console.log(JSON.stringify({ file, count: entries.length, chainIntact: log.chainIntact, problems: log.problems, entries }, null, 2));
  } else {
    console.log(`overrides applied${since ? ` since ${since}` : ""}: ${entries.length} (${file})`);
    for (const e of entries) console.log(`  #${e.seq} ${e.at} ${e.mode} ${e.a ?? "?"} -> ${e.b ?? "?"} by ${e.by}: ${e.reason}`);
    if (!log.chainIntact) for (const p of log.problems) console.log(`  WARNING: ${p}`);
  }
  return 0;
}

// ---- harness prune ------------------------------------------------------------------------------------

/**
 * Remove old run directories under `out/` and an old image cache. A dry run unless `--yes`: deleting is the one thing
 * this command does that cannot be undone, so it says what it would do first. Refuses while a run or a watch holds its lock.
 */
export function pruneCommand(v: Values, deps: { home?: string; now?: Date; log?: (m: string) => void } = {}): number {
  const log = deps.log ?? ((m: string) => console.log(m));
  const home = deps.home ?? harnessHome();
  const root = resolve(str(v, "out") ?? outRoot());
  const rules = { olderThanDays: integer(v, "older-than-days", PRUNE_DEFAULTS.olderThanDays), keepLast: integer(v, "keep-last", PRUNE_DEFAULTS.keepLast), imageCacheDays: integer(v, "image-cache-days", PRUNE_DEFAULTS.imageCacheDays) };
  // --dry-run wins over --yes: asking for both is asking to look.
  const apply = flag(v, "yes") && !flag(v, "dry-run");
  const holder = ["run.lock", "watch.lock"].map((name) => lockHolder(join(locksDir(home), name))).find((h) => h !== undefined);
  if (holder && apply) {
    console.error(`not pruning: ${holder.task} is running (pid ${holder.pid}, since ${holder.since}). Run it again when that has finished.`);
    return 2;
  }
  let release = () => {};
  if (apply) {
    try {
      release = acquireLock(join(locksDir(home), "run.lock"), "harness prune");
    } catch (e) {
      if (!(e instanceof LockHeldError)) throw e;
      console.error(`not pruning: ${e.message}`);
      return 2;
    }
  }
  try {
    const recorded = latestRecordedIn(root);
    const result = prune({
      outRoot: root,
      imageCacheDirs: [resolve(str(v, "image-cache") ?? imageCacheDir(home))],
      ...rules,
      now: deps.now ?? new Date(),
      protectedNames: new Set(recorded ? [basename(recorded)] : []),
      apply
    });
    if (flag(v, "json")) log(JSON.stringify({ applied: result.applied, outRoot: result.outRoot, bytes: result.bytes, failed: result.failed, running: holder?.task ?? null, removals: result.removals, kept: result.runs.filter((r) => r.action === "keep").map((r) => ({ name: r.name, reason: r.reason })) }, null, 2));
    else {
      log(renderPrune(result, rules));
      if (holder) log(`  note: ${holder.task} is running (pid ${holder.pid}); a real prune would refuse until it has finished`);
    }
    return result.failed ? 1 : 0;
  } finally {
    release();
  }
}

// ---- harness local ------------------------------------------------------------------------------------

const outRoot = () => resolve(ROOT, "out");

function realExecutor(log: (m: string) => void): Executor {
  return {
    harness: (argv, env) => {
      const r = spawnSync(process.execPath, [join(ROOT, "bin", "harness.mjs"), ...argv], { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...env } });
      return r.status ?? 2;
    },
    latestRun: (mode, since) => latestRunIn(outRoot(), mode, since),
    latestRecorded: () => latestRecordedIn(outRoot()),
    log
  };
}

/** The person to record an override against: git's user.name, else the OS account. A person, not a bot. */
function whoAmI(): string {
  const r = spawnSync("git", ["config", "user.name"], { cwd: ROOT, encoding: "utf8" });
  return (r.status === 0 && r.stdout.trim()) || userInfo().username;
}

export function buildPlan(task: string | undefined, v: Values, env: NodeJS.ProcessEnv = process.env): Plan {
  const reason = str(v, "override-reason");
  const override = reason || str(v, "override-by") ? { reason: reason ?? "", by: str(v, "override-by") ?? whoAmI() } : undefined;
  switch (task) {
    case "nightly":
      return planNightly({ tag: str(v, "tag") ?? PRODUCTION_DEFAULT_TAG(env), imageCache: resolve(str(v, "image-cache") ?? imageCacheDir()), record: v.record !== false, ...(str(v, "runs") ? { runs: integer(v, "runs", 3, 1) } : {}), ...(str(v, "load") ? { load: str(v, "load")! } : {}), ...(str(v, "store") ? { store: resolve(str(v, "store")!) } : {}) });
    case "gate": {
      const a = str(v, "a");
      const b = str(v, "b");
      if (!a || !b) throw new UsageError("local gate needs --a <production tag> and --b <candidate tag>");
      const only = str(v, "only");
      if (only && !["release", "migration", "upgrade"].includes(only)) throw new UsageError("--only takes release, migration or upgrade");
      return planGate({
        production: a,
        candidate: b,
        ...(str(v, "claims") ? { claims: resolve(str(v, "claims")!) } : {}),
        ...(str(v, "rules") ? { rules: isUrl(str(v, "rules")!) ? str(v, "rules")! : resolve(str(v, "rules")!) } : {}),
        ...(str(v, "runs") ? { runs: integer(v, "runs", 3, 1) } : {}),
        ...(str(v, "migrations-a") ? { migrationsA: str(v, "migrations-a")! } : {}),
        ...(str(v, "migrations-b") ? { migrationsB: str(v, "migrations-b")! } : {}),
        ...(str(v, "a-digests") ? { productionDigests: str(v, "a-digests")! } : {}),
        ...(str(v, "b-digests") ? { candidateDigests: str(v, "b-digests")! } : {}),
        ...(only ? { only: only as GateStream } : {}),
        ...(override ? { override } : {})
      });
    }
    case "mutants":
      return planMutants({ tag: str(v, "base") ?? PRODUCTION_DEFAULT_TAG(env) });
    case "smoke": {
      const only = str(v, "only");
      if (only && only !== "stacks" && only !== "migration") throw new UsageError("local smoke --only takes stacks or migration");
      return planSmoke({ tag: str(v, "tag") ?? PRODUCTION_DEFAULT_TAG(env), ...(only ? { only: only as SmokePart } : {}) });
    }
    case "watch":
      return planWatch({
        production: str(v, "production") ?? PRODUCTION_URLS(env),
        ...(str(v, "recorded") ? { recorded: resolve(str(v, "recorded")!) } : {}),
        ...(str(v, "deployed") ? { deployed: { tag: str(v, "deployed")!, ...(str(v, "deployed-digests") ? { digests: str(v, "deployed-digests")! } : {}), ...(str(v, "release-record") ? { record: resolve(str(v, "release-record")!) } : {}) } } : {})
      });
    default:
      throw new UsageError("local nightly|gate|mutants|watch|smoke [--dry-run]");
  }
}

function intervalOf(v: Values): number {
  try {
    return parseInterval(str(v, "interval") ?? `${WORKFLOW_DEFAULTS.watchIntervalMinutes}m`);
  } catch (e) {
    throw new UsageError(e instanceof Error ? e.message : String(e));
  }
}

export async function localCommand(task: string | undefined, v: Values): Promise<number> {
  const plan = buildPlan(task, v);
  const intervalMs = plan.task === "watch" ? intervalOf(v) : 0;
  const env = { ...workflowEnv(process.env), ...portEnv(integer(v, "port-offset", 0), process.env) };
  if (flag(v, "dry-run")) {
    console.log(renderPlan(plan, env));
    if (plan.task === "watch") console.log(`\n${flag(v, "once") ? "once" : `every ${str(v, "interval") ?? `${WORKFLOW_DEFAULTS.watchIntervalMinutes}m`} until Ctrl-C`}`);
    return 0;
  }
  const log = (m: string) => console.log(m);
  const ex = realExecutor(log);
  const home = harnessHome();
  mkdirSync(home, { recursive: true });

  if (plan.task === "watch") return watchCommand(plan, env, ex, v, intervalMs);

  let release: () => void;
  try {
    release = acquireLock(join(locksDir(home), "run.lock"), `harness local ${plan.task}`);
  } catch (e) {
    if (e instanceof LockHeldError) {
      console.error(e.message);
      return 2;
    }
    throw e;
  }
  try {
    log(`harness local ${plan.task}: state in ${home}`);
    const { code, results } = executePlan(plan, env, ex);
    if (plan.task === "gate") {
      const at = new Date();
      const entries = results.map(readGateEntry);
      const files = writeGateSummary(outRoot(), at, { production: str(v, "a")!, candidate: str(v, "b")!, entries, code, at: at.toISOString() });
      log(`\ngate summary (the PR comment, for reading here): ${files.md}`);
    }
    log(`\nharness local ${plan.task}: ${results.map((r) => `${r.id}=${r.code}`).join(" ")} -> exit ${code}`);
    return code;
  } finally {
    release();
  }
}

/** What the `rollback` issue of post-deploy.yml carries, written to a file instead. */
export function writeRollback(dir: string, at: Date, runDir: string | undefined): string {
  mkdirSync(dir, { recursive: true });
  const report = runDir && existsSync(join(runDir, "report.md")) ? readFileSync(join(runDir, "report.md"), "utf8") : "(no report was written)";
  const file = join(dir, `${at.toISOString().replace(/[:.]/g, "-").slice(0, 19)}-rollback.md`);
  writeFileSync(file, `# Rollback candidate: production differs from the tested release (${at.toISOString().slice(0, 16)}Z)\n\n${report}\n\nReport directory: ${runDir ?? "?"}\n`);
  return file;
}

async function watchCommand(plan: Plan, env: Record<string, string>, ex: Executor, v: Values, intervalMs: number): Promise<number> {
  const once = flag(v, "once");
  let release: () => void;
  try {
    release = acquireLock(join(locksDir(harnessHome()), "watch.lock"), "harness local watch");
  } catch (e) {
    if (!(e instanceof LockHeldError)) throw e;
    // A scheduled run that finds the last one still going does nothing, as the workflow's concurrency group does.
    console.log(`skipped: ${e.message}`);
    return once ? 0 : 2;
  }
  let stop = false;
  let wake: (() => void) | undefined;
  process.once("SIGINT", () => {
    stop = true;
    wake?.();
  });
  try {
    ex.log(`harness local watch: ${once ? "once" : `every ${str(v, "interval") ?? "15m"} until Ctrl-C`}; a difference is written to ${rollbacksDir()}`);
    const outcome = await watch(
      { intervalMs, ...(once ? { max: 1 } : {}) },
      {
        runOnce: () => {
          const { code, results } = executePlan(plan, env, ex);
          const runDir = results.find((r) => r.id === "post-deploy")?.runDir;
          return { code, ...(runDir ? { runDir } : {}) };
        },
        sleep: (ms) =>
          new Promise<void>((done) => {
            const t = setTimeout(done, ms);
            wake = () => {
              clearTimeout(t);
              done();
            };
          }),
        now: () => new Date(),
        log: (m) => console.log(m),
        onFailure: ({ at, runDir }) => console.log(`rollback record: ${writeRollback(rollbacksDir(), at, runDir)}`),
        shouldStop: () => stop
      }
    );
    return once ? outcome.lastCode : 0;
  } finally {
    release();
  }
}
