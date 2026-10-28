import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { judgedHere } from "../src/run.ts";
import type { Claim, Hunk } from "../src/types.ts";

// The 28 Oct 2026 forecast (sha-d350404 beside 17.0.0): one claims file, three runs.
const claims = [
  { artefact: "migration", scope: "app_errors:anon_select_app_errors", reason: "CHANGELOG Unreleased: app_errors is no longer readable with the anon key (migration)" },
  { artefact: "network", scope: "GET /api/time/*", reason: "CHANGELOG Unreleased (Time): the dashboard loads time data from the reader" },
  { artefact: "upgrade", scope: "rollout", reason: "CHANGELOG Unreleased: a rollout drops one request" }
] as Claim[];
const policy: Hunk = { id: "migration:app_errors:anon_select_app_errors:14", artefact: "migration", scope: "app_errors:anon_select_app_errors", severity: "fail", summary: "policy app_errors:anon_select_app_errors removed" };
const time: Hunk = { id: "network:1", artefact: "network", scope: "GET /api/time/harness-rules", severity: "fail", summary: "time-auth:rule-0590-medians: new request on b: GET /api/time/harness-rules" };
const stale = (mode: Parameters<typeof judgedHere>[0], hunks: Hunk[]) => judgedHere(mode, matchClaims(hunks, claims)).staleClaims.map((c) => c.artefact);

describe("a claim is stale only in a run that could have matched it (since 1.59.1)", () => {
  it("never calls a migration or upgrade claim stale in the release run, which sees neither", () => {
    expect(stale("release", [time])).toEqual([]);
    expect(stale("release", [])).toEqual(["network"]);
  });

  it("lets the migration rehearsal cover its migration, and judges only migration claims there", () => {
    const c = judgedHere("migration", matchClaims([policy], claims));
    expect(c.unclaimed).toEqual([]);
    expect(c.staleClaims).toEqual([]);
    expect(stale("migration", [])).toEqual(["migration"]);
    expect(stale("upgrade", [])).toEqual(["upgrade"]);
  });
});
