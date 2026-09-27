/**
 * `harness release --candidate <tag>`: the baseline, the noise decision, the plan, status.json as it goes, the --fast
 * banner, the exit codes, where the line stops and what it says, and Ctrl-C. Nothing here starts Docker or a child
 * process: the executor is a fake that writes the run directories a real run would.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { UsageError, releaseCommand } from "../src/local/cli.ts";
import { describeStatus } from "../src/local/noise-store.ts";
import {
  BaselineError,
  FAST_BANNER,
  NOT_BUILT,
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
  type ReleaseStatus
} from "../src/local/release.ts";
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
    expect(stages.find((s) => s.stage === "changes")!.skip).toBe(NOT_BUILT.changes);
    expect(stages.find((s) => s.stage === "score")!.skip).toBe(NOT_BUILT.score);
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
    expect(text).toContain(`skipped: ${NOT_BUILT.changes}`);
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
function fakeExecutor(out: string, o: { codes?: Record<string, number>; verdicts?: Record<string, string>; dirty?: boolean; statusFile?: () => string | undefined } = {}): Fake {
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
      if (argv[0] !== "run") return 0;
      const mode = argv[2]!;
      const dir = join(out, `2026-09-27T10-00-${String(n++).padStart(2, "0")}-${mode}`);
      mkdirSync(dir, { recursive: true });
      const verdict = o.verdicts?.[mode] ?? (mode === "noise" && o.dirty ? "warn" : "pass");
      const hunks = mode === "noise" && o.dirty ? [{ id: "h1", artefact: "timing", scope: "reader /course", summary: "p95 moved", severity: "fail" }] : [];
      writeFileSync(join(dir, "report.json"), JSON.stringify({ verdict, reasons: [verdict === "fail" ? "2 unclaimed difference(s)" : "no unclaimed difference"], compare: { hunks, unclaimed: hunks, matches: [] } }));
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

function go(o: { fast?: boolean; noise?: NoiseDecision; fake?: Parameters<typeof fakeExecutor>[1]; interruptAfter?: (calls: string[][]) => boolean }) {
  const out = tmp("out");
  const lines: string[] = [];
  const fake = fakeExecutor(out, { ...o.fake, statusFile: () => findStatus(out) });
  const opened: string[] = [];
  const outcome = runRelease(
    { candidate: "16.3.0-rc.1", baseline: base, fast: o.fast ?? false, outRoot: out, noise: o.noise ?? reuse },
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
    expect(stateOf(r.status)).toEqual({ resolve: "done", noise: "done", changes: "skipped", release: "done", rehearse: "done", score: "skipped", report: "done" });
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
