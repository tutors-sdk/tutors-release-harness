import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { Exec, ExecResult } from "../src/images.ts";
import { captureRuntime, type RuntimeDeps } from "../src/runtime/index.ts";
import { PROBE_SCRIPT, capNames, collectPosture, cpuMillis, countReadOnlyViolations, declaredFromDockerInspect, declaredFromPod, parseProbe, parseQuantity } from "../src/runtime/posture.ts";
import { collectStartup, sampleRestart } from "../src/runtime/startup.ts";
import { composeRestarter, composeTarget, kindRestarter, kindTarget, type Restarter, type StackNames } from "../src/runtime/targets.ts";
import { COMPOSE_FILE, imagesFor, sideSpec } from "../src/stack.ts";
import { kindSide, manifestsFor } from "../src/substrate/kind.ts";

const names: StackNames = { composeProject: "tutors-harness", kubeContext: "kind-tutors-harness", namespace: (side) => `harness-${side}` };
const ok = (stdout = "", stderr = ""): ExecResult => ({ status: 0, stdout, stderr });

/** A fake process runner: records every command line and answers from a table of [prefix, result] (the longest matching prefix wins). Never touches Docker. */
function fakeExec(answers: [string, ExecResult | (() => ExecResult)][]): { exec: Exec; calls: string[] } {
  const calls: string[] = [];
  const exec: Exec = (cmd, args) => {
    const line = [cmd, ...args].join(" ");
    calls.push(line);
    const hit = answers.filter(([prefix]) => line.startsWith(prefix)).sort((x, y) => y[0].length - x[0].length)[0];
    if (!hit) return { status: 1, stdout: "", stderr: `fake: unexpected command ${line}` };
    return typeof hit[1] === "function" ? hit[1]() : hit[1];
  };
  return { exec, calls };
}

// ---- what the real tools print, trimmed to the fields the collector reads ----------------------

const dockerInspect = [
  {
    Config: { User: "" },
    HostConfig: { Privileged: false, ReadonlyRootfs: true, CapAdd: null, CapDrop: ["ALL"], SecurityOpt: ["no-new-privileges:true"], Tmpfs: { "/tmp": "" }, Memory: 0, MemoryReservation: 0, NanoCpus: 0, CpuQuota: 0, CpuPeriod: 0, PidsLimit: null },
    Mounts: [
      { Type: "bind", Destination: "/harness/ca.pem", RW: false },
      { Type: "volume", Destination: "/data", RW: true }
    ]
  }
];

const status = (uid: number, capEff = "0000000000000000") => `Uid:\t${uid}\t${uid}\t${uid}\t${uid}\nGid:\t0\t0\t0\t0\nCapEff:\t${capEff}\nCapBnd:\t${capEff}\nNoNewPrivs:\t1\nSeccomp:\t2`;
const probeOutput = (over: Record<string, unknown> = {}) => JSON.stringify({ status: status(1001), root: "1123 1120 0:52 / / ro,relatime master:1 - overlay overlay rw,lowerdir=/x", tmp: true, cwd: false, ...over });

describe("parsers", () => {
  it("quantities: memory to bytes, cpu to millicores", () => {
    expect(parseQuantity("192Mi")).toBe(192 * 1024 * 1024);
    expect(parseQuantity("384Mi")).toBe(384 * 1024 * 1024);
    expect(parseQuantity("1G")).toBe(1e9);
    expect(parseQuantity(undefined)).toBeNull();
    expect(cpuMillis("100m")).toBe(100);
    expect(cpuMillis("1")).toBe(1000);
    expect(cpuMillis("0.5")).toBe(500);
  });

  it("capability masks name the bits; an empty mask is no capabilities", () => {
    expect(capNames("0000000000000000")).toEqual([]);
    expect(capNames("00000000a80425fb")).toEqual(["AUDIT_WRITE", "CHOWN", "DAC_OVERRIDE", "FOWNER", "FSETID", "KILL", "MKNOD", "NET_BIND_SERVICE", "NET_RAW", "SETFCAP", "SETGID", "SETPCAP", "SETUID", "SYS_CHROOT"]);
    expect(capNames("0000000000000400")).toEqual(["NET_BIND_SERVICE"]);
    expect(() => capNames("zz")).toThrow(/not a capability mask/);
  });

  it("the in-container probe: identity, capabilities, read-only root, writable /tmp", () => {
    expect(parseProbe(probeOutput())).toEqual({ uid: 1001, gid: 0, capEff: [], capBnd: [], noNewPrivs: true, seccomp: "filter", rootfsReadOnly: true, tmpWritable: true, cwdWritable: false });
    expect(parseProbe(probeOutput({ root: "1123 1120 0:52 / / rw,relatime - overlay overlay rw" })).rootfsReadOnly).toBe(false);
    expect(parseProbe(probeOutput({ status: status(0, "0000000000000400") }))).toMatchObject({ uid: 0, capEff: ["NET_BIND_SERVICE"] });
  });

  it("a probe that printed something else, or read nothing, is an error and never a pass", () => {
    expect(() => parseProbe("OCI runtime exec failed")).toThrow(/printed something else/);
    expect(() => parseProbe(probeOutput({ status: "" }))).toThrow(/probe has no \w+ line: \/proc\/self\/status was unreadable/);
    expect(() => parseProbe(probeOutput({ root: "" }))).toThrow(/no root mount/);
  });

  it("the probe script is one self-contained node -e argument: no shell, no double quotes to escape, prints one JSON object", () => {
    expect(PROBE_SCRIPT).not.toContain('"');
    expect(PROBE_SCRIPT).toContain("/proc/self/status");
    expect(PROBE_SCRIPT).toContain("/proc/self/mountinfo");
    // Run for real on this machine's node (a local process, not Docker): one JSON object with the four fields, and on Linux one the parser accepts.
    const out = JSON.parse(execFileSync(process.execPath, ["-e", PROBE_SCRIPT], { encoding: "utf8" })) as Record<string, unknown>;
    expect(Object.keys(out).sort()).toEqual(["cwd", "root", "status", "tmp"]);
    if (process.platform === "linux") expect(parseProbe(JSON.stringify(out))).toMatchObject({ uid: process.getuid!(), tmpWritable: true });
  });

  it("read-only filesystem errors in the logs are counted by line", () => {
    const logs = ['{"level":"error","msg":"EROFS: read-only file system, open \'/app/.cache/x\'"}', "plain line", "Error: EROFS: read-only file system, mkdir '/var/x'"].join("\n");
    expect(countReadOnlyViolations(logs)).toBe(2);
    expect(countReadOnlyViolations('{"level":"info"}')).toBe(0);
  });

  it("docker inspect → declared posture; a writable VOLUME shows up as a writable path", () => {
    expect(declaredFromDockerInspect(dockerInspect)).toEqual({
      user: "",
      runAsNonRoot: null,
      privileged: false,
      readOnlyRootfs: true,
      capAdd: [],
      capDrop: ["ALL"],
      securityOpt: ["no-new-privileges:true"],
      writablePaths: ["/data", "/tmp"],
      resources: { memoryRequest: null, memoryLimit: null, cpuRequest: null, cpuLimit: null, pidsLimit: null }
    });
    const limited = declaredFromDockerInspect([{ Config: { User: "1001:0" }, HostConfig: { Memory: 402653184, MemoryReservation: 201326592, NanoCpus: 500_000_000, PidsLimit: 256, CapAdd: ["net_bind_service"] } }]);
    expect(limited).toMatchObject({ user: "1001:0", capAdd: ["NET_BIND_SERVICE"], resources: { memoryLimit: 402653184, memoryRequest: 201326592, cpuLimit: 500, pidsLimit: 256 } });
  });
});

describe("the harness stacks declare the posture the collector reads back", () => {
  const compose = parse(readFileSync(COMPOSE_FILE, "utf8"), { merge: true }) as { services: Record<string, Record<string, unknown>> };
  const kindPod = () => {
    const doc = manifestsFor("a", { name: "a", images: imagesFor("16.2.0", "tutors"), urls: sideSpec("a", imagesFor("16.2.0", "tutors")).urls }, "2026-09-16T09:05:00.000Z")
      .split(/^---$/m)
      .map((d) => parse(d) as Record<string, unknown>)
      .find((d) => d?.kind === "Deployment") as { spec: { template: unknown } };
    return doc.spec.template;
  };

  it("compose: a read-only root with a tmpfs /tmp is what every app service runs with, so the stack itself is the read-only boot probe", () => {
    for (const name of ["reader-a", "catalogue-b", "live-a", "reader-auth-b"]) {
      const s = compose.services[name]!;
      expect(s.read_only, name).toBe(true);
      expect(s.tmpfs, name).toEqual(["/tmp"]);
      expect(s.security_opt, name).toEqual(["no-new-privileges:true"]);
      expect(s.cap_drop, name).toEqual(["ALL"]);
      expect(s.user, `${name} does not pin a user: the image's own USER is what is measured`).toBeUndefined();
    }
  });

  it("kind: the pod spec parses to the same posture, so compose and kind sides read alike", () => {
    expect(declaredFromPod(kindPod())).toEqual({
      user: "",
      runAsNonRoot: true,
      privileged: false,
      readOnlyRootfs: true,
      capAdd: [],
      capDrop: ["ALL"],
      securityOpt: ["no-new-privileges:true", "seccomp=RuntimeDefault"],
      writablePaths: ["/tmp"],
      resources: { memoryRequest: 192 * 1024 * 1024, memoryLimit: 384 * 1024 * 1024, cpuRequest: 100, cpuLimit: null, pidsLimit: null }
    });
  });
});

describe("posture collection", () => {
  const composeAnswers = (app: string, id: string, over: Record<string, ExecResult> = {}): [string, ExecResult][] => [
    [`docker ps -q --filter label=com.docker.compose.project=tutors-harness --filter label=com.docker.compose.service=${app}-a`, ok(`${id}\n`)],
    [`docker inspect ${id}`, over.inspect ?? ok(JSON.stringify(dockerInspect))],
    [`docker exec ${id} node -e`, over.exec ?? ok(probeOutput())],
    [`docker logs ${id}`, over.logs ?? ok("", "")]
  ];

  it("compose: finds each container by its compose labels and runs exactly inspect, exec and logs", () => {
    const { exec, calls } = fakeExec(["reader", "catalogue", "live", "reader-auth"].flatMap((app, i) => composeAnswers(app, `c${i}`)));
    const capture = collectPosture(composeTarget("a", exec, names));
    expect(capture.substrate).toBe("compose");
    expect(Object.keys(capture.containers)).toEqual(["reader", "catalogue", "live", "reader-auth"]);
    expect(capture.containers.reader).toMatchObject({ user: "", effective: { uid: 1001 }, readOnlyViolations: 0, writablePaths: ["/data", "/tmp"] });
    expect(calls.filter((c) => c.startsWith("docker exec c0 node -e"))).toHaveLength(1);
    expect(calls.every((c) => c.startsWith("docker "))).toBe(true);
  });

  it("compose: an EROFS line in the logs is counted, stderr included", () => {
    const { exec } = fakeExec(["reader", "catalogue", "live", "reader-auth"].flatMap((app, i) => composeAnswers(app, `c${i}`, app === "live" ? { logs: ok("", "Error: EROFS: read-only file system, open '/app/x'\n") } : {})));
    expect((collectPosture(composeTarget("a", exec, names)).containers.live as { readOnlyViolations: number }).readOnlyViolations).toBe(1);
  });

  it("degrades loudly per container: no container, a failing exec, and a missing docker each say why and touch nothing else", () => {
    const { exec } = fakeExec([
      ["docker ps -q --filter label=com.docker.compose.project=tutors-harness --filter label=com.docker.compose.service=reader-a", ok("")],
      ...composeAnswers("catalogue", "c1", { exec: { status: 126, stdout: "", stderr: 'OCI runtime exec failed: exec: "node": executable file not found in $PATH\n' } }),
      ...composeAnswers("live", "c2"),
      ...composeAnswers("reader-auth", "c3", { inspect: { status: 1, stdout: "", stderr: "Error: No such object: c3\n" } })
    ]);
    const c = collectPosture(composeTarget("a", exec, names)).containers;
    expect(c.reader).toEqual({ collected: false, reason: "no running container for compose service reader-a in project tutors-harness" });
    expect(c.catalogue).toMatchObject({ collected: false, reason: expect.stringContaining('docker exec c1 exited 126: OCI runtime exec failed: exec: "node"') });
    expect(c.live).toMatchObject({ user: "" });
    expect(c["reader-auth"]).toEqual({ collected: false, reason: "docker inspect c3 exited 1: Error: No such object: c3" });

    const missing: Exec = () => ({ status: null, stdout: "", stderr: "", error: Object.assign(new Error("spawn docker ENOENT"), { code: "ENOENT" }) });
    expect((collectPosture(composeTarget("a", missing, names)).containers.reader as { reason: string }).reason).toBe("docker is not installed or not on PATH");
  });

  const pod = (name: string, extra: Record<string, unknown> = {}) => ({
    metadata: { name },
    status: { phase: "Running" },
    spec: { containers: [{ name: "app", securityContext: { readOnlyRootFilesystem: true, allowPrivilegeEscalation: false, capabilities: { drop: ["ALL"] } } }] },
    ...extra
  });

  it("kind: reads the live pod (not a terminating one), execs in its `app` container, and reads its logs", () => {
    const listing = JSON.stringify({ items: [{ ...pod("reader-old"), metadata: { name: "reader-old", deletionTimestamp: "2026-09-16T09:00:00Z" } }, pod("reader-abc")] });
    const { exec, calls } = fakeExec([
      ["kubectl --context kind-tutors-harness -n harness-b get pods -l app.kubernetes.io/name=tutors-", ok(listing)],
      ["kubectl --context kind-tutors-harness -n harness-b exec reader-abc -c app -- node -e", ok(probeOutput())],
      ["kubectl --context kind-tutors-harness -n harness-b logs reader-abc -c app", ok("", "")]
    ]);
    const capture = collectPosture(kindTarget("b", exec, names));
    expect(capture.substrate).toBe("kind");
    expect(Object.keys(capture.containers)).toEqual(["reader", "catalogue", "live"]);
    expect(capture.containers.reader).toMatchObject({ capDrop: ["ALL"], securityOpt: ["no-new-privileges:true"], effective: { uid: 1001 } });
    expect(calls.some((c) => c.includes("-c app -- node -e"))).toBe(true);
  });

  it("kind: no running pod is `not collected`, with the namespace named", () => {
    const { exec } = fakeExec([["kubectl", ok(JSON.stringify({ items: [] }))]]);
    expect((collectPosture(kindTarget("a", exec, names)).containers.live as { reason: string }).reason).toBe("no running pod for deployment live in namespace harness-a");
  });
});

// ---- startup --------------------------------------------------------------------------------------

/** A restarter that comes up `rootAt` and `readyAt` ms after `up`, on a fake clock that only sleep() advances. */
function fakeWorld(plan: { rootAt: number | null; readyAt: number | null; status?: number }[]) {
  let clock = 1000;
  let restart = -1;
  let upAt = 0;
  const events: string[] = [];
  const restarter: Restarter = {
    substrate: "compose",
    apps: ["reader"],
    rootUrl: () => "http://localhost:3100",
    prepare: (app) => void events.push(`prepare ${app}`),
    down: async (app) => void events.push(`down ${app}`),
    up: (app) => {
      restart += 1;
      upAt = clock;
      events.push(`up ${app}`);
    },
    isReady: () => plan[restart]!.readyAt !== null && clock - upAt >= plan[restart]!.readyAt!,
    restore: (app) => void events.push(`restore ${app}`)
  };
  return {
    restarter,
    events,
    now: () => clock,
    sleep: async (ms: number) => void (clock += ms),
    probe: async () => (plan[restart]!.rootAt !== null && clock - upAt >= plan[restart]!.rootAt! ? (plan[restart]!.status ?? 200) : null)
  };
}

describe("startup sampling", () => {
  it("times from the start command to the first healthy / and to ready, on the poll grid", async () => {
    const w = fakeWorld([{ rootAt: 1800, readyAt: 2100 }]);
    const sample = await sampleRestart("reader", { restarter: w.restarter, restarts: 1, probe: w.probe, now: w.now, sleep: w.sleep, pollMs: 100 });
    expect(sample).toEqual({ rootMs: 1800, rootStatus: 200, readyMs: 2100 });
    expect(w.events).toEqual(["down reader", "up reader"]);
  });

  it("a 404 or a redirect from / is up; a 500 or no answer is not", async () => {
    const w = fakeWorld([{ rootAt: 300, readyAt: 300, status: 404 }, { rootAt: 300, readyAt: 300, status: 302 }, { rootAt: 300, readyAt: 300, status: 503 }]);
    const deps = { restarter: w.restarter, restarts: 3, probe: w.probe, now: w.now, sleep: w.sleep, pollMs: 100, timeoutMs: 2000 };
    expect((await sampleRestart("reader", deps)).rootStatus).toBe(404);
    expect((await sampleRestart("reader", deps)).rootStatus).toBe(302);
    expect(await sampleRestart("reader", deps)).toEqual({ rootMs: null, rootStatus: null, readyMs: 300 });
  });

  it("gives up at the timeout with null samples, and never retries the restart", async () => {
    const w = fakeWorld([{ rootAt: null, readyAt: null }]);
    const sample = await sampleRestart("reader", { restarter: w.restarter, restarts: 1, probe: w.probe, now: w.now, sleep: w.sleep, pollMs: 100, timeoutMs: 1000 });
    expect(sample).toEqual({ rootMs: null, rootStatus: null, readyMs: null });
    expect(w.events.filter((e) => e === "up reader")).toHaveLength(1);
  });

  it("samples N restarts per app and always leaves the app running", async () => {
    const w = fakeWorld([1, 2, 3].map((i) => ({ rootAt: 1000 + i * 10, readyAt: 2000 })));
    const capture = await collectStartup({ restarter: w.restarter, restarts: 3, probe: w.probe, now: w.now, sleep: w.sleep, pollMs: 10 });
    expect(capture).toMatchObject({ collected: true, substrate: "compose", restarts: 3, timeoutMs: 60000 });
    expect((capture as unknown as { apps: { reader: { samples: unknown[] } } }).apps.reader.samples).toHaveLength(3);
    expect(w.events.at(-1)).toBe("restore reader");
  });

  it("an app that cannot be driven is `not collected` with the reason, and is still restored", async () => {
    const w = fakeWorld([{ rootAt: 0, readyAt: 0 }]);
    w.restarter.up = () => {
      throw new Error("docker start c1 exited 1: cannot start");
    };
    const capture = await collectStartup({ restarter: w.restarter, restarts: 2, probe: w.probe, now: w.now, sleep: w.sleep, pollMs: 10 });
    expect((capture as { apps: Record<string, unknown> }).apps.reader).toEqual({ collected: false, reason: "docker start c1 exited 1: cannot start" });
    expect(w.events).toContain("restore reader");
  });

  it("compose restarts stop and start the same container, and ask docker for its health", async () => {
    const health = ["starting", "starting", "healthy"];
    const { exec, calls } = fakeExec([
      ["docker ps -q", ok("abc123\n")],
      ["docker stop --time 3 abc123", ok()],
      ["docker start abc123", ok()],
      ["docker inspect --format", () => ok(`${health.shift() ?? "healthy"}\n`)]
    ]);
    const spec = sideSpec("b", imagesFor("16.2.0", "tutors"));
    const r = composeRestarter(spec, { exec, names, sleep: async () => {}, now: () => 0 });
    expect(r.rootUrl("live")).toBe("http://localhost:3202");
    r.prepare("live");
    await r.down("live");
    r.up("live");
    expect([r.isReady("live"), r.isReady("live"), r.isReady("live")]).toEqual([false, false, true]);
    expect(calls).toEqual([
      "docker ps -q --filter label=com.docker.compose.project=tutors-harness --filter label=com.docker.compose.service=live-b",
      "docker stop --time 3 abc123",
      "docker start abc123",
      "docker inspect --format {{if .State.Health}}{{.State.Health.Status}}{{end}} abc123",
      "docker inspect --format {{if .State.Health}}{{.State.Health.Status}}{{end}} abc123",
      "docker inspect --format {{if .State.Health}}{{.State.Health.Status}}{{end}} abc123"
    ]);
  });

  it("kind restarts scale to zero, wait for the old pod to be gone, and scale back: a rollout would let the old pod answer", async () => {
    const left = ["pod/reader-abc\n", "pod/reader-abc\n", ""];
    const { exec, calls } = fakeExec([
      ["kubectl --context kind-tutors-harness -n harness-a scale deployment/reader --replicas=0", ok()],
      ["kubectl --context kind-tutors-harness -n harness-a get pods -l app.kubernetes.io/name=tutors-reader -o name", () => ok(left.shift() ?? "")],
      ["kubectl --context kind-tutors-harness -n harness-a scale deployment/reader --replicas=1", ok()]
    ]);
    const spec = kindSide(sideSpec("a", imagesFor("16.2.0", "tutors")));
    let t = 0;
    const r = kindRestarter(spec, { exec, names, sleep: async (ms) => void (t += ms), now: () => t });
    expect(r.rootUrl("reader")).toBe("http://localhost:4100");
    await r.down("reader");
    r.up("reader");
    expect(calls.filter((c) => c.includes(" scale ")).map((c) => c.split(" ").at(-1))).toEqual(["--replicas=0", "--replicas=1"]);
    expect(calls.filter((c) => c.includes(" get pods ")).length).toBe(3);
    expect(t).toBe(500);
  });

  it("kind: an old pod that never goes away is reported, not waited on forever", async () => {
    const { exec } = fakeExec([
      ["kubectl --context kind-tutors-harness -n harness-a scale", ok()],
      ["kubectl --context kind-tutors-harness -n harness-a get pods", ok("pod/reader-abc\n")]
    ]);
    let t = 0;
    const r = kindRestarter(kindSide(sideSpec("a", imagesFor("16.2.0", "tutors"))), { exec, names, sleep: async (ms) => void (t += ms), now: () => t, downTimeoutMs: 1000 });
    await expect(r.down("reader")).rejects.toThrow("the old pod of reader was still there after 1s");
  });
});

// ---- the orchestrator ---------------------------------------------------------------------------------

describe("captureRuntime", () => {
  const deps = (exec: Exec): RuntimeDeps => ({ exec, probe: async () => null, now: () => 0, sleep: async () => {} });
  const spec = sideSpec("a", imagesFor("16.2.0", "tutors"));

  it("with both collectors off it runs nothing and says so, as information", async () => {
    const { exec, calls } = fakeExec([]);
    const r = await captureRuntime(spec, { substrate: "compose", posture: false, startupRestarts: 0, log: () => {} }, deps(exec));
    expect(calls).toEqual([]);
    expect(r.runtime).toEqual({ collected: false, disabled: true, reason: "switched off with --no-runtime" });
    expect(r.startup).toEqual({ collected: false, disabled: true, reason: "switched off with --startup-restarts 0" });
  });

  it("with docker missing it does not throw: each artefact says the tool is not installed", async () => {
    const missing: Exec = () => ({ status: null, stdout: "", stderr: "", error: Object.assign(new Error("spawn docker ENOENT"), { code: "ENOENT" }) });
    const r = await captureRuntime(spec, { substrate: "compose", posture: true, startupRestarts: 2, log: () => {} }, deps(missing));
    // Posture is collected per container, so the whole says collected and every app says why not.
    expect(Object.values((r.runtime as { containers: Record<string, { reason: string }> }).containers).map((c) => c.reason)).toEqual(Array(4).fill("docker is not installed or not on PATH"));
    expect(Object.values((r.startup as { apps: Record<string, { reason: string }> }).apps).map((c) => c.reason)).toEqual(Array(3).fill("docker is not installed or not on PATH"));
  });
});
