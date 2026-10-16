/**
 * Since 1.28.4: post-deploy/claims.yaml, the claims post-deploy mode applies (docs/contract.md, "The post-deploy claims").
 * Every claim is narrow and has an `until` and an issue; and post-deploy.yml and `harness local watch` both pass the
 * file. The five claims of tutors-release-harness#38 expired with 17.0.0, which replaced the build they explained, and
 * were removed in 1.40.0: the file is back to its normal state, empty.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { POST_DEPLOY_CLAIMS_FILE, isBroad, loadClaims } from "../src/claims/schema.ts";
import { gate } from "../src/gate.ts";
import { planWatch } from "../src/local/tasks.ts";
import type { Artefact, Hunk, NoiseStatus } from "../src/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const claims = loadClaims(POST_DEPLOY_CLAIMS_FILE);
const hunk = (artefact: Artefact, scope: string, path = "/course/reference-course"): Hunk => ({ id: `${artefact}:${scope}`, artefact, scope, path, summary: "s", severity: "fail" });

/** The five unclaimed differences of the post-deploy runs of 2026-10-03 and 2026-10-04 (rollback issue #38). */
const issue38 = [
  hunk("network", "GET {{course}}/course.png", "/lab/reference-course/topic-01/lab-1"),
  hunk("console", "reference:course"),
  hunk("console", "reference:lab", "/lab/reference-course/topic-01/lab-1"),
  hunk("console", "reference:note", "/note/reference-course/topic-07/note-1"),
  hunk("focus", "reference:course")
];

const ranAt = new Date("2026-10-04T13:41:00.000Z");
const clean: NoiseStatus = { ranAt: "2026-10-04T02:00:00.000Z", clean: true, hunks: 0 };

describe("post-deploy/claims.yaml", () => {
  it("parses, and every claim is narrow, has an until and names the issue it explains", () => {
    for (const c of claims) {
      expect(isBroad(c), c.scope).toBe(false);
      expect(c.artefact, c.scope).not.toBe("*");
      expect(c.until, c.scope).toBeDefined();
      expect(c.reason, c.scope).toMatch(/^Issue #\d+: /);
    }
  });

  it("no longer claims the five differences of issue #38: 17.0.0 replaced that build, so a return of any is news (since 1.40.0)", () => {
    expect(claims).toEqual([]);
    const compare = matchClaims(issue38, claims);
    expect(compare.unclaimed.map((h) => h.id)).toEqual(issue38.map((h) => h.id));
    expect(gate({ mode: "post-deploy", compare, noise: clean, noiseWaived: false, noiseMaxAgeDays: 7, ranAt }).verdict).toBe("fail");
  });

  it("does not claim what sits next to them", () => {
    const near = [
      hunk("network", "GET {{course}}/other.png"),
      hunk("network", "GET {{course}}/topic-01/course.png"),
      hunk("console", "reference:topic"),
      hunk("console", "reader:home"),
      hunk("focus", "reference:lab"),
      hunk("dom", "reference:course"),
      hunk("axe", "reference:course"),
      hunk("screenshot", "reference:lab")
    ];
    const compare = matchClaims(near, claims);
    expect(compare.unclaimed.map((h) => h.id)).toEqual(near.map((h) => h.id));
  });

  it("is what post-deploy.yml and `harness local watch` pass to post-deploy mode", () => {
    const workflow = readFileSync(resolve(ROOT, ".github/workflows/post-deploy.yml"), "utf8");
    expect(workflow).toMatch(/pnpm harness run --mode post-deploy [^\n]*--claims post-deploy\/claims\.yaml/);
    const argv = planWatch({ production: "x" }).steps.find((s) => s.id === "post-deploy")!.argv;
    expect(argv[argv.indexOf("--claims") + 1]).toBe(POST_DEPLOY_CLAIMS_FILE);
    expect(POST_DEPLOY_CLAIMS_FILE).toBe(resolve(ROOT, "post-deploy/claims.yaml"));
  });
});
