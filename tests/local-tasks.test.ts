/**
 * `harness local nightly|gate|mutants|watch`: the plans, how a plan runs (which
 * failure stops which stream), the gate's combined summary, the watch loop, and the
 * three small pieces they stand on: the run lock, the override log and the port
 * offset. Nothing here starts Docker or a child process: the executor is a fake.
 */
import { mkdirSync, mkdtempSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { QUAY_IMAGE_TEMPLATE } from "../src/image-ref.ts";
import { LockHeldError, acquireLock } from "../src/local/lock.ts";
import { appendOverride, overrideFromReport, readOverrides } from "../src/local/override-log.ts";
import { harnessHome, noiseDir, overridesFile } from "../src/local/home.ts";
import {
  DEFAULT_PORTS,
  LATEST_NOISE,
  LATEST_RECORDED,
  WORKFLOW_DEFAULTS,
  executePlan,
  latestRecordedIn,
  latestRunIn,
  parseInterval,
  planGate,
  planMutants,
  planNightly,
  planWatch,
  portEnv,
  readGateEntry,
  renderGateSummary,
  renderPlan,
  watch,
  workflowEnv,
  writeGateSummary,
  type Executor,
  type Plan
} from "../src/local/tasks.ts";
import { buildPlan } from "../src/local/cli.ts";
import { composePorts } from "../src/local/doctor.ts";

const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-${name}-`));
const argvOf = (plan: Plan) => plan.steps.map((s) => s.argv.join(" "));

describe("the plans", () => {
  it("nightly: pull and verify with the cache, A/A five runs with load and --require-verified, record the night", () => {
    expect(argvOf(planNightly({ tag: "16.2.0", imageCache: "/c", record: true }))).toEqual([
      "images ensure --a 16.2.0 --b 16.2.0 --image-cache /c",
      "run --mode noise --a 16.2.0 --b 16.2.0 --runs 5 --load 20x30s --require-verified",
      `noise record --status ${LATEST_NOISE} --tag 16.2.0`
    ]);
    expect(argvOf(planNightly({ tag: "main", imageCache: "/c", record: false }))).toHaveLength(2);
    expect(argvOf(planNightly({ tag: "main", imageCache: "/c", record: true, store: "/s" }))[2]).toContain("--store /s");
  });

  it("gate: the three workflow jobs, in order, with the noise status first", () => {
    const plan = planGate({ production: "16.2.0", candidate: "16.3.0-rc.1", claims: "/r/claims.yaml", runs: 3 });
    expect(plan.steps.map((s) => s.id)).toEqual(["noise-status", "ensure", "release", "migration", "upgrade"]);
    expect(argvOf(plan)).toEqual([
      "noise status",
      "images ensure --a 16.2.0 --b 16.3.0-rc.1",
      "run --mode release --a 16.2.0 --b 16.3.0-rc.1 --runs 3 --load 20x30s --claims /r/claims.yaml",
      "run --mode migration --a v16.2.0 --b v16.3.0-rc.1",
      "run --mode upgrade --a 16.2.0 --b 16.3.0-rc.1 --set fixture --journey anonymous-student-reads-course"
    ]);
  });

  it("gate: migration refs default to v<tag> and can be named; --only runs one rehearsal; an override rides on every run", () => {
    const named = planGate({ production: "16.2.0", candidate: "16.3.0-rc.1", migrationsA: "release/16.2.0", migrationsB: "abc123", only: "migration" });
    expect(argvOf(named)).toEqual(["noise status", "run --mode migration --a release/16.2.0 --b abc123"]);
    const overridden = planGate({ production: "1", candidate: "2", override: { reason: "accepting the header change, ticket 42", by: "leigh" } });
    for (const s of overridden.steps.filter((s) => s.argv[0] === "run")) expect(s.argv.join(" ")).toContain("--override-reason accepting the header change, ticket 42 --override-by leigh");
    expect(argvOf(planGate({ production: "1", candidate: "2", only: "upgrade" }))).toEqual(["noise status", "images ensure --a 1 --b 2", "run --mode upgrade --a 1 --b 2 --set fixture --journey anonymous-student-reads-course"]);
  });

  it("mutants: ensure the base, then every mutant", () => {
    expect(argvOf(planMutants({ tag: "main" }))).toEqual(["images ensure --a main --b main", "mutants --base main"]);
  });

  it("watch: post-deploy against production, with the recorded run found at run time unless named", () => {
    expect(argvOf(planWatch({ production: "reader=u,catalogue=v,live=w" }))[1]).toBe(`run --mode post-deploy --recorded ${LATEST_RECORDED} --production reader=u,catalogue=v,live=w`);
    expect(argvOf(planWatch({ production: "x", recorded: "/out/r" }))[1]).toContain("--recorded /out/r");
  });

  it("the defaults are the workflows' defaults", () => {
    expect(WORKFLOW_DEFAULTS.imagePrefix).toBe(QUAY_IMAGE_TEMPLATE);
    expect(workflowEnv({})).toEqual({ HARNESS_IMAGE_PREFIX: QUAY_IMAGE_TEMPLATE });
    expect(workflowEnv({ HARNESS_IMAGE_PREFIX: "tutors" })).toEqual({ HARNESS_IMAGE_PREFIX: "tutors" });
    expect(workflowEnv({ HARNESS_IMAGE_PREFIX: "" })).toEqual({ HARNESS_IMAGE_PREFIX: QUAY_IMAGE_TEMPLATE });
  });

  it("--dry-run text shows every command", () => {
    const text = renderPlan(planMutants({ tag: "main" }), workflowEnv({}));
    expect(text).toContain("harness mutants --base main");
    expect(text).toContain("HARNESS_IMAGE_PREFIX=quay.io/tutors-sdk/tutors-{app}");
  });

  it("the CLI turns flags into those plans, with paths made absolute (the child runs in the harness checkout)", () => {
    const gate = buildPlan("gate", { a: "1", b: "2", claims: "rel/claims.yaml", only: "release" }, {});
    expect(gate.steps.find((s) => s.id === "release")!.argv.join(" ")).toMatch(/--claims .*rel[\\/]claims\.yaml/);
    expect(gate.steps.find((s) => s.id === "release")!.argv.join(" ")).not.toContain("--claims rel/");
    expect(() => buildPlan("gate", { a: "1" }, {})).toThrow(/needs --a/);
    expect(() => buildPlan("gate", { a: "1", b: "2", only: "everything" }, {})).toThrow(/--only takes/);
    expect(() => buildPlan("nightly", { runs: "0" }, {})).toThrow(/whole number/);
    expect(buildPlan("nightly", {}, { HARNESS_PRODUCTION_TAG: "16.2.2" }).steps[1]!.argv).toContain("16.2.2");
    expect(buildPlan("nightly", { record: false }, {}).steps).toHaveLength(2);
    expect(buildPlan("mutants", { base: "16.2.0" }, {}).steps[1]!.argv).toEqual(["mutants", "--base", "16.2.0"]);
    expect(() => buildPlan("teleport", {}, {})).toThrow(/local nightly/);
  });

  it("an override given without --override-by is attributed to a person, not left blank", () => {
    const plan = buildPlan("gate", { a: "1", b: "2", "override-reason": "accepting the header change, ticket 42" }, {});
    const argv = plan.steps.find((s) => s.id === "release")!.argv;
    expect(argv[argv.indexOf("--override-by") + 1]).toMatch(/\S/);
  });
});

describe("running a plan", () => {
  function fake(codes: Record<string, number> = {}, opts: { noiseDir?: string | undefined; recorded?: string | undefined } = {}) {
    const ran: string[] = [];
    const ex: Executor = {
      harness: (argv) => {
        const key = argv[0] === "run" ? argv[2]! : argv[0] === "images" ? "ensure" : argv.slice(0, 2).join(" ");
        ran.push(argv.join(" "));
        return codes[key] ?? 0;
      },
      latestRun: (mode) => (mode === "noise" ? ("noiseDir" in opts ? opts.noiseDir : "/out/noise-run") : `/out/${mode}-run`),
      latestRecorded: () => ("recorded" in opts ? opts.recorded : "/out/release-run"),
      log: () => {}
    };
    return { ex, ran };
  }

  it("nightly: records the run directory the noise step produced", () => {
    const f = fake();
    const r = executePlan(planNightly({ tag: "main", imageCache: "/c", record: true }), {}, f.ex);
    expect(r.code).toBe(0);
    expect(f.ran.at(-1)).toBe("noise record --status /out/noise-run --tag main");
  });

  it("nightly: a failed pull stops everything, a crashed A/A records nothing, exit is the worst code", () => {
    const pull = fake({ ensure: 2 });
    const r1 = executePlan(planNightly({ tag: "main", imageCache: "/c", record: true }), {}, pull.ex);
    expect(pull.ran).toHaveLength(1);
    expect(r1.code).toBe(2);
    expect(r1.results.map((r) => r.code)).toEqual([2, "skipped", "skipped"]);
    const crash = fake({ noise: 2 });
    expect(executePlan(planNightly({ tag: "main", imageCache: "/c", record: true }), {}, crash.ex).code).toBe(2);
    expect(crash.ran.some((c) => c.startsWith("noise record"))).toBe(false);
  });

  it("nightly: a broken ratchet is exit 1 from the record step", () => {
    const f = fake({ "noise record": 1 });
    expect(executePlan(planNightly({ tag: "main", imageCache: "/c", record: true }), {}, f.ex).code).toBe(1);
  });

  it("gate: a FAIL in one rehearsal does not hide the others, and the worst code is returned", () => {
    const f = fake({ release: 1 });
    const r = executePlan(planGate({ production: "1", candidate: "2" }), {}, f.ex);
    expect(f.ran.filter((c) => c.startsWith("run"))).toHaveLength(3);
    expect(r.code).toBe(1);
    expect(r.results.find((x) => x.id === "release")!.runDir).toBe("/out/release-run");
  });

  it("gate: images that cannot be had stop the release and upgrade rehearsals, not the migration one", () => {
    const f = fake({ ensure: 1 });
    const r = executePlan(planGate({ production: "1", candidate: "2" }), {}, f.ex);
    expect(r.results.map((x) => [x.id, x.code])).toEqual([
      ["noise-status", 0],
      ["ensure", 1],
      ["release", "skipped"],
      ["migration", 0],
      ["upgrade", "skipped"]
    ]);
    expect(r.code).toBe(1);
  });

  it("the informational noise status never changes the exit code", () => {
    const f = fake({ "noise status": 7 });
    expect(executePlan(planGate({ production: "1", candidate: "2", only: "migration" }), {}, f.ex).code).toBe(0);
  });

  it("watch: without a recorded release run it says what to do and is exit 2, running nothing", () => {
    const f = fake({}, { recorded: undefined });
    const r = executePlan(planWatch({ production: "u" }), {}, f.ex);
    expect(r.code).toBe(2);
    expect(f.ran).toEqual(["noise status"]);
  });
});

describe("finding runs", () => {
  const out = tmp("out");
  const mk = (name: string, verdict?: string, opts: { capture?: boolean; override?: boolean } = {}) => {
    const dir = join(out, name);
    mkdirSync(join(dir, "b"), { recursive: true });
    if (verdict) writeFileSync(join(dir, "report.json"), JSON.stringify({ verdict, ...(opts.override ? { override: { applied: true } } : {}) }));
    if (opts.capture !== false) writeFileSync(join(dir, "b", "capture.json"), "{}");
    return dir;
  };

  it("the recorded run is the newest release run that did not FAIL (an overridden FAIL counts), with a capture", () => {
    mk("2026-09-10T10-00-00-release", "pass");
    const warn = mk("2026-09-11T10-00-00-release", "warn");
    mk("2026-09-12T10-00-00-release", "fail");
    mk("2026-09-13T10-00-00-release", "pass", { capture: false });
    mk("2026-09-14T10-00-00-noise", "pass");
    expect(latestRecordedIn(out)).toBe(warn);
    const overridden = mk("2026-09-15T10-00-00-release", "fail", { override: true });
    expect(latestRecordedIn(out)).toBe(overridden);
    expect(latestRecordedIn(join(out, "nowhere"))).toBeUndefined();
  });

  it("latestRunIn takes only runs made since a moment", () => {
    const fresh = tmp("out");
    const dir = join(fresh, "2026-09-16T10-00-00-noise");
    mkdirSync(dir, { recursive: true });
    expect(latestRunIn(fresh, "noise", Date.now() - 60_000)).toBe(dir);
    utimesSync(dir, new Date(0), new Date(0));
    expect(latestRunIn(fresh, "noise", Date.now() - 60_000)).toBeUndefined();
  });
});

describe("the gate's combined summary (the PR comment, to read here)", () => {
  it("lists each step's verdict, marks an override, and carries each report's markdown", () => {
    const dir = tmp("run");
    writeFileSync(join(dir, "report.json"), JSON.stringify({ verdict: "fail", reasons: ["1 unclaimed diff(s)"], override: { applied: true } }));
    writeFileSync(join(dir, "report.md"), "## the release report\n");
    const entry = readGateEntry({ id: "release", title: "release mode", argv: [], code: 0, runDir: dir });
    expect(entry).toMatchObject({ verdict: "fail", overridden: true });
    const md = renderGateSummary({ production: "16.2.0", candidate: "16.3.0-rc.1", at: "2026-09-16T09:00:00.000Z", code: 0, entries: [entry, { id: "ensure", title: "images", code: 2 }, { id: "upgrade", title: "upgrade", code: "skipped" }] });
    expect(md).toContain("## Release gate: 16.3.0-rc.1 beside 16.2.0");
    expect(md).toContain("| release mode | FAIL (OVERRIDDEN) |");
    expect(md).toContain("| images | exit 2 |");
    expect(md).toContain("| upgrade | not run |");
    expect(md).toContain("## the release report");
  });

  it("is written next to the runs as gate.md and gate.json, without the embedded markdown in the json", () => {
    const out = tmp("out");
    const files = writeGateSummary(out, new Date("2026-09-16T09:00:00Z"), { production: "1", candidate: "2", at: "x", code: 1, entries: [{ id: "release", title: "r", code: 1, markdown: "# big" }] });
    expect(files.md).toMatch(/2026-09-16T09-00-00-gate/);
    expect(readFileSync(files.md, "utf8")).toContain("# big");
    expect(JSON.parse(readFileSync(files.json, "utf8")).steps[0]).not.toHaveProperty("markdown");
  });
});

describe("the watch loop", () => {
  const harness = (codes: number[]) => {
    const log: string[] = [];
    const failures: string[] = [];
    const sleeps: number[] = [];
    let n = 0;
    let clock = Date.parse("2026-09-16T09:00:00Z");
    const deps = {
      runOnce: () => ({ code: codes[n++] ?? 0, runDir: `/out/pd-${n}` }),
      sleep: async (ms: number) => void (sleeps.push(ms), (clock += ms)),
      now: () => new Date((clock += 1000)),
      log: (m: string) => log.push(m),
      onFailure: (i: { runDir?: string }) => void failures.push(i.runDir ?? "?"),
      shouldStop: () => false
    };
    return { deps, log, failures, sleeps };
  };

  it("runs on a schedule, records each difference, never stops on one", async () => {
    const h = harness([0, 1, 2, 0]);
    const r = await watch({ intervalMs: 900_000, max: 4 }, h.deps);
    expect(r).toEqual({ iterations: 4, failures: 1, lastCode: 0 });
    expect(h.failures).toEqual(["/out/pd-2"]);
    expect(h.log.join("\n")).toContain("could not judge (exit 2)");
    // three sleeps between four runs, each about one interval from the start of the last
    expect(h.sleeps).toHaveLength(3);
    for (const s of h.sleeps) expect(s).toBeGreaterThan(890_000);
  });

  it("--once is one iteration and returns its code", async () => {
    const h = harness([1]);
    expect(await watch({ intervalMs: 900_000, max: 1 }, h.deps)).toMatchObject({ iterations: 1, lastCode: 1 });
    expect(h.sleeps).toEqual([]);
  });

  it("stops when told to", async () => {
    const h = harness([0, 0, 0]);
    let calls = 0;
    const r = await watch({ intervalMs: 60_000 }, { ...h.deps, shouldStop: () => calls++ >= 2 });
    expect(r.iterations).toBe(2);
  });

  it("intervals are a number and a unit, and never a hot loop against production", () => {
    expect(parseInterval("15m")).toBe(900_000);
    expect(parseInterval("90s")).toBe(90_000);
    expect(parseInterval("1h")).toBe(3_600_000);
    expect(() => parseInterval("5")).toThrow(/number and a unit/);
    expect(() => parseInterval("2s")).toThrow(/at least 10s/);
  });
});

describe("one run per machine", () => {
  it("a live holder blocks, and says who", () => {
    const file = join(tmp("lock"), "run.lock");
    const release = acquireLock(file, "harness local nightly", { pid: 111, isAlive: () => true });
    let error: unknown;
    try {
      acquireLock(file, "harness local gate", { pid: 222, isAlive: (p) => p === 111 });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(LockHeldError);
    expect((error as LockHeldError).message).toContain("harness local nightly (pid 111");
    release();
    expect(() => acquireLock(file, "harness local gate", { pid: 222 })()).not.toThrow();
  });

  it("a holder that is gone is stale and is taken over; a lock is only released by its owner", () => {
    const file = join(tmp("lock"), "run.lock");
    acquireLock(file, "crashed run", { pid: 111, isAlive: () => true });
    const release = acquireLock(file, "next run", { pid: 222, isAlive: () => false });
    // 111 tries to release a lock that is now 222's: nothing happens
    acquireLock(join(tmp("other"), "x"), "x", { pid: 111 })();
    expect(() => acquireLock(file, "third", { pid: 333, isAlive: (p) => p === 222 })).toThrow(LockHeldError);
    release();
  });

  it("the real liveness test knows this process is alive and pid 2^31-1 is not", async () => {
    const { processAlive } = await import("../src/local/lock.ts");
    expect(processAlive(process.pid)).toBe(true);
    expect(processAlive(2 ** 31 - 2)).toBe(false);
  });
});

describe("the override log", () => {
  const entry = (n: number) => ({ at: `2026-09-1${n}T09:00:00.000Z`, by: "leigh", reason: `accepting difference number ${n}, ticket 4${n}`, mode: "release", verdict: "fail", harnessVersion: "1.2.0" });

  it("appends numbered, chained lines and reads them back intact", () => {
    const file = join(tmp("ov"), "overrides.jsonl");
    expect(appendOverride(file, entry(1)).seq).toBe(1);
    expect(appendOverride(file, entry(2)).seq).toBe(2);
    const log = readOverrides(file);
    expect(log.entries.map((e) => e.seq)).toEqual([1, 2]);
    expect(log.chainIntact).toBe(true);
    expect(readOverrides(join(tmp("none"), "x.jsonl"))).toEqual({ entries: [], chainIntact: true, problems: [] });
  });

  it("notices a removed or edited line", () => {
    const file = join(tmp("ov"), "overrides.jsonl");
    for (const n of [1, 2, 3]) appendOverride(file, entry(n));
    const lines = readFileSync(file, "utf8").trim().split("\n");
    writeFileSync(file, [lines[0], lines[2]].join("\n") + "\n");
    const removed = readOverrides(file);
    expect(removed.chainIntact).toBe(false);
    expect(removed.problems[0]).toContain("does not chain");
    writeFileSync(file, [lines[0]!.replace("leigh", "someone"), lines[1], lines[2]].join("\n") + "\n");
    expect(readOverrides(file).chainIntact).toBe(false);
  });

  it("is written from a report only when the override was applied", () => {
    const base = { mode: "release" as const, sides: { a: { reader: "r:1", catalogue: "c:1", live: "l:1" }, b: { reader: "r:2", catalogue: "c:2", live: "l:2" } }, harness: { version: "1.2.0", gitSha: null, contractVersion: "1.2.0" } };
    const applied = { reason: "accepting the header change, ticket 42", by: "leigh", verdict: "fail" as const, applied: true, at: "2026-09-16T09:00:00.000Z" };
    expect(overrideFromReport({ ...base, override: applied }, "/out/x")).toMatchObject({ by: "leigh", mode: "release", a: "r:1", b: "r:2", reportDir: "/out/x" });
    expect(overrideFromReport({ ...base, override: { ...applied, applied: false, verdict: "pass" } }, "/out/x")).toBeUndefined();
    expect(overrideFromReport(base, "/out/x")).toBeUndefined();
  });
});

describe("the port offset, so a run can sit beside a developer's own stack", () => {
  it("moves every host port by the offset, and only what the caller has not set", () => {
    const env = portEnv(1000, { READER_PORT_A: "5000" });
    expect(env.READER_PORT_A).toBeUndefined();
    expect(env.READER_PORT_B).toBe("4200");
    expect(env.COURSE_PORT).toBe("9080");
    expect(Object.keys(env)).toHaveLength(Object.keys(DEFAULT_PORTS).length - 1);
    expect(portEnv(0, {})).toEqual({});
  });

  it("covers exactly the ports compose.harness.yaml publishes, at the defaults it declares", () => {
    const compose = readFileSync(join(import.meta.dirname, "..", "compose.harness.yaml"), "utf8");
    expect(Object.fromEntries(composePorts(compose, {}).map((p) => [p.variable, p.port]))).toEqual(DEFAULT_PORTS);
  });

  it("the stack's own environment reading agrees: src/stack.ts takes the same variables", () => {
    const stack = readFileSync(join(import.meta.dirname, "..", "src", "stack.ts"), "utf8");
    for (const name of Object.keys(DEFAULT_PORTS)) expect(stack, name).toContain(name);
  });
});

describe("where state lives", () => {
  it("HARNESS_HOME moves the noise store and the override log; the default is inside the checkout's .harness", () => {
    expect(noiseDir(harnessHome({ HARNESS_HOME: "/data/h" }))).toMatch(/[\\/]data[\\/]h[\\/]noise$/);
    expect(overridesFile(harnessHome({ HARNESS_HOME: "/data/h" }))).toMatch(/overrides\.jsonl$/);
    expect(harnessHome({})).toMatch(/[\\/]\.harness$/);
    expect(harnessHome({ HARNESS_HOME: "  " })).toMatch(/[\\/]\.harness$/);
  });

  it("the workflows' image cache path is the local default's relative form", () => {
    const nightly = readFileSync(join(import.meta.dirname, "..", ".github", "workflows", "nightly-noise.yml"), "utf8");
    expect(nightly).toContain("--image-cache .harness/image-cache");
    expect(parse(nightly)).toBeTruthy();
  });
});
