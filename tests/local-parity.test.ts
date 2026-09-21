/**
 * CI and local cannot diverge: the harness commands a workflow runs are the ones
 * `harness local ...` plans, and nothing a workflow does with the harness lives
 * only in workflow YAML.
 *
 * Each workflow's `pnpm harness ...` lines are read out of the YAML, the shell
 * expansions in them are resolved the way the workflow's environment would, and
 * the result is compared with the plan of the matching `harness local` task. What
 * only GitHub can do (fetch an artifact, push a branch, cache, open an issue) is
 * transport around those commands; the list of what remains is in docs/local.md.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { planGate, planMutants, planNightly, planSmoke, planWatch, WORKFLOW_DEFAULTS, type Plan } from "../src/local/tasks.ts";

const ROOT = resolve(import.meta.dirname, "..");
const workflow = (name: string) => readFileSync(resolve(ROOT, ".github/workflows", name), "utf8");

/**
 * Every `pnpm harness <args>` in a workflow, as tokens: continuation lines joined, `${VAR:-default}` and `${VAR:+text}`
 * expanded as if VAR were set, `$VAR` replaced from `env`, quotes dropped.
 */
export function harnessCalls(yaml: string, env: Record<string, string>): string[][] {
  const flat = yaml.replace(/\\\r?\n\s*/g, " ");
  const calls: string[][] = [];
  for (const m of flat.matchAll(/pnpm harness ([^\n]*)/g)) {
    const expand = (s: string): string =>
      s
        .replace(/\$\{(\w+):-([^}]*)\}/g, (_, name: string, fallback: string) => env[name] ?? expand(fallback))
        .replace(/\$\{(\w+):\+([^}]*)\}/g, (_, _name: string, text: string) => expand(text))
        .replace(/\$\{?([A-Za-z_]\w*)\}?/g, (whole, name: string) => env[name] ?? whole);
    calls.push(expand(m[1]!).split(/\s+/).filter(Boolean).map((t) => t.replace(/^"(.*)"$/, "$1")));
  }
  return calls;
}

/** Flags that carry a value the local plan decides differently (a path, a person) or that CI supplies from the fetched noise status. */
const D1 = `sha256:${"1".repeat(64)}`;
const D2 = `sha256:${"2".repeat(64)}`;
const VALUE_FLAGS = new Set(["claims", "override-reason", "override-by", "image-cache", "noise", "recorded", "status", "store", "production", "release-record", "rules"]);

/** The command and its flags as a comparable list: positionals in order, then the flags sorted, their site-specific values masked. */
export function canon(tokens: string[], drop: string[] = []): string[] {
  const positionals: string[] = [];
  const flags: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i]!;
    if (!t.startsWith("--")) {
      positionals.push(t);
      continue;
    }
    const name = t.slice(2);
    const next = tokens[i + 1];
    const takesValue = next !== undefined && !next.startsWith("--");
    if (drop.includes(name)) {
      if (takesValue) i += 1;
      continue;
    }
    if (takesValue) {
      flags.push(VALUE_FLAGS.has(name) ? `--${name} _` : `--${name} ${next}`);
      i += 1;
    } else flags.push(t);
  }
  return [...positionals, ...flags.sort()];
}

const planned = (plan: Plan, id: string) => canon(plan.steps.find((s) => s.id === id)!.argv, ["noise"]);
const called = (calls: string[][], ...prefix: string[]) => {
  const found = calls.filter((c) => prefix.every((p, i) => c[i] === p));
  expect(found, `no \`pnpm harness ${prefix.join(" ")}\` in the workflow`).toHaveLength(1);
  return found[0]!;
};

describe("the helpers read what a workflow means", () => {
  it("expands defaults, alternatives, quotes and continuation lines", () => {
    const yaml = 'run: |\n  pnpm harness run --mode migration --a "${MA:-v$PRODUCTION}" --b "$B" \\\n    ${CLAIMS_URL:+--claims claims.yaml} ${OVERRIDE:+--override-reason "$OVERRIDE" --override-by "$WHO"}\n';
    expect(harnessCalls(yaml, { PRODUCTION: "16.2.0", B: "x", CLAIMS_URL: "u", OVERRIDE: "why", WHO: "me" })).toEqual([["run", "--mode", "migration", "--a", "v16.2.0", "--b", "x", "--claims", "claims.yaml", "--override-reason", "why", "--override-by", "me"]]);
    expect(canon(["run", "--b", "x", "--claims", "claims.yaml", "--noise", "f", "--a", "y"], ["noise"])).toEqual(["run", "--a y", "--b x", "--claims _"]);
  });
});

describe("nightly-noise.yml is `harness local nightly`", () => {
  const plan = planNightly({ tag: "main", imageCache: ".harness/image-cache", record: true });
  const calls = harnessCalls(workflow("nightly-noise.yml"), { TAG: "main" });

  it("pulls and verifies with the same cache, and runs the same A/A", () => {
    expect(canon(called(calls, "images", "ensure"))).toEqual(canon(plan.steps[0]!.argv).map((t) => t.replace("--image-cache _", "--image-cache _")));
    expect(called(calls, "run", "--mode", "noise")).toEqual(plan.steps[1]!.argv);
  });

  it("records the night with the same command the local nightly ends with", () => {
    const record = called(calls, "noise", "record");
    expect(record.slice(0, 2)).toEqual(["noise", "record"]);
    const flags = record.filter((t) => t.startsWith("--"));
    // the local plan gives --status and --tag; CI adds where the report is, the run URL and the step summary
    for (const f of canon(plan.steps[2]!.argv).filter((t) => t.startsWith("--")).map((t) => t.split(" ")[0]!)) expect(flags).toContain(f);
    expect(flags).toEqual(expect.arrayContaining(["--store", "--report", "--run-url", "--summary"]));
  });

  it("the image cache lives where the local default puts it", () => {
    expect(workflow("nightly-noise.yml")).toContain("path: .harness/image-cache");
  });
});

describe("release.yml is `harness local gate`", () => {
  const env = { PRODUCTION: "16.2.0", CANDIDATE: "16.3.0-rc.1", RUNS: String(WORKFLOW_DEFAULTS.runs), MIGRATIONS_A: "", MIGRATIONS_B: "", CLAIMS_URL: "u", RULES_URL: "https://example.test/rules.json", NOISE_FILE: "f", OVERRIDE_REASON: "why", OVERRIDE_BY: "me", PRODUCTION_DIGESTS: `reader=${D1}`, CANDIDATE_DIGESTS: `reader=${D2}` };
  const withOverride = planGate({ production: "16.2.0", candidate: "16.3.0-rc.1", claims: "/c.yaml", override: { reason: "why", by: "me" }, productionDigests: `reader=${D1}`, candidateDigests: `reader=${D2}`, rules: "https://example.test/rules.json" });
  const calls = harnessCalls(workflow("release.yml"), { ...env, MIGRATIONS_A: undefined as never, MIGRATIONS_B: undefined as never });

  it("release mode: the same A/B, claims, k6 and override flags", () => {
    expect(canon(called(calls, "run", "--mode", "release"), ["noise"])).toEqual(planned(withOverride, "release"));
  });

  it("migration rehearsal: the same refs, defaulting to v<tag>", () => {
    expect(canon(called(calls, "run", "--mode", "migration"))).toEqual(planned(withOverride, "migration"));
  });

  it("upgrade rehearsal: the same journey", () => {
    expect(canon(called(calls, "run", "--mode", "upgrade"))).toEqual(planned(withOverride, "upgrade"));
  });

  it("ensures the same two images (release and upgrade jobs both)", () => {
    const ensures = calls.filter((c) => c[0] === "images" && c[1] === "ensure");
    expect(ensures).toHaveLength(2);
    for (const e of ensures) expect(e).toEqual(withOverride.steps.find((s) => s.id === "ensure")!.argv);
  });

  it("reads the noise status with the command the local gate starts with", () => {
    expect(called(calls, "noise", "status")).toEqual(["noise", "status", "--store", "noise"]);
    expect(withOverride.steps[0]!.argv).toEqual(["noise", "status"]);
  });
});

describe("weekly-mutants.yml is `harness local mutants`", () => {
  const plan = planMutants({ tag: "main" });
  const calls = harnessCalls(workflow("weekly-mutants.yml"), { TAG: "main", BASE_SHA: "abc" });
  it("ensures the base and runs every mutant", () => {
    expect(called(calls, "images", "ensure")).toEqual(plan.steps[0]!.argv);
    expect(called(calls, "mutants")).toEqual(plan.steps[1]!.argv);
  });
});

describe("post-deploy.yml is `harness local watch`", () => {
  const plan = planWatch({ recorded: "recorded/x-release", production: WORKFLOW_DEFAULTS.productionUrls, deployed: { tag: "16.3.0", digests: `reader=${D1}`, record: "releases" } });
  const calls = harnessCalls(workflow("post-deploy.yml"), { recorded: "recorded/x-release", PRODUCTION_URLS: WORKFLOW_DEFAULTS.productionUrls, NOISE_FILE: "f", DEPLOYED: "16.3.0", DEPLOYED_DIGESTS: `reader=${D1}` });
  it("compares production with the recorded release run, the same way", () => {
    expect(canon(called(calls, "run", "--mode", "post-deploy"), ["noise"])).toEqual(planned(plan, "post-deploy"));
  });
  it("runs every fifteen minutes, as the local watch's default does", () => {
    expect(workflow("post-deploy.yml")).toContain(`cron: "*/${WORKFLOW_DEFAULTS.watchIntervalMinutes} * * * *"`);
  });
  it("reads the noise status the same way", () => {
    expect(called(calls, "noise", "status")).toEqual(["noise", "status", "--store", "noise"]);
  });
});

describe("the guards", () => {
  it("ci.yml and weekly-mutants.yml call `harness guard`, not the scripts", () => {
    expect(called(harnessCalls(workflow("ci.yml"), { BASE_SHA: "abc" }), "guard", "masks")).toEqual(["guard", "masks", "--base", "abc"]);
    expect(called(harnessCalls(workflow("weekly-mutants.yml"), { BASE_SHA: "abc", TAG: "main" }), "guard", "engine")).toEqual(["guard", "engine", "--base", "abc"]);
  });
});

describe("nothing lives only in a workflow", () => {
  const files = readdirSync(resolve(ROOT, ".github/workflows"));

  it("no workflow runs a script from src/ci directly: the logic is behind a harness command", () => {
    const code = (f: string) => workflow(f).split("\n").filter((l) => !l.trim().startsWith("#")).join("\n");
    for (const f of files) expect(code(f), f).not.toMatch(/src\/ci\/[a-z-]+\.ts/);
  });

  it("every harness command a workflow runs is one the CLI has, and the local wrappers use the same set of modes", () => {
    const usage = readFileSync(resolve(ROOT, "src/cli.ts"), "utf8");
    for (const f of files) for (const c of harnessCalls(workflow(f), {})) expect(usage, `${f}: harness ${c[0]}`).toContain(`harness ${c[0]}`);
  });
});

describe("ci.yml's two-stacks job is `harness local smoke`", () => {
  const yaml = workflow("ci.yml");
  const calls = harnessCalls(yaml, { TAG: "main" });

  it("makes one call, the same command a maintainer runs (`pnpm smoke`), with the workflow's tag", () => {
    expect(called(calls, "local", "smoke")).toEqual(["local", "smoke", "--tag", "main"]);
    expect(planSmoke({ tag: "main" }).task).toBe("smoke");
    expect(JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")).scripts.smoke).toBe("tsx src/cli.ts local smoke");
  });

  it("no longer runs the steps by hand: they are the plan's, so CI and local cannot mean different things by 'the smoke'", () => {
    expect(calls.filter((c) => c[0] === "run" || (c[0] === "images" && c[1] === "ensure"))).toEqual([]);
    expect(yaml).not.toContain("the contracting fixture was accepted");
  });

  it("the plan is what the job ran before it was a command", () => {
    const plan = planSmoke({ tag: "main" });
    expect(plan.steps.map((s) => s.argv.join(" "))).toEqual([
      "images ensure --a main --b main",
      "run --mode noise --a main --b main --set fixture --journey anonymous-student-reads-course",
      "run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-good",
      "run --mode migration --a dir:tests/fixtures/migrations/a --b dir:tests/fixtures/migrations/b-bad"
    ]);
    expect(plan.steps.map((s) => s.expectFailure === true)).toEqual([false, false, false, true]);
  });
});
