/**
 * One convention for "not collected" (src/not-collected.ts): the text, the hunk's scope, one severity rule and one
 * switch for requiring an artefact. The per-artefact behaviour (what a missing SBOM or a missing container says) is
 * in image-static.test.ts, runtime-engines.test.ts and bus.test.ts; this holds them to the same rule.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { bus } from "../src/compare/extra.ts";
import { imageStatic } from "../src/compare/image-static.ts";
import { runtime, startup } from "../src/compare/runtime.ts";
import { DEFAULT_MASKS_FILE, loadMasks } from "../src/normalise/masks.ts";
import { COLLECTED_ARTEFACTS, DEFAULT_REQUIRED, RequirementError, notCollectedHunk, notCollectedLines, notCollectedScope, notCollectedSeverity, notCollectedText, requirements } from "../src/not-collected.ts";
import type { Hunk, SideCapture } from "../src/types.ts";
import { capture } from "./support/captures.ts";
import { sideWithRuntime, startupCapture } from "./support/runtime.ts";
import { staticSide, withStatic } from "./support/image-static.ts";

const ROOT = resolve(import.meta.dirname, "..");
const masks = loadMasks(DEFAULT_MASKS_FILE);
const ctx = { config: masks };

afterEach(() => {
  delete process.env.HARNESS_REQUIRE_ARTEFACTS;
  delete process.env.HARNESS_REQUIRE_STATIC;
});

describe("the text", () => {
  it("is NOT COLLECTED: <what>[ of <subject>][ on side <a|b>|on both sides]: <reason>", () => {
    expect(notCollectedText({ what: "sbom", subject: "reader", side: "b", reason: "no cosign attestation" })).toBe("NOT COLLECTED: sbom of reader on side b: no cosign attestation");
    expect(notCollectedText({ what: "container runtime posture", side: "a", reason: "docker is not installed" })).toBe("NOT COLLECTED: container runtime posture on side a: docker is not installed");
    expect(notCollectedText({ what: "sbom", subject: "reader", side: "both", reason: "x" })).toBe("NOT COLLECTED: sbom of reader on both sides: x");
    expect(notCollectedText({ what: "bus traffic", reason: "no bus configured" })).toBe("NOT COLLECTED: bus traffic: no bus configured");
  });

  it("the scope is <subject>/not-collected", () => {
    expect(notCollectedScope("reader")).toBe("reader/not-collected");
    expect(notCollectedScope("runtime")).toBe("runtime/not-collected");
  });

  it("subjects that share a reason are one line", () => {
    expect(
      notCollectedLines([
        { what: "vulns", subject: "reader", side: "b", reason: "nothing to scan" },
        { what: "vulns", subject: "live", side: "b", reason: "nothing to scan" },
        { what: "vulns", subject: "live", side: "a", reason: "nothing to scan" },
        { what: "sbom", subject: "live", side: "b", reason: "other" }
      ])
    ).toEqual(["NOT COLLECTED: vulns of reader, live on side b: nothing to scan", "NOT COLLECTED: vulns of live on side a: nothing to scan", "NOT COLLECTED: sbom of live on side b: other"]);
  });
});

describe("what is required", () => {
  it("runtime and startup by default (their collectors run against the harness's own stacks: a gap is a fault); nothing else", () => {
    expect([...requirements({}).required].sort()).toEqual([...DEFAULT_REQUIRED].sort());
    expect([...requirements({}).fromEnv]).toEqual([]);
  });

  it("HARNESS_REQUIRE_ARTEFACTS adds artefacts by name, `static`, or `all`, comma or space separated, any case", () => {
    expect(requirements({ HARNESS_REQUIRE_ARTEFACTS: "sbom" }).required.has("sbom")).toBe(true);
    expect(requirements({ HARNESS_REQUIRE_ARTEFACTS: "sbom" }).required.has("vulns")).toBe(false);
    expect([...requirements({ HARNESS_REQUIRE_ARTEFACTS: "static" }).fromEnv].sort()).toEqual(["image-manifest", "sbom", "vulns"]);
    expect([...requirements({ HARNESS_REQUIRE_ARTEFACTS: "SBOM, bus" }).fromEnv].sort()).toEqual(["bus", "sbom"]);
    expect([...requirements({ HARNESS_REQUIRE_ARTEFACTS: "all" }).required].sort()).toEqual([...COLLECTED_ARTEFACTS].sort());
  });

  it("HARNESS_REQUIRE_STATIC stays as an alias for `static`, and both together add up: neither can loosen the other", () => {
    for (const on of ["1", "true", "yes", "YES"]) expect([...requirements({ HARNESS_REQUIRE_STATIC: on }).fromEnv].sort(), on).toEqual(["image-manifest", "sbom", "vulns"]);
    for (const off of ["", "0", "no", "false"]) expect([...requirements({ HARNESS_REQUIRE_STATIC: off }).fromEnv], off).toEqual([]);
    expect([...requirements({ HARNESS_REQUIRE_STATIC: "1", HARNESS_REQUIRE_ARTEFACTS: "bus" }).fromEnv].sort()).toEqual(["bus", "image-manifest", "sbom", "vulns"]);
  });

  it("a name it does not know is an error, not a silent 'requires nothing'", () => {
    expect(() => requirements({ HARNESS_REQUIRE_ARTEFACTS: "sbon" })).toThrow(RequirementError);
    expect(() => requirements({ HARNESS_REQUIRE_ARTEFACTS: "sbom,dom" })).toThrow(/"dom" is not one/);
  });
});

describe("the severity rule", () => {
  it("informational unless required; failing when required; informational when the operator switched it off", () => {
    expect(notCollectedSeverity("sbom", {}, {})).toBe("info");
    expect(notCollectedSeverity("bus", {}, {})).toBe("info");
    expect(notCollectedSeverity("runtime", {}, {})).toBe("fail");
    expect(notCollectedSeverity("startup", {}, {})).toBe("fail");
    expect(notCollectedSeverity("sbom", {}, { HARNESS_REQUIRE_ARTEFACTS: "sbom" })).toBe("fail");
    expect(notCollectedSeverity("vulns", {}, { HARNESS_REQUIRE_ARTEFACTS: "sbom" })).toBe("info");
    expect(notCollectedSeverity("runtime", { disabled: true }, {})).toBe("info");
    expect(notCollectedSeverity("runtime", { disabled: true }, { HARNESS_REQUIRE_ARTEFACTS: "all" })).toBe("info");
  });

  it("a required gap says who required it; a default one does not need to", () => {
    const gap = { artefact: "sbom" as const, scopeSubject: "reader", what: "sbom", subject: "reader", side: "b" as const, reason: "r" };
    expect(notCollectedHunk(gap, {})).toMatchObject({ artefact: "sbom", scope: "reader/not-collected", severity: "info", summary: "NOT COLLECTED: sbom of reader on side b: r" });
    expect(notCollectedHunk(gap, { HARNESS_REQUIRE_STATIC: "1" }).summary).toBe("NOT COLLECTED: sbom of reader on side b: r (required by HARNESS_REQUIRE_ARTEFACTS)");
    expect(notCollectedHunk({ ...gap, artefact: "runtime", scopeSubject: "reader" }, {})).toMatchObject({ severity: "fail", summary: "NOT COLLECTED: sbom of reader on side b: r" });
  });
});

describe("every artefact through its own engine", () => {
  const missingSbom = () => {
    const s = staticSide();
    s.reader.sbom = { ok: false, reason: "reader is local, not a pulled image" };
    return s;
  };
  const staticGaps = () => imageStatic(withStatic("a", staticSide()), withStatic("b", missingSbom()), ctx).filter((h) => h.scope.endsWith("/not-collected"));
  const runtimeGap = (): Hunk[] => runtime(sideWithRuntime("a"), sideWithRuntime("b", { runtime: { collected: false, reason: "docker is not installed" } }), ctx);
  const startupGap = (): Hunk[] => startup(sideWithRuntime("a"), sideWithRuntime("b", { startup: { collected: false, reason: "no running container" } }), ctx);
  const busGap = (): Hunk[] => bus({ ...capture("a"), bus: { collected: false, reason: "no bus configured" } } as SideCapture, { ...capture("b"), bus: { collected: false, reason: "no bus configured" } } as SideCapture, ctx);

  it("all say NOT COLLECTED: and use a <subject>/not-collected scope", () => {
    process.env.HARNESS_REQUIRE_ARTEFACTS = "all";
    const all = [...staticGaps(), ...runtimeGap().filter((h) => h.scope.endsWith("/not-collected")), ...startupGap().filter((h) => h.scope.endsWith("/not-collected")), ...busGap()];
    expect(all.map((h) => `${h.artefact}:${h.scope}`).sort()).toEqual(["bus:bus/not-collected", "runtime:runtime/not-collected", "sbom:reader/not-collected", "startup:startup/not-collected"]);
    for (const h of all) expect(h.summary, h.artefact).toMatch(/^NOT COLLECTED: /);
  });

  it("with nothing set: the static gap informs, the runtime and startup gaps fail (as in 1.2.0 and 1.3.0), and the bus gap makes no hunk, so a report with no bus is what it was", () => {
    expect(staticGaps().map((h) => h.severity)).toEqual(["info"]);
    expect(runtimeGap().filter((h) => h.scope === "runtime/not-collected").map((h) => h.severity)).toEqual(["fail"]);
    expect(startupGap().filter((h) => h.scope === "startup/not-collected").map((h) => h.severity)).toEqual(["fail"]);
    expect(busGap()).toEqual([]);
  });

  it("HARNESS_REQUIRE_ARTEFACTS=sbom, and its alias HARNESS_REQUIRE_STATIC=1, fail the static gap; =bus fails the bus gap, against a stack but not against a live deployment", () => {
    process.env.HARNESS_REQUIRE_ARTEFACTS = "sbom";
    expect(staticGaps().map((h) => h.severity)).toEqual(["fail"]);
    delete process.env.HARNESS_REQUIRE_ARTEFACTS;
    process.env.HARNESS_REQUIRE_STATIC = "1";
    expect(staticGaps().map((h) => h.severity)).toEqual(["fail"]);
    delete process.env.HARNESS_REQUIRE_STATIC;
    process.env.HARNESS_REQUIRE_ARTEFACTS = "bus";
    expect(busGap().map((h) => `${h.scope}:${h.severity}:${h.summary}`)).toEqual(["bus/not-collected:fail:NOT COLLECTED: bus traffic on both sides: no bus configured (required by HARNESS_REQUIRE_ARTEFACTS)"]);
    const live = { ...capture("b"), external: true, bus: { collected: false, reason: "external deployment" } } as SideCapture;
    expect(bus({ ...capture("a"), bus: { collected: false, reason: "no bus configured" } } as SideCapture, live, ctx)).toEqual([]);
  });

  it("an operator's switch-off stays informational, even with everything required", () => {
    process.env.HARNESS_REQUIRE_ARTEFACTS = "all";
    const off = { collected: false as const, disabled: true, reason: "switched off with --no-runtime" };
    const hunks = runtime(sideWithRuntime("a", { runtime: off }), sideWithRuntime("b", { runtime: off }), ctx);
    expect(hunks.every((h) => h.severity === "info")).toBe(true);
    const restarts = startup(sideWithRuntime("a", { startup: { ...off, reason: "switched off with --startup-restarts 0" } }), sideWithRuntime("b", { startup: startupCapture() }), ctx);
    expect(restarts.filter((h) => h.scope === "startup/not-collected").map((h) => h.severity)).toEqual(["info"]);
  });
});

describe("through the process", () => {
  const harness = (args: string[], env: NodeJS.ProcessEnv) => spawnSync(process.execPath, ["--import", "tsx", resolve(ROOT, "src/cli.ts"), ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });

  it("a HARNESS_REQUIRE_ARTEFACTS that names no artefact is refused, before anything runs, with a message and exit 2", () => {
    const r = harness(["run", "--mode", "noise", "--a", "x", "--b", "x"], { HARNESS_REQUIRE_ARTEFACTS: "sbon" });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/HARNESS_REQUIRE_ARTEFACTS takes artefact names.*"sbon" is not one/);
    expect(r.stderr).not.toContain("    at ");
  });

  it("commands that never compare are not held up by it", () => {
    expect(harness(["version"], { HARNESS_REQUIRE_ARTEFACTS: "sbon" }).status).toBe(0);
  });
});
