/**
 * secrets-in-response (since 1.52.0; harness hardening plan, D3): the raw scan the browser collector runs before it
 * redacts anything, and the engine that judges b on it. The A/A, the planted canary and service key, and what it must
 * not flag (a session token, a public anon key, a value never kept).
 */
import { describe, expect, it } from "vitest";
import { canariesIn, distinctSecrets, jwtRole, secretsInText, stackCanaries } from "../src/collectors/secrets.ts";
import { applyLevels } from "../src/compare/levels.ts";
import { secretsInResponse } from "../src/compare/secrets-in-response.ts";
import type { ResponseSecret, SideCapture } from "../src/types.ts";
import { capture, journey, page } from "./support/captures.ts";

const jwt = (payload: object) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.c2lnbmF0dXJlLXNpZ25hdHVyZQ`;
const CANARIES = [{ name: "PRIVATE_AUTH_SECRET", value: "harness-only-not-a-real-secret-000000000000" }];
const withSecrets = (side: "a" | "b", secrets: ResponseSecret[] | undefined): SideCapture => capture(side, { journeys: [journey({ pages: [page(secrets === undefined ? {} : { secrets })] })] });

describe("the raw scan", () => {
  it("reads the stack's canaries from compose.harness.yaml: every PRIVATE_* value, once, and nothing short or interpolated", () => {
    const names = stackCanaries().map((c) => c.name);
    expect(names).toContain("PRIVATE_AUTH_SECRET");
    expect(canariesIn("x:\n  PRIVATE_A: harness-only-not-a-real-secret-0000\n  PRIVATE_B: harness-only-not-a-real-secret-0000\n  PRIVATE_SHORT: abc\n  PRIVATE_VAR: ${SOMETHING}\n  PUBLIC_X: harness-public-value-0000")).toEqual([{ name: "PRIVATE_A", value: "harness-only-not-a-real-secret-0000" }]);
  });

  it("planted: a canary, a token-shaped value and a service-role JWT are each named, and no value is kept", () => {
    const text = `{"auth":"${CANARIES[0]!.value}","gh":"ghp_${"a".repeat(36)}","key":"${jwt({ role: "service_role", iss: "supabase" })}"}`;
    const got = secretsInText("body", text, CANARIES);
    expect(got.map((f) => f.name)).toEqual(["PRIVATE_AUTH_SECRET", "GitHub token", "service_role JWT"]);
    expect(JSON.stringify(got)).not.toContain(CANARIES[0]!.value);
    expect(JSON.stringify(got)).not.toContain("ghp_");
  });

  it("must not flag: a session token, the public anon key, a JWT that is not JSON, plain text", () => {
    expect(secretsInText("body", `{"access_token":"${jwt({ role: "authenticated", sub: "u1" })}","anon":"${jwt({ role: "anon" })}"}`, CANARIES)).toEqual([]);
    expect(secretsInText("url", "http://x/rest/v1/t?apikey=eyJub3Rqc29uXX0x.eyJub3Rqc29uXX0x.abc", CANARIES)).toEqual([]);
    expect(secretsInText("aria", '- heading "Runway Fixture Course" [level=1]', CANARIES)).toEqual([]);
    expect(secretsInText("aria", "", CANARIES)).toEqual([]);
    expect(jwtRole("!!")).toBeUndefined();
  });

  it("keeps each source and name once per page, in a stable order", () => {
    const f = (source: ResponseSecret["source"], name: string): ResponseSecret => ({ source, name, why: "x" });
    expect(distinctSecrets([f("url", "B"), f("body", "A"), f("url", "B"), f("aria", "A")]).map((x) => `${x.source}/${x.name}`)).toEqual(["aria/A", "body/A", "url/B"]);
  });
});

describe("the engine", () => {
  const leak: ResponseSecret = { source: "body", name: "PRIVATE_AUTH_SECRET", why: "the value of PRIVATE_AUTH_SECRET, which the stack sets as a server-only secret" };

  it("A/A: scanned and clean on both sides is one summary, informational", () => {
    const hunks = secretsInResponse(withSecrets("a", []), withSecrets("b", []));
    expect(hunks.map((h) => `${h.scope} ${h.severity}`)).toEqual(["summary info"]);
    expect(hunks[0]!.summary).toContain("1 page capture(s)");
  });

  it("planted: a canary in b's body is a failing hunk scoped to page, source and name, new on b, and informing through the levels", () => {
    const hunks = secretsInResponse(withSecrets("a", []), withSecrets("b", [leak]));
    expect(hunks).toMatchObject([{ artefact: "secrets-in-response", scope: "reader:course/body/PRIVATE_AUTH_SECRET", path: "/course/localhost:8080", severity: "fail" }]);
    expect(hunks[0]!.summary).toMatch(/a response body holds PRIVATE_AUTH_SECRET: .* \(new on b\)$/);
    expect(applyLevels(hunks, new Date("2026-10-23T00:00:00Z"))[0]).toMatchObject({ severity: "info", level: "informing" });
  });

  it("only b is judged; a finding production sent too says so", () => {
    expect(secretsInResponse(withSecrets("a", [leak]), withSecrets("b", [])).map((h) => h.scope)).toEqual(["summary"]);
    expect(secretsInResponse(withSecrets("a", [leak]), withSecrets("b", [leak]))[0]!.summary).toMatch(/\(production too\)$/);
    expect(secretsInResponse(withSecrets("a", undefined), withSecrets("b", [leak]))[0]!.summary).not.toMatch(/production too|new on b/);
  });

  it("must not flag: a capture recorded before 1.52.0 says nothing, and a side with no pages says nothing", () => {
    expect(secretsInResponse(withSecrets("a", undefined), withSecrets("b", undefined))).toEqual([]);
    expect(secretsInResponse(capture("a", { journeys: [] }), capture("b", { journeys: [] }))).toEqual([]);
  });

  it("the same finding on the same page over several runs is one hunk", () => {
    const b = capture("b", { journeys: [journey({ run: 1, pages: [page({ secrets: [leak] })] }), journey({ run: 2, pages: [page({ secrets: [leak] })] })] });
    expect(secretsInResponse(withSecrets("a", []), b)).toHaveLength(1);
  });
});
