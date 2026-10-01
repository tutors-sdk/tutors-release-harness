/**
 * The policy family (since 1.22.0): image hardening, build provenance and the vulnerability ceiling, judged on the
 * candidate alone and informing. Per check: the A/A (a good image: a summary, no finding), the planted fault it catches,
 * and what it must not flag; then the collectors that feed it, and a whole run whose verdict it must not change.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applyLevels } from "../src/compare/levels.ts";
import { POLICY_FAMILY, ceiling, hardening, policy, provenance as provenanceCheck } from "../src/compare/policy.ts";
import { collectManifest, healthcheckOf } from "../src/image-static/manifest.ts";
import { collectBuildProvenance, slsaStatements } from "../src/image-static/provenance.ts";
import { secretsInEnv, secretsInHistory } from "../src/image-static/secrets.ts";
import type { BuildProvenanceData, SideImageStatic } from "../src/image-static/types.ts";
import { trustPolicyFromEnv } from "../src/images.ts";
import { DEFAULT_MASKS_FILE } from "../src/normalise/masks.ts";
import { renderHtml } from "../src/report/html.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { compareFromCaptures } from "../src/run.ts";
import type { Hunk, SideCapture } from "../src/types.ts";
import { D, fakeTools, manifest, provenance, staticSide, vulns, withStatic } from "./support/image-static.ts";

const REF = "quay.io/tutors-sdk/tutors-reader:16.2.2";
const REPO = "quay.io/tutors-sdk/tutors-reader";
const trust = trustPolicyFromEnv({});
const AT = new Date("2026-10-01T09:00:00Z");
const PUBLISHING = "https://github.com/tutors-sdk/tutors-mono-repo/.github/workflows/image-build.yml@refs/heads/main";
const good = (): BuildProvenanceData => ({ identity: trust.identity, statements: [{ predicateType: "https://slsa.dev/provenance/v1", builder: "https://github.com/actions/runner/github-hosted", workflow: ".github/workflows/image-build.yml@refs/heads/main" }] });
const hardened = () => manifest({ healthcheck: "CMD node healthcheck.js", secretEnv: [], secretHistory: [] });

/** A side whose every app has the given static artefacts and SLSA provenance. */
function side(name: "a" | "b", over: Parameters<typeof staticSide>[0] = {}, prov: BuildProvenanceData | { reason: string } = good()): SideCapture {
  const s = staticSide({ manifest: hardened(), vulns: vulns({}), ...over });
  for (const app of Object.keys(s) as (keyof SideImageStatic)[]) s[app]!.buildProvenance = "reason" in prov ? { ok: false, reason: prov.reason } : { ok: true, data: prov };
  return withStatic(name, s);
}
const failing = (hunks: Hunk[]) => hunks.filter((h) => h.severity === "fail");
const of = (hunks: Hunk[], artefact: string) => hunks.filter((h) => h.artefact === artefact);

describe("image hardening", () => {
  it("A/A: a non-root image with a healthcheck and nothing secret-shaped holds, and says what it checked", () => {
    const h = hardening(hardened());
    expect(h).toEqual({ findings: [], checked: "USER 1001, HEALTHCHECK CMD node healthcheck.js, 0 secret-looking environment variable(s), 0 in the layer history" });
  });

  it("planted: root, no healthcheck, a secret in the environment and one in the layer history are each a finding", () => {
    const h = hardening(manifest({ user: "", healthcheck: null, secretEnv: [{ name: "NPM_TOKEN", why: "its name says it holds a secret, and it has a value" }], secretHistory: [{ name: "GITHUB_TOKEN", entry: 4, why: "the value is a GitHub token, set in the build" }] }));
    expect("findings" in h && h.findings.map((f) => f.key)).toEqual(["user", "healthcheck", "env/NPM_TOKEN", "history/GITHUB_TOKEN"]);
  });

  it("a capture recorded before 1.22.0 is not evaluated, never passed", () => {
    expect(hardening(manifest())).toEqual({ notEvaluated: expect.stringContaining("before 1.22.0") });
  });

  it("the healthcheck: none, an empty one and NONE are none; a real one is kept", () => {
    expect(healthcheckOf(undefined)).toBeNull();
    expect(healthcheckOf([])).toBeNull();
    expect(healthcheckOf(["NONE"])).toBeNull();
    expect(healthcheckOf(["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"])).toBe("CMD-SHELL curl -f http://localhost:3000/ || exit 1");
  });
});

describe("secrets in the image", () => {
  it("planted: a secret's name with a value, and a secret-shaped value under any name, are flagged by name; the value is never kept", () => {
    const ghp = `ghp_${"a".repeat(36)}`;
    const got = secretsInEnv(["DB_PASSWORD=hunter2", "API_KEY=abc", `DEPLOY=${ghp}`, "AWS=AKIAABCDEFGHIJKLMNOP"]);
    expect(got.map((f) => f.name)).toEqual(["DB_PASSWORD", "API_KEY", "DEPLOY", "AWS"]);
    expect(got[2]!.why).toBe("the value is a GitHub token");
    expect(JSON.stringify(got)).not.toContain("hunter2");
    expect(JSON.stringify(got)).not.toContain(ghp);
  });

  it("must not flag: the Tutors runtime's own environment, an empty secret, a public anon key and a JWT in a PUBLIC_ variable", () => {
    const jwt = `eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.${"s".repeat(20)}`;
    expect(secretsInEnv(["PATH=/usr/local/bin:/usr/bin", "NODE_VERSION=22.20.0", "YARN_VERSION=1.22.22", "NODE_ENV=production", "PORT=3000", "HOST=0.0.0.0", "NODE_OPTIONS=--enable-source-maps", "GIT_SHA=865d02f", "BUILD_DATE=2026-09-30T08:00:00Z", "NPM_TOKEN=", "SUPABASE_ANON_KEY=x", `PUBLIC_SUPABASE_ANON_KEY=${jwt}`])).toEqual([]);
    expect(secretsInEnv([`SESSION=${jwt}`])).toEqual([{ name: "SESSION", why: "the value is a JSON web token" }]);
  });

  it("the layer history: a build argument named as a secret, or a token on the line, by entry; a name the environment already flagged is not repeated", () => {
    const lines = ["CMD [\"node\" \"build/index.js\"]", "|4 APP_NAME=reader BUILD_DATE=x GIT_SHA=y VERSION=16.2.2 /bin/sh -c apt-get update", `RUN /bin/sh -c echo //registry.npmjs.org/:_authToken=npm_${"b".repeat(36)} > .npmrc`, "|1 NPM_TOKEN=s3cret /bin/sh -c pnpm install", "ENV DB_PASSWORD=hunter2"];
    const got = secretsInHistory(lines, ["DB_PASSWORD"]);
    expect(got).toEqual([
      { name: "npm token", entry: 2, why: "the build history holds an npm token" },
      { name: "NPM_TOKEN", entry: 3, why: "its name says it holds a secret, and it has a value, set in the build" }
    ]);
    expect(JSON.stringify(got)).not.toContain("s3cret");
    expect(secretsInHistory(lines.slice(0, 2))).toEqual([]);
  });

  it("collected with the manifest: the healthcheck, the environment and the history, through the injected docker", () => {
    const tools = fakeTools({ images: { [REF]: { config: { User: "1001", Env: ["NODE_ENV=production", "API_KEY=abc"], Healthcheck: { Test: ["CMD", "node", "hc.js"] } } } }, history: { [REF]: ["|1 NPM_TOKEN=x /bin/sh -c pnpm i", "ENV API_KEY=abc"] } });
    const got = collectManifest(tools.exec, REF);
    expect(got).toMatchObject({ ok: true, data: { healthcheck: "CMD node hc.js", secretEnv: [{ name: "API_KEY" }], secretHistory: [{ name: "NPM_TOKEN", entry: 0 }] } });
    expect(tools.calls[1]).toEqual({ cmd: "docker", args: ["image", "history", "--no-trunc", "--format", "{{json .}}", REF] });
    // No history: the manifest is still collected, and says the history was not read.
    expect(collectManifest(fakeTools({ images: { [REF]: {} } }).exec, REF)).toMatchObject({ ok: true, data: { healthcheck: null, secretEnv: [], secretHistory: null } });
  });
});

describe("build provenance", () => {
  it("A/A: SLSA provenance from image-build.yml holds, by its workflow or its builder", () => {
    expect(provenanceCheck(good(), D(1))).toEqual({ findings: [], checked: "SLSA provenance v1 by .github/workflows/image-build.yml@refs/heads/main" });
    expect(provenanceCheck({ identity: "x", statements: [{ predicateType: "https://slsa.dev/provenance/v0.2", builder: PUBLISHING, workflow: null }] }, D(1))).toMatchObject({ findings: [] });
  });

  it("planted: no SLSA provenance, or one from another builder, is a finding", () => {
    expect(provenanceCheck({ identity: "x", statements: [] }, D(1))).toMatchObject({ findings: [{ key: "slsa", text: expect.stringContaining(`no SLSA provenance verified under the publishing identity on ${"1".repeat(12)}`) }] });
    expect(provenanceCheck({ identity: "x", statements: [{ predicateType: "https://slsa.dev/provenance/v1", builder: "https://github.com/actions/runner/github-hosted", workflow: ".github/workflows/hand-built.yml@refs/heads/x" }] }, D(1))).toMatchObject({ findings: [{ key: "builder", text: "SLSA provenance names .github/workflows/hand-built.yml@refs/heads/x, not image-build.yml" }] });
  });

  const slsa = (digest: string, predicate: unknown, predicateType = "https://slsa.dev/provenance/v1") => JSON.stringify({ payload: Buffer.from(JSON.stringify({ predicateType, subject: [{ digest: { sha256: digest.replace("sha256:", "") } }], predicate })).toString("base64") });

  it("reads v1 and v0.2 statements about this digest only", () => {
    const out = [slsa(D(1), { runDetails: { builder: { id: "B1" } }, buildDefinition: { externalParameters: { workflow: { path: ".github/workflows/image-build.yml", ref: "refs/tags/v16.2.2" } } } }), slsa(D(2), { builder: { id: "other" } }), slsa(D(1), { builder: { id: "B02" }, invocation: { configSource: { entryPoint: ".github/workflows/image-build.yml" } } }, "https://slsa.dev/provenance/v0.2"), slsa(D(1), {}, "https://spdx.dev/Document")].join("\n");
    expect(slsaStatements(out, D(1))).toEqual([
      { predicateType: "https://slsa.dev/provenance/v1", builder: "B1", workflow: ".github/workflows/image-build.yml@refs/tags/v16.2.2" },
      { predicateType: "https://slsa.dev/provenance/v0.2", builder: "B02", workflow: ".github/workflows/image-build.yml" }
    ]);
  });

  it("asks cosign under the signing identity, v1 then v0.2; none of either is an empty list, and only a verified pull is asked", () => {
    const subject = `${REPO}@${D(1)}`;
    const none = fakeTools({});
    expect(collectBuildProvenance({ exec: none.exec, policy: trust }, REF, provenance({ digest: D(1) }))).toEqual({ ok: true, source: "cosign verify-attestation --type slsaprovenance1, slsaprovenance", data: { identity: trust.identity, statements: [] } });
    expect(none.calls.map((c) => c.args)).toEqual(["slsaprovenance1", "slsaprovenance"].map((t) => ["verify-attestation", "--type", t, "--certificate-identity-regexp", trust.identity, "--certificate-oidc-issuer", trust.issuer, subject]));
    const found = fakeTools({ attestations: { [subject]: slsa(D(1), { runDetails: { builder: { id: "B" } } }) } });
    expect(collectBuildProvenance({ exec: found.exec, policy: trust }, REF, provenance({ digest: D(1) }))).toMatchObject({ ok: true, data: { statements: [{ builder: "B" }] } });
    expect(found.calls).toHaveLength(1);
    for (const p of ["local", "pulled-unverified", "built-from-ref", "cached"] as const) {
      const t = fakeTools({});
      expect(collectBuildProvenance({ exec: t.exec, policy: trust }, REF, provenance({ provenance: p })), p).toEqual({ ok: false, reason: expect.stringContaining(`is ${p}, not pulled and signature-verified`) });
      expect(t.calls).toEqual([]);
    }
    expect(collectBuildProvenance({ exec: fakeTools({ cosign: "missing" }).exec, policy: trust }, REF, provenance({ digest: D(1) }))).toEqual({ ok: false, reason: expect.stringContaining("could not ask for the SLSA provenance") });
  });
});

describe("the vulnerability ceiling", () => {
  it("A/A: no critical or high with a fix holds, and says what was scanned", () => {
    expect(ceiling(vulns({ "CVE-1": { severity: "Low", packages: ["a@1"], fixedIn: "2" }, "CVE-2": { severity: "High", packages: ["b@1"] } }))).toEqual({ findings: [], checked: "2 advisories scanned, 1 critical or high, none with a fix available" });
  });

  it("planted: a critical (grype) or HIGH (trivy) advisory with a fix is a finding", () => {
    const got = ceiling(vulns({ "CVE-2026-9": { severity: "Critical", packages: ["tar@7.4.3"], fixedIn: "7.5.2" }, "CVE-2026-8": { severity: "HIGH", packages: ["x@1"], fixedIn: "2" } }));
    expect("findings" in got && got.findings).toEqual([
      { key: "CVE-2026-8", text: "CVE-2026-8 (HIGH) in x@1 has a fix: 2" },
      { key: "CVE-2026-9", text: "CVE-2026-9 (Critical) in tar@7.4.3 has a fix: 7.5.2" }
    ]);
  });

  it("must not flag: a medium with a fix, or a critical with none", () => {
    expect(ceiling(vulns({ a: { severity: "Medium", packages: ["a@1"], fixedIn: "2" }, b: { severity: "Critical", packages: ["b@1"] } }))).toMatchObject({ findings: [] });
  });
});

describe("the engine", () => {
  it("A/A: a good candidate gets one summary per check per app, all informational", () => {
    const hunks = policy(side("a"), side("b"));
    expect(hunks).toHaveLength(POLICY_FAMILY.length * 4);
    expect(failing(hunks)).toEqual([]);
    expect(hunks.map((h) => h.scope)).toContain("time/summary");
  });

  it("planted: each fault on b is a finding with its scope, saying whether production has it too", () => {
    const tar = vulns({ "CVE-2026-9": { severity: "Critical", packages: ["tar@7.4.3"], fixedIn: "7.5.2" } });
    const a = side("a", { vulns: tar }, { identity: "x", statements: [] });
    const b = side("b", { vulns: tar, manifest: manifest({ healthcheck: null, secretEnv: [], secretHistory: [] }) }, { identity: "x", statements: [] });
    const hunks = failing(policy(a, b));
    expect(of(hunks, "image-hardening").map((h) => h.summary)).toEqual(["reader: declares no HEALTHCHECK (new on b)", "catalogue: declares no HEALTHCHECK (new on b)", "live: declares no HEALTHCHECK (new on b)", "time: declares no HEALTHCHECK (new on b)"]);
    expect(of(hunks, "build-provenance").map((h) => h.scope)).toEqual(["reader/slsa", "catalogue/slsa", "live/slsa", "time/slsa"]);
    expect(of(hunks, "build-provenance")[0]!.summary).toMatch(/\(production too\)$/);
    expect(of(hunks, "vuln-ceiling")[0]).toMatchObject({ scope: "reader/CVE-2026-9", summary: "reader: CVE-2026-9 (Critical) in tar@7.4.3 has a fix: 7.5.2 (production too)" });
  });

  it("only b is judged: a fault on production alone is no finding", () => {
    expect(failing(policy(side("a", { manifest: manifest({ user: "0", healthcheck: null, secretEnv: [], secretHistory: [] }) }), side("b")))).toEqual([]);
  });

  it("what cannot be evaluated says why, informational, never a pass: no image config, no provenance, an old capture, no static artefacts at all", () => {
    const b = side("b", {}, { reason: "quay.io/x is local, not pulled and signature-verified in this run" });
    b.imageStatic!.reader.vulns = { ok: false, reason: "grype is not installed" };
    const hunks = policy(side("a"), b);
    expect(hunks.filter((h) => h.scope.endsWith("/not-evaluated")).map((h) => `${h.artefact} ${h.scope} ${h.severity}`)).toEqual(["build-provenance reader/not-evaluated info", "build-provenance catalogue/not-evaluated info", "build-provenance live/not-evaluated info", "build-provenance time/not-evaluated info", "vuln-ceiling reader/not-evaluated info"]);
    const old = side("b");
    for (const app of ["reader", "catalogue", "live", "time"] as const) delete old.imageStatic![app]!.buildProvenance;
    old.imageStatic!.reader.manifest = { ok: true, data: manifest() };
    expect(policy(side("a"), old).filter((h) => h.scope === "reader/not-evaluated").map((h) => h.artefact)).toEqual(["image-hardening", "build-provenance"]);
    const { imageStatic: _gone, ...bare } = side("b");
    expect(policy(side("a"), bare)).toEqual([]);
  });

  it("every finding is informing: the Gate never sees it, a claim can still cover it", () => {
    const b = side("b", { manifest: manifest({ user: "", healthcheck: null, secretEnv: [], secretHistory: [] }) }, { identity: "x", statements: [] });
    const leveled = applyLevels(policy(side("a"), b), AT);
    expect(failing(leveled)).toEqual([]);
    expect(leveled.filter((h) => h.level === "informing")).toHaveLength(12);
  });
});

describe("through a run", () => {
  const run = (b: SideCapture, claims: Parameters<typeof compareFromCaptures>[0]["claims"] = [], a = side("a")) =>
    compareFromCaptures({ mode: "release", substrate: "compose", captureDir: mkdtempSync(join(tmpdir(), "harness-policy-")), a, b, claims, masksFile: DEFAULT_MASKS_FILE, noise: "skip", noiseMaxAgeDays: 7, now: "2026-09-16T09:05:00.000Z", runs: 1, ranAt: AT, log: () => {} }).report;

  it("a candidate that breaks every policy still passes when nothing else moved: the verdict, Gate and exit code are as before", () => {
    const tar = vulns({ "CVE-2026-9": { severity: "Critical", packages: ["tar@7.4.3"], fixedIn: "7.5.2" } });
    // Production has the same advisory, so the vulns diff is quiet: only the policy family speaks.
    const r = run(side("b", { vulns: tar, manifest: manifest({ healthcheck: null, secretEnv: [], secretHistory: [] }) }, { identity: "x", statements: [] }), [], side("a", { vulns: tar }));
    expect(r.verdict).toBe("pass");
    expect(r.compare.hunks.filter((h) => h.level === "informing").length).toBe(12);
    expect(r.compare.unclaimed.filter((h) => (POLICY_FAMILY as readonly string[]).includes(h.artefact))).toEqual([]);
    const html = renderHtml(r);
    expect(html).toContain('<h2 id="policy">Policy: what b must be <span class="level">informing</span></h2>');
    expect(html).toContain(`<td data-label="vuln-ceiling"><a href="#informing">1 finding</a> <small>(1 on production too)</small></td>`);
    expect(renderMarkdown(r)).toContain("### Policy: what b must be (informing)");
  });

  it("claimable the same way: a claim on vuln-ceiling covers its finding and is not stale", () => {
    const tar = vulns({ "CVE-2026-9": { severity: "Critical", packages: ["tar@7.4.3"], fixedIn: "7.5.2" } });
    const r = run(side("b", { vulns: tar }), [{ artefact: "vuln-ceiling", scope: "*/CVE-2026-9", reason: "Rule 0226: tar is not reachable from the server bundle" }], side("a", { vulns: tar }));
    expect(r.verdict).toBe("pass");
    expect(r.compare.staleClaims).toEqual([]);
    expect(r.compare.matches.filter((m) => m.claim?.artefact === "vuln-ceiling")).toHaveLength(4);
  });
});
