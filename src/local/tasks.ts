import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { QUAY_IMAGE_TEMPLATE } from "../image-ref.ts";
export { DEFAULT_PORTS, portEnv } from "./ports.ts";

/**
 * The four things a maintainer does, each as one command, planned as a list of
 * harness CLI invocations.
 *
 *   harness local nightly   A/A on the production tag, pulled and verified, five runs with load, recorded in the local noise store
 *   harness local gate      the release gate for a candidate: release (A/B, claims, k6), migration and upgrade rehearsals
 *   harness local mutants   the harness's own signal
 *   harness local watch     post-deploy comparison against production, once or every 15 minutes
 *
 * A plan is data: the argv of `harness ...` steps, exactly the lines the
 * GitHub workflows run (tests/local-parity.test.ts holds the two together), so a
 * CI run and a local run cannot mean different things by the same name.
 * `--dry-run` prints the plan without running anything.
 */

/** What the workflows use when a repository variable is not set (docs/contract/workflows.json, repositoryVariables). */
export const WORKFLOW_DEFAULTS = {
  imagePrefix: QUAY_IMAGE_TEMPLATE,
  productionTag: "main",
  productionUrls: "reader=https://tutors.dev,catalogue=https://catalogue.tutors.dev,live=https://live.tutors.dev",
  runs: 5,
  load: "20x30s",
  upgradeJourney: "anonymous-student-reads-course",
  watchIntervalMinutes: 15
} as const;

/** Placeholders in a step's argv, filled in when the step runs: the newest run directory of a mode. */
export const LATEST_NOISE = "{latest:noise}";
export const LATEST_RECORDED = "{latest:recorded-release}";

export interface Step {
  id: string;
  title: string;
  /** Arguments to `harness`. */
  argv: string[];
  /** A failing step with this stream stops the rest of the stream; other streams go on, as separate workflow jobs do. */
  stream: string;
  /** When this step exits non-zero, the rest of its stream is skipped. False for a verdict: a FAIL must not hide the other rehearsals. */
  gatesStream: boolean;
  /** Informational: its exit code never changes the plan's. */
  informational?: boolean;
}

export interface Plan {
  task: "nightly" | "gate" | "mutants" | "watch";
  steps: Step[];
}

export const PRODUCTION_DEFAULT_TAG = (env: NodeJS.ProcessEnv) => env.HARNESS_PRODUCTION_TAG || WORKFLOW_DEFAULTS.productionTag;
export const PRODUCTION_URLS = (env: NodeJS.ProcessEnv) => env.HARNESS_PRODUCTION_URLS || WORKFLOW_DEFAULTS.productionUrls;

/** The environment the workflows set for every job: where bare tags live. Left alone when the caller set it. */
export function workflowEnv(env: NodeJS.ProcessEnv): Record<string, string> {
  return { HARNESS_IMAGE_PREFIX: env.HARNESS_IMAGE_PREFIX || WORKFLOW_DEFAULTS.imagePrefix };
}

// ---- the plans ------------------------------------------------------------------------------------

export interface NightlyOptions {
  tag: string;
  runs?: number;
  load?: string;
  imageCache: string;
  record: boolean;
  /** A store other than the default one. */
  store?: string;
}

export function planNightly(o: NightlyOptions): Plan {
  const runs = o.runs ?? WORKFLOW_DEFAULTS.runs;
  const load = o.load ?? WORKFLOW_DEFAULTS.load;
  return {
    task: "nightly",
    steps: [
      { id: "ensure", title: "pull and verify the production images", argv: ["images", "ensure", "--a", o.tag, "--b", o.tag, "--image-cache", o.imageCache], stream: "noise", gatesStream: true },
      { id: "noise", title: `A/A on ${o.tag}, ${runs} runs, with load`, argv: ["run", "--mode", "noise", "--a", o.tag, "--b", o.tag, "--runs", String(runs), "--load", load, "--require-verified"], stream: "noise", gatesStream: true },
      ...(o.record ? [{ id: "record", title: "record the night in the local noise store", argv: ["noise", "record", "--status", LATEST_NOISE, "--tag", o.tag, ...(o.store ? ["--store", o.store] : [])], stream: "noise", gatesStream: false } satisfies Step] : [])
    ]
  };
}

export type GateStream = "release" | "migration" | "upgrade";

export interface GateOptions {
  production: string;
  candidate: string;
  /** Absolute path of the release's claims.yaml. */
  claims?: string;
  /** Since 1.3.0: the release's rules.json, a path or a URL (`--rules`). */
  rules?: string;
  runs?: number;
  migrationsA?: string;
  migrationsB?: string;
  /** Since 1.3.0: the dispatch's production_digests / candidate_digests, as `--a-digests` / `--b-digests` take them. */
  productionDigests?: string;
  candidateDigests?: string;
  only?: GateStream;
  override?: { reason: string; by: string };
}

export function planGate(o: GateOptions): Plan {
  const want = (s: GateStream) => !o.only || o.only === s;
  const override = o.override ? ["--override-reason", o.override.reason, "--override-by", o.override.by] : [];
  const pins = [...(o.productionDigests ? ["--a-digests", o.productionDigests] : []), ...(o.candidateDigests ? ["--b-digests", o.candidateDigests] : [])];
  const steps: Step[] = [];
  steps.push({ id: "noise-status", title: "the local noise status (does the gate have the right to FAIL?)", argv: ["noise", "status"], stream: "info", gatesStream: false, informational: true });
  if (want("release") || want("upgrade")) {
    steps.push({ id: "ensure", title: "pull and verify, or build, both sides", argv: ["images", "ensure", "--a", o.production, "--b", o.candidate, ...pins], stream: "images", gatesStream: true });
  }
  if (want("release")) {
    steps.push({
      id: "release",
      title: "release mode: A/B, claims, k6",
      argv: ["run", "--mode", "release", "--a", o.production, "--b", o.candidate, "--runs", String(o.runs ?? WORKFLOW_DEFAULTS.runs), "--load", WORKFLOW_DEFAULTS.load, ...pins, ...(o.claims ? ["--claims", o.claims] : []), ...(o.rules ? ["--rules", o.rules] : []), ...override],
      stream: "release",
      gatesStream: false
    });
  }
  if (want("migration")) {
    steps.push({ id: "migration", title: "migration rehearsal", argv: ["run", "--mode", "migration", "--a", o.migrationsA ?? `v${o.production}`, "--b", o.migrationsB ?? `v${o.candidate}`, ...override], stream: "migration", gatesStream: false });
  }
  if (want("upgrade")) {
    steps.push({ id: "upgrade", title: "upgrade rehearsal: rollout under load", argv: ["run", "--mode", "upgrade", "--a", o.production, "--b", o.candidate, "--set", "fixture", "--journey", WORKFLOW_DEFAULTS.upgradeJourney, ...pins, ...override], stream: "upgrade", gatesStream: false });
  }
  return { task: "gate", steps };
}

export function planMutants(o: { tag: string }): Plan {
  return {
    task: "mutants",
    steps: [
      { id: "ensure", title: "pull and verify the base images", argv: ["images", "ensure", "--a", o.tag, "--b", o.tag], stream: "mutants", gatesStream: true },
      { id: "mutants", title: "every mutant, caught and attributed", argv: ["mutants", "--base", o.tag], stream: "mutants", gatesStream: false }
    ]
  };
}

/** Since 1.3.0: what the deploy says it deployed (`--deployed`, `--deployed-digests`), and where the release record is (`--release-record`; default the local store). */
export interface Deployed {
  tag: string;
  digests?: string;
  record?: string;
}

export function planWatch(o: { recorded?: string; production: string; deployed?: Deployed }): Plan {
  return {
    task: "watch",
    steps: [
      { id: "noise-status", title: "the local noise status", argv: ["noise", "status"], stream: "info", gatesStream: false, informational: true },
      { id: "post-deploy", title: "reference journeys against production vs the recorded candidate", argv: ["run", "--mode", "post-deploy", "--recorded", o.recorded ?? LATEST_RECORDED, "--production", o.production, ...(o.deployed ? ["--deployed", o.deployed.tag, ...(o.deployed.record ? ["--release-record", o.deployed.record] : []), ...(o.deployed.digests ? ["--deployed-digests", o.deployed.digests] : [])] : [])], stream: "post-deploy", gatesStream: false }
    ]
  };
}

// ---- running a plan -------------------------------------------------------------------------------

export interface StepResult {
  id: string;
  title: string;
  argv: string[];
  code: number | "skipped";
  /** The run directory this step produced, for steps that make one. */
  runDir?: string;
}

export interface Executor {
  /** Run `harness <argv>` and return its exit code. */
  harness: (argv: string[], env: Record<string, string>) => number;
  /** The newest run directory for a mode under the output root, made at or after `since`. */
  latestRun: (mode: string, since: number) => string | undefined;
  /** The newest release run that may serve as the recorded candidate. */
  latestRecorded: () => string | undefined;
  log: (message: string) => void;
}

const MODE_OF_STEP: Record<string, string> = { noise: "noise", release: "release", migration: "migration", upgrade: "upgrade", "post-deploy": "post-deploy" };

/** Fill a step's placeholders. Undefined when one cannot be filled, and the step must not run. */
export function resolveArgv(argv: string[], ex: Pick<Executor, "latestRun" | "latestRecorded">, since: number): { argv: string[] } | { problem: string } {
  const out: string[] = [];
  for (const a of argv) {
    if (a === LATEST_NOISE) {
      const dir = ex.latestRun("noise", since);
      if (!dir) return { problem: "no noise run directory was produced by this run" };
      out.push(dir);
    } else if (a === LATEST_RECORDED) {
      const dir = ex.latestRecorded();
      if (!dir) return { problem: "no recorded release run to compare production with: run `harness local gate` first, or pass --recorded <release run dir>" };
      out.push(dir);
    } else out.push(a);
  }
  return { argv: out };
}

export function executePlan(plan: Plan, env: Record<string, string>, ex: Executor): { code: number; results: StepResult[] } {
  const started = Date.now() - 1000;
  const results: StepResult[] = [];
  const stopped = new Set<string>();
  let worst = 0;
  for (const step of plan.steps) {
    if (stopped.has(step.stream)) {
      results.push({ id: step.id, title: step.title, argv: step.argv, code: "skipped" });
      continue;
    }
    ex.log(`\n== ${step.id}: ${step.title}`);
    const filled = resolveArgv(step.argv, ex, started);
    if ("problem" in filled) {
      ex.log(`   cannot run: ${filled.problem}`);
      results.push({ id: step.id, title: step.title, argv: step.argv, code: "skipped" });
      if (!step.informational) worst = Math.max(worst, 2);
      continue;
    }
    ex.log(`   harness ${commandLine(filled.argv)}`);
    const code = ex.harness(filled.argv, env);
    const mode = MODE_OF_STEP[step.id];
    const runDir = mode && step.argv[0] === "run" ? ex.latestRun(mode, started) : undefined;
    results.push({ id: step.id, title: step.title, argv: filled.argv, code, ...(runDir ? { runDir } : {}) });
    if (!step.informational) worst = Math.max(worst, code);
    if (code !== 0 && step.gatesStream) {
      stopped.add(step.stream);
      // The images are shared: without them neither the release nor the upgrade rehearsal can run.
      if (step.id === "ensure") for (const s of plan.steps) if (s.stream === "release" || s.stream === "upgrade" || s.stream === "noise" || s.stream === "mutants") stopped.add(s.stream);
    }
  }
  return { code: worst, results };
}

/**
 * One argument as the shell the person copies it into will read it back as the same one argument.
 *
 * - POSIX shells (bash, zsh, sh; also Git Bash on Windows): bare when it is only letters, digits and
 *   `_ @ % + = : , . / -`, otherwise in single quotes, a single quote inside written `'\''`.
 * - PowerShell (the platform "win32", where the harness's docs run it): the same bare set, otherwise in
 *   single quotes, a single quote inside doubled (`''`). cmd.exe is not catered for: it does not read
 *   single quotes, so paste into PowerShell or Git Bash.
 *
 * The empty string is `''` in both. Nothing inside single quotes is expanded by either shell.
 */
export function shellQuote(arg: string, platform: NodeJS.Platform = process.platform): string {
  if (arg !== "" && /^[A-Za-z0-9_@%+=:,./-]+$/.test(arg)) return arg;
  // PowerShell also reads the typographic single quotes as quote characters, so each is doubled too.
  return platform === "win32" ? `'${arg.replace(/['‘’‚‛]/g, (q) => q + q)}'` : `'${arg.replaceAll("'", "'\\''")}'`;
}

/** The arguments of a harness command, each quoted for the shell of `platform`, joined by spaces. */
export function commandLine(argv: string[], platform: NodeJS.Platform = process.platform): string {
  return argv.map((a) => shellQuote(a, platform)).join(" ");
}

/** A plan as text, for `--dry-run`: every command line is safe to copy into a shell of `platform` (see {@link shellQuote}). */
export function renderPlan(plan: Plan, env: Record<string, string>, platform: NodeJS.Platform = process.platform): string {
  const lines = [`harness local ${plan.task}: ${plan.steps.length} step(s)`, ""];
  const set = Object.entries(env);
  if (set.length) {
    const assigned = set.map(([k, v]) => (platform === "win32" ? `$env:${k}=${shellQuote(v, platform)};` : `${k}=${shellQuote(v, platform)}`));
    lines.push(`environment: ${assigned.join(" ")}`, "");
  }
  plan.steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s.title}`, `       harness ${commandLine(s.argv, platform)}`));
  return lines.join("\n");
}

// ---- finding run directories ----------------------------------------------------------------------

/** `<out>/<timestamp>-<mode>` directories, newest first. */
export function runDirs(outRoot: string, mode: string): string[] {
  if (!existsSync(outRoot)) return [];
  return readdirSync(outRoot)
    .filter((n) => n.endsWith(`-${mode}`))
    .map((n) => join(outRoot, n))
    .filter((p) => statSync(p).isDirectory())
    .sort()
    .reverse();
}

export function latestRunIn(outRoot: string, mode: string, since: number): string | undefined {
  return runDirs(outRoot, mode).find((d) => statSync(d).mtimeMs >= since);
}

/** The newest release run that finished without a FAIL (or whose FAIL was overridden): what post-deploy compares production with. */
export function latestRecordedIn(outRoot: string): string | undefined {
  for (const dir of runDirs(outRoot, "release")) {
    const report = join(dir, "report.json");
    if (!existsSync(report) || !existsSync(join(dir, "b", "capture.json"))) continue;
    try {
      const r = JSON.parse(readFileSync(report, "utf8")) as { verdict?: string; override?: { applied?: boolean } };
      if (r.verdict === "pass" || r.verdict === "warn" || r.override?.applied) return dir;
    } catch {
      continue;
    }
  }
  return undefined;
}

// ---- the gate's combined summary ------------------------------------------------------------------

export interface GateSummaryEntry {
  id: string;
  title: string;
  code: number | "skipped";
  runDir?: string;
  verdict?: string;
  reasons?: string[];
  overridden?: boolean;
  markdown?: string;
}

export function readGateEntry(r: StepResult): GateSummaryEntry {
  const entry: GateSummaryEntry = { id: r.id, title: r.title, code: r.code, ...(r.runDir ? { runDir: r.runDir } : {}) };
  if (!r.runDir) return entry;
  try {
    const report = JSON.parse(readFileSync(join(r.runDir, "report.json"), "utf8")) as { verdict: string; reasons: string[]; override?: { applied?: boolean } };
    entry.verdict = report.verdict;
    entry.reasons = report.reasons;
    entry.overridden = report.override?.applied === true;
    if (existsSync(join(r.runDir, "report.md"))) entry.markdown = readFileSync(join(r.runDir, "report.md"), "utf8");
  } catch {
    // no report: the step's exit code says what happened
  }
  return entry;
}

/** The three workflow jobs' verdicts and their PR comments in one file, for reading locally (posting it anywhere is optional). */
export function renderGateSummary(o: { production: string; candidate: string; entries: GateSummaryEntry[]; code: number; at: string }): string {
  const verdictOf = (e: GateSummaryEntry) => (e.code === "skipped" ? "not run" : e.verdict ? `${e.verdict.toUpperCase()}${e.overridden ? " (OVERRIDDEN)" : ""}` : e.code === 0 ? "ok" : `exit ${e.code}`);
  const lines = [`## Release gate: ${o.candidate} beside ${o.production}`, "", `${o.at} — exit code **${o.code}**`, "", "| step | result | report |", "| --- | --- | --- |"];
  for (const e of o.entries) lines.push(`| ${e.title} | ${verdictOf(e)} | ${e.runDir ? `\`${e.runDir}\`` : ""} |`);
  lines.push("");
  for (const e of o.entries) {
    if (!e.markdown) continue;
    lines.push(`<details><summary>${e.title}: ${verdictOf(e)}</summary>`, "", e.markdown, "", "</details>", "");
  }
  return lines.join("\n");
}

export function writeGateSummary(outRoot: string, at: Date, o: Parameters<typeof renderGateSummary>[0]): { md: string; json: string } {
  const dir = resolve(outRoot, `${at.toISOString().replace(/[:.]/g, "-").slice(0, 19)}-gate`);
  mkdirSync(dir, { recursive: true });
  const md = join(dir, "gate.md");
  const json = join(dir, "gate.json");
  writeFileSync(md, renderGateSummary(o));
  writeFileSync(json, JSON.stringify({ production: o.production, candidate: o.candidate, at: o.at, code: o.code, steps: o.entries.map(({ markdown: _m, ...rest }) => rest) }, null, 2));
  return { md, json };
}

// ---- the watch loop -------------------------------------------------------------------------------

export function parseInterval(text: string): number {
  const m = /^(\d+)\s*(s|m|h)$/.exec(text.trim());
  if (!m) throw new Error(`--interval takes a number and a unit, e.g. 15m, 90s or 1h (got "${text}")`);
  const ms = Number(m[1]) * { s: 1000, m: 60_000, h: 3_600_000 }[m[2] as "s" | "m" | "h"];
  if (ms < 10_000) throw new Error("--interval must be at least 10s: every iteration opens a browser against production");
  return ms;
}

export interface WatchDeps {
  /** `verdict` is the run's own (`report.json`), when it wrote one: exit 0 covers both `pass` and an advisory `warn`. */
  runOnce: () => { code: number; runDir?: string; verdict?: string };
  sleep: (ms: number) => Promise<void>;
  now: () => Date;
  log: (message: string) => void;
  /** A failing comparison: write what the `rollback` issue would have said. */
  onFailure: (info: { at: Date; runDir?: string }) => void;
  shouldStop: () => boolean;
}

/**
 * Compare production with the recorded candidate now, and again every `intervalMs`
 * until told to stop. Never exits on a FAIL: it records it and goes on, like the
 * schedule does. `max` bounds it for the tests and for `--once`.
 */
export async function watch(o: { intervalMs: number; max?: number }, deps: WatchDeps): Promise<{ iterations: number; failures: number; lastCode: number }> {
  let iterations = 0;
  let failures = 0;
  let lastCode = 0;
  while (!deps.shouldStop() && (o.max === undefined || iterations < o.max)) {
    const started = deps.now();
    const { code, runDir, verdict } = deps.runOnce();
    iterations += 1;
    lastCode = code;
    // The line is printed when the run ENDS (about twenty seconds after it started): stamp it with that time and say when the run started.
    const at = `${deps.now().toISOString()} watch: (run started ${started.toISOString()})`;
    if (code === 1) {
      failures += 1;
      deps.onFailure({ at: started, ...(runDir ? { runDir } : {}) });
      deps.log(`${at} production DIFFERS from the recorded candidate${runDir ? ` (${runDir})` : ""}`);
    } else if (code === 0 && verdict === "warn") {
      // Exit 0 is also an advisory WARN (no clean A/A, or the deployed images not confirmed): it found differences and may not call them a FAIL.
      deps.log(`${at} verdict WARN, advisory only: production may differ from the recorded candidate${runDir ? `; read ${runDir}` : ""}`);
    } else if (code === 0) deps.log(`${at} production matches the recorded candidate`);
    else deps.log(`${at} could not judge (exit ${code}); trying again next time`);
    if (o.max !== undefined && iterations >= o.max) break;
    // Keep the schedule: the next run is one interval after this one STARTED.
    const wait = Math.max(0, o.intervalMs - (deps.now().getTime() - started.getTime()));
    await deps.sleep(wait);
  }
  return { iterations, failures, lastCode };
}
