import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { exitCodeFor, gate } from "../src/gate.ts";
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
