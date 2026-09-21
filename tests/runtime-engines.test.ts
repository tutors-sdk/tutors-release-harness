import { describe, expect, it } from "vitest";
import { matchClaims } from "../src/claims/matcher.ts";
import { parseClaims } from "../src/claims/schema.ts";
import { compareCaptures } from "../src/compare/index.ts";
import { DEFAULT_MASKS_FILE, loadMasks, normalise } from "../src/normalise/masks.ts";
import type { Hunk, SideCapture } from "../src/types.ts";
import { capture } from "./support/captures.ts";
import { STEADY, posture, runtimeCapture, sample, sideWithRuntime, startupCapture } from "./support/runtime.ts";

const masks = loadMasks(DEFAULT_MASKS_FILE);
const diff = (a: SideCapture, b: SideCapture): Hunk[] => compareCaptures(normalise(a, masks).capture, normalise(b, masks).capture, masks);
const of = (hunks: Hunk[], artefact: "runtime" | "startup") => hunks.filter((h) => h.artefact === artefact);
const failing = (hunks: Hunk[]) => hunks.filter((h) => h.severity === "fail");

describe("runtime posture", () => {
  it("A/A: identical postures produce no failing hunk, and one informational summary that shows what was looked at", () => {
    const hunks = of(diff(sideWithRuntime("a"), sideWithRuntime("b")), "runtime");
    expect(failing(hunks)).toEqual([]);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ scope: "runtime/summary", severity: "info" });
    expect(hunks[0]!.summary).toContain("catalogue, live, reader");
    expect(hunks[0]!.detail).toContain("uid 1001:0");
  });

  it("a candidate that runs as root is a failing hunk for the field and says so", () => {
    const b = sideWithRuntime("b", { runtime: runtimeCapture({ reader: posture({ effective: { ...posture().effective, uid: 0, gid: 0 } }) }) });
    const hunks = failing(diff(sideWithRuntime("a"), b));
    expect(hunks.map((h) => h.scope)).toEqual(["reader/uid"]);
    expect(hunks[0]!.summary).toBe("reader: effective UID 1001 on a, 0 on b; b runs as root (UID 0)");
  });

  it("each planted change lands on its own scope: image USER, a capability, a writable root, a VOLUME, a new limit, no-new-privileges dropped", () => {
    const changed = posture({
      user: "0",
      capAdd: ["NET_BIND_SERVICE"],
      readOnlyRootfs: false,
      writablePaths: ["/data", "/tmp"],
      securityOpt: [],
      resources: { memoryRequest: null, memoryLimit: 402_653_184, cpuRequest: null, cpuLimit: null, pidsLimit: null },
      effective: { ...posture().effective, capEff: ["NET_BIND_SERVICE"], noNewPrivs: false, rootfsReadOnly: false, cwdWritable: true }
    });
    const hunks = failing(diff(sideWithRuntime("a"), sideWithRuntime("b", { runtime: runtimeCapture({ live: changed }) })));
    expect(hunks.map((h) => h.scope).sort()).toEqual(
      ["live/user", "live/read-only-rootfs", "live/cap-add", "live/security-opt", "live/writable-paths", "live/memory-limit", "live/cap-effective", "live/no-new-privileges", "live/rootfs-mounted-ro", "live/cwd-writable"].sort()
    );
    expect(hunks.find((h) => h.scope === "live/rootfs-mounted-ro")!.summary).toContain("b has a writable root filesystem");
    expect(hunks.find((h) => h.scope === "live/writable-paths")!.summary).toBe("live: writable mounts /tmp on a, /data,/tmp on b");
  });

  it("the time app is judged like the others: a candidate whose time runs as root fails on time, and only time (and the summary names it)", () => {
    expect(of(diff(sideWithRuntime("a"), sideWithRuntime("b")), "runtime")[0]!.summary).toContain("catalogue, live, reader, time");
    const b = sideWithRuntime("b", { runtime: runtimeCapture({ time: posture({ effective: { ...posture().effective, uid: 0, gid: 0 } }) }) });
    const hunks = failing(diff(sideWithRuntime("a"), b));
    expect(hunks.map((h) => h.scope)).toEqual(["time/uid"]);
    expect(hunks[0]!.summary).toBe("time: effective UID 1001 on a, 0 on b; b runs as root (UID 0)");
  });

  it("an app that starts writing outside /tmp is caught through the read-only filesystem errors it logs", () => {
    const b = sideWithRuntime("b", { runtime: runtimeCapture({ reader: posture({ readOnlyViolations: 3 }) }) });
    const hunks = failing(diff(sideWithRuntime("a"), b));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "runtime", scope: "reader/writes-outside-tmp" });
    expect(hunks[0]!.summary).toContain("now writes outside /tmp");
  });

  it("must not flag: a tightening is informational, and so is a fault both sides share", () => {
    const rootA = posture({ effective: { ...posture().effective, uid: 0 }, capDrop: [], privileged: false });
    const tighter = diff(sideWithRuntime("a", { runtime: runtimeCapture({ reader: rootA }) }), sideWithRuntime("b"));
    expect(failing(of(tighter, "runtime"))).toEqual([]);
    const uid = tighter.find((h) => h.scope === "reader/uid")!;
    expect(uid).toMatchObject({ severity: "info" });
    expect(uid.summary).toContain("(tightened)");
    expect(tighter.find((h) => h.scope === "reader/cap-drop")).toMatchObject({ severity: "info" });

    const bothRoot = posture({ effective: { ...posture().effective, uid: 0 } });
    const shared = diff(sideWithRuntime("a", { runtime: runtimeCapture({ reader: bothRoot }) }), sideWithRuntime("b", { runtime: runtimeCapture({ reader: bothRoot }) }));
    expect(failing(shared)).toEqual([]);
    expect(shared.find((h) => h.scope === "reader/uid")!.summary).toContain("product finding");

    // The same errors on both sides are the app's, not the release's, and the count is not compared: retries vary.
    const noisy = (n: number) => sideWithRuntime("a", { runtime: runtimeCapture({ live: posture({ readOnlyViolations: n }) }) });
    expect(failing(diff(noisy(2), noisy(5)))).toEqual([]);
  });

  it("must not flag: order of capabilities and mounts, a side the harness did not start, a capture from before 1.2.0", () => {
    const shuffled = posture({ capDrop: ["ALL"], writablePaths: ["/tmp"] });
    expect(failing(diff(sideWithRuntime("a"), sideWithRuntime("b", { runtime: runtimeCapture({ reader: shuffled }) })))).toEqual([]);
    const live = { ...sideWithRuntime("b"), external: true };
    expect(diff(sideWithRuntime("a"), live).filter((h) => h.artefact === "runtime" || h.artefact === "startup")).toEqual([]);
    expect(diff(capture("a"), capture("b")).filter((h) => h.artefact === "runtime" || h.artefact === "startup")).toEqual([]);
  });

  it("degrades loudly: a container that could not be inspected is a failing hunk with the reason, on either side", () => {
    const missing = runtimeCapture();
    missing.containers.catalogue = { collected: false, reason: "docker inspect exited 1: no such container" };
    const hunks = failing(diff(sideWithRuntime("a"), sideWithRuntime("b", { runtime: missing })));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "runtime", scope: "catalogue/not-collected" });
    expect(hunks[0]!.summary).toBe("NOT COLLECTED: container posture of catalogue on side b: docker inspect exited 1: no such container");
    // …and it is claimable like any other difference, which is how a human waives it, with a reason.
    const claims = parseClaims('claims:\n  - artefact: runtime\n    scope: "*/not-collected"\n    reason: "docker inspect is unavailable on this runner, see #12"\n');
    const matched = matchClaims(compareCaptures(normalise(sideWithRuntime("a"), masks).capture, normalise(sideWithRuntime("b", { runtime: missing }), masks).capture, masks), claims);
    expect(matched.unclaimed).toEqual([]);
  });

  it("degrades loudly: a whole artefact that could not be collected fails; switched off by an operator it is information", () => {
    const b = sideWithRuntime("b", { runtime: { collected: false, reason: "docker is not installed or not on PATH" } });
    const hunks = diff(sideWithRuntime("a"), b);
    expect(failing(of(hunks, "runtime")).map((h) => h.summary)).toEqual(["NOT COLLECTED: container runtime posture on side b: docker is not installed or not on PATH"]);
    const off = { collected: false as const, disabled: true, reason: "switched off with --no-runtime" };
    const quiet = of(diff(sideWithRuntime("a", { runtime: off }), sideWithRuntime("b", { runtime: off })), "runtime");
    expect(failing(quiet)).toEqual([]);
    expect(quiet.map((h) => h.summary)).toEqual(["NOT COLLECTED: container runtime posture on side a: switched off with --no-runtime", "NOT COLLECTED: container runtime posture on side b: switched off with --no-runtime"]);
  });

  it("against a capture that predates the artefact, the newer side counts as unmatched, not as a pass", () => {
    const hunks = failing(diff(capture("a"), sideWithRuntime("b")));
    expect(hunks.map((h) => h.summary)).toEqual(["NOT COLLECTED: container runtime posture on side a: the capture was recorded by a harness older than contract 1.2.0", "NOT COLLECTED: startup time on side a: the capture was recorded by a harness older than contract 1.2.0"]);
  });
});

describe("startup", () => {
  const slow = STEADY.map((s) => sample(s.rootMs! * 2, (s.readyMs ?? 0) + 1500));

  it("A/A: the same restarts on both sides produce no failing hunk and a summary with the medians", () => {
    const hunks = of(diff(sideWithRuntime("a"), sideWithRuntime("b")), "startup");
    expect(failing(hunks)).toEqual([]);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ scope: "startup/summary", severity: "info" });
    expect(hunks[0]!.detail).toContain("reader: first healthy / 1805 → 1805 ms");
  });

  it("a candidate that boots twice as slowly fails on the app and the clock that moved, with the Mann-Whitney evidence", () => {
    const b = sideWithRuntime("b", { startup: startupCapture({ reader: slow }) });
    const hunks = failing(diff(sideWithRuntime("a"), b));
    expect(hunks.map((h) => h.scope).sort()).toEqual(["reader/ready", "reader/root"]);
    const root = hunks.find((h) => h.scope === "reader/root")!;
    expect(root.summary).toMatch(/^reader: first healthy \/ slower on b: median 1805 ms → 3610 ms \(\+100%\), p=0\.\d{3}, n=5\/5$/);
  });

  it("the time app's boot is sampled and judged like the others: five restarts a side, a slower time fails on time only", () => {
    const b = sideWithRuntime("b", { startup: startupCapture({ time: slow }) });
    const hunks = failing(diff(sideWithRuntime("a"), b));
    expect(hunks.map((h) => h.scope).sort()).toEqual(["time/ready", "time/root"]);
    expect(hunks.find((h) => h.scope === "time/root")!.summary).toMatch(/^time: first healthy \/ slower on b: median 1805 ms → 3610 ms \(\+100%\), p=0\.\d{3}, n=5\/5$/);
  });

  it("a candidate that stops coming up after a restart, or answers differently, fails", () => {
    const stuck = [...STEADY.slice(0, 3), { rootMs: null, rootStatus: null, readyMs: null }, { rootMs: null, rootStatus: null, readyMs: null }];
    const hunks = failing(diff(sideWithRuntime("a"), sideWithRuntime("b", { startup: startupCapture({ live: stuck, catalogue: STEADY.map((s) => ({ ...s, rootStatus: 302 })) }) })));
    expect(hunks.map((h) => h.scope).sort()).toEqual(["catalogue/root-status", "live/boot"]);
    expect(hunks.find((h) => h.scope === "live/boot")!.summary).toBe("live: b did not become healthy within 60s in 2 of 5 restart(s) (a: 0 of 5)");
    expect(hunks.find((h) => h.scope === "catalogue/root-status")!.summary).toBe("catalogue: GET / answers 200 on a and 302 on b after a restart");
  });

  it("must not flag: a shift under the floor however significant, overlapping noise, and a faster boot", () => {
    const tiny = STEADY.map((s) => sample(s.rootMs! + 120)); // +6.6%, every sample above every a sample
    expect(failing(diff(sideWithRuntime("a"), sideWithRuntime("b", { startup: startupCapture({ reader: tiny }) })))).toEqual([]);

    const jitterA = [1500, 2600, 1700, 2500, 1900].map((ms) => sample(ms));
    const jitterB = [2400, 1600, 2700, 1800, 2200].map((ms) => sample(ms)); // median +15%, overlapping
    expect(failing(diff(sideWithRuntime("a", { startup: startupCapture({ reader: jitterA }) }), sideWithRuntime("b", { startup: startupCapture({ reader: jitterB }) })))).toEqual([]);

    const faster = diff(sideWithRuntime("a", { startup: startupCapture({ reader: slow }) }), sideWithRuntime("b"));
    expect(failing(faster)).toEqual([]);
    expect(faster.find((h) => h.scope === "reader/root")).toMatchObject({ severity: "info" });
  });

  it("too few restarts to ever reach alpha is said out loud, not judged quietly", () => {
    // A stricter alpha than the default, so that three restarts a side cannot get there whatever the exact p-value function is.
    const strict = { ...masks, timing: { ...masks.timing, alpha: 0.001 } };
    const three = (samples: typeof STEADY) => samples.slice(0, 3);
    const a = sideWithRuntime("a", { startup: startupCapture({ reader: three(STEADY) }) });
    const b = sideWithRuntime("b", { startup: startupCapture({ reader: three(slow) }) });
    const hunks = compareCaptures(normalise(a, strict).capture, normalise(b, strict).capture, strict);
    expect(failing(hunks)).toEqual([]);
    const said = hunks.find((h) => h.scope === "reader/root")!;
    expect(said.severity).toBe("info");
    expect(said.summary).toContain("cannot reach alpha 0.001 (best possible p=");
    expect(said.summary).toContain("Raise --startup-restarts");
  });

  it("three restarts a side cannot reach the default alpha of 0.05 either (best possible p = 0.081), and say so", () => {
    const three = (samples: typeof STEADY) => samples.slice(0, 3);
    const hunks = diff(sideWithRuntime("a", { startup: startupCapture({ reader: three(STEADY) }) }), sideWithRuntime("b", { startup: startupCapture({ reader: three(slow) }) }));
    expect(failing(hunks)).toEqual([]);
    expect(hunks.find((h) => h.scope === "reader/root")!.summary).toContain("3/3 samples cannot reach alpha 0.05 (best possible p=0.081). Raise --startup-restarts");
  });

  it("degrades loudly: an app that could not be restarted fails with the reason; --startup-restarts 0 is information", () => {
    const partial = startupCapture();
    partial.apps.live = { collected: false, reason: "no running container for compose service live-b in project tutors-harness" };
    const hunks = failing(diff(sideWithRuntime("a"), sideWithRuntime("b", { startup: partial })));
    expect(hunks).toHaveLength(1);
    expect(hunks[0]).toMatchObject({ artefact: "startup", scope: "live/not-collected" });
    expect(hunks[0]!.summary).toContain("NOT COLLECTED: startup time of live on side b: no running container for compose service live-b");

    const off = { collected: false as const, disabled: true, reason: "switched off with --startup-restarts 0" };
    const quiet = of(diff(sideWithRuntime("a", { startup: off }), sideWithRuntime("b", { startup: off })), "startup");
    expect(failing(quiet)).toEqual([]);
    expect(quiet).toHaveLength(2);
  });
});
