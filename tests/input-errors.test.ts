/**
 * A claims file or a rules file that cannot be used is a message about the file (which file, which claim, which field,
 * what is wrong, what would be right) and exit 2, never a stack trace and never `claims.0.artefact: Invalid input`.
 * One test per failure class writing the user guide's examples exercised; then the same through the real process.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { InputFileError, didYouMean, nearest } from "../src/claims/input-error.ts";
import { loadRules, parseRules } from "../src/claims/rules.ts";
import { loadClaims, parseClaims } from "../src/claims/schema.ts";
import { matchClaims } from "../src/claims/matcher.ts";
import { ARTEFACTS, type Hunk } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const tmp = () => mkdtempSync(join(tmpdir(), "harness-input-"));

/** The message parseClaims throws for this text, which must be an InputFileError. */
function message(text: string, rules?: Parameters<typeof parseClaims>[2]): string {
  try {
    parseClaims(text, "release/claims.yaml", rules);
  } catch (e) {
    expect(e).toBeInstanceOf(InputFileError);
    return (e as Error).message;
  }
  throw new Error("parseClaims accepted the file");
}

const claim = (lines: string) => `claims:\n${lines}`;

describe("claims file: each way of being wrong says which claim, which field and what would be right", () => {
  it("an unknown artefact lists the valid ones and suggests the nearest", () => {
    const m = message(claim(`  - artefact: domm\n    scope: "reader:*"\n    reason: "Rule 0031: spelled out"\n`));
    expect(m).toContain("release/claims.yaml is not a valid claims file: 1 problem");
    expect(m).toContain('claim 1 of 1 (claims.0), artefact: "domm" is not an artefact');
    for (const a of ARTEFACTS) expect(m).toContain(a);
    expect(m).toContain('"*" for every artefact');
    expect(m).toContain('did you mean "dom"?');
    expect(m).not.toContain("Invalid input");
  });

  it("an artefact with nothing near it gets the list and no guess; a missing one, or a misspelt key, says so", () => {
    const far = message(claim(`  - artefact: banana\n    scope: "x"\n    reason: "long enough"\n`));
    expect(far).toContain('"banana" is not an artefact');
    expect(far).not.toContain("did you mean");
    const missing = message(claim(`  - scope: "x"\n    reason: "long enough"\n`));
    expect(missing).toContain("claim 1 of 1 (claims.0), artefact: artefact is missing");
    const typo = message(claim(`  - artifact: dom\n    scope: "x"\n    reason: "long enough"\n`));
    expect(typo).toContain('the claim has "artifact": the key is spelled "artefact"');
  });

  it("an unquoted rule says YAML read it as a number, and what to write", () => {
    const m = message(claim(`  - artefact: dom\n    scope: "x"\n    rule: 0031\n`));
    expect(m).toContain("claim 1 of 1 (claims.0), rule: rule is the Rule's four digits, quoted");
    expect(m).toContain('the file has the number 31; write rule: "0031"');
  });

  it("neither a reason nor a rule", () => {
    const m = message(claim(`  - artefact: dom\n    scope: "x"\n`));
    expect(m).toContain('claim 1 of 1 (claims.0), reason: a claim needs a reason (a Rule or a changelog entry), or a rule: "0031"');
  });

  it("a bad scope: missing, empty, or not text", () => {
    expect(message(claim(`  - artefact: dom\n    reason: "long enough"\n`))).toContain("claims.0), scope: scope is the glob of what the claim covers");
    expect(message(claim(`  - artefact: dom\n    scope: ""\n    reason: "long enough"\n`))).toContain("claims.0), scope: scope is empty");
    const number = message(claim(`  - artefact: dom\n    scope: 5\n    reason: "long enough"\n`));
    expect(number).toContain("claims.0), scope:");
    expect(number).toContain("the file has the number 5");
  });

  it("a rubber-stamp reason, and one that is too short", () => {
    expect(message(claim(`  - artefact: dom\n    scope: "x"\n    reason: "approved by the team"\n`))).toContain("reason: a reason names a Rule or a changelog entry, not a rubber stamp");
    expect(message(claim(`  - artefact: dom\n    scope: "x"\n    reason: "ok"\n`))).toContain("reason: a reason is at least 8 characters");
  });

  it("names the claim that is wrong, and reports every wrong claim at once", () => {
    const m = message(claim(`  - artefact: nope
    scope: "y"
    reason: "Rule 0031: fine"
  - artefact: dom
    scope: "x"
    reason: "abc"
`));
    expect(m).toContain("2 problems");
    expect(m).toContain("claim 1 of 2 (claims.0), artefact:");
    expect(m).toContain("claim 2 of 2 (claims.1), reason: a reason is at least 8 characters");
  });

  it("a rule the rules file does not have lists the ones it has and suggests the near one", () => {
    const rules = parseRules(JSON.stringify({ version: 1, rules: { "0031": { title: "T" }, "0044": { title: "U" } } }), "rules.json");
    const m = message(claim(`  - artefact: dom\n    scope: "x"\n    rule: "0030"\n`), rules);
    expect(m).toContain('claim 1 of 1 (claims.0), rule: rule "0030" is not in the rules file rules.json');
    expect(m).toContain("the rules file has: 0031, 0044");
    expect(m).toContain('did you mean "0031"?');
  });

  it("the file itself: no claims list, claims that is not a list, another version, YAML that does not parse", () => {
    expect(message(`claim:\n  - artefact: dom\n`)).toContain('the file, claims: there is no top-level "claims:" list');
    expect(message(`claim:\n  - artefact: dom\n`)).toContain('did you mean "claims"?');
    expect(message(`claims: dom\n`)).toContain("claims must be a list of claims");
    expect(message(`version: 2\nclaims: []\n`)).toContain("this harness reads claims format 1; the file says the number 2");
    expect(message(`claims:\n  - dom\n`)).toContain("a claim is a mapping of artefact, scope and reason (or rule)");
    try {
      parseClaims("claims:\n  - artefact: [dom\n", "c.yaml");
      throw new Error("accepted");
    } catch (e) {
      expect(e).toBeInstanceOf(InputFileError);
      expect((e as Error).message).toMatch(/^c\.yaml is not a valid claims file: it is not valid YAML \(line \d+, column \d+\)/);
    }
  });

  it("a file that is not there says so, in words", () => {
    expect(() => loadClaims(join(tmp(), "nope.yaml"))).toThrow(/^cannot read the claims file .*nope\.yaml: no such file$/);
    expect(() => loadClaims(tmp())).toThrow(/it is a directory, not a file/);
  });
});

describe("a broad claim without approvedBy is not a malformed file: it parses, and the gate says why it fails", () => {
  it("parses, is counted as broad and unapproved, and is not an InputFileError", () => {
    const claims = parseClaims(claim(`  - artefact: "*"\n    scope: "*"\n    reason: "a long enough reason"\n`));
    expect(claims).toHaveLength(1);
    const hunk: Hunk = { id: "h", artefact: "dom", scope: "reader:x", path: "/", summary: "s", severity: "fail" };
    const result = matchClaims([hunk], claims);
    expect(result.broadUnapproved).toHaveLength(1);
  });
});

describe("rules file: missing, unreadable, wrong version, not JSON, not the shape", () => {
  it("missing or a directory", async () => {
    await expect(loadRules(join(tmp(), "nope.json"))).rejects.toThrow(/^cannot read the rules file .*nope\.json: no such file$/);
    await expect(loadRules(tmp())).rejects.toThrow(/it is a directory, not a file/);
  });

  it("the wrong version names both versions", () => {
    expect(() => parseRules(JSON.stringify({ version: 2, rules: {} }), "r.json")).toThrow(
      /^r\.json is not a valid rules file: 1 problem\n\n {2}the file, version: this harness reads rules format 1; the file says 2/
    );
    expect(() => parseRules(JSON.stringify({ rules: {} }), "r.json")).toThrow(/the file says nothing/);
  });

  it("not JSON, not an object, no rules, a rule with no title or a bad id", () => {
    expect(() => parseRules("{", "r.json")).toThrow(/^r\.json is not valid JSON \(a rules file\): /);
    expect(() => parseRules("[]", "r.json")).toThrow(/a rules file is a JSON object with "version" and "rules", and this is a list/);
    expect(() => parseRules(JSON.stringify({ version: 1 }), "r.json")).toThrow(/rules: there is no "rules" object/);
    expect(() => parseRules(JSON.stringify({ version: 1, rules: { "0031": {} } }), "r.json")).toThrow(/rule "0031", title:/);
    expect(() => parseRules(JSON.stringify({ version: 1, rules: { "31": { title: "T" } } }), "r.json")).toThrow(/rule "31": "31" is not a rule id: a rule is named by four digits/);
  });
});

describe("hints", () => {
  it("nearest finds a case difference, a typo, or a containing name, and nothing far away", () => {
    expect(nearest("DOM", ARTEFACTS)).toEqual(["dom"]);
    expect(nearest("heders", ARTEFACTS)).toContain("headers");
    expect(nearest("banana", ARTEFACTS)).toEqual([]);
    expect(didYouMean("banana", ARTEFACTS)).toEqual([]);
  });
});

describe("through the process: exit 2, a clean message, no stack, before anything starts", () => {
  const cli = (...args: string[]) => spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8" });
  const dir = tmp();
  const bad = join(dir, "claims.yaml");
  writeFileSync(bad, 'claims:\n  - artefact: domm\n    scope: "reader:*"\n    reason: "Rule 0031: spelled out"\n');
  const base = ["run", "--mode", "release", "--a", "16.2.0", "--b", "16.3.0", "--noise", "none", "--out", join(dir, "out")];

  it("a claims file with an unknown artefact", () => {
    const r = cli(...base, "--claims", bad);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('claim 1 of 1 (claims.0), artefact: "domm" is not an artefact');
    expect(r.stderr).toContain('did you mean "dom"?');
    expect(r.stderr).not.toContain("    at ");
    expect(r.stderr).not.toContain("InputFileError");
  });

  it("a claims file that is not there, and a rules file of the wrong version", () => {
    const missing = cli(...base, "--claims", join(dir, "nope.yaml"));
    expect(missing.status).toBe(2);
    expect(missing.stderr).toMatch(/cannot read the claims file .*nope\.yaml: no such file/);
    expect(missing.stderr).not.toContain("    at ");
    const rules = join(dir, "rules.json");
    writeFileSync(rules, JSON.stringify({ version: 2, rules: {} }));
    const wrong = cli(...base, "--claims", bad, "--rules", rules);
    expect(wrong.status).toBe(2);
    expect(wrong.stderr).toContain("this harness reads rules format 1; the file says 2");
    expect(wrong.stderr).not.toContain("    at ");
  });

  it("compare reads the same files the same way", () => {
    const r = cli("compare", "--dir", dir, "--mode", "release", "--claims", bad);
    // compare loads the captures first; whatever it says about the directory, it says it without a stack of the schema
    expect(r.status).toBe(2);
    expect(r.stderr).not.toContain("ZodError");
  });
});
