import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { renderChangesHtml, renderChangesMarkdown } from "../changes/render.ts";
import { CHANGES_FILE, type Changes } from "../changes/signals.ts";
import { DigestError, parseDigests } from "../digests.ts";
import { isTag } from "../release-record.ts";
import type { Confidence, GateWord } from "../score/confidence.ts";
import { scoreAndWrite } from "../score/read.ts";
import { rcsLine, renderDeductionsMarkdown, renderScoreHtml, renderScoreMarkdown } from "../score/render.ts";
import type { NoiseStatus, RunReport } from "../types.ts";
import { formatElapsed } from "./compare.ts";
import { readStatus, type StatusReport } from "./noise-store.ts";
import {
  LATEST_NOISE,
  WORKFLOW_DEFAULTS,
  commandLine,
  executePlan,
  planGate,
  readGateEntry,
  stampedDir,
  writeGateSummary,
  type Executor,
  type GateSummaryEntry,
  type Step,
  type StepResult
} from "./tasks.ts";

/**
 * `harness release --candidate <tag>`: from a pushed candidate to a report.html, with nothing asked in between.
 *
 * It is the gate's plan (`planGate`, the steps `harness local gate` and release.yml run) cut into stages, each of which
 * prints one line when it ends and is recorded in `<out>/<timestamp>-release-command/status.json` as it goes, so a
 * dashboard can say "running: release, 14 of 25 min":
 *
 *   resolve    the baseline (--baseline, else release/deployed.json in the monorepo, else HARNESS_PRODUCTION_TAG), images ensure
 *   noise      the local noise store's A/A when it is clean and at most 7 days old, else an A/A of the baseline (3 runs)
 *   changes    harness changes --a <baseline> --b <candidate> in the monorepo checkout (C1): changes.json, the per-PR
 *              risk lines the score's change risk reads; skipped, with the reason, when there is no checkout
 *   release    --mode release, 3 runs, k6 20x30s, the claims, the rules, that A/A
 *   rehearse   migration, then upgrade (skipped only with --fast)
 *   score      confidence.json: the Release Confidence Score (C0) from the release, migration and upgrade runs; the
 *              glance (C3) and the 5 Whys stubs (C4) are not built yet
 *   report     report.md, report.html, gate.md, gate.json in the same directory, led by the Gate, then the RCS
 *
 * Jidoka: a stage that cannot hand good work to the next stops the line (missing images, a dirty A/A before any A/B, a
 * gate FAIL), and the terminal and the summary say "line stopped at <stage>: <why>" and the next standard step. The
 * coffee contract: it asks nothing, retries nothing silently, and leaves a report behind whatever happened, Ctrl-C
 * included (the stacks are taken down first). Exit codes are the gate's: 0 pass or warn, 1 FAIL, 2 could not judge or
 * usage. Nothing in the seams can change one: the score is computed after the exit code is known and is not an input to it.
 */

export const RELEASE_DEFAULTS = { runs: 3, load: WORKFLOW_DEFAULTS.load, noiseRuns: 3, noiseMaxAgeDays: 7 } as const;

export const STAGES = ["resolve", "noise", "changes", "release", "rehearse", "score", "report"] as const;
export type StageName = (typeof STAGES)[number];

/** The plan's estimates, in seconds, for "14 of 25 min"; `--fast` is one run with no load. Never a timeout. */
export function expectedSeconds(stage: StageName, fast: boolean): number {
  const full: Record<StageName, number> = { resolve: 8 * 60, noise: 20 * 60, changes: 60, release: 25 * 60, rehearse: 10 * 60, score: 10, report: 10 };
  return fast && stage === "release" ? 10 * 60 : full[stage];
}

/** The subdirectory suffix: not `-release`, which is release mode's own run directory (`runDirs(out, "release")`). */
export const COMMAND_DIR_SUFFIX = "release-command";

export const FAST_BANNER = "--fast: one run, no load, no rehearsals. This report cannot be used for a go decision.";

// ---- the baseline -------------------------------------------------------------------------------------

/** What production runs, as the deploy wrote it: `release/deployed.json` in the monorepo. */
export interface DeployedFile {
  tag: string;
  deployedAt?: string;
  digests?: Record<string, string>;
}

export interface Baseline {
  tag: string;
  /** Where it came from, as the first line prints it. */
  how: string;
  /** `--a-digests` for every step, when deployed.json pinned them. */
  digests?: string;
}

/** The baseline cannot be told: a usage error, exit 2, before anything runs. */
export class BaselineError extends Error {}

export const DEPLOYED_FILE = join("release", "deployed.json");

export function parseDeployed(text: string, file: string): DeployedFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BaselineError(`${file} is not JSON`);
  }
  const o = raw as { tag?: unknown; deployedAt?: unknown; digests?: unknown } | null;
  if (!o || typeof o !== "object" || typeof o.tag !== "string" || !isTag(o.tag.trim())) throw new BaselineError(`${file} has no usable "tag" (expected {"tag": "16.2.2", "deployedAt": "...", "digests"?: {...}})`);
  if (o.deployedAt !== undefined && typeof o.deployedAt !== "string") throw new BaselineError(`${file}: "deployedAt" must be a string`);
  let digests: Record<string, string> | undefined;
  if (o.digests !== undefined && o.digests !== null) {
    try {
      digests = parseDigests(JSON.stringify(o.digests), `${file} digests`) as Record<string, string> | undefined;
    } catch (e) {
      throw new BaselineError(e instanceof DigestError ? e.message : String(e));
    }
  }
  return { tag: o.tag.trim(), ...(typeof o.deployedAt === "string" ? { deployedAt: o.deployedAt } : {}), ...(digests ? { digests } : {}) };
}

/**
 * `--baseline <tag>` as given; `prod` or nothing reads `release/deployed.json` in the monorepo checkout (`--monorepo`,
 * else HARNESS_MONOREPO_DIR), else HARNESS_PRODUCTION_TAG (not the workflows' placeholder `main`), else a usage error.
 * A deployed.json that is there and unusable is an error, never skipped: it is what production says it runs.
 */
export function resolveBaseline(o: { baseline?: string; monorepo?: string; env: NodeJS.ProcessEnv }): Baseline {
  const given = o.baseline?.trim();
  if (given && given !== "prod") {
    if (!isTag(given)) throw new BaselineError(`--baseline takes a tag (e.g. 16.2.2) or prod, not "${given}"`);
    return { tag: given, how: "given with --baseline" };
  }
  const monorepo = o.monorepo?.trim() || o.env.HARNESS_MONOREPO_DIR?.trim();
  let why: string;
  if (monorepo) {
    const file = join(monorepo, DEPLOYED_FILE);
    if (existsSync(file)) {
      const d = parseDeployed(readFileSync(file, "utf8"), file);
      return { tag: d.tag, how: `${file}${d.deployedAt ? `, deployed ${d.deployedAt}` : ""}${d.digests ? ", pinned by digest" : ""}`, ...(d.digests ? { digests: JSON.stringify(d.digests) } : {}) };
    }
    why = `${file} does not exist`;
  } else why = "no monorepo checkout was given (--monorepo or HARNESS_MONOREPO_DIR)";
  const fallback = o.env.HARNESS_PRODUCTION_TAG?.trim();
  if (fallback && fallback !== WORKFLOW_DEFAULTS.productionTag) return { tag: fallback, how: `HARNESS_PRODUCTION_TAG, because ${why}` };
  throw new BaselineError(`cannot tell what production runs: ${why}, and HARNESS_PRODUCTION_TAG is not set to a release. Pass --baseline <tag>, or --monorepo <checkout> with ${DEPLOYED_FILE.replaceAll("\\", "/")}.`);
}

// ---- the noise stage's decision -----------------------------------------------------------------------

/** Reuse the store's A/A, run one, or (--fast) do neither. `noise` is what the release step's `--noise` gets. */
export type NoiseDecision = { action: "reuse"; noise: string; why: string } | { action: "run"; why: string } | { action: "skip"; noise: string; why: string };

export function decideNoise(store: StatusReport, fast: boolean): NoiseDecision {
  if (store.licensesFail) return { action: "reuse", noise: store.file, why: `reusing the local noise store: ${store.why}` };
  if (fast) return { action: "skip", noise: store.usable ? store.file : "none", why: `--fast runs no A/A, so the release step is advisory (WARN, never FAIL): ${store.why}` };
  return { action: "run", why: `an A/A of the baseline first: ${store.why}` };
}

// ---- the plan -----------------------------------------------------------------------------------------

export interface ReleaseOptions {
  candidate: string;
  baseline: Baseline;
  claims?: string;
  rules?: string;
  fast: boolean;
  /** Given with --out: every run step writes there too. */
  out?: string;
  /** The score's optional inputs (--test-signal, --traceability, --change-risk, --post-deploy), as given. */
  score?: ScoreExtras;
  /** The monorepo checkout (--monorepo or HARNESS_MONOREPO_DIR): where `harness changes` reads git. */
  monorepo?: string;
}

/** The score's optional inputs: files a later phase or the monorepo writes. */
export interface ScoreExtras {
  testSignal?: string;
  traceability?: string;
  changeRisk?: string;
  postDeploy?: string;
}

export interface PlannedStage {
  stage: StageName;
  title: string;
  steps: Step[];
  /** Planned as skipped, and why. */
  skip?: string;
}

/** The seams later phases fill (C3 glance, C4 5 Whys). Until then they say so; they never make data up. */
export const NOT_BUILT = { glance: "not built yet (C3)", whys: "not built yet (C4)" } as const;

/** Where the changes step writes changes.json: the command's own directory, known only once it runs. */
export const CHANGES_OUT = "<release-command dir>/changes.json";

/** Why the changes stage is skipped without a checkout: change risk is then not measured, never assumed. */
export const NO_MONOREPO = "no monorepo checkout (--monorepo or HARNESS_MONOREPO_DIR), so no git to read: change risk stays not measured";

export function planRelease(o: ReleaseOptions, noise: NoiseDecision): PlannedStage[] {
  const b = o.baseline.tag;
  const out = o.out ? ["--out", o.out] : [];
  const gate = planGate({
    production: b,
    candidate: o.candidate,
    runs: o.fast ? 1 : RELEASE_DEFAULTS.runs,
    load: o.fast ? false : RELEASE_DEFAULTS.load,
    ...(o.claims ? { claims: o.claims } : {}),
    ...(o.rules ? { rules: o.rules } : {}),
    ...(o.baseline.digests ? { productionDigests: o.baseline.digests } : {}),
    ...(o.fast ? { only: "release" as const } : {})
  });
  const step = (id: string) => gate.steps.find((s) => s.id === id);
  const withOut = (s: Step): Step => ({ ...s, argv: [...s.argv, ...out] });
  const release = step("release")!;
  const pins = o.baseline.digests ? ["--a-digests", o.baseline.digests, "--b-digests", o.baseline.digests] : [];
  const aa: Step = {
    id: "noise",
    title: `A/A on ${b}, ${RELEASE_DEFAULTS.noiseRuns} runs, k6 ${RELEASE_DEFAULTS.load}`,
    argv: ["run", "--mode", "noise", "--a", b, "--b", b, "--runs", String(RELEASE_DEFAULTS.noiseRuns), "--load", RELEASE_DEFAULTS.load, "--require-verified", ...pins, ...out],
    stream: "noise",
    gatesStream: true
  };
  const noiseArg = noise.action === "run" ? LATEST_NOISE : noise.noise;
  return [
    { stage: "resolve", title: `the baseline ${b} (${o.baseline.how}); pull and verify, or build, both sides`, steps: [step("ensure")!] },
    noise.action === "run" ? { stage: "noise", title: noise.why, steps: [aa] } : { stage: "noise", title: noise.why, steps: [], skip: noise.why },
    o.monorepo
      ? { stage: "changes", title: `what changed between ${b} and ${o.candidate}: per-PR risk lines`, steps: [{ id: "changes", title: `harness changes ${b}..${o.candidate}`, argv: ["changes", "--a", b, "--b", o.candidate, "--monorepo", o.monorepo, "--out", CHANGES_OUT], stream: "changes", gatesStream: false, informational: true }] }
      : { stage: "changes", title: "what changed between the two tags", steps: [], skip: NO_MONOREPO },
    {
      stage: "release",
      title: `release mode: ${o.candidate} beside ${b}, ${o.fast ? "1 run, no load" : `${RELEASE_DEFAULTS.runs} runs, k6 ${RELEASE_DEFAULTS.load}`}, ${o.claims ? "with the claims" : "no claims"}`,
      steps: [withOut({ ...release, title: `release mode: A/B${o.claims ? ", claims" : ""}${o.fast ? "" : ", k6"}`, argv: [...release.argv, "--noise", noiseArg] })]
    },
    o.fast ? { stage: "rehearse", title: "migration, then upgrade", steps: [], skip: "--fast: no rehearsals" } : { stage: "rehearse", title: "migration, then upgrade", steps: [withOut(step("migration")!), withOut(step("upgrade")!)] },
    { stage: "score", title: "the score (confidence.json); the glance and the 5 Whys stubs are not built yet", steps: [] },
    { stage: "report", title: "report.md, report.html, gate.md, gate.json", steps: [] }
  ];
}

/** `--dry-run`: the baseline, the noise decision and every command, and nothing pulled or run. */
export function renderReleasePlan(o: { candidate: string; baseline: Baseline; fast: boolean; stages: PlannedStage[]; env: Record<string, string>; platform?: NodeJS.Platform }): string {
  const lines = [`harness release: ${o.candidate} beside ${o.baseline.tag} (${o.baseline.how})${o.fast ? `\n${FAST_BANNER}` : ""}`, ""];
  const set = Object.entries(o.env);
  if (set.length) lines.push(`environment: ${set.map(([k, v]) => `${k}=${commandLine([v], o.platform)}`).join(" ")}`, "");
  o.stages.forEach((s, i) => {
    lines.push(`  ${i + 1}. ${s.stage}: ${s.title}`);
    if (s.skip && !s.steps.length && s.skip !== s.title) lines.push(`       skipped: ${s.skip}`);
    for (const step of s.steps) lines.push(`       harness ${commandLine(step.argv, o.platform)}`);
  });
  lines.push("", `dry run: nothing was pulled or run (${o.candidate} beside ${o.baseline.tag})`);
  return lines.join("\n");
}

// ---- progress: status.json ----------------------------------------------------------------------------

export type StageState = "pending" | "running" | "done" | "failed" | "skipped" | "interrupted";

export interface StageStatus {
  stage: StageName;
  state: StageState;
  startedAt?: string;
  /** Seconds, once the stage has ended. While it runs, now minus startedAt. */
  elapsed?: number;
  /** The plan's estimate in seconds, for "14 of 25 min". */
  expected: number;
  note?: string;
}

export interface ReleaseStatus {
  schemaVersion: 1;
  command: "release";
  candidate: string;
  baseline: string;
  fast: boolean;
  startedAt: string;
  updatedAt: string;
  state: "running" | "finished" | "interrupted";
  /** The stage running now; null when none is. */
  stage: StageName | null;
  /** Where the line stopped, when it did. */
  stopped?: { stage: StageName; why: string; next: string };
  exitCode?: number;
  stages: StageStatus[];
}

/** status.json, rewritten whole at every change: a reader never sees half a file for long, and never needs the history. */
export class Progress {
  readonly status: ReleaseStatus;
  private readonly started = new Map<StageName, number>();
  constructor(
    readonly file: string,
    o: { candidate: string; baseline: string; fast: boolean },
    private readonly now: () => Date,
    private readonly say: (line: string) => void
  ) {
    const at = now().toISOString();
    this.status = { schemaVersion: 1, command: "release", candidate: o.candidate, baseline: o.baseline, fast: o.fast, startedAt: at, updatedAt: at, state: "running", stage: null, stages: STAGES.map((stage) => ({ stage, state: "pending", expected: expectedSeconds(stage, o.fast) })) };
    this.write();
  }

  private entry(stage: StageName): StageStatus {
    return this.status.stages.find((s) => s.stage === stage)!;
  }

  start(stage: StageName): void {
    const e = this.entry(stage);
    this.started.set(stage, this.now().getTime());
    e.state = "running";
    e.startedAt = this.now().toISOString();
    this.status.stage = stage;
    this.write();
  }

  /** End a stage and print its one line: `[3/7] release  failed  24m 10s  gate FAIL`. */
  end(stage: StageName, state: Exclude<StageState, "pending" | "running">, note?: string): void {
    const e = this.entry(stage);
    const began = this.started.get(stage);
    e.state = state;
    if (began !== undefined) e.elapsed = Math.round((this.now().getTime() - began) / 1000);
    if (note) e.note = note;
    if (this.status.stage === stage) this.status.stage = null;
    this.write();
    const n = STAGES.indexOf(stage) + 1;
    this.say(`[${n}/${STAGES.length}] ${stage.padEnd(8)} ${state.padEnd(11)} ${(e.elapsed === undefined ? "-" : formatElapsed(e.elapsed)).padEnd(8)} ${note ?? ""}`.trimEnd());
  }

  stop(stage: StageName, why: string, next: string): void {
    this.status.stopped ??= { stage, why, next };
    this.say(`line stopped at ${stage}: ${why}`);
    this.say(`  next: ${next}`);
    this.write();
  }

  finish(state: "finished" | "interrupted", exitCode: number): void {
    this.status.state = state;
    this.status.exitCode = exitCode;
    this.status.stage = null;
    this.write();
  }

  write(): void {
    this.status.updatedAt = this.now().toISOString();
    writeFileSync(this.file, `${JSON.stringify(this.status, null, 2)}\n`);
  }
}

// ---- the seams ----------------------------------------------------------------------------------------

/** What a seam gives the summary: its section, and nothing that can reach an exit code. */
export interface SeamResult {
  state: "done" | "skipped";
  note: string;
  markdown?: string;
  /** The score seam's result, for the lead of the summary. */
  confidence?: Confidence;
  /** The changes seam's result: the per-PR table goes under the score. */
  changes?: Changes;
  /** Where the seam wrote its file. */
  file?: string;
}

export interface SeamInput {
  candidate: string;
  baseline: Baseline;
  dir: string;
  entries: GateSummaryEntry[];
  /** The Gate, already decided: the score reads it and cannot change it. */
  gate: GateWord;
  score?: ScoreExtras;
  /** changes.json, when the changes stage wrote one: the score reads it as --change-risk unless one was given. */
  changes?: string;
}

/**
 * C1: `harness changes --a <baseline> --b <candidate>` in the monorepo checkout, as a child like every other step, writing
 * changes.json into the command's directory. Its exit code is not an input to anything: orphans, a missing token, even a
 * failure to run are reported in the stage's note and leave change risk "not measured"; they never stop the line.
 */
export function changesStage(i: SeamInput, step: Step | undefined, harness: (argv: string[]) => number, skip = NO_MONOREPO): SeamResult {
  if (!step) return { state: "skipped", note: skip };
  const file = join(i.dir, CHANGES_FILE);
  const code = harness(step.argv.map((a) => (a === CHANGES_OUT ? file : a)));
  if (!existsSync(file)) return { state: "skipped", note: `harness changes exit ${code} wrote no changes.json: change risk stays not measured` };
  const c = JSON.parse(readFileSync(file, "utf8")) as Changes;
  const risky = c.prs.filter((p) => p.deductions.length).length;
  const nm = c.notMeasured.length ? `; not measured: ${c.notMeasured.map((n) => n.signal).join(", ")}` : "";
  return { state: "done", note: `change risk ${c.score}: ${risky} of ${c.prs.length} line(s) lost points${c.floorBreached ? ", floor breached" : ""}${nm}; changes.json`, markdown: renderChangesMarkdown(c), changes: c, file };
}

/**
 * C0: confidence.json in the command's directory, from the release, migration and upgrade runs (and the optional inputs).
 * C3 and C4 fill the rest: the glance, and the 5 Whys stubs for a FAIL or a Red band. No release run, nothing to score.
 */
export function scoreStage(i: SeamInput): SeamResult {
  const runDir = (id: string) => i.entries.find((e) => e.id === id)?.runDir;
  const release = runDir("release");
  if (!release) return { state: "skipped", note: "no release run to score" };
  const migration = runDir("migration");
  const upgrade = runDir("upgrade");
  // An explicit --change-risk wins; else the changes stage's changes.json.
  const changeRisk = i.score?.changeRisk ?? i.changes;
  const { confidence: c } = scoreAndWrite({ outDir: i.dir, gate: i.gate, release, ...(migration ? { migration } : {}), ...(upgrade ? { upgrade } : {}), ...i.score, ...(changeRisk ? { changeRisk } : {}), candidate: i.candidate, baseline: i.baseline.tag });
  const measured = c.dimensions.filter((d) => d.status === "measured").length;
  return { state: "done", note: `${c.rcs === null ? `no RCS (Gate ${c.gate})` : `RCS ${c.rcs} ${c.band}`}; ${measured} of ${c.dimensions.length} dimensions measured; confidence.json`, markdown: renderDeductionsMarkdown(c), confidence: c };
}

/** A seam that throws is a finding about the seam, never about the release: it is reported and the exit code is left alone. Ctrl-C still ends the plan. */
function runSeam(seam: (i: SeamInput) => SeamResult, input: SeamInput): SeamResult {
  try {
    return seam(input);
  } catch (e) {
    if (e instanceof Interrupted) throw e;
    return { state: "skipped", note: `failed, and changes nothing: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ---- exit codes ---------------------------------------------------------------------------------------

/**
 * The command's exit code, from the codes of the steps that judge (the gate's rule: the worst of them) and whether the line
 * stopped before judging. A seam is not an input: nothing the score, the glance or the changes say can move it.
 */
export function releaseExitCode(o: { codes: (number | "skipped")[]; notJudged: boolean }): number {
  let worst = o.notJudged ? 2 : 0;
  for (const c of o.codes) worst = Math.max(worst, c === "skipped" ? 0 : c > 2 ? 2 : c);
  return worst;
}

/** The one word the summary opens with. */
export function gateWord(code: number, entries: GateSummaryEntry[]): GateWord {
  if (code === 2) return "NOT JUDGED";
  if (code === 1) return "FAIL";
  if (entries.some((e) => e.overridden)) return "FAIL (OVERRIDDEN)";
  return entries.some((e) => e.verdict === "warn") ? "WARN" : "PASS";
}

// ---- running it ---------------------------------------------------------------------------------------

/** Thrown out of a step when Ctrl-C was pressed; caught by {@link runRelease}, which takes the stacks down. */
export class Interrupted extends Error {}

export interface ReleaseDeps {
  ex: Executor;
  env: Record<string, string>;
  now: () => Date;
  say: (line: string) => void;
  /** True once Ctrl-C was pressed. */
  interrupted: () => boolean;
  /** Open report.html (`--open`). */
  open?: (file: string) => void;
}

export interface ReleaseRun extends ReleaseOptions {
  /** Where `<timestamp>-release-command/` goes (the run steps' output root). */
  outRoot: string;
  noise: NoiseDecision;
}

export interface ReleaseOutcome {
  code: number;
  dir: string;
  files: { status: string; md: string; html: string; gateMd: string; gateJson: string; confidence?: string; changes?: string };
}

/** Why a stage stopped the line, and the next standard step. */
const NEXT = {
  images: (b: string, c: string) => `make both sides exist and be signed (check the tags on the registry, or run \`harness images ensure --a ${b} --b ${c}\` and read why), then run this command again`,
  noiseDirty: "review each difference below: a mask in normalise/masks.yaml in its own PR, or a determinism fix (docs/noise-burndown.md, \"Mask or determinism fix\"); then `harness local nightly` for a clean A/A, and run this command again",
  noiseNone: "read the A/A output above and fix what stopped it; nothing was compared",
  fail: "read report.html: each unclaimed difference is claimed in release/claims.yaml or fixed in a new candidate; then run this command again on the new rc. A FAIL is overridden only as docs/contract.md, \"Overriding a FAIL\" says",
  notJudged: (what: string) => `read the ${what} output above: the harness could not judge, which is a harness or environment problem to fix, not a verdict`,
  interrupted: "the stacks were taken down; run the same command again when ready"
} as const;

/** The hunks of a dirty A/A: each is a difference between two identical stacks, so each needs a mask reviewed or a determinism fix. */
export function noiseReview(runDir: string | undefined): string[] {
  if (!runDir) return [];
  try {
    const report = JSON.parse(readFileSync(join(runDir, "report.json"), "utf8")) as RunReport;
    const hunks = report.compare.unclaimed.length ? report.compare.unclaimed : report.compare.hunks.filter((h) => h.severity === "fail");
    return hunks.map((h) => `${h.artefact} ${h.scope}: ${h.summary}`);
  } catch {
    return [];
  }
}

export function runRelease(r: ReleaseRun, deps: ReleaseDeps): ReleaseOutcome {
  const at = deps.now();
  const dir = stampedDir(r.outRoot, at, COMMAND_DIR_SUFFIX);
  mkdirSync(dir, { recursive: true });
  const progress = new Progress(join(dir, "status.json"), { candidate: r.candidate, baseline: r.baseline.tag, fast: r.fast }, deps.now, deps.say);
  const stages = planRelease(r, r.noise);
  const planned = (name: StageName) => stages.find((s) => s.stage === name)!;
  const results: StepResult[] = [];
  const seams: Partial<Record<"changes" | "score", SeamResult>> = {};
  let review: string[] = [];
  let notJudged = false;
  let halted = false;
  let current: StageName = "resolve";

  // Every step goes through here: a Ctrl-C before or during it ends the plan, not just the step.
  const ex: Executor = {
    ...deps.ex,
    harness: (argv, env) => {
      if (deps.interrupted()) throw new Interrupted();
      const code = deps.ex.harness(argv, env);
      if (deps.interrupted()) throw new Interrupted();
      return code;
    }
  };
  const run = (steps: Step[]) => {
    const outcome = executePlan({ task: "gate", steps }, deps.env, ex);
    results.push(...outcome.results);
    return outcome;
  };
  const seamInput = (gate: GateWord): SeamInput => ({ candidate: r.candidate, baseline: r.baseline, dir, entries: results.map(readGateEntry), gate, ...(r.score ? { score: r.score } : {}), ...(seams.changes?.file ? { changes: seams.changes.file } : {}) });

  let interrupted = false;
  try {
    // resolve: the baseline was resolved before this was called (a usage error must not leave a directory behind); the images now.
    current = "resolve";
    progress.start("resolve");
    const ensure = run(planned("resolve").steps);
    if (ensure.code !== 0) {
      notJudged = true;
      halted = true;
      progress.end("resolve", "failed", `images ensure exit ${ensure.code}`);
      progress.stop("resolve", `the images of ${r.baseline.tag} or ${r.candidate} could not be obtained or verified (images ensure exit ${ensure.code}); nothing was compared`, NEXT.images(r.baseline.tag, r.candidate));
    } else progress.end("resolve", "done", `baseline ${r.baseline.tag} (${r.baseline.how})`);

    // noise: reuse, run, or (--fast) neither. A dirty A/A stops the line before any A/B.
    current = "noise";
    let noiseDir: string | undefined;
    if (halted) progress.end("noise", "skipped", "not run: the line stopped at resolve");
    else {
      const n = planned("noise");
      if (!n.steps.length) {
        progress.start("noise");
        progress.end("noise", r.noise.action === "reuse" ? "done" : "skipped", n.skip);
      } else {
        progress.start("noise");
        const aa = run(n.steps);
        noiseDir = aa.results[0]?.runDir;
        const status = noiseDir ? readStatus(noiseDir) : undefined;
        const found: NoiseStatus | undefined = status?.status;
        if (!found) {
          notJudged = true;
          halted = true;
          progress.end("noise", "failed", `no usable noise-status.json (exit ${aa.results[0]?.code ?? "not run"})`);
          progress.stop("noise", "the A/A produced no usable noise-status.json, so no A/B was attempted", NEXT.noiseNone);
        } else if (!found.clean) {
          notJudged = true;
          halted = true;
          review = noiseReview(noiseDir);
          progress.end("noise", "failed", `dirty A/A: ${found.hunks} difference(s)`);
          progress.stop("noise", `the A/A of ${r.baseline.tag} is dirty (${found.hunks} difference(s) between two identical stacks), so no A/B was attempted`, NEXT.noiseDirty);
          for (const line of review) deps.say(`  needs a mask reviewed or a determinism fix: ${line}`);
        } else progress.end("noise", "done", found.degraded?.length ? `clean, but degraded (the release step will only warn): ${found.degraded.join("; ")}` : "clean A/A");
      }
    }

    // changes: C1, advisory. Its exit code goes nowhere near the gate's (it is not added to the results).
    current = "changes";
    progress.start("changes");
    const cs = planned("changes");
    seams.changes = runSeam((i) => changesStage(i, cs.steps[0], (argv) => ex.harness(argv, deps.env), cs.skip), seamInput("NOT JUDGED"));
    progress.end("changes", seams.changes.state, seams.changes.note);

    // release: the A/B. A FAIL stops the line for a go decision; the rehearsals still run, as the gate's do, for the evidence.
    current = "release";
    if (halted) {
      const why = `not run: the line stopped at ${progress.status.stopped?.stage}`;
      progress.end("release", "skipped", why);
      progress.end("rehearse", "skipped", why);
    } else {
      progress.start("release");
      const steps = planned("release").steps.map((s) => ({ ...s, argv: s.argv.map((a) => (a === LATEST_NOISE ? noiseDir! : a)) }));
      const rel = run(steps);
      const entry = readGateEntry(rel.results[0]!);
      const verdict = entry.verdict ? entry.verdict.toUpperCase() : `exit ${rel.code}`;
      if (rel.code === 0) progress.end("release", "done", `gate ${verdict}${entry.overridden ? " (OVERRIDDEN)" : ""}`);
      else if (rel.code === 1) {
        progress.end("release", "failed", `gate ${verdict}`);
        progress.stop("release", `the gate FAILED: ${entry.reasons?.[0] ?? "see the report"}`, NEXT.fail);
      } else {
        progress.end("release", "failed", `could not judge (exit ${rel.code})`);
        progress.stop("release", `the release run could not judge (exit ${rel.code})`, NEXT.notJudged("release run's"));
      }

      current = "rehearse";
      const rehearse = planned("rehearse");
      if (!rehearse.steps.length) {
        progress.start("rehearse");
        progress.end("rehearse", "skipped", rehearse.skip);
      } else {
        progress.start("rehearse");
        const reh = run(rehearse.steps);
        const failed = reh.results.filter((x) => x.code !== 0);
        progress.end("rehearse", failed.length ? "failed" : "done", reh.results.map((x) => `${x.id} ${readGateEntry(x).verdict?.toUpperCase() ?? (x.code === "skipped" ? "not run" : `exit ${x.code}`)}`).join(", "));
        if (failed.length) progress.stop("rehearse", `${failed.map((x) => x.id).join(" and ")} did not pass`, reh.code === 1 ? "read the rehearsal's report.html: a migration that breaks expand/contract or a rollout that drops requests is fixed in the candidate, not claimed" : NEXT.notJudged("rehearsal's"));
      }
    }
  } catch (e) {
    if (!(e instanceof Interrupted)) throw e;
    interrupted = true;
    progress.end(current, "interrupted", "Ctrl-C");
    deps.say("interrupted: taking the stacks down (harness stack down)");
    const down = deps.ex.harness(["stack", "down", "--a", r.baseline.tag, "--b", r.candidate], deps.env);
    if (down !== 0) deps.say(`  stack down exit ${down}: check \`docker ps\` for what is left`);
    progress.stop(current, "interrupted with Ctrl-C", NEXT.interrupted);
    for (const s of STAGES.slice(STAGES.indexOf(current) + 1)) if (s !== "report") progress.end(s, "skipped", "interrupted");
  }

  // The exit code and the Gate are decided here, before the score exists: nothing the score says can reach them.
  const allSteps = stages.filter((s) => s.stage !== "changes").flatMap((s) => s.steps);
  const entries: GateSummaryEntry[] = allSteps.map((s) => {
    const done = results.find((x) => x.id === s.id);
    return done ? readGateEntry(done) : { id: s.id, title: s.title, code: "skipped" };
  });
  const code = releaseExitCode({ codes: results.map((x) => x.code), notJudged: notJudged || interrupted });
  const gate = gateWord(code, entries);

  // score: confidence.json (C0), a seam for the glance (C3) and the 5 Whys (C4). It runs whatever happened above, and never fails.
  if (!interrupted) {
    progress.start("score");
    seams.score = runSeam(scoreStage, seamInput(gate));
    progress.end("score", seams.score.state, seams.score.note);
  }
  const conf = seams.score?.confidence;
  const changes = seams.changes?.changes;

  // report: always.
  progress.start("report");
  const at2 = deps.now();
  const summary = { production: r.baseline.tag, candidate: r.candidate, entries, code, at: at2.toISOString(), gate, ...(r.fast ? { banner: FAST_BANNER } : {}), ...(conf ? { score: `${renderScoreMarkdown(conf)}${changes ? `\n\n#### Change risk per PR\n\n${renderChangesMarkdown(changes)}` : ""}` } : {}) };
  const gateFiles = writeGateSummary(r.outRoot, at2, summary, dir);
  const md = join(dir, "report.md");
  const html = join(dir, "report.html");
  const gateMd = readFileSync(gateFiles.md, "utf8");
  writeFileSync(md, renderReleaseMarkdown({ gateMd, status: progress.status, code, review, seams }));
  writeFileSync(html, renderReleaseHtml({ dir, gate, fast: r.fast, candidate: r.candidate, baseline: r.baseline, code, entries, status: progress.status, review, seams }));
  progress.end("report", "done", `report.md, report.html, gate.md, gate.json${conf ? ", confidence.json" : ""}${changes ? ", changes.json" : ""}`);
  progress.finish(interrupted ? "interrupted" : "finished", code);
  deps.say(`gate: ${gate}${r.fast ? " (--fast: not for a go decision)" : ""} -> exit ${code}`);
  if (conf) deps.say(`confidence: ${rcsLine(conf)}`);
  deps.say(`report: ${html}`);
  if (r.fast) deps.say(FAST_BANNER);
  if (deps.open) deps.open(html);
  return { code, dir, files: { status: progress.file, md, html, gateMd: gateFiles.md, gateJson: gateFiles.json, ...(conf ? { confidence: join(dir, "confidence.json") } : {}), ...(seams.changes?.file ? { changes: seams.changes.file } : {}) } };
}

// ---- the summary --------------------------------------------------------------------------------------

type Seams = Partial<Record<"changes" | "score", SeamResult>>;

/** report.md: the gate first (the andon), the RCS and its dimensions under it (in gate.md), then where the line stopped, the stages, and the seams still to be filled. */
export function renderReleaseMarkdown(o: { gateMd: string; status: ReleaseStatus; code: number; review: string[]; seams: Seams }): string {
  const lines = [o.gateMd.trimEnd(), ""];
  if (o.status.stopped) lines.push(`### Line stopped at ${o.status.stopped.stage}`, "", o.status.stopped.why, "", `Next standard step: ${o.status.stopped.next}`, "");
  if (o.review.length) lines.push("#### The A/A differences (each needs a mask reviewed or a determinism fix)", "", ...o.review.map((l) => `- ${l}`), "");
  lines.push("### Stages", "", "| stage | state | elapsed | note |", "| --- | --- | --- | --- |");
  for (const s of o.status.stages.filter((x) => x.stage !== "report")) lines.push(`| ${s.stage} | ${s.state} | ${s.elapsed === undefined ? "" : formatElapsed(s.elapsed)} | ${(s.note ?? "").replaceAll("|", "\\|")} |`);
  lines.push("");
  lines.push("### Score (visual management): where the points went", "", o.seams.score?.markdown ?? `Not computed: ${o.seams.score?.note ?? "the score stage did not run"}. Never an input to the gate or the exit code.`, "");
  lines.push("### Glance (gemba)", "", `Not shown: ${NOT_BUILT.glance}.`, "");
  lines.push("### 5 Whys (kaizen)", "", `Not opened: ${NOT_BUILT.whys}.${o.code === 1 ? " This FAIL is a trigger once it is." : ""}`, "");
  // The per-PR table sits under the score when there is one; without a score it is shown here.
  const ch = o.seams.changes;
  lines.push("### Changes", "", ch?.changes ? (o.seams.score?.confidence ? `${ch.note}. The per-PR table is under the score; every deduction is in changes.json.` : (ch.markdown ?? ch.note)) : `Not shown: ${ch?.note ?? NO_MONOREPO}.`, "");
  return lines.join("\n");
}

const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** report.html: self-contained (no scripts, no external requests), the same order as report.md, links to each run's own report. */
export function renderReleaseHtml(o: { dir: string; gate: string; fast: boolean; candidate: string; baseline: Baseline; code: number; entries: GateSummaryEntry[]; status: ReleaseStatus; review: string[]; seams: Seams }): string {
  const tone = o.code === 0 ? "pass" : o.code === 1 ? "fail" : "none";
  const link = (runDir: string | undefined) => (runDir ? `<a href="${esc(relative(o.dir, join(runDir, "report.html")).replaceAll("\\", "/"))}">report</a>` : "");
  const rows = o.entries.map((e) => `<tr><td>${esc(e.title)}</td><td>${esc(e.code === "skipped" ? "not run" : e.verdict ? `${e.verdict.toUpperCase()}${e.overridden ? " (OVERRIDDEN)" : ""}` : e.code === 0 ? "ok" : `exit ${e.code}`)}</td><td>${link(e.runDir)}</td></tr>`).join("\n");
  const stages = o.status.stages.filter((x) => x.stage !== "report").map((s) => `<tr><td>${s.stage}</td><td>${s.state}</td><td>${s.elapsed === undefined ? "" : formatElapsed(s.elapsed)}</td><td>${esc(s.note ?? "")}</td></tr>`).join("\n");
  const stopped = o.status.stopped ? `<section class="stop"><h2>Line stopped at ${o.status.stopped.stage}</h2><p>${esc(o.status.stopped.why)}</p><p><strong>Next standard step:</strong> ${esc(o.status.stopped.next)}</p>${o.review.length ? `<ul>${o.review.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}</section>` : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Release ${esc(o.candidate)}: ${esc(o.gate)}</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;max-width:60rem;margin:2rem auto;padding:0 1rem;color:#1b1b1b;background:#fff}
.gate{font-size:1.6rem;font-weight:700;padding:.6rem 1rem;border-radius:6px}
.gate.pass{background:#e3f4e6}.gate.fail{background:#fbe3e3}.gate.none{background:#f1f1f1}
.banner{border-left:4px solid #b26b00;background:#fff4e0;padding:.5rem 1rem;font-weight:600}
.stop{border-left:4px solid #b00020;padding:0 1rem}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:.3rem .5rem;text-align:left;vertical-align:top}
.seam{color:#555}
.rcs{font-size:1.3rem;font-weight:700;padding:.4rem 1rem;border-radius:6px}
.rcs.green{background:#e3f4e6}.rcs.amber{background:#fff4e0}.rcs.red{background:#fbe3e3}.rcs.none{background:#f1f1f1}
</style></head><body>
<p class="gate ${tone}">Gate: ${esc(o.gate)} <small>(exit ${o.code})</small></p>
${o.seams.score?.confidence ? renderScoreHtml(o.seams.score.confidence) : ""}
${o.seams.score?.confidence && o.seams.changes?.changes ? renderChangesHtml(o.seams.changes.changes) : ""}
<p>${esc(o.candidate)} beside ${esc(o.baseline.tag)} <small>(${esc(o.baseline.how)})</small></p>
${o.fast ? `<p class="banner">${esc(FAST_BANNER)}</p>` : ""}
${stopped}
<h2>Gate</h2>
<table><thead><tr><th>step</th><th>result</th><th></th></tr></thead><tbody>
${rows}
</tbody></table>
<h2>Stages</h2>
<table><thead><tr><th>stage</th><th>state</th><th>elapsed</th><th>note</th></tr></thead><tbody>
${stages}
</tbody></table>
<h2>Score (visual management)</h2><p class="seam">${esc(o.seams.score?.note ?? "the score stage did not run")}; never an input to the gate or the exit code.${o.seams.score?.confidence ? ' Every deduction and its evidence is in <a href="confidence.json">confidence.json</a>.' : ""}</p>
<h2>Glance (gemba)</h2><p class="seam">${esc(NOT_BUILT.glance)}</p>
<h2>5 Whys (kaizen)</h2><p class="seam">${esc(NOT_BUILT.whys)}</p>
<h2>Changes</h2><p class="seam">${esc(o.seams.changes?.note ?? NO_MONOREPO)}</p>
${!o.seams.score?.confidence && o.seams.changes?.changes ? renderChangesHtml(o.seams.changes.changes) : ""}
</body></html>
`;
}

// ---- --open -------------------------------------------------------------------------------------------

/** The platform's opener for a file: `open` on macOS, `start` through cmd on Windows, `xdg-open` elsewhere. */
export function openerFor(platform: NodeJS.Platform, file: string): { command: string; args: string[] } {
  if (platform === "darwin") return { command: "open", args: [file] };
  if (platform === "win32") return { command: "cmd", args: ["/c", "start", '""', file] };
  return { command: "xdg-open", args: [file] };
}
