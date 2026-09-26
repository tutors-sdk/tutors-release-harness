import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MANUAL_LIMIT, manualSlice, normalnessOf, readRulePrs, renderScorecard, ruleRows, scorecard } from "../src/ci/scorecard.ts";
import { scorecardCommand, UsageError } from "../src/local/cli.ts";
import type { Artefact, Claim, Hunk, RunReport } from "../src/types.ts";

let n = 0;
const hunk = (artefact: Artefact, scope: string, extra: Partial<Hunk> = {}): Hunk => ({ id: `h${++n}`, artefact, scope, summary: `${artefact} ${scope}`, severity: "fail", ...extra });
const claim = (artefact: Artefact | "*", scope: string, reason: string, extra: Partial<Claim> = {}): Claim => ({ artefact, scope, reason, ...extra });

function report(p: { mode?: RunReport["mode"]; matched?: [Hunk, Claim][]; unclaimed?: Hunk[]; stale?: Claim[]; broad?: Claim[]; noise?: RunReport["noise"]; override?: boolean } = {}): RunReport {
  const matched = p.matched ?? [];
  const unclaimed = p.unclaimed ?? [];
  return {
    schemaVersion: 1,
    harness: { version: "1.4.1", gitSha: null, contractVersion: "1.4.0" },
    harnessVersion: "1.4.1",
    mode: p.mode ?? "release",
    ranAt: "2026-09-26T10:00:00.000Z",
    verdict: unclaimed.length ? "fail" : "pass",
    reasons: [],
    sides: { a: { reader: "16.2.2" }, b: { reader: "16.3.0-rc.1" } },
    compare: { hunks: [...matched.map(([h]) => h), ...unclaimed], matches: [...matched.map(([hunk, c]) => ({ hunk, claim: c })), ...unclaimed.map((hunk) => ({ hunk }))], unclaimed, staleClaims: p.stale ?? [], broadUnapproved: p.broad ?? [] },
    ...(p.noise ? { noise: p.noise } : {}),
    ...(p.override ? { override: { reason: "hotfix for the exam week, accepted", by: "leigh", at: "2026-09-26T10:00:00Z", applied: true } } : {})
  } as unknown as RunReport;
}

const quiet = { ranAt: "2026-09-26T07:57:09.931Z", clean: true, hunks: 0 };

describe("the score", () => {
  it("a release with every diff claimed and a quiet nightly scores 100 (A)", () => {
    const s = scorecard(report({ matched: [[hunk("dom", "reader:lab"), claim("dom", "reader:lab", "Rule 0031: lab steps show reading time", { rule: "0031" })]], noise: quiet }));
    expect(s).toMatchObject({ score: 100, grade: "A", deductions: [] });
  });

  it("every deduction says why, and they add up", () => {
    const s = scorecard(report({ unclaimed: [hunk("dom", "a"), hunk("axe", "b")], stale: [claim("dom", "c", "Rule 0040: gone")], broad: [claim("*", "*", "big refactor")], override: true }));
    expect(s.deductions.map((d) => d.points)).toEqual([30, 10, 10, 5, 20]);
    expect(s.deductions[0]!.why).toMatch(/2 diff\(s\) no claim covers/);
    expect(s.deductions[1]!.why).toMatch(/no A\/A noise status/);
    expect(s.score).toBe(25);
    expect(s.grade).toBe("D");
  });

  it("caps each kind of deduction and never goes below 0", () => {
    const many = Array.from({ length: 20 }, (_, i) => hunk("dom", `p${i}`));
    const s = scorecard(report({ unclaimed: many, noise: quiet }));
    expect(s.deductions).toEqual([{ points: 60, why: "20 diff(s) no claim covers" }]);
    expect(s.score).toBe(40);
  });

  it("a noise run is judged on its own A/A diffs, gently", () => {
    const s = scorecard(report({ mode: "noise", unclaimed: [hunk("timing", "reader:home")] }));
    expect(s.deductions).toEqual([{ points: 5, why: expect.stringMatching(/between identical images/) }]);
    expect(s.normalness).toMatchObject({ state: "noisy", source: "this-run", hunks: 1 });
  });

  it("is the same for the same report", () => {
    const r = report({ unclaimed: [hunk("dom", "a")], noise: quiet });
    expect(scorecard(r)).toEqual(scorecard(r));
  });
});

describe("normalness", () => {
  it("comes from the nightly the release consulted", () => {
    expect(normalnessOf(report({ noise: quiet }))).toEqual({ state: "normal", source: "noise-status", hunks: 0, ranAt: quiet.ranAt });
    expect(normalnessOf(report({ noise: { ...quiet, clean: false, hunks: 3 } })).state).toBe("noisy");
    expect(normalnessOf(report({ noise: { ...quiet, degraded: ["reader built locally"] } }))).toMatchObject({ state: "degraded", degraded: ["reader built locally"] });
    expect(normalnessOf(report())).toEqual({ state: "unknown", source: "none" });
  });
});

describe("EARS Rules, diffs and PRs", () => {
  it("groups diffs by Rule and joins the PRs from rules.json and from the reason", () => {
    const rows = ruleRows(
      report({
        matched: [
          [hunk("dom", "reader:lab", { path: "/lab/1" }), claim("dom", "reader:lab*", "Rule 0031: reading time (PR #301)", { rule: "0031", ruleTitle: "reading time" })],
          [hunk("screenshot", "reader:lab", { path: "/lab/1" }), claim("screenshot", "reader:lab*", "Rule 0031: reading time", { rule: "0031", ruleTitle: "reading time" })],
          [hunk("axe", "reader:nav"), claim("axe", "reader:nav", "CHANGELOG 16.3.0: Nav bar: link contrast raised (PR #288)")]
        ],
        unclaimed: [hunk("console", "reader:home")],
        stale: [claim("dom", "reader:quiz", "Rule 0065: quiz timer", { rule: "0065", ruleTitle: "quiz timer" })]
      }),
      { "0031": { prs: [305, 301] }, "0065": { prs: [320] } }
    );
    expect(rows).toEqual([
      { rule: null, hunks: 1, artefacts: ["console"], scopes: ["reader:home"], prs: [], status: "unclaimed" },
      { rule: "0031", title: "reading time", hunks: 2, artefacts: ["dom", "screenshot"], scopes: ["/lab/1"], prs: [301, 305], status: "covered" },
      { rule: null, title: "CHANGELOG 16.3.0: Nav bar: link contrast raised (PR #288)", hunks: 1, artefacts: ["axe"], scopes: ["reader:nav"], prs: [288], status: "changelog" },
      { rule: "0065", title: "quiz timer", hunks: 0, artefacts: ["dom"], scopes: ["reader:quiz"], prs: [320], status: "stale" }
    ]);
  });

  it("finds the Rule in a reason when the claim has no rule field (contract 1.2.0 claims)", () => {
    const rows = ruleRows(report({ matched: [[hunk("dom", "x"), claim("dom", "x", "Rule 0012: sidebar collapses")]] }));
    expect(rows[0]).toMatchObject({ rule: "0012", title: "sidebar collapses", status: "covered" });
  });
});

describe("what to test by hand", () => {
  it("unclaimed first, then what only a person can judge, then broad claims; network changes are left to the machine", () => {
    const m = manualSlice(
      report({
        matched: [
          [hunk("network", "GET /api"), claim("network", "GET /api", "Rule 0050: api")],
          [hunk("screenshot", "reader:lab", { path: "/lab/1" }), claim("screenshot", "reader:lab", "Rule 0031: reading time", { rule: "0031" })],
          [hunk("axe", "reader:lab", { path: "/lab/1" }), claim("axe", "reader:lab", "Rule 0031: reading time", { rule: "0031" })],
          [hunk("logs", "reader/stdout"), claim("*", "**", "logging refactor", { approvedBy: "leigh" })]
        ],
        unclaimed: [hunk("dom", "catalogue:home", { path: "/" })]
      })
    );
    expect(m).toEqual([
      { scope: "/", path: "/", artefacts: ["dom"], hunks: 1, why: "moved and no claim covers it" },
      { scope: "/lab/1", path: "/lab/1", artefacts: ["screenshot", "axe"], hunks: 2, rule: "0031", why: "intended change a person must see (screenshot)" },
      { scope: "reader/stdout", artefacts: ["logs"], hunks: 1, why: "covered only by a broad claim" }
    ]);
  });

  it("stays narrow", () => {
    const unclaimed = Array.from({ length: 12 }, (_, i) => hunk("dom", `page${i}`));
    expect(manualSlice(report({ unclaimed }))).toHaveLength(MANUAL_LIMIT);
  });
});

describe("rendering and reading", () => {
  it("renders the headline, the table and the list", () => {
    const md = renderScorecard(scorecard(report({ unclaimed: [hunk("dom", "a")], noise: quiet })));
    expect(md).toContain("## Scorecard — 85/100 (B)");
    expect(md).toContain("| −15 | 1 diff(s) no claim covers |");
    expect(md).toContain("**Normalness:** normal (0 A/A diff(s), nightly of 2026-09-26T07:57:09.931Z)");
    expect(md).toContain("| no Rule | unclaimed | 1 | dom | — |");
    expect(md).toContain("- `a` (dom; 1 diff(s)): moved and no claim covers it");
  });

  it("reads PRs from rules.json and ignores what is not a PR number; a bad file gives none", () => {
    const dir = mkdtempSync(join(tmpdir(), "scorecard-"));
    writeFileSync(join(dir, "rules.json"), JSON.stringify({ version: 1, rules: { "0031": { title: "t", digest: "d", prs: [301, "x", -2] }, "0032": { title: "u" } } }));
    expect(readRulePrs(join(dir, "rules.json"))).toEqual({ "0031": { title: "t", prs: [301] }, "0032": { title: "u" } });
    writeFileSync(join(dir, "bad.json"), "{");
    expect(readRulePrs(join(dir, "bad.json"))).toEqual({});
    expect(readRulePrs(undefined)).toEqual({});
  });

  it("harness scorecard needs --report and prints JSON on --json", () => {
    expect(() => scorecardCommand({})).toThrow(UsageError);
    const dir = mkdtempSync(join(tmpdir(), "scorecard-"));
    writeFileSync(join(dir, "report.json"), JSON.stringify(report({ noise: quiet })));
    const out: string[] = [];
    expect(scorecardCommand({ report: dir, json: true }, (m) => out.push(m))).toBe(0);
    expect(JSON.parse(out[0]!)).toMatchObject({ schemaVersion: 1, score: 100, grade: "A" });
  });
});
