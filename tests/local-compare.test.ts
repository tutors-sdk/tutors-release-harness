/**
 * `harness local compare`: which release is the last one (against a fake Quay, never the network), the plan (the
 * gate's release step), the flags, `--dry-run`, the exit codes and the end-of-run block. The executor is a fake:
 * nothing here starts Docker or a child process.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ReleaseResolutionError,
  compareReleases,
  formatElapsed,
  highestCommonRelease,
  isReleaseTag,
  planCompare,
  quayRepository,
  quayTags,
  renderSummary,
  resolveLastRelease,
  runCompare,
  type FetchLike,
  type HttpResponse
} from "../src/local/compare.ts";
import { UsageError, buildPlan, compareCommand, compareOptions } from "../src/local/cli.ts";
import { LockHeldError } from "../src/local/lock.ts";
import { WORKFLOW_DEFAULTS, latestRecordedIn, latestRunIn, planGate, type Executor } from "../src/local/tasks.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-${name}-`));

/** A Quay that answers with the given tags per app (`tutors-<app>`), in pages of `pageSize`. Records every URL asked. */
function fakeQuay(tags: Record<string, string[]>, pageSize = 100, asked: string[] = []): FetchLike {
  return async (url) => {
    asked.push(url);
    const m = /\/repository\/([^/]+)\/tutors-([a-z]+)\/tag\/\?(.*)$/.exec(url);
    const app = m?.[2];
    if (!m || !app || !tags[app]) return { ok: false, status: 404, json: async () => ({}) } satisfies HttpResponse;
    const page = Number(/[?&]page=(\d+)/.exec(url)?.[1] ?? 1);
    const slice = tags[app]!.slice((page - 1) * pageSize, page * pageSize);
    return { ok: true, status: 200, json: async () => ({ tags: slice.map((name) => ({ name })), page, has_additional: page * pageSize < tags[app]!.length }) };
  };
}

const ALL = (tags: string[]) => ({ reader: tags, catalogue: tags, live: tags, time: tags });
const NOISE = ["main", "latest", "sha-5d7283e", "16.2", "v16.9.9", "17.0.0-rc.1", "16.3.0-beta", "16.3.0+build5", "016.1.0"];

describe("which tags are releases", () => {
  it("only strict X.Y.Z: no v prefix, prerelease, build metadata, alias, main, latest or sha-", () => {
    for (const t of ["16.2.2", "0.0.1", "16.10.0", "1.0.0"]) expect(isReleaseTag(t), t).toBe(true);
    for (const t of NOISE) expect(isReleaseTag(t), t).toBe(false);
  });

  it("orders numerically, so 16.10.0 is above 16.9.0", () => {
    expect(["16.9.0", "16.10.0", "16.2.2", "9.99.99", "16.2.10"].sort(compareReleases)).toEqual(["9.99.99", "16.2.2", "16.2.10", "16.9.0", "16.10.0"]);
  });

  it("the highest tag present for every app; an app missing the newest one makes it the previous one", () => {
    expect(highestCommonRelease(ALL(["16.2.1", "16.2.2", ...NOISE]))).toBe("16.2.2");
    expect(highestCommonRelease({ ...ALL(["16.2.1", "16.3.0"]), time: ["16.2.1"] })).toBe("16.2.1");
    expect(highestCommonRelease({ reader: ["16.3.0", "16.2.2"], catalogue: ["16.3.0", "16.2.2"], live: ["16.2.2"], time: ["16.3.0", "16.2.2", "16.2.1"] })).toBe("16.2.2");
    // the newest release is not the last one until every app has it, even when only one app has a newer tag
    expect(highestCommonRelease({ reader: ["16.3.0", "16.2.2"], catalogue: ["16.2.2"], live: ["16.2.2"], time: ["16.2.2"] })).toBe("16.2.2");
  });

  it("nothing in common is undefined, not a guess", () => {
    expect(highestCommonRelease({ reader: ["1.0.0"], catalogue: ["2.0.0"] })).toBeUndefined();
    expect(highestCommonRelease(ALL(NOISE))).toBeUndefined();
    expect(highestCommonRelease({})).toBeUndefined();
  });
});

describe("the Quay query", () => {
  it("reads quay.io/<namespace>/<repository> out of an image repository, and nothing else", () => {
    expect(quayRepository("quay.io/tutors-sdk/tutors-reader")).toEqual({ namespace: "tutors-sdk", name: "tutors-reader" });
    for (const r of ["tutors/reader", "ghcr.io/tutors-sdk/tutors-reader", "localhost:5000/x/y", "quay.io/a/b/c"]) expect(quayRepository(r), r).toBeUndefined();
  });

  it("asks the public API for 100 active tags a page, and pages while Quay says there are more", async () => {
    const asked: string[] = [];
    const many = Array.from({ length: 230 }, (_, i) => `sha-${i}`).concat("16.2.2");
    const got = await quayTags({ namespace: "tutors-sdk", name: "tutors-reader" }, fakeQuay({ reader: many }, 100, asked));
    expect(got).toHaveLength(231);
    expect(asked).toEqual([
      "https://quay.io/api/v1/repository/tutors-sdk/tutors-reader/tag/?limit=100&onlyActiveTags=true",
      "https://quay.io/api/v1/repository/tutors-sdk/tutors-reader/tag/?limit=100&onlyActiveTags=true&page=2",
      "https://quay.io/api/v1/repository/tutors-sdk/tutors-reader/tag/?limit=100&onlyActiveTags=true&page=3"
    ]);
  });

  it("a page that is not a tag list, or an HTTP error, is an error (so the caller falls back)", async () => {
    await expect(quayTags({ namespace: "a", name: "b" }, async () => ({ ok: true, status: 200, json: async () => ({ nope: 1 }) }))).rejects.toThrow(/tag list/);
    await expect(quayTags({ namespace: "a", name: "b" }, async () => ({ ok: false, status: 503, json: async () => ({}) }))).rejects.toThrow(/503/);
  });
});

describe("resolving the last release", () => {
  const env = (extra: Record<string, string> = {}): NodeJS.ProcessEnv => ({ ...extra });

  it("the highest X.Y.Z present for all four apps, asking each app's repository, and says how it chose", async () => {
    const asked: string[] = [];
    const found = await resolveLastRelease(env(), fakeQuay(ALL(["main", "sha-1", "16.2", "16.2.1", "16.2.2", "17.0.0-rc.1"]), 100, asked));
    expect(found).toEqual({ tag: "16.2.2", how: "highest X.Y.Z present for reader, catalogue, live, time on quay.io" });
    expect(asked.map((u) => /tutors-([a-z]+)\/tag/.exec(u)![1]).sort()).toEqual(["catalogue", "live", "reader", "time"]);
  });

  it("a release one app lacks is not the last release: the previous one is", async () => {
    const found = await resolveLastRelease(env(), fakeQuay({ reader: ["16.3.0", "16.2.2"], catalogue: ["16.3.0", "16.2.2"], live: ["16.3.0", "16.2.2"], time: ["16.2.2", "16.2.1"] }));
    expect(found.tag).toBe("16.2.2");
  });

  it("a prefix that is not a Quay one: no query, HARNESS_PRODUCTION_TAG, and the way it was found says why", async () => {
    const never: FetchLike = async () => {
      throw new Error("must not be called");
    };
    const found = await resolveLastRelease(env({ HARNESS_IMAGE_PREFIX: "tutors", HARNESS_PRODUCTION_TAG: "16.1.0" }), never);
    expect(found.tag).toBe("16.1.0");
    expect(found.how).toBe("HARNESS_PRODUCTION_TAG, because the image prefix tutors is not a quay.io one");
  });

  it("a prefix that is not a Quay one, and no tag to fall back to (or the literal default main): exit-2 message that says how to pass --a", async () => {
    for (const tag of [undefined, "", "main"]) {
      const e = await resolveLastRelease(env({ HARNESS_IMAGE_PREFIX: "ghcr.io/tutors-sdk/tutors-{app}", ...(tag === undefined ? {} : { HARNESS_PRODUCTION_TAG: tag }) }), async () => {
        throw new Error("no network");
      }).catch((x: unknown) => x);
      expect(e, String(tag)).toBeInstanceOf(ReleaseResolutionError);
      expect((e as Error).message).toContain("not a quay.io one");
      expect((e as Error).message).toContain("--a <tag>");
      expect((e as Error).message).toContain("HARNESS_PRODUCTION_TAG");
    }
  });

  it("a query that fails (offline, an HTTP error, a timeout) falls back to HARNESS_PRODUCTION_TAG, else the same message", async () => {
    for (const failing of [
      async () => {
        throw new Error("getaddrinfo ENOTFOUND quay.io");
      },
      async () => ({ ok: false, status: 500, json: async () => ({}) })
    ] as FetchLike[]) {
      const found = await resolveLastRelease(env({ HARNESS_PRODUCTION_TAG: "16.2.0" }), failing);
      expect(found.tag).toBe("16.2.0");
      expect(found.how).toContain("HARNESS_PRODUCTION_TAG, because quay.io could not be queried");
      await expect(resolveLastRelease(env(), failing)).rejects.toThrow(/quay\.io could not be queried.*--a <tag>/s);
    }
  });

  it("no release in common on Quay falls back too, and never returns main", async () => {
    await expect(resolveLastRelease(env({ HARNESS_PRODUCTION_TAG: "main" }), fakeQuay(ALL(NOISE)))).rejects.toThrow(/no X\.Y\.Z tag exists for all of reader, catalogue, live, time/);
    expect((await resolveLastRelease(env({ HARNESS_PRODUCTION_TAG: "16.0.0" }), fakeQuay(ALL(NOISE)))).tag).toBe("16.0.0");
  });

  it("HARNESS_IMAGE_PREFIX names the repositories asked (another Quay namespace is queried, not tutors-sdk)", async () => {
    const asked: string[] = [];
    await resolveLastRelease(env({ HARNESS_IMAGE_PREFIX: "quay.io/somebody/x-{app}" }), async (u) => {
      asked.push(u);
      return { ok: true, status: 200, json: async () => ({ tags: [{ name: "1.2.3" }], has_additional: false }) };
    });
    expect(asked[0]).toContain("/repository/somebody/x-reader/tag/");
  });
});

describe("the plan is the gate's release step", () => {
  const argv = (p: { steps: { argv: string[] }[] }) => p.steps.map((s) => s.argv);

  it("noise status, ensure, release: the same commands as `local gate --only release`, with 3 runs and the gate's load", () => {
    const plan = planCompare({ production: "16.2.2", candidate: "main", runs: 3, load: WORKFLOW_DEFAULTS.load });
    expect(plan.task).toBe("compare");
    expect(plan.steps.map((s) => s.id)).toEqual(["noise-status", "ensure", "release"]);
    expect(argv(plan)).toEqual(argv(planGate({ production: "16.2.2", candidate: "main", only: "release", runs: 3 })));
    expect(argv(plan)).toEqual([["noise", "status"], ["images", "ensure", "--a", "16.2.2", "--b", "main"], ["run", "--mode", "release", "--a", "16.2.2", "--b", "main", "--runs", "3", "--load", "20x30s"]]);
  });

  it("no claims unless asked for; nothing builds; no rehearsal, no override", () => {
    const plan = planCompare({ production: "16.2.2", candidate: "main", runs: 3, load: "20x30s" });
    expect(plan.steps.flatMap((s) => s.argv)).not.toContain("--claims");
    expect(plan.steps.flatMap((s) => s.argv)).not.toContain("--ref-a");
    expect(plan.steps.flatMap((s) => s.argv)).not.toContain("--ref-b");
    expect(plan.steps.map((s) => s.argv.join(" ")).join("\n")).not.toMatch(/migration|upgrade|override/);
    expect(argv(planCompare({ production: "16.2.2", candidate: "main", runs: 3, load: "20x30s", claims: "/c/claims.yaml" }))[2]).toEqual(["run", "--mode", "release", "--a", "16.2.2", "--b", "main", "--runs", "3", "--load", "20x30s", "--claims", "/c/claims.yaml"]);
  });

  it("load false drops the load leg, and only that", () => {
    expect(argv(planCompare({ production: "16.2.2", candidate: "main", runs: 1, load: false }))[2]).toEqual(["run", "--mode", "release", "--a", "16.2.2", "--b", "main", "--runs", "1"]);
  });

  it("the gate itself is unchanged: 5 runs and the load, by default", () => {
    expect(argv(planGate({ production: "16.2.2", candidate: "main", only: "release" }))[2]).toEqual(["run", "--mode", "release", "--a", "16.2.2", "--b", "main", "--runs", "5", "--load", "20x30s"]);
  });

  it("is one stream of steps that stops when the images cannot be had", () => {
    const plan = planCompare({ production: "16.2.2", candidate: "main", runs: 3, load: false });
    expect(plan.steps.find((s) => s.id === "ensure")).toMatchObject({ gatesStream: true, stream: "images" });
    expect(plan.steps.find((s) => s.id === "noise-status")).toMatchObject({ informational: true });
  });
});

describe("the flags", () => {
  it("defaults: b main, 3 runs, the gate's load, no claims, not strict", () => {
    expect(compareOptions({})).toEqual({ candidate: "main", runs: 3, load: "20x30s", strict: false });
  });

  it("--no-load, however the parser hands it over (`no-load: true`, or `load: false` from allowNegative)", () => {
    expect(compareOptions({ "no-load": true }).load).toBe(false);
    expect(compareOptions({ load: false }).load).toBe(false);
    expect(compareOptions({ load: "5x10s" }).load).toBe("5x10s");
  });

  it("--strict, --runs, --b and --claims (resolved to a path)", () => {
    expect(compareOptions({ strict: true, runs: "1", b: "16.3.0-rc.1", claims: "claims.yaml" })).toEqual({ candidate: "16.3.0-rc.1", runs: 1, load: "20x30s", strict: true, claims: resolve("claims.yaml") });
  });

  it("bad values are usage errors, before anything is fetched", () => {
    expect(() => compareOptions({ runs: "0" })).toThrow(UsageError);
    expect(() => compareOptions({ runs: "many" })).toThrow(/whole number/);
    expect(() => compareOptions({ load: "fast" })).toThrow(/<rate>x<duration>/);
    expect(() => compareOptions({ load: "5x10s", "no-load": true })).toThrow(/contradict/);
  });

  it("buildPlan(compare) needs the release already resolved", () => {
    expect(() => buildPlan("compare", {})).toThrow(UsageError);
    expect(buildPlan("compare", { a: "16.2.2", "no-load": true, runs: "1" }).steps[2]!.argv).toEqual(["run", "--mode", "release", "--a", "16.2.2", "--b", "main", "--runs", "1"]);
  });
});

describe("--dry-run", () => {
  const quay = fakeQuay(ALL(["main", "16.2.1", "16.2.2"]));
  const noRun: Executor = {
    harness: () => {
      throw new Error("a dry run starts nothing");
    },
    latestRun: () => undefined,
    latestRecorded: () => undefined,
    log: () => {}
  };
  afterEach(() => vi.restoreAllMocks());

  it("says what it resolved, prints the three commands and the environment (--port-offset shows), and touches neither the executor nor the state directory", async () => {
    const home = join(tmp("cmp-home"), "state");
    const lines: string[] = [];
    const code = await compareCommand({ "dry-run": true, "port-offset": "2000" }, { env: {}, fetch: quay, ex: noRun, home, say: (m) => lines.push(m) });
    const out = lines.join("\n");
    expect(code).toBe(0);
    expect(out).toContain("resolved: 16.2.2 (highest X.Y.Z present for reader, catalogue, live, time on quay.io)");
    expect(out).toContain("harness images ensure --a 16.2.2 --b main");
    expect(out).toContain("harness run --mode release --a 16.2.2 --b main --runs 3 --load 20x30s");
    expect(out).toContain("READER_PORT_A=5100");
    expect(out).toContain("nothing was pulled or run");
    expect(() => readdirSync(home)).toThrow();
  });

  it("--no-load and --runs 1 (the fast look); --a and --b as given, which need no network", async () => {
    const lines: string[] = [];
    const never: FetchLike = async () => {
      throw new Error("--a was given: nothing to look up");
    };
    await compareCommand({ "dry-run": true, "no-load": true, runs: "1", a: "16.2.0", b: "16.3.0-rc.1" }, { env: {}, fetch: never, ex: noRun, say: (m) => lines.push(m) });
    const out = lines.join("\n");
    expect(out).toContain("release: 16.2.0 (given with --a)");
    expect(out).toMatch(/harness run --mode release --a 16\.2\.0 --b 16\.3\.0-rc\.1 --runs 1\s*$/m);
  });

  it("--json is one document with the plan", async () => {
    const docs: string[] = [];
    await compareCommand({ "dry-run": true, json: true, strict: true }, { env: {}, fetch: quay, ex: noRun, emit: (t) => docs.push(t), say: () => {} });
    expect(docs).toHaveLength(1);
    const doc = JSON.parse(docs[0]!);
    expect(doc).toMatchObject({ a: "16.2.2", b: "main", strict: true });
    expect(doc.steps.map((s: { id: string }) => s.id)).toEqual(["noise-status", "ensure", "release"]);
  });

  it("no release to be found is exit 2 and the message on stderr", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const code = await compareCommand({ "dry-run": true }, { env: { HARNESS_IMAGE_PREFIX: "tutors" }, fetch: quay, ex: noRun, say: () => {} });
    expect(code).toBe(2);
    expect(String(err.mock.calls[0]![0])).toContain("--a <tag>");
  });
});

// ---- running: exit codes and the end-of-run block ----------------------------------------------------

interface Fake {
  /** `run` (the release step): its exit code and what it leaves behind. */
  runCode?: number;
  report?: "none" | "broken" | object;
  ensureCode?: number;
  /** A lock that is held. */
  locked?: boolean;
}

const hunk = (id: string, severity: "fail" | "info" = "fail") => ({ id, artefact: "html", scope: `/${id}`, summary: id, severity });

function fakeReport(over: Record<string, unknown> = {}) {
  const hunks = [hunk("a"), hunk("b"), hunk("c"), hunk("d", "info")];
  return { verdict: "fail", reasons: ["3 unclaimed diff(s)"], compare: { hunks, matches: hunks.map((h, i) => (i === 0 ? { hunk: h, claim: { artefact: "html", scope: "/a", reason: "x" } } : { hunk: h })), unclaimed: hunks.slice(1, 3), staleClaims: [], broadUnapproved: [] }, ...over };
}

function harnessRun(f: Fake) {
  const out = tmp("cmp-out");
  const said: string[] = [];
  const emitted: string[] = [];
  const called: string[][] = [];
  let ts = 0;
  const ex: Executor = {
    harness: (argv) => {
      called.push(argv);
      if (argv[0] === "images") return f.ensureCode ?? 0;
      if (argv[0] === "run") {
        const dir = join(out, `2026-09-21T10-00-0${(ts += 1)}-release`);
        mkdirSync(dir, { recursive: true });
        if (f.report === "broken") writeFileSync(join(dir, "report.json"), "{ not json");
        else if (f.report !== "none") writeFileSync(join(dir, "report.json"), JSON.stringify(f.report ?? fakeReport()));
        return f.runCode ?? 1;
      }
      return 0;
    },
    latestRun: (mode, since) => latestRunIn(out, mode, since),
    latestRecorded: () => latestRecordedIn(out),
    log: (m) => said.push(m)
  };
  return { out, said, emitted, called, ex };
}

function go(f: Fake, opts: { strict?: boolean; json?: boolean; clock?: number[] } = {}) {
  const h = harnessRun(f);
  const clock = [...(opts.clock ?? [1_000_000, 1_000_000 + 754_000])];
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  const code = runCompare({
    plan: planCompare({ production: "16.2.2", candidate: "main", runs: 1, load: false }),
    env: { HARNESS_IMAGE_PREFIX: "q" },
    ex: h.ex,
    lock: () => {
      if (f.locked) throw new LockHeldError("run.lock", { pid: 1, since: "now", task: "harness local gate" });
      return () => {};
    },
    a: "16.2.2",
    b: "main",
    resolved: "16.2.2 (test)",
    strict: opts.strict ?? false,
    json: opts.json ?? false,
    now: () => clock.shift() ?? 0,
    say: (m) => h.said.push(m),
    emit: (t) => h.emitted.push(t)
  });
  const stderr = err.mock.calls.map((c) => String(c[0])).join("\n");
  err.mockRestore();
  return { code, ...h, text: h.said.join("\n"), stderr };
}

describe("the exit code is about the run, not the verdict", () => {
  afterEach(() => vi.restoreAllMocks());

  it("a FAIL (the run exits 1) is exit 0: it produced a report", () => {
    const r = go({ runCode: 1 });
    expect(r.code).toBe(0);
    expect(r.called.map((a) => a[0])).toEqual(["noise", "images", "run"]);
  });

  it("pass and warn (the run exits 0) are exit 0", () => {
    expect(go({ runCode: 0, report: fakeReport({ verdict: "pass", reasons: [] }) }).code).toBe(0);
    expect(go({ runCode: 0, report: fakeReport({ verdict: "warn" }) }).code).toBe(0);
  });

  it("--strict follows the verdict as `local gate` does: 1 on a FAIL, 0 on pass or warn", () => {
    expect(go({ runCode: 1 }, { strict: true }).code).toBe(1);
    expect(go({ runCode: 0, report: fakeReport({ verdict: "warn" }) }, { strict: true }).code).toBe(0);
    expect(go({ runCode: 0, report: fakeReport({ verdict: "pass", reasons: [] }) }, { strict: true }).code).toBe(0);
  });

  it("an image that cannot be had or verified is exit 2, the release run never starts, --strict or not", () => {
    for (const strict of [false, true]) {
      const r = go({ ensureCode: 1 }, { strict });
      expect(r.code).toBe(2);
      expect(r.called.map((a) => a[0])).toEqual(["noise", "images"]);
      expect(r.text).toContain("could not judge");
      expect(r.text).toContain("nothing is built");
    }
    expect(go({ ensureCode: 2 }).code).toBe(2);
  });

  it("a run that wrote no report (it stopped: exit 2, or an unexpected 1) is exit 2, could not judge", () => {
    expect(go({ runCode: 2, report: "none" }).code).toBe(2);
    expect(go({ runCode: 1, report: "none" }, { strict: true }).code).toBe(2);
  });

  it("a report that is there and cannot be read is a harness fault: exit 1", () => {
    const r = go({ runCode: 1, report: "broken" });
    expect(r.code).toBe(1);
    expect(r.text).toContain("harness error");
    expect(go({ runCode: 1, report: { hello: "world" } }).code).toBe(1);
  });

  it("the run lock held is exit 2, and nothing runs", () => {
    const r = go({ locked: true });
    expect(r.code).toBe(2);
    expect(r.called).toEqual([]);
    expect(r.stderr).toContain("another harness run holds run.lock");
  });
});

describe("the end-of-run block", () => {
  afterEach(() => vi.restoreAllMocks());

  it("verdict, counts, both report paths, the browser note, the elapsed time, the exit code, and follow-ups that exist", () => {
    const r = go({ runCode: 1 });
    const t = r.text;
    expect(t).toContain("== compare: main beside the last release 16.2.2");
    expect(t).toContain("verdict:      FAIL");
    expect(t).toContain("differences:  4 (1 claimed, 2 unclaimed, 1 informational)");
    const dir = readdirSync(r.out).find((d) => d.endsWith("-release"))!;
    expect(t).toContain(`report.md:    ${join(r.out, dir, "report.md")}`);
    expect(t).toContain(`report.html:  ${join(r.out, dir, "report.html")}`);
    expect(t).toMatch(/open .*out\/.*-release\/report\.html in a browser|open .*report\.html in a browser/);
    expect(t).toContain("elapsed:      12m 34s");
    expect(t).toContain("exit code:    0");
    // exactly three follow-ups, each a command that exists
    expect(t).toMatch(/1\. read .*report\.html/);
    expect(t).toContain(`pnpm harness compare --dir ${join(r.out, dir)} --mode release --claims <claims.yaml>`);
    expect(t).toContain("pnpm harness local gate --a 16.2.2 --b main --claims <claims.yaml>");
    expect(t.match(/^ {2}\d\. /gm)).toHaveLength(3);
  });

  it("--strict says the exit code follows the verdict", () => {
    expect(go({ runCode: 1 }, { strict: true }).text).toContain("exit code:    1 (--strict: follows the verdict");
  });

  it("--json: stdout is one JSON document, and the block is not printed", () => {
    const r = go({ runCode: 1 }, { json: true });
    expect(r.emitted).toHaveLength(1);
    const doc = JSON.parse(r.emitted[0]!);
    expect(doc).toMatchObject({ a: "16.2.2", b: "main", verdict: "fail", differences: 4, claimed: 1, unclaimed: 2, informational: 1, elapsedSeconds: 754, exitCode: 0 });
    expect(doc.reportHtml).toMatch(/report\.html$/);
    expect(r.text).not.toContain("== compare");
  });

  it("formats elapsed time", () => {
    expect([0, 7, 59.6, 60, 754, 3600, 3725].map(formatElapsed)).toEqual(["0s", "7s", "1m 00s", "1m 00s", "12m 34s", "1h 00m 00s", "1h 02m 05s"]);
  });

  it("a pass has no 'this changed' caveat on it", () => {
    const s = renderSummary({ a: "1.0.0", b: "main", resolved: "x", verdict: "pass", reasons: [], differences: 0, claimed: 0, unclaimed: 0, informational: 0, runDir: "/o/x-release", reportMd: "/o/x-release/report.md", reportHtml: "/o/x-release/report.html", elapsedSeconds: 5, exitCode: 0 }, { strict: false });
    expect(s).toContain("verdict:      PASS\n");
    expect(s).toContain("differences:  0 (0 claimed, 0 unclaimed)");
  });
});

// ---- through the process --------------------------------------------------------------------------------

function harness(args: string[], env: NodeJS.ProcessEnv = {}) {
  const home = mkdtempSync(join(tmpdir(), "harness-cmp-cli-"));
  const r = spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, HARNESS_HOME: home, HARNESS_PRODUCTION_TAG: "", HARNESS_IMAGE_PREFIX: "", ...env } });
  return { code: r.status, out: r.stdout, err: r.stderr, home };
}

describe("through the CLI process (no network: the image prefix is not a Quay one)", () => {
  it("--dry-run falls back to HARNESS_PRODUCTION_TAG, prints the plan, exits 0 and leaves the state directory empty", () => {
    const r = harness(["local", "compare", "--dry-run", "--no-load", "--runs", "1", "--port-offset", "1000"], { HARNESS_IMAGE_PREFIX: "tutors", HARNESS_PRODUCTION_TAG: "16.2.0" });
    expect(r.code).toBe(0);
    expect(r.out).toContain("resolved: 16.2.0 (HARNESS_PRODUCTION_TAG, because the image prefix tutors is not a quay.io one)");
    expect(r.out).toContain("harness run --mode release --a 16.2.0 --b main --runs 1");
    expect(r.out).not.toContain("--load");
    expect(r.out).toContain("READER_PORT_A=4100");
    expect(readdirSync(r.home)).toEqual([]);
  });

  it("no release resolvable is a message and exit 2, not a stack trace", () => {
    const r = harness(["local", "compare", "--dry-run"], { HARNESS_IMAGE_PREFIX: "tutors" });
    expect(r.code).toBe(2);
    expect(r.err).toContain("--a <tag>");
    expect(r.err).not.toContain("    at ");
  });

  it("a bad flag is exit 2 before anything is looked up", () => {
    const r = harness(["local", "compare", "--dry-run", "--load", "fast"], { HARNESS_IMAGE_PREFIX: "tutors" });
    expect(r.code).toBe(2);
    expect(r.err).toMatch(/<rate>x<duration>/);
  });

  it("--help says what it is, and the exit codes", () => {
    const r = harness(["local", "--help"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("harness local compare");
    expect(r.out).toContain("--strict");
    expect(r.out).toContain("pnpm compare --no-load --runs 1");
  });

  it("`--no-load` is understood by the real argument parser, and `pnpm compare` is the command", () => {
    const r = harness(["local", "compare", "--dry-run", "--no-load", "--a", "16.2.2"]);
    expect(r.out).not.toContain("--load");
    expect(JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")).scripts.compare).toBe("tsx src/cli.ts local compare");
  });
});
