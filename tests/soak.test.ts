/**
 * Soak prep (since 1.25.0): what 2.0 waits on, made countable from the first night. A clean night is a clean, verified
 * A/A and a clean a-to-a2; an unchanged night pauses the count; anything else breaks it. Each policy check that 2.0 may
 * make blocking has a planted mutant, caught while the check is still informing, and a count of quiet nights. Nothing here
 * reaches Docker or the network: the mutants themselves run in weekly-mutants.yml.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { WorkflowRun } from "../src/a3/github.ts";
import { policy } from "../src/compare/policy.ts";
import type { Exec } from "../src/images.ts";
import { DEFAULT_ALT_BASE, buildMutantImage } from "../src/mutant-build.ts";
import { informingKeys, judgeMutant, loadMutants } from "../src/mutants.ts";
import { buildReadiness, type KeptForecast } from "../src/readiness/model.ts";
import { renderReadiness } from "../src/readiness/render.ts";
import { SOAK_CHECKS, SOAK_FROM, SOAK_TARGET, buildSoak, policyFacts, type AaNight } from "../src/readiness/soak.ts";
import { parseWeeklyMutants } from "../src/score/test-signal.ts";
import type { Hunk, ImageInfo, SideCapture } from "../src/types.ts";
import { manifest, staticSide, vulns, withStatic } from "./support/image-static.ts";

const ROOT = resolve(import.meta.dirname, "..");
const hunk = (artefact: string, scope: string, over: Partial<Hunk> = {}): Hunk => ({ id: `${artefact}-${scope}`, artefact: artefact as Hunk["artefact"], scope, summary: `${scope}`, severity: "fail", ...over });

describe("a planted mutant per policy check", () => {
  it("mutants.yaml plants one fault for each check of the policy family, each built as its kind says", () => {
    const byCheck = Object.fromEntries(loadMutants().filter((m) => ["image-hardening", "vuln-ceiling", "build-provenance"].some((c) => m.expect.includes(c as never))).map((m) => [m.expect[0], `${m.name}:${m.kind}`]));
    expect(byCheck).toEqual({ "image-hardening": "secret-env:planted-secret", "vuln-ceiling": "vulnerable-package:planted-vuln", "build-provenance": "unsigned-build:unsigned" });
    expect(readFileSync(resolve(ROOT, "mutants/Dockerfile.planted-secret"), "utf8")).toMatch(/^ENV HARNESS_PLANTED_API_TOKEN=/m);
    expect(readFileSync(resolve(ROOT, "mutants/Dockerfile.planted-vuln"), "utf8")).toMatch(/^COPY planted-vuln\/ \/opt\/harness-planted-vuln\/node_modules\/$/m);
    expect(JSON.parse(readFileSync(resolve(ROOT, "mutants/planted-vuln/ejs/package.json"), "utf8"))).toMatchObject({ name: "ejs", version: "3.1.6" });
  });

  it("builds planted-secret and planted-vuln from their Dockerfiles, and unsigned as a docker tag of the base, byte for byte", () => {
    const calls: string[][] = [];
    const exec: Exec = (cmd, args) => (calls.push([cmd, ...args]), { status: 0, stdout: "", stderr: "" });
    const ctx = { exec, files: { write: () => "/tmp/x" }, mutantsDir: "/repo/mutants", altBase: DEFAULT_ALT_BASE, log: () => {} };
    const base = "quay.io/tutors-sdk/tutors-reader:16.2.2";
    buildMutantImage({ name: "secret-env", kind: "planted-secret" }, base, "m1", ctx);
    buildMutantImage({ name: "vulnerable-package", kind: "planted-vuln" }, base, "m2", ctx);
    buildMutantImage({ name: "unsigned-build", kind: "unsigned" }, base, "m3", ctx);
    expect(calls).toEqual([
      ["docker", "build", "-q", "--build-arg", `BASE=${base}`, "-t", "m1", "-f", "/repo/mutants/Dockerfile.planted-secret", "/repo/mutants"],
      ["docker", "build", "-q", "--build-arg", `BASE=${base}`, "-t", "m2", "-f", "/repo/mutants/Dockerfile.planted-vuln", "/repo/mutants"],
      ["docker", "tag", base, "m3"]
    ]);
    const failing: Exec = () => ({ status: 1, stdout: "", stderr: "no such image" });
    expect(() => buildMutantImage({ name: "unsigned-build", kind: "unsigned" }, base, "m3", { ...ctx, exec: failing })).toThrow(/docker tag for mutant unsigned-build exited 1: no such image/);
  });
});

describe("build provenance on an image the run did not verify (the unsigned-build mutant's fault)", () => {
  const prov = (how: ImageInfo["provenance"]) => ({ summary: how, images: Object.fromEntries(["reader", "catalogue", "live", "time"].map((app) => [app, { ref: `r/${app}`, provenance: how }])) as never });
  const side = (name: "a" | "b", how: ImageInfo["provenance"]): SideCapture => {
    const s = staticSide({ manifest: manifest({ healthcheck: "CMD x", secretEnv: [], secretHistory: [] }), vulns: vulns({}) });
    for (const app of Object.keys(s) as (keyof typeof s)[]) s[app]!.buildProvenance = how === "pulled+verified" ? { ok: true, data: { identity: "i", statements: [] } } : { ok: false, reason: `is ${how}` };
    return { ...withStatic(name, s), provenance: prov(how) };
  };

  it("a local, unsigned or built-from-ref b is a finding, new on b beside a verified production that has no SLSA either", () => {
    for (const how of ["local", "pulled-unverified", "built-from-ref"] as const) {
      const h = policy(side("a", "pulled+verified"), side("b", how)).filter((x) => x.artefact === "build-provenance");
      expect(h.map((x) => `${x.scope} ${x.severity}`), how).toEqual(["reader/unverified fail", "catalogue/unverified fail", "live/unverified fail", "time/unverified fail"]);
      expect(h[0]!.summary).toContain("not pulled and signature-verified in this run, so it carries no verified SLSA provenance (new on b)");
    }
  });

  it("a cached image was verified when pulled: it stays not evaluated, never a finding", () => {
    const h = policy(side("a", "pulled+verified"), side("b", "cached")).filter((x) => x.artefact === "build-provenance");
    expect(h.every((x) => x.scope.endsWith("/not-evaluated") && x.severity === "info")).toBe(true);
  });

  it("the A/A on two local images reports it on both sides: production too", () => {
    const h = policy(side("a", "local"), side("b", "local")).filter((x) => x.artefact === "build-provenance");
    expect(h[0]!.summary).toMatch(/\(production too\)$/);
  });
});

describe("judging a mutant", () => {
  const informing = (artefact: string, scope: string) => hunk(artefact, scope, { severity: "info", level: "informing" });
  const base = informingKeys([informing("image-hardening", "reader/healthcheck"), informing("build-provenance", "reader/slsa"), hunk("dom", "x", { severity: "info" })]);

  it("a blocking engine catches as it always has: FAIL, attributed by an unclaimed hunk of the expected artefact", () => {
    expect(judgeMutant({ expect: ["headers"] }, "fail", [hunk("headers", "reader:/")], [], base)).toEqual({ caught: true, attributed: true, byInforming: false, artefacts: ["headers"] });
    expect(judgeMutant({ expect: ["headers"] }, "pass", [], [], base)).toMatchObject({ caught: false, attributed: false });
  });

  it("an informing check catches a finding the base did not have, and never one production already has", () => {
    const run = [informing("image-hardening", "reader/healthcheck"), informing("build-provenance", "reader/slsa"), informing("build-provenance", "reader/unverified")];
    expect(judgeMutant({ expect: ["build-provenance"] }, "pass", [], run, base)).toEqual({ caught: true, attributed: true, byInforming: true, artefacts: ["build-provenance (informing)"] });
    expect(judgeMutant({ expect: ["image-hardening"] }, "pass", [], run, base)).toMatchObject({ caught: false, attributed: false });
  });

  it("a mutant both FAILs a blocking engine and trips its informing check: caught, and not 'by informing' when its own artefact is unclaimed", () => {
    const run = [informing("image-hardening", "reader/env/HARNESS_PLANTED_API_TOKEN")];
    expect(judgeMutant({ expect: ["image-hardening"] }, "fail", [hunk("image-manifest", "reader/env")], run, base)).toEqual({ caught: true, attributed: true, byInforming: true, artefacts: ["image-manifest", "image-hardening (informing)"] });
    // once the check is blocking, the same mutant is caught the ordinary way
    expect(judgeMutant({ expect: ["image-hardening"] }, "fail", [hunk("image-hardening", "reader/env/HARNESS_PLANTED_API_TOKEN")], [], base)).toMatchObject({ caught: true, attributed: true, byInforming: false });
  });

  it("the weekly record keeps which mutants were planted and which escaped", () => {
    const [m] = parseWeeklyMutants(`${JSON.stringify({ ranAt: "2026-10-05T03:41:00Z", caught: 12, total: 13, escaped: ["unsigned-build"], planted: ["a", "unsigned-build"] })}\n`);
    expect(m).toMatchObject({ escaped: ["unsigned-build"], planted: ["a", "unsigned-build"] });
  });
});

describe("the soak count", () => {
  const NOW = new Date("2026-10-08T12:00:00Z");
  const night = (n: string, state: string, ids: string[] = []) => ({ night: n, state: state as never, forecasts: ids.map((id) => ({ id }) as never) });
  const aa = (n: string, hunks = 0, degraded: string[] = []): AaNight => ({ ranAt: `${n}T08:40:00Z`, hunks, degraded });

  it("counts clean nights from its first night, pauses on unchanged ones, starts again on a broken one, and waits on tonight", () => {
    const nights = [
      night("2026-10-08", "not yet"),
      night("2026-10-07", "judged", ["f7"]),
      night("2026-10-06", "unchanged"),
      night("2026-10-05", "judged", ["f5"]),
      night("2026-10-04", "judged", ["f4"]),
      night("2026-10-03", "judged", ["f3"]),
      night("2026-10-02", "judged", ["f2"]),
      night("2026-10-01", "judged", ["f1"])
    ];
    const facts = { f1: { ranAt: "", a2Hunks: 0 }, f2: { ranAt: "", a2Hunks: 0 }, f3: { ranAt: "", a2Hunks: 2 }, f4: { ranAt: "", a2Hunks: 0 }, f5: { ranAt: "", a2Hunks: 0 }, f7: { ranAt: "", a2Hunks: 0 } };
    const s = buildSoak({ now: NOW, nights, facts, aa: ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07"].map((n) => aa(n)), planted: {}, from: "2026-10-02" });
    expect(s.nights.map((n) => `${n.night} ${n.state} ${n.streak}`)).toEqual(["2026-10-08 not yet 3", "2026-10-07 clean 3", "2026-10-06 paused 2", "2026-10-05 clean 2", "2026-10-04 clean 1", "2026-10-03 broken 0", "2026-10-02 clean 1"]);
    expect(s).toMatchObject({ clean: 3, met: false, brokenOn: "2026-10-03", target: SOAK_TARGET });
    expect(s.headline).toBe("3 of 10 clean nights since 2026-10-03 broke the run; 7 more clean nights at the earliest.");
    expect(s.nights.find((n) => n.night === "2026-10-03")!.note).toBe("A/A clean; a-to-a2 2 differences.");
  });

  it("an unclean, degraded or missing A/A breaks it, and so does a forecast that ran without a2 or a night Main to RC did not judge", () => {
    const cases: [string, ReturnType<typeof night>, AaNight[], Record<string, { ranAt: string; a2Hunks?: number }>][] = [
      ["A/A 1 difference", night("2026-10-05", "judged", ["f"]), [aa("2026-10-05", 1)], { f: { ranAt: "", a2Hunks: 0 } }],
      ["A/A on weak evidence", night("2026-10-05", "judged", ["f"]), [aa("2026-10-05", 0, ["pulled unverified"])], { f: { ranAt: "", a2Hunks: 0 } }],
      ["no A/A", night("2026-10-05", "judged", ["f"]), [], { f: { ranAt: "", a2Hunks: 0 } }],
      ["the forecast ran without a2", night("2026-10-05", "judged", ["f"]), [aa("2026-10-05")], { f: { ranAt: "" } }],
      ["Main to RC not judged", night("2026-10-05", "not judged"), [aa("2026-10-05")], {}],
      ["Main to RC did not run", night("2026-10-05", "did not run"), [aa("2026-10-05")], {}]
    ];
    for (const [words, n, aas, facts] of cases) {
      const s = buildSoak({ now: NOW, nights: [n], facts, aa: aas, planted: {}, from: "2026-10-02" });
      expect(s.nights[0], words).toMatchObject({ state: "broken", streak: 0 });
      expect(s.nights[0]!.note, words).toContain(words);
    }
  });

  it("ten clean nights in a row meet it; nights before its first night are not counted", () => {
    const days = Array.from({ length: 12 }, (_, i) => new Date(Date.parse("2026-10-01T00:00:00Z") + i * 86_400_000).toISOString().slice(0, 10)).reverse();
    const s = buildSoak({ now: new Date("2026-10-12T23:00:00Z"), nights: days.map((d) => night(d, "judged", [d])), facts: Object.fromEntries(days.map((d) => [d, { ranAt: "", a2Hunks: 0 }])), aa: days.map((d) => aa(d)), planted: {} });
    expect(SOAK_FROM).toBe("2026-10-02");
    expect(s.nights.at(-1)!.night).toBe("2026-10-02");
    expect(s).toMatchObject({ clean: 11, met: true });
    expect(s.headline).toBe("11 clean nights in a row: the soak's first condition is met.");
  });

  it("per check: quiet nights, what it found, its planted mutant, and whether it may become blocking", () => {
    const nights = [night("2026-10-04", "judged", ["f4"]), night("2026-10-03", "judged", ["f3"]), night("2026-10-02", "judged", ["f2"])];
    const quiet = { findings: 0, productionToo: 0 };
    const facts = {
      f4: { ranAt: "", a2Hunks: 0, policy: { "image-hardening": { findings: 4, productionToo: 4 }, "build-provenance": { findings: 4, productionToo: 4 }, "vuln-ceiling": quiet } },
      f3: { ranAt: "", a2Hunks: 0, policy: { "image-hardening": quiet, "build-provenance": quiet, "vuln-ceiling": quiet } },
      f2: { ranAt: "", a2Hunks: 0, policy: { "image-hardening": quiet, "build-provenance": quiet, "vuln-ceiling": quiet } }
    };
    const mutants = parseWeeklyMutants(`${JSON.stringify({ ranAt: "2026-10-03T03:41:00Z", caught: 12, total: 13, escaped: ["unsigned-build"], planted: ["secret-env", "vulnerable-package", "unsigned-build"], runUrl: "https://github.com/o/r/actions/runs/7" })}\n`);
    const s = buildSoak({ now: new Date("2026-10-04T20:00:00Z"), nights, facts, aa: [], mutants, planted: { "image-hardening": ["secret-env"], "vuln-ceiling": ["vulnerable-package"], "build-provenance": ["unsigned-build"] }, target: 2 });
    const by = Object.fromEntries(s.checks.map((c) => [c.check, c]));
    expect(by["image-hardening"]).toMatchObject({ level: "informing", quietNights: 0, lastFinding: { night: "2026-10-04", findings: 4, productionToo: 4 }, mutant: { state: "caught", runUrl: "https://github.com/o/r/actions/runs/7" }, eligible: false });
    expect(by["image-hardening"]!.why).toContain("Fires every night on production too (4 findings)");
    expect(by["build-provenance"]).toMatchObject({ mutant: { state: "escaped" }, eligible: false });
    expect(by["vuln-ceiling"]).toMatchObject({ quietNights: 3, mutant: { state: "caught" }, eligible: true });
    expect(by["vuln-ceiling"]!.why).toBe("Quiet for 3 judged nights and its planted mutant is caught: it may become blocking at 2.0.");
    expect(s.mutants).toMatchObject({ caught: 12, total: 13 });
    // a self-test that did not plant it says so
    expect(buildSoak({ now: NOW, nights: [], facts: {}, aa: [], mutants: parseWeeklyMutants(`${JSON.stringify({ ranAt: "2026-10-01T03:00:00Z", caught: 10, total: 10 })}\n`), planted: { "vuln-ceiling": ["vulnerable-package"] } }).checks.find((c) => c.check === "vuln-ceiling")!.mutant.state).toBe("not run yet");
  });

  it("reads each policy check's findings from a kept report: informing or failing, unclaimed, and how many production has too", () => {
    const m = (h: Partial<Hunk>, claim?: unknown) => ({ hunk: { ...hunk("image-hardening", "reader/healthcheck"), ...h }, ...(claim ? { claim } : {}) });
    expect(
      policyFacts([
        m({ severity: "info", level: "informing", summary: "reader: declares no HEALTHCHECK (production too)" }),
        m({ severity: "info", level: "informing", summary: "reader: env (new on b)" }),
        m({ severity: "info", level: "informing", summary: "claimed" }, { id: "c" }),
        m({ severity: "info", summary: "reader: holds" }),
        m({ artefact: "vuln-ceiling", severity: "fail", summary: "GHSA (new on b)" }),
        m({ artefact: "dom", severity: "fail" }),
        m({ artefact: "timing-tolerance", scope: "reader:home", severity: "info", level: "informing", summary: "reader:home TTFB slower on b beyond the 10% tolerance" })
      ])
    ).toEqual({ "image-hardening": { findings: 2, productionToo: 1 }, "build-provenance": { findings: 0, productionToo: 0 }, "vuln-ceiling": { findings: 1, productionToo: 0 }, "timing-tolerance": { findings: 1, productionToo: 0 }, "asset-graph": { findings: 0, productionToo: 0 }, replay: { findings: 0, productionToo: 0 } });
  });

  it("watches every check that ships informing: the policy family, the timing tolerance (since 1.26.0), asset-graph folding (since 1.27.0), the replay set (since 1.28.0)", () => {
    expect(SOAK_CHECKS).toEqual(["image-hardening", "build-provenance", "vuln-ceiling", "timing-tolerance", "asset-graph", "replay"]);
  });
});

describe("the soak on the readiness page", () => {
  const run = (createdAt: string, conclusion: string, id: number): WorkflowRun => ({ id, event: "workflow_run", conclusion, createdAt, startedAt: createdAt, updatedAt: createdAt, url: `https://github.com/o/r/actions/runs/${id}`, headSha: "h" });
  const kept = (ranAt: string, o: Partial<KeptForecast> = {}): KeptForecast => ({ id: `${ranAt.replace(/[:.]/g, "-")}-release`, ranAt, verdict: "fail", harnessVersion: "1.25.0", sides: { a: { reader: "r:16.2.2" }, b: { reader: "r:sha-1234567" } }, gate: "FAIL", files: [], unclaimed: 3, ...o });

  it("reaches back past the ten nights to the soak's first night, and leads with the count", () => {
    const now = new Date("2026-10-15T12:00:00Z");
    const forecasts = Array.from({ length: 14 }, (_, i) => kept(new Date(Date.parse("2026-10-02T08:50:00Z") + i * 86_400_000).toISOString(), { a2Hunks: 0 }));
    const aa = forecasts.map((f) => ({ ranAt: f.ranAt.replace("08:50", "08:30"), hunks: 0, degraded: [] }));
    const r = buildReadiness({ now, harness: "1.25.0", forecasts, workflowRuns: forecasts.map((f, i) => run(f.ranAt, "success", i)), github: "read", aa, aaSource: "read", planted: {} });
    expect(r.nights).toHaveLength(10);
    expect(r.soak).toMatchObject({ clean: 14, met: true });
    expect(r.soak.nights.at(-1)!.night).toBe("2026-10-02");
    const html = renderReadiness(r);
    expect(html).toContain('<h2 id="soak-title">Soak toward 2.0: 14 of 10 clean nights</h2>');
    expect(html).toContain('<a href="#soak">soak toward 2.0</a>');
    expect(html).toContain("A/A history: read.");
  });

  it("without the A/A history no night can be counted, and the page says so", () => {
    const r = buildReadiness({ now: new Date("2026-10-04T12:00:00Z"), harness: "1.25.0", forecasts: [kept("2026-10-03T08:50:00Z", { a2Hunks: 0 })], workflowRuns: [], github: "read" });
    expect(r.soak.nights.find((n) => n.night === "2026-10-03")).toMatchObject({ state: "broken", note: expect.stringContaining("noise-history.json") });
    expect(r.sources.aa).toBe("not read");
  });
});

describe("Main to RC measures a2 every night", () => {
  const wf = parse(readFileSync(resolve(ROOT, ".github/workflows/main-preview.yml"), "utf8")) as { on: { workflow_dispatch: { inputs: Record<string, { default?: unknown }> } }; jobs: Record<string, { steps: { name?: string; env?: Record<string, string> }[] }> };
  it("the dispatch input defaults to on, and a night (workflow_run, no inputs) always passes --a2", () => {
    expect(wf.on.workflow_dispatch.inputs.a2!.default).toBe(true);
    const step = Object.values(wf.jobs).flatMap((j) => j.steps ?? []).find((s) => s.name === "Release mode")!;
    expect(step.env!.A2).toBe("${{ (github.event_name != 'workflow_dispatch' || inputs.a2) && 'yes' || '' }}");
  });
});
