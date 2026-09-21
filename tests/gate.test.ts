import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { exitCodeFor, gate, rollbackIssueConfigured } from "../src/gate.ts";
import type { Hunk, NoiseStatus } from "../src/types.ts";

const fail = (scope = "reader:home"): Hunk => ({ id: "h", artefact: "dom", scope, summary: "s", severity: "fail" });
const now = new Date("2026-09-16T09:05:00.000Z");
const clean: NoiseStatus = { ranAt: "2026-09-16T02:00:00.000Z", clean: true, hunks: 0 };
const dirty: NoiseStatus = { ranAt: "2026-09-16T02:00:00.000Z", clean: false, hunks: 3 };
const base = { noiseWaived: false, noiseMaxAgeDays: 7, ranAt: now };

describe("release mode", () => {
  it("passes when every diff is claimed", () => {
    const compare = matchClaims([fail()], [{ artefact: "dom", scope: "reader:home", reason: "Rule 0001: home changed" }]);
    expect(gate({ ...base, mode: "release", compare, noise: clean }).verdict).toBe("pass");
  });

  it("fails on an unclaimed diff when the A/A is clean and recent", () => {
    const out = gate({ ...base, mode: "release", compare: matchClaims([fail()], []), noise: clean });
    expect(out.verdict).toBe("fail");
    expect(out.reasons[0]).toMatch(/1 unclaimed/);
    expect(exitCodeFor(out.verdict)).toBe(1);
  });

  it("only warns when no A/A result was supplied", () => {
    const out = gate({ ...base, mode: "release", compare: matchClaims([fail()], []) });
    expect(out.verdict).toBe("warn");
    expect(out.reasons[0]).toMatch(/no A\/A/);
  });

  it("only warns when the last A/A was not clean", () => {
    const out = gate({ ...base, mode: "release", compare: matchClaims([fail()], []), noise: dirty });
    expect(out.verdict).toBe("warn");
    expect(out.reasons[0]).toMatch(/3 diff/);
  });

  it("only warns when the clean A/A is too old", () => {
    const old: NoiseStatus = { ...clean, ranAt: "2026-09-01T02:00:00.000Z" };
    const out = gate({ ...base, mode: "release", compare: matchClaims([fail()], []), noise: old });
    expect(out.verdict).toBe("warn");
    expect(out.reasons[0]).toMatch(/older than 7/);
  });

  it("fails when the A/A requirement is explicitly waived", () => {
    expect(gate({ ...base, mode: "release", compare: matchClaims([fail()], []), noiseWaived: true }).verdict).toBe("fail");
  });

  it("fails on a broad claim without approval even if it covers everything", () => {
    const compare = matchClaims([fail()], [{ artefact: "*", scope: "**", reason: "Rule 0000: everything" }]);
    const out = gate({ ...base, mode: "release", compare, noise: clean });
    expect(out.verdict).toBe("fail");
    expect(out.reasons[0]).toMatch(/broad claim/);
  });

  it("passes with an approved broad claim but says so", () => {
    const compare = matchClaims([fail()], [{ artefact: "*", scope: "**", reason: "Rule 0000: everything", approvedBy: "a human" }]);
    expect(gate({ ...base, mode: "release", compare, noise: clean }).verdict).toBe("pass");
  });

  it("mentions stale claims without failing", () => {
    const compare = matchClaims([], [{ artefact: "dom", scope: "reader:gone", reason: "Rule 0009: gone" }]);
    const out = gate({ ...base, mode: "release", compare, noise: clean });
    expect(out.verdict).toBe("pass");
    expect(out.reasons.join("\n")).toMatch(/stale|matched nothing/);
  });
});

describe("noise mode", () => {
  it("passes on zero diffs and warns otherwise; never fails", () => {
    expect(gate({ ...base, mode: "noise", compare: matchClaims([], []) }).verdict).toBe("pass");
    const out = gate({ ...base, mode: "noise", compare: matchClaims([fail(), fail("reader:course")], []) });
    expect(out.verdict).toBe("warn");
    expect(out.reasons[0]).toMatch(/2 diff/);
  });
});

describe("any-two mode", () => {
  it("never fails", () => {
    expect(gate({ ...base, mode: "any-two", compare: matchClaims([fail()], []) }).verdict).toBe("pass");
  });
});

describe("rehearsal modes need no A/A", () => {
  it("migration fails on an unclaimed violation and passes clean", () => {
    expect(gate({ ...base, mode: "migration", compare: matchClaims([], []) }).verdict).toBe("pass");
    const out = gate({ ...base, mode: "migration", compare: matchClaims([{ ...fail("app_errors.level"), artefact: "migration" }], []) });
    expect(out.verdict).toBe("fail");
    expect(out.reasons[0]).toMatch(/expand\/contract/);
  });

  it("upgrade fails on any finding during the rollout", () => {
    expect(gate({ ...base, mode: "upgrade", compare: matchClaims([], []) }).verdict).toBe("pass");
    expect(gate({ ...base, mode: "upgrade", compare: matchClaims([{ ...fail("rollout"), artefact: "upgrade" }], []) }).verdict).toBe("fail");
  });
});

describe("post-deploy mode", () => {
  it("passes when production matches the recorded candidate", () => {
    expect(gate({ ...base, mode: "post-deploy", compare: matchClaims([], []), noise: clean }).verdict).toBe("pass");
  });

  it("asks for a rollback issue on a new difference, subject to the A/A rule", () => {
    const out = gate({ ...base, mode: "post-deploy", compare: matchClaims([fail("reference:course")], []), noise: clean });
    expect(out.verdict).toBe("fail");
    expect(out.reasons[0]).toMatch(/rollback/);
    expect(gate({ ...base, mode: "post-deploy", compare: matchClaims([fail("reference:course")], []) }).verdict).toBe("warn");
  });
});

describe("post-deploy wording: a rollback issue only where a CI step opens one", () => {
  const compare = () => matchClaims([fail("reference:course")], []);
  const first = (rollbackIssue?: boolean) => gate({ ...base, mode: "post-deploy", compare: compare(), ...(rollbackIssue === undefined ? {} : { rollbackIssue }) }).reasons.join(" | ");

  it("keeps the CI wording by default and where a rollback step is configured", () => {
    expect(first()).toContain("open a rollback issue");
    expect(first(true)).toContain("open a rollback issue");
  });

  it("does not promise an issue a local run never opens, in a WARN or a FAIL, and leaves the verdict alone", () => {
    expect(first(false)).not.toMatch(/rollback issue/);
    expect(first(false)).toContain("decide whether to roll back");
    const failing = gate({ ...base, mode: "post-deploy", compare: compare(), noise: clean, rollbackIssue: false });
    expect(failing.verdict).toBe("fail");
    expect(failing.reasons[0]).not.toMatch(/rollback issue/);
  });

  it("release mode is unaffected", () => {
    expect(gate({ ...base, mode: "release", compare: compare(), noise: clean, rollbackIssue: false }).reasons[0]).toMatch(/1 unclaimed/);
  });

  it("rollbackIssueConfigured: the explicit variable wins, else GitHub Actions has a step and nothing else does", () => {
    expect(rollbackIssueConfigured({})).toBe(false);
    expect(rollbackIssueConfigured({ GITHUB_ACTIONS: "true" })).toBe(true);
    expect(rollbackIssueConfigured({ HARNESS_ROLLBACK_ISSUE: "1" })).toBe(true);
    expect(rollbackIssueConfigured({ HARNESS_ROLLBACK_ISSUE: "Yes" })).toBe(true);
    expect(rollbackIssueConfigured({ HARNESS_ROLLBACK_ISSUE: "0", GITHUB_ACTIONS: "true" })).toBe(false);
    expect(rollbackIssueConfigured({ HARNESS_ROLLBACK_ISSUE: "false" })).toBe(false);
  });
});

describe("a degraded A/A never licenses a FAIL", () => {
  const degraded: NoiseStatus = { ...clean, degraded: ["side a did not run pulled+verified images (cached 2026-09-14T02:30:00.000Z)"] };

  it("release and post-deploy only warn on a clean but degraded status, and say why", () => {
    for (const mode of ["release", "post-deploy"] as const) {
      const out = gate({ ...base, mode, compare: matchClaims([fail()], []), noise: degraded });
      expect(out.verdict, mode).toBe("warn");
      expect(out.reasons[0], mode).toMatch(/degraded and does not count/);
    }
  });

  it("an empty degraded list is no degradation (the field may be present and empty)", () => {
    expect(gate({ ...base, mode: "release", compare: matchClaims([fail()], []), noise: { ...clean, degraded: [] } }).verdict).toBe("fail");
  });

  it("noise mode with zero diffs but degraded evidence is a warning, never a pass", () => {
    const out = gate({ ...base, mode: "noise", compare: matchClaims([], []), degraded: ["side a did not run pulled+verified images (local)"] });
    expect(out.verdict).toBe("warn");
    expect(out.reasons[0]).toMatch(/DEGRADED/);
  });

  it("the seven-day rule is exact: seven days trusts, past seven days warns", () => {
    const at = (days: number): NoiseStatus => ({ ...clean, ranAt: new Date(now.getTime() - days * 86_400_000).toISOString() });
    expect(gate({ ...base, mode: "release", compare: matchClaims([fail()], []), noise: at(7) }).verdict).toBe("fail");
    expect(gate({ ...base, mode: "release", compare: matchClaims([fail()], []), noise: at(7.001) }).verdict).toBe("warn");
  });
});
