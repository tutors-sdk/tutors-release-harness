/**
 * `harness validate deploy|forecast` (since 1.63.0, docs/validate-forecast.md). JSR is a fake fetch and the validators
 * are a fake runner here; the workflow (validate-forecast.yml) is the run against jsr.io, real course sources and the
 * mono-repo's own validate.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { FetchLike } from "../src/course/capture.ts";
import { loadValidateCorpus, ValidateCorpusError, VALIDATE_CORPUS_FILE } from "../src/validate/corpus.ts";
import { CREATE_MAIN, deployText, TEMPLATE, validateCommand, type ValidatorRun } from "../src/validate/command.ts";
import { buildForecast, causesOf, forecastCourse, forecastFails, forecastText, type Finding } from "../src/validate/forecast.ts";
import { buildCommand, checkDeployCommand, jsrSpecs, pick, resolveJsr, satisfies } from "../src/validate/jsr.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = () => mkdtempSync(join(tmpdir(), "harness-validate-"));

const TEMPLATE_TEXT = `export const netlifyToml = \`# Build & publish
[build]
  command = "deno run -A jsr:@tutors/tutors-create@^5.4.0 validate && deno run -A jsr:@tutors/tutors"
  publish = "json"
\`;
`;

/** jsr.io as a map from URL to JSON; anything else is a 404. */
const jsr =
  (pages: Record<string, unknown>): FetchLike =>
  async (url) =>
    url in pages ? new Response(JSON.stringify(pages[url]), { status: 200 }) : new Response("not found", { status: 404 });

const versions = (...vs: string[]) => Object.fromEntries(vs.map((v) => [v, { createdAt: "2026-11-01T00:00:00Z" }]));
const today = jsr({
  "https://jsr.io/@tutors/tutors-create/meta.json": { latest: "5.3.0", versions: versions("5.2.4", "5.3.0") },
  "https://jsr.io/@tutors/tutors/meta.json": { latest: "5.3.0", versions: versions("5.3.0") }
});
const published = jsr({
  "https://jsr.io/@tutors/tutors-create/meta.json": { latest: "5.4.1", versions: versions("5.3.0", "5.4.0", "5.4.1", "6.0.0-rc.1") },
  "https://jsr.io/@tutors/tutors-create/5.4.1_meta.json": { exports: { ".": "./main.ts", "./validate": "./src/validate-cli.ts" } },
  "https://jsr.io/@tutors/tutors/meta.json": { latest: "5.3.0", versions: versions("5.3.0") }
});

describe("jsr: what a specifier in the deploy command resolves to", () => {
  it("finds every jsr: specifier once, with or without a range", () => {
    expect(jsrSpecs("deno run -A jsr:@tutors/tutors-create@^5.4.0 validate && deno run -A jsr:@tutors/tutors && x jsr:@tutors/tutors").map((s) => [s.name, s.range])).toEqual([
      ["tutors-create", "^5.4.0"],
      ["tutors", ""]
    ]);
    expect(buildCommand(TEMPLATE_TEXT)).toBe("deno run -A jsr:@tutors/tutors-create@^5.4.0 validate && deno run -A jsr:@tutors/tutors");
  });

  it("reads ranges as Deno does: caret, tilde, partial and exact; pre-releases never match", () => {
    expect(satisfies("5.4.1", "^5.4.0")).toBe(true);
    expect(satisfies("5.3.0", "^5.4.0")).toBe(false);
    expect(satisfies("6.0.0", "^5.4.0")).toBe(false);
    expect(satisfies("0.4.9", "^0.4.0")).toBe(true);
    expect(satisfies("0.5.0", "^0.4.0")).toBe(false);
    expect(satisfies("5.4.9", "~5.4.0")).toBe(true);
    expect(satisfies("5.5.0", "~5.4.0")).toBe(false);
    expect(satisfies("5.9.0", "5")).toBe(true);
    expect(satisfies("5.4.3", "5.4")).toBe(true);
    expect(satisfies("5.5.0", "5.4")).toBe(false);
    expect(satisfies("5.4.0", "5.4.0")).toBe(true);
    expect(satisfies("5.4.1", "5.4.0")).toBe(false);
    expect(satisfies("6.0.0-rc.1", "")).toBe(false);
    expect(pick(["5.3.0", "5.4.0", "5.4.10", "5.4.9", "6.0.0"], "^5.4.0")).toBe("5.4.10");
    expect(pick(["5.3.0"], "^5.4.0")).toBeUndefined();
  });

  it("today: JSR has no tutors-create in ^5.4.0, so the deploy command cannot run", async () => {
    const check = await checkDeployCommand(TEMPLATE_TEXT, today);
    expect(check.ok).toBe(false);
    expect(check.specs[0]).toEqual({ spec: "jsr:@tutors/tutors-create@^5.4.0", latest: "5.3.0", problem: "JSR has no version of @tutors/tutors-create in ^5.4.0 (latest 5.3.0)" });
    expect(check.specs[1]).toMatchObject({ spec: "jsr:@tutors/tutors", version: "5.3.0" });
    expect(deployText(check)).toContain("FAIL jsr:@tutors/tutors-create@^5.4.0");
  });

  it("once published: the highest version in range, and it has validate", async () => {
    const check = await checkDeployCommand(TEMPLATE_TEXT, published);
    expect(check.ok).toBe(true);
    expect(check.specs[0]).toMatchObject({ version: "5.4.1", hasValidate: true });
    expect(deployText(check)).toContain("Every course built from the template can deploy.");
  });

  it("a version in range without the validate export cannot run `validate` either", async () => {
    const r = await resolveJsr(jsrSpecs("jsr:@tutors/tutors-create@5")[0]!, jsr({
      "https://jsr.io/@tutors/tutors-create/meta.json": { latest: "5.3.0", versions: versions("5.3.0") },
      "https://jsr.io/@tutors/tutors-create/5.3.0_meta.json": { exports: { ".": "./main.ts", "./scaffolder": "./src/scaffolder.ts" } }
    }), true);
    expect(r).toMatchObject({ version: "5.3.0", hasValidate: false, problem: "@tutors/tutors-create 5.3.0, which jsr:@tutors/tutors-create@5 resolves to, has no validate command" });
  });

  it("a package JSR does not have, and a JSR that is down", async () => {
    expect((await resolveJsr(jsrSpecs("jsr:@tutors/course-rules@^0.1.0")[0]!, today)).problem).toBe("JSR has no package @tutors/course-rules");
    await expect(resolveJsr(jsrSpecs("jsr:@tutors/tutors")[0]!, async () => new Response("", { status: 503 }))).rejects.toThrow("answered 503");
  });
});

const f = (rule: string, severity: Finding["severity"], path: string): Finding => ({ rule, severity, path, message: `${rule} ${path}` });

describe("forecast: every difference under the rule that made it", () => {
  it("a new error on one course, a warning gone on another: two causes, one course newly stopped", () => {
    const courses = [
      forecastCourse("reference-course", "a".repeat(40), { findings: [f("V009", "warn", "x.md")] }, { findings: [f("V009", "warn", "x.md"), f("V004", "error", "book-c/talk.md"), f("V004", "error", "book-d/talk.md")] }),
      forecastCourse("python", "b".repeat(40), { findings: [f("V011", "warn", "netlify.toml")] }, { findings: [] }),
      forecastCourse("agile", "c".repeat(40), { findings: [f("V002", "error", "reference-5")] }, { findings: [f("V002", "error", "reference-5")] })
    ];
    expect(causesOf(courses)).toEqual([
      { rule: "V004", added: 2, removed: 0, newErrors: 2, courses: ["reference-course"] },
      { rule: "V011", added: 0, removed: 1, newErrors: 0, courses: ["python"] }
    ]);
    const forecast = buildForecast({ spec: "jsr:@tutors/tutors-create@^5.4.0", version: "5.4.1" }, { dir: "/m", sha: "1d8e90c0" }, courses);
    expect(forecast.stopped).toEqual(["reference-course", "agile"]);
    expect(forecast.newlyStopped).toEqual(["reference-course"]);
    expect(forecastFails(forecast)).toBe(true);
    const text = forecastText(forecast);
    expect(text).toContain("main 1d8e90c against what lecturers run today, jsr:@tutors/tutors-create@^5.4.0 (5.4.1)");
    expect(text).toContain("Main's validate would stop 2 of 3 courses deploying: reference-course, agile.");
    expect(text).toContain("Newly stopped (they deploy under production's validate): reference-course.");
    expect(text).toContain("3 differences from production, from 2 rules:");
    expect(text).toContain("  V004: +2 (2 new errors) on reference-course");
    expect(text).toContain("  V011: -1 on python");
  });

  it("nothing to compare when production cannot run validate: main's findings stand alone, and --strict has nothing to hold", () => {
    const problem = "JSR has no version of @tutors/tutors-create in ^5.4.0 (latest 5.3.0)";
    const forecast = buildForecast({ spec: "jsr:@tutors/tutors-create@^5.4.0", problem }, { dir: "/m" }, [
      forecastCourse("reference-course", "a".repeat(40), { problem }, { findings: [f("V004", "error", "t.md")] })
    ]);
    expect(forecast.causes).toEqual([]);
    expect(forecast.stopped).toEqual(["reference-course"]);
    expect(forecast.newlyStopped).toEqual([]);
    expect(forecastFails(forecast)).toBe(false);
    const text = forecastText(forecast);
    expect(text).toContain("  reference-course: main 1 error, 1 finding\n");
    expect(text).toContain("Production cannot run validate, so there is nothing to compare");
  });

  it("the same findings on both sides", () => {
    const forecast = buildForecast({ spec: "s", version: "5.4.0" }, { dir: "/m" }, [forecastCourse("python", "b".repeat(40), { findings: [] }, { findings: [] })]);
    expect(forecastText(forecast)).toContain("Main's validate lets every corpus course deploy.\nMain and production report the same findings on every course.");
  });
});

describe("the validate corpus", () => {
  it("names real course sources, each pinned by a full commit and with a reason", () => {
    const corpus = loadValidateCorpus(resolve(ROOT, VALIDATE_CORPUS_FILE));
    expect(corpus.map((c) => c.name)).toEqual(["reference-course", "python", "web-dev-2-2022", "mobile-app-dev-oth", "agile-soft-dev-2013"]);
  });

  it("refuses a short commit, a repeated name and a missing reason", () => {
    const dir = tmp();
    const write = (body: string) => {
      writeFileSync(join(dir, "c.yaml"), body);
      return () => loadValidateCorpus(join(dir, "c.yaml"));
    };
    expect(write("courses:\n  - { name: a, repo: https://github.com/o/a, commit: abc, why: a good reason }\n")).toThrow(/commit: a full 40-character/);
    const c = "a".repeat(40);
    expect(write(`courses:\n  - { name: a, repo: https://github.com/o/a, commit: ${c}, why: a good reason }\n  - { name: a, repo: https://github.com/o/b, commit: ${c}, why: a good reason }\n`)).toThrow(ValidateCorpusError);
    expect(write(`courses:\n  - { name: a, repo: https://github.com/o/a, commit: ${c}, why: no }\n`)).toThrow(/say why/);
  });
});

describe("harness validate", () => {
  const checkout = () => {
    const dir = tmp();
    mkdirSync(join(dir, "packages/jsr/course-rules/src"), { recursive: true });
    writeFileSync(join(dir, TEMPLATE), TEMPLATE_TEXT);
    return dir;
  };
  const corpusFile = () => {
    const dir = tmp();
    writeFileSync(join(dir, "c.yaml"), `courses:\n  - { name: ref, repo: https://github.com/o/ref, commit: ${"a".repeat(40)}, why: the reference course }\n`);
    return join(dir, "c.yaml");
  };

  it("deploy: exit 1 and the reason when the template's command cannot run; exit 0 once it can", async () => {
    const lines: string[] = [];
    const out = join(tmp(), "deploy.json");
    expect(await validateCommand("deploy", { candidate: checkout(), out }, { fetch: today, log: (l) => lines.push(l), home: tmp() })).toBe(1);
    expect(lines.join("\n")).toContain("A course built from this template fails its Netlify deploy");
    expect(JSON.parse(readFileSync(out, "utf8")).ok).toBe(false);
    expect(await validateCommand("deploy", { candidate: checkout() }, { fetch: published, log: () => {}, home: tmp() })).toBe(0);
  });

  it("forecast: main from the checkout's source, production at the exact version JSR resolves; --strict fails a new error", async () => {
    const calls: string[][] = [];
    const run: ValidatorRun = (args) => {
      calls.push(args);
      return args.some((a) => a.endsWith(CREATE_MAIN)) ? [f("V004", "error", "book-c/talk.md")] : [];
    };
    const deps = { fetch: published, run, materialise: () => "/work/courses/ref", log: () => {}, home: tmp() };
    const out = join(tmp(), "f.json");
    const dir = checkout();
    expect(await validateCommand("forecast", { candidate: dir, corpus: corpusFile(), out }, deps)).toBe(0);
    expect(calls[0]).toEqual(["run", "-A", "--quiet", "jsr:@tutors/tutors-create@5.4.1", "validate", "/work/courses/ref", "--format", "json"]);
    expect(calls[1]).toEqual(["run", "-A", "--quiet", "--no-check", "--no-lock", join(dir, CREATE_MAIN), "validate", "/work/courses/ref", "--format", "json"]);
    const written = JSON.parse(readFileSync(out, "utf8"));
    expect(written.newlyStopped).toEqual(["ref"]);
    expect(written.causes).toEqual([{ rule: "V004", added: 1, removed: 0, newErrors: 1, courses: ["ref"] }]);
    expect(await validateCommand("forecast", { candidate: dir, corpus: corpusFile(), out, strict: true }, deps)).toBe(1);
  });

  it("forecast: exit 1 when main's validate cannot run on a course", async () => {
    const run: ValidatorRun = () => {
      throw new Error("Couldn't read the course folder");
    };
    expect(await validateCommand("forecast", { candidate: checkout(), corpus: corpusFile(), out: join(tmp(), "f.json") }, { fetch: today, run, materialise: () => "/c", log: () => {}, home: tmp() })).toBe(1);
  });

  it("usage: no checkout, not a checkout, a bad --production, an unknown subcommand", async () => {
    const deps = { fetch: today, log: () => {}, home: tmp() };
    expect(await validateCommand("deploy", {}, deps)).toBe(2);
    expect(await validateCommand("deploy", { candidate: tmp() }, deps)).toBe(2);
    expect(await validateCommand("forecast", { candidate: checkout(), corpus: corpusFile(), production: "latest" }, deps)).toBe(2);
    expect(await validateCommand("lint", {}, deps)).toBe(2);
  });
});
