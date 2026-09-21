/**
 * `rule` on claims (contract 1.3.0). A claim may name a Rule instead of pasting its wording; the harness checks that the
 * Rule exists in the release's rules.json and shows its title, and does nothing else with it.
 *
 * The three tests TESTING.md asks of a new rule: the A/A (a claims file with no `rule` reads exactly as before, with or
 * without a rules file), the planted changes it must catch (a rule that is not there, no rules file at all, a rule
 * that is not four digits), and the changes it must not flag (free-text `Rule 0031:` reasons, an unused rule, extra keys).
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Ajv } from "ajv";
import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { claimLabel, loadRules, parseRules, ruleReason, type Rules } from "../src/claims/rules.ts";
import { isBroad, parseClaims } from "../src/claims/schema.ts";
import { claimHygiene } from "../src/claims/hygiene.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { renderHtml } from "../src/report/html.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { Hunk, RunReport } from "../src/types.ts";
import { capture, clone } from "./support/captures.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = (name: string) => mkdtempSync(join(tmpdir(), `harness-${name}-`));

const RULES_JSON = JSON.stringify({ version: 1, rules: { "0031": { title: "Lab steps show their estimated reading time", digest: "sha256:aa" }, "0044": { title: "Presence is polled every 15 seconds" } } });
const rules: Rules = parseRules(RULES_JSON, "rules.json");
const hunk = (over: Partial<Hunk> = {}): Hunk => ({ id: "x", artefact: "dom", scope: "reader:lab-step", path: "/lab/x", summary: "s", severity: "fail", ...over });

describe("the rules file", () => {
  it("reads what the monorepo publishes, ignores keys it does not know, and keeps the title", () => {
    expect(rules.rules["0031"]).toEqual({ title: "Lab steps show their estimated reading time", digest: "sha256:aa" });
    const extra = parseRules(JSON.stringify({ version: 1, rules: { "0031": { title: "T", status: "active", path: "rules/0031.md" } } }));
    expect(extra.rules["0031"]).toEqual({ title: "T" });
    expect(parseRules(JSON.stringify({ version: 1, rules: {} })).rules).toEqual({});
  });

  it("refuses a file that is not one, and says which part", () => {
    expect(() => parseRules("{")).toThrow(/rules\.json is not valid JSON/);
    expect(() => parseRules(JSON.stringify({ version: 2, rules: {} }), "r.json")).toThrow(/r\.json is not a valid rules file/);
    expect(() => parseRules(JSON.stringify({ rules: {} }))).toThrow(/version/);
    expect(() => parseRules(JSON.stringify({ version: 1 }))).toThrow(/rules/);
    expect(() => parseRules(JSON.stringify({ version: 1, rules: { "31": { title: "T" } } }))).toThrow(/four digits/);
    expect(() => parseRules(JSON.stringify({ version: 1, rules: { "0031": {} } }))).toThrow(/title/);
    expect(() => parseRules(JSON.stringify({ version: 1, rules: { "0031": { title: "  " } } }))).toThrow(/needs a title/);
  });

  it("is valid against the schema in the contract, which refuses what the reader refuses", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    const validate = ajv.compile(JSON.parse(readFileSync(resolve(ROOT, "docs/contract/rules.schema.json"), "utf8")));
    const good = [JSON.parse(RULES_JSON), { version: 1, rules: {} }, { version: 1, rules: { "0031": { title: "T", status: "extra keys are fine" } } }];
    for (const value of good) {
      expect(validate(value), JSON.stringify(validate.errors)).toBe(true);
      parseRules(JSON.stringify(value));
    }
    const bad = [{ version: 2, rules: {} }, { rules: {} }, { version: 1 }, { version: 1, rules: { "31": { title: "T" } } }, { version: 1, rules: { "0031": {} } }, { version: 1, rules: { "0031": { title: "" } } }];
    for (const value of bad) {
      expect(validate(value), JSON.stringify(value)).toBe(false);
      expect(() => parseRules(JSON.stringify(value)), JSON.stringify(value)).toThrow(/not a valid rules file/);
    }
  });

  it("is read from a path, or from a URL the runner can GET, and a failure to get it says so", async () => {
    const file = join(tmp("rules"), "rules.json");
    writeFileSync(file, RULES_JSON);
    expect((await loadRules(file)).rules["0044"]!.title).toBe("Presence is polled every 15 seconds");
    await expect(loadRules(join(tmp("rules"), "nope.json"))).rejects.toThrow(/ENOENT/);

    const seen: string[] = [];
    const fake = async (url: string) => {
      seen.push(url);
      return url.endsWith("ok") ? { status: 200, text: RULES_JSON } : url.endsWith("boom") ? Promise.reject(new Error("getaddrinfo ENOTFOUND")) : url.endsWith("junk") ? { status: 200, text: "<html>" } : { status: 404, text: "Not Found" };
    };
    expect((await loadRules("https://raw.example.test/x/rules.json?ok", fake)).source).toBe("https://raw.example.test/x/rules.json?ok");
    await expect(loadRules("https://raw.example.test/missing", fake)).rejects.toThrow("cannot fetch the rules file https://raw.example.test/missing: HTTP 404");
    await expect(loadRules("https://raw.example.test/boom", fake)).rejects.toThrow(/cannot fetch the rules file .*: getaddrinfo ENOTFOUND/);
    await expect(loadRules("https://raw.example.test/junk", fake)).rejects.toThrow(/is not valid JSON/);
    expect(seen).toHaveLength(4);
  });

  it("the real fetch reads a URL, anonymously", async () => {
    let auth: string | undefined;
    const server = createServer((req, res) => {
      auth = req.headers.authorization;
      res.writeHead(req.url === "/rules.json" ? 200 : 404, { "content-type": "application/json" }).end(req.url === "/rules.json" ? RULES_JSON : "no");
    });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    try {
      const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      expect((await loadRules(`${base}/rules.json`)).rules["0031"]!.title).toContain("reading time");
      expect(auth).toBeUndefined();
      await expect(loadRules(`${base}/gone.json`)).rejects.toThrow(/HTTP 404/);
    } finally {
      await new Promise<void>((done) => server.close(() => done()));
    }
  });
});

describe("claims that name a rule", () => {
  /** `null` is "no rules file was given"; the default is the one above. */
  const claims = (body: string, r: Rules | null = rules) => parseClaims(`claims:\n${body}`, "claims.yaml", r ?? undefined);

  it("A/A: a claims file with no `rule` is read exactly as before, with or without a rules file", () => {
    const body = `  - artefact: dom\n    scope: "reader:lab*"\n    reason: "Rule 0031: lab steps shall show estimated reading time"\n  - artefact: "*"\n    scope: "**"\n    reason: "Rule 0003: everything"\n    approvedBy: "a-maintainer"\n`;
    const expected = [
      { artefact: "dom", scope: "reader:lab*", reason: "Rule 0031: lab steps shall show estimated reading time" },
      { artefact: "*", scope: "**", reason: "Rule 0003: everything", approvedBy: "a-maintainer" }
    ];
    expect(claims(body, null)).toEqual(expected);
    expect(claims(body, rules)).toEqual(expected);
  });

  it("with a rule the reason is optional: the claim carries the rule and its title, and reads `Rule NNNN: title`", () => {
    const [c] = claims(`  - artefact: dom\n    scope: "reader:lab*"\n    rule: "0031"\n`);
    expect(c).toEqual({ artefact: "dom", scope: "reader:lab*", reason: "Rule 0031: Lab steps show their estimated reading time", rule: "0031", ruleTitle: "Lab steps show their estimated reading time" });
    expect(claimLabel(c!)).toBe("Rule 0031: Lab steps show their estimated reading time");
  });

  it("free text beside a rule is kept, after the title; it needs no minimum length and no Rule number", () => {
    const [c] = claims(`  - artefact: network\n    scope: "GET /api/presence"\n    rule: "0044"\n    reason: "was 10s"\n`);
    expect(c).toMatchObject({ rule: "0044", ruleTitle: "Presence is polled every 15 seconds", reason: "was 10s" });
    expect(claimLabel(c!)).toBe("Rule 0044: Presence is polled every 15 seconds — was 10s");
    expect(claimLabel({ reason: "Rule 0031: x" })).toBe("Rule 0031: x");
    expect(ruleReason("0031", "T")).toBe("Rule 0031: T");
  });

  it("planted: a rule that is not in the file is invalid, and names the claim, the rule and the file", () => {
    expect(() => claims(`  - artefact: dom\n    scope: "reader:*"\n    reason: "Rule 0031: fine"\n  - artefact: dom\n    scope: "reader:x"\n    rule: "0999"\n`)).toThrow(/claims\.yaml is not a valid claims file:\n {2}claims\.1\.rule: rule "0999" is not in the rules file rules\.json/);
    // a rule in the file does not excuse a reason that is missing on a claim with no rule
    expect(() => claims(`  - artefact: dom\n    scope: "reader:x"\n`)).toThrow(/claims\.0\.reason: a claim needs a reason/);
  });

  it("planted: a rule with no rules file at all is invalid, and says how to fix it", () => {
    expect(() => claims(`  - artefact: dom\n    scope: "reader:x"\n    rule: "0031"\n`, null)).toThrow(/rule "0031" was named, but no rules file was given: pass --rules <path\|url> \(in the release dispatch, rules_url\), or give a reason instead/);
  });

  it("planted: every claim that names a missing rule is reported, not only the first", () => {
    try {
      claims(`  - artefact: dom\n    scope: "a"\n    rule: "0998"\n  - artefact: dom\n    scope: "b"\n    rule: "0999"\n`);
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as Error).message).toContain('claims.0.rule: rule "0998"');
      expect((e as Error).message).toContain('claims.1.rule: rule "0999"');
    }
  });

  it("planted: a rule must be four digits and quoted; unquoted YAML would read 0031 as the number 31, and the message says so", () => {
    expect(() => claims(`  - artefact: dom\n    scope: "x"\n    rule: 0031\n`)).toThrow(/rule is the Rule's four digits, quoted: rule: "0031"/);
    expect(() => claims(`  - artefact: dom\n    scope: "x"\n    rule: "31"\n`)).toThrow(/rule is four digits/);
    expect(() => claims(`  - artefact: dom\n    scope: "x"\n    rule: "00031"\n`)).toThrow(/rule is four digits/);
    expect(() => claims(`  - artefact: dom\n    scope: "x"\n    rule: "Rule 0031"\n`)).toThrow(/rule is four digits/);
  });

  it("planted: without a rule, a reason is still required, still 8 characters, and still not a rubber stamp", () => {
    expect(() => claims(`  - artefact: dom\n    scope: "x"\n    reason: "see PR"\n`)).toThrow(/rubber stamp/);
    expect(() => claims(`  - artefact: dom\n    scope: "x"\n    reason: "short"\n`)).toThrow(/at least 8 characters/);
    expect(() => claims(`  - artefact: dom\n    scope: "x"\n    reason: "   "\n`)).toThrow(/needs a reason/);
  });

  it("must not flag: a rule the file has but no claim uses, and free-text claims when a rules file is given", () => {
    const [c] = claims(`  - artefact: dom\n    scope: "x"\n    reason: "fix(reader): #270 something intended"\n`);
    expect(c!.rule).toBeUndefined();
    expect(claims("  []\n".replace("  []", "  - artefact: dom\n    scope: x\n    rule: \"0044\"")).map((x) => x.rule)).toEqual(["0044"]);
  });

  it("must not flag: an empty claims file, or one with no claims, needs no rules file", () => {
    expect(parseClaims("", "c", undefined)).toEqual([]);
    expect(parseClaims("claims: []\n", "c", rules)).toEqual([]);
  });

  it("matching, staleness and the broad-claim rule are exactly as before for a claim that names a rule", () => {
    const parsed = claims(`  - artefact: dom\n    scope: "reader:lab*"\n    rule: "0031"\n  - artefact: network\n    scope: "GET /gone"\n    rule: "0044"\n  - artefact: "*"\n    scope: "**"\n    rule: "0031"\n`);
    const result = matchClaims([hunk()], parsed);
    expect(result.unclaimed).toEqual([]);
    expect(result.matches[0]!.claim!.rule).toBe("0031");
    // the network claim matched nothing: stale, as any claim would be; the broad one is unapproved, as any would be
    expect(result.staleClaims.map((c) => c.scope)).toEqual(["GET /gone", "**"]);
    expect(result.broadUnapproved).toHaveLength(1);
    expect(isBroad(parsed[2]!)).toBe(true);
    // a rule does not make a claim gate on anything: an unclaimed hunk is unclaimed whatever rules exist
    expect(matchClaims([hunk({ artefact: "headers", scope: "reader:x/y" })], parsed.slice(0, 2)).unclaimed).toHaveLength(1);
    expect(claimHygiene(result).claims).toBe(3);
  });
});

describe("the report shows the rule's title", () => {
  function release(claimsText: string, r: Rules | null = rules) {
    const dir = tmp("rules-report");
    const noise = tmp("noise");
    writeFileSync(join(noise, "noise-status.json"), JSON.stringify({ schemaVersion: 1, ranAt: new Date().toISOString(), clean: true, hunks: 0 }));
    const b = clone(capture("b"));
    delete b.journeys[0]!.pages[0]!.headers["x-frame-options"];
    const outcome = compareFromCaptures({ mode: "release", substrate: "compose", captureDir: dir, a: capture("a"), b, claims: parseClaims(claimsText, "claims.yaml", r ?? undefined), masksFile: DEFAULT_MASKS_FILE, noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, log: () => {}, noise });
    return { report: outcome.report, written: JSON.parse(readFileSync(outcome.files.json, "utf8")) as RunReport, md: readFileSync(outcome.files.md, "utf8"), html: readFileSync(outcome.files.html, "utf8") };
  }

  it("a claimed hunk reads `Rule 0031: <title>` in report.json, the Markdown comment and the HTML", () => {
    const { report, written, md, html } = release(`claims:\n  - artefact: headers\n    scope: "reader:course"\n    rule: "0031"\n  - artefact: network\n    scope: "GET /stale"\n    rule: "0044"\n`);
    expect(report.verdict).toBe("pass");
    expect(written.compare.matches.find((m) => m.claim)!.claim).toEqual({ artefact: "headers", scope: "reader:course", reason: "Rule 0031: Lab steps show their estimated reading time", rule: "0031", ruleTitle: "Lab steps show their estimated reading time" });
    expect(md).toContain("Rule 0031: Lab steps show their estimated reading time |");
    expect(html).toContain("Rule 0031: Lab steps show their estimated reading time");
    // the stale one names its rule too, in the collapsed list
    expect(md).toContain("`GET /stale` — Rule 0044: Presence is polled every 15 seconds");
    expect(renderMarkdown(report)).toBe(md);
    expect(renderHtml(report)).toBe(html);
  });

  it("the report is valid against the schema in the contract", () => {
    const { written } = release(`claims:\n  - artefact: headers\n    scope: "reader:course"\n    rule: "0031"\n    reason: "and why"\n`);
    const ajv = new Ajv({ allErrors: true, strict: true });
    ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const validate = ajv.compile(JSON.parse(readFileSync(resolve(ROOT, "docs/contract/report.schema.json"), "utf8")));
    expect(validate(written), JSON.stringify(validate.errors)).toBe(true);
    const claim = written.compare.matches.find((m) => m.claim)!.claim!;
    expect(claimLabel(claim)).toBe("Rule 0031: Lab steps show their estimated reading time — and why");
    expect(validate({ ...written, compare: { ...written.compare, staleClaims: [{ ...claim, rule: "31" }] } })).toBe(false);
  });

  it("must not flag: a release with no rule claims writes no rule or ruleTitle at all", () => {
    const { written } = release(`claims:\n  - artefact: headers\n    scope: "reader:course"\n    reason: "Rule 0031: spelled out, as before"\n`, null);
    const claim = written.compare.matches.find((m) => m.claim)!.claim!;
    expect(claim).toEqual({ artefact: "headers", scope: "reader:course", reason: "Rule 0031: spelled out, as before" });
  });
});

describe("through the process: an invalid rule stops the run before any stack starts, with no Docker", () => {
  const cli = (...args: string[]) => spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8" });
  const dir = tmp("rules-cli");
  const claimsFile = join(dir, "claims.yaml");
  writeFileSync(claimsFile, 'claims:\n  - artefact: dom\n    scope: "reader:*"\n    rule: "0031"\n');
  const rulesFile = join(dir, "rules.json");
  writeFileSync(rulesFile, JSON.stringify({ version: 1, rules: { "0044": { title: "Only this one" } } }));

  it("a rule with no --rules, a rule that is not in it, and a rules file that is not there are all exit 2 with the reason", () => {
    const base = ["run", "--mode", "release", "--a", "16.2.0", "--b", "16.3.0", "--claims", claimsFile, "--noise", "none", "--out", join(dir, "out")];
    const noRules = cli(...base);
    expect(noRules.status).toBe(2);
    expect(noRules.stderr).toMatch(/rule "0031" was named, but no rules file was given/);
    const missing = cli(...base, "--rules", rulesFile);
    expect(missing.status).toBe(2);
    expect(missing.stderr).toMatch(/rule "0031" is not in the rules file .*rules\.json/);
    const nowhere = cli(...base, "--rules", join(dir, "nope.json"));
    expect(nowhere.status).toBe(2);
    expect(nowhere.stderr).toMatch(/ENOENT/);
    // nothing was started: no output directory was made
    expect(() => readFileSync(join(dir, "out"))).toThrow();
  });
});
