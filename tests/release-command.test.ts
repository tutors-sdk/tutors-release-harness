/**
 * `harness release --candidate <tag>`: the baseline, the noise decision, the plan, status.json as it goes, the --fast
 * banner, the exit codes, where the line stops and what it says, and Ctrl-C. Nothing here starts Docker or a child
 * process: the executor is a fake that writes the run directories a real run would.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { beforeAll, describe, expect, it } from "vitest";
import { runChanges } from "../src/changes/command.ts";
import type { Changes } from "../src/changes/signals.ts";
import { changesRepo } from "./support/changes-repo.ts";
import { UsageError, glanceCommand, releaseCommand } from "../src/local/cli.ts";
import { describeStatus } from "../src/local/noise-store.ts";
import {
  BaselineError,
  CHANGES_OUT,
  FAST_BANNER,
  NO_MONOREPO,
  STAGES,
  decideNoise,
  gateWord,
  openerFor,
  parseDeployed,
  planRelease,
  releaseExitCode,
  renderReleasePlan,
  resolveBaseline,
  runRelease,
  type Baseline,
  type NoiseDecision,
  type ReleaseStatus,
  type ScoreExtras
} from "../src/local/release.ts";
import type { Confidence } from "../src/score/confidence.ts";
import { LATEST_NOISE, latestRunIn, type Executor } from "../src/local/tasks.ts";

const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-release-${name}-`));
const D = (n: number) => `sha256:${String(n).repeat(64)}`;
const base: Baseline = { tag: "16.2.2", how: "given with --baseline" };
const argvOf = (stages: ReturnType<typeof planRelease>) => Object.fromEntries(stages.map((s) => [s.stage, s.steps.map((x) => x.argv.join(" "))]));

function monorepo(deployed: unknown, claims = false): string {
  const dir = tmp("mono");
  mkdirSync(join(dir, "release"), { recursive: true });
  if (deployed !== undefined) writeFileSync(join(dir, "release", "deployed.json"), typeof deployed === "string" ? deployed : JSON.stringify(deployed));
  if (claims) writeFileSync(join(dir, "release", "claims.yaml"), "claims: []\n");
  return dir;
}

describe("the baseline", () => {
  it("--baseline <tag> is taken as given; anything that is not a tag is a usage error", () => {
    expect(resolveBaseline({ baseline: "16.2.2", env: {} })).toEqual({ tag: "16.2.2", how: "given with --baseline" });
    expect(() => resolveBaseline({ baseline: "../x", env: {} })).toThrow(BaselineError);
  });

  it("prod, or nothing, reads release/deployed.json in the monorepo checkout, with its digests as pins", () => {
    const dir = monorepo({ tag: "16.2.2", deployedAt: "2026-09-20T10:00:00Z", digests: { reader: D(1), catalogue: D(2), live: D(3) } });
    const b = resolveBaseline({ baseline: "prod", monorepo: dir, env: {} });
    expect(b.tag).toBe("16.2.2");
    expect(b.how).toContain("deployed 2026-09-20T10:00:00Z");
    expect(JSON.parse(b.digests!)).toEqual({ reader: D(1), catalogue: D(2), live: D(3) });
    // HARNESS_MONOREPO_DIR stands in for --monorepo
    expect(resolveBaseline({ env: { HARNESS_MONOREPO_DIR: dir } }).tag).toBe("16.2.2");
  });

  it("no deployed.json falls back to HARNESS_PRODUCTION_TAG and says why; its placeholder `main` does not count", () => {
    const dir = monorepo(undefined);
    expect(resolveBaseline({ monorepo: dir, env: { HARNESS_PRODUCTION_TAG: "16.2.1" } })).toMatchObject({ tag: "16.2.1", how: expect.stringContaining("does not exist") });
    expect(resolveBaseline({ env: { HARNESS_PRODUCTION_TAG: "16.2.1" } }).how).toContain("no monorepo checkout");
    expect(() => resolveBaseline({ env: { HARNESS_PRODUCTION_TAG: "main" } })).toThrow(/Pass --baseline <tag>/);
    expect(() => resolveBaseline({ env: {} })).toThrow(BaselineError);
  });

  it("a deployed.json that is there and unusable is an error, never skipped for the fallback", () => {
    for (const bad of ["not json", { deployedAt: "x" }, { tag: "a b" }, { tag: "16.2.2", digests: { reader: "nope" } }]) {
      const dir = monorepo(bad);
      expect(() => resolveBaseline({ monorepo: dir, env: { HARNESS_PRODUCTION_TAG: "16.2.1" } }), JSON.stringify(bad)).toThrow(BaselineError);
    }
    expect(parseDeployed('{"tag":" 16.2.2 "}', "f")).toEqual({ tag: "16.2.2" });
  });
});

describe("the noise decision", () => {
  const store = (licensesFail: boolean, usable = true) => ({ store: "/s", file: "/s/noise-status.json", present: true, usable, licensesFail, why: licensesFail ? "clean" : "stale" });

  it("a clean, fresh store is reused; anything else is an A/A first; --fast does neither and says the release step is advisory", () => {
    expect(decideNoise(store(true), false)).toMatchObject({ action: "reuse", noise: "/s/noise-status.json" });
    expect(decideNoise(store(true), true)).toMatchObject({ action: "reuse" });
    expect(decideNoise(store(false), false)).toMatchObject({ action: "run" });
    expect(decideNoise(store(false), true)).toMatchObject({ action: "skip", noise: "/s/noise-status.json", why: expect.stringContaining("advisory") });
    expect(decideNoise(store(false, false), true)).toMatchObject({ action: "skip", noise: "none" });
  });

  it("reads the store with the gate's own rule: 7 days", () => {
    const home = tmp("store");
    mkdirSync(join(home, "noise"));
    writeFileSync(join(home, "noise", "noise-status.json"), JSON.stringify({ ranAt: "2026-09-20T02:00:00Z", clean: true, hunks: 0 }));
    expect(decideNoise(describeStatus(join(home, "noise"), new Date("2026-09-26T02:00:00Z"), 7), false).action).toBe("reuse");
    expect(decideNoise(describeStatus(join(home, "noise"), new Date("2026-09-28T02:00:00Z"), 7), false).action).toBe("run");
  });
});

describe("the plan", () => {
  const run: NoiseDecision = { action: "run", why: "no status" };

  it("is the gate's plan in stages: ensure, an A/A of the baseline, release with that A/A, the two rehearsals", () => {
    const stages = planRelease({ candidate: "16.3.0-rc.1", baseline: base, claims: "/m/release/claims.yaml", rules: "/m/rules.json", fast: false }, run);
    expect(stages.map((s) => s.stage)).toEqual([...STAGES]);
    expect(argvOf(stages)).toEqual({
      resolve: ["images ensure --a 16.2.2 --b 16.3.0-rc.1"],
      noise: ["run --mode noise --a 16.2.2 --b 16.2.2 --runs 3 --load 20x30s --require-verified"],
      changes: [],
      release: [`run --mode release --a 16.2.2 --b 16.3.0-rc.1 --runs 3 --load 20x30s --claims /m/release/claims.yaml --rules /m/rules.json --noise ${LATEST_NOISE}`],
      rehearse: ["run --mode migration --a v16.2.2 --b v16.3.0-rc.1", "run --mode upgrade --a 16.2.2 --b 16.3.0-rc.1 --set fixture --journey anonymous-student-reads-course"],
      score: [],
      report: []
    });
    expect(stages.find((s) => s.stage === "changes")!.skip).toBe(NO_MONOREPO);
    expect(stages.find((s) => s.stage === "score")!.skip).toBeUndefined();
  });

  it("a reused A/A is passed by file; --out reaches every run; deployed digests pin both A/A sides and the baseline", () => {
    const pinned: Baseline = { tag: "16.2.2", how: "deployed.json", digests: JSON.stringify({ reader: D(1) }) };
    const a = argvOf(planRelease({ candidate: "c", baseline: pinned, fast: false, out: "/o" }, run));
    expect(a.resolve![0]).toContain(`--a-digests ${pinned.digests}`);
    expect(a.noise![0]).toContain(`--a-digests ${pinned.digests} --b-digests ${pinned.digests} --out /o`);
    for (const line of [...a.release!, ...a.rehearse!]) expect(line).toContain("--out /o");
    const reused = argvOf(planRelease({ candidate: "c", baseline: base, fast: false }, { action: "reuse", noise: "/s/noise-status.json", why: "clean" }));
    expect(reused.noise).toEqual([]);
    expect(reused.release![0]).toMatch(/--noise \/s\/noise-status\.json$/);
  });

  it("--fast: one run, no load, no rehearsals, no A/A", () => {
    const stages = planRelease({ candidate: "c", baseline: base, fast: true }, { action: "skip", noise: "none", why: "--fast" });
    const a = argvOf(stages);
    expect(a.release).toEqual(["run --mode release --a 16.2.2 --b c --runs 1 --noise none"]);
    expect(a.rehearse).toEqual([]);
    expect(a.noise).toEqual([]);
    expect(stages.find((s) => s.stage === "rehearse")!.skip).toContain("--fast");
  });

  it("--dry-run prints the baseline, every command, the skips, and the --fast banner", () => {
    const text = renderReleasePlan({ candidate: "c", baseline: base, fast: true, stages: planRelease({ candidate: "c", baseline: base, fast: true }, { action: "skip", noise: "none", why: "--fast runs no A/A" }), env: { HARNESS_IMAGE_PREFIX: "tutors" }, platform: "linux" });
    expect(text).toContain("harness release: c beside 16.2.2 (given with --baseline)");
    expect(text).toContain(FAST_BANNER);
    expect(text).toContain("harness images ensure --a 16.2.2 --b c");
    expect(text).toContain(`skipped: ${NO_MONOREPO}`);
    expect(text).toContain("dry run: nothing was pulled or run");
  });
});

describe("exit codes", () => {
  it("the gate's rule: the worst judging step, 2 when the line stopped before judging, never above 2", () => {
    expect(releaseExitCode({ codes: [0, 0, 0], notJudged: false })).toBe(0);
    expect(releaseExitCode({ codes: [0, 1, 0], notJudged: false })).toBe(1);
    expect(releaseExitCode({ codes: [0, 1, 2], notJudged: false })).toBe(2);
    expect(releaseExitCode({ codes: [0, "skipped"], notJudged: true })).toBe(2);
    expect(releaseExitCode({ codes: [137], notJudged: false })).toBe(2);
    expect(gateWord(0, [{ id: "release", title: "r", code: 0, verdict: "warn" }])).toBe("WARN");
    expect(gateWord(0, [{ id: "release", title: "r", code: 0, verdict: "fail", overridden: true }])).toBe("FAIL (OVERRIDDEN)");
    expect(gateWord(1, [])).toBe("FAIL");
    expect(gateWord(2, [])).toBe("NOT JUDGED");
  });
});

// ---- running it, with a fake executor ------------------------------------------------------------------

interface Fake {
  ex: Executor;
  calls: string[][];
  /** status.json as each step found it. */
  seen: { argv: string; stage: string | null; states: string[] }[];
}

/**
 * Each `run` writes `<out>/<stamp>-<mode>/report.json` (and noise-status.json in noise mode) and exits with `codes[mode]`.
 * `verdicts[mode]` is the verdict it writes; a noise run is dirty when `dirty` is set.
 */
function fakeExecutor(out: string, o: { codes?: Record<string, number>; verdicts?: Record<string, string>; dirty?: boolean; statusFile?: () => string | undefined; report?: Record<string, object>; changes?: object } = {}): Fake {
  const calls: string[][] = [];
  const seen: Fake["seen"] = [];
  let n = 0;
  const ex: Executor = {
    harness: (argv) => {
      calls.push(argv);
      const file = o.statusFile?.();
      if (file && existsSync(file)) {
        const s = JSON.parse(readFileSync(file, "utf8")) as ReleaseStatus;
        seen.push({ argv: argv.slice(0, 3).join(" "), stage: s.stage, states: s.stages.map((x) => x.state) });
      }
      if (argv[0] === "images") return o.codes?.ensure ?? 0;
      // harness changes: writes the changes.json it was given where --out says, as the real one would
      if (argv[0] === "changes") {
        if (o.changes) writeFileSync(argv[argv.indexOf("--out") + 1]!, JSON.stringify(o.changes));
        return o.codes?.changes ?? 0;
      }
      if (argv[0] !== "run") return 0;
      const mode = argv[2]!;
      const dir = join(out, `2026-09-27T10-00-${String(n++).padStart(2, "0")}-${mode}`);
      mkdirSync(dir, { recursive: true });
      const verdict = o.verdicts?.[mode] ?? (mode === "noise" && o.dirty ? "warn" : "pass");
      const hunks = mode === "noise" && o.dirty ? [{ id: "h1", artefact: "timing", scope: "reader /course", summary: "p95 moved", severity: "fail" }] : [];
      // A release run's report as far as the gate summary and the score read it: the A/A it consulted, k6, the masks.
      const noise = argv.includes("--noise") && argv[argv.indexOf("--noise") + 1] !== "none" ? { noise: { ranAt: "2026-09-27T02:00:00Z", clean: true, hunks: 0 } } : {};
      const extra = mode === "release" ? { ...noise, load: { a: { requests: 600, failed: 0, serverErrors: 0 }, b: { requests: 600, failed: 0, serverErrors: 0 } }, masksApplied: { "a-mask": 3 } } : {};
      writeFileSync(join(dir, "report.json"), JSON.stringify({ mode, ranAt: "2026-09-27T10:00:00Z", verdict, reasons: [verdict === "fail" ? "2 unclaimed difference(s)" : "no unclaimed difference"], compare: { hunks, unclaimed: hunks, matches: [], staleClaims: [], broadUnapproved: [] }, ...extra, ...o.report?.[mode] }));
      writeFileSync(join(dir, "report.md"), `## ${mode}: ${verdict.toUpperCase()}\n`);
      if (mode === "noise") writeFileSync(join(dir, "noise-status.json"), JSON.stringify({ ranAt: "2026-09-27T10:00:00Z", clean: !o.dirty, hunks: hunks.length }));
      return o.codes?.[mode] ?? (verdict === "fail" ? 1 : 0);
    },
    latestRun: (mode) => latestRunIn(out, mode, 0),
    latestRecorded: () => undefined,
    log: () => {}
  };
  return { ex, calls, seen };
}

function clock(start = Date.parse("2026-09-27T10:00:00Z")) {
  let t = start;
  return () => new Date((t += 61_000));
}

const reuse: NoiseDecision = { action: "reuse", noise: "/s/noise-status.json", why: "reusing the local noise store: clean" };
const runAA: NoiseDecision = { action: "run", why: "an A/A of the baseline first: stale" };

function go(o: { fast?: boolean; noise?: NoiseDecision; fake?: Parameters<typeof fakeExecutor>[1]; interruptAfter?: (calls: string[][]) => boolean; score?: ScoreExtras; monorepo?: string; scoreboard?: string }) {
  const out = tmp("out");
  const lines: string[] = [];
  const fake = fakeExecutor(out, { ...o.fake, statusFile: () => findStatus(out) });
  const opened: string[] = [];
  const outcome = runRelease(
    { candidate: "16.3.0-rc.1", baseline: base, fast: o.fast ?? false, outRoot: out, noise: o.noise ?? reuse, ...(o.score ? { score: o.score } : {}), ...(o.monorepo ? { monorepo: o.monorepo } : {}), ...(o.scoreboard ? { scoreboard: { file: o.scoreboard } } : {}) },
    {
      ex: fake.ex,
      env: {},
      now: clock(),
      say: (l) => lines.push(l),
      interrupted: () => o.interruptAfter?.(fake.calls) ?? false,
      open: (f) => opened.push(f)
    }
  );
  const status = JSON.parse(readFileSync(outcome.files.status, "utf8")) as ReleaseStatus;
  const md = readFileSync(outcome.files.md, "utf8");
  const html = readFileSync(outcome.files.html, "utf8");
  return { outcome, status, md, html, lines, fake, opened, out };
}

const stateOf = (s: ReleaseStatus) => Object.fromEntries(s.stages.map((x) => [x.stage, x.state]));

describe("running it", () => {
  it("a PASS: every stage in order, one line each with elapsed time, the report led by the gate, exit 0, report.html opened", () => {
    const r = go({});
    expect(r.outcome.code).toBe(0);
    expect(r.fake.calls.map((c) => c.slice(0, 3).join(" "))).toEqual(["images ensure --a", "run --mode release", "run --mode migration", "run --mode upgrade"]);
    expect(stateOf(r.status)).toEqual({ resolve: "done", noise: "done", changes: "skipped", release: "done", rehearse: "done", score: "done", report: "done" });
    expect(r.status).toMatchObject({ state: "finished", exitCode: 0, stage: null, candidate: "16.3.0-rc.1", baseline: "16.2.2", fast: false });
    expect(r.status.stopped).toBeUndefined();
    for (const s of r.status.stages) expect(s.elapsed, s.stage).toBeGreaterThan(0);
    const stageLines = r.lines.filter((l) => /^\[\d\/7\]/.test(l));
    expect(stageLines.map((l) => l.split(/\s+/)[1])).toEqual([...STAGES]);
    expect(stageLines[3]).toMatch(/^\[4\/7\] release\s+done\s+\d+m \d{2}s\s+gate PASS$/);
    expect(r.md.split("\n")[0]).toBe("## Release gate: 16.3.0-rc.1 beside 16.2.2");
    expect(r.md).toContain("**Gate: PASS**");
    expect(r.md.indexOf("**Gate: PASS**")).toBeLessThan(r.md.indexOf("### Stages"));
    for (const seam of ["### Score (visual management)", "### Glance (gemba)", "### 5 Whys (kaizen)", "### Changes"]) expect(r.md).toContain(seam);
    // the Gate, then the RCS and its band with what the band means, then the dimension table, then the steps
    const rcs = r.md.indexOf("**RCS 100 Green: ship on the captain's say**");
    expect(rcs).toBeGreaterThan(r.md.indexOf("**Gate: PASS**"));
    expect(r.md.indexOf("| dimension | weight | score |")).toBeGreaterThan(rcs);
    expect(r.md.indexOf("| step | result |")).toBeGreaterThan(r.md.indexOf("| dimension | weight | score |"));
    expect(r.html.indexOf("RCS 100 Green")).toBeGreaterThan(r.html.indexOf("Gate: PASS"));
    expect(r.lines).toContain("confidence: RCS 100 Green: ship on the captain's say");
    expect(existsSync(join(r.outcome.dir, "confidence.json"))).toBe(true);
    expect(r.html).toContain("Gate: PASS");
    expect(r.html).not.toMatch(/<script|https?:\/\//);
    expect(r.opened).toEqual([r.outcome.files.html]);
    expect(r.outcome.dir).toMatch(/-release-command$/);
    for (const f of Object.values(r.outcome.files)) expect(existsSync(f), f).toBe(true);
  });

  it("status.json progresses as the stages do: each step sees its own stage running and the earlier ones ended", () => {
    const out = tmp("progress");
    const fake = fakeExecutor(out, { statusFile: () => findStatus(out) });
    runRelease({ candidate: "c", baseline: base, fast: false, outRoot: out, noise: runAA }, { ex: fake.ex, env: {}, now: clock(), say: () => {}, interrupted: () => false });
    expect(fake.seen.map((s) => [s.argv, s.stage])).toEqual([
      ["images ensure --a", "resolve"],
      ["run --mode noise", "noise"],
      ["run --mode release", "release"],
      ["run --mode migration", "rehearse"],
      ["run --mode upgrade", "rehearse"]
    ]);
    expect(fake.seen[0]!.states).toEqual(["running", "pending", "pending", "pending", "pending", "pending", "pending"]);
    expect(fake.seen[2]!.states).toEqual(["done", "done", "skipped", "running", "pending", "pending", "pending"]);
    // a fresh A/A is what the release step reads
    const release = fake.calls.find((c) => c[2] === "release")!;
    expect(release[release.indexOf("--noise") + 1]).toMatch(/-noise$/);
  });

  it("the status file matches its schema at every point", () => {
    const schema = JSON.parse(readFileSync(resolve(import.meta.dirname, "../docs/contract/release-status.schema.json"), "utf8"));
    const ajv = new Ajv({ allErrors: true, strict: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const validate = ajv.compile(schema);
    for (const r of [go({}), go({ fake: { verdicts: { release: "fail" } } }), go({ noise: runAA, fake: { dirty: true } }), go({ interruptAfter: (c) => c.length >= 2 })]) {
      validate(r.status);
      expect(validate.errors ?? []).toEqual([]);
    }
  });

  it("a gate FAIL: the line stopped at release, the next standard step, the rehearsals still run for the evidence, the report written, exit 1", () => {
    const r = go({ fake: { verdicts: { release: "fail" } } });
    expect(r.outcome.code).toBe(1);
    expect(r.status.stopped).toMatchObject({ stage: "release", why: expect.stringContaining("the gate FAILED: 2 unclaimed difference(s)") });
    expect(r.lines).toContain("line stopped at release: the gate FAILED: 2 unclaimed difference(s)");
    expect(r.lines.some((l) => l.startsWith("  next: read report.html"))).toBe(true);
    expect(r.fake.calls.map((c) => c[2])).toContain("upgrade");
    expect(r.md).toContain("**Gate: FAIL**");
    expect(r.md).toContain("### Line stopped at release");
    expect(r.md).toContain("Next standard step:");
    expect(r.md).toContain("This FAIL is a trigger once it is.");
    expect(existsSync(r.outcome.files.html)).toBe(true);
  });

  it("a dirty A/A stops the line before any A/B, names each difference that needs a mask reviewed, exit 2", () => {
    const r = go({ noise: runAA, fake: { dirty: true } });
    expect(r.outcome.code).toBe(2);
    expect(r.fake.calls.map((c) => (c[0] === "run" ? c[2] : c[0]))).toEqual(["images", "noise"]);
    expect(stateOf(r.status)).toMatchObject({ noise: "failed", release: "skipped", rehearse: "skipped", score: "skipped", report: "done" });
    expect(r.status.stopped!.stage).toBe("noise");
    expect(r.status.stopped!.next).toContain("normalise/masks.yaml");
    expect(r.lines).toContain("  needs a mask reviewed or a determinism fix: timing reader /course: p95 moved");
    expect(r.md).toContain("- timing reader /course: p95 moved");
    expect(r.md).toContain("**Gate: NOT JUDGED**");
  });

  it("images that cannot be had stop the line at resolve: nothing else runs, exit 2, a report all the same", () => {
    const r = go({ fake: { codes: { ensure: 1 } } });
    expect(r.outcome.code).toBe(2);
    expect(r.fake.calls).toHaveLength(1);
    expect(stateOf(r.status)).toMatchObject({ resolve: "failed", noise: "skipped", release: "skipped", rehearse: "skipped" });
    expect(r.status.stopped).toMatchObject({ stage: "resolve", next: expect.stringContaining("harness images ensure --a 16.2.2 --b 16.3.0-rc.1") });
    expect(existsSync(r.outcome.files.html)).toBe(true);
  });

  it("a release run that cannot judge is exit 2 and says it is not a verdict", () => {
    const r = go({ fake: { codes: { release: 2 }, verdicts: { release: "pass" } } });
    expect(r.outcome.code).toBe(2);
    expect(r.status.stopped!.next).toContain("not a verdict");
  });

  it("--fast: one run, no rehearsals, and a banner in the terminal, report.md, report.html and status.json", () => {
    const r = go({ fast: true, noise: { action: "skip", noise: "none", why: "--fast runs no A/A" } });
    expect(r.outcome.code).toBe(0);
    expect(r.fake.calls.map((c) => c.join(" "))).toEqual(["images ensure --a 16.2.2 --b 16.3.0-rc.1", "run --mode release --a 16.2.2 --b 16.3.0-rc.1 --runs 1 --noise none"]);
    expect(stateOf(r.status)).toMatchObject({ noise: "skipped", rehearse: "skipped" });
    expect(r.status.fast).toBe(true);
    expect(r.md).toContain(`> ${FAST_BANNER}`);
    expect(r.md.indexOf(FAST_BANNER)).toBeLessThan(r.md.indexOf("| step |"));
    expect(r.html).toContain(FAST_BANNER);
    expect(r.lines).toContain(FAST_BANNER);
    expect(r.lines).toContain("gate: PASS (--fast: not for a go decision) -> exit 0");
  });

  it("Ctrl-C: the stacks are taken down before it ends, the rest is skipped, the report is written, exit 2", () => {
    // pressed while the release run is going: the step returns, and nothing after it starts
    const r = go({ interruptAfter: (calls) => calls.some((c) => c[2] === "release") });
    expect(r.outcome.code).toBe(2);
    expect(r.fake.calls.map((c) => c.slice(0, 2).join(" "))).toEqual(["images ensure", "run --mode", "stack down"]);
    expect(r.fake.calls.at(-1)).toEqual(["stack", "down", "--a", "16.2.2", "--b", "16.3.0-rc.1"]);
    expect(r.status).toMatchObject({ state: "interrupted", exitCode: 2, stopped: { stage: "release", why: "interrupted with Ctrl-C" } });
    expect(stateOf(r.status)).toMatchObject({ release: "interrupted", rehearse: "skipped", score: "skipped", report: "done" });
    expect(r.lines).toContain("interrupted: taking the stacks down (harness stack down)");
    expect(existsSync(r.outcome.files.html)).toBe(true);
  });

  it("Ctrl-C before a step starts: that step never runs", () => {
    const r = go({ interruptAfter: (calls) => calls.length >= 1 });
    expect(r.fake.calls.map((c) => c[0])).toEqual(["images", "stack"]);
    expect(r.status.stopped!.stage).toBe("resolve");
  });
});

describe("the score stage (C0): confidence.json, and never an exit code", () => {
  const conf = (r: ReturnType<typeof go>) => JSON.parse(readFileSync(join(r.outcome.dir, "confidence.json"), "utf8")) as Confidence;
  // a release that passes the gate on thin evidence: one claim broad enough to swallow everything, three stale ones
  const hollow = {
    release: {
      compare: {
        hunks: [{ id: "dom:x:1", artefact: "dom", scope: "x", summary: "moved", severity: "fail" }],
        unclaimed: [],
        matches: [{ hunk: { id: "dom:x:1", artefact: "dom", scope: "x", summary: "moved", severity: "fail" }, claim: { artefact: "*", scope: "**", reason: "everything", approvedBy: "someone" } }],
        staleClaims: [1, 2, 3].map((n) => ({ artefact: "dom", scope: `s${n}`, reason: `r${n}` })),
        broadUnapproved: []
      }
    }
  };

  it("reads the release, migration and upgrade runs and writes confidence.json in the command's directory, links relative to it", () => {
    const r = go({});
    const c = conf(r);
    expect(c).toMatchObject({ gate: "PASS", rcs: 100, band: "Green", run: { candidate: "16.3.0-rc.1", baseline: "16.2.2" } });
    expect(c.run.reports.release).toMatch(/^\.\.\/.*-release\/report\.json$/);
    expect(c.run.reports.migration).toMatch(/-migration\/report\.json$/);
    expect(c.dimensions.filter((d) => d.status === "not measured").map((d) => d.id)).toEqual(["test-signal", "traceability", "change-risk", "post-deploy"]);
    expect(r.status.stages.find((s) => s.stage === "score")!.note).toBe("RCS 100 Green; 4 of 8 dimensions measured; glance: 0 to mark; confidence.json");
    expect(r.outcome.files.confidence).toBe(join(r.outcome.dir, "confidence.json"));
  });

  it("a PASS on hollow evidence is Red and still exits 0: the score cannot stop the line", () => {
    const r = go({ fake: { report: hollow } });
    expect(r.outcome.code).toBe(0);
    expect(conf(r)).toMatchObject({ gate: "PASS", band: "Red", rcs: 74 });
    expect(r.md).toContain("**RCS 74 Red: hold, open a 5 Whys, do not re-run hoping for a better number**");
    expect(r.status.exitCode).toBe(0);
  });

  it("a FAIL is a FAIL: no RCS, the Gate shown, exit 1 whatever the dimensions say", () => {
    const r = go({ fake: { verdicts: { release: "fail" } } });
    expect(r.outcome.code).toBe(1);
    expect(conf(r)).toMatchObject({ gate: "FAIL", rcs: null, band: null });
    expect(r.md).toContain("No RCS: Gate FAIL. The Gate wins");
    expect(r.lines).toContain("gate: FAIL -> exit 1");
  });

  it("a score that cannot be computed is reported and changes nothing: the same exit code as without it", () => {
    for (const fake of [{}, { verdicts: { release: "fail" } }, { verdicts: { release: "warn" } }, { report: hollow }]) {
      const plain = go({ fake });
      const broken = go({ fake, score: { testSignal: "/does/not/exist.json" } });
      expect(broken.outcome.code, JSON.stringify(fake)).toBe(plain.outcome.code);
      expect(broken.status.stages.find((s) => s.stage === "score")).toMatchObject({ state: "skipped", note: expect.stringContaining("failed, and changes nothing: --test-signal") });
      expect(existsSync(join(broken.outcome.dir, "confidence.json"))).toBe(false);
    }
  });

  it("nothing to score when the line stopped before the release run; Ctrl-C skips it", () => {
    const dirty = go({ noise: runAA, fake: { dirty: true } });
    expect(dirty.outcome.code).toBe(2);
    expect(dirty.status.stages.find((s) => s.stage === "score")).toMatchObject({ state: "skipped", note: "no release run to score" });
    const ctrlC = go({ interruptAfter: (calls) => calls.some((c) => c[2] === "release") });
    expect(stateOf(ctrlC.status).score).toBe("skipped");
    expect(existsSync(join(ctrlC.outcome.dir, "confidence.json"))).toBe(false);
  });

  it("the optional inputs reach the score", () => {
    const dir = tmp("inputs");
    const ts = join(dir, "test-signal.json");
    writeFileSync(ts, JSON.stringify({ packages: [{ name: "reader", mutationScore: 72 }], harnessMutants: { caught: 8, total: 8 } }));
    const c = conf(go({ score: { testSignal: ts } }));
    expect(c.dimensions.find((d) => d.id === "test-signal")).toMatchObject({ status: "measured", score: 70 });
    expect(c.run.inputs?.testSignal).toMatch(/test-signal\.json$/);
  });
});

function findStatus(out: string): string | undefined {
  const dir = readdirSync(out).find((n) => n.endsWith("-release-command"));
  return dir ? join(out, dir, "status.json") : undefined;
}

describe("the command", () => {
  const values = (v: Record<string, string | boolean>) => ({ "dry-run": false, fast: false, open: false, ...v });

  it("usage errors before anything is written: no candidate, a candidate that is not a tag, no baseline to be had", () => {
    const home = tmp("home");
    expect(() => releaseCommand(values({}), { env: {}, home })).toThrow(UsageError);
    expect(() => releaseCommand(values({ candidate: "a b", baseline: "1" }), { env: {}, home })).toThrow(/--candidate takes a tag/);
    expect(() => releaseCommand(values({ candidate: "1.2.3" }), { env: {}, home })).toThrow(/cannot tell what production runs/);
    expect(existsSync(join(home, "locks"))).toBe(false);
  });

  it("--dry-run: the baseline from deployed.json, the claims from the same checkout, nothing run", () => {
    const mono = monorepo({ tag: "16.2.2" }, true);
    const said: string[] = [];
    const code = releaseCommand(values({ candidate: "16.3.0-rc.1", monorepo: mono, "dry-run": true }), { env: {}, home: tmp("home"), say: (m) => said.push(m), ex: { harness: () => { throw new Error("ran"); } } as unknown as Executor });
    expect(code).toBe(0);
    expect(said.join("\n")).toContain(`--claims ${join(mono, "release", "claims.yaml")}`);
    expect(said.join("\n")).toContain("beside 16.2.2");
    // the checkout that named the baseline is the one harness changes reads
    expect(said.join("\n")).toContain(`harness changes --a 16.2.2 --b 16.3.0-rc.1 --monorepo ${mono} --out`);
  });

  it("runs, holds the lock, opens with --open, and says posting to a PR is not built when GITHUB_TOKEN is set", () => {
    const home = tmp("home");
    const out = tmp("out");
    const said: string[] = [];
    const opened: string[] = [];
    const code = releaseCommand(values({ candidate: "16.3.0-rc.1", baseline: "16.2.2", out, open: true }), { env: { GITHUB_TOKEN: "x" }, home, say: (m) => said.push(m), ex: fakeExecutor(out).ex, open: (f) => opened.push(f), now: clock() });
    expect(code).toBe(0);
    expect(opened[0]).toMatch(/-release-command[\\/]report\.html$/);
    expect(said.some((l) => l.includes("posting to a pull request is not built yet"))).toBe(true);
  });

  it("--open uses the platform's opener", () => {
    expect(openerFor("darwin", "/r.html")).toEqual({ command: "open", args: ["/r.html"] });
    expect(openerFor("linux", "/r.html")).toEqual({ command: "xdg-open", args: ["/r.html"] });
    expect(openerFor("win32", "C:\\r.html").command).toBe("cmd");
  });
});

describe("the changes stage (C1): harness changes in the monorepo checkout, fed to change risk, never an exit code", () => {
  let changes: Changes;
  beforeAll(async () => {
    changes = (await runChanges({ a: "1.0.4", b: "1.1.0", monorepo: changesRepo(), history: 6 }, { env: {}, reviews: { approved: async (pr) => pr !== 11 } })).changes;
  }, 30_000);
  const conf = (r: ReturnType<typeof go>) => JSON.parse(readFileSync(join(r.outcome.dir, "confidence.json"), "utf8")) as Confidence;

  it("is planned from the checkout: harness changes --a <baseline> --b <candidate>, writing into the command's directory", () => {
    const stages = planRelease({ candidate: "16.3.0-rc.1", baseline: base, fast: false, monorepo: "/m" }, reuse);
    expect(argvOf(stages).changes).toEqual([`changes --a 16.2.2 --b 16.3.0-rc.1 --monorepo /m --out ${CHANGES_OUT}`]);
  });

  it("writes changes.json into the release-command dir; the score reads it as change risk; the per-PR table sits under the score", () => {
    const r = go({ monorepo: "/m", fake: { changes } });
    const call = r.fake.calls.find((c) => c[0] === "changes")!;
    expect(call.slice(0, 7)).toEqual(["changes", "--a", "16.2.2", "--b", "16.3.0-rc.1", "--monorepo", "/m"]);
    expect(call.at(-1)).toBe(join(r.outcome.dir, "changes.json"));
    expect(r.outcome.files.changes).toBe(join(r.outcome.dir, "changes.json"));
    expect(r.status.stages.find((s) => s.stage === "changes")).toMatchObject({ state: "done", note: "change risk 32: 4 of 5 line(s) lost points, floor breached; changes.json" });
    const cr = conf(r).dimensions.find((d) => d.id === "change-risk")!;
    expect(cr).toMatchObject({ status: "measured", score: 32, floorBreached: true, evidence: ["changes.json"] });
    expect(conf(r).run.inputs).toEqual({ changeRisk: "changes.json" });
    // the Gate, the RCS, the dimensions, then the per-PR table, then the steps
    const md = r.md;
    expect(md.indexOf("#### Change risk per PR")).toBeGreaterThan(md.indexOf("| dimension | weight | score |"));
    expect(md.indexOf("| step | result |")).toBeGreaterThan(md.indexOf("#### Change risk per PR"));
    expect(md).toContain("| #11 | fix(reader): hot path fixed |");
    expect(md).toContain("| 1 more | no deductions: #13 |");
    expect(r.html.indexOf('id="change-risk"')).toBeGreaterThan(r.html.indexOf("RCS "));
    expect(r.html.indexOf('id="change-risk"')).toBeLessThan(r.html.indexOf("<h2>Gate</h2>"));
    // it is not a gate step: not in gate.json, and its code reaches nothing
    const gate = JSON.parse(readFileSync(r.outcome.files.gateJson, "utf8")) as { steps: { id: string }[] };
    expect(gate.steps.map((s) => s.id)).not.toContain("changes");
    expect(r.outcome.code).toBe(0);
    expect(r.md).toContain("The per-PR table is under the score");
  });

  it("the same exit code with it, without it, and when it fails; a failure leaves change risk not measured", () => {
    for (const fake of [{}, { verdicts: { release: "fail" } }, { verdicts: { release: "warn" } }]) {
      const plain = go({ fake });
      const withIt = go({ monorepo: "/m", fake: { ...fake, changes } });
      const broken = go({ monorepo: "/m", fake: { ...fake, codes: { changes: 2 } } });
      expect(withIt.outcome.code, JSON.stringify(fake)).toBe(plain.outcome.code);
      expect(broken.outcome.code, JSON.stringify(fake)).toBe(plain.outcome.code);
      expect(broken.status.stages.find((s) => s.stage === "changes")).toMatchObject({ state: "skipped", note: "harness changes exit 2 wrote no changes.json: change risk stays not measured" });
      expect(conf(broken).dimensions.find((d) => d.id === "change-risk")!.status).toBe("not measured");
    }
  });

  it("no checkout: skipped with the reason, change risk not measured, and the report says so", () => {
    const r = go({});
    expect(r.status.stages.find((s) => s.stage === "changes")).toMatchObject({ state: "skipped", note: NO_MONOREPO });
    expect(conf(r).dimensions.find((d) => d.id === "change-risk")!.status).toBe("not measured");
    expect(r.md).toContain(`Not shown: ${NO_MONOREPO}.`);
    expect(r.fake.calls.some((c) => c[0] === "changes")).toBe(false);
  });

  it("an explicit --change-risk wins over the stage's changes.json", () => {
    const dir = tmp("cr");
    const file = join(dir, "cr.json");
    writeFileSync(file, JSON.stringify({ prs: [{ number: 1, reviewed: true }] }));
    const c = conf(go({ monorepo: "/m", fake: { changes }, score: { changeRisk: file } }));
    expect(c.dimensions.find((d) => d.id === "change-risk")).toMatchObject({ score: 100 });
    expect(c.run.inputs?.changeRisk).toMatch(/cr\.json$/);
  });

  it("Ctrl-C while it runs ends the plan like any step: the stacks come down, nothing after it starts", () => {
    const r = go({ monorepo: "/m", fake: { changes }, interruptAfter: (calls) => calls.some((c) => c[0] === "changes") });
    expect(r.fake.calls.map((c) => c[0])).toEqual(["images", "changes", "stack"]);
    expect(r.status).toMatchObject({ state: "interrupted", stopped: { stage: "changes" } });
  });
});

describe("the scoreboard (C2): a line after the score, the run rules printed, never an exit code", () => {
  const board = () => join(tmp("board"), "releases.jsonl");
  const opts = (v: Record<string, string | boolean>) => ({ "dry-run": false, fast: false, open: false, ...v });
  const lines = (file: string) => readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l) as { tag: string; run: number; gate: string; rcs: number | null });

  it("appends the run's line after the score, prints it and the run rules after the RCS, and lists them in report.md", () => {
    const file = board();
    const r = go({ scoreboard: file });
    expect(r.outcome.code).toBe(0);
    expect(lines(file)).toMatchObject([{ tag: "16.3.0-rc.1", run: 1, gate: "PASS", rcs: 100 }]);
    const at = r.lines.findIndex((l) => l.startsWith("confidence: "));
    expect(r.lines[at + 1]).toBe(`scoreboard: 16.3.0-rc.1 run 1, Gate PASS, RCS 100 Green, 4 of 8 dimensions measured -> ${file}`);
    expect(r.lines[at + 2]).toBe("  run rules: none firing");
    expect(r.md).toContain("### Scoreboard (visual management over time)");
    expect(r.html).toContain("Scoreboard (visual management over time)");
    // a second run of the same candidate is the next run number, and the first line is untouched
    const first = readFileSync(file, "utf8");
    go({ scoreboard: file });
    expect(readFileSync(file, "utf8").startsWith(first)).toBe(true);
    expect(lines(file).map((l) => l.run)).toEqual([1, 2]);
  });

  it("a run rule firing at this release is printed, and opens a kaizen item; the exit code is the gate's", () => {
    const file = board();
    const seed = (tag: string, score: number) => ({ schemaVersion: 1, tag, run: 1, date: "2026-09-01T00:00:00Z", appendedAt: "2026-09-01T00:00:00Z", gate: "PASS", rcs: 80, band: "Amber", weightsVersion: null, dimensions: [{ id: "claim-coverage", status: "measured", score, floorBreached: false }], masks: null, masksNeverFired: null, claims: null, staleClaims: null, journeys: null, mutants: null, prs: null });
    writeFileSync(file, `${JSON.stringify(seed("16.2.0", 60))}\n${JSON.stringify(seed("16.2.1", 60))}\n`);
    const r = go({ scoreboard: file });
    expect(r.outcome.code).toBe(0);
    expect(r.lines).toContain("  run rule: Claim coverage: two of the last three releases below 75 (16.2.0 60, 16.2.1 60, 16.3.0-rc.1 100) -> opens a kaizen item");
  });

  it("a FAIL is on the board too, with no RCS; --fast is not; neither changes the exit code", () => {
    const file = board();
    const fail = go({ scoreboard: file, fake: { verdicts: { release: "fail" } } });
    expect(fail.outcome.code).toBe(1);
    expect(lines(file)).toMatchObject([{ gate: "FAIL", rcs: null }]);
    const fastFile = board();
    const fast = go({ scoreboard: fastFile, fast: true });
    expect(fast.outcome.code).toBe(go({ fast: true }).outcome.code);
    expect(existsSync(fastFile)).toBe(false);
    expect(fast.lines).toContain("scoreboard: not appended (--fast: this report cannot be used for a go decision)");
  });

  it("a scoreboard that cannot be written is reported and changes nothing", () => {
    const file = board();
    writeFileSync(file, "not a scoreboard\n");
    for (const fake of [{}, { verdicts: { release: "fail" } }]) {
      const plain = go({ fake });
      const broken = go({ fake, scoreboard: file });
      expect(broken.outcome.code).toBe(plain.outcome.code);
      expect(broken.lines.some((l) => l.startsWith("scoreboard: not appended, and nothing else changes:"))).toBe(true);
    }
    expect(readFileSync(file, "utf8")).toBe("not a scoreboard\n");
  });

  it("the command appends to HARNESS_HOME/scoreboard by default, --scoreboard names another file; --dry-run says which", () => {
    const home = tmp("home");
    const out = tmp("out");
    const said: string[] = [];
    expect(releaseCommand(opts({ candidate: "16.3.0-rc.1", baseline: "16.2.2", out }), { env: {}, home, say: (m) => said.push(m), ex: fakeExecutor(out).ex, now: clock() })).toBe(0);
    expect(lines(join(home, "scoreboard", "releases.jsonl"))).toHaveLength(1);
    const elsewhere = board();
    const out2 = tmp("out");
    releaseCommand(opts({ candidate: "16.3.0-rc.1", baseline: "16.2.2", out: out2, scoreboard: elsewhere }), { env: {}, home, say: () => {}, ex: fakeExecutor(out2).ex, now: clock() });
    expect(lines(elsewhere)).toHaveLength(1);
    expect(lines(join(home, "scoreboard", "releases.jsonl"))).toHaveLength(1);
    const dry: string[] = [];
    releaseCommand(opts({ candidate: "16.3.0-rc.1", baseline: "16.2.2", "dry-run": true }), { env: {}, home, say: (m) => dry.push(m) });
    expect(dry.join("\n")).toContain(`scoreboard: the line is appended to ${join(home, "scoreboard", "releases.jsonl")}`);
  });
});

describe("the glance (C3): at the top, right after the RCS, and never an exit code", () => {
  const board = () => join(tmp("board"), "releases.jsonl");
  const fixed = (pk: string, k: number) => ({ id: `console:${pk}:${k}`, artefact: "console", scope: pk, summary: `${pk}: console message gone on b`, detail: "error: boom", severity: "info" });
  const withFixes = { release: { compare: { hunks: [fixed("reader:home", 1), fixed("live:home", 2)], unclaimed: [], matches: [], staleClaims: [], broadUnapproved: [] } } };

  it("report.md, gate.md and report.html open with the Gate, the RCS and its band, then the glance, then the dimension table", () => {
    const r = go({ fake: { report: withFixes } });
    const conf = JSON.parse(readFileSync(join(r.outcome.dir, "confidence.json"), "utf8")) as Confidence;
    expect(conf.glance.map((i) => i.kind)).toEqual(["fixed-on-b", "fixed-on-b"]);
    const at = (s: string) => r.md.indexOf(s);
    expect(at("**Gate: PASS**")).toBeLessThan(at("**RCS "));
    expect(at("**RCS ")).toBeLessThan(at("### The reviewer's glance (gemba: go to the artefact and look)"));
    expect(at("### The reviewer's glance")).toBeLessThan(at("| dimension | weight |"));
    expect(r.md).toContain(`Mark each one: \`harness glance mark --run ${r.outcome.dir} --item <n> --mark verified|disputed|escalated --by <name> [--note text]\``);
    expect(r.md).toMatch(/\n1\. \*\*Fixed on b\*\*: /);
    expect(r.md).toContain("[hunk](../2026-09-27T10-00-00-release/report.html#hunk-console:reader:home:1)");
    expect(r.md).toContain("Not checked (no input, so nothing is claimed about them): mask added");
    expect(readFileSync(r.outcome.files.gateMd, "utf8")).toContain("### The reviewer's glance");
    expect(r.html.indexOf('class="rcs')).toBeLessThan(r.html.indexOf('<section class="glance">'));
    expect(r.html.indexOf('<section class="glance">')).toBeLessThan(r.html.indexOf("<table><thead><tr><th>dimension"));
    expect(r.lines.find((l) => l.startsWith("glance: "))).toBe(`glance: 2 place(s) to look (step 8, the one step that stays human); mark each: harness glance mark --run ${r.outcome.dir} --item <n> --mark verified|disputed|escalated --by <name> [--note text]`);
    expect(r.md).not.toContain("not built yet (C3)");
  });

  it("an Amber release says the glance must be recorded verified before go", () => {
    const dir = tmp("inputs");
    const ts = join(dir, "test-signal.json");
    // two packages at 72%: test signal 40 and no floor, so the mean lands in Amber
    writeFileSync(ts, JSON.stringify({ packages: [{ name: "reader", mutationScore: 72 }, { name: "live", mutationScore: 72 }], harnessMutants: { caught: 8, total: 8 } }));
    const r = go({ fake: { report: withFixes }, score: { testSignal: ts } });
    const conf = JSON.parse(readFileSync(join(r.outcome.dir, "confidence.json"), "utf8")) as Confidence;
    expect(conf.band).toBe("Amber");
    expect(r.md).toContain("**Amber: the glance is not yet recorded verified (0 of 2 verified): not a go (SOP step 9).**");
    expect(r.lines.find((l) => l.startsWith("glance: "))).toContain("; Amber: go only once every item is recorded verified");
  });

  it("the same exit code with a glance, without one, and after every mark; the scoreboard line carries the glance", () => {
    for (const fake of [{}, { verdicts: { release: "fail" } }, { verdicts: { release: "warn" } }]) {
      const plain = go({ fake });
      const file = board();
      const glanced = go({ fake: { ...fake, report: withFixes }, scoreboard: file });
      expect(glanced.outcome.code, JSON.stringify(fake)).toBe(plain.outcome.code);
      const line = JSON.parse(readFileSync(file, "utf8").trim()) as { glance: { items: number; marks: Record<string, number> }; maskIds: string[] };
      expect(line.glance).toMatchObject({ items: 2, marks: { unmarked: 2 } });
      expect(line.maskIds).toEqual(["a-mask"]);
      for (const mark of ["disputed", "escalated", "verified"]) expect(glanceCommand("mark", { run: glanced.outcome.dir, item: "1", mark, by: "ana" }, { log: () => {} })).toBe(0);
      const status = JSON.parse(readFileSync(glanced.outcome.files.status, "utf8")) as ReleaseStatus;
      expect(status.exitCode).toBe(plain.outcome.code);
      const conf = JSON.parse(readFileSync(join(glanced.outcome.dir, "confidence.json"), "utf8")) as Confidence;
      expect(conf.gate).toBe(plain.outcome.code === 1 ? "FAIL" : fake.verdicts?.release === "warn" ? "WARN" : "PASS");
      expect(readFileSync(glanced.outcome.files.md, "utf8")).toContain("mark: **verified** by ana");
      expect(readFileSync(glanced.outcome.files.html, "utf8")).toContain('<span class="mark verified">verified by ana</span>');
    }
  });

  it("the glance's novelty reads the scoreboard the run appends to: a second run of another tag sees the first", () => {
    const file = board();
    go({ fake: { report: withFixes }, scoreboard: file });
    // the same tag again is a re-run, not history
    const again = go({ fake: { report: withFixes }, scoreboard: file });
    const c = JSON.parse(readFileSync(join(again.outcome.dir, "confidence.json"), "utf8")) as Confidence;
    expect(c.glance[0]!.basis.novelty).toBe("no history yet");
    expect(c.glanceBasis!.history.releases).toEqual([]);
  });
});
